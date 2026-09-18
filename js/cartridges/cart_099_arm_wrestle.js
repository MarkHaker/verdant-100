// js/cartridges/cart_099_arm_wrestle.js
// ============================================================================
// Cartridge #099: ARM WRESTLE
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

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
