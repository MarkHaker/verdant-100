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
    this.dropTimer = 0;
    this.dasTimer = 0;
    this.dasDir = 0;
    this.nextPiece = this.randomPiece();
    this.spawnPiece();
  },
  randomPiece() {
    const idx = Math.floor(Math.random() * this.SHAPES.length);
    return this.SHAPES[idx];
  },
  spawnPiece() {
    this.piece = this.nextPiece || this.randomPiece();
    this.nextPiece = this.randomPiece();
    this.px = Math.floor((10 - this.piece[0].length) / 2);
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
  lockPiece() {
    for (let r = 0; r < this.piece.length; r++) {
      for (let c = 0; c < this.piece[r].length; c++) {
        if (this.piece[r][c]) {
          E1.set(this.grid, this.px + c, this.py + r, 2);
        }
      }
    }
    const cleared = this.clearLines();
    if (cleared === 0) {
      APU.sfx('HIT');
    }
    this.spawnPiece();
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }

    const sw = PAD.swipe;

    // Shift left / right with responsive tap and auto-repeat (DAS)
    if (PAD.hit('left') || sw === 'left') {
      if (!this.collides(this.px - 1, this.py, this.piece)) {
        this.px--;
        APU.sfx('TICK');
      }
      this.dasDir = -1;
      this.dasTimer = 0.18;
    } else if (PAD.hit('right') || sw === 'right') {
      if (!this.collides(this.px + 1, this.py, this.piece)) {
        this.px++;
        APU.sfx('TICK');
      }
      this.dasDir = 1;
      this.dasTimer = 0.18;
    } else if (PAD.held('left') && !PAD.held('right')) {
      if (this.dasDir !== -1) {
        this.dasDir = -1;
        this.dasTimer = 0.18;
      } else {
        this.dasTimer -= dt;
        if (this.dasTimer <= 0) {
          if (!this.collides(this.px - 1, this.py, this.piece)) {
            this.px--;
            APU.sfx('TICK');
          }
          this.dasTimer = 0.05;
        }
      }
    } else if (PAD.held('right') && !PAD.held('left')) {
      if (this.dasDir !== 1) {
        this.dasDir = 1;
        this.dasTimer = 0.18;
      } else {
        this.dasTimer -= dt;
        if (this.dasTimer <= 0) {
          if (!this.collides(this.px + 1, this.py, this.piece)) {
            this.px++;
            APU.sfx('TICK');
          }
          this.dasTimer = 0.05;
        }
      }
    } else {
      this.dasDir = 0;
    }

    // Rotate 90 degrees clockwise with wall kicks & floor kicks
    if (PAD.hit('a') || PAD.hit('up') || sw === 'up') {
      const rot = this.rotate(this.piece);
      const isI = (this.piece.length === 4 || this.piece[0].length === 4 || rot.length === 4 || rot[0].length === 4);
      const xOffsets = isI ? [0, -1, 1, -2, 2, -3] : [0, -1, 1, -2, 2];
      const yOffsets = isI ? (this.py >= 16 ? [0, -1, -2, -3] : [0]) : (this.py >= 18 ? [0, -1] : [0]);
      let rotated = false;
      for (const oy of yOffsets) {
        for (const ox of xOffsets) {
          if (!this.collides(this.px + ox, this.py + oy, rot)) {
            this.px += ox;
            this.py += oy;
            this.piece = rot;
            APU.sfx('SWISH');
            rotated = true;
            break;
          }
        }
        if (rotated) break;
      }
    }

    // Hard drop on [B] (instantly drops to floor, awards 2 pts/cell, and locks)
    if (PAD.hit('b')) {
      let dropDist = 0;
      while (!this.collides(this.px, this.py + 1, this.piece)) {
        this.py++;
        dropDist++;
      }
      this.score += dropDist * 2;
      SAVE.setScore(this.id, this.score);
      this.lockPiece();
      this.dropTimer = 0;
      return;
    }

    // Swipe down: soft drop step
    if (sw === 'down') {
      if (!this.collides(this.px, this.py + 1, this.piece)) {
        this.py++;
        this.score += 1;
        SAVE.setScore(this.id, this.score);
        this.dropTimer = 0;
        APU.sfx('TICK');
      }
    }

    // Fall speed and fractional dt accumulator
    const isSoftDrop = PAD.state.down || PAD.held('down');
    const fallSpeed = isSoftDrop ? 0.05 : Math.max(0.08, 0.65 - (this.level - 1) * 0.05);
    this.dropTimer += dt;
    if (this.dropTimer > fallSpeed * 3) this.dropTimer = fallSpeed;

    while (this.dropTimer >= fallSpeed) {
      this.dropTimer -= fallSpeed;
      if (!this.collides(this.px, this.py + 1, this.piece)) {
        this.py++;
        if (isSoftDrop) {
          this.score += 1;
          SAVE.setScore(this.id, this.score);
        }
      } else {
        this.lockPiece();
        this.dropTimer = 0;
        break;
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
      const oldLevel = this.level;
      this.level = Math.floor(this.lines / 10) + 1;
      if (this.level > oldLevel || cleared >= 4) {
        APU.sfx('LEVELUP');
      } else {
        APU.sfx('COIN');
      }
      SAVE.setScore(this.id, this.score);
    }
    return cleared;
  },
  render(g) {
    g.clear(0);
    const ox = 78, oy = 16, sz = 10;
    g.box(ox - 2, oy - 2, 10 * sz + 4, 20 * sz + 4, 2);

    // Grid (locked blocks)
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        const val = E1.get(this.grid, x, y);
        if (val) {
          g.rect(ox + x * sz + 1, oy + y * sz + 1, sz - 2, sz - 2, 2);
          g.box(ox + x * sz, oy + y * sz, sz, sz, 3);
        }
      }
    }

    // Ghost piece (landing projection outline)
    if (!this.over && this.piece) {
      let ghostY = this.py;
      while (!this.collides(this.px, ghostY + 1, this.piece)) {
        ghostY++;
      }
      if (ghostY > this.py) {
        for (let r = 0; r < this.piece.length; r++) {
          for (let c = 0; c < this.piece[r].length; c++) {
            if (this.piece[r][c]) {
              g.box(ox + (this.px + c) * sz, oy + (ghostY + r) * sz, sz, sz, 1);
            }
          }
        }
      }
    }

    // Active piece
    if (this.piece && !this.over) {
      for (let r = 0; r < this.piece.length; r++) {
        for (let c = 0; c < this.piece[r].length; c++) {
          if (this.piece[r][c]) {
            g.rect(ox + (this.px + c) * sz + 1, oy + (this.py + r) * sz + 1, sz - 2, sz - 2, 3);
          }
        }
      }
    }

    // Left sidebar
    g.text("TETRIS", 12, 20, 3);
    g.text("SCORE", 12, 42, 2);
    g.text("" + this.score, 12, 54, 3);
    g.text("LINES", 12, 74, 2);
    g.text("" + this.lines, 12, 86, 3);
    g.text("LEVEL", 12, 106, 2);
    g.text("" + this.level, 12, 118, 3);

    // Right sidebar
    g.text("RECORD", 188, 42, 2);
    g.text("" + Math.max(SAVE.getScore(this.id), this.score), 188, 54, 3);

    // Next piece preview
    g.text("NEXT", 188, 74, 2);
    const nbx = 188, nby = 86, nbw = 54, nbh = 38, psz = 8;
    g.rect(nbx, nby, nbw, nbh, 0);
    g.box(nbx, nby, nbw, nbh, 2);
    if (this.nextPiece) {
      const pw = this.nextPiece[0].length * psz;
      const ph = this.nextPiece.length * psz;
      const sx = nbx + Math.floor((nbw - pw) / 2);
      const sy = nby + Math.floor((nbh - ph) / 2);
      for (let r = 0; r < this.nextPiece.length; r++) {
        for (let c = 0; c < this.nextPiece[r].length; c++) {
          if (this.nextPiece[r][c]) {
            g.rect(sx + c * psz + 1, sy + r * psz + 1, psz - 2, psz - 2, 2);
            g.box(sx + c * psz, sy + r * psz, psz, psz, 3);
          }
        }
      }
    }

    // Controls reminder
    g.text("CONTROLS", 188, 138, 1);
    g.text("[A] ROT", 188, 150, 2);
    g.text("[B] DROP", 188, 162, 2);
    g.text("▼  SOFT", 188, 174, 2);

    // Game Over Overlay
    if (this.over) {
      const bx = ox - 2, by = 76, bw = 10 * sz + 4, bh = 54;
      g.dither(bx, by, bw, bh, 0, 1);
      g.box(bx, by, bw, bh, 3);
      g.textC("GAME OVER", by + 8, 3);
      g.textC("SCORE " + this.score, by + 22, 2);
      g.textC("[A] RETRY", by + 38, 3);
    }
  }
};
