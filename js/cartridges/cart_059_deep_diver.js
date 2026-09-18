// js/cartridges/cart_059_deep_diver.js
// ============================================================================
// Cartridge #059: DEEP DIVER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 59. DEEP DIVER
CARTS[59] = {
  id: 59, name: "DEEP DIVER", genre: 5, scoreLabel: "PEARLS",
  desc: "DIVE FOR PEARLS AMONG PATROLLING SHARKS. MONITOR RAPIDLY DEPLETING O2!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 16, 6, 3);
    g.disc(x + 22, y + 22, 2, 3);
  },
  init() {
    this.py = 40; this.o2 = 100;
    this.pearls = 0;
  },
  update(dt) {
    if (PAD.state.down) this.py = Math.min(200, this.py + 70 * dt);
    if (PAD.state.up) this.py = Math.max(20, this.py - 70 * dt);
    this.o2 -= 12 * dt;
    if (this.py >= 190 && PAD.hit('a')) {
      this.pearls++;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.pearls);
    }
  },
  render(g) {
    g.clear(0);
    g.text("DEEP DIVER", 14, 14, 3);
    g.text("O2: " + Math.max(0, Math.floor(this.o2)) + "%", 14, 30, 2);
    g.textR("PEARLS: " + this.pearls, 240, 14, 3);
    g.disc(128, Math.floor(this.py), 6, 3);
    g.rect(0, 220, 256, 20, 1);
  }
};
