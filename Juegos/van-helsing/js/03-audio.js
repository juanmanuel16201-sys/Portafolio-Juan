/* Van Helsing · Sonidos sintetizados con Web Audio */
/* ---------- audio ---------- */
let AC=null,MG=null,NB=null;
function audioInit(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.gain.value=.55;MG.connect(AC.destination);ambientSnd()}catch(e){AC=null}}
function nbuf(){if(!NB){NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const a=NB.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1}return NB}
function tone(f,d,type='square',v=.2,f2,delay=0){if(!AC||v<=.001)return;const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(MG);o.start(t);o.stop(t+d+.03)}
function noise(d,freq=1200,v=.4,type='lowpass',delay=0){if(!AC||v<=.001)return;const t=AC.currentTime+delay,s=AC.createBufferSource();s.buffer=nbuf();const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;const g=AC.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);g.connect(MG);s.start(t);s.stop(t+d+.02)}
function ambientSnd(){const g=AC.createGain();g.gain.value=.032;g.connect(MG);[55,55.6,82.4].forEach(f=>{const o=AC.createOscillator();o.type='sine';o.frequency.value=f;o.connect(g);o.start()});
 const s=AC.createBufferSource();s.buffer=nbuf();s.loop=true;const fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=380;const wg=AC.createGain();wg.gain.value=.05;s.connect(fl);fl.connect(wg);wg.connect(MG);s.start()}
const vol=(pos,v)=>v*clamp(1-pos.distanceTo(P.pos)/45,0,1);
const SFX={
 shot:[()=>{noise(.15,2600,.5);tone(170,.12,'square',.14,50)},()=>{noise(.38,1100,.9);tone(90,.25,'sawtooth',.22,40)},()=>{tone(720,.08,'triangle',.2,240);noise(.07,4200,.15,'highpass')},()=>{noise(.07,3200,.28);tone(220,.05,'square',.07,80)},()=>{noise(.25,3000,.7);tone(260,.18,'sawtooth',.2,60);noise(.5,500,.25,'lowpass',.05)},()=>{if(Math.random()<.5)noise(.1,900,.22,'bandpass')},()=>{noise(.25,6000,.4,'highpass');tone(1800,.2,'sawtooth',.12,200)},()=>{tone(140,.15,'square',.25,60);noise(.12,800,.3)}],
 empty:()=>tone(1300,.03,'square',.07),hit:()=>tone(1150,.04,'square',.05,1600),kill:()=>tone(320,.25,'sawtooth',.1,60),
 hurt:()=>tone(160,.18,'sawtooth',.22,70),pick:()=>{tone(700,.08,'sine',.2,1000);tone(1050,.1,'sine',.2,1400,.07)},
 cast:p=>noise(.3,650,vol(p,.25),'bandpass'),
 scream:p=>{const v=vol(p,.14);tone(1150,1.1,'sine',v,560);tone(1190,1.1,'sine',v*.7,610)},
 whistle:p=>{const v=vol(p,.13);tone(1500,.35,'sine',v,2100);tone(2100,.45,'sine',v,1300,.38)},
 howl:p=>tone(380,1,'sine',vol(p,.12),720),
 cackle:p=>{const v=vol(p,.09);for(let i=0;i<5;i++)tone(i%2?720:940,.07,'square',v,null,i*.08)},
 bats:p=>{const v=vol(p,.06);for(let i=0;i<4;i++)tone(3200+Math.random()*900,.04,'square',v,4200,i*.06)},
 hiss:p=>noise(.6,5000,vol(p,.18),'highpass'),
 moo:p=>{tone(110,.9,'sawtooth',vol(p,.2),70);noise(.6,400,vol(p,.15))},
 roar:()=>{tone(70,1.4,'sawtooth',.32,35);noise(1.2,320,.4)},
 boom:()=>{noise(.7,700,.9);tone(120,.5,'sine',.3,40)},
 summon:()=>{tone(330,.25,'triangle',.2,660);tone(495,.3,'triangle',.18,990,.15)},
 jump:()=>tone(240,.1,'sine',.08,360)
};

