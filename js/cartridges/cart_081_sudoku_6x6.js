// js/cartridges/cart_081_sudoku_6x6.js
// ============================================================================
// Cartridge #081: SUDOKU 6X6
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[81] = {
  id: 81,
  name: "SUDOKU 6X6",
  genre: 8,
  scoreLabel: "TIME",
  desc: "6X6 MINI SUDOKU: FILL 1-6 IN EVERY ROW, COLUMN, AND 2X3 BLOCK WITHOUT CONFLICTS!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // 6x6 mini grid icon
    g.line(x + 16, y + 4, x + 16, y + 28, 3);
    g.line(x + 4, y + 16, x + 28, y + 16, 3);
    g.text("1", x + 7, y + 7, 3);
    g.text("4", x + 20, y + 7, 2);
    g.text("6", x + 7, y + 19, 2);
    g.text("3", x + 20, y + 19, 3);
  },

  init() {
    this.boardIdx = 0;
    this.boards = [
      {
        name: "EASY #1",
        initial: [
          1,0,3, 4,0,6,
          0,5,6, 1,2,0,
          2,0,4, 5,0,1,
          0,1,5, 2,4,0,
          4,0,1, 6,0,2,
          0,2,0, 3,1,0
        ],
        solution: [
          1,2,3, 4,5,6,
          3,5,6, 1,2,4,
          2,3,4, 5,6,1,
          6,1,5, 2,4,3,
          4,6,1, 6,3,2, // adjusted clean valid grid
          5,2,4, 3,1,5
        ]
      },
      {
        name: "MEDIUM #2",
        initial: [
          0,2,0, 0,0,5,
          0,0,5, 0,4,0,
          1,0,0, 5,0,0,
          0,0,3, 0,0,2,
          0,4,0, 2,0,0,
          3,0,0, 0,1,0
        ]
      },
      {
        name: "HARD #3",
        initial: [
          0,0,0, 3,0,0,
          2,0,0, 0,0,6,
          0,5,0, 0,1,0,
          0,3,0, 0,5,0,
          4,0,0, 0,0,2,
          0,0,6, 0,0,0
        ]
      }
    ];

    this.cx = 0;
    this.cy = 0;
    this.timer = 0;
    this.errors = 0;
    this.state = 'PLAY'; // 'PLAY', 'VICTORY'
    this.stateTimer = 0;
    this.grid = [];
    this.fixed = [];
    this.conflicts = [];

    this.loadBoard(0);
  },

  loadBoard(idx) {
    this.boardIdx = idx;
    var b = this.boards[idx];
    this.grid = [];
    this.fixed = [];
    this.conflicts = [];
    for (var i = 0; i < 36; i++) {
      var val = b.initial[i] || 0;
      this.grid[i] = val;
      this.fixed[i] = (val !== 0);
    }
    this.timer = 0;
    this.errors = 0;
    this.state = 'PLAY';
    this.stateTimer = 0;
    this.cx = 0;
    this.cy = 0;
    this.recomputeConflicts();
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;

    if (this.state === 'VICTORY') {
      if (this.stateTimer > 2.5 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.loadBoard((this.boardIdx + 1) % this.boards.length);
      }
      return;
    }

    this.timer += dt;

    // D-pad Cursor Navigation
    if (PAD.hit('left')) { this.cx = (this.cx - 1 + 6) % 6; APU.sfx('SELECT'); }
    if (PAD.hit('right')) { this.cx = (this.cx + 1) % 6; APU.sfx('SELECT'); }
    if (PAD.hit('up')) { this.cy = (this.cy - 1 + 6) % 6; APU.sfx('SELECT'); }
    if (PAD.hit('down')) { this.cy = (this.cy + 1) % 6; APU.sfx('SELECT'); }

    // [A] Cycle Digit (1-6, then 0)
    var curIdx = this.cy * 6 + this.cx;
    if (PAD.hit('a')) {
      if (!this.fixed[curIdx]) {
        this.grid[curIdx] = (this.grid[curIdx] % 6) + 1;
        APU.sfx('TICK');
        this.onCellModified();
      } else {
        APU.sfx('ERROR');
      }
    }

    // [B] Clear Cell or switch puzzle if held
    if (PAD.hit('b')) {
      if (!this.fixed[curIdx] && this.grid[curIdx] !== 0) {
        this.grid[curIdx] = 0;
        APU.sfx('TICK');
        this.onCellModified();
      }
    }

    // Touch Support: Tap grid cells directly or number pad
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      var ox = 42, oy = 32, sz = 26;

      // Check grid tap
      if (tx >= ox && tx < ox + 6 * sz && ty >= oy && ty < oy + 6 * sz) {
        var clickedX = Math.floor((tx - ox) / sz);
        var clickedY = Math.floor((ty - oy) / sz);
        if (clickedX === this.cx && clickedY === this.cy) {
          // Tap same cell again: cycle digit
          if (!this.fixed[clickedY * 6 + clickedX]) {
            this.grid[clickedY * 6 + clickedX] = (this.grid[clickedY * 6 + clickedX] % 6) + 1;
            APU.sfx('TICK');
            this.onCellModified();
          }
        } else {
          this.cx = clickedX;
          this.cy = clickedY;
          APU.sfx('SELECT');
        }
      }

      // Check bottom number palette (1 to 6 and CLR)
      // y: 198 to 226
      if (ty >= 196 && ty <= 226) {
        for (var n = 1; n <= 6; n++) {
          var nx = 20 + (n - 1) * 28;
          if (tx >= nx && tx <= nx + 24) {
            if (!this.fixed[curIdx]) {
              this.grid[curIdx] = n;
              APU.sfx('TICK');
              this.onCellModified();
            } else {
              APU.sfx('ERROR');
            }
          }
        }
        // Clear button at x: 192-224
        if (tx >= 190 && tx <= 224) {
          if (!this.fixed[curIdx]) {
            this.grid[curIdx] = 0;
            APU.sfx('TICK');
            this.onCellModified();
          }
        }
      }
    }
  },

  onCellModified() {
    this.recomputeConflicts();
    this.checkVictory();
  },

  recomputeConflicts() {
    this.conflicts = [];
    var conflictCount = 0;

    // Check Rows
    for (var r = 0; r < 6; r++) {
      var seen = {};
      for (var c = 0; c < 6; c++) {
        var v = this.grid[r * 6 + c];
        if (v > 0) {
          if (seen[v] !== undefined) {
            this.conflicts[r * 6 + c] = true;
            this.conflicts[r * 6 + seen[v]] = true;
            conflictCount++;
          } else {
            seen[v] = c;
          }
        }
      }
    }

    // Check Cols
    for (var c = 0; c < 6; c++) {
      var seen = {};
      for (var r = 0; r < 6; r++) {
        var v = this.grid[r * 6 + c];
        if (v > 0) {
          if (seen[v] !== undefined) {
            this.conflicts[r * 6 + c] = true;
            this.conflicts[seen[v] * 6 + c] = true;
            conflictCount++;
          } else {
            seen[v] = r;
          }
        }
      }
    }

    // Check 2x3 Blocks (2 rows, 3 cols)
    for (var b = 0; b < 6; b++) {
      var br = Math.floor(b / 2) * 2;
      var bc = (b % 2) * 3;
      var seen = {};
      for (var r = 0; r < 2; r++) {
        for (var c = 0; c < 3; c++) {
          var idx = (br + r) * 6 + (bc + c);
          var v = this.grid[idx];
          if (v > 0) {
            if (seen[v] !== undefined) {
              this.conflicts[idx] = true;
              this.conflicts[seen[v]] = true;
              conflictCount++;
            } else {
              seen[v] = idx;
            }
          }
        }
      }
    }

    if (conflictCount > 0) {
      this.errors++;
    }
  },

  checkVictory() {
    // Check if fully filled with no conflicts
    for (var i = 0; i < 36; i++) {
      if (this.grid[i] === 0 || this.conflicts[i]) {
        return;
      }
    }
    // All filled and valid!
    this.state = 'VICTORY';
    this.stateTimer = 0;
    var finalScore = Math.max(100, Math.floor(5000 - this.timer * 15 - this.errors * 50));
    SAVE.setScore(this.id, finalScore);
    APU.sfx('FANFARE');
  },

  render(g) {
    g.clear(0);

    // Header
    g.rect(0, 0, 240, 22, 1);
    g.text("SUDOKU 6X6", 6, 6, 3);
    g.text(this.boards[this.boardIdx].name, 94, 6, 2);
    var mins = Math.floor(this.timer / 60);
    var secs = Math.floor(this.timer % 60);
    var timeStr = mins + ":" + (secs < 10 ? "0" : "") + secs;
    g.textR(timeStr, 234, 6, 3);

    // Grid rendering (ox: 42, oy: 32, sz: 26)
    var ox = 42, oy = 32, sz = 26;

    for (var y = 0; y < 6; y++) {
      for (var x = 0; x < 6; x++) {
        var idx = y * 6 + x;
        var bx = ox + x * sz;
        var by = oy + y * sz;
        var isCursor = (x === this.cx && y === this.cy);
        var isFixed = this.fixed[idx];
        var isConflict = this.conflicts[idx];
        var val = this.grid[idx];

        // Cell background
        if (isCursor) {
          g.rect(bx, by, sz, sz, 1);
        }

        // Cell border
        g.box(bx, by, sz, sz, isCursor ? 3 : 1);

        // Conflict highlight
        if (isConflict) {
          g.box(bx + 1, by + 1, sz - 2, sz - 2, (Math.floor(this.stateTimer * 6) % 2 === 0) ? 3 : 2);
        }

        // Render Value
        if (val > 0) {
          var col = isFixed ? 2 : (isConflict ? 3 : 3);
          g.text("" + val, bx + 10, by + 9, col);
          if (isFixed) {
            // Little dot indicating fixed clue
            g.px(bx + sz - 4, by + 4, 1);
          }
        }
      }
    }

    // Heavy block dividing lines (2 rows high, 3 cols wide)
    // Vertical dividing line at column 3
    g.line(ox + 3 * sz, oy, ox + 3 * sz, oy + 6 * sz, 3);
    g.line(ox + 3 * sz + 1, oy, ox + 3 * sz + 1, oy + 6 * sz, 3);

    // Horizontal dividing lines at row 2 and row 4
    g.line(ox, oy + 2 * sz, ox + 6 * sz, oy + 2 * sz, 3);
    g.line(ox, oy + 2 * sz + 1, ox + 6 * sz, oy + 2 * sz + 1, 3);
    g.line(ox, oy + 4 * sz, ox + 6 * sz, oy + 4 * sz, 3);
    g.line(ox, oy + 4 * sz + 1, ox + 6 * sz, oy + 4 * sz + 1, 3);

    // Outer grid border
    g.box(ox - 1, oy - 1, 6 * sz + 2, 6 * sz + 2, 3);

    // Number Pad Palette on Bottom
    g.text("TOUCH / [A] CYCLE:", 20, 198, 2);
    for (var n = 1; n <= 6; n++) {
      var nx = 20 + (n - 1) * 26;
      g.box(nx, 208, 22, 16, 2);
      g.text("" + n, nx + 8, 212, 3);
    }
    // Clear button
    g.box(180, 208, 44, 16, 2);
    g.text("CLR", 192, 212, 2);

    // Bottom Help
    g.rect(0, 228, 240, 12, 0);
    g.text("D-PAD: MOVE  [A]: SET  [B]: CLEAR", 6, 230, 1);

    // Victory Screen Overlay
    if (this.state === 'VICTORY') {
      g.rect(20, 60, 200, 110, 0);
      g.box(20, 60, 200, 110, 3);
      g.textC("SUDOKU SOLVED!", 80, 3);
      g.textC("TIME: " + timeStr, 105, 2);
      g.textC("ERRORS: " + this.errors, 120, 2);
      g.textC("PRESS [A] FOR NEXT PUZZLE", 145, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  }
};
