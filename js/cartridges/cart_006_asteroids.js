// js/cartridges/cart_006_asteroids.js
// ============================================================================
// Cartridge #006: ASTEROIDS
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 6. ASTEROIDS
CARTS[6] = {
  id: 6,
  name: "ASTEROIDS",
  genre: 0,
  scoreLabel: "PTS",
  desc: "PILOT SHIP WITH ROTATION & THRUST. BLAST ASTEROIDS INTO SMALL FRAGMENTS!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Vector-style ship on icon
    g.line(x + 16, y + 8, x + 10, y + 24, 3);
    g.line(x + 16, y + 8, x + 22, y + 24, 3);
    g.line(x + 10, y + 24, x + 16, y + 20, 3);
    g.line(x + 22, y + 24, x + 16, y + 20, 3);
    // Craggy rocks on icon
    g.line(x + 6, y + 7, x + 11, y + 5, 2);
    g.line(x + 11, y + 5, x + 13, y + 9, 2);
    g.line(x + 13, y + 9, x + 9, y + 13, 2);
    g.line(x + 9, y + 13, x + 5, y + 10, 2);
    g.line(x + 5, y + 10, x + 6, y + 7, 2);

    g.line(x + 23, y + 12, x + 27, y + 10, 2);
    g.line(x + 27, y + 10, x + 29, y + 15, 2);
    g.line(x + 29, y + 15, x + 25, y + 18, 2);
    g.line(x + 25, y + 18, x + 21, y + 15, 2);
    g.line(x + 21, y + 15, x + 23, y + 12, 2);
  },

  init() {
    this.ship = { x: 128, y: 120, angle: -Math.PI / 2, vx: 0, vy: 0 };
    this.bullets = [];
    this.rocks = [];
    this.particles = [];
    this.lives = 3;
    this.respawning = false;
    this.respawnTimer = 0;
    this.invulnTimer = 2.5; // Invulnerable at start
    this.wave = 1;
    this.score = 0;
    this.highScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;
    this.over = false;
    this.thrusting = false;
    this.flameLen = 5;
    this.flameSpine = false;
    this.thrustSoundTimer = 0;
    this.hyperspaceCooldown = 0;
    this.touchFireTimer = 0;
    this.touchThrustTimer = 0;
    this.lastPointerX = null;
    this.prevTouchHyperspace = false;

    this.spawnRocks();
  },

  createRock(x, y, vx, vy, size) {
    const r = size === 3 ? 16 : (size === 2 ? 10 : 6);
    const numVerts = 8 + Math.floor(Math.random() * 3); // 8-10 vertices
    const verts = [];
    for (let k = 0; k < numVerts; k++) {
      const ang = (k / numVerts) * Math.PI * 2 + (Math.random() - 0.5) * 0.12;
      const rad = r * (0.72 + Math.random() * 0.48);
      verts.push({ a: ang, r: rad });
    }
    const maxRot = size === 3 ? 1.2 : (size === 2 ? 2.2 : 3.2);
    return {
      x, y, vx, vy,
      r, size,
      verts,
      rot: Math.random() * Math.PI * 2,
      rotSpd: (Math.random() - 0.5) * 2 * maxRot
    };
  },

  spawnRocks() {
    const count = 3 + Math.min(this.wave, 8);
    for (let i = 0; i < count; i++) {
      let rx, ry;
      let attempts = 0;
      const targetX = this.ship ? this.ship.x : 128;
      const targetY = this.ship ? this.ship.y : 120;
      do {
        rx = Math.random() * 256;
        ry = Math.random() * 240;
        attempts++;
      } while (Math.hypot(rx - targetX, ry - targetY) < 65 && attempts < 100);

      const spd = 25 + Math.min(this.wave, 8) * 6;
      const angle = Math.random() * Math.PI * 2;
      this.rocks.push(this.createRock(
        rx, ry,
        Math.cos(angle) * spd,
        Math.sin(angle) * spd,
        3 // Large asteroid
      ));
    }
  },

  spawnExplosion(x, y, count = 12, color = 3, maxSpeed = 80) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 15 + Math.random() * maxSpeed;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.2 + Math.random() * 0.4,
        maxLife: 0.6,
        c: Math.random() < 0.6 ? color : 2
      });
    }
  },

  spawnWarpRing(cx, cy) {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      const spd = 40 + Math.random() * 30;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.18 + Math.random() * 0.12,
        maxLife: 0.3,
        c: 3
      });
    }
  },

  fireBullet() {
    if (this.over || this.respawning) return;
    if (this.bullets.length >= 4) return; // Classic Asteroids max 4 simultaneous bullets
    const bx = this.ship.x + Math.cos(this.ship.angle) * 9;
    const by = this.ship.y + Math.sin(this.ship.angle) * 9;
    this.bullets.push({
      x: bx,
      y: by,
      vx: Math.cos(this.ship.angle) * 230 + this.ship.vx * 0.25,
      vy: Math.sin(this.ship.angle) * 230 + this.ship.vy * 0.25,
      life: 1.15
    });
    APU.sfx('TICK');
    PAD.vibrate(8);
  },

  triggerHyperspace() {
    if (this.over || this.respawning || this.hyperspaceCooldown > 0) return;
    this.hyperspaceCooldown = 0.8;

    // Departure warp ring
    this.spawnWarpRing(this.ship.x, this.ship.y);

    // Warp SFX & haptics
    APU.tone(180, 0.22, 'triangle', 0.16, 950);
    APU.noise(0.08, 0.12, 1200, 'bandpass');
    PAD.vibrate(25);

    // Random location
    this.ship.x = Math.random() * 224 + 16;
    this.ship.y = Math.random() * 200 + 20;

    // Damp velocity
    this.ship.vx *= 0.15;
    this.ship.vy *= 0.15;

    // Arrival warp ring
    this.spawnWarpRing(this.ship.x, this.ship.y);

    // Classic Asteroids danger: Check if new position is immediately inside an asteroid!
    for (let r of this.rocks) {
      if (Math.hypot(this.ship.x - r.x, this.ship.y - r.y) < r.r + 4) {
        this.spawnExplosion(this.ship.x, this.ship.y, 28, 3, 120);
        APU.sfx('BOOM');
        this.lives--;
        if (this.lives <= 0) {
          this.over = true;
          if (typeof SAVE !== 'undefined' && SAVE.setScore) {
            SAVE.setScore(this.id, this.score);
          }
        } else {
          this.respawning = true;
          this.respawnTimer = 0.8;
        }
        return;
      }
    }
  },

  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start') || PAD.hit('b') || PAD.tapPos || (PAD.pointer && PAD.pointer.down)) {
        this.init();
      }
      return;
    }

    // Cooldown timers
    if (this.hyperspaceCooldown > 0) this.hyperspaceCooldown -= dt;
    if (this.touchThrustTimer > 0) this.touchThrustTimer -= dt;
    if (this.touchFireTimer > 0) this.touchFireTimer -= dt;
    if (this.invulnTimer > 0) this.invulnTimer -= dt;

    // Handle ship respawn state
    if (this.respawning) {
      if (this.respawnTimer > 0) {
        this.respawnTimer -= dt;
      } else {
        // Safe center spawn check: wait if rocks are within 50px of center
        let safe = true;
        for (let i = 0; i < this.rocks.length; i++) {
          const rock = this.rocks[i];
          if (Math.hypot(rock.x - 128, rock.y - 120) < 50 + rock.r) {
            safe = false;
            break;
          }
        }
        if (safe) {
          this.ship.x = 128;
          this.ship.y = 120;
          this.ship.vx = 0;
          this.ship.vy = 0;
          this.ship.angle = -Math.PI / 2;
          this.invulnTimer = 2.5; // 2.5s respawn invulnerability blink
          this.respawning = false;
          APU.sfx('UI_OK');
        }
      }
    }

    // Mobile touch & gestures
    if (PAD.swipe === 'up') {
      this.touchThrustTimer = 0.45;
    } else if (PAD.swipe === 'left') {
      this.ship.angle -= 0.6;
    } else if (PAD.swipe === 'right') {
      this.ship.angle += 0.6;
    }

    if (PAD.tapPos) {
      if (PAD.tapPos.y >= 180) {
        if (PAD.tapPos.x <= 75) {
          this.triggerHyperspace();
        } else {
          this.fireBullet();
        }
      } else {
        if (PAD.tapPos.x < 85) this.ship.angle -= 0.45;
        else if (PAD.tapPos.x > 171) this.ship.angle += 0.45;
        else this.touchThrustTimer = 0.35;
      }
    }

    let pointerThrust = false;
    if (PAD.pointer && PAD.pointer.down) {
      if (PAD.pointer.y >= 180) {
        if (PAD.pointer.x <= 75) {
          if (!this.prevTouchHyperspace) {
            this.triggerHyperspace();
          }
          this.prevTouchHyperspace = true;
        } else {
          if (this.touchFireTimer <= 0) {
            this.fireBullet();
            this.touchFireTimer = 0.18;
          }
        }
      } else {
        pointerThrust = true;
        if (this.lastPointerX !== null) {
          const dx = PAD.pointer.x - this.lastPointerX;
          if (Math.abs(dx) > 1.0) {
            this.ship.angle += dx * 0.04;
          }
        }
        if (PAD.pointer.x < 80) {
          this.ship.angle -= 3.5 * dt;
        } else if (PAD.pointer.x > 176) {
          this.ship.angle += 3.5 * dt;
        }
        this.lastPointerX = PAD.pointer.x;
      }
    } else {
      this.lastPointerX = null;
      this.prevTouchHyperspace = false;
    }

    // Physical gamepad / keyboard controls
    if (!this.respawning) {
      if (PAD.state.left) this.ship.angle -= 3.5 * dt;
      if (PAD.state.right) this.ship.angle += 3.5 * dt;

      const thrustActive = PAD.state.up || pointerThrust || (this.touchThrustTimer > 0);
      this.thrusting = thrustActive;
      this.flameLen = 4 + Math.random() * 5;
      this.flameSpine = Math.random() < 0.5;

      if (thrustActive) {
        this.ship.vx += Math.cos(this.ship.angle) * 125 * dt;
        this.ship.vy += Math.sin(this.ship.angle) * 125 * dt;

        this.thrustSoundTimer -= dt;
        if (this.thrustSoundTimer <= 0) {
          APU.sfx('SWISH');
          this.thrustSoundTimer = 0.16;
        }

        // Thruster dust particle
        if (Math.random() < 0.75) {
          const rearAng = this.ship.angle + Math.PI + (Math.random() - 0.5) * 0.5;
          const dustSpd = 35 + Math.random() * 45;
          this.particles.push({
            x: this.ship.x + Math.cos(this.ship.angle + Math.PI) * 7,
            y: this.ship.y + Math.sin(this.ship.angle + Math.PI) * 7,
            vx: Math.cos(rearAng) * dustSpd + this.ship.vx * 0.25,
            vy: Math.sin(rearAng) * dustSpd + this.ship.vy * 0.25,
            life: 0.14 + Math.random() * 0.14,
            maxLife: 0.28,
            c: Math.random() < 0.5 ? 3 : 2
          });
        }
      }

      // Hyperspace trigger [B]
      if (PAD.hit('b')) {
        this.triggerHyperspace();
      }

      // Bullet fire [A]
      if (PAD.hit('a')) {
        this.fireBullet();
      }

      // Velocity clamping & frame-rate independent exponential damping
      const spd = Math.hypot(this.ship.vx, this.ship.vy);
      if (spd > 160) {
        this.ship.vx = (this.ship.vx / spd) * 160;
        this.ship.vy = (this.ship.vy / spd) * 160;
      }
      const damping = Math.pow(0.985, dt * 60);
      this.ship.vx *= damping;
      this.ship.vy *= damping;

      // Smooth toroidal screen wrapping
      this.ship.x = ((this.ship.x + this.ship.vx * dt) % 256 + 256) % 256;
      this.ship.y = ((this.ship.y + this.ship.vy * dt) % 240 + 240) % 240;
    } else {
      this.thrusting = false;
    }

    // Bullets update
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x = ((b.x + b.vx * dt) % 256 + 256) % 256;
      b.y = ((b.y + b.vy * dt) % 240 + 240) % 240;
      b.life -= dt;
      if (b.life <= 0) this.bullets.splice(i, 1);
    }

    // Particles update
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x = ((p.x + p.vx * dt) % 256 + 256) % 256;
      p.y = ((p.y + p.vy * dt) % 240 + 240) % 240;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Next wave check
    if (this.rocks.length === 0) {
      this.wave++;
      this.score += 100 * this.wave;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        if (typeof SAVE !== 'undefined' && SAVE.setScore) {
          SAVE.setScore(this.id, this.score);
        }
      }
      APU.sfx('LEVELUP');
      this.spawnRocks();
      return;
    }

    // Rocks update, angular rotation & collisions
    for (let i = this.rocks.length - 1; i >= 0; i--) {
      const r = this.rocks[i];
      r.x = ((r.x + r.vx * dt) % 256 + 256) % 256;
      r.y = ((r.y + r.vy * dt) % 240 + 240) % 240;
      r.rot = (r.rot + r.rotSpd * dt) % (Math.PI * 2);

      // Ship collision (only if alive and not invulnerable)
      if (!this.respawning && this.invulnTimer <= 0) {
        const sDist = Math.hypot(this.ship.x - r.x, this.ship.y - r.y);
        if (sDist < r.r + 5) {
          this.spawnExplosion(this.ship.x, this.ship.y, 28, 3, 120);
          APU.sfx('BOOM');
          PAD.vibrate(50);
          this.lives--;
          if (this.lives <= 0) {
            this.over = true;
            if (typeof SAVE !== 'undefined' && SAVE.setScore) {
              SAVE.setScore(this.id, this.score);
            }
            return;
          } else {
            this.respawning = true;
            this.respawnTimer = 0.8;
            return;
          }
        }
      }

      // Bullet collision
      let rockHit = false;
      for (let j = this.bullets.length - 1; j >= 0; j--) {
        const b = this.bullets[j];
        if (Math.hypot(b.x - r.x, b.y - r.y) < r.r + 3) {
          this.bullets.splice(j, 1);
          rockHit = true;
          break;
        }
      }

      if (rockHit) {
        // Points by rock size
        const pts = r.size === 3 ? 20 : (r.size === 2 ? 50 : 100);
        this.score += pts;
        if (this.score > this.highScore) {
          this.highScore = this.score;
          if (typeof SAVE !== 'undefined' && SAVE.setScore) {
            SAVE.setScore(this.id, this.score);
          }
        }
        APU.sfx('HIT');

        // Particle explosion based on size
        const pCount = r.size === 3 ? 16 : (r.size === 2 ? 10 : 6);
        const pSpd = r.size === 3 ? 65 : (r.size === 2 ? 85 : 105);
        this.spawnExplosion(r.x, r.y, pCount, 3, pSpd);

        // Splitting logic: Destroy parent rock and spawn 2 smaller child asteroids
        this.rocks.splice(i, 1);
        if (r.size > 1) {
          const nextSize = r.size - 1;
          const parentSpeed = Math.hypot(r.vx, r.vy);
          const baseAngle = Math.atan2(r.vy, r.vx) || (Math.random() * Math.PI * 2);
          const childSpeed = parentSpeed * 1.35 + 15 + Math.random() * 15;

          const ang1 = baseAngle + 0.5 + Math.random() * 0.35;
          const ang2 = baseAngle - 0.5 - Math.random() * 0.35;

          this.rocks.push(this.createRock(
            r.x, r.y,
            Math.cos(ang1) * childSpeed,
            Math.sin(ang1) * childSpeed,
            nextSize
          ));
          this.rocks.push(this.createRock(
            r.x, r.y,
            Math.cos(ang2) * childSpeed,
            Math.sin(ang2) * childSpeed,
            nextSize
          ));
        }
      }
    }
  },

  drawRock(g, r) {
    const n = r.verts.length;
    const oxs = [0];
    if (r.x - r.r < 0) oxs.push(256);
    else if (r.x + r.r >= 256) oxs.push(-256);

    const oys = [0];
    if (r.y - r.r < 0) oys.push(240);
    else if (r.y + r.r >= 240) oys.push(-240);

    for (let ox of oxs) {
      for (let oy of oys) {
        const cx = r.x + ox;
        const cy = r.y + oy;
        for (let k = 0; k < n; k++) {
          const v1 = r.verts[k];
          const v2 = r.verts[(k + 1) % n];
          const a1 = v1.a + r.rot;
          const a2 = v2.a + r.rot;
          const x1 = cx + Math.cos(a1) * v1.r;
          const y1 = cy + Math.sin(a1) * v1.r;
          const x2 = cx + Math.cos(a2) * v2.r;
          const y2 = cy + Math.sin(a2) * v2.r;
          g.line(x1, y1, x2, y2, 2);
        }
      }
    }
  },

  drawShip(g, s) {
    const oxs = [0];
    if (s.x < 12) oxs.push(256);
    else if (s.x > 244) oxs.push(-256);

    const oys = [0];
    if (s.y < 12) oys.push(240);
    else if (s.y > 228) oys.push(-240);

    for (let ox of oxs) {
      for (let oy of oys) {
        const sx = s.x + ox;
        const sy = s.y + oy;

        const x0 = sx + Math.cos(s.angle) * 8;
        const y0 = sy + Math.sin(s.angle) * 8;
        const x1 = sx + Math.cos(s.angle + 2.4) * 7;
        const y1 = sy + Math.sin(s.angle + 2.4) * 7;
        const x2 = sx + Math.cos(s.angle - 2.4) * 7;
        const y2 = sy + Math.sin(s.angle - 2.4) * 7;
        const xr = sx + Math.cos(s.angle + Math.PI) * 2;
        const yr = sy + Math.sin(s.angle + Math.PI) * 2;

        g.line(x0, y0, x1, y1, 3);
        g.line(x0, y0, x2, y2, 3);
        g.line(x1, y1, xr, yr, 3);
        g.line(x2, y2, xr, yr, 3);

        // Thrust flame
        if (this.thrusting) {
          const fx1 = sx + Math.cos(s.angle + 2.45) * 4.5;
          const fy1 = sy + Math.sin(s.angle + 2.45) * 4.5;
          const fx2 = sx + Math.cos(s.angle - 2.45) * 4.5;
          const fy2 = sy + Math.sin(s.angle - 2.45) * 4.5;
          const ftx = sx + Math.cos(s.angle + Math.PI) * (3 + this.flameLen);
          const fty = sy + Math.sin(s.angle + Math.PI) * (3 + this.flameLen);
          g.line(fx1, fy1, ftx, fty, 3);
          g.line(fx2, fy2, ftx, fty, 3);
          if (this.flameSpine) {
            g.line(xr, yr, ftx, fty, 2);
          }
        }
      }
    }
  },

  render(g) {
    g.clear(0);

    // Rocks
    for (let r of this.rocks) {
      this.drawRock(g, r);
    }

    // Bullets
    for (let b of this.bullets) {
      g.disc(Math.floor(b.x), Math.floor(b.y), 1, 3);
    }

    // Particles
    for (let p of this.particles) {
      const col = (p.life / p.maxLife > 0.35) ? p.c : 1;
      g.px(Math.floor(p.x), Math.floor(p.y), col);
    }

    // Ship (hidden if respawning, blinking if invulnerable)
    if (!this.respawning && !this.over) {
      if (this.invulnTimer <= 0 || Math.floor(this.invulnTimer * 12) % 2 === 0) {
        this.drawShip(g, this.ship);
      }
    }

    // HUD: Score & High Score
    g.text("SCORE: " + this.score, 12, 8, 3);
    g.textR("HI: " + this.highScore, 244, 8, 2);

    // HUD: Mini-ship lives
    for (let i = 0; i < this.lives; i++) {
      const lx = 12 + i * 11;
      const ly = 18;
      g.line(lx + 3, ly, lx, ly + 6, 2);
      g.line(lx + 3, ly, lx + 6, ly + 6, 2);
      g.line(lx + 1, ly + 5, lx + 5, ly + 5, 2);
    }

    // HUD: Wave number
    g.textR("WAVE " + this.wave, 244, 18, 2);

    // On-screen touch hints (dim phosphor)
    if (!this.over) {
      g.box(8, 222, 54, 14, 1);
      g.text("HYPER", 18, 226, 2);

      g.box(194, 222, 54, 14, 1);
      g.text("FIRE", 210, 226, 2);
    }

    // Game Over Overlay
    if (this.over) {
      g.dither(52, 78, 152, 84, 0, 1);
      g.box(52, 78, 152, 84, 3);
      g.textC("GAME OVER", 90, 3);
      g.textC("SCORE: " + this.score, 106, 3);
      g.textC("BEST:  " + this.highScore, 120, 2);
      g.textC("[A] TO PLAY AGAIN", 140, 2);
    }
  },

  save() {
    return { hi: this.highScore };
  },

  load(data) {
    if (data && typeof data.hi === 'number') {
      this.highScore = Math.max(this.highScore || 0, data.hi);
    }
  }
};
