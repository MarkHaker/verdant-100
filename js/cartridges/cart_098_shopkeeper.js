// js/cartridges/cart_098_shopkeeper.js
// ============================================================================
// Cartridge #098: SHOPKEEPER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 98. SHOPKEEPER BARTER
CARTS[98] = {
  id: 98, name: "SHOPKEEPER", genre: 9, scoreLabel: "GOLD",
  desc: "MERCHANT NEGOTIATION: APPRAISE RELICS, HAGGLE CUSTOMERS TO EARN 100 GOLD!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 14, 6, 3);
    g.text("$", x + 14, y + 11, 0);
  },
  init() {
    this.gold = 20;
    this.price = 15;
  },
  update(dt) {
    if (PAD.hit('up')) this.price += 5;
    if (PAD.hit('down')) this.price = Math.max(5, this.price - 5);
    if (PAD.hit('a')) {
      this.gold += this.price;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.gold);
    }
  },
  render(g) {
    g.clear(0);
    g.text("MERCHANT BARTER", 14, 14, 3);
    g.text("GOLD: " + this.gold, 14, 40, 3);
    g.textC("ITEM: BRONZE AMULET", 90, 2);
    g.textC("OFFER: $" + this.price, 120, 3, 2);
    g.textC("[A] SELL TO BUYER", 180, 2);
  }
};
