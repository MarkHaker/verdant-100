// js/cartridges/cart_027_billiards_2d.js
// ============================================================================
// Cartridge #027: BILLIARDS 2D
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 27. BILLIARDS 2D
CARTS[27] = {
  id: 27, name: "BILLIARDS 2D", genre: 2, scoreLabel: "POTS",
  desc: "POCKET SOLID BALLS. AIM GUIDE LINE AND CHARGE CUE SHOT WITH [A].",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 10, y + 16, 4, 3);
    g.disc(x + 22, y + 16, 4, 2);
  },
  init() {
    this.cue = { x: 60, y: 120, vx: 0, vy: 0, r: 5, active: true };
    this.balls = [
      { x: 180, y: 120, vx: 0, vy: 0, r: 5, active: true },
      { x: 192, y: 114, vx: 0, vy: 0, r: 5, active: true },
      { x: 192, y: 126, vx: 0, vy: 0, r: 5, active: true }
    ];
    this.angle = 0;
    this.pockets = [[24, 34], [128, 34], [232, 34], [24, 206], [128, 206], [232, 206]];
    this.score = 0;
    this.won = false;
  },
  update(dt) {
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    const allBalls = [this.cue, ...this.balls];
    const isMoving = allBalls.some(b => b.active && Math.hypot(b.vx, b.vy) > 4);

    if (!isMoving) {
      if (PAD.state.left) this.angle -= 2.0 * dt;
      if (PAD.state.right) this.angle += 2.0 * dt;
      if (PAD.hit('a')) {
        this.cue.vx = Math.cos(this.angle) * 180;
        this.cue.vy = Math.sin(this.angle) * 180;
        APU.sfx('HIT');
      }
    }

    // Motion & Cushion Bounces
    for (let b of allBalls) {
      if (!b.active) continue;
      b.vx *= 0.985; b.vy *= 0.985;
      b.x += b.vx * dt; b.y += b.vy * dt;

      // Cushions
      if (b.x < 26) { b.x = 26; b.vx = Math.abs(b.vx) * 0.8; APU.sfx('TICK'); }
      if (b.x > 230) { b.x = 230; b.vx = -Math.abs(b.vx) * 0.8; APU.sfx('TICK'); }
      if (b.y < 36) { b.y = 36; b.vy = Math.abs(b.vy) * 0.8; APU.sfx('TICK'); }
      if (b.y > 204) { b.y = 204; b.vy = -Math.abs(b.vy) * 0.8; APU.sfx('TICK'); }

      // Pocket check
      for (let p of this.pockets) {
        if (Math.hypot(b.x - p[0], b.y - p[1]) < 10) {
          if (b === this.cue) {
            // Scratch
            b.x = 60; b.y = 120; b.vx = 0; b.vy = 0;
            APU.sfx('HURT');
          } else {
            b.active = false;
            b.vx = 0; b.vy = 0;
            this.score++;
            APU.sfx('COIN');
            SAVE.setScore(this.id, this.score);
            if (this.balls.every(ob => !ob.active)) {
              this.won = true;
              APU.sfx('LEVELUP');
            }
          }
          break;
        }
      }
    }

    // Ball-ball elastic collisions
    for (let i = 0; i < allBalls.length; i++) {
      for (let j = i + 1; j < allBalls.length; j++) {
        const b1 = allBalls[i], b2 = allBalls[j];
        if (!b1.active || !b2.active) continue;
        const dx = b2.x - b1.x, dy = b2.y - b1.y;
        const dist = Math.hypot(dx, dy);
        if (dist < b1.r + b2.r && dist > 0.01) {
          const nx = dx / dist, ny = dy / dist;
          const overlap = (b1.r + b2.r) - dist;
          b1.x -= nx * overlap * 0.5;
          b1.y -= ny * overlap * 0.5;
          b2.x += nx * overlap * 0.5;
          b2.y += ny * overlap * 0.5;

          const kx = b1.vx - b2.vx, ky = b1.vy - b2.vy;
          const p = (nx * kx + ny * ky);
          if (p > 0) {
            b1.vx -= p * nx * 0.9;
            b1.vy -= p * ny * 0.9;
            b2.vx += p * nx * 0.9;
            b2.vy += p * ny * 0.9;
            APU.sfx('TICK');
          }
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("BILLIARDS 2D", 14, 12, 3);
    g.textR("POTTED: " + this.score + "/3", 244, 12, 3);

    // Table felt & cushions
    g.box(20, 30, 216, 180, 2);
    for (let p of this.pockets) g.disc(p[0], p[1], 8, 1);

    // Aim line
    const isMoving = [this.cue, ...this.balls].some(b => b.active && Math.hypot(b.vx, b.vy) > 4);
    if (!isMoving && !this.won) {
      g.line(this.cue.x, this.cue.y, this.cue.x + Math.cos(this.angle) * 36, this.cue.y + Math.sin(this.angle) * 36, 1);
    }

    // Cue ball
    if (this.cue.active) g.disc(Math.floor(this.cue.x), Math.floor(this.cue.y), this.cue.r, 3);
    // Object balls
    for (let b of this.balls) {
      if (b.active) g.disc(Math.floor(b.x), Math.floor(b.y), b.r, 2);
    }

    if (this.won) {
      g.dither(50, 90, 156, 44, 0, 1);
      g.box(50, 90, 156, 44, 3);
      g.textC("TABLE CLEARED!", 100, 3);
      g.textC("[A] PLAY AGAIN", 116, 2);
    }
  }
};
