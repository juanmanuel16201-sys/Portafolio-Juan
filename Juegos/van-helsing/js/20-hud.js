/* Van Helsing · HUD y radar */
/* ---------- HUD ---------- */
const allyEls=[];let radT=0;const RAD=$('radar'),RX=RAD.getContext('2d');
function drawRadar(){const sz=RAD.clientWidth||140,dpr=Math.min(devicePixelRatio||1,2),W=Math.round(sz*dpr);if(RAD.width!==W){RAD.width=RAD.height=W}const x=RX,c=W/2,Rr=c-2*dpr,range=42,k=Rr/range;
 x.clearRect(0,0,W,W);x.fillStyle='rgba(8,9,14,.62)';x.beginPath();x.arc(c,c,Rr,0,7);x.fill();
 x.fillStyle='rgba(236,228,210,.08)';x.beginPath();x.moveTo(c,c);x.arc(c,c,Rr,-PI/2-.62,-PI/2+.62);x.fill();
 x.strokeStyle='rgba(236,228,210,.25)';x.lineWidth=dpr;x.beginPath();x.arc(c,c,Rr,0,7);x.stroke();x.strokeStyle='rgba(236,228,210,.1)';x.beginPath();x.arc(c,c,Rr*.5,0,7);x.stroke();
 const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);
 const dot=(px,pz,col,r)=>{const dx=px-P.pos.x,dz=pz-P.pos.z;let sx=dx*rx+dz*rz,sy=-(dx*fx+dz*fz);const d=Math.hypot(sx,sy)/range;if(d>.93){sx*=.93/d;sy*=.93/d}x.fillStyle=col;x.beginPath();x.arc(c+sx*k,c+sy*k,r*dpr,0,7);x.fill()};
 for(const d of drops)dot(d.g.position.x,d.g.position.z,'#e8c060',2);for(const a of allies)dot(a.g.position.x,a.g.position.z,'#4fbf7a',2.6);
 for(const e of enemies)if(!e.dead&&e.spawn<=0)dot(e.g.position.x,e.g.position.z,e.boss?'#ff7a3a':'#e8303a',e.boss?4.5:2.3);
 x.fillStyle='#ece4d2';x.beginPath();x.moveTo(c,c-5*dpr);x.lineTo(c+3.6*dpr,c+4*dpr);x.lineTo(c,c+2*dpr);x.lineTo(c-3.6*dpr,c+4*dpr);x.fill()}
function hud(){setW('hpFill',S.hp/S.max);setT('hpTxt',Math.ceil(S.hp)+' / '+S.max);
 $('vign').style.opacity=Math.max(S.hurt*1.6,S.hp<60?.25+Math.sin(performance.now()/180)*.15:0).toFixed(2);$('inv').style.opacity=S.inv>0?1:0;$('stone').style.opacity=S.stone>0?Math.min(1,S.stone):0;
 setT('waveTxt',S.inter>0&&S.wave>0?'Oleada '+(S.wave+1)+' en '+Math.ceil(S.inter):S.wave?'Oleada '+S.wave:'Preparándose');
 setT('waveSub',(isTouch?'':MAPS[curMap].name+' · ')+(S.inter>0?'busca botín':(S.toSpawn+enemies.length)+' por cazar')+(isTouch?' · '+S.kills+' almas':''));
 S.ck=Math.max(0,(S.ck||0)-.12);const ck=(1+S.ck*.6).toFixed(2);if(uiC.ck!==ck){uiC.ck=ck;$('cross').style.setProperty('--k',ck)}
 if((radT=(radT+1)%2)===0)drawRadar();
 if(S.boss&&!S.boss.dead)setW('bossFill',S.boss.hp/S.boss.max);
 setT('killsTxt',String(S.kills));setT('chargeTxt',S.charge+'/'+CHARGE);setW('chargeFill',S.charge/CHARGE);
 const full=S.charge>=CHARGE&&allies.length<2;$('chargeBar').classList.toggle('full',full);
 setT('summonHint',allies.length>=2?'Dos chamanes en combate':full?'Listo · pulsa Q':'');if(isTouch){$('bSummon').classList.toggle('ready',full);const pc=Math.round(S.charge/CHARGE*100);if(uiC.sc!==pc+'|'+allies.length){uiC.sc=pc+'|'+allies.length;$('bSummon').style.background=allies.length>=2?'':'conic-gradient(rgba(127,224,196,.5) '+pc+'%, rgba(10,11,16,.55) 0)'}}
 const w=WEAPONS[S.weapon];setT('wName',w.name);const lowA=isFinite(S.ammo[S.weapon])&&S.ammo[S.weapon]<=Math.max(3,(w.give||w.start||10)*.2);if(uiC.low!==lowA){uiC.low=lowA;$('wAmmo').classList.toggle('low',lowA)}if(uiC.wc!==S.weapon){uiC.wc=S.weapon;$('wName').style.color=w.special?hx(w.color):''}
 const sk=S.own.map((o,j)=>(o?1:0)+(j===S.weapon?2:0)).join('');if(uiC.sk!==sk){uiC.sk=sk;const box=$('slots');if(!box.children.length)WEAPONS.forEach((q,j)=>{const sp_=document.createElement('span');sp_.textContent=j+1;sp_.title=q.name;sp_.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();if(state!=='playing')return;if(S.own[j])switchWeapon(j);else say(null,'Aún no tienes '+q.name,'#9aa1b1')});box.appendChild(sp_)});[...box.children].forEach((el,j)=>{el.className=(S.own[j]?'own':'')+(j===S.weapon?' cur':'');el.style.borderColor=S.own[j]&&WEAPONS[j].special&&j!==S.weapon?hx(WEAPONS[j].color):''})}
setT('wAmmo',isFinite(S.ammo[S.weapon])?String(S.ammo[S.weapon]):'∞');setT('gren','Agua bendita ×'+S.gren+' · G');if(isTouch)setT('bAguaN',String(S.gren));
 if(S.form&&(S.wolf||S.transf>0)){const F=FORMS[S.form];setT('wName',F.atk);setT('wAmmo','∞');setT('gren',S.howlCd>0?F.sp+' en '+Math.ceil(S.howlCd)+' s':F.sp+' listo · G');if(isTouch)setT('bAguaN',S.howlCd>0?String(Math.ceil(S.howlCd)):'!')}
 const box=$('allies');while(allyEls.length<allies.length){const d=document.createElement('div');d.className='ally';d.innerHTML='<div class="lbl"><span></span></div><div class="bar"><i></i></div>';box.appendChild(d);allyEls.push(d)}
 allyEls.forEach((d,i)=>{const a=allies[i];d.hidden=!a;if(a){d.querySelector('span').textContent=a.name;d.querySelector('i').style.width=(clamp(a.hp/a.max,0,1)*100)+'%'}});
 const pw=[];if(S.inv>0)pw.push(['Crucifijo '+Math.ceil(S.inv)+' s','#9fb8ff']);if(S.fury>0)pw.push(['Furia '+Math.ceil(S.fury)+' s','#ff7a5a']);if(S.stone>0)pw.push(['Petrificado','#ffe14a']);else if(S.slow>0)pw.push(['Paralizado','#bfe6ff']);
 const key=pw.map(p=>p[0]).join('|');if(uiC.pw!==key){uiC.pw=key;$('powers').innerHTML='';pw.forEach(([t,c])=>{const s=document.createElement('span');s.className='pw';s.style.color=c;s.textContent=t;$('powers').appendChild(s)})}}

