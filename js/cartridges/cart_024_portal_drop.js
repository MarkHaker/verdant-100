// js/cartridges/cart_024_portal_drop.js
// ============================================================================
// Cartridge #024: PORTAL DROP
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 24. PORTAL DROP
CARTS[24] = {
  id: 24, name: "PORTAL DROP", genre: 2, scoreLabel: "CRYSTALS",
  desc: "[A] BLUE PORTAL, [B] ORANGE PORTAL. CONSERVE MOMENTUM TO REACH GEMS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.circle(x + 10, y + 16, 6, 3);
    g.circle(x + 22, y + 16, 6, 2);
  },
  init() {
    this.ball = { x: 40, y: 40, vx: 0, vy: 0 };
    this.portalA = { x: 50, y: 200, active: true };
    this.portalB = { x: 180, y: 60, active: true };
    this.score = 0;
  },
  update(dt) {
    this.ball.vy += 180 * dt;
    this.ball.x += this.ball.vx * dt;
    this.ball.y += this.ball.vy * dt;

    // Portal teleportation
    if (Math.hypot(this.ball.x - this.portalA.x, this.ball.y - this.portalA.y) < 14) {
      this.ball.x = this.portalB.x;
      this.ball.y = this.portalB.y;
      this.ball.vy = -Math.abs(this.ball.vy);
      APU.sfx('POWER');
      this.score++;
      SAVE.setScore(this.id, this.score);
    }

    if (this.ball.y > 230) {
      this.ball.x = 40; this.ball.y = 40; this.ball.vy = 0;
      APU.sfx('HURT');
    }
  },
  render(g) {
    g.clear(0);
    g.text("PORTAL DROP", 14, 14, 3);
    g.textR("SCORE: " + this.score, 240, 14, 2);

    // Portals
    g.circle(this.portalA.x, this.portalA.y, 10, 3);
    g.circle(this.portalB.x, this.portalB.y, 10, 2);

    // Ball
    g.disc(Math.floor(this.ball.x), Math.floor(this.ball.y), 4, 3);
  }
};
