// js/cartridges/cart_091_life.js
// ============================================================================
// Cartridge #091: LIFE
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 91. CONWAY'S LIFE
CARTS[91] = {
  id: 91, name: "LIFE", genre: 9, scoreLabel: "GENS",
  desc: "CONWAY'S GAME OF LIFE: DRAW LIVE CELLS OR WATCH GLIDERS & PULSARS EVOLVE!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 10, y + 10, 4, 4, 3);
    g.rect(x + 14, y + 14, 4, 4, 3);
    g.rect(x + 10, y + 18, 4, 4, 3);
    g.rect(x + 14, y + 18, 4, 4, 3);
    g.rect(x + 18, y + 18, 4, 4, 3);
  },
  init() {
    this.grid = E1.create(32, 30, 0);
    // Glider
    E1.set(this.grid, 2, 1, 1); E1.set(this.grid, 3, 2, 1);
    E1.set(this.grid, 1, 3, 1); E1.set(this.grid, 2, 3, 1); E1.set(this.grid, 3, 3, 1);
    this.gen = 0;
  },
  update(dt) {
    this.gen++;
    E9.stepLife(this.grid);
    SAVE.setScore(this.id, this.gen);
  },
  render(g) {
    g.clear(0);
    const sz = 7;
    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < 32; x++) {
        if (E1.get(this.grid, x, y)) g.rect(16 + x * sz, 16 + y * sz, sz - 1, sz - 1, 3);
      }
    }
    g.text("GEN: " + this.gen, 14, 4, 3);
  }
};
