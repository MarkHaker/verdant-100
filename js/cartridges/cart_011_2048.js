// js/cartridges/cart_011_2048.js
// ============================================================================
// Cartridge #011: 2048
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 11. 2048
CARTS[11] = {
  id: 11,
  name: "2048",
  genre: 1,
  scoreLabel: "TILES",
  desc: "SLIDE TILES WITH SWIPE OR D-PAD TO MERGE MATCHING NUMBERS INTO 2048!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Micro 2x2 grid representing 2048 tiles
    g.rect(x + 3, y + 3, 12, 12, 1);
    g.box(x + 3, y + 3, 12, 12, 2);
    g.text("2", x + 7, y + 6, 3);

    g.dither(x + 17, y + 3, 12, 12, 0, 1);
    g.box(x + 17, y + 3, 12, 12, 2);
    g.text("4", x + 21, y + 6, 3);

    g.rect(x + 3, y + 17, 12, 12, 2);
    g.box(x + 3, y + 17, 12, 12, 3);
    g.text("8", x + 7, y + 20, 0);

    g.rect(x + 17, y + 17, 12, 12, 3);
    g.text("16", x + 18, y + 20, 0);
  },

  init() {
    this.grid = E1.create(4, 4, 0);
    this.score = 0;
    this.over = false;
    this.reached2048 = false;
    this.showWinBanner = false;

    // Undo state (1-step memory)
    this.history = null;
    this.canUndo = false;
    this.undoFlashTimer = 0;

    // Slide interpolation animation
    this.animTimer = 0;
    this.animDuration = 0.12;
    this.slidingTiles = [];
    this.pendingGridData = null;
    this.pendingScore = 0;
    this.pendingMaxMergedVal = 0;

    // Merge pop animation timers (per cell 0..15)
    this.popTimers = new Array(16).fill(0);
    this.spawnTileAnim = null;

    // Mobile touch tracking
    this.touchState = 0; // 0: IDLE, 1: TRACKING, 2: TRIGGERED
    this.touchStartX = 0;
    this.touchStartY = 0;

    // Initial 2 tiles
    this.spawnTile();
    this.spawnTile();
  },

  spawnTile() {
    const empty = [];
    for (let i = 0; i < 16; i++) {
      if (this.grid.data[i] === 0) empty.push(i);
    }
    if (empty.length > 0) {
      const idx = empty[Math.floor(Math.random() * empty.length)];
      this.grid.data[idx] = Math.random() < 0.9 ? 2 : 4;
      return idx;
    }
    return null;
  },

  checkGameOver() {
    for (let i = 0; i < 16; i++) {
      if (this.grid.data[i] === 0) return false;
    }
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 3; x++) {
        if (E1.get(this.grid, x, y) === E1.get(this.grid, x + 1, y)) return false;
      }
    }
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 3; y++) {
        if (E1.get(this.grid, x, y) === E1.get(this.grid, x, y + 1)) return false;
      }
    }
    this.over = true;
    APU.sfx('BOOM');
    SAVE.setScore(this.id, this.score);
    return true;
  },

  playMergeSound(maxVal) {
    if (maxVal >= 2048) {
      APU.sfx('LEVELUP');
      return;
    }
    const pitches = {
      4:    [261.63, 329.63],   // C4, E4
      8:    [329.63, 392.00],   // E4, G4
      16:   [392.00, 523.25],   // G4, C5
      32:   [523.25, 659.25],   // C5, E5
      64:   [659.25, 783.99],   // E5, G5
      128:  [783.99, 1046.50],  // G5, C6
      256:  [1046.50, 1318.51], // C6, E6
      512:  [1318.51, 1567.98], // E6, G6
      1024: [1567.98, 2093.00], // G6, C7
    };
    const pair = pitches[maxVal] || [261.63, 329.63];
    APU.softTone(pair[0], 0.06, 'triangle', 0.08, 0, 0.006, 1600);
    APU.softTone(pair[1], 0.10, 'sine', 0.09, 0.035, 0.008, 1800);
  },

  undo() {
    if (!this.canUndo || !this.history || this.animTimer > 0) {
      APU.sfx('DENY');
      return false;
    }
    this.grid.data = [...this.history.grid];
    this.score = this.history.score;
    this.reached2048 = this.history.reached2048;
    this.canUndo = false;
    this.history = null;
    this.over = false;
    this.showWinBanner = false;
    this.undoFlashTimer = 0.3;
    this.slidingTiles = [];
    this.pendingGridData = null;
    this.popTimers.fill(0);
    this.spawnTileAnim = null;
    APU.sfx('UI_BACK');
    return true;
  },

  moveBoard(dir) {
    if (this.animTimer > 0 || this.showWinBanner || this.over) return false;

    const nextGridData = new Array(16).fill(0);
    const slidingTiles = [];
    let maxMergedVal = 0;
    let pointsEarned = 0;
    let moved = false;

    const processLine = (lineCoords) => {
      const tilesInLine = [];
      for (let i = 0; i < 4; i++) {
        const { x, y } = lineCoords[i];
        const val = this.grid.data[y * 4 + x];
        if (val !== 0) {
          tilesInLine.push({ x, y, val });
        }
      }

      let targetIdx = 0;
      let k = 0;
      while (k < tilesInLine.length) {
        const cur = tilesInLine[k];
        if (k + 1 < tilesInLine.length && cur.val === tilesInLine[k + 1].val) {
          const next = tilesInLine[k + 1];
          const mergedVal = cur.val * 2;
          const destCoord = lineCoords[targetIdx];

          nextGridData[destCoord.y * 4 + destCoord.x] = mergedVal;
          pointsEarned += mergedVal;
          if (mergedVal > maxMergedVal) maxMergedVal = mergedVal;

          slidingTiles.push({
            fromX: cur.x, fromY: cur.y,
            toX: destCoord.x, toY: destCoord.y,
            val: cur.val,
            merged: true,
            resultVal: mergedVal
          });
          slidingTiles.push({
            fromX: next.x, fromY: next.y,
            toX: destCoord.x, toY: destCoord.y,
            val: next.val,
            merged: true,
            resultVal: mergedVal
          });

          moved = true;
          targetIdx++;
          k += 2;
        } else {
          const destCoord = lineCoords[targetIdx];
          nextGridData[destCoord.y * 4 + destCoord.x] = cur.val;

          if (cur.x !== destCoord.x || cur.y !== destCoord.y) {
            moved = true;
          }

          slidingTiles.push({
            fromX: cur.x, fromY: cur.y,
            toX: destCoord.x, toY: destCoord.y,
            val: cur.val,
            merged: false,
            resultVal: cur.val
          });

          targetIdx++;
          k += 1;
        }
      }
    };

    if (dir === 'left') {
      for (let y = 0; y < 4; y++) {
        processLine([{ x: 0, y }, { x: 1, y }, { x: 2, y }, { x: 3, y }]);
      }
    } else if (dir === 'right') {
      for (let y = 0; y < 4; y++) {
        processLine([{ x: 3, y }, { x: 2, y }, { x: 1, y }, { x: 0, y }]);
      }
    } else if (dir === 'up') {
      for (let x = 0; x < 4; x++) {
        processLine([{ x, y: 0 }, { x, y: 1 }, { x, y: 2 }, { x, y: 3 }]);
      }
    } else if (dir === 'down') {
      for (let x = 0; x < 4; x++) {
        processLine([{ x, y: 3 }, { x, y: 2 }, { x, y: 1 }, { x, y: 0 }]);
      }
    }

    if (!moved) return false;

    // Save previous state for 1-step undo [B]
    this.history = {
      grid: [...this.grid.data],
      score: this.score,
      reached2048: this.reached2048
    };
    this.canUndo = true;

    this.pendingGridData = nextGridData;
    this.pendingScore = this.score + pointsEarned;
    this.pendingMaxMergedVal = maxMergedVal;
    this.slidingTiles = slidingTiles;
    this.animTimer = 0.12;
    this.animDuration = 0.12;

    return true;
  },

  finishSlide() {
    this.grid.data = this.pendingGridData;
    this.score = this.pendingScore;
    this.pendingGridData = null;
    this.animTimer = 0;

    let reached2048ThisMove = false;
    for (let i = 0; i < this.slidingTiles.length; i++) {
      const st = this.slidingTiles[i];
      if (st.merged) {
        const idx = st.toY * 4 + st.toX;
        this.popTimers[idx] = 0.15;
        if (st.resultVal >= 2048 && !this.reached2048) {
          reached2048ThisMove = true;
        }
      }
    }
    this.slidingTiles = [];

    // Dynamic pitch audio feedback
    if (this.pendingMaxMergedVal > 0) {
      this.playMergeSound(this.pendingMaxMergedVal);
    } else {
      APU.softTone(330, 0.04, 'triangle', 0.04, 0, 0.003, 1000);
    }

    // Spawn new tile with pop animation
    const spawnedIdx = this.spawnTile();
    if (spawnedIdx !== null) {
      this.spawnTileAnim = {
        x: spawnedIdx % 4,
        y: Math.floor(spawnedIdx / 4),
        timer: 0.15
      };
    }

    // Check 2048 celebration win condition
    if (reached2048ThisMove && !this.reached2048) {
      this.reached2048 = true;
      this.showWinBanner = true;
      APU.sfx('LEVELUP');
    }

    // High score persist
    SAVE.setScore(this.id, this.score);

    // Check Game Over
    this.checkGameOver();
  },

  update(dt) {
    // Timer updates
    if (this.animTimer > 0) {
      this.animTimer -= dt;
      if (this.animTimer <= 0) {
        this.finishSlide();
      }
    }

    for (let i = 0; i < 16; i++) {
      if (this.popTimers[i] > 0) {
        this.popTimers[i] = Math.max(0, this.popTimers[i] - dt);
      }
    }

    if (this.spawnTileAnim && this.spawnTileAnim.timer > 0) {
      this.spawnTileAnim.timer = Math.max(0, this.spawnTileAnim.timer - dt);
    }

    if (this.undoFlashTimer > 0) {
      this.undoFlashTimer = Math.max(0, this.undoFlashTimer - dt);
    }

    // 2048 celebratory win banner interaction
    if (this.showWinBanner) {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || PAD.swipe ||
          PAD.hit('left') || PAD.hit('right') || PAD.hit('up') || PAD.hit('down')) {
        this.showWinBanner = false;
        APU.sfx('UI_OK');
      }
      return;
    }

    // Game Over state interaction
    if (this.over) {
      if (this.canUndo && PAD.hit('b')) {
        this.undo();
        return;
      }
      if (PAD.hit('a') || PAD.hit('start')) {
        this.init();
      }
      return;
    }

    // Undo button [B] during gameplay
    if (PAD.hit('b')) {
      this.undo();
      return;
    }

    // Check on-screen touch tap for [B] UNDO button area (x: 40..110, y: 195..215)
    if (PAD.tapPos) {
      if (PAD.tapPos.x >= 40 && PAD.tapPos.x <= 110 && PAD.tapPos.y >= 195 && PAD.tapPos.y <= 215) {
        this.undo();
        PAD.tapPos = null;
        return;
      }
    }

    // Determine move direction
    let move = null;
    if (PAD.hit('left')) move = 'left';
    else if (PAD.hit('right')) move = 'right';
    else if (PAD.hit('up')) move = 'up';
    else if (PAD.hit('down')) move = 'down';

    // Mobile swipe from PAD manager
    if (!move && PAD.swipe) {
      move = PAD.swipe;
      PAD.swipe = null;
    }

    // Direct screen touch pointer drag tracking on the board
    if (PAD.pointer && PAD.pointer.down) {
      if (this.touchState === 0) {
        if (PAD.pointer.x >= 32 && PAD.pointer.x <= 224 && PAD.pointer.y >= 16 && PAD.pointer.y <= 200) {
          this.touchState = 1;
          this.touchStartX = PAD.pointer.x;
          this.touchStartY = PAD.pointer.y;
        }
      } else if (this.touchState === 1 && !move) {
        const dx = PAD.pointer.x - this.touchStartX;
        const dy = PAD.pointer.y - this.touchStartY;
        const dist = Math.hypot(dx, dy);
        if (dist >= 18) {
          if (Math.abs(dx) > Math.abs(dy)) {
            move = dx > 0 ? 'right' : 'left';
          } else {
            move = dy > 0 ? 'down' : 'up';
          }
          this.touchState = 2; // Wait for pointerup to avoid repeating
        }
      }
    } else {
      this.touchState = 0;
    }

    if (move) {
      this.moveBoard(move);
    }
  },

  drawTile(g, bx, by, sz, val, scaleBonus = 0) {
    if (val <= 0) return;
    const s = Math.max(8, Math.round(sz + scaleBonus));
    const x = Math.round(bx - (s - sz) / 2);
    const y = Math.round(by - (s - sz) / 2);
    const sVal = "" + val;
    const isLarge = val >= 1000;
    const scale = isLarge ? 1 : 2;
    const tw = (sVal.length * 5 - 1) * scale;
    const th = 6 * scale;
    const tx = Math.floor(x + (s - tw) / 2);
    const ty = Math.floor(y + (s - th) / 2);

    if (val === 2) {
      g.rect(x + 2, y + 2, s - 4, s - 4, 1);
      g.line(x + 2, y + 2, x + s - 3, y + 2, 2);
      g.line(x + 2, y + 2, x + 2, y + s - 3, 2);
      g.line(x + 2, y + s - 3, x + s - 3, y + s - 3, 0);
      g.line(x + s - 3, y + 2, x + s - 3, y + s - 3, 0);
      g.text(sVal, tx, ty, 3, scale);
    } else if (val === 4) {
      g.dither(x + 2, y + 2, s - 4, s - 4, 0, 1);
      g.box(x + 2, y + 2, s - 4, s - 4, 2);
      g.line(x + 2, y + 2, x + s - 3, y + 2, 3);
      g.line(x + 2, y + 2, x + 2, y + s - 3, 3);
      g.text(sVal, tx, ty, 3, scale);
    } else if (val === 8) {
      g.rect(x + 2, y + 2, s - 4, s - 4, 2);
      g.line(x + 2, y + 2, x + s - 3, y + 2, 3);
      g.line(x + 2, y + 2, x + 2, y + s - 3, 3);
      g.line(x + 2, y + s - 3, x + s - 3, y + s - 3, 1);
      g.line(x + s - 3, y + 2, x + s - 3, y + s - 3, 1);
      g.text(sVal, tx, ty, 0, scale);
    } else if (val === 16) {
      g.dither(x + 2, y + 2, s - 4, s - 4, 1, 2);
      g.box(x + 2, y + 2, s - 4, s - 4, 3);
      g.line(x + s - 3, y + 2, x + s - 3, y + s - 3, 0);
      g.line(x + 2, y + s - 3, x + s - 3, y + s - 3, 0);
      g.text(sVal, tx, ty, 3, scale);
    } else if (val === 32) {
      g.rect(x + 2, y + 2, s - 4, s - 4, 2);
      g.box(x + 2, y + 2, s - 4, s - 4, 3);
      g.box(x + 4, y + 4, s - 8, s - 8, 1);
      g.text(sVal, tx, ty, 0, scale);
    } else if (val === 64) {
      g.rect(x + 2, y + 2, s - 4, s - 4, 3);
      g.line(x + s - 3, y + 2, x + s - 3, y + s - 3, 2);
      g.line(x + 2, y + s - 3, x + s - 3, y + s - 3, 2);
      g.text(sVal, tx, ty, 0, scale);
    } else if (val === 128) {
      g.rect(x + 2, y + 2, s - 4, s - 4, 3);
      g.rect(x + 4, y + 4, s - 8, s - 8, 1);
      g.box(x + 4, y + 4, s - 8, s - 8, 2);
      g.px(x + 3, y + 3, 0); g.px(x + s - 4, y + 3, 0);
      g.px(x + 3, y + s - 4, 0); g.px(x + s - 4, y + s - 4, 0);
      g.text(sVal, tx, ty, 3, scale);
    } else if (val === 256) {
      g.rect(x + 2, y + 2, s - 4, s - 4, 3);
      g.dither(x + 4, y + 4, s - 8, s - 8, 0, 2);
      g.box(x + 4, y + 4, s - 8, s - 8, 3);
      g.text(sVal, tx, ty, 3, scale);
    } else if (val === 512) {
      g.rect(x + 2, y + 2, s - 4, s - 4, 3);
      g.rect(x + 4, y + 4, s - 8, s - 8, 0);
      g.box(x + 5, y + 5, s - 10, s - 10, 2);
      g.px(x + 2, y + 2, 0); g.px(x + s - 3, y + 2, 0);
      g.px(x + 2, y + s - 3, 0); g.px(x + s - 3, y + s - 3, 0);
      g.text(sVal, tx, ty, 3, scale);
    } else if (val === 1024) {
      g.rect(x + 2, y + 2, s - 4, s - 4, 2);
      g.box(x + 2, y + 2, s - 4, s - 4, 3);
      g.rect(x + 3, y + 10, s - 6, s - 20, 0);
      g.box(x + 3, y + 10, s - 6, s - 20, 3);
      g.line(x + 6, y + 6, x + s - 7, y + 6, 3);
      g.line(x + 6, y + s - 7, x + s - 7, y + s - 7, 3);
      g.text(sVal, tx, ty, 3, scale);
    } else if (val === 2048) {
      g.rect(x + 2, y + 2, s - 4, s - 4, 3);
      g.box(x + 4, y + 4, s - 8, s - 8, 0);
      g.rect(x + 5, y + 10, s - 10, s - 20, 0);
      g.box(x + 5, y + 10, s - 10, s - 20, 3);
      g.px(x + 3, y + 3, 0); g.px(x + s - 4, y + 3, 0);
      g.px(x + 3, y + s - 4, 0); g.px(x + s - 4, y + s - 4, 0);
      g.px(x + 6, y + 6, 2); g.px(x + s - 7, y + 6, 2);
      g.px(x + 6, y + s - 7, 2); g.px(x + s - 7, y + s - 7, 2);
      g.text(sVal, tx, ty, 3, scale);
    } else {
      // 4096 and higher
      g.dither(x + 2, y + 2, s - 4, s - 4, 2, 3);
      g.box(x + 2, y + 2, s - 4, s - 4, 3);
      g.rect(x + 4, y + 10, s - 8, s - 20, 0);
      g.box(x + 4, y + 10, s - 8, s - 20, 3);
      g.px(x + 9, y + 6, 3); g.px(x + s - 10, y + 6, 3);
      g.px(x + Math.floor(s / 2), y + 5, 3);
      g.text(sVal, tx, ty, 3, scale);
    }
  },

  render(g) {
    g.clear(0);

    // Decorative console rule line
    g.line(16, 6, 240, 6, 1);

    // HUD: SCORE & BEST
    const bestScore = Math.max(this.score, SAVE.getScore(this.id));
    g.text("SCORE: " + this.score, 16, 12, 3);
    g.textC("2048", 12, 3);
    g.textR("BEST: " + bestScore, 240, 12, 2);

    const ox = 48, oy = 28, sz = 40;

    // Board outer frame
    g.box(ox - 3, oy - 3, 4 * sz + 6, 4 * sz + 6, 2);
    g.box(ox - 2, oy - 2, 4 * sz + 4, 4 * sz + 4, 1);
    g.rect(ox - 1, oy - 1, 4 * sz + 2, 4 * sz + 2, 0);

    // 1. Draw empty board slots
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.rect(bx, by, sz, sz, 0);
        g.box(bx + 1, by + 1, sz - 2, sz - 2, 1);
      }
    }

    // 2. Draw tiles (interpolating during slide, or static with pop/scale pulse)
    if (this.animTimer > 0 && this.slidingTiles.length > 0) {
      const t = Math.max(0, Math.min(1, 1 - (this.animTimer / this.animDuration)));
      const ease = t * (2 - t); // Quad ease-out

      for (let i = 0; i < this.slidingTiles.length; i++) {
        const st = this.slidingTiles[i];
        const curX = st.fromX + (st.toX - st.fromX) * ease;
        const curY = st.fromY + (st.toY - st.fromY) * ease;
        const bx = ox + curX * sz;
        const by = oy + curY * sz;
        this.drawTile(g, bx, by, sz, st.val, 0);
      }
    } else {
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          const val = E1.get(this.grid, x, y);
          if (val > 0) {
            const bx = ox + x * sz, by = oy + y * sz;
            const idx = y * 4 + x;
            let scaleBonus = 0;

            // Merge pop pulse
            if (this.popTimers[idx] > 0) {
              const p = this.popTimers[idx] / 0.15;
              scaleBonus += Math.sin(p * Math.PI) * 4;
            }

            // Spawn pop pulse
            if (this.spawnTileAnim && this.spawnTileAnim.timer > 0 &&
                this.spawnTileAnim.x === x && this.spawnTileAnim.y === y) {
              const p = this.spawnTileAnim.timer / 0.15;
              scaleBonus += (1 - Math.cos(p * Math.PI)) * -2;
            }

            this.drawTile(g, bx, by, sz, val, scaleBonus);
          }
        }
      }
    }

    // Bottom info area
    g.line(48, 194, 208, 194, 1);
    g.text("[B] UNDO", 48, 200, this.canUndo ? 3 : 1);
    g.textR("TARGET: 2048", 208, 200, 2);
    g.textC("[SWIPE / D-PAD] SLIDE", 212, 1);

    if (this.undoFlashTimer > 0) {
      g.textC("<< MOVE UNDONE >>", 224, 3);
    } else if (this.reached2048) {
      g.textC("* ENDLESS MODE ACTIVE *", 224, 2);
    } else {
      g.textC("MERGE TO REACH 2048", 224, 1);
    }

    // Modal overlay for 2048 celebratory win banner
    if (this.showWinBanner) {
      g.dither(36, 68, 184, 80, 0, 1);
      g.box(36, 68, 184, 80, 3);
      g.box(38, 70, 180, 76, 2);
      g.textC("YOU REACHED 2048!", 78, 3);
      g.textC("LEGENDARY VICTORY!", 92, 2);
      g.textC("SCORE: " + this.score, 104, 3);
      g.textC("[A] KEEP PLAYING (ENDLESS)", 120, 3);
      g.textC("SWIPE / D-PAD TO CONTINUE", 132, 1);
    }

    // Modal overlay for Game Over
    if (this.over) {
      g.dither(48, 72, 160, 72, 0, 1);
      g.box(48, 72, 160, 72, 3);
      g.box(50, 74, 156, 68, 2);
      g.textC("NO MORE MOVES!", 82, 3);
      g.textC("FINAL SCORE: " + this.score, 96, 2);
      if (this.canUndo) {
        g.textC("[B] UNDO FATAL MOVE", 112, 3);
        g.textC("[A] PLAY AGAIN", 126, 2);
      } else {
        g.textC("[A] PLAY AGAIN", 118, 3);
      }
    }
  },

  save() {
    return {
      grid: [...this.grid.data],
      score: this.score,
      reached2048: this.reached2048,
      canUndo: this.canUndo,
      history: this.history ? {
        grid: [...this.history.grid],
        score: this.history.score,
        reached2048: this.history.reached2048
      } : null,
      over: this.over
    };
  },

  load(obj) {
    if (!obj || !Array.isArray(obj.grid) || obj.grid.length !== 16) return;
    this.grid.data = [...obj.grid];
    this.score = typeof obj.score === 'number' ? obj.score : 0;
    this.reached2048 = !!obj.reached2048;
    this.canUndo = !!obj.canUndo;
    this.history = obj.history && Array.isArray(obj.history.grid) ? {
      grid: [...obj.history.grid],
      score: obj.history.score || 0,
      reached2048: !!obj.history.reached2048
    } : null;
    this.over = !!obj.over;
    this.animTimer = 0;
    this.slidingTiles = [];
    this.pendingGridData = null;
    this.showWinBanner = false;
  }
};
