(() => {
  const styles = document.createElement('style');
  styles.textContent = `
    .hero h1 {
      line-height: .98 !important;
    }

    .hero h1 br {
      display: none;
    }

    .hero h1 em {
      display: block;
      margin-top: .08em;
    }

    .hero-art {
      min-height: 0 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: none !important;
    }

    .hero-editorial-frame {
      position: relative;
      width: 100%;
      overflow: hidden;
      border: 1px solid rgba(216,181,106,.34);
      border-radius: 24px;
      background: #0b0907;
      box-shadow: 0 32px 70px rgba(0,0,0,.48);
    }

    .hero-editorial-frame::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(135deg, rgba(216,181,106,.13), transparent 38%, rgba(0,0,0,.16));
    }

    .hero-editorial-image {
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: cover;
      object-position: center;
    }

    @media (max-width: 820px) {
      .hero-grid {
        gap: 34px !important;
      }

      .hero-art {
        width: 100%;
        margin-top: 4px;
      }

      .hero-editorial-frame {
        max-width: 620px;
        margin-inline: auto;
        border-radius: 20px;
      }

      .about-grid {
        gap: 34px !important;
      }

      .portrait {
        width: min(72vw, 280px) !important;
        max-width: 280px !important;
        margin: 0 auto 10px !important;
      }

      .portrait img {
        width: 100%;
        height: auto;
        aspect-ratio: 4 / 5;
        object-fit: cover;
        object-position: center 28%;
      }

      .portrait::before {
        inset: -10px 12px 12px -10px !important;
      }

      .portrait-caption {
        right: -8px !important;
        bottom: 12px !important;
        padding: 9px 11px !important;
        font-size: .72rem;
      }
    }

    @media (max-width: 620px) {
      .hero h1 {
        line-height: 1 !important;
        letter-spacing: -.035em !important;
      }

      .hero h1 em {
        margin-top: .11em;
      }

      .hero-editorial-image {
        aspect-ratio: 16 / 11;
      }

      .portrait {
        width: min(68vw, 250px) !important;
        max-width: 250px !important;
      }
    }
  `;
  document.head.appendChild(styles);

  const heroArt = document.querySelector('.hero-art');
  if (heroArt) {
    heroArt.innerHTML = `
      <figure class="hero-editorial-frame">
        <img
          class="hero-editorial-image"
          src="hero-editorial.webp"
          alt="Livro aberto sobre uma mesa, acompanhado de caneta e outros volumes, em uma composição editorial elegante"
          width="900"
          height="675"
          fetchpriority="high"
        >
      </figure>
    `;
    heroArt.setAttribute('aria-label', 'Composição editorial com livros e caneta-tinteiro');
  }

  const fixAssessmentText = () => {
    document.querySelectorAll('.flow h3').forEach((heading) => {
      if (heading.textContent.trim() === 'Envia o primeiro capítulo') {
        heading.textContent = 'Envie o primeiro capítulo';
      }
    });
  };

  const fixTestimonials = () => {
    const cards = [...document.querySelectorAll('.testimonial-card')];
    if (cards.length < 3) return false;

    cards.forEach((card) => {
      const role = card.querySelector('.testimonial-person p')?.textContent || '';
      const name = card.querySelector('.testimonial-person h3');
      const image = card.querySelector('.testimonial-avatar');

      if (/Selene/i.test(role)) {
        card.style.order = '1';
        if (name) name.textContent = 'Rafael A. F. Silva';
        if (image) image.alt = 'Foto de Rafael A. F. Silva';
      } else if (/Universo Heróis Fantásticos/i.test(role)) {
        card.style.order = '2';
        if (name) name.textContent = 'Thalles Waichert';
        if (image) image.alt = 'Foto de Thalles Waichert';
      } else if (/Legado Grayson/i.test(role)) {
        card.style.order = '3';
        if (name) name.textContent = 'Mayara Oliveira';
        if (image) image.alt = 'Foto de Mayara Oliveira';
      }
    });

    const track = document.querySelector('.testimonial-track');
    if (track) track.scrollLeft = 0;
    return true;
  };

  fixAssessmentText();

  if (!fixTestimonials()) {
    const observer = new MutationObserver(() => {
      fixAssessmentText();
      if (fixTestimonials()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 5000);
  }
})();
