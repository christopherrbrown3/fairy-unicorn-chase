import * as THREE from "three";
export class Particles {
  constructor(scene, count = 160) {
    this.count = count;
    this.data = Array.from({ length: count }, () => ({
      life: 0,
      v: new THREE.Vector3(),
    }));
    this.cursor = 0;
    this.positions = new Float32Array(count * 3);
    this.colors = new Float32Array(count * 3);
    this.life = new Float32Array(count);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(this.colors, 3));
    geo.setAttribute("life", new THREE.BufferAttribute(this.life, 1));
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    glow.addColorStop(0, "#ffffff");
    glow.addColorStop(0.25, "#ffffffbb");
    glow.addColorStop(1, "#ffffff00");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4,
        r = i % 2 ? 5 : 28;
      const x = 32 + Math.cos(a) * r,
        y = 32 + Math.sin(a) * r;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    this.texture = new THREE.CanvasTexture(canvas);
    this.material = new THREE.ShaderMaterial({
      uniforms: { sparkle: { value: this.texture } },
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      vertexShader: `attribute float life; varying float fade; varying vec3 sparkleColor;
        void main(){fade=life;sparkleColor=color;vec4 p=modelViewMatrix*vec4(position,1.0);
        gl_Position=projectionMatrix*p;gl_PointSize=clamp((65.0+life*35.0)/max(0.1,-p.z),1.0,30.0);}`,
      fragmentShader: `uniform sampler2D sparkle; varying float fade; varying vec3 sparkleColor;
        void main(){gl_FragColor=vec4(sparkleColor,texture2D(sparkle,gl_PointCoord).a*fade);
        #include <colorspace_fragment>
        }`,
    });
    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.clear();
  }
  emit(pos, color = "#f9e293", n = 10, velocity = null) {
    const c = new THREE.Color(color);
    for (let j = 0; j < n; j++) {
      const i = this.cursor++ % this.count,
        d = this.data[i];
      d.life = 0.55 + Math.random() * 0.7;
      d.duration = d.life;
      this.life[i] = 1;
      this.positions.set([pos.x, pos.y, pos.z], i * 3);
      this.colors.set([c.r, c.g, c.b], i * 3);
      d.v.set(
        (Math.random() - 0.5) * 3,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 3,
      );
      if (velocity) d.v.add(velocity);
    }
  }
  step(dt) {
    for (let i = 0; i < this.count; i++) {
      const d = this.data[i];
      if (d.life <= 0) continue;
      d.life -= dt;
      this.life[i] = Math.max(0, d.life / d.duration);
      for (let k = 0; k < 3; k++)
        this.positions[i * 3 + k] += d.v.getComponent(k) * dt;
      d.v.y -= 3 * dt;
      if (d.life <= 0) this.positions[i * 3 + 1] = -999;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
    this.points.geometry.attributes.life.needsUpdate = true;
  }
  clear() {
    this.data.forEach((d) => (d.life = 0));
    this.life.fill(0);
    for (let i = 0; i < this.count; i++) this.positions[i * 3 + 1] = -999;
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.life.needsUpdate = true;
  }
  dispose() {
    this.points.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
    this.points.removeFromParent();
  }
}
