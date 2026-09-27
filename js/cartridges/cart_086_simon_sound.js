// js/cartridges/cart_086_simon_sound.js
// ============================================================================
// Cartridge #086: SIMON SOUND
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[86] = {
  id: 86,
  name: "SIMON SOUND",
  genre: 8,
  scoreLabel: "LENGTH",
  desc: "1978 SIMON MEMORY GAME: WATCH, LISTEN, AND REPEAT THE EVER-GROWING 4-NOTE CHIPTUNE PATTERN!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Circular 4-quadrant icon
    g.circle(x + 16, y + 16, 12, 2);
    g.line(x + 16, y + 4, x + 16, y + 28, 2);
    g.line(x + 4, y + 16, x + 28, y + 16, 2);
    g.disc(x + 16, y + 16, 4, 3);
  },

  init() {
    this.sequence = [];
    this.playerStep = 0;
    this.activePad = -1; // -1: none, 0: UP, 1: RIGHT, 2: DOWN, 3: LEFT
    this.padLightTimer = 0;

    this.state = 'START'; // 'START', 'PLAYBACK', 'PLAYER_INPUT', 'ROUND_CLEAR', 'GAMEOVER'
    this.stateTimer = 0;
    this.playbackIdx = 0;
    this.playbackGap = 0;
    this.score = 0;
    this.bestScore = 0;

    this.startNewGame();
  },

  startNewGame() {
    this.sequence = [];
    for (var i = 0; i < 3; i++) {
      this.sequence.push(Math.floor(Math.random() * 4));
    }
    this.playerStep = 0;
    this.score = 0;
    this.startPlayback();
  },

  startPlayback() {
    this.state = 'PLAYBACK';
    this.stateTimer = 0;
    this.playbackIdx = 0;
    this.playbackGap = 0.4;
    this.activePad = -1;
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;

    if (this.padLightTimer > 0) {
      this.padLightTimer -= dt;
      if (this.padLightTimer <= 0) {
        this.activePad = -1;
      }
    }

    if (this.state === 'START') {
      if (PAD.hit('a') || TOUCH.down) {
        APU.sfx('CONFIRM');
        this.startNewGame();
      }
      return;
    }

    if (this.state === 'ROUND_CLEAR') {
      if (this.stateTimer > 0.8) {
        // Add next random step
        this.sequence.push(Math.floor(Math.random() * 4));
        this.score = this.sequence.length;
        if (this.score > this.bestScore) this.bestScore = this.score;
        SAVE.setScore(this.id, this.score);
        this.startPlayback();
      }
      return;
    }

    if (this.state === 'GAMEOVER') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.startNewGame();
      }
      return;
    }

    // Computer playback state
    if (this.state === 'PLAYBACK') {
      var stepDuration = Math.max(0.2, 0.45 - this.sequence.length * 0.015);
      var gapDuration = Math.max(0.08, 0.15 - this.sequence.length * 0.005);

      if (this.playbackGap > 0) {
        this.playbackGap -= dt;
        if (this.playbackGap <= 0) {
          if (this.playbackIdx < this.sequence.length) {
            var pad = this.sequence[this.playbackIdx];
            this.lightPad(pad, stepDuration);
            this.playbackIdx++;
            this.playbackGap = stepDuration + gapDuration;
          } else {
            // Finished playback, pass to player
            this.state = 'PLAYER_INPUT';
            this.playerStep = 0;
          }
        }
      }
      return;
    }

    // Player input state
    if (this.state === 'PLAYER_INPUT') {
      var pressed = -1;
      if (PAD.hit('up')) pressed = 0;
      else if (PAD.hit('right')) pressed = 1;
      else if (PAD.hit('down')) pressed = 2;
      else if (PAD.hit('left')) pressed = 3;

      // Touch controls: detect which quadrant was tapped
      if (TOUCH.down) {
        var tx = TOUCH.x, ty = TOUCH.y;
        var cx = 120, cy = 128;
        var dist = Math.hypot(tx - cx, ty - cy);
        if (dist >= 18 && dist <= 78) {
          var angle = Math.atan2(ty - cy, tx - cx); // -PI to PI
          // Angles:
          // UP: -3PI/4 to -PI/4
          // RIGHT: -PI/4 to PI/4
          // DOWN: PI/4 to 3PI/4
          // LEFT: otherwise
          if (angle >= -3 * Math.PI / 4 && angle < -Math.PI / 4) pressed = 0;
          else if (angle >= -Math.PI / 4 && angle < Math.PI / 4) pressed = 1;
          else if (angle >= Math.PI / 4 && angle < 3 * Math.PI / 4) pressed = 2;
          else pressed = 3;
        }
      }

      if (pressed !== -1) {
        this.handlePlayerPad(pressed);
      }
    }
  },

  lightPad(pad, duration) {
    this.activePad = pad;
    this.padLightTimer = duration;

    // Play tone / sound
    var tones = [330, 440, 260, 196]; // E4, A4, C4, G3
    if (typeof APU.tone === 'function') {
      APU.tone(tones[pad], duration, 'sine', 0.5);
    } else {
      var sfxList = ['SELECT', 'CONFIRM', 'COIN', 'TICK'];
      APU.sfx(sfxList[pad]);
    }
  },

  handlePlayerPad(pad) {
    this.lightPad(pad, 0.25);

    if (pad === this.sequence[this.playerStep]) {
      // Correct!
      this.playerStep++;
      if (this.playerStep >= this.sequence.length) {
        // Completed sequence!
        this.state = 'ROUND_CLEAR';
        this.stateTimer = 0;
        APU.sfx('COIN');
      }
    } else {
      // MISSED NOTE!
      this.state = 'GAMEOVER';
      this.stateTimer = 0;
      APU.sfx('ERROR');
    }
  },

  render(g) {
    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("SIMON SOUND", 6, 6, 3);
    g.text("STEP:" + this.playerStep + "/" + this.sequence.length, 94, 6, 2);
    g.textR("BEST:" + Math.max(this.score, this.bestScore), 234, 6, 3);

    var cx = 120, cy = 126;
    var outerR = 72;
    var innerR = 26;

    // Render 4 Quadrant Pads
    // Pad 0: UP
    var upActive = (this.activePad === 0);
    this.drawArcSlice(g, cx, cy, outerR, innerR, -3 * Math.PI / 4 + 0.08, -Math.PI / 4 - 0.08, upActive ? 3 : 1, upActive);

    // Pad 1: RIGHT
    var rightActive = (this.activePad === 1);
    this.drawArcSlice(g, cx, cy, outerR, innerR, -Math.PI / 4 + 0.08, Math.PI / 4 - 0.08, rightActive ? 3 : 2, rightActive);

    // Pad 2: DOWN
    var downActive = (this.activePad === 2);
    this.drawArcSlice(g, cx, cy, outerR, innerR, Math.PI / 4 + 0.08, 3 * Math.PI / 4 - 0.08, downActive ? 3 : 1, downActive);

    // Pad 3: LEFT
    var leftActive = (this.activePad === 3);
    this.drawArcSlice(g, cx, cy, outerR, innerR, 3 * Math.PI / 4 + 0.08, 5 * Math.PI / 4 - 0.08, leftActive ? 3 : 2, leftActive);

    // Center Console Hub
    g.disc(cx, cy, innerR - 2, 0);
    g.circle(cx, cy, innerR - 2, 2);
    g.circle(cx, cy, innerR - 6, 3);
    g.textC("SIMON", cy - 4, 3);

    // Prompt Banner Below
    g.rect(0, 214, 240, 26, 0);
    g.line(0, 214, 240, 214, 2);

    if (this.state === 'PLAYBACK') {
      g.textC("WATCH & LISTEN CAREFULLY...", 222, 2);
    } else if (this.state === 'PLAYER_INPUT') {
      g.textC("YOUR TURN! REPEAT PATTERN", 222, 3);
    } else if (this.state === 'ROUND_CLEAR') {
      g.textC("SEQUENCE VERIFIED!", 222, 3);
    }

    // Overlays
    if (this.state === 'GAMEOVER') {
      g.rect(20, 60, 200, 110, 0);
      g.box(20, 60, 200, 110, 3);
      g.textC("PATTERN MISSED!", 80, 3);
      g.textC("SEQUENCE LENGTH: " + this.sequence.length + " NOTES", 105, 2);
      g.textC("PRESS [A] TO RETRY", 135, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  },

  drawArcSlice(g, cx, cy, rOut, rIn, aStart, aEnd, col, isLit) {
    // Fill wedge area with radial lines
    var steps = 30;
    var da = (aEnd - aStart) / steps;
    for (var i = 0; i <= steps; i++) {
      var a = aStart + i * da;
      var x1 = cx + Math.cos(a) * rIn;
      var y1 = cy + Math.sin(a) * rIn;
      var x2 = cx + Math.cos(a) * rOut;
      var y2 = cy + Math.sin(a) * rOut;
      g.line(x1, y1, x2, y2, col);
    }
    // Outer arc border
    for (var i = 0; i < steps; i++) {
      var a1 = aStart + i * da;
      var a2 = aStart + (i + 1) * da;
      g.line(cx + Math.cos(a1) * rOut, cy + Math.sin(a1) * rOut, cx + Math.cos(a2) * rOut, cy + Math.sin(a2) * rOut, isLit ? 3 : 2);
      g.line(cx + Math.cos(a1) * rIn, cy + Math.sin(a1) * rIn, cx + Math.cos(a2) * rIn, cy + Math.sin(a2) * rIn, isLit ? 3 : 2);
    }
  }
};
