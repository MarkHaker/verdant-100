// js/cartridges/cart_007_lunar_lander.js
// ============================================================================
// Cartridge #007: LUNAR LANDER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 7. LUNAR LANDER
CARTS[7] = {
  id: 7, name: "LUNAR LANDER", genre: 0, scoreLabel: "FUEL",
  desc: "LAND GENTLY ON DESIGNATED PAD (VERTICAL SPEED < 1.0, ROTATION < 15 DEG).",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 11, y + 10, 10, 8, 3);
    g.line(x + 8, y + 22, x + 13, y + 18, 2);
    g.line(x + 24, y + 22, x + 19, y + 18, 2);
    g.line(x + 4, y + 26, x + 28, y + 26, 3);
  },
  init() {
    this.x = 40; this.y = 30;
    this.vx = 20; this.vy = 0;
    this.angle = 0;
    this.fuel = 450;
    this.landed = false;
    this.over = false;
    this.padX = 140; this.padW = 40;
  },
  update(dt) {
    if (this.over || this.landed) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    // Controls
    if (PAD.state.left) this.angle -= 2.0 * dt;
    if (PAD.state.right) this.angle += 2.0 * dt;
    const thrusting = (PAD.state.a || PAD.state.up) && this.fuel > 0;
    this.thrusting = thrusting;
    if (thrusting) {
      this.vx += Math.sin(this.angle) * 70 * dt;
      this.vy -= Math.cos(this.angle) * 70 * dt;
      this.fuel = Math.max(0, this.fuel - 100 * dt);
      if (Math.random() < 0.25) APU.sfx('SWISH');
    }

    // Lunar gravity
    this.vy += 28 * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Boundaries
    if (this.x < 8) { this.x = 8; this.vx = Math.abs(this.vx) * 0.5; }
    if (this.x > 248) { this.x = 248; this.vx = -Math.abs(this.vx) * 0.5; }
    if (this.y < 8) { this.y = 8; this.vy = Math.max(0, this.vy); }

    // Ground collision
    if (this.y >= 210) {
      this.y = 210;
      const onPad = (this.x >= this.padX && this.x <= this.padX + this.padW);
      const safeSpeed = (this.vy < 35 && Math.abs(this.vx) < 20);
      const safeAngle = Math.abs(this.angle) < 0.25;

      if (onPad && safeSpeed && safeAngle) {
        this.landed = true;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, Math.floor(this.fuel));
      } else {
        this.over = true;
        APU.sfx('BOOM');
      }
    }
  },
  render(g) {
    g.clear(0);
    // Lunar terrain & Landing pad
    g.line(0, 220, 256, 220, 1);
    g.rect(this.padX, 218, this.padW, 4, 3);
    g.text("PAD", this.padX + 12, 226, 3);

    // Lander capsule
    const lx = Math.floor(this.x), ly = Math.floor(this.y);
    g.rect(lx - 5, ly - 5, 10, 8, 3);
    g.line(lx - 6, ly + 6, lx - 3, ly + 3, 2);
    g.line(lx + 6, ly + 6, lx + 3, ly + 3, 2);

    // Thrust flame
    if (this.thrusting && !this.over && !this.landed) {
      g.line(lx, ly + 4, lx - Math.sin(this.angle) * 8, ly + Math.cos(this.angle) * 8, 3);
    }

    // Telemetry
    g.text("FUEL: " + Math.floor(this.fuel), 12, 12, 3);
    g.text("V-SPD: " + Math.floor(this.vy), 12, 22, this.vy < 35 ? 2 : 3);
    g.textR("PAD DIST: " + Math.floor(Math.abs(this.x - (this.padX + 20))), 244, 12, 2);

    if (this.landed) {
      g.dither(64, 80, 128, 44, 0, 1);
      g.box(64, 80, 128, 44, 3);
      g.textC("TOUCHDOWN SUCCESS!", 90, 3);
      g.textC("SCORE: " + Math.floor(this.fuel), 104, 2);
    } else if (this.over) {
      g.dither(64, 80, 128, 44, 0, 1);
      g.box(64, 80, 128, 44, 3);
      g.textC("LANDER DESTROYED", 90, 3);
      g.textC("[A] TO RETRY", 104, 2);
    }
  }
};
