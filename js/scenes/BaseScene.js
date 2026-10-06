import * as THREE from '../vendor/three.module.js';
import { platform, label, palette } from '../objects/Props.js';
import { Particles } from '../objects/Particles.js';
export class BaseScene {
  constructor(meta){Object.assign(this,meta);this.group=new THREE.Group();this.active=false;this.sparks=[];this.focus=meta.focus||[0,1.15,0];this.cameraOffset=meta.cameraOffset||[7,6,11];this.radius=meta.radius||5.3;}
  build(anchor){this.group.position.copy(anchor);this.anchor=anchor;return this;}
  floor(radius=4.6,color){const floor=platform(radius,color);this.group.add(floor);return floor;}
  caption(text,position=[0,3,0],color=palette.paper,width=3){const plane=label(text,{color,width,height:.65,fontSize:50});plane.position.set(...position);this.group.add(plane);return plane;}
  particles(count,options){const p=new Particles(count,options);this.group.add(p);this.sparks.push(p);return p;}
  update(progress,time,delta){this.sparks.forEach(s=>s.update(delta));}
  onEnter(stage){this.active=true;stage.container.dataset.activeScene=this.index;}
  onLeave(){this.active=false;}
  destroy(){this.onLeave();}
}
