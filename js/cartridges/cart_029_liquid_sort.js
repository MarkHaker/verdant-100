// js/cartridges/cart_029_liquid_sort.js
// ============================================================================
// Cartridge #029: LIQUID SORT
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 29. LIQUID SORT
CARTS[29] = {
  id: 29, name: "LIQUID SORT", genre: 2, scoreLabel: "LEVEL",
  desc: "POUR MATCHING LIQUIDS INTO TEST TUBES UNTIL EACH TUBE HOLDS ONE COLOR.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.box(x + 8, y + 8, 6, 18, 3);
    g.rect(x + 9, y + 16, 4, 9, 2);
  },
  LEVELS: [
    [[1, 2, 1, 2], [2, 1, 2, 1], [], []],
    [[1, 2, 3, 1], [2, 3, 1, 2], [3, 1, 2, 3], [], []],
    [[3, 2, 1, 2], [1, 3, 2, 1], [2, 1, 3, 3], [], []]
  ],
  init() {
    this.lvl = 1;
    this.score = 1;
    this.loadLevel(this.lvl);
  },
  loadLevel(l) {
    const raw = this.LEVELS[(l - 1) % this.LEVELS.length];
    this.tubes = raw.map(t => [...t]);
    this.sel = 0;
    this.selected = null;
    this.won = false;
  },
  update(dt) {
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('start')) {
        this.lvl++;
        this.loadLevel(this.lvl);
      }
      return;
    }
    const numTubes = this.tubes.length;
    if (PAD.hit('left')) this.sel = (this.sel - 1 + numTubes) % numTubes;
    if (PAD.hit('right')) this.sel = (this.sel + 1) % numTubes;

    // Direct touch tap selection
    if (PAD.tapPos) {
      const ox = 128 - (numTubes * 44) / 2;
      for (let i = 0; i < numTubes; i++) {
        const tx = ox + i * 44;
        if (PAD.tapPos.x >= tx && PAD.tapPos.x <= tx + 32 && PAD.tapPos.y >= 50 && PAD.tapPos.y <= 160) {
          this.sel = i;
          this.doPourAction();
          break;
        }
      }
    } else if (PAD.hit('a')) {
      this.doPourAction();
    }
  },
  doPourAction() {
    if (this.selected === null) {
      if (this.tubes[this.sel].length > 0) {
        this.selected = this.sel;
        APU.sfx('TICK');
      }
    } else {
      if (this.selected === this.sel) {
        this.selected = null;
      } else {
        const src = this.tubes[this.selected];
        const dst = this.tubes[this.sel];
        if (src.length > 0 && dst.length < 4) {
          const topColor = src[src.length - 1];
          if (dst.length === 0 || dst[dst.length - 1] === topColor) {
            while (src.length > 0 && src[src.length - 1] === topColor && dst.length < 4) {
              dst.push(src.pop());
            }
            APU.sfx('SPLASH');
            this.selected = null;

            // Check complete
            if (this.tubes.every(t => t.length === 0 || (t.length === 4 && t.every(c => c === t[0])))) {
              this.won = true;
              this.score = this.lvl;
              APU.sfx('LEVELUP');
              SAVE.setScore(this.id, this.score);
            }
          } else {
            APU.sfx('DENY');
            this.selected = null;
          }
        } else {
          APU.sfx('DENY');
          this.selected = null;
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("LIQUID SORT - LVL " + this.lvl, 14, 14, 3);
    const numTubes = this.tubes.length;
    const ox = 128 - (numTubes * 44) / 2;

    for (let i = 0; i < numTubes; i++) {
      const tx = ox + i * 44;
      const ty = this.selected === i ? 50 : 60;
      g.box(tx, ty, 26, 74, this.selected === i ? 3 : 2);

      const tube = this.tubes[i];
      for (let j = 0; j < tube.length; j++) {
        const c = tube[j];
        const col = c === 1 ? 2 : (c === 2 ? 3 : 1);
        g.rect(tx + 2, ty + 56 - j * 17, 22, 15, col);
      }
      if (i === this.sel) g.text("▲", tx + 9, ty + 80, 3);
    }

    if (this.won) {
      g.dither(50, 90, 156, 44, 0, 1);
      g.box(50, 90, 156, 44, 3);
      g.textC("ALL TUBES SORTED!", 100, 3);
      g.textC("[A] NEXT LEVEL", 116, 2);
    }
  }
};
