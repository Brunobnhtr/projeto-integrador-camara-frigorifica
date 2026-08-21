# -*- coding: utf-8 -*-
"""Gera o Resumo Expandido em .docx A PARTIR DO MODELO OFICIAL do SENAI.

Por que assim, e não gerando um .docx do zero: o modelo já carrega a
formatação que o edital exige (Times New Roman 12, justificado, espaçamento
1,5, a nota de rodapé dos autores e as páginas de anexo). Reescrever isso à
mão seria refazer — e errar — o que já está certo. Aqui só o TEXTO de cada
parágrafo é trocado; estilo, seções e notas ficam intactos.

Uso:  python gera_resumo_docx.py
"""
import io, re, shutil, zipfile, os

BASE = r"c:\Users\Bruno\Documents\Estudos Programação\tecnico em eletrotecnica\projeto integrador"
MODELO = os.path.join(BASE, "2026 - KIT PROJETO INTEGRADOR - ALUNO-20260821T192157Z-1-001",
                      "2026 - KIT PROJETO INTEGRADOR - ALUNO", "Resumo Expandido_modelo.docx")
FONTE = os.path.join(BASE, "entrega_senai", "02_resumo_expandido", "RESUMO_EXPANDIDO.md")
SAIDA = os.path.join(BASE, "entrega_senai", "02_resumo_expandido",
                     "RESUMO_EXPANDIDO_Camara_Climatizada.docx")


def paragrafos_do_md():
    """Tira do markdown os parágrafos de cada seção, na ordem do modelo."""
    s = io.open(FONTE, encoding="utf-8").read()

    def secao(nome):
        i = s.index("## " + nome)
        j = s.find("\n## ", i + 3)
        corpo = s[i:j if j > 0 else len(s)]
        corpo = corpo.split("\n", 1)[1]
        corpo = re.sub(r"[*_`]", "", corpo)
        return [" ".join(p.split()) for p in corpo.split("\n\n") if p.strip()]

    intro = secao("INTRODUÇÃO")
    metodo = secao("METODOLOGIA")
    result = secao("RESULTADOS")
    concl = [p for p in secao("CONCLUSÃO") if not p.startswith("Palavras-chave")]
    chave = next(p for p in secao("CONCLUSÃO") if p.startswith("Palavras-chave"))
    return intro, metodo, result, concl, chave


def troca_texto(par_xml, novo):
    """Substitui o texto de um <w:p>, preservando o 1º run e a formatação."""
    runs = list(re.finditer(r"<w:r\b.*?</w:r>", par_xml, re.S))
    if not runs:
        return par_xml
    primeiro = runs[0].group(0)
    # o texto novo entra no 1º run; os demais somem
    novo_esc = (novo.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
    if re.search(r"<w:t[^>]*>.*?</w:t>", primeiro, re.S):
        primeiro_novo = re.sub(r"(<w:t[^>]*>).*?(</w:t>)",
                               lambda m: m.group(1) + novo_esc + m.group(2),
                               primeiro, count=1, flags=re.S)
        primeiro_novo = re.sub(r'<w:t(?![^>]*xml:space)', '<w:t xml:space="preserve"',
                               primeiro_novo, count=1)
    else:
        return par_xml
    ini, fim = runs[0].start(), runs[-1].end()
    return par_xml[:ini] + primeiro_novo + par_xml[fim:]


def main():
    intro, metodo, result, concl, chave = paragrafos_do_md()

    # índice do parágrafo no modelo -> texto novo
    MAPA = {
        0:  "IMPLEMENTAÇÃO DE SISTEMA DE CONTROLE INTELIGENTE COM ESP32 PARA "
            "CABINE CLIMATIZADA DE ENSAIOS TÉRMICOS",
        2:  "Bruno Garro Alves",
        3:  "[nome do 2º integrante]",
        4:  "[nome do 3º integrante]",
        5:  "[nome do 4º integrante]",
        6:  "[nome do instrutor orientador]",
        10: intro[0],
        12: intro[1],
        16: metodo[0],
        17: "",                      # marcador "(Objetivos)" do modelo
        19: metodo[1],
        20: "",                      # marcador "(Desenvolvimento)"
        24: result[0],
        26: result[1],
        30: concl[0],
        31: "",                      # marcador "(Resultados e conclusões)"
        33: chave,
        36: "Agradecemos aos instrutores da Firjan SENAI pela orientação técnica, à equipe da "
            "Biblioteca pelo apoio na pesquisa e à empresa parceira pela disponibilidade em "
            "detalhar a demanda que originou este trabalho.",
        39: "[cole aqui as referências efetivamente citadas — ver "
            "entrega_senai/01_pesquisa/03_referencias_abnt.md]",
    }

    zin = zipfile.ZipFile(MODELO)
    doc = zin.read("word/document.xml").decode("utf-8")

    partes, pos = [], 0
    for i, m in enumerate(re.finditer(r"<w:p\b.*?</w:p>", doc, re.S)):
        partes.append(doc[pos:m.start()])
        par = m.group(0)
        if i in MAPA:
            par = troca_texto(par, MAPA[i])
        partes.append(par)
        pos = m.end()
    partes.append(doc[pos:])
    novo_doc = "".join(partes)

    shutil.copyfile(MODELO, SAIDA)
    # regrava o zip inteiro trocando só o document.xml
    zin2 = zipfile.ZipFile(MODELO)
    with zipfile.ZipFile(SAIDA, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin2.infolist():
            dados = zin2.read(item.filename)
            if item.filename == "word/document.xml":
                dados = novo_doc.encode("utf-8")
            zout.writestr(item, dados)

    # confere
    z = zipfile.ZipFile(SAIDA)
    x = z.read("word/document.xml").decode("utf-8")
    txt = re.sub(r"<[^>]+>", " ", re.sub(r"</w:p>", "\n", x))
    linhas = [" ".join(l.split()) for l in txt.split("\n") if l.strip()]
    print("gerado:", os.path.basename(SAIDA))
    print("parágrafos com texto:", len(linhas))
    for l in linhas[:8]:
        print("  ·", l[:90])
    palavras = sum(len(l.split()) for l in linhas[4:20])
    print("… corpo aproximado:", palavras, "palavras")


main()
