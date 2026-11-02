// Ace Combat · Partículas, explosiones y sonido
'use strict';

/* ---------------- Particles ---------------- */
const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const gr=x.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.6)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
function makePool(n,blending){const arr=[];for(let i=0;i<n;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,blending}));
  s.visible=false;scene.add(s);arr.push({s,vel:new V3(),life:0,max:1,s0:1,s1:1,grav:0,drag:0,c0:new THREE.Color(),c1:new THREE.Color(),a0:1});}return {arr,i:0};}
const FIRE=makePool(320,THREE.AdditiveBlending),SMOKE=makePool(520,THREE.NormalBlending);
function emit(pool,pos,vel,life,s0,s1,c0,c1,a0=1,grav=0,drag=0){const p=pool.arr[pool.i];pool.i=(pool.i+1)%pool.arr.length;
  p.s.position.copy(pos);p.vel.copy(vel);p.life=p.max=life;p.s0=s0;p.s1=s1;p.c0.setHex(c0);p.c1.setHex(c1);p.a0=a0;p.grav=grav;p.drag=drag;p.s.visible=true;p.s.scale.setScalar(s0);}
function updPool(pool,dt){for(const p of pool.arr){if(p.life<=0)continue;p.life-=dt;if(p.life<=0){p.s.visible=false;continue;}
  const t=1-p.life/p.max;p.s.position.addScaledVector(p.vel,dt);if(p.drag)p.vel.multiplyScalar(Math.exp(-p.drag*dt));p.vel.y-=p.grav*dt;
  p.s.scale.setScalar(lerp(p.s0,p.s1,t));p.s.material.color.copy(p.c0).lerp(p.c1,t);p.s.material.opacity=p.a0*(1-t)*(1-t*.3);}}
const rv=(m)=>_v4.set(rand(-1,1),rand(-1,1),rand(-1,1)).multiplyScalar(m);
function explode(pos,size=1,quiet=false){
  for(let i=0;i<20*size;i++)emit(FIRE,pos,_v1.copy(rv(1)).normalize().multiplyScalar(rand(20,150)*size),rand(.45,1.1),7*size,38*size,0xfff0b0,0xff3a08,1,-8,1.5);
  for(let i=0;i<13*size;i++)emit(SMOKE,pos,_v1.copy(rv(45*size)).add(_v2.set(0,18,0)),rand(1.6,3.2),12*size,65*size,0x2c2c2c,0x8a8a8a,.75,-4,.9);
  emit(FIRE,pos,_v1.set(0,0,0),.22,55*size,130*size,0xffffff,0xffc070,1);
  if(!quiet){const d=pos.distanceTo(camera.position);sfx('boom',clamp(1.25-d/3500,0,1)*Math.min(1.4,size));shake=Math.min(2.2,shake+clamp(size*260/Math.max(d,80),0,1.4));}
}
function sparks(pos,c=0xffd27a){for(let i=0;i<5;i++)emit(FIRE,pos,rv(90),rand(.12,.3),2,5,c,0xff6020,1);}
/* ---------------- Audio (sintetizado) ---------------- */
const A={ctx:null,on:true};
function audioInit(){
  if(A.ctx){A.ctx.resume&&A.ctx.resume();return;}
  try{A.ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
  const c=A.ctx;A.master=c.createGain();A.master.gain.value=A.on?.5:0;A.master.connect(c.destination);
  const len=c.sampleRate*2,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;A.noise=b;
  const src=c.createBufferSource();src.buffer=b;src.loop=true;A.engF=c.createBiquadFilter();A.engF.type='lowpass';A.engF.frequency.value=500;
  A.engG=c.createGain();A.engG.gain.value=0;src.connect(A.engF).connect(A.engG).connect(A.master);src.start();
  A.engO=c.createOscillator();A.engO.type='sawtooth';A.engO.frequency.value=70;const of=c.createBiquadFilter();of.type='lowpass';of.frequency.value=260;
  const og=c.createGain();og.gain.value=.35;A.engO.connect(of).connect(og).connect(A.engG);A.engO.start();A.engO.type=ERA==='ww2'?'square':'sawtooth';
}
function nz(dur,freq,type,gain,q=1,sweep=null){const c=A.ctx,t=c.currentTime,s=c.createBufferSource();s.buffer=A.noise;s.playbackRate.value=rand(.9,1.1);
  const f=c.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(freq,t);f.Q.value=q;if(sweep)f.frequency.exponentialRampToValueAtTime(sweep,t+dur);
  const g=c.createGain();g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f).connect(g).connect(A.master);s.start(t,rand(0,1.5));s.stop(t+dur+.05);}
function tn(fr,dur,type,gain,f2=null,delay=0){const c=A.ctx,t=c.currentTime+delay,o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(fr,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  const g=c.createGain();g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(A.master);o.start(t);o.stop(t+dur+.05);}
function sfx(n,v=1){if(!A.ctx||!A.on||v<=.01)return;try{switch(n){
  case 'gun':if(ERA==='ww2'){nz(.09,1200,'bandpass',.38*v,.8);tn(75,.07,'square',.1*v,45);}else{nz(.07,2600,'bandpass',.3*v,.9);tn(110,.05,'square',.07*v,60);}break;
  case 'bomb':tn(1500,1.4,'sine',.05,380);nz(.3,400,'lowpass',.2,1);break;
  case 'egun':nz(.06,1800,'bandpass',.22*v,1);break;
  case 'msl':nz(1.1,280,'bandpass',.5*v,1.5,2600);tn(180,.4,'sawtooth',.06*v,700);break;
  case 'rkt':nz(.35,500,'bandpass',.35*v,1.2,2400);break;
  case 'boom':nz(1.5,600,'lowpass',.9*v,1,70);tn(60,.7,'sine',.5*v,30);break;
  case 'hit':nz(.14,400,'lowpass',.6,1,120);tn(140,.1,'square',.12,70);break;
  case 'shieldhit':tn(500,.18,'sine',.18,1400);break;
  case 'lock':tn(1700,.05,'square',.06);break;
  case 'locked':tn(2100,.12,'square',.07);break;
  case 'alarm':tn(900,.11,'square',.1);tn(680,.11,'square',.1,null,.13);break;
  case 'pick':tn(660,.1,'triangle',.2);tn(990,.16,'triangle',.2,null,.09);break;
  case 'reload':tn(240,.05,'square',.1);tn(360,.05,'square',.1,null,.12);break;
  case 'switch':tn(520,.05,'triangle',.12);break;
  case 'power':tn(260,.45,'sine',.22,1100);break;
  case 'flare':nz(.5,1400,'highpass',.3,1);break;
  case 'empty':tn(180,.06,'square',.08);break;
  case 'steam':nz(1.7,900,'highpass',.28,.7);break;
  case 'cat':nz(.9,300,'lowpass',.85,1,60);tn(80,.6,'sine',.5,40);nz(1.3,2200,'highpass',.3,.6);break;
  case 'gear':tn(150,.25,'square',.12,90);nz(.45,500,'lowpass',.25,1);break;
  case 'flak':nz(.45,700,'lowpass',.55*v,1,120);break;
  case 'radio':nz(.12,2600,'bandpass',.07,3);tn(1250,.05,'square',.035);break;
}}catch(e){}}
