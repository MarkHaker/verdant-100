// js/cartridges/cart_018_nonogram.js
// ============================================================================
// Cartridge #018: NONOGRAM
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 18. NONOGRAM
CARTS[18] = {
  id: 18,
  name: "NONOGRAM",
  genre: 1,
  scoreLabel: "SOLVED",
  desc: "SOLVE 10 PICROSS LOGIC PUZZLES (5X5, 8X8, 10X10). [A] FILL, [B] CROSS.",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // 3D bevel corners
    g.px(x, y, 1); g.px(x + 31, y, 1);
    g.px(x, y + 31, 1); g.px(x + 31, y + 31, 1);

    // Mini Picross board: grid 4x4
    const gx = x + 10, gy = y + 10;
    g.box(gx - 1, gy - 1, 19, 19, 2);
    // Row clues (mini dots)
    g.px(gx - 4, gy + 2, 2); g.px(gx - 4, gy + 6, 2);
    g.px(gx - 4, gy + 10, 3); g.px(gx - 4, gy + 14, 2);
    // Col clues (mini dots)
    g.px(gx + 2, gy - 4, 2); g.px(gx + 6, gy - 4, 3);
    g.px(gx + 10, gy - 4, 3); g.px(gx + 14, gy - 4, 2);

    // Mini heart pattern inside
    g.rect(gx + 2, gy + 2, 3, 3, 3);
    g.rect(gx + 10, gy + 2, 3, 3, 3);
    g.rect(gx + 2, gy + 6, 11, 3, 3);
    g.rect(gx + 4, gy + 10, 7, 3, 3);
    g.rect(gx + 6, gy + 14, 3, 3, 3);
    // Mini X cross in top right
    g.line(gx + 12, gy + 12, gx + 15, gy + 15, 1);
    g.line(gx + 15, gy + 12, gx + 12, gy + 15, 1);
  },

  // 10 authentic, mathematically verified solvable Picross campaign puzzles
  PUZZLES: [
    // 1. HEART (5x5)
    {
      name: "HEART",
      w: 5, h: 5,
      grid: [
        [0,1,0,1,0],
        [1,1,1,1,1],
        [1,1,1,1,1],
        [0,1,1,1,0],
        [0,0,1,0,0]
      ]
    },

    // 2. SWORD (5x5)
    {
      name: "SWORD",
      w: 5, h: 5,
      grid: [
        [0,0,1,0,0],
        [0,0,1,0,0],
        [1,1,1,1,1],
        [0,0,1,0,0],
        [0,1,1,1,0]
      ]
    },

    // 3. DUCK (5x5)
    {
      name: "DUCK",
      w: 5, h: 5,
      grid: [
        [0,1,1,0,0],
        [1,1,1,0,0],
        [0,1,1,1,1],
        [0,1,1,1,1],
        [0,0,1,1,0]
      ]
    },

    // 4. CUP (8x8)
    {
      name: "CUP",
      w: 8, h: 8,
      grid: [
        [0,1,0,1,0,0,0,0],
        [0,0,1,0,0,0,0,0],
        [1,1,1,1,1,1,0,0],
        [1,1,1,1,1,1,1,0],
        [1,1,1,1,1,0,1,0],
        [1,1,1,1,1,1,1,0],
        [0,1,1,1,1,0,0,0],
        [0,0,1,1,0,0,0,0]
      ]
    },

    // 5. KEY (8x8)
    {
      name: "KEY",
      w: 8, h: 8,
      grid: [
        [0,1,1,1,0,0,0,0],
        [1,1,1,1,1,0,0,0],
        [1,1,0,1,1,0,0,0],
        [0,1,1,1,0,0,0,0],
        [0,0,1,0,0,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,0,1,0,0,0,0,0],
        [0,0,1,1,1,0,0,0]
      ]
    },

    // 6. STAR (8x8)
    {
      name: "STAR",
      w: 8, h: 8,
      grid: [
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,0,1,1,0,1,1],
        [1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,0],
        [0,1,1,0,0,1,1,0],
        [1,1,0,0,0,0,1,1]
      ]
    },

    // 7. SKULL (8x8)
    {
      name: "SKULL",
      w: 8, h: 8,
      grid: [
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,0,1,1,0,1,1],
        [1,1,0,1,1,0,1,1],
        [1,1,1,1,1,1,1,1],
        [0,1,1,0,0,1,1,0],
        [0,1,0,1,1,0,1,0],
        [0,1,1,1,1,1,1,0]
      ]
    },

    // 8. ANCHOR (10x10)
    {
      name: "ANCHOR",
      w: 10, h: 10,
      grid: [
        [0,0,0,0,1,1,0,0,0,0],
        [0,0,0,1,0,0,1,0,0,0],
        [0,0,0,0,1,1,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,0,0,1,1,0,0,0,0],
        [1,0,0,0,1,1,0,0,0,1],
        [1,0,0,0,1,1,0,0,0,1],
        [1,1,0,0,1,1,0,0,1,1],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,0,1,1,1,1,0,0,0]
      ]
    },

    // 9. MUSHROOM (10x10)
    {
      name: "MUSHROOM",
      w: 10, h: 10,
      grid: [
        [0,0,0,1,1,1,1,0,0,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,1,1,0,1,1,0,1,1,0],
        [1,1,0,0,1,1,0,0,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [0,0,1,0,0,0,0,1,0,0],
        [0,0,1,0,1,1,0,1,0,0],
        [0,0,1,0,1,1,0,1,0,0],
        [0,0,1,1,1,1,1,1,0,0]
      ]
    },

    // 10. GAMEPAD (10x10)
    {
      name: "GAMEPAD",
      w: 10, h: 10,
      grid: [
        [0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,1,0,0,0,0,1,0,1],
        [1,1,1,1,0,0,1,1,1,1],
        [1,0,1,0,1,1,0,1,0,1],
        [1,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,0],
        [0,1,1,0,0,0,0,1,1,0],
        [0,0,0,0,0,0,0,0,0,0]
      ]
    }
  ],

  init() {
    this.puzzleIdx = 0;
    this.loadPuzzle(0);
  },

  loadPuzzle(idx) {
    this.puzzleIdx = (idx + this.PUZZLES.length) % this.PUZZLES.length;
    const p = this.PUZZLES[this.puzzleIdx];
    this.solution = p.grid;
    this.gridW = p.w;
    this.gridH = p.h;
    this.grid = E1.create(p.w, p.h, 0); // 0 = empty, 1 = fill, 2 = cross
    this.cx = Math.floor(p.w / 2);
    this.cy = Math.floor(p.h / 2);
    this.time = 0;
    this.won = false;
    this.paintMode = 'FILL'; // 'FILL' or 'CROSS'
    this.particles = [];
    this.isDragging = false;
    this.dragVal = 0;
    this.lastDragX = -1;
    this.lastDragY = -1;

    // Precompute row clues
    this.rowClues = [];
    for (let y = 0; y < p.h; y++) {
      this.rowClues.push(this.getClues(this.solution[y]));
    }

    // Precompute col clues
    this.colClues = [];
    for (let x = 0; x < p.w; x++) {
      const col = [];
      for (let y = 0; y < p.h; y++) col.push(this.solution[y][x]);
      this.colClues.push(this.getClues(col));
    }
  },

  getClues(line) {
    const clues = [];
    let cur = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === 1) cur++;
      else if (cur > 0) { clues.push(cur); cur = 0; }
    }
    if (cur > 0) clues.push(cur);
    return clues.length > 0 ? clues : [0];
  },

  getLayout() {
    const p = this.PUZZLES[this.puzzleIdx];
    if (p.w === 5) return { ox: 92, oy: 68, sz: 20 };
    if (p.w === 8) return { ox: 86, oy: 60, sz: 16 };
    return { ox: 82, oy: 60, sz: 14 };
  },

  isRowFulfilled(y) {
    const p = this.PUZZLES[this.puzzleIdx];
    for (let x = 0; x < p.w; x++) {
      const isSol = this.solution[y][x] === 1;
      const isFill = E1.get(this.grid, x, y) === 1;
      if (isSol !== isFill) return false;
    }
    return true;
  },

  isColFulfilled(x) {
    const p = this.PUZZLES[this.puzzleIdx];
    for (let y = 0; y < p.h; y++) {
      const isSol = this.solution[y][x] === 1;
      const isFill = E1.get(this.grid, x, y) === 1;
      if (isSol !== isFill) return false;
    }
    return true;
  },

  getBestTime() {
    if (typeof SAVE === 'undefined' || !SAVE.getPersistent) return null;
    const per = SAVE.getPersistent(this.id);
    if (!per || !per.bestTimes) return null;
    return per.bestTimes[this.puzzleIdx] || null;
  },

  isPuzzleCompleted(idx) {
    if (typeof SAVE === 'undefined' || !SAVE.getPersistent) return false;
    const per = SAVE.getPersistent(this.id);
    if (!per || !per.completed) return false;
    return !!per.completed[idx];
  },

  getCompletedCount() {
    if (typeof SAVE === 'undefined' || !SAVE.getPersistent) return 0;
    const per = SAVE.getPersistent(this.id);
    if (!per || !per.completed) return 0;
    return Object.keys(per.completed).length;
  },

  checkWin() {
    if (this.won) return;
    const p = this.PUZZLES[this.puzzleIdx];
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.w; x++) {
        const isSol = this.solution[y][x] === 1;
        const isFill = E1.get(this.grid, x, y) === 1;
        if (isSol !== isFill) return;
      }
    }
    this.won = true;
    if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
    if (typeof PAD !== 'undefined') PAD.vibrate(40);

    // Save record
    if (typeof SAVE !== 'undefined') {
      const per = (SAVE.getPersistent && SAVE.getPersistent(this.id)) || { completed: {}, bestTimes: {} };
      per.completed = per.completed || {};
      per.bestTimes = per.bestTimes || {};
      per.completed[this.puzzleIdx] = true;
      const curSec = Math.max(1, Math.floor(this.time));
      if (!per.bestTimes[this.puzzleIdx] || curSec < per.bestTimes[this.puzzleIdx]) {
        per.bestTimes[this.puzzleIdx] = curSec;
      }
      const count = Object.keys(per.completed).length;
      if (SAVE.setPersistent) SAVE.setPersistent(this.id, per);
      if (SAVE.setScore) SAVE.setScore(this.id, count);
    }

    // Spawn celebration particle explosion
    const layout = this.getLayout();
    const cx = layout.ox + (p.w * layout.sz) / 2;
    const cy = layout.oy + (p.h * layout.sz) / 2;
    for (let i = 0; i < 48; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 20 + Math.random() * 85;
      this.particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.8 + Math.random() * 1.0,
        c: Math.random() < 0.6 ? 3 : 2
      });
    }
  },

  toggleCell(x, y, actionType) {
    // actionType: 1 = FILL, 2 = CROSS
    const cur = E1.get(this.grid, x, y);
    const nextVal = (actionType === 1 ? (cur === 1 ? 0 : 1) : (cur === 2 ? 0 : 2));
    E1.set(this.grid, x, y, nextVal);
    if (typeof APU !== 'undefined') APU.sfx('TICK');
    if (typeof PAD !== 'undefined') PAD.vibrate(8);
    this.checkWin();
  },

  update(dt) {
    if (!this.won) {
      this.time += dt;
    }

    // Update celebration particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    // Victory state handling
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('right')) {
        this.loadPuzzle(this.puzzleIdx + 1);
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        return;
      }
      if (PAD.hit('left')) {
        this.loadPuzzle(this.puzzleIdx - 1);
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        return;
      }
      if (PAD.hit('start')) {
        this.loadPuzzle(this.puzzleIdx);
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        return;
      }
      if (PAD.tapPos) {
        this.loadPuzzle(this.puzzleIdx + 1);
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        return;
      }
      return;
    }

    // D-Pad Navigation
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(this.gridW - 1, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(this.gridH - 1, this.cy + 1);

    // Swipes
    if (PAD.swipe === 'left') this.cx = Math.max(0, this.cx - 1);
    if (PAD.swipe === 'right') this.cx = Math.min(this.gridW - 1, this.cx + 1);
    if (PAD.swipe === 'up') this.cy = Math.max(0, this.cy - 1);
    if (PAD.swipe === 'down') this.cy = Math.min(this.gridH - 1, this.cy + 1);

    // Mode toggle via SELECT key
    if (PAD.hit('select')) {
      this.paintMode = (this.paintMode === 'FILL' ? 'CROSS' : 'FILL');
      if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
      if (typeof PAD !== 'undefined') PAD.vibrate(10);
    }

    // Button actions: [A] = Fill (or active mode), [B] = Cross
    if (PAD.hit('a')) {
      this.toggleCell(this.cx, this.cy, this.paintMode === 'CROSS' ? 2 : 1);
    }
    if (PAD.hit('b')) {
      this.toggleCell(this.cx, this.cy, 2);
    }

    // Direct Mobile Touch & Continuous Drag Painting
    const layout = this.getLayout();
    const ox = layout.ox, oy = layout.oy, sz = layout.sz;
    const bw = this.gridW * sz, bh = this.gridH * sz;

    if (PAD.pointer && PAD.pointer.down) {
      const px = PAD.pointer.x, py = PAD.pointer.y;
      if (px >= ox && px < ox + bw && py >= oy && py < oy + bh) {
        const tx = Math.floor((px - ox) / sz);
        const ty = Math.floor((py - oy) / sz);
        if (tx >= 0 && tx < this.gridW && ty >= 0 && ty < this.gridH) {
          this.cx = tx;
          this.cy = ty;
          const targetType = (this.paintMode === 'CROSS' ? 2 : 1);
          if (!this.isDragging) {
            this.isDragging = true;
            const cur = E1.get(this.grid, tx, ty);
            this.dragVal = (cur === targetType ? 0 : targetType);
            E1.set(this.grid, tx, ty, this.dragVal);
            this.lastDragX = tx;
            this.lastDragY = ty;
            if (typeof APU !== 'undefined') APU.sfx('TICK');
            if (typeof PAD !== 'undefined') PAD.vibrate(8);
            this.checkWin();
          } else if (tx !== this.lastDragX || ty !== this.lastDragY) {
            this.lastDragX = tx;
            this.lastDragY = ty;
            E1.set(this.grid, tx, ty, this.dragVal);
            if (typeof APU !== 'undefined') APU.sfx('TICK');
            if (typeof PAD !== 'undefined') PAD.vibrate(6);
            this.checkWin();
          }
        }
      }
    } else {
      this.isDragging = false;
      this.lastDragX = -1;
      this.lastDragY = -1;
    }

    // On-screen touch buttons (tapPos)
    if (PAD.tapPos) {
      const tx = PAD.tapPos.x, ty = PAD.tapPos.y;

      // Bottom control buttons: Y in [208, 236]
      if (ty >= 208 && ty <= 236) {
        // [◀] Prev puzzle
        if (tx >= 8 && tx <= 34) {
          this.loadPuzzle(this.puzzleIdx - 1);
          if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
          return;
        }
        // [MODE] Fill / Cross toggle
        if (tx >= 38 && tx <= 134) {
          this.paintMode = (this.paintMode === 'FILL' ? 'CROSS' : 'FILL');
          if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
          if (typeof PAD !== 'undefined') PAD.vibrate(10);
          return;
        }
        // [RESET] Clear board
        if (tx >= 138 && tx <= 218) {
          this.grid = E1.create(this.gridW, this.gridH, 0);
          this.time = 0;
          if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
          if (typeof PAD !== 'undefined') PAD.vibrate(15);
          return;
        }
        // [▶] Next puzzle
        if (tx >= 222 && tx <= 248) {
          this.loadPuzzle(this.puzzleIdx + 1);
          if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
          return;
        }
      }

      // Header click prev/next
      if (ty >= 2 && ty <= 20) {
        if (tx <= 60) {
          this.loadPuzzle(this.puzzleIdx - 1);
          if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
          return;
        }
        if (tx >= 80 && tx <= 130) {
          this.loadPuzzle(this.puzzleIdx + 1);
          if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
          return;
        }
      }
    }
  },

  render(g) {
    g.clear(0);
    const p = this.PUZZLES[this.puzzleIdx];
    const layout = this.getLayout();
    const ox = layout.ox, oy = layout.oy, sz = layout.sz;
    const w = p.w, h = p.h;

    // 1. Top Header bar
    g.rect(0, 0, 256, 17, 1);
    g.line(0, 17, 256, 17, 2);
    const isDone = this.isPuzzleCompleted(this.puzzleIdx);
    const pNumStr = (this.puzzleIdx + 1 < 10 ? "0" : "") + (this.puzzleIdx + 1);
    g.text((isDone ? "*" : "") + pNumStr + "/10 " + p.name + " (" + w + "X" + h + ")", 6, 6, 3);
    g.text("TIME:" + Math.floor(this.time) + "S", 136, 6, 2);
    const best = this.getBestTime();
    g.textR("BEST:" + (best ? best + "S" : "--"), 250, 6, best ? 3 : 2);

    // 2. Column Clues (above grid)
    for (let x = 0; x < w; x++) {
      const clues = this.colClues[x];
      const fulfilled = this.isColFulfilled(x);
      const colColor = fulfilled ? 1 : 2;
      for (let c = 0; c < clues.length; c++) {
        const str = "" + clues[c];
        const strW = str.length * 5 - 1;
        const clueX = ox + x * sz + Math.floor((sz - strW) / 2);
        const clueY = oy - (clues.length - c) * 8 - 2;
        g.text(str, clueX, clueY, colColor);
        if (fulfilled) {
          g.line(clueX - 1, clueY + 3, clueX + strW, clueY + 3, 1);
        }
      }
    }

    // 3. Row Clues (left of grid)
    for (let y = 0; y < h; y++) {
      const clues = this.rowClues[y];
      const fulfilled = this.isRowFulfilled(y);
      const colColor = fulfilled ? 1 : 2;
      const str = clues.join(" ");
      const strW = str.length * 5 - 1;
      const clueX = ox - 5;
      const clueY = oy + y * sz + Math.floor((sz - 6) / 2);
      g.textR(str, clueX, clueY, colColor);
      if (fulfilled) {
        g.line(clueX - strW, clueY + 3, clueX, clueY + 3, 1);
      }
    }

    // 4. Grid Board & Cells
    g.box(ox - 1, oy - 1, w * sz + 2, h * sz + 2, 2);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz + 1, sz + 1, 1);
        const val = E1.get(this.grid, x, y);
        if (val === 1) {
          g.rect(bx + 1, by + 1, sz - 1, sz - 1, 3);
        } else if (val === 2 && !this.won) {
          g.line(bx + 3, by + 3, bx + sz - 3, by + sz - 3, 2);
          g.line(bx + sz - 3, by + 3, bx + 3, by + sz - 3, 2);
        }
      }
    }

    // 5x5 dividing lines
    if (w >= 8) g.line(ox + 5 * sz, oy, ox + 5 * sz, oy + h * sz, 2);
    if (h >= 8) g.line(ox, oy + 5 * sz, ox + w * sz, oy + 5 * sz, 2);

    // 5. Cursor
    if (!this.won) {
      const curBx = ox + this.cx * sz, curBy = oy + this.cy * sz;
      g.box(curBx - 1, curBy - 1, sz + 2, sz + 2, 3);
    }

    // 6. Bottom Touch Controls (during gameplay)
    if (!this.won) {
      const by = 212, bh = 22;
      // [◀]
      g.rect(8, by, 26, bh, 0);
      g.box(8, by, 26, bh, 2);
      g.text("<", 19, by + 8, 3);

      // [MODE: FILL / CROSS]
      const isFill = this.paintMode === 'FILL';
      g.rect(38, by, 96, bh, isFill ? 1 : 0);
      g.box(38, by, 96, bh, isFill ? 3 : 2);
      g.text(isFill ? "[M] # FILL" : "[M] X MARK", 61, by + 8, isFill ? 3 : 2);

      // [RESET]
      g.rect(138, by, 80, bh, 0);
      g.box(138, by, 80, bh, 2);
      g.text("RESET", 166, by + 8, 2);

      // [▶]
      g.rect(222, by, 26, bh, 0);
      g.box(222, by, 26, bh, 2);
      g.text(">", 233, by + 8, 3);
    }

    // 7. Victory Celebration & Revealed Artwork Banner
    if (this.won) {
      for (let i = 0; i < this.particles.length; i++) {
        const pt = this.particles[i];
        g.px(pt.x | 0, pt.y | 0, pt.c);
      }
      g.rect(14, 186, 228, 48, 0);
      g.box(14, 186, 228, 48, 3);
      g.box(16, 188, 224, 44, 2);
      g.textC("PICTURE SOLVED: " + p.name + "!", 192, 3);
      const b = this.getBestTime();
      g.textC("TIME: " + Math.floor(this.time) + "S  BEST: " + (b ? b + "S" : "--"), 205, 2);
      g.textC("[A] / [TAP] NEXT PUZZLE", 218, 3);
    }
  }
};
