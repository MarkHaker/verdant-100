// js/cartridges/cart_062_retro_golf.js
// ============================================================================
// Cartridge #062: RETRO GOLF
// Genre: Racing & Vehicles / Sports (6) | 9-Hole Top-Down Precision Golf
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[62] = {
  id: 62,
  name: "RETRO GOLF",
  genre: 6,
  scoreLabel: "SCORE",
  desc: "9-HOLE PRECISION GOLF: [B] CLUB, D-PAD AIM, [A] POWER & ACCURACY METER, WATCH THE WIND!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Golf ball on tee, flagstick on undulating green, flying ball arc
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Putting Green oval
    g.oval(x + 20, y + 21, 9, 6, 2);
    // Hole Cup
    g.disc(x + 22, y + 20, 2, 0);
    // Flagstick
    g.line(x + 22, y + 20, x + 22, y + 8, 3);
    // Triangular Flag
    g.tri(x + 22, y + 8, x + 16, y + 11, x + 22, y + 14, 3);

    // Tee & Ball
    g.line(x + 7, y + 24, x + 7, y + 26, 1);
    g.disc(x + 7, y + 22, 3, 3);
    g.px(x + 6, y + 21, 2);

    // Ball Flight dotted arc
    g.px(x + 10, y + 17, 2);
    g.px(x + 13, y + 14, 3);
    g.px(x + 16, y + 14, 2);
    g.px(x + 19, y + 16, 2);
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.holes = [
      { par: 3, tee: { x: 40, y: 190 }, pin: { x: 210, y: 60 }, hazards: [{ type: 'WATER', x: 120, y: 130, r: 24 }, { type: 'SAND', x: 190, y: 55, r: 16 }] },
      { par: 4, tee: { x: 30, y: 200 }, pin: { x: 220, y: 50 }, hazards: [{ type: 'SAND', x: 110, y: 140, r: 20 }, { type: 'WATER', x: 160, y: 90, r: 22 }, { type: 'SAND', x: 205, y: 65, r: 14 }] },
      { par: 5, tee: { x: 30, y: 210 }, pin: { x: 225, y: 45 }, hazards: [{ type: 'WATER', x: 90, y: 160, r: 26 }, { type: 'WATER', x: 160, y: 110, r: 26 }, { type: 'SAND', x: 210, y: 60, r: 16 }] },
      { par: 3, tee: { x: 50, y: 180 }, pin: { x: 190, y: 70 }, hazards: [{ type: 'WATER', x: 128, y: 120, r: 32 }] },
      { par: 4, tee: { x: 35, y: 195 }, pin: { x: 215, y: 55 }, hazards: [{ type: 'SAND', x: 100, y: 150, r: 18 }, { type: 'SAND', x: 170, y: 100, r: 20 }] },
      { par: 4, tee: { x: 40, y: 200 }, pin: { x: 220, y: 50 }, hazards: [{ type: 'WATER', x: 130, y: 125, r: 28 }, { type: 'SAND', x: 200, y: 70, r: 15 }] },
      { par: 3, tee: { x: 60, y: 190 }, pin: { x: 180, y: 65 }, hazards: [{ type: 'SAND', x: 165, y: 75, r: 16 }, { type: 'SAND', x: 195, y: 55, r: 16 }] },
      { par: 5, tee: { x: 30, y: 210 }, pin: { x: 225, y: 40 }, hazards: [{ type: 'WATER', x: 110, y: 150, r: 25 }, { type: 'SAND', x: 175, y: 95, r: 22 }] },
      { par: 4, tee: { x: 35, y: 205 }, pin: { x: 215, y: 45 }, hazards: [{ type: 'WATER', x: 125, y: 125, r: 30 }, { type: 'SAND', x: 200, y: 60, r: 18 }] }
    ];

    this.currentHoleIdx = 0;
    this.totalStrokes = 0;
    this.coursePar = this.holes.reduce((sum, h) => sum + h.par, 0);
    this.holeScores = [];

    this.clubs = [
      { name: "DRIVER", maxDist: 150, loft: 1.0, isPutter: false },
      { name: "5-IRON", maxDist: 105, loft: 0.8, isPutter: false },
      { name: "WEDGE",  maxDist: 60,  loft: 1.4, isPutter: false },
      { name: "PUTTER", maxDist: 35,  loft: 0.0, isPutter: true }
    ];
    this.clubIdx = 0;

    this.loadHole(0);
  },

  loadHole(idx) {
    this.currentHoleIdx = idx;
    const h = this.holes[idx];
    this.ball = {
      x: h.tee.x,
      y: h.tee.y,
      vx: 0,
      vy: 0,
      z: 0, // Height in air
      vz: 0,
      inAir: false,
      lastGoodX: h.tee.x,
      lastGoodY: h.tee.y
    };

    this.holeStrokes = 0;
    this.state = 'AIM'; // 'AIM', 'POWER', 'ACCURACY', 'FLIGHT', 'HOLE_IN', 'SCORECARD'
    this.resultBanner = "";
    this.bannerTimer = 0;

    // Wind (Direction angle & Speed in mph)
    this.windAngle = Math.random() * Math.PI * 2;
    this.windSpeed = Math.floor(Math.random() * 12 + 2); // 2 to 14 mph

    // Default aim angle directly towards pin
    this.aimAngle = Math.atan2(h.pin.y - this.ball.y, h.pin.x - this.ball.x);

    // Auto-select club based on distance
    this.autoSelectClub();

    // Swing meter variables
    this.meterPower = 0;
    this.meterDir = 1;
    this.meterAccuracy = 0;
    this.meterAccDir = 1;
    this.meterSpeed = 2.4;
  },

  autoSelectClub() {
    const h = this.holes[this.currentHoleIdx];
    const dist = Math.hypot(h.pin.x - this.ball.x, h.pin.y - this.ball.y);
    if (dist < 30) this.clubIdx = 3; // PUTTER
    else if (dist < 65) this.clubIdx = 2; // WEDGE
    else if (dist < 110) this.clubIdx = 1; // 5-IRON
    else this.clubIdx = 0; // DRIVER
  },

  // --------------------------------------------------------------------------
  // 3. MAIN GAMEPLAY UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    if (dt > 0.05) dt = 0.05;

    // Handle end-of-game scorecard
    if (this.state === 'SCORECARD') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || TOUCH.down) {
        this.init();
      }
      return;
    }

    // Handle Hole In transition banner
    if (this.state === 'HOLE_IN') {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) {
        if (this.currentHoleIdx + 1 < this.holes.length) {
          this.loadHole(this.currentHoleIdx + 1);
        } else {
          this.state = 'SCORECARD';
          const finalScore = Math.max(0, 1000 + (this.coursePar - this.totalStrokes) * 100);
          SAVE.setScore(this.id, finalScore);
        }
      }
      return;
    }

    // 1. AIM PHASE
    if (this.state === 'AIM') {
      if (PAD.state.left) this.aimAngle -= 1.6 * dt;
      if (PAD.state.right) this.aimAngle += 1.6 * dt;

      // Cycle club [B]
      if (PAD.hit('b')) {
        this.clubIdx = (this.clubIdx + 1) % this.clubs.length;
        APU.sfx('SELECT');
      }

      // Start swing meter [A]
      if (PAD.hit('a') || (TOUCH.down && TOUCH.y > 180)) {
        this.state = 'POWER';
        this.meterPower = 0;
        this.meterDir = 1;
        APU.sfx('TICK');
      }
      return;
    }

    // 2. POWER METER PHASE
    if (this.state === 'POWER') {
      this.meterPower += this.meterDir * this.meterSpeed * dt;
      if (this.meterPower >= 1.0) {
        this.meterPower = 1.0;
        this.meterDir = -1;
      } else if (this.meterPower <= 0.0) {
        this.meterPower = 0.0;
        this.meterDir = 1;
      }

      // Lock in power on [A]
      if (PAD.hit('a') || TOUCH.down) {
        this.state = 'ACCURACY';
        this.meterAccuracy = -1.0;
        this.meterAccDir = 1;
        APU.sfx('CONFIRM');
      }
      return;
    }

    // 3. ACCURACY METER PHASE
    if (this.state === 'ACCURACY') {
      this.meterAccuracy += this.meterAccDir * (this.meterSpeed * 1.8) * dt;
      if (this.meterAccuracy >= 1.0) {
        this.meterAccuracy = 1.0;
        this.meterAccDir = -1;
      } else if (this.meterAccuracy <= -1.0) {
        this.meterAccuracy = -1.0;
        this.meterAccDir = 1;
      }

      // Strike ball on [A]
      if (PAD.hit('a') || TOUCH.down) {
        this.strikeBall();
      }
      return;
    }

    // 4. BALL FLIGHT & ROLLING
    if (this.state === 'FLIGHT') {
      const b = this.ball;
      const club = this.clubs[this.clubIdx];

      // In air flight
      if (b.inAir) {
        b.z += b.vz * dt;
        b.vz -= 9.8 * 8.0 * dt; // Gravity

        // Wind drift in air
        b.vx += Math.cos(this.windAngle) * (this.windSpeed * 1.4) * dt;
        b.vy += Math.sin(this.windAngle) * (this.windSpeed * 1.4) * dt;

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Ball touchdown
        if (b.z <= 0) {
          b.z = 0;
          b.vz = -b.vz * 0.35; // Bounce restitution
          if (Math.abs(b.vz) < 12) {
            b.inAir = false;
            b.vz = 0;
          }
          APU.sfx('HIT');
        }
      } else {
        // Ground rolling with terrain friction
        const terrain = this.getTerrainAt(b.x, b.y);
        let friction = 0.94; // Fairway
        if (terrain === 'ROUGH') friction = 0.82;
        else if (terrain === 'SAND') friction = 0.65;
        else if (terrain === 'GREEN') friction = 0.96;

        b.vx *= Math.pow(friction, dt * 60);
        b.vy *= Math.pow(friction, dt * 60);

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Check Water Hazard
        if (terrain === 'WATER') {
          APU.sfx('ERROR');
          this.ball.x = this.ball.lastGoodX;
          this.ball.y = this.ball.lastGoodY;
          this.ball.vx = 0;
          this.ball.vy = 0;
          this.holeStrokes++; // Penalty stroke
          this.totalStrokes++;
          this.state = 'AIM';
          this.autoSelectClub();
          return;
        }

        // Check Cup / Hole Sink
        const h = this.holes[this.currentHoleIdx];
        const distToPin = Math.hypot(h.pin.x - b.x, h.pin.y - b.y);
        if (distToPin < 4.5 && Math.hypot(b.vx, b.vy) < 25) {
          // Sunk in hole!
          this.ball.x = h.pin.x;
          this.ball.y = h.pin.y;
          this.ball.vx = 0;
          this.ball.vy = 0;
          this.state = 'HOLE_IN';
          this.bannerTimer = 2.2;
          this.holeScores.push({ par: h.par, score: this.holeStrokes });
          this.evaluateHoleScore();
          APU.sfx('FANFARE');
          return;
        }

        // Ball stopped rolling
        if (Math.hypot(b.vx, b.vy) < 1.0) {
          b.vx = 0;
          b.vy = 0;
          b.lastGoodX = b.x;
          b.lastGoodY = b.y;
          this.state = 'AIM';
          this.autoSelectClub();
          this.aimAngle = Math.atan2(h.pin.y - b.y, h.pin.x - b.x);
        }
      }
    }
  },

  strikeBall() {
    const club = this.clubs[this.clubIdx];
    this.holeStrokes++;
    this.totalStrokes++;
    this.state = 'FLIGHT';

    // Hook / Slice angle deviation from accuracy meter
    const deviation = this.meterAccuracy * 0.22; // up to ~12 degrees off-center
    const launchAngle = this.aimAngle + deviation;
    const powerDist = club.maxDist * Math.max(0.15, this.meterPower);

    if (club.isPutter) {
      // Putter stays on ground
      this.ball.vx = Math.cos(launchAngle) * (powerDist * 2.2);
      this.ball.vy = Math.sin(launchAngle) * (powerDist * 2.2);
      this.ball.inAir = false;
      this.ball.z = 0;
      this.ball.vz = 0;
      APU.sfx('TICK');
    } else {
      // Air shot with loft
      const speed = powerDist * 1.5;
      this.ball.vx = Math.cos(launchAngle) * speed;
      this.ball.vy = Math.sin(launchAngle) * speed;
      this.ball.vz = speed * club.loft * 0.7;
      this.ball.inAir = true;
      APU.sfx('HIT');
    }
  },

  getTerrainAt(x, y) {
    const h = this.holes[this.currentHoleIdx];
    // Check Green around pin
    if (Math.hypot(h.pin.x - x, h.pin.y - y) < 22) return 'GREEN';
    // Check Hazards
    for (let haz of h.hazards) {
      if (Math.hypot(haz.x - x, haz.y - y) < haz.r) return haz.type;
    }
    // Check Fairway bounds (simple corridor)
    if (x < 15 || x > 240 || y < 25 || y > 225) return 'ROUGH';
    return 'FAIRWAY';
  },

  evaluateHoleScore() {
    const diff = this.holeStrokes - this.holes[this.currentHoleIdx].par;
    if (this.holeStrokes === 1) this.resultBanner = "HOLE IN ONE!!!";
    else if (diff <= -3) this.resultBanner = "ALBATROSS!";
    else if (diff === -2) this.resultBanner = "EAGLE!";
    else if (diff === -1) this.resultBanner = "BIRDIE!";
    else if (diff === 0) this.resultBanner = "PAR";
    else if (diff === 1) this.resultBanner = "BOGEY";
    else if (diff === 2) this.resultBanner = "DOUBLE BOGEY";
    else this.resultBanner = "+" + diff + " OVER PAR";
  },

  // --------------------------------------------------------------------------
  // 4. 256x240 CRT RENDERING
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    const h = this.holes[this.currentHoleIdx];

    // 1. Draw Rough Background
    g.rect(10, 26, 236, 186, 0);
    g.box(10, 26, 236, 186, 1);

    // 2. Draw Fairway Corridor
    g.oval(128, 120, 105, 75, 1);

    // 3. Draw Water Hazards & Sand Bunkers
    for (let haz of h.hazards) {
      if (haz.type === 'WATER') {
        g.disc(haz.x, haz.y, haz.r, 0);
        g.circle(haz.x, haz.y, haz.r, 2);
        // Water wave ripples
        g.line(haz.x - 6, haz.y - 4, haz.x + 6, haz.y - 4, 1);
        g.line(haz.x - 8, haz.y + 4, haz.x + 4, haz.y + 4, 1);
      } else { // SAND
        g.disc(haz.x, haz.y, haz.r, 2);
        g.circle(haz.x, haz.y, haz.r, 1);
        g.px(haz.x - 4, haz.y, 3);
        g.px(haz.x + 3, haz.y - 2, 3);
      }
    }

    // 4. Draw Putting Green
    g.oval(h.pin.x, h.pin.y, 22, 16, 2);
    g.circle(h.pin.x, h.pin.y, 22, 3);

    // 5. Hole Cup & Flagstick
    g.disc(h.pin.x, h.pin.y, 3, 0);
    g.line(h.pin.x, h.pin.y, h.pin.x, h.pin.y - 14, 3);
    g.tri(h.pin.x, h.pin.y - 14, h.pin.x - 7, h.pin.y - 11, h.pin.x, h.pin.y - 8, 3);

    // 6. Aim Guide Line (when aiming)
    if (this.state === 'AIM' || this.state === 'POWER' || this.state === 'ACCURACY') {
      const club = this.clubs[this.clubIdx];
      const maxAimLen = Math.min(80, club.maxDist * 0.7);
      const targetX = this.ball.x + Math.cos(this.aimAngle) * maxAimLen;
      const targetY = this.ball.y + Math.sin(this.aimAngle) * maxAimLen;
      g.line(Math.floor(this.ball.x), Math.floor(this.ball.y), Math.floor(targetX), Math.floor(targetY), 1);
      g.circle(Math.floor(targetX), Math.floor(targetY), 3, 2);
    }

    // 7. Golf Ball & Air Shadow
    if (this.ball.inAir && this.ball.z > 0) {
      // Ground shadow
      g.disc(Math.floor(this.ball.x), Math.floor(this.ball.y), 2, 1);
      // Elevated ball
      const ballY = Math.floor(this.ball.y - this.ball.z * 0.4);
      g.disc(Math.floor(this.ball.x), ballY, 3, 3);
    } else {
      // Grounded ball
      g.disc(Math.floor(this.ball.x), Math.floor(this.ball.y), 3, 3);
      g.px(Math.floor(this.ball.x), Math.floor(this.ball.y), 0);
    }

    // 8. Top HUD (Hole #, Par, Strokes, Wind)
    g.rect(0, 0, 256, 24, 0);
    g.line(0, 24, 256, 24, 2);
    g.text("HOLE " + (this.currentHoleIdx + 1) + "/9", 10, 8, 3);
    g.text("PAR " + h.par, 74, 8, 2);
    g.text("STROKE " + (this.holeStrokes + 1), 126, 8, 3);

    // Wind Indicator
    const wx = 210, wy = 12;
    g.text("WIND", 182, 8, 2);
    const wdx = Math.cos(this.windAngle) * 9;
    const wdy = Math.sin(this.windAngle) * 9;
    g.line(wx, wy, Math.floor(wx + wdx), Math.floor(wy + wdy), 3);
    g.disc(Math.floor(wx + wdx), Math.floor(wy + wdy), 1, 3);

    // 9. Bottom Control Panel (Club selection & Swing Meter)
    g.rect(0, 214, 256, 26, 0);
    g.line(0, 214, 256, 214, 2);

    const club = this.clubs[this.clubIdx];
    g.text("[B] " + club.name, 10, 222, 3);

    // Swing Meter Display
    if (this.state === 'POWER') {
      g.box(100, 220, 100, 10, 2);
      g.rect(101, 221, Math.floor(this.meterPower * 98), 8, 3);
      g.textR("PWR", 94, 222, 2);
    } else if (this.state === 'ACCURACY') {
      g.box(100, 220, 100, 10, 2);
      // Sweet spot center mark
      g.line(150, 218, 150, 232, 3);
      // Accuracy slider
      const curX = Math.floor(150 + this.meterAccuracy * 46);
      g.line(curX, 220, curX, 230, 3);
      g.disc(curX, 225, 2, 3);
      g.textR("SNAP", 94, 222, 3);
    } else {
      const distToHole = Math.floor(Math.hypot(h.pin.x - this.ball.x, h.pin.y - this.ball.y));
      g.text("DIST: " + distToHole + "YD", 110, 222, 2);
      g.textR("[A] SWING", 246, 222, 3);
    }

    // 10. Hole In Banner Overlay
    if (this.state === 'HOLE_IN') {
      g.dither(30, 85, 196, 50, 0, 1);
      g.box(30, 85, 196, 50, 3);
      g.textC(this.resultBanner, 97, 3);
      g.textC("STROKES: " + this.holeStrokes + " (PAR " + h.par + ")", 112, 2);
    }

    // 11. Final 9-Hole Scorecard
    if (this.state === 'SCORECARD') {
      g.dither(20, 30, 216, 180, 0, 1);
      g.box(20, 30, 216, 180, 3);
      g.textC("★ 9-HOLE TOURNAMENT SCORECARD ★", 42, 3);
      g.line(30, 56, 226, 56, 2);

      let totalPar = 0;
      let totalStr = 0;
      for (let i = 0; i < this.holeScores.length; i++) {
        const sc = this.holeScores[i];
        totalPar += sc.par;
        totalStr += sc.score;
        const col = i < 5 ? 36 : 136;
        const row = 68 + (i % 5) * 16;
        g.text("H" + (i + 1) + ": " + sc.score + " (P" + sc.par + ")", col, row, 2);
      }

      g.line(30, 154, 226, 154, 2);
      const diff = totalStr - totalPar;
      const diffStr = diff === 0 ? "EVEN PAR" : diff > 0 ? ("+" + diff + " OVER") : (diff + " UNDER");
      g.textC("TOTAL: " + totalStr + " (" + diffStr + ")", 166, 3);
      g.textC("[A] PLAY 9 HOLES AGAIN", 188, 3);
    }
  }
};
