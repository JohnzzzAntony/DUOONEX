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
})();
