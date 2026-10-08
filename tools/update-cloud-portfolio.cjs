'use strict';
// Explicit, backed-up release migration. --check is read-only.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {clients, putMedia, saveMedia, contentTypes} = require('../lib/cloud');
const {files, documentFor} = require('../lib/pages');
async function main() {
  const apply = process.argv.includes('--apply');
  const {pool, s3} = clients({direct:true});
  let client;
  try {
    const oldPages = (await pool.query('SELECT * FROM duoonex_site.pages')).rows;
    const oldSettings = Object.fromEntries((await pool.query('SELECT key,value FROM duoonex_site.settings')).rows.map(r => [r.key,r.value]));
    const cms = (await pool.query('SELECT state,revision FROM duoonex_site.cms WHERE id=1')).rows[0];
    const oldByFile = new Map(oldPages.map(p => [p.file,p]));
    const changed = files.map(file => ({file, html:fs.readFileSync(file,'utf8'), doc:documentFor(file)})).filter(p => oldByFile.get(p.file)?.fingerprint !== p.doc.fingerprint);
    const conflicts = changed.filter(p => {
      const record = cms.state.pages[p.file];
      return record && (Object.keys(record.draft || {}).length || Object.keys(record.published || {}).length);
    });
    const publicMedia = require('../data/public-media.json');
    const oldMedia = new Map((await pool.query('SELECT url,sha256 FROM duoonex_site.media')).rows.map(m => [m.url,m.sha256]));
    const media = publicMedia.map(name => {
      const file = path.join('assets/images',name);
      const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      return {file,url:'/assets/images/'+name,hash};
    }).filter(m => oldMedia.get(m.url) !== m.hash);
    console.log(JSON.stringify({mode:apply?'apply':'check',changedPages:changed.length,newOrChangedMedia:media.length,projects:require('../data/projects.json').length,cmsConflicts:conflicts.map(p=>p.file),preservedInquiries:cms.state.inquiries.length,preservedUploads:cms.state.media.length}));
    if(conflicts.length) throw new Error('CMS edits need reconciliation before changing their templates');
    if(!apply) return;
    const bucket = oldSettings.bucket;
    const uploaded = [];
    for(let i=0;i<media.length;i+=6) {
      await Promise.all(media.slice(i,i+6).map(async m => uploaded.push(await putMedia(s3,bucket,m.url,fs.readFileSync(m.file),contentTypes[path.extname(m.file)]))));
      console.log('Uploaded and verified '+Math.min(i+6,media.length)+' / '+media.length);
    }
    client = await pool.connect();
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('duoonex-site-migration'))");
    const current = (await client.query('SELECT state,revision FROM duoonex_site.cms WHERE id=1 FOR UPDATE')).rows[0];
    if(String(current.revision)!==String(cms.revision)) throw new Error('CMS changed during upload; retry migration');
    const latest = (await client.query('SELECT file,fingerprint FROM duoonex_site.pages FOR UPDATE')).rows;
    if(latest.length!==oldPages.length || latest.some(p=>oldByFile.get(p.file)?.fingerprint!==p.fingerprint)) throw new Error('Templates changed during upload; retry migration');
    await client.query('CREATE TABLE IF NOT EXISTS duoonex_site.release_backups (id text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(), snapshot jsonb NOT NULL)');
    const backupId = 'release-'+new Date().toISOString();
    await client.query(`INSERT INTO duoonex_site.release_backups(id,snapshot) SELECT $1,jsonb_build_object('pages',(SELECT jsonb_agg(to_jsonb(p)) FROM duoonex_site.pages p),'settings',(SELECT jsonb_agg(to_jsonb(s)) FROM duoonex_site.settings s),'cms',(SELECT to_jsonb(c) FROM duoonex_site.cms c WHERE id=1),'media',(SELECT jsonb_agg(to_jsonb(m)) FROM duoonex_site.media m))`,[backupId]);
    for(const p of changed) {
      await client.query('INSERT INTO duoonex_site.pages(file,html,title,fingerprint,fields) VALUES($1,$2,$3,$4,$5) ON CONFLICT(file) DO UPDATE SET html=excluded.html,title=excluded.title,fingerprint=excluded.fingerprint,fields=excluded.fields,updated_at=now()',[p.file,p.html,p.doc.title,p.doc.fingerprint,JSON.stringify(p.doc.fields)]);
      const record = current.state.pages[p.file];
      current.state.pages[p.file] = {...record, version:(record?.version||0)+1, draft:{},published:{},history:record?.history||[],fingerprint:p.doc.fingerprint,title:p.doc.title};
    }
    const settings = {projects:require('../data/projects.json'),redirects:require('../data/project-redirects.json'),publicMedia,sitemap:fs.readFileSync('sitemap.xml','utf8'),llms:fs.readFileSync('llms.txt','utf8'),notFoundHtml:fs.readFileSync('404.html','utf8'),entity:fs.readFileSync('docs/entity.txt','utf8')};
    for(const [key,value] of Object.entries(settings)) await client.query('INSERT INTO duoonex_site.settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=now()',[key,JSON.stringify(value)]);
    for(const item of uploaded) await saveMedia(client,item);
    await client.query('UPDATE duoonex_site.cms SET state=$1,revision=revision+1,updated_at=now() WHERE id=1',[JSON.stringify(current.state)]);
    await client.query('COMMIT');
    console.log(JSON.stringify({complete:true,backupId,pages:changed.length,media:uploaded.length,projects:settings.projects.length}));
  } catch(error) {
    if(client) await client.query('ROLLBACK').catch(()=>{});
    throw error;
  } finally {client?.release();await pool.end();s3.destroy();}
}
main().catch(error=>{console.error('Portfolio migration failed: '+(error.code||error.name)+(/CMS|Templates/.test(error.message)?' '+error.message:''));process.exitCode=1;});
