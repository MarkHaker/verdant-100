// js/cartridges/cart_029_liquid_sort.js
// ============================================================================
// Cartridge #029: LIQUID SORT
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[29] = {
  id: 29,
  name: "LIQUID SORT",
  genre: 2,
  scoreLabel: "LEVEL",
  desc: "SORT MATCHING LIQUIDS INTO LAB TUBES. D-PAD/TOUCH SELECT, [A] POUR, [B] UNDO, [SELECT] RETRY.",

  // Master Campaign Levels (Verified Solvable with Exact Par Moves)
  LEVELS: [
    // 1-3: 3 tubes, 2 colors (Gentle tutorial)
    { lvl: 1, colors: 2, empty: 1, tubes: [[1, 2, 1, 2], [2, 1, 2, 1], []], par: 7 },
    { lvl: 2, colors: 2, empty: 1, tubes: [[2, 2, 1, 1], [1, 1, 2, 2], []], par: 3 },
    { lvl: 3, colors: 2, empty: 1, tubes: [[1, 2, 2, 1], [2, 1, 1, 2], []], par: 5 },

    // 4-7: 4-5 tubes, 3 colors (Branching choices)
    { lvl: 4, colors: 3, empty: 1, tubes: [[1, 1, 3, 2], [], [3, 3, 2, 2], [1, 1, 3, 2]], par: 6 },
    { lvl: 5, colors: 3, empty: 2, tubes: [[1, 1, 3, 2], [2, 2, 2, 3], [], [], [1, 3, 3, 1]], par: 6 },
    { lvl: 6, colors: 3, empty: 2, tubes: [[1, 1, 1, 2], [], [], [1, 3, 2, 3], [2, 3, 3, 2]], par: 7 },
    { lvl: 7, colors: 3, empty: 2, tubes: [[], [2, 2, 2, 1], [], [1, 3, 1, 3], [3, 2, 1, 3]], par: 8 },

    // 8-11: 5-6 tubes, 4 colors (Complex logistics)
    { lvl: 8, colors: 4, empty: 2, tubes: [[1, 2, 4, 2], [], [3, 3, 3, 1], [4, 4, 2, 2], [1, 3, 1, 4], []], par: 9 },
    { lvl: 9, colors: 4, empty: 2, tubes: [[1, 4, 2, 4], [], [3, 3, 1, 2], [], [1, 4, 4, 1], [2, 3, 2, 3]], par: 12 },
    { lvl: 10, colors: 4, empty: 2, tubes: [[1, 3, 4, 2], [], [], [4, 2, 4, 2], [1, 1, 3, 2], [1, 3, 4, 3]], par: 13 },
    { lvl: 11, colors: 4, empty: 2, tubes: [[1, 4, 1, 2], [], [3, 2, 1, 2], [4, 3, 3, 2], [], [4, 3, 1, 4]], par: 13 },

    // 12-15: 6-7 tubes, 5 colors with 2 empty buffer tubes (Master chemist!)
    { lvl: 12, colors: 5, empty: 2, tubes: [[1, 1, 2, 3], [], [3, 3, 3, 5], [4, 4, 2, 5], [], [1, 4, 5, 2], [4, 1, 2, 5]], par: 13 },
    { lvl: 13, colors: 5, empty: 2, tubes: [[1, 5, 3, 4], [2, 2, 2, 1], [], [], [5, 5, 5, 3], [2, 4, 3, 4], [1, 3, 1, 4]], par: 13 },
    { lvl: 14, colors: 5, empty: 2, tubes: [[1, 1, 5, 1], [], [3, 3, 3, 4], [4, 4, 2, 5], [], [3, 2, 5, 2], [1, 4, 2, 5]], par: 13 },
    { lvl: 15, colors: 5, empty: 2, tubes: [[], [2, 3, 1, 5], [3, 3, 1, 5], [4, 4, 3, 2], [], [1, 2, 4, 5], [1, 4, 2, 5]], par: 14 }
  ],

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);

    // Mini lab wooden stand
    g.line(x + 3, y + 26, x + 28, y + 26, 2);
    g.line(x + 3, y + 27, x + 28, y + 27, 1);

    // Left tube (filled with phosphor fluid)
    g.rect(x + 7, y + 10, 6, 16, 2);
    g.rect(x + 8, y + 15, 4, 10, 3); // phosphor fluid
    g.line(x + 8, y + 15, x + 11, y + 15, 0); // meniscus
    g.line(x + 6, y + 9, x + 13, y + 9, 3); // rim
    g.px(x + 9, y + 18, 0); // bubble

    // Right tube (tilted, pouring droplet)
    g.line(x + 18, y + 8, x + 24, y + 18, 3);
    g.line(x + 21, y + 6, x + 27, y + 16, 2);
    g.px(x + 16, y + 11, 3); // droplet pouring
    g.px(x + 15, y + 15, 3); // falling droplet
    g.px(x + 11, y + 14, 3); // splash
  },

  init() {
    this.lvl = 1;
    this.score = 1;
    this.moves = 0;
    this.par = 7;
    this.moveLimit = 0;
    this.movesRemaining = 0;
    this.sel = 0;
    this.selected = null;
    this.won = false;
    this.history = [];
    this.particles = [];
    this.bubbles = [];
    this.pouringAnim = null;
    this.shakeTube = null;
    this.liftY = [];
    this.meniscusRipple = [];
    this.time = 0;
    this.diffOverride = undefined;

    if (typeof SAVE !== 'undefined') {
      const per = SAVE.getPersistent(this.id);
      if (per && per.maxLvl) {
        this.maxUnlocked = per.maxLvl;
      }
    }

    this.loadLevel(this.lvl);
  },

  getDiff() {
    if (this.diffOverride !== undefined) return this.diffOverride;
    if (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) return VOS.difficulty;
    return 1; // 0 = EASY, 1 = NORMAL, 2 = HARD
  },

  getDiffName() {
    const d = this.getDiff();
    return d === 0 ? "EASY" : (d === 2 ? "HARD" : "NORM");
  },

  cycleDifficulty() {
    const cur = this.getDiff();
    this.diffOverride = (cur + 1) % 3;
    this.playClink();
    this.loadLevel(this.lvl);
  },

  makeRng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  },

  generateSolvablePuzzle(numColors, numEmpty, steps, rng) {
    const tubes = [];
    for (let c = 1; c <= numColors; c++) tubes.push([c, c, c, c]);
    for (let e = 0; e < numEmpty; e++) tubes.push([]);

    let lastFrom = -1, lastTo = -1;
    for (let s = 0; s < steps; s++) {
      const validMoves = [];
      for (let b = 0; b < tubes.length; b++) {
        if (tubes[b].length === 0) continue;
        const topColor = tubes[b][tubes[b].length - 1];
        const canTake = (tubes[b].length === 1) || (tubes[b][tubes[b].length - 2] === topColor);
        if (!canTake) continue;

        for (let a = 0; a < tubes.length; a++) {
          if (a === b) continue;
          if (tubes[a].length >= 4) continue;
          if (b === lastTo && a === lastFrom) continue;
          validMoves.push({ from: b, to: a, color: topColor });
        }
      }
      if (validMoves.length === 0) break;
      const move = validMoves[Math.floor(rng() * validMoves.length)];
      tubes[move.to].push(tubes[move.from].pop());
      lastFrom = move.from;
      lastTo = move.to;
    }
    return tubes;
  },

  loadLevel(l) {
    this.lvl = l;
    this.moves = 0;
    this.history = [];
    this.won = false;
    this.selected = null;
    this.pouringAnim = null;
    this.shakeTube = null;

    const diff = this.getDiff();

    if (l <= this.LEVELS.length) {
      const preset = this.LEVELS[l - 1];
      this.tubes = preset.tubes.map(t => [...t]);
      this.par = preset.par;
    } else {
      // Infinite procedural solvable generation for levels 16+
      const numColors = Math.min(5, 3 + (l % 3));
      const numEmpty = 2;
      const steps = 40 + (l % 20) * 2;
      const rng = this.makeRng(l * 83917 + 104729);
      this.tubes = this.generateSolvablePuzzle(numColors, numEmpty, steps, rng);
      this.par = Math.max(8, Math.min(18, Math.floor(steps / 4)));
    }

    // EASY difficulty modifier: +1 extra empty buffer tube
    if (diff === 0) {
      this.tubes.push([]);
    }

    // HARD difficulty challenge: strict move limit
    if (diff === 2) {
      this.moveLimit = Math.max(this.par + 4, Math.floor(this.par * 1.35));
      this.movesRemaining = this.moveLimit;
    } else {
      this.moveLimit = 0;
      this.movesRemaining = 0;
    }

    const n = this.tubes.length;
    this.sel = Math.min(this.sel, n - 1);
    this.liftY = new Array(n).fill(0);
    this.meniscusRipple = new Array(n).fill(0);

    // Initialize rising micro bubbles
    this.bubbles = [];
    for (let i = 0; i < n; i++) {
      if (this.tubes[i].length > 0) {
        for (let b = 0; b < 3; b++) {
          this.bubbles.push({
            tube: i,
            relX: 4 + Math.random() * 8,
            relY: Math.random() * (this.tubes[i].length * 14 + 6),
            speed: 12 + Math.random() * 10
          });
        }
      }
    }
  },

  // Audio Synthesis
  playClink() {
    if (typeof APU !== 'undefined') {
      APU.softTone(1760, 0.05, 'sine', 0.08, 0, 0.002, 3500);
      APU.softTone(2637, 0.03, 'sine', 0.05, 0.01, 0.002, 4000);
    }
  },

  playGurgle(fillProgress) {
    if (typeof APU !== 'undefined') {
      const f = 320 + fillProgress * 65 + (Math.random() * 24 - 12);
      APU.softTone(f, 0.065, 'sine', 0.08, 0, 0.004, 1800);
    }
  },

  playCorkPop() {
    if (typeof APU !== 'undefined') {
      APU.softTone(240, 0.03, 'triangle', 0.12, 0, 0.002, 1200);
      APU.softTone(780, 0.07, 'sine', 0.09, 0.02, 0.003, 2400);
      if (APU.noise) APU.noise(0.03, 0.05, 1200, 'bandpass');
    }
  },

  playWinFanfare() {
    if (typeof APU !== 'undefined') {
      APU.sfx('LEVELUP');
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        APU.softTone(freq, 0.24, 'sine', 0.08, idx * 0.08, 0.01, 2400);
      });
    }
  },

  playDeny() {
    if (typeof APU !== 'undefined') APU.sfx('DENY');
  },

  playTick() {
    if (typeof APU !== 'undefined') APU.sfx('TICK');
  },

  burstParticles(x, y, count = 12, color = 3) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 20 + Math.random() * 55;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 15,
        color: Math.random() < 0.6 ? color : 2,
        life: 0.35 + Math.random() * 0.4
      });
    }
  },

  isTubeComplete(tube) {
    return tube.length === 4 && tube.every(c => c === tube[0]);
  },

  checkWin() {
    return this.tubes.every(t => t.length === 0 || this.isTubeComplete(t));
  },

  getLayout(numTubes) {
    let tw = 22;
    let gap = 12;
    if (numTubes <= 3) { tw = 26; gap = 24; }
    else if (numTubes === 4) { tw = 24; gap = 18; }
    else if (numTubes === 5) { tw = 24; gap = 14; }
    else if (numTubes === 6) { tw = 22; gap = 12; }
    else if (numTubes === 7) { tw = 20; gap = 10; }
    else if (numTubes >= 8) { tw = 18; gap = 8; }

    const totalW = numTubes * tw + (numTubes - 1) * gap;
    const startX = Math.floor((256 - totalW) / 2);
    const baseY = 98;
    const tubeH = 74;

    return { tw, gap, startX, baseY, tubeH };
  },

  getTubePos(idx) {
    const layout = this.getLayout(this.tubes.length);
    const x = layout.startX + idx * (layout.tw + layout.gap);
    const y = layout.baseY;
    return { x, y, tw: layout.tw, th: layout.tubeH };
  },

  doPourAction() {
    if (this.pouringAnim) return; // Input lock during animation

    if (this.moveLimit > 0 && this.movesRemaining <= 0) {
      this.playDeny();
      return;
    }

    if (this.selected === null) {
      const tube = this.tubes[this.sel];
      if (tube.length === 0 || this.isTubeComplete(tube)) {
        this.playDeny();
        return;
      }
      this.selected = this.sel;
      this.playClink();
    } else {
      if (this.selected === this.sel) {
        this.selected = null;
        this.playClink();
        return;
      }

      const srcIdx = this.selected;
      const dstIdx = this.sel;
      const src = this.tubes[srcIdx];
      const dst = this.tubes[dstIdx];

      if (src.length === 0 || dst.length >= 4) {
        this.shakeTube = { idx: srcIdx, timer: 0.18 };
        this.playDeny();
        this.selected = null;
        return;
      }

      const topColor = src[src.length - 1];
      if (dst.length > 0 && dst[dst.length - 1] !== topColor) {
        this.shakeTube = { idx: srcIdx, timer: 0.18 };
        this.playDeny();
        this.selected = null;
        return;
      }

      // Valid move! Count contiguous units
      let pourUnits = 0;
      for (let k = src.length - 1; k >= 0; k--) {
        if (src[k] === topColor) pourUnits++;
        else break;
      }
      pourUnits = Math.min(pourUnits, 4 - dst.length);

      // Deep undo stack
      this.history.push({
        tubes: this.tubes.map(t => [...t]),
        moves: this.moves
      });

      this.moves++;
      if (this.moveLimit > 0) {
        this.movesRemaining = Math.max(0, this.moveLimit - this.moves);
      }

      // Initiate Pouring Animation State Machine
      const duration = 0.65 + pourUnits * 0.12;
      this.pouringAnim = {
        src: srcIdx,
        dst: dstIdx,
        color: topColor,
        pourCount: pourUnits,
        srcStartLen: src.length,
        dstStartLen: dst.length,
        timer: 0,
        duration: duration,
        audioTimer: 0
      };
      this.selected = null;
    }
  },

  doUndo() {
    if (this.pouringAnim) return;
    if (this.selected !== null) {
      this.selected = null;
      this.playClink();
      return;
    }
    if (this.history.length === 0) {
      this.playDeny();
      return;
    }
    const state = this.history.pop();
    this.tubes = state.tubes.map(t => [...t]);
    this.moves = state.moves;
    if (this.moveLimit > 0) {
      this.movesRemaining = Math.max(0, this.moveLimit - this.moves);
    }
    this.won = false;
    if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
    this.burstParticles(128, 120, 8, 2);
  },

  update(dt) {
    this.time += dt;

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 70 * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Update tube lifting interpolation
    const n = this.tubes.length;
    for (let i = 0; i < n; i++) {
      const targetLift = (this.selected === i && !this.pouringAnim) ? 18 : 0;
      this.liftY[i] += (targetLift - this.liftY[i]) * Math.min(1.0, 18 * dt);

      if (this.meniscusRipple[i] !== 0) {
        this.meniscusRipple[i] *= Math.max(0, 1 - 6 * dt);
        if (Math.abs(this.meniscusRipple[i]) < 0.05) this.meniscusRipple[i] = 0;
      }
    }

    // Update rising micro-bubbles
    for (let b of this.bubbles) {
      const tubeLen = this.tubes[b.tube] ? this.tubes[b.tube].length : 0;
      if (tubeLen > 0) {
        b.relY -= b.speed * dt;
        const maxSurface = tubeLen * 14;
        if (b.relY <= 0 || b.relY > maxSurface + 8) {
          b.relY = maxSurface;
          b.relX = 4 + Math.random() * 8;
        }
      }
    }

    // Update shake
    if (this.shakeTube) {
      this.shakeTube.timer -= dt;
      if (this.shakeTube.timer <= 0) this.shakeTube = null;
    }

    // Handle Active Pouring Animation State Machine
    if (this.pouringAnim) {
      const a = this.pouringAnim;
      a.timer += dt;
      const p = Math.min(1.0, a.timer / a.duration);

      if (p >= 0.20 && p <= 0.80) {
        const streamProgress = (p - 0.20) / 0.60;
        a.audioTimer -= dt;
        if (a.audioTimer <= 0) {
          a.audioTimer = 0.075;
          const currentFill = a.dstStartLen + streamProgress * a.pourCount;
          this.playGurgle(currentFill);
        }

        // Oscillate destination meniscus wave
        this.meniscusRipple[a.dst] = Math.sin(a.timer * 35) * 2.5;

        // Splashes at destination fluid surface
        const dstPos = this.getTubePos(a.dst);
        const dstSurfaceY = (dstPos.y + dstPos.th - 6) - (a.dstStartLen + streamProgress * a.pourCount) * 14;
        if (Math.random() < 0.45) {
          this.particles.push({
            x: dstPos.x + dstPos.tw / 2 + (Math.random() * 4 - 2),
            y: dstSurfaceY,
            vx: (Math.random() - 0.5) * 25,
            vy: -15 - Math.random() * 20,
            color: a.color === 1 ? 3 : 2,
            life: 0.18 + Math.random() * 0.15
          });
        }
      }

      if (p >= 1.0) {
        // Finalize state transfer
        for (let k = 0; k < a.pourCount; k++) {
          this.tubes[a.dst].push(this.tubes[a.src].pop());
        }

        // Cork pop if tube completed
        if (this.isTubeComplete(this.tubes[a.dst])) {
          this.playCorkPop();
          const dPos = this.getTubePos(a.dst);
          this.burstParticles(dPos.x + dPos.tw / 2, dPos.y, 14);
        }

        // Check level win
        if (this.checkWin()) {
          this.won = true;
          this.score = this.lvl;
          this.playWinFanfare();
          this.burstParticles(128, 110, 32);
          if (typeof SAVE !== 'undefined') {
            SAVE.setScore(this.id, this.lvl);
            const per = SAVE.getPersistent(this.id) || { maxLvl: 1 };
            per.maxLvl = Math.max(per.maxLvl || 1, this.lvl + 1);
            SAVE.setPersistent(this.id, per);
            SAVE.commit();
          }
        }

        this.pouringAnim = null;
      }
      return; // Input locked during active pour
    }

    // Win Modal Input
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('start')) {
        this.lvl++;
        this.loadLevel(this.lvl);
      }
      if (PAD.tapPos) {
        if (PAD.tapPos.y >= 135 && PAD.tapPos.y <= 165 && PAD.tapPos.x >= 60 && PAD.tapPos.x <= 196) {
          this.lvl++;
          this.loadLevel(this.lvl);
        }
      }
      return;
    }

    // Gamepad Navigation
    const numTubes = this.tubes.length;
    if (PAD.hit('left')) {
      this.sel = (this.sel - 1 + numTubes) % numTubes;
      this.playTick();
    }
    if (PAD.hit('right')) {
      this.sel = (this.sel + 1) % numTubes;
      this.playTick();
    }
    if (PAD.hit('a')) {
      this.doPourAction();
    }
    if (PAD.hit('b')) {
      this.doUndo();
    }
    if (PAD.hit('select')) {
      this.playClink();
      this.loadLevel(this.lvl);
    }

    // Direct Touch & On-Screen Button Taps
    if (PAD.tapPos) {
      const tx = PAD.tapPos.x;
      const ty = PAD.tapPos.y;

      // Bottom control buttons: y: 212 to 238
      if (ty >= 212 && ty <= 238) {
        if (tx >= 10 && tx <= 64) {
          this.doUndo();
          return;
        } else if (tx >= 68 && tx <= 128) {
          this.playClink();
          this.loadLevel(this.lvl);
          return;
        } else if (tx >= 130 && tx <= 194) {
          this.cycleDifficulty();
          return;
        } else if (tx >= 196 && tx <= 248) {
          if (this.won) {
            this.lvl++;
            this.loadLevel(this.lvl);
          } else {
            this.doPourAction();
          }
          return;
        }
      }

      // Direct Tube Taps
      for (let i = 0; i < numTubes; i++) {
        const p = this.getTubePos(i);
        if (tx >= p.x - 4 && tx <= p.x + p.tw + 4 && ty >= p.y - 25 && ty <= p.y + p.th + 15) {
          this.sel = i;
          this.doPourAction();
          break;
        }
      }
    }
  },

  // --------------------------------------------------------------------------
  // RENDERING PIPELINE
  // --------------------------------------------------------------------------
  drawFluidBlock(g, fx, fy, fw, fh, colorType, isTopUnit) {
    if (fw <= 0 || fh <= 0) return;

    if (colorType === 1) {
      // Type 1: Solid bright Phosphor with central diamond core
      g.rect(fx, fy, fw, fh, 3);
      g.line(fx + 1, fy + 1, fx + 1, fy + fh - 2, 0); // dark accent
      if (fw > 10 && fh > 8) {
        g.px(fx + Math.floor(fw / 2), fy + Math.floor(fh / 2), 0);
      }
      if (isTopUnit) g.line(fx, fy, fx + fw - 1, fy, 3);
    } else if (colorType === 2) {
      // Type 2: Solid mid Emerald with bright sheen & shadow
      g.rect(fx, fy, fw, fh, 2);
      g.line(fx + 1, fy + 1, fx + 1, fy + fh - 2, 3);
      g.line(fx, fy + fh - 1, fx + fw - 1, fy + fh - 1, 1);
      if (isTopUnit) g.line(fx, fy, fx + fw - 1, fy, 3);
    } else if (colorType === 3) {
      // Type 3: Amber Dither / Checkerboard
      g.dither(fx, fy, fw, fh, 1, 3);
      g.line(fx + 1, fy + 1, fx + 1, fy + fh - 2, 3);
      if (isTopUnit) g.line(fx, fy, fx + fw - 1, fy, 3);
    } else if (colorType === 4) {
      // Type 4: Deep Obsidian with horizontal ribs
      g.rect(fx, fy, fw, fh, 1);
      for (let ly = fy; ly < fy + fh; ly++) {
        if (ly % 2 === 0) g.line(fx, ly, fx + fw - 1, ly, 2);
      }
      if (isTopUnit) g.line(fx, fy, fx + fw - 1, fy, 2);
    } else {
      // Type 5: Diagonal Ribbon / Stripes
      g.rect(fx, fy, fw, fh, 1);
      for (let dy = 0; dy < fh; dy++) {
        const ly = fy + dy;
        for (let dx = (dy % 3); dx < fw; dx += 3) {
          g.px(fx + dx, ly, 3);
        }
      }
      if (isTopUnit) g.line(fx, fy, fx + fw - 1, fy, 3);
    }
  },

  drawTube(g, idx, tx, ty, tw, th) {
    const tube = this.tubes[idx];
    const isPouringSrc = this.pouringAnim && this.pouringAnim.src === idx;
    const isPouringDst = this.pouringAnim && this.pouringAnim.dst === idx;

    if (isPouringSrc) {
      // Handled by dynamic tilted tube renderer in drawTiltedTube
      return;
    }

    const ix = tx + 2;
    const iw = tw - 4;
    const botY = ty + th - 6;

    // Calculate effective fluid units
    let effectiveUnits = tube.length;
    let transferColor = 0;
    if (isPouringDst) {
      const p = Math.min(1.0, this.pouringAnim.timer / this.pouringAnim.duration);
      const streamProg = Math.max(0, Math.min(1.0, (p - 0.20) / 0.60));
      effectiveUnits = this.pouringAnim.dstStartLen + streamProg * this.pouringAnim.pourCount;
      transferColor = this.pouringAnim.color;
    }

    const fullUnits = Math.floor(effectiveUnits);
    const fracUnit = effectiveUnits - fullUnits;

    // 1. Draw Liquid Units
    for (let j = 0; j < fullUnits; j++) {
      const c = (j < tube.length) ? tube[j] : transferColor;
      const uyBot = botY - j * 14;
      const uyTop = uyBot - 14;
      const isTop = (j === fullUnits - 1 && fracUnit === 0);

      this.drawFluidBlock(g, ix, uyTop, iw, 14, c, isTop);

      // Bottom U-bowl fill on layer 0
      if (j === 0) {
        const col = c === 1 ? 3 : (c === 2 ? 2 : (c === 3 ? 3 : (c === 4 ? 1 : 2)));
        g.line(tx + 1, botY, tx + tw - 2, botY, col);
        g.line(tx + 1, botY + 1, tx + tw - 2, botY + 1, col);
        g.line(tx + 2, botY + 2, tx + tw - 3, botY + 2, col);
        g.line(tx + 3, botY + 3, tx + tw - 4, botY + 3, col);
        g.line(tx + 4, botY + 4, tx + tw - 5, botY + 4, col);
      }
    }

    // Fractional rising unit if filling
    if (fracUnit > 0) {
      const j = fullUnits;
      const uyBot = botY - j * 14;
      const fracH = Math.max(1, Math.round(fracUnit * 14));
      const uyTop = uyBot - fracH;

      this.drawFluidBlock(g, ix, uyTop, iw, fracH, transferColor, true);

      if (j === 0) {
        const col = transferColor === 1 ? 3 : (transferColor === 2 ? 2 : 3);
        g.line(tx + 1, botY, tx + tw - 2, botY, col);
        g.line(tx + 2, botY + 2, tx + tw - 3, botY + 2, col);
      }
    }

    // 2. Surface Meniscus & Wave Oscillation
    if (effectiveUnits > 0) {
      const topY = botY - Math.round(effectiveUnits * 14);
      const rip = Math.round(this.meniscusRipple[idx] || 0);
      g.line(ix, topY + rip, ix + iw - 1, topY + rip, 3);
      if (iw > 8) {
        g.px(ix + Math.floor(iw / 2), topY + rip + 1, 3);
      }
    }

    // 3. Micro-Bubbles
    for (let b of this.bubbles) {
      if (b.tube === idx && effectiveUnits > 0) {
        const by = botY - b.relY;
        const topY = botY - effectiveUnits * 14;
        if (by > topY && by < botY + 4) {
          g.px(tx + Math.round(b.relX), Math.round(by), 3);
        }
      }
    }

    // 4. Glass Tube Body & Rounded U-Bottom
    g.line(tx, ty + 2, tx, botY, 2); // Left wall
    g.line(tx + tw - 1, ty + 2, tx + tw - 1, botY, 2); // Right wall

    // Rounded U-bottom glass curve
    g.px(tx + 1, botY + 1, 2);
    g.px(tx + tw - 2, botY + 1, 2);
    g.line(tx + 2, botY + 2, tx + 2, botY + 3, 2);
    g.line(tx + tw - 3, botY + 2, tx + tw - 3, botY + 3, 2);
    g.line(tx + 3, botY + 4, tx + tw - 4, botY + 4, 2);
    g.line(tx + 4, botY + 5, tx + tw - 5, botY + 5, 3); // bottom curve highlight

    // Glass specular vertical reflection
    for (let sy = ty + 4; sy < botY - 4; sy += 3) {
      g.px(tx + 1, sy, 3);
    }

    // Top Rim Collar (Mouth)
    g.rect(tx - 2, ty, tw + 4, 2, 2);
    g.line(tx - 2, ty, tx + tw + 1, ty, 3);
    g.line(tx - 2, ty + 1, tx + tw + 1, ty + 1, 1);
    g.line(tx + 1, ty + 1, tx + tw - 2, ty + 1, 0); // open mouth aperture

    // Graduation volume tick marks
    [1, 2, 3, 4].forEach(vol => {
      const tickY = botY - vol * 14;
      g.line(tx + tw - 3, tickY, tx + tw - 1, tickY, 1);
    });

    // 5. Sealed Cork Plug (Completed single-color tube)
    if (this.isTubeComplete(tube)) {
      // Cork entering neck
      g.rect(tx + 1, ty - 1, tw - 2, 6, 2);
      g.box(tx + 1, ty - 1, tw - 2, 6, 1);

      // Cork cap
      g.rect(tx - 1, ty - 6, tw + 2, 5, 2);
      g.box(tx - 1, ty - 6, tw + 2, 5, 3);
      g.line(tx, ty - 6, tx + tw - 1, ty - 6, 3);

      // Solved star glyph
      g.text("★", tx + Math.floor(tw / 2) - 2, ty - 14, 3);
    }
  },

  drawTiltedTube(g, a) {
    const p = Math.min(1.0, a.timer / a.duration);
    const srcPos = this.getTubePos(a.src);
    const dstPos = this.getTubePos(a.dst);
    const tw = srcPos.tw;
    const th = srcPos.th;

    const pouringRight = dstPos.x > srcPos.x;
    const maxAngle = (pouringRight ? 65 : -65) * (Math.PI / 180);

    const targetX = pouringRight ? (dstPos.x - 6) : (dstPos.x + dstPos.tw + 6);
    const targetY = dstPos.y - 24;
    const startX = srcPos.x;
    const startY = srcPos.y - 18;

    let ang = 0;
    let curX = startX;
    let curY = startY;

    if (p < 0.20) {
      const s = (1 - Math.cos((p / 0.20) * Math.PI)) / 2;
      ang = s * maxAngle;
      curX = startX + s * (targetX - startX);
      curY = startY + s * (targetY - startY);
    } else if (p < 0.80) {
      ang = maxAngle;
      curX = targetX;
      curY = targetY;
    } else {
      const s = (1 - Math.cos(((p - 0.80) / 0.20) * Math.PI)) / 2;
      ang = (1 - s) * maxAngle;
      curX = targetX + s * (startX - targetX);
      curY = targetY + s * (startY - targetY);
    }

    const cosA = Math.cos(ang);
    const sinA = Math.sin(ang);
    const rot = (lx, ly) => ({
      x: Math.round(curX + lx * cosA - ly * sinA),
      y: Math.round(curY + lx * sinA + ly * cosA)
    });

    // Fluid drain progress
    const streamProg = Math.max(0, Math.min(1.0, (p - 0.20) / 0.60));
    const remUnits = Math.max(0, a.srcStartLen - streamProg * a.pourCount);
    const fullRem = Math.floor(remUnits);
    const fracRem = remUnits - fullRem;

    // Draw remaining liquid layers inside tilted tube
    for (let k = 0; k < Math.ceil(remUnits); k++) {
      const uBot = (th - 6) - k * 14;
      let uTop = uBot - 14;
      if (k === fullRem && fracRem > 0) {
        uTop = uBot - Math.round(fracRem * 14);
      }

      const p1 = rot(-tw / 2 + 2, uBot);
      const p2 = rot(tw / 2 - 2, uBot);
      const p3 = rot(tw / 2 - 2, uTop);
      const p4 = rot(-tw / 2 + 2, uTop);

      const col = (k < this.tubes[a.src].length) ? this.tubes[a.src][k] : a.color;
      const renderCol = col === 1 ? 3 : (col === 2 ? 2 : (col === 3 ? 3 : (col === 4 ? 1 : 2)));

      g.tri(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, renderCol);
      g.tri(p1.x, p1.y, p3.x, p3.y, p4.x, p4.y, renderCol);
    }

    // Draw tilted glass walls
    const w1 = rot(-tw / 2, 0);
    const w2 = rot(-tw / 2, th - 6);
    const w3 = rot(tw / 2, 0);
    const w4 = rot(tw / 2, th - 6);

    g.line(w1.x, w1.y, w2.x, w2.y, 2);
    g.line(w3.x, w3.y, w4.x, w4.y, 2);
    g.line(w2.x, w2.y, w4.x, w4.y, 2); // bottom curve
    g.line(w1.x, w1.y, w3.x, w3.y, 3); // mouth lip

    // Spout coordinate for fluid stream
    const spout = pouringRight ? w3 : w1;

    // Draw physical fluid stream arc
    if (p >= 0.20 && p <= 0.80) {
      const dstMouthX = dstPos.x + Math.floor(dstPos.tw / 2);
      const dstMouthY = dstPos.y + 2;
      const dstSurfaceY = (dstPos.y + dstPos.th - 6) - Math.round((a.dstStartLen + streamProg * a.pourCount) * 14);

      const ctrlX = Math.round((spout.x + dstMouthX) / 2);
      const ctrlY = Math.min(spout.y, dstMouthY) - 8;

      const streamCol = a.color === 1 ? 3 : (a.color === 2 ? 2 : (a.color === 3 ? 3 : 2));

      let prevX = spout.x;
      let prevY = spout.y;
      for (let s = 0.1; s <= 1.0; s += 0.1) {
        const qx = Math.round((1 - s) * (1 - s) * spout.x + 2 * (1 - s) * s * ctrlX + s * s * dstMouthX);
        const qy = Math.round((1 - s) * (1 - s) * spout.y + 2 * (1 - s) * s * ctrlY + s * s * dstMouthY);
        g.line(prevX, prevY, qx, qy, streamCol);
        g.line(prevX + 1, prevY, qx + 1, qy, 3);
        prevX = qx;
        prevY = qy;
      }

      // Vertical stream into destination tube
      if (dstSurfaceY > dstMouthY) {
        g.rect(dstMouthX - 1, dstMouthY, 3, dstSurfaceY - dstMouthY, streamCol);
        g.line(dstMouthX, dstMouthY, dstMouthX, dstSurfaceY, 3);
      }
    }
  },

  renderWinModal(g) {
    g.dither(32, 60, 192, 98, 0, 1);
    g.box(32, 60, 192, 98, 3);
    g.box(34, 62, 188, 94, 2);

    g.textC("EXPERIMENT SOLVED!", 72, 3);
    g.textC("ALL CHEMICALS PURIFIED", 86, 2);

    const stars = this.moves <= this.par ? "★★★  PERFECT SCORE!" : (this.moves <= this.par + 3 ? "★★·  GREAT SOLUTION" : "★··  COMPLETED");
    g.textC(stars, 102, 3);
    g.textC("MOVES: " + this.moves + "  (PAR: " + this.par + ")", 118, 2);

    // Next button
    g.rect(70, 134, 116, 18, 2);
    g.box(70, 134, 116, 18, 3);
    g.textC("[A] NEXT EXPERIMENT ▶", 140, 3);
  },

  render(g) {
    g.clear(0);

    // 1. Header Bar
    g.text("LIQUID SORT", 10, 8, 3);
    g.text("LVL " + this.lvl, 82, 8, 2);
    g.text("[" + this.getDiffName() + "]", 120, 8, 3);
    g.text("PAR:" + this.par, 162, 8, 2);

    if (this.moveLimit > 0) {
      const warn = this.movesRemaining <= 2;
      g.textR("LEFT:" + this.movesRemaining, 246, 8, warn ? 3 : 2);
    } else {
      g.textR("MOVES:" + this.moves, 246, 8, 3);
    }

    g.line(10, 20, 246, 20, 1);

    // Subtitle indicator
    if (this.moveLimit > 0 && this.movesRemaining <= 0 && !this.won) {
      g.textC("OUT OF MOVES! [B] UNDO OR [RESET]", 24, 3);
    } else {
      g.textC("TAP TUBE TO LIFT · TAP TARGET TO POUR", 24, 1);
    }

    // 2. Laboratory Wooden Rack & Bench
    const numTubes = this.tubes.length;
    const layout = this.getLayout(numTubes);
    const rackY = layout.baseY + layout.tubeH;

    g.rect(12, rackY, 232, 4, 2);
    g.line(12, rackY, 243, rackY, 3);
    g.line(12, rackY + 3, 243, rackY + 3, 1);
    g.rect(16, rackY + 4, 6, 8, 2);
    g.rect(234, rackY + 4, 6, 8, 2);

    // 3. Render Test Tubes
    for (let i = 0; i < numTubes; i++) {
      const p = this.getTubePos(i);
      let ty = p.y - Math.round(this.liftY[i]);

      // Shake animation
      let tx = p.x;
      if (this.shakeTube && this.shakeTube.idx === i) {
        tx += Math.round(Math.sin(this.shakeTube.timer * 60) * 3);
      }

      // Wooden holding socket
      g.line(tx - 1, rackY, tx + p.tw, rackY, 1);
      g.line(tx, rackY + 1, tx + p.tw - 1, rackY + 1, 0);

      this.drawTube(g, i, tx, ty, p.tw, p.th);

      // Tube index & cursor arrow
      const cx = tx + Math.floor(p.tw / 2) - 2;
      if (i === this.sel) {
        const arrow = (this.selected === i) ? "▼" : "▲";
        g.text(arrow, cx, rackY + 8, 3);
      } else {
        g.text(String(i + 1), cx, rackY + 8, 1);
      }
    }

    // 4. Render Active Pouring Source Tube (tilted vector quad)
    if (this.pouringAnim) {
      this.drawTiltedTube(g, this.pouringAnim);
    }

    // 5. Render Flying Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.x >= 0 && p.x < 256 && p.y >= 0 && p.y < 240) {
        g.px(p.x, p.y, p.color);
      }
    }

    // 6. Bottom Tactile Control Buttons
    const canUndo = this.history.length > 0;
    // [B] UNDO
    g.rect(10, 216, 54, 18, 1);
    g.box(10, 216, 54, 18, canUndo ? 3 : 2);
    g.text("[B] UNDO", 15, 222, canUndo ? 3 : 1);

    // [SEL] RETRY
    g.rect(68, 216, 58, 18, 1);
    g.box(68, 216, 58, 18, 2);
    g.text("[SEL] RESET", 72, 222, 2);

    // [DIFF]
    g.rect(130, 216, 62, 18, 1);
    g.box(130, 216, 62, 18, 2);
    g.text("[" + this.getDiffName() + "]", 142, 222, 3);

    // [NEXT] / [A] POUR
    g.rect(196, 216, 50, 18, this.won ? 2 : 1);
    g.box(196, 216, 50, 18, this.won ? 3 : 2);
    g.text(this.won ? "[NEXT] ▶" : "[A] POUR", 200, 222, this.won ? 3 : 2);

    // 7. Victory Modal
    if (this.won) {
      this.renderWinModal(g);
    }
  }
};
