// Ace Combat · Estado del juego, épocas, aviones y armas
'use strict';

/* ---------------- Game state ---------------- */
/* ---------------- Épocas: moderna y Segunda Guerra Mundial ---------------- */
const ERAS={
  modern:{key:'modern',name:'MODERNA',spd:1,bullet:1600,ebullet:1350,gunRange:1,rkt:950,minS:95,base:110,thr:230,boostBase:340,boostAdd:230,maxS:640,sink:130,grav:120,radar:3600,spawn:1,VR:135,VRc:118,acc:40,catAcc:88},
  ww2:{key:'ww2',name:'SEGUNDA GUERRA',spd:.55,bullet:880,ebullet:820,gunRange:.7,rkt:430,minS:48,base:52,thr:98,boostBase:150,boostAdd:45,maxS:215,sink:68,grav:70,radar:2400,spawn:.6,VR:62,VRc:56,acc:22,catAcc:46}
};
let ERA='modern';try{if(localStorage.getItem('acecombat-era')==='ww2')ERA='ww2';}catch(e){}
let E=ERAS[ERA];
const WEAPONS_BY={
  modern:[
    {id:'gun',name:'CAÑÓN M61',mag:250,reserve:1500,rate:18,reload:2.2,dmg:14},
    {id:'msl',name:'MISILES IR',mag:6,reserve:24,rate:1.5,reload:3.6,dmg:240},
    {id:'rkt',name:'COHETES',mag:16,reserve:64,rate:9,reload:2.8,dmg:80}],
  ww2:[
    {id:'gun',name:'AMETRALLADORAS',mag:400,reserve:2400,rate:13,reload:2.4,dmg:12},
    {id:'bomb',name:'BOMBAS 250 KG',mag:4,reserve:16,rate:2.5,reload:4,dmg:420},
    {id:'rkt',name:'COHETES',mag:8,reserve:40,rate:5,reload:3,dmg:110}]
};
let WEAPONS=WEAPONS_BY[ERA];
const ETYPES_BY={
  modern:{
    fighter:{v:'std',name:'HALCÓN',hp:500,speed:255,turn:1.0,body:0x5d636b,accent:0xb43a3a,scale:1,msl:false,score:100,gun:7},
    interceptor:{v:'delta',name:'VÍBORA',hp:650,speed:305,turn:1.15,body:0x3e4b3c,accent:0xd98b2b,scale:1.05,msl:true,mslCd:11,score:160,gun:8},
    ace:{v:'fsw',name:'ESPECTRO NEGRO',hp:700,speed:300,turn:1.3,body:0x17191c,accent:0x9b2bd9,scale:1.05,msl:true,mslCd:9,score:300,gun:9},
    boss:{v:'heavy',name:'TITÁN',hp:1000,speed:235,turn:.85,body:0x1e2026,accent:0xe2b232,scale:1.7,msl:true,mslCd:5.5,score:650,gun:11}},
  ww2:{
    fighter:{v:'p1',name:'HALCÓN',hp:500,speed:140,turn:1.05,body:0x6b6f58,accent:0xb43a3a,scale:1,msl:false,score:100,gun:7},
    interceptor:{v:'p2',name:'ZORRO',hp:600,speed:162,turn:1.2,body:0x8a8f86,accent:0xd98b2b,scale:1,msl:false,score:160,gun:8},
    ace:{v:'p3',name:'BARÓN NEGRO',hp:700,speed:160,turn:1.35,body:0x1d1f22,accent:0x9b2bd9,scale:1.05,msl:false,score:300,gun:10},
    boss:{v:'p4',name:'TITÁN',hp:1000,speed:130,turn:.9,body:0x2a2c22,accent:0xe2b232,scale:1.6,msl:false,score:650,gun:13}}
};
let ETYPES=ETYPES_BY[ERA];
const WW2TXT=[['Antiaéreos y lanzadores SAM','Cañones antiaéreos ligeros y pesados'],['Su radar guía a los SAM. Si lo derribas, sus misiles pierden precisión.','Su radar guía a los antiaéreos. Si lo derribas, su puntería empeora.'],
  ['sin él los SAM fallan más','sin él los antiaéreos fallan más'],['Sus SAM están disparando a ciegas.','Sus antiaéreos disparan a ciegas.'],['Cuidado con sus misiles.','Cuidado, es más rápido que tú.'],
  ['interceptor Víbora','caza Zorro'],['Víboras','Zorros'],['Víbora','Zorro'],['fuego antiaéreo y misiles','fuego antiaéreo pesado'],
  ['Usa misiles y cohetes: el cañón hace poco daño a un casco blindado','Usa bombas y cohetes: las ametralladoras hacen poco daño a un casco blindado'],['ataca con misiles','ataca con bombas'],
  ['Espectro Negro','Barón Negro'],['caza pesado modificado','caza pesado con ocho ametralladoras'],['AWACS Órbita','control Órbita']];
function eraText(s){if(ERA!=='ww2')return s;for(const [a,b] of WW2TXT)s=s.split(a).join(b);return s;}
const flareRegenT=()=>ERA==='ww2'?25:10;
const PU={repair:{c:0x5dff8c,label:'REPARACIÓN +300'},ammo:{c:0xffbe55,label:'MUNICIÓN COMPLETA'},shield:{c:0x62dcff,label:'ESCUDO ACTIVADO'},od:{c:0xff6be0,label:'OVERDRIVE ACTIVADO'}};

const PLANES_BY={
  modern:[
    {name:'CÓNDOR F-1',role:'CAZA MULTIRROL',v:'std',body:0x8c9aa8,accent:0x2d6aa0,ab:0xff9a3c,scale:1,hp:1000,spd:1,agi:1,dmg:1,desc:'El caza del escuadrón. Sin puntos débiles: buena velocidad, buen giro y blindaje completo.'},
    {name:'HALCÓN X-7',role:'INTERCEPTOR',v:'delta',body:0xc3cad0,accent:0xc23b3b,ab:0xff9a3c,scale:1,hp:800,spd:1.2,agi:1,dmg:.95,desc:'Ala delta con canards. Es el más rápido en línea recta, pero su casco es más delgado.'},
    {name:'ESPECTRO S-9',role:'FURTIVO EXPERIMENTAL',v:'fsw',body:0x2a2f35,accent:0x3ad6ff,ab:0x62a8ff,scale:1,hp:900,spd:1.08,agi:1.3,dmg:1.05,desc:'Alas en flecha invertida. Cierra los giros más que cualquier otro avión del hangar.'},
    {name:'YAGUARETÉ A-4',role:'ATAQUE PESADO',v:'heavy',body:0x69714f,accent:0xd9a03b,ab:0xff8a2a,scale:1.12,hp:1250,spd:.86,agi:.8,dmg:1.35,desc:'Blindado y lento, con tanque ventral. Sus armas pegan un tercio más fuerte.'},
    {name:'NOVA Z-1',role:'PROTOTIPO FUTURISTA',v:'delta',body:0xeceff2,accent:0xff6a1a,ab:0x4fc8ff,scale:1,hp:950,spd:1.12,agi:1.15,dmg:1.15,desc:'Motores de plasma azul. Rápido, ágil y con daño aumentado en todas sus armas.'}],
  ww2:[
    {name:'GAVIOTA P-5',role:'CAZA DE ESCOLTA',v:'p1',body:0x9aa3a8,accent:0x2d5aa0,scale:1,hp:1000,spd:1,agi:1,dmg:1,desc:'Motor en línea y largo alcance. Equilibrado en velocidad, giro y blindaje.'},
    {name:'COLIBRÍ MK.9',role:'INTERCEPTOR LIGERO',v:'p2',body:0x7d8a64,accent:0xc23b3b,scale:.95,hp:800,spd:1.06,agi:1.28,dmg:.95,desc:'Ala elíptica y poco peso. Gira más cerrado que nadie, pero aguanta menos.'},
    {name:'CORSARIO F-4',role:'CAZA EMBARCADO',v:'p3',body:0x2c4a73,accent:0xe8ecef,scale:1.05,hp:1100,spd:1.05,agi:.95,dmg:1.1,desc:'Alas de gaviota invertida y motor radial enorme. Fuerte, rápido y hecho para portaaviones.'},
    {name:'MAMUT P-9',role:'CAZABOMBARDERO',v:'p4',body:0x8f8a72,accent:0xd9a03b,scale:1.12,hp:1300,spd:.92,agi:.8,dmg:1.35,desc:'Un tanque con alas: ocho ametralladoras, blindaje grueso y bombas pesadas.'},
    {name:'COMETA R-1',role:'PROTOTIPO A REACCIÓN',v:'pjet',body:0x6f7560,accent:0xe0c060,ab:0xff9a3c,scale:1,hp:900,spd:1.3,agi:.9,dmg:1.15,desc:'Uno de los primeros cazas a reacción. Nadie lo alcanza en recta, pero gira con dificultad.'}]
};
let PLANES=PLANES_BY[ERA];
let planeIdx=0;
let view='splash',lastShot=-1,mfdT=0;
let state='menu',time=0,shake=0,camMode=1,wave=0,waveState='idle',waveT=0,score=0,kills=0,combo=0,comboT=0;
const opts={invert:false};
const keys={},mouse={x:0,y:0,down:false},touch={x:0,y:0,fire:false,boost:false};
const enemies=[],missiles=[],flares=[],powerups=[],debris=[],dmgTexts=[];
let W,wIdx=0,switchT=0,reloadT=0,reloadDur=0,fireCd=0,autoFire=false,lockCand=null,lockT=0,locked=null,lockBeep=0,hitMarkT=0,alarmT=0,deadT=0;

const player={P:PLANES[0],thr:.65,obj:makeJet(0x8c9aa8,0x2d6aa0,1),speed:260,vel:new V3(),hp:1000,maxHp:1000,rp:0,rr:0,ry:0,energy:100,
  shieldT:0,shieldCd:0,odT:0,odCd:0,flares:3,flareRegen:0,invuln:0,alive:true,outT:0,ab:.7,gunSpin:0,boosting:false,gforce:1};
scene.add(player.obj);
const shieldMesh=new THREE.Mesh(new THREE.IcosahedronGeometry(17,2),new THREE.MeshBasicMaterial({color:0x62dcff,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,wireframe:true}));
shieldMesh.visible=false;player.obj.add(shieldMesh);
function setPlane(i){
  planeIdx=(i+PLANES.length)%PLANES.length;const P=PLANES[planeIdx],old=player.obj;
  const n=makePlane(P);n.position.copy(old.position);n.quaternion.copy(old.quaternion);
  old.remove(shieldMesh);scene.remove(old);n.add(shieldMesh);scene.add(n);player.obj=n;player.P=P;
  try{localStorage.setItem('acecombat-plane-'+ERA,planeIdx);}catch(e){}
  updateHangar();
}
function updateHangar(){
  const P=PLANES[planeIdx];$('hName').textContent=P.name;$('hRole').textContent=P.role;$('hDesc').textContent=P.desc;$('mPlane').textContent=P.name;
  $('bPlaneName').textContent=P.name;$('hEye').textContent='HANGAR · '+E.name;
  $('hDots').innerHTML=PLANES.map((_,i)=>`<i class="${i===planeIdx?'on':''}"></i>`).join('');
  const st=[['VELOCIDAD',P.spd/1.2,Math.round((E.boostBase+E.boostAdd)*P.spd*1.944)+' KT'],['AGILIDAD',P.agi/1.3,Math.round(P.agi*100)+'%'],['BLINDAJE',P.hp/1250,P.hp+' HP'],['POTENCIA',P.dmg/1.35,'×'+P.dmg.toFixed(2)]];
  $('hStats').innerHTML=st.map(([k,v,t])=>`<div class="st"><span class="k">${k}</span><div class="bar"><i style="width:${Math.round(v*100)}%"></i></div><b>${t}</b></div>`).join('');
}

/* bullets */
const BULLETS=[];for(let i=0;i<380;i++){const m=new THREE.Mesh(GEO.tracer,M.trP);m.visible=false;scene.add(m);BULLETS.push({m,pos:new V3(),prev:new V3(),vel:new V3(),life:0,dmg:0,owner:'p'});}
let bI=0;
function spawnBullet(pos,vel,dmg,owner,mat){const b=BULLETS[bI];bI=(bI+1)%BULLETS.length;b.pos.copy(pos);b.prev.copy(pos);b.vel.copy(vel);b.life=1.5;b.dmg=dmg;b.owner=owner;
  b.m.material=mat;b.m.visible=true;b.m.position.copy(pos);b.m.quaternion.setFromUnitVectors(AZ,_v3.copy(vel).normalize());}
/* ---------------- Helpers ---------------- */
const fwdOf=(q,out=new V3())=>out.set(0,0,1).applyQuaternion(q);
function segDist(a,b,p){_s1.subVectors(b,a);_s2.subVectors(p,a);const L=_s1.lengthSq();const t=L>0?clamp(_s2.dot(_s1)/L,0,1):0;return _s2.sub(_s1.multiplyScalar(t)).length();}
function localToWorld(obj,x,y,z,out=new V3()){return obj.localToWorld(out.set(x,y,z));}
function feed(t){const d=document.createElement('div');d.textContent=t;$('feed').prepend(d);while($('feed').children.length>4)$('feed').lastChild.remove();setTimeout(()=>d.remove(),4500);}
let msgT=0;
function showMsg(big,sub='',dur=2.5,alert=false){$('msgBig').textContent=big;$('msgSub').textContent=sub;$('msgBig').classList.toggle('alert',alert);$('msg').style.opacity=1;msgT=dur;}
/* ---------------- Weapons ---------------- */
function buildSlots(){const el=$('slots');el.innerHTML='';WEAPONS.forEach((w,i)=>{const d=document.createElement('div');d.className='slot panel';d.id='slot'+i;
  d.innerHTML=`<div class="nm">${w.name}<span>${i+1}</span></div><div class="am"><b>0</b><small> / 0</small></div><div class="rl"><i></i></div>`;el.appendChild(d);});}
buildSlots();
function selectWeapon(i){if(i===wIdx||!player.alive)return;wIdx=i;switchT=.38;reloadT=0;lockT=0;locked=null;sfx('switch');const s=$('slot'+i);s.classList.remove('swap');void s.offsetWidth;s.classList.add('swap');}
function cycleWeapon(d){selectWeapon((wIdx+d+WEAPONS.length)%WEAPONS.length);}
function startReload(){const w=W[wIdx];if(reloadT>0||w.ammo>=w.def.mag||w.reserve<=0)return;reloadDur=reloadT=w.def.reload;sfx('reload');}
function finishReload(){const w=W[wIdx];const take=Math.min(w.def.mag-w.ammo,w.reserve);w.ammo+=take;w.reserve-=take;sfx('reload');}
let emptyMsgT=0,shotN=0;
let easyCtl=true;try{easyCtl=localStorage.getItem('acecombat-ctl')!=='pro';}catch(e){}
const _aa=new V3();
function aimAssist(dir,spd,range){
  if(!easyCtl)return;const pp=player.obj.position;let best=null,bd=.992;
  for(const e of enemies){if(e.dead)continue;const d=e.pos.distanceTo(pp);if(d>range)continue;
    _aa.copy(e.pos).addScaledVector(_v4.subVectors(e.vel,player.vel),d/spd).sub(pp).normalize();const k=_aa.dot(dir);if(k>bd){bd=k;best=_aa.clone();}}
  if(best)dir.lerp(best,.8).normalize();
}
function setCtl(v){easyCtl=v;try{localStorage.setItem('acecombat-ctl',v?'easy':'pro');}catch(e){}
  document.querySelectorAll('.ctlTxt').forEach(el=>el.textContent=v?'FÁCIL':'AVANZADO');player.bankA=0;player.pr=0;player.tr=0;}
function playerFire(){if(player.grounded)return;
  const w=W[wIdx];if(switchT>0||reloadT>0||fireCd>0||!player.alive)return;
  if(w.ammo<=0){if(w.reserve>0)startReload();else if(emptyMsgT<=0){showMsg('SIN MUNICIÓN','Busca una caja ámbar o cambia de arma',1.6,true);sfx('empty');emptyMsgT=2;}return;}
  const od=player.odT>0,o=player.obj,f=fwdOf(o.quaternion,_v2);
  fireCd=1/(w.def.rate*(od?1.8:1));const dmg=w.def.dmg*(od?1.5:1)*player.P.dmg;lastShot=time;
  if(w.def.id==='gun'){
    const GJ=o.userData.guns,gp=GJ&&GJ.length?GJ[(shotN++)%GJ.length]:null;
    const p=gp?localToWorld(o,gp[0],gp[1],gp[2],_v1):localToWorld(o,1.0,.45,9.2,_v1);const dir=_v3.copy(f).add(rv(gp?.01:.007)).normalize();aimAssist(dir,E.bullet,1600*E.gunRange);
    spawnBullet(p,dir.multiplyScalar(E.bullet).add(player.vel),dmg,'p',od?M.trO:M.trP);
    player.gunSpin=40;emit(FIRE,p,player.vel,.05,gp?2.5:3,gp?6:7,0xfff2b0,0xff9030,1);sfx('gun',.8);
  }else if(w.def.id==='msl'){
    const p=o.userData.msl[w.ammo-1].getWorldPosition(_v1);
    spawnMissile(p,f,player.speed,locked,'p',dmg,false);sfx('msl');
  }else if(w.def.id==='bomb'){
    const bm=o.userData.msl[w.ammo-1],p=bm?bm.getWorldPosition(_v1):localToWorld(o,0,-1.6,0,_v1);spawnBomb(p,player.vel,dmg);sfx('bomb');
  }else{
    const s=(w.ammo%2)?1:-1;const p=localToWorld(o,1.5*s,-1.3,2.5,_v1);const dir=_v3.copy(f).add(rv(.012)).normalize();aimAssist(dir,E.rkt*.7,1300*E.gunRange);
    spawnMissile(p,dir,player.speed+120,null,'p',dmg,true);sfx('rkt');
  }
  w.ammo--;
  if(w.ammo===0&&w.reserve>0)startReload();
}
function updateWeapons(dt){
  const w=W[wIdx];fireCd-=dt;emptyMsgT-=dt;if(w.def.id==='bomb')calcCCIP();else ccipPt=null;
  if(switchT>0)switchT-=dt;
  if(reloadT>0){reloadT-=dt;if(reloadT<=0){reloadT=0;finishReload();}}
  let want=keys.Space||mouse.down||touch.fire;
  if(autoFire&&!want&&player.alive){
    if(w.def.id==='msl')want=!!locked;
    else if(w.def.id==='bomb'){if(ccipPt)for(const e of enemies){if(!e.dead&&e.kind!=='air'&&e.pos.distanceTo(ccipPt)<35+e.r){want=true;break;}}}
    else{const f=fwdOf(player.obj.quaternion,_v2);const cone=w.def.id==='gun'?.996:.997,range=(w.def.id==='gun'?1500:1200)*E.gunRange;
      for(const e of enemies){if(e.dead)continue;_v1.subVectors(e.pos,player.obj.position);const d=_v1.length();
        if(d<range){_v1.addScaledVector(_v3.subVectors(e.vel,player.vel),d/E.bullet).normalize();if(_v1.dot(f)>cone){want=true;break;}}}}
  }
  if(want)playerFire();
  // missile pylon visuals
  const J=player.obj.userData,mw=W[1],nm=J.msl.length;let vis=mw.ammo;
  if(wIdx===1&&reloadT>0)vis=Math.min(nm,mw.ammo+Math.floor((1-reloadT/reloadDur)*Math.min(nm-mw.ammo,mw.reserve)));
  J.msl.forEach((m,i)=>m.visible=i<vis);
}
function updateLock(dt){
  const f=fwdOf(player.obj.quaternion,_v2);let best=null,bd=.93;
  for(const e of enemies){if(e.dead)continue;_v1.subVectors(e.pos,player.obj.position);const d=_v1.length();if(d>3400)continue;const dot=_v1.normalize().dot(f);if(dot>bd){bd=dot;best=e;}}
  if(best!==lockCand){lockCand=best;lockT=0;locked=null;}
  if(lockCand&&W[wIdx].def.id==='msl'&&switchT<=0){
    lockT+=dt;lockBeep-=dt;
    if(lockT>=.9){if(!locked){locked=lockCand;sfx('locked');}if(lockBeep<=0){lockBeep=.6;sfx('locked');}}
    else if(lockBeep<=0){lockBeep=.16;sfx('lock');}
  }else{lockT=0;locked=null;}
}
/* ---------------- Missiles & rockets ---------------- */
function spawnMissile(pos,dir,base,target,owner,dmg,rocket){
  const mesh=makeMissileMesh(rocket?.8:owner==='e'?1.2:1);mesh.position.copy(pos);scene.add(mesh);
  missiles.push({mesh,pos:mesh.position,prev:pos.clone(),dir:dir.clone(),speed:base+30,target,owner,dmg,rocket,life:rocket?4:owner==='p'?7:9,smokeT:0,armed:.12});
}
const tPos=t=>t.obj?t.obj.position:t.pos;
const tDead=t=>!t||t.dead||(t===player&&!player.alive)||(t.life!==undefined&&t.life<=0);
function updateMissiles(dt){
  for(let i=missiles.length-1;i>=0;i--){const m=missiles[i];if(m.bomb){updateBomb(m,i,dt);continue;}m.life-=dt;m.armed-=dt;
    const max=m.rocket?E.rkt:m.owner==='p'?860:600;m.speed=Math.min(max,m.speed+(m.rocket?700:430)*dt);
    if(!m.rocket&&m.target&&!tDead(m.target)){const tp=tPos(m.target);const tv=m.target.vel||_v4.set(0,0,0);const d=m.pos.distanceTo(tp);
      _v1.copy(tp).addScaledVector(tv,d/max*.5).sub(m.pos).normalize();m.dir.lerp(_v1,clamp((m.turn||(m.owner==='p'?3.2:1.55))*dt,0,1)).normalize();}
    m.prev.copy(m.pos);m.pos.addScaledVector(m.dir,m.speed*dt);m.mesh.quaternion.setFromUnitVectors(AZ,m.dir);
    m.smokeT-=dt;if(m.smokeT<=0){m.smokeT=.018;_v1.copy(m.pos).addScaledVector(m.dir,-2.4);
      emit(SMOKE,_v1,rv(4),m.rocket?.9:1.7,2.5,m.rocket?9:15,0xdedede,0xa0a0a0,.6,-3,.5);emit(FIRE,_v1,_v2.set(0,0,0),.07,3.5,1.5,0xffe0a0,0xff7020,1);}
    let boom=false;
    if(m.armed<=0){
      if(m.owner==='p'){for(const e of enemies){if(e.dead)continue;if(segDist(m.prev,m.pos,e.pos)<e.r+(m.rocket?5:9)){boom=true;break;}}
        if(boom&&m.rocket){for(const e of enemies){if(e.dead)continue;const d=e.pos.distanceTo(m.pos);if(d<75)damageEnemy(e,m.dmg*(d<e.r+6?1:.5),m.pos);}}
        else if(boom){for(const e of enemies){if(!e.dead&&e.pos.distanceTo(m.pos)<e.r+14){damageEnemy(e,m.dmg,m.pos);break;}}}
      }else{
        if(m.target===player&&player.alive&&segDist(m.prev,m.pos,player.obj.position)<16){boom=true;hurtPlayer(m.dmg);}
        else if(ally&&m.target===ally&&!ally.dead&&segDist(m.prev,m.pos,ally.pos)<ally.r+4){boom=true;hurtAlly(m.dmg);}
        else if(m.target&&m.target.life!==undefined&&m.pos.distanceTo(m.target.pos)<24)boom=true;
      }
    }
    if(!boom&&m.pos.y<1300&&m.pos.y<Math.max(terrainH(m.pos.x,m.pos.z),0)+2){boom=true;if(m.owner==='p')for(const e of enemies){if(!e.dead&&e.kind!=='air'){const d=e.pos.distanceTo(m.pos);if(d<(m.rocket?70:45)+e.r)damageEnemy(e,m.dmg*(m.rocket?.7:.6),m.pos);}}}
    if(boom||m.life<=0){explode(m.pos,m.rocket?.7:1.1);scene.remove(m.mesh);missiles.splice(i,1);}
  }
}
function dropFlares(){
  if(ERA==='ww2'){if(player.flares<=0||!player.alive||player.hp>=player.maxHp)return;player.flares--;player.hp=Math.min(player.maxHp,player.hp+120);sfx('pick');feed('EXTINTOR · +120 casco');flareFlick=.8;return;}
  if(player.flares<=0||!player.alive)return;player.flares--;sfx('flare');
  const o=player.obj;
  for(let i=0;i<6;i++){const p=localToWorld(o,rand(-3,3),-1,-6);const v=_v1.copy(player.vel).multiplyScalar(.35).add(new V3(rand(-60,60),rand(-80,-20),rand(-60,60)));
    flares.push({pos:p,vel:v.clone(),life:3});}
  let n=0;for(const m of missiles)if(m.owner==='e'&&m.target===player&&m.pos.distanceTo(o.position)<2200&&Math.random()<.8){m.target=flares[flares.length-1-(n++%6)];}
  if(n)feed(`BENGALAS: ${n} misil${n>1?'es':''} desviado${n>1?'s':''}`);
}
function updateFlares(dt){for(let i=flares.length-1;i>=0;i--){const f=flares[i];f.life-=dt;f.vel.y-=60*dt;f.vel.multiplyScalar(Math.exp(-.8*dt));f.pos.addScaledVector(f.vel,dt);
  emit(FIRE,f.pos,_v1.set(0,0,0),.25,9,3,0xffffff,0xffb050,1);if(Math.random()<.5)emit(SMOKE,f.pos,_v1.set(0,5,0),1.2,3,10,0xeeeeee,0xbbbbbb,.4);
  if(f.life<=0)flares.splice(i,1);}}
