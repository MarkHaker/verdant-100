// js/cartridges/cart_080_turret_360.js
// ============================================================================
// Cartridge #080: TURRET 360
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 80. TURRET DEFENSE 360
CARTS[80] = {
  id: 80, name: "TURRET 360", genre: 7, scoreLabel: "WAVE",
  desc: "CENTRAL ROTATING CANNON: ROTATE 360° WITH D-PAD, FIRE [A] AT CLOSING SWARMS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 16, 6, 2);
    g.line(x + 16, y + 16, x + 26, y + 16, 3);
  },
  init() {
    this.angle = 0;
    this.score = 0;
  },
  update(dt) {
    if (PAD.state.left) this.angle -= 3.0 * dt;
    if (PAD.state.right) this.angle += 3.0 * dt;
    if (PAD.hit('a')) {
      this.score++;
      APU.sfx('BOOM');
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.disc(128, 120, 10, 2);
    g.line(128, 120, 128 + Math.cos(this.angle) * 24, 120 + Math.sin(this.angle) * 24, 3);
    g.text("TURRET 360 - KILLS: " + this.score, 14, 14, 3);
  }
};


// ============================================================================
// CARTRIDGES 81 - 100 (BLOCK 9: LOGIC/MEMORY & BLOCK 10: EXPERIMENTAL)
// ============================================================================;
