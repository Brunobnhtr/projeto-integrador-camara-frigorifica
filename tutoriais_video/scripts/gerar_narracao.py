"""
Gerador de narracao para os tutoriais em video do Projeto Integrador.

Le um roteiro em roteiros/<id>.json, sintetiza a narracao em portugues do Brasil
com vozes neurais (edge-tts, gratuito e sem chave de API) e produz:

  public/audio/<id>/<beat>.mp3        - audio de cada trecho
  src/narracao/<id>.gen.json          - duracoes + legendas palavra a palavra

As legendas saem no formato Caption do @remotion/captions, com timing por
palavra, o que permite legenda estilo karaoke perfeitamente sincronizada.

Uso:
    python scripts/gerar_narracao.py camada1-doc10
    python scripts/gerar_narracao.py --todos
"""

from __future__ import annotations

import asyncio
import json
import os
import subprocess
import sys
from pathlib import Path

try:
    import certifi

    os.environ.setdefault("SSL_CERT_FILE", certifi.where())
    os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())
except ImportError:  # pragma: no cover
    pass

import edge_tts

RAIZ = Path(__file__).resolve().parent.parent
ROTEIROS = RAIZ / "roteiros"
AUDIO_PUB = RAIZ / "public" / "audio"
NARRACAO_SRC = RAIZ / "src" / "narracao"

# edge-tts devolve tempos em unidades de 100 nanossegundos
TICKS_POR_MS = 10_000

# Silencio adicionado no fim de cada trecho, para a cena nao cortar seca
RESPIRO_MS = 700


def duracao_ms(caminho: Path) -> int:
    """Duracao real do MP3 via ffprobe."""
    try:
        saida = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                str(caminho),
            ],
            capture_output=True,
            text=True,
            check=True,
        )
        return int(float(saida.stdout.strip()) * 1000)
    except (subprocess.CalledProcessError, FileNotFoundError, ValueError):
        return 0


async def sintetizar(texto: str, voz: str, taxa: str, destino: Path):
    """Sintetiza um trecho e devolve as legendas palavra a palavra.

    ATENCAO: o edge-tts 7.x usa boundary='SentenceBoundary' por padrao, que
    devolve a frase inteira como um unico evento. Para legenda estilo karaoke
    e obrigatorio pedir boundary='WordBoundary'.
    """
    comunicador = edge_tts.Communicate(
        texto, voz, rate=taxa, boundary="WordBoundary"
    )
    legendas: list[dict] = []

    destino.parent.mkdir(parents=True, exist_ok=True)
    with open(destino, "wb") as arquivo:
        async for pedaco in comunicador.stream():
            tipo = pedaco.get("type")
            if tipo == "audio":
                arquivo.write(pedaco["data"])
            elif tipo in ("WordBoundary", "SentenceBoundary"):
                inicio = pedaco["offset"] // TICKS_POR_MS
                fim = inicio + pedaco["duration"] // TICKS_POR_MS
                legendas.append(
                    {
                        "text": pedaco["text"],
                        "startMs": inicio,
                        "endMs": fim,
                        "timestampMs": (inicio + fim) // 2,
                        "confidence": None,
                    }
                )

    return legendas


def agrupar_em_linhas(legendas: list[dict], max_caracteres: int = 62) -> list[dict]:
    """Agrupa palavras em linhas de legenda legiveis.

    Uma palavra por vez pisca demais e cansa; a linha inteira de uma vez perde
    o sincronismo. O meio-termo e uma linha curta por vez, com as palavras
    destacadas conforme sao faladas (o componente de legenda cuida do destaque).
    """
    linhas: list[dict] = []
    atual: list[dict] = []

    for palavra in legendas:
        candidato = " ".join(p["text"] for p in atual + [palavra])
        quebra_forte = atual and atual[-1]["text"].endswith((".", "!", "?", ":"))

        if atual and (len(candidato) > max_caracteres or quebra_forte):
            linhas.append(
                {
                    "text": " ".join(p["text"] for p in atual),
                    "startMs": atual[0]["startMs"],
                    "endMs": atual[-1]["endMs"],
                    "palavras": atual,
                }
            )
            atual = []

        atual.append(palavra)

    if atual:
        linhas.append(
            {
                "text": " ".join(p["text"] for p in atual),
                "startMs": atual[0]["startMs"],
                "endMs": atual[-1]["endMs"],
                "palavras": atual,
            }
        )

    return linhas


async def processar(nome: str) -> None:
    caminho_roteiro = ROTEIROS / f"{nome}.json"
    if not caminho_roteiro.exists():
        raise SystemExit(f"Roteiro nao encontrado: {caminho_roteiro}")

    roteiro = json.loads(caminho_roteiro.read_text(encoding="utf-8"))
    voz = roteiro.get("voz", "pt-BR-AntonioNeural")
    taxa = roteiro.get("taxa", "+0%")

    print(f"\n  Roteiro : {roteiro['titulo']}")
    print(f"  Voz     : {voz}  (taxa {taxa})")
    print(f"  Trechos : {len(roteiro['beats'])}\n")

    saida_beats = []
    total_ms = 0

    for indice, beat in enumerate(roteiro["beats"]):
        mp3 = AUDIO_PUB / nome / f"{beat['id']}.mp3"
        legendas = await sintetizar(beat["texto"], voz, taxa, mp3)

        dur = duracao_ms(mp3)
        if dur == 0 and legendas:  # ffprobe indisponivel: estima pela ultima palavra
            dur = legendas[-1]["endMs"] + 300
        dur += RESPIRO_MS

        total_ms += dur
        saida_beats.append(
            {
                "id": beat["id"],
                "cena": beat.get("cena", ""),
                "texto": beat["texto"],
                "audio": f"audio/{nome}/{beat['id']}.mp3",
                "durationMs": dur,
                "captions": legendas,
                "linhas": agrupar_em_linhas(legendas),
            }
        )

        print(
            f"  [{indice + 1:02d}/{len(roteiro['beats'])}] "
            f"{beat['id']:<18} {dur / 1000:6.2f}s  "
            f"{len(legendas):3d} palavras"
        )

    NARRACAO_SRC.mkdir(parents=True, exist_ok=True)
    destino_json = NARRACAO_SRC / f"{nome}.gen.json"
    destino_json.write_text(
        json.dumps(
            {
                "id": roteiro["id"],
                "titulo": roteiro["titulo"],
                "camada": roteiro.get("camada", ""),
                "documento": roteiro.get("documento", ""),
                "totalMs": total_ms,
                "beats": saida_beats,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    minutos, segundos = divmod(total_ms // 1000, 60)
    print(f"\n  Total: {minutos}min {segundos:02d}s")
    print(f"  Audio: {AUDIO_PUB / nome}")
    print(f"  Dados: {destino_json}\n")


def main() -> None:
    argumentos = sys.argv[1:]
    if not argumentos:
        raise SystemExit(
            "Uso: python scripts/gerar_narracao.py <roteiro> | --todos\n"
            f"Roteiros disponiveis: "
            f"{', '.join(p.stem for p in ROTEIROS.glob('*.json'))}"
        )

    if argumentos[0] == "--todos":
        nomes = sorted(p.stem for p in ROTEIROS.glob("*.json"))
    else:
        nomes = argumentos

    for nome in nomes:
        asyncio.run(processar(nome))


if __name__ == "__main__":
    main()
