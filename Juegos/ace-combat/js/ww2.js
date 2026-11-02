// Ace Combat · Bombas, cabina WWII y cambio de época
'use strict';

/* ---------------- Bombas (WWII) ---------------- */
let ccipPt=null;const _cc=new V3(),_cv=new V3(),BOMB_G=32;
function calcCCIP(){const o=player.obj;_cc.copy(o.position);_cv.copy(player.vel);
  for(let t=0;t<22;t+=.06){_cv.y-=BOMB_G*.06;_cv.multiplyScalar(Math.exp(-.003));_cc.addScaledVector(_cv,.06);
    if(_cc.y<surfaceH(_cc.x,_cc.z))return ccipPt=(ccipPt||new V3()).copy(_cc);}
  return ccipPt=null;}
function spawnBomb(pos,vel,dmg){const mesh=makeBombMesh();mesh.position.copy(pos);scene.add(mesh);
  missiles.push({bomb:true,mesh,pos:mesh.position,prev:pos.clone(),vel:vel.clone().add(_v4.set(0,-4,0)),dmg,owner:'p',life:25,armed:.25});}
function updateBomb(m,i,dt){
  m.life-=dt;m.armed-=dt;m.vel.y-=BOMB_G*dt;m.vel.multiplyScalar(Math.exp(-.05*dt));m.prev.copy(m.pos);m.pos.addScaledVector(m.vel,dt);
  m.mesh.quaternion.setFromUnitVectors(AZ,_v1.copy(m.vel).normalize());
  let boom=m.pos.y<surfaceH(m.pos.x,m.pos.z)+.5;
  if(!boom&&m.armed<=0)for(const e of enemies){if(!e.dead&&segDist(m.prev,m.pos,e.pos)<e.r+3){boom=true;break;}}
  if(boom||m.life<=0){explode(m.pos,2.3);
    for(const e of enemies){if(e.dead)continue;const d=e.pos.distanceTo(m.pos);if(d<95+e.r)damageEnemy(e,m.dmg*(d<28+e.r?1:.5),m.pos);}
    scene.remove(m.mesh);missiles.splice(i,1);}
}
/* ---------------- Cabina WWII: marco y relojes analógicos ---------------- */
(function buildWW2Cockpit(){
  const S=cockScene,m=new THREE.MeshStandardMaterial({color:0x2b2a20,roughness:.8,flatShading:true}),g=new THREE.Group();CK.w2=g;S.add(g);g.visible=false;
  const bx=(w,h,d,x,y,z)=>{const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);me.position.set(x,y,z);g.add(me);return me;};
  bx(.035,.7,.035,-.34,.1,-.97).rotation.z=-.22;bx(.035,.7,.035,.34,.1,-.97).rotation.z=.22;bx(.52,.035,.035,0,.43,-.93);
  bx(.035,.035,1.4,-.66,.3,-.3);bx(.035,.035,1.4,.66,.3,-.3);bx(.05,.05,.07,0,-.18,-.86);
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(.11,.09),new THREE.MeshBasicMaterial({color:0xffc070,transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false}));
  gl.position.set(0,-.06,-.86);gl.rotation.x=-.4;g.add(gl);
})();
function bezel(c,cx,cy,R){const g=c.createRadialGradient(cx,cy,R*.86,cx,cy,R*1.14);g.addColorStop(0,'#3a2e16');g.addColorStop(.45,'#d8b466');g.addColorStop(1,'#4a3a1c');
  c.fillStyle='#0d0b08';c.fillRect(0,0,256,256);c.fillStyle=g;c.beginPath();c.arc(cx,cy,R*1.14,0,6.29);c.fill();c.fillStyle='#15130e';c.beginPath();c.arc(cx,cy,R,0,6.29);c.fill();}
function needle(c,cx,cy,a,len,w,col){c.save();c.translate(cx,cy);c.rotate(a);c.fillStyle=col;c.beginPath();c.moveTo(-w,0);c.lineTo(0,-len);c.lineTo(w,0);c.lineTo(0,len*.18);c.closePath();c.fill();c.restore();}
function dial(c,val,max,step,major,label,unit){
  const cx=128,cy=124,R=104,a0=Math.PI*.75,sp=Math.PI*1.5;bezel(c,cx,cy,R);
  c.strokeStyle='#efe2c2';c.fillStyle='#efe2c2';c.textAlign='center';c.textBaseline='middle';c.font='bold 17px "Chakra Petch",sans-serif';
  for(let v=0;v<=max;v+=step){const a=a0+v/max*sp,mj=v%major===0;c.lineWidth=mj?3:1.5;c.beginPath();c.moveTo(cx+Math.cos(a)*R*(mj?.78:.86),cy+Math.sin(a)*R*(mj?.78:.86));c.lineTo(cx+Math.cos(a)*R*.95,cy+Math.sin(a)*R*.95);c.stroke();
    if(mj)c.fillText(String(v/(major>=100?10:1)),cx+Math.cos(a)*R*.6,cy+Math.sin(a)*R*.6);}
  c.font='12px "Share Tech Mono",monospace';c.fillStyle='#c9b78f';c.fillText(label,cx,cy+34);c.fillText(unit,cx,cy+50);
  needle(c,cx,cy,a0+clamp(val/max,0,1)*sp+Math.PI/2,R*.86,5,'#f4f0e6');c.fillStyle='#b8954a';c.beginPath();c.arc(cx,cy,8,0,6.29);c.fill();
}
function drawGauges(){
  const p=player,o=p.obj,f=fwdOf(o.quaternion,new V3()),up=new V3(0,1,0).applyQuaternion(o.quaternion),rt=new V3(-1,0,0).applyQuaternion(o.quaternion);
  let c=CK.mfd[0].ctx;dial(c,p.speed*1.944,450,25,50,'VELOCIDAD','NUDOS');
  c.fillStyle=p.boosting?'#ff9f43':'#c9b78f';c.font='bold 13px "Share Tech Mono",monospace';c.textAlign='center';c.fillText((p.boosting?'WEP ':'POT ')+Math.round(p.thr*100)+'%',128,236);
  c=CK.mfd[1].ctx;bezel(c,128,124,104);
  const pitch=Math.asin(clamp(f.y,-1,1))*57.3,bank=Math.atan2(-rt.y,up.y);
  c.save();c.beginPath();c.arc(128,124,100,0,6.29);c.clip();c.translate(128,124);c.rotate(-bank);const off=pitch*2.4;
  c.fillStyle='#4a6f93';c.fillRect(-220,-440+off,440,440);c.fillStyle='#6e5230';c.fillRect(-220,off,440,440);
  c.strokeStyle='#f4f0e6';c.lineWidth=2;c.beginPath();c.moveTo(-220,off);c.lineTo(220,off);c.stroke();
  for(let d=-40;d<=40;d+=10){if(!d)continue;const y=off-d*2.4;c.beginPath();c.moveTo(-16,y);c.lineTo(16,y);c.stroke();}
  c.restore();
  c.strokeStyle='#ff9f43';c.lineWidth=5;c.beginPath();c.moveTo(70,124);c.lineTo(112,124);c.moveTo(144,124);c.lineTo(186,124);c.stroke();c.fillStyle='#ff9f43';c.beginPath();c.arc(128,124,5,0,6.29);c.fill();
  const hdg=((Math.atan2(f.x,f.z)*57.3)+360)%360;c.fillStyle='#0d0b08';c.fillRect(92,2,72,24);c.fillStyle='#efe2c2';c.font='bold 16px "Share Tech Mono",monospace';c.textAlign='center';c.textBaseline='middle';
  c.fillText(String(Math.round(hdg)%360).padStart(3,'0')+'°',128,15);c.fillText('G '+p.gforce.toFixed(1),128,244);
  c=CK.mfd[2].ctx;const alt=o.position.y*3.281,cx=128,cy=124,R=104;bezel(c,cx,cy,R);
  c.fillStyle='#efe2c2';c.strokeStyle='#efe2c2';c.textAlign='center';c.textBaseline='middle';c.font='bold 18px "Chakra Petch",sans-serif';
  for(let k=0;k<50;k++){const a=k/50*Math.PI*2-Math.PI/2,mj=k%5===0;c.lineWidth=mj?3:1.2;c.beginPath();c.moveTo(cx+Math.cos(a)*R*(mj?.8:.88),cy+Math.sin(a)*R*(mj?.8:.88));c.lineTo(cx+Math.cos(a)*R*.95,cy+Math.sin(a)*R*.95);c.stroke();
    if(mj)c.fillText(String(k/5),cx+Math.cos(a)*R*.64,cy+Math.sin(a)*R*.64);}
  c.font='12px "Share Tech Mono",monospace';c.fillStyle='#c9b78f';c.fillText('ALTITUD',cx,cy+34);
  needle(c,cx,cy,(alt%1000)/1000*Math.PI*2,R*.86,4,'#f4f0e6');needle(c,cx,cy,(alt%10000)/10000*Math.PI*2,R*.55,7,'#f4f0e6');c.fillStyle='#b8954a';c.beginPath();c.arc(cx,cy,8,0,6.29);c.fill();
  const w=W[wIdx];c.fillStyle='#0d0b08';c.fillRect(30,224,196,30);c.font='bold 12px "Share Tech Mono",monospace';
  c.fillStyle=w.ammo?'#efe2c2':'#ff6b5a';c.fillText(w.def.name+' '+w.ammo+'/'+w.reserve,128,233);c.fillStyle=p.hp<p.maxHp*.3?'#ff6b5a':'#c9b78f';c.fillText('CASCO '+Math.ceil(p.hp)+(autoFire?' · AUTO':''),128,248);
}
/* ---------------- Cambio de época ---------------- */
function setEraColors(){if(ERA==='ww2'){G='#f2d49b';GD='rgba(242,212,155,.55)';AMB='#ff9f43';HGLOW='rgba(255,190,110,.45)';}else{G='#86ffbd';GD='rgba(134,255,189,.5)';AMB='#ffbe55';HGLOW='rgba(134,255,189,.55)';}}
function setEra(e){
  ERA=e;E=ERAS[e];WEAPONS=WEAPONS_BY[e];ETYPES=ETYPES_BY[e];GTYPES=GTYPES_BY[e];PLANES=PLANES_BY[e];const ww=e==='ww2';
  try{localStorage.setItem('acecombat-era',e);}catch(_){}
  document.body.classList.toggle('ww2',ww);setEraColors();
  buildSlots();W=WEAPONS.map(d=>({def:d,ammo:d.mag,reserve:d.reserve}));wIdx=0;
  let pi=0;try{pi=+(localStorage.getItem('acecombat-plane-'+e)??(ww?0:localStorage.getItem('acecombat-plane')))||0;}catch(_){}
  setPlane(clamp(pi,0,PLANES.length-1));rebuildParked();
  FOGC.setHex(ww?0xd2c9b0:0xb4d2e8);scene.fog.color.copy(FOGC);sky.material.uniforms.top.value.setHex(ww?0x3d6896:0x1f63b0);
  CK.w2.visible=ww;Object.values(CK.lights).forEach(l=>l.visible=!ww);CK.mPanel.color.setHex(ww?0x3a3624:0x2e353b);
  $('mEra').textContent=E.name;$('lAB').textContent=ww?'POTENCIA DE EMERGENCIA':'POSTCOMBUSTIÓN';
  $('cAB').textContent=ww?'Potencia de emergencia (WEP)':'Postcombustión';$('cF').textContent=ww?'Extintor (repara 120)':'Bengalas antimisil';
  if(A.engO)A.engO.type=ww?'square':'sawtooth';
}
