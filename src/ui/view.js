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
    this.closeNewGameConfirmation(false);
    this.current = current;
    this.root.innerHTML = html;
    this.root.dataset.screen = current;
    this.renderUpdate();
    this.onRender?.();
    const focus = this.root.querySelector("[data-focus]");
    focus?.focus({ preventScroll: true });
  }
  title(save) {
    const n = save.completed.length;
    const install = this.pwa?.installed ? "" : `<button class="button paper title-install" data-action="install" aria-label="Add to Home Screen">${icon("install")}<span>Install</span></button>`;
    this.show(
      `<section class="title-screen"><div class="title-top">${install}${this.button("new-game", "New game", "restart", "button paper title-new-game")}${this.sound(save)}</div><div class="title-copy"><h1>Fairy<br /><span>Unicorn</span><br />Chase</h1><p>Mia & Glender’s magical adventure</p>${this.button("play", n > 0 && n < LEVELS.length ? "Keep playing" : "Let’s play", "play", "button primary jumbo")}<nav class="title-links" aria-label="Adventure menus">${this.button("levels", "Worlds", "map", "button quiet")}${this.button("collection", "Unicorns", "book", "button quiet")}</nav></div><div class="title-note">${LEVELS.length} magical worlds.<br />${LEVELS.length} new friends.</div>${n ? `<div class="saved-progress">${icon("star")} ${n} / ${LEVELS.length} unicorns found</div>` : ""}</section>`,
      "title",
    );
  }
  header(title, save, back = "home") {
    return `<header class="book-header">${this.button(back, "Back", "back", "round labeled")}<h2>${title}</h2>${this.sound(save)}</header>`;
  }
  renderUpdate() {
    this.root.querySelector(".update-banner")?.remove();
    delete this.root.dataset.update;
    if (!this.pwa?.updateReady || this.newGameDialog?.open ||
      !["title", "paused", "levels", "collection", "install"].includes(this.current)) return;
    this.root.dataset.update = "ready";
    this.root.insertAdjacentHTML("beforeend", `<aside class="update-banner" aria-label="Game update"><div role="status"><strong>New magic is ready</strong><span>Update for the latest adventures. Your unicorns stay saved.</span></div><button class="button primary" data-action="update-app" ${this.pwa.updating ? "disabled" : ""}>${icon("install")}<span>${this.pwa.updating ? "Updating…" : "Update game"}</span></button></aside>`);
  }
  install(save, pwa) {
    const ios = `<section><h3>iPhone & iPad</h3><ol><li>Open this game in Safari and tap <strong>Share</strong>.</li><li>Choose <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</li><li>Tap the unicorn icon on your Home Screen to play.</li></ol></section>`;
    const android = `<section><h3>Android</h3><ol><li>Open this game in Chrome and open the browser menu.</li><li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong> and follow the prompt.</li><li>Tap the unicorn icon on your Home Screen to play.</li></ol></section>`;
    this.show(
      `<section class="book-screen install-screen">${this.header("Home Screen", save)}<div class="install-content"><img class="install-art" src="./icons/icon-192.png" alt="A friendly white unicorn with a pastel mane" width="96" height="96"/><h2>Keep the magic close</h2><p>Give Mia & Glender a home on your Home Screen.</p>${pwa.installed ? `<p class="install-status" role="status">The game is installed. Look for the unicorn icon!</p>` : `${pwa.canInstall ? this.button("install-app", "Install game", "install", "button primary") : ""}<div class="install-steps">${pwa.platform === "ios" ? ios : pwa.platform === "android" ? android : `${ios}${android}<p>On a computer, use your browser’s install option or Safari’s <strong>File → Add to Dock</strong>.</p>`}</div>`}<p class="install-status" role="status">${pwa.offlineReady ? "Ready for offline adventures. You can play without a connection on this device." : "For offline adventures, keep the game open with an internet connection for a moment while it saves."}</p></div></section>`,
      "install",
    );
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
    const boostStatus = document.querySelector("#boost-status"),
      boostText = c.boost > 0 ? "Sparkle speed!" : "";
    if (boostStatus.textContent !== boostText) boostStatus.textContent = boostText;
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
      `<section class="pause-screen"><div class="pause-sheet"><h2>A little breather</h2><p>Mia & Glender will wait for you</p>${this.button("resume", "Keep chasing", "play", "button primary jumbo")}${this.button("restart", "Start this world again", "restart")}<div class="pause-menu">${this.button("home", "Home", "home")}${this.button("new-game", "New game", "restart")}</div><div class="preferences">${this.button("sound", save.sound ? "Sound on" : "Sound off", save.sound ? "sound" : "mute", "button small")}<label>Picture<select id="quality" aria-label="Picture quality"><option value="auto" ${save.quality === "auto" ? "selected" : ""}>Automatic</option><option value="low" ${save.quality === "low" ? "selected" : ""}>Gentle</option><option value="high" ${save.quality === "high" ? "selected" : ""}>Crisp</option></select></label><label class="motion-option"><input id="motion" type="checkbox" ${save.reducedMotion ? "checked" : ""}/>Gentle motion</label></div></div></section>`,
      "paused",
    );
  }
  confirmNewGame() {
    if (this.newGameDialog) return;
    this.newGameOpener = this.root.querySelector('[data-action="new-game"]');
    this.root.insertAdjacentHTML(
      "beforeend",
      `<dialog class="new-game-dialog" aria-labelledby="new-game-title" aria-describedby="new-game-description"><h2 id="new-game-title">Start a new adventure?</h2><p id="new-game-description">Your collected unicorns and world unlocks will reset. You’ll start again in Rainbow Meadow.</p><p class="new-game-preferences">Your sound, picture and gentle motion settings will stay the same.</p><div class="new-game-actions"><button class="button primary" data-action="cancel-new-game" autofocus>${icon("back")}<span>Cancel</span></button>${this.button("confirm-new-game", "Start new game", "restart")}</div></dialog>`,
    );
    const dialog = this.root.querySelector(".new-game-dialog");
    this.newGameDialog = dialog;
    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      this.onAction("cancel-new-game");
    });
    dialog.showModal();
    this.renderUpdate();
    dialog.querySelector('[data-action="cancel-new-game"]').focus();
  }
  closeNewGameConfirmation(restoreFocus = true) {
    if (!this.newGameDialog) return;
    this.newGameDialog.close();
    this.newGameDialog.remove();
    this.newGameDialog = null;
    this.renderUpdate();
    if (restoreFocus && this.newGameOpener?.isConnected)
      this.newGameOpener.focus({ preventScroll: true });
    this.newGameOpener = null;
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
