// js/cartridges/cart_071_metal_gear.js
// ============================================================================
// Cartridge #071: METAL GEAR
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 71. METAL GEAR 2D
CARTS[71] = {
  id: 71, name: "METAL GEAR", genre: 7, scoreLabel: "RANK",
  desc: "TOP-DOWN STEALTH: SNEAK PAST PATROLLING GUARDS' CONES OF VISION TO HACK PC!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 10, y + 16, 4, 3);
    g.tri(x + 20, y + 16, x + 30, y + 10, x + 30, y + 22, 1);
  },
  init() {
    this.px = 30; this.py = 200;
    this.gx = 120; this.gy = 100; this.gDir = 1;
    this.won = false;
  },
  update(dt) {
    if (PAD.state.left) this.px -= 80 * dt;
    if (PAD.state.right) this.px += 80 * dt;
    if (PAD.state.up) this.py -= 80 * dt;
    if (PAD.state.down) this.py += 80 * dt;

    this.gx += this.gDir * 50 * dt;
    if (this.gx > 200 || this.gx < 60) this.gDir = -this.gDir;

    // Terminal hack
    if (this.px > 210 && this.py < 50) {
      this.won = true;
      APU.sfx('LEVELUP');
      SAVE.setScore(this.id, 100);
    }
  },
  render(g) {
    g.clear(0);
    g.text("METAL GEAR SNEAK", 14, 14, 3);
    // Player
    g.disc(Math.floor(this.px), Math.floor(this.py), 5, 3);
    // Guard & Vision Cone
    g.disc(Math.floor(this.gx), Math.floor(this.gy), 5, 2);
    g.tri(this.gx, this.gy, this.gx + this.gDir * 40, this.gy - 15, this.gx + this.gDir * 40, this.gy + 15, 1);
    // Terminal
    g.box(220, 30, 16, 16, 3);
    if (this.won) g.textC("MISSION ACCOMPLISHED!", 110, 3);
  }
};
