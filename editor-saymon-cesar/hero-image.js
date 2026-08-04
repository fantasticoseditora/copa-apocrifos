(() => {
  const image = document.querySelector('.hero-editorial-image');
  if (!image) return;

  const source = 'hero-editorial.webp?v=20260804c';

  image.decoding = 'async';
  image.src = source;
  image.removeAttribute('data-responsive-source');
})();
