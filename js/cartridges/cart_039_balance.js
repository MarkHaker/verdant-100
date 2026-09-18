// js/cartridges/cart_039_balance.js
// ============================================================================
// Cartridge #039: BALANCE
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 39. BALANCE STICK
CARTS[39] = {
  id: 39, name: "BALANCE", genre: 3, scoreLabel: "SECONDS",
  desc: "ACCELERATE CART LEFT/RIGHT TO BALANCE INVERTED PENDULUM IN WIND GUSTS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 10, y + 22, 12, 6, 2);
    g.line(x + 16, y + 22, x + 18, y + 6, 3);
  },
  init() {
    this.cartX = 128;
    this.cartVX = 0;
    this.angle = 0.04;
    this.angVel = 0;
    this.time = 0;
    this.wind = 0;
    this.over = false;
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start')) this.init();
      return;
    }
    this.time += dt;

    if (Math.random() < 0.05) {
      this.wind = (Math.random() - 0.5) * 1.5;
    }

    let ax = 0;
    if (PAD.state.left) ax -= 280;
    if (PAD.state.right) ax += 280;

    this.cartVX += ax * dt;
    this.cartVX *= 0.90;
    this.cartX += this.cartVX * dt;

    if (this.cartX < 24) { this.cartX = 24; this.cartVX = 0; }
    if (this.cartX > 232) { this.cartX = 232; this.cartVX = 0; }

    const gravTorque = Math.sin(this.angle) * 7.5;
    const accelTorque = -ax * 0.045 * Math.cos(this.angle);
    this.angVel += (gravTorque + accelTorque + this.wind) * dt;
    this.angVel *= 0.995;
    this.angle += this.angVel * dt;

    if (Math.abs(this.angle) > 1.1) {
      this.over = true;
      APU.sfx('BOOM');
      SAVE.setScore(this.id, Math.floor(this.time));
    }
  },
  render(g) {
    g.clear(0);
    g.line(0, 190, 256, 190, 1);
    g.rect(Math.floor(this.cartX) - 16, 182, 32, 10, 2);
    g.box(Math.floor(this.cartX) - 16, 182, 32, 10, 3);
    g.disc(Math.floor(this.cartX) - 10, 192, 3, 3);
    g.disc(Math.floor(this.cartX) + 10, 192, 3, 3);

    const tipX = this.cartX + Math.sin(this.angle) * 75;
    const tipY = 182 - Math.cos(this.angle) * 75;
    g.line(Math.floor(this.cartX), 182, Math.floor(tipX), Math.floor(tipY), 3);
    g.disc(Math.floor(tipX), Math.floor(tipY), 4, 3);

    g.text("BALANCED: " + this.time.toFixed(1) + "S", 14, 14, 3);
    if (Math.abs(this.wind) > 0.3) {
      g.textR(this.wind > 0 ? "WIND >>" : "<< WIND", 240, 14, 2);
    }

    if (this.over) {
      g.rect(48, 85, 160, 60, 0);
      g.box(48, 85, 160, 60, 3);
      g.textC("STICK COLLAPSED!", 98, 1);
      g.textC("TIME SURVIVED: " + this.time.toFixed(1) + " S", 114, 3);
      g.textC("PRESS [A] TO RETRY", 130, 2);
    }
  }
};
