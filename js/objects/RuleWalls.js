import * as THREE from '../vendor/three.module.js';
import { BookStack } from './BookStack.js';
import { label, line, palette } from './Props.js';
import { smoothstep } from '../utils/easing.js';
export class RuleWalls extends THREE.Group {
  constructor(){super();this.stacks=[];this.cracks=[];const rows=[[-2.5,-1.5,3],[-2.5,.3,4],[1.9,-2,3],[1.9,.1,4],[0,2.3,5],[-.2,-2.8,4]];rows.forEach(([x,z,height],i)=>{for(let k=0;k<2;k++){const stack=new BookStack(height*5,{seed:i*4+k+1});stack.position.set(x+k*.76,0,z);this.add(stack);this.stacks.push(stack);}const title=label(['PRESENT PERFECT','PASSIVE VOICE','CONDITIONAL III','5 лет школы','3 курса','0 практики'][i],{width:2.2,height:.42,color:i<3?'#a0bac5':palette.paper,bg:'#192833',fontSize:31});title.position.set(x+.4,height*.68+.5,z);title.userData.float=true;this.add(title);const crack=line([[x-.15,.4,z-.3],[x+.05,1,z-.3],[x-.04,1.3,z-.3],[x+.3,1.8,z-.3]],palette.orange);crack.visible=false;this.add(crack);this.cracks.push(crack);});}
  update(progress,time){const collapse=smoothstep(.72,1,progress);this.stacks.forEach((stack,i)=>{stack.scale.x=1+Math.sin(time*.6+i)*.014;stack.update(collapse);});this.cracks.forEach(c=>{c.visible=progress>.5&&collapse<.98;c.material.opacity=smoothstep(.5,.7,progress)*(1-collapse);});for(const item of this.children)if(item.userData.float){item.userData.restY??=item.position.y;item.position.y=item.userData.restY+Math.sin(time*.6)*.06;item.material.opacity=1-collapse;}}
}
