import * as THREE from '../vendor/three.module.js';
import { BaseScene } from './BaseScene.js';
import { StudentFigure } from '../objects/StudentFigure.js';
import { TutorFigure } from '../objects/TutorFigure.js';
import { desk,board,microphone,headphones,magnifier,box,beam,growBeam,palette } from '../objects/Props.js';
import { smoothstep } from '../utils/easing.js';
export class ApproachScene extends BaseScene {
  constructor(){super({index:2,title:'BETTER, TOGETHER.',kicker:'ДИАГНОСТИКА · ПЛАН · ПРАКТИКА · РЕЗУЛЬТАТ',cameraOffset:[9,4,-10],focus:[0,1.35,0],radius:5});}
  build(anchor){super.build(anchor);this.floor(5.2,'#424a44');this.student=new StudentFigure();this.student.position.set(-.8,0,-1.05);this.tutor=new TutorFigure();this.tutor.position.set(.95,0,-1.05);this.student.rotation.y=Math.PI/2;this.tutor.rotation.y=-Math.PI/2;this.connection=beam([.7,1.15,-1.05],[-.55,1.15,-1.05],palette.amber);this.group.add(this.student,this.tutor,this.connection);this.zones=[];
    for(let i=0;i<4;i++){const zone=new THREE.Group();zone.position.set([-3,-1,1.3,3.3][i],0,[.6,2.3,2.1,.4][i]);const tile=box([1.4,.06,1.1],palette.amber,[0,.01,0],{emissive:palette.amber,emissiveIntensity:0});zone.add(tile);this.group.add(zone);this.zones.push(tile);if(i===0){const table=desk();table.scale.setScalar(.5);zone.add(table);const glass=magnifier();glass.position.y=.57;zone.add(glass,box([.55,.012,.35],palette.paper,[.12,.55,.12]));}if(i===1){const b=board('YOUR PLAN');b.scale.setScalar(.55);zone.add(b);}if(i===2){const table=desk();table.scale.setScalar(.5);const mic=microphone();mic.scale.setScalar(.7);mic.position.set(-.15,.57,0);const h=headphones();h.position.set(.3,.6,.1);zone.add(table,mic,h);}if(i===3){zone.add(box([.8,.3,.8],palette.amber,[0,.15,0]),box([.035,1.3,.035],palette.paper,[0,.85,0]),box([.45,.3,.045],palette.lime,[.22,1.4,0]));}this.caption(['ДИАГНОСТИКА','ПЛАН','ПРАКТИКА','РЕЗУЛЬТАТ'][i],[zone.position.x,1.8,zone.position.z],palette.amber,1.6);}
    const light=new THREE.PointLight(palette.amber,45,18);light.position.set(1,4,-1);this.group.add(light);this.particles(110,{color:palette.amber,height:5,speed:.23});return this;}
  update(p,time,delta){super.update(p,time,delta);this.student.pose('straighten',smoothstep(.08,.75,p));this.student.updateColor(.3+p*.3);this.tutor.pose('reach',smoothstep(0,.35,p));growBeam(this.connection,smoothstep(0,.6,p));this.connection.scale.x=this.connection.scale.z=.6+p*.7;this.zones.forEach((tile,i)=>{tile.material.emissiveIntensity=p>i*.22?.5:.02;});}
}
