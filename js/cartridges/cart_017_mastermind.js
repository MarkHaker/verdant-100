// js/cartridges/cart_017_mastermind.js
// ============================================================================
// Cartridge #017: MASTERMIND
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 17. MASTERMIND
CARTS[17] = {
  id: 17, name: "MASTERMIND", genre: 1, scoreLabel: "ROUNDS",
  desc: "DEDUCE 4-COLOR SECRET CODE IN 10 ATTEMPTS VIA BULLS & COWS CLUES.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 8, y + 16, 3, 3);
    g.disc(x + 16, y + 16, 3, 2);
    g.disc(x + 24, y + 16, 3, 1);
  },
  init() {
    this.secret = [Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 4) + 1, Math.floor(Math.random() * 4) + 1];
    this.guess = [1, 1, 1, 1];
    this.cursor = 0;
    this.history = [];
    this.won = false;
    this.over = false;
  },
  update(dt) {
    if (this.won || this.over) {
      if (PAD.hit('a') || PAD.hit('start')) this.init();
      return;
    }
    if (PAD.hit('left')) this.cursor = Math.max(0, this.cursor - 1);
    if (PAD.hit('right')) this.cursor = Math.min(3, this.cursor + 1);
    if (PAD.hit('up')) this.guess[this.cursor] = (this.guess[this.cursor] % 4) + 1;
    if (PAD.hit('down')) this.guess[this.cursor] = ((this.guess[this.cursor] + 2) % 4) + 1;

    if (PAD.hit('a')) {
      let bulls = 0, cows = 0;
      const secUsed = [false, false, false, false];
      const guessUsed = [false, false, false, false];
      // Pass 1: exact bulls
      for (let i = 0; i < 4; i++) {
        if (this.guess[i] === this.secret[i]) {
          bulls++;
          secUsed[i] = true;
          guessUsed[i] = true;
        }
      }
      // Pass 2: cows
      for (let i = 0; i < 4; i++) {
        if (!guessUsed[i]) {
          for (let j = 0; j < 4; j++) {
            if (!secUsed[j] && this.guess[i] === this.secret[j]) {
              cows++;
              secUsed[j] = true;
              break;
            }
          }
        }
      }
      this.history.push({ guess: [...this.guess], bulls, cows });
      APU.sfx('HIT');
      if (bulls === 4) {
        this.won = true;
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, 11 - this.history.length);
      } else if (this.history.length >= 10) {
        this.over = true;
        APU.sfx('BOOM');
        SAVE.setScore(this.id, 0);
      }
    }
  },
  render(g) {
    g.clear(0);
    g.text("MASTERMIND CODE", 16, 10, 3);
    g.textR("TRY: " + Math.min(10, this.history.length + 1) + "/10", 240, 10, 2);

    let y = 24;
    for (let h of this.history) {
      for (let c = 0; c < 4; c++) {
        const col = h.guess[c] === 1 ? 1 : (h.guess[c] === 2 ? 2 : 3);
        g.disc(40 + c * 16, y + 4, 4, col);
      }
      g.text("B:" + h.bulls + " C:" + h.cows, 116, y, 3);
      y += 15;
    }

    // Current Guess input
    if (!this.won && !this.over) {
      g.rect(30, 196, 100, 24, 1);
      for (let c = 0; c < 4; c++) {
        const col = this.guess[c] === 1 ? 1 : (this.guess[c] === 2 ? 2 : 3);
        g.disc(44 + c * 20, 208, 6, col);
        if (c === this.cursor) g.circle(44 + c * 20, 208, 8, 3);
      }
      g.text("[A] SUBMIT", 150, 204, 3);
    }

    if (this.won) {
      g.dither(50, 192, 156, 36, 0, 1);
      g.box(50, 192, 156, 36, 3);
      g.textC("CODE CRACKED! VICTORY", 198, 3);
      g.textC("[A] PLAY AGAIN", 212, 2);
    } else if (this.over) {
      g.dither(40, 186, 176, 46, 0, 1);
      g.box(40, 186, 176, 46, 3);
      g.textC("OUT OF TRIES! CODE WAS:", 192, 3);
      for (let c = 0; c < 4; c++) {
        const col = this.secret[c] === 1 ? 1 : (this.secret[c] === 2 ? 2 : 3);
        g.disc(104 + c * 16, 208, 5, col);
      }
      g.textC("[A] TO RETRY", 218, 2);
    }
  }
};
