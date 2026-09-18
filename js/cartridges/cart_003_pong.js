// js/cartridges/cart_003_pong.js
// ============================================================================
// Cartridge #003: PONG
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 3. PONG
CARTS[3] = {
  id: 3,
  name: "PONG",
  genre: 0,
  scoreLabel: "WINS",
  desc: "CLASSIC 2-PADDLE TABLE TENNIS AGAINST COMPUTER. FIRST TO 7 WINS!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    g.rect(x + 4, y + 10, 3, 12, 3);
    g.rect(x + 25, y + 14, 3, 12, 2);
    g.rect(x + 14, y + 15, 3, 3, 3);
  },

  init() {
    this.py = 100;
    this.ay = 100;
    this.bx = 128;
    this.by = 120;
    this.bvx = 140;
    this.bvy = 60;
    this.pScore = 0;
    this.aScore = 0;
    this.over = false;
    this.rally = 0;
    this.aiOffset = 0;
    this.serveTimer = 0.5;
    this.totalWins = (typeof SAVE !== 'undefined' && SAVE.getScore) ? (SAVE.getScore(this.id) || 0) : 0;
  },

  resetBall(dir) {
    this.bx = 128;
    this.by = 120;
    const initialSpeed = 140;
    const angle = (Math.random() - 0.5) * 0.6;
    this.bvx = Math.cos(angle) * initialSpeed * dir;
    this.bvy = Math.sin(angle) * initialSpeed;
    this.serveTimer = 0.6;
    this.aiOffset = (Math.random() - 0.5) * 16;
    this.rally = 0;
  },

  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('start') || PAD.hit('b') || PAD.tapPos || (PAD.pointer && PAD.pointer.down)) {
        this.init();
      }
      return;
    }

    // --- 1. PLAYER PADDLE CONTROLS ---
    // Keyboard / D-pad
    let moveY = 0;
    if (PAD.held('up') || PAD.state.up) moveY -= 1;
    if (PAD.held('down') || PAD.state.down) moveY += 1;
    if (moveY !== 0) {
      this.py += moveY * 180 * dt;
    }

    // Touch swipe support
    if (PAD.swipe === 'up') this.py -= 32;
    if (PAD.swipe === 'down') this.py += 32;

    // Mobile touch / pointer steering and tap support
    if (PAD.pointer && PAD.pointer.down) {
      const targetPy = PAD.pointer.y - 20;
      this.py += (targetPy - this.py) * Math.min(1, 20 * dt);
    } else if (PAD.tapPos) {
      const targetPy = PAD.tapPos.y - 20;
      this.py += (targetPy - this.py) * Math.min(1, 20 * dt);
    }
    this.py = Math.max(16, Math.min(184, this.py));

    // --- 2. AI PADDLE LOGIC ---
    let aiTarget = 100;
    let aiSpeed = 150 + Math.min(this.aScore, 5) * 4;
    if (this.bvx > 0) {
      // Ball approaching AI: track with humanized imperfection offset
      aiTarget = this.by - 20 + this.aiOffset;
    } else {
      // Ball receding: relax towards center court
      aiTarget = 100;
      aiSpeed = 70;
    }
    const aiDiff = aiTarget - this.ay;
    if (Math.abs(aiDiff) > 2) {
      const aiStep = Math.sign(aiDiff) * aiSpeed * dt;
      if (Math.abs(aiStep) > Math.abs(aiDiff)) {
        this.ay = aiTarget;
      } else {
        this.ay += aiStep;
      }
    }
    this.ay = Math.max(16, Math.min(184, this.ay));

    // --- 3. SERVE DELAY ---
    if (this.serveTimer > 0) {
      this.serveTimer -= dt;
      if (this.serveTimer <= 0) {
        APU.sfx('TICK');
      }
      return;
    }

    // --- 4. BALL PHYSICS & HIGH-SPEED TUNNELING PREVENTION ---
    const totalSpeed = Math.hypot(this.bvx, this.bvy);
    const totalDist = totalSpeed * dt;
    const maxStepDist = 3; // at most 3 pixels per substep
    const steps = Math.max(1, Math.ceil(totalDist / maxStepDist));
    const subDt = dt / steps;

    for (let s = 0; s < steps; s++) {
      this.bx += this.bvx * subDt;
      this.by += this.bvy * subDt;

      // Top / Bottom wall bounce (court boundaries y: 15..223, ball radius 3)
      if (this.by <= 17) {
        this.by = 17;
        this.bvy = Math.abs(this.bvy);
        APU.sfx('TICK');
      } else if (this.by >= 223) {
        this.by = 223;
        this.bvy = -Math.abs(this.bvy);
        APU.sfx('TICK');
      }

      // Left player paddle collision (paddle x: 18..24, y: py..py+40)
      if (this.bvx < 0 && this.bx <= 27 && this.bx >= 15) {
        if (this.by >= this.py - 3 && this.by <= this.py + 43) {
          this.bx = 27;
          // Continuous deflection angle depending on distance from paddle center
          const rel = Math.max(-1, Math.min(1, (this.by - (this.py + 20)) / 20));
          const maxAngle = 0.92; // ~53 degrees
          const angle = rel * maxAngle;
          const curSpd = Math.hypot(this.bvx, this.bvy);
          const newSpd = Math.min(340, Math.max(150, curSpd * 1.05 + 4)); // volley acceleration clamped
          this.bvx = Math.cos(angle) * newSpd;
          this.bvy = Math.sin(angle) * newSpd;
          this.aiOffset = (Math.random() - 0.5) * 16;
          this.rally++;
          APU.sfx('HIT');
          PAD.vibrate(12);
        }
      }

      // Right AI paddle collision (paddle x: 232..238, y: ay..ay+40)
      if (this.bvx > 0 && this.bx >= 229 && this.bx <= 241) {
        if (this.by >= this.ay - 3 && this.by <= this.ay + 43) {
          this.bx = 229;
          const rel = Math.max(-1, Math.min(1, (this.by - (this.ay + 20)) / 20));
          const maxAngle = 0.92; // ~53 degrees
          const angle = rel * maxAngle;
          const curSpd = Math.hypot(this.bvx, this.bvy);
          const newSpd = Math.min(340, Math.max(150, curSpd * 1.05 + 4)); // volley acceleration clamped
          this.bvx = -Math.cos(angle) * newSpd;
          this.bvy = Math.sin(angle) * newSpd;
          this.rally++;
          APU.sfx('HIT');
        }
      }

      // Goal / Scoring checks
      if (this.bx < 8) {
        // CPU point
        this.aScore++;
        APU.sfx('HURT');
        PAD.vibrate(20);
        if (this.aScore >= 7) {
          this.over = true;
          APU.sfx('BOOM');
        } else {
          this.resetBall(1);
        }
        break;
      } else if (this.bx > 248) {
        // Player point
        this.pScore++;
        APU.sfx('COIN');
        PAD.vibrate(15);
        if (this.pScore >= 7) {
          this.over = true;
          this.totalWins++;
          if (typeof SAVE !== 'undefined' && SAVE.setScore) {
            SAVE.setScore(this.id, this.totalWins);
          }
          APU.sfx('LEVELUP');
        } else {
          this.resetBall(-1);
        }
        break;
      }
    }
  },

  render(g) {
    g.clear(0);

    // Court border & solid top/bottom walls
    g.box(8, 12, 240, 216, 1);
    g.rect(8, 12, 240, 2, 2);
    g.rect(8, 226, 240, 2, 2);

    // Dashed center net
    for (let y = 16; y < 224; y += 8) {
      g.rect(127, y, 2, 4, 1);
    }

    // Digital Score Display
    g.text("" + this.pScore, 86, 22, 3, 3);
    g.text("" + this.aScore, 150, 22, 2, 3);
    g.text("1P", 90, 16, 1, 1);
    g.text("CPU", 154, 16, 1, 1);

    // Left Player Paddle with bevels
    const pY = Math.floor(this.py);
    g.rect(18, pY, 6, 40, 3);
    g.rect(18, pY, 1, 40, 3);
    g.rect(19, pY + 1, 4, 38, 2);
    g.rect(20, pY + 2, 2, 36, 3);

    // Right AI Paddle with bevels
    const aY = Math.floor(this.ay);
    g.rect(232, aY, 6, 40, 2);
    g.rect(232, aY, 1, 40, 3);
    g.rect(233, aY + 1, 4, 38, 2);
    g.rect(234, aY + 2, 2, 36, 2);

    // Ball (phosphor square with bright core and serve blinking)
    if (!this.over) {
      const bX = Math.floor(this.bx);
      const bY = Math.floor(this.by);
      if (this.serveTimer <= 0 || Math.floor(this.serveTimer * 8) % 2 === 0) {
        g.rect(bX - 3, bY - 3, 6, 6, 3);
        g.px(bX, bY, 0);
      }
    }

    // Rally counter at bottom
    if (!this.over && this.rally > 2) {
      g.textC("RALLY: " + this.rally, 218, 1, 1);
    }

    // Post-match victory / defeat dialog
    if (this.over) {
      g.rect(48, 70, 160, 96, 0);
      g.dither(48, 70, 160, 96, 0, 1);
      g.box(48, 70, 160, 96, 3);
      g.box(50, 72, 156, 92, 2);

      const won = this.pScore >= 7;
      if (won) {
        g.textC("VICTORY!", 82, 3, 2);
        g.textC("YOU DEFEATED COMPUTER", 102, 2, 1);
      } else {
        g.textC("DEFEAT", 82, 2, 2);
        g.textC("COMPUTER WINS MATCH", 102, 1, 1);
      }
      g.textC("FINAL: " + this.pScore + " - " + this.aScore, 116, 3, 1);
      g.textC("TOTAL WINS: " + this.totalWins, 128, 2, 1);
      g.textC("[A] PLAY AGAIN", 146, 3, 1);
    }
  }
};
