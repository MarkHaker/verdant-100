// js/cartridges/cart_036_doodle_jump.js
// ============================================================================
// Cartridge #036: DOODLE JUMP
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 36. DOODLE JUMP
CARTS[36] = {
  id: 36,
  name: "DOODLE JUMP",
  genre: 3,
  scoreLabel: "HEIGHT",
  desc: "BOUNCE UP PROCEDURAL PLATFORMS. STEER LEFT/RIGHT WITH D-PAD OR TILT!",

  // 32x32 Hand-Crafted Retro Icon: Iconic 4-legged Doodler with snout jumping off a platform with coiled spring
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Faint graph-paper lines inside icon
    g.line(x + 2, y + 10, x + 29, y + 10, 1);
    g.line(x + 2, y + 20, x + 29, y + 20, 1);
    g.line(x + 8, y + 2, x + 8, y + 29, 1);
    g.line(x + 20, y + 2, x + 20, y + 29, 1);

    // Green bounce platform at bottom
    g.rect(x + 4, y + 25, 24, 4, 2);
    g.box(x + 4, y + 25, 24, 4, 3);

    // Coiled spring mounted on platform (x + 16)
    g.line(x + 15, y + 25, x + 18, y + 24, 3);
    g.line(x + 18, y + 24, x + 15, y + 22, 3);
    g.line(x + 15, y + 22, x + 18, y + 20, 3);
    g.rect(x + 14, y + 20, 5, 1, 3);

    // Springing Doodler: dome body, big cartoon eyes, tube snout, and 4 dangling legs
    const dx = x + 13;
    const dy = y + 11;
    // Body
    g.disc(dx, dy - 2, 5, 2);
    g.rect(dx - 5, dy - 2, 11, 4, 2);
    g.px(dx - 2, dy - 6, 3);
    g.px(dx - 1, dy - 6, 3);

    // Big cartoon eyes
    g.rect(dx + 1, dy - 5, 3, 3, 3);
    g.px(dx + 2, dy - 4, 0);
    g.rect(dx + 4, dy - 5, 3, 3, 3);
    g.px(dx + 5, dy - 4, 0);

    // Tube snout facing right
    g.rect(dx + 6, dy - 3, 4, 3, 2);
    g.box(dx + 6, dy - 3, 4, 3, 3);
    g.px(dx + 9, dy - 2, 0);

    // 4 little legs dangling downward towards the spring
    g.line(dx - 4, dy + 2, dx - 5, dy + 6, 2);
    g.line(dx - 2, dy + 2, dx - 2, dy + 7, 3);
    g.line(dx + 1, dy + 2, dx + 2, dy + 7, 2);
    g.line(dx + 3, dy + 2, dx + 4, dy + 6, 3);

    // Action stars / jump sparkles
    g.px(x + 23, y + 14, 3);
    g.px(x + 6, y + 15, 3);
    g.px(x + 22, y + 7, 3);
  },

  init() {
    // Playfield bounds: 240px wide CRT area centered between x=8 and x=248
    this.px = 128;
    this.py = 180;
    this.vx = 0;
    this.vy = -260; // Initial upward bounce
    this.facing = 1; // 1 = right, -1 = left
    this.squash = 0; // Squash on impact
    this.stretch = 0; // Stretch on launch

    this.score = 0;
    this.cameraY = 0;
    this.bestScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;
    this.newRecord = false;
    this.over = false;
    this.overTimer = 0;
    this.fallDeath = false;
    this.fallTimer = 0;
    this.boomPlayed = false;
    this.knockedOut = false;

    this.gameTime = 0;
    this.hintTimer = 4.5; // On-screen touch/control guidance
    this.fireCooldown = 0;
    this.shootRecoil = 0;
    this.pointerShotFired = false;

    // Active power-up: null or { type: 'PROPELLER'|'JETPACK', timer: 3.0, maxTimer: 3.0 }
    this.powerup = null;

    // Entities
    this.bullets = [];
    this.monsters = [];
    this.particles = [];
    this.debris = []; // Broken platform halves
    this.nextMonsterScore = 320;
    this.lastRecycledType = 'NORMAL';

    // Generate guaranteed-solvable procedural platform layout
    // Apex jump height is ~60px. Max consecutive bounceable gap is strictly <= 39px.
    this.plats = [];
    let curY = 216;
    // Base starter platform directly beneath player
    this.plats.push({
      x: 104, y: curY, w: 32, h: 6,
      type: 'NORMAL',
      vx: 0, minX: 16, maxX: 200,
      item: null, broken: false
    });

    // Procedural upward ladder of 8-9 platforms
    while (curY > 15) {
      const gap = 26 + Math.floor(Math.random() * 14); // strictly 26..39 px
      curY -= gap;
      const x = 16 + Math.floor(Math.random() * (240 - 32 - 16));
      this.plats.push({
        x: x, y: curY, w: 32, h: 6,
        type: 'NORMAL',
        vx: 0, minX: 16, maxX: 200,
        item: null, broken: false
      });
    }
  },

  update(dt) {
    // Clamp delta time to avoid large physics tunnels on lag spikes
    dt = Math.min(dt, 0.05);
    this.gameTime += dt;
    if (this.hintTimer > 0) this.hintTimer -= dt;
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (this.shootRecoil > 0) this.shootRecoil -= dt * 8;

    // ------------------------------------------------------------------------
    // GAME OVER STATE
    // ------------------------------------------------------------------------
    if (this.over) {
      this.overTimer += dt;
      // Falling whistling pitch drop & crater boom sequence
      if (this.fallDeath) {
        this.fallTimer += dt;
        if (!this.boomPlayed && this.fallTimer >= 0.38) {
          this.boomPlayed = true;
          if (typeof APU !== 'undefined') APU.sfx('BOOM');
        }
      }

      // Debris & particles continue settling
      for (let d of this.debris) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vy += 400 * dt;
      }
      for (let p of this.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
      }

      // Retry inputs: [A], [B], [Start], or screen tap
      const restartRequested =
        (typeof PAD !== 'undefined' && (PAD.hit('a') || PAD.hit('b') || PAD.hit('start'))) ||
        (typeof PAD !== 'undefined' && PAD.tapPos) ||
        (typeof PAD !== 'undefined' && PAD.pointer && PAD.pointer.down && this.overTimer > 0.4);

      if (restartRequested) {
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        this.init();
      }
      return;
    }

    // ------------------------------------------------------------------------
    // STEERING & INPUTS (D-Pad, Keyboard, Touch Pointer, Accelerometer Tilt)
    // ------------------------------------------------------------------------
    let steer = 0;
    if (typeof PAD !== 'undefined') {
      if (PAD.state.left) steer -= 1;
      if (PAD.state.right) steer += 1;

      // Accelerometer tilt steering
      if (PAD.tilt && Math.abs(PAD.tilt.x) > 1.2) {
        steer += Math.max(-1, Math.min(1, PAD.tilt.x * 0.18));
      }

      // Mobile Touch Drag & Bottom Half Steering Zones
      if (PAD.pointer && PAD.pointer.down) {
        if (PAD.pointer.y >= 100) { // Lower screen steering zone
          if (PAD.pointer.x < 120) steer = -1;
          else if (PAD.pointer.x > 136) steer = 1;
          // Drag steering towards pointer if tracking nearby
          const dx = PAD.pointer.x - this.px;
          if (Math.abs(dx) < 36) {
            if (Math.abs(dx) > 4) steer = dx > 0 ? 1 : -1;
            else steer = 0;
          }
        }
      }
    }

    // Facing direction
    if (steer < -0.1) this.facing = -1;
    else if (steer > 0.1) this.facing = 1;

    // Horizontal acceleration & movement (165 px/s steer speed)
    const targetVx = steer * 165;
    this.vx += (targetVx - this.vx) * 14 * dt;
    this.px += this.vx * dt;

    // Smooth Screen Wrap on 240x240 CRT Boundary (X: 8..248)
    this.px = 8 + (((this.px - 8) % 240 + 240) % 240);

    // ------------------------------------------------------------------------
    // NOSE PELLET SHOOTING ([A] / Up / Space / [B] / Upper Half Touch Tap)
    // ------------------------------------------------------------------------
    let shoot = false;
    if (typeof PAD !== 'undefined') {
      if (PAD.hit('a') || PAD.hit('up') || PAD.hit('b')) shoot = true;
      // Upper half tap
      if (PAD.tapPos && PAD.tapPos.y < 120) shoot = true;
      // Direct touch pointer down in upper half
      if (PAD.pointer && PAD.pointer.down && PAD.pointer.y < 100 && !this.pointerShotFired) {
        shoot = true;
        this.pointerShotFired = true;
      }
      if (!PAD.pointer || !PAD.pointer.down) {
        this.pointerShotFired = false;
      }
    }

    if (shoot && this.fireCooldown <= 0 && this.bullets.length < 5) {
      this.fireCooldown = 0.16;
      this.shootRecoil = 1.0;
      const muzzleX = this.px + (this.facing > 0 ? 7 : -7);
      const muzzleY = this.py - 10;
      this.bullets.push({
        x: muzzleX,
        y: muzzleY,
        vx: (Math.random() - 0.5) * 10,
        vy: -420,
        life: 0.9
      });

      // Sound: APU.sfx('CONFIRM') + authentic popping pellet sound
      if (typeof APU !== 'undefined') {
        if (typeof APU.sfx === 'function') APU.sfx('CONFIRM');
        if (typeof APU.tone === 'function') APU.tone(640, 0.04, 'triangle', 0.14, 300);
      }
    }

    // ------------------------------------------------------------------------
    // POWER-UP LIFECYCLE (Propeller Hat & Jetpack: 3s invincible upward blast)
    // ------------------------------------------------------------------------
    if (this.powerup) {
      this.powerup.timer -= dt;
      if (this.powerup.type === 'PROPELLER') {
        this.vy = -250;
        // Rhythmic propeller whir
        if (Math.floor(this.gameTime * 24) % 4 === 0 && typeof APU !== 'undefined') {
          APU.tone(880, 0.02, 'sine', 0.03, 700);
        }
      } else if (this.powerup.type === 'JETPACK') {
        this.vy = -350;
        // Rocket exhaust particles
        const jX = this.facing > 0 ? this.px - 6 : this.px + 6;
        this.particles.push({
          x: jX + (Math.random() - 0.5) * 4,
          y: this.py + 4,
          vx: (Math.random() - 0.5) * 20,
          vy: 120 + Math.random() * 80,
          color: Math.random() < 0.6 ? 3 : 2,
          life: 0.22, maxLife: 0.22
        });
        if (Math.floor(this.gameTime * 18) % 3 === 0 && typeof APU !== 'undefined') {
          APU.noise(0.04, 0.06, 320, 'lowpass');
        }
      }

      if (this.powerup.timer <= 0) {
        // Powerup expires: detaches and falls away
        this.debris.push({
          x: this.px, y: this.py - 10,
          vx: (Math.random() - 0.5) * 50, vy: -60,
          type: this.powerup.type
        });
        this.powerup = null;
      }
    }

    // ------------------------------------------------------------------------
    // PHYSICS INTEGRATION & SUB-STEPPING (prevents tunneling through platforms)
    // ------------------------------------------------------------------------
    let remDt = dt;
    while (remDt > 0) {
      const subDt = Math.min(remDt, 0.025);
      this.stepPhysics(subDt);
      remDt -= subDt;
    }

    // ------------------------------------------------------------------------
    // SQUASH & STRETCH ANIMATION SPRINGS
    // ------------------------------------------------------------------------
    this.squash += (0 - this.squash) * 15 * dt;
    if (this.vy < -120) {
      this.stretch = Math.min(0.38, -this.vy / 650);
    } else {
      this.stretch += (0 - this.stretch) * 12 * dt;
    }

    // ------------------------------------------------------------------------
    // CAMERA ASCENT & PROCEDURAL GENERATION (midpoint scrolling)
    // ------------------------------------------------------------------------
    if (this.py < 110) {
      const diff = 110 - this.py;
      this.py = 110;
      this.cameraY += diff;
      this.score = Math.max(this.score, Math.floor(this.cameraY));

      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        this.newRecord = true;
      }

      // Scroll platforms down
      for (let pl of this.plats) {
        pl.y += diff;
      }
      // Scroll monsters
      for (let m of this.monsters) {
        m.y += diff;
        m.baseY += diff;
      }
      // Scroll bullets
      for (let b of this.bullets) {
        b.y += diff;
      }
      // Scroll particles & debris
      for (let p of this.particles) {
        p.y += diff;
      }
      for (let d of this.debris) {
        d.y += diff;
      }

      // ----------------------------------------------------------------------
      // PROCEDURAL PLATFORM RECYCLING & GUARANTEED SOLVABILITY
      // ----------------------------------------------------------------------
      for (let pl of this.plats) {
        if (pl.y > 248) {
          // Find the highest existing bounceable platform
          let minY = 240;
          for (let p of this.plats) {
            if (p !== pl && !p.broken && p.type !== 'CRACKED' && p.y < minY) {
              minY = p.y;
            }
          }
          if (minY === 240) {
            for (let p of this.plats) {
              if (p !== pl && p.y < minY) minY = p.y;
            }
          }
          if (minY === 240) minY = 10;

          // Strictly guarantee gap is <= 39px (apex is 60.35px)
          const gap = 26 + Math.floor(Math.random() * 14);
          pl.y = minY - gap;
          pl.x = 16 + Math.floor(Math.random() * (240 - 32 - 16));
          pl.broken = false;
          pl.springTriggered = false;
          pl.trampTriggered = false;
          pl.item = null;

          // Platform Type Distribution based on altitude
          const roll = Math.random();
          if (this.score < 150) {
            // Early game: mostly solid green, some springs/trampolines
            if (roll < 0.75) pl.type = 'NORMAL';
            else if (roll < 0.88) pl.type = 'SPRING';
            else pl.type = 'TRAMPOLINE';
          } else if (this.score < 450) {
            // Mid game: introduce moving blue platforms
            if (roll < 0.50) pl.type = 'NORMAL';
            else if (roll < 0.75) {
              pl.type = 'MOVING';
              pl.vx = (Math.random() < 0.5 ? 1 : -1) * (45 + Math.random() * 35);
            } else if (roll < 0.88) pl.type = 'SPRING';
            else pl.type = 'TRAMPOLINE';
          } else {
            // High altitude: dynamic mix with rare cracked brown platforms
            if (roll < 0.38) pl.type = 'NORMAL';
            else if (roll < 0.70) {
              pl.type = 'MOVING';
              pl.vx = (Math.random() < 0.5 ? 1 : -1) * (55 + Math.random() * 45);
            } else if (roll < 0.82) pl.type = 'SPRING';
            else if (roll < 0.92) pl.type = 'TRAMPOLINE';
            else {
              if (this.lastRecycledType !== 'CRACKED') {
                pl.type = 'CRACKED';
              } else {
                pl.type = 'NORMAL';
              }
            }
          }
          this.lastRecycledType = pl.type;

          // Occasional Power-up Pickup on solid/normal platforms (8% chance)
          if ((pl.type === 'NORMAL' || pl.type === 'MOVING') && !this.powerup && Math.random() < 0.08) {
            pl.item = Math.random() < 0.5 ? 'PROPELLER' : 'JETPACK';
          }
        }
      }

      // ----------------------------------------------------------------------
      // PROCEDURAL HAZARDS & MONSTERS (Spawn above 300m)
      // ----------------------------------------------------------------------
      if (this.score >= this.nextMonsterScore && this.monsters.length < 2) {
        const mX = 30 + Math.floor(Math.random() * 180);
        const mType = Math.random() < 0.6 ? 'ALIEN' : 'UFO';
        this.monsters.push({
          x: mX, y: -24,
          baseX: mX, baseY: -24,
          vx: (Math.random() < 0.5 ? 1 : -1) * (25 + Math.random() * 25),
          type: mType,
          w: 16, h: 14,
          alive: true
        });
        this.nextMonsterScore = this.score + 180 + Math.floor(Math.random() * 120);
      }
    }

    // ------------------------------------------------------------------------
    // BULLETS UPDATE & MONSTER COLLISIONS
    // ------------------------------------------------------------------------
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;

      // Screen wrap for bullets
      if (b.x < 8) b.x += 240;
      else if (b.x >= 248) b.x -= 240;

      // Check collision with living monsters
      let hit = false;
      for (let m of this.monsters) {
        if (m.alive && b.x >= m.x - 2 && b.x <= m.x + m.w + 2 &&
            b.y >= m.y - 2 && b.y <= m.y + m.h + 2) {
          hit = true;
          m.alive = false;
          this.score += 200;

          // Explosion sparkle burst
          for (let k = 0; k < 8; k++) {
            const angle = (k / 8) * Math.PI * 2;
            const spd = 40 + Math.random() * 60;
            this.particles.push({
              x: m.x + m.w / 2, y: m.y + m.h / 2,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              color: 3, life: 0.35, maxLife: 0.35
            });
          }

          if (typeof APU !== 'undefined') {
            APU.sfx('HIT');
            if (typeof APU.softTone === 'function') APU.softTone(987.77, 0.14, 'sine', 0.10, 0, 0.01, 2000);
          }
          break;
        }
      }

      if (hit || b.life <= 0 || b.y < -20) {
        this.bullets.splice(i, 1);
      }
    }

    // ------------------------------------------------------------------------
    // MONSTERS UPDATE & PLAYER INTERACTIONS
    // ------------------------------------------------------------------------
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const m = this.monsters[i];
      if (!m.alive) {
        // Monster spins and plummets off screen
        m.y += 180 * dt;
        if (m.y > 250) this.monsters.splice(i, 1);
        continue;
      }

      // Hover oscillation
      m.baseX += m.vx * dt;
      if (m.baseX < 16) { m.baseX = 16; m.vx = Math.abs(m.vx); }
      else if (m.baseX > 224) { m.baseX = 224; m.vx = -Math.abs(m.vx); }
      m.x = m.baseX;
      m.y = m.baseY + Math.sin(this.gameTime * 3.5) * 6;

      if (m.y > 250) {
        this.monsters.splice(i, 1);
        continue;
      }

      // Interaction with player
      const pFootY = this.py + 7;
      const pHeadY = this.py - 7;
      // Account for screen wrap horizontal distance
      let dx = Math.abs(this.px - (m.x + m.w / 2));
      if (dx > 120) dx = 240 - dx;

      if (dx < 14 && pFootY >= m.y && pHeadY <= m.y + m.h) {
        // Invulnerable powerup blast through monster
        if (this.powerup) {
          m.alive = false;
          this.score += 250;
          for (let k = 0; k < 10; k++) {
            this.particles.push({
              x: m.x + m.w / 2, y: m.y + m.h / 2,
              vx: (Math.random() - 0.5) * 120,
              vy: (Math.random() - 0.5) * 120,
              color: 3, life: 0.35, maxLife: 0.35
            });
          }
          if (typeof APU !== 'undefined') APU.sfx('HIT');
        } else if (this.vy > 0 && pFootY >= m.y - 4 && pFootY <= m.y + 8) {
          // Stomp from above! Bounces player & squashes monster
          m.alive = false;
          this.vy = -280;
          this.squash = 0.45;
          this.score += 150;
          if (typeof APU !== 'undefined') {
            APU.sfx('JUMP');
            APU.sfx('COIN');
          }
          for (let k = 0; k < 6; k++) {
            this.particles.push({
              x: this.px, y: pFootY,
              vx: (Math.random() - 0.5) * 60,
              vy: -30 - Math.random() * 40,
              color: 3, life: 0.25, maxLife: 0.25
            });
          }
        } else {
          // Contact from side or below: Player knockout!
          this.knockedOut = true;
          this.vy = 100;
          if (typeof APU !== 'undefined') APU.sfx('HURT');
        }
      }
    }

    // ------------------------------------------------------------------------
    // PARTICLES & DEBRIS UPDATES
    // ------------------------------------------------------------------------
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.debris.length - 1; i >= 0; i--) {
      const d = this.debris[i];
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vy += 400 * dt;
      if (d.y > 260) this.debris.splice(i, 1);
    }

    // ------------------------------------------------------------------------
    // BOTTOM PIT FALL DETECTION & WHISTLING SOUND
    // ------------------------------------------------------------------------
    if (this.py > 244 && !this.over) {
      this.over = true;
      this.fallDeath = true;
      this.fallTimer = 0;
      this.boomPlayed = false;

      // Whistling pitch drop
      if (typeof APU !== 'undefined' && typeof APU.tone === 'function') {
        APU.tone(660, 0.42, 'sine', 0.16, 75);
      }
      if (typeof SAVE !== 'undefined' && SAVE.setScore) {
        SAVE.setScore(this.id, this.score);
      }
    }
  },

  // --------------------------------------------------------------------------
  // PHYSICS SUB-STEP (continuous collision checking)
  // --------------------------------------------------------------------------
  stepPhysics(dt) {
    if (!this.powerup) {
      this.vy += 560 * dt; // Gravity: apex at ~60px
    }
    const prevPy = this.py;
    this.py += this.vy * dt;

    // Moving platforms horizontal patrol
    for (let pl of this.plats) {
      if (pl.type === 'MOVING' && pl.vx) {
        pl.x += pl.vx * dt;
        if (pl.x < 14) { pl.x = 14; pl.vx = Math.abs(pl.vx); }
        else if (pl.x > 210) { pl.x = 210; pl.vx = -Math.abs(pl.vx); }
      }
    }

    // If ascending or carrying powerup, player passes through platforms
    if (this.vy <= 0 || this.knockedOut) return;

    // Falling downward: check platform landings
    const footPrev = prevPy + 7;
    const footCur = this.py + 7;

    for (let pl of this.plats) {
      if (pl.broken) continue;

      // Vertical footprint sweep
      if (footPrev <= pl.y + 4 && footCur >= pl.y - 3) {
        // Horizontal overlap check with screen wrap handling
        let onPlat = false;
        const pOffsets = [0, 240, -240];
        for (let off of pOffsets) {
          const testPx = this.px + off;
          if (testPx + 6 >= pl.x && testPx - 6 <= pl.x + pl.w) {
            onPlat = true;
            break;
          }
        }

        if (onPlat) {
          // ------------------------------------------------------------------
          // 1. CRACKED PLATFORM: Breaks in two, falls away, NO BOUNCE!
          // ------------------------------------------------------------------
          if (pl.type === 'CRACKED') {
            pl.broken = true;
            this.debris.push({
              x: pl.x, y: pl.y,
              vx: -35, vy: 50,
              type: 'CRACKED_LEFT'
            });
            this.debris.push({
              x: pl.x + 16, y: pl.y,
              vx: 35, vy: 50,
              type: 'CRACKED_RIGHT'
            });
            if (typeof APU !== 'undefined') APU.sfx('HIT');
            break;
          }

          // Landing alignment
          this.py = pl.y - 7;
          this.squash = 0.45;

          // Check item pickups (Propeller Hat or Jetpack)
          if (pl.item) {
            this.powerup = {
              type: pl.item,
              timer: pl.item === 'JETPACK' ? 3.2 : 3.0,
              maxTimer: pl.item === 'JETPACK' ? 3.2 : 3.0
            };
            this.vy = (pl.item === 'JETPACK' ? -350 : -250);
            pl.item = null;
            if (typeof APU !== 'undefined') APU.sfx('POWER');
            break;
          }

          // ------------------------------------------------------------------
          // 2. SPRING PLATFORM: Massive super-jump (apex ~140px, celebratory boing)
          // ------------------------------------------------------------------
          if (pl.type === 'SPRING') {
            pl.springTriggered = true;
            this.vy = -400; // Apex ~142.8px
            if (typeof APU !== 'undefined') {
              APU.sfx('JUMP');
              if (typeof APU.softTone === 'function') {
                APU.softTone(880, 0.25, 'sine', 0.14, 0, 0.01, 2200);
              }
            }
            // Spring sparkles
            for (let k = 0; k < 6; k++) {
              this.particles.push({
                x: pl.x + 16, y: pl.y - 4,
                vx: (Math.random() - 0.5) * 50,
                vy: -50 - Math.random() * 40,
                color: 3, life: 0.25, maxLife: 0.25
              });
            }
            break;
          }

          // ------------------------------------------------------------------
          // 3. TRAMPOLINE: Medium bouncy boost (apex ~97px)
          // ------------------------------------------------------------------
          if (pl.type === 'TRAMPOLINE') {
            pl.trampTriggered = true;
            this.vy = -330; // Apex ~97.2px
            if (typeof APU !== 'undefined') {
              APU.sfx('JUMP');
              if (typeof APU.softTone === 'function') {
                APU.softTone(660, 0.20, 'sine', 0.12, 0, 0.01, 1800);
              }
            }
            break;
          }

          // ------------------------------------------------------------------
          // 4. NORMAL / MOVING: Solid reliable bounce (apex ~60px)
          // ------------------------------------------------------------------
          this.vy = -260; // Apex ~60.35px
          if (typeof APU !== 'undefined') APU.sfx('JUMP');
          break;
        }
      }
    }
  },

  // --------------------------------------------------------------------------
  // RENDERING ENGINE (240x240 CRT Notebook Aesthetic & Phosphor Displays)
  // --------------------------------------------------------------------------
  render(g) {
    // Left & Right Bezels (CRT Frame)
    g.rect(0, 0, 8, 240, 0);
    g.line(7, 0, 7, 240, 1);
    g.rect(248, 0, 8, 240, 0);
    g.line(248, 0, 248, 240, 1);

    // 240x240 Playfield Canvas
    g.rect(8, 0, 240, 240, 0);

    // ------------------------------------------------------------------------
    // NOTEBOOK / GRAPH PAPER BACKGROUND (Faint grid + scrolling altitude ticks)
    // ------------------------------------------------------------------------
    const scrollMod = Math.floor(this.cameraY) % 16;
    for (let y = scrollMod; y < 240; y += 16) {
      g.line(8, y, 248, y, 1);
    }
    for (let x = 8 + 16; x < 248; x += 16) {
      for (let y = 0; y < 240; y += 4) {
        g.px(x, y, 1);
      }
    }

    // Classic notebook margin line (vertical double rule at x=28)
    g.line(28, 0, 28, 240, 2);
    g.line(29, 0, 29, 240, 1);

    // Notebook binder punched holes along left margin (x=16)
    const holeY = Math.floor(this.cameraY * 0.35) % 80;
    for (let y = holeY; y < 240; y += 80) {
      g.disc(16, y, 3, 0);
      g.circle(16, y, 3, 1);
    }

    // Scrolling altitude ticks along the notebook margin
    const altStep = 50;
    const firstAlt = Math.floor((this.cameraY - 120) / altStep) * altStep;
    for (let alt = firstAlt; alt <= firstAlt + 300; alt += altStep) {
      if (alt <= 0) continue;
      const tickY = Math.round(110 + (this.cameraY - alt));
      if (tickY >= 0 && tickY < 240) {
        g.line(25, tickY, 28, tickY, 2);
        if (alt % 100 === 0) {
          g.text(alt + "M", 9, tickY - 2, 1);
        }
      }
    }

    // ------------------------------------------------------------------------
    // PLATFORMS RENDERING
    // ------------------------------------------------------------------------
    for (let pl of this.plats) {
      if (pl.broken) continue;
      const rx = Math.floor(pl.x);
      const ry = Math.floor(pl.y);

      if (pl.type === 'NORMAL') {
        // Solid Green Platform: beveled pill, highlight on top
        g.rect(rx, ry, pl.w, pl.h, 2);
        g.line(rx + 2, ry, rx + pl.w - 3, ry, 3);
        g.box(rx, ry, pl.w, pl.h, 1);
        g.px(rx, ry, 0); g.px(rx + pl.w - 1, ry, 0);
        g.px(rx, ry + pl.h - 1, 0); g.px(rx + pl.w - 1, ry + pl.h - 1, 0);
      } else if (pl.type === 'MOVING') {
        // Moving Blue Platform: double-line border with directional arrows <--->
        g.rect(rx, ry, pl.w, pl.h, 1);
        g.box(rx, ry, pl.w, pl.h, 3);
        g.line(rx + 8, ry + 2, rx + pl.w - 8, ry + 2, 2);
        g.px(rx + 6, ry + 2, 3); g.px(rx + pl.w - 7, ry + 2, 3);
      } else if (pl.type === 'CRACKED') {
        // Cracked Brown Platform: jagged crack down center
        g.rect(rx, ry, pl.w, pl.h, 1);
        g.box(rx, ry, pl.w, pl.h, 2);
        g.line(rx + 15, ry, rx + 17, ry + 2, 0);
        g.line(rx + 17, ry + 2, rx + 14, ry + pl.h - 1, 0);
      } else if (pl.type === 'SPRING') {
        // Platform with coiled spring mounted on top
        g.rect(rx, ry, pl.w, pl.h, 2);
        g.box(rx, ry, pl.w, pl.h, 1);
        const sx = rx + 14;
        if (!pl.springTriggered) {
          // Compact coil
          g.line(sx, ry, sx + 4, ry - 1, 3);
          g.line(sx + 4, ry - 1, sx, ry - 3, 3);
          g.line(sx, ry - 3, sx + 4, ry - 4, 3);
          g.rect(sx - 1, ry - 5, 6, 1, 3);
        } else {
          // Extended spring
          g.line(sx, ry, sx + 4, ry - 3, 3);
          g.line(sx + 4, ry - 3, sx, ry - 6, 3);
          g.line(sx, ry - 6, sx + 4, ry - 9, 3);
          g.rect(sx - 1, ry - 10, 6, 1, 3);
        }
      } else if (pl.type === 'TRAMPOLINE') {
        // Platform with bouncy trampoline bed
        g.rect(rx, ry, pl.w, pl.h, 2);
        g.box(rx, ry, pl.w, pl.h, 1);
        g.rect(rx + 6, ry - 4, 2, 4, 1);
        g.rect(rx + 22, ry - 4, 2, 4, 1);
        if (!pl.trampTriggered) {
          g.line(rx + 7, ry - 3, rx + 23, ry - 3, 3);
        } else {
          g.line(rx + 7, ry - 3, rx + 15, ry - 1, 3);
          g.line(rx + 15, ry - 1, rx + 23, ry - 3, 3);
        }
      }

      // Render Item Pickup on Platform
      if (pl.item === 'PROPELLER') {
        const ix = rx + 12;
        const iy = ry - 8;
        g.rect(ix + 1, iy + 4, 6, 2, 3);
        g.line(ix + 4, iy + 2, ix + 4, iy + 4, 2);
        const spin = Math.floor(this.gameTime * 8) % 2;
        if (spin === 0) g.line(ix, iy + 1, ix + 8, iy + 1, 3);
        else g.line(ix + 2, iy + 1, ix + 6, iy + 1, 3);
      } else if (pl.item === 'JETPACK') {
        const ix = rx + 11;
        const iy = ry - 10;
        g.rect(ix, iy, 4, 8, 1);
        g.box(ix, iy, 4, 8, 3);
        g.rect(ix + 5, iy, 4, 8, 1);
        g.box(ix + 5, iy, 4, 8, 3);
        g.px(ix + 1, iy + 8, 2); g.px(ix + 6, iy + 8, 2);
      }
    }

    // ------------------------------------------------------------------------
    // FALLING DEBRIS & BROKEN PLATFORMS
    // ------------------------------------------------------------------------
    for (let d of this.debris) {
      const dx = Math.floor(d.x);
      const dy = Math.floor(d.y);
      if (d.type === 'CRACKED_LEFT') {
        g.rect(dx, dy, 16, 5, 1);
        g.line(dx, dy, dx + 15, dy, 2);
      } else if (d.type === 'CRACKED_RIGHT') {
        g.rect(dx, dy, 16, 5, 1);
        g.line(dx, dy, dx + 15, dy, 2);
      } else {
        g.rect(dx, dy, 6, 6, 2);
      }
    }

    // ------------------------------------------------------------------------
    // MONSTERS & UFOS
    // ------------------------------------------------------------------------
    for (let m of this.monsters) {
      const mx = Math.floor(m.x);
      const my = Math.floor(m.y);
      if (m.type === 'ALIEN') {
        // Winged Alien Monster
        g.disc(mx + 8, my + 7, 5, 2);
        // Big Cyclops Eye
        g.disc(mx + 8, my + 6, 2, 3);
        g.px(mx + 8, my + 6, 0);
        // Antennae
        g.line(mx + 5, my + 1, mx + 6, my + 3, 3);
        g.line(mx + 11, my + 1, mx + 10, my + 3, 3);
        // Flapping wings
        const wingOff = (Math.sin(this.gameTime * 12) > 0 ? 1 : -1);
        g.line(mx + 1, my + 6 + wingOff, mx + 4, my + 7, 3);
        g.line(mx + 15, my + 6 + wingOff, mx + 12, my + 7, 3);
      } else if (m.type === 'UFO') {
        // Flying Saucer with glowing cockpit and landing beam lights
        g.disc(mx + 8, my + 4, 4, 3);
        g.px(mx + 8, my + 4, 0); // Alien pilot
        g.rect(mx + 1, my + 6, 14, 4, 2);
        g.box(mx + 1, my + 6, 14, 4, 3);
        const lPulse = Math.floor(this.gameTime * 6) % 3;
        g.px(mx + 3, my + 10, lPulse === 0 ? 3 : 1);
        g.px(mx + 8, my + 10, lPulse === 1 ? 3 : 1);
        g.px(mx + 13, my + 10, lPulse === 2 ? 3 : 1);
      }
    }

    // ------------------------------------------------------------------------
    // NOSE PELLETS / BULLETS
    // ------------------------------------------------------------------------
    for (let b of this.bullets) {
      const bx = Math.floor(b.x);
      const by = Math.floor(b.y);
      g.disc(bx, by, 2, 3);
      g.px(bx, by + 3, 2);
    }

    // ------------------------------------------------------------------------
    // PARTICLES (Sparkles, rocket flame smoke, jump bursts)
    // ------------------------------------------------------------------------
    for (let p of this.particles) {
      g.px(Math.floor(p.x), Math.floor(p.y), p.color);
    }

    // ------------------------------------------------------------------------
    // DOODLER SPRITE (with smooth wrap rendering & squash/stretch physics)
    // ------------------------------------------------------------------------
    this.renderDoodler(g, this.px, this.py);
    // Smooth wrap ghost copies when overlapping left/right boundaries
    if (this.px < 8 + 16) {
      this.renderDoodler(g, this.px + 240, this.py);
    } else if (this.px > 248 - 16) {
      this.renderDoodler(g, this.px - 240, this.py);
    }

    // ------------------------------------------------------------------------
    // SCORE HUD & ACTIVE POWERUP METER
    // ------------------------------------------------------------------------
    // Clean upper HUD backing bar
    g.rect(8, 0, 240, 14, 0);
    g.line(8, 14, 248, 14, 1);
    g.text("HEIGHT: " + this.score + " M", 14, 4, 3);
    g.textR("BEST: " + this.bestScore + " M", 244, 4, 2);

    // Active Power-up Fuel Gauge
    if (this.powerup) {
      const pct = Math.max(0, this.powerup.timer / this.powerup.maxTimer);
      const barW = 60;
      const fillW = Math.floor(barW * pct);
      const bx = 98;
      g.rect(bx - 2, 16, barW + 4, 9, 0);
      g.box(bx - 2, 16, barW + 4, 9, 2);
      g.rect(bx, 18, fillW, 5, 3);
      g.text(this.powerup.type === 'JETPACK' ? "JETPACK" : "PROPELLER", bx + 6, 17, 0);
    }

    // ------------------------------------------------------------------------
    // TOUCH / STEERING GUIDANCE (Fades out after start)
    // ------------------------------------------------------------------------
    if (this.hintTimer > 0 && !this.over) {
      const c = Math.floor(this.gameTime * 4) % 2 === 0 ? 2 : 1;
      g.textC("[TAP TOP TO SHOOT]", 32, c);
      g.textC("< STEER LEFT / RIGHT >", 222, c);
    }

    // ------------------------------------------------------------------------
    // GAME OVER MODAL DIALOG
    // ------------------------------------------------------------------------
    if (this.over) {
      g.rect(38, 68, 180, 104, 0);
      g.box(38, 68, 180, 104, 3);
      g.box(40, 70, 176, 100, 1);

      g.textC("GAME OVER", 78, 3, 2);
      g.textC("HEIGHT: " + this.score + " M", 98, 3);
      g.textC("BEST:   " + this.bestScore + " M", 112, 2);

      if (this.newRecord) {
        g.textC("★ NEW BEST RECORD! ★", 126, 3);
      }

      const blink = Math.floor(this.gameTime * 3) % 2 === 0;
      g.textC("PRESS [A] OR TAP TO RETRY", 150, blink ? 3 : 2);
    }
  },

  // --------------------------------------------------------------------------
  // DOODLER PIXEL-ART CHARACTER RENDERING
  // --------------------------------------------------------------------------
  renderDoodler(g, cx, cy) {
    cx = Math.floor(cx);
    cy = Math.floor(cy);
    const f = this.facing;

    // Squash & Stretch dimensional modifications
    const scaleX = 1 + this.squash * 0.45 - this.stretch * 0.25;
    const scaleY = 1 - this.squash * 0.35 + this.stretch * 0.35;
    const rw = Math.max(5, Math.round(6 * scaleX));
    const rh = Math.max(5, Math.round(6 * scaleY));

    // 1. Doodler Body (Green dome + belly)
    g.disc(cx, cy - 2, rw, 2);
    g.rect(cx - rw, cy - 2, rw * 2 + 1, rh, 2);
    g.box(cx - rw, cy - 2, rw * 2 + 1, rh, 1);
    // Highlight on crown/back
    g.px(cx - f * 2, cy - rh - 1, 3);
    g.px(cx - f * 3, cy - rh, 3);

    // 2. Tube Snout (faces steering direction; kicks up on nose pellet shot)
    const snoutRecoilY = (this.shootRecoil > 0 ? -2 : 0);
    const snoutX = f > 0 ? cx + rw - 1 : cx - rw - 4;
    const snoutY = cy - 3 + snoutRecoilY;
    g.rect(snoutX, snoutY, 5, 3, 2);
    g.box(snoutX, snoutY, 5, 3, 3);
    g.px(f > 0 ? snoutX + 4 : snoutX, snoutY + 1, 0); // Snout hole

    // 3. Cartoon Eyes (Big white sclera + dark pupils peering forward)
    if (!this.knockedOut) {
      const eye1X = cx + f * 1;
      const eye2X = cx + f * 4;
      g.rect(eye1X, cy - 6, 3, 3, 3);
      g.px(eye1X + (f > 0 ? 1 : 0), cy - 5, 0);
      g.rect(eye2X, cy - 6, 3, 3, 3);
      g.px(eye2X + (f > 0 ? 1 : 0), cy - 5, 0);
    } else {
      // Knocked out dizzy 'X' eyes
      g.line(cx + f * 1, cy - 6, cx + f * 3, cy - 4, 3);
      g.line(cx + f * 1, cy - 4, cx + f * 3, cy - 6, 3);
      g.line(cx + f * 4, cy - 6, cx + f * 6, cy - 4, 3);
      g.line(cx + f * 4, cy - 4, cx + f * 6, cy - 6, 3);
    }

    // 4. Four Little Legs (Bend outward on squash, dangle down on stretch)
    const footY = cy + rh + 1;
    const legSpread = Math.round(this.squash * 3);
    g.line(cx - 5 * f - legSpread, cy + rh - 1, cx - 6 * f - legSpread, footY, 2);
    g.line(cx - 2 * f, cy + rh - 1, cx - 2 * f, footY + 1, 3);
    g.line(cx + 1 * f, cy + rh - 1, cx + 1 * f, footY + 1, 2);
    g.line(cx + 4 * f + legSpread, cy + rh - 1, cx + 5 * f + legSpread, footY, 3);

    // 5. Active Power-up Accessory Overlays
    if (this.powerup && this.powerup.type === 'PROPELLER') {
      // Propeller Hat on head
      g.rect(cx - 3, cy - rh - 3, 7, 2, 3);
      g.line(cx, cy - rh - 5, cx, cy - rh - 3, 2);
      const bladeW = (Math.floor(this.gameTime * 28) % 2 === 0 ? 7 : 3);
      g.line(cx - bladeW, cy - rh - 5, cx + bladeW, cy - rh - 5, 3);
    } else if (this.powerup && this.powerup.type === 'JETPACK') {
      // Twin Rocket Jetpack strapped to back
      const jpX = f > 0 ? cx - rw - 3 : cx + rw - 1;
      g.rect(jpX, cy - 5, 4, 10, 1);
      g.box(jpX, cy - 5, 4, 10, 3);
      g.rect(jpX + 1, cy + 5, 2, 2, 2);
      // Pulsing flame thrust
      const fLen = 4 + (Math.sin(this.gameTime * 35) > 0 ? 3 : 0);
      g.tri(jpX, cy + 7, jpX + 4, cy + 7, jpX + 2, cy + 7 + fLen, 3);
    }
  },

  // --------------------------------------------------------------------------
  // PERSISTENCE (save & load)
  // --------------------------------------------------------------------------
  save() {
    return { best: this.bestScore };
  },

  load(data) {
    if (data && typeof data.best === 'number') {
      this.bestScore = Math.max(this.bestScore || 0, data.best);
    }
  }
};
