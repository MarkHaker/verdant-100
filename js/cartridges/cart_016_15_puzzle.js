// js/cartridges/cart_016_15_puzzle.js
// ============================================================================
// Cartridge #016: 15-PUZZLE
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 16. 15-PUZZLE
CARTS[16] = {
  id: 16, name: "15-PUZZLE", genre: 1, scoreLabel: "MOVES",
  desc: "SLIDE 1-15 NUMBERED TILES INTO SEQUENTIAL ORDER. SWIPE OR TAP!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("1 2", x + 6, y + 8, 3);
    g.text("3  ", x + 6, y + 18, 3);
  },
  init() {
    this.tiles = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];
    this.moves = 0;
    this.won = false;
    // Solvable shuffle
    for (let i = 0; i < 80; i++) {
      const emptyIdx = this.tiles.indexOf(0);
      const adj = [];
      const ex = emptyIdx % 4, ey = Math.floor(emptyIdx / 4);
      if (ex > 0) adj.push(emptyIdx - 1);
      if (ex < 3) adj.push(emptyIdx + 1);
      if (ey > 0) adj.push(emptyIdx - 4);
      if (ey < 3) adj.push(emptyIdx + 4);
      const pick = adj[Math.floor(Math.random() * adj.length)];
      this.tiles[emptyIdx] = this.tiles[pick];
      this.tiles[pick] = 0;
    }
  },
  update(dt) {
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    const emptyIdx = this.tiles.indexOf(0);
    const ex = emptyIdx % 4, ey = Math.floor(emptyIdx / 4);
    let target = -1;

    const sw = PAD.swipe;
    if ((PAD.hit('up') || sw === 'up') && ey < 3) target = emptyIdx + 4;
    if ((PAD.hit('down') || sw === 'down') && ey > 0) target = emptyIdx - 4;
    if ((PAD.hit('left') || sw === 'left') && ex < 3) target = emptyIdx + 1;
    if ((PAD.hit('right') || sw === 'right') && ex > 0) target = emptyIdx - 1;

    // Direct touch tap
    if (PAD.tapPos) {
      const ox = 52, oy = 36, sz = 38;
      const tx = Math.floor((PAD.tapPos.x - ox) / sz);
      const ty = Math.floor((PAD.tapPos.y - oy) / sz);
      if (tx >= 0 && tx < 4 && ty >= 0 && ty < 4) {
        const clickedIdx = ty * 4 + tx;
        if (Math.abs(tx - ex) + Math.abs(ty - ey) === 1) {
          target = clickedIdx;
        }
      }
    }

    if (target >= 0) {
      this.tiles[emptyIdx] = this.tiles[target];
      this.tiles[target] = 0;
      this.moves++;
      APU.sfx('TICK');

      // Win check
      let solved = true;
      for (let i = 0; i < 15; i++) {
        if (this.tiles[i] !== i + 1) { solved = false; break; }
      }
      if (solved) {
        this.won = true;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.moves);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("15-PUZZLE", 16, 14, 3);
    g.textR("MOVES: " + this.moves, 240, 14, 2);

    const ox = 52, oy = 36, sz = 38;
    g.box(ox - 2, oy - 2, 4 * sz + 4, 4 * sz + 4, 2);

    for (let i = 0; i < 16; i++) {
      const val = this.tiles[i];
      const x = i % 4, y = Math.floor(i / 4);
      const bx = ox + x * sz, by = oy + y * sz;
      g.box(bx, by, sz, sz, 1);
      if (val > 0) {
        g.rect(bx + 2, by + 2, sz - 4, sz - 4, 2);
        g.line(bx + 2, by + 2, bx + sz - 3, by + 2, 3);
        g.line(bx + 2, by + 2, bx + 2, by + sz - 3, 3);
        g.line(bx + 2, by + sz - 3, bx + sz - 3, by + sz - 3, 1);
        g.line(bx + sz - 3, by + 2, bx + sz - 3, by + sz - 3, 1);

        const sVal = "" + val;
        const tw = sVal.length * 5 - 1;
        const tx = Math.floor(bx + (sz - tw) / 2);
        const ty = Math.floor(by + (sz - 6) / 2);
        g.text(sVal, tx, ty, 3);
      }
    }

    if (this.won) {
      g.dither(64, 100, 128, 44, 0, 1);
      g.box(64, 100, 128, 44, 3);
      g.textC("PUZZLE SOLVED!", 110, 3);
      g.textC("[A] PLAY AGAIN", 124, 2);
    }
  }
};
