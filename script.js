/* ─── i18n ──────────────────────────────────────────────── */
let currentLang = localStorage.getItem('lang') || 'ru';

function setLang(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  const t = translations[lang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });

  const list = document.getElementById('bio-lines');
  if (list && t.bio_text_lines) {
    list.innerHTML = t.bio_text_lines.map(line => `<li>${line}</li>`).join('');
    initTimelineAnim();
  }

  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
}

/* ─── Timeline stagger ──────────────────────────────────── */
function initTimelineAnim() {
  const items = document.querySelectorAll('.timeline li');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = [...items].indexOf(e.target);
        setTimeout(() => e.target.classList.add('tl-visible'), idx * 80);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  items.forEach(li => { li.classList.remove('tl-visible'); io.observe(li); });
}

/* ─── Reveal ────────────────────────────────────────────── */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ─── Lightbox ──────────────────────────────────────────── */
const galleryPhotos = [
  "фото/2026-03-18 21.49.04.jpg",
  "фото/2026-03-18 21.52.49.jpg",
  "фото/2026-03-18 21.52.53.jpg",
  "фото/2026-03-18 21.52.57.jpg"
];
let lbIdx = 0;

function initLightbox() {
  const lb    = document.getElementById('lightbox');
  const img   = document.getElementById('lbImg');
  const close = document.getElementById('lbClose');
  const prev  = document.getElementById('lbPrev');
  const next  = document.getElementById('lbNext');

  document.querySelectorAll('.gallery-item').forEach((item, i) => {
    item.addEventListener('click', () => openLb(i));
  });

  close.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  prev.addEventListener('click', () => { lbIdx = (lbIdx - 1 + galleryPhotos.length) % galleryPhotos.length; img.src = galleryPhotos[lbIdx]; });
  next.addEventListener('click', () => { lbIdx = (lbIdx + 1) % galleryPhotos.length; img.src = galleryPhotos[lbIdx]; });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLb();
    if (e.key === 'ArrowLeft')  { lbIdx = (lbIdx - 1 + galleryPhotos.length) % galleryPhotos.length; img.src = galleryPhotos[lbIdx]; }
    if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % galleryPhotos.length; img.src = galleryPhotos[lbIdx]; }
  });

  function openLb(idx) {
    lbIdx = idx;
    img.src = galleryPhotos[idx];
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ─── Active nav ────────────────────────────────────────── */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => io.observe(s));
}

/* ─── Burger ────────────────────────────────────────────── */
function initBurger() {
  const btn = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

/* ─── Header shrink on scroll ───────────────────────────── */
function initHeaderScroll() {
  const h = document.getElementById('header');
  window.addEventListener('scroll', () => {
    h.style.background = window.scrollY > 40
      ? 'rgba(10,10,12,.97)'
      : 'rgba(10,10,12,.8)';
  }, { passive: true });
}

/* ─── Splash ────────────────────────────────────────────── */
function initSplash() {
  const splash   = document.getElementById('splash');
  const progress = document.getElementById('splashProgress');
  const bar      = document.getElementById('spBar');
  const audio    = document.getElementById('splashAudio');
  if (!splash) return;

  let started = false;

  function startSplash() {
    if (started) return;
    started = true;
    splash.style.cursor = '';

    audio.currentTime = 0;
    audio.volume = 0.85;
    audio.play().catch(() => {});

    progress.classList.add('show');
    requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = '100%'; }));

    setTimeout(() => {
      audio.pause();
      splash.classList.add('hide');
      document.body.classList.remove('no-scroll');
      setTimeout(() => splash.remove(), 900);
    }, 4000);
  }

  /* Try immediate autoplay */
  audio.volume = 0.85;
  audio.play().then(() => {
    /* Browser allowed autoplay — restart cleanly via startSplash */
    audio.pause();
    audio.currentTime = 0;
    startSplash();
  }).catch(() => {
    /* Blocked — tap anywhere on splash to start */
    splash.style.cursor = 'pointer';
    splash.addEventListener('click', startSplash, { once: true });
  });
}

/* ─── Init ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.addEventListener('click', () => setLang(b.dataset.lang));
  });

  initSplash();
  setLang(currentLang);
  initReveal();
  initLightbox();
  initActiveNav();
  initBurger();
  initHeaderScroll();
});
