// js/cartridges/cart_079_x_ray_scan.js
// ============================================================================
// Cartridge #079: X-RAY SCAN
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 79. AIRPORT SCANNER
CARTS[79] = {
  id: 79, name: "X-RAY SCAN", genre: 7, scoreLabel: "ACCURACY",
  desc: "INSPECT LUGGAGE X-RAY SILHOUETTES. FLAG CONTRABAND [A], APPROVE [B]!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 6, y + 8, 20, 16, 2);
    g.line(x + 12, y + 14, x + 20, y + 20, 3);
  },
  init() {
    this.contraband = false;
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.score += 10;
      APU.sfx('COIN');
      this.contraband = Math.random() < 0.5;
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.text("X-RAY SCANNER", 14, 14, 3);
    g.box(60, 50, 136, 110, 2);
    if (this.contraband) g.line(90, 80, 130, 120, 3);
    g.textC("[A] SEIZE CONTRABAND   [B] PASS", 190, 2);
  }
};
