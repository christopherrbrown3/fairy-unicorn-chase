import * as THREE from "three";
import { makeZebra } from "./zebra-assets.js";
import { group, mesh, geometry, cylinder, cone } from "../art/primitives.js";

// Approved Blender scenery; habitat remains locally authored and material-baked.
const grass = "#c9b46c", straw = "#e0cc86", olive = "#82966b";
const bark = "#927358", rock = "#b7a18a", soil = "#b99269";
function ellipsoid(p, c, pos, scale) {
  return mesh(p, geometry("savannah-smooth", () => new THREE.SphereGeometry(1, 10, 6)), c, pos, scale);
}
function branch(p, a, b, radius = 0.1, color = bark) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), d = end.clone().sub(start);
  const m = cylinder(p, color, start.add(end).multiplyScalar(0.5).toArray(), [radius, d.length(), radius]);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()); return m;
}
export const plainsZebra = makeZebra;
export function zebraFamily(parent,scale=1,variant=0) {
  const g=group(parent);g.name="Plains zebra family: two adults and a foal";
  const a=plainsZebra(g,1,variant%3);a.position.set(-2.1,0,0.4);a.rotation.y=0.35;
  const b=plainsZebra(g,0.94,(variant+1)%3);b.position.set(2.1,0,-0.5);b.rotation.y=-0.38;
  const f=plainsZebra(g,1,(variant+2)%3,true);f.position.set(0.3,0,2.4);f.rotation.y=0.2;
  g.scale.setScalar(scale);return g;
}
export function grassIsland(parent,scale=1,variant=0) {
  const g=group(parent);g.name="Golden savannah tussocks and seed heads";
  for(let i=0;i<13;i++) {
    const a=i*2.4,x=Math.sin(a)*(0.3+i%3*0.32),z=Math.cos(a)*(0.3+i%3*0.32),h=0.45+(i%4)*0.18;
    const blade=cone(g,i%3?grass:straw,[x,h*0.5,z],[0.07,h,0.035]);blade.rotation.z=Math.sin(a)*0.2;
    if(i%3===0) {branch(g,[x,0,z],[x+0.1,h+0.2,z],0.018,grass);ellipsoid(g,straw,[x+0.1,h+0.2,z],[0.055,0.14,0.04]);}
  }
  if(variant%2) for(let i=0;i<3;i++) ellipsoid(g,olive,[(i-1)*0.6,0.37,-0.4],[0.65,0.4,0.55]);
  g.scale.setScalar(scale);return g;
}
export function flatTopTree(parent,scale=1,variant=0) {
  const g=group(parent);g.name="Branching flat-topped savannah shade tree";
  branch(g,[0,0,0],[0.2,3.8,0],0.28);
  for(let i=0;i<6;i++) {
    const a=i*Math.PI/3+variant*0.3,x=Math.sin(a)*(2.2+i%2),z=Math.cos(a)*(2.2+i%2),y=4.5+(i%3)*0.25;
    branch(g,[0.1,2.4,0],[x,y,z],0.13);
    branch(g,[x*0.65,y-0.65,z*0.65],[x+0.7,y+0.1,z-0.2],0.065);
    ellipsoid(g,i%2?olive:"#9ca976",[x,y+0.2,z],[2.2,0.62,1.65]);
    ellipsoid(g,olive,[x*0.6,y+0.25,z*0.6],[1.8,0.65,1.7]);
  }
  grassIsland(g,1.1,1).position.set(0.6,0,0.5);g.scale.setScalar(scale);return g;
}
export function termiteMound(parent,scale=1,variant=0) {
  const g=group(parent);g.name="Weathered earthen termite mound and rocks";
  for(let i=0;i<5;i++) {
    const x=(i-2)*0.4,z=Math.sin(i*2)*0.4,h=1.8+(i%3)*0.65;
    const mound=mesh(g,geometry(`savannah-mound-${i%3}`,()=>new THREE.CylinderGeometry(0.08,0.65,h,7,3)),soil,[x,h/2,z]);mound.rotation.z=(i-2)*-0.07;
    ellipsoid(g,soil,[x,0.3,z],[0.9,0.45,0.8]);
  }
  for(let i=0;i<3;i++) ellipsoid(g,rock,[1.5+i*0.4,0.2,-0.6+i*0.4],[0.55,0.32,0.45]);
  grassIsland(g,0.8,variant).position.set(-1.5,0,0.7);g.scale.setScalar(scale);return g;
}
export function waterhole(parent,scale=1,variant=0) {
  const g=group(parent);g.name="Shallow waterhole and grazing zebra pair";
  ellipsoid(g,soil,[0,0.03,0],[5,0.18,3.8]);
  ellipsoid(g,"#7badb3",[0,0.16,0],[4.25,0.07,3.1]);
  for(let i=0;i<8;i++) {
    const a=i*Math.PI/4;
    grassIsland(g,0.75,i%2).position.set(Math.sin(a)*5.2,0,Math.cos(a)*4.1);
    if(i%2===0)ellipsoid(g,rock,[Math.sin(a)*4.6,0.23,Math.cos(a)*3.5],[0.7,0.35,0.5]);
  }
  for(const side of [-1,1]) {
    const z=plainsZebra(g,0.95,(variant+(side>0?1:0))%3);z.position.set(side*5.2,0,side*0.8);z.rotation.y=-side*Math.PI/2;
  }
  g.scale.setScalar(scale);return g;
}
