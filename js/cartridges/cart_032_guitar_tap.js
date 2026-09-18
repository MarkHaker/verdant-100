// js/cartridges/cart_032_guitar_tap.js
// ============================================================================
// Cartridge #032: GUITAR TAP
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 32. GUITAR TAP
CARTS[32] = {
  id: 32, name: "GUITAR TAP", genre: 3, scoreLabel: "COMBO",
  desc: "3 STRINGS: [◀] [▼] [▶]. HIT NOTES PRECISELY AS THEY REACH THE BEAT LINE!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 10, y + 4, x + 10, y + 28, 2);
    g.line(x + 16, y + 4, x + 16, y + 28, 2);
    g.line(x + 22, y + 4, x + 22, y + 28, 2);
    g.disc(x + 16, y + 22, 3, 3);
  },
  init() {
    this.tl = E8.createTimeline();
    this.notes = [];
    this.timer = 0;
    this.maxCombo = 0;
  },
  update(dt) {
    this.timer += dt;
    if (Math.random() < 0.04) {
      this.notes.push({ track: Math.floor(Math.random() * 3), y: 0 });
    }
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const n = this.notes[i];
      n.y += 120 * dt;
      if (n.y > 220) {
        this.notes.splice(i, 1);
        this.tl.combo = 0;
        APU.sfx('DENY');
      }
    }
    if (PAD.hit('left')) this.hitTrack(0);
    if (PAD.hit('down')) this.hitTrack(1);
    if (PAD.hit('right')) this.hitTrack(2);
  },
  hitTrack(tr) {
    for (let i = 0; i < this.notes.length; i++) {
      const n = this.notes[i];
      if (n.track === tr && Math.abs(n.y - 200) < 18) {
        this.notes.splice(i, 1);
        this.tl.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.tl.combo);
        APU.sfx('COIN');
        SAVE.setScore(this.id, this.maxCombo);
        return;
      }
    }
    this.tl.combo = 0;
    APU.sfx('DENY');
  },
  render(g) {
    g.clear(0);
    for (let tr = 0; tr < 3; tr++) g.line(70 + tr * 40, 20, 70 + tr * 40, 220, 1);
    g.line(50, 200, 170, 200, 3);
    for (let n of this.notes) g.disc(70 + n.track * 40, Math.floor(n.y), 6, 3);
    g.text("COMBO: " + this.tl.combo, 14, 14, 3);
    g.textR("RECORD: " + SAVE.getScore(this.id), 244, 14, 2);
  }
};
