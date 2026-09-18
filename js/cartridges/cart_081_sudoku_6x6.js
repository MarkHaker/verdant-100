// js/cartridges/cart_081_sudoku_6x6.js
// ============================================================================
// Cartridge #081: SUDOKU 6X6
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 81. SUDOKU 6X6
CARTS[81] = {
  id: 81, name: "SUDOKU 6X6", genre: 8, scoreLabel: "TIME",
  desc: "MINI SUDOKU 6X6: FILL 1-6 IN ROWS, COLUMNS, AND 2X3 REGIONS WITHOUT CONFLICTS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("1 2", x + 8, y + 8, 3);
    g.text("3 4", x + 8, y + 18, 2);
  },
  init() {
    this.grid = [
      1,0,3,4,0,6,
      0,5,6,1,2,0,
      2,0,4,5,0,1,
      0,1,5,2,4,0,
      4,0,1,6,0,2,
      0,2,0,3,1,0
    ];
    this.cx = 1; this.cy = 0;
  },
  update(dt) {
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(5, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(5, this.cy + 1);
    if (PAD.hit('a')) {
      const idx = this.cy * 6 + this.cx;
      this.grid[idx] = (this.grid[idx] % 6) + 1;
      APU.sfx('TICK');
    }
  },
  render(g) {
    g.clear(0);
    g.text("SUDOKU 6X6", 14, 14, 3);
    const ox = 52, oy = 36, sz = 26;
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        const v = this.grid[y * 6 + x];
        if (v > 0) g.text("" + v, bx + 10, by + 10, 3);
        if (x === this.cx && y === this.cy) g.box(bx, by, sz, sz, 3);
      }
    }
  }
};
