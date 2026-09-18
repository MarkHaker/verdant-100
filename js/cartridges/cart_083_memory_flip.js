// js/cartridges/cart_083_memory_flip.js
// ============================================================================
// Cartridge #083: MEMORY FLIP
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 83. MEMORY FLIP
CARTS[83] = {
  id: 83, name: "MEMORY FLIP", genre: 8, scoreLabel: "TURNS",
  desc: "CONCENTRATION: FLIP PAIRS OF RUNIC CARDS AND REMEMBER POSITIONS TO CLEAR!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 6, y + 8, 8, 12, 3);
    g.box(x + 18, y + 8, 8, 12, 3);
  },
  init() {
    this.cards = [1, 1, 2, 2, 3, 3, 4, 4];
    this.revealed = [false, false, false, false, false, false, false, false];
    this.cursor = 0;
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('left')) this.cursor = Math.max(0, this.cursor - 1);
    if (PAD.hit('right')) this.cursor = Math.min(7, this.cursor + 1);
    if (PAD.hit('a')) {
      this.revealed[this.cursor] = true;
      APU.sfx('TICK');
    }
  },
  render(g) {
    g.clear(0);
    g.text("MEMORY FLIP", 14, 14, 3);
    for (let i = 0; i < 8; i++) {
      const bx = 30 + (i % 4) * 50, by = 60 + Math.floor(i / 4) * 60;
      g.box(bx, by, 40, 50, i === this.cursor ? 3 : 2);
      if (this.revealed[i]) g.text("★" + this.cards[i], bx + 12, by + 20, 3);
    }
  }
};
