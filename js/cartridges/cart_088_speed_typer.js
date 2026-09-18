// js/cartridges/cart_088_speed_typer.js
// ============================================================================
// Cartridge #088: SPEED TYPER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 88. SPEED TYPING
CARTS[88] = {
  id: 88, name: "SPEED TYPER", genre: 8, scoreLabel: "WPM",
  desc: "FALLING WORD METEORS: TYPE MATCHING LETTERS ON SCREEN TO BLAST WITH LASER!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("KEY", x + 8, y + 13, 3);
  },
  init() {
    this.word = "LASER";
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.score += 5;
      APU.sfx('SWISH');
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.text("SPEED TYPING", 14, 14, 3);
    g.textC(this.word, 90, 3, 2);
    g.textC("[A] TYPE NEXT GLYPH", 180, 2);
  }
};
