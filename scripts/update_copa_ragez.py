from pathlib import Path
from bs4 import BeautifulSoup
from copy import copy
import re

SOURCE = Path('index.html')
html = SOURCE.read_text(encoding='utf-8')
soup = BeautifulSoup(html, 'html.parser')


def set_fragment(tag, fragment_html):
    if tag is None:
        raise RuntimeError('Elemento HTML esperado não foi encontrado')
    tag.clear()
    fragment = BeautifulSoup(fragment_html, 'html.parser')
    for child in list(fragment.contents):
        tag.append(child)


def make_tag(name, classes=None, attrs=None):
    tag = soup.new_tag(name)
    if classes:
        tag['class'] = classes
    if attrs:
        for key, value in attrs.items():
            tag[key] = value
    return tag


def supporter_card(title, subtitle, score, score_label, supporters, winner=False):
    article = make_tag('article', ['supporter-card'] + (['winner'] if winner else []))
    head = make_tag('div', ['supporter-head'])

    left = make_tag('div')
    h3 = make_tag('h3')
    h3.string = title
    p = make_tag('p')
    p.string = subtitle
    left.extend([h3, p])

    score_box = make_tag('div', ['supporter-score'])
    strong = make_tag('strong')
    strong.string = str(score)
    span = make_tag('span')
    span.string = score_label
    score_box.extend([strong, span])
    head.extend([left, score_box])

    ul = make_tag('ul', ['supporter-list'], {'aria-label': f'Torcedores de {title}'})
    for handle in supporters:
        li = make_tag('li')
        li.string = handle
        ul.append(li)

    article.extend([head, ul])
    return article


# Metadados
meta_desc = soup.find('meta', attrs={'name': 'description'})
if meta_desc:
    meta_desc['content'] = (
        'Acompanhe a Copa Apócrifos: Ragez vence Sonhos de Seden por 16 a 11, '
        'elimina o adversário e a próxima disputa será pelo Grupo F.'
    )

# Seções principais
rodada = soup.find('section', id='rodada')
grupo_e = soup.find('section', id='grupo-E')
grupo_f = soup.find('section', id='grupo-F')
if not all([rodada, grupo_e, grupo_f]):
    raise RuntimeError('Seções de rodada ou grupos não localizadas')

# Próxima rodada em destaque
set_fragment(
    rodada.select_one('.section-title p'),
    'A Copa segue para o <strong>Grupo F</strong>: '
    '<strong>Contos da Terra Legendária</strong> enfrenta '
    '<strong>Alimentando o Pecado</strong> na segunda rodada, em <strong>08/08</strong>. '
    'O confronto reúne duas obras que dialogam diretamente com a mensagem cristã.'
)

date_strip = rodada.select_one('.date-strip')
date_strip.find('span').string = 'Próxima disputa'
date_strip.find('strong').string = '08/08 · Grupo F'
date_strip.find('em').string = 'Contos da Terra Legendária × Alimentando o Pecado'

cards_f = grupo_f.select('.group-books .book-card')
if len(cards_f) < 3:
    raise RuntimeError('Capas do Grupo F não localizadas')

featured = rodada.select_one('.featured-match')
featured.clear()
left_card = copy(cards_f[1])
right_card = copy(cards_f[2])
for card, accent in ((left_card, 'blue'), (right_card, 'orange')):
    card['class'] = [c for c in card.get('class', []) if c != 'compact']
    card['data-accent'] = accent
versus = make_tag('div', ['versus'], {'aria-label': 'versus'})
versus.string = 'VS'
featured.extend([left_card, versus, right_card])

set_fragment(
    rodada.select_one('.result-summary'),
    '''
    <h3>Último resultado — Grupo E</h3>
    <p><strong>Ragez — O Senhor do Sepulcro</strong> venceu
    <strong>Sonhos de Seden</strong> por <strong>16 × 11 votos válidos</strong>
    e conquistou 3 pontos em sua estreia.</p>
    <small>O voto de @malp.anfini foi anulado por pertencer ao autor de Sonhos de Seden.
    Com duas derrotas, Sonhos de Seden está eliminado da Copa.</small>
    '''
)

# Tabela do Grupo E
set_fragment(
    grupo_e.select_one('#standings-E tbody'),
    '''
    <tr data-book="ultima-cor">
      <td class="club"><span class="dot"></span>A Última Cor</td>
      <td class="pts">3</td><td class="pj">1</td><td class="v">1</td><td class="e">0</td>
      <td class="d">0</td><td class="vf">18</td><td class="vs">10</td><td class="sv">+8</td>
    </tr>
    <tr data-book="ragez">
      <td class="club"><span class="dot"></span>Ragez</td>
      <td class="pts">3</td><td class="pj">1</td><td class="v">1</td><td class="e">0</td>
      <td class="d">0</td><td class="vf">16</td><td class="vs">11</td><td class="sv">+5</td>
    </tr>
    <tr data-book="sonhos-seden">
      <td class="club"><span class="dot"></span>Sonhos de Seden</td>
      <td class="pts">0</td><td class="pj">2</td><td class="v">0</td><td class="e">0</td>
      <td class="d">2</td><td class="vf">21</td><td class="vs">34</td><td class="sv">-13</td>
    </tr>
    '''
)

# Partidas
for item in soup.select('.match-item.current'):
    item['class'] = [c for c in item.get('class', []) if c != 'current']

e3 = grupo_e.select_one('[data-match="E-3"]')
if e3 is None:
    raise RuntimeError('Partida E-3 não localizada')
e3['class'] = ['match-item', 'completed']
e3.find('em').string = 'Finalizado: 11 × 16 votos válidos · vitória de Ragez'

f3 = grupo_f.select_one('[data-match="F-3"]')
if f3 is None:
    raise RuntimeError('Partida F-3 não localizada')
f3['class'] = ['match-item', 'current']
f3.find('em').string = 'Rodada em destaque · 08/08'

# Torcidas
supporters_grid = soup.select_one('#torcidas .supporters-grid')
if supporters_grid is None:
    raise RuntimeError('Área de torcidas não localizada')

for existing in list(supporters_grid.select('.supporter-card')):
    title = existing.find('h3')
    if title and title.get_text(' ', strip=True) in {
        'Ragez', 'Ragez — O Senhor do Sepulcro', 'Sonhos de Seden'
    }:
        existing.decompose()

ragez_supporters = [
    '@viajandopelomundodoslivros',
    '@readsthay_',
    '@estante_da_day',
    '@lendocomosgatos',
    '@maripm.books',
    '@umahistoriadoraleitora',
    '@bombonatobook',
    '@marcelacristinafausto',
    '@teias_de_livros',
    '@sammuel_gil',
    '@entrelinhas_daduda',
    '@gabriel.santana.s',
    '@hobbieecafe',
    '@caio.da.quimica',
    '@anaju_cavalcanteh',
    '@kalinerainha',
]

sonhos_primeira = [
    '@r.rissoli',
    '@alineb.escritora',
    '@alimentando_o_pecado',
    '@entrelinhas_daduda',
    '@a_caldeira_de_sangue',
    '@leide_e_miguel',
    '@brunoberserker',
    '@ramificandoideiaserealidade',
    '@comliviale',
    '@rafs_oficial',
]

sonhos_segunda = [
    '@rafs_oficial',
    '@0beatrizoliveira',
    '@rapha_books_',
    '@lidybooksfeecafe',
    '@claudioigor00',
    '@leide_e_miguel',
    '@andreiacoelho.autora',
    '@danielannibelli',
    '@universo_evangelium',
    '@comliviale',
    '@luulhlima',
]

sonhos_unicos = []
for handle in sonhos_primeira + sonhos_segunda:
    if handle not in sonhos_unicos:
        sonhos_unicos.append(handle)

ragez_card = supporter_card(
    'Ragez',
    '1 partida · 1 vitória · 16 torcedores únicos',
    16,
    'votos válidos',
    ragez_supporters,
    True,
)

sonhos_card = supporter_card(
    'Sonhos de Seden',
    f'2 partidas · 2 derrotas · {len(sonhos_unicos)} torcedores únicos · eliminado',
    21,
    'votos válidos acumulados',
    sonhos_unicos,
    False,
)

ultima_card = next((
    card for card in supporters_grid.select('.supporter-card')
    if card.find('h3') and card.find('h3').get_text(' ', strip=True) == 'A Última Cor'
), None)

if ultima_card:
    ultima_card.insert_after(ragez_card)
    ragez_card.insert_after(sonhos_card)
else:
    supporters_grid.insert(0, sonhos_card)
    supporters_grid.insert(0, ragez_card)

# Boletim da Copa
boletim = soup.find('section', id='boletim')
news_grid = boletim.select_one('.news-grid')
main_article = news_grid.select_one('.news-card.main')
history = news_grid.select_one('.news-history')

old_meta_tag = main_article.select_one('.news-meta')
old_title_tag = main_article.find('h3')
if old_meta_tag and old_title_tag:
    old_meta = old_meta_tag.get_text(' ', strip=True)
    old_title = old_title_tag.get_text(' ', strip=True)
    old_body_html = ''.join(
        str(p) for p in main_article.find_all('p')
        if 'news-meta' not in p.get('class', [])
    )

    for details in list(history.select('.news-accordion')):
        title = details.select_one('.news-accordion-title')
        if title and title.get_text(' ', strip=True) in {
            old_title,
            'Ragez vence confronto apertado e elimina Sonhos de Seden',
        }:
            details.decompose()

    old_details = make_tag('details', ['news-accordion'])
    old_summary = make_tag('summary')
    old_meta_span = make_tag('span', ['news-accordion-meta'])
    old_meta_span.string = old_meta
    old_title_span = make_tag('span', ['news-accordion-title'])
    old_title_span.string = old_title
    old_summary.extend([old_meta_span, old_title_span])
    old_body = make_tag('div', ['news-accordion-body'])
    set_fragment(old_body, old_body_html)
    old_details.extend([old_summary, old_body])

    first_existing = history.select_one('.news-accordion')
    if first_existing:
        first_existing.insert_before(old_details)
    else:
        history.append(old_details)

set_fragment(
    main_article,
    '''
    <p class="news-meta">Grupo E · 05/08</p>
    <h3>Ragez vence confronto apertado e elimina Sonhos de Seden</h3>
    <p><em>Ragez — O Senhor do Sepulcro</em> estreou com vitória ao superar
    <em>Sonhos de Seden</em> por <strong>16 a 11 votos válidos</strong>. A diferença de
    apenas cinco votos confirmou uma partida equilibrada, decidida somente depois de uma
    mobilização consistente das duas torcidas.</p>
    <p>O placar foi consolidado após a anulação do voto de <strong>@malp.anfini</strong>,
    autor de <em>Sonhos de Seden</em>. Pela regra da Copa, autores não podem votar nas próprias
    obras; por isso, Sonhos de Seden terminou o confronto com onze votos válidos.</p>
    <p>Com o resultado, <em>Ragez</em> soma <strong>3 pontos</strong>, 16 votos a favor,
    11 contra e saldo de <strong>+5</strong>. A obra ocupa provisoriamente a segunda posição
    do Grupo E, atrás de <em>A Última Cor</em>, que também tem três pontos, mas saldo de +8.</p>
    <p><em>Sonhos de Seden</em> encerra seus dois jogos com duas derrotas, 21 votos a favor,
    34 contra e saldo de <strong>-13</strong>. Como ainda resta o confronto direto entre
    <em>A Última Cor</em> e <em>Ragez</em>, pelo menos uma dessas obras terminará à frente;
    assim, Sonhos de Seden está matematicamente eliminado da Copa Apócrifos.</p>
    <p>A situação do Grupo E permanece aberta entre os dois vencedores da chave. O duelo entre
    <em>A Última Cor</em> e <em>Ragez</em> definirá a liderança e também terá peso na disputa
    pelas vagas destinadas aos melhores segundos colocados.</p>
    <p>A próxima partida acontece em <strong>08/08</strong>, pelo Grupo F:
    <em>Contos da Terra Legendária</em> enfrenta <em>Alimentando o Pecado</em>. O confronto
    desperta uma curiosidade especial por reunir duas obras que trabalham, cada uma à sua
    maneira, com uma mensagem cristã.</p>
    '''
)

# Resultados usados pelos componentes dinâmicos
script = next((
    tag for tag in soup.find_all('script')
    if 'const RESULTS' in (tag.string or tag.get_text())
), None)
if script is None:
    raise RuntimeError('Bloco de resultados JavaScript não localizado')

js = script.string or script.get_text()
match = re.search(r'const RESULTS = \{([^;]*)\};', js)
if not match:
    raise RuntimeError('Objeto RESULTS não localizado')

results_body = match.group(1).strip()
results_body = re.sub(r"\s*'E-3'\s*:\s*\{[^}]*\}\s*,?", '', results_body)
results_body = results_body.strip().strip(',')
if results_body:
    results_body += ", 'E-3': {a: 11, b: 16}"
else:
    results_body = "'E-3': {a: 11, b: 16}"
js = js[:match.start()] + f'const RESULTS = {{{results_body}}};' + js[match.end():]
script.clear()
script.append(js)

result = str(soup)
required = [
    '16 × 11 votos válidos',
    'Ragez vence confronto apertado e elimina Sonhos de Seden',
    '08/08 · Grupo F',
    'Contos da Terra Legendária × Alimentando o Pecado',
    "'E-3': {a: 11, b: 16}",
    'Finalizado: 11 × 16 votos válidos · vitória de Ragez',
    '@viajandopelomundodoslivros',
    '@0beatrizoliveira',
    'matematicamente eliminado',
]
missing = [item for item in required if item not in result]
if missing:
    raise RuntimeError(f'Validação falhou: {missing}')

SOURCE.write_text(result, encoding='utf-8')
print('Atualização de Ragez x Sonhos de Seden concluída com sucesso.')
