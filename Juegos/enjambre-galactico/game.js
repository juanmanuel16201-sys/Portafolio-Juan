(()=>{
const W=480,H=640,DPR=2;
const cv=document.getElementById('game'),ctx=cv.getContext('2d');
cv.width=W*DPR;cv.height=H*DPR;
const FONT='Silkscreen,"Courier New",monospace';
const isTouch=matchMedia('(pointer:coarse)').matches;
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const C={red:'#ff3b5c',cyan:'#4fe3ff',gold:'#ffd23f',white:'#f4f6ff',green:'#2fd27a',purple:'#9b5cff'};

/* ---------- SPRITES (pixel art espejado) ---------- */
function mirror(r){return r+r.slice(0,-1).split('').reverse().join('');}
function sprite(half,pal,s=3){
  const rows=half.map(mirror),w=rows[0].length,h=rows.length,c=document.createElement('canvas');
  c.width=w*s*DPR;c.height=h*s*DPR;const g=c.getContext('2d');
  rows.forEach((r,y)=>{for(let x=0;x<w;x++){const col=pal[r[x]];if(col){g.fillStyle=col;g.fillRect(x*s*DPR,y*s*DPR,s*DPR,s*DPR);}}});
  c.w=w*s;c.h=h*s;return c;
}
const PLAYER=["......W","......W",".....WW",".....WW","...R.WW","...R.WB","W..WWWB","W..WWWW","W.WWWRW","WWWWRRW","WWW.RR.","WW....."];
const BEE_A=["...Y..Y","....YYY","BB..YRY","BBB.YYY",".BBBYRY","..BBYYY","...BYRY","....YYY",".....Y."];
const BEE_B=["...Y..Y","....YYY","....YRY","...BYYY","..BBYRY",".BBBYYY","BBB.YRY","BB..YYY",".....Y."];
const MOTH_A=["....W..",".....W.","RR...BB","RRR..BW","RRRR.BB",".RRRRBW","..RRRBB",".RR..BW","RR....B"];
const MOTH_B=["....W..",".....W.",".....BB","..R..BW",".RRR.BB","RRRRRBW","RRRR.BB","RRR..BW","RR....B"];
const BOSS_A=["...GGGG","..GGOGG",".GGGGGG","GG.GGPP","GG.GPPP","GGGGGGP","G..GG.G","G...G.G","....G.."];
const BOSS_B=["...GGGG","..GGOGG",".GGGGGG","GG.GGPP","GG.GPPP",".GGGGGP","..GGG.G","..G.G.G",".G..G.."];
const P_BEE={Y:C.gold,R:C.red,B:'#4fa8ff'},P_MOTH={R:C.red,B:'#4f7bff',W:C.white};
const P_BOSS={G:C.green,O:'#ffb347',P:C.purple},P_HURT={G:'#7a5cff',O:C.red,P:C.cyan};
const SPR={
  player:sprite(PLAYER,{W:C.white,R:C.red,B:'#4fa8ff'}),
  bee:[sprite(BEE_A,P_BEE),sprite(BEE_B,P_BEE)],
  moth:[sprite(MOTH_A,P_MOTH),sprite(MOTH_B,P_MOTH)],
  boss:[sprite(BOSS_A,P_BOSS),sprite(BOSS_B,P_BOSS)],
  bossHurt:[sprite(BOSS_A,P_HURT),sprite(BOSS_B,P_HURT)],
};
const PTS={bee:[50,100],moth:[80,160],boss:[150,400]};
const BOOM={bee:[C.gold,C.red,'#4fa8ff'],moth:[C.red,C.white,'#4f7bff'],boss:[C.green,C.purple,'#ffb347']};

/* ---------- AUDIO ---------- */
let AC=null,muted=false;
function audio(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;}}if(AC&&AC.state==='suspended')AC.resume();}
function tone(f,dur,type='square',vol=.06,slide=0,delay=0){
  if(!AC||muted)return;const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+dur+.03);
}
function noise(dur,vol=.15,cut=1800){
  if(!AC||muted)return;const n=Math.floor(AC.sampleRate*dur),b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=cut;g.gain.value=vol;
  s.connect(f).connect(g).connect(AC.destination);s.start();
}
const SFX={
  shoot:()=>tone(900,.08,'square',.035,-520),
  hit:()=>{noise(.2,.12);tone(240,.12,'triangle',.06,-140);},
  bossHit:()=>tone(520,.07,'square',.05,240),
  die:()=>{noise(.9,.28,1200);tone(320,.8,'sawtooth',.07,-280);},
  power:()=>[523,659,784,1046].forEach((f,i)=>tone(f,.1,'square',.045,0,i*.07)),
  start:()=>[392,523,659,523,659,784,1046].forEach((f,i)=>tone(f,.13,'square',.045,0,i*.12)),
  dive:()=>tone(1300,.55,'triangle',.025,-1000),
  alarm:()=>[0,1,2,3].forEach(i=>{tone(660,.18,'sawtooth',.04,0,i*.4);tone(440,.18,'sawtooth',.04,0,i*.4+.2);}),
  bigBoom:()=>{noise(1.8,.35,900);tone(120,1.5,'sawtooth',.08,-80);},
};

/* ---------- ESTADO ---------- */
let mode='title',T=0,score=0,hi=0,lives=3,stage=1,stats={shots:0,hits:0},kills=0,nextLife=20000;
try{hi=+(localStorage.getItem('enjambre-hi')||0)||0;}catch(e){}
function saveHi(){try{localStorage.setItem('enjambre-hi',String(hi));}catch(e){}}
let player,bullets=[],ebullets=[],enemies=[],spawnQ=[],particles=[],popups=[],drops=[],mother=null;
let stageClock=0,introT=0,clearT=0,overT=0,attackOn=false,attackT=0,breath=0,paused=false;
let screen='main',sel=0;
const input={left:false,right:false,fire:false};
const stars=Array.from({length:110},()=>({x:Math.random()*W,y:Math.random()*H,z:Math.random(),
  c:[C.white,'#ff6b8a',C.cyan,C.gold,'#9b7bff'][Math.floor(Math.random()*5)],p:Math.random()*6}));

const newPlayer=()=>({x:W/2,y:592,alive:true,inv:0,shield:false,dbl:0,cd:0,respawn:0});
player=newPlayer();player.alive=false;

function newGame(){
  score=0;lives=3;stage=1;stats={shots:0,hits:0};kills=0;nextLife=20000;
  player=newPlayer();particles=[];mode='play';paused=false;sel=0;startStage();
}
function goMenu(){
  saveHi();mode='title';screen='main';sel=0;paused=false;clearT=0;
  bullets=[];ebullets=[];enemies=[];spawnQ=[];popups=[];drops=[];particles=[];mother=null;
  player=newPlayer();player.alive=false;
}
function startStage(){
  bullets=[];ebullets=[];enemies=[];spawnQ=[];popups=[];drops=[];mother=null;
  stageClock=0;introT=2.2;clearT=0;attackOn=false;attackT=2;breath=0;
  if(stage%4===0){
    const hp=70+stage*12;
    mother={x:W/2,y:-90,hp,max:hp,t:0,state:'enter',fireT:2,spawnT:4,flash:0,dieT:0};
    SFX.alarm();
  }else{buildWaves();SFX.start();}
}

/* ---------- RUTAS ---------- */
function spline(pts,step=6){
  const out=[{x:pts[0].x,y:pts[0].y}],P=[pts[0],...pts,pts[pts.length-1]];
  for(let i=1;i<P.length-2;i++){
    const p0=P[i-1],p1=P[i],p2=P[i+1],p3=P[i+2],n=Math.max(2,Math.ceil(Math.hypot(p2.x-p1.x,p2.y-p1.y)/step));
    for(let k=1;k<=n;k++){const t=k/n,t2=t*t,t3=t2*t;
      const f=(a,b,c,d)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);
      out.push({x:f(p0.x,p1.x,p2.x,p3.x),y:f(p0.y,p1.y,p2.y,p3.y)});}
  }
  return out;
}
const ENTRY={
  top:[[220,-30],[220,80],[150,220],[90,330],[130,430],[220,420],[240,340],[200,280]],
  side:[[-30,600],[70,520],[170,430],[220,330],[180,250],[110,260],[90,330],[140,380]],
};
const entryPath=(kind,side)=>spline(ENTRY[kind].map(([x,y])=>({x:side>0?x:W-x,y})));
function divePath(e){
  const s=e.x<W/2?-1:1,px=player.x;
  return spline([{x:e.x,y:e.y},{x:e.x+s*28,y:e.y-34},{x:e.x+s*60,y:e.y-4},{x:e.x+s*40,y:e.y+50},
    {x:clamp(px+rand(-60,60),30,W-30),y:360},{x:clamp(px-s*rand(40,120),20,W-20),y:500},{x:clamp(px+s*rand(0,80),10,W-10),y:H+40}]);
}
function kamiPath(x,y){
  return spline([{x,y},{x:x+rand(-50,50),y:y+80},{x:clamp(player.x+rand(-50,50),20,W-20),y:420},{x:clamp(player.x+rand(-120,120),10,W-10),y:H+40}]);
}
function follow(e,dt,speed){
  let d=speed*dt;
  while(d>0&&e.pi<e.path.length){
    const p=e.path[e.pi],dx=p.x-e.x,dy=p.y-e.y,L=Math.hypot(dx,dy);
    if(L>.01)e.tAng=Math.atan2(dy,dx)+Math.PI/2;
    if(L<=d){e.x=p.x;e.y=p.y;d-=L;e.pi++;}else{e.x+=dx/L*d;e.y+=dy/L*d;d=0;}
  }
  return e.pi>=e.path.length;
}
function angDiff(a,b){let d=(a-b)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d;}

/* ---------- OLEADAS ---------- */
const mk=(type,row,col)=>({type,row,col,hp:type==='boss'?2:1,x:0,y:-50,state:'enter',path:null,pi:0,ang:0,tAng:0,fireAt:[]});
function buildWaves(){
  const all=[];
  for(let c=3;c<=6;c++)all.push(mk('boss',0,c));
  for(let r=1;r<=2;r++)for(let c=1;c<=8;c++)all.push(mk('moth',r,c));
  for(let r=3;r<=4;r++)for(let c=0;c<=9;c++)all.push(mk('bee',r,c));
  const take=f=>{const o=[];for(const e of all)if(!e._u&&f(e)){e._u=1;o.push(e);}return o;};
  const groups=[
    {list:take(e=>(e.type==='bee'&&e.row===3&&e.col>=3&&e.col<=6)||(e.type==='moth'&&e.row===1&&e.col>=3&&e.col<=6)),kind:'top',side:0},
    {list:take(e=>e.type==='boss'||(e.type==='moth'&&e.row===1)),kind:'side',side:-1},
    {list:take(e=>e.type==='moth'),kind:'side',side:1},
  ];
  const rest=take(()=>true);
  groups.push({list:rest.slice(0,8),kind:'top',side:1},{list:rest.slice(8),kind:'top',side:-1});
  groups.forEach((g,gi)=>{const t0=gi*2.6;
    g.list.forEach((e,j)=>{let side=g.side,t=t0+j*.15;if(side===0){side=j%2?1:-1;t=t0+Math.floor(j/2)*.16;}spawnQ.push({t,e,kind:g.kind,side});});
  });
  spawnQ.sort((a,b)=>a.t-b.t);
}
function slotPos(e){
  const sway=Math.sin(T*.9)*18*(1-breath),pulse=Math.sin(T*1.6)*breath;
  return {x:W/2+sway+(e.col-4.5)*40*(1+.07*pulse),y:72+e.row*34*(1+.05*pulse)};
}
const flySp=()=>210+Math.min(stage,10)*9,diveSp=()=>200+Math.min(stage,12)*12,ebSp=()=>Math.min(230+stage*9,350);

function setDive(e,path){
  e.state='dive';e.path=path;e.pi=0;const n=path.length;
  let shots=e.type==='bee'?(Math.random()<.5?1:2):(e.type==='moth'?2:1);if(stage>3)shots++;
  e.fireAt=Array.from({length:shots},()=>Math.floor(n*rand(.28,.6))).sort((a,b)=>a-b);
}
function launchDive(){
  const form=enemies.filter(e=>e.state==='form');if(!form.length)return;
  const diving=enemies.filter(e=>e.state==='dive').length,cap=form.length<=8?8:Math.min(2+Math.floor(stage/2),6);
  if(diving>=cap)return;
  let e=form[Math.floor(Math.random()*form.length)];
  if(Math.random()<.25){const b=form.filter(f=>f.type==='boss');if(b.length)e=b[Math.floor(Math.random()*b.length)];}
  const path=divePath(e);setDive(e,path);
  if(e.type==='boss'&&Math.random()<.6){
    form.filter(f=>f.type==='moth'&&f.row===1&&Math.abs(f.col-e.col)<=1.5).slice(0,2)
      .forEach((f,i)=>setDive(f,path.map(p=>({x:p.x+(i?30:-30),y:p.y+8}))));
  }
  SFX.dive();
}
function enemyShoot(e){
  if(!player.alive||e.y<0||e.y>player.y-90)return;
  const dx=player.x-e.x+rand(-24,24),dy=player.y-e.y,L=Math.hypot(dx,dy),v=ebSp();
  let vx=dx/L*v;const vy=dy/L*v;vx=clamp(vx,-vy*.6,vy*.6);
  ebullets.push({x:e.x,y:e.y+10,vx,vy});
}

/* ---------- EFECTOS ---------- */
function explode(x,y,cols,n=18,big=false){
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=rand(40,big?260:170);
    particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(.35,big?1.2:.7),max:1,c:cols[i%cols.length],s:Math.random()<.3?4:2});}
  particles.push({ring:true,x,y,r:4,life:big?.6:.35,max:big?.6:.35,c:cols[0],grow:big?260:140});
}
const popup=(x,y,txt,c=C.cyan)=>popups.push({x,y,txt,c,t:1.2});
function addScore(n){
  score+=n;
  if(score>=nextLife){lives++;nextLife+=50000;SFX.power();popup(player.x,player.y-40,'VIDA EXTRA',C.gold);}
  if(score>hi)hi=score;
}

/* ---------- DAÑO ---------- */
function hitEnemy(e){
  stats.hits++;e.hp--;
  if(e.hp>0){SFX.bossHit();explode(e.x,e.y,[C.cyan,C.white],6);return;}
  e.dead=true;kills++;
  const flying=e.state==='dive'||e.state==='kami',pts=PTS[e.type][flying?1:0];
  addScore(pts);if(flying&&pts>=160)popup(e.x,e.y,String(pts),C.cyan);
  explode(e.x,e.y,BOOM[e.type]);SFX.hit();
  if((e.type==='boss'&&Math.random()<.35)||kills%25===0)drops.push({x:e.x,y:e.y,k:Math.random()<.5?'D':'S'});
}
function hurtPlayer(){
  if(!player.alive||player.inv>0)return;
  if(player.shield){player.shield=false;player.inv=1.2;SFX.bossHit();explode(player.x,player.y,[C.cyan,C.white],14);return;}
  player.alive=false;player.respawn=2.4;lives--;bullets=[];
  explode(player.x,player.y,[C.white,C.red,'#4fa8ff',C.gold],40,true);SFX.die();
}

/* ---------- NAVE MADRE ---------- */
function motherSpread(m,n){
  const base=Math.atan2(player.y-m.y,player.x-m.x),v=ebSp()*.85;
  for(let i=0;i<n;i++){const a=base+(i-(n-1)/2)*.22;ebullets.push({x:m.x,y:m.y+26,vx:Math.cos(a)*v,vy:Math.max(60,Math.sin(a)*v)});}
}
function updateMother(dt){
  const m=mother;m.t+=dt;m.flash=Math.max(0,m.flash-dt);
  if(m.state==='enter'){if(introT<=0){m.y+=70*dt;if(m.y>=130){m.y=130;m.state='fight';}}}
  else if(m.state==='fight'){
    const rage=m.hp<m.max/2;
    m.x=W/2+Math.sin(m.t*(rage?.95:.65))*150;m.y=130+Math.sin(m.t*1.4)*22;
    m.fireT-=dt;if(m.fireT<=0&&player.alive){motherSpread(m,rage?7:5);m.fireT=rage?1:1.5;}
    m.spawnT-=dt;
    if(m.spawnT<=0){
      [-60,60].forEach(o=>{const e=mk(Math.random()<.5?'bee':'moth',0,0);e.x=m.x+o;e.y=m.y+24;e.state='kami';e.path=kamiPath(e.x,e.y);
        e.fireAt=[Math.floor(e.path.length*.4)];enemies.push(e);});
      m.spawnT=rage?3:4.5;SFX.dive();
    }
  }else if(m.state==='dying'){
    m.dieT-=dt;
    if(Math.random()<.35)explode(m.x+rand(-80,80),m.y+rand(-30,24),[C.gold,C.red,C.white],10);
    if(m.dieT<=0){explode(m.x,m.y,[C.gold,C.red,C.white,C.green],70,true);SFX.bigBoom();mother=null;}
  }
}

/* ---------- UPDATE ---------- */
function gameUpdate(dt){
  if(introT>0)introT-=dt;else stageClock+=dt;
  while(spawnQ.length&&spawnQ[0].t<=stageClock){
    const q=spawnQ.shift(),e=q.e;e.path=entryPath(q.kind,q.side);e.pi=0;e.x=e.path[0].x;e.y=e.path[0].y;e.state='enter';
    if(stage>1&&Math.random()<.15)e.fireAt=[Math.floor(e.path.length*.4)];
    enemies.push(e);
  }
  if(!spawnQ.length&&introT<=0)breath=Math.min(1,breath+dt*.6);
  if(!attackOn&&!mother&&introT<=0&&!spawnQ.length&&enemies.length&&enemies.every(e=>e.state==='form')){attackOn=true;attackT=1.2;}
  if(attackOn&&player.alive&&mode==='play'){attackT-=dt;if(attackT<=0){launchDive();attackT=Math.max(.55,2.1-stage*.14)*rand(.7,1.2);}}

  // jugador
  if(player.alive){
    const mv=(input.right?1:0)-(input.left?1:0);player.x=clamp(player.x+mv*270*dt,22,W-22);
    player.cd-=dt;player.inv=Math.max(0,player.inv-dt);if(player.dbl>0)player.dbl=Math.max(0,player.dbl-dt);
    if(input.fire&&player.cd<=0&&mode==='play'){
      const dbl=player.dbl>0,n=dbl?2:1,maxB=dbl?4:2;
      if(bullets.length+n<=maxB){
        if(dbl)bullets.push({x:player.x-9,y:player.y-16},{x:player.x+9,y:player.y-16});else bullets.push({x:player.x,y:player.y-18});
        stats.shots+=n;player.cd=.16;SFX.shoot();
      }
    }
  }else if(mode==='play'){
    player.respawn-=dt;
    if(player.respawn<=0){
      if(lives>0){player=newPlayer();player.inv=2.2;}
      else{mode='over';overT=0;sel=0;saveHi();}
    }
  }

  // enemigos
  const fs=flySp(),ds=diveSp();
  for(const e of enemies){
    const sp=slotPos(e);
    if(e.state==='enter'||e.state==='dive'||e.state==='kami'){
      const done=follow(e,dt,e.state==='enter'?fs:ds);
      if(e.fireAt.length&&e.pi>=e.fireAt[0]){e.fireAt.shift();enemyShoot(e);}
      if(done){if(e.state==='kami')e.dead=true;else{if(e.state==='dive'){e.x=sp.x;e.y=-30;}e.state='home';}}
    }else if(e.state==='home'){
      const dx=sp.x-e.x,dy=sp.y-e.y,L=Math.hypot(dx,dy),v=230*dt;
      if(L<=v){e.x=sp.x;e.y=sp.y;e.state='form';}
      else{e.x+=dx/L*v;e.y+=dy/L*v;e.tAng=L<50?Math.PI:Math.atan2(dy,dx)+Math.PI/2;}
    }else{e.x=sp.x;e.y=sp.y;e.tAng=Math.PI;}
    e.ang+=angDiff(e.tAng,e.ang)*Math.min(1,dt*10);
    if(player.alive&&e.state!=='form'&&Math.abs(e.x-player.x)<22&&Math.abs(e.y-player.y)<22){hitEnemy(e);if(!e.dead){e.dead=true;}hurtPlayer();}
  }
  if(mother)updateMother(dt);

  // balas jugador
  for(const b of bullets){
    b.y-=640*dt;if(b.y<-20){b.dead=true;continue;}
    for(const e of enemies){if(!e.dead&&Math.abs(e.x-b.x)<15&&Math.abs(e.y-b.y)<15){hitEnemy(e);b.dead=true;break;}}
    const m=mother;
    if(!b.dead&&m&&m.state==='fight'&&Math.abs(b.x-m.x)<86&&b.y>m.y-38&&b.y<m.y+26){
      b.dead=true;stats.hits++;m.hp--;m.flash=.06;addScore(10);explode(b.x,b.y,[C.cyan,C.white],4);
      if(m.hp<=0){m.state='dying';m.dieT=1.6;addScore(5000);popup(m.x,m.y,'5000',C.gold);SFX.bigBoom();}
    }
  }
  // balas enemigas
  for(const b of ebullets){
    b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y>H+10||b.x<-10||b.x>W+10){b.dead=true;continue;}
    if(player.alive&&player.inv<=0&&Math.abs(b.x-player.x)<11&&Math.abs(b.y-player.y)<14){b.dead=true;hurtPlayer();}
  }
  // poderes
  for(const d of drops){
    d.y+=80*dt;if(d.y>H+20)d.dead=true;
    if(player.alive&&Math.abs(d.x-player.x)<24&&Math.abs(d.y-player.y)<24){
      d.dead=true;SFX.power();
      if(d.k==='D'){player.dbl=12;popup(player.x,player.y-40,'DOBLE DISPARO',C.gold);}
      else{player.shield=true;popup(player.x,player.y-40,'ESCUDO',C.cyan);}
    }
  }
  enemies=enemies.filter(e=>!e.dead);bullets=bullets.filter(b=>!b.dead);ebullets=ebullets.filter(b=>!b.dead);drops=drops.filter(d=>!d.dead);

  if(mode==='play'&&introT<=0&&!spawnQ.length&&!enemies.length&&!mother&&clearT===0)clearT=2.4;
  if(clearT>0){clearT-=dt;if(clearT<=0){stage++;startStage();}}
}
function update(dt){
  const sp=mode==='play'?1:.6;
  for(const s of stars){s.y+=(20+s.z*90)*dt*sp;if(s.y>H){s.y=0;s.x=Math.random()*W;}}
  for(const p of particles){p.life-=dt;if(p.ring)p.r+=p.grow*dt;else{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy*=.97;}}
  particles=particles.filter(p=>p.life>0);
  for(const p of popups){p.t-=dt;p.y-=24*dt;}popups=popups.filter(p=>p.t>0);
  if(mode==='play'||mode==='over')gameUpdate(dt);
  if(mode==='over')overT+=dt;
}

/* ---------- DIBUJO ---------- */
function txt(s,x,y,size,col,al='center',w=700){ctx.font=`${w} ${size}px ${FONT}`;ctx.textAlign=al;ctx.textBaseline='middle';ctx.fillStyle=col;ctx.fillText(s,x,y);}
function drawSpr(spr,x,y,ang=0,sc=1){ctx.save();ctx.translate(x,y);if(ang)ctx.rotate(ang);ctx.drawImage(spr,-spr.w*sc/2,-spr.h*sc/2,spr.w*sc,spr.h*sc);ctx.restore();}
function enemySpr(e,fast){const f=Math.floor(T*(fast?8:2))%2;return e.type==='boss'?(e.hp<2?SPR.bossHurt:SPR.boss)[f]:SPR[e.type][f];}

function drawMother(m){
  ctx.save();ctx.translate(Math.round(m.x),Math.round(m.y));
  const fl=m.flash>0,hull=fl?C.white:C.green,wing=fl?C.white:'#3b2a7a',dark=fl?C.white:'#16603b';
  ctx.fillStyle=wing;ctx.fillRect(-90,-6,6,18);ctx.fillRect(84,-6,6,18);ctx.fillRect(-84,-12,36,24);ctx.fillRect(48,-12,36,24);
  ctx.fillStyle=C.purple;for(let i=0;i<3;i++){ctx.fillRect(-80+i*12,-6,6,6);ctx.fillRect(56+i*12,-6,6,6);}
  ctx.fillStyle=hull;ctx.fillRect(-48,-24,96,42);ctx.fillRect(-30,-36,60,12);ctx.fillRect(-12,-42,24,6);
  ctx.fillStyle=dark;ctx.fillRect(-48,12,96,6);ctx.fillRect(-42,-18,12,6);ctx.fillRect(30,-18,12,6);
  ctx.fillStyle='#55607a';ctx.fillRect(-66,6,12,20);ctx.fillRect(54,6,12,20);ctx.fillRect(-6,18,12,10);
  const r=10+Math.sin(m.t*7)*3,g=ctx.createRadialGradient(0,-4,1,0,-4,r+6);
  g.addColorStop(0,'#fff6c8');g.addColorStop(.4,'#ffb347');g.addColorStop(1,'rgba(255,59,92,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-4,r+6,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawFlags(){
  let s=stage,x=W-12;const parts=[];while(s>=10){parts.push(10);s-=10;}while(s>=5){parts.push(5);s-=5;}while(s>=1){parts.push(1);s--;}
  for(const p of parts.slice(0,12)){
    const h=p===1?14:18,c=p===10?C.gold:p===5?C.cyan:C.red;
    ctx.fillStyle=C.white;ctx.fillRect(x,636-h,2,h);
    ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x,636-h);ctx.lineTo(x-(p===1?8:11),636-h+(p===1?4:6));ctx.lineTo(x,636-h+(p===1?8:12));ctx.closePath();ctx.fill();
    x-=p===1?11:15;
  }
}
function drawHUD(){
  txt('1UP',64,16,12,Math.floor(T*2.5)%2?C.red:'#7a1c30');txt(String(score),64,34,14,C.white);
  txt('RÉCORD',W/2,16,12,C.red);txt(String(hi),W/2,34,14,C.white);
  if(mode!=='title'){
    txt('ETAPA '+stage,W-64,16,12,C.cyan);
    if(player.dbl>0)txt('DOBLE '+Math.ceil(player.dbl),W-64,34,11,C.gold);
    else if(player.shield)txt('ESCUDO',W-64,34,11,C.cyan);
    for(let i=0;i<Math.min(lives-1,6);i++)drawSpr(SPR.player,18+i*22,624,0,.5);
    drawFlags();
  }
}
/* ---------- MENÚS ---------- */
const soundItem=()=>({t:'SONIDO: '+(muted?'NO':'SÍ'),a:()=>{muted=!muted;}});
function menuLayout(){
  if(mode==='title'){
    if(screen==='howto')return{items:[{t:'VOLVER',a:()=>{screen='main';sel=1;}}],y0:596,gap:36};
    return{items:[{t:'JUGAR',a:newGame},{t:'CÓMO JUGAR',a:()=>{screen='howto';sel=0;}},soundItem()],y0:300,gap:42,
      hint:isTouch?'TOCA UNA OPCIÓN':'ARRIBA / ABAJO ELEGIR  ·  ENTER ACEPTAR',hintY:438};
  }
  if(mode==='play'&&paused)return{items:[{t:'CONTINUAR',a:()=>{paused=false;}},{t:'REINICIAR',a:newGame},soundItem(),{t:'MENÚ PRINCIPAL',a:goMenu}],y0:290,gap:40};
  if(mode==='over'&&overT>1.2)return{items:[{t:'REINTENTAR',a:newGame},{t:'MENÚ PRINCIPAL',a:goMenu}],y0:486,gap:38};
  return null;
}
function drawMenu(){
  const L=menuLayout();if(!L)return;sel=Math.min(sel,L.items.length-1);
  L.items.forEach((it,i)=>{
    const y=L.y0+i*L.gap,on=i===sel;txt(it.t,W/2,y,on?16:14,on?C.gold:'#8b93c9');
    if(on){ctx.font=`700 16px ${FONT}`;const w=ctx.measureText(it.t).width;drawSpr(SPR.player,W/2-w/2-26,y,Math.PI/2,.55);}
  });
  if(L.hint)txt(L.hint,W/2,L.hintY,10,'#5d6597',undefined,400);
}
function drawTitle(){
  const f=Math.floor(T*2)%2;
  [['boss',3,4,5,6],['moth',2,3,4,5,6,7]].forEach(([t,...cols],r)=>cols.forEach(c=>drawSpr(SPR[t][f],W/2+(c-4.5)*40+Math.sin(T)*10,80+r*34,Math.PI)));
  txt('ENJAMBRE',W/2,172,38,C.gold);txt('GALÁCTICO',W/2,212,24,C.cyan);
  ctx.fillStyle=Math.floor(T*20)%2?'#ffb347':C.red;ctx.fillRect(W/2-3,548,6,4+Math.random()*4);
  drawSpr(SPR.player,W/2,530);
  txt('CADA 4 ETAPAS: NAVE MADRE',W/2,596,10,C.green,undefined,400);
}
function drawHowto(){
  const f=Math.floor(T*2)%2,dim='#8b93c9';
  txt('CÓMO JUGAR',W/2,82,22,C.cyan);
  txt('PUNTOS',W/2,126,11,C.red);txt('FORMACIÓN / PICADA',W/2+40,146,9,dim);
  [['boss','150 / 400'],['moth','80 / 160'],['bee','50 / 100']].forEach(([t,p],i)=>{
    drawSpr(SPR[t][f],W/2-90,176+i*36,Math.PI);txt(p,W/2+40,176+i*36,14,C.white);});
  [['D',C.gold,'DOBLE DISPARO'],['S',C.cyan,'ESCUDO']].forEach(([k,c,l],i)=>{drawCapsule(W/2-90,294+i*28,k,c);txt(l,W/2+40,294+i*28,11,C.white);});
  txt('LOS JEFES VERDES AGUANTAN 2 TIROS',W/2,356,10,C.green,undefined,400);
  const ctl=isTouch?[['< >','MOVER'],['FUEGO','DISPARAR'],['II','PAUSA']]
    :[['FLECHAS / A D','MOVER'],['ESPACIO / Z','DISPARAR'],['P / ESC','PAUSA'],['M','SONIDO']];
  txt('CONTROLES',W/2,400,11,C.red);
  ctl.forEach(([k,v],i)=>{txt(k,W/2-20,428+i*24,11,C.gold,'right');txt(v,W/2+20,428+i*24,11,C.white,'left',400);});
}
function drawCapsule(x,y,k,c){ctx.fillStyle=c;ctx.fillRect(x-10,y-8,20,16);ctx.fillStyle='#000';ctx.fillRect(x-8,y-6,16,12);txt(k,x,y+1,11,c);}

function draw(){
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.imageSmoothingEnabled=false;
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  for(const s of stars){ctx.globalAlpha=.35+.65*Math.abs(Math.sin(T*2+s.p));ctx.fillStyle=s.c;const z=s.z>.75?2:1;ctx.fillRect(s.x,s.y,z,z);}
  ctx.globalAlpha=1;

  if(mode==='title'){screen==='howto'?drawHowto():drawTitle();}
  else{
    if(mother)drawMother(mother);
    for(const e of enemies)drawSpr(enemySpr(e,e.state!=='form'),Math.round(e.x),Math.round(e.y),e.ang);
    for(const d of drops)drawCapsule(d.x,d.y,d.k,d.k==='D'?C.gold:C.cyan);
    for(const b of bullets){ctx.fillStyle=C.white;ctx.fillRect(b.x-1.5,b.y-6,3,12);ctx.fillStyle=C.red;ctx.fillRect(b.x-1.5,b.y-8,3,3);}
    for(const b of ebullets){ctx.fillStyle=C.red;ctx.fillRect(b.x-2,b.y-5,4,10);ctx.fillStyle=C.white;ctx.fillRect(b.x-.5,b.y-3,1,6);}
    if(player.alive&&!(player.inv>0&&Math.floor(T*14)%2)){
      ctx.fillStyle=Math.floor(T*20)%2?'#ffb347':C.red;ctx.fillRect(player.x-3,player.y+18,6,4+Math.random()*4);
      drawSpr(SPR.player,player.x,player.y);
      if(player.shield){ctx.strokeStyle=C.cyan;ctx.globalAlpha=.5+.3*Math.sin(T*8);ctx.lineWidth=2;ctx.beginPath();ctx.arc(player.x,player.y,26,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    }
  }
  for(const p of particles){
    const a=clamp(p.life/(p.ring?p.max:.6),0,1);ctx.globalAlpha=a;
    if(p.ring){ctx.strokeStyle=p.c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.stroke();}
    else{ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,p.s,p.s);}
  }
  ctx.globalAlpha=1;
  for(const p of popups){ctx.globalAlpha=clamp(p.t,0,1);txt(p.txt,p.x,p.y,12,p.c);}
  ctx.globalAlpha=1;

  if(mother&&mother.state!=='dying'&&mode!=='title'){
    const w=260,x=(W-w)/2;txt('NAVE MADRE',W/2,54,10,C.red);
    ctx.fillStyle='#2a1020';ctx.fillRect(x,62,w,6);ctx.fillStyle=mother.hp<mother.max/2?C.red:C.green;ctx.fillRect(x,62,w*mother.hp/mother.max,6);
  }
  if(mode==='play'&&introT>0){
    if(mother){if(Math.floor(T*4)%2)txt('¡ALERTA!',W/2,290,20,C.red);txt('NAVE MADRE',W/2,326,26,C.gold);}
    else{txt('ETAPA '+stage,W/2,310,26,C.cyan);}
  }
  if(mode==='play'&&clearT>0){
    txt('ETAPA '+stage+' SUPERADA',W/2,300,18,C.gold);
    txt('PRECISIÓN '+(stats.shots?(stats.hits/stats.shots*100).toFixed(1):'0.0')+' %',W/2,332,12,C.white,undefined,400);
  }
  if(mode==='over'){
    ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,H);
    txt('FIN DEL JUEGO',W/2,220,28,C.red);
    txt('— RESULTADOS —',W/2,280,12,C.cyan);
    const acc=stats.shots?(stats.hits/stats.shots*100).toFixed(1):'0.0';
    [['DISPAROS',stats.shots],['ACIERTOS',stats.hits],['PRECISIÓN',acc+' %'],['ETAPA',stage]].forEach(([l,v],i)=>{
      txt(l,W/2-110,316+i*28,13,C.white,'left');txt(String(v),W/2+110,316+i*28,13,C.gold,'right');});
    if(score>=hi&&score>0)txt('¡NUEVO RÉCORD!',W/2,446,14,C.gold);
  }
  drawHUD();
  if(paused){ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,W,H);txt('PAUSA',W/2,220,30,C.cyan);}
  drawMenu();
}

/* ---------- ENTRADA ---------- */
function moveSel(d){const L=menuLayout();if(!L)return;sel=(sel+d+L.items.length)%L.items.length;tone(660,.05,'square',.03);}
function activate(){const L=menuLayout();if(!L)return;sel=Math.min(sel,L.items.length-1);input.fire=false;tone(990,.08,'square',.04);L.items[sel].a();}
function togglePause(){if(mode==='play'){paused=!paused;sel=0;}}
const KEYMAP={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'fire',KeyZ:'fire',KeyJ:'fire'};
addEventListener('keydown',e=>{
  audio();
  if(menuLayout()){
    if(e.code==='ArrowUp'||e.code==='KeyW'){e.preventDefault();moveSel(-1);return;}
    if(e.code==='ArrowDown'||e.code==='KeyS'){e.preventDefault();moveSel(1);return;}
    if(e.code==='Enter'||e.code==='Space'){e.preventDefault();if(!e.repeat)activate();return;}
    if(e.code==='Escape'&&mode==='title'&&screen==='howto'){screen='main';sel=1;return;}
  }
  const k=KEYMAP[e.code];
  if(k||e.code==='ArrowUp'||e.code==='ArrowDown')e.preventDefault();
  if(k)input[k]=true;
  if(e.code==='KeyP'||e.code==='Escape')togglePause();
  if(e.code==='KeyM')muted=!muted;
});
addEventListener('keyup',e=>{const k=KEYMAP[e.code];if(k)input[k]=false;});
addEventListener('blur',()=>{input.left=input.right=input.fire=false;if(mode==='play'&&!paused){paused=true;sel=0;}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play'&&!paused){paused=true;sel=0;}});
function canvasPt(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};}
function hitItem(p){const L=menuLayout();if(!L)return -1;for(let i=0;i<L.items.length;i++)if(Math.abs(p.y-(L.y0+i*L.gap))<L.gap/2&&Math.abs(p.x-W/2)<170)return i;return -1;}
cv.addEventListener('pointerdown',e=>{audio();const i=hitItem(canvasPt(e));if(i>=0){sel=i;activate();}});
cv.addEventListener('pointermove',e=>{const i=hitItem(canvasPt(e));cv.style.cursor=i>=0?'pointer':'default';if(e.pointerType==='mouse'&&i>=0)sel=i;});
document.querySelectorAll('.pbtn[data-k]').forEach(b=>{
  const k=b.dataset.k,on=e=>{e.preventDefault();audio();if(menuLayout()){if(k==='fire')activate();else moveSel(k==='left'?-1:1);return;}input[k]=true;b.classList.add('on');try{b.setPointerCapture(e.pointerId);}catch(_){}},
    off=()=>{input[k]=false;b.classList.remove('on');};
  b.addEventListener('pointerdown',on);['pointerup','pointercancel','lostpointercapture'].forEach(ev=>b.addEventListener(ev,off));
});
document.getElementById('bP').addEventListener('pointerdown',e=>{e.preventDefault();audio();togglePause();});

/* ---------- AJUSTE DE TAMAÑO ---------- */
const box=document.getElementById('stage');
function fit(){const r=box.getBoundingClientRect(),s=Math.max(.2,Math.min(r.width/W,r.height/H));cv.style.width=Math.floor(W*s)+'px';cv.style.height=Math.floor(H*s)+'px';}
addEventListener('resize',fit);if(window.ResizeObserver)new ResizeObserver(fit).observe(box);

/* ---------- BUCLE ---------- */
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(!paused){T+=dt;update(dt);}draw();requestAnimationFrame(frame);}
function boot(data){
  if(data&&data.hi)hi=Math.max(hi,+data.hi||0);
  try{window.claude?.hot?.snapshot?.(()=>({hi}));}catch(_){}
  fit();requestAnimationFrame(frame);
}
window.claude?.hot?.ready?window.claude.hot.ready(boot):boot(window.claude?.hot?.data??{});
})();
