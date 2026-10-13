/* NexPixels website interactions. No dependencies. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Original project media stays inside the existing artwork area. */
  $$('[data-project-gallery]').forEach(function (gallery) {
    var controls = gallery.parentElement.querySelector('[data-gallery-controls]');
    if (!controls) return;
    var slides = $$('[data-project-slide]', gallery);
    var current = function () { return Math.max(0, Math.min(slides.length - 1, Math.round(gallery.scrollLeft / gallery.clientWidth))); };
    var go = function (delta) {
      var index = (current() + delta + slides.length) % slides.length;
      $$('video', gallery).forEach(function (video) { video.pause(); });
      gallery.scrollTo({left: gallery.clientWidth * index, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    };
    controls.querySelector('[data-gallery-prev]').addEventListener('click', function () { go(-1); });
    controls.querySelector('[data-gallery-next]').addEventListener('click', function () { go(1); });
    gallery.addEventListener('keydown', function (event) {
      if (event.target.tagName === 'VIDEO') return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); go(event.key === 'ArrowRight' ? 1 : -1); }
    });
    gallery.addEventListener('scroll', function () {
      var index = current();
      controls.querySelector('[data-gallery-position]').textContent = (index + 1) + ' / ' + slides.length;
      slides.forEach(function (slide, i) { if (i !== index) $$('video', slide).forEach(function (video) { video.pause(); }); });
    }, {passive: true});
  });

  /* ---- Sticky header state ---- */
  var header = $('.header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mega menu (hover on desktop, click-safe) ---- */
  var megaTrigger = $('[data-mega-trigger]');
  var mega = $('[data-mega]');
  if (megaTrigger && mega) {
    var closeTimer;
    var open = function () { clearTimeout(closeTimer); mega.classList.add('is-open'); megaTrigger.setAttribute('aria-expanded', 'true'); };
    var close = function () { closeTimer = setTimeout(function () { mega.classList.remove('is-open'); megaTrigger.setAttribute('aria-expanded', 'false'); }, 120); };
    [megaTrigger, mega].forEach(function (el) {
      el.addEventListener('mouseenter', open);
      el.addEventListener('mouseleave', close);
    });
    megaTrigger.addEventListener('focus', open);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { clearTimeout(closeTimer); mega.classList.remove('is-open'); } });
  }

  /* ---- Mobile drawer ---- */
  var burger = $('[data-burger]');
  var drawer = $('[data-drawer]');
  if (burger && drawer) {
    var setDrawer = function (isOpen) {
      drawer.classList.toggle('is-open', isOpen);
      burger.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('is-locked', isOpen);
      if (isOpen) { var first = $('a', drawer); if (first) first.focus(); }
    };
    burger.addEventListener('click', function () { setDrawer(!drawer.classList.contains('is-open')); });
    document.addEventListener('keydown', function (e) {
      if (!drawer.classList.contains('is-open')) return;
      if (e.key === 'Escape') { setDrawer(false); burger.focus(); return; }
      if (e.key !== 'Tab') return;
      // Keep focus inside the drawer and its toggle while open.
      var items = [burger].concat($$('a', drawer));
      var i = items.indexOf(document.activeElement);
      if (e.shiftKey ? i <= 0 : i === items.length - 1) { e.preventDefault(); items[e.shiftKey ? items.length - 1 : 0].focus(); }
    });
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setDrawer(false); });
  }

  /* ---- FAQ accordion ---- */
  var collapse = function (item) {
    var panel = $('.faq__a', item);
    if (!panel) return;
    panel.style.height = panel.scrollHeight + 'px';
    void panel.offsetHeight; // force reflow so the height change transitions
    panel.style.height = '0px';
    item.classList.remove('is-open');
    $('.faq__q', item).setAttribute('aria-expanded', 'false');
  };
  var expand = function (item) {
    var panel = $('.faq__a', item);
    if (!panel) return;
    panel.style.height = panel.scrollHeight + 'px';
    item.classList.add('is-open');
    $('.faq__q', item).setAttribute('aria-expanded', 'true');
    // Release to auto once open so long answers reflow with the viewport.
    panel.addEventListener('transitionend', function onEnd(e) {
      if (e.propertyName !== 'height') return;
      panel.removeEventListener('transitionend', onEnd);
      if (item.classList.contains('is-open')) panel.style.height = 'auto';
    });
  };

  $$('[data-faq]').forEach(function (list) {
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('.faq__q');
      if (!btn) return;
      var item = btn.parentElement;
      var wasOpen = item.classList.contains('is-open');
      if (!list.hasAttribute('data-faq-multi')) {
        $$('.faq__item.is-open', list).forEach(collapse);
      } else if (wasOpen) {
        collapse(item);
      }
      if (!wasOpen) expand(item);
    });
  });

  /* ---- Reviews carousel ---- */
  $$('[data-carousel]').forEach(function (root) {
    var pages = $$('[data-slide]', root);
    var dots = $$('button', $('.dots', root) || root);
    if (!pages.length || !dots.length) return;
    var show = function (i) {
      pages.forEach(function (p, n) { p.hidden = n !== i; });
      dots.forEach(function (d, n) { d.setAttribute('aria-current', String(n === i)); });
    };
    dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); }); });
    show(0);
  });

  /* ---- Product cards: mobile coverflow auto-carousel ---- */
  var mobile = window.matchMedia('(max-width: 767px)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  $$('.work').forEach(function (track) {
    var dots = document.createElement('div');
    dots.className = 'cf-dots';
    track.after(dots);
    var cards = function () { return Array.prototype.filter.call(track.children, function (c) { return c.offsetParent !== null; }); };
    var active = 0, paused = false;
    /* Card offset from the track's visible centre, in px */
    var offset = function (card) {
      var t = track.getBoundingClientRect(), r = card.getBoundingClientRect();
      return r.left + r.width / 2 - (t.left + t.width / 2);
    };
    var go = function (i) {
      var list = cards();
      if (!list.length) return;
      i = (i + list.length) % list.length;
      track.scrollTo({left: track.scrollLeft + offset(list[i]), behavior: reduceMotion.matches ? 'auto' : 'smooth'});
    };
    var buildDots = function () {
      dots.textContent = '';
      cards().forEach(function (c, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Show card ' + (i + 1));
        b.addEventListener('click', function () { go(i); });
        dots.appendChild(b);
      });
      update();
    };
    var update = function () {
      if (!mobile.matches) return;
      var best = Infinity;
      cards().forEach(function (c, i) {
        var d = Math.abs(offset(c)) / c.offsetWidth;
        c.style.setProperty('--cf', Math.min(d, 1).toFixed(3));
        if (d < best) { best = d; active = i; }
      });
      $$('button', dots).forEach(function (b, i) { b.setAttribute('aria-current', String(i === active)); });
    };
    track.addEventListener('scroll', update, {passive: true});
    ['pointerdown', 'focusin'].forEach(function (e) { track.addEventListener(e, function () { paused = true; }); });
    ['pointerup', 'pointercancel', 'focusout'].forEach(function (e) { track.addEventListener(e, function () { paused = false; }); });
    setInterval(function () {
      if (mobile.matches && !paused && !reduceMotion.matches && !document.hidden) go(active + 1);
    }, 3500);
    /* Filters hide cards via display; rebuild dots only when the visible count changes */
    new MutationObserver(function () { if (cards().length !== dots.children.length) buildDots(); })
      .observe(track, {subtree: true, attributes: true, attributeFilter: ['style']});
    mobile.addEventListener('change', function () { if (!mobile.matches) cards().forEach(function (c) { c.style.removeProperty('--cf'); }); else buildDots(); });
    window.addEventListener('resize', update);
    buildDots();
  });

  /* ---- Product showcase: a pinned, scroll-driven stage built from the product cards.
     The cards stay in the HTML as the single, CMS-editable source of truth and no-JS fallback.
     Optional per-card overrides: data-showcase-label (short list name), data-showcase-image,
     data-showcase-position (background focal point), data-showcase-logo, data-showcase-cta. ---- */
  (function () {
    /* Homepage only (the one page with .hero). The CMS-served homepage may lack id="products". */
    var grid = $('.hero') && $('main section .work');
    var section = grid && grid.closest('section');
    if (!section) return;
    var text = function (el, sel) { var n = $(sel, el); return n ? n.textContent.replace(/\s+/g, ' ').trim() : ''; };
    var projects = $$('.work__card', grid).map(function (card, i) {
      var art = $('.art', card);
      var bg = card.getAttribute('data-showcase-image') ||
        ((art && art.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)) || [])[1] || '';
      var metric = $('.work__metric', card);
      var stack = metric && metric.firstChild ? metric.firstChild.textContent.trim() : '';
      var name = text(card, '.work__title');
      return {
        id: 'pshow-' + i,
        name: name,
        label: card.getAttribute('data-showcase-label') || name,
        logo: card.getAttribute('data-showcase-logo') || '',
        category: text(card, '.work__cat'),
        description: text(card, '.work__desc'),
        backgroundImage: bg,
        /* Every -mockup-N.webp ships with a 3200px @2x sibling for large, high-density screens */
        backgroundSrcset: /-mockup-\d+\.webp$/.test(bg) ? bg + ' 1600w, ' + bg.replace(/\.webp$/, '@2x.webp') + ' 3200w' : '',
        backgroundPosition: card.getAttribute('data-showcase-position') || '62% center',
        alt: art ? art.getAttribute('aria-label') || '' : '',
        projectUrl: card.getAttribute('href'),
        technologies: stack ? [stack] : [],
        tags: (card.getAttribute('data-tags') || '').split('|').filter(function (t) { return t && t !== 'Websites' && t !== stack; }),
        ctaLabel: card.getAttribute('data-showcase-cta') || text(card, '.work__foot .btn').replace(/\s*→$/, '') || 'View project'
      };
    }).filter(function (p) { return p.name && p.backgroundImage; });
    if (projects.length < 2) return;

    var el = function (tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html) n.innerHTML = html; return n; };
    var pad = function (n) { return (n < 9 ? '0' : '') + (n + 1); };
    var root = el('div', 'pshow');
    root.style.setProperty('--pshow-count', projects.length);
    var pin = el('div', 'pshow__pin');
    var frame = el('div', 'pshow__frame');
    frame.setAttribute('role', 'region');
    frame.setAttribute('aria-roledescription', 'product showcase');
    frame.setAttribute('aria-label', 'Our products');
    var media = el('div', 'pshow__media');
    var layers = projects.map(function (p) {
      var img = el('img', 'pshow__bg');
      img.alt = '';
      img.decoding = 'async';
      img.style.objectPosition = p.backgroundPosition;
      media.appendChild(img);
      return img;
    });
    media.appendChild(el('div', 'pshow__shade'));
    var nav = el('nav', 'pshow__nav');
    nav.setAttribute('aria-label', 'Products');
    var list = el('ol', 'pshow__list');
    var buttons = projects.map(function (p, i) {
      var li = el('li');
      var b = el('button', 'pshow__name');
      b.type = 'button';
      b.id = p.id;
      b.innerHTML = '<span class="pshow__plus" aria-hidden="true"></span><span class="pshow__label"></span>';
      $('.pshow__label', b).textContent = p.label;
      if (p.label !== p.name) b.setAttribute('aria-label', p.name);
      li.appendChild(b);
      list.appendChild(li);
      return b;
    });
    nav.appendChild(list);
    var count = el('p', 'pshow__count', '<span data-pshow-current>01</span> / ' + pad(projects.length - 1));
    count.setAttribute('aria-hidden', 'true');
    nav.appendChild(count);
    var info = el('div', 'pshow__info',
      '<p class="pshow__cat"></p>' +
      '<p class="pshow__brand"></p>' +
      '<p class="pshow__desc"></p>' +
      '<p class="pshow__tags"></p>' +
      '<a class="pshow__cta"><span></span><span class="arw" aria-hidden="true">→</span></a>');
    var progress = el('div', 'pshow__progress');
    progress.setAttribute('aria-hidden', 'true');
    frame.appendChild(media);
    frame.appendChild(nav);
    frame.appendChild(info);
    frame.appendChild(progress);
    pin.appendChild(frame);
    root.appendChild(pin);
    grid.before(root);
    section.classList.add('has-pshow');

    var active = -1, shown = -1, swapTimer = 0;
    var load = function (i) {
      var img = layers[i], p = projects[i];
      if (!img || img.getAttribute('src')) return;
      if (p.backgroundSrcset) { img.sizes = '100vw'; img.srcset = p.backgroundSrcset; }
      img.src = p.backgroundImage;
    };
    var render = function (i) {
      var p = projects[i];
      shown = i;
      $('.pshow__cat', info).textContent = pad(i) + ' — ' + p.category;
      var brand = $('.pshow__brand', info);
      brand.textContent = '';
      if (p.logo) { var logo = el('img'); logo.src = p.logo; logo.alt = p.name; brand.appendChild(logo); } else brand.textContent = p.name;
      $('.pshow__desc', info).textContent = p.description;
      $('.pshow__tags', info).textContent = p.tags.concat(p.technologies.map(function (t) { return 'Built with ' + t; })).join('  ·  ');
      var cta = $('.pshow__cta', info);
      cta.href = p.projectUrl;
      $('span', cta).textContent = p.ctaLabel;
      cta.setAttribute('aria-label', p.ctaLabel + ': ' + p.name);
    };
    var setActive = function (i) {
      if (i === active) return;
      active = i;
      [i, i + 1, i - 1].forEach(function (n) { if (n >= 0 && n < projects.length) load(n); });
      layers.forEach(function (img, n) { img.classList.toggle('is-active', n === i); });
      buttons.forEach(function (b, n) {
        b.parentNode.classList.toggle('is-active', n === i);
        if (n === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      });
      $('[data-pshow-current]', count).textContent = pad(i);
      if (shown < 0 || reduceMotion.matches) { render(i); return; }
      /* Fade the outgoing details up and out, then bring the latest active project in from below.
         Rapid scrolling only ever renders the project that is active when the fade-out finishes. */
      if (swapTimer) return;
      info.classList.add('is-out');
      swapTimer = setTimeout(function () {
        swapTimer = 0;
        render(active);
        info.classList.remove('is-out');
        info.classList.add('is-enter');
        void info.offsetWidth;
        info.classList.remove('is-enter');
      }, 240);
    };
    /* Pinned distance is split into equal stages, one per project */
    var geometry = function () {
      var rect = root.getBoundingClientRect();
      var top = parseFloat(getComputedStyle(pin).top) || 0;
      return { rect: rect, top: top, run: Math.max(1, root.offsetHeight - pin.offsetHeight) };
    };
    /* Cheap enough (one rect read, class changes only on a new stage) to run on every scroll event */
    var update = function () {
      var g = geometry();
      var p = Math.min(1, Math.max(0, (g.top - g.rect.top) / g.run));
      frame.style.setProperty('--pshow-progress', p.toFixed(4));
      setActive(Math.min(projects.length - 1, Math.floor(p * projects.length)));
    };
    var goTo = function (i) {
      load(i);
      var g = geometry();
      window.scrollTo({ top: window.scrollY + g.rect.top - g.top + (i + 0.5) / projects.length * g.run, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    };
    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () { goTo(i); });
      b.addEventListener('pointerenter', function () { load(i); });
      b.addEventListener('keydown', function (e) {
        var to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: projects.length - 1 }[e.key];
        if (to === undefined) return;
        e.preventDefault();
        to = Math.max(0, Math.min(projects.length - 1, to));
        buttons[to].focus({ preventScroll: true });
        goTo(to);
      });
    });
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    /* After the page settles, warm the cache for every stage so jumps never show an empty frame */
    window.addEventListener('load', function () {
      var warm = function () { projects.forEach(function (p, i) { load(i); }); };
      if (window.requestIdleCallback) requestIdleCallback(warm, { timeout: 3000 }); else setTimeout(warm, 1500);
    });
    update();
  })();

  /* ---- Mobile one-card carousels: position dots ---- */
  $$('.vtest, .industries, .divisions, .cards-3, .cards-2, .plans, .compare__cols').forEach(function (track) {
    var count = track.children.length;
    if (count < 2) return;
    var dots = document.createElement('div');
    dots.className = 'cf-dots';
    for (var i = 0; i < count; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show card ' + (i + 1));
      b.addEventListener('click', (function (n) { return function () {
        track.scrollTo({left: track.children[n].offsetLeft - track.children[0].offsetLeft, behavior: reduceMotion.matches ? 'auto' : 'smooth'});
      }; })(i));
      dots.appendChild(b);
    }
    track.after(dots);
    var update = function () {
      var step = (track.children[1].offsetLeft - track.children[0].offsetLeft) || 1;
      var active = Math.round(track.scrollLeft / step);
      $$('button', dots).forEach(function (b, n) { b.setAttribute('aria-current', String(n === active)); });
    };
    track.addEventListener('scroll', update, {passive: true});
    update();
  });

  /* ---- Case study / blog filters ---- */
  $$('[data-filter-group]').forEach(function (group) {
    var target = $('#' + group.dataset.filterGroup);
    if (!target) return;
    $$('[data-filter]', group).forEach(function (b) { b.setAttribute('aria-pressed', String(b.classList.contains('is-active'))); });
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      e.preventDefault();
      $$('[data-filter]', group).forEach(function (b) { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
      var want = btn.dataset.filter;
      $$('[data-tags]', target).forEach(function (card) {
        var tags = card.dataset.tags.split('|');
        var hit = want === 'all' || tags.indexOf(want) !== -1;
        card.style.display = hit ? '' : 'none';
      });
    });
  });

  /* ---- Pricing billing toggle ---- */
  $$('[data-billing]').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.engagement) {
        $$('button', group).forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var note = group.parentElement.querySelector('[data-engagement-note-display]');
        if (note) note.textContent = btn.dataset.engagementNote;
        $$('.plan__actions a', group.parentElement).forEach(function (link) { link.href = '/contact/?engagement=' + btn.dataset.engagement; });
        return;
      }
      $$('button', group).forEach(function (b) { b.setAttribute('aria-selected', String(b === btn)); });
      var mult = parseFloat(btn.dataset.mult || '1');
      var suffix = btn.dataset.suffix || '/monthly';
      $$('[data-base]').forEach(function (el) {
        var base = parseFloat(el.dataset.base);
        if (!base) return;
        el.firstChild.nodeValue = '$' + Math.round(base * mult).toLocaleString('en-US') + ' ';
        var per = $('span', el);
        if (per) per.textContent = suffix;
      });
    });
  });

  /* ---- Contact form ---- */
  $$('[data-contact-form]').forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var note = $('.form-note', form);
      if (!note) return;
      if (!form.reportValidity()) return;
      var submit = form.querySelector('[type="submit"]');
      if (submit) submit.disabled = true;
      try {
        var entries = new FormData(form), data = {};
        ['name','email','message','budget','source','website'].forEach(function (key) { data[key] = entries.get(key) || ''; });
        data.help = entries.getAll('help').join(', ');
        var response = await fetch('/api/inquiries', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
        var result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to send your enquiry. Please try again.');
        note.textContent = 'Thank you. Your enquiry has been received.';
        note.classList.add('is-ok');
        form.reset();
      } catch (error) { note.textContent = error.message || 'Unable to send your enquiry. Please try again.'; note.classList.remove('is-ok'); }
      finally { if (submit) submit.disabled = false; }
    });
  });

  /* No-JS form fallback redirects back with ?sent=1 */
  if (/[?&]sent=1/.test(location.search)) $$('[data-contact-form] .form-note').forEach(function (note) {
    note.textContent = 'Thank you. Your enquiry has been received.'; note.classList.add('is-ok');
  });

  /* ---- WhatsApp click tracking (GTM) ---- */
  $$('[data-wa-float]').forEach(function (link) {
    link.addEventListener('click', function () { (window.dataLayer = window.dataLayer || []).push({event: 'whatsapp_click'}); });
  });

  /* ---- Pause marquees while off-screen ---- */
  var marquees = $$('.marquee, .marquee-one, .marquee-two, .marquee-three');
  if (marquees.length && 'IntersectionObserver' in window) {
    var mo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var track = $('.marquee__track, .marquee-track', entry.target);
        if (track) track.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
      });
    }, { rootMargin: '200px 0px' });
    marquees.forEach(function (el) { mo.observe(el); });
  }

  /* ---- Scroll reveal ---- */
  var reveals = $$('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        setTimeout(function () { entry.target.classList.add('is-in'); }, Math.min(i, 6) * 60);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }


  /* ---- Homepage scroll line: a large infinity framing the hero, then wide S-sweeps from side to
     side down the page, drawn by scroll progress and ending at the footer tagline. The line sits
     above section backgrounds but behind section content (see .has-scroll-line in style.css). ---- */
  (function () {
    var heroTitle = $('.hero h1');
    var hero = $('.hero');
    var footer = $('.footer');
    var main = $('main');
    if (!heroTitle || !hero || !footer || !main || !window.requestAnimationFrame) return;
    var NS = 'http://www.w3.org/2000/svg';
    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var make = function (tag, cls) {
      var n = document.createElementNS(NS, tag);
      if (cls) n.setAttribute('class', cls);
      return n;
    };
    var wrap = document.createElement('div');
    wrap.className = 'scroll-line';
    wrap.setAttribute('aria-hidden', 'true');
    var svg = make('svg');
    /* Horizontal sheen: the line brightens towards the edges as it sweeps across */
    var defs = make('defs'), grad = make('linearGradient');
    grad.id = 'scroll-line-grad';
    grad.setAttribute('gradientUnits', 'userSpaceOnUse');
    [['0', '#D8FF8A'], ['0.5', '#A5F044'], ['1', '#CFFF6E']].forEach(function (st) {
      var stop = make('stop');
      stop.setAttribute('offset', st[0]);
      stop.setAttribute('stop-color', st[1]);
      grad.appendChild(stop);
    });
    defs.appendChild(grad);
    /* Glow: two wide, faint strokes under the line, far cheaper than a blur filter on a page-tall SVG.
       The line is drawn twice: a soft layer clipped to light sections and the full neon layer clipped
       to dark ones, so it stays quiet behind dark text and glows on dark backgrounds. */
    var layers = ['light', 'dark'].map(function (tone) {
      var clip = make('clipPath');
      clip.id = 'scroll-line-clip-' + tone;
      defs.appendChild(clip);
      var g = make('g', 'scroll-line__layer scroll-line__layer--' + tone);
      g.setAttribute('clip-path', 'url(#' + clip.id + ')');
      var paths = ['halo', 'glow', 'path'].map(function (k) {
        var p = make('path', 'scroll-line__' + k);
        g.appendChild(p);
        return p;
      });
      return { clip: clip, g: g, paths: paths, scale: tone === 'light' ? 0.7 : 1 };
    });
    var tip = make('circle', 'scroll-line__tip'), end = make('circle', 'scroll-line__end');
    var strokes = layers[0].paths.concat(layers[1].paths);
    [defs, layers[0].g, layers[1].g, end, tip].forEach(function (n) { svg.appendChild(n); });
    /* Page bands with a dark background, detected from light text colour (works for gradients too) */
    var darkBands = [];
    var isDarkAt = function (y) {
      for (var i = 0; i < darkBands.length; i++) if (y >= darkBands[i][0] && y < darkBands[i][1]) return true;
      return false;
    };
    var hasLightText = function (el) {
      var c = getComputedStyle(el).color.match(/[\d.]+/g);
      return !!c && (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) > 150;
    };
    var setClip = function (clip, bands, W) {
      while (clip.firstChild) clip.removeChild(clip.firstChild);
      bands.forEach(function (b) {
        var r = make('rect');
        r.setAttribute('x', -50); r.setAttribute('width', W + 100);
        r.setAttribute('y', b[0].toFixed(1)); r.setAttribute('height', Math.max(0, b[1] - b[0]).toFixed(1));
        clip.appendChild(r);
      });
    };
    wrap.appendChild(svg);
    document.body.appendChild(wrap);
    document.body.classList.add('has-scroll-line');

    var len = 0, introLen = 0, lens = [], xs = [], ys = [], ymax = [];
    var current = 0, target = 0, running = false, ready = false;
    var pageRect = function (el) {
      var r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, height: r.height };
    };
    /* End of the last rendered text line of an element, in page coordinates */
    var textEnd = function (el) {
      var range = document.createRange();
      range.selectNodeContents(el);
      var rects = range.getClientRects();
      var r = rects.length ? rects[rects.length - 1] : el.getBoundingClientRect();
      return { x: r.right, y: r.top + window.scrollY + r.height * 0.55 };
    };
    /* Catmull-Rom spline through points, as cubic Béziers. Also samples the curve into a
       cumulative length table (lens/xs/ys/ymax): per-frame getPointAtLength on a path this
       long is far too slow. */
    var spline = function (pts) {
      var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
      var px = pts[0][0], py = pts[0][1], total = 0, m = py;
      lens = [0]; xs = [px]; ys = [py]; ymax = [py];
      for (var i = 0; i < pts.length - 1; i++) {
        var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
        var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += 'C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' +
          p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
        for (var k = 1; k <= 10; k++) {
          var u = k / 10, v = 1 - u, b0 = v * v * v, b1 = 3 * v * v * u, b2 = 3 * v * u * u, b3 = u * u * u;
          var x = b0 * p1[0] + b1 * c1x + b2 * c2x + b3 * p2[0], y = b0 * p1[1] + b1 * c1y + b2 * c2y + b3 * p2[1];
          total += Math.hypot(x - px, y - py); px = x; py = y; m = Math.max(m, y);
          lens.push(total); xs.push(x); ys.push(y); ymax.push(m);
        }
      }
      len = total;
      return d;
    };
    /* Lemniscate of Bernoulli centred on (cx,cy): rx is the half-width, ry the half-height of a lobe.
       a = 0 is the crossing heading down-right, a = π/2 the right tip, a = 3π/2 the left tip. */
    var lemniscate = function (pts, cx, cy, rx, ry, from, to) {
      var n = Math.ceil((to - from) / (Math.PI / 24));
      for (var i = 0; i <= n; i++) {
        var a = from + (to - from) * i / n, c = Math.cos(a), q = 1 / (1 + c * c);
        pts.push([cx + rx * q * Math.sin(a), cy + ry * 2.83 * q * Math.sin(a) * c]);
      }
    };

    var build = function () {
      if (getComputedStyle(wrap).display === 'none') { ready = false; return; }
      wrap.style.height = '0px';
      var W = document.documentElement.clientWidth;
      var H = document.documentElement.scrollHeight;
      wrap.style.height = H + 'px';
      svg.setAttribute('width', W);
      svg.setAttribute('height', H);
      grad.setAttribute('x2', W);

      var weight = Math.min(13, Math.max(6, W * 0.008));
      layers.forEach(function (l) {
        var w = weight * l.scale;
        l.paths[0].style.strokeWidth = (w * 4.5).toFixed(1);
        l.paths[1].style.strokeWidth = (w * 2.2).toFixed(1);
        l.paths[2].style.strokeWidth = w.toFixed(1);
      });

      /* Split the page into dark and light bands for the two clipped layers */
      darkBands = [];
      Array.prototype.forEach.call(main.children, function (el) {
        if (el.offsetHeight > 0 && hasLightText(el)) { var r = pageRect(el); darkBands.push([r.top, r.bottom]); }
      });
      if (hasLightText(footer)) { var fr = pageRect(footer); darkBands.push([fr.top, fr.bottom]); }
      darkBands.sort(function (a, b) { return a[0] - b[0]; });
      var lightBands = [], from = -1000;
      darkBands.forEach(function (b) { if (b[0] > from) lightBands.push([from, b[0]]); from = Math.max(from, b[1]); });
      lightBands.push([from, H + 1000]);
      setClip(layers[0].clip, lightBands, W);
      setClip(layers[1].clip, darkBands, W);
      tip.setAttribute('r', (weight * 0.85).toFixed(1));
      end.setAttribute('r', (weight * 0.9).toFixed(1));

      /* Sweeps turn in the page gutter, midway between the viewport edge and the content edge */
      var inset = Math.max(heroTitle.getBoundingClientRect().left * 0.5, 22);
      var sides = [W - inset, inset];
      var pts = [];

      /* Hero: one infinity spanning the hero (title in the left lobe, aside in the right), traced
         once in full, then peeled off along the bottom of the right lobe into the first sweep */
      var h = pageRect(hero);
      var cx = W / 2, cy = h.top + h.height * 0.52;
      /* Lobe height is capped by width so tall single-column (mobile) heroes keep a true ∞ shape */
      var rx = W / 2 - inset * 1.4, ry = Math.min(h.height * 0.4, rx * 0.45);
      lemniscate(pts, cx, cy, rx, ry, 0, Math.PI * 2);
      var introPts = pts.length;
      lemniscate(pts, cx, cy, rx, ry, Math.PI * 2 + 0.05, Math.PI * 2.3);
      pts.push([sides[0], h.bottom + 90]);

      /* Body: switch gutters roughly every 750px so the line crosses the page in long, even S-curves.
         Turning points drift in and out a little so no two sweeps are identical. */
      var side = 1;
      var sections = Array.prototype.filter.call(main.children, function (el) {
        return el.tagName === 'SECTION' && el.offsetHeight > 0 && el !== hero;
      });
      sections.forEach(function (sec) {
        var b = pageRect(sec), n = Math.max(1, Math.round(b.height / 750));
        for (var k = 0; k < n; k++) {
          var drift = inset * 0.7 * Math.sin(pts.length * 1.7);
          pts.push([sides[side] + (side ? drift : -drift), b.top + b.height * (k + 0.5) / n]);
          side = 1 - side;
        }
      });

      /* Footer: sweep in and finish just after the "Designing what's next." tagline */
      var tag = $('.footer__tagline', footer);
      var f = pageRect(footer);
      var fin = tag ? textEnd(tag) : { x: W * 0.5, y: f.top + 80 };
      var ex = fin.x + 22, ey = fin.y;
      pts.push([sides[side], f.top + 10], [Math.min(ex + 180, W - inset), ey - 60], [ex, ey]);

      var d = spline(pts);
      introLen = lens[(introPts - 1) * 10];
      strokes.forEach(function (s) {
        s.setAttribute('d', d);
        /* Dash units follow the sampled length, so dash offset and tip position stay in step */
        s.setAttribute('pathLength', len.toFixed(1));
        s.style.strokeDasharray = len + ' ' + len;
      });
      end.setAttribute('cx', ex); end.setAttribute('cy', ey);
      ready = true;
      current = Math.min(current, len);
      onScroll();
    };

    /* Path length whose drawing head has reached page height y */
    var lengthAt = function (y) {
      var lo = 0, hi = ymax.length - 1;
      if (y >= ymax[hi]) return len;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (ymax[mid] < y) lo = mid + 1; else hi = mid; }
      return lens[lo];
    };
    var render = function () {
      var offset = (len - current).toFixed(1);
      strokes.forEach(function (s) { s.style.strokeDashoffset = offset; });
      var lo = 0, hi = lens.length - 1;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (lens[mid] < current) lo = mid + 1; else hi = mid; }
      var j = Math.max(1, lo), f = (current - lens[j - 1]) / ((lens[j] - lens[j - 1]) || 1);
      var ty = ys[j - 1] + (ys[j] - ys[j - 1]) * f;
      tip.setAttribute('cx', (xs[j - 1] + (xs[j] - xs[j - 1]) * f).toFixed(1));
      tip.setAttribute('cy', ty.toFixed(1));
      wrap.classList.toggle('is-on-light', !isDarkAt(ty));
      tip.style.opacity = current > 2 ? '' : '0';
      wrap.classList.toggle('is-complete', current >= len - 1);
    };
    /* Time-based damping: the line glides after the scroll at the same pace on any refresh rate */
    var last = 0;
    var tick = function (now) {
      var dt = last ? Math.min(64, now - last) : 16;
      last = now;
      var diff = target - current;
      current = Math.abs(diff) < 0.5 ? target : current + diff * (1 - Math.exp(-dt / 180));
      render();
      if (current !== target) window.requestAnimationFrame(tick); else { running = false; last = 0; }
    };
    /* The hero infinity always draws in full on load; past it, the line follows the scroll */
    var onScroll = function () {
      if (!ready) return;
      target = motion.matches ? len : Math.max(introLen, lengthAt(window.scrollY + window.innerHeight * 0.62));
      if (motion.matches) { current = target; render(); return; }
      if (!running) { running = true; window.requestAnimationFrame(tick); }
    };
    var timer;
    var schedule = function () { clearTimeout(timer); timer = setTimeout(build, 150); };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    if (window.ResizeObserver) new ResizeObserver(schedule).observe(main);
    build();
  })();
})();
