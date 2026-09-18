// js/cartridges/cart_005_invaders.js
// ============================================================================
// Cartridge #005: INVADERS
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 5. SPACE INVADERS
CARTS[5] = {
  id: 5,
  name: "INVADERS",
  genre: 0,
  scoreLabel: "PTS",
  desc: "DEFEND EARTH FROM 5X11 INVASION FLEET. HIDE BEHIND BUNKER SHIELDS!",

  // Classic alien sprite bitmasks (2 animation frames each)
  // Type 0 (Row 0): Squid / Small Alien (8x8, 30 pts)
  // Type 1 (Rows 1-2): Crab / Medium Alien (11x8, 20 pts)
  // Type 2 (Rows 3-4): Octopus / Large Alien (12x8, 10 pts)
  // Mystery UFO: Flying Saucer (16x7, 50-300 bonus pts)
  SPRITES: {
    squid: [
      [0x18, 0x3c, 0x7e, 0xdb, 0xff, 0x24, 0x5a, 0xa5],
      [0x18, 0x3c, 0x7e, 0xdb, 0xff, 0x24, 0x42, 0x24]
    ],
    crab: [
      [0x104, 0x088, 0x1fc, 0x376, 0x7ff, 0x5fd, 0x505, 0x0d8],
      [0x104, 0x489, 0x5fd, 0x575, 0x7ff, 0x3fe, 0x104, 0x202]
    ],
    octopus: [
      [0x0f0, 0x7fe, 0xfff, 0xe67, 0xfff, 0x198, 0x36c, 0xc03],
      [0x0f0, 0x7fe, 0xfff, 0xe67, 0xfff, 0x30c, 0x666, 0x198]
    ],
    ufo: [0x07e0, 0x1ff8, 0x3ffc, 0x6db6, 0xffff, 0x381c, 0x1008]
  },

  // 12x8 block template for destructible bunker shields (2x2 px per block)
  BUNKER_TEMPLATE: [
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1]
  ],

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Draw classic Crab alien icon centered
    g.sprite(x + 10, y + 7, 11, 8, this.SPRITES.crab[0], 3);
    // Destructible mini-bunker representation
    g.rect(x + 6, y + 19, 8, 4, 2);
    g.rect(x + 18, y + 19, 8, 4, 2);
    // Player cannon
    g.rect(x + 12, y + 25, 8, 3, 3);
    g.rect(x + 15, y + 23, 2, 2, 3);
  },

  init() {
    this.px = 120;
    this.lives = 3;
    this.bullet = null;
    this.enemyBullets = [];
    this.aliens = [];
    this.wave = 1;
    this.score = 0;
    this.highScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? (SAVE.getScore(this.id) || 0) : 0;
    this.over = false;
    this.overReason = "";
    this.respawnTimer = 0;
    this.touchFireTimer = 0;
    this.animFrame = 0;
    this.marchNote = 0;
    this.fleetDir = 1;
    this.fleetTimer = 0;
    this.fleetSpeed = 0.65;
    this.enemyShootTimer = 1.0;

    // Mystery flying saucer (UFO)
    this.ufo = null;
    this.ufoTimer = 16 + Math.random() * 8;
    this.ufoSfxTimer = 0;
    this.ufoScorePopup = null;

    // Particle explosion system
    this.particles = [];

    // Initialize 4 destructible bunkers and 5x11 fleet
    this.initBunkers();
    this.spawnFleet();
  },

  initBunkers() {
    const xs = [28, 86, 144, 202];
    this.bunkers = xs.map(bx => {
      const grid = [];
      for (let r = 0; r < 8; r++) {
        grid.push([...this.BUNKER_TEMPLATE[r]]);
      }
      return { x: bx, y: 178, w: 24, h: 16, grid };
    });
  },

  spawnFleet() {
    this.aliens = [];
    // 5 rows x 11 columns = 55 invaders
    for (let r = 0; r < 5; r++) {
      let type, pts, color, w, h;
      if (r === 0) {
        type = 'squid'; pts = 30; color = 3; w = 8; h = 8;
      } else if (r <= 2) {
        type = 'crab'; pts = 20; color = 2; w = 11; h = 8;
      } else {
        type = 'octopus'; pts = 10; color = 2; w = 12; h = 8;
      }

      for (let c = 0; c < 11; c++) {
        this.aliens.push({
          x: 24 + c * 16,
          y: 36 + r * 14,
          row: r,
          col: c,
          type: type,
          pts: pts,
          color: color,
          w: w,
          h: h,
          alive: true
        });
      }
    }
  },

  spawnExplosion(x, y, count = 10, color = 3, maxSpeed = 70) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 15 + Math.random() * maxSpeed;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.2 + Math.random() * 0.35,
        c: color
      });
    }
  },

  damageBunker(bunker, hitX, hitY, radius = 1) {
    const localX = hitX - bunker.x;
    const localY = hitY - bunker.y;
    const centerCol = Math.floor(localX / 2);
    const centerRow = Math.floor(localY / 2);
    let hitAny = false;

    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        const r = centerRow + dr;
        const c = centerCol + dc;
        if (r >= 0 && r < 8 && c >= 0 && c < 12) {
          if (bunker.grid[r][c] === 1) {
            const dist = Math.hypot(dr, dc);
            if (dist <= 0.8 || (dist <= radius && Math.random() < 0.7)) {
              bunker.grid[r][c] = 0;
              hitAny = true;
            }
          }
        }
      }
    }
    return hitAny;
  },

  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || PAD.tapPos || (PAD.pointer && PAD.pointer.down)) {
        this.init();
      }
      return;
    }

    // Invulnerability timer countdown
    if (this.respawnTimer > 0) {
      this.respawnTimer -= dt;
    }
    if (this.touchFireTimer > 0) {
      this.touchFireTimer -= dt;
    }

    // --- 1. CONTROLS (D-PAD + SWIPES + TOUCH DRAG & TAP) ---
    const moveSpd = 145;
    if (PAD.held('left') || PAD.state.left) this.px -= moveSpd * dt;
    if (PAD.held('right') || PAD.state.right) this.px += moveSpd * dt;

    if (PAD.swipe === 'left') {
      this.px -= 24;
      PAD.vibrate(6);
    } else if (PAD.swipe === 'right') {
      this.px += 24;
      PAD.vibrate(6);
    }

    // Mobile touch drag in lower area (Y >= 130)
    if (PAD.pointer && PAD.pointer.down && PAD.pointer.y >= 130) {
      const targetX = PAD.pointer.x;
      this.px += (targetX - this.px) * Math.min(1, 24 * dt);
    }
    this.px = Math.max(12, Math.min(244, this.px));

    // Player fire: A, B, screen tap, or touch holding in lower zone
    const fireTriggered = PAD.hit('a') || PAD.hit('b') || PAD.tapPos;
    const autoTouchFire = PAD.pointer && PAD.pointer.down && this.touchFireTimer <= 0;
    if ((fireTriggered || autoTouchFire) && !this.bullet) {
      this.bullet = { x: this.px, y: 214 };
      this.touchFireTimer = 0.25;
      APU.sfx('SWISH');
      PAD.vibrate(6);
    }

    // --- 2. SUB-STEPPED BULLETS & COLLISION UPDATE ---
    const steps = Math.ceil(dt / 0.012);
    const subDt = dt / steps;
    for (let s = 0; s < steps; s++) {
      this.updatePhysicsStep(subDt);
      if (this.over) return;
    }

    // --- 3. DYNAMIC MARCHING SPEED & FLEET STEP ---
    const living = this.aliens.filter(a => a.alive);
    if (living.length === 0) {
      // Wave clear!
      this.wave++;
      this.score += 200 + this.wave * 50;
      this.highScore = Math.max(this.highScore, this.score);
      if (typeof SAVE !== 'undefined' && SAVE.setScore) SAVE.setScore(this.id, this.score);
      APU.sfx('LEVELUP');
      this.bullet = null;
      this.enemyBullets = [];
      this.fleetDir = 1;
      this.ufo = null;
      this.ufoTimer = 15 + Math.random() * 8;
      this.initBunkers();
      this.spawnFleet();
      return;
    }

    // Classic tension: faster step rate as numbers dwindle
    const baseWaveSpeed = Math.max(0.30, 0.65 - (this.wave - 1) * 0.05);
    const livingRatio = living.length / 55;
    this.fleetSpeed = 0.04 + (baseWaveSpeed - 0.04) * Math.pow(livingRatio, 0.85);

    this.fleetTimer += dt;
    if (this.fleetTimer >= this.fleetSpeed) {
      this.fleetTimer = 0;
      this.animFrame = 1 - this.animFrame;

      // 4-step descending heartbeat march SFX (F3, E3, Eb3, D3)
      const marchFreqs = [174.61, 164.81, 155.56, 146.83];
      APU.softTone(marchFreqs[this.marchNote], 0.04, 'triangle', 0.09, 0, 0.003, 500);
      this.marchNote = (this.marchNote + 1) % 4;

      let hitEdge = false;
      for (let a of this.aliens) {
        if (a.alive && ((this.fleetDir > 0 && a.x >= 242) || (this.fleetDir < 0 && a.x <= 14))) {
          hitEdge = true;
          break;
        }
      }

      if (hitEdge) {
        this.fleetDir = -this.fleetDir;
        for (let a of this.aliens) a.y += 8;

        // Invaders destroy bunker blocks as they march down through them
        for (let a of this.aliens) {
          if (a.alive && a.y + 4 >= 178 && a.y - 4 <= 194) {
            for (let b of this.bunkers) {
              if (a.x + a.w / 2 >= b.x && a.x - a.w / 2 <= b.x + b.w) {
                const minC = Math.max(0, Math.floor((a.x - a.w / 2 - b.x) / 2));
                const maxC = Math.min(11, Math.floor((a.x + a.w / 2 - b.x) / 2));
                const minR = Math.max(0, Math.floor((a.y - a.h / 2 - b.y) / 2));
                const maxR = Math.min(7, Math.floor((a.y + a.h / 2 - b.y) / 2));
                for (let r = minR; r <= maxR; r++) {
                  for (let c = minC; c <= maxC; c++) {
                    b.grid[r][c] = 0;
                  }
                }
              }
            }
          }
        }

        // Check if fleet reached landing altitude
        for (let a of this.aliens) {
          if (a.alive && a.y >= 212) {
            this.over = true;
            this.overReason = "INVASION COMPLETE!";
            this.spawnExplosion(a.x, a.y, 22, 3, 70);
            APU.sfx('BOOM');
            if (typeof SAVE !== 'undefined' && SAVE.setScore) SAVE.setScore(this.id, this.score);
            this.highScore = Math.max(this.highScore, this.score);
            return;
          }
        }
      } else {
        for (let a of this.aliens) a.x += this.fleetDir * 4;
      }
    }

    // --- 4. ENEMY FIRING (BOTTOM-MOST ALIENS ONLY) ---
    this.enemyShootTimer -= dt;
    if (this.enemyShootTimer <= 0) {
      this.enemyShootTimer = Math.max(0.5, 1.6 - this.wave * 0.12 + Math.random() * 0.6);
      const bottomAliens = [];
      for (let c = 0; c < 11; c++) {
        let lowest = null;
        for (let r = 4; r >= 0; r--) {
          const a = this.aliens[r * 11 + c];
          if (a && a.alive) { lowest = a; break; }
        }
        if (lowest) bottomAliens.push(lowest);
      }
      if (bottomAliens.length > 0 && this.enemyBullets.length < 3 + Math.min(3, this.wave)) {
        const shooter = bottomAliens[Math.floor(Math.random() * bottomAliens.length)];
        this.enemyBullets.push({ x: shooter.x, y: shooter.y + 6 });
      }
    }

    // --- 5. MYSTERY FLYING SAUCER (UFO) ---
    if (!this.ufo) {
      this.ufoTimer -= dt;
      if (this.ufoTimer <= 0) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        const ptsOptions = [50, 100, 150, 200, 300];
        const pts = ptsOptions[Math.floor(Math.random() * ptsOptions.length)];
        this.ufo = {
          x: dir === 1 ? -16 : 272,
          y: 24,
          dir: dir,
          speed: 75,
          pts: pts
        };
        this.ufoTimer = 18 + Math.random() * 10;
      }
    } else {
      this.ufo.x += this.ufo.dir * this.ufo.speed * dt;
      this.ufoSfxTimer += dt;
      if (this.ufoSfxTimer >= 0.24) {
        this.ufoSfxTimer = 0;
        APU.softTone(this.ufo.dir > 0 ? 560 : 470, 0.07, 'sine', 0.05, 0, 0.005, 1200);
      }
      if ((this.ufo.dir > 0 && this.ufo.x > 280) || (this.ufo.dir < 0 && this.ufo.x < -24)) {
        this.ufo = null;
      }
    }

    // UFO score popup timer
    if (this.ufoScorePopup) {
      this.ufoScorePopup.timer -= dt;
      if (this.ufoScorePopup.timer <= 0) this.ufoScorePopup = null;
    }

    // --- 6. PARTICLES UPDATE ---
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  },

  updatePhysicsStep(subDt) {
    // 1. Player Bullet
    if (this.bullet) {
      this.bullet.y -= 280 * subDt;
      if (this.bullet.y < 18) {
        this.bullet = null;
      } else {
        // Player bullet vs UFO
        if (this.ufo && Math.abs(this.bullet.x - this.ufo.x) < 10 && Math.abs(this.bullet.y - this.ufo.y) < 6) {
          this.score += this.ufo.pts;
          this.highScore = Math.max(this.highScore, this.score);
          if (typeof SAVE !== 'undefined' && SAVE.setScore) SAVE.setScore(this.id, this.score);
          this.ufoScorePopup = { x: this.ufo.x, y: this.ufo.y, pts: this.ufo.pts, timer: 1.1 };
          this.spawnExplosion(this.ufo.x, this.ufo.y, 18, 3, 75);
          APU.sfx('POWER');
          PAD.vibrate(15);
          this.ufo = null;
          this.bullet = null;
        }

        // Player bullet vs Bunkers
        if (this.bullet) {
          for (let b of this.bunkers) {
            if (this.bullet.x >= b.x && this.bullet.x < b.x + b.w &&
                this.bullet.y >= b.y && this.bullet.y < b.y + b.h) {
              const col = Math.floor((this.bullet.x - b.x) / 2);
              const row = Math.floor((this.bullet.y - b.y) / 2);
              if (row >= 0 && row < 8 && col >= 0 && col < 12 && b.grid[row][col] === 1) {
                this.damageBunker(b, this.bullet.x, this.bullet.y, 1);
                this.spawnExplosion(this.bullet.x, this.bullet.y, 6, 2, 40);
                APU.sfx('HIT');
                this.bullet = null;
                break;
              }
            }
          }
        }

        // Player bullet vs Aliens
        if (this.bullet) {
          for (let a of this.aliens) {
            if (a.alive && Math.abs(this.bullet.x - a.x) <= a.w / 2 + 1 && Math.abs(this.bullet.y - a.y) <= a.h / 2 + 1) {
              a.alive = false;
              this.score += a.pts;
              this.highScore = Math.max(this.highScore, this.score);
              if (typeof SAVE !== 'undefined' && SAVE.setScore) SAVE.setScore(this.id, this.score);
              this.spawnExplosion(a.x, a.y, 12, a.color, 65);
              APU.sfx('BOOM');
              PAD.vibrate(8);
              this.bullet = null;
              break;
            }
          }
        }
      }
    }

    // 2. Enemy Bullets
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const eb = this.enemyBullets[i];
      eb.y += (135 + this.wave * 8) * subDt;

      // Enemy bullet vs Ground line
      if (eb.y > 227) {
        this.spawnExplosion(eb.x, 227, 4, 1, 30);
        this.enemyBullets.splice(i, 1);
        continue;
      }

      // Enemy bullet vs Player Bullet (bullet collision cancellation)
      if (this.bullet && Math.abs(eb.x - this.bullet.x) < 5 && Math.abs(eb.y - this.bullet.y) < 5) {
        this.spawnExplosion((eb.x + this.bullet.x) / 2, (eb.y + this.bullet.y) / 2, 7, 3, 45);
        APU.sfx('HIT');
        this.bullet = null;
        this.enemyBullets.splice(i, 1);
        continue;
      }

      // Enemy bullet vs Bunkers
      let hitBunker = false;
      for (let b of this.bunkers) {
        if (eb.x >= b.x && eb.x < b.x + b.w && eb.y >= b.y && eb.y < b.y + b.h) {
          const col = Math.floor((eb.x - b.x) / 2);
          const row = Math.floor((eb.y - b.y) / 2);
          if (row >= 0 && row < 8 && col >= 0 && col < 12 && b.grid[row][col] === 1) {
            this.damageBunker(b, eb.x, eb.y, 1);
            this.spawnExplosion(eb.x, eb.y, 6, 2, 40);
            APU.sfx('HIT');
            this.enemyBullets.splice(i, 1);
            hitBunker = true;
            break;
          }
        }
      }
      if (hitBunker) continue;

      // Enemy bullet vs Player Cannon
      if (Math.abs(eb.x - this.px) < 7 && eb.y >= 215 && eb.y <= 226) {
        this.enemyBullets.splice(i, 1);
        if (this.respawnTimer <= 0) {
          this.lives--;
          this.spawnExplosion(this.px, 220, 26, 3, 85);
          APU.sfx('BOOM');
          PAD.vibrate(25);
          this.enemyBullets = [];
          if (this.lives <= 0) {
            this.over = true;
            this.overReason = "FLEET DESTROYED YOU!";
            if (typeof SAVE !== 'undefined' && SAVE.setScore) SAVE.setScore(this.id, this.score);
            this.highScore = Math.max(this.highScore, this.score);
          } else {
            this.px = 120;
            this.respawnTimer = 2.0;
          }
          return;
        }
      }
    }
  },

  render(g) {
    g.clear(0);

    // Top HUD
    g.text("SCORE: " + this.score, 10, 6, 3);
    g.text("HI: " + this.highScore, 104, 6, 2);
    g.textR("WAVE: " + this.wave, 246, 6, 3);
    g.line(0, 16, 256, 16, 1);

    // Mystery UFO
    if (this.ufo) {
      g.sprite(Math.floor(this.ufo.x - 8), Math.floor(this.ufo.y - 3), 16, 7, this.SPRITES.ufo, 3);
    }
    // UFO Score Popup
    if (this.ufoScorePopup) {
      g.text("+" + this.ufoScorePopup.pts, Math.floor(this.ufoScorePopup.x - 10), Math.floor(this.ufoScorePopup.y - 3), 3);
    }

    // Alien Invaders (with 2-frame walking animation & authentic sprites)
    for (let a of this.aliens) {
      if (a.alive) {
        const spriteRows = this.SPRITES[a.type][this.animFrame];
        g.sprite(Math.floor(a.x - a.w / 2), Math.floor(a.y - a.h / 2), a.w, a.h, spriteRows, a.color);
      }
    }

    // Destructible Bunker Shields (2x2 pixel blocks)
    for (let b of this.bunkers) {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 12; c++) {
          if (b.grid[r][c] === 1) {
            const color = (r === 0 || (r === 1 && (c === 0 || c === 11))) ? 3 : 2;
            g.rect(b.x + c * 2, b.y + r * 2, 2, 2, color);
          }
        }
      }
    }

    // Player Bullet
    if (this.bullet) {
      g.rect(Math.floor(this.bullet.x), Math.floor(this.bullet.y), 2, 6, 3);
      g.px(Math.floor(this.bullet.x), Math.floor(this.bullet.y) + 6, 2);
    }

    // Enemy Bullets (phosphor squiggly pulse)
    const tickPulse = Math.floor(Date.now() / 90) % 2 === 0;
    for (let eb of this.enemyBullets) {
      g.rect(Math.floor(eb.x), Math.floor(eb.y), 2, 6, 2);
      g.px(Math.floor(eb.x) + (tickPulse ? 1 : -1), Math.floor(eb.y) + 2, 3);
    }

    // Player Cannon (with respawn invulnerability flicker)
    const canDrawCannon = (this.respawnTimer <= 0) || (Math.floor(this.respawnTimer * 12) % 2 === 0);
    if (canDrawCannon && !this.over) {
      const cx = Math.floor(this.px);
      g.rect(cx - 7, 221, 14, 5, 3);
      g.rect(cx - 5, 219, 10, 2, 3);
      g.rect(cx - 1, 215, 2, 4, 3);
      g.px(cx - 7, 221, 1);
      g.px(cx + 6, 221, 1);
    }

    // Particle Explosions
    for (let p of this.particles) {
      const c = p.life < 0.1 ? 1 : (p.life < 0.2 ? 2 : p.c);
      g.px(Math.floor(p.x), Math.floor(p.y), c);
    }

    // Bottom Status Bar & Ground Line
    g.line(0, 228, 256, 228, 1);
    g.text("LIVES:", 10, 232, 2);
    for (let i = 0; i < this.lives; i++) {
      const lx = 48 + i * 14;
      g.rect(lx, 233, 8, 3, 3);
      g.rect(lx + 3, 231, 2, 2, 3);
    }

    const livingCount = this.aliens.filter(a => a.alive).length;
    g.textR("FLEET: " + livingCount, 246, 232, 1);

    // Game Over Overlay
    if (this.over) {
      g.dither(56, 92, 144, 56, 0, 1);
      g.rect(56, 92, 144, 56, 0);
      g.box(56, 92, 144, 56, 3);
      g.textC(this.overReason || "GAME OVER", 102, 3);
      g.textC("SCORE: " + this.score, 115, 2);
      g.textC("[A / START] RETRY", 131, 3);
    }
  }
};
