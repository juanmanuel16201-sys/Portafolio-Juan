/* Van Helsing · Acciones del jugador: armas, agua bendita, cámara y salto */
/* ---------- player actions ---------- */
function switchWeapon(i,silent){if(!S.own[i]||S.wolf)return;S.weapon=i;guns.forEach((g,j)=>g.visible=j===i);poseArms(i);S.swap=.25;setHunterGun();if(!silent)SFX.empty()}
function cycleWeapon(dir=1){const N=WEAPONS.length;let i=S.weapon;for(let n=0;n<N;n++){i=(i+dir+N)%N;if(S.own[i])break}switchWeapon(i)}
function throwWater(){if(S.gren<=0||!S.alive){say(null,'Sin agua bendita','#9aa1b1');return}S.gren--;
 const o=S.third?new V3(P.pos.x,P.pos.y+1.6,P.pos.z):camera.getWorldPosition(new V3()),d=camera.getWorldDirection(new V3());
 const m=sp(.18,L(0x8fdcff,{emissive:0x2a6a8a,roughness:.1}),o.x+d.x*.6,o.y+d.y*.6,o.z+d.z*.6,scene,10);m.add(glow(0x8fdcff,.9));
 projs.push({m,v:d.multiplyScalar(17).add(new V3(0,4.5,0)),grav:true,water:true,life:5,r:.2})}
function explodeWater(pos){SFX.boom();boomLight.position.set(pos.x,pos.y+1,pos.z);boomLight.color.setHex(0x8fdcff);boomLight.intensity=4;burst(pos,0x8fdcff,40,8,.9);burst(pos,0xffffff,14,5,.6);S.shake=Math.max(S.shake,.15);ring(pos,0x8fdcff,11);
 let k=0;for(const e of enemies){if(e.dead||e.spawn>0)continue;const d=Math.hypot(e.g.position.x-pos.x,e.g.position.z-pos.z);if(d<5.5&&hurtEnemy(e,150*(1-d/7)*(S.fury>0?2:1)))k++}if(k)hitmark(true)}
function setView(third){S.third=third;THIRD=third;vm.visible=!third&&state==='playing';hunter.g.visible=third&&state==='playing';try{localStorage.setItem('vh_cam',third?'3':'1')}catch(e){}syncSeg()}
function toggleView(){setView(!S.third);say(null,S.third?'Tercera persona':'Primera persona','#9aa1b1')}
function jump(){if(P.ground&&S.alive&&S.transf<=0){P.vy=S.wolf?FORMS[S.form].jumpV:8.2;P.ground=false;SFX.jump()}}
