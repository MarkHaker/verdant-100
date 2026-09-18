// js/cartridges/cart_075_sniper.js
// ============================================================================
// Cartridge #075: SNIPER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 75. SNIPER TARGET
CARTS[75] = {
  id: 75, name: "SNIPER", genre: 7, scoreLabel: "MS",
  desc: "SEARCH CROWD OF 30 CIVILIANS FOR WANTED DOSSIER TARGET (HAT + UMBRELLA)!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.circle(x + 16, y + 16, 9, 3);
    g.line(x + 16, y + 4, x + 16, y + 28, 2);
    g.line(x + 4, y + 16, x + 28, y + 16, 2);
  },
  init() {
    this.tx = 150; this.ty = 100;
    this.found = false;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.found = true;
      APU.sfx('COIN');
      SAVE.setScore(this.id, 100);
    }
  },
  render(g) {
    g.clear(0);
    g.text("DOSSIER: TARGET HAS HAT", 14, 14, 2);
    for (let i = 0; i < 20; i++) g.disc(40 + (i * 24) % 180, 70 + Math.floor(i / 5) * 30, 4, 1);
    g.disc(this.tx, this.ty, 4, 3); // Target
    g.textC("[A] TAKE THE SHOT", 200, 3);
  }
};
