// js/cartridges/cart_087_matrix_iq.js
// ============================================================================
// Cartridge #087: MATRIX IQ
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 87. PATTERN MATRIX
CARTS[87] = {
  id: 87, name: "MATRIX IQ", genre: 8, scoreLabel: "STREAK",
  desc: "PROGRESSIVE 3X3 MATRIX: DEDUCE THE 9TH SHAPE FROM ROTATION/COUNT RULES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) g.px(x + 8 + c * 8, y + 8 + r * 8, 3);
    }
  },
  init() {
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
    g.text("PATTERN MATRIX IQ", 14, 14, 3);
    const ox = 78, oy = 50, sz = 32;
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        if (x === 2 && y === 2) g.text("?", bx + 13, by + 13, 3);
        else g.disc(bx + 16, by + 16, 4 + (x + y), 2);
      }
    }
    g.textC("[A] SELECT MATCHING SHAPE", 180, 2);
  }
};
