import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { ALTURA, ESPACO, FPS, LARGURA, msParaFrames, cor } from "./design";
import { AreaCena, BarraSuperior, Fundo } from "./components/Palco";
import { Legenda, Linha, Palavra } from "./components/Legenda";

export type Beat = {
  id: string;
  cena: string;
  texto: string;
  audio: string;
  durationMs: number;
  captions: Palavra[];
  linhas: Linha[];
};

export type Narracao = {
  id: string;
  titulo: string;
  camada: string;
  documento: string;
  totalMs: number;
  beats: Beat[];
};

export type MapaCenas = Record<string, React.FC>;

export const duracaoTotalEmFrames = (narracao: Narracao) =>
  narracao.beats.reduce((soma, b) => soma + msParaFrames(b.durationMs), 0);

/**
 * Monta um tutorial completo: cada trecho de narração vira uma cena,
 * com duração exatamente igual à do áudio gerado pelo edge-tts.
 */
export const TutorialCamada: React.FC<{
  narracao: Narracao;
  cenas: MapaCenas;
}> = ({ narracao, cenas }) => {
  const total = duracaoTotalEmFrames(narracao);

  let acumulado = 0;
  const trechos = narracao.beats.map((beat) => {
    const inicio = acumulado;
    const duracao = msParaFrames(beat.durationMs);
    acumulado += duracao;
    return { beat, inicio, duracao };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: cor.fundo }}>
      <Fundo />

      {trechos.map(({ beat, inicio, duracao }, indice) => {
        const Cena = cenas[beat.id];
        return (
          <Sequence key={beat.id} from={inicio} durationInFrames={duracao} name={beat.id}>
            <Audio src={staticFile(beat.audio)} />

            <BarraSuperior
              camada={narracao.camada}
              documento={narracao.documento}
              titulo={narracao.titulo}
              cenaAtual={indice + 1}
              totalCenas={narracao.beats.length}
              progresso={total === 0 ? 0 : (inicio + duracao / 2) / total}
            />

            <AreaCena>{Cena ? <Cena /> : null}</AreaCena>

            <Legenda linhas={beat.linhas} />
          </Sequence>
        );
      })}

      {/* moldura sutil, dá acabamento de peça técnica */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `1px solid ${cor.borda}`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export const CONFIG = { LARGURA, ALTURA, FPS, ESPACO } as const;
