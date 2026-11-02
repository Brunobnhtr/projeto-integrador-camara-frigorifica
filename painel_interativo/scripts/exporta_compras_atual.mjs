import {writeFileSync} from 'node:fs';
import * as painel from '../src/data/painel_completo.js';
import * as montagem from '../src/data/montagem.js';
import * as discretos from '../src/data/discretos.js';
import * as camara from '../src/data/camara.js';
const destino=new URL('../../tmp/pdfs/modelo_atual.json',import.meta.url);
writeFileSync(destino,JSON.stringify({
 caixa:painel.CAIXA,componentes:painel.COMPONENTES,cortes:montagem.PECAS,
 canaletas:painel.CANALETAS,canaletasPorta:painel.CANALETAS_PORTA,
 trilhos:painel.TRILHOS,trilhoInicio:painel.TRILHO_X0,trilhoFim:painel.TRILHO_X1,
 discretos:discretos.DISCRETOS,camara:camara.COMPONENTES,
},null,2));
console.log('Modelo atual exportado dos módulos JavaScript.');
