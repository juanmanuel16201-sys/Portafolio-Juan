/* ============================================================
   Registro de marcadores de los juegos (API localStorage, JSON).
   Cada juego llama a registrarMarcador({...}) cuando termina una
   partida. Los datos se guardan en la clave "pj_marcadores" y la
   página arcade.html los lee y los muestra.
   ============================================================ */
(function () {
  'use strict';
  var CLAVE = 'pj_marcadores';
  var MAXIMO = 100;

  window.registrarMarcador = function (r) {
    try {
      var lista = JSON.parse(localStorage.getItem(CLAVE) || '[]');
      if (!Array.isArray(lista)) { lista = []; }
      r.fecha = new Date().toISOString();
      lista.unshift(r);
      localStorage.setItem(CLAVE, JSON.stringify(lista.slice(0, MAXIMO)));
    } catch (e) { /* sin almacenamiento disponible */ }
    try {
      if (window.parent !== window) {
        window.parent.postMessage({ tipo: 'marcador-guardado' }, '*');
      }
    } catch (e) { /* nada */ }
  };
}());
