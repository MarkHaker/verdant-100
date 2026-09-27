// js/cartridges/cart_089_odd_pixel.js
// ============================================================================
// Cartridge #089: ODD PIXEL
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[89] = {
  id: 89,
  name: "ODD PIXEL",
  genre: 8,
  scoreLabel: "SCORE",
  desc: "VISUAL ACUITY TEST: SPOT THE SINGLE ANOMALOUS ALTERED GLYPH IN A DENSE RUNE GRID BEFORE TIME RUNS OUT!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Grid of dots with one square
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 3; c++) {
        if (r === 1 && c === 1) g.disc(x + 8 + c * 8, y + 8 + r * 8, 2, 3);
        else g.px(x + 8 + c * 8, y + 8 + r * 8, 2);
      }
    }
  },

  init() {
    this.round = 1;
    this.totalRounds = 10;
    this.score = 0;
    this.roundTimer = 0;
    this.timeLimit = 10.0;
    this.totalReactionTime = 0;

    this.gridDim = 4; // Increases from 4 to 8
    this.oddX = 1;
    this.oddY = 1;
    this.cursorX = 0;
    this.cursorY = 0;

    this.state = 'PLAY'; // 'PLAY', 'ROUND_CLEAR', 'GAMEOVER', 'VICTORY'
    this.stateTimer = 0;

    this.baseRune = [];
    this.oddRune = [];

    this.startRound(1);
  },

  startRound(rnd) {
    this.round = rnd;
    this.roundTimer = 0;
    this.state = 'PLAY';
    this.stateTimer = 0;

    // Grid size scales: 4 -> 5 -> 6 -> 7 -> 8
    if (rnd <= 2) this.gridDim = 4;
    else if (rnd <= 4) this.gridDim = 5;
    else if (rnd <= 7) this.gridDim = 6;
    else this.gridDim = 8;

    this.oddX = Math.floor(Math.random() * this.gridDim);
    this.oddY = Math.floor(Math.random() * this.gridDim);
    this.cursorX = 0;
    this.cursorY = 0;

    // Generate 5x5 pixel bitmap rune
    this.baseRune = [];
    this.oddRune = [];
    for (var i = 0; i < 25; i++) {
      var bit = Math.random() < 0.4 ? 1 : 0;
      this.baseRune[i] = bit;
      this.oddRune[i] = bit;
    }

    // Mutate exactly one pixel or flip orientation
    var anomalyType = Math.random();
    if (anomalyType < 0.5) {
      // Toggle a random pixel
      var flipIdx = Math.floor(Math.random() * 25);
      this.oddRune[flipIdx] = this.baseRune[flipIdx] === 1 ? 0 : 1;
    } else {
      // Rotate or invert
      for (var r = 0; r < 5; r++) {
        for (var c = 0; c < 5; c++) {
          this.oddRune[r * 5 + c] = this.baseRune[(4 - r) * 5 + c]; // vertically flipped
        }
      }
    }
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;

    if (this.state === 'ROUND_CLEAR') {
      if (this.stateTimer > 0.8) {
        if (this.round < this.totalRounds) {
          this.startRound(this.round + 1);
        } else {
          this.state = 'VICTORY';
          this.stateTimer = 0;
          SAVE.setScore(this.id, this.score);
          APU.sfx('FANFARE');
        }
      }
      return;
    }

    if (this.state === 'GAMEOVER' || this.state === 'VICTORY') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    // Active Play Round
    this.roundTimer += dt;
    if (this.roundTimer >= this.timeLimit) {
      this.state = 'GAMEOVER';
      this.stateTimer = 0;
      SAVE.setScore(this.id, this.score);
      APU.sfx('ERROR');
      return;
    }

    // Cursor Movement
    if (PAD.hit('left')) { this.cursorX = (this.cursorX - 1 + this.gridDim) % this.gridDim; APU.sfx('SELECT'); }
    if (PAD.hit('right')) { this.cursorX = (this.cursorX + 1) % this.gridDim; APU.sfx('SELECT'); }
    if (PAD.hit('up')) { this.cursorY = (this.cursorY - 1 + this.gridDim) % this.gridDim; APU.sfx('SELECT'); }
    if (PAD.hit('down')) { this.cursorY = (this.cursorY + 1) % this.gridDim; APU.sfx('SELECT'); }

    // [A] Confirm choice
    if (PAD.hit('a')) {
      this.checkSelection(this.cursorX, this.cursorY);
    }

    // Direct Touch Controls
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      var cellSize = Math.floor(180 / this.gridDim);
      var ox = Math.floor((240 - this.gridDim * cellSize) / 2);
      var oy = 32 + Math.floor((180 - this.gridDim * cellSize) / 2);

      if (tx >= ox && tx < ox + this.gridDim * cellSize && ty >= oy && ty < oy + this.gridDim * cellSize) {
        var gx = Math.floor((tx - ox) / cellSize);
        var gy = Math.floor((ty - oy) / cellSize);
        this.cursorX = gx;
        this.cursorY = gy;
        this.checkSelection(gx, gy);
      }
    }
  },

  checkSelection(gx, gy) {
    if (gx === this.oddX && gy === this.oddY) {
      // SPOT ON!
      var timeBonus = Math.max(50, Math.floor((this.timeLimit - this.roundTimer) * 40));
      this.score += 200 + timeBonus;
      this.totalReactionTime += this.roundTimer;

      this.state = 'ROUND_CLEAR';
      this.stateTimer = 0;
      APU.sfx('COIN');
    } else {
      // MISTAKE!
      this.roundTimer = Math.min(this.timeLimit, this.roundTimer + 2.0); // 2 second penalty
      APU.sfx('HIT');
    }
  },

  render(g) {
    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("ODD PIXEL", 6, 6, 3);
    g.text("RND " + this.round + "/" + this.totalRounds, 88, 6, 2);
    g.text("SCORE:" + this.score, 142, 6, 3);
    var tRem = Math.max(0, this.timeLimit - this.roundTimer).toFixed(1);
    g.textR(tRem + "S", 234, 6, this.roundTimer > 7 ? 3 : 2);

    // Timer Bar
    var tRatio = Math.max(0, 1 - (this.roundTimer / this.timeLimit));
    g.rect(0, 22, Math.floor(240 * tRatio), 4, this.roundTimer > 7 ? (Math.floor(this.stateTimer * 8) % 2 === 0 ? 3 : 1) : 2);

    // Grid rendering
    var cellSize = Math.floor(180 / this.gridDim);
    var ox = Math.floor((240 - this.gridDim * cellSize) / 2);
    var oy = 30 + Math.floor((180 - this.gridDim * cellSize) / 2);

    for (var gy = 0; gy < this.gridDim; gy++) {
      for (var gx = 0; gx < this.gridDim; gx++) {
        var bx = ox + gx * cellSize;
        var by = oy + gy * cellSize;
        var isOdd = (gx === this.oddX && gy === this.oddY);
        var isCursor = (gx === this.cursorX && gy === this.cursorY);

        // Cell container box
        g.box(bx + 1, by + 1, cellSize - 2, cellSize - 2, isCursor ? 3 : 1);

        // Draw rune (odd or base)
        var rune = isOdd ? this.oddRune : this.baseRune;
        var rCol = isOdd && this.state === 'ROUND_CLEAR' ? 3 : 2;
        this.drawRune(g, rune, bx + Math.floor(cellSize / 2), by + Math.floor(cellSize / 2), rCol);
      }
    }

    // Bottom Help Banner
    g.rect(0, 226, 240, 14, 0);
    g.line(0, 226, 240, 226, 2);
    g.text("D-PAD: MOVE  [A] / TOUCH: SELECT ODD", 6, 229, 2);

    // Overlays
    if (this.state === 'ROUND_CLEAR') {
      g.rect(40, 100, 160, 30, 0);
      g.box(40, 100, 160, 30, 3);
      g.textC("ANOMALY LOCATED!", 110, 3);
    } else if (this.state === 'GAMEOVER') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("TIME DEPLETED!", 70, 3);
      g.textC("ROUNDS COMPLETED: " + (this.round - 1), 95, 2);
      g.textC("FINAL SCORE: " + this.score, 115, 3);
      g.textC("PRESS [A] TO RETRY", 145, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    } else if (this.state === 'VICTORY') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("HAWK VISION CERTIFIED!", 70, 3);
      var avgRT = (this.totalReactionTime / this.totalRounds).toFixed(2);
      g.textC("AVERAGE REACTION: " + avgRT + " SEC", 95, 2);
      g.textC("TOTAL SCORE: " + this.score, 115, 3);
      g.textC("PRESS [A] TO PLAY AGAIN", 145, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  },

  drawRune(g, rune, cx, cy, col) {
    // 5x5 pixel glyph centered at (cx, cy)
    var rx = cx - 4;
    var ry = cy - 4;
    for (var r = 0; r < 5; r++) {
      for (var c = 0; c < 5; c++) {
        if (rune[r * 5 + c] === 1) {
          g.rect(rx + c * 2, ry + r * 2, 2, 2, col);
        }
      }
    }
  }
};
