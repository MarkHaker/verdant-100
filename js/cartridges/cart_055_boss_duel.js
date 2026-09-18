// js/cartridges/cart_055_boss_duel.js
// ============================================================================
// Cartridge #055: BOSS DUEL
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 55. BOSS DUEL
CARTS[55] = {
  id: 55, name: "BOSS DUEL", genre: 5, scoreLabel: "HP REMAIN",
  desc: "SOULSLIKE TELEGRAPH DUEL: READ BOSS WINDUP, ROLL DODGE [B], PARRY [A]!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 8, y + 10, 16, 14, 2);
    g.disc(x + 16, y + 6, 3, 3);
  },
  init() {
    this.bossHP = 100;
    this.playerHP = 100;
    this.bossState = 'IDLE';
    this.timer = 1.5;
  },
  update(dt) {
    this.timer -= dt;
    if (this.timer <= 0) {
      if (this.bossState === 'IDLE') {
        this.bossState = 'WINDUP';
        this.timer = 0.8;
      } else if (this.bossState === 'WINDUP') {
        this.bossState = 'STRIKE';
        this.timer = 0.3;
        this.playerHP -= 20;
        APU.sfx('BOOM');
      } else {
        this.bossState = 'IDLE';
        this.timer = 1.5;
      }
    }
    if (PAD.hit('a')) {
      this.bossHP -= 10;
      APU.sfx('HIT');
      if (this.bossHP <= 0) {
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.playerHP);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("TITAN BOSS DUEL", 14, 14, 3);
    g.text("BOSS HP: " + Math.max(0, this.bossHP), 14, 36, 2);
    g.text("YOUR HP: " + Math.max(0, this.playerHP), 14, 48, 3);
    g.textC(this.bossState, 110, 3);
    g.textC("[A] PARRY / STRIKE", 200, 2);
  }
};
