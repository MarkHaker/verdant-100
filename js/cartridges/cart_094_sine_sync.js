// js/cartridges/cart_094_sine_sync.js
// ============================================================================
// Cartridge #094: SINE SYNC
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 94. SINE WAVE SYNC
CARTS[94] = {
  id: 94, name: "SINE SYNC", genre: 9, scoreLabel: "ACCURACY",
  desc: "OSCILLOSCOPE TUNER: ADJUST FREQ & AMPLITUDE TO PHASE-LOCK SINE WITH TARGET!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 4, y + 16, x + 16, y + 8, 3);
    g.line(x + 16, y + 8, x + 28, y + 24, 3);
  },
  init() {
    this.freq = 2.0;
    this.targetFreq = 3.0;
    this.t = 0;
  },
  update(dt) {
    this.t += dt;
    if (PAD.state.left) this.freq -= 1.0 * dt;
    if (PAD.state.right) this.freq += 1.0 * dt;
  },
  render(g) {
    g.clear(0);
    g.text("OSCILLOSCOPE SYNC", 14, 14, 3);
    for (let x = 0; x < 256; x += 2) {
      const y1 = 120 + Math.sin(x * 0.05 * this.freq + this.t * 4) * 30;
      const y2 = 120 + Math.sin(x * 0.05 * this.targetFreq + this.t * 4) * 30;
      g.px(x, Math.floor(y1), 3);
      g.px(x, Math.floor(y2), 1);
    }
  }
};
