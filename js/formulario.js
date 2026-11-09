/* ============================================================
   Formulario de contacto: valida los campos y abre tu programa
   de correo con el mensaje listo para enviar.
   Para cambiar el correo de destino, edita la línea CORREO.
   ============================================================ */
(function () {
  'use strict';

  var CORREO = 'juanmanuel16201@gmail.com';

  var form = document.getElementById('formContacto');
  var aviso = document.getElementById('avisoForm');
  if (!form || !aviso) { return; }

  function valor(id) { return (document.getElementById(id).value || '').trim(); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.classList.add('was-validated');
    aviso.className = 'mt-3 mb-0';

    if (!form.checkValidity()) {
      aviso.textContent = 'Revisa los campos marcados en rojo.';
      aviso.classList.add('text-danger');
      var malo = form.querySelector(':invalid');
      if (malo) { malo.focus(); }
      return;
    }

    var area = document.getElementById('area');
    var textoArea = area.options[area.selectedIndex].text;
    var asunto = 'Contacto desde el portafolio: ' + textoArea;
    var cuerpo = 'Nombre: ' + valor('nombre') + '\n' +
                 'Correo: ' + valor('correo') + '\n' +
                 'Teléfono: ' + (valor('telefono') || 'no indicado') + '\n' +
                 'Área de interés: ' + textoArea + '\n\n' +
                 valor('mensaje');

    window.location.href = 'mailto:' + CORREO + '?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo);

    aviso.textContent = 'Se abrió tu programa de correo con el mensaje listo para enviar. Si no se abrió, escríbeme a ' + CORREO + '.';
    aviso.classList.add('text-success');
    form.reset();
    form.classList.remove('was-validated');
  });
}());
