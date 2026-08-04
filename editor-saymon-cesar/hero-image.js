(() => {
  const image = document.querySelector('.hero-editorial-image');
  const frame = image?.closest('.hero-editorial-frame');
  if (!image || !frame) return;

  const version = '20260804h';
  const rawBase = 'https://raw.githubusercontent.com/fantasticoseditora/copa-apocrifos/main/editor-saymon-cesar/.hero-build';
  const parts = [
    `${rawBase}/mobile-01.txt?v=${version}`,
    `${rawBase}/mobile-02.txt?v=${version}`,
    `${rawBase}/mobile-03.txt?v=${version}`,
    `${rawBase}/mobile-04.txt?v=${version}`
  ];

  frame.style.backgroundImage = 'none';
  frame.style.backgroundColor = '#0b0907';
  image.hidden = true;
  image.alt = '';
  image.removeAttribute('src');
  image.style.opacity = '0';
  image.style.width = '100%';
  image.style.height = '100%';
  image.style.objectFit = 'cover';
  image.style.objectPosition = 'center';

  function revealPhoto(source) {
    image.onload = () => {
      image.hidden = false;
      image.style.opacity = '1';
      image.alt = 'Livro aberto com caneta-tinteiro em uma biblioteca';
      frame.style.backgroundImage = 'none';
    };
    image.onerror = () => {
      image.hidden = true;
      image.alt = '';
      frame.style.backgroundImage = 'none';
    };
    image.src = source;
  }

  Promise.all(
    parts.map(async (url) => {
      const response = await fetch(url, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`Falha ao carregar ${url}`);
      return response.text();
    })
  )
    .then((chunks) => {
      const base64 = chunks.join('').replace(/\s+/g, '');
      if (!base64.startsWith('UklG')) throw new Error('Dados da imagem inválidos');
      revealPhoto(`data:image/webp;base64,${base64}`);
    })
    .catch((error) => {
      console.error('Falha ao carregar a fotografia editorial.', error);
      revealPhoto(`hero-editorial.webp?v=${version}`);
    });
})();
