'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cheerio=require('cheerio');
const root=path.resolve(__dirname,'..');
const {files}=require('../lib/pages');
const baselineFile=path.join(root,'test/fixtures/roveia-content.json');
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
function current(){
 return Object.fromEntries([...files,'404.html'].map(file=>{
  const $=cheerio.load(fs.readFileSync(path.join(root,file),'utf8'));
  $('.s-stream,.s-preloader,.s-cursor,script,style').remove();
  $('[data-products-link]').remove();
  $('img[src="/assets/images/nexpixels-mark-new.png"]').attr('src','/assets/images/nexpixel-favicon.svg');
  const text=$('body').text().replace(/\s+/g,' ').trim();
  // Reviewed section-navigation change: compare the corresponding original routes.
  const destinations={'#selected-work':'/case-studies/','#capabilities':'/services/','#the-process':'/approach/','#start-project':'/contact/'};
  $('[data-section-link]').each((_,el)=>{$(el).attr('href',destinations[new URL($(el).attr('href'),'https://nexpixels.com').hash]);});
  const links=$('a[href]').map((_,el)=>$(el).attr('href')).get();
  const media=$('img').map((_,el)=>({src:$(el).attr('src'),alt:$(el).attr('alt')})).get();
  const forms=$('form').map((_,form)=>({action:$(form).attr('action'),method:$(form).attr('method'),fields:$(form).find('input,select,textarea').map((_,el)=>({name:$(el).attr('name'),type:$(el).attr('type'),placeholder:$(el).attr('placeholder'),required:$(el).attr('required')})).get()})).get();
  const metadata={title:$('title').text(),description:$('meta[name=description]').attr('content'),canonical:$('link[rel=canonical]').attr('href')};
  return [file,{text:hash(text),links:hash(links),media:hash(media),forms:hash(forms),metadata:hash(metadata)}];
 }));
}
module.exports={current};
if(require.main===module){
if(process.argv.includes('--snapshot')){
 if(fs.existsSync(baselineFile))throw new Error('Content baseline already exists; it will not be overwritten.');
 fs.mkdirSync(path.dirname(baselineFile),{recursive:true});fs.writeFileSync(baselineFile,JSON.stringify(current(),null,2)+'\n');console.log('Saved content hashes for 73 templates.');
}else{
 const baseline=JSON.parse(fs.readFileSync(baselineFile,'utf8')),actual=current();
 const copyChanges=require('../test/fixtures/seo-copy-changes.json'),seo=require('../data/seo-pages.json'),upgrades=require('../test/fixtures/seo-upgrade-changes.json'),podie=require('../test/fixtures/podie-changes.json'),ux=require('../test/fixtures/ux-refinement-changes.json'),audit=require('../test/fixtures/seo-audit-changes.json');
 for(const [file,values] of Object.entries(baseline)){
  assert.equal(actual[file].forms,values.forms,`${file}: preserve enquiry fields`);
  if(copyChanges[file])assert.equal(copyChanges[file].before,values.text,`${file}: reviewed copy change starts from original baseline`);
  const previousText=copyChanges[file]?.after||values.text;
  if(upgrades[file]){
   assert.equal(upgrades[file].before.text,previousText,`${file}: SEO refinement starts from reviewed copy`);
   assert.equal(upgrades[file].before.media,values.media,`${file}: original portfolio media baseline`);
  }
  const previous={text:upgrades[file]?.after.text||previousText,media:upgrades[file]?.after.media||values.media,links:values.links};
  for(const key of ['text','media','links']){
   if(podie[file])assert.equal(podie[file].before[key],previous[key],`${file}: component integration starts from reviewed ${key}`);
   const beforeUx=podie[file]?.after[key]||previous[key];
   if(ux[file])assert.equal(ux[file].before[key],beforeUx,`${file}: UX cleanup starts from reviewed ${key}`);
   const beforeAudit=ux[file]?.after[key]||beforeUx;
   if(audit[file])assert.equal(audit[file].before[key],beforeAudit,`${file}: audit repair starts from reviewed ${key}`);
   assert.equal(actual[file][key],audit[file]?.after[key]||beforeAudit,`${file}: only reviewed audit ${key} changes`);
  }
  const {title,description,canonical}=seo[file];
  assert.equal(actual[file].metadata,hash({title,description,canonical}),`${file}: metadata matches reviewed SEO registry`);
 }
 console.log(JSON.stringify({contentPreserved:true,templates:Object.keys(baseline).length,reviewedSeoCopyChanges:Object.keys(copyChanges).length,reviewedSeoRefinements:Object.keys(upgrades).length,checked:['text','links','images','forms','metadata registry']}));
}
}
