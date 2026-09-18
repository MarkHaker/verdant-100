// js/cartridges/cart_072_zombie_cabin.js
// ============================================================================
// Cartridge #072: ZOMBIE CABIN
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 72. ZOMBIE BARRICADE
CARTS[72] = {
  id: 72, name: "ZOMBIE CABIN", genre: 7, scoreLabel: "WAVES",
  desc: "DEFEND 4 WINDOWS OF CABIN: REPAIR BOARDS [A], SHOOT INCOMING ZOMBIES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 10, y + 10, 12, 12, 2);
    g.line(x + 10, y + 16, x + 22, y + 16, 3);
  },
  init() {
    this.boards = [3, 3, 3, 3];
    this.score = 1;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.boards[0] = Math.min(5, this.boards[0] + 1);
      APU.sfx('HIT');
    }
  },
  render(g) {
    g.clear(0);
    g.text("ZOMBIE CABIN", 14, 14, 3);
    g.box(78, 70, 100, 100, 2);
    g.textC("BOARDS: " + this.boards[0], 115, 3);
    g.textC("[A] REINFORCE WINDOWS", 200, 2);
  }
};
