'use strict';
const fs=require('node:fs');
const path=require('node:path');
const cheerio=require('cheerio');
const {header,footer}=require('../frontend/chrome.cjs');
const root=path.resolve(__dirname,'..');
const {files}=require('../lib/pages');
const googleTag=`<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-GX4YV1FRP5"></script>
<script data-nexpixels-google-tag>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-GX4YV1FRP5');
</script>`;
for(const file of [...files,'404.html']){
 const target=path.join(root,file);
 let html=fs.readFileSync(target,'utf8');
 if(file==='index.html'){
  const $=cheerio.load(html);
  $('script[type="application/ld+json"]').each((_,node)=>{
   const data=JSON.parse($(node).text());
   if(data['@graph'])data['@graph']=data['@graph'].filter(item=>item['@type']!=='FAQPage');
   $(node).text(JSON.stringify(data));
  });
  const head=$('head').html();
  const lightPaths=Array.from({length:54},(_,index)=>{
   const offset=(index-27)*1.3;
   return `<path d="M-100 ${870+offset}C310 ${850+offset} 525 ${810+offset} 705 ${365+offset}S1040 ${470+offset} 1550 ${150+offset}" stroke="${index%7===0?'#00f076':'#c6f24e'}" stroke-opacity="${index%3===0?'.32':'.13'}" stroke-width=".7"/>`;
  }).join('');
  const lightFallback=`<svg viewBox="0 0 1440 900" preserveAspectRatio="none" fill="none" aria-hidden="true">${lightPaths}</svg>`;
  const main=fs.readFileSync(path.join(root,'frontend/home.html'),'utf8').replace('<div class="s-stream-fallback"></div>',`<div class="s-stream-fallback">${lightFallback}</div>`);
  html=`<!DOCTYPE html>\n<html lang="en-AE">\n<head>${head}</head>\n<body class="studio-home"><a class="skip-link" href="#main">Skip to content</a>\n${header}\n${main}\n${footer}\n</body>\n</html>\n`;
 }else{
  const $=cheerio.load(html,{sourceCodeLocationInfo:true});
  const edits=[];
  $('.header,.s-header,.drawer,.s-mobile-nav,.footer,.s-footer,[data-wa-float]').each((_,node)=>{
   const loc=node.sourceCodeLocation;
   if(!loc)return;
   let replacement='';
   if($(node).is('.header,.s-header'))replacement=header;
   if($(node).is('.footer,.s-footer'))replacement=footer;
   edits.push({start:loc.startOffset,end:loc.endOffset,replacement});
  });
  const outer=edits.filter(edit=>!edits.some(parent=>parent!==edit&&parent.start<=edit.start&&parent.end>=edit.end));
  for(const edit of outer.sort((a,b)=>b.start-a.start))html=html.slice(0,edit.start)+edit.replacement+html.slice(edit.end);
 }
 html=html.replace(/<link\b[^>]*(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>\s*/g,'');
 html=html.replace(/<link\b[^>]*rel=["'](?:icon|apple-touch-icon)["'][^>]*>\s*/g,'');
 html=html.replace('</head>','<link rel="icon" type="image/png" href="/assets/images/nexpixels-mark-new.png"><link rel="apple-touch-icon" href="/assets/images/nexpixels-mark-new.png">\n</head>');
 html=html.replace(/<link\b[^>]*href=["'][^"']*studio\.css[^"']*["'][^>]*>\s*/g,'');
 html=html.replace(/<link\b[^>]*rel=["']preload["'][^>]*data-studio-font[^>]*>\s*/g,'');
 html=html.replace(/<script\b[^>]*src=["'][^"']*\/studio\/app\.js[^"']*["'][^>]*><\/script>\s*/g,'');
 html=html.replace(/(<meta\s+name="theme-color"\s+content=")[^"]+/, '$1#ffffff');
 html=html.replace(/<body([^>]*)>/,(_,attrs)=>{
  if(/class="([^"]*)"/.test(attrs))attrs=attrs.replace(/class="([^"]*)"/,(_,classes)=>`class="${classes.split(/\s+/).filter(c=>c!=='roveia-theme').join(' ')} roveia-theme"`);
  else attrs+=' class="roveia-theme"';
  return `<body${attrs}>`;
 });
 html=html.replace(/<script data-studio-transitions>[\s\S]*?<\/script>\s*/g,'');
 html=html.replace('</head>','<link rel="preload" as="font" href="/assets/css/fonts/manrope-latin-wght-normal.woff2" type="font/woff2" crossorigin data-studio-font>\n<link rel="stylesheet" href="/assets/css/studio.css">\n</head>');
 html=html.replace('</body>','<script type="module" src="/assets/js/studio/app.js"></script>\n</body>');
 if(file==='index.html')html=html.replace(/<link\b[^>]*href="(?:\/)?assets\/css\/style.css"[^>]*>\s*/,'');
 html=require('./sync-seo.cjs').syncSeo(file,html);
 html=require('./sync-islands.cjs').syncIslands(html);
 html=require('./sync-images.cjs').syncImages(html);
 html=html.replace(/<!-- Google tag \(gtag\.js\) -->\s*/g,'')
  .replace(/<script\b[^>]*src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-GX4YV1FRP5"[^>]*><\/script>\s*/g,'')
  .replace(/<script\b[^>]*data-nexpixels-google-tag[^>]*>[\s\S]*?<\/script>\s*/g,'');
 html=html.replace(/<head>/i,'<head>\n'+googleTag+'\n');
 html=html.replace(/[\t ]+$/gm,'');
 if(html!==fs.readFileSync(target,'utf8'))fs.writeFileSync(target,html);
}
console.log(`Updated studio layout across ${files.length+1} public templates.`);
