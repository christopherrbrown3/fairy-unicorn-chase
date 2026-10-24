import * as THREE from "three";
import { group, mesh, geometry, cylinder, cone } from "../art/primitives.js";

// Independent hornless plains-zebra scenery. No character GLBs or rigs are used.
// Finite variants share indexed surfaces and stripe patches before spatial bake.
const ivory = "#f4edda", ink = "#343b39", foalInk = "#655043";
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
// Stripes are narrow curved patches on an ellipsoid, not rings floating off it.
// Longitudinal positions bend toward the belly and alternate their width.
export function zebraStripeGeometry(variant = 0, count = 9) {
  variant %= 3;
  return geometry(`savannah-stripes-${variant}-${count}`, () => {
    const positions=[],uv=[],indices=[];
    const around=20, across=1;
    for(let stripe=0;stripe<count;stripe++) {
      const center=-1.23 + stripe*2.46/(count-1), width=0.065+(stripe%3)*0.015;
      const start=positions.length/3;
      for(let i=0;i<=around;i++) for(let j=0;j<=across;j++) {
        // Stop at the lower belly, preserving a pale underside.
        const a=-0.42 + i/around*(Math.PI+0.84);
        const bend=Math.sin(a*2+variant*0.7+stripe*0.35)*0.065 + Math.cos(a)*Math.cos(a)*Math.max(0,-center)*0.11;
        const t=center+bend+(j/across-0.5)*width*2;
        const r=Math.cos(t)*1.018;
        positions.push(Math.cos(a)*r,Math.sin(a)*r,Math.sin(t)*1.018);
        uv.push(j/across,i/around);
      }
      for(let i=0;i<around;i++) for(let j=0;j<across;j++) {
        const a=start+i*(across+1)+j,b=a+across+1;
        indices.push(a,b,a+1,a+1,b,b+1);
      }
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));geo.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
  });
}
function striped(p,pos,scale,variant=0,count=9,foal=false) {
  const g=group(p,pos);mesh(g,geometry("savannah-striped-form",()=>new THREE.SphereGeometry(1,20,14)),ivory,[0,0,0],scale);
  mesh(g,zebraStripeGeometry(variant,count),foal?foalInk:ink,[0,0,0],scale);return g;
}
function leg(p,x,z,step,back,foal,variant) {
  const hip=[x,1.83,z],knee=[x,0.97,z+(back?0.24:-0.06)+step*0.4],foot=[x,0.17,z+step];
  for(const [a,b,r] of [[hip,knee,back?0.23:0.18],[knee,foot,0.105]]) {
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),d=end.clone().sub(start);
    const g=striped(p,start.add(end).multiplyScalar(0.5).toArray(),[r,r,d.length()*0.64],variant,5,foal);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),d.normalize());
  }
  ellipsoid(p,ivory,knee,[0.13,0.17,0.14]);
  const hoof=ellipsoid(p,ink,[x,0.14,foot[2]+0.045],[0.16,0.14,0.22]);
  hoof.rotation.x=-0.06;
}
export function plainsZebra(parent, scale=1, variant=0, foal=false) {
  variant%=3;const g=group(parent);g.name=`Plains zebra ${foal?"foal":"adult"} ${["looking","grazing","walking"][variant]}`;
  // Barrel, rounded haunch and sloping shoulder are a single visual body mass.
  striped(g,[0,2.05,0],[0.64,0.76,1.54],variant,10,foal);
  mesh(g,geometry("savannah-dorsal-stripe",()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({length:15},(_,i)=>{const z=-1.35+i*2.55/14;return new THREE.Vector3(0,2.05+0.76*Math.sqrt(1-z*z/(1.54*1.54))+0.01,z);})),24,0.035,5,false)),foal?foalInk:ink);
  for(const side of [-1,1]) {
    leg(g,side*0.43,0.94,variant===2?side*0.38:side*0.045,false,foal,variant);
    leg(g,side*0.44,-1.01,variant===2?-side*0.3:side*-0.07,true,foal,variant);
  }
  const neck=group(g,[0,2.13,0.91]);
  neck.rotation.x=variant===1?2.04:-0.1;
  if(variant===0) neck.rotation.y=-0.16;
  striped(neck,[0,0.57,0.17],[0.39,0.86,0.57],variant,8,foal).rotation.x=-0.19;
  // The mane follows the back of the neck, ending before the forehead.
  for(let i=0;i<9;i++) {
    const h=i/8;
    const tuft=ellipsoid(neck,foal?foalInk:ink,[0,0.04+h*1.15,-0.53+h*0.12],[0.095,0.17,0.13]);tuft.rotation.x=-0.2;
  }
  const head=group(neck,[0,1.15,0.48]);head.rotation.x=variant===1?-0.65:0.64;
  striped(head,[0,0,0.12],[0.29,0.36,0.64],variant,8,foal);
  ellipsoid(head,foal?foalInk:ink,[0,-0.07,0.68],[0.3,0.25,0.32]);
  for(const side of [-1,1]) {
    ellipsoid(head,ink,[side*0.275,0.13,-0.02],[0.065,0.08,0.09]);
    ellipsoid(head,ivory,[side*0.309,0.153,0.012],[0.014,0.021,0.022]);
    ellipsoid(head,ink,[side*0.23,0,0.86],[0.05,0.04,0.045]);
    const ear=group(head,[side*0.2,0.38,-0.29]);ear.rotation.set(-0.32,0,-side*0.27);
    ellipsoid(ear,ivory,[0,0.2,0],[0.13,0.26,0.095]);
    ellipsoid(ear,foal?foalInk:ink,[0,0.21,0.067],[0.075,0.18,0.035]);
  }
  // A thin tail with a dark tuft, never a unicorn's flowing tail or a horn.
  mesh(g,geometry(`savannah-tail-${variant}`,()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,2.22,-1.43),new THREE.Vector3(0.1,1.8,-1.68),new THREE.Vector3(variant===2?0.45:0.18,1.18,-1.74)]),12,0.055,6,false)),foal?foalInk:ink);
  ellipsoid(g,foal?foalInk:ink,[variant===2?0.45:0.18,1.1,-1.74],[0.12,0.28,0.11]);
  if(foal) {
    // Smaller torso/head, relatively longer legs than a uniformly shrunk adult.
    g.scale.set(scale*0.67,scale*0.8,scale*0.67);
  } else g.scale.setScalar(scale);
  return g;
}
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
