import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const fonteTitulo = loadArchivo("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;

export const fonteTexto = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;

export const fonteMono = loadMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
}).fontFamily;

/** Paleta do projeto — industrial escura, com âmbar de energia. */
export const cor = {
  fundo: "#0A0E13",
  fundoAlt: "#111823",
  superficie: "#18212E",
  superficieAlt: "#1E2937",
  borda: "#2A3A4F",
  bordaForte: "#3D5069",

  texto: "#EAF1F8",
  textoFraco: "#93A6BC",
  textoApagado: "#5F7288",

  ambar: "#F5A524",
  ambarFraco: "#7A5310",
  azul: "#3FBDF3",
  azulFraco: "#12455C",
  verde: "#3DD68C",
  verdeFraco: "#12492F",
  vermelho: "#F87171",
  vermelhoFraco: "#5C1F1F",
  roxo: "#A78BFA",
  cobre: "#C8763C",

  zebraClara: "#F5C518",
  zebraEscura: "#12161C",
  mdf: "#C8A97E",
  mdfEscuro: "#8E7452",
  pisoCinza: "#9AA5B1",
} as const;

export const ESPACO = {
  margemLateral: 120,
  topoBarra: 96,
  faixaLegenda: 200,
} as const;

export const LARGURA = 1920;
export const ALTURA = 1080;
export const FPS = 30;

export const msParaFrames = (ms: number) => Math.round((ms / 1000) * FPS);
