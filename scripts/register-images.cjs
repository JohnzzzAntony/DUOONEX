'use strict';
const fs=require('node:fs');
const list=require('../data/public-media.json');
const names=new Set(list);
for(const file of ['../data/studio-images.json','../data/portfolio-images.json']){
 for(const image of Object.values(require(file))){
  for(const variant of image.variants)names.add(variant.src.replace('/assets/images/',''));
  if(image.social)names.add(image.social.replace('/assets/images/',''));
 }
}
if(names.size!==list.length)fs.writeFileSync(require.resolve('../data/public-media.json'),JSON.stringify([...names].sort(),null,2)+'\n');
