'use strict';
const cheerio=require('cheerio');
const metadata=require('../data/seo-pages.json');

// Edit only the head: CMS fields, body copy and project media keep their source markup.
function syncSeo(file,html){
 const meta=metadata[file];if(!meta)throw new Error(`Missing SEO metadata: ${file}`);
 return html.replace(/<head>([\s\S]*?)<\/head>/,(_,head)=>{
  const $=cheerio.load('<html><head>'+head+'</head><body></body></html>');
  function tag(selector,markup,attribute,value){let node=$(selector).first();if(!node.length){$('head').append(markup);node=$(selector).first();}node.attr(attribute,value);$(selector).slice(1).remove();}
  $('title').text(meta.title);
  tag('meta[name=description]','<meta name="description">','content',meta.description);
  tag('link[rel=canonical]','<link rel="canonical">','href',meta.canonical);
  tag('meta[name=robots]','<meta name="robots">','content',meta.robots);
  for(const [property,value] of Object.entries({'og:title':meta.title,'og:description':meta.description,'og:url':meta.canonical,'og:site_name':'NexPixels','og:locale':'en_AE'}))tag(`meta[property="${property}"]`,`<meta property="${property}">`,'content',value);
  for(const [name,value] of Object.entries({'twitter:title':meta.title,'twitter:description':meta.description,'twitter:card':'summary_large_image'}))tag(`meta[name="${name}"]`,`<meta name="${name}">`,'content',value);
  if(!$('meta[property="og:image"]').length)tag('meta[property="og:image"]','<meta property="og:image">','content','https://nexpixels.com/assets/images/nexpixel-og-image.png');
  if(meta.image){
   tag('meta[property="og:image"]','<meta property="og:image">','content',meta.image);
   tag('meta[property="og:image:alt"]','<meta property="og:image:alt">','content',meta.imageAlt);
   tag('meta[property="og:image:width"]','<meta property="og:image:width">','content','1200');
   tag('meta[property="og:image:height"]','<meta property="og:image:height">','content','630');
   tag('meta[name="twitter:image:alt"]','<meta name="twitter:image:alt">','content',meta.imageAlt);
  }
  tag('meta[name="twitter:image"]','<meta name="twitter:image">','content',$('meta[property="og:image"]').attr('content'));
  const body=cheerio.load(html),faq=body('.faq__item').map((_,el)=>({'@type':'Question',name:body(el).find('.faq__q>span').first().text().trim(),acceptedAnswer:{'@type':'Answer',text:body(el).find('.faq__a p').map((_,p)=>body(p).text().trim()).get().join(' ')}})).get();
  let pageFound=false;
  $('script[type="application/ld+json"]').each((_,node)=>{
   const graph=JSON.parse($(node).text());
   for(const item of graph['@graph']||[graph]){
    if(['WebPage','AboutPage','ContactPage','CollectionPage'].includes(item['@type'])){Object.assign(item,{name:meta.title,description:meta.description,url:meta.canonical});if(meta.image)item.primaryImageOfPage={'@type':'ImageObject',url:meta.image,caption:meta.imageAlt};pageFound=true;}
    if(item['@type']==='FAQPage'&&faq.length)item.mainEntity=faq;
    if(item['@type']==='Article'||item['@type']==='BlogPosting'){if(meta.image)item.image=meta.image;item.author={'@type':'Organization',name:'NexPixels',url:'https://nexpixels.com/about/'};}
   }
   $(node).text(JSON.stringify(graph).replace(/</g,'\\u003c'));
  });
  if(!pageFound)$('head').append('<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@type':'WebPage',name:meta.title,description:meta.description,url:meta.canonical,inLanguage:'en-AE'}).replace(/</g,'\\u003c')+'</script>');
  return '<head>'+$('head').html()+'</head>';
 });
}
module.exports={syncSeo};
