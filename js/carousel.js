(function initCarousel() {
  const track        = document.getElementById('menu-track');
  const caption      = document.getElementById('menu-caption');
  const progressFill = document.getElementById('carousel-progress');
  const prevBtn      = document.getElementById('carousel-prev');
  const nextBtn      = document.getElementById('carousel-next');

  if (!track) return;

  // Inject sesame seeds into dark bun domes
  function addSesameSeeds(domeEl) {
    if (!domeEl) return;
    for (let i = 0; i < 12; i++) {
      const seed = document.createElement('div');
      seed.className = 'sesame-seed';
      const size = 4 + Math.random() * 2;
      seed.style.cssText = `
        width:${size}px; height:${size}px;
        left:${10 + Math.random() * 80}%;
        top:${5 + Math.random() * 45}%;
      `;
      domeEl.appendChild(seed);
    }
  }

  addSesameSeeds(document.getElementById('oreo-dome'));
  addSesameSeeds(document.getElementById('choco-dome'));

  // Update caption + progress bar based on scroll position
  function updateCaption() {
    const cards = track.querySelectorAll('.menu-card');
    const trackRect = track.getBoundingClientRect();
    let activeCard = cards[0], minDist = Infinity;

    cards.forEach(card => {
      const dist = Math.abs(card.getBoundingClientRect().left - trackRect.left);
      if (dist < minDist) { minDist = dist; activeCard = card; }
    });

    const newCaption = activeCard.dataset.caption || '';
    if (caption && caption.textContent !== newCaption) {
      caption.style.opacity = '0';
      setTimeout(() => {
        caption.textContent = newCaption;
        caption.style.opacity = '1';
      }, 200);
    }

    const maxScroll = track.scrollWidth - track.clientWidth;
    if (progressFill) {
      progressFill.style.width = maxScroll > 0
        ? (track.scrollLeft / maxScroll * 100) + '%'
        : '0%';
    }
  }

  track.addEventListener('scroll', updateCaption, { passive: true });

  // Prev / next buttons
  function scrollByCard(dir) {
    const cardWidth = (track.querySelector('.menu-card')?.offsetWidth ?? 280) + 24;
    track.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
  }

  prevBtn?.addEventListener('click', () => scrollByCard(-1));
  nextBtn?.addEventListener('click', () => scrollByCard(1));

  // Drag-to-scroll (desktop)
  let isDragging = false, startX = 0, scrollStart = 0;

  track.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - track.offsetLeft;
    scrollStart = track.scrollLeft;
    track.style.cursor = 'grabbing';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    if (track) track.style.cursor = 'grab';
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    track.scrollLeft = scrollStart - (e.pageX - track.offsetLeft - startX);
  });

  // 3D tilt on card hover
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  track.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (prefersReduced) return;
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (e.clientX - left) / width  - 0.5;
      const y = (e.clientY - top)  / height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) scale(1.03)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  // Tea card steam speed-up on hover
  const teaCardInner = document.getElementById('tea-card-inner');
  const teaCard = teaCardInner?.closest('.menu-card');
  if (teaCard && teaCardInner) {
    teaCard.addEventListener('mouseenter', () => teaCardInner.classList.add('steaming-fast'));
    teaCard.addEventListener('mouseleave', () => teaCardInner.classList.remove('steaming-fast'));
  }

  // Initial caption render
  updateCaption();
})();
