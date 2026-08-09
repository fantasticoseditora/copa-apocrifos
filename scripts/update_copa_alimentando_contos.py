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


def int_text(tag, default=0):
    if tag is None:
        return default
    m = re.search(r'-?\d+', tag.get_text(' ', strip=True))
    return int(m.group()) if m else default


def set_cell(row, cls, value):
    cell = row.select_one('.' + cls)
    if cell is None:
        raise RuntimeError(f'Célula {cls} não encontrada')
    cell.string = str(value)


def row_values(row):
    return {
        'pts': int_text(row.select_one('.pts')),
        'pj': int_text(row.select_one('.pj')),
        'v': int_text(row.select_one('.v')),
        'e': int_text(row.select_one('.e')),
        'd': int_text(row.select_one('.d')),
        'vf': int_text(row.select_one('.vf')),
        'vs': int_text(row.select_one('.vs')),
    }


def update_row(row, *, pts=0, pj=0, v=0, e=0, d=0, vf=0, vs=0):
    data = row_values(row)
    data['pts'] += pts
    data['pj'] += pj
    data['v'] += v
    data['e'] += e
    data['d'] += d
    data['vf'] += vf
    data['vs'] += vs
    saldo = data['vf'] - data['vs']
    for key in ('pts', 'pj', 'v', 'e', 'd', 'vf', 'vs'):
        set_cell(row, key, data[key])
    set_cell(row, 'sv', f'{saldo:+d}' if saldo > 0 else str(saldo))
    return data | {'sv': saldo}


def find_book_card(group, title):
    for card in group.select('.group-books .book-card'):
        h3 = card.find('h3')
        if h3 and h3.get_text(' ', strip=True) == title:
            return card
    raise RuntimeError(f'Card do livro {title} não localizado')


def find_supporter_card(grid, title):
    for card in grid.select('.supporter-card'):
        h3 = card.find('h3')
        if h3 and h3.get_text(' ', strip=True) == title:
            return card
    return None


def make_supporter_card(title):
    article = make_tag('article', ['supporter-card'])
    head = make_tag('div', ['supporter-head'])
    left = make_tag('div')
    h3 = make_tag('h3'); h3.string = title
    p = make_tag('p'); p.string = ''
    left.extend([h3, p])
    score_box = make_tag('div', ['supporter-score'])
    strong = make_tag('strong'); strong.string = '0'
    span = make_tag('span'); span.string = 'votos válidos acumulados'
    score_box.extend([strong, span])
    head.extend([left, score_box])
    ul = make_tag('ul', ['supporter-list'], {'aria-label': f'Torcedores de {title}'})
    article.extend([head, ul])
    return article


def merge_supporters(card, new_handles, score_increment, subtitle, winner=False):
    classes = [c for c in card.get('class', []) if c != 'winner']
    if winner:
        classes.append('winner')
    card['class'] = classes

    p = card.select_one('.supporter-head p')
    if p is not None:
        p.string = subtitle

    strong = card.select_one('.supporter-score strong')
    current_score = int_text(strong)
    if strong is not None:
        strong.string = str(current_score + score_increment)
    label = card.select_one('.supporter-score span')
    if label is not None:
        label.string = 'votos válidos acumulados'

    ul = card.select_one('.supporter-list')
    if ul is None:
        ul = make_tag('ul', ['supporter-list'], {'aria-label': f'Torcedores de {card.find("h3").get_text(" ", strip=True)}'})
        card.append(ul)
    existing = [li.get_text(' ', strip=True) for li in ul.find_all('li', recursive=False)]
    for handle in new_handles:
        if handle not in existing:
            li = make_tag('li'); li.string = handle
            ul.append(li)
            existing.append(handle)
    return len(existing)


# Metadados
meta_desc = soup.find('meta', attrs={'name': 'description'})
if meta_desc:
    meta_desc['content'] = (
        'Acompanhe a Copa Apócrifos: Alimentando o Pecado vence Contos da Terra Legendária '
        'por 19 a 10; a próxima disputa será A Caldeira de Sangue x Elementares pelo Grupo A.'
    )

rodada = soup.find('section', id='rodada')
grupo_a = soup.find('section', id='grupo-A')
grupo_f = soup.find('section', id='grupo-F')
if not all([rodada, grupo_a, grupo_f]):
    raise RuntimeError('Seções de rodada ou grupos não localizadas')

# Próxima partida em destaque: Grupo A
set_fragment(
    rodada.select_one('.section-title p'),
    'A Copa retorna ao <strong>Grupo A</strong> para o confronto que encerra a chave: '
    '<strong>A Caldeira de Sangue</strong> enfrenta <strong>Elementares</strong>. '
    'A partida será decisiva para o desenho final da classificação do grupo.'
)

a3 = grupo_a.select_one('[data-match="A-3"]')
if a3 is None:
    raise RuntimeError('Partida A-3 não localizada')
original_a3_text = a3.find('em').get_text(' ', strip=True) if a3.find('em') else ''
date_match = re.search(r'\b\d{1,2}/\d{1,2}\b', original_a3_text)
next_date = date_match.group(0) if date_match else None

date_strip = rodada.select_one('.date-strip')
if date_strip:
    date_strip.find('span').string = 'Próxima disputa'
    date_strip.find('strong').string = f'{next_date} · Grupo A' if next_date else 'Grupo A · data a confirmar'
    date_strip.find('em').string = 'A Caldeira de Sangue × Elementares'

featured = rodada.select_one('.featured-match')
if featured is None:
    raise RuntimeError('Destaque da rodada não localizado')
featured.clear()
left_card = copy(find_book_card(grupo_a, 'A Caldeira de Sangue'))
right_card = copy(find_book_card(grupo_a, 'Elementares'))
for card, accent in ((left_card, 'blue'), (right_card, 'orange')):
    card['class'] = [c for c in card.get('class', []) if c != 'compact']
    card['data-accent'] = accent
versus = make_tag('div', ['versus'], {'aria-label': 'versus'})
versus.string = 'VS'
featured.extend([left_card, versus, right_card])

set_fragment(
    rodada.select_one('.result-summary'),
    '''
    <h3>Último resultado — Grupo F</h3>
    <p><strong>Alimentando o Pecado</strong> venceu <strong>Contos da Terra Legendária</strong>
    por <strong>19 × 10 votos válidos</strong> e conquistou sua primeira vitória na Copa.</p>
    <small>Um dos dois votos de Cristiano Alves da Silva foi anulado por duplicidade de perfis.
    Com a segunda derrota, Contos da Terra Legendária está eliminado da competição.</small>
    '''
)

# Atualizar tabela do Grupo F com base nos valores atuais
terra_row = grupo_f.select_one('#standings-F tbody tr[data-book="terra-legendaria"]')
alimentando_row = grupo_f.select_one('#standings-F tbody tr[data-book="alimentando-pecado"]')
if terra_row is None or alimentando_row is None:
    raise RuntimeError('Linhas da tabela do Grupo F não localizadas')

terra_data = update_row(terra_row, pj=1, d=1, vf=10, vs=19)
alimentando_data = update_row(alimentando_row, pts=3, pj=1, v=1, vf=19, vs=10)

# Reordenar classificação por pontos, saldo e votos a favor
tbody_f = grupo_f.select_one('#standings-F tbody')
rows = list(tbody_f.find_all('tr', recursive=False))
def standings_key(row):
    d = row_values(row)
    return (d['pts'], d['vf'] - d['vs'], d['vf'])
for row in sorted(rows, key=standings_key, reverse=True):
    tbody_f.append(row)

# Status das partidas
for item in soup.select('.match-item.current'):
    item['class'] = [c for c in item.get('class', []) if c != 'current']

f3 = grupo_f.select_one('[data-match="F-3"]')
if f3 is None:
    raise RuntimeError('Partida F-3 não localizada')
f3['class'] = ['match-item', 'completed']
if f3.find('em'):
    f3.find('em').string = 'Finalizado: 10 × 19 votos válidos · vitória de Alimentando o Pecado'

a3['class'] = ['match-item', 'current']
if a3.find('em'):
    a3.find('em').string = f'Rodada em destaque · {next_date}' if next_date else 'Rodada em destaque · data a confirmar'

# Torcidas
supporters_grid = soup.select_one('#torcidas .supporters-grid')
if supporters_grid is None:
    raise RuntimeError('Área de torcidas não localizada')

alimentando_supporters = [
    '@cristiano.alvesdas', '@maripm.books', '@caio.da.quimica', '@hobbieecafe',
    '@gabriel.santana.s', '@teias_de_livros', '@rapha_books_', '@maya.m_oliveira',
    '@biancavictoriasantin', '@tiago_santoli', '@rafs_oficial', '@escritora.mariliacarvalho',
    '@guilhermehenriquerenan', '@bielsifer', '@douglaswga', '@rutinha.bqueiroz',
    '@durfilho', '@maryy_melo', '@sammuel_gil'
]
terra_supporters = [
    '@divasdabettaa', '@entrelinhas_daduda', '@andreiacoello', '@lendocomosgatos',
    '@viajandopelomundodoslivros', '@kalinerainha', '@turisteicomlivros', '@a_naju.07',
    '@comliviale', '@japaa.books'
]

alimentando_card = find_supporter_card(supporters_grid, 'Alimentando o Pecado')
if alimentando_card is None:
    alimentando_card = make_supporter_card('Alimentando o Pecado')
    supporters_grid.insert(0, alimentando_card)
terra_card = find_supporter_card(supporters_grid, 'Contos da Terra Legendária')
if terra_card is None:
    terra_card = make_supporter_card('Contos da Terra Legendária')
    supporters_grid.insert(0, terra_card)

# Merge primeiro, depois calcular subtítulos com total de únicos
alim_unique_before = len(alimentando_card.select('.supporter-list li'))
terra_unique_before = len(terra_card.select('.supporter-list li'))

alim_pj, alim_v, alim_d = alimentando_data['pj'], alimentando_data['v'], alimentando_data['d']
terra_pj, terra_v, terra_d = terra_data['pj'], terra_data['v'], terra_data['d']

alim_existing = [li.get_text(' ', strip=True) for li in alimentando_card.select('.supporter-list li')]
alim_total_unique = len(dict.fromkeys(alim_existing + alimentando_supporters))
terra_existing = [li.get_text(' ', strip=True) for li in terra_card.select('.supporter-list li')]
terra_total_unique = len(dict.fromkeys(terra_existing + terra_supporters))

alim_subtitle = f'{alim_pj} partidas · {alim_v} vitória' + ('s' if alim_v != 1 else '') + f' · {alim_d} derrota' + ('s' if alim_d != 1 else '') + f' · {alim_total_unique} torcedores únicos'
terra_subtitle = f'{terra_pj} partidas · {terra_v} vitória' + ('s' if terra_v != 1 else '') + f' · {terra_d} derrotas · {terra_total_unique} torcedores únicos · eliminado'

merge_supporters(alimentando_card, alimentando_supporters, 19, alim_subtitle, winner=True)
merge_supporters(terra_card, terra_supporters, 10, terra_subtitle, winner=False)

# Boletim da Copa: arquivar notícia principal atual e inserir a nova
boletim = soup.find('section', id='boletim')
if boletim:
    news_grid = boletim.select_one('.news-grid')
    main_article = news_grid.select_one('.news-card.main') if news_grid else None
    history = news_grid.select_one('.news-history') if news_grid else None
    if main_article and history:
        old_meta_tag = main_article.select_one('.news-meta')
        old_title_tag = main_article.find('h3')
        if old_meta_tag and old_title_tag:
            old_meta = old_meta_tag.get_text(' ', strip=True)
            old_title = old_title_tag.get_text(' ', strip=True)
            duplicate = any(
                d.select_one('.news-accordion-title') and
                d.select_one('.news-accordion-title').get_text(' ', strip=True) == old_title
                for d in history.select('.news-accordion')
            )
            if not duplicate:
                body_parts = []
                for node in main_article.find_all(['p'], recursive=False):
                    if 'news-meta' not in node.get('class', []):
                        body_parts.append(str(node))
                details = make_tag('details', ['news-accordion'])
                summary = make_tag('summary')
                meta_span = make_tag('span', ['news-accordion-meta']); meta_span.string = old_meta
                title_span = make_tag('span', ['news-accordion-title']); title_span.string = old_title
                summary.extend([meta_span, title_span])
                body = make_tag('div', ['news-accordion-body'])
                set_fragment(body, ''.join(body_parts))
                details.extend([summary, body])
                first = history.select_one('.news-accordion')
                if first:
                    first.insert_before(details)
                else:
                    history.append(details)

        set_fragment(
            main_article,
            '''
            <p class="news-meta">Grupo F · 08/08</p>
            <h3>Alimentando o Pecado vira no início da noite, conquista primeira vitória e elimina Contos da Terra Legendária</h3>
            <p><em>Alimentando o Pecado</em> venceu <em>Contos da Terra Legendária</em> por
            <strong>19 a 10 votos válidos</strong> em uma partida cujo placar mudou de direção na reta final.
            Um dos dois votos de Cristiano Alves da Silva foi anulado porque ele participou por dois perfis diferentes.</p>
            <p>Durante boa parte do dia, <em>Contos da Terra Legendária</em> permaneceu à frente, ainda que com vantagem apertada.
            No início da noite, porém, a autora <strong>Mary Leide</strong> intensificou a convocação de sua torcida.
            A mobilização fez diferença: <em>Alimentando o Pecado</em> virou o confronto e abriu a margem que garantiu sua primeira vitória na Copa.</p>
            <p><strong>Situação do campeonato:</strong> com duas derrotas, <em>Contos da Terra Legendária</em> está eliminado.
            <em>Alimentando o Pecado</em> soma seus primeiros 3 pontos e permanece vivo na disputa do Grupo F, ainda com o confronto contra <em>Pulsos</em> pela frente.</p>
            <p>A próxima partida da Copa fecha o <strong>Grupo A</strong>: <em>A Caldeira de Sangue</em> enfrenta <em>Elementares</em>.
            O resultado definirá a configuração final da chave e terá impacto direto na corrida pelas vagas para o mata-mata.</p>
            '''
        )

# Estado JavaScript da página
html_out = str(soup)
html_out = re.sub(r"(CURRENT_MATCH:\s*)'[^']+'", r"\1'A-3'", html_out)
html_out = re.sub(r"(LAST_COMPLETED:\s*)'[^']+'", r"\1'F-3'", html_out)
html_out = re.sub(r"(ACTIVE_GROUP:\s*)'[^']+'", r"\1'A'", html_out)

SOURCE.write_text(html_out, encoding='utf-8')
print('Atualização concluída: Alimentando o Pecado 19 x 10 Contos da Terra Legendária; próxima partida A-3.')
