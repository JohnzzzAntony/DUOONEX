'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const cheerio=require('cheerio');
const {files}=require('../lib/pages');
const {redirects}=require('../lib/seo');
const root=path.resolve(__dirname,'..');
let links=0;
for(const file of [...files,'404.html']){
 const $=cheerio.load(fs.readFileSync(path.join(root,file),'utf8'));
 assert.equal($('h1').length,1,`${file}: exactly one h1`);
 assert.equal($('head script[src="https://www.googletagmanager.com/gtag/js?id=G-GX4YV1FRP5"]').length,1,`${file}: one Google tag loader`);
 assert.equal($('head script[data-nexpixels-google-tag]').length,1,`${file}: one Google tag configuration`);
 assert.equal($('head').children().first().attr('src'),'https://www.googletagmanager.com/gtag/js?id=G-GX4YV1FRP5',`${file}: Google tag at top of head`);
 assert.equal($('.s-header').length,1,`${file}: shared header`);
 assert.equal($('.s-footer').length,1,`${file}: shared footer`);
 assert.equal($('.s-mobile-nav').length,1,`${file}: shared mobile navigation`);
 assert.equal($('script[src="/assets/js/studio/app.js"]').length,1,`${file}: new interaction bundle`);
 assert.equal($('link[href="/assets/css/studio.css"]').length,1,`${file}: new stylesheet`);
 assert.equal($('link[href*="fonts.googleapis.com"]').length,0,`${file}: fonts self-hosted`);
 const ids=$('[id]').map((_,el)=>$(el).attr('id')).get();
 assert.equal(new Set(ids).size,ids.length,`${file}: unique ids`);
 $('.s-header a,.s-mobile-nav a,.s-footer a,.s-home a').each((_,el)=>{
  const href=$(el).attr('href');if(!href||!href.startsWith('/'))return;
  const url=new URL(href,'https://nexpixels.com');
  const target=url.pathname.replace(/^\//,'')+(url.pathname.endsWith('/')?'index.html':'');
  assert(fs.existsSync(path.join(root,target))||redirects[url.pathname],`${file}: ${href} resolves`);links++;
 });
}
const home=cheerio.load(fs.readFileSync(path.join(root,'index.html'),'utf8'));
assert.equal(home('.s-enquiry-form').attr('action'),'/api/inquiries');
assert.equal(home('input[type=range]').attr('aria-valuetext'),'AED 15,000 to 30,000 project budget');
assert.equal(home('img:not([alt])').length,0,'homepage image alternatives');
console.log(JSON.stringify({verified:true,templates:files.length+1,sharedLinks:links,duplicateIds:0,fonts:'self-hosted'}));
