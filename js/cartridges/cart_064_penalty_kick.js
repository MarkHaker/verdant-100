// js/cartridges/cart_064_penalty_kick.js
// ============================================================================
// Cartridge #064: PENALTY KICK
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 64. PENALTY KICK
CARTS[64] = {
  id: 64, name: "PENALTY KICK", genre: 6, scoreLabel: "GOALS",
  desc: "AIM RETICLE, HOLD [A] TO CHARGE SHOT POWER, AND CURVE BALL PAST KEEPER!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 6, y + 8, 20, 12, 2);
    g.disc(x + 16, y + 24, 4, 3);
  },
  init() {
    this.aimX = 128;
    this.keeperX = 128;
    this.goals = 0;
  },
  update(dt) {
    if (PAD.state.left) this.aimX = Math.max(50, this.aimX - 100 * dt);
    if (PAD.state.right) this.aimX = Math.min(206, this.aimX + 100 * dt);
    if (PAD.hit('a')) {
      if (Math.abs(this.aimX - this.keeperX) > 30) {
        this.goals++;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.goals);
      } else {
        APU.sfx('BOOM');
      }
      this.keeperX = Math.random() * 120 + 68;
    }
  },
  render(g) {
    g.clear(0);
    g.box(40, 50, 176, 90, 2);
    // Keeper
    g.rect(Math.floor(this.keeperX) - 8, 100, 16, 24, 2);
    // Ball & Aim
    g.disc(128, 200, 8, 3);
    g.circle(Math.floor(this.aimX), 90, 6, 3);
    g.text("GOALS: " + this.goals, 14, 14, 3);
  }
};
