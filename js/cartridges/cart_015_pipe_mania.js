// js/cartridges/cart_015_pipe_mania.js
// ============================================================================
// Cartridge #015: PIPE MANIA
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 15. PIPE MANIA
CARTS[15] = {
  id: 15, name: "PIPE MANIA", genre: 1, scoreLabel: "FLOW",
  desc: "ROTATE PIPES WITH [A]. CONNECT WATER VALVE (0,0) TO DRAIN (5,5)!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 4, y + 14, 14, 4, 3);
    g.rect(x + 14, y + 14, 4, 14, 3);
  },
  PIPES: [
    [1, 0, 1, 0], // 0: | (N, S)
    [0, 1, 0, 1], // 1: - (E, W)
    [0, 1, 1, 0], // 2: ┌ (E, S)
    [0, 0, 1, 1], // 3: ┐ (S, W)
    [1, 0, 0, 1], // 4: ┘ (N, W)
    [1, 1, 0, 0]  // 5: └ (N, E)
  ],
  init() {
    this.grid = E1.create(6, 6, 0);
    for (let i = 0; i < 36; i++) {
      this.grid.data[i] = Math.floor(Math.random() * 6);
    }
    this.cx = 0; this.cy = 0;
    this.waterTime = 15;
    this.flowing = false;
    this.flowPath = [];
    this.flowStep = 0;
    this.flowTimer = 0;
    this.score = 0;
    this.over = false;
    this.won = false;
  },
  tracePath() {
    const path = [];
    let curX = 0, curY = 0;
    let inDir = 3; // coming from West into (0,0)

    while (true) {
      path.push([curX, curY]);
      const pType = E1.get(this.grid, curX, curY);
      const openings = this.PIPES[pType];
      if (!openings || !openings[inDir]) {
        return { path, success: false };
      }
      let outDir = -1;
      for (let d = 0; d < 4; d++) {
        if (d !== inDir && openings[d]) { outDir = d; break; }
      }
      if (outDir === -1) return { path, success: false };

      if (curX === 5 && curY === 5 && outDir === 1) {
        return { path, success: true };
      }

      const dx = outDir === 1 ? 1 : (outDir === 3 ? -1 : 0);
      const dy = outDir === 2 ? 1 : (outDir === 0 ? -1 : 0);
      const nx = curX + dx, ny = curY + dy;
      if (nx < 0 || nx >= 6 || ny < 0 || ny >= 6) {
        return { path, success: false };
      }
      if (path.some(pt => pt[0] === nx && pt[1] === ny)) {
        return { path, success: false };
      }
      curX = nx;
      curY = ny;
      inDir = (outDir + 2) % 4;
    }
  },
  startFlow() {
    this.flowing = true;
    this.flowPlan = this.tracePath();
    this.flowPath = [];
    this.flowStep = 0;
  },
  update(dt) {
    if (this.over || this.won) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    if (!this.flowing) {
      this.waterTime -= dt;
      if (this.waterTime <= 0 || PAD.hit('b')) {
        this.startFlow();
        APU.sfx('SPLASH');
      }
      if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
      if (PAD.hit('right')) this.cx = Math.min(5, this.cx + 1);
      if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
      if (PAD.hit('down')) this.cy = Math.min(5, this.cy + 1);
      if (PAD.hit('a')) {
        const cur = E1.get(this.grid, this.cx, this.cy);
        E1.set(this.grid, this.cx, this.cy, (cur + 1) % 6);
        APU.sfx('TICK');
      }
    } else {
      this.flowTimer += dt;
      if (this.flowTimer >= 0.18) {
        this.flowTimer = 0;
        if (this.flowStep < this.flowPlan.path.length) {
          this.flowPath.push(this.flowPlan.path[this.flowStep]);
          this.flowStep++;
          this.score += 20;
          APU.sfx('TICK');
        } else {
          if (this.flowPlan.success) {
            this.won = true;
            this.score += 200;
            APU.sfx('LEVELUP');
            SAVE.setScore(this.id, this.score);
          } else {
            this.over = true;
            APU.sfx('BOOM');
            SAVE.setScore(this.id, this.score);
          }
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("PIPE MANIA", 14, 12, 3);
    if (!this.flowing) {
      g.textR("VALVE: " + Math.ceil(this.waterTime) + "S [B] FLUSH", 244, 12, 3);
    } else {
      g.textR("FLOWING...", 244, 12, 2);
    }

    const ox = 50, oy = 32, sz = 26;
    g.text("▶", ox - 10, oy + 8, 3);
    g.text("▶", ox + 6 * sz + 3, oy + 5 * sz + 8, 3);

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        const p = E1.get(this.grid, x, y);
        const isWet = this.flowPath.some(pt => pt[0] === x && pt[1] === y);
        const col = isWet ? 3 : 2;
        const op = this.PIPES[p];

        const mx = bx + 13, my = by + 13;
        g.rect(mx - 3, my - 3, 6, 6, col);
        if (op[0]) g.rect(mx - 3, by, 6, 14, col);
        if (op[1]) g.rect(mx, my - 3, 14, 6, col);
        if (op[2]) g.rect(mx - 3, my, 6, 14, col);
        if (op[3]) g.rect(bx, my - 3, 14, 6, col);

        if (!this.flowing && x === this.cx && y === this.cy) {
          g.box(bx - 1, by - 1, sz + 1, sz + 1, 3);
        }
      }
    }

    if (this.won) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("AQUEDUCT SUCCESS!", 110, 3);
      g.textC("[A] PLAY AGAIN", 124, 2);
    } else if (this.over) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("PIPE LEAKED! FAILED", 110, 3);
      g.textC("[A] TO RETRY", 124, 2);
    }
  }
};
