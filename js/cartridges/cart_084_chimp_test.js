// js/cartridges/cart_084_chimp_test.js
// ============================================================================
// Cartridge #084: CHIMP TEST
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[84] = {
  id: 84,
  name: "CHIMP TEST",
  genre: 8,
  scoreLabel: "DIGITS",
  desc: "AYUMU BENCHMARK: MEMORIZE SCATTERED NUMBERS. TAP 1, THEN COMPLETE THE SEQUENCE FROM MEMORY!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // 3 squares with numbers
    g.box(x + 5, y + 6, 8, 8, 2); g.text("1", x + 7, y + 7, 3);
    g.box(x + 19, y + 8, 8, 8, 2); g.text("2", x + 21, y + 9, 3);
    g.box(x + 10, y + 18, 8, 8, 2); g.text("3", x + 12, y + 19, 3);
  },

  init() {
    this.gridW = 5;
    this.gridH = 4; // 5x4 grid = 20 cells
    this.level = 1;
    this.numDigits = 4; // Starts at 4, increases up to 10
    this.strikes = 0;
    this.maxStrikes = 3;

    this.tiles = []; // { x, y, num, solved, wrong }
    this.nextNeeded = 1;
    this.hidden = false;
    this.cursorX = 2;
    this.cursorY = 2;

    this.state = 'MEMORIZE'; // 'MEMORIZE', 'RECALL', 'LEVEL_PASS', 'GAMEOVER'
    this.stateTimer = 0;
    this.bestLevel = 4;

    this.startRound(4);
  },

  startRound(digits) {
    this.numDigits = digits;
    this.nextNeeded = 1;
    this.hidden = false;
    this.state = 'MEMORIZE';
    this.stateTimer = 0;
    this.tiles = [];

    // Pick 'digits' unique random positions from 5x4 grid
    var allPositions = [];
    for (var y = 0; y < this.gridH; y++) {
      for (var x = 0; x < this.gridW; x++) {
        allPositions.push({ x: x, y: y });
      }
    }
    // Shuffle positions
    for (var i = allPositions.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = allPositions[i];
      allPositions[i] = allPositions[j];
      allPositions[j] = temp;
    }

    for (var d = 1; d <= this.numDigits; d++) {
      var pos = allPositions[d - 1];
      this.tiles.push({
        gx: pos.x,
        gy: pos.y,
        num: d,
        solved: false
      });
    }

    this.cursorX = this.tiles[0].gx;
    this.cursorY = this.tiles[0].gy;
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;

    if (this.state === 'LEVEL_PASS') {
      if (this.stateTimer > 1.2 || PAD.hit('a') || TOUCH.down) {
        APU.sfx('CONFIRM');
        this.level++;
        this.startRound(this.numDigits + 1);
      }
      return;
    }

    if (this.state === 'GAMEOVER') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    // D-pad Navigation
    if (PAD.hit('left')) { this.cursorX = Math.max(0, this.cursorX - 1); APU.sfx('SELECT'); }
    if (PAD.hit('right')) { this.cursorX = Math.min(this.gridW - 1, this.cursorX + 1); APU.sfx('SELECT'); }
    if (PAD.hit('up')) { this.cursorY = Math.max(0, this.cursorY - 1); APU.sfx('SELECT'); }
    if (PAD.hit('down')) { this.cursorY = Math.min(this.gridH - 1, this.cursorY + 1); APU.sfx('SELECT'); }

    // [A] Click on current tile
    if (PAD.hit('a')) {
      this.handleTileClick(this.cursorX, this.cursorY);
    }

    // Direct Touch Support
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      var ox = 25, oy = 40, sz = 38;
      if (tx >= ox && tx < ox + this.gridW * sz && ty >= oy && ty < oy + this.gridH * sz) {
        var gx = Math.floor((tx - ox) / sz);
        var gy = Math.floor((ty - oy) / sz);
        this.cursorX = gx;
        this.cursorY = gy;
        this.handleTileClick(gx, gy);
      }
    }
  },

  handleTileClick(gx, gy) {
    // Find if there's a tile at (gx, gy)
    var hitTile = null;
    for (var i = 0; i < this.tiles.length; i++) {
      var t = this.tiles[i];
      if (t.gx === gx && t.gy === gy && !t.solved) {
        hitTile = t;
        break;
      }
    }

    if (!hitTile) return;

    if (hitTile.num === this.nextNeeded) {
      // Correct!
      hitTile.solved = true;
      this.nextNeeded++;
      APU.sfx('TICK');

      // Tapping "1" conceals all other numbers!
      if (!this.hidden) {
        this.hidden = true;
        this.state = 'RECALL';
      }

      // Check if all numbers solved!
      if (this.nextNeeded > this.numDigits) {
        this.state = 'LEVEL_PASS';
        this.stateTimer = 0;
        if (this.numDigits > this.bestLevel) this.bestLevel = this.numDigits;
        SAVE.setScore(this.id, this.bestLevel);
        APU.sfx('COIN');
      }
    } else {
      // WRONG SEQUENCE!
      this.strikes++;
      APU.sfx('HIT');
      if (this.strikes >= this.maxStrikes) {
        this.state = 'GAMEOVER';
        this.stateTimer = 0;
        APU.sfx('ERROR');
      } else {
        // Re-try this round
        this.startRound(this.numDigits);
      }
    }
  },

  render(g) {
    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("CHIMP TEST", 6, 6, 3);
    g.text("DIGITS:" + this.numDigits, 86, 6, 3);
    // Strikes (dots)
    g.text("STRIKES:", 148, 6, 2);
    for (var s = 0; s < this.maxStrikes; s++) {
      g.disc(198 + s * 10, 10, 3, s < this.strikes ? 3 : 1);
    }

    // Grid rendering (ox: 25, oy: 40, sz: 38)
    var ox = 25, oy = 36, sz = 38;

    // Draw background grid dots
    for (var gy = 0; gy < this.gridH; gy++) {
      for (var gx = 0; gx < this.gridW; gx++) {
        var bx = ox + gx * sz;
        var by = oy + gy * sz;
        g.px(bx + sz / 2, by + sz / 2, 1);
      }
    }

    // Draw Active Tiles
    for (var i = 0; i < this.tiles.length; i++) {
      var t = this.tiles[i];
      if (t.solved) continue; // Vanishes once correctly clicked

      var bx = ox + t.gx * sz + 2;
      var by = oy + t.gy * sz + 2;
      var tw = sz - 4;

      if (!this.hidden) {
        // Memorize phase: show number clearly
        g.rect(bx, by, tw, tw, 1);
        g.box(bx, by, tw, tw, 3);
        g.textC("" + t.num, by + 12, 3);
      } else {
        // Recall phase: blank solid phosphor block!
        g.rect(bx, by, tw, tw, 2);
        g.box(bx, by, tw, tw, 3);
      }
    }

    // Draw Cursor Box
    var curBx = ox + this.cursorX * sz;
    var curBy = oy + this.cursorY * sz;
    g.box(curBx, curBy, sz, sz, 3);

    // Instructions on Bottom
    g.rect(0, 200, 240, 40, 0);
    g.line(0, 200, 240, 200, 2);
    if (!this.hidden) {
      g.textC("MEMORIZE LOCATIONS, TAP [ 1 ] TO BEGIN", 206, 2);
    } else {
      g.textC("RECALL: TAP REMAINING TILES IN ORDER", 206, 3);
    }
    g.textC("NEXT NEEDED: [ " + this.nextNeeded + " ]", 220, 2);

    // Overlays
    if (this.state === 'LEVEL_PASS') {
      g.rect(20, 60, 200, 100, 0);
      g.box(20, 60, 200, 100, 3);
      g.textC("ROUND PASSED!", 80, 3);
      g.textC("SEQUENCE COMPLETED: " + this.numDigits + " DIGITS", 102, 2);
      g.textC("NEXT LEVEL: " + (this.numDigits + 1) + " DIGITS", 120, 3);
    } else if (this.state === 'GAMEOVER') {
      g.rect(20, 50, 200, 120, 0);
      g.box(20, 50, 200, 120, 3);
      g.textC("TEST CONCLUDED", 68, 3);
      g.textC("MAX WORKING MEMORY: " + this.bestLevel + " DIGITS", 92, 2);
      g.textC(this.bestLevel >= 9 ? "CHIMP GENIUS (AYUMU GRADE)!" : "HUMAN AVERAGE: 7 DIGITS", 112, 3);
      g.textC("PRESS [A] TO RETEST", 140, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  }
};
