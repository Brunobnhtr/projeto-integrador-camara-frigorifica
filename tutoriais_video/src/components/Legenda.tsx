import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ALTURA, cor, ESPACO, fonteTexto, LARGURA } from "../design";

export type Palavra = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number | null;
  confidence: number | null;
};

export type Linha = {
  text: string;
  startMs: number;
  endMs: number;
  palavras: Palavra[];
};

/**
 * Faixa de legenda com destaque palavra a palavra (karaokê).
 *
 * Os tempos vêm dos eventos WordBoundary do edge-tts, então o destaque é
 * exatamente o que está sendo falado — não é uma estimativa.
 */
export const Legenda: React.FC<{ linhas: Linha[] }> = ({ linhas }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const agoraMs = (frame / fps) * 1000;

  const linhaAtiva =
    linhas.find((l) => agoraMs >= l.startMs - 120 && agoraMs <= l.endMs + 320) ??
    (agoraMs < (linhas[0]?.startMs ?? 0) ? linhas[0] : linhas[linhas.length - 1]);

  if (!linhaAtiva) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: ALTURA - ESPACO.faixaLegenda,
        width: LARGURA,
        height: ESPACO.faixaLegenda,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: ESPACO.margemLateral,
        paddingRight: ESPACO.margemLateral,
        background: `linear-gradient(to top, rgba(6,9,13,0.97) 24%, rgba(6,9,13,0.0) 100%)`,
        borderTop: `1px solid ${cor.borda}`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 15px",
          maxWidth: 1500,
          lineHeight: 1.28,
        }}
      >
        {linhaAtiva.palavras.map((palavra, indice) => {
          const falada = agoraMs >= palavra.startMs;
          const atual = agoraMs >= palavra.startMs && agoraMs <= palavra.endMs;
          return (
            <span
              key={`${palavra.startMs}-${indice}`}
              style={{
                fontFamily: fonteTexto,
                fontSize: 46,
                fontWeight: atual ? 700 : 500,
                color: atual ? cor.ambar : falada ? cor.texto : cor.textoApagado,
                textShadow: atual ? `0 0 26px rgba(245,165,36,0.35)` : "none",
              }}
            >
              {palavra.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
