import * as THREE from 'three';
export class Particles {
  constructor(scene,count=160){
    this.count=count;this.data=Array.from({length:count},()=>({life:0,v:new THREE.Vector3()}));this.cursor=0;
    this.positions=new Float32Array(count*3);this.colors=new Float32Array(count*3);
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(this.positions,3));geo.setAttribute('color',new THREE.BufferAttribute(this.colors,3));
    const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(16,16,11,0,Math.PI*2);ctx.fill();
    this.material=new THREE.PointsMaterial({size:.15,map:new THREE.CanvasTexture(canvas),transparent:true,alphaTest:.2,vertexColors:true,depthWrite:false});
    this.points=new THREE.Points(geo,this.material);this.points.frustumCulled=false;scene.add(this.points);this.clear();
  }
  emit(pos,color='#f9e293',n=10,velocity=null){const c=new THREE.Color(color);
    for(let j=0;j<n;j++){const i=this.cursor++%this.count,d=this.data[i];d.life=.55+Math.random()*.7;this.positions.set([pos.x,pos.y,pos.z],i*3);this.colors.set([c.r,c.g,c.b],i*3);d.v.set((Math.random()-.5)*3,Math.random()*3+1,(Math.random()-.5)*3);if(velocity)d.v.add(velocity);}
  }
  step(dt){for(let i=0;i<this.count;i++){const d=this.data[i];if(d.life<=0)continue;d.life-=dt;for(let k=0;k<3;k++)this.positions[i*3+k]+=d.v.getComponent(k)*dt;d.v.y-=3*dt;if(d.life<=0)this.positions[i*3+1]=-999;}this.points.geometry.attributes.position.needsUpdate=true;this.points.geometry.attributes.color.needsUpdate=true;}
  clear(){this.data.forEach(d=>d.life=0);for(let i=0;i<this.count;i++)this.positions[i*3+1]=-999;this.points.geometry.attributes.position.needsUpdate=true;}
}
