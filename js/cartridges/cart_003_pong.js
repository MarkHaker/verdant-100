// js/cartridges/cart_003_pong.js
// ============================================================================
// Cartridge #003: PONG
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 3. PONG
CARTS[3] = {
  id: 3, name: "PONG", genre: 0, scoreLabel: "WINS",
  desc: "CLASSIC 2-PADDLE TABLE TENNIS AGAINST COMPUTER. FIRST TO 7 WINS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 4, y + 10, 3, 12, 3);
    g.rect(x + 25, y + 14, 3, 12, 2);
    g.rect(x + 14, y + 15, 3, 3, 3);
  },
  init() {
    this.py = 100;
    this.ay = 100;
    this.bx = 128; this.by = 120;
    this.bvx = 140; this.bvy = 70;
    this.pScore = 0; this.aScore = 0;
    this.over = false;
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    // Player paddle
    if (PAD.state.up) this.py = Math.max(16, this.py - 160 * dt);
    if (PAD.state.down) this.py = Math.min(184, this.py + 160 * dt);

    // AI paddle with tracking error
    const aiTarget = this.by - 20;
    this.ay += (aiTarget - this.ay) * Math.min(1, (4 + this.pScore * 0.8) * dt);
    this.ay = Math.max(16, Math.min(184, this.ay));

    // Ball movement
    this.bx += this.bvx * dt;
    this.by += this.bvy * dt;

    // Top/Bottom wall bounces
    if (this.by < 16) { this.by = 16; this.bvy = Math.abs(this.bvy); APU.sfx('TICK'); }
    if (this.by > 224) { this.by = 224; this.bvy = -Math.abs(this.bvy); APU.sfx('TICK'); }

    // Left paddle collision
    if (this.bx <= 24 && this.bx >= 18 && this.by >= this.py && this.by <= this.py + 40) {
      this.bx = 25;
      this.bvx = Math.abs(this.bvx) * 1.05;
      this.bvy += (this.by - (this.py + 20)) * 4;
      APU.sfx('HIT');
      PAD.vibrate(10);
    }
    // Right paddle collision
    if (this.bx >= 232 && this.bx <= 238 && this.by >= this.ay && this.by <= this.ay + 40) {
      this.bx = 231;
      this.bvx = -Math.abs(this.bvx) * 1.05;
      this.bvy += (this.by - (this.ay + 20)) * 4;
      APU.sfx('HIT');
    }

    // Score checks
    if (this.bx < 0) {
      this.aScore++;
      APU.sfx('HURT');
      this.resetBall(1);
    } else if (this.bx > 256) {
      this.pScore++;
      APU.sfx('COIN');
      this.resetBall(-1);
    }

    if (this.pScore >= 7 || this.aScore >= 7) {
      this.over = true;
      SAVE.setScore(this.id, this.pScore);
      if (this.pScore >= 7) APU.sfx('LEVELUP');
      else APU.sfx('BOOM');
    }
  },
  resetBall(dir) {
    this.bx = 128; this.by = 120;
    this.bvx = dir * 140;
    this.bvy = (Math.random() - 0.5) * 120;
  },
  render(g) {
    g.clear(0);
    // Court borders & dashed center line
    g.box(8, 12, 240, 216, 1);
    for (let y = 14; y < 224; y += 12) g.rect(127, y, 2, 6, 1);

    // Scores
    g.text("" + this.pScore, 90, 24, 3, 2);
    g.text("" + this.aScore, 150, 24, 2, 2);

    // Paddles & Ball
    g.rect(18, Math.floor(this.py), 6, 40, 3);
    g.rect(232, Math.floor(this.ay), 6, 40, 2);
    g.rect(Math.floor(this.bx) - 3, Math.floor(this.by) - 3, 6, 6, 3);

    if (this.over) {
      g.dither(64, 90, 128, 48, 0, 1);
      g.box(64, 90, 128, 48, 3);
      g.textC(this.pScore >= 7 ? "YOU WIN!" : "COMPUTER WINS", 102, 3);
      g.textC("[A] PLAY AGAIN", 118, 2);
    }
  }
};
