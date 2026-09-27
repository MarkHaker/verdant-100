// js/cartridges/cart_066_slalom_ski.js
// ============================================================================
// Cartridge #066: SLALOM SKI
// Genre: Racing & Vehicles / Sports (6) | Alpine Downhill Slalom Racing
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[66] = {
  id: 66,
  name: "SLALOM SKI",
  genre: 6,
  scoreLabel: "TIME",
  desc: "ALPINE SLALOM: CARVE GATES IN TIME! [A] TUCK SPEED, [UP] SNOW-PLOW BRAKE, AVOID PENALTIES!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Downhill skier carving between red and blue slalom gate poles
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Red Slalom Pole (Left)
    g.line(x + 6, y + 8, x + 6, y + 26, 3);
    g.rect(x + 6, y + 9, 7, 4, 3);

    // Blue Slalom Pole (Right)
    g.line(x + 24, y + 14, x + 24, y + 30, 2);
    g.rect(x + 18, y + 15, 6, 4, 2);

    // Downhill Skier (Center)
    g.disc(x + 15, y + 13, 2, 3); // helmet
    g.line(x + 15, y + 15, x + 15, y + 21, 3); // torso
    // Skis angled
    g.line(x + 10, y + 24, x + 18, y + 20, 2);
    g.line(x + 12, y + 26, x + 20, y + 22, 2);
    // Ski poles
    g.line(x + 13, y + 18, x + 9, y + 21, 1);
    g.line(x + 17, y + 18, x + 21, y + 21, 1);
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.state = 'RACE'; // 'RACE', 'FINISH', 'CRASH'
    this.skierX = 128;
    this.skierY = 68;
    this.speed = 120; // px/sec
    this.maxSpeed = 220;
    this.carveAngle = 0; // -1 (hard left) to +1 (hard right)
    this.isTucking = false;

    this.raceTime = 0.0;
    this.penalties = 0; // missed gates * 5.0s
    this.courseDist = 0;
    this.totalCourseLength = 5200; // pixels to finish line

    // Slalom Gates (30 gates generated along course)
    this.gates = [];
    this.generateGates();

    // Roadside Pine Trees & Snowdrifts
    this.scenery = [];
    this.generateScenery();

    // Snow spray particles
    this.snowParticles = [];
  },

  generateGates() {
    this.gates = [];
    let curY = 320;
    let side = 1; // 1 = Red (pass left), -1 = Blue (pass right)

    for (let i = 0; i < 28; i++) {
      curY += 150 + Math.random() * 40;
      const gateCenterX = 128 + side * (35 + Math.random() * 45);
      const gateWidth = 42;

      this.gates.push({
        id: i + 1,
        y: curY,
        x0: gateCenterX - gateWidth / 2,
        x1: gateCenterX + gateWidth / 2,
        side: side, // 1: must pass between or right side, -1: left side
        passed: false,
        cleared: false,
        hitPole: false
      });

      side = -side; // Alternate sides
    }

    // Finish line banner
    this.finishLineY = curY + 220;
    this.totalCourseLength = this.finishLineY;
  },

  generateScenery() {
    this.scenery = [];
    for (let y = 100; y < 6000; y += 40) {
      if (Math.random() < 0.7) {
        const side = Math.random() < 0.5 ? -1 : 1;
        const x = side === -1 ? (Math.random() * 45 + 5) : (256 - (Math.random() * 45 + 5));
        this.scenery.push({
          x: x,
          y: y,
          type: Math.random() < 0.8 ? 'TREE' : 'ROCK'
        });
      }
    }
  },

  // --------------------------------------------------------------------------
  // 3. MAIN GAMEPLAY UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    if (dt > 0.05) dt = 0.05;

    // Handle Finish restart
    if (this.state === 'FINISH') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || TOUCH.down) {
        this.init();
      }
      return;
    }

    this.raceTime += dt;

    // 1. PLAYER INPUT & SKI CARVING PHYSICS
    let steerDir = 0;
    if (PAD.state.left || (TOUCH.held && TOUCH.x < 100)) steerDir -= 1;
    if (PAD.state.right || (TOUCH.held && TOUCH.x > 156)) steerDir += 1;

    // Aerodynamic Tuck [Down] or [A]
    this.isTucking = PAD.state.a || PAD.state.down;

    // Snow-plow Brake [Up] or [B]
    const isBraking = PAD.state.up || PAD.state.b;

    if (this.isTucking) {
      this.speed = Math.min(this.maxSpeed, this.speed + 60 * dt);
      // Turning is stiffer when tucking
      this.carveAngle += steerDir * 2.2 * dt;
    } else if (isBraking) {
      this.speed = Math.max(70, this.speed - 120 * dt);
      this.carveAngle += steerDir * 4.5 * dt;
    } else {
      // Natural cruising speed
      const targetSpeed = 145;
      this.speed += (targetSpeed - this.speed) * 1.5 * dt;
      this.carveAngle += steerDir * 3.6 * dt;
    }

    // Natural centering friction
    if (steerDir === 0) {
      this.carveAngle *= Math.pow(0.85, dt * 60);
    }
    this.carveAngle = Math.max(-1.0, Math.min(1.0, this.carveAngle));

    // Lateral movement
    this.skierX += this.carveAngle * (this.speed * 0.95) * dt;
    this.skierX = Math.max(16, Math.min(240, this.skierX));

    // Downhill advance
    this.courseDist += this.speed * dt;

    // Snow spray particles
    if (Math.abs(this.carveAngle) > 0.25 || isBraking) {
      if (Math.random() < 0.6) {
        this.snowParticles.push({
          x: this.skierX + (this.carveAngle > 0 ? -6 : 6),
          y: this.skierY + 12,
          vx: (this.carveAngle > 0 ? -1 : 1) * (40 + Math.random() * 30),
          vy: -this.speed * 0.4,
          life: 0.22
        });
      }
    }

    // Update snow particles
    for (let i = this.snowParticles.length - 1; i >= 0; i--) {
      const sp = this.snowParticles[i];
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.life -= dt;
      if (sp.life <= 0) this.snowParticles.splice(i, 1);
    }

    // 2. GATE PASSING & PENALTY CHECKS
    for (let g of this.gates) {
      const screenY = g.y - this.courseDist + this.skierY;

      // When gate crosses skier Y level
      if (!g.passed && screenY <= this.skierY) {
        g.passed = true;

        // Check if skier passed between the gate poles
        const inGateX = (this.skierX >= g.x0 && this.skierX <= g.x1);
        // Correct side check:
        // side 1 (Red flag): skier must pass inside gate
        if (inGateX) {
          g.cleared = true;
          APU.sfx('COIN');
        } else {
          // Missed gate! +5 second penalty
          g.cleared = false;
          this.penalties += 5.0;
          APU.sfx('ERROR');
        }

        // Check pole collision clip
        if (Math.abs(this.skierX - g.x0) < 6 || Math.abs(this.skierX - g.x1) < 6) {
          g.hitPole = true;
          APU.sfx('HIT');
        }
      }
    }

    // 3. FINISH LINE REACHED
    const finishScreenY = this.finishLineY - this.courseDist + this.skierY;
    if (finishScreenY <= this.skierY && this.state !== 'FINISH') {
      this.state = 'FINISH';
      APU.sfx('FANFARE');
      const finalTime = this.raceTime + this.penalties;
      // High score stored as inverse or seconds (lower is better, score = 10000 - time*100)
      const scoreVal = Math.max(0, Math.floor(10000 - finalTime * 100));
      SAVE.setScore(this.id, scoreVal);
    }
  },

  // --------------------------------------------------------------------------
  // 4. 256x240 CRT RENDERING
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    // 1. Snow Slope Background
    g.rect(0, 0, 256, 240, 0);

    // Ski tracks carving through snow
    for (let i = 0; i < 8; i++) {
      const trackY = (this.raceTime * 80 + i * 32) % 240;
      g.line(120, trackY, 122, trackY + 12, 1);
    }

    // 2. Roadside Scenery (Trees / Rocks)
    for (let sc of this.scenery) {
      const sy = Math.floor(sc.y - this.courseDist + this.skierY);
      if (sy > -30 && sy < 270) {
        if (sc.type === 'TREE') {
          // Pine tree
          g.tri(sc.x, sy - 18, sc.x - 9, sy, sc.x + 9, sy, 1);
          g.tri(sc.x, sy - 12, sc.x - 7, sy - 2, sc.x + 7, sy - 2, 2);
          g.line(sc.x, sy, sc.x, sy + 4, 1);
        } else {
          // Snow boulder
          g.disc(sc.x, sy, 6, 1);
          g.circle(sc.x, sy, 6, 2);
        }
      }
    }

    // 3. Finish Line Banner
    const finishScreenY = Math.floor(this.finishLineY - this.courseDist + this.skierY);
    if (finishScreenY > -30 && finishScreenY < 270) {
      // Checkered banner
      g.line(20, finishScreenY, 236, finishScreenY, 3);
      g.box(20, finishScreenY - 14, 216, 14, 2);
      g.textC("★ FINISH LINE ★", finishScreenY - 10, 3);
      // Gantry posts
      g.line(20, finishScreenY, 20, finishScreenY + 24, 3);
      g.line(236, finishScreenY, 236, finishScreenY + 24, 3);
    }

    // 4. Slalom Gates (Poles & Flags)
    for (let gt of this.gates) {
      const sy = Math.floor(gt.y - this.courseDist + this.skierY);
      if (sy > -30 && sy < 270) {
        const flagColor = gt.side === 1 ? 3 : 2; // Red = bright, Blue = mid

        // Left pole
        g.line(Math.floor(gt.x0), sy - 18, Math.floor(gt.x0), sy + 4, flagColor);
        g.rect(Math.floor(gt.x0), sy - 17, 8, 6, flagColor);

        // Right pole
        g.line(Math.floor(gt.x1), sy - 18, Math.floor(gt.x1), sy + 4, flagColor);
        g.rect(Math.floor(gt.x1) - 8, sy - 17, 8, 6, flagColor);

        // Gate pass indicator banner
        if (gt.passed) {
          g.text(gt.cleared ? "OK" : "+5S", Math.floor((gt.x0 + gt.x1) / 2) - 6, sy - 8, gt.cleared ? 2 : 3);
        }
      }
    }

    // 5. Snow Spray Particles
    for (let p of this.snowParticles) {
      g.disc(Math.floor(p.x), Math.floor(p.y), 2, 2);
    }

    // 6. Skier Sprite (Foreground)
    const sx = Math.floor(this.skierX);
    const sy = Math.floor(this.skierY);

    if (this.isTucking) {
      // Aerodynamic low tuck crouch
      g.disc(sx, sy + 2, 4, 3); // Helmet
      g.rect(sx - 4, sy + 6, 8, 7, 2); // Body
      // Skis parallel straight
      g.line(sx - 5, sy + 4, sx - 5, sy + 18, 3);
      g.line(sx + 5, sy + 4, sx + 5, sy + 18, 3);
    } else {
      // Upright carving pose
      g.disc(sx, sy - 2, 4, 3); // Helmet & goggles
      g.rect(sx - 3, sy + 2, 6, 9, 2); // Body

      // Skis angled based on carveAngle
      const skiDx = Math.floor(this.carveAngle * 7);
      g.line(sx - 5 - skiDx, sy + 4, sx - 5 + skiDx, sy + 18, 3);
      g.line(sx + 5 - skiDx, sy + 4, sx + 5 + skiDx, sy + 18, 3);

      // Ski poles
      g.line(sx - 4, sy + 5, sx - 11, sy + 14, 1);
      g.line(sx + 4, sy + 5, sx + 11, sy + 14, 1);
    }

    // 7. Top HUD (Live Clock, Speed, Penalties)
    g.rect(0, 0, 256, 26, 0);
    g.line(0, 26, 256, 26, 2);

    const totalSeconds = (this.raceTime + this.penalties).toFixed(2);
    g.text("TIME: " + totalSeconds + "S", 10, 8, 3);

    if (this.penalties > 0) {
      g.text("(+" + Math.floor(this.penalties) + "S PEN)", 100, 8, 3);
    }

    const spdKmh = Math.floor(this.speed * 0.6);
    g.textR(spdKmh + " KM/H", 246, 8, 2);

    // 8. Bottom Status Prompt
    g.rect(0, 214, 256, 26, 0);
    g.line(0, 214, 256, 214, 2);
    g.textC("LEFT/RIGHT: CARVE    HOLD [A]: TUCK SPEED    [UP]: BRAKE", 222, 2);

    // 9. Finish Line Podium Overlay
    if (this.state === 'FINISH') {
      g.dither(25, 45, 206, 150, 0, 1);
      g.box(25, 45, 206, 150, 3);
      g.textC("★ DOWNHILL RACE FINISHED! ★", 60, 3);
      g.line(35, 74, 221, 74, 2);

      g.textC("RAW RACE TIME: " + this.raceTime.toFixed(2) + "S", 88, 2);
      g.textC("PENALTY TIME:  +" + this.penalties.toFixed(2) + "S", 102, 2);
      g.textC("FINAL OFFICIAL TIME: " + (this.raceTime + this.penalties).toFixed(2) + "S", 120, 3);

      const fTime = this.raceTime + this.penalties;
      const medal = fTime < 38 ? "GOLD MEDAL! (OLYMPIC RECORD)" : fTime < 46 ? "SILVER MEDAL" : "BRONZE MEDAL";
      g.textC("MEDAL: " + medal, 142, 2);

      g.textC("[A] SKI DOWNHILL AGAIN", 170, 3);
    }
  }
};
