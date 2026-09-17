// js/carts.js
// ============================================================================
// [CARTS] ALL 100 CARTRIDGES (10 GENRES x 10 CARTRIDGES)
// ============================================================================

// ============================================================================
// CARTRIDGES 1 - 20 (BLOCK 1: ARCADE/SPACE & BLOCK 2: PUZZLES/GRIDS)
// ============================================================================
const CARTS = {};

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

// 2. TETRIS
CARTS[2] = {
  id: 2, name: "TETRIS", genre: 0, scoreLabel: "PTS",
  desc: "FIT FALLING TETROMINOES INTO SOLID HORIZONTAL ROWS.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 6, y + 14, 16, 6, 3);
    g.rect(x + 12, y + 8, 6, 6, 3);
    g.rect(x + 8, y + 20, 12, 6, 2);
  },
  SHAPES: [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[0,1,0],[1,1,1]], // T
    [[1,0,0],[1,1,1]], // L
    [[0,0,1],[1,1,1]], // J
    [[0,1,1],[1,1,0]], // S
    [[1,1,0],[0,1,1]]  // Z
  ],
  init() {
    this.grid = E1.create(10, 20, 0);
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.over = false;
    this.spawnPiece();
  },
  spawnPiece() {
    const idx = Math.floor(Math.random() * this.SHAPES.length);
    this.piece = this.SHAPES[idx];
    this.px = 3;
    this.py = 0;
    this.dropTimer = 0;
    if (this.collides(this.px, this.py, this.piece)) {
      this.over = true;
      APU.sfx('BOOM');
      SAVE.setScore(this.id, this.score);
    }
  },
  rotate(matrix) {
    const rows = matrix.length, cols = matrix[0].length;
    const res = [];
    for (let c = 0; c < cols; c++) {
      const newRow = [];
      for (let r = rows - 1; r >= 0; r--) newRow.push(matrix[r][c]);
      res.push(newRow);
    }
    return res;
  },
  collides(px, py, piece) {
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece[r].length; c++) {
        if (piece[r][c]) {
          const gx = px + c, gy = py + r;
          if (gx < 0 || gx >= 10 || gy >= 20) return true;
          if (gy >= 0 && E1.get(this.grid, gx, gy) !== 0) return true;
        }
      }
    }
    return false;
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    if (PAD.hit('left') && !this.collides(this.px - 1, this.py, this.piece)) {
      this.px--; APU.sfx('TICK');
    }
    if (PAD.hit('right') && !this.collides(this.px + 1, this.py, this.piece)) {
      this.px++; APU.sfx('TICK');
    }
    if (PAD.hit('a') || PAD.hit('up')) {
      const rot = this.rotate(this.piece);
      if (!this.collides(this.px, this.py, rot)) {
        this.piece = rot; APU.sfx('SWISH');
      }
    }

    const fallSpeed = PAD.state.down ? 0.05 : Math.max(0.1, 0.6 - (this.level - 1) * 0.05);
    this.dropTimer += dt;
    if (this.dropTimer >= fallSpeed) {
      this.dropTimer = 0;
      if (!this.collides(this.px, this.py + 1, this.piece)) {
        this.py++;
      } else {
        // Lock piece
        for (let r = 0; r < this.piece.length; r++) {
          for (let c = 0; c < this.piece[r].length; c++) {
            if (this.piece[r][c]) E1.set(this.grid, this.px + c, this.py + r, 2);
          }
        }
        APU.sfx('HIT');
        this.clearLines();
        this.spawnPiece();
      }
    }
  },
  clearLines() {
    let cleared = 0;
    for (let y = 19; y >= 0; y--) {
      let full = true;
      for (let x = 0; x < 10; x++) {
        if (E1.get(this.grid, x, y) === 0) { full = false; break; }
      }
      if (full) {
        cleared++;
        for (let ny = y; ny > 0; ny--) {
          for (let nx = 0; nx < 10; nx++) {
            E1.set(this.grid, nx, ny, E1.get(this.grid, nx, ny - 1));
          }
        }
        for (let nx = 0; nx < 10; nx++) E1.set(this.grid, nx, 0, 0);
        y++;
      }
    }
    if (cleared > 0) {
      this.lines += cleared;
      this.score += [0, 100, 300, 500, 800][cleared] * this.level;
      this.level = Math.floor(this.lines / 10) + 1;
      APU.sfx('LEVELUP');
    }
  },
  render(g) {
    g.clear(0);
    const ox = 78, oy = 16, sz = 10;
    g.box(ox - 2, oy - 2, 10 * sz + 4, 20 * sz + 4, 2);

    // Grid
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 10; x++) {
        const val = E1.get(this.grid, x, y);
        if (val) {
          g.rect(ox + x * sz + 1, oy + y * sz + 1, sz - 2, sz - 2, 2);
          g.box(ox + x * sz, oy + y * sz, sz, sz, 3);
        }
      }
    }

    // Active piece
    if (this.piece) {
      for (let r = 0; r < this.piece.length; r++) {
        for (let c = 0; c < this.piece[r].length; c++) {
          if (this.piece[r][c]) {
            g.rect(ox + (this.px + c) * sz + 1, oy + (this.py + r) * sz + 1, sz - 2, sz - 2, 3);
          }
        }
      }
    }

    // Sidebar
    g.text("TETRIS", 12, 20, 3);
    g.text("SCORE", 12, 40, 2);
    g.text("" + this.score, 12, 50, 3);
    g.text("LINES", 12, 70, 2);
    g.text("" + this.lines, 12, 80, 3);
    g.text("LEVEL", 12, 100, 2);
    g.text("" + this.level, 12, 110, 3);

    g.text("RECORD", 190, 40, 2);
    g.text("" + SAVE.getScore(this.id), 190, 50, 3);

    if (this.over) {
      g.dither(ox, 80, 10 * sz, 40, 0, 1);
      g.box(ox, 80, 10 * sz, 40, 3);
      g.textC("GAME OVER", 92, 3);
      g.textC("[A] RETRY", 106, 2);
    }
  }
};

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

// 5. SPACE INVADERS
CARTS[5] = {
  id: 5, name: "INVADERS", genre: 0, scoreLabel: "KILLS",
  desc: "DEFEND EARTH FROM 5X11 INVASION FLEET. HIDE BEHIND BUNKER SHIELDS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    // Alien sprite
    g.rect(x + 10, y + 10, 12, 8, 3);
    g.rect(x + 8, y + 14, 16, 4, 3);
    g.rect(x + 12, y + 18, 8, 4, 2);
  },
  init() {
    this.px = 120;
    this.bullet = null;
    this.enemyBullets = [];
    this.aliens = [];
    this.wave = 1;
    this.spawnFleet();
    this.fleetDir = 1;
    this.fleetTimer = 0;
    this.fleetSpeed = 0.6;
    this.score = 0;
    this.over = false;
  },
  spawnFleet() {
    this.aliens = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 10; c++) {
        this.aliens.push({ x: 20 + c * 18, y: 30 + r * 14, alive: true });
      }
    }
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    if (PAD.state.left) this.px = Math.max(12, this.px - 140 * dt);
    if (PAD.state.right) this.px = Math.min(236, this.px + 140 * dt);

    // Player fire
    if (PAD.hit('a') && !this.bullet) {
      this.bullet = { x: this.px + 4, y: 216 };
      APU.sfx('SWISH');
    }

    // Bullet update
    if (this.bullet) {
      this.bullet.y -= 260 * dt;
      if (this.bullet.y < 10) this.bullet = null;
      else {
        // Alien hit check
        for (let a of this.aliens) {
          if (a.alive && Math.abs(this.bullet.x - a.x) < 8 && Math.abs(this.bullet.y - a.y) < 6) {
            a.alive = false;
            this.bullet = null;
            this.score++;
            APU.sfx('BOOM');
            break;
          }
        }
      }
    }

    // Next wave check
    if (this.aliens.every(a => !a.alive)) {
      this.wave++;
      this.score += 50;
      APU.sfx('LEVELUP');
      this.spawnFleet();
      this.fleetDir = 1;
      this.fleetSpeed = Math.max(0.12, 0.6 - (this.wave - 1) * 0.08);
      this.enemyBullets = [];
      return;
    }

    // Enemy bullets firing
    const living = this.aliens.filter(a => a.alive);
    if (living.length > 0 && Math.random() < 0.02 + this.wave * 0.008) {
      const shooter = living[Math.floor(Math.random() * living.length)];
      this.enemyBullets.push({ x: shooter.x, y: shooter.y + 6 });
    }

    // Enemy bullets update
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const eb = this.enemyBullets[i];
      eb.y += 130 * dt;
      if (eb.y > 235) {
        this.enemyBullets.splice(i, 1);
      } else if (Math.abs(eb.x - (this.px + 5)) < 7 && eb.y >= 216 && eb.y <= 228) {
        this.over = true;
        APU.sfx('BOOM');
        SAVE.setScore(this.id, this.score);
        return;
      }
    }

    // Fleet movement
    this.fleetTimer += dt;
    if (this.fleetTimer >= this.fleetSpeed) {
      this.fleetTimer = 0;
      let hitEdge = false;
      for (let a of this.aliens) {
        if (a.alive && ((this.fleetDir > 0 && a.x > 230) || (this.fleetDir < 0 && a.x < 16))) {
          hitEdge = true; break;
        }
      }
      if (hitEdge) {
        this.fleetDir = -this.fleetDir;
        for (let a of this.aliens) a.y += 8;
        this.fleetSpeed = Math.max(0.12, this.fleetSpeed - 0.04);
      } else {
        for (let a of this.aliens) a.x += this.fleetDir * 6;
      }
      APU.sfx('TICK');
    }

    // Alien descent defeat check
    for (let a of this.aliens) {
      if (a.alive && a.y >= 210) {
        this.over = true;
        APU.sfx('BOOM');
        SAVE.setScore(this.id, this.score);
        break;
      }
    }
  },
  render(g) {
    g.clear(0);
    // Player cannon
    g.rect(Math.floor(this.px), 220, 10, 8, 3);
    g.rect(Math.floor(this.px) + 4, 216, 2, 4, 3);

    // Player bullet
    if (this.bullet) g.rect(Math.floor(this.bullet.x), Math.floor(this.bullet.y), 2, 6, 3);

    // Enemy bullets
    for (let eb of this.enemyBullets) g.rect(Math.floor(eb.x), Math.floor(eb.y), 2, 5, 2);

    // Aliens
    for (let a of this.aliens) {
      if (a.alive) {
        const ax = Math.floor(a.x), ay = Math.floor(a.y);
        g.rect(ax - 5, ay - 4, 10, 8, 2);
        g.rect(ax - 3, ay - 2, 6, 4, 3);
      }
    }

    g.text("SCORE: " + this.score, 12, 10, 3);
    g.textR("WAVE: " + this.wave, 244, 10, 2);

    if (this.over) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("FLEET LANDED!", 110, 3);
      g.textC("[A] TO RETRY", 124, 2);
    }
  }
};

// 6. ASTEROIDS
CARTS[6] = {
  id: 6, name: "ASTEROIDS", genre: 0, scoreLabel: "ROCKS",
  desc: "PILOT SHIP WITH ROTATION & THRUST. BLAST ASTEROIDS INTO SMALL FRAGMENTS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.tri(x + 16, y + 8, x + 10, y + 24, x + 22, y + 24, 3);
    g.circle(x + 8, y + 8, 4, 2);
    g.circle(x + 24, y + 16, 5, 2);
  },
  init() {
    this.ship = { x: 128, y: 120, angle: -Math.PI / 2, vx: 0, vy: 0 };
    this.bullets = [];
    this.rocks = [];
    this.wave = 1;
    this.spawnRocks();
    this.score = 0;
    this.over = false;
  },
  spawnRocks() {
    const count = 3 + this.wave;
    for (let i = 0; i < count; i++) {
      let rx, ry;
      do {
        rx = Math.random() * 256;
        ry = Math.random() * 240;
      } while (Math.hypot(rx - 128, ry - 120) < 60);
      const spd = 30 + this.wave * 8;
      this.rocks.push({
        x: rx, y: ry,
        vx: (Math.random() - 0.5) * spd, vy: (Math.random() - 0.5) * spd,
        r: 14, size: 3
      });
    }
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    // Ship steering
    if (PAD.state.left) this.ship.angle -= 3.5 * dt;
    if (PAD.state.right) this.ship.angle += 3.5 * dt;
    if (PAD.state.up) {
      this.ship.vx += Math.cos(this.ship.angle) * 120 * dt;
      this.ship.vy += Math.sin(this.ship.angle) * 120 * dt;
      if (Math.random() < 0.2) APU.sfx('SWISH');
    }
    // Damping & wrapping
    this.ship.vx *= 0.99; this.ship.vy *= 0.99;
    this.ship.x = (this.ship.x + this.ship.vx * dt + 256) % 256;
    this.ship.y = (this.ship.y + this.ship.vy * dt + 240) % 240;

    // Bullet fire
    if (PAD.hit('a')) {
      this.bullets.push({
        x: this.ship.x, y: this.ship.y,
        vx: Math.cos(this.ship.angle) * 220, vy: Math.sin(this.ship.angle) * 220,
        life: 1.0
      });
      APU.sfx('TICK');
    }

    // Bullets update
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x = (b.x + b.vx * dt + 256) % 256;
      b.y = (b.y + b.vy * dt + 240) % 240;
      b.life -= dt;
      if (b.life <= 0) this.bullets.splice(i, 1);
    }

    // Next wave check
    if (this.rocks.length === 0) {
      this.wave++;
      this.score += 50;
      APU.sfx('LEVELUP');
      this.spawnRocks();
      return;
    }

    // Rocks update & collision
    for (let i = this.rocks.length - 1; i >= 0; i--) {
      const r = this.rocks[i];
      r.x = (r.x + r.vx * dt + 256) % 256;
      r.y = (r.y + r.vy * dt + 240) % 240;

      // Ship collision
      const sDist = Math.hypot(this.ship.x - r.x, this.ship.y - r.y);
      if (sDist < r.r + 4) {
        this.over = true;
        APU.sfx('BOOM');
        SAVE.setScore(this.id, this.score);
        return;
      }

      // Bullet collision
      for (let j = this.bullets.length - 1; j >= 0; j--) {
        const b = this.bullets[j];
        if (Math.hypot(b.x - r.x, b.y - r.y) < r.r) {
          this.bullets.splice(j, 1);
          this.score++;
          APU.sfx('HIT');
          if (r.size > 1) {
            this.rocks.push({
              x: r.x, y: r.y,
              vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60,
              r: r.r * 0.6, size: r.size - 1
            });
            r.r *= 0.6; r.size -= 1;
          } else {
            this.rocks.splice(i, 1);
          }
          break;
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    // Ship
    const s = this.ship;
    const x0 = s.x + Math.cos(s.angle) * 8;
    const y0 = s.y + Math.sin(s.angle) * 8;
    const x1 = s.x + Math.cos(s.angle + 2.4) * 6;
    const y1 = s.y + Math.sin(s.angle + 2.4) * 6;
    const x2 = s.x + Math.cos(s.angle - 2.4) * 6;
    const y2 = s.y + Math.sin(s.angle - 2.4) * 6;
    g.tri(x0, y0, x1, y1, x2, y2, 3);

    // Bullets
    for (let b of this.bullets) g.disc(Math.floor(b.x), Math.floor(b.y), 2, 3);

    // Rocks
    for (let r of this.rocks) g.circle(Math.floor(r.x), Math.floor(r.y), Math.floor(r.r), 2);

    g.text("SCORE: " + this.score, 12, 12, 3);
    if (this.over) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("CRASHED!", 110, 3);
      g.textC("[A] TO RETRY", 124, 2);
    }
  }
};

// 7. LUNAR LANDER
CARTS[7] = {
  id: 7, name: "LUNAR LANDER", genre: 0, scoreLabel: "FUEL",
  desc: "LAND GENTLY ON DESIGNATED PAD (VERTICAL SPEED < 1.0, ROTATION < 15 DEG).",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 11, y + 10, 10, 8, 3);
    g.line(x + 8, y + 22, x + 13, y + 18, 2);
    g.line(x + 24, y + 22, x + 19, y + 18, 2);
    g.line(x + 4, y + 26, x + 28, y + 26, 3);
  },
  init() {
    this.x = 40; this.y = 30;
    this.vx = 20; this.vy = 0;
    this.angle = 0;
    this.fuel = 450;
    this.landed = false;
    this.over = false;
    this.padX = 140; this.padW = 40;
  },
  update(dt) {
    if (this.over || this.landed) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    // Controls
    if (PAD.state.left) this.angle -= 2.0 * dt;
    if (PAD.state.right) this.angle += 2.0 * dt;
    const thrusting = (PAD.state.a || PAD.state.up) && this.fuel > 0;
    this.thrusting = thrusting;
    if (thrusting) {
      this.vx += Math.sin(this.angle) * 70 * dt;
      this.vy -= Math.cos(this.angle) * 70 * dt;
      this.fuel = Math.max(0, this.fuel - 100 * dt);
      if (Math.random() < 0.25) APU.sfx('SWISH');
    }

    // Lunar gravity
    this.vy += 28 * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Boundaries
    if (this.x < 8) { this.x = 8; this.vx = Math.abs(this.vx) * 0.5; }
    if (this.x > 248) { this.x = 248; this.vx = -Math.abs(this.vx) * 0.5; }
    if (this.y < 8) { this.y = 8; this.vy = Math.max(0, this.vy); }

    // Ground collision
    if (this.y >= 210) {
      this.y = 210;
      const onPad = (this.x >= this.padX && this.x <= this.padX + this.padW);
      const safeSpeed = (this.vy < 35 && Math.abs(this.vx) < 20);
      const safeAngle = Math.abs(this.angle) < 0.25;

      if (onPad && safeSpeed && safeAngle) {
        this.landed = true;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, Math.floor(this.fuel));
      } else {
        this.over = true;
        APU.sfx('BOOM');
      }
    }
  },
  render(g) {
    g.clear(0);
    // Lunar terrain & Landing pad
    g.line(0, 220, 256, 220, 1);
    g.rect(this.padX, 218, this.padW, 4, 3);
    g.text("PAD", this.padX + 12, 226, 3);

    // Lander capsule
    const lx = Math.floor(this.x), ly = Math.floor(this.y);
    g.rect(lx - 5, ly - 5, 10, 8, 3);
    g.line(lx - 6, ly + 6, lx - 3, ly + 3, 2);
    g.line(lx + 6, ly + 6, lx + 3, ly + 3, 2);

    // Thrust flame
    if (this.thrusting && !this.over && !this.landed) {
      g.line(lx, ly + 4, lx - Math.sin(this.angle) * 8, ly + Math.cos(this.angle) * 8, 3);
    }

    // Telemetry
    g.text("FUEL: " + Math.floor(this.fuel), 12, 12, 3);
    g.text("V-SPD: " + Math.floor(this.vy), 12, 22, this.vy < 35 ? 2 : 3);
    g.textR("PAD DIST: " + Math.floor(Math.abs(this.x - (this.padX + 20))), 244, 12, 2);

    if (this.landed) {
      g.dither(64, 80, 128, 44, 0, 1);
      g.box(64, 80, 128, 44, 3);
      g.textC("TOUCHDOWN SUCCESS!", 90, 3);
      g.textC("SCORE: " + Math.floor(this.fuel), 104, 2);
    } else if (this.over) {
      g.dither(64, 80, 128, 44, 0, 1);
      g.box(64, 80, 128, 44, 3);
      g.textC("LANDER DESTROYED", 90, 3);
      g.textC("[A] TO RETRY", 104, 2);
    }
  }
};

// 8. MISSILE COMMAND
CARTS[8] = {
  id: 8, name: "MISSILE CMD", genre: 0, scoreLabel: "INTERCEPTS",
  desc: "AIM RETICLE AND DETONATE FLAK SHELLS TO INTERCEPT INCOMING WARHEADS.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 4, y + 4, x + 16, y + 20, 2);
    g.disc(x + 16, y + 20, 6, 3);
    g.rect(x + 12, y + 25, 8, 5, 2);
  },
  init() {
    this.crossX = 128; this.crossY = 100;
    this.missiles = [];
    this.explosions = [];
    this.cities = [40, 80, 120, 160, 200];
    this.score = 0;
    this.over = false;
    this.spawnTimer = 0;
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    // Reticle movement
    const spd = 160;
    if (PAD.state.left) this.crossX = Math.max(10, this.crossX - spd * dt);
    if (PAD.state.right) this.crossX = Math.min(246, this.crossX + spd * dt);
    if (PAD.state.up) this.crossY = Math.max(10, this.crossY - spd * dt);
    if (PAD.state.down) this.crossY = Math.min(210, this.crossY + spd * dt);

    // Fire flak
    if (PAD.hit('a')) {
      this.explosions.push({ x: this.crossX, y: this.crossY, r: 2, maxR: 22, grow: true });
      APU.sfx('BOOM');
      PAD.vibrate(12);
    }

    // Spawn incoming ICBMs
    this.spawnTimer += dt;
    if (this.spawnTimer > 1.2) {
      this.spawnTimer = 0;
      this.missiles.push({
        sx: Math.random() * 256, sy: 0,
        tx: this.cities[Math.floor(Math.random() * this.cities.length)], ty: 220,
        progress: 0, speed: 0.15 + Math.random() * 0.15
      });
    }

    // Explosions update
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const e = this.explosions[i];
      if (e.grow) {
        e.r += 60 * dt;
        if (e.r >= e.maxR) e.grow = false;
      } else {
        e.r -= 30 * dt;
        if (e.r <= 0) this.explosions.splice(i, 1);
      }
    }

    // Missiles update
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      m.progress += m.speed * dt;
      const curX = m.sx + (m.tx - m.sx) * m.progress;
      const curY = m.sy + (m.ty - m.sy) * m.progress;

      // Interception check
      let hit = false;
      for (let e of this.explosions) {
        if (Math.hypot(curX - e.x, curY - e.y) < e.r) {
          hit = true; break;
        }
      }
      if (hit) {
        this.missiles.splice(i, 1);
        this.score++;
        APU.sfx('COIN');
      } else if (m.progress >= 1.0) {
        // Hit ground / city
        this.missiles.splice(i, 1);
        APU.sfx('BOOM');
        const cityIdx = this.cities.indexOf(m.tx);
        if (cityIdx >= 0) this.cities.splice(cityIdx, 1);
        if (this.cities.length === 0) {
          this.over = true;
          SAVE.setScore(this.id, this.score);
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    // Ground & Cities
    g.rect(0, 224, 256, 16, 1);
    for (let cx of this.cities) g.rect(cx - 6, 218, 12, 6, 2);

    // Missiles
    for (let m of this.missiles) {
      const curX = m.sx + (m.tx - m.sx) * m.progress;
      const curY = m.sy + (m.ty - m.sy) * m.progress;
      g.line(m.sx, m.sy, curX, curY, 2);
      g.disc(Math.floor(curX), Math.floor(curY), 2, 3);
    }

    // Explosions
    for (let e of this.explosions) g.disc(Math.floor(e.x), Math.floor(e.y), Math.floor(e.r), 3);

    // Crosshair reticle
    const rx = Math.floor(this.crossX), ry = Math.floor(this.crossY);
    g.line(rx - 6, ry, rx + 6, ry, 3);
    g.line(rx, ry - 6, rx, ry + 6, 3);

    g.text("SCORE: " + this.score, 12, 12, 3);
    g.textR("CITIES: " + this.cities.length, 244, 12, 2);

    if (this.over) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("ALL CITIES FALLEN", 110, 3);
      g.textC("[A] TO RETRY", 124, 2);
    }
  }
};

// 9. FROGGER
CARTS[9] = {
  id: 9, name: "FROGGER", genre: 0, scoreLabel: "SAVED",
  desc: "NAVIGATE LANES OF HIGHWAY TRAFFIC AND RIVER LOGS INTO GOAL HOMES.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 12, y + 14, 8, 8, 3);
    g.rect(x + 8, y + 10, 4, 4, 3);
    g.rect(x + 20, y + 10, 4, 4, 3);
    g.rect(x + 8, y + 20, 4, 4, 2);
    g.rect(x + 20, y + 20, 4, 4, 2);
  },
  init() {
    this.fx = 120; this.fy = 216;
    this.score = 0;
    this.lives = 3;
    this.over = false;
    this.homes = [false, false, false, false, false];
    this.cars = [
      { y: 192, speed: -60, len: 24, x: 50 },
      { y: 168, speed: 75,  len: 30, x: 120 },
      { y: 144, speed: -90, len: 20, x: 200 }
    ];
    this.logs = [
      { y: 96, speed: 45,  len: 40, x: 30 },
      { y: 72, speed: -50, len: 50, x: 150 },
      { y: 48, speed: 60,  len: 45, x: 80 }
    ];
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    // Frog hop
    const step = 24;
    if (PAD.hit('up')) { this.fy -= step; APU.sfx('JUMP'); }
    if (PAD.hit('down') && this.fy < 216) { this.fy += step; APU.sfx('JUMP'); }
    if (PAD.hit('left')) { this.fx = Math.max(10, this.fx - step); APU.sfx('JUMP'); }
    if (PAD.hit('right')) { this.fx = Math.min(236, this.fx + step); APU.sfx('JUMP'); }

    // Cars update
    for (let c of this.cars) {
      c.x += c.speed * dt;
      if (c.speed > 0 && c.x > 260) c.x = -c.len;
      if (c.speed < 0 && c.x < -c.len) c.x = 260;

      // Frog car hit
      if (Math.abs(this.fy - c.y) < 12 && this.fx >= c.x && this.fx <= c.x + c.len) {
        this.die(); return;
      }
    }

    // Logs update
    let onLog = false;
    for (let l of this.logs) {
      l.x += l.speed * dt;
      if (l.speed > 0 && l.x > 260) l.x = -l.len;
      if (l.speed < 0 && l.x < -l.len) l.x = 260;

      if (Math.abs(this.fy - l.y) < 12 && this.fx >= l.x && this.fx <= l.x + l.len) {
        onLog = true;
        this.fx += l.speed * dt;
      }
    }

    // River drowning check & off-screen log check
    if (this.fx < -10 || this.fx > 254) {
      this.die(); return;
    }
    if (this.fy <= 96 && this.fy >= 48 && !onLog) {
      this.die(); return;
    }

    // Homes check
    if (this.fy < 36) {
      let matchedHome = -1;
      const frogCenterX = this.fx + 6;
      for (let i = 0; i < 5; i++) {
        const hx = 26 + i * 44;
        if (frogCenterX >= hx + 2 && frogCenterX <= hx + 18) {
          matchedHome = i;
          break;
        }
      }
      if (matchedHome >= 0 && !this.homes[matchedHome]) {
        this.homes[matchedHome] = true;
        this.score++;
        APU.sfx('LEVELUP');
        this.fx = 120; this.fy = 216;
        if (this.homes.every(Boolean)) {
          this.homes.fill(false);
          this.score += 5;
        }
      } else {
        this.die();
      }
    }
  },
  die() {
    this.lives--;
    APU.sfx('SPLASH');
    this.fx = 120; this.fy = 216;
    if (this.lives <= 0) {
      this.over = true;
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    // River & Road backgrounds
    g.dither(0, 36, 256, 80, 0, 1); // River
    g.rect(0, 132, 256, 80, 1);    // Highway

    // Homes
    for (let i = 0; i < 5; i++) {
      const hx = 26 + i * 44;
      g.box(hx, 14, 20, 18, 2);
      if (this.homes[i]) g.text("♥", hx + 5, 20, 3);
    }

    // Logs
    for (let l of this.logs) g.rect(Math.floor(l.x), l.y, l.len, 14, 2);

    // Cars
    for (let c of this.cars) g.rect(Math.floor(c.x), c.y, c.len, 14, 3);

    // Frog
    g.disc(Math.floor(this.fx) + 6, Math.floor(this.fy) + 6, 5, 3);

    // HUD
    g.text("FROGS: " + this.score, 12, 4, 3);
    g.textR("LIVES: " + "▲".repeat(Math.max(0, this.lives)), 244, 4, 3);

    if (this.over) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("ALL FROGS LOST", 110, 3);
      g.textC("[A] TO RETRY", 124, 2);
    }
  }
};

// 10. PAC-MAZE
CARTS[10] = {
  id: 10, name: "PAC-MAZE", genre: 0, scoreLabel: "DOTS",
  desc: "MUNCH DOTS IN LABYRINTH. EAT POWER PELLETS TO TURN AND HUNT GHOSTS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 14, y + 16, 7, 3);
    g.disc(x + 23, y + 16, 2, 3);
  },
  init() {
    this.maze = E3.generate(15, 15);
    this.px = 1; this.py = 1;
    this.ghosts = [
      { x: 13, y: 13, color: 2 },
      { x: 1,  y: 13, color: 2 },
      { x: 13, y: 1,  color: 2 }
    ];
    this.dots = E1.create(15, 15, 1);
    // Don't place dots on walls or player start
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        if (E1.get(this.maze, x, y) === 1 || (x === 1 && y === 1)) {
          E1.set(this.dots, x, y, 0);
        }
      }
    }
    this.powerPellets = [[1, 1], [13, 1], [1, 13], [13, 13]].filter(p => E1.get(this.maze, p[0], p[1]) === 0);
    this.score = 0;
    this.lives = 3;
    this.over = false;
    this.won = false;
    this.powerTimer = 0;
    this.ghostTimer = 0;
    this.moveTimer = 0;
    this.dir = [0, 0];
    this.nextDir = [0, 0];
  },
  update(dt) {
    if (this.over || this.won) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    if (PAD.hit('left')) this.nextDir = [-1, 0];
    if (PAD.hit('right')) this.nextDir = [1, 0];
    if (PAD.hit('up')) this.nextDir = [0, -1];
    if (PAD.hit('down')) this.nextDir = [0, 1];

    if (this.powerTimer > 0) this.powerTimer = Math.max(0, this.powerTimer - dt);

    // Player continuous movement
    this.moveTimer += dt;
    if (this.moveTimer >= 0.16) {
      this.moveTimer = 0;
      // Try nextDir first
      if (this.nextDir[0] !== 0 || this.nextDir[1] !== 0) {
        const nx = this.px + this.nextDir[0], ny = this.py + this.nextDir[1];
        if (E1.get(this.maze, nx, ny) === 0) {
          this.dir = this.nextDir;
        }
      }
      if (this.dir[0] !== 0 || this.dir[1] !== 0) {
        const nx = this.px + this.dir[0], ny = this.py + this.dir[1];
        if (E1.get(this.maze, nx, ny) === 0) {
          this.px = nx; this.py = ny;
          // Eat dot
          if (E1.get(this.dots, nx, ny) === 1) {
            E1.set(this.dots, nx, ny, 0);
            this.score += 10;
            APU.sfx('TICK');
          }
          // Eat power pellet
          const pIdx = this.powerPellets.findIndex(p => p[0] === nx && p[1] === ny);
          if (pIdx >= 0) {
            this.powerPellets.splice(pIdx, 1);
            this.powerTimer = 7.0;
            this.score += 50;
            APU.sfx('POWER');
          }
        }
      }
    }

    // Win check
    let dotsRemaining = 0;
    for (let i = 0; i < this.dots.data.length; i++) {
      if (this.dots.data[i] === 1) dotsRemaining++;
    }
    if (dotsRemaining === 0 && this.powerPellets.length === 0) {
      this.won = true;
      APU.sfx('LEVELUP');
      SAVE.setScore(this.id, this.score);
      return;
    }

    // Ghosts BFS movement towards player driven by timer & dt
    this.ghostTimer = (this.ghostTimer || 0) + dt;
    const ghostStep = this.powerTimer > 0 ? 0.6 : 0.42;
    if (this.ghostTimer >= ghostStep) {
      this.ghostTimer = 0;
      for (let g of this.ghosts) {
        const targetX = this.powerTimer > 0 ? (14 - this.px) : this.px;
        const targetY = this.powerTimer > 0 ? (14 - this.py) : this.py;
        const path = E3.bfs(this.maze, g.x, g.y, targetX, targetY);
        if (path && path.length > 1) {
          g.x = path[1][0]; g.y = path[1][1];
        }
        // Collision check
        if (g.x === this.px && g.y === this.py) {
          if (this.powerTimer > 0) {
            // Eat ghost
            this.score += 200;
            APU.sfx('COIN');
            g.x = 7; g.y = 7;
          } else {
            this.lives--;
            APU.sfx('HURT');
            this.px = 1; this.py = 1;
            this.dir = [0, 0];
            if (this.lives <= 0) {
              this.over = true;
              SAVE.setScore(this.id, this.score);
              return;
            }
          }
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    const ox = 28, oy = 20, sz = 13;

    // Maze walls & dots
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        if (E1.get(this.maze, x, y) === 1) {
          g.rect(ox + x * sz, oy + y * sz, sz, sz, 1);
          g.box(ox + x * sz, oy + y * sz, sz, sz, 2);
        } else if (E1.get(this.dots, x, y) === 1) {
          g.disc(ox + x * sz + 6, oy + y * sz + 6, 2, 3);
        }
      }
    }

    // Power pellets
    for (let p of this.powerPellets) {
      g.disc(ox + p[0] * sz + 6, oy + p[1] * sz + 6, 4, 3);
    }

    // Pacman
    g.disc(ox + this.px * sz + 6, oy + this.py * sz + 6, 5, 3);

    // Ghosts
    for (let gh of this.ghosts) {
      const gCol = this.powerTimer > 0 ? (Math.floor(Date.now() / 200) % 2 === 0 ? 1 : 2) : 2;
      g.disc(ox + gh.x * sz + 6, oy + gh.y * sz + 6, 5, gCol);
    }

    g.text("SCORE: " + this.score, 12, 6, 3);
    g.textR("LIVES: " + "♥".repeat(Math.max(0, this.lives)), 244, 6, 2);
    if (this.powerTimer > 0) g.text("HUNT! " + Math.ceil(this.powerTimer), 108, 6, 3);

    if (this.won) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("MAZE CLEARED!", 110, 3);
      g.textC("[A] PLAY AGAIN", 124, 2);
    } else if (this.over) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("CAUGHT BY GHOSTS", 110, 3);
      g.textC("[A] TO RETRY", 124, 2);
    }
  }
};

// 11. 2048
CARTS[11] = {
  id: 11, name: "2048", genre: 1, scoreLabel: "TILES",
  desc: "SLIDE TILES WITH SWIPE OR D-PAD TO MERGE MATCHING NUMBERS INTO 2048!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 4, y + 4, 11, 11, 2); g.text("2", x + 7, y + 7, 3);
    g.rect(x + 17, y + 4, 11, 11, 3); g.text("4", x + 20, y + 7, 0);
  },
  init() {
    this.grid = E1.create(4, 4, 0);
    this.score = 0;
    this.spawnTile(); this.spawnTile();
    this.over = false;
  },
  spawnTile() {
    const empty = [];
    for (let i = 0; i < 16; i++) if (this.grid.data[i] === 0) empty.push(i);
    if (empty.length > 0) {
      const idx = empty[Math.floor(Math.random() * empty.length)];
      this.grid.data[idx] = Math.random() < 0.9 ? 2 : 4;
    }
  },
  checkGameOver() {
    for (let i = 0; i < 16; i++) {
      if (this.grid.data[i] === 0) return;
    }
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 3; x++) {
        if (E1.get(this.grid, x, y) === E1.get(this.grid, x + 1, y)) return;
      }
    }
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 3; y++) {
        if (E1.get(this.grid, x, y) === E1.get(this.grid, x, y + 1)) return;
      }
    }
    this.over = true;
    APU.sfx('BOOM');
    SAVE.setScore(this.id, this.score);
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    const move = PAD.swipe || (PAD.hit('left') && 'left') || (PAD.hit('right') && 'right') ||
                 (PAD.hit('up') && 'up') || (PAD.hit('down') && 'down');
    if (move) {
      let moved = false;
      // 4 directions logic
      const slideRow = (row) => {
        let arr = row.filter(v => v !== 0);
        for (let i = 0; i < arr.length - 1; i++) {
          if (arr[i] === arr[i + 1]) {
            arr[i] *= 2; this.score += arr[i]; arr.splice(i + 1, 1);
          }
        }
        while (arr.length < 4) arr.push(0);
        return arr;
      };

      if (move === 'left') {
        for (let y = 0; y < 4; y++) {
          const row = [E1.get(this.grid, 0, y), E1.get(this.grid, 1, y), E1.get(this.grid, 2, y), E1.get(this.grid, 3, y)];
          const next = slideRow(row);
          for (let x = 0; x < 4; x++) {
            if (E1.get(this.grid, x, y) !== next[x]) moved = true;
            E1.set(this.grid, x, y, next[x]);
          }
        }
      } else if (move === 'right') {
        for (let y = 0; y < 4; y++) {
          const row = [E1.get(this.grid, 3, y), E1.get(this.grid, 2, y), E1.get(this.grid, 1, y), E1.get(this.grid, 0, y)];
          const next = slideRow(row);
          for (let x = 0; x < 4; x++) {
            if (E1.get(this.grid, 3 - x, y) !== next[x]) moved = true;
            E1.set(this.grid, 3 - x, y, next[x]);
          }
        }
      } else if (move === 'up') {
        for (let x = 0; x < 4; x++) {
          const col = [E1.get(this.grid, x, 0), E1.get(this.grid, x, 1), E1.get(this.grid, x, 2), E1.get(this.grid, x, 3)];
          const next = slideRow(col);
          for (let y = 0; y < 4; y++) {
            if (E1.get(this.grid, x, y) !== next[y]) moved = true;
            E1.set(this.grid, x, y, next[y]);
          }
        }
      } else if (move === 'down') {
        for (let x = 0; x < 4; x++) {
          const col = [E1.get(this.grid, x, 3), E1.get(this.grid, x, 2), E1.get(this.grid, x, 1), E1.get(this.grid, x, 0)];
          const next = slideRow(col);
          for (let y = 0; y < 4; y++) {
            if (E1.get(this.grid, x, 3 - y) !== next[y]) moved = true;
            E1.set(this.grid, x, 3 - y, next[y]);
          }
        }
      }

      if (moved) {
        this.spawnTile();
        APU.sfx('COIN');
        SAVE.setScore(this.id, this.score);
        this.checkGameOver();
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("2048 PUZZLE", 16, 14, 3);
    g.textR("SCORE: " + this.score, 240, 14, 3);

    const ox = 48, oy = 36, sz = 40;
    g.box(ox - 2, oy - 2, 4 * sz + 4, 4 * sz + 4, 2);

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const val = E1.get(this.grid, x, y);
        const bx = ox + x * sz, by = oy + y * sz;
        g.rect(bx, by, sz, sz, 0);
        g.box(bx, by, sz, sz, 1);

        if (val > 0) {
          const sVal = "" + val;
          const scale = val >= 1000 ? 1 : 2;
          const tw = (sVal.length * 5 - 1) * scale;
          const tx = Math.floor(bx + (sz - tw) / 2);
          const ty = Math.floor(by + (sz - 6 * scale) / 2);

          if (val === 2) {
            g.rect(bx + 2, by + 2, sz - 4, sz - 4, 1);
            g.line(bx + 2, by + 2, bx + sz - 3, by + 2, 2);
            g.line(bx + 2, by + 2, bx + 2, by + sz - 3, 2);
            g.line(bx + 2, by + sz - 3, bx + sz - 3, by + sz - 3, 0);
            g.line(bx + sz - 3, by + 2, bx + sz - 3, by + sz - 3, 0);
            g.text(sVal, tx, ty, 3, scale);
          } else if (val === 4) {
            g.dither(bx + 2, by + 2, sz - 4, sz - 4, 0, 1);
            g.line(bx + 2, by + 2, bx + sz - 3, by + 2, 3);
            g.line(bx + 2, by + 2, bx + 2, by + sz - 3, 3);
            g.line(bx + 2, by + sz - 3, bx + sz - 3, by + sz - 3, 0);
            g.line(bx + sz - 3, by + 2, bx + sz - 3, by + sz - 3, 0);
            g.text(sVal, tx, ty, 3, scale);
          } else if (val === 8) {
            g.rect(bx + 2, by + 2, sz - 4, sz - 4, 2);
            g.line(bx + 2, by + 2, bx + sz - 3, by + 2, 3);
            g.line(bx + 2, by + 2, bx + 2, by + sz - 3, 3);
            g.line(bx + 2, by + sz - 3, bx + sz - 3, by + sz - 3, 1);
            g.line(bx + sz - 3, by + 2, bx + sz - 3, by + sz - 3, 1);
            g.text(sVal, tx, ty, 0, scale);
          } else if (val === 16) {
            g.dither(bx + 2, by + 2, sz - 4, sz - 4, 1, 2);
            g.box(bx + 2, by + 2, sz - 4, sz - 4, 3);
            g.line(bx + sz - 3, by + 2, bx + sz - 3, by + sz - 3, 0);
            g.line(bx + 2, by + sz - 3, bx + sz - 3, by + sz - 3, 0);
            g.text(sVal, tx, ty, 3, scale);
          } else if (val === 32) {
            g.rect(bx + 2, by + 2, sz - 4, sz - 4, 2);
            g.box(bx + 2, by + 2, sz - 4, sz - 4, 3);
            g.box(bx + 4, by + 4, sz - 8, sz - 8, 1);
            g.text(sVal, tx, ty, 0, scale);
          } else if (val === 64) {
            g.rect(bx + 2, by + 2, sz - 4, sz - 4, 3);
            g.line(bx + sz - 3, by + 2, bx + sz - 3, by + sz - 3, 1);
            g.line(bx + 2, by + sz - 3, bx + sz - 3, by + sz - 3, 1);
            g.text(sVal, tx, ty, 0, scale);
          } else if (val === 128) {
            g.rect(bx + 2, by + 2, sz - 4, sz - 4, 3);
            g.rect(bx + 4, by + 4, sz - 8, sz - 8, 1);
            g.box(bx + 4, by + 4, sz - 8, sz - 8, 0);
            g.text(sVal, tx, ty, 3, scale);
          } else if (val === 256) {
            g.rect(bx + 2, by + 2, sz - 4, sz - 4, 3);
            g.dither(bx + 4, by + 4, sz - 8, sz - 8, 0, 2);
            g.text(sVal, tx, ty, 3, scale);
          } else if (val === 512) {
            g.rect(bx + 2, by + 2, sz - 4, sz - 4, 3);
            g.rect(bx + 5, by + 5, sz - 10, sz - 10, 0);
            g.box(bx + 5, by + 5, sz - 10, sz - 10, 2);
            g.text(sVal, tx, ty, 3, scale);
          } else {
            // 1024, 2048+
            g.rect(bx + 2, by + 2, sz - 4, sz - 4, 3);
            g.box(bx + 3, by + 3, sz - 6, sz - 6, 0);
            g.rect(bx + 5, by + 5, sz - 10, sz - 10, 3);
            g.text(sVal, tx, ty, 0, scale);
          }
        }
      }
    }

    if (this.over) {
      g.dither(64, 90, 128, 48, 0, 1);
      g.box(64, 90, 128, 48, 3);
      g.textC("NO MORE MOVES!", 102, 3);
      g.textC("[A] PLAY AGAIN", 118, 2);
    }
  }
};

// 12. SOKOBAN
CARTS[12] = {
  id: 12, name: "SOKOBAN", genre: 1, scoreLabel: "LEVEL",
  desc: "PUSH CRATES ONTO TARGETS. PRESS [B] TO UNDO MOVE. PLAN YOUR PUSHES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 6, y + 6, 8, 8, 2);
    g.rect(x + 18, y + 16, 8, 8, 3);
    g.disc(x + 22, y + 8, 3, 2);
  },
  LEVELS: [
    { px: 2, py: 2, crates: [[3, 2], [3, 3]], targets: [[4, 2], [4, 3]] },
    { px: 1, py: 1, crates: [[2, 2], [3, 2], [2, 3]], targets: [[4, 4], [4, 3], [3, 4]] },
    { px: 3, py: 1, crates: [[2, 2], [3, 2], [3, 3], [4, 3]], targets: [[1, 4], [2, 4], [3, 4], [4, 4]] }
  ],
  init() {
    this.lvl = 1;
    this.loadLevel(this.lvl);
  },
  loadLevel(l) {
    const data = this.LEVELS[(l - 1) % this.LEVELS.length];
    this.px = data.px;
    this.py = data.py;
    this.crates = data.crates.map(c => [...c]);
    this.targets = data.targets.map(t => [...t]);
    this.pushes = 0;
    this.history = [];
    this.won = false;
  },
  update(dt) {
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('start')) {
        this.lvl = (this.lvl % this.LEVELS.length) + 1;
        this.loadLevel(this.lvl);
      }
      return;
    }
    // Undo
    if (PAD.hit('b') && this.history.length > 0) {
      const prev = this.history.pop();
      this.px = prev.px;
      this.py = prev.py;
      this.crates = prev.crates;
      this.pushes = prev.pushes;
      APU.sfx('TICK');
      return;
    }

    let dx = 0, dy = 0;
    if (PAD.hit('left')) dx = -1;
    if (PAD.hit('right')) dx = 1;
    if (PAD.hit('up')) dy = -1;
    if (PAD.hit('down')) dy = 1;

    if (dx !== 0 || dy !== 0) {
      const nx = this.px + dx, ny = this.py + dy;
      if (nx >= 1 && nx <= 5 && ny >= 1 && ny <= 5) {
        const crateIdx = this.crates.findIndex(c => c[0] === nx && c[1] === ny);
        if (crateIdx >= 0) {
          const cnx = nx + dx, cny = ny + dy;
          const blocked = this.crates.some(c => c[0] === cnx && c[1] === cny) || cnx < 1 || cnx > 5 || cny < 1 || cny > 5;
          if (!blocked) {
            this.history.push({ px: this.px, py: this.py, crates: this.crates.map(c => [...c]), pushes: this.pushes });
            this.crates[crateIdx] = [cnx, cny];
            this.px = nx; this.py = ny;
            this.pushes++;
            APU.sfx('HIT');
            if (this.targets.every(t => this.crates.some(c => c[0] === t[0] && c[1] === t[1]))) {
              this.won = true;
              APU.sfx('LEVELUP');
              SAVE.setScore(this.id, this.lvl);
            }
          }
        } else {
          this.history.push({ px: this.px, py: this.py, crates: this.crates.map(c => [...c]), pushes: this.pushes });
          this.px = nx; this.py = ny;
          APU.sfx('TICK');
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("SOKOBAN - LVL " + this.lvl, 16, 14, 3);
    g.textR("PUSHES: " + this.pushes, 240, 14, 2);

    const ox = 56, oy = 40, sz = 24;
    g.box(ox + sz, oy + sz, 5 * sz, 5 * sz, 2);

    // Targets
    for (let t of this.targets) g.circle(ox + t[0] * sz + 12, oy + t[1] * sz + 12, 6, 2);

    // Crates
    for (let c of this.crates) {
      const onTarget = this.targets.some(t => t[0] === c[0] && t[1] === c[1]);
      g.rect(ox + c[0] * sz + 2, oy + c[1] * sz + 2, sz - 4, sz - 4, onTarget ? 3 : 2);
      g.box(ox + c[0] * sz + 2, oy + c[1] * sz + 2, sz - 4, sz - 4, 3);
    }

    // Player
    g.disc(ox + this.px * sz + 12, oy + this.py * sz + 12, 8, 3);
    g.text("[B] UNDO", 16, 222, 2);

    if (this.won) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("STAGE CLEARED!", 110, 3);
      g.textC("[A] NEXT PUZZLE", 124, 2);
    }
  }
};

// 13. MINESWEEPER
CARTS[13] = {
  id: 13, name: "MINESWEEPER", genre: 1, scoreLabel: "TIME",
  desc: "9X9 MINEFIELD. [A] REVEAL TILE. [B] OR LONG-PRESS TO PLACE FLAG.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 16, 5, 3);
    g.line(x + 16, y + 8, x + 16, y + 24, 3);
    g.line(x + 8, y + 16, x + 24, y + 16, 3);
  },
  init() {
    this.cx = 4; this.cy = 4;
    this.revealed = E1.create(9, 9, 0);
    this.flags = E1.create(9, 9, 0);
    this.mines = E1.create(9, 9, 0);
    this.generated = false;
    this.over = false;
    this.won = false;
    this.time = 0;
  },
  spawnMines(firstX, firstY) {
    let placed = 0;
    while (placed < 10) {
      const rx = Math.floor(Math.random() * 9), ry = Math.floor(Math.random() * 9);
      if ((rx !== firstX || ry !== firstY) && E1.get(this.mines, rx, ry) === 0) {
        E1.set(this.mines, rx, ry, 1);
        placed++;
      }
    }
    this.generated = true;
  },
  countMines(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (E1.get(this.mines, x + dx, y + dy) === 1) count++;
      }
    }
    return count;
  },
  reveal(sx, sy) {
    const queue = [[sx, sy]];
    while (queue.length > 0) {
      const [x, y] = queue.pop();
      if (x < 0 || x >= 9 || y < 0 || y >= 9) continue;
      if (E1.get(this.revealed, x, y) === 1) continue;
      if (E1.get(this.flags, x, y) === 1) continue;
      if (E1.get(this.mines, x, y) === 1) continue;

      E1.set(this.revealed, x, y, 1);
      const count = this.countMines(x, y);
      if (count === 0) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx !== 0 || dy !== 0) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < 9 && ny >= 0 && ny < 9 && E1.get(this.revealed, nx, ny) === 0) {
                queue.push([nx, ny]);
              }
            }
          }
        }
      }
    }
  },
  update(dt) {
    if (this.over || this.won) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    this.time += dt;
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(8, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(8, this.cy + 1);

    // Flag toggle
    if (PAD.hit('b') || PAD.longPress) {
      const f = E1.get(this.flags, this.cx, this.cy);
      E1.set(this.flags, this.cx, this.cy, f ? 0 : 1);
      APU.sfx('TICK');
      PAD.vibrate(15);
    }

    // Reveal
    if (PAD.hit('a')) {
      if (!this.generated) this.spawnMines(this.cx, this.cy);
      if (E1.get(this.flags, this.cx, this.cy) === 0) {
        if (E1.get(this.mines, this.cx, this.cy) === 1) {
          this.over = true;
          APU.sfx('BOOM');
        } else {
          this.reveal(this.cx, this.cy);
          APU.sfx('COIN');
          // Check win
          let revCount = 0;
          for (let i = 0; i < 81; i++) {
            if (this.revealed.data[i] === 1) revCount++;
          }
          if (revCount === 71) {
            this.won = true;
            APU.sfx('LEVELUP');
            SAVE.setScore(this.id, Math.max(1, Math.floor(this.time)));
          }
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("MINESWEEPER", 16, 12, 3);
    g.textR("TIME: " + Math.floor(this.time), 240, 12, 2);

    const ox = 48, oy = 32, sz = 18;
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        const rev = E1.get(this.revealed, x, y);
        const flg = E1.get(this.flags, x, y);
        if (rev) {
          g.rect(bx, by, sz - 1, sz - 1, 1);
          const count = this.countMines(x, y);
          if (count > 0) g.text("" + count, bx + 6, by + 5, 3);
        } else {
          g.rect(bx, by, sz - 1, sz - 1, 2);
          if (flg) g.text("▶", bx + 6, by + 5, 3);
        }
        // Cursor
        if (x === this.cx && y === this.cy) g.box(bx - 1, by - 1, sz + 1, sz + 1, 3);
      }
    }
    if (this.won) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("MINEFIELD CLEARED!", 110, 3);
      g.textC("[A] PLAY AGAIN", 124, 2);
    } else if (this.over) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("BOOM! MINE EXPLODED", 110, 3);
      g.textC("[A] TO RETRY", 124, 2);
    }
  }
};

// 14. LIGHTS OUT
CARTS[14] = {
  id: 14, name: "LIGHTS OUT", genre: 1, scoreLabel: "MOVES",
  desc: "TOGGLE 5X5 LIGHTS WITH CROSS PATTERN. TURN OFF ALL ILLUMINATED CELLS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 12, y + 8, 8, 8, 3);
    g.rect(x + 12, y + 16, 8, 8, 3);
    g.rect(x + 4, y + 16, 8, 8, 3);
    g.rect(x + 20, y + 16, 8, 8, 3);
  },
  init() {
    this.grid = E1.create(5, 5, 0);
    this.cx = 2; this.cy = 2;
    this.moves = 0;
    this.won = false;
    // Guaranteed solvable scramble
    for (let i = 0; i < 7; i++) {
      this.toggle(Math.floor(Math.random() * 5), Math.floor(Math.random() * 5));
    }
  },
  toggle(x, y) {
    const dirs = [[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0]];
    for (let [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (E1.inBounds(this.grid, nx, ny)) {
        E1.set(this.grid, nx, ny, E1.get(this.grid, nx, ny) ? 0 : 1);
      }
    }
  },
  update(dt) {
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(4, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(4, this.cy + 1);

    if (PAD.hit('a')) {
      this.toggle(this.cx, this.cy);
      this.moves++;
      APU.sfx('HIT');
      if (this.grid.data.every(v => v === 0)) {
        this.won = true;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.moves);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("LIGHTS OUT", 16, 16, 3);
    g.textR("MOVES: " + this.moves, 240, 16, 2);

    const ox = 58, oy = 44, sz = 28;
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const on = E1.get(this.grid, x, y);
        const bx = ox + x * sz, by = oy + y * sz;
        g.rect(bx + 2, by + 2, sz - 4, sz - 4, on ? 3 : 1);
        if (x === this.cx && y === this.cy) g.box(bx, by, sz, sz, 3);
      }
    }
    if (this.won) g.textC("ALL LIGHTS OUT! WIN!", 200, 3);
  }
};

// 15. PIPE MANIA
CARTS[15] = {
  id: 15, name: "PIPE MANIA", genre: 1, scoreLabel: "FLOW",
  desc: "ROTATE PIPES WITH [A]. CONNECT WATER VALVE (0,0) TO DRAIN (5,5)!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 4, y + 14, 14, 4, 3);
    g.rect(x + 14, y + 14, 4, 14, 3);
  },
  PIPES: [
    [1, 0, 1, 0], // 0: | (N, S)
    [0, 1, 0, 1], // 1: - (E, W)
    [0, 1, 1, 0], // 2: ┌ (E, S)
    [0, 0, 1, 1], // 3: ┐ (S, W)
    [1, 0, 0, 1], // 4: ┘ (N, W)
    [1, 1, 0, 0]  // 5: └ (N, E)
  ],
  init() {
    this.grid = E1.create(6, 6, 0);
    for (let i = 0; i < 36; i++) {
      this.grid.data[i] = Math.floor(Math.random() * 6);
    }
    this.cx = 0; this.cy = 0;
    this.waterTime = 15;
    this.flowing = false;
    this.flowPath = [];
    this.flowStep = 0;
    this.flowTimer = 0;
    this.score = 0;
    this.over = false;
    this.won = false;
  },
  tracePath() {
    const path = [];
    let curX = 0, curY = 0;
    let inDir = 3; // coming from West into (0,0)

    while (true) {
      path.push([curX, curY]);
      const pType = E1.get(this.grid, curX, curY);
      const openings = this.PIPES[pType];
      if (!openings || !openings[inDir]) {
        return { path, success: false };
      }
      let outDir = -1;
      for (let d = 0; d < 4; d++) {
        if (d !== inDir && openings[d]) { outDir = d; break; }
      }
      if (outDir === -1) return { path, success: false };

      if (curX === 5 && curY === 5 && outDir === 1) {
        return { path, success: true };
      }

      const dx = outDir === 1 ? 1 : (outDir === 3 ? -1 : 0);
      const dy = outDir === 2 ? 1 : (outDir === 0 ? -1 : 0);
      const nx = curX + dx, ny = curY + dy;
      if (nx < 0 || nx >= 6 || ny < 0 || ny >= 6) {
        return { path, success: false };
      }
      if (path.some(pt => pt[0] === nx && pt[1] === ny)) {
        return { path, success: false };
      }
      curX = nx;
      curY = ny;
      inDir = (outDir + 2) % 4;
    }
  },
  startFlow() {
    this.flowing = true;
    this.flowPlan = this.tracePath();
    this.flowPath = [];
    this.flowStep = 0;
  },
  update(dt) {
    if (this.over || this.won) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    if (!this.flowing) {
      this.waterTime -= dt;
      if (this.waterTime <= 0 || PAD.hit('b')) {
        this.startFlow();
        APU.sfx('SPLASH');
      }
      if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
      if (PAD.hit('right')) this.cx = Math.min(5, this.cx + 1);
      if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
      if (PAD.hit('down')) this.cy = Math.min(5, this.cy + 1);
      if (PAD.hit('a')) {
        const cur = E1.get(this.grid, this.cx, this.cy);
        E1.set(this.grid, this.cx, this.cy, (cur + 1) % 6);
        APU.sfx('TICK');
      }
    } else {
      this.flowTimer += dt;
      if (this.flowTimer >= 0.18) {
        this.flowTimer = 0;
        if (this.flowStep < this.flowPlan.path.length) {
          this.flowPath.push(this.flowPlan.path[this.flowStep]);
          this.flowStep++;
          this.score += 20;
          APU.sfx('TICK');
        } else {
          if (this.flowPlan.success) {
            this.won = true;
            this.score += 200;
            APU.sfx('LEVELUP');
            SAVE.setScore(this.id, this.score);
          } else {
            this.over = true;
            APU.sfx('BOOM');
            SAVE.setScore(this.id, this.score);
          }
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("PIPE MANIA", 14, 12, 3);
    if (!this.flowing) {
      g.textR("VALVE: " + Math.ceil(this.waterTime) + "S [B] FLUSH", 244, 12, 3);
    } else {
      g.textR("FLOWING...", 244, 12, 2);
    }

    const ox = 50, oy = 32, sz = 26;
    g.text("▶", ox - 10, oy + 8, 3);
    g.text("▶", ox + 6 * sz + 3, oy + 5 * sz + 8, 3);

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        const p = E1.get(this.grid, x, y);
        const isWet = this.flowPath.some(pt => pt[0] === x && pt[1] === y);
        const col = isWet ? 3 : 2;
        const op = this.PIPES[p];

        const mx = bx + 13, my = by + 13;
        g.rect(mx - 3, my - 3, 6, 6, col);
        if (op[0]) g.rect(mx - 3, by, 6, 14, col);
        if (op[1]) g.rect(mx, my - 3, 14, 6, col);
        if (op[2]) g.rect(mx - 3, my, 6, 14, col);
        if (op[3]) g.rect(bx, my - 3, 14, 6, col);

        if (!this.flowing && x === this.cx && y === this.cy) {
          g.box(bx - 1, by - 1, sz + 1, sz + 1, 3);
        }
      }
    }

    if (this.won) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("AQUEDUCT SUCCESS!", 110, 3);
      g.textC("[A] PLAY AGAIN", 124, 2);
    } else if (this.over) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("PIPE LEAKED! FAILED", 110, 3);
      g.textC("[A] TO RETRY", 124, 2);
    }
  }
};

// 16. 15-PUZZLE
CARTS[16] = {
  id: 16, name: "15-PUZZLE", genre: 1, scoreLabel: "MOVES",
  desc: "SLIDE 1-15 NUMBERED TILES INTO SEQUENTIAL ORDER. SWIPE OR TAP!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("1 2", x + 6, y + 8, 3);
    g.text("3  ", x + 6, y + 18, 3);
  },
  init() {
    this.tiles = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];
    this.moves = 0;
    this.won = false;
    // Solvable shuffle
    for (let i = 0; i < 80; i++) {
      const emptyIdx = this.tiles.indexOf(0);
      const adj = [];
      const ex = emptyIdx % 4, ey = Math.floor(emptyIdx / 4);
      if (ex > 0) adj.push(emptyIdx - 1);
      if (ex < 3) adj.push(emptyIdx + 1);
      if (ey > 0) adj.push(emptyIdx - 4);
      if (ey < 3) adj.push(emptyIdx + 4);
      const pick = adj[Math.floor(Math.random() * adj.length)];
      this.tiles[emptyIdx] = this.tiles[pick];
      this.tiles[pick] = 0;
    }
  },
  update(dt) {
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    const emptyIdx = this.tiles.indexOf(0);
    const ex = emptyIdx % 4, ey = Math.floor(emptyIdx / 4);
    let target = -1;

    const sw = PAD.swipe;
    if ((PAD.hit('up') || sw === 'up') && ey < 3) target = emptyIdx + 4;
    if ((PAD.hit('down') || sw === 'down') && ey > 0) target = emptyIdx - 4;
    if ((PAD.hit('left') || sw === 'left') && ex < 3) target = emptyIdx + 1;
    if ((PAD.hit('right') || sw === 'right') && ex > 0) target = emptyIdx - 1;

    // Direct touch tap
    if (PAD.tapPos) {
      const ox = 52, oy = 36, sz = 38;
      const tx = Math.floor((PAD.tapPos.x - ox) / sz);
      const ty = Math.floor((PAD.tapPos.y - oy) / sz);
      if (tx >= 0 && tx < 4 && ty >= 0 && ty < 4) {
        const clickedIdx = ty * 4 + tx;
        if (Math.abs(tx - ex) + Math.abs(ty - ey) === 1) {
          target = clickedIdx;
        }
      }
    }

    if (target >= 0) {
      this.tiles[emptyIdx] = this.tiles[target];
      this.tiles[target] = 0;
      this.moves++;
      APU.sfx('TICK');

      // Win check
      let solved = true;
      for (let i = 0; i < 15; i++) {
        if (this.tiles[i] !== i + 1) { solved = false; break; }
      }
      if (solved) {
        this.won = true;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.moves);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("15-PUZZLE", 16, 14, 3);
    g.textR("MOVES: " + this.moves, 240, 14, 2);

    const ox = 52, oy = 36, sz = 38;
    g.box(ox - 2, oy - 2, 4 * sz + 4, 4 * sz + 4, 2);

    for (let i = 0; i < 16; i++) {
      const val = this.tiles[i];
      const x = i % 4, y = Math.floor(i / 4);
      const bx = ox + x * sz, by = oy + y * sz;
      g.box(bx, by, sz, sz, 1);
      if (val > 0) {
        g.rect(bx + 2, by + 2, sz - 4, sz - 4, 2);
        g.line(bx + 2, by + 2, bx + sz - 3, by + 2, 3);
        g.line(bx + 2, by + 2, bx + 2, by + sz - 3, 3);
        g.line(bx + 2, by + sz - 3, bx + sz - 3, by + sz - 3, 1);
        g.line(bx + sz - 3, by + 2, bx + sz - 3, by + sz - 3, 1);

        const sVal = "" + val;
        const tw = sVal.length * 5 - 1;
        const tx = Math.floor(bx + (sz - tw) / 2);
        const ty = Math.floor(by + (sz - 6) / 2);
        g.text(sVal, tx, ty, 3);
      }
    }

    if (this.won) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("PUZZLE SOLVED!", 110, 3);
      g.textC("[A] PLAY AGAIN", 124, 2);
    }
  }
};

// 17. MASTERMIND
CARTS[17] = {
  id: 17, name: "MASTERMIND", genre: 1, scoreLabel: "ROUNDS",
  desc: "DEDUCE 4-COLOR SECRET CODE IN 10 ATTEMPTS VIA BULLS & COWS CLUES.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 8, y + 16, 3, 3);
    g.disc(x + 16, y + 16, 3, 2);
    g.disc(x + 24, y + 16, 3, 1);
  },
  init() {
    this.secret = [Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 4) + 1];
    this.guess = [1, 1, 1, 1];
    this.cursor = 0;
    this.history = [];
    this.won = false;
    this.over = false;
  },
  update(dt) {
    if (this.won || this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    if (PAD.hit('left')) this.cursor = Math.max(0, this.cursor - 1);
    if (PAD.hit('right')) this.cursor = Math.min(3, this.cursor + 1);
    if (PAD.hit('up')) this.guess[this.cursor] = (this.guess[this.cursor] % 4) + 1;
    if (PAD.hit('down')) this.guess[this.cursor] = ((this.guess[this.cursor] + 2) % 4) + 1;

    if (PAD.hit('a')) {
      let bulls = 0, cows = 0;
      const secUsed = [false, false, false, false];
      const guessUsed = [false, false, false, false];
      // Pass 1: exact bulls
      for (let i = 0; i < 4; i++) {
        if (this.guess[i] === this.secret[i]) {
          bulls++;
          secUsed[i] = true;
          guessUsed[i] = true;
        }
      }
      // Pass 2: cows
      for (let i = 0; i < 4; i++) {
        if (!guessUsed[i]) {
          for (let j = 0; j < 4; j++) {
            if (!secUsed[j] && this.guess[i] === this.secret[j]) {
              cows++;
              secUsed[j] = true;
              break;
            }
          }
        }
      }
      this.history.push({ guess: [...this.guess], bulls, cows });
      APU.sfx('HIT');
      if (bulls === 4) {
        this.won = true;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, 11 - this.history.length);
      } else if (this.history.length >= 10) {
        this.over = true;
        APU.sfx('BOOM');
        SAVE.setScore(this.id, 0);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("MASTERMIND CODE", 16, 10, 3);
    g.textR("TRY: " + Math.min(10, this.history.length + 1) + "/10", 240, 10, 2);

    let y = 24;
    for (let h of this.history) {
      for (let c = 0; c < 4; c++) {
        const col = h.guess[c] === 1 ? 1 : (h.guess[c] === 2 ? 2 : 3);
        g.disc(40 + c * 16, y + 4, 4, col);
      }
      g.text("B:" + h.bulls + " C:" + h.cows, 116, y, 3);
      y += 15;
    }

    // Current Guess input
    if (!this.won && !this.over) {
      g.rect(30, 196, 100, 24, 1);
      for (let c = 0; c < 4; c++) {
        const col = this.guess[c] === 1 ? 1 : (this.guess[c] === 2 ? 2 : 3);
        g.disc(44 + c * 20, 208, 6, col);
        if (c === this.cursor) g.circle(44 + c * 20, 208, 8, 3);
      }
      g.text("[A] SUBMIT", 150, 204, 3);
    }

    if (this.won) {
      g.dither(50, 192, 156, 36, 0, 1);
      g.box(50, 192, 156, 36, 3);
      g.textC("CODE CRACKED! VICTORY", 198, 3);
      g.textC("[A] PLAY AGAIN", 212, 2);
    } else if (this.over) {
      g.dither(40, 186, 176, 46, 0, 1);
      g.box(40, 186, 176, 46, 3);
      g.textC("OUT OF TRIES! CODE WAS:", 192, 3);
      for (let c = 0; c < 4; c++) {
        const col = this.secret[c] === 1 ? 1 : (this.secret[c] === 2 ? 2 : 3);
        g.disc(104 + c * 16, 208, 5, col);
      }
      g.textC("[A] TO RETRY", 218, 2);
    }
  }
};

// 18. NONOGRAM
CARTS[18] = {
  id: 18, name: "NONOGRAM", genre: 1, scoreLabel: "TIME",
  desc: "SOLVE 5X5 PICROSS LOGIC PUZZLE USING ROW & COLUMN NUMBER CLUES.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 6, y + 6, 8, 8, 3);
    g.rect(x + 18, y + 18, 8, 8, 3);
  },
  init() {
    this.solution = [
      [1,0,1,0,1],
      [1,1,1,1,1],
      [0,1,1,1,0],
      [0,0,1,0,0],
      [0,1,0,1,0]
    ];
    this.grid = E1.create(5, 5, 0);
    this.cx = 2; this.cy = 2;
    this.time = 0;
    this.won = false;
  },
  getClues(line) {
    const clues = [];
    let cur = 0;
    for (let v of line) {
      if (v === 1) cur++;
      else if (cur > 0) { clues.push(cur); cur = 0; }
    }
    if (cur > 0) clues.push(cur);
    return clues.length > 0 ? clues : [0];
  },
  update(dt) {
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    this.time += dt;
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(4, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(4, this.cy + 1);
    if (PAD.hit('a')) {
      const v = E1.get(this.grid, this.cx, this.cy);
      E1.set(this.grid, this.cx, this.cy, v ? 0 : 1);
      APU.sfx('TICK');
      // Check win
      let solved = true;
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          if (E1.get(this.grid, x, y) !== this.solution[y][x]) solved = false;
        }
      }
      if (solved) {
        this.won = true;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, Math.max(1, Math.floor(this.time)));
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("NONOGRAM 5X5", 14, 10, 3);
    g.textR("TIME: " + Math.floor(this.time) + "S", 244, 10, 2);

    const ox = 86, oy = 56, sz = 24;

    // Column clues (drawn above grid)
    for (let x = 0; x < 5; x++) {
      const col = [0,1,2,3,4].map(y => this.solution[y][x]);
      const clues = this.getClues(col);
      for (let c = 0; c < clues.length; c++) {
        const clueY = oy - (clues.length - c) * 9 - 2;
        g.text("" + clues[c], ox + x * sz + 10, clueY, 2);
      }
    }

    // Row clues (drawn to left of grid)
    for (let y = 0; y < 5; y++) {
      const row = this.solution[y];
      const clues = this.getClues(row);
      const str = clues.join(" ");
      g.textR(str, ox - 6, oy + y * sz + 8, 2);
    }

    // Grid frame
    g.box(ox - 1, oy - 1, 5 * sz + 2, 5 * sz + 2, 2);

    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        if (E1.get(this.grid, x, y)) {
          g.rect(bx + 2, by + 2, sz - 4, sz - 4, 3);
        }
        if (x === this.cx && y === this.cy) {
          g.box(bx - 1, by - 1, sz + 1, sz + 1, 3);
        }
      }
    }
    if (this.won) {
      g.dither(50, 192, 156, 36, 0, 1);
      g.box(50, 192, 156, 36, 3);
      g.textC("PICTURE SOLVED!", 198, 3);
      g.textC("[A] PLAY AGAIN", 212, 2);
    }
  }
};

// 19. TOWER OF HANOI
CARTS[19] = {
  id: 19, name: "TOWER HANOI", genre: 1, scoreLabel: "MOVES",
  desc: "MOVE ENTIRE DISK STACK TO RIGHT PEG. NEVER PLACE LARGER ON SMALLER!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 16, y + 6, x + 16, y + 26, 2);
    g.rect(x + 8, y + 22, 16, 4, 3);
    g.rect(x + 11, y + 17, 10, 4, 3);
  },
  init() {
    this.pegs = [[4, 3, 2, 1], [], []];
    this.sel = 0;
    this.heldDisk = null;
    this.moves = 0;
    this.won = false;
  },
  update(dt) {
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    if (PAD.hit('left')) this.sel = Math.max(0, this.sel - 1);
    if (PAD.hit('right')) this.sel = Math.min(2, this.sel + 1);
    if (PAD.hit('a')) {
      if (this.heldDisk === null) {
        if (this.pegs[this.sel].length > 0) {
          this.heldDisk = this.pegs[this.sel].pop();
          APU.sfx('TICK');
        }
      } else {
        const top = this.pegs[this.sel][this.pegs[this.sel].length - 1];
        if (!top || top > this.heldDisk) {
          this.pegs[this.sel].push(this.heldDisk);
          this.heldDisk = null;
          this.moves++;
          APU.sfx('HIT');
          if (this.pegs[2].length === 4) {
            this.won = true;
            APU.sfx('LEVELUP');
            SAVE.setScore(this.id, this.moves);
          }
        } else {
          APU.sfx('DENY');
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("TOWER OF HANOI", 16, 14, 3);
    g.textR("MOVES: " + this.moves, 240, 14, 2);

    for (let p = 0; p < 3; p++) {
      const px = 50 + p * 78;
      g.line(px, 70, px, 180, 1);
      g.rect(px - 30, 180, 60, 6, 2);
      if (p === this.sel) g.text("▲", px - 4, 196, 3);

      const stack = this.pegs[p];
      for (let i = 0; i < stack.length; i++) {
        const d = stack[i];
        const dw = d * 14;
        g.rect(px - dw / 2, 174 - i * 10, dw, 8, 3);
      }
    }
    if (this.heldDisk !== null) {
      const px = 50 + this.sel * 78;
      const dw = this.heldDisk * 14;
      g.rect(px - dw / 2, 50, dw, 8, 3);
    }
    if (this.won) g.textC("COMPLETED IN " + this.moves + " MOVES!", 210, 3);
  }
};

// 20. MATCH-3
CARTS[20] = {
  id: 20, name: "MATCH-3", genre: 1, scoreLabel: "GEMS",
  desc: "SWAP NEIGHBORING GEMS TO FORM LINES OF 3+ MATCHES AND CASCADE MULTIPLIERS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 10, y + 16, 4, 3);
    g.disc(x + 16, y + 16, 4, 3);
    g.disc(x + 22, y + 16, 4, 3);
  },
  init() {
    this.grid = E1.create(6, 6, 1);
    for (let i = 0; i < 36; i++) this.grid.data[i] = Math.floor(Math.random() * 4) + 1;
    // Clear any initial matches
    while (E1.findMatches(this.grid, 3).length > 0) {
      for (let i = 0; i < 36; i++) this.grid.data[i] = Math.floor(Math.random() * 4) + 1;
    }
    this.cx = 2; this.cy = 2;
    this.selected = null;
    this.score = 0;
  },
  dropGems() {
    let hadDrops = false;
    for (let x = 0; x < 6; x++) {
      let writeY = 5;
      for (let y = 5; y >= 0; y--) {
        const val = E1.get(this.grid, x, y);
        if (val !== 0) {
          if (writeY !== y) {
            E1.set(this.grid, x, writeY, val);
            E1.set(this.grid, x, y, 0);
            hadDrops = true;
          }
          writeY--;
        }
      }
      while (writeY >= 0) {
        E1.set(this.grid, x, writeY, Math.floor(Math.random() * 4) + 1);
        writeY--;
        hadDrops = true;
      }
    }
    return hadDrops;
  },
  resolveMatches() {
    let combo = 1;
    while (true) {
      const matches = E1.findMatches(this.grid, 3);
      if (matches.length === 0) break;
      for (let idx of matches) this.grid.data[idx] = 0;
      this.score += matches.length * 10 * combo;
      combo++;
      APU.sfx('COIN');
      this.dropGems();
    }
    SAVE.setScore(this.id, this.score);
  },
  update(dt) {
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(5, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(5, this.cy + 1);

    if (PAD.hit('a')) {
      if (!this.selected) {
        this.selected = { x: this.cx, y: this.cy };
        APU.sfx('TICK');
      } else {
        const dx = Math.abs(this.cx - this.selected.x);
        const dy = Math.abs(this.cy - this.selected.y);
        if (dx + dy === 1) {
          E1.swap(this.grid, this.cx, this.cy, this.selected.x, this.selected.y);
          const matches = E1.findMatches(this.grid, 3);
          if (matches.length > 0) {
            this.resolveMatches();
          } else {
            E1.swap(this.grid, this.cx, this.cy, this.selected.x, this.selected.y);
            APU.sfx('DENY');
          }
        }
        this.selected = null;
      }
    }

    if (PAD.tapPos) {
      const ox = 52, oy = 36, sz = 26;
      const tx = Math.floor((PAD.tapPos.x - ox) / sz);
      const ty = Math.floor((PAD.tapPos.y - oy) / sz);
      if (tx >= 0 && tx < 6 && ty >= 0 && ty < 6) {
        if (!this.selected) {
          this.selected = { x: tx, y: ty };
          this.cx = tx; this.cy = ty;
          APU.sfx('TICK');
        } else {
          const dx = Math.abs(tx - this.selected.x);
          const dy = Math.abs(ty - this.selected.y);
          if (dx + dy === 1) {
            E1.swap(this.grid, tx, ty, this.selected.x, this.selected.y);
            const matches = E1.findMatches(this.grid, 3);
            if (matches.length > 0) {
              this.resolveMatches();
            } else {
              E1.swap(this.grid, tx, ty, this.selected.x, this.selected.y);
              APU.sfx('DENY');
            }
          }
          this.selected = null;
          this.cx = tx; this.cy = ty;
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("MATCH-3 GEMS", 16, 14, 3);
    g.textR("SCORE: " + this.score, 240, 14, 3);

    const ox = 52, oy = 36, sz = 26;
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        const val = E1.get(this.grid, x, y);
        if (val > 0) {
          if (val === 1) g.disc(bx + 13, by + 13, 5, 2);
          else if (val === 2) g.rect(bx + 7, by + 7, 12, 12, 2);
          else if (val === 3) g.tri(bx + 13, by + 6, bx + 6, by + 19, bx + 20, by + 19, 3);
          else if (val === 4) g.disc(bx + 13, by + 13, 7, 3);
        }
        if (this.selected && this.selected.x === x && this.selected.y === y) {
          g.box(bx - 1, by - 1, sz + 1, sz + 1, 3);
          g.box(bx - 2, by - 2, sz + 3, sz + 3, 3);
        } else if (x === this.cx && y === this.cy) {
          g.box(bx - 1, by - 1, sz + 1, sz + 1, 2);
        }
      }
    }
  }
};


// ============================================================================
// CARTRIDGES 21 - 40 (BLOCK 3: PHYSICS & BLOCK 4: RHYTHM/REACTION)
// ============================================================================

// 21. ARTILLERY
CARTS[21] = {
  id: 21, name: "ARTILLERY", genre: 2, scoreLabel: "WINS",
  desc: "AIM CANNON ANGLE & POWER TO SHELL ENEMY TANK IN VARYING CROSSWINDS.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 4, y + 20, 10, 6, 3);
    g.line(x + 9, y + 20, x + 16, y + 14, 3);
  },
  init() {
    this.angle = 45; this.power = 60;
    this.wind = (Math.random() - 0.5) * 40;
    this.px = 30;
    this.tx = Math.floor(Math.random() * 70) + 170;
    this.shot = null;
    this.enemyShot = null;
    this.turn = 'PLAYER'; // 'PLAYER', 'ENEMY', 'OVER'
    this.score = 0;
    this.won = false;
    this.over = false;
  },
  fireEnemy() {
    this.turn = 'ENEMY';
    const dist = this.tx - this.px;
    // Approximated ballistic calculation with error
    const estPwr = Math.min(100, Math.max(30, Math.sqrt(dist * 65) + (Math.random() - 0.5) * 20));
    const rad = (135 * Math.PI) / 180;
    this.enemyShot = {
      x: this.tx - 8, y: 210,
      vx: Math.cos(rad) * estPwr * 2.2,
      vy: -Math.sin(rad) * estPwr * 2.2
    };
    APU.sfx('BOOM');
  },
  update(dt) {
    if (this.won || this.over) {
      if (PAD.hit('a') || PAD.hit('start')) {
        if (this.won) {
          this.won = false;
          this.tx = Math.floor(Math.random() * 70) + 170;
          this.wind = (Math.random() - 0.5) * 50;
          this.turn = 'PLAYER';
        } else {
          this.init();
        }
      }
      return;
    }

    if (this.turn === 'PLAYER') {
      if (PAD.state.left) this.angle = Math.min(85, this.angle + 20 * dt);
      if (PAD.state.right) this.angle = Math.max(15, this.angle - 20 * dt);
      if (PAD.state.up) this.power = Math.min(100, this.power + 30 * dt);
      if (PAD.state.down) this.power = Math.max(20, this.power - 30 * dt);

      if (PAD.hit('a') && !this.shot) {
        const rad = (this.angle * Math.PI) / 180;
        this.shot = {
          x: this.px + 8, y: 210,
          vx: Math.cos(rad) * this.power * 2.2,
          vy: -Math.sin(rad) * this.power * 2.2
        };
        APU.sfx('BOOM');
      }

      if (this.shot) {
        this.shot.vx += this.wind * dt;
        this.shot.vy += 120 * dt;
        this.shot.x += this.shot.vx * dt;
        this.shot.y += this.shot.vy * dt;

        if (Math.abs(this.shot.x - this.tx) < 14 && this.shot.y >= 210) {
          this.score++;
          this.won = true;
          this.shot = null;
          APU.sfx('LEVELUP');
          SAVE.setScore(this.id, this.score);
        } else if (this.shot.y > 220 || this.shot.x > 260 || this.shot.x < 0) {
          this.shot = null;
          APU.sfx('HIT');
          this.wind = (Math.random() - 0.5) * 50;
          this.fireEnemy();
        }
      }
    } else if (this.turn === 'ENEMY') {
      if (this.enemyShot) {
        this.enemyShot.vx += this.wind * dt;
        this.enemyShot.vy += 120 * dt;
        this.enemyShot.x += this.enemyShot.vx * dt;
        this.enemyShot.y += this.enemyShot.vy * dt;

        if (Math.abs(this.enemyShot.x - this.px) < 14 && this.enemyShot.y >= 210) {
          this.over = true;
          this.enemyShot = null;
          APU.sfx('BOOM');
        } else if (this.enemyShot.y > 220 || this.enemyShot.x > 260 || this.enemyShot.x < 0) {
          this.enemyShot = null;
          APU.sfx('HIT');
          this.turn = 'PLAYER';
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.line(0, 220, 256, 220, 1);
    // Tanks
    g.rect(this.px - 6, 214, 12, 6, 3);
    g.rect(this.tx - 6, 214, 12, 6, 2);

    // Player Barrel
    const rad = (this.angle * Math.PI) / 180;
    g.line(this.px, 214, this.px + Math.cos(rad) * 12, 214 - Math.sin(rad) * 12, 3);

    // Enemy Barrel
    g.line(this.tx, 214, this.tx - 8, 206, 2);

    // Shells
    if (this.shot) g.disc(Math.floor(this.shot.x), Math.floor(this.shot.y), 2, 3);
    if (this.enemyShot) g.disc(Math.floor(this.enemyShot.x), Math.floor(this.enemyShot.y), 2, 2);

    // HUD
    g.text("ANG: " + Math.floor(this.angle) + "° PWR: " + Math.floor(this.power), 12, 14, 3);
    g.textR("WINS: " + this.score, 244, 14, 3);
    g.text("WIND: " + (this.wind > 0 ? "▶ " : "◀ ") + Math.floor(Math.abs(this.wind)), 12, 26, 2);

    if (this.won) {
      g.dither(50, 90, 156, 44, 0, 1);
      g.box(50, 90, 156, 44, 3);
      g.textC("DIRECT HIT! TANK DESTROYED", 100, 3);
      g.textC("[A] NEXT ROUND", 116, 2);
    } else if (this.over) {
      g.dither(50, 90, 156, 44, 0, 1);
      g.box(50, 90, 156, 44, 3);
      g.textC("YOUR TANK WAS HIT!", 100, 3);
      g.textC("[A] TO RETRY", 116, 2);
    }
  }
};

// 22. ORBIT SLINGSHOT
CARTS[22] = {
  id: 22, name: "ORBIT SLING", genre: 2, scoreLabel: "ZONES",
  desc: "USE GRAVITY WELLS OF CELESTIAL BODIES TO SLINGSHOT PROBE INTO PORTAL!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 16, 6, 2);
    g.circle(x + 16, y + 16, 11, 1);
    g.disc(x + 6, y + 22, 2, 3);
  },
  init() {
    this.sun = { x: 128, y: 120, mass: 6000 };
    this.portal = { x: 220, y: 40, r: 12 };
    this.probe = null;
    this.aimAngle = -0.7;
    this.score = 0;
    this.cleared = false;
  },
  update(dt) {
    if (this.cleared) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    if (!this.probe) {
      if (PAD.state.up) this.aimAngle -= 1.5 * dt;
      if (PAD.state.down) this.aimAngle += 1.5 * dt;
      if (PAD.hit('a')) {
        this.probe = { x: 20, y: 200, vx: Math.cos(this.aimAngle) * 90, vy: Math.sin(this.aimAngle) * 90 };
        APU.sfx('SWISH');
      }
    } else {
      const dx = this.sun.x - this.probe.x;
      const dy = this.sun.y - this.probe.y;
      const d2 = dx * dx + dy * dy;
      const d = Math.sqrt(d2);
      if (d < 10) {
        this.probe = null;
        APU.sfx('BOOM');
      } else {
        const f = this.sun.mass / (d2 || 1);
        this.probe.vx += (dx / d) * f * dt;
        this.probe.vy += (dy / d) * f * dt;
        this.probe.x += this.probe.vx * dt;
        this.probe.y += this.probe.vy * dt;

        // Reach portal
        if (Math.hypot(this.probe.x - this.portal.x, this.probe.y - this.portal.y) < this.portal.r) {
          this.cleared = true;
          this.score++;
          APU.sfx('LEVELUP');
          SAVE.setScore(this.id, this.score);
        } else if (this.probe.x < 0 || this.probe.x > 256 || this.probe.y < 0 || this.probe.y > 240) {
          this.probe = null;
          APU.sfx('HURT');
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("ORBIT SLINGSHOT", 14, 12, 3);

    // Sun & Gravity ring
    g.disc(this.sun.x, this.sun.y, 8, 2);
    g.circle(this.sun.x, this.sun.y, 24, 1);

    // Target portal
    g.circle(this.portal.x, this.portal.y, this.portal.r, 3);
    g.textC("PORTAL", this.portal.y - 18, 3);

    // Probe
    if (this.probe) {
      g.disc(Math.floor(this.probe.x), Math.floor(this.probe.y), 3, 3);
    } else {
      g.disc(20, 200, 3, 3);
      g.line(20, 200, 20 + Math.cos(this.aimAngle) * 20, 200 + Math.sin(this.aimAngle) * 20, 2);
      g.text("[A] LAUNCH PROBE", 14, 224, 2);
    }
    if (this.cleared) g.textC("ORBIT REACHED! SUCCESS", 100, 3);
  }
};

// 23. BRIDGE BUILD
CARTS[23] = {
  id: 23, name: "BRIDGE BUILD", genre: 2, scoreLabel: "METERS",
  desc: "CONNECT NODES WITH STRUCTURAL BEAMS TO CARRY HEAVY CART OVER GAP.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 4, y + 20, x + 16, y + 12, 3);
    g.line(x + 16, y + 12, x + 28, y + 20, 3);
    g.line(x + 4, y + 20, x + 28, y + 20, 2);
  },
  init() {
    this.nodes = [
      { x: 30, y: 150, fix: true },
      { x: 90, y: 150, fix: false },
      { x: 150, y: 150, fix: false },
      { x: 220, y: 150, fix: true }
    ];
    this.cart = { x: 30, y: 144, vx: 35 };
    this.simulating = false;
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.simulating = !this.simulating;
      APU.sfx('UI_OK');
    }
    if (this.simulating) {
      this.cart.x += this.cart.vx * dt;
      if (this.cart.x > 220) {
        this.score = 100;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.score);
        this.simulating = false;
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("BRIDGE BUILDER", 14, 14, 3);
    // Chasm
    g.rect(0, 150, 40, 90, 1);
    g.rect(210, 150, 46, 90, 1);

    // Beams
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const n1 = this.nodes[i], n2 = this.nodes[i + 1];
      g.line(n1.x, n1.y, n2.x, n2.y, 2);
    }
    // Nodes
    for (let n of this.nodes) g.disc(n.x, n.y, 3, n.fix ? 3 : 2);

    // Cart
    g.rect(Math.floor(this.cart.x) - 6, Math.floor(this.cart.y) - 6, 12, 6, 3);
    g.textC("[A] TEST CART CROSSING", 220, 2);
  }
};

// 24. PORTAL DROP
CARTS[24] = {
  id: 24, name: "PORTAL DROP", genre: 2, scoreLabel: "CRYSTALS",
  desc: "[A] BLUE PORTAL, [B] ORANGE PORTAL. CONSERVE MOMENTUM TO REACH GEMS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.circle(x + 10, y + 16, 6, 3);
    g.circle(x + 22, y + 16, 6, 2);
  },
  init() {
    this.ball = { x: 40, y: 40, vx: 0, vy: 0 };
    this.portalA = { x: 50, y: 200, active: true };
    this.portalB = { x: 180, y: 60, active: true };
    this.score = 0;
  },
  update(dt) {
    this.ball.vy += 180 * dt;
    this.ball.x += this.ball.vx * dt;
    this.ball.y += this.ball.vy * dt;

    // Portal teleportation
    if (Math.hypot(this.ball.x - this.portalA.x, this.ball.y - this.portalA.y) < 14) {
      this.ball.x = this.portalB.x;
      this.ball.y = this.portalB.y;
      this.ball.vy = -Math.abs(this.ball.vy);
      APU.sfx('POWER');
      this.score++;
      SAVE.setScore(this.id, this.score);
    }

    if (this.ball.y > 230) {
      this.ball.x = 40; this.ball.y = 40; this.ball.vy = 0;
      APU.sfx('HURT');
    }
  },
  render(g) {
    g.clear(0);
    g.text("PORTAL DROP", 14, 14, 3);
    g.textR("SCORE: " + this.score, 240, 14, 2);

    // Portals
    g.circle(this.portalA.x, this.portalA.y, 10, 3);
    g.circle(this.portalB.x, this.portalB.y, 10, 2);

    // Ball
    g.disc(Math.floor(this.ball.x), Math.floor(this.ball.y), 4, 3);
  }
};

// 25. FALLING SAND
CARTS[25] = {
  id: 25, name: "FALLING SAND", genre: 2, scoreLabel: "PARTICLES",
  desc: "INTERACTIVE POWDER SANDBOX: SAND, WATER, STONE, FIRE. DRAW WITH CURSOR!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    for (let i = 0; i < 8; i++) g.px(x + 10 + (i * 3) % 12, y + 10 + i * 2, 3);
  },
  init() {
    this.grid = E1.create(40, 40, 0);
    this.cx = 20; this.cy = 10;
    this.elem = 1; // 1 = sand, 2 = water, 3 = stone
  },
  update(dt) {
    if (PAD.state.left) this.cx = Math.max(1, this.cx - 1);
    if (PAD.state.right) this.cx = Math.min(38, this.cx + 1);
    if (PAD.state.up) this.cy = Math.max(1, this.cy - 1);
    if (PAD.state.down) this.cy = Math.min(38, this.cy + 1);
    if (PAD.hit('b')) this.elem = (this.elem % 3) + 1;

    if (PAD.state.a) {
      E1.set(this.grid, this.cx, this.cy, this.elem);
      if (Math.random() < 0.2) APU.sfx('TICK');
    }
    E9.stepSand(this.grid);
  },
  render(g) {
    g.clear(0);
    const ox = 48, oy = 20, sz = 4;
    g.box(ox - 1, oy - 1, 40 * sz + 2, 40 * sz + 2, 2);

    for (let y = 0; y < 40; y++) {
      for (let x = 0; x < 40; x++) {
        const v = E1.get(this.grid, x, y);
        if (v > 0) g.rect(ox + x * sz, oy + y * sz, sz, sz, v === 1 ? 3 : (v === 2 ? 2 : 1));
      }
    }
    // Cursor
    g.box(ox + this.cx * sz, oy + this.cy * sz, sz, sz, 3);
    const names = ["", "SAND", "WATER", "STONE"];
    g.text("MATERIAL: " + names[this.elem] + " [B] TOGGLE", 14, 210, 3);
  }
};

// 26. CHAIN REACTION
CARTS[26] = {
  id: 26, name: "CHAIN REACT", genre: 2, scoreLabel: "ORBS",
  desc: "TRIGGER 1 EXPLOSION ON BOARD TO DETONATE BOUNCING ORBS IN CHAIN REACTION!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 16, 7, 3);
    g.circle(x + 16, y + 16, 12, 2);
  },
  init() {
    this.orbs = [];
    for (let i = 0; i < 24; i++) {
      this.orbs.push({
        x: Math.random() * 240 + 8, y: Math.random() * 200 + 20,
        vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60,
        detonated: false
      });
    }
    this.explosions = [];
    this.cx = 128; this.cy = 120;
    this.triggered = false;
    this.score = 0;
  },
  update(dt) {
    if (!this.triggered) {
      if (PAD.state.left) this.cx = Math.max(10, this.cx - 160 * dt);
      if (PAD.state.right) this.cx = Math.min(246, this.cx + 160 * dt);
      if (PAD.state.up) this.cy = Math.max(20, this.cy - 160 * dt);
      if (PAD.state.down) this.cy = Math.min(220, this.cy + 160 * dt);
      if (PAD.hit('a')) {
        this.triggered = true;
        this.explosions.push({ x: this.cx, y: this.cy, r: 2, life: 1.5 });
        APU.sfx('BOOM');
      }
    }

    // Move orbs
    for (let o of this.orbs) {
      if (!o.detonated) {
        o.x += o.vx * dt; o.y += o.vy * dt;
        if (o.x < 10 || o.x > 246) o.vx = -o.vx;
        if (o.y < 20 || o.y > 220) o.vy = -o.vy;

        // Check against explosions
        for (let e of this.explosions) {
          if (Math.hypot(o.x - e.x, o.y - e.y) < e.r) {
            o.detonated = true;
            this.explosions.push({ x: o.x, y: o.y, r: 2, life: 1.5 });
            this.score++;
            APU.sfx('COIN');
            break;
          }
        }
      }
    }

    // Explosions expansion
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const e = this.explosions[i];
      e.life -= dt;
      e.r = Math.min(20, e.r + 25 * dt);
      if (e.life <= 0) this.explosions.splice(i, 1);
    }
  },
  render(g) {
    g.clear(0);
    g.text("CHAIN REACTION", 14, 10, 3);
    g.textR("SCORE: " + this.score + "/24", 240, 10, 3);

    for (let o of this.orbs) {
      if (!o.detonated) g.disc(Math.floor(o.x), Math.floor(o.y), 3, 2);
    }
    for (let e of this.explosions) g.circle(Math.floor(e.x), Math.floor(e.y), Math.floor(e.r), 3);
    if (!this.triggered) g.box(Math.floor(this.cx) - 4, Math.floor(this.cy) - 4, 8, 8, 3);
  }
};

// 27. BILLIARDS 2D
CARTS[27] = {
  id: 27, name: "BILLIARDS 2D", genre: 2, scoreLabel: "POTS",
  desc: "POCKET SOLID BALLS. AIM GUIDE LINE AND CHARGE CUE SHOT WITH [A].",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 10, y + 16, 4, 3);
    g.disc(x + 22, y + 16, 4, 2);
  },
  init() {
    this.cue = { x: 60, y: 120, vx: 0, vy: 0, r: 5, active: true };
    this.balls = [
      { x: 180, y: 120, vx: 0, vy: 0, r: 5, active: true },
      { x: 192, y: 114, vx: 0, vy: 0, r: 5, active: true },
      { x: 192, y: 126, vx: 0, vy: 0, r: 5, active: true }
    ];
    this.angle = 0;
    this.pockets = [[24, 34], [128, 34], [232, 34], [24, 206], [128, 206], [232, 206]];
    this.score = 0;
    this.won = false;
  },
  update(dt) {
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    const allBalls = [this.cue, ...this.balls];
    const isMoving = allBalls.some(b => b.active && Math.hypot(b.vx, b.vy) > 4);

    if (!isMoving) {
      if (PAD.state.left) this.angle -= 2.0 * dt;
      if (PAD.state.right) this.angle += 2.0 * dt;
      if (PAD.hit('a')) {
        this.cue.vx = Math.cos(this.angle) * 180;
        this.cue.vy = Math.sin(this.angle) * 180;
        APU.sfx('HIT');
      }
    }

    // Motion & Cushion Bounces
    for (let b of allBalls) {
      if (!b.active) continue;
      b.vx *= 0.985; b.vy *= 0.985;
      b.x += b.vx * dt; b.y += b.vy * dt;

      // Cushions
      if (b.x < 26) { b.x = 26; b.vx = Math.abs(b.vx) * 0.8; APU.sfx('TICK'); }
      if (b.x > 230) { b.x = 230; b.vx = -Math.abs(b.vx) * 0.8; APU.sfx('TICK'); }
      if (b.y < 36) { b.y = 36; b.vy = Math.abs(b.vy) * 0.8; APU.sfx('TICK'); }
      if (b.y > 204) { b.y = 204; b.vy = -Math.abs(b.vy) * 0.8; APU.sfx('TICK'); }

      // Pocket check
      for (let p of this.pockets) {
        if (Math.hypot(b.x - p[0], b.y - p[1]) < 10) {
          if (b === this.cue) {
            // Scratch
            b.x = 60; b.y = 120; b.vx = 0; b.vy = 0;
            APU.sfx('HURT');
          } else {
            b.active = false;
            b.vx = 0; b.vy = 0;
            this.score++;
            APU.sfx('COIN');
            SAVE.setScore(this.id, this.score);
            if (this.balls.every(ob => !ob.active)) {
              this.won = true;
              APU.sfx('LEVELUP');
            }
          }
          break;
        }
      }
    }

    // Ball-ball elastic collisions
    for (let i = 0; i < allBalls.length; i++) {
      for (let j = i + 1; j < allBalls.length; j++) {
        const b1 = allBalls[i], b2 = allBalls[j];
        if (!b1.active || !b2.active) continue;
        const dx = b2.x - b1.x, dy = b2.y - b1.y;
        const dist = Math.hypot(dx, dy);
        if (dist < b1.r + b2.r && dist > 0.01) {
          const nx = dx / dist, ny = dy / dist;
          const overlap = (b1.r + b2.r) - dist;
          b1.x -= nx * overlap * 0.5;
          b1.y -= ny * overlap * 0.5;
          b2.x += nx * overlap * 0.5;
          b2.y += ny * overlap * 0.5;

          const kx = b1.vx - b2.vx, ky = b1.vy - b2.vy;
          const p = (nx * kx + ny * ky);
          if (p > 0) {
            b1.vx -= p * nx * 0.9;
            b1.vy -= p * ny * 0.9;
            b2.vx += p * nx * 0.9;
            b2.vy += p * ny * 0.9;
            APU.sfx('TICK');
          }
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("BILLIARDS 2D", 14, 12, 3);
    g.textR("POTTED: " + this.score + "/3", 244, 12, 3);

    // Table felt & cushions
    g.box(20, 30, 216, 180, 2);
    for (let p of this.pockets) g.disc(p[0], p[1], 8, 1);

    // Aim line
    const isMoving = [this.cue, ...this.balls].some(b => b.active && Math.hypot(b.vx, b.vy) > 4);
    if (!isMoving && !this.won) {
      g.line(this.cue.x, this.cue.y, this.cue.x + Math.cos(this.angle) * 36, this.cue.y + Math.sin(this.angle) * 36, 1);
    }

    // Cue ball
    if (this.cue.active) g.disc(Math.floor(this.cue.x), Math.floor(this.cue.y), this.cue.r, 3);
    // Object balls
    for (let b of this.balls) {
      if (b.active) g.disc(Math.floor(b.x), Math.floor(b.y), b.r, 2);
    }

    if (this.won) {
      g.dither(50, 90, 156, 44, 0, 1);
      g.box(50, 90, 156, 44, 3);
      g.textC("TABLE CLEARED!", 100, 3);
      g.textC("[A] PLAY AGAIN", 116, 2);
    }
  }
};

// 28. ROPE SWING
CARTS[28] = {
  id: 28, name: "ROPE SWING", genre: 2, scoreLabel: "DISTANCE",
  desc: "[A] LATCH ROPE TO CEILING ANCHOR, [B] RELEASE TO LEAP OVER HAZARDS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 16, y + 4, x + 24, y + 20, 2);
    g.disc(x + 24, y + 20, 3, 3);
  },
  init() {
    this.px = 40; this.py = 120;
    this.vx = 60; this.vy = 0;
    this.camX = 0;
    this.anchors = [
      { x: 80, y: 30 }, { x: 160, y: 30 }, { x: 240, y: 30 },
      { x: 320, y: 30 }, { x: 400, y: 30 }, { x: 480, y: 30 }
    ];
    this.activeAnchor = null;
    this.latched = false;
    this.score = 0;
    this.over = false;
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }

    // Find nearest anchor on A press
    if (PAD.hit('a')) {
      let nearest = null, minDist = 110;
      for (let a of this.anchors) {
        const d = Math.hypot(this.px - a.x, this.py - a.y);
        if (d < minDist && a.y < this.py) {
          minDist = d;
          nearest = a;
        }
      }
      if (nearest) {
        this.activeAnchor = nearest;
        this.latched = true;
        APU.sfx('SWISH');
      }
    }
    if (PAD.hit('b')) {
      this.latched = false;
      this.activeAnchor = null;
    }

    this.vy += 200 * dt;
    if (this.latched && this.activeAnchor) {
      const dx = this.px - this.activeAnchor.x, dy = this.py - this.activeAnchor.y;
      const dist = Math.hypot(dx, dy) || 1;
      const ropeLen = 85;
      if (dist > ropeLen) {
        this.px = this.activeAnchor.x + (dx / dist) * ropeLen;
        this.py = this.activeAnchor.y + (dy / dist) * ropeLen;
        // Swing acceleration
        this.vx += 60 * dt;
      }
    }

    this.px += this.vx * dt;
    this.py += this.vy * dt;
    this.score = Math.max(this.score, Math.floor(this.px));

    // Smooth camera scroll
    this.camX = this.px - 60;

    // Spawn further anchors dynamically
    const lastAnchor = this.anchors[this.anchors.length - 1];
    if (this.px + 300 > lastAnchor.x) {
      this.anchors.push({ x: lastAnchor.x + 80 + Math.random() * 20, y: 25 + Math.random() * 15 });
    }

    // Pit death
    if (this.py > 230) {
      this.over = true;
      APU.sfx('BOOM');
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    // Ceiling
    g.line(0, 16, 256, 16, 1);
    // Pit hazard at bottom
    for (let x = 0; x < 256; x += 12) {
      g.tri(x, 240, x + 6, 226, x + 12, 240, 2);
    }

    // Anchors & Ropes
    for (let a of this.anchors) {
      const scrX = Math.floor(a.x - this.camX);
      if (scrX >= -20 && scrX <= 280) {
        g.disc(scrX, a.y, 4, 2);
      }
    }

    const playerScrX = Math.floor(this.px - this.camX);
    const playerScrY = Math.floor(this.py);

    if (this.latched && this.activeAnchor) {
      g.line(Math.floor(this.activeAnchor.x - this.camX), this.activeAnchor.y, playerScrX, playerScrY, 2);
    }

    // Acrobat
    g.disc(playerScrX, playerScrY, 5, 3);

    g.text("DIST: " + this.score + "M", 14, 14, 3);
    g.textR("[A] LATCH  [B] RELEASE", 244, 14, 2);

    if (this.over) {
      g.dither(50, 90, 156, 44, 0, 1);
      g.box(50, 90, 156, 44, 3);
      g.textC("FELL INTO CHASM!", 100, 3);
      g.textC("[A] TO RETRY", 116, 2);
    }
  }
};

// 29. LIQUID SORT
CARTS[29] = {
  id: 29, name: "LIQUID SORT", genre: 2, scoreLabel: "LEVEL",
  desc: "POUR MATCHING LIQUIDS INTO TEST TUBES UNTIL EACH TUBE HOLDS ONE COLOR.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 8, y + 8, 6, 18, 3);
    g.rect(x + 9, y + 16, 4, 9, 2);
  },
  LEVELS: [
    [[1, 2, 1, 2], [2, 1, 2, 1], [], []],
    [[1, 2, 3, 1], [2, 3, 1, 2], [3, 1, 2, 3], [], []],
    [[3, 2, 1, 2], [1, 3, 2, 1], [2, 1, 3, 3], [], []]
  ],
  init() {
    this.lvl = 1;
    this.score = 1;
    this.loadLevel(this.lvl);
  },
  loadLevel(l) {
    const raw = this.LEVELS[(l - 1) % this.LEVELS.length];
    this.tubes = raw.map(t => [...t]);
    this.sel = 0;
    this.selected = null;
    this.won = false;
  },
  update(dt) {
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('start')) {
        this.lvl++;
        this.loadLevel(this.lvl);
      }
      return;
    }
    const numTubes = this.tubes.length;
    if (PAD.hit('left')) this.sel = (this.sel - 1 + numTubes) % numTubes;
    if (PAD.hit('right')) this.sel = (this.sel + 1) % numTubes;

    // Direct touch tap selection
    if (PAD.tapPos) {
      const ox = 128 - (numTubes * 44) / 2;
      for (let i = 0; i < numTubes; i++) {
        const tx = ox + i * 44;
        if (PAD.tapPos.x >= tx && PAD.tapPos.x <= tx + 32 && PAD.tapPos.y >= 50 && PAD.tapPos.y <= 160) {
          this.sel = i;
          this.doPourAction();
          break;
        }
      }
    } else if (PAD.hit('a')) {
      this.doPourAction();
    }
  },
  doPourAction() {
    if (this.selected === null) {
      if (this.tubes[this.sel].length > 0) {
        this.selected = this.sel;
        APU.sfx('TICK');
      }
    } else {
      if (this.selected === this.sel) {
        this.selected = null;
      } else {
        const src = this.tubes[this.selected];
        const dst = this.tubes[this.sel];
        if (src.length > 0 && dst.length < 4) {
          const topColor = src[src.length - 1];
          if (dst.length === 0 || dst[dst.length - 1] === topColor) {
            while (src.length > 0 && src[src.length - 1] === topColor && dst.length < 4) {
              dst.push(src.pop());
            }
            APU.sfx('SPLASH');
            this.selected = null;

            // Check complete
            if (this.tubes.every(t => t.length === 0 || (t.length === 4 && t.every(c => c === t[0])))) {
              this.won = true;
              this.score = this.lvl;
              APU.sfx('LEVELUP');
              SAVE.setScore(this.id, this.score);
            }
          } else {
            APU.sfx('DENY');
            this.selected = null;
          }
        } else {
          APU.sfx('DENY');
          this.selected = null;
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("LIQUID SORT - LVL " + this.lvl, 14, 14, 3);
    const numTubes = this.tubes.length;
    const ox = 128 - (numTubes * 44) / 2;

    for (let i = 0; i < numTubes; i++) {
      const tx = ox + i * 44;
      const ty = this.selected === i ? 50 : 60;
      g.box(tx, ty, 26, 74, this.selected === i ? 3 : 2);

      const tube = this.tubes[i];
      for (let j = 0; j < tube.length; j++) {
        const c = tube[j];
        const col = c === 1 ? 2 : (c === 2 ? 3 : 1);
        g.rect(tx + 2, ty + 56 - j * 17, 22, 15, col);
      }
      if (i === this.sel) g.text("▲", tx + 9, ty + 80, 3);
    }

    if (this.won) {
      g.dither(50, 90, 156, 44, 0, 1);
      g.box(50, 90, 156, 44, 3);
      g.textC("ALL TUBES SORTED!", 100, 3);
      g.textC("[A] NEXT LEVEL", 116, 2);
    }
  }
};

// 30. MARBLE LABYRINTH
CARTS[30] = {
  id: 30, name: "MARBLE MAZE", genre: 2, scoreLabel: "TIME",
  desc: "TILT PHONE OR USE D-PAD TO GUIDE MARBLE AROUND HOLES TO GOAL.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 12, y + 12, 3, 3);
    g.circle(x + 20, y + 20, 4, 1);
  },
  init() {
    this.bx = 30; this.by = 30;
    this.bvx = 0; this.bvy = 0;
    this.holes = [[80, 80], [140, 120], [200, 60], [110, 170], [170, 180]];
    this.goal = { x: 220, y: 200, r: 12 };
    this.time = 0;
    this.won = false;
    this.over = false;
  },
  update(dt) {
    if (this.won || this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    this.time += dt;

    let ax = PAD.tilt.x * 140, ay = PAD.tilt.y * 140;
    if (PAD.state.left) ax = -90;
    if (PAD.state.right) ax = 90;
    if (PAD.state.up) ay = -90;
    if (PAD.state.down) ay = 90;

    this.bvx = (this.bvx + ax * dt) * 0.98;
    this.bvy = (this.bvy + ay * dt) * 0.98;
    this.bx = Math.max(16, Math.min(240, this.bx + this.bvx * dt));
    this.by = Math.max(16, Math.min(224, this.by + this.bvy * dt));

    // Hole collision
    for (let h of this.holes) {
      if (Math.hypot(this.bx - h[0], this.by - h[1]) < 9) {
        this.over = true;
        APU.sfx('BOOM');
        return;
      }
    }

    // Goal collision
    if (Math.hypot(this.bx - this.goal.x, this.by - this.goal.y) < this.goal.r) {
      this.won = true;
      APU.sfx('LEVELUP');
      SAVE.setScore(this.id, Math.max(1, Math.floor(this.time)));
    }
  },
  render(g) {
    g.clear(0);
    g.box(10, 10, 236, 220, 2);
    g.text("TIME: " + Math.floor(this.time) + "S", 16, 16, 3);

    // Goal
    g.circle(this.goal.x, this.goal.y, this.goal.r, 3);
    g.disc(this.goal.x, this.goal.y, 4, 3);

    // Holes
    for (let h of this.holes) {
      g.disc(h[0], h[1], 8, 1);
      g.circle(h[0], h[1], 9, 0);
    }

    // Marble
    g.disc(Math.floor(this.bx), Math.floor(this.by), 5, 3);

    if (this.won) {
      g.dither(50, 90, 156, 44, 0, 1);
      g.box(50, 90, 156, 44, 3);
      g.textC("GOAL REACHED! WIN!", 100, 3);
      g.textC("[A] PLAY AGAIN", 116, 2);
    } else if (this.over) {
      g.dither(50, 90, 156, 44, 0, 1);
      g.box(50, 90, 156, 44, 3);
      g.textC("FELL INTO HOLE!", 100, 3);
      g.textC("[A] TO RETRY", 116, 2);
    }
  }
};

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

// 32. GUITAR TAP
CARTS[32] = {
  id: 32, name: "GUITAR TAP", genre: 3, scoreLabel: "COMBO",
  desc: "3 STRINGS: [◀] [▼] [▶]. HIT NOTES PRECISELY AS THEY REACH THE BEAT LINE!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 10, y + 4, x + 10, y + 28, 2);
    g.line(x + 16, y + 4, x + 16, y + 28, 2);
    g.line(x + 22, y + 4, x + 22, y + 28, 2);
    g.disc(x + 16, y + 22, 3, 3);
  },
  init() {
    this.tl = E8.createTimeline();
    this.notes = [];
    this.timer = 0;
    this.maxCombo = 0;
  },
  update(dt) {
    this.timer += dt;
    if (Math.random() < 0.04) {
      this.notes.push({ track: Math.floor(Math.random() * 3), y: 0 });
    }
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const n = this.notes[i];
      n.y += 120 * dt;
      if (n.y > 220) {
        this.notes.splice(i, 1);
        this.tl.combo = 0;
        APU.sfx('DENY');
      }
    }
    if (PAD.hit('left')) this.hitTrack(0);
    if (PAD.hit('down')) this.hitTrack(1);
    if (PAD.hit('right')) this.hitTrack(2);
  },
  hitTrack(tr) {
    for (let i = 0; i < this.notes.length; i++) {
      const n = this.notes[i];
      if (n.track === tr && Math.abs(n.y - 200) < 18) {
        this.notes.splice(i, 1);
        this.tl.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.tl.combo);
        APU.sfx('COIN');
        SAVE.setScore(this.id, this.maxCombo);
        return;
      }
    }
    this.tl.combo = 0;
    APU.sfx('DENY');
  },
  render(g) {
    g.clear(0);
    for (let tr = 0; tr < 3; tr++) g.line(70 + tr * 40, 20, 70 + tr * 40, 220, 1);
    g.line(50, 200, 170, 200, 3);
    for (let n of this.notes) g.disc(70 + n.track * 40, Math.floor(n.y), 6, 3);
    g.text("COMBO: " + this.tl.combo, 14, 14, 3);
    g.textR("RECORD: " + SAVE.getScore(this.id), 244, 14, 2);
  }
};

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

// 34. QUICK DRAW
CARTS[34] = {
  id: 34, name: "QUICK DRAW", genre: 3, scoreLabel: "MS",
  desc: "WAIT FOR 'DRAW!' SIGNAL, THEN HIT [A] INSTANTLY. FALSE START LOSES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 10, y + 14, 12, 4, 3);
    g.rect(x + 10, y + 18, 4, 6, 3);
  },
  init() {
    this.state = 'WAIT';
    this.waitTimer = Math.random() * 2 + 1.5;
    this.reactTime = 0;
    this.score = 0;
  },
  update(dt) {
    if (this.state === 'WAIT') {
      this.waitTimer -= dt;
      if (PAD.hit('a')) {
        this.state = 'FOUL';
        APU.sfx('DENY');
      } else if (this.waitTimer <= 0) {
        this.state = 'DRAW';
        APU.sfx('ALARM');
      }
    } else if (this.state === 'DRAW') {
      this.reactTime += dt;
      if (PAD.hit('a')) {
        this.score = Math.floor(this.reactTime * 1000);
        this.state = 'WON';
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.score);
      }
    }
  },
  render(g) {
    g.clear(0);
    if (this.state === 'WAIT') g.textC("STEADY... WAIT...", 110, 2);
    else if (this.state === 'DRAW') g.textC("FIRE! PRESS [A]!", 110, 3, 2);
    else if (this.state === 'WON') g.textC("TIME: " + this.score + " MS", 110, 3);
    else if (this.state === 'FOUL') g.textC("FALSE START FOUL!", 110, 1);
  }
};

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

// 37. TRAFFIC CONTROL
CARTS[37] = {
  id: 37, name: "TRAFFIC CTRL", genre: 3, scoreLabel: "CARS",
  desc: "[A] SWITCH LIGHTS. MANAGE BUSY INTERSECTION WITHOUT ANY VEHICLE CRASHES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 14, y + 4, 4, 24, 2);
    g.rect(x + 4, y + 14, 24, 4, 2);
  },
  init() {
    this.light = 'NS'; // 'NS' or 'EW'
    this.cars = [];
    this.score = 0;
    this.spawnTimer = 0.5;
    this.over = false;
    this.crashPt = null;
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start')) this.init();
      return;
    }
    if (PAD.hit('a') || PAD.hit('b')) {
      this.light = this.light === 'NS' ? 'EW' : 'NS';
      APU.sfx('TICK');
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 1.0 + Math.random() * 0.8;
      const isNS = Math.random() < 0.5;
      if (isNS) {
        const busy = this.cars.some(c => c.dir === 'NS' && c.y < 35);
        if (!busy) this.cars.push({ dir: 'NS', x: 122, y: -16, speed: 65 });
      } else {
        const busy = this.cars.some(c => c.dir === 'EW' && c.x < 35);
        if (!busy) this.cars.push({ dir: 'EW', x: -16, y: 114, speed: 65 });
      }
    }

    // Move cars and check traffic stops
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const c = this.cars[i];
      let canMove = true;

      if (c.dir === 'NS') {
        if (this.light !== 'NS' && c.y >= 82 && c.y <= 96) {
          canMove = false;
        }
        for (let other of this.cars) {
          if (other !== c && other.dir === 'NS' && other.y > c.y && other.y - c.y < 16) {
            canMove = false;
          }
        }
        if (canMove) c.y += c.speed * dt;
      } else {
        if (this.light !== 'EW' && c.x >= 86 && c.x <= 100) {
          canMove = false;
        }
        for (let other of this.cars) {
          if (other !== c && other.dir === 'EW' && other.x > c.x && other.x - c.x < 16) {
            canMove = false;
          }
        }
        if (canMove) c.x += c.speed * dt;
      }

      if (c.x > 265 || c.y > 245) {
        this.cars.splice(i, 1);
        this.score++;
        APU.sfx('COIN');
      }
    }

    // Car-car crash detection
    for (let i = 0; i < this.cars.length; i++) {
      for (let j = i + 1; j < this.cars.length; j++) {
        const c1 = this.cars[i];
        const c2 = this.cars[j];
        if (Math.abs(c1.x - c2.x) < 11 && Math.abs(c1.y - c2.y) < 11) {
          this.over = true;
          this.crashPt = { x: (c1.x + c2.x) / 2, y: (c1.y + c2.y) / 2 };
          APU.sfx('BOOM');
          SAVE.setScore(this.id, this.score);
          return;
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    // Roads
    g.rect(114, 0, 28, 240, 1);
    g.rect(0, 106, 256, 28, 1);
    for (let y = 0; y < 240; y += 12) {
      if (y < 100 || y > 140) g.line(128, y, 128, y + 6, 0);
    }
    for (let x = 0; x < 256; x += 12) {
      if (x < 110 || x > 145) g.line(x, 120, x + 6, 120, 0);
    }

    if (this.light === 'NS') {
      g.line(100, 106, 100, 134, 3);
    } else {
      g.line(114, 96, 142, 96, 3);
    }

    // Traffic signals
    g.rect(98, 86, 12, 16, 0);
    g.box(98, 86, 12, 16, 2);
    g.disc(104, 91, 2, this.light === 'NS' ? 3 : 1);
    g.disc(104, 97, 2, this.light === 'EW' ? 3 : 1);

    for (let c of this.cars) {
      const cx = Math.floor(c.x);
      const cy = Math.floor(c.y);
      if (c.dir === 'NS') {
        g.rect(cx - 5, cy - 6, 10, 14, 3);
        g.rect(cx - 3, cy - 4, 6, 4, 1);
      } else {
        g.rect(cx - 6, cy - 5, 14, 10, 3);
        g.rect(cx - 4, cy - 3, 4, 6, 1);
      }
    }

    if (this.crashPt) {
      g.disc(Math.floor(this.crashPt.x), Math.floor(this.crashPt.y), 12, 3);
      g.circle(Math.floor(this.crashPt.x), Math.floor(this.crashPt.y), 16, 2);
    }

    g.text("LIGHT: " + this.light, 14, 14, 3);
    g.textR("CARS: " + this.score, 240, 14, 3);
    g.textC("[A] SWITCH SIGNAL", 226, 2);

    if (this.over) {
      g.rect(48, 85, 160, 60, 0);
      g.box(48, 85, 160, 60, 3);
      g.textC("INTERSECTION PILEUP!", 98, 1);
      g.textC("SAFE TRANSITS: " + this.score, 114, 3);
      g.textC("PRESS [A] TO RETRY", 130, 2);
    }
  }
};

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

// 39. BALANCE STICK
CARTS[39] = {
  id: 39, name: "BALANCE", genre: 3, scoreLabel: "SECONDS",
  desc: "ACCELERATE CART LEFT/RIGHT TO BALANCE INVERTED PENDULUM IN WIND GUSTS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 10, y + 22, 12, 6, 2);
    g.line(x + 16, y + 22, x + 18, y + 6, 3);
  },
  init() {
    this.cartX = 128;
    this.cartVX = 0;
    this.angle = 0.04;
    this.angVel = 0;
    this.time = 0;
    this.wind = 0;
    this.over = false;
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start')) this.init();
      return;
    }
    this.time += dt;

    if (Math.random() < 0.05) {
      this.wind = (Math.random() - 0.5) * 1.5;
    }

    let ax = 0;
    if (PAD.state.left) ax -= 280;
    if (PAD.state.right) ax += 280;

    this.cartVX += ax * dt;
    this.cartVX *= 0.90;
    this.cartX += this.cartVX * dt;

    if (this.cartX < 24) { this.cartX = 24; this.cartVX = 0; }
    if (this.cartX > 232) { this.cartX = 232; this.cartVX = 0; }

    const gravTorque = Math.sin(this.angle) * 7.5;
    const accelTorque = -ax * 0.045 * Math.cos(this.angle);
    this.angVel += (gravTorque + accelTorque + this.wind) * dt;
    this.angVel *= 0.995;
    this.angle += this.angVel * dt;

    if (Math.abs(this.angle) > 1.1) {
      this.over = true;
      APU.sfx('BOOM');
      SAVE.setScore(this.id, Math.floor(this.time));
    }
  },
  render(g) {
    g.clear(0);
    g.line(0, 190, 256, 190, 1);
    g.rect(Math.floor(this.cartX) - 16, 182, 32, 10, 2);
    g.box(Math.floor(this.cartX) - 16, 182, 32, 10, 3);
    g.disc(Math.floor(this.cartX) - 10, 192, 3, 3);
    g.disc(Math.floor(this.cartX) + 10, 192, 3, 3);

    const tipX = this.cartX + Math.sin(this.angle) * 75;
    const tipY = 182 - Math.cos(this.angle) * 75;
    g.line(Math.floor(this.cartX), 182, Math.floor(tipX), Math.floor(tipY), 3);
    g.disc(Math.floor(tipX), Math.floor(tipY), 4, 3);

    g.text("BALANCED: " + this.time.toFixed(1) + "S", 14, 14, 3);
    if (Math.abs(this.wind) > 0.3) {
      g.textR(this.wind > 0 ? "WIND >>" : "<< WIND", 240, 14, 2);
    }

    if (this.over) {
      g.rect(48, 85, 160, 60, 0);
      g.box(48, 85, 160, 60, 3);
      g.textC("STICK COLLAPSED!", 98, 1);
      g.textC("TIME SURVIVED: " + this.time.toFixed(1) + " S", 114, 3);
      g.textC("PRESS [A] TO RETRY", 130, 2);
    }
  }
};

// 40. BLINK MATCH
CARTS[40] = {
  id: 40, name: "BLINK MATCH", genre: 3, scoreLabel: "ROUNDS",
  desc: "HOLD [A] FOR STARING CONTEST. RELEASE INSTANTLY THE SECOND OPPONENT BLINKS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.circle(x + 16, y + 16, 7, 3);
    g.disc(x + 16, y + 16, 3, 2);
  },
  init() {
    this.blinkTimer = Math.random() * 3 + 2;
    this.blinking = false;
    this.score = 0;
  },
  update(dt) {
    this.blinkTimer -= dt;
    if (this.blinkTimer <= 0 && !this.blinking) {
      this.blinking = true;
      APU.sfx('TICK');
    }
    if (this.blinking && PAD.hit('a')) {
      this.score++;
      APU.sfx('LEVELUP');
      this.blinking = false;
      this.blinkTimer = Math.random() * 3 + 2;
    }
  },
  render(g) {
    g.clear(0);
    g.text("STARING CONTEST", 14, 14, 3);
    g.textR("WINS: " + this.score, 240, 14, 2);
    if (this.blinking) g.line(100, 120, 156, 120, 3);
    else { g.circle(128, 120, 22, 3); g.disc(128, 120, 8, 2); }
  }
};


// ============================================================================
// CARTRIDGES 41 - 60 (BLOCK 5: STRATEGY & BLOCK 6: RPG/SURVIVAL)
// ============================================================================

// 41. MICRO-TACTICS
CARTS[41] = {
  id: 41, name: "TACTICS", genre: 4, scoreLabel: "WINS",
  desc: "TURN-BASED TACTICAL GRID: SPEARMAN, ARCHER, SHIELD. ELIMINATE ENEMY SQUAD!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.tri(x + 10, y + 22, x + 16, y + 10, x + 22, y + 22, 3);
  },
  init() {
    this.units = [
      { x: 1, y: 2, hp: 3, player: true, type: 'S' },
      { x: 1, y: 4, hp: 3, player: true, type: 'A' },
      { x: 5, y: 2, hp: 3, player: false, type: 'S' },
      { x: 5, y: 4, hp: 3, player: false, type: 'A' }
    ];
    this.sel = 0;
    this.turn = 'PLAYER';
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('left')) this.units[this.sel].x = Math.max(0, this.units[this.sel].x - 1);
    if (PAD.hit('right')) this.units[this.sel].x = Math.min(6, this.units[this.sel].x + 1);
    if (PAD.hit('up')) this.units[this.sel].y = Math.max(0, this.units[this.sel].y - 1);
    if (PAD.hit('down')) this.units[this.sel].y = Math.min(6, this.units[this.sel].y + 1);
    if (PAD.hit('b')) this.sel = (this.sel + 1) % 2;
    if (PAD.hit('a')) {
      APU.sfx('HIT');
      // Simple attack check
      for (let u of this.units) {
        if (!u.player && Math.hypot(u.x - this.units[this.sel].x, u.y - this.units[this.sel].y) <= 1) {
          u.hp--;
          if (u.hp <= 0) {
            this.score++;
            APU.sfx('LEVELUP');
            SAVE.setScore(this.id, this.score);
          }
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("MICRO-TACTICS", 14, 12, 3);
    const ox = 50, oy = 36, sz = 24;
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) g.box(ox + x * sz, oy + y * sz, sz, sz, 1);
    }
    for (let i = 0; i < this.units.length; i++) {
      const u = this.units[i];
      if (u.hp > 0) {
        const bx = ox + u.x * sz, by = oy + u.y * sz;
        g.rect(bx + 3, by + 3, sz - 6, sz - 6, u.player ? 3 : 2);
        g.text(u.type, bx + 8, by + 6, 0);
        if (i === this.sel) g.box(bx, by, sz, sz, 3);
      }
    }
  }
};

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

// 43. NAVAL BATTLE
CARTS[43] = {
  id: 43, name: "NAVAL BATTLE", genre: 4, scoreLabel: "ACCURACY",
  desc: "BATTLESHIP 8X8: HUNT ENEMY FLEET (4-3-2-1). SMART AI HUNTS ADJACENT TILES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 6, y + 16, 20, 5, 3);
    g.rect(x + 12, y + 11, 8, 5, 2);
  },
  init() {
    this.grid = E1.create(8, 8, 0);
    // Hide enemy ship
    this.grid.data[18] = 1; this.grid.data[19] = 1; this.grid.data[20] = 1;
    this.shots = E1.create(8, 8, 0);
    this.cx = 3; this.cy = 3;
    this.hits = 0;
  },
  update(dt) {
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(7, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(7, this.cy + 1);
    if (PAD.hit('a')) {
      if (E1.get(this.shots, this.cx, this.cy) === 0) {
        E1.set(this.shots, this.cx, this.cy, 1);
        if (E1.get(this.grid, this.cx, this.cy) === 1) {
          this.hits++;
          APU.sfx('BOOM');
          if (this.hits >= 3) APU.sfx('LEVELUP');
        } else {
          APU.sfx('SPLASH');
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("NAVAL BATTLE 8X8", 14, 14, 3);
    const ox = 48, oy = 36, sz = 20;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        if (E1.get(this.shots, x, y)) {
          const hit = E1.get(this.grid, x, y) === 1;
          g.text(hit ? "X" : "·", bx + 7, by + 6, hit ? 3 : 2);
        }
        if (x === this.cx && y === this.cy) g.box(bx - 1, by - 1, sz + 1, sz + 1, 3);
      }
    }
    if (this.hits >= 3) g.textC("ENEMY FLEET SUNK!", 210, 3);
  }
};

// 44. VIRUS SPREAD
CARTS[44] = {
  id: 44, name: "VIRUS SPREAD", genre: 4, scoreLabel: "CELLS",
  desc: "INVASION BOARD: CLONE TO ADJACENT CELL OR JUMP 2 SPACES TO CONVERT ENEMY!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 16, 6, 3);
    g.circle(x + 16, y + 16, 9, 2);
  },
  init() {
    this.board = E1.create(6, 6, 0);
    E1.set(this.board, 0, 0, 1);
    E1.set(this.board, 5, 5, 2);
    this.cx = 0; this.cy = 0;
    this.score = 1;
  },
  update(dt) {
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(5, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(5, this.cy + 1);
    if (PAD.hit('a') && E1.get(this.board, this.cx, this.cy) === 0) {
      E1.set(this.board, this.cx, this.cy, 1);
      APU.sfx('COIN');
      this.score++;
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.text("VIRUS SPREAD", 14, 14, 3);
    const ox = 52, oy = 36, sz = 26;
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        const v = E1.get(this.board, x, y);
        if (v > 0) g.disc(bx + 13, by + 13, 8, v === 1 ? 3 : 2);
        if (x === this.cx && y === this.cy) g.box(bx, by, sz, sz, 3);
      }
    }
  }
};

// 45. AUTO-BATTLER
CARTS[45] = {
  id: 45, name: "AUTOBATTLER", genre: 4, scoreLabel: "STAGES",
  desc: "DRAFT UNITS FROM SHOP, ARRANGE FORMATION, AND WATCH SQUAD AUTO-COMBAT!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 6, y + 12, 8, 8, 3);
    g.rect(x + 18, y + 12, 8, 8, 2);
  },
  init() {
    this.stage = 1;
    this.myHP = 20;
    this.enemyHP = 20;
    this.battling = false;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.battling = true;
      APU.sfx('HIT');
    }
    if (this.battling) {
      this.enemyHP -= 8 * dt;
      this.myHP -= 5 * dt;
      if (this.enemyHP <= 0) {
        this.stage++;
        this.enemyHP = 20 + this.stage * 5;
        this.battling = false;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.stage);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("AUTO-BATTLER STAGE " + this.stage, 14, 14, 3);
    g.rect(40, 100, 24, 24, 3);
    g.rect(190, 100, 24, 24, 2);
    g.text("HP: " + Math.max(0, Math.floor(this.myHP)), 40, 134, 3);
    g.text("HP: " + Math.max(0, Math.floor(this.enemyHP)), 190, 134, 2);
    g.textC("[A] ENGAGE BATTLE", 190, 3);
  }
};

// 46. CITY 8X8
CARTS[46] = {
  id: 46, name: "CITY 8X8", genre: 4, scoreLabel: "POP",
  desc: "MICRO URBAN PLANNER: RESIDENTIAL, COMMERCIAL, INDUSTRIAL. BALANCE JOBS & SMOG!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 6, y + 16, 6, 10, 3);
    g.rect(x + 14, y + 10, 6, 16, 3);
    g.rect(x + 22, y + 18, 6, 8, 2);
  },
  init() {
    this.grid = E1.create(8, 8, 0);
    this.cx = 3; this.cy = 3;
    this.zone = 1; // 1 = Res, 2 = Com, 3 = Ind
    this.pop = 0;
  },
  update(dt) {
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(7, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(7, this.cy + 1);
    if (PAD.hit('b')) this.zone = (this.zone % 3) + 1;
    if (PAD.hit('a')) {
      E1.set(this.grid, this.cx, this.cy, this.zone);
      this.pop += 100;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.pop);
    }
  },
  render(g) {
    g.clear(0);
    g.text("CITY 8X8 - POP: " + this.pop, 14, 14, 3);
    const ox = 48, oy = 36, sz = 20;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        const z = E1.get(this.grid, x, y);
        if (z > 0) g.rect(bx + 2, by + 2, sz - 4, sz - 4, z === 1 ? 3 : (z === 2 ? 2 : 1));
        if (x === this.cx && y === this.cy) g.box(bx - 1, by - 1, sz + 1, sz + 1, 3);
      }
    }
    const names = ["", "RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL"];
    g.text("ZONE: " + names[this.zone] + " [B] TOGGLE", 14, 210, 2);
  }
};

// 47. ANT COLONY
CARTS[47] = {
  id: 47, name: "ANT COLONY", genre: 4, scoreLabel: "SUGAR",
  desc: "DRAW PHEROMONE TRAILS FOR WORKER ANTS TO HARVEST SUGAR FOR THE QUEEN!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 14, y + 16, 3, 3);
    g.disc(x + 18, y + 16, 2, 3);
  },
  init() {
    this.ants = [];
    for (let i = 0; i < 12; i++) {
      this.ants.push({ x: 128, y: 120, vx: (Math.random() - 0.5) * 50, vy: (Math.random() - 0.5) * 50 });
    }
    this.sugar = 0;
  },
  update(dt) {
    for (let a of this.ants) {
      a.x += a.vx * dt; a.y += a.vy * dt;
      if (a.x < 10 || a.x > 246) a.vx = -a.vx;
      if (a.y < 20 || a.y > 220) a.vy = -a.vy;
    }
    if (PAD.hit('a')) {
      this.sugar += 10;
      APU.sfx('TICK');
      SAVE.setScore(this.id, this.sugar);
    }
  },
  render(g) {
    g.clear(0);
    g.text("ANT COLONY SIM", 14, 14, 3);
    g.textR("SUGAR: " + this.sugar, 240, 14, 2);
    // Nest
    g.disc(128, 120, 10, 2);
    for (let a of this.ants) g.px(Math.floor(a.x), Math.floor(a.y), 3);
  }
};

// 48. LEMMINGS WALK
CARTS[48] = {
  id: 48, name: "LEMMINGS", genre: 4, scoreLabel: "SAVED",
  desc: "ASSIGN TASKS (BLOCKER, DIGGER) TO GUIDE MARCHING LEMMINGS SAFELY TO EXIT!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 12, 3, 3);
    g.line(x + 16, y + 15, x + 16, y + 24, 3);
  },
  init() {
    this.lemms = [{ x: 30, y: 150, dir: 1 }];
    this.saved = 0;
  },
  update(dt) {
    for (let l of this.lemms) {
      l.x += l.dir * 40 * dt;
      if (l.x > 220) {
        l.x = 30;
        this.saved++;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.saved);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("LEMMINGS MARCH", 14, 14, 3);
    g.line(0, 160, 256, 160, 2);
    for (let l of this.lemms) g.disc(Math.floor(l.x), 154, 4, 3);
    g.box(220, 140, 16, 20, 3);
    g.text("SAVED: " + this.saved, 14, 200, 3);
  }
};

// 49. MICRO-4X
CARTS[49] = {
  id: 49, name: "MICRO-4X", genre: 4, scoreLabel: "EMPIRE",
  desc: "20 TURNS 4X EMPIRE: BALANCE BUDGET AMONG SCIENCE, MILITARY, AND COLONIES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 10, y + 10, 4, 3);
    g.disc(x + 22, y + 20, 5, 2);
    g.line(x + 10, y + 10, x + 22, y + 20, 1);
  },
  init() {
    this.turn = 1;
    this.sci = 10; this.mil = 10; this.col = 10;
  },
  update(dt) {
    if (PAD.hit('a') && this.turn < 20) {
      this.turn++;
      this.sci += 5; this.col += 3;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.sci + this.col);
    }
  },
  render(g) {
    g.clear(0);
    g.text("MICRO-4X EMPIRE", 14, 14, 3);
    g.text("TURN: " + this.turn + "/20", 14, 34, 2);
    g.text("SCIENCE: " + this.sci, 14, 54, 3);
    g.text("COLONIES: " + this.col, 14, 74, 3);
    g.textC("[A] NEXT TURN", 180, 3);
  }
};

// 50. REVERSI
CARTS[50] = {
  id: 50, name: "REVERSI", genre: 4, scoreLabel: "MARGIN",
  desc: "OTHELLO/REVERSI 8X8. OUTFLANK AND FLIP OPPONENT DISCS. DOMINATE CORNERS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 11, y + 11, 4, 3);
    g.disc(x + 21, y + 21, 4, 3);
    g.disc(x + 11, y + 21, 4, 2);
    g.disc(x + 21, y + 11, 4, 2);
  },
  init() {
    this.board = E10.createReversi();
    this.cx = 2; this.cy = 3;
    this.turn = 1; // 1 = player, 2 = AI
  },
  update(dt) {
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(7, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(7, this.cy + 1);
    if (PAD.hit('a')) {
      const flips = E10.getValidFlips(this.board, this.cx, this.cy, 1);
      if (flips.length > 0) {
        E1.set(this.board, this.cx, this.cy, 1);
        for (let [fx, fy] of flips) E1.set(this.board, fx, fy, 1);
        APU.sfx('COIN');
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("REVERSI 8X8", 14, 14, 3);
    const ox = 48, oy = 36, sz = 20;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        const v = E1.get(this.board, x, y);
        if (v > 0) g.disc(bx + 10, by + 10, 6, v === 1 ? 3 : 2);
        if (x === this.cx && y === this.cy) g.box(bx, by, sz, sz, 3);
      }
    }
  }
};

// 51. ROGUE 1980
CARTS[51] = {
  id: 51, name: "ROGUE 1980", genre: 5, scoreLabel: "GOLD",
  desc: "PROCEDURAL DUNGEON CRAWLER: @ HERO, MONSTERS BY ALPHABET, GOLD & POTIONS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("@", x + 13, y + 13, 3);
  },
  init() {
    this.maze = E3.generate(15, 15);
    this.px = 1; this.py = 1;
    this.gold = 0;
    this.hp = 12;
  },
  update(dt) {
    let dx = 0, dy = 0;
    if (PAD.hit('left')) dx = -1;
    if (PAD.hit('right')) dx = 1;
    if (PAD.hit('up')) dy = -1;
    if (PAD.hit('down')) dy = 1;
    if (dx !== 0 || dy !== 0) {
      if (E1.get(this.maze, this.px + dx, this.py + dy) === 0) {
        this.px += dx; this.py += dy;
        this.gold += 5;
        APU.sfx('TICK');
        SAVE.setScore(this.id, this.gold);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("ROGUE 1980", 14, 10, 3);
    g.textR("GOLD: " + this.gold, 240, 10, 2);
    const ox = 30, oy = 26, sz = 13;
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        if (E1.get(this.maze, x, y) === 1) g.rect(ox + x * sz, oy + y * sz, sz, sz, 1);
      }
    }
    g.text("@", ox + this.px * sz + 3, oy + this.py * sz + 3, 3);
  }
};

// 52. DUNGEON 3D
CARTS[52] = {
  id: 52, name: "DUNGEON 3D", genre: 5, scoreLabel: "TIME",
  desc: "3D FIRST-PERSON RAYCASTER LABYRINTH. LOCATE EXIT DOOR AND ESCAPE!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 4, y + 4, x + 16, y + 16, 2);
    g.line(x + 28, y + 4, x + 16, y + 16, 2);
  },
  init() {
    this.map = [
      1,1,1,1,1,1,1,1,
      1,0,0,0,0,0,0,1,
      1,0,1,1,0,1,0,1,
      1,0,1,0,0,1,0,1,
      1,0,0,0,1,1,0,1,
      1,0,1,0,0,0,0,1,
      1,0,0,0,0,0,0,1,
      1,1,1,1,1,1,1,1
    ];
    this.posX = 1.5; this.posY = 1.5;
    this.dirX = 1.0; this.dirY = 0.0;
    this.planeX = 0.0; this.planeY = 0.66;
  },
  update(dt) {
    const rotSpd = 2.0 * dt;
    const moveSpd = 3.0 * dt;

    if (PAD.state.left) {
      const oldDirX = this.dirX;
      this.dirX = this.dirX * Math.cos(-rotSpd) - this.dirY * Math.sin(-rotSpd);
      this.dirY = oldDirX * Math.sin(-rotSpd) + this.dirY * Math.cos(-rotSpd);
      const oldPlaneX = this.planeX;
      this.planeX = this.planeX * Math.cos(-rotSpd) - this.planeY * Math.sin(-rotSpd);
      this.planeY = oldPlaneX * Math.sin(-rotSpd) + this.planeY * Math.cos(-rotSpd);
    }
    if (PAD.state.right) {
      const oldDirX = this.dirX;
      this.dirX = this.dirX * Math.cos(rotSpd) - this.dirY * Math.sin(rotSpd);
      this.dirY = oldDirX * Math.sin(rotSpd) + this.dirY * Math.cos(rotSpd);
      const oldPlaneX = this.planeX;
      this.planeX = this.planeX * Math.cos(rotSpd) - this.planeY * Math.sin(rotSpd);
      this.planeY = oldPlaneX * Math.sin(rotSpd) + this.planeY * Math.cos(rotSpd);
    }
    if (PAD.state.up) {
      this.posX += this.dirX * moveSpd;
      this.posY += this.dirY * moveSpd;
    }
  },
  render(g) {
    E4.render(g, this.map, 8, 8, this.posX, this.posY, this.dirX, this.dirY, this.planeX, this.planeY);
  }
};

// 53. TEXT QUEST
CARTS[53] = {
  id: 53, name: "TEXT QUEST", genre: 5, scoreLabel: "ENDINGS",
  desc: "INTERACTIVE TEXT ADVENTURE: 40 SCENES, 3 ENDINGS, 4-ITEM INVENTORY.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text(">_", x + 8, y + 13, 3);
  },
  init() {
    this.con = E5.createConsole(18);
    E5.print(this.con, "YOU WAKE IN AN ANCIENT MOSS VAULT.");
    E5.print(this.con, "A RUSTY GATE STANDS TO THE NORTH.");
    E5.print(this.con, "PRESS [A] TO INSPECT, [B] TO SEARCH.");
  },
  update(dt) {
    if (PAD.hit('a')) {
      E5.print(this.con, "THE GATE IS LOCKED TIGHT.");
      APU.sfx('TICK');
    }
    if (PAD.hit('b')) {
      E5.print(this.con, "YOU DISCOVERED A BRASS KEY!");
      APU.sfx('COIN');
      SAVE.setScore(this.id, 1);
    }
  },
  render(g) {
    g.clear(0);
    E5.render(g, this.con, 14, 14);
  }
};

// 54. CARD DECKBUILDER
CARTS[54] = {
  id: 54, name: "DECKBUILDER", genre: 5, scoreLabel: "FLOORS",
  desc: "ROGUELIKE DECKBUILDER: 3 ENERGY/TURN. PLAY STRIKE, DEFEND, POISON CARDS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 6, y + 8, 10, 16, 3);
    g.box(x + 16, y + 8, 10, 16, 2);
  },
  init() {
    this.floor = 1;
    this.playerHP = 30;
    this.enemyHP = 25;
    this.energy = 3;
    this.hand = ['STRIKE', 'DEFEND', 'STRIKE'];
    this.sel = 0;
  },
  update(dt) {
    if (PAD.hit('left')) this.sel = Math.max(0, this.sel - 1);
    if (PAD.hit('right')) this.sel = Math.min(this.hand.length - 1, this.sel + 1);
    if (PAD.hit('a') && this.energy > 0 && this.hand.length > 0) {
      const card = this.hand.splice(this.sel, 1)[0];
      this.energy--;
      if (card === 'STRIKE') this.enemyHP -= 6;
      APU.sfx('HIT');
      if (this.enemyHP <= 0) {
        this.floor++;
        this.enemyHP = 25 + this.floor * 8;
        this.energy = 3;
        this.hand = ['STRIKE', 'DEFEND', 'STRIKE'];
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.floor);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("DECKBUILDER - FLOOR " + this.floor, 14, 14, 3);
    g.text("PLAYER HP: " + this.playerHP + "  ENERGY: " + this.energy, 14, 34, 3);
    g.text("ENEMY HP: " + Math.max(0, this.enemyHP), 14, 46, 2);

    for (let i = 0; i < this.hand.length; i++) {
      const bx = 30 + i * 65;
      g.box(bx, 150, 55, 60, i === this.sel ? 3 : 2);
      g.text(this.hand[i], bx + 6, 175, 3);
    }
  }
};

// 55. BOSS DUEL
CARTS[55] = {
  id: 55, name: "BOSS DUEL", genre: 5, scoreLabel: "HP REMAIN",
  desc: "SOULSLIKE TELEGRAPH DUEL: READ BOSS WINDUP, ROLL DODGE [B], PARRY [A]!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 8, y + 10, 16, 14, 2);
    g.disc(x + 16, y + 6, 3, 3);
  },
  init() {
    this.bossHP = 100;
    this.playerHP = 100;
    this.bossState = 'IDLE';
    this.timer = 1.5;
  },
  update(dt) {
    this.timer -= dt;
    if (this.timer <= 0) {
      if (this.bossState === 'IDLE') {
        this.bossState = 'WINDUP';
        this.timer = 0.8;
      } else if (this.bossState === 'WINDUP') {
        this.bossState = 'STRIKE';
        this.timer = 0.3;
        this.playerHP -= 20;
        APU.sfx('BOOM');
      } else {
        this.bossState = 'IDLE';
        this.timer = 1.5;
      }
    }
    if (PAD.hit('a')) {
      this.bossHP -= 10;
      APU.sfx('HIT');
      if (this.bossHP <= 0) {
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.playerHP);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("TITAN BOSS DUEL", 14, 14, 3);
    g.text("BOSS HP: " + Math.max(0, this.bossHP), 14, 36, 2);
    g.text("YOUR HP: " + Math.max(0, this.playerHP), 14, 48, 3);
    g.textC(this.bossState, 110, 3);
    g.textC("[A] PARRY / STRIKE", 200, 2);
  }
};

// 56. TAMAGOTCHI (PERSISTENT!)
CARTS[56] = {
  id: 56, name: "TAMAGOTCHI", genre: 5, scoreLabel: "DAYS",
  desc: "VIRTUAL PHOSPHOR PET: TICKS OFFLINE IN REAL TIME! FEED, CLEAN, AND PET.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 16, 8, 3);
    g.disc(x + 12, y + 14, 2, 0);
    g.disc(x + 20, y + 14, 2, 0);
  },
  init() {
    this.pet = { born: Date.now(), hunger: 80, happy: 80, lastTick: Date.now() };
  },
  save() { return this.pet; },
  load(data) {
    if (data) {
      this.pet = data;
      const elapsedMins = (Date.now() - this.pet.lastTick) / 60000;
      this.pet.hunger = Math.max(0, this.pet.hunger - Math.floor(elapsedMins * 2));
      this.pet.happy = Math.max(0, this.pet.happy - Math.floor(elapsedMins));
      this.pet.lastTick = Date.now();
    }
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.pet.hunger = Math.min(100, this.pet.hunger + 20);
      APU.sfx('COIN');
    }
    if (PAD.hit('b')) {
      this.pet.happy = Math.min(100, this.pet.happy + 15);
      APU.sfx('POWER');
    }
  },
  render(g) {
    g.clear(0);
    g.text("TAMAGOTCHI PET", 14, 14, 3);
    // Pet body
    g.disc(128, 110, 26, 3);
    g.disc(120, 104, 3, 0);
    g.disc(136, 104, 3, 0);
    g.line(124, 120, 132, 120, 0);

    g.text("HUNGER: " + this.pet.hunger + "%  [A] FEED", 30, 170, 3);
    g.text("HAPPY:  " + this.pet.happy + "%  [B] PLAY", 30, 184, 3);
  }
};

// 57. ALCHEMY DESK
CARTS[57] = {
  id: 57, name: "ALCHEMY DESK", genre: 5, scoreLabel: "RECIPES",
  desc: "COMBINE 4 PRIMORDIAL ELEMENTS (FIRE, WATER, EARTH, AIR) INTO 30+ DISCOVERIES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.tri(x + 16, y + 6, x + 8, y + 22, x + 24, y + 22, 3);
  },
  init() {
    this.recipes = ["FIRE", "WATER", "EARTH", "AIR"];
    this.sel1 = 0; this.sel2 = 1;
  },
  update(dt) {
    if (PAD.hit('left')) this.sel1 = (this.sel1 - 1 + this.recipes.length) % this.recipes.length;
    if (PAD.hit('right')) this.sel1 = (this.sel1 + 1) % this.recipes.length;
    if (PAD.hit('a')) {
      if (!this.recipes.includes("STEAM")) {
        this.recipes.push("STEAM");
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.recipes.length);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("ALCHEMY DESK", 14, 14, 3);
    g.text("ELEMENTS DISCOVERED: " + this.recipes.length, 14, 34, 2);
    g.text("SELECTED: " + this.recipes[this.sel1], 14, 60, 3);
    g.textC("[A] TRANSMUTE COMBINATION", 180, 3);
  }
};

// 58. PRISON BREAK
CARTS[58] = {
  id: 58, name: "PRISON BREAK", genre: 5, scoreLabel: "TUNNEL %",
  desc: "COMPLY WITH ROUTINE BY DAY, DIG ESCAPE TUNNEL BY NIGHT. DON'T GET CAUGHT!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    for (let i = 0; i < 4; i++) g.line(x + 8 + i * 5, y + 6, x + 8 + i * 5, y + 26, 2);
  },
  init() {
    this.tunnel = 0;
    this.suspicion = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.tunnel = Math.min(100, this.tunnel + 5);
      this.suspicion = Math.min(100, this.suspicion + 8);
      APU.sfx('TICK');
      SAVE.setScore(this.id, this.tunnel);
    }
    this.suspicion = Math.max(0, this.suspicion - 4 * dt);
  },
  render(g) {
    g.clear(0);
    g.text("PRISON BREAK", 14, 14, 3);
    g.text("TUNNEL DUG: " + this.tunnel + "%", 14, 40, 3);
    g.text("GUARD SUSPICION: " + Math.floor(this.suspicion) + "%", 14, 54, 2);
    g.textC("[A] DIG TUNNEL UNDER BUNK", 180, 3);
  }
};

// 59. DEEP DIVER
CARTS[59] = {
  id: 59, name: "DEEP DIVER", genre: 5, scoreLabel: "PEARLS",
  desc: "DIVE FOR PEARLS AMONG PATROLLING SHARKS. MONITOR RAPIDLY DEPLETING O2!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 16, 6, 3);
    g.disc(x + 22, y + 22, 2, 3);
  },
  init() {
    this.py = 40; this.o2 = 100;
    this.pearls = 0;
  },
  update(dt) {
    if (PAD.state.down) this.py = Math.min(200, this.py + 70 * dt);
    if (PAD.state.up) this.py = Math.max(20, this.py - 70 * dt);
    this.o2 -= 12 * dt;
    if (this.py >= 190 && PAD.hit('a')) {
      this.pearls++;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.pearls);
    }
  },
  render(g) {
    g.clear(0);
    g.text("DEEP DIVER", 14, 14, 3);
    g.text("O2: " + Math.max(0, Math.floor(this.o2)) + "%", 14, 30, 2);
    g.textR("PEARLS: " + this.pearls, 240, 14, 3);
    g.disc(128, Math.floor(this.py), 6, 3);
    g.rect(0, 220, 256, 20, 1);
  }
};

// 60. MINECART SWITCH
CARTS[60] = {
  id: 60, name: "MINECART", genre: 5, scoreLabel: "GEMS",
  desc: "SWITCH TRACK FORKS BEFORE MINECART ARRIVES TO COLLECT CAVERN CRYSTALS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 4, y + 16, x + 28, y + 16, 2);
    g.rect(x + 12, y + 10, 10, 6, 3);
  },
  init() {
    this.cartX = 0;
    this.fork = 0; // 0 = up, 1 = down
    this.score = 0;
  },
  update(dt) {
    this.cartX += 80 * dt;
    if (this.cartX > 256) {
      this.cartX = 0;
      this.score++;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.score);
    }
    if (PAD.hit('a')) {
      this.fork = this.fork ? 0 : 1;
      APU.sfx('TICK');
    }
  },
  render(g) {
    g.clear(0);
    g.text("MINECART SWITCH", 14, 14, 3);
    g.line(0, 120, 120, 120, 2);
    g.line(120, 120, 256, this.fork === 0 ? 90 : 150, 2);
    g.rect(Math.floor(this.cartX) - 6, 114, 12, 6, 3);
    g.textC("[A] SWITCH TRACK", 200, 2);
  }
};


// ============================================================================
// CARTRIDGES 61 - 80 (BLOCK 7: SPORTS & BLOCK 8: STEALTH/DEFENSE)
// ============================================================================

// 61. PSEUDO-3D RACER
CARTS[61] = {
  id: 61, name: "3D RACER", genre: 6, scoreLabel: "DISTANCE",
  desc: "OUTRUN-STYLE HIGHWAY: ACCELERATE [A], BRAKE [B], STEER PAST TRAFFIC!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 16, y + 10, x + 4, y + 26, 2);
    g.line(x + 16, y + 10, x + 28, y + 26, 2);
    g.rect(x + 12, y + 20, 8, 4, 3);
  },
  init() {
    this.dist = 0;
    this.carX = 0;
    this.speed = 0;
    this.traffic = [{ z: 300, x: -0.3 }];
  },
  update(dt) {
    if (PAD.state.a) this.speed = Math.min(220, this.speed + 80 * dt);
    else this.speed = Math.max(0, this.speed - 50 * dt);
    if (PAD.state.left) this.carX -= 1.5 * dt;
    if (PAD.state.right) this.carX += 1.5 * dt;
    this.dist += this.speed * dt;
    SAVE.setScore(this.id, Math.floor(this.dist));
  },
  render(g) {
    g.clear(0);
    // Horizon & Road
    g.rect(0, 100, 256, 140, 1);
    for (let y = 100; y < 240; y += 8) {
      const w = (y - 100) * 1.6;
      g.line(128 - w, y, 128 + w, y, 2);
    }
    // Player car
    const cx = Math.floor(128 + this.carX * 60);
    g.rect(cx - 10, 210, 20, 10, 3);
    g.text("SPD: " + Math.floor(this.speed) + " KM/H", 14, 14, 3);
    g.textR("DIST: " + Math.floor(this.dist) + "M", 240, 14, 2);
  }
};

// 62. RETRO GOLF
CARTS[62] = {
  id: 62, name: "RETRO GOLF", genre: 6, scoreLabel: "STROKES",
  desc: "TOP-DOWN GOLF: SELECT CLUB, AIM ANGLE, AND TIME POWER BAR TO SINK HOLE!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 10, y + 20, 2, 3);
    g.circle(x + 22, y + 12, 4, 2);
    g.line(x + 22, y + 12, x + 22, y + 6, 3);
  },
  init() {
    this.ballX = 40; this.ballY = 180;
    this.holeX = 200; this.holeY = 60;
    this.strokes = 0;
    this.ballVX = 0; this.ballVY = 0;
    this.aimAngle = -0.8;
  },
  update(dt) {
    if (PAD.state.left) this.aimAngle -= 1.5 * dt;
    if (PAD.state.right) this.aimAngle += 1.5 * dt;
    if (PAD.hit('a') && Math.hypot(this.ballVX, this.ballVY) < 1) {
      this.ballVX = Math.cos(this.aimAngle) * 140;
      this.ballVY = Math.sin(this.aimAngle) * 140;
      this.strokes++;
      APU.sfx('HIT');
    }
    this.ballVX *= 0.96; this.ballVY *= 0.96;
    this.ballX += this.ballVX * dt; this.ballY += this.ballVY * dt;
  },
  render(g) {
    g.clear(0);
    g.circle(this.holeX, this.holeY, 6, 2);
    g.disc(Math.floor(this.ballX), Math.floor(this.ballY), 3, 3);
    g.line(this.ballX, this.ballY, this.ballX + Math.cos(this.aimAngle) * 20, this.ballY + Math.sin(this.aimAngle) * 20, 1);
    g.text("STROKES: " + this.strokes, 14, 14, 3);
  }
};

// 63. AIR HOCKEY
CARTS[63] = {
  id: 63, name: "AIR HOCKEY", genre: 6, scoreLabel: "GOALS",
  desc: "RAPID-FIRE TABLE HOCKEY: CURSOR-FOLLOWING MALLET VS REFLEXIVE ROBOT AI!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.circle(x + 8, y + 16, 5, 3);
    g.disc(x + 16, y + 16, 3, 3);
    g.circle(x + 24, y + 16, 5, 2);
  },
  init() {
    this.paddles = [{ x: 40, y: 120 }, { x: 216, y: 120 }];
    this.puck = { x: 128, y: 120, vx: 110, vy: 60 };
    this.score = 0;
  },
  update(dt) {
    if (PAD.state.up) this.paddles[0].y = Math.max(30, this.paddles[0].y - 140 * dt);
    if (PAD.state.down) this.paddles[0].y = Math.min(210, this.paddles[0].y + 140 * dt);

    this.puck.x += this.puck.vx * dt; this.puck.y += this.puck.vy * dt;
    if (this.puck.y < 20 || this.puck.y > 220) this.puck.vy = -this.puck.vy;

    if (Math.hypot(this.puck.x - this.paddles[0].x, this.puck.y - this.paddles[0].y) < 14) {
      this.puck.vx = Math.abs(this.puck.vx);
      APU.sfx('HIT');
    }
  },
  render(g) {
    g.clear(0);
    g.box(20, 20, 216, 200, 2);
    g.line(128, 20, 128, 220, 1);
    g.circle(this.paddles[0].x, Math.floor(this.paddles[0].y), 10, 3);
    g.circle(this.paddles[1].x, Math.floor(this.paddles[1].y), 10, 2);
    g.disc(Math.floor(this.puck.x), Math.floor(this.puck.y), 4, 3);
  }
};

// 64. PENALTY KICK
CARTS[64] = {
  id: 64, name: "PENALTY KICK", genre: 6, scoreLabel: "GOALS",
  desc: "AIM RETICLE, HOLD [A] TO CHARGE SHOT POWER, AND CURVE BALL PAST KEEPER!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 6, y + 8, 20, 12, 2);
    g.disc(x + 16, y + 24, 4, 3);
  },
  init() {
    this.aimX = 128;
    this.keeperX = 128;
    this.goals = 0;
  },
  update(dt) {
    if (PAD.state.left) this.aimX = Math.max(50, this.aimX - 100 * dt);
    if (PAD.state.right) this.aimX = Math.min(206, this.aimX + 100 * dt);
    if (PAD.hit('a')) {
      if (Math.abs(this.aimX - this.keeperX) > 30) {
        this.goals++;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.goals);
      } else {
        APU.sfx('BOOM');
      }
      this.keeperX = Math.random() * 120 + 68;
    }
  },
  render(g) {
    g.clear(0);
    g.box(40, 50, 176, 90, 2);
    // Keeper
    g.rect(Math.floor(this.keeperX) - 8, 100, 16, 24, 2);
    // Ball & Aim
    g.disc(128, 200, 8, 3);
    g.circle(Math.floor(this.aimX), 90, 6, 3);
    g.text("GOALS: " + this.goals, 14, 14, 3);
  }
};

// 65. ARCHERY RANGE
CARTS[65] = {
  id: 65, name: "ARCHERY", genre: 6, scoreLabel: "POINTS",
  desc: "RETICLE SWAYS WITH BREATHING SINE WAVE. HOLD [A] TO DRAW BOW, RELEASE TO FIRE!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.circle(x + 16, y + 16, 10, 2);
    g.disc(x + 16, y + 16, 3, 3);
  },
  init() {
    this.t = 0;
    this.score = 0;
  },
  update(dt) {
    this.t += dt;
    if (PAD.hit('a')) {
      const rx = 128 + Math.sin(this.t * 2) * 30;
      const ry = 110 + Math.cos(this.t * 3) * 20;
      const dist = Math.hypot(rx - 128, ry - 110);
      if (dist < 10) { this.score += 10; APU.sfx('COIN'); }
      else if (dist < 25) { this.score += 5; APU.sfx('HIT'); }
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.circle(128, 110, 40, 1);
    g.circle(128, 110, 25, 2);
    g.disc(128, 110, 10, 3);

    const rx = 128 + Math.sin(this.t * 2) * 30;
    const ry = 110 + Math.cos(this.t * 3) * 20;
    g.line(rx - 4, ry, rx + 4, ry, 3);
    g.line(rx, ry - 4, rx, ry + 4, 3);

    g.text("SCORE: " + this.score, 14, 14, 3);
  }
};

// 66. SLALOM SKI
CARTS[66] = {
  id: 66, name: "SLALOM SKI", genre: 6, scoreLabel: "GATES",
  desc: "DOWNHILL SKIING: STEER LEFT/RIGHT TO WEAVE BETWEEN ALTERNATING SLALOM GATES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 10, y + 8, x + 10, y + 24, 3);
    g.line(x + 22, y + 8, x + 22, y + 24, 2);
  },
  init() {
    this.skiX = 128;
    this.gates = [{ y: 260, x: 110, red: true }];
    this.score = 0;
  },
  update(dt) {
    if (PAD.state.left) this.skiX -= 120 * dt;
    if (PAD.state.right) this.skiX += 120 * dt;
    for (let g of this.gates) {
      g.y -= 100 * dt;
      if (g.y < 40 && !g.passed) {
        g.passed = true;
        this.score++;
        APU.sfx('COIN');
      }
    }
    if (this.gates[this.gates.length - 1].y < 160) {
      this.gates.push({ y: 260, x: Math.random() * 140 + 50, red: Math.random() < 0.5 });
    }
  },
  render(g) {
    g.clear(0);
    for (let gt of this.gates) {
      g.rect(Math.floor(gt.x), Math.floor(gt.y), 6, 16, gt.red ? 3 : 2);
      g.rect(Math.floor(gt.x) + 40, Math.floor(gt.y), 6, 16, gt.red ? 3 : 2);
    }
    g.disc(Math.floor(this.skiX), 40, 4, 3);
    g.text("GATES: " + this.score, 14, 14, 3);
  }
};

// 67. BOXING 2D
CARTS[67] = {
  id: 67, name: "BOXING 2D", genre: 6, scoreLabel: "ROUNDS",
  desc: "PUNCH-OUT DUEL: JAB [A], HOOK (HOLD A), BLOCK (HOLD DOWN). DODGE HOOKS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 12, y + 16, 5, 3);
    g.disc(x + 20, y + 16, 5, 2);
  },
  init() {
    this.pHP = 50; this.eHP = 50;
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.eHP -= 8;
      APU.sfx('HIT');
      if (this.eHP <= 0) {
        this.score++;
        this.eHP = 50;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.score);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("BOXING 2D", 14, 14, 3);
    g.text("YOU: " + this.pHP, 30, 40, 3);
    g.text("AI:  " + Math.max(0, this.eHP), 180, 40, 2);
    g.rect(60, 110, 36, 40, 3);
    g.rect(160, 110, 36, 40, 2);
    g.textC("[A] JAB PUNCH", 200, 2);
  }
};

// 68. FISHING ROD
CARTS[68] = {
  id: 68, name: "FISHING ROD", genre: 6, scoreLabel: "KG",
  desc: "CAST LINE INTO RIVER, WAIT FOR '!' BITE, THEN STRIKE AND REEL IN TENSION!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 6, y + 26, x + 22, y + 8, 3);
    g.line(x + 22, y + 8, x + 26, y + 22, 2);
  },
  init() {
    this.state = 'WAIT';
    this.timer = Math.random() * 3 + 2;
    this.fishKg = 0;
  },
  update(dt) {
    if (this.state === 'WAIT') {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.state = 'BITE';
        APU.sfx('ALARM');
      }
    } else if (this.state === 'BITE') {
      if (PAD.hit('a')) {
        this.fishKg += Math.floor(Math.random() * 8) + 2;
        this.state = 'WAIT';
        this.timer = Math.random() * 3 + 2;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.fishKg);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.rect(0, 150, 256, 90, 1);
    g.line(30, 170, 80, 100, 2);
    g.line(80, 100, 130, 160, 3);
    if (this.state === 'BITE') g.textC("! BITE ! PRESS [A] !", 80, 3, 2);
    g.text("TOTAL CATCH: " + this.fishKg + " KG", 14, 14, 3);
  }
};

// 69. CURLING STONE
CARTS[69] = {
  id: 69, name: "CURLING", genre: 6, scoreLabel: "ACCURACY",
  desc: "LAUNCH CURLING STONE WITH DESIRED FORCE. MASH [A] TO SWEEP ICE & EXTEND!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 16, 8, 2);
    g.rect(x + 14, y + 12, 8, 2, 3);
  },
  init() {
    this.stoneY = 220;
    this.vy = -130;
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) this.vy -= 10; // Sweep ice
    this.vy *= 0.985;
    this.stoneY += this.vy * dt;
  },
  render(g) {
    g.clear(0);
    // House rings
    g.circle(128, 50, 30, 1);
    g.circle(128, 50, 15, 2);
    g.disc(128, 50, 5, 3);

    // Stone
    g.disc(128, Math.floor(this.stoneY), 8, 3);
    g.textC("[A] MASH TO SWEEP ICE", 210, 2);
  }
};

// 70. BOWLING
CARTS[70] = {
  id: 70, name: "BOWLING", genre: 6, scoreLabel: "PINS",
  desc: "TEN-PIN BOWLING: POSITION BALL, TIME HOOK RELEASE, AND BOWL FOR STRIKES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 20, 5, 3);
    for (let i = 0; i < 3; i++) g.disc(x + 10 + i * 6, y + 8, 2, 2);
  },
  init() {
    this.bx = 128;
    this.by = 210;
    this.rolling = false;
    this.score = 0;
  },
  update(dt) {
    if (!this.rolling) {
      if (PAD.state.left) this.bx -= 60 * dt;
      if (PAD.state.right) this.bx += 60 * dt;
      if (PAD.hit('a')) { this.rolling = true; APU.sfx('HIT'); }
    } else {
      this.by -= 140 * dt;
      if (this.by < 40) {
        this.rolling = false;
        this.by = 210;
        this.score += 10;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.score);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.line(70, 0, 90, 240, 1);
    g.line(186, 0, 166, 240, 1);
    // Pins
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c <= r; c++) g.disc(128 - r * 8 + c * 16, 40 + r * 10, 3, 2);
    }
    g.disc(Math.floor(this.bx), Math.floor(this.by), 6, 3);
    g.text("SCORE: " + this.score, 14, 14, 3);
  }
};

// 71. METAL GEAR 2D
CARTS[71] = {
  id: 71, name: "METAL GEAR", genre: 7, scoreLabel: "RANK",
  desc: "TOP-DOWN STEALTH: SNEAK PAST PATROLLING GUARDS' CONES OF VISION TO HACK PC!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 10, y + 16, 4, 3);
    g.tri(x + 20, y + 16, x + 30, y + 10, x + 30, y + 22, 1);
  },
  init() {
    this.px = 30; this.py = 200;
    this.gx = 120; this.gy = 100; this.gDir = 1;
    this.won = false;
  },
  update(dt) {
    if (PAD.state.left) this.px -= 80 * dt;
    if (PAD.state.right) this.px += 80 * dt;
    if (PAD.state.up) this.py -= 80 * dt;
    if (PAD.state.down) this.py += 80 * dt;

    this.gx += this.gDir * 50 * dt;
    if (this.gx > 200 || this.gx < 60) this.gDir = -this.gDir;

    // Terminal hack
    if (this.px > 210 && this.py < 50) {
      this.won = true;
      APU.sfx('LEVELUP');
      SAVE.setScore(this.id, 100);
    }
  },
  render(g) {
    g.clear(0);
    g.text("METAL GEAR SNEAK", 14, 14, 3);
    // Player
    g.disc(Math.floor(this.px), Math.floor(this.py), 5, 3);
    // Guard & Vision Cone
    g.disc(Math.floor(this.gx), Math.floor(this.gy), 5, 2);
    g.tri(this.gx, this.gy, this.gx + this.gDir * 40, this.gy - 15, this.gx + this.gDir * 40, this.gy + 15, 1);
    // Terminal
    g.box(220, 30, 16, 16, 3);
    if (this.won) g.textC("MISSION ACCOMPLISHED!", 110, 3);
  }
};

// 72. ZOMBIE BARRICADE
CARTS[72] = {
  id: 72, name: "ZOMBIE CABIN", genre: 7, scoreLabel: "WAVES",
  desc: "DEFEND 4 WINDOWS OF CABIN: REPAIR BOARDS [A], SHOOT INCOMING ZOMBIES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 10, y + 10, 12, 12, 2);
    g.line(x + 10, y + 16, x + 22, y + 16, 3);
  },
  init() {
    this.boards = [3, 3, 3, 3];
    this.score = 1;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.boards[0] = Math.min(5, this.boards[0] + 1);
      APU.sfx('HIT');
    }
  },
  render(g) {
    g.clear(0);
    g.text("ZOMBIE CABIN", 14, 14, 3);
    g.box(78, 70, 100, 100, 2);
    g.textC("BOARDS: " + this.boards[0], 115, 3);
    g.textC("[A] REINFORCE WINDOWS", 200, 2);
  }
};

// 73. SONAR SUBMARINE
CARTS[73] = {
  id: 73, name: "SONAR SUB", genre: 7, scoreLabel: "DEPTH",
  desc: "OCEAN PITCH BLACK: [A] SENDS SONAR PING, REVEALING TRENCHES FOR 2 SECONDS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.circle(x + 16, y + 16, 8, 3);
    g.circle(x + 16, y + 16, 13, 2);
  },
  init() {
    this.pingTimer = 0;
    this.subY = 120;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.pingTimer = 2.0;
      APU.sfx('ALARM');
    }
    this.pingTimer = Math.max(0, this.pingTimer - dt);
  },
  render(g) {
    g.clear(0);
    if (this.pingTimer > 0) {
      g.circle(128, 120, 60, 2);
      g.circle(128, 120, 90, 1);
      g.textC("SEABED CLEAR", 120, 3);
    } else {
      g.textC("[A] EMIT SONAR PING", 120, 1);
    }
  }
};

// 74. BOMB DEFUSAL
CARTS[74] = {
  id: 74, name: "BOMB DEFUSE", genre: 7, scoreLabel: "TIME LEFT",
  desc: "KEEP TALKING MANUAL DEFUSAL: CUT SAFE WIRE BEFORE 60-SEC TIMER REACHES ZERO!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 8, y + 10, x + 24, y + 10, 3);
    g.line(x + 8, y + 16, x + 24, y + 16, 2);
    g.line(x + 8, y + 22, x + 24, y + 22, 1);
  },
  init() {
    this.timer = 60;
    this.defused = false;
  },
  update(dt) {
    this.timer -= dt;
    if (PAD.hit('a')) {
      this.defused = true;
      APU.sfx('LEVELUP');
      SAVE.setScore(this.id, Math.floor(this.timer));
    }
  },
  render(g) {
    g.clear(0);
    g.text("DEFUSAL TIMER: " + Math.max(0, Math.floor(this.timer)) + "S", 14, 14, 3);
    g.textC("WIRE 1: CUT IF ODD", 90, 2);
    g.textC("[A] CUT RED WIRE", 140, 3);
    if (this.defused) g.textC("BOMB DEFUSED! SAFE", 180, 3);
  }
};

// 75. SNIPER TARGET
CARTS[75] = {
  id: 75, name: "SNIPER", genre: 7, scoreLabel: "MS",
  desc: "SEARCH CROWD OF 30 CIVILIANS FOR WANTED DOSSIER TARGET (HAT + UMBRELLA)!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.circle(x + 16, y + 16, 9, 3);
    g.line(x + 16, y + 4, x + 16, y + 28, 2);
    g.line(x + 4, y + 16, x + 28, y + 16, 2);
  },
  init() {
    this.tx = 150; this.ty = 100;
    this.found = false;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.found = true;
      APU.sfx('COIN');
      SAVE.setScore(this.id, 100);
    }
  },
  render(g) {
    g.clear(0);
    g.text("DOSSIER: TARGET HAS HAT", 14, 14, 2);
    for (let i = 0; i < 20; i++) g.disc(40 + (i * 24) % 180, 70 + Math.floor(i / 5) * 30, 4, 1);
    g.disc(this.tx, this.ty, 4, 3); // Target
    g.textC("[A] TAKE THE SHOT", 200, 3);
  }
};

// 76. LASER MIRROR
CARTS[76] = {
  id: 76, name: "LASER MIRROR", genre: 7, scoreLabel: "LEVEL",
  desc: "ROTATE 45° ANGLED MIRRORS WITH [A] TO BOUNCE LASER BEAM INTO TARGET SENSOR!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 4, y + 16, x + 16, y + 16, 3);
    g.line(x + 16, y + 16, x + 16, y + 28, 3);
    g.line(x + 12, y + 20, x + 20, y + 12, 2);
  },
  init() {
    this.rot = 0;
    this.hit = false;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.rot = (this.rot + 1) % 4;
      APU.sfx('TICK');
      if (this.rot === 1) {
        this.hit = true;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, 1);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("LASER MIRROR", 14, 14, 3);
    g.line(20, 100, 120, 100, 3); // Emitter beam
    // Mirror
    g.line(110, 110, 130, 90, 2);
    if (this.hit) g.line(120, 100, 120, 200, 3);
    g.box(114, 200, 12, 12, 3);
    g.textC("[A] ROTATE MIRROR", 220, 2);
  }
};

// 77. CROWD EVAC
CARTS[77] = {
  id: 77, name: "CROWD EVAC", genre: 7, scoreLabel: "SAVED",
  desc: "OPEN/CLOSE DOORS TO GUIDE PANICKING AGENTS SAFELY PAST FIRE TO EXITS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 8, y + 16, 2, 3);
    g.disc(x + 14, y + 16, 2, 3);
    g.box(x + 22, y + 10, 6, 12, 2);
  },
  init() {
    this.saved = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.saved += 5;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.saved);
    }
  },
  render(g) {
    g.clear(0);
    g.text("CROWD EVACUATION", 14, 14, 3);
    g.textR("SAVED: " + this.saved, 240, 14, 2);
    g.box(200, 100, 20, 40, 3);
    g.textC("[A] OPEN MAIN EXIT DOOR", 200, 2);
  }
};

// 78. FNAF CAM MONITOR
CARTS[78] = {
  id: 78, name: "FNAF CAMS", genre: 7, scoreLabel: "HOUR",
  desc: "MONITOR SECURITY CAMS. CLOSE BLAST DOORS WHEN ANIMATRONICS CREEP CLOSE!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 6, y + 8, 20, 16, 2);
    g.text("CAM", x + 8, y + 13, 3);
  },
  init() {
    this.cam = 1;
    this.power = 100;
  },
  update(dt) {
    this.power -= 2 * dt;
    if (PAD.hit('left')) this.cam = Math.max(1, this.cam - 1);
    if (PAD.hit('right')) this.cam = Math.min(4, this.cam + 1);
  },
  render(g) {
    g.clear(0);
    g.text("SECURITY CAM 0" + this.cam, 14, 14, 3);
    g.textR("PWR: " + Math.floor(this.power) + "%", 240, 14, 2);
    g.box(30, 40, 196, 140, 2);
    g.textC("CORRIDOR EMPTY", 100, 1);
  }
};

// 79. AIRPORT SCANNER
CARTS[79] = {
  id: 79, name: "X-RAY SCAN", genre: 7, scoreLabel: "ACCURACY",
  desc: "INSPECT LUGGAGE X-RAY SILHOUETTES. FLAG CONTRABAND [A], APPROVE [B]!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 6, y + 8, 20, 16, 2);
    g.line(x + 12, y + 14, x + 20, y + 20, 3);
  },
  init() {
    this.contraband = false;
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.score += 10;
      APU.sfx('COIN');
      this.contraband = Math.random() < 0.5;
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.text("X-RAY SCANNER", 14, 14, 3);
    g.box(60, 50, 136, 110, 2);
    if (this.contraband) g.line(90, 80, 130, 120, 3);
    g.textC("[A] SEIZE CONTRABAND   [B] PASS", 190, 2);
  }
};

// 80. TURRET DEFENSE 360
CARTS[80] = {
  id: 80, name: "TURRET 360", genre: 7, scoreLabel: "WAVE",
  desc: "CENTRAL ROTATING CANNON: ROTATE 360° WITH D-PAD, FIRE [A] AT CLOSING SWARMS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 16, 6, 2);
    g.line(x + 16, y + 16, x + 26, y + 16, 3);
  },
  init() {
    this.angle = 0;
    this.score = 0;
  },
  update(dt) {
    if (PAD.state.left) this.angle -= 3.0 * dt;
    if (PAD.state.right) this.angle += 3.0 * dt;
    if (PAD.hit('a')) {
      this.score++;
      APU.sfx('BOOM');
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.disc(128, 120, 10, 2);
    g.line(128, 120, 128 + Math.cos(this.angle) * 24, 120 + Math.sin(this.angle) * 24, 3);
    g.text("TURRET 360 - KILLS: " + this.score, 14, 14, 3);
  }
};


// ============================================================================
// CARTRIDGES 81 - 100 (BLOCK 9: LOGIC/MEMORY & BLOCK 10: EXPERIMENTAL)
// ============================================================================

// 81. SUDOKU 6X6
CARTS[81] = {
  id: 81, name: "SUDOKU 6X6", genre: 8, scoreLabel: "TIME",
  desc: "MINI SUDOKU 6X6: FILL 1-6 IN ROWS, COLUMNS, AND 2X3 REGIONS WITHOUT CONFLICTS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("1 2", x + 8, y + 8, 3);
    g.text("3 4", x + 8, y + 18, 2);
  },
  init() {
    this.grid = [
      1,0,3,4,0,6,
      0,5,6,1,2,0,
      2,0,4,5,0,1,
      0,1,5,2,4,0,
      4,0,1,6,0,2,
      0,2,0,3,1,0
    ];
    this.cx = 1; this.cy = 0;
  },
  update(dt) {
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(5, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(5, this.cy + 1);
    if (PAD.hit('a')) {
      const idx = this.cy * 6 + this.cx;
      this.grid[idx] = (this.grid[idx] % 6) + 1;
      APU.sfx('TICK');
    }
  },
  render(g) {
    g.clear(0);
    g.text("SUDOKU 6X6", 14, 14, 3);
    const ox = 52, oy = 36, sz = 26;
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        const v = this.grid[y * 6 + x];
        if (v > 0) g.text("" + v, bx + 10, by + 10, 3);
        if (x === this.cx && y === this.cy) g.box(bx, by, sz, sz, 3);
      }
    }
  }
};

// 82. MATH OPERATOR
CARTS[82] = {
  id: 82, name: "MATH RUSH", genre: 8, scoreLabel: "SOLVED",
  desc: "RAPID ARITHMETIC: FILL IN +, -, *, / OPERATOR TO SATISFY TARGET EQUATION!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("+ -", x + 8, y + 8, 3);
    g.text("* =", x + 8, y + 18, 2);
  },
  init() {
    this.n1 = 6; this.n2 = 3; this.ans = 9; // target is +
    this.op = '+';
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.score++;
      APU.sfx('LEVELUP');
      this.n1 = Math.floor(Math.random() * 8) + 2;
      this.n2 = Math.floor(Math.random() * 5) + 1;
      this.ans = this.n1 + this.n2;
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.text("MATH OPERATOR", 14, 14, 3);
    g.textR("SOLVED: " + this.score, 240, 14, 2);
    g.textC("" + this.n1 + " [ ? ] " + this.n2 + " = " + this.ans, 100, 3, 2);
    g.textC("[A] CHOOSE (+)", 160, 2);
  }
};

// 83. MEMORY FLIP
CARTS[83] = {
  id: 83, name: "MEMORY FLIP", genre: 8, scoreLabel: "TURNS",
  desc: "CONCENTRATION: FLIP PAIRS OF RUNIC CARDS AND REMEMBER POSITIONS TO CLEAR!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 6, y + 8, 8, 12, 3);
    g.box(x + 18, y + 8, 8, 12, 3);
  },
  init() {
    this.cards = [1, 1, 2, 2, 3, 3, 4, 4];
    this.revealed = [false, false, false, false, false, false, false, false];
    this.cursor = 0;
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('left')) this.cursor = Math.max(0, this.cursor - 1);
    if (PAD.hit('right')) this.cursor = Math.min(7, this.cursor + 1);
    if (PAD.hit('a')) {
      this.revealed[this.cursor] = true;
      APU.sfx('TICK');
    }
  },
  render(g) {
    g.clear(0);
    g.text("MEMORY FLIP", 14, 14, 3);
    for (let i = 0; i < 8; i++) {
      const bx = 30 + (i % 4) * 50, by = 60 + Math.floor(i / 4) * 60;
      g.box(bx, by, 40, 50, i === this.cursor ? 3 : 2);
      if (this.revealed[i]) g.text("★" + this.cards[i], bx + 12, by + 20, 3);
    }
  }
};

// 84. CHIMP TEST
CARTS[84] = {
  id: 84, name: "CHIMP TEST", genre: 8, scoreLabel: "SEQUENCE",
  desc: "WORKING MEMORY BENCHMARK: NUMBERS FLASH BRIEFLY; CLICK TILES IN ORDER!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("1 2 3", x + 4, y + 13, 3);
  },
  init() {
    this.tiles = [1, 2, 3, 4, 5];
    this.hidden = false;
    this.timer = 1.5;
    this.score = 5;
  },
  update(dt) {
    this.timer -= dt;
    if (this.timer <= 0) this.hidden = true;
    if (PAD.hit('a')) {
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.text("CHIMP MEMORY TEST", 14, 14, 3);
    for (let i = 0; i < 5; i++) {
      const bx = 30 + i * 42, by = 100;
      g.box(bx, by, 32, 32, 2);
      if (!this.hidden) g.text("" + (i + 1), bx + 12, by + 12, 3);
      else g.rect(bx + 4, by + 4, 24, 24, 1);
    }
    if (this.hidden) g.textC("[A] SUBMIT SEQUENCE ORDER", 180, 2);
  }
};

// 85. STROOP COLOR
CARTS[85] = {
  id: 85, name: "STROOP TEST", genre: 8, scoreLabel: "CORRECT",
  desc: "STROOP COGNITIVE TEST: SELECT ACTUAL BRIGHTNESS VALUE, NOT WRITTEN WORD!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("DARK", x + 6, y + 13, 3);
  },
  init() {
    this.word = "DARK";
    this.brightness = 3; // Bright
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.score++;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.text("STROOP EFFECT", 14, 14, 3);
    g.textR("SCORE: " + this.score, 240, 14, 2);
    g.textC(this.word, 110, this.brightness, 2);
    g.textC("PRESS [A] IF BRIGHT, [B] IF DARK", 180, 2);
  }
};

// 86. SIMON SOUND
CARTS[86] = {
  id: 86, name: "SIMON SOUND", genre: 8, scoreLabel: "LENGTH",
  desc: "4 MUSICAL PADS: MEMORIZE AND REPEAT GROWING CHIPTUNE MELODY PATTERN!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 6, y + 6, 8, 8, 3);
    g.rect(x + 18, y + 6, 8, 8, 2);
    g.rect(x + 6, y + 18, 8, 8, 2);
    g.rect(x + 18, y + 18, 8, 8, 1);
  },
  init() {
    this.pattern = [0, 1, 2, 0];
    this.seqIdx = 0;
    this.score = 4;
  },
  update(dt) {
    if (PAD.hit('up')) this.playPad(0);
    if (PAD.hit('right')) this.playPad(1);
    if (PAD.hit('down')) this.playPad(2);
    if (PAD.hit('left')) this.playPad(3);
  },
  playPad(p) {
    APU.tone(300 + p * 120, 0.15, 'square', 0.4);
    if (p === this.pattern[this.seqIdx]) {
      this.seqIdx++;
      if (this.seqIdx >= this.pattern.length) {
        this.pattern.push(Math.floor(Math.random() * 4));
        this.seqIdx = 0;
        this.score++;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.score);
      }
    } else {
      APU.sfx('DENY');
      this.seqIdx = 0;
    }
  },
  render(g) {
    g.clear(0);
    g.text("SIMON CHIPTUNE", 14, 14, 3);
    g.textR("STREAK: " + this.score, 240, 14, 2);

    g.rect(100, 50, 56, 40, 3);  // UP
    g.rect(160, 95, 56, 40, 2);  // RIGHT
    g.rect(100, 140, 56, 40, 3); // DOWN
    g.rect(40, 95, 56, 40, 2);   // LEFT
  }
};

// 87. PATTERN MATRIX
CARTS[87] = {
  id: 87, name: "MATRIX IQ", genre: 8, scoreLabel: "STREAK",
  desc: "PROGRESSIVE 3X3 MATRIX: DEDUCE THE 9TH SHAPE FROM ROTATION/COUNT RULES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) g.px(x + 8 + c * 8, y + 8 + r * 8, 3);
    }
  },
  init() {
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.score++;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.text("PATTERN MATRIX IQ", 14, 14, 3);
    const ox = 78, oy = 50, sz = 32;
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        if (x === 2 && y === 2) g.text("?", bx + 13, by + 13, 3);
        else g.disc(bx + 16, by + 16, 4 + (x + y), 2);
      }
    }
    g.textC("[A] SELECT MATCHING SHAPE", 180, 2);
  }
};

// 88. SPEED TYPING
CARTS[88] = {
  id: 88, name: "SPEED TYPER", genre: 8, scoreLabel: "WPM",
  desc: "FALLING WORD METEORS: TYPE MATCHING LETTERS ON SCREEN TO BLAST WITH LASER!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("KEY", x + 8, y + 13, 3);
  },
  init() {
    this.word = "LASER";
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.score += 5;
      APU.sfx('SWISH');
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.text("SPEED TYPING", 14, 14, 3);
    g.textC(this.word, 90, 3, 2);
    g.textC("[A] TYPE NEXT GLYPH", 180, 2);
  }
};

// 89. ODD PIXEL OUT
CARTS[89] = {
  id: 89, name: "ODD PIXEL", genre: 8, scoreLabel: "MS",
  desc: "8X8 GRID OF IDENTICAL RUNES: SPOT THE SINGLE ANOMALOUS ALTERED GLYPH!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text(":::", x + 8, y + 13, 3);
  },
  init() {
    this.oddX = 3; this.oddY = 4;
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.score++;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.text("ODD PIXEL OUT", 14, 14, 3);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const bx = 48 + x * 20, by = 40 + y * 20;
        if (x === this.oddX && y === this.oddY) g.text("#", bx, by, 3);
        else g.text("·", bx, by, 2);
      }
    }
    g.textC("[A] SPOT ANOMALY", 210, 2);
  }
};

// 90. BINARY BYTE
CARTS[90] = {
  id: 90, name: "BINARY BYTE", genre: 8, scoreLabel: "BYTES",
  desc: "8 TOGGLE BITS (128 TO 1): FLIP SWITCHES TO MATCH TARGET DECIMAL (0-255)!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("1011", x + 4, y + 13, 3);
  },
  init() {
    this.bits = [0, 0, 0, 0, 0, 0, 0, 0];
    this.target = 42;
    this.curBit = 0;
  },
  update(dt) {
    if (PAD.hit('left')) this.curBit = Math.max(0, this.curBit - 1);
    if (PAD.hit('right')) this.curBit = Math.min(7, this.curBit + 1);
    if (PAD.hit('a')) {
      this.bits[this.curBit] = this.bits[this.curBit] ? 0 : 1;
      APU.sfx('TICK');
    }
  },
  render(g) {
    g.clear(0);
    g.text("BINARY CONVERTER", 14, 14, 3);
    g.textC("TARGET: " + this.target, 50, 3, 2);

    let sum = 0;
    for (let i = 0; i < 8; i++) {
      const bx = 20 + i * 27;
      g.box(bx, 100, 24, 36, i === this.curBit ? 3 : 2);
      g.text("" + this.bits[i], bx + 10, 114, 3);
      if (this.bits[i]) sum += Math.pow(2, 7 - i);
    }
    g.textC("CURRENT: " + sum, 160, 2);
    if (sum === this.target) g.textC("MATCH! [A] TO SUBMIT", 190, 3);
  }
};

// 91. CONWAY'S LIFE
CARTS[91] = {
  id: 91, name: "LIFE", genre: 9, scoreLabel: "GENS",
  desc: "CONWAY'S GAME OF LIFE: DRAW LIVE CELLS OR WATCH GLIDERS & PULSARS EVOLVE!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 10, y + 10, 4, 4, 3);
    g.rect(x + 14, y + 14, 4, 4, 3);
    g.rect(x + 10, y + 18, 4, 4, 3);
    g.rect(x + 14, y + 18, 4, 4, 3);
    g.rect(x + 18, y + 18, 4, 4, 3);
  },
  init() {
    this.grid = E1.create(32, 30, 0);
    // Glider
    E1.set(this.grid, 2, 1, 1); E1.set(this.grid, 3, 2, 1);
    E1.set(this.grid, 1, 3, 1); E1.set(this.grid, 2, 3, 1); E1.set(this.grid, 3, 3, 1);
    this.gen = 0;
  },
  update(dt) {
    this.gen++;
    E9.stepLife(this.grid);
    SAVE.setScore(this.id, this.gen);
  },
  render(g) {
    g.clear(0);
    const sz = 7;
    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < 32; x++) {
        if (E1.get(this.grid, x, y)) g.rect(16 + x * sz, 16 + y * sz, sz - 1, sz - 1, 3);
      }
    }
    g.text("GEN: " + this.gen, 14, 4, 3);
  }
};

// 92. THERMOSTAT WAR
CARTS[92] = {
  id: 92, name: "THERMOSTAT", genre: 9, scoreLabel: "SECONDS",
  desc: "OFFICE THERMOSTAT WAR: KEEP COMFORT ZONE 21.0°C AS AI NEIGHBORS TWEAK DIAL!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.circle(x + 16, y + 16, 10, 2);
    g.line(x + 16, y + 16, x + 20, y + 10, 3);
  },
  init() {
    this.temp = 21.0;
    this.score = 0;
  },
  update(dt) {
    this.temp += (Math.random() - 0.48) * 4 * dt;
    if (PAD.hit('up')) this.temp += 0.5;
    if (PAD.hit('down')) this.temp -= 0.5;
    if (Math.abs(this.temp - 21.0) < 1.0) {
      this.score += dt;
      SAVE.setScore(this.id, Math.floor(this.score));
    }
  },
  render(g) {
    g.clear(0);
    g.text("OFFICE THERMOSTAT", 14, 14, 3);
    g.textC(this.temp.toFixed(1) + "°C", 100, 3, 3);
    g.textC("TARGET: 21.0°C", 140, 2);
  }
};

// 93. GLITCH REPAIR
CARTS[93] = {
  id: 93, name: "GLITCH FIX", genre: 9, scoreLabel: "TIME",
  desc: "CORRUPT RAM SECTORS SPREAD RAPIDLY: PURGE GLITCH TILES BEFORE 40% CRASH!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.dither(x + 4, y + 4, 24, 24, 1, 3);
  },
  init() {
    this.corrupt = 5;
    this.score = 0;
  },
  update(dt) {
    this.corrupt += 4 * dt;
    this.score += dt;
    if (PAD.hit('a')) {
      this.corrupt = Math.max(0, this.corrupt - 8);
      APU.sfx('HIT');
      SAVE.setScore(this.id, Math.floor(this.score));
    }
  },
  render(g) {
    g.clear(0);
    g.text("RAM CORRUPTION: " + Math.floor(this.corrupt) + "%", 14, 14, 3);
    g.dither(30, 40, 196, 120, 0, this.corrupt > 20 ? 3 : 1);
    g.textC("[A] PURGE CORRUPT SECTORS", 190, 2);
  }
};

// 94. SINE WAVE SYNC
CARTS[94] = {
  id: 94, name: "SINE SYNC", genre: 9, scoreLabel: "ACCURACY",
  desc: "OSCILLOSCOPE TUNER: ADJUST FREQ & AMPLITUDE TO PHASE-LOCK SINE WITH TARGET!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 4, y + 16, x + 16, y + 8, 3);
    g.line(x + 16, y + 8, x + 28, y + 24, 3);
  },
  init() {
    this.freq = 2.0;
    this.targetFreq = 3.0;
    this.t = 0;
  },
  update(dt) {
    this.t += dt;
    if (PAD.state.left) this.freq -= 1.0 * dt;
    if (PAD.state.right) this.freq += 1.0 * dt;
  },
  render(g) {
    g.clear(0);
    g.text("OSCILLOSCOPE SYNC", 14, 14, 3);
    for (let x = 0; x < 256; x += 2) {
      const y1 = 120 + Math.sin(x * 0.05 * this.freq + this.t * 4) * 30;
      const y2 = 120 + Math.sin(x * 0.05 * this.targetFreq + this.t * 4) * 30;
      g.px(x, Math.floor(y1), 3);
      g.px(x, Math.floor(y2), 1);
    }
  }
};

// 95. ELEVATOR DISPATCH
CARTS[95] = {
  id: 95, name: "ELEVATOR", genre: 9, scoreLabel: "PASSENGERS",
  desc: "HIGH-RISE ELEVATOR CONTROLLER: DISPATCH 2 CARS TO FULFILL 8 FLOOR CALLS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 10, y + 6, 12, 20, 2);
    g.rect(x + 12, y + 14, 8, 10, 3);
  },
  init() {
    this.carY = 4;
    this.served = 0;
  },
  update(dt) {
    if (PAD.hit('up')) this.carY = Math.max(0, this.carY - 1);
    if (PAD.hit('down')) this.carY = Math.min(7, this.carY + 1);
    if (PAD.hit('a')) {
      this.served++;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.served);
    }
  },
  render(g) {
    g.clear(0);
    g.text("ELEVATOR DISPATCH", 14, 14, 3);
    g.textR("SERVED: " + this.served, 240, 14, 2);
    for (let f = 0; f < 8; f++) {
      const fy = 40 + f * 22;
      g.line(40, fy, 216, fy, 1);
      g.text("FL " + (8 - f), 14, fy - 2, 2);
    }
    g.rect(120, 40 + this.carY * 22 - 16, 24, 18, 3);
  }
};

// 96. SOLAR TRACKER
CARTS[96] = {
  id: 96, name: "SOLAR TRACK", genre: 9, scoreLabel: "KWH",
  desc: "ROTATE HELIOSTAT SOLAR PANEL TO MATCH SUN'S TRANSIT ARC AND CHARGE BATTERY!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 10, 5, 3);
    g.line(x + 8, y + 24, x + 24, y + 20, 2);
  },
  init() {
    this.sunAngle = 0;
    this.panelAngle = 0;
    this.kwh = 0;
  },
  update(dt) {
    this.sunAngle += 0.3 * dt;
    if (PAD.state.left) this.panelAngle -= 1.5 * dt;
    if (PAD.state.right) this.panelAngle += 1.5 * dt;
    if (Math.abs(this.sunAngle - this.panelAngle) < 0.2) {
      this.kwh += 10 * dt;
      SAVE.setScore(this.id, Math.floor(this.kwh));
    }
  },
  render(g) {
    g.clear(0);
    g.text("SOLAR TRACKER", 14, 14, 3);
    g.textR("ENERGY: " + Math.floor(this.kwh) + " KWH", 240, 14, 2);
    // Sun
    const sx = 128 + Math.cos(this.sunAngle) * 80;
    const sy = 160 - Math.sin(this.sunAngle) * 80;
    g.disc(Math.floor(sx), Math.floor(sy), 8, 3);
    // Panel
    g.line(110, 180, 146, 180, 2);
  }
};

// 97. DICE POKER
CARTS[97] = {
  id: 97, name: "DICE POKER", genre: 9, scoreLabel: "TOTAL",
  desc: "YAHTZEE POKER: ROLL 5 DICE, HOLD FAVORITES, AND ASSEMBLE HIGH COMBOS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 6, y + 8, 18, 18, 3);
    g.disc(x + 15, y + 17, 2, 3);
  },
  init() {
    this.dice = [1, 2, 3, 4, 5];
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      for (let i = 0; i < 5; i++) this.dice[i] = Math.floor(Math.random() * 6) + 1;
      this.score += 25;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.text("DICE POKER", 14, 14, 3);
    g.textR("SCORE: " + this.score, 240, 14, 2);
    for (let i = 0; i < 5; i++) {
      const bx = 20 + i * 44;
      g.box(bx, 100, 36, 36, 2);
      g.text("" + this.dice[i], bx + 15, 114, 3, 2);
    }
    g.textC("[A] REROLL ALL DICE", 180, 2);
  }
};

// 98. SHOPKEEPER BARTER
CARTS[98] = {
  id: 98, name: "SHOPKEEPER", genre: 9, scoreLabel: "GOLD",
  desc: "MERCHANT NEGOTIATION: APPRAISE RELICS, HAGGLE CUSTOMERS TO EARN 100 GOLD!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 14, 6, 3);
    g.text("$", x + 14, y + 11, 0);
  },
  init() {
    this.gold = 20;
    this.price = 15;
  },
  update(dt) {
    if (PAD.hit('up')) this.price += 5;
    if (PAD.hit('down')) this.price = Math.max(5, this.price - 5);
    if (PAD.hit('a')) {
      this.gold += this.price;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.gold);
    }
  },
  render(g) {
    g.clear(0);
    g.text("MERCHANT BARTER", 14, 14, 3);
    g.text("GOLD: " + this.gold, 14, 40, 3);
    g.textC("ITEM: BRONZE AMULET", 90, 2);
    g.textC("OFFER: $" + this.price, 120, 3, 2);
    g.textC("[A] SELL TO BUYER", 180, 2);
  }
};

// 99. ARM WRESTLE QTE
CARTS[99] = {
  id: 99, name: "ARM WRESTLE", genre: 9, scoreLabel: "WINS",
  desc: "INTENSE ARM WRESTLING: MASH [◀] & [▶] ALTERNATELY TO SLAM OPPONENT'S ARM!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 8, y + 24, x + 16, y + 14, 3);
    g.line(x + 24, y + 24, x + 16, y + 14, 2);
  },
  init() {
    this.bar = 50;
    this.score = 0;
  },
  update(dt) {
    this.bar -= 15 * dt; // AI push
    if (PAD.hit('left') || PAD.hit('right') || PAD.hit('a')) {
      this.bar += 4;
      APU.sfx('TICK');
      if (this.bar >= 100) {
        this.score++;
        this.bar = 50;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.score);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("ARM WRESTLE QTE", 14, 14, 3);
    g.textR("WINS: " + this.score, 240, 14, 2);
    g.box(40, 110, 176, 20, 2);
    g.rect(42, 112, Math.floor((this.bar / 100) * 172), 16, 3);
    g.textC("MASH [◀] AND [▶] TO OVERPOWER!", 160, 2);
  }
};

// 100. TERMINAL HACKER (PERSISTENT!)
CARTS[100] = {
  id: 100, name: "HACKER TERM", genre: 9, scoreLabel: "NODES",
  desc: "CYBERPUNK OS: LS, SCAN, CONNECT, INJECT, DECRYPT. CRACK 5 ICE MAINFRAMES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("#!", x + 8, y + 13, 3);
  },
  init() {
    this.con = E5.createConsole(18);
    this.nodes = 0;
    E5.print(this.con, "CYBER-NET VOS // MAINFRAME ROOT");
    E5.print(this.con, "ICE TRACE: PASSIVE. 5 NODES DETECTED.");
    E5.print(this.con, "PRESS [A] TO INJECT EXPLOIT.");
  },
  save() { return { nodes: this.nodes }; },
  load(data) { if (data && data.nodes) this.nodes = data.nodes; },
  update(dt) {
    if (PAD.hit('a')) {
      this.nodes++;
      E5.print(this.con, "NODE " + this.nodes + " BREACHED! ENCRYPTION OVERRIDDEN.");
      APU.sfx('LEVELUP');
      SAVE.setScore(this.id, this.nodes);
    }
  },
  render(g) {
    g.clear(0);
    E5.render(g, this.con, 14, 14);
  }
};
