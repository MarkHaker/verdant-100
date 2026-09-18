// js/cartridges/cart_006_asteroids.js
// ============================================================================
// Cartridge #006: ASTEROIDS
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 6. ASTEROIDS
CARTS[6] = {
  id: 6, name: "ASTEROIDS", genre: 0, scoreLabel: "ROCKS",
  desc: "PILOT SHIP WITH ROTATION & THRUST. BLAST ASTEROIDS INTO SMALL FRAGMENTS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.tri(x + 16, y + 8, x + 10, y + 24, x + 22, y + 24, 3);
    g.circle(x + 8, y + 8, 4, 2);
    g.circle(x + 24, y + 16, 5, 2);
  },
  init() {
    this.ship = { x: 128, y: 120, angle: -Math.PI / 2, vx: 0, vy: 0 };
    this.bullets = [];
    this.rocks = [];
    this.wave = 1;
    this.spawnRocks();
    this.score = 0;
    this.over = false;
  },
  spawnRocks() {
    const count = 3 + this.wave;
    for (let i = 0; i < count; i++) {
      let rx, ry;
      do {
        rx = Math.random() * 256;
        ry = Math.random() * 240;
      } while (Math.hypot(rx - 128, ry - 120) < 60);
      const spd = 30 + this.wave * 8;
      this.rocks.push({
        x: rx, y: ry,
        vx: (Math.random() - 0.5) * spd, vy: (Math.random() - 0.5) * spd,
        r: 14, size: 3
      });
    }
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    // Ship steering
    if (PAD.state.left) this.ship.angle -= 3.5 * dt;
    if (PAD.state.right) this.ship.angle += 3.5 * dt;
    if (PAD.state.up) {
      this.ship.vx += Math.cos(this.ship.angle) * 120 * dt;
      this.ship.vy += Math.sin(this.ship.angle) * 120 * dt;
      if (Math.random() < 0.2) APU.sfx('SWISH');
    }
    // Damping & wrapping
    this.ship.vx *= 0.99; this.ship.vy *= 0.99;
    this.ship.x = (this.ship.x + this.ship.vx * dt + 256) % 256;
    this.ship.y = (this.ship.y + this.ship.vy * dt + 240) % 240;

    // Bullet fire
    if (PAD.hit('a')) {
      this.bullets.push({
        x: this.ship.x, y: this.ship.y,
        vx: Math.cos(this.ship.angle) * 220, vy: Math.sin(this.ship.angle) * 220,
        life: 1.0
      });
      APU.sfx('TICK');
    }

    // Bullets update
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x = (b.x + b.vx * dt + 256) % 256;
      b.y = (b.y + b.vy * dt + 240) % 240;
      b.life -= dt;
      if (b.life <= 0) this.bullets.splice(i, 1);
    }

    // Next wave check
    if (this.rocks.length === 0) {
      this.wave++;
      this.score += 50;
      APU.sfx('LEVELUP');
      this.spawnRocks();
      return;
    }

    // Rocks update & collision
    for (let i = this.rocks.length - 1; i >= 0; i--) {
      const r = this.rocks[i];
      r.x = (r.x + r.vx * dt + 256) % 256;
      r.y = (r.y + r.vy * dt + 240) % 240;

      // Ship collision
      const sDist = Math.hypot(this.ship.x - r.x, this.ship.y - r.y);
      if (sDist < r.r + 4) {
        this.over = true;
        APU.sfx('BOOM');
        SAVE.setScore(this.id, this.score);
        return;
      }

      // Bullet collision
      for (let j = this.bullets.length - 1; j >= 0; j--) {
        const b = this.bullets[j];
        if (Math.hypot(b.x - r.x, b.y - r.y) < r.r) {
          this.bullets.splice(j, 1);
          this.score++;
          APU.sfx('HIT');
          if (r.size > 1) {
            this.rocks.push({
              x: r.x, y: r.y,
              vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60,
              r: r.r * 0.6, size: r.size - 1
            });
            r.r *= 0.6; r.size -= 1;
          } else {
            this.rocks.splice(i, 1);
          }
          break;
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    // Ship
    const s = this.ship;
    const x0 = s.x + Math.cos(s.angle) * 8;
    const y0 = s.y + Math.sin(s.angle) * 8;
    const x1 = s.x + Math.cos(s.angle + 2.4) * 6;
    const y1 = s.y + Math.sin(s.angle + 2.4) * 6;
    const x2 = s.x + Math.cos(s.angle - 2.4) * 6;
    const y2 = s.y + Math.sin(s.angle - 2.4) * 6;
    g.tri(x0, y0, x1, y1, x2, y2, 3);

    // Bullets
    for (let b of this.bullets) g.disc(Math.floor(b.x), Math.floor(b.y), 2, 3);

    // Rocks
    for (let r of this.rocks) g.circle(Math.floor(r.x), Math.floor(r.y), Math.floor(r.r), 2);

    g.text("SCORE: " + this.score, 12, 12, 3);
    if (this.over) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("CRASHED!", 110, 3);
      g.textC("[A] TO RETRY", 124, 2);
    }
  }
};
