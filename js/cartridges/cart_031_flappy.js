// js/cartridges/cart_031_flappy.js
// ============================================================================
// Cartridge #031: FLAPPY
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 31. FLAPPY
CARTS[31] = {
  id: 31, name: "FLAPPY", genre: 3, scoreLabel: "PIPES",
  desc: "TAP [A] TO FLAP WINGS. THREAD THE NEEDLE THROUGH 34PX OBSTACLE GAPS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 12, y + 16, 5, 3);
    g.rect(x + 22, y + 6, 6, 8, 2);
    g.rect(x + 22, y + 20, 6, 8, 2);
  },
  init() {
    this.by = 120; this.bvy = 0;
    this.pipes = [
      { x: 260, gapY: 90 },
      { x: 380, gapY: 130 }
    ];
    this.score = 0;
    this.over = false;
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    if (PAD.hit('a')) {
      this.bvy = -120;
      APU.sfx('JUMP');
    }
    this.bvy += 260 * dt;
    this.by += this.bvy * dt;

    if (this.by < 0 || this.by > 230) {
      this.over = true;
      APU.sfx('BOOM');
      SAVE.setScore(this.id, this.score);
    }

    for (let p of this.pipes) {
      p.x -= 70 * dt;
      if (p.x < -30) {
        p.x = 260;
        p.gapY = Math.floor(Math.random() * 120) + 40;
        this.score++;
        APU.sfx('COIN');
        SAVE.setScore(this.id, this.score);
      }
      // Pipe hit check
      if (p.x < 70 && p.x > 30) {
        if (this.by < p.gapY || this.by > p.gapY + 36) {
          this.over = true;
          APU.sfx('BOOM');
          SAVE.setScore(this.id, this.score);
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    for (let p of this.pipes) {
      const px = Math.floor(p.x);
      g.rect(px, 0, 24, p.gapY, 2);
      g.rect(px, p.gapY + 36, 24, 240 - (p.gapY + 36), 2);
    }
    g.disc(50, Math.floor(this.by), 5, 3);
    g.text("SCORE: " + this.score, 14, 14, 3);
    g.textR("RECORD: " + SAVE.getScore(this.id), 244, 14, 2);

    if (this.over) {
      g.dither(50, 90, 156, 44, 0, 1);
      g.box(50, 90, 156, 44, 3);
      g.textC("GAME OVER", 100, 3);
      g.textC("[A] TO RETRY", 116, 2);
    }
  }
};
