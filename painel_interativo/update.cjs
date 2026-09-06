const fs = require('fs');
let code = fs.readFileSync('src/data/painel_completo.js', 'utf8');

const updates = {
  'MEGA': 127,
  'SV-1': 233,
  'AD-1': 288,
  'ADC_Modbus': 350.5,
  'ACS712-1': 417,
  'ACS712-2': 481,
  'BD-0V-B': 556.5,
  'RTC': 629.5,

  'BTS1': 90,
  'BTS2': 190,
  'ESP32': 313,
  'F-P': 429,
  'KA123': 549.5,

  'KM1': 77,
  'BD-POT': 152,
  'BD-AUX': 228,
  'BD-24V': 308.5,
  'BD-5V': 414.5,
  'BD-0V': 540
};

for (const [id, x] of Object.entries(updates)) {
  const regex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?x:\\s*)([\\d\\.]+)`, 'g');
  code = code.replace(regex, '$1' + x);
}

fs.writeFileSync('src/data/painel_completo.js', code);
console.log('Coordinates updated');
