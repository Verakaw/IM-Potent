import * as THREE from '../vendor/three.module.js';
export const palette = { lime:'#c6f24e', amber:'#f5c77e', teal:'#5eead4', orange:'#ff6b35', grey:'#6b6b6b', floor:'#33393b', paper:'#f5efe6' };
export function material(color, extra={}) { return new THREE.MeshStandardMaterial({color,roughness:.82,flatShading:true,...extra}); }
export function mesh(geometry,color,position=[0,0,0],extra={}) { const m=new THREE.Mesh(geometry,material(color,extra));m.position.set(...position);m.castShadow=true;m.receiveShadow=true;return m; }
export const box=(size,color,position,extra)=>mesh(new THREE.BoxGeometry(...size),color,position,extra);
export const cylinder=(radius,height,color,position,segments=8,extra)=>mesh(new THREE.CylinderGeometry(radius,radius,height,segments),color,position,extra);
export function label(text,{color=palette.paper,bg='transparent',width=2.3,height=.45,fontSize=44,billboard=true}={}) {
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;const ctx=canvas.getContext('2d');
  if(bg!=='transparent'){ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,canvas.height);}
  ctx.fillStyle=color;ctx.font=`600 ${fontSize*2}px Inter, Arial, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,96,735);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false,toneMapped:false}));plane.userData.billboard=billboard;return plane;
}
export function platform(radius=4.6,color=palette.floor) { return cylinder(radius,.22,color,[0,-.13,0],48); }
export function desk({round=false,color='#787e78'}={}) {
  const g=new THREE.Group();g.add(round?cylinder(1.35,.13,color,[0,1.02,0],20):box([2.1,.13,1.3],color,[0,1.02,0]));
  for(const x of [-.8,.8])for(const z of [-.42,.42])g.add(box([.08,1,.08],'#42484a',[x,.49,z]));return g;
}
export function chair(){const g=new THREE.Group();g.add(box([.65,.12,.62],'#484e51',[0,.57,0]),box([.65,.75,.09],'#484e51',[0,.95,-.3]));for(const x of [-.24,.24])for(const z of [-.24,.24])g.add(box([.055,.55,.055],'#343a3d',[x,.27,z]));return g;}
export function monitor(text='ERROR',color='#ff5656') {
  const g=new THREE.Group();g.add(box([1.18,.77,.12],'#111819',[0,1.53,.27]),box([.11,.4,.1],'#384249',[0,1.22,.27]),box([.6,.045,.34],'#384249',[0,1.105,.27]),box([.8,.035,.32],'#232a2c',[0,1.11,-.4]));
  const screen=label(text,{color,bg:'#0a111b',width:1.02,height:.58,fontSize:47,billboard:false});screen.position.set(0,1.53,.198);screen.rotation.y=Math.PI;g.add(screen);g.userData.screen=screen;return g;
}
export function line(points,color=palette.lime){return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color,transparent:true,opacity:1}));}
export function board(text='YOUR ROUTE',color=palette.amber){const g=new THREE.Group();g.add(box([2.05,1.3,.13],'#242e30',[0,1.8,0]),box([.07,1.5,.07],'#737a70',[-.65,.75,0]),box([.07,1.5,.07],'#737a70',[.65,.75,0]));const title=label(text,{color,width:1.75,height:.35,fontSize:31,billboard:false});title.position.set(0,2.14,.08);g.add(title,line([[-.74,1.35,.09],[-.43,1.57,.09],[-.1,1.48,.09],[.22,1.84,.09],[.72,1.94,.09]],color));return g;}
export function microphone(){const g=new THREE.Group();g.add(cylinder(.11,.5,'#161f23',[0,.44,0],8),cylinder(.024,.24,'#707c7b',[0,.13,0]),cylinder(.22,.035,'#707c7b',[0,.02,0],16));return g;}
export function headphones(){const g=new THREE.Group();const arc=mesh(new THREE.TorusGeometry(.23,.025,5,12,Math.PI),'#9aa99a');arc.rotation.z=Math.PI;g.add(arc,box([.09,.16,.09],'#424f50',[-.23,0,0]),box([.09,.16,.09],'#424f50',[.23,0,0]));return g;}
export function magnifier(){const g=new THREE.Group();const ring=mesh(new THREE.TorusGeometry(.22,.045,5,12),palette.amber);ring.rotation.x=-Math.PI/2;g.add(ring,box([.06,.07,.42],palette.amber,[0,0,.4]));return g;}
export function cup(){const g=new THREE.Group();g.add(cylinder(.12,.26, palette.paper,[0,.13,0],10));const h=mesh(new THREE.TorusGeometry(.095,.024,4,8),'#cfc7b7',[.14,.13,0]);h.rotation.y=Math.PI/2;g.add(h);return g;}
export function briefcase(){const g=new THREE.Group();g.add(box([.6,.42,.16],'#766448',[0,.23,0]),box([.23,.08,.06],palette.amber,[0,.49,0]));return g;}
export function door(){const g=new THREE.Group();g.add(box([.14,2.6,.17],palette.orange,[-.74,1.3,0]),box([.14,2.6,.17],palette.orange,[.74,1.3,0]),box([1.6,.14,.17],palette.orange,[0,2.63,0]));const leaf=box([1.3,2.5,.08],'#554637',[-.5,1.25,.42]);leaf.rotation.y=-.5;g.add(leaf);return g;}
export function plant(){const g=new THREE.Group();g.add(cylinder(.028,.65,'#7fae45',[0,.325,0],5));const leaves=[];for(let i=0;i<4;i++){const pivot=new THREE.Group();pivot.position.y=.2+i*.1;pivot.rotation.y=i*Math.PI/2;const leaf=mesh(new THREE.ConeGeometry(.15,.5,4),palette.lime,[0,.18,0]);pivot.add(leaf);g.add(pivot);leaves.push(pivot);}g.userData.leaves=leaves;return g;}
export function beam(from,to,color=palette.amber){const g=cylinder(.015,1,color,[0,0,0],6,{emissive:color,emissiveIntensity:.6,transparent:true});g.userData.from=new THREE.Vector3(...from);g.userData.to=new THREE.Vector3(...to);return g;}
export function growBeam(object,amount){const from=object.userData.from,to=from.clone().lerp(object.userData.to,amount),delta=to.clone().sub(from);object.position.copy(from).lerp(to,.5);object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());object.scale.y=Math.max(.001,delta.length());object.visible=amount>.01;}
