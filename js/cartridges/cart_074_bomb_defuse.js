// js/cartridges/cart_074_bomb_defuse.js
// ============================================================================
// Cartridge #074: BOMB DEFUSE
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 74. BOMB DEFUSAL
CARTS[74] = {
  id: 74, name: "BOMB DEFUSE", genre: 7, scoreLabel: "TIME LEFT",
  desc: "KEEP TALKING MANUAL DEFUSAL: CUT SAFE WIRE BEFORE 60-SEC TIMER REACHES ZERO!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 8, y + 10, x + 24, y + 10, 3);
    g.line(x + 8, y + 16, x + 24, y + 16, 2);
    g.line(x + 8, y + 22, x + 24, y + 22, 1);
  },
  init() {
    this.timer = 60;
    this.defused = false;
  },
  update(dt) {
    this.timer -= dt;
    if (PAD.hit('a')) {
      this.defused = true;
      APU.sfx('LEVELUP');
      SAVE.setScore(this.id, Math.floor(this.timer));
    }
  },
  render(g) {
    g.clear(0);
    g.text("DEFUSAL TIMER: " + Math.max(0, Math.floor(this.timer)) + "S", 14, 14, 3);
    g.textC("WIRE 1: CUT IF ODD", 90, 2);
    g.textC("[A] CUT RED WIRE", 140, 3);
    if (this.defused) g.textC("BOMB DEFUSED! SAFE", 180, 3);
  }
};
