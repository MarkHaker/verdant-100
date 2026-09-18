// js/cartridges/cart_051_rogue_1980.js
// ============================================================================
// Cartridge #051: ROGUE 1980
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

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
