import { courseItems, MAGIC } from "../config/levels.js";
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export class Chase {
  constructor(level) {
    this.level = level;
    this.items = courseItems(level);
    this.time = 0;
    this.s = 0;
    this.unicornS = level.lead;
    this.lane = 0;
    this.unicornLane = 0;
    this.speed = level.playerSpeed;
    this.boost = 0;
    this.slow = 0;
    this.jump = 0;
    this.water = 0;
    this.cooldown = 0;
    this.caught = false;
    this.events = [];
    this.collected = new Set();
    this.touched = new Set();
    this.lap = Math.PI * 2 * level.radius;
    this.stats = { potions: 0, jumps: 0, bumps: 0, sprays: 0 };
  }
  spray() {
    if (this.cooldown > 0 || this.caught) return false;
    this.water = MAGIC.sprayDuration;
    this.cooldown = MAGIC.sprayCooldown;
    this.stats.sprays++;
    this.events.push("water");
    return true;
  }
  step(dt, steer = 0) {
    if (this.caught) return;
    dt = clamp(dt, 0, 0.05);
    this.time += dt;
    this.boost = Math.max(0, this.boost - dt);
    this.slow = Math.max(0, this.slow - dt);
    this.jump = Math.max(0, this.jump - dt);
    this.water = Math.max(0, this.water - dt);
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.lane +=
      (clamp(steer, -1, 1) * this.level.width * 0.39 - this.lane) *
      (1 - Math.exp(-dt * 3.8));
    const target =
      this.level.playerSpeed +
      (this.boost > 0 ? this.level.boostSpeed : 0) -
      (this.slow > 0 ? 2.5 : 0);
    this.speed += (target - this.speed) * (1 - Math.exp(-dt * 5));
    this.s += this.speed * dt;
    const assist = clamp((this.time - this.level.assistanceAfter) / 22, 0, 1);
    const leash = this.distance > 85 ? 1 : 0;
    let unicornSpeed = this.level.unicornSpeed - assist * 2.2 - leash;
    const gap = this.unicornS - this.s;
    const needsAlignment = Math.abs(this.lane - this.unicornLane) >= 2.5 + assist;
    // Stay playfully alongside an overtake until the rider lines up. Adjust speed,
    // never teleport position or celebrate a unicorn far behind the rider.
    if (gap < 2 || (gap < 6 && needsAlignment)) {
      unicornSpeed = Math.max(unicornSpeed, this.speed + 1);
    }
    this.unicornS += unicornSpeed * dt;
    // The unicorn eases toward the middle as the player gets close.
    this.unicornLane =
      Math.sin(this.time * 0.36 + this.level.id) *
      2.2 *
      clamp(this.distance / 18, 0, 1);
    const lap = Math.floor(this.s / this.lap);
    for (const item of this.items) {
      const key = `${lap}:${item.id}`,
        d = item.s + lap * this.lap - this.s;
      if (Math.abs(this.lane - item.lane) > item.radius) continue;
      if (
        item.kind === "potion" &&
        Math.abs(d) < 1.35 &&
        !this.collected.has(key)
      ) {
        this.collected.add(key);
        this.boost = this.level.boostDuration;
        this.stats.potions++;
        this.events.push("boost");
      } else if (
        (item.kind === "puddle" || item.kind === "log") &&
        d < 4.2 &&
        d > -0.8 &&
        !this.touched.has(key)
      ) {
        this.touched.add(key);
        this.jump = 0.95;
        this.stats.jumps++;
        this.events.push("jump");
      } else if (
        (item.kind === "tree" || item.kind === "crystal") &&
        Math.abs(d) < 1.5 &&
        !this.touched.has(key)
      ) {
        this.touched.add(key);
        this.slow = 1.1;
        this.stats.bumps++;
        this.events.push("bump");
      }
    }
    if (
      Math.abs(this.unicornS - this.s) <= 3.8 &&
      Math.abs(this.lane - this.unicornLane) < 2.5 + assist
    ) {
      this.caught = true;
      this.events.push("catch");
    }
  }
  get distance() {
    return Math.max(0, this.unicornS - this.s);
  }
  get jumpHeight() {
    return this.jump > 0
      ? Math.sin((1 - this.jump / 0.95) * Math.PI) * 1.55
      : 0;
  }
  drainEvents() {
    const e = this.events;
    this.events = [];
    return e;
  }
}
