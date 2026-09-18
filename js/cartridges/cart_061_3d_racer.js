// js/cartridges/cart_061_3d_racer.js
// ============================================================================
// Cartridge #061: 3D RACER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 61. PSEUDO-3D RACER
CARTS[61] = {
  id: 61, name: "3D RACER", genre: 6, scoreLabel: "DISTANCE",
  desc: "OUTRUN-STYLE HIGHWAY: ACCELERATE [A], BRAKE [B], STEER PAST TRAFFIC!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 16, y + 10, x + 4, y + 26, 2);
    g.line(x + 16, y + 10, x + 28, y + 26, 2);
    g.rect(x + 12, y + 20, 8, 4, 3);
  },
  init() {
    this.dist = 0;
    this.carX = 0;
    this.speed = 0;
    this.traffic = [{ z: 300, x: -0.3 }];
  },
  update(dt) {
    if (PAD.state.a) this.speed = Math.min(220, this.speed + 80 * dt);
    else this.speed = Math.max(0, this.speed - 50 * dt);
    if (PAD.state.left) this.carX -= 1.5 * dt;
    if (PAD.state.right) this.carX += 1.5 * dt;
    this.dist += this.speed * dt;
    SAVE.setScore(this.id, Math.floor(this.dist));
  },
  render(g) {
    g.clear(0);
    // Horizon & Road
    g.rect(0, 100, 256, 140, 1);
    for (let y = 100; y < 240; y += 8) {
      const w = (y - 100) * 1.6;
      g.line(128 - w, y, 128 + w, y, 2);
    }
    // Player car
    const cx = Math.floor(128 + this.carX * 60);
    g.rect(cx - 10, 210, 20, 10, 3);
    g.text("SPD: " + Math.floor(this.speed) + " KM/H", 14, 14, 3);
    g.textR("DIST: " + Math.floor(this.dist) + "M", 240, 14, 2);
  }
};
