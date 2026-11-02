/* Van Helsing · Los cinco mapas */
/* ---------- maps ---------- */
function mapCementerio(W){
 const stT=tex('stone','#62656d','#40434a'),dirt=tex('dirt','#3a3128','#241e18',1,16),stM=LT(stT),stD=LT(tex('stone','#4a4c53','#2c2e33'));
 rot(flat(mesh(G('PlaneGeometry',4.4,ARENA*2),LT(dirt),0,.02,0,W)),-PI/2,0,0);rot(flat(mesh(G('PlaneGeometry',4.4,ARENA*2),LT(dirt),0,.021,0,W)),-PI/2,0,PI/2);
 rot(flat(mesh(G('CircleGeometry',8,40),LT(tex('tiles','#4f5057','#2c2d32',3)),0,.03,0,W)),-PI/2,0,0);rot(mesh(G('TorusGeometry',8,.2,6,48),stM,0,.08,0,W),PI/2,0,0);
 {const w=new THREE.Group();cy(1.3,1.45,.95,stM,0,.48,0,w,16);flat(cy(1.05,1.05,.97,B(0x030405),0,.49,0,w,16));const wd=LT(tex('wood','#4a3424','#1e140c'));
  bx(.16,2.4,.16,wd,-1.15,1.2,0,w);bx(.16,2.4,.16,wd,1.15,1.2,0,w);rot(cy(.1,.1,2.5,wd,0,2.1,0,w,6),0,0,PI/2);rot(cn(1.8,1,LT(tex('thatch','#3a3020','#1e180e')),0,2.9,0,w,4),0,PI/4,0);W.add(w);obst(0,0,1.6)}
 // church
 {const g=new THREE.Group();bx(17,8,1.2,stM,0,4,-52,g);bx(1.2,6,11,stM,-8.5,3,-47,g);bx(1.2,3.5,7,stD,8.5,1.75,-48.5,g);bx(5.5,7,1.2,stM,-5.8,3.5,-42,g);bx(4,4.2,1.2,stD,6.5,2.1,-42,g);
  bx(4.4,14,4.4,stM,6.5,7,-52,g);rot(cn(3.6,5,stD,6.5,16.5,-52,g,4),0,PI/4,0);bx(.4,2.4,.4,L(0x6e7078),6.5,20,-52,g);bx(1.5,.4,.4,L(0x6e7078),6.5,20.4,-52,g);
  const rose=rot(cy(1.5,1.5,.25,GL(0x8a0d16),0,5.4,-51.35,g,24),PI/2,0,0);const rg=glow(0xff3040,7);rg.position.set(0,5.4,-51);g.add(rg);
  for(let i=0;i<5;i++)rot(bx(.2,.2,9,LT(tex('wood','#3a2a1c','#1a1008')),rand(-6,6),rand(5,7),-47,g),rand(-.3,.3),rand(-.4,.4),rand(-.3,.3));
  for(let i=0;i<4;i++)for(const sx of[-1,1])bx(2.6,.5,.5,LT(tex('wood','#3a2a1c','#1a1008')),sx*3,.45,-49+i*1.6,g);
  bx(2.6,1.2,1,stM,0,.6,-50.5,g);flame(g,-.9,1.2,-50.5,.35,true);flame(g,.9,1.2,-50.5,.35,false);
  for(let i=0;i<7;i++)bx(rand(.6,1.4),rand(.3,.7),rand(.6,1.2),stD,rand(-6,6),.25,rand(-50,-44),g).rotation.y=rand(0,3);
  W.add(g);for(let x=-7;x<=7;x+=2)obst(x,-52,1.2);for(let z=-51;z<=-43;z+=2){obst(-8.5,z,1);obst(8.5,z,1)}[-7.5,-5.5,-4,5,7].forEach(x=>obst(x,-42,1.1));obst(6.5,-52,2.8)}
 // mausoleums
 [[-34,-20],[34,-20],[-30,28],[30,28]].forEach(([x,z],i)=>{const g=new THREE.Group();
  bx(7.4,.4,7.4,stD,0,.2,0,g);bx(6.8,.4,6.8,stD,0,.6,0,g);bx(6,4.6,6,stM,0,3.1,0,g);bx(6.6,.45,6.6,stD,0,5.6,0,g);rot(cn(4.7,3,stD,0,7.3,0,g,4),0,PI/4,0);
  for(const cx of[-2.3,-1.1,1.1,2.3])cy(.28,.32,4.6,LT(tex('stone','#7a7d84','#55585e')),cx,3.1,3.3,g,12);
  const tri=rot(mesh(G('CylinderGeometry',1,1,.8,3),stD,0,6.4,3.1,g),-PI/2,0,0);tri.scale.set(3.6,1,1.1);
  bx(1.9,3,.12,L(0x1a1c20,{metalness:.7,roughness:.4}),0,2.3,3.03,g);for(let b=-3;b<=3;b++)bx(.05,2.9,.05,L(0x3a3c40,{metalness:.8,roughness:.4}),b*.25,2.3,3.1,g);
  const ins=glow(0x6affd0,2.5,true,.5);ins.position.set(0,2,2.7);g.add(ins);
  flame(g,-1.4,.8,3.6,.3,i<2);flame(g,1.4,.8,3.6,.3,false);
  bx(.15,1.3,.15,L(0x6e7078),0,9.2,0,g);bx(.75,.15,.15,L(0x6e7078),0,9.4,0,g);
  g.position.set(x,0,z);g.rotation.y=Math.atan2(-x,-z);W.add(g);obst(x,z,4.6)});
 // lanterns
 [[6.5,6.5],[-6.5,6.5],[6.5,-6.5],[-6.5,-6.5]].forEach(([x,z])=>{const ir=L(0x1d1f24,{metalness:.7,roughness:.5});cy(.08,.12,3,ir,x,1.5,z,W,8);bx(.55,.65,.55,B(0xffc070,{transparent:true,opacity:.35}),x,3.25,z,W);
  for(const [dx,dz] of[[-.27,-.27],[.27,-.27],[-.27,.27],[.27,.27]])bx(.05,.7,.05,ir,x+dx,3.25,z+dz,W);cn(.5,.4,ir,x,3.8,z,W,4).rotation.y=PI/4;flame(W,x,3.05,z,.4,true);obst(x,z,.35)});
 // statues
 [[-14,14],[14,14],[-14,-14],[14,-14]].forEach(([x,z])=>statue(W,x,z,'angel'));
 // trees
 for(let n=0;n<18*DQ();n++){const p=place(.8);if(p)deadTree(W,p[0],p[1],rand(.9,1.3))}
 // tombs
 const stones=[stM,LT(tex('stone','#55585f','#36383e')),LT(tex('stone','#74767d','#4b4d53'))];const flowers=[];
 for(let n=0;n<95*DQ();n++){const p=place(.7);if(!p)break;const [x,z]=p,g=new THREE.Group(),m=pick(stones),k=Math.random();
  if(k<.45){bx(.85,1.05,.2,m,0,.52,0,g);rot(cy(.425,.425,.2,m,0,1.05,0,g,14),PI/2,0,0);bx(.5,.06,.02,L(0x2a2c30),0,.75,.11,g)}
  else if(k<.7){bx(.2,1.6,.2,m,0,.8,0,g);bx(.85,.2,.2,m,0,1.15,0,g);bx(.5,.25,.5,m,0,.12,0,g)}
  else if(k<.88){bx(1.1,.55,2.1,m,0,.27,0,g);bx(.95,.9,.2,m,0,.95,-.95,g);rot(cn(.5,.4,m,0,1.6,-.95,g,4),0,PI/4,0)}
  else{const h=rand(2,3.2);rot(cy(.25,.32,h,m,0,h/2,0,g,4),0,PI/4,0);rot(cn(.32,.6,m,0,h+.3,0,g,4),0,PI/4,0);bx(.9,.3,.9,m,0,.15,0,g)}
  flat(bx(1,.06,1.9,LT(tex('dirt','#2a2420','#151210')),0,.03,k<.7?.95:0,g));
  if(Math.random()<.45)flowers.push([x+rand(-.5,.5),z+rand(.4,1.4)]);if(Math.random()<.12)flame(W,x+rand(-.4,.4),.05,z+rand(.6,1),.18,false);
  g.position.set(x,0,z);g.rotation.set(rand(-.07,.07),Math.round(rand(-.2,.2)*10)/10+(Math.random()<.5?0:PI),rand(-.09,.09));W.add(g);obst(x,z,.7)}
 for(let i=0;i<6;i++){const p=place(1.2);if(!p)break;const [x,z]=p,g=new THREE.Group();flat(bx(1,.05,2,B(0x020203),0,.03,0,g));const mound=sp(.9,LT(tex('dirt','#3a3128','#1e1a14')),1.3,0,0,g,10);mound.scale.set(.8,.5,1.4);
  bx(.06,1.2,.06,L(0x4a3424),1.4,.9,.6,g).rotation.z=.4;bx(.25,.35,.04,L(0x6a6c70,{metalness:.8,roughness:.4}),1.62,.35,.6,g).rotation.z=.4;g.position.set(x,0,z);g.rotation.y=rand(0,6);W.add(g);obst(x,z,1.1)}
 {const im=new THREE.InstancedMesh(G('SphereGeometry',.13,7,5),L(0xf08a12,{emissive:0x3a1a00}),flowers.length*4),d=new THREE.Object3D();let i=0;
  flowers.forEach(([x,z])=>{for(let j=0;j<4;j++){d.position.set(x+rand(-.3,.3),.14,z+rand(-.3,.3));d.updateMatrix();im.setMatrixAt(i++,d.matrix)}});W.add(im)}
 // fence and gate
 {const R=ARENA+1,n=Math.floor(PI*2*R/.4),ir=L(0x1c1e23,{metalness:.6,roughness:.5}),im=new THREE.InstancedMesh(G('BoxGeometry',.06,2,.06),ir,n),tips=new THREE.InstancedMesh(G('ConeGeometry',.06,.22,4),ir,n),d=new THREE.Object3D();
  for(let i=0;i<n;i++){const a=i/n*PI*2;d.position.set(Math.cos(a)*R,1,Math.sin(a)*R);d.updateMatrix();im.setMatrixAt(i,d.matrix);d.position.y=2.1;d.updateMatrix();tips.setMatrixAt(i,d.matrix)}W.add(im);W.add(tips);
  [.35,1.75].forEach(y=>rot(mesh(G('TorusGeometry',R,.04,4,180),ir,0,y,0,W),PI/2,0,0));
  for(const sx of[-1,1]){bx(1.2,4,1.2,stM,sx*3,2,R,W);sp(.45,stM,sx*3,4.4,R,W,10)}rot(mesh(G('TorusGeometry',3,.12,6,24,PI),ir,0,3.6,R,W),0,0,0)}
 for(let i=0;i<40;i++){const a=rand(0,PI*2),r=rand(ARENA+8,ARENA+28);deadTree(W,Math.cos(a)*r,Math.sin(a)*r,rand(1.2,2));OBST.pop()}
 for(let i=0;i<10;i++){const m=sp(.09,B(0x9fffe0),rand(-40,40),rand(1,3),rand(-40,40),W,6);const gg=glow(0x6fffd0,1.2);m.add(gg);WISPS.push({m,ph:rand(0,9),bx:m.position.x,bz:m.position.z})}
}
function mapCastillo(W){
 const brick=LT(tex('brick','#4a4446','#221e20',3,2)),brickT=LT(tex('brick','#4a4446','#221e20',2,5)),stM=LT(tex('stone','#5a5658','#353133')),roof=LT(tex('tiles','#5a1418','#2a080a',3,3));
 rot(flat(mesh(G('CircleGeometry',ARENA+2,64),LT(tex('tiles','#3c383a','#1c191a',26)),0,.02,0,W)),-PI/2,0,0);
 const N=30,R=ARENA+2.5;
 for(let i=0;i<N;i++){const a=i/N*PI*2,seg=bx(2*PI*R/N+.5,8,2.4,brick,Math.cos(a)*R,4,Math.sin(a)*R,W);seg.rotation.y=-a+PI/2}
 {const n=N*5,im=new THREE.InstancedMesh(G('BoxGeometry',.9,1.1,2.4),stM,n),d=new THREE.Object3D();for(let i=0;i<n;i++){const a=i/n*PI*2;d.position.set(Math.cos(a)*R,8.55,Math.sin(a)*R);d.rotation.y=-a+PI/2;d.updateMatrix();im.setMatrixAt(i,d.matrix)}W.add(im)}
 for(let i=0;i<8;i++){const a=i/8*PI*2+PI/8;if(Math.abs(a-PI*1.5)<.5)continue;const x=Math.cos(a)*(R+.5),z=Math.sin(a)*(R+.5);
  cy(3.4,3.9,16,brickT,x,8,z,W,18);cy(3.9,3.9,.6,stM,x,16.3,z,W,18);cn(4.4,8,roof,x,20.6,z,W,18);
  for(let k=0;k<3;k++){const wa=Math.atan2(-z,-x)+(k-1)*.5,wx=x+Math.cos(wa)*3.45,wz=z+Math.sin(wa)*3.45;const w=bx(.7,1.4,.2,GL(0xffa040),wx,10+k%2*2.5,wz,W);w.rotation.y=-wa+PI/2;const gg=glow(0xff9a3a,2.4);gg.position.set(wx,10+k%2*2.5,wz);W.add(gg)}
  const flag=bx(.05,1,1.6,L(0x7a0a14),x,25.2,z+.8,W);cy(.04,.04,2.6,L(0x222222),x,25,z,W,5);obst(x*.92,z*.92,2.6)}
 // keep
 {const g=new THREE.Group(),zf=-(ARENA-6);g.position.z=zf;
  bx(32,24,14,brickT,0,12,-7,g);bx(34,1,15,stM,0,24.5,-7,g);for(let i=-8;i<=8;i++)bx(1,1.4,14.5,stM,i*2,25.6,-7,g);
  bx(5.5,7.5,.3,B(0x040304),0,3.75,.05,g);rot(mesh(G('CylinderGeometry',2.75,2.75,.3,24,1,false,0,PI),B(0x040304),0,7.5,.05,g),PI/2,0,PI/2);
  const iron=L(0x1a1a1c,{metalness:.8,roughness:.4});for(let b=-5;b<=5;b++)bx(.08,7,.08,iron,b*.48,3.8,.25,g);for(let b=0;b<6;b++)bx(5.2,.08,.08,iron,0,.8+b*1.2,.25,g);
  for(const sx of[-1,1]){for(let r=0;r<2;r++)for(let c=0;c<3;c++){const wx=sx*(6+c*3.5),wy=8+r*7;const w=bx(1.3,3.6,.2,GL(0xa8101a),wx,wy,.02,g);rot(cn(.65,1,GL(0xa8101a),wx,wy+2.2,.02,g,3),0,0,0).scale.z=.2;const gg=glow(0xff2030,4);gg.position.set(wx,wy,.6);g.add(gg)}
   cy(4,4.4,34,brickT,sx*17,17,-2,g,18);cn(5,12,roof,sx*17,40,-2,g,18);flame(g,sx*3.6,4,1,.6,true)}
  bx(10,.5,3,stM,0,.25,2,g);bx(8,.5,2,stM,0,.75,1.6,g);
  W.add(g);for(let x=-16;x<=16;x+=2.4)obst(x,zf-1,1.6)}
 // blood fountain
 {const g=new THREE.Group();cy(3.2,3.5,.9,stM,0,.45,0,g,24);flat(cy(2.8,2.8,.92,L(0x6a0008,{emissive:0x2a0004,roughness:.15,metalness:.2}),0,.47,0,g,24));cy(.5,.7,2.4,stM,0,1.2,0,g,12);cy(1.3,.3,.4,stM,0,2.5,0,g,16);
  flat(cy(1.1,1.1,.2,L(0x8a000c,{emissive:0x3a0006,roughness:.1}),0,2.66,0,g,16));const bat=B_.gargola(.8);bat.g.position.y=2.6;g.add(bat.g);const gg=glow(0xff1020,5,true,.5);gg.position.y=1;g.add(gg);W.add(g);obst(0,0,3.4)}
 for(let i=0;i<14*DQ();i++){const p=place(1.1,8);if(p)coffin(W,p[0],p[1],Math.random()<.35)}
 for(let i=0;i<18;i++){const a=i/18*PI*2,x=Math.cos(a)*(ARENA-.2),z=Math.sin(a)*(ARENA-.2);if(z<-(ARENA-9))continue;bx(.12,.6,.12,L(0x2a2a2a),x,3.5,z,W);flame(W,x,3.8,z,.45,true)}
 [[-15,-15],[15,-15],[-15,15],[15,15]].forEach(([x,z])=>{bx(1.6,1.6,1.6,stM,x,.8,z,W);const gg=B_.gargola(1.2);gg.g.position.set(x,1.6,z);gg.g.rotation.y=Math.atan2(-x,-z);W.add(gg.g);obst(x,z,1.2)});
 for(let i=0;i<6;i++){const p=place(.6,10);if(!p)break;const [x,z]=p,ir=L(0x1a1a1c,{metalness:.8,roughness:.4});cy(.06,.2,2.6,ir,x,1.3,z,W,6);cy(.6,.6,.06,ir,x,2.6,z,W,10);[-1,0,1].forEach(k=>{cy(.05,.05,.3,L(0xe8e0cc),x+k*.45,2.8,z,W,6);flame(W,x+k*.45,2.95,z,.18,false)});obst(x,z,.5)}
 for(let i=0;i<12*DQ();i++){const p=place(.8);if(!p)break;const [x,z]=p;for(let j=0;j<5;j++)sp(rand(.25,.45),L(0x1a1a14),x+rand(-.5,.5),rand(.25,.5),z+rand(-.5,.5),W,7);for(let j=0;j<4;j++)sp(.08,L(0x8a0a14,{emissive:0x2a0004}),x+rand(-.5,.5),rand(.5,.8),z+rand(-.5,.5),W,6);obst(x,z,.7)}
 for(let i=0;i<10;i++){const a=i/10*PI*2+.2,x=Math.cos(a)*(ARENA-.3),z=Math.sin(a)*(ARENA-.3);if(z<-(ARENA-9))continue;const b=bx(2,4.5,.08,L(0x6a0a14),x,5,z,W);b.rotation.y=-a+PI/2;const t=bx(2.1,.15,.1,L(0xd9a640,{metalness:.8,roughness:.3}),x,7.2,z,W);t.rotation.y=-a+PI/2}
 for(let i=0;i<18;i++){const b=B_.murcielago(rand(1,1.6));W.add(b.g);BATS.push({b,cx:rand(-30,30),cz:rand(-40,10),r:rand(6,16),h:rand(10,22),sp:rand(.4,.9)*(Math.random()<.5?1:-1),ph:rand(0,9)})}
}
function mapOlimpo(W){
 const mt=LT(tex('marble','#e8e2d6','#b0a694',1,2)),mt2=LT(tex('marble','#ded6c6','#a89e8c')),capM=LT(tex('marble','#f0eadc','#c0b6a4'));
 rot(flat(mesh(G('CircleGeometry',18,48),LT(tex('tiles','#bdb4a4','#857b6a',12)),0,.03,0,W)),-PI/2,0,0);rot(mesh(G('TorusGeometry',18,.3,6,64),mt2,0,.1,0,W),PI/2,0,0);
 {const g=new THREE.Group();g.position.z=-40;
  [[30,20],[28,18],[26,16]].forEach(([w,d],i)=>bx(w,.6,d,mt2,0,.3+i*.6,0,g));
  const colAt=(x,z)=>{const broken=Math.random()<.2,h=broken?rand(2,5):8.5;cy(.72,.8,h,mt,x,1.8+h/2,z,g,18);bx(1.8,.35,1.8,capM,x,1.98,z,g);if(!broken)bx(1.9,.45,1.9,capM,x,1.8+h+.22,z,g);else for(let k=0;k<2;k++)rot(cy(.72,.72,1.2,mt,x+rand(-3,3),.7,z+rand(3,5),g,16),PI/2,rand(0,3),0)};
  for(let i=0;i<8;i++){colAt(-10.5+i*3,7);colAt(-10.5+i*3,-7)}for(let i=1;i<4;i++){colAt(-10.5,-7+i*3.5);colAt(10.5,-7+i*3.5)}
  bx(23.5,1.3,1.9,capM,0,11.2,7,g);bx(23.5,1.3,1.9,capM,0,11.2,-7,g);bx(1.9,1.3,14,capM,-10.5,11.2,0,g);
  const tri=rot(mesh(G('CylinderGeometry',1,1,1.8,3),mt2,0,13.3,7,g),-PI/2,0,0);tri.scale.set(13.6,1,3);
  for(let i=0;i<6;i++)bx(3,.25,15,mt2,-8+i*3.5,12.1,0,g).rotation.z=rand(-.05,.05);
  W.add(g);statue(W,0,-40,'god',0xe6e0d4,2.2,0);
  for(let x=-13;x<=13;x+=3)for(let z=-47;z<=-33;z+=3)if(!(Math.abs(x)<2&&Math.abs(z+40)<2))obst(x,z,1.9)}
 for(let i=0;i<40;i++){const a=i/40*PI*2;const x=Math.cos(a)*(ARENA-.5),z=Math.sin(a)*(ARENA-.5);if(z<-(ARENA-14)&&Math.abs(x)<16)continue;const h=Math.random()<.5?rand(1.5,4):rand(6,8);cy(.6,.66,h,mt,x,h/2+.3,z,W,14);bx(1.5,.3,1.5,capM,x,.15,z,W);if(h>6)bx(1.6,.4,1.6,capM,x,h+.5,z,W)}
 for(let i=0;i<6;i++){const a=i/6*PI*2+PI/6;statue(W,Math.cos(a)*21,Math.sin(a)*21,'hoplite',0xe6e0d4,1.1)}
 for(let i=0;i<6;i++){const a=i/6*PI*2;const x=Math.cos(a)*13,z=Math.sin(a)*13,br=L(0xa8763a,{metalness:.8,roughness:.35});
  for(let k=0;k<3;k++){const la=k/3*PI*2;rot(cy(.04,.04,1.6,br,x+Math.cos(la)*.3,.75,z+Math.sin(la)*.3,W,5),Math.sin(la)*.3,0,-Math.cos(la)*.3)}
  cy(.6,.35,.4,br,x,1.6,z,W,14);flame(W,x,1.7,z,.75,true);obst(x,z,.6)}
 bx(3,1.1,1.6,mt2,0,.55,7,W);flame(W,0,1.15,7,.5,false);obst(0,7,1.4);
 for(let i=0;i<16*DQ();i++){const p=place(1.2,20);if(p)oliveTree(W,p[0],p[1])}
 for(let i=0;i<12*DQ();i++){const a=rand(0,PI*2),r=rand(ARENA-8,ARENA-3);if(Math.sin(a)*r<-(ARENA-16)&&Math.abs(Math.cos(a)*r)<16)continue;cypress(W,Math.cos(a)*r,Math.sin(a)*r)}
 for(let i=0;i<26*DQ();i++){const p=place(.4,10);if(p)amphora(W,p[0],p[1],rand(.9,1.4))}
 for(let i=0;i<20;i++){const p=place(.8,10);if(!p)break;rot(cy(.65,.65,rand(.8,1.4),mt,p[0],.62,p[1],W,14),PI/2,rand(0,6),0);obst(p[0],p[1],.8)}
 for(let i=0;i<30;i++){const a=rand(0,PI*2),r=rand(ARENA+10,ARENA+40);cypress(W,Math.cos(a)*r,Math.sin(a)*r);OBST.pop()}
}
function mapEgipto(W){
 const sst=LT(tex('glyph','#b89868','#4a3418',1,2)),sst2=LT(tex('stone','#c2a274','#8a6a42')),pyr=LT(tex('brick','#c8a874','#8a6a42',10,10)),gold=L(0xd9a640,{metalness:.85,roughness:.3});
 rot(flat(mesh(G('CircleGeometry',13,40),LT(tex('tiles','#b89868','#7a5a32',8)),0,.03,0,W)),-PI/2,0,0);
 [[-90,-170,70,62],[30,-200,90,80],[170,-110,55,48]].forEach(([x,z,r,h])=>{rot(cn(r,h,pyr,x,h/2,z,W,4),0,PI/4,0);rot(cn(r*.06,h*.06,gold,x,h*.97,z,W,4),0,PI/4,0)});
 {const z=-(ARENA+3);rot(cn(20,17,pyr,0,8.5,z,W,4),0,PI/4,0);bx(3,4,1,B(0x050302),0,2,z+13.6,W);for(let x=-12;x<=12;x+=2.5)obst(x,-(ARENA-10),1.6)}
 {const g=new THREE.Group(),x=-(ARENA-10);g.position.set(x,0,0);g.rotation.y=PI/2;
  for(const sx of[-1,1]){const t=rot(cy(3.4,4.8,12,sst,sx*6,6,0,g,4),0,PI/4,0);t.scale.z=.45;cy(.12,.12,16,L(0x3a2a1a),sx*4,8,1.6,g,6);bx(.06,2.5,1.6,L(0x2a5aa8),sx*4,14.5,2.4,g)}
  bx(5,1.6,3.2,sst,0,9,0,g);bx(4,8,.2,B(0x050302),0,4,.2,g);W.add(g);for(let z=-9;z<=9;z+=2.5)obst(x,z,1.6);
  statue(W,x+5,-5,'god',0x15151a,1);statue(W,x+5,5,'god',0x15151a,1)}
 {const x0=ARENA-18;for(let i=0;i<5;i++)for(const sz of[-6,6]){const x=x0-i*0+(i-2)*0,z=sz,xx=x0+(i-2)*4.2;cy(1,1.15,7.5,sst,xx,3.75,z,W,16);rot(cn(1.5,1.4,L(0x3a7a5a),xx,8.2,z,W,12),PI,0,0);bx(2.4,.6,2.4,sst2,xx,9,z,W);obst(xx,z,1.3)}
  bx(19,1.2,2.6,sst2,x0,9.9,-6,W);bx(19,1.2,2.6,sst2,x0,9.9,6,W)}
 {const g=new THREE.Group(),z=ARENA-11;g.position.set(0,0,z);g.rotation.y=PI;
  bx(6,1.2,13,sst2,0,.6,0,g);bx(4,3.2,8,sst2,0,2.8,-1.5,g);for(const sx of[-1,1])bx(1.2,1,4,sst2,sx*1.3,1.7,4,g);
  bx(2.4,2.8,2.2,sst2,0,5,3,g);bx(1.8,1.8,.4,L(0xc2a274),0,5.3,4.2,g);
  for(let i=0;i<7;i++){bx(3.6,.3,2.4,i%2?L(0x2a4a9a):gold,0,6.3-i*.45,2.6,g)}bx(.6,1,.8,gold,0,7,3,g);
  W.add(g);for(let k=-6;k<=6;k+=2.4)obst(0,z+k,3)}
 for(let i=0;i<6;i++){const a=i/6*PI*2+PI/6,x=Math.cos(a)*20,z=Math.sin(a)*20;rot(cy(.6,1.05,10,sst,x,5,z,W,4),0,PI/4,0);rot(cn(.85,1.2,gold,x,10.6,z,W,4),0,PI/4,0);bx(2.4,.6,2.4,sst2,x,.3,z,W);obst(x,z,1.3)}
 for(let i=0;i<9*DQ();i++){const p=place(1.2,10);if(!p)break;const [x,z]=p,g=new THREE.Group();bx(1,.9,2.3,gold,0,.45,0,g);bx(1.04,.12,2.34,L(0x2a4a9a),0,.6,0,g);sp(.32,gold,0,1,.75,g,10).scale.set(1,1.2,.6);bx(.6,.2,1.2,L(0x2a4a9a),0,.95,-.3,g);g.position.set(x,0,z);g.rotation.y=rand(0,6);W.add(g);obst(x,z,1.2)}
 {const ox=-26,oz=26;flat(rot(mesh(G('CircleGeometry',6,32),L(0x1a4a5a,{roughness:.1,metalness:.4,emissive:0x02080a}),ox,.05,oz,W),-PI/2,0,0));
  for(let i=0;i<12;i++){const a=i/12*PI*2;palm(W,ox+Math.cos(a)*rand(7,9),oz+Math.sin(a)*rand(7,9),rand(.9,1.2))}
  for(let i=0;i<40;i++){const a=rand(0,PI*2),r=rand(5.5,6.5);cy(.02,.03,rand(.8,1.5),L(0x4a6a2a),ox+Math.cos(a)*r,.5,oz+Math.sin(a)*r,W,4)}}
 for(let i=0;i<8;i++){const p=place(.9,12);if(p)palm(W,p[0],p[1])}
 for(let i=0;i<6;i++){const p=place(2.2,14);if(!p)break;const [x,z]=p,w=bx(rand(4,7),rand(2,4.5),1,sst,x,1.5,z,W);w.rotation.y=rand(0,3);obst(x,z,2)}
 for(let i=0;i<8;i++){const a=i/8*PI*2,x=Math.cos(a)*10,z=Math.sin(a)*10;cy(.1,.12,2.4,L(0x3a2a1a),x,1.2,z,W,6);cy(.35,.2,.3,gold,x,2.5,z,W,10);flame(W,x,2.6,z,.55,true);obst(x,z,.4)}
 for(let i=0;i<22*DQ();i++){const p=place(.4,10);if(p)amphora(W,p[0],p[1],rand(.7,1.1))}
}
function mapLlanos(W){
 const wd=LT(tex('wood','#5a4430','#2a1e14')),adobe=LT(tex('dirt','#a88a6a','#6a5038',2)),thatch=LT(tex('thatch','#8a7440','#4a3a1c',3));
 rot(flat(mesh(G('CircleGeometry',9,36),LT(tex('dirt','#4a3a2a','#2a2018',4)),0,.03,0,W)),-PI/2,0,0);
 {const g=new THREE.Group();for(let i=0;i<6;i++){const a=i/6*PI;rot(cy(.14,.16,2.2,wd,0,.25,0,g,7),PI/2,a,0)}flame(g,0,.2,0,2.2,true);const ring=rot(mesh(G('TorusGeometry',1.2,.25,6,16),LT(tex('stone','#5a5650','#2a2620')),0,.15,0,g),PI/2,0,0);W.add(g);obst(0,0,1.4);
  for(let i=0;i<5;i++){const a=i/5*PI*2+.3;rot(cy(.28,.28,2,wd,Math.cos(a)*4.5,.28,Math.sin(a)*4.5,W,8),0,-a,PI/2);obst(Math.cos(a)*4.5,Math.sin(a)*4.5,.6)}}
 {const g=new THREE.Group();g.rotation.y=.25;const water=rot(flat(mesh(G('PlaneGeometry',ARENA*2.4,7),L(0x16323e,{roughness:.08,metalness:.5,emissive:0x02080a}),0,.06,24,g)),-PI/2,0,0);
  for(let i=0;i<80*DQ();i++){const x=rand(-ARENA,ARENA),z=24+(Math.random()<.5?-1:1)*rand(3.3,4.5);cy(.02,.03,rand(.8,1.6),L(0x4a6a2a),x,.6,z,g,4)}W.add(g)}
 [[-30,-28],[30,-30],[-36,8]].forEach(([x,z])=>{const g=new THREE.Group();bx(7,3,5,adobe,0,1.5,0,g);rot(cn(5.8,3.4,thatch,0,4.7,0,g,4),0,PI/4,0);
  for(const sx of[-1,1])cy(.12,.12,2.8,wd,sx*3,1.4,3.6,g,6);bx(7,.12,1.4,thatch,0,2.9,3.1,g).rotation.x=-.2;bx(1.2,2.2,.1,B(0x0a0705),0,1.1,2.52,g);
  const w=bx(1,.8,.1,GL(0xffb050),2,1.7,2.52,g);const gg=glow(0xffa040,2.5);gg.position.set(2,1.7,2.8);g.add(gg);flame(g,-2.4,1.8,2.7,.35,true);
  rot(mesh(G('TorusGeometry',1.4,.06,4,12,PI),L(0xb83a2a),-1.5,1.6,3.6,g),0,0,PI);
  g.position.set(x,0,z);g.rotation.y=Math.atan2(-x,-z);W.add(g);obst(x,z,4)});
 {const cx=30,cz=6,r=7,n=24;for(let i=0;i<n;i++){const a=i/n*PI*2;if(i===0)continue;cy(.1,.12,1.6,wd,cx+Math.cos(a)*r,.8,cz+Math.sin(a)*r,W,6);obst(cx+Math.cos(a)*r,cz+Math.sin(a)*r,.3)}
  [.6,1.2].forEach(y=>rot(mesh(G('TorusGeometry',r,.05,4,48,PI*2-.3),wd,cx,y,cz,W),PI/2,0,.15))}
 [[-18,-42],[40,-12],[-45,-12],[18,40],[-22,42]].forEach(([x,z])=>ceiba(W,x,z));
 for(let i=0;i<12*DQ();i++){const p=place(.9,12);if(p)palm(W,p[0],p[1],rand(1,1.3))}
 for(let i=0;i<7;i++){const p=place(.5,10);if(!p)break;const [x,z]=p;cy(.08,.1,1.6,wd,x,.8,z,W,6);const sk=bx(.35,.3,.5,L(0xe8e0cc),x,1.7,z+.1,W);[-1,1].forEach(d=>rot(cn(.05,.5,L(0xe8e0cc),x+d*.3,1.85,z+.1,W,6),0,0,-d*1.2));obst(x,z,.4)}
 {const n=Math.round((HIGH?2400:700)),im=new THREE.InstancedMesh(G('BoxGeometry',.05,.7,.02),L(0xffffff),n),d=new THREE.Object3D(),c=new THREE.Color();let k=0;
  for(let i=0;i<n*3&&k<n;i++){const x=rand(-ARENA,ARENA),z=rand(-ARENA,ARENA);if(Math.hypot(x,z)<10||Math.hypot(x,z)>ARENA-1)continue;d.position.set(x,.3,z);d.rotation.set(rand(-.3,.3),rand(0,3),rand(-.3,.3));d.scale.y=rand(.6,1.5);d.updateMatrix();im.setMatrixAt(k,d.matrix);c.setHSL(rand(.2,.28),.45,rand(.12,.22));im.setColorAt(k,c);k++}
  im.count=k;im.userData.noCast=true;W.add(im)}
 {const R=ARENA+1,n=Math.floor(PI*2*R/3.5),im=new THREE.InstancedMesh(G('CylinderGeometry',.08,.1,1.6,5),wd,n),d=new THREE.Object3D();for(let i=0;i<n;i++){const a=i/n*PI*2;d.position.set(Math.cos(a)*R,.8,Math.sin(a)*R);d.updateMatrix();im.setMatrixAt(i,d.matrix)}W.add(im);
  [.5,.95,1.4].forEach(y=>rot(mesh(G('TorusGeometry',R,.015,3,180),L(0x6a6a6a,{metalness:.8,roughness:.4}),0,y,0,W),PI/2,0,0))}
 for(let i=0;i<30;i++){const a=rand(0,PI*2),r=rand(ARENA+12,ARENA+40);palm(W,Math.cos(a)*r,Math.sin(a)*r,rand(1,1.6));OBST.pop()}
}

