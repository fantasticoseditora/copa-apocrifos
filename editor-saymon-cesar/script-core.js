(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.main-nav');

  menuButton?.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  menu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      menuButton?.setAttribute('aria-expanded', 'false');
    });
  });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const portrait = document.getElementById('portrait-image');
  if (portrait) portrait.src = 'portrait.webp';

  const dynamicStyles = document.createElement('style');
  dynamicStyles.textContent = `
    .lead-form .form-block {
      margin: 0 0 22px;
      padding: 0;
      border: 0;
    }

    .lead-form .form-block legend,
    .lead-form .block-title {
      display: block;
      width: 100%;
      margin: 0 0 10px;
      color: #241d15;
      font-family: var(--serif);
      font-size: 1.28rem;
      font-weight: 700;
      line-height: 1.15;
    }

    .lead-form .helper {
      display: block;
      margin: -3px 0 12px;
      color: var(--muted);
      font-size: .78rem;
      font-weight: 500;
    }

    .lead-form .choice-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .lead-form .choice-grid.services-list {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .lead-form .choice-card {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      min-height: 54px;
      margin: 0;
      padding: 12px 13px;
      border: 1px solid #d8cdbd;
      border-radius: 11px;
      background: #fdfbf8;
      color: #40372e;
      font-size: .82rem;
      font-weight: 600;
      line-height: 1.35;
      cursor: pointer;
      transition: border-color .2s ease, background .2s ease, transform .2s ease;
    }

    .lead-form .choice-card:hover {
      border-color: var(--gold2);
      background: #fbf4e7;
      transform: translateY(-1px);
    }

    .lead-form .choice-card:has(input:checked) {
      border-color: var(--gold2);
      background: #f5e7c9;
      box-shadow: 0 0 0 2px rgba(216,181,106,.14);
    }

    .lead-form .choice-card input {
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
      margin: 1px 0 0;
      accent-color: #a77d34;
    }

    .lead-form .choice-card span {
      display: block;
    }

    .lead-form .form-error {
      display: none;
      margin: 10px 0 0;
      padding: 10px 12px;
      border-radius: 9px;
      background: #fff0ed;
      color: #8d2d20;
      font-size: .78rem;
      font-weight: 700;
    }

    .lead-form .form-error.visible {
      display: block;
    }

    .lead-form .section-divider {
      height: 1px;
      margin: 5px 0 23px;
      background: #e5dccf;
    }

    .lead-form .consent {
      margin-top: 4px;
    }

    .testimonials {
      position: relative;
      overflow: hidden;
      padding: 100px 0;
      color: #fffdf8;
      background:
        radial-gradient(circle at 88% 15%, rgba(216,181,106,.13), transparent 28%),
        #0b0a08;
    }

    .testimonials::after {
      content: 'SC';
      position: absolute;
      right: -35px;
      top: -55px;
      color: rgba(216,181,106,.055);
      font-family: var(--serif);
      font-size: 20rem;
      line-height: 1;
      pointer-events: none;
    }

    .testimonials .heading {
      position: relative;
      z-index: 2;
      margin-bottom: 35px;
      text-align: left;
    }

    .testimonials .heading h2 {
      margin-left: 0;
      max-width: 760px;
    }

    .testimonials .heading p {
      margin-left: 0;
      color: #cfc5b7;
    }

    .testimonial-toolbar {
      position: relative;
      z-index: 3;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin: -79px 0 31px;
    }

    .testimonial-arrow {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      border: 1px solid rgba(216,181,106,.45);
      border-radius: 50%;
      color: #f2dfb5;
      background: rgba(255,255,255,.035);
      font-size: 1.35rem;
      transition: background .2s ease, color .2s ease, border-color .2s ease;
    }

    .testimonial-arrow:hover:not(:disabled) {
      color: #17120c;
      background: var(--gold);
      border-color: var(--gold);
    }

    .testimonial-arrow:disabled {
      opacity: .35;
      cursor: default;
    }

    .testimonial-track {
      position: relative;
      z-index: 2;
      display: flex;
      gap: 18px;
      overflow-x: auto;
      padding: 2px 2px 10px;
      scroll-behavior: smooth;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      overscroll-behavior-inline: contain;
    }

    .testimonial-track::-webkit-scrollbar {
      display: none;
    }

    .testimonial-card {
      flex: 0 0 calc((100% - 18px) / 2);
      scroll-snap-align: start;
      display: flex;
      flex-direction: column;
      min-width: 0;
      padding: 29px;
      border: 1px solid rgba(216,181,106,.22);
      border-radius: 20px;
      color: #211b14;
      background: linear-gradient(155deg, #fffdf8, #f1e8da);
      box-shadow: 0 24px 60px rgba(0,0,0,.25);
    }

    .testimonial-person {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 20px;
      margin-bottom: 20px;
      border-bottom: 1px solid rgba(103,78,38,.16);
    }

    .testimonial-avatar {
      width: 72px;
      height: 72px;
      flex: 0 0 72px;
      object-fit: cover;
      border: 3px solid #d5b46f;
      border-radius: 50%;
      box-shadow: 0 8px 25px rgba(50,34,12,.18);
    }

    .testimonial-person h3 {
      margin: 0 0 4px;
      font-family: var(--serif);
      font-size: 1.55rem;
      line-height: 1;
    }

    .testimonial-person p {
      margin: 0;
      color: #9a6d28;
      font-size: .8rem;
      font-weight: 700;
      line-height: 1.35;
    }

    .testimonial-quote {
      position: relative;
      flex: 1;
      margin: 0;
      padding-left: 35px;
    }

    .testimonial-quote::before {
      content: '“';
      position: absolute;
      left: 0;
      top: -12px;
      color: #b68738;
      font-family: Georgia, serif;
      font-size: 3.2rem;
      line-height: 1;
    }

    .testimonial-copy {
      position: relative;
      max-height: 15.8rem;
      overflow: hidden;
      font-size: .97rem;
      line-height: 1.7;
      transition: max-height .35s ease;
    }

    .testimonial-copy:not(.expanded)::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 54px;
      background: linear-gradient(transparent, #f3ebdf 82%);
      pointer-events: none;
    }

    .testimonial-copy.expanded {
      max-height: 1000px;
    }

    .testimonial-copy.expanded::after {
      display: none;
    }

    .testimonial-toggle {
      align-self: flex-start;
      margin: 17px 0 0 35px;
      padding: 0;
      border: 0;
      color: #92651f;
      background: none;
      font-size: .78rem;
      font-weight: 800;
      text-decoration: underline;
      text-underline-offset: 4px;
    }

    .testimonial-toggle[hidden] {
      display: none;
    }

    .testimonial-pagination {
      position: relative;
      z-index: 3;
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 24px;
    }

    .testimonial-dot {
      width: 8px;
      height: 8px;
      padding: 0;
      border: 0;
      border-radius: 999px;
      background: rgba(255,255,255,.28);
      transition: width .2s ease, background .2s ease;
    }

    .testimonial-dot.active {
      width: 28px;
      background: var(--gold);
    }

    @media (max-width: 760px) {
      .testimonial-toolbar {
        margin: 0 0 22px;
        justify-content: flex-start;
      }

      .testimonial-card {
        flex-basis: 100%;
        padding: 24px;
      }
    }

    @media (max-width: 620px) {
      .lead-form .choice-grid,
      .lead-form .choice-grid.services-list {
        grid-template-columns: 1fr;
      }

      .testimonials {
        padding: 72px 0;
      }

      .testimonials::after {
        font-size: 12rem;
      }

      .testimonial-person {
        align-items: flex-start;
      }

      .testimonial-avatar {
        width: 62px;
        height: 62px;
        flex-basis: 62px;
      }

      .testimonial-person h3 {
        font-size: 1.34rem;
      }

      .testimonial-copy {
        font-size: .92rem;
      }
    }
  `;
  document.head.appendChild(dynamicStyles);

  const testimonials = [
    {
      name: 'Maiara Oliveira',
      role: 'Autora de O Legado Grayson',
      avatar: 'avatar-maiara.webp',
      text: 'O Saymon faz muito mais do que editar um texto: ele entende a essência da história. Suas sugestões são sempre bem fundamentadas e respeitam a identidade da obra e a voz do autor. Trabalhar com ele tem feito toda a diferença no desenvolvimento do meu livro. Sou muito grata por todo o cuidado e recomendo seu trabalho com total confiança.'
    },
    {
      name: 'Rafael A. F. Silva',
      role: 'Autor de Selene',
      avatar: 'avatar-rafael.webp',
      text: 'O Saymon foi bastante importante na criação dos meus livros, pois me deu a orientação necessária para transformar ideias soltas em uma história que, além de tudo, possa ser atraente para os leitores. Sem falar em toda a parte de revisão e na parte burocrática para que esse sonho de escrever e lançar um livro vire realidade, e em todo o suporte posterior com as redes sociais.'
    },
    {
      name: 'Thales Weischer',
      role: 'Contista do Universo Heróis Fantásticos',
      avatar: 'avatar-thales.webp',
      text: 'Saymon é um caso raro que equilibra escuta ativa e feedbacks precisos. Analisar o texto de outra pessoa requer uma dose balanceada de empatia e objetividade. É isso que sempre encontro nele. Empatia porque quem escreve coloca muito de si em suas palavras. E objetividade porque ele sabe te orientar com técnicas e ferramentas para sua história se tornar interessante não só para você mesmo, mas também para outras pessoas. Antes de conhecer o Saymon, eu ouvia algumas pessoas me dizerem que eu tenho talento para a escrita. A parceria com ele tem me ajudado a desenvolver o que preciso para usar esse talento. Ele tem a habilidade rara de mostrar minhas falhas e ainda sair com um “muito obrigado!”. Isso porque a edição dele sempre mostra um caminho para seguir, uma possível versão ainda melhor daquele texto.'
    }
  ];

  function insertTestimonials() {
    const formSection = document.querySelector('.form-section');
    if (!formSection || document.getElementById('depoimentos')) return;

    const section = document.createElement('section');
    section.className = 'testimonials';
    section.id = 'depoimentos';
    section.setAttribute('aria-labelledby', 'testimonial-title');
    section.innerHTML = `
      <div class="container">
        <div class="heading">
          <span class="kicker">Depoimentos</span>
          <h2 id="testimonial-title">O que alguns autores dizem</h2>
          <p>Experiências de autores que já receberam minha orientação editorial e desenvolveram seus projetos comigo.</p>
        </div>
        <div class="testimonial-toolbar" aria-label="Controles do carrossel">
          <button class="testimonial-arrow testimonial-prev" type="button" aria-label="Depoimento anterior">←</button>
          <button class="testimonial-arrow testimonial-next" type="button" aria-label="Próximo depoimento">→</button>
        </div>
        <div class="testimonial-track" tabindex="0" aria-label="Depoimentos de autores">
          ${testimonials.map((item, index) => `
            <article class="testimonial-card" aria-label="Depoimento de ${item.name}">
              <div class="testimonial-person">
                <img class="testimonial-avatar" src="${item.avatar}" alt="Foto de ${item.name}" width="180" height="180" loading="lazy">
                <div>
                  <h3>${item.name}</h3>
                  <p>${item.role}</p>
                </div>
              </div>
              <blockquote class="testimonial-quote">
                <div class="testimonial-copy" id="testimonial-copy-${index}">${item.text}</div>
              </blockquote>
              <button class="testimonial-toggle" type="button" aria-expanded="false" aria-controls="testimonial-copy-${index}">Ler depoimento completo</button>
            </article>
          `).join('')}
        </div>
        <div class="testimonial-pagination" aria-label="Indicadores do carrossel"></div>
      </div>
    `;

    formSection.insertAdjacentElement('beforebegin', section);

    const track = section.querySelector('.testimonial-track');
    const cards = Array.from(section.querySelectorAll('.testimonial-card'));
    const previous = section.querySelector('.testimonial-prev');
    const next = section.querySelector('.testimonial-next');
    const pagination = section.querySelector('.testimonial-pagination');
    let currentPage = 0;

    function visibleCards() {
      return window.matchMedia('(max-width: 760px)').matches ? 1 : 2;
    }

    function pageCount() {
      return Math.max(1, cards.length - visibleCards() + 1);
    }

    function cardStep() {
      if (!cards[0]) return 0;
      return cards[0].getBoundingClientRect().width + 18;
    }

    function drawDots() {
      const total = pageCount();
      currentPage = Math.min(currentPage, total - 1);
      pagination.innerHTML = Array.from({ length: total }, (_, index) => `
        <button class="testimonial-dot${index === currentPage ? ' active' : ''}" type="button" aria-label="Ir para a posição ${index + 1}" data-page="${index}"></button>
      `).join('');

      pagination.querySelectorAll('.testimonial-dot').forEach((dot) => {
        dot.addEventListener('click', () => goToPage(Number(dot.dataset.page)));
      });
      updateControls();
    }

    function updateControls() {
      const total = pageCount();
      previous.disabled = currentPage <= 0;
      next.disabled = currentPage >= total - 1;
      pagination.querySelectorAll('.testimonial-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentPage);
      });
    }

    function goToPage(page) {
      const total = pageCount();
      currentPage = Math.max(0, Math.min(page, total - 1));
      track.scrollTo({ left: currentPage * cardStep(), behavior: 'smooth' });
      updateControls();
    }

    previous.addEventListener('click', () => goToPage(currentPage - 1));
    next.addEventListener('click', () => goToPage(currentPage + 1));

    let scrollTimer;
    track.addEventListener('scroll', () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        const step = cardStep();
        if (step) currentPage = Math.min(pageCount() - 1, Math.max(0, Math.round(track.scrollLeft / step)));
        updateControls();
      }, 90);
    }, { passive: true });

    section.querySelectorAll('.testimonial-toggle').forEach((button) => {
      const copy = document.getElementById(button.getAttribute('aria-controls'));
      requestAnimationFrame(() => {
        if (copy.scrollHeight <= copy.clientHeight + 3) button.hidden = true;
      });

      button.addEventListener('click', () => {
        const expanded = copy.classList.toggle('expanded');
        button.setAttribute('aria-expanded', String(expanded));
        button.textContent = expanded ? 'Recolher depoimento' : 'Ler depoimento completo';
      });
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        drawDots();
        goToPage(currentPage);
      }, 120);
    });

    drawDots();
  }

  insertTestimonials();

  const form = document.getElementById('editorial-form');
  const formIntro = document.querySelector('.form-intro');
  if (!form) return;

  if (formIntro) {
    const title = formIntro.querySelector('h2');
    const paragraph = formIntro.querySelector('p');
    if (title) title.textContent = 'Conte em que estágio está o seu livro';
    if (paragraph) {
      paragraph.textContent = 'Este formulário reúne as informações essenciais para eu entender o projeto antes da nossa conversa. Ao enviar, o WhatsApp será aberto com as respostas organizadas.';
    }
  }

  form.innerHTML = `
    <fieldset class="form-block">
      <legend>Seus dados de contato</legend>
      <span class="helper">Essas informações permitem que eu retorne a sua solicitação e compreenda de qual projeto estamos falando.</span>
      <div class="row">
        <label>Seu nome
          <input name="nome" type="text" autocomplete="name" required>
        </label>
        <label>WhatsApp
          <input name="whatsapp" type="tel" autocomplete="tel" placeholder="(DDD) número" required>
        </label>
      </div>
      <div class="row">
        <label>E-mail
          <input name="email" type="email" autocomplete="email" required>
        </label>
        <label>Título da obra
          <input name="titulo" type="text" required>
        </label>
      </div>
    </fieldset>

    <div class="section-divider" aria-hidden="true"></div>

    <fieldset class="form-block">
      <legend>O seu livro é de ficção ou não ficção?</legend>
      <div class="choice-grid">
        <label class="choice-card"><input name="tipo" type="radio" value="Ficção" required><span>Ficção</span></label>
        <label class="choice-card"><input name="tipo" type="radio" value="Não ficção" required><span>Não ficção</span></label>
      </div>
    </fieldset>

    <div class="row">
      <label>Gênero ou área da obra
        <input name="genero" type="text" placeholder="Ex.: fantasia, romance, biografia, negócios..." required>
      </label>
      <label>Em que estágio o livro está?
        <select name="estagio" required>
          <option value="">Selecione</option>
          <option>Em andamento</option>
          <option>Original concluído, ainda não publicado</option>
          <option>Em produção editorial</option>
          <option>Pronto para publicação</option>
          <option>Já publicado e precisa de melhorias</option>
        </select>
      </label>
    </div>

    <fieldset class="form-block" id="services-block">
      <legend>Quais destes serviços ou etapas o seu livro já possui?</legend>
      <span class="helper">Marque todos os itens já concluídos ou contratados. Isso evita que eu recomende algo que o projeto não precisa.</span>
      <div class="choice-grid services-list">
        <label class="choice-card"><input name="servicos" type="checkbox" value="Registro de direitos autorais"><span>Registro de direitos autorais</span></label>
        <label class="choice-card"><input name="servicos" type="checkbox" value="ISBN"><span>ISBN</span></label>
        <label class="choice-card"><input name="servicos" type="checkbox" value="Ficha catalográfica"><span>Ficha catalográfica</span></label>
        <label class="choice-card"><input name="servicos" type="checkbox" value="Código de barras"><span>Código de barras</span></label>
        <label class="choice-card"><input name="servicos" type="checkbox" value="Análise crítica editorial"><span>Análise crítica editorial</span></label>
        <label class="choice-card"><input name="servicos" type="checkbox" value="Copydesk ou preparação de texto"><span>Copydesk ou preparação de texto</span></label>
        <label class="choice-card"><input name="servicos" type="checkbox" value="Revisão ortográfica e gramatical"><span>Revisão ortográfica e gramatical</span></label>
        <label class="choice-card"><input name="servicos" type="checkbox" value="Capa"><span>Capa</span></label>
        <label class="choice-card"><input name="servicos" type="checkbox" value="Diagramação"><span>Diagramação</span></label>
        <label class="choice-card"><input name="servicos" type="checkbox" value="Planejamento de marketing"><span>Planejamento de marketing</span></label>
        <label class="choice-card"><input name="servicos" type="checkbox" value="Publicação nas plataformas"><span>Publicação nas plataformas</span></label>
        <label class="choice-card"><input name="servicos" type="checkbox" value="Impressão ou logística de exemplares"><span>Impressão ou logística de exemplares</span></label>
        <label class="choice-card"><input id="no-services" name="servicos" type="checkbox" value="Nenhum desses itens"><span>Nenhum desses itens até o momento</span></label>
      </div>
      <p class="form-error" id="services-error" role="alert">Marque pelo menos uma opção para indicar o estágio do projeto.</p>
    </fieldset>

    <fieldset class="form-block">
      <legend>Qual é o seu principal objetivo na literatura?</legend>
      <div class="choice-grid">
        <label class="choice-card"><input name="objetivo_literario" type="radio" value="Realizar o sonho de publicar o livro" required><span>Realizar o sonho de publicar o meu livro</span></label>
        <label class="choice-card"><input name="objetivo_literario" type="radio" value="Publicar e alcançar uma quantidade maior de leitores" required><span>Publicar e alcançar uma quantidade maior de leitores</span></label>
        <label class="choice-card"><input name="objetivo_literario" type="radio" value="Melhorar um livro já publicado para ampliar leitores e vendas" required><span>Melhorar um livro já publicado para ampliar leitores e vendas</span></label>
      </div>
    </fieldset>

    <fieldset class="form-block">
      <legend>Como você considera publicar o livro?</legend>
      <div class="choice-grid">
        <label class="choice-card"><input name="modelo_publicacao" type="radio" value="Publicação independente" required><span>De forma independente</span></label>
        <label class="choice-card"><input name="modelo_publicacao" type="radio" value="Publicação por editora" required><span>Por uma editora</span></label>
        <label class="choice-card"><input name="modelo_publicacao" type="radio" value="Aberto às duas formas" required><span>Posso considerar as duas formas</span></label>
      </div>
    </fieldset>

    <label>Há alguma informação importante sobre a obra ou sobre o que você procura?
      <textarea name="observacoes" rows="4" placeholder="Conte brevemente o que deseja resolver, melhorar ou alcançar com o projeto."></textarea>
    </label>

    <label class="consent"><input type="checkbox" required><span>Autorizo o contato para tratar desta solicitação editorial.</span></label>

    <div class="form-actions">
      <button class="button button-gold" type="submit">Enviar respostas pelo WhatsApp</button>
      <button class="text-button" type="button" id="email-submit">Prefiro enviar por e-mail</button>
    </div>

    <p class="form-note">Depois do envio, você poderá anexar o primeiro capítulo pelo WhatsApp ou pelo e-mail aberto.</p>
  `;

  const serviceCheckboxes = Array.from(form.querySelectorAll('input[name="servicos"]'));
  const noServices = document.getElementById('no-services');
  const servicesError = document.getElementById('services-error');

  serviceCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      if (checkbox === noServices && checkbox.checked) {
        serviceCheckboxes.forEach((item) => {
          if (item !== noServices) item.checked = false;
        });
      } else if (checkbox !== noServices && checkbox.checked && noServices) {
        noServices.checked = false;
      }
      if (serviceCheckboxes.some((item) => item.checked)) servicesError?.classList.remove('visible');
    });
  });

  function collectData() {
    const formData = new FormData(form);
    return {
      nome: formData.get('nome') || '',
      whatsapp: formData.get('whatsapp') || '',
      email: formData.get('email') || '',
      titulo: formData.get('titulo') || '',
      tipo: formData.get('tipo') || '',
      genero: formData.get('genero') || '',
      estagio: formData.get('estagio') || '',
      servicos: formData.getAll('servicos'),
      objetivoLiterario: formData.get('objetivo_literario') || '',
      modeloPublicacao: formData.get('modelo_publicacao') || '',
      observacoes: formData.get('observacoes') || 'Não informado'
    };
  }

  function validateServices() {
    const hasSelectedService = serviceCheckboxes.some((item) => item.checked);
    servicesError?.classList.toggle('visible', !hasSelectedService);
    if (!hasSelectedService) {
      document.getElementById('services-block')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      serviceCheckboxes[0]?.focus();
    }
    return hasSelectedService;
  }

  function buildMessage(data) {
    return [
      'Olá, Saymon. Quero solicitar uma avaliação editorial inicial.',
      '',
      'DADOS DO AUTOR',
      `Nome: ${data.nome}`,
      `WhatsApp: ${data.whatsapp}`,
      `E-mail: ${data.email}`,
      '',
      'DADOS DA OBRA',
      `Título: ${data.titulo}`,
      `Tipo: ${data.tipo}`,
      `Gênero ou área: ${data.genero}`,
      `Estágio atual: ${data.estagio}`,
      '',
      'ETAPAS QUE O LIVRO JÁ POSSUI',
      data.servicos.map((item) => `• ${item}`).join('\n'),
      '',
      'OBJETIVO LITERÁRIO',
      data.objetivoLiterario,
      '',
      'FORMA DE PUBLICAÇÃO CONSIDERADA',
      data.modeloPublicacao,
      '',
      'INFORMAÇÕES ADICIONAIS',
      data.observacoes,
      '',
      'Vou anexar o primeiro capítulo nesta conversa.'
    ].join('\n');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity() || !validateServices()) return;
    const message = buildMessage(collectData());
    const url = `https://wa.me/5547997955722?text=${encodeURIComponent(message)}`;
    const newWindow = window.open(url, '_blank', 'noopener');
    if (!newWindow) window.location.href = url;
  });

  document.getElementById('email-submit')?.addEventListener('click', () => {
    if (!form.reportValidity() || !validateServices()) return;
    const data = collectData();
    const subject = encodeURIComponent(`Avaliação editorial — ${data.titulo}`);
    const body = encodeURIComponent(`${buildMessage(data)}\n\nAnexarei o primeiro capítulo a este e-mail.`);
    window.location.href = `mailto:saymoncesar@gmail.com?subject=${subject}&body=${body}`;
  });
})();
