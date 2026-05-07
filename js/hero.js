(function initHero() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  // Mobile hint text
  const hint = document.getElementById('hero-hint');
  if (hint && isMobile) hint.textContent = 'Tap the buns ↑';

  // Typewriter tagline
  const taglineEl = document.getElementById('hero-tagline');
  // EDIT: tagline text
  const taglineText = "Chennai's boldest bun. Zero compromise.";

  function startTypewriter() {
    if (prefersReduced) {
      taglineEl.textContent = taglineText;
      taglineEl.classList.add('typing-done');
      return;
    }
    let idx = 0;
    const interval = setInterval(() => {
      taglineEl.textContent = taglineText.slice(0, ++idx);
      if (idx >= taglineText.length) {
        clearInterval(interval);
        setTimeout(() => taglineEl.classList.add('typing-done'), 1200);
      }
    }, 55);
  }

  // Start after heading letters have dropped (90ms × 7 letters + buffer)
  setTimeout(startTypewriter, 700);

  // Idle pulse on hero letters after drop animation completes
  if (!prefersReduced) {
    setTimeout(() => {
      document.querySelectorAll('.hero-letter').forEach(l => l.classList.add('pulse-idle'));
    }, 1400);
  }
})();
