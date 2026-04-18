export const PLAYER_SVG = `<svg viewBox="0 0 80 110" width="80" height="110" xmlns="http://www.w3.org/2000/svg">
  <circle cx="70" cy="11" r="11" fill="#00ffcc" opacity="0.2"/>
  <rect x="67" y="10" width="5" height="58" rx="2.5" fill="#aabbcc"/>
  <rect x="68" y="10" width="3" height="57" rx="1.5" fill="#ccddee" opacity="0.7"/>
  <circle cx="70" cy="10" r="10" fill="#009977" opacity="0.35"/>
  <circle cx="70" cy="10" r="7" fill="#00ddaa"/>
  <circle cx="70" cy="10" r="4.5" fill="#66ffdd"/>
  <circle cx="68" cy="8" r="2" fill="white" opacity="0.9"/>
  <path d="M23,52 C12,66 10,90 14,108 L40,103 L40,52Z" fill="#0f1d6e"/>
  <path d="M57,52 C68,66 70,90 66,108 L40,103 L40,52Z" fill="#0a1455"/>
  <path d="M23,52 C18,64 16,80 18,96" stroke="#1a2f99" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/>
  <rect x="26" y="52" width="28" height="36" rx="8" fill="#1a3acc"/>
  <rect x="30" y="56" width="20" height="11" rx="4" fill="#2a4aee"/>
  <rect x="30" y="56" width="20" height="5" rx="2" fill="#4466ff"/>
  <line x1="40" y1="68" x2="40" y2="86" stroke="#1533bb" stroke-width="1.5"/>
  <circle cx="40" cy="75" r="6" fill="#062040"/>
  <circle cx="40" cy="75" r="4.2" fill="#00bbaa"/>
  <circle cx="40" cy="75" r="2.6" fill="#00ffee"/>
  <circle cx="38.5" cy="73.5" r="1.2" fill="white" opacity="0.9"/>
  <ellipse cx="40" cy="34" rx="21" ry="22" fill="#1a3acc" stroke="#0f1d8c" stroke-width="2"/>
  <ellipse cx="35" cy="25" rx="12" ry="9" fill="#3355ee" opacity="0.5"/>
  <rect x="23" y="39" width="34" height="7" rx="3.5" fill="#1230bb"/>
  <path d="M25,43 Q40,49 55,43 L53,38 Q40,42 27,38Z" fill="#010d24"/>
  <ellipse cx="33" cy="41" rx="5.5" ry="3" fill="#00ffcc" opacity="0.95"/>
  <ellipse cx="47" cy="41" rx="5.5" ry="3" fill="#00ffcc" opacity="0.95"/>
  <ellipse cx="33" cy="41" rx="2.8" ry="1.5" fill="#bbffee"/>
  <ellipse cx="47" cy="41" rx="2.8" ry="1.5" fill="#bbffee"/>
  <path d="M20,32 L15,21 L22,28Z" fill="#1230bb"/>
  <path d="M60,32 L65,21 L58,28Z" fill="#1230bb"/>
  <rect x="55" y="56" width="14" height="22" rx="6.5" fill="#1a3acc"/>
  <ellipse cx="62" cy="78" rx="7" ry="5.5" fill="#2a4aee"/>
  <rect x="27" y="87" width="12" height="21" rx="5" fill="#0f1d8c"/>
  <rect x="41" y="87" width="12" height="21" rx="5" fill="#0f1d8c"/>
  <rect x="27" y="87" width="6" height="8" rx="3" fill="#1a2daa" opacity="0.6"/>
  <rect x="42" y="87" width="6" height="8" rx="3" fill="#1a2daa" opacity="0.6"/>
  <ellipse cx="33" cy="108" rx="9" ry="5" fill="#070d3a"/>
  <ellipse cx="47" cy="108" rx="9" ry="5" fill="#070d3a"/>
</svg>`;

export const MONSTERS = [
  {
    name: '史萊姆',
    svg: `<svg viewBox="0 0 100 100" width="105" height="105" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="92" rx="34" ry="9" fill="#006644" opacity="0.2"/>
  <path d="M16,60 C10,40 20,12 50,10 C80,12 90,40 84,60 C78,78 66,93 50,93 C34,93 22,78 16,60Z" fill="#22ccaa" stroke="#118877" stroke-width="2.5"/>
  <ellipse cx="36" cy="30" rx="15" ry="11" fill="#55eecc" opacity="0.45"/>
  <ellipse cx="58" cy="20" rx="8" ry="6" fill="#88fff0" opacity="0.3"/>
  <path d="M50,10 C51,5 53,3 55,1" stroke="#118877" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="55" cy="1" r="5" fill="#ffdd00"/>
  <circle cx="55" cy="1" r="3" fill="#ffff88"/>
  <ellipse cx="36" cy="52" rx="12" ry="13" fill="white" stroke="#aae8dd" stroke-width="1"/>
  <ellipse cx="36" cy="52" rx="8" ry="9" fill="#1188cc"/>
  <ellipse cx="36" cy="52" rx="5" ry="6.5" fill="#0a0a22"/>
  <circle cx="33" cy="47" r="2.5" fill="white" opacity="0.9"/>
  <circle cx="39" cy="56" r="1.2" fill="white" opacity="0.5"/>
  <ellipse cx="64" cy="52" rx="12" ry="13" fill="white" stroke="#aae8dd" stroke-width="1"/>
  <ellipse cx="64" cy="52" rx="8" ry="9" fill="#1188cc"/>
  <ellipse cx="64" cy="52" rx="5" ry="6.5" fill="#0a0a22"/>
  <circle cx="61" cy="47" r="2.5" fill="white" opacity="0.9"/>
  <circle cx="67" cy="56" r="1.2" fill="white" opacity="0.5"/>
  <path d="M36,70 Q50,80 64,70" stroke="#118877" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="72" cy="36" r="2" fill="#88ffee" opacity="0.6"/>
  <circle cx="22" cy="55" r="1.5" fill="#88ffee" opacity="0.4"/>
  <circle cx="68" cy="63" r="1.5" fill="#88ffee" opacity="0.5"/>
</svg>`,
  },
  {
    name: '闇蝙蝠',
    svg: `<svg viewBox="0 0 134 96" width="134" height="96" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="67" cy="90" rx="44" ry="9" fill="#220033" opacity="0.25"/>
  <path d="M44,50 C32,36 12,22 4,30 C0,42 12,60 28,62 C36,64 42,58 44,52Z" fill="#4422aa" stroke="#2a0a77" stroke-width="2"/>
  <path d="M44,50 C36,42 24,34 16,40" stroke="#5533cc" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M42,54 C35,50 26,46 20,52" stroke="#5533cc" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M90,50 C102,36 122,22 130,30 C134,42 122,60 106,62 C98,64 92,58 90,52Z" fill="#4422aa" stroke="#2a0a77" stroke-width="2"/>
  <path d="M90,50 C98,42 110,34 118,40" stroke="#5533cc" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M92,54 C99,50 108,46 114,52" stroke="#5533cc" stroke-width="1.5" fill="none" opacity="0.5"/>
  <ellipse cx="67" cy="56" rx="30" ry="34" fill="#5522bb" stroke="#2a0a77" stroke-width="2.5"/>
  <ellipse cx="57" cy="42" rx="15" ry="11" fill="#7744cc" opacity="0.5"/>
  <polygon points="52,28 46,5 60,24" fill="#5522bb" stroke="#2a0a77" stroke-width="2"/>
  <polygon points="82,28 88,5 74,24" fill="#5522bb" stroke="#2a0a77" stroke-width="2"/>
  <polygon points="54,27 49,12 60,24" fill="#ff88bb" opacity="0.55"/>
  <polygon points="80,27 85,12 74,24" fill="#ff88bb" opacity="0.55"/>
  <ellipse cx="56" cy="50" rx="9.5" ry="11" fill="#ff4400"/>
  <ellipse cx="78" cy="50" rx="9.5" ry="11" fill="#ff4400"/>
  <ellipse cx="56" cy="50" rx="4" ry="9" fill="#220000"/>
  <ellipse cx="78" cy="50" rx="4" ry="9" fill="#220000"/>
  <circle cx="54" cy="47" r="2.5" fill="white" opacity="0.85"/>
  <circle cx="76" cy="47" r="2.5" fill="white" opacity="0.85"/>
  <polygon points="60,74 54,86 64,74" fill="white"/>
  <polygon points="74,74 68,86 78,74" fill="white"/>
  <path d="M50,64 Q57,60 64,64 Q71,60 78,64 Q71,68 64,64 Q57,68 50,64Z" fill="#6633cc" opacity="0.4"/>
</svg>`,
  },
  {
    name: '熔岩蟹',
    svg: `<svg viewBox="0 0 140 108" width="140" height="108" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="70" cy="104" rx="44" ry="8" fill="#440000" opacity="0.2"/>
  <line x1="50" y1="82" x2="34" y2="104" stroke="#bb2200" stroke-width="5" stroke-linecap="round"/>
  <line x1="44" y1="87" x2="26" y2="103" stroke="#bb2200" stroke-width="4.5" stroke-linecap="round"/>
  <line x1="90" y1="82" x2="106" y2="104" stroke="#bb2200" stroke-width="5" stroke-linecap="round"/>
  <line x1="96" y1="87" x2="114" y2="103" stroke="#bb2200" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M38,62 Q20,55 12,44" stroke="#cc3311" stroke-width="13" fill="none" stroke-linecap="round"/>
  <ellipse cx="10" cy="40" rx="17" ry="14" fill="#ee4422" stroke="#aa1100" stroke-width="2.5"/>
  <ellipse cx="5" cy="35" rx="8" ry="6" fill="#ff6644" opacity="0.5"/>
  <path d="M3,38 Q10,31 18,40" stroke="#aa1100" stroke-width="2.5" fill="none"/>
  <path d="M102,62 Q120,55 128,44" stroke="#cc3311" stroke-width="13" fill="none" stroke-linecap="round"/>
  <ellipse cx="130" cy="40" rx="17" ry="14" fill="#ee4422" stroke="#aa1100" stroke-width="2.5"/>
  <ellipse cx="135" cy="35" rx="8" ry="6" fill="#ff6644" opacity="0.5"/>
  <path d="M137,38 Q130,31 122,40" stroke="#aa1100" stroke-width="2.5" fill="none"/>
  <ellipse cx="70" cy="74" rx="38" ry="30" fill="#ee4433" stroke="#aa1100" stroke-width="2.5"/>
  <ellipse cx="58" cy="62" rx="20" ry="14" fill="#ff6655" opacity="0.4"/>
  <path d="M60,58 L52,72" stroke="#ff8800" stroke-width="2" opacity="0.7"/>
  <path d="M70,56 L66,72" stroke="#ff8800" stroke-width="2" opacity="0.7"/>
  <path d="M80,60 L86,74" stroke="#ff8800" stroke-width="2" opacity="0.7"/>
  <polygon points="70,60 76,70 70,80 64,70" fill="#ffaa00" opacity="0.35"/>
  <rect x="58" y="44" width="6" height="18" rx="3" fill="#cc2200"/>
  <rect x="76" y="44" width="6" height="18" rx="3" fill="#cc2200"/>
  <circle cx="61" cy="41" r="12" fill="white" stroke="#aa1100" stroke-width="2"/>
  <circle cx="79" cy="41" r="12" fill="white" stroke="#aa1100" stroke-width="2"/>
  <circle cx="61" cy="42" r="7.5" fill="#ff4400"/>
  <circle cx="79" cy="42" r="7.5" fill="#ff4400"/>
  <circle cx="63" cy="43" r="4.5" fill="#1a0000"/>
  <circle cx="81" cy="43" r="4.5" fill="#1a0000"/>
  <circle cx="59" cy="39" r="2.5" fill="white" opacity="0.9"/>
  <circle cx="77" cy="39" r="2.5" fill="white" opacity="0.9"/>
</svg>`,
  },
  {
    name: '星幽靈',
    svg: `<svg viewBox="0 0 100 112" width="100" height="112" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="58" rx="46" ry="50" fill="#aaccff" opacity="0.12"/>
  <path d="M12,52 C12,22 28,6 50,6 C72,6 88,22 88,52 L88,90 Q78,81 68,90 Q59,96 50,90 Q41,96 32,90 Q22,81 12,90 Z" fill="#ddeeff" stroke="#8899bb" stroke-width="2.5"/>
  <ellipse cx="37" cy="33" rx="19" ry="21" fill="#eef6ff" opacity="0.55"/>
  <ellipse cx="56" cy="72" rx="22" ry="14" fill="#99aacc" opacity="0.15"/>
  <ellipse cx="35" cy="52" rx="12" ry="13" fill="#5577aa"/>
  <ellipse cx="35" cy="52" rx="6" ry="9" fill="#0a1a2a"/>
  <circle cx="32" cy="47" r="3" fill="white" opacity="0.85"/>
  <circle cx="39" cy="57" r="1.5" fill="white" opacity="0.45"/>
  <ellipse cx="65" cy="52" rx="12" ry="13" fill="#5577aa"/>
  <ellipse cx="65" cy="52" rx="6" ry="9" fill="#0a1a2a"/>
  <circle cx="62" cy="47" r="3" fill="white" opacity="0.85"/>
  <circle cx="69" cy="57" r="1.5" fill="white" opacity="0.45"/>
  <path d="M37,70 Q44,77 50,71 Q56,77 63,70" stroke="#6688aa" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="22" cy="63" rx="9" ry="5" fill="#ffaabb" opacity="0.3"/>
  <ellipse cx="78" cy="63" rx="9" ry="5" fill="#ffaabb" opacity="0.3"/>
  <circle cx="18" cy="38" r="2.5" fill="#aaddff" opacity="0.6"/>
  <circle cx="82" cy="42" r="2" fill="#aaddff" opacity="0.5"/>
  <circle cx="24" cy="70" r="1.5" fill="#aaddff" opacity="0.4"/>
  <circle cx="76" cy="35" r="2" fill="#aaddff" opacity="0.5"/>
  <path d="M30,92 Q26,102 31,108" stroke="#8899bb" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.5"/>
  <path d="M46,93 Q44,103 48,108" stroke="#8899bb" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.5"/>
  <path d="M61,93 Q63,103 59,108" stroke="#8899bb" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.5"/>
  <path d="M72,92 Q76,102 73,108" stroke="#8899bb" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.5"/>
</svg>`,
  },
  {
    name: '翡翠龍',
    svg: `<svg viewBox="0 0 120 112" width="120" height="112" overflow="visible" xmlns="http://www.w3.org/2000/svg">
  <circle cx="6" cy="52" r="10" fill="#ff6600" opacity="0.55"/>
  <circle cx="3" cy="45" r="7" fill="#ffaa00" opacity="0.5"/>
  <circle cx="4" cy="58" r="5" fill="#ff4400" opacity="0.5"/>
  <circle cx="2" cy="51" r="3.5" fill="#ffff44" opacity="0.65"/>
  <path d="M82,84 C96,90 108,82 114,70" stroke="#1d8833" stroke-width="11" fill="none" stroke-linecap="round"/>
  <polygon points="110,66 118,63 112,74" fill="#1d8833"/>
  <path d="M36,42 C24,22 10,14 4,24 C0,36 14,54 30,56 C34,57 38,50 36,44Z" fill="#1a6622" stroke="#0d4415" stroke-width="1.5"/>
  <path d="M36,42 C28,34 18,28 12,32" stroke="#2a7730" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M86,36 C98,18 110,12 116,20 C120,30 108,50 92,52 C88,53 84,46 84,40Z" fill="#1a6622" stroke="#0d4415" stroke-width="1.5"/>
  <path d="M86,36 C94,28 104,22 110,26" stroke="#2a7730" stroke-width="1.5" fill="none" opacity="0.5"/>
  <ellipse cx="66" cy="68" rx="42" ry="36" fill="#2d9933" stroke="#1a7722" stroke-width="2.5"/>
  <ellipse cx="52" cy="55" rx="22" ry="16" fill="#44bb44" opacity="0.4"/>
  <ellipse cx="66" cy="78" rx="26" ry="22" fill="#66cc44" stroke="#44aa22" stroke-width="1.5"/>
  <path d="M50,70 Q66,66 82,70 Q66,74 50,70Z" fill="#55bb33" opacity="0.5"/>
  <path d="M46,80 Q66,76 86,80 Q66,84 46,80Z" fill="#55bb33" opacity="0.5"/>
  <circle cx="48" cy="60" r="2" fill="#1d7722" opacity="0.5"/>
  <circle cx="58" cy="55" r="2" fill="#1d7722" opacity="0.5"/>
  <circle cx="70" cy="58" r="2" fill="#1d7722" opacity="0.5"/>
  <circle cx="80" cy="62" r="2" fill="#1d7722" opacity="0.5"/>
  <ellipse cx="40" cy="58" rx="20" ry="15" fill="#2d9933" stroke="#1a7722" stroke-width="1.5"/>
  <ellipse cx="26" cy="44" rx="24" ry="22" fill="#2d9933" stroke="#1a7722" stroke-width="2.5"/>
  <ellipse cx="18" cy="35" rx="13" ry="10" fill="#44bb44" opacity="0.4"/>
  <path d="M16,24 L10,6 L20,22Z" fill="#1a5522" stroke="#0d3311" stroke-width="1.5"/>
  <path d="M28,22 L28,4 L34,20Z" fill="#1a5522" stroke="#0d3311" stroke-width="1.5"/>
  <ellipse cx="10" cy="50" rx="10" ry="9" fill="#2d9933" stroke="#1a7722" stroke-width="2"/>
  <circle cx="8" cy="47" r="2.5" fill="#0d4415"/>
  <rect x="4" y="52" width="14" height="5" rx="2" fill="#33aa33"/>
  <rect x="6" y="56" width="12" height="5" rx="2" fill="#2d9933"/>
  <polygon points="8,56 6,64 10,56" fill="white"/>
  <polygon points="13,56 11,64 15,56" fill="white"/>
  <polygon points="18,56 16,64 20,56" fill="white"/>
  <ellipse cx="26" cy="36" rx="11" ry="10" fill="#ffcc00" stroke="#1a7722" stroke-width="2"/>
  <ellipse cx="26" cy="36" rx="4.5" ry="9" fill="#110000"/>
  <circle cx="23" cy="33" r="3" fill="white" opacity="0.8"/>
  <polygon points="56,34 52,22 60,34" fill="#1a5522" stroke="#0d3311" stroke-width="1.5"/>
  <polygon points="68,32 66,20 72,32" fill="#1a5522" stroke="#0d3311" stroke-width="1.5"/>
  <polygon points="78,34 78,22 84,34" fill="#1a5522" stroke="#0d3311" stroke-width="1.5"/>
</svg>`,
  },
];
