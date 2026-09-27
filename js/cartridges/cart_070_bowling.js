// js/cartridges/cart_070_bowling.js
// ============================================================================
// Cartridge #070: BOWLING
// Genre: Racing & Vehicles / Sports (6) | Complete 10-Frame Ten-Pin Bowling
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[70] = {
  id: 70,
  name: "BOWLING",
  genre: 6,
  scoreLabel: "SCORE",
  desc: "TEN-PIN BOWLING: POSITION BALL, TIME POWER & HOOK SPIN FOR POCKET STRIKES & 300!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Bowling ball rolling into 10-pin triangle rack, flying pin impact
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Bowling Lane Gutters
    g.line(x + 5, y + 2, x + 7, y + 30, 1);
    g.line(x + 27, y + 2, x + 25, y + 30, 1);

    // 10-Pin rack pins (Back row to head pin)
    // Row 4
    g.disc(x + 10, y + 6, 1, 2);
    g.disc(x + 14, y + 6, 1, 2);
    g.disc(x + 18, y + 6, 1, 2);
    g.disc(x + 22, y + 6, 1, 2);
    // Row 3
    g.disc(x + 12, y + 9, 1, 2);
    g.disc(x + 16, y + 9, 1, 3);
    g.disc(x + 20, y + 9, 1, 2);
    // Row 2
    g.disc(x + 14, y + 12, 2, 2);
    g.disc(x + 18, y + 12, 2, 2);
    // Head pin 1 (Impact tilt!)
    g.disc(x + 17, y + 14, 2, 3);

    // Bowling Ball (Solid black with 3 finger holes)
    g.disc(x + 14, y + 23, 5, 3);
    g.px(x + 13, y + 22, 0); // finger hole 1
    g.px(x + 15, y + 22, 0); // finger hole 2
    g.px(x + 14, y + 24, 0); // thumb hole
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.currentFrame = 1;
    this.maxFrames = 10;
    this.ballNumber = 1; // 1 or 2 (or 3 in 10th frame)

    // Official Frame Rolls Record: array of [roll1, roll2, (roll3)]
    this.frames = [];
    for (let f = 0; f < 10; f++) this.frames.push([]);

    this.state = 'STANCE'; // 'STANCE', 'POWER', 'ROLL', 'SWEEP', 'GAMEOVER'
    this.bannerText = "";
    this.bannerTimer = 0;

    // Ball physics
    this.ball = {
      x: 128,
      y: 216,
      vx: 0,
      vy: 0,
      radius: 7,
      spin: 0, // Hook curve
      inGutter: false
    };

    // Approach stance
    this.stanceX = 128;
    this.powerMeter = 0;
    this.powerDir = 1;
    this.hookSpin = 0;

    // Pin Deck Layout (10 pins)
    this.pins = [];
    this.rackPins();
  },

  rackPins() {
    this.pins = [];
    // Pin layout positions at pin deck (Y: 52 to 74)
    const pinCoords = [
      { id: 1, x: 128, y: 74 },
      { id: 2, x: 121, y: 66 }, { id: 3, x: 135, y: 66 },
      { id: 4, x: 114, y: 58 }, { id: 5, x: 128, y: 58 }, { id: 6, x: 142, y: 58 },
      { id: 7, x: 107, y: 50 }, { id: 8, x: 121, y: 50 }, { id: 9, x: 135, y: 50 }, { id: 10, x: 149, y: 50 }
    ];

    for (let c of pinCoords) {
      this.pins.push({
        id: c.id,
        x: c.x,
        y: c.y,
        vx: 0,
        vy: 0,
        standing: true,
        fallTimer: 0
      });
    }
  },

  // --------------------------------------------------------------------------
  // 3. MAIN GAMEPLAY UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    if (dt > 0.04) dt = 0.04;

    // Handle Game Over restart
    if (this.state === 'GAMEOVER') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || TOUCH.down) {
        this.init();
      }
      return;
    }

    // Pin-sweeper rake animation transition
    if (this.state === 'SWEEP') {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) {
        this.advanceFrame();
      }
      return;
    }

    // 1. BALL STANCE ALIGNMENT
    if (this.state === 'STANCE') {
      if (PAD.state.left) this.stanceX -= 65 * dt;
      if (PAD.state.right) this.stanceX += 65 * dt;

      // Direct touch alignment
      if (TOUCH.down && TOUCH.y > 170) {
        this.stanceX = TOUCH.x;
      }

      this.stanceX = Math.max(90, Math.min(166, this.stanceX));
      this.ball.x = this.stanceX;
      this.ball.y = 216;

      // Tap [A] to start power meter
      if (PAD.hit('a') || TOUCH.down) {
        this.state = 'POWER';
        this.powerMeter = 0;
        this.powerDir = 1;
        this.hookSpin = 0;
        APU.sfx('TICK');
      }
      return;
    }

    // 2. POWER & HOOK METER
    if (this.state === 'POWER') {
      this.powerMeter += this.powerDir * 2.4 * dt;
      if (this.powerMeter >= 1.0) {
        this.powerMeter = 1.0;
        this.powerDir = -1;
      } else if (this.powerMeter <= 0.0) {
        this.powerMeter = 0.0;
        this.powerDir = 1;
      }

      // Add hook spin with Left/Right
      if (PAD.state.left) this.hookSpin = Math.max(-1.0, this.hookSpin - 3.2 * dt);
      else if (PAD.state.right) this.hookSpin = Math.min(1.0, this.hookSpin + 3.2 * dt);

      // Release [A] to bowl down lane!
      if (PAD.hit('a') || TOUCH.down) {
        this.rollBall();
      }
      return;
    }

    // 3. BALL ROLLING & PIN COLLISION
    if (this.state === 'ROLL') {
      const b = this.ball;

      // Advance ball down lane
      b.y += b.vy * dt;

      // Hook curl curve develops as ball rolls down oil pattern
      if (!b.inGutter) {
        b.x += (b.vx + b.spin * 24) * dt;

        // Check Gutter Channels (Left & Right)
        if (b.x < 86) {
          b.x = 83;
          b.inGutter = true;
          b.vx = 0;
          b.spin = 0;
          APU.sfx('ERROR');
        } else if (b.x > 170) {
          b.x = 173;
          b.inGutter = true;
          b.vx = 0;
          b.spin = 0;
          APU.sfx('ERROR');
        }
      }

      // Ball perspective scaling
      b.radius = Math.max(3.5, 7.0 - ((216 - b.y) / 170) * 3.2);

      // Check Ball-to-Pin Collisions
      if (!b.inGutter) {
        for (let p of this.pins) {
          if (!p.standing) continue;
          const dist = Math.hypot(b.x - p.x, b.y - p.y);
          if (dist < b.radius + 3.5) {
            p.standing = false;
            p.vx = (p.x - b.x) * 4.5 + (Math.random() - 0.5) * 20;
            p.vy = b.vy * 0.45;
            APU.sfx('HIT');
          }
        }
      }

      // Chain reaction collisions: Pin-to-Pin domino topples
      for (let p1 of this.pins) {
        if (p1.standing) continue;
        for (let p2 of this.pins) {
          if (!p2.standing) continue;
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 8) {
            p2.standing = false;
            p2.vx = (p2.x - p1.x) * 3.5;
            p2.vy = p1.vy * 0.75;
            APU.sfx('HIT');
          }
        }
      }

      // Update falling pin physics
      for (let p of this.pins) {
        if (!p.standing) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.92;
          p.vy *= 0.92;
        }
      }

      // Ball reaches pin deck pit (Y <= 42)
      if (b.y <= 42) {
        this.resolveRollResult();
      }
    }
  },

  rollBall() {
    this.state = 'ROLL';
    const b = this.ball;
    const speed = 120 + this.powerMeter * 80;

    b.x = this.stanceX;
    b.y = 216;
    b.vx = (128 - this.stanceX) * 0.2; // subtle aim bias
    b.vy = -speed;
    b.spin = this.hookSpin;
    b.inGutter = false;

    APU.sfx('CONFIRM');
  },

  resolveRollResult() {
    // Count pins knocked down on this roll
    let downPins = 0;
    for (let p of this.pins) {
      if (!p.standing) downPins++;
    }

    const curFrameRolls = this.frames[this.currentFrame - 1];
    let rollPins = downPins;
    if (this.ballNumber === 2 && this.currentFrame < 10) {
      rollPins = downPins - curFrameRolls[0];
    }

    curFrameRolls.push(rollPins);

    // Evaluate Strike / Spare / Count
    if (this.ballNumber === 1 && rollPins === 10) {
      this.bannerText = "★ STRIKE! ★";
      APU.sfx('FANFARE');
    } else if (this.ballNumber === 2 && downPins === 10) {
      this.bannerText = "★ SPARE! ★";
      APU.sfx('COIN');
    } else if (downPins === 0) {
      this.bannerText = "GUTTER BALL!";
    } else {
      this.bannerText = downPins + " PINS";
    }

    this.state = 'SWEEP';
    this.bannerTimer = 2.0;
  },

  advanceFrame() {
    const curFrameRolls = this.frames[this.currentFrame - 1];

    if (this.currentFrame < 10) {
      // Frames 1 to 9
      if (curFrameRolls[0] === 10 || this.ballNumber === 2) {
        // Next frame!
        this.currentFrame++;
        this.ballNumber = 1;
        this.rackPins();
      } else {
        // Second ball in frame
        this.ballNumber = 2;
        // Keep remaining standing pins on deck
      }
    } else {
      // 10th Frame Rules
      if (this.ballNumber === 1) {
        this.ballNumber = 2;
        if (curFrameRolls[0] === 10) this.rackPins();
      } else if (this.ballNumber === 2) {
        const totalFirstTwo = curFrameRolls[0] + curFrameRolls[1];
        if (curFrameRolls[0] === 10 || totalFirstTwo === 10) {
          // Bonus 3rd ball earned!
          this.ballNumber = 3;
          this.rackPins();
        } else {
          this.endGame();
          return;
        }
      } else {
        // 3rd ball completed
        this.endGame();
        return;
      }
    }

    this.state = 'STANCE';
    this.ball.x = this.stanceX;
    this.ball.y = 216;
  },

  endGame() {
    this.state = 'GAMEOVER';
    const total = this.calculateTotalScore();
    SAVE.setScore(this.id, total);
  },

  // Official Ten-Pin Scoring Engine
  calculateTotalScore() {
    let score = 0;
    const rolls = [];
    for (let f of this.frames) {
      for (let r of f) rolls.push(r);
    }

    let rollIdx = 0;
    for (let f = 0; f < 10; f++) {
      if (rollIdx >= rolls.length) break;

      if (rolls[rollIdx] === 10) {
        // Strike: 10 + next 2 rolls
        score += 10 + (rolls[rollIdx + 1] || 0) + (rolls[rollIdx + 2] || 0);
        rollIdx += 1;
      } else if ((rolls[rollIdx] + (rolls[rollIdx + 1] || 0)) === 10) {
        // Spare: 10 + next 1 roll
        score += 10 + (rolls[rollIdx + 2] || 0);
        rollIdx += 2;
      } else {
        // Open frame
        score += (rolls[rollIdx] || 0) + (rolls[rollIdx + 1] || 0);
        rollIdx += 2;
      }
    }
    return score;
  },

  // --------------------------------------------------------------------------
  // 4. 256x240 CRT RENDERING
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    // 1. Bowling Lane Perspective
    // Gutters
    g.rect(74, 38, 12, 176, 0);
    g.line(74, 38, 74, 214, 1);
    g.rect(170, 38, 12, 176, 0);
    g.line(182, 38, 182, 214, 1);

    // Hardwood Lane Surface
    g.rect(86, 38, 84, 176, 1);
    g.box(86, 38, 84, 176, 2);

    // Lane Board lines & Arrows
    for (let b = 94; b <= 162; b += 8) {
      g.line(b, 38, b, 214, 0);
    }
    // Targeting Arrows on lane
    for (let a = 98; a <= 158; a += 15) {
      g.tri(a, 140, a - 2, 144, a + 2, 144, 2);
    }

    // Foul Line (Bottom)
    g.line(86, 204, 170, 204, 3);

    // Pin Deck (Top)
    g.rect(86, 38, 84, 38, 0);

    // 2. Ten-Pin Rack Rendering
    for (let p of this.pins) {
      const px = Math.floor(p.x);
      const py = Math.floor(p.y);

      if (p.standing) {
        // Standing Upright Pin
        g.disc(px, py - 4, 2, 3); // Head
        g.oval(px, py, 3, 5, 3); // Belly
        g.line(px - 2, py - 2, px + 2, py - 2, 0); // Red stripe 1
        g.line(px - 2, py - 1, px + 2, py - 1, 0); // Red stripe 2
      } else {
        // Toppled Pin
        g.oval(px, py, 5, 2, 2);
      }
    }

    // 3. Bowling Ball
    const bx = Math.floor(this.ball.x);
    const by = Math.floor(this.ball.y);
    const br = Math.floor(this.ball.radius);

    g.disc(bx, by, br, 3);
    // Finger holes
    if (br >= 5) {
      g.px(bx - 1, by - 2, 0);
      g.px(bx + 1, by - 2, 0);
      g.px(bx, by + 1, 0);
    }

    // 4. Pin Sweeper Bar (During SWEEP)
    if (this.state === 'SWEEP') {
      const sweepY = 40 + Math.floor((1.0 - this.bannerTimer / 2.0) * 40);
      g.line(86, sweepY, 170, sweepY, 3);
      g.rect(86, sweepY - 3, 84, 3, 2);
    }

    // 5. Top 10-Frame Retro Scoreboard
    g.rect(0, 0, 256, 36, 0);
    g.line(0, 36, 256, 36, 2);

    for (let i = 0; i < 10; i++) {
      const fx = 4 + i * 25;
      const isCur = (i === this.currentFrame - 1);
      g.box(fx, 4, 24, 28, isCur ? 3 : 1);
      g.text((i + 1).toString(), fx + 8, 6, isCur ? 3 : 2);

      // Frame roll boxes
      const rolls = this.frames[i];
      if (rolls && rolls.length > 0) {
        const r1 = rolls[0] === 10 ? "X" : rolls[0].toString();
        g.text(r1, fx + 2, 16, 3);
        if (rolls.length > 1) {
          const r2 = (rolls[0] + rolls[1] === 10) ? "/" : rolls[1].toString();
          g.text(r2, fx + 14, 16, 3);
        }
      }
    }

    // Running total score
    const curTotal = this.calculateTotalScore();
    g.text("SCORE: " + curTotal, 14, 40, 3);

    // 6. Bottom Controls & Meters
    g.rect(0, 214, 256, 26, 0);
    g.line(0, 214, 256, 214, 2);

    if (this.state === 'POWER') {
      g.box(60, 220, 110, 10, 2);
      g.rect(61, 221, Math.floor(this.powerMeter * 108), 8, 3);
      g.text("PWR", 26, 222, 3);
      const spinStr = this.hookSpin < -0.2 ? "HOOK ◄" : this.hookSpin > 0.2 ? "HOOK ►" : "FLAT";
      g.textR(spinStr, 246, 222, 2);
    } else {
      g.textC("LEFT/RIGHT: STANCE    [A]: BOWL FOR STRIKE", 222, 2);
    }

    // 7. Result Banner Overlay
    if (this.state === 'SWEEP') {
      g.dither(35, 95, 186, 44, 0, 1);
      g.box(35, 95, 186, 44, 3);
      g.textC(this.bannerText, 110, 3);
    }

    // 8. Game Over Screen
    if (this.state === 'GAMEOVER') {
      g.dither(25, 65, 206, 80, 0, 1);
      g.box(25, 65, 206, 80, 3);
      g.textC("★ 10 FRAMES COMPLETED! ★", 80, 3);
      g.textC("FINAL BOWLING SCORE: " + curTotal + " / 300", 98, 3);
      const grade = curTotal >= 200 ? "PRO BOWLER!" : curTotal >= 140 ? "AMATEUR STRIKER" : "ROOKIE ROLLER";
      g.textC("TITLE: " + grade, 114, 2);
      g.textC("[A] BOWL A NEW GAME", 132, 3);
    }
  }
};
