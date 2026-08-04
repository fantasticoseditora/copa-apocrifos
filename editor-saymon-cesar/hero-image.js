(() => {
  const image = document.querySelector('.hero-editorial-image');
  if (!image) return;

  const mobileSource = 'hero-editorial-mobile.svg?v=20260804e';
  const desktopSource = 'hero-editorial.webp?v=20260804e';
  const mobileQuery = window.matchMedia('(max-width: 700px)');

  function applySource() {
    const nextSource = mobileQuery.matches ? mobileSource : desktopSource;
    if (!image.src.endsWith(nextSource)) image.src = nextSource;
  }

  image.decoding = 'async';
  image.addEventListener('error', () => {
    image.src = mobileSource;
  }, { once: true });

  applySource();

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', applySource);
  } else {
    mobileQuery.addListener(applySource);
  }
})();
