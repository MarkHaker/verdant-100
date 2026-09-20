// js/cartridges/cart_035_line_runner.js
// ============================================================================
// Cartridge #035: LINE RUNNER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 35. LINE RUNNER
CARTS[35] = {
  id: 35,
  name: "LINE RUNNER",
  genre: 3,
  scoreLabel: "METERS",
  desc: "ENDLESS DASH: [A] JUMP OVER SPIKES, [B] SLIDE UNDER OVERHEAD BLOCKS!",

  // Parallax building skyline templates (layer 0)
  SKYLINE: [
    { w: 22, h: 38, ant: 8, beacon: true },
    { w: 18, h: 50, ant: 0, beacon: false },
    { w: 26, h: 30, ant: 12, beacon: true },
    { w: 20, h: 56, ant: 6, beacon: true },
    { w: 28, h: 42, ant: 0, beacon: false },
    { w: 16, h: 62, ant: 10, beacon: true },
    { w: 24, h: 34, ant: 0, beacon: false },
    { w: 22, h: 46, ant: 8, beacon: true },
    { w: 30, h: 38, ant: 0, beacon: false },
    { w: 18, h: 52, ant: 14, beacon: true },
    { w: 20, h: 36, ant: 0, beacon: false },
    { w: 24, h: 48, ant: 6, beacon: true }
  ],

  // 32x32 Hand-Crafted Retro Icon
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);

    // Distant skyline hint
    g.rect(x + 2, y + 16, 5, 8, 1);
    g.rect(x + 8, y + 13, 6, 11, 1);
    g.line(x + 11, y + 9, x + 11, y + 12, 1);
    g.px(x + 11, y + 9, 3);
    g.rect(x + 15, y + 18, 5, 6, 1);

    // Ground baseline and ballast foundation
    g.line(x + 1, y + 24, x + 30, y + 24, 3);
    g.rect(x + 1, y + 25, 30, 6, 1);
    g.line(x + 5, y + 25, x + 5, y + 28, 2);
    g.line(x + 12, y + 25, x + 12, y + 28, 2);
    g.line(x + 19, y + 25, x + 19, y + 28, 2);
    g.line(x + 26, y + 25, x + 26, y + 28, 2);

    // Glowing ground spikes
    g.tri(x + 17, y + 24, x + 20, y + 17, x + 23, y + 24, 2);
    g.px(x + 20, y + 17, 3);
    g.px(x + 20, y + 18, 3);
    g.tri(x + 23, y + 24, x + 26, y + 14, x + 29, y + 24, 2);
    g.px(x + 26, y + 14, 3);
    g.px(x + 26, y + 15, 3);

    // Overhead hazard barrier block
    g.rect(x + 20, y + 2, 10, 5, 2);
    g.line(x + 20, y + 5, x + 29, y + 5, 3);
    g.px(x + 23, y + 6, 3);

    // Floating energy token
    g.px(x + 14, y + 2, 3);
    g.px(x + 13, y + 3, 3);
    g.px(x + 15, y + 3, 3);
    g.px(x + 14, y + 4, 3);

    // Stick runner leaping over spikes
    g.disc(x + 13, y + 7, 3, 3);
    g.px(x + 14, y + 7, 0); // Visor eye dot
    g.line(x + 13, y + 10, x + 11, y + 16, 3); // Torso
    g.line(x + 12, y + 12, x + 17, y + 11, 3); // Front arm
    g.line(x + 17, y + 11, x + 18, y + 14, 3);
    g.line(x + 12, y + 12, x + 7, y + 15, 2);  // Back arm
    g.line(x + 11, y + 16, x + 16, y + 16, 3); // Front leg
    g.line(x + 16, y + 16, x + 19, y + 20, 3);
    g.line(x + 11, y + 16, x + 6, y + 18, 2);  // Back leg
    g.line(x + 6, y + 18, x + 4, y + 16, 2);

    // Trailing wind speed lines
    g.line(x + 2, y + 8, x + 7, y + 8, 3);
    g.line(x + 1, y + 12, x + 6, y + 12, 2);
    g.line(x + 3, y + 16, x + 6, y + 16, 1);
  },

  // Audio helper routines
  playJumpSfx() {
    if (typeof APU === 'undefined') return;
    if (APU.tone) {
      APU.tone(220, 0.09, 'triangle', 0.10, 380);
    } else if (APU.sfx) {
      APU.sfx('JUMP');
    }
  },

  playDoubleJumpSfx() {
    if (typeof APU === 'undefined') return;
    if (APU.softTone) {
      APU.softTone(392.00, 0.08, 'sine', 0.10, 0, 0.005, 1800);
      APU.softTone(587.33, 0.13, 'sine', 0.10, 0.04, 0.005, 2200);
    } else if (APU.sfx) {
      APU.sfx('POWER');
    }
  },

  playFootstepSfx() {
    if (typeof APU === 'undefined') return;
    if (APU.softTone) {
      APU.softTone(170, 0.02, 'sine', 0.03, 0, 0.002, 600);
    }
  },

  playSlideSfx() {
    if (typeof APU === 'undefined') return;
    if (APU.noise) {
      APU.noise(0.04, 0.04, 1100, 'bandpass');
    }
  },

  playTokenSfx(combo) {
    if (typeof APU === 'undefined') return;
    const baseFreq = 523.25; // C5
    const semitones = [0, 2, 4, 7, 9, 12, 14, 16];
    const semi = semitones[Math.min(combo - 1, semitones.length - 1)];
    const freq = baseFreq * Math.pow(2, semi / 12);
    if (APU.softTone) {
      APU.softTone(freq, 0.07, 'sine', 0.10, 0, 0.005, 2400);
      APU.softTone(freq * 1.5, 0.15, 'sine', 0.08, 0.03, 0.005, 2600);
    } else if (APU.sfx) {
      APU.sfx('COIN');
    }
  },

  playSpeedupSfx() {
    if (typeof APU !== 'undefined' && APU.sfx) {
      APU.sfx('LEVELUP');
    }
    if (typeof PAD !== 'undefined' && PAD.vibrate) {
      PAD.vibrate(20);
    }
  },

  playCrashSfx() {
    if (typeof APU !== 'undefined') {
      if (APU.sfx) APU.sfx('BOOM');
      if (APU.noise) APU.noise(0.25, 0.22, 320, 'lowpass');
    }
    if (typeof PAD !== 'undefined' && PAD.vibrate) {
      PAD.vibrate(50);
    }
  },

  init() {
    // Runner kinematics
    this.groundY = 190;
    this.px = 44;
    this.py = this.groundY;
    this.vy = 0;
    this.jumpCount = 0;
    this.canDoubleJump = false;
    this.flipAngle = 0;
    this.sliding = false;
    this.slideSfxTimer = 0;
    this.stridePhase = 0;

    // Difficulty and speed ramp
    this.dist = 0;
    this.speed = 130; // Starts at ~130 px/s, ramps up to ~255 px/s
    this.tokens = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.speedupTimer = 0;
    this.lastMilestone = 0;

    // Camera & Screen Shake
    this.shake = 0;

    // Parallax scrolling positions
    this.bgScroll = 0;
    this.midScroll = 0;
    this.trackScroll = 0;

    // Entities
    this.obstacles = [];
    this.cells = [];
    this.particles = [];
    this.windLines = [];

    // Solvability-guaranteed obstacle pattern generator
    this.nextSpawnDistance = 60; // Initial calm runway before first obstacle

    // State & High Score
    this.over = false;
    this.isNewBest = false;
    this.best = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;

    // Input tracking for touch edges
    this.prevPointerRight = false;
    this.prevPointerDown = false;
    this.prevUp = false;
  },

  spawnParticle(x, y, vx, vy, life, col, isSpark = false) {
    this.particles.push({ x, y, vx, vy, life, maxLife: life, col, isSpark });
  },

  spawnDust(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
      const vx = -20 - Math.random() * 40;
      const vy = -10 - Math.random() * 25;
      this.spawnParticle(x, y, vx, vy, 0.2 + Math.random() * 0.15, 2);
    }
  },

  spawnObstaclePattern() {
    // Current reaction distance factor based on speed
    const spd = this.speed;

    // Available pattern types dynamically unlocked as distance increases
    const patterns = ['SPIKE_1', 'GIRDER_SHORT', 'RHYTHM_HOPS'];
    if (this.dist >= 70) {
      patterns.push('DOUBLE_SPIKE', 'GIRDER_LONG', 'SLIDE_THEN_HOP');
    }
    if (this.dist >= 160) {
      patterns.push('TRIPLE_SPIKE', 'TALL_PILLAR', 'HOP_THEN_SLIDE', 'DOUBLE_JUMP_CHALLENGE');
    }

    const patternType = patterns[Math.floor(Math.random() * patterns.length)];
    const startX = 265;

    switch (patternType) {
      case 'SPIKE_1': {
        // Single ground spike (clearable with small hop)
        this.obstacles.push({ type: 'spike', x: startX, w: 12, h: 14, count: 1 });
        // Bonus risk token arc above spike
        this.cells.push({ x: startX + 6, y: 150 });
        this.nextSpawnDistance = 12 + Math.max(130, spd * 1.05);
        break;
      }

      case 'DOUBLE_SPIKE': {
        // Double spike (clearable with standard jump)
        this.obstacles.push({ type: 'spike', x: startX, w: 22, h: 16, count: 2 });
        this.cells.push({ x: startX + 4, y: 146 }, { x: startX + 18, y: 146 });
        this.nextSpawnDistance = 22 + Math.max(135, spd * 1.05);
        break;
      }

      case 'TRIPLE_SPIKE': {
        // Triple spike (requires solid, committed jump)
        this.obstacles.push({ type: 'spike', x: startX, w: 32, h: 18, count: 3 });
        this.cells.push({ x: startX + 6, y: 144 }, { x: startX + 16, y: 136 }, { x: startX + 26, y: 144 });
        this.nextSpawnDistance = 32 + Math.max(145, spd * 1.10);
        break;
      }

      case 'GIRDER_SHORT': {
        // Overhead girder: sliding required
        this.obstacles.push({ type: 'girder', x: startX, w: 42, top: 125, bottom: 174 });
        // Low tokens reward sliding
        this.cells.push({ x: startX + 12, y: 184 }, { x: startX + 30, y: 184 });
        this.nextSpawnDistance = 42 + Math.max(70, spd * 0.60);
        break;
      }

      case 'GIRDER_LONG': {
        // Long overhead girder: sustained slide
        this.obstacles.push({ type: 'girder', x: startX, w: 70, top: 125, bottom: 174 });
        this.cells.push({ x: startX + 15, y: 184 }, { x: startX + 35, y: 184 }, { x: startX + 55, y: 184 });
        this.nextSpawnDistance = 70 + Math.max(75, spd * 0.65);
        break;
      }

      case 'TALL_PILLAR': {
        // Elevated hurdle: height 36px, requires Double Jump to soar over
        this.obstacles.push({ type: 'pillar', x: startX, w: 16, h: 36, top: 154 });
        this.cells.push({ x: startX + 8, y: 126 });
        this.nextSpawnDistance = 16 + Math.max(160, spd * 1.25);
        break;
      }

      case 'RHYTHM_HOPS': {
        // Two single spikes with guaranteed landing gap in between
        const hopGap = Math.max(140, spd * 1.12);
        this.obstacles.push({ type: 'spike', x: startX, w: 12, h: 14, count: 1 });
        this.obstacles.push({ type: 'spike', x: startX + 12 + hopGap, w: 12, h: 14, count: 1 });
        this.cells.push({ x: startX + 6, y: 150 });
        this.cells.push({ x: startX + 12 + hopGap + 6, y: 150 });
        this.nextSpawnDistance = 12 + hopGap + 12 + Math.max(130, spd * 1.05);
        break;
      }

      case 'SLIDE_THEN_HOP': {
        // High-low combo: short girder followed by a single spike with recovery gap
        const recGap = Math.max(75, spd * 0.60);
        const gw = 40;
        this.obstacles.push({ type: 'girder', x: startX, w: gw, top: 125, bottom: 174 });
        this.obstacles.push({ type: 'spike', x: startX + gw + recGap, w: 12, h: 14, count: 1 });
        this.cells.push({ x: startX + 20, y: 184 });
        this.cells.push({ x: startX + gw + recGap + 6, y: 148 });
        this.nextSpawnDistance = gw + recGap + 12 + Math.max(130, spd * 1.05);
        break;
      }

      case 'HOP_THEN_SLIDE': {
        // High-low combo: single spike followed by an overhead girder with safe landing gap
        const landGap = Math.max(140, spd * 1.05);
        const sw = 12;
        this.obstacles.push({ type: 'spike', x: startX, w: sw, h: 14, count: 1 });
        this.obstacles.push({ type: 'girder', x: startX + sw + landGap, w: 42, top: 125, bottom: 174 });
        this.cells.push({ x: startX + 6, y: 150 });
        this.cells.push({ x: startX + sw + landGap + 21, y: 184 });
        this.nextSpawnDistance = sw + landGap + 42 + Math.max(70, spd * 0.60);
        break;
      }

      case 'DOUBLE_JUMP_CHALLENGE': {
        // Two elevated pillars requiring high arc double jump
        this.obstacles.push({ type: 'pillar', x: startX, w: 16, h: 36, top: 154 });
        this.cells.push({ x: startX + 8, y: 118 }, { x: startX + 32, y: 112 });
        this.nextSpawnDistance = 16 + Math.max(160, spd * 1.25);
        break;
      }
    }
  },

  update(dt) {
    // Lag spike guard
    dt = Math.min(0.045, dt);

    // Screen shake decay
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 25);
    }

    // ------------------------------------------------------------------------
    // Game Over State
    // ------------------------------------------------------------------------
    if (this.over) {
      // Update lingering explosion shards
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 450 * dt;
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      // Retry inputs: keyboard, gamepad, or touch tap anywhere
      const pDown = typeof PAD !== 'undefined' && PAD.pointer && PAD.pointer.down;
      const touchTap = (typeof PAD !== 'undefined' && PAD.tapPos) || (pDown && !this.prevPointerDown);
      const keyRestart = typeof PAD !== 'undefined' && (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || PAD.hit('up') || PAD.hit('down'));
      this.prevPointerDown = pDown;

      if (keyRestart || touchTap) {
        this.init();
      }
      return;
    }

    // ------------------------------------------------------------------------
    // Active Gameplay Simulation
    // ------------------------------------------------------------------------
    // Distance & Speed Ramp
    this.dist += (this.speed * 0.08) * dt;
    this.speed = Math.min(255, 130 + Math.pow(this.dist / 35, 0.75) * 11);

    // Speed Milestone Fanfares (every 150m)
    const currentMilestone = Math.floor(this.dist / 150);
    if (currentMilestone > this.lastMilestone && currentMilestone > 0) {
      this.lastMilestone = currentMilestone;
      this.speedupTimer = 1.8;
      this.playSpeedupSfx();
    }
    if (this.speedupTimer > 0) {
      this.speedupTimer -= dt;
    }

    // Parallax Scrolling Speeds
    this.bgScroll = (this.bgScroll + this.speed * 0.18 * dt) % 268;
    this.midScroll = (this.midScroll + this.speed * 0.45 * dt) % 256;
    this.trackScroll = (this.trackScroll + this.speed * dt) % 256;

    // High Speed Wind Streaks (at speeds > 175 px/s)
    if (this.speed > 175 && Math.random() < 0.25) {
      this.windLines.push({
        x: 260,
        y: 30 + Math.random() * 140,
        len: 16 + Math.random() * 32,
        spd: this.speed * (1.3 + Math.random() * 0.4)
      });
    }
    for (let i = this.windLines.length - 1; i >= 0; i--) {
      const wl = this.windLines[i];
      wl.x -= wl.spd * dt;
      if (wl.x + wl.len < 0) this.windLines.splice(i, 1);
    }

    // ------------------------------------------------------------------------
    // Input Handling (Keyboard, Gamepad & Direct Screen Touch)
    // ------------------------------------------------------------------------
    const pDown = typeof PAD !== 'undefined' && PAD.pointer && PAD.pointer.down;
    const pxPos = pDown ? PAD.pointer.x : 0;
    const touchRight = pDown && pxPos >= 120;
    const touchLeft = pDown && pxPos < 120;

    const touchJumpHit = (touchRight && !this.prevPointerRight) ||
      (typeof PAD !== 'undefined' && PAD.tapPos && PAD.tapPos.x >= 120) ||
      (typeof PAD !== 'undefined' && PAD.swipe === 'up');

    const touchSlideHeld = touchLeft || (typeof PAD !== 'undefined' && PAD.swipe === 'down');
    this.prevPointerRight = touchRight;
    this.prevPointerDown = pDown;

    const jumpHit = (typeof PAD !== 'undefined' && (PAD.hit('a') || PAD.hit('up'))) || touchJumpHit;
    const slideHeld = (typeof PAD !== 'undefined' && (PAD.held('b') || PAD.held('down'))) || touchSlideHeld;
    const jumpRel = (typeof PAD !== 'undefined' && (PAD.rel('a') || PAD.rel('up'))) || (!touchRight && this.prevPointerRight);

    // ------------------------------------------------------------------------
    // Jump & Double Jump Mechanics
    // ------------------------------------------------------------------------
    if (jumpHit) {
      if (this.py >= this.groundY) {
        // Ground Jump: powerful initial leap
        this.vy = -275;
        this.jumpCount = 1;
        this.canDoubleJump = true;
        this.sliding = false;
        this.playJumpSfx();
        this.spawnDust(this.px, this.groundY, 4);
      } else if (this.py < this.groundY - 10 && this.canDoubleJump) {
        // Mid-Air Double Jump: acrobatic somersault flip!
        this.vy = -240;
        this.jumpCount = 2;
        this.canDoubleJump = false;
        this.flipAngle = 0;
        this.playDoubleJumpSfx();
        // Burst of glowing rotational particles
        for (let a = 0; a < 6; a++) {
          const ang = (a / 6) * Math.PI * 2;
          this.spawnParticle(this.px, this.py - 14, Math.cos(ang) * 40, Math.sin(ang) * 40, 0.22, 3);
        }
      }
    }

    // Variable Jump Height (releasing Jump cuts upward velocity)
    if (jumpRel && this.vy < -90) {
      this.vy *= 0.58;
    }

    // Mid-air Fast Dive (holding Down / Slide accelerates downwards)
    if (this.py < this.groundY && slideHeld) {
      if (this.vy < 300) this.vy = 300;
    }

    // ------------------------------------------------------------------------
    // Slide Mechanics
    // ------------------------------------------------------------------------
    if (this.py >= this.groundY) {
      this.sliding = slideHeld;
      if (this.sliding) {
        // Slide friction sound (throttled every 0.12s)
        this.slideSfxTimer -= dt;
        if (this.slideSfxTimer <= 0) {
          this.slideSfxTimer = 0.12;
          this.playSlideSfx();
        }
        // Continuous friction sparks and dust kicking back
        if (Math.random() < 0.85) {
          const sparkX = this.px - 14 + Math.random() * 26;
          this.spawnParticle(sparkX, this.groundY - 1, -60 - Math.random() * 70, -20 - Math.random() * 35, 0.18, 3, true);
        }
      }
    } else {
      this.sliding = false;
    }

    // ------------------------------------------------------------------------
    // Kinematics & Physics Integration
    // ------------------------------------------------------------------------
    this.vy += 680 * dt;
    this.py += this.vy * dt;

    // Ground Touchdown
    if (this.py >= this.groundY) {
      if (this.vy > 130) {
        // Landing impact from high jump
        this.spawnDust(this.px, this.groundY, 3);
      }
      this.py = this.groundY;
      this.vy = 0;
      this.jumpCount = 0;
      this.canDoubleJump = false;
      this.flipAngle = 0;
    }

    // Mid-Air Somersault Rotation
    if (this.jumpCount === 2) {
      this.flipAngle += dt * 14;
    }

    // Running Stride Cadence & Footsteps
    if (this.py >= this.groundY && !this.sliding) {
      const prevHalf = Math.floor(this.stridePhase / Math.PI);
      this.stridePhase += this.speed * dt * 0.042;
      const currHalf = Math.floor(this.stridePhase / Math.PI);
      if (currHalf !== prevHalf) {
        this.playFootstepSfx();
        this.spawnDust(this.px - 2, this.groundY, 1);
      }
    }

    // Combo Multiplier Decay
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
      }
    }

    // ------------------------------------------------------------------------
    // Procedural Obstacle & Collectible Spawner
    // ------------------------------------------------------------------------
    this.nextSpawnDistance -= this.speed * dt;
    if (this.nextSpawnDistance <= 0) {
      this.spawnObstaclePattern();
    }

    // ------------------------------------------------------------------------
    // Obstacle Updates & Collision Detection
    // ------------------------------------------------------------------------
    // Player Hitbox Definitions:
    // Standing: x: [px - 5, px + 5], y: [py - 28, py]
    // Sliding:  x: [px - 14, px + 12], y: [180, 190] (only 10px tall!)
    // Jumping:  x: [px - 6, px + 6], y: [py - 24, py]
    const pLeft = this.sliding ? this.px - 14 : this.px - 5;
    const pRight = this.sliding ? this.px + 12 : this.px + 5;
    const pTop = this.sliding ? 180 : (this.py - 27);
    const pBottom = this.py;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      o.x -= this.speed * dt;

      // Check collision
      let crashed = false;
      if (o.type === 'spike') {
        // Ground spike bounding box with 2px forgiveness margin
        const sLeft = o.x + 2;
        const sRight = o.x + o.w - 2;
        const sTop = this.groundY - o.h;
        const sBottom = this.groundY;

        if (pRight > sLeft && pLeft < sRight && pBottom > sTop && pTop < sBottom) {
          crashed = true;
        }
      } else if (o.type === 'girder') {
        // Overhead girder: bottom edge at o.bottom (174)
        // Sliding player is at y: 180..190, so pTop (180) > o.bottom (174) -> passes safely underneath!
        // Standing player is at y: 163..190, so pTop (163) < o.bottom (174) -> CRASH!
        const gLeft = o.x + 1;
        const gRight = o.x + o.w - 1;
        const gTop = o.top;
        const gBottom = o.bottom;

        if (pRight > gLeft && pLeft < gRight && pBottom > gTop && pTop < gBottom) {
          crashed = true;
        }
      } else if (o.type === 'pillar') {
        // Tall hurdle: player must double jump high enough so pBottom <= o.top (154)
        const piLeft = o.x + 2;
        const piRight = o.x + o.w - 2;
        const piTop = o.top;
        const piBottom = this.groundY;

        if (pRight > piLeft && pLeft < piRight && pBottom > piTop && pTop < piBottom) {
          crashed = true;
        }
      }

      if (crashed) {
        this.over = true;
        this.shake = 12;
        this.playCrashSfx();

        // 32 exploding phosphor pixel shards
        for (let k = 0; k < 32; k++) {
          const ang = Math.random() * Math.PI * 2;
          const mag = 40 + Math.random() * 120;
          this.spawnParticle(
            this.px,
            this.py - 14,
            Math.cos(ang) * mag - 30,
            Math.sin(ang) * mag - 50,
            0.5 + Math.random() * 0.4,
            Math.random() < 0.6 ? 3 : 2
          );
        }

        // Commit score to persistent records
        const finalScore = Math.floor(this.dist + this.tokens * 10);
        if (typeof SAVE !== 'undefined' && SAVE.setScore) {
          this.isNewBest = SAVE.setScore(this.id, finalScore);
          if (this.isNewBest) this.best = finalScore;
        }
        return;
      }

      // Off-screen cleanup
      if (o.x + o.w < -30) {
        this.obstacles.splice(i, 1);
      }
    }

    // ------------------------------------------------------------------------
    // Collectible Phosphor Tokens
    // ------------------------------------------------------------------------
    const runnerCenterY = this.sliding ? 185 : (this.py - 14);
    for (let i = this.cells.length - 1; i >= 0; i--) {
      const c = this.cells[i];
      c.x -= this.speed * dt;

      // Circle-box proximity pickup
      const dx = c.x - this.px;
      const dy = c.y - runnerCenterY;
      if (dx * dx + dy * dy < 16 * 16) {
        this.tokens++;
        this.combo = Math.min(5, this.combo + 1);
        this.comboTimer = 3.5;
        this.dist += 5 * this.combo; // Bonus meters rewarded immediately
        this.playTokenSfx(this.combo);

        // Ring of sparkle particles
        for (let k = 0; k < 8; k++) {
          const ang = (k / 8) * Math.PI * 2;
          this.spawnParticle(c.x, c.y, Math.cos(ang) * 45, Math.sin(ang) * 45, 0.25, 3);
        }

        this.cells.splice(i, 1);
        continue;
      }

      if (c.x < -20) {
        this.cells.splice(i, 1);
      }
    }

    // ------------------------------------------------------------------------
    // Particle Simulation
    // ------------------------------------------------------------------------
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.isSpark) {
        p.vy += 300 * dt;
        if (p.y > this.groundY) {
          p.y = this.groundY;
          p.vy = -p.vy * 0.4;
        }
      } else {
        p.vy += 120 * dt;
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  },

  // --------------------------------------------------------------------------
  // Rendering System
  // --------------------------------------------------------------------------
  render(g) {
    const ox = this.shake > 0 ? Math.floor((Math.random() - 0.5) * this.shake) : 0;
    const oy = this.shake > 0 ? Math.floor((Math.random() - 0.5) * this.shake) : 0;

    g.clear(0);

    // ========================================================================
    // Layer 0: Parallax Cyber Skyline & Sky (0.18x speed)
    // ========================================================================
    // Faint constellation / grid stars
    for (let i = 0; i < 14; i++) {
      const starX = ((i * 47 - Math.floor(this.bgScroll * 0.4)) % 256 + 256) % 256;
      const starY = 18 + (i * 23) % 85;
      g.px(starX + ox, starY + oy, (i % 3 === 0) ? 2 : 1);
    }

    // Skyline buildings
    let bx = -Math.floor(this.bgScroll);
    while (bx < 256) {
      for (let b of this.SKYLINE) {
        const drawX = bx + ox;
        const bTop = this.groundY - b.h + oy;
        if (drawX + b.w > 0 && drawX < 256) {
          g.rect(drawX, bTop, b.w, b.h, 1);
          // Antenna with blinking beacon
          if (b.ant > 0) {
            const antX = drawX + Math.floor(b.w / 2);
            g.line(antX, bTop - b.ant, antX, bTop, 1);
            if (b.beacon && Math.floor(Date.now() / 350) % 2 === 0) {
              g.px(antX, bTop - b.ant, 3);
            }
          }
        }
        bx += b.w;
        if (bx >= 256 + 50) break;
      }
    }

    // ========================================================================
    // Layer 1: Parallax Industrial Poles & Power Lines (0.45x speed)
    // ========================================================================
    const poleSpacing = 64;
    const poleOffset = Math.floor(this.midScroll) % poleSpacing;
    for (let px = -poleOffset - poleSpacing; px < 256 + poleSpacing; px += poleSpacing) {
      const pDrawX = px + ox;
      const nextDrawX = pDrawX + poleSpacing;

      // Vertical mast and crossarm
      g.line(pDrawX, 142 + oy, pDrawX, this.groundY + oy, 2);
      g.line(pDrawX - 6, 147 + oy, pDrawX + 6, 147 + oy, 2);
      g.px(pDrawX - 6, 146 + oy, 3);
      g.px(pDrawX + 6, 146 + oy, 3);

      // Sagging power line catenary connecting adjacent poles
      const midX = Math.floor((pDrawX + nextDrawX) / 2);
      const sagY = 153 + oy;
      g.line(pDrawX + 6, 147 + oy, midX, sagY, 1);
      g.line(midX, sagY, nextDrawX - 6, 147 + oy, 1);
    }

    // ========================================================================
    // Layer 2: Foreground Track & Foundation Bed (1.0x speed)
    // ========================================================================
    // Neon rail guideline
    g.line(0, this.groundY + oy, 256, this.groundY + oy, 3);

    // Ballast layer
    g.dither(0, this.groundY + 1 + oy, 256, 4, 1, 2);

    // Track foundation wall
    g.rect(0, this.groundY + 5 + oy, 256, 45, 1);
    g.line(0, this.groundY + 5 + oy, 256, this.groundY + 5 + oy, 2);

    // Scrolling cross-ties and expansion joints
    const tieSpacing = 24;
    const tieOffset = Math.floor(this.trackScroll) % tieSpacing;
    for (let tx = -tieOffset; tx < 256 + tieSpacing; tx += tieSpacing) {
      g.line(tx + ox, this.groundY + 6 + oy, tx + ox, this.groundY + 18 + oy, 2);
      g.px(tx + ox, this.groundY + 8 + oy, 3);
    }

    // Distance markers painted on track foundation every 50 meters
    const currentM = Math.floor(this.dist);
    const firstMarker = Math.floor(currentM / 50) * 50;
    for (let m = firstMarker; m <= firstMarker + 150; m += 50) {
      if (m > 0) {
        const markerX = Math.floor(this.px + (m - this.dist) * (1 / 0.08)) + ox;
        if (markerX >= -40 && markerX <= 256) {
          g.text(m + "M", markerX, this.groundY + 10 + oy, 2);
        }
      }
    }

    // High-Speed Wind Streaks
    for (let wl of this.windLines) {
      g.line(Math.floor(wl.x) + ox, Math.floor(wl.y) + oy, Math.floor(wl.x + wl.len) + ox, Math.floor(wl.y) + oy, 2);
    }

    // ========================================================================
    // Layer 3: Obstacles
    // ========================================================================
    for (let o of this.obstacles) {
      const drawX = Math.floor(o.x) + ox;
      if (drawX + o.w < -10 || drawX > 260) continue;

      if (o.type === 'spike') {
        // Multi-tooth spiked obstacle
        const toothW = Math.floor(o.w / o.count);
        for (let t = 0; t < o.count; t++) {
          const tx = drawX + t * toothW;
          const tipX = tx + Math.floor(toothW / 2);
          const tipY = this.groundY - o.h + oy;
          g.tri(tx, this.groundY + oy, tipX, tipY, tx + toothW, this.groundY + oy, 2);
          g.line(tipX, tipY, tipX, this.groundY + oy, 3);
          g.px(tipX, tipY, 3);
        }
        // Base plate fixed to track
        g.rect(drawX - 1, this.groundY - 1 + oy, o.w + 2, 2, 3);
      } else if (o.type === 'girder') {
        // Overhead electrified steel truss girder
        const gTop = o.top + oy;
        const gH = o.bottom - o.top;
        g.rect(drawX, gTop, o.w, gH, 1);
        g.box(drawX, gTop, o.w, gH, 2);
        g.line(drawX, o.bottom + oy, drawX + o.w, o.bottom + oy, 3);

        // Internal truss cross-bracing
        for (let bx = drawX; bx < drawX + o.w - 8; bx += 12) {
          g.line(bx, gTop, bx + 12, o.bottom + oy, 2);
          g.line(bx + 12, gTop, bx, o.bottom + oy, 2);
        }

        // Caution hashmarks along bottom edge
        for (let hx = drawX + 2; hx < drawX + o.w - 3; hx += 6) {
          g.line(hx, o.bottom - 2 + oy, hx + 3, o.bottom + oy, 3);
        }

        // Electric spark arcs dancing along bottom edge
        if (Math.floor(Date.now() / 80) % 3 === 0) {
          const sparkX = drawX + 4 + Math.floor(Math.random() * (o.w - 8));
          g.line(sparkX, o.bottom + oy, sparkX + 1, o.bottom + 3 + oy, 3);
        }
      } else if (o.type === 'pillar') {
        // Tall monolith / hurdle
        const pTop = o.top + oy;
        const pH = o.h;
        g.rect(drawX, pTop, o.w, pH, 1);
        g.box(drawX, pTop, o.w, pH, 3);
        g.rect(drawX - 1, pTop, o.w + 2, 3, 3);
        // Warning chevrons
        const midY = pTop + 14;
        g.line(drawX + 3, midY, drawX + 8, midY - 5, 2);
        g.line(drawX + 8, midY - 5, drawX + 13, midY, 2);
        g.line(drawX + 3, midY + 10, drawX + 8, midY + 5, 2);
        g.line(drawX + 8, midY + 5, drawX + 13, midY + 10, 2);
      }
    }

    // ========================================================================
    // Layer 4: Collectible Energy Cells / Tokens
    // ========================================================================
    for (let c of this.cells) {
      const cx = Math.floor(c.x) + ox;
      const cy = Math.floor(c.y) + oy;
      if (cx < -10 || cx > 260) continue;

      // Pulsing rotating diamond token
      const pulse = Math.floor(Date.now() / 150) % 2 === 0;
      g.tri(cx - 4, cy, cx, cy - 4, cx + 4, cy, pulse ? 3 : 2);
      g.tri(cx - 4, cy, cx, cy + 4, cx + 4, cy, pulse ? 3 : 2);
      g.disc(cx, cy, 1, 3);

      // Orbiting sparkle dots
      const t = Date.now() * 0.006;
      const ox1 = Math.round(Math.cos(t) * 5);
      const oy1 = Math.round(Math.sin(t) * 5);
      g.px(cx + ox1, cy + oy1, 3);
    }

    // ========================================================================
    // Layer 5: Particles (Sparks, Dust Puffs, Shards)
    // ========================================================================
    for (let p of this.particles) {
      const px = Math.floor(p.x) + ox;
      const py = Math.floor(p.y) + oy;
      if (px >= 0 && px < 256 && py >= 0 && py < 240) {
        if (p.isSpark) {
          g.line(px, py, px - 2, py, p.col);
        } else {
          g.px(px, py, p.col);
        }
      }
    }

    // ========================================================================
    // Layer 6: Animated Stick Runner
    // ========================================================================
    if (!this.over) {
      const rx = this.px + ox;
      const ry = Math.floor(this.py) + oy;

      if (this.sliding) {
        // --------------------------------------------------------------------
        // Slide Pose: streamlined duck hugging ground
        // --------------------------------------------------------------------
        const hipX = rx - 2, hipY = ry - 4;
        const neckX = rx - 14, neckY = ry - 7;
        const headX = rx - 18, headY = ry - 9;

        // Head and visor
        g.disc(headX, headY, 3, 3);
        g.px(headX + 1, headY, 0);

        // Reclined torso
        g.line(hipX, hipY, neckX, neckY, 3);

        // Lead leg slid forward flat along ground
        g.line(hipX, hipY, rx + 8, ry - 2, 3);
        g.line(rx + 8, ry - 2, rx + 16, ry - 1, 3);

        // Back leg bent flat under
        g.line(hipX, hipY, rx + 2, ry - 4, 2);
        g.line(rx + 2, ry - 4, rx - 5, ry - 1, 2);

        // Trailing bracing arm
        g.line(neckX, neckY, rx - 22, ry - 1, 2);
      } else if (this.jumpCount === 2) {
        // --------------------------------------------------------------------
        // Double Jump Pose: 360-degree somersault tuck spin!
        // --------------------------------------------------------------------
        const spinCX = rx;
        const spinCY = ry - 14;
        const cosA = Math.cos(this.flipAngle);
        const sinA = Math.sin(this.flipAngle);
        const rot = (dx, dy) => ({
          x: Math.round(spinCX + dx * cosA - dy * sinA),
          y: Math.round(spinCY + dx * sinA + dy * cosA)
        });

        // Glowing rotational motion blur circle
        g.circle(spinCX, spinCY, 10, 2);

        // Rotated tucked gymnast
        const hPos = rot(5, -6);
        const t1 = rot(-4, 4);
        const t2 = rot(3, -4);
        const kPos = rot(7, 2);
        const fPos = rot(-1, 7);

        g.disc(hPos.x, hPos.y, 3, 3);
        g.line(t1.x, t1.y, t2.x, t2.y, 3);
        g.line(t2.x, t2.y, kPos.x, kPos.y, 3);
        g.line(kPos.x, kPos.y, fPos.x, fPos.y, 3);
      } else if (this.py < this.groundY) {
        // --------------------------------------------------------------------
        // Jump Pose: dynamic hurdler leap with wind trails
        // --------------------------------------------------------------------
        const hipX = rx - 2, hipY = ry - 14;
        const neckX = rx + 4, neckY = ry - 26;
        const headX = neckX + 3, headY = neckY - 6;

        // Head and visor
        g.disc(headX, headY, 3, 3);
        g.px(headX + 1, headY, 0);

        // Torso
        g.line(hipX, hipY, neckX, neckY, 3);

        // Front leg leading downward
        const fkX = hipX + 8, fkY = hipY + 4;
        const ffX = fkX + 6, ffY = fkY + 7;
        g.line(hipX, hipY, fkX, fkY, 3);
        g.line(fkX, fkY, ffX, ffY, 3);

        // Back leg trailing bent
        const bkX = hipX - 6, bkY = hipY + 6;
        const bfX = bkX - 5, bfY = bkY - 3;
        g.line(hipX, hipY, bkX, bkY, 2);
        g.line(bkX, bkY, bfX, bfY, 2);

        // Extended arms
        g.line(neckX, neckY, neckX + 7, neckY - 5, 3);
        g.line(neckX + 7, neckY - 5, neckX + 10, neckY - 9, 3);
        g.line(neckX, neckY, neckX - 7, neckY + 4, 2);
        g.line(neckX - 7, neckY + 4, neckX - 11, neckY + 7, 2);

        // Trailing wind lines
        g.line(rx - 16, ry - 14, rx - 7, ry - 14, 2);
        g.line(rx - 22, ry - 22, rx - 8, ry - 22, 3);
        g.line(rx - 14, ry - 6, rx - 5, ry - 6, 1);
      } else {
        // --------------------------------------------------------------------
        // Ground Running Pose: animated articulated stride
        // --------------------------------------------------------------------
        const lean = 0.20 + (this.speed - 130) * 0.0008;
        const headBob = Math.abs(Math.sin(this.stridePhase * 2)) * 2;
        const hipX = rx - Math.round(Math.sin(lean) * 12);
        const hipY = ry - 15 - Math.round(headBob);
        const neckX = rx + Math.round(Math.sin(lean) * 8);
        const neckY = ry - 27 - Math.round(headBob);
        const headX = neckX + Math.round(Math.sin(lean) * 5);
        const headY = neckY - 6;

        // Head and visor
        g.disc(headX, headY, 3, 3);
        g.px(headX + 1, headY, 0);

        // Torso
        g.line(hipX, hipY, neckX, neckY, 3);

        // Trigonometric stride kinematics
        const s = Math.sin(this.stridePhase);
        const c = Math.cos(this.stridePhase);

        // Front leg (color 3)
        const fkX = hipX + Math.round(s * 7);
        const fkY = hipY + 7 + Math.round(Math.max(0, -c * 3));
        const ffX = fkX + Math.round(s * 6);
        const ffY = Math.min(this.groundY + oy, fkY + 7 + Math.round(Math.max(0, c * 2)));
        g.line(hipX, hipY, fkX, fkY, 3);
        g.line(fkX, fkY, ffX, ffY, 3);
        g.line(ffX - 1, ffY, ffX + 3, ffY, 3);

        // Back leg (color 2 for parallax depth)
        const bkX = hipX - Math.round(s * 7);
        const bkY = hipY + 7 + Math.round(Math.max(0, c * 3));
        const bfX = bkX - Math.round(s * 6);
        const bfY = Math.min(this.groundY + oy, bkY + 7 + Math.round(Math.max(0, -c * 2)));
        g.line(hipX, hipY, bkX, bkY, 2);
        g.line(bkX, bkY, bfX, bfY, 2);
        g.line(bfX - 1, bfY, bfX + 3, bfY, 2);

        // Front arm (color 3, swings counter to front leg)
        const feX = neckX - Math.round(s * 6);
        const feY = neckY + 5 + Math.round(Math.abs(c * 2));
        const fhX = feX - Math.round(s * 5);
        const fhY = feY + 4;
        g.line(neckX, neckY, feX, feY, 3);
        g.line(feX, feY, fhX, fhY, 3);
        g.disc(fhX, fhY, 1, 3);

        // Back arm (color 2)
        const beX = neckX + Math.round(s * 6);
        const beY = neckY + 5 + Math.round(Math.abs(c * 2));
        const bhX = beX + Math.round(s * 5);
        const bhY = beY + 4;
        g.line(neckX, neckY, beX, beY, 2);
        g.line(beX, beY, bhX, bhY, 2);
        g.disc(bhX, bhY, 1, 2);
      }
    }

    // ========================================================================
    // Layer 7: Clean Head-Up Display (HUD)
    // ========================================================================
    // Top HUD banner bar
    g.rect(0, 0, 256, 17, 0);
    g.line(0, 17, 256, 17, 2);

    // Distance in Meters
    g.text("DIST:" + Math.floor(this.dist) + "M", 6, 6, 3);

    // Energy Tokens
    g.text("CELLS:" + this.tokens, 84, 6, 2);

    // Combo Multiplier Badge
    if (this.combo > 1) {
      g.rect(138, 4, 26, 10, 2);
      g.box(138, 4, 26, 10, 3);
      g.text("X" + this.combo, 142, 6, 3);
    }

    // Best Record
    const currentBest = Math.max(this.best, Math.floor(this.dist + this.tokens * 10));
    g.textR("BEST:" + currentBest + "M", 250, 6, 2);

    // Speed Milestone Banner
    if (this.speedupTimer > 0) {
      const pulse = Math.floor(Date.now() / 120) % 2 === 0;
      g.rect(60, 48, 136, 22, 0);
      g.box(60, 48, 136, 22, pulse ? 3 : 2);
      g.textC(">> SPEED UP! <<", 53, pulse ? 3 : 2);
      g.textC(Math.floor(this.speed) + " PX/S", 61, 2);
    }

    // ========================================================================
    // Layer 8: Mobile Touch Zone Indicators
    // ========================================================================
    const isTouchActive = typeof PAD !== 'undefined' && PAD.pointer && PAD.pointer.down;
    const isLeftTouch = isTouchActive && PAD.pointer.x < 120;
    const isRightTouch = isTouchActive && PAD.pointer.x >= 120;

    // Bottom-Left [SLIDE] indicator
    g.rect(8, 206, 52, 24, isLeftTouch || this.sliding ? 2 : 0);
    g.box(8, 206, 52, 24, isLeftTouch || this.sliding ? 3 : 1);
    g.textC("< SLIDE", 214, isLeftTouch || this.sliding ? 3 : 2);

    // Bottom-Right [JUMP] indicator
    g.rect(196, 206, 52, 24, isRightTouch || (this.jumpCount > 0) ? 2 : 0);
    g.box(196, 206, 52, 24, isRightTouch || (this.jumpCount > 0) ? 3 : 1);
    g.textC("JUMP >", 214, isRightTouch || (this.jumpCount > 0) ? 3 : 2);

    // ========================================================================
    // Layer 9: Game Over Screen
    // ========================================================================
    if (this.over) {
      const bx = 32, by = 56, bw = 192, bh = 118;
      g.rect(bx, by, bw, bh, 0);
      g.box(bx, by, bw, bh, 3);
      g.box(bx + 2, by + 2, bw - 4, bh - 4, 2);

      // Header ribbon
      g.rect(bx + 3, by + 3, bw - 6, 14, 1);
      g.textC("=== RUN TERMINATED ===", by + 7, 3);

      // Run statistics
      g.textC("DISTANCE: " + Math.floor(this.dist) + " METERS", by + 24, 2);
      g.textC("ENERGY CELLS: " + this.tokens + " (+" + (this.tokens * 10) + "M)", by + 36, 2);
      g.textC("FINAL SCORE: " + Math.floor(this.dist + this.tokens * 10) + " M", by + 50, 3);

      // Best record badge
      if (this.isNewBest) {
        const pulse = Math.floor(Date.now() / 150) % 2 === 0;
        g.textC("* NEW BEST RECORD! *", by + 65, pulse ? 3 : 2);
      } else {
        g.textC("BEST RECORD: " + this.best + " METERS", by + 65, 2);
      }

      // Retry prompts
      const blink = Math.floor(Date.now() / 250) % 2 === 0;
      g.textC("[A / SPACE / TAP] RE-RUN", by + 86, blink ? 3 : 2);
      g.textC("[B / ESC] MAIN MENU", by + 99, 1);
    }
  }
};
