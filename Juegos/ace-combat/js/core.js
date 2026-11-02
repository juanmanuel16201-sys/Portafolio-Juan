// Ace Combat · Utilidades, escena 3D y terreno
'use strict';

const $=id=>document.getElementById(id);
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const damp=(a,b,l,dt)=>lerp(a,b,1-Math.exp(-l*dt));
const V3=THREE.Vector3, Q=THREE.Quaternion;
const AX=new V3(1,0,0), AY=new V3(0,1,0), AZ=new V3(0,0,1);
const _v1=new V3(),_v2=new V3(),_v3=new V3(),_v4=new V3(),_q1=new Q(),_s1=new V3(),_s2=new V3();
const isTouch=matchMedia('(pointer:coarse)').matches;
if(isTouch) document.body.classList.add('touch');
/* ---------------- Renderer & scene ---------------- */
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,isTouch?1.25:1.75));
renderer.setSize(innerWidth,innerHeight);
$('stage').appendChild(renderer.domElement);
const scene=new THREE.Scene();
const FOGC=new THREE.Color(0xb4d2e8);
scene.fog=new THREE.Fog(FOGC,1800,10500);
scene.background=FOGC;
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,1,40000);
const cockScene=new THREE.Scene(),cockCam=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.02,20),head={pos:new V3(),q:new Q()},_e=new THREE.Euler();
const sunDir=new V3(0.45,0.5,-0.72).normalize();

const sky=new THREE.Mesh(new THREE.SphereGeometry(30000,32,16),new THREE.ShaderMaterial({
  side:THREE.BackSide,depthWrite:false,fog:false,
  uniforms:{top:{value:new THREE.Color(0x1f63b0)},hor:{value:FOGC},sun:{value:sunDir}},
  vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform vec3 top;uniform vec3 hor;uniform vec3 sun;varying vec3 vD;void main(){float h=max(vD.y,0.0);vec3 c=mix(hor,top,pow(h,0.5));if(vD.y<0.0)c=hor;float s=max(dot(normalize(vD),sun),0.0);c+=vec3(1.0,0.9,0.7)*pow(s,400.0)*1.5+vec3(1.0,0.8,0.5)*pow(s,10.0)*0.22;gl_FragColor=vec4(c,1.0);}'
}));
sky.renderOrder=-1;scene.add(sky);
const sun=new THREE.DirectionalLight(0xfff0d8,1.15);sun.position.copy(sunDir).multiplyScalar(1000);scene.add(sun);
scene.add(new THREE.HemisphereLight(0xd2e8ff,0x4d5c3c,0.7));
/* ---------------- Terrain ---------------- */
const WORLD=6500;
function hash(x,y){let h=(Math.imul(x,374761393)+Math.imul(y,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296;}
function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  return lerp(lerp(hash(xi,yi),hash(xi+1,yi),u),lerp(hash(xi,yi+1),hash(xi+1,yi+1),u),v);}
function fbm(x,y,o){let s=0,a=1,f=1,n=0;for(let i=0;i<o;i++){s+=a*vnoise(x*f,y*f);n+=a;a*=.5;f*=2.03;}return s/n;}
function terrainRaw(x,z){
  const n=fbm(x*.00042+10,z*.00042+10,5);
  const r=1-Math.abs(fbm(x*.0009+40,z*.0009+40,4)*2-1);
  let h=(n-.43)*1500+Math.pow(r,3)*760*n;
  const d=Math.max(Math.abs(x),Math.abs(z))/WORLD;
  h-=Math.max(0,d-.78)*3200;
  return h;
}
const BASE=(function(){
  const L=1500,Wd=60;let best=null,bs=1e9;
  for(let x=-4800;x<=4800;x+=300)for(let z=-5200;z<=-800;z+=300)for(let k=0;k<4;k++){
    const yaw=k*Math.PI/4,s=Math.sin(yaw),c=Math.cos(yaw);let mn=1e9,mx=-1e9,sum=0,n=0,wet=0;
    for(let u=-L/2-100;u<=L/2+100;u+=170)for(let v=-80;v<=300;v+=95){const wx=x+s*u+c*v,wz=z+c*u-s*v;
      if(Math.abs(wx)>WORLD*.8||Math.abs(wz)>WORLD*.8){wet+=10;continue;}
      const h=terrainRaw(wx,wz);if(h<8)wet++;mn=Math.min(mn,h);mx=Math.max(mx,h);sum+=h;n++;}
    const sc=(mx-mn)+wet*60+Math.hypot(x,z+3300)*.02;
    if(sc<bs){bs=sc;best={x,z,yaw,h:Math.max(16,n?sum/n:16)};}
  }
  const B=Object.assign(best,{L,Wd,s:Math.sin(best.yaw),c:Math.cos(best.yaw),v0:-Wd/2-70,v1:Wd/2+300,u0:L/2+140,blend:280});
  const hdg=((best.yaw*57.2958)%360+360)%360;B.num=String(Math.round(hdg/10)||36).padStart(2,'0');B.num2=String(Math.round(((hdg+180)%360)/10)||36).padStart(2,'0');
  return B;
})();
function baseLocal(x,z){const dx=x-BASE.x,dz=z-BASE.z;return [dx*BASE.s+dz*BASE.c,dx*BASE.c-dz*BASE.s];}
function baseDist(x,z){const [u,v]=baseLocal(x,z),du=Math.max(0,Math.abs(u)-BASE.u0),dv=v<BASE.v0?BASE.v0-v:v>BASE.v1?v-BASE.v1:0;return Math.hypot(du,dv);}
function terrainH(x,z){
  const h=terrainRaw(x,z);if(Math.abs(x-BASE.x)>1400||Math.abs(z-BASE.z)>1400)return h;
  const d=baseDist(x,z);if(d>=BASE.blend)return h;const t=1-d/BASE.blend,k=t*t*(3-2*t);return h+(BASE.h-h)*k;
}
(function buildTerrain(){
  const size=WORLD*2.5,seg=230;
  const g=new THREE.PlaneGeometry(size,size,seg,seg);g.rotateX(-Math.PI/2);
  const pos=g.attributes.position,cols=new Float32Array(pos.count*3),c=new THREE.Color();
  const sand=new THREE.Color(0xdccb92),grass=new THREE.Color(0x6a9a44),forest=new THREE.Color(0x3f6a32),rock=new THREE.Color(0x857868),snow=new THREE.Color(0xf3f6fa),sea=new THREE.Color(0x8f8566);
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),z=pos.getZ(i),h=terrainH(x,z);pos.setY(i,h);
    const j=(hash(i,7)-.5)*.08;
    if(h<-5)c.copy(sea);else if(h<16)c.copy(sand);else if(h<220)c.copy(grass).lerp(forest,(h-16)/204);
    else if(h<560)c.copy(forest).lerp(rock,(h-220)/340);else if(h<780)c.copy(rock);else c.copy(rock).lerp(snow,Math.min(1,(h-780)/120));
    cols[i*3]=c.r+j;cols[i*3+1]=c.g+j;cols[i*3+2]=c.b+j;
  }
  g.setAttribute('color',new THREE.BufferAttribute(cols,3));g.computeVertexNormals();
  scene.add(new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.95,metalness:0})));
  const water=new THREE.Mesh(new THREE.PlaneGeometry(80000,80000),new THREE.MeshStandardMaterial({color:0x2b80b4,roughness:.28,metalness:.15,transparent:true,opacity:.93}));
  water.rotation.x=-Math.PI/2;water.position.y=0;scene.add(water);
  // trees
  const tree=new THREE.InstancedMesh(new THREE.ConeGeometry(9,30,6),new THREE.MeshStandardMaterial({color:0x2c5528,flatShading:true,roughness:1}),2200);
  const m=new THREE.Matrix4(),qq=new Q(),sc=new V3();let n=0;
  for(let t=0;t<9000&&n<2200;t++){const x=rand(-WORLD,WORLD),z=rand(-WORLD,WORLD),h=terrainH(x,z);if(h<22||h>470||baseDist(x,z)<70)continue;
    const s=rand(.7,1.5);sc.set(s,s*rand(.8,1.3),s);m.compose(new V3(x,h+13*s,z),qq,sc);tree.setMatrixAt(n++,m);}
  tree.count=n;scene.add(tree);
  // clouds
  const cg=new THREE.IcosahedronGeometry(1,1),cm=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x8899aa,emissiveIntensity:.35,flatShading:true,roughness:1,transparent:true,opacity:.88});
  for(let i=0;i<70;i++){const grp=new THREE.Group();grp.position.set(rand(-WORLD,WORLD),rand(1300,2300),rand(-WORLD,WORLD));
    const k=4+Math.floor(Math.random()*5);for(let j=0;j<k;j++){const me=new THREE.Mesh(cg,cm);const s=rand(60,150);me.scale.set(s*rand(1,1.6),s*.55,s);me.position.set(rand(-160,160),rand(-20,30),rand(-110,110));grp.add(me);}scene.add(grp);}
})();
