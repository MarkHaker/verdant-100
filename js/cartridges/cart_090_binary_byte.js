// js/cartridges/cart_090_binary_byte.js
// ============================================================================
// Cartridge #090: BINARY BYTE
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 90. BINARY BYTE
CARTS[90] = {
  id: 90, name: "BINARY BYTE", genre: 8, scoreLabel: "BYTES",
  desc: "8 TOGGLE BITS (128 TO 1): FLIP SWITCHES TO MATCH TARGET DECIMAL (0-255)!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("1011", x + 4, y + 13, 3);
  },
  init() {
    this.bits = [0, 0, 0, 0, 0, 0, 0, 0];
    this.target = 42;
    this.curBit = 0;
  },
  update(dt) {
    if (PAD.hit('left')) this.curBit = Math.max(0, this.curBit - 1);
    if (PAD.hit('right')) this.curBit = Math.min(7, this.curBit + 1);
    if (PAD.hit('a')) {
      this.bits[this.curBit] = this.bits[this.curBit] ? 0 : 1;
      APU.sfx('TICK');
    }
  },
  render(g) {
    g.clear(0);
    g.text("BINARY CONVERTER", 14, 14, 3);
    g.textC("TARGET: " + this.target, 50, 3, 2);

    let sum = 0;
    for (let i = 0; i < 8; i++) {
      const bx = 20 + i * 27;
      g.box(bx, 100, 24, 36, i === this.curBit ? 3 : 2);
      g.text("" + this.bits[i], bx + 10, 114, 3);
      if (this.bits[i]) sum += Math.pow(2, 7 - i);
    }
    g.textC("CURRENT: " + sum, 160, 2);
    if (sum === this.target) g.textC("MATCH! [A] TO SUBMIT", 190, 3);
  }
};
