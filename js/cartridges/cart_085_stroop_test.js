// js/cartridges/cart_085_stroop_test.js
// ============================================================================
// Cartridge #085: STROOP TEST
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[85] = {
  id: 85,
  name: "STROOP TEST",
  genre: 8,
  scoreLabel: "SCORE",
  desc: "COGNITIVE STROOP EFFECT: IDENTIFY THE ACTUAL VISUAL ATTRIBUTE (SHADE OR SHAPE), NOT THE WRITTEN WORD!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Word "DARK" drawn in bright phosphor (shade 3)
    g.text("DARK", x + 5, y + 13, 3);
  },

  init() {
    this.totalTrials = 20;
    this.currentTrial = 0;
    this.correctCount = 0;
    this.totalReactionTime = 0;
    this.congruentRT = [];
    this.incongruentRT = [];

    this.trialTimer = 0;
    this.state = 'TITLE'; // 'TITLE', 'TRIAL', 'FEEDBACK', 'REPORT'
    this.stateTimer = 0;

    // Trial attributes
    this.mode = 'SHADE'; // 'SHADE' or 'SHAPE'
    this.wordText = "BRIGHT";
    this.actualAttr = 3; // 3: Bright, 1: Dim
    this.isCongruent = false;
    this.lastCorrect = false;

    this.shapes = ["CIRCLE", "SQUARE", "TRIANGLE"];
    this.shades = [
      { name: "BRIGHT", shade: 3 },
      { name: "DIM", shade: 1 }
    ];
  },

  nextTrial() {
    this.currentTrial++;
    if (this.currentTrial > this.totalTrials) {
      this.state = 'REPORT';
      this.stateTimer = 0;
      var avgRT = this.correctCount > 0 ? Math.floor(this.totalReactionTime / this.correctCount * 1000) : 999;
      var finalScore = Math.max(100, Math.floor(this.correctCount * 250 + Math.max(0, 5000 - avgRT * 5)));
      SAVE.setScore(this.id, finalScore);
      APU.sfx('FANFARE');
      return;
    }

    this.state = 'TRIAL';
    this.trialTimer = 0;

    // Alternate between Shade Stroop and Shape Stroop
    if (Math.random() < 0.5) {
      this.mode = 'SHADE';
      var wordIdx = Math.random() < 0.5 ? 0 : 1;
      var shadeIdx = Math.random() < 0.5 ? 0 : 1;
      this.wordText = this.shades[wordIdx].name;
      this.actualAttr = this.shades[shadeIdx].shade;
      this.isCongruent = (wordIdx === shadeIdx);
    } else {
      this.mode = 'SHAPE';
      var wIdx = Math.floor(Math.random() * 3);
      var sIdx = Math.floor(Math.random() * 3);
      this.wordText = this.shapes[wIdx];
      this.actualAttr = sIdx; // 0=circle, 1=square, 2=triangle
      this.isCongruent = (wIdx === sIdx);
    }
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;

    if (this.state === 'TITLE') {
      if (PAD.hit('a') || PAD.hit('b') || TOUCH.down) {
        APU.sfx('CONFIRM');
        this.currentTrial = 0;
        this.correctCount = 0;
        this.totalReactionTime = 0;
        this.congruentRT = [];
        this.incongruentRT = [];
        this.nextTrial();
      }
      return;
    }

    if (this.state === 'FEEDBACK') {
      if (this.stateTimer > 0.45) {
        this.nextTrial();
      }
      return;
    }

    if (this.state === 'REPORT') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    // Active Trial
    this.trialTimer += dt;

    // Timeout (3.0s max per trial)
    if (this.trialTimer > 3.0) {
      this.submitAnswer(-1); // Timeout penalty
      return;
    }

    // Inputs for Shade mode: [A] = BRIGHT, [B] = DIM
    if (this.mode === 'SHADE') {
      if (PAD.hit('a')) this.submitAnswer(3); // Bright
      if (PAD.hit('b')) this.submitAnswer(1); // Dim
    } else {
      // Shape mode: [Left] = CIRCLE, [Up] = SQUARE, [Right] = TRIANGLE
      if (PAD.hit('left')) this.submitAnswer(0);
      if (PAD.hit('up')) this.submitAnswer(1);
      if (PAD.hit('right')) this.submitAnswer(2);
    }

    // Direct Touch Controls
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      if (this.mode === 'SHADE') {
        // [BRIGHT] at x: 20-110, y: 175-215; [DIM] at x: 130-220
        if (tx >= 18 && tx <= 112 && ty >= 170 && ty <= 220) this.submitAnswer(3);
        if (tx >= 128 && tx <= 222 && ty >= 170 && ty <= 220) this.submitAnswer(1);
      } else {
        // 3 buttons: Circle (16-80), Square (88-152), Triangle (160-224)
        if (ty >= 170 && ty <= 220) {
          if (tx >= 14 && tx <= 82) this.submitAnswer(0);
          else if (tx >= 86 && tx <= 154) this.submitAnswer(1);
          else if (tx >= 158 && tx <= 226) this.submitAnswer(2);
        }
      }
    }
  },

  submitAnswer(ans) {
    var isRight = (ans === this.actualAttr);
    this.lastCorrect = isRight;

    if (isRight) {
      this.correctCount++;
      this.totalReactionTime += this.trialTimer;
      if (this.isCongruent) {
        this.congruentRT.push(this.trialTimer);
      } else {
        this.incongruentRT.push(this.trialTimer);
      }
      APU.sfx('COIN');
    } else {
      APU.sfx('HIT');
    }

    this.state = 'FEEDBACK';
    this.stateTimer = 0;
  },

  render(g) {
    g.clear(0);

    // Top Header
    g.rect(0, 0, 240, 22, 1);
    g.text("STROOP TEST", 6, 6, 3);
    g.text("TRIAL " + Math.min(this.currentTrial, this.totalTrials) + "/" + this.totalTrials, 92, 6, 2);
    g.textR("ACC:" + Math.floor((this.correctCount / Math.max(1, this.currentTrial)) * 100) + "%", 234, 6, 3);

    if (this.state === 'TITLE') {
      g.box(20, 40, 200, 160, 2);
      g.textC("NEUROLOGICAL STROOP TEST", 55, 3);
      g.textC("INHIBIT COGNITIVE INTERFERENCE!", 75, 2);
      g.textC("RESPOND TO ACTUAL VISUAL ATTRIBUTE", 100, 3);
      g.textC("IGNORE THE WRITTEN WORD!", 116, 2);
      g.textC("SPEED & ACCURACY BOTH COUNT", 140, 1);
      g.textC("PRESS [A] TO COMMENCE", 175, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
      return;
    }

    if (this.state === 'TRIAL' || this.state === 'FEEDBACK') {
      // Instruction Banner
      if (this.mode === 'SHADE') {
        g.textC("WHAT IS THE ACTUAL TEXT SHADE?", 32, 2);
      } else {
        g.textC("WHAT IS THE SURROUNDING SHAPE?", 32, 2);
      }

      // Stimulus Box
      var boxCol = this.state === 'FEEDBACK' ? (this.lastCorrect ? 1 : 2) : 0;
      g.rect(40, 48, 160, 100, boxCol);
      g.box(40, 48, 160, 100, 2);

      if (this.mode === 'SHADE') {
        // Draw word in specified shade
        var shd = this.actualAttr; // 3 or 1
        g.textC(this.wordText, 92, shd);
        if (shd === 1) {
          g.textC("(DIM PHOSPHOR)", 116, 1);
        } else {
          g.textC("(BRIGHT GLOW)", 116, 2);
        }
      } else {
        // Shape Mode: draw surrounding container shape + conflicting text
        var shapeIdx = this.actualAttr;
        var cx = 120, cy = 94;
        if (shapeIdx === 0) {
          // Circle
          g.circle(cx, cy, 38, 3);
        } else if (shapeIdx === 1) {
          // Square
          g.box(cx - 36, cy - 36, 72, 72, 3);
        } else {
          // Triangle
          g.line(cx, cy - 38, cx - 44, cy + 34, 3);
          g.line(cx - 44, cy + 34, cx + 44, cy + 34, 3);
          g.line(cx + 44, cy + 34, cx, cy - 38, 3);
        }
        g.textC(this.wordText, cy - 4, 2);
      }

      // Action Response Buttons
      if (this.mode === 'SHADE') {
        // [A] BRIGHT
        g.rect(20, 164, 94, 46, 1);
        g.box(20, 164, 94, 46, 3);
        g.textC("[A] BRIGHT", 182, 3);

        // [B] DIM
        g.rect(126, 164, 94, 46, 1);
        g.box(126, 164, 94, 46, 2);
        g.textC("[B] DIM", 182, 1);
      } else {
        // 3 buttons: CIRCLE [Left], SQUARE [Up], TRIANGLE [Right]
        g.rect(14, 164, 66, 46, 1);
        g.box(14, 164, 66, 46, 2);
        g.circle(47, 180, 8, 3);
        g.textC("CIRCLE", 195, 2);

        g.rect(87, 164, 66, 46, 1);
        g.box(87, 164, 66, 46, 2);
        g.box(112, 172, 16, 16, 3);
        g.textC("SQUARE", 195, 2);

        g.rect(160, 164, 66, 46, 1);
        g.box(160, 164, 66, 46, 2);
        g.line(193, 172, 185, 188, 3);
        g.line(185, 188, 201, 188, 3);
        g.line(201, 188, 193, 172, 3);
        g.textC("TRIANGLE", 195, 2);
      }

      // Bottom Timer Bar
      var tRatio = Math.max(0, 1 - (this.trialTimer / 3.0));
      g.rect(0, 228, Math.floor(240 * tRatio), 8, 3);
    } else if (this.state === 'REPORT') {
      g.box(15, 30, 210, 185, 3);
      g.textC("STROOP EVALUATION COMPLETE", 42, 3);

      var avgOverall = this.correctCount > 0 ? Math.floor((this.totalReactionTime / this.correctCount) * 1000) : 0;
      var sumC = 0, sumI = 0;
      for (var c = 0; c < this.congruentRT.length; c++) sumC += this.congruentRT[c];
      for (var i = 0; i < this.incongruentRT.length; i++) sumI += this.incongruentRT[i];
      var avgC = this.congruentRT.length > 0 ? Math.floor((sumC / this.congruentRT.length) * 1000) : 0;
      var avgI = this.incongruentRT.length > 0 ? Math.floor((sumI / this.incongruentRT.length) * 1000) : 0;
      var interference = Math.max(0, avgI - avgC);

      g.text("CORRECT TRIALS: " + this.correctCount + " / " + this.totalTrials, 25, 68, 2);
      g.text("MEAN REACTION: " + avgOverall + " MS", 25, 86, 2);
      g.text("CONGRUENT RT:  " + avgC + " MS", 25, 104, 2);
      g.text("INCONGRUENT RT: " + avgI + " MS", 25, 122, 2);
      g.text("INTERFERENCE:  +" + interference + " MS", 25, 140, 3);

      var grade = interference < 80 ? "EXEMPLARY (FAST INHIBITION)" : (interference < 180 ? "NORMAL ADULT INHIBITION" : "HIGH INTERFERENCE DELAY");
      g.textC(grade, 164, 3);
      g.textC("PRESS [A] TO RETEST", 195, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  }
};
