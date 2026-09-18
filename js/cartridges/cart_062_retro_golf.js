// js/cartridges/cart_062_retro_golf.js
// ============================================================================
// Cartridge #062: RETRO GOLF
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 62. RETRO GOLF
CARTS[62] = {
  id: 62, name: "RETRO GOLF", genre: 6, scoreLabel: "STROKES",
  desc: "TOP-DOWN GOLF: SELECT CLUB, AIM ANGLE, AND TIME POWER BAR TO SINK HOLE!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 10, y + 20, 2, 3);
    g.circle(x + 22, y + 12, 4, 2);
    g.line(x + 22, y + 12, x + 22, y + 6, 3);
  },
  init() {
    this.ballX = 40; this.ballY = 180;
    this.holeX = 200; this.holeY = 60;
    this.strokes = 0;
    this.ballVX = 0; this.ballVY = 0;
    this.aimAngle = -0.8;
  },
  update(dt) {
    if (PAD.state.left) this.aimAngle -= 1.5 * dt;
    if (PAD.state.right) this.aimAngle += 1.5 * dt;
    if (PAD.hit('a') && Math.hypot(this.ballVX, this.ballVY) < 1) {
      this.ballVX = Math.cos(this.aimAngle) * 140;
      this.ballVY = Math.sin(this.aimAngle) * 140;
      this.strokes++;
      APU.sfx('HIT');
    }
    this.ballVX *= 0.96; this.ballVY *= 0.96;
    this.ballX += this.ballVX * dt; this.ballY += this.ballVY * dt;
  },
  render(g) {
    g.clear(0);
    g.circle(this.holeX, this.holeY, 6, 2);
    g.disc(Math.floor(this.ballX), Math.floor(this.ballY), 3, 3);
    g.line(this.ballX, this.ballY, this.ballX + Math.cos(this.aimAngle) * 20, this.ballY + Math.sin(this.aimAngle) * 20, 1);
    g.text("STROKES: " + this.strokes, 14, 14, 3);
  }
};
