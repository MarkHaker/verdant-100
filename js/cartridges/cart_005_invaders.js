// js/cartridges/cart_005_invaders.js
// ============================================================================
// Cartridge #005: INVADERS
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 5. SPACE INVADERS
CARTS[5] = {
  id: 5, name: "INVADERS", genre: 0, scoreLabel: "KILLS",
  desc: "DEFEND EARTH FROM 5X11 INVASION FLEET. HIDE BEHIND BUNKER SHIELDS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    // Alien sprite
    g.rect(x + 10, y + 10, 12, 8, 3);
    g.rect(x + 8, y + 14, 16, 4, 3);
    g.rect(x + 12, y + 18, 8, 4, 2);
  },
  init() {
    this.px = 120;
    this.bullet = null;
    this.enemyBullets = [];
    this.aliens = [];
    this.wave = 1;
    this.spawnFleet();
    this.fleetDir = 1;
    this.fleetTimer = 0;
    this.fleetSpeed = 0.6;
    this.score = 0;
    this.over = false;
  },
  spawnFleet() {
    this.aliens = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 10; c++) {
        this.aliens.push({ x: 20 + c * 18, y: 30 + r * 14, alive: true });
      }
    }
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    if (PAD.state.left) this.px = Math.max(12, this.px - 140 * dt);
    if (PAD.state.right) this.px = Math.min(236, this.px + 140 * dt);

    // Player fire
    if (PAD.hit('a') && !this.bullet) {
      this.bullet = { x: this.px + 4, y: 216 };
      APU.sfx('SWISH');
    }

    // Bullet update
    if (this.bullet) {
      this.bullet.y -= 260 * dt;
      if (this.bullet.y < 10) this.bullet = null;
      else {
        // Alien hit check
        for (let a of this.aliens) {
          if (a.alive && Math.abs(this.bullet.x - a.x) < 8 && Math.abs(this.bullet.y - a.y) < 6) {
            a.alive = false;
            this.bullet = null;
            this.score++;
            APU.sfx('BOOM');
            break;
          }
        }
      }
    }

    // Next wave check
    if (this.aliens.every(a => !a.alive)) {
      this.wave++;
      this.score += 50;
      APU.sfx('LEVELUP');
      this.spawnFleet();
      this.fleetDir = 1;
      this.fleetSpeed = Math.max(0.12, 0.6 - (this.wave - 1) * 0.08);
      this.enemyBullets = [];
      return;
    }

    // Enemy bullets firing
    const living = this.aliens.filter(a => a.alive);
    if (living.length > 0 && Math.random() < 0.02 + this.wave * 0.008) {
      const shooter = living[Math.floor(Math.random() * living.length)];
      this.enemyBullets.push({ x: shooter.x, y: shooter.y + 6 });
    }

    // Enemy bullets update
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const eb = this.enemyBullets[i];
      eb.y += 130 * dt;
      if (eb.y > 235) {
        this.enemyBullets.splice(i, 1);
      } else if (Math.abs(eb.x - (this.px + 5)) < 7 && eb.y >= 216 && eb.y <= 228) {
        this.over = true;
        APU.sfx('BOOM');
        SAVE.setScore(this.id, this.score);
        return;
      }
    }

    // Fleet movement
    this.fleetTimer += dt;
    if (this.fleetTimer >= this.fleetSpeed) {
      this.fleetTimer = 0;
      let hitEdge = false;
      for (let a of this.aliens) {
        if (a.alive && ((this.fleetDir > 0 && a.x > 230) || (this.fleetDir < 0 && a.x < 16))) {
          hitEdge = true; break;
        }
      }
      if (hitEdge) {
        this.fleetDir = -this.fleetDir;
        for (let a of this.aliens) a.y += 8;
        this.fleetSpeed = Math.max(0.12, this.fleetSpeed - 0.04);
      } else {
        for (let a of this.aliens) a.x += this.fleetDir * 6;
      }
      APU.sfx('TICK');
    }

    // Alien descent defeat check
    for (let a of this.aliens) {
      if (a.alive && a.y >= 210) {
        this.over = true;
        APU.sfx('BOOM');
        SAVE.setScore(this.id, this.score);
        break;
      }
    }
  },
  render(g) {
    g.clear(0);
    // Player cannon
    g.rect(Math.floor(this.px), 220, 10, 8, 3);
    g.rect(Math.floor(this.px) + 4, 216, 2, 4, 3);

    // Player bullet
    if (this.bullet) g.rect(Math.floor(this.bullet.x), Math.floor(this.bullet.y), 2, 6, 3);

    // Enemy bullets
    for (let eb of this.enemyBullets) g.rect(Math.floor(eb.x), Math.floor(eb.y), 2, 5, 2);

    // Aliens
    for (let a of this.aliens) {
      if (a.alive) {
        const ax = Math.floor(a.x), ay = Math.floor(a.y);
        g.rect(ax - 5, ay - 4, 10, 8, 2);
        g.rect(ax - 3, ay - 2, 6, 4, 3);
      }
    }

    g.text("SCORE: " + this.score, 12, 10, 3);
    g.textR("WAVE: " + this.wave, 244, 10, 2);

    if (this.over) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("FLEET LANDED!", 110, 3);
      g.textC("[A] TO RETRY", 124, 2);
    }
  }
};
