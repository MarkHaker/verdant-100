// js/cartridges/cart_063_air_hockey.js
// ============================================================================
// Cartridge #063: AIR HOCKEY
// Genre: Racing & Vehicles / Sports (6) | Fast-Paced Arcade Table Hockey
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[63] = {
  id: 63,
  name: "AIR HOCKEY",
  genre: 6,
  scoreLabel: "SCORE",
  desc: "TABLE HOCKEY: DRAG OR USE D-PAD TO SMASH PUCK PAST AI! FIRST TO 7 WINS!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Air hockey table, player mallet, floating puck, spark collision
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Table boundary
    g.box(x + 3, y + 6, 26, 20, 2);
    g.line(x + 16, y + 6, x + 16, y + 26, 1);
    g.circle(x + 16, y + 16, 4, 1);

    // Goal slots
    g.line(x + 3, y + 12, x + 3, y + 20, 0);
    g.line(x + 28, y + 12, x + 28, y + 20, 0);

    // Player Mallet (Left)
    g.disc(x + 9, y + 16, 4, 3);
    g.disc(x + 9, y + 16, 1, 0);

    // AI Mallet (Right)
    g.disc(x + 23, y + 16, 4, 2);
    g.disc(x + 23, y + 16, 1, 0);

    // Puck & Impact Spark
    g.disc(x + 14, y + 16, 2, 3);
    g.px(x + 13, y + 14, 3);
    g.px(x + 15, y + 18, 3);
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.table = {
      x: 18,
      y: 36,
      w: 220,
      h: 172,
      goalY0: 82,
      goalY1: 162
    };

    this.playerScore = 0;
    this.aiScore = 0;
    this.targetScore = 7;
    this.state = 'PLAY'; // 'PLAY', 'GOAL', 'GAMEOVER'
    this.goalBanner = "";
    this.goalTimer = 0;

    // Mallets & Puck
    this.player = {
      x: 60,
      y: 122,
      vx: 0,
      vy: 0,
      radius: 13,
      mass: 4.0
    };

    this.ai = {
      x: 196,
      y: 122,
      vx: 0,
      vy: 0,
      radius: 13,
      mass: 4.0,
      targetX: 196,
      targetY: 122,
      speed: 155
    };

    this.puck = {
      x: 128,
      y: 122,
      vx: 0,
      vy: 0,
      radius: 7,
      mass: 1.0,
      maxSpeed: 340
    };

    // Sparks & visual FX
    this.sparks = [];

    this.resetPuck(Math.random() < 0.5 ? -1 : 1);
  },

  resetPuck(serveDir) {
    this.puck.x = 128;
    this.puck.y = 122;
    this.puck.vx = serveDir * (110 + Math.random() * 40);
    this.puck.vy = (Math.random() - 0.5) * 80;

    this.player.x = 60;
    this.player.y = 122;
    this.player.vx = 0;
    this.player.vy = 0;

    this.ai.x = 196;
    this.ai.y = 122;
    this.ai.vx = 0;
    this.ai.vy = 0;
  },

  // --------------------------------------------------------------------------
  // 3. MAIN GAMEPLAY UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    if (dt > 0.04) dt = 0.04;

    // Sparks update
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (s.life <= 0) this.sparks.splice(i, 1);
    }

    // Handle Game Over restart
    if (this.state === 'GAMEOVER') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || TOUCH.down) {
        this.init();
      }
      return;
    }

    // Goal pause transition
    if (this.state === 'GOAL') {
      this.goalTimer -= dt;
      if (this.goalTimer <= 0) {
        if (this.playerScore >= this.targetScore || this.aiScore >= this.targetScore) {
          this.state = 'GAMEOVER';
          SAVE.setScore(this.id, this.playerScore * 100 - this.aiScore * 50);
        } else {
          this.state = 'PLAY';
          this.resetPuck(this.lastScoredBy === 'PLAYER' ? 1 : -1);
        }
      }
      return;
    }

    // 1. PLAYER INPUT (D-PAD & DIRECT TOUCH)
    let moveX = 0;
    let moveY = 0;
    const padSpeed = (PAD.state.a ? 260 : 190);

    if (PAD.state.left) moveX -= 1;
    if (PAD.state.right) moveX += 1;
    if (PAD.state.up) moveY -= 1;
    if (PAD.state.down) moveY += 1;

    // Direct touch / mouse drag
    if (TOUCH.held || (PAD.pointer && PAD.pointer.down)) {
      const tx = TOUCH.held ? TOUCH.x : PAD.pointer.x;
      const ty = TOUCH.held ? TOUCH.y : PAD.pointer.y;
      // Clamp to player's table half
      const targetX = Math.max(this.table.x + this.player.radius, Math.min(128 - this.player.radius, tx));
      const targetY = Math.max(this.table.y + this.player.radius, Math.min(this.table.y + this.table.h - this.player.radius, ty));

      this.player.vx = (targetX - this.player.x) / dt;
      this.player.vy = (targetY - this.player.y) / dt;
      this.player.x = targetX;
      this.player.y = targetY;
    } else {
      if (moveX !== 0 || moveY !== 0) {
        const len = Math.hypot(moveX, moveY);
        this.player.vx = (moveX / len) * padSpeed;
        this.player.vy = (moveY / len) * padSpeed;
      } else {
        this.player.vx *= 0.7;
        this.player.vy *= 0.7;
      }
      this.player.x += this.player.vx * dt;
      this.player.y += this.player.vy * dt;

      // Table boundary clamping for player (Left half only)
      this.player.x = Math.max(this.table.x + this.player.radius, Math.min(128 - this.player.radius, this.player.x));
      this.player.y = Math.max(this.table.y + this.player.radius, Math.min(this.table.y + this.table.h - this.player.radius, this.player.y));
    }

    // 2. AI MALLET LOGIC (DEFENSIVE & OFFENSIVE BEHAVIOR)
    const p = this.puck;
    const ai = this.ai;

    if (p.x > 128) {
      // Puck is on AI's side: attack & strike!
      ai.targetX = Math.min(this.table.x + this.table.w - ai.radius - 8, p.x + 8);
      ai.targetY = p.y;
    } else {
      // Puck is on player side: defend goal line
      ai.targetX = this.table.x + this.table.w - 36;
      // Track puck Y with damping
      ai.targetY = 122 + (p.y - 122) * 0.55;
    }

    // Move AI towards target
    const aiDx = ai.targetX - ai.x;
    const aiDy = ai.targetY - ai.y;
    const aiDist = Math.hypot(aiDx, aiDy);
    if (aiDist > 2) {
      ai.vx = (aiDx / aiDist) * ai.speed;
      ai.vy = (aiDy / aiDist) * ai.speed;
    } else {
      ai.vx = 0;
      ai.vy = 0;
    }

    ai.x += ai.vx * dt;
    ai.y += ai.vy * dt;

    // AI Table boundary clamping (Right half only)
    ai.x = Math.max(128 + ai.radius, Math.min(this.table.x + this.table.w - ai.radius, ai.x));
    ai.y = Math.max(this.table.y + ai.radius, Math.min(this.table.y + this.table.h - ai.radius, ai.y));

    // 3. PUCK PHYSICS & MOTION
    p.vx *= Math.pow(0.992, dt * 60); // Air cushion glide friction
    p.vy *= Math.pow(0.992, dt * 60);

    // Speed cap
    const pSpd = Math.hypot(p.vx, p.vy);
    if (pSpd > p.maxSpeed) {
      p.vx = (p.vx / pSpd) * p.maxSpeed;
      p.vy = (p.vy / pSpd) * p.maxSpeed;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // 4. CIRCLE-TO-CIRCLE MALLET-PUCK COLLISIONS
    this.resolveCollision(this.player, p);
    this.resolveCollision(this.ai, p);

    // 5. TABLE WALL REBOUNDS & GOAL DETECTION
    const t = this.table;

    // Top & Bottom Rail Rebounds
    if (p.y - p.radius < t.y) {
      p.y = t.y + p.radius;
      p.vy = Math.abs(p.vy) * 0.95;
      APU.sfx('TICK');
      this.spawnSparks(p.x, p.y, 4);
    } else if (p.y + p.radius > t.y + t.h) {
      p.y = t.y + t.h - p.radius;
      p.vy = -Math.abs(p.vy) * 0.95;
      APU.sfx('TICK');
      this.spawnSparks(p.x, p.y, 4);
    }

    // Left Rail & Player Goal
    if (p.x - p.radius < t.x) {
      if (p.y >= t.goalY0 && p.y <= t.goalY1) {
        // AI GOAL!
        this.aiScore++;
        this.lastScoredBy = 'AI';
        this.goalBanner = "GOAL FOR AI!";
        this.state = 'GOAL';
        this.goalTimer = 1.8;
        APU.sfx('EXPLODE');
        this.spawnSparks(t.x, p.y, 20);
        return;
      } else {
        p.x = t.x + p.radius;
        p.vx = Math.abs(p.vx) * 0.95;
        APU.sfx('TICK');
        this.spawnSparks(p.x, p.y, 4);
      }
    }

    // Right Rail & AI Goal
    if (p.x + p.radius > t.x + t.w) {
      if (p.y >= t.goalY0 && p.y <= t.goalY1) {
        // PLAYER GOAL!
        this.playerScore++;
        this.lastScoredBy = 'PLAYER';
        this.goalBanner = "★ GOAL FOR PLAYER! ★";
        this.state = 'GOAL';
        this.goalTimer = 1.8;
        APU.sfx('FANFARE');
        this.spawnSparks(t.x + t.w, p.y, 20);
        return;
      } else {
        p.x = t.x + t.w - p.radius;
        p.vx = -Math.abs(p.vx) * 0.95;
        APU.sfx('TICK');
        this.spawnSparks(p.x, p.y, 4);
      }
    }
  },

  resolveCollision(mallet, puck) {
    const dx = puck.x - mallet.x;
    const dy = puck.y - mallet.y;
    const dist = Math.hypot(dx, dy);
    const minDist = mallet.radius + puck.radius;

    if (dist < minDist && dist > 0.001) {
      // Normal collision vector
      const nx = dx / dist;
      const ny = dy / dist;

      // Separate overlapping bodies
      const overlap = minDist - dist;
      puck.x += nx * overlap;
      puck.y += ny * overlap;

      // Relative velocity
      const rvx = puck.vx - mallet.vx;
      const rvy = puck.vy - mallet.vy;
      const velAlongNormal = rvx * nx + rvy * ny;

      if (velAlongNormal < 0) {
        // Restitution impulse
        const restitution = 1.25; // Energetic arcade rebound
        const impulse = -(1 + restitution) * velAlongNormal;
        puck.vx += nx * impulse + mallet.vx * 0.6;
        puck.vy += ny * impulse + mallet.vy * 0.6;

        APU.sfx('HIT');
        this.spawnSparks(puck.x, puck.y, 8);
      }
    }
  },

  spawnSparks(x, y, count) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 30 + Math.random() * 80;
      this.sparks.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.25 + Math.random() * 0.2
      });
    }
  },

  // --------------------------------------------------------------------------
  // 4. 256x240 CRT RENDERING
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    const t = this.table;

    // 1. Table Surface & Border
    g.rect(t.x, t.y, t.w, t.h, 1);
    g.box(t.x, t.y, t.w, t.h, 2);
    g.box(t.x - 2, t.y - 2, t.w + 4, t.h + 4, 3);

    // 2. Center Dividing Line & Circles
    g.line(128, t.y, 128, t.y + t.h, 2);
    g.circle(128, 122, 28, 2);
    g.disc(128, 122, 3, 2);

    // Goal Crease Arcs
    g.circle(t.x, 122, 34, 2);
    g.circle(t.x + t.w, 122, 34, 2);

    // Goal Pockets
    g.rect(t.x - 3, t.goalY0, 4, t.goalY1 - t.goalY0, 0);
    g.line(t.x - 4, t.goalY0, t.x - 4, t.goalY1, 3);
    g.rect(t.x + t.w - 1, t.goalY0, 4, t.goalY1 - t.goalY0, 0);
    g.line(t.x + t.w + 3, t.goalY0, t.x + t.w + 3, t.goalY1, 3);

    // 3. Collision Sparks
    for (let s of this.sparks) {
      g.px(Math.floor(s.x), Math.floor(s.y), 3);
    }

    // 4. Puck
    const px = Math.floor(this.puck.x);
    const py = Math.floor(this.puck.y);
    g.disc(px, py, this.puck.radius, 3);
    g.disc(px, py, this.puck.radius - 2, 0);
    g.px(px, py, 3);

    // 5. Player Mallet (Bright phosphor, green rim)
    const plx = Math.floor(this.player.x);
    const ply = Math.floor(this.player.y);
    g.disc(plx, ply, this.player.radius, 3);
    g.circle(plx, ply, this.player.radius, 2);
    g.disc(plx, ply, 4, 0);
    g.disc(plx, ply, 2, 3); // center handle knob

    // 6. AI Mallet (Darker green rim)
    const aix = Math.floor(this.ai.x);
    const aiy = Math.floor(this.ai.y);
    g.disc(aix, aiy, this.ai.radius, 2);
    g.circle(aix, aiy, this.ai.radius, 3);
    g.disc(aix, aiy, 4, 0);
    g.disc(aix, aiy, 2, 2);

    // 7. Top Scoreboard
    g.rect(0, 0, 256, 30, 0);
    g.line(0, 30, 256, 30, 2);

    g.text("YOU: " + this.playerScore, 40, 10, 3);
    g.textC("FIRST TO 7", 10, 2);
    g.textR("CPU: " + this.aiScore, 216, 10, 2);

    // 8. Bottom Status Prompt
    g.rect(0, 214, 256, 26, 0);
    g.line(0, 214, 256, 214, 2);
    g.textC("D-PAD / DRAG TOUCH TO SMASH PUCK", 222, 2);

    // 9. Goal Celebration Overlay
    if (this.state === 'GOAL') {
      g.dither(30, 95, 196, 44, 0, 1);
      g.box(30, 95, 196, 44, 3);
      g.textC(this.goalBanner, 110, 3);
    }

    // 10. Game Over Overlay
    if (this.state === 'GAMEOVER') {
      g.dither(30, 80, 196, 64, 0, 1);
      g.box(30, 80, 196, 64, 3);
      const won = this.playerScore >= this.targetScore;
      g.textC(won ? "★ MATCH WON! VICTORY! ★" : "MATCH LOST - CPU WINS", 96, 3);
      g.textC("FINAL SCORE: " + this.playerScore + " - " + this.aiScore, 112, 2);
      g.textC("[A] PLAY AGAIN", 128, 3);
    }
  }
};
