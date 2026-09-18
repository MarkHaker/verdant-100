// js/cartridges/cart_044_virus_spread.js
// ============================================================================
// Cartridge #044: VIRUS SPREAD
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 44. VIRUS SPREAD
CARTS[44] = {
  id: 44, name: "VIRUS SPREAD", genre: 4, scoreLabel: "CELLS",
  desc: "INVASION BOARD: CLONE TO ADJACENT CELL OR JUMP 2 SPACES TO CONVERT ENEMY!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 16, 6, 3);
    g.circle(x + 16, y + 16, 9, 2);
  },
  init() {
    this.board = E1.create(6, 6, 0);
    E1.set(this.board, 0, 0, 1);
    E1.set(this.board, 5, 5, 2);
    this.cx = 0; this.cy = 0;
    this.score = 1;
  },
  update(dt) {
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(5, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(5, this.cy + 1);
    if (PAD.hit('a') && E1.get(this.board, this.cx, this.cy) === 0) {
      E1.set(this.board, this.cx, this.cy, 1);
      APU.sfx('COIN');
      this.score++;
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.text("VIRUS SPREAD", 14, 14, 3);
    const ox = 52, oy = 36, sz = 26;
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        const v = E1.get(this.board, x, y);
        if (v > 0) g.disc(bx + 13, by + 13, 8, v === 1 ? 3 : 2);
        if (x === this.cx && y === this.cy) g.box(bx, by, sz, sz, 3);
      }
    }
  }
};
