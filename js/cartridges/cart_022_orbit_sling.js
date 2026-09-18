// js/cartridges/cart_022_orbit_sling.js
// ============================================================================
// Cartridge #022: ORBIT SLING
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 22. ORBIT SLINGSHOT
CARTS[22] = {
  id: 22, name: "ORBIT SLING", genre: 2, scoreLabel: "ZONES",
  desc: "USE GRAVITY WELLS OF CELESTIAL BODIES TO SLINGSHOT PROBE INTO PORTAL!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 16, 6, 2);
    g.circle(x + 16, y + 16, 11, 1);
    g.disc(x + 6, y + 22, 2, 3);
  },
  init() {
    this.sun = { x: 128, y: 120, mass: 6000 };
    this.portal = { x: 220, y: 40, r: 12 };
    this.probe = null;
    this.aimAngle = -0.7;
    this.score = 0;
    this.cleared = false;
  },
  update(dt) {
    if (this.cleared) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    if (!this.probe) {
      if (PAD.state.up) this.aimAngle -= 1.5 * dt;
      if (PAD.state.down) this.aimAngle += 1.5 * dt;
      if (PAD.hit('a')) {
        this.probe = { x: 20, y: 200, vx: Math.cos(this.aimAngle) * 90, vy: Math.sin(this.aimAngle) * 90 };
        APU.sfx('SWISH');
      }
    } else {
      const dx = this.sun.x - this.probe.x;
      const dy = this.sun.y - this.probe.y;
      const d2 = dx * dx + dy * dy;
      const d = Math.sqrt(d2);
      if (d < 10) {
        this.probe = null;
        APU.sfx('BOOM');
      } else {
        const f = this.sun.mass / (d2 || 1);
        this.probe.vx += (dx / d) * f * dt;
        this.probe.vy += (dy / d) * f * dt;
        this.probe.x += this.probe.vx * dt;
        this.probe.y += this.probe.vy * dt;

        // Reach portal
        if (Math.hypot(this.probe.x - this.portal.x, this.probe.y - this.portal.y) < this.portal.r) {
          this.cleared = true;
          this.score++;
          APU.sfx('LEVELUP');
          SAVE.setScore(this.id, this.score);
        } else if (this.probe.x < 0 || this.probe.x > 256 || this.probe.y < 0 || this.probe.y > 240) {
          this.probe = null;
          APU.sfx('HURT');
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("ORBIT SLINGSHOT", 14, 12, 3);

    // Sun & Gravity ring
    g.disc(this.sun.x, this.sun.y, 8, 2);
    g.circle(this.sun.x, this.sun.y, 24, 1);

    // Target portal
    g.circle(this.portal.x, this.portal.y, this.portal.r, 3);
    g.textC("PORTAL", this.portal.y - 18, 3);

    // Probe
    if (this.probe) {
      g.disc(Math.floor(this.probe.x), Math.floor(this.probe.y), 3, 3);
    } else {
      g.disc(20, 200, 3, 3);
      g.line(20, 200, 20 + Math.cos(this.aimAngle) * 20, 200 + Math.sin(this.aimAngle) * 20, 2);
      g.text("[A] LAUNCH PROBE", 14, 224, 2);
    }
    if (this.cleared) g.textC("ORBIT REACHED! SUCCESS", 100, 3);
  }
};
