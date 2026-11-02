/* Van Helsing · Estado de la partida */
/* ---------- state ---------- */
const P={pos:new V3(0,0,10),vy:0,ground:true,yaw:0,pitch:0};
let S={sayCd:999},enemies=[],allies=[],projs=[],drops=[],parts=[],tracers=[];
let state='menu',paused=false;
const keys={},input={fire:false,jx:0,jy:0};
const camPos=new V3();

function clearEntities(){dying.forEach(d=>scene.remove(d.g));dying=[];[...enemies.map(e=>e.g),...allies.map(a=>a.g),...projs.map(p=>p.m),...drops.map(d=>d.g),...parts.map(p=>p.m)].forEach(o=>scene.remove(o));
 tracers.forEach(t=>{scene.remove(t.l);t.l.geometry.dispose()});enemies=[];allies=[];projs=[];drops=[];parts=[];tracers=[]}
function resetState(){clearEntities();
 S={hp:200,max:200,wave:0,kills:0,bosses:0,charge:0,weapon:0,ammo:WEAPONS.map(w=>w.start),own:WEAPONS.map(w=>!w.special),gren:3,fireCd:0,inv:0,fury:0,slow:0,stone:0,hurt:0,shake:0,recoil:0,swap:0,
    toSpawn:0,spawnT:0,inter:2.5,boss:null,sayCd:2,third:THIRD,bob:0,quip:0,alive:true};
 P.pos.set(0,0,12);P.vy=0;P.yaw=0;P.pitch=0;S.wolf=false;S.transf=0;S.transfDelay=0;S.clawCd=0;S.howlCd=0;S.swing=0;S.swingSide=1;MOONT=0;S.form=null;S.pendingForm=null;S.dash=0;S.pounce=false;hideForms(null);hunter.g.scale.setScalar(1);switchWeapon(0,true)}

