// js/cartridges/cart_026_chain_react.js
// ============================================================================
// Cartridge #026: CHAIN REACT
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 26. CHAIN REACTION
CARTS[26] = {
  id: 26, name: "CHAIN REACT", genre: 2, scoreLabel: "ORBS",
  desc: "TRIGGER 1 EXPLOSION ON BOARD TO DETONATE BOUNCING ORBS IN CHAIN REACTION!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 16, 7, 3);
    g.circle(x + 16, y + 16, 12, 2);
  },
  init() {
    this.orbs = [];
    for (let i = 0; i < 24; i++) {
      this.orbs.push({
        x: Math.random() * 240 + 8, y: Math.random() * 200 + 20,
        vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60,
        detonated: false
      });
    }
    this.explosions = [];
    this.cx = 128; this.cy = 120;
    this.triggered = false;
    this.score = 0;
  },
  update(dt) {
    if (!this.triggered) {
      if (PAD.state.left) this.cx = Math.max(10, this.cx - 160 * dt);
      if (PAD.state.right) this.cx = Math.min(246, this.cx + 160 * dt);
      if (PAD.state.up) this.cy = Math.max(20, this.cy - 160 * dt);
      if (PAD.state.down) this.cy = Math.min(220, this.cy + 160 * dt);
      if (PAD.hit('a')) {
        this.triggered = true;
        this.explosions.push({ x: this.cx, y: this.cy, r: 2, life: 1.5 });
        APU.sfx('BOOM');
      }
    }

    // Move orbs
    for (let o of this.orbs) {
      if (!o.detonated) {
        o.x += o.vx * dt; o.y += o.vy * dt;
        if (o.x < 10 || o.x > 246) o.vx = -o.vx;
        if (o.y < 20 || o.y > 220) o.vy = -o.vy;

        // Check against explosions
        for (let e of this.explosions) {
          if (Math.hypot(o.x - e.x, o.y - e.y) < e.r) {
            o.detonated = true;
            this.explosions.push({ x: o.x, y: o.y, r: 2, life: 1.5 });
            this.score++;
            APU.sfx('COIN');
            break;
          }
        }
      }
    }

    // Explosions expansion
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const e = this.explosions[i];
      e.life -= dt;
      e.r = Math.min(20, e.r + 25 * dt);
      if (e.life <= 0) this.explosions.splice(i, 1);
    }
  },
  render(g) {
    g.clear(0);
    g.text("CHAIN REACTION", 14, 10, 3);
    g.textR("SCORE: " + this.score + "/24", 240, 10, 3);

    for (let o of this.orbs) {
      if (!o.detonated) g.disc(Math.floor(o.x), Math.floor(o.y), 3, 2);
    }
    for (let e of this.explosions) g.circle(Math.floor(e.x), Math.floor(e.y), Math.floor(e.r), 3);
    if (!this.triggered) g.box(Math.floor(this.cx) - 4, Math.floor(this.cy) - 4, 8, 8, 3);
  }
};
