// js/cartridges/cart_093_glitch_fix.js
// ============================================================================
// Cartridge #093: GLITCH FIX
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 93. GLITCH REPAIR
CARTS[93] = {
  id: 93, name: "GLITCH FIX", genre: 9, scoreLabel: "TIME",
  desc: "CORRUPT RAM SECTORS SPREAD RAPIDLY: PURGE GLITCH TILES BEFORE 40% CRASH!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.dither(x + 4, y + 4, 24, 24, 1, 3);
  },
  init() {
    this.corrupt = 5;
    this.score = 0;
  },
  update(dt) {
    this.corrupt += 4 * dt;
    this.score += dt;
    if (PAD.hit('a')) {
      this.corrupt = Math.max(0, this.corrupt - 8);
      APU.sfx('HIT');
      SAVE.setScore(this.id, Math.floor(this.score));
    }
  },
  render(g) {
    g.clear(0);
    g.text("RAM CORRUPTION: " + Math.floor(this.corrupt) + "%", 14, 14, 3);
    g.dither(30, 40, 196, 120, 0, this.corrupt > 20 ? 3 : 1);
    g.textC("[A] PURGE CORRUPT SECTORS", 190, 2);
  }
};
