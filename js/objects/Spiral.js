import * as THREE from '../vendor/three.module.js';
import { material } from './Props.js';
export class Spiral extends THREE.Group {
  constructor(anchors){super();this.curve=new THREE.CatmullRomCurve3(anchors.map(a=>a.clone().add(new THREE.Vector3(0,-.25,0))));const path=new THREE.Mesh(new THREE.TubeGeometry(this.curve,144,.13,5,false),material('#65785b',{emissive:'#94b548',emissiveIntensity:.15}));this.add(path);this.path=path;}
}
