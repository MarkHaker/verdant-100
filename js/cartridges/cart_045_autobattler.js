// js/cartridges/cart_045_autobattler.js
// ============================================================================
// Cartridge #045: AUTOBATTLER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 45. AUTO-BATTLER
CARTS[45] = {
  id: 45, name: "AUTOBATTLER", genre: 4, scoreLabel: "STAGES",
  desc: "DRAFT UNITS FROM SHOP, ARRANGE FORMATION, AND WATCH SQUAD AUTO-COMBAT!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 6, y + 12, 8, 8, 3);
    g.rect(x + 18, y + 12, 8, 8, 2);
  },
  init() {
    this.stage = 1;
    this.myHP = 20;
    this.enemyHP = 20;
    this.battling = false;
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.battling = true;
      APU.sfx('HIT');
    }
    if (this.battling) {
      this.enemyHP -= 8 * dt;
      this.myHP -= 5 * dt;
      if (this.enemyHP <= 0) {
        this.stage++;
        this.enemyHP = 20 + this.stage * 5;
        this.battling = false;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.stage);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("AUTO-BATTLER STAGE " + this.stage, 14, 14, 3);
    g.rect(40, 100, 24, 24, 3);
    g.rect(190, 100, 24, 24, 2);
    g.text("HP: " + Math.max(0, Math.floor(this.myHP)), 40, 134, 3);
    g.text("HP: " + Math.max(0, Math.floor(this.enemyHP)), 190, 134, 2);
    g.textC("[A] ENGAGE BATTLE", 190, 3);
  }
};
