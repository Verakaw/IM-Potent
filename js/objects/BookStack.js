import * as THREE from '../vendor/three.module.js';
import { material, palette } from './Props.js';
// Every stack is one draw call; collapsing books reuse the existing instance buffer.
export class BookStack extends THREE.Group {
  constructor(count=14,{spread=false,seed=1,color=null}={}){
    super();this.bookMaterial=material('#ffffff',{transparent:true});this.books=new THREE.InstancedMesh(new THREE.BoxGeometry(.76,.13,.54),this.bookMaterial,count);this.books.castShadow=true;this.books.receiveShadow=true;this.pagesMaterial=material('#d8d9cc',{transparent:true});this.pages=new THREE.InstancedMesh(new THREE.BoxGeometry(.7,.078,.49),this.pagesMaterial,count);this.pages.instanceMatrix=this.books.instanceMatrix;this.add(this.books,this.pages);this.rest=[];this.dummy=new THREE.Object3D();
    const colors=[palette.paper,'#778782','#4c6868','#8d7257','#aaa490'];let state=seed;const random=()=>{state=(state*16807)%2147483647;return(state-1)/2147483646;};
    for(let i=0;i<count;i++){this.rest.push({x:spread?(random()-.5)*7.6:(random()-.5)*.12,y:spread?.05: i*.135,z:spread?(random()-.5)*6.4:(random()-.5)*.1,angle:spread?random()*6.28:(random()-.5)*.15});this.books.setColorAt(i,new THREE.Color(color||colors[i%colors.length]));}
    this.update(0);
  }
  update(collapse=0){this.rest.forEach((p,i)=>{const fall=collapse*(.5+(i%5)*.12);this.dummy.position.set(p.x+Math.sin(i*2)*fall,p.y*(1-collapse)-fall*.1,p.z+Math.cos(i)*fall);this.dummy.rotation.set(fall*(i%2?1:-1),p.angle,fall*.8);this.dummy.updateMatrix();this.books.setMatrixAt(i,this.dummy.matrix);});this.books.instanceMatrix.needsUpdate=true;this.bookMaterial.opacity=this.pagesMaterial.opacity=1-collapse;this.books.computeBoundingSphere();this.pages.computeBoundingSphere();}
}
