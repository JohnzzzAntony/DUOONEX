'use strict';
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp'),cheerio=require('cheerio');
const {files}=require('../lib/pages');
async function build(){
 const sources=new Set();
 for(const file of [...files,'404.html']){
  const $=cheerio.load(fs.readFileSync(file,'utf8'));
  $('img').each((_,el)=>{const src=$(el).attr('src');if(src?.startsWith('/assets/images/projects/')&&/\.(png|jpe?g)$/i.test(src))sources.add(src);});
 }
 const manifest={},directory='assets/images/projects/responsive';fs.mkdirSync(directory,{recursive:true});
 for(const src of sources){
  const filename='.'+src,meta=await sharp(filename).metadata(),stem=path.basename(src,path.extname(src));
  const widths=[...new Set([400,800,1200,1600].filter(width=>width<meta.width).concat(Math.min(meta.width,1600)))],variants=[];
  for(const width of widths)for(const format of ['avif','webp']){
   const target=directory+'/'+stem+'-'+width+'.'+format;
   const image=sharp(filename).rotate().resize({width,withoutEnlargement:true});
   const info=await(format==='avif'?image.avif({quality:55,effort:3}):image.webp({quality:84,effort:4})).toFile(target);
   variants.push({src:'/'+target,width:info.width,height:info.height,bytes:info.size,format});
  }
  manifest[src]={width:meta.width,height:meta.height,originalBytes:fs.statSync(filename).size,variants};
 }
 fs.writeFileSync('data/portfolio-images.json',JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify({originalScreenshots:sources.size,responsiveVariants:Object.values(manifest).reduce((sum,row)=>sum+row.variants.length,0),originalBytes:Object.values(manifest).reduce((sum,row)=>sum+row.originalBytes,0)}));
}
build().catch(error=>{console.error(error);process.exitCode=1;});
