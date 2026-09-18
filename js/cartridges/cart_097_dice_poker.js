// js/cartridges/cart_097_dice_poker.js
// ============================================================================
// Cartridge #097: DICE POKER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 97. DICE POKER
CARTS[97] = {
  id: 97, name: "DICE POKER", genre: 9, scoreLabel: "TOTAL",
  desc: "YAHTZEE POKER: ROLL 5 DICE, HOLD FAVORITES, AND ASSEMBLE HIGH COMBOS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 6, y + 8, 18, 18, 3);
    g.disc(x + 15, y + 17, 2, 3);
  },
  init() {
    this.dice = [1, 2, 3, 4, 5];
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      for (let i = 0; i < 5; i++) this.dice[i] = Math.floor(Math.random() * 6) + 1;
      this.score += 25;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.text("DICE POKER", 14, 14, 3);
    g.textR("SCORE: " + this.score, 240, 14, 2);
    for (let i = 0; i < 5; i++) {
      const bx = 20 + i * 44;
      g.box(bx, 100, 36, 36, 2);
      g.text("" + this.dice[i], bx + 15, 114, 3, 2);
    }
    g.textC("[A] REROLL ALL DICE", 180, 2);
  }
};
