from pathlib import Path
from bs4 import BeautifulSoup
import re


SOURCE = Path("index.html")
html = SOURCE.read_text(encoding="utf-8")
soup = BeautifulSoup(html, "html.parser")


FALSA_LUZ_VALIDOS = """historiadareforma
modestia.vs.bodybuilding
joaolucas.ns
joaopedroaouad
vinho_gon
henrriqueadan
viajandopelomundodoslivros
leo.maciell98
caiozra.06
dg.reformado
campossales.ce
lucienelnp
jamilecs27
pr.danielf.oliveira
silvestrestrength
antoniorenatocs
rafaelfelete
tpsn12
cahio_wagner
joaosadox
victorhqq_
profleandroramosoficial
anthonyyy_yx
emersonkf2_
schulze_diego
eduardo.a_machado
vanessa.ggf
aizen_wesley
lysandra.escrita.lima
posmilenismo_br
jef_black
posmilitante
vitorgaspamor
jardelmartins__
giovann_89
mateus_marques_medeiros
rapha_books_
jefbernardino
jaimeperiard
flavioeliasbk
samuel_nr63
wesleyborgesad
getuliogffelix
hemillio
luizhenriquerf_
amanda.oliveira_silva
ricardoguerral
sujiro33
universo_evangelium""".splitlines()


SELENE_VALIDOS = """lari.p.r
wagner.junior.82
educdengue
iaramdm
gmenezesss
itsgabotime
annalauradiniz
marizinha_pelo_mundo
rosanasantosfisio
malu_cardoso_santos
marcelocarsantos
comliviale
quequellora
corigoulart
julianaalcantararc
cadela.ganesha
yoganiteroi
cefy.yoga
semear.yoga
geraldo.silva.98
amarodinamara
claudia_amaro50
jv_cabelo
avamobr
marcosalvescjr
diegotrally
candidacatharina
marycaarvallho
leandro_schade
prvdoenzo
caio_aalvares
mauricio_wagner_
maiconpereira9
alexandrethewizard
pedromaced
homobonofrederico
andreiacoello
visimasdias
roberta_ardsv
nathsurf16
pattytrigo
raquelsantana2703
carlossoriano86
lullanporai
diogosimasbd
jg_soledade
victorr.melo
brunoberserker
lidybooksfeecafe
r.rissoli
_lizium
peedro_m1
tiagorodrigues1958
matheus_sousa
eenzomenezes
pbsuelen
duduxbrj
pilariarte
offthestarted
adri.amaro_
ricmouta
entrelinhas_daduda
sonhodevegana
felipef21
pvdapilar
thallesw_
joaopmsampaio
preciosotattoo
lucxsazzp
pilarcardosoo
cicahsouzaautora
djfiliperocha
v.g.toledo
alinecloureiro1
kalinerainha
maya.m_oliveira
turisteicomlivros""".splitlines()


def fragment(markup):
    parsed = BeautifulSoup(markup, "html.parser")
    return list(parsed.contents)


def set_fragment(tag, markup):
    if tag is None:
        raise RuntimeError("Elemento HTML obrigatório não encontrado")
    tag.clear()
    for child in fragment(markup):
        tag.append(child)


def find_supporter_card(title):
    for card in soup.select("#torcidas .supporter-card"):
        h3 = card.find("h3")
        if h3 and h3.get_text(" ", strip=True) == title:
            return card
    raise RuntimeError(f"Card de torcida não localizado: {title}")


def merge_supporters(title, handles, score_increment, subtitle, winner):
    card = find_supporter_card(title)
    classes = [name for name in card.get("class", []) if name != "winner"]
    if winner:
        classes.append("winner")
    card["class"] = classes
    card.select_one(".supporter-head p").string = subtitle

    score = card.select_one(".supporter-score strong")
    score.string = str(int(score.get_text(strip=True)) + score_increment)

    ul = card.select_one(".supporter-list")
    existing = {li.get_text(" ", strip=True) for li in ul.find_all("li", recursive=False)}
    for handle in handles:
        label = f"@{handle}"
        if label not in existing:
            li = soup.new_tag("li")
            li.string = label
            ul.append(li)
            existing.add(label)
    return len(existing)


# Metadados e abertura
soup.title.string = "Selene é campeã da Copa Apócrifos 2026 | Editora Fantásticos"
soup.find("meta", attrs={"name": "description"})["content"] = (
    "Selene é campeã da Copa Apócrifos 2026 após vencer A Falsa Luz por "
    "77 a 49 votos válidos na grande final."
)
hero = soup.select_one("header.hero")
hero.select_one(".kicker").clear()
hero.select_one(".kicker").append(BeautifulSoup("<i></i> Copa Apócrifos 2026 · Resultado oficial", "html.parser"))
hero.select_one("h1").string = "Selene é campeã da Copa Apócrifos 2026"
set_fragment(
    hero.select_one(".hero-copy > p"),
    "Com <strong>77 votos válidos</strong> na grande final, <strong>Selene</strong>, de Rafael A. F. Silva, "
    "vence a primeira edição e será a obra inaugural do <strong>Story Game Apócrifos</strong>.",
)
hero.select_one('a[href="#rodada"]').string = "Ver resultado final"


# Resultado em destaque
rodada = soup.find("section", id="rodada")
rodada.select_one(".section-title h2").string = "Selene é campeã"
set_fragment(
    rodada.select_one(".section-title p"),
    "<strong>Selene</strong> venceu <strong>A Falsa Luz</strong> por "
    "<strong>77 × 49 votos válidos</strong> e conquistou a Copa Apócrifos 2026.",
)
date_strip = rodada.select_one(".date-strip")
date_strip.find("span").string = "Resultado oficial"
date_strip.find("strong").string = "24/09 · Grande final"
date_strip.find("em").string = "Selene 77 × 49 A Falsa Luz"

cards = rodada.select(".featured-match .book-card")
cards[0]["data-accent"] = "gold"
cards[0].select_one(".book-tag").string = "campeã da Copa Apócrifos 2026"
cards[1]["data-accent"] = "blue"
cards[1].select_one(".book-tag").string = "vice-campeã"

set_fragment(
    rodada.select_one(".result-summary"),
    """
    <h3>Resultado da grande final</h3>
    <p><strong>Selene</strong> venceu <strong>A Falsa Luz</strong> por
    <strong>77 × 49 votos válidos</strong>: <strong>61% × 39%</strong>.</p>
    <small>O placar bruto foi 78 × 50. Foram anulados @rafs_oficial, autor de Selene,
    e @mayaoliver.autora, segundo perfil de Mayara Oliveira; foi mantido
    @maya.m_oliveira em Selene. Ao todo, a final reuniu 126 votos válidos.</small>
    """,
)
rodada.select_one(".note").string = (
    "A primeira edição da Copa Apócrifos está encerrada. Selene será a primeira obra "
    "adaptada no Story Game Apócrifos."
)


# Boletim: transforma a antiga manchete em histórico e publica a final
boletim = soup.find("section", id="boletim")
boletim.select_one(".section-title p").string = (
    "Resultado final, campanha da campeã e histórico completo da primeira Copa Apócrifos."
)
main_news = boletim.select_one(".news-card.main")
set_fragment(
    main_news,
    """
    <p class="news-meta">Grande final · 24/09</p>
    <h3>Selene vence A Falsa Luz e é campeã da Copa Apócrifos 2026</h3>
    <p><em>Selene</em>, de Rafael A. F. Silva, venceu <em>A Falsa Luz — Os Nove Desconhecidos</em>,
    de Gabriel Ennes, por <strong>77 a 49 votos válidos</strong> e conquistou a primeira edição
    da Copa Apócrifos.</p>
    <p>A enquete terminou em <strong>78 a 50 no placar bruto</strong>. Em Selene, foi anulado
    <strong>@rafs_oficial</strong>, voto do autor da própria obra. Em A Falsa Luz, foi anulado
    <strong>@mayaoliver.autora</strong>, segundo perfil de Mayara Oliveira; foi mantido
    <strong>@maya.m_oliveira</strong>, em Selene, seguindo o critério aplicado nas rodadas anteriores.</p>
    <p>Depois das duas anulações, os 126 votos válidos equivalem a <strong>61% para Selene</strong>
    e <strong>39% para A Falsa Luz</strong>. Selene encerra a Copa invicta, com cinco vitórias
    em cinco partidas e <strong>230 votos válidos acumulados</strong>.</p>
    <p>Como campeã, <em>Selene</em> será a primeira obra da Editora Fantásticos adaptada no
    <strong>Story Game Apócrifos</strong>.</p>
    """,
)
history = boletim.select_one(".news-history")
old_sf2 = BeautifulSoup(
    """
    <details class="news-accordion"><summary><span class="news-accordion-meta">Semifinal SF2 · 17/09</span>
    <span class="news-accordion-title">A Falsa Luz goleia Ragez e avança à final contra Selene</span></summary>
    <div class="news-accordion-body">
    <p><em>A Falsa Luz — Os Nove Desconhecidos</em>, de Gabriel Ennes, venceu
    <em>Ragez — O Senhor do Sepulcro</em>, de Ariel L. R. Vieira, por
    <strong>39 a 7 votos válidos</strong> e garantiu a segunda vaga na final.</p>
    <p>O placar bruto foi 40 a 8. Foram anulados @mayaoliver.autora, segundo perfil de
    Mayara Oliveira, e @rushdoonybr, perfil de Gabriel Ennes, autor de A Falsa Luz.</p>
    <p>Os 46 votos válidos equivaleram a 85% para A Falsa Luz e 15% para Ragez.</p>
    </div></details>
    """,
    "html.parser",
).details
history.select_one(".news-history-title").insert_after(old_sf2)


# Chaveamento encerrado
mata = soup.find("section", id="mata-mata")
mata.select_one(".section-title h2").string = "Chaveamento final"
mata.select_one(".section-title p").string = (
    "Selene venceu as cinco partidas que disputou e conquistou a primeira Copa Apócrifos."
)
rounds = mata.select(".panel.round")
final_round = next(panel for panel in rounds if panel.find("h3").get_text(strip=True) == "Final")
final_round.find("h4").string = "FINAL · 24/09 · FINALIZADA"
final_teams = final_round.select(".bracket-team")
final_teams[0]["class"] = ["bracket-team", "confirmed"]
final_teams[0].find("small").string = "77 votos · campeã"
final_teams[1]["class"] = ["bracket-team"]
final_teams[1].find("small").string = "49 votos · vice-campeã"

champion_round = next(panel for panel in rounds if panel.find("h3").get_text(strip=True) == "Campeão")
champion_round.find("h3").string = "Campeã"
set_fragment(
    champion_round.select_one(".slot"),
    '<div class="bracket-team confirmed"><img data-cover-from="Selene" class="bracket-cover" '
    'alt="Capa de Selene"/><span>Selene<small>Campeã 2026 · primeira obra adaptada em Apócrifos</small></span></div>',
)


# Torcidas acumuladas
falsa_unique = merge_supporters(
    "A Falsa Luz",
    FALSA_LUZ_VALIDOS,
    49,
    "5 partidas · 3 vitórias · 2 derrotas · 117 torcedores únicos · vice-campeã",
    False,
)
selene_unique = merge_supporters(
    "Selene",
    SELENE_VALIDOS,
    77,
    "5 partidas · 5 vitórias · 133 torcedores únicos · campeã",
    True,
)
if falsa_unique != 117 or selene_unique != 133:
    raise RuntimeError(
        f"Totais inesperados de torcedores únicos: A Falsa Luz={falsa_unique}, Selene={selene_unique}"
    )

supporter_note = soup.select_one("#torcidas .supporter-note")
set_fragment(
    supporter_note,
    "<strong>Critério de validação:</strong> votos duplicados, perfis vinculados diretamente às obras "
    "e votos dos próprios autores foram anulados. Na final, @rafs_oficial e @mayaoliver.autora "
    "foram excluídos; as listas exibem somente votos válidos e torcedores únicos acumulados.",
)


SOURCE.write_text(str(soup), encoding="utf-8")
print("Copa 2026 finalizada: Selene 77 x 49 A Falsa Luz")
