// js/cartridges/cart_058_prison_break.js
// ============================================================================
// Cartridge #058: PRISON BREAK
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 58. PRISON BREAK
CARTS[58] = {
  id: 58, name: "PRISON BREAK", genre: 5, scoreLabel: "TUNNEL %",
  desc: "COMPLY WITH ROUTINE BY DAY, DIG ESCAPE TUNNEL BY NIGHT. DON'T GET CAUGHT!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    for (let i = 0; i < 4; i++) g.line(x + 8 + i * 5, y + 6, x + 8 + i * 5, y + 26, 2);
  },
  init() {
    this.tunnel = 0;
    this.suspicion = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.tunnel = Math.min(100, this.tunnel + 5);
      this.suspicion = Math.min(100, this.suspicion + 8);
      APU.sfx('TICK');
      SAVE.setScore(this.id, this.tunnel);
    }
    this.suspicion = Math.max(0, this.suspicion - 4 * dt);
  },
  render(g) {
    g.clear(0);
    g.text("PRISON BREAK", 14, 14, 3);
    g.text("TUNNEL DUG: " + this.tunnel + "%", 14, 40, 3);
    g.text("GUARD SUSPICION: " + Math.floor(this.suspicion) + "%", 14, 54, 2);
    g.textC("[A] DIG TUNNEL UNDER BUNK", 180, 3);
  }
};
