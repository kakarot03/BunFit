(function initFounders() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Slide-in founder cards from opposite sides
  const founderObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        founderObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.founder-card').forEach(card => founderObserver.observe(card));

  // Stat counters count-up animation
  function easeOutQuad(t) { return t * (2 - t); }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1500;
    const start    = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOutQuad(progress) * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }

    requestAnimationFrame(tick);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.stat-number').forEach(el => {
        if (prefersReduced) el.textContent = el.dataset.target;
        else animateCounter(el);
      });
      statsObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  const statsEl = document.getElementById('founders-stats');
  if (statsEl) statsObserver.observe(statsEl);
})();
