// js/cartridges/cart_028_rope_swing.js
// ============================================================================
// Cartridge #028: ROPE SWING
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 28. ROPE SWING
CARTS[28] = {
  id: 28, name: "ROPE SWING", genre: 2, scoreLabel: "DISTANCE",
  desc: "[A] LATCH ROPE TO CEILING ANCHOR, [B] RELEASE TO LEAP OVER HAZARDS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 16, y + 4, x + 24, y + 20, 2);
    g.disc(x + 24, y + 20, 3, 3);
  },
  init() {
    this.px = 40; this.py = 120;
    this.vx = 60; this.vy = 0;
    this.camX = 0;
    this.anchors = [
      { x: 80, y: 30 }, { x: 160, y: 30 }, { x: 240, y: 30 },
      { x: 320, y: 30 }, { x: 400, y: 30 }, { x: 480, y: 30 }
    ];
    this.activeAnchor = null;
    this.latched = false;
    this.score = 0;
    this.over = false;
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }

    // Find nearest anchor on A press
    if (PAD.hit('a')) {
      let nearest = null, minDist = 110;
      for (let a of this.anchors) {
        const d = Math.hypot(this.px - a.x, this.py - a.y);
        if (d < minDist && a.y < this.py) {
          minDist = d;
          nearest = a;
        }
      }
      if (nearest) {
        this.activeAnchor = nearest;
        this.latched = true;
        APU.sfx('SWISH');
      }
    }
    if (PAD.hit('b')) {
      this.latched = false;
      this.activeAnchor = null;
    }

    this.vy += 200 * dt;
    if (this.latched && this.activeAnchor) {
      const dx = this.px - this.activeAnchor.x, dy = this.py - this.activeAnchor.y;
      const dist = Math.hypot(dx, dy) || 1;
      const ropeLen = 85;
      if (dist > ropeLen) {
        this.px = this.activeAnchor.x + (dx / dist) * ropeLen;
        this.py = this.activeAnchor.y + (dy / dist) * ropeLen;
        // Swing acceleration
        this.vx += 60 * dt;
      }
    }

    this.px += this.vx * dt;
    this.py += this.vy * dt;
    this.score = Math.max(this.score, Math.floor(this.px));

    // Smooth camera scroll
    this.camX = this.px - 60;

    // Spawn further anchors dynamically
    const lastAnchor = this.anchors[this.anchors.length - 1];
    if (this.px + 300 > lastAnchor.x) {
      this.anchors.push({ x: lastAnchor.x + 80 + Math.random() * 20, y: 25 + Math.random() * 15 });
    }

    // Pit death
    if (this.py > 230) {
      this.over = true;
      APU.sfx('BOOM');
      SAVE.setScore(this.id, this.score);
    }
  },
  render(g) {
    g.clear(0);
    // Ceiling
    g.line(0, 16, 256, 16, 1);
    // Pit hazard at bottom
    for (let x = 0; x < 256; x += 12) {
      g.tri(x, 240, x + 6, 226, x + 12, 240, 2);
    }

    // Anchors & Ropes
    for (let a of this.anchors) {
      const scrX = Math.floor(a.x - this.camX);
      if (scrX >= -20 && scrX <= 280) {
        g.disc(scrX, a.y, 4, 2);
      }
    }

    const playerScrX = Math.floor(this.px - this.camX);
    const playerScrY = Math.floor(this.py);

    if (this.latched && this.activeAnchor) {
      g.line(Math.floor(this.activeAnchor.x - this.camX), this.activeAnchor.y, playerScrX, playerScrY, 2);
    }

    // Acrobat
    g.disc(playerScrX, playerScrY, 5, 3);

    g.text("DIST: " + this.score + "M", 14, 14, 3);
    g.textR("[A] LATCH  [B] RELEASE", 244, 14, 2);

    if (this.over) {
      g.dither(50, 90, 156, 44, 0, 1);
      g.box(50, 90, 156, 44, 3);
      g.textC("FELL INTO CHASM!", 100, 3);
      g.textC("[A] TO RETRY", 116, 2);
    }
  }
};
