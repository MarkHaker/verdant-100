// js/cartridges/cart_094_sine_sync.js
// ============================================================================
// Cartridge #094: SINE SYNC
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[94] = {
  id: 94,
  name: "SINE SYNC",
  genre: 9,
  scoreLabel: "SIGNALS",
  desc: "CRT OSCILLOSCOPE TUNER: ADJUST FREQUENCY, AMPLITUDE, AND PHASE TO ACHIEVE RESONANT SIGNAL LOCK!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Oscilloscope sine wave curve
    for (var i = 0; i < 24; i += 2) {
      var y1 = y + 16 + Math.sin(i * 0.3) * 8;
      var y2 = y + 16 + Math.sin((i + 2) * 0.3) * 8;
      g.line(x + 4 + i, Math.floor(y1), x + 6 + i, Math.floor(y2), 3);
    }
  },

  init() {
    this.signalIdx = 0;
    this.score = 0;
    this.time = 0;
    this.lockTimer = 0;

    // Knob parameters: [0: FREQ, 1: AMP, 2: PHASE]
    this.activeKnob = 0;
    this.knobNames = ["FREQUENCY", "AMPLITUDE", "PHASE SHIFT"];

    // Player wave values
    this.pFreq = 1.0;
    this.pAmp = 20.0;
    this.pPhase = 0.0;

    // Target wave values
    this.tFreq = 2.4;
    this.tAmp = 35.0;
    this.tPhase = 1.2;

    this.signals = [
      { name: "SATELLITE BEACON", freq: 1.8, amp: 30, phase: 0.8, msg: "TELSTAR-1 ONLINE" },
      { name: "VOYAGER TELEMETRY", freq: 3.2, amp: 22, phase: 2.1, msg: "HELIOSPHERE PASSED" },
      { name: "WEATHER RADAR", freq: 2.6, amp: 40, phase: 1.5, msg: "GALE WARNING 080" },
      { name: "PULSAR PSR-B1919", freq: 4.5, amp: 18, phase: 0.4, msg: "NEUTRON SPIN STABLE" },
      { name: "SUB-SURFACE SONAR", freq: 1.2, amp: 45, phase: 2.8, msg: "DEPTH ECHO CONFIRMED" }
    ];

    this.state = 'TUNING'; // 'TUNING', 'LOCKED', 'ALL_CLEARED'
    this.stateTimer = 0;
    this.lockPercent = 0;

    this.loadSignal(0);
  },

  loadSignal(idx) {
    this.signalIdx = idx;
    var s = this.signals[idx];
    this.tFreq = s.freq;
    this.tAmp = s.amp;
    this.tPhase = s.phase;

    // Set player to off-target
    this.pFreq = Math.max(0.6, s.freq + (Math.random() < 0.5 ? -0.8 : 0.8));
    this.pAmp = Math.max(10, s.amp + (Math.random() < 0.5 ? -15 : 15));
    this.pPhase = 0.0;

    this.state = 'TUNING';
    this.lockTimer = 0;
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.time += dt;
    this.stateTimer += dt;

    if (this.state === 'ALL_CLEARED') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    if (this.state === 'LOCKED') {
      if (this.stateTimer > 1.8) {
        if (this.signalIdx + 1 < this.signals.length) {
          this.loadSignal(this.signalIdx + 1);
        } else {
          this.state = 'ALL_CLEARED';
          this.stateTimer = 0;
          APU.sfx('FANFARE');
          SAVE.setScore(this.id, this.score);
        }
      }
      return;
    }

    // Switch active parameter knob: [Up] / [Down]
    if (PAD.hit('up')) {
      this.activeKnob = (this.activeKnob - 1 + 3) % 3;
      APU.sfx('SELECT');
    }
    if (PAD.hit('down')) {
      this.activeKnob = (this.activeKnob + 1) % 3;
      APU.sfx('SELECT');
    }

    // Adjust active knob: [Left] / [Right]
    var stepMult = PAD.btn('b') ? 0.3 : 1.0; // Fine-tune modifier
    if (PAD.btn('left')) {
      this.adjustParam(-1, dt * stepMult);
    }
    if (PAD.btn('right')) {
      this.adjustParam(1, dt * stepMult);
    }

    // Direct Touch Controls
    if (TOUCH.down || TOUCH.held) {
      var tx = TOUCH.x, ty = TOUCH.y;
      // 3 knob tabs at bottom: y: 172 to 216
      // Freq: 12-82, Amp: 86-156, Phase: 160-230
      if (ty >= 170 && ty <= 216) {
        if (tx >= 12 && tx <= 82) this.activeKnob = 0;
        else if (tx >= 86 && tx <= 156) this.activeKnob = 1;
        else if (tx >= 160 && tx <= 230) this.activeKnob = 2;
      }
      // Horizontal slide inside scope area adjusts active parameter
      if (TOUCH.drag && Math.abs(TOUCH.drag.dx) > 2) {
        this.adjustParam(Math.sign(TOUCH.drag.dx), 0.05);
      }
    }

    // Calculate Lock Accuracy
    var df = Math.abs(this.pFreq - this.tFreq) / this.tFreq;
    var da = Math.abs(this.pAmp - this.tAmp) / this.tAmp;
    var dp = Math.abs((this.pPhase % (Math.PI * 2)) - (this.tPhase % (Math.PI * 2)));
    if (dp > Math.PI) dp = Math.PI * 2 - dp;

    var totalError = (df * 0.45) + (da * 0.35) + (dp * 0.20);
    this.lockPercent = Math.max(0, Math.min(100, Math.floor((1.0 - totalError) * 100)));

    // Lock condition
    if (this.lockPercent >= 94) {
      this.lockTimer += dt;
      if (this.lockTimer > 0.8) {
        this.state = 'LOCKED';
        this.stateTimer = 0;
        this.score += 500;
        SAVE.setScore(this.id, this.score);
        APU.sfx('COIN');
      }
    } else {
      this.lockTimer = Math.max(0, this.lockTimer - dt * 2);
    }
  },

  adjustParam(dir, amount) {
    if (this.activeKnob === 0) {
      this.pFreq = Math.max(0.5, Math.min(5.5, this.pFreq + dir * 1.2 * amount));
    } else if (this.activeKnob === 1) {
      this.pAmp = Math.max(8.0, Math.min(50.0, this.pAmp + dir * 25.0 * amount));
    } else if (this.activeKnob === 2) {
      this.pPhase = (this.pPhase + dir * 3.5 * amount + Math.PI * 4) % (Math.PI * 2);
    }
  },

  render(g) {
    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("SINE SYNC", 6, 6, 3);
    g.text("SIGNAL " + (this.signalIdx + 1) + "/" + this.signals.length, 84, 6, 2);
    g.textR("LOCK:" + this.lockPercent + "%", 234, 6, this.lockPercent >= 94 ? 3 : 2);

    // Oscilloscope CRT Screen Frame (x: 12, y: 26, w: 216, h: 140)
    var ox = 12, oy = 26, ow = 216, oh = 140;
    var centerY = oy + oh / 2;

    g.rect(ox, oy, ow, oh, 0);
    g.box(ox, oy, ow, oh, 2);

    // CRT Graticule Grid Lines (5mm grid)
    for (var gx = ox + 24; gx < ox + ow; gx += 24) {
      for (var gy = oy + 4; gy < oy + oh; gy += 6) {
        g.px(gx, gy, 1);
      }
    }
    for (var gy = oy + 20; gy < oy + oh; gy += 20) {
      for (var gx = ox + 4; gx < ox + ow; gx += 6) {
        g.px(gx, gy, 1);
      }
    }
    // Center reticle axes
    g.line(ox, centerY, ox + ow, centerY, 1);
    g.line(ox + ow / 2, oy, ox + ow / 2, oy + oh, 1);

    // Render Target Waveform (Dim Phosphor)
    var step = 3;
    var prevTy = null;
    for (var x = 0; x < ow; x += step) {
      var rad = (x * 0.05 * this.tFreq) + this.tPhase + this.time * 3.0;
      var ty = centerY + Math.sin(rad) * this.tAmp;
      if (prevTy !== null) {
        g.line(ox + x - step, Math.floor(prevTy), ox + x, Math.floor(ty), 1);
      }
      prevTy = ty;
    }

    // Render Player Waveform (Bright Glowing Phosphor)
    var prevPy = null;
    var pCol = this.state === 'LOCKED' ? 3 : (this.lockPercent >= 90 ? 3 : 2);
    for (var x = 0; x < ow; x += step) {
      var rad = (x * 0.05 * this.pFreq) + this.pPhase + this.time * 3.0;
      var py = centerY + Math.sin(rad) * this.pAmp;
      if (prevPy !== null) {
        g.line(ox + x - step, Math.floor(prevPy), ox + x, Math.floor(py), pCol);
      }
      prevPy = py;
    }

    // Lock Resonance Indicator Ring
    if (this.lockPercent >= 94) {
      g.box(ox + 4, oy + 4, ow - 8, oh - 8, (Math.floor(this.stateTimer * 6) % 2 === 0) ? 3 : 2);
    }

    // 3 Control Knobs Banner (Bottom)
    var knW = 68, knH = 42;
    var knobVals = [
      this.pFreq.toFixed(2) + " KHZ",
      this.pAmp.toFixed(1) + " V",
      (this.pPhase * 180 / Math.PI).toFixed(0) + "°"
    ];

    for (var k = 0; k < 3; k++) {
      var kx = 14 + k * 72;
      var ky = 172;
      var isSel = (k === this.activeKnob);

      g.rect(kx, ky, knW, knH, isSel ? 1 : 0);
      g.box(kx, ky, knW, knH, isSel ? 3 : 2);

      g.text(this.knobNames[k].substring(0, 5), kx + 4, ky + 4, isSel ? 3 : 1);
      g.textC(knobVals[k], ky + 18, isSel ? 3 : 2);

      // Mini dial pointer
      var angle = -Math.PI / 2 + (k === 0 ? this.pFreq : (k === 1 ? this.pAmp / 10 : this.pPhase));
      g.disc(kx + knW - 14, ky + 10, 3, 2);
      g.line(kx + knW - 14, ky + 10, kx + knW - 14 + Math.cos(angle) * 6, ky + 10 + Math.sin(angle) * 6, 3);
    }

    // Bottom Help Banner
    g.rect(0, 224, 240, 16, 0);
    g.line(0, 224, 240, 224, 2);
    g.text("UP/DN: KNOB  LT/RT: TUNE  [B]: FINE", 6, 227, 2);

    // Overlays
    if (this.state === 'LOCKED') {
      g.rect(20, 65, 200, 60, 0);
      g.box(20, 65, 200, 60, 3);
      g.textC("PHASE-LOCK ESTABLISHED!", 78, 3);
      g.textC(this.signals[this.signalIdx].msg, 98, 2);
    } else if (this.state === 'ALL_CLEARED') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("ALL FREQUENCIES SYNCHRONIZED", 68, 3);
      g.textC("RADIO SPECTRUM SECURED", 92, 2);
      g.textC("FINAL SCORE: " + this.score, 115, 3);
      g.textC("PRESS [A] TO RECALIBRATE", 145, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  }
};
