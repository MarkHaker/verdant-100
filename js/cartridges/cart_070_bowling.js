// js/cartridges/cart_070_bowling.js
// ============================================================================
// Cartridge #070: BOWLING
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 70. BOWLING
CARTS[70] = {
  id: 70, name: "BOWLING", genre: 6, scoreLabel: "PINS",
  desc: "TEN-PIN BOWLING: POSITION BALL, TIME HOOK RELEASE, AND BOWL FOR STRIKES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 20, 5, 3);
    for (let i = 0; i < 3; i++) g.disc(x + 10 + i * 6, y + 8, 2, 2);
  },
  init() {
    this.bx = 128;
    this.by = 210;
    this.rolling = false;
    this.score = 0;
  },
  update(dt) {
    if (!this.rolling) {
      if (PAD.state.left) this.bx -= 60 * dt;
      if (PAD.state.right) this.bx += 60 * dt;
      if (PAD.hit('a')) { this.rolling = true; APU.sfx('HIT'); }
    } else {
      this.by -= 140 * dt;
      if (this.by < 40) {
        this.rolling = false;
        this.by = 210;
        this.score += 10;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.score);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.line(70, 0, 90, 240, 1);
    g.line(186, 0, 166, 240, 1);
    // Pins
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c <= r; c++) g.disc(128 - r * 8 + c * 16, 40 + r * 10, 3, 2);
    }
    g.disc(Math.floor(this.bx), Math.floor(this.by), 6, 3);
    g.text("SCORE: " + this.score, 14, 14, 3);
  }
};
