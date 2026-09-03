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

  // Google Analytics 4 (laedt ausschliesslich nach Einwilligung "Statistik")
  var GA_ID = 'G-32JJME1431';
  var gaLoaded = false;
  function loadGA() {
    if (gaLoaded) return; gaLoaded = true;
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
  }

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function save(consent) {
    consent.ts = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(consent)); } catch (e) {}
    apply(consent);
  }
  function apply(consent) {
    if (consent && consent.statistics) { loadGA(); }
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
  var optStats = document.getElementById('cookieOptStats');

  function showBanner(openSettings) {
    if (stored && optMedia) optMedia.checked = !!stored.external_media;
    if (stored && optStats) optStats.checked = !!stored.statistics;
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

  if (btnAll) btnAll.addEventListener('click', function () { save({ necessary: true, external_media: true, statistics: true }); hideBanner(); });
  if (btnNec) btnNec.addEventListener('click', function () { save({ necessary: true, external_media: false, statistics: false }); hideBanner(); });
  if (btnSettings) btnSettings.addEventListener('click', function () { banner.classList.add('is-open'); });
  if (btnSave) btnSave.addEventListener('click', function () {
    save({ necessary: true, external_media: optMedia ? optMedia.checked : false, statistics: optStats ? optStats.checked : false }); hideBanner();
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

/* =========================================================
   Eco Stolz – Sprachumschalter (DE/EN/IT/ES)
   Lazy & datensparsam: Google-Übersetzer lädt nur bei aktiver Übersetzung.
   ========================================================= */
(function () {
  'use strict';
  var LANGS = { de: 'Deutsch', en: 'English', it: 'Italiano', es: 'Español' };
  var sw = document.getElementById('langSwitch');
  if (!sw) return;
  var btn = document.getElementById('langBtn');
  var codeEl = sw.querySelector('.lang__code');
  var menu = sw.querySelector('.lang__menu');

  // Aktuelle Sprache aus dem Pfad (/en, /it, /es -> sonst Deutsch)
  function currentLang() {
    var m = location.pathname.match(/^\/(en|it|es)(?=\/|$)/);
    return m ? m[1] : 'de';
  }
  // Pfad ohne Sprachpräfix: /en/kontakt -> /kontakt, /en -> /
  function basePath() {
    var p = location.pathname.replace(/^\/(en|it|es)(?=\/|$)/, '');
    return p === '' ? '/' : p;
  }
  // Ziel-URL für eine Sprache: bevorzugt die hreflang-Alternative dieser Seite,
  // sonst (noch nicht übersetzt) die Startseite der jeweiligen Sprache.
  function targetFor(l) {
    var alt = document.querySelector('link[rel="alternate"][hreflang="' + l + '"]');
    if (alt) {
      try { return new URL(alt.getAttribute('href'), location.origin).pathname; }
      catch (e) { return alt.getAttribute('href'); }
    }
    if (l === 'de') return basePath();
    return '/' + l + '/';
  }
  function setLabel(l) {
    if (codeEl) codeEl.textContent = l.toUpperCase();
    btn.setAttribute('aria-label', 'Sprache wählen – aktuell ' + LANGS[l]);
    menu.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-current', b.dataset.lang === l ? 'true' : 'false');
    });
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = sw.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function () {
    sw.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') sw.classList.remove('is-open'); });
  menu.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var l = b.dataset.lang;
      if (l !== currentLang()) location.href = targetFor(l);
    });
  });

  setLabel(currentLang());
})();

// Generische Inline-Formulare: Absendung im Hintergrund (no-cors), danach
// Formular ausblenden und das per data-inline-success referenzierte Element zeigen,
// statt auf FormSubmit/Brevos Rohseite zu landen. Nutzung: <form data-inline-success="idOfSuccessBox">
(function () {
  document.querySelectorAll('form[data-inline-success]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hp = form.querySelector('.cform__hp');
      if (hp && hp.value) return;
      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      try { fetch(form.action, { method: 'POST', mode: 'no-cors', body: new FormData(form) }); } catch (_) {}
      form.style.display = 'none';
      var successEl = document.getElementById(form.getAttribute('data-inline-success'));
      if (successEl) { successEl.hidden = false; successEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
  });
})();

// Wasserhaerte-Selbsttest: live auswerten und passenden CTA einblenden.
// Nutzung: <div data-water-checklist> mit Checkboxen, danach <div data-water-result>
// mit [data-water-count], [data-water-text], [data-water-cta] als Kinder.
(function () {
  document.querySelectorAll('[data-water-checklist]').forEach(function (list) {
    var result = list.parentElement.querySelector('[data-water-result]');
    if (!result) return;
    var countEl = result.querySelector('[data-water-count]');
    var textEl = result.querySelector('[data-water-text]');
    var ctaEl = result.querySelector('[data-water-cta]');
    var boxes = list.querySelectorAll('input[type="checkbox"]');
    function update() {
      var n = 0;
      boxes.forEach(function (b) { if (b.checked) n++; });
      if (countEl) countEl.textContent = n;
      if (n === 0) {
        if (textEl) textEl.textContent = 'Klick oben die zutreffenden Punkte an, um dein Ergebnis zu sehen.';
        if (ctaEl) ctaEl.innerHTML = '';
      } else if (n <= 2) {
        if (textEl) textEl.textContent = 'Dein Wasser ist wahrscheinlich eher weich, aktuell vermutlich kein akuter Handlungsbedarf.';
        if (ctaEl) ctaEl.innerHTML = '<a href="/wasserwissen" class="btn btn--ghost">Weitere Artikel im Wasserwissen</a>';
      } else if (n <= 5) {
        if (textEl) textEl.textContent = 'Mittlere Wasserhärte, das lohnt sich zu beobachten, bevor Kalk zum teuren Problem wird.';
        if (ctaEl) ctaEl.innerHTML = '<a href="/wasseraufbereitung" class="btn btn--ghost">Mehr über Wasseraufbereitung</a>';
      } else {
        if (textEl) textEl.textContent = 'Hohe Wahrscheinlichkeit für hartes Wasser, jetzt lohnt sich ein genauerer Blick.';
        if (ctaEl) ctaEl.innerHTML = '<a href="/#produkte" class="btn btn--primary">Passendes TESL® II Modell finden</a> <a href="/kontakt#anfrage" class="btn btn--ghost">Kostenlose Beratung</a>';
      }
    }
    boxes.forEach(function (b) { b.addEventListener('change', update); });
    update();
  });
})();
