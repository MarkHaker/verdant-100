// js/cartridges/cart_002_tetris.js
// ============================================================================
// Cartridge #002: TETRIS
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 2. TETRIS
CARTS[2] = {
  id: 2, name: "TETRIS", genre: 0, scoreLabel: "PTS",
  desc: "FIT FALLING TETROMINOES INTO SOLID HORIZONTAL ROWS.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 6, y + 14, 16, 6, 3);
    g.rect(x + 12, y + 8, 6, 6, 3);
    g.rect(x + 8, y + 20, 12, 6, 2);
  },
  SHAPES: [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[0,1,0],[1,1,1]], // T
    [[1,0,0],[1,1,1]], // L
    [[0,0,1],[1,1,1]], // J
    [[0,1,1],[1,1,0]], // S
    [[1,1,0],[0,1,1]]  // Z
  ],
  init() {
    this.grid = E1.create(10, 20, 0);
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.over = false;
    this.spawnPiece();
  },
  spawnPiece() {
    const idx = Math.floor(Math.random() * this.SHAPES.length);
    this.piece = this.SHAPES[idx];
    this.px = 3;
    this.py = 0;
    this.dropTimer = 0;
    if (this.collides(this.px, this.py, this.piece)) {
      this.over = true;
      APU.sfx('BOOM');
      SAVE.setScore(this.id, this.score);
    }
  },
  rotate(matrix) {
    const rows = matrix.length, cols = matrix[0].length;
    const res = [];
    for (let c = 0; c < cols; c++) {
      const newRow = [];
      for (let r = rows - 1; r >= 0; r--) newRow.push(matrix[r][c]);
      res.push(newRow);
    }
    return res;
  },
  collides(px, py, piece) {
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece[r].length; c++) {
        if (piece[r][c]) {
          const gx = px + c, gy = py + r;
          if (gx < 0 || gx >= 10 || gy >= 20) return true;
          if (gy >= 0 && E1.get(this.grid, gx, gy) !== 0) return true;
        }
      }
    }
    return false;
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    if (PAD.hit('left') && !this.collides(this.px - 1, this.py, this.piece)) {
      this.px--; APU.sfx('TICK');
    }
    if (PAD.hit('right') && !this.collides(this.px + 1, this.py, this.piece)) {
      this.px++; APU.sfx('TICK');
    }
    if (PAD.hit('a') || PAD.hit('up')) {
      const rot = this.rotate(this.piece);
      if (!this.collides(this.px, this.py, rot)) {
        this.piece = rot; APU.sfx('SWISH');
      }
    }

    const fallSpeed = PAD.state.down ? 0.05 : Math.max(0.1, 0.6 - (this.level - 1) * 0.05);
    this.dropTimer += dt;
    if (this.dropTimer >= fallSpeed) {
      this.dropTimer = 0;
      if (!this.collides(this.px, this.py + 1, this.piece)) {
        this.py++;
      } else {
        // Lock piece
        for (let r = 0; r < this.piece.length; r++) {
          for (let c = 0; c < this.piece[r].length; c++) {
            if (this.piece[r][c]) E1.set(this.grid, this.px + c, this.py + r, 2);
          }
        }
        APU.sfx('HIT');
        this.clearLines();
        this.spawnPiece();
      }
    }
  },
  clearLines() {
    let cleared = 0;
    for (let y = 19; y >= 0; y--) {
      let full = true;
      for (let x = 0; x < 10; x++) {
        if (E1.get(this.grid, x, y) === 0) { full = false; break; }
      }
      if (full) {
        cleared++;
        for (let ny = y; ny > 0; ny--) {
          for (let nx = 0; nx < 10; nx++) {
            E1.set(this.grid, nx, ny, E1.get(this.grid, nx, ny - 1));
          }
        }
        for (let nx = 0; nx < 10; nx++) E1.set(this.grid, nx, 0, 0);
        y++;
      }
    }
    if (cleared > 0) {
      this.lines += cleared;
      this.score += [0, 100, 300, 500, 800][cleared] * this.level;
      this.level = Math.floor(this.lines / 10) + 1;
      APU.sfx('LEVELUP');
    }
  },
  render(g) {
    g.clear(0);
    const ox = 78, oy = 16, sz = 10;
    g.box(ox - 2, oy - 2, 10 * sz + 4, 20 * sz + 4, 2);

    // Grid
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        const val = E1.get(this.grid, x, y);
        if (val) {
          g.rect(ox + x * sz + 1, oy + y * sz + 1, sz - 2, sz - 2, 2);
          g.box(ox + x * sz, oy + y * sz, sz, sz, 3);
        }
      }
    }

    // Active piece
    if (this.piece) {
      for (let r = 0; r < this.piece.length; r++) {
        for (let c = 0; c < this.piece[r].length; c++) {
          if (this.piece[r][c]) {
            g.rect(ox + (this.px + c) * sz + 1, oy + (this.py + r) * sz + 1, sz - 2, sz - 2, 3);
          }
        }
      }
    }

    // Sidebar
    g.text("TETRIS", 12, 20, 3);
    g.text("SCORE", 12, 40, 2);
    g.text("" + this.score, 12, 50, 3);
    g.text("LINES", 12, 70, 2);
    g.text("" + this.lines, 12, 80, 3);
    g.text("LEVEL", 12, 100, 2);
    g.text("" + this.level, 12, 110, 3);

    g.text("RECORD", 190, 40, 2);
    g.text("" + SAVE.getScore(this.id), 190, 50, 3);

    if (this.over) {
      g.dither(ox, 80, 10 * sz, 40, 0, 1);
      g.box(ox, 80, 10 * sz, 40, 3);
      g.textC("GAME OVER", 92, 3);
      g.textC("[A] RETRY", 106, 2);
    }
  }
};
