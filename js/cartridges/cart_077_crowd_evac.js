// js/cartridges/cart_077_crowd_evac.js
// ============================================================================
// Cartridge #077: CROWD EVAC
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 77. CROWD EVAC
CARTS[77] = {
  id: 77, name: "CROWD EVAC", genre: 7, scoreLabel: "SAVED",
  desc: "OPEN/CLOSE DOORS TO GUIDE PANICKING AGENTS SAFELY PAST FIRE TO EXITS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 8, y + 16, 2, 3);
    g.disc(x + 14, y + 16, 2, 3);
    g.box(x + 22, y + 10, 6, 12, 2);
  },
  init() {
    this.saved = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.saved += 5;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.saved);
    }
  },
  render(g) {
    g.clear(0);
    g.text("CROWD EVACUATION", 14, 14, 3);
    g.textR("SAVED: " + this.saved, 240, 14, 2);
    g.box(200, 100, 20, 40, 3);
    g.textC("[A] OPEN MAIN EXIT DOOR", 200, 2);
  }
};
