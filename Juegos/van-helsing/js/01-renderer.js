/* Van Helsing · Renderizador, cámara, calidad gráfica y post-procesado */
/* ---------- renderer ---------- */
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:!isTouch,powerPreference:'high-performance'});
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const ANISO=Math.min(8,renderer.capabilities&&renderer.capabilities.getMaxAnisotropy?renderer.capabilities.getMaxAnisotropy():1);
let PRMAX=1,curPR=1;
function setPR(v){curPR=v;renderer.setPixelRatio(v);if(typeof sizePost==='function')sizePost()}
function applyQuality(){HIGH=QL!=='baja';renderer.shadowMap.enabled=HIGH;PRMAX=Math.min(devicePixelRatio||1,QL==='alta'?(isTouch?1.6:1.75):QL==='media'?1.3:1);setPR(PRMAX);if(typeof setupPost==='function')setupPost()}
const GRADE={uniforms:{tDiffuse:{value:null},uTime:{value:0}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:'uniform sampler2D tDiffuse;uniform float uTime;varying vec2 vUv;float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}void main(){vec4 c=texture2D(tDiffuse,vUv);vec3 col=c.rgb;float l=dot(col,vec3(.299,.587,.114));vec3 a_=col*1.06;vec3 tm=(a_*(2.51*a_+.03))/(a_*(2.43*a_+.59)+.14);col=mix(col,tm,.5);l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,1.15);col=(col-.5)*1.07+.5;col+=vec3(.012,0.,.02)*(1.-l);float d=distance(vUv,vec2(.5));col*=mix(.62,1.,smoothstep(.85,.32,d));col+=(h(vUv*731.+uTime)-.5)*.022;gl_FragColor=vec4(max(col,0.),c.a);}'};
let composer=null,bloom=null,grade=null,fxaa=null;
function setupPost(){composer=null;if(QL==='baja'||!THREE.EffectComposer||!THREE.UnrealBloomPass||!THREE.ShaderPass)return;
 try{composer=new THREE.EffectComposer(renderer);composer.addPass(new THREE.RenderPass(scene,camera));
  bloom=new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.55,.45,.95);composer.addPass(bloom);
  fxaa=null;if(THREE.FXAAShader&&QL==='alta'){fxaa=new THREE.ShaderPass(THREE.FXAAShader);composer.addPass(fxaa)}
  grade=new THREE.ShaderPass(GRADE);composer.addPass(grade);sizePost()}catch(e){composer=null}}
function sizePost(){if(!composer)return;const pr=renderer.getPixelRatio();composer.setPixelRatio(pr);composer.setSize(innerWidth,innerHeight);if(fxaa)fxaa.material.uniforms.resolution.value.set(1/(innerWidth*pr),1/(innerHeight*pr))}
function draw(t){if(composer){grade.uniforms.uTime.value=t%100;composer.render()}else renderer.render(scene,camera)}
applyQuality();
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(72,1,.05,700);camera.rotation.order='YXZ';scene.add(camera);
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(typeof sizePost==='function')sizePost()}
addEventListener('resize',resize);resize();

