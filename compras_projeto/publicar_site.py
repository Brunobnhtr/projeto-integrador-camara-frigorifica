"""Publica a lista de compras no GitHub Pages (repositório público separado).

Copia só a página (lista_compras_interativa.html -> index.html) e o firebase-config.js
para ../site-lista-compras e faz commit + push. Nada mais do projeto é publicado.

    python compras_projeto/publicar_site.py
"""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

PROJETO = Path(__file__).resolve().parent.parent
SITE = PROJETO.parent / "site-lista-compras"
REPO = "lista-compras-projeto-integrador"


def rodar(*cmd: str, cwd: Path = SITE) -> None:
    print("$", " ".join(cmd))
    subprocess.run(cmd, cwd=cwd, check=True)


def main() -> None:
    novo = not (SITE / ".git").exists()
    SITE.mkdir(exist_ok=True)
    shutil.copy2(PROJETO / "lista_compras_interativa.html", SITE / "index.html")
    shutil.copy2(PROJETO / "firebase-config.js", SITE / "firebase-config.js")
    (SITE / ".nojekyll").touch()
    (SITE / "README.md").write_text(
        "# Lista de Compras — Projeto Integrador (SENAI)\n\n"
        "Página da lista de compras do grupo. Abra a aba **👥 Lista 3: Divisão do Grupo**,\n"
        "escolha seu nome em **Eu sou** e marque o que vai comprar.\n",
        encoding="utf-8",
    )
    if novo:
        rodar("git", "init", "-b", "main")
    rodar("git", "add", "-A")
    if subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=SITE).returncode == 0:
        print("Nada mudou desde a última publicação.")
        return
    rodar("git", "commit", "-m", "Atualiza lista de compras")
    if novo:
        rodar("gh", "repo", "create", REPO, "--public", "--source", ".", "--push",
              "--description", "Lista de compras do Projeto Integrador SENAI")
        dono = subprocess.run(["gh", "api", "user", "--jq", ".login"], capture_output=True, text=True, check=True).stdout.strip()
        rodar("gh", "api", "-X", "POST", f"repos/{dono}/{REPO}/pages",
              "-f", "source[branch]=main", "-f", "source[path]=/")
        print(f"\nSite: https://{dono.lower()}.github.io/{REPO}/  (leva 1–2 min na primeira vez)")
    else:
        rodar("git", "push")
        print("\nPublicado. O GitHub Pages atualiza em cerca de 1 minuto.")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as e:
        sys.exit(f"Falhou: {e}")
