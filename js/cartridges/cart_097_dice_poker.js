// js/cartridges/cart_097_dice_poker.js
// ============================================================================
// Cartridge #097: DICE POKER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[97] = {
  id: 97,
  name: "DICE POKER",
  genre: 9,
  scoreLabel: "GOLD",
  desc: "TAVERN DICE POKER: ROLL 5 DICE, HOLD STRATEGIC PIPS, AND BEST THE INNKEEPER AT POKER COMBOS!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // 3D Die with 5 pips
    g.box(x + 6, y + 6, 20, 20, 3);
    g.disc(x + 11, y + 11, 1, 3);
    g.disc(x + 21, y + 11, 1, 3);
    g.disc(x + 16, y + 16, 1, 3);
    g.disc(x + 11, y + 21, 1, 3);
    g.disc(x + 21, y + 21, 1, 3);
  },

  init() {
    this.gold = 100;
    this.bet = 20;
    this.round = 1;
    this.totalRounds = 5;

    this.playerDice = [1, 2, 3, 4, 5];
    this.playerHold = [false, false, false, false, false];
    this.aiDice = [1, 1, 2, 2, 3];
    this.aiHold = [false, false, false, false, false];

    this.rollsLeft = 2; // Initial roll + 2 rerolls
    this.cursorDie = 0;
    this.state = 'START'; // 'START', 'ROLLING', 'PLAYER_TURN', 'AI_TURN', 'SHOWDOWN', 'MATCH_OVER'
    this.stateTimer = 0;

    this.rollAnimation = 0;
    this.playerHandName = "";
    this.aiHandName = "";
    this.resultBanner = "";
  },

  startRound() {
    this.rollsLeft = 2;
    this.playerHold = [false, false, false, false, false];
    this.aiHold = [false, false, false, false, false];

    // Initial roll for both
    this.rollUnheld(this.playerDice, this.playerHold);
    this.rollUnheld(this.aiDice, this.aiHold);

    this.evaluateHands();
    this.state = 'PLAYER_TURN';
    this.stateTimer = 0;
  },

  rollUnheld(dice, hold) {
    for (var i = 0; i < 5; i++) {
      if (!hold[i]) {
        dice[i] = Math.floor(Math.random() * 6) + 1;
      }
    }
  },

  evaluateHand(dice) {
    var counts = [0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < 5; i++) counts[dice[i]]++;

    var pairs = 0;
    var three = 0;
    var four = 0;
    var five = 0;
    for (var v = 1; v <= 6; v++) {
      if (counts[v] === 5) five = v;
      else if (counts[v] === 4) four = v;
      else if (counts[v] === 3) three = v;
      else if (counts[v] === 2) pairs++;
    }

    // Straight checks
    var sorted = dice.slice().sort(function(a, b) { return a - b; });
    var isLargeStraight = (sorted.join('') === '12345' || sorted.join('') === '23456');

    if (five > 0) return { rank: 8, name: "FIVE OF A KIND!", scoreVal: 800 + five };
    if (four > 0) return { rank: 7, name: "FOUR OF A KIND", scoreVal: 700 + four };
    if (three > 0 && pairs === 1) return { rank: 6, name: "FULL HOUSE", scoreVal: 600 + three };
    if (isLargeStraight) return { rank: 5, name: "LARGE STRAIGHT", scoreVal: 500 };
    if (three > 0) return { rank: 4, name: "THREE OF A KIND", scoreVal: 400 + three };
    if (pairs === 2) return { rank: 3, name: "TWO PAIRS", scoreVal: 300 };
    if (pairs === 1) return { rank: 2, name: "ONE PAIR", scoreVal: 200 };
    return { rank: 1, name: "HIGH DIE (" + Math.max.apply(null, dice) + ")", scoreVal: 100 };
  },

  evaluateHands() {
    var ph = this.evaluateHand(this.playerDice);
    this.playerHandName = ph.name;
    var ah = this.evaluateHand(this.aiDice);
    this.aiHandName = ah.name;
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;

    if (this.state === 'START') {
      if (PAD.hit('a') || TOUCH.down) {
        APU.sfx('CONFIRM');
        this.startRound();
      }
      return;
    }

    if (this.state === 'SHOWDOWN') {
      if (this.stateTimer > 2.2 || PAD.hit('a') || TOUCH.down) {
        if (this.round < this.totalRounds && this.gold >= this.bet) {
          this.round++;
          this.startRound();
        } else {
          this.state = 'MATCH_OVER';
          this.stateTimer = 0;
          SAVE.setScore(this.id, this.gold);
          APU.sfx(this.gold >= 100 ? 'FANFARE' : 'ERROR');
        }
      }
      return;
    }

    if (this.state === 'MATCH_OVER') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    // Player Turn
    if (this.state === 'PLAYER_TURN') {
      // D-pad die selection
      if (PAD.hit('left')) { this.cursorDie = (this.cursorDie - 1 + 5) % 5; APU.sfx('SELECT'); }
      if (PAD.hit('right')) { this.cursorDie = (this.cursorDie + 1) % 5; APU.sfx('SELECT'); }

      // [A] Toggle HOLD on current die
      if (PAD.hit('a')) {
        this.playerHold[this.cursorDie] = !this.playerHold[this.cursorDie];
        APU.sfx('TICK');
      }

      // [B] Roll unheld dice
      if (PAD.hit('b')) {
        this.doPlayerReroll();
      }

      // Touch controls: tap on player dice
      if (TOUCH.down) {
        var tx = TOUCH.x, ty = TOUCH.y;
        // Player dice y: 140 to 180
        if (ty >= 135 && ty <= 185) {
          for (var i = 0; i < 5; i++) {
            var dx = 18 + i * 42;
            if (tx >= dx && tx <= dx + 36) {
              this.cursorDie = i;
              this.playerHold[i] = !this.playerHold[i];
              APU.sfx('TICK');
              break;
            }
          }
        }
        // Tap Roll button bottom right
        if (tx >= 140 && ty >= 200) {
          this.doPlayerReroll();
        }
      }
    } else if (this.state === 'AI_TURN') {
      if (this.stateTimer > 1.2) {
        this.executeAiTurn();
      }
    }
  },

  doPlayerReroll() {
    if (this.rollsLeft > 0) {
      this.rollsLeft--;
      this.rollUnheld(this.playerDice, this.playerHold);
      this.evaluateHands();
      APU.sfx('COIN');

      if (this.rollsLeft === 0) {
        // Pass to AI turn
        this.state = 'AI_TURN';
        this.stateTimer = 0;
      }
    } else {
      // Showdown directly
      this.state = 'AI_TURN';
      this.stateTimer = 0;
    }
  },

  executeAiTurn() {
    // Basic Tavern AI: hold pairs, three of a kind, or straights
    var counts = [0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < 5; i++) counts[this.aiDice[i]]++;

    for (var i = 0; i < 5; i++) {
      var val = this.aiDice[i];
      if (counts[val] >= 2) this.aiHold[i] = true; // Keep pairs
    }

    // AI rolls unheld dice
    this.rollUnheld(this.aiDice, this.aiHold);
    this.evaluateHands();

    // Determine Winner
    var pScore = this.evaluateHand(this.playerDice).scoreVal;
    var aScore = this.evaluateHand(this.aiDice).scoreVal;

    if (pScore > aScore) {
      this.gold += this.bet;
      this.resultBanner = "YOU WIN! +" + this.bet + " GOLD";
      APU.sfx('COIN');
    } else if (pScore < aScore) {
      this.gold -= this.bet;
      this.resultBanner = "DEALER WINS! -" + this.bet + " GOLD";
      APU.sfx('HIT');
    } else {
      this.resultBanner = "DRAW! BET RETURNED";
      APU.sfx('TICK');
    }

    this.state = 'SHOWDOWN';
    this.stateTimer = 0;
    SAVE.setScore(this.id, this.gold);
  },

  render(g) {
    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("DICE POKER", 6, 6, 3);
    g.text("ROUND " + this.round + "/" + this.totalRounds, 92, 6, 2);
    g.textR("GOLD:" + this.gold, 234, 6, 3);

    // Dealer AI Area (Top Half)
    g.text("INNKEEPER'S CUP: " + this.aiHandName, 18, 30, 2);
    for (var i = 0; i < 5; i++) {
      var ax = 18 + i * 42;
      this.drawDie(g, ax, 42, 34, this.aiDice[i], this.aiHold[i], false);
    }

    // Dividing Felt Rail
    g.line(10, 90, 230, 90, 2);

    // Result or Prompt Banner
    if (this.state === 'SHOWDOWN') {
      g.rect(20, 96, 200, 20, 1);
      g.box(20, 96, 200, 20, 3);
      g.textC(this.resultBanner, 102, 3);
    } else {
      g.textC(this.playerHandName, 102, 3);
    }

    // Player Dice Area (Bottom Half)
    g.text("YOUR HAND (REROLLS: " + this.rollsLeft + ")", 18, 126, 2);
    for (var i = 0; i < 5; i++) {
      var px = 18 + i * 42;
      var isCursor = (i === this.cursorDie && this.state === 'PLAYER_TURN');
      this.drawDie(g, px, 138, 34, this.playerDice[i], this.playerHold[i], isCursor);
    }

    // Bottom Help & Action Bar
    g.rect(0, 218, 240, 22, 0);
    g.line(0, 218, 240, 218, 2);
    g.text("D-PAD: SELECT  [A]: HOLD", 6, 224, 2);
    g.textR("[B] REROLL (" + this.rollsLeft + ")", 234, 224, this.rollsLeft > 0 ? 3 : 1);

    // Match Over Overlay
    if (this.state === 'MATCH_OVER') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("TABLE SETTLED!", 70, 3);
      g.textC("FINAL GOLD PURSE: " + this.gold, 95, 2);
      g.textC(this.gold >= 100 ? "PROFITABLE NIGHT AT THE INN!" : "LOST TO THE HOUSE DICE", 115, 3);
      g.textC("PRESS [A] TO PLAY AGAIN", 145, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  },

  drawDie(g, x, y, sz, val, isHeld, isCursor) {
    // Die container box
    g.rect(x, y, sz, sz, 0);
    g.box(x, y, sz, sz, isHeld ? 3 : (isCursor ? 3 : 2));

    if (isHeld) {
      g.box(x + 1, y + 1, sz - 2, sz - 2, 3);
      g.text("HELD", x + 5, y - 8, 3);
    }

    // Render Pips (1 to 6)
    var cx = x + sz / 2;
    var cy = y + sz / 2;
    var off = 7;
    var col = isHeld ? 3 : 2;

    if (val === 1) {
      g.disc(cx, cy, 2, col);
    } else if (val === 2) {
      g.disc(cx - off, cy - off, 2, col);
      g.disc(cx + off, cy + off, 2, col);
    } else if (val === 3) {
      g.disc(cx - off, cy - off, 2, col);
      g.disc(cx, cy, 2, col);
      g.disc(cx + off, cy + off, 2, col);
    } else if (val === 4) {
      g.disc(cx - off, cy - off, 2, col);
      g.disc(cx + off, cy - off, 2, col);
      g.disc(cx - off, cy + off, 2, col);
      g.disc(cx + off, cy + off, 2, col);
    } else if (val === 5) {
      g.disc(cx - off, cy - off, 2, col);
      g.disc(cx + off, cy - off, 2, col);
      g.disc(cx, cy, 2, col);
      g.disc(cx - off, cy + off, 2, col);
      g.disc(cx + off, cy + off, 2, col);
    } else if (val === 6) {
      g.disc(cx - off, cy - off, 2, col);
      g.disc(cx + off, cy - off, 2, col);
      g.disc(cx - off, cy, 2, col);
      g.disc(cx + off, cy, 2, col);
      g.disc(cx - off, cy + off, 2, col);
      g.disc(cx + off, cy + off, 2, col);
    }

    if (isCursor) {
      g.box(x - 2, y - 2, sz + 4, sz + 4, 3);
    }
  }
};
