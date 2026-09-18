// js/cartridges/cart_086_simon_sound.js
// ============================================================================
// Cartridge #086: SIMON SOUND
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 86. SIMON SOUND
CARTS[86] = {
  id: 86, name: "SIMON SOUND", genre: 8, scoreLabel: "LENGTH",
  desc: "4 MUSICAL PADS: MEMORIZE AND REPEAT GROWING CHIPTUNE MELODY PATTERN!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 6, y + 6, 8, 8, 3);
    g.rect(x + 18, y + 6, 8, 8, 2);
    g.rect(x + 6, y + 18, 8, 8, 2);
    g.rect(x + 18, y + 18, 8, 8, 1);
  },
  init() {
    this.pattern = [0, 1, 2, 0];
    this.seqIdx = 0;
    this.score = 4;
  },
  update(dt) {
    if (PAD.hit('up')) this.playPad(0);
    if (PAD.hit('right')) this.playPad(1);
    if (PAD.hit('down')) this.playPad(2);
    if (PAD.hit('left')) this.playPad(3);
  },
  playPad(p) {
    APU.tone(300 + p * 120, 0.15, 'square', 0.4);
    if (p === this.pattern[this.seqIdx]) {
      this.seqIdx++;
      if (this.seqIdx >= this.pattern.length) {
        this.pattern.push(Math.floor(Math.random() * 4));
        this.seqIdx = 0;
        this.score++;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.score);
      }
    } else {
      APU.sfx('DENY');
      this.seqIdx = 0;
    }
  },
  render(g) {
    g.clear(0);
    g.text("SIMON CHIPTUNE", 14, 14, 3);
    g.textR("STREAK: " + this.score, 240, 14, 2);

    g.rect(100, 50, 56, 40, 3);  // UP
    g.rect(160, 95, 56, 40, 2);  // RIGHT
    g.rect(100, 140, 56, 40, 3); // DOWN
    g.rect(40, 95, 56, 40, 2);   // LEFT
  }
};
