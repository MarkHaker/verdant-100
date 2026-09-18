// js/cartridges/cart_076_laser_mirror.js
// ============================================================================
// Cartridge #076: LASER MIRROR
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 76. LASER MIRROR
CARTS[76] = {
  id: 76, name: "LASER MIRROR", genre: 7, scoreLabel: "LEVEL",
  desc: "ROTATE 45° ANGLED MIRRORS WITH [A] TO BOUNCE LASER BEAM INTO TARGET SENSOR!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 4, y + 16, x + 16, y + 16, 3);
    g.line(x + 16, y + 16, x + 16, y + 28, 3);
    g.line(x + 12, y + 20, x + 20, y + 12, 2);
  },
  init() {
    this.rot = 0;
    this.hit = false;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.rot = (this.rot + 1) % 4;
      APU.sfx('TICK');
      if (this.rot === 1) {
        this.hit = true;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, 1);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("LASER MIRROR", 14, 14, 3);
    g.line(20, 100, 120, 100, 3); // Emitter beam
    // Mirror
    g.line(110, 110, 130, 90, 2);
    if (this.hit) g.line(120, 100, 120, 200, 3);
    g.box(114, 200, 12, 12, 3);
    g.textC("[A] ROTATE MIRROR", 220, 2);
  }
};
