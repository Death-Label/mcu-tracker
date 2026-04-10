import { useState, useEffect, useMemo } from "react";

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080810; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0d0d1a; }
  ::-webkit-scrollbar-thumb { background: #C0392B; border-radius: 3px; }
  .entry-row:hover { background: rgba(192,57,43,0.08) !important; }
  .phase-block { break-inside: avoid; }
  .star-btn { background: none; border: none; cursor: pointer; padding: 0; line-height: 1; transition: transform 0.1s; }
  .star-btn:hover { transform: scale(1.2); }
  .note-expand { background: none; border: none; cursor: pointer; padding: 2px 4px; border-radius: 4px; transition: background 0.15s; }
  .note-expand:hover { background: rgba(255,255,255,0.08); }

  @keyframes arcPulse {
    0%, 100% { opacity: 0.042; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
    50%       { opacity: 0.075; transform: translate(-50%, -50%) scale(1.04) rotate(3deg); }
  }
  @keyframes arcCorePulse {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1; }
  }
  @keyframes arcRingRotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes arcRingRotateRev {
    from { transform: rotate(0deg); }
    to   { transform: rotate(-360deg); }
  }
  .arc-bg {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 680px;
    height: 680px;
    pointer-events: none;
    z-index: 0;
    animation: arcPulse 4s ease-in-out infinite;
  }
  .arc-ring-cw  { transform-origin: 50% 50%; animation: arcRingRotate    22s linear infinite; }
  .arc-ring-ccw { transform-origin: 50% 50%; animation: arcRingRotateRev 18s linear infinite; }
  .arc-core     { animation: arcCorePulse 2s ease-in-out infinite; }
  .tracker-wrap { position: relative; z-index: 1; }

  @media print {
    body { background: white !important; color: black !important; }
    .no-print { display: none !important; }
    .print-section { display: block !important; }
    .tracker-wrap { padding: 0 !important; }
    .phase-header { background: #c0392b !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .entry-row { border-bottom: 1px solid #ddd !important; color: black !important; background: white !important; }
    .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .stats-bar { display: none !important; }
    .print-title { display: block !important; text-align: center; font-family: 'Bebas Neue', sans-serif; font-size: 28px; margin-bottom: 16px; color: #c0392b; }
    .entry-row { page-break-inside: avoid; }
    .phase-block { page-break-inside: avoid; margin-bottom: 24px; }
    .check-cell { color: black !important; }
  }
`;


// ---- Arc Reactor background component ----
function ArcReactor() {
  return (
    <svg className="arc-bg no-print" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Outermost ring */}
      <circle cx="100" cy="100" r="96" fill="none" stroke="#4fc3f7" strokeWidth="0.8" opacity="0.9"/>

      {/* Outer dashed rotating ring */}
      <g className="arc-ring-cw">
        <circle cx="100" cy="100" r="88" fill="none" stroke="#4fc3f7" strokeWidth="0.8"
          strokeDasharray="6 5" opacity="0.7"/>
      </g>

      {/* 8 outer tick marks */}
      {[0,45,90,135,180,225,270,315].map(a => {
        const r1=93, r2=97;
        const rad = a * Math.PI / 180;
        return <line key={a}
          x1={100 + r1*Math.sin(rad)} y1={100 - r1*Math.cos(rad)}
          x2={100 + r2*Math.sin(rad)} y2={100 - r2*Math.cos(rad)}
          stroke="#4fc3f7" strokeWidth="1.5" opacity="0.9"/>;
      })}

      {/* 6 main blades (trapezoids) */}
      {[0,60,120,180,240,300].map(a => (
        <g key={a} transform={`rotate(${a}, 100, 100)`}>
          <polygon points="91,52 109,52 105,28 95,28" fill="#4fc3f7" opacity="0.75"/>
          {/* Blade edge highlight */}
          <line x1="95" y1="28" x2="91" y2="52" stroke="#b3e5fc" strokeWidth="0.5" opacity="0.6"/>
          <line x1="105" y1="28" x2="109" y2="52" stroke="#b3e5fc" strokeWidth="0.5" opacity="0.6"/>
        </g>
      ))}

      {/* Counter-rotating inner dashed ring */}
      <g className="arc-ring-ccw">
        <circle cx="100" cy="100" r="74" fill="none" stroke="#4fc3f7" strokeWidth="0.8"
          strokeDasharray="4 6" opacity="0.5"/>
      </g>

      {/* Inner solid ring */}
      <circle cx="100" cy="100" r="48" fill="none" stroke="#4fc3f7" strokeWidth="1.5" opacity="0.85"/>

      {/* 6 connector nodes on inner ring */}
      {[0,60,120,180,240,300].map(a => {
        const rad = a * Math.PI / 180;
        return <circle key={a}
          cx={100 + 48*Math.sin(rad)} cy={100 - 48*Math.cos(rad)}
          r="2.5" fill="#4fc3f7" opacity="0.9"/>;
      })}

      {/* 6 radial lines from inner ring to center area */}
      {[0,60,120,180,240,300].map(a => {
        const rad = a * Math.PI / 180;
        return <line key={a}
          x1={100 + 48*Math.sin(rad)} y1={100 - 48*Math.cos(rad)}
          x2={100 + 28*Math.sin(rad)} y2={100 - 28*Math.cos(rad)}
          stroke="#4fc3f7" strokeWidth="0.8" opacity="0.5"/>;
      })}

      {/* Inner glow fill */}
      <circle cx="100" cy="100" r="30" fill="#4fc3f7" opacity="0.08"/>

      {/* Inner ring */}
      <circle cx="100" cy="100" r="30" fill="none" stroke="#4fc3f7" strokeWidth="2" opacity="0.8"/>

      {/* Core glow layers */}
      <circle className="arc-core" cx="100" cy="100" r="20" fill="#4fc3f7" opacity="0.18"/>
      <circle className="arc-core" cx="100" cy="100" r="13" fill="#7de8ff" opacity="0.4"/>
      <circle cx="100" cy="100" r="7"  fill="#b3e5fc" opacity="0.9"/>
      <circle cx="100" cy="100" r="3"  fill="white"   opacity="1"/>
    </svg>
  );
}

// ============================================================
// MCU DATASET — Marvel Studios + Netflix Canon
// Correções aplicadas em Abr/2026:
//   • Echo: setting 2026 → Mai/2025 (5 meses após Hawkeye)
//   • Marvel Zombies T1: eps 6 → 4 episódios
//   • Adicionado: Avengers: Secret Wars (Dez 2027)
//   • Adicionado: Daredevil: Born Again T3 (2027, renovada Set/2025)
// ============================================================
const ENTRIES = [
  // --- PHASE 1 ---
  { id:1,  title:"Homem de Ferro",                               en:"Iron Man",                                     year:2008, phase:1, type:"Filme",    rOrder:1,   cOrder:4,   setting:"2010",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:2,  title:"O Incrível Hulk",                              en:"The Incredible Hulk",                          year:2008, phase:1, type:"Filme",    rOrder:2,   cOrder:6,   setting:"2011",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:3,  title:"Homem de Ferro 2",                             en:"Iron Man 2",                                   year:2010, phase:1, type:"Filme",    rOrder:3,   cOrder:5,   setting:"2011",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:4,  title:"Thor",                                         en:"Thor",                                         year:2011, phase:1, type:"Filme",    rOrder:4,   cOrder:7,   setting:"2011",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:5,  title:"Capitão América: O Primeiro Vingador",         en:"Captain America: The First Avenger",           year:2011, phase:1, type:"Filme",    rOrder:5,   cOrder:1,   setting:"1942–1945",              platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:6,  title:"One-Shot: O Consultor",                        en:"One-Shot: The Consultant",                     year:2011, phase:1, type:"Curta",    rOrder:6,   cOrder:8,   setting:"2011",                   platform:"Blu-ray",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:7,  title:"One-Shot: Uma Coisa Engraçada...",             en:"One-Shot: A Funny Thing Happened...",          year:2011, phase:1, type:"Curta",    rOrder:7,   cOrder:9,   setting:"2011",                   platform:"Blu-ray",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:8,  title:"Os Vingadores",                                en:"The Avengers",                                 year:2012, phase:1, type:"Filme",    rOrder:8,   cOrder:10,  setting:"2012",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:9,  title:"One-Shot: Item 47",                            en:"One-Shot: Item 47",                            year:2012, phase:1, type:"Curta",    rOrder:9,   cOrder:11,  setting:"2012",                   platform:"Blu-ray",          saga:"Infinity Saga",    src:"Marvel Studios" },

  // --- PHASE 2 ---
  { id:10, title:"Homem de Ferro 3",                             en:"Iron Man 3",                                   year:2013, phase:2, type:"Filme",    rOrder:10,  cOrder:12,  setting:"2013",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:11, title:"One-Shot: Agente Carter",                      en:"One-Shot: Agent Carter",                       year:2013, phase:2, type:"Curta",    rOrder:11,  cOrder:2,   setting:"1946",                   platform:"Blu-ray",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:12, title:"Thor: O Mundo Sombrio",                        en:"Thor: The Dark World",                         year:2013, phase:2, type:"Filme",    rOrder:12,  cOrder:13,  setting:"2013",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:13, title:"One-Shot: Salve o Rei",                        en:"One-Shot: All Hail the King",                  year:2014, phase:2, type:"Curta",    rOrder:13,  cOrder:14,  setting:"2014",                   platform:"Blu-ray",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:14, title:"Capitão América: O Soldado Invernal",          en:"Captain America: The Winter Soldier",          year:2014, phase:2, type:"Filme",    rOrder:14,  cOrder:15,  setting:"2014",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:15, title:"Guardiões da Galáxia",                         en:"Guardians of the Galaxy",                      year:2014, phase:2, type:"Filme",    rOrder:15,  cOrder:16,  setting:"2014",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:16, title:"Vingadores: Era de Ultron",                    en:"Avengers: Age of Ultron",                      year:2015, phase:2, type:"Filme",    rOrder:16,  cOrder:19,  setting:"2015",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:17, title:"Homem-Formiga",                                en:"Ant-Man",                                      year:2015, phase:2, type:"Filme",    rOrder:17,  cOrder:20,  setting:"2015",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },

  // --- NETFLIX CANON ---
  { id:200, title:"Demolidor (Netflix) — T1",                    en:"Daredevil S1 (Netflix)",                       year:2015, phase:2, type:"Série",    rOrder:200, cOrder:200, setting:"2015",                   platform:"Netflix / Disney+",saga:"Infinity Saga",    src:"Netflix (Cânon)", eps:13 },
  { id:201, title:"Jessica Jones (Netflix) — T1",                en:"Jessica Jones S1 (Netflix)",                   year:2015, phase:2, type:"Série",    rOrder:201, cOrder:201, setting:"2015",                   platform:"Netflix / Disney+",saga:"Infinity Saga",    src:"Netflix (Cânon)", eps:13 },
  { id:202, title:"Demolidor (Netflix) — T2",                    en:"Daredevil S2 (Netflix)",                       year:2016, phase:3, type:"Série",    rOrder:202, cOrder:202, setting:"2016",                   platform:"Netflix / Disney+",saga:"Infinity Saga",    src:"Netflix (Cânon)", eps:13 },
  { id:203, title:"Luke Cage (Netflix) — T1",                    en:"Luke Cage S1 (Netflix)",                       year:2016, phase:3, type:"Série",    rOrder:203, cOrder:203, setting:"2016",                   platform:"Netflix / Disney+",saga:"Infinity Saga",    src:"Netflix (Cânon)", eps:13 },
  { id:204, title:"Punho de Ferro (Netflix) — T1",               en:"Iron Fist S1 (Netflix)",                       year:2017, phase:3, type:"Série",    rOrder:204, cOrder:204, setting:"2017",                   platform:"Netflix / Disney+",saga:"Infinity Saga",    src:"Netflix (Cânon)", eps:13 },
  { id:205, title:"Os Defensores (Netflix)",                     en:"The Defenders (Netflix)",                      year:2017, phase:3, type:"Série",    rOrder:205, cOrder:205, setting:"2017",                   platform:"Netflix / Disney+",saga:"Infinity Saga",    src:"Netflix (Cânon)", eps:8  },
  { id:206, title:"O Justiceiro (Netflix) — T1",                 en:"The Punisher S1 (Netflix)",                    year:2017, phase:3, type:"Série",    rOrder:206, cOrder:206, setting:"2017",                   platform:"Netflix / Disney+",saga:"Infinity Saga",    src:"Netflix (Cânon)", eps:13 },
  { id:207, title:"Jessica Jones (Netflix) — T2",                en:"Jessica Jones S2 (Netflix)",                   year:2018, phase:3, type:"Série",    rOrder:207, cOrder:207, setting:"2018",                   platform:"Netflix / Disney+",saga:"Infinity Saga",    src:"Netflix (Cânon)", eps:13 },
  { id:208, title:"Luke Cage (Netflix) — T2",                    en:"Luke Cage S2 (Netflix)",                       year:2018, phase:3, type:"Série",    rOrder:208, cOrder:208, setting:"2018",                   platform:"Netflix / Disney+",saga:"Infinity Saga",    src:"Netflix (Cânon)", eps:13 },
  { id:209, title:"Punho de Ferro (Netflix) — T2",               en:"Iron Fist S2 (Netflix)",                       year:2018, phase:3, type:"Série",    rOrder:209, cOrder:209, setting:"2018",                   platform:"Netflix / Disney+",saga:"Infinity Saga",    src:"Netflix (Cânon)", eps:10 },
  { id:210, title:"Demolidor (Netflix) — T3",                    en:"Daredevil S3 (Netflix)",                       year:2018, phase:3, type:"Série",    rOrder:210, cOrder:210, setting:"2018",                   platform:"Netflix / Disney+",saga:"Infinity Saga",    src:"Netflix (Cânon)", eps:13 },
  { id:211, title:"O Justiceiro (Netflix) — T2",                 en:"The Punisher S2 (Netflix)",                    year:2019, phase:3, type:"Série",    rOrder:211, cOrder:211, setting:"2019",                   platform:"Netflix / Disney+",saga:"Infinity Saga",    src:"Netflix (Cânon)", eps:13 },
  { id:212, title:"Jessica Jones (Netflix) — T3",                en:"Jessica Jones S3 (Netflix)",                   year:2019, phase:3, type:"Série",    rOrder:212, cOrder:212, setting:"2019",                   platform:"Netflix / Disney+",saga:"Infinity Saga",    src:"Netflix (Cânon)", eps:13 },

  // --- PHASE 3 ---
  { id:18, title:"Capitão América: Guerra Civil",                en:"Captain America: Civil War",                   year:2016, phase:3, type:"Filme",    rOrder:18,  cOrder:21,  setting:"2016",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:19, title:"Doutor Estranho",                              en:"Doctor Strange",                               year:2016, phase:3, type:"Filme",    rOrder:19,  cOrder:25,  setting:"2017",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:20, title:"Guardiões da Galáxia Vol. 2",                  en:"Guardians of the Galaxy Vol. 2",               year:2017, phase:3, type:"Filme",    rOrder:20,  cOrder:17,  setting:"2014",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:21, title:"Homem-Aranha: De Volta ao Lar",               en:"Spider-Man: Homecoming",                       year:2017, phase:3, type:"Filme",    rOrder:21,  cOrder:24,  setting:"2017",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:22, title:"Thor: Ragnarok",                               en:"Thor: Ragnarok",                               year:2017, phase:3, type:"Filme",    rOrder:22,  cOrder:26,  setting:"2017",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:23, title:"Pantera Negra",                                en:"Black Panther",                                year:2018, phase:3, type:"Filme",    rOrder:23,  cOrder:23,  setting:"2017",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:24, title:"Vingadores: Guerra Infinita",                  en:"Avengers: Infinity War",                       year:2018, phase:3, type:"Filme",    rOrder:24,  cOrder:27,  setting:"2018",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:25, title:"Homem-Formiga e a Vespa",                      en:"Ant-Man and the Wasp",                         year:2018, phase:3, type:"Filme",    rOrder:25,  cOrder:28,  setting:"2018",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:26, title:"Capitã Marvel",                                en:"Captain Marvel",                               year:2019, phase:3, type:"Filme",    rOrder:26,  cOrder:3,   setting:"1995",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:27, title:"Vingadores: Ultimato",                         en:"Avengers: Endgame",                            year:2019, phase:3, type:"Filme",    rOrder:27,  cOrder:29,  setting:"2018→2023",              platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },
  { id:28, title:"Homem-Aranha: Longe de Casa",                 en:"Spider-Man: Far From Home",                    year:2019, phase:3, type:"Filme",    rOrder:28,  cOrder:36,  setting:"2024",                   platform:"Disney+",          saga:"Infinity Saga",    src:"Marvel Studios" },

  // --- PHASE 4 ---
  { id:29, title:"WandaVision",                                  en:"WandaVision",                                  year:2021, phase:4, type:"Série",    rOrder:29,  cOrder:30,  setting:"2023",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:9  },
  { id:30, title:"Falcão e o Soldado Invernal",                  en:"The Falcon and the Winter Soldier",            year:2021, phase:4, type:"Série",    rOrder:30,  cOrder:31,  setting:"2023",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:6  },
  { id:31, title:"Loki — T1",                                    en:"Loki Season 1",                                year:2021, phase:4, type:"Série",    rOrder:31,  cOrder:32,  setting:"Fora do tempo",          platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:6  },
  { id:32, title:"Viúva Negra",                                  en:"Black Widow",                                  year:2021, phase:4, type:"Filme",    rOrder:32,  cOrder:22,  setting:"2016",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios" },
  { id:33, title:"What If...? — T1",                             en:"What If...? Season 1",                         year:2021, phase:4, type:"Animação",  rOrder:33,  cOrder:33,  setting:"Multiverso",             platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:9  },
  { id:34, title:"Shang-Chi e a Lenda dos Dez Anéis",           en:"Shang-Chi and the Legend of the Ten Rings",    year:2021, phase:4, type:"Filme",    rOrder:34,  cOrder:34,  setting:"2023/2024",              platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios" },
  { id:35, title:"Eternos",                                      en:"Eternals",                                     year:2021, phase:4, type:"Filme",    rOrder:35,  cOrder:35,  setting:"Vários / 2024",          platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios" },
  { id:36, title:"Gavião Arqueiro",                              en:"Hawkeye",                                      year:2021, phase:4, type:"Série",    rOrder:36,  cOrder:37,  setting:"Dez/2024",               platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:6  },
  { id:37, title:"Homem-Aranha: Sem Volta para Casa",           en:"Spider-Man: No Way Home",                      year:2021, phase:4, type:"Filme",    rOrder:37,  cOrder:38,  setting:"2024",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios" },
  { id:38, title:"Cavaleiro da Lua",                             en:"Moon Knight",                                  year:2022, phase:4, type:"Série",    rOrder:38,  cOrder:39,  setting:"2025",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:6  },
  { id:39, title:"Doutor Estranho no Multiverso da Loucura",    en:"Doctor Strange in the Multiverse of Madness",  year:2022, phase:4, type:"Filme",    rOrder:39,  cOrder:40,  setting:"2025",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios" },
  { id:40, title:"Ms. Marvel",                                   en:"Ms. Marvel",                                   year:2022, phase:4, type:"Série",    rOrder:40,  cOrder:41,  setting:"2025",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:6  },
  { id:41, title:"Thor: Amor e Trovão",                          en:"Thor: Love and Thunder",                       year:2022, phase:4, type:"Filme",    rOrder:41,  cOrder:42,  setting:"2025",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios" },
  { id:42, title:"I Am Groot — T1",                              en:"I Am Groot Season 1",                          year:2022, phase:4, type:"Animação",  rOrder:42,  cOrder:18,  setting:"2014",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:5  },
  { id:43, title:"She-Hulk: Defensora de Heróis",               en:"She-Hulk: Attorney at Law",                    year:2022, phase:4, type:"Série",    rOrder:43,  cOrder:43,  setting:"2025",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:9  },
  { id:44, title:"Lobisomem à Noite",                            en:"Werewolf by Night",                            year:2022, phase:4, type:"Especial", rOrder:44,  cOrder:45,  setting:"2025?",                  platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios" },
  { id:45, title:"Pantera Negra: Wakanda Para Sempre",           en:"Black Panther: Wakanda Forever",               year:2022, phase:4, type:"Filme",    rOrder:45,  cOrder:44,  setting:"2025",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios" },
  { id:46, title:"Guardiões da Galáxia: Especial de Natal",     en:"The Guardians of the Galaxy Holiday Special",  year:2022, phase:4, type:"Especial", rOrder:46,  cOrder:46,  setting:"Dez/2025",               platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios" },

  // --- PHASE 5 ---
  { id:47, title:"Homem-Formiga e a Vespa: Quantumania",        en:"Ant-Man and the Wasp: Quantumania",            year:2023, phase:5, type:"Filme",    rOrder:47,  cOrder:51,  setting:"2026",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios" },
  { id:48, title:"Guardiões da Galáxia Vol. 3",                  en:"Guardians of the Galaxy Vol. 3",               year:2023, phase:5, type:"Filme",    rOrder:48,  cOrder:52,  setting:"2026",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios" },
  { id:49, title:"I Am Groot — T2",                              en:"I Am Groot Season 2",                          year:2023, phase:5, type:"Animação",  rOrder:49,  cOrder:48,  setting:"Pós Vol. 2",             platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:5  },
  { id:50, title:"Invasão Secreta",                              en:"Secret Invasion",                              year:2023, phase:5, type:"Série",    rOrder:50,  cOrder:53,  setting:"2026",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:6  },
  { id:51, title:"Loki — T2",                                    en:"Loki Season 2",                                year:2023, phase:5, type:"Série",    rOrder:51,  cOrder:50,  setting:"Fora do tempo",          platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:6  },
  { id:52, title:"What If...? — T2",                             en:"What If...? Season 2",                         year:2023, phase:5, type:"Animação",  rOrder:52,  cOrder:49,  setting:"Multiverso",             platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:9  },
  { id:53, title:"As Marvels",                                   en:"The Marvels",                                  year:2023, phase:5, type:"Filme",    rOrder:53,  cOrder:55,  setting:"2026",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios" },
  { id:54, title:"Echo",                                         en:"Echo",                                         year:2024, phase:5, type:"Série",    rOrder:54,  cOrder:54,  setting:"Mai/2025",               platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:5  },
  { id:55, title:"What If...? — T3",                             en:"What If...? Season 3",                         year:2024, phase:5, type:"Animação",  rOrder:55,  cOrder:56,  setting:"Multiverso",             platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:8  },
  { id:56, title:"Deadpool & Wolverine",                         en:"Deadpool & Wolverine",                         year:2024, phase:5, type:"Filme",    rOrder:56,  cOrder:57,  setting:"2026 / Void",            platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios" },
  { id:57, title:"Agatha para Sempre",                           en:"Agatha All Along",                             year:2024, phase:5, type:"Série",    rOrder:57,  cOrder:58,  setting:"2026",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:9  },
  { id:58, title:"Capitão América: Admirável Mundo Novo",        en:"Captain America: Brave New World",             year:2025, phase:5, type:"Filme",    rOrder:58,  cOrder:59,  setting:"2026/2027",              platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios" },
  { id:59, title:"Thunderbolts*",                                en:"Thunderbolts*",                                year:2025, phase:5, type:"Filme",    rOrder:59,  cOrder:61,  setting:"2027",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios" },
  { id:60, title:"Seu Amigão Homem-Aranha — T1",                en:"Your Friendly Neighborhood Spider-Man S1",     year:2025, phase:5, type:"Animação",  rOrder:60,  cOrder:64,  setting:"Universo alternativo",   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:10 },
  { id:61, title:"Demolidor: Sem Medo — T1",                    en:"Daredevil: Born Again Season 1",               year:2025, phase:5, type:"Série",    rOrder:61,  cOrder:60,  setting:"2026/2027",              platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:9  },
  { id:62, title:"Coração de Ferro",                             en:"Ironheart",                                    year:2025, phase:5, type:"Série",    rOrder:62,  cOrder:47,  setting:"Out/2025",               platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:6  },

  // --- PHASE 6 ---
  { id:63, title:"Eyes of Wakanda",                              en:"Eyes of Wakanda",                              year:2025, phase:6, type:"Animação",  rOrder:63,  cOrder:62,  setting:"Vários / histórico",     platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:4  },
  { id:64, title:"Marvel Zumbis — T1",                           en:"Marvel Zombies Season 1",                      year:2025, phase:6, type:"Animação",  rOrder:64,  cOrder:63,  setting:"Multiverso alternativo", platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:4  },
  { id:65, title:"Quarteto Fantástico: Primeiros Passos",        en:"The Fantastic Four: First Steps",              year:2025, phase:6, type:"Filme",    rOrder:65,  cOrder:65,  setting:"Anos 60 alternativo",    platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios" },
  { id:66, title:"Wonder Man — T1",                              en:"Wonder Man Season 1",                          year:2026, phase:6, type:"Série",    rOrder:66,  cOrder:66,  setting:"2026",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:6,  releaseInfo:"Jan 27, 2026 — Disponível" },
  { id:67, title:"Demolidor: Sem Medo — T2",                    en:"Daredevil: Born Again Season 2",               year:2026, phase:6, type:"Série",    rOrder:67,  cOrder:67,  setting:"2027",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:8,  releaseInfo:"Mar 24, 2026 — Disponível" },
  { id:68, title:"VisionQuest",                                  en:"VisionQuest",                                  year:2026, phase:6, type:"Série",    rOrder:68,  cOrder:68,  setting:"2026",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios", eps:6,  releaseInfo:"2026 — Data a confirmar" },
  { id:69, title:"O Justiceiro: Uma Última Morte",               en:"The Punisher: One Last Kill",                  year:2026, phase:6, type:"Especial", rOrder:69,  cOrder:70,  setting:"2027",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios",         releaseInfo:"Mai/Jun 2026" },
  { id:70, title:"Seu Amigão Homem-Aranha — T2",                en:"Your Friendly Neighborhood Spider-Man S2",     year:2026, phase:6, type:"Animação",  rOrder:70,  cOrder:69,  setting:"Universo alternativo",   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios",         releaseInfo:"Outono 2026" },
  { id:71, title:"Homem-Aranha: Novo Dia",                       en:"Spider-Man: Brand New Day",                    year:2026, phase:6, type:"Filme",    rOrder:71,  cOrder:71,  setting:"2028",                   platform:"Cinema (Sony/Marvel)", saga:"Multiverse Saga", src:"Marvel Studios",        releaseInfo:"31 Jul 2026" },
  { id:72, title:"Vingadores: Juízo Final",                      en:"Avengers: Doomsday",                           year:2026, phase:6, type:"Filme",    rOrder:72,  cOrder:72,  setting:"2027+",                  platform:"Cinema",           saga:"Multiverse Saga",  src:"Marvel Studios",         releaseInfo:"18 Dez 2026" },
  { id:73, title:"Demolidor: Sem Medo — T3",                    en:"Daredevil: Born Again Season 3",               year:2027, phase:6, type:"Série",    rOrder:73,  cOrder:73,  setting:"2027",                   platform:"Disney+",          saga:"Multiverse Saga",  src:"Marvel Studios",         releaseInfo:"2027 — Data a confirmar" },
  { id:74, title:"Vingadores: Guerras Secretas",                 en:"Avengers: Secret Wars",                        year:2027, phase:6, type:"Filme",    rOrder:74,  cOrder:74,  setting:"2027+",                  platform:"Cinema",           saga:"Multiverse Saga",  src:"Marvel Studios",         releaseInfo:"17 Dez 2027" },
];

const PHASE_INFO = {
  1: { label:"Fase 1", sub:"Infinity Saga", years:"2008–2012", color:"#8B0000" },
  2: { label:"Fase 2", sub:"Infinity Saga", years:"2013–2015", color:"#A83232" },
  3: { label:"Fase 3", sub:"Infinity Saga", years:"2016–2019", color:"#C0392B" },
  4: { label:"Fase 4", sub:"Multiverse Saga", years:"2021–2022", color:"#1a3a6b" },
  5: { label:"Fase 5", sub:"Multiverse Saga", years:"2023–2025", color:"#1f4c94" },
  6: { label:"Fase 6", sub:"Multiverse Saga", years:"2025–2027", color:"#7B1FA2" },
  "netflix": { label:"Marvel Television (Netflix)", sub:"Cânon — Infinity Saga", years:"2015–2019", color:"#1a1a1a" },
};

const TYPE_COLORS = {
  "Filme":    { bg:"#C0392B22", border:"#C0392B", text:"#ff6b6b" },
  "Série":    { bg:"#1565C022", border:"#1976D2", text:"#64b5f6" },
  "Animação": { bg:"#2E7D3222", border:"#388E3C", text:"#81c784" },
  "Curta":    { bg:"#F57F1722", border:"#F57F17", text:"#ffb300" },
  "Especial": { bg:"#6A1B9A22", border:"#8E24AA", text:"#ce93d8" },
};

const TYPES = ["Todos", "Filme", "Série", "Animação", "Curta", "Especial"];

// ---- Storage helpers (troca window.storage por localStorage para deploy externo) ----
const storage = {
  get: async (key) => {
    try {
      if (window.storage) return window.storage.get(key);
      const v = localStorage.getItem(key);
      return v ? { value: v } : null;
    } catch { return null; }
  },
  set: async (key, value) => {
    try {
      if (window.storage) return window.storage.set(key, value);
      localStorage.setItem(key, value);
    } catch {}
  },
};

// ---- Star Rating Component ----
function StarRating({ rating, onRate }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display:"flex", gap:1, flexShrink:0 }} onClick={e => e.stopPropagation()}>
      {[1,2,3,4,5].map(star => (
        <button
          key={star}
          className="star-btn"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={(e) => { e.stopPropagation(); onRate(star === rating ? 0 : star); }}
          title={star === rating ? "Remover avaliação" : `Avaliar ${star}/5`}
          style={{ fontSize:15, color: star <= (hovered || rating) ? "#FFD700" : "#2a2a40" }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function MCUTracker() {
  const [mode, setMode] = useState("release");
  const [filter, setFilter] = useState("Todos");
  const [showNetflix, setShowNetflix] = useState(true);
  const [watched, setWatched] = useState({});
  const [userData, setUserData] = useState({}); // { [id]: { rating: 0-5, note: "" } }
  const [expandedNote, setExpandedNote] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const r1 = await storage.get("mcu-watched-v2");
        if (r1) setWatched(JSON.parse(r1.value));
        const r2 = await storage.get("mcu-userdata-v1");
        if (r2) setUserData(JSON.parse(r2.value));
      } catch (_) {}
      setLoaded(true);
    };
    load();
  }, []);

  const saveWatched = async (nw) => { await storage.set("mcu-watched-v2", JSON.stringify(nw)); };
  const saveUserData = async (nud) => { await storage.set("mcu-userdata-v1", JSON.stringify(nud)); };

  const toggle = (id) => {
    const nw = { ...watched, [id]: !watched[id] };
    if (!nw[id]) delete nw[id];
    setWatched(nw);
    saveWatched(nw);
  };

  const setRating = (id, rating) => {
    const nud = { ...userData, [id]: { ...(userData[id] || {}), rating } };
    setUserData(nud);
    saveUserData(nud);
  };

  const setNote = (id, note) => {
    const nud = { ...userData, [id]: { ...(userData[id] || {}), note } };
    setUserData(nud);
    saveUserData(nud);
  };

  const filtered = useMemo(() => {
    let list = ENTRIES;
    if (!showNetflix) list = list.filter(e => e.src !== "Netflix (Cânon)");
    if (filter !== "Todos") list = list.filter(e => e.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e => e.title.toLowerCase().includes(q) || e.en.toLowerCase().includes(q));
    }
    return list;
  }, [filter, showNetflix, search]);

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => (mode === "release" ? a.rOrder : a.cOrder) - (mode === "release" ? b.rOrder : b.cOrder)),
  [filtered, mode]);

  const grouped = useMemo(() => {
    if (mode === "release") {
      const phases = {};
      const netflix = [];
      sorted.forEach(e => {
        if (e.src === "Netflix (Cânon)") { netflix.push(e); return; }
        if (!phases[e.phase]) phases[e.phase] = [];
        phases[e.phase].push(e);
      });
      const result = [];
      [1,2,3,4,5,6].forEach(p => { if (phases[p]?.length) result.push({ key:`phase-${p}`, phase: p, items: phases[p] }); });
      if (netflix.length) result.push({ key:"netflix", phase:"netflix", items: netflix.sort((a,b) => a.rOrder - b.rOrder) });
      return result;
    } else {
      const eras = [
        { key:"chrono-past",  label:"Passado Histórico",               sub:"1940s – 1990s",         color:"#4a3000", items:[] },
        { key:"chrono-p1",    label:"Início do MCU",                   sub:"2010 – 2012",            color:"#8B0000", items:[] },
        { key:"chrono-p2",    label:"Expansão",                        sub:"2013 – 2015",            color:"#A83232", items:[] },
        { key:"chrono-p3a",   label:"Defesas de Nova York (Netflix)",  sub:"2015 – 2019",            color:"#1a1a1a", items:[] },
        { key:"chrono-p3b",   label:"A Era dos Vingadores",            sub:"2016 – 2019",            color:"#C0392B", items:[] },
        { key:"chrono-p4",    label:"Pós-Ultimato",                    sub:"2023 – 2025",            color:"#1a3a6b", items:[] },
        { key:"chrono-p5",    label:"Crise do Multiverso",             sub:"2026 – 2027",            color:"#1f4c94", items:[] },
        { key:"chrono-alt",   label:"Universos Alternativos",          sub:"Fora do tempo e espaço", color:"#4a0080", items:[] },
        { key:"chrono-near",  label:"Futuro Próximo",                  sub:"2028+",                  color:"#7B1FA2", items:[] },
      ];
      sorted.forEach(e => {
        const s = e.setting;
        if (s.includes("1942") || s.includes("1946") || s.includes("1995") || s.includes("Anos 60")) eras[0].items.push(e);
        else if (e.src === "Netflix (Cânon)") eras[3].items.push(e);
        else if (s.includes("2010") || s.includes("2011") || s.includes("2012")) eras[1].items.push(e);
        else if (s.includes("2013") || s.includes("2014") || s.includes("2015")) eras[2].items.push(e);
        else if (s.includes("2016") || s.includes("2017") || s.includes("2018") || (s.includes("2019") && !s.includes("2019/2020"))) eras[4].items.push(e);
        else if (s.includes("2023") || s.includes("2024") || s.includes("2025")) eras[5].items.push(e);
        else if (s.includes("2026") || s.includes("2027")) eras[6].items.push(e);
        else if (s.includes("2028") || s.includes("2029")) eras[8].items.push(e);
        else eras[7].items.push(e);
      });
      return eras.filter(e => e.items.length > 0);
    }
  }, [sorted, mode]);

  const watchedCount = Object.values(watched).filter(Boolean).length;
  const ratedCount = Object.values(userData).filter(d => d?.rating > 0).length;
  const totalAll = ENTRIES.filter(e => showNetflix || e.src !== "Netflix (Cânon)").length;
  const filtTotal = filtered.length;
  const filtWatched = filtered.filter(e => watched[e.id]).length;
  const pct = totalAll > 0 ? Math.round((watchedCount / totalAll) * 100) : 0;

  const handlePrint = () => window.print();
  const markAllVisible = () => {
    const nw = { ...watched };
    filtered.forEach(e => { nw[e.id] = true; });
    setWatched(nw);
    saveWatched(nw);
  };
  const clearAll = () => { setWatched({}); saveWatched({}); };

  if (!loaded) return (
    <div style={{ background:"#080810", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:"#C0392B", fontFamily:"'Bebas Neue', sans-serif", fontSize:24, letterSpacing:4 }}>
      CARREGANDO...
    </div>
  );

  return (
    <>
      <style>{FONT_STYLE}</style>
      <div className="tracker-wrap" style={{ fontFamily:"'Barlow', sans-serif", background:"#080810", minHeight:"100vh", color:"#e0e0e0" }}>
        <ArcReactor />

        {/* HEADER */}
        <div className="no-print" style={{ background:"linear-gradient(135deg, #0d0010 0%, #140020 40%, #0a0008 100%)", borderBottom:"2px solid #C0392B" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px 20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:8 }}>
              <div style={{ width:52, height:52, background:"#C0392B", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:900, color:"white", fontFamily:"'Bebas Neue', sans-serif", letterSpacing:2 }}>M</div>
              <div>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:36, color:"#fff", letterSpacing:4, lineHeight:1 }}>MCU TRACKER</div>
                <div style={{ fontSize:12, color:"#999", letterSpacing:3, textTransform:"uppercase" }}>Universo Cinematográfico Marvel · Guia Completo 2026</div>
              </div>
              <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
                <button onClick={handlePrint} style={{ background:"#C0392B", color:"white", border:"none", borderRadius:6, padding:"10px 20px", fontFamily:"'Barlow Condensed', sans-serif", fontSize:15, fontWeight:700, letterSpacing:1, cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
                  🖨️ Imprimir / PDF
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:8, padding:"12px 16px", marginTop:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:13, color:"#aaa" }}>Progresso ({showNetflix ? "incl. Netflix" : "só Marvel Studios"})</span>
                <div style={{ display:"flex", gap:16 }}>
                  <span style={{ fontSize:13, color:"#FFD700", fontWeight:700 }}>{watchedCount} / {totalAll} assistidos ({pct}%)</span>
                  {ratedCount > 0 && <span style={{ fontSize:13, color:"#FFD700aa" }}>★ {ratedCount} avaliados</span>}
                </div>
              </div>
              <div style={{ height:6, background:"#1a1a2e", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg, #C0392B, #E74C3C)", borderRadius:3, transition:"width 0.4s ease" }} />
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="no-print" style={{ background:"#0d0d1a", borderBottom:"1px solid #1e1e30", position:"sticky", top:0, zIndex:50, boxShadow:"0 2px 20px rgba(0,0,0,0.5)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"12px 24px", display:"flex", flexWrap:"wrap", gap:12, alignItems:"center" }}>

            {/* Order toggle */}
            <div style={{ display:"flex", borderRadius:8, overflow:"hidden", border:"1px solid #2a2a40" }}>
              {[["release","🎬 Lançamento"],["chrono","⏳ Cronológico"]].map(([m, label]) => (
                <button key={m} onClick={() => setMode(m)} style={{ padding:"8px 18px", background: mode===m ? "#C0392B":"transparent", color: mode===m ? "white":"#888", border:"none", cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", fontSize:14, fontWeight:600, letterSpacing:1, transition:"all 0.2s" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Type filter */}
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              {TYPES.map(t => {
                const c = TYPE_COLORS[t] || {};
                const active = filter === t;
                return (
                  <button key={t} onClick={() => setFilter(t)} style={{ padding:"6px 14px", borderRadius:20, border: active ? `1px solid ${c.border||"#C0392B"}` : "1px solid #2a2a40", background: active ? (c.bg||"#C0392B22") : "transparent", color: active ? (c.text||"#ff6b6b") : "#666", cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", fontSize:13, fontWeight:600, letterSpacing:0.5, transition:"all 0.2s" }}>
                    {t}
                  </button>
                );
              })}
            </div>

            {/* Netflix toggle */}
            <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", marginLeft:4 }}>
              <div onClick={() => setShowNetflix(p => !p)} style={{ width:36, height:20, borderRadius:10, background: showNetflix ? "#E50914":"#333", position:"relative", cursor:"pointer", transition:"background 0.2s" }}>
                <div style={{ width:16, height:16, borderRadius:"50%", background:"white", position:"absolute", top:2, left: showNetflix ? 18:2, transition:"left 0.2s" }} />
              </div>
              <span style={{ fontSize:13, color: showNetflix?"#E50914":"#555", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:600, letterSpacing:1 }}>NETFLIX</span>
            </label>

            {/* Search */}
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={{ marginLeft:"auto", background:"#1a1a2e", border:"1px solid #2a2a40", borderRadius:6, padding:"7px 14px", color:"#ddd", fontSize:13, fontFamily:"'Barlow', sans-serif", outline:"none", width:180 }} />

            {/* Quick actions */}
            <button onClick={markAllVisible} style={{ background:"transparent", border:"1px solid #2a6b2a", color:"#4caf50", borderRadius:6, padding:"6px 12px", fontSize:12, cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:1 }}>✓ Marcar visíveis</button>
            <button onClick={clearAll} style={{ background:"transparent", border:"1px solid #4a2a2a", color:"#888", borderRadius:6, padding:"6px 12px", fontSize:12, cursor:"pointer", fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:1 }}>✕ Limpar tudo</button>
          </div>

          {/* Sub stats */}
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px 10px", fontSize:12, color:"#555" }}>
            Mostrando <span style={{ color:"#aaa" }}>{filtTotal}</span> obras · <span style={{ color:"#4caf50" }}>{filtWatched}</span> assistidas · <span style={{ color:"#ff6b6b" }}>{filtTotal - filtWatched}</span> por assistir
          </div>
        </div>

        {/* PRINT HEADER */}
        <div className="print-title" style={{ display:"none" }}>
          MCU TRACKER — {mode === "release" ? "Ordem de Lançamento" : "Ordem Cronológica"} · {new Date().toLocaleDateString("pt-BR")}
        </div>

        {/* MAIN LIST */}
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px" }}>
          {grouped.map(group => {
            const pi = group.phase === "netflix" ? PHASE_INFO["netflix"] : (PHASE_INFO[group.phase] || {});
            const groupColor = group.color || pi.color || "#333";
            const groupLabel = group.label || pi.label || `Fase ${group.phase}`;
            const groupSub = group.sub || pi.sub || "";
            const groupYears = group.years || pi.years || "";
            const totalG = group.items.length;
            const watchedG = group.items.filter(e => watched[e.id]).length;

            return (
              <div key={group.key} className="phase-block" style={{ marginBottom:32 }}>

                {/* Phase Header */}
                <div className="phase-header" style={{ background:`linear-gradient(135deg, ${groupColor}dd, ${groupColor}88)`, borderRadius:"10px 10px 0 0", padding:"14px 20px", display:"flex", alignItems:"center", gap:12, borderLeft:`4px solid ${groupColor}` }}>
                  <div>
                    <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:22, color:"white", letterSpacing:3 }}>{groupLabel}</div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", letterSpacing:2 }}>{groupSub} {groupYears && `· ${groupYears}`}</div>
                  </div>
                  <div style={{ marginLeft:"auto", textAlign:"right" }}>
                    <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:14, color:"rgba(255,255,255,0.8)", fontWeight:600 }}>{watchedG}/{totalG} assistidos</div>
                    <div style={{ height:4, width:120, background:"rgba(255,255,255,0.2)", borderRadius:2, marginTop:4 }}>
                      <div style={{ height:"100%", width:totalG ? `${(watchedG/totalG)*100}%` : "0%", background:"rgba(255,255,255,0.8)", borderRadius:2 }} />
                    </div>
                  </div>
                </div>

                {/* Entries */}
                <div style={{ border:"1px solid #1e1e30", borderTop:"none", borderRadius:"0 0 10px 10px", overflow:"hidden" }}>
                  {group.items.map((entry, idx) => {
                    const isW = !!watched[entry.id];
                    const tc = TYPE_COLORS[entry.type] || TYPE_COLORS["Filme"];
                    const is2026 = entry.year >= 2026;
                    const entryRating = userData[entry.id]?.rating || 0;
                    const entryNote = userData[entry.id]?.note || "";
                    const hasNote = entryNote.trim().length > 0;
                    const isNoteOpen = expandedNote === entry.id;

                    return (
                      <div key={entry.id}>
                        {/* Main row */}
                        <div
                          className="entry-row"
                          onClick={() => toggle(entry.id)}
                          style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background: isW ? "#0a1a0a" : (idx % 2 === 0 ? "#0d0d1a" : "#0a0a14"), borderBottom: (!isNoteOpen && idx < group.items.length-1) ? "1px solid #14142a":"none", cursor:"pointer", transition:"background 0.15s", opacity: isW ? 0.75 : 1 }}
                        >
                          {/* Order number */}
                          <div style={{ width:32, textAlign:"center", fontFamily:"'Bebas Neue', sans-serif", fontSize:17, color: isW ? "#4caf50":"#444", letterSpacing:1, flexShrink:0 }}>
                            {mode === "release" ? (entry.rOrder <= 100 ? entry.rOrder : "—") : (entry.cOrder <= 100 ? entry.cOrder : "—")}
                          </div>

                          {/* Checkbox */}
                          <div className="check-cell" style={{ width:22, height:22, borderRadius:5, border:`2px solid ${isW ? "#4caf50":"#333"}`, background: isW ? "#1b5e20":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}>
                            {isW && <span style={{ color:"#4caf50", fontSize:13 }}>✓</span>}
                          </div>

                          {/* Title + meta */}
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:15, fontWeight:700, color: isW ? "#5a8a5a" : (is2026 ? "#FFD700" : "#e0e0e0"), letterSpacing:0.5, textDecoration: isW ? "line-through":"none", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                              {entry.title}
                              {is2026 && <span style={{ fontSize:10, background:"#FFD70022", border:"1px solid #FFD700", color:"#FFD700", borderRadius:4, padding:"1px 6px", fontWeight:700, letterSpacing:2 }}>2026+</span>}
                            </div>
                            <div style={{ fontSize:11, color:"#555", marginTop:1 }}>
                              {entry.en !== entry.title && <span style={{ color:"#444" }}>{entry.en} · </span>}
                              {entry.year} · {entry.platform}
                              {entry.eps && <span style={{ color:"#666" }}> · {entry.eps} eps</span>}
                              {entry.releaseInfo && <span style={{ color:"#FFD700aa" }}> · {entry.releaseInfo}</span>}
                            </div>
                          </div>

                          {/* Star Rating */}
                          <StarRating rating={entryRating} onRate={(r) => setRating(entry.id, r)} />

                          {/* Note toggle */}
                          <button
                            className="note-expand no-print"
                            onClick={(e) => { e.stopPropagation(); setExpandedNote(isNoteOpen ? null : entry.id); }}
                            title={hasNote ? "Ver/editar anotação" : "Adicionar anotação"}
                            style={{ color: hasNote ? "#64b5f6" : "#333", fontSize:14 }}
                          >
                            {hasNote ? "💬" : "✏️"}
                          </button>

                          {/* Setting */}
                          <div style={{ fontSize:11, color:"#555", fontFamily:"'Barlow Condensed', sans-serif", flexShrink:0, minWidth:80, textAlign:"right" }}>
                            📅 {entry.setting}
                          </div>

                          {/* Type badge */}
                          <div style={{ background:tc.bg, border:`1px solid ${tc.border}`, color:tc.text, borderRadius:4, padding:"3px 9px", fontSize:11, fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, letterSpacing:1, flexShrink:0 }} className="badge">
                            {entry.type}
                          </div>
                        </div>

                        {/* Expandable Note Panel */}
                        {isNoteOpen && (
                          <div
                            onClick={e => e.stopPropagation()}
                            style={{ padding:"10px 14px 14px 78px", background:"#0b0b18", borderBottom: idx < group.items.length-1 ? "1px solid #14142a":"none" }}
                          >
                            <div style={{ fontSize:11, color:"#555", fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:1, marginBottom:6 }}>ANOTAÇÃO PESSOAL</div>
                            <textarea
                              value={entryNote}
                              onChange={e => setNote(entry.id, e.target.value)}
                              placeholder="Escreva sua opinião, lembretes ou qualquer coisa sobre esta obra..."
                              style={{ width:"100%", background:"#141428", border:"1px solid #2a2a40", borderRadius:6, color:"#ccc", padding:"8px 10px", fontSize:12, fontFamily:"'Barlow', sans-serif", resize:"vertical", minHeight:64, outline:"none", lineHeight:1.5 }}
                            />
                            {entryRating > 0 && (
                              <div style={{ marginTop:6, fontSize:11, color:"#FFD700aa" }}>
                                {"★".repeat(entryRating)}{"☆".repeat(5 - entryRating)} — sua nota: {entryRating}/5
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div className="no-print" style={{ textAlign:"center", padding:"32px 0", color:"#333", fontSize:12, fontFamily:"'Barlow Condensed', sans-serif", letterSpacing:2 }}>
            MCU TRACKER · {ENTRIES.length} obras · Dados verificados Abr/2026
            <br/><span style={{ color:"#1e1e30" }}>Netflix confirmados como cânon pela Marvel Studios em 2024 · Próximo grande evento: Avengers: Doomsday — Dez 2026</span>
          </div>
        </div>
      </div>
    </>
  );
}
