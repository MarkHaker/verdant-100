// js/cartridges/cart_020_match_3.js
// ============================================================================
// Cartridge #020: MATCH-3
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 20. MATCH-3
CARTS[20] = {
  id: 20, name: "MATCH-3", genre: 1, scoreLabel: "GEMS",
  desc: "SWAP NEIGHBORING GEMS TO FORM LINES OF 3+ MATCHES AND CASCADE MULTIPLIERS!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 10, y + 16, 4, 3);
    g.disc(x + 16, y + 16, 4, 3);
    g.disc(x + 22, y + 16, 4, 3);
  },
  init() {
    this.grid = E1.create(6, 6, 1);
    for (let i = 0; i < 36; i++) this.grid.data[i] = Math.floor(Math.random() * 4) + 1;
    // Clear any initial matches
    while (E1.findMatches(this.grid, 3).length > 0) {
      for (let i = 0; i < 36; i++) this.grid.data[i] = Math.floor(Math.random() * 4) + 1;
    }
    this.cx = 2; this.cy = 2;
    this.selected = null;
    this.score = 0;
  },
  dropGems() {
    let hadDrops = false;
    for (let x = 0; x < 6; x++) {
      let writeY = 5;
      for (let y = 5; y >= 0; y--) {
        const val = E1.get(this.grid, x, y);
        if (val !== 0) {
          if (writeY !== y) {
            E1.set(this.grid, x, writeY, val);
            E1.set(this.grid, x, y, 0);
            hadDrops = true;
          }
          writeY--;
        }
      }
      while (writeY >= 0) {
        E1.set(this.grid, x, writeY, Math.floor(Math.random() * 4) + 1);
        writeY--;
        hadDrops = true;
      }
    }
    return hadDrops;
  },
  resolveMatches() {
    let combo = 1;
    while (true) {
      const matches = E1.findMatches(this.grid, 3);
      if (matches.length === 0) break;
      for (let idx of matches) this.grid.data[idx] = 0;
      this.score += matches.length * 10 * combo;
      combo++;
      APU.sfx('COIN');
      this.dropGems();
    }
    SAVE.setScore(this.id, this.score);
  },
  update(dt) {
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(5, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(5, this.cy + 1);

    if (PAD.hit('a')) {
      if (!this.selected) {
        this.selected = { x: this.cx, y: this.cy };
        APU.sfx('TICK');
      } else {
        const dx = Math.abs(this.cx - this.selected.x);
        const dy = Math.abs(this.cy - this.selected.y);
        if (dx + dy === 1) {
          E1.swap(this.grid, this.cx, this.cy, this.selected.x, this.selected.y);
          const matches = E1.findMatches(this.grid, 3);
          if (matches.length > 0) {
            this.resolveMatches();
          } else {
            E1.swap(this.grid, this.cx, this.cy, this.selected.x, this.selected.y);
            APU.sfx('DENY');
          }
        }
        this.selected = null;
      }
    }

    if (PAD.tapPos) {
      const ox = 52, oy = 36, sz = 26;
      const tx = Math.floor((PAD.tapPos.x - ox) / sz);
      const ty = Math.floor((PAD.tapPos.y - oy) / sz);
      if (tx >= 0 && tx < 6 && ty >= 0 && ty < 6) {
        if (!this.selected) {
          this.selected = { x: tx, y: ty };
          this.cx = tx; this.cy = ty;
          APU.sfx('TICK');
        } else {
          const dx = Math.abs(tx - this.selected.x);
          const dy = Math.abs(ty - this.selected.y);
          if (dx + dy === 1) {
            E1.swap(this.grid, tx, ty, this.selected.x, this.selected.y);
            const matches = E1.findMatches(this.grid, 3);
            if (matches.length > 0) {
              this.resolveMatches();
            } else {
              E1.swap(this.grid, tx, ty, this.selected.x, this.selected.y);
              APU.sfx('DENY');
            }
          }
          this.selected = null;
          this.cx = tx; this.cy = ty;
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("MATCH-3 GEMS", 16, 14, 3);
    g.textR("SCORE: " + this.score, 240, 14, 3);

    const ox = 52, oy = 36, sz = 26;
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const bx = ox + x * sz, by = oy + y * sz;
        g.box(bx, by, sz, sz, 1);
        const val = E1.get(this.grid, x, y);
        if (val > 0) {
          if (val === 1) g.disc(bx + 13, by + 13, 5, 2);
          else if (val === 2) g.rect(bx + 7, by + 7, 12, 12, 2);
          else if (val === 3) g.tri(bx + 13, by + 6, bx + 6, by + 19, bx + 20, by + 19, 3);
          else if (val === 4) g.disc(bx + 13, by + 13, 7, 3);
        }
        if (this.selected && this.selected.x === x && this.selected.y === y) {
          g.box(bx - 1, by - 1, sz + 1, sz + 1, 3);
          g.box(bx - 2, by - 2, sz + 3, sz + 3, 3);
        } else if (x === this.cx && y === this.cy) {
          g.box(bx - 1, by - 1, sz + 1, sz + 1, 2);
        }
      }
    }
  }
};


// ============================================================================
// CARTRIDGES 21 - 40 (BLOCK 3: PHYSICS & BLOCK 4: RHYTHM/REACTION)
// ============================================================================;
