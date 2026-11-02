/* Van Helsing · Transformaciones de Van Helsing: Lobo Negro, Ángel de Plata, Titán de Bronce, Avatar de Ra y Jaguar Espíritu */
/* ---------- transformaciones ---------- */
const FORMS={
 lobo:{name:'El Lobo Negro',ban:'¡Luna llena!',omen:'La luna se pone llena...',sky:0xf4f4ff,aura:0xff2a1a,scale:2.35,hp:400,taken:.5,speed:1.35,jumpV:11.5,r:1.4,h:4.6,camH:2.7,camB:4.4,atk:'Garras del Lobo Negro',sp:'Aullido',spCd:7,
  start:'La luna... ¡no ahora! ¡Aaaargh!',taunt:'¿Un lobo? Veamos quién manda en esta noche.',end:'La luna se fue... vuelvo a ser yo.',
  build:()=>{const b=B_.lobo(1,true);return Object.assign({root:b.g},hm(b.h))},attack:()=>melee({reach:5.2,dmg:160,boss:120,cd:.38,color:0xff4a3a,kb:1.4}),special:()=>howl()},
 angel:{name:'El Ángel de Plata',ban:'¡Luz celestial!',omen:'Una luz baja del cielo...',sky:0xfff0c0,aura:0xfff2c0,scale:1.9,hp:380,taken:.55,speed:1.3,jumpV:12,hover:.6,r:1.2,h:4,camH:2.2,camB:3.8,atk:'Lanza de luz',sp:'Juicio divino',spCd:8,
  start:'Señor, dame tu fuerza contra el infierno...',taunt:'¿Un ángel? ¡Arderás igual que todos!',end:'La luz se apaga... vuelvo a ser yo.',
  build:()=>buildAngelForm(),attack:()=>beam({cd:.28,dmg:95,boss:75,color:0xffe08a,w:.09}),special:()=>judgment()},
 titan:{name:'El Titán de Bronce',ban:'¡Poder del Olimpo!',omen:'Los dioses del Olimpo te escuchan...',sky:0xffc070,aura:0xffa040,scale:2.6,hp:450,taken:.45,speed:1.15,jumpV:10,r:1.6,h:5.4,camH:3.2,camB:5.2,atk:'Mazo de bronce',sp:'Terremoto',spCd:7,
  start:'¡Zeus, préstame tu poder!',taunt:'¿Un titán? ¡Los dioses no te salvarán!',end:'El bronce se enfría... vuelvo a ser yo.',
  build:()=>buildTitanForm(),attack:()=>melee({reach:6.5,dmg:200,boss:150,cd:.6,color:0xffa040,kb:2.6,big:true}),special:()=>quake()},
 ra:{name:'El Avatar de Ra',ban:'¡Sol de medianoche!',omen:'El sol sale en plena noche...',sky:0xffd060,aura:0xffb030,scale:2.2,hp:400,taken:.5,speed:1.25,jumpV:11,r:1.3,h:4.8,camH:2.6,camB:4.4,atk:'Rayo solar',sp:'Sol abrasador',spCd:8,
  start:'¡Ra, dios del sol, habita en mí!',taunt:'¡El sol no brilla de noche, impostor!',end:'El sol se oculta... vuelvo a ser yo.',
  build:()=>buildRaForm(),attack:()=>beam({cd:.1,dmg:30,boss:24,color:0xffa030,w:.13,burn:true}),special:()=>sunburst()},
 jaguar:{name:'El Jaguar Espíritu',ban:'¡Espíritus del llano!',omen:'Los espíritus del llano despiertan...',sky:0xa8ffd0,aura:0x6affb0,scale:1.9,hp:380,taken:.55,speed:1.6,jumpV:12.5,r:1.4,h:3,camH:1.9,camB:4.6,atk:'Zarpazo del jaguar',sp:'Salto del jaguar',spCd:5,
  start:'Espíritus del llano, ¡vengan a mí!',taunt:'¿Un jaguar? ¡Este llano es mío!',end:'El espíritu se va... vuelvo a ser yo.',
  build:()=>buildJaguarForm(),attack:()=>melee({reach:5.4,dmg:150,boss:115,cd:.3,color:0x6affb0,kb:1.2}),special:()=>pounce()}
};
Object.assign(MAPS.cementerio,{form:'angel'});Object.assign(MAPS.castillo,{form:'lobo'});Object.assign(MAPS.olimpo,{form:'titan'});Object.assign(MAPS.egipto,{form:'ra'});Object.assign(MAPS.llanos,{form:'jaguar'});
const FM={};
function hm(h,extra){return{rig:h,anim:(t,mv,sw,side)=>{walk(h,t,mv?.75:0);if(sw>=0){const a=side>0?h.armR:h.armL;a.rotation.x=-.4-Math.sin(sw*PI)*2.3;a.rotation.z=(side>0?1:-1)*Math.sin(sw*PI)*.5}else{h.armR.rotation.z=h.armL.rotation.z=0}if(extra)extra(t,mv,sw)}}}
function formModel(id){if(FM[id])return FM[id];const F=FORMS[id],m=F.build(),g=new THREE.Group();g.add(m.root);scene.add(g);g.visible=false;g.traverse(o=>{if(o.isMesh)o.castShadow=HIGH&&!(o.material&&o.material.transparent)});
 m.g=g;m.bl=blob(g,.8);rimify(m.root);const au=glow(F.aura,2.2,true,.22);au.position.set(0,1.3,-.1);m.root.add(au);return FM[id]=m}
function hideForms(keep){for(const id in FM)FM[id].g.visible=id===keep}
function buildAngelForm(){const h=humanoid({skin:0xead8c6,top:0xdfe5ee,bottom:0xc9cfda,arm:0xdfe5ee,boots:0xc9a040,belt:0xd9a640,eyes:0x4a8ad0,hair:0xe0c880});
 const metal=L(0xe6ebf2,{metalness:.85,roughness:.22}),gold=L(0xd9a640,{metalness:.9,roughness:.25});
 sp(.27,metal,0,1.24,.05,h.g,16).scale.set(1.05,1.05,.7);[-1,1].forEach(d=>sp(.13,metal,d*.36,1.46,0,h.g,10).scale.set(1.2,.8,1.1));
 sp(.172,L(0xe0c880),0,1.69,-.03,h.g,14).scale.set(1,.92,1.08);bx(.3,.42,.06,L(0xe0c880),0,1.5,-.14,h.g);
 const halo=mesh(G('TorusGeometry',.2,.025,8,32),GL(0xffe08a),0,2,-.03,h.g);halo.rotation.x=PI/2;const hg=glow(0xffe08a,.9,true,.6);hg.position.set(0,2,0);h.g.add(hg);
 cn(.36,.7,L(0xf4f2ec),0,.62,0,h.g,16);
 const wing=d=>{const p=new THREE.Group();p.position.set(d*.12,1.38,-.16);h.g.add(p);for(let i=0;i<6;i++){const f=bx(.95-i*.09,.17,.03,L(0xfbfaf4,{emissive:0x3a3420}),d*(.47+i*.02),.42-i*.16,-i*.02,p);f.rotation.z=d*(.55-i*.22)}const wg=glow(0xfff2c0,1.8,true,.3);wg.position.set(d*.6,.1,-.1);p.add(wg);return p};
 const wl=wing(-1),wr=wing(1);
 bx(.06,1.15,.025,GL(0xcfeaff),0,-.92,.06,h.armR.elbow);bx(.25,.05,.06,gold,0,-.36,.06,h.armR.elbow);const sg=glow(0x9fd8ff,1.3,true,.45);sg.position.set(0,-.9,.06);h.armR.elbow.add(sg);
 return Object.assign({root:h.g},hm(h,()=>{const tt=performance.now()/1000;wl.rotation.y=.45+Math.sin(tt*2.4)*.3;wr.rotation.y=-wl.rotation.y;halo.rotation.z=tt}))}
function buildTitanForm(){const h=humanoid({w:1.35,skin:0xb07a40,top:0x8a5a28,bottom:0x7a5228,arm:0xb07a40,boots:0x5a3a1a,belt:0xd9a640,eyes:0xffb030,hair:0x3a2010});
 const br=L(0xb5803a,{metalness:.85,roughness:.35}),red=L(0xa81818),gold=L(0xd9a640,{metalness:.9,roughness:.25});
 sp(.3,br,0,1.22,.05,h.g,16).scale.set(1.2,1.05,.7);cy(.175,.17,.2,br,0,1.76,0,h.g,16);bx(.05,.3,.5,red,0,1.99,-.02,h.g);
 [-1,1].forEach(d=>{bx(.04,.16,.12,br,d*.15,1.62,.06,h.g);sp(.15,br,d*.4,1.45,0,h.g,10).scale.set(1.2,.8,1.1)});
 for(let i=0;i<10;i++){const a=i/10*PI*2,st=bx(.09,.32,.025,red,Math.sin(a)*.21,.74,Math.cos(a)*.16,h.g);st.rotation.y=a}
 rot(cy(.4,.4,.06,br,0,-.25,.1,h.armL.elbow,24),PI/2,0,0);mesh(G('TorusGeometry',.3,.03,6,24),gold,0,-.25,.14,h.armL.elbow);
 const club=new THREE.Group();club.position.set(0,-.34,.04);h.armR.elbow.add(club);cy(.045,.06,1.1,LT(tex('wood','#6a4428','#2a1608')),0,-.45,0,club,8);cy(.2,.22,.42,br,0,-1.05,0,club,14);
 return Object.assign({root:h.g},hm(h))}
function buildRaForm(){const h=humanoid({skin:0x9a6438,top:0x9a6438,bottom:0xf2ead6,arm:0x9a6438,boots:0xd9a640,belt:0xd9a640,face:false});const gold=L(0xd9a640,{metalness:.9,roughness:.25}),blue=L(0x2a4a9a);
 h.head.visible=false;const hd=new THREE.Group();hd.position.set(0,1.67,0);h.g.add(hd);sp(.16,L(0x3a2818),0,0,0,hd,16).scale.set(.95,1.05,1.05);rot(cn(.07,.2,gold,0,-.04,.2,hd,8),PI/2+.4,0,0);sp(.06,L(0xf2ead6),0,-.02,.1,hd,8);eyes(hd,0xffd040,.025,.03,.13,.07);
 for(let i=0;i<7;i++)bx(.36,.04,.2,i%2?blue:gold,0,-.05-i*.06,-.12,hd);[-1,1].forEach(d=>bx(.06,.32,.1,gold,d*.16,-.2,.02,hd));
 cy(.32,.3,.07,gold,0,1.46,0,h.g,20).scale.z=.8;cn(.28,.42,L(0xf2ead6),0,.68,0,h.g,14);
 const sun=sp(.3,GL(0xffb030),0,2.25,-.05,h.g,16);const sg=glow(0xffb030,3.2,true,.6);sg.position.copy(sun.position);h.g.add(sg);mesh(G('TorusGeometry',.36,.03,6,24),gold,0,2.25,-.05,h.g);
 const staff=new THREE.Group();staff.position.set(0,-.34,.04);h.armR.elbow.add(staff);cy(.03,.03,2.2,gold,0,.2,0,staff,8);mesh(G('TorusGeometry',.12,.03,6,14),gold,0,1.42,0,staff);bx(.3,.05,.05,gold,0,1.25,0,staff);
 return Object.assign({root:h.g},hm(h,()=>{sg.material.rotation+=.01}))}
function jagTex(){const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d');x.fillStyle='#d8962e';x.fillRect(0,0,256,256);
 for(let i=0;i<60;i++){const cx=Math.random()*256,cy_=Math.random()*256,r=6+Math.random()*9;x.strokeStyle='#1a120a';x.lineWidth=3.5;x.beginPath();x.arc(cx,cy_,r,0,7);x.stroke();x.fillStyle='#a8641c';x.beginPath();x.arc(cx,cy_,r*.5,0,7);x.fill()}
 const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);return t}
function buildJaguarForm(){const g=new THREE.Group(),fur=LT(jagTex(),{emissive:0x0a2216}),belly=L(0xf0dcb0),dk=L(0x1a120a);
 sp(.42,fur,0,1,0,g,16).scale.set(1,.9,2.1);sp(.36,belly,0,.9,.1,g,12).scale.set(.9,.7,1.8);
 const hd=new THREE.Group();hd.position.set(0,1.28,1.05);g.add(hd);sp(.3,fur,0,0,0,hd,16).scale.set(1.05,.9,1);sp(.16,belly,0,-.08,.25,hd,12).scale.set(1.1,.8,1);sp(.05,dk,0,0,.4,hd,8);
 [-1,1].forEach(d=>{cn(.08,.14,fur,d*.18,.24,-.05,hd,8);rot(cn(.02,.1,B(0xffffff),d*.06,-.17,.3,hd,4),PI,0,0)});eyes(hd,0x6affb0,.04,.06,.24,.12);const eg=glow(0x6affb0,.6,true,.6);eg.position.set(0,.06,.3);hd.add(eg);
 const legs=quadLegs(g,1,[[-.26,.62],[.26,.62],[-.26,-.62],[.26,-.62]],.95,.95,.1,fur);legs.forEach(l=>sp(.1,fur,0,-.95,.05,l,8));
 const tail=[];for(let i=0;i<7;i++)tail.push(sp(.09-i*.006,fur,0,1.05+i*.04,-.85-i*.16,g,8));
 return{root:g,anim:(t,mv,sw)=>{const tt=performance.now()/1000;gallop(legs,t*1.4,mv?.8:.05);tail.forEach((q,i)=>q.position.x=Math.sin(tt*3+i*.6)*.06*i);hd.rotation.x=sw>=0?-Math.sin(sw*PI)*.5:0;if(sw>=0){legs[0].rotation.x=-Math.sin(sw*PI)*1.4;legs[1].rotation.x=-Math.sin(sw*PI)*1.2}}}}
function beginTransform(){if(!S.alive||S.wolf||S.transf>0||!S.pendingForm)return;S.form=S.pendingForm;S.pendingForm=null;const F=FORMS[S.form];formModel(S.form);S.transf=2.6;input.fire=false;banner(F.ban);say('Van Helsing',F.start,'#ece4d2');SFX.roar();if(S.form==='lobo')SFX.howl(P.pos)}
function finishTransform(){const F=FORMS[S.form];S.transf=0;S.wolf=true;S.max=F.hp;S.hp=F.hp;S.howlCd=0;S.clawCd=0;banner(F.name);SFX.roar();S.shake=.45;ring(P.pos,F.aura,16);burst(new V3(P.pos.x,2,P.pos.z),F.aura,40,8,1.1,-2);
 const bn=S.boss&&!S.boss.dead?S.boss.bossDef.name.split(',')[0]:'Jefe';say(bn,F.taunt,'#ff4a5a');say(null,(isTouch?'Fuego: ':'Clic: ')+F.atk+' · '+(isTouch?'Agua: ':'G: ')+F.sp,hx(F.aura))}
function endWolf(){S.transfDelay=0;S.pendingForm=null;MOONT=0;S.dash=0;S.pounce=false;const F=S.form?FORMS[S.form]:null;if(S.transf>0)S.transf=0;
 if(S.wolf&&F){S.max=200;S.hp=Math.max(100,Math.min(200,S.hp));burst(new V3(P.pos.x,2,P.pos.z),0x111114,40,6,1,-2);ring(P.pos,0xf4f4ff,12);setTimeout(()=>say('Van Helsing',F.end,'#ece4d2'),1400)}S.wolf=false;S.form=null}
function formAttack(){const F=S.form&&FORMS[S.form];if(F)F.attack()}
function formSpecial(){const F=S.form&&FORMS[S.form];if(!F)return;if(S.howlCd>0){say(null,F.sp+' en '+Math.ceil(S.howlCd)+' s','#9aa1b1');return}if(F.special()!==false)S.howlCd=F.spCd}
function slash(color,rad){const m=new THREE.Mesh(G('TorusGeometry',rad,.09,4,28,PI*.75),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
 m.rotation.order='YXZ';m.rotation.set(PI/2+S.swingSide*.85,P.yaw,-PI/2-.375*PI);m.position.set(P.pos.x,P.pos.y+FORMS[S.form].h*.55,P.pos.z);scene.add(m);parts.push({m,v:new V3(),life:.22,max:.22,g:0,sl:true})}
function melee(o){if(S.clawCd>0)return;S.clawCd=o.cd;S.swing=.3;S.swingSide*=-1;noise(.18,o.big?900:2400,.5,'bandpass');tone(o.big?90:180,.15,'sawtooth',.15,50);slash(o.color,o.reach*.52);
 const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),mul=S.fury>0?2:1;let k=0,any=false;
 if(o.big){const gp=new V3(P.pos.x+fx*3,0,P.pos.z+fz*3);ring(gp,o.color,6);burst(new V3(gp.x,.3,gp.z),0x6a5a40,12,5,.6);S.shake=Math.max(S.shake,.25)}
 for(const e of enemies){if(e.dead||e.spawn>0)continue;const dx=e.g.position.x-P.pos.x,dz=e.g.position.z-P.pos.z,d=Math.hypot(dx,dz);if(d>o.reach+e.def.r*e.k||e.g.position.y-P.pos.y>6)continue;if(d>1.2&&(dx*fx+dz*fz)/d<.2)continue;
  any=true;if(hurtEnemy(e,(e.boss?o.boss:o.dmg)*mul,enemyCenter(e,new V3())))k++;else if(!e.boss){e.g.position.x+=dx/(d||1)*o.kb;e.g.position.z+=dz/(d||1)*o.kb}}
 if(any){SFX.hit();hitmark(k>0);S.shake=Math.max(S.shake,.15)}}
function beamMesh(a,b,color,w){const len=a.distanceTo(b),m=new THREE.Mesh(G('CylinderGeometry',1,1,1,6,1,true),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));
 m.scale.set(w,len,w);m.position.copy(a).lerp(b,.5);m.quaternion.setFromUnitVectors(new V3(0,1,0),b.clone().sub(a).normalize());scene.add(m);parts.push({m,v:new V3(),life:.12,max:.12,g:0,sl:true,keep:true});
 muzzleLight.position.copy(a);muzzleLight.color.setHex(color);muzzleLight.intensity=2.4}
function beam(o){if(S.clawCd>0)return;S.clawCd=o.cd;S.swing=.3;S.swingSide=1;if(o.burn){if(Math.random()<.5)noise(.12,1200,.25,'bandpass')}else{tone(900,.15,'sine',.15,300);noise(.12,5000,.2,'highpass')}
 const F=FORMS[S.form],dir=camera.getWorldDirection(new V3()),o0=camera.getWorldPosition(new V3());
 const from=new V3(P.pos.x,P.pos.y+F.h*.62+(F.hover||0),P.pos.z).addScaledVector(new V3(-Math.sin(P.yaw),0,-Math.cos(P.yaw)),1.2);
 const hits=rayHits(o0,dir),mul=S.fury>0?2:1;let k=0;
 for(const h of hits){if(hurtEnemy(h.e,(h.e.boss?o.boss:o.dmg)*mul,o0.clone().addScaledVector(dir,h.t)))k++;if(o.burn)h.e.burn=Math.max(h.e.burn||0,2)}
 beamMesh(from,o0.clone().addScaledVector(dir,70),o.color,o.w);if(hits.length){if(!o.burn||Math.random()<.4)SFX.hit();hitmark(k>0)}}
function howl(){SFX.howl(P.pos);tone(300,1.2,'sawtooth',.18,700);ring(P.pos,0xff3a2a,16);S.shake=.3;
 for(const e of enemies){if(e.dead||e.spawn>0)continue;const d=e.g.position.distanceTo(P.pos);if(d<10){const dx=e.g.position.x-P.pos.x,dz=e.g.position.z-P.pos.z,l=Math.hypot(dx,dz)||1;if(!e.boss){e.g.position.x+=dx/l*3;e.g.position.z+=dz/l*3}e.cd=Math.max(e.cd,1.5);hurtEnemy(e,(e.boss?150:220)*(1-d/14))}}}
function judgment(){const list=enemies.filter(e=>!e.dead&&e.spawn<=0).map(e=>[e,e.g.position.distanceTo(P.pos)]).filter(x=>x[1]<30).sort((a,b)=>a[1]-b[1]).slice(0,7);
 if(!list.length){say(null,'No hay enemigos cerca','#9aa1b1');return false}tone(600,1,'sine',.18,1200);noise(.8,3000,.3,'highpass');S.shake=.3;
 for(const [e] of list){const q=e.g.position;const m=new THREE.Mesh(G('CylinderGeometry',1.1,1.1,40,12,1,true),new THREE.MeshBasicMaterial({color:0xfff0b0,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  m.position.set(q.x,20,q.z);scene.add(m);parts.push({m,v:new V3(),life:.7,max:.7,g:0,sl:true,keep:true});ring(q,0xffe08a,6);burst(new V3(q.x,1,q.z),0xfff0b0,14,6,.7);hurtEnemy(e,(e.boss?160:240)*(S.fury>0?2:1))}hitmark(true)}
function quake(){SFX.roar();SFX.boom();S.shake=.6;ring(P.pos,0xffa040,18);ring(P.pos,0x8a6a3a,12);burst(new V3(P.pos.x,.3,P.pos.z),0x6a5a40,50,10,1.1);
 for(const e of enemies){if(e.dead||e.spawn>0)continue;const d=Math.hypot(e.g.position.x-P.pos.x,e.g.position.z-P.pos.z);if(d<13){e.cd=Math.max(e.cd,2);e.mcd=Math.max(e.mcd,1.5);if(!e.boss&&e.cy<.5){const l=d||1;e.g.position.x+=(e.g.position.x-P.pos.x)/l*2.5;e.g.position.z+=(e.g.position.z-P.pos.z)/l*2.5}hurtEnemy(e,(e.boss?160:240)*(1-d/17)*(S.fury>0?2:1))}}hitmark(true)}
function sunburst(){SFX.boom();tone(200,1,'sawtooth',.2,90);boomLight.position.set(P.pos.x,4,P.pos.z);boomLight.color.setHex(0xffb030);boomLight.intensity=6;S.shake=.4;ring(P.pos,0xffb030,22);ring(P.pos,0xff6a1a,14);burst(new V3(P.pos.x,3,P.pos.z),0xffc040,50,10,1);
 for(const e of enemies){if(e.dead||e.spawn>0)continue;const d=e.g.position.distanceTo(P.pos);if(d<15){e.burn=Math.max(e.burn||0,4);hurtEnemy(e,(e.boss?140:200)*(1-d/20)*(S.fury>0?2:1))}}hitmark(true)}
function pounce(){if(!P.ground)return false;P.vy=10;P.ground=false;S.dash=.45;S.dashX=-Math.sin(P.yaw);S.dashZ=-Math.cos(P.yaw);S.pounce=true;SFX.howl(P.pos)}
function pounceLand(){SFX.boom();S.shake=.35;ring(P.pos,0x6affb0,12);burst(new V3(P.pos.x,.4,P.pos.z),0x6affb0,30,7,.8);
 for(const e of enemies){if(e.dead||e.spawn>0)continue;const d=Math.hypot(e.g.position.x-P.pos.x,e.g.position.z-P.pos.z);if(d<7.5){const l=d||1;if(!e.boss){e.g.position.x+=(e.g.position.x-P.pos.x)/l*2;e.g.position.z+=(e.g.position.z-P.pos.z)/l*2}hurtEnemy(e,(e.boss?160:230)*(1-d/11)*(S.fury>0?2:1))}}hitmark(true)}

