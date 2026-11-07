const cheerio=require('cheerio'),metadata=require('../data/seo-pages.json');
function structure(file,html){
 html=html.replace(/<nav\b[^>]*data-seo-breadcrumbs[^>]*>[\s\S]*?<\/nav>\s*/g,'').replace(/<script\b[^>]*data-seo-breadcrumb-schema[^>]*>[\s\S]*?<\/script>\s*/g,'');
 if(file==='index.html'||file==='404.html'||/noindex/.test(metadata[file].robots))return html;
 const dom=cheerio.load(html),parts=file.split('/'),items=[{name:'Home',url:'https://nexpixels.com/'}];
 const parents={services:'Services',blog:'Insights','case-studies':'Our work',locations:'Locations'};
 if(parts.length>2&&parents[parts[0]])items.push({name:parents[parts[0]],url:'https://nexpixels.com/'+parts[0]+'/'});
 items.push({name:dom('h1').text().replace(/\s+/g,' ').trim(),url:metadata[file].canonical});
 const escape=text=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
 const nav='<nav class="container n-breadcrumbs" data-seo-breadcrumbs aria-label="Breadcrumb"><ol>'+items.map((item,i)=>'<li>'+(i===items.length-1?'<span aria-current="page">'+escape(item.name)+'</span>':'<a href="'+new URL(item.url).pathname+'">'+escape(item.name)+'</a>')+'</li>').join('')+'</ol></nav>';
 html=html.replace(/(<main\b[^>]*>)/,'$1'+nav);
 const schema={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,item:item.url}))};
 return html.replace('</head>','<script data-seo-breadcrumb-schema type="application/ld+json">'+JSON.stringify(schema).replace(/</g,'\\u003c')+'</script></head>');
}module.exports={structure};
