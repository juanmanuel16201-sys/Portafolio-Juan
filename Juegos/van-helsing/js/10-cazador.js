/* Van Helsing · Van Helsing en tercera persona */
/* ---------- hunter model (third person) ---------- */
function lathe(pts,seg,ps,pl){return new THREE.LatheGeometry(pts.map(([a,b])=>new THREE.Vector2(a,b)),seg,ps||0,pl||PI*2)}
function buildHunter(){const h=humanoid({skin:0xc99674,top:0x4a1a14,bottom:0x1f1c1a,arm:0x221d1a,boots:0x120d0a,belt:0x2a1a10,eyes:0x34465a,hair:0x1a120c});
 const coat=LT(leatherTex(),{color:0x161311,roughness:.42,metalness:.1,side:THREE.DoubleSide}),hatM=LT(leatherTex(),{color:0x1c1916,roughness:.72,side:THREE.DoubleSide}),silver=L(0xd0d6de,{metalness:.9,roughness:.2}),brass=L(0xb08a40,{metalness:.85,roughness:.3}),
  strap=L(0x2a1a10,{roughness:.7}),glove=L(0x16110d,{roughness:.6}),hairM=L(0x1a120c,{roughness:.9}),beard=L(0x1c140e,{roughness:1}),wood=LT(tex('wood','#6a4428','#2a1608'));
 [h.armL,h.armR].forEach(a=>{const e=a.elbow;e.children.slice(2).forEach(c=>c.material=glove);cy(.064,.072,.11,glove,0,-.26,0,e,10)});
 [h.legL,h.legR].forEach(l=>{if(!l.knee)return;cy(.082,.074,.3,L(0x120d0a,{roughness:.5}),0,-.19,0,l.knee,10);cy(.092,.09,.06,L(0x1c1410,{roughness:.6}),0,-.04,0,l.knee,10)});
 bx(.1,.12,.02,L(0xd8d0c0),0,1.43,.13,h.g);for(let i=0;i<4;i++)sp(.014,brass,0,1.03+i*.09,.17,h.g,6);
 const hd=h.head;sp(.125,beard,0,-.08,.055,hd,14).scale.set(1.1,.62,.9);bx(.09,.02,.03,beard,0,-.058,.15,hd);[-1,1].forEach(d=>{bx(.04,.13,.07,beard,d*.15,-.03,.03,hd);bx(.045,.024,.02,beard,d*.035,-.07,.152,hd).rotation.z=d*.35});
 sp(.168,hairM,0,.035,-.02,hd,16).scale.set(1.04,.95,1.06);bx(.3,.4,.09,hairM,0,1.5,-.12,h.g);[-1,1].forEach(d=>{bx(.06,.34,.08,hairM,d*.15,1.52,-.04,h.g).rotation.z=d*.08});
 const hat=new THREE.Group();hat.position.set(0,1.79,.005);hat.rotation.x=-.1;h.g.add(hat);
 const brim=mesh(lathe([[0,0],[.47,-.012],[.52,.025],[.555,.065]],36),hatM,0,0,0,hat);brim.scale.z=1.08;mesh(lathe([[0,.21],[.15,.21],[.168,.18],[.182,0]],28),hatM,0,0,0,hat);cy(.185,.185,.045,L(0x3a1a12),0,.03,0,hat,28);
 mesh(lathe([[.15,0],[.17,.12],[.215,.26]],20,.6,PI*2-1.2),coat,0,1.42,-.01,h.g).scale.z=.85;
 mesh(lathe([[.19,0],[.21,.1],[.268,.32],[.282,.44],[.238,.54],[.14,.6]],28,.42,PI*2-.84),coat,0,.88,0,h.g).scale.z=.7;
 mesh(lathe([[.2,.22],[.3,.13],[.4,-.12],[.425,-.21]],30,.3,PI*2-.6),coat,0,1.38,0,h.g).scale.z=.78;
 [-1,1].forEach(d=>{const lp=bx(.11,.36,.02,coat,d*.1,1.22,.175,h.g);lp.rotation.set(0,d*-.25,d*.28)});
 const skP=[[.21,0],[.255,-.3],[.31,-.62],[.36,-.86]],panels=[[.42,PI/2-.42,'R'],[PI/2,PI/2,'R'],[PI,PI/2,'L'],[PI*1.5,PI/2-.42,'L']].map(([a,l,side])=>{const g=new THREE.Group();g.position.y=.92;h.g.add(g);mesh(lathe(skP,10,a,l),coat,0,0,0,g).scale.z=.85;return{g,side}});
 const bl_=bx(.07,.82,.02,strap,0,1.16,.2,h.g);bl_.rotation.z=.62;const dx=-Math.sin(.62),dy=Math.cos(.62);for(let i=0;i<5;i++){const t=(i-2)*.13,st=new THREE.Group();st.position.set(dx*t,1.16+dy*t,.215);st.rotation.z=.62;h.g.add(st);cy(.013,.013,.12,wood,.03,0,0,st,6).rotation.z=PI/2;rot(cn(.013,.04,silver,.11,0,0,st,6),0,0,-PI/2)}
 bx(.24,.07,.03,silver,0,1.32,.185,h.g).visible=false;bx(.02,.1,.012,silver,0,1.31,.19,h.g);bx(.06,.02,.012,silver,0,1.33,.19,h.g);
 bx(.08,.06,.02,brass,0,.94,.18,h.g);bx(.09,.2,.07,strap,.23,.84,.04,h.g);bx(.08,.14,.06,strap,-.22,.86,.06,h.g);
 const bk=new THREE.Group();bk.position.set(0,1.18,-.26);bk.rotation.z=.55;h.g.add(bk);bx(.06,.07,.62,wood,0,0,0,bk).rotation.x=PI/2;bx(.62,.03,.035,L(0x1a1612,{metalness:.5,roughness:.4}),0,.28,0,bk);bx(.6,.005,.005,L(0xb0a890),0,.24,0,bk);bx(.04,.1,.06,silver,0,-.2,0,bk);
 const hand=new THREE.Group();hand.position.set(0,-.62,.06);hand.rotation.x=-PI/2;hand.scale.setScalar(1.5);h.armR.add(hand);
 const g=new THREE.Group();g.add(h.g);scene.add(g);g.visible=false;rimify(g);
 g.traverse(o=>{if(o.isMesh)o.castShadow=!(o.material&&o.material.transparent)});const bl=blob(g,.7);return{g,h,tails:new THREE.Group(),panels,hand,bl}}
const hunter=buildHunter();
const FPA=(()=>{const sleeve=LT(leatherTex(),{color:0x1a1613,roughness:.42,metalness:.1}),glove=L(0x16110d,{roughness:.6}),cuff=L(0x4a1a14);
 const mkA=dir=>{const g=new THREE.Group();vm.add(g);bx(.075,.09,.11,glove,0,0,0,g);bx(.03,.03,.06,glove,-.045,.02,-.03,g);const d=new V3(...dir).normalize(),len=.8;const sl=cy(.052,.064,len,sleeve,0,0,0,g,12);sl.quaternion.setFromUnitVectors(new V3(0,1,0),d);sl.position.copy(d.clone().multiplyScalar(len/2+.04));
  const cf=cy(.056,.056,.04,cuff,0,0,0,g,12);cf.quaternion.copy(sl.quaternion);cf.position.copy(d.clone().multiplyScalar(.06));rimify(g);return g};
 return{r:mkA([.18,-.28,1]),l:mkA([-.35,-.3,.9])}})();
const RH=[[0,-.1,.13],[0,-.07,.12],[0,-.05,.12],[0,-.14,-.04],[0,-.08,.05],[0,-.13,-.05],[0,-.02,.1],[0,-.14,0]],LH=[null,[0,-.03,-.3],[0,-.04,-.26],[0,-.07,-.22],[0,-.03,-.34],[0,-.05,-.3],[0,-.02,-.5],[0,-.03,-.28]];
function poseArms(i){FPA.r.position.set(...RH[i]);FPA.l.visible=!!LH[i];if(LH[i])FPA.l.position.set(...LH[i])}

function setHunterGun(){while(hunter.hand.children.length)hunter.hand.remove(hunter.hand.children[0]);const c=gunClone(S.weapon);c.position.set(0,0,0);hunter.hand.add(c)}

