// js/cartridges/cart_025_falling_sand.js
// ============================================================================
// Cartridge #025: FALLING SAND
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

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
