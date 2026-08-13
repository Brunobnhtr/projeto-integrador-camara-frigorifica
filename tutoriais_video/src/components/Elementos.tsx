import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { cor, fonteMono, fonteTexto, fonteTitulo } from "../design";

/** Aparecimento suave, com atraso em frames. */
export const useAparecer = (atraso = 0, duracao = 14) => {
  const frame = useCurrentFrame();
  const t = frame - atraso;
  return {
    opacity: interpolate(t, [0, duracao], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }),
    y: interpolate(t, [0, duracao], [26, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }),
  };
};

/**
 * Caixa de desenho técnico.
 *
 * Um SVG com `height: 100%` dentro de um item flex sem altura definida
 * resolve para `auto` e estoura o layout — foi o que fez os desenhos
 * invadirem a faixa de legenda. Aqui o filho é posicionado de forma
 * absoluta dentro de uma caixa de tamanho definido, então o desenho
 * sempre cabe exatamente na área disponível.
 */
export const Quadro: React.FC<{
  flex?: number;
  children: React.ReactNode;
  padding?: number;
}> = ({ flex = 1, children, padding = 0 }) => (
  <div style={{ flex, position: "relative", minWidth: 0, minHeight: 0 }}>
    <div
      style={{
        position: "absolute",
        inset: padding,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  </div>
);

/**
 * Envoltório de aparecimento. Existe para que o hook `useAparecer` nunca
 * seja chamado dentro de um `.map()` — o que violaria as regras de hooks.
 */
export const Aparecer: React.FC<{
  atraso?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ atraso = 0, children, style }) => {
  const { opacity, y } = useAparecer(atraso);
  return <div style={{ opacity, transform: `translateY(${y}px)`, ...style }}>{children}</div>;
};

export const useMola = (atraso = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - atraso, fps, config: { damping: 16, mass: 0.7 } });
};

/** Cabeçalho da cena: número do passo + título + linha de apoio. */
export const TituloCena: React.FC<{
  passo?: string;
  titulo: string;
  apoio?: string;
  destaque?: string;
}> = ({ passo, titulo, apoio, destaque = cor.ambar }) => {
  const { opacity, y } = useAparecer(2);
  return (
    <div style={{ opacity, transform: `translateY(${y}px)`, marginBottom: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {passo ? (
          <div
            style={{
              fontFamily: fonteMono,
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 3,
              color: destaque,
              border: `2px solid ${destaque}`,
              borderRadius: 6,
              padding: "6px 14px",
            }}
          >
            {passo}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: fonteTitulo,
            fontSize: 66,
            fontWeight: 800,
            color: cor.texto,
            letterSpacing: -0.5,
          }}
        >
          {titulo}
        </div>
      </div>
      {apoio ? (
        <div
          style={{
            fontFamily: fonteTexto,
            fontSize: 30,
            color: cor.textoFraco,
            marginTop: 10,
          }}
        >
          {apoio}
        </div>
      ) : null}
    </div>
  );
};

/** Caixa de aviso — usada para os pontos onde o aluno costuma errar. */
export const Aviso: React.FC<{
  tipo?: "atencao" | "erro" | "ok" | "info";
  titulo: string;
  texto: string;
  atraso?: number;
  largura?: number | string;
}> = ({ tipo = "atencao", titulo, texto, atraso = 0, largura = "100%" }) => {
  const { opacity, y } = useAparecer(atraso);
  const paleta = {
    atencao: { c: cor.ambar, f: "rgba(245,165,36,0.10)", i: "!" },
    erro: { c: cor.vermelho, f: "rgba(248,113,113,0.10)", i: "×" },
    ok: { c: cor.verde, f: "rgba(61,214,140,0.10)", i: "✓" },
    info: { c: cor.azul, f: "rgba(63,189,243,0.10)", i: "i" },
  }[tipo];

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        width: largura,
        display: "flex",
        gap: 22,
        alignItems: "flex-start",
        backgroundColor: paleta.f,
        border: `2px solid ${paleta.c}`,
        borderLeft: `10px solid ${paleta.c}`,
        borderRadius: 12,
        padding: "24px 30px",
      }}
    >
      <div
        style={{
          fontFamily: fonteTitulo,
          fontSize: 40,
          fontWeight: 800,
          color: paleta.c,
          lineHeight: 1,
          minWidth: 34,
          textAlign: "center",
        }}
      >
        {paleta.i}
      </div>
      <div>
        <div style={{ fontFamily: fonteTitulo, fontSize: 32, fontWeight: 700, color: paleta.c }}>
          {titulo}
        </div>
        <div
          style={{
            fontFamily: fonteTexto,
            fontSize: 27,
            color: cor.texto,
            marginTop: 6,
            lineHeight: 1.42,
          }}
        >
          {texto}
        </div>
      </div>
    </div>
  );
};

/** Cartão de material / ferramenta. */
export const Cartao: React.FC<{
  icone: React.ReactNode;
  titulo: string;
  detalhe: string;
  atraso?: number;
}> = ({ icone, titulo, detalhe, atraso = 0 }) => {
  const mola = useMola(atraso);
  return (
    <div
      style={{
        opacity: mola,
        transform: `scale(${0.9 + mola * 0.1})`,
        backgroundColor: cor.superficie,
        border: `2px solid ${cor.borda}`,
        borderRadius: 14,
        padding: "22px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        textAlign: "center",
      }}
    >
      <div style={{ height: 74, display: "flex", alignItems: "center" }}>{icone}</div>
      <div style={{ fontFamily: fonteTitulo, fontSize: 25, fontWeight: 700, color: cor.texto }}>
        {titulo}
      </div>
      <div style={{ fontFamily: fonteMono, fontSize: 20, color: cor.textoFraco }}>{detalhe}</div>
    </div>
  );
};

/** Item de checklist que marca sozinho no tempo certo. */
export const ItemChecklist: React.FC<{ texto: string; atraso: number }> = ({ texto, atraso }) => {
  const frame = useCurrentFrame();
  const marcado = frame >= atraso;
  const mola = useMola(atraso - 8);
  return (
    <div
      style={{
        opacity: mola,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "14px 22px",
        backgroundColor: marcado ? "rgba(61,214,140,0.09)" : cor.superficie,
        border: `2px solid ${marcado ? cor.verde : cor.borda}`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          border: `3px solid ${marcado ? cor.verde : cor.bordaForte}`,
          backgroundColor: marcado ? cor.verde : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fonteTitulo,
          fontSize: 26,
          fontWeight: 800,
          color: cor.fundo,
        }}
      >
        {marcado ? "✓" : ""}
      </div>
      <div style={{ fontFamily: fonteTexto, fontSize: 28, color: cor.texto }}>{texto}</div>
    </div>
  );
};

/** Cota horizontal animada (desenho técnico). */
export const CotaH: React.FC<{
  x1: number;
  x2: number;
  y: number;
  rotulo: string;
  atraso?: number;
  corLinha?: string;
}> = ({ x1, x2, y, rotulo, atraso = 0, corLinha = cor.vermelho }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - atraso, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const xf = x1 + (x2 - x1) * p;
  return (
    <g opacity={p > 0 ? 1 : 0}>
      <line x1={x1} y1={y - 9} x2={x1} y2={y + 9} stroke={corLinha} strokeWidth={2} />
      <line x1={x1} y1={y} x2={xf} y2={y} stroke={corLinha} strokeWidth={2} />
      <line x1={x2} y1={y - 9} x2={x2} y2={y + 9} stroke={corLinha} strokeWidth={2} opacity={p} />
      <text
        x={(x1 + x2) / 2}
        y={y - 16}
        fill={corLinha}
        fontFamily={fonteMono}
        fontSize={26}
        fontWeight={700}
        textAnchor="middle"
        opacity={p}
      >
        {rotulo}
      </text>
    </g>
  );
};

/** Cota vertical animada. */
export const CotaV: React.FC<{
  y1: number;
  y2: number;
  x: number;
  rotulo: string;
  atraso?: number;
  corLinha?: string;
}> = ({ y1, y2, x, rotulo, atraso = 0, corLinha = cor.vermelho }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - atraso, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const yf = y1 + (y2 - y1) * p;
  return (
    <g opacity={p > 0 ? 1 : 0}>
      <line x1={x - 9} y1={y1} x2={x + 9} y2={y1} stroke={corLinha} strokeWidth={2} />
      <line x1={x} y1={y1} x2={x} y2={yf} stroke={corLinha} strokeWidth={2} />
      <line x1={x - 9} y1={y2} x2={x + 9} y2={y2} stroke={corLinha} strokeWidth={2} opacity={p} />
      <text
        x={x - 18}
        y={(y1 + y2) / 2}
        fill={corLinha}
        fontFamily={fonteMono}
        fontSize={26}
        fontWeight={700}
        textAnchor="middle"
        opacity={p}
        transform={`rotate(-90 ${x - 18} ${(y1 + y2) / 2})`}
      >
        {rotulo}
      </text>
    </g>
  );
};
