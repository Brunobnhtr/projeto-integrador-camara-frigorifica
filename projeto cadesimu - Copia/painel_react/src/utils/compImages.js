// Maps categoria + nome → { off, on } image paths (in /comps/)
// off = default/resting state; on = energized/active state

const CATEGORY_MAP = {
  contator_pot: { off: 'comp_km_cjx_0.png',          on: 'comp_km_cjx_1.png' },
  disjuntor:    { off: 'comp_cb_2P_off.png',          on: 'comp_cb_2P_on.png' },
  rele_termico: { off: 'comp_fr_0.png',               on: 'comp_fr_1.png' },
  fusivel:      { off: 'comp_fuse_3p.png',            on: 'comp_fuse_3p.png' },
  seletor:      { off: 'comp_knob_switch_0.png',      on: 'comp_knob_switch_1.png' },
  motor:        { off: 'comp_motorpe3.png',           on: 'comp_motorpe3_turn0.png' },
  entrada:      { off: 'comp_terminal_strip_2x4_h.png', on: 'comp_terminal_strip_2x4_h.png' },
  temporizador: { off: 'comp_kt_power_on_delay_0.png', on: 'comp_kt_power_on_delay_1.png' },
  fonte_dc:     { off: 'comp_switch_power.png',       on: 'comp_switch_power_s.png' },
  rele:         { off: 'comp_ka_8_points_0.png',      on: 'comp_ka_8_points_1.png' },
  bobina:       { off: 'comp_km220_0.png',            on: 'comp_km220_1.png' },
  sensor:       { off: 'comp_travel_switch_0.png',    on: 'comp_travel_switch_1.png' },
};

// For botao: detect stop/emergency by name prefix (SB/LA/PB common in Brazilian electrical)
function botaoImages(nome) {
  const n = (nome || '').toUpperCase();
  // Emergency stop or NC buttons tend to have "STOP", "SCRAM", or "NC" in name, or red convention
  const isStop = /STOP|NC|EMERG|SB[2-9]|SB[1-9][0-9]/i.test(n)
    || /^(SB|PB|BO|BT|B)[^A-Z]*(R|STOP|2|VERMELHO)/i.test(n);
  const isEmergency = /EMERG|SCRAM|QS/i.test(n);
  if (isEmergency) return { off: 'comp_scram_switch_0.png', on: 'comp_scram_switch_1.png' };
  if (isStop)      return { off: 'comp_sb_red_0.png',       on: 'comp_sb_red_1.png' };
  return               { off: 'comp_sb_green_0.png',        on: 'comp_sb_green_1.png' };
}

function sinaleiiroImages(nome) {
  const n = (nome || '').toUpperCase();
  if (/RED|VERM|ALARM|FAULT|ERR/i.test(n)) return { off: 'comp_led_red_0.png',    on: 'comp_led_red_1.png' };
  if (/YEL|AMAR|WARN/i.test(n))            return { off: 'comp_led_yellow_0.png', on: 'comp_led_yellow_1.png' };
  return                                           { off: 'comp_led_green_0.png',  on: 'comp_led_green_1.png' };
}

/**
 * Returns { off, on } with paths like '/comps/comp_km_cjx_0.png'
 * active: if true, return the 'on' image path
 */
export function getCompImage(categoria, nome, active = false) {
  let entry;
  if (categoria === 'botao')     entry = botaoImages(nome);
  else if (categoria === 'sinaleiro') entry = sinaleiiroImages(nome);
  else entry = CATEGORY_MAP[categoria];

  if (!entry) return null;
  const file = active ? entry.on : entry.off;
  return `comps/${file}`;
}

export function hasCompImage(categoria) {
  return categoria === 'botao' || categoria === 'sinaleiro' || categoria in CATEGORY_MAP;
}
