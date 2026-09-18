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
    this.score = 0;
    this.timer = 0;
    this.speed = 0.14;
    this.over = false;
    this.won = false;
    this.spawnFood();
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
    if (free.length === 0) {
      this.won = true;
      this.food = null;
      APU.sfx('LEVELUP');
      SAVE.setScore(this.id, this.score);
      return;
    }
    this.food = free[Math.floor(Math.random() * free.length)];
  },
  update(dt) {
    if (this.over || this.won) {
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
      this.timer -= this.speed;
      this.dir = this.nextDir;
      const head = [this.snake[0][0] + this.dir[0], this.snake[0][1] + this.dir[1]];

      // Wall collision (arena box: x: 1..25, y: 1..21)
      if (head[0] < 1 || head[0] > 25 || head[1] < 1 || head[1] > 21) {
        this.die(); return;
      }

      // Check eating food
      const eating = this.food && head[0] === this.food[0] && head[1] === this.food[1];

      // Tail collision: if eating, all segments persist; if moving without eating, tail tip vacates
      const checkLen = eating ? this.snake.length : this.snake.length - 1;
      for (let i = 0; i < checkLen; i++) {
        const s = this.snake[i];
        if (s[0] === head[0] && s[1] === head[1]) {
          this.die(); return;
        }
      }

      this.snake.unshift(head);
      if (eating) {
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
    // Boundary wall enclosing 25x21 grid symmetrically (margins: 14px left/right, 10px top)
    g.box(14, 10, 228, 192, 2);

    // Apple with stem
    if (this.food) {
      const ax = 7 + this.food[0] * 9 + 4;
      const ay = 3 + this.food[1] * 9 + 4;
      g.disc(ax, ay, 3, 3);
      g.px(ax, ay - 4, 2);
    }

    // Snake body & head
    for (let i = this.snake.length - 1; i >= 0; i--) {
      const s = this.snake[i];
      const sx = 7 + s[0] * 9;
      const sy = 3 + s[1] * 9;
      if (i === 0) {
        // Distinct head: brighter color + directional eyes
        g.rect(sx, sy, 8, 8, 3);
        if (this.dir[0] === 1) {
          g.px(sx + 5, sy + 2, 0); g.px(sx + 5, sy + 5, 0);
        } else if (this.dir[0] === -1) {
          g.px(sx + 2, sy + 2, 0); g.px(sx + 2, sy + 5, 0);
        } else if (this.dir[1] === -1) {
          g.px(sx + 2, sy + 2, 0); g.px(sx + 5, sy + 2, 0);
        } else {
          g.px(sx + 2, sy + 5, 0); g.px(sx + 5, sy + 5, 0);
        }
      } else {
        // Body segment
        g.rect(sx, sy, 8, 8, 2);
        g.rect(sx + 2, sy + 2, 4, 4, 1);
      }
    }

    // HUD
    g.text("SCORE: " + this.score, 14, 218, 3);
    g.textR("BEST: " + SAVE.getScore(this.id), 241, 218, 2);

    // Modal overlay for Game Over & Victory
    if (this.over) {
      g.dither(60, 80, 136, 52, 0, 1);
      g.box(60, 80, 136, 52, 3);
      g.textC("GAME OVER", 88, 3);
      g.textC("SCORE: " + this.score, 101, 2);
      g.textC("PRESS [A] TO RETRY", 114, 2);
    } else if (this.won) {
      g.dither(60, 80, 136, 52, 0, 1);
      g.box(60, 80, 136, 52, 3);
      g.textC("VICTORY!", 88, 3);
      g.textC("PERFECT SCORE: " + this.score, 101, 2);
      g.textC("PRESS [A] TO RETRY", 114, 2);
    }
  }
};
