// js/cartridges/cart_069_curling.js
// ============================================================================
// Cartridge #069: CURLING
// Genre: Racing & Vehicles / Sports (6) | Strategic Olympic Curling Sheet
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[69] = {
  id: 69,
  name: "CURLING",
  genre: 6,
  scoreLabel: "SCORE",
  desc: "CURLING: AIM & DELIVER STONE. MASH [A] TO SWEEP ICE & EXTEND SLIDE INTO THE BUTTON!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Granite curling stone with handle gliding into the house concentric rings
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // House Rings (Top half)
    g.circle(x + 16, y + 10, 9, 1);
    g.circle(x + 16, y + 10, 5, 2);
    g.disc(x + 16, y + 10, 2, 3); // Button

    // Granite Curling Stone (Gliding up)
    g.oval(x + 16, y + 22, 8, 5, 3);
    g.oval(x + 16, y + 22, 6, 3, 2);
    // Red/Phosphor Handle
    g.line(x + 13, y + 21, x + 19, y + 21, 0);
    g.line(x + 14, y + 20, x + 18, y + 20, 3);

    // Ice scratch marks
    g.line(x + 12, y + 27, x + 13, y + 29, 1);
    g.line(x + 19, y + 27, x + 20, y + 29, 1);
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.end = 1;
    this.maxEnds = 4;
    this.playerMatchScore = 0;
    this.aiMatchScore = 0;

    // Stones per end: 4 for Player, 4 for AI (8 total)
    this.stonesRemaining = { player: 4, ai: 4 };
    this.currentTurn = 'PLAYER'; // 'PLAYER' or 'AI'

    this.state = 'AIM'; // 'AIM', 'WEIGHT', 'GLIDE', 'RESOLVE_COLLISIONS', 'END_SCORE', 'MATCH_OVER'

    // House Button Center Position (Tee)
    this.tee = { x: 128, y: 55 };

    // Active stones on sheet
    this.stones = [];
    this.activeStone = null;

    // Delivery Controls
    this.aimAngle = -Math.PI / 2; // Straight up
    this.weightMeter = 0;
    this.weightDir = 1;
    this.curlDirection = 1; // 1 = In-turn (curls right), -1 = Out-turn (curls left)

    // Sweeping state
    this.sweepHeat = 0;
    this.sweepBlink = 0;

    this.endBanner = "";
    this.endTimer = 0;
  },

  // --------------------------------------------------------------------------
  // 3. MAIN GAMEPLAY UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    if (dt > 0.04) dt = 0.04;

    // Handle Match Over restart
    if (this.state === 'MATCH_OVER') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || TOUCH.down) {
        this.init();
      }
      return;
    }

    // End Score display transition
    if (this.state === 'END_SCORE') {
      this.endTimer -= dt;
      if (this.endTimer <= 0) {
        if (this.end >= this.maxEnds) {
          this.state = 'MATCH_OVER';
          SAVE.setScore(this.id, this.playerMatchScore * 100 - this.aiMatchScore * 30);
        } else {
          this.end++;
          this.stones = [];
          this.stonesRemaining = { player: 4, ai: 4 };
          this.currentTurn = 'PLAYER';
          this.state = 'AIM';
          this.aimAngle = -Math.PI / 2;
        }
      }
      return;
    }

    // 1. AIM PHASE
    if (this.state === 'AIM') {
      if (this.currentTurn === 'PLAYER') {
        if (PAD.state.left) this.aimAngle -= 0.6 * dt;
        if (PAD.state.right) this.aimAngle += 0.6 * dt;

        // Toggle Curl Handle [B]
        if (PAD.hit('b')) {
          this.curlDirection = -this.curlDirection;
          APU.sfx('SELECT');
        }

        // Clamp aim within sheet bounds
        this.aimAngle = Math.max(-Math.PI / 2 - 0.25, Math.min(-Math.PI / 2 + 0.25, this.aimAngle));

        // Start delivery weight meter [A]
        if (PAD.hit('a') || TOUCH.down) {
          this.state = 'WEIGHT';
          this.weightMeter = 0;
          this.weightDir = 1;
          APU.sfx('TICK');
        }
      } else {
        // AI Turn calculations
        this.executeAiTurn();
      }
      return;
    }

    // 2. WEIGHT / FORCE METER PHASE
    if (this.state === 'WEIGHT') {
      this.weightMeter += this.weightDir * 2.2 * dt;
      if (this.weightMeter >= 1.0) {
        this.weightMeter = 1.0;
        this.weightDir = -1;
      } else if (this.weightMeter <= 0.0) {
        this.weightMeter = 0.0;
        this.weightDir = 1;
      }

      // Launch stone on [A]
      if (PAD.hit('a') || TOUCH.down) {
        this.launchActiveStone(this.aimAngle, this.weightMeter, this.curlDirection);
      }
      return;
    }

    // 3. GLIDE & SWEEPING PHASE
    if (this.state === 'GLIDE') {
      const s = this.activeStone;

      // Sweeping ice: Mash [A] or swipe touch
      if (PAD.hit('a') || TOUCH.down) {
        this.sweepHeat = Math.min(1.0, this.sweepHeat + 0.28);
        this.sweepBlink = 0.15;
        APU.sfx('TICK');
      }

      // Sweep heat decay
      this.sweepHeat = Math.max(0, this.sweepHeat - 1.2 * dt);
      if (this.sweepBlink > 0) this.sweepBlink -= dt;

      // Effective ice friction (sweeping extends slide)
      const baseFriction = 0.982;
      const effectiveFriction = baseFriction + (this.sweepHeat * 0.010);

      s.vx *= Math.pow(effectiveFriction, dt * 60);
      s.vy *= Math.pow(effectiveFriction, dt * 60);

      // Natural curl curvature (curl develops as stone slows down)
      const speed = Math.hypot(s.vx, s.vy);
      if (speed < 90 && speed > 5) {
        const curlForce = s.curl * (1.0 - this.sweepHeat * 0.7) * 22 * dt;
        s.vx += curlForce;
      }

      s.x += s.vx * dt;
      s.y += s.vy * dt;

      // Sheet side bumpers
      if (s.x < 36 || s.x > 220) {
        s.vx = -s.vx * 0.6;
        s.x = Math.max(36, Math.min(220, s.x));
        APU.sfx('HIT');
      }

      // Check collision between active stone and all stationary stones
      for (let other of this.stones) {
        if (other === s) continue;
        const dx = other.x - s.x;
        const dy = other.y - s.y;
        const dist = Math.hypot(dx, dy);
        const minDist = 14; // stone diameter

        if (dist < minDist && dist > 0.001) {
          // Elastic collision
          const nx = dx / dist;
          const ny = dy / dist;

          const p = 2 * (s.vx * nx + s.vy * ny - other.vx * nx - other.vy * ny) / 2;
          s.vx -= p * nx * 0.95;
          s.vy -= p * ny * 0.95;
          other.vx += p * nx * 0.95;
          other.vy += p * ny * 0.95;

          other.x += nx * (minDist - dist);
          other.y += ny * (minDist - dist);

          APU.sfx('HIT');
        }
      }

      // Update secondary displaced stones
      for (let st of this.stones) {
        if (st === s) continue;
        st.vx *= Math.pow(0.97, dt * 60);
        st.vy *= Math.pow(0.97, dt * 60);
        st.x += st.vx * dt;
        st.y += st.vy * dt;
      }

      // Check if all stones have come to a complete rest
      let allStopped = true;
      for (let st of this.stones) {
        if (Math.hypot(st.vx, st.vy) > 0.5) {
          allStopped = false;
          break;
        }
      }

      if (allStopped) {
        // Stop completely
        for (let st of this.stones) {
          st.vx = 0;
          st.vy = 0;
        }
        this.nextThrow();
      }
    }
  },

  launchActiveStone(angle, power, curl) {
    const launchSpeed = 85 + power * 95; // 85 to 180 px/s
    this.activeStone = {
      x: 128,
      y: 220,
      vx: Math.cos(angle) * launchSpeed,
      vy: Math.sin(angle) * launchSpeed,
      curl: curl,
      team: this.currentTurn,
      radius: 7
    };
    this.stones.push(this.activeStone);
    this.state = 'GLIDE';
    this.sweepHeat = 0;
    APU.sfx('CONFIRM');
  },

  executeAiTurn() {
    // Intelligent AI delivery:
    // Determine shot based on existing stones near button
    const bestPlayerStone = this.getClosestStone('PLAYER');
    let targetX = 128;
    let targetPower = 0.65; // default draw to button

    if (bestPlayerStone && bestPlayerStone.dist < 35 && Math.random() < 0.6) {
      // Takeout shot on player's best stone!
      targetX = bestPlayerStone.stone.x + (Math.random() - 0.5) * 4;
      targetPower = 0.88; // Heavy takeout weight
    } else {
      // Draw to center button
      targetX = 128 + (Math.random() - 0.5) * 16;
      targetPower = 0.62 + (Math.random() - 0.5) * 0.08;
    }

    const aiAim = Math.atan2(55 - 220, targetX - 128);
    const aiCurl = Math.random() < 0.5 ? 1 : -1;
    this.launchActiveStone(aiAim, targetPower, aiCurl);
  },

  getClosestStone(team) {
    let closest = null;
    let minDist = 999;
    for (let s of this.stones) {
      if (s.team === team) {
        const d = Math.hypot(s.x - this.tee.x, s.y - this.tee.y);
        if (d < minDist) {
          minDist = d;
          closest = { stone: s, dist: d };
        }
      }
    }
    return closest;
  },

  nextThrow() {
    if (this.currentTurn === 'PLAYER') {
      this.stonesRemaining.player--;
      this.currentTurn = 'AI';
    } else {
      this.stonesRemaining.ai--;
      this.currentTurn = 'PLAYER';
    }

    // Check if end is complete (all 8 stones thrown)
    if (this.stonesRemaining.player <= 0 && this.stonesRemaining.ai <= 0) {
      this.scoreEnd();
    } else {
      this.state = 'AIM';
      this.aimAngle = -Math.PI / 2;
    }
  },

  scoreEnd() {
    this.state = 'END_SCORE';
    this.endTimer = 2.6;

    // Calculate distances from button
    const scoredStones = [];
    for (let s of this.stones) {
      const dist = Math.hypot(s.x - this.tee.x, s.y - this.tee.y);
      // Stone must be touching house (radius <= 44) to score
      if (dist <= 44) {
        scoredStones.push({ team: s.team, dist: dist });
      }
    }

    scoredStones.sort((a, b) => a.dist - b.dist);

    if (scoredStones.length === 0) {
      this.endBanner = "BLANK END - 0 POINTS";
      return;
    }

    const winner = scoredStones[0].team;
    let points = 0;
    // Count consecutive stones belonging to winning team closer than any opponent stone
    for (let st of scoredStones) {
      if (st.team === winner) points++;
      else break;
    }

    if (winner === 'PLAYER') {
      this.playerMatchScore += points;
      this.endBanner = "★ PLAYER SCORES +" + points + "! ★";
      APU.sfx('FANFARE');
    } else {
      this.aiMatchScore += points;
      this.endBanner = "AI SCORES +" + points;
      APU.sfx('ERROR');
    }
  },

  // --------------------------------------------------------------------------
  // 4. 256x240 CRT RENDERING
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    // 1. Ice Sheet Boundaries
    g.rect(26, 28, 204, 184, 0);
    g.box(26, 28, 204, 184, 1);
    g.line(26, 28, 26, 212, 2);
    g.line(230, 28, 230, 212, 2);

    // Center Line down the sheet
    g.line(128, 28, 128, 212, 1);

    // Hog line & Tee line
    g.line(26, 55, 230, 55, 2); // Tee line
    g.line(26, 110, 230, 110, 1); // Hog line

    // 2. The House (Concentric Target Rings around Button)
    const tx = this.tee.x;
    const ty = this.tee.y;

    g.disc(tx, ty, 44, 1); // 12-foot ring
    g.circle(tx, ty, 44, 2);
    g.disc(tx, ty, 28, 0); // 8-foot ring
    g.circle(tx, ty, 28, 2);
    g.disc(tx, ty, 14, 2); // 4-foot ring
    g.circle(tx, ty, 14, 3);
    g.disc(tx, ty, 5, 3); // Button center!

    // 3. Render All Granite Curling Stones on Sheet
    for (let st of this.stones) {
      const sx = Math.floor(st.x);
      const sy = Math.floor(st.y);
      const isPlayer = (st.team === 'PLAYER');

      // Granite stone body
      g.oval(sx, sy, 7, 5, isPlayer ? 3 : 2);
      g.circle(sx, sy, 6, isPlayer ? 2 : 1);
      // Plastic handle
      g.line(sx - 3, sy, sx + 3, sy, 0);
      g.line(sx - 2, sy - 1, sx + 2, sy - 1, isPlayer ? 3 : 1);
    }

    // 4. Aim Trajectory Line (When aiming)
    if (this.state === 'AIM' && this.currentTurn === 'PLAYER') {
      const aimLen = 65;
      const ax = 128 + Math.cos(this.aimAngle) * aimLen;
      const ay = 220 + Math.sin(this.aimAngle) * aimLen;
      g.line(128, 220, Math.floor(ax), Math.floor(ay), 1);
      g.disc(Math.floor(ax), Math.floor(ay), 2, 2);
    }

    // 5. Sweeping Broom Animation
    if (this.state === 'GLIDE' && this.sweepBlink > 0) {
      const s = this.activeStone;
      if (s) {
        const bx = Math.floor(s.x);
        const by = Math.floor(s.y - 12);
        g.line(bx - 8, by, bx + 8, by, 3);
        g.line(bx, by, bx + 6, by - 14, 2);
        g.textC("SWEEP!", by - 22, 3);
      }
    }

    // 6. Top HUD (Match Scoreboard & Stones Remaining)
    g.rect(0, 0, 256, 26, 0);
    g.line(0, 26, 256, 26, 2);

    g.text("YOU: " + this.playerMatchScore, 10, 8, 3);
    g.textC("END " + this.end + "/" + this.maxEnds, 8, 2);
    g.textR("AI: " + this.aiMatchScore, 246, 8, 2);

    // Stones remaining dots
    for (let i = 0; i < this.stonesRemaining.player; i++) g.disc(60 + i * 8, 12, 2, 3);
    for (let i = 0; i < this.stonesRemaining.ai; i++) g.disc(175 + i * 8, 12, 2, 2);

    // 7. Bottom Control Panel
    g.rect(0, 214, 256, 26, 0);
    g.line(0, 214, 256, 214, 2);

    if (this.state === 'WEIGHT') {
      g.box(60, 220, 120, 10, 2);
      g.rect(61, 221, Math.floor(this.weightMeter * 118), 8, 3);
      g.text("FORCE", 14, 222, 3);
      g.textR("[A] THROW", 248, 222, 2);
    } else if (this.state === 'GLIDE') {
      g.textC("MASH [A] TO SWEEP ICE & CARRY STONE", 222, 3);
    } else {
      const curlStr = this.curlDirection === 1 ? "IN-TURN (R)" : "OUT-TURN (L)";
      g.text("[B] " + curlStr, 10, 222, 2);
      g.textR("[A] DELIVER", 246, 222, 3);
    }

    // 8. End Score Banner Overlay
    if (this.state === 'END_SCORE') {
      g.dither(30, 85, 196, 46, 0, 1);
      g.box(30, 85, 196, 46, 3);
      g.textC(this.endBanner, 98, 3);
      g.textC("END " + this.end + " COMPLETED", 114, 2);
    }

    // 9. Match Over Overlay
    if (this.state === 'MATCH_OVER') {
      g.dither(25, 75, 206, 70, 0, 1);
      g.box(25, 75, 206, 70, 3);
      const won = this.playerMatchScore > this.aiMatchScore;
      g.textC(won ? "★ MATCH WON! GOLD MEDAL! ★" : "MATCH LOST", 92, 3);
      g.textC("FINAL: YOU " + this.playerMatchScore + " - " + this.aiMatchScore + " AI", 108, 2);
      g.textC("[A] PLAY 4 ENDS AGAIN", 126, 3);
    }
  }
};
