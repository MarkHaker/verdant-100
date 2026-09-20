// js/cartridges/cart_040_blink_match.js
// ============================================================================
// Cartridge #040: BLINK MATCH (Cyberpunk 1-Back Cognitive Reflex Overhaul)
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[40] = {
  id: 40,
  name: "BLINK MATCH",
  genre: 3,
  scoreLabel: "STREAK",
  desc: "FAST GLYPH REFLEX: DOES CURRENT GLYPH MATCH THE PREVIOUS? [A] MATCH, [B] NO MATCH!",

  // --------------------------------------------------------------------------
  // 32x32 Retro Icon: Two adjacent glowing cyber glyph cards with a matching
  // verification checkmark badge and high-voltage lightning bolt.
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Micro corner tech studs
    g.px(x + 1, y + 1, 3);
    g.px(x + 30, y + 1, 3);
    g.px(x + 1, y + 30, 3);
    g.px(x + 30, y + 30, 3);

    // Left Glyph Card (Delta Triangle)
    g.rect(x + 3, y + 3, 11, 15, 1);
    g.box(x + 3, y + 3, 11, 15, 2);
    g.line(x + 8, y + 5, x + 5, y + 12, 3);
    g.line(x + 8, y + 5, x + 11, y + 12, 3);
    g.line(x + 5, y + 12, x + 11, y + 12, 3);
    g.px(x + 8, y + 9, 3);

    // Right Glyph Card (Matching Delta Triangle)
    g.rect(x + 18, y + 3, 11, 15, 1);
    g.box(x + 18, y + 3, 11, 15, 2);
    g.line(x + 23, y + 5, x + 20, y + 12, 3);
    g.line(x + 23, y + 5, x + 26, y + 12, 3);
    g.line(x + 20, y + 12, x + 26, y + 12, 3);
    g.px(x + 23, y + 9, 3);

    // Central High-Voltage Lightning Bolt
    g.line(x + 13, y + 2, x + 17, y + 6, 3);
    g.line(x + 17, y + 6, x + 13, y + 8, 3);
    g.line(x + 13, y + 8, x + 18, y + 14, 3);

    // Matching Verification Checkmark Badge at bottom
    g.rect(x + 5, y + 19, 22, 10, 1);
    g.box(x + 5, y + 19, 22, 10, 2);
    // Glowing verification checkmark
    g.line(x + 9, y + 24, x + 13, y + 27, 3);
    g.line(x + 13, y + 27, x + 21, y + 21, 3);
    g.line(x + 9, y + 25, x + 13, y + 28, 3);
    g.line(x + 13, y + 28, x + 21, y + 22, 3);
  },

  // --------------------------------------------------------------------------
  // The 10 Geometric Cybernetic Glyphs
  // --------------------------------------------------------------------------
  glyphs: [
    { id: 0, name: "DELTA TRI",    type: "DELTA PYRAMID" },
    { id: 1, name: "DIAMOND",      type: "RETICLE CORE" },
    { id: 2, name: "CYBER SKULL",  type: "NEURAL UNIT" },
    { id: 3, name: "BIOHAZARD",    type: "RADIATION LOCK" },
    { id: 4, name: "HEX CROSS",    type: "QUANTUM NODE" },
    { id: 5, name: "OMEGA",        type: "FLUX CONDUIT" },
    { id: 6, name: "SUN BURST",    type: "SOLAR REACTOR" },
    { id: 7, name: "CIRCUIT GATE", type: "LOGIC GATEWAY" },
    { id: 8, name: "HYPER CUBE",   type: "4D TESSERACT" },
    { id: 9, name: "QUANTUM ATOM", type: "ORBITAL SHELL" }
  ],

  // --------------------------------------------------------------------------
  // State Initialization
  // --------------------------------------------------------------------------
  init() {
    this.time = 0;
    this.state = 'TITLE'; // 'TITLE' | 'MEMORIZE' | 'TRIAL' | 'INTERMISSION' | 'GAMEOVER'

    this.lives = 3;
    this.maxLives = 3;

    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.combo = 1;

    this.totalTrials = 0;
    this.correctCount = 0;
    this.mistakeCount = 0;
    this.timeoutCount = 0;
    this.fastBonusCount = 0;
    this.reactionTimes = [];

    // Glyphs
    this.prevGlyph = null;
    this.currentGlyph = null;
    this.isMatchTrial = false;
    this.matchRunCount = 0;
    this.diffRunCount = 0;

    // Timers
    this.trialTimeLeft = 1.2;
    this.trialMaxTime = 1.2;
    this.trialElapsed = 0;
    this.baselineTimer = 0;
    this.intermissionTimer = 0;

    // Visual FX & Feedback
    this.feedbackTimer = 0;
    this.feedbackType = ''; // 'CORRECT' | 'FAST' | 'WRONG' | 'TIMEOUT'
    this.feedbackText = '';
    this.shakeTimer = 0;
    this.shakeIntensity = 0;
    this.flashGreenTimer = 0;
    this.flashRedTimer = 0;
    this.glitchTimer = 0;

    // Visual Variations for advanced phases
    this.glyphRotation = 0; // 0, 90, 180, 270 degrees
    this.glyphInvert = false; // Negative space rendering
    this.glyphGlitchOffset = 0;

    // Neural Phases
    this.currentPhase = 1;
    this.phaseBannerTimer = 0;
    this.phaseBannerText = "";

    // Ergonomic touch buttons visual depress state
    this.btnLeftVisual = 0;
    this.btnRightVisual = 0;
    this.lastPointerDown = false;

    // Floating score / combo popup particles
    this.popups = [];

    // Best streak from persistent storage
    this.bestStreak = 0;
    if (typeof SAVE !== 'undefined') {
      this.bestStreak = SAVE.getScore(40) || 0;
    }
  },

  // --------------------------------------------------------------------------
  // Speed & Phase Escalation
  // --------------------------------------------------------------------------
  getNeuralPhase(streak) {
    if (streak >= 30) return 4; // CYBERNETIC TRANSCENDENCE
    if (streak >= 18) return 3; // GAMMA OVERCLOCK
    if (streak >= 8)  return 2; // BETA ACCELERATION
    return 1;                   // ALPHA PROTOCOL
  },

  getPhaseName(phase) {
    switch (phase) {
      case 1: return "PHASE 1: ALPHA PROTOCOL";
      case 2: return "PHASE 2: BETA ACCELERATION";
      case 3: return "PHASE 3: GAMMA OVERCLOCK";
      case 4: return "PHASE 4: CYBERNETIC TRANSCENDENCE";
      default: return "ALPHA PROTOCOL";
    }
  },

  getPhaseSubtitle(phase) {
    switch (phase) {
      case 1: return "CLEAN GLYPH SIGNALS · SYNAPSE LOCK";
      case 2: return "FREQUENCY ACCELERATION · SCANLINE GLITCH";
      case 3: return "OVERCLOCK · ROTATED & INVERTED GLYPHS";
      case 4: return "MAXIMUM OVERDRIVE · TRANSCEND HUMANITY";
      default: return "";
    }
  },

  // Exposure accelerates from 1.20s down to 0.45s as streak grows
  calculateExposure(streak) {
    const s = Math.min(35, streak);
    const t = 1.20 - (s / 35) * (1.20 - 0.45);
    return Math.max(0.45, Math.min(1.20, t));
  },

  // --------------------------------------------------------------------------
  // Round Progression & Glyph Selection
  // --------------------------------------------------------------------------
  startMemorize() {
    this.state = 'MEMORIZE';
    this.baselineTimer = 1.15;
    const rIdx = Math.floor(Math.random() * this.glyphs.length);
    this.prevGlyph = this.glyphs[rIdx];
    this.currentGlyph = this.prevGlyph;
    this.glyphRotation = 0;
    this.glyphInvert = false;
    this.glyphGlitchOffset = 0;
    this.isMatchTrial = false;

    if (typeof APU !== 'undefined') {
      APU.sfx('TICK');
      if (APU.softTone) APU.softTone(440, 0.12, 'sine', 0.08, 0, 0.01, 1400);
    }
  },

  spawnNextTrial() {
    this.state = 'TRIAL';
    this.totalTrials++;
    this.currentPhase = this.getNeuralPhase(this.streak);
    this.trialMaxTime = this.calculateExposure(this.streak);
    this.trialTimeLeft = this.trialMaxTime;
    this.trialElapsed = 0;

    // Pick whether this trial is a MATCH (target ~42% match rate, avoiding long repetitive streaks)
    let shouldMatch = false;
    if (this.matchRunCount >= 3) {
      shouldMatch = false;
    } else if (this.diffRunCount >= 4) {
      shouldMatch = true;
    } else {
      shouldMatch = Math.random() < 0.42;
    }

    if (shouldMatch) {
      this.isMatchTrial = true;
      this.currentGlyph = this.prevGlyph;
      this.matchRunCount++;
      this.diffRunCount = 0;
    } else {
      this.isMatchTrial = false;
      const otherGlyphs = this.glyphs.filter(g => g.id !== this.prevGlyph.id);
      this.currentGlyph = otherGlyphs[Math.floor(Math.random() * otherGlyphs.length)];
      this.diffRunCount++;
      this.matchRunCount = 0;
    }

    // Apply Phase variations:
    this.glyphRotation = 0;
    this.glyphInvert = false;
    this.glyphGlitchOffset = 0;

    if (this.currentPhase >= 2) {
      // Beta: Glitch displacement
      if (Math.random() < 0.40) {
        this.glyphGlitchOffset = (Math.random() < 0.5 ? -3 : 3);
      }
    }

    if (this.currentPhase >= 3) {
      // Gamma: 90 / 180 degree rotation or negative-space inversion
      if (Math.random() < 0.50) {
        const angles = [90, 180, 270];
        this.glyphRotation = angles[Math.floor(Math.random() * angles.length)];
      }
      if (Math.random() < 0.35) {
        this.glyphInvert = true;
      }
    }

    if (this.currentPhase >= 4) {
      // Transcendence: Rapid scanline shift
      this.glitchTimer = 0.2;
    }

    // Sound: Stimulus trigger click
    if (typeof APU !== 'undefined' && APU.sfx) {
      APU.sfx('TICK');
    }
  },

  // --------------------------------------------------------------------------
  // Audio Synthesis & Combo Arpeggios
  // --------------------------------------------------------------------------
  playComboSound(combo, isFast) {
    if (typeof APU === 'undefined') return;

    // Play standard console confirm if supported
    if (typeof APU.sfx === 'function') {
      try { APU.sfx('CONFIRM'); } catch (_) {}
    }

    // High quality synthesized ascending cyber chord arpeggios
    const baseFreqs = [
      [523.25, 659.25],                   // C5, E5
      [587.33, 783.99],                   // D5, G5
      [659.25, 880.00, 1046.50],          // E5, A5, C6
      [783.99, 987.77, 1174.66],          // G5, B5, D6
      [880.00, 1046.50, 1318.51, 1567.98] // A5, C6, E6, G6
    ];

    const idx = Math.min(baseFreqs.length - 1, Math.max(0, combo - 1));
    const chord = baseFreqs[idx];

    if (APU.softTone) {
      chord.forEach((f, i) => {
        APU.softTone(f, 0.16, 'sine', 0.08, i * 0.035, 0.008, 1800);
      });
    }

    // High-pitched bonus chime for lightning reactions (<300ms)
    if (isFast && APU.tone) {
      APU.tone(1760.00, 0.08, 'triangle', 0.09, 2093.00, 0.06);
    }
  },

  playErrorSound() {
    if (typeof APU === 'undefined') return;
    if (APU.sfx) {
      APU.sfx('DENY');
      APU.sfx('HURT');
    }
    if (APU.tone) {
      APU.tone(140, 0.18, 'sawtooth', 0.12, 65);
    }
  },

  playGameOverSound() {
    if (typeof APU === 'undefined') return;
    if (APU.sfx) APU.sfx('BOOM');
    if (APU.softTone) {
      APU.softTone(110.00, 0.50, 'sawtooth', 0.14, 0.05, 0.02, 500);
      APU.softTone(73.42, 0.70, 'sawtooth', 0.16, 0.20, 0.04, 350);
    }
  },

  // --------------------------------------------------------------------------
  // Player Action & Evaluation
  // --------------------------------------------------------------------------
  handleAnswer(playerChoseMatch) {
    if (this.state !== 'TRIAL') return;

    const reactionMs = Math.round(this.trialElapsed * 1000);
    const isCorrect = (playerChoseMatch === this.isMatchTrial);

    if (isCorrect) {
      this.onCorrectAnswer(reactionMs);
    } else {
      this.onWrongAnswer('WRONG');
    }
  },

  onCorrectAnswer(reactionMs) {
    this.correctCount++;
    this.streak++;
    if (this.streak > this.maxStreak) {
      this.maxStreak = this.streak;
      if (this.maxStreak > this.bestStreak) {
        this.bestStreak = this.maxStreak;
        if (typeof SAVE !== 'undefined') {
          SAVE.setScore(40, this.maxStreak);
        }
      }
    }

    this.reactionTimes.push(reactionMs);

    // Dynamic combo multiplier (x1..x5)
    if (this.streak >= 25) this.combo = 5;
    else if (this.streak >= 15) this.combo = 4;
    else if (this.streak >= 8)  this.combo = 3;
    else if (this.streak >= 4)  this.combo = 2;
    else this.combo = 1;

    let pts = 100 * this.combo;
    const isFast = reactionMs < 300;
    if (isFast) {
      this.fastBonusCount++;
      pts += 50 * this.combo;
    }
    this.score += pts;

    // Visual FX
    this.flashGreenTimer = 0.14;
    this.feedbackTimer = 0.28;
    this.feedbackType = isFast ? 'FAST' : 'CORRECT';
    this.feedbackText = isFast ? `FAST! +${pts} (${reactionMs}MS)` : `CORRECT! +${pts}`;

    this.addPopup(isFast ? "⚡ FAST! +50" : `+${pts}`, 128, 70, 3);
    if (this.combo > 1) {
      this.addPopup(`x${this.combo} COMBO!`, 128, 86, 3);
    }

    // Audio
    this.playComboSound(this.combo, isFast);

    // Check Phase Level Up
    const newPhase = this.getNeuralPhase(this.streak);
    if (newPhase > this.currentPhase) {
      this.currentPhase = newPhase;
      this.phaseBannerTimer = 1.4;
      this.phaseBannerText = this.getPhaseName(newPhase);
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('LEVELUP');
    }

    // Advance to next glyph
    this.prevGlyph = this.currentGlyph;
    this.state = 'INTERMISSION';
    this.intermissionTimer = 0.08;
  },

  onWrongAnswer(reason) {
    if (reason === 'TIMEOUT') {
      this.timeoutCount++;
      this.feedbackText = "TIMEOUT! -1 NODE";
      this.feedbackType = 'TIMEOUT';
    } else {
      this.mistakeCount++;
      this.feedbackText = "ERROR! -1 NODE";
      this.feedbackType = 'WRONG';
    }

    this.lives--;
    this.streak = 0;
    this.combo = 1;

    // Screen Shake & Glitch Flash
    this.shakeTimer = 0.32;
    this.shakeIntensity = 5;
    this.flashRedTimer = 0.24;
    this.feedbackTimer = 0.36;

    if (typeof PAD !== 'undefined' && PAD.vibrate) {
      PAD.vibrate(28);
    }

    this.playErrorSound();
    this.addPopup(reason === 'TIMEOUT' ? "TIMEOUT! -1 CELL" : "MISS! -1 CELL", 128, 76, 2);

    if (this.lives <= 0) {
      this.triggerGameOver();
    } else {
      this.prevGlyph = this.currentGlyph;
      this.state = 'INTERMISSION';
      this.intermissionTimer = 0.18;
    }
  },

  triggerGameOver() {
    this.state = 'GAMEOVER';
    this.playGameOverSound();
    if (this.maxStreak > this.bestStreak) {
      this.bestStreak = this.maxStreak;
    }
    if (typeof SAVE !== 'undefined') {
      SAVE.setScore(40, this.maxStreak);
    }
  },

  addPopup(txt, x, y, c) {
    this.popups.push({ txt, x, y, c, life: 0.65, maxLife: 0.65 });
  },

  // --------------------------------------------------------------------------
  // Update Loop
  // --------------------------------------------------------------------------
  update(dt) {
    // Safety clamp for extreme frame spikes
    dt = Math.max(0.001, Math.min(0.08, dt));
    this.time += dt;

    // Decay visual timers
    if (this.shakeTimer > 0) this.shakeTimer -= dt;
    if (this.flashGreenTimer > 0) this.flashGreenTimer -= dt;
    if (this.flashRedTimer > 0) this.flashRedTimer -= dt;
    if (this.feedbackTimer > 0) this.feedbackTimer -= dt;
    if (this.btnLeftVisual > 0) this.btnLeftVisual -= dt;
    if (this.btnRightVisual > 0) this.btnRightVisual -= dt;
    if (this.phaseBannerTimer > 0) this.phaseBannerTimer -= dt;

    // Update floating popup particles
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.life -= dt;
      p.y -= 18 * dt;
      if (p.life <= 0) this.popups.splice(i, 1);
    }

    // ------------------------------------------------------------------------
    // Ergonomic Input Handling: Mobile Touch + Keyboard + Gamepad
    // ------------------------------------------------------------------------
    const pointerDown = !!(PAD.pointer && PAD.pointer.down);
    const justPointerDown = pointerDown && !this.lastPointerDown;
    this.lastPointerDown = pointerDown;

    let touchMatch = false;
    let touchNoMatch = false;
    let touchAnywhere = false;

    // Check instantaneous touch/click
    if (justPointerDown || PAD.tapPos) {
      const tx = PAD.tapPos ? PAD.tapPos.x : PAD.pointer.x;
      const ty = PAD.tapPos ? PAD.tapPos.y : PAD.pointer.y;

      touchAnywhere = true;
      if (ty >= 180) {
        if (tx < 128) {
          touchNoMatch = true;
          this.btnLeftVisual = 0.15;
        } else {
          touchMatch = true;
          this.btnRightVisual = 0.15;
        }
      }
    }

    // Gamepad & Keyboard Hits
    const hitMatch = PAD.hit('a') || PAD.hit('right') || touchMatch;
    const hitNoMatch = PAD.hit('b') || PAD.hit('left') || touchNoMatch;
    const hitStart = PAD.hit('start') || PAD.hit('a') || touchAnywhere;

    if (PAD.hit('b') || PAD.hit('left')) this.btnLeftVisual = 0.15;
    if (PAD.hit('a') || PAD.hit('right')) this.btnRightVisual = 0.15;

    // ------------------------------------------------------------------------
    // State Machine
    // ------------------------------------------------------------------------
    if (this.state === 'TITLE') {
      if (hitStart) {
        if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_OK');
        this.startMemorize();
      }
      return;
    }

    if (this.state === 'MEMORIZE') {
      this.baselineTimer -= dt;
      if (this.baselineTimer <= 0 || hitMatch || hitNoMatch) {
        this.spawnNextTrial();
      }
      return;
    }

    if (this.state === 'INTERMISSION') {
      this.intermissionTimer -= dt;
      if (this.intermissionTimer <= 0) {
        this.spawnNextTrial();
      }
      return;
    }

    if (this.state === 'TRIAL') {
      this.trialTimeLeft -= dt;
      this.trialElapsed += dt;

      // Handle Player Input
      if (hitMatch && !hitNoMatch) {
        this.handleAnswer(true);
        return;
      }
      if (hitNoMatch && !hitMatch) {
        this.handleAnswer(false);
        return;
      }

      // Check Exposure Timeout
      if (this.trialTimeLeft <= 0) {
        this.onWrongAnswer('TIMEOUT');
      }
      return;
    }

    if (this.state === 'GAMEOVER') {
      if (hitStart) {
        if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_OK');
        this.init();
        this.startMemorize();
      }
    }
  },

  // --------------------------------------------------------------------------
  // Vector Drawing for the 10 Cyber Glyphs
  // Supports dynamic rotation (0/90/180/270 deg) and negative-space inversion.
  // --------------------------------------------------------------------------
  drawGlyph(g, id, cx, cy, col = 3, bg = 0, angle = 0, invert = false, glitchX = 0) {
    cx = Math.floor(cx + glitchX);
    cy = Math.floor(cy);

    if (invert) {
      const tmp = col;
      col = bg;
      bg = tmp;
      // Inverted glowing phosphor backdrop
      g.rect(cx - 36, cy - 36, 72, 72, bg);
      g.box(cx - 36, cy - 36, 72, 72, col);
    }

    // Coordinate mapping helper for rotation
    const rotX = (x, y) => {
      if (angle === 90) return -y;
      if (angle === 180) return -x;
      if (angle === 270) return y;
      return x;
    };
    const rotY = (x, y) => {
      if (angle === 90) return x;
      if (angle === 180) return -y;
      if (angle === 270) return -x;
      return y;
    };

    const dLine = (x0, y0, x1, y1, c = col) => {
      g.line(cx + rotX(x0, y0), cy + rotY(x0, y0), cx + rotX(x1, y1), cy + rotY(x1, y1), c);
    };

    const dTri = (x0, y0, x1, y1, x2, y2, c = col) => {
      g.tri(
        cx + rotX(x0, y0), cy + rotY(x0, y0),
        cx + rotX(x1, y1), cy + rotY(x1, y1),
        cx + rotX(x2, y2), cy + rotY(x2, y2),
        c
      );
    };

    const dDisc = (x, y, r, c = col) => {
      g.disc(cx + rotX(x, y), cy + rotY(x, y), r, c);
    };

    const dCircle = (x, y, r, c = col) => {
      g.circle(cx + rotX(x, y), cy + rotY(x, y), r, c);
    };

    const dRect = (x, y, w, h, c = col) => {
      // Rotate 4 corners of rect and fill
      const rx0 = rotX(x, y), ry0 = rotY(x, y);
      const rx1 = rotX(x + w, y), ry1 = rotY(x + w, y);
      const rx2 = rotX(x + w, y + h), ry2 = rotY(x + w, y + h);
      const rx3 = rotX(x, y + h), ry3 = rotY(x, y + h);

      if (angle === 0 || angle === 180) {
        const minX = Math.min(rx0, rx1, rx2, rx3);
        const minY = Math.min(ry0, ry1, ry2, ry3);
        g.rect(cx + minX, cy + minY, w, h, c);
      } else {
        const minX = Math.min(rx0, rx1, rx2, rx3);
        const minY = Math.min(ry0, ry1, ry2, ry3);
        g.rect(cx + minX, cy + minY, h, w, c);
      }
    };

    // 0: DELTA TRIANGLE
    if (id === 0) {
      dTri(0, -25, -24, 20, 24, 20, col);
      dTri(0, -9, -13, 14, 13, 14, bg);
      dDisc(0, 4, 3, col);
      dLine(0, -27, 0, -25, col);
      dLine(-24, 20, -28, 24, col);
      dLine(24, 20, 28, 24, col);
    }
    // 1: DIAMOND CORE
    else if (id === 1) {
      dLine(0, -26, 26, 0, col);
      dLine(26, 0, 0, 26, col);
      dLine(0, 26, -26, 0, col);
      dLine(-26, 0, 0, -26, col);
      // Double inner rim
      dLine(0, -22, 22, 0, col);
      dLine(22, 0, 0, 22, col);
      dLine(0, 22, -22, 0, col);
      dLine(-22, 0, 0, -22, col);
      // Reticle crosshair rays
      dLine(0, -32, 0, -14, col);
      dLine(0, 14, 0, 32, col);
      dLine(-32, 0, -14, 0, col);
      dLine(14, 0, 32, 0, col);
      dDisc(0, 0, 3, col);
      dDisc(0, 0, 1, bg);
    }
    // 2: CYBER SKULL
    else if (id === 2) {
      dRect(-18, -22, 36, 22, col);
      // Temple notch cutouts
      dRect(-18, -22, 2, 2, bg);
      dRect(16, -22, 2, 2, bg);
      // Visor eye sockets
      dRect(-14, -12, 10, 8, bg);
      dRect(4, -12, 10, 8, bg);
      dDisc(-9, -8, 2, col);
      dDisc(9, -8, 2, col);
      // Nose triangular notch
      dTri(0, -3, -3, 3, 3, 3, bg);
      // Cyber Jaw & Teeth
      dRect(-12, 4, 24, 16, col);
      dLine(-6, 9, -6, 20, bg);
      dLine(-1, 9, -1, 20, bg);
      dLine(4, 9, 4, 20, bg);
      dLine(-12, 14, 12, 14, bg);
      // Forehead Neural Port
      dRect(-5, -20, 10, 4, bg);
      dDisc(0, -18, 1, col);
    }
    // 3: BIOHAZARD
    else if (id === 3) {
      // 3 radiation lobes
      dDisc(0, -13, 11, col);
      dDisc(-12, 9, 11, col);
      dDisc(12, 9, 11, col);
      // Cutouts
      dDisc(0, -13, 6, bg);
      dDisc(-12, 9, 6, bg);
      dDisc(12, 9, 6, bg);
      dDisc(0, 0, 7, bg);
      // Central Hazard Ring
      dCircle(0, 0, 24, col);
      dDisc(0, 0, 3, col);
    }
    // 4: HEX CROSS
    else if (id === 4) {
      dRect(-8, -26, 16, 52, col);
      dRect(-26, -8, 52, 16, col);
      // Stepped Flared Arm Caps
      dRect(-13, -28, 26, 4, col);
      dRect(-13, 24, 26, 4, col);
      dRect(-28, -13, 4, 26, col);
      dRect(24, -13, 4, 26, col);
      // Center Diamond Core Cutout
      dDisc(0, 0, 5, bg);
      dDisc(0, 0, 2, col);
    }
    // 5: OMEGA
    else if (id === 5) {
      dDisc(0, -5, 22, col);
      dDisc(0, -5, 13, bg);
      dRect(-11, 4, 22, 16, bg);
      // Base horizontal feet
      dRect(-26, 14, 14, 6, col);
      dRect(12, 14, 14, 6, col);
      // Base vertical leg ties
      dRect(-16, 6, 7, 10, col);
      dRect(9, 6, 7, 10, col);
      // Center lightning core
      dLine(0, -18, 0, 4, col);
      dDisc(0, -6, 3, col);
    }
    // 6: SUN BURST
    else if (id === 6) {
      dDisc(0, 0, 10, col);
      dDisc(0, 0, 5, bg);
      dDisc(0, 0, 2, col);
      // 4 Cardinal Spikes
      dTri(0, -29, -5, -11, 5, -11, col);
      dTri(0, 29, -5, 11, 5, 11, col);
      dTri(-29, 0, -11, -5, -11, 5, col);
      dTri(29, 0, 11, -5, 11, 5, col);
      // 4 Diagonal Beams
      dLine(-8, -8, -21, -21, col);
      dLine(-7, -8, -20, -21, col);
      dLine(8, -8, 21, -21, col);
      dLine(7, -8, 20, -21, col);
      dLine(-8, 8, -21, 21, col);
      dLine(-7, 8, -20, 21, col);
      dLine(8, 8, 21, 21, col);
      dLine(7, 8, 20, 21, col);
    }
    // 7: CIRCUIT GATE
    else if (id === 7) {
      dRect(-16, -16, 32, 32, col);
      dRect(-12, -12, 24, 24, bg);
      dRect(-7, -7, 14, 14, col);
      dDisc(0, 0, 2, bg);
      // Left Bus Pins
      dLine(-27, -9, -16, -9, col);
      dDisc(-27, -9, 2, col);
      dLine(-27, 9, -16, 9, col);
      dDisc(-27, 9, 2, col);
      // Right Bus Pins
      dLine(16, -9, 27, -9, col);
      dDisc(27, -9, 2, col);
      dLine(16, 9, 27, 9, col);
      dDisc(27, 9, 2, col);
      // Top/Bottom Index Notches
      dLine(-7, -22, -7, -16, col);
      dLine(7, -22, 7, -16, col);
      dLine(-7, 16, -7, 22, col);
      dLine(7, 16, 7, 22, col);
    }
    // 8: HYPER CUBE
    else if (id === 8) {
      dRect(-22, -22, 44, 44, col);
      dRect(-20, -20, 40, 40, bg);
      dRect(-8, -8, 16, 16, col);
      dRect(-6, -6, 12, 12, bg);
      // 4 Perspective Struts
      dLine(-20, -20, -8, -8, col);
      dLine(19, -20, 7, -8, col);
      dLine(-20, 19, -8, 7, col);
      dLine(19, 19, 7, 7, col);
      dDisc(0, 0, 3, col);
    }
    // 9: QUANTUM ATOM
    else if (id === 9) {
      dDisc(0, 0, 6, col);
      dDisc(0, 0, 2, bg);
      dCircle(0, 0, 24, col);
      dCircle(0, 0, 25, col);
      // Tilted Polar Rings
      dLine(-20, -14, 20, 14, col);
      dLine(-20, 14, 20, -14, col);
      // Orbital Electron nodes
      dDisc(-17, -12, 3, col);
      dDisc(17, 12, 3, col);
      dDisc(0, -24, 2, col);
      dDisc(0, 24, 2, col);
    }
  },

  // --------------------------------------------------------------------------
  // Render System: Layout, HUD, CRT Viewport & Touch Controls
  // --------------------------------------------------------------------------
  render(g) {
    // Screen shake offset calculation
    let sx = 0, sy = 0;
    if (this.shakeTimer > 0) {
      sx = Math.floor((Math.random() * 2 - 1) * this.shakeIntensity);
      sy = Math.floor((Math.random() * 2 - 1) * this.shakeIntensity);
    }

    // Clear background
    g.clear(0);

    // Red warning strobe overlay on error
    if (this.flashRedTimer > 0) {
      g.dither(0, 0, 256, 240, 0, 1);
    }

    // ------------------------------------------------------------------------
    // TOP HUD: SCORE, STREAK, MULTIPLIER & 3 PHOSPHOR LIVES
    // ------------------------------------------------------------------------
    g.rect(0, 0, 256, 20, 1);
    g.line(0, 20, 256, 20, 2);

    // Score
    g.text("SCORE " + this.score, 8, 7, 3);

    // Streak & Multiplier
    const streakStr = "STREAK " + this.streak + (this.combo > 1 ? ` (x${this.combo})` : "");
    g.textC(streakStr, 7, this.combo >= 3 ? 3 : 2);

    // 3 Phosphor Battery Cells / Strikes
    const bxStart = 196;
    for (let i = 0; i < this.maxLives; i++) {
      const bx = bxStart + i * 18;
      const by = 5;
      g.box(bx, by, 14, 10, 2);
      g.rect(bx + 14, by + 3, 2, 4, 2); // Battery terminal

      if (i < this.lives) {
        // Glowing Full Cell
        g.rect(bx + 2, by + 2, 10, 6, 3);
        g.px(bx + 6, by + 4, 0); // Lightning core notch
        g.px(bx + 7, by + 5, 0);
      } else {
        // Depleted Strike Cell (Cracked X)
        g.line(bx + 3, by + 2, bx + 10, by + 7, 2);
        g.line(bx + 3, by + 7, bx + 10, by + 2, 2);
      }
    }

    // ------------------------------------------------------------------------
    // PHASE SUBTITLE BANNER
    // ------------------------------------------------------------------------
    g.line(8, 28, 48, 28, 1);
    g.line(208, 28, 248, 28, 1);
    const phaseName = (this.phaseBannerTimer > 0) ? this.phaseBannerText : this.getPhaseName(this.currentPhase);
    g.textC(phaseName, 26, (this.phaseBannerTimer > 0 && Math.floor(this.time * 12) % 2 === 0) ? 3 : 2);

    // ------------------------------------------------------------------------
    // FLASH COUNTDOWN TIMER BAR
    // ------------------------------------------------------------------------
    const barX = 24, barY = 38, barW = 208, barH = 6;
    g.box(barX - 1, barY - 1, barW + 2, barH + 2, 2);

    if (this.state === 'TRIAL') {
      const pct = Math.max(0, Math.min(1, this.trialTimeLeft / this.trialMaxTime));
      const fillW = Math.floor(pct * barW);
      const isUrgent = pct < 0.35;
      const barCol = isUrgent ? (Math.floor(this.time * 14) % 2 === 0 ? 3 : 1) : 3;
      if (fillW > 0) {
        g.rect(barX, barY, fillW, barH, barCol);
      }
    } else if (this.state === 'MEMORIZE') {
      const pct = Math.max(0, Math.min(1, this.baselineTimer / 1.15));
      const fillW = Math.floor(pct * barW);
      g.rect(barX, barY, fillW, barH, 2);
    }

    // ------------------------------------------------------------------------
    // CENTRAL GLYPH VIEWPORT
    // ------------------------------------------------------------------------
    const vpX = 74 + sx;
    const vpY = 48 + sy;
    const vpW = 108;
    const vpH = 94;

    // Viewport outer cyber brackets
    g.line(vpX - 4, vpY - 4, vpX + 8, vpY - 4, 3);
    g.line(vpX - 4, vpY - 4, vpX - 4, vpY + 8, 3);
    g.line(vpX + vpW + 3, vpY - 4, vpX + vpW - 9, vpY - 4, 3);
    g.line(vpX + vpW + 3, vpY - 4, vpX + vpW + 3, vpY + 8, 3);
    g.line(vpX - 4, vpY + vpH + 3, vpX + 8, vpY + vpH + 3, 3);
    g.line(vpX - 4, vpY + vpH + 3, vpX - 4, vpY + vpH - 9, 3);
    g.line(vpX + vpW + 3, vpY + vpH + 3, vpX + vpW - 9, vpY + vpH + 3, 3);
    g.line(vpX + vpW + 3, vpY + vpH + 3, vpX + vpW + 3, vpY + vpH - 9, 3);

    // Viewport box
    const frameCol = (this.flashGreenTimer > 0) ? 3 : (this.flashRedTimer > 0 ? 1 : 2);
    g.rect(vpX, vpY, vpW, vpH, 0);
    g.box(vpX, vpY, vpW, vpH, frameCol);

    // Subtle CRT scan grid inside viewport
    for (let gy = vpY + 4; gy < vpY + vpH - 2; gy += 6) {
      g.line(vpX + 2, gy, vpX + vpW - 3, gy, 1);
    }

    // Center Crosshairs
    const cx = vpX + Math.floor(vpW / 2);
    const cy = vpY + Math.floor(vpH / 2);
    g.px(cx - 32, cy, 2); g.px(cx + 32, cy, 2);
    g.px(cx, cy - 28, 2); g.px(cx, cy + 28, 2);

    // Draw Active Glyph
    const activeGlyph = (this.state === 'MEMORIZE') ? this.prevGlyph : this.currentGlyph;
    if (activeGlyph && this.state !== 'TITLE' && this.state !== 'GAMEOVER') {
      const gCol = (this.flashGreenTimer > 0) ? 3 : 3;
      this.drawGlyph(
        g,
        activeGlyph.id,
        cx,
        cy,
        gCol,
        0,
        this.glyphRotation,
        this.glyphInvert,
        this.glyphGlitchOffset
      );

      // Subtitle tag below glyph viewport
      const gName = `[ ${activeGlyph.name} ]`;
      g.textC(gName, vpY + vpH - 11, 2);
    }

    // ------------------------------------------------------------------------
    // CONTEXT FEEDBACK & REACTION BANNER
    // ------------------------------------------------------------------------
    if (this.state === 'TITLE') {
      g.textC("=== 1-BACK GLYPH MATCH ===", 74, 3, 1);
      g.textC("DOES CURRENT GLYPH MATCH PREVIOUS?", 92, 2);
      g.textC("[A] / RIGHT = MATCH (SAME)", 106, 3);
      g.textC("[B] / LEFT  = NO MATCH (DIFF)", 118, 2);
      const blink = Math.floor(this.time * 4) % 2 === 0;
      g.textC("PRESS [START / A / TAP] TO BEGIN", 134, blink ? 3 : 2);
      g.textC("BEST STREAK: " + this.bestStreak, 150, 1);
    } else if (this.state === 'MEMORIZE') {
      const blink = Math.floor(this.time * 6) % 2 === 0;
      g.textC("★ FIRST GLYPH - MEMORIZE! ★", 148, blink ? 3 : 2);
      g.textC("DO NOT ANSWER YET · SYNAPSE READY", 160, 1);
    } else if (this.state === 'TRIAL' || this.state === 'INTERMISSION') {
      if (this.feedbackTimer > 0) {
        const fCol = (this.feedbackType === 'CORRECT' || this.feedbackType === 'FAST') ? 3 : 2;
        g.textC(this.feedbackText, 148, fCol);
      } else {
        g.textC("DOES THIS GLYPH MATCH THE PREVIOUS?", 148, 2);
      }
      g.textC(`ACCURACY: ${this.totalTrials <= 1 ? '100' : Math.round((this.correctCount / (this.totalTrials - 1)) * 100)}%   MAX: ${this.maxStreak}`, 160, 1);
    } else if (this.state === 'GAMEOVER') {
      this.renderGameOver(g);
    }

    // Floating text popups
    this.popups.forEach(p => {
      g.textC(p.txt, Math.floor(p.y), p.c);
    });

    // ------------------------------------------------------------------------
    // BOTTOM ERGONOMIC TOUCH ZONES & GAMEPAD ACTION BUTTONS
    // [ ✖ NO MATCH ]                   [ ✔ MATCH ]
    // ------------------------------------------------------------------------
    this.renderButtons(g);
  },

  // --------------------------------------------------------------------------
  // Bottom Touch Zones Rendering
  // --------------------------------------------------------------------------
  renderButtons(g) {
    const btnY = 176;
    const btnH = 58;

    // LEFT BUTTON: NO MATCH (B / LEFT)
    const isLeftPressed = this.btnLeftVisual > 0;
    const lX = 8, lW = 116;

    if (isLeftPressed) {
      g.rect(lX, btnY, lW, btnH, 3);
      g.box(lX, btnY, lW, btnH, 0);
      // Large Inverted Cross ✖
      g.line(lX + 16, btnY + 14, lX + 28, btnY + 26, 0);
      g.line(lX + 16, btnY + 15, lX + 28, btnY + 27, 0);
      g.line(lX + 16, btnY + 26, lX + 28, btnY + 14, 0);
      g.line(lX + 16, btnY + 27, lX + 28, btnY + 15, 0);

      g.text("NO MATCH", lX + 34, btnY + 17, 0);
      g.text("[B] / ◀ LEFT", lX + 24, btnY + 36, 0);
    } else {
      g.rect(lX, btnY, lW, btnH, 1);
      g.box(lX, btnY, lW, btnH, 2);
      // Large Red/Dark Accent Cross ✖
      g.line(lX + 16, btnY + 14, lX + 28, btnY + 26, 3);
      g.line(lX + 16, btnY + 15, lX + 28, btnY + 27, 3);
      g.line(lX + 16, btnY + 26, lX + 28, btnY + 14, 3);
      g.line(lX + 16, btnY + 27, lX + 28, btnY + 15, 3);

      g.text("NO MATCH", lX + 34, btnY + 17, 3);
      g.text("[B] / ◀ LEFT", lX + 24, btnY + 36, 2);
    }

    // RIGHT BUTTON: MATCH (A / RIGHT)
    const isRightPressed = this.btnRightVisual > 0;
    const rX = 132, rW = 116;

    if (isRightPressed) {
      g.rect(rX, btnY, rW, btnH, 3);
      g.box(rX, btnY, rW, btnH, 0);
      // Large Checkmark ✔
      g.line(rX + 14, btnY + 22, rX + 20, btnY + 28, 0);
      g.line(rX + 14, btnY + 23, rX + 20, btnY + 29, 0);
      g.line(rX + 20, btnY + 28, rX + 30, btnY + 13, 0);
      g.line(rX + 20, btnY + 29, rX + 30, btnY + 14, 0);

      g.text("MATCH (SAME)", rX + 34, btnY + 17, 0);
      g.text("[A] / RIGHT ▶", rX + 24, btnY + 36, 0);
    } else {
      g.rect(rX, btnY, rW, btnH, 1);
      g.box(rX, btnY, rW, btnH, 3);
      // Bright Phosphor Checkmark ✔
      g.line(rX + 14, btnY + 22, rX + 20, btnY + 28, 3);
      g.line(rX + 14, btnY + 23, rX + 20, btnY + 29, 3);
      g.line(rX + 20, btnY + 28, rX + 30, btnY + 13, 3);
      g.line(rX + 20, btnY + 29, rX + 30, btnY + 14, 3);

      g.text("MATCH (SAME)", rX + 34, btnY + 17, 3);
      g.text("[A] / RIGHT ▶", rX + 24, btnY + 36, 3);
    }
  },

  // --------------------------------------------------------------------------
  // Comprehensive Neural Assessment Report (Game Over Screen)
  // --------------------------------------------------------------------------
  renderGameOver(g) {
    // Dither background behind report dialog
    g.dither(16, 26, 224, 142, 0, 1);
    g.rect(16, 26, 224, 142, 0);
    g.box(16, 26, 224, 142, 3);

    // Header
    g.rect(17, 27, 222, 14, 1);
    g.textC("=== NEURAL ASSESSMENT REPORT ===", 31, 3);

    // Compute Metrics
    const trialsCount = Math.max(0, this.totalTrials - 1);
    const accuracy = trialsCount > 0 ? Math.round((this.correctCount / trialsCount) * 100) : 0;
    const avgMs = this.reactionTimes.length > 0
      ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
      : 0;

    // Final Neural Grade
    let grade = "C";
    let gradeTitle = "BASELINE HUMAN";
    if (accuracy >= 94 && this.maxStreak >= 22) {
      grade = "S";
      gradeTitle = "CYBERNETIC SYNAPSE";
    } else if (accuracy >= 85 && this.maxStreak >= 12) {
      grade = "A";
      gradeTitle = "SUPERCOMPUTER";
    } else if (accuracy >= 70 && this.maxStreak >= 6) {
      grade = "B";
      gradeTitle = "SHARP REFLEXES";
    }

    // Layout rows
    const ry = 48;
    g.text("MAX STREAK:", 26, ry, 2);
    g.textR(`${this.maxStreak}`, 140, ry, 3);

    g.text("ACCURACY:", 26, ry + 12, 2);
    g.textR(`${accuracy}%`, 140, ry + 12, 3);

    g.text("AVG REACTION:", 26, ry + 24, 2);
    g.textR(`${avgMs} MS`, 140, ry + 24, 3);

    g.text("TOTAL SCORE:", 26, ry + 36, 2);
    g.textR(`${this.score}`, 140, ry + 36, 3);

    g.text("FAST REFLEXES:", 26, ry + 48, 2);
    g.textR(`${this.fastBonusCount}`, 140, ry + 48, 3);

    // Large Grade Box on Right
    g.box(152, ry - 1, 78, 59, 2);
    g.textC("GRADE", ry + 4, 2);
    g.textC(grade, ry + 16, 3, 3);
    g.textC(gradeTitle, ry + 44, 2);

    // High Score notification
    if (this.maxStreak >= this.bestStreak && this.maxStreak > 0) {
      const flash = Math.floor(this.time * 6) % 2 === 0;
      g.textC("★ NEW RECORD STREAK! ★", 120, flash ? 3 : 2);
    } else {
      g.textC(`RECORD BEST STREAK: ${this.bestStreak}`, 120, 1);
    }

    // Restart prompt
    const blink = Math.floor(this.time * 4) % 2 === 0;
    g.line(22, 138, 234, 138, 2);
    g.textC("PRESS [START / A / TAP] TO RETEST", 146, blink ? 3 : 2);
  },

  // --------------------------------------------------------------------------
  // Save & Load Persistence
  // --------------------------------------------------------------------------
  save() {
    return {
      bestStreak: this.bestStreak,
      highScore: this.score
    };
  },

  load(data) {
    if (data && typeof data.bestStreak === 'number') {
      this.bestStreak = data.bestStreak;
    }
  }
};
