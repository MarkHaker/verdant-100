// js/cartridges/cart_036_doodle_jump.js
// ============================================================================
// Cartridge #036: DOODLE JUMP
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 36. DOODLE JUMP
CARTS[36] = {
  id: 36, name: "DOODLE JUMP", genre: 3, scoreLabel: "HEIGHT",
  desc: "BOUNCE UP PROCEDURAL PLATFORMS. STEER LEFT/RIGHT WITH D-PAD OR TILT!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 10, y + 20, 14, 3, 2);
    g.disc(x + 16, y + 12, 4, 3);
  },
  init() {
    this.px = 128; this.py = 180;
    this.vy = -220;
    this.score = 0;
    this.over = false;
    this.plats = [
      { x: 110, y: 210 },
      { x: 70, y: 160 },
      { x: 140, y: 115 },
      { x: 60, y: 70 },
      { x: 130, y: 25 }
    ];
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start')) this.init();
      return;
    }
    if (PAD.state.left) this.px -= 150 * dt;
    if (PAD.state.right) this.px += 150 * dt;
    if (this.px < 0) this.px += 256;
    if (this.px > 256) this.px -= 256;

    this.vy += 280 * dt;
    this.py += this.vy * dt;

    // Bounce on falling downward onto platform
    if (this.vy > 0) {
      for (let pl of this.plats) {
        if (this.px + 4 >= pl.x && this.px - 4 <= pl.x + 30 &&
            this.py >= pl.y - 2 && this.py <= pl.y + 7) {
          this.vy = -220;
          APU.sfx('JUMP');
        }
      }
    }

    // Scroll up when player ascends past screen midpoint
    if (this.py < 110) {
      const diff = 110 - this.py;
      this.py = 110;
      this.score += Math.floor(diff);
      for (let pl of this.plats) {
        pl.y += diff;
        if (pl.y > 240) {
          let minY = 240;
          for (let p of this.plats) { if (p !== pl && p.y < minY) minY = p.y; }
          pl.y = Math.max(10, minY - 45 - Math.random() * 10);
          pl.x = Math.floor(Math.random() * 200 + 10);
        }
      }
    }

    if (this.py > 245) {
      this.over = true;
      APU.sfx('BOOM');
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    for (let pl of this.plats) {
      g.rect(Math.floor(pl.x), Math.floor(pl.y), 30, 5, 2);
      g.box(Math.floor(pl.x), Math.floor(pl.y), 30, 5, 3);
    }
    // Doodle character
    const px = Math.floor(this.px);
    const py = Math.floor(this.py);
    g.disc(px, py - 4, 6, 3);
    g.rect(px - 4, py - 2, 8, 5, 2);
    if (PAD.state.left) g.rect(px - 7, py - 5, 4, 3, 3);
    else g.rect(px + 3, py - 5, 4, 3, 3);

    g.text("HEIGHT: " + this.score, 14, 14, 3);

    if (this.over) {
      g.rect(48, 85, 160, 60, 0);
      g.box(48, 85, 160, 60, 3);
      g.textC("FELL OFF!", 98, 1);
      g.textC("SCORE: " + this.score + " M", 114, 3);
      g.textC("PRESS [A] TO RETRY", 130, 2);
    }
  }
};
