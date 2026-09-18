// js/cartridges/cart_089_odd_pixel.js
// ============================================================================
// Cartridge #089: ODD PIXEL
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 89. ODD PIXEL OUT
CARTS[89] = {
  id: 89, name: "ODD PIXEL", genre: 8, scoreLabel: "MS",
  desc: "8X8 GRID OF IDENTICAL RUNES: SPOT THE SINGLE ANOMALOUS ALTERED GLYPH!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text(":::", x + 8, y + 13, 3);
  },
  init() {
    this.oddX = 3; this.oddY = 4;
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.score++;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.text("ODD PIXEL OUT", 14, 14, 3);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const bx = 48 + x * 20, by = 40 + y * 20;
        if (x === this.oddX && y === this.oddY) g.text("#", bx, by, 3);
        else g.text("·", bx, by, 2);
      }
    }
    g.textC("[A] SPOT ANOMALY", 210, 2);
  }
};
