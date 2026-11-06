'use strict';
const fs=require('node:fs'),cheerio=require('cheerio');
function syncIslands(html){
 if(!html.includes('data-pd-island'))return html;
 const markup=JSON.parse(fs.readFileSync('release/podie/island-markup.json','utf8'));
 const $=cheerio.load(html,{sourceCodeLocationInfo:true}),edits=[];
 $('[data-pd-island]').each((_,node)=>{
  const name=$(node).attr('data-pd-island');if(!markup[name])throw new Error('Unknown PODIE island: '+name);
  const loc=node.sourceCodeLocation;
  edits.push({start:loc.startOffset,end:loc.endOffset,value:`<div id="podie-${name}" class="pd-island" data-pd-island="${name}">${markup[name]}</div>`});
 });
 for(const edit of edits.sort((a,b)=>b.start-a.start))html=html.slice(0,edit.start)+edit.value+html.slice(edit.end);
 html=html.replace(/<link rel="stylesheet" href="\/assets\/css\/podie.css">\s*/g,'');
 return html.replace('</head>','<link rel="stylesheet" href="/assets/css/podie.css">\n</head>');
}
module.exports={syncIslands};
