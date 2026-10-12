import * as THREE from 'three';
import {CHARACTER,MANES} from '../config/levels.js';
import {orb,cone,cylinder,mesh,group,tube,star,bake,geometry} from '../art/primitives.js';

function hairColor(hair,i){return hair==='rainbow'?['#ef8cac','#ffd26e','#8ad0a4','#79caf0','#b095df'][i%5]:hair;}
export function makePony({unicorn=false,hair=CHARACTER.hair,coat=CHARACTER.coat}={}) {
  const root=group();root.name=unicorn?'White unicorn':'Glender';
  const body=group(root);const hoof=unicorn?'#bd9fc4':'#ab7863',muzzle=unicorn?'#f7d8df':'#f3c8a9';
  orb(body,coat,[0,1.38,0],[.58,.64,1]);
  orb(body,coat,[0,1.82,.62],[.41,.73,.44]);
  const head=group(body,[0,2.22,.94]);head.rotation.x=-.15;
  orb(head,coat,[0,.14,0],[.42,.48,.59]);orb(head,muzzle,[0,-.05,.5],[.39,.26,.31]);
  for(const side of [-1,1]){
    const ear=orb(head,coat,[side*.27,.58,-.13],[.115,.32,.16]);ear.rotation.z=-side*.28;
    orb(head,muzzle,[side*.272,.62,-.022],[.06,.2,.047]);
    orb(head,'#26394d',[side*.36,.23,.25],[.052,.12,.105],{roughness:.18});
    orb(head,'#ffffff',[side*.405,.275,.28],[.024,.035,.028]);
    orb(head,'#db9ca5',[side*.36,.035,.42],[.038,.07,.1]);
    orb(head,'#976f81',[side*.19,-.017,.752],[.044,.029,.018]);
  }
  tube(head,'#ac7183',[[-.12,-.17,.74],[0,-.2,.78],[.12,-.17,.74]],.012);
  const mane=group(body);for(let i=0;i<8;i++){
    const c=hairColor(hair,i);const lock=orb(mane,c,[(i%2?-.07:.07),2.38-i*.1,.8-i*.09],[.23,.22,.19]);lock.rotation.z=i%2?.18:-.18;
  }
  for(let i=0;i<3;i++)tube(mane,hairColor(hair,i),[[.05*(i-1),2.7,.74],[.17*(i-1),2.7,1.14],[.22*(i-1),2.45,1.33]],.09);
  if(unicorn){const horn=cone(head,'#ffde8a',[0,.78,.22],[.105,.68,.105]);horn.rotation.x=.12;for(let i=0;i<3;i++)cylinder(head,'#eeb966',[0,.56+i*.14,.2],[.105-i*.022,.028,.105-i*.022]);}
  else for(const side of [-1,1])for(const [z,y,size] of [[-.35,1.55,.17],[.12,1.35,.13],[-.66,1.24,.11]]){const s=star(body,'#ffdc7b',[side*.56,y,z],size);s.rotation.y=side*Math.PI/2;}
  const legs=[];for(const side of [-1,1])for(const z of [-.59,.61]){
    const leg=group(root,[side*.36,1.35,z]);cylinder(leg,coat,[0,-.43,0],[.14,.86,.14]);orb(leg,coat,[0,-.72,.02],[.145,.2,.155]);orb(leg,hoof,[0,-1.13,.09],[.19,.15,.26]);bake(leg);legs.push(leg);
  }
  const tail=group(root,[0,1.66,-.85]);for(let i=0;i<5;i++)tube(tail,hairColor(hair,i),[[.06*(i-2),0,0],[.1*(i-2),.15,-.4],[.12*(i-2),-.22,-.8],[.07*(i-2),-.73,-.98]],.09);bake(tail);
  if(!unicorn){orb(body,'#758ebb',[0,1.85,-.13],[.55,.15,.6]);tube(body,'#d0a572',[[.28,2.22,1.3],[.6,1.95,.8],[.35,2.1,-.15]],.025);tube(body,'#d0a572',[[-.28,2.22,1.3],[-.6,1.95,.8],[-.35,2.1,-.15]],.025);}
  bake(body);root.userData={body,legs,tail,head,unicorn};return root;
}

export function makeMia(){
  const root=group();root.name='Mia';const c=CHARACTER;
  const body=group(root,[0,2.05,-.08]);orb(body,c.dress,[0,.45,0],[.29,.43,.22]);
  const skirtGeo=geometry('petal-skirt',()=>{const points=[];for(let i=0;i<=8;i++){const t=i/8;points.push(new THREE.Vector2(.26+.34*t,.26-.5*t));}return new THREE.LatheGeometry(points,20);});
  mesh(body,skirtGeo,c.dress,[0,.18,0]);
  for(const side of [-1,1]){orb(body,c.skin,[side*.49,-.15,.28],[.12,.32,.14]);orb(body,'#527bbe',[side*.49,-.43,.35],[.14,.13,.22]);
    const arm=group(body,[side*.27,.58,.04]);arm.rotation.z=side*.25;orb(arm,c.dress,[side*.05,-.08,.05],[.13,.19,.14]);orb(arm,c.skin,[side*.09,-.23,.12],[.075,.21,.085]);orb(arm,c.skin,[side*.12,-.36,.24],[.09,.085,.11]);if(side===1)root.userData.arm=arm;
  }
  const head=group(body,[0,1.05,0]);orb(head,c.skin,[0,.1,0],[.38,.43,.33]);
  orb(head,c.hair,[0,.23,-.1],[.405,.4,.32]);
  for(const side of [-1,1]){
    orb(head,'#325174',[side*.135,.16,.305],[.043,.07,.025]);orb(head,'#ffffff',[side*.14,.18,.328],[.014,.02,.009]);orb(head,'#efa5aa',[side*.245,.017,.269],[.075,.045,.025]);
    orb(head,c.hair,[side*.285,-.12,-.075],[.16,.4,.17]);
    const lock=tube(head,c.hair,[[side*.28,.17,-.18],[side*.35,-.16,-.24],[side*.27,-.52,-.38],[side*.43,-.64,-.49]],.095);lock.name='Flowing blonde lock';
  }
  tube(head,'#b27b84',[[-.075,-.09,.302],[0,-.12,.326],[.075,-.09,.302]],.012);
  for(let i=0;i<4;i++){const fringe=orb(head,c.hair,[(i-1.5)*.13,.38,.23],[.125,.14,.1]);fringe.rotation.z=(i-1.5)*.2;}
  for(let i=0;i<5;i++){const a=(i-2)*.35;orb(head,'#faf4d5',[Math.sin(a)*.36,.44,Math.cos(a)*.26],[.055,.055,.05]);orb(head,'#ecafd3',[Math.sin(a)*.36,.465,Math.cos(a)*.27],[.025,.027,.022]);}
  const wings=[];for(const side of [-1,1]){const w=group(body,[side*.16,.6,-.22]);
    const large=orb(w,c.wings,[side*.48,.23,-.08],[.55,.44,.055],{transparent:true,opacity:.77,metalness:.15});large.rotation.z=-side*.48;
    const small=orb(w,'#d1bff4',[side*.37,-.23,-.05],[.38,.27,.04],{transparent:true,opacity:.75});small.rotation.z=side*.35;
    tube(w,'#e7f7ff',[[side*.05,0,-.145],[side*.34,.15,-.145],[side*.73,.4,-.12]],.013);bake(w);wings.push(w);
  }
  bake(head);bake(body,false);root.userData={...root.userData,body,wings,head};return root;
}
export function makeRider(){const pony=makePony();const mia=makeMia();pony.add(mia);pony.userData.mia=mia;return pony;}
export function animatePony(pony,time,{running=true,boost=false,jump=0,steer=0,water=0,celebrate=false,reduced=false}={}){
  const u=pony.userData,phase=time*(boost?16:11);
  for(let i=0;i<u.legs.length;i++)u.legs[i].rotation.x=running?Math.sin(phase+(i%3===0?0:Math.PI))*.65:Math.sin(time*2+i)*.045;
  u.body.position.y=running?Math.abs(Math.sin(phase))*.085:Math.sin(time*2)*.018;
  u.body.rotation.z=-steer*.09;u.tail.rotation.x=Math.sin(time*5)*.13;u.tail.rotation.z=Math.sin(time*3)*.12;
  if(jump>0){u.legs.forEach((l,i)=>l.rotation.x=i%2?.8:-.7);u.body.rotation.x=-.1;}
  else u.body.rotation.x=celebrate&&!reduced?Math.sin(time*3)*.06:0;
  if(u.mia){const m=u.mia.userData;m.wings.forEach((w,i)=>w.rotation.y=(i?1:-1)*(.2+Math.sin(time*(running?6:3))*.14));m.body.rotation.x=jump>0?-.12:boost?.07:0;m.arm.rotation.x=water>0?-1.2:0;m.head.rotation.y=Math.sin(time*1.6)*.08;}
}
export function makeCollectionUnicorn(id){return makePony({unicorn:true,coat:'#fff9f4',hair:MANES[id]});}
