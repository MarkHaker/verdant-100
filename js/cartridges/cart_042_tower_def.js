// js/cartridges/cart_042_tower_def.js
// ============================================================================
// Cartridge #042: TOWER DEF
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 42. TOWER DEFENSE
CARTS[42] = {
  id: 42, name: "TOWER DEF", genre: 4, scoreLabel: "WAVES",
  desc: "PLACE DEFENSE TURRETS ALONG PATHWAY TO ANNIHILATE MARCHING INVADERS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 12, y + 10, 8, 14, 3);
    g.line(x + 16, y + 6, x + 16, y + 10, 3);
  },
  init() {
    this.towers = [{ x: 100, y: 90, range: 45 }];
    this.creeps = [];
    this.wave = 1;
    this.cash = 100;
    this.timer = 0;
  },
  update(dt) {
    this.timer += dt;
    if (this.timer > 1.5) {
      this.timer = 0;
      this.creeps.push({ x: 0, y: 120, hp: 3, maxHp: 3 });
    }
    for (let i = this.creeps.length - 1; i >= 0; i--) {
      const c = this.creeps[i];
      c.x += 35 * dt;
      // Tower attack
      for (let t of this.towers) {
        if (Math.hypot(c.x - t.x, c.y - t.y) < t.range) {
          c.hp -= 2 * dt;
          if (Math.random() < 0.1) APU.sfx('TICK');
        }
      }
      if (c.hp <= 0) {
        this.creeps.splice(i, 1);
        this.cash += 10;
        APU.sfx('COIN');
      } else if (c.x > 256) {
        this.creeps.splice(i, 1);
        APU.sfx('HURT');
      }
    }
    if (PAD.hit('a') && this.cash >= 50) {
      this.cash -= 50;
      this.towers.push({ x: Math.random() * 180 + 30, y: Math.random() * 80 + 40, range: 45 });
      APU.sfx('POWER');
    }
  },
  render(g) {
    g.clear(0);
    g.line(0, 120, 256, 120, 2);
    for (let t of this.towers) {
      g.rect(t.x - 6, t.y - 6, 12, 12, 3);
      g.circle(t.x, t.y, t.range, 1);
    }
    for (let c of this.creeps) {
      g.disc(Math.floor(c.x), Math.floor(c.y), 4, 2);
    }
    g.text("CASH: $" + this.cash + "  [A] BUY TOWER ($50)", 14, 14, 3);
  }
};
