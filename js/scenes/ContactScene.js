import * as THREE from '../vendor/three.module.js';
import { BaseScene } from './BaseScene.js';
import { StudentFigure } from '../objects/StudentFigure.js';
import { TutorFigure } from '../objects/TutorFigure.js';
import { palette,line } from '../objects/Props.js';
import { smoothstep } from '../utils/easing.js';
export class ContactScene extends BaseScene {
  constructor(){super({index:7,title:"I'M POTENT.",kicker:'ВЕРШИНА / ТВОЯ СЛЕДУЮЩАЯ ГЛАВА',cameraOffset:[5,-.7,-10],focus:[0,1.7,0],radius:4.1});}
  build(anchor){super.build(anchor);this.floorMesh=this.floor(3.8,palette.lime);this.floorMesh.material.emissive.set(palette.lime);this.student=new StudentFigure();this.student.scale.setScalar(1.3);this.student.updateColor(1);this.student.cloth.emissiveIntensity=.2;this.tutor=new TutorFigure();this.tutor.position.set(1.2,0,1.05);this.group.add(this.student,this.tutor);this.titlePlane=this.caption("I'M POTENT",[0,3.45,.1],palette.lime,4.1);for(let i=0;i<7;i++){const a=i*Math.PI/3.5;this.group.add(line([[Math.cos(a)*3,0,Math.sin(a)*3],[Math.cos(a)*3.2,5,Math.sin(a)*3.2]],'#88ab47'));}this.particles(280,{color:palette.lime,range:8,height:7,speed:.8,size:.029});const positions=[];for(let i=0;i<130;i++){const a=i*2.39;positions.push(Math.cos(a)*(7+i%4),2+i%13*.45,Math.sin(a)*(7+i%4));}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));this.group.add(new THREE.Points(geo,new THREE.PointsMaterial({color:'#c9dcc0',size:.045,sizeAttenuation:true})));const warm=new THREE.PointLight(palette.amber,55,17);warm.position.set(0,5,-3);this.group.add(warm);return this;}
  update(p,time,delta){super.update(p,time,delta);this.student.pose('stand');this.student.rotation.y=Math.sin(time*.2)*.14;const fade=smoothstep(.7,1,p);this.tutor.position.x=1.2+fade*1.8;this.tutor.setPresence(1-fade);this.titlePlane.material.opacity=.9+Math.sin(time*.7)*.08;this.floorMesh.material.emissiveIntensity=.17+Math.sin(time*.6)*.025;}
}
