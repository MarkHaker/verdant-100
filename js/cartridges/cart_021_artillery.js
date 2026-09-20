// js/cartridges/cart_021_artillery.js
// ============================================================================
// Cartridge #021: ARTILLERY
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 21. ARTILLERY
CARTS[21] = {
  id: 21,
  name: "ARTILLERY",
  genre: 2,
  scoreLabel: "WINS",
  desc: "AIM CANNON ANGLE & POWER TO SHELL ENEMY TANK OVER MOUNTAINS. DRAG TO AIM, [FIRE] OR [A] TO SHOOT.",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Mountain silhouette
    g.tri(x + 4, y + 28, x + 16, y + 10, x + 28, y + 28, 1);
    g.line(x + 4, y + 28, x + 16, y + 10, 2);
    g.line(x + 16, y + 10, x + 28, y + 28, 2);
    // Player tank on left hill
    g.rect(x + 4, y + 23, 7, 3, 2);
    g.rect(x + 5, y + 21, 4, 2, 3);
    g.line(x + 7, y + 21, x + 12, y + 16, 3);
    // Dotted mortar arc
    g.px(x + 14, y + 13, 3);
    g.px(x + 17, y + 11, 3);
    g.px(x + 20, y + 12, 3);
    // Blast on right hill
    g.disc(x + 23, y + 18, 2, 3);
    g.px(x + 24, y + 15, 2);
  },

  init() {
    this.highScore = (typeof SAVE !== 'undefined' ? SAVE.getScore(this.id) : 0) || 0;
    this.score = 0;
    this.round = 1;
    this.gravity = 130;
    this.angle = 50;
    this.power = 65;
    this.enemyAngle = 130;
    this.enemyPower = 60;
    this.turn = 'PLAYER'; // 'PLAYER', 'PLAYER_SHOT', 'ENEMY_AIM', 'ENEMY_SHOT', 'OVER'
    this.shot = null;
    this.enemyShot = null;
    this.won = false;
    this.over = false;

    // AI Tracking memory
    this.aiHistory = [];
    this.aiTimer = 0;
    this.aiTargetAngle = 130;
    this.aiTargetPower = 60;

    // Visual FX
    this.trail = [];
    this.particles = [];
    this.blasts = [];
    this.damageTexts = [];
    this.shake = 0;
    this.tick = 0;

    // Mobile touch interaction state
    this.isAimDragging = false;
    this.lastFireDown = false;

    // Initial wind and terrain setup
    this.wind = (Math.random() - 0.5) * 44;
    this.generateTerrain();
    this.resetRound(false);
  },

  resetRound(nextRound = false) {
    if (nextRound) {
      this.round++;
    } else {
      this.score = 0;
      this.round = 1;
    }
    this.won = false;
    this.over = false;
    this.playerHp = 100;
    this.enemyHp = 100;
    this.turn = 'PLAYER';
    this.shot = null;
    this.enemyShot = null;
    this.aiHistory = [];
    this.aiTimer = 0;
    this.trail = [];
    this.particles = [];
    this.blasts = [];
    this.damageTexts = [];
    this.shake = 0;
    this.wind = (Math.random() - 0.5) * 46;
    this.generateTerrain();
  },

  generateTerrain() {
    this.terrain = new Float32Array(256);
    const baseGroundY = 194;
    const peak1X = 85 + Math.random() * 35; // 85..120
    const peak1H = 65 + Math.random() * 40; // 65..105 px
    const peak2X = 140 + Math.random() * 35; // 140..175
    const peak2H = 60 + Math.random() * 45; // 60..105 px

    // Position tanks on opposite sides of mountain range
    this.px = 32 + Math.floor(Math.random() * 14); // 32..46
    this.tx = 210 + Math.floor(Math.random() * 16); // 210..226

    for (let x = 0; x < 256; x++) {
      let y = baseGroundY - Math.sin(x * 0.035) * 6 - Math.cos(x * 0.02) * 4;
      // Mountain peak 1 (Gaussian curve)
      const d1 = (x - peak1X) / 36;
      y -= peak1H * Math.exp(-d1 * d1);
      // Mountain peak 2
      const d2 = (x - peak2X) / 34;
      y -= peak2H * Math.exp(-d2 * d2);
      // Subtle crags
      y -= Math.sin(x * 0.22) * 3 + Math.cos(x * 0.5) * 1.5;
      this.terrain[x] = Math.max(68, Math.min(212, y));
    }

    // Level flat firing plateaus for tanks
    const pY = this.terrain[this.px];
    for (let x = this.px - 9; x <= this.px + 9; x++) {
      if (x >= 0 && x < 256) this.terrain[x] = pY;
    }
    // Plateau blending
    for (let i = 1; i <= 6; i++) {
      const xL = this.px - 9 - i, xR = this.px + 9 + i;
      const t = i / 7;
      if (xL >= 0) this.terrain[xL] = pY * (1 - t) + this.terrain[xL] * t;
      if (xR < 256) this.terrain[xR] = pY * (1 - t) + this.terrain[xR] * t;
    }

    const tY = this.terrain[this.tx];
    for (let x = this.tx - 9; x <= this.tx + 9; x++) {
      if (x >= 0 && x < 256) this.terrain[x] = tY;
    }
    for (let i = 1; i <= 6; i++) {
      const xL = this.tx - 9 - i, xR = this.tx + 9 + i;
      const t = i / 7;
      if (xL >= 0) this.terrain[xL] = tY * (1 - t) + this.terrain[xL] * t;
      if (xR < 256) this.terrain[xR] = tY * (1 - t) + this.terrain[xR] * t;
    }

    this.py = this.terrain[this.px];
    this.ty = this.terrain[this.tx];
  },

  carveCrater(cx, cy, r) {
    const x0 = Math.max(0, Math.floor(cx - r));
    const x1 = Math.min(255, Math.ceil(cx + r));
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx;
      const dy2 = r * r - dx * dx;
      if (dy2 >= 0) {
        const dy = Math.sqrt(dy2);
        const craterFloor = cy + dy;
        if (this.terrain[x] < craterFloor) {
          this.terrain[x] = Math.min(212, Math.max(this.terrain[x], craterFloor));
        }
      }
    }
    // Settle tanks down if earth excavated below them
    this.py = this.terrain[Math.round(this.px)];
    this.ty = this.terrain[Math.round(this.tx)];
  },

  spawnExplosion(ix, iy, r, isTankHit) {
    this.shake = isTankHit ? 7 : 4;
    // Blast shockwave
    this.blasts.push({
      x: ix, y: iy, r: 2, maxR: r + 4, life: 0.35, maxLife: 0.35
    });

    // Dirt debris particles
    const count = isTankHit ? 28 : 16;
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 25 + Math.random() * 80;
      this.particles.push({
        x: ix + Math.cos(ang) * (r * 0.3),
        y: iy + Math.sin(ang) * (r * 0.3),
        vx: Math.cos(ang) * spd + (this.wind * 0.25),
        vy: Math.sin(ang) * spd - 35,
        life: 0.5 + Math.random() * 0.6,
        maxLife: 1.0,
        color: Math.random() < 0.65 ? 3 : 2,
        isDebris: true
      });
    }
  },

  shiftWind() {
    this.wind += (Math.random() - 0.5) * 14;
    this.wind = Math.max(-46, Math.min(46, this.wind));
  },

  firePlayer() {
    if (this.turn !== 'PLAYER' || this.shot || this.won || this.over) return;
    const rad = (this.angle * Math.PI) / 180;
    const spd = this.power * 2.2;
    this.shot = {
      x: this.px + Math.cos(rad) * 12,
      y: (this.py - 6) - Math.sin(rad) * 12,
      vx: Math.cos(rad) * spd,
      vy: -Math.sin(rad) * spd
    };
    this.turn = 'PLAYER_SHOT';
    APU.sfx('BOOM');
  },

  prepareAiTurn() {
    this.turn = 'ENEMY_AIM';
    this.aiTimer = 0.85;

    const dist = this.tx - this.px;
    const g = this.gravity;

    if (this.aiHistory.length > 0) {
      // Dialing-in based on previous shot miss
      const last = this.aiHistory[this.aiHistory.length - 1];
      const missDist = last.impactX - this.px; // >0: fell short/right of player, <0: overshot
      const dWind = this.wind - last.wind;

      // Enemy shoots left: if missDist > 0 (impact > px), shell undershot, needs MORE power
      const powerCorrection = missDist * 0.32;
      const windCorrection = dWind * 0.35;
      const variance = (Math.random() - 0.5) * Math.max(2, 14 * Math.pow(0.55, this.aiHistory.length));

      let nextAngle = last.angle;
      if (missDist > 20 && last.impactY && last.impactY < 145) {
        // Hit mountain ridge: lob higher over the crest
        nextAngle = Math.min(148, nextAngle + 2);
      }

      this.aiTargetAngle = nextAngle;
      this.aiTargetPower = Math.max(25, Math.min(100, Math.round(last.power + powerCorrection + windCorrection + variance)));
    } else {
      // First turn analytical ballistic estimate: high mortar arc (134..144°)
      this.aiTargetAngle = 135 + Math.floor(Math.random() * 10);
      const alpha = (180 - this.aiTargetAngle) * (Math.PI / 180);
      const sin2a = Math.sin(2 * alpha);
      const v0 = Math.sqrt((dist * g) / (sin2a || 0.5));
      const basePwr = v0 / 2.2;
      const windOffset = this.wind * 0.35;
      const initialScatter = (Math.random() - 0.5) * 14;
      this.aiTargetPower = Math.max(30, Math.min(100, Math.round(basePwr + windOffset + initialScatter)));
    }
  },

  fireAi() {
    this.enemyAngle = this.aiTargetAngle;
    const rad = (this.enemyAngle * Math.PI) / 180;
    const spd = this.aiTargetPower * 2.2;
    this.enemyShot = {
      x: this.tx + Math.cos(rad) * 12,
      y: (this.ty - 6) - Math.sin(rad) * 12,
      vx: Math.cos(rad) * spd,
      vy: -Math.sin(rad) * spd
    };
    this.turn = 'ENEMY_SHOT';
    APU.sfx('BOOM');
  },

  update(dt) {
    this.tick += dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - 12 * dt);

    // ------------------------------------------------------------------------
    // Game Over / Victory Prompt handling
    // ------------------------------------------------------------------------
    if (this.won || this.over) {
      let restart = PAD.hit('a') || PAD.hit('start');
      if (PAD.pointer && PAD.pointer.down) {
        if (!this.lastFireDown) {
          restart = true;
          this.lastFireDown = true;
        }
      } else {
        this.lastFireDown = false;
      }

      if (restart) {
        APU.sfx('UI_OK');
        if (this.won) {
          this.resetRound(true);
        } else {
          this.resetRound(false);
        }
      }
      this.updateParticlesAndVisuals(dt);
      return;
    }

    // ------------------------------------------------------------------------
    // Player Aiming & Touch Controls
    // ------------------------------------------------------------------------
    if (this.turn === 'PLAYER') {
      // D-Pad adjustments
      if (PAD.held('left')) this.angle = Math.min(85, this.angle + 26 * dt);
      if (PAD.held('right')) this.angle = Math.max(15, this.angle - 26 * dt);
      if (PAD.held('up')) this.power = Math.min(100, this.power + 32 * dt);
      if (PAD.held('down')) this.power = Math.max(20, this.power - 32 * dt);

      // Discrete taps on D-pad
      if (PAD.hit('left')) this.angle = Math.min(85, this.angle + 1);
      if (PAD.hit('right')) this.angle = Math.max(15, this.angle - 1);
      if (PAD.hit('up')) this.power = Math.min(100, this.power + 1);
      if (PAD.hit('down')) this.power = Math.max(20, this.power - 1);

      // Screen Touch / Pointer Controls
      if (PAD.pointer && PAD.pointer.down) {
        const px = PAD.pointer.x;
        const py = PAD.pointer.y;

        if (py >= 214) {
          // Bottom touch buttons
          if (px >= 3 && px <= 38) {
            this.angle = Math.max(15, this.angle - 26 * dt); // ANG -
          } else if (px >= 42 && px <= 77) {
            this.angle = Math.min(85, this.angle + 26 * dt); // ANG +
          } else if (px >= 81 && px <= 116) {
            this.power = Math.max(20, this.power - 34 * dt); // PWR -
          } else if (px >= 120 && px <= 155) {
            this.power = Math.min(100, this.power + 34 * dt); // PWR +
          } else if (px >= 160 && px <= 253) {
            if (!this.lastFireDown) {
              this.firePlayer();
              this.lastFireDown = true;
            }
          }
        } else {
          // Direct battlefield touch aiming
          const dx = px - this.px;
          const dy = (this.py - 6) - py;
          if (dx > 6) {
            const deg = Math.atan2(dy, dx) * (180 / Math.PI);
            this.angle = Math.max(15, Math.min(85, deg));
            const dist = Math.hypot(dx, dy);
            const pwr = 20 + ((dist - 14) / 96) * 80;
            this.power = Math.max(20, Math.min(100, pwr));
            this.isAimDragging = true;
          }
        }
      } else {
        this.lastFireDown = false;
        this.isAimDragging = false;
      }

      // Controller [A] to fire
      if (PAD.hit('a')) {
        this.firePlayer();
      }
    }

    // ------------------------------------------------------------------------
    // Player Shell Flight Simulation (Sub-Stepping Ballistics)
    // ------------------------------------------------------------------------
    if (this.turn === 'PLAYER_SHOT' && this.shot) {
      const s = this.shot;
      const speed = Math.hypot(s.vx, s.vy);
      // Sub-stepping to prevent tunneling through mountains at any speed
      const subSteps = Math.max(1, Math.min(18, Math.ceil((speed * dt) / 2.0)));
      const sdt = dt / subSteps;

      for (let step = 0; step < subSteps; step++) {
        s.vx += this.wind * sdt;
        s.vy += this.gravity * sdt;
        s.x += s.vx * sdt;
        s.y += s.vy * sdt;

        // Leave dotted smoke trail
        if (Math.random() < 0.85) {
          this.trail.push({
            x: s.x, y: s.y, life: 0.9, maxLife: 0.9
          });
        }

        // Out of horizontal bounds
        if (s.x < -16 || s.x > 272) {
          this.shot = null;
          APU.sfx('DENY');
          this.damageTexts.push({ text: "MISS!", x: 128, y: 70, life: 0.8, color: 2 });
          this.shiftWind();
          this.prepareAiTurn();
          break;
        }

        // Direct enemy tank collision in flight
        if (Math.hypot(s.x - this.tx, s.y - (this.ty - 4)) <= 8) {
          this.handleShellImpact(s.x, s.y, 'PLAYER');
          this.shot = null;
          break;
        }

        // Ground / Mountain collision
        if (s.x >= 0 && s.x < 256) {
          const gy = this.terrain[Math.floor(s.x)];
          if (s.y >= gy) {
            this.handleShellImpact(s.x, gy, 'PLAYER');
            this.shot = null;
            break;
          }
        }

        // Bottom boundary fallback
        if (s.y >= 214) {
          this.handleShellImpact(s.x, 214, 'PLAYER');
          this.shot = null;
          break;
        }
      }
    }

    // ------------------------------------------------------------------------
    // AI Aiming Routine
    // ------------------------------------------------------------------------
    if (this.turn === 'ENEMY_AIM') {
      this.aiTimer -= dt;
      // Smoothly rotate cannon barrel towards target angle
      const diff = this.aiTargetAngle - this.enemyAngle;
      if (Math.abs(diff) > 0.5) {
        this.enemyAngle += Math.sign(diff) * Math.min(Math.abs(diff), 45 * dt);
      }
      if (this.aiTimer <= 0) {
        this.enemyAngle = this.aiTargetAngle;
        this.fireAi();
      }
    }

    // ------------------------------------------------------------------------
    // Enemy Shell Flight Simulation (Sub-Stepping Ballistics)
    // ------------------------------------------------------------------------
    if (this.turn === 'ENEMY_SHOT' && this.enemyShot) {
      const s = this.enemyShot;
      const speed = Math.hypot(s.vx, s.vy);
      const subSteps = Math.max(1, Math.min(18, Math.ceil((speed * dt) / 2.0)));
      const sdt = dt / subSteps;

      for (let step = 0; step < subSteps; step++) {
        s.vx += this.wind * sdt;
        s.vy += this.gravity * sdt;
        s.x += s.vx * sdt;
        s.y += s.vy * sdt;

        if (Math.random() < 0.85) {
          this.trail.push({
            x: s.x, y: s.y, life: 0.9, maxLife: 0.9
          });
        }

        if (s.x < -16 || s.x > 272) {
          this.aiHistory.push({
            power: this.aiTargetPower,
            angle: this.enemyAngle,
            wind: this.wind,
            impactX: s.x,
            impactY: s.y
          });
          this.enemyShot = null;
          APU.sfx('DENY');
          this.damageTexts.push({ text: "MISS!", x: 128, y: 70, life: 0.8, color: 2 });
          this.shiftWind();
          this.turn = 'PLAYER';
          break;
        }

        // Direct player tank collision in flight
        if (Math.hypot(s.x - this.px, s.y - (this.py - 4)) <= 8) {
          this.handleShellImpact(s.x, s.y, 'ENEMY');
          this.enemyShot = null;
          break;
        }

        if (s.x >= 0 && s.x < 256) {
          const gy = this.terrain[Math.floor(s.x)];
          if (s.y >= gy) {
            this.handleShellImpact(s.x, gy, 'ENEMY');
            this.enemyShot = null;
            break;
          }
        }

        if (s.y >= 214) {
          this.handleShellImpact(s.x, 214, 'ENEMY');
          this.enemyShot = null;
          break;
        }
      }
    }

    this.updateParticlesAndVisuals(dt);
  },

  handleShellImpact(ix, iy, shooter) {
    // Measure distance to player & enemy tanks BEFORE crater sinks the ground
    const dPlayer = Math.hypot(ix - this.px, iy - (this.py - 4));
    const dEnemy = Math.hypot(ix - this.tx, iy - (this.ty - 4));

    const craterR = 15;
    this.carveCrater(ix, iy, craterR);

    if (shooter === 'PLAYER') {
      // Direct hit on enemy tank
      const isDirect = dEnemy <= 8 || (Math.abs(ix - this.tx) <= 7 && Math.abs(iy - (this.ty - 4)) <= 8);
      if (isDirect) {
        this.enemyHp = 0;
        this.spawnExplosion(this.tx, this.ty - 4, 24, true);
        this.damageTexts.push({ text: "-100 CRIT!", x: this.tx, y: this.ty - 16, life: 1.2, color: 3 });
        APU.sfx('BOOM');
      } else if (dEnemy <= 28) {
        // Near-miss splash damage
        const splash = Math.round(95 * (1 - (dEnemy - 8) / (28 - 8)));
        const dmg = Math.max(15, Math.min(85, splash));
        this.enemyHp = Math.max(0, this.enemyHp - dmg);
        this.spawnExplosion(ix, iy, craterR, false);
        this.damageTexts.push({ text: "-" + dmg, x: this.tx, y: this.ty - 14, life: 1.0, color: 3 });
        APU.sfx('HIT');
      } else {
        this.spawnExplosion(ix, iy, craterR, false);
        APU.sfx('HIT');
      }

      if (this.enemyHp <= 0) {
        this.score++;
        if (this.score > this.highScore) this.highScore = this.score;
        if (typeof SAVE !== 'undefined') SAVE.setScore(this.id, this.score);
        this.won = true;
        APU.sfx('LEVELUP');
      } else {
        this.shiftWind();
        this.prepareAiTurn();
      }
    } else {
      // ENEMY SHOOTER: record AI memory
      this.aiHistory.push({
        power: this.aiTargetPower,
        angle: this.enemyAngle,
        wind: this.wind,
        impactX: ix,
        impactY: iy
      });

      const isDirect = dPlayer <= 8 || (Math.abs(ix - this.px) <= 7 && Math.abs(iy - (this.py - 4)) <= 8);
      if (isDirect) {
        // Direct hit on player!
        this.playerHp = 0;
        this.spawnExplosion(this.px, this.py - 4, 24, true);
        this.damageTexts.push({ text: "-100 CRIT!", x: this.px, y: this.py - 16, life: 1.2, color: 3 });
        APU.sfx('BOOM');
      } else if (dPlayer <= 28) {
        const splash = Math.round(95 * (1 - (dPlayer - 8) / (28 - 8)));
        const dmg = Math.max(15, Math.min(85, splash));
        this.playerHp = Math.max(0, this.playerHp - dmg);
        this.spawnExplosion(ix, iy, craterR, false);
        this.damageTexts.push({ text: "-" + dmg, x: this.px, y: this.py - 14, life: 1.0, color: 3 });
        APU.sfx('HURT');
      } else {
        this.spawnExplosion(ix, iy, craterR, false);
        APU.sfx('HIT');
      }

      if (this.playerHp <= 0) {
        this.over = true;
        APU.sfx('BOOM');
      } else {
        this.shiftWind();
        this.turn = 'PLAYER';
      }
    }
  },

  updateParticlesAndVisuals(dt) {
    // Smoke trails
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const t = this.trail[i];
      t.life -= dt;
      t.x += this.wind * 0.12 * dt;
      t.y -= 4 * dt;
      if (t.life <= 0) this.trail.splice(i, 1);
    }

    // Dirt debris particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.vx += this.wind * 0.18 * dt;
      p.vy += 160 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x >= 0 && p.x < 256) {
        const gy = this.terrain[Math.floor(p.x)];
        if (p.y >= gy) {
          p.y = gy - 1;
          p.vy = -Math.abs(p.vy) * 0.28;
          p.vx *= 0.55;
        }
      }
      if (p.life <= 0 || p.y > 214) this.particles.splice(i, 1);
    }

    // Expanding shockwaves
    for (let i = this.blasts.length - 1; i >= 0; i--) {
      const b = this.blasts[i];
      b.life -= dt;
      b.r = b.maxR * (1 - b.life / b.maxLife);
      if (b.life <= 0) this.blasts.splice(i, 1);
    }

    // Floating damage texts
    for (let i = this.damageTexts.length - 1; i >= 0; i--) {
      const d = this.damageTexts[i];
      d.life -= dt;
      d.y -= 14 * dt;
      if (d.life <= 0) this.damageTexts.splice(i, 1);
    }

    // Engine smoke puffs if tanks heavily damaged
    if (this.playerHp > 0 && this.playerHp <= 35 && Math.random() < 0.25) {
      this.particles.push({
        x: this.px - 3, y: this.py - 6,
        vx: (Math.random() - 0.5) * 6 + this.wind * 0.1, vy: -12 - Math.random() * 8,
        life: 0.6, maxLife: 0.6, color: 1, isDebris: false
      });
    }
    if (this.enemyHp > 0 && this.enemyHp <= 35 && Math.random() < 0.25) {
      this.particles.push({
        x: this.tx + 3, y: this.ty - 6,
        vx: (Math.random() - 0.5) * 6 + this.wind * 0.1, vy: -12 - Math.random() * 8,
        life: 0.6, maxLife: 0.6, color: 1, isDebris: false
      });
    }
  },

  render(g) {
    let ox = 0, oy = 0;
    if (this.shake > 0) {
      ox = Math.floor((Math.random() - 0.5) * this.shake);
      oy = Math.floor((Math.random() - 0.5) * this.shake);
    }

    g.clear(0);

    // ------------------------------------------------------------------------
    // Mountain & Hill Terrain
    // ------------------------------------------------------------------------
    for (let x = 0; x < 256; x++) {
      const gy = Math.floor(this.terrain[x]) + oy;
      if (gy < 214) {
        // Bright ridge line
        g.px(x + ox, gy, 3);
        if (gy + 1 < 214) g.px(x + ox, gy + 1, 2);
        // Mountain rock body
        const topFill = gy + 2;
        const bottomFill = 214 + oy;
        if (bottomFill > topFill) {
          g.rect(x + ox, topFill, 1, bottomFill - topFill, 1);
          // Subtle rocky dither flecks
          if (((x + gy) & 7) === 0 && gy + 4 < bottomFill) {
            g.px(x + ox, gy + 4, 2);
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // Destructible Ground Floor Border
    // ------------------------------------------------------------------------
    g.line(0, 214, 256, 214, 2);

    // ------------------------------------------------------------------------
    // Smoke Trails
    // ------------------------------------------------------------------------
    for (let t of this.trail) {
      const ratio = t.life / t.maxLife;
      const col = ratio > 0.6 ? 3 : (ratio > 0.25 ? 2 : 1);
      const tx = Math.floor(t.x) + ox;
      const ty = Math.floor(t.y) + oy;
      if (ratio > 0.5) g.disc(tx, ty, 1, col);
      else g.px(tx, ty, col);
    }

    // ------------------------------------------------------------------------
    // Tanks & Aiming Reticle
    // ------------------------------------------------------------------------
    this.renderTanks(g, ox, oy);

    // ------------------------------------------------------------------------
    // Active In-Flight Shells
    // ------------------------------------------------------------------------
    if (this.shot) {
      const sx = Math.floor(this.shot.x) + ox;
      const sy = Math.floor(this.shot.y) + oy;
      if (sy >= 0 && sy < 214) {
        g.disc(sx, sy, 2, 3);
        g.px(sx, sy, 0); // Core pinprick
      } else if (sy < 0) {
        // Off-screen high altitude mortar indicator
        g.text("▲", sx - 2, 26, 3);
        g.text(Math.abs(sy) + "M", sx - 8, 33, 2);
      }
    }

    if (this.enemyShot) {
      const sx = Math.floor(this.enemyShot.x) + ox;
      const sy = Math.floor(this.enemyShot.y) + oy;
      if (sy >= 0 && sy < 214) {
        g.disc(sx, sy, 2, 2);
        g.px(sx, sy, 3);
      } else if (sy < 0) {
        g.text("▲", sx - 2, 26, 2);
        g.text(Math.abs(sy) + "M", sx - 8, 33, 1);
      }
    }

    // ------------------------------------------------------------------------
    // Explosions, Blasts & Debris
    // ------------------------------------------------------------------------
    for (let b of this.blasts) {
      g.circle(Math.floor(b.x) + ox, Math.floor(b.y) + oy, Math.floor(b.r), 3);
    }

    for (let p of this.particles) {
      const px = Math.floor(p.x) + ox;
      const py = Math.floor(p.y) + oy;
      if (px >= 0 && px < 256 && py >= 0 && py < 214) {
        g.px(px, py, p.color);
      }
    }

    // ------------------------------------------------------------------------
    // Floating Damage Text
    // ------------------------------------------------------------------------
    for (let d of this.damageTexts) {
      const textW = d.text.length * 5 - 1;
      const tx = Math.floor(d.x - textW / 2) + ox;
      const ty = Math.floor(d.y) + oy;
      g.text(d.text, tx, ty, d.color);
    }

    // ------------------------------------------------------------------------
    // HUD Overlays
    // ------------------------------------------------------------------------
    this.renderHUD(g);

    // ------------------------------------------------------------------------
    // Bottom Touch Controls Bar
    // ------------------------------------------------------------------------
    this.renderTouchBar(g);

    // ------------------------------------------------------------------------
    // Game Over & Victory Modals
    // ------------------------------------------------------------------------
    if (this.won) {
      g.dither(34, 76, 188, 56, 0, 1);
      g.rect(34, 76, 188, 56, 0);
      g.box(34, 76, 188, 56, 3);
      g.textC("★ ENEMY TANK DESTROYED! ★", 84, 3);
      g.textC("ROUND WON! WINS: " + this.score + "  BEST: " + this.highScore, 98, 2);
      g.textC("[FIRE] OR [A] NEXT ROUND", 114, 3);
    } else if (this.over) {
      g.dither(34, 76, 188, 56, 0, 1);
      g.rect(34, 76, 188, 56, 0);
      g.box(34, 76, 188, 56, 3);
      g.textC("YOUR TANK WAS DESTROYED!", 84, 3);
      g.textC("FINAL SCORE: " + this.score + " WINS  BEST: " + this.highScore, 98, 2);
      g.textC("[FIRE] OR [A] TO RETRY", 114, 3);
    }
  },

  renderTanks(g, ox, oy) {
    // 1. Player Tank (Left)
    const px = Math.floor(this.px) + ox;
    const py = Math.floor(this.py) + oy;

    if (this.playerHp > 0) {
      // Caterpillar treads
      g.rect(px - 7, py - 3, 14, 3, 1);
      g.box(px - 7, py - 3, 14, 3, 2);
      g.px(px - 5, py - 2, 3);
      g.px(px - 1, py - 2, 3);
      g.px(px + 3, py - 2, 3);
      // Armored Chassis
      g.rect(px - 5, py - 6, 10, 3, 2);
      g.box(px - 5, py - 6, 10, 3, 3);
      // Turret Dome
      g.rect(px - 3, py - 8, 6, 3, 3);

      // Rotating Cannon Barrel
      const radP = (this.angle * Math.PI) / 180;
      const bx0 = px;
      const by0 = py - 6;
      const bx1 = bx0 + Math.cos(radP) * 12;
      const by1 = by0 - Math.sin(radP) * 12;
      g.line(bx0, by0, bx1, by1, 3);

      // Mini Health Bar above tank
      const hpWidthP = Math.max(0, Math.floor((this.playerHp / 100) * 14));
      g.rect(px - 7, py - 12, 14, 2, 0);
      g.box(px - 8, py - 13, 16, 4, 1);
      if (hpWidthP > 0) g.rect(px - 7, py - 12, hpWidthP, 2, 3);

      // Interactive Aim Reticle & Dotted Vector (during aiming)
      if (this.turn === 'PLAYER' && !this.shot) {
        if (this.isAimDragging) {
          // Dotted trajectory preview line
          for (let step = 1; step <= 6; step++) {
            const dotX = bx0 + Math.cos(radP) * (14 + step * 7);
            const dotY = by0 - Math.sin(radP) * (14 + step * 7);
            g.px(Math.floor(dotX), Math.floor(dotY), step % 2 === 0 ? 3 : 2);
          }
          // Aiming touch crosshair
          const retX = Math.floor(PAD.pointer.x);
          const retY = Math.floor(PAD.pointer.y);
          g.line(retX - 3, retY, retX + 3, retY, 3);
          g.line(retX, retY - 3, retX, retY + 3, 3);
        }
      }
    } else {
      // Wrecked Player Tank
      g.rect(px - 7, py - 2, 14, 2, 1);
      g.line(px - 5, py - 4, px + 4, py - 1, 2);
    }

    // 2. Enemy Tank (Right)
    const tx = Math.floor(this.tx) + ox;
    const ty = Math.floor(this.ty) + oy;

    if (this.enemyHp > 0) {
      g.rect(tx - 7, ty - 3, 14, 3, 1);
      g.box(tx - 7, ty - 3, 14, 3, 2);
      g.px(tx - 3, ty - 2, 2);
      g.px(tx + 1, ty - 2, 2);
      g.px(tx + 5, ty - 2, 2);
      // Armored Chassis
      g.rect(tx - 5, ty - 6, 10, 3, 1);
      g.box(tx - 5, ty - 6, 10, 3, 2);
      // Turret Dome
      g.rect(tx - 3, ty - 8, 6, 3, 2);

      // Enemy Rotating Barrel
      const radE = (this.enemyAngle * Math.PI) / 180;
      const ex0 = tx;
      const ey0 = ty - 6;
      const ex1 = ex0 + Math.cos(radE) * 12;
      const ey1 = ey0 - Math.sin(radE) * 12;
      g.line(ex0, ey0, ex1, ey1, 2);

      // Mini Health Bar above tank
      const hpWidthE = Math.max(0, Math.floor((this.enemyHp / 100) * 14));
      g.rect(tx - 7, ty - 12, 14, 2, 0);
      g.box(tx - 8, ty - 13, 16, 4, 1);
      if (hpWidthE > 0) g.rect(tx - 7, ty - 12, hpWidthE, 2, 2);
    } else {
      // Wrecked Enemy Tank
      g.rect(tx - 7, ty - 2, 14, 2, 1);
      g.line(tx - 4, ty - 1, tx + 5, ty - 4, 2);
    }
  },

  renderHUD(g) {
    // Top Bar Background
    g.rect(0, 0, 256, 23, 0);
    g.line(0, 23, 256, 23, 1);

    // Player 1 HP Segmented Bar
    g.text("P1:", 4, 3, 3);
    const pBars = Math.ceil(this.playerHp / 20);
    let pBarStr = "";
    for (let i = 0; i < 5; i++) pBarStr += (i < pBars ? "■" : "·");
    g.text(pBarStr, 18, 3, 3);
    g.text(this.playerHp + "", 46, 3, 2);

    // Wind Indicator (Center)
    const windVal = Math.round(this.wind);
    let windStr = "";
    const flutter = Math.floor(this.tick * 6) % 2 === 0;
    if (windVal > 4) {
      windStr = "WIND: " + (flutter ? "▶▶" : "▶ ") + " " + windVal;
    } else if (windVal < -4) {
      windStr = (flutter ? "◀◀" : " ◀") + " " + Math.abs(windVal) + " :WIND";
    } else {
      windStr = "· CALM ·";
    }
    g.textC(windStr, 3, 3);

    // CPU HP Segmented Bar
    g.text("CPU:", 184, 3, 2);
    const eBars = Math.ceil(this.enemyHp / 20);
    let eBarStr = "";
    for (let i = 0; i < 5; i++) eBarStr += (i < eBars ? "■" : "·");
    g.text(eBarStr, 204, 3, 2);
    g.textR(this.enemyHp + "", 252, 3, 1);

    // Second Row: Aim info, Round, and Status
    g.text("ANG:" + Math.floor(this.angle) + "° PWR:" + Math.floor(this.power), 4, 13, 3);

    if (this.turn === 'ENEMY_AIM') {
      g.textC("CPU AIMING...", 13, 2);
    } else if (this.turn === 'ENEMY_SHOT') {
      g.textC("INCOMING SHELL!", 13, 3);
    } else if (this.turn === 'PLAYER_SHOT') {
      g.textC("SHELL IN FLIGHT", 13, 3);
    } else {
      g.textC("RND:" + this.round, 13, 2);
    }

    g.textR("WINS:" + this.score + " BEST:" + this.highScore, 252, 13, 2);
  },

  renderTouchBar(g) {
    // Bottom tactile touch control bar
    g.rect(0, 214, 256, 26, 0);
    g.line(0, 214, 256, 214, 2);

    const isDown = PAD.pointer && PAD.pointer.down && PAD.pointer.y >= 214;
    const px = isDown ? PAD.pointer.x : -1;

    const buttons = [
      { x: 3, w: 36, label: "ANG-", active: isDown && px >= 3 && px <= 39 },
      { x: 42, w: 36, label: "ANG+", active: isDown && px >= 42 && px <= 78 },
      { x: 81, w: 36, label: "PWR-", active: isDown && px >= 81 && px <= 116 },
      { x: 120, w: 36, label: "PWR+", active: isDown && px >= 120 && px <= 155 },
      { x: 160, w: 93, label: "[ FIRE ]", active: isDown && px >= 160 && px <= 253 }
    ];

    for (let b of buttons) {
      if (b.active) {
        g.rect(b.x, 216, b.w, 22, 3);
        g.box(b.x, 216, b.w, 22, 2);
        const tw = b.label.length * 5 - 1;
        const tx = b.x + Math.floor((b.w - tw) / 2);
        g.text(b.label, tx, 224, 0);
      } else {
        g.rect(b.x, 216, b.w, 22, 1);
        g.box(b.x, 216, b.w, 22, b.label.includes("FIRE") ? 3 : 2);
        const tw = b.label.length * 5 - 1;
        const tx = b.x + Math.floor((b.w - tw) / 2);
        g.text(b.label, tx, 224, b.label.includes("FIRE") ? 3 : 2);
      }
    }
  },

  save() {
    return {
      score: this.score,
      highScore: this.highScore,
      round: this.round
    };
  },

  load(data) {
    if (!data) return;
    if (data.score !== undefined) this.score = data.score;
    if (data.highScore !== undefined) this.highScore = data.highScore;
    if (data.round !== undefined) this.round = data.round;
  }
};
