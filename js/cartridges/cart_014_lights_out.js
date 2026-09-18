// js/cartridges/cart_014_lights_out.js
// ============================================================================
// Cartridge #014: LIGHTS OUT
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

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
