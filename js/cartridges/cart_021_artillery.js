// js/cartridges/cart_021_artillery.js
// ============================================================================
// Cartridge #021: ARTILLERY
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 21. ARTILLERY
CARTS[21] = {
  id: 21, name: "ARTILLERY", genre: 2, scoreLabel: "WINS",
  desc: "AIM CANNON ANGLE & POWER TO SHELL ENEMY TANK IN VARYING CROSSWINDS.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 4, y + 20, 10, 6, 3);
    g.line(x + 9, y + 20, x + 16, y + 14, 3);
  },
  init() {
    this.angle = 45; this.power = 60;
    this.wind = (Math.random() - 0.5) * 40;
    this.px = 30;
    this.tx = Math.floor(Math.random() * 70) + 170;
    this.shot = null;
    this.enemyShot = null;
    this.turn = 'PLAYER'; // 'PLAYER', 'ENEMY', 'OVER'
    this.score = 0;
    this.won = false;
    this.over = false;
  },
  fireEnemy() {
    this.turn = 'ENEMY';
    const dist = this.tx - this.px;
    // Approximated ballistic calculation with error
    const estPwr = Math.min(100, Math.max(30, Math.sqrt(dist * 65) + (Math.random() - 0.5) * 20));
    const rad = (135 * Math.PI) / 180;
    this.enemyShot = {
      x: this.tx - 8, y: 210,
      vx: Math.cos(rad) * estPwr * 2.2,
      vy: -Math.sin(rad) * estPwr * 2.2
    };
    APU.sfx('BOOM');
  },
  update(dt) {
    if (this.won || this.over) {
      if (PAD.hit('a') || PAD.hit('start')) {
        if (this.won) {
          this.won = false;
          this.tx = Math.floor(Math.random() * 70) + 170;
          this.wind = (Math.random() - 0.5) * 50;
          this.turn = 'PLAYER';
        } else {
          this.init();
        }
      }
      return;
    }

    if (this.turn === 'PLAYER') {
      if (PAD.state.left) this.angle = Math.min(85, this.angle + 20 * dt);
      if (PAD.state.right) this.angle = Math.max(15, this.angle - 20 * dt);
      if (PAD.state.up) this.power = Math.min(100, this.power + 30 * dt);
      if (PAD.state.down) this.power = Math.max(20, this.power - 30 * dt);

      if (PAD.hit('a') && !this.shot) {
        const rad = (this.angle * Math.PI) / 180;
        this.shot = {
          x: this.px + 8, y: 210,
          vx: Math.cos(rad) * this.power * 2.2,
          vy: -Math.sin(rad) * this.power * 2.2
        };
        APU.sfx('BOOM');
      }

      if (this.shot) {
        this.shot.vx += this.wind * dt;
        this.shot.vy += 120 * dt;
        this.shot.x += this.shot.vx * dt;
        this.shot.y += this.shot.vy * dt;

        if (Math.abs(this.shot.x - this.tx) < 14 && this.shot.y >= 210) {
          this.score++;
          this.won = true;
          this.shot = null;
          APU.sfx('LEVELUP');
          SAVE.setScore(this.id, this.score);
        } else if (this.shot.y > 220 || this.shot.x > 260 || this.shot.x < 0) {
          this.shot = null;
          APU.sfx('HIT');
          this.wind = (Math.random() - 0.5) * 50;
          this.fireEnemy();
        }
      }
    } else if (this.turn === 'ENEMY') {
      if (this.enemyShot) {
        this.enemyShot.vx += this.wind * dt;
        this.enemyShot.vy += 120 * dt;
        this.enemyShot.x += this.enemyShot.vx * dt;
        this.enemyShot.y += this.enemyShot.vy * dt;

        if (Math.abs(this.enemyShot.x - this.px) < 14 && this.enemyShot.y >= 210) {
          this.over = true;
          this.enemyShot = null;
          APU.sfx('BOOM');
        } else if (this.enemyShot.y > 220 || this.enemyShot.x > 260 || this.enemyShot.x < 0) {
          this.enemyShot = null;
          APU.sfx('HIT');
          this.turn = 'PLAYER';
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.line(0, 220, 256, 220, 1);
    // Tanks
    g.rect(this.px - 6, 214, 12, 6, 3);
    g.rect(this.tx - 6, 214, 12, 6, 2);

    // Player Barrel
    const rad = (this.angle * Math.PI) / 180;
    g.line(this.px, 214, this.px + Math.cos(rad) * 12, 214 - Math.sin(rad) * 12, 3);

    // Enemy Barrel
    g.line(this.tx, 214, this.tx - 8, 206, 2);

    // Shells
    if (this.shot) g.disc(Math.floor(this.shot.x), Math.floor(this.shot.y), 2, 3);
    if (this.enemyShot) g.disc(Math.floor(this.enemyShot.x), Math.floor(this.enemyShot.y), 2, 2);

    // HUD
    g.text("ANG: " + Math.floor(this.angle) + "° PWR: " + Math.floor(this.power), 12, 14, 3);
    g.textR("WINS: " + this.score, 244, 14, 3);
    g.text("WIND: " + (this.wind > 0 ? "▶ " : "◀ ") + Math.floor(Math.abs(this.wind)), 12, 26, 2);

    if (this.won) {
      g.dither(50, 90, 156, 44, 0, 1);
      g.box(50, 90, 156, 44, 3);
      g.textC("DIRECT HIT! TANK DESTROYED", 100, 3);
      g.textC("[A] NEXT ROUND", 116, 2);
    } else if (this.over) {
      g.dither(50, 90, 156, 44, 0, 1);
      g.box(50, 90, 156, 44, 3);
      g.textC("YOUR TANK WAS HIT!", 100, 3);
      g.textC("[A] TO RETRY", 116, 2);
    }
  }
};
