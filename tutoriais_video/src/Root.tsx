import React from "react";
import { Composition } from "remotion";
import "./index.css";

import { ALTURA, FPS, LARGURA } from "./design";
import { duracaoTotalEmFrames, MapaCenas, Narracao, TutorialCamada } from "./TutorialCamada";

import narracaoC1D10 from "./narracao/camada1-doc10.gen.json";
import narracaoC3D31Reles from "./narracao/camada3-doc31-reles.gen.json";
import {
  CenaAbertura,
  CenaCenografia,
  CenaChecklist,
  CenaCorte,
  CenaDemarcacao,
  CenaEncerramento,
  CenaFiacao,
  CenaFuracao,
  CenaMateriais,
  CenaMoldura,
  CenaPintura,
  CenaVisaoGeral,
} from "./cenas/camada1doc10";
import {
  CenaDoisCaminhos,
  CenaK0,
  CenaK1Selo,
  CenaK2,
  CenaQuatorzePinos,
  CenaResumo,
  CenaReversivel,
  CenaTresNiveis,
} from "./cenas/camada3doc31reles";

/** Liga cada trecho de narração à sua cena visual. */
const CENAS_C1D10: MapaCenas = {
  "s00-abertura": CenaAbertura,
  "s01-visao": CenaVisaoGeral,
  "s02-materiais": CenaMateriais,
  "s03-corte": CenaCorte,
  "s04-furacao": CenaFuracao,
  "s05-moldura": CenaMoldura,
  "s06-pintura": CenaPintura,
  "s07-demarcacao": CenaDemarcacao,
  "s08-cenografia": CenaCenografia,
  "s09-fiacao": CenaFiacao,
  "s10-checklist": CenaChecklist,
  "s11-encerramento": CenaEncerramento,
};

const c1d10 = narracaoC1D10 as Narracao;

const CENAS_C3D31_RELES: MapaCenas = {
  "s00-tres-niveis": CenaTresNiveis,
  "s01-k0": CenaK0,
  "s02-k1-selo": CenaK1Selo,
  "s03-quatorze-pinos": CenaQuatorzePinos,
  "s04-reversivel": CenaReversivel,
  "s05-k2": CenaK2,
  "s06-dois-caminhos": CenaDoisCaminhos,
  "s07-resumo": CenaResumo,
};

const c3d31Reles = narracaoC3D31Reles as Narracao;

/**
 * O mapa de cenas NÃO pode ir por `defaultProps`: o Remotion serializa as
 * defaultProps em JSON para o editor de props, e componentes React não
 * sobrevivem à serialização (o resultado é um vídeo só com fundo e legenda).
 * Por isso cada tutorial tem um componente próprio que fecha sobre o seu mapa.
 */
const Camada1Doc10: React.FC = () => (
  <TutorialCamada narracao={c1d10} cenas={CENAS_C1D10} />
);

const Camada3Doc31Reles: React.FC = () => (
  <TutorialCamada narracao={c3d31Reles} cenas={CENAS_C3D31_RELES} />
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Camada1-Doc10-Base"
        component={Camada1Doc10}
        durationInFrames={duracaoTotalEmFrames(c1d10)}
        fps={FPS}
        width={LARGURA}
        height={ALTURA}
      />
      <Composition
        id="Camada3-Doc31-Reles"
        component={Camada3Doc31Reles}
        durationInFrames={duracaoTotalEmFrames(c3d31Reles)}
        fps={FPS}
        width={LARGURA}
        height={ALTURA}
      />
    </>
  );
};
