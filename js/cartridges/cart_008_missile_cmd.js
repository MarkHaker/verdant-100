// js/cartridges/cart_008_missile_cmd.js
// ============================================================================
// Cartridge #008: MISSILE CMD
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 8. MISSILE COMMAND
CARTS[8] = {
  id: 8, name: "MISSILE CMD", genre: 0, scoreLabel: "INTERCEPTS",
  desc: "AIM RETICLE AND DETONATE FLAK SHELLS TO INTERCEPT INCOMING WARHEADS.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 4, y + 4, x + 16, y + 20, 2);
    g.disc(x + 16, y + 20, 6, 3);
    g.rect(x + 12, y + 25, 8, 5, 2);
  },
  init() {
    this.crossX = 128; this.crossY = 100;
    this.missiles = [];
    this.explosions = [];
    this.cities = [40, 80, 120, 160, 200];
    this.score = 0;
    this.over = false;
    this.spawnTimer = 0;
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    // Reticle movement
    const spd = 160;
    if (PAD.state.left) this.crossX = Math.max(10, this.crossX - spd * dt);
    if (PAD.state.right) this.crossX = Math.min(246, this.crossX + spd * dt);
    if (PAD.state.up) this.crossY = Math.max(10, this.crossY - spd * dt);
    if (PAD.state.down) this.crossY = Math.min(210, this.crossY + spd * dt);

    // Fire flak
    if (PAD.hit('a')) {
      this.explosions.push({ x: this.crossX, y: this.crossY, r: 2, maxR: 22, grow: true });
      APU.sfx('BOOM');
      PAD.vibrate(12);
    }

    // Spawn incoming ICBMs
    this.spawnTimer += dt;
    if (this.spawnTimer > 1.2) {
      this.spawnTimer = 0;
      this.missiles.push({
        sx: Math.random() * 256, sy: 0,
        tx: this.cities[Math.floor(Math.random() * this.cities.length)], ty: 220,
        progress: 0, speed: 0.15 + Math.random() * 0.15
      });
    }

    // Explosions update
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const e = this.explosions[i];
      if (e.grow) {
        e.r += 60 * dt;
        if (e.r >= e.maxR) e.grow = false;
      } else {
        e.r -= 30 * dt;
        if (e.r <= 0) this.explosions.splice(i, 1);
      }
    }

    // Missiles update
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      m.progress += m.speed * dt;
      const curX = m.sx + (m.tx - m.sx) * m.progress;
      const curY = m.sy + (m.ty - m.sy) * m.progress;

      // Interception check
      let hit = false;
      for (let e of this.explosions) {
        if (Math.hypot(curX - e.x, curY - e.y) < e.r) {
          hit = true; break;
        }
      }
      if (hit) {
        this.missiles.splice(i, 1);
        this.score++;
        APU.sfx('COIN');
      } else if (m.progress >= 1.0) {
        // Hit ground / city
        this.missiles.splice(i, 1);
        APU.sfx('BOOM');
        const cityIdx = this.cities.indexOf(m.tx);
        if (cityIdx >= 0) this.cities.splice(cityIdx, 1);
        if (this.cities.length === 0) {
          this.over = true;
          SAVE.setScore(this.id, this.score);
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    // Ground & Cities
    g.rect(0, 224, 256, 16, 1);
    for (let cx of this.cities) g.rect(cx - 6, 218, 12, 6, 2);

    // Missiles
    for (let m of this.missiles) {
      const curX = m.sx + (m.tx - m.sx) * m.progress;
      const curY = m.sy + (m.ty - m.sy) * m.progress;
      g.line(m.sx, m.sy, curX, curY, 2);
      g.disc(Math.floor(curX), Math.floor(curY), 2, 3);
    }

    // Explosions
    for (let e of this.explosions) g.disc(Math.floor(e.x), Math.floor(e.y), Math.floor(e.r), 3);

    // Crosshair reticle
    const rx = Math.floor(this.crossX), ry = Math.floor(this.crossY);
    g.line(rx - 6, ry, rx + 6, ry, 3);
    g.line(rx, ry - 6, rx, ry + 6, 3);

    g.text("SCORE: " + this.score, 12, 12, 3);
    g.textR("CITIES: " + this.cities.length, 244, 12, 2);

    if (this.over) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("ALL CITIES FALLEN", 110, 3);
      g.textC("[A] TO RETRY", 124, 2);
    }
  }
};
