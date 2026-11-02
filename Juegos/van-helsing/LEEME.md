# Van Helsing

Shooter 3D de cazar monstruos hecho con HTML, CSS, JavaScript y Three.js r128. Funciona en PC y en celular.

## Cómo abrirlo
- Abre la carpeta en VS Code y usa la extensión **Live Server** sobre `index.html`, o abre `index.html` directamente en Chrome o Edge.
- Three.js y los efectos ya vienen en `lib/`, así que funciona sin internet. Solo las fuentes se descargan de Google Fonts.

## Estructura
- `index.html` — pantallas (menú, carga, HUD, pausa, fin) y controles táctiles.
- `css/estilos.css` — todos los estilos.
- `js/` — el juego dividido en archivos que se cargan en orden. Comparten variables globales, así que no cambies el orden de los `<script>` en `index.html`.
- `lib/` — Three.js r128 y los pases de post-procesado.

## Transformaciones (al pelear con un jefe)
- Cementerio: Ángel de Plata (Lanza de luz · Juicio divino)
- Castillo de Drácula y cualquier pelea contra Drácula: Lobo Negro (Garras · Aullido)
- Olimpo: Titán de Bronce (Mazo de bronce · Terremoto)
- Valle de los Reyes: Avatar de Ra (Rayo solar · Sol abrasador)
- Llanos: Jaguar Espíritu (Zarpazo · Salto del jaguar)

## Controles
PC: WASD moverse, Shift correr, Espacio saltar, ratón apuntar/disparar, 1–8 armas, G agua bendita (poder especial transformado), Q chamán, V cámara, Esc pausa.
Celular: joystick a la izquierda, arrastrar a la derecha para apuntar, botón de fuego y botones de acción alrededor.
