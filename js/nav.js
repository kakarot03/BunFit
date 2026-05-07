(function initNav() {
  const nav = document.getElementById('main-nav');
  const scrollProgress = document.getElementById('scroll-progress');

  function onScroll() {
    // Frosted glass nav
    nav.classList.toggle('scrolled', window.scrollY > 60);

    // Scroll progress thread
    const total = document.body.scrollHeight - window.innerHeight;
    scrollProgress.style.width = total > 0 ? (window.scrollY / total * 100) + '%' : '0%';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();
