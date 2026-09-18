// js/cartridges/cart_054_deckbuilder.js
// ============================================================================
// Cartridge #054: DECKBUILDER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 54. CARD DECKBUILDER
CARTS[54] = {
  id: 54, name: "DECKBUILDER", genre: 5, scoreLabel: "FLOORS",
  desc: "ROGUELIKE DECKBUILDER: 3 ENERGY/TURN. PLAY STRIKE, DEFEND, POISON CARDS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 6, y + 8, 10, 16, 3);
    g.box(x + 16, y + 8, 10, 16, 2);
  },
  init() {
    this.floor = 1;
    this.playerHP = 30;
    this.enemyHP = 25;
    this.energy = 3;
    this.hand = ['STRIKE', 'DEFEND', 'STRIKE'];
    this.sel = 0;
  },
  update(dt) {
    if (PAD.hit('left')) this.sel = Math.max(0, this.sel - 1);
    if (PAD.hit('right')) this.sel = Math.min(this.hand.length - 1, this.sel + 1);
    if (PAD.hit('a') && this.energy > 0 && this.hand.length > 0) {
      const card = this.hand.splice(this.sel, 1)[0];
      this.energy--;
      if (card === 'STRIKE') this.enemyHP -= 6;
      APU.sfx('HIT');
      if (this.enemyHP <= 0) {
        this.floor++;
        this.enemyHP = 25 + this.floor * 8;
        this.energy = 3;
        this.hand = ['STRIKE', 'DEFEND', 'STRIKE'];
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.floor);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("DECKBUILDER - FLOOR " + this.floor, 14, 14, 3);
    g.text("PLAYER HP: " + this.playerHP + "  ENERGY: " + this.energy, 14, 34, 3);
    g.text("ENEMY HP: " + Math.max(0, this.enemyHP), 14, 46, 2);

    for (let i = 0; i < this.hand.length; i++) {
      const bx = 30 + i * 65;
      g.box(bx, 150, 55, 60, i === this.sel ? 3 : 2);
      g.text(this.hand[i], bx + 6, 175, 3);
    }
  }
};
