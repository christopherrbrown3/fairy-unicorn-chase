export class Audio {
  constructor() {
    this.enabled = true;
    this.context = null;
    this.playing = false;
    this.lastHoof = 0;
    this.note = 0;
    this.nextMusic = 0;
  }
  async unlock() {
    try {
      if (!this.context) {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return;
        this.context = new C();
        this.master = this.context.createGain();
        this.master.gain.value = this.enabled ? 0.16 : 0;
        this.master.connect(this.context.destination);
      }
      if (this.context.state === "suspended") await this.context.resume();
    } catch {
      /* Muted play remains fully usable. */
    }
  }
  toggle(value) {
    this.enabled = value;
    if (this.master)
      this.master.gain.setTargetAtTime(
        value ? 0.16 : 0,
        this.context.currentTime,
        0.03,
      );
  }
  tone(freq, duration = 0.2, delay = 0, type = "sine", volume = 0.4) {
    if (!this.enabled || !this.context || this.context.state !== "running")
      return;
    const t = this.context.currentTime + delay,
      o = this.context.createOscillator(),
      g = this.context.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(volume, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + duration + 0.02);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  }
  event(name) {
    const notes = {
      tap: [660],
      boost: [523, 659, 784, 1047],
      jump: [392, 587],
      water: [1320, 1175, 988],
      bump: [220, 294],
      catch: [523, 659, 784, 1047, 1319],
      final: [523, 659, 784, 1047, 1175, 1319, 1568],
    };
    (notes[name] || []).forEach((f, i) =>
      this.tone(
        f,
        name === "water" ? 0.11 : 0.3,
        i * 0.09,
        name === "bump" ? "triangle" : "sine",
        name === "water" ? 0.14 : 0.5,
      ),
    );
  }
  tick(time, speed) {
    if (!this.playing || !this.enabled) return;
    if (time - this.lastHoof > 0.23 * (10 / speed)) {
      this.tone(125, 0.07, 0, "triangle", 0.2);
      this.tone(95, 0.06, 0.07, "triangle", 0.15);
      this.lastHoof = time;
    }
    if (time > this.nextMusic) {
      const melody = [
        523, 659, 784, 659, 587, 698, 880, 698, 523, 659, 784, 1047, 880, 784,
        659, 587,
      ];
      this.tone(melody[this.note % melody.length], 0.48, 0, "sine", 0.12);
      if (this.note % 4 === 0)
        this.tone(
          [262, 294, 262, 349][Math.floor(this.note / 4) % 4],
          0.9,
          0,
          "triangle",
          0.08,
        );
      this.note++;
      this.nextMusic = time + 0.48;
    }
  }
}
