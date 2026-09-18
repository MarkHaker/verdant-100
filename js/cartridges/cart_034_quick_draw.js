// js/cartridges/cart_034_quick_draw.js
// ============================================================================
// Cartridge #034: QUICK DRAW
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 34. QUICK DRAW
CARTS[34] = {
  id: 34, name: "QUICK DRAW", genre: 3, scoreLabel: "MS",
  desc: "WAIT FOR 'DRAW!' SIGNAL, THEN HIT [A] INSTANTLY. FALSE START LOSES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 10, y + 14, 12, 4, 3);
    g.rect(x + 10, y + 18, 4, 6, 3);
  },
  init() {
    this.state = 'WAIT';
    this.waitTimer = Math.random() * 2 + 1.5;
    this.reactTime = 0;
    this.score = 0;
  },
  update(dt) {
    if (this.state === 'WAIT') {
      this.waitTimer -= dt;
      if (PAD.hit('a')) {
        this.state = 'FOUL';
        APU.sfx('DENY');
      } else if (this.waitTimer <= 0) {
        this.state = 'DRAW';
        APU.sfx('ALARM');
      }
    } else if (this.state === 'DRAW') {
      this.reactTime += dt;
      if (PAD.hit('a')) {
        this.score = Math.floor(this.reactTime * 1000);
        this.state = 'WON';
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.score);
      }
    }
  },
  render(g) {
    g.clear(0);
    if (this.state === 'WAIT') g.textC("STEADY... WAIT...", 110, 2);
    else if (this.state === 'DRAW') g.textC("FIRE! PRESS [A]!", 110, 3, 2);
    else if (this.state === 'WON') g.textC("TIME: " + this.score + " MS", 110, 3);
    else if (this.state === 'FOUL') g.textC("FALSE START FOUL!", 110, 1);
  }
};
