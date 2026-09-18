// js/cartridges/cart_085_stroop_test.js
// ============================================================================
// Cartridge #085: STROOP TEST
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 85. STROOP COLOR
CARTS[85] = {
  id: 85, name: "STROOP TEST", genre: 8, scoreLabel: "CORRECT",
  desc: "STROOP COGNITIVE TEST: SELECT ACTUAL BRIGHTNESS VALUE, NOT WRITTEN WORD!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("DARK", x + 6, y + 13, 3);
  },
  init() {
    this.word = "DARK";
    this.brightness = 3; // Bright
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
    g.text("STROOP EFFECT", 14, 14, 3);
    g.textR("SCORE: " + this.score, 240, 14, 2);
    g.textC(this.word, 110, this.brightness, 2);
    g.textC("PRESS [A] IF BRIGHT, [B] IF DARK", 180, 2);
  }
};
