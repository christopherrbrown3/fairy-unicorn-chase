import * as THREE from "three";

const COLORS = [
  "#f49cba",
  "#ffc78e",
  "#ffeb9b",
  "#a1dfb8",
  "#98d9f2",
  "#c2b0ef",
];
// One bounded mesh follows actual travelled positions, including turns and jumps.
export class RainbowTrail {
  constructor(scene) {
    this.samples = [];
    const max = 40 * 6 * 6;
    this.positions = new Float32Array(max * 3);
    this.colors = new Float32Array(max * 3);
    this.alpha = new Float32Array(max);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    geo.setAttribute("color", new THREE.BufferAttribute(this.colors, 3));
    geo.setAttribute(
      "alpha",
      new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage),
    );
    this.palette = COLORS.map((c) => new THREE.Color(c));
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      vertexColors: true,
      vertexShader: `attribute float alpha; varying vec3 trailColor; varying float trailAlpha;
        void main(){trailColor=color;trailAlpha=alpha;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `varying vec3 trailColor; varying float trailAlpha;
        void main(){gl_FragColor=vec4(trailColor,trailAlpha);
        #include <colorspace_fragment>
        }`,
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.name = "Rainbow boost ribbon";
    this.mesh.frustumCulled = false;
    this.clear();
    scene.add(this.mesh);
  }
  clear() {
    this.samples.length = 0;
    this.mesh.visible = false;
    this.mesh.geometry.setDrawRange(0, 0);
  }
  update(dt, player, active) {
    this.samples.forEach((s) => (s.age += dt));
    this.samples = this.samples.filter((s) => s.age < 0.65);
    if (active) {
      const a = player.rotation.y,
        fx = Math.sin(a),
        fz = Math.cos(a);
      const pos = player.position
        .clone()
        .add(new THREE.Vector3(-fx * 1.05, 0.38, -fz * 1.05));
      const last = this.samples.at(-1);
      if (last && last.pos.distanceTo(pos) > 5) this.samples.length = 0;
      this.samples.push({ pos, right: new THREE.Vector3(fz, 0, -fx), age: 0 });
      if (this.samples.length > 40) this.samples.shift();
    }
    let v = 0;
    for (let i = 1; i < this.samples.length; i++) {
      const a = this.samples[i - 1],
        b = this.samples[i];
      for (let band = 0; band < 6; band++) {
        const color = this.palette[band];
        for (const [s, edge] of [
          [a, 0],
          [b, 0],
          [a, 1],
          [a, 1],
          [b, 0],
          [b, 1],
        ]) {
          const fade = 1 - s.age / 0.65;
          const p = s.pos
            .clone()
            .addScaledVector(s.right, ((band + edge) / 6 - 0.5) * 1.5);
          this.positions.set(
            [p.x, p.y + Math.sin(i * 0.2) * 0.025, p.z],
            v * 3,
          );
          this.colors.set([color.r, color.g, color.b], v * 3);
          this.alpha[v++] = fade * fade * 0.55;
        }
      }
    }
    for (const name of ["position", "color", "alpha"])
      this.mesh.geometry.attributes[name].needsUpdate = true;
    this.mesh.geometry.setDrawRange(0, v);
    this.mesh.visible = v > 0;
  }
  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.mesh.removeFromParent();
  }
}
