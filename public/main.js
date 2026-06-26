/* =========================================================
   Eco Stolz – Cinematic interactions
   ========================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mark JS as active so reveal elements are only hidden when we can animate them in.
  document.documentElement.classList.add('js');

  /* ---------- Header state on scroll ---------- */
  const header = document.getElementById('header');
  const progress = document.getElementById('scrollProgress');

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 60);

    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (progress && docH > 0) progress.style.width = (y / docH) * 100 + '%';

    if (!reduceMotion) updateParallax(y);
  }

  /* ---------- Parallax ---------- */
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  function updateParallax(y) {
    for (const el of parallaxEls) {
      const wrap = el.closest('.parallax-wrap') || el.parentElement;
      const rect = wrap.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      const offset = (rect.top - window.innerHeight / 2) * speed * -1;
      el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
    }
  }

  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(function (entries, obs) {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(function () { el.classList.add('in'); }, delay);
          obs.unobserve(el);
        }
      }
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Animated counters ---------- */
  const counters = Array.from(document.querySelectorAll('[data-count]'));
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1600;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver(function (entries, obs) {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (reduceMotion) {
            entry.target.textContent = entry.target.dataset.count + (entry.target.dataset.suffix || '');
          } else {
            animateCount(entry.target);
          }
          obs.unobserve(entry.target);
        }
      }
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  if (navToggle && nav) {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-controls', 'nav');
    navToggle.addEventListener('click', function () {
      const open = nav.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        navToggle.classList.remove('open');
      });
    });
  }

  /* ---------- Hero subtle zoom-out on load ---------- */
  window.addEventListener('load', function () {
    const heroVideo = document.querySelector('.hero__video');
    if (heroVideo && !reduceMotion) {
      heroVideo.style.transition = 'transform 8s ease-out';
      requestAnimationFrame(function () { heroVideo.style.transform = 'scale(1)'; });
    }
  });

  /* initial paint */
  onScroll();
})();

/* =========================================================
   Eco Stolz – Cookie-Consent (DSGVO)
   ========================================================= */
(function () {
  'use strict';
  var KEY = 'eco_consent_v1';
  var banner = document.getElementById('cookieBanner');

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function save(consent) {
    consent.ts = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(consent)); } catch (e) {}
    apply(consent);
  }
  function apply(consent) {
    if (consent && consent.external_media) {
      document.querySelectorAll('.consent-gate[data-src]').forEach(function (gate) {
        if (gate.classList.contains('is-loaded')) return;
        var iframe = gate.querySelector('iframe');
        if (iframe && !iframe.src) iframe.src = gate.getAttribute('data-src');
        gate.classList.add('is-loaded');
      });
    }
  }

  // Apply any stored consent immediately (for gated media on this page).
  var stored = read();
  if (stored) apply(stored);

  if (!banner) return;

  var optMedia = document.getElementById('cookieOptMedia');

  function showBanner(openSettings) {
    if (stored && optMedia) optMedia.checked = !!stored.external_media;
    banner.classList.toggle('is-open', !!openSettings);
    banner.classList.add('is-visible');
    banner.removeAttribute('hidden');
  }
  function hideBanner() { banner.classList.remove('is-visible'); }

  if (!stored) showBanner(false);

  var byId = function (id) { return document.getElementById(id); };
  var btnAll = byId('cookieAcceptAll');
  var btnNec = byId('cookieAcceptNecessary');
  var btnSettings = byId('cookieSettings');
  var btnSave = byId('cookieSave');

  if (btnAll) btnAll.addEventListener('click', function () { save({ necessary: true, external_media: true }); hideBanner(); });
  if (btnNec) btnNec.addEventListener('click', function () { save({ necessary: true, external_media: false }); hideBanner(); });
  if (btnSettings) btnSettings.addEventListener('click', function () { banner.classList.add('is-open'); });
  if (btnSave) btnSave.addEventListener('click', function () {
    save({ necessary: true, external_media: optMedia ? optMedia.checked : false }); hideBanner();
  });

  // Re-open from footer "Cookie-Einstellungen"
  document.querySelectorAll('#cookieSettingsBtn, .js-cookie-settings').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); stored = read(); showBanner(true); });
  });

  // Per-embed "laden" buttons inside a consent gate
  document.querySelectorAll('.js-load-embed').forEach(function (b) {
    b.addEventListener('click', function () {
      var gate = b.closest('.consent-gate');
      if (!gate) return;
      var iframe = gate.querySelector('iframe');
      if (iframe && !iframe.src) iframe.src = gate.getAttribute('data-src');
      gate.classList.add('is-loaded');
    });
  });
})();
