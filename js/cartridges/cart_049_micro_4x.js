// js/cartridges/cart_049_micro_4x.js
// ============================================================================
// Cartridge #049: MICRO-4X
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 49. MICRO-4X
CARTS[49] = {
  id: 49, name: "MICRO-4X", genre: 4, scoreLabel: "EMPIRE",
  desc: "20 TURNS 4X EMPIRE: BALANCE BUDGET AMONG SCIENCE, MILITARY, AND COLONIES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 10, y + 10, 4, 3);
    g.disc(x + 22, y + 20, 5, 2);
    g.line(x + 10, y + 10, x + 22, y + 20, 1);
  },
  init() {
    this.turn = 1;
    this.sci = 10; this.mil = 10; this.col = 10;
  },
  update(dt) {
    if (PAD.hit('a') && this.turn < 20) {
      this.turn++;
      this.sci += 5; this.col += 3;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.sci + this.col);
    }
  },
  render(g) {
    g.clear(0);
    g.text("MICRO-4X EMPIRE", 14, 14, 3);
    g.text("TURN: " + this.turn + "/20", 14, 34, 2);
    g.text("SCIENCE: " + this.sci, 14, 54, 3);
    g.text("COLONIES: " + this.col, 14, 74, 3);
    g.textC("[A] NEXT TURN", 180, 3);
  }
};
