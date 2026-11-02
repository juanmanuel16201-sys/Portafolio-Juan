// Ace Combat · Vuelo del jugador (fácil y avanzado)
'use strict';

/* ---------------- Player ---------------- */
function hurtPlayer(d){
  if(!player.alive||player.invuln>0)return;
  if(player.shieldT>0){sfx('shieldhit');shieldMesh.material.opacity=.5;return;}
  player.hp-=d;if(MS)MS.dmg+=d;dmgFlash=Math.min(1,dmgFlash+d/120);shake=Math.min(2,shake+d/80);sfx('hit');
  if(player.hp<=0){player.hp=0;killPlayer();}
}
let dmgFlash=0,incoming=false;
function killPlayer(){player.alive=false;explode(player.obj.position,2.6);player.obj.visible=false;deadT=0;state='over';
  if(mode==='mission'&&MS){if(!MS.done||MS.result!=='win'){MS.done=true;MS.result='fail';MS.reason='Barbie 01 fue derribado.';}setTimeout(()=>{if(state==='over')showResult();},2200);return;}
  let best=0;try{best=+localStorage.getItem('acecombat-best')||0;if(score>best){best=score;localStorage.setItem('acecombat-best',score);}}catch(e){best=Math.max(best,score);}
  $('oScore').textContent=score.toLocaleString('es-CO');$('oWave').textContent=wave;$('oKills').textContent=kills;$('oBest').textContent=best.toLocaleString('es-CO');
  setTimeout(()=>{if(state==='over'){$('over').hidden=false;musicStart();if(document.pointerLockElement)document.exitPointerLock();}},1900);
}
function activateShield(force){if(!player.alive)return;if(!force&&player.shieldCd>0)return;player.shieldT=6;player.shieldCd=20;sfx('power');feed('ESCUDO ACTIVO · 6 s');}
function activateOD(force){if(!player.alive)return;if(!force&&player.odCd>0)return;player.odT=8;player.odCd=28;sfx('power');feed('OVERDRIVE · cadencia y daño aumentados');}
function updatePlayer(dt){
  const p=player,o=p.obj,q=o.quaternion,J=o.userData;
  let ip=0,ir=0,iy=0;
  if(keys.KeyW||keys.ArrowUp)ip+=1;if(keys.KeyS||keys.ArrowDown)ip-=1;
  if(keys.KeyD||keys.ArrowRight)ir+=1;if(keys.KeyA||keys.ArrowLeft)ir-=1;
  if(keys.KeyE)iy+=1;if(keys.KeyQ)iy-=1;
  ip+=mouse.y+touch.y;ir+=mouse.x+touch.x;
  if(opts.invert)ip=-ip;
  ip=clamp(ip,-1,1);ir=clamp(ir,-1,1);
  mouse.x*=Math.exp(-dt*7);mouse.y*=Math.exp(-dt*7);
  const tUp=keys.ShiftLeft||keys.ShiftRight||keys.Equal||keys.NumpadAdd||touch.thrUp,tDn=keys.KeyX||keys.Minus||keys.NumpadSubtract||touch.thrDn;
  if(tUp)p.thr+=.5*dt;if(tDn)p.thr-=.5*dt;
  p.thr=clamp(p.thr,0,p.energy>1?1.2:1);
  const boost=p.thr>1.001,S=p.P.spd;p.boosting=boost;
  if(boost)p.energy=Math.max(0,p.energy-30*((p.thr-1)/.2)*dt);else p.energy=Math.min(100,p.energy+10*dt);
  let f;
  if(p.grounded){f=groundRoll(dt,ip,ir);if(!p.alive)return;}
  else{
  f=fwdOf(q,_v2);const ag=p.P.agi;
  if(easyCtl){
    // Modo fácil: el avión gira hacia donde apuntas, se inclina solo y se nivela al soltar
    let yaw=Math.atan2(f.x,f.z),pitch=Math.asin(clamp(f.y,-1,1));
    p.tr=damp(p.tr||0,clamp(ir+iy*.5,-1,1)*1.15*ag,4.5,dt);p.pr=damp(p.pr||0,ip*.95*ag,4.5,dt);
    yaw-=p.tr*dt;pitch+=p.pr*dt;
    if(Math.abs(ip)<.06)pitch=damp(pitch,0,.45,dt);
    const agl0=o.position.y-surfaceH(o.position.x,o.position.z);
    if(agl0<170&&pitch<.05){pitch=damp(pitch,.22,2.6,dt);if(msgT<=0)showMsg('ALTITUD BAJA','Subiendo automáticamente',.8,true);}
    pitch=clamp(pitch,-1.25,1.25);
    const bt=clamp(p.tr/(1.15*ag),-1,1)*1.05,ob=p.bankA||0;p.bankA=damp(ob,bt,5,dt);
    q.setFromAxisAngle(AY,yaw).multiply(_q1.setFromAxisAngle(AX,-pitch)).multiply(_q2.setFromAxisAngle(AZ,p.bankA));
    p.rp=p.pr*1.6;p.rr=(p.bankA-ob)/Math.max(dt,1e-4)*.5;p.ry=p.tr*.4;
  }else{
  const right=_v3.set(-1,0,0).applyQuaternion(q);
  if(Math.abs(ir)<.06&&Math.abs(f.y)<.85)ir+=clamp(right.y*1.6,-.55,.55);
  p.rp=damp(p.rp,ip*1.55*ag,5,dt);p.rr=damp(p.rr,ir*2.7*ag,6,dt);p.ry=damp(p.ry,iy*.65*ag,4,dt);
  _q1.setFromAxisAngle(AX,-p.rp*dt);q.multiply(_q1);
  _q1.setFromAxisAngle(AZ,p.rr*dt);q.multiply(_q1);
  _q1.setFromAxisAngle(AY,-p.ry*dt);q.multiply(_q1);
  }
  q.normalize();
  fwdOf(q,f);
  const tgt=(boost?E.boostBase+(p.thr-1)/.2*E.boostAdd:E.base+p.thr*E.thr)*S;
  p.speed=damp(p.speed,tgt,boost?1.1:.7,dt)-f.y*E.grav*dt;p.speed=clamp(p.speed,E.minS,E.maxS*S);
  p.vel.copy(f).multiplyScalar(p.speed);o.position.addScaledVector(p.vel,dt);
  if(p.speed<E.sink)o.position.y-=(E.sink-p.speed)*.8*dt;
  p.gforce=damp(p.gforce,1+Math.abs(p.rp)*p.speed/(95*E.spd),4,dt);
  }
  updateGear(dt);
  // animations: control surfaces, afterburner, gun, lights
  J.ails[0].rotation.x=p.rr*.14;J.ails[1].rotation.x=-p.rr*.14;
  J.stabs.forEach(s=>s.rotation.x=-p.rp*.2);J.fins.forEach(s=>s.rotation.y=p.ry*.5);
  p.ab=damp(p.ab,boost?1.1+(p.thr-1)*3:.2+p.thr*.6,5,dt);
  J.abs.forEach((m,i)=>m.scale.set(1,1,p.ab*(i%2?1.1:1)*rand(.88,1.12)));
  p.gunSpin=damp(p.gunSpin,0,2.5,dt);J.gun.rotation.z+=p.gunSpin*dt;
  spinProp(J,30+p.thr*55,dt);
  if(J.exh&&Math.random()<dt*(p.boosting?40:6)){const ex=J.exh[Math.random()<.5?0:1];emit(SMOKE,localToWorld(o,ex[0],ex[1],ex[2],_v1),_v4.set(0,0,0),.6,.6,2.6,0x4a4a4a,0x9a9a9a,.45);}
  const blink=(time%1.2)<.12;J.navL.visible=J.navR.visible=blink||(time%1.2>.3&&time%1.2<.42);
  // wingtip vapor & damage smoke
  if(Math.abs(p.rp)>.85||p.speed>470*E.spd){for(const s of [J.tipX,-J.tipX])emit(SMOKE,localToWorld(o,s,0,J.tipZ-.4,_v1),_v4.set(0,0,0),.45,1,4,0xffffff,0xffffff,.45);}
  if(p.hp<p.maxHp*.4&&Math.random()<dt*30)emit(SMOKE,localToWorld(o,0,.5,-8,_v1),rv(6),1.8,4,18,0x333333,0x777777,.6,-6);
  if(p.hp<p.maxHp*.2&&Math.random()<dt*25)emit(FIRE,localToWorld(o,rand(-1,1),0,-7,_v1),rv(5),.4,4,1,0xffcc66,0xff3300,1);
  // powers
  p.invuln-=dt;p.shieldCd=Math.max(0,p.shieldCd-dt);p.odCd=Math.max(0,p.odCd-dt);
  if(p.shieldT>0){p.shieldT-=dt;shieldMesh.visible=true;shieldMesh.rotation.y+=dt*.8;shieldMesh.material.opacity=damp(shieldMesh.material.opacity,.16+Math.sin(time*9)*.04,6,dt);}else shieldMesh.visible=false;
  if(p.odT>0)p.odT-=dt;
  if(p.flares<3){p.flareRegen+=dt;if(p.flareRegen>=flareRegenT()){p.flareRegen=0;p.flares++;}}
  // terrain, ceiling, bounds
  const gh=surfaceH(o.position.x,o.position.z);
  if(!p.grounded&&o.position.y<gh+(J.gear.visible?1.4:7)){
    explode(o.position,1.2);hurtPlayer(p.shieldT>0?0:260);
    if(!p.alive)return;
    o.position.y=gh+45;_v1.copy(f);_v1.y=Math.abs(_v1.y)*.4+.35;_v1.normalize();o.lookAt(_v4.copy(o.position).add(_v1));p.rp=0;p.bankA=0;p.pr=0;p.invuln=1.2;
    showMsg('¡IMPACTO CONTRA EL TERRENO!','-260 casco',1.6,true);
  }
  if(o.position.y>5200){o.position.y=5200;if(msgT<=0)showMsg('ALTITUD MÁXIMA','Desciende para recuperar empuje',1.2);}
  const out=Math.max(Math.abs(o.position.x),Math.abs(o.position.z))>WORLD*.96;
  if(out){p.outT+=dt;if(msgT<=0)showMsg('FUERA DEL ÁREA DE COMBATE',p.outT>5?'Recibiendo daño: regresa ya':'Regresa en '+Math.ceil(5-p.outT)+' s',.6,true);if(p.outT>5)hurtPlayer(45*dt);}else p.outT=0;
}
