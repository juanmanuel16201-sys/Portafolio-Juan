/* ============================================================
   Ambiente del portafolio — todo el JavaScript "de adorno".
   Contiene: modo claro/oscuro, paisaje con hojas cayendo,
   letras animadas, música de fondo, sonido al hacer clic.

   PARA PONER TU PROPIA MÚSICA:
   1. Copia tu archivo MP3 a la carpeta  audio/
   2. Escribe su ruta aquí abajo, por ejemplo 'audio/fondo.mp3'
   Si lo dejas vacío ('') suena la música creada por código.
   ============================================================ */
(function () {
  'use strict';

  var ARCHIVO_MUSICA = '';           /* ejemplo: 'audio/fondo.mp3' */
  var VOLUMEN_MUSICA = 0.5;          /* 0 a 1 */

  var doc = document;
  var root = doc.documentElement;
  var reducir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /* ----------------------------------------------------------
     1. TEMA: automático (según la hora), claro u oscuro
        Automático: claro de 6:00 a 17:59 y oscuro el resto del día,
        usando la hora del dispositivo y revisándola en vivo.
     ---------------------------------------------------------- */
  var HORA_AMANECER = 6;    /* desde esta hora: modo claro */
  var HORA_ATARDECER = 18;  /* desde esta hora: modo oscuro */

  var btnTema = doc.getElementById('btnTema');
  var panelTema = doc.getElementById('panelTema');
  var infoTema = doc.getElementById('temaInfo');
  var opciones = panelTema ? panelTema.querySelectorAll('[data-tema]') : [];
  var modo = leer('tema');
  if (modo !== 'auto' && modo !== 'light' && modo !== 'dark') { modo = 'auto'; }

  function porHora() {
    var h = new Date().getHours();
    return (h >= HORA_AMANECER && h < HORA_ATARDECER) ? 'light' : 'dark';
  }

  function temaActual() { return modo === 'auto' ? porHora() : modo; }

  function dosDigitos(n) { return (n < 10 ? '0' : '') + n; }

  function pintarTema() {
    var t = temaActual();
    var nombre = t === 'light' ? 'claro' : 'oscuro';
    root.setAttribute('data-bs-theme', t);
    root.setAttribute('data-modo', modo);
    if (btnTema) {
      var etiqueta = modo === 'auto' ? 'Tema: automático, ahora ' + nombre : 'Tema: ' + nombre;
      btnTema.setAttribute('aria-label', etiqueta + '. Cambiar tema');
      btnTema.setAttribute('title', etiqueta);
    }
    Array.prototype.forEach.call(opciones, function (o) {
      o.setAttribute('aria-pressed', o.getAttribute('data-tema') === modo ? 'true' : 'false');
    });
    if (infoTema) {
      var d = new Date();
      infoTema.textContent = modo === 'auto'
        ? 'Son las ' + dosDigitos(d.getHours()) + ':' + dosDigitos(d.getMinutes()) + ': modo ' + nombre + '. Cambia solo a las ' + HORA_AMANECER + ':00 y a las ' + HORA_ATARDECER + ':00.'
        : 'Modo ' + nombre + ' fijo. Elige Automático para que siga la hora.';
    }
  }

  function elegirTema(m) {
    modo = m;
    guardar('tema', m);
    pintarTema();
  }

  function abrirPanel(abrir) {
    if (!panelTema || !btnTema) { return; }
    panelTema.hidden = !abrir;
    btnTema.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    if (abrir) { pintarTema(); }
  }

  pintarTema();

  if (btnTema && panelTema) {
    btnTema.addEventListener('click', function () { abrirPanel(panelTema.hidden); });
    Array.prototype.forEach.call(opciones, function (o) {
      o.addEventListener('click', function () { elegirTema(o.getAttribute('data-tema')); });
    });
    doc.addEventListener('pointerdown', function (e) {
      if (!panelTema.hidden && !panelTema.contains(e.target) && !btnTema.contains(e.target)) { abrirPanel(false); }
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panelTema.hidden) { abrirPanel(false); btnTema.focus(); }
    });
  }

  /* En automático se revisa la hora en vivo */
  window.setInterval(function () {
    if (modo === 'auto' && root.getAttribute('data-bs-theme') !== porHora()) { pintarTema(); }
    else if (panelTema && !panelTema.hidden) { pintarTema(); }
  }, 20000);
  doc.addEventListener('visibilitychange', function () { if (!doc.hidden && modo === 'auto') { pintarTema(); } });

  /* ----------------------------------------------------------
     2. PAISAJE: cielo, sol, montañas, torii, niebla y hierba
     ---------------------------------------------------------- */
  (function paisaje() {
    var p = doc.createElement('div');
    p.className = 'paisaje';
    p.setAttribute('aria-hidden', 'true');
    p.innerHTML =
      '<div class="sol"></div>' +
      '<svg class="montes" viewBox="0 0 1600 400" preserveAspectRatio="none" focusable="false" aria-hidden="true"><path class="m3" d="M0,400 L0,159.6 L40.0,138.7 L80.0,146.2 L120.0,169.7 L160.0,171.1 L200.0,182.0 L240.0,184.5 L280.0,187.7 L320.0,215.2 L360.0,220.7 L400.0,196.5 L440.0,208.8 L480.0,196.9 L520.0,219.1 L560.0,204.2 L600.0,195.9 L640.0,214.1 L680.0,196.7 L720.0,205.8 L760.0,243.2 L800.0,255.0 L840.0,251.1 L880.0,250.6 L920.0,278.8 L960.0,292.0 L1000.0,290.1 L1040.0,303.0 L1080.0,293.2 L1120.0,278.6 L1160.0,265.5 L1200.0,259.7 L1240.0,244.1 L1280.0,228.5 L1320.0,205.7 L1360.0,197.7 L1400.0,195.6 L1440.0,162.6 L1480.0,167.6 L1520.0,164.3 L1560.0,180.7 L1600.0,159.2 L1600,400 Z"/><path class="m2" d="M0,400 L0,281.3 L47.1,274.5 L94.1,276.6 L141.2,272.8 L188.2,275.0 L235.3,289.9 L282.4,298.4 L329.4,293.3 L376.5,313.5 L423.5,323.5 L470.6,317.8 L517.6,331.4 L564.7,325.3 L611.8,327.5 L658.8,316.3 L705.9,312.9 L752.9,290.2 L800.0,270.9 L847.1,262.6 L894.1,246.5 L941.2,238.6 L988.2,244.0 L1035.3,230.4 L1082.4,235.3 L1129.4,244.7 L1176.5,255.1 L1223.5,246.2 L1270.6,257.7 L1317.6,256.1 L1364.7,254.0 L1411.8,255.6 L1458.8,249.4 L1505.9,255.7 L1552.9,246.7 L1600.0,252.9 L1600,400 Z"/></svg>' +
      '<div class="niebla n1"></div><div class="niebla n2"></div>' +
      '<svg class="ciudad c-lejos" viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" focusable="false" aria-hidden="true"><path d="M-10,300 V187 h33 V300 Z M3,187 v-15 h6 v19 Z M25,300 V156 h68 V300 Z M97,300 V100 h40 V300 Z M143,300 V115 h62 V300 Z M208,300 V142 h62 V300 Z M276,300 V117 h31 V300 Z M309,300 V102 h54 V300 Z M367,300 V165 h40 V300 Z M383,165 v-10 h8 v15 Z M409,300 V176 h41 V300 Z M452,300 V164 h62 V300 Z M517,300 V76 h56 V300 Z M579,300 V120 h53 V300 Z M638,300 V169 h58 V300 Z M699,300 V75 h59 V300 Z M723,75 v-18 h11 v25 Z M762,300 V120 h62 V300 Z M827,300 V121 h59 V300 Z M890,300 V86 h59 V300 Z M951,300 V142 h40 V300 Z M994,300 V133 h49 V300 Z M1048,300 V78 h62 V300 Z M1114,300 V106 h67 V300 Z M1141,106 v-16 h13 v25 Z M1185,300 V191 h53 V300 Z M1240,300 V162 h30 V300 Z M1270,300 V198 h33 V300 Z M1283,198 v-17 h6 v13 Z M1309,300 V176 h63 V300 Z M1373,300 V195 h43 V300 Z M1421,300 V196 h32 V300 Z M1454,300 V204 h45 V300 Z M1472,204 v-12 h9 v10 Z M1499,300 V115 h31 V300 Z M1511,115 v-15 h6 v15 Z M1534,300 V112 h30 V300 Z M1570,300 V172 h45 V300 Z M1615,300 V182 h52 V300 Z M1636,182 v-25 h10 v10 Z "/></svg><svg class="ciudad c-cerca" viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" focusable="false" aria-hidden="true"><path class="edif" d="M-10,300 V172 h55 V300 Z M46,300 V172 h36 V300 Z M83,300 V229 h44 V300 Z M133,300 V166 h36 V300 Z M170,300 V145 h49 V300 Z M223,300 V138 h48 V300 Z M277,300 V216 h31 V300 Z M289,216 v-26 h6 v24 Z M310,300 V155 h39 V300 Z M349,300 V228 h46 V300 Z M401,300 V182 h48 V300 Z M421,182 v-16 h9 v11 Z M455,300 V243 h32 V300 Z M493,300 V196 h46 V300 Z M541,300 V149 h30 V300 Z M577,300 V131 h46 V300 Z M624,300 V242 h49 V300 Z M644,242 v-16 h9 v18 Z M673,300 V131 h49 V300 Z M725,300 V224 h62 V300 Z M750,224 v-15 h12 v25 Z M792,300 V236 h51 V300 Z M846,300 V136 h38 V300 Z M890,300 V222 h54 V300 Z M912,222 v-21 h10 v18 Z M947,300 V156 h64 V300 Z M973,156 v-18 h12 v27 Z M1012,300 V167 h35 V300 Z M1053,300 V226 h50 V300 Z M1073,226 v-22 h10 v16 Z M1104,300 V215 h55 V300 Z M1126,215 v-22 h11 v28 Z M1163,300 V162 h44 V300 Z M1213,300 V209 h33 V300 Z M1249,300 V244 h63 V300 Z M1274,244 v-17 h12 v13 Z M1318,300 V164 h37 V300 Z M1361,300 V215 h54 V300 Z M1420,300 V195 h51 V300 Z M1476,300 V210 h63 V300 Z M1541,300 V162 h61 V300 Z M1565,162 v-18 h12 v12 Z M1604,300 V224 h27 V300 Z "/><path class="w1" d="M-6,233 h4 v5 h-4 Z M-6,277 h4 v5 h-4 Z M3,244 h4 v5 h-4 Z M12,178 h4 v5 h-4 Z M12,189 h4 v5 h-4 Z M12,233 h4 v5 h-4 Z M12,255 h4 v5 h-4 Z M21,200 h4 v5 h-4 Z M21,222 h4 v5 h-4 Z M30,233 h4 v5 h-4 Z M50,266 h4 v5 h-4 Z M59,211 h4 v5 h-4 Z M59,222 h4 v5 h-4 Z M59,277 h4 v5 h-4 Z M87,279 h4 v5 h-4 Z M96,235 h4 v5 h-4 Z M114,246 h4 v5 h-4 Z M137,205 h4 v5 h-4 Z M137,249 h4 v5 h-4 Z M137,260 h4 v5 h-4 Z M146,172 h4 v5 h-4 Z M174,184 h4 v5 h-4 Z M174,217 h4 v5 h-4 Z M174,239 h4 v5 h-4 Z M183,151 h4 v5 h-4 Z M183,195 h4 v5 h-4 Z M183,261 h4 v5 h-4 Z M183,283 h4 v5 h-4 Z M192,173 h4 v5 h-4 Z M192,206 h4 v5 h-4 Z M201,184 h4 v5 h-4 Z M201,195 h4 v5 h-4 Z M201,261 h4 v5 h-4 Z M227,155 h4 v5 h-4 Z M227,210 h4 v5 h-4 Z M245,177 h4 v5 h-4 Z M245,199 h4 v5 h-4 Z M245,210 h4 v5 h-4 Z M254,243 h4 v5 h-4 Z M281,244 h4 v5 h-4 Z M281,277 h4 v5 h-4 Z M314,172 h4 v5 h-4 Z M323,216 h4 v5 h-4 Z M332,183 h4 v5 h-4 Z M332,238 h4 v5 h-4 Z M332,249 h4 v5 h-4 Z M371,245 h4 v5 h-4 Z M405,243 h4 v5 h-4 Z M414,243 h4 v5 h-4 Z M423,210 h4 v5 h-4 Z M423,232 h4 v5 h-4 Z M459,271 h4 v5 h-4 Z M497,213 h4 v5 h-4 Z M506,213 h4 v5 h-4 Z M515,224 h4 v5 h-4 Z M545,232 h4 v5 h-4 Z M554,155 h4 v5 h-4 Z M581,192 h4 v5 h-4 Z M581,236 h4 v5 h-4 Z M590,192 h4 v5 h-4 Z M590,236 h4 v5 h-4 Z M599,214 h4 v5 h-4 Z M599,236 h4 v5 h-4 Z M608,148 h4 v5 h-4 Z M608,192 h4 v5 h-4 Z M608,236 h4 v5 h-4 Z M655,259 h4 v5 h-4 Z M677,247 h4 v5 h-4 Z M677,258 h4 v5 h-4 Z M677,269 h4 v5 h-4 Z M686,137 h4 v5 h-4 Z M686,247 h4 v5 h-4 Z M686,258 h4 v5 h-4 Z M695,203 h4 v5 h-4 Z M704,181 h4 v5 h-4 Z M729,230 h4 v5 h-4 Z M729,241 h4 v5 h-4 Z M729,252 h4 v5 h-4 Z M729,263 h4 v5 h-4 Z M765,252 h4 v5 h-4 Z M774,274 h4 v5 h-4 Z M796,264 h4 v5 h-4 Z M796,275 h4 v5 h-4 Z M823,264 h4 v5 h-4 Z M823,275 h4 v5 h-4 Z M850,186 h4 v5 h-4 Z M859,142 h4 v5 h-4 Z M859,186 h4 v5 h-4 Z M859,285 h4 v5 h-4 Z M868,142 h4 v5 h-4 Z M868,252 h4 v5 h-4 Z M894,239 h4 v5 h-4 Z M894,283 h4 v5 h-4 Z M921,228 h4 v5 h-4 Z M921,272 h4 v5 h-4 Z M951,184 h4 v5 h-4 Z M951,195 h4 v5 h-4 Z M951,261 h4 v5 h-4 Z M951,283 h4 v5 h-4 Z M960,217 h4 v5 h-4 Z M960,228 h4 v5 h-4 Z M960,261 h4 v5 h-4 Z M969,162 h4 v5 h-4 Z M969,195 h4 v5 h-4 Z M978,195 h4 v5 h-4 Z M978,239 h4 v5 h-4 Z M978,283 h4 v5 h-4 Z M987,195 h4 v5 h-4 Z M987,206 h4 v5 h-4 Z M987,272 h4 v5 h-4 Z M1016,239 h4 v5 h-4 Z M1034,195 h4 v5 h-4 Z M1034,217 h4 v5 h-4 Z M1108,265 h4 v5 h-4 Z M1108,276 h4 v5 h-4 Z M1117,265 h4 v5 h-4 Z M1135,221 h4 v5 h-4 Z M1167,168 h4 v5 h-4 Z M1176,168 h4 v5 h-4 Z M1185,234 h4 v5 h-4 Z M1185,245 h4 v5 h-4 Z M1194,168 h4 v5 h-4 Z M1194,190 h4 v5 h-4 Z M1194,201 h4 v5 h-4 Z M1217,226 h4 v5 h-4 Z M1217,248 h4 v5 h-4 Z M1262,261 h4 v5 h-4 Z M1271,261 h4 v5 h-4 Z M1322,236 h4 v5 h-4 Z M1322,269 h4 v5 h-4 Z M1331,225 h4 v5 h-4 Z M1340,181 h4 v5 h-4 Z M1340,258 h4 v5 h-4 Z M1340,269 h4 v5 h-4 Z M1374,254 h4 v5 h-4 Z M1424,223 h4 v5 h-4 Z M1433,201 h4 v5 h-4 Z M1433,234 h4 v5 h-4 Z M1433,256 h4 v5 h-4 Z M1442,201 h4 v5 h-4 Z M1442,212 h4 v5 h-4 Z M1480,249 h4 v5 h-4 Z M1480,271 h4 v5 h-4 Z M1480,282 h4 v5 h-4 Z M1489,238 h4 v5 h-4 Z M1525,238 h4 v5 h-4 Z M1525,249 h4 v5 h-4 Z M1554,278 h4 v5 h-4 Z M1563,212 h4 v5 h-4 Z M1572,278 h4 v5 h-4 Z M1590,267 h4 v5 h-4 Z M1617,230 h4 v5 h-4 Z M1617,285 h4 v5 h-4 Z "/><path class="w2" d="M-6,189 h4 v5 h-4 Z M-6,211 h4 v5 h-4 Z M3,178 h4 v5 h-4 Z M12,277 h4 v5 h-4 Z M21,178 h4 v5 h-4 Z M21,211 h4 v5 h-4 Z M30,178 h4 v5 h-4 Z M30,189 h4 v5 h-4 Z M30,211 h4 v5 h-4 Z M30,266 h4 v5 h-4 Z M68,233 h4 v5 h-4 Z M68,244 h4 v5 h-4 Z M96,279 h4 v5 h-4 Z M114,257 h4 v5 h-4 Z M137,227 h4 v5 h-4 Z M137,238 h4 v5 h-4 Z M146,282 h4 v5 h-4 Z M155,216 h4 v5 h-4 Z M155,260 h4 v5 h-4 Z M174,173 h4 v5 h-4 Z M183,272 h4 v5 h-4 Z M192,151 h4 v5 h-4 Z M227,232 h4 v5 h-4 Z M227,243 h4 v5 h-4 Z M227,265 h4 v5 h-4 Z M236,199 h4 v5 h-4 Z M236,221 h4 v5 h-4 Z M245,144 h4 v5 h-4 Z M254,144 h4 v5 h-4 Z M254,199 h4 v5 h-4 Z M254,232 h4 v5 h-4 Z M323,260 h4 v5 h-4 Z M405,232 h4 v5 h-4 Z M405,254 h4 v5 h-4 Z M414,221 h4 v5 h-4 Z M423,243 h4 v5 h-4 Z M423,276 h4 v5 h-4 Z M432,221 h4 v5 h-4 Z M468,282 h4 v5 h-4 Z M497,224 h4 v5 h-4 Z M497,268 h4 v5 h-4 Z M506,224 h4 v5 h-4 Z M506,268 h4 v5 h-4 Z M524,235 h4 v5 h-4 Z M524,268 h4 v5 h-4 Z M545,177 h4 v5 h-4 Z M581,159 h4 v5 h-4 Z M581,280 h4 v5 h-4 Z M590,181 h4 v5 h-4 Z M590,214 h4 v5 h-4 Z M590,247 h4 v5 h-4 Z M599,181 h4 v5 h-4 Z M608,280 h4 v5 h-4 Z M628,281 h4 v5 h-4 Z M637,259 h4 v5 h-4 Z M655,270 h4 v5 h-4 Z M655,281 h4 v5 h-4 Z M677,170 h4 v5 h-4 Z M686,170 h4 v5 h-4 Z M686,280 h4 v5 h-4 Z M704,137 h4 v5 h-4 Z M704,192 h4 v5 h-4 Z M738,230 h4 v5 h-4 Z M738,252 h4 v5 h-4 Z M796,242 h4 v5 h-4 Z M969,283 h4 v5 h-4 Z M978,250 h4 v5 h-4 Z M987,217 h4 v5 h-4 Z M996,272 h4 v5 h-4 Z M1016,206 h4 v5 h-4 Z M1025,250 h4 v5 h-4 Z M1025,283 h4 v5 h-4 Z M1034,173 h4 v5 h-4 Z M1108,221 h4 v5 h-4 Z M1108,243 h4 v5 h-4 Z M1108,254 h4 v5 h-4 Z M1176,179 h4 v5 h-4 Z M1185,223 h4 v5 h-4 Z M1226,215 h4 v5 h-4 Z M1226,226 h4 v5 h-4 Z M1226,259 h4 v5 h-4 Z M1262,250 h4 v5 h-4 Z M1271,283 h4 v5 h-4 Z M1289,250 h4 v5 h-4 Z M1289,261 h4 v5 h-4 Z M1322,214 h4 v5 h-4 Z M1340,236 h4 v5 h-4 Z M1365,254 h4 v5 h-4 Z M1374,232 h4 v5 h-4 Z M1392,254 h4 v5 h-4 Z M1401,265 h4 v5 h-4 Z M1424,245 h4 v5 h-4 Z M1424,267 h4 v5 h-4 Z M1424,278 h4 v5 h-4 Z M1433,212 h4 v5 h-4 Z M1433,223 h4 v5 h-4 Z M1451,223 h4 v5 h-4 Z M1480,227 h4 v5 h-4 Z M1480,238 h4 v5 h-4 Z M1489,260 h4 v5 h-4 Z M1554,212 h4 v5 h-4 Z M1581,168 h4 v5 h-4 Z M1608,263 h4 v5 h-4 Z "/><path class="w3" d="M-6,178 h4 v5 h-4 Z M12,211 h4 v5 h-4 Z M50,244 h4 v5 h-4 Z M87,246 h4 v5 h-4 Z M146,216 h4 v5 h-4 Z M183,217 h4 v5 h-4 Z M183,250 h4 v5 h-4 Z M192,162 h4 v5 h-4 Z M201,228 h4 v5 h-4 Z M314,260 h4 v5 h-4 Z M332,216 h4 v5 h-4 Z M371,234 h4 v5 h-4 Z M405,221 h4 v5 h-4 Z M414,232 h4 v5 h-4 Z M414,254 h4 v5 h-4 Z M468,249 h4 v5 h-4 Z M545,254 h4 v5 h-4 Z M554,243 h4 v5 h-4 Z M599,192 h4 v5 h-4 Z M686,181 h4 v5 h-4 Z M686,236 h4 v5 h-4 Z M704,269 h4 v5 h-4 Z M747,263 h4 v5 h-4 Z M765,285 h4 v5 h-4 Z M774,252 h4 v5 h-4 Z M894,250 h4 v5 h-4 Z M912,272 h4 v5 h-4 Z M930,250 h4 v5 h-4 Z M960,195 h4 v5 h-4 Z M969,173 h4 v5 h-4 Z M978,228 h4 v5 h-4 Z M987,261 h4 v5 h-4 Z M1016,184 h4 v5 h-4 Z M1016,217 h4 v5 h-4 Z M1057,254 h4 v5 h-4 Z M1176,190 h4 v5 h-4 Z M1176,223 h4 v5 h-4 Z M1185,179 h4 v5 h-4 Z M1194,234 h4 v5 h-4 Z M1194,267 h4 v5 h-4 Z M1322,181 h4 v5 h-4 Z M1322,225 h4 v5 h-4 Z M1322,258 h4 v5 h-4 Z M1331,269 h4 v5 h-4 Z M1365,243 h4 v5 h-4 Z M1365,276 h4 v5 h-4 Z M1392,221 h4 v5 h-4 Z M1401,221 h4 v5 h-4 Z M1451,267 h4 v5 h-4 Z M1460,245 h4 v5 h-4 Z M1489,216 h4 v5 h-4 Z M1545,201 h4 v5 h-4 Z M1545,278 h4 v5 h-4 Z M1563,234 h4 v5 h-4 Z M1563,267 h4 v5 h-4 Z "/><g class="carteles"><path class="s1" d="M543,204 h5 v39 h-5 Z M1537,180 h5 v42 h-5 Z M377,206 h5 v32 h-5 Z M100,175 h5 v42 h-5 Z M652,162 h5 v55 h-5 Z M180,177 h5 v37 h-5 Z M1159,193 h5 v41 h-5 Z "/><path class="s2" d="M413,148 h17 v4 h-20 Z M499,140 h30 v4 h-16 Z M1372,149 h20 v4 h-28 Z M616,188 h18 v4 h-20 Z M653,160 h29 v4 h-27 Z M822,195 h29 v4 h-25 Z "/></g></svg>' +
      '<svg class="torii" viewBox="0 0 120 110" focusable="false" aria-hidden="true"><path d="M4,22 Q60,6 116,22 L112,32 Q60,18 8,32 Z"/><rect x="14" y="36" width="92" height="7"/><rect x="26" y="30" width="9" height="80"/><rect x="85" y="30" width="9" height="80"/><rect x="55" y="25" width="10" height="14"/></svg>' +
      '<div class="rejilla"></div>';
    doc.body.insertBefore(p, doc.body.firstChild);
  }());

  /* ----------------------------------------------------------
     3. HOJAS CAYENDO (canvas) — arces rojos y ginkgos dorados
     ---------------------------------------------------------- */
  (function hojas() {
    if (reducir) { return; }
    var c = doc.createElement('canvas');
    c.className = 'hojas';
    c.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(c);
    var g = c.getContext('2d');
    if (!g || typeof Path2D === 'undefined') { return; }

    var arce = new Path2D('M0,-10 L2,-5 L7,-7 L5,-2 L10,0 L4,2 L5,8 L0,5 L-5,8 L-4,2 L-10,0 L-5,-2 L-7,-7 L-2,-5 Z');
    var ginkgo = new Path2D('M0,7 L-8,-5 Q0,-12 8,-5 Z');
    var colores = ['#ff2e6e', '#ff4d2e', '#ff9a1f', '#ffd400', '#e8283c', '#ff3df0', '#8a5cff', '#19f0ff'];
    var W = 0, H = 0, dpr = 1, lista = [];

    function aleatorio(a, b) { return a + Math.random() * (b - a); }

    function nueva(inicial) {
      var desdeArriba = inicial || Math.random() < 0.55;
      return {
        x: desdeArriba ? aleatorio(-0.1 * W, W) : -20,
        y: desdeArriba ? (inicial ? aleatorio(-20, H) : -20) : aleatorio(-20, H * 0.6),
        s: aleatorio(0.55, 1.45),
        vy: aleatorio(22, 52),
        vr: aleatorio(-1.6, 1.6),
        r: aleatorio(0, 6.28),
        fase: aleatorio(0, 6.28),
        vf: aleatorio(1.2, 3.2),
        sw: aleatorio(0, 6.28),
        col: colores[Math.floor(Math.random() * colores.length)],
        tipo: Math.random() < 0.78 ? 0 : 1
      };
    }

    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(34, Math.max(12, W / 46)));
      while (lista.length < n) { lista.push(nueva(true)); }
      lista.length = n;
    }

    var rafaga = 0, proxima = 6000, t0 = performance.now(), ultimo = t0;

    function cuadro(ahora) {
      var dt = Math.min((ahora - ultimo) / 1000, 0.05);
      ultimo = ahora;
      var t = (ahora - t0) / 1000;
      if (ahora - t0 > proxima) { rafaga = 95; proxima = ahora - t0 + aleatorio(9000, 16000); }
      rafaga *= Math.pow(0.5, dt / 2.2);
      var viento = 38 + 26 * Math.sin(t * 0.31) + 18 * Math.sin(t * 0.73 + 2) + rafaga;

      g.clearRect(0, 0, W, H);
      g.globalAlpha = 0.92;
      for (var i = 0; i < lista.length; i++) {
        var l = lista[i];
        l.x += (viento * (0.55 + l.s * 0.45) + Math.sin(l.sw + t * 1.3) * 16) * dt;
        l.y += (l.vy * l.s + Math.sin(l.sw * 2 + t * 0.9) * 8) * dt;
        l.r += l.vr * dt * (0.6 + viento / 80);
        l.fase += l.vf * dt;
        if (l.y > H + 24 || l.x > W + 30) { lista[i] = l = nueva(false); }
        g.save();
        g.translate(l.x, l.y);
        g.rotate(l.r);
        g.scale(l.s * 1.1, l.s * 1.1 * Math.cos(l.fase));
        g.fillStyle = l.col;
        g.fill(l.tipo === 0 ? arce : ginkgo);
        g.restore();
      }
      window.requestAnimationFrame(cuadro);
    }

    medir();
    window.addEventListener('resize', medir);
    window.requestAnimationFrame(cuadro);
  }());

  /* ----------------------------------------------------------
     4. LETRAS ANIMADAS en títulos (h1 y h2)
     ---------------------------------------------------------- */
  (function letras() {
    if (reducir) { return; }
    var titulos = doc.querySelectorAll('h1, h2');
    var n;

    function partir(nodo) {
      Array.prototype.slice.call(nodo.childNodes).forEach(function (h) {
        if (h.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          h.textContent.split(/(\s+)/).forEach(function (tok) {
            if (!tok) { return; }
            if (/^\s+$/.test(tok)) { frag.appendChild(doc.createTextNode(' ')); return; }
            var w = doc.createElement('span');
            w.className = 'palabra';
            w.setAttribute('aria-hidden', 'true');
            Array.from(tok).forEach(function (ch) {
              var s = doc.createElement('span');
              s.className = 'letra';
              s.textContent = ch;
              s.style.setProperty('--i', Math.min(n++, 34));
              w.appendChild(s);
            });
            frag.appendChild(w);
          });
          h.replaceWith(frag);
        } else if (h.nodeType === 1) {
          partir(h);
        }
      });
    }

    var visibles = [];
    titulos.forEach(function (t) {
      if (t.id) { return; }
      var texto = t.textContent.replace(/\s+/g, ' ').trim();
      if (!texto) { return; }
      t.setAttribute('aria-label', texto);
      n = 0;
      partir(t);
      t.classList.add('anim-letras');
      visibles.push(t);
    });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); }
        });
      }, { threshold: 0.2 });
      visibles.forEach(function (t) { io.observe(t); });
    } else {
      visibles.forEach(function (t) { t.classList.add('visto'); });
    }
    window.setTimeout(function () { visibles.forEach(function (t) { t.classList.add('visto'); }); }, 4000);
  }());

  /* ----------------------------------------------------------
     5. APARICIÓN DE TARJETAS AL HACER SCROLL
     ---------------------------------------------------------- */
  (function aparecer() {
    if (reducir || !('IntersectionObserver' in window)) { return; }
    var items = doc.querySelectorAll('.card');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    items.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
    window.setTimeout(function () { items.forEach(function (el) { el.classList.add('visto'); }); }, 3500);
  }());

  /* ----------------------------------------------------------
     6. ONDA AL HACER CLIC en botones
     ---------------------------------------------------------- */
  doc.addEventListener('pointerdown', function (e) {
    if (reducir) { return; }
    var b = e.target.closest ? e.target.closest('.btn, .tool-btn') : null;
    if (!b) { return; }
    var r = b.getBoundingClientRect();
    var o = doc.createElement('span');
    o.className = 'onda';
    o.style.left = (e.clientX - r.left) + 'px';
    o.style.top = (e.clientY - r.top) + 'px';
    b.appendChild(o);
    window.setTimeout(function () { if (o.parentNode) { o.parentNode.removeChild(o); } }, 650);
  });

  /* ----------------------------------------------------------
     7. SONIDO: música de fondo + clics
     ---------------------------------------------------------- */
  var btnSonido = doc.getElementById('btnMusica');
  var activo = leer('sonido') !== 'off';       /* por defecto: activado */
  var fase = 'select';                         /* fase de la consola (solo en Juegos) */
  var ctx = null, master, bus, fx, conv, wet;
  var iniciado = false, sonando = false, temporizador = 0, ocultoTab = doc.hidden;
  var elMp3 = null;
  var ESCALA = [0, 2, 3, 7, 8];                /* escala japonesa (hirajoshi) desde Re */
  var RAIZ = 146.83;
  var cache = {};

  function etiquetaSonido() {
    if (!btnSonido) { return; }
    btnSonido.classList.toggle('silenciado', !activo);
    btnSonido.setAttribute('aria-label', activo ? 'Silenciar música y sonidos' : 'Activar música y sonidos');
    btnSonido.setAttribute('title', activo ? 'Silenciar' : 'Activar sonido');
    btnSonido.setAttribute('aria-pressed', activo ? 'true' : 'false');
  }

  function crearContexto() {
    if (ctx) { return true; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { return false; }
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    var comp = ctx.createDynamicsCompressor();
    master.connect(comp);
    comp.connect(ctx.destination);

    /* eco de sala: ruido que se apaga */
    var largo = Math.floor(ctx.sampleRate * 3.2);
    var imp = ctx.createBuffer(2, largo, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = imp.getChannelData(ch);
      for (var i = 0; i < largo; i++) { d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / largo, 2.6); }
    }
    conv = ctx.createConvolver();
    conv.buffer = imp;
    wet = ctx.createGain();
    wet.gain.value = 0.55;
    conv.connect(wet);
    wet.connect(master);

    bus = ctx.createGain();            /* música */
    bus.gain.value = 0;
    bus.connect(master);
    bus.connect(conv);

    fx = ctx.createGain();             /* clics */
    fx.gain.value = 0.7;
    fx.connect(master);
    fx.connect(conv);
    return true;
  }

  /* Cuerda pulsada (Karplus-Strong): suena como un koto */
  function cuerda(freq, dur) {
    var clave = freq.toFixed(1) + '_' + dur;
    if (cache[clave]) { return cache[clave]; }
    var sr = ctx.sampleRate, N = Math.floor(sr * dur);
    var buf = ctx.createBuffer(1, N, sr);
    var d = buf.getChannelData(0);
    var p = Math.max(2, Math.round(sr / freq));
    var x = 0;
    for (var i = 0; i < p; i++) { x = 0.55 * x + 0.45 * (Math.random() * 2 - 1); d[i] = x * 1.6; }
    for (var j = p + 1; j < N; j++) { d[j] = 0.9972 * 0.5 * (d[j - p] + d[j - p - 1]); }
    var fade = Math.floor(sr * 0.25);
    for (var k = 0; k < fade; k++) { d[N - 1 - k] *= k / fade; }
    var claves = Object.keys(cache);
    if (claves.length > 48) { delete cache[claves[0]]; }
    cache[clave] = buf;
    return buf;
  }

  function nota(freq, cuando, vel, destino, dur) {
    var src = ctx.createBufferSource();
    src.buffer = cuerda(freq, dur || 2.4);
    var gn = ctx.createGain();
    gn.gain.value = vel;
    var nodo = gn;
    if (ctx.createStereoPanner) {
      var pan = ctx.createStereoPanner();
      pan.pan.value = Math.random() * 1.2 - 0.6;
      gn.connect(pan);
      nodo = pan;
    }
    src.connect(gn);
    nodo.connect(destino);
    src.start(cuando);
  }

  function frecuencia(idx) {
    var oct = Math.floor(idx / ESCALA.length);
    var s = ESCALA[idx % ESCALA.length] + 12 * oct;
    return RAIZ * Math.pow(2, s / 12);
  }

  var ultimoIdx = 5;
  function frase() {
    if (!sonando || !ctx) { return; }
    var cuantas = 1 + Math.floor(Math.random() * 4);
    var t = ctx.currentTime + 0.05;
    for (var i = 0; i < cuantas; i++) {
      ultimoIdx = Math.max(0, Math.min(12, ultimoIdx + Math.floor(Math.random() * 5) - 2));
      nota(frecuencia(ultimoIdx), t, 0.32 + Math.random() * 0.2, bus, 2.6);
      t += 0.32 + Math.random() * 0.55;
    }
    if (Math.random() < 0.2) { tambor(ctx.currentTime + 0.1); }
    temporizador = window.setTimeout(frase, 2200 + Math.random() * 3600);
  }

  function tambor(cuando) {
    var o = ctx.createOscillator();
    var gn = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(95, cuando);
    o.frequency.exponentialRampToValueAtTime(42, cuando + 0.45);
    gn.gain.setValueAtTime(0.0001, cuando);
    gn.gain.exponentialRampToValueAtTime(0.5, cuando + 0.02);
    gn.gain.exponentialRampToValueAtTime(0.0001, cuando + 0.9);
    o.connect(gn);
    gn.connect(bus);
    o.start(cuando);
    o.stop(cuando + 1);
  }

  var fondoListo = false;
  function construirFondo() {
    if (fondoListo) { return; }
    fondoListo = true;
    /* zumbido grave que "respira" */
    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 420;
    var dg = ctx.createGain();
    dg.gain.value = 0.05;
    lp.connect(dg);
    dg.connect(bus);
    [[73.4, 'triangle', 0], [110, 'sine', 3], [146.8, 'sine', -4]].forEach(function (v) {
      var o = ctx.createOscillator();
      o.type = v[1];
      o.frequency.value = v[0];
      o.detune.value = v[2];
      o.connect(lp);
      o.start();
    });
    var lfo = ctx.createOscillator();
    var lg = ctx.createGain();
    lfo.frequency.value = 0.07;
    lg.gain.value = 0.025;
    lfo.connect(lg);
    lg.connect(dg.gain);
    lfo.start();

    /* viento */
    var largo = ctx.sampleRate * 4;
    var rb = ctx.createBuffer(1, largo, ctx.sampleRate);
    var rd = rb.getChannelData(0);
    for (var i = 0; i < largo; i++) { rd[i] = Math.random() * 2 - 1; }
    var ns = ctx.createBufferSource();
    ns.buffer = rb;
    ns.loop = true;
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 520;
    bp.Q.value = 0.7;
    var vg = ctx.createGain();
    vg.gain.value = 0.035;
    ns.connect(bp);
    bp.connect(vg);
    vg.connect(bus);
    ns.start();
    var l2 = ctx.createOscillator();
    var l2g = ctx.createGain();
    l2.frequency.value = 0.11;
    l2g.gain.value = 0.03;
    l2.connect(l2g);
    l2g.connect(vg.gain);
    l2.start();
    var l3 = ctx.createOscillator();
    var l3g = ctx.createGain();
    l3.frequency.value = 0.05;
    l3g.gain.value = 260;
    l3.connect(l3g);
    l3g.connect(bp.frequency);
    l3.start();
  }

  /* Nivel que debe tener la música ahora mismo */
  function nivel() {
    if (!activo || ocultoTab || fase === 'play') { return 0; }
    if (fase !== 'select') { return 0.35; }
    return 1;
  }

  function aplicarNivel() {
    var n = nivel();
    if (elMp3) {
      if (n > 0 && elMp3.paused) { var pr = elMp3.play(); if (pr && pr.catch) { pr.catch(function () {}); } }
      elMp3.volume = Math.min(1, n * VOLUMEN_MUSICA);
      if (n === 0) { elMp3.pause(); }
      return;
    }
    if (!ctx) { return; }
    if (n > 0) {
      if (ctx.state === 'suspended') { ctx.resume(); }
      bus.gain.setTargetAtTime(n * VOLUMEN_MUSICA, ctx.currentTime, 1.1);
      if (!sonando) { sonando = true; window.clearTimeout(temporizador); temporizador = window.setTimeout(frase, 700); }
    } else {
      bus.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      sonando = false;
      window.clearTimeout(temporizador);
      window.setTimeout(function () { if (nivel() === 0 && ctx.state === 'running') { ctx.suspend(); } }, 1400);
    }
  }

  function iniciar() {
    if (iniciado) { return; }
    iniciado = true;
    if (ARCHIVO_MUSICA) {
      elMp3 = new Audio(ARCHIVO_MUSICA);
      elMp3.loop = true;
      elMp3.volume = 0;
    }
    if (crearContexto()) { construirFondo(); }
    aplicarNivel();
  }

  /* Sonido corto al hacer clic: una nota alta de koto */
  function clic(fuerte) {
    if (!activo || !ctx || ctx.state !== 'running') { return; }
    var idx = 5 + Math.floor(Math.random() * 5);
    nota(frecuencia(idx), ctx.currentTime, fuerte ? 0.5 : 0.32, fx, 0.7);
  }

  function alternarSonido() {
    activo = !activo;
    guardar('sonido', activo ? 'on' : 'off');
    etiquetaSonido();
    if (activo) {
      iniciar();
      if (ctx && ctx.state === 'suspended') { ctx.resume(); }
      aplicarNivel();
      window.setTimeout(function () { clic(true); }, 120);
    } else {
      aplicarNivel();
    }
  }

  etiquetaSonido();
  if (btnSonido) { btnSonido.addEventListener('click', alternarSonido); }

  /* El navegador solo deja sonar tras un gesto: arrancamos en el primer toque */
  function primerGesto() {
    doc.removeEventListener('pointerdown', primerGesto, true);
    doc.removeEventListener('keydown', primerGesto, true);
    if (activo) { iniciar(); }
  }
  doc.addEventListener('pointerdown', primerGesto, true);
  doc.addEventListener('keydown', primerGesto, true);

  /* Sonido en botones, enlaces e iconos (la consola de Juegos trae los suyos) */
  doc.addEventListener('pointerdown', function (e) {
    var el = e.target.closest ? e.target.closest('a[href], button, .btn, summary, label, input[type="checkbox"], input[type="submit"]') : null;
    if (!el || el === btnSonido || el.closest('.stage')) { return; }
    window.setTimeout(function () { clic(false); }, 0);
  });

  /* Pausar cuando la pestaña no se ve */
  doc.addEventListener('visibilitychange', function () {
    ocultoTab = doc.hidden;
    aplicarNivel();
  });

  /* En Juegos: bajar la música durante la secuencia y callarla al jugar */
  var stage = doc.getElementById('stage');
  if (stage && 'MutationObserver' in window) {
    fase = stage.getAttribute('data-phase') || 'select';
    new MutationObserver(function () {
      fase = stage.getAttribute('data-phase') || 'select';
      aplicarNivel();
    }).observe(stage, { attributes: true, attributeFilter: ['data-phase'] });
  }
}());
