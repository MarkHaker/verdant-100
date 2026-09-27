// js/cartridges/cart_065_archery.js
// ============================================================================
// Cartridge #065: ARCHERY
// Genre: Racing & Vehicles / Sports (6) | Precision Target Archery Range
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[65] = {
  id: 65,
  name: "ARCHERY",
  genre: 6,
  scoreLabel: "POINTS",
  desc: "TARGET ARCHERY: D-PAD COMPENSATES FOR WIND & SWAY. HOLD [A] TO DRAW BOW, RELEASE TO FIRE!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Recurve bow with drawn arrow, concentric target boss rings
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Target boss concentric rings (right side)
    g.circle(x + 22, y + 16, 10, 1);
    g.circle(x + 22, y + 16, 6, 2);
    g.disc(x + 22, y + 16, 2, 3);

    // Recurve Bow (left side)
    g.line(x + 5, y + 6, x + 11, y + 12, 2);
    g.line(x + 11, y + 12, x + 11, y + 20, 3); // riser grip
    g.line(x + 11, y + 20, x + 5, y + 26, 2);

    // Bowstring drawn back
    g.line(x + 5, y + 6, x + 6, y + 16, 1);
    g.line(x + 5, y + 26, x + 6, y + 16, 1);

    // Arrow on rest
    g.line(x + 6, y + 16, x + 20, y + 16, 3);
    g.tri(x + 20, y + 16, x + 17, y + 14, x + 17, y + 18, 3);
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.totalScore = 0;
    this.arrowsLeft = 15; // 5 ends of 3 arrows
    this.currentEnd = 1;
    this.arrowsInEnd = 0;
    this.endArrows = []; // current end hits { x, y, score }
    this.allArrows = []; // all historical hits

    this.state = 'AIM'; // 'AIM', 'DRAW', 'FLIGHT', 'END_REVIEW', 'GAMEOVER'
    this.bannerText = "";
    this.bannerTimer = 0;

    // Target boss position
    this.target = {
      x: 128,
      y: 95,
      r10: 6,
      r9: 12,
      r8: 18,
      r7: 25,
      r6: 33,
      r5: 42,
      rMax: 52
    };

    this.resetArrow();
  },

  resetArrow() {
    this.aimX = this.target.x;
    this.aimY = this.target.y;
    this.swayTime = Math.random() * 10;
    this.drawTime = 0;
    this.fatigueShake = 0;

    // Dynamic wind (direction angle & speed 0-14 m/s)
    this.windAngle = Math.random() * Math.PI * 2;
    this.windSpeed = Math.floor(Math.random() * 11 + 1); // 1 to 12 m/s

    // Arrow flight projectile
    this.arrow = {
      x: 128,
      y: 220,
      z: 0, // 0 = at archer, 100 = at target boss
      vx: 0,
      vy: 0,
      targetX: 0,
      targetY: 0
    };

    this.state = 'AIM';
  },

  // --------------------------------------------------------------------------
  // 3. MAIN GAMEPLAY UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    if (dt > 0.05) dt = 0.05;

    // Handle Game Over restart
    if (this.state === 'GAMEOVER') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || TOUCH.down) {
        this.init();
      }
      return;
    }

    // End of 3-arrow review phase
    if (this.state === 'END_REVIEW') {
      if (PAD.hit('a') || PAD.hit('b') || TOUCH.down) {
        if (this.arrowsLeft <= 0) {
          this.state = 'GAMEOVER';
          SAVE.setScore(this.id, this.totalScore);
        } else {
          this.currentEnd++;
          this.arrowsInEnd = 0;
          this.endArrows = [];
          this.resetArrow();
        }
      }
      return;
    }

    // Breathing / Heartbeat Sway (Lissajous figure)
    this.swayTime += dt * 2.2;
    const swayX = Math.sin(this.swayTime) * 14 + Math.sin(this.swayTime * 2.3) * 6;
    const swayY = Math.cos(this.swayTime * 1.5) * 11 + Math.sin(this.swayTime * 3.1) * 4;

    // 1. AIM PHASE
    if (this.state === 'AIM') {
      let speed = 45;
      if (PAD.state.left) this.aimX -= speed * dt;
      if (PAD.state.right) this.aimX += speed * dt;
      if (PAD.state.up) this.aimY -= speed * dt;
      if (PAD.state.down) this.aimY += speed * dt;

      // Start drawing bow [A] or touch
      if (PAD.hit('a') || TOUCH.down) {
        this.state = 'DRAW';
        this.drawTime = 0;
        this.fatigueShake = 0;
        APU.sfx('TICK');
      }
      return;
    }

    // 2. DRAW BOW PHASE
    if (this.state === 'DRAW') {
      this.drawTime += dt;

      // Fine aim adjustments while drawing
      let speed = 25;
      if (PAD.state.left) this.aimX -= speed * dt;
      if (PAD.state.right) this.aimX += speed * dt;
      if (PAD.state.up) this.aimY -= speed * dt;
      if (PAD.state.down) this.aimY += speed * dt;

      // Optimal draw window is 1.0s to 1.6s
      // Holding longer than 1.8s induces severe muscular fatigue shake!
      if (this.drawTime > 1.8) {
        this.fatigueShake = Math.min(18, (this.drawTime - 1.8) * 16);
      }

      // Releasing [A] / Touch fires arrow!
      const released = !PAD.state.a && !TOUCH.held;
      if (released) {
        this.releaseArrow(swayX, swayY);
      }
      return;
    }

    // 3. ARROW FLIGHT PHASE
    if (this.state === 'FLIGHT') {
      const arr = this.arrow;
      arr.z += 170 * dt; // High-speed arrow flight
      arr.x += (arr.targetX - arr.x) * 4.5 * dt;
      arr.y += (arr.targetY - arr.y) * 4.5 * dt;

      // Arrow hits target board
      if (arr.z >= 100) {
        arr.z = 100;
        arr.x = arr.targetX;
        arr.y = arr.targetY;
        this.resolveArrowImpact();
      }
    }
  },

  releaseArrow(swayX, swayY) {
    this.state = 'FLIGHT';
    this.arrowsLeft--;
    this.arrowsInEnd++;

    // Calculate final impact coordinate including sway, wind drift, and fatigue
    const shakeOffset = (Math.random() - 0.5) * this.fatigueShake;
    const windDriftX = Math.cos(this.windAngle) * (this.windSpeed * 1.5);
    const windDriftY = Math.sin(this.windAngle) * (this.windSpeed * 0.8) + 3; // slight gravity drop

    // Underdraw penalty (releasing too early drops short)
    const drawPower = Math.min(1.0, this.drawTime / 1.1);
    const dropPenalty = (1.0 - drawPower) * 35;

    this.arrow.targetX = this.aimX + swayX + windDriftX + shakeOffset;
    this.arrow.targetY = this.aimY + swayY + windDriftY + dropPenalty + shakeOffset;

    this.arrow.x = 128;
    this.arrow.y = 230;
    this.arrow.z = 0;

    APU.sfx('HIT');
  },

  resolveArrowImpact() {
    const dist = Math.hypot(this.arrow.targetX - this.target.x, this.arrow.targetY - this.target.y);
    const t = this.target;

    let pts = 0;
    if (dist <= t.r10) { pts = 10; this.bannerText = "★ BULLSEYE! 10 PTS ★"; APU.sfx('COIN'); }
    else if (dist <= t.r9) { pts = 9; this.bannerText = "9 POINTS"; APU.sfx('CONFIRM'); }
    else if (dist <= t.r8) { pts = 8; this.bannerText = "8 POINTS"; APU.sfx('HIT'); }
    else if (dist <= t.r7) { pts = 7; this.bannerText = "7 POINTS"; APU.sfx('HIT'); }
    else if (dist <= t.r6) { pts = 6; this.bannerText = "6 POINTS"; APU.sfx('HIT'); }
    else if (dist <= t.r5) { pts = 5; this.bannerText = "5 POINTS"; APU.sfx('TICK'); }
    else if (dist <= t.rMax) { pts = 2; this.bannerText = "OUTER RING - 2 PTS"; APU.sfx('TICK'); }
    else { pts = 0; this.bannerText = "MISS!"; APU.sfx('ERROR'); }

    this.totalScore += pts;
    SAVE.setScore(this.id, this.totalScore);

    const hitRecord = { x: this.arrow.targetX, y: this.arrow.targetY, score: pts };
    this.endArrows.push(hitRecord);
    this.allArrows.push(hitRecord);

    if (this.arrowsInEnd >= 3) {
      this.state = 'END_REVIEW';
    } else {
      this.resetArrow();
    }
  },

  // --------------------------------------------------------------------------
  // 4. 256x240 CRT RENDERING
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    const t = this.target;

    // 1. Archery Range Grass & Stand
    g.rect(0, 140, 256, 100, 1);
    g.line(0, 140, 256, 140, 2);

    // Target Wooden Tripod Stand
    g.line(t.x - 24, 175, t.x, t.y, 1);
    g.line(t.x + 24, 175, t.x, t.y, 1);
    g.line(t.x, 185, t.x, t.y, 2);

    // 2. Concentric Target Boss Rings
    g.disc(t.x, t.y, t.rMax, 0); // Backboard
    g.circle(t.x, t.y, t.rMax, 1);
    g.circle(t.x, t.y, t.r5, 1);
    g.circle(t.x, t.y, t.r6, 2);
    g.circle(t.x, t.y, t.r7, 2);
    g.circle(t.x, t.y, t.r8, 3);
    g.circle(t.x, t.y, t.r9, 3);
    g.disc(t.x, t.y, t.r10, 3); // 10-Ring Golden Center

    // Crosslines through target center
    g.line(t.x - t.rMax, t.y, t.x + t.rMax, t.y, 1);
    g.line(t.x, t.y - t.rMax, t.x, t.y + t.rMax, 1);

    // 3. Embedded Arrows in Target (Previous shots)
    for (let a of this.allArrows) {
      const ax = Math.floor(a.x);
      const ay = Math.floor(a.y);
      g.disc(ax, ay, 2, 3);
      g.line(ax, ay, ax + 4, ay - 6, 2); // nock & fletching
    }

    // 4. Reticle & Sway Pointer (During aiming/drawing)
    if (this.state === 'AIM' || this.state === 'DRAW') {
      const swayX = Math.sin(this.swayTime) * 14 + Math.sin(this.swayTime * 2.3) * 6;
      const swayY = Math.cos(this.swayTime * 1.5) * 11 + Math.sin(this.swayTime * 3.1) * 4;
      const rx = Math.floor(this.aimX + swayX);
      const ry = Math.floor(this.aimY + swayY);

      const color = this.state === 'DRAW' ? (this.fatigueShake > 0 ? (this.swayTime % 0.2 < 0.1 ? 3 : 1) : 3) : 2;
      g.circle(rx, ry, 6, color);
      g.line(rx - 9, ry, rx + 9, ry, color);
      g.line(rx, ry - 9, rx, ry + 9, color);
    }

    // 5. Arrow in Flight
    if (this.state === 'FLIGHT') {
      const ax = Math.floor(this.arrow.x);
      const ay = Math.floor(this.arrow.y);
      const sz = Math.max(2, Math.floor(8 - (this.arrow.z / 100) * 5));
      g.line(ax, ay, ax, ay - sz * 3, 3);
      g.tri(ax, ay - sz * 3, ax - sz, ay - sz * 2, ax + sz, ay - sz * 2, 3);
    }

    // 6. Archer's Bow Riser in Foreground
    if (this.state === 'AIM' || this.state === 'DRAW') {
      const bowY = 240;
      g.line(128, bowY, 128, bowY - 45, 3); // Riser
      g.circle(128, bowY - 45, 8, 2); // Sight pin ring
      g.px(128, bowY - 45, 3);
    }

    // 7. Top HUD (Score, Arrows, Wind Vane)
    g.rect(0, 0, 256, 26, 0);
    g.line(0, 26, 256, 26, 2);

    g.text("SCORE: " + this.totalScore, 10, 8, 3);
    g.textC("END " + this.currentEnd + "/5 (" + (3 - this.arrowsInEnd) + " LEFT)", 8, 2);

    // Wind Indicator
    const wx = 224, wy = 12;
    g.text("WIND " + this.windSpeed + "M/S", 152, 8, 2);
    const wdx = Math.cos(this.windAngle) * 9;
    const wdy = Math.sin(this.windAngle) * 9;
    g.line(wx, wy, Math.floor(wx + wdx), Math.floor(wy + wdy), 3);
    g.disc(Math.floor(wx + wdx), Math.floor(wy + wdy), 1, 3);

    // 8. Bottom Bow Draw Meter
    g.rect(0, 214, 256, 26, 0);
    g.line(0, 214, 256, 214, 2);

    if (this.state === 'DRAW') {
      g.box(58, 220, 140, 10, 2);
      const drawProgress = Math.min(1.0, this.drawTime / 1.3);
      const fillW = Math.floor(drawProgress * 138);
      const barColor = this.fatigueShake > 0 ? (this.drawTime % 0.2 < 0.1 ? 3 : 1) : 3;
      g.rect(59, 221, fillW, 8, barColor);
      g.text("DRAW", 20, 222, 3);
      g.textR(this.fatigueShake > 0 ? "TREMBLING!" : "HOLD...", 248, 222, this.fatigueShake > 0 ? 3 : 2);
    } else {
      g.textC("D-PAD: AIM RETICLE    HOLD [A]: DRAW & RELEASE", 222, 2);
    }

    // 9. End Review Screen (Displays 3-Arrow Cluster)
    if (this.state === 'END_REVIEW') {
      g.dither(25, 45, 206, 150, 0, 1);
      g.box(25, 45, 206, 150, 3);
      g.textC("★ END " + this.currentEnd + " RESULTS ★", 58, 3);
      g.line(35, 72, 221, 72, 2);

      let endSum = 0;
      for (let i = 0; i < this.endArrows.length; i++) {
        const sc = this.endArrows[i].score;
        endSum += sc;
        g.text("ARROW " + (i + 1) + ": " + (sc === 10 ? "10 (BULLSEYE!)" : sc + " POINTS"), 46, 84 + i * 16, 2);
      }
      g.line(35, 134, 221, 134, 1);
      g.textC("END TOTAL: " + endSum + " / 30", 144, 3);
      g.textC("[A] CONTINUE TO NEXT END", 168, 3);
    }

    // 10. Final Game Over Screen
    if (this.state === 'GAMEOVER') {
      g.dither(20, 40, 216, 160, 0, 1);
      g.box(20, 40, 216, 160, 3);
      g.textC("★ TOURNAMENT ARCHERY FINALE ★", 54, 3);
      g.line(30, 70, 226, 70, 2);

      g.textC("TOTAL TOURNAMENT SCORE:", 86, 2);
      g.textC(this.totalScore + " / 150 POINTS", 102, 3);

      const rating = this.totalScore >= 135 ? "GOLD OLYMPIAN!" : this.totalScore >= 110 ? "SILVER MARKSMAN" : "BRONZE ARCHER";
      g.textC("HONOR: " + rating, 126, 2);

      g.textC("[A] SHOOT AGAIN", 164, 3);
    }
  }
};
