# Integração do formulário editorial com o Google Drive

Esta pasta contém o backend do formulário do site do Editor Saymon César.

## Estrutura já configurada

- Pasta de novos envios: `01 — Novos envios`
- Planilha: `Controle de envios — Avaliação Editorial`
- Aba da planilha: `Envios`
- Limite do arquivo: 10 MB
- Formatos aceitos: PDF, DOC, DOCX, ODT e RTF

## Implantação rápida

1. Acesse https://script.google.com/ e clique em **Novo projeto**.
2. Apague o conteúdo inicial do arquivo `Código.gs`.
3. Abra o arquivo `Code.gs` desta pasta no GitHub, copie todo o conteúdo e cole no editor do Apps Script.
4. Renomeie o projeto para `Formulário Editorial — Saymon César`.
5. No seletor de funções, escolha `testarConfiguracao` e clique em **Executar**.
6. Escolha a sua conta Google.
7. Caso apareça a tela **O Google não verificou este app**, clique em **Avançado** e depois em **Acessar Formulário Editorial — Saymon César (não seguro)**.
8. Autorize o acesso solicitado ao Google Drive e ao Google Sheets.
9. Confirme no registro de execução que a função terminou sem erro.
10. Clique em **Implantar > Nova implantação**.
11. Em **Selecionar tipo**, escolha **Aplicativo da Web**.
12. Defina:
    - Descrição: `Recebimento de originais pelo site`
    - Executar como: `Eu`
    - Quem pode acessar: `Qualquer pessoa`
13. Clique em **Implantar** e autorize novamente, se o Google solicitar.
14. Copie a URL terminada em `/exec`.
15. Envie essa URL no chat para que ela seja inserida em `form-config.js`.

Depois que a URL for configurada, o campo de upload aparecerá automaticamente no formulário do site e os envios serão armazenados na pasta `01 — Novos envios`.

## Teste final

Após a ativação no site:

1. Preencha o formulário com dados de teste.
2. Anexe um PDF ou DOCX pequeno.
3. Confirme se foi criada uma pasta individual em `01 — Novos envios`.
4. Confirme se a nova linha apareceu na aba `Envios` da planilha de controle.
