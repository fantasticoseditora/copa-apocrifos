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

  const style = document.createElement('style');
  style.textContent = `
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

    @media (max-width: 620px) {
      .lead-form .choice-grid,
      .lead-form .choice-grid.services-list {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);

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
        <label class="choice-card">
          <input name="tipo" type="radio" value="Ficção" required>
          <span>Ficção</span>
        </label>
        <label class="choice-card">
          <input name="tipo" type="radio" value="Não ficção" required>
          <span>Não ficção</span>
        </label>
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
        <label class="choice-card">
          <input name="objetivo_literario" type="radio" value="Realizar o sonho de publicar o livro" required>
          <span>Realizar o sonho de publicar o meu livro</span>
        </label>
        <label class="choice-card">
          <input name="objetivo_literario" type="radio" value="Publicar e alcançar uma quantidade maior de leitores" required>
          <span>Publicar e alcançar uma quantidade maior de leitores</span>
        </label>
        <label class="choice-card">
          <input name="objetivo_literario" type="radio" value="Melhorar um livro já publicado para ampliar leitores e vendas" required>
          <span>Melhorar um livro já publicado para ampliar leitores e vendas</span>
        </label>
      </div>
    </fieldset>

    <fieldset class="form-block">
      <legend>Como você considera publicar o livro?</legend>
      <div class="choice-grid">
        <label class="choice-card">
          <input name="modelo_publicacao" type="radio" value="Publicação independente" required>
          <span>De forma independente</span>
        </label>
        <label class="choice-card">
          <input name="modelo_publicacao" type="radio" value="Publicação por editora" required>
          <span>Por uma editora</span>
        </label>
        <label class="choice-card">
          <input name="modelo_publicacao" type="radio" value="Aberto às duas formas" required>
          <span>Posso considerar as duas formas</span>
        </label>
      </div>
    </fieldset>

    <label>Há alguma informação importante sobre a obra ou sobre o que você procura?
      <textarea name="observacoes" rows="4" placeholder="Conte brevemente o que deseja resolver, melhorar ou alcançar com o projeto."></textarea>
    </label>

    <label class="consent">
      <input type="checkbox" required>
      <span>Autorizo o contato para tratar desta solicitação editorial.</span>
    </label>

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

      if (serviceCheckboxes.some((item) => item.checked)) {
        servicesError?.classList.remove('visible');
      }
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
