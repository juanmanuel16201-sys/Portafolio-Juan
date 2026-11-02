// Ace Combat · Cámara, HUD y cabina
'use strict';

/* ---------------- Camera ---------------- */
const camQ=new Q(),flipY=new Q().setFromAxisAngle(AY,Math.PI);
function updateCamera(dt){
  const o=player.obj;shake=damp(shake,0,4,dt);
  const sx=rand(-1,1)*shake*1.6,sy=rand(-1,1)*shake*1.6;
  if(camMode===1&&player.alive){o.visible=false;
    const gp=clamp((player.gforce-1)*.006,0,.05);
    head.pos.set(sx*.006,-gp+sy*.006,0);head.q.setFromEuler(_e.set(-.02+sy*.004,player.ry*.05,-player.rr*.012));
    camera.position.copy(localToWorld(o,0,1.75,4.3,_v1));camera.quaternion.copy(o.quaternion).multiply(flipY);
    camera.position.add(_v2.copy(head.pos).applyQuaternion(camera.quaternion));camera.quaternion.multiply(head.q);
    cockCam.position.copy(head.pos);cockCam.quaternion.copy(head.q);}
  else{if(player.alive)o.visible=true;
    camQ.slerp(o.quaternion,1-Math.exp(-dt*5.5));
    const off=_v1.set(0,6.5,-31).applyQuaternion(camQ);
    camera.position.copy(o.position).add(off);camera.position.x+=sx;camera.position.y+=sy;
    camera.up.set(0,1,0).applyQuaternion(camQ);
    camera.lookAt(_v2.copy(o.position).addScaledVector(fwdOf(camQ,_v3),60).addScaledVector(camera.up,3));}
  const fov=66+clamp((player.speed/E.spd-260)/280,0,1)*14;camera.fov=damp(camera.fov,fov,3,dt);camera.updateProjectionMatrix();cockCam.fov=camera.fov;cockCam.updateProjectionMatrix();
  sky.position.copy(camera.position);
}
/* ---------------- HUD ---------------- */
const hud=$('hud'),hc=hud.getContext('2d'),rc=$('radar').getContext('2d');let HW=0,HH=0,DPR=1;
function resize(){HW=innerWidth;HH=innerHeight;DPR=Math.min(devicePixelRatio||1,2);hud.width=HW*DPR;hud.height=HH*DPR;renderer.setSize(HW,HH);camera.aspect=HW/HH;camera.updateProjectionMatrix();cockCam.aspect=HW/HH;cockCam.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
let G='#86ffbd',GD='rgba(134,255,189,.5)',AMB='#ffbe55',HGLOW='rgba(134,255,189,.55)';const RED='#ff5468';
function proj(p){_v4.copy(p).project(camera);return {x:(_v4.x+1)/2*HW,y:(1-_v4.y)/2*HH,front:_v4.z<1,on:_v4.z<1&&Math.abs(_v4.x)<1&&Math.abs(_v4.y)<1};}
function edgeArrow(p,col){_v4.copy(p).applyMatrix4(camera.matrixWorldInverse);let a=Math.atan2(-_v4.y,_v4.x);if(_v4.z>0&&Math.abs(_v4.x)<1e-3)a=Math.PI/2;
  const rx=HW/2-46,ry=HH/2-60,x=HW/2+Math.cos(a)*rx,y=HH/2+Math.sin(a)*ry;
  hc.save();hc.translate(x,y);hc.rotate(a);hc.fillStyle=col;hc.beginPath();hc.moveTo(12,0);hc.lineTo(-6,-8);hc.lineTo(-2,0);hc.lineTo(-6,8);hc.closePath();hc.fill();hc.restore();}
function drawHUD(){
  const c=hc;c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,HW,HH);
  if(!player.alive)return;
  const o=player.obj,f=fwdOf(o.quaternion,new V3()),up=new V3(0,1,0).applyQuaternion(o.quaternion),rt=new V3(-1,0,0).applyQuaternion(o.quaternion);
  c.lineWidth=1.5;c.strokeStyle=G;c.fillStyle=G;c.font='12px "Share Tech Mono",monospace';c.textBaseline='middle';
  c.shadowColor=HGLOW;c.shadowBlur=6;
  const gs=proj(_v1.copy(o.position).addScaledVector(f,900));const gx=gs.x,gy=gs.y;
  // pitch ladder
  const pitch=Math.asin(clamp(f.y,-1,1))*57.3,bank=Math.atan2(-rt.y,up.y),ppd=HH/camera.fov;
  c.save();if(camMode===1){c.beginPath();c.rect(HW*.22,HH*.06,HW*.56,HH*.56);c.clip();}
  c.save();c.translate(HW/2,HH/2);c.rotate(-bank);c.globalAlpha=.75;c.textAlign='left';
  for(let d=-80;d<=80;d+=10){const y=(pitch-d)*ppd;if(Math.abs(y)>HH*.36)continue;
    if(d===0){c.beginPath();c.moveTo(-HW*.3,y);c.lineTo(-90,y);c.moveTo(90,y);c.lineTo(HW*.3,y);c.stroke();continue;}
    c.setLineDash(d<0?[6,5]:[]);c.beginPath();c.moveTo(-150,y+(d>0?7:-7));c.lineTo(-150,y);c.lineTo(-80,y);c.moveTo(80,y);c.lineTo(150,y);c.lineTo(150,y+(d>0?7:-7));c.stroke();c.setLineDash([]);
    c.fillText(Math.abs(d),156,y);c.textAlign='right';c.fillText(Math.abs(d),-156,y);c.textAlign='left';}
  c.restore();c.restore();c.globalAlpha=1;
  // gunsight
  if(ERA==='ww2'){c.beginPath();c.arc(gx,gy,44,0,6.29);c.stroke();c.beginPath();c.arc(gx,gy,2.4,0,6.29);c.fill();c.beginPath();[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{c.moveTo(gx+a*14,gy+b*14);c.lineTo(gx+a*34,gy+b*34);});c.stroke();}else{
  c.beginPath();for(let i=0;i<4;i++){const a=i*Math.PI/2+.35;c.moveTo(gx+Math.cos(a)*24,gy+Math.sin(a)*24);c.arc(gx,gy,24,a,a+.85);}c.stroke();
  c.beginPath();c.arc(gx,gy,2.2,0,6.29);c.fill();
  c.beginPath();c.moveTo(gx-38,gy);c.lineTo(gx-30,gy);c.moveTo(gx+30,gy);c.lineTo(gx+38,gy);c.moveTo(gx,gy+30);c.lineTo(gx,gy+38);c.stroke();}
  if(hitMarkT>0){c.strokeStyle='#fff';c.lineWidth=2.2;c.beginPath();[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,b])=>{c.moveTo(gx+a*8,gy+b*8);c.lineTo(gx+a*16,gy+b*16);});c.stroke();c.lineWidth=1.5;c.strokeStyle=G;}
  // heading tape
  const hdg=((Math.atan2(f.x,f.z)*57.3)+360)%360,cx=HW/2,ty=isTouch?14:30,tapeW=Math.min(240,HW*.2);
  c.textAlign='center';
  for(let dd=-40;dd<=40;dd+=5){const hv=Math.round((hdg+dd)/5)*5;const diff=((hv-hdg+540)%360)-180;const x=cx+diff*6;if(Math.abs(x-cx)>tapeW)continue;
    const n=((hv%360)+360)%360;c.beginPath();c.moveTo(x,ty);c.lineTo(x,ty+(n%15===0?10:5));c.stroke();
    if(n%30===0)c.fillText(({0:'N',90:'E',180:'S',270:'O'})[n]||String(n/10).padStart(2,'0'),x,ty+20);}
  c.beginPath();c.moveTo(cx,ty-2);c.lineTo(cx-6,ty-10);c.lineTo(cx+6,ty-10);c.closePath();c.fill();
  // speed / altitude boxes
  const bx=Math.min(HW*.3,320),by=isTouch?HH*.4:HH/2;
  const box=(x,label,val,align)=>{c.strokeRect(x-44,by-15,88,30);c.textAlign='center';c.font='bold 17px "Share Tech Mono",monospace';c.fillText(val,x,by+1);
    c.font='11px "Share Tech Mono",monospace';c.fillStyle=GD;c.fillText(label,x,by-26);c.fillStyle=G;};
  box(cx-bx,'VEL KT',Math.round(player.speed*1.944));box(cx+bx,'ALT FT',Math.round(o.position.y*3.281).toLocaleString('es-CO'));
  c.textAlign='center';c.fillStyle=player.gforce>6?AMB:GD;c.fillText('G '+player.gforce.toFixed(1),cx-bx,by+32);
  c.fillStyle=player.boosting?AMB:GD;c.fillText(player.boosting?(ERA==='ww2'?'THR WEP':'THR POSTC.'):'THR '+Math.round(player.thr*100)+'%',cx-bx,by+48);c.fillStyle=G;
  if(camMode===1){c.fillStyle=player.hp<player.maxHp*.3?RED:G;c.fillText('CASCO '+Math.ceil(player.hp),cx+bx,by+48);
    const ww=W[wIdx];c.fillStyle=ww.ammo?G:RED;if(!isTouch)c.fillText(`${ww.def.name}  ${ww.ammo}/${ww.reserve}  ${autoFire?'AUTO':'MAN'}`,gx,gy+78);c.fillStyle=G;}
  const agl=o.position.y-Math.max(terrainH(o.position.x,o.position.z),0);c.fillStyle=GD;c.fillText('RA '+Math.round(agl*3.281),cx+bx,by+32);c.fillStyle=G;
  // enemies
  const w=W[wIdx];
  incoming=missiles.some(m=>m.owner==='e'&&m.target===player);
  for(const e of enemies){if(e.dead)continue;const s=proj(e.pos),d=e.pos.distanceTo(o.position);
    if(s.on&&!(camMode===1&&s.y>HH*.6)){const sz=clamp(9000/d,11,42);c.strokeStyle=RED;c.fillStyle=RED;c.shadowColor='rgba(255,84,104,.5)';
      c.beginPath();const k=sz*.45;[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,b])=>{c.moveTo(s.x+a*sz,s.y+b*sz-b*k);c.lineTo(s.x+a*sz,s.y+b*sz);c.lineTo(s.x+a*sz-a*k,s.y+b*sz);});c.stroke();
      c.textAlign='left';c.font='11px "Share Tech Mono",monospace';if((d<2800||e===lockCand)&&!(camMode===1&&s.y>HH*.6))c.fillText(`${e.primary?'TGT · ':''}${e.T.name} ${Math.round(d)}m`,s.x+sz+5,s.y-sz+6);
      c.fillStyle='rgba(255,84,104,.25)';c.fillRect(s.x-sz,s.y+sz+5,sz*2,3);c.fillStyle=RED;c.fillRect(s.x-sz,s.y+sz+5,sz*2*Math.max(0,e.hp/e.maxHp),3);
      if(e===lockCand&&W[wIdx].def.id==='msl'){const L=locked===e;c.strokeStyle=L?RED:AMB;c.lineWidth=2;c.save();c.translate(s.x,s.y);c.rotate(Math.PI/4);const r=sz+10+(L?0:(1-lockT/.9)*30);c.strokeRect(-r/1.4,-r/1.4,r*1.41,r*1.41);c.restore();
        c.fillStyle=L?RED:AMB;c.textAlign='center';c.font='bold 13px "Share Tech Mono",monospace';c.fillText(L?'BLOQUEADO':'FIJANDO',s.x,s.y-sz-22);c.lineWidth=1.5;}
      // lead pipper for cannon
      if(wIdx===0&&d<1700*E.gunRange){const t=d/E.bullet;const lp=proj(_v1.copy(e.pos).addScaledVector(_v2.subVectors(e.vel,player.vel),t));if(lp.on){c.strokeStyle=AMB;c.beginPath();c.arc(lp.x,lp.y,6,0,6.29);c.stroke();}}
      c.strokeStyle=G;c.fillStyle=G;c.shadowColor=HGLOW;
    }else if(e.kind!=='ground'||e.primary)edgeArrow(e.pos,RED);}
  for(const t of dmgTexts){if(t.e.dead&&t.t<.3)continue;const s=proj(t.e.pos);if(!s.on)continue;c.globalAlpha=Math.min(1,t.t*2);c.fillStyle='#fff';c.textAlign='center';c.font='bold 14px "Share Tech Mono",monospace';c.fillText('-'+Math.round(t.v),s.x,s.y-50-(0.9-t.t)*40);}
  c.globalAlpha=1;c.fillStyle=G;
  if(ally&&!ally.dead){const s=proj(ally.pos),d=ally.pos.distanceTo(o.position);c.strokeStyle='#62dcff';c.fillStyle='#62dcff';
    if(s.on){c.beginPath();c.arc(s.x,s.y,16,0,6.29);c.stroke();c.textAlign='left';c.font='11px "Share Tech Mono",monospace';c.fillText(`PELÍCANO ${Math.round(d)}m`,s.x+20,s.y-8);
      c.fillStyle='rgba(98,220,255,.25)';c.fillRect(s.x-16,s.y+21,32,3);c.fillStyle='#62dcff';c.fillRect(s.x-16,s.y+21,32*ally.hp/ally.maxHp,3);}
    else edgeArrow(ally.pos,'#62dcff');c.strokeStyle=G;c.fillStyle=G;}
  if(MS&&MS.P.city){const s=proj(_v1.set(MS.P.city.x,Math.max(terrainH(MS.P.city.x,MS.P.city.z),0)+60,MS.P.city.z));
    if(s.on){c.fillStyle='#62dcff';c.strokeStyle='#62dcff';c.textAlign='center';c.font='11px "Share Tech Mono",monospace';c.fillText('PUERTO ARENA',s.x,s.y-14);c.strokeRect(s.x-6,s.y-6,12,12);c.strokeStyle=G;c.fillStyle=G;}}
  for(const u of powerups){const s=proj(u.g.position);const col='#'+PU[u.type].c.toString(16).padStart(6,'0');if(s.on){c.strokeStyle=col;c.save();c.translate(s.x,s.y);c.rotate(Math.PI/4);c.strokeRect(-7,-7,14,14);c.restore();}}
  c.strokeStyle=G;
  // incoming missile
  const inc=missiles.filter(m=>m.owner==='e'&&m.target===player);
  if(inc.length){alarmT-=1/60;if(alarmT<=0){alarmT=.55;sfx('alarm');}
    if(Math.floor(time*5)%2===0){c.fillStyle=RED;c.textAlign='center';c.font='bold 20px "Chakra Petch",sans-serif';c.fillText('MISIL ENTRANTE · F BENGALAS',cx,isTouch?HH*.56:HH*.68);}
    for(const m of inc){const s=proj(m.pos);if(s.on){c.strokeStyle=RED;c.beginPath();c.arc(s.x,s.y,10,0,6.29);c.stroke();}else edgeArrow(m.pos,RED);}c.strokeStyle=G;c.fillStyle=G;}
  if(agl<160&&f.y<-.12){c.fillStyle=Math.floor(time*6)%2?RED:AMB;c.textAlign='center';c.font='bold 22px "Chakra Petch",sans-serif';c.fillText('¡TERRENO! SUBE',cx,isTouch?HH*.5:HH*.62);c.fillStyle=G;}
  if(switchT>0){c.fillStyle=AMB;c.textAlign='center';c.font='13px "Share Tech Mono",monospace';c.fillText('CAMBIANDO A '+w.def.name,gx,gy+56);c.fillStyle=G;}
  else if(reloadT>0){c.fillStyle=AMB;c.textAlign='center';c.fillText('RECARGANDO '+Math.round((1-reloadT/reloadDur)*100)+'%',gx,gy+56);c.fillStyle=G;}
  if(w.def.id==='bomb'){if(ccipPt){const s=proj(ccipPt);if(s.front){c.strokeStyle=AMB;c.fillStyle=AMB;c.beginPath();c.moveTo(gx,gy);c.lineTo(s.x,s.y);c.stroke();c.beginPath();c.arc(s.x,s.y,12,0,6.29);c.stroke();c.beginPath();c.arc(s.x,s.y,2.5,0,6.29);c.fill();}}
    c.fillStyle=AMB;c.textAlign='center';c.font='12px "Share Tech Mono",monospace';c.fillText(ccipPt?'BOMBAS · SUÉLTALAS CON EL CÍRCULO SOBRE EL BLANCO':'BOMBAS · BAJA LA NARIZ PARA APUNTAR',gx,gy+40);c.strokeStyle=G;c.fillStyle=G;}
  if(player.grounded)drawTakeoffHUD(c,cx);
  c.shadowBlur=0;
  drawRadar(f);
}
function drawRadar(f){
  const c=rc,S=312,R=S/2-6,cx=S/2,cy=S/2,RANGE=E.radar;c.clearRect(0,0,S,S);
  c.fillStyle='rgba(7,20,28,.62)';c.beginPath();c.arc(cx,cy,R,0,6.29);c.fill();
  c.strokeStyle=GD;c.lineWidth=2;[1,.66,.33].forEach(k=>{c.beginPath();c.arc(cx,cy,R*k,0,6.29);c.stroke();});
  c.beginPath();c.moveTo(cx,cy-R);c.lineTo(cx,cy+R);c.moveTo(cx-R,cy);c.lineTo(cx+R,cy);c.stroke();
  const sweep=(time*2)%(Math.PI*2);c.fillStyle='rgba(134,255,189,.12)';c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,R,sweep-.5,sweep);c.fill();
  const fl=Math.hypot(f.x,f.z)||1,fx=f.x/fl,fz=f.z/fl,rx=-fz,rz=fx,pp=player.obj.position;
  const plot=(p,col,size,shape)=>{const dx=p.x-pp.x,dz=p.z-pp.z;let x=(dx*(-rx)+dz*(-rz))/RANGE*R,y=-(dx*fx+dz*fz)/RANGE*R;const L=Math.hypot(x,y);if(L>R-6){x*=(R-6)/L;y*=(R-6)/L;}
    c.fillStyle=col;c.beginPath();if(shape==='tri'){c.moveTo(cx+x,cy+y-size);c.lineTo(cx+x+size,cy+y+size);c.lineTo(cx+x-size,cy+y+size);}else if(shape==='sq')c.rect(cx+x-size,cy+y-size,size*2,size*2);else c.arc(cx+x,cy+y,size,0,6.29);c.fill();
    if(shape==='tri'){const dy=p.y-pp.y;if(Math.abs(dy)>150){c.font='bold 16px monospace';c.textAlign='center';c.fillText(dy>0?'▲':'▼',cx+x,cy+y-size-10);}}};
  for(const u of powerups)plot(u.g.position,'#'+PU[u.type].c.toString(16).padStart(6,'0'),5);
  for(const m of missiles)if(m.owner==='e')plot(m.pos,'#ffffff',3.5);
  plot(BASE,'#62dcff',6,'sq');if(CARRIER.visible)plot(CARRIER.position,'#62dcff',7,'sq');
  if(ally&&!ally.dead)plot(ally.pos,'#62dcff',8);if(MS&&MS.P.city)plot(MS.P.city,'#62dcff',7,'sq');
  for(const e of enemies)if(!e.dead)plot(e.pos,RED,e.type==='boss'?11:e.kind==='air'?7:e.kind==='bomber'?9:5,e.kind==='air'||e.kind==='bomber'?'tri':'sq');
  c.fillStyle=G;c.beginPath();c.moveTo(cx,cy-10);c.lineTo(cx+7,cy+8);c.lineTo(cx,cy+4);c.lineTo(cx-7,cy+8);c.closePath();c.fill();
  c.fillStyle=GD;c.font='18px "Share Tech Mono",monospace';c.textAlign='center';c.fillText((E.radar/1000).toFixed(1)+' km',cx,S-18);
}
let domT=0;
function updateDOM(dt){
  $('vignette').style.opacity=dmgFlash.toFixed(2);dmgFlash=damp(dmgFlash,0,3,dt);
  if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').style.opacity=0;}
  domT-=dt;if(domT>0)return;domT=.08;
  const p=player;
  $('sWave').textContent=wave;$('sScore').textContent=score.toLocaleString('es-CO');$('sKills').textContent=kills;$('sHost').textContent=enemies.filter(e=>!e.dead).length;
  if(mode==='mission'&&MS){const tl=Math.max(0,Math.ceil(MS.timeLeft));$('lWave').textContent='TIEMPO';$('sWave').textContent=fmtT(tl);$('sWave').style.color=tl<30?'#ff5468':'';
    $('oCode').textContent=MS.def.code+' · '+MS.def.name;$('oTxt').textContent=MS.done?(MS.result==='win'?'Misión cumplida':'Misión fallida'):player.grounded?'Despega para iniciar la misión':MS.def.status();$('obj').hidden=false;}
  else{$('lWave').textContent='OLEADA';$('sWave').style.color='';$('obj').hidden=true;}
  $('hpNum').textContent=Math.ceil(p.hp);$('hpMax').textContent='/ '+p.maxHp;
  $('thrNum').textContent=(p.boosting?(ERA==='ww2'?'WEP ':'POSTC. '):'')+Math.round(p.thr*100)+'%';$('thBar').style.width=(p.thr/1.2*100)+'%';$('thWrap').classList.toggle('ab',p.boosting);$('hpBar').style.width=(p.hp/p.maxHp*100)+'%';$('hpWrap').classList.toggle('low',p.hp<p.maxHp*.3);
  $('enBar').style.width=p.energy+'%';
  const chip=(id,act,cd,max)=>{const el=$(id);el.classList.toggle('active',act);el.classList.toggle('ready',!act&&cd<=0);el.classList.toggle('wait',!act&&cd>0);el.style.setProperty('--cd',act?1:cd>0?1-cd/max:1);};
  chip('cShield',p.shieldT>0,p.shieldCd,20);chip('cOd',p.odT>0,p.odCd,28);
  const fe=$('cFlare');fe.firstChild.textContent=(ERA==='ww2'?'EXTINTOR ×':'BENGALAS ×')+p.flares;fe.classList.toggle('ready',p.flares>0);fe.classList.toggle('wait',p.flares===0);fe.style.setProperty('--cd',p.flares>0?1:p.flareRegen/flareRegenT());
  const md=$('mode');md.textContent=autoFire?'DISPARO AUTOMÁTICO · T':'DISPARO MANUAL · T';md.classList.toggle('auto',autoFire);
  W.forEach((w,i)=>{const s=$('slot'+i);s.classList.toggle('on',i===wIdx);s.classList.toggle('empty',w.ammo===0);
    s.querySelector('.am b').textContent=w.ammo;s.querySelector('.am small').textContent=' / '+w.reserve;
    s.querySelector('.rl i').style.width=(i===wIdx&&reloadT>0?(1-reloadT/reloadDur)*100:w.ammo/w.def.mag*100)+'%';});
  if(isTouch){const ww=W[wIdx];$('mHpN').textContent=Math.ceil(p.hp);$('mHp').style.width=(p.hp/p.maxHp*100)+'%';$('mHpWrap').classList.toggle('low',p.hp<p.maxHp*.3);
    $('mW').textContent=reloadT>0?'RECARGANDO…':ww.def.name;$('mAmmo').textContent=ww.ammo+' / '+ww.reserve;const mm=$('mMode');mm.textContent=autoFire?'AUTO':'MAN';mm.classList.toggle('auto',autoFire);
    $('thrFill').style.height=(p.thr/1.2*100)+'%';$('thrPad').classList.toggle('ab',p.boosting);
    const tb=(id,on,wait)=>{const b=$(id);b.classList.toggle('on',on);b.classList.toggle('wait',wait);};
    tb('tShield',p.shieldT>0,p.shieldCd>0&&p.shieldT<=0);tb('tOd',p.odT>0,p.odCd>0&&p.odT<=0);tb('tAuto',autoFire,false);tb('tFlare',false,p.flares===0);
    $('tFlare').textContent=(ERA==='ww2'?'EXTINT. ':'BENG. ')+p.flares;}
}
/* ---------------- Cockpit (primera persona) ---------------- */
const cockSun=new THREE.DirectionalLight(0xfff0d8,1.15),cockHemi=new THREE.HemisphereLight(0xd6e8ff,0x2a3028,.55);
cockScene.add(cockSun,cockHemi,new THREE.AmbientLight(0x3a4450,.45));
function canvasTex(w,h){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const tex=new THREE.CanvasTexture(cv);return {cv,ctx:cv.getContext('2d'),tex};}
const CK={mfd:[],lights:{},sw:[],swl:[],leds:[]};
(function buildCockpit(){
  const S=cockScene,gcache={};
  const mPanel=new THREE.MeshStandardMaterial({color:0x2e353b,roughness:.85,metalness:.15,flatShading:true});CK.mPanel=mPanel;
  const mDark=new THREE.MeshStandardMaterial({color:0x171b1f,roughness:.9,metalness:.1,flatShading:true});
  const mFrame=new THREE.MeshStandardMaterial({color:0x434a51,roughness:.45,metalness:.65,flatShading:true});
  const mGrip=new THREE.MeshStandardMaterial({color:0x101214,roughness:.7});
  const mGlove=new THREE.MeshStandardMaterial({color:0x4a3a2c,roughness:.9,flatShading:true});
  const mSuit=new THREE.MeshStandardMaterial({color:0x4d5a3c,roughness:.95,flatShading:true});
  const mYel=new THREE.MeshStandardMaterial({color:0xd8b02a,roughness:.6});
  const box=(w,h,d,m,x,y,z,par=S)=>{const k=w+'_'+h+'_'+d;const g=gcache[k]||(gcache[k]=new THREE.BoxGeometry(w,h,d));const me=new THREE.Mesh(g,m);me.position.set(x,y,z);par.add(me);return me;};
  const led=c=>new THREE.MeshBasicMaterial({color:c});
  // glare shield + panel
  const gs=box(1.34,.05,.34,mDark,0,-.19,-.86);gs.rotation.x=.08;
  const pan=new THREE.Group();pan.position.set(0,-.4,-.84);pan.rotation.x=-.3;S.add(pan);
  box(1.44,.46,.06,mPanel,0,0,0,pan);
  box(1.44,.012,.07,mFrame,0,.23,0,pan);
  [-.42,0,.42].forEach(x=>{
    box(.31,.31,.03,mDark,x,-.03,.04,pan);
    const t=canvasTex(256,256);const scr=new THREE.Mesh(new THREE.PlaneGeometry(.255,.255),new THREE.MeshBasicMaterial({map:t.tex}));scr.position.set(x,-.03,.057);pan.add(scr);CK.mfd.push(t);
    for(let k=0;k<5;k++){const o=-.1+k*.05;box(.03,.016,.012,mGrip,x+o,.142,.058,pan);box(.03,.016,.012,mGrip,x+o,-.202,.058,pan);
      box(.016,.03,.012,mGrip,x-.165,-.03+o,.058,pan);box(.016,.03,.012,mGrip,x+.165,-.03+o,.058,pan);}
  });
  // up-front control panel
  box(.2,.07,.03,mDark,0,.185,.045,pan);
  for(let r=0;r<2;r++)for(let k=0;k<5;k++)box(.026,.022,.014,mGrip,-.07+k*.035,.172+r*.03,.065,pan);
  // warning lights
  [['caution','PRECAUCIÓN','#ffb020',-.53],['msl','MISIL','#ff3040',-.42],['lock','BLOQUEO','#ff3040',-.31],['ab','POSTCOMB.','#ff8a20',.31],['shield','ESCUDO','#40d0ff',.42],['od','OVERDRIVE','#ff50d8',.53]].forEach(([id,txt,col,x])=>{
    const t=canvasTex(128,40),c=t.ctx;c.fillStyle='#050505';c.fillRect(0,0,128,40);c.strokeStyle='#333';c.strokeRect(1,1,126,38);
    c.fillStyle=col;c.font='bold 18px "Share Tech Mono",monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(txt,64,21);t.tex.needsUpdate=true;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(.1,.032),new THREE.MeshBasicMaterial({map:t.tex,color:0x2a2a2a}));m.position.set(x,.19,.034);pan.add(m);CK.lights[id]=m;});
  // HUD combiner
  box(.01,.1,.01,mFrame,-.155,-.13,-.86);box(.01,.1,.01,mFrame,.155,-.13,-.86);box(.32,.008,.01,mFrame,0,-.08,-.865);
  // canopy frame & sills
  const bow=new THREE.Mesh(new THREE.TorusGeometry(.8,.026,6,48,Math.PI),mFrame);bow.position.set(0,-.2,-.96);S.add(bow);
  const bow2=new THREE.Mesh(new THREE.TorusGeometry(.84,.018,6,48,Math.PI),mFrame);bow2.position.set(0,-.2,.35);S.add(bow2);
  [-1,1].forEach(s=>{box(.05,.05,1.9,mFrame,s*.8,-.2,-.2);box(.08,.34,1.7,mPanel,s*.84,-.4,-.2);});
  // side consoles
  [-1,1].forEach(s=>{box(.32,.1,.75,mPanel,s*.58,-.58,-.35);
    for(let k=0;k<12;k++){const col=k%4,row=Math.floor(k/4);box(.034,.014,.034,(k===5||k===10)?mYel:mGrip,s*(.49+col*.06),-.525,-.62+row*.09);}
    for(let k=0;k<3;k++){const l=box(.016,.016,.016,led(0x220000),s*(.72),-.522,-.6+k*.05);CK.leds.push(l);}
  });
  // left sub-panel: power switches
  const lp=new THREE.Group();lp.position.set(-.78,-.43,-.66);lp.rotation.y=.62;lp.rotation.x=-.2;S.add(lp);
  box(.22,.3,.04,mPanel,0,0,0,lp);
  ['ESC','OVD','BNG'].forEach((txt,i)=>{const y=.09-i*.09;box(.05,.04,.02,mDark,-.03,y,.03,lp);
    const sw=new THREE.Group();sw.position.set(-.03,y,.045);lp.add(sw);box(.012,.05,.012,mFrame,0,.025,0,sw);CK.sw.push(sw);
    const l=box(.022,.022,.012,led(0x0a2a10),.06,y,.03,lp);CK.swl.push(l);});
  // right sub-panel: weapon selector knob + auto switch
  const rp=new THREE.Group();rp.position.set(.78,-.43,-.66);rp.rotation.y=-.62;rp.rotation.x=-.2;S.add(rp);
  box(.22,.3,.04,mPanel,0,0,0,rp);
  CK.knob=new THREE.Group();CK.knob.position.set(0,.05,.03);rp.add(CK.knob);
  const kg=new THREE.Mesh(new THREE.CylinderGeometry(.04,.045,.035,16),mGrip);kg.rotation.x=Math.PI/2;CK.knob.add(kg);box(.012,.05,.012,mYel,0,.018,.022,CK.knob);
  for(let i=0;i<3;i++){const a=i*.9;box(.012,.012,.008,led(0x86ffbd),Math.sin(a)*.065,.05+Math.cos(a)*.065,.025,rp);}
  CK.autoSw=new THREE.Group();CK.autoSw.position.set(0,-.08,.045);rp.add(CK.autoSw);box(.05,.04,.02,mDark,0,-.08,.03,rp);box(.012,.05,.012,mFrame,0,.025,0,CK.autoSw);
  CK.autoL=box(.022,.022,.012,led(0x2a1a00),.06,-.08,.03,rp);
  // throttle (left hand)
  box(.07,.04,.36,mDark,-.48,-.51,-.45);
  CK.thr=new THREE.Group();CK.thr.position.set(-.48,-.5,-.45);S.add(CK.thr);
  box(.026,.16,.026,mFrame,0,.08,0,CK.thr);
  box(.075,.06,.11,mGrip,0,.17,0,CK.thr);
  CK.abLed=box(.018,.018,.018,led(0x301000),.045,.18,-.02,CK.thr);
  const gl1=new THREE.Mesh(new THREE.SphereGeometry(.055,10,8),mGlove);gl1.scale.set(.85,.65,1);gl1.position.set(-.012,.2,0);CK.thr.add(gl1);
  box(.05,.05,.26,mSuit,-.025,.19,.17,CK.thr);
  // side stick (right hand)
  box(.08,.03,.08,mDark,.48,-.53,-.47);
  CK.stick=new THREE.Group();CK.stick.position.set(.48,-.52,-.47);S.add(CK.stick);
  const sh=new THREE.Mesh(new THREE.CylinderGeometry(.014,.018,.16,8),mFrame);sh.position.y=.08;CK.stick.add(sh);
  const grip=box(.05,.12,.058,mGrip,0,.2,0,CK.stick);grip.rotation.x=.18;
  CK.trig=box(.014,.026,.016,led(0x401010),0,.19,-.036,CK.stick);
  box(.022,.012,.022,mFrame,0,.265,-.008,CK.stick);
  const gl2=new THREE.Mesh(new THREE.SphereGeometry(.058,10,8),mGlove);gl2.scale.set(.75,.95,.85);gl2.position.set(.01,.2,.012);CK.stick.add(gl2);
  box(.05,.05,.26,mSuit,.03,.17,.17,CK.stick);
})();
let flareFlick=0;
function setLight(id,on){CK.lights[id].material.color.setHex(on?0xffffff:0x262626);}
function updateCockpit(dt){
  const p=player,ag=p.P.agi;
  CK.stick.rotation.x=clamp(p.rp/(1.55*ag),-1,1)*.3;CK.stick.rotation.z=-clamp(p.rr/(2.7*ag),-1,1)*.3;
  CK.thr.rotation.x=lerp(.4,-.5,p.thr/1.2);
  CK.trig.material.color.setHex(time-lastShot<.09?0xff3a3a:0x401010);
  CK.abLed.material.color.setHex(p.boosting?0xff8a20:0x301000);
  CK.knob.rotation.z=damp(CK.knob.rotation.z,-wIdx*.9,10,dt);
  CK.autoSw.rotation.x=damp(CK.autoSw.rotation.x,autoFire?-.6:.6,12,dt);CK.autoL.material.color.setHex(autoFire?0xffbe55:0x2a1a00);
  flareFlick-=dt;
  const act=[p.shieldT>0,p.odT>0,flareFlick>0],cd=[p.shieldCd>0,p.odCd>0,p.flares===0],on=[0x40d0ff,0xff50d8,0xffffff];
  CK.sw.forEach((s,i)=>{s.rotation.x=damp(s.rotation.x,act[i]?-.6:.6,12,dt);CK.swl[i].material.color.setHex(act[i]?on[i]:cd[i]?0x3a0a0a:0x1f8f40);});
  const blink=Math.floor(time*4)%2===0;
  setLight('caution',p.hp<p.maxHp*.3&&blink);setLight('msl',incoming&&blink);setLight('lock',!!locked);setLight('ab',p.boosting);setLight('shield',p.shieldT>0);setLight('od',p.odT>0);
  CK.leds.forEach((l,i)=>l.material.color.setHex(Math.sin(time*(1.3+i*.7)+i)>.6?0xff3020:0x220000));
  _q1.copy(camera.quaternion).invert();cockSun.position.copy(sunDir).applyQuaternion(_q1);cockHemi.position.copy(AY).applyQuaternion(_q1);
  mfdT-=dt;if(mfdT<=0){mfdT=.1;drawMFDs();CK.mfd.forEach(m=>m.tex.needsUpdate=true);}
}
function mfdFrame(c,title,right,rc2='#86ffbd'){c.fillStyle='#030806';c.fillRect(0,0,256,256);c.strokeStyle='rgba(134,255,189,.5)';c.lineWidth=2;c.strokeRect(3,3,250,250);
  c.font='bold 17px "Share Tech Mono",monospace';c.textBaseline='middle';c.fillStyle='#86ffbd';c.textAlign='left';c.fillText(title,10,18);c.textAlign='right';c.fillStyle=rc2;c.fillText(right,246,18);}
function drawMFDs(){
  if(ERA==='ww2'){drawGauges();return;}
  const p=player,o=p.obj,f=fwdOf(o.quaternion,new V3()),up=new V3(0,1,0).applyQuaternion(o.quaternion),rt=new V3(-1,0,0).applyQuaternion(o.quaternion);
  // left: radar
  let c=CK.mfd[0].ctx;mfdFrame(c,'RDR','3.6 KM');c.drawImage($('radar'),28,32,200,200);
  c.textAlign='center';c.fillStyle=enemies.some(e=>!e.dead)?'#ff5468':'#86ffbd';c.fillText(enemies.filter(e=>!e.dead).length+' HOSTILES',128,242);
  // center: attitude
  c=CK.mfd[1].ctx;const hdg=((Math.atan2(f.x,f.z)*57.3)+360)%360;mfdFrame(c,Math.round(p.speed*1.944)+'KT',Math.round(o.position.y*3.281)+'FT');
  const pitch=Math.asin(clamp(f.y,-1,1))*57.3,bank=Math.atan2(-rt.y,up.y);
  c.save();c.beginPath();c.arc(128,132,88,0,6.29);c.clip();c.translate(128,132);c.rotate(-bank);const off=pitch*2.8;
  c.fillStyle='#2d69b0';c.fillRect(-200,-400+off,400,400);c.fillStyle='#6b4a28';c.fillRect(-200,off,400,400);
  c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(-200,off);c.lineTo(200,off);c.stroke();
  c.fillStyle='#fff';c.font='12px monospace';c.textAlign='right';
  for(let d=-60;d<=60;d+=10){if(!d)continue;const y=off-d*2.8;const w=d%20===0?34:18;c.beginPath();c.moveTo(-w,y);c.lineTo(w,y);c.stroke();if(d%20===0)c.fillText(Math.abs(d),-w-4,y);}
  c.restore();
  c.strokeStyle='#ffd040';c.lineWidth=4;c.beginPath();c.moveTo(76,132);c.lineTo(110,132);c.lineTo(118,140);c.moveTo(180,132);c.lineTo(146,132);c.lineTo(138,140);c.stroke();c.fillStyle='#ffd040';c.fillRect(126,130,5,5);
  c.strokeStyle='#86ffbd';c.lineWidth=2;c.beginPath();c.arc(128,132,88,0,6.29);c.stroke();
  c.save();c.translate(128,132);c.rotate(-bank);c.fillStyle='#fff';c.beginPath();c.moveTo(0,-88);c.lineTo(-6,-78);c.lineTo(6,-78);c.closePath();c.fill();c.restore();
  c.font='bold 15px "Share Tech Mono",monospace';c.fillStyle='#86ffbd';c.textAlign='left';c.fillText('G '+p.gforce.toFixed(1),10,240);
  c.textAlign='center';c.fillText('HDG '+String(Math.round(hdg)%360).padStart(3,'0'),128,240);
  c.textAlign='right';c.fillStyle=p.boosting?'#ffbe55':'#86ffbd';c.fillText('THR '+Math.round(p.thr*100)+'%',246,240);
  // right: stores / engine
  c=CK.mfd[2].ctx;mfdFrame(c,'SMS',autoFire?'AUTO':'MAN',autoFire?'#ffbe55':'#86ffbd');
  c.strokeStyle='#86ffbd';c.lineWidth=2;c.beginPath();c.moveTo(128,40);c.lineTo(138,70);c.lineTo(214,96);c.lineTo(214,104);c.lineTo(138,98);c.lineTo(136,118);c.lineTo(120,118);c.lineTo(118,98);c.lineTo(42,104);c.lineTo(42,96);c.lineTo(118,70);c.closePath();c.stroke();
  o.userData.msl.forEach((m,i)=>{const s=i%2?1:-1,k=i>>1;c.beginPath();c.arc(128+s*(34+k*20),92+k*2,6,0,6.29);if(m.visible){c.fillStyle='#ffffff';c.fill();}else{c.strokeStyle='#555';c.stroke();}});
  c.font='bold 15px "Share Tech Mono",monospace';
  W.forEach((w,i)=>{const y=140+i*22;const sel=i===wIdx;if(sel){c.fillStyle='rgba(134,255,189,.2)';c.fillRect(8,y-10,240,20);}
    c.fillStyle=w.ammo?(sel?'#e9fff2':'#86ffbd'):'#ff5468';c.textAlign='left';c.fillText((i+1)+' '+w.def.name,12,y);c.textAlign='right';c.fillText(w.ammo+'/'+w.reserve,244,y);});
  if(reloadT>0){c.fillStyle='#ffbe55';c.fillRect(8,203,240*(1-reloadT/reloadDur),3);}
  c.textAlign='left';c.fillStyle=p.hp<p.maxHp*.3?'#ff5468':'#86ffbd';c.fillText('CASCO',12,220);c.fillStyle='rgba(134,255,189,.15)';c.fillRect(80,214,166,10);
  c.fillStyle=p.hp<p.maxHp*.3?'#ff5468':'#86ffbd';c.fillRect(80,214,166*p.hp/p.maxHp,10);
  c.fillStyle='#62dcff';c.fillText('POSTC',12,242);c.fillStyle='rgba(98,220,255,.15)';c.fillRect(80,236,110,10);c.fillStyle='#62dcff';c.fillRect(80,236,110*p.energy/100,10);
  c.fillStyle='#e9fff2';c.textAlign='right';c.fillText('BNG '+p.flares,246,242);
}
