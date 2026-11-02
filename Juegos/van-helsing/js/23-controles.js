/* Van Helsing · Teclado, ratón y controles táctiles */
/* ---------- input ---------- */
addEventListener('keydown',e=>{keys[e.code]=true;if(state!=='playing'||paused)return;
 if(e.code==='Space'){jump();e.preventDefault()}
 if(e.code.startsWith('Digit')){const n=+e.code.slice(5)-1;if(n>=0&&n<WEAPONS.length){if(S.own[n])switchWeapon(n);else say(null,'Aún no tienes '+WEAPONS[n].name+'. Algunos monstruos la sueltan.','#9aa1b1')}}
 if(e.code==='KeyG')(S.wolf?formSpecial():throwWater());if(e.code==='KeyQ')summonAlly();if(e.code==='KeyV')toggleView();
 if(e.code==='KeyP'||(e.code==='Escape'&&noLock)){paused=true;input.fire=false;$('pause').hidden=false}});
addEventListener('keyup',e=>{keys[e.code]=false});
let dragLook=false,lx=0,ly=0;
canvas.addEventListener('mousedown',e=>{if(state!=='playing'||isTouch)return;audioInit();if(!document.pointerLockElement&&!noLock){lock();return}
 if(e.button===0)input.fire=true;if(e.button===2){dragLook=true;lx=e.clientX;ly=e.clientY}});
addEventListener('mouseup',e=>{if(e.button===0)input.fire=false;if(e.button===2)dragLook=false});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('mousemove',e=>{if(state!=='playing'||paused)return;if(document.pointerLockElement===canvas){P.yaw-=e.movementX*.0022*SENS;P.pitch-=e.movementY*.0022*SENS}else if(dragLook){P.yaw-=(e.clientX-lx)*.005;P.pitch-=(e.clientY-ly)*.005;lx=e.clientX;ly=e.clientY}});
addEventListener('wheel',e=>{if(state==='playing'&&!paused)cycleWeapon(e.deltaY>0?1:-1)},{passive:true});
if(isTouch){
 const jz=$('joyZone'),base=$('joyBase'),knob=$('joyKnob');let jid=null,jc={x:0,y:0};const M_=56;
 const moveJ=e=>{if(e.pointerId!==jid)return;let dx=e.clientX-jc.x,dy=e.clientY-jc.y;const d=Math.hypot(dx,dy);if(d>M_){dx=dx/d*M_;dy=dy/d*M_}knob.style.transform=`translate(${dx}px,${dy}px)`;input.jx=dx/M_;input.jy=dy/M_;
  const run=Math.hypot(input.jx,input.jy)>.92&&input.jy<-.3;base.classList.toggle('run',run);base.style.setProperty('--ja',Math.atan2(dx,-dy)+'rad');base.style.setProperty('--jo',Math.min(1,d/M_))};
 jz.addEventListener('pointerdown',e=>{if(jid!==null)return;jid=e.pointerId;jz.setPointerCapture(e.pointerId);const zr=jz.getBoundingClientRect(),h=base.offsetWidth/2;
  const cx=clamp(e.clientX,zr.left+h+8,zr.right-h),cy=clamp(e.clientY,zr.top+h,innerHeight-h-8);base.style.left=(cx-h)+'px';base.style.bottom=(innerHeight-cy-h)+'px';base.classList.add('on');jc={x:cx,y:cy};moveJ(e)});
 jz.addEventListener('pointermove',moveJ);
 const endJ=e=>{if(e.pointerId!==jid)return;jid=null;input.jx=input.jy=0;knob.style.transform='';base.classList.remove('on','run');base.style.left='';base.style.bottom='';base.style.setProperty('--jo',0)};jz.addEventListener('pointerup',endJ);jz.addEventListener('pointercancel',endJ);
 const looks={};const lookStart=(el,key)=>e=>{el.setPointerCapture(e.pointerId);looks[key+e.pointerId]={x:e.clientX,y:e.clientY}};
 const lookMove=key=>e=>{const l=looks[key+e.pointerId];if(!l)return;const k=.0056*SENS;P.yaw-=(e.clientX-l.x)*k;P.pitch-=(e.clientY-l.y)*k*.85;l.x=e.clientX;l.y=e.clientY};
 const lz=$('lookZone');lz.addEventListener('pointerdown',lookStart(lz,'l'));lz.addEventListener('pointermove',lookMove('l'));const endL=e=>{delete looks['l'+e.pointerId]};lz.addEventListener('pointerup',endL);lz.addEventListener('pointercancel',endL);
 const bf=$('bFire');bf.addEventListener('pointerdown',e=>{e.preventDefault();lookStart(bf,'f')(e);input.fire=true;bf.classList.add('on')});bf.addEventListener('pointermove',lookMove('f'));
 const endF=e=>{input.fire=false;bf.classList.remove('on');delete looks['f'+e.pointerId]};bf.addEventListener('pointerup',endF);bf.addEventListener('pointercancel',endF);
 const tap=(id,fn)=>{const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();el.classList.add('on');if(state==='playing'&&!paused)fn()});const off=()=>el.classList.remove('on');el.addEventListener('pointerup',off);el.addEventListener('pointercancel',off);el.addEventListener('pointerleave',off)};
 tap('bJump',jump);tap('bAgua',()=>S.wolf?formSpecial():throwWater());tap('bWeap',()=>cycleWeapon(1));tap('bSummon',summonAlly);tap('bView',toggleView);
 tap('bPause',()=>{paused=true;input.fire=false;$('pause').hidden=false});
}

