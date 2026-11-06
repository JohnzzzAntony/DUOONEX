'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cheerio=require('cheerio'),sharp=require('sharp');
const {files}=require('../lib/pages');
const allowlist=new Set(require('../data/public-media.json'));
async function verify(){
 let images=0,artworks=0;const assets=new Set();
 for(const file of [...files,'404.html']){
  const $=cheerio.load(fs.readFileSync(file,'utf8'));
  $('img').each((_,el)=>{
   images++;assert($(el).attr('alt')!==undefined,file+': image has alt attribute');
   assert(Number($(el).attr('width'))>0&&Number($(el).attr('height'))>0,file+': image reserves dimensions: '+$(el).attr('src'));
   assets.add(new URL($(el).attr('src'),'https://nexpixels.com/'+file).pathname);
  });
  $('source[srcset]').each((_,el)=>$(el).attr('srcset').split(',').forEach(value=>assets.add(new URL(value.trim().split(/\s+/)[0],'https://nexpixels.com/'+file).pathname)));
  $('[data-generated-artwork]').each((_,el)=>{
   artworks++;assert.equal($(el).find('source[type="image/avif"]').length,1);assert.equal($(el).find('source[type="image/webp"]').length,1);
   const img=$(el).find('img');assert(img.attr('alt').length>=10&&img.attr('alt').length<=125);
   if($(el).attr('data-artwork-priority')==='hero'){assert.equal(img.attr('loading'),'eager');assert.equal(img.attr('fetchpriority'),'high');}else{assert.equal(img.attr('loading'),'lazy');assert.equal(img.attr('decoding'),'async');}
  });
 }
 for(const src of assets){
  assert(src.startsWith('/assets/images/'),'local image route: '+src);assert(allowlist.has(src.slice('/assets/images/'.length)),'asset registered: '+src);assert(fs.existsSync('.'+src),'asset exists: '+src);
 }
 for(const manifest of [require('../data/studio-images.json'),require('../data/portfolio-images.json')])for(const image of Object.values(manifest))for(const variant of image.variants){
  const meta=await sharp('.'+variant.src).metadata();assert.equal(meta.width,variant.width);assert.equal(meta.height,variant.height);
 }
 for(const meta of Object.values(require('../data/seo-pages.json')))if(meta.image){
  const url=new URL(meta.image),image=await sharp('.'+url.pathname).metadata();assert.equal(image.width,1200);assert.equal(image.height,630);assert(allowlist.has(url.pathname.slice('/assets/images/'.length)));
 }
 console.log(JSON.stringify({imageSeo:'passed',imageElements:images,artworkPlacements:artworks,uniqueImageAssets:assets.size,reservedDimensions:true,registered:true,responsiveFormats:['AVIF','WebP']}));
}
verify().catch(error=>{console.error(error);process.exitCode=1;});
