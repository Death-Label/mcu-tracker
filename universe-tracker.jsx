import { useState, useEffect, useMemo, useRef, useCallback } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{height:100%;overflow-x:hidden;}
  body{background:#06060e;}
  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:#0a0a14;}
  ::-webkit-scrollbar-thumb{background:var(--accent,#C0392B);border-radius:3px;}
  .erow:hover{background:var(--row-hover)!important;}
  .new-glow{animation:newIn 2s ease forwards;}
  @keyframes newIn{0%{background:rgba(0,255,136,.18);box-shadow:inset 0 0 0 2px #00ff88;}80%{background:rgba(0,255,136,.04);}100%{background:transparent;box-shadow:none;}}
  @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes logIn{from{opacity:0;transform:translateX(-5px);}to{opacity:1;transform:none;}}
  @keyframes scanBar{0%{top:-4px;opacity:0;}5%{opacity:1;}95%{opacity:1;}100%{top:100%;opacity:0;}}
  @keyframes floatUp{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:none;}}
  @keyframes shimmer{0%{background-position:200% center;}100%{background-position:-200% center;}}
  .scan-wrap{position:relative;overflow:hidden;}
  .scan-wrap::after{content:'';position:absolute;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#2a9a2a,#90ee90,#2a9a2a,transparent);box-shadow:0 0 14px #2a9a2a88;animation:scanBar 1.8s linear infinite;pointer-events:none;}
  .log-line{animation:logIn .2s ease;}
  .card-ani{opacity:0;animation:floatUp .55s ease forwards;}
  .card-ani:nth-child(2){animation-delay:.13s;}
  @media print{
    body{background:white!important;color:black!important;}
    .no-print{display:none!important;}
    .ph{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .badge{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .ptitle{display:block!important;}
    .erow,.group-block{page-break-inside:avoid;}
    .group-block{margin-bottom:20px;}
  }
`;

/* ══════════════════════════════════════════════════
   GLYPH DEFINITIONS
══════════════════════════════════════════════════ */

// Skrull — angular, sharp, triangular
const skrullGlyphs = [
  (c,x,y,s)=>{
    c.beginPath();c.moveTo(x,y-s*.5);c.lineTo(x+s*.38,y+s*.3);c.lineTo(x-s*.38,y+s*.3);c.closePath();c.stroke();
    c.beginPath();c.moveTo(x,y-s*.1);c.lineTo(x,y+s*.52);c.stroke();
  },
  (c,x,y,s)=>{
    c.beginPath();c.moveTo(x-s*.42,y);c.lineTo(x-s*.15,y-s*.32);c.lineTo(x+s*.12,y+s*.32);c.lineTo(x+s*.42,y);c.stroke();
    c.beginPath();c.arc(x+s*.42,y,s*.09,0,Math.PI*2);c.fill();
  },
  (c,x,y,s)=>{
    c.beginPath();c.moveTo(x-s*.32,y-s*.42);c.lineTo(x-s*.32,y+s*.42);c.lineTo(x+s*.32,y+s*.42);c.stroke();
    c.beginPath();c.arc(x,y,s*.13,0,Math.PI*2);c.fill();
  },
  (c,x,y,s)=>{
    c.beginPath();c.moveTo(x-s*.38,y-s*.42);c.lineTo(x+s*.38,y+s*.42);c.stroke();
    c.beginPath();c.moveTo(x+s*.38,y-s*.42);c.lineTo(x-s*.38,y+s*.42);c.stroke();
    c.beginPath();c.moveTo(x-s*.42,y);c.lineTo(x+s*.42,y);c.stroke();
  },
  (c,x,y,s)=>{
    c.beginPath();c.moveTo(x-s*.42,y-s*.32);c.lineTo(x+s*.22,y);c.lineTo(x-s*.42,y+s*.32);c.stroke();
    c.beginPath();c.moveTo(x-s*.1,y-s*.32);c.lineTo(x+s*.47,y);c.lineTo(x-s*.1,y+s*.32);c.stroke();
  },
  (c,x,y,s)=>{
    c.beginPath();c.moveTo(x-s*.38,y-s*.42);c.lineTo(x,y-s*.12);c.lineTo(x+s*.38,y-s*.42);c.stroke();
    c.beginPath();c.moveTo(x-s*.38,y+s*.12);c.lineTo(x,y+s*.42);c.lineTo(x+s*.38,y+s*.12);c.stroke();
  },
];

// Celestial — cosmic, circles, hexagons, stars
const celestialGlyphs = [
  (c,x,y,s)=>{
    c.beginPath();c.arc(x,y,s*.42,0,Math.PI*2);c.stroke();
    c.beginPath();c.arc(x,y,s*.22,0,Math.PI*2);c.stroke();
    for(let i=0;i<6;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(x+Math.cos(a)*s*.22,y+Math.sin(a)*s*.22);c.lineTo(x+Math.cos(a)*s*.42,y+Math.sin(a)*s*.42);c.stroke();}
  },
  (c,x,y,s)=>{
    c.beginPath();
    for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/6;const px=x+Math.cos(a)*s*.44,py=y+Math.sin(a)*s*.44;i===0?c.moveTo(px,py):c.lineTo(px,py);}
    c.closePath();c.stroke();
    c.beginPath();c.arc(x,y,s*.13,0,Math.PI*2);c.fill();
  },
  (c,x,y,s)=>{
    c.beginPath();c.moveTo(x,y-s*.47);c.lineTo(x+s*.37,y);c.lineTo(x,y+s*.47);c.lineTo(x-s*.37,y);c.closePath();c.stroke();
    c.beginPath();c.moveTo(x-s*.37,y);c.lineTo(x+s*.37,y);c.moveTo(x,y-s*.47);c.lineTo(x,y+s*.47);c.stroke();
  },
  (c,x,y,s)=>{
    for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*s*.47,y+Math.sin(a)*s*.47);c.stroke();}
    c.beginPath();c.arc(x,y,s*.16,0,Math.PI*2);c.fill();
  },
  (c,x,y,s)=>{
    c.beginPath();c.ellipse(x,y,s*.44,s*.22,0,0,Math.PI*2);c.stroke();
    c.beginPath();c.arc(x,y,s*.13,0,Math.PI*2);c.fill();
    c.beginPath();c.moveTo(x-s*.44,y);c.lineTo(x+s*.44,y);c.stroke();
  },
  (c,x,y,s)=>{
    c.beginPath();c.moveTo(x,y-s*.47);c.lineTo(x+s*.42,y+s*.27);c.lineTo(x-s*.42,y+s*.27);c.closePath();c.stroke();
    c.beginPath();c.moveTo(x,y+s*.32);c.lineTo(x-s*.28,y-s*.17);c.lineTo(x+s*.28,y-s*.17);c.closePath();c.stroke();
  },
];

// Wakandan (Nsibidi-inspired)
const wakandanGlyphs = [
  (c,x,y,s)=>{
    c.beginPath();c.arc(x-s*.1,y,s*.32,Math.PI*.12,Math.PI*.88);c.stroke();
    c.beginPath();c.arc(x+s*.1,y,s*.32,Math.PI*1.12,Math.PI*1.88);c.stroke();
    c.beginPath();c.arc(x,y,s*.09,0,Math.PI*2);c.fill();
  },
  (c,x,y,s)=>{
    c.beginPath();c.moveTo(x,y-s*.47);c.quadraticCurveTo(x+s*.52,y,x,y+s*.47);c.quadraticCurveTo(x-s*.52,y,x,y-s*.47);c.stroke();
  },
  (c,x,y,s)=>{
    c.beginPath();c.moveTo(x-s*.22,y-s*.42);c.bezierCurveTo(x+s*.42,y-s*.22,x-s*.42,y+s*.22,x+s*.22,y+s*.42);c.stroke();
    c.beginPath();c.arc(x-s*.22,y-s*.42,s*.08,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(x+s*.22,y+s*.42,s*.08,0,Math.PI*2);c.fill();
  },
  (c,x,y,s)=>{
    c.beginPath();c.arc(x,y-s*.1,s*.32,0,Math.PI);c.stroke();
    c.beginPath();c.arc(x,y+s*.1,s*.32,Math.PI,Math.PI*2);c.stroke();
  },
  (c,x,y,s)=>{
    c.beginPath();c.arc(x,y,s*.2,0,Math.PI*2);c.stroke();
    for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.moveTo(x+Math.cos(a)*s*.24,y+Math.sin(a)*s*.24);c.lineTo(x+Math.cos(a)*s*.44,y+Math.sin(a)*s*.44);c.stroke();}
  },
  (c,x,y,s)=>{
    c.beginPath();c.moveTo(x-s*.32,y-s*.42);c.quadraticCurveTo(x-s*.1,y,x-s*.32,y+s*.42);c.stroke();
    c.beginPath();c.moveTo(x,y-s*.42);c.quadraticCurveTo(x+s*.12,y,x,y+s*.42);c.stroke();
    c.beginPath();c.moveTo(x+s*.32,y-s*.42);c.quadraticCurveTo(x+s*.12,y,x+s*.32,y+s*.42);c.stroke();
  },
];

// Infinity Stones — 6 unique symbols
const infinityGlyphs = [
  (c,x,y,s)=>{ // Space
    c.beginPath();c.rect(x-s*.3,y-s*.3,s*.6,s*.6);c.stroke();
    c.beginPath();c.moveTo(x-s*.3,y-s*.3);c.lineTo(x,y-s*.52);c.lineTo(x+s*.52,y-s*.52);c.lineTo(x+s*.3,y-s*.3);c.stroke();
    c.beginPath();c.moveTo(x+s*.3,y-s*.3);c.lineTo(x+s*.52,y-s*.52);c.lineTo(x+s*.52,y+s*.1);c.lineTo(x+s*.3,y+s*.3);c.stroke();
  },
  (c,x,y,s)=>{ // Mind
    c.beginPath();c.moveTo(x-s*.47,y);c.quadraticCurveTo(x,y-s*.37,x+s*.47,y);c.quadraticCurveTo(x,y+s*.37,x-s*.47,y);c.closePath();c.stroke();
    c.beginPath();c.arc(x,y,s*.11,0,Math.PI*2);c.fill();
    c.beginPath();c.moveTo(x,y-s*.37);c.lineTo(x,y+s*.37);c.stroke();
  },
  (c,x,y,s)=>{ // Reality
    c.beginPath();c.arc(x,y,s*.27,0,Math.PI*2);c.stroke();
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5;c.beginPath();c.moveTo(x+Math.cos(a)*s*.27,y+Math.sin(a)*s*.27);c.lineTo(x+Math.cos(a)*s*.47,y+Math.sin(a)*s*.47);c.stroke();}
  },
  (c,x,y,s)=>{ // Power
    c.beginPath();c.arc(x,y,s*.32,0,Math.PI*2);c.stroke();
    c.beginPath();c.arc(x,y,s*.13,0,Math.PI*2);c.fill();
    for(let i=0;i<4;i++){const a=i*Math.PI/2;c.beginPath();c.moveTo(x+Math.cos(a)*s*.32,y+Math.sin(a)*s*.32);c.lineTo(x+Math.cos(a)*s*.5,y+Math.sin(a)*s*.5);c.stroke();}
  },
  (c,x,y,s)=>{ // Time
    c.beginPath();c.moveTo(x-s*.32,y-s*.42);c.lineTo(x+s*.32,y-s*.42);c.lineTo(x,y);c.lineTo(x+s*.32,y+s*.42);c.lineTo(x-s*.32,y+s*.42);c.lineTo(x,y);c.closePath();c.stroke();
    c.beginPath();c.arc(x,y,s*.08,0,Math.PI*2);c.fill();
  },
  (c,x,y,s)=>{ // Soul
    c.beginPath();c.moveTo(x,y+s*.42);c.bezierCurveTo(x-s*.37,y,x-s*.37,y-s*.22,x,y-s*.47);c.bezierCurveTo(x+s*.37,y-s*.22,x+s*.37,y,x,y+s*.42);c.stroke();
    c.beginPath();c.arc(x,y+s*.06,s*.11,0,Math.PI*2);c.fill();
  },
];

const MCU_GLYPHS = [...skrullGlyphs,...celestialGlyphs,...wakandanGlyphs,...infinityGlyphs];

// Kryptonian — pentagon-based system
const kryptonianGlyphs = [
  (c,x,y,s)=>{
    c.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;const px=x+Math.cos(a)*s*.44,py=y+Math.sin(a)*s*.44;i===0?c.moveTo(px,py):c.lineTo(px,py);}c.closePath();c.stroke();
  },
  (c,x,y,s)=>{
    c.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;const px=x+Math.cos(a)*s*.44,py=y+Math.sin(a)*s*.44;i===0?c.moveTo(px,py):c.lineTo(px,py);}c.closePath();c.stroke();
    c.beginPath();c.moveTo(x,y-s*.44);c.lineTo(x,y+s*.22);c.stroke();
  },
  (c,x,y,s)=>{
    c.beginPath();c.moveTo(x-s*.22,y-s*.42);c.lineTo(x-s*.22,y+s*.42);c.stroke();
    c.beginPath();c.moveTo(x+s*.22,y-s*.42);c.lineTo(x+s*.22,y+s*.42);c.stroke();
    c.beginPath();c.moveTo(x-s*.22,y);c.lineTo(x+s*.22,y);c.stroke();
  },
  (c,x,y,s)=>{
    c.beginPath();c.moveTo(x-s*.37,y-s*.42);c.lineTo(x+s*.12,y);c.lineTo(x-s*.37,y+s*.42);c.stroke();
    c.beginPath();c.moveTo(x+s*.12,y);c.lineTo(x+s*.42,y);c.stroke();
    c.beginPath();c.arc(x+s*.42,y,s*.08,0,Math.PI*2);c.fill();
  },
  (c,x,y,s)=>{ // House of El
    c.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;const px=x+Math.cos(a)*s*.44,py=y+Math.sin(a)*s*.44;i===0?c.moveTo(px,py):c.lineTo(px,py);}c.closePath();c.stroke();
    c.beginPath();c.moveTo(x-s*.19,y-s*.27);c.bezierCurveTo(x+s*.27,y-s*.27,x-s*.27,y+s*.27,x+s*.19,y+s*.27);c.stroke();
  },
  (c,x,y,s)=>{
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*s*.47,y+Math.sin(a)*s*.47);c.stroke();}
    c.beginPath();c.arc(x,y,s*.1,0,Math.PI*2);c.fill();
  },
  (c,x,y,s)=>{
    c.beginPath();c.rect(x-s*.29,y-s*.29,s*.58,s*.58);c.stroke();
    [[-.29,-.29,-1,-1],[.29,-.29,1,-1],[.29,.29,1,1],[-.29,.29,-1,1]].forEach(([bx,by,dx,dy])=>{
      c.beginPath();c.moveTo(x+bx*s,y+by*s);c.lineTo(x+(bx+dx*.16)*s,y+(by+dy*.16)*s);c.stroke();
    });
  },
  (c,x,y,s)=>{
    c.beginPath();c.moveTo(x,y-s*.47);c.lineTo(x,y+s*.47);c.stroke();
    c.beginPath();c.moveTo(x,y-s*.22);c.lineTo(x+s*.37,y-s*.42);c.stroke();
    c.beginPath();c.moveTo(x,y+s*.22);c.lineTo(x+s*.37,y+s*.42);c.stroke();
  },
  (c,x,y,s)=>{
    c.beginPath();c.arc(x,y,s*.4,0,Math.PI*2);c.stroke();
    c.beginPath();c.moveTo(x-s*.4,y);c.lineTo(x+s*.4,y);c.moveTo(x,y-s*.4);c.lineTo(x,y+s*.4);c.stroke();
  },
  (c,x,y,s)=>{ // Zod crest
    c.beginPath();c.moveTo(x-s*.37,y-s*.42);c.lineTo(x+s*.37,y-s*.42);c.lineTo(x-s*.37,y+s*.42);c.lineTo(x+s*.37,y+s*.42);c.stroke();
    c.beginPath();c.moveTo(x-s*.37,y-s*.42);c.lineTo(x+s*.37,y-s*.42);c.moveTo(x-s*.37,y+s*.42);c.lineTo(x+s*.37,y+s*.42);c.stroke();
  },
  (c,x,y,s)=>{
    c.beginPath();c.arc(x,y-s*.06,s*.37,Math.PI,0);c.stroke();
    c.beginPath();c.moveTo(x,y+s*.32);c.lineTo(x,y+s*.47);c.stroke();
    c.beginPath();c.moveTo(x-s*.19,y+s*.32);c.lineTo(x+s*.19,y+s*.32);c.stroke();
  },
  (c,x,y,s)=>{
    [.44,.27].forEach(r=>{
      c.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;const px=x+Math.cos(a)*s*r,py=y+Math.sin(a)*s*r;i===0?c.moveTo(px,py):c.lineTo(px,py);}c.closePath();c.stroke();
    });
  },
];

const DCU_GLYPHS = kryptonianGlyphs;

/* ══════════════════════════════════════════════════
   BACKGROUND HOOK
══════════════════════════════════════════════════ */
function useBackground(canvasRef, glyphs, accentHex, active) {
  const animRef   = useRef(null);
  const stateRef  = useRef({ particles: [], W: 0, H: 0 });

  const hexToRgb = useCallback((hex) => {
    const h = hex.replace("#","");
    return {
      r: parseInt(h.slice(0,2),16),
      g: parseInt(h.slice(2,4),16),
      b: parseInt(h.slice(4,6),16),
    };
  }, []);

  const buildParticles = useCallback((W, H, glyphList) => {
    const count = Math.max(18, Math.floor(W / 80));
    return Array.from({length: count}, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H * 1.4 - H * 0.2,
      speed:     0.18 + Math.random() * 0.28,
      size:      16 + Math.random() * 22,
      phase:     Math.random() * Math.PI * 2,
      phaseSpd:  0.007 + Math.random() * 0.013,
      maxAlpha:  0.18 + Math.random() * 0.22,   // ← visible range 0.18–0.40
      rotation:  Math.random() * Math.PI * 2,
      rotSpd:    (Math.random() - 0.5) * 0.004,
      glyph:     glyphList[Math.floor(Math.random() * glyphList.length)],
    }));
  }, []);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      // Use parent dimensions so canvas fills its container
      const parent = canvas.parentElement;
      const W = parent ? parent.offsetWidth  : window.innerWidth;
      const H = parent ? parent.offsetHeight : window.innerHeight;
      canvas.width  = W;
      canvas.height = H;
      stateRef.current.W = W;
      stateRef.current.H = H;
      stateRef.current.particles = buildParticles(W, H, glyphs);
    };

    resize();
    window.addEventListener("resize", resize);

    const rgb = hexToRgb(accentHex);

    const draw = () => {
      const { W, H, particles } = stateRef.current;
      if (!W || !H) { animRef.current = requestAnimationFrame(draw); return; }

      ctx.clearRect(0, 0, W, H);

      // ── LAYER 1: fine grid ──────────────────────
      const GS = 54;
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.08)`;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += GS) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += GS) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // ── LAYER 3: falling glyphs ─────────────────
      particles.forEach(p => {
        p.y       += p.speed;
        p.phase   += p.phaseSpd;
        p.rotation+= p.rotSpd;

        if (p.y > H + 80) {
          p.y     = -80;
          p.x     = Math.random() * W;
          p.glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
        }

        const alpha = p.maxAlpha * (0.5 + 0.5 * Math.sin(p.phase));

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha.toFixed(3)})`;
        ctx.fillStyle   = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha.toFixed(3)})`;
        ctx.lineWidth   = 1.1;
        p.glyph(ctx, 0, 0, p.size);
        ctx.restore();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active, accentHex, glyphs, hexToRgb, buildParticles]);
}

/* ══════════════════════════════════════════════════
   BACKGROUND COMPONENT
══════════════════════════════════════════════════ */
function Background({ glyphs, accent, secondary }) {
  const canvasRef = useRef(null);
  useBackground(canvasRef, glyphs, accent, true);

  return (
    <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
      {/* Orb top-left */}
      <div style={{
        position:"absolute", top:"-20%", left:"-12%",
        width:"60vw", height:"60vw", borderRadius:"50%",
        background:`radial-gradient(circle, ${accent}18 0%, transparent 68%)`,
        filter:"blur(60px)",
      }}/>
      {/* Orb bottom-right */}
      <div style={{
        position:"absolute", bottom:"-20%", right:"-12%",
        width:"60vw", height:"60vw", borderRadius:"50%",
        background:`radial-gradient(circle, ${secondary}12 0%, transparent 68%)`,
        filter:"blur(60px)",
      }}/>
      {/* Canvas glyphs */}
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",display:"block"}}/>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   DATASETS
══════════════════════════════════════════════════ */
const MCU_GROUPS = [
  {key:"p1",label:"Fase 1",sub:"Infinity Saga",years:"2008–2012",color:"#8B0000"},
  {key:"p2",label:"Fase 2",sub:"Infinity Saga",years:"2013–2015",color:"#A83232"},
  {key:"p3",label:"Fase 3",sub:"Infinity Saga",years:"2016–2019",color:"#C0392B"},
  {key:"p4",label:"Fase 4",sub:"Multiverse Saga",years:"2021–2022",color:"#1a3a6b"},
  {key:"p5",label:"Fase 5",sub:"Multiverse Saga",years:"2023–2025",color:"#1f4c94"},
  {key:"p6",label:"Fase 6",sub:"Multiverse Saga",years:"2025–2026",color:"#6a0dad"},
  {key:"netflix",label:"Marvel Television — Netflix",sub:"Cânon confirmado (2024)",years:"2015–2019",color:"#111"},
];
const DCU_GROUPS = [
  {key:"snyder",label:"Snyder Universe (DCEU)",sub:"DC Extended Universe — O universo original",years:"2013–2023",color:"#1a1a2e"},
  {key:"gunn",label:"Universo Gunn — Capítulo 1: Gods & Monsters",sub:"DC Universe — James Gunn & Peter Safran",years:"2024–",color:"#003366"},
  {key:"els",label:"Elseworlds",sub:"Histórias paralelas fora do DCU canônico",years:"2019–",color:"#2a1a00"},
];

const MCU = [
  {id:1,title:"Homem de Ferro",en:"Iron Man",year:2008,grp:"p1",type:"Filme",rO:1,cO:4,set:"2010",plat:"Disney+"},
  {id:2,title:"O Incrível Hulk",en:"The Incredible Hulk",year:2008,grp:"p1",type:"Filme",rO:2,cO:6,set:"2011",plat:"Disney+"},
  {id:3,title:"Homem de Ferro 2",en:"Iron Man 2",year:2010,grp:"p1",type:"Filme",rO:3,cO:5,set:"2011",plat:"Disney+"},
  {id:4,title:"Thor",en:"Thor",year:2011,grp:"p1",type:"Filme",rO:4,cO:7,set:"2011",plat:"Disney+"},
  {id:5,title:"Capitão América: O Primeiro Vingador",en:"Captain America: The First Avenger",year:2011,grp:"p1",type:"Filme",rO:5,cO:1,set:"1942–1945",plat:"Disney+"},
  {id:6,title:"One-Shot: O Consultor",en:"One-Shot: The Consultant",year:2011,grp:"p1",type:"Curta",rO:6,cO:8,set:"2011",plat:"Blu-ray"},
  {id:7,title:"One-Shot: Uma Coisa Engraçada...",en:"One-Shot: A Funny Thing Happened...",year:2011,grp:"p1",type:"Curta",rO:7,cO:9,set:"2011",plat:"Blu-ray"},
  {id:8,title:"Os Vingadores",en:"The Avengers",year:2012,grp:"p1",type:"Filme",rO:8,cO:10,set:"2012",plat:"Disney+"},
  {id:9,title:"One-Shot: Item 47",en:"One-Shot: Item 47",year:2012,grp:"p1",type:"Curta",rO:9,cO:11,set:"2012",plat:"Blu-ray"},
  {id:10,title:"Homem de Ferro 3",en:"Iron Man 3",year:2013,grp:"p2",type:"Filme",rO:10,cO:12,set:"2013",plat:"Disney+"},
  {id:11,title:"One-Shot: Agente Carter",en:"One-Shot: Agent Carter",year:2013,grp:"p2",type:"Curta",rO:11,cO:2,set:"1946",plat:"Blu-ray"},
  {id:12,title:"Thor: O Mundo Sombrio",en:"Thor: The Dark World",year:2013,grp:"p2",type:"Filme",rO:12,cO:13,set:"2013",plat:"Disney+"},
  {id:13,title:"One-Shot: Salve o Rei",en:"One-Shot: All Hail the King",year:2014,grp:"p2",type:"Curta",rO:13,cO:14,set:"2014",plat:"Blu-ray"},
  {id:14,title:"Capitão América: O Soldado Invernal",en:"Captain America: The Winter Soldier",year:2014,grp:"p2",type:"Filme",rO:14,cO:15,set:"2014",plat:"Disney+"},
  {id:15,title:"Guardiões da Galáxia",en:"Guardians of the Galaxy",year:2014,grp:"p2",type:"Filme",rO:15,cO:16,set:"2014",plat:"Disney+"},
  {id:16,title:"Vingadores: Era de Ultron",en:"Avengers: Age of Ultron",year:2015,grp:"p2",type:"Filme",rO:16,cO:19,set:"2015",plat:"Disney+"},
  {id:17,title:"Homem-Formiga",en:"Ant-Man",year:2015,grp:"p2",type:"Filme",rO:17,cO:20,set:"2015",plat:"Disney+"},
  {id:18,title:"Capitão América: Guerra Civil",en:"Captain America: Civil War",year:2016,grp:"p3",type:"Filme",rO:18,cO:21,set:"2016",plat:"Disney+"},
  {id:19,title:"Doutor Estranho",en:"Doctor Strange",year:2016,grp:"p3",type:"Filme",rO:19,cO:25,set:"2017",plat:"Disney+"},
  {id:20,title:"Guardiões da Galáxia Vol. 2",en:"Guardians of the Galaxy Vol. 2",year:2017,grp:"p3",type:"Filme",rO:20,cO:17,set:"2014",plat:"Disney+"},
  {id:21,title:"Homem-Aranha: De Volta ao Lar",en:"Spider-Man: Homecoming",year:2017,grp:"p3",type:"Filme",rO:21,cO:24,set:"2017",plat:"Disney+"},
  {id:22,title:"Thor: Ragnarok",en:"Thor: Ragnarok",year:2017,grp:"p3",type:"Filme",rO:22,cO:26,set:"2017",plat:"Disney+"},
  {id:23,title:"Pantera Negra",en:"Black Panther",year:2018,grp:"p3",type:"Filme",rO:23,cO:23,set:"2017",plat:"Disney+"},
  {id:24,title:"Vingadores: Guerra Infinita",en:"Avengers: Infinity War",year:2018,grp:"p3",type:"Filme",rO:24,cO:27,set:"2018",plat:"Disney+"},
  {id:25,title:"Homem-Formiga e a Vespa",en:"Ant-Man and the Wasp",year:2018,grp:"p3",type:"Filme",rO:25,cO:28,set:"2018",plat:"Disney+"},
  {id:26,title:"Capitã Marvel",en:"Captain Marvel",year:2019,grp:"p3",type:"Filme",rO:26,cO:3,set:"1995",plat:"Disney+"},
  {id:27,title:"Vingadores: Ultimato",en:"Avengers: Endgame",year:2019,grp:"p3",type:"Filme",rO:27,cO:29,set:"2018→2023",plat:"Disney+"},
  {id:28,title:"Homem-Aranha: Longe de Casa",en:"Spider-Man: Far From Home",year:2019,grp:"p3",type:"Filme",rO:28,cO:36,set:"2024",plat:"Disney+"},
  {id:29,title:"WandaVision",en:"WandaVision",year:2021,grp:"p4",type:"Série",rO:29,cO:30,set:"2023",plat:"Disney+",eps:9},
  {id:30,title:"Falcão e o Soldado Invernal",en:"The Falcon and the Winter Soldier",year:2021,grp:"p4",type:"Série",rO:30,cO:31,set:"2023",plat:"Disney+",eps:6},
  {id:31,title:"Loki — T1",en:"Loki Season 1",year:2021,grp:"p4",type:"Série",rO:31,cO:32,set:"Fora do tempo",plat:"Disney+",eps:6},
  {id:32,title:"Viúva Negra",en:"Black Widow",year:2021,grp:"p4",type:"Filme",rO:32,cO:22,set:"2016",plat:"Disney+"},
  {id:33,title:"What If...? — T1",en:"What If...? Season 1",year:2021,grp:"p4",type:"Animação",rO:33,cO:33,set:"Multiverso",plat:"Disney+",eps:9},
  {id:34,title:"Shang-Chi e a Lenda dos Dez Anéis",en:"Shang-Chi and the Legend of the Ten Rings",year:2021,grp:"p4",type:"Filme",rO:34,cO:34,set:"2023/2024",plat:"Disney+"},
  {id:35,title:"Eternos",en:"Eternals",year:2021,grp:"p4",type:"Filme",rO:35,cO:35,set:"Vários/2024",plat:"Disney+"},
  {id:36,title:"Gavião Arqueiro",en:"Hawkeye",year:2021,grp:"p4",type:"Série",rO:36,cO:37,set:"Dez/2024",plat:"Disney+",eps:6},
  {id:37,title:"Homem-Aranha: Sem Volta para Casa",en:"Spider-Man: No Way Home",year:2021,grp:"p4",type:"Filme",rO:37,cO:38,set:"2024",plat:"Disney+"},
  {id:38,title:"Cavaleiro da Lua",en:"Moon Knight",year:2022,grp:"p4",type:"Série",rO:38,cO:39,set:"2025",plat:"Disney+",eps:6},
  {id:39,title:"Dr. Estranho no Multiverso da Loucura",en:"Doctor Strange in the Multiverse of Madness",year:2022,grp:"p4",type:"Filme",rO:39,cO:40,set:"2025",plat:"Disney+"},
  {id:40,title:"Ms. Marvel",en:"Ms. Marvel",year:2022,grp:"p4",type:"Série",rO:40,cO:41,set:"2025",plat:"Disney+",eps:6},
  {id:41,title:"Thor: Amor e Trovão",en:"Thor: Love and Thunder",year:2022,grp:"p4",type:"Filme",rO:41,cO:42,set:"2025",plat:"Disney+"},
  {id:42,title:"I Am Groot — T1",en:"I Am Groot Season 1",year:2022,grp:"p4",type:"Animação",rO:42,cO:18,set:"2014",plat:"Disney+",eps:5},
  {id:43,title:"She-Hulk: Defensora de Heróis",en:"She-Hulk: Attorney at Law",year:2022,grp:"p4",type:"Série",rO:43,cO:43,set:"2025",plat:"Disney+",eps:9},
  {id:44,title:"Lobisomem à Noite",en:"Werewolf by Night",year:2022,grp:"p4",type:"Especial",rO:44,cO:45,set:"2025?",plat:"Disney+"},
  {id:45,title:"Pantera Negra: Wakanda Para Sempre",en:"Black Panther: Wakanda Forever",year:2022,grp:"p4",type:"Filme",rO:45,cO:44,set:"2025",plat:"Disney+"},
  {id:46,title:"Guardiões: Especial de Natal",en:"GotG Holiday Special",year:2022,grp:"p4",type:"Especial",rO:46,cO:46,set:"Dez/2025",plat:"Disney+"},
  {id:47,title:"Homem-Formiga e a Vespa: Quantumania",en:"Ant-Man and the Wasp: Quantumania",year:2023,grp:"p5",type:"Filme",rO:47,cO:51,set:"Início 2026",plat:"Disney+"},
  {id:48,title:"Guardiões da Galáxia Vol. 3",en:"Guardians of the Galaxy Vol. 3",year:2023,grp:"p5",type:"Filme",rO:48,cO:52,set:"2026",plat:"Disney+"},
  {id:49,title:"I Am Groot — T2",en:"I Am Groot Season 2",year:2023,grp:"p5",type:"Animação",rO:49,cO:48,set:"Pós Vol.2",plat:"Disney+",eps:5},
  {id:50,title:"Invasão Secreta",en:"Secret Invasion",year:2023,grp:"p5",type:"Série",rO:50,cO:53,set:"2026",plat:"Disney+",eps:6},
  {id:51,title:"Loki — T2",en:"Loki Season 2",year:2023,grp:"p5",type:"Série",rO:51,cO:50,set:"Fora do tempo",plat:"Disney+",eps:6},
  {id:52,title:"What If...? — T2",en:"What If...? Season 2",year:2023,grp:"p5",type:"Animação",rO:52,cO:49,set:"Multiverso",plat:"Disney+",eps:9},
  {id:53,title:"As Marvels",en:"The Marvels",year:2023,grp:"p5",type:"Filme",rO:53,cO:55,set:"Late 2026",plat:"Disney+"},
  {id:54,title:"Echo",en:"Echo",year:2024,grp:"p5",type:"Série",rO:54,cO:54,set:"2026",plat:"Disney+",eps:5},
  {id:55,title:"What If...? — T3",en:"What If...? Season 3",year:2024,grp:"p5",type:"Animação",rO:55,cO:56,set:"Multiverso",plat:"Disney+",eps:8},
  {id:56,title:"Deadpool & Wolverine",en:"Deadpool & Wolverine",year:2024,grp:"p5",type:"Filme",rO:56,cO:57,set:"2026/Void",plat:"Disney+"},
  {id:57,title:"Agatha para Sempre",en:"Agatha All Along",year:2024,grp:"p5",type:"Série",rO:57,cO:58,set:"2026",plat:"Disney+",eps:9},
  {id:58,title:"Capitão América: Admirável Mundo Novo",en:"Captain America: Brave New World",year:2025,grp:"p5",type:"Filme",rO:58,cO:59,set:"Late 2026/2027",plat:"Disney+"},
  {id:59,title:"Thunderbolts*",en:"Thunderbolts*",year:2025,grp:"p5",type:"Filme",rO:59,cO:61,set:"2027",plat:"Disney+"},
  {id:60,title:"Seu Amigão Homem-Aranha — T1",en:"Your Friendly Neighborhood Spider-Man S1",year:2025,grp:"p5",type:"Animação",rO:60,cO:64,set:"Univ. alt.",plat:"Disney+",eps:10},
  {id:61,title:"Demolidor: Sem Medo — T1",en:"Daredevil: Born Again S1",year:2025,grp:"p5",type:"Série",rO:61,cO:60,set:"Late 2026/2027",plat:"Disney+",eps:9},
  {id:62,title:"Coração de Ferro",en:"Ironheart",year:2025,grp:"p5",type:"Série",rO:62,cO:47,set:"Late 2025",plat:"Disney+",eps:6},
  {id:63,title:"Eyes of Wakanda",en:"Eyes of Wakanda",year:2025,grp:"p6",type:"Animação",rO:63,cO:62,set:"Vários",plat:"Disney+",eps:4},
  {id:64,title:"Marvel Zumbis — T1",en:"Marvel Zombies S1",year:2025,grp:"p6",type:"Animação",rO:64,cO:63,set:"Univ. alt.",plat:"Disney+",eps:6},
  {id:65,title:"Quarteto Fantástico: Primeiros Passos",en:"The Fantastic Four: First Steps",year:2025,grp:"p6",type:"Filme",rO:65,cO:65,set:"Univ. alt.",plat:"Disney+"},
  {id:66,title:"Wonder Man — T1",en:"Wonder Man S1",year:2026,grp:"p6",type:"Série",rO:66,cO:66,set:"2026",plat:"Disney+",eps:6,releaseInfo:"Jan 27, 2026 ✓"},
  {id:67,title:"Demolidor: Sem Medo — T2",en:"Daredevil: Born Again S2",year:2026,grp:"p6",type:"Série",rO:67,cO:67,set:"2027",plat:"Disney+",eps:8,releaseInfo:"Mar 24, 2026 ✓"},
  {id:68,title:"VisionQuest",en:"VisionQuest",year:2026,grp:"p6",type:"Série",rO:68,cO:68,set:"2026",plat:"Disney+",releaseInfo:"2026 — a confirmar"},
  {id:69,title:"O Justiceiro: Uma Última Morte",en:"The Punisher: One Last Kill",year:2026,grp:"p6",type:"Especial",rO:69,cO:70,set:"2026/2027",plat:"Disney+",releaseInfo:"Mai/Jun 2026"},
  {id:70,title:"Seu Amigão Homem-Aranha — T2",en:"Your Friendly Neighborhood Spider-Man S2",year:2026,grp:"p6",type:"Animação",rO:70,cO:69,set:"Univ. alt.",plat:"Disney+",releaseInfo:"Outono 2026"},
  {id:71,title:"Homem-Aranha: Novo Dia",en:"Spider-Man: Brand New Day",year:2026,grp:"p6",type:"Filme",rO:71,cO:71,set:"2028",plat:"Cinema",releaseInfo:"31 Jul 2026"},
  {id:72,title:"Vingadores: Juízo Final",en:"Avengers: Doomsday",year:2026,grp:"p6",type:"Filme",rO:72,cO:72,set:"2027+",plat:"Cinema",releaseInfo:"18 Dez 2026"},
  {id:200,title:"Demolidor (Netflix) — T1",en:"Daredevil S1 (Netflix)",year:2015,grp:"netflix",type:"Série",rO:200,cO:200,set:"2015",plat:"Netflix/Disney+"},
  {id:201,title:"Jessica Jones (Netflix) — T1",en:"Jessica Jones S1 (Netflix)",year:2015,grp:"netflix",type:"Série",rO:201,cO:201,set:"2015",plat:"Netflix/Disney+"},
  {id:202,title:"Demolidor (Netflix) — T2",en:"Daredevil S2 (Netflix)",year:2016,grp:"netflix",type:"Série",rO:202,cO:202,set:"2016",plat:"Netflix/Disney+"},
  {id:203,title:"Luke Cage (Netflix) — T1",en:"Luke Cage S1 (Netflix)",year:2016,grp:"netflix",type:"Série",rO:203,cO:203,set:"2016",plat:"Netflix/Disney+"},
  {id:204,title:"Punho de Ferro (Netflix) — T1",en:"Iron Fist S1 (Netflix)",year:2017,grp:"netflix",type:"Série",rO:204,cO:204,set:"2017",plat:"Netflix/Disney+"},
  {id:205,title:"Os Defensores (Netflix)",en:"The Defenders (Netflix)",year:2017,grp:"netflix",type:"Série",rO:205,cO:205,set:"2017",plat:"Netflix/Disney+"},
  {id:206,title:"O Justiceiro (Netflix) — T1",en:"The Punisher S1 (Netflix)",year:2017,grp:"netflix",type:"Série",rO:206,cO:206,set:"2017",plat:"Netflix/Disney+"},
  {id:207,title:"Jessica Jones (Netflix) — T2",en:"Jessica Jones S2 (Netflix)",year:2018,grp:"netflix",type:"Série",rO:207,cO:207,set:"2018",plat:"Netflix/Disney+"},
  {id:208,title:"Luke Cage (Netflix) — T2",en:"Luke Cage S2 (Netflix)",year:2018,grp:"netflix",type:"Série",rO:208,cO:208,set:"2018",plat:"Netflix/Disney+"},
  {id:209,title:"Punho de Ferro (Netflix) — T2",en:"Iron Fist S2 (Netflix)",year:2018,grp:"netflix",type:"Série",rO:209,cO:209,set:"2018",plat:"Netflix/Disney+"},
  {id:210,title:"Demolidor (Netflix) — T3",en:"Daredevil S3 (Netflix)",year:2018,grp:"netflix",type:"Série",rO:210,cO:210,set:"2018",plat:"Netflix/Disney+"},
  {id:211,title:"O Justiceiro (Netflix) — T2",en:"The Punisher S2 (Netflix)",year:2019,grp:"netflix",type:"Série",rO:211,cO:211,set:"2019",plat:"Netflix/Disney+"},
  {id:212,title:"Jessica Jones (Netflix) — T3",en:"Jessica Jones S3 (Netflix)",year:2019,grp:"netflix",type:"Série",rO:212,cO:212,set:"2019",plat:"Netflix/Disney+"},
];

const DCU = [
  {id:1001,title:"Mulher Maravilha",en:"Wonder Woman",year:2017,grp:"snyder",type:"Filme",rO:1,cO:1,set:"1918",plat:"Max"},
  {id:1002,title:"Homem de Aço",en:"Man of Steel",year:2013,grp:"snyder",type:"Filme",rO:2,cO:3,set:"2013",plat:"Max"},
  {id:1003,title:"Batman vs Superman",en:"Batman v Superman: Dawn of Justice",year:2016,grp:"snyder",type:"Filme",rO:3,cO:4,set:"2015",plat:"Max"},
  {id:1004,title:"Esquadrão Suicida",en:"Suicide Squad",year:2016,grp:"snyder",type:"Filme",rO:4,cO:5,set:"2016",plat:"Max"},
  {id:1005,title:"Mulher Maravilha 1984",en:"Wonder Woman 1984",year:2020,grp:"snyder",type:"Filme",rO:5,cO:2,set:"1984",plat:"Max"},
  {id:1006,title:"Liga da Justiça",en:"Justice League",year:2017,grp:"snyder",type:"Filme",rO:6,cO:6,set:"2017",plat:"Max"},
  {id:1007,title:"Liga da Justiça de Zack Snyder",en:"Zack Snyder's Justice League",year:2021,grp:"snyder",type:"Filme",rO:7,cO:7,set:"2017",plat:"Max",note:"4h — Versão Diretor"},
  {id:1008,title:"Aquaman",en:"Aquaman",year:2018,grp:"snyder",type:"Filme",rO:8,cO:8,set:"2018",plat:"Max"},
  {id:1009,title:"Shazam!",en:"Shazam!",year:2019,grp:"snyder",type:"Filme",rO:9,cO:9,set:"2018",plat:"Max"},
  {id:1010,title:"Aves de Rapina",en:"Birds of Prey",year:2020,grp:"snyder",type:"Filme",rO:10,cO:10,set:"2020",plat:"Max"},
  {id:1011,title:"O Esquadrão Suicida",en:"The Suicide Squad",year:2021,grp:"snyder",type:"Filme",rO:11,cO:11,set:"2021",plat:"Max"},
  {id:1012,title:"Adão Negro",en:"Black Adam",year:2022,grp:"snyder",type:"Filme",rO:12,cO:12,set:"2022",plat:"Max"},
  {id:1013,title:"Shazam! Fúria dos Deuses",en:"Shazam! Fury of the Gods",year:2023,grp:"snyder",type:"Filme",rO:13,cO:13,set:"2023",plat:"Max"},
  {id:1014,title:"The Flash",en:"The Flash",year:2023,grp:"snyder",type:"Filme",rO:14,cO:14,set:"2023",plat:"Max"},
  {id:1015,title:"Besouro Azul",en:"Blue Beetle",year:2023,grp:"snyder",type:"Filme",rO:15,cO:15,set:"2023",plat:"Max"},
  {id:1016,title:"Aquaman e o Reino Perdido",en:"Aquaman and the Lost Kingdom",year:2023,grp:"snyder",type:"Filme",rO:16,cO:16,set:"2023",plat:"Max"},
  {id:2001,title:"Creature Commandos — T1",en:"Creature Commandos S1",year:2024,grp:"gunn",type:"Animação",rO:1,cO:1,set:"2024",plat:"Max",eps:7},
  {id:2002,title:"Pacificador — T2",en:"Peacemaker Season 2",year:2025,grp:"gunn",type:"Série",rO:2,cO:2,set:"2025",plat:"Max",eps:6,releaseInfo:"2025 ✓"},
  {id:2003,title:"Superman",en:"Superman",year:2025,grp:"gunn",type:"Filme",rO:3,cO:3,set:"2025",plat:"Max/Cinema",releaseInfo:"Jul 11, 2025 ✓"},
  {id:2004,title:"Supergirl",en:"Supergirl",year:2026,grp:"gunn",type:"Filme",rO:4,cO:4,set:"2026",plat:"Cinema",releaseInfo:"26 Jun 2026"},
  {id:2005,title:"Clayface",en:"Clayface",year:2026,grp:"gunn",type:"Filme",rO:5,cO:6,set:"2026",plat:"Cinema",releaseInfo:"11 Set 2026"},
  {id:2006,title:"Lanterns",en:"Lanterns",year:2026,grp:"gunn",type:"Série",rO:6,cO:5,set:"2026",plat:"Max",releaseInfo:"Pós Jul 2026"},
  {id:2007,title:"Waller",en:"Waller",year:2026,grp:"gunn",type:"Série",rO:7,cO:7,set:"2026",plat:"Max",releaseInfo:"2026 — TBD"},
  {id:2008,title:"Creature Commandos — T2",en:"Creature Commandos S2",year:2026,grp:"gunn",type:"Animação",rO:8,cO:8,set:"Pós T1",plat:"Max",releaseInfo:"2026/2027"},
  {id:2009,title:"Paradise Lost",en:"Paradise Lost",year:2027,grp:"gunn",type:"Série",rO:9,cO:9,set:"Pré-Diana",plat:"Max",releaseInfo:"TBA"},
  {id:2010,title:"Booster Gold",en:"Booster Gold",year:2027,grp:"gunn",type:"Série",rO:10,cO:10,set:"TBA",plat:"Max",releaseInfo:"TBA"},
  {id:2011,title:"O Valente e o Audaz",en:"The Brave and the Bold",year:2027,grp:"gunn",type:"Filme",rO:11,cO:11,set:"TBA",plat:"Cinema",releaseInfo:"TBA"},
  {id:2012,title:"A Autoridade",en:"The Authority",year:2027,grp:"gunn",type:"Filme",rO:12,cO:12,set:"TBA",plat:"Cinema",releaseInfo:"TBA"},
  {id:2013,title:"Pântano",en:"Swamp Thing",year:2027,grp:"gunn",type:"Filme",rO:13,cO:13,set:"TBA",plat:"Cinema",releaseInfo:"TBA"},
  {id:2014,title:"Man of Tomorrow",en:"Man of Tomorrow",year:2027,grp:"gunn",type:"Filme",rO:14,cO:14,set:"2027",plat:"Cinema",releaseInfo:"9 Jul 2027"},
  {id:2015,title:"Besouro Azul (Animação)",en:"Blue Beetle Animated",year:2026,grp:"gunn",type:"Animação",rO:15,cO:15,set:"TBA",plat:"Max",releaseInfo:"TBA 2026"},
  {id:2016,title:"Mister Miracle (Animação)",en:"Mister Miracle Animated",year:2027,grp:"gunn",type:"Animação",rO:16,cO:16,set:"TBA",plat:"Max",releaseInfo:"TBA"},
  {id:3001,title:"Coringa",en:"Joker",year:2019,grp:"els",type:"Filme",rO:1,cO:1,set:"1981",plat:"Max"},
  {id:3002,title:"The Batman",en:"The Batman",year:2022,grp:"els",type:"Filme",rO:2,cO:2,set:"2022",plat:"Max"},
  {id:3003,title:"Coringa: Loucura a Dois",en:"Joker: Folie à Deux",year:2024,grp:"els",type:"Filme",rO:3,cO:3,set:"1982",plat:"Max"},
  {id:3004,title:"O Pinguim",en:"The Penguin",year:2024,grp:"els",type:"Série",rO:4,cO:4,set:"2022",plat:"Max",eps:8},
  {id:3005,title:"The Batman Parte II",en:"The Batman: Part II",year:2027,grp:"els",type:"Filme",rO:5,cO:5,set:"TBA",plat:"Cinema",releaseInfo:"2027"},
];

const TYPE_MCU={Filme:{bg:"#C0392B22",bd:"#C0392B",tx:"#ff6b6b"},Série:{bg:"#1565C022",bd:"#1976D2",tx:"#64b5f6"},Animação:{bg:"#2E7D3222",bd:"#388E3C",tx:"#81c784"},Curta:{bg:"#F57F1722",bd:"#F57F17",tx:"#ffb300"},Especial:{bg:"#6A1B9A22",bd:"#8E24AA",tx:"#ce93d8"}};
const TYPE_DCU={Filme:{bg:"#003a8022",bd:"#1565C0",tx:"#64b5f6"},Série:{bg:"#00609022",bd:"#0097A7",tx:"#80deea"},Animação:{bg:"#F9A82522",bd:"#F9A825",tx:"#ffe57f"},Curta:{bg:"#7B1FA222",bd:"#8E24AA",tx:"#ce93d8"},Especial:{bg:"#2E7D3222",bd:"#388E3C",tx:"#81c784"}};

/* ══════════════════════════════════════════════════
   GEMINI
══════════════════════════════════════════════════ */
async function callGemini(apiKey,universe,list,onLog){
  const today=new Date().toISOString().split("T")[0];
  const isMCU=universe==="MCU";
  const prompt=isMCU
    ?`You are an MCU expert. Today is ${today}. Search the web for latest MCU news. I already have: ${list}. Find MCU projects NOT in my list. Return ONLY a JSON array (no markdown). Schema: {"id":<above 1000>,"title":"<PT>","en":"<EN>","year":<n>,"grp":"<p1|p2|p3|p4|p5|p6|netflix>","type":"<Filme|Série|Animação|Curta|Especial>","rO":<n>,"cO":<n>,"set":"<year>","plat":"<platform>","releaseInfo":"<date or TBA>","isNew":true}. If nothing new: []`
    :`You are a DC expert. Today is ${today}. Search for latest DCU news. I have: ${list}. Find DCU projects NOT in my list. Return ONLY JSON array. Schema: {"id":<above 5000>,"title":"<PT>","en":"<EN>","year":<n>,"grp":"<snyder|gunn|els>","type":"<Filme|Série|Animação|Curta|Especial>","rO":<n>,"cO":<n>,"set":"<year>","plat":"<platform>","releaseInfo":"<date or TBA>","isNew":true}. If nothing new: []`;
  onLog("🛰️ Conectando ao Gemini 2.5 Flash...");
  const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${apiKey}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],tools:[{google_search:{}}],generationConfig:{temperature:0.1}})});
  if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e?.error?.message||`HTTP ${res.status}`);}
  onLog("🌐 Google Search — varrendo novidades...");
  const data=await res.json();
  const raw=(data?.candidates?.[0]?.content?.parts||[]).map(p=>p.text||"").join("");
  onLog("🧠 Analisando...");
  const clean=raw.replace(/```json|```/gi,"").trim();
  const match=clean.match(/\[[\s\S]*\]/);
  if(!match)return[];
  return JSON.parse(match[0]);
}

/* ══════════════════════════════════════════════════
   TRACKER
══════════════════════════════════════════════════ */
function Tracker({universe,onBack,theme}){
  const isMCU=universe==="MCU";
  const BASE=isMCU?MCU:DCU;
  const GROUPS=isMCU?MCU_GROUPS:DCU_GROUPS;
  const TC=isMCU?TYPE_MCU:TYPE_DCU;
  const GLYPHS=isMCU?MCU_GLYPHS:DCU_GLYPHS;

  const [entries,setEntries]=useState(BASE);
  const [mode,setMode]=useState("release");
  const [filter,setFilter]=useState("Todos");
  const [hideNF,setHideNF]=useState(false);
  const [watched,setWatched]=useState({});
  const [search,setSearch]=useState("");
  const [apiKey,setApiKey]=useState("");
  const [showKey,setShowKey]=useState(false);
  const [updating,setUpdating]=useState(false);
  const [logs,setLogs]=useState([]);
  const [result,setResult]=useState(null);
  const [newIds,setNewIds]=useState(new Set());
  const [panel,setPanel]=useState(false);
  const logsRef=useRef(null);
  const prefix=isMCU?"mcu":"dcu";

  useEffect(()=>{(async()=>{try{
    const w=await window.storage.get(`${prefix}-w7`);if(w)setWatched(JSON.parse(w.value));
    const e=await window.storage.get(`${prefix}-e7`);if(e)setEntries(JSON.parse(e.value));
    const k=await window.storage.get("gemini-key7");if(k)setApiKey(k.value);
  }catch(_){}})();},[]);

  const sw=w=>{setWatched(w);try{window.storage.set(`${prefix}-w7`,JSON.stringify(w));}catch(_){}};
  const se=e=>{setEntries(e);try{window.storage.set(`${prefix}-e7`,JSON.stringify(e));}catch(_){}};
  const sk=k=>{setApiKey(k);try{window.storage.set("gemini-key7",k);}catch(_){}};
  const addLog=msg=>{setLogs(l=>[...l,{msg,t:Date.now()}]);setTimeout(()=>{if(logsRef.current)logsRef.current.scrollTop=9999;},40);};
  const toggle=id=>{const n={...watched,[id]:!watched[id]};if(!n[id])delete n[id];sw(n);};

  const handleUpdate=async()=>{
    if(!apiKey.trim()){setPanel(true);return;}
    setUpdating(true);setLogs([]);setResult(null);setPanel(true);
    try{
      const list=entries.map(e=>`- ${e.en} (${e.year})`).join("\n");
      const news=await callGemini(apiKey.trim(),universe,list,addLog);
      if(!news.length){addLog("✅ Lista já atualizada!");setResult({added:0,skipped:0});setUpdating(false);return;}
      addLog(`📦 ${news.length} encontrado(s)...`);
      const ids=new Set(entries.map(e=>e.id));
      const ens=new Set(entries.map(e=>e.en.toLowerCase()));
      const toAdd=[];let skip=0;
      news.forEach(n=>{if(ids.has(n.id)||ens.has(n.en?.toLowerCase())){skip++;return;}toAdd.push({...n,isNew:true});});
      if(!toAdd.length){addLog(`✅ Já constam. (${skip} duplicata(s))`);setResult({added:0,skipped:skip});setUpdating(false);return;}
      addLog(`✨ ${toAdd.length} nova(s):`);toAdd.forEach(n=>addLog(`  ➕ ${n.title} (${n.year})`));
      const merged=[...entries,...toAdd];se(merged);
      setNewIds(new Set(toAdd.map(e=>e.id)));setTimeout(()=>setNewIds(new Set()),9000);
      setResult({added:toAdd.length,skipped:skip});addLog("🎉 Concluído!");
    }catch(err){addLog(`❌ Erro: ${err.message}`);setResult({added:0,skipped:0,error:true});}
    setUpdating(false);
  };

  const filtered=useMemo(()=>{
    let l=entries;
    if(hideNF&&isMCU)l=l.filter(e=>e.grp!=="netflix");
    if(filter!=="Todos")l=l.filter(e=>e.type===filter);
    if(search.trim()){const q=search.toLowerCase();l=l.filter(e=>e.title.toLowerCase().includes(q)||(e.en||"").toLowerCase().includes(q));}
    return l;
  },[entries,filter,hideNF,search]);

  const sorted=useMemo(()=>[...filtered].sort((a,b)=>(mode==="release"?a.rO-b.rO:a.cO-b.cO)),[filtered,mode]);
  const grouped=useMemo(()=>{
    const map={};sorted.forEach(e=>{if(!map[e.grp])map[e.grp]=[];map[e.grp].push(e);});
    return GROUPS.map(g=>({...g,items:map[g.key]||[]})).filter(g=>g.items.length);
  },[sorted,GROUPS]);

  const total=entries.filter(e=>!hideNF||e.grp!=="netflix").length;
  const watchedN=Object.values(watched).filter(Boolean).length;
  const pct=total?Math.round((watchedN/total)*100):0;
  const filtW=filtered.filter(e=>watched[e.id]).length;
  const accent=theme.accent;

  return(
    <div style={{fontFamily:"'Barlow',sans-serif",minHeight:"100vh",color:"#e0e0e0",position:"relative","--accent":accent,"--row-hover":`${accent}15`}}>
      <Background glyphs={GLYPHS} accent={accent} secondary={theme.secondary}/>
      <div style={{position:"relative",zIndex:1}}>
        {/* HEADER */}
        <div className="no-print" style={{background:theme.headerBg,borderBottom:`2px solid ${accent}`,backdropFilter:"blur(14px)"}}>
          <div style={{maxWidth:1200,margin:"0 auto",padding:"18px 24px 13px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:12}}>
              <button onClick={onBack} style={{background:"transparent",border:`1px solid ${accent}55`,color:accent,borderRadius:6,padding:"6px 13px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,letterSpacing:1,cursor:"pointer"}}>← Universos</button>
              <div style={{width:42,height:42,background:accent,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"white",fontFamily:"'Bebas Neue',sans-serif",fontWeight:900,flexShrink:0}}>{isMCU?"M":"DC"}</div>
              <div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:"#fff",letterSpacing:4,lineHeight:1}}>{theme.title}</div>
                <div style={{fontSize:10,color:"#444",letterSpacing:3}}>{theme.subtitle}</div>
              </div>
              <div style={{marginLeft:"auto",display:"flex",gap:7,flexWrap:"wrap"}}>
                <button onClick={handleUpdate} disabled={updating} style={{background:updating?"#111":theme.updateBg,color:updating?"#444":theme.updateTx,border:`1px solid ${updating?"#222":theme.updateBd}`,borderRadius:7,padding:"8px 14px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,letterSpacing:1,cursor:updating?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:7}}>
                  <span style={updating?{display:"inline-block",animation:"spin 1s linear infinite"}:{}}>{updating?"⟳":"🛰️"}</span>{updating?"Buscando...":"Atualizar"}
                </button>
                <button onClick={()=>setPanel(p=>!p)} style={{background:"transparent",border:`1px solid ${accent}44`,color:accent,borderRadius:7,padding:"8px 12px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,cursor:"pointer"}}>⚙️ Gemini</button>
                <button onClick={()=>window.print()} style={{background:accent,color:"white",border:"none",borderRadius:7,padding:"8px 14px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,cursor:"pointer"}}>🖨️ PDF</button>
              </div>
            </div>
            <div style={{background:"rgba(0,0,0,0.4)",borderRadius:7,padding:"10px 14px",backdropFilter:"blur(8px)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:11,color:"#444"}}>{total} obras catalogadas</span>
                <span style={{fontSize:11,color:accent,fontWeight:700}}>{watchedN}/{total} assistidos · {pct}%</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${accent},${accent}99)`,borderRadius:2,transition:"width .4s"}}/>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="no-print" style={{background:"rgba(6,6,14,0.88)",borderBottom:"1px solid #14142a",position:"sticky",top:0,zIndex:50,backdropFilter:"blur(16px)"}}>
          <div style={{maxWidth:1200,margin:"0 auto",padding:"8px 24px",display:"flex",flexWrap:"wrap",gap:7,alignItems:"center"}}>
            <div style={{display:"flex",borderRadius:6,overflow:"hidden",border:"1px solid #1e1e30"}}>
              {[["release","🎬 Lançamento"],["chrono","⏳ Cronológico"]].map(([m,l])=>(
                <button key={m} onClick={()=>setMode(m)} style={{padding:"6px 13px",background:mode===m?accent:"transparent",color:mode===m?"white":"#555",border:"none",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700}}>{l}</button>
              ))}
            </div>
            {["Todos","Filme","Série","Animação","Curta","Especial"].map(t=>{
              const c=TC[t]||{};const a=filter===t;
              return <button key={t} onClick={()=>setFilter(t)} style={{padding:"4px 11px",borderRadius:14,border:a?`1px solid ${c.bd||accent}`:"1px solid #1e1e30",background:a?(c.bg||`${accent}22`):"transparent",color:a?(c.tx||accent):"#444",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700}}>{t}</button>;
            })}
            {isMCU&&<label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}><div onClick={()=>setHideNF(p=>!p)} style={{width:30,height:16,borderRadius:8,background:hideNF?"#444":"#E50914",position:"relative",cursor:"pointer",transition:"background .2s"}}><div style={{width:12,height:12,borderRadius:"50%",background:"white",position:"absolute",top:2,left:hideNF?2:16,transition:"left .2s"}}/></div><span style={{fontSize:10,color:hideNF?"#333":"#E50914",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,letterSpacing:1}}>NETFLIX</span></label>}
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{marginLeft:"auto",background:"rgba(255,255,255,0.05)",border:"1px solid #1e1e30",borderRadius:5,padding:"5px 11px",color:"#ddd",fontSize:12,outline:"none",width:140}}/>
            <button onClick={()=>{const n={...watched};filtered.forEach(e=>{n[e.id]=true;});sw(n);}} style={{background:"transparent",border:"1px solid #1a4a1a",color:"#4caf50",borderRadius:5,padding:"4px 9px",fontSize:10,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>✓ Marcar</button>
            <button onClick={()=>sw({})} style={{background:"transparent",border:"1px solid #4a2a2a",color:"#555",borderRadius:5,padding:"4px 9px",fontSize:10,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>✕ Limpar</button>
          </div>
          <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px 7px",fontSize:10,color:"#2a2a40"}}>
            {filtered.length} obras · <span style={{color:"#4caf50"}}>{filtW}</span> assistidas · <span style={{color:"#ff6b6b"}}>{filtered.length-filtW}</span> por assistir
          </div>
        </div>

        {/* GEMINI PANEL */}
        {panel&&<div className="no-print" style={{maxWidth:1200,margin:"12px auto 0",padding:"0 24px"}}>
          <div style={{background:"rgba(6,13,6,0.92)",border:"1px solid #1a3a1a",borderRadius:9,overflow:"hidden",backdropFilter:"blur(12px)"}}>
            <div style={{background:"rgba(9,18,9,0.95)",padding:"11px 15px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid #112011"}}>
              <span>🛰️</span><span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:"#90ee90",letterSpacing:2}}>Gemini 2.5 Flash · Google Search · Gratuito</span>
              <button onClick={()=>setPanel(false)} style={{marginLeft:"auto",background:"transparent",border:"none",color:"#444",cursor:"pointer",fontSize:15}}>✕</button>
            </div>
            <div style={{padding:"12px 15px",display:"flex",gap:9,flexWrap:"wrap",alignItems:"flex-end"}}>
              <div style={{flex:"1 1 260px"}}>
                <div style={{fontSize:10,color:"#2a6a2a",marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>CHAVE GEMINI API · aistudio.google.com</div>
                <div style={{display:"flex",gap:6}}>
                  <input type={showKey?"text":"password"} value={apiKey} onChange={e=>sk(e.target.value)} placeholder="AIzaSy..." style={{flex:1,background:"rgba(10,20,10,0.9)",border:"1px solid #1a3a1a",borderRadius:5,padding:"7px 10px",color:"#90ee90",fontSize:11,outline:"none",fontFamily:"monospace"}}/>
                  <button onClick={()=>setShowKey(p=>!p)} style={{background:"rgba(10,20,10,0.9)",border:"1px solid #1a3a1a",borderRadius:5,padding:"0 9px",color:"#2a6a2a",cursor:"pointer"}}>{showKey?"🙈":"👁️"}</button>
                  <button onClick={handleUpdate} disabled={updating||!apiKey.trim()} style={{background:(!apiKey.trim()||updating)?"rgba(10,20,10,0.9)":"linear-gradient(135deg,#1a5a1a,#2a7a2a)",color:(!apiKey.trim()||updating)?"#2a5a2a":"#90ee90",border:"1px solid #1a4a1a",borderRadius:5,padding:"7px 14px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:700,cursor:(!apiKey.trim()||updating)?"not-allowed":"pointer",whiteSpace:"nowrap"}}>{updating?"Buscando...":"🔍 Buscar"}</button>
                </div>
              </div>
              {result&&<div style={{background:result.error?"rgba(26,5,5,.9)":result.added>0?"rgba(5,21,5,.9)":"rgba(6,13,6,.9)",border:`1px solid ${result.error?"#8B0000":result.added>0?"#1a5a1a":"#112011"}`,borderRadius:7,padding:"9px 14px",textAlign:"center",minWidth:110}}>
                {result.error?<div style={{color:"#ff6b6b",fontSize:11}}>❌ Erro</div>:result.added>0?<><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:30,color:"#00ff88",lineHeight:1}}>{result.added}</div><div style={{fontSize:10,color:"#4a9a4a",letterSpacing:1}}>NOVO(S)</div></>:<><div style={{fontSize:18}}>✅</div><div style={{fontSize:10,color:"#2a6a2a",letterSpacing:1}}>ATUALIZADO</div></>}
              </div>}
            </div>
            {logs.length>0&&<div ref={logsRef} style={{margin:"0 15px 13px",background:"rgba(4,10,4,.95)",border:"1px solid #0d1f0d",borderRadius:5,padding:"8px 11px",maxHeight:120,overflowY:"auto",fontFamily:"monospace",fontSize:11}}>
              {logs.map((l,i)=><div key={l.t+i} className="log-line" style={{color:"#4a9a4a",lineHeight:1.8}}><span style={{color:"#1a4a1a",marginRight:7}}>[{new Date(l.t).toLocaleTimeString("pt-BR")}]</span>{l.msg}</div>)}
              {updating&&<span style={{color:"#2a6a2a"}}>▋</span>}
            </div>}
          </div>
        </div>}

        {/* LIST */}
        <div style={{maxWidth:1200,margin:"0 auto",padding:"16px 24px"}}>
          {grouped.map(g=>{
            const wG=g.items.filter(e=>watched[e.id]).length;
            return <div key={g.key} className="group-block" style={{marginBottom:22}}>
              <div className="ph" style={{background:`linear-gradient(135deg,${g.color}ee,${g.color}55)`,borderRadius:"9px 9px 0 0",padding:"11px 16px",display:"flex",alignItems:"center",borderLeft:`4px solid ${g.color}`,backdropFilter:"blur(8px)"}}>
                <div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:"white",letterSpacing:3}}>{g.label}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",letterSpacing:2}}>{g.sub}{g.years?` · ${g.years}`:""}</div>
                </div>
                <div style={{marginLeft:"auto",textAlign:"right"}}>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,color:"rgba(255,255,255,0.7)",fontWeight:700}}>{wG}/{g.items.length}</div>
                  <div style={{height:3,width:80,background:"rgba(255,255,255,0.15)",borderRadius:2,marginTop:3}}><div style={{height:"100%",width:g.items.length?`${(wG/g.items.length)*100}%`:"0%",background:"rgba(255,255,255,0.7)",borderRadius:2}}/></div>
                </div>
              </div>
              <div style={{border:"1px solid #14142a",borderTop:"none",borderRadius:"0 0 9px 9px",overflow:"hidden",backdropFilter:"blur(8px)"}}>
                {g.items.map((e,i)=>{
                  const isW=!!watched[e.id];const tc=TC[e.type]||TC.Filme;const isN=newIds.has(e.id);const isNew=e.year>=2025;
                  return <div key={e.id} className={`erow${isN?" new-glow":""}`} onClick={()=>toggle(e.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",background:isW?"rgba(10,20,10,0.75)":(i%2===0?"rgba(12,12,24,0.75)":"rgba(9,9,18,0.75)"),borderBottom:i<g.items.length-1?"1px solid #11111e":"none",cursor:"pointer",transition:"background .15s",opacity:isW?.6:1}}>
                    <div style={{width:28,textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:isW?"#4caf50":"#222",flexShrink:0}}>{(mode==="release"?e.rO:e.cO)<=200?(mode==="release"?e.rO:e.cO):"—"}</div>
                    <div style={{width:19,height:19,borderRadius:4,border:`2px solid ${isW?"#4caf50":"#1e1e30"}`,background:isW?"#1b5e20":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{isW&&<span style={{color:"#4caf50",fontSize:11}}>✓</span>}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:isW?"#3a6a3a":isNew?accent:"#ddd",textDecoration:isW?"line-through":"none",display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                        {e.title}
                        {isNew&&<span style={{fontSize:8,background:`${accent}22`,border:`1px solid ${accent}`,color:accent,borderRadius:3,padding:"1px 4px",fontWeight:700,letterSpacing:2}}>{e.year}</span>}
                        {isN&&<span style={{fontSize:8,background:"#00ff8822",border:"1px solid #00ff88",color:"#00ff88",borderRadius:3,padding:"1px 4px",fontWeight:700,letterSpacing:2}}>NOVO ✦</span>}
                        {e.note&&<span style={{fontSize:8,background:"#ffffff11",border:"1px solid #ffffff22",color:"#888",borderRadius:3,padding:"1px 5px"}}>{e.note}</span>}
                      </div>
                      <div style={{fontSize:9,color:"#2a2a40",marginTop:1}}>{e.year} · {e.plat}{e.eps?` · ${e.eps} eps`:""}{e.releaseInfo&&<span style={{color:`${accent}88`}}> · {e.releaseInfo}</span>}</div>
                    </div>
                    <div style={{background:tc.bg,border:`1px solid ${tc.bd}`,color:tc.tx,borderRadius:3,padding:"2px 8px",fontSize:9,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,flexShrink:0}} className="badge">{e.type}</div>
                    <div style={{fontSize:9,color:"#252535",fontFamily:"'Barlow Condensed',sans-serif",flexShrink:0,minWidth:65,textAlign:"right"}}>📅 {e.set}</div>
                  </div>;
                })}
              </div>
            </div>;
          })}
          <div className="no-print" style={{textAlign:"center",padding:"20px 0",color:"#14142a",fontSize:10,letterSpacing:2,fontFamily:"'Barlow Condensed',sans-serif"}}>
            {universe} TRACKER · {entries.length} obras · Gemini 2.5 Flash + Google Search
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SELECTOR
══════════════════════════════════════════════════ */
function Selector({onSelect}){
  const mixedGlyphs=useMemo(()=>[...MCU_GLYPHS,...DCU_GLYPHS],[]);
  const canvasRef=useRef(null);
  useBackground(canvasRef,mixedGlyphs,"#8B2020",true);

  const cards=[
    {id:"MCU",logo:"M",name:"Marvel Cinematic Universe",detail:"Infinity Saga + Multiverse Saga",count:"85 obras · Fases 1–6 · Netflix Cânon",color:"#C0392B",glow:"#C0392B55",bg:"rgba(26,0,8,0.82)",tag:"MARVEL STUDIOS",glyphs:"Skrull · Celestial · Wakandano · Infinity Stones",items:["🎬 Filmes · Séries · Animações · Especiais","🔴 Fases 1–6 + Marvel Television Netflix","🛰️ Atualização via Gemini AI"]},
    {id:"DCU",logo:"DC",name:"DC Universe",detail:"Snyder Universe · Gunn Universe · Elseworlds",count:"37 obras · DCEU + Capítulo 1 + Elseworlds",color:"#1565C0",glow:"#1565C055",bg:"rgba(0,6,15,0.82)",tag:"DC STUDIOS",glyphs:"Alfabeto Kryptoniano",items:["🎬 Filmes · Séries · Animações","🔵 DCEU (Snyder) + Gunn Ch.1 + Elseworlds","🛰️ Atualização via Gemini AI"]},
  ];

  return(
    <div style={{fontFamily:"'Barlow',sans-serif",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",position:"relative",background:"#06060e"}}>
      {/* Orbs */}
      <div style={{position:"fixed",top:"-20%",left:"-12%",width:"60vw",height:"60vw",borderRadius:"50%",background:"radial-gradient(circle,#C0392B1a 0%,transparent 68%)",filter:"blur(60px)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:"-20%",right:"-12%",width:"60vw",height:"60vw",borderRadius:"50%",background:"radial-gradient(circle,#1565C014 0%,transparent 68%)",filter:"blur(60px)",pointerEvents:"none",zIndex:0}}/>
      {/* Canvas */}
      <canvas ref={canvasRef} style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0,display:"block"}}/>

      {/* Content */}
      <div style={{position:"relative",zIndex:1,textAlign:"center",marginBottom:44}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:11,color:"#2a2a2a",letterSpacing:6,marginBottom:8}}>SELECIONE O UNIVERSO</div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:52,letterSpacing:6,lineHeight:1,
          background:"linear-gradient(135deg,#555,#ddd,#888,#fff,#666)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          backgroundSize:"300% auto",animation:"shimmer 5s linear infinite",backgroundClip:"text"}}>
          UNIVERSE TRACKER
        </div>
        <div style={{fontSize:10,color:"#252525",letterSpacing:4,marginTop:10}}>
          Skrull · Celestial · Wakandano · Infinity Stones · Kryptoniano
        </div>
      </div>

      <div style={{position:"relative",zIndex:1,display:"flex",gap:22,flexWrap:"wrap",justifyContent:"center",maxWidth:840}}>
        {cards.map(card=>(
          <div key={card.id} className="card-ani" onClick={()=>onSelect(card.id)} style={{
            background:card.bg,border:`1px solid ${card.color}44`,borderRadius:14,padding:"28px 26px",width:330,cursor:"pointer",
            boxShadow:`0 0 50px ${card.glow},0 4px 24px rgba(0,0,0,.8)`,transition:"all .3s",position:"relative",backdropFilter:"blur(18px)",
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.boxShadow=`0 0 70px ${card.glow},0 8px 32px rgba(0,0,0,.85)`;e.currentTarget.style.borderColor=card.color;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`0 0 50px ${card.glow},0 4px 24px rgba(0,0,0,.8)`;e.currentTarget.style.borderColor=`${card.color}44`;}}
          >
            <div style={{position:"absolute",top:14,right:14,fontSize:9,letterSpacing:2,color:card.color,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,background:`${card.color}18`,border:`1px solid ${card.color}44`,borderRadius:4,padding:"2px 8px"}}>{card.tag}</div>
            <div style={{width:56,height:56,background:`linear-gradient(135deg,${card.color},${card.color}88)`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"white",letterSpacing:1,marginBottom:18,boxShadow:`0 0 24px ${card.glow}`}}>{card.logo}</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"white",letterSpacing:3,lineHeight:1,marginBottom:4}}>{card.name}</div>
            <div style={{fontSize:11,color:card.color,letterSpacing:2,marginBottom:14,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600}}>{card.detail}</div>
            <div style={{height:"1px",background:`${card.color}22`,marginBottom:14}}/>
            {card.items.map((it,i)=><div key={i} style={{fontSize:12,color:"#555",marginBottom:5,display:"flex",alignItems:"center",gap:6}}><span style={{color:card.color,fontSize:10}}>▸</span>{it}</div>)}
            <div style={{marginTop:10,fontSize:9,color:"#2a2a2a",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>
              <span style={{color:`${card.color}77`}}>✦</span> Glifos: {card.glyphs}
            </div>
            <div style={{marginTop:14,fontSize:9,color:"#1e1e1e",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2}}>{card.count}</div>
            <div style={{position:"absolute",bottom:18,right:18,fontSize:20,color:`${card.color}55`}}>→</div>
          </div>
        ))}
      </div>
      <div style={{position:"relative",zIndex:1,marginTop:36,fontSize:9,color:"#181818",letterSpacing:3,fontFamily:"'Barlow Condensed',sans-serif",textAlign:"center",lineHeight:2}}>
        Progresso salvo por universo · Chave Gemini compartilhada · Powered by Google Search Grounding
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   THEMES & ROOT
══════════════════════════════════════════════════ */
const THEMES={
  MCU:{accent:"#C0392B",secondary:"#8B0000",headerBg:"rgba(13,0,16,0.9)",title:"MCU TRACKER",subtitle:"Universo Cinematográfico Marvel · Guia Completo 2026",updateBg:"linear-gradient(135deg,#1a5a1a,#2a8a2a)",updateTx:"#90ee90",updateBd:"#2a7a2a"},
  DCU:{accent:"#1565C0",secondary:"#003366",headerBg:"rgba(0,6,15,0.9)",title:"DCU TRACKER",subtitle:"DC Universe · Snyder · Gunn · Elseworlds · 2026",updateBg:"linear-gradient(135deg,#0d2a5a,#1a4a9a)",updateTx:"#90caff",updateBd:"#1a4a9a"},
};

export default function App(){
  const [universe,setUniverse]=useState(null);
  return(
    <>
      <style>{STYLES}</style>
      {!universe
        ?<Selector onSelect={setUniverse}/>
        :<Tracker universe={universe} onBack={()=>setUniverse(null)} theme={THEMES[universe]}/>
      }
    </>
  );
}
