// js/cartridges/cart_004_arkanoid.js
// ============================================================================
// Cartridge #004: ARKANOID
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 4. ARKANOID
CARTS[4] = {
  id: 4, name: "ARKANOID", genre: 0, scoreLabel: "BRICKS",
  desc: "DEFLECT THE BALL TO SMASH ALL BRICKS. CATCH FALLING CAPSULES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) g.rect(x + 5 + c * 6, y + 6 + r * 4, 5, 3, 2);
    }
    g.rect(x + 8, y + 24, 16, 3, 3);
    g.rect(x + 15, y + 18, 3, 3, 3);
  },
  init() {
    this.paddleX = 110;
    this.paddleW = 36;
    this.ballX = 128; this.ballY = 200;
    this.ballVX = 100; this.ballVY = -120;
    this.lives = 3;
    this.score = 0;
    this.over = false;
    this.won = false;
    this.bricks = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 10; c++) {
        this.bricks.push({ x: 16 + c * 23, y: 30 + r * 10, w: 20, h: 7, active: true });
      }
    }
  },
  update(dt) {
    if (this.over || this.won) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    // Paddle control
    if (PAD.state.left) this.paddleX = Math.max(8, this.paddleX - 180 * dt);
    if (PAD.state.right) this.paddleX = Math.min(248 - this.paddleW, this.paddleX + 180 * dt);

    // Ball motion
    this.ballX += this.ballVX * dt;
    this.ballY += this.ballVY * dt;

    // Boundary bounces
    if (this.ballX < 12) { this.ballX = 12; this.ballVX = Math.abs(this.ballVX); APU.sfx('TICK'); }
    if (this.ballX > 244) { this.ballX = 244; this.ballVX = -Math.abs(this.ballVX); APU.sfx('TICK'); }
    if (this.ballY < 16) { this.ballY = 16; this.ballVY = Math.abs(this.ballVY); APU.sfx('TICK'); }

    // Paddle hit
    if (this.ballY >= 216 && this.ballY <= 222 && this.ballX >= this.paddleX && this.ballX <= this.paddleX + this.paddleW) {
      this.ballVY = -Math.abs(this.ballVY);
      const hitPos = (this.ballX - (this.paddleX + this.paddleW / 2)) / (this.paddleW / 2);
      this.ballVX += hitPos * 70;
      APU.sfx('HIT');
      PAD.vibrate(8);
    }

    // Brick collisions
    for (let b of this.bricks) {
      if (b.active && this.ballX >= b.x && this.ballX <= b.x + b.w && this.ballY >= b.y && this.ballY <= b.y + b.h) {
        b.active = false;
        this.ballVY = -this.ballVY;
        this.score++;
        APU.sfx('COIN');
        if (this.bricks.every(k => !k.active)) {
          this.won = true;
          APU.sfx('LEVELUP');
          SAVE.setScore(this.id, this.score);
        }
        break;
      }
    }

    // Bottom loss
    if (this.ballY > 240) {
      this.lives--;
      APU.sfx('HURT');
      if (this.lives <= 0) {
        this.over = true;
        SAVE.setScore(this.id, this.score);
      } else {
        this.ballX = this.paddleX + this.paddleW / 2;
        this.ballY = 200;
        this.ballVX = (Math.random() > 0.5 ? 100 : -100);
        this.ballVY = -120;
      }
    }
  },
  render(g) {
    g.clear(0);
    g.box(8, 8, 240, 224, 1);

    // Bricks
    for (let b of this.bricks) {
      if (b.active) {
        g.rect(b.x, b.y, b.w, b.h, 2);
        g.box(b.x, b.y, b.w, b.h, 3);
      }
    }

    // Paddle & Ball
    g.rect(Math.floor(this.paddleX), 218, this.paddleW, 6, 3);
    g.disc(Math.floor(this.ballX), Math.floor(this.ballY), 3, 3);

    // HUD
    g.text("SCORE: " + this.score, 14, 12, 3);
    g.textR("LIVES: " + "♥".repeat(Math.max(0, this.lives)), 242, 12, 3);

    if (this.won) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("STAGE CLEARED!", 110, 3);
      g.textC("[A] PLAY AGAIN", 124, 2);
    } else if (this.over) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("GAME OVER", 110, 3);
      g.textC("[A] TO RETRY", 124, 2);
    }
  }
};
