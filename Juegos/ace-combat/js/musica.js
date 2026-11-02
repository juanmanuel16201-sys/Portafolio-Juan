// Ace Combat · Música del menú
'use strict';

/* ---------------- Música del menú (composición original, sintetizada) ---------------- */
const MUS={playing:false,step:0,next:0,timer:null,out:null};
const BPM=88,STEP=60/BPM/2;
const CHORDS=[[50,53,57],[46,50,53],[41,45,48],[48,52,55]];
const MELODY=[[[69,1.5],[74,.5],[76,1],[77,1]],[[76,2],[74,1],[72,1]],[[74,1.5],[77,.5],[79,2]],[[77,1],[76,1],[74,2]],
  [[72,1.5],[77,.5],[81,2]],[[79,1],[77,1],[76,1],[72,1]],[[76,1.5],[79,.5],[76,1],[74,1]],[[72,1],[76,1],[74,2]]];
const mf=n=>440*Math.pow(2,(n-69)/12);
let DIST=null;
function musInit(){
  const c=A.ctx;const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(A.master);
  MUS.out=c.createGain();MUS.out.gain.value=0;MUS.out.connect(comp);
  const len=c.sampleRate*3,ir=c.createBuffer(2,len,c.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);}
  MUS.rev=c.createConvolver();MUS.rev.buffer=ir;MUS.revIn=c.createGain();MUS.revIn.gain.value=.45;MUS.revIn.connect(MUS.rev);MUS.rev.connect(MUS.out);
  MUS.dly=c.createDelay(2);MUS.dly.delayTime.value=STEP*3;const fb=c.createGain();fb.gain.value=.3;MUS.dly.connect(fb);fb.connect(MUS.dly);
  const dOut=c.createGain();dOut.gain.value=.4;MUS.dly.connect(dOut);dOut.connect(MUS.out);dOut.connect(MUS.revIn);
  DIST=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/512-1;DIST[i]=(1+6)*x/(1+6*Math.abs(x));}
}
function mv(t,f,dur,o){
  const c=A.ctx,osc=c.createOscillator();osc.type=o.type||'sawtooth';osc.frequency.setValueAtTime(f,t);if(o.f2)osc.frequency.exponentialRampToValueAtTime(o.f2,t+(o.f2t||dur));if(o.det)osc.detune.value=o.det;
  const a=o.att||.01,r=o.rel||.15,G=o.gain||.1,end=t+Math.max(a,dur)+r;let node=osc;
  if(o.vib){const l=c.createOscillator();l.frequency.value=5.2;const lg=c.createGain();lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(o.vib,t+.4);l.connect(lg);lg.connect(osc.detune);l.start(t);l.stop(end+.05);}
  if(o.dist){const ws=c.createWaveShaper();ws.curve=DIST;node.connect(ws);node=ws;}
  const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.cut||2000;node.connect(fl);
  const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(G,t+a);g.gain.setValueAtTime(G,t+Math.max(a,dur));g.gain.exponentialRampToValueAtTime(.0005,end);
  fl.connect(g);g.connect(MUS.out);
  if(o.rev){const s2=c.createGain();s2.gain.value=o.rev;g.connect(s2);s2.connect(MUS.revIn);}
  if(o.dly){const s2=c.createGain();s2.gain.value=o.dly;g.connect(s2);s2.connect(MUS.dly);}
  osc.start(t);osc.stop(end+.05);
}
function mn(t,dur,o){
  const c=A.ctx,s=c.createBufferSource();s.buffer=A.noise;const f=c.createBiquadFilter();f.type=o.ft||'bandpass';f.frequency.value=o.freq||1000;f.Q.value=o.q||.8;
  const g=c.createGain();g.gain.setValueAtTime(o.gain||.2,t);g.gain.exponentialRampToValueAtTime(.0005,t+dur);s.connect(f);f.connect(g);g.connect(MUS.out);
  if(o.rev){const s2=c.createGain();s2.gain.value=o.rev;g.connect(s2);s2.connect(MUS.revIn);}
  s.start(t,Math.random()*1.5);s.stop(t+dur+.05);
}
function musStep(s,t){
  const bar=Math.floor(s/8),b8=bar%8,pos=s%8,pass=Math.floor(bar/8),main=pass>=1,ch=CHORDS[b8>>1];
  if(s%16===0){
    ch.forEach(n=>{[-8,8].forEach(d=>mv(t,mf(n),STEP*15,{gain:.032,att:1.1,rel:1.2,cut:1100,det:d,rev:.6}));});
    mv(t,mf(ch[2]+12),STEP*15,{type:'triangle',gain:main?.03:.045,att:1.6,rel:1.5,cut:2400,rev:.8});
    if(main){mv(t,mf(ch[0]-12),STEP*15,{gain:.05,dist:true,cut:1300,att:.02,rel:.6,rev:.25});mv(t,mf(ch[0]-5),STEP*15,{gain:.04,dist:true,cut:1300,att:.02,rel:.6,rev:.25});}
    if(!main||b8===0){mv(t,mf(38),1.6,{type:'sine',gain:.38,f2:mf(37),att:.005,rel:.4,cut:400,rev:.7});mn(t,.4,{ft:'lowpass',freq:180,gain:.25,rev:.5});}
  }
  if(main){
    mv(t,mf(ch[0]-12),STEP*.85,{type:'square',gain:.07,cut:380,rel:.05});
    if(pos===0||pos===4){mv(t,120,.3,{type:'sine',f2:42,f2t:.25,gain:.55,att:.002,rel:.1,cut:900});mn(t,.03,{ft:'highpass',freq:3000,gain:.15});}
    if(pos===2||pos===6){mn(t,.28,{freq:1800,q:.6,gain:.34,rev:1});mv(t,190,.12,{type:'triangle',gain:.12,f2:150,rel:.05,cut:3000});}
    mn(t,.035,{ft:'highpass',freq:8500,gain:pos%2?.05:.03});
    if(pos===0){let off=0;const up=pass%2===0?12:0;MELODY[b8].forEach(([n,d])=>{mv(t+off*2*STEP,mf(n+up-12),d*2*STEP*.94,{gain:.075,dist:true,cut:2600,att:.03,rel:.25,vib:18,dly:.4,rev:.35});off+=d;});}
  }else{
    if(b8>=6&&pos%2===0)mv(t,120,.3,{type:'sine',f2:42,f2t:.25,gain:.25+(b8-6)*.15,att:.002,rel:.1,cut:900});
    if(b8===7)mn(t,.12,{freq:1800,gain:.06+pos*.03,rev:.6});
  }
}
function musTick(){const c=A.ctx;if(!c)return;if(MUS.next<c.currentTime-.3)MUS.next=c.currentTime+.05;
  while(MUS.next<c.currentTime+.2){try{musStep(MUS.step,MUS.next);}catch(e){}MUS.next+=STEP;MUS.step++;}}
function musicStart(){
  if(!A.ctx)return;if(!MUS.out)musInit();if(MUS.playing)return;
  const c=A.ctx;MUS.playing=true;clearInterval(MUS.timer);MUS.step=0;MUS.next=c.currentTime+.15;
  MUS.out.gain.cancelScheduledValues(c.currentTime);MUS.out.gain.setValueAtTime(MUS.out.gain.value,c.currentTime);MUS.out.gain.linearRampToValueAtTime(.9,c.currentTime+1.5);
  MUS.timer=setInterval(musTick,25);musTick();
}
function musicStop(){
  if(!MUS.playing||!A.ctx)return;MUS.playing=false;const c=A.ctx;
  MUS.out.gain.cancelScheduledValues(c.currentTime);MUS.out.gain.setValueAtTime(MUS.out.gain.value,c.currentTime);MUS.out.gain.linearRampToValueAtTime(0,c.currentTime+.8);
  const tm=MUS.timer;setTimeout(()=>{if(!MUS.playing)clearInterval(tm);},900);
}
