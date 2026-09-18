// js/cartridges/cart_001_snake.js
// ============================================================================
// Cartridge #001: SNAKE
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 1. SNAKE
CARTS[1] = {
  id: 1, name: "SNAKE", genre: 0, scoreLabel: "APPLES",
  desc: "EAT APPLES, GROW LONGER. AVOID WALLS AND YOUR OWN TAIL!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Draw cute pixel snake & apple
    g.rect(x + 6, y + 16, 14, 4, 3);
    g.rect(x + 16, y + 8, 4, 12, 3);
    g.rect(x + 18, y + 8, 4, 4, 3);
    g.disc(x + 24, y + 20, 3, 2);
  },
  init() {
    this.snake = [[10, 10], [9, 10], [8, 10]];
    this.dir = [1, 0];
    this.nextDir = [1, 0];
    this.spawnFood();
    this.score = 0;
    this.timer = 0;
    this.speed = 0.14;
    this.over = false;
  },
  spawnFood() {
    const free = [];
    for (let x = 1; x <= 25; x++) {
      for (let y = 1; y <= 21; y++) {
        if (!this.snake.some(s => s[0] === x && s[1] === y)) {
          free.push([x, y]);
        }
      }
    }
    this.food = free.length > 0 ? free[Math.floor(Math.random() * free.length)] : [12, 11];
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    const sw = PAD.swipe;
    if ((PAD.hit('up') || sw === 'up') && this.dir[1] === 0 && this.nextDir[1] === 0) this.nextDir = [0, -1];
    if ((PAD.hit('down') || sw === 'down') && this.dir[1] === 0 && this.nextDir[1] === 0) this.nextDir = [0, 1];
    if ((PAD.hit('left') || sw === 'left') && this.dir[0] === 0 && this.nextDir[0] === 0) this.nextDir = [-1, 0];
    if ((PAD.hit('right') || sw === 'right') && this.dir[0] === 0 && this.nextDir[0] === 0) this.nextDir = [1, 0];

    this.timer += dt;
    if (this.timer >= this.speed) {
      this.timer = 0;
      this.dir = this.nextDir;
      const head = [this.snake[0][0] + this.dir[0], this.snake[0][1] + this.dir[1]];

      // Wall collision
      if (head[0] < 1 || head[0] > 25 || head[1] < 1 || head[1] > 21) {
        this.die(); return;
      }
      // Tail collision
      for (let s of this.snake) {
        if (s[0] === head[0] && s[1] === head[1]) { this.die(); return; }
      }

      this.snake.unshift(head);
      if (head[0] === this.food[0] && head[1] === this.food[1]) {
        this.score++;
        APU.sfx('COIN');
        this.spawnFood();
        if (this.score % 5 === 0) this.speed = Math.max(0.04, this.speed - 0.01);
      } else {
        this.snake.pop();
      }
    }
  },
  die() {
    this.over = true;
    APU.sfx('BOOM');
    SAVE.setScore(this.id, this.score);
  },
  render(g) {
    g.clear(0);
    // Boundary wall
    g.box(8, 8, 240, 204, 2);
    // Apple
    g.disc(8 + this.food[0] * 9 + 4, 8 + this.food[1] * 9 + 4, 3, 3);
    // Snake
    for (let i = 0; i < this.snake.length; i++) {
      const s = this.snake[i];
      g.rect(8 + s[0] * 9, 8 + s[1] * 9, 8, 8, i === 0 ? 3 : 2);
    }
    // HUD
    g.text("SCORE: " + this.score, 12, 222, 3);
    g.textR("BEST: " + SAVE.getScore(this.id), 244, 222, 2);

    if (this.over) {
      g.dither(64, 90, 128, 48, 0, 1);
      g.box(64, 90, 128, 48, 3);
      g.textC("GAME OVER", 102, 3);
      g.textC("PRESS [A] TO RETRY", 118, 2);
    }
  }
};
