// js/cartridges/cart_053_text_quest.js
// ============================================================================
// Cartridge #053: TEXT QUEST
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 53. TEXT QUEST
CARTS[53] = {
  id: 53, name: "TEXT QUEST", genre: 5, scoreLabel: "ENDINGS",
  desc: "INTERACTIVE TEXT ADVENTURE: 40 SCENES, 3 ENDINGS, 4-ITEM INVENTORY.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text(">_", x + 8, y + 13, 3);
  },
  init() {
    this.con = E5.createConsole(18);
    E5.print(this.con, "YOU WAKE IN AN ANCIENT MOSS VAULT.");
    E5.print(this.con, "A RUSTY GATE STANDS TO THE NORTH.");
    E5.print(this.con, "PRESS [A] TO INSPECT, [B] TO SEARCH.");
  },
  update(dt) {
    if (PAD.hit('a')) {
      E5.print(this.con, "THE GATE IS LOCKED TIGHT.");
      APU.sfx('TICK');
    }
    if (PAD.hit('b')) {
      E5.print(this.con, "YOU DISCOVERED A BRASS KEY!");
      APU.sfx('COIN');
      SAVE.setScore(this.id, 1);
    }
  },
  render(g) {
    g.clear(0);
    E5.render(g, this.con, 14, 14);
  }
};
