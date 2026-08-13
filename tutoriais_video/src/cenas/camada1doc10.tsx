import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { cor, fonteMono, fonteTexto, fonteTitulo } from "../design";
import {
  Aparecer,
  Aviso,
  Cartao,
  CotaH,
  CotaV,
  ItemChecklist,
  Quadro,
  TituloCena,
  useMola,
} from "../components/Elementos";
import { PlantaMaquete, Setor } from "../components/PlantaMaquete";

const Linha: React.FC<{
  children: React.ReactNode;
  gap?: number;
  flex?: number;
  style?: React.CSSProperties;
}> = ({ children, gap = 28, flex, style }) => (
  <div style={{ display: "flex", gap, flex, minHeight: 0, ...style }}>{children}</div>
);

const Coluna: React.FC<{ children: React.ReactNode; flex?: number; gap?: number }> = ({
  children,
  flex = 1,
  gap = 24,
}) => (
  <div
    style={{
      flex,
      minWidth: 0,
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap,
    }}
  >
    {children}
  </div>
);

/* ─────────────────────────── 00 · ABERTURA ─────────────────────────── */

export const CenaAbertura: React.FC = () => {
  const frame = useCurrentFrame();
  const t1 = useMola(6);
  const t2 = useMola(16);
  const t3 = useMola(28);
  const linha = interpolate(frame - 40, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div
        style={{
          opacity: t1,
          transform: `translateY(${(1 - t1) * 30}px)`,
          fontFamily: fonteMono,
          fontSize: 32,
          letterSpacing: 9,
          color: cor.ambar,
          fontWeight: 700,
        }}
      >
        PROJETO INTEGRADOR · TUTORIAL EM VÍDEO
      </div>

      <div
        style={{
          opacity: t2,
          transform: `translateY(${(1 - t2) * 40}px)`,
          fontFamily: fonteTitulo,
          fontSize: 148,
          fontWeight: 800,
          color: cor.texto,
          lineHeight: 0.98,
          marginTop: 18,
          letterSpacing: -3,
        }}
      >
        CAMADA 1
      </div>
      <div
        style={{
          opacity: t3,
          transform: `translateY(${(1 - t3) * 40}px)`,
          fontFamily: fonteTitulo,
          fontSize: 92,
          fontWeight: 700,
          color: cor.ambar,
          lineHeight: 1,
          letterSpacing: -1,
        }}
      >
        Base e Chão de Fábrica
      </div>

      <div
        style={{
          height: 5,
          width: `${linha * 62}%`,
          backgroundColor: cor.ambar,
          marginTop: 34,
          borderRadius: 3,
        }}
      />

      <div
        style={{
          opacity: linha,
          fontFamily: fonteTexto,
          fontSize: 34,
          color: cor.textoFraco,
          marginTop: 26,
          maxWidth: 1180,
          lineHeight: 1.4,
        }}
      >
        A primeira coisa a construir. O terreno onde a planta industrial inteira vai ficar de pé.
      </div>
    </div>
  );
};

/* ─────────────────────── 01 · O QUE VOCÊ VAI CONSTRUIR ─────────────────────── */

export const CenaVisaoGeral: React.FC = () => {
  const frame = useCurrentFrame();
  const ordem: Setor[] = ["A", "B", "C", "D", "E"];
  const inicio = 66;
  const passo = 58;
  const indice = Math.floor((frame - inicio) / passo);
  const ativo = indice >= 0 && indice < ordem.length ? ordem[indice] : null;

  const rotulos: Record<Setor, { nome: string; desc: string; c: string }> = {
    A: { nome: "1 · SUBESTAÇÃO", desc: "127 V CA vira 24 V CC", c: "#5B8FC7" },
    B: { nome: "2 · LINHA 24 V", desc: "3 postes · 2 trafos + 1 derivação", c: cor.cobre },
    C: { nome: "MURO E PORTÃO", desc: "aqui a rua acaba", c: "#7C8B9C" },
    D: { nome: "3 · PAINEL", desc: "3 tensões, 3 entradas", c: "#C6D0DA" },
    E: { nome: "4 · CÂMARA", desc: "a carga do processo", c: "#4FA8D8" },
  };

  return (
    <>
      <TituloCena
        titulo="A energia caminha da esquerda para a direita"
        apoio="Base 1500 × 500 mm · MDF 12 mm + 3 travessas de reforço"
      />
      <Quadro flex={1}>
        <PlantaMaquete setorAtivo={ativo} />
      </Quadro>
      <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
        {ordem.map((s, i) => {
          const visivel = frame >= inicio + i * passo - 16;
          const destacado = ativo === s;
          return (
            <div
              key={s}
              style={{
                flex: 1,
                opacity: visivel ? 1 : 0.18,
                backgroundColor: destacado ? "rgba(245,165,36,0.12)" : cor.superficie,
                border: `2px solid ${destacado ? cor.ambar : cor.borda}`,
                borderTop: `7px solid ${rotulos[s].c}`,
                borderRadius: 10,
                padding: "14px 18px",
                transform: `translateY(${visivel ? 0 : 18}px)`,
              }}
            >
              <div style={{ fontFamily: fonteTitulo, fontSize: 24, fontWeight: 700, color: cor.texto }}>
                {rotulos[s].nome}
              </div>
              <div style={{ fontFamily: fonteTexto, fontSize: 20, color: cor.textoFraco, marginTop: 2 }}>
                {rotulos[s].desc}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

/* ───────────────────────── 02 · MATERIAIS ───────────────────────── */

const IconeChapa = () => (
  <svg width="86" height="62" viewBox="0 0 86 62">
    <rect x="4" y="8" width="78" height="46" fill={cor.mdf} stroke={cor.mdfEscuro} strokeWidth="3" />
    <rect x="4" y="8" width="78" height="8" fill={cor.mdfEscuro} opacity="0.5" />
  </svg>
);
const IconeMoldura = () => (
  <svg width="86" height="62" viewBox="0 0 86 62">
    <rect x="6" y="14" width="74" height="34" fill="none" stroke={cor.mdf} strokeWidth="8" />
  </svg>
);
const IconeInserto = () => (
  <svg width="70" height="62" viewBox="0 0 70 62">
    <rect x="26" y="10" width="18" height="42" fill="#9AA5B1" stroke="#5F7288" strokeWidth="2" />
    {[16, 24, 32, 40, 48].map((y) => (
      <line key={y} x1="26" y1={y} x2="44" y2={y} stroke="#5F7288" strokeWidth="2" />
    ))}
  </svg>
);
const IconeSpray = () => (
  <svg width="60" height="72" viewBox="0 0 60 72">
    <rect x="18" y="20" width="24" height="46" rx="4" fill={cor.pisoCinza} stroke="#5F7288" strokeWidth="2" />
    <rect x="25" y="8" width="10" height="12" fill="#5F7288" />
    <circle cx="46" cy="10" r="2" fill={cor.pisoCinza} />
    <circle cx="52" cy="16" r="1.6" fill={cor.pisoCinza} />
  </svg>
);
const IconeFita = () => (
  <svg width="76" height="62" viewBox="0 0 76 62">
    <circle cx="38" cy="31" r="24" fill="none" stroke={cor.zebraClara} strokeWidth="11" />
    <circle cx="38" cy="31" r="9" fill={cor.fundo} stroke={cor.borda} strokeWidth="2" />
  </svg>
);
const IconePe = () => (
  <svg width="76" height="52" viewBox="0 0 76 52">
    <ellipse cx="24" cy="30" rx="16" ry="10" fill="#2F3946" stroke="#5F7288" strokeWidth="2" />
    <ellipse cx="54" cy="30" rx="16" ry="10" fill="#2F3946" stroke="#5F7288" strokeWidth="2" />
  </svg>
);

export const CenaMateriais: React.FC = () => (
  <>
    <TituloCena titulo="Separe tudo antes de começar" apoio="Nada pior que parar no meio para procurar material" />
    <div
      style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 22,
        alignContent: "center",
        minHeight: 0,
      }}
    >
      <Cartao icone={<IconeChapa />} titulo="Chapa MDF" detalhe="1500 × 500 × 12 mm" atraso={8} />
      <Cartao icone={<IconeMoldura />} titulo="Moldura + travessas" detalhe="4 tiras + 3 reforços" atraso={16} />
      <Cartao icone={<IconeInserto />} titulo="Insertos" detalhe="M4 e M5" atraso={24} />
      <Cartao icone={<IconePe />} titulo="Pés + alças" detalhe="8 pés · 2 alças" atraso={32} />
      <Cartao icone={<IconeSpray />} titulo="Tintas" detalhe="selador · cinza · asfalto" atraso={40} />
      <Cartao icone={<IconeFita />} titulo="Fitas" detalhe="amarela · zebrada · verde" atraso={48} />
    </div>
    <Aviso
      tipo="info"
      titulo="Por que 12 mm COM travessas, e não 15 mm maciço?"
      texto="A base tem 1,5 m e a maquete pesa ~18 kg. As 3 travessas dão mais rigidez que 3 mm a mais de MDF, e ainda economizam peso. Sem elas, uma base de 1,5 m flexiona no meio."
      atraso={62}
    />
  </>
);

/* ───────────────────────── 03 · CORTE ───────────────────────── */

export const CenaCorte: React.FC = () => {
  const frame = useCurrentFrame();
  const desenho = interpolate(frame, [10, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const diagonal = interpolate(frame - 150, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <TituloCena passo="PASSO 1" titulo="Cortar a chapa" apoio="1500 × 500 mm — e conferir o esquadro" />
      <Linha flex={1} gap={46}>
        <Quadro flex={1.6}>
          <svg viewBox="-90 -80 1680 700" style={{ width: "100%", height: "100%" }}>
            <rect x={0} y={0} width={1500 * desenho} height={500} fill={cor.mdf} stroke={cor.mdfEscuro} strokeWidth={4} />
            <CotaH x1={0} x2={1500} y={-38} rotulo="1500 mm" atraso={44} />
            <CotaV y1={0} y2={500} x={-42} rotulo="500 mm" atraso={60} />
            <g opacity={diagonal}>
              <line x1={0} y1={0} x2={1500 * diagonal} y2={500 * diagonal} stroke={cor.verde} strokeWidth={3} strokeDasharray="12 8" />
              <line x1={1500} y1={0} x2={1500 - 1500 * diagonal} y2={500 * diagonal} stroke={cor.verde} strokeWidth={3} strokeDasharray="12 8" />
              <text x={750} y={566} fill={cor.verde} fontFamily={fonteMono} fontSize={34} fontWeight={700} textAnchor="middle">
                D1 = D2 → base em esquadro
              </text>
            </g>
          </svg>
        </Quadro>
        <Coluna flex={1}>
          <Aviso
            tipo="ok"
            titulo="Teste do esquadro"
            texto="Meça as duas diagonais com trena. Se D1 e D2 forem iguais, a base está em esquadro."
            atraso={150}
          />
          <Aviso
            tipo="erro"
            titulo="Tolerância: 2 mm"
            texto="Diferença maior que isso e o painel não vai encostar reto na base — o erro se acumula em todas as camadas seguintes."
            atraso={182}
          />
        </Coluna>
      </Linha>
    </>
  );
};

/* ───────────────────────── 04 · FURAÇÃO ───────────────────────── */

export const CenaFuracao: React.FC = () => {
  const furos = [
    { d: "Ø 12", qtd: "3", uso: "postes P1, P2 e P3" },
    { d: "Ø 16", qtd: "1", uso: "saída da subestação" },
    { d: "Ø 12", qtd: "1", uso: "painel: 24 V potência" },
    { d: "Ø 10", qtd: "2", uso: "painel: 5 V e 12 V aux" },
    { d: "Ø 20", qtd: "1", uso: "chicote → câmara" },
    { d: "Ø 8", qtd: "3", uso: "postes de iluminação" },
  ];
  return (
    <>
      <TituloCena passo="PASSO 2" titulo="Marcar e furar" apoio="Todos os furos ANTES de montar e de pintar" />
      <Quadro flex={1}>
        <PlantaMaquete mostrarFuros mostrarLegendas={false} mostrarRua={false} />
      </Quadro>
      <Linha gap={20} style={{ marginTop: 16 }}>
        <div style={{ flex: 1.7, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {furos.map((f, i) => (
            <Aparecer key={f.uso} atraso={16 + i * 8}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: cor.superficie,
                  border: `1.5px solid ${cor.borda}`,
                  borderRadius: 8,
                  padding: "11px 14px",
                }}
              >
                <div style={{ fontFamily: fonteMono, fontSize: 22, fontWeight: 700, color: cor.vermelho }}>{f.d}</div>
                <div style={{ fontFamily: fonteMono, fontSize: 20, color: cor.ambar }}>×{f.qtd}</div>
                <div style={{ fontFamily: fonteTexto, fontSize: 19, color: cor.texto }}>{f.uso}</div>
              </div>
            </Aparecer>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <Aviso
            tipo="atencao"
            titulo="Três entradas separadas no painel"
            texto="Uma por tensão. Juntar as três num furo só faz perder a rastreabilidade e coloca o cabo de 6,3 A encostado nos de sinal."
            atraso={70}
          />
        </div>
      </Linha>
    </>
  );
};

/* ──────────────────── 05 · MOLDURA E O VÃO DE 40 mm ──────────────────── */

export const CenaMoldura: React.FC = () => {
  const frame = useCurrentFrame();
  const cabo = interpolate(frame - 100, [0, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.2, 1),
  });
  const pulso = 0.8 + 0.2 * Math.sin(frame / 6);
  const cabos = [
    { y: 128, c: cor.vermelho, w: 7, atraso: 0, nome: "24 V — subestação → postes" },
    { y: 152, c: cor.azul, w: 6, atraso: 0.16, nome: "24 V / 5 V / 12 V — postes → painel" },
    { y: 176, c: cor.verde, w: 5, atraso: 0.3, nome: "sinais — painel → câmara" },
  ];

  return (
    <>
      <TituloCena
        passo="PASSO 3"
        titulo="A moldura e o vão de 40 mm"
        apoio="O passo mais importante deste vídeo — vão de 40 mm + entalhe nas travessas"
        destaque={cor.vermelho}
      />
      <Linha flex={1} gap={44}>
        <Quadro flex={1.55}>
          <svg viewBox="-24 0 924 430" style={{ width: "100%", height: "100%" }}>
            <text x={450} y={24} fill={cor.textoApagado} fontFamily={fonteMono} fontSize={21} textAnchor="middle">
              CORTE LATERAL DA BASE
            </text>
            <text x={450} y={60} fill={cor.textoFraco} fontFamily={fonteMono} fontSize={20} textAnchor="middle">
              tampo MDF 15 mm
            </text>
            <rect x={40} y={70} width={820} height={34} fill={cor.mdf} stroke={cor.mdfEscuro} strokeWidth={3} />

            <rect x={40} y={104} width={34} height={96} fill={cor.mdfEscuro} stroke="#6B573A" strokeWidth={3} />
            <rect x={826} y={104} width={34} height={96} fill={cor.mdfEscuro} stroke="#6B573A" strokeWidth={3} />

            <rect
              x={74}
              y={104}
              width={752}
              height={96}
              fill="rgba(245,165,36,0.08)"
              stroke={cor.ambar}
              strokeWidth={2.5}
              strokeDasharray="12 7"
            />
            <CotaV y1={104} y2={200} x={22} rotulo="40 mm" atraso={34} corLinha={cor.ambar} />

            {cabos.map((c) => {
              const p = Math.max(0, Math.min(1, (cabo - c.atraso) / (1 - c.atraso)));
              return (
                <g key={c.y}>
                  <line
                    x1={78}
                    y1={c.y}
                    x2={78 + 744 * p}
                    y2={c.y}
                    stroke={c.c}
                    strokeWidth={c.w}
                    strokeLinecap="round"
                  />
                  <circle cx={78 + 744 * p} cy={c.y} r={p > 0.01 && p < 0.99 ? 8 : 0} fill={c.c} opacity={0.75} />
                </g>
              );
            })}

            {[110, 340, 570, 780].map((x) => (
              <rect key={x} x={x} y={200} width={54} height={40} rx={11} fill="#232C38" stroke={cor.borda} strokeWidth={2} />
            ))}
            {/* travessas de reforço, com entalhe de passagem */}
            {[262, 450, 638].map((x) => (
              <g key={`tr-${x}`}>
                <rect x={x} y={104} width={14} height={30} fill={cor.mdfEscuro} stroke="#6B573A" strokeWidth={2} />
                <rect x={x} y={170} width={14} height={30} fill={cor.mdfEscuro} stroke="#6B573A" strokeWidth={2} />
                <text x={x + 7} y={258} fill={cor.textoApagado} fontFamily={fonteMono} fontSize={16} textAnchor="middle">travessa</text>
              </g>
            ))}
            <line x1={20} y1={240} x2={880} y2={240} stroke={cor.bordaForte} strokeWidth={3} />

            {cabos.map((c, i) => (
              <g key={c.nome} opacity={cabo > c.atraso + 0.12 ? 1 : 0.25}>
                <line x1={70} y1={288 + i * 30} x2={114} y2={288 + i * 30} stroke={c.c} strokeWidth={6} strokeLinecap="round" />
                <text x={128} y={295 + i * 30} fill={cor.textoFraco} fontFamily={fonteMono} fontSize={21}>
                  {c.nome}
                </text>
              </g>
            ))}

            <text
              x={450}
              y={406}
              fill={cor.ambar}
              fontFamily={fonteTitulo}
              fontSize={38}
              fontWeight={800}
              textAnchor="middle"
              opacity={pulso}
            >
              TODA A FIAÇÃO PASSA POR AQUI
            </text>
          </svg>
        </Quadro>
        <Coluna flex={1}>
          <Aviso
            tipo="erro"
            titulo="Se a base for maciça…"
            texto="não há por onde passar cabo nenhum. Os fios vão cruzar o chão de fábrica por cima, e o visual da maquete está arruinado."
            atraso={20}
          />
          <Aviso
            tipo="ok"
            titulo="O entalhe é obrigatório"
            texto="Cada travessa leva um entalhe de 20 × 25 mm no meio. Sem ele, a base vira quatro compartimentos fechados e o cabo não atravessa."
            atraso={54}
          />
        </Coluna>
      </Linha>
    </>
  );
};

/* ───────────────────────── 06 · PINTURA ───────────────────────── */

export const CenaPintura: React.FC = () => {
  const camadas = [
    { nome: "MDF cru", detalhe: "lixa 180 → 320, tirar todo o pó", c: cor.mdf },
    { nome: "Fundo selador", detalhe: "2 demãos leves — sem isto a tinta mancha", c: "#E8E4DC" },
    { nome: "Cinza claro — chão de fábrica", detalhe: "mascare a rua antes", c: cor.pisoCinza },
    { nome: "Cinza asfalto — a rua", detalhe: "mascare a fábrica antes", c: "#3A4046" },
    { nome: "Verniz fosco", detalhe: "protege a tinta e as fitas", c: "#5F7288" },
  ];
  return (
    <>
      <TituloCena passo="PASSO 4" titulo="Pintura do piso industrial" apoio="Duas cores: piso epóxi na fábrica, asfalto na rua" />
      <Linha flex={1} gap={44}>
        <Coluna flex={1} gap={16}>
          {camadas.map((c, i) => (
            <Aparecer key={c.nome} atraso={14 + i * 26}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  backgroundColor: cor.superficie,
                  border: `2px solid ${cor.borda}`,
                  borderRadius: 10,
                  padding: "18px 22px",
                }}
              >
                <div style={{ fontFamily: fonteMono, fontSize: 26, color: cor.textoApagado, minWidth: 34 }}>{i + 1}</div>
                <div style={{ width: 74, height: 44, backgroundColor: c.c, borderRadius: 6, border: `2px solid ${cor.borda}` }} />
                <div>
                  <div style={{ fontFamily: fonteTitulo, fontSize: 28, fontWeight: 700, color: cor.texto }}>{c.nome}</div>
                  <div style={{ fontFamily: fonteTexto, fontSize: 22, color: cor.textoFraco }}>{c.detalhe}</div>
                </div>
              </div>
            </Aparecer>
          ))}
        </Coluna>
        <Coluna flex={1}>
          <Aviso
            tipo="atencao"
            titulo="Verniz FOSCO, nunca brilhante"
            texto="Piso brilhante reflete a luz do auditório, estoura nas fotos e arruína o visual na apresentação."
            atraso={110}
          />
          <Aviso
            tipo="info"
            titulo="Truque de realismo"
            texto="Passe uma esponja quase seca com cinza escuro nas áreas de circulação: simula marca de pneu e desgaste de piso de fábrica."
            atraso={140}
          />
        </Coluna>
      </Linha>
    </>
  );
};

/* ───────────────────────── 07 · DEMARCAÇÃO ───────────────────────── */

export const CenaDemarcacao: React.FC = () => {
  const faixas = [
    { cor: "zebra", nome: "Zebrada amarela e preta", onde: "à frente do painel", norma: "NR-10 — zona controlada" },
    { cor: cor.zebraClara, nome: "Amarela contínua", onde: "contorno de máquinas", norma: "NR-12 / NBR 7195" },
    { cor: cor.verde, nome: "Verde", onde: "até a borda da maquete", norma: "rota de fuga" },
    { cor: cor.vermelho, nome: "Vermelha", onde: "sob o extintor", norma: "não obstruir" },
  ];
  return (
    <>
      <TituloCena
        passo="PASSO 5"
        titulo="Demarcação de segurança"
        apoio="Isto não é decoração — é conteúdo técnico que vale nota"
      />
      <Quadro flex={1}>
        <PlantaMaquete mostrarDemarcacao mostrarLegendas={false} setorAtivo={null} />
      </Quadro>
      <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
        {faixas.map((f, i) => (
          <Aparecer key={f.nome} atraso={20 + i * 26} style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                backgroundColor: cor.superficie,
                border: `1.5px solid ${cor.borda}`,
                borderRadius: 10,
                padding: "13px 16px",
              }}
            >
              {f.cor === "zebra" ? (
                <svg width="52" height="44">
                  <defs>
                    <pattern
                      id="zebraCard"
                      width="12"
                      height="12"
                      patternUnits="userSpaceOnUse"
                      patternTransform="rotate(45)"
                    >
                      <rect width="6" height="12" fill={cor.zebraClara} />
                      <rect x="6" width="6" height="12" fill={cor.zebraEscura} />
                    </pattern>
                  </defs>
                  <rect width="52" height="44" fill="url(#zebraCard)" rx="5" />
                </svg>
              ) : (
                <div style={{ width: 52, height: 44, backgroundColor: f.cor as string, borderRadius: 5 }} />
              )}
              <div>
                <div style={{ fontFamily: fonteTitulo, fontSize: 22, fontWeight: 700, color: cor.texto }}>{f.nome}</div>
                <div style={{ fontFamily: fonteTexto, fontSize: 18, color: cor.textoFraco }}>{f.onde}</div>
                <div style={{ fontFamily: fonteMono, fontSize: 17, color: cor.ambar, marginTop: 2 }}>{f.norma}</div>
              </div>
            </div>
          </Aparecer>
        ))}
      </div>
    </>
  );
};

/* ───────────────────────── 08 · CENOGRAFIA ───────────────────────── */

const IconePoste = () => (
  <svg width="52" height="72" viewBox="0 0 52 72">
    <rect x="14" y="18" width="6" height="50" fill="#8C959E" stroke="#5F7288" strokeWidth="1.5" />
    <path d="M17 18 q20 -3 22 -12" fill="none" stroke="#8C959E" strokeWidth="3" />
    <ellipse cx="41" cy="7" rx="8" ry="4.5" fill="#FFF3B0" stroke="#B8860B" strokeWidth="1.5" />
  </svg>
);
const IconeCarro = () => (
  <svg width="92" height="52" viewBox="0 0 92 52">
    <rect x="6" y="22" width="80" height="20" rx="7" fill="#2E86C1" stroke="#17466E" strokeWidth="2" />
    <path d="M22 22 l9 -11 h28 l9 11 z" fill="#A9CCE3" stroke="#17466E" strokeWidth="1.5" />
    <circle cx="26" cy="44" r="6" fill="#2B2F33" />
    <circle cx="66" cy="44" r="6" fill="#2B2F33" />
  </svg>
);
const IconeMuro = () => (
  <svg width="88" height="56" viewBox="0 0 88 56">
    <rect x="4" y="16" width="26" height="34" fill="#9AA5B1" stroke="#5F7288" strokeWidth="2" />
    <rect x="58" y="16" width="26" height="34" fill="#9AA5B1" stroke="#5F7288" strokeWidth="2" />
    <g stroke="#3FBDF3" strokeWidth="2">
      <line x1="34" y1="18" x2="34" y2="50" />
      <line x1="42" y1="18" x2="42" y2="50" />
      <line x1="50" y1="18" x2="50" y2="50" />
      <line x1="32" y1="18" x2="54" y2="18" />
    </g>
  </svg>
);
const IconeFigura = () => (
  <svg width="46" height="70" viewBox="0 0 46 70">
    <circle cx="23" cy="14" r="9" fill="#E8B84B" />
    <path d="M13 12 A10 10 0 0 1 33 12 Z" fill="#F5C518" />
    <rect x="15" y="24" width="16" height="24" rx="4" fill="#3FBDF3" />
    <rect x="16" y="48" width="6" height="18" fill="#2A3441" />
    <rect x="24" y="48" width="6" height="18" fill="#2A3441" />
  </svg>
);
const IconePlaca = () => (
  <svg width="62" height="64" viewBox="0 0 62 64">
    <rect x="8" y="8" width="46" height="32" rx="4" fill={cor.zebraClara} stroke="#8A6D00" strokeWidth="2" />
    <path d="M31 15 L38 27 H24 Z" fill="#12161C" />
    <rect x="29" y="40" width="4" height="20" fill="#5F7288" />
  </svg>
);
const IconeCalha = () => (
  <svg width="88" height="56" viewBox="0 0 88 56">
    <path d="M6 20 H82 V34 H6 Z" fill="none" stroke="#A78BFA" strokeWidth="3" />
    <line x1="20" y1="34" x2="20" y2="50" stroke="#7C6AD0" strokeWidth="3" />
    <line x1="68" y1="34" x2="68" y2="50" stroke="#7C6AD0" strokeWidth="3" />
    <line x1="12" y1="27" x2="76" y2="27" stroke={cor.vermelho} strokeWidth="2" />
  </svg>
);

export const CenaCenografia: React.FC = () => (
  <>
    <TituloCena
      passo="PASSO 6"
      titulo="A rua e o portão da empresa"
      apoio="Escala 1:50 — a via pública explica de onde a energia vem"
    />
    <div
      style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 22,
        alignContent: "center",
        minHeight: 0,
      }}
    >
      <Cartao icone={<IconePoste />} titulo="Iluminação" detalhe="Ø5 · h=180 · braço curvo" atraso={8} />
      <Cartao icone={<IconeCarro />} titulo="Veículos" detalhe="2 carros + 1 caminhão" atraso={16} />
      <Cartao icone={<IconeFigura />} titulo="Figuras" detalhe="1:50 · 35 mm" atraso={24} />
      <Cartao icone={<IconeMuro />} titulo="Muro + portão" detalhe="h=50 · vão de 80 mm" atraso={32} />
      <Cartao icone={<IconePlaca />} titulo="Placas e faixas" detalhe="meio-fio · pedestres" atraso={40} />
      <Cartao icone={<IconeCalha />} titulo="Eletrocalha" detalhe="perfil U · h = 180 mm" atraso={48} />
    </div>
    <Aviso
      tipo="info"
      titulo="Não confunda os dois tipos de poste"
      texto="Poste de DISTRIBUIÇÃO: Ø 8 mm, 300 mm, com cruzeta e isoladores, na calçada do fundo. Poste de ILUMINAÇÃO: Ø 5 mm, 180 mm, com braço curvo, na calçada da frente. Um professor de eletrotécnica percebe a troca na hora."
      atraso={64}
    />
  </>
);

/* ───────────────────────── 09 · FIAÇÃO POR BAIXO ───────────────────────── */

export const CenaFiacao: React.FC = () => {
  const frame = useCurrentFrame();
  const p1 = interpolate(frame - 20, [0, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const p2 = interpolate(frame - 62, [0, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const brilho = 0.5 + 0.5 * Math.sin(frame / 8);

  const caixas = [
    { x: 30, y: 60, w: 160, h: 90, t: "SUBESTAÇÃO" },
    { x: 600, y: 40, w: 270, h: 110, t: "PAINEL" },
    { x: 600, y: 330, w: 270, h: 100, t: "CÂMARA" },
  ];

  return (
    <>
      <TituloCena titulo="Roteamento por baixo da base" apoio="Vista inferior — potência de um lado, sinal do outro" />
      <Linha flex={1} gap={44}>
        <Quadro flex={1.75}>
          <svg viewBox="0 -18 900 518" style={{ width: "100%", height: "100%" }}>
            <rect
              x={10}
              y={20}
              width={880}
              height={420}
              fill="rgba(17,24,35,0.55)"
              stroke={cor.bordaForte}
              strokeWidth={2.5}
              strokeDasharray="12 7"
            />
            <text x={450} y={4} fill={cor.textoApagado} fontFamily={fonteMono} fontSize={20} textAnchor="middle">
              VISTA INFERIOR — dentro do vão de 40 mm
            </text>

            {caixas.map((b) => (
              <g key={b.t}>
                <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={cor.superficie} stroke={cor.borda} strokeWidth={2} rx={7} />
                <text
                  x={b.x + b.w / 2}
                  y={b.y + b.h / 2 + 8}
                  fill={cor.textoFraco}
                  fontFamily={fonteMono}
                  fontSize={22}
                  textAnchor="middle"
                >
                  {b.t}
                </text>
              </g>
            ))}

            <path
              d="M190 105 L220 105 L220 215 L520 215"
              fill="none"
              stroke={cor.cobre}
              strokeWidth={5}
              strokeDasharray="600"
              strokeDashoffset={600 * (1 - p1)}
              strokeLinecap="round"
            />
            <rect x={520} y={192} width={62} height={46} fill="#2A4534" stroke={cor.verde} strokeWidth={2} opacity={p1} />
            <text x={551} y={222} fill="#8FE3BC" fontFamily={fonteMono} fontSize={21} textAnchor="middle" opacity={p1}>
              P1
            </text>
            <path
              d="M582 215 L640 215 L640 150"
              fill="none"
              stroke={cor.cobre}
              strokeWidth={5}
              strokeDasharray="200"
              strokeDashoffset={200 * (1 - p1)}
              strokeLinecap="round"
            />
            {[280, 380, 460].map((x) => (
              <circle key={x} cx={x} cy={215} r={9} fill={cor.superficie} stroke={cor.cobre} strokeWidth={2.5} opacity={p1} />
            ))}

            <path
              d="M220 268 L860 268"
              fill="none"
              stroke="#8C97A5"
              strokeWidth={7}
              strokeDasharray="700"
              strokeDashoffset={700 * (1 - p1)}
              strokeLinecap="round"
            />

            <path d={`M700 150 L700 ${150 + 180 * p2}`} fill="none" stroke={cor.vermelho} strokeWidth={7} strokeLinecap="round" />
            <path d={`M800 150 L800 ${150 + 180 * p2}`} fill="none" stroke={cor.azul} strokeWidth={4.5} strokeLinecap="round" />

            <g opacity={p2 > 0.75 ? 1 : 0}>
              <circle cx={700} cy={268} r={30} fill="none" stroke={cor.verde} strokeWidth={2.5} opacity={brilho} />
              <path d="M678 290 L640 330" stroke={cor.verde} strokeWidth={2} fill="none" />
              <text x={636} y={350} fill={cor.verde} fontFamily={fonteMono} fontSize={22} fontWeight={700} textAnchor="end">
                cruzar a 90°
              </text>
            </g>

            <g opacity={p2 > 0.5 ? 1 : 0}>
              <line x1={700} y1={192} x2={800} y2={192} stroke={cor.ambar} strokeWidth={2} />
              <line x1={700} y1={184} x2={700} y2={200} stroke={cor.ambar} strokeWidth={2} />
              <line x1={800} y1={184} x2={800} y2={200} stroke={cor.ambar} strokeWidth={2} />
              <text
                x={750}
                y={178}
                fill={cor.ambar}
                fontFamily={fonteMono}
                fontSize={22}
                fontWeight={700}
                textAnchor="middle"
                opacity={brilho}
              >
                ≥ 50 mm
              </text>
            </g>

            <g>
              <line x1={40} y1={470} x2={82} y2={470} stroke={cor.cobre} strokeWidth={5} strokeLinecap="round" />
              <text x={94} y={477} fill={cor.textoFraco} fontFamily={fonteMono} fontSize={20}>
                24 V
              </text>
              <line x1={170} y1={470} x2={212} y2={470} stroke="#8C97A5" strokeWidth={7} strokeLinecap="round" />
              <text x={224} y={477} fill={cor.textoFraco} fontFamily={fonteMono} fontSize={20}>
                0 V retorno
              </text>
              <line x1={380} y1={470} x2={422} y2={470} stroke={cor.vermelho} strokeWidth={7} strokeLinecap="round" />
              <text x={434} y={477} fill={cor.textoFraco} fontFamily={fonteMono} fontSize={20}>
                GRUPO A · potência
              </text>
              <line x1={670} y1={470} x2={712} y2={470} stroke={cor.azul} strokeWidth={4.5} strokeLinecap="round" />
              <text x={724} y={477} fill={cor.textoFraco} fontFamily={fonteMono} fontSize={20}>
                GRUPO B · sinais
              </text>
            </g>
          </svg>
        </Quadro>
        <Coluna flex={1}>
          <Aviso
            tipo="atencao"
            titulo="Por que separar?"
            texto="Os drivers BTS7960 chaveiam 6 A em 1 Hz. Se o cabo de potência correr colado ao do sensor, esse ruído aparece na leitura de temperatura."
            atraso={40}
          />
          <Aviso
            tipo="ok"
            titulo="Prenda e identifique"
            texto="Presilha adesiva a cada 80 mm e anilha numerada nas duas pontas de cada cabo. Sem isso, achar um fio depois é impossível."
            atraso={90}
          />
        </Coluna>
      </Linha>
    </>
  );
};

/* ───────────────────────── 10 · CHECKLIST ───────────────────────── */

export const CenaChecklist: React.FC = () => {
  const itens = [
    "Base 900 × 500 esquadrejada (diagonais ± 2 mm)",
    "Vão de 40 mm confirmado com paquímetro",
    "Todos os furos feitos ANTES da pintura",
    "Insertos M4 / M5 instalados e testados",
    "Piso cinza fosco, sem manchas nem bolhas",
    "Faixa zebrada NR-10 à frente do painel",
    "Corredor e rota de fuga demarcados",
    "Verniz fosco aplicado e curado",
    "6 pés e 2 alças instalados",
    "Cabo passa de ponta a ponta por baixo, sem esforço",
  ];
  return (
    <>
      <TituloCena titulo="Checklist de aceitação" apoio="Só passe para o Doc 11 com tudo marcado" destaque={cor.verde} />
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridAutoRows: "min-content",
          gap: 14,
          alignContent: "center",
          minHeight: 0,
        }}
      >
        {itens.map((item, i) => (
          <ItemChecklist key={item} texto={item} atraso={22 + i * 15} />
        ))}
      </div>
    </>
  );
};

/* ───────────────────────── 11 · ENCERRAMENTO ───────────────────────── */

export const CenaEncerramento: React.FC = () => {
  const frame = useCurrentFrame();
  const t1 = useMola(6);
  const t2 = useMola(24);
  const energia = interpolate(frame - 60, [0, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0 }}>
      <div style={{ opacity: t1, fontFamily: fonteMono, fontSize: 28, letterSpacing: 7, color: cor.verde, fontWeight: 700 }}>
        ✓ CAMADA 1 · DOC 10 CONCLUÍDO
      </div>
      <div
        style={{
          opacity: t2,
          transform: `translateY(${(1 - t2) * 30}px)`,
          fontFamily: fonteTitulo,
          fontSize: 50,
          color: cor.textoFraco,
          marginTop: 38,
          fontWeight: 600,
        }}
      >
        Próximo vídeo
      </div>
      <div
        style={{
          opacity: t2,
          transform: `translateY(${(1 - t2) * 30}px)`,
          fontFamily: fonteTitulo,
          fontSize: 96,
          fontWeight: 800,
          color: cor.texto,
          lineHeight: 1.02,
          letterSpacing: -2,
        }}
      >
        Doc 11 — Subestação e Postes
      </div>

      <svg viewBox="0 0 1400 140" style={{ width: "80%", marginTop: 40 }}>
        <rect x={0} y={38} width={190} height={64} rx={8} fill="#25415E" stroke="#5B8FC7" strokeWidth={2.5} />
        <text x={95} y={78} fill="#BBD6F0" fontFamily={fonteMono} fontSize={27} textAnchor="middle">
          127 V CA
        </text>
        <path d={`M190 70 L${190 + 300 * energia} 70`} stroke={cor.ambar} strokeWidth={5} fill="none" strokeLinecap="round" />
        <rect
          x={496}
          y={30}
          width={210}
          height={80}
          rx={8}
          fill="#2A4534"
          stroke={cor.verde}
          strokeWidth={2.5}
          opacity={energia > 0.35 ? 1 : 0.2}
        />
        <text x={601} y={66} fill="#8FE3BC" fontFamily={fonteMono} fontSize={27} textAnchor="middle">
          FONTE
        </text>
        <text x={601} y={96} fill="#8FE3BC" fontFamily={fonteMono} fontSize={27} textAnchor="middle">
          24 Vcc
        </text>
        <path
          d={`M706 70 L${706 + 300 * Math.max(0, energia - 0.4) * 1.7} 70`}
          stroke={cor.cobre}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />
        <g opacity={energia > 0.8 ? 1 : 0.2}>
          {[1030, 1160, 1290].map((x) => (
            <g key={x}>
              <rect x={x - 4} y={34} width={8} height={74} fill="#7C8B9C" />
              <rect x={x - 26} y={42} width={52} height={6} fill="#9AA5B1" />
            </g>
          ))}
          <path d="M1004 46 Q1095 54 1186 46 T1316 46" fill="none" stroke={cor.cobre} strokeWidth={3} />
        </g>
      </svg>
    </div>
  );
};
