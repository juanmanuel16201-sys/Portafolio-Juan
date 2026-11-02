/* Van Helsing · Cuerpo humano, animación y modelos de los monstruos */
/* ---------- characters ---------- */
function humanoid(o){const s=o.s||1,w=o.w||1,g=new THREE.Group(),skin=L(o.skin),top=L(o.top),bot=L(o.bottom),armM=L(o.arm||o.top),boot=L(o.boots||0x1a1612);
 const pel=cy(.2*s*w,.17*s*w,.2*s,bot,0,.93*s,0,g,12);pel.scale.z=.72;
 const leg=x=>{const p=new THREE.Group();p.position.set(x*s*w,.9*s,0);g.add(p);if(o.noLegs)return p;
  cy(.095*s*w,.072*s*w,.44*s,bot,0,-.22*s,0,p,10);const k=new THREE.Group();k.position.y=-.44*s;p.add(k);sp(.074*s*w,bot,0,0,0,k,8);
  cy(.07*s*w,.052*s*w,.34*s,bot,0,-.17*s,0,k,10);cy(.068*s*w,.074*s*w,.13*s,boot,0,-.34*s,0,k,10);bx(.14*s*w,.08*s,.25*s,boot,0,-.42*s,.045*s,k);p.knee=k;return p};
 const legL=leg(-.11),legR=leg(.11);
 const prof=[[0,0],[.17,0],[.19,.1],[.245,.32],[.26,.43],[.215,.53],[.1,.58],[0,.58]].map(([a,b])=>new THREE.Vector2(a*s*w,b*s));
 const torso=mesh(G('LatheGeometry',prof,16),top,0,.9*s,0,g);torso.scale.z=.64;
 const belt=cy(.198*s*w,.198*s*w,.07*s,L(o.belt||0x2a1e14),0,.94*s,0,g,14);belt.scale.z=.74;
 cy(.058*s,.068*s,.13*s,skin,0,1.52*s,0,g,10);
 const head=sp(.16*s,skin,0,1.665*s,0,g,18);head.scale.set(.93,1.07,1);
 if(o.face!==false){const nose=rot(cn(.026,.075,skin,0,-.015,.158,head,6),PI/2,0,0);
  [-1,1].forEach(d=>{const ear=sp(.04,skin,d*.165,0,-.005,head,7);ear.scale.set(.45,1,.75);bx(.065,.014,.02,L(o.hair||0x2a1a12),d*.055,.055,.142,head).rotation.z=d*-.12});
  bx(.055,.01,.01,L(0x4a2018),0,-.085,.15,head);
  if(o.eyes){[-1,1].forEach(d=>{sp(.022,L(0x9a948a),d*.055,.02,.138,head,8);sp(.012,B(o.eyes),d*.055,.02,.158,head,6)})}}
 const arm=x=>{const p=new THREE.Group();p.position.set(x*s*w,1.42*s,0);g.add(p);sp(.088*s*w,armM,0,0,0,p,10);cy(.068*s*w,.058*s*w,.32*s,armM,0,-.17*s,0,p,10);
  const e=new THREE.Group();e.position.y=-.33*s;p.add(e);sp(.058*s*w,armM,0,0,0,e,8);cy(.058*s*w,.047*s*w,.27*s,armM,0,-.15*s,0,e,10);
  bx(.075*s,.1*s,.045*s,skin,0,-.335*s,0,e);bx(.024*s,.05*s,.03*s,skin,-x/Math.abs(x)*.045*s,-.31*s,.02*s,e);p.elbow=e;return p};
 return{g,legL,legR,armL:arm(-.33),armR:arm(.33),head,torso,s,baseL:0,baseR:0}}
function walk(h,t,a){const v=Math.sin(t)*a;h.legL.rotation.x=v;h.legR.rotation.x=-v;
 if(h.legL.knee){h.legL.knee.rotation.x=Math.max(0,Math.sin(t-1.3))*a*1.4;h.legR.knee.rotation.x=Math.max(0,Math.sin(t-1.3+PI))*a*1.4}
 h.armL.rotation.x=h.baseL-v*.8;h.armR.rotation.x=h.baseR+v*.8;if(h.torso)h.torso.rotation.y=v*.12}
function eyes(p,c,r,y,z,dx){sp(r,GL(c),-dx,y,z,p,6);sp(r,GL(c),dx,y,z,p,6)}
function quadLegs(g,S,pts,y,len,w,mat){return pts.map(([x,z])=>{const p=new THREE.Group();p.position.set(x*S,y*S,z*S);g.add(p);cy(w*S,w*.7*S,len*S,mat,0,-len*S/2,0,p,7);return p})}
function gallop(l,t,a){const v=Math.sin(t)*a;l[0].rotation.x=v;l[3].rotation.x=v;l[1].rotation.x=-v;l[2].rotation.x=-v}
function vampLike(s,drac){const S=(drac?1.12:1)*s,g=new THREE.Group(),h=humanoid({s:S,skin:drac?0xc9bfc6:0xbdb4ba,top:0x14141a,bottom:0x111116,arm:0x14141a,boots:0x0a0a0c,belt:0x2a0a10});g.add(h.g);
 bx(.22*S,.42*S,.03*S,L(0x7a0a14),0,1.2*S,.165*S,h.g);bx(.11*S,.14*S,.03*S,L(0xcdc8c0),0,1.4*S,.17*S,h.g);
 const hair=sp(.173*S,L(0x0c0c10),0,1.68*S,-.025*S,h.g,14);hair.scale.set(1,.72,1.05);rot(cn(.05*S,.1*S,L(0x0c0c10),0,1.76*S,.15*S,h.g,4),PI+.3,0,0);
 eyes(h.g,0xff1a1a,.028*S,1.65*S,.15*S,.06*S);[-1,1].forEach(d=>rot(cn(.012*S,.05*S,B(0xffffff),d*.03*S,1.56*S,.15*S,h.g,4),PI,0,0));
 const cape=new THREE.Group();cape.position.set(0,1.46*S,-.13*S);h.g.add(cape);const cw=drac?1.15:.75,ch=drac?1.45:1.25;
 bx(cw*S,ch*S,.03*S,L(0x0e0e12),0,-ch*S/2,-.02*S,cape);bx(cw*.94*S,ch*.96*S,.02*S,L(0x8a0a18),0,-ch*S/2,.01*S,cape);
 [-1,1].forEach(d=>rot(bx(.32*S,(drac?.55:.35)*S,.03*S,L(0x0e0e12),d*.2*S,.18*S,.02*S,cape),-.25,d*.6,d*.25));
 [-1,1].forEach(d=>{const cl=bx(.2*S,(drac?.42:.3)*S,.02*S,L(0x0e0e12),d*.13*S,1.62*S,-.1*S,h.g);cl.rotation.set(-.15,d*-.5,d*-.18);bx(.18*S,(drac?.38:.26)*S,.015*S,L(0x8a0a18),d*.125*S,1.62*S,-.088*S,h.g).rotation.set(-.15,d*-.5,d*-.18)});
 if(drac){rot(cy(.06*S,.06*S,.015*S,L(0xe8b84a,{metalness:.9,roughness:.3}),0,1.32*S,.18*S,h.g,14),PI/2,0,0);cn(.18*S,.5*S,L(0x0e0e12),0,1.95*S,-.05*S,h.g,6).visible=false;const gg=glow(0xff1a2a,.9*S,true,.35);gg.position.set(0,1.65*S,.2*S);h.g.add(gg)}
 return{g,anim:(t,m)=>{walk(h,t*6,m?.5:.04);cape.rotation.x=-.08-(m?.28:0)+Math.sin(t*3)*.06}}}
function skeletonB(s,greek){const g=new THREE.Group(),bone=L(0xe6dcc4),S=s,h={g:new THREE.Group(),baseL:0,baseR:-.3};g.add(h.g);
 const leg=x=>{const p=new THREE.Group();p.position.set(x*.1*S,.86*S,0);h.g.add(p);cy(.035*S,.03*S,.42*S,bone,0,-.21*S,0,p,6);sp(.045*S,bone,0,-.43*S,0,p,6);cy(.03*S,.025*S,.4*S,bone,0,-.64*S,0,p,6);bx(.08*S,.05*S,.16*S,bone,0,-.85*S,.04*S,p);return p};
 h.legL=leg(-1);h.legR=leg(1);bx(.24*S,.1*S,.14*S,bone,0,.88*S,0,h.g);cy(.03*S,.03*S,.6*S,bone,0,1.18*S,-.04*S,h.g,6);
 for(let i=0;i<4;i++){const r=rot(mesh(G('TorusGeometry',(.15-i*.012)*S,.018*S,4,12,PI*1.6),bone,0,(1.04+i*.1)*S,0,h.g),PI/2,0,PI*.7);r.scale.y=.75}
 bx(.38*S,.05*S,.08*S,bone,0,1.42*S,0,h.g);sp(.15*S,bone,0,1.63*S,0,h.g,14);bx(.15*S,.06*S,.13*S,bone,0,1.5*S,.04*S,h.g);
 eyes(h.g,greek?0xffaa3a:0x6affff,.038*S,1.65*S,.12*S,.055*S);
 const arm=x=>{const p=new THREE.Group();p.position.set(x*.21*S,1.42*S,0);h.g.add(p);cy(.03*S,.025*S,.32*S,bone,0,-.16*S,0,p,6);cy(.025*S,.02*S,.3*S,bone,0,-.47*S,0,p,6);sp(.04*S,bone,0,-.64*S,0,p,6);return p};
 h.armL=arm(-1);h.armR=arm(1);const metal=L(0x9aa0a8,{metalness:.85,roughness:.35});bx(.04*S,.8*S,.08*S,metal,0,-1*S,.1*S,h.armR);bx(.2*S,.04*S,.05*S,metal,0,-.62*S,.1*S,h.armR);
 if(greek){const bronze=L(0xb5803a,{metalness:.8,roughness:.4});cy(.175*S,.17*S,.17*S,bronze,0,1.73*S,0,h.g,14);bx(.04*S,.22*S,.4*S,L(0xa01818),0,1.92*S,0,h.g);rot(cy(.3*S,.3*S,.04*S,bronze,0,-.35*S,.12*S,h.armL,18),PI/2,0,0);bx(.4*S,.35*S,.04*S,L(0x8a1414),0,1.1*S,-.12*S,h.g)}
 return{g,anim:(t,m)=>walk(h,t*7,m?.55:.04)}}

const B_={
fantasma(s){const g=new THREE.Group(),m=L(0xdfe9ff,{transparent:true,opacity:.6,emissive:0x2c3c5a,depthWrite:false}),dk=B(0x04060a);
 const body=cy(.28*s,.78*s,1.4*s,m,0,.9*s,0,g,16);sp(.46*s,m,0,1.75*s,0,g,16);
 for(let i=0;i<9;i++){const a=i/9*PI*2;rot(cn(.13*s,.4*s,m,Math.cos(a)*.66*s,.1*s,Math.sin(a)*.66*s,g,5),PI,0,0)}
 sp(.1*s,dk,-.16*s,1.83*s,.38*s,g,8);sp(.1*s,dk,.16*s,1.83*s,.38*s,g,8);const mo=sp(.11*s,dk,0,1.6*s,.41*s,g,8);mo.scale.y=1.8;
 const aL=rot(cy(.06*s,.13*s,.8*s,m,-.6*s,1.35*s,.15*s,g,7),0,0,1),aR=rot(cy(.06*s,.13*s,.8*s,m,.6*s,1.35*s,.15*s,g,7),0,0,-1);
 const gg=glow(0x8fb0ff,3*s,true,.35);gg.position.y=1.3*s;g.add(gg);
 return{g,anim:t=>{body.rotation.y=Math.sin(t*2)*.3;aL.rotation.x=Math.sin(t*3)*.5-.7;aR.rotation.x=Math.cos(t*3)*.5-.7}}},
espiritu(s){const g=new THREE.Group();sp(.2*s,B(0xd8fff4),0,.3*s,0,g,10);const h=glow(0x5fe0c0,1.8*s);h.position.y=.3*s;g.add(h);
 const tr=[];for(let i=1;i<5;i++)tr.push(sp(.14*s/i,B(0x7fe0c4,{transparent:true,opacity:.5,depthWrite:false}),0,.3*s,-.25*s*i,g,6));
 return{g,anim:t=>{h.scale.setScalar(1.8*s*(1+Math.sin(t*9)*.18));tr.forEach((m,i)=>m.position.x=Math.sin(t*6-i)*.15*s)}}},
demonio(s){const g=new THREE.Group(),S=1.3*s,h=humanoid({s:S,w:1.15,skin:0x9a2418,top:0x7a1a12,bottom:0x2a0b08,arm:0x8a1e14,boots:0x140604,belt:0x140604});g.add(h.g);
 [-1,1].forEach(d=>{{let px=d*.1*S,py=1.78*S,pz=0,ang=.35;for(let i=0;i<5;i++){const len=.12*S,r0=(.07-i*.013)*S,dir=new V3(d*Math.cos(ang),Math.sin(ang),-.3).normalize(),c=cy(Math.max(.005,r0*.7),r0,len,L(0x1a1410,{roughness:.4}),0,0,0,h.g,8);c.position.set(px+dir.x*len/2,py+dir.y*len/2,pz+dir.z*len/2);c.quaternion.setFromUnitVectors(new V3(0,1,0),dir);px+=dir.x*len;py+=dir.y*len;pz+=dir.z*len;ang+=.42}}sp(.1*S,L(0x9a2418),d*.09*S,1.3*S,.12*S,h.g,10).scale.set(1,.75,.55);rot(cn(.02*S,.12*S,L(0x1a1410),0,-.7*S,.05*S,d<0?h.armL:h.armR,4),PI,0,0)});
 eyes(h.g,0xffd23a,.04*S,1.65*S,.15*S,.07*S);for(let i=0;i<9;i++){const c=bx(.012*S,rand(.08,.22)*S,.012*S,GL(0xff6a1a),rand(-.16,.16)*S,rand(.98,1.38)*S,.165*S,h.g);c.rotation.z=rand(-.7,.7)}const lg=glow(0xff5a1a,.9*S,true,.3);lg.position.set(0,1.2*S,.2*S);h.g.add(lg);
 const wing=x=>{const p=new THREE.Group();p.position.set(x*.18*S,1.32*S,-.18*S);h.g.add(p);bx(1.1*S,.75*S,.03*S,L(0x2a0d0a),x*.55*S,.1*S,0,p);cy(.02*S,.02*S,1.2*S,L(0x1a0806),x*.55*S,.45*S,0,p,4).rotation.z=PI/2;return p};
 const wL=wing(-1),wR=wing(1);rot(cy(.03*S,.06*S,1*S,L(0x5a120c),0,.8*S,-.45*S,h.g,6),-1,0,0);
 return{g,anim:(t,m)=>{walk(h,t*7,m?.6:.05);wL.rotation.y=.5+Math.sin(t*5)*.4;wR.rotation.y=-.5-Math.sin(t*5)*.4}}},
bruja(s){const g=new THREE.Group(),w=new THREE.Group();g.add(w);const S=s;
 const b=new THREE.Group();b.position.y=.5*S;w.add(b);rot(cy(.035*S,.035*S,2*S,L(0x5a3a20),0,0,0,b,7),PI/2,0,0);rot(cn(.24*S,.6*S,LT(tex('thatch','#9a7a3a','#5a4420')),0,0,-1.15*S,b,9),PI/2,0,0);
 cn(.45*S,1*S,L(0x2b1838),0,.95*S,-.1*S,w,12);sp(.2*S,L(0x6fae4a),0,1.55*S,0,w,12);rot(cn(.05*S,.25*S,L(0x5e9a3c),0,1.52*S,.24*S,w,6),PI/2,0,0);
 eyes(w,0xfff35a,.035*S,1.6*S,.17*S,.07*S);cy(.4*S,.4*S,.03*S,L(0x14101a),0,1.7*S,0,w,16);rot(cn(.22*S,.7*S,L(0x14101a),0,2.05*S,-.06*S,w,12),-.25,0,0);bx(.38*S,.55*S,.1*S,L(0x4a4a52),0,1.38*S,-.16*S,w);for(let i=0;i<7;i++){const a=-1.2+i*.4,st=bx(.035*S,rand(.35,.55)*S,.03*S,L(0x8a8a90),Math.sin(a)*.19*S,1.36*S,Math.cos(a)*.1*S-.05*S,w);st.rotation.z=Math.sin(a)*.15}sp(.025*S,L(0x5e9a3c),.04*S,1.5*S,.22*S,w,6);
 rot(cy(.05*S,.05*S,.6*S,L(0x2b1838),-.25*S,1.15*S,.25*S,w,6),1.1,0,0);const aR=rot(cy(.05*S,.05*S,.6*S,L(0x2b1838),.25*S,1.15*S,.25*S,w,6),1.1,0,0);
 const gg=glow(0x8dff5a,.8*S);gg.position.set(.3*S,1.1*S,.55*S);w.add(gg);
 return{g,anim:t=>{w.rotation.z=Math.sin(t*2)*.12;w.rotation.x=Math.sin(t*1.3)*.08;aR.rotation.x=1.1+Math.sin(t*4)*.3}}},
chupacabras(s){const g=new THREE.Group(),S=s,c=L(0x4d5a3f),d=L(0x2a3324);
 bx(.55*S,.5*S,1.2*S,c,0,.78*S,0,g);bx(.38*S,.36*S,.48*S,L(0x56654a),0,.98*S,.8*S,g);eyes(g,0xff2a1a,.065*S,1.05*S,1.02*S,.11*S);
 [-1,1].forEach(k=>rot(cn(.03*S,.12*S,B(0xf2efe6),k*.07*S,.82*S,1*S,g,5),PI,0,0));
 for(let i=0;i<6;i++)cn(.07*S,.38*S,d,0,1.15*S,(.45-i*.2)*S,g,5);
 [-1,1].forEach(k=>rot(cn(.07*S,.25*S,d,k*.13*S,1.22*S,.72*S,g,5),0,0,-k*.4));
 const legs=quadLegs(g,S,[[-.2,.42],[.2,.42],[-.2,-.42],[.2,-.42]],.6,.6,.065,d);rot(cy(.02*S,.05*S,.7*S,d,0,.8*S,-.85*S,g,5),-1,0,0);
 return{g,anim:(t,m)=>gallop(legs,t*13,m?.75:.08)}},
nahual(s){const g=new THREE.Group(),S=s,c=L(0x2e2219),d=L(0x1a130e);
 bx(.55*S,.55*S,1.3*S,c,0,1*S,0,g);bx(.42*S,.42*S,.5*S,c,0,1.25*S,.82*S,g);bx(.22*S,.2*S,.38*S,d,0,1.15*S,1.18*S,g);eyes(g,0xff9a1a,.06*S,1.32*S,1.06*S,.12*S);
 [-1,1].forEach(k=>cn(.08*S,.28*S,d,k*.14*S,1.58*S,.72*S,g,4));for(let i=0;i<5;i++)rot(cn(.09*S,.32*S,d,0,1.32*S,(.55-i*.22)*S,g,4),-.4,0,0);
 const legs=quadLegs(g,S,[[-.2,.48],[.2,.48],[-.2,-.48],[.2,-.48]],.8,.8,.075,d);const tail=rot(cy(.04*S,.1*S,.8*S,c,0,1.1*S,-.9*S,g,6),-1.1,0,0);
 return{g,anim:(t,m)=>{gallop(legs,t*11,m?.8:.08);tail.rotation.z=Math.sin(t*6)*.4}}},
momia(s){const g=new THREE.Group(),h=humanoid({s,skin:0xcdbb90,top:0xbca97c,bottom:0xa8946a,arm:0xc4b183,boots:0xa8946a,belt:0xe6d8ae});g.add(h.g);h.baseL=h.baseR=-1.45;
 for(let i=0;i<6;i++){const b=rot(cy(.24*s,.24*s,.05*s,L(0xe6d8ae),0,(.9+i*.11)*s,0,h.g,10),0,0,rand(-.2,.2));b.scale.z=.7}
 rot(cy(.17*s,.17*s,.06*s,L(0xe6d8ae),0,1.66*s,0,h.g,12),0,0,.25);eyes(h.g,0x7dff6a,.035*s,1.62*s,.15*s,.06*s);
 for(let i=0;i<3;i++)bx(.04*s,rand(.3,.6)*s,.01*s,L(0xe6d8ae),rand(-.15,.15)*s,.75*s,.16*s,h.g);
 return{g,anim:(t,m)=>{walk(h,t*4,m?.35:.03);h.g.rotation.z=Math.sin(t*2)*.05}}},
llorona(s){const g=new THREE.Group(),w=new THREE.Group();g.add(w);const dm=L(0xe9eef5,{transparent:true,opacity:.8,emissive:0x1a2230});
 cn(.65*s,1.6*s,dm,0,.8*s,0,w,16);bx(.42*s,.5*s,.26*s,dm,0,1.4*s,0,w);sp(.17*s,L(0xd5dbe6),0,1.78*s,0,w,12);bx(.42*s,1.1*s,.12*s,L(0x0c0c10),0,1.42*s,-.13*s,w);bx(.36*s,.36*s,.08*s,L(0x0c0c10),-.03*s,1.78*s,.13*s,w);
 sp(.035*s,GL(0xbfe6ff),.08*s,1.79*s,.16*s,w,6);const aL=rot(cy(.045*s,.045*s,.7*s,L(0xd5dbe6),-.26*s,1.5*s,.28*s,w,6),-1.25,0,0),aR=rot(cy(.045*s,.045*s,.7*s,L(0xd5dbe6),.26*s,1.5*s,.28*s,w,6),-1.25,0,0);
 const gg=glow(0xbfe6ff,2.4*s,true,.35);gg.position.y=1.2*s;w.add(gg);
 return{g,anim:t=>{w.rotation.z=Math.sin(t*1.5)*.06;aL.rotation.x=-1.25+Math.sin(t*3)*.25;aR.rotation.x=-1.25-Math.sin(t*3)*.25}}},
patasola(s){const g=new THREE.Group(),h=humanoid({s,skin:0xc9a98a,top:0x5a1218,bottom:0x5a1218,arm:0xc9a98a,noLegs:true,belt:0x3a0a10});g.add(h.g);
 cy(.11*s,.08*s,.9*s,L(0x8a6a50),0,.45*s,0,h.g,8);cn(.42*s,.7*s,L(0x5a1218),0,.95*s,0,h.g,12);bx(.42*s,.95*s,.12*s,L(0x0c0c10),0,1.3*s,-.14*s,h.g);eyes(h.g,0xff3355,.04*s,1.64*s,.15*s,.06*s);h.baseL=h.baseR=-.9;
 return{g,anim:(t,m)=>{h.g.position.y=m?Math.abs(Math.sin(t*6))*.7*s:0;h.armL.rotation.x=-.9+Math.sin(t*6)*.4;h.armR.rotation.x=-.9-Math.sin(t*6)*.4}}},
silbon(s){const g=new THREE.Group(),S=2*s,h=humanoid({s:S,skin:0x8f8a80,top:0x2a251e,bottom:0x1d1a15,arm:0x2a251e,boots:0x120e0a});h.g.scale.x=.72;g.add(h.g);
 cy(.34*S,.34*S,.03*S,L(0x1c1712),0,1.78*S,0,h.g,16);cy(.17*S,.2*S,.22*S,L(0x1c1712),0,1.88*S,0,h.g,12);const sack=sp(.3*S,LT(tex('thatch','#6e5536','#3a2a18')),.05*S,1.1*S,-.32*S,h.g,10);sack.scale.set(1,1.2,.9);
 eyes(h.g,0xe8f4ff,.025*S,1.62*S,.15*S,.05*S);return{g,anim:(t,m)=>walk(h,t*3,m?.5:.03)}},
madremonte(s){const g=new THREE.Group(),S=1.2*s,h=humanoid({s:S,skin:0x3f5b2a,top:0x2f4a22,bottom:0x2a3d1d,arm:0x3a5426,boots:0x1d2e14,belt:0x1d2e14});g.add(h.g);
 const greens=[L(0x2f5a22),L(0x4a7a2a),L(0x23401a)];for(let i=0;i<18;i++){const a=rand(0,PI*2),y=rand(.9,1.9)*S,r=(y>1.5*S?.2:.3)*S;rot(cn(.12*S,.5*S,pick(greens),Math.cos(a)*r,y,Math.sin(a)*r,h.g,5),rand(-1,1),a,rand(-1.2,1.2))}
 for(let i=0;i<6;i++)rot(cy(.02*S,.03*S,rand(.6,1.1)*S,L(0x1d2e14),rand(-.25,.25)*S,1*S,rand(-.15,.15)*S,h.g,4),rand(-.3,.3),0,rand(-.3,.3));
 for(let i=0;i<5;i++)rot(cy(.02*S,.04*S,.5*S,L(0x2a2016),(i-2)*.08*S,1.95*S,0,h.g,4),0,0,(i-2)*.35);eyes(h.g,0xd7ff4a,.04*S,1.64*S,.15*S,.07*S);
 return{g,anim:(t,m)=>walk(h,t*5,m?.45:.04)}},
vampiro(s){return vampLike(s,false)},dracula(s){return vampLike(s,true)},
esqueleto(s){return skeletonB(s,false)},espartano(s){return skeletonB(s,true)},
murcielago(s){const g=new THREE.Group(),b=new THREE.Group();g.add(b);b.position.y=.3*s;const fur=L(0x1c1418);
 const body=sp(.16*s,fur,0,0,0,b,10);body.scale.set(1,1.25,1);sp(.11*s,L(0x241a1e),0,.2*s,.04*s,b,10);[-1,1].forEach(d=>cn(.04*s,.12*s,L(0x241a1e),d*.06*s,.33*s,.03*s,b,4));eyes(b,0xff2a2a,.022*s,.22*s,.13*s,.04*s);
 const wing=x=>{const p=new THREE.Group();p.position.set(x*.12*s,.05*s,0);b.add(p);bx(.55*s,.015*s,.32*s,L(0x2a1a22),x*.29*s,0,0,p);bx(.3*s,.015*s,.2*s,L(0x2a1a22),x*.62*s,-.02*s,-.06*s,p);return p};
 const wl=wing(-1),wr=wing(1);return{g,anim:t=>{const f=Math.sin(t*20)*.8;wl.rotation.z=f;wr.rotation.z=-f;b.position.y=.3*s+Math.sin(t*20)*.04*s}}},
lobo(s,blk){const S=1.15*s,g=new THREE.Group(),fur=blk?0x141418:0x4a3e34,dk=blk?0x0b0b0d:0x3a3028,mn=blk?0x08080a:0x332a22,h=humanoid({s:S,w:1.3,skin:fur,top:fur,bottom:dk,arm:fur,boots:dk,belt:dk,face:false});g.add(h.g);h.torso.rotation.x=.35;h.head.visible=false;
 const hd=new THREE.Group();hd.position.set(0,1.58*S,.16*S);h.g.add(hd);sp(.17*S,L(fur),0,0,0,hd,14).scale.set(1,.95,1.05);rot(cy(.06*S,.095*S,.3*S,L(dk),0,-.05*S,.24*S,hd,10),PI/2,0,0);sp(.03*S,B(0x111111),0,0,.39*S,hd,6);
 [-1,1].forEach(d=>{cn(.06*S,.18*S,L(fur),d*.1*S,.2*S,-.04*S,hd,4);rot(cn(.015*S,.05*S,B(0xffffff),d*.04*S,-.12*S,.3*S,hd,4),PI,0,0);for(let k=0;k<3;k++)rot(cn(.012*S,.08*S,B(0xe8e0cc),(k-1)*.02*S,-.72*S,.04*S,d<0?h.armL:h.armR,4),PI,0,0)});
 eyes(hd,blk?0xff3a1a:0xffcf2a,.03*S,.05*S,.15*S,.08*S);if(blk){const eg=glow(0xff2a1a,.35*S,true,.6);eg.position.set(0,.05*S,.2*S);hd.add(eg)}for(let i=0;i<(blk?12:7);i++)rot(cn(.08*S,.3*S,L(mn),rand(-.15,.15)*S,1.5*S,rand(-.15,0)*S,h.g,4),-.8,0,rand(-.4,.4));
 rot(cy(.04*S,.1*S,.7*S,L(fur),0,.85*S,-.3*S,h.g,6),-1,0,0);h.baseL=h.baseR=-.4;[-1,1].forEach(d=>{sp(.14*S,L(fur),d*.34*S,1.42*S,0,h.g,10).scale.set(1.15,.9,1);sp(.11*S,L(fur),d*.1*S,1.28*S,.12*S,h.g,10).scale.set(1.1,.8,.6);const ar=d<0?h.armL:h.armR;for(let k=0;k<3;k++)rot(cn(.04*S,.16*S,L(mn),0,-.18*S-k*.05*S,-.06*S,ar,4),-2.3,0,d*.3);const kn=(d<0?h.legL:h.legR).knee;if(kn)for(let k=0;k<2;k++)rot(cn(.035*S,.14*S,L(mn),0,-.1*S-k*.08*S,-.06*S,kn,4),-2.4,0,0)});return{g,h,anim:(t,m)=>walk(h,t*9,m?.7:.05)}},
gargola(s){const g=new THREE.Group(),S=s,st=LT(tex('stone','#6a6c70','#45474c')),b=new THREE.Group();g.add(b);
 const body=sp(.35*S,st,0,1*S,0,b,12);body.scale.set(1,1.2,.9);sp(.2*S,st,0,1.55*S,.12*S,b,12);bx(.12*S,.1*S,.15*S,st,0,1.5*S,.3*S,b);
 [-1,1].forEach(d=>{rot(cn(.05*S,.25*S,st,d*.1*S,1.75*S,.08*S,b,5),-.3,0,-d*.4);cy(.08*S,.06*S,.55*S,st,d*.38*S,.95*S,.15*S,b,6).rotation.x=-.5;bx(.14*S,.45*S,.18*S,st,d*.18*S,.45*S,.08*S,b)});
 eyes(b,0xff8a2a,.03*S,1.58*S,.29*S,.07*S);
 const wing=x=>{const p=new THREE.Group();p.position.set(x*.2*S,1.25*S,-.15*S);b.add(p);bx(1*S,.6*S,.03*S,st,x*.5*S,.1*S,0,p);rot(cn(.04*S,.3*S,st,x*.98*S,.45*S,0,p,4),0,0,-x*.5);return p};
 const wl=wing(-1),wr=wing(1);rot(cy(.03*S,.07*S,.8*S,st,0,.6*S,-.4*S,b,5),-1.1,0,0);
 return{g,anim:(t,m)=>{const f=Math.sin(t*(m?8:2))*.5;wl.rotation.y=.4+f;wr.rotation.y=-.4-f}}},
harpia(s){const g=new THREE.Group(),h=humanoid({s,skin:0xc9a07a,top:0x6a4a2a,bottom:0x6a4a2a,arm:0xc9a07a,noLegs:true,belt:0x4a3018});g.add(h.g);h.armL.visible=h.armR.visible=false;
 bx(.36*s,.55*s,.12*s,L(0x2a1a10),0,1.5*s,-.12*s,h.g);eyes(h.g,0xff3a2a,.03*s,1.65*s,.15*s,.06*s);rot(cn(.3*s,.55*s,L(0x5a3a1e),0,.72*s,0,h.g,10),PI,0,0);
 [-1,1].forEach(d=>{cy(.025*s,.02*s,.5*s,L(0xc9a040),d*.08*s,.3*s,0,h.g,5);for(let k=0;k<3;k++)rot(cn(.015*s,.08*s,B(0x2a2a2a),d*.08*s+(k-1)*.03*s,.04*s,.06*s,h.g,4),PI/2,0,0)});
 const wing=x=>{const p=new THREE.Group();p.position.set(x*.25*s,1.4*s,0);h.g.add(p);[[.5,.35,0x6a4a2a],[.45,.3,0x8a6a3e],[.4,.25,0xa88a5a]].forEach(([w,hh,c],i)=>bx(w*s,hh*s,.03*s,L(c),x*(.25+i*.38)*s,-i*.06*s,-i*.02*s,p));return p};
 const wl=wing(-1),wr=wing(1);return{g,anim:t=>{const f=Math.sin(t*10)*.7;wl.rotation.z=f;wr.rotation.z=-f}}},
minotauro(s){const S=1.35*s,g=new THREE.Group(),fur=0x5a3a24,h=humanoid({s:S,w:1.35,skin:fur,top:fur,bottom:0x3a2a1a,arm:fur,boots:0x2a1a10,belt:0x2a1a10});g.add(h.g);h.head.visible=false;
 const hd=new THREE.Group();hd.position.set(0,1.66*S,.04*S);h.g.add(hd);sp(.19*S,L(fur),0,0,0,hd,14).scale.set(1,1.05,1.05);sp(.13*S,L(0x7a5a3a),0,-.08*S,.17*S,hd,12).scale.set(1.1,.8,.85);
 rot(mesh(G('TorusGeometry',.045*S,.012*S,6,14),L(0xd9a640,{metalness:.85,roughness:.3}),0,-.17*S,.3*S,hd),0,0,0);
 [-1,1].forEach(d=>{rot(cn(.06*S,.35*S,L(0xe8dcc0),d*.25*S,.12*S,0,hd,8),0,0,-d*1.2);rot(cn(.04*S,.2*S,L(0xe8dcc0),d*.4*S,.27*S,0,hd,8),0,0,-d*.2);bx(.12*S,.06*S,.04*S,L(fur),d*.2*S,.08*S,-.05*S,hd)});
 eyes(hd,0xff2a1a,.035*S,.05*S,.18*S,.09*S);bx(.4*S,.35*S,.05*S,L(0x3a2010),0,.7*S,.18*S,h.g);
 const metal=L(0x8a9098,{metalness:.85,roughness:.35});cy(.025*S,.025*S,1.2*S,L(0x4a3020),0,-.75*S,.05*S,h.armR,6);bx(.04*S,.4*S,.45*S,metal,0,-1.25*S,.05*S,h.armR);
 h.baseR=-.3;return{g,anim:(t,m)=>walk(h,t*6,m?.55:.04)}},
ciclope(s){const S=1.8*s,g=new THREE.Group(),h=humanoid({s:S,w:1.3,skin:0xb08a64,top:0xb08a64,bottom:0x7a5a3a,arm:0xb08a64,boots:0x5a4030,belt:0x4a3020});g.add(h.g);
 sp(.075*S,B(0xf2eee6),0,1.67*S,.13*S,h.g,14);sp(.035*S,GL(0x8a1a0a),0,1.67*S,.195*S,h.g,10);bx(.2*S,.04*S,.06*S,L(0x5a3a20),0,1.75*S,.14*S,h.g);bx(.12*S,.03*S,.02*S,B(0x2a0a0a),0,1.55*S,.16*S,h.g);
 for(let i=0;i<3;i++)rot(cn(.04*S,.12*S,L(0x3a2010),(i-1)*.06*S,1.82*S,0,h.g,4),rand(-.3,.3),0,(i-1)*.3);bx(.42*S,.3*S,.32*S,LT(tex('thatch','#6a4a2a','#3a2a18')),0,.78*S,0,h.g);
 cy(.09*S,.04*S,1*S,LT(tex('wood','#5a3a20','#2a1a0a')),0,-.95*S,.08*S,h.armR,8);h.baseR=-.2;return{g,anim:(t,m)=>walk(h,t*3.5,m?.4:.03)}},
centauro(s){const g=new THREE.Group(),S=s,horse=L(0x6a4a2e),dk=L(0x4a3220);
 const bd=bx(.5*S,.55*S,1.25*S,horse,0,1.05*S,-.15*S,g);const legs=quadLegs(g,S,[[-.17,.35],[.17,.35],[-.17,-.62],[.17,-.62]],.85,.85,.07,dk);rot(cy(.03*S,.09*S,.7*S,L(0x2a1a10),0,1*S,-.85*S,g,6),-.6,0,0);
 const h=humanoid({s:S,skin:0xc89a72,top:0xc89a72,bottom:0x6a4a2e,arm:0xc89a72,noLegs:true,belt:0x8a1a14});h.g.position.set(0,.42*S,.4*S);g.add(h.g);
 bx(.4*S,.5*S,.12*S,L(0x2a1a10),0,1.55*S,-.13*S,h.g);eyes(h.g,0xffb03a,.025*S,1.65*S,.15*S,.06*S);
 rot(mesh(G('TorusGeometry',.38*S,.018*S,4,18,PI),L(0x5a3a1e),0,-.62*S,.05*S,h.armL),0,PI/2,PI/2);h.baseL=-1.3;h.baseR=-1.1;
 return{g,anim:(t,m)=>gallop(legs,t*12,m?.7:.05)}},
medusa(s){const g=new THREE.Group(),S=s,scale=LT(tex('stone','#3f6a3a','#1f3a1c'));
 const seg=[];for(let i=0;i<9;i++){const r=(.24-i*.02)*S;seg.push(sp(r,scale,0,Math.max(r,(.7-i*.1)*S),-i*.24*S,g,10))}
 const h=humanoid({s:S,skin:0x9ab88a,top:0x2a4a3a,bottom:0x2a4a3a,arm:0x9ab88a,noLegs:true,belt:0xd9a640});g.add(h.g);
 bx(.4*S,.06*S,.25*S,L(0xd9a640,{metalness:.8,roughness:.3}),0,1.42*S,0,h.g);eyes(h.g,0xffe14a,.03*S,1.65*S,.15*S,.06*S);
 const snakes=[];for(let i=0;i<12;i++){const a=i/12*PI*2,p=new THREE.Group();p.position.set(Math.cos(a)*.12*S,1.72*S,Math.sin(a)*.12*S-.02*S);p.rotation.set(Math.sin(a)*.9,0,-Math.cos(a)*.9);h.g.add(p);cy(.025*S,.018*S,.32*S,L(i%2?0x3f8a3a:0x2f6a2a),0,.16*S,0,p,5);sp(.035*S,L(0x2f6a2a),0,.33*S,.02*S,p,6);snakes.push(p)}
 const gg=glow(0xffe14a,1.1*S,true,.22);gg.position.set(0,1.65*S,.2*S);h.g.add(gg);h.baseL=h.baseR=-.6;
 return{g,anim:(t,m)=>{snakes.forEach((p,i)=>{p.rotation.y=Math.sin(t*4+i)*.5});seg.forEach((q,i)=>q.position.x=Math.sin(i*.8+t*3)*.2*S*i*.3)}}},
cerbero(s){const g=new THREE.Group(),S=s,fur=L(0x1a1416),d=L(0x0e0a0c);
 bx(.7*S,.65*S,1.5*S,fur,0,1.1*S,0,g);const legs=quadLegs(g,S,[[-.25,.55],[.25,.55],[-.25,-.55],[.25,-.55]],.85,.85,.09,d);
 const heads=[-.34,0,.34].map((x,i)=>{const hd=new THREE.Group();hd.position.set(x*S,(1.45+(i===1?.1:0))*S,.85*S);hd.rotation.y=x*.6;g.add(hd);bx(.3*S,.3*S,.34*S,fur,0,0,0,hd);bx(.18*S,.15*S,.25*S,d,0,-.05*S,.25*S,hd);eyes(hd,0xff3a1a,.035*S,.06*S,.17*S,.08*S);[-1,1].forEach(k=>cn(.06*S,.18*S,d,k*.1*S,.2*S,0,hd,4));
  cy(.18*S,.18*S,.08*S,L(0x5a1a10,{metalness:.5}),0,-.05*S,-.15*S,hd,10).rotation.x=PI/2;return hd});
 const tail=[];for(let i=0;i<5;i++)tail.push(sp((.08-i*.01)*S,L(0x2f4a2a),0,(1.2+i*.08)*S,(-.8-i*.15)*S,g,6));
 const gg=glow(0xff4a1a,2*S,true,.35);gg.position.set(0,1.4*S,1*S);g.add(gg);
 return{g,anim:(t,m)=>{gallop(legs,t*11,m?.75:.06);heads.forEach((hd,i)=>hd.position.y=(1.45+(i===1?.1:0))*S+Math.sin(t*6+i*2)*.05*S);tail.forEach((q,i)=>q.position.x=Math.sin(t*4+i)*.08*S*i)}}},
escarabajo(s){const g=new THREE.Group(),S=s,shell=L(0x1a3a5a,{metalness:.75,roughness:.3});
 const b=sp(.25*S,shell,0,.2*S,0,g,12);b.scale.set(1,.55,1.3);bx(.01*S,.08*S,.6*S,B(0x05080c),0,.33*S,-.02*S,g);sp(.1*S,L(0x111820),0,.18*S,.32*S,g,8);rot(cn(.03*S,.18*S,shell,0,.28*S,.4*S,g,5),-.6,0,0);eyes(g,0x6aff9a,.025*S,.22*S,.4*S,.05*S);
 const legs=[];for(let i=0;i<3;i++)for(const d of[-1,1]){const p=new THREE.Group();p.position.set(d*.2*S,.15*S,(i-1)*.18*S);g.add(p);rot(cy(.015*S,.01*S,.3*S,L(0x0e1218),d*.12*S,-.04*S,0,p,4),0,0,d*1.1);legs.push(p)}
 return{g,anim:(t,m)=>legs.forEach((p,i)=>p.rotation.y=Math.sin(t*25+i*1.7)*(m?.5:.05))}},
anubis(s){const S=1.15*s,g=new THREE.Group(),h=humanoid({s:S,skin:0x15151a,top:0x15151a,bottom:0xe8dcc0,arm:0x15151a,boots:0xd9a640,belt:0xd9a640});g.add(h.g);h.head.visible=false;
 const gold=L(0xd9a640,{metalness:.85,roughness:.3});cy(.3*S,.3*S,.05*S,gold,0,1.46*S,0,h.g,18);
 const hd=new THREE.Group();hd.position.set(0,1.66*S,0);h.g.add(hd);bx(.26*S,.26*S,.3*S,L(0x15151a),0,0,0,hd);bx(.12*S,.12*S,.32*S,L(0x15151a),0,-.06*S,.27*S,hd);
 [-1,1].forEach(d=>{cn(.07*S,.34*S,L(0x15151a),d*.08*S,.28*S,-.04*S,hd,4);cn(.04*S,.22*S,gold,d*.08*S,.26*S,-.0*S,hd,4)});eyes(hd,0xffcf4a,.028*S,.04*S,.14*S,.07*S);
 cy(.025*S,.025*S,2*S,gold,0,-.5*S,.1*S,h.armR,6);bx(.15*S,.06*S,.06*S,gold,0,.5*S,.1*S,h.armR);h.baseR=-.25;return{g,anim:(t,m)=>walk(h,t*5,m?.45:.04)}},
hidra(s){const g=new THREE.Group(),S=s,sk=LT(tex('stone','#2f5a3a','#163020')),belly=L(0x8aa06a);
 const body=sp(1*S,sk,0,1.1*S,0,g,18);body.scale.set(1.2,.8,1.6);const bl=sp(.85*S,belly,0,.85*S,.15*S,g,16);bl.scale.set(1.1,.6,1.5);
 quadLegs(g,S,[[-.8,.8],[.8,.8],[-.8,-.8],[.8,-.8]],.7,.7,.18,sk);for(let i=0;i<5;i++)cn((.35-i*.06)*S,.6*S,sk,0,(.9-i*.05)*S,(-1.6-i*.5)*S,g,8).rotation.x=-PI/2;
 const necks=[];for(let i=0;i<5;i++){const a=(i-2)*.38,balls=[];for(let j=0;j<7;j++)balls.push(sp((.2-j*.012)*S,sk,0,0,0,g,8));
  const hd=new THREE.Group();g.add(hd);bx(.32*S,.22*S,.42*S,sk,0,0,0,hd);bx(.26*S,.07*S,.3*S,belly,0,-.13*S,.08*S,hd);eyes(hd,0xffd23a,.035*S,.07*S,.15*S,.09*S);[-1,1].forEach(k=>rot(cn(.04*S,.2*S,L(0xe8dcc0),k*.1*S,.15*S,-.12*S,hd,5),-.6,0,0));necks.push({a,balls,hd,i})}
 const anim=t=>{for(const n of necks){for(let j=0;j<7;j++){const f=j/6;n.balls[j].position.set(Math.sin(n.a)*.6*S+Math.sin(n.a)*f*1.3*S+Math.sin(t*2+n.i)*.2*S*f,1.5*S+f*1.7*S+Math.sin(t*3+n.i*1.3)*.15*S*f,.9*S+f*.9*S)}
  const e=n.balls[6].position;n.hd.position.set(e.x,e.y+.12*S,e.z+.15*S);n.hd.rotation.y=n.a*.5}};anim(0);return{g,anim}}
};

