// js/cartridges/cart_046_city_8x8.js
// ============================================================================
// Cartridge #046: CITY 8X8
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 46. CITY 8X8
CARTS[46] = {
  id: 46, name: "CITY 8X8", genre: 4, scoreLabel: "POP",
  desc: "MICRO URBAN PLANNER: RESIDENTIAL, COMMERCIAL, INDUSTRIAL. BALANCE JOBS & SMOG!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 6, y + 16, 6, 10, 3);
    g.rect(x + 14, y + 10, 6, 16, 3);
    g.rect(x + 22, y + 18, 6, 8, 2);
  },
  init() {
    this.grid = E1.create(8, 8, 0);
    this.cx = 3; this.cy = 3;
    this.zone = 1; // 1 = Res, 2 = Com, 3 = Ind
    this.pop = 0;
  },
  update(dt) {
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(7, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(7, this.cy + 1);
    if (PAD.hit('b')) this.zone = (this.zone % 3) + 1;
    if (PAD.hit('a')) {
      E1.set(this.grid, this.cx, this.cy, this.zone);
      this.pop += 100;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.pop);
    }
  },
  render(g) {
    g.clear(0);
    g.text("CITY 8X8 - POP: " + this.pop, 14, 14, 3);
    const ox = 48, oy = 36, sz = 20;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        const z = E1.get(this.grid, x, y);
        if (z > 0) g.rect(bx + 2, by + 2, sz - 4, sz - 4, z === 1 ? 3 : (z === 2 ? 2 : 1));
        if (x === this.cx && y === this.cy) g.box(bx - 1, by - 1, sz + 1, sz + 1, 3);
      }
    }
    const names = ["", "RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL"];
    g.text("ZONE: " + names[this.zone] + " [B] TOGGLE", 14, 210, 2);
  }
};
