import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { ALTURA, cor, ESPACO, fonteMono, fonteTitulo, LARGURA } from "../design";

/** Fundo comum a todas as cenas: gradiente, malha técnica e vinheta. */
export const Fundo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: cor.fundo }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 85% 65% at 50% 32%, ${cor.fundoAlt} 0%, ${cor.fundo} 72%)`,
        }}
      />
      <svg width={LARGURA} height={ALTURA} style={{ position: "absolute", opacity: 0.5 }}>
        <defs>
          <pattern id="malha" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0 L0 0 0 60" fill="none" stroke={cor.borda} strokeWidth="1" opacity="0.35" />
          </pattern>
          <pattern id="malhaFina" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M12 0 L0 0 0 12" fill="none" stroke={cor.borda} strokeWidth="0.5" opacity="0.18" />
          </pattern>
        </defs>
        <rect width={LARGURA} height={ALTURA} fill="url(#malhaFina)" />
        <rect width={LARGURA} height={ALTURA} fill="url(#malha)" />
      </svg>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 78% 62% at 50% 45%, transparent 42%, rgba(0,0,0,0.62) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

type BarraProps = {
  camada: string;
  documento: string;
  titulo: string;
  cenaAtual: number;
  totalCenas: number;
  progresso: number;
};

/** Barra superior fixa: identifica sempre em que camada e passo o aluno está. */
export const BarraSuperior: React.FC<BarraProps> = ({
  camada,
  documento,
  titulo,
  cenaAtual,
  totalCenas,
  progresso,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: LARGURA,
        height: ESPACO.topoBarra,
        display: "flex",
        alignItems: "center",
        paddingLeft: ESPACO.margemLateral,
        paddingRight: ESPACO.margemLateral,
        gap: 28,
        borderBottom: `2px solid ${cor.borda}`,
        backgroundColor: "rgba(10,14,19,0.72)",
      }}
    >
      <div
        style={{
          fontFamily: fonteMono,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 2,
          color: cor.fundo,
          backgroundColor: cor.ambar,
          padding: "8px 16px",
          borderRadius: 6,
        }}
      >
        {camada}
      </div>
      <div style={{ fontFamily: fonteMono, fontSize: 22, color: cor.textoApagado, letterSpacing: 2 }}>
        {documento}
      </div>
      <div
        style={{
          fontFamily: fonteTitulo,
          fontSize: 30,
          fontWeight: 700,
          color: cor.texto,
          letterSpacing: 0.5,
        }}
      >
        {titulo}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ fontFamily: fonteMono, fontSize: 24, color: cor.textoFraco, letterSpacing: 2 }}>
        {String(cenaAtual).padStart(2, "0")} / {String(totalCenas).padStart(2, "0")}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: -2,
          left: 0,
          height: 4,
          width: LARGURA * progresso,
          backgroundColor: cor.ambar,
        }}
      />
    </div>
  );
};

/** Área útil da cena, já respeitando barra superior e faixa de legenda. */
export const AreaCena: React.FC<{ children: React.ReactNode; entrada?: boolean }> = ({
  children,
  entrada = true,
}) => {
  const frame = useCurrentFrame();
  const opacidade = entrada
    ? interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" })
    : 1;
  const deslocamento = entrada
    ? interpolate(frame, [0, 16], [22, 0], { extrapolateRight: "clamp" })
    : 0;

  return (
    <div
      style={{
        position: "absolute",
        top: ESPACO.topoBarra,
        left: 0,
        width: LARGURA,
        height: ALTURA - ESPACO.topoBarra - ESPACO.faixaLegenda,
        paddingLeft: ESPACO.margemLateral,
        paddingRight: ESPACO.margemLateral,
        paddingTop: 44,
        paddingBottom: 20,
        opacity: opacidade,
        transform: `translateY(${deslocamento}px)`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
};
