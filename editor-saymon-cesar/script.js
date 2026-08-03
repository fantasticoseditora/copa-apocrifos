(async () => {
  await Promise.all([
    import('./script-core.js?v=20260803c'),
    import('./form-config.js?v=20260803c')
  ]);

  const cards = [...document.querySelectorAll('.testimonial-card')];
  const fixName = (card, name) => {
    if (!card) return;
    const heading = card.querySelector('.testimonial-person h3');
    const image = card.querySelector('.testimonial-avatar');
    if (heading) heading.textContent = name;
    if (image) image.alt = `Foto de ${name}`;
  };

  fixName(cards[0], 'Mayara Oliveira');
  fixName(cards[2], 'Thalles Waichert');

  const config = window.EDITORIAL_FORM_CONFIG || {};
  const endpoint = String(config.appsScriptUrl || '').trim();
  const integrationIsActive = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/.test(endpoint);

  // Enquanto a URL do Apps Script ainda não foi configurada, o formulário mantém
  // o fluxo atual pelo WhatsApp e nenhuma promessa de upload é exibida ao visitante.
  if (!integrationIsActive) return;

  const form = document.getElementById('editorial-form');
  if (!form) return;

  const startedAt = Date.now();
  const maxFileSizeMb = Number(config.maxFileSizeMb || 10);
  const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;
  const acceptedExtensions = Array.isArray(config.acceptedExtensions)
    ? config.acceptedExtensions.map((item) => String(item).toLowerCase())
    : ['pdf', 'doc', 'docx', 'odt', 'rtf'];

  const styles = document.createElement('style');
  styles.textContent = `
    .upload-block {
      margin: 4px 0 22px;
      padding: 20px;
      border: 1px dashed #c9a65f;
      border-radius: 15px;
      background: linear-gradient(145deg, #fffdf8, #f7edda);
    }

    .upload-block .block-title {
      margin-bottom: 7px;
    }

    .upload-block .helper {
      margin-bottom: 14px;
    }

    .file-picker {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      gap: 13px;
      margin: 0;
      padding: 14px;
      border: 1px solid #d6c6aa;
      border-radius: 12px;
      background: #fff;
      cursor: pointer;
    }

    .file-picker:hover {
      border-color: #a77d34;
    }

    .file-picker input {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
    }

    .file-picker-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 42px;
      padding: 9px 14px;
      border-radius: 9px;
      color: #fff;
      background: #17130e;
      font-size: .78rem;
      font-weight: 800;
    }

    .file-picker-text {
      color: #655b4f;
      font-size: .82rem;
      font-weight: 600;
      word-break: break-word;
    }

    .upload-guidance {
      margin: 10px 0 0;
      color: #7b7063;
      font-size: .74rem;
    }

    .submission-status {
      display: none;
      margin: 16px 0 0;
      padding: 13px 14px;
      border-radius: 10px;
      font-size: .82rem;
      font-weight: 700;
    }

    .submission-status.visible { display: block; }
    .submission-status.loading { color: #634411; background: #f5e8c9; }
    .submission-status.success { color: #185b2b; background: #e2f3e5; }
    .submission-status.error { color: #8d2d20; background: #fff0ed; }

    .editorial-honeypot {
      position: absolute !important;
      left: -10000px !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    .lead-form.is-submitting {
      opacity: .78;
      pointer-events: none;
    }

    @media (max-width: 620px) {
      .file-picker { grid-template-columns: 1fr; }
      .file-picker-button { width: 100%; }
    }
  `;
  document.head.appendChild(styles);

  const consent = form.querySelector('.consent');
  const uploadBlock = document.createElement('fieldset');
  uploadBlock.className = 'form-block upload-block';
  uploadBlock.innerHTML = `
    <legend class="block-title">Envie o primeiro capítulo ou o original</legend>
    <span class="helper">O documento será armazenado com segurança em uma pasta individual do Google Drive para a avaliação editorial inicial.</span>
    <label class="file-picker" for="editorial-file">
      <span class="file-picker-button">Selecionar documento</span>
      <span class="file-picker-text" id="file-picker-text">Nenhum arquivo selecionado</span>
      <input
        id="editorial-file"
        name="arquivo"
        type="file"
        accept=".pdf,.doc,.docx,.odt,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.oasis.opendocument.text,application/rtf,text/rtf"
        required
      >
    </label>
    <p class="upload-guidance">Formatos aceitos: PDF, DOC, DOCX, ODT e RTF. Tamanho máximo: ${maxFileSizeMb} MB.</p>
    <p class="submission-status" id="submission-status" role="status" aria-live="polite"></p>
  `;

  if (consent) {
    consent.before(uploadBlock);
  } else {
    form.appendChild(uploadBlock);
  }

  const honeypot = document.createElement('label');
  honeypot.className = 'editorial-honeypot';
  honeypot.setAttribute('aria-hidden', 'true');
  honeypot.innerHTML = 'Não preencha este campo<input type="text" name="website" tabindex="-1" autocomplete="off">';
  form.appendChild(honeypot);

  const formIntro = document.querySelector('.form-intro');
  const introParagraph = formIntro?.querySelector('p');
  if (introParagraph) {
    introParagraph.textContent = 'Preencha as informações sobre o projeto e anexe o primeiro capítulo ou o original. O envio será organizado automaticamente no Google Drive para a avaliação editorial inicial.';
  }

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) submitButton.textContent = 'Enviar obra para avaliação';

  const emailButton = form.querySelector('#email-submit');
  if (emailButton) emailButton.hidden = true;

  const note = form.querySelector('.form-note');
  if (note) {
    note.textContent = 'Ao concluir, seus dados e o documento serão enviados diretamente para a pasta de avaliações editoriais.';
  }

  const fileInput = form.querySelector('#editorial-file');
  const fileText = form.querySelector('#file-picker-text');
  const status = form.querySelector('#submission-status');

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (fileText) fileText.textContent = file ? `${file.name} — ${formatBytes(file.size)}` : 'Nenhum arquivo selecionado';
    setStatus('', '');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (!form.reportValidity()) return;

    const file = fileInput?.files?.[0];
    const services = [...form.querySelectorAll('input[name="servicos"]:checked')].map((input) => input.value);

    if (!services.length) {
      setStatus('Marque pelo menos uma etapa que o livro já possui.', 'error');
      document.getElementById('services-block')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!file) {
      setStatus('Selecione o primeiro capítulo ou o original.', 'error');
      fileInput?.focus();
      return;
    }

    const extension = getExtension(file.name);
    if (!acceptedExtensions.includes(extension)) {
      setStatus('Formato não permitido. Envie PDF, DOC, DOCX, ODT ou RTF.', 'error');
      return;
    }

    if (file.size > maxFileSizeBytes) {
      setStatus(`O documento ultrapassa o limite de ${maxFileSizeMb} MB.`, 'error');
      return;
    }

    try {
      form.classList.add('is-submitting');
      if (submitButton) submitButton.disabled = true;
      setStatus('Preparando o documento e enviando para o Google Drive… Não feche esta página.', 'loading');

      const formData = new FormData(form);
      const base64 = await readFileAsDataUrl(file);
      const submissionId = window.crypto?.randomUUID?.() || `envio-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const payload = {
        submissionId,
        startedAt,
        website: formData.get('website') || '',
        sourceUrl: window.location.href,
        nome: formData.get('nome') || '',
        whatsapp: formData.get('whatsapp') || '',
        email: formData.get('email') || '',
        titulo: formData.get('titulo') || '',
        tipo: formData.get('tipo') || '',
        genero: formData.get('genero') || '',
        estagio: formData.get('estagio') || '',
        servicos,
        objetivoLiterario: formData.get('objetivo_literario') || '',
        modeloPublicacao: formData.get('modelo_publicacao') || '',
        observacoes: formData.get('observacoes') || '',
        consentimento: Boolean(form.querySelector('.consent input[type="checkbox"]')?.checked),
        file: {
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          base64
        }
      };

      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        redirect: 'follow',
        cache: 'no-store',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(payload)
      });

      setStatus('Envio concluído. Seu documento foi encaminhado para a avaliação editorial. Entrarei em contato pelos dados informados.', 'success');
      form.reset();
      if (fileText) fileText.textContent = 'Nenhum arquivo selecionado';
      status?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
      console.error(error);
      setStatus('Não foi possível concluir o envio. Verifique sua conexão e tente novamente. Se o problema continuar, fale comigo pelo WhatsApp.', 'error');
    } finally {
      form.classList.remove('is-submitting');
      if (submitButton) submitButton.disabled = false;
    }
  }, true);

  function setStatus(message, type) {
    if (!status) return;
    status.textContent = message;
    status.className = `submission-status${message ? ' visible' : ''}${type ? ` ${type}` : ''}`;
  }

  function getExtension(name) {
    const match = String(name || '').toLowerCase().match(/\.([a-z0-9]+)$/);
    return match ? match[1] : '';
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Falha ao ler o arquivo.'));
      reader.readAsDataURL(file);
    });
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
  }
})();
