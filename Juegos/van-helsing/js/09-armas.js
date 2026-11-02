/* Van Helsing · Armas y modelos en primera persona */
/* ---------- weapons & viewmodel ---------- */
const WEAPONS=[
 {name:'Revólver de plata',dmg:36,rate:.32,pellets:1,spread:.008,start:Infinity,color:0xfff0c0},
 {name:'Escopeta bendita',dmg:17,rate:.8,pellets:7,spread:.065,start:24,color:0xffd28a},
 {name:'Ballesta de estacas',dmg:100,rate:.62,pellets:1,spread:0,start:12,pierce:true,color:0xd9c08a},
 {name:'Metralleta de sal',dmg:15,rate:.085,pellets:1,spread:.03,start:0,color:0xe9fff8,special:true,give:180,refill:50},
 {name:'Rifle Winchester de plata',dmg:95,rate:.75,pellets:1,spread:0,start:0,pierce:true,color:0xdfe8ff,special:true,give:20,refill:6},
 {name:'Lanzallamas sagrado',dmg:7,rate:.06,kind:'flame',start:0,color:0xff8a2a,special:true,give:220,refill:60,range:10},
 {name:'Tridente de Zeus',dmg:75,rate:.7,kind:'chain',start:0,color:0x8fd8ff,special:true,give:24,refill:6},
 {name:'Lanzagranadas de ajo',dmg:140,rate:.9,kind:'grenade',start:0,color:0xb8ff6a,special:true,give:12,refill:4}
];
const RECOIL=[.5,1,.6,.25,1.2,.04,.7,.9];
const vm=new THREE.Group();camera.add(vm);vm.position.set(.26,-.25,-.48);
const guns=[];
{const metal=L(0xc9cfd8,{metalness:.9,roughness:.25}),dark=L(0x26221e,{metalness:.4,roughness:.5}),wood=LT(tex('wood','#6a4428','#2a1608'));
 const mk=(f,mz)=>{const g=new THREE.Group();f(g);const m=new THREE.Object3D();m.position.set(0,.02,mz);g.add(m);g.muzzle=m;vm.add(g);guns.push(g);return g};
 mk(g=>{rot(cy(.025,.025,.32,metal,0,.02,-.16,g,10),PI/2,0,0);rot(cy(.055,.055,.09,metal,0,0,.02,g,10),PI/2,0,0);bx(.06,.07,.14,metal,0,0,.07,g);rot(bx(.05,.16,.07,wood,0,-.1,.14,g),.3,0,0);bx(.012,.02,.02,GL(0xd9a640),0,.05,-.3,g)},-.33);
 mk(g=>{rot(cy(.028,.028,.7,dark,-.03,.02,-.3,g,10),PI/2,0,0);rot(cy(.028,.028,.7,dark,.03,.02,-.3,g,10),PI/2,0,0);bx(.1,.08,.2,wood,0,-.04,-.25,g);bx(.08,.1,.35,wood,0,-.03,.17,g);bx(.04,.03,.5,metal,0,.06,-.2,g);bx(.03,.03,.1,GL(0xd9a640),0,.06,-.48,g)},-.66);
 mk(g=>{bx(.06,.07,.6,wood,0,0,-.1,g);rot(bx(.38,.04,.05,dark,-.17,0,-.36,g),0,-.35,0);rot(bx(.38,.04,.05,dark,.17,0,-.36,g),0,.35,0);
   rot(cy(.012,.012,.5,metal,0,.05,-.2,g,6),PI/2,0,0);rot(cn(.025,.08,GL(0xdfe6ff),0,.05,-.49,g,6),-PI/2,0,0);rot(mesh(G('TorusGeometry',.05,.01,4,10),metal,0,-.03,.05,g),0,PI/2,0)},-.52);
 mk(g=>{bx(.08,.12,.42,dark,0,0,-.1,g);rot(cy(.02,.02,.2,metal,0,.02,-.4,g,8),PI/2,0,0);bx(.05,.2,.07,dark,0,-.14,-.05,g);bx(.085,.02,.3,GL(0x7fe0c4),0,.065,-.1,g);bx(.06,.14,.14,wood,0,-.06,.18,g)},-.5);
 mk(g=>{rot(cy(.022,.022,.85,metal,0,.03,-.38,g,10),PI/2,0,0);rot(cy(.03,.03,.4,dark,0,-.01,-.22,g,10),PI/2,0,0);bx(.06,.09,.22,metal,0,0,.02,g);rot(bx(.06,.12,.4,wood,0,-.04,.28,g),.1,0,0);rot(mesh(G('TorusGeometry',.06,.012,5,12),metal,0,-.09,.04,g),0,PI/2,0);rot(cy(.03,.03,.28,dark,0,.1,-.05,g,10),PI/2,0,0);rot(cy(.034,.034,.02,GL(0x6ab0ff),0,.1,-.19,g,10),PI/2,0,0)},-.82);
 mk(g=>{rot(cy(.07,.07,.36,L(0x8a1a10,{metalness:.6,roughness:.4}),0,-.02,.05,g,12),PI/2,0,0);rot(cy(.03,.04,.42,metal,0,.02,-.32,g,10),PI/2,0,0);rot(cy(.05,.03,.08,dark,0,.02,-.55,g,10),PI/2,0,0);bx(.05,.16,.06,dark,0,-.13,-.05,g);mesh(G('TorusGeometry',.072,.01,4,12),L(0xd9a640,{metalness:.8,roughness:.3}),0,-.02,-.1,g);const pf=glow(0x6ab0ff,.12);pf.position.set(0,-.01,-.6);g.add(pf)},-.62);
 mk(g=>{const gold=L(0xd9a640,{metalness:.9,roughness:.25});rot(cy(.018,.018,1.1,gold,0,0,-.25,g,8),PI/2,0,0);bx(.24,.03,.03,gold,0,0,-.78,g);[-1,0,1].forEach(k=>{rot(cy(.012,.012,.2,gold,k*.11,0,-.88,g,6),PI/2,0,0);rot(cn(.025,.08,GL(0x8fd8ff),k*.11,0,-1.02,g,6),-PI/2,0,0)});const gg=glow(0x8fd8ff,.35);gg.position.set(0,0,-.95);g.add(gg);sp(.04,GL(0x8fd8ff),0,0,-.7,g,8)},-1.02);
 mk(g=>{rot(cy(.075,.075,.14,dark,0,-.02,-.08,g,10),0,0,PI/2);rot(cy(.045,.045,.45,dark,0,.03,-.3,g,10),PI/2,0,0);rot(cy(.05,.05,.03,L(0xb8ff6a,{emissive:0x2a4a10}),0,.03,-.52,g,10),PI/2,0,0);bx(.06,.11,.34,wood,0,-.02,.2,g);bx(.05,.16,.06,dark,0,-.14,0,g);for(let k=0;k<6;k++){const a=k/6*PI*2;sp(.022,L(0xe8e0c0),.075,-.02+Math.cos(a)*.045,-.08+Math.sin(a)*.045,g,6)}},-.55);
}
const muzzleFlash=glow(0xffc070,.5,true,1);muzzleFlash.visible=false;

