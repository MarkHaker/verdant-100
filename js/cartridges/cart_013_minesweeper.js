// js/cartridges/cart_013_minesweeper.js
// ============================================================================
// Cartridge #013: MINESWEEPER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 13. MINESWEEPER
CARTS[13] = {
  id: 13, name: "MINESWEEPER", genre: 1, scoreLabel: "TIME",
  desc: "9X9 MINEFIELD. [A] REVEAL TILE. [B] OR LONG-PRESS TO PLACE FLAG.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 16, 5, 3);
    g.line(x + 16, y + 8, x + 16, y + 24, 3);
    g.line(x + 8, y + 16, x + 24, y + 16, 3);
  },
  init() {
    this.cx = 4; this.cy = 4;
    this.revealed = E1.create(9, 9, 0);
    this.flags = E1.create(9, 9, 0);
    this.mines = E1.create(9, 9, 0);
    this.generated = false;
    this.over = false;
    this.won = false;
    this.time = 0;
  },
  spawnMines(firstX, firstY) {
    let placed = 0;
    while (placed < 10) {
      const rx = Math.floor(Math.random() * 9), ry = Math.floor(Math.random() * 9);
      if ((rx !== firstX || ry !== firstY) && E1.get(this.mines, rx, ry) === 0) {
        E1.set(this.mines, rx, ry, 1);
        placed++;
      }
    }
    this.generated = true;
  },
  countMines(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (E1.get(this.mines, x + dx, y + dy) === 1) count++;
      }
    }
    return count;
  },
  reveal(sx, sy) {
    const queue = [[sx, sy]];
    while (queue.length > 0) {
      const [x, y] = queue.pop();
      if (x < 0 || x >= 9 || y < 0 || y >= 9) continue;
      if (E1.get(this.revealed, x, y) === 1) continue;
      if (E1.get(this.flags, x, y) === 1) continue;
      if (E1.get(this.mines, x, y) === 1) continue;

      E1.set(this.revealed, x, y, 1);
      const count = this.countMines(x, y);
      if (count === 0) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx !== 0 || dy !== 0) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < 9 && ny >= 0 && ny < 9 && E1.get(this.revealed, nx, ny) === 0) {
                queue.push([nx, ny]);
              }
            }
          }
        }
      }
    }
  },
  update(dt) {
    if (this.over || this.won) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    this.time += dt;
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(8, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(8, this.cy + 1);

    // Flag toggle
    if (PAD.hit('b') || PAD.longPress) {
      const f = E1.get(this.flags, this.cx, this.cy);
      E1.set(this.flags, this.cx, this.cy, f ? 0 : 1);
      APU.sfx('TICK');
      PAD.vibrate(15);
    }

    // Reveal
    if (PAD.hit('a')) {
      if (!this.generated) this.spawnMines(this.cx, this.cy);
      if (E1.get(this.flags, this.cx, this.cy) === 0) {
        if (E1.get(this.mines, this.cx, this.cy) === 1) {
          this.over = true;
          APU.sfx('BOOM');
        } else {
          this.reveal(this.cx, this.cy);
          APU.sfx('COIN');
          // Check win
          let revCount = 0;
          for (let i = 0; i < 81; i++) {
            if (this.revealed.data[i] === 1) revCount++;
          }
          if (revCount === 71) {
            this.won = true;
            APU.sfx('LEVELUP');
            SAVE.setScore(this.id, Math.max(1, Math.floor(this.time)));
          }
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("MINESWEEPER", 16, 12, 3);
    g.textR("TIME: " + Math.floor(this.time), 240, 12, 2);

    const ox = 48, oy = 32, sz = 18;
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        const rev = E1.get(this.revealed, x, y);
        const flg = E1.get(this.flags, x, y);
        if (rev) {
          g.rect(bx, by, sz - 1, sz - 1, 1);
          const count = this.countMines(x, y);
          if (count > 0) g.text("" + count, bx + 6, by + 5, 3);
        } else {
          g.rect(bx, by, sz - 1, sz - 1, 2);
          if (flg) g.text("▶", bx + 6, by + 5, 3);
        }
        // Cursor
        if (x === this.cx && y === this.cy) g.box(bx - 1, by - 1, sz + 1, sz + 1, 3);
      }
    }
    if (this.won) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("MINEFIELD CLEARED!", 110, 3);
      g.textC("[A] PLAY AGAIN", 124, 2);
    } else if (this.over) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("BOOM! MINE EXPLODED", 110, 3);
      g.textC("[A] TO RETRY", 124, 2);
    }
  }
};
