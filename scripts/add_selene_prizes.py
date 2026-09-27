from pathlib import Path


source = Path("index.html")
html = source.read_text(encoding="utf-8")

old = """<p>Como campeã, <em>Selene</em> será a primeira obra da Editora Fantásticos adaptada no
    <strong>Story Game Apócrifos</strong>.</p>"""

new = """<p>Como campeã, <em>Selene</em> será a primeira obra da Editora Fantásticos adaptada no
    <strong>Story Game Apócrifos</strong>. O livro também ganhará uma <strong>tradução para o inglês</strong>
    e <strong>um ano de assessoria de marketing digital</strong>.</p>"""

if new not in html:
    if html.count(old) != 1:
        raise RuntimeError("A notícia principal de Selene não foi localizada de forma inequívoca")
    html = html.replace(old, new, 1)
    source.write_text(html, encoding="utf-8")

print("Prêmios adicionais de Selene registrados na notícia")
