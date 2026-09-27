// js/cartridges/cart_064_penalty_kick.js
// ============================================================================
// Cartridge #064: PENALTY KICK
// Genre: Racing & Vehicles / Sports (6) | 5-Round World Cup Penalty Shootout
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[64] = {
  id: 64,
  name: "PENALTY KICK",
  genre: 6,
  scoreLabel: "GOALS",
  desc: "PENALTY SHOOTOUT: AIM WITH D-PAD, [A] FOR POWER & ELEVATION, CURVE AROUND GOALKEEPER!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Soccer goal net, goalkeeper diving, curved soccer ball trajectory
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Goal frame
    g.box(x + 4, y + 8, 24, 16, 2);
    g.line(x + 4, y + 8, x + 8, y + 5, 1);
    g.line(x + 28, y + 8, x + 24, y + 5, 1);
    g.line(x + 8, y + 5, x + 24, y + 5, 1);

    // Diving Goalkeeper
    g.line(x + 10, y + 14, x + 18, y + 18, 3);
    g.disc(x + 10, y + 13, 2, 2);

    // Ball & Trajectory
    g.px(x + 18, y + 24, 2);
    g.px(x + 20, y + 20, 2);
    g.disc(x + 23, y + 12, 3, 3);
    g.px(x + 23, y + 12, 0);
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.round = 1;
    this.maxRounds = 5;
    this.playerGoals = 0;
    this.cpuGoals = 0;
    this.playerKicks = []; // array of 'GOAL' or 'MISS'
    this.cpuKicks = [];

    this.turn = 'PLAYER'; // 'PLAYER', 'CPU'
    this.state = 'AIM'; // 'AIM', 'POWER', 'FLIGHT', 'OUTCOME', 'GAMEOVER'
    this.outcomeText = "";
    this.outcomeTimer = 0;

    // Goal Frame Geometry (Screen coordinates)
    this.goal = {
      x0: 52,
      x1: 204,
      y0: 48,
      y1: 140
    };

    this.resetKick();
  },

  resetKick() {
    this.aimX = 128;
    this.aimY = 94;
    this.aimSway = 0;

    this.powerMeter = 0;
    this.powerDir = 1;
    this.curve = 0; // -1 (left curve) to +1 (right curve)

    // Ball projectile state
    this.ball = {
      x: 128,
      y: 204,
      z: 0, // 0 = at penalty spot, 100 = at goal line
      vx: 0,
      vy: 0,
      vz: 0,
      radius: 9
    };

    // Goalkeeper state
    this.keeper = {
      x: 128,
      y: 110,
      diveX: 128,
      diveY: 110,
      diving: false,
      diveProgress: 0,
      diveDir: 0 // -1 = Left, 0 = Center, 1 = Right
    };

    this.state = 'AIM';
  },

  // --------------------------------------------------------------------------
  // 3. MAIN GAMEPLAY UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    if (dt > 0.05) dt = 0.05;

    // Handle Game Over restart
    if (this.state === 'GAMEOVER') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || TOUCH.down) {
        this.init();
      }
      return;
    }

    // Outcome banner pause
    if (this.state === 'OUTCOME') {
      this.outcomeTimer -= dt;
      if (this.outcomeTimer <= 0) {
        this.advanceShootout();
      }
      return;
    }

    // 1. AIM PHASE
    if (this.state === 'AIM') {
      // Gentle natural aiming sway
      this.aimSway += dt * 3;
      const swayX = Math.sin(this.aimSway) * 1.5;
      const swayY = Math.cos(this.aimSway * 1.4) * 1.2;

      let speed = 90;
      if (PAD.state.left) this.aimX -= speed * dt;
      if (PAD.state.right) this.aimX += speed * dt;
      if (PAD.state.up) this.aimY -= speed * dt;
      if (PAD.state.down) this.aimY += speed * dt;

      // Direct touch aiming
      if (TOUCH.down && TOUCH.y < 160) {
        this.aimX = TOUCH.x;
        this.aimY = TOUCH.y;
      }

      // Clamp crosshair within reasonable target box
      this.aimX = Math.max(this.goal.x0 - 15, Math.min(this.goal.x1 + 15, this.aimX + swayX * dt));
      this.aimY = Math.max(this.goal.y0 - 15, Math.min(this.goal.y1 + 10, this.aimY + swayY * dt));

      // Press [A] to start power meter
      if (PAD.hit('a') || (TOUCH.down && TOUCH.y >= 160)) {
        this.state = 'POWER';
        this.powerMeter = 0;
        this.powerDir = 1;
        APU.sfx('TICK');
      }
      return;
    }

    // 2. POWER & ELEVATION METER
    if (this.state === 'POWER') {
      this.powerMeter += this.powerDir * 2.5 * dt;
      if (this.powerMeter >= 1.0) {
        this.powerMeter = 1.0;
        this.powerDir = -1;
      } else if (this.powerMeter <= 0.0) {
        this.powerMeter = 0.0;
        this.powerDir = 1;
      }

      // Hold Left/Right to apply spin curve
      if (PAD.state.left) this.curve = Math.max(-1.0, this.curve - 3.0 * dt);
      else if (PAD.state.right) this.curve = Math.min(1.0, this.curve + 3.0 * dt);

      // Release / Tap [A] to kick!
      if (PAD.hit('a') || TOUCH.down) {
        this.shootBall();
      }
      return;
    }

    // 3. BALL FLIGHT & GOALKEEPER DIVE
    if (this.state === 'FLIGHT') {
      const b = this.ball;
      const k = this.keeper;

      // Advance ball towards goal line (z: 0 to 100)
      b.z += 130 * dt;
      b.x += (b.vx + this.curve * 35 * (b.z / 100)) * dt;
      b.y += b.vy * dt;

      // Ball shrinks with distance
      b.radius = Math.max(3, Math.floor(9 - (b.z / 100) * 5.5));

      // Goalkeeper dive animation
      if (k.diving) {
        k.diveProgress = Math.min(1.0, k.diveProgress + 2.2 * dt);
        k.x += (k.diveX - k.x) * 4.0 * dt;
        k.y += (k.diveY - k.y) * 4.0 * dt;
      }

      // Ball reaches goal plane!
      if (b.z >= 100) {
        b.z = 100;
        this.resolveGoalLineOutcome();
      }
    }
  },

  shootBall() {
    this.state = 'FLIGHT';
    APU.sfx('HIT');

    // Calculate ball velocity vector towards target aim point
    const targetX = this.aimX;
    const targetY = this.aimY;

    this.ball.vx = (targetX - this.ball.x) * 1.3;
    this.ball.vy = (targetY - this.ball.y) * 1.3;

    // AI Goalkeeper decisions
    // Goalkeeper dives Left, Center, or Right
    const k = this.keeper;
    k.diving = true;
    k.diveProgress = 0;

    const diveRoll = Math.random();
    if (diveRoll < 0.4) {
      k.diveDir = -1; // Dive Left
      k.diveX = this.goal.x0 + 30;
      k.diveY = this.goal.y0 + 35 + Math.random() * 40;
    } else if (diveRoll < 0.8) {
      k.diveDir = 1; // Dive Right
      k.diveX = this.goal.x1 - 30;
      k.diveY = this.goal.y0 + 35 + Math.random() * 40;
    } else {
      k.diveDir = 0; // Stay Center
      k.diveX = 128;
      k.diveY = 100;
    }
  },

  resolveGoalLineOutcome() {
    const bx = this.ball.x;
    const by = this.ball.y;
    const g = this.goal;
    const k = this.keeper;

    // 1. Check woodwork (Posts & Crossbar)
    const hitPostLeft = Math.abs(bx - g.x0) < 5 && by >= g.y0 && by <= g.y1;
    const hitPostRight = Math.abs(bx - g.x1) < 5 && by >= g.y0 && by <= g.y1;
    const hitBar = Math.abs(by - g.y0) < 5 && bx >= g.x0 && bx <= g.x1;

    if (hitPostLeft || hitPostRight || hitBar) {
      this.outcomeText = "OFF THE POST!";
      this.recordOutcome('MISS');
      APU.sfx('BOOM');
      return;
    }

    // 2. Check Over / Wide of Goal
    if (bx < g.x0 || bx > g.x1 || by < g.y0 || by > g.y1) {
      this.outcomeText = by < g.y0 ? "OVER THE BAR!" : "WIDE OF POST!";
      this.recordOutcome('MISS');
      APU.sfx('ERROR');
      return;
    }

    // 3. Check Goalkeeper Save
    const distToKeeper = Math.hypot(bx - k.x, by - k.y);
    if (distToKeeper < 28) {
      this.outcomeText = "SAVED BY KEEPER!";
      this.recordOutcome('MISS');
      APU.sfx('BOOM');
      return;
    }

    // 4. GOAL!!
    this.outcomeText = "★ GOOOAL! ★";
    this.recordOutcome('GOAL');
    APU.sfx('FANFARE');
  },

  recordOutcome(res) {
    this.state = 'OUTCOME';
    this.outcomeTimer = 2.0;

    if (this.turn === 'PLAYER') {
      this.playerKicks.push(res);
      if (res === 'GOAL') this.playerGoals++;
    } else {
      this.cpuKicks.push(res);
      if (res === 'GOAL') this.cpuGoals++;
    }
  },

  advanceShootout() {
    if (this.turn === 'PLAYER') {
      // Simulate CPU shot immediately
      this.turn = 'CPU';
      const cpuScores = Math.random() < 0.65;
      this.cpuKicks.push(cpuScores ? 'GOAL' : 'MISS');
      if (cpuScores) this.cpuGoals++;

      // Check if shootout concluded
      if (this.round >= this.maxRounds) {
        if (this.playerGoals !== this.cpuGoals) {
          this.endGame();
          return;
        } else {
          // Sudden death
          this.round++;
        }
      } else {
        this.round++;
      }

      this.turn = 'PLAYER';
      this.resetKick();
    }
  },

  endGame() {
    this.state = 'GAMEOVER';
    const won = this.playerGoals > this.cpuGoals;
    SAVE.setScore(this.id, this.playerGoals * 200 + (won ? 500 : 0));
  },

  // --------------------------------------------------------------------------
  // 4. 256x240 CRT RENDERING
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    const gl = this.goal;

    // 1. Stadium Grass Pitch & Horizon
    g.rect(0, 130, 256, 110, 1);
    g.line(0, 130, 256, 130, 2);

    // Goal Box line markings on pitch
    g.line(20, 240, 60, 140, 2);
    g.line(236, 240, 196, 140, 2);
    g.line(60, 140, 196, 140, 2);

    // Penalty Spot
    g.disc(128, 204, 3, 2);

    // 2. Goal Net Grid
    for (let x = gl.x0; x <= gl.x1; x += 12) {
      g.line(x, gl.y0, x, gl.y1, 1);
    }
    for (let y = gl.y0; y <= gl.y1; y += 10) {
      g.line(gl.x0, y, gl.x1, y, 1);
    }

    // 3. Goal Frame Posts & Crossbar (Bright white/phosphor)
    g.box(gl.x0, gl.y0, gl.x1 - gl.x0, gl.y1 - gl.y0, 3);
    g.box(gl.x0 - 1, gl.y0 - 1, (gl.x1 - gl.x0) + 2, (gl.y1 - gl.y0) + 2, 2);

    // 4. Goalkeeper
    const kx = Math.floor(this.keeper.x);
    const ky = Math.floor(this.keeper.y);
    if (this.keeper.diving && this.keeper.diveDir !== 0) {
      // Diving pose
      const dDir = this.keeper.diveDir;
      g.line(kx - dDir * 14, ky + 8, kx + dDir * 18, ky - 8, 3);
      g.disc(kx + dDir * 18, ky - 8, 4, 3); // Gloves
      g.disc(kx, ky, 5, 2); // Body
      g.disc(kx + dDir * 8, ky - 3, 4, 3); // Head
    } else {
      // Standing ready pose
      g.rect(kx - 6, ky - 10, 12, 22, 2);
      g.box(kx - 6, ky - 10, 12, 22, 3);
      g.disc(kx, ky - 14, 5, 3); // Head
      g.line(kx - 14, ky - 4, kx - 6, ky - 2, 3); // Left arm
      g.line(kx + 14, ky - 4, kx + 6, ky - 2, 3); // Right arm
      g.disc(kx - 15, ky - 4, 3, 3); // Glove L
      g.disc(kx + 15, ky - 4, 3, 3); // Glove R
    }

    // 5. Aim Crosshair (When aiming)
    if (this.state === 'AIM' || this.state === 'POWER') {
      const ax = Math.floor(this.aimX);
      const ay = Math.floor(this.aimY);
      g.circle(ax, ay, 7, 3);
      g.line(ax - 10, ay, ax + 10, ay, 2);
      g.line(ax, ay - 10, ax, ay + 10, 2);
      g.px(ax, ay, 3);
    }

    // 6. Soccer Ball
    const bx = Math.floor(this.ball.x);
    const by = Math.floor(this.ball.y);
    g.disc(bx, by, this.ball.radius, 3);
    // Ball hexagon pattern dots
    if (this.ball.radius >= 6) {
      g.px(bx, by, 0);
      g.px(bx - 3, by - 2, 0);
      g.px(bx + 3, by - 2, 0);
      g.px(bx, by + 3, 0);
    }

    // 7. Top HUD (Shootout Scoreboard)
    g.rect(0, 0, 256, 26, 0);
    g.line(0, 26, 256, 26, 2);

    g.text("YOU: " + this.playerGoals, 10, 8, 3);
    g.textR("CPU: " + this.cpuGoals, 246, 8, 2);

    // Kick Bubbles (Round 1 to 5)
    for (let i = 0; i < 5; i++) {
      const px = 64 + i * 11;
      const resP = this.playerKicks[i];
      if (resP === 'GOAL') g.disc(px, 12, 3, 3);
      else if (resP === 'MISS') g.disc(px, 12, 3, 0), g.circle(px, 12, 3, 2);
      else g.circle(px, 12, 3, 1);

      const cx = 150 + i * 11;
      const resC = this.cpuKicks[i];
      if (resC === 'GOAL') g.disc(cx, 12, 3, 3);
      else if (resC === 'MISS') g.disc(cx, 12, 3, 0), g.circle(cx, 12, 3, 2);
      else g.circle(cx, 12, 3, 1);
    }

    // 8. Bottom Power Meter & Controls
    g.rect(0, 214, 256, 26, 0);
    g.line(0, 214, 256, 214, 2);

    if (this.state === 'POWER') {
      g.box(68, 220, 120, 10, 2);
      const fillW = Math.floor(this.powerMeter * 118);
      g.rect(69, 221, fillW, 8, fillW > 85 ? 3 : 2);
      g.text("PWR", 36, 222, 3);
      const curveStr = this.curve < -0.2 ? "◄ CURVE" : this.curve > 0.2 ? "CURVE ►" : "STRAIGHT";
      g.textR(curveStr, 250, 222, 2);
    } else {
      g.textC("D-PAD: AIM RETICLE    [A]: LOCK POWER", 222, 2);
    }

    // 9. Outcome Overlay Banner
    if (this.state === 'OUTCOME') {
      g.dither(30, 85, 196, 46, 0, 1);
      g.box(30, 85, 196, 46, 3);
      g.textC(this.outcomeText, 98, 3);
      g.textC("ROUND " + this.round + " OF 5", 114, 2);
    }

    // 10. Game Over Tournament Result
    if (this.state === 'GAMEOVER') {
      g.dither(25, 75, 206, 70, 0, 1);
      g.box(25, 75, 206, 70, 3);
      const won = this.playerGoals > this.cpuGoals;
      g.textC(won ? "★ SHOOTOUT CHAMPION! ★" : "SHOOTOUT DEFEAT", 92, 3);
      g.textC("FINAL SCORE: " + this.playerGoals + " - " + this.cpuGoals, 108, 2);
      g.textC("[A] PLAY SHOOTOUT AGAIN", 126, 3);
    }
  }
};
