// js/cartridges/cart_095_elevator.js
// ============================================================================
// Cartridge #095: ELEVATOR
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 95. ELEVATOR DISPATCH
CARTS[95] = {
  id: 95, name: "ELEVATOR", genre: 9, scoreLabel: "PASSENGERS",
  desc: "HIGH-RISE ELEVATOR CONTROLLER: DISPATCH 2 CARS TO FULFILL 8 FLOOR CALLS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 10, y + 6, 12, 20, 2);
    g.rect(x + 12, y + 14, 8, 10, 3);
  },
  init() {
    this.carY = 4;
    this.served = 0;
  },
  update(dt) {
    if (PAD.hit('up')) this.carY = Math.max(0, this.carY - 1);
    if (PAD.hit('down')) this.carY = Math.min(7, this.carY + 1);
    if (PAD.hit('a')) {
      this.served++;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.served);
    }
  },
  render(g) {
    g.clear(0);
    g.text("ELEVATOR DISPATCH", 14, 14, 3);
    g.textR("SERVED: " + this.served, 240, 14, 2);
    for (let f = 0; f < 8; f++) {
      const fy = 40 + f * 22;
      g.line(40, fy, 216, fy, 1);
      g.text("FL " + (8 - f), 14, fy - 2, 2);
    }
    g.rect(120, 40 + this.carY * 22 - 16, 24, 18, 3);
  }
};
