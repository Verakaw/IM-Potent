import * as THREE from '../vendor/three.module.js';
// Instanced sparks move on the GPU, with no per-frame matrix allocations.
export class Particles extends THREE.InstancedMesh {
  constructor(count=130,{color='#c6f24e',range=7,height=4,speed=.25,direction=1,size=.026}={}){
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:{value:0},height:{value:height},speed:{value:speed*direction},color:{value:new THREE.Color(color)},opacity:{value:.7}},vertexShader:'uniform float time;uniform float height;uniform float speed;varying float strength;void main(){vec4 p=instanceMatrix*vec4(position,1.);p.y=mod(p.y+time*speed+height,height);strength=.35+.65*p.y/height;gl_Position=projectionMatrix*modelViewMatrix*p;}',fragmentShader:'uniform vec3 color;uniform float opacity;varying float strength;void main(){gl_FragColor=vec4(color,opacity*strength);}'});
    super(new THREE.OctahedronGeometry(size,0),material,count);this.frustumCulled=false;const dummy=new THREE.Object3D();let state=901;const random=()=>{state=(state*16807)%2147483647;return(state-1)/2147483646;};for(let i=0;i<count;i++){dummy.position.set((random()-.5)*range,random()*height,(random()-.5)*range);dummy.scale.setScalar(.6+random());dummy.updateMatrix();this.setMatrixAt(i,dummy.matrix);}
  }
  update(delta,amount=1){this.material.uniforms.time.value+=delta;this.material.uniforms.opacity.value=amount;}
}
