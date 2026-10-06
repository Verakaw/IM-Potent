import * as THREE from './vendor/three.module.js';
import { clamp, easeInOutCubic } from './utils/easing.js';
// Each chapter holds its composition for 72% of the scroll interval.
// Only the final 28% flies to the next height, preserving time to read the scene.
export class CameraRig {
  constructor(camera,scenes){this.camera=camera;this.scenes=scenes;this.target=new THREE.Vector3();}
  key(index,time=0){const scene=this.scenes[index];const target=scene.overview?new THREE.Vector3(...scene.focus):scene.anchor.clone().add(new THREE.Vector3(...scene.focus));const offset=new THREE.Vector3(...scene.cameraOffset);if(scene.overview)offset.applyAxisAngle(new THREE.Vector3(0,1,0),Math.sin(time*.035)*.15);const half=THREE.MathUtils.degToRad(this.camera.fov*.5);const fit=scene.radius/Math.tan(half)/Math.min(1,this.camera.aspect);offset.setLength(Math.max(offset.length(),fit));return {position:target.clone().add(offset),target};}
  update(value,time=0){const base=Math.min(7,Math.floor(clamp(value,0,7)));const fraction=value-base;const amount=base===7?0:easeInOutCubic(clamp((fraction-.72)/.28));const a=this.key(base,time),b=this.key(Math.min(7,base+1),time);this.camera.position.lerpVectors(a.position,b.position,amount);this.target.lerpVectors(a.target,b.target,amount);this.camera.lookAt(this.target);return amount;}
}
