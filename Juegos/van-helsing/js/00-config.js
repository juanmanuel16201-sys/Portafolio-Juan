/* Van Helsing · Utilidades base, detección de celular y ajustes guardados */

const $=id=>document.getElementById(id);
const isTouch=matchMedia('(pointer: coarse)').matches||('ontouchstart' in window&&navigator.maxTouchPoints>0);
if(isTouch)document.body.classList.add('touch');
const PI=Math.PI,rand=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0],clamp=(v,a,b)=>v<a?a:v>b?b:v;
const V3=THREE.Vector3;
const ARENA=58,CHARGE=12;
let QL=isTouch?'media':'alta',HIGH=true,THIRD=false,SENS=1;
try{const q=localStorage.getItem('vh_q');if(q==='alta'||q==='media'||q==='baja')QL=q;const c=localStorage.getItem('vh_cam');if(c)THIRD=c==='3';const sv=parseFloat(localStorage.getItem('vh_sens'));if(sv>0)SENS=sv}catch(e){}
HIGH=QL!=='baja';

