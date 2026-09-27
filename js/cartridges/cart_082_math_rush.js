// js/cartridges/cart_082_math_rush.js
// ============================================================================
// Cartridge #082: MATH RUSH
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[82] = {
  id: 82,
  name: "MATH RUSH",
  genre: 8,
  scoreLabel: "SCORE",
  desc: "RAPID ARITHMETIC SPRINT: IDENTIFY THE MISSING OPERATOR (+, -, *, /) BEFORE TIME RUNS OUT!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Arithmetic symbols in 2x2 quadrants
    g.text("+", x + 7, y + 6, 3);
    g.text("-", x + 20, y + 6, 3);
    g.text("x", x + 7, y + 18, 2);
    g.text("/", x + 20, y + 18, 2);
  },

  init() {
    this.score = 0;
    this.solved = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.timeLeft = 45.0;
    this.totalTime = 45.0;

    this.n1 = 0;
    this.n2 = 0;
    this.target = 0;
    this.correctOp = '+'; // '+', '-', '*', '/'
    this.options = ['+', '-', '*', '/'];
    this.selectedOption = 0;

    this.state = 'PLAY'; // 'PLAY', 'GAMEOVER'
    this.stateTimer = 0;
    this.flashTimer = 0;
    this.flashCorrect = false;

    this.nextProblem();
  },

  nextProblem() {
    var ops = ['+', '-', '*', '/'];
    // Scale operations based on solved count
    var allowedOps = (this.solved < 5) ? ['+', '-'] : ops;
    var op = allowedOps[Math.floor(Math.random() * allowedOps.length)];
    this.correctOp = op;

    var a = 0, b = 0, res = 0;
    if (op === '+') {
      a = Math.floor(Math.random() * 25) + 2;
      b = Math.floor(Math.random() * 25) + 1;
      res = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 30) + 10;
      b = Math.floor(Math.random() * a) + 1;
      res = a - b;
    } else if (op === '*') {
      a = Math.floor(Math.random() * 10) + 2;
      b = Math.floor(Math.random() * 9) + 2;
      res = a * b;
    } else if (op === '/') {
      b = Math.floor(Math.random() * 8) + 2;
      res = Math.floor(Math.random() * 10) + 2;
      a = b * res; // Guarantees integer division
    }

    this.n1 = a;
    this.n2 = b;
    this.target = res;
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;

    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
    }

    if (this.state === 'GAMEOVER') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    // Time depletion
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.state = 'GAMEOVER';
      this.stateTimer = 0;
      SAVE.setScore(this.id, this.score);
      APU.sfx('ERROR');
      return;
    }

    // Quick direction keys for instant answers:
    // UP: '+', DOWN: '-', LEFT: '*', RIGHT: '/'
    if (PAD.hit('up')) { this.submitOp('+'); return; }
    if (PAD.hit('down')) { this.submitOp('-'); return; }
    if (PAD.hit('left')) { this.submitOp('*'); return; }
    if (PAD.hit('right')) { this.submitOp('/'); return; }

    // Or [A] submits currently highlighted option
    if (PAD.hit('a')) {
      this.submitOp(this.options[this.selectedOption]);
      return;
    }

    // Touch controls
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      // 4 operator buttons at bottom: y: 155 to 195
      // [+] at x: 20-65, [-] at x: 75-120, [*] at x: 130-175, [/] at x: 185-230
      if (ty >= 150 && ty <= 195) {
        if (tx >= 18 && tx <= 66) this.submitOp('+');
        else if (tx >= 72 && tx <= 120) this.submitOp('-');
        else if (tx >= 126 && tx <= 174) this.submitOp('*');
        else if (tx >= 180 && tx <= 228) this.submitOp('/');
      }
    }
  },

  submitOp(op) {
    if (op === this.correctOp) {
      this.solved++;
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;

      var multiplier = Math.min(4, 1 + Math.floor(this.streak / 3));
      var pts = 100 * multiplier;
      this.score += pts;

      // Time bonus
      this.timeLeft = Math.min(60.0, this.timeLeft + 2.0);

      this.flashTimer = 0.2;
      this.flashCorrect = true;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.score);
      this.nextProblem();
    } else {
      this.streak = 0;
      this.timeLeft = Math.max(0, this.timeLeft - 3.5); // Penalty
      this.flashTimer = 0.35;
      this.flashCorrect = false;
      APU.sfx('HIT');
    }
  },

  render(g) {
    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("MATH RUSH", 6, 6, 3);
    g.text("STREAK:" + this.streak, 86, 6, this.streak > 3 ? 3 : 2);
    g.textR("SCORE:" + this.score, 234, 6, 3);

    // Time Progress Bar
    var timeRatio = Math.max(0, this.timeLeft / 60.0);
    g.rect(0, 22, 240, 6, 0);
    g.rect(0, 22, Math.floor(240 * timeRatio), 6, this.timeLeft < 10 ? (Math.floor(this.stateTimer * 8) % 2 === 0 ? 3 : 1) : 2);

    // Central Equation Blackboard
    var eqBg = this.flashTimer > 0 ? (this.flashCorrect ? 1 : 2) : 0;
    g.rect(20, 44, 200, 90, eqBg);
    g.box(20, 44, 200, 90, 2);

    // Math Equation Display
    var opSymbol = "?";
    var textY = 78;
    var eqStr = this.n1 + "  [ " + opSymbol + " ]  " + this.n2 + "  =  " + this.target;
    g.textC(eqStr, textY, 3);

    // Prompt
    g.textC("WHICH OPERATOR SATISFIES THE EQUATION?", 115, 1);

    // 4 Operator Choice Buttons
    var btnW = 46, btnH = 36;
    var btnLabels = [
      { op: '+', label: "[+] UP", x: 20 },
      { op: '-', label: "[-] DOWN", x: 74 },
      { op: '*', label: "[*] LEFT", x: 128 },
      { op: '/', label: "[/] RIGHT", x: 182 }
    ];

    for (var b = 0; b < btnLabels.length; b++) {
      var btn = btnLabels[b];
      g.rect(btn.x, 154, btnW, btnH, 1);
      g.box(btn.x, 154, btnW, btnH, 2);
      g.textC(btn.op, 162, 3);
      g.text(btn.label.split(' ')[1] || "", btn.x + 6, 178, 2);
    }

    // Bottom Help Banner
    g.rect(0, 226, 240, 14, 0);
    g.line(0, 226, 240, 226, 2);
    g.text("D-PAD: DIRECT OP  TOUCH: TAP BOX", 6, 229, 2);
    g.textR("SOLVED: " + this.solved, 234, 229, 3);

    // Game Over Overlay
    if (this.state === 'GAMEOVER') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("TIME OVER!", 70, 3);
      g.textC("PROBLEMS SOLVED: " + this.solved, 95, 2);
      g.textC("MAX COMBO STREAK: " + this.maxStreak, 115, 2);
      g.textC("FINAL SCORE: " + this.score, 135, 3);
      g.textC("PRESS [A] TO SPRINT AGAIN", 158, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  }
};
