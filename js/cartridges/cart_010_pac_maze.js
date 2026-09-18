// js/cartridges/cart_010_pac_maze.js
// ============================================================================
// Cartridge #010: PAC-MAZE
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

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
