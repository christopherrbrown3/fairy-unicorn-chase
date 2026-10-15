export class Input {
  constructor(game, { onPause, onSpray }) {
    this.game = game;
    this.onPause = onPause;
    this.onSpray = onSpray;
    this.keys = new Set();
    this.pointers = new Map();
    this.waterHeld = false;
    addEventListener("keydown", (e) => {
      // Menus and the reset dialog keep native button and Escape behavior.
      if (e.defaultPrevented || e.target.closest?.("dialog")) return;
      if (
        ["ArrowLeft", "ArrowRight", "a", "A", "d", "D", " ", "Escape"].includes(
          e.key,
        ) &&
        !["SELECT", "INPUT"].includes(e.target.tagName) &&
        (this.game.mode === "playing" || e.key === "Escape") &&
        !(e.key === " " && e.target.tagName === "BUTTON")
      ) {
        e.preventDefault();
        if (e.key === "Escape") {
          if (!e.repeat) onPause();
          return;
        }
        if (e.key === " ") {
          onSpray();
          return;
        }
        this.keys.add(e.key.toLowerCase());
        this.update();
      }
    });
    addEventListener("keyup", (e) => {
      this.keys.delete(e.key.toLowerCase());
      this.update();
    });
    addEventListener("blur", () => this.clear());
  }
  bind() {
    this.clear();
    for (const [id, value] of [
      ["left", -1],
      ["right", 1],
      ["water", 0],
    ]) {
      const b = document.getElementById(id);
      if (!b) continue;
      b.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        b.setPointerCapture(e.pointerId);
        this.pointers.set(e.pointerId, { value, id });
        b.classList.add("held");
        if (id === "water") {
          this.waterHeld = true;
          this.onSpray();
        }
        this.update();
      });
      const release = (e) => {
        this.pointers.delete(e.pointerId);
        b.classList.remove("held");
        this.waterHeld = [...this.pointers.values()].some(
          (p) => p.id === "water",
        );
        this.update();
      };
      b.addEventListener("pointerup", release);
      b.addEventListener("pointercancel", release);
      b.addEventListener("lostpointercapture", release);
    }
  }
  update() {
    let left = this.keys.has("arrowleft") || this.keys.has("a"),
      right = this.keys.has("arrowright") || this.keys.has("d");
    for (const p of this.pointers.values()) {
      if (p.value < 0) left = true;
      if (p.value > 0) right = true;
    }
    this.game.steer = (right ? 1 : 0) - (left ? 1 : 0);
  }
  clear() {
    this.keys.clear();
    this.pointers.clear();
    this.waterHeld = false;
    this.game.steer = 0;
  }
}
