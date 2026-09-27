// js/cartridges/cart_090_binary_byte.js
// ============================================================================
// Cartridge #090: BINARY BYTE
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[90] = {
  id: 90,
  name: "BINARY BYTE",
  genre: 8,
  scoreLabel: "BYTES",
  desc: "8-BIT HARDWARE DIP SWITCH: TOGGLE BITS (128 TO 1) TO MATCH TARGET DECIMAL & HEX VALUES UNDER TIME PRESSURE!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // 4 mini switches
    for (var i = 0; i < 4; i++) {
      var bx = x + 6 + i * 5;
      g.box(bx, y + 8, 4, 16, 2);
      if (i % 2 === 0) g.rect(bx, y + 8, 4, 7, 3);
      else g.rect(bx, y + 17, 4, 7, 3);
    }
  },

  init() {
    this.score = 0;
    this.bytesSolved = 0;
    this.timeLeft = 60.0;
    this.totalTime = 60.0;
    this.bits = [0, 0, 0, 0, 0, 0, 0, 0]; // Index 0: 128, ... Index 7: 1
    this.bitWeights = [128, 64, 32, 16, 8, 4, 2, 1];
    this.curBit = 0;
    this.target = 0;
    this.streak = 0;

    this.state = 'PLAY'; // 'PLAY', 'BYTE_MATCH', 'GAMEOVER'
    this.stateTimer = 0;

    this.nextByte();
  },

  nextByte() {
    this.bits = [0, 0, 0, 0, 0, 0, 0, 0];
    this.curBit = 3;
    // Generate target between 1 and 255
    this.target = Math.floor(Math.random() * 254) + 1;
    this.state = 'PLAY';
  },

  getSum() {
    var sum = 0;
    for (var i = 0; i < 8; i++) {
      if (this.bits[i]) sum += this.bitWeights[i];
    }
    return sum;
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;

    if (this.state === 'GAMEOVER') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    if (this.state === 'BYTE_MATCH') {
      if (this.stateTimer > 0.6) {
        this.nextByte();
      }
      return;
    }

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.state = 'GAMEOVER';
      this.stateTimer = 0;
      SAVE.setScore(this.id, this.bytesSolved);
      APU.sfx('ERROR');
      return;
    }

    // Switch selection D-pad
    if (PAD.hit('left')) { this.curBit = (this.curBit - 1 + 8) % 8; APU.sfx('SELECT'); }
    if (PAD.hit('right')) { this.curBit = (this.curBit + 1) % 8; APU.sfx('SELECT'); }

    // [A] Toggle Selected Switch
    if (PAD.hit('a')) {
      this.toggleBit(this.curBit);
    }

    // [B] Quick Clear all bits
    if (PAD.hit('b')) {
      this.bits = [0, 0, 0, 0, 0, 0, 0, 0];
      APU.sfx('TICK');
    }

    // Touch controls: tap directly on any switch
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      var ox = 16, swW = 24, gap = 2;
      // Switches y: 110 to 175
      if (ty >= 105 && ty <= 180) {
        for (var i = 0; i < 8; i++) {
          var bx = ox + i * (swW + gap);
          if (tx >= bx && tx <= bx + swW) {
            this.curBit = i;
            this.toggleBit(i);
            break;
          }
        }
      }
      // Tap Clear button
      if (tx >= 180 && tx <= 230 && ty >= 195 && ty <= 220) {
        this.bits = [0, 0, 0, 0, 0, 0, 0, 0];
        APU.sfx('TICK');
      }
    }
  },

  toggleBit(idx) {
    this.bits[idx] = this.bits[idx] ? 0 : 1;
    APU.sfx('TICK');

    // Check if match
    if (this.getSum() === this.target) {
      this.bytesSolved++;
      this.streak++;
      var pts = 100 + this.streak * 25;
      this.score += pts;
      this.timeLeft = Math.min(60.0, this.timeLeft + 3.0); // +3s bonus

      this.state = 'BYTE_MATCH';
      this.stateTimer = 0;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.bytesSolved);
    }
  },

  render(g) {
    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("BINARY BYTE", 6, 6, 3);
    g.text("BYTES:" + this.bytesSolved, 92, 6, 3);
    g.text("STREAK:" + this.streak, 150, 6, 2);
    g.textR(Math.ceil(this.timeLeft) + "S", 234, 6, this.timeLeft < 10 ? 3 : 2);

    // Timer Bar
    var tRatio = Math.max(0, this.timeLeft / 60.0);
    g.rect(0, 22, Math.floor(240 * tRatio), 4, this.timeLeft < 10 ? (Math.floor(this.stateTimer * 8) % 2 === 0 ? 3 : 1) : 2);

    // Target Value Blackboard (x: 20, y: 32, w: 200, h: 54)
    g.rect(20, 32, 200, 54, 0);
    g.box(20, 32, 200, 54, 2);

    var hexStr = "$" + this.target.toString(16).toUpperCase().padStart(2, '0');
    g.textC("TARGET: " + this.target + " (" + hexStr + ")", 42, 3);

    var curSum = this.getSum();
    var curHex = "$" + curSum.toString(16).toUpperCase().padStart(2, '0');
    var isMatch = (curSum === this.target);
    g.textC("CURRENT: " + curSum + " (" + curHex + ")", 64, isMatch ? 3 : 2);

    // DIP Switch Bank Body (PCB style)
    var ox = 16, swW = 24, gap = 2, swH = 68;
    var pcbY = 100;
    g.rect(12, pcbY - 14, 216, swH + 28, 1);
    g.box(12, pcbY - 14, 216, swH + 28, 2);

    // Bit Weight Labels Above
    for (var i = 0; i < 8; i++) {
      var bx = ox + i * (swW + gap);
      var wStr = "" + this.bitWeights[i];
      g.textC(wStr, bx + swW / 2, pcbY - 10, 1);
    }

    // 8 DIP Switches with LEDs
    for (var i = 0; i < 8; i++) {
      var bx = ox + i * (swW + gap);
      var by = pcbY + 6;
      var isOn = (this.bits[i] === 1);
      var isCursor = (i === this.curBit);

      // LED Indicator above switch
      g.disc(bx + swW / 2, by - 6, 2, isOn ? 3 : 0);
      g.circle(bx + swW / 2, by - 6, 3, 2);

      // Switch recessed slot
      g.rect(bx, by, swW, swH - 12, 0);
      g.box(bx, by, swW, swH - 12, isCursor ? 3 : 2);

      // Rocker Switch Lever
      var leverH = (swH - 12) / 2;
      if (isOn) {
        // Lever pushed UP (ON)
        g.rect(bx + 2, by + 2, swW - 4, leverH, 3);
        g.textC("1", bx + swW / 2, by + 5, 0);
      } else {
        // Lever pushed DOWN (OFF)
        g.rect(bx + 2, by + leverH - 2, swW - 4, leverH, 1);
        g.box(bx + 2, by + leverH - 2, swW - 4, leverH, 2);
        g.textC("0", bx + swW / 2, by + leverH + 4, 3);
      }

      // Cursor Highlight Ring
      if (isCursor) {
        g.box(bx - 1, by - 1, swW + 2, swH - 10, 3);
      }
    }

    // Match Flash Banner
    if (this.state === 'BYTE_MATCH') {
      g.rect(30, 84, 180, 24, 0);
      g.box(30, 84, 180, 24, 3);
      g.textC("EXACT BYTE MATCH!", 92, 3);
    }

    // Bottom Help Banner
    g.rect(0, 226, 240, 14, 0);
    g.line(0, 226, 240, 226, 2);
    g.text("D-PAD: SELECT  [A]: TOGGLE", 6, 229, 2);
    g.textR("[B] RESET BITS", 234, 229, 2);

    // Overlays
    if (this.state === 'GAMEOVER') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("TIME OVER!", 70, 3);
      g.textC("BYTES DECODED: " + this.bytesSolved, 95, 3);
      g.textC("TOTAL SCORE: " + this.score, 115, 2);
      g.textC("PRESS [A] TO PLAY AGAIN", 145, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  }
};
