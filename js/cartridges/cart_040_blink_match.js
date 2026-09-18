// js/cartridges/cart_040_blink_match.js
// ============================================================================
// Cartridge #040: BLINK MATCH
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 40. BLINK MATCH
CARTS[40] = {
  id: 40, name: "BLINK MATCH", genre: 3, scoreLabel: "ROUNDS",
  desc: "HOLD [A] FOR STARING CONTEST. RELEASE INSTANTLY THE SECOND OPPONENT BLINKS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.circle(x + 16, y + 16, 7, 3);
    g.disc(x + 16, y + 16, 3, 2);
  },
  init() {
    this.blinkTimer = Math.random() * 3 + 2;
    this.blinking = false;
    this.score = 0;
  },
  update(dt) {
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0 && !this.blinking) {
      this.blinking = true;
      APU.sfx('TICK');
    }
    if (this.blinking && PAD.hit('a')) {
      this.score++;
      APU.sfx('LEVELUP');
      this.blinking = false;
      this.blinkTimer = Math.random() * 3 + 2;
    }
  },
  render(g) {
    g.clear(0);
    g.text("STARING CONTEST", 14, 14, 3);
    g.textR("WINS: " + this.score, 240, 14, 2);
    if (this.blinking) g.line(100, 120, 156, 120, 3);
    else { g.circle(128, 120, 22, 3); g.disc(128, 120, 8, 2); }
  }
};


// ============================================================================
// CARTRIDGES 41 - 60 (BLOCK 5: STRATEGY & BLOCK 6: RPG/SURVIVAL)
// ============================================================================;
