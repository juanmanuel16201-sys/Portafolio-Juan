// Ace Combat · Base aérea, portaaviones y despegue
'use strict';

/* ---------------- Base aérea Cóndor y portaaviones Bastión ---------------- */
const _q2=new Q(),_vF=new V3();
const DECK=22,CARRIER=new THREE.Group();CARRIER.visible=false;scene.add(CARRIER);
const BASEG=new THREE.Group();
const PARKED=[];
function rebuildParked(){PARKED.forEach(r=>{r[0].remove(r[6]);r[6]=parkedJet(r[0],r[1],r[2],r[3],r[4],r[5],false);});}
function parkedJet(par,i,x,y,z,yaw,reg=true){const P=PLANES[i%PLANES.length],j=makePlane(P);j.userData.gear.visible=true;j.userData.abs.forEach(m=>m.visible=false);
  j.position.set(x,y+2.6*P.scale,z);j.rotation.y=yaw;par.add(j);if(reg)PARKED.push([par,i,x,y,z,yaw,j]);return j;}
(function buildBase(){
  const B=BASE,g=BASEG;g.position.set(B.x,B.h,B.z);g.rotation.y=B.yaw;scene.add(g);
  const cv=document.createElement('canvas');cv.width=128;cv.height=2048;const c=cv.getContext('2d');
  c.fillStyle='#3a3d41';c.fillRect(0,0,128,2048);
  for(let i=0;i<700;i++){c.fillStyle=Math.random()<.5?'rgba(0,0,0,.07)':'rgba(255,255,255,.035)';c.fillRect(rand(0,128),rand(0,2048),rand(2,14),rand(4,40));}
  for(let i=0;i<40;i++){c.fillStyle='rgba(15,15,15,.18)';c.fillRect(rand(40,88),rand(150,500),rand(3,8),rand(30,120));c.fillRect(rand(40,88),rand(1548,1900),rand(3,8),rand(30,120));}
  c.fillStyle='#eceff1';c.fillRect(5,0,2,2048);c.fillRect(121,0,2,2048);
  for(let y=240;y<1800;y+=50)c.fillRect(62,y,3,28);
  for(let k=0;k<8;k++){c.fillRect(12+k*13.5,10,8,64);c.fillRect(12+k*13.5,2048-74,8,64);}
  [330,420,1628,1718].forEach(y=>{c.fillRect(30,y,12,30);c.fillRect(86,y,12,30);});
  c.font='bold 46px "Chakra Petch",sans-serif';c.textAlign='center';c.textBaseline='middle';
  c.fillText(B.num,64,128);c.save();c.translate(64,2048-128);c.rotate(Math.PI);c.fillText(B.num2,0,0);c.restore();
  const tex=new THREE.CanvasTexture(cv);tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const off={polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2};
  const rw=new THREE.Mesh(new THREE.PlaneGeometry(B.Wd,B.L).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial(Object.assign({map:tex,roughness:.95},off)));rw.position.y=.05;g.add(rw);
  const ap=new THREE.Mesh(new THREE.PlaneGeometry(230,900).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial(Object.assign({color:0x5b6066,roughness:.95},off)));ap.position.set(B.Wd/2+120,.04,-120);g.add(ap);
  const tw=new THREE.Mesh(new THREE.PlaneGeometry(26,40).rotateX(-Math.PI/2),ap.material);tw.position.set(B.Wd/2+5,.045,-B.L/2+70);g.add(tw);
  const mGrey=new THREE.MeshStandardMaterial({color:0xc9c5bb,roughness:.9,flatShading:true});
  const box=(w,h,d,m,x,y,z)=>{const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);me.position.set(x,y,z);g.add(me);return me;};
  box(11,30,11,mGrey,235,15,180);box(16,6,16,M.glass,235,33,180);box(17,1.2,17,mGrey,235,36.6,180);box(.4,9,.4,M.dark,235,41.5,180);
  BASEG.userData.beacon=box(1.2,1.2,1.2,new THREE.MeshBasicMaterial({color:0xff3030}),235,46.4,180);
  box(30,9,22,mGrey,250,4.5,140);
  [-520,-380,-240].forEach(z=>{const h=makeGround('hangar');h.position.set(230,0,z);h.rotation.y=Math.PI/2;g.add(h);});
  const tk=makeGround('tank');tk.position.set(240,0,-650);g.add(tk);
  [[105,-80],[105,-30],[105,20],[105,70],[150,-160]].forEach(([x,z],i)=>parkedJet(g,i,x,0,z,-Math.PI/2));
  const n=Math.floor(B.L/60)+1,li=new THREE.InstancedMesh(new THREE.BoxGeometry(.9,.7,.9),new THREE.MeshBasicMaterial({color:0xfff2c4}),n*2+24),m4=new THREE.Matrix4();let k=0;
  for(let i=0;i<n;i++){const z=-B.L/2+i*60;m4.makeTranslation(B.Wd/2+2,.35,z);li.setMatrixAt(k++,m4);m4.makeTranslation(-B.Wd/2-2,.35,z);li.setMatrixAt(k++,m4);}
  for(let i=0;i<12;i++){m4.makeTranslation(-B.Wd/2+i*B.Wd/11,.35,-B.L/2-3);li.setMatrixAt(k++,m4);m4.makeTranslation(-B.Wd/2+i*B.Wd/11,.35,B.L/2+3);li.setMatrixAt(k++,m4);}
  li.count=k;g.add(li);
  const pole=box(.4,10,.4,M.dark,B.Wd/2+40,5,-B.L/2+260);
  const sock=new THREE.Mesh(new THREE.ConeGeometry(1.1,6,10,1,true),new THREE.MeshStandardMaterial({color:0xff7a1a,side:THREE.DoubleSide}));sock.rotation.z=Math.PI/2;sock.position.set(B.Wd/2+43,9.4,-B.L/2+260);g.add(sock);
})();
(function buildCarrier(){
  const C=CARRIER,U=C.userData,conv=p=>p.map(([x,z])=>[x,-z]);
  const mHull=new THREE.MeshStandardMaterial({color:0x5d666e,roughness:.7,metalness:.3,flatShading:true});
  const mDeck=new THREE.MeshStandardMaterial({color:0x3d4146,roughness:.92,flatShading:true});
  const hg=flat(conv([[-22,-150],[22,-150],[27,40],[16,128],[0,153],[-16,128],[-27,40]]),34);hg.translate(0,4,0);C.add(new THREE.Mesh(hg,mHull));
  const dg=flat(conv([[-30,-150],[34,-150],[40,-60],[40,30],[24,128],[0,150],[-22,130],[-32,40]]),1.6);dg.translate(0,DECK-.8,0);C.add(new THREE.Mesh(dg,mDeck));
  const cv=document.createElement('canvas');cv.width=256;cv.height=1024;const c=cv.getContext('2d');
  const px=x=>(x+40)/80*256,py=z=>(z+150)/300*1024;
  c.lineCap='round';c.strokeStyle='#eceff1';c.lineWidth=3;c.beginPath();c.moveTo(px(-12),py(-148));c.lineTo(px(26),py(36));c.moveTo(px(12),py(-148));c.lineTo(px(38),py(-10));c.stroke();
  c.setLineDash([16,14]);c.beginPath();c.moveTo(px(0),py(-148));c.lineTo(px(32),py(12));c.stroke();c.setLineDash([]);
  c.strokeStyle='#e8c33a';c.lineWidth=2.5;c.beginPath();c.moveTo(px(-30),py(-120));c.lineTo(px(-30),py(120));c.moveTo(px(-20),py(-60));c.lineTo(px(4),py(10));c.stroke();
  c.strokeStyle='#1a1c1f';c.lineWidth=4;c.beginPath();c.moveTo(px(-4),py(-12));c.lineTo(px(-4),py(144));c.moveTo(px(14),py(-4));c.lineTo(px(14),py(140));c.stroke();
  c.strokeStyle='#9aa0a6';c.lineWidth=1.2;c.beginPath();c.moveTo(px(-4),py(-12));c.lineTo(px(-4),py(144));c.moveTo(px(14),py(-4));c.lineTo(px(14),py(140));c.stroke();
  c.fillStyle='#eceff1';c.font='bold 64px "Chakra Petch",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('77',px(6),py(112));
  const tex=new THREE.CanvasTexture(cv);tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  const mk=new THREE.Mesh(new THREE.PlaneGeometry(80,300).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:tex,transparent:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,depthWrite:false}));
  mk.position.y=DECK+.03;C.add(mk);
  const box=(w,h,d,m,x,y,z,par=C)=>{const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);me.position.set(x,y,z);par.add(me);return me;};
  box(8,16,30,mHull,-26,DECK+8,-30);box(8.4,2.6,22,M.glass,-26,DECK+13.5,-28);box(7,4,16,mHull,-26,DECK+18,-32);
  box(.6,14,.6,M.dark,-26,DECK+27,-32);box(3.4,.4,.4,M.dark,-26,DECK+30,-32);
  box(2.4,2,.3,new THREE.MeshBasicMaterial({color:0xeceff1}),-21.8,DECK+9,-22).rotation.y=Math.PI/2;
  U.radar=new THREE.Group();U.radar.position.set(-26,DECK+21,-24);C.add(U.radar);box(6,2.4,.4,mHull,0,0,0,U.radar);
  U.jbd=new THREE.Group();U.jbd.position.set(-4,DECK,-26);C.add(U.jbd);box(18,.5,8,mHull,0,.25,-4,U.jbd);U.jbdT=0;
  [[-14,-118,0],[-14,-92,0],[22,-120,.3],[26,-80,.6]].forEach(([x,z,r],i)=>parkedJet(C,i+1,x,DECK,z,Math.PI+r));
  U.beacon=box(.8,.8,.8,new THREE.MeshBasicMaterial({color:0xff3030}),-26,DECK+34.4,-32);
})();
function carrierLocal(x,z){const dx=x-CARRIER.position.x,dz=z-CARRIER.position.z,s=Math.sin(CARRIER.rotation.y),c=Math.cos(CARRIER.rotation.y);return [dx*c-dz*s,dx*s+dz*c];}
function carrierW(lx,y,lz,out){const s=Math.sin(CARRIER.rotation.y),c=Math.cos(CARRIER.rotation.y);return out.set(CARRIER.position.x+c*lx+s*lz,y,CARRIER.position.z-s*lx+c*lz);}
function placeCarrier(x,z,yaw){CARRIER.position.set(x,0,z);CARRIER.rotation.y=yaw;CARRIER.visible=true;CARRIER.updateMatrixWorld(true);}
function surfaceH(x,z){if(CARRIER.visible){const [lx,lz]=carrierLocal(x,z);if(lz>-150&&lz<150&&lx>-32&&lx<40)return DECK;}return Math.max(terrainH(x,z),0);}
function updateBaseFX(dt){const U=CARRIER.userData,on=(time%1.4)<.15;BASEG.userData.beacon.visible=on;
  if(CARRIER.visible){U.beacon.visible=on;U.radar.rotation.y+=dt*1.4;U.jbd.rotation.x=damp(U.jbd.rotation.x,U.jbdT?1.15:0,4,dt);}}

const LAUNCH=['runway','carrier','air'],LNAME={air:'EN VUELO',runway:'PISTA · BASE CÓNDOR',carrier:'PORTAAVIONES'};
let launchMode='runway';try{const v=localStorage.getItem('acecombat-launch');if(LAUNCH.includes(v))launchMode=v;}catch(e){}
const SURV_P={start:{x:0,y:1750,z:-WORLD*.55,yaw:0}};
function updLaunchUI(){document.querySelectorAll('.lm').forEach(e=>e.textContent=LNAME[launchMode]);}
function cycleLaunch(){launchMode=LAUNCH[(LAUNCH.indexOf(launchMode)+1)%LAUNCH.length];try{localStorage.setItem('acecombat-launch',launchMode);}catch(e){}
  updLaunchUI();sfx('switch');if(view==='brief'&&briefPlan)drawBriefMap(briefPlan);}
function findCarrierSpot(st){
  const ok=(x,z,yaw)=>{const s=Math.sin(yaw),c=Math.cos(yaw);
    for(const lz of [-175,-90,0,90,175])for(const lx of [-48,0,48]){const wx=x+c*lx+s*lz,wz=z-s*lx+c*lz;if(Math.abs(wx)>WORLD*.86||Math.abs(wz)>WORLD*.86||terrainH(wx,wz)>-30)return false;}
    for(const lz of [450,900,1400])if(terrainH(x+s*lz,z+c*lz)>120)return false;return true;};
  const yaws=[st.yaw,st.yaw+.6,st.yaw-.6,st.yaw+1.2,st.yaw-1.2,st.yaw+Math.PI];
  for(let r=0;r<=6000;r+=250)for(let k=0;k<(r?16:1);k++){const a=k/16*6.2832,x=st.x+Math.cos(a)*r,z=st.z+Math.sin(a)*r;for(const y of yaws)if(ok(x,z,y))return {x,z,yaw:y};}
  return {x:-WORLD*.84,z:0,yaw:0};
}
function launchSpot(P){
  if(launchMode==='runway'){const B=BASE,u=-B.L/2+70;return {mode:'runway',x:B.x+B.s*u,z:B.z+B.c*u,yaw:B.yaw};}
  if(launchMode==='carrier'){const cs=P.carrier||(P.carrier=findCarrierSpot(P.start));return {mode:'carrier',x:cs.x,z:cs.z,yaw:cs.yaw};}
  return {mode:'air',x:P.start.x,y:P.start.y,z:P.start.z,yaw:P.start.yaw};
}
function applyLaunch(s){
  const p=player,o=p.obj,J=o.userData;J.gear.scale.y=1;p.gearT=0;p.gearRetract=0;
  if(s.mode==='air'){o.position.set(s.x,s.y,s.z);o.quaternion.setFromAxisAngle(AY,s.yaw);p.grounded=null;J.gear.visible=false;return;}
  p.speed=0;p.thr=0;J.gear.visible=true;let x,z;
  if(s.mode==='carrier'){placeCarrier(s.x,s.z,s.yaw);const w=carrierW(-4,0,-6,_v1);x=w.x;z=w.z;CARRIER.userData.jbdT=0;
    say('BASTIÓN','Barbie 01, aquí portaaviones Bastión. Estás enganchado en la catapulta uno.');say('BASTIÓN','Acelerador a fondo cuando estés listo. La catapulta dispara sola.');
    showMsg('PORTAAVIONES BASTIÓN','Sube el acelerador al 100 % para lanzar',3.2);}
  else{x=s.x;z=s.z;say('TORRE',`Barbie 01, torre Cóndor. Pista ${BASE.num} libre, viento en calma. Autorizado a despegar.`);
    showMsg('BASE CÓNDOR · PISTA '+BASE.num,'Acelerador arriba (SHIFT) y rota con W',3.2);}
  p.grounded={mode:s.mode,phase:s.mode==='carrier'?'hook':'roll',yaw:s.yaw,pitch:0,t:0,cd:0,VR:s.mode==='carrier'?E.VRc:E.VR*Math.min(p.P.spd,1.1)};
  o.position.set(x,surfaceH(x,z)+2.6,z);o.quaternion.setFromAxisAngle(AY,s.yaw);
}
function groundRoll(dt,ip,ir){
  const p=player,o=p.obj,GR=p.grounded,S=Math.min(p.P.spd,1.1);GR.t+=dt;
  if(GR.mode==='carrier'){const U=CARRIER.userData;
    if(GR.phase==='hook'){p.speed=0;if(p.thr>=.98){GR.phase='arm';GR.cd=1.8;U.jbdT=1;sfx('steam');feed('Catapulta armada');}}
    else if(GR.phase==='arm'){p.speed=0;GR.cd-=dt;
      if(Math.random()<dt*30)emit(SMOKE,carrierW(-4+rand(-1,1),DECK+.6,rand(0,140),_v1),_v4.set(rand(-2,2),rand(4,10),rand(-2,2)),1.2,3,12,0xffffff,0xe8eef2,.55);
      if(p.thr<.9){GR.phase='hook';U.jbdT=0;}else if(GR.cd<=0){GR.phase='launch';sfx('cat');shake=Math.min(2,shake+1.2);}}
    else{p.speed+=(E.catAcc+p.thr*E.catAcc*.14)*dt;if(Math.random()<dt*45)emit(SMOKE,_v1.set(o.position.x,DECK+.6,o.position.z),_v4.set(rand(-3,3),rand(3,8),rand(-3,3)),1.5,4,16,0xffffff,0xe8eef2,.6);}
  }else{
    const [u,v]=baseLocal(o.position.x,o.position.z);
    const acc=p.thr*E.acc*S+(p.boosting?E.acc*.4:0);let drag=2+p.speed*.05/E.spd+(p.thr<.06?24:0);if(Math.abs(v)>BASE.Wd/2+4)drag+=18;
    p.speed=Math.max(0,p.speed+(acc-drag)*dt);
    GR.yaw-=ir*.5*(1-clamp(p.speed/220,0,.8))*dt;
    if(u>BASE.L/2+90){if(p.speed>E.VR*.75){liftoff(true);return fwdOf(o.quaternion,_vF);}
      explode(o.position,1);hurtPlayer(200);if(!p.alive)return fwdOf(o.quaternion,_vF);showMsg('¡TE SALISTE DE LA PISTA!','Rota antes del final · -200 casco',2,true);applyLaunch(launchSpot(mode==='mission'&&MS?MS.P:SURV_P));return fwdOf(o.quaternion,_vF);}
  }
  const canRot=p.speed>GR.VR;GR.pitch=damp(GR.pitch,canRot&&ip>.15?ip*.24:0,3,dt);
  const d=_v2.set(Math.sin(GR.yaw),0,Math.cos(GR.yaw));o.position.addScaledVector(d,p.speed*dt);p.vel.copy(d).multiplyScalar(p.speed);
  o.quaternion.setFromAxisAngle(AY,GR.yaw).multiply(_q2.setFromAxisAngle(AX,-GR.pitch));
  p.rp=damp(p.rp,ip*.6,5,dt);p.rr=0;p.ry=damp(p.ry,ir*.6,5,dt);p.gforce=1;
  if(GR.mode==='carrier'){const [lx,lz]=carrierLocal(o.position.x,o.position.z);if(lz>148||Math.abs(lx-4)>40){liftoff(true);return fwdOf(o.quaternion,_vF);}}
  o.position.y=surfaceH(o.position.x,o.position.z)+2.6;
  if(canRot&&GR.pitch>.07)liftoff(false);
  return fwdOf(o.quaternion,_vF);
}
function liftoff(auto){
  const p=player,o=p.obj,GR=p.grounded,pitch=Math.max(GR.pitch,auto?.12:.08);
  o.quaternion.setFromAxisAngle(AY,GR.yaw).multiply(_q2.setFromAxisAngle(AX,-pitch));
  p.grounded=null;p.rp=0;p.rr=0;p.ry=0;p.gearT=2.2;CARRIER.userData.jbdT=0;
  showMsg('¡EN EL AIRE!','El tren sube solo · rumbo al objetivo',2.2);
  say(GR.mode==='carrier'?'BASTIÓN':'TORRE',GR.mode==='carrier'?'Buen lanzamiento, Barbie 01. Buena caza.':'Despegue confirmado, Barbie 01. Pasa con Órbita. Buena caza.');
}
function updateGear(dt){const p=player,J=p.obj.userData;
  if(!p.grounded&&p.gearT>0){p.gearT-=dt;if(p.gearT<=0){p.gearRetract=1;sfx('gear');feed('Tren de aterrizaje arriba');}}
  if(p.gearRetract>0){p.gearRetract=Math.max(0,p.gearRetract-dt*1.1);J.gear.scale.y=p.gearRetract;if(p.gearRetract<=0)J.gear.visible=false;}}
function drawTakeoffHUD(c,cx){
  const GR=player.grounded,sp=player.speed;let l1,l2='';
  if(GR.mode==='carrier'){if(GR.phase==='hook'){l1='ENGANCHADO A LA CATAPULTA 1';l2='Sube el acelerador al 100 % (SHIFT)';}
    else if(GR.phase==='arm'){l1='CATAPULTA ARMADA · '+Math.max(1,Math.ceil(GR.cd));l2='Mantén el acelerador a fondo';}
    else{l1=sp>GR.VR?'¡ROTA! TIRA HACIA ARRIBA (W)':'¡LANZAMIENTO!';l2=Math.round(sp*1.944)+' KT';}}
  else if(sp<3){l1='PISTA '+BASE.num+' · AUTORIZADO A DESPEGAR';l2='Sube el acelerador (SHIFT) para rodar';}
  else if(sp<GR.VR){l1='CARRERA DE DESPEGUE · '+Math.round(sp*1.944)+' KT';l2='Rota a '+Math.round(GR.VR*1.944)+' KT · A / D mantiene el eje';}
  else{l1='¡ROTA! TIRA HACIA ARRIBA (W)';l2='Velocidad de rotación alcanzada';}
  const ly=isTouch?HH*.4:camMode===1?HH*.48:HH*.64,hot=l1.startsWith('¡');
  c.textAlign='center';c.font=(isTouch?'bold 15px':'bold 21px')+' "Chakra Petch",sans-serif';c.fillStyle=hot&&Math.floor(time*4)%2?'#ffffff':'#ffbe55';c.fillText(l1,cx,ly);
  c.font='14px "Share Tech Mono",monospace';c.fillStyle=G;c.fillText(l2,cx,ly+24);
  if(GR.mode==='runway'||GR.phase==='launch'){const w=isTouch?170:220,x=cx-w/2,y=ly+38,k=clamp(sp/(GR.VR*1.15),0,1);
    c.strokeStyle=G;c.strokeRect(x,y,w,8);c.fillStyle=sp>GR.VR?AMB:G;c.fillRect(x,y,w*k,8);c.fillStyle='#ffffff';c.fillRect(x+w/1.15-1,y-4,2,16);}
}
