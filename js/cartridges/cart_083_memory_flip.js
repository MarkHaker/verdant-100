// js/cartridges/cart_083_memory_flip.js
// ============================================================================
// Cartridge #083: MEMORY FLIP
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[83] = {
  id: 83,
  name: "MEMORY FLIP",
  genre: 8,
  scoreLabel: "TURNS",
  desc: "CONCENTRATION: FLIP PAIRS OF RUNIC CARDS AND REMEMBER THEIR POSITIONS TO CLEAR THE BOARD!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Two cards side by side
    g.box(x + 5, y + 6, 10, 18, 3);
    g.text("★", x + 7, y + 11, 3);
    g.box(x + 17, y + 6, 10, 18, 2);
    g.line(x + 19, y + 9, x + 25, y + 21, 1);
  },

  init() {
    this.cols = 4;
    this.rows = 4;
    this.totalCards = 16;
    this.cards = [];
    this.matched = [];
    this.flipProgress = []; // 0 to 1 for card flip animation

    this.firstCard = -1;
    this.secondCard = -1;
    this.waitTimer = 0;

    this.cx = 0;
    this.cy = 0;
    this.turns = 0;
    this.pairsLeft = 8;
    this.streak = 0;
    this.timer = 0;
    this.score = 0;

    this.state = 'PLAY'; // 'PLAY', 'WAIT_MISMATCH', 'VICTORY'
    this.stateTimer = 0;

    this.symbols = ["★", "◆", "▲", "●", "♠", "♥", "⚑", "✦"];

    this.newGame();
  },

  newGame() {
    var deck = [];
    for (var s = 0; s < 8; s++) {
      deck.push(s, s);
    }
    // Fisher-Yates shuffle
    for (var i = deck.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }

    this.cards = deck;
    this.matched = [];
    this.flipProgress = [];
    for (var k = 0; k < 16; k++) {
      this.matched[k] = false;
      this.flipProgress[k] = 0;
    }

    this.firstCard = -1;
    this.secondCard = -1;
    this.waitTimer = 0;
    this.turns = 0;
    this.pairsLeft = 8;
    this.streak = 0;
    this.timer = 0;
    this.score = 0;
    this.state = 'PLAY';
    this.stateTimer = 0;
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;

    if (this.state === 'VICTORY') {
      if (this.stateTimer > 2.5 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.newGame();
      }
      return;
    }

    this.timer += dt;

    // Flip progress animation
    for (var i = 0; i < 16; i++) {
      var isFaceUp = this.matched[i] || (i === this.firstCard) || (i === this.secondCard);
      var targetProg = isFaceUp ? 1.0 : 0.0;
      if (this.flipProgress[i] < targetProg) {
        this.flipProgress[i] = Math.min(targetProg, this.flipProgress[i] + dt * 6);
      } else if (this.flipProgress[i] > targetProg) {
        this.flipProgress[i] = Math.max(targetProg, this.flipProgress[i] - dt * 6);
      }
    }

    // Wait timer for mismatch
    if (this.state === 'WAIT_MISMATCH') {
      this.waitTimer -= dt;
      if (this.waitTimer <= 0 || PAD.hit('a') || TOUCH.down) {
        this.firstCard = -1;
        this.secondCard = -1;
        this.state = 'PLAY';
      }
      return;
    }

    // Cursor navigation
    if (PAD.hit('left')) { this.cx = (this.cx - 1 + 4) % 4; APU.sfx('SELECT'); }
    if (PAD.hit('right')) { this.cx = (this.cx + 1) % 4; APU.sfx('SELECT'); }
    if (PAD.hit('up')) { this.cy = (this.cy - 1 + 4) % 4; APU.sfx('SELECT'); }
    if (PAD.hit('down')) { this.cy = (this.cy + 1) % 4; APU.sfx('SELECT'); }

    // [A] Flip Selected Card
    if (PAD.hit('a')) {
      var curIdx = this.cy * 4 + this.cx;
      this.flipCard(curIdx);
    }

    // Touch controls
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      var ox = 26, oy = 32, cw = 44, ch = 44, gap = 4;
      for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 4; c++) {
          var bx = ox + c * (cw + gap);
          var by = oy + r * (ch + gap);
          if (tx >= bx && tx <= bx + cw && ty >= by && ty <= by + ch) {
            this.cx = c;
            this.cy = r;
            var idx = r * 4 + c;
            this.flipCard(idx);
            break;
          }
        }
      }
    }
  },

  flipCard(idx) {
    if (this.matched[idx]) return;
    if (idx === this.firstCard) return; // Already flipped

    if (this.firstCard === -1) {
      // First card flipped
      this.firstCard = idx;
      APU.sfx('TICK');
    } else if (this.secondCard === -1) {
      // Second card flipped
      this.secondCard = idx;
      this.turns++;

      if (this.cards[this.firstCard] === this.cards[this.secondCard]) {
        // MATCH!
        this.matched[this.firstCard] = true;
        this.matched[this.secondCard] = true;
        this.pairsLeft--;
        this.streak++;
        this.score += 200 + this.streak * 50;

        APU.sfx('COIN');
        this.firstCard = -1;
        this.secondCard = -1;

        if (this.pairsLeft === 0) {
          // Cleared entire board!
          this.state = 'VICTORY';
          this.stateTimer = 0;
          var finalScore = Math.max(100, Math.floor(this.score + Math.max(0, 3000 - this.turns * 60 - this.timer * 15)));
          SAVE.setScore(this.id, finalScore);
          APU.sfx('FANFARE');
        }
      } else {
        // MISMATCH
        this.streak = 0;
        this.state = 'WAIT_MISMATCH';
        this.waitTimer = 0.85;
        APU.sfx('HIT');
      }
    }
  },

  render(g) {
    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("MEMORY FLIP", 6, 6, 3);
    g.text("TURNS:" + this.turns, 92, 6, 2);
    g.text("LEFT:" + this.pairsLeft, 148, 6, 2);
    g.textR("SCR:" + this.score, 234, 6, 3);

    // Grid (4x4)
    var ox = 26, oy = 28, cw = 44, ch = 44, gap = 4;

    for (var r = 0; r < 4; r++) {
      for (var c = 0; c < 4; c++) {
        var idx = r * 4 + c;
        var bx = ox + c * (cw + gap);
        var by = oy + r * (ch + gap);
        var isCursor = (c === this.cx && r === this.cy);
        var isMatched = this.matched[idx];
        var isFlipped = (idx === this.firstCard) || (idx === this.secondCard) || isMatched;

        var prog = this.flipProgress[idx];
        // Squeeze width for flip animation
        var scaleX = Math.abs(prog - 0.5) * 2; // 1 -> 0 -> 1
        var renderW = Math.max(4, Math.floor(cw * scaleX));
        var renderX = bx + Math.floor((cw - renderW) / 2);

        if (isMatched) {
          // Solved: dimmed box with icon
          g.box(renderX, by, renderW, ch, 1);
          if (prog > 0.5) {
            var sym = this.symbols[this.cards[idx]];
            g.text(sym, bx + 18, by + 18, 2);
          }
        } else if (prog > 0.5) {
          // Face up
          g.rect(renderX, by, renderW, ch, 1);
          g.box(renderX, by, renderW, ch, isCursor ? 3 : 2);
          var sym = this.symbols[this.cards[idx]];
          g.text(sym, bx + 18, by + 18, 3);
        } else {
          // Face down: card back pattern
          g.rect(renderX, by, renderW, ch, 0);
          g.box(renderX, by, renderW, ch, isCursor ? 3 : 2);
          // Diamond pattern on card back
          g.line(bx + 12, by + 22, bx + 22, by + 12, 1);
          g.line(bx + 22, by + 12, bx + 32, by + 22, 1);
          g.line(bx + 32, by + 22, bx + 22, by + 32, 1);
          g.line(bx + 22, by + 32, bx + 12, by + 22, 1);
        }

        if (isCursor) {
          g.box(bx - 1, by - 1, cw + 2, ch + 2, 3);
        }
      }
    }

    // Bottom Help Banner
    g.rect(0, 226, 240, 14, 0);
    g.line(0, 226, 240, 226, 2);
    g.text("D-PAD: MOVE  [A]: FLIP CARD", 6, 229, 2);
    var mins = Math.floor(this.timer / 60);
    var secs = Math.floor(this.timer % 60);
    g.textR(mins + ":" + (secs < 10 ? "0" : "") + secs, 234, 229, 3);

    // Victory Screen Overlay
    if (this.state === 'VICTORY') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("BOARD CLEARED!", 70, 3);
      g.textC("TURNS TAKEN: " + this.turns, 95, 2);
      g.textC("TIME: " + mins + ":" + (secs < 10 ? "0" : "") + secs, 115, 2);
      g.textC("FINAL SCORE: " + this.score, 135, 3);
      g.textC("PRESS [A] TO PLAY AGAIN", 158, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  }
};
