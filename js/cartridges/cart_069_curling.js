// js/cartridges/cart_069_curling.js
// ============================================================================
// Cartridge #069: CURLING
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 69. CURLING STONE
CARTS[69] = {
  id: 69, name: "CURLING", genre: 6, scoreLabel: "ACCURACY",
  desc: "LAUNCH CURLING STONE WITH DESIRED FORCE. MASH [A] TO SWEEP ICE & EXTEND!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 16, 8, 2);
    g.rect(x + 14, y + 12, 8, 2, 3);
  },
  init() {
    this.stoneY = 220;
    this.vy = -130;
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) this.vy -= 10; // Sweep ice
    this.vy *= 0.985;
    this.stoneY += this.vy * dt;
  },
  render(g) {
    g.clear(0);
    // House rings
    g.circle(128, 50, 30, 1);
    g.circle(128, 50, 15, 2);
    g.disc(128, 50, 5, 3);

    // Stone
    g.disc(128, Math.floor(this.stoneY), 8, 3);
    g.textC("[A] MASH TO SWEEP ICE", 210, 2);
  }
};
