// js/cartridges/cart_073_sonar_sub.js
// ============================================================================
// Cartridge #073: SONAR SUB
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 73. SONAR SUBMARINE
CARTS[73] = {
  id: 73, name: "SONAR SUB", genre: 7, scoreLabel: "DEPTH",
  desc: "OCEAN PITCH BLACK: [A] SENDS SONAR PING, REVEALING TRENCHES FOR 2 SECONDS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.circle(x + 16, y + 16, 8, 3);
    g.circle(x + 16, y + 16, 13, 2);
  },
  init() {
    this.pingTimer = 0;
    this.subY = 120;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.pingTimer = 2.0;
      APU.sfx('ALARM');
    }
    this.pingTimer = Math.max(0, this.pingTimer - dt);
  },
  render(g) {
    g.clear(0);
    if (this.pingTimer > 0) {
      g.circle(128, 120, 60, 2);
      g.circle(128, 120, 90, 1);
      g.textC("SEABED CLEAR", 120, 3);
    } else {
      g.textC("[A] EMIT SONAR PING", 120, 1);
    }
  }
};
