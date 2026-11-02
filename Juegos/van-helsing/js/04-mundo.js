/* Van Helsing · Cielo, nubes, luna, suelo, luces y construcción del mapa */
/* ---------- world building ---------- */
let world=null,OBST=[],FIRES=[],BATS=[],WISPS=[],AMB=[],KEY=null,curMap='cementerio';
const flashlight=new THREE.SpotLight(0xffe2a8,1.4,36,.52,.55,1.1);camera.add(flashlight);
const flTarget=new THREE.Object3D();flTarget.position.set(0,-.2,-5);camera.add(flTarget);flashlight.target=flTarget;
const muzzleLight=new THREE.PointLight(0xffc070,0,9);scene.add(muzzleLight);
function obst(x,z,r){OBST.push({x,z,r})}
function place(r,minC=9,maxR=ARENA-3){for(let i=0;i<80;i++){const x=rand(-maxR,maxR),z=rand(-maxR,maxR),d=Math.hypot(x,z);if(d<minC||d>maxR)continue;let ok=true;for(const o of OBST)if(Math.hypot(x-o.x,z-o.z)<o.r+r+.8){ok=false;break}if(ok)return[x,z]}return null}
const DQ=()=>QL==='alta'?1:QL==='media'?.8:.6;
function flame(W,x,y,z,s=1,light=true){const f=new THREE.Group();f.position.set(x,y,z);W.add(f);
 const c1=cn(.13*s,.4*s,B(0xff8a2a,{transparent:true,opacity:.92}),0,.15*s,0,f,7),c2=cn(.07*s,.28*s,B(0xffe08a),0,.12*s,0,f,6);
 const g=glow(0xff7a2a,2*s);g.position.y=.2*s;f.add(g);
 let l=null;if(light&&FIRES.filter(q=>q.l).length<(HIGH?7:4)){l=new THREE.PointLight(0xff8a3a,1.35,19,1.6);l.position.set(x,y+.5*s,z);W.add(l)}
 FIRES.push({f,c1,c2,g,l,ph:rand(0,9),base:2*s,x,y,z});return f}

function buildSky(W,M){const cv=document.createElement('canvas');cv.width=4;cv.height=256;const x=cv.getContext('2d'),g=x.createLinearGradient(0,0,0,256);
 g.addColorStop(0,M.sky[0]);g.addColorStop(.47,M.sky[1]);g.addColorStop(.53,M.sky[2]);g.addColorStop(1,M.sky[2]);x.fillStyle=g;x.fillRect(0,0,4,256);
 const s=mesh(new THREE.SphereGeometry(520,32,16),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),side:THREE.BackSide,fog:false,depthWrite:false}),0,0,0,W);flat(s);s.userData.noRecv=true;s.renderOrder=-1;
 if(M.stars){const n=700,a=new Float32Array(n*3);for(let i=0;i<n;i++){const t=rand(0,PI*2),p=rand(.1,1.4),r=480;a[i*3]=Math.cos(t)*Math.cos(p)*r;a[i*3+1]=Math.sin(p)*r;a[i*3+2]=Math.sin(t)*Math.cos(p)*r}
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(a,3));W.add(new THREE.Points(gg,new THREE.PointsMaterial({color:0xdfe6ff,size:1.4,fog:false,sizeAttenuation:false})))}
 const [mc,ms,mp]=M.moon;const m=sp(ms*2,B(mc,{fog:false}),mp[0]*2,mp[1]*2,mp[2]*2,W,28);flat(m);m.userData.noRecv=true;
 const h=glow(mc,ms*14,false,.55);h.position.copy(m.position);W.add(h);const h2=glow(mc,ms*30,false,.18);h2.position.copy(m.position);W.add(h2);
 m.material=m.material.clone();h.material=h.material.clone();h2.material=h2.material.clone();MOON={m,h,h2,c0:new THREE.Color(mc),hs:h.scale.x,h2s:h2.scale.x};MOONK=0;MOONT=0}
let MOON=null,MOONK=0,MOONT=0;const FULLC=new THREE.Color(0xf4f4ff);
const CLOUDC={cementerio:[0x3a4a66,.45],castillo:[0x6a1a26,.55],olimpo:[0xf0b090,.55],egipto:[0x6a5a7a,.22],llanos:[0x3a5a62,.4]};
let CLOUD=null;
function buildClouds(W,id){const cv=document.createElement('canvas');cv.width=1024;cv.height=256;const x=cv.getContext('2d');
 for(let i=0;i<220;i++){const cx=Math.random()*1024,cy=40+Math.random()*80,r=12+Math.random()*46;for(const ox of[0,-1024,1024]){const g=x.createRadialGradient(cx+ox,cy,0,cx+ox,cy,r);g.addColorStop(0,'rgba(255,255,255,'+(.16+Math.random()*.2)+')');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(cx+ox-r,cy-r,r*2,r*2)}}
 const t=new THREE.CanvasTexture(cv);t.wrapS=THREE.RepeatWrapping;const [c,o]=CLOUDC[id]||[0x445566,.4];
 CLOUD=mesh(new THREE.SphereGeometry(470,40,16),new THREE.MeshBasicMaterial({map:t,color:c,transparent:true,opacity:o,side:THREE.BackSide,fog:false,depthWrite:false}),0,0,0,W);CLOUD.userData.noCast=true;CLOUD.userData.noRecv=true;CLOUD.renderOrder=0}
function buildGround(W,M){const size=300,seg=HIGH?90:56,g=new THREE.PlaneGeometry(size,size,seg,seg);g.rotateX(-PI/2);const pos=g.attributes.position,col=[];
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),d=Math.hypot(x,z);let y=0;if(d>ARENA+4){const e=d-ARENA-4;y=Math.pow(e,1.22)*M.hill*(.75+.25*Math.sin(x*.06)*Math.cos(z*.08))+Math.sin(x*.18+z*.11)*e*.04;y=Math.min(y,26+Math.sin(x*.05)*4)}
  pos.setY(i,y);const n=.78+Math.random()*.18+Math.sin(x*.11)*Math.cos(z*.13)*.08-(d>ARENA+4?Math.min(.3,(d-ARENA)/120):0);col.push(n,n,n)}
 g.computeVertexNormals();g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 flat(mesh(g,LT(tex(M.ground[0],M.ground[1],M.ground[2],size/5),{vertexColors:true}),0,0,0,W))}
function buildAmb(W,kind){const conf={mist:{n:150,size:10,op:.13,c:0xa8b8d0,add:false},embers:{n:260,size:.35,op:.95,c:0xff7a2a,add:true},dust:{n:240,size:.3,op:.8,c:0xffd890,add:true},
  sand:{n:420,size:.22,op:.6,c:0xd8b888,add:false},fireflies:{n:160,size:.35,op:1,c:0xd8ff6a,add:true},wisps:{n:40,size:.6,op:1,c:0x8fffe0,add:true}}[kind];
 const n=Math.round(conf.n*DQ()),a=new Float32Array(n*3),v=new Float32Array(n*3);
 for(let i=0;i<n;i++){a[i*3]=rand(-ARENA,ARENA);a[i*3+1]=kind==='mist'?rand(.3,2.4):rand(.2,kind==='embers'?14:6);a[i*3+2]=rand(-ARENA,ARENA);v[i*3]=rand(-1,1);v[i*3+1]=rand(.5,1.5);v[i*3+2]=rand(0,9)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(a,3));
 const p=new THREE.Points(g,new THREE.PointsMaterial({map:GLOWTEX,size:conf.size,transparent:true,opacity:conf.op,depthWrite:false,color:conf.c,blending:conf.add?THREE.AdditiveBlending:THREE.NormalBlending}));W.add(p);AMB.push({p,a,v,kind,n})}

function buildWorld(id){RIMU.value.setHex({cementerio:0x7a90d0,castillo:0xd04050,olimpo:0xffb070,egipto:0xffc070,llanos:0x70d0b0}[id]||0x8aa0ff);
 if(world)scene.remove(world);world=new THREE.Group();scene.add(world);OBST=[];FIRES=[];BATS=[];WISPS=[];AMB=[];curMap=id;
 const M=MAPS[id],W=world;
 scene.background=new THREE.Color(M.fog[0]);scene.fog=new THREE.FogExp2(M.fog[0],M.fog[1]);
 W.add(new THREE.HemisphereLight(M.hemi[0],M.hemi[1],M.hemi[2]*(HIGH?1.15:1)));W.add(new THREE.AmbientLight(0xffffff,HIGH?.12:.05));
 KEY=new THREE.DirectionalLight(M.key[0],M.key[1]);KEY.userData.i0=M.key[1];KEY.userData.c0=new THREE.Color(M.key[0]);KEY.userData.dir=new V3(...M.key[2]).normalize();KEY.position.copy(KEY.userData.dir).multiplyScalar(60);W.add(KEY);W.add(KEY.target);
 if(HIGH){KEY.castShadow=true;const sm=QL==='alta'?(isTouch?2048:3072):1024;KEY.shadow.mapSize.set(sm,sm);const c=KEY.shadow.camera;c.left=c.bottom=-38;c.right=c.top=38;c.near=1;c.far=180;KEY.shadow.bias=-.0006;KEY.shadow.normalBias=.03}
 flashlight.intensity=M.flash;
 if(bloom)bloom.strength={cementerio:.6,castillo:.6,olimpo:.2,egipto:.38,llanos:.55}[id]||.5;
 buildSky(W,M);buildClouds(W,id);buildGround(W,M);M.build(W,M);(M.amb||[]).forEach(k=>buildAmb(W,k));
 if(M.ground[0]==='grass'&&id!=='llanos'){const n=Math.round(HIGH?2600:900),im=new THREE.InstancedMesh(G('ConeGeometry',.07,.5,4),L(0xffffff,{roughness:1}),n),d=new THREE.Object3D(),c=new THREE.Color(),base=new THREE.Color(M.ground[2]);let k=0;
  for(let i=0;i<n*3&&k<n;i++){const x=rand(-ARENA,ARENA),z=rand(-ARENA,ARENA),r=Math.hypot(x,z);if(r<8.5||r>ARENA-.5||Math.abs(x)<2.4||Math.abs(z)<2.4)continue;if(OBST.some(o=>Math.abs(o.x-x)<o.r&&Math.abs(o.z-z)<o.r))continue;
   for(let j=0;j<3&&k<n;j++){d.position.set(x+rand(-.15,.15),.18,z+rand(-.15,.15));d.rotation.set(rand(-.35,.35),rand(0,3),rand(-.35,.35));d.scale.set(1,rand(.6,1.5),1);d.updateMatrix();im.setMatrixAt(k,d.matrix);c.copy(base).multiplyScalar(rand(.7,1.35));im.setColorAt(k,c);k++}}
  im.count=k;im.userData.noCast=true;W.add(im)}
 W.traverse(o=>{if(o.isMesh||o.isInstancedMesh){o.receiveShadow=HIGH&&!o.userData.noRecv;o.castShadow=HIGH&&!o.userData.noCast&&!(o.material&&o.material.transparent)}});
}

