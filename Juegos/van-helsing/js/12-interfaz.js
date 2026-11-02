/* Van Helsing · Ayudas de interfaz: mensajes y avisos */
/* ---------- UI helpers ---------- */
const uiC={};
const setT=(id,v)=>{if(uiC[id]!==v){uiC[id]=v;$(id).textContent=v}};
const setW=(id,p)=>{const v=(clamp(p,0,1)*100).toFixed(1)+'%';if(uiC[id+'w']!==v){uiC[id+'w']=v;$(id).style.width=v}};
function say(who,text,color='#e8a83a'){const box=$('toasts');const d=document.createElement('div');d.className='toast';d.style.borderLeftColor=color;
 if(who){const b=document.createElement('b');b.textContent=who+':';b.style.color=color;d.appendChild(b)}d.appendChild(document.createTextNode(text));box.appendChild(d);
 while(box.children.length>(isTouch?2:3))box.firstChild.remove();setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),420)},2800)}
function banner(t){const b=$('banner');b.textContent=t;b.classList.remove('on');void b.offsetWidth;b.classList.add('on')}
let hitT=0;function hitmark(kill){const h=$('hitm');h.classList.add('on');h.classList.toggle('kill',!!kill);hitT=.12}

