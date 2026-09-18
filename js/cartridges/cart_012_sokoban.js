// js/cartridges/cart_012_sokoban.js
// ============================================================================
// Cartridge #012: SOKOBAN
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

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
