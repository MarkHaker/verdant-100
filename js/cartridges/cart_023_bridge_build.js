// js/cartridges/cart_023_bridge_build.js
// ============================================================================
// Cartridge #023: BRIDGE BUILD
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

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
