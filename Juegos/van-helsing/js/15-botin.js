/* Van Helsing · Botín y armas que sueltan los monstruos */
/* ---------- drops ---------- */
const DROP={municion:{c:0xd9a640,n:'Munición'},salud:{c:0xd23a3a,n:'Pócima de vida'},agua:{c:0x8fdcff,n:'Agua bendita'},poder:{c:0x9fb8ff,n:'Reliquia'},arma:{c:0x7fe0c4,n:'Metralleta de sal'}};
function gunClone(i){const src=guns[i];if(muzzleFlash.parent===src)src.remove(muzzleFlash);const c=src.clone();c.muzzle=c.children[src.children.indexOf(src.muzzle)];c.visible=true;return c}
function spawnDrop(pos,kind,wi){const g=new THREE.Group(),c=kind==='arma'?WEAPONS[wi].color:DROP[kind].c,inner=new THREE.Group();g.add(inner);
 if(kind==='municion'){bx(.5,.3,.32,L(c,{emissive:0x3a2a08,metalness:.5,roughness:.4}),0,0,0,inner);bx(.52,.06,.34,L(0x3a2a1c),0,.05,0,inner)}
 else if(kind==='salud'){cy(.16,.2,.36,L(c,{emissive:0x4a0808,roughness:.2}),0,0,0,inner,12);cy(.06,.06,.16,L(0xe8e0cc),0,.25,0,inner,8)}
 else if(kind==='agua'){sp(.2,L(c,{emissive:0x1a4a66,roughness:.15}),0,0,0,inner,12);cy(.05,.05,.18,L(0xe8e0cc),0,.24,0,inner,8)}
 else if(kind==='poder'){bx(.12,.62,.12,GL(c),0,0,0,inner);bx(.42,.12,.12,GL(c),0,.12,0,inner)}
 else{const gc=gunClone(wi);gc.scale.setScalar(2.2);gc.rotation.y=PI/2;gc.position.x=-.4;inner.add(gc)}
 const gl=glow(c,kind==='arma'?2.4:1.4,true,.6);inner.add(gl);
 rot(mesh(G('RingGeometry',.42,.58,24),B(c,{transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false}),0,-.6,0,inner),-PI/2,0,0);
 g.position.set(pos.x,.7,pos.z);scene.add(g);drops.push({g,inner,kind,wi,t:rand(0,5),life:kind==='arma'?45:30})}
function giveWeapon(wi){const w=WEAPONS[wi];if(S.own[wi]){S.ammo[wi]+=Math.ceil(w.give/2);say(null,'+ munición: '+w.name,hx(w.color))}else{S.own[wi]=true;S.ammo[wi]=w.give;switchWeapon(wi);banner(w.name);say(null,'Arma nueva: '+w.name+(isTouch?'':' · tecla '+(wi+1)),hx(w.color))}}
function pickup(d){SFX.pick();const n=DROP[d.kind].n;
 if(d.kind==='municion'){S.ammo[1]+=8;S.ammo[2]+=4;for(let j=3;j<WEAPONS.length;j++)if(S.own[j])S.ammo[j]+=WEAPONS[j].refill;say(null,'+ '+n,'#d9a640')}
 else if(d.kind==='salud'){S.hp=Math.min(S.max,S.hp+50);say(null,'+50 vida','#d23a3a')}
 else if(d.kind==='agua'){S.gren+=2;say(null,'+2 agua bendita','#8fdcff')}
 else if(d.kind==='poder'){if(Math.random()<.5){S.inv=8;say(null,'Crucifijo: 8 s sin daño','#9fb8ff')}else{S.fury=10;say(null,'Furia del cazador: daño doble 10 s','#ff7a5a')}}
 else giveWeapon(d.wi)}

