// js/cartridges/cart_087_matrix_iq.js
// ============================================================================
// Cartridge #087: MATRIX IQ
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[87] = {
  id: 87,
  name: "MATRIX IQ",
  genre: 8,
  scoreLabel: "IQ",
  desc: "RAVEN'S PROGRESSIVE MATRICES: DEDUCE THE 9TH SHAPE FROM ROTATION, COUNT, AND GEOMETRIC LOGIC RULES!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // 3x3 mini grid with '?' in bottom right
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 3; c++) {
        var px = x + 6 + c * 7;
        var py = y + 6 + r * 7;
        if (r === 2 && c === 2) {
          g.text("?", px, py, 3);
        } else {
          g.box(px, py, 5, 5, 2);
        }
      }
    }
  },

  init() {
    this.totalPuzzles = 8;
    this.currentPuzzle = 0;
    this.correctCount = 0;
    this.selectedOption = 0;
    this.state = 'PLAY'; // 'PLAY', 'FEEDBACK', 'FINAL_REPORT'
    this.stateTimer = 0;
    this.lastCorrect = false;

    // Define 8 genuine progressive matrix puzzles
    this.puzzles = [
      {
        title: "PUZZLE 1: ROTATION",
        rule: "ROTATING NEEDLE (+90 DEGREE PER COL)",
        // Grid values: needle angle in radians
        grid: [
          0, Math.PI / 2, Math.PI,
          Math.PI / 2, Math.PI, 3 * Math.PI / 2,
          Math.PI, 3 * Math.PI / 2, null // Ans: 0 (or 2*PI)
        ],
        type: 'NEEDLE',
        options: [Math.PI / 4, 0, Math.PI / 2, Math.PI],
        correct: 1
      },
      {
        title: "PUZZLE 2: COUNT PROGRESSION",
        rule: "DOT COUNT (ROW + COL)",
        grid: [
          1, 2, 3,
          2, 3, 4,
          3, 4, null // Ans: 5
        ],
        type: 'DOTS',
        options: [4, 6, 5, 3],
        correct: 2
      },
      {
        title: "PUZZLE 3: SHAPE PERMUTATION",
        rule: "ROW PERMUTATION (CIRCLE, SQUARE, TRIANGLE)",
        grid: [
          0, 1, 2, // 0: circle, 1: square, 2: tri
          1, 2, 0,
          2, 0, null // Ans: 1 (square)
        ],
        type: 'SHAPES',
        options: [0, 2, 1, 3],
        correct: 2
      },
      {
        title: "PUZZLE 4: CONCENTRIC RINGS",
        rule: "NESTED CIRCLES (1, 2, 3 RINGS)",
        grid: [
          1, 2, 3,
          2, 3, 1,
          3, 1, null // Ans: 2
        ],
        type: 'RINGS',
        options: [1, 2, 3, 4],
        correct: 1
      },
      {
        title: "PUZZLE 5: LINE CROSSINGS",
        rule: "HORIZONTAL & VERTICAL BARS",
        grid: [
          { h: 1, v: 1 }, { h: 1, v: 2 }, { h: 1, v: 3 },
          { h: 2, v: 1 }, { h: 2, v: 2 }, { h: 2, v: 3 },
          { h: 3, v: 1 }, { h: 3, v: 2 }, null // Ans: h:3, v:3
        ],
        type: 'BARS',
        options: [
          { h: 2, v: 3 },
          { h: 3, v: 3 },
          { h: 3, v: 2 },
          { h: 1, v: 3 }
        ],
        correct: 1
      },
      {
        title: "PUZZLE 6: DIAGONAL STRIPES",
        rule: "SLASH CORNER ORIENTATION",
        grid: [
          1, 2, 3,
          2, 3, 4,
          3, 4, null // Ans: 5
        ],
        type: 'SLASHES',
        options: [3, 5, 4, 6],
        correct: 1
      },
      {
        title: "PUZZLE 7: SHADING DENSITY",
        rule: "PHOSPHOR SHADE (1, 2, 3)",
        grid: [
          1, 2, 3,
          3, 1, 2,
          2, 3, null // Ans: 1
        ],
        type: 'SHADE',
        options: [2, 3, 1, 0],
        correct: 2
      },
      {
        title: "PUZZLE 8: SYMMETRY LOGIC",
        rule: "PERMUTATION & ROTATION",
        grid: [
          0, 1, 2,
          1, 2, 0,
          2, 0, null // Ans: 1
        ],
        type: 'SHAPES',
        options: [0, 1, 2, 3],
        correct: 1
      }
    ];

    this.loadPuzzle(0);
  },

  loadPuzzle(idx) {
    this.currentPuzzle = idx;
    this.selectedOption = 0;
    this.state = 'PLAY';
    this.stateTimer = 0;
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;

    if (this.state === 'FEEDBACK') {
      if (this.stateTimer > 1.2 || PAD.hit('a') || TOUCH.down) {
        if (this.currentPuzzle + 1 < this.totalPuzzles) {
          this.loadPuzzle(this.currentPuzzle + 1);
        } else {
          this.state = 'FINAL_REPORT';
          this.stateTimer = 0;
          var estimatedIQ = 90 + Math.floor((this.correctCount / this.totalPuzzles) * 50);
          SAVE.setScore(this.id, estimatedIQ);
          APU.sfx('FANFARE');
        }
      }
      return;
    }

    if (this.state === 'FINAL_REPORT') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    // Option Navigation
    if (PAD.hit('left')) { this.selectedOption = (this.selectedOption - 1 + 4) % 4; APU.sfx('SELECT'); }
    if (PAD.hit('right')) { this.selectedOption = (this.selectedOption + 1) % 4; APU.sfx('SELECT'); }

    // [A] Confirm selected option
    if (PAD.hit('a')) {
      this.submitOption(this.selectedOption);
    }

    // Touch controls
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      // 4 option boxes at bottom: y: 172 to 216
      var optW = 48, optH = 40;
      for (var o = 0; o < 4; o++) {
        var ox = 18 + o * 54;
        if (tx >= ox && tx <= ox + optW && ty >= 170 && ty <= 216) {
          this.selectedOption = o;
          this.submitOption(o);
          break;
        }
      }
    }
  },

  submitOption(optIdx) {
    var p = this.puzzles[this.currentPuzzle];
    var isRight = (optIdx === p.correct);
    this.lastCorrect = isRight;

    if (isRight) {
      this.correctCount++;
      APU.sfx('COIN');
    } else {
      APU.sfx('HIT');
    }

    this.state = 'FEEDBACK';
    this.stateTimer = 0;
  },

  render(g) {
    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("MATRIX IQ", 6, 6, 3);
    g.text("TEST " + (this.currentPuzzle + 1) + "/" + this.totalPuzzles, 92, 6, 2);
    g.textR("SCORE:" + this.correctCount, 234, 6, 3);

    if (this.state === 'FINAL_REPORT') {
      this.renderReport(g);
      return;
    }

    var p = this.puzzles[this.currentPuzzle];

    // 3x3 Matrix Container
    var mox = 56, moy = 28, csz = 42;

    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 3; c++) {
        var bx = mox + c * csz;
        var by = moy + r * csz;
        var idx = r * 3 + c;
        var val = p.grid[idx];

        g.box(bx, by, csz, csz, 1);

        if (idx === 8) {
          // Missing 9th cell
          g.rect(bx + 2, by + 2, csz - 4, csz - 4, 1);
          g.textC("?", by + 16, 3);
        } else {
          this.drawMatrixCell(g, p.type, val, bx + csz / 2, by + csz / 2);
        }
      }
    }
    // Heavy outer box
    g.box(mox - 1, moy - 1, 3 * csz + 2, 3 * csz + 2, 2);

    // Feedback or Instruction Banner
    if (this.state === 'FEEDBACK') {
      g.rect(20, 154, 200, 16, 0);
      if (this.lastCorrect) {
        g.textC("+CORRECT! " + p.rule, 158, 3);
      } else {
        g.textC("INCORRECT. RULE: " + p.rule, 158, 2);
      }
    } else {
      g.textC("WHICH ITEM COMPLETES THE 3X3 MATRIX?", 158, 2);
    }

    // 4 Multiple Choice Options (Bottom)
    var optW = 48, optH = 40;
    for (var o = 0; o < 4; o++) {
      var obx = 18 + o * 54;
      var oby = 172;
      var isSel = (o === this.selectedOption);

      g.rect(obx, oby, optW, optH, isSel ? 1 : 0);
      g.box(obx, oby, optW, optH, isSel ? 3 : 2);

      // Draw option content
      this.drawMatrixCell(g, p.type, p.options[o], obx + optW / 2, oby + optH / 2);

      // Letter indicator (A, B, C, D)
      var letters = ["A", "B", "C", "D"];
      g.text(letters[o], obx + 3, oby + 3, isSel ? 3 : 1);
    }

    // Bottom Help Banner
    g.rect(0, 226, 240, 14, 0);
    g.line(0, 226, 240, 226, 2);
    g.text("D-PAD: SELECT  [A]: SUBMIT", 6, 229, 2);
    g.textR("TOUCH: TAP OPTION", 234, 229, 2);
  },

  drawMatrixCell(g, type, val, cx, cy) {
    if (type === 'NEEDLE') {
      // Rotating needle
      var len = 14;
      var nx = cx + Math.cos(val) * len;
      var ny = cy + Math.sin(val) * len;
      g.line(cx, cy, nx, ny, 3);
      g.disc(cx, cy, 2, 2);
      g.disc(nx, ny, 2, 3);
    } else if (type === 'DOTS') {
      // Clustered dots
      var count = val;
      if (count === 1) g.disc(cx, cy, 3, 3);
      else if (count === 2) { g.disc(cx - 6, cy, 3, 3); g.disc(cx + 6, cy, 3, 3); }
      else if (count === 3) { g.disc(cx - 8, cy, 3, 3); g.disc(cx, cy, 3, 3); g.disc(cx + 8, cy, 3, 3); }
      else if (count === 4) {
        g.disc(cx - 6, cy - 6, 3, 3); g.disc(cx + 6, cy - 6, 3, 3);
        g.disc(cx - 6, cy + 6, 3, 3); g.disc(cx + 6, cy + 6, 3, 3);
      } else if (count === 5) {
        g.disc(cx - 8, cy - 8, 3, 3); g.disc(cx + 8, cy - 8, 3, 3);
        g.disc(cx, cy, 3, 3);
        g.disc(cx - 8, cy + 8, 3, 3); g.disc(cx + 8, cy + 8, 3, 3);
      } else {
        g.disc(cx, cy, 4, 3);
      }
    } else if (type === 'SHAPES') {
      if (val === 0) g.circle(cx, cy, 11, 3); // Circle
      else if (val === 1) g.box(cx - 10, cy - 10, 20, 20, 3); // Square
      else if (val === 2) {
        // Triangle
        g.line(cx, cy - 11, cx - 11, cy + 10, 3);
        g.line(cx - 11, cy + 10, cx + 11, cy + 10, 3);
        g.line(cx + 11, cy + 10, cx, cy - 11, 3);
      } else {
        g.line(cx - 10, cy, cx + 10, cy, 3);
        g.line(cx, cy - 10, cx, cy + 10, 3);
      }
    } else if (type === 'RINGS') {
      for (var r = 1; r <= val; r++) {
        g.circle(cx, cy, r * 4, 3);
      }
    } else if (type === 'BARS') {
      // Horizontal bars
      for (var h = 0; h < val.h; h++) {
        var hy = cy - 8 + h * 8;
        g.line(cx - 12, hy, cx + 12, hy, 2);
      }
      // Vertical bars
      for (var v = 0; v < val.v; v++) {
        var vx = cx - 8 + v * 8;
        g.line(vx, cy - 12, vx, cy + 12, 3);
      }
    } else if (type === 'SLASHES') {
      for (var s = 0; s < val; s++) {
        var off = (s - val / 2) * 5;
        g.line(cx - 8 + off, cy + 8, cx + 8 + off, cy - 8, 3);
      }
    } else if (type === 'SHADE') {
      g.disc(cx, cy, 10, val);
    }
  },

  renderReport(g) {
    g.box(20, 40, 200, 160, 3);
    g.textC("RAVEN MATRIX IQ EVALUATION", 55, 3);

    var estIQ = 90 + Math.floor((this.correctCount / this.totalPuzzles) * 50);
    g.textC("SCORE: " + this.correctCount + " / " + this.totalPuzzles + " SOLVED", 85, 2);
    g.textC("ESTIMATED IQ SCORE:", 110, 2);
    g.textC("" + estIQ, 128, 3);

    var grade = estIQ >= 130 ? "VERY SUPERIOR (MENSA LEVEL)" : (estIQ >= 115 ? "SUPERIOR FLUID REASONING" : "AVERAGE COGNITIVE PERFORMANCE");
    g.textC(grade, 152, 2);
    g.textC("PRESS [A] TO RETEST", 180, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
  }
};
