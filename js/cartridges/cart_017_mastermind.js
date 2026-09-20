// js/cartridges/cart_017_mastermind.js
// ============================================================================
// Cartridge #017: MASTERMIND
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 17. MASTERMIND
CARTS[17] = {
  id: 17,
  name: "MASTERMIND",
  genre: 1,
  scoreLabel: "SCORE",
  desc: "DECODE 4-PEG SECRET CODE IN 10 TRIES. D-PAD/TOUCH TO CYCLE 6 DISTINCT PEGS.",

  icon(g, x, y) {
    // Molded pegboard casing
    g.rect(x, y, 32, 32, 1);
    g.box(x, y, 32, 32, 2);
    g.line(x, y, x + 31, y, 3);
    g.line(x, y, x, y + 31, 3);
    g.line(x, y + 31, x + 31, y + 31, 0);
    g.line(x + 31, y, x + 31, y + 31, 0);

    // Top secret compartment shield
    g.rect(x + 3, y + 3, 26, 7, 0);
    g.box(x + 3, y + 3, 26, 7, 3);
    g.text("????", x + 5, y + 4, 3);

    // Row 1: 3 sample code pegs
    // Peg 1: Solid
    g.disc(x + 6, y + 15, 3, 3);
    // Peg 2: Donut
    g.disc(x + 13, y + 15, 3, 3);
    g.px(x + 13, y + 15, 0);
    // Peg 3: Cross
    g.disc(x + 20, y + 15, 3, 1);
    g.line(x + 18, y + 15, x + 22, y + 15, 3);
    g.line(x + 20, y + 13, x + 20, y + 17, 3);

    // Row 1 clue pins
    g.disc(x + 27, y + 13, 1, 3); // Bull
    g.circle(x + 27, y + 17, 1, 3); // Cow

    // Row 2: Empty sockets
    for (let c = 0; c < 3; c++) {
      g.circle(x + 6 + c * 7, y + 24, 2, 1);
      g.px(x + 6 + c * 7, y + 24, 0);
    }
    g.px(x + 27, y + 23, 0);
    g.px(x + 27, y + 26, 0);
  },

  init() {
    // Load persisted statistics
    if (typeof SAVE !== 'undefined') {
      this.bestScore = SAVE.getScore(this.id) || 0;
      const p = SAVE.getPersistent(this.id) || {};
      this.streak = p.streak || 0;
      this.bestStreak = p.bestStreak || 0;
      this.gamesWon = p.wins || 0;
      this.gamesPlayed = p.played || 0;
    } else {
      this.bestScore = 0;
      this.streak = 0;
      this.bestStreak = 0;
      this.gamesWon = 0;
      this.gamesPlayed = 0;
    }
    this.newRound();
  },

  newRound() {
    // Generate 4-peg secret code with values 1 to 6 (allowing duplicates)
    this.secret = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];
    this.guess = [1, 1, 1, 1];
    this.cursor = 0;
    this.history = [];
    this.won = false;
    this.over = false;
    this.score = 0;

    // Secret compartment slide animation
    this.shieldOpen = false;
    this.shieldOffset = 0;
    this.latchSoundPlayed = false;

    this.animTimer = 0;
    this.cursorBlink = 0;
  },

  // 100% mathematically precise two-pass Bulls and Cows evaluation
  evaluate(secret, guess) {
    let bulls = 0;
    let cows = 0;
    const secUsed = [false, false, false, false];
    const guessUsed = [false, false, false, false];

    // Pass 1: exact matches (Bulls: correct peg and correct position)
    for (let i = 0; i < 4; i++) {
      if (guess[i] === secret[i]) {
        bulls++;
        secUsed[i] = true;
        guessUsed[i] = true;
      }
    }

    // Pass 2: partial matches (Cows: correct peg, wrong position)
    for (let i = 0; i < 4; i++) {
      if (!guessUsed[i]) {
        for (let j = 0; j < 4; j++) {
          if (!secUsed[j] && guess[i] === secret[j]) {
            cows++;
            secUsed[j] = true;
            break;
          }
        }
      }
    }

    return { bulls, cows };
  },

  submitGuess() {
    if (this.won || this.over) return;
    const result = this.evaluate(this.secret, this.guess);
    this.history.push({
      guess: [...this.guess],
      bulls: result.bulls,
      cows: result.cows
    });

    if (result.bulls === 4) {
      // VICTORY!
      this.won = true;
      this.shieldOpen = true;
      const attempts = this.history.length;
      this.score = (11 - attempts) * 100 + this.streak * 25;
      this.streak++;
      if (this.streak > this.bestStreak) this.bestStreak = this.streak;
      this.gamesWon++;
      this.gamesPlayed++;
      if (this.score > this.bestScore) this.bestScore = this.score;

      if (typeof SAVE !== 'undefined') {
        SAVE.setScore(this.id, this.score);
        SAVE.setPersistent(this.id, {
          streak: this.streak,
          bestStreak: this.bestStreak,
          wins: this.gamesWon,
          played: this.gamesPlayed
        });
      }
      if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
    } else if (this.history.length >= 10) {
      // GAME OVER - 10 attempts exhausted
      this.over = true;
      this.shieldOpen = true;
      this.score = 0;
      this.streak = 0;
      this.gamesPlayed++;

      if (typeof SAVE !== 'undefined') {
        SAVE.setPersistent(this.id, {
          streak: 0,
          bestStreak: this.bestStreak,
          wins: this.gamesWon,
          played: this.gamesPlayed
        });
      }
      if (typeof APU !== 'undefined') APU.sfx('BOOM');
    } else {
      // Normal clue feedback sound
      if (typeof APU !== 'undefined') APU.sfx('HIT');
    }
  },

  update(dt) {
    this.animTimer += dt;
    this.cursorBlink = (this.cursorBlink + 1) & 31;

    // Mechanical shield slide animation
    if (this.shieldOpen) {
      if (!this.latchSoundPlayed) {
        this.latchSoundPlayed = true;
        if (typeof APU !== 'undefined') APU.sfx('INSERT');
      }
      if (this.shieldOffset < 88) {
        this.shieldOffset += dt * 140;
        if (this.shieldOffset > 88) this.shieldOffset = 88;
      }
    }

    // Handle Mobile Touch and Canvas Clicks
    if (typeof PAD !== 'undefined' && PAD.tapPos) {
      const { x, y } = PAD.tapPos;

      if (this.won || this.over) {
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        this.newRound();
        return;
      }

      // 1. Tapping any of the 4 active guess slots (cy = 180, x in 14..116)
      for (let c = 0; c < 4; c++) {
        const cx = 26 + c * 26;
        if (x >= cx - 12 && x <= cx + 12 && y >= 168 && y <= 192) {
          if (this.cursor === c) {
            this.guess[c] = (this.guess[c] % 6) + 1;
          } else {
            this.cursor = c;
          }
          if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
          return;
        }
      }

      // 2. Tapping the [SUBMIT GUESS] touch button
      if (x >= 120 && x <= 240 && y >= 168 && y <= 192) {
        this.submitGuess();
        return;
      }

      // 3. Tapping any of the 6 quick-palette peg selectors (py = 207)
      for (let p = 1; p <= 6; p++) {
        const pcx = 26 + (p - 1) * 38;
        if (x >= pcx - 16 && x <= pcx + 16 && y >= 196 && y <= 220) {
          this.guess[this.cursor] = p;
          this.cursor = (this.cursor + 1) % 4;
          if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
          return;
        }
      }

      // 4. Tapping slots in the current row on the pegboard
      const curRow = this.history.length;
      if (curRow < 10) {
        const ry = 42 + curRow * 12;
        if (y >= ry - 6 && y <= ry + 6) {
          for (let c = 0; c < 4; c++) {
            const px = 35 + c * 16;
            if (x >= px - 7 && x <= px + 7) {
              if (this.cursor === c) {
                this.guess[c] = (this.guess[c] % 6) + 1;
              } else {
                this.cursor = c;
              }
              if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
              return;
            }
          }
        }
      }
    }

    // Handle Physical D-pad / Keyboard Controls
    if (typeof PAD === 'undefined') return;

    if (this.won || this.over) {
      if (PAD.hit('a') || PAD.hit('start')) {
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        this.newRound();
      }
      return;
    }

    // Left / Right: change slot cursor
    if (PAD.hit('left') || PAD.swipe === 'left') {
      this.cursor = (this.cursor + 3) % 4;
      if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
    } else if (PAD.hit('right') || PAD.swipe === 'right') {
      this.cursor = (this.cursor + 1) % 4;
      if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
    }

    // Up / Down: cycle peg color
    if (PAD.hit('up') || PAD.swipe === 'up') {
      this.guess[this.cursor] = (this.guess[this.cursor] % 6) + 1;
      if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
    } else if (PAD.hit('down') || PAD.swipe === 'down') {
      this.guess[this.cursor] = this.guess[this.cursor] === 1 ? 6 : this.guess[this.cursor] - 1;
      if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
    }

    // B button: cycle peg backwards
    if (PAD.hit('b')) {
      this.guess[this.cursor] = this.guess[this.cursor] === 1 ? 6 : this.guess[this.cursor] - 1;
      if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
    }

    // A or Start button: Submit guess
    if (PAD.hit('a') || PAD.hit('start')) {
      this.submitGuess();
    }
  },

  // Renders 6 distinct visual peg patterns using the CRT phosphor palette
  drawPeg(g, cx, cy, r, val) {
    cx = cx | 0; cy = cy | 0; r = r | 0;
    switch (val) {
      case 1: // Solid Bright Phosphor
        g.disc(cx, cy, r, 3);
        g.circle(cx, cy, r, 2);
        g.px(cx - Math.max(1, Math.floor(r / 2)), cy - Math.max(1, Math.floor(r / 2)), 3);
        break;

      case 2: // Donut / Ring (glowing outer rim with recessed CRT dark center hole)
        g.disc(cx, cy, r, 3);
        g.disc(cx, cy, Math.max(1, r - 2), 0);
        g.circle(cx, cy, Math.max(1, r - 2), 1);
        break;

      case 3: // Cross / Plus (+) (dark base disc with sharp bright crossbars)
        g.disc(cx, cy, r, 1);
        g.circle(cx, cy, r, 2);
        g.line(cx - r + 1, cy, cx + r - 1, cy, 3);
        g.line(cx, cy - r + 1, cx, cy + r - 1, 3);
        if (r >= 6) {
          g.line(cx - r + 2, cy - 1, cx + r - 2, cy - 1, 3);
          g.line(cx - 1, cy - r + 2, cx - 1, cy + r - 2, 3);
        }
        break;

      case 4: // Dithered / Checkerboard Texture (50% mesh phosphor)
        g.circle(cx, cy, r, 3);
        for (let dy = -r + 1; dy < r; dy++) {
          const dxMax = Math.floor(Math.sqrt(r * r - dy * dy));
          for (let dx = -dxMax + 1; dx < dxMax; dx++) {
            const col = ((cx + dx + cy + dy) & 1) ? 3 : 1;
            g.px(cx + dx, cy + dy, col);
          }
        }
        break;

      case 5: // Diamond (sharp bright rhombus/diamond inside medium ring)
        g.disc(cx, cy, r, 1);
        g.circle(cx, cy, r, 2);
        const dr = Math.max(1, r - 1);
        for (let dy = -dr; dy <= dr; dy++) {
          const span = dr - Math.abs(dy);
          g.line(cx - span, cy + dy, cx + span, cy + dy, 3);
        }
        break;

      case 6: // Concentric Target / Bullseye (bright outer ring, black gap, bright center)
        g.circle(cx, cy, r, 3);
        if (r > 3) {
          g.circle(cx, cy, r - 1, 0);
          g.disc(cx, cy, Math.max(1, r - 3), 3);
        } else {
          g.px(cx, cy, 3);
        }
        break;

      default:
        g.disc(cx, cy, r, 1);
        break;
    }
  },

  // Authentic 2x2 Clue Pin Cluster:
  // - BULL: Solid bright peg (exact match: correct color & position)
  // - COW: Hollow ring peg (partial match: correct color, wrong position)
  // - EMPTY: Recessed circular pin socket
  drawCluePeg(g, cx, cy, type) {
    cx = cx | 0; cy = cy | 0;
    if (type === 'BULL') {
      g.disc(cx, cy, 2, 3);
      g.circle(cx, cy, 2, 2);
      g.px(cx, cy, 3);
    } else if (type === 'COW') {
      g.circle(cx, cy, 2, 3);
      g.px(cx, cy, 0);
    } else {
      g.disc(cx, cy, 1, 0);
      g.px(cx - 1, cy - 1, 1);
      g.px(cx + 1, cy + 1, 2);
    }
  },

  // Recessed circular peg socket
  drawEmptySocket(g, cx, cy, r) {
    cx = cx | 0; cy = cy | 0; r = r | 0;
    g.circle(cx, cy, r, 1);
    g.disc(cx, cy, Math.max(1, r - 1), 0);
    g.px(cx, cy + r - 1, 1);
  },

  render(g) {
    g.clear(0);

    // Top Header
    g.text("MASTERMIND", 10, 4, 3);
    g.text("LOGIC", 74, 4, 1);
    g.textR("BEST:" + this.bestScore, 246, 4, 2);
    g.line(10, 13, 246, 13, 1);

    // ========================================================================
    // LEFT PANEL: AUTHENTIC RETRO PEGBOARD CASING (10 TO 156)
    // ========================================================================
    const bx = 10, by = 16, bw = 146, bh = 146;
    g.rect(bx, by, bw, bh, 0);
    g.box(bx, by, bw, bh, 2);
    g.line(bx + 1, by + 1, bx + bw - 2, by + 1, 1);
    g.line(bx + 1, by + 1, bx + 1, by + bh - 2, 1);

    // Top Secret Code Compartment & Mystery Sliding Shield
    const sx = 16, sy = 20, sw = 86, sh = 16;
    g.rect(sx, sy, sw, sh, 0);
    g.box(sx - 1, sy - 1, sw + 2, sh + 2, 1);
    g.text("SECRET", 108, 25, 2);

    // 4 Secret Code Pegs inside compartment
    for (let c = 0; c < 4; c++) {
      const px = sx + 10 + c * 18;
      const py = sy + 8;
      this.drawEmptySocket(g, px, py, 4);
      this.drawPeg(g, px, py, 4, this.secret[c]);
    }

    // Mechanical Sliding Shield / Coverplate
    const offset = Math.min(sw, Math.floor(this.shieldOffset));
    const coverW = sw - offset;
    if (coverW > 0) {
      const coverX = sx + offset;
      g.rect(coverX, sy, coverW, sh, 1);
      g.box(coverX, sy, coverW, sh, 3);
      g.line(coverX + 1, sy + 1, coverX + coverW - 2, sy + 1, 2);
      g.line(coverX + 1, sy + sh - 2, coverX + coverW - 2, sy + sh - 2, 0);

      // Mechanical Grip Ridges on slider edge
      if (coverW > 10) {
        g.line(coverX + coverW - 4, sy + 3, coverX + coverW - 4, sy + sh - 4, 0);
        g.line(coverX + coverW - 3, sy + 3, coverX + coverW - 3, sy + sh - 4, 2);
      }

      // Mystery label '????'
      if (coverW >= 54) {
        g.text("? ? ? ?", coverX + Math.floor((coverW - 36) / 2), sy + 5, 3);
      } else if (coverW >= 18) {
        g.text("???", coverX + 2, sy + 5, 3);
      }
    }

    // Divider below secret compartment
    g.line(12, 38, 154, 38, 1);

    // 10 Guess Rows
    for (let r = 0; r < 10; r++) {
      const ry = 42 + r * 12;

      // Row Number
      const isCur = (r === this.history.length && !this.won && !this.over);
      const rowNumStr = r < 9 ? "0" + (r + 1) : "" + (r + 1);
      g.text(rowNumStr, 13, ry - 3, isCur ? 3 : 1);

      // 4 Code Peg Sockets
      for (let c = 0; c < 4; c++) {
        const px = 35 + c * 16;
        if (r < this.history.length) {
          this.drawEmptySocket(g, px, ry, 4);
          this.drawPeg(g, px, ry, 4, this.history[r].guess[c]);
        } else if (isCur) {
          this.drawEmptySocket(g, px, ry, 4);
          this.drawPeg(g, px, ry, 4, this.guess[c]);
          if (c === this.cursor) {
            g.circle(px, ry, 5, (this.cursorBlink & 8) ? 3 : 2);
          }
        } else {
          this.drawEmptySocket(g, px, ry, 4);
        }
      }

      // Groove divider before clue pins
      g.line(97, ry - 4, 97, ry + 4, 1);

      // 2x2 Clue Peg Cluster
      const clueCoords = [
        [105, ry - 2], [113, ry - 2],
        [105, ry + 3], [113, ry + 3]
      ];

      for (let k = 0; k < 4; k++) {
        if (r < this.history.length) {
          const h = this.history[r];
          let type = 'EMPTY';
          if (k < h.bulls) type = 'BULL';
          else if (k < h.bulls + h.cows) type = 'COW';
          this.drawCluePeg(g, clueCoords[k][0], clueCoords[k][1], type);
        } else {
          this.drawCluePeg(g, clueCoords[k][0], clueCoords[k][1], 'EMPTY');
        }
      }

      // Active row pointer
      if (isCur) {
        g.text("◀", 121, ry - 3, 3);
      }
    }

    // ========================================================================
    // RIGHT PANEL: DECODER INTEL & STATUS
    // ========================================================================
    const px = 160, py = 16, pw = 86, ph = 146;
    g.rect(px, py, pw, ph, 0);
    g.box(px, py, pw, ph, 2);
    g.text("INTEL", px + 26, 20, 3);
    g.line(px + 4, 28, px + pw - 5, 28, 1);

    // Attempt count
    g.text("ATTEMPT", px + 8, 33, 2);
    const tryStr = (this.won || this.over)
      ? (this.history.length + "/10")
      : (Math.min(10, this.history.length + 1) + "/10");
    g.text(tryStr, px + 52, 33, 3);

    // Clue Key Legend
    g.text("CLUE KEY:", px + 8, 46, 2);
    this.drawCluePeg(g, px + 12, 58, 'BULL');
    g.text("EXACT", px + 22, 56, 3);
    this.drawCluePeg(g, px + 12, 70, 'COW');
    g.text("COLOR", px + 22, 68, 2);
    g.line(px + 4, 80, px + pw - 5, 80, 1);

    // Score & Streak
    g.text("SCORE", px + 8, 86, 2);
    g.text("" + this.score, px + 8, 94, 3);

    g.text("STREAK", px + 8, 108, 2);
    g.text("" + this.streak + " (HI " + this.bestStreak + ")", px + 8, 116, 3);

    g.text("RECORD", px + 8, 130, 2);
    g.text(this.gamesWon + "W / " + this.gamesPlayed + "P", px + 8, 138, 2);

    // ========================================================================
    // BOTTOM PANEL: ACTIVE GUESS SLOTS, QUICK-PALETTE & TOUCH BUTTONS
    // ========================================================================
    const cpx = 10, cpy = 166, cpw = 236, cph = 70;
    g.rect(cpx, cpy, cpw, cph, 0);
    g.box(cpx, cpy, cpw, cph, 2);

    if (!this.won && !this.over) {
      // 4 Large Interactive Input Slots
      const cy = 180;
      for (let c = 0; c < 4; c++) {
        const scx = 26 + c * 26;
        this.drawEmptySocket(g, scx, cy, 7);
        this.drawPeg(g, scx, cy, 6, this.guess[c]);
        if (c === this.cursor) {
          g.circle(scx, cy, 8, (this.cursorBlink & 8) ? 3 : 2);
          g.text("▲", scx - 2, cy - 11, 3);
          g.text("▼", scx - 2, cy + 7, 3);
        }
      }

      // [SUBMIT GUESS] Button
      const btnX = 120, btnY = 171, btnW = 120, btnH = 18;
      g.rect(btnX, btnY, btnW, btnH, 2);
      g.box(btnX, btnY, btnW, btnH, 3);
      g.line(btnX + 1, btnY + 1, btnX + btnW - 2, btnY + 1, 3);
      g.line(btnX + 1, btnY + btnH - 1, btnX + btnW - 2, btnY + btnH - 1, 1);
      g.text("[A] SUBMIT GUESS", btnX + 16, btnY + 6, 3);

      // Quick 6-Peg Palette Bar (Fast Touch Selection)
      const py = 207;
      for (let p = 1; p <= 6; p++) {
        const pcx = 26 + (p - 1) * 38;
        const isSelected = (this.guess[this.cursor] === p);
        g.rect(pcx - 14, py - 9, 28, 18, 1);
        g.box(pcx - 14, py - 9, 28, 18, isSelected ? 3 : 2);
        this.drawPeg(g, pcx - 4, py, 5, p);
        g.text("" + p, pcx + 4, py - 3, 3);
      }

      // Footer Help
      g.text("D-PAD:AIM/CYCLE  [A]:SUBMIT  TOUCH:FAST-TAP", 14, 227, 1);
    } else if (this.won) {
      // Victory Modal Overlay
      g.rect(14, 168, 228, 66, 0);
      g.box(14, 168, 228, 66, 3);
      g.dither(16, 170, 224, 62, 0, 1);
      g.textC("★ CODE CRACKED! VICTORY ★", 175, 3);
      g.textC("SOLVED IN " + this.history.length + " TRIES! +" + this.score + " PTS", 187, 3);
      g.textC("STREAK: " + this.streak + "  |  RECORD: " + this.bestStreak, 199, 2);

      // [PLAY AGAIN] Touch Button
      g.rect(60, 211, 136, 17, 2);
      g.box(60, 211, 136, 17, 3);
      g.textC("[A] PLAY AGAIN", 217, 3);
    } else if (this.over) {
      // Game Over Modal Overlay
      g.rect(14, 168, 228, 66, 0);
      g.box(14, 168, 228, 66, 3);
      g.dither(16, 170, 224, 62, 0, 1);
      g.textC("OUT OF TRIES! CODE REVEALED", 175, 3);
      g.textC("SECRET CODE IS DISPLAYED ABOVE!", 187, 2);
      g.textC("STREAK RESET TO 0. TOTAL WINS: " + this.gamesWon, 199, 1);

      // [RETRY GAME] Touch Button
      g.rect(60, 211, 136, 17, 2);
      g.box(60, 211, 136, 17, 3);
      g.textC("[A] RETRY GAME", 217, 3);
    }
  }
};
