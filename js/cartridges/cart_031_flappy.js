// js/cartridges/cart_031_flappy.js
// ============================================================================
// Cartridge #031: FLAPPY
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 31. FLAPPY
CARTS[31] = {
  id: 31,
  name: "FLAPPY",
  genre: 3,
  scoreLabel: "PIPES",
  desc: "TAP [A] / SCREEN TO FLAP! THREAD THE PIPES AND WIN BRONZE, SILVER, GOLD & PLATINUM MEDALS!",

  // 3-Frame Animated Pixel Bird Sprites (14 wide x 10 high)
  // Palette: . = transparent, 0 = black pupil, 1 = dark shadow/outline, 2 = mid green/beak, 3 = bright phosphor
  BIRD_FRAMES: [
    // Frame 0: Wing UP
    [
      '....11111.....',
      '..11333331....',
      '.1333333031...',
      '1332233303122.',
      '13233233331232',
      '1332233331122.',
      '122222221.....',
      '.1222221......',
      '..11111.......',
      '..............'
    ],
    // Frame 1: Wing MID (tucked)
    [
      '....11111.....',
      '..11333331....',
      '.1333333031...',
      '1333333303122.',
      '13222233331232',
      '1333333331122.',
      '122222221.....',
      '.1222221......',
      '..11111.......',
      '..............'
    ],
    // Frame 2: Wing DOWN
    [
      '....11111.....',
      '..11333331....',
      '.1333333031...',
      '1333333303122.',
      '13333333331232',
      '1332233331122.',
      '122332221.....',
      '.1222221......',
      '..11111.......',
      '..............'
    ]
  ],

  // Parallax Scenery Data
  BUILDINGS: [
    { x: 0,   w: 20, h: 32, sp: 0 },
    { x: 22,  w: 16, h: 48, sp: 8 },
    { x: 40,  w: 26, h: 28, sp: 0 },
    { x: 68,  w: 18, h: 44, sp: 0 },
    { x: 88,  w: 22, h: 56, sp: 10 },
    { x: 112, w: 20, h: 32, sp: 0 },
    { x: 134, w: 28, h: 42, sp: 0 },
    { x: 164, w: 18, h: 48, sp: 6 },
    { x: 184, w: 24, h: 34, sp: 0 },
    { x: 210, w: 22, h: 52, sp: 12 },
    { x: 234, w: 20, h: 26, sp: 0 }
  ],

  CLOUDS: [
    { x: 16,  y: 22, w: 32 },
    { x: 96,  y: 38, w: 26 },
    { x: 176, y: 26, w: 36 }
  ],

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Background skyline hint
    g.rect(x + 2, y + 18, 28, 6, 1);
    // Ground
    g.rect(x + 2, y + 24, 28, 6, 2);
    g.line(x + 2, y + 24, x + 29, y + 24, 3);
    // Top pipe
    g.rect(x + 20, y + 2, 7, 7, 2);
    g.rect(x + 19, y + 9, 9, 3, 3);
    // Bottom pipe
    g.rect(x + 19, y + 19, 9, 3, 3);
    g.rect(x + 20, y + 22, 7, 3, 2);
    // Flappy bird
    g.disc(x + 10, y + 14, 4, 3);
    g.px(x + 12, y + 13, 0);
    g.rect(x + 13, y + 14, 2, 2, 2);
    g.line(x + 7, y + 14, x + 9, y + 14, 1);
  },

  getDifficulty() {
    return (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : 1;
  },

  // Circle to Box AABB exact collision helper
  circleBox(cx, cy, r, bx, by, bw, bh) {
    if (bw <= 0 || bh <= 0) return false;
    const closestX = Math.max(bx, Math.min(cx, bx + bw));
    const closestY = Math.max(by, Math.min(cy, by + bh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) < (r * r);
  },

  getMedal(score) {
    if (score >= 100) return { name: 'PLATINUM', tier: 4, col: 3, fill: 3 };
    if (score >= 50)  return { name: 'GOLD',     tier: 3, col: 3, fill: 2 };
    if (score >= 25)  return { name: 'SILVER',   tier: 2, col: 2, fill: 3 };
    if (score >= 10)  return { name: 'BRONZE',   tier: 1, col: 2, fill: 1 };
    return { name: 'NONE', tier: 0, col: 1, fill: 0 };
  },

  // Audio Synthesis Routines
  playFlapSfx() {
    if (typeof APU === 'undefined') return;
    if (APU.softTone) APU.softTone(340, 0.06, 'sine', 0.08, 0, 0.005, 1600);
    if (APU.noise) APU.noise(0.03, 0.04, 1800, 'bandpass');
  },

  playScoreSfx() {
    if (typeof APU === 'undefined') return;
    if (APU.softTone) {
      APU.softTone(1174.66, 0.08, 'sine', 0.10, 0.00, 0.005, 2500); // D6 crystal ding
      APU.softTone(1760.00, 0.20, 'sine', 0.09, 0.04, 0.005, 3000); // A6 overtone
    }
  },

  playHitSfx() {
    if (typeof APU === 'undefined') return;
    if (APU.noise) APU.noise(0.10, 0.25, 800, 'lowpass');
    if (APU.softTone) APU.softTone(150, 0.15, 'triangle', 0.14, 0, 0.005, 400);
  },

  playThudSfx() {
    if (typeof APU === 'undefined') return;
    if (APU.noise) APU.noise(0.18, 0.30, 250, 'lowpass');
    if (APU.softTone) APU.softTone(75, 0.25, 'sine', 0.20, 0, 0.01, 200);
  },

  playFanfare(medalTier) {
    if (typeof APU === 'undefined' || !APU.softTone) return;
    if (medalTier >= 3) {
      // Gold & Platinum fanfare
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        APU.softTone(f, 0.20, 'sine', 0.08, i * 0.08, 0.01, 2200);
      });
    } else if (medalTier >= 1) {
      // Bronze & Silver fanfare
      [392.00, 523.25, 659.25].forEach((f, i) => {
        APU.softTone(f, 0.18, 'sine', 0.07, i * 0.09, 0.01, 1800);
      });
    } else {
      // Standard game over tally
      APU.softTone(261.63, 0.25, 'triangle', 0.07, 0, 0.01, 800);
    }
  },

  init() {
    const diff = this.getDifficulty();
    this.diff = diff;
    const diffNames = ['EASY', 'NORMAL', 'HARD'];
    this.diffName = diffNames[diff] || 'NORMAL';

    // Difficulty tuning
    if (diff === 0) { // EASY: 54px gap, 55 px/s, gentler gravity
      this.pipeGap = 54;
      this.scrollSpeed = 55;
      this.gravity = 300;
      this.flapImpulse = -125;
      this.pipeSpacing = 138;
    } else if (diff === 2) { // HARD: 38px gap, 80 px/s, tight clearances
      this.pipeGap = 38;
      this.scrollSpeed = 80;
      this.gravity = 420;
      this.flapImpulse = -140;
      this.pipeSpacing = 124;
    } else { // NORMAL: 46px gap, 65 px/s, standard physics
      this.pipeGap = 46;
      this.scrollSpeed = 65;
      this.gravity = 360;
      this.flapImpulse = -135;
      this.pipeSpacing = 130;
    }

    // Bird kinematics
    this.bx = 54;
    this.by = 110;
    this.bvy = 0;
    this.rot = 0;
    this.rotDelay = 0;
    this.radius = 5;

    // Sprite Animation: 0=up, 1=mid, 2=down
    this.animStep = 0;
    this.animFrame = 1;
    this.animTimer = 0;

    // Scenery offsets
    this.groundX = 0;
    this.cityX = 0;
    this.cloudX = 0;

    // Pipes initialization
    const minY = 26;
    const maxY = 190 - this.pipeGap;
    this.pipes = [
      { x: 260, gapY: Math.floor(minY + Math.random() * (maxY - minY)), passed: false },
      { x: 260 + this.pipeSpacing, gapY: Math.floor(minY + Math.random() * (maxY - minY)), passed: false },
      { x: 260 + this.pipeSpacing * 2, gapY: Math.floor(minY + Math.random() * (maxY - minY)), passed: false }
    ];

    // State machine: 'READY' -> 'PLAYING' -> 'DYING' -> 'OVER'
    this.state = 'READY';
    this.score = 0;
    this.over = false;
    this.overTimer = 0;
    this.readyTimer = 0;
    this.isNewRecord = false;
    this.lastPointerDown = false;
  },

  flap() {
    this.bvy = this.flapImpulse;
    this.rot = -25 * (Math.PI / 180); // tilt nose up +25 deg
    this.rotDelay = 0.12;
    this.playFlapSfx();
    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(10);
  },

  update(dt) {
    const pointerDown = !!(typeof PAD !== 'undefined' && PAD.pointer && PAD.pointer.down);
    const tapHit = !!(typeof PAD !== 'undefined' && PAD.tapPos);
    const padHit = (typeof PAD !== 'undefined') && (PAD.hit('a') || PAD.hit('up') || PAD.hit('b') || PAD.hit('start'));
    const touchHit = (pointerDown && !this.lastPointerDown) || tapHit;
    const inputTriggered = padHit || touchHit;

    // ------------------------------------------------------------------------
    // STATE: READY (Gentle floating hover before start)
    // ------------------------------------------------------------------------
    if (this.state === 'READY') {
      this.readyTimer += dt;
      this.by = 110 + Math.sin(this.readyTimer * 4.5) * 5;
      this.rot = Math.sin(this.readyTimer * 4.5) * 0.08;

      // Flutter wings while hovering
      this.animTimer += dt;
      if (this.animTimer >= 0.10) {
        this.animTimer = 0;
        this.animStep = (this.animStep + 1) % 4;
        this.animFrame = [0, 1, 2, 1][this.animStep];
      }

      // Parallax scenery drifts
      this.groundX = (this.groundX + this.scrollSpeed * dt) % 256;
      this.cityX = (this.cityX + this.scrollSpeed * 0.35 * dt) % 256;
      this.cloudX = (this.cloudX + this.scrollSpeed * 0.15 * dt) % 256;

      // Cycle difficulty with Left / Right / Select in READY state
      if (typeof PAD !== 'undefined' && (PAD.hit('left') || PAD.hit('right') || PAD.hit('select'))) {
        if (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) {
          if (PAD.hit('left')) VOS.difficulty = (VOS.difficulty - 1 + 3) % 3;
          else VOS.difficulty = (VOS.difficulty + 1) % 3;
          this.init();
          if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
          this.lastPointerDown = pointerDown;
          return;
        }
      }

      if (inputTriggered) {
        this.state = 'PLAYING';
        this.flap();
      }
      this.lastPointerDown = pointerDown;
      return;
    }

    // ------------------------------------------------------------------------
    // STATE: OVER (Score card displayed, wait for restart)
    // ------------------------------------------------------------------------
    if (this.state === 'OVER') {
      this.overTimer += dt;

      // Cycle difficulty on Game Over screen as well
      if (typeof PAD !== 'undefined' && (PAD.hit('left') || PAD.hit('right') || PAD.hit('select'))) {
        if (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) {
          if (PAD.hit('left')) VOS.difficulty = (VOS.difficulty - 1 + 3) % 3;
          else VOS.difficulty = (VOS.difficulty + 1) % 3;
          this.init();
          if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
          this.lastPointerDown = pointerDown;
          return;
        }
      }

      if (this.overTimer > 0.4 && inputTriggered) {
        this.init();
      }
      this.lastPointerDown = pointerDown;
      return;
    }

    // ------------------------------------------------------------------------
    // STATE: DYING (Bird falling to ground after pipe hit, camera frozen)
    // ------------------------------------------------------------------------
    if (this.state === 'DYING') {
      this.bvy += this.gravity * 1.5 * dt;
      if (this.bvy > 320) this.bvy = 320;
      this.by += this.bvy * dt;
      this.rot = Math.min(85 * (Math.PI / 180), this.rot + 480 * (Math.PI / 180) * dt);
      this.animFrame = 1;

      if (this.by + this.radius >= 214) {
        this.by = 214 - this.radius;
        this.bvy = 0;
        this.state = 'OVER';
        this.over = true;
        this.playThudSfx();
        if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(40);
        const medal = this.getMedal(this.score);
        this.playFanfare(medal.tier);
        if (typeof SAVE !== 'undefined' && SAVE.setScore) {
          this.isNewRecord = SAVE.setScore(this.id, this.score);
        }
      }
      this.lastPointerDown = pointerDown;
      return;
    }

    // ------------------------------------------------------------------------
    // STATE: PLAYING (Active gameplay simulation with sub-stepping)
    // ------------------------------------------------------------------------
    if (inputTriggered) {
      this.flap();
    }

    // Sub-stepping prevents tunneling at extreme dt speeds (e.g. 1.4x HARD or lag spikes)
    const subSteps = Math.max(1, Math.min(4, Math.ceil(dt / 0.016)));
    const sdt = dt / subSteps;

    const minY = 26;
    const maxY = 190 - this.pipeGap;
    const collarH = 12;
    const collarW = 28;
    const shaftW = 24;
    const groundY = 214;

    for (let step = 0; step < subSteps; step++) {
      // Kinematics & gravity
      this.bvy += this.gravity * sdt;
      if (this.bvy > 260) this.bvy = 260; // Terminal velocity clamping
      this.by += this.bvy * sdt;

      // Ceiling boundary clamp (cannot escape screen)
      if (this.by - this.radius < 3) {
        this.by = 3 + this.radius;
        if (this.bvy < 0) this.bvy = 0;
      }

      // Ground collision
      if (this.by + this.radius >= groundY) {
        this.by = groundY - this.radius;
        this.bvy = 0;
        this.state = 'OVER';
        this.over = true;
        this.playThudSfx();
        if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(40);
        const medal = this.getMedal(this.score);
        this.playFanfare(medal.tier);
        if (typeof SAVE !== 'undefined' && SAVE.setScore) {
          this.isNewRecord = SAVE.setScore(this.id, this.score);
        }
        this.lastPointerDown = pointerDown;
        return;
      }

      // Dynamic pitch angle rotation
      if (this.rotDelay > 0) {
        this.rotDelay -= sdt;
      } else if (this.bvy > 0) {
        const maxDive = 85 * (Math.PI / 180);
        this.rot = Math.min(maxDive, this.rot + 360 * (Math.PI / 180) * sdt);
      }

      // Pipe movement & collisions
      for (let p of this.pipes) {
        p.x -= this.scrollSpeed * sdt;

        // Score passage check
        if (!p.passed && (p.x + 12 < this.bx)) {
          p.passed = true;
          this.score++;
          this.playScoreSfx();
          if (typeof SAVE !== 'undefined' && SAVE.setScore) {
            SAVE.setScore(this.id, this.score);
          }
        }

        // Pipe wrap-around recycling
        if (p.x < -32) {
          const maxX = Math.max(...this.pipes.map(o => o.x));
          p.x = maxX + this.pipeSpacing;
          p.gapY = Math.floor(minY + Math.random() * (maxY - minY));
          p.passed = false;
        }

        // Exact Circle-to-Box AABB collision
        const px = Math.floor(p.x);
        const topShaftH = p.gapY - collarH;
        const topCollarY = p.gapY - collarH;
        const botCollarY = p.gapY + this.pipeGap;
        const botShaftY = botCollarY + collarH;
        const botShaftH = groundY - botShaftY;

        const hitTopShaft = this.circleBox(this.bx, this.by, this.radius, px, 0, shaftW, topShaftH);
        const hitTopCollar = this.circleBox(this.bx, this.by, this.radius, px - 2, topCollarY, collarW, collarH);
        const hitBotCollar = this.circleBox(this.bx, this.by, this.radius, px - 2, botCollarY, collarW, collarH);
        const hitBotShaft = this.circleBox(this.bx, this.by, this.radius, px, botShaftY, shaftW, botShaftH);

        if (hitTopShaft || hitTopCollar || hitBotCollar || hitBotShaft) {
          this.state = 'DYING';
          this.over = true;
          this.playHitSfx();
          if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(30);
          this.bvy = Math.max(0, this.bvy);
          this.lastPointerDown = pointerDown;
          return;
        }
      }
    }

    // Wing flap animation frame update
    if (this.bvy < 120 && this.rot < 40 * (Math.PI / 180)) {
      this.animTimer += dt;
      if (this.animTimer >= 0.08) {
        this.animTimer = 0;
        this.animStep = (this.animStep + 1) % 4;
        this.animFrame = [0, 1, 2, 1][this.animStep];
      }
    } else {
      this.animFrame = 1; // Wings tucked mid during steep dive
    }

    // Update parallax layer offsets
    this.groundX = (this.groundX + this.scrollSpeed * dt) % 256;
    this.cityX = (this.cityX + this.scrollSpeed * 0.35 * dt) % 256;
    this.cloudX = (this.cloudX + this.scrollSpeed * 0.15 * dt) % 256;

    this.lastPointerDown = pointerDown;
  },

  // --------------------------------------------------------------------------
  // RENDERING PIPELINE
  // --------------------------------------------------------------------------
  drawClouds(g) {
    for (let c of this.CLOUDS) {
      let cx = Math.floor((c.x - this.cloudX) % 256);
      if (cx < -c.w) cx += 256;
      for (let ox of [0, 256]) {
        const x = cx + ox;
        if (x + c.w > 0 && x < 256) {
          g.disc(x + 8, c.y, 6, 1);
          g.disc(x + 16, c.y - 3, 8, 1);
          g.disc(x + 24, c.y, 6, 1);
          g.rect(x + 2, c.y, 28, 4, 1);
          g.line(x + 10, c.y - 7, x + 22, c.y - 7, 2);
        }
      }
    }
  },

  drawSkyline(g) {
    const groundY = 214;
    const cityOffset = Math.floor(this.cityX);
    for (let b of this.BUILDINGS) {
      let sx = (b.x - cityOffset) % 256;
      if (sx < -b.w) sx += 256;
      for (let ox of [0, 256]) {
        const bx = sx + ox;
        if (bx + b.w > 0 && bx < 256) {
          const by = groundY - b.h;
          // Building silhouette
          g.rect(bx, by, b.w, b.h, 1);
          g.line(bx, by, bx + b.w - 1, by, 2);

          // Antenna spire
          if (b.sp > 0) {
            const mx = bx + Math.floor(b.w / 2);
            g.line(mx, by - b.sp, mx, by, 1);
            g.px(mx, by - b.sp, 2);
          }

          // Scattered lit retro windows
          for (let wy = by + 4; wy < groundY - 2; wy += 6) {
            for (let wx = bx + 3; wx < bx + b.w - 3; wx += 4) {
              if (((wx * 7 + wy * 13) % 5) === 0) {
                g.px(wx, wy, 2);
              }
            }
          }
        }
      }
    }
  },

  drawPipes(g) {
    const collarH = 12;
    const groundY = 214;

    for (let p of this.pipes) {
      const px = Math.floor(p.x);
      if (px < -30 || px > 260) continue;

      const topShaftH = p.gapY - collarH;
      const topCollarY = p.gapY - collarH;
      const botCollarY = p.gapY + this.pipeGap;
      const botShaftY = botCollarY + collarH;
      const botShaftH = groundY - botShaftY;

      // 1. TOP PIPE SHAFT (Ceiling down to collar)
      if (topShaftH > 0) {
        g.rect(px, 0, 24, topShaftH, 2);
        g.rect(px + 3, 0, 2, topShaftH, 3); // Vertical highlight
        g.rect(px + 19, 0, 4, topShaftH, 1); // Vertical shadow
        g.line(px, 0, px, topShaftH - 1, 1);
        g.line(px + 23, 0, px + 23, topShaftH - 1, 0);
      }

      // 2. TOP PIPE COLLAR RIM
      g.rect(px - 2, topCollarY, 28, collarH, 2);
      g.box(px - 2, topCollarY, 28, collarH, 1);
      g.rect(px + 1, topCollarY + 1, 3, collarH - 2, 3);
      g.rect(px + 21, topCollarY + 1, 4, collarH - 2, 1);
      g.line(px - 1, topCollarY + collarH - 1, px + 25, topCollarY + collarH - 1, 3);

      // 3. BOTTOM PIPE COLLAR RIM
      g.rect(px - 2, botCollarY, 28, collarH, 2);
      g.box(px - 2, botCollarY, 28, collarH, 1);
      g.rect(px + 1, botCollarY + 1, 3, collarH - 2, 3);
      g.rect(px + 21, botCollarY + 1, 4, collarH - 2, 1);
      g.line(px - 1, botCollarY, px + 25, botCollarY, 3);

      // 4. BOTTOM PIPE SHAFT (Collar down to ground)
      if (botShaftH > 0) {
        g.rect(px, botShaftY, 24, botShaftH, 2);
        g.rect(px + 3, botShaftY, 2, botShaftH, 3); // Vertical highlight
        g.rect(px + 19, botShaftY, 4, botShaftH, 1); // Vertical shadow
        g.line(px, botShaftY, px, groundY - 1, 1);
        g.line(px + 23, botShaftY, px + 23, groundY - 1, 0);
      }
    }
  },

  drawGround(g) {
    const groundY = 214;
    // Grass turf top border
    g.rect(0, groundY, 256, 2, 3);
    g.line(0, groundY + 2, 255, groundY + 2, 2);

    // Underground soil with scrolling diagonal hazard stripes
    g.rect(0, groundY + 3, 256, 23, 1);
    const goff = Math.floor(this.groundX) % 12;
    for (let x = -24; x < 268; x += 12) {
      const sx = x - goff;
      g.tri(sx, 240, sx + 6, groundY + 3, sx + 11, groundY + 3, 2);
      g.tri(sx, 240, sx + 11, groundY + 3, sx + 5, 240, 2);
    }
  },

  drawBird(g) {
    const cosA = Math.cos(this.rot);
    const sinA = Math.sin(this.rot);
    const frame = this.BIRD_FRAMES[this.animFrame];
    const size = 18;
    const half = 9;

    for (let y = 0; y < size; y++) {
      const dy = y - half;
      for (let x = 0; x < size; x++) {
        const dx = x - half;
        const lx = dx * cosA + dy * sinA;
        const ly = -dx * sinA + dy * cosA;
        const sx = Math.round(lx + 6.0);
        const sy = Math.round(ly + 4.5);
        if (sx >= 0 && sx < 14 && sy >= 0 && sy < 10) {
          const ch = frame[sy][sx];
          if (ch !== '.') {
            g.px(Math.floor(this.bx + dx), Math.floor(this.by + dy), ch.charCodeAt(0) - 48);
          }
        }
      }
    }
  },

  drawScoreCard(g) {
    const medal = this.getMedal(this.score);
    const best = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : this.score;

    // Header Box
    g.rect(68, 54, 120, 16, 0);
    g.box(68, 54, 120, 16, 3);
    g.textC("GAME OVER", 59, 3);

    // Score Plate Container
    g.dither(42, 76, 172, 78, 0, 1);
    g.box(42, 76, 172, 78, 2);
    g.box(44, 78, 168, 74, 1);
    g.px(42, 76, 3); g.px(213, 76, 3); g.px(42, 153, 3); g.px(213, 153, 3);

    // Left Side: Medal Badge
    const mx = 76, my = 112;
    g.rect(52, 84, 48, 60, 0);
    g.box(52, 84, 48, 60, 2);
    g.text("MEDAL", 61, 88, 2);

    if (medal.tier > 0) {
      // Hanging Ribbon
      g.line(mx - 4, my - 11, mx - 1, my - 7, 2);
      g.line(mx + 4, my - 11, mx + 1, my - 7, 2);
      // Medal Disc
      g.disc(mx, my, 8, medal.col);
      g.disc(mx, my, 6, medal.fill);
      g.circle(mx, my, 8, 3);

      // Embellishment per tier
      if (medal.tier === 4) { // Platinum
        g.px(mx, my, 0); g.px(mx - 1, my, 3); g.px(mx + 1, my, 3); g.px(mx, my - 1, 3); g.px(mx, my + 1, 3);
        if ((Math.floor(this.overTimer * 6) % 2) === 0) {
          g.px(mx - 5, my - 5, 3); g.px(mx + 5, my + 5, 3);
        }
      } else if (medal.tier === 3) { // Gold
        g.px(mx, my, 3); g.px(mx - 1, my, 2); g.px(mx + 1, my, 2);
      } else if (medal.tier === 2) { // Silver
        g.circle(mx, my, 3, 3);
      } else { // Bronze
        g.disc(mx, my, 3, 1);
      }
      g.text(medal.name, 76 - Math.floor((medal.name.length * 5 - 1) / 2), 132, medal.col);
    } else {
      g.circle(mx, my, 7, 1);
      g.text("NONE", 66, 110, 1);
      g.text("NO MEDAL", 56, 132, 1);
    }

    // Right Side: Score & Best Records
    g.text("SCORE:", 112, 88, 2);
    g.textR(this.score.toString(), 204, 88, 3);
    g.line(112, 100, 204, 100, 1);

    g.text("BEST:", 112, 106, 2);
    g.textR(best.toString(), 204, 106, 3);

    if (this.isNewRecord) {
      const flash = (Math.floor(this.overTimer * 4) % 2 === 0);
      g.textC("★ NEW RECORD! ★", 124, flash ? 3 : 2);
    } else {
      g.textC("DIFF: " + this.diffName, 125, 2);
    }

    // Bottom Action Prompt
    if (this.overTimer > 0.4 && (Math.floor(this.overTimer * 3) % 2 === 0)) {
      g.textC("[A] / TAP TO RETRY", 166, 3);
    }
    g.textC("MODE: " + this.diffName + " (" + this.pipeGap + "PX GAP)", 182, 1);
  },

  render(g) {
    // 1. Clear background (deep phosphor night)
    g.clear(0);

    // 2. Parallax distant sky clouds
    this.drawClouds(g);

    // 3. Parallax retro city skyline
    this.drawSkyline(g);

    // 4. Industrial ceiling girder rail
    g.line(0, 0, 255, 0, 2);
    for (let x = 0; x < 256; x += 4) g.px(x, 1, 3);
    g.line(0, 2, 255, 2, 1);

    // 5. Pipes (top & bottom shafts with beveled collars)
    this.drawPipes(g);

    // 6. Scrolling ground with hazard conveyor stripes
    this.drawGround(g);

    // 7. Animated pixel bird with dynamic pitch rotation
    this.drawBird(g);

    // 8. HUD & Overlays
    if (this.state === 'PLAYING') {
      // Big retro score in top center
      g.textC(this.score.toString(), 21, 1, 2);
      g.textC(this.score.toString(), 20, 3, 2);

      // Best score on top-left, mode on top-right
      const best = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;
      g.text("BEST: " + best, 8, 6, 2);
      g.textR(this.diffName, 248, 6, 2);
    } else if (this.state === 'READY') {
      g.textC("GET READY!", 72, 3);
      g.textC("TAP / [A] TO FLAP", 90, 2);
      const bob = Math.floor(Math.sin(this.readyTimer * 6) * 3);
      g.textC("▲", 108 + bob, 3);
      g.textC("MODE: " + this.diffName + " (◀ / ▶ TO CHANGE)", 196, 1);
    } else if (this.state === 'OVER') {
      this.drawScoreCard(g);
    }
  }
};
