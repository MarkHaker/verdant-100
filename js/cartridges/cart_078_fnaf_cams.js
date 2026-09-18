// js/cartridges/cart_078_fnaf_cams.js
// ============================================================================
// Cartridge #078: FNAF CAMS
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 78. FNAF CAM MONITOR
CARTS[78] = {
  id: 78, name: "FNAF CAMS", genre: 7, scoreLabel: "HOUR",
  desc: "MONITOR SECURITY CAMS. CLOSE BLAST DOORS WHEN ANIMATRONICS CREEP CLOSE!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 6, y + 8, 20, 16, 2);
    g.text("CAM", x + 8, y + 13, 3);
  },
  init() {
    this.cam = 1;
    this.power = 100;
  },
  update(dt) {
    this.power -= 2 * dt;
    if (PAD.hit('left')) this.cam = Math.max(1, this.cam - 1);
    if (PAD.hit('right')) this.cam = Math.min(4, this.cam + 1);
  },
  render(g) {
    g.clear(0);
    g.text("SECURITY CAM 0" + this.cam, 14, 14, 3);
    g.textR("PWR: " + Math.floor(this.power) + "%", 240, 14, 2);
    g.box(30, 40, 196, 140, 2);
    g.textC("CORRIDOR EMPTY", 100, 1);
  }
};
