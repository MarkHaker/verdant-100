// js/cartridges/cart_074_bomb_defuse.js
// ============================================================================
// Cartridge #074: BOMB DEFUSE
// Genre: Stealth & Defense (7) | Multi-Module Briefcase Bomb Defusal
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[74] = {
  id: 74,
  name: "BOMB DEFUSE",
  genre: 7,
  scoreLabel: "TIME LEFT",
  desc: "BOMB DEFUSAL: 4 INTERACTIVE MODULES! CUT WIRES, CODE KEYPAD, SIMON FLASH, AND HOLD BUTTON!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Open briefcase with bundle of dynamite sticks, digital timer and wire cutters
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Briefcase border
    g.box(x + 3, y + 4, 26, 24, 2);

    // Digital LED display box
    g.box(x + 7, y + 7, 18, 7, 3);
    g.text("00:45", x + 8, y + 8, 3);

    // Wires
    g.line(x + 7, y + 17, x + 25, y + 17, 3);
    g.line(x + 7, y + 20, x + 25, y + 20, 2);
    g.line(x + 7, y + 23, x + 25, y + 23, 1);

    // Wire Cutters
    g.line(x + 19, y + 15, x + 25, y + 21, 3);
    g.line(x + 25, y + 15, x + 19, y + 21, 3);
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.timer = 75.0; // 75 seconds countdown
    this.strikes = 0;
    this.maxStrikes = 3;
    this.state = 'DEFUSE'; // 'DEFUSE', 'VICTORY', 'EXPLODE'
    this.activeModuleIdx = 0; // 0: WIRES, 1: KEYPAD, 2: SIMON, 3: BIG BUTTON

    // Serial Number Plate (Used for manual defusal rules)
    this.serial = "7F4-K9";
    this.serialLastDigitOdd = true; // 9 is odd

    // Module 1: 4 Wires
    // Rule: "If last digit of serial is odd, cut 3rd wire. Otherwise cut 2nd wire."
    this.wires = [
      { id: 0, cut: false, correct: false },
      { id: 1, cut: false, correct: false },
      { id: 2, cut: false, correct: true }, // Wire 3 is the correct one!
      { id: 3, cut: false, correct: false }
    ];
    this.modWiresSolved = false;

    // Module 2: Keypad / Glyphs (4 Symbols to press in correct order: 0, 1, 2, 3)
    this.glyphs = [
      { id: 0, label: "ψ", pressed: false, order: 0 },
      { id: 1, label: "Ω", pressed: false, order: 1 },
      { id: 2, label: "★", pressed: false, order: 2 },
      { id: 3, label: "§", pressed: false, order: 3 }
    ];
    this.nextExpectedGlyphOrder = 0;
    this.modKeypadSolved = false;

    // Module 3: Simon Says Diode Memory (Sequence of 3 lights)
    this.simonPattern = [0, 2, 1];
    this.simonInputIdx = 0;
    this.simonFlashTimer = 0;
    this.simonStep = 0;
    this.modSimonSolved = false;

    // Module 4: Big Button / Capacitor Discharge
    // Rule: "Hold [A], release when seconds countdown contains '5'"
    this.buttonHolding = false;
    this.buttonHoldTime = 0;
    this.modButtonSolved = false;

    this.cursor = 0; // sub-cursor inside active module
  },

  // --------------------------------------------------------------------------
  // 3. MAIN GAMEPLAY UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    if (dt > 0.05) dt = 0.05;

    // Handle Victory / Explode restart
    if (this.state === 'VICTORY' || this.state === 'EXPLODE') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || TOUCH.down) {
        this.init();
      }
      return;
    }

    // Timer countdown (strikes accelerate clock rate)
    const clockMultiplier = 1.0 + this.strikes * 0.35;
    this.timer -= dt * clockMultiplier;

    if (this.timer <= 0) {
      this.timer = 0;
      this.detonate();
      return;
    }

    // Simon Says flashing loop
    this.simonFlashTimer += dt;
    if (this.simonFlashTimer > 0.7) {
      this.simonFlashTimer = 0;
      this.simonStep = (this.simonStep + 1) % (this.simonPattern.length + 1);
    }

    // 1. MODULE SELECTION (D-PAD UP/DOWN OR [B])
    if (PAD.hit('left')) {
      this.activeModuleIdx = (this.activeModuleIdx + 3) % 4;
      this.cursor = 0;
      APU.sfx('SELECT');
    } else if (PAD.hit('right')) {
      this.activeModuleIdx = (this.activeModuleIdx + 1) % 4;
      this.cursor = 0;
      APU.sfx('SELECT');
    }

    // 2. ACTIVE MODULE INTERACTION
    switch (this.activeModuleIdx) {
      case 0: // MODULE 1: WIRES
        if (PAD.hit('up')) this.cursor = Math.max(0, this.cursor - 1);
        if (PAD.hit('down')) this.cursor = Math.min(3, this.cursor + 1);

        if (PAD.hit('a') && !this.modWiresSolved) {
          const w = this.wires[this.cursor];
          if (!w.cut) {
            w.cut = true;
            if (w.correct) {
              this.modWiresSolved = true;
              APU.sfx('CONFIRM');
              this.checkAllModulesDefused();
            } else {
              this.addStrike();
            }
          }
        }
        break;

      case 1: // MODULE 2: KEYPAD GLYPHS
        if (PAD.hit('up')) this.cursor = (this.cursor + 2) % 4;
        if (PAD.hit('down')) this.cursor = (this.cursor + 2) % 4;

        if (PAD.hit('a') && !this.modKeypadSolved) {
          const g = this.glyphs[this.cursor];
          if (!g.pressed) {
            if (g.order === this.nextExpectedGlyphOrder) {
              g.pressed = true;
              this.nextExpectedGlyphOrder++;
              APU.sfx('TICK');
              if (this.nextExpectedGlyphOrder >= 4) {
                this.modKeypadSolved = true;
                APU.sfx('CONFIRM');
                this.checkAllModulesDefused();
              }
            } else {
              this.addStrike();
            }
          }
        }
        break;

      case 2: // MODULE 3: SIMON SAYS
        if (PAD.hit('up')) this.cursor = (this.cursor + 2) % 4;
        if (PAD.hit('down')) this.cursor = (this.cursor + 2) % 4;

        if (PAD.hit('a') && !this.modSimonSolved) {
          const targetLight = this.simonPattern[this.simonInputIdx];
          if (this.cursor === targetLight) {
            this.simonInputIdx++;
            APU.sfx('TICK');
            if (this.simonInputIdx >= this.simonPattern.length) {
              this.modSimonSolved = true;
              APU.sfx('CONFIRM');
              this.checkAllModulesDefused();
            }
          } else {
            this.simonInputIdx = 0;
            this.addStrike();
          }
        }
        break;

      case 3: // MODULE 4: THE BIG BUTTON
        if (PAD.state.a && !this.modButtonSolved) {
          this.buttonHolding = true;
          this.buttonHoldTime += dt;
        } else if (this.buttonHolding) {
          // Button released!
          this.buttonHolding = false;
          // Check if countdown contains digit '5' (Rule: release when timer has a 5 in any position)
          const timerStr = Math.floor(this.timer).toString();
          if (timerStr.includes('5')) {
            this.modButtonSolved = true;
            APU.sfx('CONFIRM');
            this.checkAllModulesDefused();
          } else {
            this.addStrike();
          }
        }
        break;
    }
  },

  addStrike() {
    this.strikes++;
    APU.sfx('BOOM');
    if (this.strikes >= this.maxStrikes) {
      this.detonate();
    }
  },

  detonate() {
    this.state = 'EXPLODE';
    APU.sfx('EXPLODE');
    SAVE.setScore(this.id, 0);
  },

  checkAllModulesDefused() {
    if (this.modWiresSolved && this.modKeypadSolved && this.modSimonSolved && this.modButtonSolved) {
      this.state = 'VICTORY';
      APU.sfx('FANFARE');
      SAVE.setScore(this.id, Math.floor(this.timer));
    }
  },

  // --------------------------------------------------------------------------
  // 4. 256x240 CRT RENDERING
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    // 1. Briefcase Interior Panel
    g.box(8, 28, 240, 184, 2);
    g.box(10, 30, 236, 180, 1);

    // 2. Top LED Digital Countdown & Strikes Panel
    g.rect(16, 36, 224, 26, 0);
    g.box(16, 36, 224, 26, 2);

    // Digital Timer (MM:SS)
    const sec = Math.max(0, Math.floor(this.timer));
    const timerStr = Math.floor(sec / 60) + ":" + (sec % 60).toString().padStart(2, '0');
    g.text("COUNTDOWN", 24, 44, 2);
    g.text(timerStr, 88, 44, 3);

    // Strikes (X X X)
    g.text("STRIKES:", 148, 44, 2);
    for (let s = 0; s < 3; s++) {
      const isStruck = s < this.strikes;
      g.text("X", 198 + s * 11, 44, isStruck ? 3 : 1);
    }

    // 3. Serial Number Plate
    g.textR("SN: " + this.serial, 230, 68, 2);

    // 4. Render 4 Defusal Modules (2x2 Grid)
    // Module 1: Wires (Top Left: 18, 72, 106, 60)
    this.renderModuleWires(g, 18, 72, 106, 60, this.activeModuleIdx === 0);

    // Module 2: Keypad Glyphs (Top Right: 132, 72, 106, 60)
    this.renderModuleKeypad(g, 132, 72, 106, 60, this.activeModuleIdx === 1);

    // Module 3: Simon Says (Bottom Left: 18, 140, 106, 64)
    this.renderModuleSimon(g, 18, 140, 106, 64, this.activeModuleIdx === 2);

    // Module 4: Big Button (Bottom Right: 132, 140, 106, 64)
    this.renderModuleButton(g, 132, 140, 106, 64, this.activeModuleIdx === 3);

    // 5. Bottom Instructions & Rule Hints
    g.rect(0, 214, 256, 26, 0);
    g.line(0, 214, 256, 214, 2);
    g.textC("LEFT/RIGHT: CYCLE MODULES    [A]: INTERACT / CUT", 222, 2);

    // 6. Overlays
    if (this.state === 'VICTORY') {
      g.dither(25, 65, 206, 75, 0, 1);
      g.box(25, 65, 206, 75, 3);
      g.textC("★ BOMB DEFUSED! SAFE! ★", 80, 3);
      g.textC("TIME REMAINING: " + Math.floor(this.timer) + " SECONDS", 98, 2);
      g.textC("[A] DEFUSE ANOTHER DEVICE", 122, 3);
    } else if (this.state === 'EXPLODE') {
      g.dither(30, 70, 196, 70, 0, 1);
      g.box(30, 70, 196, 70, 3);
      g.textC("💥 CRITICAL DETONATION! 💥", 86, 3);
      g.textC("3 STRIKES OR TIME EXPIRED", 104, 2);
      g.textC("[A] TRY AGAIN", 124, 3);
    }
  },

  renderModuleWires(g, x, y, w, h, active) {
    g.rect(x, y, w, h, 0);
    g.box(x, y, w, h, active ? 3 : 1);
    g.text("1. WIRES", x + 6, y + 6, active ? 3 : 2);
    if (this.modWiresSolved) g.disc(x + w - 12, y + 8, 3, 3);

    for (let i = 0; i < 4; i++) {
      const wy = y + 18 + i * 10;
      const wire = this.wires[i];
      const isCur = active && this.cursor === i;

      if (isCur) g.disc(x + 12, wy, 2, 3);

      if (wire.cut) {
        g.line(x + 20, wy, x + 40, wy, 1);
        g.line(x + 60, wy, x + 85, wy, 1);
      } else {
        g.line(x + 20, wy, x + 85, wy, (i % 2 === 0) ? 3 : 2);
      }
    }
  },

  renderModuleKeypad(g, x, y, w, h, active) {
    g.rect(x, y, w, h, 0);
    g.box(x, y, w, h, active ? 3 : 1);
    g.text("2. GLYPHS", x + 6, y + 6, active ? 3 : 2);
    if (this.modKeypadSolved) g.disc(x + w - 12, y + 8, 3, 3);

    for (let i = 0; i < 4; i++) {
      const gx = x + 16 + (i % 2) * 40;
      const gy = y + 18 + Math.floor(i / 2) * 18;
      const gl = this.glyphs[i];
      const isCur = active && this.cursor === i;

      g.box(gx, gy, 32, 14, isCur ? 3 : gl.pressed ? 1 : 2);
      g.textC(gl.label, gy + 4, gl.pressed ? 1 : 3);
    }
  },

  renderModuleSimon(g, x, y, w, h, active) {
    g.rect(x, y, w, h, 0);
    g.box(x, y, w, h, active ? 3 : 1);
    g.text("3. SIMON", x + 6, y + 6, active ? 3 : 2);
    if (this.modSimonSolved) g.disc(x + w - 12, y + 8, 3, 3);

    const positions = [
      { x: x + 53, y: y + 22 }, // Top
      { x: x + 80, y: y + 42 }, // Right
      { x: x + 53, y: y + 54 }, // Bottom
      { x: x + 26, y: y + 42 }  // Left
    ];

    for (let i = 0; i < 4; i++) {
      const p = positions[i];
      const isCur = active && this.cursor === i;
      const isFlashing = !this.modSimonSolved && (this.simonPattern[this.simonStep] === i);

      g.disc(p.x, p.y, 7, isFlashing ? 3 : isCur ? 2 : 1);
      g.circle(p.x, p.y, 7, isCur ? 3 : 2);
    }
  },

  renderModuleButton(g, x, y, w, h, active) {
    g.rect(x, y, w, h, 0);
    g.box(x, y, w, h, active ? 3 : 1);
    g.text("4. BIG BUTTON", x + 6, y + 6, active ? 3 : 2);
    if (this.modButtonSolved) g.disc(x + w - 12, y + 8, 3, 3);

    // Big Center Button
    const bx = x + 53;
    const by = y + 36;
    g.disc(bx, by, 16, this.buttonHolding ? 1 : 3);
    g.circle(bx, by, 16, active ? 3 : 2);
    g.textC(this.buttonHolding ? "HOLDING" : "DISARM", by - 3, this.buttonHolding ? 3 : 0);
  }
};
