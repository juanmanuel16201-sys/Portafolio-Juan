/* ============================================================
   Consola de juegos — carrusel de discos, animación y sonido
   - El carrusel gira los discos (flechas, clic, teclado o deslizar).
   - Al elegir un juego: enciende la consola, abre la tapa, mete el
     disco, cierra, lee el disco y carga el juego dentro de la página.
   - "Elegir otro juego" hace el camino inverso sin recargar.
   - El sonido se sintetiza con Web Audio (no hay archivos de audio).
   ============================================================ */
(() => {
  'use strict';

  const stage = document.getElementById('stage');
  if (!stage) return;

  const $ = (id) => document.getElementById(id);
  const scene = $('scene');
  const discs = Array.from(stage.querySelectorAll('.disc'));
  const infos = Array.from(document.querySelectorAll('.game-info'));
  const stageTitle = $('stageTitle');
  const status = $('status');
  const btnPrev = $('btnPrev');
  const btnNext = $('btnNext');
  const btnInsert = $('btnInsert');
  const btnSkip = $('btnSkip');
  const btnMute = $('btnMute');
  const screen = $('screen');
  const screenName = $('screenName');
  const frame = $('gameFrame');
  const btnBack = $('btnBack');
  const btnFull = $('btnFull');
  const linkNew = $('linkNew');

  const N = discs.length;
  const STEP = 360 / N; // separación entre discos en el círculo
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const speed = reduce ? 0.15 : 1; // multiplica todas las esperas

  let sel = 0;
  let busy = false;
  let skipping = false;
  const ang = discs.map((_, i) => i * STEP);
  const waiters = new Set();

  /* ---------------------------------------------------------
     SONIDO (Web Audio, sintetizado)
     --------------------------------------------------------- */
  const sfx = (() => {
    let ctx = null;
    let master = null;
    let noiseBuf = null;
    let whirr = null;
    let muted = false;
    try { muted = localStorage.getItem('jr-mute') === '1'; } catch (e) { /* sin almacenamiento */ }

    function unlock() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : 0.55;
        const comp = ctx.createDynamicsCompressor();
        master.connect(comp);
        comp.connect(ctx.destination);
        // Eco suave para dar sensación de espacio
        const dly = ctx.createDelay(1);
        dly.delayTime.value = 0.19;
        const fb = ctx.createGain();
        fb.gain.value = 0.38;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2600;
        const wet = ctx.createGain();
        wet.gain.value = 0.4;
        master.connect(dly);
        dly.connect(lp);
        lp.connect(fb);
        fb.connect(dly);
        lp.connect(wet);
        wet.connect(comp);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }

    function tone(o) {
      if (!ctx) return null;
      const t0 = ctx.currentTime + (o.t || 0);
      const dur = o.dur || 0.2;
      const rel = o.rel === undefined ? 0.1 : o.rel;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(o.f || 440, t0);
      if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t0 + (o.atk || 0.005));
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + rel);
      let node = osc;
      if (o.lp) {
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = o.lp;
        osc.connect(f);
        node = f;
      }
      node.connect(g);
      g.connect(master);
      osc.start(t0);
      osc.stop(t0 + dur + rel + 0.05);
      return { osc, g };
    }

    function noise(o) {
      if (!ctx) return null;
      const t0 = ctx.currentTime + (o.t || 0);
      const dur = o.dur || 0.3;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = o.type || 'lowpass';
      f.Q.value = o.q || 1;
      f.frequency.setValueAtTime(o.f || 1000, t0);
      if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(o.vol || 0.1, t0 + (o.atk || 0.01));
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(f);
      f.connect(g);
      g.connect(master);
      src.start(t0, Math.random());
      src.stop(t0 + dur + 0.05);
    }

    return {
      unlock,
      get muted() { return muted; },
      setMuted(v) {
        muted = v;
        try { localStorage.setItem('jr-mute', v ? '1' : '0'); } catch (e) { /* sin almacenamiento */ }
        if (master) master.gain.value = v ? 0 : 0.55;
      },
      tick() { tone({ type: 'square', f: 1300, f2: 800, dur: 0.03, vol: 0.05, rel: 0.02 }); },
      select() {
        tone({ f: 660, dur: 0.1, vol: 0.18 });
        tone({ f: 990, t: 0.09, dur: 0.18, vol: 0.18, rel: 0.4 });
      },
      // Arranque: acorde etéreo que sube + barrido + destellos (inspirado en las consolas clásicas)
      powerOn() {
        [65.4, 130.8, 196, 261.6, 329.6, 392, 523.3].forEach((f, i) => {
          tone({ type: i % 2 ? 'triangle' : 'sine', f, f2: f * 1.5, dur: 1.5, atk: 1.1, vol: 0.05, rel: 1.6 });
        });
        noise({ type: 'bandpass', f: 300, f2: 3600, dur: 1.5, vol: 0.12, atk: 0.6, q: 0.8 });
        [1318.5, 1568, 1975.5, 2349.3, 2637, 3136].forEach((f, i) => {
          tone({ f, t: 0.5 + i * 0.16, dur: 0.05, vol: 0.05, rel: 0.7 });
        });
        [523.3, 659.3, 784].forEach((f) => tone({ f, t: 1.3, dur: 0.4, atk: 0.2, vol: 0.06, rel: 1.8 }));
      },
      servo(dur, opening) {
        tone({ type: 'sawtooth', f: opening ? 90 : 150, f2: opening ? 150 : 90, dur, vol: 0.05, lp: 700, rel: 0.05 });
        noise({ type: 'bandpass', f: 1800, dur, vol: 0.04, q: 2 });
        tone({ type: 'square', f: 240, f2: 110, t: dur, dur: 0.02, vol: 0.08, rel: 0.03 });
      },
      slide(dur) {
        noise({ type: 'bandpass', f: 1600, f2: 600, dur, vol: 0.06, q: 1.5, atk: 0.1 });
        tone({ f: 880, f2: 440, dur, vol: 0.03, rel: 0.2 });
      },
      clunk(vol) {
        const v = vol || 1;
        tone({ f: 140, f2: 45, dur: 0.12, vol: 0.35 * v, rel: 0.1 });
        noise({ type: 'lowpass', f: 500, dur: 0.14, vol: 0.25 * v });
      },
      seek() {
        for (let i = 0; i < 14; i++) {
          tone({ type: 'square', f: 280 + Math.random() * 260, dur: 0.012, vol: 0.03, t: 0.05 + i * 0.09 + Math.random() * 0.05, rel: 0.01 });
        }
      },
      spinUp() {
        if (!ctx) return;
        this.spinStop(0.05);
        const t0 = ctx.currentTime;
        const osc = ctx.createOscillator();
        const lp = ctx.createBiquadFilter();
        const g = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoG = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(40, t0);
        osc.frequency.exponentialRampToValueAtTime(210, t0 + 1.8);
        lp.type = 'lowpass';
        lp.frequency.value = 700;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.06, t0 + 0.4);
        lfo.frequency.value = 14;
        lfoG.gain.value = 0.02;
        lfo.connect(lfoG);
        lfoG.connect(g.gain);
        osc.connect(lp);
        lp.connect(g);
        g.connect(master);
        osc.start(t0);
        lfo.start(t0);
        whirr = { osc, lfo, g };
      },
      spinStop(fade) {
        if (!whirr || !ctx) return;
        const t = ctx.currentTime;
        const w = whirr;
        whirr = null;
        w.g.gain.cancelScheduledValues(t);
        w.g.gain.setValueAtTime(Math.max(w.g.gain.value, 0.0001), t);
        w.g.gain.exponentialRampToValueAtTime(0.0001, t + (fade || 0.5));
        w.osc.frequency.exponentialRampToValueAtTime(30, t + (fade || 0.5));
        w.osc.stop(t + (fade || 0.5) + 0.05);
        w.lfo.stop(t + (fade || 0.5) + 0.05);
      },
      ready() {
        tone({ f: 784, dur: 0.1, vol: 0.14 });
        tone({ f: 1046.5, t: 0.1, dur: 0.25, vol: 0.14, rel: 0.5 });
      },
      eject() {
        noise({ type: 'bandpass', f: 500, f2: 1800, dur: 0.8, vol: 0.06, q: 1.5, atk: 0.1 });
        tone({ f: 440, f2: 880, dur: 0.8, vol: 0.03, rel: 0.2 });
      }
    };
  })();

  /* ---------------------------------------------------------
     UTILIDADES
     --------------------------------------------------------- */
  function wait(ms) {
    if (skipping) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => { clearTimeout(t); waiters.delete(done); resolve(); };
      const t = setTimeout(done, ms * speed);
      waiters.add(done);
    });
  }

  function skipNow() {
    skipping = true;
    sfx.spinStop(0.2);
    Array.from(waiters).forEach((fn) => fn());
  }

  function setPhase(phase, text) {
    stage.setAttribute('data-phase', phase);
    if (text) status.textContent = text;
  }

  function title(i) { return discs[i].getAttribute('data-title'); }
  function infoFor(i) { return document.getElementById('info-' + discs[i].getAttribute('data-game')); }

  // Deja los ángulos entre -180 y 180 sin que se note (sin transición)
  function normalizeAngles() {
    discs.forEach((d, i) => {
      let a = ((ang[i] % 360) + 360) % 360;
      if (a > 180) a -= 360;
      if (a !== ang[i]) {
        d.style.transition = 'none';
        ang[i] = a;
        d.style.setProperty('--a', a + 'deg');
      }
    });
    void stage.offsetWidth;
    discs.forEach((d) => { d.style.transition = ''; });
  }

  function render() {
    discs.forEach((d, i) => {
      d.style.setProperty('--a', ang[i] + 'deg');
      d.classList.toggle('is-front', i === sel);
      const b = d.querySelector('.disc-btn');
      b.tabIndex = i === sel ? 0 : -1;
      if (i === sel) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    infos.forEach((el) => el.classList.toggle('is-current', el === infoFor(sel)));
    stageTitle.textContent = title(sel);
    status.textContent = 'Disco ' + (sel + 1) + ' de ' + N + '. Elige uno para insertarlo en la consola.';
  }

  function goTo(i) {
    if (busy || i === sel) return;
    let delta = (((i - sel) % N) + N) % N;
    if (delta > N / 2) delta -= N;
    for (let k = 0; k < N; k++) ang[k] -= delta * STEP;
    sel = i;
    sfx.unlock();
    sfx.tick();
    render();
  }

  function step(dir) { goTo((sel + dir + N) % N); }

  /* ---------------------------------------------------------
     SECUENCIA: elegir juego
     --------------------------------------------------------- */
  async function pick() {
    if (busy) return;
    busy = true;
    skipping = false;
    sfx.unlock();
    normalizeAngles();

    const disc = discs[sel];
    const name = title(sel);
    const url = infoFor(sel).querySelector('.game-link').getAttribute('href');
    disc.classList.add('is-picked');
    [btnPrev, btnNext, btnInsert].forEach((b) => { b.disabled = true; });
    btnSkip.hidden = false;

    sfx.select();
    setPhase('fly', 'Encendiendo la consola…');
    await wait(900);

    sfx.powerOn();
    await wait(800);

    setPhase('open', 'Abriendo la tapa…');
    sfx.servo(0.7, true);
    await wait(900);

    setPhase('drop', 'Insertando el disco…');
    sfx.slide(0.8);
    await wait(850);
    sfx.clunk();

    // El disco gira a la vista unos segundos, con la tapa abierta
    setPhase('spin', 'El disco está girando…');
    sfx.spinUp();
    sfx.seek();
    await wait(2800);

    setPhase('close', 'Cerrando la tapa…');
    sfx.servo(0.6, false);
    await wait(800);
    sfx.clunk(0.6);

    // Recién ahora se carga el juego
    setPhase('read', 'Cargando el juego…');
    sfx.seek();

    const loaded = new Promise((resolve) => {
      const fin = () => { clearTimeout(timer); resolve(); };
      const timer = setTimeout(fin, 5000);
      frame.addEventListener('load', fin, { once: true });
    });
    frame.src = url;
    await Promise.all([wait(1000), loaded]);

    sfx.spinStop(0.6);
    sfx.ready();
    enterPlay(name, url);
  }

  function enterPlay(name, url) {
    setPhase('play', '¡A jugar! ' + name + ' está listo.');
    scene.classList.add('is-away');
    btnSkip.hidden = true;
    stageTitle.hidden = true;
    stage.querySelector('.stage-bar').hidden = true;
    status.hidden = true;
    screenName.textContent = name;
    linkNew.setAttribute('href', url);
    screen.hidden = false;
    busy = false;
    skipping = false;
    frame.focus();
    screen.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------------------------------------------------------
     SECUENCIA: volver a elegir otro juego
     --------------------------------------------------------- */
  async function back() {
    if (busy) return;
    busy = true;
    skipping = false;
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch (e) { /* ya salió */ }
    }
    frame.src = 'about:blank';
    screen.hidden = true;
    scene.classList.remove('is-away');
    stageTitle.hidden = false;
    status.hidden = false;
    stage.querySelector('.stage-bar').hidden = false;
    btnSkip.hidden = false;
    btnInsert.disabled = true;
    void scene.offsetWidth;

    setPhase('ejectA', 'Abriendo la tapa…');
    sfx.servo(0.7, true);
    await wait(900);

    setPhase('ejectB', 'Sacando el disco…');
    sfx.eject();
    await wait(900);

    setPhase('ejectC', 'Devolviendo el disco al carrusel…');
    sfx.servo(0.6, false);
    await wait(1000);

    discs[sel].classList.remove('is-picked');
    setPhase('select');
    btnSkip.hidden = true;
    [btnPrev, btnNext, btnInsert].forEach((b) => { b.disabled = false; });
    render();
    busy = false;
    skipping = false;
    discs[sel].querySelector('.disc-btn').focus();
  }

  /* ---------------------------------------------------------
     EVENTOS
     --------------------------------------------------------- */
  let dragX = null;
  let dragged = false;

  discs.forEach((d, i) => {
    d.querySelector('.disc-btn').addEventListener('click', () => {
      if (dragged) { dragged = false; return; }
      if (stage.getAttribute('data-phase') !== 'select') return;
      if (i === sel) pick(); else goTo(i);
    });
  });

  btnPrev.addEventListener('click', () => step(-1));
  btnNext.addEventListener('click', () => step(1));
  btnInsert.addEventListener('click', pick);
  btnSkip.addEventListener('click', skipNow);
  btnBack.addEventListener('click', back);

  btnMute.addEventListener('click', () => {
    sfx.unlock();
    sfx.setMuted(!sfx.muted);
    paintMute();
  });

  function paintMute() {
    btnMute.setAttribute('aria-pressed', sfx.muted ? 'true' : 'false');
    btnMute.textContent = sfx.muted ? 'Sonido: apagado' : 'Sonido: encendido';
  }

  btnFull.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (screen.requestFullscreen) screen.requestFullscreen().then(() => frame.focus()).catch(() => {});
  });

  if (!document.fullscreenEnabled) btnFull.hidden = true;

  stage.addEventListener('keydown', (e) => {
    if (stage.getAttribute('data-phase') !== 'select' || busy) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); discs[sel].querySelector('.disc-btn').focus(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); discs[sel].querySelector('.disc-btn').focus(); }
  });

  scene.addEventListener('pointerdown', (e) => { dragX = e.clientX; dragged = false; });
  scene.addEventListener('pointerup', (e) => {
    if (dragX === null) return;
    const dx = e.clientX - dragX;
    dragX = null;
    if (Math.abs(dx) > 45 && stage.getAttribute('data-phase') === 'select') {
      dragged = true;
      step(dx < 0 ? 1 : -1);
      setTimeout(() => { dragged = false; }, 50);
    }
  });
  scene.addEventListener('pointercancel', () => { dragX = null; });

  // Si la URL trae #taxi-furia, ese disco queda de frente
  const hash = window.location.hash.replace('#', '');
  const start = discs.findIndex((d) => d.getAttribute('data-game') === hash);
  if (start > 0) {
    sel = start;
    for (let k = 0; k < N; k++) ang[k] = (k - start) * STEP;
  }

  paintMute();
  render();
})();
