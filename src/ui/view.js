import { LEVELS } from "../config/levels.js";
import { unlockCount } from "../game/save.js";
import { icon, worldIcon } from "./icons.js";
export class View {
  constructor(root, onAction) {
    this.root = root;
    this.onAction = onAction;
    this.current = "loading";
    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-action]");
      if (b && !b.disabled) this.onAction(b.dataset.action, b.dataset.value);
    });
  }
  button(action, text, symbol = "play", cls = "button", value = "") {
    return `<button class="${cls}" data-action="${action}" data-value="${value}" aria-label="${text}">${icon(symbol)}<span>${text}</span></button>`;
  }
  sound(save) {
    return `<button class="round sound-toggle" data-action="sound" aria-label="${save.sound ? "Mute sound" : "Turn sound on"}" aria-pressed="${save.sound}">${icon(save.sound ? "sound" : "mute")}</button>`;
  }
  show(html, current) {
    this.current = current;
    this.root.innerHTML = html;
    this.root.dataset.screen = current;
    this.onRender?.();
    const focus = this.root.querySelector("[data-focus]");
    focus?.focus({ preventScroll: true });
  }
  title(save) {
    const n = save.completed.length;
    this.show(
      `<section class="title-screen"><div class="title-top">${this.sound(save)}</div><div class="title-copy"><h1>Fairy<br /><span>Unicorn</span><br />Chase</h1><p>Mia & Glender’s magical adventure</p>${this.button("play", n > 0 && n < LEVELS.length ? "Keep playing" : "Let’s play", "play", "button primary jumbo")}<nav class="title-links" aria-label="Adventure menus">${this.button("levels", "Worlds", "map", "button quiet")}${this.button("collection", "Unicorns", "book", "button quiet")}</nav></div><div class="title-note">${LEVELS.length} magical worlds.<br />${LEVELS.length} new friends.</div>${n ? `<div class="saved-progress">${icon("star")} ${n} / ${LEVELS.length} unicorns found</div>` : ""}</section>`,
      "title",
    );
  }
  header(title, save, back = "home") {
    return `<header class="book-header">${this.button(back, "Back", "back", "round labeled")}<h2>${title}</h2>${this.sound(save)}</header>`;
  }
  levels(save, portraits) {
    const count = unlockCount(save);
    this.show(
      `<section class="book-screen">${this.header("Choose a world", save)}<p class="book-subtitle">One magical friend in every world</p><div class="world-grid">${LEVELS.map(
        (l) => {
          const locked = l.id >= count,
            caught = save.completed.includes(l.id);
          return `<button class="world-tile ${locked ? "locked" : ""}" data-action="level" data-value="${l.id}" ${locked ? "disabled" : ""} style="--tile:${l.sky};--accent:${l.accent}" aria-label="${l.name}${locked ? ", locked" : caught ? ", completed" : ""}"><div class="world-art">${icon(worldIcon[l.id], "landmark")}<img src="${portraits[l.id]}" alt="" class="tile-pony"/>${icon(locked ? "lock" : caught ? "check" : "play", "tile-state")}</div><span class="tile-number">${l.id + 1}</span><span class="tile-name">${l.name}</span></button>`;
        },
      ).join("")}</div></section>`,
      "levels",
    );
  }
  collection(save, portraits) {
    this.show(
      `<section class="book-screen collection-screen">${this.header("Our unicorn friends", save)}<p class="book-subtitle">${save.completed.length} of ${LEVELS.length} friends found</p><div class="collection-grid">${LEVELS.map(
        (l) => {
          const caught = save.completed.includes(l.id);
          return `<button class="collection-tile ${caught ? "found" : "unknown"}" data-action="${caught ? "level" : "levels"}" data-value="${l.id}" aria-label="${caught ? `Visit ${l.unicorn} in ${l.name}` : "Find this unicorn"}"><div class="portrait"><img src="${portraits[l.id]}" alt="${caught ? `White unicorn with ${l.mane === "rainbow" ? "rainbow" : "colorful"} hair` : ""}"/>${caught ? "" : icon("lock")}</div><span>${caught ? l.unicorn : "Who’s next?"}</span><small>${caught ? l.name : `World ${l.id + 1}`}</small></button>`;
        },
      ).join("")}</div></section>`,
      "collection",
    );
  }
  play(level) {
    this.show(
      `<section class="game-screen"><header class="hud"><div class="world-label">${icon(worldIcon[level.id])}<div><span>${level.name}</span><small>Friend ${level.id + 1} of ${LEVELS.length}</small></div></div><div class="chase-meter" aria-label="Distance to unicorn"><span id="chase-text">Follow ${level.unicorn}!</span><div class="distance-track"><i id="distance-fill"></i>${icon("star")}</div></div><button class="round pause-button" data-action="pause" aria-label="Pause game">${icon("pause")}</button></header><div id="encouragement" class="encouragement" role="status">${level.id === 0 ? "Hold an arrow to steer" : ""}</div><div class="touch-controls"><button id="left" class="steer left" aria-label="Steer left">${icon("left")}</button><div class="right-controls"><button id="water" class="water-control" aria-label="Spray water">${icon("water")}</button><button id="right" class="steer right" aria-label="Steer right">${icon("right")}</button></div></div><div class="boost-status" id="boost-status" aria-live="polite"></div></section>`,
      "playing",
    );
  }
  update(c) {
    if (this.current !== "playing") return;
    const txt = document.querySelector("#chase-text"),
      fill = document.querySelector("#distance-fill");
    txt.textContent =
      c.distance < 12 ? "Almost there!" : `Follow ${c.level.unicorn}!`;
    fill.style.transform = `scaleX(${Math.max(0.08, 1 - (c.distance / c.level.lead) * 0.85)})`;
    document.querySelector("#boost-status").textContent =
      c.boost > 0 ? "Sparkle speed!" : "";
    if (
      c.time > 7 &&
      document.querySelector("#encouragement").textContent ===
        "Hold an arrow to steer"
    )
      document.querySelector("#encouragement").textContent = "";
  }
  encourage(text) {
    const el = document.querySelector("#encouragement");
    if (!el) return;
    el.textContent = text;
    clearTimeout(this.hintTimer);
    this.hintTimer = setTimeout(() => {
      if (el.isConnected) el.textContent = "";
    }, 2200);
  }
  pause(save) {
    this.show(
      `<section class="pause-screen"><div class="pause-sheet"><h2>A little breather</h2><p>Mia & Glender will wait for you</p>${this.button("resume", "Keep chasing", "play", "button primary jumbo")}${this.button("restart", "Start this world again", "restart")}${this.button("home", "Home", "home")}<div class="preferences">${this.button("sound", save.sound ? "Sound on" : "Sound off", save.sound ? "sound" : "mute", "button small")}<label>Picture<select id="quality" aria-label="Picture quality"><option value="auto" ${save.quality === "auto" ? "selected" : ""}>Automatic</option><option value="low" ${save.quality === "low" ? "selected" : ""}>Gentle</option><option value="high" ${save.quality === "high" ? "selected" : ""}>Crisp</option></select></label><label class="motion-option"><input id="motion" type="checkbox" ${save.reducedMotion ? "checked" : ""}/>Gentle motion</label></div></div></section>`,
      "paused",
    );
  }
  complete(level, save, final) {
    this.show(
      `<section class="celebration-screen"><div class="celebration-title">${icon("star")}<h2>${final ? `All ${LEVELS.length} friends!` : `You found ${level.unicorn}!`}</h2><p>${final ? "Mia, Glender & the whole unicorn family" : `${level.name} · a new friend for your collection`}</p></div><div class="celebration-actions">${this.button(final ? "levels" : "continue", final ? "Play again" : "Continue", "play", "button primary jumbo")}${this.button("collection", "Our unicorns", "book", "button paper")}</div></section>`,
      final ? "final" : "complete",
    );
  }
  error() {
    this.show(
      `<section class="error-screen"><h1>A little magic needs a hand</h1><p>The 3D scene couldn’t start. Try reloading, or open this page in Safari or Chrome with WebGL enabled.</p>${this.button("reload", "Try again", "restart", "button primary")}</section>`,
      "error",
    );
  }
}
