// js/cartridges/cart_082_math_rush.js
// ============================================================================
// Cartridge #082: MATH RUSH
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 82. MATH OPERATOR
CARTS[82] = {
  id: 82, name: "MATH RUSH", genre: 8, scoreLabel: "SOLVED",
  desc: "RAPID ARITHMETIC: FILL IN +, -, *, / OPERATOR TO SATISFY TARGET EQUATION!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("+ -", x + 8, y + 8, 3);
    g.text("* =", x + 8, y + 18, 2);
  },
  init() {
    this.n1 = 6; this.n2 = 3; this.ans = 9; // target is +
    this.op = '+';
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.score++;
      APU.sfx('LEVELUP');
      this.n1 = Math.floor(Math.random() * 8) + 2;
      this.n2 = Math.floor(Math.random() * 5) + 1;
      this.ans = this.n1 + this.n2;
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    g.text("MATH OPERATOR", 14, 14, 3);
    g.textR("SOLVED: " + this.score, 240, 14, 2);
    g.textC("" + this.n1 + " [ ? ] " + this.n2 + " = " + this.ans, 100, 3, 2);
    g.textC("[A] CHOOSE (+)", 160, 2);
  }
};
