'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {clients,renameLegacySchema,schema,putMedia,saveMedia,contentTypes}=require('../lib/cloud');
const {files,documentFor}=require('../lib/pages');
const {HeadBucketCommand,GetObjectCommand}=require('@aws-sdk/client-s3');
async function main(){
  const bucket=process.env.S3_BUCKET;if(!bucket)throw new Error('Set S3_BUCKET before migrating');
  const {pool,s3}=clients({direct:true});let client;await renameLegacySchema(pool);
  try{
    await s3.send(new HeadBucketCommand({Bucket:bucket}));
    const publicMedia=require('../data/public-media.json');
    const runtime=path.resolve(process.env.CMS_DATA_DIR||'data/runtime');
    const local=fs.existsSync(path.join(runtime,'cms.json'))?JSON.parse(fs.readFileSync(path.join(runtime,'cms.json'),'utf8')):{pages:{},media:[],inquiries:[]};
    const uploads=local.media||[];
    const mediaSources=publicMedia.map(m=>({url:'/assets/images/'+m,file:path.resolve('assets/images',m)}));
    for(const item of uploads){if(!/^\/media\/[a-f0-9-]+\.(png|jpg|webp|gif)$/.test(item.url))throw new Error('Unexpected uploaded media path');mediaSources.push({url:item.url,file:path.join(runtime,'uploads',path.basename(item.url))});}
    const uploaded=[];
    for(let i=0;i<mediaSources.length;i+=4){await Promise.all(mediaSources.slice(i,i+4).map(async source=>{const bytes=fs.readFileSync(source.file);const item=await putMedia(s3,bucket,source.url,bytes,contentTypes[path.extname(source.file)]);const result=await s3.send(new GetObjectCommand({Bucket:bucket,Key:item.key}));const stored=await result.Body.transformToByteArray();if(crypto.createHash('sha256').update(stored).digest('hex')!==item.hash)throw new Error('Downloaded object checksum mismatch');uploaded.push(item);}));console.log('Uploaded and checksum-verified '+Math.min(i+4,mediaSources.length)+' / '+mediaSources.length+' media assets');}
    client=await pool.connect();await client.query('BEGIN');await client.query("SELECT pg_advisory_xact_lock(hashtext('nexpixels-site-migration'))");await client.query(schema);
    const defaults={pages:{},media:uploads,inquiries:local.inquiries||[]};
    for(const file of files){const html=fs.readFileSync(file,'utf8'),doc=documentFor(file);const existing=await client.query('SELECT fingerprint FROM nexpixels_site.pages WHERE file=$1',[file]);if(existing.rowCount&&existing.rows[0].fingerprint!==doc.fingerprint)throw new Error('Database content differs from source; migration stopped without overwriting edits');await client.query('INSERT INTO nexpixels_site.pages(file,html,title,fingerprint,fields) VALUES($1,$2,$3,$4,$5) ON CONFLICT(file) DO NOTHING',[file,html,doc.title,doc.fingerprint,JSON.stringify(doc.fields)]);defaults.pages[file]=local.pages?.[file]||{version:0,draft:{},published:{},history:[],fingerprint:doc.fingerprint,title:doc.title};}
    const settings={projects:require('../data/projects.json'),redirects:require('../data/project-redirects.json'),publicMedia,bucket,siteUrl:process.env.SITE_URL||'https://nexpixels.com',notFoundHtml:fs.readFileSync('404.html','utf8'),entity:fs.readFileSync('docs/entity.txt','utf8'),sitemap:fs.readFileSync('sitemap.xml','utf8'),robots:fs.readFileSync('robots.txt','utf8'),llms:fs.readFileSync('llms.txt','utf8')};
    for(const [key,value] of Object.entries(settings))await client.query('INSERT INTO nexpixels_site.settings(key,value) VALUES($1,$2) ON CONFLICT(key) DO NOTHING',[key,JSON.stringify(value)]);
    await client.query('INSERT INTO nexpixels_site.cms(id,state) VALUES(1,$1) ON CONFLICT(id) DO NOTHING',[JSON.stringify(defaults)]);
    for(const item of uploaded)await saveMedia(client,item);
    await client.query('COMMIT');
    const count=await pool.query('SELECT (SELECT count(*) FROM nexpixels_site.pages)::int AS pages,(SELECT count(*) FROM nexpixels_site.settings)::int AS settings,(SELECT count(*) FROM nexpixels_site.media)::int AS media');
    const report={completedAt:new Date().toISOString(),schema:'nexpixels_site',bucket,...count.rows[0],projects:settings.projects.length,checksumVerified:uploaded.length,bytes:uploaded.reduce((n,m)=>n+m.bytes,0),importedLocalInquiries:defaults.inquiries.length,importedLocalUploads:uploads.length,credentialsIncluded:false};
    fs.writeFileSync('docs/cloud-migration.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  }catch(e){if(client)await client.query('ROLLBACK').catch(()=>{});throw e;}finally{client?.release();await pool.end();s3.destroy();}
}
main().catch(e=>{console.error('Migration failed: '+(e.code||e.name)+' '+(/configuration|S3_BUCKET|differs|mismatch|verification|path/.test(e.message)?e.message:'Check service access and configuration.'));process.exitCode=1;});
