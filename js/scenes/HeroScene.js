import * as THREE from '../vendor/three.module.js';
import { BaseScene } from './BaseScene.js';
import { StudentFigure } from '../objects/StudentFigure.js';
import { BookStack } from '../objects/BookStack.js';
import { desk, chair, monitor } from '../objects/Props.js';
export class HeroScene extends BaseScene {
  constructor(){super({index:0,title:"I CAN'T. YET.",kicker:'ДНО / ЗНАНИЯ БЕЗ ПРАКТИКИ',cameraOffset:[5,-.3,-10],focus:[0,1.35,0],radius:3.9});}
  build(anchor){super.build(anchor);this.floor(4.8,'#29343d');this.student=new StudentFigure();this.student.position.z=-1.2;this.student.pose('sit');const seat=chair();seat.position.z=-1.25;this.monitor=monitor();this.group.add(desk(),seat,this.student,this.monitor);this.loose=new BookStack(50,{spread:true});this.group.add(this.loose);this.towers=[];for(const [i,x,z,count] of [[0,-2.6,.8,21],[1,1.7,1.3,26],[2,-3,-1.4,14],[3,2.5,-1.2,17]]){const stack=new BookStack(count,{seed:i+2});stack.position.set(x,0,z);this.group.add(stack);this.towers.push(stack);}const pile=new BookStack(7);pile.scale.setScalar(.8);pile.position.set(.65,1.12,.4);this.group.add(pile);const cold=new THREE.PointLight('#91b7f5',32,13);cold.position.set(-.5,5,-1);cold.castShadow=true;this.group.add(cold);this.particles(65,{color:'#8e9cab',range:7,height:4,direction:-1,speed:.07,size:.016});return this;}
  update(p,time,delta){super.update(p,time,delta);this.student.pose('sit');this.towers.forEach((stack,i)=>stack.rotation.z=Math.sin(time*.65+i)*.012);this.monitor.userData.screen.material.opacity=.78+.2*Math.sin(time*2.1);this.loose.update(Math.max(0,(p-.78)/.22));}
}
