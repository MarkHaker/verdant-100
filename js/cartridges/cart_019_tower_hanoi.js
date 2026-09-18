// js/cartridges/cart_019_tower_hanoi.js
// ============================================================================
// Cartridge #019: TOWER HANOI
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 19. TOWER OF HANOI
CARTS[19] = {
  id: 19, name: "TOWER HANOI", genre: 1, scoreLabel: "MOVES",
  desc: "MOVE ENTIRE DISK STACK TO RIGHT PEG. NEVER PLACE LARGER ON SMALLER!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 16, y + 6, x + 16, y + 26, 2);
    g.rect(x + 8, y + 22, 16, 4, 3);
    g.rect(x + 11, y + 17, 10, 4, 3);
  },
  init() {
    this.pegs = [[4, 3, 2, 1], [], []];
    this.sel = 0;
    this.heldDisk = null;
    this.moves = 0;
    this.won = false;
  },
  update(dt) {
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    if (PAD.hit('left')) this.sel = Math.max(0, this.sel - 1);
    if (PAD.hit('right')) this.sel = Math.min(2, this.sel + 1);
    if (PAD.hit('a')) {
      if (this.heldDisk === null) {
        if (this.pegs[this.sel].length > 0) {
          this.heldDisk = this.pegs[this.sel].pop();
          APU.sfx('TICK');
        }
      } else {
        const top = this.pegs[this.sel][this.pegs[this.sel].length - 1];
        if (!top || top > this.heldDisk) {
          this.pegs[this.sel].push(this.heldDisk);
          this.heldDisk = null;
          this.moves++;
          APU.sfx('HIT');
          if (this.pegs[2].length === 4) {
            this.won = true;
            APU.sfx('LEVELUP');
            SAVE.setScore(this.id, this.moves);
          }
        } else {
          APU.sfx('DENY');
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("TOWER OF HANOI", 16, 14, 3);
    g.textR("MOVES: " + this.moves, 240, 14, 2);

    for (let p = 0; p < 3; p++) {
      const px = 50 + p * 78;
      g.line(px, 70, px, 180, 1);
      g.rect(px - 30, 180, 60, 6, 2);
      if (p === this.sel) g.text("▲", px - 4, 196, 3);

      const stack = this.pegs[p];
      for (let i = 0; i < stack.length; i++) {
        const d = stack[i];
        const dw = d * 14;
        g.rect(px - dw / 2, 174 - i * 10, dw, 8, 3);
      }
    }
    if (this.heldDisk !== null) {
      const px = 50 + this.sel * 78;
      const dw = this.heldDisk * 14;
      g.rect(px - dw / 2, 50, dw, 8, 3);
    }
    if (this.won) g.textC("COMPLETED IN " + this.moves + " MOVES!", 210, 3);
  }
};
