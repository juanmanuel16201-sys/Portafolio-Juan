'use strict';
(() => {
const $ = s => document.querySelector(s);
if (!window.THREE) { $('#errMsg').hidden = false; document.querySelectorAll('.menu .btn').forEach(b => b.disabled = true); return; }
const cvs = $('#game'), hud = $('#hud'), hctx = hud.getContext('2d');
let W = 1280; const H = 720, TAU = Math.PI * 2;
const F = { x0: 96, y0: 118, x1: 1426, y1: 788 };
const FX = (F.x1 - F.x0) / 1088, FY = (F.y1 - F.y0) / 546, GAME_SPEED = 1.2;
F.cx = (F.x0 + F.x1) / 2; F.cy = (F.y0 + F.y1) / 2; F.w = F.x1 - F.x0; F.h = F.y1 - F.y0;
const GOAL = { half: 82, depth: 42, bar: 58 };
const TRICK_T = 0.5, KICK_T = 0.24, COMBO_FILL = 30, STAR_T = 18, STAR_R = 40;
const DISP = '"Bungee", Impact, sans-serif', BODY = '"Barlow Condensed", "Arial Narrow", sans-serif';
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const rand = (a, b) => a + Math.random() * (b - a);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

/* World units -> three.js units. World x runs along the field length, world y is depth (toward camera), z is height. */
const U = 0.02;
const X3 = x => (x - F.cx) * U, Z3 = y => (y - F.cy) * U;
const HW3 = F.w / 2 * U, HH3 = F.h / 2 * U, GH3 = GOAL.half * U;

/* ================= DATA ================= */
const POWERS = {
  fuego:    { name: 'Fuego',    desc: 'Tu próximo tiro arde: tumba al portero y a quien se cruce.', color: '#ff6a1a', dur: 10 },
  rayo:     { name: 'Rayo',     desc: 'Todo tu equipo corre a toda velocidad durante 6 s.',      color: '#ffe14a', dur: 6 },
  hielo:    { name: 'Hielo',    desc: 'Congela a los rivales de campo 2,5 s y les quita el balón.', color: '#8fe3ff', dur: 2.5 },
  muro:     { name: 'Muro',     desc: 'Un muro de energía tapa tu arco durante 6 s.',            color: '#d6d4e6', dur: 6 },
  tornado:  { name: 'Tornado',  desc: 'Una onda empuja y tumba a los rivales cercanos.',         color: '#b48cff', dur: 0.8 },
  fantasma: { name: 'Fantasma', desc: 'Nadie les puede robar el balón durante 6 s.',             color: '#e8f3ff', dur: 6 }
};
const TEAMS = [
  { name: 'Colombia',   short: 'COL', kind: 'Selección', kit: { shirt: '#FCD116', alt: '#003893', pattern: 'trim',    shorts: '#003893', socks: '#CE1126', num: '#003893' }, gk: '#2b2b2b', power: 'fuego',    spd: 8,  shot: 8,  ctrl: 9 },
  { name: 'Brasil',     short: 'BRA', kind: 'Selección', kit: { shirt: '#FFDC02', alt: '#009C3B', pattern: 'trim',    shorts: '#1E3F96', socks: '#ffffff', num: '#009C3B' }, gk: '#3a7bd5', power: 'fantasma', spd: 9,  shot: 8,  ctrl: 10 },
  { name: 'Argentina',  short: 'ARG', kind: 'Selección', kit: { shirt: '#ffffff', alt: '#6CACE4', pattern: 'stripes', shorts: '#141414', socks: '#ffffff', num: '#141414' }, gk: '#7d3cff', power: 'rayo',     spd: 9,  shot: 9,  ctrl: 9 },
  { name: 'Alemania',   short: 'GER', kind: 'Selección', kit: { shirt: '#f4f4f4', alt: '#141414', pattern: 'trim',    shorts: '#141414', socks: '#ffffff', num: '#141414' }, gk: '#2fbf71', power: 'hielo',    spd: 8,  shot: 9,  ctrl: 8 },
  { name: 'España',     short: 'ESP', kind: 'Selección', kit: { shirt: '#C60B1E', alt: '#FFC400', pattern: 'trim',    shorts: '#1b2a5c', socks: '#1b2a5c', num: '#FFC400' }, gk: '#f2a900', power: 'tornado',  spd: 8,  shot: 8,  ctrl: 10 },
  { name: 'Francia',    short: 'FRA', kind: 'Selección', kit: { shirt: '#1F2A4D', alt: '#ffffff', pattern: 'trim',    shorts: '#ffffff', socks: '#C8102E', num: '#ffffff' }, gk: '#e8c547', power: 'rayo',     spd: 10, shot: 8,  ctrl: 8 },
  { name: 'Portugal',   short: 'POR', kind: 'Selección', kit: { shirt: '#B5121B', alt: '#0B6E3A', pattern: 'trim',    shorts: '#0B6E3A', socks: '#B5121B', num: '#ffd23f' }, gk: '#3ddcff', power: 'fuego',    spd: 8,  shot: 10, ctrl: 8 },
  { name: 'Italia',     short: 'ITA', kind: 'Selección', kit: { shirt: '#1F5FBF', alt: '#ffffff', pattern: 'trim',    shorts: '#ffffff', socks: '#1F5FBF', num: '#ffffff' }, gk: '#3b3b3b', power: 'muro',     spd: 8,  shot: 8,  ctrl: 9 },
  { name: 'México',     short: 'MEX', kind: 'Selección', kit: { shirt: '#006847', alt: '#CE1126', pattern: 'trim',    shorts: '#ffffff', socks: '#CE1126', num: '#ffffff' }, gk: '#ff8a00', power: 'fantasma', spd: 9,  shot: 8,  ctrl: 8 },
  { name: 'Inglaterra', short: 'ENG', kind: 'Selección', kit: { shirt: '#ffffff', alt: '#1d2a6b', pattern: 'trim',    shorts: '#1d2a6b', socks: '#ffffff', num: '#1d2a6b' }, gk: '#e3d000', power: 'muro',     spd: 8,  shot: 9,  ctrl: 8 },
  { name: 'Asfalto FC', short: 'ASF', kind: 'Urbano',    kit: { shirt: '#1a1a1a', alt: '#FFD23F', pattern: 'hoops',   shorts: '#1a1a1a', socks: '#FFD23F', num: '#FFD23F' }, gk: '#ff3d7f', power: 'tornado',  spd: 9,  shot: 9,  ctrl: 8 },
  { name: 'Neón Kings', short: 'NEO', kind: 'Urbano',    kit: { shirt: '#ff3d7f', alt: '#3ddcff', pattern: 'sash',    shorts: '#1a1033', socks: '#3ddcff', num: '#1a1033' }, gk: '#7cff6b', power: 'rayo',     spd: 10, shot: 8,  ctrl: 9 },
  { name: 'Barrio Rojo',short: 'BRJ', kind: 'Urbano',    kit: { shirt: '#d7263d', alt: '#121212', pattern: 'half',    shorts: '#121212', socks: '#d7263d', num: '#f2eee3' }, gk: '#3ddcff', power: 'fuego',    spd: 9,  shot: 10, ctrl: 8 },
  { name: 'Playa Sur',  short: 'PLS', kind: 'Urbano',    kit: { shirt: '#18c3b0', alt: '#ff8a3d', pattern: 'stripes', shorts: '#ff8a3d', socks: '#18c3b0', num: '#0f2f2c' }, gk: '#b48cff', power: 'fantasma', spd: 10, shot: 8,  ctrl: 9 },
  { name: 'Callejón 11',short: 'C11', kind: 'Urbano',    kit: { shirt: '#6b7a3a', alt: '#e9e3cf', pattern: 'chevron', shorts: '#2a2a24', socks: '#e9e3cf', num: '#e9e3cf' }, gk: '#ff6a1a', power: 'hielo',    spd: 9,  shot: 9,  ctrl: 9 }
];
const ARENAS = [{ id: 'barrio', name: 'Barrio' }, { id: 'azotea', name: 'Azotea neón' }, { id: 'playa', name: 'Playa' }, { id: 'plaza', name: 'Plaza colonial' }, { id: 'puerto', name: 'Puerto' }];
const DIFF = [
  { name: 'Fácil',   spd: 0.74, tackle: 0.2,  spread: 2.4,  gk: -0.38, think: 0.35 },
  { name: 'Normal',  spd: 0.82, tackle: 0.35, spread: 1.85, gk: -0.25, think: 0.55 },
  { name: 'Difícil', spd: 0.92, tackle: 0.6,  spread: 1.35, gk: -0.1,  think: 0.85 }
];
const ALLY = { spd: 0.97, tackle: 0.75, spread: 1.15, gk: -0.03, think: 1 };
const SKINS = ['#f1c9a5', '#d9a27a', '#a96e48', '#7a4a2c', '#e7b98f', '#8c5a38'];
const HAIRS = ['#1b1410', '#3b2416', '#0e0e0e', '#6b4a2a', '#d8b36a', '#121212'];
const TRICKS = ['¡Bicicleta!', '¡Caño!', '¡Elástica!', '¡Rabona!', '¡Sombrero!', '¡Ruleta!', '¡Lambretta!', '¡Taquito!'];
function awayKit(k) { const n = parseInt(k.shirt.slice(1), 16), light = ((n >> 16 & 255) + (n >> 8 & 255) + (n & 255)) > 520; return light ? { shirt: '#1d2033', alt: k.alt, pattern: 'trim', shorts: '#1d2033', socks: k.alt, num: '#f2eee3' } : { shirt: '#f2eee3', alt: k.shirt, pattern: 'trim', shorts: k.shirt, socks: k.shirt, num: k.shirt }; }
const rgbOf = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const kitsClash = (a, b) => { const x = rgbOf(a.shirt), y = rgbOf(b.shirt); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) < 140; };
const lightKit = k => { const c = rgbOf(k.shirt); return c[0] + c[1] + c[2] > 560; };

/* ================= AUDIO ================= */
const AU = { ctx: null, on: store.get('cg_music', true), track: null, step: 0, next: 0 };
function auInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
  const c = AU.ctx = new C();
  const comp = c.createDynamicsCompressor(); comp.connect(c.destination);
  AU.master = c.createGain(); AU.master.gain.value = 0.8; AU.master.connect(comp);
  AU.music = c.createGain(); AU.music.gain.value = AU.on ? 0.42 : 0; AU.music.connect(AU.master);
  AU.sfx = c.createGain(); AU.sfx.gain.value = 0.9; AU.sfx.connect(AU.master);
  const len = c.sampleRate; const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  AU.noise = buf;
  AU.next = c.currentTime + 0.05;
  setInterval(schedule, 25);
  $('#audioHint').hidden = true;
}
const mf = n => 440 * Math.pow(2, (n - 69) / 12);
function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
function tone(type, f, t, dur, vol, dest, fEnd, filt) {
  const c = AU.ctx, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (fEnd) o.frequency.exponentialRampToValueAtTime(fEnd, t + dur);
  env(g, t, 0.005, vol, dur);
  if (filt) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = filt; fl.Q.value = 4; o.connect(fl).connect(g); } else o.connect(g);
  g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
}
function noiz(t, dur, vol, type, f, dest, q, att) {
  const c = AU.ctx, s = c.createBufferSource(); s.buffer = AU.noise;
  const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; if (q) fl.Q.value = q;
  const g = c.createGain(); env(g, t, att || 0.002, vol, dur);
  s.connect(fl).connect(g).connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + (att || 0) + 0.05);
}
const PROG = [[45, [57, 60, 64]], [41, [53, 57, 60]], [48, [55, 60, 64]], [43, [55, 59, 62]]];
const MEL = [
  [76, 0, 0, 74, 0, 0, 72, 0, 0, 0, 69, 0, 72, 0, 0, 0],
  [72, 0, 0, 72, 0, 0, 69, 0, 0, 0, 65, 0, 69, 0, 0, 0],
  [72, 0, 0, 74, 0, 0, 76, 0, 0, 0, 79, 0, 76, 0, 0, 0],
  [74, 0, 0, 72, 0, 0, 71, 0, 0, 0, 67, 0, 71, 0, 74, 0]
];
function playTrack(name) { AU.track = name; AU.step = 0; if (AU.ctx) AU.next = AU.ctx.currentTime + 0.06; }
function schedule() {
  if (!AU.track || !AU.ctx) return;
  const tempo = AU.track === 'menu' ? 96 : 106, sp = 60 / tempo / 4;
  if (AU.next < AU.ctx.currentTime - 0.2) AU.next = AU.ctx.currentTime + 0.05;
  while (AU.next < AU.ctx.currentTime + 0.12) { playStep(AU.step, AU.next); AU.next += sp; AU.step = (AU.step + 1) % 64; }
}
function playStep(s, t) {
  const M = AU.music, bar = (s >> 4) % 4, i = s & 15, [root, ch] = PROG[bar], game = AU.track === 'game';
  if (i % 4 === 0) tone('sine', 150, t, 0.16, 0.9, M, 42);
  if (i === 3 || i === 6 || i === 11 || i === 14) { noiz(t, 0.12, 0.32, 'bandpass', 1900, M, 0.8); tone('triangle', 190, t, 0.06, 0.14, M); }
  if (i % 2 === 0) noiz(t, 0.035, i % 4 === 2 ? 0.13 : 0.06, 'highpass', 7500, M); else if (game) noiz(t, 0.03, 0.04, 'highpass', 8000, M);
  if ([0, 3, 6, 8, 11, 14].includes(i)) tone('sawtooth', mf(root + ((i === 6 || i === 14) ? 12 : 0)), t, 0.18, 0.2, M, null, 520);
  if (!game) {
    if (i === 0 || i === 10) ch.forEach(n => tone('triangle', mf(n), t, 0.32, 0.06, M));
    const n = MEL[bar][i]; if (n) { tone('square', mf(n), t, 0.15, 0.05, M, null, 2400); tone('triangle', mf(n + 12), t, 0.12, 0.03, M); }
  } else {
    if (i % 2 === 1) tone('triangle', mf(ch[(i >> 1) % 3] + 12), t, 0.09, 0.05, M);
    if (i === 0) ch.forEach(n => tone('sawtooth', mf(n), t, 0.5, 0.025, M, null, 1400));
  }
}
let SILENT = false;
const sfx = {
  ok() { return AU.ctx && !SILENT; },
  kick(p = 1) { if (!this.ok()) return; const t = AU.ctx.currentTime; tone('sine', 230, t, 0.09, 0.45 * p, AU.sfx, 70); noiz(t, 0.04, 0.2 * p, 'bandpass', 1200, AU.sfx, 1); },
  touch() { if (!this.ok()) return; const t = AU.ctx.currentTime; tone('sine', 300, t, 0.05, 0.12, AU.sfx, 160); },
  whistle(n = 1) { if (!AU.ctx) return; const c = AU.ctx; for (let k = 0; k < n; k++) { const t = c.currentTime + k * 0.42; const o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), g = c.createGain(); o.type = 'sine'; o.frequency.value = 2750; l.frequency.value = 32; lg.gain.value = 140; l.connect(lg).connect(o.frequency); env(g, t, 0.01, 0.18, k === n - 1 ? 0.45 : 0.28); o.connect(g).connect(AU.sfx); o.start(t); l.start(t); o.stop(t + 0.6); l.stop(t + 0.6); } },
  crowd(v = 1) { if (!this.ok()) return; const t = AU.ctx.currentTime; noiz(t, 2.4, 0.5 * v, 'bandpass', 800, AU.sfx, 0.5, 0.25); noiz(t, 1.8, 0.25 * v, 'bandpass', 1700, AU.sfx, 0.7, 0.3); },
  power() { if (!this.ok()) return; const t = AU.ctx.currentTime; tone('sawtooth', 180, t, 0.45, 0.16, AU.sfx, 1400, 3000); noiz(t, 0.5, 0.15, 'bandpass', 3000, AU.sfx, 0.6, 0.05); },
  combo() { if (!this.ok()) return; const t = AU.ctx.currentTime; [72, 76, 79, 84, 88].forEach((n, k) => { tone('triangle', mf(n), t + k * 0.07, 0.22, 0.2, AU.sfx); tone('square', mf(n), t + k * 0.07, 0.1, 0.04, AU.sfx, null, 3000); }); },
  superShot() { if (!this.ok()) return; const t = AU.ctx.currentTime; tone('sine', 140, t, 0.7, 0.9, AU.sfx, 36); tone('sawtooth', 90, t, 0.4, 0.25, AU.sfx, 40, 800); noiz(t, 0.9, 0.5, 'lowpass', 1400, AU.sfx, 0.7, 0.01); noiz(t + 0.05, 0.6, 0.25, 'highpass', 3000, AU.sfx, 0.5, 0.02); },
  ko() { if (!this.ok()) return; const t = AU.ctx.currentTime; tone('sine', 110, t, 0.35, 0.8, AU.sfx, 45); noiz(t, 0.25, 0.35, 'lowpass', 700, AU.sfx); for (let k = 0; k < 3; k++) tone('triangle', 2100, t + 0.3 + k * 0.16, 0.1, 0.08, AU.sfx, 2900); },
  trick() { if (!this.ok()) return; const t = AU.ctx.currentTime; noiz(t, 0.18, 0.16, 'bandpass', 2600, AU.sfx, 1.4, 0.04); },
  steal() { if (!this.ok()) return; const t = AU.ctx.currentTime; tone('square', 520, t, 0.1, 0.1, AU.sfx, 240); },
  save() { if (!this.ok()) return; const t = AU.ctx.currentTime; tone('sine', 140, t, 0.22, 0.5, AU.sfx, 60); noiz(t, 0.08, 0.2, 'lowpass', 900, AU.sfx); },
  post() { if (!this.ok()) return; const t = AU.ctx.currentTime; tone('triangle', 920, t, 0.4, 0.22, AU.sfx); tone('triangle', 1380, t, 0.3, 0.12, AU.sfx); },
  bump() { if (!this.ok()) return; const t = AU.ctx.currentTime; tone('sine', 150, t, 0.06, 0.15, AU.sfx, 90); },
  orb() { if (!this.ok()) return; const t = AU.ctx.currentTime; tone('triangle', 880, t, 0.16, 0.18, AU.sfx, 1760); },
  slide() { if (!this.ok()) return; const t = AU.ctx.currentTime; noiz(t, 0.22, 0.12, 'lowpass', 900, AU.sfx); },
  tick() { if (!this.ok()) return; const t = AU.ctx.currentTime; tone('triangle', 1320, t, 0.05, 0.08, AU.sfx); }
};

/* ================= 2D helpers (kit textures + HUD) ================= */
function paintPattern(g, k, x, y, w, h) {
  g.fillStyle = k.shirt; g.fillRect(x, y, w, h); g.fillStyle = k.alt;
  switch (k.pattern) {
    case 'stripes': { const b = w / 7; for (let i = 1; i < 7; i += 2) g.fillRect(x + i * b, y, b, h); break; }
    case 'hoops': { const b = h / 7; for (let i = 1; i < 7; i += 2) g.fillRect(x, y + i * b, w, b); break; }
    case 'sash': g.beginPath(); g.moveTo(x, y + h * 0.05); g.lineTo(x + w * 0.3, y); g.lineTo(x + w, y + h * 0.72); g.lineTo(x + w, y + h); g.lineTo(x + w * 0.72, y + h); g.lineTo(x, y + h * 0.3); g.closePath(); g.fill(); break;
    case 'half': g.fillRect(x + w / 2, y, w / 2, h); break;
    case 'chevron': g.beginPath(); g.moveTo(x, y + h * 0.22); g.lineTo(x + w / 2, y + h * 0.58); g.lineTo(x + w, y + h * 0.22); g.lineTo(x + w, y + h * 0.44); g.lineTo(x + w / 2, y + h * 0.8); g.lineTo(x, y + h * 0.44); g.closePath(); g.fill(); break;
    case 'plain': break;
    default: g.fillRect(x, y, w, h * 0.1); g.fillRect(x, y + h * 0.9, w, h * 0.1);
  }
}
function kitSwatch(g, x, y, s, k) { g.save(); rr(g, x, y, s, s, 6); g.clip(); paintPattern(g, k, x, y, s, s); g.restore(); g.strokeStyle = '#f2eee3'; g.lineWidth = 2; rr(g, x, y, s, s, 6); g.stroke(); }
function canvasTex(w, h, draw, wrap) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; if (wrap) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } return t;
}
function repTex(base, rx, ry) { const t = base.clone(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.needsUpdate = true; return t; }

/* ================= 3D: shared geometry & materials ================= */
const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  head: new THREE.IcosahedronGeometry(1, 1),
  ico0: new THREE.IcosahedronGeometry(1, 0),
  cyl6: new THREE.CylinderGeometry(1, 1, 1, 6),
  cyl8: new THREE.CylinderGeometry(1, 1, 1, 8),
  cone6: new THREE.ConeGeometry(1, 1, 6),
  cone8: new THREE.ConeGeometry(1, 1, 8),
  oct: new THREE.OctahedronGeometry(1, 0),
  ring: new THREE.RingGeometry(0.86, 1, 40).rotateX(-Math.PI / 2),
  torus: new THREE.TorusGeometry(1, 0.38, 5, 9)
};
const matCache = {};
function mat(color, o) { const key = color + (o ? JSON.stringify(o) : ''); if (matCache[key]) return matCache[key]; return matCache[key] = new THREE.MeshPhongMaterial(Object.assign({ color, flatShading: true, shininess: 6, specular: 0x111111 }, o || {})); }
function mesh(geo, m, x, y, z, sx, sy, sz, parent, shadow) {
  const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); o.scale.set(sx || 1, sy == null ? (sx || 1) : sy, sz == null ? (sx || 1) : sz);
  if (shadow !== false) { o.castShadow = !!shadow; o.receiveShadow = true; }
  if (parent) parent.add(o); return o;
}
const box = (p, w, h, d, c, x, y, z, cast) => mesh(GEO.box, typeof c === 'string' ? mat(c) : c, x, y, z, w, h, d, p, cast);
const dotTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
function glowSprite(color, size, opacity) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color, transparent: true, opacity: opacity == null ? 1 : opacity, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.set(size, size, 1); return s; }

/* ================= 3D: players ================= */
function kitTextures(k) {
  const front = canvasTex(64, 80, (g, w, h) => { paintPattern(g, k, 0, 0, w, h); g.fillStyle = k.alt; g.fillRect(w * 0.36, 0, w * 0.28, 6); g.beginPath(); g.arc(w * 0.7, h * 0.28, 5, 0, TAU); g.fill(); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, h * 0.92, w, h * 0.08); });
  const side = canvasTex(64, 80, (g, w, h) => { paintPattern(g, k, 0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(0, 0, w, h); });
  return { front, side };
}
function backTexture(k, n) {
  return canvasTex(64, 80, (g, w, h) => { paintPattern(g, k, 0, 0, w, h); g.font = 'bold 40px Impact, "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.35)'; g.strokeText(n, w / 2, h * 0.55); g.fillStyle = k.num; g.fillText(n, w / 2, h * 0.55); });
}
function PM(color, list, o) { const m = new THREE.MeshPhongMaterial(Object.assign({ color, flatShading: true, shininess: 8, specular: 0x151515 }, o || {})); list.push(m); return m; }
function buildPlayer(k, look, number, gk, list, kt) {
  kt = kt || kitTextures(k);
  const skin = PM(look.skin, list), shorts = PM(k.shorts, list), socks = PM(k.socks, list), shirt = PM(k.shirt, list), alt = PM(k.alt, list);
  const boot = PM('#17171b', list), hair = PM(look.hair, list), eye = PM('#151515', list), glove = PM('#f4f3ea', list);
  const back = backTexture(k, number);
  const tm = [PM('#ffffff', list, { map: kt.side }), PM('#ffffff', list, { map: kt.side }), shirt, shirt, PM('#ffffff', list, { map: kt.front }), PM('#ffffff', list, { map: back })];
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  body.scale.setScalar(1.0);
  const hips = new THREE.Group(); hips.position.y = 0.8; body.add(hips);
  mesh(GEO.box, shorts, 0, -0.02, 0, 0.42, 0.24, 0.27, hips, true);
  const legs = [];
  for (const sd of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(sd * 0.11, -0.06, 0); hips.add(leg);
    mesh(GEO.box, shorts, 0, -0.07, 0, 0.18, 0.2, 0.2, leg, true);
    mesh(GEO.box, skin, 0, -0.26, 0, 0.13, 0.22, 0.14, leg, true);
    const knee = new THREE.Group(); knee.position.y = -0.37; leg.add(knee);
    mesh(GEO.box, socks, 0, -0.16, 0, 0.125, 0.3, 0.135, knee, true);
    mesh(GEO.box, boot, 0, -0.34, 0.05, 0.14, 0.1, 0.26, knee, true);
    mesh(GEO.box, alt, 0, -0.32, 0.05, 0.146, 0.025, 0.2, knee, false);
    legs.push({ leg, knee });
  }
  const torso = new THREE.Group(); torso.position.y = 0.08; hips.add(torso);
  const chest = new THREE.Mesh(GEO.box, tm); chest.scale.set(0.46, 0.56, 0.27); chest.position.y = 0.28; chest.castShadow = true; torso.add(chest);
  mesh(GEO.cyl6, skin, 0, 0.6, 0, 0.065, 0.1, 0.065, torso, false);
  const headG = new THREE.Group(); headG.position.y = 0.76; torso.add(headG);
  mesh(GEO.head, skin, 0, 0, 0, 0.17, 0.19, 0.17, headG, true);
  mesh(GEO.box, eye, -0.06, 0.02, 0.155, 0.035, 0.045, 0.03, headG, false);
  mesh(GEO.box, eye, 0.06, 0.02, 0.155, 0.035, 0.045, 0.03, headG, false);
  mesh(GEO.box, skin, 0, -0.03, 0.17, 0.04, 0.05, 0.04, headG, false);
  switch (look.hs) {
    case 0: mesh(GEO.head, hair, 0, 0.07, -0.02, 0.18, 0.13, 0.18, headG, false); break;
    case 1: mesh(GEO.ico0, hair, 0, 0.08, -0.03, 0.27, 0.25, 0.27, headG, true); break;
    case 2: mesh(GEO.head, hair, 0, 0.06, 0, 0.172, 0.12, 0.172, headG, false); mesh(GEO.box, hair, 0, 0.19, -0.02, 0.06, 0.13, 0.3, headG, false); break;
    case 3: mesh(GEO.head, hair, 0, 0.08, -0.005, 0.175, 0.11, 0.175, headG, false); break;
    case 4: mesh(GEO.head, hair, 0, 0.07, -0.02, 0.185, 0.13, 0.185, headG, false); mesh(GEO.box, hair, 0, -0.07, -0.13, 0.3, 0.3, 0.12, headG, false); mesh(GEO.box, alt, 0, 0.09, 0, 0.37, 0.05, 0.37, headG, false); break;
    default: mesh(GEO.cyl8, alt, 0, 0.12, 0, 0.19, 0.1, 0.19, headG, false); mesh(GEO.box, alt, 0, 0.085, -0.2, 0.2, 0.03, 0.16, headG, false);
  }
  const arms = [];
  for (const sd of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(sd * 0.3, 0.52, 0); torso.add(arm);
    mesh(GEO.box, shirt, 0, -0.07, 0, 0.15, 0.18, 0.16, arm, true);
    mesh(GEO.box, skin, 0, -0.2, 0, 0.1, 0.14, 0.1, arm, true);
    const elbow = new THREE.Group(); elbow.position.y = -0.27; arm.add(elbow);
    mesh(GEO.box, gk ? shirt : skin, 0, -0.11, 0, 0.095, 0.22, 0.095, elbow, true);
    mesh(GEO.box, gk ? glove : skin, 0, -0.26, 0, gk ? 0.14 : 0.09, 0.11, gk ? 0.14 : 0.1, elbow, true);
    arms.push({ arm, elbow });
  }
  return { root, body, hips, torso, headG, legs, arms, yaw: 0 };
}
function poseModel(md, o) {
  const r = o.run || 0, ph = o.ph || 0;
  let lt = -Math.sin(ph) * 0.85 * r, rt = Math.sin(ph) * 0.85 * r;
  let lk = (0.12 + Math.max(0, Math.cos(ph)) * 1.1) * r, rk = (0.12 + Math.max(0, -Math.cos(ph)) * 1.1) * r;
  let la = Math.sin(ph) * 0.8 * r, ra = -Math.sin(ph) * 0.8 * r, le = -0.35 - r * 0.55, re = le;
  let laz = -0.1, raz = 0.1, tx = 0.16 * r;
  if (o.gk && r < 0.3) { la = ra = -0.95; le = re = -0.55; laz = -0.4; raz = 0.4; lk = rk = 0.45; lt = rt = -0.3; tx = 0.22; }
  if (o.kick > 0) { const e = Math.sin(o.kick * Math.PI); rt = -1.55 * e + 0.35 * (1 - e); rk = 0.25 * (1 - e); lt = 0.3; lk = 0.35; la = -0.7; ra = 0.5; laz = -0.6; raz = 0.6; tx = -0.12 * e; }
  if (o.air) { lt = -1.0; lk = 1.5; rt = -0.35; rk = 1.1; }
  if (o.slide) { lt = rt = -1.4; lk = 0.05; rk = 0.6; la = ra = 0.8; laz = -0.7; raz = 0.7; tx = 0; }
  if (o.armsUp) { la = ra = -2.9; le = re = -0.2; laz = -0.35; raz = 0.35; }
  if (o.lie) { lt = rt = 0; lk = rk = 0.1; la = -0.4; ra = -2.6; le = re = 0; laz = -0.9; raz = 0.9; tx = 0; }
  md.legs[0].leg.rotation.x = lt; md.legs[1].leg.rotation.x = rt;
  md.legs[0].knee.rotation.x = lk; md.legs[1].knee.rotation.x = rk;
  md.arms[0].arm.rotation.set(la, 0, laz); md.arms[1].arm.rotation.set(ra, 0, raz);
  md.arms[0].elbow.rotation.x = le; md.arms[1].elbow.rotation.x = re;
  md.torso.rotation.x = tx + (o.lean || 0);
  md.headG.rotation.y = o.look || 0;
}
function disposeTree(obj) { obj.traverse(o => { if (o.isMesh || o.isSprite) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { if (m && !Object.values(matCache).includes(m)) { if (m.map && m.map !== dotTex) m.map.dispose(); m.dispose(); } }); } }); }

/* ================= 3D: ball ================= */
function makeBall() {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const pos = geo.attributes.position, base = new THREE.IcosahedronGeometry(1, 0).attributes.position;
  const corners = []; for (let i = 0; i < base.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(base, i).normalize(); if (!corners.some(c => c.distanceTo(v) < 1e-3)) corners.push(v); }
  const col = new Float32Array(pos.count * 3), v = new THREE.Vector3();
  for (let f = 0; f < pos.count; f += 3) {
    let dark = false; for (let k = 0; k < 3; k++) { v.fromBufferAttribute(pos, f + k).normalize(); if (corners.some(c => c.distanceTo(v) < 1e-3)) dark = true; }
    const c = dark ? 0.09 : 0.96; for (let k = 0; k < 3; k++) col.set([c, c, dark ? 0.1 : 0.94], (f + k) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ vertexColors: true, flatShading: true, shininess: 40, specular: 0x333333 }));
  m.castShadow = true; m.scale.setScalar(0.2); return m;
}

/* ================= 3D: arenas ================= */
const TH3 = {
  plaza: { sky: ['#3d86d6', '#8fc8ef', '#ffe0b3'], fog: '#efdcc2', fogN: 55, fogF: 175, hemi: ['#fff1dc', '#a8845a', 0.62], sun: ['#ffe3b8', 0.85, [-14, 18, 9]], amb: 0.08,
    ground: '#a58a66', wall: '#d8c3a0', wallTop: '#b8875a', frame: '#ffffff', net: 'rgba(40,30,20,.8)', crowd: ['#e8b04a', '#d9534f', '#4fa3d1', '#ffffff', '#8bc34a', '#f06292', '#ffd23f'] },
  puerto: { sky: ['#0d1730', '#2b3f6b', '#e9864e'], fog: '#2c3048', fogN: 38, fogF: 135, hemi: ['#a3b6ff', '#2b2230', 0.62], sun: ['#ffbe8a', 0.8, [8, 16, 9]], amb: 0.14,
    ground: '#4b4f55', wall: '#35526f', wallTop: '#ffc400', frame: '#f2eee3', net: 'rgba(255,255,255,.85)', crowd: ['#ff8a3d', '#ffd23f', '#3a7bd5', '#f2eee3', '#2fbf71', '#d7263d', '#1a1a1a'] },
  barrio: { sky: ['#1c1036', '#5a2a55', '#e0703e'], fog: '#5c3048', fogN: 34, fogF: 110, hemi: ['#ffc6a0', '#3a2840', 0.75], sun: ['#ffd3a6', 0.85, [-9, 16, 9]], amb: 0.18,
    ground: '#3c3b40', wall: '#77726a', wallTop: '#9a948a', frame: '#f4f1e8', net: 'rgba(255,255,255,.85)', crowd: ['#d7263d', '#ffd23f', '#3a7bd5', '#f2eee3', '#2fbf71', '#1a1a1a', '#ff8a3d'] },
  azotea: { sky: ['#050211', '#160a36', '#3a1760'], fog: '#150b30', fogN: 40, fogF: 140, hemi: ['#7d6bff', '#120822', 0.6], sun: ['#bcd2ff', 0.75, [6, 18, 10]], amb: 0.14,
    ground: '#1b1932', wall: '#231d47', wallTop: '#ff3d7f', frame: '#f2eee3', net: 'rgba(140,235,255,.9)', crowd: ['#ff3d7f', '#3ddcff', '#7a63ff', '#ffd23f', '#2a2350', '#f2eee3'] },
  playa:  { sky: ['#2f8fdc', '#78c6ee', '#d7f1f7'], fog: '#cdebf3', fogN: 60, fogF: 190, hemi: ['#cfeeff', '#b89a68', 0.55], sun: ['#fff1d6', 0.78, [-12, 20, 6]], amb: 0.06,
    ground: '#d4b47a', wall: '#8e5b2e', wallTop: '#b9824b', frame: '#ffffff', net: 'rgba(30,30,30,.85)', crowd: ['#ff8a3d', '#18c3b0', '#ffd23f', '#ffffff', '#ff3d7f', '#3a7bd5'] }
};
function fieldTextures(id, R) {
  const TW = 2048, TH = 1024, kx = TW / F.w, ky = TH / F.h;
  const lines = (g, col, w) => {
    g.save(); g.scale(kx, ky); g.translate(-F.x0, -F.y0); g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'round';
    g.strokeRect(F.x0 + 10, F.y0 + 10, F.w - 20, F.h - 20);
    g.beginPath(); g.moveTo(F.cx, F.y0 + 10); g.lineTo(F.cx, F.y1 - 10); g.stroke();
    g.beginPath(); g.ellipse(F.cx, F.cy, 82, 82, 0, 0, TAU); g.stroke();
    g.beginPath(); g.ellipse(F.x0 + 10, F.cy, 150, 150, 0, -Math.PI / 2, Math.PI / 2); g.stroke();
    g.beginPath(); g.ellipse(F.x1 - 10, F.cy, 150, 150, 0, Math.PI / 2, Math.PI * 1.5); g.stroke();
    g.fillStyle = col; for (const x of [F.cx, F.x0 + 120, F.x1 - 120]) { g.beginPath(); g.ellipse(x, F.cy, 5, 5, 0, 0, TAU); g.fill(); }
    g.restore();
  };
  const map = canvasTex(TW, TH, (g) => {
    if (id === 'barrio') {
      g.fillStyle = '#34363d'; g.fillRect(0, 0, TW, TH);
      for (let i = 0; i < 60000; i++) { g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.14)'; g.fillRect(R() * TW, R() * TH, 2.2, 2.2); }
      for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(0,0,0,.14)'; g.beginPath(); g.ellipse(R() * TW, R() * TH, 80 + R() * 160, 40 + R() * 90, R() * 3, 0, TAU); g.fill(); }
      g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2.5;
      for (let i = 0; i < 18; i++) { let x = R() * TW, y = R() * TH; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 7; k++) { x += R() * 60 - 30; y += R() * 60 - 30; g.lineTo(x, y); } g.stroke(); }
      g.fillStyle = 'rgba(255,61,127,.16)'; g.font = `200px ${DISP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.save(); g.translate(TW * 0.5, TH * 0.5); g.fillText('SUPER', 0, -250); g.restore();
      lines(g, 'rgba(240,236,222,.9)', 5);
    } else if (id === 'azotea') {
      g.fillStyle = '#1b2252'; g.fillRect(0, 0, TW, TH);
      g.fillStyle = '#232c68'; g.fillRect(TW * 0.055, TH * 0.09, TW * 0.89, TH * 0.82);
      g.strokeStyle = 'rgba(61,220,255,.08)'; g.lineWidth = 2;
      for (let x = 0; x < TW; x += 90) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, TH); g.stroke(); }
      for (let y = 0; y < TH; y += 90) { g.beginPath(); g.moveTo(0, y); g.lineTo(TW, y); g.stroke(); }
      for (let i = 0; i < 20000; i++) { g.fillStyle = 'rgba(255,255,255,.03)'; g.fillRect(R() * TW, R() * TH, 2, 2); }
      lines(g, '#66e8ff', 5);
    } else if (id === 'plaza') {
      g.fillStyle = '#7d6a50'; g.fillRect(0, 0, TW, TH);
      const sw = 34, sh = 26;
      for (let y = 0, row = 0; y < TH + sh; y += sh, row++) for (let x = -(row % 2) * sw / 2; x < TW; x += sw) { const v = (R() * 34) | 0; g.fillStyle = `rgb(${164 + v},${142 + v},${108 + v})`; rr(g, x + 2, y + 2, sw - 4, sh - 4, 8); g.fill(); g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x + 6, y + 5, sw - 14, 3); }
      g.save(); g.translate(TW / 2, TH / 2); g.strokeStyle = 'rgba(120,80,45,.45)'; g.lineWidth = 10; for (let k = 0; k < 8; k++) { g.rotate(Math.PI / 4); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 120); g.stroke(); } g.restore();
      lines(g, 'rgba(255,255,255,.93)', 7);
    } else if (id === 'puerto') {
      g.fillStyle = '#5d6166'; g.fillRect(0, 0, TW, TH);
      for (let i = 0; i < 60000; i++) { g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.12)'; g.fillRect(R() * TW, R() * TH, 2.2, 2.2); }
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; for (let x = 0; x <= TW; x += 256) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, TH); g.stroke(); } for (let y = 0; y <= TH; y += 256) { g.beginPath(); g.moveTo(0, y); g.lineTo(TW, y); g.stroke(); }
      for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(10,10,20,.22)'; g.beginPath(); g.ellipse(R() * TW, R() * TH, 50 + R() * 120, 30 + R() * 60, R() * 3, 0, TAU); g.fill(); }
      const band = 16; g.save(); g.beginPath(); g.rect(0, 0, TW, band); g.rect(0, TH - band, TW, band); g.rect(0, 0, band, TH); g.rect(TW - band, 0, band, TH); g.clip(); g.fillStyle = '#ffc400'; g.fillRect(0, 0, TW, TH); g.fillStyle = '#151515'; for (let x = -TH; x < TW + TH; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 20, 0); g.lineTo(x + 20 + TH, TH); g.lineTo(x + TH, TH); g.closePath(); g.fill(); } g.restore();
      lines(g, '#f4f1e8', 5);
    } else {
      g.fillStyle = '#ddbf86'; g.fillRect(0, 0, TW, TH);
      for (let i = 0; i < 90000; i++) { g.fillStyle = R() < 0.6 ? 'rgba(150,105,45,.13)' : 'rgba(255,255,255,.32)'; g.fillRect(R() * TW, R() * TH, 2.4, 2.4); }
      g.strokeStyle = 'rgba(160,115,55,.2)'; g.lineWidth = 4;
      for (let k = 0; k < 16; k++) { const yy = 30 + k * 64; g.beginPath(); for (let x = 0; x <= TW; x += 24) g.lineTo(x, yy + Math.sin(x / 110 + k) * 14); g.stroke(); }
      lines(g, '#ffffff', 7);
    }
  });
  const emi = id === 'azotea' ? canvasTex(TW, TH, (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, TW, TH); lines(g, '#66e8ff', 6); }) : null;
  return { map, emi };
}
function windowTex(R, wallCol, litCols, darkCol, cols, rows, litP) {
  const mk = (emi) => canvasTex(128, 256, (g, w, h) => {
    g.fillStyle = emi ? '#000' : wallCol; g.fillRect(0, 0, w, h);
    const cw = w / cols, rh = h / rows; const RR = rng(cols * 97 + rows * 13 + litP * 1000 + (wallCol.charCodeAt(2) || 0));
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const lit = RR() < litP, lc = litCols[(RR() * litCols.length) | 0]; g.fillStyle = lit ? lc : (emi ? '#000' : darkCol); g.fillRect(c * cw + cw * 0.22, r * rh + rh * 0.22, cw * 0.56, rh * 0.52); if (!emi) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(c * cw + cw * 0.18, r * rh + rh * 0.74, cw * 0.64, rh * 0.06); } }
  });
  return { map: mk(false), emi: mk(true) };
}
function building(g, R, x, z, w, h, d, st) {
  const cols = Math.max(2, Math.round(w / 1.0)), rows = Math.max(3, Math.round(h / 1.2));
  const wall = st.walls[(R() * st.walls.length) | 0];
  const t = windowTex(R, wall, st.lit, st.dark, cols, rows, st.litP);
  const m = new THREE.MeshPhongMaterial({ map: t.map, emissive: 0xffffff, emissiveMap: t.emi, emissiveIntensity: st.emiI, flatShading: true, shininess: 4 });
  const roof = mat(st.roof);
  const b = new THREE.Mesh(GEO.box, [m, m, roof, roof, m, m]); b.scale.set(w, h, d); b.position.set(x, h / 2, z); b.receiveShadow = true; g.add(b);
  box(g, w + 0.2, 0.25, d + 0.2, st.roof, x, h + 0.12, z);
  if (R() < 0.45) { mesh(GEO.cyl8, mat('#3a2c2a'), x + w * 0.2, h + 0.9, z, 0.6, 1.3, 0.6, g); mesh(GEO.cone8, mat('#3a2c2a'), x + w * 0.2, h + 1.8, z, 0.7, 0.5, 0.7, g); }
  if (R() < 0.4) { mesh(GEO.cyl6, mat('#222'), x - w * 0.25, h + 1.4, z, 0.04, 2.6, 0.04, g); if (st.beacon) { const s = glowSprite('#ff3d5a', 1.2, 0.9); s.position.set(x - w * 0.25, h + 2.8, z); g.add(s); st.beacons.push(s); } }
  return b;
}
function chainTex() { return canvasTex(64, 64, (g) => { g.clearRect(0, 0, 64, 64); g.strokeStyle = 'rgba(210,214,222,1)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(64, 64); g.moveTo(64, 0); g.lineTo(0, 64); g.stroke(); }, true); }
function netTex(col) { return canvasTex(32, 32, (g) => { g.clearRect(0, 0, 32, 32); g.strokeStyle = col; g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(32, 32); g.moveTo(32, 0); g.lineTo(0, 32); g.stroke(); }, true); }
function textPlane(text, col, w, h, font) {
  const t = canvasTex(512, 128, (g) => { g.clearRect(0, 0, 512, 128); g.font = font || `76px ${DISP}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = col; g.shadowBlur = 26; g.fillStyle = col; g.fillText(text, 256, 68); g.shadowBlur = 8; g.fillStyle = '#ffffff'; g.globalAlpha = 0.75; g.fillText(text, 256, 68); });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
}
function buildGoal(side, th) {
  const g = new THREE.Group(), dir = side === 0 ? -1 : 1, x0 = dir * HW3, hw = GH3, d = GOAL.depth * U, hb = GOAL.bar * U, xb = x0 + dir * d;
  const pm = new THREE.MeshPhongMaterial({ color: th.frame, shininess: 70, specular: 0x777777 });
  const cyl = (len, x, y, z, rx, rz, r) => { const m = new THREE.Mesh(GEO.cyl8, pm); m.scale.set(r || 0.055, len, r || 0.055); m.position.set(x, y, z); m.rotation.set(rx || 0, 0, rz || 0); m.castShadow = true; g.add(m); return m; };
  cyl(hb, x0, hb / 2, -hw); cyl(hb, x0, hb / 2, hw); cyl(2 * hw + 0.11, x0, hb, 0, Math.PI / 2);
  cyl(2 * hw, xb, hb, 0, Math.PI / 2, 0, 0.03); cyl(hb, xb, hb / 2, -hw, 0, 0, 0.03); cyl(hb, xb, hb / 2, hw, 0, 0, 0.03);
  cyl(d, x0 + dir * d / 2, hb, -hw, 0, Math.PI / 2, 0.03); cyl(d, x0 + dir * d / 2, hb, hw, 0, Math.PI / 2, 0.03); cyl(2 * hw, xb, 0.03, 0, Math.PI / 2, 0, 0.03);
  const base = netTex(th.net);
  const nm = (rx, ry) => new THREE.MeshLambertMaterial({ map: repTex(base, rx, ry), transparent: true, alphaTest: 0.3, side: THREE.DoubleSide });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(2 * hw, hb), nm(2 * hw / 0.16, hb / 0.16)); back.position.set(xb, hb / 2, 0); back.rotation.y = Math.PI / 2; g.add(back);
  for (const sz of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(d, hb), nm(d / 0.16, hb / 0.16)); p.position.set(x0 + dir * d / 2, hb / 2, sz * hw); g.add(p); }
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(d, 2 * hw), nm(d / 0.16, 2 * hw / 0.16)); roof.rotation.x = -Math.PI / 2; roof.position.set(x0 + dir * d / 2, hb, 0); g.add(roof);
  const shade = new THREE.Mesh(new THREE.PlaneGeometry(d, 2 * hw), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25, depthWrite: false })); shade.rotation.x = -Math.PI / 2; shade.position.set(x0 + dir * d / 2, 0.012, 0); g.add(shade);
  g.userData = { back, baseX: xb, dir };
  return g;
}
function crowdBuild(g, th, R, spots) {
  const N = spots.length;
  const bodies = new THREE.InstancedMesh(GEO.box, new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, shininess: 4 }), N);
  const heads = new THREE.InstancedMesh(GEO.ico0, new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, shininess: 4 }), N);
  const arms = new THREE.InstancedMesh(GEO.box, new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true, shininess: 4 }), N);
  const col = new THREE.Color(), people = [];
  spots.forEach((s, i) => {
    const c = th.crowd[(R() * th.crowd.length) | 0], sk = SKINS[(R() * 6) | 0];
    bodies.setColorAt(i, col.set(c)); heads.setColorAt(i, col.set(sk)); arms.setColorAt(i, col.set(sk));
    people.push({ x: s[0], y: s[1], z: s[2], ry: s[3] || 0, ph: R() * TAU, h: 0.9 + R() * 0.2, w: 0.85 + R() * 0.3, armsUp: R() < 0.35 });
  });
  bodies.castShadow = false; bodies.receiveShadow = true;
  g.add(bodies, heads, arms);
  const dm = new THREE.Object3D();
  const update = (t, cheer) => {
    for (let i = 0; i < N; i++) {
      const p = people[i], jump = Math.abs(Math.sin(t * 9 + p.ph)) * (0.06 + cheer * 0.35), y = p.y + jump;
      dm.position.set(p.x, y + 0.3 * p.h, p.z); dm.rotation.set(0, p.ry, 0); dm.scale.set(0.38 * p.w, 0.6 * p.h, 0.28); dm.updateMatrix(); bodies.setMatrixAt(i, dm.matrix);
      dm.position.set(p.x, y + 0.6 * p.h + 0.17, p.z); dm.scale.set(0.16, 0.18, 0.16); dm.rotation.set(0, p.ry + t * 0.3, 0); dm.updateMatrix(); heads.setMatrixAt(i, dm.matrix);
      const up = p.armsUp || cheer > 0.3;
      dm.position.set(p.x, y + (up ? 0.85 : 0.35) * p.h, p.z); dm.rotation.set(0, p.ry, 0); dm.scale.set(up ? 0.5 : 0.48 * p.w, up ? 0.34 : 0.1, 0.1); dm.updateMatrix(); arms.setMatrixAt(i, dm.matrix);
    }
    bodies.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = arms.instanceMatrix.needsUpdate = true;
  };
  return update;
}
function bleacherSpots(g, R, stepCol) {
  const spots = [];
  for (let r = 0; r < 4; r++) {
    const z = -HH3 - 0.95 - r * 0.78, top = 0.3 + r * 0.42;
    box(g, 2 * HW3 + 8, top, 0.78, stepCol, 0, top / 2, z);
    for (let x = -HW3 - 3.6; x < HW3 + 3.6; x += 0.5 + R() * 0.25) if (R() < 0.86) spots.push([x + rand(-0.06, 0.06), top, z + rand(-0.1, 0.1), 0]);
  }
  for (const sx of [-1, 1]) for (let r = 0; r < 2; r++) {
    const x = sx * (HW3 + 2.6 + r * 0.8), top = 0.3 + r * 0.42;
    box(g, 0.8, top, 2 * HH3, stepCol, x, top / 2, 0);
    for (let z = -HH3 + 0.5; z < HH3 - 0.5; z += 0.55 + R() * 0.2) if (R() < 0.8) spots.push([x, top, z, -sx * Math.PI / 2]);
  }
  return spots;
}
function buildWalls(g, th, id) {
  const len = 2 * HW3 + 0.5, farH = 1.0, sideH = 0.85, nearH = 0.32;
  let farTex;
  if (id === 'barrio') farTex = canvasTex(2048, 96, (c, w, h) => { c.fillStyle = th.wall; c.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { c.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.1)'; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    const tags = ['GOL', 'BARRIO 23', 'CRACK', 'SUPER GOL', 'PARCHE', '10', 'FÚTBOL', 'LA 23'], cols = ['#ff3d7f', '#3ddcff', '#ffd23f', '#7cff6b', '#b48cff', '#ff8a3d'];
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    for (let i = 0; i < 8; i++) { c.save(); c.translate(130 + i * 255, h / 2); c.rotate((Math.random() - 0.5) * 0.15); c.font = `${52 + Math.random() * 14 | 0}px ${DISP}`; c.lineWidth = 9; c.strokeStyle = 'rgba(10,10,12,.85)'; c.strokeText(tags[i], 0, 0); c.fillStyle = cols[i % cols.length]; c.fillText(tags[i], 0, 0); c.restore(); } });
  else if (id === 'azotea') farTex = canvasTex(2048, 96, (c, w, h) => { c.fillStyle = th.wall; c.fillRect(0, 0, w, h); c.font = `52px ${DISP}`; c.textAlign = 'center'; c.textBaseline = 'middle'; for (let i = 0; i < 4; i++) { c.shadowColor = i % 2 ? '#ff3d7f' : '#3ddcff'; c.shadowBlur = 18; c.fillStyle = c.shadowColor; c.fillText(i % 2 ? 'STREET 4V4' : 'SUPER GOL', (i + 0.5) * w / 4, h / 2); } });
  else if (id === 'plaza') farTex = canvasTex(2048, 96, (c, w, h) => { c.fillStyle = th.wall; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) { c.fillStyle = (x / 64) % 2 ? '#2f6fa3' : '#f4ead8'; c.fillRect(x, 0, 64, 14); c.fillRect(x + 32, h - 14, 32, 14); } c.font = `46px ${DISP}`; c.textAlign = 'center'; c.textBaseline = 'middle'; const t = ['PLAZA MAYOR', 'SUPER GOL', 'FIESTA'], cl = ['#b5562f', '#2f6fa3', '#d9534f']; for (let i = 0; i < 3; i++) { c.fillStyle = cl[i]; c.fillText(t[i], (i + 0.5) * w / 3, h / 2 + 2); } });
  else if (id === 'puerto') farTex = canvasTex(2048, 96, (c, w, h) => { c.fillStyle = th.wall; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 12) { c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x, 0, 5, h); } c.font = `48px ${DISP}`; c.textAlign = 'center'; c.textBaseline = 'middle'; const t = ['PUERTO 7', 'SUPER GOL', 'CARGA'], cl = ['#ffc400', '#f2eee3', '#ff8a3d']; for (let i = 0; i < 3; i++) { c.fillStyle = cl[i]; c.fillText(t[i], (i + 0.5) * w / 3, h / 2 + 2); } });
  else farTex = canvasTex(2048, 96, (c, w, h) => { c.fillStyle = th.wall; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let y = 16; y < h; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } c.font = `46px ${DISP}`; c.textAlign = 'center'; c.textBaseline = 'middle'; const cols = ['#ff8a3d', '#18c3b0', '#ffd23f']; for (let i = 0; i < 3; i++) { const x = (i + 0.5) * w / 3; c.fillStyle = '#f7ecd0'; c.fillRect(x - 260, 18, 520, 60); c.fillStyle = cols[i]; c.fillText(['PLAYA SUR', 'SUPER GOL', 'COPA ARENA'][i], x, 50); } });
  const wm = mat(th.wall), topM = id === 'azotea' ? new THREE.MeshBasicMaterial({ color: th.wallTop }) : mat(th.wallTop);
  const farM = new THREE.MeshPhongMaterial({ map: farTex, flatShading: true, shininess: 4, emissive: id === 'azotea' ? 0xffffff : 0x000000, emissiveMap: id === 'azotea' ? farTex : null, emissiveIntensity: 0.6 });
  const far = new THREE.Mesh(GEO.box, [wm, wm, topM, wm, farM, wm]); far.scale.set(len, farH, 0.25); far.position.set(0, farH / 2, -HH3 - 0.125); far.receiveShadow = true; g.add(far);
  box(g, len, 0.06, 0.3, topM, 0, farH + 0.03, -HH3 - 0.125, false);
  const segL = HH3 - GH3;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(g, 0.25, sideH, segL, wm, sx * (HW3 + 0.125), sideH / 2, sz * (GH3 + segL / 2), true);
    box(g, 0.3, 0.06, segL, topM, sx * (HW3 + 0.125), sideH + 0.03, sz * (GH3 + segL / 2), false);
  }
  box(g, len, nearH, 0.2, wm, 0, nearH / 2, HH3 + 0.1);
  box(g, len, 0.05, 0.25, topM, 0, nearH + 0.025, HH3 + 0.1, false);
  for (const sx of [-1, 1]) {
    box(g, 0.25, 1.4, 2 * HH3 + 0.5, wm, sx * (HW3 + 1.25), 0.7, 0);
    for (const sz of [-1, 1]) box(g, 1.25, sideH, 0.25, wm, sx * (HW3 + 0.62), sideH / 2, sz * (HH3 + 0.12));
    for (const sz of [-1, 1]) box(g, 0.36, farH + 0.25, 0.36, th.wallTop, sx * (HW3 + 0.15), (farH + 0.25) / 2, sz * (HH3 + 0.15), true);
  }
  if (id === 'barrio') {
    const ct = chainTex(), fm = (w, h) => new THREE.MeshPhongMaterial({ map: repTex(ct, w / 0.35, h / 0.35), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, color: '#b8bcc6', shininess: 30 });
    const fh = 2.6;
    const ff = new THREE.Mesh(new THREE.PlaneGeometry(len, fh), fm(len, fh)); ff.position.set(0, farH + fh / 2, -HH3 - 0.12); g.add(ff);
    for (const sx of [-1, 1]) { const sf = new THREE.Mesh(new THREE.PlaneGeometry(2 * HH3 + 0.5, 2.2), fm(2 * HH3, 2.2)); sf.rotation.y = Math.PI / 2; sf.position.set(sx * (HW3 + 1.25), 1.4 + 1.1, 0); g.add(sf); }
    for (let x = -len / 2; x <= len / 2 + 0.01; x += len / 8) mesh(GEO.cyl6, mat('#5b5e66'), x, (farH + fh) / 2, -HH3 - 0.1, 0.05, farH + fh, 0.05, g, true);
    mesh(GEO.cyl6, mat('#5b5e66'), 0, farH + fh, -HH3 - 0.1, 0.04, len, 0.04, g).rotation.z = Math.PI / 2;
  }
  if (id === 'azotea') {
    const neon = new THREE.MeshBasicMaterial({ color: '#ff3d7f' });
    box(g, len, 0.05, 0.05, neon, 0, nearH + 0.08, HH3 + 0.22, false);
    for (const sx of [-1, 1]) box(g, 0.05, 0.05, 2 * HH3 + 0.5, neon, sx * (HW3 + 1.25), 1.43, 0, false);
  }
}
function palm(g, x, z, h, lean, R) {
  const grp = new THREE.Group(); grp.position.set(x, 0, z); grp.rotation.y = R() * TAU;
  let px = 0, py = 0; const seg = 6, trunk = mat('#8a6236');
  for (let i = 0; i < seg; i++) { const len = h / seg, ang = lean * (i + 1) / seg, r = 0.2 - i * 0.02; const m = mesh(GEO.cyl6, trunk, px + Math.sin(ang) * len / 2, py + Math.cos(ang) * len / 2, 0, r, len * 1.05, r, grp, true); m.rotation.z = -ang; px += Math.sin(ang) * len; py += Math.cos(ang) * len; }
  for (let k = 0; k < 7; k++) { const p = new THREE.Group(); p.position.set(px, py, 0); p.rotation.y = k * TAU / 7; grp.add(p); const lf = mesh(GEO.box, mat(k % 2 ? '#2f8a4a' : '#3fa35a'), 1.0, -0.25, 0, 2.1, 0.05, 0.5, p, true); lf.rotation.z = -0.45; }
  for (let k = 0; k < 3; k++) mesh(GEO.ico0, mat('#5a3a1a'), px + Math.cos(k * 2) * 0.18, py - 0.2, Math.sin(k * 2) * 0.18, 0.14, 0.14, 0.14, grp, true);
  g.add(grp);
}
function streetLamp(g, x, z, flip, upd) {
  mesh(GEO.cyl6, mat('#1f1a1d'), x, 2.6, z, 0.08, 5.2, 0.08, g, true);
  box(g, 1.1, 0.08, 0.08, '#1f1a1d', x + flip * 0.5, 5.15, z, false);
  box(g, 0.5, 0.16, 0.3, new THREE.MeshBasicMaterial({ color: '#ffe2a0' }), x + flip * 1.0, 5.05, z, false);
  const s = glowSprite('#ffc46b', 3.2, 0.7); s.position.set(x + flip * 1.0, 5.0, z); g.add(s);
  const L = new THREE.PointLight(0xffb060, 1.3, 18, 2); L.position.set(x + flip * 1.0, 4.8, z); g.add(L);
  upd.push(t => { s.material.opacity = 0.62 + Math.sin(t * 13 + x) * 0.04; });
}
function buildArena3D(id) {
  const th = TH3[id], R = rng(id.charCodeAt(0) * 977 + id.length * 31), g = new THREE.Group(), upd = [];
  g.add(new THREE.HemisphereLight(th.hemi[0], th.hemi[1], th.hemi[2]));
  g.add(new THREE.AmbientLight(0xffffff, th.amb));
  const sun = new THREE.DirectionalLight(th.sun[0], th.sun[1]); sun.position.set(...th.sun[2]); sun.target.position.set(0, 0, 0);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -(HW3 + 5); sc.right = HW3 + 5; sc.top = HH3 + 5.5; sc.bottom = -(HH3 + 5.5); sc.near = 1; sc.far = 70; sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
  g.add(sun, sun.target);
  const rim = new THREE.DirectionalLight(id === 'azotea' ? '#ff7ac0' : id === 'playa' ? '#fff2dd' : '#a8c4ff', id === 'playa' ? 0.25 : 0.45); rim.position.set(3, 8, -16); g.add(rim);
  if (id === 'barrio' || id === 'azotea' || id === 'puerto') {
    const beamTex2 = canvasTex(4, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,245,220,.6)'); gr.addColorStop(1, 'rgba(255,245,220,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
    const bgeo = new THREE.ConeGeometry(4.4, 17, 18, 1, true); bgeo.translate(0, -8.5, 0); bgeo.rotateX(-Math.PI / 2);
    for (const sx of [-1, 1]) {
      const x = sx * (HW3 + 6.6), z = -HH3 - 6.5, h = 11;
      mesh(GEO.cyl6, mat('#2a2830'), x, h / 2, z, 0.18, h, 0.18, g, true);
      const head = new THREE.Group(); head.position.set(x, h + 0.4, z); g.add(head); head.lookAt(0, 0, 0);
      box(head, 2.3, 1.3, 0.3, '#1d1b22', 0, 0, -0.12, false);
      const lm = new THREE.MeshBasicMaterial({ color: '#fff6dd' });
      for (let a = 0; a < 3; a++) for (let b2 = 0; b2 < 2; b2++) box(head, 0.6, 0.45, 0.06, lm, -0.72 + a * 0.72, -0.27 + b2 * 0.54, 0.06, false);
      const gl = glowSprite('#fff1cc', 7, 0.55); gl.position.set(x, h + 0.4, z); g.add(gl);
      const beam = new THREE.Mesh(bgeo, new THREE.MeshBasicMaterial({ map: beamTex2, transparent: true, opacity: id === 'azotea' ? 0.2 : 0.14, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      beam.position.copy(head.position); beam.lookAt(sx * 4, 0, 1); g.add(beam);
    }
  }
  const bg = canvasTex(4, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, th.sky[0]); gr.addColorStop(0.55, th.sky[1]); gr.addColorStop(1, th.sky[2]); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  // outer ground
  const gg = new THREE.PlaneGeometry(220, 140, id === 'playa' ? 90 : 1, id === 'playa' ? 60 : 1); gg.rotateX(-Math.PI / 2);
  if (id === 'playa') { const p = gg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); if (Math.abs(x) > HW3 + 3 || z > HH3 + 2 || z < -HH3 - 5.5) p.setY(i, R() * 0.35 + (z < -HH3 - 5.5 ? -0.15 : 0)); else p.setY(i, -0.02); } gg.computeVertexNormals(); }
  const ground = new THREE.Mesh(gg, mat(th.ground)); ground.position.y = -0.02; ground.receiveShadow = true; g.add(ground);
  // field
  const ft = fieldTextures(id, R);
  const fm = new THREE.MeshPhongMaterial({ map: ft.map, shininess: id === 'azotea' ? 30 : 4, specular: id === 'azotea' ? 0x223355 : 0x0a0a0a });
  if (ft.emi) { fm.emissive = new THREE.Color(0xffffff); fm.emissiveMap = ft.emi; fm.emissiveIntensity = 1; }
  const field = new THREE.Mesh(new THREE.PlaneGeometry(F.w * U, F.h * U), fm); field.rotation.x = -Math.PI / 2; field.position.y = 0.005; field.receiveShadow = true; g.add(field);
  buildWalls(g, th, id);
  const goals = [buildGoal(0, th), buildGoal(1, th)]; g.add(goals[0], goals[1]);
  const spots = bleacherSpots(g, R, { playa: '#a8743f', azotea: '#2a2448', plaza: '#9b7b5a', puerto: '#3b4a5c' }[id] || '#5d5a55');
  const crowdUpd = crowdBuild(g, th, R, spots);
  const st = { beacons: [] }, decStart = g.children.length;
  if (id === 'barrio') {
    Object.assign(st, { walls: ['#7a4a3a', '#8a5a44', '#6a4a52', '#94704f', '#5c4a5e'], lit: ['#ffcf6b', '#ffe9b0', '#ffb84d'], dark: '#2a1f2c', litP: 0.45, emiI: 0.75, roof: '#3a2c2a' });
    for (let x = -36; x < 36;) { const w = 3.5 + R() * 4, h = 6 + R() * 9; building(g, R, x + w / 2, -HH3 - 7.5 - R() * 3, w, h, 4.5, st); x += w + 0.3; }
    for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) building(g, R, sx * (HW3 + 7 + R() * 3), -6 + k * 5.5, 4, 5 + R() * 6, 4, st);
    streetLamp(g, -13.5, -HH3 - 2.6, 1, upd); streetLamp(g, 13.5, -HH3 - 2.6, -1, upd);
    for (const [x, z] of [[-13.6, 3.2], [13.8, -3.5], [-14.2, -4.2]]) { mesh(GEO.cyl8, mat('#3f6b4a'), x, 0.45, z, 0.32, 0.9, 0.32, g, true); mesh(GEO.cyl8, mat('#2f5238'), x, 0.92, z, 0.35, 0.06, 0.35, g, true); }
    for (let k = 0; k < 3; k++) { const t = mesh(GEO.torus, mat('#1b1b1d'), 13.6, 0.16 + k * 0.3, 3.4, 0.36, 0.36, 0.36, g, true); t.rotation.x = Math.PI / 2; }
    for (const [x, z] of [[-12.6, 6.3], [-11.8, 6.6], [12.4, 6.4]]) mesh(GEO.cone6, mat('#ff6a1a'), x, 0.25, z, 0.17, 0.5, 0.17, g, true);
    const car = new THREE.Group(); car.position.set(15.5, 0, 6.8); car.rotation.y = 0.3; g.add(car);
    box(car, 3.2, 0.6, 1.5, '#c0392b', 0, 0.55, 0, true); box(car, 1.8, 0.5, 1.35, '#a93226', -0.2, 1.1, 0, true); box(car, 1.82, 0.36, 1.37, '#1b2a3a', -0.2, 1.12, 0, false);
    for (const [wx, wz] of [[-1, 0.75], [1, 0.75], [-1, -0.75], [1, -0.75]]) { const w = mesh(GEO.cyl8, mat('#141414'), wx, 0.3, wz, 0.3, 0.22, 0.3, car, true); w.rotation.x = Math.PI / 2; }
    box(car, 0.05, 0.12, 0.3, new THREE.MeshBasicMaterial({ color: '#fff3c0' }), 1.62, 0.65, 0.45, false); box(car, 0.05, 0.12, 0.3, new THREE.MeshBasicMaterial({ color: '#fff3c0' }), 1.62, 0.65, -0.45, false);
    box(g, 40, 0.14, 2.2, '#77736c', 0, 0.07, HH3 + 1.6);
  } else if (id === 'azotea') {
    Object.assign(st, { walls: ['#0d0a24', '#120d2e', '#160f36'], lit: ['#ffd23f', '#3ddcff', '#ff9ad0', '#ffffff'], dark: '#0b0820', litP: 0.38, emiI: 1.0, roof: '#0b0820', beacon: true });
    for (let k = 0; k < 46; k++) { const a = -Math.PI * 0.05 - R() * Math.PI * 0.9, rad = 34 + R() * 40, w = 4 + R() * 6, h = 10 + R() * 34; building(g, R, Math.cos(a) * rad, Math.sin(a) * rad * 0.8 - 6, w, h, w, st); }
    for (let k = 0; k < 10; k++) building(g, R, -30 + k * 6.5 + R() * 2, -HH3 - 14 - R() * 5, 4, 6 + R() * 8, 4, st);
    box(g, 44, 0.9, 0.4, '#221c40', 0, 0.45, -HH3 - 4.4); box(g, 0.4, 0.9, 20, '#221c40', -21, 0.45, 0); box(g, 0.4, 0.9, 20, '#221c40', 21, 0.45, 0);
    const signs = [['GOL', '#ff3d7f', -11, 5.4], ['SUPER GOL', '#ffd23f', 0, 6.4], ['24H', '#3ddcff', 11, 5.4]];
    for (const [t, c, x, y] of signs) { const p = textPlane(t, c, t.length > 4 ? 7 : 4, 1.6); p.position.set(x, y, -HH3 - 4.3); g.add(p); mesh(GEO.cyl6, mat('#141226'), x - 1.2, y / 2, -HH3 - 4.4, 0.06, y, 0.06, g); mesh(GEO.cyl6, mat('#141226'), x + 1.2, y / 2, -HH3 - 4.4, 0.06, y, 0.06, g); upd.push(tt => { p.material.opacity = 0.85 + Math.sin(tt * 7 + x) * 0.1 * (Math.sin(tt * 23 + x) > 0.96 ? 4 : 1); }); }
    const tower = new THREE.Group(); tower.position.set(-16.5, 0, -8); g.add(tower);
    for (const [lx, lz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) box(tower, 0.12, 3, 0.12, '#2b2440', lx, 1.5, lz, true);
    mesh(GEO.cyl8, mat('#3a2f55'), 0, 4, 0, 1.2, 2, 1.2, tower, true); mesh(GEO.cone8, mat('#2b2440'), 0, 5.4, 0, 1.3, 0.8, 1.3, tower, true);
    for (const [x, z] of [[-14, 3.5], [14.2, -3], [14.5, 3.6]]) { box(g, 1.4, 0.9, 1.0, '#5a5f7a', x, 0.45, z, true); mesh(GEO.cyl8, mat('#2a2f45'), x, 0.92, z, 0.38, 0.05, 0.38, g); }
    for (const sx of [-1, 1]) { const sp = new THREE.Group(); sp.position.set(sx * 15.5, 0, 0.5); g.add(sp); box(sp, 1, 2.2, 1, '#121220', 0, 1.1, 0, true); for (const y of [0.6, 1.5]) { const c = mesh(GEO.cyl8, mat('#2a2a40'), -sx * 0.51, y, 0, 0.3, 0.04, 0.3, sp); c.rotation.z = Math.PI / 2; } box(sp, 1.02, 0.04, 1.02, new THREE.MeshBasicMaterial({ color: '#3ddcff' }), 0, 2.2, 0, false); }
    const sg = new THREE.BufferGeometry(), sp = []; for (let i = 0; i < 500; i++) { const a = R() * TAU, e = 0.15 + R() * 1.2, rr2 = 150; sp.push(Math.cos(a) * Math.cos(e) * rr2, Math.sin(e) * rr2, Math.sin(a) * Math.cos(e) * rr2); } sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    g.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, map: dotTex, transparent: true, depthWrite: false })));
    const moon = mesh(GEO.head, new THREE.MeshBasicMaterial({ color: '#f4f0dc' }), 40, 46, -110, 6, 6, 6, g, false); const mg = glowSprite('#bcc8ff', 40, 0.5); mg.position.copy(moon.position); g.add(mg);
    const L1 = new THREE.PointLight(0xff3d7f, 1.2, 20, 2); L1.position.set(-11, 4, 2); const L2 = new THREE.PointLight(0x3ddcff, 1.2, 20, 2); L2.position.set(11, 4, 2); g.add(L1, L2);
    upd.push(t => { st.beacons.forEach((s, i) => { s.material.opacity = Math.sin(t * 3 + i) > 0.2 ? 0.95 : 0.1; }); });
  } else if (id === 'playa') {
    const seaG = new THREE.PlaneGeometry(260, 90, 70, 22); seaG.rotateX(-Math.PI / 2);
    const sea = new THREE.Mesh(seaG, new THREE.MeshPhongMaterial({ color: '#1e9cc6', flatShading: true, shininess: 60, specular: 0x88ccff })); sea.position.set(0, 0, -62); g.add(sea);
    const sp0 = seaG.attributes.position, base = Float32Array.from(sp0.array);
    upd.push(t => { for (let i = 0; i < sp0.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; sp0.array[i * 3 + 1] = Math.sin(x * 0.18 + t * 1.3) * 0.35 + Math.cos(z * 0.3 + t * 1.7) * 0.28; } sp0.needsUpdate = true; });
    const foam = box(g, 260, 0.1, 0.8, new THREE.MeshPhongMaterial({ color: '#ffffff', transparent: true, opacity: 0.8 }), 0, 0.12, -17.2, false); upd.push(t => { foam.scale.z = 0.8 + Math.sin(t * 0.9) * 0.4; });
    const sunM = mesh(GEO.head, new THREE.MeshBasicMaterial({ color: '#fff6c8' }), -46, 34, -130, 7, 7, 7, g, false); const sgl = glowSprite('#fff1b0', 60, 0.7); sgl.position.copy(sunM.position); g.add(sgl);
    const clouds = [];
    for (let k = 0; k < 7; k++) { const c = new THREE.Group(); c.position.set(-80 + k * 26 + R() * 10, 22 + R() * 10, -90 - R() * 30); for (let j = 0; j < 4; j++) mesh(GEO.ico0, mat('#ffffff', { emissive: 0x9fb8c8 }), j * 2.6 - 4, R() * 1.2, R(), 2.4 + R() * 1.6, 1.4 + R(), 2 + R(), c, false); g.add(c); clouds.push(c); }
    upd.push((t, dt) => clouds.forEach(c => { c.position.x += dt * 0.8; if (c.position.x > 100) c.position.x = -100; }));
    for (const [x, z, h, l] of [[-15, -9, 7, 0.45], [-17.5, -4, 6, -0.4], [15.5, -9.5, 7.5, -0.5], [17.5, -2, 6, 0.35], [-16, 5.5, 6.5, 0.3], [-25, -12, 8, 0.4], [24, -13, 8.5, -0.35]]) palm(g, x, z, h, l, R);
    const um = (x, z, c) => { mesh(GEO.cyl6, mat('#e8e2d0'), x, 1.1, z, 0.04, 2.2, 0.04, g, true); mesh(GEO.cone8, mat(c), x, 2.3, z, 1.2, 0.45, 1.2, g, true); mesh(GEO.cone8, mat('#ffffff'), x, 2.58, z, 0.35, 0.2, 0.35, g, false); box(g, 1.6, 0.03, 0.8, c, x + 0.4, 0.02, z + 0.9, false); };
    um(-13.8, 2.6, '#ff3d7f'); um(13.8, 3.2, '#18c3b0'); um(-14.4, -2.8, '#ffd23f');
    const lt = new THREE.Group(); lt.position.set(15, 0, -7.5); g.add(lt);
    for (const [lx, lz] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) box(lt, 0.12, 2.4, 0.12, '#f2eee3', lx, 1.2, lz, true);
    box(lt, 1.8, 0.12, 1.8, '#b9824b', 0, 2.4, 0, true); box(lt, 1.4, 1.1, 1.4, '#e74c3c', 0, 3.0, 0, true); mesh(GEO.cone6, mat('#f2eee3'), 0, 3.9, 0, 1.3, 0.6, 1.3, lt, true).rotation.y = Math.PI / 4;
    for (const [x, z, c, a] of [[13.2, -1, '#ffd23f', 0.3], [13.5, -0.4, '#ff3d7f', -0.2]]) { const b = mesh(GEO.head, mat(c), x, 1.1, z, 0.32, 1.1, 0.07, g, true); b.rotation.z = a; }
    box(g, 0.8, 0.5, 0.5, '#3a7bd5', -13.2, 0.25, 5.2, true); box(g, 0.82, 0.1, 0.52, '#ffffff', -13.2, 0.52, 5.2, false);
  } else if (id === 'plaza') {
    const cols = ['#e8b04a', '#d9534f', '#4fa3d1', '#f2e2c4', '#8bc34a', '#e67e22', '#c39bd3', '#f06292'];
    const facade = (col, nx, ny) => canvasTex(256, 320, (c, w, h) => {
      c.fillStyle = col; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) { c.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)'; c.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
      c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, h - 26, w, 26);
      const sh = ['#2e7d5b', '#3a6ea5', '#8b2f2f', '#5a3a22'][(Math.random() * 4) | 0];
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
        const cx = (i + 0.5) * w / nx, top = 30 + j * (h - 110) / ny, ww = w / nx * 0.36, hh = 56;
        if (j === ny - 1 && i === Math.floor(nx / 2)) continue;
        c.fillStyle = '#f4ead8'; c.fillRect(cx - ww / 2 - 5, top - 5, ww + 10, hh + 10);
        c.fillStyle = '#2b2420'; c.fillRect(cx - ww / 2, top, ww, hh);
        c.fillStyle = sh; c.fillRect(cx - ww / 2 - ww * 0.42, top, ww * 0.4, hh); c.fillRect(cx + ww / 2 + 2, top, ww * 0.4, hh);
        if (j < ny - 1) { c.fillStyle = '#3b2414'; c.fillRect(cx - ww / 2 - 10, top + hh + 2, ww + 20, 6); for (let k = 0; k < 6; k++) c.fillRect(cx - ww / 2 - 8 + k * (ww + 16) / 5, top + hh - 14, 2.5, 16); }
      }
      const dx = w / 2; c.fillStyle = '#f4ead8'; c.fillRect(dx - 26, h - 96, 52, 96); c.fillStyle = '#5a3a22'; c.beginPath(); c.moveTo(dx - 20, h); c.lineTo(dx - 20, h - 70); c.arc(dx, h - 70, 20, Math.PI, 0); c.lineTo(dx + 20, h); c.fill();
    });
    const house = (x, z, w, h, d, rot) => {
      const hg = new THREE.Group(); hg.position.set(x, 0, z); hg.rotation.y = rot || 0; g.add(hg);
      const col = cols[(R() * cols.length) | 0], fm = new THREE.MeshPhongMaterial({ map: facade(col, Math.max(2, Math.round(w / 1.7)), Math.max(2, Math.round(h / 2.6))), flatShading: true, shininess: 4 }), pm = mat(col);
      const b = new THREE.Mesh(GEO.box, [pm, pm, pm, pm, fm, pm]); b.scale.set(w, h, d); b.position.y = h / 2; b.castShadow = b.receiveShadow = true; hg.add(b);
      box(hg, w + 0.25, 0.2, d + 0.25, '#f4ead8', 0, h + 0.1, 0, false);
      const roof = mesh(GEO.cyl6, mat('#b5562f'), 0, h + 0.55, 0, d * 0.62, w + 0.4, 0.6, hg, true); roof.rotation.z = Math.PI / 2; roof.scale.set(0.75, w + 0.5, d * 0.62);
      if (R() < 0.6) mesh(GEO.ico0, mat('#e84393'), (R() - 0.5) * w * 0.6, h * 0.55, d / 2 + 0.2, 0.55, 0.45, 0.3, hg, false);
      if (R() < 0.5) box(hg, w * 0.5, 0.08, 0.5, '#6b3f22', 0, h * 0.62, d / 2 + 0.25, true);
    };
    for (let x = -36; x < 36;) { const w = 3.6 + R() * 2.4, h = 5 + R() * 3.5; house(x + w / 2, -HH3 - 7.2 - R() * 1.2, w, h, 4, 0); x += w + 0.05; }
    for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) house(sx * (HW3 + 6.5), -6 + k * 5.2, 4.6, 5.5 + R() * 2.5, 4, -sx * Math.PI / 2);
    const ch = new THREE.Group(); ch.position.set(4, 0, -HH3 - 16); g.add(ch);
    box(ch, 9, 9, 7, '#f2e2c4', 0, 4.5, 0, true); box(ch, 9.4, 0.4, 7.4, '#d9c39c', 0, 9.2, 0, false);
    const tri = mesh(GEO.cyl6, mat('#d9c39c'), 0, 10.4, 0, 1, 1, 1, ch, true); tri.rotation.x = Math.PI / 2; tri.scale.set(3.4, 7, 2.4);
    box(ch, 3.2, 17, 3.2, '#f2e2c4', 6, 8.5, 0, true); box(ch, 1.4, 2, 0.2, '#3b2a20', 6, 13.6, 1.62, false);
    mesh(GEO.cone6, mat('#b5562f'), 6, 18.4, 0, 2.4, 2.8, 2.4, ch, true); box(ch, 0.25, 1.4, 0.25, '#e8b04a', 6, 20.4, 0, false); box(ch, 0.9, 0.22, 0.22, '#e8b04a', 6, 20.6, 0, false);
    mesh(GEO.cyl8, mat('#c9a227', { shininess: 60 }), 6, 13.3, 1.2, 0.5, 0.7, 0.5, ch, false);
    box(ch, 2.2, 3.8, 0.2, '#5a3a22', 0, 1.9, 3.55, false); mesh(GEO.head, mat('#3a6ea5'), 0, 6.5, 3.52, 1.1, 1.1, 0.08, ch, false);
    for (const [x, z] of [[-HW3 - 2.4, HH3 + 1.4], [HW3 + 2.4, HH3 + 1.4], [-HW3 - 2.4, -HH3 - 0.6], [HW3 + 2.4, -HH3 - 0.6]]) {
      mesh(GEO.cyl6, mat('#1d1d22'), x, 1.6, z, 0.07, 3.2, 0.07, g, true); box(g, 0.45, 0.6, 0.45, new THREE.MeshBasicMaterial({ color: '#ffe6a8' }), x, 3.35, z, false); mesh(GEO.cone6, mat('#1d1d22'), x, 3.8, z, 0.38, 0.3, 0.38, g, false);
    }
    for (const [x, z, h, l] of [[-HW3 - 4, -2.5, 6.5, 0.3], [HW3 + 4, 2.5, 7, -0.35], [-HW3 - 4.5, 4.5, 6, -0.25], [HW3 + 4.2, -4.8, 6.5, 0.3]]) palm(g, x, z, h, l, R);
    for (const [x, z] of [[-HW3 - 2.2, 3], [HW3 + 2.2, -2.5], [-HW3 - 2.2, -3.6], [HW3 + 2.2, 4]]) { mesh(GEO.cyl8, mat('#b5562f'), x, 0.3, z, 0.35, 0.6, 0.35, g, true); mesh(GEO.ico0, mat('#3f9a4a'), x, 0.85, z, 0.45, 0.4, 0.45, g, true); mesh(GEO.ico0, mat('#f06292'), x + 0.15, 1.05, z, 0.2, 0.18, 0.2, g, false); }
    for (const sx of [-1, 1]) { const bn = new THREE.Group(); bn.position.set(sx * (HW3 + 2.3), 0, 0.5); bn.rotation.y = sx * Math.PI / 2; g.add(bn); box(bn, 2, 0.1, 0.5, '#6b3f22', 0, 0.48, 0, true); box(bn, 2, 0.5, 0.08, '#6b3f22', 0, 0.8, -0.22, true); for (const lx of [-0.85, 0.85]) box(bn, 0.08, 0.48, 0.45, '#1d1d22', lx, 0.24, 0, true); }
    const cart = new THREE.Group(); cart.position.set(-HW3 - 4, 0, HH3 + 2.6); cart.rotation.y = 0.4; g.add(cart);
    box(cart, 1.8, 0.9, 1, '#4fa3d1', 0, 0.75, 0, true); mesh(GEO.cyl8, mat('#141414'), -0.6, 0.25, 0.55, 0.25, 0.1, 0.25, cart, true).rotation.x = Math.PI / 2; mesh(GEO.cyl8, mat('#141414'), 0.6, 0.25, 0.55, 0.25, 0.1, 0.25, cart, true).rotation.x = Math.PI / 2;
    mesh(GEO.cyl6, mat('#e8e2d0'), 0, 1.7, 0, 0.04, 1.8, 0.04, cart, false); mesh(GEO.cone8, mat('#d9534f'), 0, 2.6, 0, 1.2, 0.45, 1.2, cart, true);
  } else if (id === 'puerto') {
    const ribs = canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 8) { c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(x, 0, 3, h); } c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, 0, w, 4); c.fillRect(0, h - 4, w, 4); });
    const cmats = {}, cm = col => cmats[col] || (cmats[col] = new THREE.MeshPhongMaterial({ map: ribs, color: col, flatShading: true, shininess: 18 }));
    const ccols = ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#16a085', '#d35400', '#7f8c8d'];
    const cont = (x, y, z, rot) => { const mm = mesh(GEO.box, cm(ccols[(R() * ccols.length) | 0]), x, y + 1.25, z, 5.8, 2.5, 2.4, g, true); mm.rotation.y = rot || 0; return mm; };
    for (const zz of [-HH3 - 7, -HH3 - 9.6]) for (let x = -33; x < 33; x += 6.1) { const n = 1 + ((R() * 3) | 0); for (let k = 0; k < n; k++) cont(x + rand(-0.15, 0.15), k * 2.55, zz, 0); }
    for (const sx of [-1, 1]) for (let z = -7; z <= 7; z += 2.6) { const n = 1 + ((R() * 2) | 0); for (let k = 0; k < n; k++) cont(sx * (HW3 + 7.5), k * 2.55, z, Math.PI / 2); }
    const crane = (x, z) => { const c = new THREE.Group(); c.position.set(x, 0, z); g.add(c); const cc = '#e67e22';
      for (const [lx, lz] of [[-3, -2], [3, -2], [-3, 2], [3, 2]]) box(c, 0.6, 16, 0.6, cc, lx, 8, lz, true);
      box(c, 7, 1, 5, cc, 0, 16.5, 0, true); box(c, 1.2, 1.2, 30, cc, 0, 17.6, -8, true); box(c, 2.2, 1.8, 2.4, '#f2eee3', 0, 15.2, 2.4, true);
      mesh(GEO.cyl6, mat('#222'), 0, 12.5, -14, 0.06, 9, 0.06, c, false); box(c, 2.6, 0.5, 2.6, '#333', 0, 8, -14, true);
      const s2 = glowSprite('#ff3d5a', 1.4, 0.9); s2.position.set(0, 18.6, -22); c.add(s2); st.beacons.push(s2); };
    crane(-14, -HH3 - 17); crane(16, -HH3 - 18);
    const wG = new THREE.PlaneGeometry(280, 70, 60, 16); wG.rotateX(-Math.PI / 2);
    const water = new THREE.Mesh(wG, new THREE.MeshPhongMaterial({ color: '#123d5c', flatShading: true, shininess: 80, specular: 0x5577aa })); water.position.set(0, 0.06, -HH3 - 52); g.add(water);
    const wp = wG.attributes.position, wb = Float32Array.from(wp.array);
    upd.push(t => { for (let i = 0; i < wp.count; i++) { const x = wb[i * 3], z = wb[i * 3 + 2]; wp.array[i * 3 + 1] = Math.sin(x * 0.2 + t * 1.1) * 0.22 + Math.cos(z * 0.35 + t * 1.4) * 0.18; } wp.needsUpdate = true; });
    box(g, 280, 0.6, 1.2, '#ffc400', 0, 0.1, -HH3 - 16.6, false);
    const ship = new THREE.Group(); ship.position.set(-6, 0, -HH3 - 34); g.add(ship);
    box(ship, 40, 4, 8, '#7b241c', 0, 1.4, 0, true); box(ship, 40.2, 0.6, 8.2, '#1b1b1f', 0, 3.6, 0, false); box(ship, 6, 7, 6, '#f2eee3', 15, 6.9, 0, true); box(ship, 6.2, 0.8, 6.2, '#1b2a3a', 15, 9.3, 0, false);
    mesh(GEO.cyl8, mat('#c0392b'), 15, 11.4, 0, 0.8, 3, 0.8, ship, true);
    for (let x = -16; x < 10; x += 6.1) for (let k = 0; k < 2; k++) { const mm = mesh(GEO.box, cm(ccols[(R() * ccols.length) | 0]), x, 5.2 + k * 2.55, (R() - 0.5) * 2, 5.8, 2.5, 2.4, ship, true); mm.rotation.y = 0; }
    for (let x = -HW3 - 1; x <= HW3 + 1; x += 4.5) { mesh(GEO.cyl8, mat('#2b2b2f'), x, 0.35, -HH3 - 15.6, 0.3, 0.7, 0.3, g, true); mesh(GEO.cyl8, mat('#2b2b2f'), x, 0.72, -HH3 - 15.6, 0.4, 0.08, 0.4, g, false); }
    for (const [x, z] of [[-HW3 - 2.6, 3.4], [HW3 + 2.8, -3.2], [-HW3 - 3, -3.8]]) { for (let k = 0; k < 3; k++) mesh(GEO.cyl8, mat(k % 2 ? '#2980b9' : '#c0392b'), x + k * 0.7, 0.5, z, 0.3, 1, 0.3, g, true); box(g, 1.6, 0.18, 1.2, '#8a6236', x + 0.7, 0.09, z + 1.2, true); }
    const fk = new THREE.Group(); fk.position.set(HW3 + 3, 0, 4.6); fk.rotation.y = -0.6; g.add(fk);
    box(fk, 1.8, 1, 1.2, '#f1c40f', 0, 0.7, 0, true); box(fk, 1, 0.9, 1.1, '#1b2a3a', -0.3, 1.6, 0, true); box(fk, 0.12, 2.8, 0.9, '#2b2b2f', 1, 1.4, 0, true); box(fk, 0.9, 0.08, 1, '#2b2b2f', 1.45, 0.25, 0, true);
    for (const [wx, wz] of [[-0.6, 0.62], [0.6, 0.62], [-0.6, -0.62], [0.6, -0.62]]) { const w = mesh(GEO.cyl8, mat('#141414'), wx, 0.3, wz, 0.3, 0.2, 0.3, fk, true); w.rotation.x = Math.PI / 2; }
    const L1 = new THREE.PointLight(0xffa040, 1.1, 20, 2); L1.position.set(-HW3 - 2, 4.5, 2); const L2 = new THREE.PointLight(0xffa040, 1.1, 20, 2); L2.position.set(HW3 + 2, 4.5, -2); g.add(L1, L2);
    upd.push(t => { st.beacons.forEach((s3, i) => { s3.material.opacity = Math.sin(t * 3 + i) > 0.2 ? 0.95 : 0.1; }); });
  }
  const SXd = HW3 / 10.88, SZd = HH3 / 5.46;
  if (id === 'barrio' || id === 'azotea' || id === 'playa') for (let i = decStart; i < g.children.length; i++) { const o = g.children[i]; if (o.isLight && !o.isPointLight) continue; o.position.x *= SXd; o.position.z *= SZd; }
  return { group: g, bg, fog: new THREE.Fog(th.fog, th.fogN, th.fogF), goals, th, update: (t, dt, m) => { crowdUpd(t, m ? m.cheer : 0); upd.forEach(f => f(t, dt, m)); } };
}

/* ================= MATCH ================= */
const dirOf = t => t === 0 ? 1 : -1;
const atkX = t => t === 0 ? F.x1 : F.x0;
const ownX = t => t === 0 ? F.x0 : F.x1;
function homeFor(team, idx) {
  const d = dirOf(team);
  if (idx === 0) return { x: ownX(team) + d * 28, y: F.cy };
  if (idx === 1) return { x: F.cx - d * 230 * FX, y: F.cy };
  if (idx === 2) return { x: F.cx - d * 95 * FX, y: F.cy - 150 * FY };
  return { x: F.cx - d * 95 * FX, y: F.cy + 150 * FY };
}
function newMatch(cfg) {
  const t0 = TEAMS[cfg.teams[0]], t1 = TEAMS[cfg.teams[1]];
  const kits = [t0.kit, kitsClash(t0.kit, t1.kit) ? awayKit(t1.kit) : t1.kit];
  const mk = (sh) => ({ shirt: sh, alt: '#f2eee3', pattern: 'trim', shorts: '#1b1b1f', socks: sh, num: '#f2eee3' });
  const m = {
    cfg, teams: [t0, t1], kits, gkKits: [mk(t0.gk), mk(t1.gk)], players: [], score: [0, 0], time: cfg.minutes * 60, phase: 'kickoff', phaseT: 1.2, golden: false,
    meter: [0, 0], comboM: [0, 0], style: [0, 0], star: null, power: [null, null], fireReady: [false, false], human: [null, null], fx: [], txt: [], rings: [], orbs: [], orbT: 10,
    shake: 0, flash: 0, slow: 0, cheer: 0, banner: null, clock: 0, playT: 0, net: [0, 0], scorer: -1,
    combo: [{ n: 0, t: 0 }, { n: 0, t: 0 }], stats: [{ shots: 0, tricks: 0, steals: 0, supers: 0 }, { shots: 0, tricks: 0, steals: 0, supers: 0 }],
    cpuTeam: cfg.mode === '1p' ? 1 : -1, D: DIFF[cfg.diff == null ? 1 : cfg.diff], demo: cfg.mode === 'demo', dust: ['#a29d93', '#6f78ab', '#e6c995', '#c9b38f', '#8a8e94'][cfg.arena] || '#a29d93'
  };
  let id = 0;
  const R = rng(cfg.teams[0] * 17 + cfg.teams[1] * 31 + 5);
  for (let t = 0; t < 2; t++) for (let i = 0; i < 4; i++) {
    m.players.push({ pid: id++, team: t, idx: i, role: i === 0 ? 'gk' : 'field', x: 0, y: 0, vx: 0, vy: 0, tvx: 0, tvy: 0, face: 0, ph: R() * 6,
      stun: 0, frozen: 0, noPick: 0, tackleCd: 0, lunge: 0, lungeHit: false, trick: 0, trickCd: 0, charge: 0, aiT: 0, hold: 0, kickT: 0, dive: 0, diveDir: 1, lock: 0,
      skin: SKINS[(R() * SKINS.length) | 0], hair: HAIRS[(R() * HAIRS.length) | 0], hs: (R() * 6) | 0, num: i === 0 ? 1 : [0, 4, 7, 10][i] });
  }
  if (cfg.mode === '1p' || cfg.mode === '2p') m.human[0] = { pid: 1, cd: 0, passHold: 0 };
  if (cfg.mode === '2p') m.human[1] = { pid: 5, cd: 0, passHold: 0 };
  m.ball = { x: F.cx, y: F.cy, z: 0, vx: 0, vy: 0, vz: 0, owner: null, last: null, fire: false, super: false, spin: 0, passTarget: null, passT: 0 };
  kickoff(m, Math.random() < 0.5 ? 0 : 1);
  return m;
}
function kickoff(m, team) {
  for (const p of m.players) {
    const h = homeFor(p.team, p.idx); p.x = h.x; p.y = h.y; p.vx = p.vy = p.tvx = p.tvy = 0;
    p.stun = p.frozen = p.lunge = p.trick = p.charge = p.kickT = p.dive = p.lock = p.noPick = 0; p.face = dirOf(p.team) === 1 ? 0 : Math.PI;
  }
  const k = m.players.find(p => p.team === team && p.idx === 1);
  k.x = F.cx - dirOf(team) * 16; k.y = F.cy;
  const b = m.ball; Object.assign(b, { x: k.x + dirOf(team) * 13, y: k.y, z: 0, vx: 0, vy: 0, vz: 0, owner: k, last: k, fire: false, super: false, passTarget: null });
  for (let t = 0; t < 2; t++) if (m.human[t]) { m.human[t].pid = m.players.find(p => p.team === t && p.idx === 1).pid; m.human[t].passHold = 0; }
  m.phase = 'kickoff'; m.phaseT = 1.1; m.playT = 0;
}
const Dfor = (m, t) => t === m.cpuTeam ? m.D : ALLY;
function isHuman(m, p) { const h = m.human[p.team]; return !!h && h.pid === p.pid; }
function closestOfTeam(m, team, x, y, noGK, exclude) {
  let best = null, bd = 1e9;
  for (const p of m.players) { if (p.team !== team || (noGK && p.role === 'gk') || p === exclude) continue; const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; } }
  return best;
}
function nearestOpp(m, p) { let best = null, bd = 1e9; for (const q of m.players) { if (q.team === p.team || q.role === 'gk') continue; const d = dist(p, q); if (d < bd) { bd = d; best = q; } } return best; }
function speedOf(m, p, sprint) {
  const T = m.teams[p.team]; let s = 168 * (0.9 + T.spd * 0.015);
  if (p.role === 'gk') s *= 1.08;
  if (sprint) s *= 1.32;
  if (m.ball.owner === p) s *= 0.94;
  if (p.trick > 0) s *= 1.15;
  if (p.charge > 0) s *= 0.6;
  const pw = m.power[p.team]; if (pw && pw.type === 'rayo') s *= 1.5; if (pw && pw.type === 'fantasma') s *= 1.12;
  if (p.team === m.cpuTeam) s *= m.D.spd;
  return s;
}
function addMeter(m, t, v) { if (!m.power[t]) m.meter[t] = Math.min(100, m.meter[t] + v); }
function text(m, wx, wy, s, c = '#f2eee3', size = 18) { m.txt.push({ wx, wy, wz: 100, s, c, size, t: 1.1 }); if (m.txt.length > 14) m.txt.shift(); }
function addStyle(m, t, v, wx, wy) { m.style[t] += v; if (wx != null) m.txt.push({ wx, wy, wz: 140, s: '+' + v, c: '#3ddcff', size: 15, t: 0.9 }); }
function banner(m, s, sub, c = '#ffd23f', T = 1.8) { m.banner = { s, sub, c, t: T, T }; }
const colCache = {};
function colOf(s) { if (colCache[s]) return colCache[s]; const c = new THREE.Color(); try { c.setStyle(s); } catch (e) { c.set(0xffffff); } return colCache[s] = c; }
function burst(m, wx, wy, wz, n, cols, sp = 220, life = 0.7, size = 4, grav = 300, add = false) {
  for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = Math.random() * sp, c = colOf(cols[i % cols.length]); m.fx.push({ x: wx, y: wy, z: wz, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vz: Math.random() * sp * 0.8 + sp * 0.25, t: life * (0.5 + Math.random() * 0.5), T: life, c, g: grav * 1.6, add }); }
  if (m.fx.length > 650) m.fx.splice(0, m.fx.length - 650);
}

/* ----- ball actions ----- */
function kick(m, p, vx, vy, vz) {
  const b = m.ball; b.owner = null; b.vx = vx; b.vy = vy; b.vz = vz; b.z = Math.max(b.z, 2); b.last = p; b.passTarget = null; p.noPick = 0.3; p.kickT = KICK_T;
}
function take(m, p) {
  const b = m.ball, prev = b.last;
  b.owner = p; b.fire = false; b.super = false; b.passTarget = null; b.vz = 0; p.aiT = 0.35 + Math.random() * 0.3; p.hold = 0;
  if (prev && prev.team === p.team && prev !== p) addMeter(m, p.team, 4);
  b.last = p;
  const h = m.human[p.team]; if (h && p.role !== 'gk') h.pid = p.pid;
  sfx.touch();
}
function passTo(m, p, mate, lob) {
  const b = m.ball;
  const tx = mate.x + mate.vx * 0.3, ty = mate.y + mate.vy * 0.3;
  const dx = tx - b.x, dy = ty - b.y, d = Math.max(1, Math.hypot(dx, dy));
  let sp, vz = 0;
  if (lob) { sp = 430; vz = Math.min(520, 900 * (d / sp) / 2); } else sp = clamp(d * 1.6 + 220, 400, 820);
  kick(m, p, dx / d * sp, dy / d * sp, vz);
  b.passTarget = mate; b.passT = 1.4;
  const h = m.human[p.team]; if (h && mate.role !== 'gk') h.pid = mate.pid;
  sfx.kick(0.6);
}
function passDir(m, p, lob, ax, ay) {
  let best = null, bs = 1e9; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  for (const q of m.players) {
    if (q.team !== p.team || q === p) continue;
    const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy); if (d < 30) continue;
    const ang = Math.acos(clamp((dx * ax + dy * ay) / d, -1, 1));
    if (ang > 1.25) continue;
    const s = ang * 1.5 + d / 600 + (q.role === 'gk' ? 0.8 : 0);
    if (s < bs) { bs = s; best = q; }
  }
  if (best) passTo(m, p, best, lob);
  else { kick(m, p, ax * 520, ay * 520, lob ? 260 : 0); sfx.kick(0.6); }
}
function laneClear(m, team, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1;
  for (const q of m.players) { if (q.team === team) continue; const t = clamp(((q.x - ax) * dx + (q.y - ay) * dy) / L, 0, 1); if (Math.hypot(ax + dx * t - q.x, ay + dy * t - q.y) < 26) return false; }
  return true;
}
function aiPassBest(m, p, allowLob, forwardOnly) {
  const d = dirOf(p.team); let best = null, bs = -1e9, lobB = false;
  for (const q of m.players) {
    if (q.team !== p.team || q === p || q.role === 'gk') continue;
    const dd = dist(p, q); if (dd < 70 || dd > 620) continue;
    const prog = (q.x - p.x) * d; if (forwardOnly && prog < 20) continue;
    let space = 1e9; for (const o of m.players) if (o.team !== p.team) space = Math.min(space, dist(o, q));
    const clear = laneClear(m, p.team, p.x, p.y, q.x, q.y);
    let s = prog * 0.5 + Math.min(space, 200) - dd * 0.1 + (clear ? 0 : -250);
    let lob = false; if (!clear && allowLob) { s += 180; lob = true; }
    if (s > bs) { bs = s; best = q; lobB = lob; }
  }
  if (best && bs > -60) { passTo(m, p, best, lobB); return true; }
  return false;
}
function shoot(m, p, charge, aimY) {
  const b = m.ball, T = m.teams[p.team], D = Dfor(m, p.team);
  const gx = atkX(p.team);
  let ty = F.cy + clamp(aimY, -1, 1) * GOAL.half * 0.72;
  const spread = (14 + (1 - T.shot / 10) * 40 + charge * 22) * (p.team === m.cpuTeam ? D.spread : 1);
  ty += rand(-spread, spread);
  const dx = gx - b.x, dy = ty - b.y, d = Math.max(1, Math.hypot(dx, dy));
  let sp = (470 + 470 * charge) * (0.9 + T.shot * 0.015);
  let vz = 40 + charge * 160; if (charge > 0.95 && Math.random() < 0.3) vz = 380;
  if (m.fireReady[p.team]) { sp *= 1.3; vz = 60; }
  kick(m, p, dx / d * sp, dy / d * sp, vz);
  if (m.fireReady[p.team]) { b.fire = true; m.fireReady[p.team] = false; m.power[p.team] = null; m.shake = Math.max(m.shake, 8); burst(m, b.x, b.y, 10, 26, ['#ff6a1a', '#ffd23f', '#ff3d3d'], 260, 0.7, 4, 300, true); }
  m.stats[p.team].shots++; addMeter(m, p.team, 5); sfx.kick(1 + charge * 0.6);
}
function superShot(m, p) {
  const b = m.ball, gx = atkX(p.team), opp = 1 - p.team;
  const gk = m.players.find(q => q.team === opp && q.role === 'gk');
  const goal = gk.stun > 0 || Math.random() < 0.55;
  let ty;
  if (goal) { ty = gk.y < F.cy ? F.cy + GOAL.half * 0.6 : F.cy - GOAL.half * 0.6; gk.noPick = 1.4; }
  else { ty = clamp(gk.y, F.cy - GOAL.half * 0.6, F.cy + GOAL.half * 0.6); gk.lock = 1.4; }
  const dx = gx - b.x, dy = ty - b.y, dd = Math.max(1, Math.hypot(dx, dy));
  kick(m, p, dx / dd * 1500, dy / dd * 1500, 110);
  b.super = true; b.fire = false;
  m.star = null; m.stats[p.team].supers++; addStyle(m, p.team, 500, p.x, p.y);
  m.slow = 0.6; m.flash = 1; m.shake = 18; m.cheer = 1;
  m.rings.push({ x: F.cx, y: F.cy, r: 0, max: 260, t: 0.6, T: 0.6, c: '#ffd23f' });
  burst(m, b.x, b.y, 8, 40, ['#ffd23f', '#ffffff', m.kits[p.team].shirt], 380, 0.9, 5, 200, true);
  banner(m, '¡SÚPER CAÑONAZO!', m.teams[p.team].name, '#ffd23f', 1.4);
  sfx.superShot(); sfx.crowd(0.7);
}
function tackle(m, p) {
  if (p.tackleCd > 0 || p.stun > 0 || p.frozen > 0 || p.lunge > 0) return;
  const b = m.ball; let ang = p.face;
  if (b.owner && b.owner.team !== p.team) { if (dist(p, b.owner) < 95) ang = Math.atan2(b.owner.y - p.y, b.owner.x - p.x); }
  else if (!b.owner && Math.hypot(b.x - p.x, b.y - p.y) < 95) ang = Math.atan2(b.y - p.y, b.x - p.x);
  p.face = ang; p.lunge = 0.24; p.lungeHit = false; p.tackleCd = 0.85; sfx.slide();
  burst(m, p.x, p.y, 2, 8, ['#d8d2c2'], 90, 0.45, 5, 120);
}
function resolveTackle(m, p, o) {
  const ghost = m.power[o.team] && m.power[o.team].type === 'fantasma';
  if (o.trick > 0 || ghost) { text(m, o.x, o.y, '¡Esquiva!', '#3ddcff', 16); addStyle(m, o.team, 150, o.x + 20, o.y); p.stun = 0.45; addMeter(m, o.team, 6); return; }
  const T = m.teams[p.team], O = m.teams[o.team];
  let ch = 0.66 + (T.ctrl - O.ctrl) * 0.04; if (p.team === m.cpuTeam) ch *= 0.8 + 0.25 * m.D.tackle;
  if (Math.random() < ch) {
    o.stun = 0.55; m.ball.owner = null; take(m, p); m.stats[p.team].steals++; addMeter(m, p.team, 8); m.style[p.team] += 100;
    text(m, p.x, p.y, '¡Robo!', '#ff3d7f', 18); sfx.steal(); burst(m, o.x, o.y, 20, 10, ['#f2eee3', '#a3a5ae'], 140, 0.4, 3);
  } else p.stun = 0.4;
}
function doTrick(m, p) {
  if (p.trickCd > 0 || p.trick > 0) return;
  p.trick = TRICK_T; p.trickCd = 0.9;
  const near = nearestOpp(m, p), close = near && dist(near, p) < 85;
  const c = m.combo[p.team]; c.n = c.t > 0 ? c.n + 1 : 1; c.t = 2.4;
  const name = TRICKS[(Math.random() * TRICKS.length) | 0];
  if (close) { addMeter(m, p.team, 10 + c.n * 2); if (!m.star) m.comboM[p.team] = Math.min(100, m.comboM[p.team] + 3); text(m, p.x, p.y, name + (c.n > 1 ? ' x' + c.n : ''), '#ffd23f', 18 + Math.min(c.n, 4) * 2); addStyle(m, p.team, 100 * Math.min(c.n, 5), p.x + 30, p.y); }
  else { addMeter(m, p.team, 2); text(m, p.x, p.y, name, '#f2eee3', 14); m.style[p.team] += 20; }
  m.stats[p.team].tricks++; sfx.trick();
  burst(m, p.x, p.y, 4, 6, ['#ffffff'], 80, 0.35, 3, 0, true);
}
function activatePower(m, team) {
  if (m.meter[team] < 100 || m.power[team]) return;
  const type = m.teams[team].power, Pw = POWERS[type], b = m.ball;
  m.meter[team] = 0; m.power[team] = { type, t: Pw.dur, T: Pw.dur };
  banner(m, Pw.name.toUpperCase() + '!', m.teams[team].name, Pw.color, 1.3);
  m.shake = Math.max(m.shake, 7); sfx.power();
  const opp = 1 - team;
  const src = (b.owner && b.owner.team === team) ? b.owner : (m.human[team] ? m.players[m.human[team].pid] : closestOfTeam(m, team, b.x, b.y, true));
  if (type === 'fuego') m.fireReady[team] = true;
  if (type === 'hielo') {
    for (const p of m.players) if (p.team === opp && p.role !== 'gk') { p.frozen = 2.5; burst(m, p.x, p.y, 40, 10, ['#8fe3ff', '#ffffff'], 120, 0.6, 3, 0, true); }
    if (b.owner && b.owner.team === opp && b.owner.role !== 'gk') { const o = b.owner; kick(m, o, rand(-60, 60), rand(-60, 60), 80); o.noPick = 2.6; }
  }
  if (type === 'tornado') {
    m.rings.push({ x: src.x, y: src.y, r: 0, max: 290, t: 0.6, T: 0.6, c: Pw.color });
    for (const p of m.players) {
      if (p.team !== opp) continue; const d = dist(p, src); if (d > 290) continue;
      const a = Math.atan2(p.y - src.y, p.x - src.x); p.vx = Math.cos(a) * 520; p.vy = Math.sin(a) * 520; p.stun = 0.9;
      if (b.owner === p) { kick(m, p, Math.cos(a) * 200, Math.sin(a) * 200, 150); p.noPick = 1; }
    }
  }
  if (type === 'rayo' || type === 'fantasma') for (const p of m.players) if (p.team === team) burst(m, p.x, p.y, 40, 8, [Pw.color, '#ffffff'], 120, 0.5, 3, 0, true);
}
function activateCombo(m, team) {
  if (m.comboM[team] < 100 || m.star || m.phase !== 'play') return;
  m.comboM[team] = 0; m.star = { team, t: STAR_T, T: STAR_T, born: m.clock };
  banner(m, '¡COMBO!', 'Lleva el balón a la estrella', '#3ddcff', 1.5);
  m.rings.push({ x: F.cx, y: F.cy, r: 0, max: 160, t: 0.5, T: 0.5, c: '#ffd23f' });
  burst(m, F.cx, F.cy, 0, 36, ['#ffd23f', '#ffffff', '#3ddcff'], 260, 0.8, 4, 200, true);
  sfx.combo();
}
const wallActive = (m, t) => m.power[t] && m.power[t].type === 'muro';
function scoreGoal(m, t, b) {
  m.score[t]++; m.phase = 'goal'; m.phaseT = 2.8; m.kickTeam = 1 - t; m.scorer = t;
  const own = !(b.last && b.last.team === t);
  banner(m, b.super ? '¡GOLAZO!' : '¡GOOOL!', m.teams[t].name + (own ? ' (autogol)' : ''), '#ffd23f', 2.4);
  if (!own) m.style[t] += 250;
  m.shake = 14; m.flash = Math.max(m.flash, 0.5); m.cheer = 1.6; addMeter(m, 1 - t, 20);
  m.net[t === 0 ? 1 : 0] = 1;
  const k = m.kits[t]; burst(m, b.x, b.y, 30, 90, [k.shirt, k.alt, '#ffffff', '#ffd23f'], 420, 1.6, 5, 260);
  b.owner = null; b.fire = false; b.super = false; b.vx *= 0.25; b.vy *= 0.25;
  sfx.crowd(); sfx.whistle(1);
}

/* ----- controllers ----- */
function moveTo(m, p, tx, ty, fast, mult = 1) {
  const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
  if (d < 6) { p.tvx = p.tvy = 0; return; }
  const sp = Math.min(speedOf(m, p, fast) * mult, d * 7);
  p.tvx = dx / d * sp; p.tvy = dy / d * sp;
  if (m.ball.owner === p) p.face = Math.atan2(dy, dx);
}
function humanControl(m, team, inp, dt) {
  const h = m.human[team], b = m.ball; let p = m.players[h.pid];
  h.cd = Math.max(0, h.cd - dt);
  if (b.owner && b.owner.team === team && b.owner.role !== 'gk' && b.owner !== p) { h.pid = b.owner.pid; p = b.owner; }
  else if (!b.owner && b.passTarget && b.passTarget.team === team && b.passTarget.role !== 'gk') { h.pid = b.passTarget.pid; p = b.passTarget; }
  else if (!(b.owner && b.owner.team === team) && h.cd <= 0) {
    const c = closestOfTeam(m, team, b.x, b.y, true);
    if (c && c !== p && dist(c, b) + 150 < dist(p, b)) { h.pid = c.pid; p = c; h.cd = 0.5; }
  }
  if (inp.power.jd) activatePower(m, team);
  if (inp.combo.jd) activateCombo(m, team);
  if (p.stun > 0 || p.frozen > 0 || p.lunge > 0) { p.charge = 0; return; }
  const has = b.owner === p;
  let mx = inp.mx, my = inp.my; const ml = Math.hypot(mx, my); if (ml > 1) { mx /= ml; my /= ml; }
  const sprint = !has && inp.trick.h;
  const sp = speedOf(m, p, sprint);
  p.tvx = mx * sp; p.tvy = my * sp;
  if (ml > 0.2) p.face = Math.atan2(my, mx);
  if (sprint && ml > 0.3 && Math.random() < 0.12) burst(m, p.x, p.y, 2, 1, ['#d8d2c2'], 40, 0.35, 4, 60);
  if (inp.pass.jd) {
    if (has) h.passHold = 0.0001;
    else { const c = closestOfTeam(m, team, b.x, b.y, true, p); if (c) { h.pid = c.pid; h.cd = 0.7; } }
  }
  if (h.passHold > 0) {
    if (!has) h.passHold = 0;
    else { if (inp.pass.h) h.passHold += dt; if (!inp.pass.h || h.passHold > 0.6) { passDir(m, p, h.passHold > 0.25, ml > 0.2 ? mx : Math.cos(p.face), ml > 0.2 ? my : Math.sin(p.face)); h.passHold = 0; } }
  }
  if (has) {
    if (inp.shoot.jd) p.charge = 0.0001;
    if (p.charge > 0) { if (inp.shoot.h) p.charge = Math.min(1, p.charge + dt * 1.4); else { shoot(m, p, p.charge, my); p.charge = 0; } }
  } else { p.charge = 0; if (inp.shoot.jd) tackle(m, p); }
  if (has && inp.trick.jd) doTrick(m, p);
}
function aiGK(m, p, dt) {
  const b = m.ball, d = dirOf(p.team), ox = ownX(p.team);
  if (p.lock > 0) { p.tvx = p.tvy = 0; return; }
  if (b.owner === p) {
    p.tvx = p.tvy = 0; p.face = d === 1 ? 0 : Math.PI; p.hold += dt;
    if (p.hold > 0.7) { p.hold = 0; if (!aiPassBest(m, p, true)) { kick(m, p, d * 620, rand(-200, 200), 300); sfx.kick(0.9); } }
    return;
  }
  let tx = ox + d * 26, ty = clamp(F.cy + (b.y - F.cy) * 0.5, F.cy - GOAL.half + 8, F.cy + GOAL.half - 8), mult = 1;
  const sp = Math.hypot(b.vx, b.vy), bd = Math.abs(b.x - ox);
  if (!b.owner && sp > 250 && Math.sign(b.vx) === -d) {
    const tt = (ox + d * 26 - b.x) / b.vx;
    if (tt > 0 && tt < 1.2) { ty = clamp(b.y + b.vy * tt, F.cy - GOAL.half - 12, F.cy + GOAL.half + 12); mult = 2.3; if (tt < 0.3 && Math.abs(ty - p.y) > 22 && p.dive <= 0) { p.dive = 0.45; p.diveDir = Math.sign(ty - p.y); } }
  } else if (!b.owner && bd < 150 && sp < 320 && Math.abs(b.y - F.cy) < 190) { tx = b.x; ty = b.y; mult = 1.2; }
  else if (b.owner && b.owner.team !== p.team && bd < 220) { tx = ox + d * Math.min(75, (220 - bd) * 0.35 + 26); ty = clamp(b.y, F.cy - GOAL.half, F.cy + GOAL.half); }
  moveTo(m, p, tx, ty, false, mult);
  if (b.owner !== p) p.face = Math.atan2(b.y - p.y, b.x - p.x);
}
function aiCarrier(m, p, dt) {
  const D = Dfor(m, p.team), d = dirOf(p.team), gx = atkX(p.team);
  const dGoal = Math.hypot(gx - p.x, F.cy - p.y);
  const near = nearestOpp(m, p), nd = near ? dist(p, near) : 1e9;
  p.aiT -= dt;
  if (m.meter[p.team] >= 100 && !m.power[p.team] && Math.random() < dt * 0.8) activatePower(m, p.team);
  if (m.star && m.star.team === p.team && dGoal > 220) {
    let vx = F.cx - p.x, vy = F.cy - p.y; let l = Math.hypot(vx, vy) || 1; vx /= l; vy /= l;
    if (near && nd < 110) { const w = (110 - nd) / 110 * 1.2; vx += (p.x - near.x) / nd * w; vy += (p.y - near.y) / nd * w; }
    if (near && nd < 55 && p.trickCd <= 0 && Math.random() < dt * 3 * D.think) doTrick(m, p);
    l = Math.hypot(vx, vy) || 1; const sp = speedOf(m, p, false); p.tvx = vx / l * sp; p.tvy = vy / l * sp; p.face = Math.atan2(vy, vx);
    return;
  }
  if (dGoal < 400 && p.aiT <= 0 && p.trick <= 0) {
    const prob = dGoal < 230 ? 0.7 : 0.22;
    if (Math.random() < prob * Math.min(1, D.think)) { shoot(m, p, rand(0.35, 0.95), rand(-1, 1)); return; }
    p.aiT = 0.4 / D.think;
  }
  if (near && nd < 55 && p.trickCd <= 0 && Math.random() < dt * 3.2 * D.think) doTrick(m, p);
  if (near && nd < 46 && p.trick <= 0 && Math.random() < dt * 2.6 * D.think) { if (aiPassBest(m, p, true)) return; }
  if (dGoal > 430 && Math.random() < dt * 0.4 * D.think) { if (aiPassBest(m, p, false, true)) return; }
  let vx = (gx - d * 60) - p.x, vy = F.cy + Math.sin(m.clock * 1.3 + p.pid) * 120 * FY - p.y; let l = Math.hypot(vx, vy) || 1; vx /= l; vy /= l;
  if (near && nd < 130) { const w = (130 - nd) / 130 * 1.6; vx += (p.x - near.x) / nd * w; vy += (p.y - near.y) / nd * w; }
  if (p.y < F.y0 + 30) vy += 0.6; if (p.y > F.y1 - 30) vy -= 0.6;
  l = Math.hypot(vx, vy) || 1; const sp = speedOf(m, p, false);
  p.tvx = vx / l * sp; p.tvy = vy / l * sp; p.face = Math.atan2(vy, vx);
}
function aiField(m, p, dt) {
  const b = m.ball, own = b.owner, d = dirOf(p.team), D = Dfor(m, p.team);
  let tx, ty, fast = false;
  if (b.passTarget === p && !own) { tx = b.x + b.vx * 0.25; ty = b.y + b.vy * 0.25; fast = true; }
  else if (!own || (own.team !== p.team && own.role === 'gk')) {
    const c = closestOfTeam(m, p.team, b.x, b.y, true);
    if (c === p && !own) { tx = b.x + b.vx * 0.18; ty = b.y + b.vy * 0.18; fast = true; }
    else { const s = support(m, p); tx = s.x; ty = s.y; }
  } else if (own.team === p.team) { const s = support(m, p); tx = s.x; ty = s.y; }
  else {
    const chaser = closestOfTeam(m, p.team, own.x, own.y, true);
    if (chaser === p) {
      tx = own.x - d * 8; ty = own.y; fast = true;
      if (dist(p, own) < 34 && p.tackleCd <= 0 && Math.random() < dt * 2.4 * D.tackle) tackle(m, p);
    } else if (m.star && m.star.team === own.team) { tx = F.cx - d * 40; ty = F.cy + (p.idx === 2 ? -40 : 40); fast = true; }
    else {
      const opp = m.players.find(q => q.team !== p.team && q.idx === p.idx) || own;
      const target = opp === own ? m.players.find(q => q.team !== p.team && q.idx !== own.idx && q.role !== 'gk') : opp;
      tx = target.x + (ownX(p.team) - target.x) * 0.25; ty = target.y + (F.cy - target.y) * 0.2;
    }
  }
  moveTo(m, p, tx, ty, fast);
}
function support(m, p) {
  const b = m.ball, ref = b.owner || b, d = dirOf(p.team);
  const lane = (p.idx === 1 ? 0 : p.idx === 2 ? -165 : 165) * FY;
  let x = p.idx === 1 ? ref.x - d * 150 * FX : ref.x + d * 150 * FX;
  x = clamp(x, F.x0 + 70, F.x1 - 70);
  const gx = atkX(p.team); if (Math.abs(gx - x) < 170 * FX) x = gx - d * 170 * FX;
  return { x, y: F.cy + lane + Math.sin(m.clock * 0.8 + p.pid) * 30 };
}

/* ----- step ----- */
function step(m, dt, inputs) {
  m.clock += dt; updateFx(m, dt);
  if (m.phase === 'kickoff') { m.phaseT -= dt; if (m.phaseT <= 0) { m.phase = 'play'; if (!m.demo) sfx.whistle(1); } return; }
  if (m.phase === 'goal') {
    const b = m.ball; b.x += b.vx * dt; b.y += b.vy * dt; b.vx *= 0.9; b.vy *= 0.9; b.z = Math.max(0, b.z - dt * 80);
    if (b.x < F.x0) b.x = Math.max(b.x, F.x0 - GOAL.depth + 8); if (b.x > F.x1) b.x = Math.min(b.x, F.x1 + GOAL.depth - 8);
    for (const p of m.players) { p.vx *= 0.92; p.vy *= 0.92; p.x += p.vx * dt; p.y += p.vy * dt; p.ph += Math.hypot(p.vx, p.vy) * dt * 0.075; p.stun = Math.max(0, p.stun - dt); p.kickT = Math.max(0, p.kickT - dt); p.dive = Math.max(0, p.dive - dt); }
    m.phaseT -= dt;
    if (m.phaseT <= 0) { if (m.golden) return endMatch(m); kickoff(m, m.kickTeam); }
    return;
  }
  if (m.phase !== 'play') return;
  m.time -= dt / GAME_SPEED; m.playT += dt;
  if (m.time <= 0) {
    m.time = 0;
    if (m.score[0] !== m.score[1]) return endMatch(m);
    if (!m.golden) { m.golden = true; banner(m, 'GOL DE ORO', 'El próximo gol gana', '#ff3d7f', 2.2); sfx.whistle(2); }
  }
  const b = m.ball;
  for (let t = 0; t < 2; t++) {
    const pw = m.power[t]; if (pw) { pw.t -= dt; if (pw.t <= 0) { m.power[t] = null; m.fireReady[t] = false; } }
    m.combo[t].t = Math.max(0, m.combo[t].t - dt);
    if (!(m.star && m.star.team === t)) { const before = m.comboM[t]; m.comboM[t] = Math.min(100, m.comboM[t] + dt / GAME_SPEED * 100 / COMBO_FILL * (t === m.cpuTeam ? 0.7 : 1)); if (before < 100 && m.comboM[t] >= 100 && m.human[t] && !m.demo) sfx.tick(); }
    if (!m.human[t] && m.comboM[t] >= 100 && !m.star && Math.random() < dt * (t === m.cpuTeam ? 0.3 : 0.6)) activateCombo(m, t);
  }
  if (m.star) {
    m.star.t -= dt;
    if (m.star.t <= 0) { text(m, F.cx, F.cy, 'Estrella perdida', '#a3a5ae', 16); m.star = null; }
  }
  if (b.owner) addMeter(m, b.owner.team, dt * 1.6);
  for (let t = 0; t < 2; t++) if (m.human[t]) humanControl(m, t, inputs[t], dt);
  for (const p of m.players) {
    if (isHuman(m, p)) continue;
    if (p.stun > 0 || p.frozen > 0) { p.tvx = p.tvy = 0; continue; }
    if (p.role === 'gk') aiGK(m, p, dt);
    else if (b.owner === p) aiCarrier(m, p, dt);
    else aiField(m, p, dt);
  }
  for (const p of m.players) {
    p.stun = Math.max(0, p.stun - dt); p.frozen = Math.max(0, p.frozen - dt); p.noPick = Math.max(0, p.noPick - dt);
    p.tackleCd = Math.max(0, p.tackleCd - dt); p.trickCd = Math.max(0, p.trickCd - dt); p.trick = Math.max(0, p.trick - dt);
    p.kickT = Math.max(0, p.kickT - dt); p.dive = Math.max(0, p.dive - dt); p.lock = Math.max(0, p.lock - dt);
    if (p.lunge > 0) {
      p.lunge -= dt; p.vx = Math.cos(p.face) * 400; p.vy = Math.sin(p.face) * 400;
      if (b.owner && b.owner.team !== p.team && !p.lungeHit && dist(p, b.owner) < 28) { p.lungeHit = true; resolveTackle(m, p, b.owner); }
      if (p.lunge <= 0 && !p.lungeHit) p.stun = Math.max(p.stun, 0.2);
    } else if (p.frozen > 0) { p.vx = p.vy = 0; }
    else if (p.stun > 0) { const k = Math.pow(0.0007, dt); p.vx *= k; p.vy *= k; }
    else { const k = Math.min(1, dt * 11); p.vx += (p.tvx - p.vx) * k; p.vy += (p.tvy - p.vy) * k; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.role === 'gk') {
      const d = dirOf(p.team);
      p.x = d === 1 ? clamp(p.x, F.x0 + 8, F.x0 + 160) : clamp(p.x, F.x1 - 160, F.x1 - 8);
      p.y = clamp(p.y, F.cy - 200, F.cy + 200);
    } else { p.x = clamp(p.x, F.x0 + 8, F.x1 - 8); p.y = clamp(p.y, F.y0 + 8, F.y1 - 6); }
    const sp = Math.hypot(p.vx, p.vy); p.ph += sp * dt * 0.075;
    if (b.owner !== p && p.lunge <= 0 && p.stun <= 0 && p.role !== 'gk') { if (sp > 25) p.face = Math.atan2(p.vy, p.vx); else p.face = Math.atan2(b.y - p.y, b.x - p.x); }
    if (m.power[p.team] && m.power[p.team].type === 'rayo' && sp > 120 && Math.random() < 0.3) burst(m, p.x, p.y, rand(10, 60), 1, ['#ffe14a'], 30, 0.3, 3, 0, true);
    if (sp > 230 && p.trick <= 0 && p.lunge <= 0 && Math.random() < dt * 4) burst(m, p.x - Math.cos(p.face) * 8, p.y - Math.sin(p.face) * 8, 1, 2, [m.dust], 35, 0.4, 3, 40);
  }
  const PL = m.players;
  for (let i = 0; i < PL.length; i++) for (let j = i + 1; j < PL.length; j++) {
    const a = PL[i], c = PL[j];
    if (a.team !== c.team && ((m.power[a.team] && m.power[a.team].type === 'fantasma') || (m.power[c.team] && m.power[c.team].type === 'fantasma'))) continue;
    const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy);
    if (d < 18 && d > 0.01) { const push = (18 - d) / 2; a.x -= dx / d * push; a.y -= dy / d * push; c.x += dx / d * push; c.y += dy / d * push; }
  }
  updateBall(m, dt);
  if (m.phase !== 'play') return;
  checkPickup(m);
  if (m.star && b.owner && b.owner.team === m.star.team && b.owner.role !== 'gk' && m.playT > 1.2 && Math.hypot(b.owner.x - F.cx, b.owner.y - F.cy) < STAR_R) superShot(m, b.owner);
  m.orbT -= dt;
  if (m.orbT <= 0) { m.orbT = 15 + Math.random() * 7; if (m.orbs.length < 3) m.orbs.push({ x: rand(F.x0 + 180, F.x1 - 180), y: rand(F.y0 + 60, F.y1 - 60), t: 9 }); }
  for (let i = m.orbs.length - 1; i >= 0; i--) {
    const o = m.orbs[i]; o.t -= dt; if (o.t <= 0) { m.orbs.splice(i, 1); continue; }
    for (const p of m.players) if (p.role !== 'gk' && Math.hypot(p.x - o.x, p.y - o.y) < 22) {
      addMeter(m, p.team, 35); text(m, o.x, o.y, '+35 poder', '#ffd23f', 16); burst(m, o.x, o.y, 20, 16, ['#ffd23f', '#ffffff'], 180, 0.6, 3, 300, true); sfx.orb(); m.orbs.splice(i, 1); break;
    }
  }
}
function updateBall(m, dt) {
  const b = m.ball;
  if (b.owner) {
    const p = b.owner;
    if (p.stun > 0 || p.frozen > 0) { b.owner = null; b.vx = p.vx; b.vy = p.vy; }
    else {
      let ox = Math.cos(p.face) * 13, oy = Math.sin(p.face) * 13;
      if (p.trick > 0) { const t = 1 - p.trick / TRICK_T; ox = Math.cos(p.face + t * TAU) * 14; oy = Math.sin(p.face + t * TAU) * 14; b.z = Math.sin(t * Math.PI) * 24; }
      else b.z = Math.max(0, b.z - dt * 120);
      b.x = p.x + ox; b.y = p.y + oy; b.vx = p.vx; b.vy = p.vy;
      if (Math.abs(b.y - F.cy) < GOAL.half) { if (b.x < F.x0 && !wallActive(m, 0)) scoreGoal(m, 1, b); else if (b.x > F.x1 && !wallActive(m, 1)) scoreGoal(m, 0, b); }
      return;
    }
  }
  b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.vz -= 900 * dt;
  if (b.z < 0) { b.z = 0; b.vz = b.vz < -60 ? -b.vz * 0.45 : 0; }
  const fr = b.super ? 0.15 : b.z > 0 ? 0.25 : 1.1;
  const k = Math.max(0, 1 - fr * dt); b.vx *= k; b.vy *= k;
  const sp = Math.hypot(b.vx, b.vy);
  if (b.fire && sp < 260) b.fire = false;
  if (b.super && sp < 300) b.super = false;
  if (b.passTarget) { b.passT -= dt; if (b.passT <= 0) b.passTarget = null; }
  const ady = Math.abs(b.y - F.cy);
  for (const side of [0, 1]) {
    const lineX = side === 0 ? F.x0 : F.x1, over = side === 0 ? b.x < lineX : b.x > lineX;
    if (!over) continue;
    const inMouth = ady < GOAL.half - 5 && b.z < GOAL.bar;
    const post = Math.abs(ady - GOAL.half) < 6 && b.z < GOAL.bar;
    if (inMouth && (!wallActive(m, side) || b.super)) { if (b.super && wallActive(m, side)) { m.power[side] = null; burst(m, lineX, b.y, 20, 20, ['#d6d4e6', '#ffffff'], 260, 0.6, 4); } scoreGoal(m, 1 - side, b); return; }
    if (post) { text(m, lineX, b.y, '¡Palo!', '#f2eee3', 18); sfx.post(); }
    else if (inMouth) { burst(m, lineX, b.y, 20, 12, ['#d6d4e6', '#ffffff'], 160, 0.5, 3); sfx.save(); }
    else if (sp > 220) sfx.bump();
    b.x = lineX; b.vx = (side === 0 ? 1 : -1) * Math.abs(b.vx) * 0.7; b.fire = false; b.super = false;
  }
  if (b.y < F.y0) { b.y = F.y0; b.vy = Math.abs(b.vy) * 0.7; if (sp > 220) sfx.bump(); }
  if (b.y > F.y1) { b.y = F.y1; b.vy = -Math.abs(b.vy) * 0.7; if (sp > 220) sfx.bump(); }
}
function checkPickup(m) {
  const b = m.ball; if (b.owner) return;
  const sp = Math.hypot(b.vx, b.vy);
  for (const p of m.players) {
    if (p.noPick > 0 || p.stun > 0 || p.frozen > 0) continue;
    const gk = p.role === 'gk';
    if (b.z > (gk ? 62 : 26)) continue;
    if (Math.hypot(b.x - p.x, b.y - p.y) > (gk ? (b.super ? 42 : 34) : 16)) continue;
    const hostile = b.last && b.last.team !== p.team;
    if ((b.super || b.fire) && !hostile) continue;
    if (b.super) {
      if (gk) {
        const d = dirOf(p.team);
        p.stun = 3.6; p.noPick = 3.6; p.lock = 0; p.vx = -d * 380; p.vy = rand(-60, 60);
        b.vx = d * Math.abs(b.vx) * 0.3; b.vy = rand(-320, 320); b.vz = 340; b.last = p; b.super = false;
        text(m, p.x, p.y, '¡NOQUEADO!', '#ff3d7f', 26); addStyle(m, 1 - p.team, 300);
        m.shake = 20; m.flash = Math.max(m.flash, 0.7); m.cheer = 1.2;
        burst(m, p.x, p.y, 60, 44, ['#ffd23f', '#ffffff', '#ff3d7f'], 380, 0.9, 5, 250, true);
        sfx.ko(); sfx.crowd(0.8);
        return;
      }
      p.stun = 1.3; p.noPick = 0.6; p.vx = b.vx * 0.3; p.vy = b.vy * 0.3;
      burst(m, p.x, p.y, 40, 12, ['#ffd23f', '#ffffff'], 200, 0.5, 4, 200, true); sfx.bump();
      continue;
    }
    if (gk && hostile && sp > 320) {
      if (b.fire) { p.stun = 1.1; p.noPick = 0.6; b.vx *= 0.8; b.vy *= 0.8; text(m, p.x, p.y, '¡IMPARABLE!', '#ff6a1a', 22); sfx.save(); m.shake = 9; return; }
      const chance = 1.42 - sp / 1400 + Dfor(m, p.team).gk;
      if (Math.random() < chance) {
        if (sp < 700) { take(m, p); text(m, p.x, p.y, '¡Atajada!', '#3ddcff', 18); }
        else { const d = dirOf(p.team); b.vx = d * Math.abs(b.vx) * 0.35 + d * 80; b.vy = rand(-280, 280); b.vz = 180; b.last = p; p.noPick = 0.35; p.dive = 0.4; p.diveDir = Math.sign(b.vy) || 1; text(m, p.x, p.y, '¡Qué atajada!', '#3ddcff', 20); }
        sfx.save(); m.shake = Math.max(m.shake, 4);
      } else p.noPick = 0.5;
      return;
    }
    if (!gk && hostile && b.fire) { p.stun = 0.9; p.noPick = 0.5; burst(m, p.x, p.y, 30, 10, ['#ff6a1a', '#ffd23f'], 160, 0.5, 4, 300, true); continue; }
    if (!gk && sp > 820 && b.passTarget !== p) { b.vx *= -0.35; b.vy = b.vy * 0.3 + rand(-150, 150); b.vz = 120; b.last = p; p.noPick = 0.25; sfx.kick(0.4); return; }
    take(m, p); return;
  }
}
function updateFx(m, dt) {
  for (let i = m.fx.length - 1; i >= 0; i--) { const f = m.fx[i]; f.t -= dt; if (f.t <= 0) { m.fx.splice(i, 1); continue; } f.x += f.vx * dt; f.y += f.vy * dt; f.z += f.vz * dt; f.vz -= f.g * dt; if (f.z < 0) { f.z = 0; f.vz *= -0.3; f.vx *= 0.6; f.vy *= 0.6; } }
  for (let i = m.txt.length - 1; i >= 0; i--) { const t = m.txt[i]; t.t -= dt; t.wz += 45 * dt; if (t.t <= 0) m.txt.splice(i, 1); }
  for (let i = m.rings.length - 1; i >= 0; i--) { const r = m.rings[i]; r.t -= dt; r.r = r.max * (1 - r.t / r.T); if (r.t <= 0) m.rings.splice(i, 1); }
  if (m.banner) { m.banner.t -= dt; if (m.banner.t <= 0) m.banner = null; }
  m.shake = Math.max(0, m.shake - dt * 30);
  m.flash = Math.max(0, m.flash - dt * 2.2);
  m.cheer = Math.max(0, m.cheer - dt * 0.5);
  m.net[0] = Math.max(0, m.net[0] - dt * 0.7); m.net[1] = Math.max(0, m.net[1] - dt * 0.7);
}

/* ================= 3D SCENE ================= */
const R3 = { pm: [], teamMats: [[], []], ghost: [false, false], arenaIdx: -1, bound: null, cam: { x: 0, z: 0, d: 1.15 }, trail: [], axis: new THREE.Vector3() };
let DPR = 1, SCALE = 1;
const QUAL = { maxPR: matchMedia('(pointer: coarse)').matches ? 1.5 : 2, acc: 0, n: 0, warm: 0, noShadow: false };
function initGL() {
  const r = new THREE.WebGLRenderer({ canvas: cvs, antialias: true, powerPreference: 'high-performance' });
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  R3.r = r; R3.scene = new THREE.Scene();
  R3.camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 400);
  R3.players = new THREE.Group(); R3.scene.add(R3.players);
  R3.fx = new THREE.Group(); R3.scene.add(R3.fx);
  R3.ball = makeBall(); R3.scene.add(R3.ball);
  R3.blobGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  R3.blobMat = matCache.__blob = new THREE.MeshBasicMaterial({ map: dotTex, color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false });
  R3.ballBlob = new THREE.Mesh(R3.blobGeo, matCache.__ballBlob = new THREE.MeshBasicMaterial({ map: dotTex, color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false })); R3.ballBlob.position.y = 0.016; R3.fx.add(R3.ballBlob);
  R3.ballGlow = glowSprite('#ffd23f', 1.6, 0.9); R3.ballGlow.visible = false; R3.fx.add(R3.ballGlow);
  R3.trailS = []; for (let i = 0; i < 14; i++) { const s = glowSprite('#ffffff', 0.5, 0); s.visible = false; R3.fx.add(s); R3.trailS.push(s); }
  R3.rings = []; for (let i = 0; i < 4; i++) { const rg = new THREE.Mesh(GEO.ring, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); rg.position.y = 0.04; rg.visible = false; R3.fx.add(rg); R3.rings.push(rg); }
  R3.orbs = []; for (let i = 0; i < 3; i++) { const o = new THREE.Group(); mesh(GEO.oct, new THREE.MeshPhongMaterial({ color: '#ffd23f', emissive: '#c08a00', flatShading: true, shininess: 80 }), 0, 0, 0, 0.22, 0.3, 0.22, o, true); o.add(glowSprite('#ffd23f', 1.4, 0.8)); o.visible = false; R3.fx.add(o); R3.orbs.push(o); }
  R3.muro = []; for (let s = 0; s < 2; s++) { const mm = box(R3.fx, 0.12, GOAL.bar * U + 0.2, 2 * GH3 + 0.3, new THREE.MeshPhongMaterial({ color: '#c8c6ff', emissive: '#6d68d8', transparent: true, opacity: 0.55, flatShading: true }), (s === 0 ? -1 : 1) * (HW3 + 0.02), (GOAL.bar * U + 0.2) / 2, 0, false); mm.visible = false; R3.muro.push(mm); }
  // combo star
  const star = new THREE.Group(); R3.fx.add(star); R3.star = star; star.visible = false;
  const shape = (R1, R2) => { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 + Math.PI / 2, r2 = i % 2 ? R2 : R1; i ? s.lineTo(Math.cos(a) * r2, Math.sin(a) * r2) : s.moveTo(Math.cos(a) * r2, Math.sin(a) * r2); } return new THREE.ShapeGeometry(s).rotateX(-Math.PI / 2); };
  R3.starOut = new THREE.Mesh(shape(1.42, 0.62), new THREE.MeshBasicMaterial({ color: '#141519' })); R3.starOut.position.y = 0.02; star.add(R3.starOut);
  R3.starGold = new THREE.Mesh(shape(1.24, 0.53), new THREE.MeshBasicMaterial({ color: '#ffd23f' })); R3.starGold.position.y = 0.03; star.add(R3.starGold);
  const inner = new THREE.Mesh(shape(0.55, 0.24), new THREE.MeshBasicMaterial({ color: '#fff6c4' })); inner.position.y = 0.04; star.add(inner); R3.starInner = inner;
  const beamTex = canvasTex(4, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,210,63,0)'); gr.addColorStop(1, 'rgba(255,210,63,.6)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.2, 7, 12, 1, true), new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 3.5; star.add(beam); R3.beam = beam;
  const floorGlow = new THREE.Mesh(new THREE.PlaneGeometry(5, 5).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: dotTex, color: '#ffd23f', transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })); floorGlow.position.y = 0.015; star.add(floorGlow);
  R3.sparks = []; for (let i = 0; i < 10; i++) { const s = glowSprite(i % 2 ? '#ffffff' : '#ffd23f', 0.35, 1); star.add(s); R3.sparks.push(s); }
  // particles
  const mkPts = (add, size) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(700 * 3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(700 * 3), 3)); g.setDrawRange(0, 0); const p = new THREE.Points(g, new THREE.PointsMaterial({ size, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, alphaTest: add ? 0 : 0.2 })); p.frustumCulled = false; R3.fx.add(p); return p; };
  R3.ptsAdd = mkPts(true, 0.38); R3.ptsNorm = mkPts(false, 0.2);
}
function setArena(i) {
  if (R3.arenaIdx === i) return;
  if (R3.arena) R3.scene.remove(R3.arena.group);
  R3.arenas = R3.arenas || {}; R3.arena = R3.arenas[i] || (R3.arenas[i] = buildArena3D(ARENAS[i].id));
  R3.scene.add(R3.arena.group); R3.scene.background = R3.arena.bg; R3.scene.fog = R3.arena.fog; R3.arenaIdx = i;
}
function bindMatch(m) {
  if (R3.bound === m) return;
  R3.bound = m; setArena(m.cfg.arena);
  for (const md of R3.pm) { R3.players.remove(md.root); disposeTree(md.root); }
  R3.pm = []; R3.teamMats = [[], []]; R3.ghost = [false, false];
  const kt = [kitTextures(m.kits[0]), kitTextures(m.kits[1]), kitTextures(m.gkKits[0]), kitTextures(m.gkKits[1])];
  for (const p of m.players) {
    const gk = p.role === 'gk', kit = gk ? m.gkKits[p.team] : m.kits[p.team];
    const md = buildPlayer(kit, { skin: p.skin, hair: p.hair, hs: p.hs }, p.num, gk, R3.teamMats[p.team], kt[(gk ? 2 : 0) + p.team]);
    md.ring = new THREE.Mesh(GEO.ring, new THREE.MeshBasicMaterial({ color: p.team === 0 ? '#ffd23f' : '#3ddcff', transparent: true, opacity: 0.95, depthWrite: false })); md.ring.scale.setScalar(0.55); md.ring.position.y = 0.03; md.ring.visible = false; md.root.add(md.ring);
    md.ringGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: dotTex, color: p.team === 0 ? '#ffd23f' : '#3ddcff', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })); md.ringGlow.position.y = 0.025; md.ringGlow.visible = false; md.root.add(md.ringGlow);
    md.stars = new THREE.Group(); for (let k = 0; k < 3; k++) mesh(GEO.oct, new THREE.MeshBasicMaterial({ color: '#ffd23f' }), Math.cos(k * TAU / 3) * 0.3, 0, Math.sin(k * TAU / 3) * 0.3, 0.07, 0.1, 0.07, md.stars, false); md.stars.visible = false; md.root.add(md.stars);
    md.ice = box(md.root, 0.85, 1.85, 0.85, new THREE.MeshPhongMaterial({ color: '#9fe8ff', transparent: true, opacity: 0.45, shininess: 90, specular: 0xffffff, flatShading: true }), 0, 0.92, 0, false); md.ice.visible = false;
    const blob = new THREE.Mesh(R3.blobGeo, R3.blobMat); blob.scale.setScalar(1.3); blob.position.y = 0.014; md.root.add(blob);
    md.yaw = Math.atan2(Math.cos(p.face), Math.sin(p.face));
    R3.players.add(md.root); R3.pm[p.pid] = md;
  }
  R3.cam.x = 0; R3.trail.length = 0;
  if (R3.flags) { R3.scene.remove(R3.flags.g); disposeTree(R3.flags.g); }
  const fg = new THREE.Group(), list = [];
  for (let t = 0; t < 2; t++) {
    const ktx = kitTextures(m.kits[t]);
    for (let k = 0; k < 3; k++) {
      const x = (t === 0 ? -1 : 1) * (2.5 + k * 3.8) + rand(-0.4, 0.4), z = -HH3 - 1.5 - (k % 2) * 0.9, y = 1.95 + (k % 2) * 0.45;
      const piv = new THREE.Group(); piv.position.set(x, y, z); fg.add(piv);
      mesh(GEO.cyl6, mat('#2a2a2a'), 0, 0.15, 0, 0.025, 1.7, 0.025, piv, false);
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.85), new THREE.MeshPhongMaterial({ map: ktx.front, side: THREE.DoubleSide, flatShading: true, shininess: 4 }));
      fl.position.set(0.68, 0.6, 0); piv.add(fl); list.push({ piv, fl, y, ph: Math.random() * 6 });
    }
  }
  R3.scene.add(fg); R3.flags = { g: fg, list };
}
function updateFlags(m) {
  if (!R3.flags) return;
  for (const f of R3.flags.list) { f.piv.rotation.z = Math.sin(m.clock * 3 + f.ph) * 0.18 * (0.5 + m.cheer); f.fl.rotation.y = Math.sin(m.clock * 5 + f.ph) * 0.35; f.piv.position.y = f.y + Math.abs(Math.sin(m.clock * 8 + f.ph)) * 0.25 * m.cheer; }
}
const lerpAng = (a, b, t) => { const d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI; return a + d * t; };
function syncPlayers(m, dt) {
  for (let t = 0; t < 2; t++) { const on = !!(m.power[t] && m.power[t].type === 'fantasma'); if (on !== R3.ghost[t]) { R3.ghost[t] = on; for (const mm of R3.teamMats[t]) { mm.transparent = on; mm.opacity = on ? 0.45 : 1; mm.needsUpdate = true; } } }
  for (const p of m.players) {
    const md = R3.pm[p.pid], root = md.root, body = md.body;
    root.position.set(X3(p.x), 0, Z3(p.y));
    const tgt = Math.atan2(Math.cos(p.face), Math.sin(p.face));
    md.yaw = lerpAng(md.yaw, tgt, Math.min(1, dt * 12)); root.rotation.y = md.yaw;
    const spd = Math.hypot(p.vx, p.vy);
    const o = { run: p.frozen > 0 ? 0 : clamp(spd / 170, 0, 1), ph: p.ph, gk: p.role === 'gk', kick: p.kickT > 0 ? 1 - p.kickT / KICK_T : 0 };
    body.position.set(0, 0, 0); body.rotation.set(0, 0, 0);
    if (p.trick > 0) { const t = 1 - p.trick / TRICK_T; body.rotation.y = t * TAU; body.position.y = Math.sin(t * Math.PI) * 0.35; o.air = true; }
    if (m.phase === 'goal' && p.team === m.scorer && p.role !== 'gk') { body.position.y = Math.abs(Math.sin(m.clock * 9 + p.pid)) * 0.4; o.armsUp = true; o.air = body.position.y > 0.12; }
    let lying = false;
    if (p.lunge > 0) { o.slide = true; body.rotation.x = -0.85; body.position.y = -0.05; }
    else if (p.stun > 0.25 && !p.lungeHit) { body.rotation.x = -1.48; body.position.y = 0.14; o.run = 0; o.lie = true; lying = true; }
    else if (p.dive > 0) { const sg = Math.sign(Math.sin(md.yaw) * (p.diveDir || 1)) || 1; body.rotation.z = sg * 1.25; body.position.y = Math.sin(p.dive / 0.45 * Math.PI) * 0.35 + 0.12; o.armsUp = true; }
    poseModel(md, o);
    const hum = isHuman(m, p) && !m.demo;
    md.ring.visible = md.ringGlow.visible = hum;
    md.stars.visible = p.stun > 0.25 && p.lunge <= 0;
    if (md.stars.visible) { md.stars.position.set(0, lying ? 0.35 : 1.75, lying ? -1.25 : 0); md.stars.rotation.y += dt * 6; }
    md.ice.visible = p.frozen > 0;
  }
}
function syncBall(m, dt) {
  const b = m.ball, bm = R3.ball;
  const x = X3(b.x), y = (b.z + 10) * U, z = Z3(b.y);
  R3.ballBlob.position.x = x; R3.ballBlob.position.z = z; const bs = 0.55 / (1 + b.z / 90); R3.ballBlob.scale.set(bs, 1, bs); R3.ballBlob.material.opacity = clamp(0.5 - b.z / 260, 0.12, 0.5);
  const dx = x - bm.position.x, dz = z - bm.position.z, d = Math.hypot(dx, dz);
  if (d > 1e-4 && d < 2) { R3.axis.set(dz, 0, -dx).normalize(); bm.rotateOnWorldAxis(R3.axis, d / 0.2); }
  bm.position.set(x, y, z);
  const hot = b.super || b.fire;
  R3.ballGlow.visible = hot;
  if (hot) { R3.ballGlow.position.set(x, y, z); R3.ballGlow.material.color.set(b.super ? '#ffd23f' : '#ff6a1a'); const s = (b.super ? 2.4 : 1.6) * (1 + Math.sin(m.clock * 30) * 0.1); R3.ballGlow.scale.set(s, s, 1); }
  bm.material.emissive.set(b.super ? '#7a5a00' : b.fire ? '#6a2200' : '#000000');
  const fast = !b.owner && (Math.hypot(b.vx, b.vy) > 480 || hot);
  if (fast) { R3.trail.push([x, y, z]); if (R3.trail.length > (b.super ? 14 : 8)) R3.trail.shift(); } else if (R3.trail.length) R3.trail.shift();
  const col = b.super ? '#ffd23f' : b.fire ? '#ff6a1a' : '#ffffff', amp = b.super ? 0.75 : b.fire ? 0.6 : 0.25;
  R3.trailS.forEach((s, i) => { const q = R3.trail[i]; if (!q) { s.visible = false; return; } const t = (i + 1) / R3.trail.length; s.visible = true; s.position.set(q[0], q[1], q[2]); const sz = 0.35 + t * (b.super ? 1.0 : 0.4); s.scale.set(sz, sz, 1); s.material.color.set(col); s.material.opacity = t * amp; });
}
function syncFx(m, dt) {
  // particles
  const fill = (pts, add) => {
    const P = pts.geometry.attributes.position.array, C = pts.geometry.attributes.color.array; let n = 0;
    for (const f of m.fx) { if (f.add !== add || n >= 700) continue; const a = clamp(f.t / f.T, 0, 1), k = add ? a : 1; P[n * 3] = X3(f.x); P[n * 3 + 1] = f.z * U + 0.05; P[n * 3 + 2] = Z3(f.y); C[n * 3] = f.c.r * k; C[n * 3 + 1] = f.c.g * k; C[n * 3 + 2] = f.c.b * k; n++; }
    pts.geometry.setDrawRange(0, n); pts.geometry.attributes.position.needsUpdate = true; pts.geometry.attributes.color.needsUpdate = true;
  };
  fill(R3.ptsAdd, true); fill(R3.ptsNorm, false);
  R3.rings.forEach((rg, i) => { const r = m.rings[i]; if (!r) { rg.visible = false; return; } rg.visible = true; rg.position.x = X3(r.x); rg.position.z = Z3(r.y); rg.scale.setScalar(Math.max(0.01, r.r * U)); rg.material.color.set(r.c); rg.material.opacity = r.t / r.T; });
  R3.orbs.forEach((o, i) => { const ob = m.orbs[i]; if (!ob) { o.visible = false; return; } o.visible = ob.t > 2 || Math.sin(m.clock * 20) > 0; o.position.set(X3(ob.x), 0.55 + Math.sin(m.clock * 3 + i) * 0.12, Z3(ob.y)); o.rotation.y += dt * 2.5; });
  for (let s = 0; s < 2; s++) { const on = !!wallActive(m, s); R3.muro[s].visible = on; if (on) R3.muro[s].material.opacity = 0.45 + Math.sin(m.clock * 9) * 0.12; }
  const st = m.star; R3.star.visible = !!st && !(st.t < 3 && Math.sin(m.clock * 20) < 0);
  if (st) {
    const ap = Math.min(1, (m.clock - st.born) * 3), pul = (1 + Math.sin(m.clock * 6) * 0.06) * ap;
    R3.star.position.set(0, 0, 0); R3.starGold.rotation.y = R3.starOut.rotation.y = R3.starInner.rotation.y = m.clock * 0.7;
    R3.starGold.scale.setScalar(pul); R3.starOut.scale.setScalar(pul); R3.starInner.scale.setScalar(pul);
    R3.starOut.material.color.set(lightKit(m.kits[st.team]) ? '#141519' : m.kits[st.team].shirt);
    R3.beam.scale.set(1, ap, 1); R3.beam.position.y = 3.5 * ap; R3.beam.material.opacity = 0.8 + Math.sin(m.clock * 8) * 0.2;
    R3.sparks.forEach((s, k) => { const a = m.clock * 2 + k * TAU / R3.sparks.length, r = 1.6 + Math.sin(m.clock * 3 + k) * 0.2; s.position.set(Math.cos(a) * r, 0.2 + ((m.clock * 0.9 + k * 0.37) % 1) * 2.6, Math.sin(a) * r); });
  }
  const A = R3.arena; for (let s = 0; s < 2; s++) { const gd = A.goals[s].userData, n = m.net[s]; gd.back.position.x = gd.baseX + gd.dir * (n > 0 ? (Math.sin(m.clock * 38) * 0.12 + 0.12) * n : 0); }
}
function updateCamera(m, dt) {
  const b = m.ball, C = R3.cam;
  let tx = clamp(X3(b.x) * 0.75, -(HW3 - 5.6), HW3 - 5.6), tz = Z3(b.y) * 0.3, d = 1.22;
  if (m.demo) d = 1.32;
  if (m.phase === 'goal') { d = 0.9; tx = clamp(X3(b.x) * 0.85, -(HW3 - 4.5), HW3 - 4.5); }
  if (b.super) d = 0.98;
  if (m.phase === 'kickoff' && !m.demo) d = 1.12;
  if (W / H < 16 / 9) d *= 1 + (16 / 9 - W / H) * 0.4;
  const k = Math.min(1, dt * 3.2);
  C.x += (tx - C.x) * k; C.z += (tz - C.z) * k; C.d += (d - C.d) * Math.min(1, dt * 2.2);
  const sh = m.shake * 0.012;
  R3.camera.position.set(C.x + rand(-sh, sh), 9.6 * C.d + rand(-sh, sh), C.z + 14.6 * C.d);
  R3.camera.lookAt(C.x, 0.35, C.z + 1.0);
}
const _v = new THREE.Vector3();
function proj(wx, wy, wz) { _v.set(X3(wx), wz * U, Z3(wy)).project(R3.camera); return [(_v.x + 1) / 2 * W, (1 - _v.y) / 2 * H, _v.z]; }

/* ================= HUD (2D overlay) ================= */
const PKEY = ['X', 'O'], CKEY = ['Z', 'U'];
const COMBO_COLS = ['#3ddcff', '#7a63ff', '#ff3d7f', '#ffd23f'];
function fmtTime(s) { s = Math.ceil(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function meter(c, x, y, w, h, frac, col, right, full, clock, grad) {
  c.fillStyle = 'rgba(10,11,14,.88)'; c.fillRect(x - 3, y - 3, w + 6, h + 6);
  const fw = w * clamp(frac, 0, 1), fx = right ? x + w - fw : x;
  if (grad) { const g = c.createLinearGradient(right ? x + w : x, 0, right ? x : x + w, 0); COMBO_COLS.forEach((cc, i) => g.addColorStop(i / 3, cc)); c.fillStyle = g; } else c.fillStyle = col;
  c.fillRect(fx, y, fw, h);
  c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(fx, y, fw, h * 0.4);
  c.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 1; i < 10; i++) c.fillRect(x + w * i / 10 - 0.5, y, 1, h);
  c.strokeStyle = full ? (Math.sin(clock * 10) > 0 ? col : '#ffffff') : 'rgba(242,238,227,.55)'; c.lineWidth = full ? 2.5 : 1.2; c.strokeRect(x - 3, y - 3, w + 6, h + 6);
}
function hudIcon(c, kind, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s / 24, s / 24); c.translate(-12, -12); c.beginPath();
  const pts = kind === 'bolt' ? [[13.5, 2], [5, 14], [11, 14], [9.8, 22], [19, 10], [13, 10]] : [[12, 2.5], [14.9, 8.5], [21.5, 9.4], [16.7, 14], [17.9, 20.5], [12, 17.4], [6.1, 20.5], [7.3, 14], [2.5, 9.4], [9.1, 8.5]];
  pts.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); c.fill(); c.restore();
}
function gauge(c, x, y, r, o) {
  const pulse = o.ready ? 0.5 + 0.5 * Math.sin(o.clock * 9) : 0;
  if (o.ready) { c.fillStyle = o.col; c.globalAlpha = 0.18 + pulse * 0.22; c.beginPath(); c.arc(x, y, r + 9 + pulse * 4, 0, TAU); c.fill(); c.globalAlpha = 1; }
  c.fillStyle = 'rgba(12,13,17,.9)'; c.beginPath(); c.arc(x, y, r + 4, 0, TAU); c.fill();
  c.lineWidth = 6; c.strokeStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(x, y, r - 2, 0, TAU); c.stroke();
  let st = o.col;
  if (o.grad && c.createConicGradient) { const g = c.createConicGradient(-Math.PI / 2, x, y); COMBO_COLS.forEach((cc, i) => g.addColorStop(i / 4, cc)); g.addColorStop(1, COMBO_COLS[0]); st = g; }
  c.strokeStyle = st; c.lineCap = 'round'; c.beginPath(); c.arc(x, y, r - 2, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(o.frac, 0.002, 1)); c.stroke(); c.lineCap = 'butt';
  if (o.ready || o.active) { c.fillStyle = o.col; c.beginPath(); c.arc(x, y, r - 7, 0, TAU); c.fill(); }
  c.fillStyle = o.ready || o.active ? '#141519' : o.col; hudIcon(c, o.icon, x, y, r * 0.95);
  c.textAlign = 'center'; c.textBaseline = 'middle';
  if (o.ready && o.key) { c.font = `11px ${DISP}`; const kw = c.measureText(o.key).width + 16; c.fillStyle = o.col; rr(c, x - kw / 2, y + r + 9, kw, 20, 6); c.fill(); c.fillStyle = '#141519'; c.fillText(o.key, x, y + r + 20); }
  else { c.font = `11px ${DISP}`; c.fillStyle = o.active ? o.col : '#d9d5ca'; c.fillText(o.label, x, y + r + 19); }
}
function teamPlate(c, m, t) {
  const right = t === 1, Pw = POWERS[m.teams[t].power], pw = m.power[t], starMine = m.star && m.star.team === t, keyed = m.human[t] && !m.demo;
  const pwX = right ? W - 70 : 70, coX = right ? W - 160 : 160, gy = 642, r = 30, px = right ? W - 16 - 200 : 16;
  c.fillStyle = 'rgba(12,13,17,.62)'; rr(c, px, 566, 200, 144, 16); c.fill();
  c.fillStyle = m.kits[t].shirt; rr(c, px + 16, 574, 168, 4, 2); c.fill();
  c.textBaseline = 'middle'; c.textAlign = right ? 'right' : 'left'; c.font = `14px ${DISP}`; c.fillStyle = '#f2eee3';
  c.fillText(m.teams[t].short + (keyed ? '  J' + (t + 1) : '  CPU'), right ? px + 184 : px + 16, 593);
  c.textAlign = right ? 'left' : 'right'; c.font = `700 14px ${BODY}`; c.fillStyle = '#3ddcff'; c.fillText('★ ' + m.style[t], right ? px + 16 : px + 184, 593);
  gauge(c, pwX, gy, r, { frac: pw ? pw.t / pw.T : m.meter[t] / 100, col: Pw.color, ready: m.meter[t] >= 100 && !pw, active: !!pw, icon: 'bolt', label: pw ? 'ACTIVO' : Pw.name.toUpperCase(), key: keyed ? 'PULSA ' + PKEY[t] : 'LISTO', clock: m.clock });
  gauge(c, coX, gy, r, { frac: starMine ? m.star.t / m.star.T : m.comboM[t] / 100, col: '#3ddcff', grad: !starMine, ready: m.comboM[t] >= 100 && !m.star, active: !!starMine, icon: 'star', label: starMine ? 'ESTRELLA' : 'COMBO', key: keyed ? 'PULSA ' + CKEY[t] : 'LISTO', clock: m.clock });
}
function drawScoreBug(c, m, k, touch) {
  c.save(); c.translate(W / 2, 0); c.scale(k, k);
  c.fillStyle = 'rgba(12,13,17,.88)'; rr(c, -280, 8, 560, 58, 14); c.fill();
  c.strokeStyle = 'rgba(242,238,227,.18)'; c.lineWidth = 1.5; c.stroke();
  for (let t = 0; t < 2; t++) {
    const sg = t === 0 ? -1 : 1;
    c.fillStyle = m.kits[t].shirt; rr(c, t === 0 ? -272 : 266, 16, 6, 42, 3); c.fill();
    kitSwatch(c, sg * 236 - 15, 22, 30, m.kits[t]);
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `22px ${DISP}`; c.fillStyle = '#f2eee3'; c.fillText(m.teams[t].short, sg * 166, 31);
    c.font = `700 13px ${BODY}`; c.fillStyle = m.human[t] && !m.demo ? (t === 0 ? '#ffd23f' : '#3ddcff') : '#a3a5ae';
    c.fillText(touch ? (m.human[t] && !m.demo ? 'J' + (t + 1) : 'CPU') + ' · ★ ' + m.style[t] : (m.human[t] && !m.demo ? 'JUGADOR ' + (t + 1) : 'CPU'), sg * 166, 52);
  }
  c.fillStyle = '#ffd23f'; rr(c, -96, 14, 192, 46, 9); c.fill();
  c.fillStyle = '#141519'; c.textAlign = 'center'; c.font = `34px ${DISP}`; c.fillText(m.score[0], -46, 38); c.fillText(m.score[1], 46, 38); c.font = `18px ${DISP}`; c.fillText('-', 0, 36);
  c.fillStyle = m.golden ? '#ff3d7f' : '#f2eee3'; rr(c, -56, 60, 112, 24, 7); c.fill();
  c.fillStyle = '#141519'; c.font = `14px ${DISP}`; c.fillText(m.golden ? 'GOL DE ORO' : fmtTime(m.time), 0, 73);
  let y = 104;
  if (m.star) { const mine = m.human[m.star.team] && !m.demo, msg = mine ? `¡LLEVA EL BALÓN A LA ESTRELLA! ${Math.ceil(m.star.t)}` : `${m.teams[m.star.team].short} BUSCA LA ESTRELLA · ${Math.ceil(m.star.t)}`; c.font = `14px ${DISP}`; const tw = c.measureText(msg).width + 30; c.fillStyle = 'rgba(12,13,17,.82)'; rr(c, -tw / 2, y - 13, tw, 26, 13); c.fill(); c.fillStyle = Math.sin(m.clock * 8) > 0 ? '#ffd23f' : '#f2eee3'; c.fillText(msg, 0, y); y += 32; }
  if (touch) for (let t = 0; t < 2; t++) { const pw = m.power[t]; if (pw && !(m.human[t] && t === 0)) { const msg = m.teams[t].short + ' · ' + POWERS[pw.type].name.toUpperCase(); c.font = `13px ${DISP}`; const tw = c.measureText(msg).width + 26; c.fillStyle = 'rgba(12,13,17,.8)'; rr(c, -tw / 2, y - 12, tw, 24, 12); c.fill(); c.fillStyle = POWERS[pw.type].color; c.fillText(msg, 0, y); y += 30; } }
  c.restore();
}
function drawLegend(c, m) {
  if (m.demo || !m.human[0] || m.clock > 8) return;
  const a = clamp((8 - m.clock) / 1.5, 0, 1), two = !!m.human[1];
  const items = two ? ['J1  WASD · C PASE · V TIRO · B TRUCO · X PODER · Z COMBO', 'J2  FLECHAS · K PASE · L TIRO · Ñ TRUCO · O PODER · U COMBO'] : ['WASD O FLECHAS MOVER  ·  C PASE  ·  V TIRO  ·  B TRUCO  ·  X PODER  ·  Z COMBO'];
  c.save(); c.globalAlpha = a; c.font = `12px ${DISP}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  items.forEach((s2, i) => { const tw = c.measureText(s2).width + 30, y = 600 + i * 30 - (two ? 15 : 0); c.fillStyle = 'rgba(12,13,17,.8)'; rr(c, W / 2 - tw / 2, y - 12, tw, 24, 12); c.fill(); c.fillStyle = '#f2eee3'; c.fillText(s2, W / 2, y); });
  c.restore();
}
function drawHUD(m) {
  const c = hctx, touch = compactHUD();
  drawScoreBug(c, m, touch ? uiK() : 1, touch);
  if (!touch) { teamPlate(c, m, 0); teamPlate(c, m, 1); drawLegend(c, m); }
}
function bigText(s, sub, col, sc, alpha = 1) {
  const c = hctx;
  const bk = Math.min(uiK(), 1.35, W / 900); c.save(); c.globalAlpha = alpha; c.translate(W / 2, H / 2 - 40); c.rotate(-0.05); c.scale((0.6 + 0.4 * sc) * bk, (0.6 + 0.4 * sc) * bk);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `${s.length > 12 ? 70 : 92}px ${DISP}`;
  c.fillStyle = 'rgba(0,0,0,.55)'; c.fillText(s, 10, 10);
  c.fillStyle = '#ff3d7f'; c.fillText(s, 5, 5);
  c.fillStyle = col; c.fillText(s, 0, 0);
  if (sub) { c.font = `700 30px ${BODY}`; c.fillStyle = '#f2eee3'; c.lineWidth = 6; c.strokeStyle = '#141519'; c.strokeText(sub.toUpperCase(), 0, 62); c.fillText(sub.toUpperCase(), 0, 62); }
  c.restore();
}
function drawOverlay(m) {
  const c = hctx;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, hud.width, hud.height);
  c.setTransform(SCALE * DPR, 0, 0, SCALE * DPR, 0, 0);
  const vg = c.createRadialGradient(W / 2, H * 0.52, H * 0.42, W / 2, H * 0.52, H * 1.02); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.4)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  if (m.flash > 0) { c.fillStyle = `rgba(255,250,230,${m.flash * 0.5})`; c.fillRect(0, 0, W, H); }
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  for (const p of m.players) {
    if (isHuman(m, p) && !m.demo) {
      const q = proj(p.x, p.y, 125 + Math.sin(m.clock * 6) * 4), col = p.team === 0 ? '#ffd23f' : '#3ddcff';
      c.fillStyle = col; c.beginPath(); c.moveTo(q[0] - 10, q[1] - 14); c.lineTo(q[0] + 10, q[1] - 14); c.lineTo(q[0], q[1]); c.closePath(); c.fill(); c.strokeStyle = '#141519'; c.lineWidth = 1.6; c.stroke();
      c.fillStyle = '#141519'; c.font = `11px ${DISP}`; c.fillText(p.team + 1, q[0], q[1] - 9);
    }
    if (p.charge > 0) { const q = proj(p.x, p.y, 145); c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(q[0] - 21, q[1] - 4, 42, 8); c.fillStyle = p.charge > 0.9 ? '#ff3d7f' : '#ffd23f'; c.fillRect(q[0] - 20, q[1] - 3, 40 * p.charge, 6); }
  }
  if (m.star) { const q = proj(F.cx, F.cy, 210); const lbl = (m.human[m.star.team] && !m.demo ? 'J' + (m.star.team + 1) + ' · ' : '') + Math.ceil(m.star.t) + 's'; c.font = `17px ${DISP}`; c.lineWidth = 5; c.strokeStyle = '#141519'; c.strokeText(lbl, q[0], q[1]); c.fillStyle = '#ffd23f'; c.fillText(lbl, q[0], q[1]); }
  for (const t of m.txt) {
    const q = proj(t.wx, t.wy, t.wz); if (q[2] > 1) continue;
    c.globalAlpha = clamp(t.t / 0.4, 0, 1); c.font = `${Math.round(t.size * uiK())}px ${DISP}`;
    c.lineWidth = 5; c.strokeStyle = '#141519'; c.strokeText(t.s, q[0], q[1]); c.fillStyle = t.c; c.fillText(t.s, q[0], q[1]);
  }
  c.globalAlpha = 1;
  drawHUD(m);
  if (m.phase === 'kickoff' && !m.demo) bigText(m.phaseT > 0.4 ? 'LISTOS' : '¡YA!', null, '#f2eee3', 1);
  if (m.banner) { const bn = m.banner, k = 1 - bn.t / bn.T; bigText(bn.s, bn.sub, bn.c, Math.min(1, k * 6), bn.t < 0.3 ? bn.t / 0.3 : 1); }
}
function render(m, dt) {
  if (!m) return;
  bindMatch(m);
  R3.arena.update(m.clock, dt, m);
  syncPlayers(m, dt); syncBall(m, dt); syncFx(m, dt); updateFlags(m); updateCamera(m, dt);
  R3.r.render(R3.scene, R3.camera);
  drawOverlay(m);
}
function resize() {
  const app = $('#app'), r = app.getBoundingClientRect(), tb = $('.topbar');
  const playing = UI.screen === null;
  const portrait = touchOn && playing && r.height > r.width * 1.05;
  app.classList.toggle('portrait', portrait);
  const availH = portrait ? Math.max(160, r.height * 0.5) : r.height;
  W = portrait ? 900 : (touchOn && playing) ? Math.round(H * clamp(r.width / availH, 16 / 9, 2.3)) : 1280;
  SCALE = Math.min(r.width / W, availH / H);
  const cw = Math.max(1, Math.floor(W * SCALE)), ch = Math.max(1, Math.floor(H * SCALE));
  DPR = Math.min(window.devicePixelRatio || 1, QUAL.maxPR);
  if (R3.r) { R3.r.setPixelRatio(DPR); R3.r.setSize(cw, ch, false); R3.camera.aspect = W / H; R3.camera.updateProjectionMatrix(); }
  for (const el of [cvs, hud]) { el.style.width = cw + 'px'; el.style.height = ch + 'px'; }
  hud.width = Math.floor(cw * DPR); hud.height = Math.floor(ch * DPR);
  const cr = cvs.getBoundingClientRect();
  if (!playing) { tb.style.top = tb.style.right = ''; }
  else if (portrait) { app.style.setProperty('--ctrlTop', Math.round(cr.bottom - r.top + 6) + 'px'); tb.style.top = tb.style.right = ''; }
  else { tb.style.top = Math.round(cr.top - r.top + 10) + 'px'; tb.style.right = Math.round(r.right - cr.right + 10) + 'px'; }
}
const compactHUD = () => touchOn && UI.screen === null && G && !G.demo;
const uiK = () => compactHUD() ? clamp(0.8 / SCALE, 1, Math.min(1.9, (W - 40) / 560)) : 1;

/* ================= INPUT ================= */
const keys = new Set(), latch = new Set();
const BIND = [
  { up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'], pass: ['KeyC'], shoot: ['KeyV'], trick: ['KeyB'], power: ['KeyX'], combo: ['KeyZ'] },
  { up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'], pass: ['KeyK', 'Numpad1'], shoot: ['KeyL', 'Numpad2'], trick: ['Semicolon', 'Numpad3'], power: ['KeyO', 'Numpad0'], combo: ['KeyU', 'NumpadAdd'] }
];
const ACTS = ['pass', 'shoot', 'trick', 'power', 'combo'];
const GAME_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter', 'Tab']);
const prevA = [{}, {}];
const TOUCH = { mx: 0, my: 0, pass: false, shoot: false, trick: false, power: false, combo: false };
let touchOn = false;
function padFor(i, mode) {
  const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
  if (mode === '1p') return i === 0 ? pads[0] : null;
  return pads[i] || null;
}
function readInputs() {
  const mode = G ? G.cfg.mode : '1p', out = [];
  for (let i = 0; i < 2; i++) {
    const binds = mode === '1p' && i === 0 ? BIND : [BIND[i]];
    const on = cs => cs.some(c => keys.has(c) || latch.has(c));
    let mx = 0, my = 0; const A = { pass: false, shoot: false, trick: false, power: false, combo: false };
    for (const bd of binds) { if (on(bd.left)) mx -= 1; if (on(bd.right)) mx += 1; if (on(bd.up)) my -= 1; if (on(bd.down)) my += 1; for (const a of ACTS) if (on(bd[a])) A[a] = true; }
    const kl = Math.hypot(mx, my); if (kl > 1) { mx /= kl; my /= kl; }
    const pad = padFor(i, mode);
    if (pad) {
      const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0; if (Math.hypot(ax, ay) > 0.25) { mx += ax; my += ay; }
      const bt = n => pad.buttons[n] && pad.buttons[n].pressed;
      if (bt(14)) mx -= 1; if (bt(15)) mx += 1; if (bt(12)) my -= 1; if (bt(13)) my += 1;
      if (bt(0)) A.pass = true; if (bt(1)) A.shoot = true; if (bt(2)) A.trick = true; if (bt(3)) A.power = true; if (bt(5)) A.combo = true;
    }
    if (i === 0 && touchOn) { mx += TOUCH.mx; my += TOUCH.my; for (const a of ACTS) if (TOUCH[a] || latch.has('T_' + a)) A[a] = true; }
    const r = { mx: clamp(mx, -1, 1), my: clamp(my, -1, 1) };
    for (const a of ACTS) { const p = !!prevA[i][a]; r[a] = { h: A[a], jd: A[a] && !p }; prevA[i][a] = A[a]; }
    out.push(r);
  }
  latch.clear();
  return out;
}
function clearEdges(inp) { for (const r of inp) for (const a of ACTS) r[a].jd = false; }
let padStartPrev = false;
function pollPadPause() {
  const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
  const st = pads.some(p => p.buttons[9] && p.buttons[9].pressed);
  if (st && !padStartPrev) { if (UI.screen === null) pauseGame(); else if (UI.screen === 'scrPause') resumeGame(); }
  padStartPrev = st;
}

/* ================= 3D preview in team select ================= */
const PV = { r: null };
function initPreview() {
  const c = document.createElement('canvas'); c.width = c.height = 440;
  PV.r = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true, preserveDrawingBuffer: true }); PV.r.setPixelRatio(1); PV.r.setSize(440, 440, false); PV.canvas = c;
  PV.r.shadowMap.enabled = true;
  PV.scene = new THREE.Scene();
  PV.scene.add(new THREE.HemisphereLight(0xffffff, 0x404050, 0.85), new THREE.AmbientLight(0xffffff, 0.15));
  const d = new THREE.DirectionalLight(0xffffff, 0.85); d.position.set(2, 5, 3); d.castShadow = true; PV.scene.add(d);
  const disc = mesh(GEO.cyl8, mat('#2a2c33'), 0, -0.05, 0, 1.15, 0.1, 1.15, PV.scene, false); disc.receiveShadow = true;
  PV.cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50); PV.cam.position.set(0, 1.45, 4.4); PV.cam.lookAt(0, 0.85, 0);
  PV.ball = makeBall(); PV.ball.scale.setScalar(0.17); PV.scene.add(PV.ball);
  PV.models = [null, null]; PV.keys = ['', ''];
}
function drawPreview(s, now) {
  if (!PV.r) initPreview();
  const T = TEAMS[sel.t[s]], away = s === 1 && kitsClash(TEAMS[sel.t[0]].kit, T.kit), kit = away ? awayKit(T.kit) : T.kit, key = sel.t[s] + (away ? 'a' : 'h');
  if (PV.keys[s] !== key) {
    if (PV.models[s]) { PV.scene.remove(PV.models[s].root); disposeTree(PV.models[s].root); }
    PV.models[s] = buildPlayer(kit, { skin: SKINS[(sel.t[s] * 3) % 6], hair: HAIRS[sel.t[s] % 6], hs: sel.t[s] % 6 }, 10, false, []);
    PV.scene.add(PV.models[s].root); PV.keys[s] = key;
  }
  PV.models.forEach((md, i) => { if (md) md.root.visible = i === s; });
  const md = PV.models[s], t = now / 1000, ph = (t * 1.6) % 1;
  md.root.rotation.y = (s ? -0.55 : 0.55) + Math.sin(t * 0.7) * 0.4;
  poseModel(md, { run: 0, kick: ph < 0.22 ? ph / 0.22 : 0, look: 0 });
  const fwd = new THREE.Vector3(0.12, 0, 0.32).applyAxisAngle(new THREE.Vector3(0, 1, 0), md.root.rotation.y);
  PV.ball.position.set(fwd.x, 0.17 + Math.sin(ph * Math.PI) * 1.0, fwd.z); PV.ball.rotation.x += 0.08;
  PV.r.render(PV.scene, PV.cam);
  const g = $('#prev' + s).getContext('2d'); g.clearRect(0, 0, 440, 440);
  const gr = g.createRadialGradient(220, 250, 20, 220, 250, 230); gr.addColorStop(0, kit.shirt + '66'); gr.addColorStop(1, 'rgba(20,21,25,0)'); g.fillStyle = gr; g.fillRect(0, 0, 440, 440);
  g.drawImage(PV.canvas, 0, 0);
}

/* ================= UI ================= */
const UI = { screen: 'scrTitle' };
const SCREENS = ['scrTitle', 'scrSelect', 'scrControls', 'scrPause', 'scrEnd'];
function show(id) { for (const s of SCREENS) $('#' + s).hidden = s !== id; UI.screen = id; if (id === null && document.activeElement && document.activeElement.blur) document.activeElement.blur(); $('#touch').hidden = !(id === null && touchOn && G && !G.demo); TB.last = ''; resize(); }
const sel = { mode: '1p', t: [store.get('cg_t0', 0), store.get('cg_t1', 1)], arena: store.get('cg_arena', 0), minutes: 3, diff: 1 };
let G = null, paused = false, ctlReturn = 'scrTitle';
function demoCfg() { const a = (Math.random() * TEAMS.length) | 0; let b = (Math.random() * TEAMS.length) | 0; if (b === a) b = (a + 3) % TEAMS.length; return { mode: 'demo', teams: [a, b], arena: (Math.random() * ARENAS.length) | 0, minutes: 3, diff: 1 }; }
function goTitle() {
  SILENT = true; G = newMatch(demoCfg()); paused = false;
  show('scrTitle'); $('#btnPause').hidden = true; $('#touch').hidden = true; touchOn = false;
  playTrack('menu');
  setTimeout(() => { const b = document.querySelector('#scrTitle .btn'); if (b && b.focus) b.focus({ preventScroll: true }); }, 30);
}
function openSelect(mode) {
  sel.mode = mode; show('scrSelect');
  $('#tag1').textContent = mode === '1p' ? 'CPU' : 'Jugador 2'; $('#tag1').className = 'tag ' + (mode === '1p' ? 'cpu' : 'p2');
  $('#optDiffWrap').hidden = mode !== '1p';
  updateSelect(); $('#btnPlay').focus({ preventScroll: true });
}
function updateSelect() {
  for (let s = 0; s < 2; s++) {
    const T = TEAMS[sel.t[s]], Pw = POWERS[T.power];
    $('#tname' + s).textContent = T.name; $('#tkind' + s).textContent = T.kind === 'Urbano' ? 'Equipo urbano' : 'Selección · colores oficiales';
    $('#tpow' + s).innerHTML = `<b style="color:${Pw.color}">PODER: ${Pw.name.toUpperCase()}</b><br>${Pw.desc}`;
    $('#tpow' + s).style.borderLeftColor = Pw.color;
    $('#tstat' + s).innerHTML = [['Velocidad', T.spd], ['Tiro', T.shot], ['Control', T.ctrl]].map(([n, v]) => `<dt>${n}</dt><dd><i style="width:${v * 10}%"></i></dd>`).join('');
  }
  chips('#optArena', ARENAS.map(a => a.name), sel.arena, i => { sel.arena = i; store.set('cg_arena', i); updateSelect(); });
  chips('#optTime', ['2 min', '3 min', '5 min'], [2, 3, 5].indexOf(sel.minutes), i => { sel.minutes = [2, 3, 5][i]; updateSelect(); });
  chips('#optDiff', DIFF.map(d => d.name), sel.diff, i => { sel.diff = i; updateSelect(); });
}
function chips(root, labels, active, fn) {
  const el = $(root); el.innerHTML = '';
  labels.forEach((l, i) => { const b = document.createElement('button'); b.className = 'chip'; b.id = root.slice(1) + '_' + i; b.textContent = l; b.setAttribute('aria-pressed', i === active ? 'true' : 'false'); b.onclick = () => fn(i); el.appendChild(b); });
}
function cycleTeam(s, d) { sel.t[s] = (sel.t[s] + d + TEAMS.length) % TEAMS.length; store.set('cg_t' + s, sel.t[s]); updateSelect(); if (AU.ctx) { const t = AU.ctx.currentTime; tone('triangle', 660, t, 0.06, 0.12, AU.sfx); } }
function startMatch(cfg) {
  auInit();
  SILENT = false; G = newMatch(cfg); paused = false;
  touchOn = matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints > 0 && !matchMedia('(pointer: fine)').matches);
  show(null); $('#btnPause').hidden = false;
  playTrack('game');
}
function pauseGame() { if (!G || G.phase === 'end' || G.demo) return; paused = true; show('scrPause'); $('#btnResume').focus({ preventScroll: true }); }
function resumeGame() { paused = false; show(null); }
function endMatch(m) {
  m.phase = 'end'; sfx.whistle(3);
  setTimeout(() => {
    if (G !== m) return;
    if (m.demo) { G = newMatch(demoCfg()); return; }
    const [a, b] = m.score, w = a === b ? -1 : a > b ? 0 : 1;
    const who = t => m.human[t] ? (m.cfg.mode === '2p' ? `Jugador ${t + 1}` : 'Tú') : 'CPU';
    $('#endTitle').textContent = w < 0 ? 'Empate' : `¡Gana ${m.teams[w].name}!` + (m.cfg.mode === '1p' ? (w === 0 ? ' Bien jugado' : '') : ` · ${who(w)}`);
    $('#endScore').textContent = `${m.teams[0].short} ${a} – ${b} ${m.teams[1].short}`;
    const S = m.stats;
    $('#endStats').innerHTML = `<thead><tr><th></th><th>${m.teams[0].short}</th><th>${m.teams[1].short}</th></tr></thead><tbody>` +
      [['Puntos de estilo', null], ['Tiros', 'shots'], ['Súper cañonazos', 'supers'], ['Trucos', 'tricks'], ['Robos', 'steals']].map(([n, k]) => `<tr><td>${n}</td><td>${k ? S[0][k] : m.style[0]}</td><td>${k ? S[1][k] : m.style[1]}</td></tr>`).join('') + '</tbody>';
    show('scrEnd'); $('#btnPause').hidden = true; $('#touch').hidden = true;
    $('#btnRematch').focus({ preventScroll: true });
    if (AU.ctx) playTrack('menu');
  }, 1400);
}
function cfgFromSel() { return { mode: sel.mode, teams: [...sel.t], arena: sel.arena, minutes: sel.minutes, diff: sel.diff }; }

document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
  auInit(); const g = b.dataset.go;
  if (g === 'controls') { ctlReturn = 'scrTitle'; show('scrControls'); } else openSelect(g);
}));
document.querySelectorAll('.arrow').forEach(b => b.addEventListener('click', () => cycleTeam(+b.dataset.side, +b.dataset.d)));
$('#btnBack').onclick = () => show('scrTitle');
$('#btnPlay').onclick = () => startMatch(cfgFromSel());
$('#btnCtlBack').onclick = () => show(ctlReturn);
$('#btnResume').onclick = resumeGame;
$('#btnRestart').onclick = () => startMatch(G.cfg);
$('#btnPauseCtl').onclick = () => { ctlReturn = 'scrPause'; show('scrControls'); };
$('#btnQuit').onclick = goTitle;
$('#btnRematch').onclick = () => startMatch(G.cfg);
$('#btnChange').onclick = () => { const mode = G.cfg.mode; goTitle(); openSelect(mode); };
$('#btnMenu').onclick = goTitle;
$('#btnPause').onclick = () => { UI.screen === null ? pauseGame() : UI.screen === 'scrPause' && resumeGame(); };
const mBtn = $('#btnMusic');
function syncMusicBtn() { mBtn.setAttribute('aria-pressed', AU.on ? 'true' : 'false'); }
syncMusicBtn();
mBtn.onclick = () => { auInit(); AU.on = !AU.on; store.set('cg_music', AU.on); if (AU.music) AU.music.gain.setTargetAtTime(AU.on ? 0.42 : 0, AU.ctx.currentTime, 0.05); syncMusicBtn(); if (mBtn.blur) mBtn.blur(); };

window.addEventListener('pointerdown', () => auInit(), { capture: true });
window.addEventListener('keydown', e => {
  auInit();
  if (touchOn && UI.screen === null && /^(Key[WASDCVBXZ]|Arrow)/.test(e.code)) setTouch(false);
  if (UI.screen === null && GAME_KEYS.has(e.code)) e.preventDefault();
  if (!keys.has(e.code)) latch.add(e.code);
  keys.add(e.code);
  if (UI.screen === null && (e.code === 'Escape' || e.code === 'KeyP')) { pauseGame(); return; }
  if (UI.screen === 'scrPause' && (e.code === 'Escape' || e.code === 'KeyP')) { resumeGame(); return; }
  if (UI.screen === 'scrSelect') {
    if (e.code === 'KeyA') cycleTeam(0, -1); else if (e.code === 'KeyD') cycleTeam(0, 1);
    else if (e.code === 'ArrowLeft') { e.preventDefault(); cycleTeam(1, -1); } else if (e.code === 'ArrowRight') { e.preventDefault(); cycleTeam(1, 1); }
    else if (e.code === 'Escape') show('scrTitle');
  } else if (UI.screen === 'scrControls' && e.code === 'Escape') show(ctlReturn);
});
window.addEventListener('keyup', e => keys.delete(e.code));
window.addEventListener('blur', () => keys.clear());
document.addEventListener('visibilitychange', () => { if (document.hidden && UI.screen === null) pauseGame(); });

(() => {
  const zone = $('#stickZone'), stick = $('#stick'), knob = $('#knob'); let sid = null, ox = 0, oy = 0;
  const upd = e => { let dx = (e.clientX - ox) / 50, dy = (e.clientY - oy) / 50; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } TOUCH.mx = dx; TOUCH.my = dy; knob.style.transform = `translate(${dx * 38}px,${dy * 38}px)`; };
  zone.addEventListener('pointerdown', e => { e.preventDefault(); if (sid !== null) return; sid = e.pointerId; try { zone.setPointerCapture(sid); } catch (er) {} const r = zone.getBoundingClientRect(); ox = e.clientX; oy = e.clientY; stick.style.left = (ox - r.left) + 'px'; stick.style.top = (oy - r.top) + 'px'; stick.classList.add('on'); upd(e); });
  zone.addEventListener('pointermove', e => { if (e.pointerId === sid) upd(e); });
  const end = e => { if (e.pointerId !== sid) return; sid = null; TOUCH.mx = TOUCH.my = 0; knob.style.transform = ''; stick.classList.remove('on'); stick.style.left = stick.style.top = ''; };
  zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
  document.querySelectorAll('#tbtns .tb').forEach(b => {
    const a = b.dataset.a;
    b.addEventListener('pointerdown', e => { e.preventDefault(); TOUCH[a] = true; latch.add('T_' + a); b.classList.add('down'); try { b.setPointerCapture(e.pointerId); } catch (er) {} try { if (navigator.vibrate) navigator.vibrate(10); } catch (er) {} });
    const up = () => { TOUCH[a] = false; b.classList.remove('down'); };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
    b.addEventListener('contextmenu', e => e.preventDefault());
  });
})();
function setTouch(on) { if (touchOn === on) return; touchOn = on; $('#touch').hidden = !(on && UI.screen === null && G && !G.demo); resize(); }
window.addEventListener('touchstart', () => { if (G && !G.demo && UI.screen === null) setTouch(true); }, { passive: true });
const TB = { shoot: $('#tbtns [data-a="shoot"]'), pass: $('#tbtns [data-a="pass"]'), trick: $('#tbtns [data-a="trick"]'), power: $('#tbtns [data-a="power"]'), combo: $('#tbtns [data-a="combo"]'), last: '' };
const ICONS = {
  shoot: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 7.2l4.2 3.1-1.6 4.9H9.4L7.8 10.3z" fill="currentColor"/></svg>',
  slide: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5l8 10h8"/><path d="M16 11l4 4-4 4"/></svg>',
  pass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h14M13 6l6 6-6 6"/></svg>',
  swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h13l-3.5-3.5M19 16H6l3.5 3.5"/></svg>',
  trick: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.2 7.3 7.3 2.2-7.3 2.2-2.2 7.3-2.2-7.3L2.5 12l7.3-2.2z" fill="currentColor"/></svg>',
  sprint: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 6l6 6-6 6M12 6l6 6-6 6"/></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="M13.5 2L5 14h6l-1.2 8L19 10h-6z" fill="currentColor"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor"/></svg>'
};
function setTB(b, icon, label) { if (b.dataset.icon !== icon) { b.querySelector('.ic').innerHTML = ICONS[icon]; b.dataset.icon = icon; } const l = b.querySelector('b'); if (l.textContent !== label) l.textContent = label; }
function updateTouchUI() {
  if (!touchOn || !G || G.demo || !G.human[0]) return;
  const m = G, p = m.players[m.human[0].pid], has = m.ball.owner === p, pw = m.power[0], starMine = m.star && m.star.team === 0;
  const rp = m.meter[0] >= 100 && !pw, rc = m.comboM[0] >= 100 && !m.star;
  const pp = Math.round(pw ? pw.t / pw.T * 100 : m.meter[0]), pc = Math.round(starMine ? m.star.t / m.star.T * 100 : m.comboM[0]);
  const key = [has, rp, rc, !!pw, starMine, pp >> 2, pc >> 2].join('|');
  if (key === TB.last) return; TB.last = key;
  setTB(TB.shoot, has ? 'shoot' : 'slide', has ? 'TIRO' : 'BARRIDA');
  setTB(TB.pass, has ? 'pass' : 'swap', has ? 'PASE' : 'CAMBIO');
  setTB(TB.trick, has ? 'trick' : 'sprint', has ? 'TRUCO' : 'SPRINT');
  setTB(TB.power, 'bolt', pw ? 'ACTIVO' : POWERS[m.teams[0].power].name.toUpperCase());
  setTB(TB.combo, 'star', starMine ? 'ESTRELLA' : 'COMBO');
  TB.power.style.setProperty('--p', pp); TB.combo.style.setProperty('--p', pc);
  TB.power.classList.toggle('ready', rp); TB.power.classList.toggle('active', !!pw);
  TB.combo.classList.toggle('ready', rc); TB.combo.classList.toggle('active', !!starMine);
}
const btnFull = $('#btnFull');
if (document.fullscreenEnabled || document.webkitFullscreenEnabled) btnFull.hidden = false;
btnFull.onclick = () => {
  const d = document, el = d.documentElement;
  if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!req) return;
  Promise.resolve(req.call(el)).then(() => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }).catch(() => {});
  if (btnFull.blur) btnFull.blur();
};

/* ================= LOOP ================= */
let last = performance.now();
const MAX_SUB = 1 / 90;
function adaptQuality(raw) {
  if (QUAL.warm < 3) { QUAL.warm += raw; return; }
  QUAL.acc += raw; QUAL.n++;
  if (QUAL.acc < 2.5) return;
  const avg = QUAL.acc / QUAL.n; QUAL.acc = 0; QUAL.n = 0;
  if (avg <= 0.026) return;
  if (DPR > 1.01) { QUAL.maxPR = Math.max(1, DPR - 0.35); resize(); }
  else if (!QUAL.noShadow) { QUAL.noShadow = true; R3.r.shadowMap.enabled = false; R3.scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(mm => { mm.needsUpdate = true; }); }); }
}
function frame(now) {
  const raw = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now;
  let dt = Math.min(0.05, raw);
  pollPadPause();
  if (G && !paused && UI.screen !== 'scrPause') {
    const inp = readInputs();
    if (G.slow > 0) { G.slow -= dt; dt *= 0.3; }
    dt *= GAME_SPEED;
    const n = Math.max(1, Math.ceil(dt / MAX_SUB)), h = dt / n;
    for (let i = 0; i < n; i++) { step(G, h, inp); if (i === 0) clearEdges(inp); }
  } else dt = 0;
  render(G, Math.max(dt, 0.0001));
  updateTouchUI();
  if (UI.screen === 'scrSelect') { drawPreview(0, now); drawPreview(1, now); }
  if (!document.hidden) adaptQuality(raw);
  requestAnimationFrame(frame);
}
window.addEventListener('resize', resize);
initGL(); resize();
window.__calleGol = { get match() { return G; } };
const boot = () => { goTitle(); requestAnimationFrame(t => { last = t; frame(t); }); };
if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]).then(boot); else boot();
})();
