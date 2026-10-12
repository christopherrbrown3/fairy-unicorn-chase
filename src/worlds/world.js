import * as THREE from 'three';
import {coursePoint,courseItems} from '../config/levels.js';
import {mesh,geometry,orb,cone,star,group,bake,disposeTree} from '../art/primitives.js';
import {tree,mushroom,flower,cloud,crystal,castle,rainbow,candy,potion,obstacle} from './props.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

let authoredPotion=null;
export async function loadWorldAssets(){try{const gltf=await new GLTFLoader().loadAsync(new URL('assets/models/sparkle-potion.glb',document.baseURI).href);authoredPotion=gltf.scene;}catch{ /* The original procedural bottle is a complete fallback. */ }}
const rnd=(n)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
function place(obj,level,s,lane,extraY=0){const p=coursePoint(level,s,lane);obj.position.set(p.x,p.y+extraY,p.z);obj.rotation.y=p.yaw;return obj;}
function roadGeometry(level,halfwidth,y=0){const verts=[],indices=[],length=Math.PI*2*level.radius,segments=420;
  for(let i=0;i<=segments;i++)for(const side of [-1,1]){const p=coursePoint(level,i/segments*length,side*halfwidth);verts.push(p.x,p.y+y,p.z);}
  for(let i=0;i<segments;i++){const a=i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
export class World {
  constructor(scene,level){this.scene=scene;this.level=level;this.root=group(scene);this.potions=[];this.butterflies=[];this.chunks=[];
    scene.background=new THREE.Color(level.sky);scene.fog=new THREE.Fog(level.sky,55,155);
    mesh(this.root,geometry('ground',()=>new THREE.CylinderGeometry(1100,1100,2,64)),level.ground,[0,-1.6,0]);
    for(const [width,y,color] of [[35,-.13,level.ground],[level.width/2+1.3,-.06,level.accent],[level.width/2+.35,-.025,'#fff0d6'],[level.width/2,0,level.road]]){const m=mesh(this.root,roadGeometry(level,width,y),color);m.userData.ownedGeometry=true;}
    const length=Math.PI*2*level.radius;
    for(let j=0;j<16;j++){const chunk=group(this.root);this.chunks.push(chunk);for(let k=0;k<9;k++){
      const s=(j*9+k)/144*length;
      for(const side of [-1,1]){const seed=j*40+k*2+(side+1)/2+level.id*731;let dist=level.width/2+3+rnd(seed)*9;
        let prop;switch(level.theme){
          case 'forest':prop=k%3===0?mushroom(chunk,level.accent,1.8):tree(chunk,level.foliage,1+rnd(seed+2)*.7);break;
          case 'cloud':prop=cloud(chunk,1.2+rnd(seed)*1.8);break;
          case 'castle':prop=k%8===0?castle(chunk,level.foliage,1.6):tree(chunk,k%2?'#b4c894':'#e4adbd',.8);break;
          case 'candy':prop=k%3===0?mushroom(chunk,'#dd9cda',1.7):candy(chunk,[level.accent,'#eaa6c7','#d3b4e5'][k%3],1.1);break;
          case 'crystal':prop=crystal(chunk,['#b5a6f2','#78b9cf','#f2bb96'][k%3],1.4+rnd(seed));break;
          case 'garden':prop=k%3?flower(chunk,['#f399b0','#e7a3d5','#ffdaa1'][k%3],3+rnd(seed)*2):tree(chunk,level.foliage,.7);break;
          case 'night':prop=k%3===0?crystal(chunk,'#9e91cc',.9):tree(chunk,level.foliage,1);star(chunk,'#fff2ba',[0,0,0],.3);break;
          case 'mountain':if(k%3===0){prop=group(chunk);cone(prop,'#b2adc4',[0,9,0],[8,23,8]);cone(prop,'#f6f2f7',[0,16.4,0],[3.9,8.3,3.9]);dist=23+rnd(seed)*8;}else prop=tree(chunk,level.foliage,.9);break;
          case 'palace':prop=k%7===0?castle(chunk,level.foliage,1.7,true):flower(chunk,level.accent,2);break;
          default:prop=k%4?flower(chunk,['#f1aac0','#ffe19a','#b49edb'][k%3],1.2+rnd(seed)):tree(chunk,level.foliage,.9+rnd(seed)*.4);
        }
        place(prop,level,s,side*dist,level.theme==='cloud'?-1.4:0);
        if(['meadow','forest','castle','palace'].includes(level.theme)){for(let f=0;f<2;f++)place(flower(chunk,['#f1aac0','#ffe19a','#b9a5de'][f%3],.9),level,s+f*2,side*(level.width/2+1.8+f));}
      }
    }bake(chunk);}
    const landmarks=group(this.root);
    for(let i=0;i<8;i++){
      const s=i*length/8;
      if(['meadow','cloud','mountain','palace'].includes(level.theme))place(rainbow(landmarks,1.7),level,s,0,0.7);
      if(['meadow','forest','garden','castle','candy','palace'].includes(level.theme))place(orb(landmarks,level.foliage,[0,0,0],[15,5+rnd(i)*7,18]),level,s+22,35,-1.5);
      if(level.theme==='mountain'){const m=cone(landmarks,'#aca8c2',[0,0,0],[22,48,22]);place(m,level,s,-55,16);place(cone(landmarks,'#f5eef6',[0,0,0],[10,22,10]),level,s,-55,30);}
      if(level.theme==='crystal'){place(cone(landmarks,'#454869',[0,0,0],[24,40,22]),level,s,-40,12);const arch=mesh(landmarks,geometry('cavearch',()=>new THREE.TorusGeometry(13,3,6,20,Math.PI)),'#61678d');place(arch,level,s+26,0,-1);}
      if(level.theme==='night'){const p=coursePoint(level,s,-35);star(landmarks,'#fff0b4',[p.x,18+rnd(i)*14,p.z],.75);}
      place(cloud(landmarks,2.5+rnd(i)*3),level,s,45,25+rnd(i)*15);
    }
    if(level.theme==='night'){place(orb(landmarks,'#fff0c1',[0,0,0],[6,6,6],{emissive:'#ffe8a4',emissiveIntensity:.4}),level,70,45,40);}
    bake(landmarks);
    if(level.theme==='night'){
      this.sky=group(this.root);const shapes=geometry('sky-star',()=>{const shape=new THREE.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?.22:.55;i?shape.lineTo(Math.cos(a)*r,Math.sin(a)*r):shape.moveTo(Math.cos(a)*r,Math.sin(a)*r);}return new THREE.ShapeGeometry(shape);});
      const stars=new THREE.InstancedMesh(shapes,new THREE.MeshBasicMaterial({color:'#fff0bb',side:THREE.DoubleSide,fog:false}),110);stars.userData.ownedMaterial=true;const dummy=new THREE.Object3D();
      for(let i=0;i<110;i++){const a=rnd(i+199)*Math.PI*2;dummy.position.set(Math.sin(a)*95,12+rnd(i+31)*60,Math.cos(a)*95);dummy.lookAt(0,20,0);dummy.scale.setScalar(.45+rnd(i+13)*.85);dummy.updateMatrix();stars.setMatrixAt(i,dummy.matrix);}this.sky.add(stars);
      this.moon=mesh(this.sky,geometry('moon',()=>new THREE.SphereGeometry(4,16,12)),'#fff2c0',[0,30,100],[1,1,1],{emissive:'#fff2c0',emissiveIntensity:.5});
    }
    for(const item of courseItems(level)){
      if(item.kind==='potion'){
        const g=group(this.root);g.name='Potion pickup';
        const model=authoredPotion?authoredPotion.clone():potion();g.add(model);place(g,level,item.s,item.lane,.6);g.userData={...item,baseY:g.position.y};this.potions.push(g);
      }else{const g=obstacle(this.root,item.kind);place(g,level,item.s,item.lane);bake(g);}
    }
    if(level.theme==='garden')for(let i=0;i<12;i++){const b=group(this.root);for(const side of [-1,1]){const w=orb(b,i%2?'#f2b6d0':'#ffd69c',[side*.4,0,0],[.4,.06,.3]);w.userData.side=side;}b.userData={s:10+i*36,lane:8*Math.sin(i),base:2+rnd(i)*3};this.butterflies.push(b);}
  }
  update(time,chase,camera){
    if(this.sky&&camera){this.sky.position.copy(camera.position);const direction=new THREE.Vector3();camera.getWorldDirection(direction);direction.y=0;direction.normalize();this.moon.position.set(direction.x*100+direction.z*25,31,direction.z*100-direction.x*25);}
    for(const p of this.potions){p.rotation.y=time*.8;p.position.y=p.userData.baseY+Math.sin(time*2+p.userData.s)*.15;const lap=chase?Math.floor(chase.s/chase.lap):0;p.visible=!chase?.collected.has(`${lap}:${p.userData.id}`);}
    for(const b of this.butterflies){place(b,this.level,b.userData.s+Math.sin(time*.2)*5,b.userData.lane,b.userData.base+Math.sin(time*2)*.3);b.children.forEach(w=>w.rotation.z=w.userData.side*Math.sin(time*9)*.55);}
  }
  dispose(){disposeTree(this.root);}
}
