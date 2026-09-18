// js/cartridges/cart_063_air_hockey.js
// ============================================================================
// Cartridge #063: AIR HOCKEY
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 63. AIR HOCKEY
CARTS[63] = {
  id: 63, name: "AIR HOCKEY", genre: 6, scoreLabel: "GOALS",
  desc: "RAPID-FIRE TABLE HOCKEY: CURSOR-FOLLOWING MALLET VS REFLEXIVE ROBOT AI!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.circle(x + 8, y + 16, 5, 3);
    g.disc(x + 16, y + 16, 3, 3);
    g.circle(x + 24, y + 16, 5, 2);
  },
  init() {
    this.paddles = [{ x: 40, y: 120 }, { x: 216, y: 120 }];
    this.puck = { x: 128, y: 120, vx: 110, vy: 60 };
    this.score = 0;
  },
  update(dt) {
    if (PAD.state.up) this.paddles[0].y = Math.max(30, this.paddles[0].y - 140 * dt);
    if (PAD.state.down) this.paddles[0].y = Math.min(210, this.paddles[0].y + 140 * dt);

    this.puck.x += this.puck.vx * dt; this.puck.y += this.puck.vy * dt;
    if (this.puck.y < 20 || this.puck.y > 220) this.puck.vy = -this.puck.vy;

    if (Math.hypot(this.puck.x - this.paddles[0].x, this.puck.y - this.paddles[0].y) < 14) {
      this.puck.vx = Math.abs(this.puck.vx);
      APU.sfx('HIT');
    }
  },
  render(g) {
    g.clear(0);
    g.box(20, 20, 216, 200, 2);
    g.line(128, 20, 128, 220, 1);
    g.circle(this.paddles[0].x, Math.floor(this.paddles[0].y), 10, 3);
    g.circle(this.paddles[1].x, Math.floor(this.paddles[1].y), 10, 2);
    g.disc(Math.floor(this.puck.x), Math.floor(this.puck.y), 4, 3);
  }
};
