'use strict';
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..');
const names=['custom-web-development','interface-design','connected-applications'];
const descriptions={'custom-web-development':'Glass browser panels wrapped in a green ribbon, illustrating custom web development','interface-design':'Frosted glass interface panels with a green accent, illustrating responsive UI design','connected-applications':'Graphite modules joined by green glass channels, illustrating connected business applications'};
async function build(){
 const output=path.join(root,'assets/images/studio');fs.mkdirSync(output,{recursive:true});
 const manifest={};
 for(const name of names){
  const source=path.join(root,'design-assets/generated',name+'.png'),meta=await sharp(source).metadata();
  const variants=[];
  for(const width of [480,800,1200,1600].filter(width=>width<=meta.width)){
   for(const format of ['avif','webp']){
    const filename=name+'-'+width+'.'+format;
    const image=sharp(source).rotate().resize({width,withoutEnlargement:true});
    const info=await (format==='avif'?image.avif({quality:48,effort:5}):image.webp({quality:78,effort:5})).toFile(path.join(output,filename));
    variants.push({src:'/assets/images/studio/'+filename,width:info.width,height:info.height,bytes:info.size,format});
   }
  }
  const social='/assets/images/studio/'+name+'-social.jpg';
  await sharp(source).resize(1200,630,{fit:'cover'}).jpeg({quality:82,mozjpeg:true}).toFile(path.join(root,'.'+social));
  manifest[name]={source:'design-assets/generated/'+name+'.png',alt:descriptions[name],social,width:meta.width,height:meta.height,variants};
 }
 fs.writeFileSync(path.join(root,'data/studio-images.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify({images:names.length,variants:Object.values(manifest).reduce((n,image)=>n+image.variants.length,0),largestWebImageBytes:Math.max(...Object.values(manifest).flatMap(image=>image.variants.map(v=>v.bytes)))}));
}
build().catch(error=>{console.error(error);process.exitCode=1;});
