// js/cartridges/cart_011_2048.js
// ============================================================================
// Cartridge #011: 2048
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 11. 2048
CARTS[11] = {
  id: 11, name: "2048", genre: 1, scoreLabel: "TILES",
  desc: "SLIDE TILES WITH SWIPE OR D-PAD TO MERGE MATCHING NUMBERS INTO 2048!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 4, y + 4, 11, 11, 2); g.text("2", x + 7, y + 7, 3);
    g.rect(x + 17, y + 4, 11, 11, 3); g.text("4", x + 20, y + 7, 0);
  },
  init() {
    this.grid = E1.create(4, 4, 0);
    this.score = 0;
    this.spawnTile(); this.spawnTile();
    this.over = false;
  },
  spawnTile() {
    const empty = [];
    for (let i = 0; i < 16; i++) if (this.grid.data[i] === 0) empty.push(i);
    if (empty.length > 0) {
      const idx = empty[Math.floor(Math.random() * empty.length)];
      this.grid.data[idx] = Math.random() < 0.9 ? 2 : 4;
    }
  },
  checkGameOver() {
    for (let i = 0; i < 16; i++) {
      if (this.grid.data[i] === 0) return;
    }
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 3; x++) {
        if (E1.get(this.grid, x, y) === E1.get(this.grid, x + 1, y)) return;
      }
    }
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 3; y++) {
        if (E1.get(this.grid, x, y) === E1.get(this.grid, x, y + 1)) return;
      }
    }
    this.over = true;
    APU.sfx('BOOM');
    SAVE.setScore(this.id, this.score);
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    const move = PAD.swipe || (PAD.hit('left') && 'left') || (PAD.hit('right') && 'right') ||
                 (PAD.hit('up') && 'up') || (PAD.hit('down') && 'down');
    if (move) {
      let moved = false;
      // 4 directions logic
      const slideRow = (row) => {
        let arr = row.filter(v => v !== 0);
        for (let i = 0; i < arr.length - 1; i++) {
          if (arr[i] === arr[i + 1]) {
            arr[i] *= 2; this.score += arr[i]; arr.splice(i + 1, 1);
          }
        }
        while (arr.length < 4) arr.push(0);
        return arr;
      };

      if (move === 'left') {
        for (let y = 0; y < 4; y++) {
          const row = [E1.get(this.grid, 0, y), E1.get(this.grid, 1, y), E1.get(this.grid, 2, y), E1.get(this.grid, 3, y)];
          const next = slideRow(row);
          for (let x = 0; x < 4; x++) {
            if (E1.get(this.grid, x, y) !== next[x]) moved = true;
            E1.set(this.grid, x, y, next[x]);
          }
        }
      } else if (move === 'right') {
        for (let y = 0; y < 4; y++) {
          const row = [E1.get(this.grid, 3, y), E1.get(this.grid, 2, y), E1.get(this.grid, 1, y), E1.get(this.grid, 0, y)];
          const next = slideRow(row);
          for (let x = 0; x < 4; x++) {
            if (E1.get(this.grid, 3 - x, y) !== next[x]) moved = true;
            E1.set(this.grid, 3 - x, y, next[x]);
          }
        }
      } else if (move === 'up') {
        for (let x = 0; x < 4; x++) {
          const col = [E1.get(this.grid, x, 0), E1.get(this.grid, x, 1), E1.get(this.grid, x, 2), E1.get(this.grid, x, 3)];
          const next = slideRow(col);
          for (let y = 0; y < 4; y++) {
            if (E1.get(this.grid, x, y) !== next[y]) moved = true;
            E1.set(this.grid, x, y, next[y]);
          }
        }
      } else if (move === 'down') {
        for (let x = 0; x < 4; x++) {
          const col = [E1.get(this.grid, x, 3), E1.get(this.grid, x, 2), E1.get(this.grid, x, 1), E1.get(this.grid, x, 0)];
          const next = slideRow(col);
          for (let y = 0; y < 4; y++) {
            if (E1.get(this.grid, x, 3 - y) !== next[y]) moved = true;
            E1.set(this.grid, x, 3 - y, next[y]);
          }
        }
      }

      if (moved) {
        this.spawnTile();
        APU.sfx('COIN');
        SAVE.setScore(this.id, this.score);
        this.checkGameOver();
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("2048 PUZZLE", 16, 14, 3);
    g.textR("SCORE: " + this.score, 240, 14, 3);

    const ox = 48, oy = 36, sz = 40;
    g.box(ox - 2, oy - 2, 4 * sz + 4, 4 * sz + 4, 2);

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const val = E1.get(this.grid, x, y);
        const bx = ox + x * sz, by = oy + y * sz;
        g.rect(bx, by, sz, sz, 0);
        g.box(bx, by, sz, sz, 1);

        if (val > 0) {
          const sVal = "" + val;
          const scale = val >= 1000 ? 1 : 2;
          const tw = (sVal.length * 5 - 1) * scale;
          const tx = Math.floor(bx + (sz - tw) / 2);
          const ty = Math.floor(by + (sz - 6 * scale) / 2);

          if (val === 2) {
            g.rect(bx + 2, by + 2, sz - 4, sz - 4, 1);
            g.line(bx + 2, by + 2, bx + sz - 3, by + 2, 2);
            g.line(bx + 2, by + 2, bx + 2, by + sz - 3, 2);
            g.line(bx + 2, by + sz - 3, bx + sz - 3, by + sz - 3, 0);
            g.line(bx + sz - 3, by + 2, bx + sz - 3, by + sz - 3, 0);
            g.text(sVal, tx, ty, 3, scale);
          } else if (val === 4) {
            g.dither(bx + 2, by + 2, sz - 4, sz - 4, 0, 1);
            g.line(bx + 2, by + 2, bx + sz - 3, by + 2, 3);
            g.line(bx + 2, by + 2, bx + 2, by + sz - 3, 3);
            g.line(bx + 2, by + sz - 3, bx + sz - 3, by + sz - 3, 0);
            g.line(bx + sz - 3, by + 2, bx + sz - 3, by + sz - 3, 0);
            g.text(sVal, tx, ty, 3, scale);
          } else if (val === 8) {
            g.rect(bx + 2, by + 2, sz - 4, sz - 4, 2);
            g.line(bx + 2, by + 2, bx + sz - 3, by + 2, 3);
            g.line(bx + 2, by + 2, bx + 2, by + sz - 3, 3);
            g.line(bx + 2, by + sz - 3, bx + sz - 3, by + sz - 3, 1);
            g.line(bx + sz - 3, by + 2, bx + sz - 3, by + sz - 3, 1);
            g.text(sVal, tx, ty, 0, scale);
          } else if (val === 16) {
            g.dither(bx + 2, by + 2, sz - 4, sz - 4, 1, 2);
            g.box(bx + 2, by + 2, sz - 4, sz - 4, 3);
            g.line(bx + sz - 3, by + 2, bx + sz - 3, by + sz - 3, 0);
            g.line(bx + 2, by + sz - 3, bx + sz - 3, by + sz - 3, 0);
            g.text(sVal, tx, ty, 3, scale);
          } else if (val === 32) {
            g.rect(bx + 2, by + 2, sz - 4, sz - 4, 2);
            g.box(bx + 2, by + 2, sz - 4, sz - 4, 3);
            g.box(bx + 4, by + 4, sz - 8, sz - 8, 1);
            g.text(sVal, tx, ty, 0, scale);
          } else if (val === 64) {
            g.rect(bx + 2, by + 2, sz - 4, sz - 4, 3);
            g.line(bx + sz - 3, by + 2, bx + sz - 3, by + sz - 3, 1);
            g.line(bx + 2, by + sz - 3, bx + sz - 3, by + sz - 3, 1);
            g.text(sVal, tx, ty, 0, scale);
          } else if (val === 128) {
            g.rect(bx + 2, by + 2, sz - 4, sz - 4, 3);
            g.rect(bx + 4, by + 4, sz - 8, sz - 8, 1);
            g.box(bx + 4, by + 4, sz - 8, sz - 8, 0);
            g.text(sVal, tx, ty, 3, scale);
          } else if (val === 256) {
            g.rect(bx + 2, by + 2, sz - 4, sz - 4, 3);
            g.dither(bx + 4, by + 4, sz - 8, sz - 8, 0, 2);
            g.text(sVal, tx, ty, 3, scale);
          } else if (val === 512) {
            g.rect(bx + 2, by + 2, sz - 4, sz - 4, 3);
            g.rect(bx + 5, by + 5, sz - 10, sz - 10, 0);
            g.box(bx + 5, by + 5, sz - 10, sz - 10, 2);
            g.text(sVal, tx, ty, 3, scale);
          } else {
            // 1024, 2048+
            g.rect(bx + 2, by + 2, sz - 4, sz - 4, 3);
            g.box(bx + 3, by + 3, sz - 6, sz - 6, 0);
            g.rect(bx + 5, by + 5, sz - 10, sz - 10, 3);
            g.text(sVal, tx, ty, 0, scale);
          }
        }
      }
    }

    if (this.over) {
      g.dither(64, 90, 128, 48, 0, 1);
      g.box(64, 90, 128, 48, 3);
      g.textC("NO MORE MOVES!", 102, 3);
      g.textC("[A] PLAY AGAIN", 118, 2);
    }
  }
};
