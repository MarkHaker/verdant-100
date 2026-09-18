// js/cartridges/cart_041_tactics.js
// ============================================================================
// Cartridge #041: TACTICS
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 41. MICRO-TACTICS
CARTS[41] = {
  id: 41, name: "TACTICS", genre: 4, scoreLabel: "WINS",
  desc: "TURN-BASED TACTICAL GRID: SPEARMAN, ARCHER, SHIELD. ELIMINATE ENEMY SQUAD!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.tri(x + 10, y + 22, x + 16, y + 10, x + 22, y + 22, 3);
  },
  init() {
    this.units = [
      { x: 1, y: 2, hp: 3, player: true, type: 'S' },
      { x: 1, y: 4, hp: 3, player: true, type: 'A' },
      { x: 5, y: 2, hp: 3, player: false, type: 'S' },
      { x: 5, y: 4, hp: 3, player: false, type: 'A' }
    ];
    this.sel = 0;
    this.turn = 'PLAYER';
    this.score = 0;
  },
  update(dt) {
    if (PAD.hit('left')) this.units[this.sel].x = Math.max(0, this.units[this.sel].x - 1);
    if (PAD.hit('right')) this.units[this.sel].x = Math.min(6, this.units[this.sel].x + 1);
    if (PAD.hit('up')) this.units[this.sel].y = Math.max(0, this.units[this.sel].y - 1);
    if (PAD.hit('down')) this.units[this.sel].y = Math.min(6, this.units[this.sel].y + 1);
    if (PAD.hit('b')) this.sel = (this.sel + 1) % 2;
    if (PAD.hit('a')) {
      APU.sfx('HIT');
      // Simple attack check
      for (let u of this.units) {
        if (!u.player && Math.hypot(u.x - this.units[this.sel].x, u.y - this.units[this.sel].y) <= 1) {
          u.hp--;
          if (u.hp <= 0) {
            this.score++;
            APU.sfx('LEVELUP');
            SAVE.setScore(this.id, this.score);
          }
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("MICRO-TACTICS", 14, 12, 3);
    const ox = 50, oy = 36, sz = 24;
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) g.box(ox + x * sz, oy + y * sz, sz, sz, 1);
    }
    for (let i = 0; i < this.units.length; i++) {
      const u = this.units[i];
      if (u.hp > 0) {
        const bx = ox + u.x * sz, by = oy + u.y * sz;
        g.rect(bx + 3, by + 3, sz - 6, sz - 6, u.player ? 3 : 2);
        g.text(u.type, bx + 8, by + 6, 0);
        if (i === this.sel) g.box(bx, by, sz, sz, 3);
      }
    }
  }
};
