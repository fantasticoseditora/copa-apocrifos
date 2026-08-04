(() => {
  const image = document.querySelector('.hero-editorial-image');
  if (!image) return;

  const mobileQuery = window.matchMedia('(max-width: 700px)');
  const desktopSource = 'hero-editorial.webp?v=20260804d';
  const mobileParts = [
    'hero-mobile/part01.txt',
    'hero-mobile/part02.txt',
    'hero-mobile/part03.txt',
    'hero-mobile/part04.txt',
    'hero-mobile/part05.txt'
  ];

  let mobileDataUrl = '';
  let requestToken = 0;

  async function loadMobileImage() {
    if (mobileDataUrl) return mobileDataUrl;

    const parts = await Promise.all(
      mobileParts.map(async (path) => {
        const response = await fetch(`${path}?v=20260804d`, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`Falha ao carregar ${path}`);
        return response.text();
      })
    );

    mobileDataUrl = `data:image/webp;base64,${parts.join('').replace(/\s+/g, '')}`;
    return mobileDataUrl;
  }

  async function applyResponsiveImage() {
    const token = ++requestToken;

    if (!mobileQuery.matches) {
      image.src = desktopSource;
      return;
    }

    try {
      const source = await loadMobileImage();
      if (token === requestToken && mobileQuery.matches) image.src = source;
    } catch (error) {
      console.error('Não foi possível carregar a imagem mobile em alta resolução.', error);
      if (token === requestToken) image.src = desktopSource;
    }
  }

  image.decoding = 'async';
  applyResponsiveImage();

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', applyResponsiveImage);
  } else {
    mobileQuery.addListener(applyResponsiveImage);
  }
})();
