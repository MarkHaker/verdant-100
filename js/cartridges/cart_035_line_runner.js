// js/cartridges/cart_035_line_runner.js
// ============================================================================
// Cartridge #035: LINE RUNNER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 35. LINE RUNNER
CARTS[35] = {
  id: 35, name: "LINE RUNNER", genre: 3, scoreLabel: "METERS",
  desc: "ENDLESS DASH: [A] JUMP OVER SPIKES, [B] SLIDE UNDER OVERHEAD BLOCKS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 4, y + 24, x + 28, y + 24, 2);
    g.disc(x + 12, y + 18, 3, 3);
    g.tri(x + 22, y + 24, x + 26, y + 16, x + 30, y + 24, 3);
  },
  init() {
    this.py = 180; this.vy = 0;
    this.sliding = false;
    this.obstacles = [];
    this.dist = 0;
    this.spawnTimer = 1.0;
    this.over = false;
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start')) this.init();
      return;
    }
    this.dist += 70 * dt;
    if ((PAD.hit('a') || PAD.hit('up') || PAD.swipe === 'up') && this.py >= 179) {
      this.vy = -150;
      APU.sfx('JUMP');
    }
    this.sliding = PAD.state.b || PAD.state.down || PAD.swipe === 'down';

    this.vy += 340 * dt;
    this.py = Math.min(180, this.py + this.vy * dt);

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 1.0 + Math.random() * 1.2;
      this.obstacles.push({ x: 260, high: Math.random() < 0.5 });
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      o.x -= 140 * dt;
      if (o.x < 48 && o.x + 12 > 40) {
        if (!o.high && this.py >= 168) {
          this.over = true;
          APU.sfx('BOOM');
          SAVE.setScore(this.id, Math.floor(this.dist));
        }
        if (o.high && !this.sliding) {
          this.over = true;
          APU.sfx('BOOM');
          SAVE.setScore(this.id, Math.floor(this.dist));
        }
      }
      if (o.x < -20) this.obstacles.splice(i, 1);
    }
  },
  render(g) {
    g.clear(0);
    g.line(0, 186, 256, 186, 2);
    // Runner
    if (this.sliding) {
      g.rect(40, 178, 16, 8, 3);
      g.rect(42, 180, 12, 4, 2);
    } else {
      g.rect(40, Math.floor(this.py) - 14, 8, 14, 3);
      g.disc(44, Math.floor(this.py) - 17, 3, 3);
    }

    for (let o of this.obstacles) {
      if (o.high) {
        g.rect(Math.floor(o.x), 154, 14, 16, 2);
        g.box(Math.floor(o.x), 154, 14, 16, 3);
      } else {
        g.tri(Math.floor(o.x), 186, Math.floor(o.x) + 7, 168, Math.floor(o.x) + 14, 186, 3);
      }
    }
    g.text("DIST: " + Math.floor(this.dist) + "M", 14, 14, 3);
    if (this.over) {
      g.rect(48, 85, 160, 60, 0);
      g.box(48, 85, 160, 60, 3);
      g.textC("RUNNER CRASHED!", 98, 1);
      g.textC("DISTANCE: " + Math.floor(this.dist) + " M", 114, 3);
      g.textC("PRESS [A] TO RETRY", 130, 2);
    }
  }
};
