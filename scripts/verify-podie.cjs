'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cheerio=require('cheerio');
const hash=value=>crypto.createHash('sha256').update(value.replace(/\r\n/g,'\n')).digest('hex');
const provenance=require('../data/podie-components.json');let originals=0;
for(const record of Object.values(provenance)){
 for(const item of [...record.originals,record.license]){assert.equal(hash(fs.readFileSync(item.path,'utf8')),item.sha256,item.path+': original distribution preserved');originals++;}
 assert(fs.readFileSync('assets/js/studio/LICENSES.txt','utf8').includes(fs.readFileSync(record.license.path,'utf8').trim()),'full license notice distributed');
}
let roots=0;
for(const file of ['index.html','services/index.html','services/react-nextjs-development/index.html','approach/index.html','startups/index.html']){
 const $=cheerio.load(fs.readFileSync(file,'utf8'));
 assert.equal($('link[href="/assets/css/podie.css"]').length,1,file+': component stylesheet');
 $('[data-pd-island]').each((_,el)=>{
  roots++;const root=$(el),name=root.attr('data-pd-island');
  assert(root.find('.pd-component').length>0,file+': server-rendered original component');
  if(name==='circuit')assert(root.find('svg[role=img]').find('*').toArray().some(node=>node.tagName?.toLowerCase()==='animatetransform'),'original animated SVG traces');
  if(name==='how')assert.equal(root.find('[data-how-card]').length,4,'four real delivery stages');
  if(name==='projects'||name==='delivery')assert.equal(root.find('[data-process-card]').length,name==='projects'?3:4,'original card reveal markup');
 });
}
for(const file of [...require('../lib/pages').files,'404.html']){
 const $=cheerio.load(fs.readFileSync(file,'utf8'));
 assert.deepEqual($('.s-desktop-nav a').map((_,el)=>$(el).attr('href')).get(),['/products/','/case-studies/','/services/','/approach/','/about/'],file+': native page destinations');
 assert.equal($('.s-header-actions>.s-button-small').attr('href'),'/contact/');
}
console.log(JSON.stringify({podie:'passed',originalDistributions:originals,islands:roots,components:3,nativeNavigation:true,licenses:true}));
