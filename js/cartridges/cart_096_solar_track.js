// js/cartridges/cart_096_solar_track.js
// ============================================================================
// Cartridge #096: SOLAR TRACK
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 96. SOLAR TRACKER
CARTS[96] = {
  id: 96, name: "SOLAR TRACK", genre: 9, scoreLabel: "KWH",
  desc: "ROTATE HELIOSTAT SOLAR PANEL TO MATCH SUN'S TRANSIT ARC AND CHARGE BATTERY!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 10, 5, 3);
    g.line(x + 8, y + 24, x + 24, y + 20, 2);
  },
  init() {
    this.sunAngle = 0;
    this.panelAngle = 0;
    this.kwh = 0;
  },
  update(dt) {
    this.sunAngle += 0.3 * dt;
    if (PAD.state.left) this.panelAngle -= 1.5 * dt;
    if (PAD.state.right) this.panelAngle += 1.5 * dt;
    if (Math.abs(this.sunAngle - this.panelAngle) < 0.2) {
      this.kwh += 10 * dt;
      SAVE.setScore(this.id, Math.floor(this.kwh));
    }
  },
  render(g) {
    g.clear(0);
    g.text("SOLAR TRACKER", 14, 14, 3);
    g.textR("ENERGY: " + Math.floor(this.kwh) + " KWH", 240, 14, 2);
    // Sun
    const sx = 128 + Math.cos(this.sunAngle) * 80;
    const sy = 160 - Math.sin(this.sunAngle) * 80;
    g.disc(Math.floor(sx), Math.floor(sy), 8, 3);
    // Panel
    g.line(110, 180, 146, 180, 2);
  }
};
