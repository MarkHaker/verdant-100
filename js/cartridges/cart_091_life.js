// js/cartridges/cart_091_life.js
// ============================================================================
// Cartridge #091: LIFE
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[91] = {
  id: 91,
  name: "LIFE",
  genre: 9,
  scoreLabel: "GENS",
  desc: "CONWAY'S GAME OF LIFE: CELLULAR AUTOMATON PLAYGROUND! DRAW CELLS OR STAMP GLIDERS & PULSARS!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Glider pattern
    g.rect(x + 14, y + 8, 4, 4, 3);
    g.rect(x + 18, y + 12, 4, 4, 3);
    g.rect(x + 10, y + 16, 4, 4, 3);
    g.rect(x + 14, y + 16, 4, 4, 3);
    g.rect(x + 18, y + 16, 4, 4, 3);
  },

  init() {
    this.cols = 48;
    this.rows = 40;
    this.cellSize = 5;
    this.grid = new Uint8Array(this.cols * this.rows);
    this.nextGrid = new Uint8Array(this.cols * this.rows);

    this.gen = 0;
    this.population = 0;
    this.running = true;
    this.stepTimer = 0;
    this.stepDelay = 0.08; // ~12 gens/sec

    this.cursorX = 24;
    this.cursorY = 20;

    this.presets = ["GLIDER", "PULSAR", "R-PENTOMINO", "ACORN", "CLEAR", "RANDOM"];
    this.curPreset = 0;

    this.loadPreset(0); // Load Glider
  },

  loadPreset(idx) {
    this.curPreset = idx;
    var name = this.presets[idx];

    if (name === "CLEAR") {
      this.grid.fill(0);
      this.gen = 0;
      this.running = false;
      this.countPop();
      return;
    }

    if (name === "RANDOM") {
      this.grid.fill(0);
      for (var i = 0; i < this.grid.length; i++) {
        this.grid[i] = Math.random() < 0.22 ? 1 : 0;
      }
      this.gen = 0;
      this.countPop();
      return;
    }

    this.grid.fill(0);
    this.gen = 0;
    var cx = Math.floor(this.cols / 2);
    var cy = Math.floor(this.rows / 2);

    if (name === "GLIDER") {
      // Multiple gliders
      this.setCell(4, 2, 1); this.setCell(5, 3, 1);
      this.setCell(3, 4, 1); this.setCell(4, 4, 1); this.setCell(5, 4, 1);

      this.setCell(16, 2, 1); this.setCell(17, 3, 1);
      this.setCell(15, 4, 1); this.setCell(16, 4, 1); this.setCell(17, 4, 1);
    } else if (name === "PULSAR") {
      // Period-3 Pulsar oscillator
      var offsets = [-6, -1, 1, 6];
      for (var o = 0; o < 4; o++) {
        var dx = offsets[o];
        for (var dy = -4; dy <= -2; dy++) {
          this.setCell(cx + dx, cy + dy, 1);
          this.setCell(cx + dx, cy - dy, 1);
          this.setCell(cx + dy, cy + dx, 1);
          this.setCell(cx - dy, cy + dx, 1);
        }
      }
    } else if (name === "R-PENTOMINO") {
      // Classic 5-cell methuselah
      this.setCell(cx, cy, 1);
      this.setCell(cx + 1, cy, 1);
      this.setCell(cx - 1, cy + 1, 1);
      this.setCell(cx, cy + 1, 1);
      this.setCell(cx, cy + 2, 1);
    } else if (name === "ACORN") {
      // Acorn methuselah
      this.setCell(cx + 1, cy, 1);
      this.setCell(cx + 3, cy + 1, 1);
      this.setCell(cx, cy + 2, 1);
      this.setCell(cx + 1, cy + 2, 1);
      this.setCell(cx + 4, cy + 2, 1);
      this.setCell(cx + 5, cy + 2, 1);
      this.setCell(cx + 6, cy + 2, 1);
    }

    this.countPop();
  },

  setCell(x, y, v) {
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
      this.grid[y * this.cols + x] = v;
    }
  },

  getCell(x, y) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return 0;
    return this.grid[y * this.cols + x];
  },

  countPop() {
    var count = 0;
    for (var i = 0; i < this.grid.length; i++) {
      if (this.grid[i]) count++;
    }
    this.population = count;
  },

  stepSimulation() {
    this.gen++;
    var pop = 0;
    for (var y = 0; y < this.rows; y++) {
      for (var x = 0; x < this.cols; x++) {
        // Count 8 neighbors with toroidal wrapping
        var n = 0;
        for (var dy = -1; dy <= 1; dy++) {
          for (var dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            var nx = (x + dx + this.cols) % this.cols;
            var ny = (y + dy + this.rows) % this.rows;
            if (this.grid[ny * this.cols + nx] === 1) n++;
          }
        }

        var idx = y * this.cols + x;
        var alive = this.grid[idx];
        var next = 0;
        if (alive === 1) {
          next = (n === 2 || n === 3) ? 1 : 0; // Survive
        } else {
          next = (n === 3) ? 1 : 0; // Birth
        }

        this.nextGrid[idx] = next;
        if (next === 1) pop++;
      }
    }

    // Swap buffers
    this.grid.set(this.nextGrid);
    this.population = pop;
    SAVE.setScore(this.id, this.gen);
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;

    // Simulation stepping
    if (this.running) {
      this.stepTimer += dt;
      if (this.stepTimer >= this.stepDelay) {
        this.stepTimer = 0;
        this.stepSimulation();
      }
    }

    // [A] Toggle Play / Pause
    if (PAD.hit('a')) {
      this.running = !this.running;
      APU.sfx(this.running ? 'CONFIRM' : 'SELECT');
    }

    // [B] Step single generation (when paused) or switch preset if held
    if (PAD.hit('b')) {
      if (!this.running) {
        this.stepSimulation();
        APU.sfx('TICK');
      } else {
        // Cycle preset
        this.loadPreset((this.curPreset + 1) % this.presets.length);
        APU.sfx('COIN');
      }
    }

    // Cursor navigation (when paused to draw)
    if (!this.running) {
      if (PAD.hit('left')) this.cursorX = (this.cursorX - 1 + this.cols) % this.cols;
      if (PAD.hit('right')) this.cursorX = (this.cursorX + 1) % this.cols;
      if (PAD.hit('up')) this.cursorY = (this.cursorY - 1 + this.rows) % this.rows;
      if (PAD.hit('down')) this.cursorY = (this.cursorY + 1) % this.rows;
    }

    // Direct touch drawing on grid
    if (TOUCH.down || TOUCH.held) {
      var tx = TOUCH.x, ty = TOUCH.y;
      var gy = ty - 22;
      if (gy >= 0 && gy < this.rows * this.cellSize && tx >= 0 && tx < this.cols * this.cellSize) {
        var gx = Math.floor(tx / this.cellSize);
        var gyIdx = Math.floor(gy / this.cellSize);
        this.setCell(gx, gyIdx, 1);
        this.cursorX = gx;
        this.cursorY = gyIdx;
        this.countPop();
      }
      // Tap Play/Pause button in header
      if (tx >= 180 && ty <= 22) {
        this.running = !this.running;
        APU.sfx('CONFIRM');
      }
    }
  },

  render(g) {
    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("CONWAY'S LIFE", 6, 6, 3);
    g.text("GEN:" + this.gen, 96, 6, 3);
    g.text("POP:" + this.population, 150, 6, 2);
    g.textR(this.running ? "[RUN]" : "[PAUSE]", 234, 6, this.running ? 3 : 1);

    // Render 48x40 Grid Cells
    var oy = 22;
    var sz = this.cellSize;

    for (var y = 0; y < this.rows; y++) {
      for (var x = 0; x < this.cols; x++) {
        var idx = y * this.cols + x;
        if (this.grid[idx] === 1) {
          g.rect(x * sz, oy + y * sz, sz - 1, sz - 1, 3);
        }
      }
    }

    // Cursor Box (when paused)
    if (!this.running) {
      g.box(this.cursorX * sz, oy + this.cursorY * sz, sz, sz, 2);
    }

    // Bottom Help Banner
    g.rect(0, 224, 240, 16, 0);
    g.line(0, 224, 240, 224, 2);
    g.text("[A]: " + (this.running ? "PAUSE" : "PLAY"), 6, 227, 3);
    g.text("[B]: " + (this.running ? "PRESET" : "STEP"), 78, 227, 2);
    g.textR(this.presets[this.curPreset], 234, 227, 2);
  }
};
