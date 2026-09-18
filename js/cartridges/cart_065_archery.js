// js/cartridges/cart_065_archery.js
// ============================================================================
// Cartridge #065: ARCHERY
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 65. ARCHERY RANGE
CARTS[65] = {
  id: 65, name: "ARCHERY", genre: 6, scoreLabel: "POINTS",
  desc: "RETICLE SWAYS WITH BREATHING SINE WAVE. HOLD [A] TO DRAW BOW, RELEASE TO FIRE!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.circle(x + 16, y + 16, 10, 2);
    g.disc(x + 16, y + 16, 3, 3);
  },
  init() {
    this.t = 0;
    this.score = 0;
  },
  update(dt) {
    this.t += dt;
    if (PAD.hit('a')) {
      const rx = 128 + Math.sin(this.t * 2) * 30;
      const ry = 110 + Math.cos(this.t * 3) * 20;
      const dist = Math.hypot(rx - 128, ry - 110);
      if (dist < 10) { this.score += 10; APU.sfx('COIN'); }
      else if (dist < 25) { this.score += 5; APU.sfx('HIT'); }
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.circle(128, 110, 40, 1);
    g.circle(128, 110, 25, 2);
    g.disc(128, 110, 10, 3);

    const rx = 128 + Math.sin(this.t * 2) * 30;
    const ry = 110 + Math.cos(this.t * 3) * 20;
    g.line(rx - 4, ry, rx + 4, ry, 3);
    g.line(rx, ry - 4, rx, ry + 4, 3);

    g.text("SCORE: " + this.score, 14, 14, 3);
  }
};
