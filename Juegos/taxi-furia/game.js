(() => {
'use strict';
const $ = id => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
let COARSE = false;
try { COARSE = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); } catch (e) { COARSE = false; }
if (COARSE) document.body.classList.add('coarse');

/* =====================================================================
   RENDER / ESCENA
===================================================================== */
const renderer = new THREE.WebGLRenderer({ antialias: !COARSE });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, COARSE ? 1.25 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const SKY = 0xa9b9c9;
const scene = new THREE.Scene();
scene.background = new THREE.Color(SKY);
(function () {
  const c = document.createElement('canvas'); c.width = 8; c.height = 256;
  const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#4f7fb5'); gr.addColorStop(0.45, '#a9b9c9'); gr.addColorStop(1, '#a9b9c9');
  g.fillStyle = gr; g.fillRect(0, 0, 8, 256);
  scene.background = new THREE.CanvasTexture(c);
})();
scene.fog = new THREE.Fog(SKY, 45, 190);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 900);
camera.rotation.order = 'YXZ';
scene.add(camera);

scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x44454f, 0.8));
const sun = new THREE.DirectionalLight(0xfff0d2, 0.95);
sun.castShadow = true;
sun.shadow.mapSize.set(COARSE ? 1024 : 2048, COARSE ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 1, far: 320 });
scene.add(sun, sun.target);

const muzzleLight = new THREE.PointLight(0xffc27a, 0, 14);
scene.add(muzzleLight);

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* =====================================================================
   CIUDAD
===================================================================== */
const PITCH = 46, BLOCK = 30, BOUND = 132;
const colliders = [];       // {x1,x2,z1,z2,h}
const obstacleMeshes = [];  // para raycast de disparos

function asphaltTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#383a40'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 900; i++) {
    const v = Math.floor(rand(40, 95));
    g.fillStyle = 'rgba(' + v + ',' + v + ',' + (v + 6) + ',' + rand(0.25, 0.6).toFixed(2) + ')';
    g.fillRect(Math.random() * 128, Math.random() * 128, rand(1, 2.5), rand(1, 2.5));
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(280, 280);
  return t;
}
const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshLambertMaterial({ map: asphaltTexture() }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

function dashTexture() {
  const c = document.createElement('canvas'); c.width = 16; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#e8d36a'; g.fillRect(6, 8, 4, 48);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
const dashTex = dashTexture();
dashTex.repeat.set(1, 290 / 4);
const dashMat = new THREE.MeshBasicMaterial({ map: dashTex, transparent: true });
for (let k = -3; k <= 3; k++) {
  const a = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 290), dashMat);
  a.rotation.x = -Math.PI / 2; a.position.set(k * PITCH, 0.03, 0); scene.add(a);
  const b = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 290), dashMat);
  b.rotation.set(-Math.PI / 2, 0, Math.PI / 2); b.position.set(0, 0.03, k * PITCH); scene.add(b);
}

function windowTexture(base, lit) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    g.fillStyle = Math.random() < 0.35 ? lit : '#27323d';
    g.fillRect(12 + i * 60, 14 + j * 60, 40, 44);
    g.fillStyle = 'rgba(255,255,255,.12)';
    g.fillRect(12 + i * 60, 14 + j * 60, 40, 6);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
const bTexes = [
  windowTexture('#7b6f66', '#ffe9a8'), windowTexture('#5d6b78', '#d6f0ff'),
  windowTexture('#8a5a4a', '#ffe0a0'), windowTexture('#6c7a62', '#fff1b8'),
  windowTexture('#a09a8a', '#cfe8ff'),
];

/* ---- decoración instanciada (letreros, árboles, postes, etc.) ---- */
function labelTexture(text, bg, fg, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), lw = Math.max(4, h * 0.05);
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = fg; g.lineWidth = lw; g.strokeRect(lw, lw, w - lw * 2, h - lw * 2);
  g.fillStyle = fg; g.font = '900 ' + Math.floor(h * 0.42) + 'px Arial Black, Impact, sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, w / 2, h / 2 + h * 0.03, w * 0.9);
  return new THREE.CanvasTexture(c);
}
const SIGNS = [['TAXI 24H', '#f7c600', '#111'], ['FARMACIA', '#1e9e55', '#fff'], ['PANADERÍA', '#d9822b', '#fff'], ['CAFÉ', '#5b3d2a', '#ffe9c8'],
  ['LICORES', '#7d3c98', '#fff'], ['TIENDA 24H', '#2e86c1', '#fff'], ['BAR EL PARCHE', '#a93226', '#ffe27a'], ['AREPAS', '#f1a22e', '#2a1a0a'], ['PARQUEADERO', '#2c3e50', '#fff']];
const ADS = [['VIAJA SEGURO · TAXI CENTRAL', '#f7c600', '#111'], ['PICO Y PLACA HOY', '#d63031', '#fff'], ['LIQUIDACIÓN 50% OFF', '#6c3483', '#ffe27a'],
  ['AREPAS LA ABUELA', '#e67e22', '#fff'], ['BOGOTÁ NO DUERME', '#154360', '#7fe3ff']];
const MURAL_WORDS = ['PAZ', 'ARTE', 'BOGOTÁ', 'PARCE', 'LIBRE', 'VIVA'];
function muralTexture(seed) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  const pals = [['#ff3b6b', '#ffd23a', '#2dd4bf', '#3b82f6'], ['#ff7a1a', '#7c3aed', '#22c55e', '#f43f5e'], ['#facc15', '#2563eb', '#ef4444', '#f8fafc'], ['#14b8a6', '#f97316', '#e11d48', '#fde047']][seed % 4];
  const grd = g.createLinearGradient(0, 0, 512, 256); grd.addColorStop(0, pals[0]); grd.addColorStop(1, pals[3]);
  g.fillStyle = grd; g.fillRect(0, 0, 512, 256);
  let r = seed * 9301 + 49297; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 14; i++) {
    g.fillStyle = pals[Math.floor(rnd() * 4)]; g.globalAlpha = 0.55 + rnd() * 0.4;
    g.beginPath();
    if (i % 3 === 0) g.arc(rnd() * 512, rnd() * 256, 20 + rnd() * 60, 0, 7);
    else { const x = rnd() * 512, y = rnd() * 256; g.moveTo(x, y); g.lineTo(x + 40 + rnd() * 120, y + rnd() * 60 - 30); g.lineTo(x + rnd() * 80, y + 40 + rnd() * 90); }
    g.fill();
  }
  g.globalAlpha = 1;
  g.font = 'italic 900 112px "Arial Black", Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 14; g.strokeStyle = '#111'; g.lineJoin = 'round';
  const word = MURAL_WORDS[seed % MURAL_WORDS.length];
  g.save(); g.translate(256, 132); g.rotate(-0.07);
  g.strokeText(word, 0, 0); g.fillStyle = '#ffffff'; g.fillText(word, 0, 0);
  g.lineWidth = 3; g.strokeStyle = pals[1]; g.strokeText(word, 0, 0);
  g.restore();
  g.lineWidth = 10; g.strokeStyle = '#111'; g.strokeRect(5, 5, 502, 246);
  return new THREE.CanvasTexture(c);
}
const inst = {};
function instKind(name, geo, mat, shadow) { inst[name] = { geo, mat, shadow, m: [], c: [] }; }
instKind('box', new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xffffff }), false);
instKind('cyl', new THREE.CylinderGeometry(1, 1, 1, 10), new THREE.MeshLambertMaterial({ color: 0xffffff }), true);
instKind('sph', new THREE.SphereGeometry(1, 8, 6), new THREE.MeshLambertMaterial({ color: 0xffffff }), true);
instKind('cone', new THREE.ConeGeometry(1, 1, 8), new THREE.MeshLambertMaterial({ color: 0xffffff }), false);
instKind('disc', new THREE.CylinderGeometry(1, 1, 1, 28), new THREE.MeshLambertMaterial({ color: 0xffffff }), true);
instKind('glow', new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }), false);
instKind('lamp', new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), false);
SIGNS.forEach((s, i) => instKind('sign' + i, new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: labelTexture(s[0], s[1], s[2], 512, 128) }), false));
ADS.forEach((s, i) => instKind('ad' + i, new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: labelTexture(s[0], s[1], s[2], 1024, 512) }), false));
for (let i = 0; i < 4; i++) instKind('mural' + i, new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: muralTexture(i + 1) }), false);
const _o = new THREE.Object3D();
function addInst(name, x, y, z, sx, sy, sz, ry, color) {
  _o.position.set(x, y, z); _o.rotation.set(0, ry || 0, 0); _o.scale.set(sx, sy, sz); _o.updateMatrix();
  const k = inst[name]; k.m.push(_o.matrix.clone()); k.c.push(color);
}
function buildInst() {
  for (const name in inst) {
    const k = inst[name];
    if (!k.m.length) continue;
    const im = new THREE.InstancedMesh(k.geo, k.mat, k.m.length);
    for (let i = 0; i < k.m.length; i++) { im.setMatrixAt(i, k.m[i]); if (k.c[i] !== undefined) im.setColorAt(i, new THREE.Color(k.c[i])); }
    im.castShadow = k.shadow; im.receiveShadow = true; im.frustumCulled = false;
    scene.add(im);
  }
}
function tileTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#85868b'; g.fillRect(0, 0, 64, 64);
  g.strokeStyle = '#6c6d72'; g.lineWidth = 3; g.strokeRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(16, 16);
  return t;
}
const padMat = new THREE.MeshLambertMaterial({ map: tileTexture() });

function decorateBuilding(cx, cz, w, d, h) {
  addInst('box', cx, h + 0.35, cz, w + 0.5, 0.7, d + 0.5, 0, pick([0x4a4f57, 0x6b625a, 0x3d4650]));
  const n = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) addInst('box', cx + rand(-w / 3, w / 3), h + 1.2, cz + rand(-d / 3, d / 3), rand(1.2, 2.4), rand(0.8, 1.6), rand(1.2, 2.4), rand(0, 3), pick([0x9aa0a6, 0x7c848c, 0xb5b9bd]));
  if (Math.random() < 0.5) addInst('cyl', cx + rand(-w / 4, w / 4), h + 1.6, cz + rand(-d / 4, d / 4), 0.9, 1.8, 0.9, 0, 0x8a6a4a);
  if (Math.random() < 0.4) addInst('cyl', cx + w / 3, h + 3.6, cz - d / 3, 0.06, 6, 0.06, 0, 0x555555);
  // letrero, toldo, puerta y vitrina en la planta baja
  const faces = [
    { nx: 0, nz: 1, x: cx, z: cz + d / 2, ry: 0, span: w },
    { nx: 0, nz: -1, x: cx, z: cz - d / 2, ry: Math.PI, span: w },
    { nx: 1, nz: 0, x: cx + w / 2, z: cz, ry: Math.PI / 2, span: d },
    { nx: -1, nz: 0, x: cx - w / 2, z: cz, ry: -Math.PI / 2, span: d },
  ];
  const f = pick(faces), sg = Math.floor(Math.random() * SIGNS.length);
  const sw = Math.min(6, f.span * 0.7), lim = Math.max(0, (f.span - sw) / 2 - 0.4), off = rand(-lim, lim);
  const lx = f.nz !== 0 ? 1 : 0, lz = f.nx !== 0 ? 1 : 0;
  const px = f.x + lx * off, pz = f.z + lz * off;
  addInst('sign' + sg, px + f.nx * 0.08, 4.1, pz + f.nz * 0.08, sw, sw * 0.25, 1, f.ry);
  addInst('box', px + f.nx * 0.8, 3.1, pz + f.nz * 0.8, f.nz ? sw : 1.6, 0.15, f.nz ? 1.6 : sw, 0, pick([0xc0392b, 0x27ae60, 0xf39c12, 0x2980b9, 0x8e44ad]));
  addInst('glow', px + f.nx * 0.06 - lx * sw * 0.18, 1.5, pz + f.nz * 0.06 - lz * sw * 0.18, f.nz ? sw * 0.5 : 0.06, 1.7, f.nz ? 0.06 : sw * 0.5, 0, 0xffe9a8);
  addInst('box', px + f.nx * 0.06 + lx * sw * 0.36, 1.1, pz + f.nz * 0.06 + lz * sw * 0.36, f.nz ? 1.3 : 0.1, 2.2, f.nz ? 0.1 : 1.3, 0, 0x2b1d14);
  extraBuildingDetail(cx, cz, w, d, h);
  if (h > 9 && Math.random() < 0.45) {
    const f2 = pick(faces.filter(q => q !== f)), mw = Math.min(f2.span * 0.7, 9), l2 = Math.max(0, (f2.span - mw) / 2 - 0.3), o2 = rand(-l2, l2);
    const lx2 = f2.nz !== 0 ? 1 : 0, lz2 = f2.nx !== 0 ? 1 : 0;
    addInst('mural' + Math.floor(Math.random() * 4), f2.x + lx2 * o2 + f2.nx * 0.1, 5.4, f2.z + lz2 * o2 + f2.nz * 0.1, mw, mw * 0.5, 1, f2.ry);
  }
  if (h > 16 && Math.random() < 0.4) {
    const ad = Math.floor(Math.random() * ADS.length), ry = pick([0, Math.PI / 2, Math.PI, -Math.PI / 2]);
    const bx = cx + rand(-w / 4, w / 4), bz = cz + rand(-d / 4, d / 4), c = Math.cos(ry), sn = Math.sin(ry);
    for (const sd of [-2.4, 2.4]) addInst('cyl', bx + c * sd, h + 1.7, bz - sn * sd, 0.12, 2.1, 0.12, 0, 0x555a60);
    addInst('box', bx - sn * 0.15, h + 4.4, bz - c * 0.15, 7.3, 3.7, 0.2, ry, 0x2b2f36);
    addInst('ad' + ad, bx + sn * 0.02, h + 4.4, bz + c * 0.02, 7, 3.5, 1, ry);
  }
}

function buildPlaza(cx, cz) {
  addInst('box', cx, 0.16, cz, 29.4, 0.04, 29.4, 0, 0xb7a58c);
  addInst('box', cx, 0.19, cz, 3.2, 0.03, 29.4, 0, 0xd6c8ae);
  addInst('box', cx, 0.19, cz, 29.4, 0.03, 3.2, 0, 0xd6c8ae);
  // fuente central
  addInst('disc', cx, 0.45, cz, 4.6, 0.9, 4.6, 0, 0xbdb7a8);
  addInst('disc', cx, 0.82, cz, 4.0, 0.1, 4.0, 0, 0x3f95d0);
  addInst('disc', cx, 1.7, cz, 0.55, 1.8, 0.55, 0, 0xcfc9ba);
  addInst('disc', cx, 2.7, cz, 1.8, 0.4, 1.8, 0, 0xcfc9ba);
  addInst('disc', cx, 2.95, cz, 1.5, 0.06, 1.5, 0, 0x3f95d0);
  addInst('cone', cx, 3.9, cz, 0.3, 1.8, 0.3, 0, 0xdff2ff);
  colliders.push({ x1: cx - 4.7, x2: cx + 4.7, z1: cz - 4.7, z2: cz + 4.7, h: 1 });
  // monumento al taxista
  const mz = cz + 10.5;
  addInst('box', cx, 0.7, mz, 5.4, 1.2, 7.6, 0, 0x8d8a82);
  addInst('box', cx, 1.55, mz, 1.9, 0.7, 4.4, 0.2, 0xf1c40f);
  addInst('box', cx, 2.15, mz + 0.2, 1.7, 0.6, 2.2, 0.2, 0xf1c40f);
  addInst('box', cx, 2.6, mz + 0.2, 0.7, 0.22, 0.3, 0.2, 0xffffff);
  colliders.push({ x1: cx - 2.8, x2: cx + 2.8, z1: mz - 3.9, z2: mz + 3.9, h: 2.8 });
  // bancas alrededor de la fuente
  for (let k = 0; k < 6; k++) {
    const a = k * Math.PI / 3, bx = cx + Math.cos(a) * 8.2, bz = cz + Math.sin(a) * 8.2, ry = Math.atan2(-Math.cos(a), -Math.sin(a));
    addInst('box', bx, 0.5, bz, 1.8, 0.12, 0.5, ry, 0x7a5230);
    addInst('box', bx + Math.cos(a) * 0.22, 0.85, bz + Math.sin(a) * 0.22, 1.8, 0.5, 0.1, ry, 0x7a5230);
    colliders.push({ x1: bx - 0.9, x2: bx + 0.9, z1: bz - 0.9, z2: bz + 0.9, h: 0.9 });
  }
  // árboles (uno de cada cuatro es un jacarandá)
  const tc = [0x2f7d3a, 0x3a8f46, 0x8e6bbf, 0x4a9a3c];
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2 + Math.PI / 8, tx = cx + Math.cos(a) * 13, tz = cz + Math.sin(a) * 13, gc = tc[k % 4];
    addInst('cyl', tx, 1.5, tz, 0.22, 3, 0.22, 0, 0x5b3a22);
    addInst('sph', tx, 4.0, tz, 2.1, 1.9, 2.1, 0, gc);
    addInst('sph', tx + rand(-0.4, 0.4), 5.2, tz + rand(-0.4, 0.4), 1.4, 1.3, 1.4, 0, gc);
    colliders.push({ x1: tx - 0.35, x2: tx + 0.35, z1: tz - 0.35, z2: tz + 0.35, h: 6 });
  }
  // jardineras con flores
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const fx = cx + sx * 10.5, fz = cz + sz * 10.5;
    addInst('box', fx, 0.4, fz, 3.2, 0.5, 3.2, 0, 0x4a3426);
    for (let q = 0; q < 14; q++) addInst('sph', fx + rand(-1.3, 1.3), 0.78, fz + rand(-1.3, 1.3), 0.2, 0.2, 0.2, 0, pick([0xe74c3c, 0xf1c40f, 0xff7aa8, 0xffffff, 0xff9f1a]));
    colliders.push({ x1: fx - 1.6, x2: fx + 1.6, z1: fz - 1.6, z2: fz + 1.6, h: 0.6 });
  }
}
function buildCrashScene() {
  // huellas de frenada, vidrios rotos y restos del choque
  for (const o of [-0.6, 0.6]) addInst('box', -5.6 + o, 0.045, -11.2, 0.3, 0.02, 10, 0.06, 0x0e0e10);
  for (let i = 0; i < 28; i++) addInst('box', -3.6 + rand(-3, 3), 0.05, -4.9 + rand(-3, 3), rand(0.08, 0.2), 0.03, rand(0.08, 0.2), rand(0, 3), 0xc7e6f5);
  addInst('box', -1.0, 0.15, -6.8, 1.3, 0.22, 0.32, 0.7, 0x24262b);
  addInst('box', -8.7, 0.1, -1.6, 0.9, 0.2, 0.3, 0.4, 0x24262b);
  addInst('cone', -9.6, 0.35, -3.2, 0.4, 0.7, 0.4, 0, 0xd63031);
  addInst('cone', -10.4, 0.35, -2.2, 0.4, 0.7, 0.4, 0, 0xd63031);
}

function addBuilding(cx, cz, w, d, h) {
  const tex = pick(bTexes).clone();
  tex.needsUpdate = true;
  tex.repeat.set(Math.max(1, Math.round(Math.max(w, d) / 6)), Math.max(1, Math.round(h / 6)));
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ map: tex }));
  m.position.set(cx, h / 2, cz);
  m.castShadow = m.receiveShadow = true;
  scene.add(m);
  obstacleMeshes.push(m);
  colliders.push({ x1: cx - w / 2, x2: cx + w / 2, z1: cz - d / 2, z2: cz + d / 2, h, bld: true });
  decorateBuilding(cx, cz, w, d, h);
}

for (let i = -3; i <= 2; i++) for (let j = -3; j <= 2; j++) {
  const cx = i * PITCH + PITCH / 2, cz = j * PITCH + PITCH / 2;
  const pad = new THREE.Mesh(new THREE.BoxGeometry(BLOCK + 2, 0.14, BLOCK + 2), padMat);
  pad.position.set(cx, 0.07, cz); pad.receiveShadow = true; scene.add(pad);
  for (const sd of [-1, 1]) {
    addInst('box', cx + sd * (BLOCK + 2) / 2, 0.09, cz, 0.35, 0.18, BLOCK + 2.35, 0, 0xb9b9b4);
    addInst('box', cx, 0.09, cz + sd * (BLOCK + 2) / 2, BLOCK + 2.35, 0.18, 0.35, 0, 0xb9b9b4);
  }
  if (i === 0 && j === 0) { buildPlaza(cx, cz); continue; }
  if (Math.random() < 0.4) {
    addBuilding(cx, cz, rand(22, 28), rand(22, 28), rand(10, 34));
  } else {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      if (Math.random() < 0.88) addBuilding(cx + sx * 7.6, cz + sz * 7.6, rand(10, 13), rand(10, 13), rand(6, 26));
    }
  }
}


/* ===== Detalle y decoración extra de la ciudad ===== */
function extraBuildingDetail(cx, cz, w, d, h) {
  const trim = pick([0xd8d2c4, 0xb9b2a2, 0x9a958a]);
  for (let y = 6; y < h - 1; y += 6) addInst('box', cx, y, cz, w + 0.45, 0.3, d + 0.45, 0, trim);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) addInst('box', cx + sx * w / 2, h / 2, cz + sz * d / 2, 0.7, h, 0.7, 0, trim);
  if (h <= 10) return;
  const rail = pick([0x2b2d31, 0x4a3a2a, 0x1f3a2e]);
  for (const f of [{ nx: 0, nz: 1 }, { nx: 0, nz: -1 }, { nx: 1, nz: 0 }, { nx: -1, nz: 0 }]) {
    if (Math.random() < 0.45) continue;
    const span = f.nz ? w : d, n = Math.max(1, Math.floor(span / 7));
    for (let y = 8.2; y < h - 2; y += 6) for (let q = 0; q < n; q++) {
      const o = (q - (n - 1) / 2) * 6.5;
      const bx = f.nz ? cx + o : cx + f.nx * (w / 2 + 0.6), bz = f.nz ? cz + f.nz * (d / 2 + 0.6) : cz + o;
      addInst('box', bx, y, bz, f.nz ? 2.8 : 1.2, 0.18, f.nz ? 1.2 : 2.8, 0, 0x8c8a84);
      addInst('box', f.nz ? bx : cx + f.nx * (w / 2 + 1.15), y + 0.38, f.nz ? cz + f.nz * (d / 2 + 1.15) : bz, f.nz ? 2.8 : 0.06, 0.55, f.nz ? 0.06 : 2.8, 0, rail);
      addInst('glow', f.nz ? bx : cx + f.nx * (w / 2 + 0.05), y + 1.1, f.nz ? cz + f.nz * (d / 2 + 0.05) : bz, f.nz ? 1.6 : 0.05, 1.5, f.nz ? 0.05 : 1.6, 0, Math.random() < 0.5 ? 0xffe9a8 : 0x3a4654);
    }
  }
}
function makeBus(color) {
  const g = new THREE.Group();
  const add = (w, h, d, c, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: c }));
    m.position.set(x, y, z); m.castShadow = true; g.add(m); return m;
  };
  const body = add(2.6, 2.7, 10.4, color, 0, 1.75, 0);
  add(2.64, 0.9, 9.6, 0x1b2733, 0, 2.35, 0);
  add(2.66, 0.25, 10.45, 0xf2f2f2, 0, 3.05, 0);
  add(1.6, 0.3, 3, 0x9aa0a6, 0, 3.3, 1.2);
  add(2.62, 0.18, 10.42, 0xf7c600, 0, 1.0, 0);
  for (const x of [-1.3, 1.3]) for (const z of [-3.3, 3.3]) add(0.3, 0.9, 0.9, 0x111111, x, 0.45, z);
  add(2.2, 1.0, 0.06, 0x1b2733, 0, 2.3, -5.22);
  for (const x of [-0.9, 0.9]) add(0.35, 0.2, 0.06, 0xffffcc, x, 1.0, -5.22);
  add(1.6, 0.3, 0.05, 0xffd23a, 0, 3.0, -5.23);
  add(0.05, 1.7, 1.2, 0x2d6a9f, 1.32, 1.7, -2.2);
  scene.add(g);
  obstacleMeshes.push(body);
  return g;
}
function buildExtraDecor() {
  const tri = [0xf7c600, 0x1c4fa0, 0xd62828];
  const wirePos = [];
  const wire = (ax, ay, az, bx, by, bz, sag) => {
    let px = ax, py = ay, pz = az;
    for (let i = 1; i <= 6; i++) {
      const t = i / 6, x = ax + (bx - ax) * t, z = az + (bz - az) * t, y = ay + (by - ay) * t - sag * Math.sin(Math.PI * t);
      wirePos.push(px, py, pz, x, y, z); px = x; py = y; pz = z;
    }
  };
  // banderines entre las esquinas de cada cruce, líneas de pare y charcos
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
    const X = i * PITCH, Z = j * PITCH, a = 7.7, y0 = 6.0;
    const strings = [[X - a, Z - a, X + a, Z - a], [X - a, Z + a, X + a, Z + a], [X - a, Z - a, X - a, Z + a], [X + a, Z - a, X + a, Z + a]];
    for (const [ax, az, bx, bz] of strings) {
      wire(ax, y0, az, bx, y0, bz, 0.9);
      const n = 12, ry = Math.atan2(bx - ax, bz - az);
      for (let q = 1; q < n; q++) {
        const t = q / n, y = y0 - 0.9 * Math.sin(Math.PI * t) - 0.3;
        addInst('box', ax + (bx - ax) * t, y, az + (bz - az) * t, 0.5, 0.6, 0.04, ry + Math.PI / 2, tri[q % 3]);
      }
    }
    for (const s of [-1, 1]) {
      addInst('box', X + s * 3.5, 0.036, Z + s * 11.8, 6, 0.02, 0.4, 0, 0xf2f2ec);
      addInst('box', X + s * 11.8, 0.036, Z - s * 3.5, 0.4, 0.02, 6, 0, 0xf2f2ec);
    }
  }
  for (let n = 0; n < 45; n++) {
    const k = Math.floor(rand(-2, 3)), t = rand(-125, 125), off = rand(-5, 5), r = rand(0.9, 2.4);
    if (Math.random() < 0.5) addInst('disc', k * PITCH + off, 0.034, t, r, 0.02, r * 0.7, rand(0, 3), 0x3a4a5c);
    else addInst('disc', t, 0.034, k * PITCH + off, r, 0.02, r * 0.7, rand(0, 3), 0x3a4a5c);
  }
  // postes de energía con cables, puestos ambulantes, contenedores y motos en las aceras
  const sides = [{ nx: 0, nz: 1 }, { nx: 0, nz: -1 }, { nx: 1, nz: 0 }, { nx: -1, nz: 0 }];
  for (let i = -3; i <= 2; i++) for (let j = -3; j <= 2; j++) {
    const cx = i * PITCH + PITCH / 2, cz = j * PITCH + PITCH / 2;
    if (i === 0 && j === 0) continue;
    for (const sd of sides) {
      const ex = cx + sd.nx * 16.1, ez = cz + sd.nz * 16.1, lx = sd.nz !== 0 ? 1 : 0, lz = sd.nx !== 0 ? 1 : 0;
      if (Math.random() < 0.4) {
        const poles = [-12, 12].map(t => ({ x: ex + lx * t, z: ez + lz * t }));
        for (const p of poles) {
          addInst('cyl', p.x, 4.2, p.z, 0.14, 8.4, 0.14, 0, 0x6b4a2e);
          addInst('box', p.x, 7.7, p.z, lx ? 0.14 : 2.2, 0.14, lx ? 2.2 : 0.14, 0, 0x5a3d26);
          addInst('box', p.x, 6.9, p.z, lx ? 0.14 : 1.6, 0.12, lx ? 1.6 : 0.14, 0, 0x5a3d26);
          if (Math.random() < 0.4) addInst('cyl', p.x + sd.nx * 0.3, 6.2, p.z + sd.nz * 0.3, 0.32, 0.9, 0.32, 0, 0x7d8890);
          colliders.push({ x1: p.x - 0.2, x2: p.x + 0.2, z1: p.z - 0.2, z2: p.z + 0.2, h: 8 });
        }
        for (const s of [-1, 1]) { wire(poles[0].x + lz * s, 7.7, poles[0].z + lx * s, poles[1].x + lz * s, 7.7, poles[1].z + lx * s, 0.7); wire(poles[0].x + lz * s * 0.7, 6.9, poles[0].z + lx * s * 0.7, poles[1].x + lz * s * 0.7, 6.9, poles[1].z + lx * s * 0.7, 0.6); }
      }
      const r = Math.random(), t = rand(-9, 9), px = ex - sd.nx * 1.2 + lx * t, pz = ez - sd.nz * 1.2 + lz * t;
      if (r < 0.2) {
        // puesto ambulante con sombrilla
        const col = pick([0xe74c3c, 0xf39c12, 0x27ae60, 0x2980b9, 0xf1c40f]);
        addInst('box', px, 0.7, pz, lx ? 1.8 : 0.95, 0.9, lx ? 0.95 : 1.8, 0, pick([0xd9d9d9, 0xc0392b, 0x2e86c1]));
        addInst('cyl', px, 1.9, pz, 0.05, 2.2, 0.05, 0, 0x444a52);
        addInst('cone', px, 2.75, pz, 1.7, 0.55, 1.7, 0, col);
        for (let q = 0; q < 6; q++) addInst('sph', px + rand(-0.6, 0.6) * (lx ? 1 : 0.3), 1.22, pz + rand(-0.6, 0.6) * (lz ? 1 : 0.3), 0.14, 0.14, 0.14, 0, pick([0xe74c3c, 0xf1c40f, 0x2ecc71, 0xe67e22]));
        colliders.push({ x1: px - (lx ? 1 : 0.55), x2: px + (lx ? 1 : 0.55), z1: pz - (lz ? 1 : 0.55), z2: pz + (lz ? 1 : 0.55), h: 1.2 });
      } else if (r < 0.32) {
        // contenedor y bolsas de basura
        addInst('box', px, 0.62, pz, lx ? 2.1 : 1.2, 1.1, lx ? 1.2 : 2.1, 0, 0x2f6b46);
        addInst('box', px, 1.22, pz, lx ? 2.2 : 1.3, 0.12, lx ? 1.3 : 2.2, 0, 0x1f4a30);
        for (let q = 0; q < 4; q++) addInst('sph', px + sd.nx * -1.1 + rand(-0.5, 0.5), 0.3, pz + sd.nz * -1.1 + rand(-0.5, 0.5), 0.35, 0.3, 0.35, 0, pick([0x15171a, 0x1d2a44, 0x2b2b2b]));
        colliders.push({ x1: px - (lx ? 1.1 : 0.7), x2: px + (lx ? 1.1 : 0.7), z1: pz - (lz ? 1.1 : 0.7), z2: pz + (lz ? 1.1 : 0.7), h: 1.3 });
      } else if (r < 0.44) {
        // moto estacionada
        const mc = pick([0xd63031, 0x1e90ff, 0x111111, 0xf1c40f, 0x2ecc71]), al = lx ? 1 : 0;
        const bx = al ? 0.5 : 1.7, bz = al ? 1.7 : 0.5;
        addInst('box', px, 0.7, pz, bx * 0.7, 0.35, bz * 0.7, 0, mc);
        addInst('box', px, 0.95, pz, bx * 0.3, 0.12, bz * 0.3, 0, 0x1a1a1a);
        for (const s of [-1, 1]) addInst('box', px + (al ? 0 : s * 0.7), 0.35, pz + (al ? s * 0.7 : 0), al ? 0.16 : 0.7, 0.7, al ? 0.7 : 0.16, 0, 0x151515);
        addInst('box', px + (al ? 0 : -0.62), 1.15, pz + (al ? -0.62 : 0), al ? 0.7 : 0.08, 0.08, al ? 0.08 : 0.7, 0, 0x888888);
        addInst('glow', px + (al ? 0 : -0.8), 0.95, pz + (al ? -0.8 : 0), 0.12, 0.14, 0.12, 0, 0xffffcc);
        colliders.push({ x1: px - bx / 2 - 0.1, x2: px + bx / 2 + 0.1, z1: pz - bz / 2 - 0.1, z2: pz + bz / 2 + 0.1, h: 1.1 });
      }
    }
  }
  const wg = new THREE.BufferGeometry();
  wg.setAttribute('position', new THREE.Float32BufferAttribute(wirePos, 3));
  scene.add(new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: 0x1a1a1d })));
  // buses estacionados al borde de las calles
  for (let n = 0, placed = 0; n < 40 && placed < 5; n++) {
    const k = [-2, -1, 1, 2][Math.floor(Math.random() * 4)], alongZ = Math.random() < 0.5, t = rand(-100, 100), side = Math.random() < 0.5 ? -1 : 1;
    const x = alongZ ? k * PITCH + side * 5.2 : t, z = alongZ ? t : k * PITCH + side * 5.2;
    if (Math.hypot(x, z) < 24 || insideCollider(x, z, 3)) continue;
    const g = makeBus(pick([0xd63031, 0x1f5fa8, 0xe67e22, 0x2e9d57]));
    g.position.set(x, 0, z); g.rotation.y = alongZ ? (side < 0 ? 0 : Math.PI) : Math.PI / 2;
    colliders.push(alongZ ? { x1: x - 1.4, x2: x + 1.4, z1: z - 5.3, z2: z + 5.3, h: 3.2 } : { x1: x - 5.3, x2: x + 5.3, z1: z - 1.4, z2: z + 1.4, h: 3.2 });
    placed++;
  }
}

function buildStreetDecor() {
  // bordes de calle y cruces peatonales
  for (let k = -3; k <= 3; k++) for (let j = -3; j < 3; j++) {
    const mid = j * PITCH + PITCH / 2;
    for (const off of [-6.7, 6.7]) {
      addInst('box', k * PITCH + off, 0.03, mid, 0.16, 0.02, 30, 0, 0xe4e4da);
      addInst('box', mid, 0.03, k * PITCH + off, 30, 0.02, 0.16, 0, 0xe4e4da);
    }
  }
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
    const X = i * PITCH, Z = j * PITCH;
    for (let t = -5.5; t <= 5.6; t += 1.1) for (const s of [-1, 1]) {
      addInst('box', X + s * 9.2, 0.035, Z + t, 2.4, 0.02, 0.55, 0, 0xf2f2ec);
      addInst('box', X + t, 0.035, Z + s * 9.2, 0.55, 0.02, 2.4, 0, 0xf2f2ec);
    }
    const cols = [0xff3b2f, 0xffd23a, 0x3ddc6f], lit = Math.floor(rand(0, 3));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const px = X + sx * 7.7, pz = Z + sz * 7.7;
      if (sx === sz) {
        addInst('cyl', px, 2.6, pz, 0.1, 5.2, 0.1, 0, 0x2b2d31);
        addInst('box', px, 5.4, pz, 0.45, 1.3, 0.4, 0, 0x1b1c1f);
        for (let q = 0; q < 3; q++) addInst('lamp', px - sx * 0.24, 5.85 - q * 0.42, pz, 0.13, 0.13, 0.13, 0, q === lit ? cols[q] : 0x333333);
      } else {
        addInst('cyl', px, 3.6, pz, 0.1, 7.2, 0.1, 0, 0x3a3d44);
        addInst('box', px - sx * 0.9, 7.2, pz, 1.9, 0.12, 0.12, 0, 0x3a3d44);
        addInst('lamp', px - sx * 1.7, 7.05, pz, 0.28, 0.2, 0.28, 0, 0xfff1b0);
      }
    }
  }
  // aceras: farolas, árboles y mobiliario
  const sides = [{ nx: 0, nz: 1 }, { nx: 0, nz: -1 }, { nx: 1, nz: 0 }, { nx: -1, nz: 0 }];
  for (let i = -3; i <= 2; i++) for (let j = -3; j <= 2; j++) {
    const cx = i * PITCH + PITCH / 2, cz = j * PITCH + PITCH / 2;
    for (const sd of sides) {
      const ex = cx + sd.nx * 15.4, ez = cz + sd.nz * 15.4;
      const lx = sd.nz !== 0 ? 1 : 0, lz = sd.nx !== 0 ? 1 : 0;
      addInst('cyl', ex, 3.4, ez, 0.09, 6.8, 0.09, 0, 0x3a3d44);
      addInst('box', ex + sd.nx * 0.85, 6.8, ez + sd.nz * 0.85, sd.nx ? 1.8 : 0.12, 0.12, sd.nz ? 1.8 : 0.12, 0, 0x3a3d44);
      addInst('lamp', ex + sd.nx * 1.6, 6.65, ez + sd.nz * 1.6, 0.28, 0.2, 0.28, 0, 0xfff1b0);
      const nt = 1 + (Math.random() < 0.6 ? 1 : 0), sgn = Math.random() < 0.5 ? -1 : 1;
      for (let q = 0; q < nt; q++) {
        const t = (q === 0 ? sgn : -sgn) * rand(4, 11), tx = ex + lx * t, tz = ez + lz * t, gc = pick([0x2f7d3a, 0x3a8f46, 0x276b33, 0x4a9a3c]);
        addInst('cyl', tx, 1.5, tz, 0.22, 3, 0.22, 0, 0x5b3a22);
        addInst('sph', tx, 4.0, tz, 1.9, 1.7, 1.9, 0, gc);
        addInst('sph', tx + rand(-0.4, 0.4), 5.1, tz + rand(-0.4, 0.4), 1.3, 1.2, 1.3, 0, gc);
        colliders.push({ x1: tx - 0.35, x2: tx + 0.35, z1: tz - 0.35, z2: tz + 0.35, h: 6 });
      }
      const r = Math.random(), t2 = rand(-10, 10), bx = ex + lx * t2, bz = ez + lz * t2;
      if (r < 0.25) {
        addInst('box', bx, 0.5, bz, sd.nz ? 1.8 : 0.5, 0.12, sd.nz ? 0.5 : 1.8, 0, 0x7a5230);
        addInst('box', bx - sd.nx * 0.28, 0.85, bz - sd.nz * 0.28, sd.nz ? 1.8 : 0.1, 0.5, sd.nz ? 0.1 : 1.8, 0, 0x7a5230);
      } else if (r < 0.45) addInst('cyl', bx, 0.45, bz, 0.3, 0.9, 0.3, 0, pick([0x2e7d4f, 0x2b5f8f, 0x555a60]));
      else if (r < 0.6) { addInst('cyl', bx, 0.35, bz, 0.17, 0.7, 0.17, 0, 0xc0392b); addInst('sph', bx, 0.75, bz, 0.2, 0.15, 0.2, 0, 0xc0392b); }
      else if (r < 0.68) {
        // parada de bus
        addInst('box', bx, 2.5, bz, sd.nz ? 3.2 : 1.6, 0.12, sd.nz ? 1.6 : 3.2, 0, 0x3c6e8f);
        addInst('box', bx - sd.nx * 0.7, 1.3, bz - sd.nz * 0.7, sd.nz ? 3.2 : 0.08, 2.4, sd.nz ? 0.08 : 3.2, 0, 0xaed6f1);
        for (const e of [-1.5, 1.5]) addInst('cyl', bx + lx * e, 1.25, bz + lz * e, 0.06, 2.5, 0.06, 0, 0x444a52);
        addInst('box', bx - sd.nx * 0.45, 0.5, bz - sd.nz * 0.45, sd.nz ? 2.4 : 0.5, 0.1, sd.nz ? 0.5 : 2.4, 0, 0x7a5230);
      }
    }
  }
  // conos, alcantarillas y horizonte
  for (let n = 0; n < 7; n++) {
    const X = Math.floor(rand(-2, 3)) * PITCH + rand(-3, 3), Z = Math.floor(rand(-2, 3)) * PITCH + rand(-3, 3), alongX = Math.random() < 0.5;
    for (let q = 0; q < 5; q++) addInst('cone', X + (alongX ? q * 1.4 : 0), 0.35, Z + (alongX ? 0 : q * 1.4), 0.25, 0.7, 0.25, 0, 0xff7a1a);
  }
  for (let n = 0; n < 40; n++) {
    const k = Math.floor(rand(-2, 3)), a = rand(-120, 120), b = k * PITCH + rand(-4, 4);
    if (Math.random() < 0.5) addInst('cyl', a, 0.035, b, 0.5, 0.03, 0.5, 0, 0x1e1f23); else addInst('cyl', b, 0.035, a, 0.5, 0.03, 0.5, 0, 0x1e1f23);
  }
  for (let n = 0; n < 80; n++) {
    const a = (n / 80) * Math.PI * 2 + rand(-0.03, 0.03), r = rand(150, 175), hh = rand(25, 85);
    addInst('box', Math.cos(a) * r, hh / 2, Math.sin(a) * r, rand(10, 22), hh, rand(10, 22), a, pick([0x7d8da3, 0x6d7b90, 0x8795a8]));
  }
}
buildStreetDecor();
buildExtraDecor();
buildCrashScene();
buildInst();

// cerros en el horizonte y nubes
const clouds = new THREE.Group();
scene.add(clouds);
(function farScenery() {
  for (const L of [{ r: 330, h: 70, col: 0x7f9a86, seed: 1 }, { r: 390, h: 115, col: 0x8fa5b5, seed: 2 }]) {
    const geo = new THREE.CylinderGeometry(L.r, L.r + 40, 1, 96, 1, true);
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3), top = new THREE.Color(L.col), base = new THREE.Color(SKY);
    for (let i = 0; i < pos.count; i++) {
      const isTop = pos.getY(i) > 0, a = Math.atan2(pos.getZ(i), pos.getX(i));
      const hh = L.h * (0.55 + 0.35 * Math.sin(a * 5 + L.seed) * Math.sin(a * 3 + L.seed * 2) + 0.2 * Math.sin(a * 11 + L.seed * 3));
      pos.setY(i, isTop ? Math.max(8, hh) : 0);
      const c = isTop ? top : base;
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, side: THREE.DoubleSide })));
  }
  const cGeo = new THREE.SphereGeometry(1, 10, 8), cMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, fog: false });
  for (let n = 0; n < 16; n++) {
    const x = rand(-300, 300), z = rand(-300, 300), y = rand(95, 150);
    for (let q = 0; q < 4; q++) {
      const m = new THREE.Mesh(cGeo, cMat);
      m.position.set(x + rand(-14, 14), y + rand(-3, 3), z + rand(-10, 10));
      m.scale.set(rand(10, 20), rand(4, 6), rand(8, 14));
      clouds.add(m);
    }
  }
})();

const CGEO = {}, CMAT = {};
let TAXI_SIGN_MAT = null;
function taxiSignMat() {
  if (TAXI_SIGN_MAT) return TAXI_SIGN_MAT;
  const c = document.createElement('canvas'); c.width = 128; c.height = 40;
  const x = c.getContext('2d');
  x.fillStyle = '#fff6c9'; x.fillRect(0, 0, 128, 40);
  x.fillStyle = '#111'; x.fillRect(0, 0, 128, 4); x.fillRect(0, 36, 128, 4);
  x.font = 'bold 28px Arial Black, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('TAXI', 64, 21);
  const t = new THREE.CanvasTexture(c);
  TAXI_SIGN_MAT = new THREE.MeshBasicMaterial({ map: t });
  return TAXI_SIGN_MAT;
}
function makeCar(color, taxi) {
  const g = new THREE.Group();
  const M = (c, o) => { const k = c + (o ? 'e' : ''); return CMAT[k] || (CMAT[k] = new THREE.MeshLambertMaterial(o ? { color: c, emissive: o } : { color: c })); };
  const G = (w, h, d) => { const k = w + '_' + h + '_' + d; return CGEO[k] || (CGEO[k] = new THREE.BoxGeometry(w, h, d)); };
  const add = (w, h, d, c, x, y, z, sh, em) => {
    const m = new THREE.Mesh(G(w, h, d), M(c, em)); m.position.set(x, y, z);
    if (sh) m.castShadow = true; g.add(m); return m;
  };
  const light = new THREE.Color(color).multiplyScalar(1.15).getHex();
  const dark = new THREE.Color(color).multiplyScalar(0.7).getHex();
  const GLASS = 0x22394d, GLASS2 = 0x2e4b63, BLK = 0x16171a, CHR = 0xcfd4d8;
  // carrocería
  const body = add(1.9, 0.5, 4.4, color, 0, 0.62, 0, true);
  add(1.96, 0.14, 4.3, dark, 0, 0.42, 0);                       // faldones
  add(1.78, 0.1, 1.35, light, 0, 0.92, -1.42);                  // capó
  add(1.78, 0.1, 1.0, light, 0, 0.92, 1.62);                    // maletero
  add(1.82, 0.05, 0.1, dark, 0, 0.9, -0.72);                    // junta capó
  // cabina
  const cabin = add(1.66, 0.52, 2.0, color, 0, 1.2, 0.28, true);
  add(1.58, 0.06, 1.85, light, 0, 1.49, 0.28);                  // techo
  for (const sx of [-1, 1]) {
    add(0.03, 0.34, 1.72, GLASS, sx * 0.835, 1.22, 0.3);        // ventanas laterales
    add(0.035, 0.34, 0.05, color, sx * 0.84, 1.22, 0.3);        // pilar B
    add(0.03, 0.32, 0.4, GLASS2, sx * 0.836, 1.22, 0.68);       // ventana trasera lateral
    add(0.04, 0.03, 0.9, dark, sx * 0.95, 0.9, -0.1);           // moldura puerta
    add(0.03, 0.4, 0.03, BLK, sx * 0.955, 0.67, -0.55);         // línea puerta
    add(0.03, 0.4, 0.03, BLK, sx * 0.955, 0.67, 0.7);
    add(0.04, 0.05, 0.2, CHR, sx * 0.96, 0.82, -0.45);          // manija
    add(0.04, 0.05, 0.2, CHR, sx * 0.96, 0.82, 0.8);
    const mir = add(0.2, 0.13, 0.1, color, sx * 1.0, 1.05, -0.62); // espejo
    add(0.16, 0.09, 0.02, GLASS2, sx * 1.0, 1.05, -0.68);
    add(0.08, 0.08, 0.2, BLK, sx * 0.93, 1.02, -0.58);
  }
  const ws = add(1.58, 0.5, 0.05, GLASS, 0, 1.2, -0.74); ws.rotation.x = -0.45; // parabrisas
  const rw = add(1.58, 0.46, 0.05, GLASS, 0, 1.2, 1.3); rw.rotation.x = 0.4;    // luneta
  add(1.58, 0.05, 0.12, dark, 0, 1.47, -0.7);
  // frente
  add(1.98, 0.22, 0.18, BLK, 0, 0.45, -2.25, true);             // paragolpes
  add(1.0, 0.16, 0.05, BLK, 0, 0.7, -2.2);                      // parrilla
  add(0.8, 0.02, 0.05, CHR, 0, 0.7, -2.23);
  add(0.3, 0.1, 0.06, CHR, 0, 0.82, -2.21);
  for (const sx of [-1, 1]) {
    add(0.42, 0.17, 0.12, 0xfff6c8, sx * 0.65, 0.8, -2.2, false, 0x777755);   // faros
    add(0.2, 0.1, 0.04, 0xffffff, sx * 0.6, 0.8, -2.27, false, 0x999977);
    add(0.2, 0.06, 0.1, 0xff9a1a, sx * 0.9, 0.62, -2.2);
  }
  // atrás
  add(1.98, 0.22, 0.18, BLK, 0, 0.45, 2.25, true);
  for (const sx of [-1, 1]) {
    add(0.45, 0.17, 0.1, 0xc4161c, sx * 0.65, 0.84, 2.21, false, 0x550a0c);
    add(0.1, 0.1, 0.2, 0x555a60, sx * 0.55, 0.32, 2.38);        // escape
  }
  add(0.5, 0.18, 0.03, 0xf2f2f2, 0, 0.7, 2.21);                 // placa
  add(0.44, 0.03, 0.035, 0x1b3a8a, 0, 0.77, 2.225);
  // ruedas
  for (const sx of [-1, 1]) for (const z of [-1.4, 1.4]) {
    add(0.14, 0.62, 0.9, BLK, sx * 0.93, 0.5, z);                // arco rueda
    const t = new THREE.Mesh(CGEO.tire || (CGEO.tire = new THREE.CylinderGeometry(0.38, 0.38, 0.26, 14)), M(0x0e0e10));
    t.rotation.z = Math.PI / 2; t.position.set(sx * 0.95, 0.38, z); t.castShadow = true; g.add(t);
    const r = new THREE.Mesh(CGEO.rim || (CGEO.rim = new THREE.CylinderGeometry(0.23, 0.23, 0.28, 10)), M(0xbfc5ca));
    r.rotation.z = Math.PI / 2; r.position.set(sx * 0.955, 0.38, z); g.add(r);
    const h = new THREE.Mesh(CGEO.hub || (CGEO.hub = new THREE.CylinderGeometry(0.07, 0.07, 0.3, 6)), M(0x55595e));
    h.rotation.z = Math.PI / 2; h.position.set(sx * 0.96, 0.38, z); g.add(h);
  }
  if (taxi) {
    // franja a cuadros + letrero
    for (const sx of [-1, 1]) for (let i = 0; i < 18; i++) {
      add(0.035, 0.07, 0.24, (i % 2) ? 0x111111 : 0xffffff, sx * 0.955, 0.52, -2.0 + i * 0.235);
      add(0.035, 0.07, 0.24, (i % 2) ? 0xffffff : 0x111111, sx * 0.955, 0.59, -2.0 + i * 0.235);
    }
    const sg = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.22, 0.3), [M(0xfff6c8), M(0xfff6c8), M(0xfff6c8), M(0xfff6c8), taxiSignMat(), taxiSignMat()]);
    sg.position.set(0, 1.64, 0.28); g.add(sg);
    add(0.5, 0.06, 0.18, 0x222222, 0, 1.53, 0.28);
  }
  scene.add(g);
  obstacleMeshes.push(body, cabin);
  return g;
}
function carCollider(g, ry) {
  const c = Math.abs(Math.cos(ry)), s = Math.abs(Math.sin(ry));
  const hx = c * 1 + s * 2.3, hz = s * 1 + c * 2.3;
  colliders.push({ x1: g.position.x - hx, x2: g.position.x + hx, z1: g.position.z - hz, z2: g.position.z + hz, h: 1.7 });
}
function placeCar(color, taxi, x, z, ry) {
  const g = makeCar(color, taxi);
  g.position.set(x, 0, z); g.rotation.y = ry;
  g.updateMatrixWorld(true);
  carCollider(g, ry);
  return g;
}
// El choque (tu taxi + el que te chocó)
const crashTaxi = placeCar(0xf1c40f, true, -5, -6, 0.5);
const taxiCol = colliders[colliders.length - 1];
placeCar(0xc0392b, false, -2.2, -3.8, -1.0);
// Tu taxi: se maneja entre oleadas
const TAXI_START = { x: -5, z: -6, h: 0.5 };
const taxi = { g: crashTaxi, x: -5, z: -6, h: 0.5, speed: 0, crashCd: 0 };
let driving = false;
function parkTaxi() {
  const c = Math.abs(Math.cos(taxi.h)), s = Math.abs(Math.sin(taxi.h)), hx = c + s * 2.3, hz = s + c * 2.3;
  taxiCol.x1 = taxi.x - hx; taxiCol.x2 = taxi.x + hx; taxiCol.z1 = taxi.z - hz; taxiCol.z2 = taxi.z + hz; taxiCol.h = 1.7;
  if (!colliders.includes(taxiCol)) colliders.push(taxiCol);
  taxi.g.position.set(taxi.x, 0, taxi.z); taxi.g.rotation.y = taxi.h;
}
function unparkTaxi() { const i = colliders.indexOf(taxiCol); if (i >= 0) colliders.splice(i, 1); }
const zone = { x: 0, z: 0 };
const zoneMarker = new THREE.Group();
const zoneRing = new THREE.Mesh(new THREE.RingGeometry(8, 9.5, 48), new THREE.MeshBasicMaterial({ color: 0x3ee0ff, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
zoneRing.rotation.x = -Math.PI / 2; zoneRing.position.y = 0.12; zoneMarker.add(zoneRing);
const zoneBeam = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 90, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0x3ee0ff, transparent: true, opacity: 0.28, fog: false, side: THREE.DoubleSide }));
zoneBeam.position.y = 45; zoneMarker.add(zoneBeam);
zoneMarker.visible = false; scene.add(zoneMarker);
const taxiBeacon = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 60, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xf7c600, transparent: true, opacity: 0.35, fog: false, side: THREE.DoubleSide }));
taxiBeacon.visible = false; scene.add(taxiBeacon);
// Carros regados
for (let i = 0; i < 12; i++) {
  const k = Math.floor(rand(-3, 3.99));
  const alongZ = Math.random() < 0.5;
  const off = (Math.random() < 0.5 ? -1 : 1) * 4.5;
  const t = rand(-120, 120);
  const x = alongZ ? k * PITCH + off : t, z = alongZ ? t : k * PITCH + off;
  if (Math.hypot(x, z) < 18) continue;
  const cols = [0xf1c40f, 0xecf0f1, 0x2c3e50, 0x16a085, 0x8e44ad, 0xd35400, 0x7f8c8d];
  placeCar(pick(cols), Math.random() < 0.4, x, z, alongZ ? (Math.random() < .5 ? 0 : Math.PI) : Math.PI / 2);
}
// humo del taxi chocado
const smoke = [];
for (let i = 0; i < 7; i++) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.4 }));
  m.userData.t = i / 7;
  scene.add(m); smoke.push(m);
}

function insideCollider(x, z, r) {
  for (const c of colliders) if (x > c.x1 - r && x < c.x2 + r && z > c.z1 - r && z < c.z2 + r) return true;
  return false;
}
function collide(p, r) {
  for (const c of colliders) {
    const cx = clamp(p.x, c.x1, c.x2), cz = clamp(p.z, c.z1, c.z2);
    const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
    if (d2 < r * r) {
      if (d2 > 1e-6) { const d = Math.sqrt(d2); p.x = cx + dx / d * r; p.z = cz + dz / d * r; }
      else {
        const l = p.x - c.x1, rr = c.x2 - p.x, t = p.z - c.z1, b = c.z2 - p.z, m = Math.min(l, rr, t, b);
        if (m === l) p.x = c.x1 - r; else if (m === rr) p.x = c.x2 + r; else if (m === t) p.z = c.z1 - r; else p.z = c.z2 + r;
      }
    }
  }
  p.x = clamp(p.x, -BOUND, BOUND); p.z = clamp(p.z, -BOUND, BOUND);
}
function hasLOS(ax, az, bx, bz, minH = 1.4) {
  const dx = bx - ax, dz = bz - az, n = Math.ceil(Math.hypot(dx, dz) / 1.5);
  for (let i = 1; i < n; i++) {
    const x = ax + dx * i / n, z = az + dz * i / n;
    for (const c of colliders) if (c.h > minH && x > c.x1 && x < c.x2 && z > c.z1 && z < c.z2) return false;
  }
  return true;
}
function bulletBlocked(x, y, z) {
  for (const c of colliders) if (y < c.h && x > c.x1 && x < c.x2 && z > c.z1 && z < c.z2) return true;
  return false;
}

/* =====================================================================
   MODELOS (personajes y armas hechos con cajas)
===================================================================== */
function makeGun(type) {
  const g = new THREE.Group();
  const M = c => new THREE.MeshLambertMaterial({ color: c });
  const add = (w, h, d, c, x, y, z, rx = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c));
    m.position.set(x, y, z); m.rotation.x = rx; g.add(m); return m;
  };
  if (type === 'pistol') {
    add(0.07, 0.09, 0.34, 0x22252a, 0, 0, -0.14);
    add(0.065, 0.2, 0.09, 0x15171a, 0, -0.13, 0.0, 0.2);
  } else if (type === 'revolver') {
    add(0.05, 0.05, 0.42, 0x8d949c, 0, 0.02, -0.26);
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.11, 10), M(0x6e757c));
    d.rotation.x = Math.PI / 2; d.position.set(0, 0.01, -0.04); g.add(d);
    add(0.06, 0.2, 0.1, 0x6b4423, 0, -0.13, 0.05, 0.35);
  } else if (type === 'shotgun') {
    add(0.06, 0.06, 0.95, 0x30343a, 0, 0.02, -0.47);
    add(0.09, 0.07, 0.26, 0x6b4423, 0, -0.045, -0.42);
    add(0.08, 0.12, 0.36, 0x22252a, 0, -0.02, 0.05);
    add(0.07, 0.15, 0.4, 0x6b4423, 0, -0.06, 0.4);
  } else if (type === 'smg') {
    add(0.07, 0.11, 0.42, 0x25292f, 0, 0, -0.1);
    add(0.04, 0.04, 0.22, 0x8d949c, 0, 0.01, -0.42);
    add(0.05, 0.24, 0.07, 0x15171a, 0, -0.16, -0.06);
    add(0.06, 0.15, 0.08, 0x15171a, 0, -0.12, 0.14, 0.25);
    add(0.07, 0.06, 0.2, 0x25292f, 0, 0.06, 0.2);
  } else if (type === 'rifle') {
    add(0.07, 0.12, 0.55, 0x2c3138, 0, 0, -0.15);
    add(0.04, 0.04, 0.6, 0x8d949c, 0, 0.02, -0.72);
    add(0.07, 0.15, 0.32, 0x3a3f46, 0, -0.03, 0.3);
    add(0.05, 0.22, 0.08, 0x15171a, 0, -0.15, -0.2, 0.2);
    add(0.04, 0.05, 0.12, 0x15171a, 0, 0.09, -0.1);
  } else if (type === 'sniper') {
    add(0.045, 0.045, 1.15, 0x30343a, 0, 0.02, -0.75);
    add(0.08, 0.12, 0.62, 0x2d3a2a, 0, 0, -0.1);
    add(0.07, 0.16, 0.42, 0x6b4423, 0, -0.05, 0.42);
    const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 10), M(0x111111));
    sc.rotation.x = Math.PI / 2; sc.position.set(0, 0.12, -0.2); g.add(sc);
  } else if (type === 'launcher') {
    const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.85, 12), M(0x4b6b32));
    tb.rotation.x = Math.PI / 2; tb.position.set(0, 0.02, -0.3); g.add(tb);
    add(0.13, 0.13, 0.1, 0x2c3138, 0, 0.02, -0.75);
    add(0.06, 0.18, 0.08, 0x15171a, 0, -0.14, 0.0, 0.2);
    add(0.05, 0.1, 0.2, 0x2c3138, 0, 0.1, -0.2);
  }
  return g;
}

function makeHuman(o) {
  const g = new THREE.Group();
  g.rotation.order = 'YXZ';
  const mats = [], matMap = {}, geoMap = HGEO;
  const M = c => matMap[c] || (matMap[c] = (() => { const m = new THREE.MeshLambertMaterial({ color: c }); mats.push(m); return m; })());
  const sh = (c, f) => { const k = new THREE.Color(c); k.multiplyScalar(f); return k.getHex(); };
  const G = (w, h, d) => { const k = w + '_' + h + '_' + d; return geoMap[k] || (geoMap[k] = new THREE.BoxGeometry(w, h, d)); };
  const box = (w, h, d, c, x, y, z, parent, head) => {
    const m = new THREE.Mesh(G(w, h, d), M(c));
    m.position.set(x, y, z); m.castShadow = true; (parent || g).add(m);
    if (head) m.userData.head = true; return m;
  };
  const pol = o.vest === 0x1a1a22, swat = o.vest === 0x3a3f44, work = o.vest === 0xff7f11;
  const hair = o.hair != null ? o.hair : [0x1a1410, 0x2b1d12, 0x4a3020, 0x8a6a3a, 0x9a9a9a][(Math.random() * 5) | 0];
  const dark = sh(o.shirt, 0.72), pdark = sh(o.pants, 0.7);
  const J = o.jersey, armC = J && J.sleeve != null ? J.sleeve : o.shirt;
  // pelvis, torso, shoulders
  box(0.72, 0.22, 0.4, o.pants, 0, 0.98, 0);
  box(0.72, 0.7, 0.4, o.shirt, 0, 1.38, 0);
  box(0.76, 0.2, 0.42, o.shirt, 0, 1.64, 0);           // hombros
  box(0.5, 0.04, 0.02, dark, 0, 1.2, -0.205);          // pliegue
  box(0.74, 0.09, 0.43, 0x1b1b1b, 0, 1.08, 0);          // cinturón
  box(0.1, 0.07, 0.02, 0xd4af37, 0, 1.08, -0.22);       // hebilla
  if (!o.vest) {
    box(0.03, 0.62, 0.02, dark, 0, 1.38, -0.205);        // botones/costura
    box(0.14, 0.1, 0.02, dark, -0.2, 1.46, -0.205);      // bolsillo
    box(0.16, 0.06, 0.02, sh(o.shirt, 1.25), -0.1, 1.72, -0.2).rotation.z = 0.5; // cuello
    box(0.16, 0.06, 0.02, sh(o.shirt, 1.25), 0.1, 1.72, -0.2).rotation.z = -0.5;
  }
  if (J) {
    const T = J.type, c2 = J.c2;
    if (T === 'stripes') for (const x of [-0.3, -0.1, 0.1, 0.3]) box(0.1, 0.74, 0.428, c2, x, 1.37, 0);
    if (T === 'hoops') for (const y of [1.2, 1.4, 1.6]) box(0.74, 0.1, 0.428, c2, 0, y, 0);
    if (T === 'sash') for (let i = 0; i < 5; i++) box(0.14, 0.2, 0.428, c2, 0.3 - i * 0.15, 1.62 - i * 0.14, 0);
    if (T === 'half') box(0.37, 0.74, 0.428, c2, 0.185, 1.37, 0);
    if (T === 'v') { box(0.2, 0.06, 0.03, c2, 0, 1.73, -0.22); }
    box(0.22, 0.09, 0.03, 0xf2f2f2, 0, 1.5, -0.222);                  // patrocinador
    box(0.07, 0.07, 0.03, J.c2 === 0xffffff ? J.c1 : c2, 0.22, 1.6, -0.222); // escudo
    box(0.3, 0.2, 0.03, 0xf2f2f2, 0, 1.45, 0.222);                    // número espalda
    box(0.1, 0.14, 0.035, J.c1, 0, 1.45, 0.236);
    box(0.4, 0.06, 0.03, 0xf2f2f2, 0, 1.62, 0.222);                   // apellido
  }
  if (o.tie) { box(0.1, 0.5, 0.02, o.tie, 0, 1.42, -0.215); box(0.07, 0.07, 0.03, sh(o.tie, 1.3), 0, 1.69, -0.215); }
  if (o.vest) {
    box(0.76, 0.56, 0.44, o.vest, 0, 1.43, 0);
    box(0.2, 0.12, 0.05, sh(o.vest, 1.5), -0.2, 1.36, -0.23);
    box(0.2, 0.12, 0.05, sh(o.vest, 1.5), 0.2, 1.36, -0.23);
    if (pol) { box(0.1, 0.12, 0.03, 0xe6c44a, 0.2, 1.62, -0.23); box(0.18, 0.04, 0.03, 0xdddddd, -0.18, 1.62, -0.23); }
    if (swat) { box(0.2, 0.1, 0.05, 0x2a2e32, 0, 1.2, -0.23); box(0.28, 0.06, 0.03, 0xdddddd, 0, 1.58, -0.23); }
    if (work) { box(0.76, 0.06, 0.45, 0xeeeeee, 0, 1.3, 0); box(0.76, 0.06, 0.45, 0xeeeeee, 0, 1.56, 0); }
  }
  // cuello y cabeza
  box(0.16, 0.12, 0.16, sh(o.skin, 0.9), 0, 1.76, 0);
  const head = box(0.42, 0.44, 0.42, o.skin, 0, 1.97, 0); head.userData.head = true;
  const H = (w, h, d, c, x, y, z) => box(w, h, d, c, x, y, z, null, true);
  H(0.05, 0.12, 0.08, sh(o.skin, 0.92), -0.235, 1.97, 0);
  H(0.05, 0.12, 0.08, sh(o.skin, 0.92), 0.235, 1.97, 0);
  H(0.08, 0.11, 0.07, sh(o.skin, 1.06), 0, 1.94, -0.235);              // nariz
  H(0.12, 0.035, 0.02, 0x4a1a1a, 0, 1.84, -0.215);                     // boca
  H(0.09, 0.015, 0.02, 0xf2f2f2, 0, 1.853, -0.222);                    // dientes (furia)
  H(0.1, 0.07, 0.02, 0xffffff, -0.1, 1.99, -0.215); H(0.1, 0.07, 0.02, 0xffffff, 0.1, 1.99, -0.215);
  H(0.045, 0.06, 0.025, 0x1a1a1a, -0.085, 1.99, -0.222); H(0.045, 0.06, 0.025, 0x1a1a1a, 0.085, 1.99, -0.222);
  H(0.14, 0.035, 0.02, hair, -0.1, 2.075, -0.216).rotation.z = -0.4;   // cejas furiosas
  H(0.14, 0.035, 0.02, hair, 0.1, 2.075, -0.216).rotation.z = 0.4;
  if (!pol && !swat && Math.random() < 0.35) H(0.3, 0.07, 0.02, sh(hair, 1.0), 0, 1.88, -0.213); // barba
  // pelo
  H(0.44, 0.1, 0.44, hair, 0, 2.2, 0.01);
  H(0.44, 0.3, 0.1, hair, 0, 2.04, 0.17);
  H(0.04, 0.2, 0.3, hair, -0.215, 2.1, 0.04); H(0.04, 0.2, 0.3, hair, 0.215, 2.1, 0.04);
  if (!o.hat) H(0.44, 0.07, 0.06, hair, 0, 2.17, -0.2);
  // gorras / cascos
  if (o.hat) {
    if (swat) {
      H(0.5, 0.26, 0.5, o.hat, 0, 2.15, 0.01);
      H(0.4, 0.1, 0.06, 0x1c3a52, 0, 2.06, -0.255);
      H(0.5, 0.2, 0.08, o.hat, 0, 1.98, 0.22);
    } else {
      H(0.48, 0.14, 0.48, o.hat, 0, 2.2, 0);
      H(0.46, 0.06, 0.46, sh(o.hat, 1.25), 0, 2.28, 0);
      H(0.42, 0.04, 0.26, sh(o.hat, 0.8), 0, 2.13, -0.34);
      if (pol) H(0.1, 0.09, 0.02, 0xe6c44a, 0, 2.2, -0.245);
      if (o.tie && !pol && !work && o.shirt === 0xf0f0f0) H(0.1, 0.06, 0.02, 0xffffff, 0, 2.22, -0.245);
    }
  }
  // extremidades
  const limb = (w, h, d, c, x, y) => {
    const p = new THREE.Group(); p.position.set(x, y, 0);
    const m = new THREE.Mesh(G(w, h, d), M(c)); m.position.y = -h / 2; m.castShadow = true; p.add(m); g.add(p); return p;
  };
  const legL = limb(0.3, 0.86, 0.32, o.pants, -0.18, 0.88);
  const legR = limb(0.3, 0.86, 0.32, o.pants, 0.18, 0.88);
  for (const l of [legL, legR]) {
    box(0.32, 0.1, 0.34, pdark, 0, -0.72, 0, l);                       // dobladillo
    box(0.32, 0.14, 0.46, 0x15151a, 0, -0.8, -0.06, l);                // zapato
    box(0.32, 0.03, 0.48, 0xdedede, 0, -0.865, -0.06, l);              // suela
    if (swat) box(0.32, 0.16, 0.06, 0x2a2e32, 0, -0.42, -0.18, l);     // rodillera
  }
  const armL = limb(0.22, 0.74, 0.24, armC, -0.49, 1.7);
  const armR = limb(0.22, 0.74, 0.24, armC, 0.49, 1.7);
  for (const a of [armL, armR]) {
    box(0.26, 0.14, 0.28, sh(armC, 1.12), 0, -0.04, 0, a);          // hombrera
    box(0.24, 0.07, 0.26, J && J.cuff != null ? J.cuff : dark, 0, -0.66, 0, a);                       // puño
    box(0.2, 0.2, 0.22, o.skin, 0, -0.82, 0, a);                       // mano
    box(0.18, 0.06, 0.06, sh(o.skin, 0.9), 0, -0.93, -0.06, a);        // dedos
    if (swat) box(0.24, 0.12, 0.26, 0x2a2e32, 0, -0.42, 0, a);         // coderas
  }
  const guns = {};
  if (o.guns) {
    for (const t of o.guns) {
      const gun = makeGun(t);
      gun.rotation.x = -Math.PI / 2; gun.position.set(0, -0.8, 0);
      gun.visible = false; armR.add(gun); guns[t] = gun;
    }
  }
  return { g, legL, legR, armL, armR, mats, guns };
}
const HGEO = {};

/* ===== Monstruos y demonios ===== */
const MONSTER_PAL = {
  imp:    { skin: 0xc2392b, dark: 0x7a1d17, horn: 0xf1e3b8, eye: 0xffe14a, wing: 0x4a1020 },
  demon:  { skin: 0x7d1f24, dark: 0x3b0f14, horn: 0xe8d8a8, eye: 0xff9a2a, wing: 0x2a0b12, ember: 0xff6a1a },
  brute:  { skin: 0x62805a, dark: 0x3d513a, horn: 0xf2ecd8, eye: 0xff4a3a, cloth: 0x5c4326 },
  wraith: { skin: 0x7fb6d8, dark: 0x274a63, eye: 0x7dfff2, bone: 0xe9efe9 },
};
function makeMonster(kind, pal) {
  const g = new THREE.Group();
  g.rotation.order = 'YXZ';
  const mats = [];
  const P = Object.assign({}, MONSTER_PAL[kind], pal || {});
  const M = (c, o) => { const m = new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {})); mats.push(m); return m; };
  const glow = c => new THREE.MeshBasicMaterial({ color: c });
  const add = (geo, mat, x, y, z, parent, head) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true;
    if (head) m.userData.head = true;
    (parent || g).add(m); return m;
  };
  const box = (w, h, d, c, x, y, z, parent, head) => add(new THREE.BoxGeometry(w, h, d), M(c), x, y, z, parent, head);
  const cone = (r, h, c, x, y, z, parent, rx, rz, head) => {
    const m = add(new THREE.ConeGeometry(r, h, 6), M(c), x, y, z, parent, head);
    m.rotation.x = rx || 0; m.rotation.z = rz || 0; return m;
  };
  const eye = (x, y, z, s) => add(new THREE.BoxGeometry(s, s * 0.7, 0.04), glow(P.eye), x, y, z, null, true);
  const limb = (w, h, d, c, x, y) => {
    const q = new THREE.Group(); q.position.set(x, y, 0);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c));
    m.position.y = -h / 2; m.castShadow = true; q.add(m); g.add(q); return q;
  };
  const tail = (n, y0, thick, c) => {
    for (let i = 0; i < n; i++) box(thick * (1 - i * 0.12), thick * (1 - i * 0.12), 0.3, c, 0, y0 + i * 0.07, 0.3 + i * 0.28);
    cone(thick * 0.9, thick * 2.2, P.dark, 0, y0 + n * 0.07, 0.3 + n * 0.28 + 0.1, null, Math.PI / 2, 0);
  };
  const wings = (w, h, x, y, z, tilt) => {
    for (const s of [-1, 1]) {
      const a = box(0.05, h, w, P.wing, s * x, y, z); a.rotation.z = s * tilt; a.rotation.y = s * 0.45;
      const b = box(0.05, h * 0.6, w * 0.7, P.dark, s * (x + 0.12), y - h * 0.15, z + 0.2); b.rotation.z = s * tilt; b.rotation.y = s * 0.55;
    }
  };
  let legL, legR, armL, armR;
  if (kind === 'imp') {
    box(0.62, 0.7, 0.36, P.skin, 0, 1.25, 0);
    box(0.44, 0.4, 0.04, P.dark, 0, 1.2, -0.2);
    box(0.46, 0.4, 0.42, P.skin, 0, 1.82, 0, null, true);
    eye(-0.12, 1.86, -0.22, 0.12); eye(0.12, 1.86, -0.22, 0.12);
    box(0.22, 0.05, 0.03, 0x2a0a0a, 0, 1.72, -0.215, null, true);
    cone(0.07, 0.3, P.horn, -0.14, 2.12, -0.02, null, 0, 0.25, true);
    cone(0.07, 0.3, P.horn, 0.14, 2.12, -0.02, null, 0, -0.25, true);
    legL = limb(0.24, 0.8, 0.26, P.skin, -0.16, 0.85); legR = limb(0.24, 0.8, 0.26, P.skin, 0.16, 0.85);
    box(0.26, 0.1, 0.34, P.dark, 0, -0.78, -0.05, legL); box(0.26, 0.1, 0.34, P.dark, 0, -0.78, -0.05, legR);
    armL = limb(0.18, 0.75, 0.2, P.skin, -0.4, 1.5); armR = limb(0.18, 0.75, 0.2, P.skin, 0.4, 1.5);
    box(0.16, 0.14, 0.24, P.dark, 0, -0.78, -0.02, armL); box(0.16, 0.14, 0.24, P.dark, 0, -0.78, -0.02, armR);
    tail(4, 0.85, 0.1, P.skin);
    wings(0.5, 0.7, 0.4, 1.6, 0.3, 0.5);
  } else if (kind === 'demon') {
    box(0.9, 1.0, 0.5, P.skin, 0, 1.35, 0);
    box(0.7, 0.3, 0.06, P.dark, 0, 1.55, -0.28);
    box(0.5, 0.5, 0.06, P.dark, 0, 1.0, -0.27);
    box(0.52, 0.5, 0.5, P.skin, 0, 2.05, 0, null, true);
    box(0.4, 0.12, 0.42, P.dark, 0, 1.85, -0.02, null, true);
    eye(-0.14, 2.1, -0.26, 0.14); eye(0.14, 2.1, -0.26, 0.14);
    cone(0.09, 0.55, P.horn, -0.2, 2.55, -0.05, null, -0.15, 0.45, true);
    cone(0.09, 0.55, P.horn, 0.2, 2.55, -0.05, null, -0.15, -0.45, true);
    cone(0.06, 0.3, P.horn, -0.47, 2.88, -0.12, null, -0.2, 0.15, true);
    cone(0.06, 0.3, P.horn, 0.47, 2.88, -0.12, null, -0.2, -0.15, true);
    cone(0.08, 0.32, P.dark, -0.62, 2.0, 0, null, 0, 1.1);
    cone(0.08, 0.32, P.dark, 0.62, 2.0, 0, null, 0, -1.1);
    legL = limb(0.32, 0.95, 0.34, P.skin, -0.22, 0.95); legR = limb(0.32, 0.95, 0.34, P.skin, 0.22, 0.95);
    box(0.34, 0.14, 0.42, P.dark, 0, -0.93, -0.05, legL); box(0.34, 0.14, 0.42, P.dark, 0, -0.93, -0.05, legR);
    armL = limb(0.26, 0.9, 0.28, P.skin, -0.62, 1.75); armR = limb(0.26, 0.9, 0.28, P.skin, 0.62, 1.75);
    box(0.3, 0.2, 0.28, P.dark, 0, -0.9, 0, armL); box(0.3, 0.2, 0.28, P.dark, 0, -0.9, 0, armR);
    add(new THREE.SphereGeometry(0.2, 8, 6), glow(P.ember), 0, -1.08, -0.12, armR);
    tail(5, 0.8, 0.16, P.skin);
    wings(0.9, 1.3, 0.75, 1.95, 0.4, 0.7);
  } else if (kind === 'brute') {
    box(1.3, 1.15, 0.7, P.skin, 0, 1.35, 0);
    box(0.9, 0.6, 0.08, P.dark, 0, 1.2, -0.38);
    box(1.0, 0.5, 0.62, P.cloth, 0, 0.85, 0);
    box(0.5, 0.45, 0.5, P.skin, 0, 1.97, -0.12, null, true);
    box(0.55, 0.1, 0.12, P.dark, 0, 2.1, -0.38, null, true);
    eye(-0.13, 2.0, -0.38, 0.1); eye(0.13, 2.0, -0.38, 0.1);
    cone(0.05, 0.28, P.horn, -0.16, 1.82, -0.38, null, 0, 0, true);
    cone(0.05, 0.28, P.horn, 0.16, 1.82, -0.38, null, 0, 0, true);
    legL = limb(0.45, 0.85, 0.45, P.skin, -0.3, 0.85); legR = limb(0.45, 0.85, 0.45, P.skin, 0.3, 0.85);
    box(0.5, 0.14, 0.6, P.dark, 0, -0.82, -0.06, legL); box(0.5, 0.14, 0.6, P.dark, 0, -0.82, -0.06, legR);
    armL = limb(0.44, 1.0, 0.44, P.skin, -0.88, 1.8); armR = limb(0.44, 1.0, 0.44, P.skin, 0.88, 1.8);
    box(0.5, 0.4, 0.5, P.dark, 0, -1.0, 0, armL); box(0.5, 0.4, 0.5, P.dark, 0, -1.0, 0, armR);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) cone(0.07, 0.3, P.dark, s * (0.82 + i * 0.1), 2.0 + i * 0.1, 0.1 - i * 0.12, null, 0, -s * (0.9 - i * 0.2));
    box(0.2, 1.3, 0.2, P.cloth, 0, -1.1, -0.1, armR);
    for (let i = 0; i < 3; i++) cone(0.05, 0.16, P.dark, 0, -1.4 + i * 0.25, -0.26, armR, -Math.PI / 2, 0);
  } else {
    // wraith: alma flotante
    const robe = add(new THREE.ConeGeometry(0.62, 1.7, 10), M(P.skin, { transparent: true, opacity: 0.78 }), 0, 1.0, 0);
    robe.castShadow = false;
    add(new THREE.SphereGeometry(0.17, 8, 6), glow(P.eye), 0, 1.45, -0.18);
    box(0.4, 0.42, 0.4, P.bone, 0, 1.97, 0, null, true);
    box(0.52, 0.3, 0.52, P.dark, 0, 2.2, 0.03, null, true);
    box(0.1, 0.12, 0.05, 0x061018, -0.1, 1.99, -0.21, null, true); box(0.1, 0.12, 0.05, 0x061018, 0.1, 1.99, -0.21, null, true);
    eye(-0.1, 1.99, -0.235, 0.07); eye(0.1, 1.99, -0.235, 0.07);
    legL = new THREE.Group(); legR = new THREE.Group();
    armL = limb(0.12, 1.0, 0.12, P.skin, -0.5, 1.6); armR = limb(0.12, 1.0, 0.12, P.skin, 0.5, 1.6);
    box(0.16, 0.3, 0.08, P.bone, 0, -1.0, 0, armL); box(0.16, 0.3, 0.08, P.bone, 0, -1.0, 0, armR);
  }
  return { g, legL, legR, armL, armR, mats, guns: {} };
}

/* =====================================================================
   ESTADO
===================================================================== */
let state = 'menu', paused = false, locked = false, thirdPerson = false, touchMode = false;
const KT = (d, t) => (touchMode ? t : d);
let yaw = 0, pitch = 0;
const keys = {};
let mouseDown = false;
const player = { pos: V3(0, 0, 4), vy: 0, hp: 200, max: 200, onGround: true, walk: 0, r: 0.5 };

const WEAPONS = {
  pistol:   { name: 'PISTOLA',  dmg: 24, rate: 0.26, mag: 12, pellets: 1, spread: 0.010, reload: 1.1, kick: 0.012, maxRes: 200, pick: 24, len: 0.34 },
  revolver: { name: 'REVÓLVER', dmg: 66, rate: 0.70, mag: 6,  pellets: 1, spread: 0.004, reload: 1.9, kick: 0.040, maxRes: 90,  pick: 12, len: 0.48 },
  shotgun:  { name: 'ESCOPETA', dmg: 15, rate: 0.95, mag: 6,  pellets: 9, spread: 0.075, reload: 2.3, kick: 0.070, maxRes: 60,  pick: 8,  len: 0.95 },
  smg:      { name: 'SUBFUSIL',        dmg: 13,  rate: 0.075, mag: 32, pellets: 1, spread: 0.028,  reload: 1.7, kick: 0.006, maxRes: 300, pick: 40, len: 0.5 },
  rifle:    { name: 'FUSIL DE ASALTO', dmg: 26,  rate: 0.11,  mag: 30, pellets: 1, spread: 0.013,  reload: 2.0, kick: 0.012, maxRes: 240, pick: 30, len: 0.8 },
  sniper:   { name: 'FRANCOTIRADOR',   dmg: 160, rate: 1.05,  mag: 5,  pellets: 1, spread: 0.0006, reload: 2.5, kick: 0.07,  maxRes: 40,  pick: 6,  len: 1.0 },
  launcher: { name: 'LANZAGRANADAS',   dmg: 150, rate: 1.0,   mag: 4,  pellets: 1, spread: 0.004,  reload: 2.6, kick: 0.09,  maxRes: 16,  pick: 3,  len: 0.7, explosive: 6 },
};
const ALLW = ['pistol', 'revolver', 'shotgun', 'smg', 'rifle', 'sniper', 'launcher'];
const SPECIALS = ['smg', 'rifle', 'sniper', 'launcher'];
const WEAPON_KEYS = { Digit1: 'pistol', Digit2: 'revolver', Digit3: 'shotgun', Digit4: 'smg', Digit5: 'rifle', Digit6: 'sniper', Digit7: 'launcher' };
const owned = {};
let cur = 'pistol';
const mag = {}, reserve = {};
let reloading = 0, fireCd = 0, recoil = 0, flashLight = 0;

let wave, waveState, waveTimer, spawnQueue, spawnT, bossPending, bossRef, kills, score, allyCharge, bossesKilled;
let enemies = [], corpses = [], ebullets = [], pickups = [], allies = [], particles = [], tracers = [], fxs = [];
let dmgT = 0, speedT = 0, shieldT = 0, rapidT = 0, vigT = 0, shake = 0, insultT = 6, time = 0, walkBob = 0;
const ALLY_COST = 10, MAX_ALLIES = 2;
let aim = false, specialDropped = false, engine = null, driveSpawnT = 0;

/* ===== Modelo del jugador (tercera persona) y arma en primera persona ===== */
const pm = makeHuman({ shirt: 0xf0f0f0, pants: 0x232a35, skin: 0xdba87a, hat: 0xf1c40f, tie: 0xc0392b, guns: ALLW });
pm.g.visible = false;
scene.add(pm.g);

const vm = new THREE.Group();
const vmGuns = {};
for (const t of ALLW) { vmGuns[t] = makeGun(t); vmGuns[t].scale.setScalar(1.15); vm.add(vmGuns[t]); }
camera.add(vm);

function showWeaponModels() {
  for (const t of ALLW) { vmGuns[t].visible = t === cur; if (pm.guns[t]) pm.guns[t].visible = t === cur; }
}

/* =====================================================================
   SONIDO (WebAudio, sin archivos)
===================================================================== */
let AC = null, NB = null;
function initAudio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    NB = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
    const d = NB.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  } catch (e) { AC = null; }
}
function snd(freq, dur, vol, filt = 'bandpass') {
  if (!AC) return;
  const s = AC.createBufferSource(); s.buffer = NB;
  const f = AC.createBiquadFilter(); f.type = filt; f.frequency.value = freq;
  const g = AC.createGain(), t = AC.currentTime;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(AC.destination);
  s.start(t, Math.random() * 0.4, dur + 0.05);
}
function tone(freq, dur, vol, type = 'sine', slide = 0) {
  if (!AC) return;
  const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + dur + 0.02);
}
const SFX = {
  pistol() { snd(2200, 0.12, 0.5); tone(180, 0.08, 0.25, 'square', -100); },
  revolver() { snd(1200, 0.25, 0.8, 'lowpass'); tone(110, 0.18, 0.4, 'sawtooth', -70); },
  shotgun() { snd(900, 0.35, 1, 'lowpass'); tone(80, 0.25, 0.5, 'sawtooth', -50); },
  enemy() { snd(2600, 0.08, 0.16); },
  hit() { tone(900, 0.05, 0.12, 'square'); },
  hurt() { tone(120, 0.2, 0.4, 'sawtooth', -60); },
  pickup() { tone(600, 0.08, 0.2, 'triangle'); setTimeout(() => tone(900, 0.1, 0.2, 'triangle'), 70); },
  reload() { snd(3000, 0.05, 0.3); setTimeout(() => snd(2000, 0.06, 0.35), 320); },
  boss() { tone(70, 1.1, 0.6, 'sawtooth', -30); },
  stomp() { snd(160, 0.5, 1, 'lowpass'); },
  ally() { tone(500, 0.25, 0.3, 'triangle', 300); },
  die() { tone(300, 0.3, 0.18, 'sawtooth', -200); },
  empty() { snd(4000, 0.03, 0.3); },
  smg() { snd(2600, 0.07, 0.4); tone(200, 0.05, 0.2, 'square', -100); },
  rifle() { snd(1800, 0.1, 0.55); tone(150, 0.09, 0.3, 'square', -90); },
  sniper() { snd(800, 0.4, 0.9, 'lowpass'); tone(90, 0.3, 0.5, 'sawtooth', -50); },
  launcher() { snd(300, 0.4, 0.8, 'lowpass'); tone(140, 0.4, 0.4, 'sawtooth', -100); },
  explosion() { snd(120, 0.8, 1, 'lowpass'); tone(60, 0.6, 0.6, 'sawtooth', -30); },
  runover() { snd(180, 0.25, 0.9, 'lowpass'); tone(110, 0.2, 0.4, 'sawtooth', -60); },
  crash() { snd(300, 0.4, 1, 'lowpass'); tone(70, 0.3, 0.5, 'square', -30); },
  fireball() { snd(700, 0.3, 0.4, 'lowpass'); tone(260, 0.25, 0.18, 'sawtooth', -140); },
  growl() { tone(90, 0.4, 0.25, 'sawtooth', -40); snd(400, 0.3, 0.3, 'lowpass'); },
  screech() { snd(2500, 0.5, 0.35, 'highpass'); },
};
function startEngine() {
  if (!AC || engine) return;
  const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain();
  o.type = 'sawtooth'; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0.06; o.frequency.value = 55;
  o.connect(f); f.connect(g); g.connect(AC.destination); o.start();
  engine = { o, g };
}
function stopEngine() {
  if (!engine) return;
  try { engine.o.stop(); } catch (e) { /* ya detenido */ }
  engine = null;
}
let horn = null, honking = false;
function startHorn() {
  if (honking || !driving) return;
  honking = true;
  $('honkTxt').classList.remove('hidden');
  hornScare();
  if (!AC) return;
  const g = AC.createGain(), f = AC.createBiquadFilter(), o1 = AC.createOscillator(), o2 = AC.createOscillator();
  g.gain.value = 0.16; f.type = 'lowpass'; f.frequency.value = 1800;
  o1.type = 'square'; o2.type = 'square'; o1.frequency.value = 420; o2.frequency.value = 530;
  o1.connect(f); o2.connect(f); f.connect(g); g.connect(AC.destination);
  o1.start(); o2.start();
  horn = { o1, o2, g };
}
function stopHorn() {
  if (!honking) return;
  honking = false;
  $('honkTxt').classList.add('hidden');
  if (!horn) return;
  try { horn.o1.stop(); horn.o2.stop(); } catch (e) { /* ya detenido */ }
  horn = null;
}

/* =====================================================================
   HUD helpers
===================================================================== */
function banner(t, sub = '', ms = 2400) {
  const b = $('banner');
  b.innerHTML = '<div class="bt">' + t + '</div><div class="bs">' + sub + '</div>';
  b.classList.add('show');
  clearTimeout(banner.h);
  banner.h = setTimeout(() => b.classList.remove('show'), ms);
}
function subtitle(t) {
  const s = $('subtitle'); s.textContent = t; s.classList.add('show');
  clearTimeout(subtitle.h); subtitle.h = setTimeout(() => s.classList.remove('show'), 2600);
}
function toast(t, color) {
  const d = document.createElement('div'); d.className = 'toast'; d.textContent = t;
  if (color) d.style.borderColor = color;
  $('toasts').appendChild(d); setTimeout(() => d.remove(), 2200);
}
const ALLY_LINES = [
  '¡Quítense de la vía, que pasa el taxi!', '¡Aquí va el taxi, abran paso!', '¡Pa\' que respeten a los taxistas!', '¡Fuera de aquí, mala hora!',
  '¡Corra, cobarde, que lo alcanzo!', '¡Ábranse, torpes!', '¡Dele duro, parce!', '¡Esos pícaros no se salvan!', '¡Me debían una carrera, tramposos!',
];
const ALLY_KILL = ['¡Uno menos, parce!', '¡Pa\' que aprenda, mala hora!', '¡Cayó el pícaro!', '¡Eso, por atravesado!'];
const HORN_LINES = ['¡Pite, pite, que no se quitan, tercos!', '¡Apártense, que pasa el taxi!', '¡Ese claxon es música pa\' sus oídos, atravesados!'];
function hornScare() {
  const fx = -Math.sin(taxi.h), fz = -Math.cos(taxi.h);
  for (const e of enemies) {
    const dx = e.g.position.x - taxi.x, dz = e.g.position.z - taxi.z, d = Math.hypot(dx, dz) || 1;
    if (d < 26 && (dx * fx + dz * fz) / d > 0.3) e.cd = Math.max(e.cd, 1.0);
  }
  const rid = allies.filter(a => a.inCar);
  if (rid.length && Math.random() < 0.75) allyLine(pick(HORN_LINES), allies.indexOf(pick(rid)));
}
function allyLine(t, idx) {
  const el = $('allyLine'); el.textContent = 'COMPAÑERO ' + (idx + 1) + ': ' + t; el.classList.add('show');
  clearTimeout(allyLine.h); allyLine.h = setTimeout(() => el.classList.remove('show'), 2400);
}
const INSULTS = [
  '¡Mire cómo me dejó el taxi, por Dios!',
  '¡Atravesados, hoy se las ven conmigo!',
  '¡Pa\' que respeten el taxi, tarados!',
  '¿Quién fue el torpe que me chocó?',
  '¡Vengan, cobardes, que hoy no tengo nada que perder!',
  '¡Ni el Pico y Placa me tiene tan bravo como ustedes!',
  '¡Me dañaron la carrera de la noche, tramposos!',
  '¡Quítense, que el taxista está furioso!',
  '¡Todos van a pagar el choque, caramba!',
  '¡Pícaros, ¿ahora sí van a correr?!',
  '¡Pa\' que aprendan a manejar, cabezas de chorlito!',
];
const KILL_LINES = ['¡Uno menos, atravesado!', '¡Pa\' que aprenda!', '¡Eso le pasa por chocarme!', '¡Siguiente, mala hora!', '¡Ni la aseguradora lo salva!'];
const BOSS_LINES = ['¡Con ese tamaño y no sabe manejar!', '¡Grandote, pero igual de atravesado!', '¡Hoy lo bajo a bala, gigante!'];

/* =====================================================================
   PARTÍCULAS / EFECTOS
===================================================================== */
const pGeo = new THREE.BoxGeometry(0.09, 0.09, 0.09);
const pMats = {};
function pMat(c) { return pMats[c] || (pMats[c] = new THREE.MeshBasicMaterial({ color: c })); }
function burst(pos, color, n, spd, life = 0.55) {
  for (let i = 0; i < n && particles.length < 280; i++) {
    const m = new THREE.Mesh(pGeo, pMat(color));
    m.position.copy(pos);
    scene.add(m);
    particles.push({ m, v: V3(rand(-1, 1), rand(0.2, 1.2), rand(-1, 1)).multiplyScalar(spd * rand(0.4, 1)), life: life * rand(0.6, 1.1) });
  }
}
function tracer(from, to, color = 0xffdd88) {
  const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }));
  scene.add(line);
  tracers.push({ line, life: 0.07 });
}
function ringFx(pos, maxR, color) {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
  m.rotation.x = -Math.PI / 2; m.position.set(pos.x, 0.1, pos.z);
  scene.add(m);
  fxs.push({ m, t: 0, dur: 0.55, maxR });
}

/* =====================================================================
   ENEMIGOS
===================================================================== */
const ETYPES = {
  civil:   { name: 'Civil',            hp: 45,  speed: 4.4, melee: true, dmg: 7,  rate: 0.9, range: 1.8, score: 10 },
  taxista: { name: 'Taxista',          hp: 70,  speed: 3.5, dmg: 6,  rate: 1.5, range: 24, bspeed: 26, spread: 0.07, score: 20 },
  policia: { name: 'Policía',          hp: 110, speed: 3.9, dmg: 8, rate: 1.0, range: 30, bspeed: 32, spread: 0.045, score: 35 },
  swat:    { name: 'Fuerza Especial',  hp: 200, speed: 3.3, dmg: 9, rate: 0.5, range: 34, bspeed: 34, spread: 0.05, score: 60 },
  imp:     { name: 'Diablillo',        monster: true, scale: 0.8,  hp: 40,  speed: 7.0, melee: true, dmg: 6,  rate: 0.7, range: 1.7, score: 15 },
  demon:   { name: 'Demonio',          monster: true, scale: 1.1,  hp: 140, speed: 3.4, dmg: 10, rate: 1.9, range: 34, bspeed: 19, spread: 0.035, bsize: 0.3, bcolor: 0xff6a1a, score: 45 },
  brute:   { name: 'Bruto infernal',   monster: true, heavy: true, scale: 1.7, radius: 0.95, hp: 420, speed: 2.8, melee: true, dmg: 15, rate: 1.3, range: 2.8, score: 80 },
  wraith:  { name: 'Alma en pena',     monster: true, scale: 1.0,  float: 1.1, hp: 75, speed: 4.4, dmg: 6, rate: 1.3, range: 28, bspeed: 22, spread: 0.05, bsize: 0.2, bcolor: 0x7dfff2, score: 35 },
};
function pickType(w) {
  const T = w <= 1 ? [['civil', .6], ['taxista', .4]]
    : w === 2 ? [['civil', .2], ['taxista', .25], ['policia', .2], ['imp', .35]]
    : w === 3 ? [['civil', .12], ['taxista', .18], ['policia', .2], ['imp', .25], ['demon', .15], ['wraith', .1]]
    : [['civil', .06], ['taxista', .09], ['policia', .15], ['swat', .1], ['imp', .17], ['demon', .16], ['wraith', .13], ['brute', .14]];
  const r = Math.random(); let a = 0;
  for (const [k, p] of T) { a += p; if (r < a) return k; }
  return T[T.length - 1][0];
}
const BOSSES = [
  { name: 'EL COMISARIO GIGANTE', shirt: 0x1f3a93, pants: 0x14224d, hat: 0x14224d, tie: 0xf7c600, skin: 0xc68b5b },
  { name: 'EL SEÑOR DEL INFIERNO', kind: 'demon', pal: { skin: 0x4a0f13, dark: 0x1d0709, horn: 0xffd45a, eye: 0xffe14a, wing: 0x140509, ember: 0xff3a1a } },
  { name: 'EL REY DEL TAXI',      shirt: 0xf1c40f, pants: 0x222222, hat: 0x111111, tie: 0x111111, skin: 0xd9a066 },
  { name: 'EL TITÁN DE PIEDRA',   kind: 'brute', pal: { skin: 0x7a7d84, dark: 0x4b4d53, horn: 0x2b2b30, eye: 0xff7a2a, cloth: 0x3a3a40 } },
  { name: 'EL ALCALDE FURIOSO',   shirt: 0x555a63, pants: 0x2a2d33, hat: null,     tie: 0xc0392b, skin: 0xe0b48a },
];
const CIV_SHIRTS = [0x3498db, 0xe74c3c, 0x9b59b6, 0x27ae60, 0xe67e22, 0x16a085, 0xecf0f1, 0xfd79a8];
const TEAMS = [
  { n: 'Nacional', c1: 0xf4f4f4, c2: 0x0b8a3e, type: 'stripes', cuff: 0x0b8a3e },
  { n: 'Millonarios', c1: 0x14439b, c2: 0xffffff, type: 'plain', cuff: 0xffffff },
  { n: 'América', c1: 0xd0161d, c2: 0xffffff, type: 'plain', cuff: 0x111111 },
  { n: 'Junior', c1: 0xf4f4f4, c2: 0xd0161d, type: 'stripes', cuff: 0xd0161d },
  { n: 'Santa Fe', c1: 0xd0161d, c2: 0xffffff, type: 'plain', sleeve: 0xf4f4f4, cuff: 0xd0161d },
  { n: 'Deportivo Cali', c1: 0x0e7a3a, c2: 0xffffff, type: 'plain', cuff: 0xffffff },
  { n: 'Tolima', c1: 0x7a1530, c2: 0xf3c21a, type: 'plain', cuff: 0xf3c21a },
  { n: 'Medellín', c1: 0xc4161c, c2: 0x13306b, type: 'half', cuff: 0x13306b },
  { n: 'Bucaramanga', c1: 0xf3d21a, c2: 0x0e7a3a, type: 'plain', cuff: 0x0e7a3a },
  { n: 'Once Caldas', c1: 0xf4f4f4, c2: 0x111111, type: 'hoops', cuff: 0x111111 },
  { n: 'Águilas Doradas', c1: 0xe0a812, c2: 0x111111, type: 'plain', cuff: 0x111111 },
  { n: 'Envigado', c1: 0xf07a1a, c2: 0x111111, type: 'plain', cuff: 0x111111 },
  { n: 'Pereira', c1: 0xf3c21a, c2: 0xd0161d, type: 'stripes', cuff: 0xd0161d },
  { n: 'Huila', c1: 0x0e7a3a, c2: 0xf3c21a, type: 'sash', cuff: 0xf3c21a },
];
const SKINS = [0xf0c8a0, 0xdba87a, 0xc68b5b, 0x8d5a3a, 0x6b4128];

function spawnPos() {
  for (let i = 0; i < 30; i++) {
    const a = rand(0, Math.PI * 2), d = rand(32, 58);
    const x = clamp(player.pos.x + Math.cos(a) * d, -BOUND + 2, BOUND - 2);
    const z = clamp(player.pos.z + Math.sin(a) * d, -BOUND + 2, BOUND - 2);
    if (!insideCollider(x, z, 1.2)) return V3(x, 0, z);
  }
  return V3(0, 0, -30);
}

let monsterSeen = false;
function spawnEnemy(typeKey, at, boss) {
  const def = boss ? { name: boss.name, hp: boss.hp, speed: 2.7, dmg: 9, rate: 1.6, range: 45, bspeed: 24, spread: 0.03, score: 600 } : ETYPES[typeKey];
  const mk = boss ? boss.kind : (def.monster ? typeKey : null);
  let look = null;
  if (!mk) {
    if (boss) look = { shirt: boss.shirt, pants: boss.pants, hat: boss.hat, tie: boss.tie, skin: boss.skin, guns: ['shotgun'] };
    else if (typeKey === 'civil') { const tm = pick(TEAMS); look = { shirt: tm.c1, jersey: tm, pants: pick([0x1e272e, 0x2c3e50, 0x222222]), skin: pick(SKINS), hat: Math.random() < 0.25 ? tm.c2 : null }; }
    else if (typeKey === 'civil_old') look = { shirt: pick(CIV_SHIRTS), pants: pick([0x2c3e50, 0x34495e, 0x4a3b2a, 0x1e272e]), skin: pick(SKINS), hat: Math.random() < 0.3 ? pick([0xe74c3c, 0x2980b9, 0xecf0f1]) : null };
    else if (typeKey === 'taxista') look = { shirt: 0xf1c40f, pants: 0x222222, skin: pick(SKINS), hat: 0x111111, guns: ['pistol'] };
    else if (typeKey === 'policia') look = { shirt: 0x2146a8, pants: 0x14224d, skin: pick(SKINS), hat: 0x14224d, vest: 0x1a1a22, guns: ['pistol'] };
    else look = { shirt: 0x2b2b2b, pants: 0x1f1f1f, skin: pick(SKINS), hat: 0x111111, vest: 0x3a3f44, guns: ['shotgun'] };
  }
  const h = mk ? makeMonster(mk, boss && boss.pal) : makeHuman(look);
  if (look && look.guns) h.guns[look.guns[0]].visible = true;
  if (def.monster && !monsterSeen) { monsterSeen = true; subtitle('¡¿Y esos bichos de dónde salieron?!'); SFX.growl(); }
  const wm = 1 + 0.07 * (wave - 1);
  const scale = boss ? 3.2 : (def.scale ? def.scale * rand(0.93, 1.07) : rand(0.95, 1.08));
  h.g.scale.setScalar(scale);
  const p = at || spawnPos();
  h.g.position.copy(p);
  scene.add(h.g);
  const e = {
    type: typeKey, def, isBoss: !!boss, g: h.g, group: h.g, parts: h, scale,
    hp: def.hp * (boss ? 1 : wm), maxHp: def.hp * (boss ? 1 : wm),
    dmg: def.dmg * (1 + 0.03 * (wave - 1)), speed: def.speed * (boss ? 1 : rand(0.92, 1.08)),
    radius: boss ? 1.7 : (def.radius || 0.5), bob: rand(0, 6), bossKind: boss ? boss.kind : null, cd: rand(0.5, 2), anim: rand(0, 6), strafeDir: Math.random() < 0.5 ? -1 : 1, strafeT: rand(1, 3),
    stuckT: 0, stuckAcc: 0, stuckDir: 1, attackT: 0, flash: 0, dead: false, deathT: 0,
    stompCd: 3, sumT: 12, pattern: 0, carCd: 0,
  };
  if (boss) e.maxHp = e.hp = boss.hp;
  h.g.traverse(m => { if (m.isMesh) m.userData.enemy = e; });
  enemies.push(e);
  return e;
}

function chooseTarget(e) {
  const p = e.g.position;
  let best = { x: player.pos.x, z: player.pos.z, y: player.pos.y, isPlayer: true, obj: null };
  let bd = Math.hypot(best.x - p.x, best.z - p.z);
  for (const a of allies) {
    if (a.inCar) continue;
    const d = Math.hypot(a.g.position.x - p.x, a.g.position.z - p.z);
    if (d < bd * 0.85) { bd = d; best = { x: a.g.position.x, z: a.g.position.z, y: 0, isPlayer: false, obj: a }; }
  }
  best.d = Math.max(bd, 0.01);
  return best;
}

function fireEnemyBullet(from, dir, dmg, speed, size, color, ownerBoss) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(size, 8, 8), new THREE.MeshBasicMaterial({ color }));
  m.position.copy(from);
  scene.add(m);
  ebullets.push({ m, v: dir.clone().normalize().multiplyScalar(speed), dmg, life: 3.5, size });
}

function hurtPlayer(d) {
  if (state !== 'play') return;
  if (shieldT > 0) d *= 0.3;
  if (driving) d *= 0.6;
  player.hp -= d;
  vigT = Math.min(1, vigT + 0.45 + d / 40);
  shake = Math.min(0.5, shake + 0.12);
  SFX.hurt();
  if (player.hp <= 0) { player.hp = 0; gameOver(); }
}
function hurtAlly(a, d) {
  a.hp -= d; a.flash = 0.12;
  if (a.hp <= 0) {
    scene.remove(a.g);
    allies.splice(allies.indexOf(a), 1);
    toast('¡Tu compañero cayó!', '#ff5a4a');
    burst(a.g.position.clone().setY(1), 0x7bed9f, 14, 4);
    SFX.die();
  }
}

function stomp(e) {
  const p = e.g.position;
  ringFx(p, 10, 0xff7a3a);
  SFX.stomp(); shake = Math.max(shake, 0.35);
  if (Math.hypot(player.pos.x - p.x, player.pos.z - p.z) < 10 && player.pos.y < 1.3) hurtPlayer(17 * (1 + 0.03 * (wave - 1)));
  for (const a of allies.slice()) if (Math.hypot(a.g.position.x - p.x, a.g.position.z - p.z) < 10) hurtAlly(a, 30);
}

function updateEnemy(e, dt) {
  const g = e.g, p = g.position, def = e.def, ps = e.parts;
  const t = chooseTarget(e);
  const dx = t.x - p.x, dz = t.z - p.z, dist = t.d;
  g.rotation.y = Math.atan2(-dx, -dz);
  const nx = dx / dist, nz = dz / dist;
  let mvx = 0, mvz = 0;
  if (def.melee) {
    if (dist > def.range * 0.7) { mvx = nx; mvz = nz; }
  } else {
    const ideal = e.isBoss ? 18 : def.range * 0.55;
    if (dist > ideal + 3) { mvx = nx; mvz = nz; }
    else if (dist < ideal - 5) { mvx = -nx * 0.7; mvz = -nz * 0.7; }
    else {
      e.strafeT -= dt;
      if (e.strafeT <= 0) { e.strafeDir *= -1; e.strafeT = rand(1.5, 3.5); }
      mvx = -nz * e.strafeDir * 0.6; mvz = nx * e.strafeDir * 0.6;
    }
  }
  if (e.stuckT > 0) {
    e.stuckT -= dt;
    if (mvx === 0 && mvz === 0) { mvx = -nz * e.stuckDir; mvz = nx * e.stuckDir; }
    else {
      const c = Math.cos(1.2 * e.stuckDir), s = Math.sin(1.2 * e.stuckDir);
      const rx = mvx * c - mvz * s, rz = mvx * s + mvz * c; mvx = rx; mvz = rz;
    }
  }
  for (const o of enemies) {
    if (o === e) continue;
    const ox = p.x - o.g.position.x, oz = p.z - o.g.position.z, d2 = ox * ox + oz * oz, m = e.radius + o.radius;
    if (d2 < m * m && d2 > 1e-4) { const d = Math.sqrt(d2); mvx += ox / d * 0.8; mvz += oz / d * 0.8; }
  }
  const sx = p.x, sz = p.z;
  p.x += mvx * e.speed * dt; p.z += mvz * e.speed * dt;
  collide(p, e.radius);
  const moved = Math.hypot(p.x - sx, p.z - sz), want = Math.hypot(mvx, mvz) * e.speed * dt;
  if (want > 0.001 && moved < want * 0.3) {
    e.stuckAcc += dt;
    if (e.stuckAcc > 0.4 && e.stuckT <= 0) { e.stuckT = rand(0.6, 1.2); e.stuckDir = Math.random() < 0.5 ? -1 : 1; e.stuckAcc = 0; }
  } else e.stuckAcc = Math.max(0, e.stuckAcc - dt);

  // animación
  const moving = want > 0.001;
  if (moving) e.anim += dt * e.speed * 2.4 / Math.sqrt(e.scale);
  const sw = moving ? Math.sin(e.anim) : 0;
  ps.legL.rotation.x = sw * 0.75; ps.legR.rotation.x = -sw * 0.75;
  if (def.melee) {
    e.attackT -= dt;
    ps.armL.rotation.x = -sw * 0.9;
    ps.armR.rotation.x = e.attackT > 0 ? Math.PI / 2 : sw * 0.9;
  } else {
    ps.armR.rotation.x = Math.PI / 2; ps.armL.rotation.x = Math.PI / 2 * 0.85;
  }
  if (def.float) p.y = def.float + Math.sin(time * 2.4 + e.bob) * 0.18;
  if (e.flash > 0) {
    e.flash -= dt;
    const on = e.flash > 0;
    for (const m of ps.mats) m.emissive.setHex(on ? 0x992222 : 0x000000);
  }

  // ataque
  e.cd -= dt;
  if (def.melee) {
    if (dist < def.range + 0.4 && e.cd <= 0) {
      e.cd = def.rate; e.attackT = 0.25;
      if (t.isPlayer) hurtPlayer(e.dmg); else hurtAlly(t.obj, e.dmg);
    }
  } else if (e.isBoss) {
    e.stompCd -= dt; e.sumT -= dt;
    if (e.stompCd <= 0 && dist < 11) { e.stompCd = 3.5; stomp(e); }
    if (e.sumT <= 0 && enemies.length < 18) {
      e.sumT = 14;
      for (let i = 0; i < 3; i++) {
        const a = rand(0, 6.28);
        const q = V3(clamp(p.x + Math.cos(a) * 6, -BOUND + 2, BOUND - 2), 0, clamp(p.z + Math.sin(a) * 6, -BOUND + 2, BOUND - 2));
        if (!insideCollider(q.x, q.z, 1)) spawnEnemy(e.bossKind ? 'imp' : (wave > 3 ? 'policia' : 'taxista'), q);
      }
      subtitle(e.bossKind ? '¡Levántense, hijos del infierno!' : '¡Vengan, muchachos, ayúdenme con este loco!');
    }
    if (e.cd <= 0 && dist < def.range && hasLOS(p.x, p.z, t.x, t.z)) {
      e.cd = 1.7; e.pattern++;
      const n = e.pattern % 2 ? 3 : 5;
      const from = V3(p.x + nx * 1.5, 4.3, p.z + nz * 1.5);
      const dir = V3(dx, (t.y + 1.2) - 4.3, dz).normalize();
      for (let i = 0; i < n; i++) {
        const a = (i - (n - 1) / 2) * 0.16, c = Math.cos(a), s = Math.sin(a);
        const d2 = V3(dir.x * c - dir.z * s, dir.y, dir.x * s + dir.z * c);
        fireEnemyBullet(from, d2, e.dmg, def.bspeed, 0.3, 0xff5533, true);
      }
      SFX.enemy(); tone(90, 0.3, 0.3, 'sawtooth', -30);
    }
  } else if (e.cd <= 0 && dist < def.range && hasLOS(p.x, p.z, t.x, t.z)) {
    e.cd = def.rate * rand(0.9, 1.3);
    const from = V3(p.x + nx * 0.8, 1.5 * e.scale, p.z + nz * 0.8);
    const dir = V3(dx + rand(-1, 1) * def.spread * dist, (t.y + 1.2) - from.y + rand(-1, 1) * def.spread * dist * 0.5, dz + rand(-1, 1) * def.spread * dist);
    fireEnemyBullet(from, dir, e.dmg, def.bspeed, def.bsize || 0.12, def.bcolor || 0xffe066);
    if (dist < 45) (def.monster ? SFX.fireball : SFX.enemy)();
  }
}

function hitEnemy(e, d, point) {
  if (e.dead) return;
  e.hp -= d; e.flash = 0.1;
  burst(point, e.def.monster ? 0xff8a2a : 0xb01818, e.isBoss ? 3 : 6, 3.5, 0.45);
  if (e.isBoss) updateBossBar();
  if (e.hp <= 0) killEnemy(e);
}

function killEnemy(e) {
  const i = enemies.indexOf(e);
  if (i >= 0) enemies.splice(i, 1);
  e.dead = true; e.deathT = 0; corpses.push(e);
  if (e.def.float) e.g.position.y = 0.25;
  kills++; score += Math.round(e.def.score * (1 + wave * 0.05));
  allyCharge = Math.min(allyCharge + (e.isBoss ? 6 : 1), ALLY_COST * MAX_ALLIES);
  dropLoot(e);
  SFX.die();
  if (e.isBoss) {
    bossRef = null; bossesKilled++;
    burst(e.g.position.clone().setY(3), 0xff8a2a, 70, 12, 1.1);
    $('bossWrap').classList.add('hidden');
    banner('¡JEFE DERROTADO!', 'Siguen las oleadas… no pares', 3200);
    subtitle('¡Tan grandote y cayó como cualquiera!');
  } else if (Math.random() < 0.22) subtitle(pick(KILL_LINES));
}

/* =====================================================================
   BOTÍN
===================================================================== */
const PICK = {
  ammo:   { color: 0xe67e22, label: '+ MUNICIÓN' },
  health: { color: 0x2ecc71, label: '+ CURACIÓN' },
  damage: { color: 0xe74c3c, label: 'DAÑO x2' },
  speed:  { color: 0x3498db, label: 'VELOCIDAD' },
  shield: { color: 0x1abc9c, label: 'ESCUDO' },
  rapid:  { color: 0xf1c40f, label: 'CADENCIA x2' },
  wp_smg:      { color: 0xb06bff, label: 'ARMA ESPECIAL: SUBFUSIL', weapon: 'smg' },
  wp_rifle:    { color: 0xff4fa3, label: 'ARMA ESPECIAL: FUSIL DE ASALTO', weapon: 'rifle' },
  wp_sniper:   { color: 0xffffff, label: 'ARMA ESPECIAL: FRANCOTIRADOR', weapon: 'sniper' },
  wp_launcher: { color: 0x7dff4a, label: 'ARMA ESPECIAL: LANZAGRANADAS', weapon: 'launcher' },
};
function spawnPickup(type, x, z) {
  const c = PICK[type].color;
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 0.6 }));
  g.add(core);
  if (type === 'health') {
    const w = new THREE.MeshBasicMaterial({ color: 0xffffff });
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.62), w));
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.62), w));
  }
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.2, 8), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.35 }));
  beam.position.y = 1.5;
  g.add(beam);
  g.position.set(x, 0.8, z);
  if (PICK[type].weapon) g.scale.setScalar(1.4);
  scene.add(g);
  pickups.push({ g, core, type, life: PICK[type].weapon ? 45 : 28, t: rand(0, 6) });
}
function dropLoot(e) {
  const p = e.g.position;
  const around = (r) => [p.x + rand(-r, r), p.z + rand(-r, r)];
  if (e.isBoss) {
    for (const t of ['health', 'health', 'ammo', 'ammo', 'damage', 'shield', 'rapid', 'speed']) spawnPickup(t, ...around(4));
    const un = SPECIALS.filter(k => !owned[k]);
    spawnPickup('wp_' + pick(un.length ? un : SPECIALS), ...around(3));
    return;
  }
  if (e.type === 'policia' || e.type === 'swat') {
    const ch = !specialDropped ? 1 : (e.type === 'swat' ? 0.32 : 0.18);
    if (Math.random() < ch) {
      specialDropped = true;
      spawnPickup('wp_' + pick(e.type === 'swat' ? SPECIALS : ['smg', 'rifle', 'sniper']), p.x, p.z);
      return;
    }
  }
  const luck = e.type === 'swat' ? 1.4 : e.type === 'policia' ? 1.15 : 1;
  let r = Math.random();
  if (reserve[cur] < 8 && Math.random() < 0.5) { spawnPickup('ammo', p.x, p.z); return; }
  if (player.hp < 90 && Math.random() < 0.3) { spawnPickup('health', p.x, p.z); return; }
  if (r < 0.30 * luck) spawnPickup('ammo', p.x, p.z);
  else if (r < 0.46 * luck) spawnPickup('health', p.x, p.z);
  else if (r < 0.58 * luck) spawnPickup(pick(['damage', 'speed', 'shield', 'rapid']), p.x, p.z);
}
function collect(pk) {
  const t = pk.type;
  if (PICK[t].weapon) {
    const k = PICK[t].weapon, w = WEAPONS[k];
    if (!owned[k]) { owned[k] = true; mag[k] = w.mag; reserve[k] = w.mag * 2; switchWeapon(k); }
    else reserve[k] = Math.min(w.maxRes, reserve[k] + w.mag * 2);
  } else if (t === 'ammo') {
    for (const k of ALLW) if (owned[k]) reserve[k] = Math.min(WEAPONS[k].maxRes, reserve[k] + WEAPONS[k].pick);
  } else if (t === 'health') player.hp = Math.min(player.max, player.hp + 60);
  else if (t === 'damage') dmgT = 14;
  else if (t === 'speed') speedT = 14;
  else if (t === 'shield') shieldT = 10;
  else if (t === 'rapid') rapidT = 12;
  toast(PICK[t].label, '#' + PICK[t].color.toString(16).padStart(6, '0'));
  SFX.pickup();
  burst(pk.g.position, PICK[t].color, 10, 3);
}

/* =====================================================================
   COMPAÑERO
===================================================================== */
function spawnAlly(i) {
  const h = makeHuman({ shirt: i % 2 ? 0x2f6fa8 : 0x2f8f5b, pants: 0x20242b, skin: pick(SKINS), hat: 0xf1c40f, vest: 0xff7f11, guns: ['pistol'] });
  h.guns.pistol.visible = true;
  const a = { g: h.g, parts: h, hp: 200, max: 200, cd: 0.4, anim: 0, flash: 0, inCar: driving, talkT: rand(2, 5) };
  const r = V3(Math.cos(yaw), 0, -Math.sin(yaw)), side = i % 2 === 0 ? 1 : -1;
  h.g.position.set(player.pos.x + r.x * 2.5 * side, 0, player.pos.z + r.z * 2.5 * side);
  collide(h.g.position, 0.5);
  const mark = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 6), new THREE.MeshBasicMaterial({ color: 0x4ec9ff }));
  mark.rotation.x = Math.PI; mark.position.y = 2.8; h.g.add(mark);
  scene.add(h.g);
  allies.push(a);
  burst(h.g.position.clone().setY(1), 0x4ec9ff, 26, 6, 0.8);
  ringFx(h.g.position, 3, 0x4ec9ff);
}
function summonAlly() {
  if (state !== 'play') return;
  const free = MAX_ALLIES - allies.length;
  if (free <= 0) { toast('Ya tienes a tus 2 compañeros', '#4ec9ff'); return; }
  const n = Math.min(free, Math.floor(allyCharge / ALLY_COST));
  if (n <= 0) { toast('Faltan bajas: cada compañero cuesta ' + ALLY_COST, '#4ec9ff'); return; }
  allyCharge -= n * ALLY_COST;
  for (let i = 0; i < n; i++) spawnAlly(allies.length);
  SFX.ally();
  banner(n > 1 ? '¡DOS COMPAÑEROS!' : '¡COMPAÑERO INVOCADO!', 'Colegas taxistas con su fierro', 2200);
  subtitle('¡Vengan, colegas, a darles su merecido a estos atravesados!');
}
function updateAlly(a, dt) {
  const g = a.g, p = g.position;
  let ne = null, nd = 1e9;
  for (const e of enemies) {
    const d = Math.hypot(e.g.position.x - p.x, e.g.position.z - p.z);
    if (d < nd) { nd = d; ne = e; }
  }
  let moving = false, mx = 0, mz = 0;
  if (a.inCar) {
    const idx = allies.indexOf(a), side = idx % 2 === 0 ? 1 : -1, fwd = idx % 2 === 0 ? 0.3 : -0.9;
    const fx = -Math.sin(taxi.h), fz = -Math.cos(taxi.h), rx = Math.cos(taxi.h), rz = -Math.sin(taxi.h);
    p.set(taxi.x + rx * 0.8 * side + fx * fwd, 0.15, taxi.z + rz * 0.8 * side + fz * fwd);
  } else {
    const dpx = player.pos.x - p.x, dpz = player.pos.z - p.z, dp = Math.hypot(dpx, dpz) || 1;
    if (dp > 8) { mx = dpx / dp; mz = dpz / dp; }
    else if (dp < 2.5) { mx = -dpx / dp * 0.5; mz = -dpz / dp * 0.5; }
    const sx = p.x, sz = p.z;
    p.x += mx * 7.5 * dt; p.z += mz * 7.5 * dt; p.y = 0;
    collide(p, 0.5);
    moving = Math.hypot(p.x - sx, p.z - sz) > 0.001;
  }
  if (moving) a.anim += dt * 12;
  const sw = moving ? Math.sin(a.anim) : 0;
  a.parts.legL.rotation.x = sw * 0.75; a.parts.legR.rotation.x = -sw * 0.75;
  a.parts.armR.rotation.x = Math.PI / 2; a.parts.armL.rotation.x = Math.PI / 2 * 0.85;
  if (ne && nd < 45) g.rotation.y = Math.atan2(-(ne.g.position.x - p.x), -(ne.g.position.z - p.z));
  else if (a.inCar) g.rotation.y = taxi.h;
  else if (moving) g.rotation.y = Math.atan2(-mx, -mz);
  if (a.flash > 0) { a.flash -= dt; for (const m of a.parts.mats) m.emissive.setHex(a.flash > 0 ? 0x992222 : 0x000000); }
  a.cd -= dt;
  if (ne && nd < 45 && a.cd <= 0 && hasLOS(p.x, p.z, ne.g.position.x, ne.g.position.z)) {
    a.cd = a.inCar ? 0.38 : 0.5;
    const from = V3(p.x, p.y + 1.5, p.z);
    const to = V3(ne.g.position.x, 1.2 * ne.scale, ne.g.position.z);
    tracer(from, to, 0x7bed9f);
    SFX.enemy();
    if (Math.random() < 0.8) { hitEnemy(ne, 15, to); if (ne.dead && Math.random() < 0.3) allyLine(pick(ALLY_KILL), allies.indexOf(a)); }
  }
  a.talkT -= dt;
  if (a.talkT <= 0 && (enemies.length > 0 || driving)) {
    a.talkT = rand(5, 9) * (a.inCar ? 0.7 : 1);
    allyLine(pick(ALLY_LINES), allies.indexOf(a));
  }
}

/* =====================================================================
   OLEADAS
===================================================================== */
function maxActive() { return Math.min(8 + wave * 2, 22); }
function startWave() {
  wave++;
  const n = 6 + wave * 3;
  spawnQueue = [];
  for (let i = 0; i < n; i++) {
    const t = pickType(wave);
    spawnQueue.push(t);
  }
  bossPending = wave % 3 === 0;
  waveState = 'fight'; spawnT = 0.5;
  banner('OLEADA ' + wave, bossPending ? '⚠ Al final te espera un JEFE GIGANTE' : n + ' enemigos');
  subtitle(pick(INSULTS));
}
function spawnBoss() {
  const idx = bossesKilled;
  const base = BOSSES[idx % BOSSES.length];
  const b = Object.assign({}, base, { hp: 1000 + 500 * idx });
  bossRef = spawnEnemy('boss', spawnPos(), b);
  $('bossName').textContent = b.name;
  $('bossWrap').classList.remove('hidden');
  updateBossBar();
  SFX.boss();
  banner('¡JEFE FINAL!', b.name, 3200);
  subtitle(pick(BOSS_LINES));
}
function updateBossBar() { if (bossRef) $('bossBar').style.width = Math.max(0, bossRef.hp / bossRef.maxHp * 100) + '%'; }
function chooseNextZone() {
  const c = [];
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
    const x = i * PITCH, z = j * PITCH;
    if (Math.hypot(x - taxi.x, z - taxi.z) > 70) c.push({ x, z });
  }
  const nz = c.length ? pick(c) : { x: 0, z: 0 };
  zone.x = nz.x; zone.z = nz.z;
}
function endWave() {
  waveState = 'toTaxi';
  chooseNextZone();
  player.hp = Math.min(player.max, player.hp + 40);
  spawnPickup('ammo', player.pos.x + rand(-3, 3), player.pos.z + rand(-3, 3));
  banner('OLEADA ' + wave + ' SUPERADA', KT('Sube al taxi [F] y ve a la siguiente zona', 'Acércate al taxi y toca TAXI'), 3600);
  subtitle('¡Pa\' la próxima zona, que la noche es larga!');
}
function tryEnterTaxi() {
  if (state !== 'play' || paused || driving || waveState !== 'toTaxi') return;
  const d = Math.hypot(player.pos.x - taxi.x, player.pos.z - taxi.z);
  if (d > 6) { toast('El taxi está a ' + Math.round(d) + ' m', '#f7c600'); return; }
  driving = true; waveState = 'drive'; driveSpawnT = 1.5;
  unparkTaxi(); taxi.speed = 0;
  for (const a of allies) a.inCar = true;
  aim = false;
  startEngine();
  banner('¡A MANEJAR!', 'Llega a la zona azul · atropella a quien se cruce · si chocas fuerte con un edificio, la oleada empieza ahí', 4200);
  subtitle('¡Ahora sí, a atropellar a esos pícaros!');
}
function driveSpawn(dt) {
  driveSpawnT -= dt;
  for (const e of enemies.slice()) {
    if (Math.hypot(e.g.position.x - taxi.x, e.g.position.z - taxi.z) > 120) {
      scene.remove(e.g); enemies.splice(enemies.indexOf(e), 1);
      if (e === bossRef) bossRef = null;
    }
  }
  if (driveSpawnT > 0 || enemies.length >= 14) return;
  driveSpawnT = rand(0.55, 1.1);
  const fx = -Math.sin(taxi.h), fz = -Math.cos(taxi.h), w = wave + 1;
  for (let tries = 0; tries < 12; tries++) {
    const d = rand(40, 70), lat = rand(-20, 20);
    const x = clamp(taxi.x + fx * d - fz * lat, -BOUND + 2, BOUND - 2), z = clamp(taxi.z + fz * d + fx * lat, -BOUND + 2, BOUND - 2);
    if (insideCollider(x, z, 1.2)) continue;
    const t = pickType(w);
    spawnEnemy(t, V3(x, 0, z));
    break;
  }
}
function arrive() {
  driving = false; stopEngine(); stopHorn();
  taxi.speed = 0;
  parkTaxi();
  player.pos.set(taxi.x + Math.cos(taxi.h) * 3.4, 0, taxi.z - Math.sin(taxi.h) * 3.4);
  collide(player.pos, player.r);
  yaw = taxi.h; pitch = 0;
  for (const a of allies) {
    a.inCar = false; a.g.visible = true;
    a.g.position.set(player.pos.x + rand(-3, 3), 0, player.pos.z + rand(-3, 3));
    collide(a.g.position, 0.5);
  }
  waveState = 'break'; waveTimer = 4;
  SFX.screech();
  burst(V3(taxi.x, 0.3, taxi.z), 0xaaaaaa, 20, 4, 0.9);
  banner('ZONA ALCANZADA', 'Oleada ' + (wave + 1) + ' en 4 segundos', 3000);
  subtitle(pick(INSULTS));
}
function runOver(dt) {
  const sp = Math.abs(taxi.speed);
  const fx = -Math.sin(taxi.h), fz = -Math.cos(taxi.h), ds = Math.sign(taxi.speed) || 1;
  for (const e of enemies.slice()) {
    if (e.carCd > 0) { e.carCd -= dt; continue; }
    if (sp < 5) continue;
    const ep = e.g.position, rr = 1.15 + e.radius * (e.isBoss ? 0.6 : 1);
    let hit = false;
    for (const o of [1.4, -1.4]) if (Math.hypot(ep.x - (taxi.x + fx * o), ep.z - (taxi.z + fz * o)) < rr) hit = true;
    if (!hit) continue;
    e.carCd = 0.7;
    hitEnemy(e, sp * 9, V3(ep.x, 1, ep.z));
    SFX.runover(); shake = Math.max(shake, 0.25);
    taxi.speed *= e.isBoss ? 0.4 : (e.def.heavy ? 0.7 : 0.94);
    if (e.dead) {
      e.fly = { x: fx * ds * sp * 0.8 + rand(-2, 2), z: fz * ds * sp * 0.8 + rand(-2, 2), y: 6 };
      score += 15;
      if (Math.random() < 0.3) subtitle(pick(['¡Atropellado, mala hora!', '¡Pa\' que no se atraviese!', '¡Cuidado con el taxi, torpe!']));
    } else {
      ep.x += fx * ds * 2.5; ep.z += fz * ds * 2.5; collide(ep, e.radius);
    }
  }
}
function updateDriving(dt) {
  const k = keys, sp = taxi.speed;
  const maxF = (k.ShiftLeft || k.ShiftRight) ? 36 : 28;
  if (k.KeyW) taxi.speed += (sp < 0 ? 40 : 20) * dt;
  else if (k.KeyS) taxi.speed -= (sp > 0 ? 34 : 14) * dt;
  else taxi.speed -= Math.sign(sp) * Math.min(Math.abs(sp), 7 * dt);
  if (k.Space) taxi.speed -= Math.sign(taxi.speed) * Math.min(Math.abs(taxi.speed), 30 * dt);
  taxi.speed = clamp(taxi.speed, -9, maxF);
  const steer = (k.KeyA ? 1 : 0) - (k.KeyD ? 1 : 0);
  taxi.h += steer * 1.9 * clamp(Math.abs(taxi.speed) / 7, 0, 1) * (taxi.speed < 0 ? -1 : 1) * dt * (k.Space ? 1.6 : 1);
  const fx = -Math.sin(taxi.h), fz = -Math.cos(taxi.h);
  const sx = taxi.x, sz = taxi.z;
  const p = { x: taxi.x + fx * taxi.speed * dt, z: taxi.z + fz * taxi.speed * dt };
  collide(p, 1.45);
  const want = Math.abs(taxi.speed) * dt, moved = Math.hypot(p.x - sx, p.z - sz);
  taxi.crashCd -= dt;
  if (want > 0.02 && moved < want * 0.55 && taxi.crashCd <= 0) {
    if (Math.abs(taxi.speed) > 11 && nearBuilding(p.x, p.z)) { taxi.x = p.x; taxi.z = p.z; crashEnd(); return; }
    if (Math.abs(taxi.speed) > 8) { shake = Math.max(shake, 0.35); SFX.crash(); burst(V3(p.x, 1, p.z), 0xdddddd, 8, 5); }
    taxi.speed *= 0.3; taxi.crashCd = 0.35;
  }
  taxi.x = p.x; taxi.z = p.z;
  taxi.g.position.set(taxi.x, 0, taxi.z); taxi.g.rotation.y = taxi.h;
  player.pos.set(taxi.x, 0, taxi.z); player.vy = 0;
  yaw = taxi.h; pitch = 0;
  runOver(dt);
  if (engine) { engine.o.frequency.value = 55 + Math.abs(taxi.speed) * 5; engine.g.gain.value = 0.05 + Math.min(0.05, Math.abs(taxi.speed) * 0.002); }
}
function nearBuilding(x, z) {
  for (const c of colliders) if (c.bld && x > c.x1 - 2.1 && x < c.x2 + 2.1 && z > c.z1 - 2.1 && z < c.z2 + 2.1) return true;
  return false;
}
// Choque fuerte contra un edificio: el taxi se detiene y la siguiente oleada empieza ahí
function crashEnd() {
  const sp = Math.abs(taxi.speed);
  driving = false; stopEngine(); stopHorn();
  taxi.speed = 0;
  parkTaxi();
  const hx = -Math.sin(taxi.h), hz = -Math.cos(taxi.h);
  burst(V3(taxi.x + hx * 1.8, 1.2, taxi.z + hz * 1.8), 0xdddddd, 28, 7, 1.0);
  burst(V3(taxi.x + hx * 1.8, 1.0, taxi.z + hz * 1.8), 0xffc27a, 14, 6, 0.6);
  ringFx(V3(taxi.x, 0, taxi.z), 6, 0xffb35a);
  SFX.crash(); SFX.explosion(); shake = 0.6;
  player.pos.set(taxi.x + Math.cos(taxi.h) * 3.4, 0, taxi.z - Math.sin(taxi.h) * 3.4);
  collide(player.pos, player.r);
  yaw = taxi.h; pitch = 0;
  for (const a of allies) {
    a.inCar = false; a.g.visible = true;
    a.g.position.set(player.pos.x + rand(-3, 3), 0, player.pos.z + rand(-3, 3));
    collide(a.g.position, 0.5);
  }
  hurtPlayer(Math.min(30, 6 + sp * 0.6));
  if (state !== 'play') return;
  waveState = 'break'; waveTimer = 3;
  banner('¡CHOCASTE CONTRA UN EDIFICIO!', 'La oleada ' + (wave + 1) + ' empieza aquí', 3000);
  subtitle(pick(['¡Vaya edificio, salió de la nada!', '¡Se me atravesó el edificio, caramba!', '¡Pues aquí los espero, tramposos!']));
}
function updateObjective(dt) {
  taxiBeacon.visible = waveState === 'toTaxi';
  taxiBeacon.position.set(taxi.x, 30, taxi.z);
  zoneMarker.visible = waveState === 'toTaxi' || waveState === 'drive';
  zoneMarker.position.set(zone.x, 0, zone.z);
  zoneMarker.scale.setScalar(1 + 0.04 * Math.sin(time * 4));
}
function explode(p, r, dmg) {
  ringFx(p, r, 0xff9a3a);
  burst(p, 0xff8a2a, 40, 9, 0.7); burst(p, 0x555555, 15, 4, 1.0);
  SFX.explosion(); shake = Math.max(shake, 0.4);
  for (const e of enemies.slice()) {
    const d = Math.hypot(e.g.position.x - p.x, e.g.position.z - p.z);
    if (d < r + e.radius) hitEnemy(e, dmg * (1 - 0.6 * d / (r + e.radius)), V3(e.g.position.x, 1, e.g.position.z));
  }
  const dp = Math.hypot(player.pos.x - p.x, player.pos.z - p.z);
  if (dp < 4) hurtPlayer(25 * (1 - dp / 4));
}
function waveLogic(dt) {
  if (waveState === 'break') { waveTimer -= dt; if (waveTimer <= 0) startWave(); return; }
  if (waveState === 'toTaxi') return;
  if (waveState === 'drive') {
    driveSpawn(dt);
    if (Math.hypot(taxi.x - zone.x, taxi.z - zone.z) < 9) arrive();
    return;
  }
  if (waveState === 'fight') {
    spawnT -= dt;
    if (spawnQueue.length && spawnT <= 0 && enemies.length < maxActive()) { spawnEnemy(spawnQueue.shift()); spawnT = 0.7; }
    if (!spawnQueue.length && enemies.length === 0) {
      if (bossPending) { bossPending = false; spawnBoss(); waveState = 'boss'; }
      else endWave();
    }
  } else if (waveState === 'boss') {
    if (!bossRef && enemies.length === 0) endWave();
  }
}

/* =====================================================================
   JUGADOR: movimiento, disparo, cámara
===================================================================== */
const raycaster = new THREE.Raycaster();

function startReload() {
  const w = WEAPONS[cur];
  if (reloading > 0 || mag[cur] >= w.mag) return;
  if (reserve[cur] <= 0) { toast('SIN MUNICIÓN', '#ff5a4a'); SFX.empty(); return; }
  reloading = w.reload; SFX.reload();
}
function switchWeapon(k) {
  if (!WEAPONS[k] || !owned[k] || k === cur) return;
  cur = k; reloading = 0; fireCd = 0.2; showWeaponModels();
}

function muzzlePos() {
  if (!thirdPerson) return camera.localToWorld(V3(0.22, -0.17, -0.55 - WEAPONS[cur].len));
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const head = V3(player.pos.x, player.pos.y + 1.65, player.pos.z);
  return head.add(V3(cy * 0.5, -0.2, -sy * 0.5)).add(V3(-sy * cp, sp, -cy * cp).multiplyScalar(0.8 + WEAPONS[cur].len));
}

function shoot() {
  const w = WEAPONS[cur];
  if (reloading > 0 || fireCd > 0) return;
  if (mag[cur] <= 0) { if (reserve[cur] > 0) startReload(); else { SFX.empty(); fireCd = 0.3; } return; }
  mag[cur]--;
  fireCd = w.rate / (rapidT > 0 ? 2 : 1);
  recoil = 1; pitch += w.kick * rand(0.6, 1); yaw += rand(-1, 1) * w.kick * 0.25;
  flashLight = 0.06;
  SFX[cur]();

  camera.updateMatrixWorld(true);
  const origin = V3(); camera.getWorldPosition(origin);
  const head = V3(player.pos.x, player.pos.y + 1.65, player.pos.z);
  const near = thirdPerson ? origin.distanceTo(head) : 0;
  const mz = muzzlePos();
  const enemyGroups = enemies.map(e => e.g);
  const dmgMul = dmgT > 0 ? 2 : 1;
  let hitAny = false;
  for (let i = 0; i < w.pellets; i++) {
    const dir = V3((Math.random() - 0.5) * 2 * w.spread, (Math.random() - 0.5) * 2 * w.spread, -1).normalize().applyQuaternion(camera.quaternion);
    raycaster.set(origin, dir); raycaster.near = near; raycaster.far = 220;
    const he = raycaster.intersectObjects(enemyGroups, true)[0];
    const ho = raycaster.intersectObjects(obstacleMeshes, false)[0];
    let end, hitE = null;
    if (he && (!ho || he.distance < ho.distance)) { end = he.point; hitE = he; }
    else if (ho) end = ho.point;
    else {
      let tt = 120;
      if (dir.y < -0.001) tt = Math.min(tt, -origin.y / dir.y);
      end = origin.clone().addScaledVector(dir, tt);
    }
    tracer(mz, end);
    if (w.explosive) { explode(end, w.explosive, w.dmg * dmgMul); hitAny = true; continue; }
    if (hitE) {
      const e = hitE.object.userData.enemy;
      if (e && !e.dead) {
        let d = w.dmg * dmgMul * (hitE.object.userData.head ? 2 : 1);
        if (cur === 'shotgun') d *= clamp(1 - hitE.distance / 45, 0.25, 1);
        hitEnemy(e, d, hitE.point);
        hitAny = true;
      }
    } else if (ho) burst(end, 0xcccccc, 2, 2, 0.3);
  }
  if (hitAny) { const h = $('hitmark'); h.classList.add('show'); clearTimeout(shoot.h); shoot.h = setTimeout(() => h.classList.remove('show'), 80); SFX.hit(); }
  if (mag[cur] <= 0 && reserve[cur] > 0) setTimeout(() => { if (state === 'play') startReload(); }, 250);
}

function updatePlayer(dt) {
  const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), r = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  const sy = Math.sin(yaw), cy = Math.cos(yaw);
  let mx = -sy * f + cy * r, mz = -cy * f - sy * r;
  const len = Math.hypot(mx, mz);
  if (len > 1) { mx /= len; mz /= len; }
  const sprint = (keys.ShiftLeft || keys.ShiftRight) && f > 0;
  const speed = (sprint ? 9.5 : 6.2) * (speedT > 0 ? 1.4 : 1);
  player.pos.x += mx * speed * dt; player.pos.z += mz * speed * dt;
  collide(player.pos, player.r);
  if (keys.Space && player.onGround) { player.vy = 7.5; player.onGround = false; }
  player.vy -= 22 * dt; player.pos.y += player.vy * dt;
  if (player.pos.y <= 0) { player.pos.y = 0; player.vy = 0; player.onGround = true; }
  const moving = len > 0.05 && player.onGround;
  if (moving) { walkBob += dt * (sprint ? 13 : 9); player.walk += dt * speed * 1.7; }
}

function updateCamera(dt) {
  const tf = driving ? 80 + Math.min(14, Math.abs(taxi.speed) * 0.4) : aim ? (cur === 'sniper' ? 20 : 50) : 75;
  if (Math.abs(camera.fov - tf) > 0.05) { camera.fov += (tf - camera.fov) * Math.min(1, dt * 10); camera.updateProjectionMatrix(); }
  if (driving) {
    const fx = -Math.sin(taxi.h), fz = -Math.cos(taxi.h);
    const want = V3(taxi.x - fx * 9.5, 4.8 + Math.abs(taxi.speed) * 0.03, taxi.z - fz * 9.5);
    camera.position.lerp(want, 1 - Math.exp(-8 * dt));
    camera.lookAt(taxi.x + fx * 5, 1.4, taxi.z + fz * 5);
    vm.visible = false; pm.g.visible = false;
    if (shake > 0) {
      camera.position.x += rand(-1, 1) * shake * 0.25; camera.position.y += rand(-1, 1) * shake * 0.25;
      shake = Math.max(0, shake - dt * 1.4);
    }
    return;
  }
  const head = V3(player.pos.x, player.pos.y + 1.65, player.pos.z);
  pitch = clamp(pitch, -1.45, 1.45);
  camera.rotation.set(pitch, yaw, 0);
  const moving = !!(keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD) && player.onGround;

  if (!thirdPerson) {
    camera.position.copy(head);
    if (moving) camera.position.y += Math.sin(walkBob * 1.0) * 0.045;
    vm.visible = !(aim && cur === 'sniper'); pm.g.visible = false;
  } else {
    const f = V3(0, 0, -1).applyEuler(camera.rotation), rt = V3(1, 0, 0).applyEuler(camera.rotation);
    const want = head.clone().addScaledVector(f, -4.3).addScaledVector(rt, 0.9); want.y += 0.4;
    const dir = want.clone().sub(head), dist = dir.length(); dir.normalize();
    raycaster.set(head, dir); raycaster.near = 0; raycaster.far = dist;
    const h = raycaster.intersectObjects(obstacleMeshes, false)[0];
    const d = h ? Math.max(0.6, h.distance - 0.3) : dist;
    camera.position.copy(head).addScaledVector(dir, d);
    camera.position.y = Math.max(camera.position.y, 0.4);
    vm.visible = false; pm.g.visible = true;
  }
  if (shake > 0) {
    camera.position.x += rand(-1, 1) * shake * 0.25; camera.position.y += rand(-1, 1) * shake * 0.25;
    shake = Math.max(0, shake - dt * 1.4);
  }

  // arma en primera persona
  const w = WEAPONS[cur];
  recoil = Math.max(0, recoil - dt * 7);
  let ox = 0.24, oy = -0.24 + (moving ? Math.sin(walkBob * 2) * 0.008 : 0), oz = -0.45, rz = 0;
  if (moving) ox += Math.sin(walkBob) * 0.01;
  if (reloading > 0) { const k = 1 - reloading / w.reload; oy -= Math.sin(k * Math.PI) * 0.25; rz = Math.sin(k * Math.PI) * 0.5; }
  vm.position.set(ox, oy, oz + recoil * 0.08);
  vm.rotation.set(recoil * 0.12, 0, rz);

  // modelo en tercera persona
  pm.g.position.copy(player.pos);
  pm.g.rotation.y = yaw;
  const sw = moving ? Math.sin(player.walk) : 0;
  pm.legL.rotation.x = sw * 0.8; pm.legR.rotation.x = -sw * 0.8;
  pm.armR.rotation.x = Math.PI / 2 + pitch + recoil * 0.15;
  pm.armL.rotation.x = Math.PI / 2 * 0.9 + pitch;
}

/* =====================================================================
   BALAS ENEMIGAS, PARTÍCULAS, ETC.
===================================================================== */
function updateBullets(dt) {
  for (let i = ebullets.length - 1; i >= 0; i--) {
    const b = ebullets[i];
    let dead = false;
    for (let s = 0; s < 2 && !dead; s++) {
      b.m.position.addScaledVector(b.v, dt / 2);
      const p = b.m.position;
      if (p.y < 0 || bulletBlocked(p.x, p.y, p.z)) { dead = true; burst(p, 0xffe066, 3, 2, 0.25); break; }
      const pr = (driving ? 1.4 : player.r) + b.size;
      if (Math.hypot(p.x - player.pos.x, p.z - player.pos.z) < pr && p.y > player.pos.y && p.y < player.pos.y + (driving ? 1.7 : 1.95)) {
        hurtPlayer(b.dmg); dead = true; break;
      }
      for (const a of allies) {
        if (a.inCar) continue;
        if (Math.hypot(p.x - a.g.position.x, p.z - a.g.position.z) < 0.6 + b.size && p.y > 0 && p.y < 1.95) { hurtAlly(a, b.dmg); dead = true; break; }
      }
    }
    b.life -= dt;
    if (dead || b.life <= 0) { scene.remove(b.m); b.m.geometry.dispose(); b.m.material.dispose(); ebullets.splice(i, 1); }
  }
}
function updateMisc(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.v.y -= 14 * dt; p.m.position.addScaledVector(p.v, dt);
    p.life -= dt;
    if (p.life <= 0 || p.m.position.y < 0) { scene.remove(p.m); particles.splice(i, 1); }
  }
  for (let i = tracers.length - 1; i >= 0; i--) {
    const t = tracers[i]; t.life -= dt;
    t.line.material.opacity = Math.max(0, t.life / 0.07);
    if (t.life <= 0) { scene.remove(t.line); t.line.geometry.dispose(); t.line.material.dispose(); tracers.splice(i, 1); }
  }
  for (let i = fxs.length - 1; i >= 0; i--) {
    const f = fxs[i]; f.t += dt; const k = f.t / f.dur;
    f.m.scale.setScalar(1 + k * f.maxR); f.m.material.opacity = 0.8 * (1 - k);
    if (k >= 1) { scene.remove(f.m); f.m.geometry.dispose(); f.m.material.dispose(); fxs.splice(i, 1); }
  }
  for (let i = corpses.length - 1; i >= 0; i--) {
    const c = corpses[i]; c.deathT += dt;
    c.g.rotation.x = -Math.PI / 2 * Math.min(1, c.deathT / 0.45);
    if (c.fly) {
      c.g.position.x += c.fly.x * dt; c.g.position.z += c.fly.z * dt;
      c.fly.y -= 20 * dt; c.g.position.y = Math.max(0, c.g.position.y + c.fly.y * dt);
      c.fly.x *= 0.96; c.fly.z *= 0.96;
      if (c.g.position.y === 0 && c.fly.y < 0) c.fly = null;
    }
    if (c.deathT > 3.5) c.g.position.y -= dt * 1.2;
    if (c.deathT > 5) { scene.remove(c.g); corpses.splice(i, 1); }
  }
  for (let i = pickups.length - 1; i >= 0; i--) {
    const pk = pickups[i];
    pk.t += dt; pk.life -= dt;
    pk.core.rotation.y += dt * 2; pk.core.rotation.x += dt;
    pk.g.position.y = 0.8 + Math.sin(pk.t * 3) * 0.15;
    pk.g.visible = pk.life > 5 || Math.floor(pk.life * 6) % 2 === 0;
    const dx = player.pos.x - pk.g.position.x, dz = player.pos.z - pk.g.position.z, d = Math.hypot(dx, dz);
    if (d < 4) { pk.g.position.x += dx / d * 9 * dt; pk.g.position.z += dz / d * 9 * dt; }
    if (d < 1.4) { collect(pk); scene.remove(pk.g); pickups.splice(i, 1); continue; }
    if (pk.life <= 0) { scene.remove(pk.g); pickups.splice(i, 1); }
  }
  for (const s of smoke) {
    s.userData.t = (s.userData.t + dt * 0.25) % 1;
    const k = s.userData.t;
    s.position.set(-2.2 + Math.sin(k * 6 + s.id) * 0.4, 1.4 + k * 5, -3.8 + Math.cos(k * 5 + s.id) * 0.4);
    s.scale.setScalar(0.6 + k * 2.2); s.material.opacity = 0.45 * (1 - k);
  }
}

/* =====================================================================
   HUD
===================================================================== */
const radar = $('radar').getContext('2d');
function drawRadar() {
  const R = 75, range = 65, sy = Math.sin(yaw), cy = Math.cos(yaw);
  radar.clearRect(0, 0, 150, 150);
  radar.strokeStyle = 'rgba(247,198,0,.25)'; radar.beginPath(); radar.arc(R, R, R - 2, 0, 7); radar.stroke();
  radar.beginPath(); radar.arc(R, R, (R - 2) / 2, 0, 7); radar.stroke();
  const dot = (x, z, col, s) => {
    const dx = x - player.pos.x, dz = z - player.pos.z;
    let a = dx * cy - dz * sy, b = -dx * sy - dz * cy; // a: derecha, b: adelante
    const d = Math.hypot(a, b); if (d > range) { a = a / d * range; b = b / d * range; }
    radar.fillStyle = col; radar.beginPath(); radar.arc(R + a / range * (R - 6), R - b / range * (R - 6), s, 0, 7); radar.fill();
  };
  for (const pk of pickups) dot(pk.g.position.x, pk.g.position.z, '#ffe27a', 2);
  dot(taxi.x, taxi.z, '#f7c600', 4);
  if (waveState === 'toTaxi' || waveState === 'drive') dot(zone.x, zone.z, '#3ee0ff', 5);
  for (const a of allies) dot(a.g.position.x, a.g.position.z, '#4ec9ff', 3.5);
  for (const e of enemies) dot(e.g.position.x, e.g.position.z, e.isBoss ? '#ff3bd0' : e.def.monster ? '#ff9a2a' : '#ff3b2f', e.isBoss ? 6 : 3);
  radar.fillStyle = '#fff'; radar.beginPath(); radar.moveTo(R, R - 6); radar.lineTo(R - 4, R + 4); radar.lineTo(R + 4, R + 4); radar.fill();
}
function updateHud() {
  $('waveTxt').textContent = 'OLEADA ' + Math.max(1, wave);
  $('killTxt').textContent = 'Bajas ' + kills + ' · Puntos ' + score;
  const left = enemies.length + (spawnQueue ? spawnQueue.length : 0);
  const dTaxi = Math.round(Math.hypot(player.pos.x - taxi.x, player.pos.z - taxi.z)), dZone = Math.round(Math.hypot(taxi.x - zone.x, taxi.z - zone.z));
  $('leftTxt').textContent = waveState === 'break' ? 'Próxima oleada en ' + Math.ceil(waveTimer) + 's'
    : waveState === 'toTaxi' ? 'Oleada superada: ve al taxi'
    : waveState === 'drive' ? 'Zona marcada a ' + dZone + ' m'
    : 'Enemigos restantes: ' + left + (bossPending ? ' + JEFE' : '');
  const obj = waveState === 'toTaxi' ? KT('SUBE AL TAXI [F] · ', 'ACÉRCATE AL TAXI Y TOCA TAXI · ') + dTaxi + ' m' : waveState === 'drive' ? 'LLEGA A LA ZONA · ' + dZone + ' m' : '';
  if (updateHud.o !== obj) { $('objective').textContent = obj; $('objective').classList.toggle('hidden', !obj); updateHud.o = obj; }
  $('crosshair').style.display = driving ? 'none' : '';
  const hp = Math.max(0, player.hp);
  $('hpNum').textContent = Math.ceil(hp);
  $('hpBar').style.width = hp / player.max * 100 + '%';
  $('hpBar').style.background = 'hsl(' + (hp / player.max * 120) + ',70%,45%)';
  const w = WEAPONS[cur];
  if (driving) {
    $('wName').textContent = 'TAXI';
    $('ammo').innerHTML = Math.round(Math.abs(taxi.speed) * 3.6) + '<small> km/h</small>';
    $('reloadTxt').textContent = '';
  } else {
    $('wName').textContent = w.name;
    $('ammo').innerHTML = mag[cur] + '<small> / ' + reserve[cur] + '</small>';
    $('reloadTxt').textContent = reloading > 0 ? 'RECARGANDO…' : (mag[cur] === 0 && reserve[cur] === 0 ? '¡SIN MUNICIÓN!' : '');
  }
  const wk = driving ? '[W/S] Acelerar / frenar · [A/D] Girar · [Shift] Turbo · [Espacio] Freno · [H] Claxon'
    : ALLW.filter(k => owned[k]).map(k => '[' + (ALLW.indexOf(k) + 1) + '] ' + WEAPONS[k].name.charAt(0) + WEAPONS[k].name.slice(1).toLowerCase()).join(' · ') + ' · [R] Recargar · [F] Taxi';
  if (updateHud.k !== wk) { $('wkeys').textContent = wk; updateHud.k = wk; }
  $('vignette').style.opacity = vigT; $('shieldfx').style.opacity = shieldT > 0 ? 1 : 0;
  const buffs = [];
  if (dmgT > 0) buffs.push('<span class="buff" style="background:#e74c3c">DAÑO x2 ' + Math.ceil(dmgT) + 's</span>');
  if (speedT > 0) buffs.push('<span class="buff" style="background:#3498db">VELOCIDAD ' + Math.ceil(speedT) + 's</span>');
  if (shieldT > 0) buffs.push('<span class="buff" style="background:#1abc9c">ESCUDO ' + Math.ceil(shieldT) + 's</span>');
  if (rapidT > 0) buffs.push('<span class="buff" style="background:#f1c40f">CADENCIA ' + Math.ceil(rapidT) + 's</span>');
  const bh = buffs.join('');
  if (updateHud.b !== bh) { $('buffs').innerHTML = bh; updateHud.b = bh; }
  const allyMax = ALLY_COST * MAX_ALLIES;
  $('allyTxt').textContent = Math.min(allyCharge, allyMax) + '/' + allyMax;
  $('allyBar').style.width = Math.min(1, allyCharge / allyMax) * 100 + '%';
  const canN = Math.min(MAX_ALLIES - allies.length, Math.floor(allyCharge / ALLY_COST));
  $('allyHint').textContent = allies.length >= MAX_ALLIES ? 'Equipo completo' : canN >= 2 ? KT('¡[E] invoca a los DOS!', '¡Toca COMPAÑEROS: invoca a los DOS!') : canN === 1 ? KT('¡[E] invoca 1 compañero!', '¡Toca COMPAÑEROS!') : '';
  $('allyHint').style.color = '#7bed9f';
  const al = allies.map(a => '<div class="allyHp"><div class="bar"><div style="width:' + Math.max(0, a.hp / a.max * 100) + '%"></div></div></div>').join('');
  if (updateHud.a !== al) { $('allyList').innerHTML = al; updateHud.a = al; }
  drawRadar();
  updateTouchUI();
}

/* =====================================================================
   FLUJO DEL JUEGO
===================================================================== */
function lockPointer() { try { const r = renderer.domElement.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) {} }
function resetGame() {
  for (const list of [enemies, corpses, allies]) for (const o of list) scene.remove(o.g);
  for (const b of ebullets) scene.remove(b.m);
  for (const p of pickups) scene.remove(p.g);
  for (const p of particles) scene.remove(p.m);
  for (const t of tracers) scene.remove(t.line);
  for (const f of fxs) scene.remove(f.m);
  enemies = []; corpses = []; ebullets = []; pickups = []; allies = []; particles = []; tracers = []; fxs = [];
  player.pos.set(0, 0, 4); player.vy = 0; player.hp = player.max; player.onGround = true;
  yaw = 0; pitch = 0;
  unparkTaxi(); driving = false; stopEngine(); stopHorn();
  taxi.x = TAXI_START.x; taxi.z = TAXI_START.z; taxi.h = TAXI_START.h; taxi.speed = 0; parkTaxi();
  zoneMarker.visible = false; taxiBeacon.visible = false;
  for (const k of ALLW) { owned[k] = !SPECIALS.includes(k); mag[k] = WEAPONS[k].mag; reserve[k] = 0; }
  reserve.pistol = 60; reserve.revolver = 30; reserve.shotgun = 24;
  aim = false; specialDropped = false; camera.fov = 75; camera.updateProjectionMatrix();
  cur = 'pistol'; reloading = 0; fireCd = 0; showWeaponModels();
  wave = 0; waveState = 'break'; waveTimer = 3; spawnQueue = []; spawnT = 0; bossPending = false; bossRef = null;
  kills = 0; score = 0; allyCharge = 0; bossesKilled = 0; monsterSeen = false;
  dmgT = speedT = shieldT = rapidT = vigT = shake = 0; insultT = 5;
  $('bossWrap').classList.add('hidden');
  $('toasts').innerHTML = '';
}
function startGame(touch) {
  touchMode = touch === true; document.body.classList.toggle('touch', touchMode); tuiCache = '';
  initAudio();
  resetGame();
  state = 'play'; paused = false;
  for (const id of ['menu', 'pause', 'over']) $(id).classList.add('hidden');
  $('hud').classList.remove('hidden');
  $('touch').classList.toggle('hidden', !touchMode);
  if (touchMode) { locked = true; goFullscreen(); } else lockPointer();
  banner('¡TE CHOCARON EL TAXI!', 'Bájate y hazlos pagar', 2800);
  subtitle('¿Quién fue el torpe que me chocó?!');
}
function gameOver() {
  state = 'over'; driving = false; stopEngine(); stopHorn();
  try { document.exitPointerLock(); } catch (e) { /* sin bloqueo */ }
  locked = false; mouseDown = false; aim = false;
  $('touch').classList.add('hidden');
  $('hud').classList.add('hidden');
  $('overStats').innerHTML = 'Llegaste a la <b>oleada ' + wave + '</b><br>Bajas: <b>' + kills + '</b> · Puntos: <b>' + score + '</b><br>Jefes derrotados: <b>' + bossesKilled + '</b>';
  $('overLine').textContent = pick(['«Ni el Pico y Placa me salvó…»', '«Mi familia me esperaba…»', '«Debí tomar la ruta por la 26…»', '«Al menos el taxi tenía seguro…»']);
  $('over').classList.remove('hidden');
}

document.addEventListener('pointerlockchange', () => {
  if (touchMode) return;
  locked = document.pointerLockElement === renderer.domElement;
  if (!locked && state === 'play') { paused = true; $('pause').classList.remove('hidden'); mouseDown = false; aim = false; stopHorn(); if (engine) engine.g.gain.value = 0; }
  else if (locked) { paused = false; $('pause').classList.add('hidden'); }
});
$('btnStart').onclick = () => startGame(COARSE);
$('btnStartTouch').onclick = () => startGame(true);
$('btnRetry').onclick = () => startGame(touchMode);
$('btnResume').onclick = () => resumeGame();
$('pause').addEventListener('click', e => { if (e.target.id === 'pause') resumeGame(); });

document.addEventListener('mousemove', e => {
  if (!locked || touchMode || state !== 'play') return;
  const ks = camera.fov / 75;
  yaw -= e.movementX * 0.0022 * ks;
  pitch -= e.movementY * 0.0022 * ks;
});
document.addEventListener('mousedown', e => { if (!locked || touchMode) return; if (e.button === 0) { mouseDown = true; if (driving) startHorn(); } else if (e.button === 2) aim = true; });
document.addEventListener('mouseup', e => { if (touchMode) return; if (e.button === 0) { mouseDown = false; stopHorn(); } else if (e.button === 2) aim = false; });
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('wheel', e => {
  if (!locked || touchMode || driving) return;
  const list = ALLW.filter(k => owned[k]);
  const i = list.indexOf(cur);
  switchWeapon(list[(i + (e.deltaY > 0 ? 1 : list.length - 1)) % list.length]);
});
document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
  if (state !== 'play' || paused) return;
  if (WEAPON_KEYS[e.code]) switchWeapon(WEAPON_KEYS[e.code]);
  else if (e.code === 'KeyR') startReload();
  else if (e.code === 'KeyF') tryEnterTaxi();
  else if (e.code === 'KeyH') { if (driving) startHorn(); }
  else if (e.code === 'KeyV') thirdPerson = !thirdPerson;
  else if (e.code === 'KeyE') summonAlly();
});
document.addEventListener('keyup', e => { keys[e.code] = false; if (e.code === 'KeyH') stopHorn(); });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; mouseDown = false; stopHorn(); });


/* ===== Controles táctiles (celular) ===== */
const joy = { id: null, x: 0, y: 0, active: false, was: false, ox: 0, oy: 0, R: 60 };
let lookTouch = null, tuiCache = '';
function goFullscreen() {
  try {
    const el = document.documentElement, f = el.requestFullscreen || el.webkitRequestFullscreen;
    if (f) { const p = f.call(el); if (p && p.catch) p.catch(() => {}); }
    if (window.screen && screen.orientation && screen.orientation.lock) { const q = screen.orientation.lock('landscape'); if (q && q.catch) q.catch(() => {}); }
  } catch (e) { /* no disponible */ }
}
function pauseGame() {
  if (state !== 'play' || paused) return;
  paused = true; mouseDown = false; aim = false; stopHorn();
  for (const k of ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft']) keys[k] = false;
  joy.active = false; joy.was = false; resetJoyUI();
  $('pause').classList.remove('hidden');
  if (engine) engine.g.gain.value = 0;
}
function resumeGame() {
  if (touchMode) { paused = false; $('pause').classList.add('hidden'); }
  else lockPointer();
}
function resetJoyUI() {
  joy.x = 0; joy.y = 0;
  const b = $('joyBase'); b.style.left = ''; b.style.top = ''; b.style.bottom = ''; b.style.opacity = '';
  $('joyKnob').style.transform = '';
}
function applyTouchKeys() {
  if (!(joy.active || joy.was)) return;
  const th = 0.33;
  keys.KeyW = joy.active && joy.y > th; keys.KeyS = joy.active && joy.y < -th;
  keys.KeyD = joy.active && joy.x > th; keys.KeyA = joy.active && joy.x < -th;
  joy.was = joy.active;
}
function updateTouchUI() {
  if (!touchMode) return;
  const canN = Math.min(MAX_ALLIES - allies.length, Math.floor(allyCharge / ALLY_COST));
  const key = [driving, waveState === 'toTaxi', canN > 0].join();
  if (key === tuiCache) return;
  tuiCache = key;
  $('touch').classList.toggle('driving', driving);
  $('tTaxi').classList.toggle('hidden', waveState !== 'toTaxi');
  $('tHorn').classList.toggle('hidden', !driving);
  $('tAlly').classList.toggle('hidden', canN <= 0);
  $('tJump').textContent = driving ? 'FRENO' : 'SALTAR';
  $('tRun').textContent = driving ? 'TURBO' : 'CORRER';
}
function bindTouch() {
  const zone = $('joyZone'), look = $('lookZone');
  const findT = (e, id) => { for (const t of e.changedTouches) if (t.identifier === id) return t; return null; };
  const joyMove = t => {
    let dx = t.clientX - joy.ox, dy = joy.oy - t.clientY;
    const m = Math.hypot(dx, dy), R = joy.R;
    if (m > R) { dx = dx / m * R; dy = dy / m * R; }
    joy.x = dx / R; joy.y = dy / R;
    $('joyKnob').style.transform = 'translate(' + dx + 'px,' + (-dy) + 'px)';
  };
  zone.addEventListener('touchstart', e => {
    e.preventDefault();
    if (joy.id !== null) return;
    const t = e.changedTouches[0], rc = zone.getBoundingClientRect(), b = $('joyBase'), bs = b.offsetWidth || 120;
    joy.id = t.identifier; joy.active = true; joy.R = bs * 0.5;
    joy.ox = clamp(t.clientX, rc.left + bs / 2, rc.right - bs / 2);
    joy.oy = clamp(t.clientY, rc.top + bs / 2, rc.bottom - bs / 2);
    b.style.left = (joy.ox - bs / 2) + 'px'; b.style.top = (joy.oy - bs / 2) + 'px'; b.style.bottom = 'auto'; b.style.opacity = '0.9';
    joyMove(t);
  }, { passive: false });
  zone.addEventListener('touchmove', e => { e.preventDefault(); const t = findT(e, joy.id); if (t) joyMove(t); }, { passive: false });
  const joyEnd = e => { e.preventDefault(); if (findT(e, joy.id)) { joy.id = null; joy.active = false; resetJoyUI(); } };
  zone.addEventListener('touchend', joyEnd, { passive: false });
  zone.addEventListener('touchcancel', joyEnd, { passive: false });

  look.addEventListener('touchstart', e => {
    e.preventDefault();
    if (lookTouch) return;
    const t = e.changedTouches[0];
    lookTouch = { id: t.identifier, x: t.clientX, y: t.clientY };
  }, { passive: false });
  look.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!lookTouch) return;
    const t = findT(e, lookTouch.id);
    if (!t) return;
    if (state === 'play' && !paused) {
      const ks = camera.fov / 75;
      yaw -= (t.clientX - lookTouch.x) * 0.0048 * ks;
      pitch -= (t.clientY - lookTouch.y) * 0.0048 * ks;
    }
    lookTouch.x = t.clientX; lookTouch.y = t.clientY;
  }, { passive: false });
  const lookEnd = e => { e.preventDefault(); if (lookTouch && findT(e, lookTouch.id)) lookTouch = null; };
  look.addEventListener('touchend', lookEnd, { passive: false });
  look.addEventListener('touchcancel', lookEnd, { passive: false });

  const hold = (id, down, up) => {
    const el = $(id); let on = false;
    const d = e => { e.preventDefault(); if (on) return; on = true; el.classList.add('on'); if (state === 'play' && !paused) down(); };
    const u = e => { e.preventDefault(); if (!on) return; on = false; el.classList.remove('on'); if (up) up(); };
    el.addEventListener('touchstart', d, { passive: false });
    el.addEventListener('touchend', u, { passive: false });
    el.addEventListener('touchcancel', u, { passive: false });
    el.addEventListener('mousedown', d); el.addEventListener('mouseup', u); el.addEventListener('mouseleave', u);
  };
  hold('tFire', () => { mouseDown = true; if (driving) startHorn(); }, () => { mouseDown = false; stopHorn(); });
  hold('tAim', () => { aim = true; }, () => { aim = false; });
  hold('tJump', () => { keys.Space = true; }, () => { keys.Space = false; });
  hold('tRun', () => { keys.ShiftLeft = true; }, () => { keys.ShiftLeft = false; });
  hold('tHorn', () => { if (driving) startHorn(); }, () => stopHorn());
  hold('tReload', startReload);
  hold('tWeapon', () => { const list = ALLW.filter(k => owned[k]); switchWeapon(list[(list.indexOf(cur) + 1) % list.length]); });
  hold('tCam', () => { thirdPerson = !thirdPerson; });
  hold('tTaxi', tryEnterTaxi);
  hold('tAlly', summonAlly);
  hold('tPause', pauseGame);
}
bindTouch();
document.addEventListener('visibilitychange', () => { if (document.hidden && touchMode) pauseGame(); });

function update(dt) {
  time += dt;
  if (touchMode) applyTouchKeys();
  if (driving) updateDriving(dt); else updatePlayer(dt);
  fireCd -= dt;
  if (reloading > 0) {
    reloading -= dt;
    if (reloading <= 0) {
      reloading = 0;
      const w = WEAPONS[cur], take = Math.min(w.mag - mag[cur], reserve[cur]);
      mag[cur] += take; reserve[cur] -= take;
    }
  }
  if (mouseDown && !driving) shoot();
  waveLogic(dt);
  updateObjective(dt);
  for (const e of enemies.slice()) updateEnemy(e, dt);
  for (const a of allies.slice()) updateAlly(a, dt);
  updateBullets(dt);
  updateMisc(dt);
  if (dmgT > 0) dmgT -= dt;
  if (speedT > 0) speedT -= dt;
  if (shieldT > 0) shieldT -= dt;
  if (rapidT > 0) rapidT -= dt;
  vigT = Math.max(0, vigT - dt * 1.2);
  insultT -= dt;
  if (insultT <= 0 && waveState !== 'break') { insultT = rand(7, 12); subtitle(pick(INSULTS)); }
  if (flashLight > 0) { flashLight -= dt; muzzleLight.intensity = 3; muzzleLight.position.copy(muzzlePos()); }
  else muzzleLight.intensity = 0;
  updateHud();
}

/* ===== Bucle principal ===== */
let last = performance.now();
let menuAngle = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  clouds.rotation.y += dt * 0.004;
  if (state === 'play' && !paused) {
    update(dt);
    updateCamera(dt);
    sun.position.set(player.pos.x + 60, 100, player.pos.z + 40);
    sun.target.position.set(player.pos.x, 0, player.pos.z);
  } else if (state === 'menu' || state === 'over') {
    menuAngle += dt * 0.12;
    camera.position.set(Math.cos(menuAngle) * 26, 14, Math.sin(menuAngle) * 26);
    camera.lookAt(0, 3, 0);
    if (camera.fov !== 75) { camera.fov = 75; camera.updateProjectionMatrix(); }
    vm.visible = false; pm.g.visible = false;
    for (const s of smoke) { s.userData.t = (s.userData.t + dt * 0.25) % 1; const k = s.userData.t; s.position.set(-2.2, 1.4 + k * 5, -3.8); s.scale.setScalar(0.6 + k * 2.2); s.material.opacity = 0.45 * (1 - k); }
    sun.position.set(60, 100, 40); sun.target.position.set(0, 0, 0);
  }
  renderer.render(scene, camera);
}
resetGame();
requestAnimationFrame(loop);
})();
