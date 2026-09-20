// js/cartridges/cart_015_pipe_mania.js
// ============================================================================
// Cartridge #015: PIPE MANIA
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 15. PIPE MANIA
CARTS[15] = {
  id: 15,
  name: "PIPE MANIA",
  genre: 1,
  scoreLabel: "FLOW",
  desc: "ROTATE PIPES TO CHANNEL WATER FROM VALVE (0,0) TO DRAIN! TAP TILES OR USE [A]/[B].",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Outer corner rivets
    g.px(x + 2, y + 2, 3); g.px(x + 29, y + 2, 3);
    g.px(x + 2, y + 29, 3); g.px(x + 29, y + 29, 3);

    // Cross pipe with metallic casing
    g.rect(x + 10, y + 4, 12, 24, 2);
    g.rect(x + 4, y + 10, 24, 12, 2);
    // Couplings
    g.rect(x + 9, y + 3, 14, 2, 3);
    g.rect(x + 9, y + 27, 14, 2, 3);
    g.rect(x + 3, y + 9, 2, 14, 3);
    g.rect(x + 27, y + 9, 2, 14, 3);

    // Flowing phosphor fluid inside
    g.rect(x + 13, y + 4, 6, 24, 3);
    g.rect(x + 4, y + 13, 24, 6, 3);
    // Center glow
    g.rect(x + 12, y + 12, 8, 8, 3);
    g.px(x + 15, y + 15, 0);
  },

  // 11 Physical Pipe Archetypes [North, East, South, West]
  // 0: North, 1: East, 2: South, 3: West
  PIPES: [
    [1, 0, 1, 0], // 0: | (Vertical straight)
    [0, 1, 0, 1], // 1: - (Horizontal straight)
    [0, 1, 1, 0], // 2: ┌ (Elbow East-South)
    [0, 0, 1, 1], // 3: ┐ (Elbow South-West)
    [1, 0, 0, 1], // 4: ┘ (Elbow North-West)
    [1, 1, 0, 0], // 5: └ (Elbow North-East)
    [1, 1, 1, 1], // 6: + (Cross 4-way)
    [0, 1, 1, 1], // 7: ┬ (T-junction East-South-West)
    [1, 0, 1, 1], // 8: ┤ (T-junction North-South-West)
    [1, 1, 0, 1], // 9: ┴ (T-junction North-East-West)
    [1, 1, 1, 0]  // 10: ├ (T-junction North-East-South)
  ],

  // Precise 90-degree clockwise rotation map preserving physical pipe geometry
  ROTATE_MAP: [
    1,  // 0 (|) -> 1 (-)
    0,  // 1 (-) -> 0 (|)
    3,  // 2 (┌) -> 3 (┐)
    4,  // 3 (┐) -> 4 (┘)
    5,  // 4 (┘) -> 5 (└)
    2,  // 5 (└) -> 2 (┌)
    6,  // 6 (+) -> 6 (+)
    8,  // 7 (┬) -> 8 (┤)
    9,  // 8 (┤) -> 9 (┴)
    10, // 9 (┴) -> 10 (├)
    7   // 10 (├) -> 7 (┬)
  ],

  // 10 Progressive Campaign Levels
  LEVELS: [
    { w: 6, h: 6, time: 22, minPath: 8,  name: "WELLSPRING" },
    { w: 6, h: 6, time: 19, minPath: 10, name: "PRESSURE VALVE" },
    { w: 6, h: 6, time: 16, minPath: 12, name: "AQUEDUCT" },
    { w: 7, h: 7, time: 18, minPath: 13, name: "BOILER ROOM" },
    { w: 7, h: 7, time: 16, minPath: 15, name: "TURBINE MAZE" },
    { w: 7, h: 7, time: 14, minPath: 17, name: "COOLING SYSTEM" },
    { w: 7, h: 7, time: 12, minPath: 19, name: "HYDRO DOCK" },
    { w: 8, h: 8, time: 15, minPath: 20, name: "SEWER COMPLEX" },
    { w: 8, h: 8, time: 13, minPath: 22, name: "REACTOR CORE" },
    { w: 8, h: 8, time: 11, minPath: 25, name: "OMEGA CONDUIT" }
  ],

  btnX: 182,
  btnY: 5,
  btnW: 68,
  btnH: 15,
  score: 0,
  bestScore: 0,

  init() {
    this.score = 0;
    this.level = 1;
    this.bestScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;
    this.btnX = 182;
    this.btnY = 5;
    this.btnW = 68;
    this.btnH = 15;
    this.startLevel(1);
  },

  startLevel(lvl) {
    this.level = Math.max(1, Math.min(10, lvl));
    this.score = this.score || 0;
    this.bestScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : (this.bestScore || 0);
    this.btnX = 182;
    this.btnY = 5;
    this.btnW = 68;
    this.btnH = 15;
    const cfg = this.LEVELS[this.level - 1];
    this.gridW = cfg.w;
    this.gridH = cfg.h;
    this.waterTime = cfg.time;
    this.initialWaterTime = cfg.time;

    // Tile sizing & centering
    this.sz = cfg.w === 6 ? 26 : (cfg.w === 7 ? 23 : 20);
    this.ox = Math.floor((256 - this.gridW * this.sz) / 2);
    this.oy = Math.floor(32 + (160 - this.gridH * this.sz) / 2);

    this.cx = 0;
    this.cy = 0;
    this.state = 'BUILDING'; // 'BUILDING' | 'FLOWING' | 'LEAKING' | 'LEVEL_WON' | 'GAME_OVER' | 'CAMPAIGN_WON'
    this.flowing = false;
    this.fastForward = false;
    this.flowPath = [];
    this.curFlow = null;
    this.flowProgress = 0.0;
    this.flowCount = 0;
    this.leakTimer = 0;
    this.leakPos = null;
    this.particles = [];
    this.animTimer = 0;
    this.tickSubTimer = 0;
    this.levelTimeBonus = 0;
    this.levelFlowBonus = 0;

    // Create grid and generate guaranteed solvable puzzle
    this.grid = E1.create(this.gridW, this.gridH, 0);
    this.generateGuaranteedLevel(cfg.minPath);
  },

  // Generates a verified solvable path from (0,0) [inDir=3/West] to (W-1, H-1) [outDir=1/East]
  generateGuaranteedLevel(minLen) {
    const w = this.gridW, h = this.gridH;
    let actualPath = null;

    // Try randomized DFS walk to find path >= minLen
    for (let attempt = 0; attempt < 120; attempt++) {
      const visited = new Uint8Array(w * h);
      const path = [[0, 0]];
      visited[0] = 1;
      let cx = 0, cy = 0;

      while (cx !== w - 1 || cy !== h - 1) {
        const dirs = [
          { dx: 0, dy: -1, d: 0 },
          { dx: 1, dy: 0, d: 1 },
          { dx: 0, dy: 1, d: 2 },
          { dx: -1, dy: 0, d: 3 }
        ];
        for (let i = dirs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const t = dirs[i]; dirs[i] = dirs[j]; dirs[j] = t;
        }
        let moved = false;
        for (const dir of dirs) {
          const nx = cx + dir.dx, ny = cy + dir.dy;
          if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[ny * w + nx]) {
            if (nx === w - 1 && ny === h - 1 && path.length < minLen - 1) continue;
            visited[ny * w + nx] = 1;
            path.push([nx, ny]);
            cx = nx; cy = ny;
            moved = true;
            break;
          }
        }
        if (!moved) break;
      }

      if (cx === w - 1 && cy === h - 1 && path.length >= minLen) {
        actualPath = path;
        break;
      }
    }

    // Fallback guaranteed snake path if random walk didn't hit minLen
    if (!actualPath) {
      actualPath = [];
      let y = 0;
      while (y < h) {
        if (y % 2 === 0) {
          for (let x = 0; x < w; x++) actualPath.push([x, y]);
        } else {
          for (let x = w - 1; x >= 0; x--) actualPath.push([x, y]);
        }
        y++;
      }
      if (actualPath[actualPath.length - 1][0] !== w - 1 || actualPath[actualPath.length - 1][1] !== h - 1) {
        actualPath = [];
        for (let x = 0; x < w; x++) actualPath.push([x, 0]);
        for (let y = 1; y < h; y++) actualPath.push([w - 1, y]);
      }
    }

    // 1. Fill entire grid with random distractor pipes
    for (let i = 0; i < w * h; i++) {
      this.grid.data[i] = Math.floor(Math.random() * 11);
    }

    // 2. Lay down exact functional pipes along the verified path
    const solutionPipes = new Uint8Array(w * h);
    for (let i = 0; i < actualPath.length; i++) {
      const pt = actualPath[i];
      let inDir, outDir;
      if (i === 0) {
        inDir = 3; // Enters from West valve into (0,0)
      } else {
        const prev = actualPath[i - 1];
        const dx = pt[0] - prev[0], dy = pt[1] - prev[1];
        inDir = dx === 1 ? 3 : (dx === -1 ? 1 : (dy === 1 ? 0 : 2));
      }

      if (i === actualPath.length - 1) {
        outDir = 1; // Exits to East drain from (w-1, h-1)
      } else {
        const next = actualPath[i + 1];
        const dx = next[0] - pt[0], dy = next[1] - pt[1];
        outDir = dx === 1 ? 1 : (dx === -1 ? 3 : (dy === 1 ? 2 : 0));
      }

      const pType = this.chooseFittingPipe(inDir, outDir);
      E1.set(this.grid, pt[0], pt[1], pType);
      solutionPipes[pt[1] * w + pt[0]] = pType;
    }

    // 3. Scramble the puzzle: rotate every tile 0..3 times
    let scrambledPathCount = 0;
    for (let i = 0; i < actualPath.length; i++) {
      const pt = actualPath[i];
      const rots = 1 + Math.floor(Math.random() * 3); // Guarantee rotation for path tiles
      for (let r = 0; r < rots; r++) {
        const cur = E1.get(this.grid, pt[0], pt[1]);
        E1.set(this.grid, pt[0], pt[1], this.ROTATE_MAP[cur]);
      }
      scrambledPathCount++;
    }
    // Randomize distractors
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!actualPath.some(pt => pt[0] === x && pt[1] === y)) {
          const rots = Math.floor(Math.random() * 4);
          for (let r = 0; r < rots; r++) {
            const cur = E1.get(this.grid, x, y);
            E1.set(this.grid, x, y, this.ROTATE_MAP[cur]);
          }
        }
      }
    }
  },

  chooseFittingPipe(inDir, outDir) {
    // Straight segment
    if ((inDir + 2) % 4 === outDir) {
      const r = Math.random();
      if (r < 0.20) return 6; // Cross pipe (+)
      if (r < 0.40) {
        // T-junction with straight through-channel
        const tTypes = [7, 8, 9, 10].filter(t => this.PIPES[t][inDir] && this.PIPES[t][outDir]);
        if (tTypes.length > 0) return tTypes[Math.floor(Math.random() * tTypes.length)];
      }
      return (inDir === 0 || inDir === 2) ? 0 : 1;
    }
    // Corner turn: strictly use unambiguous corner elbow (2..5)
    for (let t = 2; t <= 5; t++) {
      if (this.PIPES[t][inDir] && this.PIPES[t][outDir]) return t;
    }
    return 2;
  },

  isTileLocked(x, y) {
    if (this.flowPath.some(pt => pt.x === x && pt.y === y)) return true;
    if (this.curFlow && this.curFlow.x === x && this.curFlow.y === y) return true;
    return false;
  },

  rotateTile(x, y) {
    if (this.isTileLocked(x, y)) return false;
    const cur = E1.get(this.grid, x, y);
    const next = this.ROTATE_MAP[cur];
    E1.set(this.grid, x, y, next);
    return true;
  },

  getOutDir(pType, inDir, curX, curY) {
    const op = this.PIPES[pType];
    if (!op || !op[inDir]) return -1;
    // Cross pipe (+) always sends water straight through
    if (pType === 6) {
      return (inDir + 2) % 4;
    }
    // T-junction (7..10): prefer straight through if open
    if (pType >= 7 && pType <= 10) {
      const straight = (inDir + 2) % 4;
      if (op[straight]) return straight;
      // Entering from stem: check which branch connects to an open neighbor
      const candidates = [0, 1, 2, 3].filter(d => d !== inDir && op[d]);
      for (const d of candidates) {
        const dx = d === 1 ? 1 : (d === 3 ? -1 : 0);
        const dy = d === 2 ? 1 : (d === 0 ? -1 : 0);
        const nx = curX + dx, ny = curY + dy;
        if (nx >= 0 && nx < this.gridW && ny >= 0 && ny < this.gridH) {
          const np = E1.get(this.grid, nx, ny);
          const nop = this.PIPES[np];
          const nInDir = (d + 2) % 4;
          if (nop && nop[nInDir]) return d;
        }
      }
      return candidates[0];
    }
    // Straights (0, 1) and Elbows (2..5): single other opening
    for (let d = 0; d < 4; d++) {
      if (d !== inDir && op[d]) return d;
    }
    return -1;
  },

  startFlow() {
    if (this.flowing || this.state !== 'BUILDING') return;
    this.flowing = true;
    this.state = 'FLOWING';

    // Early flush bonus: 10 pts per remaining second
    if (this.waterTime > 0) {
      const bonus = Math.floor(this.waterTime) * 10;
      this.score += bonus;
      if (this.score > this.bestScore) this.bestScore = this.score;
    }

    // Check Start Tile (0,0) connection from West (3)
    const startP = E1.get(this.grid, 0, 0);
    const op = this.PIPES[startP];
    if (!op || !op[3]) {
      // Immediate leak at valve entrance
      this.triggerLeak(0, 0, 3);
      return;
    }

    const outDir = this.getOutDir(startP, 3, 0, 0);
    this.curFlow = { x: 0, y: 0, inDir: 3, outDir };
    this.flowProgress = 0.0;
    this.flowCount = 0;
    if (typeof APU !== 'undefined') APU.sfx('SWISH');
  },

  triggerLeak(tileX, tileY, dir) {
    this.state = 'LEAKING';
    this.leakTimer = 0;
    const bx = this.ox + tileX * this.sz;
    const by = this.oy + tileY * this.sz;
    const mx = bx + Math.floor(this.sz / 2);
    const my = by + Math.floor(this.sz / 2);
    let lx = mx, ly = my;
    if (dir === 0) ly = by;
    else if (dir === 1) lx = bx + this.sz;
    else if (dir === 2) ly = by + this.sz;
    else if (dir === 3) lx = bx;

    this.leakPos = { x: tileX, y: tileY, dir, px: lx, py: ly };

    if (typeof APU !== 'undefined') {
      APU.sfx('BOOM');
      APU.sfx('SPLASH');
    }

    // Splashing spray droplets
    for (let i = 0; i < 24; i++) {
      const baseAngle = dir === 1 ? 0 : (dir === 2 ? Math.PI / 2 : (dir === 3 ? Math.PI : -Math.PI / 2));
      const angle = baseAngle + (Math.random() - 0.5) * 1.6;
      const spd = 30 + Math.random() * 60;
      this.particles.push({
        x: lx, y: ly,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.3 + Math.random() * 0.7,
        maxLife: 1.0,
        col: Math.random() > 0.4 ? 3 : 2
      });
    }
  },

  spawnDroplet(x, y, dir) {
    const baseAngle = dir === 1 ? 0 : (dir === 2 ? Math.PI / 2 : (dir === 3 ? Math.PI : -Math.PI / 2));
    const angle = baseAngle + (Math.random() - 0.5) * 1.2;
    const spd = 10 + Math.random() * 25;
    this.particles.push({
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life: 0.2 + Math.random() * 0.3,
      maxLife: 0.5,
      col: 3
    });
  },

  spawnCelebration(x, y) {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 20 + Math.random() * 70;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.4 + Math.random() * 0.8,
        maxLife: 1.2,
        col: Math.random() > 0.3 ? 3 : 2
      });
    }
  },

  getMeniscusPos(flow, progress) {
    const bx = this.ox + flow.x * this.sz;
    const by = this.oy + flow.y * this.sz;
    const mx = bx + Math.floor(this.sz / 2);
    const my = by + Math.floor(this.sz / 2);

    if (progress < 0.5) {
      const f = progress / 0.5;
      if (flow.inDir === 0) return { x: mx, y: by + f * (my - by) };
      if (flow.inDir === 1) return { x: (bx + this.sz) - f * ((bx + this.sz) - mx), y: my };
      if (flow.inDir === 2) return { x: mx, y: (by + this.sz) - f * ((by + this.sz) - my) };
      return { x: bx + f * (mx - bx), y: my };
    } else {
      const f = (progress - 0.5) / 0.5;
      if (flow.outDir === 0) return { x: mx, y: my - f * (my - by) };
      if (flow.outDir === 1) return { x: mx + f * ((bx + this.sz) - mx), y: my };
      if (flow.outDir === 2) return { x: mx, y: my + f * ((by + this.sz) - my) };
      return { x: mx - f * (mx - bx), y: my };
    }
  },

  update(dt) {
    // Update active particle effects
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    this.animTimer += dt;

    // Overlay / Screen Transitions
    if (this.state === 'LEVEL_WON') {
      if (PAD.hit('a') || PAD.hit('start') || PAD.tapPos) {
        if (this.level < 10) {
          this.startLevel(this.level + 1);
        } else {
          this.state = 'CAMPAIGN_WON';
        }
      }
      return;
    }

    if (this.state === 'CAMPAIGN_WON') {
      if (PAD.hit('a') || PAD.hit('start') || PAD.tapPos) {
        this.init();
      }
      return;
    }

    if (this.state === 'GAME_OVER') {
      if (PAD.hit('a') || PAD.hit('start') || PAD.tapPos) {
        this.startLevel(this.level); // Retry current level
      } else if (PAD.hit('b')) {
        this.init(); // Restart whole campaign
      }
      return;
    }

    if (this.state === 'LEAKING') {
      this.leakTimer += dt;
      if (Math.random() < dt * 35 && this.leakPos) {
        this.spawnDroplet(this.leakPos.px, this.leakPos.py, this.leakPos.dir);
      }
      if (this.leakTimer >= 1.2) {
        this.state = 'GAME_OVER';
        if (typeof SAVE !== 'undefined' && SAVE.setScore) {
          SAVE.setScore(this.id, this.score);
        }
      }
      return;
    }

    // Direct Touch Controls
    if (PAD.tapPos) {
      const tx = PAD.tapPos.x, ty = PAD.tapPos.y;
      // Check On-screen Flush / Fast-Forward Button
      if (tx >= this.btnX && tx <= this.btnX + this.btnW && ty >= this.btnY && ty <= this.btnY + this.btnH) {
        if (this.state === 'BUILDING') {
          this.startFlow();
          if (typeof APU !== 'undefined') APU.sfx('SPLASH');
        } else if (this.state === 'FLOWING') {
          this.fastForward = !this.fastForward;
          if (typeof APU !== 'undefined') APU.sfx('TICK');
        }
      } else {
        // Check Direct Tile Taps
        const gx = Math.floor((tx - this.ox) / this.sz);
        const gy = Math.floor((ty - this.oy) / this.sz);
        if (gx >= 0 && gx < this.gridW && gy >= 0 && gy < this.gridH) {
          if (this.isTileLocked(gx, gy)) {
            if (typeof APU !== 'undefined') APU.sfx('DENY');
          } else {
            this.rotateTile(gx, gy);
            this.cx = gx; this.cy = gy;
            if (typeof APU !== 'undefined') APU.sfx('TICK');
          }
        }
      }
    }

    // D-Pad and Keyboard Controls
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(this.gridW - 1, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(this.gridH - 1, this.cy + 1);

    if (PAD.hit('a')) {
      if (this.isTileLocked(this.cx, this.cy)) {
        if (typeof APU !== 'undefined') APU.sfx('DENY');
      } else {
        this.rotateTile(this.cx, this.cy);
        if (typeof APU !== 'undefined') APU.sfx('TICK');
      }
    }

    if (this.state === 'BUILDING') {
      this.waterTime -= dt;
      if (PAD.hit('b') || this.waterTime <= 0) {
        this.startFlow();
        if (typeof APU !== 'undefined') APU.sfx('SPLASH');
      }
    } else if (this.state === 'FLOWING') {
      const isFast = this.fastForward || PAD.held('b');
      const flowSpeed = isFast ? 5.2 : 1.8; // Tiles traversed per second

      this.flowProgress += dt * flowSpeed;

      // Spurt particles along advancing fluid meniscus
      if (Math.random() < dt * 25 && this.curFlow) {
        const head = this.getMeniscusPos(this.curFlow, this.flowProgress);
        this.spawnDroplet(head.x, head.y, this.curFlow.outDir);
      }

      // Auditory rhythm tick during fluid travel
      this.tickSubTimer += dt * flowSpeed;
      if (this.tickSubTimer >= 0.5) {
        this.tickSubTimer -= 0.5;
        if (typeof APU !== 'undefined') APU.sfx('TICK');
      }

      // Step completed tile into next pipe segment
      if (this.flowProgress >= 1.0) {
        this.flowProgress = 0.0;
        this.flowPath.push({
          x: this.curFlow.x,
          y: this.curFlow.y,
          inDir: this.curFlow.inDir,
          outDir: this.curFlow.outDir
        });
        this.flowCount++;
        this.score += 25;
        if (this.score > this.bestScore) this.bestScore = this.score;

        // Drain Check at (W-1, H-1) exiting East (1)
        if (this.curFlow.x === this.gridW - 1 && this.curFlow.y === this.gridH - 1 && this.curFlow.outDir === 1) {
          this.state = 'LEVEL_WON';
          const timeBonus = Math.max(0, Math.floor(this.waterTime)) * 15;
          const flowBonus = this.flowCount * 30;
          this.levelTimeBonus = timeBonus;
          this.levelFlowBonus = flowBonus;
          this.score += timeBonus + flowBonus;
          if (this.score > this.bestScore) this.bestScore = this.score;
          if (typeof SAVE !== 'undefined' && SAVE.setScore) {
            SAVE.setScore(this.id, this.score);
          }
          if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
          this.spawnCelebration(this.ox + this.gridW * this.sz + 8, this.oy + (this.gridH - 1) * this.sz + Math.floor(this.sz / 2));
          return;
        }

        // Trace into Next Pipe
        const dx = this.curFlow.outDir === 1 ? 1 : (this.curFlow.outDir === 3 ? -1 : 0);
        const dy = this.curFlow.outDir === 2 ? 1 : (this.curFlow.outDir === 0 ? -1 : 0);
        const nx = this.curFlow.x + dx;
        const ny = this.curFlow.y + dy;
        const nextInDir = (this.curFlow.outDir + 2) % 4;

        // Boundary leak check
        if (nx < 0 || nx >= this.gridW || ny < 0 || ny >= this.gridH) {
          this.triggerLeak(this.curFlow.x, this.curFlow.y, this.curFlow.outDir);
          return;
        }

        // Loop / Collision check
        const nextP = E1.get(this.grid, nx, ny);
        if (nextP !== 6) { // Non-cross pipe collision
          if (this.flowPath.some(pt => pt.x === nx && pt.y === ny)) {
            this.triggerLeak(this.curFlow.x, this.curFlow.y, this.curFlow.outDir);
            return;
          }
        } else { // Cross pipe collision: check if same traversal orientation already used
          const crosses = this.flowPath.filter(pt => pt.x === nx && pt.y === ny);
          if (crosses.some(pt => pt.inDir === nextInDir || pt.outDir === nextInDir)) {
            this.triggerLeak(this.curFlow.x, this.curFlow.y, this.curFlow.outDir);
            return;
          }
        }

        // Alignment check
        const nextOp = this.PIPES[nextP];
        if (!nextOp || !nextOp[nextInDir]) {
          this.triggerLeak(this.curFlow.x, this.curFlow.y, this.curFlow.outDir);
          return;
        }

        const nextOutDir = this.getOutDir(nextP, nextInDir, nx, ny);
        this.curFlow = { x: nx, y: ny, inDir: nextInDir, outDir: nextOutDir };
        if (typeof APU !== 'undefined') APU.sfx('SWISH');
      }
    }
  },

  render(g) {
    g.clear(0);

    // 1. HUD & Metrics
    g.text("LVL " + this.level + "/10", 6, 6, 3);
    g.text("FLOW:" + this.flowCount, 52, 6, 2);
    g.text("BEST:" + this.bestScore, 108, 6, 2);
    g.text("SCORE:" + this.score, 6, 17, 3);

    if (this.state === 'BUILDING') {
      const alert = this.waterTime <= 5;
      const col = alert ? 3 : 2;
      g.text("VALVE:" + Math.ceil(this.waterTime) + "S", 108, 17, col);
    } else if (this.state === 'FLOWING') {
      g.text("FLOWING...", 108, 17, 3);
    } else if (this.state === 'LEAKING') {
      g.text("LEAK DETECTED!", 108, 17, 3);
    }

    // 2. On-screen Interactive Flush / Fast-Forward Button
    const btnBoxCol = this.state === 'BUILDING' ? 2 : (this.fastForward ? 3 : 2);
    const btnTxtCol = this.state === 'BUILDING' ? 3 : (this.fastForward ? 0 : 3);
    g.rect(this.btnX, this.btnY, this.btnW, this.btnH, btnBoxCol);
    g.box(this.btnX, this.btnY, this.btnW, this.btnH, this.state === 'BUILDING' ? 3 : (this.fastForward ? 0 : 3));
    if (this.state === 'BUILDING') {
      g.text("[B] FLUSH", this.btnX + 6, this.btnY + 5, btnTxtCol);
    } else {
      g.text(this.fastForward ? ">> FAST" : "[B] FAST", this.btnX + 6, this.btnY + 5, btnTxtCol);
    }

    // 3. Start Valve Unit (West of 0,0)
    const vY = this.oy + Math.floor(this.sz / 2);
    g.rect(this.ox - 14, vY - 5, 14, 10, 2);
    g.box(this.ox - 14, vY - 5, 14, 10, 3);
    // Rotating Valve Wheel
    const wheelAngle = this.flowing ? (this.animTimer * 8) : 0;
    const wcx = this.ox - 7, wcy = vY;
    g.circle(wcx, wcy, 4, 3);
    const cosA = Math.cos(wheelAngle) * 3, sinA = Math.sin(wheelAngle) * 3;
    g.line(wcx - cosA, wcy - sinA, wcx + cosA, wcy + sinA, 3);
    g.line(wcx + sinA, wcy - cosA, wcx - sinA, wcy + cosA, 3);
    // Flowing Water Nozzle
    if (this.flowing) {
      g.rect(this.ox - 12, vY - 2, 12, 5, 3);
    }
    g.text("IN", this.ox - 13, this.oy - 7, 2);

    // 4. Drain Cistern Unit (East of W-1, H-1)
    const dX = this.ox + this.gridW * this.sz;
    const dY = this.oy + (this.gridH - 1) * this.sz + Math.floor(this.sz / 2);
    g.rect(dX, dY - 7, 14, 14, 2);
    g.box(dX, dY - 7, 14, 14, 3);
    // Grate Bars
    g.line(dX + 3, dY - 5, dX + 3, dY + 5, 0);
    g.line(dX + 7, dY - 5, dX + 7, dY + 5, 0);
    g.line(dX + 11, dY - 5, dX + 11, dY + 5, 0);
    if (this.state === 'LEVEL_WON' || this.state === 'CAMPAIGN_WON') {
      g.rect(dX + 2, dY - 5, 10, 11, 3);
    }
    g.text("OUT", dX + 1, this.oy + (this.gridH - 1) * this.sz - 7, 2);

    // 5. Pipe Grid Rendering with Metallic Casings, Flanges, and Glowing Fluid Channels
    const pw = Math.max(5, Math.floor(this.sz * 0.28));
    const cw = Math.max(2, pw - 3);

    for (let y = 0; y < this.gridH; y++) {
      for (let x = 0; x < this.gridW; x++) {
        const bx = this.ox + x * this.sz;
        const by = this.oy + y * this.sz;
        const mx = bx + Math.floor(this.sz / 2);
        const my = by + Math.floor(this.sz / 2);

        // Tile base plate & corner rivets
        g.box(bx, by, this.sz, this.sz, 1);
        g.px(bx + 1, by + 1, 1);
        g.px(bx + this.sz - 2, by + 1, 1);
        g.px(bx + 1, by + this.sz - 2, 1);
        g.px(bx + this.sz - 2, by + this.sz - 2, 1);

        const p = E1.get(this.grid, x, y);
        const op = this.PIPES[p];

        // Metallic Pipe Casings (Color 2)
        g.rect(mx - pw, my - pw, pw * 2 + 1, pw * 2 + 1, 2);
        if (op[0]) { // North
          g.rect(mx - pw, by, pw * 2 + 1, my - by, 2);
          g.rect(mx - pw - 1, by, pw * 2 + 3, 2, 3); // Flanged coupling
        }
        if (op[1]) { // East
          g.rect(mx, my - pw, (bx + this.sz) - mx, pw * 2 + 1, 2);
          g.rect(bx + this.sz - 2, my - pw - 1, 2, pw * 2 + 3, 3); // Flanged coupling
        }
        if (op[2]) { // South
          g.rect(mx - pw, my, pw * 2 + 1, (by + this.sz) - my, 2);
          g.rect(mx - pw - 1, by + this.sz - 2, pw * 2 + 3, 2, 3); // Flanged coupling
        }
        if (op[3]) { // West
          g.rect(bx, my - pw, mx - bx, pw * 2 + 1, 2);
          g.rect(bx, my - pw - 1, 2, pw * 2 + 3, 3); // Flanged coupling
        }

        // Hollow Conduit Channel Interior (Dark background color 0)
        g.rect(mx - cw, my - cw, cw * 2 + 1, cw * 2 + 1, 0);
        if (op[0]) g.rect(mx - cw, by, cw * 2 + 1, my - by + 1, 0);
        if (op[1]) g.rect(mx, my - cw, (bx + this.sz) - mx, cw * 2 + 1, 0);
        if (op[2]) g.rect(mx - cw, my, cw * 2 + 1, (by + this.sz) - my, 0);
        if (op[3]) g.rect(bx, my - cw, mx - bx + 1, cw * 2 + 1, 0);

        // Dry Flow Direction Guide Indicators (Color 1)
        if (!this.flowPath.some(pt => pt.x === x && pt.y === y)) {
          g.px(mx, my, 1);
        }

        // Render Filled Liquid Stream for Completed Segments
        const completedFlows = this.flowPath.filter(pt => pt.x === x && pt.y === y);
        for (const flow of completedFlows) {
          this.renderPipeFluid(g, bx, by, mx, my, cw, flow.inDir, flow.outDir, 1.0);
        }

        // Render Active Liquid Stream for Currently Traversing Segment
        if (this.curFlow && this.curFlow.x === x && this.curFlow.y === y) {
          this.renderPipeFluid(g, bx, by, mx, my, cw, this.curFlow.inDir, this.curFlow.outDir, this.flowProgress);
        }

        // Cursor Bracket
        if (x === this.cx && y === this.cy && this.state !== 'GAME_OVER' && this.state !== 'LEVEL_WON' && this.state !== 'CAMPAIGN_WON') {
          const pulse = Math.floor(this.animTimer * 4) % 2 === 0;
          g.box(bx - 1, by - 1, this.sz + 2, this.sz + 2, pulse ? 3 : 2);
        }
      }
    }

    // 6. Leak Animated Expanding Puddle
    if (this.leakPos && (this.state === 'LEAKING' || this.state === 'GAME_OVER')) {
      const rad = Math.min(20, Math.floor(this.leakTimer * 18));
      if (rad > 0) {
        g.disc(this.leakPos.px, this.leakPos.py, rad, 2);
        g.circle(this.leakPos.px, this.leakPos.py, rad, 3);
        if (rad > 6) g.circle(this.leakPos.px, this.leakPos.py, Math.floor(rad * 0.6), 3);
      }
    }

    // 7. Active Liquid Particles & Droplet Splash
    for (const p of this.particles) {
      if (p.x >= 0 && p.x < 256 && p.y >= 0 && p.y < 240) {
        g.px(p.x, p.y, p.col);
      }
    }

    // 8. Overlays & Dialogs
    if (this.state === 'LEVEL_WON') {
      g.dither(34, 72, 188, 76, 0, 1);
      g.box(34, 72, 188, 76, 3);
      g.textC("AQUEDUCT CONNECTED!", 80, 3);
      g.textC("LEVEL " + this.level + " COMPLETE!", 94, 2);
      g.textC("TIME +" + this.levelTimeBonus + "  FLOW +" + this.levelFlowBonus, 108, 3);
      g.textC("TAP OR [A] NEXT LEVEL", 126, 3);
    } else if (this.state === 'GAME_OVER') {
      g.dither(34, 68, 188, 84, 0, 1);
      g.box(34, 68, 188, 84, 3);
      g.textC("PIPE LEAKED! FLOOD!", 76, 3);
      g.textC("PIPES CONNECTED: " + this.flowCount, 90, 2);
      g.textC("SCORE: " + this.score + "  BEST: " + this.bestScore, 104, 3);
      g.textC("TAP OR [A] RETRY LEVEL", 120, 3);
      g.textC("[B] RESTART CAMPAIGN", 134, 2);
    } else if (this.state === 'CAMPAIGN_WON') {
      g.dither(28, 64, 200, 92, 0, 1);
      g.box(28, 64, 200, 92, 3);
      g.textC("★ MASTER PLUMBER! ★", 74, 3);
      g.textC("ALL 10 RESERVOIRS ONLINE!", 90, 3);
      g.textC("AQUEDUCT SYSTEM SECURED!", 104, 2);
      g.textC("FINAL SCORE: " + this.score, 120, 3);
      g.textC("TAP OR [A] PLAY AGAIN", 136, 2);
    } else {
      // Bottom Controls Help Strip
      if (this.state === 'BUILDING') {
        g.textC("TAP / [A] ROTATE | [B] FLUSH VALVE", 228, 2);
      } else if (this.state === 'FLOWING') {
        g.textC("WATER FLOWING! [B] FOR FAST-FWD", 228, 2);
      }
    }
  },

  renderPipeFluid(g, bx, by, mx, my, cw, inDir, outDir, progress) {
    const wavePulse = Math.sin(this.animTimer * 10 + (bx + by) * 0.1) > 0;
    const col = 3;
    const rippleCol = wavePulse ? 3 : 2;

    // Segment 1: Inflow edge towards Center (0.0 <= progress <= 0.5)
    if (progress < 0.5) {
      const f = progress / 0.5;
      if (inDir === 0) { // North
        const curH = Math.floor(f * (my - by + 1));
        g.rect(mx - cw, by, cw * 2 + 1, curH, col);
        g.disc(mx, by + curH, cw, 3);
      } else if (inDir === 1) { // East
        const curW = Math.floor(f * ((bx + this.sz) - mx));
        g.rect((bx + this.sz) - curW, my - cw, curW, cw * 2 + 1, col);
        g.disc((bx + this.sz) - curW, my, cw, 3);
      } else if (inDir === 2) { // South
        const curH = Math.floor(f * ((by + this.sz) - my));
        g.rect(mx - cw, (by + this.sz) - curH, cw * 2 + 1, curH, col);
        g.disc(mx, (by + this.sz) - curH, cw, 3);
      } else if (inDir === 3) { // West
        const curW = Math.floor(f * (mx - bx + 1));
        g.rect(bx, my - cw, curW, cw * 2 + 1, col);
        g.disc(bx + curW, my, cw, 3);
      }
    } else {
      // Inflow leg is fully filled
      if (inDir === 0) g.rect(mx - cw, by, cw * 2 + 1, my - by + 1, col);
      else if (inDir === 1) g.rect(mx, my - cw, (bx + this.sz) - mx, cw * 2 + 1, col);
      else if (inDir === 2) g.rect(mx - cw, my, cw * 2 + 1, (by + this.sz) - my, col);
      else if (inDir === 3) g.rect(bx, my - cw, mx - bx + 1, cw * 2 + 1, col);

      // Center junction hub is filled
      g.rect(mx - cw, my - cw, cw * 2 + 1, cw * 2 + 1, col);

      // Segment 2: Center towards Outflow edge (0.5 <= progress <= 1.0)
      const f = (progress - 0.5) / 0.5;
      if (outDir === 0) { // North
        const curH = Math.floor(f * (my - by + 1));
        g.rect(mx - cw, my - curH, cw * 2 + 1, curH, col);
        if (progress < 1.0) g.disc(mx, my - curH, cw, 3);
      } else if (outDir === 1) { // East
        const curW = Math.floor(f * ((bx + this.sz) - mx));
        g.rect(mx, my - cw, curW, cw * 2 + 1, col);
        if (progress < 1.0) g.disc(mx + curW, my, cw, 3);
      } else if (outDir === 2) { // South
        const curH = Math.floor(f * ((by + this.sz) - my));
        g.rect(mx - cw, my, cw * 2 + 1, curH, col);
        if (progress < 1.0) g.disc(mx, my + curH, cw, 3);
      } else if (outDir === 3) { // West
        const curW = Math.floor(f * (mx - bx + 1));
        g.rect(mx - curW, my - cw, curW, cw * 2 + 1, col);
        if (progress < 1.0) g.disc(mx - curW, my, cw, 3);
      }

      // Glowing ripple center shimmer
      g.px(mx, my, rippleCol);
    }
  }
};
