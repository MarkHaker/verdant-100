// js/cartridges/cart_018_nonogram.js
// ============================================================================
// Cartridge #018: NONOGRAM
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 18. NONOGRAM
CARTS[18] = {
  id: 18, name: "NONOGRAM", genre: 1, scoreLabel: "TIME",
  desc: "SOLVE 5X5 PICROSS LOGIC PUZZLE USING ROW & COLUMN NUMBER CLUES.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 6, y + 6, 8, 8, 3);
    g.rect(x + 18, y + 18, 8, 8, 3);
  },
  init() {
    this.solution = [
      [1,0,1,0,1],
      [1,1,1,1,1],
      [0,1,1,1,0],
      [0,0,1,0,0],
      [0,1,0,1,0]
    ];
    this.grid = E1.create(5, 5, 0);
    this.cx = 2; this.cy = 2;
    this.time = 0;
    this.won = false;
  },
  getClues(line) {
    const clues = [];
    let cur = 0;
    for (let v of line) {
      if (v === 1) cur++;
      else if (cur > 0) { clues.push(cur); cur = 0; }
    }
    if (cur > 0) clues.push(cur);
    return clues.length > 0 ? clues : [0];
  },
  update(dt) {
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    this.time += dt;
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(4, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(4, this.cy + 1);
    if (PAD.hit('a')) {
      const v = E1.get(this.grid, this.cx, this.cy);
      E1.set(this.grid, this.cx, this.cy, v ? 0 : 1);
      APU.sfx('TICK');
      // Check win
      let solved = true;
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          if (E1.get(this.grid, x, y) !== this.solution[y][x]) solved = false;
        }
      }
      if (solved) {
        this.won = true;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, Math.max(1, Math.floor(this.time)));
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("NONOGRAM 5X5", 14, 10, 3);
    g.textR("TIME: " + Math.floor(this.time) + "S", 244, 10, 2);

    const ox = 86, oy = 56, sz = 24;

    // Column clues (drawn above grid)
    for (let x = 0; x < 5; x++) {
      const col = [0,1,2,3,4].map(y => this.solution[y][x]);
      const clues = this.getClues(col);
      for (let c = 0; c < clues.length; c++) {
        const clueY = oy - (clues.length - c) * 9 - 2;
        g.text("" + clues[c], ox + x * sz + 10, clueY, 2);
      }
    }

    // Row clues (drawn to left of grid)
    for (let y = 0; y < 5; y++) {
      const row = this.solution[y];
      const clues = this.getClues(row);
      const str = clues.join(" ");
      g.textR(str, ox - 6, oy + y * sz + 8, 2);
    }

    // Grid frame
    g.box(ox - 1, oy - 1, 5 * sz + 2, 5 * sz + 2, 2);

    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        if (E1.get(this.grid, x, y)) {
          g.rect(bx + 2, by + 2, sz - 4, sz - 4, 3);
        }
        if (x === this.cx && y === this.cy) {
          g.box(bx - 1, by - 1, sz + 1, sz + 1, 3);
        }
      }
    }
    if (this.won) {
      g.dither(50, 192, 156, 36, 0, 1);
      g.box(50, 192, 156, 36, 3);
      g.textC("PICTURE SOLVED!", 198, 3);
      g.textC("[A] PLAY AGAIN", 212, 2);
    }
  }
};
