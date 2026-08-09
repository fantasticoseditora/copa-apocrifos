from pathlib import Path
from bs4 import BeautifulSoup
from copy import copy
import re

SOURCE = Path('index.html')
html = SOURCE.read_text(encoding='utf-8')
soup = BeautifulSoup(html, 'html.parser')


def set_fragment(tag, fragment_html):
    if tag is None:
        raise RuntimeError('Elemento HTML esperado não encontrado')
    tag.clear()
    fragment = BeautifulSoup(fragment_html, 'html.parser')
    for child in list(fragment.contents):
        tag.append(child)


def make_tag(name, classes=None, attrs=None):
    tag = soup.new_tag(name)
    if classes:
        tag['class'] = classes
    if attrs:
        for k, v in attrs.items():
            tag[k] = v
    return tag


def supporter_card(title, subtitle, score, score_label, supporters, winner=False):
    article = make_tag('article', ['supporter-card'] + (['winner'] if winner else []))
    head = make_tag('div', ['supporter-head'])
    left = make_tag('div')
    h3 = make_tag('h3'); h3.string = title
    p = make_tag('p'); p.string = subtitle
    left.extend([h3, p])
    score_box = make_tag('div', ['supporter-score'])
    strong = make_tag('strong'); strong.string = str(score)
    span = make_tag('span'); span.string = score_label
    score_box.extend([strong, span])
    head.extend([left, score_box])
    ul = make_tag('ul', ['supporter-list'], {'aria-label': f'Torcedores de {title}'})
    for handle in supporters:
        li = make_tag('li'); li.string = handle; ul.append(li)
    article.extend([head, ul])
    return article


def parse_int(txt):
    txt = (txt or '').strip().replace('+','')
    return int(txt) if txt and re.fullmatch(r'-?\d+', txt) else 0


def get_supporters(card):
    if card is None:
        return []
    return [li.get_text(' ', strip=True) for li in card.select('.supporter-list li')]


def get_score(card):
    if card is None:
        return 0
    strong = card.select_one('.supporter-score strong')
    return parse_int(strong.get_text(strip=True) if strong else '0')


def uniq(seq):
    out=[]
    for x in seq:
        if x and x not in out:
            out.append(x)
    return out

# Metadados
meta_desc = soup.find('meta', attrs={'name':'description'})
if meta_desc:
    meta_desc['content'] = ('Acompanhe a Copa Apócrifos: Alimentando o Pecado vira no início da noite, '
                            'vence Contos da Terra Legendária por 19 a 10 e mantém viva a disputa no Grupo F.')

rodada = soup.find('section', id='rodada')
grupo_a = soup.find('section', id='grupo-A')
grupo_f = soup.find('section', id='grupo-F')
if not all([rodada, grupo_a, grupo_f]):
    raise RuntimeError('Seções de rodada, Grupo A ou Grupo F não localizadas')

# Próxima partida: Grupo A, Caldeira de Sangue x Elementares
set_fragment(rodada.select_one('.section-title p'),
             'A Copa retorna ao <strong>Grupo A</strong> para o último confronto da chave: '
             '<strong>A Caldeira de Sangue</strong> enfrenta <strong>Elementares</strong> em <strong>11/08</strong>.')

date_strip = rodada.select_one('.date-strip')
date_strip.find('span').string = 'Próxima disputa'
date_strip.find('strong').string = '11/08 · Grupo A'
date_strip.find('em').string = 'A Caldeira de Sangue × Elementares'

cards_a = grupo_a.select('.group-books .book-card')
if len(cards_a) < 3:
    raise RuntimeError('Capas do Grupo A não localizadas')
featured = rodada.select_one('.featured-match')
featured.clear()
left_card = copy(cards_a[1])   # Caldeira
right_card = copy(cards_a[2])  # Elementares
for card, accent in ((left_card, 'blue'), (right_card, 'orange')):
    card['class'] = [c for c in card.get('class', []) if c != 'compact']
    card['data-accent'] = accent
versus = make_tag('div', ['versus'], {'aria-label':'versus'}); versus.string = 'VS'
featured.extend([left_card, versus, right_card])

# Último resultado
set_fragment(rodada.select_one('.result-summary'), '''
<h3>Último resultado — Grupo F</h3>
<p><strong>Alimentando o Pecado</strong> venceu <strong>Contos da Terra Legendária</strong>
por <strong>19 × 10 votos válidos</strong> e conquistou seus primeiros 3 pontos.</p>
<small>Foram 20 votos brutos para Alimentando o Pecado; um voto foi anulado porque a mesma pessoa,
Cristiano Alves da Silva, votou por dois perfis diferentes. Contos da Terra Legendária sofreu a segunda derrota e está eliminado.</small>
''')

# Atualiza tabela do Grupo F a partir do estado corrente
rows = {tr.get('data-book'): tr for tr in grupo_f.select('#standings-F tbody tr')}
for key in ('contos-terra','alimentando-o-pecado'):
    if key not in rows:
        raise RuntimeError(f'Linha {key} não localizada na tabela do Grupo F')

def read_row(tr):
    cls = ['pts','pj','v','e','d','vf','vs','sv']
    return {c: parse_int(tr.select_one('.'+c).get_text(strip=True)) for c in cls}

def write_row(tr, st):
    for c in ['pts','pj','v','e','d','vf','vs']:
        tr.select_one('.'+c).string = str(st[c])
    saldo = st['vf'] - st['vs']
    tr.select_one('.sv').string = f'{saldo:+d}' if saldo else '0'

contos = read_row(rows['contos-terra'])
contos['pj'] += 1; contos['d'] += 1; contos['vf'] += 10; contos['vs'] += 19
write_row(rows['contos-terra'], contos)

pecado = read_row(rows['alimentando-o-pecado'])
pecado['pts'] += 3; pecado['pj'] += 1; pecado['v'] += 1; pecado['vf'] += 19; pecado['vs'] += 10
write_row(rows['alimentando-o-pecado'], pecado)

# Reordena tabela: pontos, saldo, votos a favor
body_f = grupo_f.select_one('#standings-F tbody')
trs = list(body_f.find_all('tr', recursive=False))
def sort_key(tr):
    pts = parse_int(tr.select_one('.pts').get_text(strip=True))
    vf = parse_int(tr.select_one('.vf').get_text(strip=True))
    vs = parse_int(tr.select_one('.vs').get_text(strip=True))
    return (pts, vf-vs, vf)
for tr in sorted(trs, key=sort_key, reverse=True):
    body_f.append(tr)

# Partidas
for item in soup.select('.match-item.current'):
    item['class'] = [c for c in item.get('class', []) if c != 'current']
f3 = grupo_f.select_one('[data-match="F-3"]')
if f3 is None:
    raise RuntimeError('Partida F-3 não localizada')
f3['class'] = ['match-item','completed']
f3.find('em').string = 'Finalizado: 10 × 19 votos válidos · vitória de Alimentando o Pecado'
a3 = grupo_a.select_one('[data-match="A-3"]')
if a3 is None:
    raise RuntimeError('Partida A-3 não localizada')
a3['class'] = ['match-item','current']
a3.find('em').string = 'Rodada em destaque · 11/08'

# Torcidas
supporters_grid = soup.select_one('#torcidas .supporters-grid')
if supporters_grid is None:
    raise RuntimeError('Área de torcidas não localizada')

old_contos = None
old_pecado = None
for card in supporters_grid.select('.supporter-card'):
    title = card.find('h3')
    if not title: continue
    t = title.get_text(' ', strip=True)
    if t == 'Contos da Terra Legendária': old_contos = card
    if t == 'Alimentando o Pecado': old_pecado = card

contos_prev = get_supporters(old_contos)
contos_prev_score = get_score(old_contos)
contos_now = [
    '@divasdabettaa','@entrelinhas_daduda','@andreiacoello','@lendocomosgatos',
    '@viajandopelomundodoslivros','@kalinerainha','@turisteicomlivros','@a_naju.07',
    '@comliviale','@japaa.books'
]
contos_supporters = uniq(contos_prev + contos_now)
contos_score = contos_prev_score + 10

pecado_supporters = [
    '@cristiano.alvesdas','@maripm.books','@caio.da.quimica','@hobbieecafe',
    '@gabriel.santana.s','@teias_de_livros','@rapha_books_','@maya.m_oliveira',
    '@biancavictoriasantin','@tiago_santoli','@rafs_oficial','@escritora.mariliacarvalho',
    '@guilhermehenriquerenan','@bielsifer','@douglaswga','@rutinha.bqueiroz',
    '@durfilho','@maryy_melo','@sammuel_gil'
]

for card in [old_contos, old_pecado]:
    if card is not None:
        card.decompose()

pecado_card = supporter_card('Alimentando o Pecado',
    '1 partida · 1 vitória · 19 torcedores únicos', 19, 'votos válidos', pecado_supporters, True)
contos_card = supporter_card('Contos da Terra Legendária',
    f'2 partidas · 2 derrotas · {len(contos_supporters)} torcedores únicos · eliminado',
    contos_score, 'votos válidos acumulados', contos_supporters, False)

pulsos_card = next((c for c in supporters_grid.select('.supporter-card')
                    if c.find('h3') and c.find('h3').get_text(' ',strip=True) == 'Pulsos'), None)
if pulsos_card:
    pulsos_card.insert_after(pecado_card)
    pecado_card.insert_after(contos_card)
else:
    supporters_grid.insert(0, contos_card)
    supporters_grid.insert(0, pecado_card)

# Boletim: arquiva notícia atual e publica nova
boletim = soup.find('section', id='boletim')
news_grid = boletim.select_one('.news-grid')
main_article = news_grid.select_one('.news-card.main')
history = news_grid.select_one('.news-history')
old_meta_tag = main_article.select_one('.news-meta')
old_title_tag = main_article.find('h3')
if old_meta_tag and old_title_tag:
    old_meta = old_meta_tag.get_text(' ',strip=True)
    old_title = old_title_tag.get_text(' ',strip=True)
    old_body_html = ''.join(str(p) for p in main_article.find_all('p') if 'news-meta' not in p.get('class',[]))
    for details in list(history.select('.news-accordion')):
        title = details.select_one('.news-accordion-title')
        if title and title.get_text(' ',strip=True) in {old_title, 'Alimentando o Pecado vira no início da noite e elimina Contos da Terra Legendária'}:
            details.decompose()
    old_details = make_tag('details',['news-accordion'])
    summary = make_tag('summary')
    meta_span = make_tag('span',['news-accordion-meta']); meta_span.string = old_meta
    title_span = make_tag('span',['news-accordion-title']); title_span.string = old_title
    summary.extend([meta_span,title_span])
    body = make_tag('div',['news-accordion-body']); set_fragment(body, old_body_html)
    old_details.extend([summary,body])
    first = history.select_one('.news-accordion')
    if first: first.insert_before(old_details)
    else: history.append(old_details)

set_fragment(main_article, '''
<p class="news-meta">Grupo F · 08/08</p>
<h3>Alimentando o Pecado vira no início da noite e elimina Contos da Terra Legendária</h3>
<p><em>Alimentando o Pecado</em> conquistou sua primeira vitória na Copa Apócrifos ao superar
<em>Contos da Terra Legendária</em> por <strong>19 a 10 votos válidos</strong>. O placar final abriu nove votos,
mas não conta sozinho a história da partida.</p>
<p>Durante boa parte do dia, <em>Contos da Terra Legendária</em> permaneceu à frente, sempre por margem curta.
A mudança aconteceu no início da noite, quando a autora <strong>Mary Leide</strong> intensificou a convocação da torcida.
A mobilização trouxe uma sequência de votos para <em>Alimentando o Pecado</em>, que virou o confronto e consolidou a vitória.</p>
<p>A apuração registrou 20 votos brutos para <em>Alimentando o Pecado</em>. Um deles foi anulado porque
<strong>Cristiano Alves da Silva votou por dois perfis diferentes</strong>; conforme as regras da Copa, apenas um voto por pessoa foi considerado.</p>
<p>O resultado mantém <em>Alimentando o Pecado</em> vivo na disputa do Grupo F, agora com <strong>3 pontos</strong>.
Já <em>Contos da Terra Legendária</em>, que sofreu a segunda derrota em dois jogos, não pode mais alcançar uma das vagas de classificação e está eliminado.</p>
<p><strong>Situação da Copa:</strong> o Grupo F ainda terá o confronto entre <em>Pulsos</em> e <em>Alimentando o Pecado</em>, decisivo para a definição da chave.
Antes disso, a competição retorna ao Grupo A. Em <strong>11/08</strong>, <em>A Caldeira de Sangue</em> enfrenta <em>Elementares</em>
no último jogo do grupo, enquanto <em>A Falsa Luz</em> aguarda o resultado após encerrar sua campanha com uma vitória e uma derrota.</p>
''')

# Atualiza placar JS
script = next((x for x in soup.find_all('script') if 'const RESULTS' in (x.string or x.get_text())), None)
if script:
    js = script.string or script.get_text()
    m = re.search(r'const RESULTS = \{([^;]*)\};', js, re.S)
    if m:
        body = m.group(1).strip()
        # remove F-3 existente, se houver
        body = re.sub(r"\s*'F-3'\s*:\s*\{[^}]*\}\s*,?", '', body)
        body = body.rstrip().rstrip(',')
        if body:
            body += ", 'F-3': {a: 10, b: 19}"
        else:
            body = "'F-3': {a: 10, b: 19}"
        js = js[:m.start()] + 'const RESULTS = {' + body + '};' + js[m.end():]
        script.clear(); script.append(js)

result = str(soup)
required = [
    '19 × 10 votos válidos','Alimentando o Pecado vira no início da noite',
    '11/08 · Grupo A','A Caldeira de Sangue × Elementares',
    'Finalizado: 10 × 19 votos válidos · vitória de Alimentando o Pecado',
    "'F-3': {a: 10, b: 19}",'@cristiano.alvesdas','@japaa.books',
    'Contos da Terra Legendária','está eliminado'
]
missing = [x for x in required if x not in result]
if missing:
    raise RuntimeError(f'Validação falhou: {missing}')

SOURCE.write_text(result, encoding='utf-8')
print('Atualização do Grupo F aplicada com sucesso.')
