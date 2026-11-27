/* ============================================================
   EXPERIENCIA DE REALIDAD AUMENTADA (A-Frame)
   - Showroom publicitario del lightstick AURA (producto de demostración).
   - La cámara del dispositivo se muestra detrás de la escena 3D.
   - Interacción con cursor virtual: componentes "cursor" + "raycaster".
   - Las métricas se guardan con Almacen.contar() (localStorage).

   CÓMO EDITAR:
   - plantilla():   el producto, los botones 3D y los textos.
   - COLORES:       nombres y valores de los colores del producto.
   ============================================================ */
(function () {
  'use strict';

  var URL_AFRAME = 'https://aframe.io/releases/1.5.0/aframe.min.js';
  var COLORES = {
    rosa: '#ff3fa4',
    cian: '#25e8ff',
    verde: '#5cff7a',
    dorado: '#ffc93c',
    violeta: '#a56bff'
  };

  var estado = { color: 'rosa', gira: true, luz: true, info: false, mirada: false, listo: false, flujo: null };

  function $(id) { return document.getElementById(id); }

  var escenaCont = $('arEscena');
  var video = $('arVideo');
  var aviso = $('arEstado');
  if (!escenaCont || !video || !aviso) { return; }

  function decir(texto) { aviso.textContent = texto; }
  function contar(ruta) { if (window.Almacen) { window.Almacen.contar(ruta); } }

  /* ---------- 1. Carga perezosa de A-Frame ---------- */
  function cargarAFrame() {
    return new Promise(function (resolver, rechazar) {
      if (window.AFRAME) { resolver(); return; }
      var s = document.createElement('script');
      s.src = URL_AFRAME;
      s.onload = function () { resolver(); };
      s.onerror = function () { rechazar(new Error('No se pudo descargar A-Frame')); };
      document.head.appendChild(s);
    });
  }

  /* ---------- 2. Plantilla de la escena (HTML de A-Frame) ---------- */
  function boton3D(id, texto, x, y, z, ancho) {
    return '<a-entity id="' + id + '" class="interactivo" position="' + x + ' ' + y + ' ' + z + '">' +
      '<a-box width="' + ancho + '" height="0.24" depth="0.06" material="color: #2a1750; metalness: 0.3; roughness: 0.4"></a-box>' +
      '<a-text value="' + texto + '" align="center" width="1.6" position="0 0 0.04" color="#ffffff"></a-text>' +
      '</a-entity>';
  }

  function plantilla() {
    var swatches = '';
    Object.keys(COLORES).forEach(function (nombre, i) {
      swatches += '<a-sphere class="interactivo swatch" data-color="' + nombre + '" radius="0.11" ' +
        'position="1.25 ' + (1.9 - i * 0.3) + ' 0" material="color: ' + COLORES[nombre] + '; emissive: ' + COLORES[nombre] + '; emissiveIntensity: 0.6"></a-sphere>';
    });

    return '' +
      '<a-scene embedded background="transparent: true" renderer="alpha: true; antialias: true; powerPreference: high-performance" ' +
      'vr-mode-ui="enabled: false" loading-screen="enabled: false" device-orientation-permission-ui="enabled: true" ' +
      'cursor="rayOrigin: mouse; fuse: false" raycaster="objects: .interactivo; far: 12">' +

      '<a-entity id="camara" camera="fov: 55" look-controls="touchEnabled: true; magicWindowTrackingEnabled: true" position="0 1 3.1">' +
        '<a-ring id="reticula" visible="false" position="0 0 -1" radius-inner="0.012" radius-outer="0.02" material="color: #ffffff; shader: flat; opacity: 0.9"' +
        ' animation__fuse="property: scale; from: 1 1 1; to: 0.4 0.4 0.4; dur: 1400; startEvents: fusing; easing: linear"' +
        ' animation__fin="property: scale; to: 1 1 1; dur: 150; startEvents: mouseleave, click"></a-ring>' +
      '</a-entity>' +

      '<a-entity light="type: ambient; color: #8a7bd0; intensity: 0.55"></a-entity>' +
      '<a-entity light="type: directional; color: #ffffff; intensity: 0.9" position="1.5 4 3"></a-entity>' +
      '<a-entity id="luzProducto" light="type: point; color: ' + COLORES.rosa + '; intensity: 1.4; distance: 6; decay: 1.5" position="0 1.55 0.5"></a-entity>' +

      /* Pedestal */
      '<a-cylinder position="0 0.07 0" radius="0.6" height="0.14" material="color: #1b1233; metalness: 0.6; roughness: 0.3"></a-cylinder>' +
      '<a-torus position="0 0.15 0" rotation="90 0 0" radius="0.5" radius-tubular="0.012" material="color: #ffc93c; emissive: #ffc93c; emissiveIntensity: 0.5"></a-torus>' +

      /* Producto: gira sobre el pedestal */
      '<a-entity id="producto" position="0 0.15 0" animation="property: rotation; to: 0 360 0; dur: 14000; easing: linear; loop: true">' +
        '<a-cylinder position="0 0.45 0" radius="0.035" height="0.9" material="color: #15111f; metalness: 0.7; roughness: 0.35"></a-cylinder>' +
        '<a-cylinder position="0 0.12 0" radius="0.05" height="0.1" material="color: #ffc93c; metalness: 0.8; roughness: 0.25"></a-cylinder>' +
        '<a-cylinder position="0 0.62 0" radius="0.047" height="0.05" material="color: #ffc93c; metalness: 0.8; roughness: 0.25"></a-cylinder>' +
        '<a-sphere id="cabeza" position="0 1.1 0" radius="0.17" material="color: ' + COLORES.rosa + '; emissive: ' + COLORES.rosa + '; emissiveIntensity: 1; roughness: 0.2"></a-sphere>' +
        '<a-torus id="halo" position="0 1.1 0" radius="0.26" radius-tubular="0.012" material="color: ' + COLORES.rosa + '; emissive: ' + COLORES.rosa + '; emissiveIntensity: 1" ' +
          'animation="property: rotation; from: 70 0 0; to: 70 360 0; dur: 5000; easing: linear; loop: true"></a-torus>' +
        '<a-torus id="halo2" position="0 1.1 0" radius="0.32" radius-tubular="0.006" material="color: #ffffff; emissive: #ffffff; emissiveIntensity: 0.6; opacity: 0.7; transparent: true" ' +
          'animation="property: rotation; from: 110 0 0; to: 110 -360 0; dur: 8000; easing: linear; loop: true"></a-torus>' +
        '<a-entity id="puntoInfo" class="interactivo" position="0.3 0.95 0">' +
          '<a-sphere radius="0.06" material="color: #ffffff; emissive: #ffffff; emissiveIntensity: 0.5"></a-sphere>' +
          '<a-text value="i" align="center" width="1" position="0 0 0.065" color="#15111f"></a-text>' +
        '</a-entity>' +
      '</a-entity>' +

      /* Cartel publicitario */
      '<a-entity position="-1.55 1.3 0" rotation="0 22 0">' +
        '<a-plane width="1.5" height="1.1" material="color: #120a24; opacity: 0.82; transparent: true"></a-plane>' +
        '<a-text value="AURA" align="center" width="3.2" position="0 0.38 0.01" color="#ffc93c"></a-text>' +
        '<a-text value="La luz de tu concierto,\nen tu mano." align="center" width="1.25" position="0 0.08 0.01" color="#ffffff"></a-text>' +
        '<a-text value="Producto de demostracion" align="center" width="1" position="0 -0.4 0.01" color="#b9a8ff"></a-text>' +
      '</a-entity>' +

      /* Ficha técnica: se muestra con el punto "i" */
      '<a-entity id="ficha" visible="false" position="0.95 0.75 0.5" rotation="0 -20 0">' +
        '<a-plane width="1.3" height="0.8" material="color: #120a24; opacity: 0.9; transparent: true"></a-plane>' +
        '<a-text value="Ficha tecnica\n- 5 colores LED\n- Mango de aluminio\n- Pantalla de luz difusa\n- Modelado con primitivas" align="left" width="1.05" position="-0.55 0 0.01" color="#ffffff"></a-text>' +
      '</a-entity>' +

      /* Botones 3D */
      swatches +
      boton3D('btn3dGirar', 'GIRAR', -0.45, 0.4, 0.95, 0.7) +
      boton3D('btn3dLuz', 'LUZ', 0.45, 0.4, 0.95, 0.7) +

      '</a-scene>';
  }

  /* ---------- 3. Acciones sobre el producto ---------- */
  function el(id) { return escenaCont.querySelector('#' + id); }

  function aplicarColor(nombre) {
    var hex = COLORES[nombre];
    estado.color = nombre;
    var intensidad = estado.luz ? 1 : 0;
    el('cabeza').setAttribute('material', { color: hex, emissive: hex, emissiveIntensity: intensidad });
    el('halo').setAttribute('material', { color: hex, emissive: hex, emissiveIntensity: intensidad });
    el('luzProducto').setAttribute('light', { color: hex, intensity: estado.luz ? 1.4 : 0 });
  }

  function ponerColor(nombre) {
    if (!COLORES[nombre] || !estado.listo) { return; }
    aplicarColor(nombre);
    contar('ar.colores.' + nombre);
    decir('Color del producto: ' + nombre + '.');
  }

  function ponerGiro(valor) {
    if (!estado.listo) { return; }
    estado.gira = valor;
    var p = el('producto');
    if (valor) { p.components.animation.play(); } else { p.components.animation.pause(); }
    var b = $('btnGirar');
    b.textContent = 'Girar: ' + (valor ? 'sí' : 'no');
    b.setAttribute('aria-pressed', String(valor));
    decir('Giro ' + (valor ? 'activado' : 'detenido') + '.');
  }

  function ponerLuz(valor) {
    if (!estado.listo) { return; }
    estado.luz = valor;
    aplicarColor(estado.color);
    var b = $('btnLuz');
    b.textContent = 'Luz: ' + (valor ? 'encendida' : 'apagada');
    b.setAttribute('aria-pressed', String(valor));
    decir('Luz ' + (valor ? 'encendida' : 'apagada') + '.');
  }

  function ponerInfo(valor) {
    if (!estado.listo) { return; }
    estado.info = valor;
    el('ficha').setAttribute('visible', valor);
    var b = $('btnInfo');
    b.textContent = 'Ficha: ' + (valor ? 'visible' : 'oculta');
    b.setAttribute('aria-pressed', String(valor));
    decir(valor ? 'Ficha técnica visible.' : 'Ficha técnica oculta.');
  }

  /* En pantallas verticales (celular) la cámara se aleja para que todo quepa */
  function ajustarCamara() {
    var cam = el('camara');
    if (!cam) { return; }
    var caja = $('arStage').getBoundingClientRect();
    var z = caja.width < caja.height ? 5 : 3.1;
    cam.setAttribute('position', { x: 0, y: 1, z: z });
  }

  /* ---------- 4. Cursor virtual (raycaster) ---------- */
  function conectarCursor() {
    escenaCont.addEventListener('click', function (e) {
      var objetivo = e.target;
      if (!objetivo || !objetivo.classList || !objetivo.classList.contains('interactivo')) {
        objetivo = objetivo && objetivo.closest ? objetivo.closest('.interactivo') : null;
      }
      if (!objetivo) { return; }
      contar('ar.toques');

      if (objetivo.dataset && objetivo.dataset.color) { ponerColor(objetivo.dataset.color); return; }
      if (objetivo.id === 'btn3dGirar') { ponerGiro(!estado.gira); return; }
      if (objetivo.id === 'btn3dLuz') { ponerLuz(!estado.luz); return; }
      if (objetivo.id === 'puntoInfo') { ponerInfo(!estado.info); }
    }, true);

    escenaCont.addEventListener('mouseenter', function (e) {
      var t = e.target;
      if (t && t.classList && t.classList.contains('interactivo')) {
        t.setAttribute('scale', '1.18 1.18 1.18');
        escenaCont.classList.add('ar-apuntando');
      }
    }, true);
    escenaCont.addEventListener('mouseleave', function (e) {
      var t = e.target;
      if (t && t.classList && t.classList.contains('interactivo')) {
        t.setAttribute('scale', '1 1 1');
        escenaCont.classList.remove('ar-apuntando');
      }
    }, true);
  }

  function ponerMirada(valor) {
    estado.mirada = valor;
    var escena = escenaCont.querySelector('a-scene');
    var camara = el('camara');
    if (valor) {
      escena.removeAttribute('cursor');
      camara.setAttribute('cursor', 'rayOrigin: entity; fuse: true; fuseTimeout: 1400');
      camara.setAttribute('raycaster', 'objects: .interactivo; far: 12');
      el('reticula').setAttribute('visible', 'true');
    } else {
      camara.removeAttribute('cursor');
      camara.removeAttribute('raycaster');
      escena.setAttribute('cursor', 'rayOrigin: mouse; fuse: false');
      escena.setAttribute('raycaster', 'objects: .interactivo; far: 12');
      el('reticula').setAttribute('visible', 'false');
    }
    var b = $('btnMirada');
    b.textContent = 'Modo mirada: ' + (valor ? 'activo' : 'apagado');
    b.setAttribute('aria-pressed', String(valor));
    decir(valor ? 'Modo mirada: mantén el punto central sobre un botón para pulsarlo.' : 'Modo toque y ratón.');
  }

  /* ---------- 5. Cámara del dispositivo (requiere HTTPS) ---------- */
  function activarCamara() {
    if (estado.flujo) { detenerCamara(); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      decir('Este navegador no permite usar la cámara aquí. Abre la página con HTTPS en un navegador actualizado.');
      return;
    }
    decir('Pidiendo permiso para usar la cámara…');
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then(function (flujo) {
        estado.flujo = flujo;
        video.srcObject = flujo;
        video.hidden = false;
        video.play().catch(function () { /* el navegador lo reproduce al tocar */ });
        $('arStage').classList.add('con-camara');
        $('btnCamara').textContent = 'Apagar cámara';
        contar('ar.camara');
        decir('Cámara activa. Mueve el dispositivo para mirar el producto.');
      })
      .catch(function (error) {
        var causa = error && error.name === 'NotAllowedError' ? 'Permiso de cámara denegado. Actívalo en la configuración del navegador.' :
          error && error.name === 'NotFoundError' ? 'No se encontró ninguna cámara.' : 'No se pudo abrir la cámara.';
        decir(causa + ' Puedes seguir viendo el showroom sin cámara.');
      });
  }

  function detenerCamara() {
    if (estado.flujo) {
      estado.flujo.getTracks().forEach(function (t) { t.stop(); });
      estado.flujo = null;
    }
    video.srcObject = null;
    video.hidden = true;
    $('arStage').classList.remove('con-camara');
    $('btnCamara').textContent = 'Activar cámara';
    decir('Cámara apagada.');
  }

  /* ---------- 6. Arranque ---------- */
  function habilitarControles() {
    ['btnCamara', 'btnMirada', 'btnPantalla', 'btnGirar', 'btnLuz', 'btnInfo'].forEach(function (id) { $(id).disabled = false; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-color]'), function (b) { b.disabled = false; });
  }

  function iniciar() {
    var boton = $('btnIniciar');
    boton.disabled = true;
    decir('Descargando A-Frame y preparando la escena…');
    cargarAFrame().then(function () {
      escenaCont.innerHTML = plantilla();
      var escena = escenaCont.querySelector('a-scene');
      var listo = function () {
        estado.listo = true;
        $('arInicio').hidden = true;
        habilitarControles();
        conectarCursor();
        ajustarCamara();
        window.addEventListener('resize', ajustarCamara);
        window.addEventListener('orientationchange', ajustarCamara);
        contar('ar.sesiones');
        decir('Escena lista. Activa la cámara y toca los botones 3D.');
      };
      if (escena.hasLoaded) { listo(); } else { escena.addEventListener('loaded', listo, { once: true }); }
    }).catch(function () {
      boton.disabled = false;
      decir('No se pudo cargar la escena. Revisa tu conexión a internet e inténtalo de nuevo.');
    });
  }

  $('btnIniciar').addEventListener('click', iniciar);
  $('btnCamara').addEventListener('click', activarCamara);
  $('btnMirada').addEventListener('click', function () { ponerMirada(!estado.mirada); });
  $('btnGirar').addEventListener('click', function () { contar('ar.toques'); ponerGiro(!estado.gira); });
  $('btnLuz').addEventListener('click', function () { contar('ar.toques'); ponerLuz(!estado.luz); });
  $('btnInfo').addEventListener('click', function () { contar('ar.toques'); ponerInfo(!estado.info); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-color]'), function (b) {
    b.addEventListener('click', function () { contar('ar.toques'); ponerColor(b.dataset.color); });
  });
  $('btnPantalla').addEventListener('click', function () {
    var caja = $('arStage');
    if (document.fullscreenElement) { document.exitFullscreen(); }
    else if (caja.requestFullscreen) { caja.requestFullscreen(); }
  });

  /* Libera la cámara si el visitante sale de la página */
  window.addEventListener('pagehide', detenerCamara);
}());
