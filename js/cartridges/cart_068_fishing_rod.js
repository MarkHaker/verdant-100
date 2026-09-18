// js/cartridges/cart_068_fishing_rod.js
// ============================================================================
// Cartridge #068: FISHING ROD
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 68. FISHING ROD
CARTS[68] = {
  id: 68, name: "FISHING ROD", genre: 6, scoreLabel: "KG",
  desc: "CAST LINE INTO RIVER, WAIT FOR '!' BITE, THEN STRIKE AND REEL IN TENSION!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 6, y + 26, x + 22, y + 8, 3);
    g.line(x + 22, y + 8, x + 26, y + 22, 2);
  },
  init() {
    this.state = 'WAIT';
    this.timer = Math.random() * 3 + 2;
    this.fishKg = 0;
  },
  update(dt) {
    if (this.state === 'WAIT') {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.state = 'BITE';
        APU.sfx('ALARM');
      }
    } else if (this.state === 'BITE') {
      if (PAD.hit('a')) {
        this.fishKg += Math.floor(Math.random() * 8) + 2;
        this.state = 'WAIT';
        this.timer = Math.random() * 3 + 2;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.fishKg);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.rect(0, 150, 256, 90, 1);
    g.line(30, 170, 80, 100, 2);
    g.line(80, 100, 130, 160, 3);
    if (this.state === 'BITE') g.textC("! BITE ! PRESS [A] !", 80, 3, 2);
    g.text("TOTAL CATCH: " + this.fishKg + " KG", 14, 14, 3);
  }
};
