// js/cartridges/cart_050_reversi.js
// ============================================================================
// Cartridge #050: REVERSI
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 50. REVERSI
CARTS[50] = {
  id: 50, name: "REVERSI", genre: 4, scoreLabel: "MARGIN",
  desc: "OTHELLO/REVERSI 8X8. OUTFLANK AND FLIP OPPONENT DISCS. DOMINATE CORNERS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 11, y + 11, 4, 3);
    g.disc(x + 21, y + 21, 4, 3);
    g.disc(x + 11, y + 21, 4, 2);
    g.disc(x + 21, y + 11, 4, 2);
  },
  init() {
    this.board = E10.createReversi();
    this.cx = 2; this.cy = 3;
    this.turn = 1; // 1 = player, 2 = AI
  },
  update(dt) {
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(7, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(7, this.cy + 1);
    if (PAD.hit('a')) {
      const flips = E10.getValidFlips(this.board, this.cx, this.cy, 1);
      if (flips.length > 0) {
        E1.set(this.board, this.cx, this.cy, 1);
        for (let [fx, fy] of flips) E1.set(this.board, fx, fy, 1);
        APU.sfx('COIN');
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("REVERSI 8X8", 14, 14, 3);
    const ox = 48, oy = 36, sz = 20;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        const v = E1.get(this.board, x, y);
        if (v > 0) g.disc(bx + 10, by + 10, 6, v === 1 ? 3 : 2);
        if (x === this.cx && y === this.cy) g.box(bx, by, sz, sz, 3);
      }
    }
  }
};
