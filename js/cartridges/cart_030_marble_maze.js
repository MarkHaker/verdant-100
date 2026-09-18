// js/cartridges/cart_030_marble_maze.js
// ============================================================================
// Cartridge #030: MARBLE MAZE
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

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
