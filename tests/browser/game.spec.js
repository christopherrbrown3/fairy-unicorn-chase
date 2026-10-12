import {test,expect} from '@playwright/test';
const ready=async page=>{await page.waitForFunction(()=>window.__fairy?.game&&window.__fairy?.screen==='title');};
const snap=page=>page.evaluate(()=>window.__fairy.snapshot());
test('root and repository subpath render authored assets without errors',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  for(const path of ['/?test=1','/fairy-unicorn-chase/?test=1']){
    await page.goto(path);await ready(page);await expect(page.getByRole('button',{name:'Let’s play'})).toBeVisible();
    const art=await page.evaluate(()=>{const g=window.__fairy.game;return {mia:g.player.userData.mia.name,pony:g.player.name,unicorn:g.unicorn.name,bottle:g.world.potions[0].children[0].children.map(o=>o.name),triangles:g.renderer.info.render.triangles};});
    expect(art.mia).toBe('Mia');expect(art.pony).toBe('Glender');expect(art.unicorn).toBe('White unicorn');expect(art.bottle.some(n=>n.includes('rounded'))).toBe(true);expect(art.triangles).toBeGreaterThan(1000);
  }expect(errors).toEqual([]);
});
test('keyboard, held touch controls, multitouch water, pause and preferences',async({page,browserName})=>{
  await page.goto('/?test=1');await ready(page);await page.getByRole('button',{name:'Let’s play'}).click();
  const advanceInput=seconds=>page.evaluate(seconds=>{const f=window.__fairy;f.advance(seconds,f.game.steer);},seconds);
  const screenX=()=>page.evaluate(()=>{const g=window.__fairy.game,p=g.player.position.clone();p.y+=1.5;return p.project(g.camera).x;});
  const centerX=await screenX();
  await page.keyboard.down('ArrowLeft');expect(await page.evaluate(()=>window.__fairy.game.steer)).toBe(-1);await advanceInput(.5);expect((await snap(page)).lane).toBeLessThan(-2);expect(await screenX()).toBeLessThan(centerX-.1);await page.keyboard.up('ArrowLeft');await advanceInput(1);expect(Math.abs((await snap(page)).lane)).toBeLessThan(.2);
  await page.keyboard.down('d');expect(await page.evaluate(()=>window.__fairy.game.steer)).toBe(1);await advanceInput(.5);expect((await snap(page)).lane).toBeGreaterThan(2);expect(await screenX()).toBeGreaterThan(centerX+.1);await page.keyboard.up('d');
  const left=await page.locator('#left').boundingBox();await page.mouse.move(left.x+left.width/2,left.y+left.height/2);await page.mouse.down();await advanceInput(.5);expect((await snap(page)).lane).toBeLessThan(-2);
  await page.keyboard.press('Space');await expect.poll(async()=>(await snap(page)).stats.sprays).toBeGreaterThan(0);await page.mouse.up();
  await advanceInput(.5);
  await page.getByRole('button',{name:'Spray water'}).tap();await expect.poll(async()=>(await snap(page)).stats.sprays).toBeGreaterThan(1);
  if(browserName==='chromium'){
    await advanceInput(.5);
    const water=await page.locator('#water').boundingBox(),cdp=await page.context().newCDPSession(page);
    const points=[{x:left.x+left.width/2,y:left.y+left.height/2,id:1},{x:water.x+water.width/2,y:water.y+water.height/2,id:2}];
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});await advanceInput(.5);expect((await snap(page)).lane).toBeLessThan(-2);await expect.poll(async()=>(await snap(page)).stats.sprays).toBeGreaterThan(2);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
  }
  await page.keyboard.press('Escape');await expect(page.getByRole('heading',{name:'A little breather'})).toBeVisible();const before=await snap(page);await page.waitForTimeout(300);expect((await snap(page)).s).toBe(before.s);
  await page.getByRole('button',{name:'Sound on'}).click();await page.getByLabel('Picture quality').selectOption('low');await page.getByLabel('Gentle motion').check();
  expect(await page.evaluate(()=>window.__fairy.save.sound)).toBe(false);expect(await page.evaluate(()=>window.__fairy.save.quality)).toBe('low');
  await page.getByRole('button',{name:'Keep chasing'}).click();await expect(page.getByRole('button',{name:'Steer right'})).toBeVisible();
});
test('real potion speed, automatic jump and harmless collision work in rendered game',async({page})=>{
  await page.goto('/?test=1');await ready(page);await page.getByRole('button',{name:'Let’s play'}).click();
  await page.evaluate(()=>window.__fairy.advance(3.4));let c=await snap(page);expect(c.stats.potions).toBeGreaterThan(0);expect(c.speed).toBeGreaterThan(12);
  await page.evaluate(()=>{const g=window.__fairy.game;const item=g.state.items.find(o=>o.kind==='puddle'||o.kind==='log');g.state.s=item.s-3;g.state.lane=item.lane;g.state.unicornS=g.state.s+50;g.state.step(.05,g.state.lane/g.level.width/.39);});expect((await snap(page)).stats.jumps).toBeGreaterThan(0);
  await page.evaluate(()=>{const c=window.__fairy.game.state;const item=c.items.find(o=>o.kind==='tree');c.s=item.s-1;c.lane=item.lane;c.unicornS=c.s+50;c.step(.05,c.lane/c.level.width/.39);});expect((await snap(page)).stats.bumps).toBeGreaterThan(0);
});
test('ten real chases unlock friends, continue, finale and reload persistence',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?test=1');await ready(page);await page.getByRole('button',{name:'Worlds',exact:true}).click();expect(await page.locator('.world-tile:disabled').count()).toBe(9);await page.getByRole('button',{name:'Rainbow Meadow',exact:true}).click();
  for(let i=0;i<10;i++){
    await page.evaluate(()=>window.__fairy.advance(180));expect((await snap(page)).caught).toBe(true);expect((await snap(page)).distance).toBeLessThanOrEqual(3.8);
    expect(await page.evaluate(()=>window.__fairy.save.completed.length)).toBe(i+1);
    if(i<9)await page.getByRole('button',{name:'Continue',exact:true}).click();
  }
  await expect(page.getByRole('heading',{name:'All ten friends!'})).toBeVisible();expect(await page.evaluate(()=>window.__fairy.game.friends.length)).toBe(10);
  expect(await page.evaluate(()=>{const g=window.__fairy.game;return !g.world.root.visible&&!!g.celebrationArt&&g.player.visible;})).toBe(true);
  await page.getByRole('button',{name:'Our unicorns'}).click();expect(await page.locator('.collection-tile.found').count()).toBe(10);
  await page.reload();await ready(page);expect(await page.evaluate(()=>window.__fairy.save.completed.length)).toBe(10);
  await page.getByRole('button',{name:'Worlds',exact:true}).click();expect(await page.locator('.world-tile:disabled').count()).toBe(0);expect(errors).toEqual([]);
});
test('portrait hint, large targets and corrupt storage recover',async({page})=>{
  await page.goto('/?test=1');await ready(page);await page.evaluate(()=>localStorage.setItem('fairy-unicorn-chase:v1','{broken'));await page.reload();await ready(page);expect(await page.evaluate(()=>window.__fairy.save.completed.length)).toBe(0);
  await page.setViewportSize({width:390,height:844});await expect(page.getByLabel('Landscape orientation hint')).toBeVisible();await page.getByRole('button',{name:'Let’s play'}).click();
  for(const id of ['left','right','water']){const bounds=await page.locator('#'+id).boundingBox();expect(bounds.width).toBeGreaterThanOrEqual(80);expect(bounds.height).toBeGreaterThanOrEqual(80);}
});
