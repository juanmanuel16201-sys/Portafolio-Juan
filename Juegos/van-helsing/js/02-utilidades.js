/* Van Helsing · Cachés, texturas procedurales y brillos */
/* ---------- caches & helpers ---------- */
const GC={};let MC={};const TC={};
function G(kind,...a){const k=kind+a.join(',');return GC[k]||(GC[k]=new THREE[kind](...a))}
function mkMat(o){if(HIGH){if(o.roughness===undefined)o.roughness=.85;if(o.metalness===undefined)o.metalness=0;return new THREE.MeshStandardMaterial(o)}delete o.roughness;delete o.metalness;return new THREE.MeshLambertMaterial(o)}
function L(c,o){const k='L'+c+(o?JSON.stringify(o):'');return MC[k]||(MC[k]=mkMat(Object.assign({color:c},o||{})))}
function GL(c){return L(c,{emissive:c})}
function LT(t,o){const k='T'+t.uuid+(o?JSON.stringify(o):'');if(MC[k])return MC[k];const m=mkMat(Object.assign({color:0xffffff,map:t},o||{}));if(HIGH&&t.userData&&t.userData.nrm&&m.isMeshStandardMaterial){m.normalMap=t.userData.nrm;m.normalScale=new THREE.Vector2(.9,.9)}return MC[k]=m}
function makeNormal(cv,str=2.2){const S=cv.width,src=cv.getContext('2d').getImageData(0,0,S,S).data,o=document.createElement('canvas');o.width=o.height=S;const ox=o.getContext('2d'),img=ox.createImageData(S,S),d=img.data;
 const Lm=(x,y)=>{x=(x+S)%S;y=(y+S)%S;const i=(y*S+x)*4;return(src[i]*.3+src[i+1]*.59+src[i+2]*.11)/255};
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){const dx=(Lm(x+1,y)-Lm(x-1,y))*str,dy=(Lm(x,y+1)-Lm(x,y-1))*str,l=Math.hypot(dx,dy,1),i=(y*S+x)*4;d[i]=(-dx/l*.5+.5)*255;d[i+1]=(dy/l*.5+.5)*255;d[i+2]=(1/l*.5+.5)*255;d[i+3]=255}
 ox.putImageData(img,0,0);const t=new THREE.CanvasTexture(o);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
function leatherTex(){if(TC.leather)return TC.leather;const S=256,cv=document.createElement('canvas');cv.width=cv.height=S;const x=cv.getContext('2d');x.fillStyle='#8a8a8a';x.fillRect(0,0,S,S);
 for(let i=0;i<6000;i++){x.globalAlpha=Math.random()*.22;x.fillStyle=Math.random()<.5?'#000':'#fff';const r=Math.random()*2+.5;x.fillRect(Math.random()*S,Math.random()*S,r,r)}
 x.strokeStyle='#000';for(let i=0;i<46;i++){x.globalAlpha=Math.random()*.3;x.lineWidth=Math.random()*1.6+.3;x.beginPath();const px=Math.random()*S,py=Math.random()*S;x.moveTo(px,py);x.bezierCurveTo(px+rand(-30,30),py+rand(-10,10),px+rand(-30,30),py+rand(-10,10),px+rand(-50,50),py+rand(-15,15));x.stroke()}x.globalAlpha=1;
 const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,3);t.userData=t.userData||{};t.userData.nrm=makeNormal(cv,3);t.userData.nrm.repeat.copy(t.repeat);return TC.leather=t}
const RIMU={value:new THREE.Color(0x8aa0ff)},RIMS={value:.5},RIMC={};
function rimMat(m){if(!m||!m.isMeshStandardMaterial||m.transparent)return m;if(RIMC[m.uuid])return RIMC[m.uuid];const r=m.clone();
 r.onBeforeCompile=sh=>{sh.uniforms.rimC=RIMU;sh.uniforms.rimS=RIMS;sh.fragmentShader='uniform vec3 rimC;uniform float rimS;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n{float fr=pow(1.0-clamp(abs(dot(normal,normalize(vViewPosition))),0.0,1.0),2.6);totalEmissiveRadiance+=rimC*fr*rimS;}')};
 r.customProgramCacheKey=()=>'rim';return RIMC[m.uuid]=r}
function rimify(o){if(!HIGH)return o;o.traverse(c=>{if(c.isMesh&&!c.isInstancedMesh)c.material=rimMat(c.material)});return o}
function B(c,o){const k='B'+c+(o?JSON.stringify(o):'');return MC[k]||(MC[k]=new THREE.MeshBasicMaterial(Object.assign({color:c},o||{})))}
function mesh(geo,mat,x=0,y=0,z=0,p){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);if(p)p.add(m);return m}
const bx=(w,h,d,m,x,y,z,p)=>mesh(G('BoxGeometry',w,h,d),m,x,y,z,p);
const sp=(r,m,x,y,z,p,s=10)=>mesh(G('SphereGeometry',r,s,Math.max(6,s*.7|0)),m,x,y,z,p);
const cy=(a,b,h,m,x,y,z,p,s=10)=>mesh(G('CylinderGeometry',a,b,h,s),m,x,y,z,p);
const cn=(r,h,m,x,y,z,p,s=10)=>mesh(G('ConeGeometry',r,h,s),m,x,y,z,p);
const rot=(m,x=0,y=0,z=0)=>{m.rotation.set(x,y,z);return m};
const flat=m=>{m.userData.noCast=true;return m};

// procedural textures
function tex(kind,c1,c2,rx=1,ry=rx){const k=[kind,c1,c2,rx,ry].join('|');if(TC[k])return TC[k];
 const S=256,cv=document.createElement('canvas');cv.width=cv.height=S;const x=cv.getContext('2d'),R=Math.random;
 x.fillStyle=c1;x.fillRect(0,0,S,S);
 const spk=(n,a,sz,cols)=>{for(let i=0;i<n;i++){x.globalAlpha=R()*a;x.fillStyle=cols[R()*cols.length|0];const s=R()*sz+1;x.fillRect(R()*S,R()*S,s,s)}x.globalAlpha=1};
 const blot=(n,a,rm,col)=>{for(let i=0;i<n;i++){x.globalAlpha=R()*a;x.fillStyle=col;x.beginPath();x.arc(R()*S,R()*S,R()*rm+4,0,7);x.fill()}x.globalAlpha=1};
 const crack=(n,a,col)=>{x.strokeStyle=col;for(let i=0;i<n;i++){x.globalAlpha=R()*a;x.lineWidth=R()*1.5+.5;x.beginPath();let px=R()*S,py=R()*S;x.moveTo(px,py);for(let j=0;j<5;j++){px+=(R()-.5)*30;py+=(R()-.5)*30;x.lineTo(px,py)}x.stroke()}x.globalAlpha=1};
 if(kind==='grass'){blot(40,.25,30,c2);spk(6000,.45,2,[c2,'#000','#4a5a30']);x.strokeStyle=c2;for(let i=0;i<1400;i++){x.globalAlpha=R()*.7;const px=R()*S,py=R()*S;x.beginPath();x.moveTo(px,py);x.lineTo(px+(R()-.5)*4,py-3-R()*7);x.stroke()}x.globalAlpha=1}
 else if(kind==='dirt'){blot(50,.3,25,c2);spk(8000,.4,2,[c2,'#000','#6a5a48'])}
 else if(kind==='sand'){blot(30,.2,40,c2);spk(9000,.3,1.5,[c2,'#fff','#000']);x.strokeStyle=c2;x.lineWidth=1.5;for(let y=0;y<S;y+=9){x.globalAlpha=.3;x.beginPath();for(let xx=0;xx<=S;xx+=8)x.lineTo(xx,y+Math.sin(xx*.05+y)*3);x.stroke()}x.globalAlpha=1}
 else if(kind==='stone'){blot(70,.25,22,c2);blot(30,.12,20,'#fff');spk(4000,.35,2,[c2,'#000','#fff']);crack(14,.5,'#111')}
 else if(kind==='brick'||kind==='tiles'){x.fillStyle=c2;x.fillRect(0,0,S,S);const bw=kind==='brick'?64:64,bh=kind==='brick'?32:64;
  for(let r=0;r<S/bh;r++)for(let c=-1;c<S/bw+1;c++){const ox=kind==='brick'?(r%2)*bw/2:0;x.fillStyle=c1;x.fillRect(c*bw+ox+2,r*bh+2,bw-4,bh-4);x.globalAlpha=R()*.24;x.fillStyle=R()<.5?'#000':'#fff';x.fillRect(c*bw+ox+2,r*bh+2,bw-4,bh-4);x.globalAlpha=1}
  spk(5000,.3,2,['#000','#fff',c2]);crack(9,.4,'#111')}
 else if(kind==='marble'){spk(3000,.15,2,['#fff',c2]);x.strokeStyle=c2;for(let i=0;i<16;i++){x.globalAlpha=R()*.45+.1;x.lineWidth=R()*1.6+.3;x.beginPath();x.moveTo(R()*S,R()*S);x.bezierCurveTo(R()*S,R()*S,R()*S,R()*S,R()*S,R()*S);x.stroke()}x.globalAlpha=1}
 else if(kind==='wood'){x.strokeStyle=c2;for(let i=0;i<70;i++){x.globalAlpha=R()*.6;x.lineWidth=R()*2+.5;const px=R()*S;x.beginPath();x.moveTo(px,0);x.bezierCurveTo(px+(R()-.5)*20,S*.3,px+(R()-.5)*20,S*.6,px+(R()-.5)*10,S);x.stroke()}x.globalAlpha=1;spk(2000,.25,2,['#000'])}
 else if(kind==='thatch'){x.strokeStyle=c2;x.lineWidth=1;for(let i=0;i<1600;i++){x.globalAlpha=R()*.7;const px=R()*S,py=R()*S;x.beginPath();x.moveTo(px,py);x.lineTo(px+(R()-.5)*6,py+10+R()*10);x.stroke()}x.globalAlpha=1}
 else if(kind==='glyph'){blot(40,.25,25,c2);spk(4000,.3,2,['#000','#fff']);x.fillStyle=c2;for(let r=0;r<8;r++){x.globalAlpha=.55;x.fillRect(0,r*32+1,S,1.5);for(let i=0;i<10;i++){const gx=i*25+6,gy=r*32+7,q=R()*4|0;
   if(q===0)x.fillRect(gx,gy,12,18);else if(q===1){x.beginPath();x.arc(gx+6,gy+9,6,0,7);x.fill()}else if(q===2){x.fillRect(gx,gy+14,14,4);x.fillRect(gx+5,gy,4,14)}else{x.beginPath();x.moveTo(gx,gy+18);x.lineTo(gx+7,gy);x.lineTo(gx+14,gy+18);x.fill()}}}x.globalAlpha=1}
 const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=ANISO;t.userData=t.userData||{};t.userData.nrm=makeNormal(cv);t.userData.nrm.repeat.copy(t.repeat);t.userData.nrm.anisotropy=ANISO;return TC[k]=t}
const BLOBTEX=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(0,0,0,.75)');g.addColorStop(.6,'rgba(0,0,0,.35)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(cv)})();
function blob(p,r){const m=mesh(G('PlaneGeometry',2,2),B(0x000000,{map:BLOBTEX,transparent:true,depthWrite:false,opacity:HIGH?.55:1}),0,.03,0,p);m.rotation.x=-PI/2;m.scale.setScalar(r);m.userData.noCast=true;m.renderOrder=1;return m}
const HBBG=new THREE.SpriteMaterial({color:0x000000,transparent:true,opacity:.6,depthWrite:false}),HBFG=new THREE.SpriteMaterial({color:0xe0303a,depthWrite:false});
const GLOWTEX=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(cv)})();
function glow(c,size,fog=true,op=1){const k='S'+c+fog+op;const m=MC[k]||(MC[k]=new THREE.SpriteMaterial({map:GLOWTEX,color:c,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,fog}));const s=new THREE.Sprite(m);s.scale.setScalar(size);return s}

