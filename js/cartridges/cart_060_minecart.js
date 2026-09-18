// js/cartridges/cart_060_minecart.js
// ============================================================================
// Cartridge #060: MINECART
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 60. MINECART SWITCH
CARTS[60] = {
  id: 60, name: "MINECART", genre: 5, scoreLabel: "GEMS",
  desc: "SWITCH TRACK FORKS BEFORE MINECART ARRIVES TO COLLECT CAVERN CRYSTALS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 4, y + 16, x + 28, y + 16, 2);
    g.rect(x + 12, y + 10, 10, 6, 3);
  },
  init() {
    this.cartX = 0;
    this.fork = 0; // 0 = up, 1 = down
    this.score = 0;
  },
  update(dt) {
    this.cartX += 80 * dt;
    if (this.cartX > 256) {
      this.cartX = 0;
      this.score++;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.score);
    }
    if (PAD.hit('a')) {
      this.fork = this.fork ? 0 : 1;
      APU.sfx('TICK');
    }
  },
  render(g) {
    g.clear(0);
    g.text("MINECART SWITCH", 14, 14, 3);
    g.line(0, 120, 120, 120, 2);
    g.line(120, 120, 256, this.fork === 0 ? 90 : 150, 2);
    g.rect(Math.floor(this.cartX) - 6, 114, 12, 6, 3);
    g.textC("[A] SWITCH TRACK", 200, 2);
  }
};


// ============================================================================
// CARTRIDGES 61 - 80 (BLOCK 7: SPORTS & BLOCK 8: STEALTH/DEFENSE)
// ============================================================================;
