(() => {
  const image = document.querySelector('.hero-editorial-image');
  if (!image) return;

  const mobileQuery = window.matchMedia('(max-width: 700px)');

  function loadResponsiveImage() {
    const source = mobileQuery.matches
      ? 'hero-editorial-v2.webp?v=20260804b'
      : 'hero-editorial.webp?v=20260804b';

    if (image.dataset.responsiveSource === source) return;

    image.dataset.responsiveSource = source;
    image.decoding = 'async';
    image.src = source;
  }

  loadResponsiveImage();

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', loadResponsiveImage);
  } else {
    mobileQuery.addListener(loadResponsiveImage);
  }
})();
