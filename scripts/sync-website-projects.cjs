'use strict';
const {ecommerce,products}=require('../data/website-projects.json');
const escape=value=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function card(project,employee){
 const title=escape(project.title),href=escape(project.href);
 return `<article class="np-commerce-card"><a class="np-commerce-preview" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${title} website"><img src="${project.image}" alt="${title} live website screenshot" width="1200" height="833" loading="lazy" decoding="async"></a><div class="np-commerce-copy"><span class="np-commerce-category">${escape(project.category)}</span><h3>${title}</h3>${employee?'':`<p>${escape(project.description)}</p>`}<span class="np-commerce-credit">${employee?'Design · development · launch / employment work':'Live product demo'}</span><a class="np-commerce-link" href="${href}" target="_blank" rel="noopener noreferrer"><span>${new URL(project.href).hostname}</span><span aria-hidden="true">↗</span></a></div></article>`;
}
function commerce(){
 return `<section id="ecommerce-experience" class="s-container np-commerce" aria-labelledby="commerce-title" data-website-projects="commerce"><div class="np-commerce-heading"><div><span class="np-commerce-kicker">Selected employment work / e-commerce</span><h2 id="commerce-title">Stores with<br><em>their own story.</em></h2></div><p>Designed, built and shipped complete e-commerce platforms as an employee.</p></div><p class="np-commerce-note">Professional experience gained during employment at another company. Brands and website assets belong to their respective owners.</p><div class="np-commerce-grid">${ecommerce.map(project=>card(project,true)).join('')}</div><p class="np-commerce-services">Planning your own store? Explore our <a href="/services/ecommerce-development/">e-commerce development</a> and <a href="/services/shopify-development/">Shopify development</a> services in Dubai.</p></section>`;
}
function demos(){
 return `<section class="s-container np-live-products" aria-labelledby="live-products-title" data-website-projects="products"><h2 id="live-products-title">Explore the live demos</h2><div class="np-demo-grid">${products.map(project=>card(project,false)).join('')}</div></section>`;
}
function syncWebsiteProjects(file,html){
 if(!['index.html','products/index.html','case-studies/index.html'].includes(file))return html;
 html=html.replace(/<section\b[^>]*data-website-projects="(?:commerce|products)"[^>]*>[\s\S]*?<\/section>/g,'');
 if(file==='index.html')return html;
 const sections=(file==='products/index.html'?demos():'')+commerce();
 return html.replace('</main>',sections+'</main>');
}
module.exports={syncWebsiteProjects};
