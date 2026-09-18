// js/cartridges/cart_009_frogger.js
// ============================================================================
// Cartridge #009: FROGGER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 9. FROGGER
CARTS[9] = {
  id: 9, name: "FROGGER", genre: 0, scoreLabel: "SAVED",
  desc: "NAVIGATE LANES OF HIGHWAY TRAFFIC AND RIVER LOGS INTO GOAL HOMES.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 12, y + 14, 8, 8, 3);
    g.rect(x + 8, y + 10, 4, 4, 3);
    g.rect(x + 20, y + 10, 4, 4, 3);
    g.rect(x + 8, y + 20, 4, 4, 2);
    g.rect(x + 20, y + 20, 4, 4, 2);
  },
  init() {
    this.fx = 120; this.fy = 216;
    this.score = 0;
    this.lives = 3;
    this.over = false;
    this.homes = [false, false, false, false, false];
    this.cars = [
      { y: 192, speed: -60, len: 24, x: 50 },
      { y: 168, speed: 75,  len: 30, x: 120 },
      { y: 144, speed: -90, len: 20, x: 200 }
    ];
    this.logs = [
      { y: 96, speed: 45,  len: 40, x: 30 },
      { y: 72, speed: -50, len: 50, x: 150 },
      { y: 48, speed: 60,  len: 45, x: 80 }
    ];
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    // Frog hop
    const step = 24;
    if (PAD.hit('up')) { this.fy -= step; APU.sfx('JUMP'); }
    if (PAD.hit('down') && this.fy < 216) { this.fy += step; APU.sfx('JUMP'); }
    if (PAD.hit('left')) { this.fx = Math.max(10, this.fx - step); APU.sfx('JUMP'); }
    if (PAD.hit('right')) { this.fx = Math.min(236, this.fx + step); APU.sfx('JUMP'); }

    // Cars update
    for (let c of this.cars) {
      c.x += c.speed * dt;
      if (c.speed > 0 && c.x > 260) c.x = -c.len;
      if (c.speed < 0 && c.x < -c.len) c.x = 260;

      // Frog car hit
      if (Math.abs(this.fy - c.y) < 12 && this.fx >= c.x && this.fx <= c.x + c.len) {
        this.die(); return;
      }
    }

    // Logs update
    let onLog = false;
    for (let l of this.logs) {
      l.x += l.speed * dt;
      if (l.speed > 0 && l.x > 260) l.x = -l.len;
      if (l.speed < 0 && l.x < -l.len) l.x = 260;

      if (Math.abs(this.fy - l.y) < 12 && this.fx >= l.x && this.fx <= l.x + l.len) {
        onLog = true;
        this.fx += l.speed * dt;
      }
    }

    // River drowning check & off-screen log check
    if (this.fx < -10 || this.fx > 254) {
      this.die(); return;
    }
    if (this.fy <= 96 && this.fy >= 48 && !onLog) {
      this.die(); return;
    }

    // Homes check
    if (this.fy < 36) {
      let matchedHome = -1;
      const frogCenterX = this.fx + 6;
      for (let i = 0; i < 5; i++) {
        const hx = 26 + i * 44;
        if (frogCenterX >= hx + 2 && frogCenterX <= hx + 18) {
          matchedHome = i;
          break;
        }
      }
      if (matchedHome >= 0 && !this.homes[matchedHome]) {
        this.homes[matchedHome] = true;
        this.score++;
        APU.sfx('LEVELUP');
        this.fx = 120; this.fy = 216;
        if (this.homes.every(Boolean)) {
          this.homes.fill(false);
          this.score += 5;
        }
      } else {
        this.die();
      }
    }
  },
  die() {
    this.lives--;
    APU.sfx('SPLASH');
    this.fx = 120; this.fy = 216;
    if (this.lives <= 0) {
      this.over = true;
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    // River & Road backgrounds
    g.dither(0, 36, 256, 80, 0, 1); // River
    g.rect(0, 132, 256, 80, 1);    // Highway

    // Homes
    for (let i = 0; i < 5; i++) {
      const hx = 26 + i * 44;
      g.box(hx, 14, 20, 18, 2);
      if (this.homes[i]) g.text("♥", hx + 5, 20, 3);
    }

    // Logs
    for (let l of this.logs) g.rect(Math.floor(l.x), l.y, l.len, 14, 2);

    // Cars
    for (let c of this.cars) g.rect(Math.floor(c.x), c.y, c.len, 14, 3);

    // Frog
    g.disc(Math.floor(this.fx) + 6, Math.floor(this.fy) + 6, 5, 3);

    // HUD
    g.text("FROGS: " + this.score, 12, 4, 3);
    g.textR("LIVES: " + "▲".repeat(Math.max(0, this.lives)), 244, 4, 3);

    if (this.over) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("ALL FROGS LOST", 110, 3);
      g.textC("[A] TO RETRY", 124, 2);
    }
  }
};
