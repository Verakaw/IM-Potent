import * as THREE from './vendor/three.module.js';
import { CameraRig } from './CameraRig.js';
import { Spiral } from './objects/Spiral.js';
import { HeroScene } from './scenes/HeroScene.js';
import { ProblemScene } from './scenes/ProblemScene.js';
import { ApproachScene } from './scenes/ApproachScene.js';
import { ProgramsScene } from './scenes/ProgramsScene.js';
import { ProgressScene } from './scenes/ProgressScene.js';
import { TutorScene } from './scenes/TutorScene.js';
import { PricingScene } from './scenes/PricingScene.js';
import { ContactScene } from './scenes/ContactScene.js';
import { clamp, easeInOutCubic } from './utils/easing.js';
export class Scene3D {
  constructor(container){
    Object.assign(this,{container,value:0,index:-1,progress:0,visible:true,raf:0,lastTime:0,clock:0,destroyed:false,state:{program:'it',format:'individual'}});
    this.motionPreference=matchMedia('(prefers-reduced-motion: reduce)');this.paused=this.motionPreference.matches;
    this.scenes=[new HeroScene(),new ProblemScene(),new ApproachScene(),new ProgramsScene(),new ProgressScene(),new TutorScene(),new PricingScene(),new ContactScene()];
    this.canvas=container.querySelector('canvas');this.fallback=container.querySelector('img');
    try{this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});}catch{this.useFallback();this.setScene(0);return;}
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.12;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#11191e');this.scene.fog=new THREE.FogExp2('#101820',.03);this.camera=new THREE.PerspectiveCamera(38,1,.1,250);
    this.ambient=new THREE.AmbientLight('#bed2dc',1.35);this.scene.add(this.ambient);
    this.key=new THREE.DirectionalLight('#a5c8ff',2);this.key.castShadow=true;this.key.shadow.mapSize.set(1024,1024);Object.assign(this.key.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.1,far:100});this.key.shadow.bias=-.001;this.scene.add(this.key,this.key.target);
    this.cold=new THREE.Color('#a5c8ff');this.warm=new THREE.Color('#ffe6b6');this.world=new THREE.Group();this.scene.add(this.world);
    this.anchors=this.scenes.map((_,i)=>new THREE.Vector3(Math.cos(i*1.78)*6.2,i*5.6,Math.sin(i*1.78)*6.2));
    this.scenes.forEach((scene,i)=>{scene.build(this.anchors[i]);this.world.add(scene.group);});this.spiral=new Spiral(this.anchors);this.world.add(this.spiral);this.cameraRig=new CameraRig(this.camera,this.scenes);
    // Height-dependent haze keeps the bottom foggy in the overview while the summit is clear.
    this.heightFog={value:0};this.world.traverse(object=>{const mat=object.material;if(mat?.isMeshStandardMaterial&&!mat.userData.heightFog){mat.userData.heightFog=true;mat.onBeforeCompile=shader=>{shader.uniforms.journeyFog=this.heightFog;shader.vertexShader='varying float journeyHeight;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvec4 journeyWorld=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\njourneyWorld=instanceMatrix*journeyWorld;\n#endif\njourneyHeight=(modelMatrix*journeyWorld).y;');shader.fragmentShader='uniform float journeyFog;varying float journeyHeight;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <fog_fragment>','#include <fog_fragment>\nfloat lowHaze=(1.0-smoothstep(0.0,15.0,journeyHeight))*journeyFog*0.58;gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(0.045,0.067,0.083),lowHaze);');};mat.customProgramCacheKey=()=> 'journey-height-fog';}});
    this.billboards=[];this.world.traverse(object=>{if(object.userData.billboard)this.billboards.push(object);});this.parentRotation=new THREE.Quaternion();
    this.resize=()=>{if(this.destroyed)return;const {width,height}=container.getBoundingClientRect();if(!width||!height)return;this.camera.aspect=width/height;this.camera.fov=innerWidth<=800?52:38;this.camera.updateProjectionMatrix();this.renderer.setSize(width,height,false);this.update(0);this.renderOnce();};
    this.resizeObserver=new ResizeObserver(this.resize);this.resizeObserver.observe(container);
    this.intersection=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.reconcile();});this.intersection.observe(container);
    this.onVisibility=()=>this.reconcile();document.addEventListener('visibilitychange',this.onVisibility);
    this.onMotion=e=>{this.paused=e.matches;this.reconcile();};this.motionPreference.addEventListener('change',this.onMotion);
    this.onLoss=e=>{e.preventDefault();this.useFallback();};this.canvas.addEventListener('webglcontextlost',this.onLoss);
    this.onRestore=()=>{this.failed=false;this.canvas.hidden=false;this.fallback.hidden=true;this.resize();this.reconcile();};this.canvas.addEventListener('webglcontextrestored',this.onRestore);
    this.frame=time=>{this.raf=0;if(this.shouldAnimate()){if(!this.lastTime||time-this.lastTime>=32){const delta=Math.min(.05,(time-(this.lastTime||time))/1000);this.lastTime=time;this.clock+=delta;this.update(delta);this.renderOnce();}this.raf=requestAnimationFrame(this.frame);}};
    this.setScene(0);this.resize();this.reconcile();
  }
  setScene(value){
    this.previewState=null;this.value=clamp(value,0,7);this.progress=this.value/7;const base=Math.floor(this.value);const fraction=this.value-base;const index=Math.min(7,base+(fraction>.86?1:0));
    if(index!==this.index){this.scenes[this.index]?.onLeave();this.index=index;this.enterTime=this.clock;this.scenes[index].onEnter(this);}
    if(!this.renderer||this.failed){this.fallback.src=new URL(`../assets/ascent-${index}.png`,import.meta.url).href;return;}
    this.update(0);this.renderOnce();
  }
  update(delta){
    if(!this.renderer||this.failed||this.destroyed)return;
    const base=this.previewState?.index??Math.floor(this.value),fraction=this.value-base;
    const local=this.previewState?.progress??(this.motionPreference.matches?.55:(base===7?clamp((this.clock-(this.enterTime||0))/9):clamp(fraction/.72)));
    const time=this.previewState?.time??this.clock,finalPullback=base===7?easeInOutCubic(clamp((local-.8)/.2)):0,overview=base===5||this.index===5||finalPullback>.02;
    const transition=base===7?0:easeInOutCubic(clamp((fraction-.72)/.28));
    this.state.instant=this.paused||Boolean(this.previewState);this.scenes.forEach((scene,i)=>{scene.group.visible=overview||i===base||(transition>0&&i===base+1);if(scene.group.visible)scene.update(i===base?local:(overview?.48:0),time,delta,this.state);});
    this.spiral.visible=overview||transition>.05;this.cameraRig.update(this.previewState?base:this.value,time);
    if(base===4&&!overview){const lead=this.scenes[4].student.position.clone().multiplyScalar(.45);this.camera.position.add(lead);this.cameraRig.target.add(lead);this.camera.lookAt(this.cameraRig.target);}
    if(base===6&&!overview){const level=this.scenes[6].levels.find(l=>l.key===this.state.format);const emphasis=level.g.position.clone().sub(new THREE.Vector3(0,2.25,0)).multiplyScalar(.23);this.camera.position.add(emphasis);this.cameraRig.target.add(emphasis);this.camera.lookAt(this.cameraRig.target);}
    if(finalPullback){const key=this.cameraRig.key(5,time);this.camera.position.lerp(key.position,finalPullback);this.cameraRig.target.lerp(key.target,finalPullback);this.camera.lookAt(this.cameraRig.target);}this.heightFog.value=overview?1:0;
    const fog=[.035,.033,.019,.013,.009,.004,.008,0];this.scene.fog.density=overview?.004:fog[base]+(fog[Math.min(7,base+1)]-fog[base])*transition;
    this.scene.background.set(base<2?'#0a0a0f':'#141b1b');this.scene.fog.color.copy(this.scene.background);this.ambient.intensity=base<2?.95:(1.4-finalPullback*.2);
    this.key.color.lerpColors(this.cold,this.warm,clamp(this.value/4));this.key.intensity=base<2?1.4:2.5;
    this.key.target.position.copy(this.cameraRig.target);this.key.position.copy(this.cameraRig.target).add(new THREE.Vector3(-5,10,-8));
    this.world.updateMatrixWorld(true);for(const label of this.billboards){label.parent.getWorldQuaternion(this.parentRotation);label.quaternion.copy(this.parentRotation.invert()).multiply(this.camera.quaternion);}
    // The fade uses scroll progress, so stopping or reversing scroll never leaves a black screen.
    this.container.style.opacity=this.motionPreference.matches?'1':String(1-Math.sin(transition*Math.PI)*.42);
  }
  preview(index,progress=.5,time=0){this.setScene(index);this.previewState={index,progress,time};this.update(0);this.renderOnce();}
  setProgram(key){this.state.program=key;this.update(0);this.renderOnce();}
  setFormat(key){this.state.format=key;this.update(0);this.renderOnce();}
  shouldAnimate(){return this.renderer&&!this.failed&&!this.paused&&this.visible&&!document.hidden&&!this.destroyed;}
  renderOnce(){if(this.renderer&&!this.failed&&!this.destroyed&&this.visible&&!document.hidden)this.renderer.render(this.scene,this.camera);}
  reconcile(){cancelAnimationFrame(this.raf);this.raf=0;this.lastTime=0;if(this.shouldAnimate())this.raf=requestAnimationFrame(this.frame);else{this.update(0);this.renderOnce();}}
  toggleMotion(){this.paused=!this.paused;this.reconcile();return this.paused;}
  useFallback(){this.failed=true;cancelAnimationFrame(this.raf);this.raf=0;this.canvas.hidden=true;this.fallback.hidden=false;this.fallback.src=new URL(`../assets/ascent-${Math.max(0,this.index)}.png`,import.meta.url).href;}
  destroy(){
    this.destroyed=true;cancelAnimationFrame(this.raf);this.raf=0;this.resizeObserver?.disconnect();this.intersection?.disconnect();document.removeEventListener('visibilitychange',this.onVisibility);if(this.onMotion)this.motionPreference.removeEventListener('change',this.onMotion);if(this.onLoss)this.canvas.removeEventListener('webglcontextlost',this.onLoss);if(this.onRestore)this.canvas.removeEventListener('webglcontextrestored',this.onRestore);this.scenes.forEach(s=>s.destroy());
    const disposed=new Set();const dispose=resource=>{if(resource&&!disposed.has(resource)){resource.dispose();disposed.add(resource);}};
    this.scene?.traverse(object=>{dispose(object.geometry);for(const mat of Array.isArray(object.material)?object.material:[object.material])if(mat){for(const value of Object.values(mat))if(value instanceof THREE.Texture)dispose(value);dispose(mat);}if(object.isInstancedMesh)object.dispose();if(object.isLight)object.shadow?.dispose();});this.renderer?.dispose();this.renderer?.forceContextLoss();
  }
}
