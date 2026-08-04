(() => {
  const image = document.querySelector('.hero-editorial-image');
  const frame = image?.closest('.hero-editorial-frame');
  if (!image || !frame) return;

  frame.style.backgroundImage = 'none';
  frame.style.backgroundColor = '#0b0907';

  image.hidden = false;
  image.removeAttribute('aria-hidden');
  image.alt = 'Livro aberto com caneta-tinteiro em uma biblioteca';
  image.decoding = 'async';
  image.style.display = 'block';
  image.style.width = '100%';
  image.style.height = '100%';
  image.style.objectFit = 'cover';
  image.style.objectPosition = 'center';
  image.style.opacity = '1';
  image.src = 'hero-editorial-v2.webp?v=20260804i';
})();
