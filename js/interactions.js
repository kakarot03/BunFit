(function initInteractions() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  // ---- Scroll-driven body background transition ----
  const sections = document.querySelectorAll('section[data-bg]');

  function updateBodyBg() {
    const scrollMid = window.scrollY + window.innerHeight * 0.4;
    let activeBg = '#FFFFFF';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollMid) activeBg = sec.dataset.bg || activeBg;
    });
    document.body.style.backgroundColor = activeBg;
  }

  window.addEventListener('scroll', updateBodyBg, { passive: true });

  // ---- WhatsApp FAB visibility ----
  const waFab = document.getElementById('wa-fab');

  function updateFab() {
    if (isMobile) return; // always visible on mobile via CSS
    waFab.classList.toggle('visible', window.scrollY > 200);
  }

  window.addEventListener('scroll', updateFab, { passive: true });
  if (isMobile) waFab.classList.add('visible');

  // ---- Confetti burst (pure JS + CSS) ----
  const CONFETTI_COLORS = ['#3B1F0A', '#F5ECD7', '#C9873A', '#FFFFFF', '#7B4A2D'];

  function fireConfetti(originEl) {
    if (prefersReduced) return;
    const { left, top, width, height } = originEl.getBoundingClientRect();
    const ox = left + width / 2;
    const oy = top  + height / 2;

    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const size  = 4 + Math.random() * 4;
      const angle = Math.random() * 360;
      const dist  = 60 + Math.random() * 120;
      const tx    = Math.cos(angle * Math.PI / 180) * dist;
      const ty    = Math.sin(angle * Math.PI / 180) * dist - 40;
      const rot   = (Math.random() - 0.5) * 720;
      piece.style.cssText = `
        left:${ox}px; top:${oy}px;
        width:${size}px; height:${size}px;
        background:${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        --tx:${tx}px; --ty:${ty}px; --rot:${rot}deg;
      `;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 900);
    }
  }

  function waClickHandler(e, btn) {
    e.preventDefault();
    fireConfetti(btn);
    setTimeout(() => window.open('https://wa.me/919498070073', '_blank', 'noopener'), 400);
  }

  document.getElementById('wa-hero-btn')?.addEventListener('click', (e) => waClickHandler(e, e.currentTarget));
  document.getElementById('wa-contact-btn')?.addEventListener('click', (e) => waClickHandler(e, e.currentTarget));
  waFab?.addEventListener('click', (e) => waClickHandler(e, e.currentTarget));

  // ---- Logo easter egg ----
  const logoContainer = document.getElementById('logo-container');
  let clickCount = 0, clickTimer = null, triggered = false;

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  logoContainer?.addEventListener('click', () => {
    if (triggered) return;
    if (clickTimer) clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
    if (++clickCount >= 5) {
      triggered = true;
      clickCount = 0;
      showToast('🎉 You found the secret — come visit us and mention this!');
    }
  });

  // ---- Floating cream particles in About section ----
  const aboutSection = document.getElementById('about');
  if (aboutSection) {
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size     = 4 + Math.random() * 10;
      const duration = 8 + Math.random() * 12;
      const delay    = Math.random() * 15;
      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%; bottom:${Math.random() * 60}px;
        animation-duration:${duration}s; animation-delay:-${delay}s;
      `;
      aboutSection.appendChild(p);
    }
  }

  // ---- Section reveal + heading colour flash (IntersectionObserver) ----
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);

      setTimeout(() => {
        el.classList.add('visible');

        // One-time heading colour flash
        if (el.classList.contains('reveal-heading') && !el.dataset.flashed && !prefersReduced) {
          el.dataset.flashed = 'true';
          el.style.transition = 'opacity 0.6s, transform 0.6s, color 0.6s';
          el.style.color = '#C9873A';
          setTimeout(() => { el.style.color = ''; el.style.transition = ''; }, 600);
        }
      }, delay);

      revealObserver.unobserve(el);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-heading, .reveal-card').forEach((el, i) => {
    if (el.classList.contains('reveal-card')) el.dataset.delay = String(i * 80);
    revealObserver.observe(el);
  });

  // Contact section slide-in
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        slideObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.slide-left, .slide-right').forEach(el => slideObserver.observe(el));
})();
