/* Van Helsing · Bucle de juego: movimiento, cámara, IA de enemigos, proyectiles y partículas */
/* ---------- update ---------- */
function nearestTarget(pos){let best=null,bd=1e9;if(S.alive){bd=(P.pos.x-pos.x)**2+(P.pos.z-pos.z)**2;best={pos:P.pos,a:null}}
 for(const a of allies){const d=(a.g.position.x-pos.x)**2+(a.g.position.z-pos.z)**2;if(d<bd){bd=d;best={pos:a.g.position,a}}}return[best,Math.sqrt(bd)]}
function hurtTarget(t,d){if(t.a){t.a.hp-=d;t.a.hurt=.15}else hurtPlayer(d)}
function enemyShoot(e,tg){const R=e.ranged,count=R.count||(e.boss?(S.wave>8?7:5):1);const from=new V3(e.g.position.x,e.g.position.y+e.def.h*e.k*.78,e.g.position.z);
 const to=new V3(tg.pos.x,(tg.a?0:P.pos.y+(S.wolf?FORMS[S.form].h*.4:0))+1.1,tg.pos.z);const base=to.sub(from).normalize();SFX.cast(from);
 for(let i=0;i<count;i++){const d=base.clone().applyAxisAngle(new V3(0,1,0),(i-(count-1)/2)*.16);const r=(e.boss||R.big)?.42:.2;
  const m=sp(r,B(R.color),from.x,from.y,from.z,scene,8);m.add(glow(R.color,r*7,true,.8));
  projs.push({m,src:from.clone(),v:d.multiplyScalar(R.speed),dmg:R.dmg,life:4,r,enemy:true,color:R.color,petrify:R.petrify})}}

function update(dt){
 S.fireCd-=dt;S.inv=Math.max(0,S.inv-dt);S.fury=Math.max(0,S.fury-dt);S.slow=Math.max(0,S.slow-dt);S.stone=Math.max(0,S.stone-dt);S.hurt=Math.max(0,S.hurt-dt);S.sayCd-=dt;
 S.shake=Math.max(0,S.shake-dt*.8);S.recoil=Math.max(0,S.recoil-dt*6);S.swap=Math.max(0,S.swap-dt);
 if(hitT>0){hitT-=dt;if(hitT<=0)$('hitm').classList.remove('on')}
 S.clawCd-=dt;S.howlCd=Math.max(0,S.howlCd-dt);S.swing=Math.max(0,S.swing-dt);
 if(S.transfDelay>0){S.transfDelay-=dt;if(S.transfDelay<=0)beginTransform()}
 let tp=0;if(S.transf>0){S.transf-=dt;tp=Math.min(1,1-Math.max(0,S.transf)/2.6);S.shake=Math.max(S.shake,.06+tp*.14);if(Math.random()<dt*28)burst(new V3(P.pos.x+rand(-1,1),P.pos.y+rand(.4,2.6),P.pos.z+rand(-1,1)),Math.random()<.5?0x111114:(S.form?FORMS[S.form].aura:0x8a0a14),3,2,.8,1);if(S.transf<=0)finishTransform()}
 let moving=false,run=false;
 if(S.alive){let mx=0,mz=0;if(keys.KeyW)mz+=1;if(keys.KeyS)mz-=1;if(keys.KeyA)mx-=1;if(keys.KeyD)mx+=1;
  if(keys.ArrowLeft)P.yaw+=1.9*dt;if(keys.ArrowRight)P.yaw-=1.9*dt;if(keys.ArrowUp)P.pitch+=1.3*dt;if(keys.ArrowDown)P.pitch-=1.3*dt;
  run=keys.ShiftLeft||keys.ShiftRight;if(isTouch&&(input.jx||input.jy)){mx=input.jx;mz=-input.jy;run=Math.hypot(input.jx,input.jy)>.92}
  if(S.transf>0){mx=mz=0}const len=Math.hypot(mx,mz);if(len>1){mx/=len;mz/=len}const spd=(run?9.2:6)*(S.slow>0?.45:1)*(S.wolf?FORMS[S.form].speed:1);
  const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);
  P.pos.x+=(fx*mz+rx*mx)*spd*dt;P.pos.z+=(fz*mz+rz*mx)*spd*dt;pushOut(P.pos,S.wolf?Math.min(1.2,FORMS[S.form].r*.75):.45);
  P.vy-=22*dt;P.pos.y+=P.vy*dt;if(P.pos.y<=0){P.pos.y=0;P.vy=0;P.ground=true}
  if(S.dash>0){S.dash-=dt;P.pos.x+=S.dashX*28*dt;P.pos.z+=S.dashZ*28*dt;pushOut(P.pos,1)}if(S.pounce&&P.ground&&S.dash<=0){S.pounce=false;pounceLand()}
  moving=Math.hypot(mx,mz)>.1&&P.ground;S.bob+=moving?dt*(run?13:9):0;
  if(input.fire&&S.transf<=0)(S.wolf?formAttack():fire());
  for(let i=drops.length-1;i>=0;i--){const d=drops[i];d.t+=dt;d.life-=dt;d.inner.rotation.y+=dt*2;d.inner.position.y=Math.sin(d.t*3)*.12;
   if(Math.hypot(d.g.position.x-P.pos.x,d.g.position.z-P.pos.z)<1.4&&P.pos.y<1.5){pickup(d);scene.remove(d.g);drops.splice(i,1)}else if(d.life<=0){scene.remove(d.g);drops.splice(i,1)}}}
 if(isTouch&&input.fire&&S.alive){const f=fwd();let best=null,ba=.14;for(const e of enemies){if(e.dead||e.spawn>0)continue;const c=enemyCenter(e,new V3());const eye=new V3(P.pos.x,P.pos.y+1.65,P.pos.z),to=c.sub(eye),d=to.length();if(d>45)continue;const a=Math.acos(clamp(to.normalize().dot(f),-1,1));if(a<ba){ba=a;best=to}}
  if(best){const ty=Math.atan2(-best.x,-best.z),tp=Math.asin(clamp(best.y,-1,1));let dy=ty-P.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));const k=Math.min(1,dt*7);P.yaw+=dy*k;P.pitch+=(tp-P.pitch)*k}}
 P.pitch=clamp(P.pitch,-1.35,1.35);
 // hunter model
 hunter.g.position.copy(P.pos);hunter.g.rotation.y=P.yaw+PI;hunter.bl.position.y=-P.pos.y+.03;const hh=hunter.h;walk(hh,S.bob,moving?(run?.8:.6):0);
 hh.armR.rotation.x=-1.5-P.pitch*.9;hh.armL.rotation.x=-1.05-P.pitch*.6+Math.sin(S.bob)*.1;hunter.panels.forEach(p=>{const lg=p.side==='L'?hh.legL:hh.legR;p.g.rotation.x=lg.rotation.x*.55+(moving&&run?.12:0)+Math.sin(performance.now()/300+(p.side==='L'?0:1))*.02});
 const TP=S.third||S.wolf||S.transf>0,formOn=!!S.form&&(S.wolf||(S.transf>0&&tp>=.5)),CF=S.form?FORMS[S.form]:null;
 if(state==='playing'){vm.visible=!TP;hunter.g.visible=TP&&!formOn;hideForms(formOn?S.form:null)}
 hunter.g.scale.setScalar(S.transf>0&&tp<.5?1+tp*.6:1);if(S.transf>0&&tp<.5)hunter.g.rotation.y+=rand(-.08,.08);
 if(formOn&&CF){const m=formModel(S.form),sc=S.wolf?CF.scale:CF.scale*(.45+(tp-.5)/.5*.55);m.g.position.copy(P.pos);if(CF.hover)m.g.position.y+=CF.hover+Math.sin(performance.now()/400)*.15;m.g.rotation.y=P.yaw+PI;m.g.scale.setScalar(sc);
  m.anim(S.bob*.8,moving,S.swing>0?1-S.swing/.3:-1,S.swingSide);m.bl.position.y=(-m.g.position.y+.03)/sc}
 const wk=S.wolf?1:(S.transf>0?clamp((tp-.4)/.6,0,1):0),cH=CF?CF.camH:0,cB=CF?CF.camB:0;
 // camera
 const sh=S.shake;
 if(!TP){camera.position.set(P.pos.x+rand(-sh,sh)*.3,P.pos.y+1.65+Math.sin(S.bob)*.045,P.pos.z+rand(-sh,sh)*.3);camera.rotation.set(P.pitch+S.recoil*.03,P.yaw,0)}
 else{const f=fwd(),r=new V3(Math.cos(P.yaw),0,-Math.sin(P.yaw));const tgt=new V3(P.pos.x,P.pos.y+1.75+wk*cH,P.pos.z).addScaledVector(f,-3.6-wk*cB).addScaledVector(r,.7+wk*.7);tgt.y=Math.max(.4,tgt.y);
  camPos.lerp(tgt,1-Math.exp(-14*dt));camera.position.copy(camPos);camera.position.x+=rand(-sh,sh)*.2;camera.position.y+=rand(-sh,sh)*.2;camera.rotation.set(P.pitch+S.recoil*.02,P.yaw,0)}
 vm.position.set(.26+Math.cos(S.bob*.5)*.012,-.25-Math.abs(Math.sin(S.bob*.5))*.014-S.swap*.6,-.48+S.recoil*.07);vm.rotation.x=S.recoil*.12;
 if(muzzleFlash.visible){muzzleFlash.userData.t-=dt;if(muzzleFlash.userData.t<=0)muzzleFlash.visible=false}
 muzzleLight.intensity=Math.max(0,muzzleLight.intensity-dt*40);boomLight.intensity=Math.max(0,boomLight.intensity-dt*14);
 // waves
 if(S.inter>0){S.inter-=dt;if(S.inter<=0)startWave()}
 else{const cap=Math.min((isTouch?7:9)+S.wave,isTouch?13:18);
  if(S.toSpawn>0){S.spawnT-=dt;if(S.spawnT<=0&&enemies.length<cap){S.spawnT=Math.max(.45,1.5-S.wave*.07);S.toSpawn--;const t=pick(waveTypes()),n=TYPES[t].swarm||1,at=spawnPos();for(let i=0;i<n;i++)makeEnemy(t,1,null,[at[0]+rand(-1.5,1.5),at[1]+rand(-1.5,1.5)])}}
  else if(enemies.length===0){S.inter=4.5;banner('Oleada '+S.wave+' limpia');S.hp=Math.min(S.max,S.hp+25);allies.forEach(a=>a.hp=Math.min(a.max,a.hp+40))}}
 // enemies
 for(const e of enemies){if(e.dead)continue;curSrc=e.g.position;
  e.hurt=Math.max(0,e.hurt-dt);e.lastHit+=dt;e.g.scale.setScalar(1+e.hurt*1.3);
  if(e.spawn>0){e.spawn-=dt;e.g.position.y=e.fly-(Math.max(0,e.spawn)/.8)*e.def.h*e.k;e.anim(e.t,false,e);continue}
  if(e.burn>0){e.burn-=dt;e.hp-=12*dt;if(Math.random()<dt*10)flameP(enemyCenter(e,new V3()),new V3(rand(-.5,.5),rand(1,2),rand(-.5,.5)));if(e.hp<=0){killEnemy(e);continue}}
  const [tg,dist]=nearestTarget(e.g.position);let mv=false;
  if(tg){const dx=tg.pos.x-e.g.position.x,dz=tg.pos.z-e.g.position.z,l=dist||1;
   const R=e.ranged,keep=R&&e.def.melee===false?(e.boss?13:10):R?6:0,reach=e.def.r*e.k+.75+(S.wolf&&!tg.a?FORMS[S.form].r:0);
   let want=1;if(keep&&dist<keep-2)want=-.6;else if(keep&&dist<keep+2)want=0;if(dist<reach)want=0;
   let mx=dx/l*want,mz=dz/l*want;if(want===0&&keep&&dist>reach){mx+=-dz/l*.7*e.strafe;mz+=dx/l*.7*e.strafe}
   const canCharge=e.def.charge||(e.bossDef&&e.bossDef.special==='charge');
   if(canCharge){e.chCd-=dt;if(e.charging>0){e.charging-=dt;mx=e.chDir.x*3.2;mz=e.chDir.z*3.2;if(!e.chHit&&dist<reach+.7){e.chHit=true;hurtTarget(tg,e.def.dmg*(e.boss?2:1.4));S.shake=Math.max(S.shake,.3)}}
    else if(e.chCd<=0&&dist>6&&dist<18){e.charging=.85;e.chCd=rand(5,8);e.chDir={x:dx/l,z:dz/l};e.chHit=false;if(e.def.sound)SFX[e.def.sound](e.g.position)}}
   for(const o of enemies){if(o===e||o.dead)continue;const ox=e.g.position.x-o.g.position.x,oz=e.g.position.z-o.g.position.z,d=Math.hypot(ox,oz),m=(e.def.r*e.k+o.def.r*o.k);if(d<m&&d>1e-3){mx+=ox/d*.9;mz+=oz/d*.9}}
   const spd=e.def.speed*(1+S.wave*.018)*(e.boss?1.1:1);e.g.position.x+=mx*spd*dt;e.g.position.z+=mz*spd*dt;mv=Math.hypot(mx,mz)>.15;
   pushOut(e.g.position,e.def.r*e.k*.8,e.fly>.5);e.g.rotation.y=Math.atan2(dx,dz);
   let fy=e.fly;if(e.def.diver&&dist<7)fy=Math.min(fy,.6);e.cy+=(fy-e.cy)*Math.min(1,dt*3);
   e.mcd-=dt;
   if(e.def.melee!==false&&dist<reach+.25&&e.mcd<=0&&e.charging<=0){const dmg=e.def.dmg*(e.boss?1.7:1)*.8;hurtTarget(tg,dmg);e.mcd=(e.def.atk||1.1)*(e.boss?1.3:1);
    if(e.def.drain){e.hp=Math.min(e.max,e.hp+dmg*1.5);burst(enemyCenter(e,new V3()),0x8a0a14,4,2,.5)}}
   if(R){e.cd-=dt;if(e.cd<=0&&dist<36&&dist>2){e.cd=R.rate*rand(.8,1.25);enemyShoot(e,tg)}}
   if(e.boss){const bd=e.bossDef;e.sumCd-=dt;if(e.sumCd<=0){e.sumCd=12;for(let i=0;i<3;i++)makeEnemy(bd.summon);say(bd.name.split(',')[0],bd.special==='dracula'?'¡Hijos de la noche, a mí!':'¡Vengan, mis criaturas!',hx(bd.color))}
    if(bd.special==='dracula'){e.tpCd-=dt;if(e.tpCd<=0){e.tpCd=rand(6,9);const old=e.g.position.clone();burst(new V3(old.x,1.5,old.z),0x1a0a10,30,6,.9,-1);SFX.bats(old);
      const a=rand(0,PI*2);e.g.position.set(clamp(P.pos.x+Math.cos(a)*9,-ARENA+3,ARENA-3),0,clamp(P.pos.z+Math.sin(a)*9,-ARENA+3,ARENA-3));pushOut(e.g.position,1);
      burst(new V3(e.g.position.x,1.5,e.g.position.z),0x8a0a14,30,6,.9,-1);for(let i=0;i<2;i++)makeEnemy('murcielago',1,null,[e.g.position.x+rand(-2,2),e.g.position.z+rand(-2,2)]);
      if(Math.random()<.5)say('Drácula',pick(['¿Me buscabas, Van Helsing?','La sangre es vida.','No puedes matar lo que ya está muerto.']),'#ff4a5a')}}
    if(bd.special==='regen'&&e.lastHit>1.2&&e.hp<e.max){e.hp=Math.min(e.max,e.hp+e.max*.012*dt*10);if(Math.random()<dt)say('La Hidra','Mis cabezas vuelven a crecer...','#8dff5a')}
    if(e.fly===0){e.slamCd-=dt;if(e.slamCd<=0&&dist<7){e.slamCd=4;SFX.roar();S.shake=.35;burst(new V3(e.g.position.x,.2,e.g.position.z),0x3a3128,30,7,.8);ring(e.g.position,bd.color,13);
     if(Math.hypot(P.pos.x-e.g.position.x,P.pos.z-e.g.position.z)<7&&P.pos.y<.8)hurtPlayer(24);allies.forEach(a=>{if(a.g.position.distanceTo(e.g.position)<7)a.hp-=24})}}
    if(e.aura)e.aura.rotation.z+=dt}
   e.sndCd-=dt;if(e.sndCd<=0&&dist<30){e.sndCd=rand(6,12);const s=e.def.sound;if(s)SFX[s](e.g.position);
    if(s==='scream'&&dist<14&&!tg.a){S.slow=1.8;say(null,'El llanto te paraliza','#bfe6ff')}
    if(S.sayCd<=0&&Math.random()<.5){S.sayCd=4.5;say(e.def.name,pick(e.def.taunts),hx(e.def.blood))}}}
  e.t+=dt*(mv?1:.5);e.g.position.y=e.cy+(e.cy>.2?Math.sin(e.t*2+e.ph)*.25:0);if(e.blob){e.blob.position.y=-e.g.position.y+.03}if(e.fl)e.fl.visible=e.hurt>.06;if(e.hb){const f=clamp(e.hp/e.max,0,1);e.hb.visible=f<.999;if(e.hb.visible){const q=Math.max(.01,f);e.hbF.scale.x=e.hbW*q;e.hbF.center.x=.5/q}}e.anim(e.t,mv,e)}
 for(let i=enemies.length-1;i>=0;i--)if(enemies[i].dead)enemies.splice(i,1);
 // allies
 for(let i=allies.length-1;i>=0;i--){const a=allies[i];a.t+=dt;a.hurt=Math.max(0,a.hurt-dt);a.cd-=dt;
  if(a.hp<=0){burst(new V3(a.g.position.x,1,a.g.position.z),0x7fe0c4,30,5,1);scene.remove(a.g);allies.splice(i,1);say(a.name,'Me voy con los ancestros... sigue tú.','#4fbf7a');continue}
  let tgt=null,bd=30;for(const e of enemies){if(e.dead||e.spawn>0)continue;const d=e.g.position.distanceTo(a.g.position);if(d<bd){bd=d;tgt=e}}
  const f=fwd(),hx_=P.pos.x-f.x*2.2+Math.cos(P.yaw)*2.4*a.side,hz_=P.pos.z-f.z*2.2-Math.sin(P.yaw)*2.4*a.side;let am=false;
  if(tgt){a.g.rotation.y=Math.atan2(tgt.g.position.x-a.g.position.x,tgt.g.position.z-a.g.position.z);
   if(a.cd<=0){a.cd=.5;const from=new V3(a.g.position.x,1.4,a.g.position.z),c=enemyCenter(tgt,new V3());tracer(from,c,0x9fffc8);noise(.1,2000,vol(a.g.position,.18));hurtEnemy(tgt,22*(S.fury>0?1.5:1),c)}
   if(Math.hypot(hx_-a.g.position.x,hz_-a.g.position.z)>9){const dx=hx_-a.g.position.x,dz=hz_-a.g.position.z,l=Math.hypot(dx,dz);a.g.position.x+=dx/l*6*dt;a.g.position.z+=dz/l*6*dt;am=true}}
  else{const dx=hx_-a.g.position.x,dz=hz_-a.g.position.z,l=Math.hypot(dx,dz);if(l>.6){a.g.position.x+=dx/l*Math.min(7,l*3)*dt;a.g.position.z+=dz/l*Math.min(7,l*3)*dt;a.g.rotation.y=Math.atan2(dx,dz);am=true}}
  pushOut(a.g.position,.4);a.g.scale.setScalar(1+a.hurt);walk(a.h,a.t*8,am?.55:0)}
 // projectiles
 for(let i=projs.length-1;i>=0;i--){const p=projs[i];p.life-=dt;if(p.grav)p.v.y-=18*dt;p.m.position.addScaledVector(p.v,dt);const q=p.m.position;let done=p.life<=0;
  if(p.water||p.boom){if(q.y<=.15)done=true;for(const e of enemies){if(e.dead||e.spawn>0)continue;if(enemyCenter(e,tmpV).distanceTo(q)<e.def.hr*e.k+.2){done=true;break}}if(done){p.boom?explode(q.clone(),p.boom):explodeWater(q.clone());scene.remove(p.m);projs.splice(i,1)}continue}
  if(Math.random()<.4)burst(q,p.color,1,.6,.25,0);
  const near=Math.hypot(q.x-P.pos.x,q.z-P.pos.z)<(S.wolf?FORMS[S.form].r:.55)+p.r&&q.y>P.pos.y-.2&&q.y<P.pos.y+(S.wolf?FORMS[S.form].h:1.9);
  if(S.alive&&near){if(S.inv>0)burst(q,0x9fb8ff,6,3,.4);else{curSrc=p.src||null;hurtPlayer(p.dmg);if(p.petrify){S.slow=2.5;S.stone=2.5;say(null,'¡Te estás volviendo piedra!','#ffe14a')}}done=true}
  for(const a of allies){if(done)break;if(Math.hypot(q.x-a.g.position.x,q.z-a.g.position.z)<.55+p.r&&q.y<1.9){a.hp-=p.dmg;a.hurt=.15;done=true}}
  if(q.y<0)done=true;if(done){burst(q,p.color,6,3,.4);scene.remove(p.m);projs.splice(i,1)}}
 stepParticles(dt);
 if(KEY){KEY.target.position.set(P.pos.x,0,P.pos.z);KEY.position.copy(KEY.target.position).addScaledVector(KEY.userData.dir,70)}
 hud()}
function stepDying(dt){for(let i=dying.length-1;i>=0;i--){const d=dying[i];d.t+=dt;const k=Math.min(1,d.t/d.dur);d.g.rotation.set(0,d.ry,0);d.g.rotateOnAxis(new V3(0,0,1),d.side*k*1.35);d.g.position.y=Math.max(0,d.fly*(1-k*k));const sc=d.s*(k<.7?1:1-(k-.7)/.3);d.g.scale.setScalar(Math.max(.01,sc));if(k>=1){scene.remove(d.g);dying.splice(i,1)}}}
function stepParticles(dt){stepDying(dt);for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life-=dt;p.v.y+=p.g*dt;p.m.position.addScaledVector(p.v,dt);
  if(p.sl){p.m.material.opacity=Math.max(0,p.life/p.max*.9);if(!p.keep)p.m.scale.setScalar(1+(1-p.life/p.max)*.25)}
  else if(p.fl){p.m.scale.setScalar(.35+(1-p.life/p.max)*1.8);p.v.multiplyScalar(Math.max(0,1-dt*2.5))}
  else if(p.fb){p.m.scale.setScalar(1+(1-p.life/p.max)*10);p.m.material.opacity=Math.max(0,p.life/p.max)}
  else if(p.grow){p.m.scale.setScalar(1+(1-p.life/p.max)*p.grow);p.m.material.opacity=Math.max(0,p.life/p.max*.7)}else p.m.scale.setScalar(Math.max(.05,p.life/p.max));
  if(p.life<=0){scene.remove(p.m);if(p.fb||p.sl)p.m.material.dispose();parts.splice(i,1)}}
 for(let i=tracers.length-1;i>=0;i--){const tr=tracers[i];tr.life-=dt;tr.l.material.opacity=Math.max(0,tr.life/.07*.85);if(tr.life<=0){scene.remove(tr.l);tr.l.geometry.dispose();tr.l.material.dispose();tracers.splice(i,1)}}}
function pushOut(p,r,fly){if(!fly)for(const o of OBST){const dx=p.x-o.x,dz=p.z-o.z,m=o.r+r;if(Math.abs(dx)>m||Math.abs(dz)>m)continue;const d=Math.hypot(dx,dz);if(d<m&&d>1e-4){p.x=o.x+dx/d*m;p.z=o.z+dz/d*m}}
 const d=Math.hypot(p.x,p.z);if(d>ARENA-1){p.x*=(ARENA-1)/d;p.z*=(ARENA-1)/d}}

function ambientAnim(dt){const t=performance.now()/1000;
 if(MOON&&(MOONT||MOONK>.001)){MOONK+=(MOONT-MOONK)*Math.min(1,dt*.9);const k=MOONK;MOON.m.scale.setScalar(1+k*1.4);MOON.m.material.color.copy(MOON.c0).lerp(FULLC,k);MOON.h.material.color.copy(MOON.m.material.color);MOON.h2.material.color.copy(MOON.m.material.color);MOON.h.scale.setScalar(MOON.hs*(1+k*1.3));MOON.h2.scale.setScalar(MOON.h2s*(1+k*1.5));MOON.h.material.opacity=.55+k*.4;MOON.h2.material.opacity=.18+k*.22;if(KEY){KEY.intensity=KEY.userData.i0*(1+k*.8);KEY.color.copy(KEY.userData.c0).lerp(FULLC,k*.85)}}if(CLOUD)CLOUD.rotation.y+=dt*.005;
 for(const f of FIRES){const k=.85+Math.sin(t*13+f.ph)*.08+Math.sin(t*7.3+f.ph*2)*.07;f.c1.scale.set(1,k*1.1,1);f.c2.scale.set(1,k,1);f.g.scale.setScalar(f.base*k);if(f.l)f.l.intensity=1.35*k}
 for(const w of WISPS)w.m.position.set(w.bx+Math.sin(t*.4+w.ph)*3,1.6+Math.sin(t*1.3+w.ph)*.6,w.bz+Math.cos(t*.3+w.ph)*3);
 for(const b of BATS){const a=t*b.sp+b.ph;b.b.g.position.set(b.cx+Math.cos(a)*b.r,b.h+Math.sin(t*1.7+b.ph)*1.5,b.cz+Math.sin(a)*b.r);b.b.g.rotation.y=-a+(b.sp>0?0:PI);b.b.anim(t+b.ph)}
 for(const A of AMB){const pos=A.p.geometry.attributes.position,a=A.a,v=A.v;
  if(A.kind==='mist'){A.p.position.x=Math.sin(t*.05)*4;A.p.position.z=Math.cos(t*.04)*4;continue}
  for(let i=0;i<A.n;i++){const j=i*3;
   if(A.kind==='embers'){a[j+1]+=v[j+1]*dt*1.5;a[j]+=Math.sin(t+v[j+2])*dt*.5;if(a[j+1]>16){a[j+1]=0;a[j]=rand(-ARENA,ARENA);a[j+2]=rand(-ARENA,ARENA)}}
   else if(A.kind==='dust'){a[j]+=Math.sin(t*.3+v[j+2])*dt*.4;a[j+1]+=Math.cos(t*.4+v[j+2])*dt*.2}
   else if(A.kind==='sand'){a[j]+=dt*(5+v[j+1]*3);a[j+1]+=Math.sin(t*2+v[j+2])*dt*.3;if(a[j]>ARENA){a[j]=-ARENA;a[j+1]=rand(.1,3)}}
   else if(A.kind==='fireflies'){a[j]+=Math.sin(t*.8+v[j+2])*dt*.8;a[j+1]=1+Math.sin(t*.6+v[j+2])*.8+v[j+1]*.5;a[j+2]+=Math.cos(t*.7+v[j+2])*dt*.8}}
  pos.needsUpdate=true;if(A.kind==='fireflies')A.p.material.opacity=.6+Math.sin(t*3)*.4}}

