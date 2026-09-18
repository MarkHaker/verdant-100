// js/cartridges/cart_092_thermostat.js
// ============================================================================
// Cartridge #092: THERMOSTAT
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 92. THERMOSTAT WAR
CARTS[92] = {
  id: 92, name: "THERMOSTAT", genre: 9, scoreLabel: "SECONDS",
  desc: "OFFICE THERMOSTAT WAR: KEEP COMFORT ZONE 21.0°C AS AI NEIGHBORS TWEAK DIAL!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.circle(x + 16, y + 16, 10, 2);
    g.line(x + 16, y + 16, x + 20, y + 10, 3);
  },
  init() {
    this.temp = 21.0;
    this.score = 0;
  },
  update(dt) {
    this.temp += (Math.random() - 0.48) * 4 * dt;
    if (PAD.hit('up')) this.temp += 0.5;
    if (PAD.hit('down')) this.temp -= 0.5;
    if (Math.abs(this.temp - 21.0) < 1.0) {
      this.score += dt;
      SAVE.setScore(this.id, Math.floor(this.score));
    }
  },
  render(g) {
    g.clear(0);
    g.text("OFFICE THERMOSTAT", 14, 14, 3);
    g.textC(this.temp.toFixed(1) + "°C", 100, 3, 3);
    g.textC("TARGET: 21.0°C", 140, 2);
  }
};
