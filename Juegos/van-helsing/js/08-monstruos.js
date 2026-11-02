/* Van Helsing · Estadísticas de monstruos, jefes y mapas */
/* ---------- monsters ---------- */
const hx=c=>'#'+c.toString(16).padStart(6,'0');
const TYPES={
 fantasma:{name:'Fantasma',hp:55,speed:3.3,dmg:7,h:2.1,hr:.7,r:.5,fly:.6,blood:0xbfe6ff,taunts:['¡Buuu! ¿Te asusté, Van Helsing?','Te vas a quedar aquí conmigo para siempre']},
 espiritu:{name:'Espíritu',hp:30,speed:5.2,dmg:5,h:.6,hr:.55,r:.35,fly:1.4,blood:0x7fe0c4,taunts:['Shhh... ya estás muerto y no lo sabes','Ven... sigue la lucecita...']},
 chupacabras:{name:'Chupacabras',hp:60,speed:6.2,dmg:9,h:1.3,hr:.7,r:.55,blood:0x7a0d0d,atk:.8,taunts:['¡Grrsss! Huele a sangre fresca','Hoy no quiero cabra, quiero cazador']},
 momia:{name:'Momia',hp:170,speed:1.7,dmg:16,h:1.8,hr:.65,r:.5,blood:0xcdbb90,atk:1.4,taunts:['Mmmhhh... tres mil años esperando esto','¡Profanaste mi tumba!']},
 bruja:{name:'Bruja',hp:70,speed:3.6,dmg:8,h:2,hr:.8,r:.5,fly:3,blood:0x6fae4a,melee:false,ranged:{rate:2.4,speed:13,dmg:9,color:0x8dff5a},sound:'cackle',taunts:['¡Jajaja! Te voy a volver sapo','Mi escoba vuela más que tus balas']},
 demonio:{name:'Demonio',hp:115,speed:2.7,dmg:13,h:2.4,hr:.85,r:.65,blood:0xff5a1a,ranged:{rate:3,speed:15,dmg:11,color:0xff4a1a},taunts:['¡Tu alma es mía, gusano!','¡Arderás conmigo!']},
 nahual:{name:'Nahual',hp:95,speed:5.4,dmg:12,h:1.6,hr:.75,r:.6,blood:0x7a0d0d,atk:.9,sound:'howl',taunts:['De día fui tu vecino, de noche tu pesadilla','¡Auuuu! Ya te olí']},
 llorona:{name:'La Llorona',hp:95,speed:2.9,dmg:11,h:1.9,hr:.65,r:.5,fly:.3,blood:0xbfe6ff,sound:'scream',ranged:{rate:3.4,speed:11,dmg:9,color:0xbfe6ff},taunts:['¡Aaay, mis hijooos!','¿Has visto a mis hijos?']},
 patasola:{name:'La Patasola',hp:85,speed:4.8,dmg:14,h:1.8,hr:.6,r:.5,blood:0x7a0d0d,atk:1,taunts:['¡Con una sola pata te alcanzo!','Ni corriendo te salvas, mijo']},
 silbon:{name:'El Silbón',hp:160,speed:2.5,dmg:19,h:3.6,hr:.95,r:.6,blood:0x7a0d0d,atk:1.5,sound:'whistle',taunts:['Fiu fiu fiuuu... si me oyes cerca, estoy lejos','Me falta un hueso para el costal... el tuyo']},
 madremonte:{name:'La Madremonte',hp:200,speed:2.6,dmg:16,h:2.2,hr:.8,r:.6,blood:0x4a7a2a,taunts:['¡Fuera de mi monte!']},
 vampiro:{name:'Vampiro',hp:90,speed:4.1,dmg:10,h:1.85,hr:.65,r:.5,blood:0x8a0a14,drain:true,taunts:['¡Tu sangre huele deliciosa!','La noche es nuestra, mortal','El Conde te manda saludos']},
 dracula:{name:'Conde Drácula',hp:300,speed:3.4,dmg:16,h:2.05,hr:.7,r:.55,blood:0x8a0a14,drain:true,taunts:['Escucha a los hijos de la noche... ¡qué música hacen!']},
 murcielago:{name:'Murciélago',hp:24,speed:7,dmg:5,h:.6,hr:.5,r:.35,fly:2.6,diver:true,blood:0x5a0a10,atk:.7,sound:'bats',taunts:['¡Iiik iiik!']},
 lobo:{name:'Hombre lobo',hp:130,speed:5.9,dmg:14,h:2,hr:.8,r:.6,blood:0x7a0d0d,atk:.85,sound:'howl',taunts:['¡Grrr! La luna llena me hace más fuerte','¡Auuuu! Corre, Van Helsing']},
 esqueleto:{name:'Esqueleto',hp:50,speed:3.5,dmg:8,h:1.8,hr:.6,r:.45,blood:0xe6dcc4,taunts:['*clac clac* Te faltan huesos, cazador','Pronto serás como yo']},
 espartano:{name:'Espartano no muerto',hp:75,speed:3.6,dmg:10,h:1.9,hr:.62,r:.45,blood:0xe6dcc4,taunts:['Ni la muerte me quitó el escudo','¡Al Hades contigo!']},
 gargola:{name:'Gárgola',hp:85,speed:4.2,dmg:11,h:1.8,hr:.7,r:.5,fly:3.2,diver:true,blood:0x6a6c70,taunts:['Me aburrí de ser estatua','Piedra contra plata, veamos']},
 harpia:{name:'Harpía',hp:60,speed:5,dmg:9,h:1.8,hr:.65,r:.5,fly:3.5,diver:true,blood:0x8a6a3e,sound:'hiss',taunts:['¡Te arranco el sombrero!','Plumas y garras, cazador']},
 minotauro:{name:'Minotauro',hp:220,speed:3.4,dmg:20,h:2.6,hr:.95,r:.7,blood:0x7a0d0d,atk:1.4,charge:true,sound:'moo',taunts:['¡Te perdiste en mi laberinto!','¡MUUUGRRR!']},
 ciclope:{name:'Cíclope',hp:260,speed:2.2,dmg:22,h:3.4,hr:1.1,r:.8,blood:0x7a0d0d,atk:1.6,ranged:{rate:3.6,speed:14,dmg:16,color:0x8a8478,big:true},taunts:['Te veo... con mi único ojo','¡Aplastar humano!']},
 centauro:{name:'Centauro',hp:110,speed:5,dmg:10,h:2.4,hr:.8,r:.6,blood:0x7a0d0d,melee:false,ranged:{rate:1.8,speed:26,dmg:9,color:0xe8d0a0},taunts:['Mis flechas no fallan','Corre, que yo galopo']},
 medusa:{name:'Medusa',hp:120,speed:2.4,dmg:12,h:1.9,hr:.65,r:.5,blood:0x3f6a3a,sound:'hiss',ranged:{rate:3,speed:12,dmg:8,color:0xffe14a,petrify:true},taunts:['Mírame a los ojos, cazador','Serás otra estatua de mi jardín']},
 cerbero:{name:'Cerbero',hp:200,speed:5,dmg:14,h:1.8,hr:.9,r:.75,blood:0x7a0d0d,atk:1,ranged:{rate:3.2,speed:14,dmg:9,color:0xff4a1a,count:3},sound:'howl',taunts:['¡GRRR! ¡GRRR! ¡GRRR!','Tres bocas y todas con hambre']},
 escarabajo:{name:'Escarabajo',hp:18,speed:6.5,dmg:4,h:.4,hr:.42,r:.3,blood:0x1a3a5a,atk:.6,swarm:3,taunts:['*crrrk crrrk*']},
 anubis:{name:'Guardián chacal',hp:150,speed:3.6,dmg:15,h:2.2,hr:.75,r:.55,blood:0x15151a,ranged:{rate:3.2,speed:16,dmg:11,color:0xffcf4a},taunts:['Pesaré tu corazón en mi balanza','Los muertos me pertenecen']},
 hidra:{name:'La Hidra',hp:300,speed:2.2,dmg:18,h:3.4,hr:1.6,r:1.3,blood:0x2f5a3a,taunts:['¡SSSSS!']}
};
Object.entries({vampiro:[4,.1],lobo:[4,.14],dracula:[4,.3],silbon:[4,.15],demonio:[5,.12],cerbero:[5,.25],bruja:[5,.07],nahual:[5,.06],ciclope:[6,.3],centauro:[6,.12],minotauro:[6,.2],harpia:[6,.06],anubis:[7,.22],momia:[7,.08],gargola:[7,.12],esqueleto:[3,.05],espartano:[3,.06]}).forEach(([k,v])=>TYPES[k].drop=v);
const DRACULA={name:'Conde Drácula',type:'dracula',k:1.9,fly:0,color:0xff1a2a,summon:'murcielago',special:'dracula',hpMul:1.25,line:'Bienvenido a mi casa, Van Helsing. Entre libremente y por su propia voluntad.'};
const MAPS={
 cementerio:{name:'Cementerio de San Lázaro',sub:'Colombia · medianoche',desc:'Tumbas, mausoleos, ángeles de piedra y una iglesia en ruinas.',
  sky:['#03050b','#1a2536','#0d131c'],fog:[0x101826,.02],ground:['grass','#1d2a1b','#2f4024'],hill:.55,hemi:[0x5a6c9a,0x1a1410,.55],key:[0xa9bcff,.8,[-.6,.75,-.8]],flash:1.4,moon:[0xe8ecf5,7,[-110,80,-150]],stars:true,amb:['mist'],
  build:mapCementerio,pool:[['fantasma',1],['espiritu',1],['chupacabras',1],['esqueleto',2],['momia',2],['bruja',3],['demonio',4],['nahual',4],['llorona',5],['patasola',5],['vampiro',6],['silbon',7]],
  bosses:[{name:'Lucifer, el Diablo Mayor',type:'demonio',k:2.6,fly:0,color:0xff5a1a,summon:'demonio',line:'¡Arrodíllate ante el Diablo Mayor!'},{name:'La Reina de las Brujas',type:'bruja',k:2.3,fly:7,color:0x8dff5a,summon:'espiritu',line:'¡Hermanas, a la cacería! ¡Jajajaja!'},DRACULA]},
 castillo:{name:'Castillo de Drácula',sub:'Transilvania · luna de sangre',desc:'Murallas, torres, ataúdes y una fuente de sangre. El Conde te espera.',
  sky:['#060208','#3a0d16','#140608'],fog:[0x1c0a12,.019],ground:['tiles','#3c383a','#1c191a'],hill:.9,hemi:[0x7a4a6a,0x140a0c,.5],key:[0xff8a7a,.7,[.4,.6,-.9]],flash:1.3,moon:[0xff5a4a,8,[60,70,-160]],stars:true,amb:['embers','mist'],
  build:mapCastillo,pool:[['murcielago',1],['vampiro',1],['lobo',1],['esqueleto',1],['lobo',2],['fantasma',2],['gargola',3],['lobo',3],['bruja',4],['demonio',6]],
  bosses:[DRACULA,{name:'El Lobo Alfa',type:'lobo',k:2.3,fly:0,color:0xffcf2a,summon:'lobo',special:'charge',line:'¡La manada obedece a su alfa!'},{name:'La Gárgola Ancestral',type:'gargola',k:2.6,fly:5,color:0xff8a3a,summon:'murcielago',line:'Mil años vigilando este castillo. Se acabó tu visita.'}]},
 olimpo:{name:'Ruinas del Olimpo',sub:'Grecia · atardecer eterno',desc:'Templo de mármol, braseros, olivos y estatuas de hoplitas.',
  sky:['#2a1a3e','#f09a5a','#6a4a50'],fog:[0x7a5a6a,.013],ground:['grass','#5a5a32','#3f4a26'],hill:1.1,hemi:[0xffc9a0,0x3a2a3a,.75],key:[0xffb070,1.25,[.7,.35,-.6]],flash:0,moon:[0xffd08a,10,[130,40,-120]],stars:false,amb:['dust'],
  build:mapOlimpo,pool:[['espartano',1],['harpia',1],['centauro',2],['minotauro',3],['medusa',4],['ciclope',5],['cerbero',6]],
  bosses:[{name:'El Minotauro',type:'minotauro',k:2.1,fly:0,color:0xff6a3a,summon:'espartano',special:'charge',line:'¡Nadie sale vivo de mi laberinto!'},{name:'Medusa la Gorgona',type:'medusa',k:2.4,fly:0,color:0xffe14a,summon:'harpia',special:'petrify',line:'Mírame... y quédate quieto para siempre.'},{name:'La Hidra de Lerna',type:'hidra',k:2,fly:0,color:0x8dff5a,summon:'espartano',special:'regen',hpMul:1.3,line:'Corta una cabeza y saldrán dos.'},{name:'Cerbero, guardián del Hades',type:'cerbero',k:2.4,fly:0,color:0xff4a1a,summon:'espartano',line:'¡GRRR! Nadie escapa del Hades.'}]},
 egipto:{name:'Valle de los Reyes',sub:'Egipto · noche de arena',desc:'Pirámides, obeliscos dorados, una esfinge y un oasis con palmeras.',
  sky:['#070a1c','#4a3a5c','#2a2030'],fog:[0x3a3040,.013],ground:['sand','#b8946a','#8a6a42'],hill:.7,hemi:[0x7a8aba,0x4a3a2a,.6],key:[0xc8d4ff,.85,[-.5,.7,-.7]],flash:1,moon:[0xf0eee0,9,[-80,90,-150]],stars:true,amb:['sand'],
  build:mapEgipto,pool:[['escarabajo',1],['momia',1],['esqueleto',2],['anubis',3],['fantasma',3],['demonio',6]],
  bosses:[{name:'El Faraón Maldito',type:'momia',k:2.8,fly:0,color:0x7dff6a,summon:'escarabajo',line:'La maldición del faraón cae sobre ti.'},{name:'Anubis',type:'anubis',k:2.4,fly:0,color:0xffcf4a,summon:'momia',line:'Pesaré tu corazón contra una pluma.'}]},
 llanos:{name:'Llanos del Silbón',sub:'Colombia y Venezuela · luna llena',desc:'Ceibas, ranchos, un río, el corral y una fogata en medio del llano.',
  sky:['#02050a','#173038','#0a1414'],fog:[0x0f1e20,.02],ground:['grass','#24361d','#34502a'],hill:.4,hemi:[0x5a7a8a,0x14180c,.55],key:[0xcfe0ff,.8,[.3,.8,-.7]],flash:1.2,moon:[0xf4f2e4,9,[40,95,-150]],stars:true,amb:['fireflies','mist'],
  build:mapLlanos,pool:[['chupacabras',1],['espiritu',1],['nahual',1],['patasola',2],['llorona',3],['silbon',4],['bruja',5]],
  bosses:[{name:'La Madremonte',type:'madremonte',k:2.4,fly:0,color:0xd7ff4a,summon:'nahual',line:'¡Nadie quema mi monte y sale vivo!'},{name:'El Silbón Gigante',type:'silbon',k:1.9,fly:0,color:0xe8f4ff,summon:'espiritu',line:'Fiu fiu fiuuu... ya estoy cerca.'}]}
};

