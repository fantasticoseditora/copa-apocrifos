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

meta_desc = soup.find('meta', attrs={'name': 'description'})
if meta_desc:
    meta_desc['content'] = ('Acompanhe a Copa Apócrifos: Safira vence Casamento de Verão por 18 a 8, '
                            'assume a vice-liderança do Grupo B e a próxima disputa será pelo Grupo C.')

rodada = soup.find('section', id='rodada')
grupo_b = soup.find('section', id='grupo-B')
grupo_c = soup.find('section', id='grupo-C')
if not all([rodada, grupo_b, grupo_c]):
    raise RuntimeError('Seções de rodada ou grupos não localizadas')

set_fragment(rodada.select_one('.section-title p'),
             'A Copa segue para o <strong>Grupo C</strong>: '
             '<strong>A Prisioneira e o Assassino</strong> enfrenta '
             '<strong>A Deusa da Névoa</strong> na segunda rodada, em <strong>30/07</strong>.')
date_strip = rodada.select_one('.date-strip')
date_strip.find('span').string = 'Próxima disputa'
date_strip.find('strong').string = '30/07 · Grupo C'
date_strip.find('em').string = 'A Prisioneira e o Assassino × A Deusa da Névoa'

cards_c = grupo_c.select('.group-books .book-card')
featured = rodada.select_one('.featured-match')
featured.clear()
left_card = copy(cards_c[1]); right_card = copy(cards_c[2])
for card, accent in ((left_card, 'blue'), (right_card, 'orange')):
    card['class'] = [c for c in card.get('class', []) if c != 'compact']
    card['data-accent'] = accent
versus = make_tag('div', ['versus'], {'aria-label': 'versus'}); versus.string = 'VS'
featured.extend([left_card, versus, right_card])

set_fragment(rodada.select_one('.result-summary'), '''
<h3>Último resultado — Grupo B</h3>
<p><strong>Safira — Em Busca da Minha História</strong> venceu
<strong>Casamento de Verão</strong> por <strong>18 × 8 votos válidos</strong>
e conquistou 3 pontos em sua estreia.</p>
<small>O voto da autora Marcela Cristina foi anulado. Com duas derrotas,
Casamento de Verão encerrou sua participação na fase de grupos.</small>
''')

set_fragment(grupo_b.select_one('#standings-B tbody'), '''
<tr data-book="selene"><td class="club"><span class="dot"></span>Selene</td><td class="pts">3</td><td class="pj">1</td><td class="v">1</td><td class="e">0</td><td class="d">0</td><td class="vf">62</td><td class="vs">10</td><td class="sv">+52</td></tr>
<tr data-book="safira"><td class="club"><span class="dot"></span>Safira</td><td class="pts">3</td><td class="pj">1</td><td class="v">1</td><td class="e">0</td><td class="d">0</td><td class="vf">18</td><td class="vs">8</td><td class="sv">+10</td></tr>
<tr data-book="casamento-verao"><td class="club"><span class="dot"></span>Casamento de Verão</td><td class="pts">0</td><td class="pj">2</td><td class="v">0</td><td class="e">0</td><td class="d">2</td><td class="vf">18</td><td class="vs">80</td><td class="sv">-62</td></tr>
''')
for item in soup.select('.match-item.current'):
    item['class'] = [c for c in item.get('class', []) if c != 'current']
b3 = grupo_b.select_one('[data-match="B-3"]')
b3['class'] = ['match-item', 'completed']
b3.find('em').string = 'Finalizado: 8 × 18 votos válidos · vitória de Safira'
c3 = grupo_c.select_one('[data-match="C-3"]')
c3['class'] = ['match-item', 'current']
c3.find('em').string = 'Rodada em destaque · 30/07'

supporters_grid = soup.select_one('#torcidas .supporters-grid')
for existing in list(supporters_grid.select('.supporter-card')):
    title = existing.find('h3')
    if title and title.get_text(' ', strip=True) in {'Safira', 'Safira — Em Busca da Minha História', 'Casamento de Verão'}:
        existing.decompose()

casamento_primeira = ['@eclipsolegends','@kalinerainha','@maya.m_oliveira','@patricia.livros.amor.infinito','@sammuel_gil','@lidybooksfeecafe','@rapha_books_','@yassvv_','@lendocomosgatos','@bibsreads_']
casamento_segunda = ['@r.rissoli','@comliviale','@lidybooksfeecafe','@nakamura3663','@rapha_books_','@leide_e_miguel','@teias_de_livros','@kalinerainha']
casamento_unicos = []
for handle in casamento_primeira + casamento_segunda:
    if handle not in casamento_unicos:
        casamento_unicos.append(handle)
safira_supporters = ['@jonydpc','@kaiquecorreiamelo','@lysandra.escrita.lima','@brunoberserker','@rafs_oficial','@ugoleao','@sammuel_gil','@claudioigor00','@caio.da.quimica','@universo_evangelium','@entrelinhas_daduda','@umahistoriadoraleitora','@gabriel.santana.s','@turisteicomlivros','@andreiacoello','@a_naju.07','@lendocomosgatos','@luulhlima']
safira_card = supporter_card('Safira','1 partida · 1 vitória · 18 torcedores únicos',18,'votos válidos',safira_supporters,True)
casamento_card = supporter_card('Casamento de Verão',f'2 partidas · 2 derrotas · {len(casamento_unicos)} torcedores únicos · eliminada',18,'votos válidos acumulados',casamento_unicos,False)
selene_card = next((c for c in supporters_grid.select('.supporter-card') if c.find('h3') and c.find('h3').get_text(' ', strip=True) == 'Selene'), None)
if selene_card:
    selene_card.insert_after(safira_card)
    safira_card.insert_after(casamento_card)
else:
    supporters_grid.insert(0, casamento_card); supporters_grid.insert(0, safira_card)

boletim = soup.find('section', id='boletim')
news_grid = boletim.select_one('.news-grid')
main_article = news_grid.select_one('.news-card.main')
history = news_grid.select_one('.news-history')
old_meta = main_article.select_one('.news-meta').get_text(' ', strip=True)
old_title = main_article.find('h3').get_text(' ', strip=True)
old_body_html = ''.join(str(p) for p in main_article.find_all('p') if 'news-meta' not in p.get('class', []))
for details in list(history.select('.news-accordion')):
    title = details.select_one('.news-accordion-title')
    if title and title.get_text(' ', strip=True) in {old_title, 'Safira vence e elimina Casamento de Verão na fase de grupos'}:
        details.decompose()
old_details = make_tag('details', ['news-accordion'])
old_summary = make_tag('summary')
old_meta_span = make_tag('span', ['news-accordion-meta']); old_meta_span.string = old_meta
old_title_span = make_tag('span', ['news-accordion-title']); old_title_span.string = old_title
old_summary.extend([old_meta_span, old_title_span])
old_body = make_tag('div', ['news-accordion-body']); set_fragment(old_body, old_body_html)
old_details.extend([old_summary, old_body])
first_existing = history.select_one('.news-accordion')
if first_existing: first_existing.insert_before(old_details)
else: history.append(old_details)

set_fragment(main_article, '''
<p class="news-meta">Grupo B · 27/07</p>
<h3>Safira vence e elimina Casamento de Verão na fase de grupos</h3>
<p><em>Safira — Em Busca da Minha História</em>, de Cecília Teixeira, estreou com vitória ao superar <em>Casamento de Verão</em>, de Marcela Cristina, por <strong>18 a 8 votos válidos</strong>.</p>
<p>O resultado foi consolidado após a anulação do voto de Marcela Cristina, autora de <em>Casamento de Verão</em>. A regra impede que autores votem em suas próprias obras; por isso, o livro terminou a partida com oito votos válidos.</p>
<p>Com o triunfo, <em>Safira</em> soma <strong>3 pontos</strong>, ocupa a segunda posição provisória do Grupo B e enfrentará <em>Selene</em> no confronto que definirá a liderança da chave. As duas obras chegam ao duelo com uma vitória.</p>
<p><em>Casamento de Verão</em> encerra seus dois jogos com duas derrotas, <strong>18 votos a favor</strong>, <strong>80 contra</strong> e saldo de <strong>-62</strong>. Conforme o regulamento vigente, avançam apenas os seis líderes de grupo e os dois melhores segundos colocados. Não há classificação reservada aos terceiros; portanto, Casamento de Verão está eliminado da Copa.</p>
<p>A próxima partida será pelo Grupo C, em <strong>30/07</strong>: <em>A Prisioneira e o Assassino</em> enfrenta <em>A Deusa da Névoa</em>. A Prisioneira tenta se recuperar da derrota na estreia, enquanto A Deusa da Névoa fará sua primeira aparição na competição.</p>
''')

script = next((x for x in soup.find_all('script') if 'const RESULTS' in (x.string or x.get_text())), None)
js = script.string or script.get_text()
js = re.sub(r"const RESULTS = \{[^;]*\};", "const RESULTS = {'A-1': {a: 14, b: 31}, 'A-2': {a: 29, b: 9}, 'B-1': {a: 62, b: 10}, 'B-3': {a: 8, b: 18}, 'C-1': {a: 19, b: 8}, 'D-1': {a: 6, b: 18}, 'E-1': {a: 18, b: 10}, 'F-1': {a: 14, b: 10}};", js, count=1)
script.clear(); script.append(js)

result = str(soup)
required = ['18 × 8 votos válidos','Safira vence e elimina Casamento de Verão','30/07 · Grupo C','A Prisioneira e o Assassino × A Deusa da Névoa',"'B-3': {a: 8, b: 18}",'Finalizado: 8 × 18 votos válidos · vitória de Safira','@jonydpc','@patricia.livros.amor.infinito','Não há classificação']
missing = [item for item in required if item not in result]
if missing:
    raise RuntimeError(f'Validação falhou: {missing}')
SOURCE.write_text(result, encoding='utf-8')
print('Atualização da Copa concluída com sucesso.')
