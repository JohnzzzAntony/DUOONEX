'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),cheerio=require('cheerio');
const {files}=require('../lib/pages');
const {indexable,route,redirects}=require('../lib/seo');
const registry=require('../data/seo-pages.json');
const titles=new Map(),descriptions=new Map(),canonicals=new Set();
let indexed=0;
assert.deepEqual(Object.keys(registry).sort(),[...files,'404.html'].sort(),'every public template has explicit metadata');
for(const file of [...files,'404.html']){
 const html=fs.readFileSync(file,'utf8'),$=cheerio.load(html),meta=registry[file];
 assert.equal($('title').length,1,file+': single title');assert.equal($('title').text(),meta.title);
 for(const selector of ['meta[name=description]','meta[name=robots]','link[rel=canonical]','meta[property="og:title"]','meta[property="og:description"]','meta[property="og:url"]','meta[property="og:image"]','meta[name="twitter:title"]','meta[name="twitter:description"]','meta[name="twitter:image"]'])assert.equal($(selector).length,1,file+': '+selector);
 assert(meta.title.length>10&&meta.title.length<=60,file+': concise descriptive title');
 assert(meta.description.length>=120&&meta.description.length<=160,file+': useful description within editorial length range');
 assert.equal($('meta[name=description]').attr('content'),meta.description);
 for(const property of ['og:title','twitter:title'])assert.equal($(`meta[property="${property}"],meta[name="${property}"]`).attr('content'),meta.title,file+': consistent social title');
 for(const property of ['og:description','twitter:description'])assert.equal($(`meta[property="${property}"],meta[name="${property}"]`).attr('content'),meta.description,file+': consistent social description');
 const graph=$('script[type="application/ld+json"]').toArray().flatMap(el=>{const item=JSON.parse($(el).text());return item['@graph']||[item];});
 const page=graph.find(item=>['WebPage','AboutPage','ContactPage','CollectionPage'].includes(item['@type']));
 assert(page,file+': WebPage structured data');assert.equal(page.name,meta.title);assert.equal(page.description,meta.description);assert.equal(page.url,meta.canonical);
 const faq=graph.find(item=>item['@type']==='FAQPage');
 if(faq&&$('.faq__item').length){
  const visible=$('.faq__item').map((_,el)=>({name:$(el).find('.faq__q>span').first().text().trim(),text:$(el).find('.faq__a p').map((_,p)=>$(p).text().trim()).get().join(' ')})).get();
  assert.deepEqual(faq.mainEntity.map(item=>({name:item.name,text:item.acceptedAnswer.text})),visible,file+': existing FAQ schema matches visible answers');
 }
 assert(!titles.has(meta.title),file+': duplicate title with '+titles.get(meta.title));titles.set(meta.title,file);
 assert(!descriptions.has(meta.description),file+': duplicate description with '+descriptions.get(meta.description));descriptions.set(meta.description,file);
 if(file!=='404.html'&&indexable(file,html)){
  indexed++;assert.equal(meta.canonical,'https://nexpixels.com'+route(file),file+': self canonical');
  assert(!canonicals.has(meta.canonical),file+': unique indexable canonical');canonicals.add(meta.canonical);
 }
}
assert.match(registry['404.html'].robots,/noindex/);
assert.match(registry['index.html'].title,/^Custom Web Development/);
assert(!/shopify/i.test(registry['index.html'].title+' '+registry['index.html'].description),'homepage search copy leads with custom development');
for(const [from,to] of Object.entries(redirects)){assert.notEqual(from,to);assert(fs.existsSync(to.slice(1)+'index.html')||to==='/',from+': redirect target exists');}
console.log(JSON.stringify({seo:'passed',templates:titles.size,indexablePages:indexed,uniqueTitles:titles.size,uniqueDescriptions:descriptions.size,socialMetadata:true,structuredData:true,redirects:Object.keys(redirects).length}));
