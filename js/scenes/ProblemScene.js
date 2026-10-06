import * as THREE from '../vendor/three.module.js';
import { BaseScene } from './BaseScene.js';
import { StudentFigure } from '../objects/StudentFigure.js';
import { RuleWalls } from '../objects/RuleWalls.js';
export class ProblemScene extends BaseScene {
  constructor(){super({index:1,title:'BREAK THE BARRIER.',kicker:'ЛАБИРИНТ ПРАВИЛ',cameraOffset:[7,7,-9],focus:[0,1.35,0],radius:4.6});}
  build(anchor){super.build(anchor);this.floor(4.7,'#303d49');this.walls=new RuleWalls();this.student=new StudentFigure();this.group.add(this.walls,this.student);this.apps=this.caption('2 приложения',[-1,3.45,1.5],'#b2c8db',2.4);this.route=new THREE.CatmullRomCurve3([[-1.5,0,-1.4],[-1.3,0,.8],[.6,0,.8],[.6,0,-1.3],[-1.4,0,-1.4]].map(p=>new THREE.Vector3(...p)),true);const light=new THREE.PointLight('#8db5ff',40,16);light.position.set(0,5,-2);this.group.add(light);this.particles(70,{color:'#8097b1',range:8,height:5,direction:-1,speed:.09,size:.018});return this;}
  update(p,time,delta){super.update(p,time,delta);this.walls.update(p,time);this.apps.material.opacity=1-Math.max(0,(p-.72)/.28);this.apps.position.y=3.45+Math.sin(time*.6)*.06;const t=(time*.035+p*.38)%1;this.student.position.copy(this.route.getPoint(t));const tangent=this.route.getTangent(t);this.student.rotation.y=Math.atan2(tangent.x,tangent.z);this.student.pose('lost',p,time);}
}
