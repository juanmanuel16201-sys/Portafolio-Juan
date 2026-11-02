# Ace Combat

Juego 3D de combate aéreo hecho con HTML, CSS y JavaScript (Three.js r128).

## Cómo jugar

1. Descomprime la carpeta.
2. Abre `index.html` en el navegador (doble clic o la extensión **Live Server** de VS Code).
3. Necesitas internet: Three.js y las fuentes se cargan desde la web.

## Estructura

```
ace-combat/
├── index.html          Pantallas, menús y HUD (estructura)
├── css/
│   └── estilos.css     Estilos del HUD, menús y controles táctiles
└── js/                 Se cargan en este orden:
    ├── core.js         Utilidades, escena 3D, cielo y terreno
    ├── modelos.js      Modelos de cazas modernos y aviones de hélice
    ├── efectos.js      Partículas, explosiones y efectos de sonido
    ├── estado.js       Épocas, aviones del hangar, armas y misiles
    ├── jugador.js      Vuelo del jugador (control fácil y avanzado)
    ├── enemigos.js     IA enemiga, balas, premios y oleadas
    ├── hud.js          Cámara, HUD y cabina en primera persona
    ├── musica.js       Música del menú (sintetizada)
    ├── misiones.js     Antiaéreos, barcos, bombarderos, radio y campaña
    ├── despegue.js     Base aérea, portaaviones y despegue
    ├── ww2.js          Bombas, cabina antigua y cambio de época
    └── controles.js    Teclado, ratón, táctil, menús y bucle principal
```

Los archivos JS comparten variables globales, así que el orden de los `<script>` en `index.html` importa.

## Dónde cambiar cosas

- **Aviones del hangar:** `PLANES_BY` en `js/estado.js`
- **Armas:** `WEAPONS_BY` en `js/estado.js`
- **Enemigos:** `ETYPES_BY` en `js/estado.js`
- **Velocidades por época:** `ERAS` en `js/estado.js`
- **Misiones:** `MISSIONS` en `js/misiones.js`
- **Vuelo fácil:** bloque `easyCtl` en `js/jugador.js`

## Controles (PC)

W/S subir y bajar · A/D girar · Q/E timón · Shift/X acelerador · Clic o Espacio disparar ·
1 2 3 cambiar arma · R recargar · T manual/automático · F bengalas o extintor · G escudo ·
V overdrive · C cabina/exterior · P pausa
