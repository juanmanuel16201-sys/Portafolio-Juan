/* Van Helsing · Menú principal */
/* ---------- menu ---------- */
let menuMap='cementerio';try{const m=localStorage.getItem('vh_map');if(m&&MAPS[m])menuMap=m}catch(e){}
function bestOf(id){try{return+localStorage.getItem('vh_best_'+id)||0}catch(e){return 0}}
function renderMaps(){$('selMap').textContent=MAPS[menuMap].name;const box=$('maps');box.innerHTML='';Object.entries(MAPS).forEach(([id,M])=>{const b=document.createElement('button');b.className='mapc';b.type='button';b.setAttribute('aria-pressed',id===menuMap);
 const names=[...new Set(M.pool.map(p=>TYPES[p[0]].name))].slice(0,6).join(', ');const bosses=M.bosses.map(x=>x.name.split(',')[0]).join(' · ');const best=bestOf(id);
 b.innerHTML=`<b></b><em></em><small></small><span></span>`;b.querySelector('b').textContent=M.name;b.querySelector('em').textContent=best?'Récord: oleada '+best:'';b.querySelector('small').textContent=M.sub+' · Jefes: '+bosses;b.querySelector('span').textContent=M.desc+' '+names+'. Transformación: '+FORMS[M.form].name+'.';
 b.onclick=()=>{menuMap=id;try{localStorage.setItem('vh_map',id)}catch(e){}renderMaps();showMenuMap()};box.appendChild(b)})}
function syncSeg(){$('segCam').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.v==='3')===THIRD));$('segQ').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===QL))}
$('segCam').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;THIRD=b.dataset.v==='3';try{localStorage.setItem('vh_cam',b.dataset.v)}catch(err){}syncSeg()});
$('segQ').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.v!==QL){QL=b.dataset.v;try{localStorage.setItem('vh_q',QL)}catch(err){}MC={};applyQuality();showMenuMap()}syncSeg()});
$('sens').value=SENS;$('sensO').textContent=SENS.toFixed(1);$('sens').addEventListener('input',e=>{SENS=parseFloat(e.target.value)||1;$('sensO').textContent=SENS.toFixed(1);try{localStorage.setItem('vh_sens',String(SENS))}catch(err){}});
function showMenuMap(){buildWorld(menuMap);resetState();S.sayCd=999;const M=MAPS[menuMap];S.wave=9;
 const types=[...new Set(M.pool.map(p=>p[0]))].slice(0,6);types.forEach((t,i)=>{const a=(i/(types.length-1||1)-.5)*1.6;const e=makeEnemy(t,1,null,[Math.sin(a)*9,-4-Math.cos(a)*6]);e.spawn=0;e.g.rotation.y=-a*.4});
 const bd=M.bosses[0];const b=makeEnemy(bd.type,bd.k*.75,bd,[0,-17]);b.spawn=0;S.wave=0;S.sayCd=999;
 hunter.g.position.set(1.8,0,-4.2);hunter.g.rotation.y=PI;hunter.g.visible=true;const hh=hunter.h;walk(hh,0,0);hh.armR.rotation.x=-1.5;hh.armL.rotation.x=-1.05}

