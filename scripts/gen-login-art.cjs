const W = 640, H = 900, CX = 320, CY = 430;
let seed = 1337;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

const glass = 'fill="rgba(180,120,246,0.10)" stroke="rgba(201,120,248,0.40)" stroke-width="1.5"';
const wrap = (x, y, s, op, inner) => `  <g transform="translate(${x},${y}) scale(${s})" opacity="${op}">\n${inner}\n  </g>`;

const vinyl = () => `    <circle r="46" fill="#1a0c40"/>
    <circle r="46" fill="none" stroke="#7c2fd6" stroke-opacity="0.5" stroke-width="1"/>
    <circle r="38" fill="none" stroke="#9949f3" stroke-opacity="0.25" stroke-width="1"/>
    <circle r="30" fill="none" stroke="#9949f3" stroke-opacity="0.25" stroke-width="1"/>
    <circle r="22" fill="none" stroke="#9949f3" stroke-opacity="0.25" stroke-width="1"/>
    <circle r="15" fill="#b073f6"/>
    <circle r="4" fill="#1a0c40"/>`;

const headphones = () => `    <path d="M-34 6 A34 34 0 0 1 34 6" fill="none" stroke="#c078f8" stroke-width="7" stroke-linecap="round"/>
    <rect x="-42" y="2" width="16" height="30" rx="7" fill="#9949f3"/>
    <rect x="26" y="2" width="16" height="30" rx="7" fill="#9949f3"/>`;

const eqcard = () => {
  let bars = ''; const hs = [18, 30, 44, 26, 38, 22, 34];
  hs.forEach((h, i) => { bars += `    <rect x="${-38 + i * 11}" y="${18 - h}" width="6" height="${h}" rx="3" fill="url(#accent)"/>\n`; });
  return `    <rect x="-46" y="-30" width="92" height="60" rx="12" ${glass}/>\n${bars}`;
};

const albumThumb = () => `    <rect x="-26" y="-26" width="52" height="52" rx="12" fill="url(#album)"/>
    <circle r="12" fill="rgba(0,0,0,0.25)"/>
    <path d="M-4 -6 L8 0 L-4 6 Z" fill="#fff" opacity="0.9"/>`;

const playlist = () => `    <rect x="-44" y="-34" width="88" height="68" rx="12" ${glass}/>
    <rect x="-34" y="-24" width="26" height="26" rx="6" fill="url(#album)"/>
    <rect x="0" y="-22" width="34" height="5" rx="2.5" fill="#c078f8" opacity="0.8"/>
    <rect x="0" y="-11" width="26" height="5" rx="2.5" fill="#b073f6" opacity="0.55"/>
    <rect x="-34" y="10" width="68" height="5" rx="2.5" fill="#b073f6" opacity="0.45"/>
    <rect x="-34" y="21" width="50" height="5" rx="2.5" fill="#b073f6" opacity="0.35"/>`;

const avatar = () => `    <circle r="26" fill="url(#accent)"/>
    <circle cy="-6" r="9" fill="#fff" opacity="0.92"/>
    <path d="M-14 18 A16 16 0 0 1 14 18 Z" fill="#fff" opacity="0.92"/>`;

const folder = () => `    <path d="M-34 -20 h20 l7 8 h34 a6 6 0 0 1 6 6 v26 a6 6 0 0 1 -6 6 h-61 a6 6 0 0 1 -6 -6 v-34 a6 6 0 0 1 6 -6 z" ${glass}/>
    <circle cx="8" cy="12" r="4" fill="#c078f8"/>
    <rect x="11" y="-6" width="3" height="18" fill="#c078f8"/>`;

const analytics = () => `    <rect x="-42" y="-32" width="84" height="64" rx="12" ${glass}/>
    <rect x="-30" y="6" width="10" height="18" rx="3" fill="url(#accent)"/>
    <rect x="-14" y="-2" width="10" height="26" rx="3" fill="url(#accent)"/>
    <rect x="2" y="-12" width="10" height="36" rx="3" fill="url(#accent)"/>
    <rect x="18" y="-6" width="10" height="30" rx="3" fill="url(#accent)"/>
    <polyline points="-30,-8 -14,-16 2,-22 18,-16" fill="none" stroke="#e9d0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;

const mic = () => `    <rect x="-9" y="-30" width="18" height="34" rx="9" fill="url(#accent)"/>
    <path d="M-16 -2 a16 16 0 0 0 32 0" fill="none" stroke="#c078f8" stroke-width="3"/>
    <rect x="-2" y="14" width="4" height="12" fill="#c078f8"/>
    <rect x="-12" y="26" width="24" height="4" rx="2" fill="#c078f8"/>`;

const speaker = () => `    <rect x="-24" y="-34" width="48" height="68" rx="10" ${glass}/>
    <circle cy="10" r="13" fill="none" stroke="#c078f8" stroke-width="2"/>
    <circle cy="10" r="5" fill="#b073f6"/>
    <circle cy="-18" r="6" fill="none" stroke="#c078f8" stroke-width="2"/>`;

const note = () => `    <ellipse cx="0" cy="24" rx="11" ry="8" transform="rotate(-20 0 24)" fill="#e9d0ff"/>
    <rect x="9" y="-16" width="4" height="40" fill="#e9d0ff"/>
    <path d="M13 -16 q18 5 14 25 q0 -14 -14 -18 z" fill="#e9d0ff"/>`;

const elems = [
  wrap(168, 246, 1.0, 0.95, vinyl()),
  wrap(474, 232, 1.0, 0.95, headphones()),
  wrap(112, 452, 0.95, 0.9, eqcard()),
  wrap(528, 420, 1.0, 0.95, albumThumb()),
  wrap(176, 650, 1.0, 0.92, playlist()),
  wrap(486, 636, 0.95, 0.9, analytics()),
  wrap(328, 138, 0.85, 0.9, avatar()),
  wrap(92, 326, 0.8, 0.8, folder()),
  wrap(556, 314, 0.8, 0.85, mic()),
  wrap(330, 772, 0.9, 0.85, speaker()),
  wrap(150, 540, 0.75, 0.7, albumThumb()),
  wrap(470, 510, 0.7, 0.7, note()),
  wrap(210, 410, 0.55, 0.65, note()),
  wrap(430, 720, 0.6, 0.6, note()),
];

let circles = '';
[130, 195, 270, 350, 430].forEach((r, i) => { circles += `  <circle cx="${CX}" cy="${CY}" r="${r}" fill="none" stroke="#c078f8" stroke-opacity="${(0.20 - i * 0.035).toFixed(3)}" stroke-width="1.2"/>\n`; });

let parts = '';
for (let i = 0; i < 34; i++) {
  const x = (rnd() * W).toFixed(0), y = (rnd() * H).toFixed(0), r = (0.8 + rnd() * 1.8).toFixed(1), o = (0.25 + rnd() * 0.55).toFixed(2);
  parts += `  <circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="${o}"/>\n`;
}

const swave = (base, amp, f, p) => {
  let d = '';
  for (let x = -20; x <= W + 20; x += 10) { const y = base + amp * Math.sin(f * x + p); d += (x <= -20 ? `M${x} ${y.toFixed(1)}` : ` L${x} ${y.toFixed(1)}`); }
  return d;
};
const waves = `  <path d="${swave(360, 20, 0.018, 0.5)}" fill="none" stroke="#c078f8" stroke-opacity="0.14" stroke-width="1.5"/>
  <path d="${swave(520, 26, 0.015, 2.2)}" fill="none" stroke="#9949f3" stroke-opacity="0.12" stroke-width="1.5"/>
  <path d="${swave(660, 30, 0.013, 4.0)}" fill="none" stroke="#c078f8" stroke-opacity="0.10" stroke-width="1.5"/>`;

const centerNote = `  <circle cx="${CX}" cy="${CY}" r="120" fill="url(#coreHalo)" filter="url(#glow)"/>
  <circle cx="${CX}" cy="${CY}" r="64" fill="url(#core)"/>
  <g transform="translate(${CX - 6},${CY - 4}) scale(1.7)">
    <ellipse cx="0" cy="24" rx="11" ry="8" transform="rotate(-20 0 24)" fill="#ffffff"/>
    <ellipse cx="34" cy="17" rx="11" ry="8" transform="rotate(-20 34 17)" fill="#ffffff"/>
    <rect x="9" y="-26" width="4.5" height="50" fill="#ffffff"/>
    <rect x="43" y="-33" width="4.5" height="50" fill="#ffffff"/>
    <path d="M13.5 -26 L47.5 -33 L47.5 -20 L13.5 -13 Z" fill="#ffffff"/>
  </g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Music management admin illustration">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="#2b1663"/>
      <stop offset="0.5" stop-color="#180b40"/>
      <stop offset="1" stop-color="#0c0522"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c078f8"/><stop offset="1" stop-color="#7c2fd6"/>
    </linearGradient>
    <linearGradient id="album" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#b073f6"/><stop offset="1" stop-color="#6d28c9"/>
    </linearGradient>
    <radialGradient id="core" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff"/><stop offset="0.4" stop-color="#e6b3ff"/>
      <stop offset="1" stop-color="#9949f3" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="coreHalo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#b073f6" stop-opacity="0.6"/>
      <stop offset="1" stop-color="#b073f6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowspot" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#7c2fd6" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#7c2fd6" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="26"/></filter>
    <filter id="glowSoft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.4"/></filter>
    <filter id="soft" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="40"/></filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <circle cx="120" cy="140" r="120" fill="url(#glowspot)" filter="url(#soft)"/>
  <circle cx="560" cy="760" r="150" fill="url(#glowspot)" filter="url(#soft)"/>

${waves}

${circles}
${parts}
${centerNote}

${elems.join('\n')}
</svg>
`;
require('fs').writeFileSync('C:/vivek/balm-admin/public/img/balm-logo/login-side-4.svg', svg);
console.log('written', svg.length);
