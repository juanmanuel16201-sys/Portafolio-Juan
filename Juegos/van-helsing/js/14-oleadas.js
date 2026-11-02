/* Van Helsing · Aparición de monstruos, oleadas y jefes */
/* ---------- spawning ---------- */
function spawnPos(){let x,z,t=0;do{const a=rand(0,PI*2),r=rand(ARENA-14,ARENA-4);x=Math.cos(a)*r;z=Math.sin(a)*r;t++}while(t<25&&(Math.hypot(x-P.pos.x,z-P.pos.z)<20||OBST.some(o=>Math.hypot(x-o.x,z-o.z)<o.r+1)));return[x,z]}
function makeEnemy(type,k=1,boss=null,at=null){const def=TYPES[type],b=B_[type](k),g=b.g;const fly=boss?boss.fly:(def.fly||0);
 const [x,z]=at||spawnPos();g.position.set(x,0,z);scene.add(g);if(HIGH)g.traverse(o=>{if(o.isMesh)o.castShadow=!(o.material&&o.material.transparent)});
 const hp=boss?(1400+S.wave*170)*(boss.hpMul||1):def.hp*(1+(S.wave-1)*.11);
 const e={type,def,g,anim:b.anim,k,hp,max:hp,fly,cy:fly,t:rand(0,9),ph:rand(0,9),cd:rand(1,2.5),mcd:0,spawn:.8,hurt:0,lastHit:9,boss:!!boss,bossDef:boss,
  ranged:boss?{rate:2.7,speed:15,dmg:13,color:boss.color,petrify:boss.special==='petrify',big:true,count:type==='hidra'?5:type==='cerbero'?3:0}:def.ranged,strafe:Math.random()<.5?1:-1,sumCd:9,slamCd:4,tpCd:6,chCd:rand(2,5),charging:0,sndCd:rand(4,10)};
 if(boss){const aura=mesh(G('RingGeometry',1,1.4,40),B(boss.color,{transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false}),0,.06,0,g);aura.rotation.x=-PI/2;aura.scale.setScalar(k*.9);e.aura=aura;
  const gl=glow(boss.color,def.h*k*1.2,true,.25);gl.position.y=def.h*k*.5;g.add(gl)}
 e.blob=blob(g,def.r*k*1.5);rimify(g);
 if(!boss){const bw=Math.max(.7,Math.min(1.6,def.r*k*1.8)),hb=new THREE.Group();hb.position.y=def.h*k+.3;g.add(hb);const bg=new THREE.Sprite(HBBG);bg.scale.set(bw+.06,.13,1);hb.add(bg);const fg=new THREE.Sprite(HBFG);fg.scale.set(bw,.08,1);fg.position.z=.001;hb.add(fg);hb.visible=false;e.hb=hb;e.hbF=fg;e.hbW=bw}
 e.fl=glow(0xfff0e0,def.h*k*.9,true,.5);e.fl.position.y=def.h*k*.55;e.fl.visible=false;g.add(e.fl);
 burst(new V3(x,.5,z),0x2a2f3a,8,3,.8,-2);enemies.push(e);
 if(!boss&&S.sayCd<=0&&Math.random()<.45){S.sayCd=4;say(def.name,pick(def.taunts),hx(def.blood))}
 return e}
function startWave(){S.wave++;const M=MAPS[curMap],isBoss=S.wave%3===0;S.toSpawn=isBoss?3+S.wave:6+S.wave*3;S.spawnT=.5;
 if(isBoss){const bd=M.bosses[((S.wave/3)-1)%M.bosses.length];const e=makeEnemy(bd.type,bd.k,bd);S.boss=e;$('boss').hidden=false;setT('bossName',bd.name);
  banner('¡'+bd.name.split(',')[0]+'!');say(bd.name.split(',')[0],bd.line,hx(bd.color));SFX.roar();
  const fid=bd.special==='dracula'?'lobo':M.form;if(fid&&!S.wolf&&S.transf<=0){S.pendingForm=fid;FULLC.setHex(FORMS[fid].sky);MOONT=1;S.transfDelay=2.6;say(null,FORMS[fid].omen,'#f4f4ff')}}
 else banner('Oleada '+S.wave)}
const waveTypes=()=>MAPS[curMap].pool.filter(p=>p[1]<=S.wave).map(p=>p[0]);

