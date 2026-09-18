// js/cartridges/cart_038_downwell.js
// ============================================================================
// Cartridge #038: DOWNWELL
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 38. DOWNWELL DESCENT
CARTS[38] = {
  id: 38, name: "DOWNWELL", genre: 3, scoreLabel: "DEPTH",
  desc: "FALL DOWN INFINITE WELL: [A] FIRES GUNBOOTS DOWNWARD FOR LIFT & BLASTS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 12, 4, 3);
    g.line(x + 14, y + 18, x + 14, y + 26, 3);
    g.line(x + 18, y + 18, x + 18, y + 26, 3);
  },
  init() {
    this.px = 128; this.py = 40;
    this.vx = 0; this.vy = 80;
    this.depth = 0;
    this.ammo = 8;
    this.hp = 3;
    this.invuln = 0;
    this.bullets = [];
    this.plats = [
      { x: 40, y: 120, w: 60, h: 6 },
      { x: 150, y: 170, w: 60, h: 6 },
      { x: 80, y: 220, w: 80, h: 6 }
    ];
    this.enemies = [
      { x: 100, y: 190, vx: 30, alive: true }
    ];
    this.over = false;
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start')) this.init();
      return;
    }
    if (this.invuln > 0) this.invuln -= dt;

    if (PAD.state.left) this.vx = -100;
    else if (PAD.state.right) this.vx = 100;
    else this.vx = 0;

    if (PAD.hit('a') && this.ammo > 0) {
      this.vy = -100;
      this.ammo--;
      APU.sfx('HIT');
      this.bullets.push({ x: this.px - 3, y: this.py + 6, vy: 260 });
      this.bullets.push({ x: this.px + 3, y: this.py + 6, vy: 260 });
    }

    this.vy += 300 * dt;
    this.px += this.vx * dt;
    this.px = Math.max(32, Math.min(224, this.px));
    this.py += this.vy * dt;

    if (this.py > 120) {
      const drop = this.py - 120;
      this.py = 120;
      this.depth += drop * 0.2;
      for (let pl of this.plats) pl.y -= drop;
      for (let e of this.enemies) e.y -= drop;
      for (let b of this.bullets) b.y -= drop;
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.y += b.vy * dt;
      if (b.y > 240) { this.bullets.splice(i, 1); continue; }
      for (let e of this.enemies) {
        if (e.alive && Math.abs(b.x - e.x) < 10 && Math.abs(b.y - e.y) < 10) {
          e.alive = false;
          this.bullets.splice(i, 1);
          APU.sfx('COIN');
          break;
        }
      }
    }

    for (let pl of this.plats) {
      if (this.vy > 0 && this.px >= pl.x - 4 && this.px <= pl.x + pl.w + 4 &&
          this.py >= pl.y - 6 && this.py <= pl.y + 4) {
        this.py = pl.y - 6;
        this.vy = 0;
        this.ammo = 8;
      }
    }

    for (let i = this.plats.length - 1; i >= 0; i--) {
      if (this.plats[i].y < -20) {
        this.plats.splice(i, 1);
      }
    }
    while (this.plats.length < 5) {
      const highest = Math.min(...this.plats.map(p => p.y), 200);
      const nw = 40 + Math.random() * 50;
      const nx = 30 + Math.random() * (190 - nw);
      const ny = highest + 50 + Math.random() * 30;
      this.plats.push({ x: nx, y: ny, w: nw, h: 6 });
      if (Math.random() < 0.6) {
        this.enemies.push({ x: nx + nw / 2, y: ny - 10, vx: (Math.random() < 0.5 ? 25 : -25), alive: true });
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.y < -20) { this.enemies.splice(i, 1); continue; }
      if (!e.alive) continue;

      e.x += e.vx * dt;
      if (e.x < 35 || e.x > 220) e.vx *= -1;

      if (Math.abs(this.px - e.x) < 10 && Math.abs(this.py - e.y) < 10) {
        if (this.vy > 20 && this.py < e.y) {
          e.alive = false;
          this.vy = -140;
          this.ammo = 8;
          APU.sfx('LEVELUP');
        } else if (this.invuln <= 0) {
          this.hp--;
          this.invuln = 1.0;
          APU.sfx('BOOM');
          if (this.hp <= 0) {
            this.over = true;
            SAVE.setScore(this.id, Math.floor(this.depth));
          }
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.rect(0, 0, 26, 240, 1);
    g.rect(230, 0, 26, 240, 1);
    for (let y = 0; y < 240; y += 16) {
      g.line(0, y, 26, y, 2);
      g.line(230, y, 256, y, 2);
    }

    for (let pl of this.plats) {
      g.rect(Math.floor(pl.x), Math.floor(pl.y), Math.floor(pl.w), Math.floor(pl.h), 2);
      g.box(Math.floor(pl.x), Math.floor(pl.y), Math.floor(pl.w), Math.floor(pl.h), 3);
    }

    for (let b of this.bullets) {
      g.line(Math.floor(b.x), Math.floor(b.y), Math.floor(b.x), Math.floor(b.y) + 4, 3);
    }

    for (let e of this.enemies) {
      if (!e.alive) continue;
      const ex = Math.floor(e.x);
      const ey = Math.floor(e.y);
      g.disc(ex, ey, 5, 2);
      g.tri(ex - 6, ey - 4, ex, ey - 7, ex + 6, ey - 4, 3);
    }

    if (this.invuln <= 0 || Math.floor(Date.now() / 80) % 2 === 0) {
      const px = Math.floor(this.px);
      const py = Math.floor(this.py);
      g.disc(px, py - 4, 4, 3);
      g.rect(px - 3, py - 1, 6, 7, 2);
      g.line(px - 2, py + 6, px - 2, py + 8, 3);
      g.line(px + 2, py + 6, px + 2, py + 8, 3);
    }

    g.text("DEPTH: " + Math.floor(this.depth) + "M", 34, 10, 3);
    g.text("HP: " + "♥".repeat(Math.max(0, this.hp)), 34, 20, 3);
    g.text("AMMO: " + "■".repeat(this.ammo), 34, 30, 2);

    if (this.over) {
      g.rect(48, 85, 160, 60, 0);
      g.box(48, 85, 160, 60, 3);
      g.textC("FELL IN BATTLE!", 98, 1);
      g.textC("DEPTH REACHED: " + Math.floor(this.depth) + " M", 114, 3);
      g.textC("PRESS [A] TO RETRY", 130, 2);
    }
  }
};
