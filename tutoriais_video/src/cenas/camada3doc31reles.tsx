import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { cor, fonteMono, fonteTexto, fonteTitulo } from "../design";
import { Aparecer, Quadro, TituloCena } from "../components/Elementos";

const entrar = (frame: number, inicio: number, duracao = 18) =>
  interpolate(frame, [inicio, inicio + duracao], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const pulso = (frame: number, periodo = 90, fase = 0) =>
  0.5 + 0.5 * Math.sin(((frame + fase) / periodo) * Math.PI * 2);

const TextoSvg: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  tamanho?: number;
  corTexto?: string;
  peso?: number;
  ancora?: "start" | "middle" | "end";
  mono?: boolean;
}> = ({
  x,
  y,
  children,
  tamanho = 28,
  corTexto = cor.texto,
  peso = 600,
  ancora = "middle",
  mono = false,
}) => (
  <text
    x={x}
    y={y}
    fill={corTexto}
    fontFamily={mono ? fonteMono : fonteTexto}
    fontSize={tamanho}
    fontWeight={peso}
    textAnchor={ancora}
  >
    {children}
  </text>
);

const Fluxo: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  corLinha: string;
  frame: number;
  atraso?: number;
  ativo?: boolean;
  espessura?: number;
}> = ({ x1, y1, x2, y2, corLinha, frame, atraso = 0, ativo = true, espessura = 8 }) => {
  const p = entrar(frame, atraso, 22);
  const xf = x1 + (x2 - x1) * p;
  const yf = y1 + (y2 - y1) * p;
  return (
    <g opacity={p}>
      <line
        x1={x1}
        y1={y1}
        x2={xf}
        y2={yf}
        stroke={corLinha}
        strokeWidth={espessura}
        strokeLinecap="round"
        opacity={ativo ? 0.34 : 0.12}
      />
      {ativo ? (
        <line
          x1={x1}
          y1={y1}
          x2={xf}
          y2={yf}
          stroke={corLinha}
          strokeWidth={Math.max(3, espessura * 0.36)}
          strokeLinecap="round"
          strokeDasharray="18 22"
          strokeDashoffset={-frame * 2.2}
        />
      ) : null}
    </g>
  );
};

const FluxoCaminho: React.FC<{
  d: string;
  corLinha: string;
  frame: number;
  ativo: boolean;
  espessura?: number;
}> = ({ d, corLinha, frame, ativo, espessura = 8 }) => (
  <g>
    <path
      d={d}
      fill="none"
      stroke={corLinha}
      strokeWidth={espessura}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={ativo ? 0.28 : 0.1}
    />
    {ativo ? (
      <path
        d={d}
        fill="none"
        stroke={corLinha}
        strokeWidth={Math.max(3, espessura * 0.34)}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="18 22"
        strokeDashoffset={-frame * 2.2}
      />
    ) : null}
  </g>
);

const Caixa: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  titulo: string;
  subtitulo: string;
  destaque: string;
  frame: number;
  atraso?: number;
  brilho?: boolean;
}> = ({ x, y, w, h, titulo, subtitulo, destaque, frame, atraso = 0, brilho = false }) => {
  const p = entrar(frame, atraso);
  const glow = brilho ? 0.18 + pulso(frame, 100, atraso) * 0.18 : 0;
  return (
    <g opacity={p} transform={`translate(0 ${22 * (1 - p)})`}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={18}
        fill={cor.superficie}
        stroke={destaque}
        strokeWidth={3}
      />
      {brilho ? (
        <rect
          x={x - 8}
          y={y - 8}
          width={w + 16}
          height={h + 16}
          rx={24}
          fill="none"
          stroke={destaque}
          strokeWidth={8}
          opacity={glow}
        />
      ) : null}
      <rect x={x} y={y} width={10} height={h} rx={5} fill={destaque} />
      <TextoSvg x={x + w / 2} y={y + h * 0.45} tamanho={38} corTexto={destaque} peso={800}>
        {titulo}
      </TextoSvg>
      <TextoSvg x={x + w / 2} y={y + h * 0.7} tamanho={22} corTexto={cor.textoFraco} peso={500}>
        {subtitulo}
      </TextoSvg>
    </g>
  );
};

const Etiqueta: React.FC<{
  texto: string;
  corEtiqueta: string;
  atraso?: number;
}> = ({ texto, corEtiqueta, atraso = 0 }) => (
  <Aparecer
    atraso={atraso}
    style={{
      padding: "9px 16px",
      borderRadius: 999,
      border: `2px solid ${corEtiqueta}`,
      backgroundColor: `${corEtiqueta}18`,
      color: corEtiqueta,
      fontFamily: fonteMono,
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: 0.4,
      whiteSpace: "nowrap",
    }}
  >
    {texto}
  </Aparecer>
);

export const CenaTresNiveis: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <TituloCena
        passo="VISÃO GERAL"
        titulo="Três relés, três níveis elétricos"
        apoio="Eles formam uma cadeia; nenhum deles repete a função do outro."
      />
      <Quadro>
        <svg viewBox="0 0 1680 560" width="100%" height="100%">
          <defs>
            <filter id="glow-c1" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="9" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <TextoSvg x={190} y={55} tamanho={24} corTexto={cor.azul} mono>
            LÓGICA · 5 V
          </TextoSvg>
          <TextoSvg x={790} y={55} tamanho={24} corTexto={cor.ambar} mono>
            COMANDO · 24 V
          </TextoSvg>
          <TextoSvg x={1395} y={55} tamanho={24} corTexto={cor.vermelho} mono>
            POTÊNCIA · 12 V / 6,3 A
          </TextoSvg>

          <Caixa
            x={45}
            y={155}
            w={255}
            h={170}
            titulo="ARDUINO"
            subtitulo="D26 · sinal fraco"
            destaque={cor.azul}
            frame={frame}
            atraso={8}
            brilho
          />
          <Fluxo x1={300} y1={240} x2={390} y2={240} corLinha={cor.azul} frame={frame} atraso={30} />
          <Caixa
            x={390}
            y={155}
            w={210}
            h={170}
            titulo="K0"
            subtitulo="interface / trip"
            destaque={cor.verde}
            frame={frame}
            atraso={42}
            brilho
          />

          <Fluxo x1={600} y1={240} x2={685} y2={240} corLinha={cor.ambar} frame={frame} atraso={66} />
          <line x1={685} y1={180} x2={685} y2={395} stroke={cor.ambar} strokeWidth={6} opacity={0.28} />
          <Fluxo x1={685} y1={180} x2={745} y2={180} corLinha={cor.ambar} frame={frame} atraso={78} espessura={6} />
          <Fluxo x1={685} y1={395} x2={745} y2={395} corLinha={cor.ambar} frame={frame} atraso={84} espessura={6} />
          <Caixa
            x={745}
            y={105}
            w={250}
            h={150}
            titulo="K1"
            subtitulo="bobina + lógica"
            destaque={cor.roxo}
            frame={frame}
            atraso={88}
            brilho
          />
          <Caixa
            x={745}
            y={320}
            w={250}
            h={150}
            titulo="K2"
            subtitulo="bobina de 24 V"
            destaque={cor.vermelho}
            frame={frame}
            atraso={98}
            brilho
          />
          <TextoSvg x={870} y={292} tamanho={20} corTexto={cor.ambar} mono>
            BOBINAS EM PARALELO
          </TextoSvg>

          <Fluxo x1={995} y1={395} x2={1095} y2={395} corLinha={cor.ambar} frame={frame} atraso={118} espessura={6} />
          <Caixa
            x={1095}
            y={310}
            w={230}
            h={170}
            titulo="30 — 87"
            subtitulo="contato K2 · 40 A"
            destaque={cor.vermelho}
            frame={frame}
            atraso={128}
            brilho
          />
          <Fluxo x1={1325} y1={395} x2={1420} y2={395} corLinha={cor.vermelho} frame={frame} atraso={148} espessura={16} />
          <Caixa
            x={1420}
            y={310}
            w={215}
            h={170}
            titulo="BTS"
            subtitulo="Peltier / PTC"
            destaque={cor.vermelho}
            frame={frame}
            atraso={160}
            brilho
          />

          <g opacity={entrar(frame, 188)}>
            <rect x={80} y={505} width={1520} height={46} rx={12} fill={cor.superficieAlt} stroke={cor.borda} />
            <TextoSvg x={840} y={537} tamanho={25} peso={700}>
              K0 traduz o software · K1 memoriza o comando · K2 conduz a carga
            </TextoSvg>
          </g>
        </svg>
      </Quadro>
    </>
  );
};

export const CenaK0: React.FC = () => {
  const frame = useCurrentFrame();
  const trip = frame >= 360;
  const giro = trip ? 0 : frame * 5;
  const abertura = entrar(frame, 360, 14);
  const anguloContato = interpolate(abertura, [0, 1], [0, -28]);
  return (
    <>
      <TituloCena
        passo="K0"
        titulo="O dedo elétrico do Arduino"
        apoio="Um sinal de 5 V ganha autoridade sobre uma cadeia de comando de 24 V."
        destaque={cor.verde}
      />
      <Quadro>
        <svg viewBox="0 0 1680 570" width="100%" height="100%">
          <Caixa
            x={55}
            y={120}
            w={315}
            h={240}
            titulo="ARDUINO MEGA"
            subtitulo="D26 · 5 V · pouca corrente"
            destaque={cor.azul}
            frame={frame}
            atraso={10}
            brilho={!trip}
          />
          <TextoSvg x={212} y={403} tamanho={22} corTexto={cor.textoFraco}>
            não alimenta bobina de 24 V
          </TextoSvg>

          <Fluxo x1={370} y1={240} x2={535} y2={240} corLinha={cor.azul} frame={frame} atraso={45} ativo={!trip} />
          <TextoSvg x={452} y={216} tamanho={20} corTexto={cor.azul} mono>
            IN
          </TextoSvg>

          <g opacity={entrar(frame, 65)}>
            <rect x={535} y={85} width={390} height={335} rx={24} fill="#102B30" stroke={cor.verde} strokeWidth={4} />
            <circle cx={585} cy={125} r={9} fill={trip ? cor.vermelho : cor.verde} />
            <TextoSvg x={730} y={145} tamanho={44} corTexto={cor.verde} peso={800}>
              K0 · MÓDULO 5 V
            </TextoSvg>
            <rect x={590} y={185} width={280} height={145} rx={16} fill={cor.superficie} stroke={cor.bordaForte} strokeWidth={3} />
            <TextoSvg x={730} y={225} tamanho={22} corTexto={cor.textoFraco} mono>
              CONTATO SECO
            </TextoSvg>
            <circle cx={635} cy={285} r={9} fill={cor.texto} />
            <circle cx={825} cy={285} r={9} fill={cor.texto} />
            <line x1={635} y1={285} x2={770} y2={285 + anguloContato} stroke={cor.verde} strokeWidth={9} strokeLinecap="round" />
            <TextoSvg x={730} y={375} tamanho={24} corTexto={trip ? cor.vermelho : cor.verde} mono>
              {trip ? "ABERTO · TRIP" : "FECHADO · ARMADO"}
            </TextoSvg>
          </g>

          <Fluxo x1={925} y1={285} x2={1110} y2={285} corLinha={cor.ambar} frame={frame} atraso={95} ativo={!trip} />
          <g opacity={entrar(frame, 120)}>
            <rect x={1110} y={125} width={500} height={290} rx={22} fill={cor.superficie} stroke={trip ? cor.borda : cor.ambar} strokeWidth={3} />
            <TextoSvg x={1360} y={180} tamanho={30} corTexto={cor.ambar} peso={800}>
              BOBINAS 24 V
            </TextoSvg>
            <rect x={1170} y={220} width={165} height={105} rx={14} fill={cor.superficieAlt} stroke={cor.roxo} strokeWidth={3} />
            <rect x={1385} y={220} width={165} height={105} rx={14} fill={cor.superficieAlt} stroke={cor.vermelho} strokeWidth={3} />
            <TextoSvg x={1252} y={286} tamanho={40} corTexto={cor.roxo} peso={800}>K1</TextoSvg>
            <TextoSvg x={1467} y={286} tamanho={40} corTexto={cor.vermelho} peso={800}>K2</TextoSvg>
            <TextoSvg x={1360} y={372} tamanho={22} corTexto={trip ? cor.textoApagado : cor.ambar} mono>
              {trip ? "DESENERGIZADAS" : "ENERGIZADAS EM PARALELO"}
            </TextoSvg>
          </g>

          <g opacity={entrar(frame, 245)}>
            <circle cx={310} cy={505} r={48} fill={trip ? cor.vermelhoFraco : cor.azulFraco} stroke={trip ? cor.vermelho : cor.azul} strokeWidth={3} />
            <g transform={`translate(310 505) rotate(${giro})`}>
              {[0, 90, 180, 270].map((a) => (
                <ellipse key={a} cx={0} cy={-27} rx={12} ry={29} fill={trip ? cor.textoApagado : cor.azul} transform={`rotate(${a})`} />
              ))}
            </g>
            <TextoSvg x={390} y={496} tamanho={24} ancora="start" corTexto={trip ? cor.vermelho : cor.texto} peso={700}>
              FAN: {trip ? "RPM = 0" : "RPM OK"}
            </TextoSvg>
            <TextoSvg x={390} y={528} tamanho={20} ancora="start" corTexto={cor.textoFraco}>
              {trip ? "firmware abre K0" : "supervisão ativa"}
            </TextoSvg>
          </g>

          {trip ? (
            <g opacity={abertura}>
              <rect x={1000} y={465} width={610} height={76} rx={14} fill={cor.vermelhoFraco} stroke={cor.vermelho} strokeWidth={3} />
              <TextoSvg x={1305} y={513} tamanho={27} corTexto={cor.vermelho} peso={800}>
                K0 ABRE → K1 E K2 CAEM → POTÊNCIA CORTADA
              </TextoSvg>
            </g>
          ) : null}
        </svg>
      </Quadro>
    </>
  );
};

const ContatoLadder: React.FC<{
  x: number;
  y: number;
  rotulo: string;
  detalhe: string;
  fechado: boolean;
  destaque: string;
}> = ({ x, y, rotulo, detalhe, fechado, destaque }) => (
  <g>
    <circle cx={x} cy={y} r={7} fill={cor.texto} />
    <circle cx={x + 120} cy={y} r={7} fill={cor.texto} />
    <line
      x1={x}
      y1={y}
      x2={x + 105}
      y2={fechado ? y : y - 34}
      stroke={destaque}
      strokeWidth={8}
      strokeLinecap="round"
    />
    <TextoSvg x={x + 60} y={y - 62} tamanho={23} corTexto={destaque} peso={800}>{rotulo}</TextoSvg>
    <TextoSvg x={x + 60} y={y + 42} tamanho={17} corTexto={cor.textoFraco} mono>{detalhe}</TextoSvg>
  </g>
);

export const CenaK1Selo: React.FC = () => {
  const frame = useCurrentFrame();
  const startPressionado = frame >= 300 && frame < 500;
  const energizado = frame >= 300 && frame < 700;
  const seloFechado = frame >= 350 && frame < 700;
  const stopAberto = frame >= 700;
  const etapa = frame < 300 ? 0 : frame < 500 ? 1 : frame < 700 ? 2 : 3;

  return (
    <>
      <TituloCena
        passo="K1"
        titulo="O selo guarda o estado sem software"
        apoio="START é momentâneo; K1 mantém o comando até surgir uma parada."
        destaque={cor.roxo}
      />
      <Quadro>
        <svg viewBox="0 0 1680 590" width="100%" height="100%">
          <TextoSvg x={65} y={225} tamanho={24} corTexto={cor.ambar} ancora="start" mono>+24 V</TextoSvg>
          <TextoSvg x={1615} y={225} tamanho={24} corTexto={cor.textoFraco} ancora="end" mono>0 V</TextoSvg>

          <line x1={80} y1={280} x2={1600} y2={280} stroke={cor.bordaForte} strokeWidth={6} />
          <ContatoLadder x={175} y={280} rotulo="S0" detalhe="EMERG · NF" fechado destaque={cor.vermelho} />
          <ContatoLadder x={420} y={280} rotulo="S2" detalhe="STOP · NF" fechado={!stopAberto} destaque={cor.vermelho} />

          <line x1={650} y1={280} x2={650} y2={440} stroke={cor.bordaForte} strokeWidth={5} />
          <line x1={650} y1={440} x2={930} y2={440} stroke={cor.bordaForte} strokeWidth={5} />
          <line x1={930} y1={440} x2={930} y2={280} stroke={cor.bordaForte} strokeWidth={5} />
          <ContatoLadder x={690} y={280} rotulo="S1" detalhe="START · NA" fechado={startPressionado} destaque={cor.verde} />
          <ContatoLadder x={690} y={440} rotulo="K1-NA1" detalhe="CONTATO DE SELO" fechado={seloFechado} destaque={cor.roxo} />
          <ContatoLadder x={995} y={280} rotulo="K0" detalhe="AUTORIZAÇÃO" fechado destaque={cor.verde} />

          <line x1={1200} y1={280} x2={1200} y2={195} stroke={cor.bordaForte} strokeWidth={5} />
          <line x1={1200} y1={195} x2={1425} y2={195} stroke={cor.bordaForte} strokeWidth={5} />
          <line x1={1200} y1={280} x2={1200} y2={365} stroke={cor.bordaForte} strokeWidth={5} />
          <line x1={1200} y1={365} x2={1425} y2={365} stroke={cor.bordaForte} strokeWidth={5} />
          <line x1={1425} y1={195} x2={1425} y2={365} stroke={cor.bordaForte} strokeWidth={5} />
          <line x1={1425} y1={280} x2={1600} y2={280} stroke={cor.bordaForte} strokeWidth={5} />

          <rect x={1260} y={145} width={125} height={100} rx={14} fill={cor.superficie} stroke={energizado ? cor.roxo : cor.bordaForte} strokeWidth={4} />
          <rect x={1260} y={315} width={125} height={100} rx={14} fill={cor.superficie} stroke={energizado ? cor.vermelho : cor.bordaForte} strokeWidth={4} />
          <TextoSvg x={1322} y={207} tamanho={34} corTexto={energizado ? cor.roxo : cor.textoApagado} peso={800}>K1</TextoSvg>
          <TextoSvg x={1322} y={377} tamanho={34} corTexto={energizado ? cor.vermelho : cor.textoApagado} peso={800}>K2</TextoSvg>
          <TextoSvg x={1492} y={464} tamanho={19} corTexto={cor.ambar} mono>BOBINAS EM PARALELO</TextoSvg>

          {energizado && !stopAberto ? (
            <>
              <FluxoCaminho
                d={startPressionado
                  ? "M80 280 H650 H690 H810 H930 H995 H1115 H1200 V195 H1425 V280 H1600"
                  : "M80 280 H650 V440 H690 H810 H930 V280 H995 H1115 H1200 V195 H1425 V280 H1600"}
                corLinha={cor.ambar}
                frame={frame}
                ativo
                espessura={8}
              />
              <FluxoCaminho d="M1200 280 V365 H1425 V280" corLinha={cor.ambar} frame={frame} ativo espessura={8} />
            </>
          ) : null}

          <g transform="translate(95 505)">
            {[
              ["1", "REPOUSO", cor.textoFraco],
              ["2", "APERTOU START", cor.verde],
              ["3", "K1 SELADO", cor.roxo],
              ["4", "STOP → NOVO START", cor.vermelho],
            ].map(([n, texto, c], i) => {
              const ativo = etapa === i;
              return (
                <g key={String(n)} transform={`translate(${i * 390} 0)`} opacity={entrar(frame, i * 35 + 30)}>
                  <rect width={350} height={64} rx={13} fill={ativo ? `${c}20` : cor.superficie} stroke={ativo ? c : cor.borda} strokeWidth={ativo ? 3 : 2} />
                  <circle cx={34} cy={32} r={19} fill={ativo ? c : cor.bordaForte} />
                  <TextoSvg x={34} y={40} tamanho={21} corTexto={ativo ? cor.fundo : cor.textoFraco} peso={800}>{n}</TextoSvg>
                  <TextoSvg x={68} y={40} tamanho={20} corTexto={ativo ? c : cor.textoFraco} ancora="start" peso={700}>{texto}</TextoSvg>
                </g>
              );
            })}
          </g>
        </svg>
      </Quadro>
    </>
  );
};

const GrupoPinos: React.FC<{
  indice: number;
  comum: number;
  nf: number;
  na: number;
  atraso: number;
}> = ({ indice, comum, nf, na, atraso }) => {
  const frame = useCurrentFrame();
  const p = entrar(frame, atraso);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${24 * (1 - p)}px)`,
        flex: 1,
        minWidth: 0,
        height: 285,
        backgroundColor: cor.superficie,
        border: `2px solid ${cor.roxo}`,
        borderRadius: 18,
        padding: "18px 16px",
        textAlign: "center",
      }}
    >
      <div style={{ fontFamily: fonteMono, fontSize: 20, color: cor.roxo, fontWeight: 700 }}>
        CONTATO {indice}
      </div>
      <svg viewBox="0 0 220 135" width="100%" height={135}>
        <circle cx={110} cy={112} r={8} fill={cor.ambar} />
        <circle cx={45} cy={28} r={8} fill={cor.azul} />
        <circle cx={175} cy={28} r={8} fill={cor.verde} />
        <line x1={110} y1={112} x2={55} y2={35} stroke={cor.texto} strokeWidth={7} strokeLinecap="round" />
        <TextoSvg x={25} y={62} tamanho={18} corTexto={cor.azul} mono>NF</TextoSvg>
        <TextoSvg x={195} y={62} tamanho={18} corTexto={cor.verde} mono>NA</TextoSvg>
        <TextoSvg x={110} y={137} tamanho={18} corTexto={cor.ambar} mono>COM</TextoSvg>
      </svg>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
        {[
          { nome: "COM", pino: comum, corPino: cor.ambar },
          { nome: "NF", pino: nf, corPino: cor.azul },
          { nome: "NA", pino: na, corPino: cor.verde },
        ].map(({ nome, pino, corPino }) => (
          <div key={nome} style={{ backgroundColor: cor.superficieAlt, borderRadius: 10, padding: "9px 4px" }}>
            <div style={{ fontFamily: fonteMono, fontSize: 15, color: corPino }}>{nome}</div>
            <div style={{ fontFamily: fonteTitulo, fontSize: 27, fontWeight: 800, color: cor.texto }}>{pino}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CenaQuatorzePinos: React.FC = () => {
  const frame = useCurrentFrame();
  const conta = Math.round(interpolate(frame, [40, 230], [0, 14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  return (
    <>
      <TituloCena
        passo="K1 · 4PDT"
        titulo="Por que a base tem 14 pinos?"
        apoio="Quatro comutadores independentes compartilham a mesma bobina."
        destaque={cor.roxo}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, gap: 22 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "stretch" }}>
          <GrupoPinos indice={1} comum={1} nf={5} na={9} atraso={24} />
          <GrupoPinos indice={2} comum={2} nf={6} na={10} atraso={52} />
          <GrupoPinos indice={3} comum={3} nf={7} na={11} atraso={80} />
          <GrupoPinos indice={4} comum={4} nf={8} na={12} atraso={108} />
          <Aparecer
            atraso={150}
            style={{
              width: 255,
              height: 285,
              borderRadius: 18,
              border: `2px solid ${cor.ambar}`,
              backgroundColor: cor.superficie,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <div style={{ fontFamily: fonteMono, color: cor.ambar, fontSize: 20, fontWeight: 700 }}>BOBINA 24 V</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: cor.ambarFraco, border: `3px solid ${cor.ambar}`, display: "grid", placeItems: "center", fontFamily: fonteTitulo, fontSize: 27, color: cor.texto, fontWeight: 800 }}>13</div>
              <div style={{ fontFamily: fonteMono, fontSize: 24, color: cor.textoFraco }}>A1</div>
            </div>
            <div style={{ width: 80, height: 34, border: `4px solid ${cor.ambar}`, borderRadius: 17 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: cor.ambarFraco, border: `3px solid ${cor.ambar}`, display: "grid", placeItems: "center", fontFamily: fonteTitulo, fontSize: 27, color: cor.texto, fontWeight: 800 }}>14</div>
              <div style={{ fontFamily: fonteMono, fontSize: 24, color: cor.textoFraco }}>A2</div>
            </div>
          </Aparecer>
        </div>

        <Aparecer
          atraso={195}
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 34,
            backgroundColor: cor.superficieAlt,
            border: `2px solid ${cor.borda}`,
            borderRadius: 18,
          }}
        >
          <div style={{ fontFamily: fonteTitulo, fontSize: 52, color: cor.texto, fontWeight: 800 }}>4 contatos</div>
          <div style={{ fontFamily: fonteTitulo, fontSize: 58, color: cor.roxo, fontWeight: 800 }}>×</div>
          <div style={{ fontFamily: fonteTitulo, fontSize: 52, color: cor.texto, fontWeight: 800 }}>3 terminais</div>
          <div style={{ fontFamily: fonteTitulo, fontSize: 58, color: cor.ambar, fontWeight: 800 }}>+</div>
          <div style={{ fontFamily: fonteTitulo, fontSize: 52, color: cor.texto, fontWeight: 800 }}>2 da bobina</div>
          <div style={{ fontFamily: fonteTitulo, fontSize: 58, color: cor.verde, fontWeight: 800 }}>=</div>
          <div style={{ minWidth: 105, fontFamily: fonteTitulo, fontSize: 76, color: cor.verde, fontWeight: 800, textAlign: "center" }}>{conta}</div>
        </Aparecer>
        <div style={{ fontFamily: fonteTexto, fontSize: 21, color: cor.textoFraco, textAlign: "center" }}>
          Esta é a pinagem comum do JQX-13F/4Z e MY4; confirme o diagrama do fabricante antes de ligar.
        </div>
      </div>
    </>
  );
};

const DiagramaReversivel: React.FC<{
  energizado: boolean;
  titulo: string;
  atraso: number;
}> = ({ energizado, titulo, atraso }) => {
  const frame = useCurrentFrame();
  const p = entrar(frame, atraso);
  const chaveY = energizado ? 65 : 195;
  const destaque = energizado ? cor.verde : cor.azul;
  return (
    <div style={{ opacity: p, transform: `translateY(${20 * (1 - p)}px)`, flex: 1, height: 330, backgroundColor: cor.superficie, border: `3px solid ${destaque}`, borderRadius: 20, padding: 20 }}>
      <div style={{ fontFamily: fonteTitulo, fontSize: 31, color: destaque, fontWeight: 800, textAlign: "center" }}>{titulo}</div>
      <svg viewBox="0 0 620 235" width="100%" height={235}>
        <circle cx={120} cy={120} r={11} fill={cor.ambar} />
        <circle cx={490} cy={65} r={11} fill={cor.verde} />
        <circle cx={490} cy={195} r={11} fill={cor.azul} />
        <line x1={120} y1={120} x2={465} y2={chaveY} stroke={destaque} strokeWidth={12} strokeLinecap="round" />
        <TextoSvg x={80} y={112} tamanho={25} corTexto={cor.ambar} ancora="end" mono>COM</TextoSvg>
        <TextoSvg x={535} y={74} tamanho={25} corTexto={cor.verde} ancora="start" mono>NA</TextoSvg>
        <TextoSvg x={535} y={204} tamanho={25} corTexto={cor.azul} ancora="start" mono>NF</TextoSvg>
        <TextoSvg x={310} y={230} tamanho={21} corTexto={cor.textoFraco} mono>
          {energizado ? "COM → NA" : "COM → NF"}
        </TextoSvg>
      </svg>
    </div>
  );
};

export const CenaReversivel: React.FC = () => {
  const frame = useCurrentFrame();
  const troca = frame >= 260;
  return (
    <>
      <TituloCena
        passo="CONTATO CO"
        titulo="Reversível significa comutador"
        apoio="O comum troca de caminho quando a bobina muda de estado."
        destaque={cor.roxo}
      />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: 20 }}>
        <div style={{ display: "flex", gap: 28 }}>
          <DiagramaReversivel energizado={false} titulo="BOBINA DESENERGIZADA" atraso={20} />
          <div style={{ width: 110, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <div style={{ fontFamily: fonteTitulo, fontSize: 66, color: troca ? cor.roxo : cor.textoApagado, transform: `translateX(${Math.sin(frame / 20) * 5}px)` }}>⇄</div>
            <div style={{ fontFamily: fonteMono, fontSize: 18, color: cor.textoFraco, textAlign: "center" }}>BOBINA<br />24 V</div>
          </div>
          <DiagramaReversivel energizado titulo="BOBINA ENERGIZADA" atraso={70} />
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
          <Aparecer atraso={125} style={{ flex: 1, display: "flex", gap: 12 }}>
            <Etiqueta texto="NA1 · SELO" corEtiqueta={cor.roxo} />
            <Etiqueta texto="NA3 · RETORNO D25" corEtiqueta={cor.azul} />
            <Etiqueta texto="NA2 / NA4 · RESERVA" corEtiqueta={cor.textoFraco} />
          </Aparecer>
          <Aparecer
            atraso={185}
            style={{
              padding: "14px 22px",
              borderRadius: 12,
              border: `2px solid ${cor.vermelho}`,
              backgroundColor: cor.vermelhoFraco,
              color: cor.vermelho,
              fontFamily: fonteTexto,
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            NÃO inverte tensão nem rotação
          </Aparecer>
        </div>
      </div>
    </>
  );
};

export const CenaK2: React.FC = () => {
  const frame = useCurrentFrame();
  const fechado = frame >= 270;
  const pFecha = entrar(frame, 270, 16);
  const leverY = interpolate(pFecha, [0, 1], [232, 265]);
  return (
    <>
      <TituloCena
        passo="K2"
        titulo="A bobina é 24 V; a carga é 12 V"
        apoio="O contato 30–87 foi escolhido para suportar corrente contínua com folga."
        destaque={cor.vermelho}
      />
      <Quadro>
        <svg viewBox="0 0 1680 585" width="100%" height="100%">
          <g opacity={entrar(frame, 20)}>
            <rect x={45} y={95} width={445} height={350} rx={22} fill={cor.superficie} stroke={cor.roxo} strokeWidth={3} />
            <TextoSvg x={267} y={150} tamanho={34} corTexto={cor.roxo} peso={800}>K1 · COMANDO</TextoSvg>
            <line x1={100} y1={235} x2={435} y2={235} stroke={cor.roxo} strokeWidth={5} />
            <TextoSvg x={267} y={205} tamanho={22} corTexto={cor.textoFraco} mono>FIOS FINOS · CORRENTES DE mA</TextoSvg>
            <TextoSvg x={267} y={300} tamanho={28} corTexto={cor.texto}>NA1: selo</TextoSvg>
            <TextoSvg x={267} y={348} tamanho={28} corTexto={cor.texto}>NA3: retorno D25</TextoSvg>
            <TextoSvg x={267} y={410} tamanho={21} corTexto={cor.vermelho} peso={800}>NÃO conduz os 6,3 A</TextoSvg>
          </g>

          <g opacity={entrar(frame, 75)}>
            <rect x={550} y={45} width={620} height={455} rx={26} fill={cor.superficie} stroke={cor.vermelho} strokeWidth={4} />
            <TextoSvg x={860} y={105} tamanho={42} corTexto={cor.vermelho} peso={800}>K2 · POTÊNCIA</TextoSvg>
            <rect x={615} y={145} width={210} height={120} rx={18} fill={cor.superficieAlt} stroke={cor.ambar} strokeWidth={3} />
            <TextoSvg x={720} y={190} tamanho={23} corTexto={cor.ambar} mono>BOBINA</TextoSvg>
            <TextoSvg x={720} y={238} tamanho={38} corTexto={cor.texto} peso={800}>24 Vcc</TextoSvg>

            <rect x={880} y={145} width={225} height={275} rx={18} fill={cor.superficieAlt} stroke={cor.vermelho} strokeWidth={3} />
            <TextoSvg x={992} y={188} tamanho={23} corTexto={cor.vermelho} mono>CONTATO</TextoSvg>
            <circle cx={930} cy={265} r={10} fill={cor.texto} />
            <circle cx={1055} cy={265} r={10} fill={cor.texto} />
            <line x1={930} y1={265} x2={1037} y2={leverY} stroke={cor.vermelho} strokeWidth={10} strokeLinecap="round" />
            <TextoSvg x={930} y={310} tamanho={19} corTexto={cor.textoFraco} mono>30</TextoSvg>
            <TextoSvg x={1055} y={310} tamanho={19} corTexto={cor.textoFraco} mono>87</TextoSvg>
            <TextoSvg x={992} y={365} tamanho={38} corTexto={cor.vermelho} peso={800}>40 A</TextoSvg>
            <TextoSvg x={992} y={398} tamanho={18} corTexto={cor.textoFraco} mono>NOMINAL</TextoSvg>
            <TextoSvg x={720} y={330} tamanho={22} corTexto={fechado ? cor.verde : cor.textoFraco} mono>{fechado ? "ENERGIZADA" : "AGUARDANDO"}</TextoSvg>
          </g>

          <g opacity={entrar(frame, 150)}>
            <TextoSvg x={1260} y={135} tamanho={22} corTexto={cor.vermelho} mono>RAMAL DE CARGA</TextoSvg>
            <rect x={1210} y={175} width={410} height={250} rx={22} fill={cor.superficie} stroke={fechado ? cor.vermelho : cor.borda} strokeWidth={4} />
            <TextoSvg x={1415} y={245} tamanho={48} corTexto={cor.texto} peso={800}>12 V</TextoSvg>
            <TextoSvg x={1415} y={315} tamanho={64} corTexto={cor.vermelho} peso={800}>6,3 A</TextoSvg>
            <TextoSvg x={1415} y={370} tamanho={24} corTexto={cor.textoFraco}>BTS7960 → Peltier / PTC</TextoSvg>
          </g>

          {fechado ? (
            <FluxoCaminho
              d="M1055 265 H1170 V405 H1600"
              corLinha={cor.vermelho}
              frame={frame}
              ativo
              espessura={18}
            />
          ) : null}

          <g opacity={entrar(frame, 355)}>
            <rect x={145} y={515} width={1390} height={58} rx={14} fill={cor.vermelhoFraco} stroke={cor.vermelho} strokeWidth={2} />
            <TextoSvg x={840} y={553} tamanho={25} corTexto={cor.vermelho} peso={800}>
              Não paralelize contatos do K1: eles não fecham exatamente no mesmo instante.
            </TextoSvg>
          </g>
        </svg>
      </Quadro>
    </>
  );
};

const PainelCaminho: React.FC<{
  titulo: string;
  subtitulo: string;
  destaque: string;
  children: React.ReactNode;
  atraso: number;
}> = ({ titulo, subtitulo, destaque, children, atraso }) => (
  <Aparecer
    atraso={atraso}
    style={{
      flex: 1,
      minWidth: 0,
      height: 365,
      padding: "22px 28px",
      borderRadius: 20,
      border: `3px solid ${destaque}`,
      backgroundColor: cor.superficie,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    <div style={{ fontFamily: fonteTitulo, fontSize: 34, fontWeight: 800, color: destaque }}>{titulo}</div>
    <div style={{ fontFamily: fonteTexto, fontSize: 22, color: cor.textoFraco, marginTop: 4 }}>{subtitulo}</div>
    <div style={{ flex: 1, width: "100%", minHeight: 0 }}>{children}</div>
  </Aparecer>
);

export const CenaDoisCaminhos: React.FC = () => {
  const frame = useCurrentFrame();
  const cortar = frame >= 300;
  const corteP = entrar(frame, 300, 18);
  return (
    <>
      <TituloCena
        passo="PARADA"
        titulo="Hardware e software podem cortar a cadeia"
        apoio="Os dois caminhos convergem nas mesmas bobinas e no mesmo contato de potência."
        destaque={cor.vermelho}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18, minHeight: 0 }}>
        <div style={{ display: "flex", gap: 28 }}>
          <PainelCaminho titulo="CAMINHO FÍSICO" subtitulo="independe do programa" destaque={cor.vermelho} atraso={20}>
            <svg viewBox="0 0 720 260" width="100%" height="100%">
              <rect x={35} y={65} width={190} height={110} rx={16} fill={cor.superficieAlt} stroke={cor.azul} strokeWidth={3} />
              <TextoSvg x={130} y={112} tamanho={24} corTexto={cor.azul} peso={800}>ARDUINO</TextoSvg>
              <TextoSvg x={130} y={148} tamanho={18} corTexto={cortar ? cor.vermelho : cor.textoFraco} mono>{cortar ? "LOOP TRAVADO" : "EXECUTANDO"}</TextoSvg>
              <line x1={255} y1={120} x2={360} y2={120} stroke={cor.bordaForte} strokeWidth={5} strokeDasharray="10 10" />
              <circle cx={445} cy={120} r={58} fill={cortar ? cor.vermelho : cor.vermelhoFraco} stroke={cor.vermelho} strokeWidth={4} />
              <circle cx={445} cy={120} r={28} fill={cortar ? "#B91C1C" : cor.vermelho} />
              <TextoSvg x={445} y={208} tamanho={20} corTexto={cor.vermelho} mono>EMERGÊNCIA</TextoSvg>
              <line x1={520} y1={120} x2={665} y2={120} stroke={cortar ? cor.borda : cor.ambar} strokeWidth={8} />
              {cortar ? <line x1={575} y1={75} x2={625} y2={165} stroke={cor.vermelho} strokeWidth={12} strokeLinecap="round" /> : null}
              <TextoSvg x={360} y={245} tamanho={21} corTexto={cortar ? cor.vermelho : cor.textoFraco}>
                {cortar ? "S0 abre mesmo com software travado" : "S0 e STOP fechados em repouso"}
              </TextoSvg>
            </svg>
          </PainelCaminho>

          <PainelCaminho titulo="CAMINHO DO SOFTWARE" subtitulo="supervisão automática" destaque={cor.verde} atraso={65}>
            <svg viewBox="0 0 720 260" width="100%" height="100%">
              <circle cx={105} cy={120} r={54} fill={cortar ? cor.vermelhoFraco : cor.azulFraco} stroke={cortar ? cor.vermelho : cor.azul} strokeWidth={4} />
              <g transform={`translate(105 120) rotate(${cortar ? 0 : frame * 4})`}>
                {[0, 90, 180, 270].map((a) => <ellipse key={a} cx={0} cy={-29} rx={11} ry={29} fill={cortar ? cor.textoApagado : cor.azul} transform={`rotate(${a})`} />)}
              </g>
              <TextoSvg x={105} y={205} tamanho={19} corTexto={cortar ? cor.vermelho : cor.azul} mono>{cortar ? "RPM = 0" : "RPM OK"}</TextoSvg>
              <Fluxo x1={170} y1={120} x2={300} y2={120} corLinha={cortar ? cor.vermelho : cor.azul} frame={frame} ativo={!cortar} espessura={6} />
              <rect x={300} y={65} width={150} height={110} rx={16} fill={cor.superficieAlt} stroke={cor.azul} strokeWidth={3} />
              <TextoSvg x={375} y={112} tamanho={24} corTexto={cor.azul} peso={800}>D26</TextoSvg>
              <TextoSvg x={375} y={148} tamanho={18} corTexto={cor.textoFraco} mono>ARDUINO</TextoSvg>
              <Fluxo x1={450} y1={120} x2={535} y2={120} corLinha={cor.verde} frame={frame} ativo={!cortar} espessura={6} />
              <rect x={535} y={65} width={145} height={110} rx={16} fill={cor.superficieAlt} stroke={cortar ? cor.vermelho : cor.verde} strokeWidth={3} />
              <TextoSvg x={607} y={115} tamanho={32} corTexto={cortar ? cor.vermelho : cor.verde} peso={800}>K0</TextoSvg>
              <TextoSvg x={607} y={149} tamanho={17} corTexto={cor.textoFraco} mono>{cortar ? "ABERTO" : "FECHADO"}</TextoSvg>
              <TextoSvg x={360} y={245} tamanho={21} corTexto={cortar ? cor.vermelho : cor.textoFraco}>
                {cortar ? "falha detectada → K0 abre" : "sensores supervisionados"}
              </TextoSvg>
            </svg>
          </PainelCaminho>
        </div>

        <div
          style={{
            opacity: entrar(frame, 150),
            flex: 1,
            minHeight: 0,
            borderRadius: 18,
            border: `3px solid ${cortar ? cor.vermelho : cor.ambar}`,
            backgroundColor: cortar ? cor.vermelhoFraco : cor.superficieAlt,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 30,
          }}
        >
          <div style={{ fontFamily: fonteMono, fontSize: 25, color: cor.textoFraco }}>AMBOS RESULTAM EM</div>
          <div style={{ fontFamily: fonteTitulo, fontSize: 38, fontWeight: 800, color: cortar ? cor.vermelho : cor.ambar }}>K1 OFF</div>
          <div style={{ fontFamily: fonteTitulo, fontSize: 38, color: cor.textoApagado }}>→</div>
          <div style={{ fontFamily: fonteTitulo, fontSize: 38, fontWeight: 800, color: cortar ? cor.vermelho : cor.ambar }}>K2 OFF</div>
          <div style={{ fontFamily: fonteTitulo, fontSize: 38, color: cor.textoApagado }}>→</div>
          <div style={{ fontFamily: fonteTitulo, fontSize: 38, fontWeight: 800, color: cortar ? cor.vermelho : cor.ambar }}>0 V NO BD-POT</div>
          {cortar ? (
            <div style={{ opacity: corteP, width: 18, height: 18, borderRadius: 9, backgroundColor: cor.vermelho, boxShadow: `0 0 ${12 + pulso(frame, 55) * 20}px ${cor.vermelho}` }} />
          ) : null}
        </div>
      </div>
    </>
  );
};

const CartaoResumo: React.FC<{
  nome: string;
  apelido: string;
  funcao: string;
  detalhe: string;
  destaque: string;
  atraso: number;
}> = ({ nome, apelido, funcao, detalhe, destaque, atraso }) => {
  const frame = useCurrentFrame();
  const p = entrar(frame, atraso);
  const glow = 0.12 + pulso(frame, 110, atraso) * 0.12;
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${28 * (1 - p)}px)`,
        flex: 1,
        height: 325,
        borderRadius: 22,
        border: `3px solid ${destaque}`,
        backgroundColor: cor.superficie,
        padding: "28px 30px",
        boxShadow: `0 0 34px ${destaque}${Math.round(glow * 255).toString(16).padStart(2, "0")}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div style={{ width: 86, height: 86, borderRadius: 43, display: "grid", placeItems: "center", backgroundColor: `${destaque}20`, border: `3px solid ${destaque}`, fontFamily: fonteTitulo, fontSize: 42, fontWeight: 800, color: destaque }}>{nome}</div>
      <div style={{ fontFamily: fonteMono, fontSize: 20, color: destaque, marginTop: 18, fontWeight: 700 }}>{apelido}</div>
      <div style={{ fontFamily: fonteTitulo, fontSize: 32, color: cor.texto, marginTop: 14, fontWeight: 800 }}>{funcao}</div>
      <div style={{ fontFamily: fonteTexto, fontSize: 22, color: cor.textoFraco, marginTop: 10, lineHeight: 1.35 }}>{detalhe}</div>
    </div>
  );
};

export const CenaResumo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <TituloCena
        passo="RESUMO"
        titulo="Uma cadeia, três responsabilidades"
        apoio="A resposta curta: os botões explicam parte da arquitetura; os níveis elétricos explicam o restante."
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22, minHeight: 0 }}>
        <div style={{ display: "flex", gap: 24 }}>
          <CartaoResumo nome="K0" apelido="INTERFACE" funcao="Software pode cortar" detalhe="D26 em 5 V comanda um contato na cadeia de 24 V." destaque={cor.verde} atraso={20} />
          <CartaoResumo nome="K1" apelido="MEMÓRIA" funcao="Selo + estado" detalhe="Mantém o comando e confirma ao Arduino pelo D25." destaque={cor.roxo} atraso={70} />
          <CartaoResumo nome="K2" apelido="MÚSCULO" funcao="Corta a potência" detalhe="Contato de 40 A chaveia a carga de 12 V / 6,3 A." destaque={cor.vermelho} atraso={120} />
        </div>

        <Aparecer
          atraso={185}
          style={{
            borderRadius: 18,
            border: `3px solid ${cor.ambar}`,
            backgroundColor: `${cor.ambar}14`,
            padding: "17px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 26,
          }}
        >
          <div style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: cor.ambar, boxShadow: `0 0 ${12 + pulso(frame, 60) * 20}px ${cor.ambar}` }} />
          <div style={{ fontFamily: fonteTitulo, fontSize: 31, color: cor.ambar, fontWeight: 800 }}>APÓS QUALQUER PARADA</div>
          <div style={{ fontFamily: fonteTitulo, fontSize: 34, color: cor.textoApagado }}>→</div>
          <div style={{ fontFamily: fonteTitulo, fontSize: 38, color: cor.texto, fontWeight: 800 }}>AGUARDANDO NOVO START</div>
        </Aparecer>

        <Aparecer atraso={245} style={{ fontFamily: fonteTexto, fontSize: 20, color: cor.textoFraco, textAlign: "center" }}>
          Demonstração didática · uma máquina real exige apreciação de risco e componentes de segurança adequados.
        </Aparecer>
      </div>
    </>
  );
};
