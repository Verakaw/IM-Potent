import * as THREE from '../vendor/three.module.js';
import { BaseScene } from './BaseScene.js';
import { TutorFigure } from '../objects/TutorFigure.js';
import { palette } from '../objects/Props.js';
export class TutorScene extends BaseScene {
  constructor(){super({index:5,title:'YOU ARE NOT ALONE.',kicker:'ОБЗОР ПУТИ / ТРЕНЕР РЯДОМ',cameraOffset:[36,23,64],focus:[0,21,0],radius:24});this.overview=true;}
  build(anchor){super.build(anchor);this.floor(2.1,'#586454');this.tutor=new TutorFigure();this.group.add(this.tutor);this.caption('YOUR COACH',[0,3.1,0],palette.amber,3);const light=new THREE.PointLight(palette.amber,48,10);light.position.set(0,4,-1);this.group.add(light);this.particles(50,{color:palette.amber,range:3,height:4,speed:.2});return this;}
  update(p,time,delta){super.update(p,time,delta);this.tutor.pose('stand');}
}
