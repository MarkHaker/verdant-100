// js/cartridges/cart_066_slalom_ski.js
// ============================================================================
// Cartridge #066: SLALOM SKI
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 66. SLALOM SKI
CARTS[66] = {
  id: 66, name: "SLALOM SKI", genre: 6, scoreLabel: "GATES",
  desc: "DOWNHILL SKIING: STEER LEFT/RIGHT TO WEAVE BETWEEN ALTERNATING SLALOM GATES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 10, y + 8, x + 10, y + 24, 3);
    g.line(x + 22, y + 8, x + 22, y + 24, 2);
  },
  init() {
    this.skiX = 128;
    this.gates = [{ y: 260, x: 110, red: true }];
    this.score = 0;
  },
  update(dt) {
    if (PAD.state.left) this.skiX -= 120 * dt;
    if (PAD.state.right) this.skiX += 120 * dt;
    for (let g of this.gates) {
      g.y -= 100 * dt;
      if (g.y < 40 && !g.passed) {
        g.passed = true;
        this.score++;
        APU.sfx('COIN');
      }
    }
    if (this.gates[this.gates.length - 1].y < 160) {
      this.gates.push({ y: 260, x: Math.random() * 140 + 50, red: Math.random() < 0.5 });
    }
  },
  render(g) {
    g.clear(0);
    for (let gt of this.gates) {
      g.rect(Math.floor(gt.x), Math.floor(gt.y), 6, 16, gt.red ? 3 : 2);
      g.rect(Math.floor(gt.x) + 40, Math.floor(gt.y), 6, 16, gt.red ? 3 : 2);
    }
    g.disc(Math.floor(this.skiX), 40, 4, 3);
    g.text("GATES: " + this.score, 14, 14, 3);
  }
};
