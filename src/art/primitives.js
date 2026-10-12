import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const geometries=new Map(), materials=new Map();
export const geometry=(key,create)=>{if(!geometries.has(key))geometries.set(key,create());return geometries.get(key);};
export function material(color,extra={}){const key=color+JSON.stringify(extra);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.72,...extra}));return materials.get(key);}
export function mesh(parent,geo,color,pos=[0,0,0],scale=[1,1,1],extra={}){const m=new THREE.Mesh(geo,material(color,extra));m.position.set(...pos);m.scale.set(...scale);parent.add(m);return m;}
export const orb=(p,c,pos,scale=[1,1,1],extra={})=>mesh(p,geometry('sphere',()=>new THREE.SphereGeometry(1,16,12)),c,pos,scale,extra);
export const cone=(p,c,pos,scale=[1,1,1],extra={})=>mesh(p,geometry('cone',()=>new THREE.ConeGeometry(1,1,12)),c,pos,scale,extra);
export const cylinder=(p,c,pos,scale=[1,1,1],extra={})=>mesh(p,geometry('cylinder',()=>new THREE.CylinderGeometry(1,1,1,12)),c,pos,scale,extra);
export const box=(p,c,pos,scale=[1,1,1])=>mesh(p,geometry('box',()=>new THREE.BoxGeometry(1,1,1)),c,pos,scale);
export function tube(p,c,points,radius=.05){const curve=new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v)));const m=mesh(p,new THREE.TubeGeometry(curve,12,radius,6,false),c);m.userData.ownedGeometry=true;return m;}
export function starGeometry(){return geometry('star',()=>{const s=new THREE.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5+Math.PI/2,r=i%2?.46:1;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?s.lineTo(x,y):s.moveTo(x,y);}s.closePath();return new THREE.ExtrudeGeometry(s,{depth:.04,bevelEnabled:false});});}
export function star(p,c,pos,size=.2){return mesh(p,starGeometry(),c,pos,[size,size,size]);}
export function group(p,pos=[0,0,0]){const g=new THREE.Group();g.position.set(...pos);p?.add(g);return g;}
// Bake static geometry by material: scenery costs a handful of draw calls rather than thousands.
// Child groups are treated as animation pivots when recursive=false.
export function bake(root,recursive=true){
  root.updateWorldMatrix(true,true);const inverse=root.matrixWorld.clone().invert();const buckets=new Map(),remove=[];
  const visit=m=>{if(!m.isMesh||Array.isArray(m.material)||m.userData.dynamic)return;const key=m.material.uuid;if(!buckets.has(key))buckets.set(key,{material:m.material,geos:[]});const g=m.geometry.clone();g.applyMatrix4(inverse.clone().multiply(m.matrixWorld));buckets.get(key).geos.push(g);remove.push(m);};
  if(recursive)root.traverse(visit);else root.children.forEach(visit);
  for(const m of remove){m.removeFromParent();if(m.userData.ownedGeometry)m.geometry.dispose();}
  for(const b of buckets.values()){const merged=mergeGeometries(b.geos);b.geos.forEach(g=>g.dispose());if(merged){const m=new THREE.Mesh(merged,b.material);m.userData.ownedGeometry=true;root.add(m);}}
  return root;
}
export function disposeTree(root){root.traverse(o=>{if(o.isMesh&&o.userData.ownedGeometry)o.geometry.dispose();});root.removeFromParent();}
