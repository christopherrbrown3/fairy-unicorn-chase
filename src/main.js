import './styles/game.css';
import {GameScene,renderPortraits} from './game/scene.js';
import {loadSave,writeSave,completeLevel} from './game/save.js';
import {LEVELS} from './config/levels.js';
import {loadWorldAssets} from './worlds/world.js';
import {View} from './ui/view.js';
import {Input} from './game/input.js';
import {Audio} from './audio/audio.js';

const root=document.querySelector('#ui'),audio=new Audio();
let storage;try{storage=localStorage;}catch{storage=null;}
let save=loadSave(storage),game,input,portraits=[];
if(matchMedia('(prefers-reduced-motion: reduce)').matches)save.reducedMotion=true;
const view=new View(root,action);
view.show('<div class="loading"><h1>Fairy Unicorn Chase</h1><p>Gathering a little magic…</p><div class="loading-star">✦</div></div>','loading');
const notice=text=>{document.querySelector('#notice').textContent=text;};
const persist=()=>{if(!writeSave(storage,save))notice('Progress can’t be saved in this browser. You can still play!');};
function start(id){audio.playing=true;game.start(id);view.play(LEVELS[id]);}
function pause(){if(view.current==='playing'){game.pause();audio.playing=false;view.pause(save);}else if(view.current==='paused')action('resume');}
function spray(){if(game.spray())audio.event('water');}
function action(name,value){audio.unlock();audio.event('tap');
  switch(name){
    case 'play':start(LEVELS.find(l=>!save.completed.includes(l.id))?.id??0);break;
    case 'level':start(Number(value));break;
    case 'levels':game.showTitle();audio.playing=false;view.levels(save,portraits);break;
    case 'collection':game.showTitle();audio.playing=false;view.collection(save,portraits);break;
    case 'home':game.showTitle();audio.playing=false;view.title(save);break;
    case 'pause':pause();break;
    case 'resume':game.resume();audio.playing=true;view.play(game.level);break;
    case 'restart':start(game.level.id);break;
    case 'continue':start(Math.min(9,game.level.id+1));break;
    case 'sound':save.sound=!save.sound;audio.toggle(save.sound);persist();if(view.current==='paused')view.pause(save);else if(view.current==='title')view.title(save);else if(view.current==='levels')view.levels(save,portraits);else if(view.current==='collection')view.collection(save,portraits);break;
    case 'reload':location.reload();break;
  }
}
root.addEventListener('change',e=>{if(e.target.id==='quality'){save.quality=e.target.value;game.setQuality(save.quality);}if(e.target.id==='motion'){save.reducedMotion=e.target.checked;game.reducedMotion=save.reducedMotion;}persist();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game?.mode==='playing')pause();});
await loadWorldAssets();
try{
  game=new GameScene(document.querySelector('#world'),{quality:save.quality,reducedMotion:save.reducedMotion,onContextLoss:()=>{audio.playing=false;view.show('<section class="error-screen"><h2>The magic is taking a breather</h2><p>Your collected friends are safe. Reload to keep playing.</p><button class="button primary" data-action="reload">Reload</button></section>','error');},onEvent:(event,c)=>{
    if(event!=='catch')audio.event(event);if(event==='boost')view.encourage('Sparkle speed!');if(event==='jump')view.encourage('Wheee!');if(event==='bump')view.encourage('A little bump — keep going!');
    if(event==='catch'){save=completeLevel(save,c.level.id);persist();const final=save.completed.length===10;audio.playing=false;game.celebrate(final);audio.event(final?'final':'catch');view.complete(c.level,save,final);}
  },onFrame:c=>{view.update(c);audio.tick(game.elapsed,c.speed);if(input.waterHeld&&c.cooldown<=0)spray();}});
  portraits=renderPortraits();input=new Input(game,{onPause:pause,onSpray:spray});view.onRender=()=>input.bind();audio.toggle(save.sound);view.title(save);
}catch(error){console.error('Unable to start Fairy Unicorn Chase',error);view.error();}

// Opt-in test interface. Absent from ordinary play; no hidden completion shortcut.
// Accelerated tests advance the same physical simulation used by the live game.
if(import.meta.env.DEV||new URLSearchParams(location.search).get('test')==='1'){
  window.__fairy={get game(){return game;},get save(){return structuredClone(save);},get screen(){return view.current;},start,
    advance(seconds,steer=0){for(let i=0;i<seconds/.05&&game.mode==='playing';i++){const c=game.state;c.step(.05,steer);for(const event of c.drainEvents())game.onEvent(event,c);}if(game.mode==='playing'){game.position(game.player,game.state.s,game.state.lane,game.state.jumpHeight);game.position(game.unicorn,game.state.unicornS,game.state.unicornLane);game.updateChaseCamera(.05,true);view.update(game.state);}},
    snapshot(){const c=game.state;return c?{screen:view.current,s:c.s,lane:c.lane,speed:c.speed,boost:c.boost,jump:c.jump,water:c.water,distance:c.distance,caught:c.caught,time:c.time,stats:{...c.stats},drawCalls:game.renderer.info.render.calls,triangles:game.renderer.info.render.triangles}:{};}
  };
}
