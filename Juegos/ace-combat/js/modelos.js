// Ace Combat · Modelos 3D: cazas, aviones de hélice y materiales
'use strict';

/* ---------------- Shared geometry & materials ---------------- */
function flat(pts,depth){const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false});g.rotateX(-Math.PI/2);g.translate(0,-depth/2,0);return g;}
const mirror=p=>p.map(([x,y])=>[-x,y]);
const GEO={};
GEO.fus=new THREE.CylinderGeometry(1.25,1.7,14,10);GEO.fus.rotateX(Math.PI/2);
GEO.nose=new THREE.ConeGeometry(1.25,6,10);GEO.nose.rotateX(Math.PI/2);GEO.nose.translate(0,0,10);
GEO.canopy=new THREE.SphereGeometry(1,14,10);GEO.canopy.scale(.85,.72,2.6);GEO.canopy.translate(0,1.15,4.2);
GEO.spine=new THREE.BoxGeometry(1.5,.9,7);GEO.spine.translate(0,1.0,-1.8);
const wingPts=[[.8,-2.5],[10.5,4.2],[10.5,5.9],[.8,6]];
GEO.wingL=flat(wingPts,.35);GEO.wingR=flat(mirror(wingPts),.35);
const stabPts=[[.7,-.6],[4.8,1.8],[4.8,2.9],[.7,2.6]];
GEO.stabL=flat(stabPts,.22);GEO.stabR=flat(mirror(stabPts),.22);
(()=>{const s=new THREE.Shape();[[0,0],[4.2,0],[4.9,4.4],[3.3,4.4]].forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:.24,bevelEnabled:false});g.translate(0,0,-.12);g.rotateY(Math.PI/2);GEO.fin=g;})();
GEO.ail=new THREE.BoxGeometry(3.4,.16,.9);GEO.ail.translate(0,0,-.45);
GEO.intake=new THREE.BoxGeometry(1.1,1.5,4.2);
GEO.nozzle=new THREE.CylinderGeometry(.85,.72,1.8,12);GEO.nozzle.rotateX(Math.PI/2);
GEO.ab=new THREE.ConeGeometry(.72,6,12,1,true);GEO.ab.rotateX(-Math.PI/2);GEO.ab.translate(0,0,-3);
GEO.abCore=new THREE.ConeGeometry(.42,3.2,10,1,true);GEO.abCore.rotateX(-Math.PI/2);GEO.abCore.translate(0,0,-1.6);
GEO.mslBody=new THREE.CylinderGeometry(.22,.22,3,8);GEO.mslBody.rotateX(Math.PI/2);
GEO.mslTip=new THREE.ConeGeometry(.22,.7,8);GEO.mslTip.rotateX(Math.PI/2);GEO.mslTip.translate(0,0,1.85);
GEO.finA=new THREE.BoxGeometry(1.1,.06,.5);GEO.finA.translate(0,0,-1.25);
GEO.finB=new THREE.BoxGeometry(.06,1.1,.5);GEO.finB.translate(0,0,-1.25);
GEO.pod=new THREE.CylinderGeometry(.48,.48,2.8,8);GEO.pod.rotateX(Math.PI/2);
GEO.barrel=new THREE.CylinderGeometry(.09,.09,2.2,6);GEO.barrel.rotateX(Math.PI/2);
GEO.nav=new THREE.SphereGeometry(.3,8,6);
GEO.tracer=new THREE.BoxGeometry(.4,.4,16);
GEO.debris=new THREE.BoxGeometry(3,1,4);
GEO.tank=new THREE.CylinderGeometry(.7,.7,5,10);GEO.tank.rotateX(Math.PI/2);
const M={
  glass:new THREE.MeshStandardMaterial({color:0x1d3346,metalness:.9,roughness:.08,emissive:0x0b3550,emissiveIntensity:.5}),
  dark:new THREE.MeshStandardMaterial({color:0x2a2e33,metalness:.5,roughness:.5,flatShading:true}),
  white:new THREE.MeshStandardMaterial({color:0xe8ecef,metalness:.2,roughness:.5}),
  ab:new THREE.MeshBasicMaterial({color:0xff9a3c,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),
  abCore:new THREE.MeshBasicMaterial({color:0x8fd8ff,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),
  navR:new THREE.MeshBasicMaterial({color:0xff3344}),navG:new THREE.MeshBasicMaterial({color:0x33ff77}),
  trP:new THREE.MeshBasicMaterial({color:0xffe9a0}),trE:new THREE.MeshBasicMaterial({color:0xff5040}),trO:new THREE.MeshBasicMaterial({color:0xff7ae6})
};
const matCache={};
const cmat=(k,f)=>matCache[k]||(matCache[k]=f());
function makeMissileMesh(s=1){const g=new THREE.Group();[GEO.mslBody,GEO.mslTip,GEO.finA,GEO.finB].forEach((ge,i)=>g.add(new THREE.Mesh(ge,i===0?M.white:M.dark)));g.scale.setScalar(s);return g;}
const VARIANTS={
  std:{wing:[[.8,-2.5],[10.5,4.2],[10.5,5.9],[.8,6]],stab:true,fins:'twin',canard:false,ail:[7.3,-5],tip:[10.4,-5.1],pyl:[[3.2,-.55,-.5],[5,-.5,-1.6],[6.8,-.45,-2.7]]},
  delta:{wing:[[.8,-3.5],[9.2,5.6],[9.2,6.6],[.8,6.8]],stab:false,fins:'single',canard:true,ail:[6,-5.8],tip:[9.1,-6.2],pyl:[[3.2,-.55,-1.8],[5,-.5,-3.3],[6.8,-.45,-4.6]]},
  fsw:{wing:[[.8,.5],[10,-2.6],[10,-1.4],[.8,4.8]],stab:true,fins:'twin',canard:true,ail:[7.3,.6],tip:[9.9,1.8],pyl:[[3.2,-.55,-1.2],[5,-.5,-.4],[6.8,-.45,.4]]},
  heavy:{wing:[[.8,-2],[11.5,3.5],[11.5,5.2],[.8,5.8]],stab:true,fins:'upright',canard:false,tank:true,ail:[8,-4.5],tip:[11.4,-4.4],pyl:[[3.2,-.55,-.6],[5.2,-.5,-1.6],[7.2,-.45,-2.6]]}
};
const VG={};
function variantGeo(v){if(VG[v])return VG[v];const d=VARIANTS[v],o={wL:flat(d.wing,.35),wR:flat(mirror(d.wing),.35)};
  if(d.canard){const cp=[[.7,-6.6],[3,-4.8],[3,-4.2],[.7,-4.4]];o.cL=flat(cp,.14);o.cR=flat(mirror(cp),.14);}return VG[v]=o;}
function makeJet(body,accent,scale=1,variant='std',abColor=0xff9a3c){
  const g=new THREE.Group(),J=g.userData,D=VARIANTS[variant],VGg=variantGeo(variant);
  const mB=cmat('b'+body,()=>new THREE.MeshStandardMaterial({color:body,metalness:.35,roughness:.48,flatShading:true}));
  const mW=cmat('w'+body,()=>new THREE.MeshStandardMaterial({color:body,metalness:.35,roughness:.5,flatShading:true,side:THREE.DoubleSide}));
  const mA=cmat('a'+accent,()=>new THREE.MeshStandardMaterial({color:accent,metalness:.3,roughness:.5,flatShading:true,side:THREE.DoubleSide}));
  const mAB=cmat('ab'+abColor,()=>{const m=M.ab.clone();m.color.setHex(abColor);return m;});
  const add=(geo,m,x=0,y=0,z=0,par=g)=>{const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);par.add(me);return me;};
  add(GEO.fus,mB);add(GEO.nose,mB);add(GEO.canopy,M.glass);add(GEO.spine,mB);
  add(VGg.wL,mW);add(VGg.wR,mW);
  if(VGg.cL){add(VGg.cL,mA,0,.35,0);add(VGg.cR,mA,0,.35,0);}
  if(D.tank)add(GEO.tank,M.white,0,-1.9,-.5);
  add(GEO.intake,mB,1.9,-.25,1.4);add(GEO.intake,mB,-1.9,-.25,1.4);
  J.stabs=[];J.fins=[];J.ails=[];J.abs=[];J.msl=[];
  if(D.fins==='single'){const fp=new THREE.Group();fp.position.set(0,1.0,-4.1);fp.scale.setScalar(1.3);g.add(fp);add(GEO.fin,mA,0,0,0,fp);J.fins.push(fp);}
  [1,-1].forEach(s=>{
    if(D.stab){const sp=new THREE.Group();sp.position.set(0,0,-6.2);g.add(sp);add(s>0?GEO.stabL:GEO.stabR,mA,0,0,0,sp);J.stabs.push(sp);}
    if(D.fins!=='single'){const fp=new THREE.Group();fp.position.set(1.15*s,.9,-4.6);fp.rotation.z=(D.fins==='upright'?-.1:-.32)*s;g.add(fp);add(GEO.fin,mA,0,0,0,fp);J.fins.push(fp);}
    const ap=new THREE.Group();ap.position.set(D.ail[0]*s,0,D.ail[1]);g.add(ap);add(GEO.ail,mA,0,0,0,ap);J.ails.push(ap);
    add(GEO.nozzle,M.dark,.78*s,0,-7.6);
    const a=add(GEO.ab,mAB,.78*s,0,-8.5),c=add(GEO.abCore,M.abCore,.78*s,0,-8.5);J.abs.push(a,c);
    add(GEO.pod,M.dark,1.5*s,-1.3,1.0);
    D.pyl.forEach(p=>{const m=makeMissileMesh();m.position.set(p[0]*s,p[1],p[2]);g.add(m);J.msl.push(m);});
  });
  J.msl=[0,3,1,4,2,5].map(i=>J.msl[i]);
  J.gun=new THREE.Group();J.gun.position.set(1.0,.45,7.4);g.add(J.gun);
  for(let i=0;i<3;i++)add(GEO.barrel,M.dark,Math.cos(i*2.094)*.17,Math.sin(i*2.094)*.17,0,J.gun);
  J.gear=new THREE.Group();g.add(J.gear);J.gear.visible=false;
  if(!GEO.strut){GEO.strut=new THREE.BoxGeometry(.2,2,.2);GEO.wheel=new THREE.CylinderGeometry(.5,.5,.4,12);GEO.wheel.rotateZ(Math.PI/2);}
  [[0,6.2],[1.7,-1.3],[-1.7,-1.3]].forEach(([x,z])=>{add(GEO.strut,M.dark,x,-1.6,z,J.gear);add(GEO.wheel,M.dark,x,-2.1,z,J.gear);});
  J.tipX=D.tip[0];J.tipZ=D.tip[1];
  J.navL=add(GEO.nav,M.navR,D.tip[0],0,D.tip[1]);J.navR=add(GEO.nav,M.navG,-D.tip[0],0,D.tip[1]);
  g.scale.setScalar(scale);
  return g;
}
/* ---------------- Aviones de hélice (Segunda Guerra Mundial) ---------------- */
const PVAR={
  p1:{wing:'taper',span:7.6,cowl:'inline',blades:4,frame:false,guns:[[2.7,1.9],[3.2,1.7],[3.7,1.5]]},
  p2:{wing:'ellipse',span:7.0,cowl:'inline',blades:3,frame:true,guns:[[2.5,1.7],[3.4,1.4]]},
  p3:{wing:'gull',span:7.8,cowl:'radial',blades:3,frame:false,guns:[[2.2,1.6],[2.7,1.5],[3.1,1.4]]},
  p4:{wing:'taper',span:8.3,cowl:'radial',blades:4,frame:true,fat:true,guns:[[2.6,1.9],[3.0,1.8],[3.4,1.7],[3.8,1.6]]},
  pjet:{wing:'taper',span:7.4,cowl:'jet',frame:false,guns:[]}
};
function propWing(type,span){
  if(type==='ellipse'){const L=[],T=[];for(let i=0;i<=10;i++){const t=i/10,x=.8+t*(span-.8),c=Math.max(.5,3.9*Math.sqrt(Math.max(0,1-t*t)));L.push([x,.9+c*.42]);T.unshift([x,.9-c*.58]);}return L.concat(T);}
  return [[.8,2.6],[span,1.4],[span+.15,.6],[span-.1,-.2],[.8,-1.5]];
}
const PG={};
function propGeo(v){
  if(PG[v])return PG[v];const D=PVAR[v],r=D.fat?1.3:1.05,o={r},conv=p=>p.map(([x,z])=>[x,-z]);
  o.fus=new THREE.CylinderGeometry(r,r*.42,10.5,14);o.fus.rotateX(Math.PI/2);
  o.front=new THREE.CylinderGeometry(r*1.02,r,2.6,14);o.front.rotateX(Math.PI/2);
  o.cowl=D.cowl==='radial'?new THREE.CylinderGeometry(r*1.22,r*1.08,2.2,18):D.cowl==='inline'?new THREE.CylinderGeometry(r*.62,r*1.02,2.4,14):new THREE.CylinderGeometry(r*.5,r*1.02,2.6,14);o.cowl.rotateX(Math.PI/2);
  if(D.wing==='gull'){const inn=[[0,2.4],[3.3,2.3],[3.3,-1.5],[0,-1.6]],out=[[0,2.3],[D.span-3.3,1.4],[D.span-3.15,.5],[D.span-3.4,-.3],[0,-1.5]];
    o.wiL=flat(conv(inn),.32);o.wiR=flat(conv(mirror(inn)),.32);o.woL=flat(conv(out),.28);o.woR=flat(conv(mirror(out)),.28);}
  else{const w=propWing(D.wing,D.span);o.wL=flat(conv(w),.32);o.wR=flat(conv(mirror(w)),.32);}
  const st=[[.3,.8],[3.1,.15],[3.2,-.5],[.3,-.9]];o.sL=flat(conv(st),.2);o.sR=flat(conv(mirror(st)),.2);
  o.blade=new THREE.BoxGeometry(.34,3.3,.1);o.blade.translate(0,1.75,0);
  o.spin=new THREE.ConeGeometry(.5,1.3,12);o.spin.rotateX(Math.PI/2);
  o.disc=new THREE.CircleGeometry(3.6,28);
  o.canopy=new THREE.SphereGeometry(1,14,10);o.canopy.scale(.72,.66,1.7);
  o.spine=new THREE.BoxGeometry(.55,.5,3.4);
  o.band=new THREE.CylinderGeometry(r*.8,r*.8,.45,14);o.band.rotateX(Math.PI/2);
  o.hoop=new THREE.TorusGeometry(.7,.045,5,16,Math.PI);
  o.ail=new THREE.BoxGeometry(2.4,.12,.55);o.ail.translate(0,0,-.27);
  o.exh=new THREE.BoxGeometry(.24,.18,.45);
  o.pod=new THREE.CylinderGeometry(.68,.55,4.4,12);o.pod.rotateX(Math.PI/2);
  o.bomb=new THREE.SphereGeometry(1,10,8);o.bomb.scale(.36,.36,1.25);
  o.bfinA=new THREE.BoxGeometry(.9,.05,.35);o.bfinA.translate(0,0,-1.1);o.bfinB=new THREE.BoxGeometry(.05,.9,.35);o.bfinB.translate(0,0,-1.1);
  o.gun=new THREE.CylinderGeometry(.07,.07,1.1,6);o.gun.rotateX(Math.PI/2);
  return PG[v]=o;
}
function makeBombMesh(){const P=propGeo('p1'),g=new THREE.Group();
  g.add(new THREE.Mesh(P.bomb,cmat('bombm',()=>new THREE.MeshStandardMaterial({color:0x3d4430,roughness:.7,flatShading:true}))));g.add(new THREE.Mesh(P.bfinA,M.dark));g.add(new THREE.Mesh(P.bfinB,M.dark));return g;}
function makeProp(body,accent,scale=1,variant='p1',abColor=0xff9a3c){
  const D=PVAR[variant]||PVAR.p1,P=propGeo(variant),r=P.r,g=new THREE.Group(),J=g.userData;
  const mB=cmat('b'+body,()=>new THREE.MeshStandardMaterial({color:body,metalness:.35,roughness:.48,flatShading:true}));
  const mW=cmat('w'+body,()=>new THREE.MeshStandardMaterial({color:body,metalness:.35,roughness:.5,flatShading:true,side:THREE.DoubleSide}));
  const mA=cmat('a'+accent,()=>new THREE.MeshStandardMaterial({color:accent,metalness:.3,roughness:.5,flatShading:true,side:THREE.DoubleSide}));
  const mAB=cmat('ab'+abColor,()=>{const m=M.ab.clone();m.color.setHex(abColor);return m;});
  const add=(geo,m,x=0,y=0,z=0,par=g)=>{const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);par.add(me);return me;};
  J.isProp=true;J.stabs=[];J.fins=[];J.ails=[];J.abs=[];J.msl=[];J.guns=[];
  const wy=-r*.5,noseZ=D.cowl==='radial'?7.3:7.45;
  add(P.fus,mB,0,0,-1.6);add(P.front,mB,0,0,4.9);add(P.cowl,D.cowl==='radial'?mA:mB,0,0,noseZ-1.15);
  add(P.canopy,M.glass,0,r*.82,1.0);add(P.spine,mB,0,r*.66,-1.6);add(P.band,mA,0,0,-3.6);
  if(D.frame){[2.1,1.0,-.1].forEach(z=>{add(P.hoop,M.dark,0,r*.82,z);});}
  if(D.wing==='gull'){
    [1,-1].forEach(s=>{const inn=new THREE.Group();inn.position.set(s*.6,wy,0);inn.rotation.z=-.32*s;g.add(inn);add(s>0?P.wiL:P.wiR,mW,0,0,0,inn);
      const out=new THREE.Group();out.position.set(s*3.3,0,0);out.rotation.z=.5*s;inn.add(out);add(s>0?P.woL:P.woR,mW,0,0,0,out);
      const ap=new THREE.Group();ap.position.set(s*(D.span-3.3-1.5),0,-.9);out.add(ap);add(P.ail,mA,0,0,0,ap);J.ails.push(ap);
      const nv=add(GEO.nav,s>0?M.navR:M.navG,s*(D.span-3.35),0,.5,out);if(s>0)J.navL=nv;else J.navR=nv;});
  }else{
    add(P.wL,mW,0,wy,0);add(P.wR,mW,0,wy,0);
    [1,-1].forEach(s=>{const ap=new THREE.Group();ap.position.set(s*(D.span-1.7),wy,-1.0);g.add(ap);add(P.ail,mA,0,0,0,ap);J.ails.push(ap);});
    J.navL=add(GEO.nav,M.navR,D.span,wy,.7);J.navR=add(GEO.nav,M.navG,-D.span,wy,.7);
  }
  J.tipX=D.span*.97;J.tipZ=.6;
  [1,-1].forEach(s=>{const sp=new THREE.Group();sp.position.set(0,.25,-6.0);g.add(sp);add(s>0?P.sL:P.sR,mA,0,0,0,sp);J.stabs.push(sp);});
  const fp=new THREE.Group();fp.position.set(0,.35,-4.4);fp.scale.setScalar(.62);g.add(fp);add(GEO.fin,mA,0,0,0,fp);J.fins.push(fp);
  if(D.cowl==='jet'){
    [1,-1].forEach(s=>{add(P.pod,mB,s*3.0,wy-.75,.8);add(GEO.nozzle,M.dark,s*3.0,wy-.75,-1.5).scale.setScalar(.75);
      const a=add(GEO.ab,mAB,s*3.0,wy-.75,-2.0);a.scale.set(.8,.8,.7);const c=add(GEO.abCore,M.abCore,s*3.0,wy-.75,-2.0);c.scale.set(.8,.8,.7);J.abs.push(a,c);});
    J.guns=[[.35,.35,7.9],[-.35,.35,7.9]];
  }else{
    J.prop=new THREE.Group();J.prop.position.set(0,0,noseZ+.15);g.add(J.prop);add(P.spin,mA,0,0,.45,J.prop);
    for(let k=0;k<D.blades;k++){const pv=new THREE.Group();pv.rotation.z=k*Math.PI*2/D.blades;J.prop.add(pv);add(P.blade,M.dark,0,0,0,pv).rotation.y=.35;}
    J.disc=add(P.disc,new THREE.MeshBasicMaterial({color:0x1a1a1a,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false}),0,0,0,J.prop);
    if(D.cowl==='inline')[1,-1].forEach(s=>{for(let k=0;k<3;k++)add(P.exh,M.dark,s*r*.9,.28,5.0+k*.55);});
    J.exh=[[r*.95,.3,5.6],[-r*.95,.3,5.6]];
    D.guns.forEach(([x,z])=>[1,-1].forEach(s=>{const gx=s*x,gy=wy-(D.wing==='gull'?x*.28:0);add(P.gun,M.dark,gx,gy,z+.4);J.guns.push([gx,gy,z+1.0]);}));
  }
  for(const k of [0,1])for(const s of [1,-1]){const x=1.9+k*1.25,m=makeBombMesh();m.position.set(s*x,wy-.75-(D.wing==='gull'?x*.3:0),.4);g.add(m);J.msl.push(m);}
  J.gun=new THREE.Group();g.add(J.gun);
  J.gear=new THREE.Group();g.add(J.gear);J.gear.visible=false;
  if(!GEO.strut){GEO.strut=new THREE.BoxGeometry(.2,2,.2);GEO.wheel=new THREE.CylinderGeometry(.5,.5,.4,12);GEO.wheel.rotateZ(Math.PI/2);}
  [[1.9,1.3],[-1.9,1.3],[0,-6.0]].forEach(([x,z])=>{add(GEO.strut,M.dark,x,-1.6,z,J.gear);add(GEO.wheel,M.dark,x,-2.1,z,J.gear).scale.setScalar(x?1:.6);});
  g.scale.setScalar(scale);
  return g;
}
function makePlane(P){return (P.v&&PVAR[P.v])?makeProp(P.body,P.accent,P.scale||1,P.v,P.ab||0xff9a3c):makeJet(P.body,P.accent,P.scale||1,P.v,P.ab||0xff9a3c);}
function spinProp(J,rate,dt){if(!J.prop)return;J.prop.rotation.z+=rate*dt;if(J.disc)J.disc.material.opacity=clamp(rate/90,0,1)*.16;}
