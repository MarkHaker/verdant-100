// js/cartridges/cart_014_lights_out.js
// ============================================================================
// Cartridge #014: LIGHTS OUT
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 14. LIGHTS OUT
CARTS[14] = {
  id: 14,
  name: "LIGHTS OUT",
  genre: 1,
  scoreLabel: "LEVELS",
  desc: "TOGGLE 5X5 LIGHTS WITH CROSS PATTERN. TURN OFF ALL ILLUMINATED CELLS! [B] UNDO, [R] RESET, TAP BULBS.",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    // Outer raised chassis bevel
    g.line(x, y, x + 31, y, 3);
    g.line(x, y, x, y + 31, 3);
    g.line(x + 31, y, x + 31, y + 31, 1);
    g.line(x, y + 31, x + 31, y + 31, 1);
    g.rect(x + 1, y + 1, 30, 30, 2);
    g.box(x + 2, y + 2, 28, 28, 1);

    // Glowing center phosphor lamp
    g.rect(x + 5, y + 5, 22, 22, 3);
    g.rect(x + 7, y + 7, 4, 2, 3);
    g.box(x + 9, y + 9, 14, 14, 2);
    g.line(x + 15, y + 8, x + 15, y + 23, 0);
    g.line(x + 16, y + 8, x + 16, y + 23, 0);
    g.line(x + 8, y + 15, x + 23, y + 15, 0);
    g.line(x + 8, y + 16, x + 23, y + 16, 0);
    g.rect(x + 14, y + 14, 4, 4, 3);
    g.px(x + 15, y + 15, 0);
  },

  // 15 Authentic, guaranteed solvable classic levels with exact mathematical PAR
  LEVELS: [
    { lvl: 1,  name: "FIRST SPARK",  par: 1,  map: ["00000","00100","01110","00100","00000"] },
    { lvl: 2,  name: "TWIN FLAMES",  par: 2,  map: ["00000","01010","11011","01010","00000"] },
    { lvl: 3,  name: "TRIAD GLOW",   par: 3,  map: ["00100","01110","01110","11011","01010"] },
    { lvl: 4,  name: "QUAD CORNERS", par: 4,  map: ["11011","10001","00000","10001","11011"] },
    { lvl: 5,  name: "IRON CROSS",   par: 5,  map: ["01110","10001","10101","10001","01110"] },
    { lvl: 6,  name: "HEXAGON",      par: 6,  map: ["01010","01010","11011","01010","01010"] },
    { lvl: 7,  name: "HOURGLASS",    par: 7,  map: ["10001","01110","00100","10101","11011"] },
    { lvl: 8,  name: "FORTRESS",     par: 8,  map: ["01010","10001","00000","10001","01010"] },
    { lvl: 9,  name: "PINWHEEL",     par: 9,  map: ["11001","01011","00100","11010","10011"] },
    { lvl: 10, name: "INVADER",      par: 10, map: ["10001","00100","10101","01010","00100"] },
    { lvl: 11, name: "LABYRINTH",    par: 11, map: ["10001","01110","10101","10101","10001"] },
    { lvl: 12, name: "CRYSTAL",      par: 12, map: ["10001","00100","00100","01010","01110"] },
    { lvl: 13, name: "VORTEX",       par: 13, map: ["01010","10101","00100","11111","11011"] },
    { lvl: 14, name: "ECLIPSE",      par: 14, map: ["00000","00000","01110","01010","11011"] },
    { lvl: 15, name: "OMEGA MATRIX", par: 15, map: ["10101","11011","11011","11011","10101"] }
  ],

  // GF(2) Linear Solver to determine exact minimum moves (PAR) for arbitrary 5x5 boards
  solve5x5(gridData) {
    const N = 25;
    const A = [];
    for (let i = 0; i < N; i++) {
      const r = new Uint8Array(N + 1);
      const x = i % 5, y = Math.floor(i / 5);
      for (let j = 0; j < N; j++) {
        const jx = j % 5, jy = Math.floor(j / 5);
        if (Math.abs(jx - x) + Math.abs(jy - y) <= 1 && (jx === x || jy === y)) {
          r[j] = 1;
        }
      }
      r[N] = gridData[i];
      A.push(r);
    }
    const pCol = [];
    let rw = 0;
    for (let col = 0; col < N && rw < N; col++) {
      let sel = -1;
      for (let r = rw; r < N; r++) {
        if (A[r][col] === 1) { sel = r; break; }
      }
      if (sel === -1) continue;
      const tmp = A[rw]; A[rw] = A[sel]; A[sel] = tmp;
      pCol[rw] = col;
      for (let r = 0; r < N; r++) {
        if (r !== rw && A[r][col] === 1) {
          for (let c = 0; c <= N; c++) A[r][c] ^= A[rw][c];
        }
      }
      rw++;
    }
    for (let r = rw; r < N; r++) {
      if (A[r][N] !== 0) return null; // Unsolvable
    }
    const fCols = [];
    const pSet = new Set(pCol.filter(x => x !== undefined));
    for (let c = 0; c < N; c++) {
      if (!pSet.has(c)) fCols.push(c);
    }
    let minM = 999;
    for (let mask = 0; mask < (1 << fCols.length); mask++) {
      const sol = new Uint8Array(N);
      for (let f = 0; f < fCols.length; f++) {
        if ((mask >> f) & 1) sol[fCols[f]] = 1;
      }
      for (let r = 0; r < rw; r++) {
        let val = A[r][N];
        for (let f = 0; f < fCols.length; f++) {
          if (A[r][fCols[f]] && sol[fCols[f]]) val ^= 1;
        }
        sol[pCol[r]] = val;
      }
      let cnt = 0;
      for (let i = 0; i < N; i++) if (sol[i]) cnt++;
      if (cnt < minM) minM = cnt;
    }
    return minM === 999 ? null : minM;
  },

  init() {
    this.cx = 2;
    this.cy = 2;
    this.levelIndex = 0; // 0..14 = Campaign 1..15, 15 = Random Challenge
    this.history = [];
    this.decay = new Float32Array(25);
    this.pulse = new Float32Array(25);
    this.particles = [];
    this.cursorBlink = 0;
    this.winTime = 0;
    this.earnedStars = 0;
    this.loadLevel(this.levelIndex);
  },

  loadLevel(idx) {
    this.levelIndex = idx;
    this.moves = 0;
    this.won = false;
    this.history = [];
    this.decay.fill(0);
    this.pulse.fill(0);
    this.particles = [];
    this.winTime = 0;

    if (idx < 15) {
      const lvl = this.LEVELS[idx];
      this.levelName = lvl.name;
      this.par = lvl.par;
      this.grid = E1.create(5, 5, 0);
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          const v = lvl.map[y][x] === '1' ? 1 : 0;
          E1.set(this.grid, x, y, v);
        }
      }
    } else {
      this.levelName = "RANDOM SCRAMBLE";
      this.grid = E1.create(5, 5, 0);
      this.generateRandomPuzzle();
    }
  },

  generateRandomPuzzle() {
    let attempts = 0;
    while (attempts < 50) {
      attempts++;
      this.grid.data.fill(0);
      const numMoves = 5 + Math.floor(Math.random() * 5);
      const pressed = new Set();
      while (pressed.size < numMoves) {
        pressed.add(Math.floor(Math.random() * 25));
      }
      for (const p of pressed) {
        this.rawToggle(p % 5, Math.floor(p / 5));
      }
      const lit = this.grid.data.filter(v => v === 1).length;
      if (lit >= 4 && lit <= 21) {
        const par = this.solve5x5(this.grid.data);
        if (par !== null && par > 0) {
          this.par = par;
          return;
        }
      }
    }
    // Fallback: guaranteed solvable 3-move scramble
    this.grid.data.fill(0);
    this.rawToggle(1, 1);
    this.rawToggle(3, 1);
    this.rawToggle(2, 3);
    this.par = this.solve5x5(this.grid.data) || 3;
  },

  rawToggle(x, y) {
    const dirs = [[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (E1.inBounds(this.grid, nx, ny)) {
        E1.set(this.grid, nx, ny, E1.get(this.grid, nx, ny) ? 0 : 1);
      }
    }
  },

  press(x, y) {
    if (this.won) return;

    // Snapshot for deep undo
    this.history.push({
      grid: new Uint8Array(this.grid.data),
      moves: this.moves
    });

    const dirs = [[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (E1.inBounds(this.grid, nx, ny)) {
        const cur = E1.get(this.grid, nx, ny);
        const next = cur ? 0 : 1;
        E1.set(this.grid, nx, ny, next);
        const idx = ny * 5 + nx;
        if (cur === 1 && next === 0) {
          this.decay[idx] = 1.0;
        }
        this.pulse[idx] = 1.0;
      }
    }

    this.moves++;
    if (typeof APU !== 'undefined') APU.sfx('HIT');

    // Check win condition
    if (this.grid.data.every(v => v === 0)) {
      this.won = true;
      this.winTime = 0;
      this.earnedStars = this.moves <= this.par ? 3 : (this.moves <= this.par + 2 ? 2 : 1);
      if (typeof APU !== 'undefined') APU.sfx('LEVELUP');

      // Persistence
      if (typeof SAVE !== 'undefined') {
        const per = SAVE.getPersistent(this.id) || { stars: {}, completed: 0 };
        per.stars = per.stars || {};
        if (this.levelIndex < 15) {
          const lvlKey = String(this.levelIndex + 1);
          per.stars[lvlKey] = Math.max(per.stars[lvlKey] || 0, this.earnedStars);
          const compCount = Object.keys(per.stars).filter(k => {
            const num = parseInt(k, 10);
            return num >= 1 && num <= 15 && per.stars[k] > 0;
          }).length;
          per.completed = compCount;
          SAVE.setPersistent(this.id, per);
          SAVE.setScore(this.id, compCount);
        }
      }

      this.spawnWinParticles();
    }
  },

  undo() {
    if (this.history.length === 0) {
      if (typeof APU !== 'undefined') APU.sfx('DENY');
      return false;
    }
    const prev = this.history.pop();
    for (let i = 0; i < 25; i++) {
      const cur = this.grid.data[i];
      const nxt = prev.grid[i];
      if (cur === 1 && nxt === 0) {
        this.decay[i] = 1.0;
      }
      if (cur !== nxt) {
        this.pulse[i] = 0.8;
      }
      this.grid.data[i] = nxt;
    }
    this.moves = prev.moves;
    this.won = false;
    if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
    return true;
  },

  resetLevel() {
    this.loadLevel(this.levelIndex);
    if (typeof APU !== 'undefined') APU.sfx('UI_OK');
  },

  prevLevel() {
    const total = 16;
    this.levelIndex = (this.levelIndex - 1 + total) % total;
    this.loadLevel(this.levelIndex);
    if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
  },

  nextLevel() {
    const total = 16;
    this.levelIndex = (this.levelIndex + 1) % total;
    this.loadLevel(this.levelIndex);
    if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
  },

  spawnWinParticles() {
    this.particles = [];
    for (let i = 0; i < 36; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 30 + Math.random() * 80;
      this.particles.push({
        x: 128 + (Math.random() - 0.5) * 60,
        y: 102 + (Math.random() - 0.5) * 60,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 25,
        life: 0.9 + Math.random() * 0.7,
        c: Math.random() < 0.65 ? 3 : 2
      });
    }
  },

  getTotalStars() {
    if (typeof SAVE === 'undefined') return 0;
    const per = SAVE.getPersistent(this.id);
    if (!per || !per.stars) return 0;
    let total = 0;
    for (let l = 1; l <= 15; l++) {
      total += (per.stars[String(l)] || 0);
    }
    return total;
  },

  getStarsForLevel(lvlNum) {
    if (typeof SAVE === 'undefined') return 0;
    const per = SAVE.getPersistent(this.id);
    if (!per || !per.stars) return 0;
    return per.stars[String(lvlNum)] || 0;
  },

  update(dt) {
    // Timers & animations (proportional to dt, completely speed-agnostic)
    this.cursorBlink += dt * 4.0;
    for (let i = 0; i < 25; i++) {
      if (this.decay[i] > 0) this.decay[i] = Math.max(0, this.decay[i] - dt * 3.5);
      if (this.pulse[i] > 0) this.pulse[i] = Math.max(0, this.pulse[i] - dt * 6.0);
    }

    // Particle physics
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 65 * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    if (this.won) {
      this.winTime += dt;
      if (PAD.hit('a') || PAD.hit('start')) {
        this.nextLevel();
        return;
      }
      if (PAD.hit('b')) {
        this.undo();
        return;
      }
      if (PAD.hit('select')) {
        this.resetLevel();
        return;
      }
      if (PAD.tapPos) {
        const tx = PAD.tapPos.x, ty = PAD.tapPos.y;
        // Check undo & reset touch targets while on win screen
        if (ty >= 180 && ty <= 208) {
          if (tx >= 98 && tx <= 170) { this.undo(); return; }
          if (tx >= 176 && tx <= 248) { this.resetLevel(); return; }
        }
        this.nextLevel();
        return;
      }
      return;
    }

    // Swipe navigation between levels
    if (PAD.swipe === 'left') { this.nextLevel(); return; }
    if (PAD.swipe === 'right') { this.prevLevel(); return; }

    // Physical Button Controls
    if (PAD.hit('left'))  { this.cx = Math.max(0, this.cx - 1); if (typeof APU !== 'undefined') APU.sfx('UI_MOVE'); }
    if (PAD.hit('right')) { this.cx = Math.min(4, this.cx + 1); if (typeof APU !== 'undefined') APU.sfx('UI_MOVE'); }
    if (PAD.hit('up'))    { this.cy = Math.max(0, this.cy - 1); if (typeof APU !== 'undefined') APU.sfx('UI_MOVE'); }
    if (PAD.hit('down'))  { this.cy = Math.min(4, this.cy + 1); if (typeof APU !== 'undefined') APU.sfx('UI_MOVE'); }

    if (PAD.hit('a')) {
      this.press(this.cx, this.cy);
      return;
    }

    if (PAD.hit('b')) {
      this.undo();
      return;
    }

    if (PAD.hit('select')) {
      this.resetLevel();
      return;
    }

    // Direct Touch & Tap Handling
    if (PAD.tapPos) {
      const tx = PAD.tapPos.x, ty = PAD.tapPos.y;

      // 1. Top bar level quick jump arrows
      if (ty >= 2 && ty <= 22) {
        if (tx >= 78 && tx <= 104) { this.prevLevel(); return; }
        if (tx >= 152 && tx <= 178) { this.nextLevel(); return; }
      }

      // 2. Direct Bulb Tap: cell bounds ox = 58, oy = 32, sz = 28
      const ox = 58, oy = 32, sz = 28;
      if (tx >= ox && tx < ox + 5 * sz && ty >= oy && ty < oy + 5 * sz) {
        const col = Math.floor((tx - ox) / sz);
        const row = Math.floor((ty - oy) / sz);
        if (col >= 0 && col < 5 && row >= 0 && row < 5) {
          this.cx = col;
          this.cy = row;
          this.press(col, row);
          return;
        }
      }

      // 3. Bottom Button Row: y = 180..208
      if (ty >= 180 && ty <= 208) {
        // [◀] Previous Level: tx: 8..48
        if (tx >= 8 && tx <= 48) {
          this.prevLevel();
          return;
        }
        // [▶] Next Level: tx: 52..92
        if (tx >= 52 && tx <= 92) {
          this.nextLevel();
          return;
        }
        // [B] UNDO: tx: 98..170
        if (tx >= 98 && tx <= 170) {
          this.undo();
          return;
        }
        // [R] RESET: tx: 176..248
        if (tx >= 176 && tx <= 248) {
          this.resetLevel();
          return;
        }
      }
    }
  },

  render(g) {
    g.clear(0);

    // ==========================================
    // TOP HEADER
    // ==========================================
    g.text("LIGHTS OUT", 8, 4, 3);

    // Level Indicator with touch arrows [◀] [▶]
    const lvlStr = this.levelIndex < 15 ? ("LVL " + (this.levelIndex + 1) + "/15") : "LVL RND";
    g.text("◀", 88, 4, 2);
    g.text(lvlStr, 100, 4, 3);
    g.text("▶", 164, 4, 2);

    // Star counter: total stars / 45
    const totalStars = this.getTotalStars();
    g.textR("★ " + totalStars + "/45", 248, 4, 2);

    // Subheader: Level name & Moves vs Par & Star rating preview
    const nameStr = this.levelIndex < 15 ? ("#" + (this.levelIndex + 1) + " " + this.levelName) : this.levelName;
    g.text(nameStr, 8, 15, 2);

    const movesStr = "MOVES: " + this.moves;
    const parStr = "PAR: " + this.par;
    g.text(movesStr, 126, 15, 3);
    g.text(parStr, 184, 15, 2);

    // Dynamic Star Rating Preview
    const currentStars = this.moves <= this.par ? 3 : (this.moves <= this.par + 2 ? 2 : 1);
    for (let s = 0; s < 3; s++) {
      g.text("★", 230 + s * 6, 15, s < currentStars ? 3 : 1);
    }

    // Divider rule
    g.line(8, 25, 248, 25, 1);

    // ==========================================
    // 5X5 3D TACTILE LAMP GRID
    // ==========================================
    const ox = 58, oy = 32, sz = 28;

    // Background panel bezel
    g.rect(ox - 3, oy - 3, 146, 146, 1);
    g.line(ox - 4, oy - 4, ox + 142, oy - 4, 2);
    g.line(ox - 4, oy - 4, ox - 4, oy + 142, 2);
    g.line(ox + 143, oy - 4, ox + 143, oy + 143, 0);
    g.line(ox - 4, oy + 143, ox + 143, oy + 143, 0);

    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const idx = y * 5 + x;
        const on = E1.get(this.grid, x, y);
        const bx = ox + x * sz;
        const by = oy + y * sz;
        const isCursor = (x === this.cx && y === this.cy);
        const dec = this.decay[idx];
        const pls = this.pulse[idx];

        this.renderBulb(g, bx, by, on, isCursor, dec, pls);
      }
    }

    // Divider rule above buttons
    g.line(8, 180, 248, 180, 1);

    // ==========================================
    // BOTTOM ON-SCREEN TOUCH BUTTONS
    // ==========================================
    // Button 1: [◀] PREV LEVEL (x: 8..48, y: 184..202)
    this.drawButton(g, 8, 184, 40, 18, "◀ LVL", false, false);

    // Button 2: [▶] NEXT LEVEL (x: 52..92, y: 184..202)
    this.drawButton(g, 52, 184, 40, 18, "LVL ▶", false, false);

    // Button 3: [B] UNDO (x: 98..170, y: 184..202)
    const canUndo = this.history.length > 0;
    this.drawButton(g, 98, 184, 72, 18, "[B] UNDO", canUndo, false);

    // Button 4: [R] RESET (x: 176..248, y: 184..202)
    this.drawButton(g, 176, 184, 72, 18, "[R] RESET", true, false);

    // Footer Hint
    g.textC("[D-PAD/TAP] MOVE & TOGGLE   [B] UNDO   [R] RESET", 209, 2);
    g.textC("TURN OFF ALL 25 LAMPS TO WIN!", 220, 1);

    // Twinkling particles
    for (const p of this.particles) {
      if (p.x >= 0 && p.x < 256 && p.y >= 0 && p.y < 240) {
        g.px(p.x, p.y, p.c);
      }
    }

    // ==========================================
    // VICTORY MODAL OVERLAY
    // ==========================================
    if (this.won) {
      this.renderWinModal(g);
    }
  },

  renderBulb(g, bx, by, on, isCursor, decay, pulse) {
    const dOff = pulse > 0.1 ? 1 : 0;

    if (on === 1) {
      // ----------------------------------------
      // LIT BULB: Glowing Phosphor Dome & Bezel
      // ----------------------------------------
      // Subtle ambient phosphor glow aura
      g.line(bx + 3, by, bx + 24, by, 1);
      g.line(bx + 3, by + 27, bx + 24, by + 27, 1);
      g.line(bx, by + 3, bx, by + 24, 1);
      g.line(bx + 27, by + 3, bx + 27, by + 24, 1);

      // Raised 3D Bezel highlight & shadow
      g.line(bx + 1, by + 1, bx + 26, by + 1, 3); // Top highlight
      g.line(bx + 1, by + 1, bx + 1, by + 26, 3); // Left highlight
      g.line(bx + 26, by + 1, bx + 26, by + 26, 1); // Right shadow
      g.line(bx + 1, by + 26, bx + 26, by + 26, 1); // Bottom shadow

      // Outer bezel ring
      g.rect(bx + 2, by + 2, 24, 24, 2);
      g.box(bx + 3, by + 3, 22, 22, 1);

      // Glowing phosphor dome
      g.rect(bx + 4, by + 4 + dOff, 20, 20 - dOff, 3);

      // Specular gloss glint
      g.rect(bx + 6, by + 6 + dOff, 4, 2, 3);
      g.px(bx + 6, by + 8 + dOff, 3);

      // Distinct Active Filament Structure
      g.box(bx + 9, by + 9 + dOff, 10, 10, 2);
      g.line(bx + 13, by + 8 + dOff, bx + 13, by + 19 + dOff, 0);
      g.line(bx + 14, by + 8 + dOff, bx + 14, by + 19 + dOff, 0);
      g.line(bx + 8, by + 13 + dOff, bx + 19, by + 13 + dOff, 0);
      g.line(bx + 8, by + 14 + dOff, bx + 19, by + 14 + dOff, 0);

      // Bright glowing filament core
      g.rect(bx + 11, by + 11 + dOff, 6, 6, 3);
      g.px(bx + 13, by + 13 + dOff, 0);
      g.px(bx + 14, by + 14 + dOff, 0);
    } else {
      // ----------------------------------------
      // UNLIT BULB / PHOSPHOR DECAY
      // ----------------------------------------
      if (decay > 0.05) {
        // Phosphor Afterglow Decay
        const colDome = decay > 0.5 ? 2 : 1;
        const colCenter = decay > 0.5 ? 3 : 2;

        g.rect(bx + 2, by + 2, 24, 24, 0);
        g.box(bx + 2, by + 2, 24, 24, 1);
        g.rect(bx + 4, by + 4, 20, 20, colDome);
        g.rect(bx + 10, by + 10, 8, 8, colCenter);
        g.px(bx + 13, by + 13, 0);
        g.px(bx + 14, by + 14, 0);
      } else {
        // Dark Sunken Bezel
        g.line(bx + 1, by + 1, bx + 26, by + 1, 0); // Top inward shadow
        g.line(bx + 1, by + 1, bx + 1, by + 26, 0); // Left inward shadow
        g.line(bx + 26, by + 1, bx + 26, by + 26, 1); // Right rim
        g.line(bx + 1, by + 26, bx + 26, by + 26, 1); // Bottom rim

        // Sunken interior well
        g.rect(bx + 2, by + 2, 24, 24, 0);
        g.rect(bx + 4, by + 4, 20, 20, 1);
        g.rect(bx + 6, by + 6, 16, 16, 0);

        // Off-state cold filament wire
        g.line(bx + 10, by + 14, bx + 17, by + 14, 1);
        g.line(bx + 14, by + 10, bx + 14, by + 17, 1);
        g.px(bx + 13, by + 13, 2);
        g.px(bx + 14, by + 14, 2);
      }
    }

    // ------------------------------------------
    // CURSOR RETICLE: Corner Brackets
    // ------------------------------------------
    if (isCursor) {
      const cCol = (Math.floor(this.cursorBlink) % 2 === 0) ? 3 : 2;
      // Top-Left
      g.line(bx - 1, by - 1, bx + 6, by - 1, cCol);
      g.line(bx - 1, by - 1, bx - 1, by + 6, cCol);
      // Top-Right
      g.line(bx + 28, by - 1, bx + 21, by - 1, cCol);
      g.line(bx + 28, by - 1, bx + 28, by + 6, cCol);
      // Bottom-Left
      g.line(bx - 1, by + 28, bx + 6, by + 28, cCol);
      g.line(bx - 1, by + 28, bx - 1, by + 21, cCol);
      // Bottom-Right
      g.line(bx + 28, by + 28, bx + 21, by + 28, cCol);
      g.line(bx + 28, by + 28, bx + 28, by + 21, cCol);
    }
  },

  drawButton(g, x, y, w, h, text, active = true, pressed = false) {
    const bgCol = pressed ? 0 : (active ? 1 : 0);
    const borderCol = active ? 2 : 1;
    const textCol = active ? 3 : 1;

    g.rect(x, y, w, h, bgCol);
    g.box(x, y, w, h, borderCol);
    if (active) {
      g.line(x + 1, y + 1, x + w - 2, y + 1, 3);
      g.line(x + 1, y + 1, x + 1, y + h - 2, 2);
    }
    const textW = text.length * 5 - 1;
    const tx = Math.floor(x + (w - textW) / 2);
    const ty = Math.floor(y + (h - 6) / 2);
    g.text(text, tx, ty, textCol);
  },

  renderWinModal(g) {
    // Backdrop shadow
    g.rect(26, 46, 204, 136, 0);
    // Double 3D Frame
    g.rect(28, 48, 200, 132, 1);
    g.box(28, 48, 200, 132, 3);
    g.box(30, 50, 196, 128, 2);

    // Celebration title
    g.textC("★ ALL LIGHTS OUT! ★", 56, 3);

    const subTitle = this.levelIndex < 15
      ? ("LEVEL " + (this.levelIndex + 1) + " CLEARED!")
      : "RANDOM CHALLENGE WON!";
    g.textC(subTitle, 70, 2);

    // 3 Big Stars
    const starStr = this.earnedStars === 3 ? "★★★" : (this.earnedStars === 2 ? "★★·" : "★··");
    g.textC(starStr, 86, 3, 2);

    // Performance appraisal
    let ratingStr = "";
    if (this.earnedStars === 3) {
      ratingStr = "PERFECT PAR! (" + this.moves + "/" + this.par + " MOVES)";
    } else if (this.earnedStars === 2) {
      ratingStr = "GREAT SOLVE! (" + this.moves + "/" + this.par + " MOVES)";
    } else {
      ratingStr = "PUZZLE CLEARED IN " + this.moves + " MOVES!";
    }
    g.textC(ratingStr, 112, 3);

    // On-screen Next Level Action Button
    g.rect(52, 128, 152, 22, 2);
    g.box(52, 128, 152, 22, 3);
    g.line(53, 129, 202, 129, 3);

    const btnLabel = this.levelIndex < 14
      ? "NEXT LEVEL ▶"
      : (this.levelIndex === 14 ? "RANDOM MODE ▶" : "NEW RANDOM PUZZLE ▶");
    g.textC(btnLabel, 136, 3);

    g.textC("PRESS [A] OR TAP ANYWHERE TO ADVANCE", 158, 1);
  }
};
