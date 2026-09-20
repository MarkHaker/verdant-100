// js/cartridges/cart_038_downwell.js
// ============================================================================
// Cartridge #038: DOWNWELL
// ============================================================================
// An electrifying, kinetic, subterranean arcade descent inspired by Downwell.
// Blast downward with dual gunboots for recoil lift, crush subterranean beasts
// in high-flying air combos, shatter clay blocks, and vacuum sparkling phosphor gems!
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[38] = {
  id: 38,
  name: "DOWNWELL",
  genre: 3,
  scoreLabel: "DEPTH",
  desc: "FALL DOWN INFINITE WELL: [A] FIRES GUNBOOTS DOWNWARD FOR LIFT & BLASTS!",

  // 32x32 Hand-Crafted Retro Icon: Falling boy with gunboots blasting downward into a dark well
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Left stone wall with bricks
    g.rect(x + 1, y + 1, 4, 30, 1);
    g.line(x + 5, y + 1, x + 5, y + 30, 2);
    g.line(x + 1, y + 8, x + 4, y + 8, 2);
    g.line(x + 1, y + 16, x + 4, y + 16, 2);
    g.line(x + 1, y + 24, x + 4, y + 24, 2);

    // Right stone wall with bricks
    g.rect(x + 27, y + 1, 4, 30, 1);
    g.line(x + 26, y + 1, x + 26, y + 30, 2);
    g.line(x + 27, y + 12, x + 30, y + 12, 2);
    g.line(x + 27, y + 20, x + 30, y + 20, 2);

    // Falling boy with helmet and goggles
    const bx = x + 16;
    const by = y + 7;
    g.disc(bx, by, 3, 3); // helmet
    g.line(bx - 2, by - 1, bx + 2, by - 1, 0); // visor
    g.rect(bx - 2, by + 3, 5, 5, 2); // jacket

    // Chunky gunboots
    g.rect(bx - 4, by + 8, 3, 3, 3);
    g.rect(bx + 2, by + 8, 3, 3, 3);

    // Dual conical muzzle blast cones
    g.tri(bx - 3, by + 11, bx - 5, by + 18, bx - 1, by + 18, 3);
    g.tri(bx + 3, by + 11, bx + 1, by + 18, bx + 5, by + 18, 3);

    // High velocity bullet tracer lines
    g.line(bx - 3, by + 19, bx - 3, by + 28, 3);
    g.line(bx + 3, by + 19, bx + 3, by + 28, 3);

    // Sparkling phosphor gems falling in shaft
    g.px(x + 9, y + 14, 3);
    g.px(x + 22, y + 11, 3);
    g.px(x + 10, y + 24, 3);
    g.px(x + 23, y + 22, 3);

    // Wind speed lines
    g.line(x + 8, y + 4, x + 8, y + 9, 1);
    g.line(x + 24, y + 5, x + 24, y + 10, 1);
  },

  init() {
    // Player kinematics
    this.px = 120;
    this.py = 110;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.onGround = true;

    // Depth & score tracking
    this.depth = 0;
    this.cameraY = 0;
    this.bestDepth = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;
    this.newRecord = false;

    // Gunboots & stats
    this.ammo = 8;
    this.maxAmmo = 8;
    this.hp = 4;
    this.maxHp = 4;
    this.invuln = 0;

    // Air Combo System
    this.combo = 0;
    this.maxCombo = 0;
    this.milestone8Reached = false;
    this.milestone15Reached = false;
    this.milestone25Reached = false;

    // Economy & Pickups
    this.gems = 0;
    this.gemStreak = 0;
    this.gemStreakTimer = 0;

    // Weapon timing
    this.fireCooldown = 0;
    this.recoilAnim = 0;

    // Visual feel
    this.shake = 0;
    this.shakeX = 0;
    this.shakeY = 0;

    // Game lifecycle
    this.over = false;
    this.overTimer = 0;
    this.gameTime = 0;

    // Mobile touch tracking
    this.lastTouchFire = false;
    this.lastPointerDown = false;
    this.touchLeft = false;
    this.touchRight = false;
    this.touchFire = false;

    // Entity collections
    this.bullets = [];
    this.plats = [];
    this.blocks = [];
    this.enemies = [];
    this.gemItems = [];
    this.particles = [];
    this.floatTexts = [];
    this.windStreaks = [];

    // Base starter platform
    this.plats.push({
      x: 74,
      y: 124,
      w: 92,
      h: 8
    });

    // Procedural generation cursor
    this.nextGenY = 175;
    while (this.nextGenY < 420) {
      this.generateNextTier();
    }

    this.spawnFloatingText("DOWNWELL!", 120, 85, 3);
  },

  addShake(amt) {
    this.shake = Math.min(10, this.shake + amt);
  },

  spawnFloatingText(txt, x, y, col = 3) {
    this.floatTexts.push({
      txt: String(txt),
      x: x,
      y: y,
      vy: -32,
      life: 0.9,
      maxLife: 0.9,
      col: col
    });
  },

  spawnGems(x, y, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const spd = 35 + Math.random() * 45;
      this.gemItems.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 50,
        life: 10.0
      });
    }
  },

  spawnGore(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 110,
        vy: (Math.random() - 0.5) * 110 - 20,
        life: 0.35 + Math.random() * 0.25,
        maxLife: 0.6,
        color: Math.random() < 0.6 ? 2 : 3
      });
    }
  },

  spawnExplosion(x, y) {
    this.addShake(5);
    if (typeof APU !== 'undefined') APU.sfx('BOOM');
    for (let i = 0; i < 16; i++) {
      const a = (Math.PI * 2 * i) / 16;
      const spd = 40 + Math.random() * 70;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 0.4 + Math.random() * 0.25,
        maxLife: 0.65,
        color: (i % 2 === 0 ? 3 : 2)
      });
    }
  },

  // Procedural well generator: creates diverse floating platforms, destructible blocks, and subterranean beasts
  generateNextTier() {
    const curY = this.nextGenY;
    const depthMeters = Math.floor(this.depth);

    // Roll structure archetype
    const roll = Math.random();

    if (roll < 0.30) {
      // Archetype 1: Left Ledge attached to masonry wall
      const w = 45 + Math.floor(Math.random() * 30);
      this.plats.push({ x: 24, y: curY, w: w, h: 8 });

      // Monster on ledge
      if (Math.random() < 0.7) {
        const isSpike = depthMeters > 40 && Math.random() < 0.45;
        this.enemies.push({
          type: isSpike ? 'SPIKE' : 'SLIME',
          x: 24 + w / 2,
          y: curY - 7,
          vx: (Math.random() < 0.5 ? 25 : -25),
          minX: 28,
          maxX: 24 + w - 8,
          hp: isSpike ? 2 : 1,
          stompable: !isSpike,
          w: isSpike ? 16 : 14,
          h: 10,
          alive: true,
          gemCount: isSpike ? 6 : 4,
          hopTimer: 1.5 + Math.random()
        });
      }
    } else if (roll < 0.60) {
      // Archetype 2: Right Ledge attached to right masonry wall
      const w = 45 + Math.floor(Math.random() * 30);
      const x = 216 - w;
      this.plats.push({ x: x, y: curY, w: w, h: 8 });

      if (Math.random() < 0.7) {
        const isSpike = depthMeters > 40 && Math.random() < 0.45;
        this.enemies.push({
          type: isSpike ? 'SPIKE' : 'SLIME',
          x: x + w / 2,
          y: curY - 7,
          vx: (Math.random() < 0.5 ? 25 : -25),
          minX: x + 8,
          maxX: 212,
          hp: isSpike ? 2 : 1,
          stompable: !isSpike,
          w: isSpike ? 16 : 14,
          h: 10,
          alive: true,
          gemCount: isSpike ? 6 : 4,
          hopTimer: 1.5 + Math.random()
        });
      }
    } else if (roll < 0.82) {
      // Archetype 3: Central floating platform
      const w = 40 + Math.floor(Math.random() * 35);
      const x = 60 + Math.floor(Math.random() * (120 - w));
      this.plats.push({ x: x, y: curY, w: w, h: 8 });

      if (Math.random() < 0.65) {
        this.enemies.push({
          type: 'SLIME',
          x: x + w / 2,
          y: curY - 7,
          vx: (Math.random() < 0.5 ? 30 : -30),
          minX: x + 4,
          maxX: x + w - 4,
          hp: 1,
          stompable: true,
          w: 14,
          h: 10,
          alive: true,
          gemCount: 4,
          hopTimer: 1.2 + Math.random()
        });
      }
    } else {
      // Archetype 4: Destructible Clay / Soil Block Cluster (shatter when shot or stomped)
      const count = 3 + Math.floor(Math.random() * 3);
      const startX = 64 + Math.floor(Math.random() * 40);
      for (let k = 0; k < count; k++) {
        this.blocks.push({
          x: startX + k * 16,
          y: curY,
          w: 16,
          h: 10,
          alive: true
        });
      }
    }

    // Mid-air Hazards in the shaft: Screech Bats & Floating Spore Mines
    if (Math.random() < 0.55) {
      const hazardY = curY + 24;
      if (depthMeters > 50 && Math.random() < 0.40) {
        // Floating Spore Mine (detonates into 8 gems when shot, dangerous on touch)
        this.enemies.push({
          type: 'MINE',
          x: 60 + Math.random() * 120,
          y: hazardY,
          baseY: hazardY,
          bobTimer: Math.random() * Math.PI,
          vx: 0,
          hp: 1,
          stompable: false,
          w: 14,
          h: 14,
          alive: true,
          gemCount: 8
        });
      } else {
        // Screech Bat (flutters in sinuous wave across the well shaft)
        this.enemies.push({
          type: 'BAT',
          x: 120,
          baseX: 80 + Math.random() * 80,
          y: hazardY,
          angle: Math.random() * Math.PI * 2,
          amplitude: 35 + Math.random() * 25,
          vx: 0,
          vy: (Math.random() - 0.5) * 15,
          hp: 1,
          stompable: true,
          w: 14,
          h: 10,
          alive: true,
          gemCount: 4
        });
      }
    }

    // Step down to next tier
    this.nextGenY += 46 + Math.floor(Math.random() * 24);
  },

  update(dt) {
    // Safety clamp dt to prevent teleportation at extreme speeds or frame hiccups
    dt = Math.min(dt, 0.033);
    this.gameTime += dt;

    // Game Over state handling
    if (this.over) {
      this.overTimer += dt;
      if (this.overTimer > 0.35) {
        const tapTrigger = PAD.tapPos || (PAD.pointer && PAD.pointer.down && !this.lastPointerDown);
        if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || tapTrigger) {
          if (typeof APU !== 'undefined') APU.sfx('UI_OK');
          this.init();
          return;
        }
      }
      this.lastPointerDown = PAD.pointer ? PAD.pointer.down : false;
      return;
    }

    // Screen Shake Decay
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 16);
      this.shakeX = Math.round((Math.random() - 0.5) * this.shake * 2);
      this.shakeY = Math.round((Math.random() - 0.5) * this.shake * 2);
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }

    // Invulnerability timer
    if (this.invuln > 0) this.invuln -= dt;

    // Gem streak audio reset timer
    if (this.gemStreakTimer > 0) {
      this.gemStreakTimer -= dt;
      if (this.gemStreakTimer <= 0) this.gemStreak = 0;
    }

    // Cooldowns
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (this.recoilAnim > 0) this.recoilAnim -= dt;

    // Mobile touch detection & virtual controls
    this.touchLeft = false;
    this.touchRight = false;
    this.touchFire = false;

    if (PAD.pointer && PAD.pointer.down) {
      const tx = PAD.pointer.x;
      const ty = PAD.pointer.y;

      // Bottom-Left Steering zones (x: 0..100, y: 160..240)
      if (tx < 100) {
        if (tx < 46) this.touchLeft = true;
        else this.touchRight = true;
      }
      // Bottom-Right Blast zone (x: 160..256, y: 160..240)
      if (tx > 150) {
        this.touchFire = true;
      }
    }

    const isLeft = PAD.state.left || this.touchLeft;
    const isRight = PAD.state.right || this.touchRight;
    const isFireHeld = PAD.state.a || PAD.state.b || this.touchFire;
    const isFireHit = PAD.hit('a') || PAD.hit('b') || (this.touchFire && !this.lastTouchFire);

    this.lastTouchFire = this.touchFire;
    this.lastPointerDown = PAD.pointer ? PAD.pointer.down : false;

    // Horizontal Steering
    if (isLeft && !isRight) {
      this.vx = -115;
      this.facing = -1;
    } else if (isRight && !isLeft) {
      this.vx = 115;
      this.facing = 1;
    } else {
      this.vx = 0;
    }

    // Gunboots Mechanics & Jump Controls
    if (this.onGround) {
      // On ground: [A] triggers jump
      if (isFireHit) {
        this.vy = -225;
        this.onGround = false;
        this.fireCooldown = 0.12;
        if (typeof APU !== 'undefined') APU.sfx('JUMP');

        // Jump dust particles
        for (let p = 0; p < 5; p++) {
          this.particles.push({
            x: this.px + (Math.random() - 0.5) * 8,
            y: this.py + 6,
            vx: (Math.random() - 0.5) * 50,
            vy: -15 - Math.random() * 25,
            life: 0.22,
            maxLife: 0.22,
            color: 2
          });
        }
      }
    } else {
      // In air: [A] fires rapid gunboot bursts downward
      if (isFireHeld && this.fireCooldown <= 0) {
        if (this.ammo > 0) {
          this.ammo--;
          this.fireCooldown = 0.09;
          this.recoilAnim = 0.12;

          // Downwell signature Kinematic Recoil: braking fall and providing levitation lift
          if (this.vy > 50) {
            this.vy = Math.min(this.vy - 165, -55);
          } else {
            this.vy = Math.max(this.vy - 80, -185);
          }

          this.addShake(2.0);

          // Dual downward kinetic bullet tracers
          this.bullets.push({
            x: this.px - 4,
            y: this.py + 7,
            oldY: this.py + 7,
            vx: -7 + (Math.random() - 0.5) * 6,
            vy: 420 + Math.random() * 30
          });
          this.bullets.push({
            x: this.px + 4,
            y: this.py + 7,
            oldY: this.py + 7,
            vx: 7 + (Math.random() - 0.5) * 6,
            vy: 420 + Math.random() * 30
          });

          // Muzzle blast smoke and flame particles
          for (let sp = 0; sp < 3; sp++) {
            this.particles.push({
              x: this.px + (Math.random() - 0.5) * 8,
              y: this.py + 8,
              vx: (Math.random() - 0.5) * 35,
              vy: -25 - Math.random() * 35,
              life: 0.20,
              maxLife: 0.20,
              color: 3
            });
          }

          // Ejected brass shell casing flying up and sideways
          this.particles.push({
            x: this.px + (this.facing > 0 ? -4 : 4),
            y: this.py + 3,
            vx: (this.facing > 0 ? -45 : 45) + (Math.random() - 0.5) * 20,
            vy: -60 - Math.random() * 30,
            life: 0.35,
            maxLife: 0.35,
            color: 2
          });

          // Punchy staccato gunshot audio
          if (typeof APU !== 'undefined') {
            APU.noise(0.035, 0.20, 1100, 'bandpass');
            APU.tone(160, 0.03, 'triangle', 0.12, 70);
          }
        } else if (isFireHit) {
          // Empty ammo click
          if (typeof APU !== 'undefined') APU.sfx('TICK');
          this.fireCooldown = 0.16;
        }
      }
    }

    // Gravity & Fall Acceleration
    this.vy = Math.min(450, this.vy + 420 * dt);

    // Save previous position for continuous swept collision
    const oldPy = this.py;
    const oldPx = this.px;

    // Movement integration
    this.px += this.vx * dt;
    this.py += this.vy * dt;

    // Strict Playfield Boundaries: Left = 24, Right = 216
    this.px = Math.max(29, Math.min(211, this.px));

    // Platform Collision (Continuous Swept Detection to prevent tunneling at 1.4x speed)
    let landedOnPlat = false;
    const prevFoot = oldPy + 6;
    const newFoot = this.py + 6;

    if (this.vy > 0) {
      // Solid Stone Platforms
      for (let pl of this.plats) {
        if (prevFoot <= pl.y + 4 && newFoot >= pl.y) {
          if (this.px + 4 >= pl.x && this.px - 4 <= pl.x + pl.w) {
            this.py = pl.y - 6;
            this.vy = 0;
            this.onGround = true;
            landedOnPlat = true;
            break;
          }
        }
      }

      // Destructible Clay Blocks
      if (!landedOnPlat) {
        for (let i = this.blocks.length - 1; i >= 0; i--) {
          const bl = this.blocks[i];
          if (!bl.alive) continue;
          if (prevFoot <= bl.y + 4 && newFoot >= bl.y) {
            if (this.px + 4 >= bl.x && this.px - 4 <= bl.x + bl.w) {
              // If diving with high speed or firing gunboots: shatter the block immediately!
              if (isFireHeld || this.vy > 250) {
                bl.alive = false;
                this.vy = -130; // slight drill bounce
                this.ammo = this.maxAmmo;
                this.addShake(2.5);
                if (typeof APU !== 'undefined') APU.noise(0.06, 0.18, 350, 'lowpass');
                // Shatter rubble
                for (let k = 0; k < 5; k++) {
                  this.particles.push({
                    x: bl.x + 8,
                    y: bl.y + 5,
                    vx: (Math.random() - 0.5) * 90,
                    vy: (Math.random() - 0.5) * 90 - 25,
                    life: 0.35,
                    maxLife: 0.35,
                    color: 2
                  });
                }
                this.spawnGems(bl.x + 8, bl.y + 5, 2);
              } else {
                // Land safely on block
                this.py = bl.y - 6;
                this.vy = 0;
                this.onGround = true;
                landedOnPlat = true;
                break;
              }
            }
          }
        }
      }
    }

    if (!landedOnPlat && this.vy !== 0) {
      this.onGround = false;
    }

    // Landing Reload & Air Combo Cash-In
    if (landedOnPlat) {
      // Reload Ammo instantly
      if (this.ammo < this.maxAmmo) {
        this.ammo = this.maxAmmo;
        if (typeof APU !== 'undefined') APU.softTone(750, 0.03, 'triangle', 0.06);
      }

      // Cash in air combo upon touching ground
      if (this.combo >= 3) {
        const bonusGems = this.combo * 3;
        this.gems += bonusGems;
        this.spawnFloatingText("COMBO x" + this.combo + "! +" + bonusGems + "G", this.px, this.py - 16, 3);
        if (typeof APU !== 'undefined') APU.sfx('COIN');
      }

      // Reset air combo state
      this.combo = 0;
      this.milestone8Reached = false;
      this.milestone15Reached = false;
      this.milestone25Reached = false;
    }

    // Camera Scrolling & Infinite Well Descent
    if (this.py > 105) {
      const drop = this.py - 105;
      this.py = 105;
      this.cameraY += drop;
      this.depth += drop * 0.1;

      // Shift world objects upward
      for (let pl of this.plats) pl.y -= drop;
      for (let bl of this.blocks) bl.y -= drop;
      for (let e of this.enemies) e.y -= drop;
      for (let b of this.bullets) { b.y -= drop; b.oldY -= drop; }
      for (let gm of this.gemItems) gm.y -= drop;
      for (let pt of this.particles) pt.y -= drop;
      for (let ft of this.floatTexts) ft.y -= drop;
      for (let ws of this.windStreaks) ws.y -= drop;

      this.nextGenY -= drop;
    }

    // Procedural Tier Generation
    while (this.nextGenY < 320) {
      this.generateNextTier();
    }

    // Wind streaks generation during high-speed diving
    if (this.vy > 220 && Math.random() < 0.45) {
      this.windStreaks.push({
        x: 28 + Math.random() * 180,
        y: 240,
        len: 14 + Math.random() * 22,
        speed: 360 + Math.random() * 160
      });
    }

    for (let i = this.windStreaks.length - 1; i >= 0; i--) {
      const ws = this.windStreaks[i];
      ws.y -= ws.speed * dt;
      if (ws.y + ws.len < -20) this.windStreaks.splice(i, 1);
    }

    // Bullets Update & Hit Registration
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.oldY = b.y;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.y > 248) {
        this.bullets.splice(i, 1);
        continue;
      }

      let bulletHit = false;

      // Bullet hit on Destructible Clay Blocks
      for (let bl of this.blocks) {
        if (bl.alive && b.x >= bl.x && b.x <= bl.x + bl.w && b.oldY <= bl.y + bl.h && b.y >= bl.y) {
          bl.alive = false;
          bulletHit = true;
          this.addShake(1.5);
          if (typeof APU !== 'undefined') APU.noise(0.05, 0.16, 400, 'lowpass');
          for (let k = 0; k < 4; k++) {
            this.particles.push({
              x: bl.x + 8,
              y: bl.y + 5,
              vx: (Math.random() - 0.5) * 80,
              vy: (Math.random() - 0.5) * 80 - 20,
              life: 0.3,
              maxLife: 0.3,
              color: 2
            });
          }
          this.spawnGems(bl.x + 8, bl.y + 5, 2);
          break;
        }
      }

      if (bulletHit) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Bullet hit on Enemies
      for (let e of this.enemies) {
        if (!e.alive) continue;
        if (Math.abs(b.x - e.x) < (e.w / 2 + 4) && b.oldY <= e.y + e.h / 2 && b.y >= e.y - e.h / 2) {
          bulletHit = true;
          e.hp--;
          if (typeof APU !== 'undefined') APU.sfx('HIT');

          // Sparks
          for (let s = 0; s < 3; s++) {
            this.particles.push({
              x: b.x,
              y: b.y,
              vx: (Math.random() - 0.5) * 60,
              vy: (Math.random() - 0.5) * 60,
              life: 0.18,
              maxLife: 0.18,
              color: 3
            });
          }

          if (e.hp <= 0) {
            e.alive = false;
            if (e.type === 'MINE') {
              this.spawnExplosion(e.x, e.y);
              this.spawnGems(e.x, e.y, 8);
            } else {
              this.spawnGore(e.x, e.y, 7);
              this.spawnGems(e.x, e.y, e.gemCount || 4);
            }

            // Air kills increment combo
            if (!this.onGround) {
              this.combo++;
              if (this.combo > this.maxCombo) this.maxCombo = this.combo;
              this.spawnFloatingText(this.combo + " COMBO!", e.x, e.y - 8, 3);
              this.checkComboMilestones();
            }
          }
          break;
        }
      }

      if (bulletHit) {
        this.bullets.splice(i, 1);
      }
    }

    // Enemies Update & Stomp/Hurt Collisions
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.y < -30) {
        this.enemies.splice(i, 1);
        continue;
      }
      if (!e.alive) continue;

      // Enemy AI Behaviors
      if (e.type === 'SLIME') {
        // Frog / Slime crawl and leap
        e.hopTimer -= dt;
        if (e.hopTimer <= 0) {
          e.hopTimer = 1.6 + Math.random();
          e.vy = -120; // hop upward
        }
        if (e.vy) {
          e.y += e.vy * dt;
          e.vy += 320 * dt;
          if (e.vy > 0) e.vy = 0;
        }
        e.x += e.vx * dt;
        if (e.x < e.minX) { e.x = e.minX; e.vx = Math.abs(e.vx); }
        if (e.x > e.maxX) { e.x = e.maxX; e.vx = -Math.abs(e.vx); }
      } else if (e.type === 'SPIKE') {
        // Spiky Beetle patrol
        e.x += e.vx * dt;
        if (e.x < e.minX) { e.x = e.minX; e.vx = Math.abs(e.vx); }
        if (e.x > e.maxX) { e.x = e.maxX; e.vx = -Math.abs(e.vx); }
      } else if (e.type === 'BAT') {
        // Screech Bat sine wave flutter
        e.angle += dt * 3.6;
        e.x = e.baseX + Math.sin(e.angle) * e.amplitude;
        e.y += e.vy * dt;
        e.x = Math.max(32, Math.min(208, e.x));
      } else if (e.type === 'MINE') {
        // Floating Spore Mine bob
        e.bobTimer += dt * 2.8;
        e.y = e.baseY + Math.sin(e.bobTimer) * 5;
      }

      // Player vs Monster Collision
      const dx = this.px - e.x;
      const dy = this.py - e.y;
      const overlapX = Math.abs(dx) < (e.w / 2 + 5);
      const overlapY = Math.abs(dy) < (e.h / 2 + 6);

      if (overlapX && overlapY) {
        // Check for Stomp: Player falling from above onto monster
        const isStomp = (this.vy > 10) && (oldPy + 5 <= e.y + 2 || this.py < e.y);

        if (isStomp) {
          if (e.stompable) {
            // STOMP SUCCESS: Squash monster, bounce up, refill ammo, increment combo!
            e.alive = false;
            this.vy = -225; // Snappy bounce
            this.ammo = this.maxAmmo; // Full reload
            this.combo++;
            if (this.combo > this.maxCombo) this.maxCombo = this.combo;

            this.addShake(3.5);
            if (typeof APU !== 'undefined') {
              APU.sfx('HIT');
              APU.softTone(180, 0.08, 'triangle', 0.15, 340);
            }

            this.spawnGore(e.x, e.y, 9);
            this.spawnGems(e.x, e.y, e.gemCount || 4);
            this.spawnFloatingText(this.combo + " COMBO!", e.x, e.y - 10, 3);
            this.checkComboMilestones();
          } else {
            // UN-STOMPABLE (Spiky Beetle carapace / Spore Mine hurts boots!)
            if (this.invuln <= 0) {
              this.takeDamage(1, dx);
            }
          }
        } else {
          // Bodily collision from side or below
          if (this.invuln <= 0) {
            if (e.type === 'MINE') {
              e.alive = false;
              this.spawnExplosion(e.x, e.y);
            }
            this.takeDamage(1, dx);
          }
        }
      }
    }

    // Gem Collection & Magnetic Attraction
    for (let i = this.gemItems.length - 1; i >= 0; i--) {
      const gm = this.gemItems[i];
      gm.life -= dt;
      if (gm.life <= 0 || gm.y < -30) {
        this.gemItems.splice(i, 1);
        continue;
      }

      const dx = this.px - gm.x;
      const dy = this.py - gm.y;
      const dist = Math.hypot(dx, dy);

      // Magnetic Attraction Field (65px radius)
      if (dist < 65) {
        const pull = 390 * (1 - dist / 65);
        gm.vx += (dx / Math.max(1, dist)) * pull * dt;
        gm.vy += (dy / Math.max(1, dist)) * pull * dt;
      } else {
        gm.vy = Math.min(130, gm.vy + 180 * dt);
        gm.vx *= 0.96;
      }

      gm.x += gm.vx * dt;
      gm.y += gm.vy * dt;

      // Well wall bounces
      if (gm.x < 27) { gm.x = 27; gm.vx = Math.abs(gm.vx) * 0.6; }
      if (gm.x > 213) { gm.x = 213; gm.vx = -Math.abs(gm.vx) * 0.6; }

      // Gem Pickup
      if (dist < 12) {
        this.gems++;
        this.gemStreak++;
        this.gemStreakTimer = 0.85;

        // Ascending musical scale chime
        if (typeof APU !== 'undefined') {
          const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
          const freq = scale[(this.gemStreak - 1) % scale.length];
          APU.softTone(freq, 0.06, 'sine', 0.08, 0, 0.004, 2200);
        }

        // Sparkle burst
        for (let s = 0; s < 3; s++) {
          this.particles.push({
            x: gm.x,
            y: gm.y,
            vx: (Math.random() - 0.5) * 60,
            vy: (Math.random() - 0.5) * 60,
            life: 0.22,
            maxLife: 0.22,
            color: 3
          });
        }
        this.gemItems.splice(i, 1);
      }
    }

    // Debris & Particles Update
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    // Floating Text Update
    for (let i = this.floatTexts.length - 1; i >= 0; i--) {
      const ft = this.floatTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * dt;
    }

    // Platform & Block Cleanup
    for (let i = this.plats.length - 1; i >= 0; i--) {
      if (this.plats[i].y < -30) this.plats.splice(i, 1);
    }
    for (let i = this.blocks.length - 1; i >= 0; i--) {
      if (this.blocks[i].y < -30 || !this.blocks[i].alive) this.blocks.splice(i, 1);
    }
  },

  checkComboMilestones() {
    // 8 Combo: +50 Gems bonus + fanfare
    if (this.combo >= 8 && !this.milestone8Reached) {
      this.milestone8Reached = true;
      this.gems += 50;
      this.spawnFloatingText("+50 GEMS!", this.px, this.py - 18, 3);
      if (typeof APU !== 'undefined') APU.sfx('POWER');
    }

    // 15 Combo: +100 Gems + 2 Max Ammo bonus
    if (this.combo >= 15 && !this.milestone15Reached) {
      this.milestone15Reached = true;
      this.gems += 100;
      this.maxAmmo = Math.min(16, this.maxAmmo + 2);
      this.ammo = this.maxAmmo;
      this.spawnFloatingText("+2 MAX AMMO! +100G!", this.px, this.py - 18, 3);
      if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
    }

    // 25 Combo: +1 HP recovery!
    if (this.combo >= 25 && !this.milestone25Reached) {
      this.milestone25Reached = true;
      this.hp = Math.min(this.maxHp, this.hp + 1);
      this.spawnFloatingText("+1 HP RECOVERED!", this.px, this.py - 18, 3);
      if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
    }
  },

  takeDamage(amt, hitDirX) {
    this.hp -= amt;
    this.invuln = 1.25;
    this.combo = 0; // combo broken
    this.addShake(7);

    // Knockback
    this.vy = -140;
    this.vx = hitDirX < 0 ? 110 : -110;

    if (typeof APU !== 'undefined') APU.sfx('BOOM');

    if (this.hp <= 0) {
      this.hp = 0;
      this.over = true;
      this.overTimer = 0;
      const finalScore = Math.floor(this.depth);
      if (typeof SAVE !== 'undefined' && SAVE.setScore) {
        this.newRecord = SAVE.setScore(this.id, finalScore);
        this.bestDepth = SAVE.getScore(this.id);
      }
      this.spawnExplosion(this.px, this.py);
    }
  },

  render(g) {
    // Clear screen to deep CRT phosphor black
    g.clear(0);

    const ox = this.shakeX;
    const oy = this.shakeY;

    // Background High-Speed Wind Streaks
    for (let ws of this.windStreaks) {
      const wx = Math.floor(ws.x + ox);
      const wy = Math.floor(ws.y + oy);
      g.line(wx, wy, wx, wy + Math.floor(ws.len), 1);
    }

    // 240x240 CRT Well Architecture: Textured Stone Walls
    // Left masonry wall: x = 0..24
    g.rect(0, 0, 24, 240, 1);
    g.line(24, 0, 24, 240, 3); // Left inner face line

    // Right masonry wall: x = 216..255 (safely within 255 screen buffer)
    g.rect(216, 0, 40, 240, 1);
    g.line(216, 0, 216, 240, 3); // Right inner face line
    g.rect(242, 0, 14, 240, 0); // Dark bedrock border

    // Scrolling Masonry Bricks & Cross Mortar
    const scrollY = Math.floor(this.cameraY) % 16;
    for (let y = -16; y <= 256; y += 16) {
      const dy = y - scrollY;
      if (dy >= -1 && dy <= 240) {
        g.line(0, dy, 24, dy, 2);
        g.line(216, dy, 240, dy, 2);

        // Alternating brick joints
        const row = Math.floor((this.cameraY + dy) / 16);
        if (row % 2 === 0) {
          g.line(12, dy, 12, dy + 16, 2);
          g.line(228, dy, 228, dy + 16, 2);
        } else {
          g.line(6, dy, 6, dy + 16, 2);
          g.line(18, dy, 18, dy + 16, 2);
          g.line(222, dy, 222, dy + 16, 2);
          g.line(234, dy, 234, dy + 16, 2);
        }
      }
    }

    // Decorative Moss & Foliage along inner stone well faces
    for (let my = -32; my <= 256; my += 32) {
      const dmy = my - (Math.floor(this.cameraY) % 64);
      if (dmy >= 0 && dmy <= 236) {
        g.disc(24, dmy, 2, 2);
        g.px(25, dmy + 1, 3);
        g.disc(216, dmy + 16, 2, 2);
        g.px(215, dmy + 17, 3);
      }
    }

    // Outer Right Wall Depth Progress Gauge
    g.line(248, 16, 248, 224, 1);
    const meterIndicatorY = 16 + (Math.floor(this.depth * 0.5) % 208);
    g.rect(246, meterIndicatorY - 2, 5, 4, 3);

    // Render Floating Platforms & Ledges
    for (let pl of this.plats) {
      const rx = Math.floor(pl.x + ox);
      const ry = Math.floor(pl.y + oy);
      const rw = Math.floor(pl.w);
      const rh = Math.floor(pl.h);
      g.rect(rx, ry, rw, rh, 2);
      g.box(rx, ry, rw, rh, 3);
      // Moss top surface
      g.line(rx + 1, ry + 1, rx + rw - 2, ry + 1, 3);
      g.line(rx + 2, ry + rh - 2, rx + rw - 3, ry + rh - 2, 1);
    }

    // Render Destructible Soil/Clay Blocks
    for (let bl of this.blocks) {
      if (!bl.alive) continue;
      const bx = Math.floor(bl.x + ox);
      const by = Math.floor(bl.y + oy);
      g.rect(bx, by, 16, 10, 2);
      g.box(bx, by, 16, 10, 3);
      // Cracked clay strata lines
      g.line(bx + 4, by + 2, bx + 12, by + 8, 1);
      g.line(bx + 11, by + 2, bx + 5, by + 8, 1);
      g.line(bx + 1, by + 1, bx + 14, by + 1, 3);
    }

    // Render Subterranean Monsters
    for (let e of this.enemies) {
      if (!e.alive) continue;
      const ex = Math.floor(e.x + ox);
      const ey = Math.floor(e.y + oy);

      if (e.type === 'SLIME') {
        // Cave Frog / Slime: soft body, big cute eyes
        g.disc(ex, ey, 5, 2);
        g.rect(ex - 6, ey, 13, 5, 2);
        // Eyes
        g.disc(ex - 3, ey - 5, 2, 3);
        g.disc(ex + 3, ey - 5, 2, 3);
        g.px(ex - 3 + (e.vx > 0 ? 1 : -1), ey - 5, 0);
        g.px(ex + 3 + (e.vx > 0 ? 1 : -1), ey - 5, 0);
      } else if (e.type === 'SPIKE') {
        // Spiky Red Beetle: CANNOT BE STOMPED! Armored shell with 3 sharp upright jagged spikes
        g.rect(ex - 7, ey - 2, 14, 7, 2);
        g.box(ex - 7, ey - 2, 14, 7, 1);
        // 3 Sharp Upright Spikes (Danger!)
        g.tri(ex - 6, ey - 2, ex - 4, ey - 9, ex - 2, ey - 2, 3);
        g.tri(ex - 2, ey - 2, ex, ey - 10, ex + 2, ey - 2, 3);
        g.tri(ex + 2, ey - 2, ex + 4, ey - 9, ex + 6, ey - 2, 3);
        // Glowing warning eyes
        g.px(ex - 4, ey + 1, 3);
        g.px(ex + 4, ey + 1, 3);
        // Scuttling legs
        g.line(ex - 6, ey + 5, ex - 8, ey + 7, 2);
        g.line(ex + 6, ey + 5, ex + 8, ey + 7, 2);
      } else if (e.type === 'BAT') {
        // Screech Bat: animated flapping wings, sinuous flight
        g.disc(ex, ey, 3, 2);
        g.line(ex - 2, ey - 3, ex - 3, ey - 6, 3);
        g.line(ex + 2, ey - 3, ex + 3, ey - 6, 3);
        g.px(ex - 1, ey - 1, 3);
        g.px(ex + 1, ey - 1, 3);
        // Flapping wings
        if (Math.floor(this.gameTime * 10) % 2 === 0) {
          // Wings Up
          g.tri(ex - 2, ey, ex - 8, ey - 6, ex - 4, ey + 2, 3);
          g.tri(ex + 2, ey, ex + 8, ey - 6, ex + 4, ey + 2, 3);
        } else {
          // Wings Down
          g.tri(ex - 2, ey, ex - 9, ey + 5, ex - 4, ey + 1, 3);
          g.tri(ex + 2, ey, ex + 9, ey + 5, ex + 4, ey + 1, 3);
        }
      } else if (e.type === 'MINE') {
        // Floating Spore Mine: pulsating spiky core
        g.disc(ex, ey, 5, 1);
        g.circle(ex, ey, 5, 2);
        const pulse = Math.sin(this.gameTime * 9) > 0 ? 3 : 2;
        g.disc(ex, ey, pulse, 3);
        // Radial spikes
        g.line(ex - 8, ey, ex + 8, ey, 3);
        g.line(ex, ey - 8, ex, ey + 8, 3);
        g.px(ex - 6, ey - 6, 3);
        g.px(ex + 6, ey - 6, 3);
        g.px(ex - 6, ey + 6, 3);
        g.px(ex + 6, ey + 6, 3);
      }
    }

    // Render Sparkling Phosphor Gems
    for (let gm of this.gemItems) {
      const gx = Math.floor(gm.x + ox);
      const gy = Math.floor(gm.y + oy);
      g.rect(gx - 1, gy, 3, 1, 3);
      g.rect(gx, gy - 1, 1, 3, 3);
      g.px(gx, gy, 0);
    }

    // Render Gunboot Bullets
    for (let b of this.bullets) {
      const bx = Math.floor(b.x + ox);
      const by = Math.floor(b.y + oy);
      g.line(bx, by, bx, by + 5, 3);
      g.px(bx, by + 6, 2);
    }

    // Render Particles & Ejected Shell Casings
    for (let p of this.particles) {
      const px = Math.floor(p.x + ox);
      const py = Math.floor(p.y + oy);
      g.px(px, py, p.color);
    }

    // Render Player Character & Gunboot Exhaust Blasts
    if (!this.over) {
      // Invulnerability flicker
      if (this.invuln <= 0 || Math.floor(this.gameTime * 24) % 2 === 0) {
        const px = Math.floor(this.px + ox);
        const py = Math.floor(this.py + oy);

        // Helmet & Visor
        g.disc(px, py - 4, 4, 3);
        g.line(px - 2, py - 5, px + 2, py - 5, 0);
        g.px(px + this.facing * 2, py - 5, 3);

        // Jacket / Torso
        g.rect(px - 3, py - 1, 7, 6, 2);
        g.line(px - 2, py + 4, px + 2, py + 4, 1);

        // Chunky Gunboots
        g.rect(px - 4, py + 5, 3, 3, 3);
        g.rect(px + 1, py + 5, 3, 3, 3);

        // Flaring Gunboot Exhaust & Muzzle Flash when firing
        if (this.recoilAnim > 0) {
          g.tri(px - 3, py + 8, px - 6, py + 15, px - 1, py + 15, 3);
          g.tri(px + 2, py + 8, px, py + 15, px + 5, py + 15, 3);
        }

        // Speed streaks alongside character during deep dives
        if (this.vy > 240) {
          g.line(px - 7, py - 2, px - 7, py + 6, 3);
          g.line(px + 7, py - 2, px + 7, py + 6, 3);
        }
      }
    }

    // Floating Text Callouts (Combos, Milestone Bonuses, etc.)
    for (let ft of this.floatTexts) {
      const tx = Math.floor(ft.x + ox);
      const ty = Math.floor(ft.y + oy);
      g.textC(ft.txt, ty, ft.col);
    }

    // =========================================================================
    // CRT HEADS-UP DISPLAY (Static, unaffected by screenshake)
    // =========================================================================
    // Top HUD Bar
    g.text("DEPTH: " + Math.floor(this.depth) + "M", 28, 5, 3);
    g.textR("★ " + this.gems, 212, 5, 3);

    // HP Display (Hearts)
    g.text("HP:", 28, 14, 2);
    for (let i = 0; i < this.maxHp; i++) {
      g.text("♥", 46 + i * 8, 14, i < this.hp ? 3 : 1);
    }

    // Ammo Meter
    g.text("AMMO:", 96, 14, 2);
    const ammoFilled = "■".repeat(this.ammo);
    const ammoEmpty = "·".repeat(Math.max(0, this.maxAmmo - this.ammo));
    g.text(ammoFilled + ammoEmpty, 126, 14, this.ammo > 0 ? 3 : 1);

    // Active Air Combo Badge
    if (this.combo >= 2) {
      g.rect(26, 23, 62, 9, 0);
      g.box(26, 23, 62, 9, 3);
      g.text("COMBO x" + this.combo, 29, 25, 3);
    }

    // =========================================================================
    // MOBILE TOUCH ERGONOMICS OVERLAY (Bottom corners)
    // =========================================================================
    // Left Steering Button (◀)
    g.rect(6, 196, 36, 36, this.touchLeft ? 2 : 0);
    g.box(6, 196, 36, 36, this.touchLeft ? 3 : 1);
    g.text("◀", 20, 211, this.touchLeft ? 3 : 2);

    // Right Steering Button (▶)
    g.rect(46, 196, 36, 36, this.touchRight ? 2 : 0);
    g.box(46, 196, 36, 36, this.touchRight ? 3 : 1);
    g.text("▶", 60, 211, this.touchRight ? 3 : 2);

    // Fire / Jump Gunboots Button ([A] BLAST)
    g.rect(184, 194, 64, 38, this.touchFire ? 2 : 0);
    g.box(184, 194, 64, 38, this.touchFire ? 3 : 2);
    g.text("BLAST", 198, 203, this.touchFire ? 3 : 2);
    g.text("[A]", 206, 215, this.touchFire ? 3 : 1);

    // =========================================================================
    // GAME OVER MODAL SCREEN
    // =========================================================================
    if (this.over) {
      g.rect(36, 60, 184, 115, 0);
      g.box(36, 60, 184, 115, 3);
      g.box(38, 62, 180, 111, 1);

      g.textC("--- FELL IN THE WELL ---", 70, 1);
      g.textC("FINAL DEPTH: " + Math.floor(this.depth) + " M", 85, 3);

      if (this.newRecord) {
        g.textC("★ NEW RECORD DEPTH! ★", 99, 3);
      } else {
        g.textC("BEST DEPTH: " + this.bestDepth + " M", 99, 2);
      }

      g.textC("GEMS HOARDED: " + this.gems, 113, 3);
      g.textC("BEST AIR COMBO: x" + this.maxCombo, 127, 2);

      const blink = Math.floor(this.gameTime * 4) % 2 === 0;
      g.textC("PRESS [A] OR TAP TO RETRY", 150, blink ? 3 : 2);
    }
  }
};
