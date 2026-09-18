// js/cartridges/cart_084_chimp_test.js
// ============================================================================
// Cartridge #084: CHIMP TEST
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 84. CHIMP TEST
CARTS[84] = {
  id: 84, name: "CHIMP TEST", genre: 8, scoreLabel: "SEQUENCE",
  desc: "WORKING MEMORY BENCHMARK: NUMBERS FLASH BRIEFLY; CLICK TILES IN ORDER!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("1 2 3", x + 4, y + 13, 3);
  },
  init() {
    this.tiles = [1, 2, 3, 4, 5];
    this.hidden = false;
    this.timer = 1.5;
    this.score = 5;
  },
  update(dt) {
    this.timer -= dt;
    if (this.timer <= 0) this.hidden = true;
    if (PAD.hit('a')) {
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.text("CHIMP MEMORY TEST", 14, 14, 3);
    for (let i = 0; i < 5; i++) {
      const bx = 30 + i * 42, by = 100;
      g.box(bx, by, 32, 32, 2);
      if (!this.hidden) g.text("" + (i + 1), bx + 12, by + 12, 3);
      else g.rect(bx + 4, by + 4, 24, 24, 1);
    }
    if (this.hidden) g.textC("[A] SUBMIT SEQUENCE ORDER", 180, 2);
  }
};
