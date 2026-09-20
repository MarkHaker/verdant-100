// js/cartridges/cart_019_tower_hanoi.js
// ============================================================================
// Cartridge #019: TOWER HANOI
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 19. TOWER OF HANOI
CARTS[19] = {
  id: 19,
  name: "TOWER HANOI",
  genre: 1,
  scoreLabel: "SOLVED",
  desc: "MOVE ENTIRE DISK STACK TO RIGHT PEG. NEVER PLACE LARGER ON SMALLER! [B] UNDO, AUTO-SOLVE.",

  pow3: [1, 3, 9, 27, 81, 243, 729, 2187],
  pegX: [52, 128, 204],

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Outer bevel
    g.line(x, y, x + 31, y, 3);
    g.line(x, y, x, y + 31, 3);
    g.line(x + 31, y, x + 31, y + 31, 1);
    g.line(x, y + 31, x + 31, y + 31, 1);

    // Turned wooden base
    g.rect(x + 2, y + 24, 28, 5, 2);
    g.line(x + 2, y + 24, x + 29, y + 24, 3);
    g.line(x + 2, y + 28, x + 29, y + 28, 0);

    // 3 Spindles with brass caps
    [x + 7, x + 16, x + 25].forEach(px => {
      g.line(px, y + 9, px, y + 24, 2);
      g.px(px - 1, y + 9, 3); // brass tip
      g.px(px, y + 8, 3);
    });

    // Graduated disks on left peg
    g.rect(x + 3, y + 21, 9, 3, 2);
    g.line(x + 3, y + 21, x + 11, y + 21, 3);
    g.rect(x + 4, y + 18, 7, 3, 3);
    g.px(x + 7, y + 19, 0); // center bore
    g.rect(x + 5, y + 15, 5, 3, 2);
    g.line(x + 5, y + 15, x + 9, y + 15, 3);

    // Goal peg subtle marker
    g.px(x + 25, y + 25, 3);
  },

  init() {
    this.pegX = [52, 128, 204];
    if (!this.diskCount) this.diskCount = 4;
    this.resetGame();
  },

  load(savedPer) {
    if (savedPer && savedPer.lastDisks >= 3 && savedPer.lastDisks <= 7) {
      this.diskCount = savedPer.lastDisks;
      this.resetGame();
    }
  },

  save() {
    const per = (typeof SAVE !== 'undefined' ? SAVE.getPersistent(this.id) : null) || {};
    per.lastDisks = this.diskCount;
    return per;
  },

  resetGame() {
    const stack = [];
    for (let d = this.diskCount; d >= 1; d--) {
      stack.push(d);
    }
    this.pegs = [stack, [], []];
    this.sel = 0;
    this.heldDisk = null;
    this.isDragging = false;
    this.dragDisk = null;
    this.dragSrcPeg = 0;
    this.dragX = 0;
    this.dragY = 0;
    this.anim = null;
    this.moves = 0;
    this.won = false;
    this.history = [];
    this.particles = [];
    this.autoSolve = false;
    this.autoDelay = 0;
  },

  setDiskCount(count) {
    const c = Math.max(3, Math.min(7, count));
    if (c === this.diskCount) return;
    this.diskCount = c;
    if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
    this.resetGame();
    this.save();
  },

  getPar(n = this.diskCount) {
    return (1 << n) - 1;
  },

  getStars(moves, diskCount = this.diskCount) {
    const par = this.getPar(diskCount);
    if (moves <= par) return 3;
    const tol = Math.max(4, Math.floor(par * 0.35));
    if (moves <= par + tol) return 2;
    return 1;
  },

  getBestMoves(n = this.diskCount) {
    if (typeof SAVE === 'undefined') return 0;
    const per = SAVE.getPersistent(this.id);
    return (per && per.bestMoves && per.bestMoves[n]) || 0;
  },

  getBestStars(n = this.diskCount) {
    if (typeof SAVE === 'undefined') return 0;
    const per = SAVE.getPersistent(this.id);
    return (per && per.bestStars && per.bestStars[n]) || 0;
  },

  saveRecord() {
    if (typeof SAVE === 'undefined') return;
    const per = SAVE.getPersistent(this.id) || {};
    per.bestMoves = per.bestMoves || {};
    per.bestStars = per.bestStars || {};
    per.completed = per.completed || {};

    const stars = this.getStars(this.moves, this.diskCount);
    const prevBest = per.bestMoves[this.diskCount] || 0;
    if (prevBest === 0 || this.moves < prevBest) {
      per.bestMoves[this.diskCount] = this.moves;
    }
    const prevStars = per.bestStars[this.diskCount] || 0;
    if (stars > prevStars) {
      per.bestStars[this.diskCount] = stars;
    }
    per.completed[this.diskCount] = true;
    per.lastDisks = this.diskCount;

    SAVE.setPersistent(this.id, per);
    const completedCount = Object.keys(per.completed).length;
    SAVE.setScore(this.id, completedCount);
  },

  // Optimal BFS Solver for shortest path from ANY arbitrary Hanoi state
  getOptimalNextMove(N = this.diskCount, currentPegs = this.pegs) {
    const numStates = this.pow3[N];
    let startCode = 0;
    for (let p = 0; p < 3; p++) {
      const stack = currentPegs[p];
      for (let i = 0; i < stack.length; i++) {
        startCode += p * this.pow3[stack[i] - 1];
      }
    }
    const goalCode = numStates - 1; // All N disks on peg 2
    if (startCode === goalCode) return null;

    const dist = new Int16Array(numStates).fill(-1);
    const nextMove = new Array(numStates);
    const q = new Int32Array(numStates);
    let head = 0, tail = 0;

    dist[startCode] = 0;
    q[tail++] = startCode;

    while (head < tail) {
      const code = q[head++];
      if (code === goalCode) break;

      let top0 = 99, top1 = 99, top2 = 99;
      let temp = code;
      for (let d = 1; d <= N; d++) {
        const p = temp % 3;
        temp = Math.floor(temp / 3);
        if (p === 0 && d < top0) top0 = d;
        else if (p === 1 && d < top1) top1 = d;
        else if (p === 2 && d < top2) top2 = d;
      }
      const tops = [top0, top1, top2];

      for (let from = 0; from < 3; from++) {
        const d = tops[from];
        if (d === 99) continue;
        for (let to = 0; to < 3; to++) {
          if (from === to) continue;
          if (tops[to] > d) {
            const nextCode = code + (to - from) * this.pow3[d - 1];
            if (dist[nextCode] === -1) {
              dist[nextCode] = dist[code] + 1;
              nextMove[nextCode] = nextMove[code] || { from, to, disk: d };
              q[tail++] = nextCode;
            }
          }
        }
      }
    }
    return nextMove[goalCode] || null;
  },

  startFullMoveAnim(disk, fromPeg, toPeg, isAuto = false, isHint = false) {
    if (this.pegs[fromPeg].length === 0) return;
    const d = this.pegs[fromPeg].pop();
    const startY = 170 - (this.pegs[fromPeg].length + 1) * 10;
    const dist = Math.abs(toPeg - fromPeg);

    this.anim = {
      disk: d,
      fromPeg,
      toPeg,
      phase: 1, // 1: LIFT, 2: FLOAT, 3: DROP
      timer: 0,
      liftDur: 0.07,
      floatDur: dist === 2 ? 0.12 : 0.08,
      dropDur: 0.07,
      startX: this.pegX[fromPeg],
      startY,
      hoverY: 48,
      targetX: this.pegX[toPeg],
      targetY: 170 - (this.pegs[toPeg].length + 1) * 10,
      x: this.pegX[fromPeg],
      y: startY,
      isCounted: true,
      isAuto,
      isHint
    };
  },

  startDropAnim(disk, srcPeg, toPeg, startX, startY, isCounted) {
    const targetY = 170 - (this.pegs[toPeg].length + 1) * 10;
    this.anim = {
      disk,
      fromPeg: srcPeg,
      toPeg,
      phase: 3, // drop phase directly
      timer: 0,
      dropDur: 0.08,
      startX,
      startY,
      targetX: this.pegX[toPeg],
      targetY,
      x: startX,
      y: startY,
      isCounted,
      isAuto: false,
      isHint: false
    };
  },

  pickUpDisk(p) {
    if (this.pegs[p].length === 0) return;
    const d = this.pegs[p].pop();
    const startY = 170 - (this.pegs[p].length + 1) * 10;
    this.heldDisk = {
      disk: d,
      srcPeg: p,
      x: this.pegX[p],
      y: startY,
      startY: startY,
      targetX: this.pegX[p],
      targetY: 48,
      isLifting: true,
      liftTimer: 0,
      liftDur: 0.08,
      shakeTimer: 0
    };
    if (typeof APU !== 'undefined') APU.sfx('TICK');
  },

  dropHeldDisk(toPeg) {
    if (!this.heldDisk) return;
    const isCounted = (toPeg !== this.heldDisk.srcPeg);
    const disk = this.heldDisk.disk;
    const srcPeg = this.heldDisk.srcPeg;
    const curX = this.heldDisk.x;
    const curY = this.heldDisk.y;
    this.heldDisk = null;

    this.startDropAnim(disk, srcPeg, toPeg, curX, curY, isCounted);
  },

  handlePegTap(p) {
    if (this.heldDisk === null) {
      if (this.pegs[p].length > 0) {
        this.sel = p;
        this.pickUpDisk(p);
      } else {
        if (typeof APU !== 'undefined') APU.sfx('DENY');
      }
    } else {
      if (p === this.heldDisk.srcPeg) {
        this.dropHeldDisk(p);
      } else {
        const top = this.pegs[p][this.pegs[p].length - 1];
        if (!top || top > this.heldDisk.disk) {
          this.sel = p;
          this.dropHeldDisk(p);
        } else {
          if (typeof APU !== 'undefined') APU.sfx('DENY');
          this.heldDisk.shakeTimer = 0.18;
          if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(12);
        }
      }
    }
  },

  finishDrag() {
    const p = this.dragX < 90 ? 0 : (this.dragX < 166 ? 1 : 2);
    const disk = this.dragDisk;
    const src = this.dragSrcPeg;
    const curX = this.dragX;
    const curY = this.dragY;

    this.isDragging = false;
    this.dragDisk = null;

    if (p === src) {
      this.startDropAnim(disk, src, src, curX, curY, false);
    } else {
      const top = this.pegs[p][this.pegs[p].length - 1];
      if (!top || top > disk) {
        this.sel = p;
        this.startDropAnim(disk, src, p, curX, curY, true);
      } else {
        if (typeof APU !== 'undefined') APU.sfx('DENY');
        if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(12);
        this.startDropAnim(disk, src, src, curX, curY, false);
      }
    }
  },

  toggleAutoSolve() {
    if (this.won) {
      this.resetGame();
      return;
    }
    if (this.autoSolve) {
      this.autoSolve = false;
      if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
      return;
    }
    if (this.heldDisk) {
      const d = this.heldDisk.disk;
      const p = this.heldDisk.srcPeg;
      this.heldDisk = null;
      this.pegs[p].push(d);
    }
    this.autoSolve = true;
    this.autoDelay = 0.05;
    if (typeof APU !== 'undefined') APU.sfx('UI_OK');
  },

  triggerHint() {
    if (this.won || this.anim) return;
    if (this.autoSolve) {
      this.autoSolve = false;
      return;
    }
    if (this.heldDisk) {
      const d = this.heldDisk.disk;
      const p = this.heldDisk.srcPeg;
      this.heldDisk = null;
      this.pegs[p].push(d);
    }
    const move = this.getOptimalNextMove();
    if (move) {
      this.startFullMoveAnim(move.disk, move.from, move.to, false, true);
    } else {
      if (typeof APU !== 'undefined') APU.sfx('DENY');
    }
  },

  undo() {
    if (this.autoSolve) {
      this.autoSolve = false;
    }
    if (this.anim) {
      this.pegs[this.anim.toPeg].push(this.anim.disk);
      if (this.anim.isCounted) this.moves++;
      this.anim = null;
    }
    if (this.heldDisk) {
      this.pegs[this.heldDisk.srcPeg].push(this.heldDisk.disk);
      this.heldDisk = null;
      if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
      return true;
    }
    if (this.isDragging) {
      this.pegs[this.dragSrcPeg].push(this.dragDisk);
      this.isDragging = false;
      this.dragDisk = null;
      if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
      return true;
    }
    if (!this.history || this.history.length === 0) {
      if (typeof APU !== 'undefined') APU.sfx('DENY');
      return false;
    }

    const prev = this.history.pop();
    this.pegs = [ [...prev.pegs[0]], [...prev.pegs[1]], [...prev.pegs[2]] ];
    this.moves = prev.moves;
    this.heldDisk = null;
    this.anim = null;
    this.isDragging = false;
    this.won = false;
    if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(8);
    return true;
  },

  checkWin() {
    if (this.pegs[2].length === this.diskCount && this.heldDisk === null && !this.isDragging && !this.anim) {
      this.won = true;
      this.autoSolve = false;
      if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
      this.spawnWinParticles();
      this.saveRecord();
      return true;
    }
    return false;
  },

  spawnWinParticles() {
    this.particles = [];
    const cx = this.pegX[2];
    const cy = 120;
    for (let i = 0; i < 45; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 85;
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 20,
        y: cy + (Math.random() - 0.5) * 20,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 35,
        life: 0.8 + Math.random() * 0.7,
        c: Math.random() < 0.65 ? 3 : 2
      });
    }
  },

  updateAnim(dt) {
    const anim = this.anim;
    if (!anim) return;

    if (anim.phase === 1) { // LIFT
      anim.timer += dt;
      const p = Math.min(1, anim.timer / anim.liftDur);
      const ease = 1 - (1 - p) * (1 - p);
      anim.x = anim.startX;
      anim.y = anim.startY + (anim.hoverY - anim.startY) * ease;
      if (p >= 1) {
        anim.phase = 2;
        anim.timer = 0;
      }
    } else if (anim.phase === 2) { // FLOAT
      anim.timer += dt;
      const p = Math.min(1, anim.timer / anim.floatDur);
      const ease = 0.5 - 0.5 * Math.cos(p * Math.PI);
      anim.x = anim.startX + (anim.targetX - anim.startX) * ease;
      anim.y = anim.hoverY;
      if (p >= 1) {
        anim.phase = 3;
        anim.timer = 0;
        anim.startX = anim.targetX;
        anim.startY = anim.hoverY;
        anim.targetY = 170 - (this.pegs[anim.toPeg].length + 1) * 10;
      }
    } else if (anim.phase === 3) { // DROP
      anim.timer += dt;
      const p = Math.min(1, anim.timer / anim.dropDur);
      const ease = p * p;
      anim.x = anim.targetX;
      anim.y = anim.startY + (anim.targetY - anim.startY) * ease;
      if (p >= 1) {
        if (anim.isCounted) {
          if (this.history.length >= 200) this.history.shift();
          const snap = [ [...this.pegs[0]], [...this.pegs[1]], [...this.pegs[2]] ];
          snap[anim.fromPeg].push(anim.disk);
          this.history.push({ pegs: snap, moves: this.moves });

          this.pegs[anim.toPeg].push(anim.disk);
          this.moves++;
          if (typeof APU !== 'undefined') APU.sfx('HIT');
          if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(6);
        } else {
          this.pegs[anim.toPeg].push(anim.disk);
          if (typeof APU !== 'undefined') APU.sfx('TICK');
        }

        const wasAuto = anim.isAuto;
        this.anim = null;

        if (this.checkWin()) {
          this.autoSolve = false;
        } else if (wasAuto && this.autoSolve) {
          this.autoDelay = 0.06;
        }
      }
    }
  },

  update(dt) {
    // 1. Particle physics
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 75 * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // 2. Active animation update
    if (this.anim) {
      this.updateAnim(dt);
      return;
    }

    // 3. Auto-solve pacing
    if (this.autoSolve && !this.won) {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || PAD.hit('select') ||
          PAD.hit('left') || PAD.hit('right') || PAD.hit('up') || PAD.hit('down')) {
        this.autoSolve = false;
        if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
        return;
      }
      if (this.autoDelay > 0) {
        this.autoDelay -= dt;
        return;
      }
      const nextMove = this.getOptimalNextMove();
      if (nextMove) {
        this.startFullMoveAnim(nextMove.disk, nextMove.from, nextMove.to, true, false);
      } else {
        this.autoSolve = false;
      }
      return;
    }

    // 4. Win modal handling
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('start')) {
        this.resetGame();
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        return;
      }
      if (PAD.hit('right') || PAD.hit('select')) {
        if (this.diskCount < 7) {
          this.setDiskCount(this.diskCount + 1);
        } else {
          this.resetGame();
        }
        return;
      }
      if (PAD.hit('b')) {
        this.undo();
        return;
      }
      if (PAD.tapPos) {
        const tx = PAD.tapPos.x, ty = PAD.tapPos.y;
        if (tx >= 134 && tx <= 222 && ty >= 132 && ty <= 156 && this.diskCount < 7) {
          this.setDiskCount(this.diskCount + 1);
        } else {
          this.resetGame();
        }
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        return;
      }
      return;
    }

    // 5. Held disk smoothing & lift animation
    if (this.heldDisk) {
      if (this.heldDisk.isLifting) {
        this.heldDisk.liftTimer += dt;
        const p = Math.min(1, this.heldDisk.liftTimer / this.heldDisk.liftDur);
        const ease = 1 - (1 - p) * (1 - p);
        this.heldDisk.y = this.heldDisk.startY + (48 - this.heldDisk.startY) * ease;
        if (p >= 1) {
          this.heldDisk.isLifting = false;
          this.heldDisk.y = 48;
        }
      } else {
        this.heldDisk.targetX = this.pegX[this.sel];
        this.heldDisk.x += (this.heldDisk.targetX - this.heldDisk.x) * Math.min(1, 28 * dt);
        this.heldDisk.y = 48;
      }
      if (this.heldDisk.shakeTimer > 0) {
        this.heldDisk.shakeTimer -= dt;
        this.heldDisk.x += Math.sin(this.heldDisk.shakeTimer * 50) * 3;
      }
    }

    // 6. On-screen Touch Buttons handling
    if (PAD.tapPos) {
      const tx = PAD.tapPos.x, ty = PAD.tapPos.y;

      // Row 1 (y: 192..210)
      if (ty >= 192 && ty <= 210) {
        if (tx >= 10 && tx <= 82) { // [◀ DISKS]
          this.setDiskCount(this.diskCount - 1);
          return;
        }
        if (tx >= 92 && tx <= 164) { // [HINT]
          this.triggerHint();
          return;
        }
        if (tx >= 174 && tx <= 246) { // [DISKS ▶]
          this.setDiskCount(this.diskCount + 1);
          return;
        }
      }

      // Row 2 (y: 214..232)
      if (ty >= 214 && ty <= 232) {
        if (tx >= 10 && tx <= 82) { // [B] UNDO
          this.undo();
          return;
        }
        if (tx >= 92 && tx <= 164) { // [AUTO-SOLVE]
          this.toggleAutoSolve();
          return;
        }
        if (tx >= 174 && tx <= 246) { // [R] RESET
          this.resetGame();
          if (typeof APU !== 'undefined') APU.sfx('UI_OK');
          return;
        }
      }

      // Direct Peg Tap (y: 35..188)
      if (ty >= 35 && ty <= 188) {
        const p = tx < 90 ? 0 : (tx < 166 ? 1 : 2);
        this.handlePegTap(p);
        return;
      }
    }

    // 7. Direct Touch Dragging
    if (PAD.pointer && PAD.pointer.down) {
      const px = PAD.pointer.x, py = PAD.pointer.y;
      if (!this.isDragging) {
        if (py >= 35 && py <= 188) {
          const p = px < 90 ? 0 : (px < 166 ? 1 : 2);
          if (this.heldDisk) {
            this.isDragging = true;
            this.dragDisk = this.heldDisk.disk;
            this.dragSrcPeg = this.heldDisk.srcPeg;
            this.dragX = px;
            this.dragY = py;
            this.heldDisk = null;
          } else if (this.pegs[p].length > 0) {
            this.isDragging = true;
            this.dragDisk = this.pegs[p].pop();
            this.dragSrcPeg = p;
            this.dragX = px;
            this.dragY = py;
            if (typeof APU !== 'undefined') APU.sfx('TICK');
          }
        }
      } else {
        this.dragX = Math.max(16, Math.min(240, px));
        this.dragY = Math.max(25, Math.min(180, py));
      }
    } else if (this.isDragging) {
      this.finishDrag();
    }

    // 8. Physical / Virtual Controller Triggers
    if (PAD.hit('b')) {
      if (this.heldDisk) {
        const d = this.heldDisk.disk;
        const p = this.heldDisk.srcPeg;
        const x = this.heldDisk.x, y = this.heldDisk.y;
        this.heldDisk = null;
        this.startDropAnim(d, p, p, x, y, false);
        if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
        return;
      }
      this.undo();
      return;
    }

    if (PAD.hit('select')) {
      this.setDiskCount(this.diskCount >= 7 ? 3 : this.diskCount + 1);
      return;
    }

    if (PAD.hit('start')) {
      this.toggleAutoSolve();
      return;
    }

    if (PAD.hit('left') || PAD.swipe === 'left') {
      this.sel = Math.max(0, this.sel - 1);
      if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
    } else if (PAD.hit('right') || PAD.swipe === 'right') {
      this.sel = Math.min(2, this.sel + 1);
      if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
    }

    if (!this.heldDisk) {
      if (PAD.hit('up') || PAD.swipe === 'up') {
        this.setDiskCount(this.diskCount + 1);
      } else if (PAD.hit('down') || PAD.swipe === 'down') {
        this.setDiskCount(this.diskCount - 1);
      }
    }

    if (PAD.hit('a')) {
      this.handlePegTap(this.sel);
    }
  },

  drawDisk(g, diskNum, cx, cy) {
    const w = 20 + diskNum * 8;
    const h = 10;
    const x = Math.round(cx - w / 2);
    const y = Math.round(cy);

    // Drop shadow
    g.line(x + 2, y + h, x + w, y + h, 0);
    g.line(x + w, y + 2, x + w, y + h, 0);

    // Dual-edge outer highlights
    g.line(x, y, x + w - 1, y, 3);
    g.line(x + 1, y + 1, x + w - 2, y + 1, 3);
    g.line(x, y, x, y + h - 1, 3);
    g.line(x + 1, y + 1, x + 1, y + h - 2, 3);

    // Outer drop shadows
    g.line(x, y + h - 1, x + w - 1, y + h - 1, 0);
    g.line(x + 1, y + h - 2, x + w - 2, y + h - 2, 1);
    g.line(x + w - 1, y, x + w - 1, y + h - 1, 0);
    g.line(x + w - 2, y + 1, x + w - 2, y + h - 2, 1);

    // Disk body face
    g.rect(x + 2, y + 2, w - 4, h - 4, 2);

    // Center bore hole (where spindle slips through)
    g.rect(cx - 3, y + 2, 6, 6, 1);
    g.box(cx - 4, y + 1, 8, 8, 0);
    // Spindle through bore hole
    g.line(cx - 2, y + 2, cx - 2, y + 7, 3);
    g.line(cx - 1, y + 2, cx, y + 7, 2);
    g.line(cx + 1, y + 2, cx + 1, y + 7, 1);

    // Left wing etched numeral label
    const lx = Math.floor(x + (cx - 4 - x) / 2) - 2;
    g.text("" + diskNum, lx, y + 3, 0);
    g.text("" + diskNum, lx, y + 2, 3);

    // Right wing brass rivet / jewel
    const rx = Math.floor((cx + 4 + x + w) / 2) - 1;
    g.rect(rx, y + 4, 2, 2, 3);
    g.px(rx, y + 4, 0);
  },

  drawButton(g, x, y, w, h, text, active = true, highlighted = false) {
    const bgCol = highlighted ? 2 : (active ? 1 : 0);
    const borderCol = highlighted ? 3 : (active ? 2 : 1);
    const textCol = highlighted ? 0 : (active ? 3 : 1);

    g.rect(x, y, w, h, bgCol);
    g.box(x, y, w, h, borderCol);
    if (active && !highlighted) {
      g.line(x + 1, y + 1, x + w - 2, y + 1, 3);
      g.line(x + 1, y + 1, x + 1, y + h - 2, 3);
      g.line(x + 1, y + h - 1, x + w - 1, y + h - 1, 0);
      g.line(x + w - 1, y + 1, x + w - 1, y + h - 1, 0);
    }
    const textW = text.length * 5 - 1;
    const tx = Math.floor(x + (w - textW) / 2);
    const ty = Math.floor(y + (h - 6) / 2);
    g.text(text, tx, ty, textCol);
  },

  renderWinModal(g) {
    const par = this.getPar();
    const stars = this.getStars(this.moves);
    const starStr = stars === 3 ? "★★★ PERFECT!" : (stars === 2 ? "★★· GREAT!" : "★·· SOLVED!");

    g.rect(20, 52, 216, 118, 0);
    g.rect(22, 54, 212, 114, 1);
    g.box(22, 54, 212, 114, 3);
    g.box(24, 56, 208, 110, 2);

    g.textC("★ PUZZLE SOLVED! ★", 62, 3);
    g.textC(starStr, 76, 3);

    g.line(34, 88, 222, 88, 2);

    g.textC("DISKS: " + this.diskCount + "   PAR: " + par + " MOVES", 94, 2);
    g.textC("COMPLETED IN " + this.moves + " MOVES", 106, 3);

    const best = this.getBestMoves(this.diskCount);
    if (best > 0) {
      g.textC("BEST RECORD: " + best + " MOVES", 118, 2);
    }

    if (this.diskCount < 7) {
      this.drawButton(g, 36, 134, 84, 20, "[A] REPLAY", true);
      this.drawButton(g, 136, 134, 84, 20, "[▶] NEXT (" + (this.diskCount + 1) + "D)", true, true);
      g.textC("PRESS [A] REPLAY  OR  [▶] NEXT LEVEL", 158, 1);
    } else {
      this.drawButton(g, 68, 134, 120, 20, "[A] PLAY AGAIN ▶", true, true);
      g.textC("PRESS [A] OR TAP TO RESTART", 158, 1);
    }
  },

  render(g) {
    g.clear(0);

    const par = this.getPar();
    const best = this.getBestMoves();

    // 1. Header HUD
    g.text("TOWER HANOI", 10, 6, 3);
    g.text("PAR:" + par, 88, 6, 2);
    g.text("BEST:" + (best > 0 ? best : "--"), 136, 6, 2);
    g.textR("MOVES:" + this.moves, 246, 6, 3);

    g.line(10, 16, 246, 16, 1);

    // Status subtitle line
    const bestStars = this.getBestStars();
    const starDisplay = bestStars === 3 ? "★★★" : (bestStars === 2 ? "★★·" : (bestStars === 1 ? "★··" : "···"));
    g.text(starDisplay, 10, 20, bestStars > 0 ? 3 : 1);
    g.textC(this.diskCount + " DISKS · MIN " + par + " MOVES", 20, 2);

    let compCount = 0;
    if (typeof SAVE !== 'undefined') {
      const per = SAVE.getPersistent(this.id);
      if (per && per.completed) compCount = Object.keys(per.completed).length;
    }
    g.textR(compCount + "/5 SOLVED", 246, 20, compCount > 0 ? 2 : 1);

    // 2. Base Pediment
    // Upper tier bevel
    g.line(24, 170, 232, 170, 3);
    g.line(24, 170, 24, 173, 3);
    g.line(232, 170, 232, 173, 1);
    g.rect(25, 171, 206, 3, 2);

    // Lower tier pediment body
    g.line(16, 174, 240, 174, 3);
    g.line(16, 174, 16, 185, 3);
    g.line(240, 174, 240, 185, 0);
    g.line(16, 185, 240, 185, 0);
    g.rect(17, 175, 222, 10, 2);
    g.dither(18, 175, 220, 10, 1, 2);
    g.line(14, 186, 242, 186, 0);

    // 3. Turned Vertical Spindles & Brass Caps
    for (let p = 0; p < 3; p++) {
      const cx = this.pegX[p];

      // Base socket
      g.rect(cx - 6, 169, 12, 3, 1);
      g.box(cx - 6, 169, 12, 3, 0);

      // Shaft
      g.line(cx - 3, 70, cx - 3, 169, 3);
      g.rect(cx - 2, 70, 2, 100, 2);
      g.line(cx, 70, cx, 169, 2);
      g.line(cx + 1, 70, cx + 1, 169, 1);
      g.line(cx + 2, 70, cx + 2, 169, 0);

      // Turned bottom collar
      g.rect(cx - 5, 166, 10, 3, 2);
      g.box(cx - 5, 166, 10, 3, 1);
      g.line(cx - 5, 166, cx + 4, 166, 3);

      // Turned top collar
      g.rect(cx - 4, 68, 8, 3, 2);
      g.line(cx - 4, 68, cx + 3, 68, 3);

      // Brass finial cap
      g.rect(cx - 4, 63, 8, 5, 2);
      g.box(cx - 4, 63, 8, 5, 1);
      g.line(cx - 3, 63, cx + 2, 63, 3);
      g.line(cx - 4, 64, cx - 4, 66, 3);
      g.px(cx - 1, 62, 3);
      g.px(cx, 62, 3);

      // Peg letterplate labels
      const pLabel = p === 0 ? "A" : (p === 1 ? "B" : "C");
      g.text(pLabel, cx - 2, 177, 0);
      g.text(pLabel, cx - 2, 178, 3);

      // Peg Stack Disks
      const stack = this.pegs[p];
      for (let i = 0; i < stack.length; i++) {
        const d = stack[i];
        const dy = 170 - (i + 1) * 10;
        this.drawDisk(g, d, cx, dy);
      }
    }

    // 4. Cursor pointer
    if (!this.isDragging) {
      g.text("▲", this.pegX[this.sel] - 2, 187, 3);
    }

    // 5. Animating Disk in flight
    if (this.anim) {
      this.drawDisk(g, this.anim.disk, this.anim.x, this.anim.y);
    }

    // 6. Held Disk at hover
    if (this.heldDisk && !this.anim) {
      this.drawDisk(g, this.heldDisk.disk, this.heldDisk.x, this.heldDisk.y);
    }

    // 7. Dragged Disk following finger
    if (this.isDragging && this.dragDisk) {
      this.drawDisk(g, this.dragDisk, this.dragX, this.dragY - 6);
    }

    // 8. On-screen Touch Buttons
    // Row 1
    this.drawButton(g, 10, 192, 72, 18, "[◀ DISKS]", this.diskCount > 3);
    this.drawButton(g, 92, 192, 72, 18, "[HINT]", !this.won);
    this.drawButton(g, 174, 192, 72, 18, "[DISKS ▶]", this.diskCount < 7);

    // Row 2
    const canUndo = this.history.length > 0 || this.heldDisk !== null;
    this.drawButton(g, 10, 214, 72, 18, "[B] UNDO", canUndo);
    const autoText = this.autoSolve ? "[STOP AUTO]" : "[AUTO-SOLVE]";
    this.drawButton(g, 92, 214, 72, 18, autoText, true, this.autoSolve);
    this.drawButton(g, 174, 214, 72, 18, "[R] RESET", true);

    // 9. Celebration Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.x >= 0 && p.x < 256 && p.y >= 0 && p.y < 240) {
        g.px(p.x, p.y, p.c);
      }
    }

    // 10. Victory Modal
    if (this.won) {
      this.renderWinModal(g);
    }
  }
};
