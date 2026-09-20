// js/cartridges/cart_030_marble_maze.js
// ============================================================================
// Cartridge #030: MARBLE MAZE (Authentic Wooden Labyrinth BRIO Simulation)
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[30] = {
  id: 30,
  name: "MARBLE MAZE",
  genre: 2, // PHYSICS
  scoreLabel: "PTS",
  desc: "AUTHENTIC BRIO WOOD LABYRINTH. TILT BOARD TO GUIDE CHROME MARBLE AROUND HOLES.",

  icon(g, x, y) {
    // 32x32 miniature wooden labyrinth board icon
    g.rect(x, y, 32, 32, 1);
    g.box(x, y, 32, 32, 2);
    g.line(x + 1, y + 1, x + 30, y + 1, 3);
    g.line(x + 1, y + 1, x + 1, y + 30, 3);
    g.line(x + 1, y + 30, x + 30, y + 30, 0);
    g.line(x + 30, y + 1, x + 30, y + 30, 0);

    // Inner recessed felt
    g.rect(x + 3, y + 3, 26, 26, 0);

    // Miniature wooden walls
    g.rect(x + 3, y + 10, 18, 2, 2);
    g.rect(x + 11, y + 18, 18, 2, 2);
    g.rect(x + 3, y + 24, 16, 2, 2);

    // Trap holes
    g.disc(x + 23, y + 7, 2, 1);
    g.px(x + 23, y + 7, 0);
    g.disc(x + 7, y + 15, 2, 1);
    g.px(x + 7, y + 15, 0);
    g.disc(x + 17, y + 27, 2, 1);
    g.px(x + 17, y + 27, 0);

    // Goal cup
    g.circle(x + 26, y + 26, 3, 3);
    g.px(x + 26, y + 26, 2);

    // Chrome marble with specular dot
    g.disc(x + 8, y + 7, 2, 2);
    g.px(x + 8, y + 6, 3);
  },

  // --------------------------------------------------------------------------
  // LEVEL DEFINITIONS (8-Level Progressive Labyrinth Campaign)
  // --------------------------------------------------------------------------
  levels: [
    // Level 1: The Winding Trail
    {
      name: "THE WINDING TRAIL",
      par: 14.0,
      start: { x: 34, y: 50 },
      goal: { x: 214, y: 204, r: 10 },
      walls: [
        [18, 74, 176, 5],
        [62, 124, 176, 5],
        [18, 174, 176, 5]
      ],
      holes: [
        [128, 99, 7],
        [135, 149, 7]
      ],
      stars: [
        { x: 128, y: 50 },
        { x: 36, y: 110 },
        { x: 160, y: 204 }
      ]
    },

    // Level 2: Slalom Alley
    {
      name: "SLALOM ALLEY",
      par: 18.0,
      start: { x: 36, y: 48 },
      goal: { x: 220, y: 206, r: 10 },
      walls: [
        [18, 68, 185, 4],
        [52, 108, 186, 4],
        [18, 148, 185, 4],
        [52, 188, 186, 4],
        // Slalom baffles
        [90, 30, 4, 22],
        [150, 46, 4, 22],
        [160, 72, 4, 22],
        [100, 86, 4, 22],
        [90, 112, 4, 22],
        [150, 126, 4, 22]
      ],
      holes: [
        [150, 38, 6.5],
        [90, 60, 6.5],
        [100, 78, 6.5],
        [160, 100, 6.5],
        [100, 168, 6.5]
      ],
      stars: [
        { x: 220, y: 88 },
        { x: 36, y: 128 },
        { x: 170, y: 206 }
      ]
    },

    // Level 3: The Crossroad
    {
      name: "THE CROSSROAD",
      par: 16.0,
      start: { x: 36, y: 50 },
      goal: { x: 220, y: 206, r: 10 },
      walls: [
        // Outer ring boundaries & gateways
        [54, 66, 54, 4], [148, 66, 54, 4],
        [54, 190, 54, 4], [148, 190, 54, 4],
        [54, 66, 4, 46], [54, 144, 4, 46],
        [202, 66, 4, 46], [202, 144, 4, 46],
        // Center cross dividers leaving central diamond
        [70, 126, 38, 4], [148, 126, 38, 4],
        [126, 76, 4, 32], [126, 148, 4, 32]
      ],
      holes: [
        // 4-hole diamond around central star
        [112, 112, 6.5],
        [144, 112, 6.5],
        [112, 144, 6.5],
        [144, 144, 6.5],
        // Outer ring hazard
        [128, 208, 7]
      ],
      stars: [
        { x: 36, y: 128, tag: "BRONZE" },
        { x: 220, y: 128, tag: "SILVER" },
        { x: 128, y: 128, tag: "GOLD" }
      ]
    },

    // Level 4: Bumper Baffle
    {
      name: "BUMPER BAFFLE",
      par: 20.0,
      start: { x: 36, y: 50 },
      goal: { x: 220, y: 206, r: 10 },
      bumpers: [
        [88, 80, 8],
        [168, 80, 8],
        [88, 176, 8],
        [168, 176, 8],
        [128, 128, 8]
      ],
      walls: [
        [18, 96, 52, 4],
        [186, 96, 52, 4],
        [18, 160, 52, 4],
        [186, 160, 52, 4],
        [104, 96, 48, 4],
        [104, 160, 48, 4]
      ],
      holes: [
        [128, 62, 7],
        [48, 128, 7],
        [208, 128, 7],
        [128, 194, 7]
      ],
      stars: [
        { x: 214, y: 50 },
        { x: 42, y: 196 },
        { x: 128, y: 102 }
      ]
    },

    // Level 5: Moving Hazards
    {
      name: "MOVING HAZARDS",
      par: 22.0,
      start: { x: 36, y: 50 },
      goal: { x: 220, y: 206, r: 10 },
      walls: [
        [18, 76, 126, 4],
        [90, 126, 148, 4],
        [18, 176, 136, 4]
      ],
      gates: [
        { x0: 144, y0: 74, w: 46, h: 8, axis: 'x', dist: 38, speed: 2.2, offset: 0 },
        { x0: 50, y0: 88, w: 8, h: 38, axis: 'y', dist: 26, speed: 2.0, offset: 1.5 },
        { x0: 154, y0: 174, w: 46, h: 8, axis: 'x', dist: 34, speed: 2.5, offset: 0.8 }
      ],
      holes: [
        [70, 100, 7],
        [190, 150, 7],
        [90, 204, 7]
      ],
      stars: [
        { x: 180, y: 50 },
        { x: 128, y: 150 },
        { x: 44, y: 204 }
      ]
    },

    // Level 6: The Chasm Bridges
    {
      name: "THE CHASM BRIDGES",
      par: 24.0,
      isChasm: true,
      start: { x: 38, y: 50 },
      goal: { x: 214, y: 204, r: 10 },
      walls: [], // Catwalks have no guard rails!
      bridges: [
        [22, 36, 32, 28],   // P1 Start
        [54, 44, 140, 12],  // B1
        [194, 36, 30, 28],  // P2
        [202, 64, 14, 52],  // B2
        [192, 116, 34, 28], // P3
        [60, 124, 132, 12], // B3
        [26, 116, 34, 28],  // P4
        [36, 144, 14, 46],  // B4
        [26, 190, 34, 28],  // P5
        [60, 198, 134, 12], // B5
        [194, 188, 38, 32]  // P6 Goal
      ],
      holes: [
        [209, 50, 6],
        [43, 130, 6]
      ],
      stars: [
        { x: 124, y: 50 },
        { x: 126, y: 130 },
        { x: 128, y: 204 }
      ]
    },

    // Level 7: The Spiral Vortex
    {
      name: "THE SPIRAL VORTEX",
      par: 26.0,
      start: { x: 34, y: 50 },
      goal: { x: 122, y: 144, r: 9 },
      walls: [
        [18, 70, 4, 156],
        [42, 66, 168, 4],
        [206, 66, 4, 132],
        [42, 194, 168, 4],
        [42, 102, 4, 96],
        [66, 98, 116, 4],
        [178, 98, 4, 72],
        [66, 166, 116, 4],
        [66, 130, 4, 40],
        [90, 126, 64, 4],
        [150, 126, 4, 18]
      ],
      holes: [
        [220, 50, 6.5],
        [220, 208, 6.5],
        [30, 208, 6.5],
        [192, 82, 6.5],
        [192, 180, 6.5],
        [54, 180, 6.5],
        [164, 112, 6.5]
      ],
      stars: [
        { x: 128, y: 50 },
        { x: 192, y: 132 },
        { x: 54, y: 132 }
      ]
    },

    // Level 8: Grand Master Labyrinth
    {
      name: "GRAND MASTER",
      par: 35.0,
      isMaster: true,
      start: { x: 34, y: 46 },
      goal: { x: 216, y: 160, r: 10 },
      checkpoints: [
        [34, 46], [70, 46], [110, 46], [150, 46], [200, 46],
        [220, 70], [220, 105], [180, 105], [140, 105], [95, 105],
        [50, 105], [34, 135], [70, 135], [110, 135], [150, 135],
        [190, 135], [220, 155], [220, 185], [180, 185], [140, 185],
        [105, 185], [65, 185], [34, 210], [70, 210], [110, 210],
        [150, 210], [185, 210], [204, 195], [170, 160], [216, 160]
      ],
      walls: [
        [18, 60, 185, 4],
        [50, 78, 4, 42],
        [50, 118, 188, 4],
        [18, 150, 185, 4],
        [50, 198, 188, 4],
        [98, 168, 4, 30],
        [150, 154, 4, 30],
        [190, 168, 4, 30]
      ],
      holes: [
        [130, 46, 6.5],
        [220, 88, 6.5],
        [160, 105, 6.5],
        [72, 105, 6.5],
        [34, 118, 6.5],
        [90, 135, 6.5],
        [170, 135, 6.5],
        [220, 170, 6.5],
        [160, 185, 6.5],
        [85, 185, 6.5],
        [52, 210, 6.5],
        [130, 210, 6.5]
      ],
      stars: [
        { x: 128, y: 76 },
        { x: 128, y: 135 },
        { x: 190, y: 160 }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // AUDIO SYNTHESIZER (Acoustic Wood & Metal Soundscape)
  // --------------------------------------------------------------------------
  playRumble(speed) {
    if (this.rumbleTimer > 0) return;
    this.rumbleTimer = 0.08;
    if (typeof APU !== 'undefined' && APU.softTone) {
      const freq = 80 + Math.min(100, speed * 0.5);
      const vol = Math.min(0.06, speed * 0.00035);
      APU.softTone(freq, 0.04, 'triangle', vol, 0, 0.005, 420);
    }
  },

  playWallClack(intensity) {
    if (typeof APU !== 'undefined') {
      const vol = Math.min(0.18, 0.04 + intensity * 0.0009);
      if (APU.noise) APU.noise(0.025, vol, 1400, 'bandpass');
      if (APU.softTone) APU.softTone(320, 0.035, 'triangle', vol * 0.7, 0, 0.002, 900);
    }
    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(6);
  },

  playBumperBoing() {
    if (typeof APU !== 'undefined') {
      if (APU.tone) APU.tone(480, 0.09, 'triangle', 0.16, 760);
      if (APU.softTone) APU.softTone(920, 0.06, 'sine', 0.12, 0.01);
    }
    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(14);
  },

  playHoleDrop() {
    if (typeof APU !== 'undefined') {
      if (APU.tone) APU.tone(300, 0.35, 'sine', 0.18, 50);
      if (APU.noise) APU.noise(0.20, 0.14, 180, 'lowpass', 0.08);
    }
    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(28);
  },

  playGoalFanfare() {
    if (typeof APU !== 'undefined' && APU.softTone) {
      const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      freqs.forEach((f, i) => APU.softTone(f, 0.22, 'sine', 0.08, i * 0.07, 0.01, 2200));
    }
    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(35);
  },

  playStarChime() {
    if (typeof APU !== 'undefined' && APU.softTone) {
      APU.softTone(1174.66, 0.09, 'sine', 0.09, 0, 0.005, 2400);
      APU.softTone(1760.00, 0.18, 'sine', 0.09, 0.05, 0.005, 2400);
    }
    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(8);
  },

  // --------------------------------------------------------------------------
  // DIFFICULTY CONFIGURATION
  // --------------------------------------------------------------------------
  getDifficulty() {
    const diff = (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : 1;
    if (diff === 0) {
      return {
        name: 'EASY',
        ballR: 3.5,
        gravity: 260,
        tiltSpeed: 8.5,
        friction: 0.978,
        maxSpeed: 150,
        suctionForce: 160,
        fatalMargin: 2.5,
        parMult: 1.25
      };
    } else if (diff === 2) {
      return {
        name: 'HARD',
        ballR: 4.2,
        gravity: 360,
        tiltSpeed: 12.0,
        friction: 0.985,
        maxSpeed: 210,
        suctionForce: 420,
        fatalMargin: 1.0,
        parMult: 0.85
      };
    }
    return {
      name: 'NORMAL',
      ballR: 4.0,
      gravity: 310,
      tiltSpeed: 10.0,
      friction: 0.982,
      maxSpeed: 180,
      suctionForce: 280,
      fatalMargin: 1.8,
      parMult: 1.0
    };
  },

  // --------------------------------------------------------------------------
  // INITIALIZATION & LIFECYCLE
  // --------------------------------------------------------------------------
  init() {
    this.currentLevelIdx = 0;
    this.unlockedLevels = 1;
    this.totalStars = 0;
    this.score = 0;
    this.campaignTime = 0;
    this.rumbleTimer = 0;
    this.touchActive = false;
    this.touchAnchorX = 0;
    this.touchAnchorY = 0;
    this.levelStars = [0, 0, 0, 0, 0, 0, 0, 0];

    this.startLevel(this.currentLevelIdx);
  },

  startLevel(idx) {
    this.currentLevelIdx = Math.max(0, Math.min(this.levels.length - 1, idx));
    const lvl = this.levels[this.currentLevelIdx];
    const diff = this.getDifficulty();

    this.state = 'PLAYING'; // 'PLAYING' | 'FALLING' | 'LEVEL_CLEAR' | 'CAMPAIGN_WON'
    this.levelTime = 0;
    this.bx = lvl.start.x;
    this.by = lvl.start.y;
    this.bvx = 0;
    this.bvy = 0;
    this.br = diff.ballR;

    // Board tilt normalized state
    this.tx = 0;
    this.ty = 0;
    this.targetTx = 0;
    this.targetTy = 0;

    // Fall animation state
    this.fallTimer = 0;
    this.fallOriginX = 0;
    this.fallOriginY = 0;
    this.fallType = 'HOLE'; // 'HOLE' | 'CHASM'

    // Bumper animations
    this.bumperPulses = [0, 0, 0, 0, 0];

    // Checkpoint system for Level 8
    this.checkpointIdx = 0;

    // Star collection state for this level
    this.collectedStars = [false, false, false];

    // Effective par time
    this.effectivePar = lvl.par * diff.parMult;
  },

  respawn() {
    const lvl = this.levels[this.currentLevelIdx];
    const diff = this.getDifficulty();
    this.state = 'PLAYING';
    this.fallTimer = 0;
    this.bvx = 0;
    this.bvy = 0;
    this.tx = 0;
    this.ty = 0;
    this.br = diff.ballR;

    if (lvl.isMaster && lvl.checkpoints && this.checkpointIdx > 0) {
      // Respawn at latest reached milestone (multiple of 5)
      const milestone = Math.floor(this.checkpointIdx / 5) * 5;
      const cp = lvl.checkpoints[milestone] || lvl.checkpoints[0];
      this.bx = cp[0];
      this.by = cp[1];
    } else {
      this.bx = lvl.start.x;
      this.by = lvl.start.y;
    }
  },

  startHoleFall(hx, hy) {
    this.state = 'FALLING';
    this.fallType = 'HOLE';
    this.fallTimer = 0;
    this.fallOriginX = hx;
    this.fallOriginY = hy;
    this.bvx = 0;
    this.bvy = 0;
    this.levelTime += 3.0; // 3s penalty
    this.playHoleDrop();
  },

  startChasmFall() {
    this.state = 'FALLING';
    this.fallType = 'CHASM';
    this.fallTimer = 0;
    this.fallOriginX = this.bx;
    this.fallOriginY = this.by;
    this.bvx = 0;
    this.bvy = 0;
    this.levelTime += 3.0; // 3s penalty
    this.playHoleDrop();
  },

  // --------------------------------------------------------------------------
  // GAMEPLAY LOOP & PHYSICS UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    if (this.rumbleTimer > 0) this.rumbleTimer -= dt;

    // Handle Victory Screens
    if (this.state === 'LEVEL_CLEAR') {
      if (PAD.hit('a') || PAD.hit('start')) {
        if (this.currentLevelIdx < this.levels.length - 1) {
          this.startLevel(this.currentLevelIdx + 1);
        } else {
          this.state = 'CAMPAIGN_WON';
        }
      } else if (PAD.hit('b')) {
        // Replay current level to improve par time or gather stars
        this.startLevel(this.currentLevelIdx);
      }
      return;
    }

    if (this.state === 'CAMPAIGN_WON') {
      if (PAD.hit('a') || PAD.hit('start')) {
        this.init();
      }
      return;
    }

    // Handle Hole / Chasm Fall Spiral Animation
    if (this.state === 'FALLING') {
      this.fallTimer += dt;
      if (PAD.hit('a')) {
        // Quick restart on fall
        this.respawn();
        return;
      }
      if (this.fallTimer >= 0.55) {
        this.respawn();
      }
      return;
    }

    // --- Active Gameplay ---
    this.levelTime += dt;
    this.campaignTime += dt;
    const lvl = this.levels[this.currentLevelIdx];
    const diff = this.getDifficulty();

    // 1. Process Input Controls (D-Pad, Keyboard, Gyro, Mobile Touch)
    let inX = 0, inY = 0;
    if (PAD.held('left')) inX -= 1.0;
    if (PAD.held('right')) inX += 1.0;
    if (PAD.held('up')) inY -= 1.0;
    if (PAD.held('down')) inY += 1.0;

    // Mobile Touch Drag Control
    if (PAD.pointer && PAD.pointer.down) {
      if (!this.touchActive) {
        this.touchActive = true;
        this.touchAnchorX = PAD.pointer.x;
        this.touchAnchorY = PAD.pointer.y;
      }
      const tdx = PAD.pointer.x - this.touchAnchorX;
      const tdy = PAD.pointer.y - this.touchAnchorY;
      const maxDrag = 36;
      inX = Math.max(-1, Math.min(1, tdx / maxDrag));
      inY = Math.max(-1, Math.min(1, tdy / maxDrag));
    } else {
      this.touchActive = false;
    }

    // Gyro / Device Tilt Support
    if (PAD.tilt && (Math.abs(PAD.tilt.x) > 0.05 || Math.abs(PAD.tilt.y) > 0.05)) {
      inX += Math.max(-1, Math.min(1, PAD.tilt.x * 1.5));
      inY += Math.max(-1, Math.min(1, PAD.tilt.y * 1.5));
    }

    // Clamp input tilt vector
    const inMag = Math.hypot(inX, inY);
    if (inMag > 1.0) {
      inX /= inMag;
      inY /= inMag;
    }
    this.targetTx = inX;
    this.targetTy = inY;

    // 2. Board Tilt Momentum & Spring Damping
    const tiltLerp = Math.min(1.0, diff.tiltSpeed * dt);
    this.tx += (this.targetTx - this.tx) * tiltLerp;
    this.ty += (this.targetTy - this.ty) * tiltLerp;

    // Brake Button [B]: Physical brake centers board tilt and applies damping
    if (PAD.held('b')) {
      this.tx *= Math.pow(0.5, dt * 60);
      this.ty *= Math.pow(0.5, dt * 60);
      this.bvx *= Math.pow(0.85, dt * 60);
      this.bvy *= Math.pow(0.85, dt * 60);
    }

    // Update Moving Gates (Level 5)
    if (lvl.gates) {
      for (let g of lvl.gates) {
        const osc = Math.sin(this.levelTime * g.speed + g.offset) * g.dist;
        if (g.axis === 'x') {
          g.x = g.x0 + osc;
          g.y = g.y0;
        } else {
          g.x = g.x0;
          g.y = g.y0 + osc;
        }
      }
    }

    // Update Bumper pulse timers (Level 4)
    if (lvl.bumpers) {
      for (let i = 0; i < lvl.bumpers.length; i++) {
        if (this.bumperPulses[i] > 0) this.bumperPulses[i] -= dt;
      }
    }

    // 3. Continuous Substepped Physics Simulation
    const substeps = 4;
    const sdt = dt / substeps;
    const ax = diff.gravity * this.tx;
    const ay = diff.gravity * this.ty;
    const frameFriction = Math.pow(diff.friction, sdt * 60);

    for (let step = 0; step < substeps; step++) {
      // Marble gravity acceleration
      this.bvx += ax * sdt;
      this.bvy += ay * sdt;

      // Rolling friction & air drag
      this.bvx *= frameFriction;
      this.bvy *= frameFriction;

      // Terminal velocity
      const curSpeed = Math.hypot(this.bvx, this.bvy);
      if (curSpeed > diff.maxSpeed) {
        this.bvx = (this.bvx / curSpeed) * diff.maxSpeed;
        this.bvy = (this.bvy / curSpeed) * diff.maxSpeed;
      }

      // Move marble
      this.bx += this.bvx * sdt;
      this.by += this.bvy * sdt;

      // Rolling sound rumble
      if (curSpeed > 18) this.playRumble(curSpeed);

      // Outer Board Rim Collision (Playing field bounds: [18, 30, 220, 196])
      const minX = 18 + this.br, maxX = 238 - this.br;
      const minY = 30 + this.br, maxY = 226 - this.br;

      if (!lvl.isChasm) {
        if (this.bx < minX) {
          const impact = Math.abs(this.bvx);
          this.bx = minX;
          this.bvx = -this.bvx * 0.65;
          if (impact > 18) this.playWallClack(impact);
        } else if (this.bx > maxX) {
          const impact = Math.abs(this.bvx);
          this.bx = maxX;
          this.bvx = -this.bvx * 0.65;
          if (impact > 18) this.playWallClack(impact);
        }

        if (this.by < minY) {
          const impact = Math.abs(this.bvy);
          this.by = minY;
          this.bvy = -this.bvy * 0.65;
          if (impact > 18) this.playWallClack(impact);
        } else if (this.by > maxY) {
          const impact = Math.abs(this.bvy);
          this.by = maxY;
          this.bvy = -this.bvy * 0.65;
          if (impact > 18) this.playWallClack(impact);
        }
      }

      // Static Wall Collisions (AABB Corner/Capsule)
      if (lvl.walls) {
        for (let w of lvl.walls) {
          const imp = this.resolveBoxCollision(w[0], w[1], w[2], w[3]);
          if (imp > 18) this.playWallClack(imp);
        }
      }

      // Moving Gate Collisions (Level 5)
      if (lvl.gates) {
        for (let g of lvl.gates) {
          const imp = this.resolveBoxCollision(g.x, g.y, g.w, g.h);
          if (imp > 18) this.playWallClack(imp);
        }
      }

      // Pinball Bumper Collisions (Level 4)
      if (lvl.bumpers) {
        for (let i = 0; i < lvl.bumpers.length; i++) {
          const bmp = lvl.bumpers[i];
          const bdx = this.bx - bmp[0];
          const bdy = this.by - bmp[1];
          const minDist = this.br + bmp[2];
          const distSq = bdx * bdx + bdy * bdy;
          if (distSq < minDist * minDist) {
            const d = Math.sqrt(distSq) || 0.001;
            const nx = bdx / d, ny = bdy / d;
            const pen = minDist - d;
            this.bx += nx * pen;
            this.by += ny * pen;

            // Elastic repulsion with minimum impulse
            const vn = this.bvx * nx + this.bvy * ny;
            const repSpd = Math.max(130, Math.abs(vn) * 1.35);
            this.bvx = nx * repSpd;
            this.bvy = ny * repSpd;

            this.bumperPulses[i] = 0.22;
            this.playBumperBoing();
          }
        }
      }

      // Chasm Catwalk Fall Detection (Level 6)
      if (lvl.isChasm && lvl.bridges) {
        let onPlank = false;
        for (let b of lvl.bridges) {
          if (this.bx >= b[0] && this.bx <= b[0] + b[2] &&
              this.by >= b[1] && this.by <= b[1] + b[3]) {
            onPlank = true;
            break;
          }
        }
        if (!onPlank) {
          this.startChasmFall();
          return;
        }
      }

      // Hole Gravitational Suction & Traps
      if (lvl.holes) {
        for (let h of lvl.holes) {
          const hx = h[0], hy = h[1], hr = h[2];
          const hdx = hx - this.bx;
          const hdy = hy - this.by;
          const dh = Math.hypot(hdx, hdy);
          const suctionZone = hr + this.br + 5;

          if (dh < suctionZone) {
            const pullNorm = Math.max(0.05, (suctionZone - dh) / suctionZone);
            const force = diff.suctionForce * pullNorm * pullNorm;
            const ux = hdx / (dh || 0.001);
            const uy = hdy / (dh || 0.001);

            this.bvx += ux * force * sdt;
            this.bvy += uy * force * sdt;

            // Fatal capture over hole lip
            if (dh < hr - diff.fatalMargin) {
              this.startHoleFall(hx, hy);
              return;
            }
          }
        }
      }
    }

    // 4. Collectible Stars Check
    if (lvl.stars) {
      for (let i = 0; i < lvl.stars.length; i++) {
        if (!this.collectedStars[i]) {
          const s = lvl.stars[i];
          if (Math.hypot(this.bx - s.x, this.by - s.y) < this.br + 5) {
            this.collectedStars[i] = true;
            this.playStarChime();
          }
        }
      }
    }

    // 5. Waypoints / Checkpoints Tracking (Level 8)
    if (lvl.isMaster && lvl.checkpoints) {
      for (let i = 0; i < lvl.checkpoints.length; i++) {
        const cp = lvl.checkpoints[i];
        if (Math.hypot(this.bx - cp[0], this.by - cp[1]) < 12) {
          if (i > this.checkpointIdx) {
            this.checkpointIdx = i;
          }
        }
      }
    }

    // 6. Goal Collision Check
    const gdx = this.bx - lvl.goal.x;
    const gdy = this.by - lvl.goal.y;
    if (Math.hypot(gdx, gdy) < lvl.goal.r - 2) {
      this.completeLevel();
    }
  },

  resolveBoxCollision(bx, by, bw, bh) {
    const cx = this.bx, cy = this.by, r = this.br;
    const px = Math.max(bx, Math.min(cx, bx + bw));
    const py = Math.max(by, Math.min(cy, by + bh));
    const dx = cx - px;
    const dy = cy - py;
    const distSq = dx * dx + dy * dy;

    if (distSq < r * r) {
      const d = Math.sqrt(distSq);
      let nx = 0, ny = 0, pen = 0;

      if (d > 0.0001) {
        nx = dx / d;
        ny = dy / d;
        pen = r - d;
      } else {
        // Internal penetration: eject along shallowest axis
        const left = cx - bx;
        const right = (bx + bw) - cx;
        const top = cy - by;
        const bottom = (by + bh) - cy;
        const minPen = Math.min(left, right, top, bottom);
        if (minPen === left) { nx = -1; ny = 0; pen = r + left; }
        else if (minPen === right) { nx = 1; ny = 0; pen = r + right; }
        else if (minPen === top) { nx = 0; ny = -1; pen = r + top; }
        else { nx = 0; ny = 1; pen = r + bottom; }
      }

      this.bx += nx * pen;
      this.by += ny * pen;

      const vn = this.bvx * nx + this.bvy * ny;
      if (vn < 0) {
        const restitution = 0.65;
        const wallFriction = 0.95;
        const vtX = this.bvx - vn * nx;
        const vtY = this.bvy - vn * ny;
        this.bvx = -restitution * vn * nx + vtX * wallFriction;
        this.bvy = -restitution * vn * ny + vtY * wallFriction;
        return -vn; // Impact velocity
      }
    }
    return 0;
  },

  completeLevel() {
    this.playGoalFanfare();
    const lvl = this.levels[this.currentLevelIdx];
    let starsEarned = 1; // 1 star for clearing the level

    // Count collected stars
    let collectedCount = 0;
    for (let c of this.collectedStars) if (c) collectedCount++;
    if (collectedCount >= 2) starsEarned++;
    if (collectedCount >= 3 || this.levelTime <= this.effectivePar) starsEarned++;
    starsEarned = Math.min(3, starsEarned);

    this.levelStars[this.currentLevelIdx] = Math.max(this.levelStars[this.currentLevelIdx], starsEarned);
    this.totalStars = this.levelStars.reduce((a, b) => a + b, 0);

    // Calculate level score
    const parBonus = Math.max(0, Math.floor((this.effectivePar - this.levelTime) * 80));
    const starBonus = collectedCount * 300;
    const levelScore = 1000 + parBonus + starBonus;
    this.score += levelScore;

    // High Score Persistence
    if (typeof SAVE !== 'undefined' && SAVE.setScore) {
      SAVE.setScore(this.id, this.score);
    }

    if (this.currentLevelIdx >= this.levels.length - 1) {
      this.state = 'CAMPAIGN_WON';
    } else {
      this.state = 'LEVEL_CLEAR';
      this.unlockedLevels = Math.max(this.unlockedLevels, this.currentLevelIdx + 2);
    }
  },

  // --------------------------------------------------------------------------
  // PERSISTENCE (SAVE / LOAD)
  // --------------------------------------------------------------------------
  save() {
    return {
      unlockedLevels: this.unlockedLevels,
      levelStars: this.levelStars,
      highScore: this.score
    };
  },

  load(data) {
    if (data && typeof data === 'object') {
      if (data.unlockedLevels) this.unlockedLevels = data.unlockedLevels;
      if (data.levelStars && Array.isArray(data.levelStars)) this.levelStars = data.levelStars;
      if (data.highScore) this.score = data.highScore;
      this.totalStars = this.levelStars.reduce((a, b) => a + b, 0);
    }
  },

  // --------------------------------------------------------------------------
  // RENDERING ENGINE (Aesthetic Beveled Wood, Chrome Specular, CRT Phosphor)
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);
    const lvl = this.levels[this.currentLevelIdx];
    const diff = this.getDifficulty();

    // 1. Outer Polished Wooden Labyrinth Frame (BRIO Cabinet)
    // Frame exterior: [10, 22, 236, 214]
    g.rect(10, 22, 236, 214, 1);
    g.box(10, 22, 236, 214, 2);

    // Cabinet outer bevel highlights & shadows
    g.line(11, 23, 244, 23, 3);
    g.line(11, 23, 11, 234, 3);
    g.line(11, 235, 245, 235, 0);
    g.line(245, 23, 245, 235, 0);

    // Fine wood grain stripes along cabinet frame
    for (let gy = 26; gy <= 230; gy += 6) {
      g.line(12, gy, 16, gy, 2);
      g.line(239, gy, 244, gy, 2);
    }

    // Corner Brass Screws / Rivets
    const rivets = [[14, 26], [242, 26], [14, 232], [242, 232]];
    for (let [rx, ry] of rivets) {
      g.rect(rx - 1, ry - 1, 3, 3, 0);
      g.rect(rx, ry, 2, 2, 2);
      g.px(rx, ry, 3);
    }

    // Inner Recessed Bezel
    g.rect(17, 29, 222, 202, 0);

    // 2. Playing Field Surface (220 x 196)
    if (lvl.isChasm) {
      // Chasm Abyss: pitch black void
      g.rect(18, 30, 220, 196, 0);

      // Render Wooden Bridge Planks
      if (lvl.bridges) {
        for (let b of lvl.bridges) {
          // Plank drop shadow in abyss
          g.rect(b[0] + 1, b[1] + 1, b[2], b[3], 1);
          // Plank wooden surface
          g.rect(b[0], b[1], b[2], b[3], 2);
          // Plank beveled edge highlight
          g.line(b[0], b[1], b[0] + b[2] - 1, b[1], 3);
          g.line(b[0], b[1], b[0], b[1] + b[3] - 1, 3);
          g.line(b[0], b[1] + b[3] - 1, b[0] + b[2] - 1, b[1] + b[3] - 1, 0);
          g.line(b[0] + b[2] - 1, b[1], b[0] + b[2] - 1, b[1] + b[3] - 1, 0);
        }
      }
    } else {
      // Recessed fine oak felt floor
      g.dither(18, 30, 220, 196, 0, 1);
    }

    // 3. Goal Cup (Recessed metallic receptacle)
    const gx = lvl.goal.x, gy = lvl.goal.y, gr = lvl.goal.r;
    g.disc(gx, gy, gr + 2, 1);
    g.circle(gx, gy, gr + 1, 2);
    g.disc(gx, gy, gr - 1, 0);
    g.circle(gx, gy, gr - 3, 3);
    g.disc(gx, gy, 2, 3);

    // 4. Trap Holes (Deep black cavities with beveled wooden lip)
    if (lvl.holes) {
      for (let h of lvl.holes) {
        const hx = h[0], hy = h[1], hr = h[2];
        // Outer beveled lip
        g.circle(hx, hy, hr + 1.5, 1);
        // Deep void
        g.disc(hx, hy, hr, 0);
        // Hole inner rim shadow
        g.circle(hx, hy, hr - 1.5, 1);

        // Suction vortex indicator when marble is close
        const dist = Math.hypot(this.bx - hx, this.by - hy);
        if (dist < hr + this.br + 5 && dist > 1) {
          const spin = (this.levelTime * 10) % (Math.PI * 2);
          const px1 = Math.round(hx + Math.cos(spin) * (hr + 2));
          const py1 = Math.round(hy + Math.sin(spin) * (hr + 2));
          const px2 = Math.round(hx - Math.cos(spin) * (hr + 2));
          const py2 = Math.round(hy - Math.sin(spin) * (hr + 2));
          g.px(px1, py1, 3);
          g.px(px2, py2, 3);
        }
      }
    }

    // 5. Beveled Wooden Maze Partition Walls
    if (lvl.walls) {
      for (let w of lvl.walls) {
        const wx = w[0], wy = w[1], ww = w[2], wh = w[3];
        // Drop shadow
        g.rect(wx + 1, wy + 1, ww, wh, 0);
        // Wall body
        g.rect(wx, wy, ww, wh, 2);
        // Top & left illuminated bevel
        g.line(wx, wy, wx + ww - 1, wy, 3);
        g.line(wx, wy, wx, wy + wh - 1, 3);
        // Bottom & right shadow edge
        g.line(wx, wy + wh - 1, wx + ww - 1, wy + wh - 1, 0);
        g.line(wx + ww - 1, wy, wx + ww - 1, wy + wh - 1, 0);
      }
    }

    // 6. Moving Gates (Level 5)
    if (lvl.gates) {
      for (let gt of lvl.gates) {
        const gx0 = Math.round(gt.x), gy0 = Math.round(gt.y);
        // Track slot in floor
        if (gt.axis === 'x') {
          g.rect(gt.x0 - gt.dist, gy0 + 2, gt.dist * 2 + gt.w, 4, 0);
        } else {
          g.rect(gx0 + 2, gt.y0 - gt.dist, 4, gt.dist * 2 + gt.h, 0);
        }
        // Gate body with hazard stripes
        g.rect(gx0, gy0, gt.w, gt.h, 2);
        g.box(gx0, gy0, gt.w, gt.h, 3);
        if (gt.w > gt.h) {
          for (let sx = gx0 + 4; sx < gx0 + gt.w - 2; sx += 8) {
            g.line(sx, gy0 + 1, sx + 3, gy0 + gt.h - 2, 3);
          }
        } else {
          for (let sy = gy0 + 4; sy < gy0 + gt.h - 2; sy += 8) {
            g.line(gx0 + 1, sy, gx0 + gt.w - 2, sy + 3, 3);
          }
        }
      }
    }

    // 7. Rubber Elastic Bumpers (Level 4)
    if (lvl.bumpers) {
      for (let i = 0; i < lvl.bumpers.length; i++) {
        const bmp = lvl.bumpers[i];
        const pulse = this.bumperPulses[i] > 0;
        const br = bmp[2] + (pulse ? 2 : 0);
        g.disc(bmp[0], bmp[1], br, 1);
        g.circle(bmp[0], bmp[1], br, pulse ? 3 : 2);
        g.circle(bmp[0], bmp[1], br - 2, 3);
        g.disc(bmp[0], bmp[1], 2, pulse ? 3 : 1);
      }
    }

    // 8. Numbered Checkpoints (Level 8: Grand Master Labyrinth)
    if (lvl.isMaster && lvl.checkpoints) {
      for (let i = 0; i < lvl.checkpoints.length; i++) {
        const cp = lvl.checkpoints[i];
        const num = i + 1;
        // Engrave milestone numbers in wood
        if (num % 5 === 0 || num === 1) {
          const reached = this.checkpointIdx >= i;
          const col = reached ? 3 : 2;
          g.rect(cp[0] - 6, cp[1] - 4, 12, 8, 0);
          g.box(cp[0] - 6, cp[1] - 4, 12, 8, col);
          const str = String(num);
          const tx = cp[0] - (str.length * 5 - 1) / 2;
          g.text(str, tx, cp[1] - 3, col);
        } else {
          // Small dot for intermediate checkpoints
          g.px(cp[0], cp[1], this.checkpointIdx >= i ? 3 : 1);
        }
      }
    }

    // 9. Collectible Stars
    if (lvl.stars) {
      for (let i = 0; i < lvl.stars.length; i++) {
        const s = lvl.stars[i];
        if (this.collectedStars[i]) {
          // Collected ghost outline
          g.circle(s.x, s.y, 2, 1);
        } else {
          // Bright twinkling star
          const pulse = (Math.sin(this.levelTime * 6 + i) > 0) ? 1 : 0;
          g.text("★", s.x - 2, s.y - 3, 3);
          if (pulse) g.circle(s.x, s.y, 4, 2);
        }
      }
    }

    // 10. Chrome Marble Ball Bearing
    if (this.state === 'FALLING') {
      // Falling spiral animation
      const p = Math.min(1.0, this.fallTimer / 0.5);
      const curR = Math.max(0, this.br * (1.0 - p));
      const angle = this.fallTimer * 20;
      const spiralDist = (1.0 - p) * 6;
      const mx = Math.round(this.fallOriginX + Math.cos(angle) * spiralDist);
      const my = Math.round(this.fallOriginY + Math.sin(angle) * spiralDist);

      if (curR >= 1) {
        g.disc(mx, my, Math.round(curR), 2);
        g.px(mx, my, 3);
      }
    } else {
      // Normal rolling marble
      const mx = Math.round(this.bx);
      const my = Math.round(this.by);
      const r = Math.round(this.br);

      // Rolling ball drop shadow on floor
      const shX = mx + 2 - Math.round(this.tx * 2);
      const shY = my + 2 - Math.round(this.ty * 2);
      g.disc(shX, shY, r, 0);

      // Chrome ball outer contour & gradient
      g.disc(mx, my, r, 1);
      g.disc(mx, my, r - 0.7, 2);

      // Specular glint dot tracking light source and tilt
      const glintX = mx - 1 + Math.round(this.tx * 0.8);
      const glintY = my - 1 + Math.round(this.ty * 0.8);
      g.px(glintX, glintY, 3);
      g.px(glintX + 1, glintY, 3);
    }

    // 11. Top HUD Area (y = 0..20)
    g.rect(0, 0, 256, 21, 0);
    g.line(0, 21, 256, 21, 2);

    // Maze Number & Difficulty
    const mazeNumStr = "MAZE " + (this.currentLevelIdx + 1) + "/8";
    g.text(mazeNumStr, 6, 4, 3);
    g.text(diff.name, 6, 12, 2);

    // Time & Par
    const min = Math.floor(this.levelTime / 60);
    const sec = Math.floor(this.levelTime % 60);
    const tenths = Math.floor((this.levelTime * 10) % 10);
    const timeStr = "T:" + String(min).padStart(2, '0') + ":" +
                    String(sec).padStart(2, '0') + "." + tenths;
    g.text(timeStr, 68, 4, 3);

    const parSec = Math.floor(this.effectivePar);
    const parStr = "PAR:" + parSec + "S";
    g.text(parStr, 68, 12, 1);

    // Stars Count
    let starStr = "";
    for (let i = 0; i < 3; i++) {
      starStr += this.collectedStars[i] ? "★" : "·";
    }
    g.text(starStr, 134, 4, 3);
    if (lvl.isMaster) {
      const cpStr = "CP:" + (this.checkpointIdx + 1) + "/30";
      g.text(cpStr, 134, 12, 2);
    } else {
      g.text("★:" + this.totalStars + "/24", 134, 12, 2);
    }

    // High Score & Gimbal Bubble Level
    const hiScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;
    g.textR("HI:" + hiScore, 222, 4, 2);
    g.textR("SC:" + this.score, 222, 12, 3);

    // Gimbal / Bubble Level Tilt Gauge (246, 10)
    const gx0 = 244, gy0 = 10;
    g.circle(gx0, gy0, 6, 1);
    g.box(gx0 - 6, gy0 - 6, 13, 13, 2);
    const bbx = gx0 + Math.round(this.tx * 4);
    const bby = gy0 + Math.round(this.ty * 4);
    g.px(bbx, bby, 3);

    // Mobile touch vector drag indicator
    if (this.touchActive) {
      g.circle(Math.round(this.touchAnchorX), Math.round(this.touchAnchorY), 10, 1);
      g.line(Math.round(this.touchAnchorX), Math.round(this.touchAnchorY),
             Math.round(PAD.pointer.x), Math.round(PAD.pointer.y), 3);
      g.disc(Math.round(PAD.pointer.x), Math.round(PAD.pointer.y), 2, 3);
    }

    // 12. Modal Overlays (Level Clear & Campaign Victory)
    if (this.state === 'LEVEL_CLEAR') {
      g.dither(32, 60, 192, 116, 0, 1);
      g.box(32, 60, 192, 116, 3);
      g.box(34, 62, 188, 112, 2);

      g.textC("MAZE " + (this.currentLevelIdx + 1) + " CLEARED!", 72, 3);
      g.line(44, 82, 212, 82, 2);

      const tSec = this.levelTime.toFixed(1);
      g.textC("TIME: " + tSec + "S  (PAR " + this.effectivePar.toFixed(0) + "S)", 90, 2);

      let sLine = "STARS: ";
      for (let i = 0; i < this.levelStars[this.currentLevelIdx]; i++) sLine += "★";
      g.textC(sLine, 104, 3);

      g.textC("SCORE: " + this.score + " PTS", 120, 2);

      g.textC("[A] NEXT MAZE    [B] REPLAY", 146, 3);
    } else if (this.state === 'CAMPAIGN_WON') {
      g.dither(24, 46, 208, 144, 0, 1);
      g.box(24, 46, 208, 144, 3);
      g.box(26, 48, 204, 140, 2);

      g.textC("★ GRAND MASTER! ★", 58, 3);
      g.textC("LABYRINTH BEATEN", 70, 2);
      g.line(36, 80, 220, 80, 2);

      const totalMin = Math.floor(this.campaignTime / 60);
      const totalSec = Math.floor(this.campaignTime % 60);
      g.textC("TOTAL TIME: " + totalMin + "M " + totalSec + "S", 92, 3);
      g.textC("TOTAL STARS: " + this.totalStars + "/24", 108, 3);
      g.textC("FINAL SCORE: " + this.score + " PTS", 124, 3);

      g.textC("[A] PLAY AGAIN", 154, 3);
    }
  }
};
