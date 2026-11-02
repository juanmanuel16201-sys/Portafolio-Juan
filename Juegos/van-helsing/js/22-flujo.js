/* Van Helsing · Pantallas de carga, inicio, fin y pausa */
/* ---------- flow ---------- */
const LOAD={
 cementerio:{acc:'#7fe0c4',steps:['Desenterrando tumbas','Encendiendo velas','Despertando a los muertos'],tips:['La Llorona te paraliza con su grito. Aléjate cuando empiece a llorar.','El agua bendita hace más daño a los grupos. Espera a que se junten.','Los esqueletos a veces sueltan la Metralleta de sal.']},
 castillo:{acc:'#e0404a',steps:['Abriendo el portón','Llenando la fuente de sangre','Despertando al Conde'],tips:['Drácula se teletransporta. Cuando desaparezca, busca la nube de murciélagos.','Los vampiros se curan al morderte. Mantén la distancia.','Los vampiros y hombres lobo pueden soltar el Rifle Winchester de plata.','Cuando llegue Drácula saldrá la luna llena. Prepárate para cambiar.']},
 olimpo:{acc:'#f0a050',steps:['Puliendo el mármol','Encendiendo los braseros','Abriendo las puertas del Hades'],tips:['Los proyectiles amarillos de Medusa te petrifican y te vuelven lento.','Si dejas de dispararle a la Hidra, se regenera.','Los cíclopes y el Minotauro pueden soltar el Tridente de Zeus.']},
 egipto:{acc:'#d9a640',steps:['Barriendo la arena','Abriendo los sarcófagos','Leyendo la maldición'],tips:['Los escarabajos llegan en enjambre. El lanzallamas los barre.','Anubis y las momias pueden soltar el Lanzagranadas de ajo.','Las momias son lentas pero pegan duro. No dejes que te rodeen.']},
 llanos:{acc:'#cfe86a',steps:['Prendiendo la fogata','Cerrando el corral','Esperando el silbido'],tips:['Si oyes al Silbón cerca, está lejos. Si lo oyes lejos, está encima.','La Patasola salta muy rápido. Escopeta de cerca.','Los demonios y Cerbero sueltan el Lanzallamas sagrado.']}
};
function hills(x,W,H,y,amp,col,f=3){x.fillStyle=col;x.beginPath();x.moveTo(0,H);for(let i=0;i<=40;i++)x.lineTo(i/40*W,y+Math.sin(i*f*.15+y)*amp+Math.sin(i*.9)*amp*.3);x.lineTo(W,H);x.fill()}
function branch(x,px,py,len,a,w,d){if(d===0||len<2)return;const ex=px+Math.cos(a)*len,ey=py+Math.sin(a)*len;x.lineWidth=w;x.beginPath();x.moveTo(px,py);x.lineTo(ex,ey);x.stroke();branch(x,ex,ey,len*.72,a-.45+Math.random()*.2,w*.65,d-1);branch(x,ex,ey,len*.68,a+.4+Math.random()*.2,w*.65,d-1)}
function palm2(x,px,py,h){x.strokeStyle=x.fillStyle;x.lineWidth=h*.06;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+h*.15,py-h*.5,px-h*.05,py-h);x.stroke();const tx=px-h*.05,ty=py-h;for(let i=0;i<7;i++){const a=-PI+i/6*PI+(Math.random()-.5)*.2;x.lineWidth=h*.035;x.beginPath();x.moveTo(tx,ty);x.quadraticCurveTo(tx+Math.cos(a)*h*.3,ty+Math.sin(a)*h*.3-h*.05,tx+Math.cos(a)*h*.45,ty+Math.sin(a)*h*.2+h*.12);x.stroke()}}
const SIL={
 cementerio(x,W,H,u){hills(x,W,H,H*.7,u*2,'#0d1420');const cx=W*.68,b=H*.73;x.fillStyle='#070a10';x.fillRect(cx-u*14,b-u*16,u*22,u*16);x.fillRect(cx+u*4,b-u*30,u*7,u*30);x.beginPath();x.moveTo(cx+u*3,b-u*30);x.lineTo(cx+u*7.5,b-u*40);x.lineTo(cx+u*12,b-u*30);x.fill();x.fillRect(cx+u*7,b-u*45,u,u*6);x.fillRect(cx+u*5.5,b-u*43.5,u*4,u);
  x.fillStyle='#8a0d16';x.beginPath();x.arc(cx-u*3,b-u*10,u*2.4,0,7);x.fill();
  hills(x,W,H,H*.79,u*1.5,'#05070b');x.fillStyle=x.strokeStyle='#05070b';
  for(let i=0;i<16;i++){const px=W*(i/16)+Math.random()*u*4,py=H*.81+Math.random()*H*.06,sz=u*(1.6+Math.random()*1.8);if(Math.random()<.5){x.fillRect(px-sz*.15,py-sz*2.2,sz*.3,sz*2.2);x.fillRect(px-sz*.7,py-sz*1.6,sz*1.4,sz*.3)}else{x.beginPath();x.moveTo(px-sz*.6,py);x.lineTo(px-sz*.6,py-sz*1.2);x.arc(px,py-sz*1.2,sz*.6,PI,0);x.lineTo(px+sz*.6,py);x.fill()}}
  branch(x,W*.1,H*.86,u*14,-PI/2,u*1.6,7);branch(x,W*.92,H*.88,u*11,-PI/2-.1,u*1.3,6)},
 castillo(x,W,H,u){hills(x,W,H,H*.66,u*3,'#14060a',2);const b=H*.66,cx=W*.5;x.fillStyle='#090306';x.beginPath();x.moveTo(cx-u*44,H);x.lineTo(cx-u*26,b-u*4);x.lineTo(cx+u*28,b-u*6);x.lineTo(cx+u*46,H);x.fill();
  const tower=(tx,w,h,roof)=>{x.fillRect(tx-w/2,b-u*4-h,w,h);x.beginPath();x.moveTo(tx-w*.65,b-u*4-h);x.lineTo(tx,b-u*4-h-roof);x.lineTo(tx+w*.65,b-u*4-h);x.fill()};
  x.fillRect(cx-u*24,b-u*20,u*48,u*16);for(let i=-12;i<12;i++)x.fillRect(cx+i*u*2,b-u*21.5,u,u*1.6);
  tower(cx-u*22,u*7,u*28,u*10);tower(cx+u*22,u*7,u*24,u*9);tower(cx,u*9,u*40,u*14);tower(cx-u*9,u*5,u*30,u*8);tower(cx+u*11,u*5,u*33,u*9);
  x.fillStyle='#ff3a2a';for(let i=0;i<16;i++){x.globalAlpha=.5+Math.random()*.5;x.fillRect(cx+(Math.random()-.5)*u*46,b-u*(8+Math.random()*28),u*.8,u*1.6)}x.globalAlpha=1;
  x.fillStyle='#050203';for(let i=0;i<24;i++){const bx_=Math.random()*W,by=Math.random()*H*.5,z=u*(.6+Math.random()*1.2);x.beginPath();x.moveTo(bx_-z*2,by-z*.4);x.quadraticCurveTo(bx_-z,by+z*.2,bx_,by);x.quadraticCurveTo(bx_+z,by+z*.2,bx_+z*2,by-z*.4);x.quadraticCurveTo(bx_+z,by+z*.8,bx_,by+z*.5);x.quadraticCurveTo(bx_-z,by+z*.8,bx_-z*2,by-z*.4);x.fill()}},
 olimpo(x,W,H,u){hills(x,W,H,H*.62,u*4,'#5a3a48',2);hills(x,W,H,H*.72,u*2,'#3a2632');const cx=W*.42,b=H*.75;x.fillStyle='#24161e';
  x.fillRect(cx-u*30,b-u*3,u*60,u*3);x.fillRect(cx-u*28,b-u*5,u*56,u*2);
  for(let i=0;i<9;i++){const px=cx-u*25+i*u*6.25;if(i===6){x.fillRect(px-u*1.3,b-u*12,u*2.6,u*7);continue}x.fillRect(px-u*1.3,b-u*25,u*2.6,u*20)}
  x.fillRect(cx-u*28,b-u*28,u*56,u*3);x.beginPath();x.moveTo(cx-u*28,b-u*28);x.lineTo(cx,b-u*36);x.lineTo(cx+u*28,b-u*28);x.fill();
  hills(x,W,H,H*.85,u,'#170d13');x.fillStyle='#170d13';for(const [px,h] of [[.05,30],[.1,24],[.84,34],[.9,26],[.95,22]]){x.beginPath();x.ellipse(W*px,H*.85-u*h/2,u*2.6,u*h/2,0,0,7);x.fill()}},
 egipto(x,W,H,u){const pyr=(px,base,z,col)=>{x.fillStyle=col;x.beginPath();x.moveTo(px-z,base);x.lineTo(px,base-z*.95);x.lineTo(px+z,base);x.fill()};
  pyr(W*.3,H*.72,u*26,'#2a2030');pyr(W*.62,H*.72,u*34,'#221a28');pyr(W*.86,H*.72,u*18,'#2a2030');
  x.fillStyle='rgba(255,220,150,.08)';x.beginPath();x.moveTo(W*.62,H*.72-u*32.3);x.lineTo(W*.62+u*34,H*.72);x.lineTo(W*.62,H*.72);x.fill();
  hills(x,W,H,H*.74,u*2,'#3a2c22',2);hills(x,W,H,H*.83,u*2.5,'#1e1610',1.4);
  x.fillStyle='#120c08';x.beginPath();x.moveTo(W*.14-u*1.6,H*.85);x.lineTo(W*.14-u*1.1,H*.85-u*26);x.lineTo(W*.14,H*.85-u*29);x.lineTo(W*.14+u*1.1,H*.85-u*26);x.lineTo(W*.14+u*1.6,H*.85);x.fill();
  palm2(x,W*.9,H*.92,u*18);palm2(x,W*.96,H*.94,u*14)},
 llanos(x,W,H,u){hills(x,W,H,H*.76,u*.6,'#0c1a1a',1);x.fillStyle=x.strokeStyle='#050b0b';const tx=W*.62,ty=H*.82;x.lineWidth=u*3.2;x.beginPath();x.moveTo(tx,ty);x.lineTo(tx,ty-u*24);x.stroke();
  for(let i=0;i<6;i++)branch(x,tx,ty-u*22,u*11,-PI/2+(i-2.5)*.42,u*1.4,4);
  for(let i=0;i<9;i++){x.beginPath();x.ellipse(tx+(i-4)*u*5.5,ty-u*(34+Math.sin(i)*3),u*7,u*3.4,0,0,7);x.fill()}
  const rx=W*.22,rb=H*.84;x.fillRect(rx-u*8,rb-u*6,u*16,u*6);x.beginPath();x.moveTo(rx-u*11,rb-u*6);x.lineTo(rx,rb-u*12);x.lineTo(rx+u*11,rb-u*6);x.fill();x.fillStyle='#ffb050';x.fillRect(rx+u*3,rb-u*4.5,u*2.2,u*2);x.fillStyle='#050b0b';
  palm2(x,W*.06,H*.92,u*20);palm2(x,W*.93,H*.92,u*17);hills(x,W,H,H*.87,u*.8,'#030707',1);
  x.fillStyle='#d8ff6a';for(let i=0;i<40;i++){x.globalAlpha=Math.random();x.beginPath();x.arc(Math.random()*W,H*.6+Math.random()*H*.35,u*.25,0,7);x.fill()}x.globalAlpha=1}
};
function drawLoadArt(id){const cv=$('loadArt'),dpr=Math.min(devicePixelRatio||1,2),W=cv.width=Math.round(innerWidth*dpr),H=cv.height=Math.round(innerHeight*dpr),x=cv.getContext('2d'),M=MAPS[id],u=Math.max(W,H*1.2)/100;
 const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,M.sky[0]);g.addColorStop(.62,M.sky[1]);g.addColorStop(1,M.sky[2]);x.fillStyle=g;x.fillRect(0,0,W,H);
 if(M.stars){x.fillStyle='#ffffff';for(let i=0;i<260;i++){x.globalAlpha=Math.random()*.8;const r=Math.random()*u*.2+.6;x.fillRect(Math.random()*W,Math.random()*H*.6,r,r)}x.globalAlpha=1}
 const mc=hx(M.moon[0]),mx=W*(id==='olimpo'?.74:id==='castillo'?.7:.24),my=H*(id==='olimpo'?.48:.22),mr=u*(id==='olimpo'?7:5);
 const hg=x.createRadialGradient(mx,my,mr*.5,mx,my,mr*6);hg.addColorStop(0,mc+'88');hg.addColorStop(1,mc+'00');x.fillStyle=hg;x.fillRect(0,0,W,H);x.fillStyle=mc;x.beginPath();x.arc(mx,my,mr,0,7);x.fill();
 SIL[id](x,W,H,u)}
let loadTok=0;
function startGame(){audioInit();curMap=menuMap;const M=MAPS[curMap],LD=LOAD[curMap],tok=++loadTok;state='loading';paused=false;input.fire=false;
 ['menu','over','pause','hud','touch'].forEach(id=>$(id).hidden=true);vm.visible=false;hunter.g.visible=false;
 const el=$('loading');el.style.setProperty('--acc',LD.acc);el.hidden=false;$('ldGo').hidden=true;
 $('ldName').textContent=M.name;$('ldSub').textContent=M.sub;$('ldBoss').textContent='Jefes: '+M.bosses.map(b=>b.name.split(',')[0]).join(' · ')+' · Transformación: '+FORMS[M.form].name;$('ldTip').textContent=pick(LD.tips);drawLoadArt(curMap);
 const t0=performance.now(),setP=(v,txt)=>{$('ldBar').style.width=v+'%';$('ldStep').textContent=txt};setP(6,LD.steps[0]+'…');
 setTimeout(()=>{if(tok!==loadTok)return;buildWorld(curMap);resetState();setP(55,LD.steps[1]+'…');
  setTimeout(()=>{if(tok!==loadTok)return;const tmp=new THREE.Group();scene.add(tmp);const types=new Set([...M.pool.map(q=>q[0]),...M.bosses.map(b=>b.type),...M.bosses.map(b=>b.summon)]);types.forEach(t=>tmp.add(B_[t](1).g));[M.form,...(M.bosses.some(b=>b.special==='dracula')?['lobo']:[])].forEach(id=>{const fm=formModel(id);fm.g.visible=true;fm.g.position.set(P.pos.x+rand(-3,3),0,P.pos.z-9)});
   tmp.position.set(P.pos.x,0,P.pos.z-6);camera.position.set(P.pos.x,1.65,P.pos.z);camera.rotation.set(0,0,0);try{renderer.compile(scene,camera)}catch(e){}scene.remove(tmp);hideForms(null);setP(85,LD.steps[2]+'…');
   setTimeout(()=>{if(tok!==loadTok)return;setP(100,'Listo');$('ldGo').hidden=false;try{$('ldGo').focus()}catch(e){}},Math.max(0,1800-(performance.now()-t0)))},80)},120)}
function beginPlay(){if(isTouch){try{const de=document.documentElement,r=de.requestFullscreen?de.requestFullscreen({navigationUI:'hide'}):de.webkitRequestFullscreen&&de.webkitRequestFullscreen();if(r&&r.then)r.then(()=>{try{const o=screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape');if(o&&o.catch)o.catch(()=>{})}catch(e){}}).catch(()=>{})}catch(e){}}audioInit();if(AC&&AC.state==='suspended')AC.resume();$('loading').hidden=true;$('hud').hidden=false;$('touch').hidden=!isTouch;$('boss').hidden=true;
 state='playing';paused=false;setView(THIRD);camPos.set(P.pos.x,2,P.pos.z+4);if(!isTouch)lock();
 banner(MAPS[curMap].name);say('Van Helsing',pick(['Bueno, monstruos... ¿quién quiere plata primero?','Traje estacas suficientes para todos.','Drácula, sé que estás mirando.']),'#ece4d2')}
$('ldGo').onclick=beginPlay;
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing'&&!paused){paused=true;input.fire=false;$('pause').hidden=false}});
addEventListener('resize',()=>{if(!$('loading').hidden)drawLoadArt(curMap)});
function toMenu(){loadTok++;$('loading').hidden=true;state='menu';paused=false;input.fire=false;if(document.pointerLockElement)document.exitPointerLock();['over','pause','hud','touch'].forEach(id=>$(id).hidden=true);$('menu').hidden=false;vm.visible=false;hunter.g.visible=false;renderMaps();showMenuMap()}
function gameOver(){S.alive=false;state='over';input.fire=false;if(document.pointerLockElement)document.exitPointerLock();
 const best=Math.max(bestOf(curMap),S.wave);try{localStorage.setItem('vh_best_'+curMap,String(best))}catch(e){}
 setTimeout(()=>{$('hud').hidden=true;$('touch').hidden=true;$('over').hidden=false;$('oMap').textContent=MAPS[curMap].name;$('oWave').textContent=S.wave;$('oKills').textContent=S.kills;$('oBoss').textContent=S.bosses;$('oBest').textContent=best;
  $('oLine').textContent=pick(['Drácula brinda con tu sangre esta noche.','El Silbón te metió en el costal.','Medusa ya tiene una estatua nueva.','Las brujas se reparten tu sombrero.','El Minotauro te encerró en su laberinto.'])},1200)}
let noLock=false,everLocked=false;
function lock(){if(noLock)return;try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>{noLock=true})}catch(e){noLock=true}}
document.addEventListener('pointerlockerror',()=>{noLock=true});
document.addEventListener('pointerlockchange',()=>{const l=document.pointerLockElement===canvas;if(l){everLocked=true;paused=false;$('pause').hidden=true}else if(state==='playing'&&everLocked&&!isTouch){paused=true;input.fire=false;$('pause').hidden=false}});
$('startBtn').onclick=startGame;$('againBtn').onclick=startGame;$('mapBtn').onclick=toMenu;$('quitBtn').onclick=toMenu;
$('resumeBtn').onclick=()=>{paused=false;$('pause').hidden=true;if(!isTouch)lock()};

