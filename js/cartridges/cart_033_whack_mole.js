// js/cartridges/cart_033_whack_mole.js
// ============================================================================
// Cartridge #033: WHACK MOLE
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 33. WHACK-A-MOLE
CARTS[33] = {
  id: 33, name: "WHACK MOLE", genre: 3, scoreLabel: "MOLES",
  desc: "3X3 HOLES. WHACK MOLES AS THEY POP UP BEFORE THEY VANISH BACK UNDERGROUND!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.circle(x + 16, y + 18, 7, 2);
    g.disc(x + 16, y + 16, 4, 3);
  },
  init() {
    this.moleX = 1; this.moleY = 1;
    this.moleTimer = 0.8;
    this.cx = 1; this.cy = 1;
    this.score = 0;
    this.timeLeft = 30;
    this.over = false;
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.over = true;
      APU.sfx('LEVELUP');
      SAVE.setScore(this.id, this.score);
      return;
    }

    this.moleTimer -= dt;
    if (this.moleTimer <= 0) {
      this.moleX = Math.floor(Math.random() * 3);
      this.moleY = Math.floor(Math.random() * 3);
      this.moleTimer = 0.8;
    }
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(2, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(2, this.cy + 1);

    // Direct touch tap
    if (PAD.tapPos) {
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          const hx = 60 + x * 50, hy = 50 + y * 50;
          if (Math.hypot(PAD.tapPos.x - (hx + 16), PAD.tapPos.y - (hy + 16)) < 20) {
            this.cx = x; this.cy = y;
            if (this.cx === this.moleX && this.cy === this.moleY) {
              this.score++;
              APU.sfx('HIT');
              this.moleTimer = 0;
              SAVE.setScore(this.id, this.score);
            }
          }
        }
      }
    } else if (PAD.hit('a')) {
      if (this.cx === this.moleX && this.cy === this.moleY) {
        this.score++;
        APU.sfx('HIT');
        this.moleTimer = 0;
        SAVE.setScore(this.id, this.score);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("WHACK-A-MOLE", 14, 14, 3);
    g.textR("SCORE: " + this.score + "  TIME: " + Math.ceil(this.timeLeft) + "S", 244, 14, 2);

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const hx = 60 + x * 50, hy = 50 + y * 50;
        g.circle(hx + 16, hy + 16, 12, 1);
        if (x === this.moleX && y === this.moleY && !this.over) {
          g.disc(hx + 16, hy + 14, 8, 3);
        }
        if (x === this.cx && y === this.cy) g.box(hx, hy, 32, 32, 3);
      }
    }

    if (this.over) {
      g.dither(50, 90, 156, 44, 0, 1);
      g.box(50, 90, 156, 44, 3);
      g.textC("TIME UP! SCORE: " + this.score, 100, 3);
      g.textC("[A] PLAY AGAIN", 116, 2);
    }
  }
};
