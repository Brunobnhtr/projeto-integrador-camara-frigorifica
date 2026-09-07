const fs = require('fs');
let code = fs.readFileSync('src/data/painel_completo.js', 'utf8');

const updates = {
  'MEGA': 60,
  'SV-1': 218,
  'AD-1': 272,
  'ADC_Modbus': 328,
  'ACS712-1': 397,
  'ACS712-2': 461,
  'BD-0V-B': 525,
  'RTC': 612,

  'BTS1': 60,
  'BTS2': 160,
  'ESP32': 260,
  'F-P': 406,
  'KA123': 492,

  'KM1': 60,
  'BD-POT': 139,
  'BD-AUX': 220,
  'BD-24V': 301,
  'BD-5V': 391,
  'BD-0V': 523
};

for (const [id, x] of Object.entries(updates)) {
  const regex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?x:\\s*)([\\d\\.]+)`, 'g');
  code = code.replace(regex, '$1' + x);
}

fs.writeFileSync('src/data/painel_completo.js', code);
console.log('Coordinates updated as left edges');
