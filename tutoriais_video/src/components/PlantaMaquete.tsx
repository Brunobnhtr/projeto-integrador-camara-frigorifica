import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { cor, fonteMono, fonteTitulo } from "../design";

/** Zonas da maquete, na ordem em que a energia caminha (esquerda → direita). */
export type Setor = "A" | "B" | "C" | "D" | "E";

const mmY = (y: number) => 500 - y; // o SVG cresce para baixo

/** Furos da base, em coordenadas reais (Doc 10 §10.3). */
export const FUROS = [
  { x: 360, y: 265, d: 12, nome: "poste P1" },
  { x: 475, y: 265, d: 12, nome: "poste P2" },
  { x: 590, y: 265, d: 12, nome: "poste P3" },
  { x: 300, y: 330, d: 16, nome: "saída da subestação" },
  { x: 740, y: 305, d: 12, nome: "entrada 24 V potência" },
  { x: 800, y: 305, d: 10, nome: "entrada 5 V comando" },
  { x: 860, y: 305, d: 10, nome: "entrada 12 V auxiliar" },
  { x: 1080, y: 330, d: 20, nome: "chicote da câmara" },
  { x: 1400, y: 330, d: 10, nome: "dreno" },
];

type Props = {
  setorAtivo?: Setor | null;
  mostrarFuros?: boolean;
  mostrarDemarcacao?: boolean;
  mostrarLegendas?: boolean;
  mostrarRua?: boolean;
  desenho?: number;
};

export const PlantaMaquete: React.FC<Props> = ({
  setorAtivo = null,
  mostrarFuros = false,
  mostrarDemarcacao = false,
  mostrarLegendas = true,
  mostrarRua = true,
  desenho = 1,
}) => {
  const frame = useCurrentFrame();
  const pulso = 0.55 + 0.45 * Math.sin(frame / 7);
  const op = (s: Setor) => (setorAtivo && setorAtivo !== s ? 0.2 : 1);

  return (
    <svg viewBox="-40 -46 1580 606" style={{ width: "100%", height: "100%" }}>
      <defs>
        <pattern id="zebraPlanta" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="14" fill={cor.zebraClara} />
          <rect x="7" width="7" height="14" fill={cor.zebraEscura} />
        </pattern>
        <pattern id="britaPlanta" width="9" height="9" patternUnits="userSpaceOnUse">
          <rect width="9" height="9" fill="#3B3A34" />
          <circle cx="2.5" cy="2.5" r="1.1" fill="#5E5A4C" />
          <circle cx="6.5" cy="6.5" r="1.1" fill="#5E5A4C" />
        </pattern>
      </defs>

      {/* base */}
      <rect x={0} y={0} width={1500 * desenho} height={500} fill={cor.superficie} stroke={cor.bordaForte} strokeWidth={3} />
      <g opacity={desenho} stroke={cor.borda} strokeWidth={1.5} strokeDasharray="8 6">
        <line x1={400} y1={0} x2={400} y2={500} />
        <line x1={750} y1={0} x2={750} y2={500} />
        <line x1={1100} y1={0} x2={1100} y2={500} />
      </g>

      <g opacity={desenho > 0.98 ? 1 : 0}>
        {/* ─────────── RUA (zona externa) ─────────── */}
        {mostrarRua ? (
          <g opacity={setorAtivo && setorAtivo !== "A" && setorAtivo !== "B" ? 0.25 : 1}>
            <rect x={10} y={mmY(285)} width={620} height={40} fill="#2B3138" />
            <rect x={10} y={mmY(245)} width={620} height={150} fill="#1C2126" />
            <rect x={10} y={mmY(95)} width={620} height={40} fill="#2B3138" />
            <line x1={10} y1={mmY(245)} x2={630} y2={mmY(245)} stroke="#6B747C" strokeWidth={2.5} />
            <line x1={10} y1={mmY(95)} x2={630} y2={mmY(95)} stroke="#6B747C" strokeWidth={2.5} />
            <line x1={20} y1={mmY(170)} x2={620} y2={mmY(170)} stroke="#7C868F" strokeWidth={2.5} strokeDasharray="14 14" />
            {[250, 266, 282, 298].map((x) => (
              <rect key={x} x={x} y={mmY(242)} width={8} height={144} fill="#7C868F" />
            ))}
            {/* veículos */}
            <rect x={150} y={mmY(212)} width={88} height={34} rx={8} fill="#2E86C1" stroke="#17466E" strokeWidth={2} />
            <rect x={400} y={mmY(156)} width={150} height={40} rx={5} fill="#C6CDD4" stroke="#7B848D" strokeWidth={2} />
            <rect x={400} y={mmY(156)} width={42} height={40} rx={5} fill="#E8730C" stroke="#8A4300" strokeWidth={2} />
            {/* postes de iluminação */}
            {[150, 330, 510].map((x) => (
              <g key={x}>
                <circle cx={x} cy={mmY(75)} r={5} fill="#5F7288" stroke={cor.texto} strokeWidth={1.5} />
                <path d={`M${x} ${mmY(75)} q22 -6 26 -18`} fill="none" stroke="#5F7288" strokeWidth={2.5} />
                <circle cx={x + 28} cy={mmY(96)} r={4.5} fill="#FFF3B0" stroke="#B8860B" strokeWidth={1.5} />
              </g>
            ))}
            {mostrarLegendas ? (
              <text x={330} y={mmY(218)} fill="#7C868F" fontFamily={fonteTitulo} fontSize={22} fontWeight={700}>
                R U A — V I A   P Ú B L I C A
              </text>
            ) : null}
          </g>
        ) : null}

        {/* ─────────── SETOR A · SUBESTAÇÃO ─────────── */}
        <g opacity={op("A")}>
          <rect x={10} y={mmY(490)} width={290} height={205} fill="url(#britaPlanta)" stroke="#6C6350" strokeWidth={2} />
          <rect x={10} y={mmY(490)} width={290} height={205} fill="none" stroke="#6C757D" strokeWidth={3} strokeDasharray="3 4" />
          <rect x={25} y={mmY(485)} width={260} height={190} fill="#25415E" stroke="#5B8FC7" strokeWidth={2.5} />
          {mostrarLegendas ? (
            <>
              <text x={155} y={mmY(430)} fill="#BBD6F0" fontFamily={fonteTitulo} fontSize={23} fontWeight={700} textAnchor="middle">SUBESTAÇÃO</text>
              <text x={155} y={mmY(404)} fill="#8FB6DC" fontFamily={fonteMono} fontSize={19} textAnchor="middle">FONTE 24 Vcc · 240 W</text>
              <text x={155} y={mmY(380)} fill="#8FB6DC" fontFamily={fonteMono} fontSize={17} textAnchor="middle">Q0 · S3 · F1 F2 F3</text>
              <text x={155} y={mmY(322)} fill="#9A8F73" fontFamily={fonteMono} fontSize={16} textAnchor="middle">pátio com brita e cerca</text>
            </>
          ) : null}
        </g>

        {/* ─────────── SETOR B · LINHA E POSTES ─────────── */}
        <g opacity={op("B")}>
          {[
            { c: "#C0392B", dy: 0 },
            { c: "#8B6A38", dy: 7 },
            { c: "#95A5A6", dy: 14 },
          ].map((l) => (
            <g key={l.c} fill="none" stroke={l.c} strokeWidth={3}>
              <path d={`M300 ${mmY(280) + l.dy} Q330 ${mmY(276) + l.dy} 360 ${mmY(280) + l.dy}`} />
              <path d={`M360 ${mmY(280) + l.dy} Q417 ${mmY(274) + l.dy} 475 ${mmY(280) + l.dy}`} />
              <path d={`M475 ${mmY(280) + l.dy} Q532 ${mmY(274) + l.dy} 590 ${mmY(280) + l.dy}`} />
            </g>
          ))}
          <g fill="none" stroke="#5DADE2" strokeWidth={4.5}>
            <path d={`M300 ${mmY(280) + 22} Q330 ${mmY(276) + 22} 360 ${mmY(280) + 22}`} />
            <path d={`M360 ${mmY(280) + 22} Q417 ${mmY(274) + 22} 475 ${mmY(280) + 22}`} />
            <path d={`M475 ${mmY(280) + 22} Q532 ${mmY(274) + 22} 590 ${mmY(280) + 22}`} />
          </g>

          {[
            { x: 360, nome: "P1", t: "derivação 24 V", v: "24.0V", w: 34, h: 26 },
            { x: 475, nome: "P2", t: "T2 · 5 V", v: "5.10V", w: 34, h: 26 },
            { x: 590, nome: "P3", t: "T3 · 12 V", v: "12.0V", w: 34, h: 26 },
          ].map((p) => (
            <g key={p.nome}>
              <line x1={p.x - 16} y1={mmY(280)} x2={p.x + 16} y2={mmY(280)} stroke="#7C8B9C" strokeWidth={4} />
              <circle cx={p.x} cy={mmY(268)} r={8} fill="#868E96" stroke={cor.texto} strokeWidth={2} />
              <rect x={p.x - p.w / 2} y={mmY(252)} width={p.w} height={p.h} rx={4} fill="#2A4534" stroke="#3DD68C" strokeWidth={2} />
              <rect x={p.x - p.w / 2 + 5} y={mmY(248)} width={p.w - 10} height={13} fill="#0A0E13" />
              <text x={p.x} y={mmY(240)} fill="#8CE99A" fontFamily={fonteMono} fontSize={11} textAnchor="middle">{p.v}</text>
              <text x={p.x} y={mmY(292)} fill={cor.texto} fontFamily={fonteMono} fontSize={19} fontWeight={700} textAnchor="middle">{p.nome}</text>
              {mostrarLegendas ? (
                <text x={p.x} y={mmY(202)} fill="#8FE3BC" fontFamily={fonteMono} fontSize={17} textAnchor="middle">{p.t}</text>
              ) : null}
            </g>
          ))}
        </g>

        {/* ─────────── MURO / PORTÃO / GUARITA ─────────── */}
        <g opacity={setorAtivo && setorAtivo !== "C" ? 0.35 : 1}>
          <rect x={640} y={mmY(290)} width={12} height={290} fill="#8C959E" stroke={cor.borda} strokeWidth={2} />
          <rect x={640} y={mmY(200)} width={12} height={80} fill={cor.fundo} stroke="#3FBDF3" strokeWidth={2} strokeDasharray="5 4" />
          <rect x={660} y={mmY(245)} width={45} height={45} fill="#39434F" stroke={cor.borda} strokeWidth={2} />
          {mostrarLegendas ? (
            <>
              <text x={634} y={mmY(150)} fill="#3FBDF3" fontFamily={fonteMono} fontSize={17} fontWeight={700} textAnchor="middle" transform={`rotate(-90 634 ${mmY(150)})`}>PORTÃO</text>
              <text x={682} y={mmY(215)} fill={cor.textoFraco} fontFamily={fonteMono} fontSize={13} textAnchor="middle">guarita</text>
            </>
          ) : null}
        </g>

        {/* ─────────── SETOR D · PAINEL ─────────── */}
        <g opacity={op("D")}>
          <rect x={690} y={mmY(500)} width={400} height={200} fill="#2A3441" stroke="#9AA5B1" strokeWidth={2.5} />
          <rect x={700} y={mmY(490)} width={380} height={180} fill="none" stroke={cor.borda} strokeWidth={1.2} strokeDasharray="6 4" />
          {mostrarLegendas ? (
            <>
              <text x={890} y={mmY(424)} fill={cor.texto} fontFamily={fonteTitulo} fontSize={25} fontWeight={700} textAnchor="middle">PAINEL DE COMANDO</text>
              <text x={890} y={mmY(398)} fill={cor.textoFraco} fontFamily={fonteMono} fontSize={18} textAnchor="middle">400 × 500 × 200</text>
              <text x={890} y={mmY(374)} fill={cor.textoApagado} fontFamily={fonteMono} fontSize={16} textAnchor="middle">5 blocos de distribuição</text>
            </>
          ) : null}
          <circle cx={740} cy={mmY(300)} r={7} fill="#F87171" stroke={cor.texto} strokeWidth={1.5} />
          <circle cx={800} cy={mmY(300)} r={6} fill="#F5A524" stroke={cor.texto} strokeWidth={1.5} />
          <circle cx={860} cy={mmY(300)} r={6} fill="#FFE066" stroke={cor.texto} strokeWidth={1.5} />
          {mostrarDemarcacao ? (
            <rect x={670} y={mmY(300)} width={440} height={30} fill="url(#zebraPlanta)" stroke={cor.zebraEscura} strokeWidth={1} />
          ) : null}
        </g>

        {/* ─────────── SETOR E · CÂMARA ─────────── */}
        <g opacity={op("E")}>
          <rect x={1130} y={mmY(486)} width={336} height={176} fill="#FFFFFF" stroke="#2E86C1" strokeWidth={2.5} />
          <rect x={1170} y={mmY(460)} width={256} height={112} fill="#CFE7F7" stroke="#2E86C1" strokeWidth={1.5} />
          {mostrarLegendas ? (
            <>
              <text x={1298} y={mmY(420)} fill="#0B5394" fontFamily={fonteTitulo} fontSize={24} fontWeight={700} textAnchor="middle">❄ CÂMARA FRIGORÍFICA</text>
              <text x={1298} y={mmY(394)} fill="#1B4F72" fontFamily={fonteMono} fontSize={18} textAnchor="middle">336 × 176 × 326</text>
              <text x={1298} y={mmY(370)} fill="#1B4F72" fontFamily={fonteMono} fontSize={16} textAnchor="middle">útil 5,0 L</text>
            </>
          ) : null}
        </g>

        {/* ─────────── SETOR C · CHÃO DE FÁBRICA ─────────── */}
        <g opacity={op("C")}>
          <rect x={670} y={mmY(265)} width={810} height={265} fill="#1B2430AA" stroke={cor.borda} strokeWidth={1.5} strokeDasharray="7 5" />
          {mostrarDemarcacao ? (
            <>
              <line x1={690} y1={mmY(140)} x2={1460} y2={mmY(140)} stroke={cor.zebraClara} strokeWidth={2.5} />
              <line x1={690} y1={mmY(80)} x2={1460} y2={mmY(80)} stroke={cor.zebraClara} strokeWidth={2.5} />
              <line x1={700} y1={mmY(30)} x2={1200} y2={mmY(30)} stroke={cor.verde} strokeWidth={2.5} />
            </>
          ) : null}
          <rect x={760} y={mmY(60)} width={34} height={22} fill="#8E7452" />
          <rect x={806} y={mmY(48)} width={34} height={22} fill="#8E7452" />
          <rect x={900} y={mmY(56)} width={48} height={20} fill="#C25E12" />
          <circle cx={1180} cy={mmY(48)} r={8} fill="#2E6FA8" />
          <circle cx={1050} cy={mmY(50)} r={5} fill={cor.textoFraco} />
          {mostrarLegendas ? (
            <text x={1075} y={mmY(200)} fill={cor.textoFraco} fontFamily={fonteTitulo} fontSize={24} fontWeight={700} textAnchor="middle">CHÃO DE FÁBRICA</text>
          ) : null}
        </g>

        {/* eletrocalha */}
        <path d={`M1090 ${mmY(390)} L1130 ${mmY(390)}`} fill="none" stroke="#A78BFA" strokeWidth={4} strokeDasharray="9 5" />
      </g>

      {/* furos */}
      {mostrarFuros
        ? FUROS.map((f, i) => {
            const p = interpolate(frame - 10 - i * 6, [0, 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            });
            return (
              <g key={f.nome} opacity={p}>
                <circle cx={f.x} cy={mmY(f.y)} r={f.d / 2 + 12 * (1 - p)} fill="none" stroke={cor.vermelho} strokeWidth={2.5} opacity={pulso} />
                <circle cx={f.x} cy={mmY(f.y)} r={f.d / 2} fill={cor.fundo} stroke={cor.vermelho} strokeWidth={2} />
                <text x={f.x} y={mmY(f.y) - 16} fill={cor.vermelho} fontFamily={fonteMono} fontSize={19} fontWeight={700} textAnchor="middle">
                  Ø{f.d}
                </text>
              </g>
            );
          })
        : null}

      {/* eixos */}
      <text x={-14} y={520} fill={cor.textoApagado} fontFamily={fonteMono} fontSize={18}>0,0</text>
      <line x1={0} y1={528} x2={80} y2={528} stroke={cor.textoApagado} strokeWidth={1.5} />
      <text x={90} y={534} fill={cor.textoApagado} fontFamily={fonteMono} fontSize={18}>X</text>
      <line x1={-20} y1={500} x2={-20} y2={420} stroke={cor.textoApagado} strokeWidth={1.5} />
      <text x={-30} y={412} fill={cor.textoApagado} fontFamily={fonteMono} fontSize={18}>Y</text>
    </svg>
  );
};
