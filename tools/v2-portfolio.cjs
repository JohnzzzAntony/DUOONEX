'use strict';
// Generates /work/, /products/ and every case-study page from data/projects.json,
// plus the homepage "Selected work" block. Run before v2-chrome.cjs, which fills the header/footer.
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const projects = require('../data/projects.json');
const ORIGIN = 'https://nexpixels.com';
const IMG = '/assets/images/projects/';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const arrow = '<span class="arw" aria-hidden="true">→</span>';
const section = p => p.type === 'work' ? 'work' : 'products';
const url = p => `/${section(p)}/${p.slug}/`;
const label = p => p.type === 'work' ? 'Client work' : 'NexPixels product';
const images = p => p.media.map((file, i) => ({file, alt: p.alt[i] || p.name})).filter(m => /\.webp$/.test(m.file));

function routeFor(pathname) {
  const slug = pathname.split('/')[2];
  const p = projects.find(x => x.slug === slug);
  return p ? url(p) : '/work/';
}

function picture(p, m, {eager = false, sizes = '(min-width: 1000px) 60vw, 100vw'} = {}) {
  const hi = m.file.replace(/\.webp$/, '@2x.webp');
  const srcset = fs.existsSync(path.join(ROOT, IMG, hi)) ? ` srcset="${IMG}${m.file} 1600w, ${IMG}${hi} 3200w" sizes="${sizes}"` : '';
  return `<img src="${IMG}${m.file}"${srcset} alt="${esc(m.alt)}" width="1600" height="1000" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function projectBlock(p, i, heading = 'h3') {
  const tags = [p.stack, ...p.tags.split('|')].filter((t, n, a) => t && a.indexOf(t) === n).join(' · ');
  return `<article class="v2-project reveal">
        <a class="v2-project__media" href="${url(p)}" tabindex="-1" aria-hidden="true">${picture(p, images(p)[0])}</a>
        <div class="v2-project__body">
          <p class="v2-project__label"><span aria-hidden="true">${String(i + 1).padStart(2, '0')}</span> ${label(p)} · ${esc(p.category)}</p>
          <${heading} class="v2-project__name">${esc(p.name)}</${heading}>
          <p class="v2-project__tags">${esc(tags)}</p>
          <p class="v2-project__summary">${esc(p.summary)}</p>
          <a class="btn btn--ghost" href="${url(p)}" data-event="case_study_click">${p.type === 'work' ? 'View case study' : 'View product'} ${arrow}<span class="sr-only">: ${esc(p.name)}</span></a>
        </div>
      </article>`;
}

function head({title, description, route, graph, image = '/assets/images/nexpixel-og-image.png'}) {
  const t = esc(title), d = esc(description), canonical = ORIGIN + route;
  return `<!DOCTYPE html><html lang="en-AE"><head>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PQJ2FVX5');</script>
<!-- End Google Tag Manager -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t}</title>
<meta name="description" content="${d}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css"><link rel="icon" href="/assets/images/nexpixel-favicon.svg" type="image/svg+xml"><link rel="icon" href="/assets/images/nexpixel-icon-32.png" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/assets/images/nexpixel-apple-touch-icon.png"><meta name="theme-color" content="#0B3B2C">
<script>document.documentElement.classList.add('js');</script>
<meta property="og:site_name" content="NexPixels">
<meta property="og:type" content="website">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<link rel="canonical" href="${canonical}"><meta property="og:url" content="${canonical}"><meta property="og:locale" content="en_AE"><meta property="og:image" content="${ORIGIN}${image}"><meta name="twitter:image" content="${ORIGIN}${image}">
<script type="application/ld+json">${JSON.stringify({'@context': 'https://schema.org', '@graph': graph}).replace(/</g, '\\u003c')}</script></head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PQJ2FVX5"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<header class="header"></header>
  <div class="drawer"><nav></nav>
  </div>
<main id="main">
`;
}

const foot = `</main>
<footer class="footer"></footer>
  <a class="wa-float" href="https://wa.me/971588102728" target="_blank" rel="noopener" aria-label="Chat with NexPixels on WhatsApp" data-wa-float><svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 7L3 29l6.4-2c2 1.1 4.3 1.7 6.6 1.7 7.2 0 13-5.7 13-12.8S23.2 3 16 3zm0 23.4c-2.1 0-4.1-.6-5.9-1.7l-.4-.3-3.8 1.2 1.2-3.7-.3-.4a10.4 10.4 0 0 1-1.7-5.7C5.1 10 10 5.2 16 5.2S26.9 10 26.9 15.9 22 26.4 16 26.4zm6-7.8c-.3-.2-1.9-1-2.2-1.1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.2 1.3 3.4c.2.2 2.3 3.5 5.6 4.9 2.1.9 2.9 1 4 .8.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.3z"/></svg></a>
<script src="/assets/js/main.js"></script>
</body></html>
`;

const org = {'@id': ORIGIN + '/#organization'};
const crumbs = items => ({'@type': 'BreadcrumbList', itemListElement: items.map(([name, route], i) => ({'@type': 'ListItem', position: i + 1, name, item: ORIGIN + route}))});
const crumbNav = items => `<nav class="crumbs" aria-label="Breadcrumb">${items.map(([name, route], i) => i === items.length - 1 ? `<span aria-current="page">${esc(name)}</span>` : `<a href="${route}">${esc(name)}</a> <span aria-hidden="true">/</span> `).join('')}</nav>`;

const cta = (title, text) => `<section class="section section--dark v2-cta">
    <div class="container v2-cta__inner">
      <h2 class="h2">${title}</h2>
      <p class="lede">${text}</p>
      <div class="v2-actions"><a class="btn btn--lime" href="/contact/" data-event="start_project_click">Start a project ${arrow}</a><a class="btn btn--ghost" href="/work/" data-event="view_work_click">View our work ${arrow}</a></div>
    </div>
  </section>`;

function webpSize(file) {
  const b = fs.readFileSync(file), i = b.indexOf('VP8'), t = b.toString('ascii', i, i + 4);
  if (t === 'VP8X') return [1 + b.readUIntLE(i + 12, 3), 1 + b.readUIntLE(i + 15, 3)];
  if (t === 'VP8 ') return [b.readUInt16LE(i + 14) & 0x3fff, b.readUInt16LE(i + 16) & 0x3fff];
  const v = b.readUInt32LE(i + 9);
  return [(v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1];
}

function screens(p) {
  const dir = path.join(ROOT, IMG, 'screens', p.slug);
  if (!fs.existsSync(dir)) return '';
  const shots = fs.readdirSync(dir).filter(f => f.endsWith('.webp')).sort();
  if (!shots.length) return '';
  return `<section class="section section--plain project-screens"><div class="container"><h2 class="h2">Every screen</h2><p>Desktop, tablet and mobile views captured from the build. Open any image to see it at full size.</p><details><summary>View all ${shots.length} screens</summary><div class="project-screens__grid">${shots.map(f => {
    const name = f.replace(/\.webp$/, '').replace(/-/g, ' ');
    const [w, h] = webpSize(path.join(dir, f));
    return `<figure><a href="${IMG}screens/${p.slug}/${f}" target="_blank" rel="noopener"><img src="${IMG}screens/${p.slug}/${f}" alt="${esc(p.name)} — ${name}" loading="lazy" decoding="async" width="${w}" height="${h}"></a><figcaption>${name}</figcaption></figure>`;
  }).join('')}</div></details></div></section>`;
}

function caseStudy(p) {
  const route = url(p), parent = section(p) === 'work' ? ['Work', '/work/'] : ['Products', '/products/'];
  const trail = [['Home', '/'], parent, [p.name, route]];
  const [hero, ...gallery] = images(p);
  const videos = p.media.filter(f => f.endsWith('.mp4'));
  const facts = [['Type', p.type === 'work' ? 'Client project' : 'NexPixels-owned product'], ['Category', p.category], ['Technology', p.stack]];
  if (p.url) facts.push(['Website', `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(new URL(p.url).hostname)}</a>`]);
  const others = projects.filter(x => x.slug !== p.slug).sort((a, b) => (a.type === p.type ? -1 : 0) - (b.type === p.type ? -1 : 0)).slice(0, 2);
  const title = `${p.name} — ${p.category} | ${p.type === 'work' ? 'Case Study' : 'Product'} | NexPixels`;
  return head({
    title, description: p.summary.slice(0, 158), route, image: IMG + hero.file,
    graph: [{'@type': 'WebPage', '@id': ORIGIN + route + '#webpage', url: ORIGIN + route, name: title, description: p.summary, inLanguage: 'en-AE', publisher: org}, crumbs(trail)]
  }) + `<section class="page-hero v2-cs-hero">
    <div class="container">
      ${crumbNav(trail)}
      <p class="eyebrow u-mt-22">/ ${label(p)}</p>
      <h1 class="display">${esc(p.name)} <span class="muted">${esc(p.category.toLowerCase())}</span></h1>
      <p class="lede">${esc(p.summary)}</p>
      <dl class="v2-facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${k === 'Website' ? v : esc(v)}</dd></div>`).join('')}</dl>
      <figure class="v2-cs-visual">${picture(p, hero, {eager: true, sizes: '100vw'})}</figure>
    </div>
  </section>
  <section class="section v2-cs">
    <div class="container v2-cs__grid">
      <div class="v2-cs__block reveal"><h2 class="h3">The brief</h2><p>${esc(p.overview)}</p></div>
      <div class="v2-cs__block reveal"><h2 class="h3">Approach</h2><ol class="v2-steps">${p.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>
      <div class="v2-cs__block reveal"><h2 class="h3">Experience</h2><p>${esc(p.journey)}</p><ul class="cs-bullets">${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul></div>
      <div class="v2-cs__block reveal"><h2 class="h3">Development</h2><p>${esc(p.engineering)}</p><p>${esc(p.detail)}</p></div>
      <div class="v2-cs__block reveal"><h2 class="h3">Scope and outcome</h2><p>${esc(p.delivery)}</p><p>${esc(p.next)}</p></div>
      <div class="v2-cs__block reveal"><h2 class="h3">Technology</h2><ul class="v2-chips">${[p.stack, ...p.tags.split('|')].filter((t, n, a) => a.indexOf(t) === n).map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
    </div>
  </section>
  <section class="section section--plain">
    <div class="container">
      <h2 class="h2">Screens <span class="muted">and interface</span></h2>
      <div class="v2-gallery">${gallery.map(m => `<figure>${picture(p, m, {sizes: '(min-width: 900px) 50vw, 100vw'})}<figcaption>${esc(m.alt)}</figcaption></figure>`).join('')}${videos.map(v => `<figure><video src="${IMG}${v}" controls muted playsinline preload="none" poster="${IMG}${hero.file}" width="1600" height="1000"></video><figcaption>${esc(p.alt[p.media.indexOf(v)] || p.name + ' film')}</figcaption></figure>`).join('')}</div>
    </div>
  </section>
  ${screens(p)}
  <section class="section">
    <div class="container">
      <h2 class="h2">More <span class="muted">projects</span></h2>
      <div class="v2-projects">${others.map((o, i) => projectBlock(o, i)).join('\n')}</div>
    </div>
  </section>
  ${cta('Have a similar <span class="muted">project?</span>', 'Share the goal, the users and the timeline. We will come back with a recommended scope.')}
` + foot;
}

function listing(kind) {
  const list = projects.filter(p => section(p) === kind);
  const work = kind === 'work';
  const route = `/${kind}/`, trail = [['Home', '/'], [work ? 'Work' : 'Products', route]];
  const title = work ? 'Work & Case Studies | Web, E-commerce & App Projects | NexPixels Dubai' : 'NexPixels Products | SaaS Platforms Built in Dubai';
  const description = work
    ? 'Client projects designed and built by NexPixels in Dubai: websites, e-commerce and business applications, with the brief, approach and delivery behind each one.'
    : 'Software products designed, built and owned by NexPixels: accounting, help desk, property, invitation and SSL monitoring platforms for UAE businesses.';
  return head({title, description, route, graph: [{'@type': 'CollectionPage', '@id': ORIGIN + route + '#webpage', url: ORIGIN + route, name: title, description, inLanguage: 'en-AE', publisher: org}, crumbs(trail)]}) + `<section class="page-hero">
    <div class="container">
      ${crumbNav(trail)}
      <p class="eyebrow u-mt-22">/ ${work ? 'Client work' : 'NexPixels products'}</p>
      <h1 class="display">${work ? 'Work that <span class="muted">shows the craft</span>' : 'Products we <span class="muted">design, build and run</span>'}</h1>
      <p class="lede">${work
        ? 'Websites, e-commerce and business applications delivered for clients. Each case study covers the brief, the approach, the build and the scope we delivered.'
        : 'These platforms are owned and developed by NexPixels. They are not client projects. They show how we design and engineer complete software products end to end.'}</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="v2-projects">${list.map((p, i) => projectBlock(p, i, 'h2')).join('\n')}</div>
      <p class="v2-crosslink">${work ? 'We also design and run our own software. <a href="/products/">Explore NexPixels products</a>.' : 'Looking for client projects? <a href="/work/">View our work</a>.'}</p>
    </div>
  </section>
  ${cta('Planning a <span class="muted">project?</span>', 'Tell us what you want to launch. We design and build websites, Shopify stores and digital products from Dubai.')}
` + foot;
}

function write(rel, html) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), {recursive: true});
  fs.writeFileSync(abs, html);
}

if (require.main === module) {
  for (const p of projects) write(url(p).slice(1) + 'index.html', caseStudy(p));
  write('work/index.html', listing('work'));
  write('products/index.html', listing('products'));
  // Homepage selected work: client work first, then products.
  const home = path.join(ROOT, 'index.html');
  const featured = [...projects].sort((a, b) => (a.type === 'work' ? -1 : 0) - (b.type === 'work' ? -1 : 0)).slice(0, 4);
  const html = fs.readFileSync(home, 'utf8').replace(/(<!-- v2:projects -->)[\s\S]*?(<!-- \/v2:projects -->)/, (_, a, b) => `${a}\n      ${featured.map((p, i) => projectBlock(p, i)).join('\n      ')}\n      ${b}`);
  fs.writeFileSync(home, html);
}
module.exports = {routeFor, projects, url};
