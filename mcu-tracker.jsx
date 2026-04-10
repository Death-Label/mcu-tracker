import { useState, useEffect, useMemo, useRef } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#080810;}
  ::-webkit-scrollbar{width:6px;}
  ::-webkit-scrollbar-track{background:#0d0d1a;}
  ::-webkit-scrollbar-thumb{background:#C0392B;border-radius:3px;}
  .erow:hover{background:rgba(192,57,43,0.09)!important;}
  .new-glow{animation:newIn 2s ease forwards;}
  @keyframes newIn{
    0%  {background:rgba(0,255,136,0.18);box-shadow:inset 0 0 0 2px #00ff88;}
    80% {background:rgba(0,255,136,0.04);}
    100%{background:transparent;box-shadow:none;}
  }
  @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes scanBar{0%{top:-4px;opacity:0;}5%{opacity:1;}95%{opacity:1;}100%{top:100%;opacity:0;}}
  .scan-wrap{position:relative;overflow:hidden;}
  .scan-wrap::after{content:'';position:absolute;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#2a9a2a,#90ee90,#2a9a2a,transparent);box-shadow:0 0 14px #2a9a2a88;animation:scanBar 1.8s linear infinite;pointer-events:none;}
  .log-line{animation:logIn .2s ease;}
  @keyframes logIn{from{opacity:0;transform:translateX(-6px);}to{opacity:1;transform:none;}}
  @media print{
    body{background:white!important;color:black!important;}
    .no-print{display:none!important;}
    .ph{background:#C0392B!important;color:white!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .erow{border-bottom:1px solid #ddd!important;color:black!important;background:white!important;}
    .badge{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .ptitle{display:block!important;}
    .erow,.phase-block{page-break-inside:avoid;}
    .phase-block{margin-bottom:20px;}
  }
`;

const BASE = [
  {id:1,  title:"Homem de Ferro",                             en:"Iron Man",                               year:2008,phase:1,type:"Filme",   rO:1,  cO:4,  set:"2010",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:2,  title:"O Incrível Hulk",                           en:"The Incredible Hulk",                    year:2008,phase:1,type:"Filme",   rO:2,  cO:6,  set:"2011",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:3,  title:"Homem de Ferro 2",                          en:"Iron Man 2",                             year:2010,phase:1,type:"Filme",   rO:3,  cO:5,  set:"2011",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:4,  title:"Thor",                                      en:"Thor",                                   year:2011,phase:1,type:"Filme",   rO:4,  cO:7,  set:"2011",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:5,  title:"Capitão América: O Primeiro Vingador",      en:"Captain America: The First Avenger",     year:2011,phase:1,type:"Filme",   rO:5,  cO:1,  set:"1942–1945",      plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:6,  title:"One-Shot: O Consultor",                     en:"One-Shot: The Consultant",               year:2011,phase:1,type:"Curta",   rO:6,  cO:8,  set:"2011",           plat:"Blu-ray",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:7,  title:"One-Shot: Uma Coisa Engraçada...",          en:"One-Shot: A Funny Thing Happened...",    year:2011,phase:1,type:"Curta",   rO:7,  cO:9,  set:"2011",           plat:"Blu-ray",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:8,  title:"Os Vingadores",                             en:"The Avengers",                           year:2012,phase:1,type:"Filme",   rO:8,  cO:10, set:"2012",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:9,  title:"One-Shot: Item 47",                         en:"One-Shot: Item 47",                      year:2012,phase:1,type:"Curta",   rO:9,  cO:11, set:"2012",           plat:"Blu-ray",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:10, title:"Homem de Ferro 3",                          en:"Iron Man 3",                             year:2013,phase:2,type:"Filme",   rO:10, cO:12, set:"2013",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:11, title:"One-Shot: Agente Carter",                   en:"One-Shot: Agent Carter",                 year:2013,phase:2,type:"Curta",   rO:11, cO:2,  set:"1946",           plat:"Blu-ray",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:12, title:"Thor: O Mundo Sombrio",                     en:"Thor: The Dark World",                   year:2013,phase:2,type:"Filme",   rO:12, cO:13, set:"2013",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:13, title:"One-Shot: Salve o Rei",                     en:"One-Shot: All Hail the King",            year:2014,phase:2,type:"Curta",   rO:13, cO:14, set:"2014",           plat:"Blu-ray",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:14, title:"Capitão América: O Soldado Invernal",       en:"Captain America: The Winter Soldier",    year:2014,phase:2,type:"Filme",   rO:14, cO:15, set:"2014",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:15, title:"Guardiões da Galáxia",                      en:"Guardians of the Galaxy",                year:2014,phase:2,type:"Filme",   rO:15, cO:16, set:"2014",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:16, title:"Vingadores: Era de Ultron",                 en:"Avengers: Age of Ultron",                year:2015,phase:2,type:"Filme",   rO:16, cO:19, set:"2015",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:17, title:"Homem-Formiga",                             en:"Ant-Man",                                year:2015,phase:2,type:"Filme",   rO:17, cO:20, set:"2015",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:200,title:"Demolidor (Netflix) — T1",                  en:"Daredevil S1 (Netflix)",                 year:2015,phase:2,type:"Série",   rO:200,cO:200,set:"2015",           plat:"Netflix/Disney+", saga:"Infinity Saga",   src:"Netflix (Cânon)"},
  {id:201,title:"Jessica Jones (Netflix) — T1",              en:"Jessica Jones S1 (Netflix)",             year:2015,phase:2,type:"Série",   rO:201,cO:201,set:"2015",           plat:"Netflix/Disney+", saga:"Infinity Saga",   src:"Netflix (Cânon)"},
  {id:202,title:"Demolidor (Netflix) — T2",                  en:"Daredevil S2 (Netflix)",                 year:2016,phase:3,type:"Série",   rO:202,cO:202,set:"2016",           plat:"Netflix/Disney+", saga:"Infinity Saga",   src:"Netflix (Cânon)"},
  {id:203,title:"Luke Cage (Netflix) — T1",                  en:"Luke Cage S1 (Netflix)",                 year:2016,phase:3,type:"Série",   rO:203,cO:203,set:"2016",           plat:"Netflix/Disney+", saga:"Infinity Saga",   src:"Netflix (Cânon)"},
  {id:204,title:"Punho de Ferro (Netflix) — T1",             en:"Iron Fist S1 (Netflix)",                 year:2017,phase:3,type:"Série",   rO:204,cO:204,set:"2017",           plat:"Netflix/Disney+", saga:"Infinity Saga",   src:"Netflix (Cânon)"},
  {id:205,title:"Os Defensores (Netflix)",                   en:"The Defenders (Netflix)",                year:2017,phase:3,type:"Série",   rO:205,cO:205,set:"2017",           plat:"Netflix/Disney+", saga:"Infinity Saga",   src:"Netflix (Cânon)"},
  {id:206,title:"O Justiceiro (Netflix) — T1",               en:"The Punisher S1 (Netflix)",              year:2017,phase:3,type:"Série",   rO:206,cO:206,set:"2017",           plat:"Netflix/Disney+", saga:"Infinity Saga",   src:"Netflix (Cânon)"},
  {id:207,title:"Jessica Jones (Netflix) — T2",              en:"Jessica Jones S2 (Netflix)",             year:2018,phase:3,type:"Série",   rO:207,cO:207,set:"2018",           plat:"Netflix/Disney+", saga:"Infinity Saga",   src:"Netflix (Cânon)"},
  {id:208,title:"Luke Cage (Netflix) — T2",                  en:"Luke Cage S2 (Netflix)",                 year:2018,phase:3,type:"Série",   rO:208,cO:208,set:"2018",           plat:"Netflix/Disney+", saga:"Infinity Saga",   src:"Netflix (Cânon)"},
  {id:209,title:"Punho de Ferro (Netflix) — T2",             en:"Iron Fist S2 (Netflix)",                 year:2018,phase:3,type:"Série",   rO:209,cO:209,set:"2018",           plat:"Netflix/Disney+", saga:"Infinity Saga",   src:"Netflix (Cânon)"},
  {id:210,title:"Demolidor (Netflix) — T3",                  en:"Daredevil S3 (Netflix)",                 year:2018,phase:3,type:"Série",   rO:210,cO:210,set:"2018",           plat:"Netflix/Disney+", saga:"Infinity Saga",   src:"Netflix (Cânon)"},
  {id:211,title:"O Justiceiro (Netflix) — T2",               en:"The Punisher S2 (Netflix)",              year:2019,phase:3,type:"Série",   rO:211,cO:211,set:"2019",           plat:"Netflix/Disney+", saga:"Infinity Saga",   src:"Netflix (Cânon)"},
  {id:212,title:"Jessica Jones (Netflix) — T3",              en:"Jessica Jones S3 (Netflix)",             year:2019,phase:3,type:"Série",   rO:212,cO:212,set:"2019",           plat:"Netflix/Disney+", saga:"Infinity Saga",   src:"Netflix (Cânon)"},
  {id:18, title:"Capitão América: Guerra Civil",             en:"Captain America: Civil War",             year:2016,phase:3,type:"Filme",   rO:18, cO:21, set:"2016",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:19, title:"Doutor Estranho",                           en:"Doctor Strange",                         year:2016,phase:3,type:"Filme",   rO:19, cO:25, set:"2017",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:20, title:"Guardiões da Galáxia Vol. 2",              en:"Guardians of the Galaxy Vol. 2",         year:2017,phase:3,type:"Filme",   rO:20, cO:17, set:"2014",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:21, title:"Homem-Aranha: De Volta ao Lar",            en:"Spider-Man: Homecoming",                 year:2017,phase:3,type:"Filme",   rO:21, cO:24, set:"2017",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:22, title:"Thor: Ragnarok",                            en:"Thor: Ragnarok",                         year:2017,phase:3,type:"Filme",   rO:22, cO:26, set:"2017",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:23, title:"Pantera Negra",                             en:"Black Panther",                          year:2018,phase:3,type:"Filme",   rO:23, cO:23, set:"2017",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:24, title:"Vingadores: Guerra Infinita",               en:"Avengers: Infinity War",                 year:2018,phase:3,type:"Filme",   rO:24, cO:27, set:"2018",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:25, title:"Homem-Formiga e a Vespa",                  en:"Ant-Man and the Wasp",                   year:2018,phase:3,type:"Filme",   rO:25, cO:28, set:"2018",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:26, title:"Capitã Marvel",                            en:"Captain Marvel",                         year:2019,phase:3,type:"Filme",   rO:26, cO:3,  set:"1995",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:27, title:"Vingadores: Ultimato",                      en:"Avengers: Endgame",                      year:2019,phase:3,type:"Filme",   rO:27, cO:29, set:"2018→2023",      plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:28, title:"Homem-Aranha: Longe de Casa",              en:"Spider-Man: Far From Home",              year:2019,phase:3,type:"Filme",   rO:28, cO:36, set:"2024",           plat:"Disney+",         saga:"Infinity Saga",   src:"Marvel Studios"},
  {id:29, title:"WandaVision",                               en:"WandaVision",                            year:2021,phase:4,type:"Série",   rO:29, cO:30, set:"2023",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:9},
  {id:30, title:"Falcão e o Soldado Invernal",              en:"The Falcon and the Winter Soldier",      year:2021,phase:4,type:"Série",   rO:30, cO:31, set:"2023",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:6},
  {id:31, title:"Loki — T1",                                en:"Loki Season 1",                          year:2021,phase:4,type:"Série",   rO:31, cO:32, set:"Fora do tempo",  plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:6},
  {id:32, title:"Viúva Negra",                              en:"Black Widow",                            year:2021,phase:4,type:"Filme",   rO:32, cO:22, set:"2016",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios"},
  {id:33, title:"What If...? — T1",                         en:"What If...? Season 1",                   year:2021,phase:4,type:"Animação",rO:33, cO:33, set:"Multiverso",     plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:9},
  {id:34, title:"Shang-Chi e a Lenda dos Dez Anéis",       en:"Shang-Chi and the Legend of the Ten Rings",year:2021,phase:4,type:"Filme",rO:34, cO:34, set:"2023/2024",      plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios"},
  {id:35, title:"Eternos",                                   en:"Eternals",                               year:2021,phase:4,type:"Filme",   rO:35, cO:35, set:"Vários/2024",    plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios"},
  {id:36, title:"Gavião Arqueiro",                           en:"Hawkeye",                                year:2021,phase:4,type:"Série",   rO:36, cO:37, set:"Dez/2024",       plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:6},
  {id:37, title:"Homem-Aranha: Sem Volta para Casa",        en:"Spider-Man: No Way Home",                year:2021,phase:4,type:"Filme",   rO:37, cO:38, set:"2024",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios"},
  {id:38, title:"Cavaleiro da Lua",                         en:"Moon Knight",                            year:2022,phase:4,type:"Série",   rO:38, cO:39, set:"2025",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:6},
  {id:39, title:"Doutor Estranho no Multiverso da Loucura", en:"Doctor Strange in the Multiverse of Madness",year:2022,phase:4,type:"Filme",rO:39,cO:40,set:"2025",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios"},
  {id:40, title:"Ms. Marvel",                               en:"Ms. Marvel",                             year:2022,phase:4,type:"Série",   rO:40, cO:41, set:"2025",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:6},
  {id:41, title:"Thor: Amor e Trovão",                      en:"Thor: Love and Thunder",                 year:2022,phase:4,type:"Filme",   rO:41, cO:42, set:"2025",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios"},
  {id:42, title:"I Am Groot — T1",                          en:"I Am Groot Season 1",                    year:2022,phase:4,type:"Animação",rO:42, cO:18, set:"2014",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:5},
  {id:43, title:"She-Hulk: Defensora de Heróis",            en:"She-Hulk: Attorney at Law",              year:2022,phase:4,type:"Série",   rO:43, cO:43, set:"2025",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:9},
  {id:44, title:"Lobisomem à Noite",                        en:"Werewolf by Night",                      year:2022,phase:4,type:"Especial",rO:44, cO:45, set:"2025?",          plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios"},
  {id:45, title:"Pantera Negra: Wakanda Para Sempre",       en:"Black Panther: Wakanda Forever",         year:2022,phase:4,type:"Filme",   rO:45, cO:44, set:"2025",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios"},
  {id:46, title:"Guardiões: Especial de Natal",             en:"GotG Holiday Special",                   year:2022,phase:4,type:"Especial",rO:46, cO:46, set:"Dez/2025",       plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios"},
  {id:47, title:"Homem-Formiga e a Vespa: Quantumania",    en:"Ant-Man and the Wasp: Quantumania",      year:2023,phase:5,type:"Filme",   rO:47, cO:51, set:"Início 2026",    plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios"},
  {id:48, title:"Guardiões da Galáxia Vol. 3",             en:"Guardians of the Galaxy Vol. 3",         year:2023,phase:5,type:"Filme",   rO:48, cO:52, set:"2026",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios"},
  {id:49, title:"I Am Groot — T2",                         en:"I Am Groot Season 2",                    year:2023,phase:5,type:"Animação",rO:49, cO:48, set:"Pós Vol.2",      plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:5},
  {id:50, title:"Invasão Secreta",                          en:"Secret Invasion",                        year:2023,phase:5,type:"Série",   rO:50, cO:53, set:"2026",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:6},
  {id:51, title:"Loki — T2",                               en:"Loki Season 2",                          year:2023,phase:5,type:"Série",   rO:51, cO:50, set:"Fora do tempo",  plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:6},
  {id:52, title:"What If...? — T2",                        en:"What If...? Season 2",                   year:2023,phase:5,type:"Animação",rO:52, cO:49, set:"Multiverso",     plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:9},
  {id:53, title:"As Marvels",                               en:"The Marvels",                            year:2023,phase:5,type:"Filme",   rO:53, cO:55, set:"Late 2026",      plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios"},
  {id:54, title:"Echo",                                     en:"Echo",                                   year:2024,phase:5,type:"Série",   rO:54, cO:54, set:"2026",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:5},
  {id:55, title:"What If...? — T3",                        en:"What If...? Season 3",                   year:2024,phase:5,type:"Animação",rO:55, cO:56, set:"Multiverso",     plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:8},
  {id:56, title:"Deadpool & Wolverine",                     en:"Deadpool & Wolverine",                   year:2024,phase:5,type:"Filme",   rO:56, cO:57, set:"2026/Void",      plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios"},
  {id:57, title:"Agatha para Sempre",                       en:"Agatha All Along",                       year:2024,phase:5,type:"Série",   rO:57, cO:58, set:"2026",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:9},
  {id:58, title:"Capitão América: Admirável Mundo Novo",   en:"Captain America: Brave New World",       year:2025,phase:5,type:"Filme",   rO:58, cO:59, set:"Late 2026/2027", plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios"},
  {id:59, title:"Thunderbolts*",                            en:"Thunderbolts*",                          year:2025,phase:5,type:"Filme",   rO:59, cO:61, set:"2027",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios"},
  {id:60, title:"Seu Amigão Homem-Aranha — T1",            en:"Your Friendly Neighborhood Spider-Man S1",year:2025,phase:5,type:"Animação",rO:60,cO:64, set:"Univ. alt.",    plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:10},
  {id:61, title:"Demolidor: Sem Medo — T1",                en:"Daredevil: Born Again S1",               year:2025,phase:5,type:"Série",   rO:61, cO:60, set:"Late 2026/2027", plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:9},
  {id:62, title:"Coração de Ferro",                         en:"Ironheart",                              year:2025,phase:5,type:"Série",   rO:62, cO:47, set:"Late 2025",      plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:6},
  {id:63, title:"Eyes of Wakanda",                          en:"Eyes of Wakanda",                        year:2025,phase:6,type:"Animação",rO:63, cO:62, set:"Vários",         plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:4},
  {id:64, title:"Marvel Zumbis — T1",                      en:"Marvel Zombies S1",                      year:2025,phase:6,type:"Animação",rO:64, cO:63, set:"Univ. alt.",     plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:6},
  {id:65, title:"Quarteto Fantástico: Primeiros Passos",   en:"The Fantastic Four: First Steps",        year:2025,phase:6,type:"Filme",   rO:65, cO:65, set:"Univ. alt./Anos 60",plat:"Disney+",      saga:"Multiverse Saga", src:"Marvel Studios"},
  {id:66, title:"Wonder Man — T1",                         en:"Wonder Man S1",                          year:2026,phase:6,type:"Série",   rO:66, cO:66, set:"2026",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:6,  releaseInfo:"Jan 27, 2026 ✓"},
  {id:67, title:"Demolidor: Sem Medo — T2",               en:"Daredevil: Born Again S2",               year:2026,phase:6,type:"Série",   rO:67, cO:67, set:"2027",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",eps:8,  releaseInfo:"Mar 24, 2026 ✓"},
  {id:68, title:"VisionQuest",                              en:"VisionQuest",                            year:2026,phase:6,type:"Série",   rO:68, cO:68, set:"2026",           plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",        releaseInfo:"2026 — a confirmar"},
  {id:69, title:"O Justiceiro: Uma Última Morte",          en:"The Punisher: One Last Kill",            year:2026,phase:6,type:"Especial",rO:69, cO:70, set:"2026/2027",      plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",        releaseInfo:"Mai/Jun 2026"},
  {id:70, title:"Seu Amigão Homem-Aranha — T2",           en:"Your Friendly Neighborhood Spider-Man S2",year:2026,phase:6,type:"Animação",rO:70,cO:69, set:"Univ. alt.",    plat:"Disney+",         saga:"Multiverse Saga", src:"Marvel Studios",        releaseInfo:"Outono 2026"},
  {id:71, title:"Homem-Aranha: Novo Dia",                  en:"Spider-Man: Brand New Day",              year:2026,phase:6,type:"Filme",   rO:71, cO:71, set:"2028",           plat:"Cinema (Sony/Marvel)",saga:"Multiverse Saga",src:"Marvel Studios",      releaseInfo:"31 Jul 2026"},
  {id:72, title:"Vingadores: Juízo Final",                 en:"Avengers: Doomsday",                     year:2026,phase:6,type:"Filme",   rO:72, cO:72, set:"2027+",          plat:"Cinema",          saga:"Multiverse Saga", src:"Marvel Studios",        releaseInfo:"18 Dez 2026"},
];

const PHASE_META = {
  1:{label:"Fase 1",sub:"Infinity Saga",years:"2008–2012",color:"#8B0000"},
  2:{label:"Fase 2",sub:"Infinity Saga",years:"2013–2015",color:"#A83232"},
  3:{label:"Fase 3",sub:"Infinity Saga",years:"2016–2019",color:"#C0392B"},
  4:{label:"Fase 4",sub:"Multiverse Saga",years:"2021–2022",color:"#1a3a6b"},
  5:{label:"Fase 5",sub:"Multiverse Saga",years:"2023–2025",color:"#1f4c94"},
  6:{label:"Fase 6",sub:"Multiverse Saga",years:"2025–2026",color:"#6a0dad"},
  netflix:{label:"Marvel Television — Netflix",sub:"Cânon confirmado (2024)",years:"2015–2019",color:"#1a1a1a"},
};

const TC = {
  Filme:   {bg:"#C0392B22",bd:"#C0392B",tx:"#ff6b6b"},
  Série:   {bg:"#1565C022",bd:"#1976D2",tx:"#64b5f6"},
  Animação:{bg:"#2E7D3222",bd:"#388E3C",tx:"#81c784"},
  Curta:   {bg:"#F57F1722",bd:"#F57F17",tx:"#ffb300"},
  Especial:{bg:"#6A1B9A22",bd:"#8E24AA",tx:"#ce93d8"},
};

async function callGemini(apiKey, existingList, onLog) {
  onLog("🛰️  Conectando ao Gemini 2.5 Flash...");
  const today = new Date().toISOString().split("T")[0];
  const prompt = `You are an MCU expert. Today is ${today}.
Search the web for the latest MCU news and confirmed releases.

I already have these entries:
${existingList}

Find MCU projects NOT in my list above. Return ONLY a valid JSON array (no markdown, no code fences). Each item:
{"id":<number above 1000>,"title":"<PT or original title>","en":"<English title>","year":<number>,"phase":<1-6>,"type":"<Filme|Série|Animação|Curta|Especial>","rO":<release order>,"cO":<chronological order>,"set":"<in-universe year>","plat":"<platform>","saga":"<Infinity Saga|Multiverse Saga>","src":"Marvel Studios","releaseInfo":"<date or TBA>","isNew":true}
If nothing new, return [].`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${apiKey}`,
    {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        contents:[{parts:[{text:prompt}]}],
        tools:[{google_search:{}}],
        generationConfig:{temperature:0.1},
      }),
    }
  );
  if (!res.ok) {
    const e = await res.json().catch(()=>({}));
    throw new Error(e?.error?.message || `HTTP ${res.status}`);
  }
  onLog("🌐 Google Search ativo — varrendo novidades...");
  const data = await res.json();
  const raw = (data?.candidates?.[0]?.content?.parts||[]).map(p=>p.text||"").join("");
  onLog("🧠 Analisando resposta...");
  const clean = raw.replace(/```json|```/gi,"").trim();
  const match = clean.match(/\[[\s\S]*\]/);
  if (!match) return [];
  return JSON.parse(match[0]);
}

export default function App() {
  const [entries, setEntries]       = useState(BASE);
  const [mode, setMode]             = useState("release");
  const [filter, setFilter]         = useState("Todos");
  const [showNetflix, setShowNetflix] = useState(true);
  const [watched, setWatched]       = useState({});
  const [search, setSearch]         = useState("");
  const [apiKey, setApiKey]         = useState("");
  const [showKey, setShowKey]       = useState(false);
  const [updating, setUpdating]     = useState(false);
  const [logs, setLogs]             = useState([]);
  const [result, setResult]         = useState(null);
  const [newIds, setNewIds]         = useState(new Set());
  const [panel, setPanel]           = useState(false);
  const logsRef = useRef(null);

  useEffect(()=>{
    (async()=>{
      try {
        const w=await window.storage.get("mcu-w4"); if(w)setWatched(JSON.parse(w.value));
        const e=await window.storage.get("mcu-e4"); if(e)setEntries(JSON.parse(e.value));
        const k=await window.storage.get("mcu-k4"); if(k)setApiKey(k.value);
      }catch(_){}
    })();
  },[]);

  const sw = w=>{setWatched(w);try{window.storage.set("mcu-w4",JSON.stringify(w));}catch(_){}};
  const se = e=>{setEntries(e);try{window.storage.set("mcu-e4",JSON.stringify(e));}catch(_){}};
  const sk = k=>{setApiKey(k);try{window.storage.set("mcu-k4",k);}catch(_){}};

  const toggle = id=>{const n={...watched,[id]:!watched[id]};if(!n[id])delete n[id];sw(n);};
  const addLog = msg=>{
    setLogs(l=>[...l,{msg,t:Date.now()}]);
    setTimeout(()=>{if(logsRef.current)logsRef.current.scrollTop=9999;},40);
  };

  const handleUpdate = async()=>{
    if(!apiKey.trim()){setPanel(true);return;}
    setUpdating(true);setLogs([]);setResult(null);setPanel(true);
    try {
      const list = entries.map(e=>`- ${e.en} (${e.year})`).join("\n");
      const news = await callGemini(apiKey.trim(),list,addLog);
      if(!news.length){addLog("✅ Nenhuma novidade! Lista já atualizada.");setResult({added:0,skipped:0});setUpdating(false);return;}
      addLog(`📦 ${news.length} item(s) encontrado(s). Checando duplicatas...`);
      const ids=new Set(entries.map(e=>e.id));
      const ens=new Set(entries.map(e=>e.en.toLowerCase()));
      const toAdd=[]; let skip=0;
      news.forEach(n=>{
        if(ids.has(n.id)||ens.has(n.en?.toLowerCase())){skip++;return;}
        toAdd.push({...n,isNew:true});
      });
      if(!toAdd.length){addLog(`✅ Já constam na lista. (${skip} duplicata(s))`);setResult({added:0,skipped:skip});setUpdating(false);return;}
      addLog(`✨ Adicionando ${toAdd.length} nova(s) obra(s):`);
      toAdd.forEach(n=>addLog(`  ➕ ${n.title} (${n.year})`));
      const merged=[...entries,...toAdd];
      se(merged);
      setNewIds(new Set(toAdd.map(e=>e.id)));
      setTimeout(()=>setNewIds(new Set()),9000);
      setResult({added:toAdd.length,skipped:skip});
      addLog(`🎉 Concluído! ${toAdd.length} adicionada(s).`);
    } catch(err){
      addLog(`❌ Erro: ${err.message}`);
      setResult({added:0,skipped:0,error:true});
    }
    setUpdating(false);
  };

  const filtered = useMemo(()=>{
    let l=entries;
    if(!showNetflix)l=l.filter(e=>e.src!=="Netflix (Cânon)");
    if(filter!=="Todos")l=l.filter(e=>e.type===filter);
    if(search.trim()){const q=search.toLowerCase();l=l.filter(e=>e.title.toLowerCase().includes(q)||(e.en||"").toLowerCase().includes(q));}
    return l;
  },[entries,filter,showNetflix,search]);

  const sorted = useMemo(()=>{
    const f=mode==="release"?"rO":"cO";
    return [...filtered].sort((a,b)=>a[f]-b[f]);
  },[filtered,mode]);

  const grouped = useMemo(()=>{
    if(mode==="release"){
      const ph={};const nf=[];
      sorted.forEach(e=>{
        if(e.src==="Netflix (Cânon)"){nf.push(e);return;}
        if(!ph[e.phase])ph[e.phase]=[];
        ph[e.phase].push(e);
      });
      const r=[];
      [1,2,3,4,5,6].forEach(p=>{if(ph[p]?.length)r.push({key:`p${p}`,meta:PHASE_META[p]||{label:`Fase ${p}`,color:"#333"},items:ph[p]});});
      if(nf.length)r.push({key:"nf",meta:PHASE_META.netflix,items:nf});
      return r;
    }
    const eras=[
      {key:"e0",meta:{label:"Passado Histórico",sub:"Anos 40 – 1990s",color:"#4a3000"},items:[]},
      {key:"e1",meta:{label:"Início do MCU",sub:"2010 – 2012",color:"#8B0000"},items:[]},
      {key:"e2",meta:{label:"Expansão",sub:"2013 – 2015",color:"#A83232"},items:[]},
      {key:"e3",meta:{label:"Defesas de Nova York (Netflix)",sub:"2015 – 2019",color:"#1a1a1a"},items:[]},
      {key:"e4",meta:{label:"Era dos Vingadores",sub:"2016 – 2019",color:"#C0392B"},items:[]},
      {key:"e5",meta:{label:"Pós-Ultimato",sub:"2023 – 2025",color:"#1a3a6b"},items:[]},
      {key:"e6",meta:{label:"Crise do Multiverso",sub:"2026 – 2027",color:"#1f4c94"},items:[]},
      {key:"e7",meta:{label:"Universos Alternativos / Fora do Tempo",sub:"Multiverso",color:"#4a0080"},items:[]},
      {key:"e8",meta:{label:"Futuro Próximo",sub:"2028+",color:"#6a0dad"},items:[]},
    ];
    sorted.forEach(e=>{
      const s=e.set||"";
      if(e.src==="Netflix (Cânon)"){eras[3].items.push(e);return;}
      if(/1942|1946|1995|Anos 60|60s/i.test(s))eras[0].items.push(e);
      else if(/201[012]/.test(s))eras[1].items.push(e);
      else if(/201[345]/.test(s))eras[2].items.push(e);
      else if(/201[6789]/.test(s))eras[4].items.push(e);
      else if(/202[345]/.test(s))eras[5].items.push(e);
      else if(/202[67]/.test(s))eras[6].items.push(e);
      else if(/202[89]|203/.test(s))eras[8].items.push(e);
      else eras[7].items.push(e);
    });
    return eras.filter(e=>e.items.length);
  },[sorted,mode]);

  const total=entries.filter(e=>showNetflix||e.src!=="Netflix (Cânon)").length;
  const watchedN=Object.values(watched).filter(Boolean).length;
  const pct=total?Math.round((watchedN/total)*100):0;
  const filtW=filtered.filter(e=>watched[e.id]).length;

  return (
    <>
      <style>{STYLES}</style>
      <div style={{fontFamily:"'Barlow',sans-serif",background:"#080810",minHeight:"100vh",color:"#e0e0e0"}}>

        {/* HEADER */}
        <div className="no-print" style={{background:"linear-gradient(135deg,#0d0010,#140020,#0a0008)",borderBottom:"2px solid #C0392B"}}>
          <div style={{maxWidth:1200,margin:"0 auto",padding:"22px 24px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14,flexWrap:"wrap"}}>
              <div style={{width:48,height:48,background:"#C0392B",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:"white",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2,flexShrink:0,fontWeight:900}}>M</div>
              <div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:"#fff",letterSpacing:4,lineHeight:1}}>MCU TRACKER</div>
                <div style={{fontSize:10,color:"#555",letterSpacing:3,textTransform:"uppercase"}}>Universo Cinematográfico Marvel · Guia Completo 2026</div>
              </div>
              <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={handleUpdate} disabled={updating} style={{background:updating?"#111":"linear-gradient(135deg,#1a5a1a,#2a8a2a)",color:updating?"#444":"#90ee90",border:`1px solid ${updating?"#222":"#2a7a2a"}`,borderRadius:8,padding:"9px 16px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,letterSpacing:1,cursor:updating?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:8}}>
                  <span style={updating?{display:"inline-block",animation:"spin 1s linear infinite"}:{}}>{updating?"⟳":"🛰️"}</span>
                  {updating?"Buscando...":"Atualizar MCU"}
                </button>
                <button onClick={()=>setPanel(p=>!p)} style={{background:"transparent",border:"1px solid #1a4a1a",color:"#4a8a4a",borderRadius:8,padding:"9px 14px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,cursor:"pointer"}}>
                  {panel?"▲ Fechar":"⚙️ Gemini"}
                </button>
                <button onClick={()=>window.print()} style={{background:"#C0392B",color:"white",border:"none",borderRadius:8,padding:"9px 16px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer"}}>🖨️ PDF</button>
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"11px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:12,color:"#666"}}>Progresso ({total} obras)</span>
                <span style={{fontSize:12,color:"#FFD700",fontWeight:700}}>{watchedN}/{total} assistidos · {pct}%</span>
              </div>
              <div style={{height:5,background:"#1a1a2e",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#C0392B,#E74C3C)",borderRadius:3,transition:"width .4s"}}/>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="no-print" style={{background:"#0d0d1a",borderBottom:"1px solid #1e1e30",position:"sticky",top:0,zIndex:50,boxShadow:"0 2px 20px #000a"}}>
          <div style={{maxWidth:1200,margin:"0 auto",padding:"9px 24px",display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}}>
            <div style={{display:"flex",borderRadius:7,overflow:"hidden",border:"1px solid #2a2a40"}}>
              {[["release","🎬 Lançamento"],["chrono","⏳ Cronológico"]].map(([m,l])=>(
                <button key={m} onClick={()=>setMode(m)} style={{padding:"6px 14px",background:mode===m?"#C0392B":"transparent",color:mode===m?"white":"#666",border:"none",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,letterSpacing:1}}>{l}</button>
              ))}
            </div>
            {["Todos","Filme","Série","Animação","Curta","Especial"].map(t=>{
              const c=TC[t]||{};const a=filter===t;
              return <button key={t} onClick={()=>setFilter(t)} style={{padding:"4px 12px",borderRadius:16,border:a?`1px solid ${c.bd||"#C0392B"}`:"1px solid #2a2a40",background:a?(c.bg||"#C0392B22"):"transparent",color:a?(c.tx||"#ff6b6b"):"#555",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700}}>{t}</button>;
            })}
            <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
              <div onClick={()=>setShowNetflix(p=>!p)} style={{width:32,height:17,borderRadius:9,background:showNetflix?"#E50914":"#333",position:"relative",cursor:"pointer",transition:"background .2s"}}>
                <div style={{width:13,height:13,borderRadius:"50%",background:"white",position:"absolute",top:2,left:showNetflix?17:2,transition:"left .2s"}}/>
              </div>
              <span style={{fontSize:11,color:showNetflix?"#E50914":"#444",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>NETFLIX</span>
            </label>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{marginLeft:"auto",background:"#1a1a2e",border:"1px solid #2a2a40",borderRadius:5,padding:"5px 11px",color:"#ddd",fontSize:12,outline:"none",width:150,fontFamily:"'Barlow',sans-serif"}}/>
            <button onClick={()=>{const n={...watched};filtered.forEach(e=>{n[e.id]=true;});sw(n);}} style={{background:"transparent",border:"1px solid #1a4a1a",color:"#4caf50",borderRadius:5,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>✓ Marcar</button>
            <button onClick={()=>sw({})} style={{background:"transparent",border:"1px solid #4a2a2a",color:"#666",borderRadius:5,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>✕ Limpar</button>
          </div>
          <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px 7px",fontSize:10,color:"#3a3a5a"}}>
            {filtered.length} obras · <span style={{color:"#4caf50"}}>{filtW}</span> assistidas · <span style={{color:"#ff6b6b"}}>{filtered.length-filtW}</span> por assistir
          </div>
        </div>

        {/* GEMINI PANEL */}
        {panel && (
          <div className="no-print" style={{maxWidth:1200,margin:"14px auto 0",padding:"0 24px"}}>
            <div style={{background:"#060d06",border:"1px solid #1a3a1a",borderRadius:10,overflow:"hidden"}}>
              <div style={{background:"linear-gradient(135deg,#0a1a0a,#071007)",padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid #112011"}}>
                <span style={{fontSize:16}}>🛰️</span>
                <div>
                  <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#90ee90",letterSpacing:2}}>Gemini 2.5 Flash</span>
                  <span style={{fontSize:10,color:"#2a6a2a",letterSpacing:1,marginLeft:10}}>Google Search Grounding · Gratuito</span>
                </div>
                <button onClick={()=>setPanel(false)} style={{marginLeft:"auto",background:"transparent",border:"none",color:"#444",fontSize:16,cursor:"pointer"}}>✕</button>
              </div>
              <div style={{padding:"14px 16px",display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
                <div style={{flex:"1 1 280px"}}>
                  <div style={{fontSize:11,color:"#2a6a2a",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>
                    CHAVE API GEMINI <span style={{color:"#1a4a1a"}}>· gratuito em aistudio.google.com</span>
                  </div>
                  <div style={{display:"flex",gap:7}}>
                    <input type={showKey?"text":"password"} value={apiKey} onChange={e=>sk(e.target.value)} placeholder="AIzaSy..." style={{flex:1,background:"#0a140a",border:"1px solid #1a3a1a",borderRadius:6,padding:"8px 11px",color:"#90ee90",fontSize:12,outline:"none",fontFamily:"monospace"}}/>
                    <button onClick={()=>setShowKey(p=>!p)} style={{background:"#0a140a",border:"1px solid #1a3a1a",borderRadius:6,padding:"0 10px",color:"#2a6a2a",cursor:"pointer",fontSize:13}}>{showKey?"🙈":"👁️"}</button>
                    <button onClick={handleUpdate} disabled={updating||!apiKey.trim()} style={{background:(!apiKey.trim()||updating)?"#0a140a":"linear-gradient(135deg,#1a5a1a,#2a7a2a)",color:(!apiKey.trim()||updating)?"#2a5a2a":"#90ee90",border:"1px solid #1a4a1a",borderRadius:6,padding:"8px 16px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,cursor:(!apiKey.trim()||updating)?"not-allowed":"pointer",whiteSpace:"nowrap"}}>
                      {updating?"Buscando...":"🔍 Buscar"}
                    </button>
                  </div>
                  <div style={{fontSize:10,color:"#1a4a1a",marginTop:4,lineHeight:1.6}}>
                    A chave fica salva localmente neste dispositivo. Cada pessoa usa a própria chave gratuita.
                  </div>
                </div>
                {result && (
                  <div style={{background:result.error?"#1a0505":result.added>0?"#051505":"#060d06",border:`1px solid ${result.error?"#8B0000":result.added>0?"#1a5a1a":"#112011"}`,borderRadius:8,padding:"10px 16px",textAlign:"center",minWidth:120}}>
                    {result.error
                      ? <div style={{color:"#ff6b6b",fontSize:12,fontFamily:"'Barlow Condensed',sans-serif"}}>❌ Erro na busca</div>
                      : result.added>0
                      ? <><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:34,color:"#00ff88",lineHeight:1}}>{result.added}</div><div style={{fontSize:11,color:"#4a9a4a",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>NOVO(S)</div></>
                      : <><div style={{fontSize:20}}>✅</div><div style={{fontSize:11,color:"#2a6a2a",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>ATUALIZADO</div></>
                    }
                  </div>
                )}
              </div>
              {logs.length>0 && (
                <div ref={logsRef} className={updating?"scan-wrap":""} style={{margin:"0 16px 14px",background:"#040a04",border:"1px solid #0d1f0d",borderRadius:6,padding:"9px 12px",maxHeight:130,overflowY:"auto",fontFamily:"monospace",fontSize:11,position:"relative"}}>
                  {logs.map((l,i)=>(
                    <div key={l.t+i} className="log-line" style={{color:"#4a9a4a",lineHeight:1.8}}>
                      <span style={{color:"#1a4a1a",marginRight:8}}>[{new Date(l.t).toLocaleTimeString("pt-BR")}]</span>{l.msg}
                    </div>
                  ))}
                  {updating&&<span style={{color:"#2a6a2a"}}>▋</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRINT TITLE */}
        <div className="ptitle" style={{display:"none",textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:24,margin:"14px 0 6px",color:"#C0392B"}}>
          MCU TRACKER · {mode==="release"?"Ordem de Lançamento":"Ordem Cronológica"} · {new Date().toLocaleDateString("pt-BR")}
        </div>

        {/* LIST */}
        <div style={{maxWidth:1200,margin:"0 auto",padding:"18px 24px"}}>
          {grouped.map(g=>{
            const {label,sub,years,color}=g.meta;
            const wG=g.items.filter(e=>watched[e.id]).length;
            return (
              <div key={g.key} className="phase-block" style={{marginBottom:26}}>
                <div className="ph" style={{background:`linear-gradient(135deg,${color}ee,${color}66)`,borderRadius:"10px 10px 0 0",padding:"11px 16px",display:"flex",alignItems:"center",borderLeft:`4px solid ${color}`}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:19,color:"white",letterSpacing:3}}>{label}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",letterSpacing:2}}>{sub}{years?` · ${years}`:""}</div>
                  </div>
                  <div style={{marginLeft:"auto",textAlign:"right"}}>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,color:"rgba(255,255,255,0.7)",fontWeight:700}}>{wG}/{g.items.length}</div>
                    <div style={{height:3,width:90,background:"rgba(255,255,255,0.15)",borderRadius:2,marginTop:3}}>
                      <div style={{height:"100%",width:g.items.length?`${(wG/g.items.length)*100}%`:"0%",background:"rgba(255,255,255,0.7)",borderRadius:2}}/>
                    </div>
                  </div>
                </div>
                <div style={{border:"1px solid #1e1e30",borderTop:"none",borderRadius:"0 0 10px 10px",overflow:"hidden"}}>
                  {g.items.map((e,i)=>{
                    const isW=!!watched[e.id];
                    const tc=TC[e.type]||TC.Filme;
                    const isN=newIds.has(e.id);
                    const is26=e.year>=2026;
                    return (
                      <div key={e.id} className={`erow${isN?" new-glow":""}`} onClick={()=>toggle(e.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",background:isW?"#0a170a":(i%2===0?"#0d0d1a":"#0a0a14"),borderBottom:i<g.items.length-1?"1px solid #14142a":"none",cursor:"pointer",transition:"background .15s",opacity:isW?.65:1}}>
                        <div style={{width:30,textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:isW?"#4caf50":"#2a2a40",flexShrink:0}}>
                          {(mode==="release"?e.rO:e.cO)<=150?(mode==="release"?e.rO:e.cO):"—"}
                        </div>
                        <div style={{width:20,height:20,borderRadius:4,border:`2px solid ${isW?"#4caf50":"#222"}`,background:isW?"#1b5e20":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          {isW&&<span style={{color:"#4caf50",fontSize:12}}>✓</span>}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:isW?"#3a6a3a":is26?"#FFD700":"#ddd",textDecoration:isW?"line-through":"none",display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                            {e.title}
                            {is26&&<span style={{fontSize:8,background:"#FFD70022",border:"1px solid #FFD700",color:"#FFD700",borderRadius:3,padding:"1px 4px",fontWeight:700,letterSpacing:2}}>2026</span>}
                            {isN&&<span style={{fontSize:8,background:"#00ff8822",border:"1px solid #00ff88",color:"#00ff88",borderRadius:3,padding:"1px 4px",fontWeight:700,letterSpacing:2}}>NOVO ✦</span>}
                          </div>
                          <div style={{fontSize:9,color:"#383858",marginTop:1}}>
                            {e.year} · {e.plat}{e.eps?` · ${e.eps} eps`:""}
                            {e.releaseInfo&&<span style={{color:"#9a8a00"}}> · {e.releaseInfo}</span>}
                          </div>
                        </div>
                        <div style={{background:tc.bg,border:`1px solid ${tc.bd}`,color:tc.tx,borderRadius:3,padding:"2px 8px",fontSize:9,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1,flexShrink:0}} className="badge">{e.type}</div>
                        <div style={{fontSize:9,color:"#333",fontFamily:"'Barlow Condensed',sans-serif",flexShrink:0,minWidth:70,textAlign:"right"}}>📅 {e.set}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="no-print" style={{textAlign:"center",padding:"24px 0",color:"#1a1a30",fontSize:10,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2}}>
            MCU TRACKER · {entries.length} obras · Powered by Gemini 2.5 Flash + Google Search Grounding
          </div>
        </div>
      </div>
    </>
  );
}
