// js/cartridges/cart_047_ant_colony.js
// ============================================================================
// Cartridge #047: ANT COLONY
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

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
