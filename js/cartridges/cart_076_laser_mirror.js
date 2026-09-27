// js/cartridges/cart_076_laser_mirror.js
// ============================================================================
// Cartridge #076: LASER MIRROR
// Genre: Stealth & Defense (7) | Optical Laser Reflection & Refraction Puzzle
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[76] = {
  id: 76,
  name: "LASER MIRROR",
  genre: 7,
  scoreLabel: "LEVELS",
  desc: "OPTICAL PUZZLE: D-PAD SELECTS MIRROR, [A] ROTATES 45° ANGLES TO ENERGIZE TARGETS!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Laser emitter beam bouncing off 45-degree angled glass prism mirror into sensor
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Laser Emitter (Top Left)
    g.rect(x + 4, y + 8, 6, 6, 2);
    g.line(x + 10, y + 11, x + 20, y + 11, 3); // Horizontal beam

    // 45-degree Angled Mirror (Center)
    g.line(x + 16, y + 7, x + 24, y + 15, 3);
    g.line(x + 17, y + 6, x + 25, y + 14, 2);

    // Reflected 90-degree Vertical Beam
    g.line(x + 20, y + 11, x + 20, y + 24, 3);

    // Target Sensor (Bottom)
    g.box(x + 17, y + 24, 7, 5, 2);
    g.disc(x + 20, y + 26, 2, 3); // glowing sensor
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.level = 0;
    this.maxLevels = 6;
    this.score = 0;
    this.state = 'PLAY'; // 'PLAY', 'SOLVED', 'ALL_CLEAR'
    this.solvedTimer = 0;

    // 8x8 Grid Cursor
    this.cursorX = 2;
    this.cursorY = 2;

    // Levels definitions
    this.levels = [
      // Level 1: Simple 1-mirror 90-degree bounce
      {
        emitter: { x: 1, y: 1, dir: 'E' },
        targets: [{ x: 5, y: 5, lit: false }],
        mirrors: [
          { x: 5, y: 1, angle: 0 }, // angle 0 = '/', 1 = '\'
          { x: 3, y: 3, angle: 1 }
        ],
        blocks: [{ x: 3, y: 1 }]
      },
      // Level 2: 2-mirror S-bend
      {
        emitter: { x: 0, y: 2, dir: 'E' },
        targets: [{ x: 6, y: 6, lit: false }],
        mirrors: [
          { x: 3, y: 2, angle: 0 },
          { x: 3, y: 6, angle: 0 }
        ],
        blocks: [{ x: 4, y: 2 }]
      },
      // Level 3: 3-mirror loop around obstacles
      {
        emitter: { x: 1, y: 6, dir: 'N' },
        targets: [{ x: 6, y: 2, lit: false }],
        mirrors: [
          { x: 1, y: 1, angle: 1 },
          { x: 4, y: 1, angle: 0 },
          { x: 4, y: 4, angle: 1 },
          { x: 6, y: 4, angle: 0 }
        ],
        blocks: [{ x: 1, y: 3 }, { x: 4, y: 3 }]
      },
      // Level 4: Dual Targets requiring beam precision
      {
        emitter: { x: 0, y: 1, dir: 'E' },
        targets: [{ x: 5, y: 6, lit: false }],
        mirrors: [
          { x: 2, y: 1, angle: 1 },
          { x: 2, y: 4, angle: 0 },
          { x: 5, y: 4, angle: 1 }
        ],
        blocks: [{ x: 3, y: 4 }, { x: 4, y: 4 }]
      },
      // Level 5: Obstacle maze
      {
        emitter: { x: 7, y: 1, dir: 'W' },
        targets: [{ x: 1, y: 6, lit: false }],
        mirrors: [
          { x: 4, y: 1, angle: 0 },
          { x: 4, y: 3, angle: 1 },
          { x: 2, y: 3, angle: 0 },
          { x: 2, y: 6, angle: 1 }
        ],
        blocks: [{ x: 3, y: 1 }, { x: 3, y: 3 }]
      },
      // Level 6: Complex 5-bounce finale
      {
        emitter: { x: 0, y: 0, dir: 'E' },
        targets: [{ x: 7, y: 7, lit: false }],
        mirrors: [
          { x: 4, y: 0, angle: 0 },
          { x: 4, y: 3, angle: 0 },
          { x: 1, y: 3, angle: 1 },
          { x: 1, y: 7, angle: 0 },
          { x: 7, y: 4, angle: 1 }
        ],
        blocks: [{ x: 2, y: 0 }, { x: 3, y: 3 }, { x: 5, y: 4 }]
      }
    ];

    this.loadLevel(0);
  },

  loadLevel(idx) {
    this.level = idx;
    const ld = this.levels[idx];
    this.emitter = { x: ld.emitter.x, y: ld.emitter.y, dir: ld.emitter.dir };
    this.targets = ld.targets.map(t => ({ x: t.x, y: t.y, lit: false }));
    this.mirrors = ld.mirrors.map(m => ({ x: m.x, y: m.y, angle: m.angle }));
    this.blocks = ld.blocks ? ld.blocks.map(b => ({ x: b.x, y: b.y })) : [];

    this.beamSegments = [];
    this.state = 'PLAY';
    this.traceLaser();
  },

  // --------------------------------------------------------------------------
  // 3. MAIN GAMEPLAY UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    if (dt > 0.05) dt = 0.05;

    // Handle Victory transition
    if (this.state === 'SOLVED') {
      this.solvedTimer -= dt;
      if (this.solvedTimer <= 0) {
        if (this.level + 1 < this.maxLevels) {
          this.loadLevel(this.level + 1);
        } else {
          this.state = 'ALL_CLEAR';
          SAVE.setScore(this.id, this.maxLevels * 100);
        }
      }
      return;
    }

    if (this.state === 'ALL_CLEAR') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || TOUCH.down) {
        this.init();
      }
      return;
    }

    // 1. CURSOR NAVIGATION ON 8x8 GRID
    if (PAD.hit('left')) { this.cursorX = Math.max(0, this.cursorX - 1); APU.sfx('SELECT'); }
    if (PAD.hit('right')) { this.cursorX = Math.min(7, this.cursorX + 1); APU.sfx('SELECT'); }
    if (PAD.hit('up')) { this.cursorY = Math.max(0, this.cursorY - 1); APU.sfx('SELECT'); }
    if (PAD.hit('down')) { this.cursorY = Math.min(7, this.cursorY + 1); APU.sfx('SELECT'); }

    // Direct touch cell selection
    if (TOUCH.down && TOUCH.y > 35 && TOUCH.y < 210) {
      const cellSz = 22;
      const originX = 40;
      const originY = 38;
      const cx = Math.floor((TOUCH.x - originX) / cellSz);
      const cy = Math.floor((TOUCH.y - originY) / cellSz);
      if (cx >= 0 && cx < 8 && cy >= 0 && cy < 8) {
        this.cursorX = cx;
        this.cursorY = cy;
      }
    }

    // 2. ROTATE MIRROR [A]
    if (PAD.hit('a')) {
      const m = this.getMirrorAt(this.cursorX, this.cursorY);
      if (m) {
        m.angle = (m.angle + 1) % 2; // Toggle 0 ('/') and 1 ('\')
        APU.sfx('TICK');
        this.traceLaser();
        this.checkSolved();
      }
    }
  },

  getMirrorAt(x, y) {
    return this.mirrors.find(m => m.x === x && m.y === y);
  },

  getBlockAt(x, y) {
    return this.blocks.find(b => b.x === x && b.y === y);
  },

  getTargetAt(x, y) {
    return this.targets.find(t => t.x === x && t.y === y);
  },

  // --------------------------------------------------------------------------
  // LASER RAYTRACING ENGINE
  // --------------------------------------------------------------------------
  traceLaser() {
    this.beamSegments = [];
    for (let t of this.targets) t.lit = false;

    let curX = this.emitter.x;
    let curY = this.emitter.y;
    let dir = this.emitter.dir; // 'N', 'S', 'E', 'W'

    const dirVectors = {
      E: { dx: 1, dy: 0 },
      W: { dx: -1, dy: 0 },
      N: { dx: 0, dy: -1 },
      S: { dx: 0, dy: 1 }
    };

    let steps = 0;
    while (steps < 40) {
      steps++;
      const v = dirVectors[dir];
      const nextX = curX + v.dx;
      const nextY = curY + v.dy;

      // Stop if leaving 8x8 grid
      if (nextX < 0 || nextX > 7 || nextY < 0 || nextY > 7) {
        this.beamSegments.push({ x0: curX, y0: curY, x1: nextX, y1: nextY });
        break;
      }

      this.beamSegments.push({ x0: curX, y0: curY, x1: nextX, y1: nextY });
      curX = nextX;
      curY = nextY;

      // Check hit on Obstacle Block
      if (this.getBlockAt(curX, curY)) {
        break; // Beam absorbed
      }

      // Check hit on Target Sensor
      const target = this.getTargetAt(curX, curY);
      if (target) {
        target.lit = true;
      }

      // Check hit on Mirror (Reflection)
      const mirror = this.getMirrorAt(curX, curY);
      if (mirror) {
        // Reflect 90 degrees based on mirror orientation
        // angle 0 = '/' (SW to NE)
        // angle 1 = '\' (NW to SE)
        if (mirror.angle === 0) { // '/'
          if (dir === 'E') dir = 'N';
          else if (dir === 'S') dir = 'W';
          else if (dir === 'W') dir = 'S';
          else if (dir === 'N') dir = 'E';
        } else { // '\'
          if (dir === 'E') dir = 'S';
          else if (dir === 'N') dir = 'W';
          else if (dir === 'W') dir = 'N';
          else if (dir === 'S') dir = 'E';
        }
      }
    }
  },

  checkSolved() {
    const allLit = this.targets.every(t => t.lit);
    if (allLit) {
      this.state = 'SOLVED';
      this.solvedTimer = 2.0;
      APU.sfx('FANFARE');
    }
  },

  // --------------------------------------------------------------------------
  // 4. 256x240 CRT RENDERING
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    const cellSz = 22;
    const originX = 40;
    const originY = 38;

    // 1. Grid Background & Cells
    g.rect(originX, originY, 8 * cellSz, 8 * cellSz, 0);
    g.box(originX, originY, 8 * cellSz, 8 * cellSz, 2);

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        g.box(originX + x * cellSz, originY + y * cellSz, cellSz, cellSz, 1);
      }
    }

    // 2. Obstacle Blocks
    for (let b of this.blocks) {
      const bx = originX + b.x * cellSz;
      const by = originY + b.y * cellSz;
      g.rect(bx + 2, by + 2, cellSz - 4, cellSz - 4, 1);
      g.box(bx + 2, by + 2, cellSz - 4, cellSz - 4, 2);
    }

    // 3. Laser Emitter Source
    const emX = originX + this.emitter.x * cellSz + Math.floor(cellSz / 2);
    const emY = originY + this.emitter.y * cellSz + Math.floor(cellSz / 2);
    g.disc(emX, emY, 5, 3);
    g.circle(emX, emY, 8, 2);

    // 4. Target Sensors
    for (let t of this.targets) {
      const tx = originX + t.x * cellSz + Math.floor(cellSz / 2);
      const ty = originY + t.y * cellSz + Math.floor(cellSz / 2);
      g.circle(tx, ty, 7, t.lit ? 3 : 2);
      g.disc(tx, ty, 4, t.lit ? 3 : 1);
      if (t.lit) g.circle(tx, ty, 9, 3);
    }

    // 5. Laser Beam Segments (Gleaming phosphor rays)
    for (let s of this.beamSegments) {
      const x0 = originX + s.x0 * cellSz + Math.floor(cellSz / 2);
      const y0 = originY + s.y0 * cellSz + Math.floor(cellSz / 2);
      const x1 = originX + s.x1 * cellSz + Math.floor(cellSz / 2);
      const y1 = originY + s.y1 * cellSz + Math.floor(cellSz / 2);
      g.line(x0, y0, x1, y1, 3);
    }

    // 6. Angled Mirrors
    for (let m of this.mirrors) {
      const mx = originX + m.x * cellSz + Math.floor(cellSz / 2);
      const my = originY + m.y * cellSz + Math.floor(cellSz / 2);

      if (m.angle === 0) { // '/'
        g.line(mx - 8, my + 8, mx + 8, my - 8, 3);
        g.line(mx - 7, my + 9, mx + 9, my - 7, 2);
      } else { // '\'
        g.line(mx - 8, my - 8, mx + 8, my + 8, 3);
        g.line(mx - 7, my - 9, mx + 9, my + 7, 2);
      }
    }

    // 7. Grid Cursor Highlight Box
    const curPx = originX + this.cursorX * cellSz;
    const curPy = originY + this.cursorY * cellSz;
    g.box(curPx, curPy, cellSz, cellSz, 3);

    // 8. Top HUD (Level, Targets Lit)
    g.rect(0, 0, 256, 26, 0);
    g.line(0, 26, 256, 26, 2);

    g.text("STAGE " + (this.level + 1) + " / " + this.maxLevels, 10, 8, 3);
    const litCount = this.targets.filter(t => t.lit).length;
    g.textR("TARGETS: " + litCount + " / " + this.targets.length, 246, 8, litCount === this.targets.length ? 3 : 2);

    // 9. Bottom Controls
    g.rect(0, 214, 256, 26, 0);
    g.line(0, 214, 256, 214, 2);
    g.textC("D-PAD: SELECT CELL    [A]: ROTATE MIRROR 45°", 222, 2);

    // 10. Overlays
    if (this.state === 'SOLVED') {
      g.dither(30, 95, 196, 44, 0, 1);
      g.box(30, 95, 196, 44, 3);
      g.textC("★ TARGET ENERGIZED! ★", 110, 3);
    } else if (this.state === 'ALL_CLEAR') {
      g.dither(25, 65, 206, 75, 0, 1);
      g.box(25, 65, 206, 75, 3);
      g.textC("★ ALL OPTICAL STAGES CLEAR! ★", 80, 3);
      g.textC("MASTER OF PHOTONICS!", 98, 2);
      g.textC("[A] PLAY CAMPAIGN AGAIN", 124, 3);
    }
  }
};
