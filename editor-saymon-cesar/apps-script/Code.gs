const CONFIG = Object.freeze({
  NEW_SUBMISSIONS_FOLDER_ID: '130qQx55runnM5ONaDaX0GAYI8VrvHrX6',
  SPREADSHEET_ID: '1RZkl7Azi0haQlqXEUHc6IccUjP7SkgLtTZUxsUl_83Y',
  SHEET_NAME: 'Envios',
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_EXTENSIONS: ['pdf', 'doc', 'docx', 'odt', 'rtf'],
  TIME_ZONE: 'America/Sao_Paulo'
});

function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'Formulário editorial — Saymon César',
    status: 'online'
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    if (!lock.tryLock(30000)) {
      throw new Error('O sistema está processando outro envio. Tente novamente em alguns segundos.');
    }

    const body = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const payload = JSON.parse(body);

    validatePayload_(payload);

    const now = new Date();
    const submissionId = payload.submissionId || Utilities.getUuid();
    const datePrefix = Utilities.formatDate(now, CONFIG.TIME_ZONE, 'yyyy-MM-dd');
    const timeStamp = Utilities.formatDate(now, CONFIG.TIME_ZONE, 'yyyy-MM-dd HH:mm:ss');
    const shortId = String(submissionId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);

    const authorName = sanitizeName_(payload.nome || 'Autor');
    const bookTitle = sanitizeName_(payload.titulo || 'Obra sem título');
    const folderName = `${datePrefix} — ${authorName} — ${bookTitle} — ${shortId}`;

    const parentFolder = DriveApp.getFolderById(CONFIG.NEW_SUBMISSIONS_FOLDER_ID);
    const submissionFolder = parentFolder.createFolder(folderName);

    const safeFileName = sanitizeFileName_(payload.file.name);
    const fileBytes = decodeBase64File_(payload.file.base64);
    const fileBlob = Utilities.newBlob(
      fileBytes,
      payload.file.mimeType || 'application/octet-stream',
      safeFileName
    );
    const savedFile = submissionFolder.createFile(fileBlob);

    const metadata = {
      id: submissionId,
      recebidoEm: timeStamp,
      nome: payload.nome,
      email: payload.email,
      whatsapp: payload.whatsapp,
      titulo: payload.titulo,
      tipo: payload.tipo,
      genero: payload.genero,
      estagio: payload.estagio,
      servicos: payload.servicos || [],
      objetivoLiterario: payload.objetivoLiterario,
      modeloPublicacao: payload.modeloPublicacao,
      observacoes: payload.observacoes || '',
      consentimento: Boolean(payload.consentimento),
      origem: payload.sourceUrl || '',
      arquivo: {
        nome: savedFile.getName(),
        mimeType: savedFile.getMimeType(),
        tamanhoBytes: savedFile.getSize(),
        link: savedFile.getUrl()
      },
      pasta: {
        nome: submissionFolder.getName(),
        link: submissionFolder.getUrl()
      }
    };

    submissionFolder.createFile(
      'dados-do-envio.json',
      JSON.stringify(metadata, null, 2),
      MimeType.PLAIN_TEXT
    );

    appendToSpreadsheet_(metadata);

    return jsonResponse_({
      ok: true,
      submissionId: submissionId,
      message: 'Envio recebido com sucesso.',
      folderUrl: submissionFolder.getUrl(),
      fileUrl: savedFile.getUrl()
    });
  } catch (error) {
    console.error(error);
    return jsonResponse_({
      ok: false,
      message: error && error.message ? error.message : 'Não foi possível processar o envio.'
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (releaseError) {
      console.warn(releaseError);
    }
  }
}

function validatePayload_(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Dados do formulário inválidos.');
  }

  if (payload.website) {
    throw new Error('Envio bloqueado.');
  }

  const startedAt = Number(payload.startedAt || 0);
  if (startedAt && Date.now() - startedAt < 2000) {
    throw new Error('Envio realizado rápido demais. Tente novamente.');
  }

  const requiredFields = [
    ['nome', 'Informe o nome.'],
    ['email', 'Informe o e-mail.'],
    ['whatsapp', 'Informe o WhatsApp.'],
    ['titulo', 'Informe o título da obra.'],
    ['tipo', 'Informe se a obra é ficção ou não ficção.'],
    ['genero', 'Informe o gênero ou a área da obra.'],
    ['estagio', 'Informe o estágio da obra.'],
    ['objetivoLiterario', 'Informe o objetivo literário.'],
    ['modeloPublicacao', 'Informe a forma de publicação considerada.']
  ];

  requiredFields.forEach(function (entry) {
    if (!String(payload[entry[0]] || '').trim()) {
      throw new Error(entry[1]);
    }
  });

  if (!payload.consentimento) {
    throw new Error('É necessário autorizar o contato.');
  }

  if (!Array.isArray(payload.servicos) || payload.servicos.length === 0) {
    throw new Error('Informe quais etapas o livro já possui.');
  }

  if (!payload.file || !payload.file.name || !payload.file.base64) {
    throw new Error('Anexe o primeiro capítulo ou o original.');
  }

  const extension = getExtension_(payload.file.name);
  if (CONFIG.ALLOWED_EXTENSIONS.indexOf(extension) === -1) {
    throw new Error('Formato de arquivo não permitido. Use PDF, DOC, DOCX, ODT ou RTF.');
  }

  const fileBytes = decodeBase64File_(payload.file.base64);
  if (fileBytes.length > CONFIG.MAX_FILE_SIZE_BYTES) {
    throw new Error('O arquivo ultrapassa o limite de 10 MB.');
  }
}

function appendToSpreadsheet_(metadata) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  }

  ensureHeaders_(sheet);

  sheet.appendRow([
    metadata.recebidoEm,
    'Novo envio',
    metadata.nome,
    metadata.email,
    metadata.whatsapp,
    metadata.titulo,
    metadata.tipo,
    metadata.genero,
    metadata.estagio,
    metadata.servicos.join(' | '),
    metadata.objetivoLiterario,
    metadata.modeloPublicacao,
    metadata.observacoes,
    metadata.arquivo.nome,
    metadata.arquivo.link,
    metadata.pasta.nome,
    metadata.pasta.link,
    metadata.id,
    metadata.consentimento ? 'Sim' : 'Não'
  ]);
}

function ensureHeaders_(sheet) {
  const headers = [[
    'Data e hora',
    'Status',
    'Nome',
    'E-mail',
    'WhatsApp',
    'Título da obra',
    'Tipo',
    'Gênero ou área',
    'Estágio',
    'Etapas já realizadas',
    'Objetivo literário',
    'Forma de publicação',
    'Observações',
    'Nome do arquivo',
    'Link do arquivo',
    'Nome da pasta',
    'Link da pasta',
    'ID do envio',
    'Consentimento'
  ]];

  if (!sheet.getRange(1, 1).getValue()) {
    sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
    sheet.setFrozenRows(1);
  }
}

function decodeBase64File_(base64Value) {
  const cleanBase64 = String(base64Value || '').replace(/^data:[^;]+;base64,/, '');
  return Utilities.base64Decode(cleanBase64);
}

function getExtension_(fileName) {
  const match = String(fileName || '').toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : '';
}

function sanitizeFileName_(value) {
  return String(value || 'arquivo')
    .replace(/[\\/:*?"<>|#%{}~]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
}

function sanitizeName_(value) {
  return String(value || '')
    .replace(/[\\/:*?"<>|#%{}~]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90);
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function testarConfiguracao() {
  const folder = DriveApp.getFolderById(CONFIG.NEW_SUBMISSIONS_FOLDER_ID);
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  }

  ensureHeaders_(sheet);

  return {
    pasta: folder.getName(),
    planilha: spreadsheet.getName(),
    aba: sheet.getName(),
    status: 'Configuração validada com sucesso.'
  };
}
