// js/cartridges/cart_048_lemmings.js
// ============================================================================
// Cartridge #048: LEMMINGS
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 48. LEMMINGS WALK
CARTS[48] = {
  id: 48, name: "LEMMINGS", genre: 4, scoreLabel: "SAVED",
  desc: "ASSIGN TASKS (BLOCKER, DIGGER) TO GUIDE MARCHING LEMMINGS SAFELY TO EXIT!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 12, 3, 3);
    g.line(x + 16, y + 15, x + 16, y + 24, 3);
  },
  init() {
    this.lemms = [{ x: 30, y: 150, dir: 1 }];
    this.saved = 0;
  },
  update(dt) {
    for (let l of this.lemms) {
      l.x += l.dir * 40 * dt;
      if (l.x > 220) {
        l.x = 30;
        this.saved++;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.saved);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("LEMMINGS MARCH", 14, 14, 3);
    g.line(0, 160, 256, 160, 2);
    for (let l of this.lemms) g.disc(Math.floor(l.x), 154, 4, 3);
    g.box(220, 140, 16, 20, 3);
    g.text("SAVED: " + this.saved, 14, 200, 3);
  }
};
