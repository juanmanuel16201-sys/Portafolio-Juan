/* ============================================================
   ALMACENAMIENTO LOCAL DEL PORTAFOLIO  (API localStorage + JSON)
   - pj_marcadores : historial de partidas (lo escriben los juegos)
   - pj_metricas   : visitas, tiempo en cada página e interacciones AR
   Este archivo se carga en todas las páginas. Las tablas y las
   métricas solo se dibujan donde existan los elementos con esos id.
   ============================================================ */
(function () {
  'use strict';

  var K_MARCADORES = 'pj_marcadores';
  var K_METRICAS = 'pj_metricas';

  /* ---------- lectura y escritura seguras (JSON) ---------- */
  function leer(clave, porDefecto) {
    try {
      var v = JSON.parse(localStorage.getItem(clave));
      return v === null || v === undefined ? porDefecto : v;
    } catch (e) {
      return porDefecto;
    }
  }

  function escribir(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- marcadores ---------- */
  function marcadores() {
    var l = leer(K_MARCADORES, []);
    return Array.isArray(l) ? l : [];
  }

  function records() {
    var mejor = {};
    marcadores().forEach(function (m) {
      var p = Number(m.puntos) || 0;
      if (!mejor[m.juego] || p > mejor[m.juego].puntos) {
        mejor[m.juego] = { juego: m.juego, puntos: p, detalle: m.detalle || '', fecha: m.fecha };
      }
    });
    return Object.keys(mejor).sort().map(function (k) { return mejor[k]; });
  }

  /* ---------- métricas ---------- */
  function metricas() {
    var m = leer(K_METRICAS, {});
    if (typeof m !== 'object' || m === null || Array.isArray(m)) { m = {}; }
    m.visitas = m.visitas || {};
    m.tiempoMs = m.tiempoMs || {};
    m.ar = m.ar || {};
    return m;
  }

  /* Suma n a un contador. Ruta con puntos: "ar.toques", "visitas.index.html" */
  function contar(ruta, n) {
    var m = metricas();
    var partes = ruta.split('.');
    var clave = partes.shift();
    var resto = partes.join('.');
    if (!resto) {
      m[clave] = (Number(m[clave]) || 0) + (n || 1);
    } else {
      m[clave] = m[clave] || {};
      m[clave][resto] = (Number(m[clave][resto]) || 0) + (n || 1);
    }
    m.ultima = new Date().toISOString();
    if (!m.primera) { m.primera = m.ultima; }
    escribir(K_METRICAS, m);
  }

  /* ---------- visita y tiempo en la página actual ---------- */
  var pagina = (location.pathname.split('/').pop() || 'index.html');
  var inicio = Date.now();

  function guardarTiempo() {
    var ahora = Date.now();
    var delta = ahora - inicio;
    inicio = ahora;
    if (delta > 0 && delta < 3600000) { contar('tiempoMs.' + pagina, delta); }
  }

  contar('visitas.' + pagina);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { guardarTiempo(); } else { inicio = Date.now(); }
  });
  window.addEventListener('pagehide', guardarTiempo);

  /* ---------- dibujo de tablas y métricas ---------- */
  function celda(fila, texto, clase) {
    var td = document.createElement('td');
    td.textContent = texto;
    if (clase) { td.className = clase; }
    fila.appendChild(td);
  }

  function formatoFecha(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return '—'; }
    return d.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  function pintarTablas() {
    var tr = document.getElementById('tablaRecords');
    var th = document.getElementById('tablaHistorial');
    if (!tr || !th) { return; }
    var cuerpoR = tr.querySelector('tbody');
    var cuerpoH = th.querySelector('tbody');
    cuerpoR.textContent = '';
    cuerpoH.textContent = '';

    var rec = records();
    if (!rec.length) {
      var f0 = document.createElement('tr');
      var c0 = document.createElement('td');
      c0.colSpan = 3;
      c0.textContent = 'Aún no hay partidas. ¡Juega una para ver tu récord!';
      f0.appendChild(c0);
      cuerpoR.appendChild(f0);
    }
    rec.forEach(function (r) {
      var f = document.createElement('tr');
      celda(f, r.juego);
      celda(f, String(r.puntos), 'text-end fw-semibold');
      celda(f, r.detalle);
      cuerpoR.appendChild(f);
    });

    var hist = marcadores().slice(0, 10);
    if (!hist.length) {
      var f1 = document.createElement('tr');
      var c1 = document.createElement('td');
      c1.colSpan = 5;
      c1.textContent = 'El historial está vacío.';
      f1.appendChild(c1);
      cuerpoH.appendChild(f1);
    }
    hist.forEach(function (m) {
      var f = document.createElement('tr');
      celda(f, formatoFecha(m.fecha));
      celda(f, m.juego);
      celda(f, m.modo || '—');
      celda(f, m.detalle || '—');
      celda(f, m.resultado || '—');
      cuerpoH.appendChild(f);
    });
  }

  function suma(obj) {
    return Object.keys(obj || {}).reduce(function (a, k) { return a + (Number(obj[k]) || 0); }, 0);
  }

  function pintarMetricas() {
    var dl = document.getElementById('metricas');
    if (!dl) { return; }
    var m = metricas();
    var colores = m.ar.colores || {};
    var favorito = Object.keys(colores).sort(function (a, b) { return colores[b] - colores[a]; })[0];
    var datos = [
      ['Visitas al sitio', String(suma(m.visitas))],
      ['Tiempo en el sitio', Math.round(suma(m.tiempoMs) / 60000) + ' min'],
      ['Partidas guardadas', String(marcadores().length)],
      ['Sesiones de realidad aumentada', String(Number(m.ar.sesiones) || 0)],
      ['Toques en la escena AR', String(Number(m.ar.toques) || 0)],
      ['Veces que activaste la cámara', String(Number(m.ar.camara) || 0)],
      ['Color favorito en AR', favorito || '—']
    ];
    dl.textContent = '';
    datos.forEach(function (par) {
      var caja = document.createElement('div');
      caja.className = 'metrica';
      var dd = document.createElement('dd');
      dd.textContent = par[1];
      var dt = document.createElement('dt');
      dt.textContent = par[0];
      caja.appendChild(dd);
      caja.appendChild(dt);
      dl.appendChild(caja);
    });
  }

  function pintar() { pintarTablas(); pintarMetricas(); }

  document.addEventListener('DOMContentLoaded', function () {
    pintar();
    var bm = document.getElementById('borrarMarcadores');
    var bt = document.getElementById('borrarMetricas');
    if (bm) {
      bm.addEventListener('click', function () {
        try { localStorage.removeItem(K_MARCADORES); } catch (e) { /* nada */ }
        pintar();
      });
    }
    if (bt) {
      bt.addEventListener('click', function () {
        try { localStorage.removeItem(K_METRICAS); } catch (e) { /* nada */ }
        pintar();
      });
    }
  });

  /* Se actualiza solo cuando un juego guarda un marcador (iframe u otra pestaña) */
  window.addEventListener('message', function (e) {
    if (e.origin === location.origin && e.data && e.data.tipo === 'marcador-guardado') { pintar(); }
  });
  window.addEventListener('storage', function (e) {
    if (e.key === K_MARCADORES || e.key === K_METRICAS) { pintar(); }
  });

  window.Almacen = { marcadores: marcadores, records: records, metricas: metricas, contar: contar, pintar: pintar };
}());
