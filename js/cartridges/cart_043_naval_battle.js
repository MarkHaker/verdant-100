// js/cartridges/cart_043_naval_battle.js
// ============================================================================
// Cartridge #043: NAVAL BATTLE
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

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
