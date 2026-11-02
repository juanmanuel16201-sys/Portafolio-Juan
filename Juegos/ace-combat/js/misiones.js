// Ace Combat · Unidades de superficie, radio y campaña
'use strict';

/* ---------------- Unidades de superficie, bombarderos y aliados ---------------- */
let ally=null,MS=null,mode='survival',curMission=0,cityGroup=null,hangarReturn='menu',briefPlan=null;
const GTYPES_MOD={
  aa:{name:'ANTIAÉREO',hp:300,r:9,score:120,body:0x5a6340,aa:true,scale:1},
  sam:{name:'SAM',hp:400,r:10,score:150,body:0x5a6340,sam:true,scale:1},
  radar:{name:'RADAR',hp:350,r:12,score:150,body:0x9a9890,scale:1},
  hangar:{name:'HANGAR',hp:600,r:20,score:120,body:0x9a9890,scale:1,boom:2.6},
  tank:{name:'DEPÓSITO',hp:300,r:13,score:100,body:0xe8ecef,scale:1,boom:3},
  ship:{name:'DESTRUCTOR',hp:800,r:30,score:300,body:0x5c6670,aa:true,sam:true,ship:true,speed:14,scale:1,boom:4},
  cruiser:{name:'CRUCERO',hp:1000,r:38,score:450,body:0x5c6670,aa:true,sam:true,ship:true,speed:11,scale:1.3,boom:5}
};
const GTYPES_BY={modern:GTYPES_MOD,ww2:Object.fromEntries(Object.entries(GTYPES_MOD).map(([k,v])=>[k,Object.assign({},v,{sam:false},k==='sam'?{name:'FLAK PESADO',aa:true,heavy:true,scale:1.25}:{})]))};
let GTYPES=GTYPES_BY[ERA];
const BTYPE={name:'BOMBARDERO',hp:700,r:24,score:250,body:0x3b3f45,accent:0xb43a3a,speed:118,scale:1,boom:3};
function stdMats(body,accent){return [
  cmat('b'+body,()=>new THREE.MeshStandardMaterial({color:body,metalness:.35,roughness:.48,flatShading:true})),
  cmat('w'+body,()=>new THREE.MeshStandardMaterial({color:body,metalness:.35,roughness:.5,flatShading:true,side:THREE.DoubleSide})),
  cmat('a'+accent,()=>new THREE.MeshStandardMaterial({color:accent,metalness:.3,roughness:.5,flatShading:true,side:THREE.DoubleSide}))];}
function makeBig(body,accent){
  const g=new THREE.Group(),[mB,mW,mA]=stdMats(body,accent);
  const add=(geo,m,x,y,z)=>{const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);g.add(me);return me;};
  if(!GEO.bigFus){GEO.bigFus=new THREE.CylinderGeometry(3,3.4,44,12);GEO.bigFus.rotateX(Math.PI/2);
    GEO.bigNose=new THREE.SphereGeometry(3,12,8);GEO.bigNose.scale(1,1,2.2);GEO.bigTail=new THREE.ConeGeometry(3.4,12,12);GEO.bigTail.rotateX(-Math.PI/2);
    const w=[[2.5,-5],[27,3],[27,6],[2.5,8]];GEO.bigWL=flat(w,.7);GEO.bigWR=flat(mirror(w),.7);
    const st=[[1,18],[10,22.5],[10,24],[1,24]];GEO.bigSL=flat(st,.4);GEO.bigSR=flat(mirror(st),.4);
    GEO.eng=new THREE.CylinderGeometry(1.5,1.3,6,10);GEO.eng.rotateX(Math.PI/2);}
  add(GEO.bigFus,mB,0,0,0);add(GEO.bigNose,mB,0,0,22);add(GEO.bigTail,mB,0,.5,-28);
  add(GEO.bigWL,mW,0,1,0);add(GEO.bigWR,mW,0,1,0);add(GEO.bigSL,mA,0,1.5,0);add(GEO.bigSR,mA,0,1.5,0);
  const fin=add(GEO.fin,mA,0,2.5,-17);fin.scale.setScalar(2.3);
  add(GEO.canopy,M.glass,0,1.6,17).scale.set(1.6,1,.6);
  [-1,1].forEach(s=>[8,15].forEach(x=>add(GEO.eng,M.dark,x*s,-.6,1)));
  if(ERA==='ww2'){g.userData.props=[];if(!GEO.pblade){GEO.pblade=new THREE.BoxGeometry(.45,3.6,.12);GEO.pblade.translate(0,1.8,0);}
    [-1,1].forEach(s=>[8,15].forEach(x=>{const pr=new THREE.Group();pr.position.set(x*s,-.6,4.2);g.add(pr);for(let k=0;k<3;k++){const b=new THREE.Mesh(GEO.pblade,M.dark);b.rotation.z=k*2.094;pr.add(b);}g.userData.props.push(pr);}));}
  return g;
}
function makeGround(kind){if(kind==='sam'&&ERA==='ww2')kind='aa';
  const g=new THREE.Group(),J=g.userData;
  const mOl=cmat('gol',()=>new THREE.MeshStandardMaterial({color:0x5a6340,roughness:.9,flatShading:true}));
  const mCo=cmat('gco',()=>new THREE.MeshStandardMaterial({color:0x9a9890,roughness:.95,flatShading:true,side:THREE.DoubleSide}));
  const mSh=cmat('gsh',()=>new THREE.MeshStandardMaterial({color:0x5c6670,roughness:.7,metalness:.3,flatShading:true}));
  const mDk=cmat('gdk',()=>new THREE.MeshStandardMaterial({color:0x3a4148,roughness:.8,flatShading:true}));
  const mk=(geo,m,x,y,z,p=g)=>{const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);p.add(me);return me;};
  const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d),C=(a,b,h,s=10)=>new THREE.CylinderGeometry(a,b,h,s);
  if(kind==='aa'){mk(C(6,7,3),mCo,0,1.5,0);J.turret=new THREE.Group();J.turret.position.y=4;g.add(J.turret);mk(B(5,3,5),mOl,0,0,0,J.turret);
    const bg=new THREE.CylinderGeometry(.35,.35,9,6);bg.rotateX(Math.PI/2);bg.translate(0,0,4.5);[-1,1].forEach(s=>{mk(bg,M.dark,s*1.2,1,1,J.turret).rotation.x=-.7;});}
  else if(kind==='sam'){mk(B(6,2.6,13),mOl,0,1.8,0);mk(B(5.6,2.4,3.4),mOl,0,3.6,5);J.turret=new THREE.Group();J.turret.position.set(0,3.4,-2);g.add(J.turret);
    const ln=new THREE.Group();ln.rotation.x=-.65;J.turret.add(ln);for(let i=0;i<4;i++)mk(B(1.4,1.4,9),mOl,(i%2?.8:-.8),(i<2?.8:-.8)+.8,3.5,ln);}
  else if(kind==='radar'){mk(C(1.2,2,16,8),mCo,0,8,0);mk(B(6,2,6),mCo,0,1,0);J.dish=new THREE.Group();J.dish.position.y=16;g.add(J.dish);
    mk(new THREE.CylinderGeometry(7,4,1.4,16,1,true),mCo,0,2,0,J.dish).rotation.x=1.2;mk(B(1,4,1),mDk,0,1,0,J.dish);}
  else if(kind==='hangar'){const h=new THREE.CylinderGeometry(14,14,34,14,1,false,0,Math.PI);h.rotateZ(Math.PI/2);mk(h,mCo,0,0,0);mk(B(30,1,40),mDk,0,.2,0);}
  else if(kind==='tank'){[-9,9].forEach(x=>mk(C(7,7,9,16),M.white,x,4.5,0));mk(B(30,1,14),mDk,0,.3,0);}
  else{ // ship / cruiser
    mk(B(16,7,80),mSh,0,1,0);const bw=new THREE.ConeGeometry(8,22,4);bw.rotateX(Math.PI/2);bw.rotateZ(Math.PI/4);bw.scale(1,.45,1);mk(bw,mSh,0,1,51);
    mk(B(15,.5,78),mDk,0,4.7,0);mk(B(10,9,16),mSh,0,9,-6);mk(B(11,4,7),mSh,0,15,-2);mk(B(11.2,1.2,7.2),M.dark,0,15.5,-2);
    mk(C(2.5,3,8),M.dark,0,16,-16);mk(C(.4,.4,14,6),M.dark,0,22,-6);J.dish=new THREE.Group();J.dish.position.set(0,29,-6);g.add(J.dish);mk(B(6,1,.5),mSh,0,0,0,J.dish);
    const bar=new THREE.CylinderGeometry(.5,.5,10,6);bar.rotateX(Math.PI/2);bar.translate(0,.6,6);
    J.turret=new THREE.Group();J.turret.position.set(0,6,24);g.add(J.turret);mk(B(6,3,7),mSh,0,0,0,J.turret);mk(bar,M.dark,0,0,0,J.turret);
    J.turret2=new THREE.Group();J.turret2.position.set(0,6,-30);g.add(J.turret2);mk(B(6,3,7),mSh,0,0,0,J.turret2);mk(bar,M.dark,0,0,0,J.turret2);}
  return g;
}
function spawnGround(kind,x,z,opts={}){
  const T=GTYPES[kind],obj=makeGround(kind);obj.position.set(x,T.ship?0:Math.max(terrainH(x,z),0),z);
  obj.rotation.y=opts.yaw!==undefined?opts.yaw:rand(0,6.28);obj.scale.setScalar(T.scale);scene.add(obj);
  const e={obj,model:obj,J:obj.userData,T,type:kind,kind:T.ship?'ship':'ground',pos:obj.position,dir:new V3(Math.sin(obj.rotation.y),0,Math.cos(obj.rotation.y)),
    vel:new V3(),speed:T.speed||0,hp:T.hp,maxHp:T.hp,r:T.r,fireCd:rand(1,3),mslCd:rand(3,8),flakT:rand(.5,2),burst:0,burstT:0,dead:false,primary:!!opts.primary,bank:0};
  enemies.push(e);return e;
}
function updateGround(e,dt){
  const J=e.J,T=e.T,pp=player.obj.position;
  if(J.dish)J.dish.rotation.y+=dt*1.6;
  if(e.kind==='ship'){
    _v1.copy(e.pos).addScaledVector(e.dir,200*T.scale);if(terrainH(_v1.x,_v1.z)>-25)e.dir.applyAxisAngle(AY,dt*.45);
    e.pos.addScaledVector(e.dir,e.speed*dt);e.vel.copy(e.dir).multiplyScalar(e.speed);e.obj.rotation.y=Math.atan2(e.dir.x,e.dir.z);e.pos.y=Math.sin(time*.8+e.r)*.6;
    if(Math.random()<dt*8)emit(SMOKE,_v2.copy(e.pos).addScaledVector(e.dir,-42*T.scale).add(_v3.set(0,2,0)),_v3.set(0,1,0),3,8,34,0xffffff,0xdfe8ee,.4);
  }
  if(e.hp<e.maxHp*.5&&Math.random()<dt*20)emit(SMOKE,_v2.copy(e.pos).add(_v3.set(rand(-6,6),8,rand(-6,6))),_v3.set(rand(-3,3),25,rand(-3,3)),3,8,40,0x262626,0x5a5a5a,.7,-3);
  if(e.hp<e.maxHp*.25&&Math.random()<dt*20)emit(FIRE,_v2.copy(e.pos).add(_v3.set(rand(-6,6),5,rand(-6,6))),_v3.set(0,12,0),.6,8,2,0xffcc66,0xff3300,1);
  if(!player.alive||player.grounded)return;
  _v1.subVectors(pp,e.pos);const dist=_v1.length();
  if(J.turret){const yaw=Math.atan2(_v1.x,_v1.z)-e.obj.rotation.y;J.turret.rotation.y=yaw;if(J.turret2)J.turret2.rotation.y=yaw;}
  if(T.aa&&dist<2300&&pp.y>e.pos.y+60){
    e.flakT-=dt;if(e.flakT<=0){e.flakT=rand(.6,1.3)*(T.ship||T.heavy?.75:1);
      const fp=_v2.copy(pp).addScaledVector(player.vel,rand(.15,.6)).add(rv(rand(40,130)*(MS&&MS.flag.radarDown?1.5:1)));
      emit(SMOKE,fp,_v3.set(0,3,0),1.8,6,34,0x1c1c1c,0x3a3a3a,.85,-1,1);emit(FIRE,fp,_v3.set(0,0,0),.15,14,26,0xffe0a0,0xff6020,1);
      const fd=fp.distanceTo(pp);if(fd<55)hurtPlayer(Math.round((T.heavy?30:22)*(1-fd/55))+6);
      sfx('flak',clamp(1-fp.distanceTo(camera.position)/1500,0,.5));}
    e.fireCd-=dt;
    if(e.burst>0){e.burstT-=dt;if(e.burstT<=0){e.burstT=.07;e.burst--;const np=_v3.copy(e.pos).addScaledVector(AY,6*T.scale);
      const dv=new V3().copy(pp).addScaledVector(player.vel,dist/E.ebullet).sub(np).normalize();dv.add(rv(.03)).normalize();spawnBullet(np,dv.multiplyScalar(E.ebullet),4,'e',M.trE);}}
    else if(e.fireCd<=0&&dist<1600*E.gunRange){e.burst=8;e.fireCd=rand(1.5,3);}
  }
  if(T.sam&&dist<3400&&dist>450){e.mslCd-=dt;if(e.mslCd<=0){const blind=MS&&MS.flag.radarDown;e.mslCd=rand(8,12)*(blind?1.3:1);
    const p0=_v2.copy(e.pos).addScaledVector(AY,8);const d0=new V3().subVectors(pp,p0).normalize();d0.y+=.6;d0.normalize();
    spawnMissile(p0,d0,90,player,'e',115,false);missiles[missiles.length-1].turn=blind?.75:1.5;sfx('msl',clamp(1-dist/3500,.15,.5));feed(`${T.name} lanzó un misil · usa F`);}}
}
function spawnBomber(x,y,z,goal){
  const T=BTYPE,obj=makeBig(T.body,T.accent);obj.position.set(x,y,z);scene.add(obj);
  const dir=new V3(goal.x-x,0,goal.z-z).normalize();obj.lookAt(_v1.copy(obj.position).add(dir));
  const e={obj,model:obj,T,type:'bomber',kind:'bomber',pos:obj.position,dir,vel:dir.clone().multiplyScalar(T.speed*E.spd),speed:T.speed*E.spd,hp:T.hp,maxHp:T.hp,r:T.r,goal,fireCd:1,dead:false,primary:true,bank:0,ph:rand(0,6),dist:1e9,alt:y};
  enemies.push(e);return e;
}
function bomberGroup(g,goal){for(let i=0;i<3;i++)spawnBomber(g.x+(i-1)*130,1500+i*40,g.z+(i===1?0:-120),goal);}
function updateBomber(e,dt){const pr=e.obj.userData.props;if(pr)pr.forEach(q=>q.rotation.z+=dt*40);if(player.grounded)return;
  const to=_v1.set(e.goal.x-e.pos.x,0,e.goal.z-e.pos.z);e.dist=to.length();to.normalize();to.x+=Math.sin(time*.3+e.ph)*.12;to.normalize();
  e.dir.lerp(to,clamp(dt*.3,0,1)).normalize();
  const gh=Math.max(terrainH(e.pos.x+e.dir.x*500,e.pos.z+e.dir.z*500),terrainH(e.pos.x,e.pos.z),0);e.pos.y=damp(e.pos.y,Math.max(e.alt,gh+320),.4,dt);
  e.pos.addScaledVector(e.dir,e.speed*dt);e.vel.copy(e.dir).multiplyScalar(e.speed);e.obj.lookAt(_v2.copy(e.pos).add(e.dir));
  if(e.hp<e.maxHp*.5&&Math.random()<dt*28)emit(SMOKE,_v2.copy(e.pos).addScaledVector(e.dir,-20).add(_v3.set(rand(-12,12),0,0)),rv(5),1.8,6,26,0x2e2e2e,0x6a6a6a,.65,-5);
  if(e.hp<e.maxHp*.25&&Math.random()<dt*25)emit(FIRE,_v2.copy(e.pos).add(_v3.set(rand(-15,15),0,0)),rv(5),.4,6,1,0xffcc66,0xff3300,1);
  if(!player.alive)return;
  const pd=e.pos.distanceTo(player.obj.position);e.fireCd-=dt;
  if(pd<950*E.gunRange&&e.fireCd<=0){e.fireCd=.22;const dv=new V3().subVectors(player.obj.position,e.pos).normalize();dv.add(rv(.05)).normalize();
    spawnBullet(_v3.copy(e.pos).addScaledVector(AY,4),dv.multiplyScalar(E.ebullet*.9).add(e.vel),4,'e',M.trE);}
}
function spawnAlly(way){
  const obj=makeBig(0xe9eef2,0x2d6aa0);const y=Math.max(1100,terrainH(way[0].x,way[0].z)+500);obj.position.set(way[0].x,y,way[0].z);scene.add(obj);
  ally={obj,pos:obj.position,vel:new V3(),dir:new V3(way[1].x-way[0].x,0,way[1].z-way[0].z).normalize(),hp:2000,maxHp:2000,way,wp:1,speed:118*E.spd,dead:false,arrived:false,r:24};
}
function updateAlly(dt){
  if(ally&&ally.obj.userData.props)ally.obj.userData.props.forEach(q=>q.rotation.z+=dt*40);if(!ally||ally.dead||player.grounded)return;const w=ally.way[ally.wp];const to=_v1.set(w.x-ally.pos.x,0,w.z-ally.pos.z);
  if(to.length()<260){if(ally.wp<ally.way.length-1)ally.wp++;else ally.arrived=true;}
  to.normalize();ally.dir.lerp(to,clamp(dt*.45,0,1)).normalize();
  const gh=Math.max(terrainH(ally.pos.x+ally.dir.x*600,ally.pos.z+ally.dir.z*600),terrainH(ally.pos.x,ally.pos.z),0);
  ally.pos.y=damp(ally.pos.y,Math.max(1100,gh+350),.5,dt);ally.pos.addScaledVector(ally.dir,ally.speed*dt);ally.vel.copy(ally.dir).multiplyScalar(ally.speed);
  ally.obj.lookAt(_v2.copy(ally.pos).add(ally.dir));
  if(ally.hp<ally.maxHp*.5&&Math.random()<dt*25)emit(SMOKE,_v2.copy(ally.pos).add(_v3.set(rand(-14,14),0,rand(-6,6))),rv(5),1.8,6,24,0x2e2e2e,0x6a6a6a,.6,-5);
}
function hurtAlly(d){if(!ally||ally.dead)return;ally.hp-=d;if(ally.hp<=0){ally.hp=0;ally.dead=true;explode(ally.pos,3.2);scene.remove(ally.obj);}}
function buildCity(c){
  cityGroup=new THREE.Group();const geo=new THREE.BoxGeometry(1,1,1);
  const mats=[0xd9d4c7,0xbfc6cc,0xe8d9b0,0x9aa3ab].map(col=>cmat('city'+col,()=>new THREE.MeshStandardMaterial({color:col,roughness:.9,flatShading:true})));
  for(let i=0;i<70;i++){const a=Math.random()*6.28,r=Math.sqrt(Math.random())*340,x=c.x+Math.cos(a)*r,z=c.z+Math.sin(a)*r,h=Math.max(terrainH(x,z),0);
    const H=rand(12,24)+(r<130?rand(20,90):rand(0,25));const m=new THREE.Mesh(geo,mats[i%4]);m.scale.set(rand(14,30),H,rand(14,30));m.position.set(x,h+H/2-3,z);cityGroup.add(m);}
  scene.add(cityGroup);
}
/* ---------------- Radio ---------------- */
const radioQ=[];let radioT=0;
function say(who,text,dur){text=eraText(text);radioQ.push({who,text,dur:dur||Math.max(3.2,text.length*.06)});}
function updateRadio(dt){
  if(radioT>0){radioT-=dt;if(radioT<=0&&!radioQ.length)$('radio').hidden=true;}
  if(radioT<=0&&radioQ.length){const r=radioQ.shift();$('rWho').textContent=r.who;$('rTxt').textContent=r.text;$('radio').hidden=false;
    $('radio').className=r.who==='TITÁN'?'enemy':(r.who==='PELÍCANO'||r.who==='TORRE'||r.who==='BASTIÓN')?'ally':'';radioT=r.dur;sfx('radio');}
}
/* ---------------- Misiones ---------------- */
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function landPt(R,cx,cz,spread,minH=25,maxH=380){for(let i=0;i<500;i++){const x=cx+(R()*2-1)*spread,z=cz+(R()*2-1)*spread,h=terrainH(x,z);
  if(h>minH&&h<maxH&&Math.abs(x)<WORLD*.85&&Math.abs(z)<WORLD*.85)return {x,z,h};}return {x:cx,z:cz,h:Math.max(terrainH(cx,cz),0)};}
function waterPt(R,cx,cz,spread){for(let i=0;i<500;i++){const x=cx+(R()*2-1)*spread,z=cz+(R()*2-1)*spread;if(Math.abs(x)<WORLD*.86&&Math.abs(z)<WORLD*.86&&terrainH(x,z)<-45)return {x,z};}
  for(let i=0;i<800;i++){const x=(R()*2-1)*WORLD*.86,z=(R()*2-1)*WORLD*.86;if(terrainH(x,z)<-45)return {x,z};}return {x:-WORLD*.84,z:cz};}
function startToward(c,ang,dist){const x=clamp(c.x+Math.sin(ang)*dist,-WORLD*.85,WORLD*.85),z=clamp(c.z+Math.cos(ang)*dist,-WORLD*.85,WORLD*.85);
  return {x,z,y:Math.max(1500,terrainH(x,z)+700),yaw:Math.atan2(c.x-x,c.z-z)};}
const airLeft=()=>enemies.filter(e=>!e.dead&&e.kind==='air').length;
const primLeft=()=>enemies.filter(e=>!e.dead&&e.primary).length;
function spawnGroup(types,c,spread=300,opts={}){return types.map(t=>spawnEnemy(t,c?new V3(c.x+rand(-spread,spread),c.y+rand(-80,80),c.z+rand(-spread,spread)):null,opts));}

const MISSIONS=[
{code:'M01',name:'BAUTIZO DE FUEGO',area:'Costa de Puerto Arena',time:300,par:1000,
 brief:'Una escuadrilla de cazas Halcón cruzó la frontera y vuela hacia la costa de Puerto Arena. Es tu primer vuelo con el escuadrón Cóndor, Barbie 01. Intercepta a los intrusos antes de que lleguen a la ciudad.',
 obj:['Derriba la primera escuadrilla de cuatro cazas','Elimina los refuerzos que lleguen después'],
 plan(R){const c={x:-400+R()*800,z:600+R()*600};return {c,start:startToward(c,Math.PI+R()*.6-.3,3300),marks:[{x:c.x,z:c.z,t:'air',label:'BANDIDOS'}]};},
 setup(P){spawnGroup(['fighter','fighter','fighter','fighter'],{x:P.c.x,y:1300,z:P.c.z},350);
  say('ÓRBITA','Barbie 01, aquí AWACS Órbita. Cuatro bandidos al frente, rumbo a Puerto Arena.');say('ÓRBITA','Armas libres. Derríbalos a todos.');},
 update(){if(MS.phase===0&&airLeft()===0){MS.phase=1;spawnGroup(['fighter','interceptor','fighter'],null);say('ÓRBITA','¡Nuevos contactos! Tres más, uno es un interceptor Víbora. Cuidado con sus misiles.');}
  else if(MS.phase===1&&airLeft()===0)missionWin('Espacio aéreo despejado. Buen vuelo, Barbie 01.');},
 status:()=>`Derriba los cazas · quedan ${airLeft()}`},
{code:'M02',name:'PUÑO DE HIERRO',area:'Base aérea de Cerro Negro',time:360,par:2200,
 brief:'El enemigo lanza sus ataques desde la base aérea de Cerro Negro. Antiaéreos y lanzadores SAM la protegen, y un radar les indica a quién disparar. Arrasa la base para dejarlos sin alas.',
 obj:['Destruye todos los blancos marcados como TGT','Tumba el radar primero: sin él los SAM fallan más','Vuela bajo y rápido para escapar del fuego antiaéreo'],
 plan(R){const c=landPt(R,1600,1800,1200,60,320);const kinds=['radar','sam','sam','aa','aa','aa','aa','hangar','hangar','tank','tank'];
  const items=kinds.map(k=>{const p=landPt(R,c.x,c.z,360,4,700);return {k,x:p.x,z:p.z};});
  return {c,items,start:startToward(c,R()*6.28,3400),marks:[...items.map(i=>({x:i.x,z:i.z,t:'ground'})),{x:c.x,z:c.z,t:'label',label:'CERRO NEGRO'}]};},
 setup(P){P.items.forEach(i=>spawnGround(i.k,i.x,i.z,{primary:true}));spawnGroup(['fighter','fighter'],{x:P.c.x,y:1000,z:P.c.z},500);
  say('ÓRBITA','Barbie 01, objetivo a la vista: la base de Cerro Negro. Destruye todo lo marcado como TGT.');say('ÓRBITA','Su radar guía a los SAM. Si lo derribas, sus misiles pierden precisión.');},
 update(){if(!MS.flag.radarDown&&!enemies.some(e=>!e.dead&&e.type==='radar')){MS.flag.radarDown=1;say('ÓRBITA','Radar destruido. Sus SAM están disparando a ciegas.');}
  if(MS.phase===0&&primLeft()<=Math.floor(MS.total/2)){MS.phase=1;spawnGroup(['interceptor','interceptor'],null);say('ÓRBITA','Despegaron dos Víboras de un aeródromo cercano. Vienen por ti.');}
  if(primLeft()===0)missionWin('Base de Cerro Negro neutralizada. Ya no tienen desde dónde despegar.');},
 status:()=>`Blancos TGT: ${MS.total-primLeft()} / ${MS.total}`},
{code:'M03',name:'ALAS DEL PELÍCANO',area:'Corredor aéreo central',time:420,par:1800,
 brief:'El transporte Pelícano lleva medicinas y repuestos a la base Aurora, al otro lado del archipiélago. El enemigo conoce la ruta y enviará cazas a derribarlo. Tú eres su única escolta.',
 obj:['Protege al transporte Pelícano hasta que llegue a la base Aurora','Si el Pelícano cae, la misión fracasa','Los cazas enemigos irán directo por él'],
 plan(R){const a=landPt(R,-3500,-3300,600,5,260),b=landPt(R,3300,3300,600,5,260);
  const way=[{x:a.x,z:a.z},{x:-1500+R()*800,z:-900+R()*500},{x:600+R()*800,z:700+R()*600},{x:b.x,z:b.z}];
  return {way,route:way,start:{x:a.x-150,y:Math.max(1250,terrainH(a.x,a.z)+700),z:a.z-450,yaw:Math.atan2(way[1].x-a.x,way[1].z-a.z)},
   marks:[{x:a.x,z:a.z,t:'ally',label:'PELÍCANO'},{x:b.x,z:b.z,t:'base',label:'BASE AURORA'}]};},
 setup(P){spawnAlly(P.way);say('PELÍCANO','Barbie 01, aquí Pelícano. Vamos cargados hasta el techo. Cuídanos la espalda.');say('ÓRBITA','Cualquier bandido irá directo por el transporte. No te alejes demasiado.');},
 update(){const waves=[[14,['fighter','fighter']],[40,['fighter','interceptor','fighter']],[66,['interceptor','interceptor','fighter']]];
  if(MS.phase<waves.length&&MS.t>waves[MS.phase][0]&&ally&&!ally.dead){spawnGroup(waves[MS.phase][1],null,0,{tgt:ally,tgtChance:.6,near:ally.pos});
    say('ÓRBITA',['Dos bandidos entrando por el flanco.','Tres contactos más. Van por el Pelícano.','Última oleada. Defiende al transporte a toda costa.'][MS.phase]);MS.phase++;}
  if(ally&&!MS.flag.hurt&&ally.hp<ally.maxHp*.5){MS.flag.hurt=1;say('PELÍCANO','¡Perdimos un motor! ¡Quítennos a esos cazas de encima!');}
  if(!ally||ally.dead)missionFail('El Pelícano fue derribado. La carga se perdió.');
  else if(ally.arrived)missionWin('El Pelícano llegó a Aurora. Gracias, Barbie 01.');},
 status:()=>ally?`Protege al Pelícano · casco ${Math.ceil(ally.hp)} · tramo ${Math.min(ally.wp,3)}/3`:'El Pelícano cayó'},
{code:'M04',name:'CIELO ROJO',area:'Puerto Arena',time:300,par:2400,
 brief:'Bombarderos pesados despegaron rumbo a Puerto Arena con escolta de cazas. Llegan en dos grupos desde el norte. Si uno solo alcanza la ciudad, será una catástrofe.',
 obj:['Derriba todos los bombarderos antes de que lleguen a Puerto Arena','El segundo grupo aparece cerca del minuto','Los cazas de escolta son opcionales'],
 plan(R){const city=landPt(R,-900,-2200,700,12,160),g1={x:3600,z:3700},g2={x:-4300,z:3500};
  return {city,g1,g2,start:{x:city.x+200,y:Math.max(1400,terrainH(city.x,city.z)+800),z:city.z+400,yaw:Math.atan2(g1.x-city.x,g1.z-city.z)},
   marks:[{x:city.x,z:city.z,t:'city',label:'PUERTO ARENA'},{x:g1.x,z:g1.z,t:'air',label:'GRUPO 1'},{x:g2.x,z:g2.z,t:'air',label:'GRUPO 2'}],route:[g1,city]};},
 setup(P){buildCity(P.city);bomberGroup(P.g1,P.city);spawnGroup(['fighter','fighter'],{x:P.g1.x,y:1500,z:P.g1.z},250);
  say('ÓRBITA','Barbie 01, tres bombarderos con escolta vienen desde el noreste hacia Puerto Arena.');say('ÓRBITA','Ignora a los cazas si hace falta. Los bombarderos son la prioridad.');},
 update(){if(MS.phase===0&&MS.t>50){MS.phase=1;bomberGroup(MS.P.g2,MS.P.city);spawnGroup(['interceptor','fighter'],{x:MS.P.g2.x,y:1500,z:MS.P.g2.z},250);say('ÓRBITA','¡Segundo grupo de bombarderos desde el noroeste!');}
  const bs=enemies.filter(e=>!e.dead&&e.kind==='bomber');
  for(const b of bs){if(b.dist<480){missionFail('Un bombardero alcanzó Puerto Arena.');return;}if(b.dist<1800&&!MS.flag.close){MS.flag.close=1;say('ÓRBITA','¡Un bombardero está a menos de 2 km de la ciudad!');}}
  if(MS.phase===1&&bs.length===0)missionWin('Todos los bombarderos derribados. Puerto Arena está a salvo.');},
 status:()=>`Bombarderos en el aire: ${enemies.filter(e=>!e.dead&&e.kind==='bomber').length}${MS.phase===0?' · viene otro grupo':''}`},
{code:'M05',name:'MAREA DE ACERO',area:'Mar del Oeste',time:420,par:2600,
 brief:'Una flota enemiga navega hacia nuestras costas para apoyar la invasión. El crucero insignia y sus destructores tienen cañones antiaéreos y misiles SAM. Húndelos a todos.',
 obj:['Hunde el crucero y los tres destructores','Los buques disparan fuego antiaéreo y misiles','Usa misiles y cohetes: el cañón hace poco daño a un casco blindado'],
 plan(R){const c=waterPt(R,-3000,2500,1500);const offs=[['cruiser',0,0],['ship',260,-200],['ship',-260,-200],['ship',0,330]];const yaw=R()*6.28;
  const ships=offs.map(([k,dx,dz])=>{let x=c.x+dx,z=c.z+dz;if(terrainH(x,z)>-30){const w=waterPt(R,x,z,300);x=w.x;z=w.z;}return {k,x,z};});
  return {c,ships,yaw,start:startToward(c,R()*6.28,3500),marks:[...ships.map(s=>({x:s.x,z:s.z,t:'ship'})),{x:c.x,z:c.z,t:'label',label:'FLOTA ENEMIGA'}]};},
 setup(P){P.ships.forEach(s=>spawnGround(s.k,s.x,s.z,{primary:true,yaw:P.yaw}));spawnGroup(['fighter','fighter','fighter'],{x:P.c.x,y:1100,z:P.c.z},500);
  say('ÓRBITA','Flota enemiga confirmada: un crucero y tres destructores, Barbie 01.');say('ÓRBITA','Mantén la distancia de sus antiaéreos y ataca con misiles.');},
 update(){if(MS.phase===0&&primLeft()<=2){MS.phase=1;spawnGroup(['interceptor','interceptor'],{x:MS.P.c.x,y:1200,z:MS.P.c.z},400);say('ÓRBITA','El crucero lanzó dos Víboras desde su cubierta.');}
  if(primLeft()===0)missionWin('La flota se va a pique. El oeste es nuestro.');},
 status:()=>`Buques hundidos: ${MS.total-primLeft()} / ${MS.total}`},
{code:'M06',name:'AS DE ASES',area:'Cordillera Central',time:360,par:2400,
 brief:'El escuadrón Titán, los mejores pilotos enemigos, te desafió sobre la cordillera. Su líder vuela un caza pesado modificado y no perdona errores. Derriba al Titán y la guerra termina.',
 obj:['Derriba al Titán, líder del escuadrón enemigo','Sus dos alas Espectro Negro vuelan con él','Cuando pierda la mitad del casco pedirá refuerzos'],
 plan(R){const c={x:-300+R()*600,z:-300+R()*600};return {c,start:startToward(c,R()*6.28,3200),marks:[{x:c.x,z:c.z,t:'air',label:'ESCUADRÓN TITÁN'}]};},
 setup(P){MS.boss=spawnEnemy('boss',new V3(P.c.x,1500,P.c.z));MS.boss.primary=true;spawnGroup(['ace','ace'],{x:P.c.x,y:1500,z:P.c.z},250);
  say('TITÁN','Así que tú eres Barbie 01. Te imaginaba más alto.');say('TITÁN','Escuadrón Titán, rompan formación. Esta noche termina su leyenda.');say('ÓRBITA','No te dejes provocar, Barbie 01. Derriba al líder.');},
 update(){const b=MS.boss;
  if(MS.phase===0&&b.hp<b.maxHp*.5){MS.phase=1;b.speedMul=1.15;b.mslMul=.55;spawnGroup(['interceptor','interceptor'],null);say('TITÁN','¡Nadie me había tocado así! ¡Todos a mí, ahora!');}
  if(!MS.flag.taunt&&MS.t>45&&!b.dead){MS.flag.taunt=1;say('TITÁN','Vuelas bien... pero el cielo tiene un solo dueño.');}
  if(MS.phase<2&&b.dead){MS.phase=2;say('ÓRBITA','¡El Titán cayó! Barbie 01, limpia lo que queda de su escuadrón.');}
  if(MS.phase===2&&airLeft()===0)missionWin('No queda nadie en el cielo. Barbie 01, eres el as de esta guerra.');},
 status:()=>MS.boss&&!MS.boss.dead?`Derriba al Titán · casco ${Math.ceil(MS.boss.hp)}`:`Elimina al escuadrón · quedan ${airLeft()}`}
];

let progress={unlocked:1,ranks:{}};
try{const p=JSON.parse(localStorage.getItem('acecombat-progress')||'null');if(p&&p.unlocked)progress=p;}catch(e){}
function saveProgress(){try{localStorage.setItem('acecombat-progress',JSON.stringify(progress));}catch(e){}}
const fmtT=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
function updateMission(dt){
  if(!MS||player.grounded)return;MS.t+=dt;
  if(!MS.done){MS.timeLeft-=dt;if(MS.timeLeft<=0){MS.timeLeft=0;missionFail('Se acabó el tiempo de la misión.');return;}MS.def.update(dt);}
  else{MS.endT-=dt;if(MS.endT<=0&&player.alive)showResult();}
}
function missionWin(msg){if(MS.done)return;MS.done=true;MS.result='win';MS.reason=msg;MS.endT=4.5;say('ÓRBITA',msg);showMsg('MISIÓN CUMPLIDA','',3.5);sfx('power');}
function missionFail(msg){if(MS.done)return;MS.done=true;MS.result='fail';MS.reason=msg;MS.endT=4;showMsg('MISIÓN FALLIDA',msg,3.5,true);sfx('alarm');}
function showResult(){
  if(state==='result'||!MS)return;state='result';deadT=0;const d=MS.def,win=MS.result==='win',tl=Math.max(0,Math.round(MS.timeLeft));
  player.obj.visible=player.alive;
  let rank='—';
  if(win){const rs=score+tl*3-MS.dmg*.4,k=rs/d.par;rank=k>=1.25?'S':k>=1?'A':k>=.75?'B':'C';
    progress.unlocked=Math.max(progress.unlocked,curMission+2);const ord='CBAS',prev=progress.ranks[curMission];
    if(!prev||ord.indexOf(rank)>ord.indexOf(prev))progress.ranks[curMission]=rank;saveProgress();}
  const last=curMission>=MISSIONS.length-1;
  $('rCode').textContent=d.code+' · '+d.name;$('rTitle').textContent=win?(last?'CAMPAÑA COMPLETADA':'MISIÓN CUMPLIDA'):'MISIÓN FALLIDA';$('rTitle').classList.toggle('red',!win);
  $('rReason').textContent=MS.reason||'';$('rRank').textContent=rank;$('rRank').classList.toggle('fail',!win);
  $('rScore').textContent=score.toLocaleString('es-CO');$('rTime').textContent=fmtT(d.time-tl);$('rKills').textContent=kills;$('rDmg').textContent=Math.round(MS.dmg);
  $('rNext').hidden=!win||last;
  $('ui').hidden=true;hc.setTransform(DPR,0,0,DPR,0,0);hc.clearRect(0,0,HW,HH);if(document.pointerLockElement)document.exitPointerLock();if(A.engG)A.engG.gain.value=0;
  showScreen('result');musicStart();
}
function renderMissions(){
  $('mList').innerHTML=MISSIONS.map((m,i)=>{const lock=i>=progress.unlocked,r=progress.ranks[i]||'';
    return `<button class="mitem" type="button" data-i="${i}" ${lock?'disabled':''}><span class="c">${m.code}</span><span><span class="n">${lock?'BLOQUEADA':m.name}</span><span class="a">${lock?'Completa la misión anterior':m.area}</span></span><span class="r">${r||(lock?'—':'·')}</span></button>`;}).join('');
  $('mList').querySelectorAll('.mitem').forEach(b=>b.onclick=()=>openBrief(+b.dataset.i));
}
function updateProg(){const done=Object.keys(progress.ranks).length;$('mProg').textContent=`${done}/${MISSIONS.length} COMPLETADAS`;}
function openMissions(){renderMissions();showScreen('missions');const f=$('mList').querySelector('.mitem:not([disabled]):last-of-type')||$('mList').querySelector('.mitem');if(f&&!isTouch)try{f.focus({preventScroll:true});}catch(e){}}
function openBrief(i){
  curMission=i;const d=MISSIONS[i];briefPlan=d.plan(mulberry(9000+i*131));
  $('bCode').textContent='SESIÓN INFORMATIVA · '+d.code;$('bArea').textContent=d.area.toUpperCase();$('bName').textContent=d.name;$('bText').textContent=eraText(d.brief);
  $('bObj').innerHTML=d.obj.map(o=>`<li>${eraText(o)}</li>`).join('');
  $('bInfo').textContent=`Tiempo límite: ${Math.floor(d.time/60)} min (+1 si despegas desde tierra; el reloj arranca al despegar). Para rango S termina rápido, con muchos derribos y poco daño.`;
  $('bPlaneName').textContent=PLANES[planeIdx].name;showScreen('brief');drawBriefMap(briefPlan);
}
function startMission(){
  if(state==='play'||!briefPlan)return;audioInit();musicStop();camera.clearViewOffset();mode='mission';resetGame();
  const d=MISSIONS[curMission],P=briefPlan,o=player.obj;const LS=launchSpot(P);applyLaunch(LS);camQ.copy(o.quaternion);
  waveState='mission';wave=0;
  MS={def:d,P,t:0,timeLeft:d.time+(LS.mode==='air'?0:60),phase:0,flag:{},done:false,dmg:0,total:0,endT:0};d.setup(P);MS.total=enemies.filter(e=>e.primary).length;
  showScreen(null);$('ui').hidden=false;state='play';showMsg(d.code+' · '+d.name,d.area,3.2);
}
let mapImg=null;
function getMapImg(){
  if(mapImg)return mapImg;const S=200,cv=document.createElement('canvas');cv.width=cv.height=S;const c=cv.getContext('2d'),img=c.createImageData(S,S);
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){const x=-WORLD+(i+.5)/S*2*WORLD,z=WORLD-(j+.5)/S*2*WORLD,h=terrainH(x,z);let r,g,b;
    if(h<0){const k=clamp(-h/600,0,1);r=24-12*k;g=78-34*k;b=118-44*k;}else if(h<200){r=70;g=112;b=60;}else if(h<550){r=86;g=96;b=64;}else if(h<800){r=118;g=110;b=96;}else{r=210;g=214;b=220;}
    let l=1;if(h>0){const sh=terrainH(x-40,z+40)-h;l=clamp(1+sh*.004,.7,1.3);}
    const k4=(j*S+i)*4;img.data[k4]=r*l;img.data[k4+1]=g*l;img.data[k4+2]=b*l;img.data[k4+3]=255;}
  c.putImageData(img,0,0);return mapImg=cv;
}
function drawBriefMap(P){
  const cv=$('bMap'),c=cv.getContext('2d'),S=cv.width;c.imageSmoothingEnabled=true;c.drawImage(getMapImg(),0,0,S,S);
  c.fillStyle='rgba(6,18,26,.3)';c.fillRect(0,0,S,S);
  c.strokeStyle='rgba(134,255,189,.16)';c.lineWidth=1;c.font='12px "Share Tech Mono",monospace';c.fillStyle='rgba(134,255,189,.6)';
  for(let k=1;k<8;k++){const p=k*S/8;c.beginPath();c.moveTo(p,0);c.lineTo(p,S);c.moveTo(0,p);c.lineTo(S,p);c.stroke();}
  for(let k=0;k<8;k++){c.fillText('ABCDEFGH'[k],k*S/8+6,14);c.fillText(String(k+1),4,k*S/8+28);}
  const mp=(x,z)=>[(x+WORLD)/(2*WORLD)*S,(WORLD-z)/(2*WORLD)*S];
  if(P.route){c.setLineDash([8,6]);c.strokeStyle='#62dcff';c.lineWidth=2;c.beginPath();P.route.forEach((w,i)=>{const [x,y]=mp(w.x,w.z);i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();c.setLineDash([]);}
  c.font='bold 13px "Share Tech Mono",monospace';
  (P.marks||[]).forEach(m=>{const [x,y]=mp(m.x,m.z),fr=['ally','city','base'].includes(m.t),col=fr?'#62dcff':'#ff5468';c.fillStyle=col;c.strokeStyle=col;c.lineWidth=2;c.beginPath();
    if(m.t==='air'){c.moveTo(x,y-9);c.lineTo(x+8,y+7);c.lineTo(x-8,y+7);c.closePath();c.fill();}
    else if(m.t==='ground')c.fillRect(x-4,y-4,8,8);
    else if(m.t==='ship'){c.moveTo(x,y-7);c.lineTo(x+7,y);c.lineTo(x,y+7);c.lineTo(x-7,y);c.closePath();c.fill();}
    else if(m.t==='ally'){c.arc(x,y,8,0,6.29);c.stroke();}
    else if(m.t==='city'||m.t==='base')c.strokeRect(x-9,y-9,18,18);
    if(m.label){c.fillStyle=m.t==='label'?'#ffbe55':col;const lw=c.measureText(m.label).width;c.fillText(m.label,x+12+lw>S-6?x-12-lw:x+12,y-10);}});
  const lbl=(t,x,y,col)=>{c.fillStyle=col;const w=c.measureText(t).width;c.fillText(t,x+12+w>S-6?x-12-w:x+12,y);};
  {const B=BASE,[ax,ay]=mp(B.x-B.s*B.L/2,B.z-B.c*B.L/2),[bx,by]=mp(B.x+B.s*B.L/2,B.z+B.c*B.L/2);c.strokeStyle='#62dcff';c.lineWidth=5;c.beginPath();c.moveTo(ax,ay);c.lineTo(bx,by);c.stroke();lbl('BASE CÓNDOR',(ax+bx)/2,(ay+by)/2+18,'#62dcff');}
  const LS=launchSpot(P);
  if(LS.mode==='carrier'){const [qx,qy]=mp(LS.x,LS.z);c.save();c.translate(qx,qy);c.rotate(LS.yaw);c.fillStyle='#62dcff';c.fillRect(-4,-12,8,24);c.restore();lbl('BASTIÓN',qx,qy+20,'#62dcff');}
  const [sx,sy]=mp(LS.x,LS.z);c.save();c.translate(sx,sy);c.rotate(LS.yaw);c.fillStyle='#ffffff';c.beginPath();c.moveTo(0,-11);c.lineTo(8,8);c.lineTo(0,4);c.lineTo(-8,8);c.closePath();c.fill();c.restore();
  c.fillStyle='#ffffff';const bw=c.measureText('BARBIE 01').width;c.fillText('BARBIE 01',sx+12+bw>S-6?sx-12-bw:sx+12,sy+16);
  c.strokeStyle='rgba(134,255,189,.6)';c.lineWidth=2;c.strokeRect(1,1,S-2,S-2);
}
