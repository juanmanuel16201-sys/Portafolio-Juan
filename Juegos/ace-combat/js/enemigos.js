// Ace Combat · Enemigos, balas, premios y oleadas
'use strict';

/* ---------------- Enemies ---------------- */
function spawnEnemy(type,pos=null,opts={}){
  const T=ETYPES[type],obj=new THREE.Group(),model=makePlane(T);obj.add(model);
  if(!T.msl)model.userData.msl.forEach(m=>m.visible=false);
  const base=opts.near||player.obj.position;let x,y=null,z;
  if(pos){x=pos.x;y=pos.y;z=pos.z;}else{const a=rand(0,Math.PI*2),d=rand(2300,3500)*E.spawn;x=base.x+Math.cos(a)*d;z=base.z+Math.sin(a)*d;}
  x=clamp(x,-WORLD*.85,WORLD*.85);z=clamp(z,-WORLD*.85,WORLD*.85);
  const gh=Math.max(terrainH(x,z),0);y=y===null?gh+rand(550,1150):Math.max(y,gh+400);
  obj.position.set(x,y,z);
  const aim=opts.tgt&&opts.tgt.obj?opts.tgt.obj.position:player.obj.position;
  const dir=new V3().subVectors(aim,obj.position);dir.y*=.3;dir.normalize();
  obj.lookAt(_v1.copy(obj.position).add(dir));scene.add(obj);
  const e={obj,model,T,type,kind:'air',pos:obj.position,dir,vel:dir.clone().multiplyScalar(T.speed),speed:T.speed,hp:T.hp,maxHp:T.hp,r:12.5*T.scale,
    state:'attack',stateT:0,bank:0,fireCd:rand(1.5,3.5),mslCd:rand(5,9),burst:0,burstT:0,dead:false,breakDir:new V3(),
    tgt:opts.tgt&&Math.random()<(opts.tgtChance??1)?opts.tgt:null,primary:!!opts.primary};
  enemies.push(e);return e;
}
function damageEnemy(e,d,at){
  if(e.dead)return;e.hp-=d;hitMarkT=.14;sparks(at||e.pos);
  let t=dmgTexts.find(x=>x.e===e&&x.t>.35);if(t){t.v+=d;t.t=.9;}else dmgTexts.push({e,v:d,t:.9});
  if(e.hp<=0)killEnemy(e);
}
function killEnemy(e,crashed){
  e.dead=true;scene.remove(e.obj);explode(e.pos,e.T.boom||e.T.scale*1.7);
  for(let i=0;i<5;i++){const m=new THREE.Mesh(GEO.debris,cmat('b'+e.T.body,()=>M.dark));m.position.copy(e.pos);m.scale.setScalar(e.T.scale*rand(.6,1.4));scene.add(m);
    debris.push({m,vel:_v1.copy(e.vel).multiplyScalar(.4).add(rv(70)).clone(),spin:new V3(rand(-4,4),rand(-4,4),rand(-4,4)),life:rand(3,5)});}
  combo=comboT>0?combo+1:0;comboT=6;
  const pts=Math.round(e.T.score*(crashed?.5:1)*(1+combo*.25));score+=pts;kills++;
  feed(`${e.T.name} ${crashed?'estrellado':e.kind==='ship'?'hundido':e.kind==='ground'?'destruido':'derribado'} +${pts}${combo?` · COMBO x${combo+1}`:''}`);
  if(e===lockCand){lockCand=null;locked=null;lockT=0;}
  if(e.type==='boss'){spawnPowerup('repair',e.pos);spawnPowerup('ammo',_v1.copy(e.pos).add(new V3(60,0,0)));}
  else if(Math.random()<.42){const ks=Object.keys(PU);spawnPowerup(ks[Math.floor(Math.random()*ks.length)],e.pos);}
}
function updateEnemies(dt){
  const lvl=mode==='survival'?wave:curMission*2+1,spread=Math.max(.012,.03-lvl*.0015);
  for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(e.dead){enemies.splice(i,1);continue;}
    if(e.kind==='ground'||e.kind==='ship'){updateGround(e,dt);continue;}
    if(e.kind==='bomber'){updateBomber(e,dt);continue;}
    const tg=(e.tgt&&!tDead(e.tgt))?e.tgt:player,tp=tPos(tg),tv=tg.vel,alive=tg===player?player.alive:!tg.dead;
    const pos=e.pos;_v1.subVectors(tp,pos);const dist=_v1.length();const toP=_v1.divideScalar(dist||1);
    const facing=e.dir.dot(toP);e.stateT-=dt;
    if(e.state==='attack'){
      if(dist<230&&facing>.2){e.state='break';e.stateT=rand(1.8,3);e.breakDir.set(rand(-1,1),rand(.15,.7),rand(-1,1)).normalize();}
      else if(player.alive){const pb=_v3.subVectors(player.obj.position,pos);const pd=pb.length();
        if(pd<800&&-e.dir.dot(pb.divideScalar(pd||1))>.8&&Math.random()<dt*.7){e.state='jink';e.stateT=rand(1.5,2.6);e.breakDir.set(rand(-1,1),rand(-.2,.5),rand(-1,1)).normalize();}}
    }else if(e.stateT<=0)e.state='attack';
    const des=_v2;
    if(!alive||player.grounded)des.set(Math.sin(time*.2+i),.05,Math.cos(time*.2+i));
    else if(e.state==='attack')des.copy(tp).addScaledVector(tv,dist/E.ebullet*.6).sub(pos).normalize();
    else{if(e.state==='jink')e.breakDir.applyAxisAngle(AY,dt*2.2);des.copy(e.breakDir);}
    _v3.copy(pos).addScaledVector(e.dir,420);const gh=Math.max(terrainH(_v3.x,_v3.z),terrainH(pos.x,pos.z),0);
    if(pos.y-gh<280)des.y+=(280-(pos.y-gh))/90;
    if(pos.y>3600)des.y-=.6;
    if(Math.abs(pos.x)>WORLD*.85||Math.abs(pos.z)>WORLD*.85){des.x-=pos.x/WORLD*1.5;des.z-=pos.z/WORLD*1.5;}
    des.normalize();des.y=clamp(des.y,-.75,.8);des.normalize();
    _v4.copy(e.dir);e.dir.lerp(des,clamp(e.T.turn*dt*1.5,0,1)).normalize();
    const side=_v3.crossVectors(_v4,e.dir).y/Math.max(dt,1e-4);
    e.bank=damp(e.bank,clamp(-side*1.5,-1.3,1.3),4,dt);
    e.speed=damp(e.speed,e.T.speed*(e.speedMul||1)*(e.state==='attack'&&dist<450?.82:1),1,dt);
    pos.addScaledVector(e.dir,e.speed*dt);e.vel.copy(e.dir).multiplyScalar(e.speed);
    e.obj.lookAt(_v3.copy(pos).add(e.dir));e.model.rotation.z=e.bank;
    const J=e.model.userData;J.ails[0].rotation.x=-e.bank*.2;J.ails[1].rotation.x=e.bank*.2;spinProp(J,70,dt);
    if(pos.y<Math.max(terrainH(pos.x,pos.z),0)+6){killEnemy(e,true);continue;}
    if(e.hp<e.maxHp*.5&&Math.random()<dt*28)emit(SMOKE,_v3.copy(pos).addScaledVector(e.dir,-9*e.T.scale),rv(5),1.6,4,20,0x2e2e2e,0x6a6a6a,.65,-5);
    if(e.hp<e.maxHp*.25&&Math.random()<dt*25)emit(FIRE,_v3.copy(pos).addScaledVector(e.dir,-8*e.T.scale),rv(5),.35,5,1,0xffcc66,0xff3300,1);
    if(!alive||!player.alive||player.grounded)continue;
    e.fireCd-=dt;e.mslCd-=dt;
    const pdist=pos.distanceTo(player.obj.position);
    if(e.burst>0){e.burstT-=dt;if(e.burstT<=0){e.burstT=.085;e.burst--;
      const np=_v3.copy(pos).addScaledVector(e.dir,12*e.T.scale);const dv=new V3().copy(toP).lerp(e.dir,.5).normalize();dv.add(rv(spread)).normalize();
      spawnBullet(np,dv.multiplyScalar(E.ebullet).add(e.vel),e.T.gun,'e',M.trE);if(e.burst%3===0)sfx('egun',clamp(1-pdist/1800,0,.7));}}
    else if(e.fireCd<=0&&dist<1350*E.gunRange&&facing>.985){e.burst=10+Math.floor(Math.random()*7);e.fireCd=rand(1.6,2.9);}
    if(e.T.msl&&e.mslCd<=0&&dist<2700&&dist>380&&facing>.88){
      spawnMissile(_v3.copy(pos).addScaledVector(AY,-2),e.dir,e.speed,tg,'e',e.type==='boss'?130:110,false);
      e.mslCd=e.T.mslCd*rand(.8,1.3)*(e.mslMul||1);sfx('msl',clamp(1-pdist/3000,.2,.6));
      feed(tg===player?`${e.T.name} lanzó un misil · usa F`:`${e.T.name} disparó un misil al Pelícano`);}
  }
}
/* ---------------- Bullets ---------------- */
function updateBullets(dt){
  const pp=player.obj.position;
  for(const b of BULLETS){if(b.life<=0)continue;b.life-=dt;if(b.life<=0){b.m.visible=false;continue;}
    b.prev.copy(b.pos);b.pos.addScaledVector(b.vel,dt);b.m.position.copy(b.pos);
    let hit=false;
    if(b.owner==='p'){for(const e of enemies){if(e.dead)continue;if(e.pos.distanceToSquared(b.pos)>90000)continue;if(segDist(b.prev,b.pos,e.pos)<e.r){damageEnemy(e,b.dmg,b.pos);hit=true;break;}}}
    else if(player.alive&&pp.distanceToSquared(b.pos)<90000&&segDist(b.prev,b.pos,pp)<(player.shieldT>0?17:10)){hurtPlayer(b.dmg);hit=true;sparks(b.pos,0xff6050);}
    if(!hit&&b.owner==='e'&&ally&&!ally.dead&&ally.pos.distanceToSquared(b.pos)<90000&&segDist(b.prev,b.pos,ally.pos)<ally.r){hurtAlly(b.dmg);hit=true;sparks(b.pos,0xff6050);}
    if(!hit&&b.pos.y<1300&&b.pos.y<Math.max(terrainH(b.pos.x,b.pos.z),0)){hit=true;if(b.pos.distanceToSquared(camera.position)<4e6)emit(SMOKE,b.pos,_v1.set(0,12,0),.8,3,12,0xb0a080,0xd0c8b0,.6);}
    if(hit){b.life=0;b.m.visible=false;}
  }
}
/* ---------------- Powerups & debris ---------------- */
function spawnPowerup(type,pos){
  const c=PU[type].c,g=new THREE.Group();
  g.add(new THREE.Mesh(new THREE.OctahedronGeometry(7),new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.8,flatShading:true})));
  const ring=new THREE.Mesh(new THREE.TorusGeometry(12,.7,6,24),new THREE.MeshBasicMaterial({color:c}));g.add(ring);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:c,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false}));glow.scale.setScalar(55);g.add(glow);
  g.position.copy(pos);g.position.y=Math.max(g.position.y,Math.max(terrainH(pos.x,pos.z),0)+80);scene.add(g);
  powerups.push({g,ring,type,life:70,y0:g.position.y});
}
function applyPowerup(type){
  const p=player;sfx('pick');
  if(type==='repair')p.hp=Math.min(p.maxHp,p.hp+300);
  else if(type==='ammo')W.forEach(w=>{w.ammo=w.def.mag;w.reserve=w.def.reserve;});
  else if(type==='shield')activateShield(true);
  else activateOD(true);
  showMsg(PU[type].label,'',1.4);
}
function updatePowerups(dt){
  for(let i=powerups.length-1;i>=0;i--){const u=powerups[i];u.life-=dt;u.g.rotation.y+=dt*1.5;u.ring.rotation.x+=dt*2;u.g.position.y=u.y0+Math.sin(time*2+i)*6;
    u.g.visible=u.life>8||Math.floor(time*6)%2===0;
    if(player.alive&&u.g.position.distanceTo(player.obj.position)<42){applyPowerup(u.type);scene.remove(u.g);powerups.splice(i,1);continue;}
    if(u.life<=0){scene.remove(u.g);powerups.splice(i,1);}}
  for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.life-=dt;d.vel.y-=70*dt;d.m.position.addScaledVector(d.vel,dt);
    d.m.rotation.x+=d.spin.x*dt;d.m.rotation.y+=d.spin.y*dt;d.m.rotation.z+=d.spin.z*dt;
    if(Math.random()<dt*20)emit(SMOKE,d.m.position,_v1.set(0,8,0),1.4,3,14,0x252525,0x5a5a5a,.6);
    if(d.life<=0||d.m.position.y<Math.max(terrainH(d.m.position.x,d.m.position.z),0)){if(d.life>0)explode(d.m.position,.4,true);scene.remove(d.m);debris.splice(i,1);}}
  for(let i=dmgTexts.length-1;i>=0;i--){dmgTexts[i].t-=dt;if(dmgTexts[i].t<=0)dmgTexts.splice(i,1);}
}
/* ---------------- Waves ---------------- */
function startWave(n){
  wave=n;waveState='fighting';const boss=n%3===0;
  if(boss){spawnEnemy('boss');const esc=Math.min(1+Math.floor(n/2),7);for(let i=0;i<esc;i++)spawnEnemy(i%2?'interceptor':'fighter');
    showMsg('ALERTA: AS ENEMIGO','El Titán y su escolta entran al radar',3.2,true);sfx('alarm');}
  else{const c=Math.min(2+n,10);for(let i=0;i<c;i++)spawnEnemy((n>=2&&i%3===1)||(n>=5&&i%2===0)?'interceptor':'fighter');
    showMsg(`OLEADA ${n}`,`${c} hostiles en el radar`,2.6);}
  const ks=Object.keys(PU);
  for(let i=0;i<2;i++){const pp=player.obj.position,a=rand(0,6.28),d=rand(500,1400);spawnPowerup(ks[Math.floor(Math.random()*4)],new V3(clamp(pp.x+Math.cos(a)*d,-WORLD*.8,WORLD*.8),pp.y+rand(-150,150),clamp(pp.z+Math.sin(a)*d,-WORLD*.8,WORLD*.8)));}
}
function updateWaves(dt){
  comboT-=dt;
  if(waveState==='fighting'){if(enemies.every(e=>e.dead)){waveState='clear';waveT=4.5;player.hp=Math.min(player.maxHp,player.hp+150);score+=wave*50;
      showMsg('OLEADA SUPERADA',`+150 casco · +${wave*50} puntos`,3);}}
  else if(waveState==='clear'||waveState==='start'){if(!player.grounded)waveT-=dt;if(waveT<=0)startWave(wave+1);}
}
