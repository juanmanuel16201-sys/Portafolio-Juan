/* Van Helsing · Disparos, explosiones, daño y muertes */
/* ---------- combat ---------- */
const tmpV=new V3();
function enemyCenter(e,out){return out.set(e.g.position.x,e.g.position.y+e.def.h*.55*e.k,e.g.position.z)}
function rayHits(o,d){const hits=[];for(const e of enemies){if(e.dead||e.spawn>0)continue;enemyCenter(e,tmpV);const r=e.def.hr*e.k;
  const ox=tmpV.x-o.x,oy=tmpV.y-o.y,oz=tmpV.z-o.z,t=ox*d.x+oy*d.y+oz*d.z;if(t<0)continue;const d2=ox*ox+oy*oy+oz*oz-t*t;if(d2>r*r)continue;hits.push({e,t:t-Math.sqrt(r*r-d2)})}
 return hits.sort((a,b)=>a.t-b.t)}
function fwd(){return new V3(-Math.sin(P.yaw)*Math.cos(P.pitch),Math.sin(P.pitch),-Math.cos(P.yaw)*Math.cos(P.pitch))}
function muzzleWorld(out){if(S.third){const m=hunter.hand.children[0];if(m&&m.muzzle)return m.muzzle.getWorldPosition(out);return out.set(P.pos.x,P.pos.y+1.35,P.pos.z)}return guns[S.weapon].muzzle.getWorldPosition(out)}
function fire(){const i=S.weapon,w=WEAPONS[i];if(S.fireCd>0)return;
 if(S.ammo[i]<=0){SFX.empty();S.fireCd=.3;say(null,'Sin munición. Cambio al revólver.','#9aa1b1');switchWeapon(0);return}
 S.fireCd=w.rate;S.ck=1;if(isFinite(S.ammo[i]))S.ammo[i]--;SFX.shot[i]();S.recoil=RECOIL[i];S.shake=Math.max(S.shake,i===1||i===4?.12:i===5?.015:.05);
 const o=camera.getWorldPosition(new V3()),dir=camera.getWorldDirection(new V3());hunter.g.updateMatrixWorld(true);const mz=muzzleWorld(new V3());
 muzzleLight.position.copy(mz);muzzleLight.color.setHex(w.kind==='flame'?0xff7a2a:w.kind==='chain'?0x8fd8ff:0xffc070);muzzleLight.intensity=w.kind==='flame'?1.6:2.6;
 if(!S.third&&w.kind!=='flame'){muzzleFlash.position.copy(guns[i].muzzle.position);guns[i].add(muzzleFlash);muzzleFlash.visible=true;muzzleFlash.userData.t=.05}
 const mul=S.fury>0?2:1;let killed=false,any=false;
 if(w.kind==='flame'){for(let k=0;k<3;k++)flameP(mz,dir.clone().multiplyScalar(rand(11,15)).add(new V3(rand(-1,1),rand(-.4,1),rand(-1,1))));
  for(const e of enemies){if(e.dead||e.spawn>0)continue;const c=enemyCenter(e,new V3()),to=c.clone().sub(o),d=to.length();if(d>w.range+e.def.hr*e.k||to.normalize().dot(dir)<.9)continue;any=true;e.burn=Math.max(e.burn||0,2.5);if(hurtEnemy(e,w.dmg*mul,c))killed=true}
  if(any&&Math.random()<.3)hitmark(killed);return}
 if(w.kind==='grenade'){const m=sp(.16,L(0xe8e0c0,{emissive:0x2a3a10}),mz.x,mz.y,mz.z,scene,10);m.add(glow(w.color,1.1));projs.push({m,v:dir.clone().multiplyScalar(24).add(new V3(0,3.5,0)),grav:true,boom:{r:5.5,dmg:w.dmg*mul,color:w.color},life:5,r:.16});return}
 if(w.kind==='chain'){const hits=rayHits(o,dir);let cur=hits.length?hits[0].e:null,from=mz.clone(),dmg=w.dmg*mul;const done=new Set();
  if(!cur){bolt(from,o.clone().addScaledVector(dir,40),w.color);return}
  for(let n=0;n<5&&cur;n++){done.add(cur);const c=enemyCenter(cur,new V3());bolt(from,c,w.color);burst(c,w.color,6,4,.4,0);if(hurtEnemy(cur,dmg,c))killed=true;from=c;dmg*=.8;
   let nx=null,nd=9;for(const e of enemies){if(e.dead||done.has(e)||e.spawn>0)continue;const d=enemyCenter(e,tmpV).distanceTo(c);if(d<nd){nd=d;nx=e}}cur=nx}
  SFX.hit();hitmark(killed);return}
 for(let p=0;p<w.pellets;p++){const d=dir.clone();if(w.spread){d.x+=rand(-w.spread,w.spread);d.y+=rand(-w.spread,w.spread);d.z+=rand(-w.spread,w.spread);d.normalize()}
  const hits=rayHits(o,d);let end=o.clone().addScaledVector(d,80);
  if(hits.length){const list=w.pierce?hits:[hits[0]];for(const h of list){any=true;if(hurtEnemy(h.e,w.dmg*mul,o.clone().addScaledVector(d,h.t)))killed=true}if(!w.pierce)end=o.clone().addScaledVector(d,hits[0].t)}
  tracer(mz,end,w.color)}
 if(any){SFX.hit();hitmark(killed)}}
function bolt(a,b,color){const pts=[];for(let i=0;i<=8;i++){const p=a.clone().lerp(b,i/8);if(i&&i<8)p.add(new V3(rand(-.35,.35),rand(-.35,.35),rand(-.35,.35)));pts.push(p)}const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color,transparent:true,opacity:1}));scene.add(l);tracers.push({l,life:.14})}
function flameP(pos,v){if(parts.length>320)return;const s=glow(Math.random()<.5?0xff7a2a:0xffc04a,.4);s.position.copy(pos);scene.add(s);parts.push({m:s,v,life:rand(.4,.6),max:.55,g:2.5,fl:true})}
const boomLight=new THREE.PointLight(0xffffff,0,24);scene.add(boomLight);
function explode(pos,c){SFX.boom();boomLight.position.set(pos.x,pos.y+1,pos.z);boomLight.color.setHex(c.color);boomLight.intensity=5;
 burst(pos,c.color,34,9,.9);burst(pos,0xffb040,20,6,.7);burst(pos,0x222222,14,4,1.2,-2);ring(pos,c.color,12);
 const fb=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOWTEX,color:c.color,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));fb.position.copy(pos);scene.add(fb);parts.push({m:fb,v:new V3(),life:.35,max:.35,g:0,fb:true});
 S.shake=Math.max(S.shake,Math.max(0,.4-pos.distanceTo(P.pos)*.02));let k=0;
 for(const e of enemies){if(e.dead||e.spawn>0)continue;const d=enemyCenter(e,tmpV).distanceTo(pos);if(d<c.r+e.def.hr*e.k&&hurtEnemy(e,c.dmg*clamp(1-d/(c.r*1.6),.3,1)))k++}if(k)hitmark(true)}
function tracer(a,b,color){const g=new THREE.BufferGeometry().setFromPoints([a.clone(),b.clone()]);const l=new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity:.85}));scene.add(l);tracers.push({l,life:.07})}
function burst(pos,color,n,spd=4,life=.6,grav=-9){for(let i=0;i<n;i++){if(parts.length>260)break;const m=mesh(G('BoxGeometry',.11,.11,.11),B(color),pos.x,pos.y,pos.z,scene);
 parts.push({m,v:new V3(rand(-1,1),rand(-.2,1.3),rand(-1,1)).multiplyScalar(spd),life:life*rand(.6,1.2),max:life,g:grav})}}
function ring(pos,color,grow){const r=mesh(G('RingGeometry',.6,1.1,32),B(color,{transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}),pos.x,.12,pos.z,scene);r.rotation.x=-PI/2;parts.push({m:r,v:new V3(),life:.5,max:.5,g:0,grow})}
function hurtEnemy(e,dmg,pt){if(e.dead)return false;e.hp-=dmg;e.hurt=.12;e.lastHit=0;burst(pt||enemyCenter(e,new V3()),e.def.blood,e.boss?4:3,3,.45);if(e.hp<=0){killEnemy(e);return true}return false}
let dying=[];
function killEnemy(e){e.dead=true;const c=enemyCenter(e,new V3());burst(c,e.def.blood,e.boss?60:16,e.boss?9:5,.9);burst(c,0x1a1a1a,e.boss?20:5,3,1.2,-2);
 if(e.aura)e.aura.visible=false;dying.push({g:e.g,t:0,dur:e.boss?1.2:.55,s:e.g.scale.x,side:Math.random()<.5?-1:1,fly:e.g.position.y,ry:e.g.rotation.y});SFX.kill();S.kills++;
 const before=S.charge;S.charge=Math.min(CHARGE,S.charge+(e.boss?CHARGE:1));if(before<CHARGE&&S.charge>=CHARGE&&allies.length<2)say(null,isTouch?'Barra llena. Toca CHAMÁN.':'Barra llena. Pulsa Q para invocar un chamán.','#7fe0c4');
 if(e.boss)endWolf();
 if(e.boss){S.bosses++;S.boss=null;$('boss').hidden=true;banner(e.bossDef.name.split(',')[0]+' cayó');
  ['salud','salud','municion','municion','poder','agua'].forEach((k,i)=>spawnDrop(new V3(c.x+Math.cos(i)*2,0,c.z+Math.sin(i)*2),k));const pool=[3,4,5,6,7].filter(j=>!S.own[j]);spawnDrop(new V3(c.x,0,c.z),'arma',pool.length?pick(pool):pick([3,4,5,6,7]))}
 else if(e.def.drop&&Math.random()<e.def.drop[1]){const wi=e.def.drop[0];spawnDrop(new V3(c.x,0,c.z),'arma',wi);say(null,e.def.name+' soltó: '+WEAPONS[wi].name,hx(WEAPONS[wi].color))}
 else if(Math.random()<(e.def.swarm?.18:.42)){const r=Math.random();spawnDrop(new V3(c.x,0,c.z),r<.4?'municion':r<.72?'salud':r<.87?'agua':'poder')}
 S.quip-=1;if(S.quip<=0&&Math.random()<.35){S.quip=6;say('Van Helsing',pick(['¡A la tumba otra vez!','¡Ni muerto te salvas!','¡Siguiente monstruo!','Plata pura, directo al corazón.','Vuelve al cuento de donde saliste.','Eso es por Mina.']),'#ece4d2')}}
let curSrc=null;
function hurtPlayer(d){if(!S.alive||S.inv>0||S.transf>0)return;if(S.wolf)d*=FORMS[S.form].taken;S.hp-=d;S.hurt=.45;S.shake=Math.max(S.shake,.18);SFX.hurt();if(isTouch){try{navigator.vibrate&&navigator.vibrate(35)}catch(err){}}
 if(curSrc){const dx=curSrc.x-P.pos.x,dz=curSrc.z-P.pos.z,ang=Math.atan2(dx,dz),fa=Math.atan2(-Math.sin(P.yaw),-Math.cos(P.yaw)),el=$('dmgDir');el.style.transition='none';el.style.transform='rotate('+(fa-ang)+'rad)';el.style.opacity=1;void el.offsetWidth;el.style.transition='opacity .9s';el.style.opacity=0}
if(S.hp<=0){S.hp=0;gameOver()}}

