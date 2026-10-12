import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Chase} from '../src/game/chase.js';
import {LEVELS,coursePoint} from '../src/config/levels.js';
import {loadSave,writeSave,completeLevel,unlockCount,sanitizeSave,freshSave} from '../src/game/save.js';

test('all ten courses close smoothly and expose distinct unicorns',()=>{
  assert.equal(new Set(LEVELS.map(l=>l.theme)).size,10);
  assert.equal(new Set(LEVELS.map(l=>l.mane)).size,10);
  for(const l of LEVELS){const a=coursePoint(l,0),b=coursePoint(l,2*Math.PI*l.radius);assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<.001);}
});
test('every chase is physically catchable even without steering',()=>{
  for(const l of LEVELS){const c=new Chase(l);for(let i=0;i<3600&&!c.caught;i++) c.step(.05);assert.ok(c.caught,l.name);assert.ok(c.distance<=3.8);assert.ok(c.time>(l.id===0?15:45));assert.ok(c.time<120);}
});
test('steering responds and recenters; boundaries are forgiving',()=>{
  const c=new Chase(LEVELS[0]);for(let i=0;i<40;i++)c.step(.05,-1);assert.ok(c.lane<-4);for(let i=0;i<40;i++)c.step(.05,0);assert.ok(Math.abs(c.lane)<.02);
});
test('potions increase real speed, and boost expires',()=>{
  const c=new Chase(LEVELS[0]);c.s=29;c.unicornS=80;c.step(.05);assert.equal(c.stats.potions,1);for(let i=0;i<10;i++)c.step(.05);assert.ok(c.speed>13);c.items=[];for(let i=0;i<100;i++)c.step(.05);assert.equal(c.boost,0);assert.ok(c.speed<10.1);
});
test('low obstacles jump, standing obstacles slow gently, water is cosmetic',()=>{
  const c=new Chase(LEVELS[0]);c.items=[{id:'a',kind:'log',s:3,lane:0,radius:2}];c.step(.05);assert.equal(c.stats.jumps,1);c.step(.05);assert.ok(c.jumpHeight>0);
  c.items=[{id:'b',kind:'tree',s:c.s+1,lane:0,radius:2}];c.step(.05);assert.equal(c.stats.bumps,1);const before=c.unicornS;assert.ok(c.spray());assert.equal(c.unicornS,before);assert.equal(c.spray(),false);
});
test('progress survives storage, corrupt saves and unavailable storage recover',()=>{
  let raw=null;const storage={getItem:()=>raw,setItem:(_,v)=>{raw=v;}};
  let s=freshSave();for(let i=0;i<10;i++)s=completeLevel(s,i);assert.ok(writeSave(storage,s));assert.deepEqual(loadSave(storage).completed,s.completed);assert.equal(unlockCount(s),10);
  raw='{bad';assert.deepEqual(loadSave(storage),freshSave());assert.deepEqual(sanitizeSave({version:1,completed:[1,1,99,-1,'2']}).completed,[1]);assert.equal(writeSave({setItem(){throw Error();}},s),false);
});
