(() => {
  const image = document.querySelector('.hero-editorial-image');
  const frame = image?.closest('.hero-editorial-frame');
  if (!image || !frame) return;

  const mobileSource = 'hero-editorial-mobile.svg?v=20260804f';
  const desktopSource = 'hero-editorial.webp?v=20260804f';
  const mobileQuery = window.matchMedia('(max-width: 700px)');

  function useMobileArtwork() {
    image.hidden = true;
    image.setAttribute('aria-hidden', 'true');
    frame.style.backgroundImage = `url("${mobileSource}")`;
    frame.style.backgroundPosition = 'center';
    frame.style.backgroundRepeat = 'no-repeat';
    frame.style.backgroundSize = 'cover';
  }

  function useDesktopArtwork() {
    image.hidden = false;
    image.removeAttribute('aria-hidden');
    frame.style.backgroundImage = `url("${desktopSource}")`;
    frame.style.backgroundPosition = 'center';
    frame.style.backgroundRepeat = 'no-repeat';
    frame.style.backgroundSize = 'cover';
    image.src = desktopSource;
  }

  function applyResponsiveArtwork() {
    if (mobileQuery.matches) useMobileArtwork();
    else useDesktopArtwork();
  }

  image.decoding = 'async';
  image.addEventListener('error', useMobileArtwork);
  applyResponsiveArtwork();

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', applyResponsiveArtwork);
  } else {
    mobileQuery.addListener(applyResponsiveArtwork);
  }
})();
