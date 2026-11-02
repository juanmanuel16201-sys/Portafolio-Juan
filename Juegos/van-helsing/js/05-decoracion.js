/* Van Helsing · Árboles, estatuas, columnas, ánforas y ataúdes */
/* ---------- decor pieces ---------- */
function deadTree(W,x,z,s=1,col=0x231b16){const g=new THREE.Group(),bark=LT(tex('wood','#2a201a','#120c08'),{color:col===0x231b16?0xffffff:col}),h=rand(4,7)*s;cy(.16*s,.36*s,h,bark,0,h/2,0,g,7);
 for(let b=0;b<6;b++){const len=rand(1.2,2.8)*s,a=rand(0,PI*2),tl=rand(.6,1.25),yy=h*rand(.45,.95);const br=cy(.04*s,.12*s,len,bark,0,0,0,g,5);br.rotation.set(0,a,tl);br.position.set(-Math.cos(a)*Math.sin(tl)*len*.45,yy+Math.cos(tl)*len*.45,Math.sin(a)*Math.sin(tl)*len*.45);
  const tw=cy(.02*s,.04*s,len*.5,bark,0,0,0,g,4);tw.rotation.set(0,a+.6,tl+.5);tw.position.set(br.position.x*1.7,br.position.y+len*.3,br.position.z*1.7)}
 g.position.set(x,0,z);g.rotation.y=rand(0,6);W.add(g);obst(x,z,.5*s)}
function oliveTree(W,x,z){const g=new THREE.Group(),bark=LT(tex('wood','#5a4a3a','#2a2018'));const t1=rot(cy(.18,.3,2.2,bark,0,1.1,0,g,7),0,0,.25),t2=rot(cy(.14,.2,1.8,bark,.45,2.6,0,g,7),0,0,-.35);
 const lf=[L(0x6a7a4a),L(0x5a6a3e),L(0x7a8a5a)];for(let i=0;i<7;i++){const m=sp(rand(.8,1.3),pick(lf),rand(-1.2,1.4),rand(3,4.2),rand(-1.2,1.2),g,9);m.scale.y=.7}
 g.position.set(x,0,z);g.rotation.y=rand(0,6);W.add(g);obst(x,z,.5)}
function cypress(W,x,z){const h=rand(7,11);cy(.15,.2,1.2,L(0x3a2a1e),x,.6,z,W,6);const c=cn(1.1,h,L(0x1e3220),x,h/2+.8,z,W,9);obst(x,z,.6)}
function palm(W,x,z,s=1){const g=new THREE.Group(),bark=LT(tex('wood','#7a6448','#3a2a1a'));let px=0,py=0,lean=rand(.05,.2);
 for(let i=0;i<7;i++){const seg=cy(.17*s,.21*s,1.1*s,bark,px,py+.55*s,0,g,7);seg.rotation.z=-lean*i*.4;px+=Math.sin(lean*i*.4)*1.1*s;py+=Math.cos(lean*i*.4)*1.05*s}
 const top=new THREE.Group();top.position.set(px,py,0);g.add(top);sp(.25*s,L(0x5a3a1e),0,0,0,top,8);
 for(let i=0;i<9;i++){const a=i/9*PI*2,f=new THREE.Group();f.rotation.y=a;top.add(f);const leaf=bx(.5*s,.04*s,2.6*s,L(i%2?0x3a6a2a:0x2e5a22),0,0,1.25*s,f);leaf.rotation.x=.45;f.rotation.z=0}
 g.position.set(x,0,z);g.rotation.y=rand(0,6);W.add(g);obst(x,z,.45)}
function ceiba(W,x,z){const g=new THREE.Group(),bark=LT(tex('wood','#6a6458','#3a3428'));cy(1,1.6,10,bark,0,5,0,g,12);
 for(let i=0;i<6;i++){const a=i/6*PI*2+.3,b=bx(.25,1.6,2.4,bark,Math.cos(a)*1.4,.8,Math.sin(a)*1.4,g);b.rotation.y=-a}
 for(let i=0;i<5;i++){const a=i/5*PI*2,br=cy(.25,.45,5,bark,Math.cos(a)*2,10.5,Math.sin(a)*2,g,7);br.rotation.set(0,-a,1.05);br.rotation.order='YXZ'}
 const lf=[L(0x1f3a1c),L(0x284a22),L(0x1a3218)];for(let i=0;i<9;i++){const a=rand(0,PI*2),r=rand(0,5.5);const m=sp(rand(2.4,3.6),pick(lf),Math.cos(a)*r,rand(11.5,13),Math.sin(a)*r,g,10);m.scale.y=.45}
 g.position.set(x,0,z);W.add(g);obst(x,z,1.9)}
function statue(W,x,z,kind,col=0x8a8c92,s=1.1,ry){const g=new THREE.Group(),pm=LT(tex(col===0xe6e0d4?'marble':'stone',col===0xe6e0d4?'#e6e0d4':'#7a7c82',col===0xe6e0d4?'#b8ae9c':'#55575d'));
 bx(1.4*s,1.2*s,1.4*s,pm,0,.6*s,0,g);bx(1.6*s,.2*s,1.6*s,pm,0,1.25*s,0,g);
 const h=humanoid({s,skin:col,top:col,bottom:col,arm:col,boots:col,belt:col,hair:col,face:false});h.g.position.y=1.35*s;g.add(h.g);const m=L(col);
 if(kind==='angel'){[-1,1].forEach(d=>{const w=rot(bx(.8*s,1.1*s,.06*s,m,d*.45*s,1.45*s,-.22*s,h.g),0,d*.4,d*.3)});h.armL.rotation.x=h.armR.rotation.x=-2.6;h.armL.rotation.z=.2;h.armR.rotation.z=-.2;h.head.rotation.x=-.3}
 else if(kind==='hoplite'){cy(.18*s,.18*s,.2*s,m,0,1.72*s,0,h.g,10);bx(.04*s,.24*s,.4*s,m,0,1.9*s,0,h.g);rot(cy(.32*s,.32*s,.05*s,m,0,-.35*s,.12*s,h.armL,16),PI/2,0,0);h.armL.rotation.x=-.5;h.armR.rotation.x=-2.4;cy(.025*s,.025*s,2.2*s,m,0,-.4*s,0,h.armR,6)}
 else if(kind==='god'){bx(.5*s,1.2*s,.35*s,m,0,.5*s,0,h.g);h.armR.rotation.x=-2.7;const bolt=new THREE.Group();bolt.position.set(0,-.8*s,0);h.armR.add(bolt);[0,1,2].forEach(i=>rot(bx(.07*s,.45*s,.07*s,GL(0xffd23a),(i%2?.08:-.08)*s,-i*.38*s,0,bolt),0,0,i%2?.5:-.5));const gl=glow(0xffd23a,3*s);gl.position.set(0,-.6*s,0);bolt.add(gl)}
 else if(kind==='lion'){h.g.visible=false;bx(1.1*s,.8*s,2*s,m,0,1.75*s,0,g);sp(.5*s,m,0,2.35*s,.95*s,g,10);bx(.25*s,.7*s,.3*s,m,-.35*s,1.6*s,.7*s,g);bx(.25*s,.7*s,.3*s,m,.35*s,1.6*s,.7*s,g)}
 g.position.set(x,0,z);g.rotation.y=ry!==undefined?ry:Math.atan2(-x,-z);W.add(g);obst(x,z,1*s)}
function column(W,x,z,h,r,mt,capM){cy(r,r*1.08,h,mt,x,h/2+.3,z,W,16);bx(r*2.5,.3,r*2.5,capM||mt,x,.15,z,W);if(h>3)bx(r*2.6,.4,r*2.6,capM||mt,x,h+.5,z,W);obst(x,z,r+.25)}
function amphora(W,x,z,s=1){const pts=[[0,0],[.16,0],[.26,.12],[.32,.38],[.28,.64],[.14,.8],[.09,.95],[.15,1]].map(([a,b])=>new THREE.Vector2(a*s,b*s));
 const m=mesh(G('LatheGeometry',pts,14),L(0xb0603a),x,0,z,W);cy(.325*s,.325*s,.08*s,L(0x1a120c),x,.42*s,z,W,14);
 [-1,1].forEach(d=>rot(mesh(G('TorusGeometry',.1*s,.025*s,5,10,PI),L(0xb0603a),x+d*.15*s,.78*s,z,W),0,0,d*PI/2));m.rotation.y=rand(0,6);obst(x,z,.35*s)}
function coffin(W,x,z,open){const g=new THREE.Group(),w=LT(tex('wood','#3a2418','#1a0e08'));bx(.9,.5,2.1,w,0,.25,0,g);if(open){bx(.75,.05,1.95,L(0x7a0a14),0,.48,0,g);rot(bx(.95,.08,2.15,w,.6,.55,0,g),0,0,-.9)}else{bx(.95,.08,2.15,w,0,.54,0,g);bx(.08,.02,.7,L(0xd9a640,{metalness:.8,roughness:.3}),0,.59,.2,g);bx(.4,.02,.08,L(0xd9a640,{metalness:.8,roughness:.3}),0,.59,.35,g)}
 g.position.set(x,0,z);g.rotation.y=rand(0,6);W.add(g);obst(x,z,.95)}

