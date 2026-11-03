'use strict';
// Applies the shared V2 header, mega menu, mobile drawer and footer to every public page,
// rewrites legacy /case-studies/ links, standardises the font request and fixes marquee a11y.
// Re-run after editing the partials below: node tools/v2-chrome.cjs
const fs = require('node:fs');
const path = require('node:path');
const {ROOT, files} = require('../lib/pages');
const {routeFor} = require('./v2-portfolio.cjs');

const caret = '<svg class="nav__caret" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.5L8 10l4-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const arrow = '<span class="arw" aria-hidden="true">→</span>';
const groups = [
  ['Design', [['UI/UX Design', '/services/ui-ux-design/'], ['E-commerce UX', '/services/mobile-ecommerce-ux/'], ['Product Design', '/services/saas-design/'], ['Design Systems', '/services/design-systems/']]],
  ['Development', [['Web Development', '/services/custom-web-development/'], ['Shopify', '/services/shopify-development/'], ['WordPress', '/services/wordpress-development/'], ['Next.js', '/services/react-nextjs-development/'], ['Web Applications', '/services/web-app-mvp-development/']]],
  ['Digital Products', [['MVP Development', '/services/mvp-development/'], ['SaaS Product Design', '/services/saas-design/'], ['Business Applications', '/services/web-app-mvp-development/'], ['AI / Automation', '/services/python-ai-workflows/']]],
  ['Growth', [['Conversion Optimisation', '/services/conversion-rate-optimization/'], ['Website Audit', '/services/ux-audit/'], ['Website Strategy', '/services/website-strategy/'], ['QA &amp; Launch Testing', '/services/qa-launch-testing/']]]
];
const primary = [['Work', '/work/'], ['Services', '/services/'], ['Products', '/products/'], ['About', '/about/'], ['Insights', '/blog/']];
const WA = 'https://wa.me/971588102728?text=' + encodeURIComponent('Hi NexPixels, I\'d like to discuss a website or digital project.');

function header(route) {
  const current = href => route.startsWith(href) ? ' aria-current="page"' : '';
  const links = primary.map(([label, href]) => label === 'Services'
    ? `<a class="nav__link" href="${href}" data-mega-trigger aria-expanded="false" aria-haspopup="true"${current(href)}>${label} ${caret}</a>`
    : `<a class="nav__link" href="${href}"${current(href)}>${label}</a>`).join('\n        ');
  const cols = groups.map(([title, items], i) => `<div class="mega__col">
            <div class="mega__n" aria-hidden="true">0${i + 1}</div>
            <div class="mega__title">${title}</div>
            ${items.map(([l, h]) => `<a href="${h}">${l}</a>`).join('')}
          </div>`).join('\n          ');
  const drawerGroups = groups.map(([title, items]) => `<p class="drawer__label">${title}</p>${items.map(([l, h]) => `<a href="${h}">${l}</a>`).join('')}`).join('');
  return `<header class="header">
    <div class="container header__inner">
      <a class="logo" href="/" aria-label="NexPixels home"><img class="logo__img" src="/assets/images/nexpixels-logo.svg" alt="NexPixels" width="168" height="34"></a>
      <nav class="nav" aria-label="Primary">
        ${links}
      </nav>
      <div class="header__cta">
        <a class="btn btn--indigo" href="/contact/" data-event="start_project_click">Start a project ${arrow}</a>
        <button class="burger" data-burger aria-controls="site-drawer" type="button" aria-label="Menu" aria-expanded="false"><span></span></button>
      </div>
    </div>
    <div class="mega" data-mega>
      <div class="container">
        <div class="mega__grid">
          ${cols}
          <div class="mega__cta">
            <strong>Not sure what you need?</strong>
            <p>Tell us about the business goal. We will recommend the right platform and scope.</p>
            <a class="btn btn--light btn--sm" href="/contact/" data-event="start_project_click">Start a project ${arrow}</a>
          </div>
        </div>
      </div>
    </div>
  </header>
  <div class="drawer" data-drawer id="site-drawer" role="dialog" aria-modal="true" aria-label="Site menu">
    <nav aria-label="Mobile">
      ${primary.map(([l, h]) => `<a href="${h}">${l}</a>`).join('')}<a href="/contact/" data-event="start_project_click">Start a project</a>
      <div class="drawer__sub u-mt-20">${drawerGroups}</div>
    </nav>
  </div>`;
}

const footer = `<footer class="footer">
      <div class="container">
        <div class="footer__top">
          <div>
            <a class="logo" href="/" aria-label="NexPixels home"><img class="logo__img" src="/assets/images/nexpixels-logo-light.svg" alt="NexPixels" width="168" height="34" loading="lazy"></a>
            <p class="footer__tagline">Designing what’s next.</p>
            <p class="footer__blurb">Based in Dubai, UAE. Building websites, Shopify stores and digital products for businesses across the UAE, GCC and internationally.</p>
            <a class="btn btn--lime btn--sm" href="/contact/" data-event="start_project_click">Start a project ${arrow}</a>
          </div>
          <div class="footer__col"><h2>NexPixels</h2><a href="/about/">About</a><a href="/work/">Work</a><a href="/products/">Products</a><a href="/blog/">Insights</a><a href="/approach/">Approach</a><a href="/pricing/">Pricing</a><a href="/faqs/">FAQs</a></div>
          <div class="footer__col"><h2>Services</h2><a href="/services/ecommerce-development/">E-commerce</a><a href="/services/custom-web-development/">Web Development</a><a href="/services/ui-ux-design/">UI/UX</a><a href="/services/mvp-development/">Digital Products</a><a href="/services/">All services</a></div>
          <div class="footer__col"><h2>Contact</h2><span class="footer__place">Dubai, UAE</span><a href="mailto:info@nexpixels.com">info@nexpixels.com</a><a href="${WA}" target="_blank" rel="noopener">WhatsApp</a><a href="tel:+971588102728">+971 58 810 2728</a></div>
        </div>
        <div class="footer__legal">
          <span>NexPixels © 2026</span>
          <span><a href="/privacy-policy/">Privacy Policy</a> · <a href="/terms-conditions/">Terms &amp; Conditions</a></span>
          <span>Based in Dubai, United Arab Emirates. Serving the UAE, GCC and international clients.</span>
        </div>
      </div>
    </footer>`;

const waFloat = `<a class="wa-float" href="${WA}" target="_blank" rel="noopener" aria-label="Chat with NexPixels on WhatsApp" data-wa-float>`;
const fonts = '<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">';

function marquee(html) {
  return html.replace(/(<div class="marquee-item-wrapper[^"]*">)([\s\S]*?)(<div class="left-shadow")/g, (all, open, rows, tail) => {
    if (rows.includes('class="sr-only"')) return all;
    const labels = [...new Set([...rows.matchAll(/aria-label="([^"]+)"/g)].map(m => m[1]))];
    const hidden = rows.replace(/<div class="(marquee-(?:one|two|three))"/g, '<div class="$1" aria-hidden="true"').replace(/ role="img" aria-label="[^"]+"/g, '');
    return open + `<ul class="sr-only">${labels.map(l => `<li>${l}</li>`).join('')}</ul>` + hidden + tail;
  });
}

// Global CTA system: buttons to /contact/ say "Start a project", buttons to /work/ say "View our work".
// Quote and estimate requests keep their contextual label.
function ctas(html) {
  return html.replace(/<a class="(btn[^"]*)" href="(\/contact\/|\/work\/)"([^>]*)>([^<]*)</g, (all, cls, href, rest, text) => {
    if (/quote|estimate/i.test(text)) return all;
    const work = href === '/work/';
    const event = rest.includes('data-event') ? '' : ` data-event="${work ? 'view_work_click' : 'start_project_click'}"`;
    return `<a class="${cls}" href="${href}"${rest}${event}>${work ? 'View our work' : 'Start a project'} <`;
  });
}

function apply(file, html) {
  const route = '/' + file.replace(/index\.html$/, '');
  const replaced = [];
  const swap = (re, value, name) => { if (re.test(html)) { html = html.replace(re, value); replaced.push(name); } };
  swap(/<header class="header">[\s\S]*?<\/header>\s*<div class="drawer"[\s\S]*?<\/nav>\s*<\/div>/, header(route), 'header');
  swap(/<footer class="footer">[\s\S]*?<\/footer>/, footer, 'footer');
  swap(/<a class="wa-float" href="[^"]*"[^>]*>/, waFloat, 'whatsapp');
  html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*" rel="stylesheet">/, fonts);
  html = html.replace(/href="([^"]*case-studies\/[^"]*)"/g, (all, href) => {
    const url = new URL(href, 'https://nexpixels.com' + route);
    if (url.origin !== 'https://nexpixels.com' || !url.pathname.startsWith('/case-studies/')) return all;
    return `href="${href.startsWith('http') ? url.origin : ''}${routeFor(url.pathname)}${url.hash}"`;
  });
  html = marquee(html);
  html = ctas(html);
  return {html, replaced};
}

if (require.main === module) {
  for (const file of files) {
    const abs = path.join(ROOT, file);
    const before = fs.readFileSync(abs, 'utf8');
    const {html, replaced} = apply(file, before);
    if (!replaced.includes('header') && file !== '404.html') console.warn('No shared header found in', file);
    if (html !== before) fs.writeFileSync(abs, html);
  }
  const notFound = path.join(ROOT, '404.html');
  const nf = fs.readFileSync(notFound, 'utf8');
  fs.writeFileSync(notFound, apply('404.html', nf).html);
}
module.exports = {apply, header, footer};
