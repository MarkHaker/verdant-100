// js/cartridges/cart_057_alchemy_desk.js
// ============================================================================
// Cartridge #057: ALCHEMY DESK
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 57. ALCHEMY DESK
CARTS[57] = {
  id: 57, name: "ALCHEMY DESK", genre: 5, scoreLabel: "RECIPES",
  desc: "COMBINE 4 PRIMORDIAL ELEMENTS (FIRE, WATER, EARTH, AIR) INTO 30+ DISCOVERIES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.tri(x + 16, y + 6, x + 8, y + 22, x + 24, y + 22, 3);
  },
  init() {
    this.recipes = ["FIRE", "WATER", "EARTH", "AIR"];
    this.sel1 = 0; this.sel2 = 1;
  },
  update(dt) {
    if (PAD.hit('left')) this.sel1 = (this.sel1 - 1 + this.recipes.length) % this.recipes.length;
    if (PAD.hit('right')) this.sel1 = (this.sel1 + 1) % this.recipes.length;
    if (PAD.hit('a')) {
      if (!this.recipes.includes("STEAM")) {
        this.recipes.push("STEAM");
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.recipes.length);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("ALCHEMY DESK", 14, 14, 3);
    g.text("ELEMENTS DISCOVERED: " + this.recipes.length, 14, 34, 2);
    g.text("SELECTED: " + this.recipes[this.sel1], 14, 60, 3);
    g.textC("[A] TRANSMUTE COMBINATION", 180, 3);
  }
};
