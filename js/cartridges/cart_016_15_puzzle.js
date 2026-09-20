// js/cartridges/cart_016_15_puzzle.js
// ============================================================================
// Cartridge #016: 15-PUZZLE
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 16. 15-PUZZLE
CARTS[16] = {
  id: 16,
  name: "15-PUZZLE",
  genre: 1,
  scoreLabel: "MOVES",
  desc: "SLIDE 1-15 NUMBERED TILES INTO SEQUENTIAL ORDER. MULTI-PUSH, SWIPE OR TAP!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Outer raised bevel
    g.line(x, y, x + 31, y, 3);
    g.line(x, y, x, y + 31, 3);
    g.line(x, y + 31, x + 31, y + 31, 1);
    g.line(x + 31, y, x + 31, y + 31, 1);

    // Mini 2x2 tile showcase
    const drawMiniTile = (tx, ty, label) => {
      g.rect(tx, ty, 11, 11, 2);
      g.box(tx, ty, 11, 11, 1);
      g.line(tx, ty, tx + 10, ty, 3);
      g.line(tx, ty, tx, ty + 10, 3);
      g.line(tx, ty + 10, tx + 10, ty + 10, 0);
      g.line(tx + 10, ty, tx + 10, ty + 10, 0);
      g.text(label, tx + 4, ty + 3, 0);
      g.text(label, tx + 4, ty + 4, 3);
    };

    drawMiniTile(x + 3, y + 3, "1");
    drawMiniTile(x + 17, y + 3, "2");
    drawMiniTile(x + 3, y + 17, "3");

    // Empty slot in bottom-right
    g.rect(x + 17, y + 17, 11, 11, 0);
    g.dither(x + 18, y + 18, 9, 9, 0, 1);
    g.box(x + 17, y + 17, 11, 11, 1);
  },

  init() {
    this.moves = 0;
    this.time = 0;
    this.hasStarted = false;
    this.won = false;
    this.history = [];
    this.particles = [];

    // Animation & touch state
    this.animTimer = 0;
    this.animDuration = 0.10; // 0.1s glide animation
    this.slidingTiles = null;
    this.pendingTiles = null;

    this.touchTracking = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragTileX = -1;
    this.dragTileY = -1;

    // Guaranteed solvable scramble with mathematical parity enforcement
    this.shufflePuzzle();
  },

  isSolvable(tiles) {
    let inv = 0;
    for (let i = 0; i < 16; i++) {
      if (tiles[i] === 0) continue;
      for (let j = i + 1; j < 16; j++) {
        if (tiles[j] === 0) continue;
        if (tiles[i] > tiles[j]) inv++;
      }
    }
    const emptyRow = Math.floor(tiles.indexOf(0) / 4);
    return (inv + emptyRow) % 2 === 1;
  },

  shufflePuzzle() {
    this.tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
    this.moves = 0;
    this.time = 0;
    this.hasStarted = false;
    this.won = false;
    this.history = [];
    this.particles = [];
    this.animTimer = 0;
    this.slidingTiles = null;
    this.pendingTiles = null;

    let lastPick = -1;
    for (let step = 0; step < 160; step++) {
      const emptyIdx = this.tiles.indexOf(0);
      const ex = emptyIdx % 4, ey = Math.floor(emptyIdx / 4);
      const adj = [];
      if (ex > 0 && emptyIdx - 1 !== lastPick) adj.push(emptyIdx - 1);
      if (ex < 3 && emptyIdx + 1 !== lastPick) adj.push(emptyIdx + 1);
      if (ey > 0 && emptyIdx - 4 !== lastPick) adj.push(emptyIdx - 4);
      if (ey < 3 && emptyIdx + 4 !== lastPick) adj.push(emptyIdx + 4);
      const choices = adj.length > 0 ? adj : [lastPick];
      const pick = choices[Math.floor(Math.random() * choices.length)];
      this.tiles[emptyIdx] = this.tiles[pick];
      this.tiles[pick] = 0;
      lastPick = emptyIdx;
    }

    // Parity verification check: must be mathematically solvable and not already solved
    if (!this.isSolvable(this.tiles) || this.checkWin()) {
      this.shufflePuzzle();
    }
  },

  checkWin() {
    for (let i = 0; i < 15; i++) {
      if (this.tiles[i] !== i + 1) return false;
    }
    return this.tiles[15] === 0;
  },

  getBestMoves() {
    if (typeof SAVE === 'undefined') return 0;
    const per = SAVE.getPersistent(this.id);
    if (per && per.bestMoves) return per.bestMoves;
    const s = SAVE.getScore(this.id);
    return s > 0 ? s : 0;
  },

  pushTiles(tx, ty) {
    if (this.won) return false;
    if (this.animTimer > 0) {
      this.finishSlide();
    }

    const emptyIdx = this.tiles.indexOf(0);
    const ex = emptyIdx % 4, ey = Math.floor(emptyIdx / 4);
    if (tx === ex && ty === ey) return false;
    if (tx !== ex && ty !== ey) {
      if (typeof APU !== 'undefined') APU.sfx('DENY');
      return false;
    }

    const next = [...this.tiles];
    const sliding = [];

    if (ty === ey) {
      // Horizontal push (same row)
      if (tx < ex) {
        for (let x = ex - 1; x >= tx; x--) {
          const val = this.tiles[ey * 4 + x];
          next[ey * 4 + (x + 1)] = val;
          sliding.push({ val, fromX: x, fromY: ey, toX: x + 1, toY: ey });
        }
      } else {
        for (let x = ex + 1; x <= tx; x++) {
          const val = this.tiles[ey * 4 + x];
          next[ey * 4 + (x - 1)] = val;
          sliding.push({ val, fromX: x, fromY: ey, toX: x - 1, toY: ey });
        }
      }
    } else {
      // Vertical push (same column)
      if (ty < ey) {
        for (let y = ey - 1; y >= ty; y--) {
          const val = this.tiles[y * 4 + ex];
          next[(y + 1) * 4 + ex] = val;
          sliding.push({ val, fromX: ex, fromY: y, toX: ex, toY: y + 1 });
        }
      } else {
        for (let y = ey + 1; y <= ty; y++) {
          const val = this.tiles[y * 4 + ex];
          next[(y - 1) * 4 + ex] = val;
          sliding.push({ val, fromX: ex, fromY: y, toX: ex, toY: y - 1 });
        }
      }
    }
    next[ty * 4 + tx] = 0;

    // Record undo state (up to 100 deep steps)
    if (this.history.length >= 100) this.history.shift();
    this.history.push({
      tiles: [...this.tiles],
      moves: this.moves
    });

    this.pendingTiles = next;
    this.slidingTiles = sliding;
    this.animTimer = this.animDuration;
    this.moves++;
    this.hasStarted = true;

    if (typeof APU !== 'undefined') APU.sfx('TICK');
    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(6);

    return true;
  },

  finishSlide() {
    if (!this.pendingTiles) return;
    this.tiles = this.pendingTiles;
    this.pendingTiles = null;
    this.slidingTiles = null;
    this.animTimer = 0;

    if (this.checkWin()) {
      this.won = true;
      if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
      this.spawnWinParticles();

      // Persist score and best moves
      if (typeof SAVE !== 'undefined') {
        const per = SAVE.getPersistent(this.id) || {};
        if (!per.bestMoves || this.moves < per.bestMoves) {
          per.bestMoves = this.moves;
          per.bestTime = Math.floor(this.time);
        }
        SAVE.setPersistent(this.id, per);
        SAVE.setScore(this.id, this.moves);
      }
    }
  },

  undo() {
    if (this.animTimer > 0) {
      this.finishSlide();
    }
    if (!this.history || this.history.length === 0) {
      if (typeof APU !== 'undefined') APU.sfx('DENY');
      return false;
    }
    const prev = this.history.pop();
    this.tiles = [...prev.tiles];
    this.moves = prev.moves;
    this.pendingTiles = null;
    this.slidingTiles = null;
    this.animTimer = 0;
    this.won = false;
    if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(8);
    return true;
  },

  spawnWinParticles() {
    this.particles = [];
    for (let i = 0; i < 40; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 35 + Math.random() * 75;
      this.particles.push({
        x: 128 + (Math.random() - 0.5) * 50,
        y: 104 + (Math.random() - 0.5) * 50,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 30,
        life: 0.9 + Math.random() * 0.7,
        c: Math.random() < 0.6 ? 3 : 2
      });
    }
  },

  update(dt) {
    // Delta-time timer
    if (this.hasStarted && !this.won) {
      this.time += dt;
    }

    // Tile slide interpolation timer
    if (this.animTimer > 0) {
      this.animTimer -= dt;
      if (this.animTimer <= 0) {
        this.finishSlide();
      }
    }

    // Particle physics
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 60 * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Win state handling
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('start') || PAD.hit('select')) {
        this.init();
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        return;
      }
      if (PAD.hit('b')) {
        this.undo();
        return;
      }
      if (PAD.tapPos) {
        const tx = PAD.tapPos.x, ty = PAD.tapPos.y;
        if (ty >= 184 && ty <= 208 && tx >= 34 && tx <= 122) {
          this.undo();
          return;
        }
        this.init();
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        return;
      }
      return;
    }

    // Controller button triggers
    if (PAD.hit('b')) {
      this.undo();
      return;
    }
    if (PAD.hit('select')) {
      this.init();
      if (typeof APU !== 'undefined') APU.sfx('UI_OK');
      return;
    }

    const emptyIdx = this.tiles.indexOf(0);
    const ex = emptyIdx % 4, ey = Math.floor(emptyIdx / 4);

    // D-Pad navigation
    if (PAD.hit('up') && ey < 3) { this.pushTiles(ex, ey + 1); return; }
    if (PAD.hit('down') && ey > 0) { this.pushTiles(ex, ey - 1); return; }
    if (PAD.hit('left') && ex < 3) { this.pushTiles(ex + 1, ey); return; }
    if (PAD.hit('right') && ex > 0) { this.pushTiles(ex - 1, ey); return; }

    // Fast swipe gestures
    const sw = PAD.swipe;
    if (sw === 'up' && ey < 3) { this.pushTiles(ex, ey + 1); return; }
    if (sw === 'down' && ey > 0) { this.pushTiles(ex, ey - 1); return; }
    if (sw === 'left' && ex < 3) { this.pushTiles(ex + 1, ey); return; }
    if (sw === 'right' && ex > 0) { this.pushTiles(ex - 1, ey); return; }

    const ox = 56, oy = 32, sz = 36;

    // Direct Mobile Touch / Tap
    if (PAD.tapPos) {
      const tx = PAD.tapPos.x, ty = PAD.tapPos.y;

      // On-screen Buttons
      if (ty >= 184 && ty <= 208) {
        // [B] UNDO (x: 36..120)
        if (tx >= 34 && tx <= 122) {
          this.undo();
          return;
        }
        // [R] RESET (x: 136..220)
        if (tx >= 134 && tx <= 222) {
          this.init();
          if (typeof APU !== 'undefined') APU.sfx('UI_OK');
          return;
        }
      }

      // Tile tap (single or multi-push)
      if (tx >= ox && tx < ox + 4 * sz && ty >= oy && ty < oy + 4 * sz) {
        const col = Math.floor((tx - ox) / sz);
        const row = Math.floor((ty - oy) / sz);
        if (col >= 0 && col < 4 && row >= 0 && row < 4) {
          this.pushTiles(col, row);
          return;
        }
      }
    }

    // Touch Drag Tracking (slow swipe/drag across tiles)
    if (PAD.pointer && PAD.pointer.down) {
      const px = PAD.pointer.x, py = PAD.pointer.y;
      if (!this.touchTracking) {
        if (px >= ox && px < ox + 4 * sz && py >= oy && py < oy + 4 * sz) {
          this.touchTracking = true;
          this.dragStartX = px;
          this.dragStartY = py;
          this.dragTileX = Math.floor((px - ox) / sz);
          this.dragTileY = Math.floor((py - oy) / sz);
        }
      } else {
        const ddx = px - this.dragStartX;
        const ddy = py - this.dragStartY;
        if (Math.hypot(ddx, ddy) > 16) {
          if (Math.abs(ddx) > Math.abs(ddy)) {
            if (this.dragTileY === ey) {
              if (ddx > 0 && this.dragTileX < ex) { this.pushTiles(this.dragTileX, this.dragTileY); }
              else if (ddx < 0 && this.dragTileX > ex) { this.pushTiles(this.dragTileX, this.dragTileY); }
            }
          } else {
            if (this.dragTileX === ex) {
              if (ddy > 0 && this.dragTileY < ey) { this.pushTiles(this.dragTileX, this.dragTileY); }
              else if (ddy < 0 && this.dragTileY > ey) { this.pushTiles(this.dragTileX, this.dragTileY); }
            }
          }
          this.touchTracking = false;
        }
      }
    } else {
      this.touchTracking = false;
    }
  },

  drawTile(g, px, py, val, gx, gy) {
    const x = Math.round(px);
    const y = Math.round(py);
    const tw = 32, th = 32;

    // Drop shadow under floating tile
    g.line(x + 2, y + th, x + tw, y + th, 0);
    g.line(x + tw, y + 2, x + tw, y + th, 0);

    // Dual-line 3D shading:
    // Outer highlight (top & left)
    g.line(x, y, x + tw - 1, y, 3);
    g.line(x, y, x, y + th - 1, 3);
    // Inner highlight (second bevel line)
    g.line(x + 1, y + 1, x + tw - 2, y + 1, 3);
    g.line(x + 1, y + 1, x + 1, y + th - 2, 3);

    // Outer shadow (bottom & right)
    g.line(x, y + th - 1, x + tw - 1, y + th - 1, 0);
    g.line(x + tw - 1, y, x + tw - 1, y + th - 1, 0);
    // Inner shadow (second bevel line)
    g.line(x + 1, y + th - 2, x + tw - 2, y + th - 2, 1);
    g.line(x + tw - 2, y + 1, x + tw - 2, y + th - 2, 1);

    // Tile face body
    g.rect(x + 2, y + 2, tw - 4, th - 4, 2);

    // Solved position check: val belongs at ((val-1)%4, Math.floor((val-1)/4))
    const isSolved = (gx === (val - 1) % 4 && gy === Math.floor((val - 1) / 4));
    if (isSolved) {
      // Subtle phosphor jewel indicator in top-right corner
      g.rect(x + tw - 7, y + 4, 3, 3, 3);
      g.px(x + tw - 6, y + 5, 0);
    }

    // Tactile engraved numbers with dual-contrast chisel effect
    const sVal = "" + val;
    const textW = (sVal.length * 5 - 1) * 2;
    const tx = Math.floor(x + (tw - textW) / 2);
    const ty = Math.floor(y + (th - 12) / 2);

    // Bottom lip highlight catches illumination
    g.text(sVal, tx, ty + 1, 3, 2);
    // Deep engraved dark numerals
    g.text(sVal, tx, ty, 0, 2);
  },

  drawButton(g, x, y, w, h, text, active = true) {
    const bgCol = active ? 1 : 0;
    const borderCol = active ? 2 : 1;
    const textCol = active ? 3 : 1;

    g.rect(x, y, w, h, bgCol);
    g.box(x, y, w, h, borderCol);
    if (active) {
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

  render(g) {
    g.clear(0);

    // Header HUD
    g.text("15-PUZZLE", 16, 8, 3);
    const timeSec = Math.floor(this.time);
    g.text("TIME: " + timeSec + "S", 102, 8, 2);
    g.textR("MOVES: " + this.moves, 240, 8, 3);

    const best = this.getBestMoves();
    const bestStr = best > 0 ? ("BEST: " + best) : "BEST: --";
    g.text(bestStr, 16, 18, 2);
    g.textR("4X4 TACTILE", 240, 18, 1);

    // Divider rule
    g.line(16, 26, 240, 26, 1);

    // Board Chassis
    const ox = 56, oy = 32, sz = 36;
    const bw = 4 * sz, bh = 4 * sz;

    // Chassis raised wooden frame
    g.box(ox - 4, oy - 4, bw + 8, bh + 8, 2);
    g.line(ox - 4, oy - 4, ox + bw + 3, oy - 4, 3);
    g.line(ox - 4, oy - 4, ox - 4, oy + bh + 3, 3);
    g.line(ox - 4, oy + bh + 3, ox + bw + 3, oy + bh + 3, 0);
    g.line(ox + bw + 3, oy - 4, ox + bw + 3, oy + bh + 3, 0);

    // Board floor recess
    g.rect(ox - 1, oy - 1, bw + 2, bh + 2, 0);

    // Grid divider channels
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        g.box(ox + i * sz, oy + j * sz, sz, sz, 1);
      }
    }

    // Empty slot drop-shadow frame
    let emptyPos = this.tiles.indexOf(0);
    if (this.animTimer > 0 && this.pendingTiles) {
      emptyPos = this.pendingTiles.indexOf(0);
    }
    const ex = emptyPos % 4, ey = Math.floor(emptyPos / 4);
    const sx = ox + ex * sz, sy = oy + ey * sz;
    g.dither(sx + 3, sy + 3, 30, 30, 0, 1);
    g.box(sx + 2, sy + 2, 32, 32, 1);
    g.line(sx + 2, sy + 2, sx + 33, sy + 2, 0);
    g.line(sx + 2, sy + 2, sx + 2, sy + 33, 0);

    // Sliding animation progress
    let ease = 1;
    const slidingValSet = new Set();
    if (this.animTimer > 0 && this.slidingTiles) {
      const t = Math.min(1, Math.max(0, 1 - this.animTimer / this.animDuration));
      ease = Math.sin(t * Math.PI / 2); // Smooth sinusoidal ease-out
      for (const s of this.slidingTiles) {
        slidingValSet.add(s.val);
      }
    }

    // Draw Static Tiles
    for (let i = 0; i < 16; i++) {
      const val = this.tiles[i];
      if (val === 0) continue;
      if (slidingValSet.has(val)) continue;
      const gx = i % 4, gy = Math.floor(i / 4);
      this.drawTile(g, ox + gx * sz + 2, oy + gy * sz + 2, val, gx, gy);
    }

    // Draw Sliding Tiles with interpolated positions
    if (this.animTimer > 0 && this.slidingTiles) {
      for (const s of this.slidingTiles) {
        const curX = s.fromX + (s.toX - s.fromX) * ease;
        const curY = s.fromY + (s.toY - s.fromY) * ease;
        this.drawTile(g, ox + curX * sz + 2, oy + curY * sz + 2, s.val, -1, -1);
      }
    }

    // Divider rule above buttons
    g.line(16, 182, 240, 182, 1);

    // On-Screen Touch Buttons
    const canUndo = this.history.length > 0;
    this.drawButton(g, 36, 186, 84, 20, "[B] UNDO", canUndo);
    this.drawButton(g, 136, 186, 84, 20, "[R] RESET", true);

    // Controls hints
    g.textC("[D-PAD / TAP / SWIPE] SLIDE TILES", 214, 2);
    g.textC("[B] UNDO       [SELECT] RESET", 226, 1);

    // Sparkling celebration particles
    for (const p of this.particles) {
      if (p.x >= 0 && p.x < 256 && p.y >= 0 && p.y < 240) {
        g.px(p.x, p.y, p.c);
      }
    }

    // Victory Modal Overlay
    if (this.won) {
      g.rect(26, 68, 204, 102, 0);
      g.rect(28, 70, 200, 98, 1);
      g.box(28, 70, 200, 98, 3);
      g.box(30, 72, 196, 94, 2);

      g.textC("★ PUZZLE SOLVED! ★", 80, 3);
      g.textC("MOVES: " + this.moves + "   TIME: " + Math.floor(this.time) + "S", 96, 2);
      if (best > 0) {
        g.textC("BEST RECORD: " + best + " MOVES", 110, 2);
      }

      this.drawButton(g, 52, 126, 152, 22, "[A] PLAY AGAIN ▶", true);
      g.textC("TAP SCREEN OR PRESS [A] TO RESTART", 154, 1);
    }
  }
};
