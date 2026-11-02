// Ace Combat · Controles, flujo de pantallas y bucle principal
'use strict';

/* ---------------- Input ---------------- */
function onKey(code){
  if(state==='menu'){
    if(view==='splash'){enterMenu();return;}
    if(code==='Enter'){if(view==='menu')openMissions();else if(view==='brief')startMission();else if(view==='hangar')showScreen(hangarReturn);}
    else if(code==='Escape'){if(view==='brief')openMissions();else if(view==='hangar')showScreen(hangarReturn);else if(view!=='menu')showScreen('menu');}
    else if(view==='hangar'&&(code==='ArrowLeft'||code==='KeyA'))setPlane(planeIdx-1);
    else if(view==='hangar'&&(code==='ArrowRight'||code==='KeyD'))setPlane(planeIdx+1);
    if(code==='KeyM')toggleMute();
    return;
  }
  if(code==='KeyP'||code==='Escape'){if(state==='play')pause();else if(state==='pause')resume();return;}
  if(code==='KeyM'){toggleMute();return;}
  if(state!=='play')return;
  if(code==='Digit1')selectWeapon(0);else if(code==='Digit2')selectWeapon(1);else if(code==='Digit3')selectWeapon(2);
  else if(code==='Tab')cycleWeapon(1);
  else if(code==='KeyR')startReload();
  else if(code==='KeyT'){autoFire=!autoFire;sfx('switch');}
  else if(code==='KeyF')dropFlares();
  else if(code==='KeyG')activateShield();
  else if(code==='KeyV')activateOD();
  else if(code==='KeyC')setCam(1-camMode);
}
addEventListener('keydown',e=>{if(['Space','Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys[e.code]=true;if(!e.repeat)onKey(e.code);});
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;mouse.down=false;});
const cv=renderer.domElement;let wasLocked=false;
cv.addEventListener('mousedown',e=>{if(state!=='play'||isTouch)return;if(e.button===0){mouse.down=true;if(!document.pointerLockElement){try{const r=cv.requestPointerLock();if(r&&r.catch)r.catch(()=>{});}catch(_){}}}if(e.button===2)cycleWeapon(1);});
addEventListener('mouseup',e=>{if(e.button===0)mouse.down=false;});
cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('mousemove',e=>{if(document.pointerLockElement===cv&&state==='play'){mouse.x=clamp(mouse.x+e.movementX*.0045,-1,1);mouse.y=clamp(mouse.y-e.movementY*.0045,-1,1);}});
addEventListener('wheel',e=>{if(state==='play')cycleWeapon(e.deltaY>0?1:-1);},{passive:true});
document.addEventListener('pointerlockchange',()=>{const l=document.pointerLockElement===cv;if(!l&&wasLocked&&state==='play')pause();wasLocked=l;});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')pause();});
// touch
if(isTouch){
  $('touch').hidden=false;const joy=$('joy'),knob=$('knob');let jid=null;
  const setJ=e=>{const r=joy.getBoundingClientRect();let dx=(e.clientX-r.left-r.width/2)/(r.width/2),dy=(e.clientY-r.top-r.height/2)/(r.height/2);const L=Math.hypot(dx,dy);if(L>1){dx/=L;dy/=L;}
    touch.x=dx;touch.y=-dy;knob.style.left=(50+dx*30)+'%';knob.style.top=(50+dy*30)+'%';};
  joy.addEventListener('pointerdown',e=>{e.preventDefault();jid=e.pointerId;joy.setPointerCapture(jid);setJ(e);});
  joy.addEventListener('pointermove',e=>{if(e.pointerId===jid)setJ(e);});
  const endJ=e=>{if(e.pointerId!==jid)return;jid=null;touch.x=touch.y=0;knob.style.left=knob.style.top='50%';};
  joy.addEventListener('pointerup',endJ);joy.addEventListener('pointercancel',endJ);
  const tp=$('thrPad');let tid=null;
  const setT=e=>{if(state!=='play')return;const r=tp.getBoundingClientRect();let k=clamp(1-(e.clientY-r.top)/r.height,0,1)*1.2;if(k>1&&player.energy<=1)k=1;player.thr=k;};
  tp.addEventListener('pointerdown',e=>{e.preventDefault();tid=e.pointerId;tp.setPointerCapture(tid);setT(e);});
  tp.addEventListener('pointermove',e=>{if(e.pointerId===tid)setT(e);});
  const endT=e=>{if(e.pointerId===tid)tid=null;};tp.addEventListener('pointerup',endT);tp.addEventListener('pointercancel',endT);
  document.querySelectorAll('#tAct button').forEach(b=>{const a=b.dataset.act;
    b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(state!=='play')return;
      if(a==='fire')touch.fire=true;else if(a==='weapon')cycleWeapon(1);else if(a==='reload')startReload();
      else if(a==='flare')dropFlares();else if(a==='shield')activateShield();else if(a==='od')activateOD();else if(a==='auto'){autoFire=!autoFire;sfx('switch');}});
    const up=()=>{if(a==='fire')touch.fire=false;};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);});
}
/* ---------------- Flow ---------------- */
function clearWorld(){
  enemies.forEach(e=>scene.remove(e.obj));enemies.length=0;missiles.forEach(m=>scene.remove(m.mesh));missiles.length=0;
  powerups.forEach(u=>scene.remove(u.g));powerups.length=0;debris.forEach(d=>scene.remove(d.m));debris.length=0;flares.length=0;dmgTexts.length=0;
  if(ally){scene.remove(ally.obj);ally=null;}if(cityGroup){scene.remove(cityGroup);cityGroup=null;}radioQ.length=0;radioT=0;$('radio').hidden=true;CARRIER.visible=false;
  BULLETS.forEach(b=>{b.life=0;b.m.visible=false;});[FIRE,SMOKE].forEach(p=>p.arr.forEach(x=>{x.life=0;x.s.visible=false;}));
}
function resetGame(){
  clearWorld();
  const p=player,o=p.obj;o.visible=true;o.position.set(0,1750,-WORLD*.55);o.quaternion.identity();camQ.copy(o.quaternion);
  const PL=PLANES[planeIdx];p.P=PL;p.maxHp=PL.hp;setCam(camMode);
  Object.assign(p,{speed:(E.base+.65*E.thr)*PL.spd,thr:.65,hp:PL.hp,rp:0,rr:0,ry:0,energy:100,shieldT:0,shieldCd:0,odT:0,odCd:0,flares:3,flareRegen:0,invuln:2,alive:true,outT:0,grounded:null,gearT:0,gearRetract:0});o.userData.gear.visible=false;o.userData.gear.scale.y=1;
  W=WEAPONS.map(d=>({def:d,ammo:d.mag,reserve:d.reserve}));wIdx=0;switchT=0;reloadT=0;fireCd=0;lockCand=null;locked=null;
  wave=0;score=0;kills=0;combo=0;waveState='start';waveT=2.5;time=0;shake=0;dmgFlash=0;
  showMsg('DESPEGUE','Barbie 01 en el aire · prepárate',2.4);$('feed').innerHTML='';
}
const SCREENS=['splash','menu','hangar','controls','missions','brief','result','pause','over'];
function showScreen(id){SCREENS.forEach(s=>$(s).hidden=s!==id);if(['splash','menu','hangar','controls','missions','brief'].includes(id))view=id;if(id==='menu')updateProg();sfx('switch');
  const f=id&&$(id).querySelector('.mbtn.primary,.btn');if(f&&!isTouch)try{f.focus({preventScroll:true});}catch(e){}}
function enterMenu(){audioInit();musicStart();showScreen('menu');}
function setCam(m){camMode=m;document.body.classList.toggle('cockpit',m===1);}
function startGame(){if(state==='play')return;mode='survival';MS=null;audioInit();musicStop();camera.clearViewOffset();resetGame();applyLaunch(launchSpot(SURV_P));camQ.copy(player.obj.quaternion);showScreen(null);$('ui').hidden=false;state='play';}
function goMenu(){mode='survival';MS=null;clearWorld();state='menu';$('ui').hidden=true;hc.setTransform(DPR,0,0,DPR,0,0);hc.clearRect(0,0,HW,HH);
  if(document.pointerLockElement)document.exitPointerLock();if(A.engG)A.engG.gain.value=0;
  const o=player.obj;o.visible=true;o.position.set(0,1700,-WORLD*.55);o.quaternion.identity();showScreen('menu');musicStart();}
function pause(){if(state!=='play')return;state='pause';$('pause').hidden=false;musicStart();keys.Space=false;mouse.down=false;if(document.pointerLockElement)document.exitPointerLock();if(A.ctx&&A.engG)A.engG.gain.value=0;}
function resume(){if(state!=='pause')return;musicStop();state='play';$('pause').hidden=true;audioInit();}
function toggleMute(){A.on=!A.on;if(A.master)A.master.gain.value=A.on?.5:0;$('bMute').innerHTML=`<span class="full">SONIDO: ${A.on?'SÍ':'NO'}</span><span class="short">${A.on?'♪':'×'}</span>`;$('mSound').textContent=A.on?'SÍ':'NO';}
$('bStart').onclick=startGame;$('bAgain').onclick=startGame;$('bResume').onclick=resume;
$('splash').onclick=enterMenu;$('bHangar').onclick=()=>{hangarReturn='menu';showScreen('hangar');};$('bControls').onclick=()=>showScreen('controls');$('bSound').onclick=()=>{audioInit();toggleMute();};
$('hPrev').onclick=()=>setPlane(planeIdx-1);$('hNext').onclick=()=>setPlane(planeIdx+1);$('hFly').onclick=()=>showScreen(hangarReturn);
$('hBack').onclick=()=>showScreen(hangarReturn);$('cBack').onclick=()=>showScreen('menu');
$('bMenuP').onclick=goMenu;$('bMenuO').onclick=goMenu;
$('bRestart').onclick=()=>{$('pause').hidden=true;mode==='mission'?startMission():startGame();};
$('bCampaign').onclick=openMissions;$('bLaunchM').onclick=cycleLaunch;$('bLaunchB').onclick=cycleLaunch;updLaunchUI();$('mBack').onclick=()=>showScreen('menu');
$('bLaunch').onclick=startMission;$('bPlane').onclick=()=>{hangarReturn='brief';showScreen('hangar');};$('bBriefBack').onclick=openMissions;
$('rNext').onclick=()=>{goMenu();openBrief(curMission+1);};$('rRetry').onclick=startMission;$('rMenu').onclick=goMenu;
$('bPause').onclick=()=>state==='play'?pause():resume();$('bCam').onclick=()=>{if(state==='play')setCam(1-camMode);};
$('bCtl').onclick=()=>{setCtl(!easyCtl);sfx('switch');};$('bCtlP').onclick=()=>{setCtl(!easyCtl);sfx('switch');};setCtl(easyCtl);
$('bEra').onclick=()=>{setEra(ERA==='ww2'?'modern':'ww2');sfx('switch');};$('bMute').onclick=toggleMute;
$('optInvert').onchange=e=>{opts.invert=e.target.checked;};
/* ---------------- Loop ---------------- */
let last=performance.now(),menuA=0,wasPlaying=false;
W=WEAPONS.map(d=>({def:d,ammo:d.mag,reserve:d.reserve}));
player.obj.position.set(0,1700,-WORLD*.55);
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if((state==='play')!==wasPlaying){wasPlaying=state==='play';document.body.classList.toggle('playing',wasPlaying);}
  if(state==='play'){
    time+=dt;hitMarkT-=dt;
    updatePlayer(dt);if(player.alive){updateWeapons(dt);updateLock(dt);}
    updateEnemies(dt);updateBullets(dt);updateMissiles(dt);updateFlares(dt);updatePowerups(dt);
    updPool(FIRE,dt);updPool(SMOKE,dt);if(mode==='survival')updateWaves(dt);else updateMission(dt);updateAlly(dt);updateBaseFX(dt);updateRadio(dt);updateCamera(dt);updateDOM(dt);if(camMode===1&&player.alive)updateCockpit(dt);
    if(A.ctx&&A.engG){A.engG.gain.value=.16+(player.boosting?.12:0);if(ERA==='ww2'){A.engF.frequency.value=160+player.thr*420;A.engO.frequency.value=26+player.thr*30+player.speed*.05;}else{A.engF.frequency.value=260+Math.max(player.speed,player.thr*260)*2.2;A.engO.frequency.value=55+player.speed*.13;}}
    drawHUD();
  }else if(state==='over'||state==='result'){
    time+=dt;deadT+=dt;if(state==='over'){updateEnemies(dt);updateBullets(dt);updateMissiles(dt);updatePowerups(dt);}updPool(FIRE,dt);updPool(SMOKE,dt);updateDOM(dt);
    menuA+=dt*.25;camera.position.copy(player.obj.position).add(_v1.set(Math.sin(menuA)*140,60+deadT*10,Math.cos(menuA)*140));camera.up.set(0,1,0);camera.lookAt(player.obj.position);
    if(A.engG)A.engG.gain.value=0;hc.setTransform(DPR,0,0,DPR,0,0);hc.clearRect(0,0,HW,HH);sky.position.copy(camera.position);
  }else if(state==='menu'){
    time+=dt;menuA+=dt*.18;const o=player.obj;
    _q1.setFromAxisAngle(AY,dt*.06);o.quaternion.premultiply(_q1);o.position.addScaledVector(fwdOf(o.quaternion,_v1),140*dt);
    const J=o.userData;J.abs.forEach(m=>m.scale.set(1,1,rand(.65,.85)));spinProp(J,45,dt);J.navL.visible=J.navR.visible=(time%1.2)<.12;
    J.ails[0].rotation.x=Math.sin(time)*.15;J.ails[1].rotation.x=-Math.sin(time)*.15;
    const dist=view==='hangar'?32:view==='splash'?62:44;
    camera.position.copy(o.position).add(_v2.set(Math.sin(menuA)*dist,8+Math.sin(menuA*.7)*5,Math.cos(menuA)*dist));camera.up.set(0,1,0);camera.lookAt(o.position);
    if(camera.fov!==60){camera.fov=60;camera.updateProjectionMatrix();}
    if(HW>760&&view!=='splash')camera.setViewOffset(HW,HH,-HW*.2,0,HW,HH);else camera.clearViewOffset();
    sky.position.copy(camera.position);
  }
  renderer.clear();renderer.render(scene,camera);
  if(state==='play'&&camMode===1&&player.alive){renderer.clearDepth();renderer.render(cockScene,cockCam);}
}
renderer.autoClear=false;
setEra(ERA);
requestAnimationFrame(frame);
