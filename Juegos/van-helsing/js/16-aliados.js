/* Van Helsing · Chamanes aliados */
/* ---------- allies ---------- */
function summonAlly(){if(S.charge<CHARGE||allies.length>=2||!S.alive)return;S.charge=0;
 const h=humanoid({skin:0xb88a64,top:0x8f2f22,bottom:0x2b2b33,arm:0x8f2f22,boots:0x2a1a10,eyes:0x2a1a10,hair:0x111111});
 cy(.32,.32,.03,L(0xe8dfc8),0,1.76,0,h.g,16);cy(.15,.17,.2,L(0xe8dfc8),0,1.86,0,h.g,12);cy(.155,.155,.05,L(0x141414),0,1.82,0,h.g,12);
 for(let i=0;i<4;i++)bx(.54,.04,.32,L(i%2?0xe8b84a:0x1a1a1a),0,1.0+i*.1,0,h.g).scale.z=.8;
 bx(.07,.09,.9,LT(tex('wood','#4a3020','#1a1008')),0,-.5,.35,h.armR);h.baseR=-1.35;h.baseL=-1.1;
 const g=new THREE.Group();g.add(h.g);blob(g,.7);rimify(h.g);const f=fwd();g.position.set(P.pos.x-f.x*2,0,P.pos.z-f.z*2);scene.add(g);if(HIGH)g.traverse(o=>{if(o.isMesh)o.castShadow=true});
 const idx=allies.length;allies.push({g,h,hp:200,max:200,cd:0,t:0,hurt:0,name:'Chamán '+(idx+1),side:idx?-1:1});
 burst(new V3(g.position.x,1,g.position.z),0x7fe0c4,30,5,1);SFX.summon();
 say('Chamán '+(idx+1),pick(['¡Aquí estoy, parcero! A limpiar este lugar.','Traje tabaco y plegarias. Vamos, Van Helsing.','Tranquilo, que a estos monstruos yo los conozco.']),'#4fbf7a')}

