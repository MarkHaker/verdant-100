// js/cartridges/cart_067_boxing_2d.js
// ============================================================================
// Cartridge #067: BOXING 2D
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 67. BOXING 2D
CARTS[67] = {
  id: 67, name: "BOXING 2D", genre: 6, scoreLabel: "ROUNDS",
  desc: "PUNCH-OUT DUEL: JAB [A], HOOK (HOLD A), BLOCK (HOLD DOWN). DODGE HOOKS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 12, y + 16, 5, 3);
    g.disc(x + 20, y + 16, 5, 2);
  },
  init() {
    this.pHP = 50; this.eHP = 50;
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.eHP -= 8;
      APU.sfx('HIT');
      if (this.eHP <= 0) {
        this.score++;
        this.eHP = 50;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.score);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("BOXING 2D", 14, 14, 3);
    g.text("YOU: " + this.pHP, 30, 40, 3);
    g.text("AI:  " + Math.max(0, this.eHP), 180, 40, 2);
    g.rect(60, 110, 36, 40, 3);
    g.rect(160, 110, 36, 40, 2);
    g.textC("[A] JAB PUNCH", 200, 2);
  }
};
