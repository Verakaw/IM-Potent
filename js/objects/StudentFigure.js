import * as THREE from '../vendor/three.module.js';
import { box, cylinder, mesh, palette, material } from './Props.js';
import { lerp } from '../utils/lerp.js';
// Articulated low-poly human: a separate head, torso, arms, knees, and feet.
// Poses are reset on each update so scrolling backwards remains deterministic.
export class StudentFigure extends THREE.Group {
  constructor(color=palette.grey){
    super();this.cloth=material(color);this.startColor=new THREE.Color(palette.grey);this.endColor=new THREE.Color(palette.lime);
    this.hips=new THREE.Group();this.hips.position.y=.94;this.add(this.hips);
    this.body=new THREE.Group();this.hips.add(this.body);
    const torso=new THREE.Mesh(new THREE.CylinderGeometry(.34,.26,.82,6),this.cloth);torso.position.y=.43;torso.castShadow=true;this.body.add(torso);
    this.neck=new THREE.Group();this.neck.position.y=.98;this.body.add(this.neck);
    this.neck.add(mesh(new THREE.IcosahedronGeometry(.235,0),'#cecdc5',[0,.08,0]),box([.37,.09,.3],'#303739',[0,.25,-.03]));
    this.arms=[];this.elbows=[];this.legs=[];this.knees=[];
    for(const sign of [-1,1]){
      const shoulder=new THREE.Group();shoulder.position.set(sign*.36,.75,0);const sleeve=new THREE.Mesh(new THREE.CylinderGeometry(.105,.09,.43,6),this.cloth);sleeve.position.y=-.2;shoulder.add(sleeve);
      const elbow=new THREE.Group();elbow.position.y=-.4;elbow.add(cylinder(.075,.4,'#b9bab3',[0,-.19,0],6),mesh(new THREE.IcosahedronGeometry(.095,0),'#cecdc5',[0,-.4,0]));shoulder.add(elbow);this.body.add(shoulder);this.arms.push(shoulder);this.elbows.push(elbow);
      const hip=new THREE.Group();hip.position.x=sign*.15;hip.add(cylinder(.125,.48,'#343e43',[0,-.23,0],6));const knee=new THREE.Group();knee.position.y=-.46;knee.add(cylinder(.105,.44,'#343e43',[0,-.21,0],6),box([.24,.13,.4],'#222b30',[0,-.4,.09]));hip.add(knee);this.hips.add(hip);this.legs.push(hip);this.knees.push(knee);
    }
    this.pose('stand');
  }
  pose(name='stand',progress=0,time=0){
    this.hips.position.y=.94;this.body.rotation.set(0,0,0);this.neck.rotation.set(0,0,0);this.arms.forEach(a=>a.rotation.set(0,0,0));this.elbows.forEach(a=>a.rotation.set(0,0,0));this.legs.forEach(a=>a.rotation.set(0,0,0));this.knees.forEach(a=>a.rotation.set(0,0,0));
    if(name==='sit'){this.hips.position.y=.65;this.body.rotation.x=.42;this.neck.rotation.x=.25;this.legs.forEach(a=>a.rotation.x=-1.48);this.knees.forEach(a=>a.rotation.x=1.48);this.arms.forEach(a=>a.rotation.x=-1.05);this.elbows.forEach(a=>a.rotation.x=.45);}
    if(name==='lost'){this.body.rotation.x=.12;this.neck.rotation.z=.16;this.arms[0].rotation.z=-.55;this.arms[1].rotation.z=.55;this.elbows.forEach(a=>a.rotation.x=-.5);this.walk(time,.18);}
    if(name==='straighten'){this.body.rotation.x=lerp(.28,0,progress);this.neck.rotation.x=lerp(.2,0,progress);this.arms[0].rotation.z=-.12;this.arms[1].rotation.z=.12;}
    if(name==='walk')this.walk(time,.42);
    if(name==='reach'){this.arms[1].rotation.x=-1.05*progress;this.elbows[1].rotation.x=-.2;}
    if(name==='point'){this.arms[1].rotation.z=1.12;this.arms[1].rotation.x=-.45;this.elbows[1].rotation.z=.22;}
  }
  walk(time,amount){const swing=Math.sin(time*3.2)*amount;this.legs[0].rotation.x=swing;this.legs[1].rotation.x=-swing;this.knees[0].rotation.x=Math.max(0,-swing)*.65;this.knees[1].rotation.x=Math.max(0,swing)*.65;this.hips.position.y+=Math.abs(Math.sin(time*3.2))*.025;}
  updateColor(progress){this.cloth.color.lerpColors(this.startColor,this.endColor,progress);this.cloth.emissive.copy(this.endColor);this.cloth.emissiveIntensity=progress*.1;}
}
