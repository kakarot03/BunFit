(function initCursor() {
  const isMobile = window.innerWidth < 768;
  if (isMobile) return;

  const cursor = document.getElementById('cursor');
  let cursorX = 0, cursorY = 0, mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.querySelectorAll('.hoverable, a, button, [role="button"]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
  });

  function tick() {
    cursorX += (mouseX - cursorX) * 0.12;
    cursorY += (mouseY - cursorY) * 0.12;
    cursor.style.left = cursorX + 'px';
    cursor.style.top  = cursorY + 'px';
    requestAnimationFrame(tick);
  }

  tick();
})();
