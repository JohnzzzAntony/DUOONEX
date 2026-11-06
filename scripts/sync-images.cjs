'use strict';
const cheerio=require('cheerio');
const artwork=require('../data/studio-images.json');
const portfolio=require('../data/portfolio-images.json');
const escape=value=>String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
function sources(variants,sizes){return ['avif','webp'].map(format=>'<source type="image/'+format+'" srcset="'+variants.filter(v=>v.format===format).map(v=>v.src+' '+v.width+'w').join(', ')+'" sizes="'+escape(sizes)+'">').join('');}
function syncImages(html){
 const $=cheerio.load(html,{sourceCodeLocationInfo:true}),edits=[];
 $('[data-artwork],[data-generated-artwork]').each((_,el)=>{
  if(el.tagName==='img')return;
  const name=$(el).attr('data-artwork')||$(el).attr('data-generated-artwork'),image=artwork[name];if(!image)throw new Error('Unknown artwork: '+name);
  const hero=$(el).attr('data-artwork-priority')==='hero',sizes=$(el).attr('data-artwork-sizes')||'(max-width: 991px) calc(100vw - 64px), 580px';
  const fallback=image.variants.filter(v=>v.format==='webp').at(-1);
  const markup='<picture class="n-art-picture" data-generated-artwork="'+name+'" data-artwork-priority="'+(hero?'hero':'content')+'" data-artwork-sizes="'+escape(sizes)+'">'+sources(image.variants,sizes)+'<img src="'+fallback.src+'" alt="'+escape(image.alt)+'" width="'+fallback.width+'" height="'+fallback.height+'" loading="'+(hero?'eager':'lazy')+'" '+(hero?'fetchpriority="high"':'decoding="async"')+'></picture>';
  const loc=el.sourceCodeLocation;edits.push({start:loc.startOffset,end:loc.endOffset,markup});
 });
 $('img').each((_,el)=>{
  if($(el).closest('[data-generated-artwork]').length)return;
  const image=portfolio[$(el).attr('src')];if(!image)return;
  const sizes=$(el).closest('.s-project-image,.work__card,.cs-card').length?'(max-width: 991px) calc(100vw - 48px), 50vw':'(max-width: 991px) calc(100vw - 48px), 1180px';
  const firstSection=$('main>section').first()[0],isHero=$(el).parents().toArray().includes(firstSection);
  $(el).attr({width:image.width,height:image.height,loading:isHero?'eager':'lazy',decoding:'async'});
  if(isHero)$(el).attr('fetchpriority','high');else $(el).removeAttr('fetchpriority');
  const parent=$(el).parent(),target=parent.is('picture')?parent[0]:el,loc=target.sourceCodeLocation;
  const wrapper=parent.is('picture')?parent.clone().empty():$('<picture>');
  wrapper.addClass('n-portfolio-picture').attr('data-portfolio-responsive','').append(sources(image.variants,sizes)+$.html(el));
  edits.push({start:loc.startOffset,end:loc.endOffset,markup:$.html(wrapper)});
 });
 for(const edit of edits.sort((a,b)=>b.start-a.start))html=html.slice(0,edit.start)+edit.markup+html.slice(edit.end);
 return html;
}
module.exports={syncImages};
