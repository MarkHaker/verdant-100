// js/cartridges/cart_004_arkanoid.js
// ============================================================================
// Cartridge #004: ARKANOID
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 4. ARKANOID
CARTS[4] = {
  id: 4,
  name: "ARKANOID",
  genre: 0,
  scoreLabel: "BRICKS",
  desc: "DEFLECT THE BALL TO SMASH ALL BRICKS. CATCH FALLING CAPSULES!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) g.rect(x + 5 + c * 6, y + 6 + r * 4, 5, 3, 2);
    }
    g.rect(x + 8, y + 24, 16, 3, 3);
    g.rect(x + 15, y + 18, 3, 3, 3);
  },

  init() {
    this.paddleX = 110;
    this.paddleW = 36;
    this.paddleBaseW = 36;
    this.ballX = 128;
    this.ballY = 214;
    this.ballVX = 100;
    this.ballVY = -140;
    this.serving = true;
    this.serveTimer = 1.0;
    this.lives = 3;
    this.score = 0;
    this.over = false;
    this.won = false;
    this.expandTimer = 0;
    this.laserTimer = 0;
    this.laserCooldown = 0;
    this.lasers = [];
    this.capsules = [];
    this.particles = [];
    this.highScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? (SAVE.getScore(this.id) || 0) : 0;

    // 5 distinct rows of bricks with varying point values and phosphor tints
    // Row 0: Top row, 50 pts, color 3 (solid + highlight)
    // Row 1: 40 pts, color 3 (dither 2/3)
    // Row 2: 30 pts, color 2 (solid + box 3)
    // Row 3: 20 pts, color 2 (dither 1/2)
    // Row 4: 10 pts, color 1 (solid + box 2)
    this.bricks = [];
    const rowConfigs = [
      { pts: 50, color: 3, style: 'solid3' },
      { pts: 40, color: 3, style: 'dither3' },
      { pts: 30, color: 2, style: 'solid2' },
      { pts: 20, color: 2, style: 'dither2' },
      { pts: 10, color: 1, style: 'solid1' }
    ];

    for (let r = 0; r < 5; r++) {
      const cfg = rowConfigs[r];
      for (let c = 0; c < 10; c++) {
        this.bricks.push({
          x: 15 + c * 23,
          y: 30 + r * 10,
          w: 20,
          h: 7,
          active: true,
          pts: cfg.pts,
          color: cfg.color,
          style: cfg.style,
          row: r
        });
      }
    }
  },

  spawnSparks(x, y, c) {
    for (let i = 0; i < 6; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 20 + Math.random() * 50;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.2 + Math.random() * 0.15,
        c: c
      });
    }
  },

  activateCapsule(type) {
    APU.sfx('LEVELUP');
    PAD.vibrate(12);
    this.score += 25;
    if (type === 'E') {
      // Expand paddle (+12px for 12 seconds)
      this.expandTimer = 12;
      this.paddleW = 48;
      this.paddleX = Math.min(247 - this.paddleW, this.paddleX);
    } else if (type === 'S') {
      // Slow ball speed down
      const curSpeed = Math.hypot(this.ballVX, this.ballVY);
      const targetSpeed = 130;
      if (curSpeed > targetSpeed) {
        const s = targetSpeed / curSpeed;
        this.ballVX *= s;
        this.ballVY *= s;
      }
    } else if (type === 'L') {
      // Laser blaster for 10 seconds
      this.laserTimer = 10;
      this.laserCooldown = 0;
    } else if (type === 'P') {
      // Extra Life
      this.lives = Math.min(5, this.lives + 1);
      APU.sfx('POWER');
    }
  },

  update(dt) {
    if (this.over || this.won) {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || PAD.tapPos || (PAD.pointer && PAD.pointer.down)) {
        this.init();
      }
      return;
    }

    // Power-up timers
    if (this.expandTimer > 0) {
      this.expandTimer -= dt;
      if (this.expandTimer <= 0) {
        this.expandTimer = 0;
        this.paddleW = this.paddleBaseW;
      }
    }
    if (this.laserTimer > 0) {
      this.laserTimer -= dt;
      if (this.laserTimer <= 0) {
        this.laserTimer = 0;
      }
    }
    if (this.laserCooldown > 0) {
      this.laserCooldown -= dt;
    }

    // --- 1. PADDLE CONTROLS ---
    // D-pad Left / Right
    const pSpd = 200;
    if (PAD.held('left') || PAD.state.left) {
      this.paddleX -= pSpd * dt;
    }
    if (PAD.held('right') || PAD.state.right) {
      this.paddleX += pSpd * dt;
    }

    // Swipe gestures (quick dashes)
    if (PAD.swipe === 'left') {
      this.paddleX -= 36;
      PAD.vibrate(6);
    } else if (PAD.swipe === 'right') {
      this.paddleX += 36;
      PAD.vibrate(6);
    }

    // Mobile touch dragging: touching/dragging along bottom screen area directly moves paddle
    if (PAD.pointer && PAD.pointer.down && PAD.pointer.y >= 120) {
      const targetX = PAD.pointer.x - this.paddleW / 2;
      this.paddleX += (targetX - this.paddleX) * Math.min(1, 28 * dt);
    }

    // Clamp paddle to inner court boundaries
    this.paddleX = Math.max(9, Math.min(247 - this.paddleW, this.paddleX));

    // --- 2. LASER FIRING & UPDATES ---
    if (this.laserTimer > 0) {
      const firePressed = PAD.hit('a') || PAD.hit('b') || (PAD.tapPos && PAD.tapPos.y < 130);
      const fireHeld = (PAD.held('a') || PAD.held('b')) && this.laserCooldown <= 0;
      if ((firePressed || fireHeld) && this.laserCooldown <= 0) {
        this.laserCooldown = 0.28;
        this.lasers.push({ x: this.paddleX + 2, y: 215, vy: -260 });
        this.lasers.push({ x: this.paddleX + this.paddleW - 4, y: 215, vy: -260 });
        APU.sfx('HIT');
        PAD.vibrate(6);
      }
    }

    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.y += l.vy * dt;
      if (l.y < 24) {
        this.lasers.splice(i, 1);
        continue;
      }
      let hit = false;
      for (let b of this.bricks) {
        if (b.active && l.x >= b.x && l.x <= b.x + b.w && l.y >= b.y && l.y <= b.y + b.h) {
          b.active = false;
          this.score += b.pts;
          APU.sfx('COIN');
          this.spawnSparks(b.x + b.w / 2, b.y + b.h / 2, b.color);
          hit = true;
          if (Math.random() < 0.20) {
            const types = ['E', 'S', 'L', 'P'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.capsules.push({
              x: b.x + b.w / 2,
              y: b.y + b.h / 2,
              type: type,
              vy: 48
            });
          }
          if (this.bricks.every(k => !k.active)) {
            this.won = true;
            this.score += 500;
            APU.sfx('LEVELUP');
            SAVE.setScore(this.id, this.score);
            this.highScore = Math.max(this.highScore, this.score);
          }
          break;
        }
      }
      if (hit) {
        this.lasers.splice(i, 1);
      }
    }

    // --- 3. FALLING CAPSULES ---
    for (let i = this.capsules.length - 1; i >= 0; i--) {
      const c = this.capsules[i];
      c.y += c.vy * dt;
      // Paddle catch collision (paddle top is 218, height 6)
      if (c.y + 3 >= 216 && c.y - 3 <= 226 &&
          c.x + 6 >= this.paddleX && c.x - 6 <= this.paddleX + this.paddleW) {
        this.activateCapsule(c.type);
        this.capsules.splice(i, 1);
        continue;
      }
      if (c.y > 238) {
        this.capsules.splice(i, 1);
      }
    }

    // --- 4. SERVING BALL LOGIC ---
    if (this.serving) {
      this.ballX = this.paddleX + this.paddleW / 2;
      this.ballY = 214;
      if (this.serveTimer > 0) this.serveTimer -= dt;
      const launchInput = PAD.hit('a') || PAD.hit('b') || PAD.hit('start') ||
                          (PAD.tapPos && PAD.tapPos.y < 130) ||
                          (this.serveTimer <= 0 && (PAD.held('left') || PAD.held('right') || PAD.state.left || PAD.state.right)) ||
                          (this.serveTimer < -1.5);
      if (launchInput) {
        this.serving = false;
        this.ballVY = -150;
        this.ballVX = (Math.random() > 0.5 ? 90 : -90);
        APU.sfx('SWISH');
      }
      // Update particles during serve
      for (let p of this.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
      }
      this.particles = this.particles.filter(p => p.life > 0);
      return;
    }

    // --- 5. ANTI-TUNNELING SUB-STEPPED BALL PHYSICS ---
    const r = 2.5;
    const maxDisplacement = Math.max(Math.abs(this.ballVX * dt), Math.abs(this.ballVY * dt));
    const steps = Math.max(1, Math.ceil(maxDisplacement / 2.2));
    const stepDt = dt / steps;

    for (let s = 0; s < steps; s++) {
      this.ballX += this.ballVX * stepDt;
      this.ballY += this.ballVY * stepDt;

      // Wall bounces
      if (this.ballX - r < 9) {
        this.ballX = 9 + r;
        this.ballVX = Math.abs(this.ballVX);
        APU.sfx('TICK');
      } else if (this.ballX + r > 247) {
        this.ballX = 247 - r;
        this.ballVX = -Math.abs(this.ballVX);
        APU.sfx('TICK');
      }

      if (this.ballY - r < 23) {
        this.ballY = 23 + r;
        this.ballVY = Math.abs(this.ballVY);
        APU.sfx('TICK');
      }

      // Paddle collision (paddle is at y: 218, height: 6)
      if (this.ballVY > 0 &&
          this.ballY + r >= 218 && this.ballY - r <= 224 &&
          this.ballX + r >= this.paddleX && this.ballX - r <= this.paddleX + this.paddleW) {
        this.ballY = 218 - r;
        const paddleCenter = this.paddleX + this.paddleW / 2;
        const halfW = this.paddleW / 2;
        const hitPos = Math.max(-1, Math.min(1, (this.ballX - paddleCenter) / halfW));
        const maxAngle = 60 * (Math.PI / 180);
        const angle = hitPos * maxAngle;
        let speed = Math.hypot(this.ballVX, this.ballVY);
        speed = Math.min(230, Math.max(140, speed + 2));
        this.ballVX = speed * Math.sin(angle);
        this.ballVY = -speed * Math.cos(angle);
        APU.sfx('HIT');
        PAD.vibrate(8);
      }

      // Brick collision with accurate side-vs-top reflection
      for (let b of this.bricks) {
        if (!b.active) continue;
        if (this.ballX + r >= b.x && this.ballX - r <= b.x + b.w &&
            this.ballY + r >= b.y && this.ballY - r <= b.y + b.h) {
          b.active = false;
          this.score += b.pts;
          APU.sfx('COIN');
          this.spawnSparks(b.x + b.w / 2, b.y + b.h / 2, b.color);

          const overlapLeft = (this.ballX + r) - b.x;
          const overlapRight = (b.x + b.w) - (this.ballX - r);
          const overlapTop = (this.ballY + r) - b.y;
          const overlapBottom = (b.y + b.h) - (this.ballY - r);

          const minOverlapX = Math.min(overlapLeft, overlapRight);
          const minOverlapY = Math.min(overlapTop, overlapBottom);

          if (minOverlapX < minOverlapY) {
            // Left or right side hit
            if (overlapLeft < overlapRight) {
              this.ballX = b.x - r;
              this.ballVX = -Math.abs(this.ballVX);
            } else {
              this.ballX = b.x + b.w + r;
              this.ballVX = Math.abs(this.ballVX);
            }
          } else {
            // Top or bottom hit
            if (overlapTop < overlapBottom) {
              this.ballY = b.y - r;
              this.ballVY = -Math.abs(this.ballVY);
            } else {
              this.ballY = b.y + b.h + r;
              this.ballVY = Math.abs(this.ballVY);
            }
          }

          // Capsule drop chance (20%)
          if (Math.random() < 0.20) {
            const types = ['E', 'S', 'L', 'P'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.capsules.push({
              x: b.x + b.w / 2,
              y: b.y + b.h / 2,
              type: type,
              vy: 48
            });
          }

          // Check win condition
          if (this.bricks.every(k => !k.active)) {
            this.won = true;
            this.score += 500;
            APU.sfx('LEVELUP');
            SAVE.setScore(this.id, this.score);
            this.highScore = Math.max(this.highScore, this.score);
          }
          break; // One brick per sub-step
        }
      }

      // Check floor boundary inside sub-step
      if (this.ballY > 238) {
        break;
      }
    }

    // Floor loss
    if (this.ballY > 238) {
      this.lives--;
      APU.sfx('HURT');
      PAD.vibrate(25);
      this.expandTimer = 0;
      this.paddleW = this.paddleBaseW;
      this.laserTimer = 0;
      this.lasers = [];
      if (this.lives <= 0) {
        this.over = true;
        SAVE.setScore(this.id, this.score);
        this.highScore = Math.max(this.highScore, this.score);
      } else {
        this.serving = true;
        this.serveTimer = 1.0;
      }
    }

    // Particle updates
    for (let p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  },

  render(g) {
    g.clear(0);

    // Frame borders (top, left, right open at bottom)
    g.line(8, 8, 248, 8, 2);
    g.line(8, 8, 8, 238, 2);
    g.line(248, 8, 248, 238, 2);
    g.line(8, 22, 248, 22, 1);

    // HUD Header
    g.text("SCORE " + this.score, 12, 12, 3);
    if (this.laserTimer > 0) {
      g.textC("LASER " + Math.ceil(this.laserTimer) + "S", 12, 3);
    } else if (this.expandTimer > 0) {
      g.textC("WIDE " + Math.ceil(this.expandTimer) + "S", 12, 3);
    } else {
      g.textC("HIGH " + Math.max(this.highScore, this.score), 12, 2);
    }
    g.textR("♥".repeat(Math.max(0, this.lives)), 244, 12, 3);

    // Bricks
    for (let b of this.bricks) {
      if (!b.active) continue;
      if (b.style === 'solid3') {
        g.rect(b.x, b.y, b.w, b.h, 3);
        g.box(b.x, b.y, b.w, b.h, 2);
        g.line(b.x + 1, b.y + 1, b.x + b.w - 2, b.y + 1, 3);
      } else if (b.style === 'dither3') {
        g.dither(b.x, b.y, b.w, b.h, 2, 3);
        g.box(b.x, b.y, b.w, b.h, 3);
      } else if (b.style === 'solid2') {
        g.rect(b.x, b.y, b.w, b.h, 2);
        g.box(b.x, b.y, b.w, b.h, 3);
      } else if (b.style === 'dither2') {
        g.dither(b.x, b.y, b.w, b.h, 1, 2);
        g.box(b.x, b.y, b.w, b.h, 2);
      } else {
        g.rect(b.x, b.y, b.w, b.h, 1);
        g.box(b.x, b.y, b.w, b.h, 2);
      }
    }

    // Sparks / Particles
    for (let p of this.particles) {
      g.px(Math.floor(p.x), Math.floor(p.y), p.c);
    }

    // Power-Up Falling Capsules
    for (let c of this.capsules) {
      const cx = Math.floor(c.x - 6);
      const cy = Math.floor(c.y - 3);
      g.rect(cx, cy, 12, 7, 1);
      g.box(cx, cy, 12, 7, 3);
      g.line(cx + 2, cy + 1, cx + 9, cy + 1, 2);
      const symbol = c.type === 'P' ? '♥' : c.type;
      g.text(symbol, cx + 4, cy + 1, 3);
    }

    // Lasers
    for (let l of this.lasers) {
      g.rect(Math.floor(l.x), Math.floor(l.y), 2, 6, 3);
    }

    // Paddle (Beveled)
    const px = Math.floor(this.paddleX);
    const pw = this.paddleW;
    g.rect(px, 218, pw, 6, 2);
    g.line(px + 1, 218, px + pw - 2, 218, 3);
    g.line(px + 2, 223, px + pw - 3, 223, 1);
    g.px(px, 218, 3);
    g.px(px + pw - 1, 218, 3);
    // Center notch
    g.line(px + Math.floor(pw / 2) - 1, 219, px + Math.floor(pw / 2) + 1, 219, 3);

    // Laser Barrels on Paddle
    if (this.laserTimer > 0) {
      g.rect(px + 1, 215, 3, 3, 3);
      g.rect(px + pw - 4, 215, 3, 3, 3);
    }

    // Ball (Phosphor Glowing)
    const bx = Math.floor(this.ballX);
    const by = Math.floor(this.ballY);
    g.disc(bx, by, 2, 3);
    g.px(bx - 3, by, 2);
    g.px(bx + 3, by, 2);
    g.px(bx, by - 3, 2);
    g.px(bx, by + 3, 2);

    // Serving prompt
    if (this.serving) {
      g.textC("PRESS [A] TO SERVE", 140, 2);
    }

    // Stage Clear Overlay
    if (this.won) {
      g.dither(56, 90, 144, 58, 0, 1);
      g.box(56, 90, 144, 58, 3);
      g.textC("STAGE CLEARED!", 98, 3);
      g.textC("BONUS +500", 110, 2);
      g.textC("SCORE " + this.score, 122, 3);
      g.textC("[A] PLAY AGAIN", 134, 1);
    } else if (this.over) {
      g.dither(56, 90, 144, 58, 0, 1);
      g.box(56, 90, 144, 58, 3);
      g.textC("GAME OVER", 98, 3);
      g.textC("SCORE " + this.score, 110, 2);
      g.textC("HIGH " + Math.max(this.highScore, this.score), 122, 2);
      g.textC("[A] TO RETRY", 134, 1);
    }
  }
};
