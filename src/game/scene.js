import * as THREE from 'three';
import {LEVELS,coursePoint} from '../config/levels.js';
import {makeRider,makeCollectionUnicorn,animatePony} from '../characters/characters.js';
import {World} from '../worlds/world.js';
import {Chase} from './chase.js';
import {Particles} from './particles.js';
import {disposeTree,group,mesh,geometry,orb,tube,cylinder} from '../art/primitives.js';
import {rainbow,flower} from '../worlds/props.js';

export class GameScene {
  constructor(canvas,{onEvent,onFrame,onContextLoss,reducedMotion=false,quality='auto'}={}){
    this.canvas=canvas;this.onEvent=onEvent;this.onFrame=onFrame;this.reducedMotion=reducedMotion;this.quality=quality;
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(this.pixelRatio());this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.18;
    this.scene=new THREE.Scene();this.scene.add(new THREE.HemisphereLight('#fff5e8','#6a8f8c',2.5));
    const sun=new THREE.DirectionalLight('#fff6e3',3.2);sun.position.set(-30,60,30);this.scene.add(sun);
    this.camera=new THREE.PerspectiveCamera(52,1,.1,230);this.lastTime=performance.now();this.elapsed=0;
    this.player=makeRider();this.scene.add(this.player);this.unicorn=makeCollectionUnicorn(0);this.scene.add(this.unicorn);
    this.waterStream=group(this.player);this.waterStream.name='Mia water magic';this.waterDrops=[];
    const stream=tube(this.waterStream,'#48bcec',[[.46,2.7,.6],[.5,3.5,2.1],[.5,3.65,3.6],[.5,3,5.8]],.035);stream.material=stream.material.clone();stream.material.transparent=true;stream.material.opacity=.55;
    for(let i=0;i<14;i++){const drop=orb(this.waterStream,i%3?'#49b9ed':'#8ae6fa',[0,0,0],[.095,.16,.095],{emissive:'#218abe',emissiveIntensity:.12,roughness:.25});this.waterDrops.push(drop);}this.waterStream.visible=false;
    this.shadowRoot=group(this.scene);this.shadows=[0,1].map(()=>{const s=mesh(this.shadowRoot,geometry('shadow',()=>new THREE.CircleGeometry(1,24)),'#344959',[0,0,0],[.85,1.35,1],{transparent:true,opacity:.13,depthWrite:false});s.rotation.x=-Math.PI/2;return s;});
    this.particles=new Particles(this.scene);this.steer=0;this.mode='title';this.state=null;this.friends=[];this.averageFrame=16;this.frameCount=0;this.uiTick=0;
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.mode='paused';onContextLoss?.();});
    this.resize=()=>{this.renderer.setSize(innerWidth,innerHeight,false);this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();};addEventListener('resize',this.resize);this.resize();this.showTitle();
    this.renderer.setAnimationLoop(()=>this.frame());
  }
  pixelRatio(){return this.quality==='low'?1:this.quality==='high'?Math.min(devicePixelRatio,2):Math.min(devicePixelRatio,1.5);}
  setQuality(value){this.quality=value;this.renderer.setPixelRatio(this.pixelRatio());this.resize();}
  setWorld(id){this.world?.dispose();if(this.celebrationArt)disposeTree(this.celebrationArt);this.celebrationArt=null;this.friends.forEach(disposeTree);this.friends=[];disposeTree(this.unicorn);this.unicorn=makeCollectionUnicorn(id);this.scene.add(this.unicorn);this.world=new World(this.scene,LEVELS[id]);this.level=LEVELS[id];this.particles.clear();}
  position(model,s,lane=0,y=0){const p=coursePoint(this.level,s,lane);model.position.set(p.x,p.y+y,p.z);model.rotation.y=p.yaw;return p;}
  showTitle(){if(!this.world||this.level.id!==0)this.setWorld(0);if(this.celebrationArt){disposeTree(this.celebrationArt);this.celebrationArt=null;}this.world.root.visible=true;this.friends.forEach(disposeTree);this.friends=[];this.mode='title';this.state=null;this.waterStream.visible=false;this.position(this.player,0,0);this.position(this.unicorn,7,-3);this.player.visible=true;this.unicorn.visible=true;this.camera.fov=48;this.camera.updateProjectionMatrix();this.setStageCamera(true);}
  start(id){this.setWorld(id);this.state=new Chase(this.level);this.mode='playing';this.steer=0;this.waterStream.visible=false;this.position(this.player,0);this.position(this.unicorn,this.state.unicornS);this.camera.fov=52;this.updateChaseCamera(1,true);this.lastTime=performance.now();}
  pause(){if(this.mode==='playing'){this.mode='paused';this.steer=0;}}
  resume(){if(this.mode==='paused'){this.mode='playing';this.lastTime=performance.now();}}
  spray(){return this.mode==='playing'&&this.state.spray();}
  celebrate(final=false){this.mode=final?'final':'celebrate';this.steer=0;this.waterStream.visible=false;const s=this.state.s;this.position(this.player,s,1.7);this.position(this.unicorn,s+.7,-1.7);this.setStageCamera(false,false);
    if(final){this.unicorn.visible=false;for(let i=0;i<10;i++){const u=makeCollectionUnicorn(i);this.scene.add(u);const row=i<5?0:1;this.position(u,s+row*4.5-1,(i%5-2)*2.7);u.scale.setScalar(.72);this.friends.push(u);}this.position(this.player,s-3,0);}
    // A clear celebration island guarantees the portrait camera cannot enter a nearby castle/tree.
    this.world.root.visible=false;this.celebrationArt=group(this.scene);const base=coursePoint(this.level,s);
    cylinder(this.celebrationArt,this.level.ground,[base.x,base.y-.6,base.z],[32,1,32]);
    cylinder(this.celebrationArt,this.level.road,[base.x,base.y-.24,base.z],[16,.25,16]);
    for(let i=0;i<18;i++){const a=i/18*Math.PI*2,f=flower(this.celebrationArt,[this.level.accent,'#ffe0a0','#eaa6c4'][i%3],1.4);f.position.set(base.x+Math.cos(a)*14,base.y,base.z+Math.sin(a)*14);f.rotation.y=-a;}
    const arc=rainbow(this.celebrationArt,final?1.45:.85);this.position(arc,s-7,0,.5);
    const heartShape=new THREE.Shape();heartShape.moveTo(0,-.45);heartShape.bezierCurveTo(-.9,.05,-.75,.8,0,.4);heartShape.bezierCurveTo(.75,.8,.9,.05,0,-.45);
    const heartGeo=geometry('celebration-heart',()=>new THREE.ShapeGeometry(heartShape,8));
    for(let i=0;i<12;i++){const heart=mesh(this.celebrationArt,heartGeo,['#ed9ab6','#ffce7e','#a5dbe5'][i%3],[0,0,0],[.32,.32,.32],{side:THREE.DoubleSide});this.position(heart,s-3+(i%3)*2,(i%2?-1:1)*(2.5+Math.floor(i/3)),3+Math.floor(i/3)*.5);heart.userData.baseY=heart.position.y;heart.userData.phase=i;}
    this.particles.emit(this.player.position.clone().add(new THREE.Vector3(0,4,0)),'#ffe194',65);
  }
  setStageCamera(title=false,snap=false){const s=this.state?.s??0,p=coursePoint(this.level,s),f=new THREE.Vector3(p.fx,0,p.fz),right=new THREE.Vector3(p.fz,0,-p.fx),base=new THREE.Vector3(p.x,p.y,p.z);
    const distance=this.mode==='final'?18:10;
    const cam=base.clone().addScaledVector(f, distance*.85).addScaledVector(right, distance*.72).add(new THREE.Vector3(0,this.mode==='final'?7:5.2,0));
    const look=base.clone().add(new THREE.Vector3(0,1.9,0));if(title){look.addScaledVector(right,-4.1);cam.addScaledVector(right,-3.6);}
    this.stageLook=look;this.stageCam=cam;if(title||snap){this.camera.position.copy(cam);this.camera.lookAt(look);}
  }
  updateChaseCamera(dt,snap=false){const c=this.state,p=coursePoint(this.level,c.s),f=new THREE.Vector3(p.fx,0,p.fz),base=new THREE.Vector3(p.x,p.y,p.z);
    const cam=base.clone().addScaledVector(f,-10.8).add(new THREE.Vector3(0,6.1,0));const side=new THREE.Vector3(p.fz,0,-p.fx);cam.addScaledVector(side,c.lane*.28);
    const ahead=coursePoint(this.level,c.s+10,c.lane*.2),look=new THREE.Vector3(ahead.x,ahead.y+1.2,ahead.z);
    this.camera.position.lerp(cam,snap?1:1-Math.exp(-dt*6));this.camera.lookAt(look);
    const target=52+(c.boost>0&&!this.reducedMotion?3:0);this.camera.fov+=(target-this.camera.fov)*(1-Math.exp(-dt*3));this.camera.updateProjectionMatrix();
  }
  frame(){const now=performance.now(),raw=(now-this.lastTime)/1000,dt=Math.min(raw,.05);this.lastTime=now;this.elapsed+=dt;const time=this.elapsed;
    if(this.mode==='playing'){
      const c=this.state;c.step(dt,this.steer);const p=this.position(this.player,c.s,c.lane,c.jumpHeight);this.position(this.unicorn,c.unicornS,c.unicornLane);
      animatePony(this.player,time,{boost:c.boost>0,jump:c.jumpHeight,steer:this.steer,water:c.water,reduced:this.reducedMotion});animatePony(this.unicorn,time);
      this.updateChaseCamera(dt);
      this.waterStream.visible=c.water>0;this.waterDrops.forEach((drop,i)=>{const t=(time*1.6+i/14)%1;drop.position.set(.5+Math.sin(i)*.05,2.7+Math.sin(t*Math.PI)*.95,.6+t*5.6);drop.scale.set(.08+t*.05,.13+t*.08,.08+t*.05);});
      if(c.water>0){const source=this.player.localToWorld(new THREE.Vector3(.42,2.75,.4));this.particles.emit(source,'#79d8fc',3,new THREE.Vector3(p.fx*10,3,p.fz*10));}
      if(c.boost>0&&!this.reducedMotion)this.particles.emit(this.player.position.clone().add(new THREE.Vector3(0,.6,0)),'#ffe49e',2);
      for(const event of c.drainEvents())this.onEvent?.(event,c);
      this.uiTick+=dt;if(this.uiTick>.1){this.uiTick=0;this.onFrame?.(c);}
    }else if(this.mode!=='paused'){
      if(['celebrate','final'].includes(this.mode)){this.camera.position.lerp(this.stageCam,1-Math.exp(-dt*3));this.camera.lookAt(this.stageLook);this.celebrationArt?.children.filter(o=>o.userData.baseY!==undefined).forEach(h=>{if(!this.reducedMotion)h.position.y=h.userData.baseY+Math.sin(time*2+h.userData.phase)*.18;h.quaternion.copy(this.camera.quaternion);});}
      animatePony(this.player,time,{running:false,celebrate:this.mode!=='title',reduced:this.reducedMotion});animatePony(this.unicorn,time,{running:false});this.friends.forEach(u=>animatePony(u,time,{running:false,celebrate:true,reduced:this.reducedMotion}));
      if(['celebrate','final'].includes(this.mode)&&Math.random()<.3&&!this.reducedMotion){const pos=this.player.position.clone().add(new THREE.Vector3((Math.random()-.5)*10,4+Math.random()*3,(Math.random()-.5)*8));this.particles.emit(pos,['#ffe49e','#f6b4cc','#a9e2ed'][Math.floor(Math.random()*3)],4);}
    }
    const c=this.state;[this.player,this.unicorn].forEach((m,i)=>{const sh=this.shadows[i];sh.position.copy(m.position);sh.position.y-=i===0?(c?.jumpHeight??0):0;sh.position.y+=.035;sh.rotation.z=m.rotation.y;sh.visible=m.visible;});
    if(this.mode!=='paused'){this.world.update(time,c,this.camera);this.particles.step(dt);}
    this.renderer.render(this.scene,this.camera);
    if(this.quality==='auto'&&this.mode==='playing'){this.averageFrame=this.averageFrame*.97+raw*1000*.03;if(++this.frameCount===300&&this.averageFrame>24){this.renderer.setPixelRatio(1);this.resize();}}
  }
  dispose(){this.renderer.setAnimationLoop(null);removeEventListener('resize',this.resize);this.world?.dispose();this.renderer.dispose();}
}

export function renderPortraits(){
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(220,180);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight('#ffffff','#b8adb6',3));const sun=new THREE.DirectionalLight('#fff4e5',3);sun.position.set(3,8,5);scene.add(sun);
  const camera=new THREE.PerspectiveCamera(35,220/180,.1,30);camera.position.set(4,3.3,6);camera.lookAt(0,1.3,0);const images=[];
  for(let i=0;i<10;i++){const u=makeCollectionUnicorn(i);scene.add(u);renderer.render(scene,camera);images.push(renderer.domElement.toDataURL('image/png'));disposeTree(u);}
  renderer.dispose();renderer.forceContextLoss();return images;
}
