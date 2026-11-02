/* Van Helsing · Bucle principal y arranque */
/* ---------- loop ---------- */
const clock=new THREE.Clock();
let wasPortrait=false,fpsAcc=0,fpsN=0;
function loop(){requestAnimationFrame(loop);const rawDt=clock.getDelta(),dt=Math.min(rawDt,.05),t=performance.now()/1000;
 if(state==='playing'&&!paused){fpsAcc+=rawDt;fpsN++;if(fpsAcc>=1.5){const fps=fpsN/fpsAcc;fpsAcc=0;fpsN=0;if(fps<42&&curPR>.6)setPR(Math.max(.6,+(curPR-.15).toFixed(2)));else if(fps>57&&curPR<PRMAX)setPR(Math.min(PRMAX,+(curPR+.1).toFixed(2)))}}
 const portrait=isTouch&&innerHeight>innerWidth&&(state==='playing'||state==='loading');if(portrait!==wasPortrait){wasPortrait=portrait;$('rotate').hidden=!portrait;if(portrait)input.fire=false}
 if(portrait&&state==='playing'){draw(t);return}
 ambientAnim(dt);
 if(state==='menu'){camera.position.set(Math.sin(t*.07)*16,4.2+Math.sin(t*.2)*.4,-6+Math.cos(t*.07)*16);camera.lookAt(0,2.2,-8);hunter.tails.rotation.x=.05+Math.sin(t*1.4)*.05;enemies.forEach(e=>{e.t+=dt;e.g.position.y=e.cy+(e.cy>.2?Math.sin(e.t*2+e.ph)*.25:0);e.anim(e.t,false,e);if(e.aura)e.aura.rotation.z+=dt});
  if(KEY){KEY.target.position.set(0,0,-6);KEY.position.copy(KEY.target.position).addScaledVector(KEY.userData.dir,70)}}
 else if(state==='playing'&&!paused)update(dt);
 else if(state==='over'){camera.position.y=Math.min(camera.position.y+dt*.6,P.pos.y+5);camera.rotation.x=Math.max(camera.rotation.x-dt*.4,-1.2);enemies.forEach(e=>{e.t+=dt;e.anim(e.t,false,e)});stepParticles(dt)}
 draw(t)}
if(isTouch)$('ctl').open=false;setupPost();vm.visible=false;syncSeg();renderMaps();showMenuMap();loop();
