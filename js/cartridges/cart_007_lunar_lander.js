// js/cartridges/cart_007_lunar_lander.js
// ============================================================================
// Cartridge #007: LUNAR LANDER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 7. LUNAR LANDER
CARTS[7] = {
  id: 7,
  name: "LUNAR LANDER",
  genre: 0,
  scoreLabel: "PTS",
  desc: "PILOT APOLLO LEM TO LUNAR CRAGS. TOUCHDOWN GENTLY (V<35, H<20, ATT<15 DEG) ON DESIGNATED PADS.",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Craggy lunar mountain line
    g.line(x + 2, y + 26, x + 8, y + 21, 2);
    g.line(x + 8, y + 21, x + 12, y + 25, 2);
    // Flat Landing Pad
    g.line(x + 12, y + 25, x + 22, y + 25, 3);
    g.line(x + 12, y + 24, x + 12, y + 22, 3);
    g.line(x + 22, y + 24, x + 22, y + 22, 3);
    // Ridge beyond pad
    g.line(x + 22, y + 25, x + 26, y + 19, 2);
    g.line(x + 26, y + 19, x + 30, y + 27, 2);
    // Apollo LEM silhouette descending
    g.rect(x + 14, y + 11, 6, 5, 3);
    g.line(x + 15, y + 9, x + 19, y + 9, 2);
    // Struts & footpads
    g.line(x + 13, y + 18, x + 15, y + 15, 2);
    g.line(x + 21, y + 18, x + 19, y + 15, 2);
    g.line(x + 12, y + 18, x + 14, y + 18, 3);
    g.line(x + 20, y + 18, x + 22, y + 18, 3);
    // Thruster plume
    g.line(x + 17, y + 16, x + 17, y + 20, 3);
  },

  init() {
    this.score = 0;
    this.mission = 1;
    this.lives = 3;
    this.highScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;
    this.time = 0;
    this.state = 'FLYING'; // 'FLYING' | 'LANDED' | 'CRASHED'

    this.dustParticles = [];
    this.explosionParticles = [];
    this.rcsPuffParticles = [];

    this.thrustSoundTimer = 0;
    this.rcsSoundTimer = 0;
    this.alarmSoundTimer = 0;
    this.explosionTimer = 0;

    this.touchLeft = false;
    this.touchRight = false;
    this.touchThrust = false;

    // Fixed background star field
    this.stars = [];
    for (let i = 0; i < 28; i++) {
      this.stars.push({
        x: (i * 37 + 11) % 254 + 1,
        y: (i * 23 + 31) % 110 + 32,
        twinkleRate: 1.5 + (i % 4) * 0.7
      });
    }

    this.startMission(this.mission, 500);
  },

  startMission(missionNum, startFuel) {
    this.mission = missionNum;
    this.fuel = startFuel;
    this.x = 35 + Math.floor(Math.random() * 75);
    this.y = 28;
    this.vx = 14 + Math.floor(Math.random() * 16);
    this.vy = 2;
    this.angle = 0;
    this.thrusting = false;
    this.state = 'FLYING';
    this.crashReason = '';

    this.lastPadMult = 1;
    this.lastPadScore = 0;
    this.lastFuelScore = 0;
    this.lastSoftScore = 0;

    this.dustParticles = [];
    this.explosionParticles = [];
    this.rcsPuffParticles = [];

    this.generateTerrain(this.mission);
  },

  generateTerrain(mission) {
    const pts = [];
    const m = mission || 1;

    // Difficulty scaling for pad widths
    const pad1W = Math.max(28, 38 - m * 2);             // Easy (2X) pad: 36 -> 34 -> 32 -> 30 -> 28
    const pad2W = Math.max(20, 26 - m);                 // Medium (3X) pad: 24 -> 23 -> 22 -> 21 -> 20
    const pad3W = Math.max(14, 18 - Math.floor(m / 2)); // Hard (5X) pad: 17 -> 16 -> 15 -> 14

    // Fixed yet mission-varied pad locations across the 3 horizontal sectors
    const p1_x0 = 30 + (m * 7) % 18;
    const p1_x1 = p1_x0 + pad1W;
    const p1_y = 204 + (m * 5) % 10;

    const p2_x0 = 114 + (m * 11) % 16;
    const p2_x1 = p2_x0 + pad2W;
    const p2_y = 182 + (m * 9) % 12;

    const p3_x0 = 196 + (m * 13) % 14;
    const p3_x1 = p3_x0 + pad3W;
    const p3_y = 170 + (m * 7) % 12;

    const pad1 = { x0: p1_x0, x1: p1_x1, y: p1_y, w: pad1W, mult: 2, label: "2X" };
    const pad2 = { x0: p2_x0, x1: p2_x1, y: p2_y, w: pad2W, mult: 3, label: "3X" };
    const pad3 = { x0: p3_x0, x1: p3_x1, y: p3_y, w: pad3W, mult: 5, label: "5X" };
    this.pads = [pad1, pad2, pad3];

    // Build the jagged vector moonscape from x = 0 to x = 256
    // Sector 1: Left crater wall to Easy Pad
    pts.push({ x: 0, y: 192 + (m * 3) % 10 });
    pts.push({ x: Math.floor(p1_x0 * 0.42), y: 172 + (m * 8) % 16 });
    pts.push({ x: Math.floor(p1_x0 * 0.76), y: 210 - (m * 4) % 8 });

    // Pad 1 (Flat plateau)
    pts.push({ x: p1_x0, y: p1_y });
    pts.push({ x: p1_x1, y: p1_y });

    // Sector 2: Between Pad 1 and Pad 2 (High jagged peaks and crater depression)
    const gap1 = p2_x0 - p1_x1;
    pts.push({ x: Math.floor(p1_x1 + gap1 * 0.28), y: 138 - Math.min(16, m * 2) }); // Towering peak
    pts.push({ x: Math.floor(p1_x1 + gap1 * 0.54), y: 168 });
    pts.push({ x: Math.floor(p1_x1 + gap1 * 0.78), y: 218 }); // Deep crater basin

    // Pad 2 (Elevated mesa)
    pts.push({ x: p2_x0, y: p2_y });
    pts.push({ x: p2_x1, y: p2_y });

    // Sector 3: Between Pad 2 and Pad 3 (Jagged ridge with needle peak flanking Pad 3)
    const gap2 = p3_x0 - p2_x1;
    pts.push({ x: Math.floor(p2_x1 + gap2 * 0.32), y: 146 - Math.min(14, m * 2) });
    pts.push({ x: Math.floor(p2_x1 + gap2 * 0.64), y: 196 });
    pts.push({ x: Math.floor(p2_x1 + gap2 * 0.88), y: 148 - Math.min(12, m * 2) }); // Crag pinnacle left of Pad 3

    // Pad 3 (Hard, tucked tightly between needle crags)
    pts.push({ x: p3_x0, y: p3_y });
    pts.push({ x: p3_x1, y: p3_y });

    // Sector 4: From Pad 3 to Right border x=256
    const gap3 = 256 - p3_x1;
    pts.push({ x: Math.floor(p3_x1 + gap3 * 0.22), y: 144 - Math.min(14, m * 2) }); // Crag pinnacle right of Pad 3
    pts.push({ x: Math.floor(p3_x1 + gap3 * 0.58), y: 204 });
    pts.push({ x: Math.floor(p3_x1 + gap3 * 0.84), y: 176 });
    pts.push({ x: 256, y: 195 });

    this.terrain = pts;
  },

  getGroundY(x) {
    x = Math.max(0, Math.min(256, x));
    const pts = this.terrain;
    for (let i = 0; i < pts.length - 1; i++) {
      if (x >= pts[i].x && x <= pts[i + 1].x) {
        const dx = pts[i + 1].x - pts[i].x;
        if (dx === 0) return pts[i].y;
        const t = (x - pts[i].x) / dx;
        return pts[i].y + t * (pts[i + 1].y - pts[i].y);
      }
    }
    return 220;
  },

  getPadUnder(footLX, footRX) {
    for (let pad of this.pads) {
      if (footLX >= pad.x0 - 2.5 && footRX <= pad.x1 + 2.5) {
        return pad;
      }
    }
    return null;
  },

  transformPoint(cx, cy, cosA, sinA, lx, ly) {
    return {
      x: cx + lx * cosA - ly * sinA,
      y: cy + lx * sinA + ly * cosA
    };
  },

  drawModelLine(g, cx, cy, cosA, sinA, x0, y0, x1, y1, c) {
    const rx0 = Math.round(cx + x0 * cosA - y0 * sinA);
    const ry0 = Math.round(cy + x0 * sinA + y0 * cosA);
    const rx1 = Math.round(cx + x1 * cosA - y1 * sinA);
    const ry1 = Math.round(cy + x1 * sinA + y1 * cosA);
    g.line(rx0, ry0, rx1, ry1, c);
  },

  spawnExplosion() {
    this.explosionParticles = [];
    for (let i = 0; i < 34; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 20 + Math.random() * 65;
      const isLine = Math.random() < 0.55;
      this.explosionParticles.push({
        x: this.x + (Math.random() - 0.5) * 8,
        y: this.y + (Math.random() - 0.5) * 8,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 18,
        rot: Math.random() * Math.PI * 2,
        rotSpd: (Math.random() - 0.5) * 8,
        len: 2 + Math.floor(Math.random() * 4),
        life: 1.6 + Math.random() * 1.2,
        maxLife: 2.8,
        isLine,
        c: Math.random() < 0.65 ? 3 : 2
      });
    }
  },

  spawnTouchdownDust(gx, gy) {
    for (let i = 0; i < 10; i++) {
      const dir = (Math.random() < 0.5 ? -1 : 1);
      this.dustParticles.push({
        x: gx + (Math.random() - 0.5) * 4,
        y: gy - Math.random() * 2,
        vx: dir * (15 + Math.random() * 30),
        vy: -(3 + Math.random() * 6),
        life: 0.35 + Math.random() * 0.4,
        maxLife: 0.75,
        c: Math.random() < 0.5 ? 3 : 2
      });
    }
  },

  update(dt) {
    // Clamp delta time to avoid tunneling on frame spikes
    dt = Math.min(0.05, dt);
    this.time += dt;

    // ------------------------------------------------------------------------
    // STATE: LANDED (Touchdown report overlay & proceed to next mission)
    // ------------------------------------------------------------------------
    if (this.state === 'LANDED') {
      const proceed = PAD.hit('a') || PAD.hit('start') || PAD.hit('b') ||
                      PAD.tapPos || (PAD.pointer && PAD.pointer.down);
      if (proceed) {
        APU.sfx('UI_OK');
        const nextFuel = Math.min(850, Math.floor(this.fuel + 350));
        this.startMission(this.mission + 1, nextFuel);
      }
      return;
    }

    // ------------------------------------------------------------------------
    // STATE: CRASHED (Explosion particle simulation & retry)
    // ------------------------------------------------------------------------
    if (this.state === 'CRASHED') {
      this.explosionTimer += dt;
      // Update explosion particles
      for (let p of this.explosionParticles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 32 * dt; // Lunar gravity pulling debris down
        p.vx *= 0.98;
        p.rot += p.rotSpd * dt;
        p.life -= dt;

        // Ground bounce for debris
        const gy = this.getGroundY(p.x);
        if (p.y >= gy) {
          p.y = gy - 1;
          p.vy = -Math.abs(p.vy) * 0.35;
          p.vx *= 0.7;
        }
      }
      this.explosionParticles = this.explosionParticles.filter(p => p.life > 0);

      // Player input to retry or restart after viewing crash impact (0.5s delay)
      if (this.explosionTimer > 0.55) {
        const retry = PAD.hit('a') || PAD.hit('start') || PAD.hit('b') ||
                      PAD.tapPos || (PAD.pointer && PAD.pointer.down);
        if (retry) {
          APU.sfx('UI_OK');
          if (this.lives > 1) {
            this.lives--;
            this.startMission(this.mission, 450);
          } else {
            this.init();
          }
        }
      }
      return;
    }

    // ------------------------------------------------------------------------
    // STATE: FLYING (Active simulation)
    // ------------------------------------------------------------------------

    // Mobile touch controls & pointer tracking
    this.touchLeft = false;
    this.touchRight = false;
    this.touchThrust = false;

    if (PAD.pointer && PAD.pointer.down) {
      const px = PAD.pointer.x, py = PAD.pointer.y;
      if (py >= 210) {
        // Dedicated on-screen touch buttons at bottom
        if (px < 70) this.touchLeft = true;
        else if (px > 185) this.touchRight = true;
        else this.touchThrust = true;
      } else {
        // Direct screen zones
        if (px < 85) this.touchLeft = true;
        else if (px > 170) this.touchRight = true;
        else this.touchThrust = true;
      }
    }

    // Gestures
    if (PAD.swipe === 'left') this.angle -= 0.35;
    if (PAD.swipe === 'right') this.angle += 0.35;
    if (PAD.swipe === 'up') this.touchThrust = true;

    // Rotation controls (RCS)
    let rotDir = 0;
    if (PAD.state.left || this.touchLeft) rotDir -= 1;
    if (PAD.state.right || this.touchRight) rotDir += 1;

    if (rotDir !== 0) {
      this.angle += rotDir * 2.2 * dt;
      this.rcsSoundTimer -= dt;
      if (this.rcsSoundTimer <= 0) {
        APU.sfx('TICK');
        this.rcsSoundTimer = 0.20;
      }
    }

    // Wrap angle between -PI and +PI
    while (this.angle > Math.PI) this.angle -= Math.PI * 2;
    while (this.angle < -Math.PI) this.angle += Math.PI * 2;

    // Main Thruster controls
    const thrusting = (PAD.state.a || PAD.state.up || this.touchThrust) && this.fuel > 0;
    this.thrusting = thrusting;

    if (thrusting) {
      const thrustAcc = 72; // px/s^2
      this.vx += Math.sin(this.angle) * thrustAcc * dt;
      this.vy -= Math.cos(this.angle) * thrustAcc * dt;
      this.fuel = Math.max(0, this.fuel - 55 * dt);

      this.thrustSoundTimer -= dt;
      if (this.thrustSoundTimer <= 0) {
        APU.sfx('SWISH');
        this.thrustSoundTimer = 0.14;
      }

      // Regolith surface dust kick-up when hovering near ground
      const cosA = Math.cos(this.angle), sinA = Math.sin(this.angle);
      const nozzleP = this.transformPoint(this.x, this.y, cosA, sinA, 0, 8);
      const groundAtExhaust = this.getGroundY(nozzleP.x);
      const distToSurface = groundAtExhaust - nozzleP.y;

      if (distToSurface > 0 && distToSurface < 42) {
        const dustCount = distToSurface < 20 ? 3 : 1;
        for (let i = 0; i < dustCount; i++) {
          const side = (Math.random() < 0.5 ? -1 : 1);
          this.dustParticles.push({
            x: nozzleP.x + (Math.random() - 0.5) * 8,
            y: groundAtExhaust - Math.random() * 2,
            vx: side * (16 + Math.random() * 32),
            vy: -(3 + Math.random() * 8),
            life: 0.3 + Math.random() * 0.35,
            maxLife: 0.65,
            c: Math.random() < 0.4 ? 3 : 2
          });
        }
      }
    }

    // Lunar gravity
    this.vy += 26 * dt;

    // Physics step
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Screen horizontal bounds
    if (this.x < 8) {
      this.x = 8;
      if (this.vx < 0) this.vx = -this.vx * 0.35;
    }
    if (this.x > 248) {
      this.x = 248;
      if (this.vx > 0) this.vx = -this.vx * 0.35;
    }
    // Screen ceiling
    if (this.y < 8) {
      this.y = 8;
      if (this.vy < 0) this.vy = 0;
    }

    // Update dust particles
    for (let p of this.dustParticles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 16 * dt; // Gentle lunar settling
      p.vx *= 0.95;
      p.life -= dt;
    }
    this.dustParticles = this.dustParticles.filter(p => p.life > 0);

    // Critical proximity warning audio alert
    const alt = this.getGroundY(this.x) - (this.y + 9);
    const unsafeDescent = (this.vy >= 35) || (Math.abs(this.vx) >= 20) || (Math.abs(this.angle * (180 / Math.PI)) >= 15);
    if (alt > 0 && alt < 38 && unsafeDescent) {
      this.alarmSoundTimer -= dt;
      if (this.alarmSoundTimer <= 0) {
        APU.sfx('ALARM');
        this.alarmSoundTimer = 0.75;
      }
    }

    // ------------------------------------------------------------------------
    // TERRAIN & PAD COLLISION DETECTION
    // ------------------------------------------------------------------------
    const cosA = Math.cos(this.angle);
    const sinA = Math.sin(this.angle);

    // Key Apollo LEM contact points
    const footL = this.transformPoint(this.x, this.y, cosA, sinA, -8, 9);
    const footR = this.transformPoint(this.x, this.y, cosA, sinA, 8, 9);
    const nozzle = this.transformPoint(this.x, this.y, cosA, sinA, 0, 8);
    const cabinTop = this.transformPoint(this.x, this.y, cosA, sinA, 0, -8);
    const leftSh = this.transformPoint(this.x, this.y, cosA, sinA, -6, 0);
    const rightSh = this.transformPoint(this.x, this.y, cosA, sinA, 6, 0);

    const testPoints = [footL, footR, nozzle, cabinTop, leftSh, rightSh];

    let groundCollision = false;
    for (let p of testPoints) {
      if (p.y >= this.getGroundY(p.x)) {
        groundCollision = true;
        break;
      }
    }

    if (groundCollision) {
      const pad = this.getPadUnder(footL.x, footR.x);
      const attDeg = Math.abs(this.angle * (180 / Math.PI));

      const safeV = (this.vy >= -5 && this.vy <= 35);
      const safeH = (Math.abs(this.vx) <= 20);
      const safeAtt = (attDeg <= 15);
      const upperClear = (cabinTop.y < this.getGroundY(cabinTop.x) &&
                          leftSh.y < this.getGroundY(leftSh.x) &&
                          rightSh.y < this.getGroundY(rightSh.x));

      if (pad && safeV && safeH && safeAtt && upperClear) {
        // ====================================================================
        // SUCCESSFUL TOUCHDOWN!
        // ====================================================================
        this.state = 'LANDED';
        this.y = pad.y - 9;
        this.angle = 0;
        this.vx = 0;
        this.vy = 0;
        this.thrusting = false;

        // Scoring math
        const diff = (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : 1;
        const diffMult = diff === 2 ? 1.4 : (diff === 0 ? 0.8 : 1.0);

        this.lastPadMult = pad.mult;
        this.lastPadScore = Math.floor(100 * pad.mult * diffMult);
        this.lastFuelScore = Math.floor(this.fuel * 0.5 * diffMult);
        this.lastSoftScore = this.vy <= 15 ? Math.floor(75 * diffMult) : 0;

        const touchdownTotal = this.lastPadScore + this.lastFuelScore + this.lastSoftScore;
        this.score += touchdownTotal;

        if (this.score > this.highScore) {
          this.highScore = this.score;
        }
        if (typeof SAVE !== 'undefined' && SAVE.setScore) {
          SAVE.setScore(this.id, this.score);
        }

        APU.sfx('LEVELUP');
        this.spawnTouchdownDust(footL.x, pad.y);
        this.spawnTouchdownDust(footR.x, pad.y);
      } else {
        // ====================================================================
        // CRASH - LANDER DESTROYED!
        // ====================================================================
        this.state = 'CRASHED';
        this.thrusting = false;
        this.explosionTimer = 0;

        if (!pad) {
          this.crashReason = "TERRAIN IMPACT OFF-PAD";
        } else if (!safeV) {
          this.crashReason = "V-SPD CRITICAL (" + Math.round(this.vy) + " > 35)";
        } else if (!safeH) {
          this.crashReason = "LATERAL DRIFT CRITICAL (" + Math.round(Math.abs(this.vx)) + " > 20)";
        } else if (!safeAtt) {
          this.crashReason = "ATTITUDE TILT CRITICAL (" + Math.round(attDeg) + "° > 15°)";
        } else {
          this.crashReason = "CABIN STRUCK SURROUNDING CLIFF";
        }

        if (this.score > this.highScore) {
          this.highScore = this.score;
        }
        if (typeof SAVE !== 'undefined' && SAVE.setScore) {
          SAVE.setScore(this.id, this.score);
        }

        APU.sfx('BOOM');
        this.spawnExplosion();
      }
    }
  },

  render(g) {
    g.clear(0);

    // 1. Lunar Background Stars
    for (let s of this.stars) {
      const b = (Math.floor(this.time * s.twinkleRate) % 2 === 0) ? 2 : 1;
      g.px(s.x, s.y, b);
    }

    // 2. Lunar Mountain Vector Terrain
    const pts = this.terrain;
    if (pts && pts.length > 1) {
      for (let i = 0; i < pts.length - 1; i++) {
        g.line(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, 3);
      }

      // Atmospheric vector strata hash marks underneath mountain peaks
      for (let x = 6; x < 252; x += 8) {
        const gy = this.getGroundY(x);
        g.line(x, gy + 3, x - 3, gy + 12, 1);
        g.line(x, gy + 14, x + 4, gy + 22, 1);
      }
    }

    // 3. Landing Pads with Pylon Beacons & Multipliers
    const beaconBlink = (Math.floor(this.time * 4) % 2 === 0);
    for (let pad of this.pads) {
      // Solid horizontal landing strip
      g.line(pad.x0, pad.y, pad.x1, pad.y, 3);
      g.line(pad.x0, pad.y + 1, pad.x1, pad.y + 1, 3);
      g.line(pad.x0, pad.y + 2, pad.x1, pad.y + 2, 2);

      // Left & right pylon poles
      g.line(pad.x0, pad.y, pad.x0, pad.y - 4, 3);
      g.line(pad.x1, pad.y, pad.x1, pad.y - 4, 3);

      // Flashing navigation beacon lamps
      if (beaconBlink) {
        g.px(pad.x0, pad.y - 5, 3);
        g.px(pad.x1, pad.y - 5, 3);
      } else {
        g.px(pad.x0, pad.y - 5, 2);
        g.px(pad.x1, pad.y - 5, 2);
      }

      // Centered multiplier label
      const midX = Math.floor((pad.x0 + pad.x1) / 2) - 4;
      g.text(pad.label, midX, pad.y + 5, 3);
    }

    // 4. Regolith Surface Dust Particles
    for (let p of this.dustParticles) {
      g.px(Math.floor(p.x), Math.floor(p.y), p.c);
    }

    // 5. Apollo LEM Lander Visual (Classic Apollo 11 Lunar Module Silhouette)
    if (this.state !== 'CRASHED') {
      const cx = this.x, cy = this.y;
      const cosA = Math.cos(this.angle);
      const sinA = Math.sin(this.angle);

      // --- Descent Stage (Lower Octagonal Body) ---
      this.drawModelLine(g, cx, cy, cosA, sinA, -5, 5, 5, 5, 2);   // Bottom base
      this.drawModelLine(g, cx, cy, cosA, sinA, -6, 3, -5, 5, 2);  // Bottom-left bevel
      this.drawModelLine(g, cx, cy, cosA, sinA, 6, 3, 5, 5, 2);   // Bottom-right bevel
      this.drawModelLine(g, cx, cy, cosA, sinA, -6, 1, -6, 3, 2);  // Left flank
      this.drawModelLine(g, cx, cy, cosA, sinA, 6, 1, 6, 3, 2);   // Right flank
      this.drawModelLine(g, cx, cy, cosA, sinA, -5, 0, -6, 1, 2);  // Top-left bevel
      this.drawModelLine(g, cx, cy, cosA, sinA, 5, 0, 6, 1, 2);   // Top-right bevel
      this.drawModelLine(g, cx, cy, cosA, sinA, -5, 0, 5, 0, 2);   // Top deck
      this.drawModelLine(g, cx, cy, cosA, sinA, -5, 3, 5, 3, 1);   // Internal foil seam line

      // --- Descent Engine Bell Nozzle ---
      this.drawModelLine(g, cx, cy, cosA, sinA, -2, 5, -3, 8, 2);  // Nozzle throat left
      this.drawModelLine(g, cx, cy, cosA, sinA, 2, 5, 3, 8, 2);   // Nozzle throat right
      this.drawModelLine(g, cx, cy, cosA, sinA, -3, 8, 3, 8, 3);   // Nozzle exit rim

      // --- Ascent Stage (Crew Cabin, Hatch & Windows) ---
      this.drawModelLine(g, cx, cy, cosA, sinA, -4, 0, -4, -4, 3); // Left cabin wall
      this.drawModelLine(g, cx, cy, cosA, sinA, 4, 0, 4, -4, 3);  // Right cabin wall
      this.drawModelLine(g, cx, cy, cosA, sinA, -4, -4, -2, -6, 3);// Sloped roof left
      this.drawModelLine(g, cx, cy, cosA, sinA, 4, -4, 2, -6, 3); // Sloped roof right
      this.drawModelLine(g, cx, cy, cosA, sinA, -2, -6, 2, -6, 3); // Flat roof top

      // Cockpit windows (Triangular pilot viewports)
      const winL = this.transformPoint(cx, cy, cosA, sinA, -2.5, -3.5);
      const winR = this.transformPoint(cx, cy, cosA, sinA, 2.5, -3.5);
      g.px(Math.round(winL.x), Math.round(winL.y), 3);
      g.px(Math.round(winR.x), Math.round(winR.y), 3);

      // EVA egress hatch frame
      this.drawModelLine(g, cx, cy, cosA, sinA, -1, -1, 1, -1, 2);
      this.drawModelLine(g, cx, cy, cosA, sinA, -1, -3, 1, -3, 2);

      // Docking tunnel & VHF antenna mast
      this.drawModelLine(g, cx, cy, cosA, sinA, 0, -6, 0, -9, 2);
      this.drawModelLine(g, cx, cy, cosA, sinA, -2, -9, 2, -9, 3);

      // RCS Attitude Thruster Quads
      this.drawModelLine(g, cx, cy, cosA, sinA, -8, -2, -6, -2, 2);
      this.drawModelLine(g, cx, cy, cosA, sinA, -7, -3, -7, -1, 2);
      this.drawModelLine(g, cx, cy, cosA, sinA, 6, -2, 8, -2, 2);
      this.drawModelLine(g, cx, cy, cosA, sinA, 7, -3, 7, -1, 2);

      // --- Landing Gear Assembly (Struts & Footpads) ---
      // Left leg
      this.drawModelLine(g, cx, cy, cosA, sinA, -5, 4, -8, 9, 2);  // Primary strut
      this.drawModelLine(g, cx, cy, cosA, sinA, -2, 5, -8, 9, 1);  // Support brace
      this.drawModelLine(g, cx, cy, cosA, sinA, -10, 9, -6, 9, 3); // Flat footpad
      // Right leg
      this.drawModelLine(g, cx, cy, cosA, sinA, 5, 4, 8, 9, 2);   // Primary strut
      this.drawModelLine(g, cx, cy, cosA, sinA, 2, 5, 8, 9, 1);   // Support brace
      this.drawModelLine(g, cx, cy, cosA, sinA, 6, 9, 10, 9, 3);  // Flat footpad

      // 6. Thruster Exhaust Plumes & RCS Puffs
      if (this.thrusting && this.fuel > 0) {
        const flameLen = 6 + Math.floor(Math.random() * 8);
        this.drawModelLine(g, cx, cy, cosA, sinA, -2.5, 8, 0, 8 + flameLen, 3);
        this.drawModelLine(g, cx, cy, cosA, sinA, 2.5, 8, 0, 8 + flameLen, 3);
        this.drawModelLine(g, cx, cy, cosA, sinA, 0, 8, 0, 8 + Math.floor(flameLen * 0.7), 3);
      }

      // RCS thruster jet puffs when rotating
      if (PAD.state.left || this.touchLeft) {
        // CCW rotation: Right quad fires UP, Left quad fires DOWN
        this.drawModelLine(g, cx, cy, cosA, sinA, 7, -3, 7, -6, 3);
        this.drawModelLine(g, cx, cy, cosA, sinA, -7, -1, -7, 2, 3);
      }
      if (PAD.state.right || this.touchRight) {
        // CW rotation: Left quad fires UP, Right quad fires DOWN
        this.drawModelLine(g, cx, cy, cosA, sinA, -7, -3, -7, -6, 3);
        this.drawModelLine(g, cx, cy, cosA, sinA, 7, -1, 7, 2, 3);
      }
    }

    // 7. Crash Explosion Debris
    if (this.state === 'CRASHED') {
      for (let p of this.explosionParticles) {
        if (p.isLine) {
          const cR = Math.cos(p.rot) * p.len;
          const sR = Math.sin(p.rot) * p.len;
          g.line(Math.round(p.x - cR), Math.round(p.y - sR), Math.round(p.x + cR), Math.round(p.y + sR), p.c);
        } else {
          g.px(Math.round(p.x), Math.round(p.y), p.c);
        }
      }
    }

    // 8. Classic Vector Telemetry HUD
    // Row 1: FUEL Gauge, Score & High Score
    const fuelColor = (this.fuel < 100 && (Math.floor(this.time * 4) % 2 === 0)) ? 3 : 2;
    g.text("FUEL", 6, 4, fuelColor);
    g.box(28, 4, 38, 6, 2);
    const fuelW = Math.max(0, Math.min(36, Math.floor((this.fuel / 800) * 36)));
    if (fuelW > 0) g.rect(29, 5, fuelW, 4, fuelColor);
    g.text(String(Math.floor(this.fuel)).padStart(3, "0"), 70, 4, fuelColor);

    g.text("PTS:" + String(this.score).padStart(5, "0"), 118, 4, 3);
    g.textR("HI:" + String(this.highScore).padStart(5, "0"), 250, 4, 2);

    // Row 2: Altitude, Horizontal Speed, Vertical Speed, Attitude Angle
    const alt = Math.max(0, Math.floor(this.getGroundY(this.x) - (this.y + 9)));
    g.text("ALT:" + String(alt).padStart(3, "0") + "M", 6, 12, alt < 30 ? 3 : 2);

    const hSpd = Math.round(this.vx);
    const hSafe = Math.abs(hSpd) <= 20;
    const hArrow = hSpd < -1 ? "◀" : (hSpd > 1 ? "▶" : "·");
    g.text("H-SPD:" + hArrow + String(Math.abs(hSpd)).padStart(2, "0"), 68, 12, hSafe ? 2 : 3);

    const vSpd = Math.round(this.vy);
    const vSafe = vSpd <= 35;
    const vArrow = vSpd > 1 ? "▼" : (vSpd < -1 ? "▲" : "·");
    g.text("V-SPD:" + vArrow + String(Math.abs(vSpd)).padStart(2, "0"), 132, 12, vSafe ? 2 : 3);

    const attDeg = Math.round(this.angle * (180 / Math.PI));
    const attSafe = Math.abs(attDeg) <= 15;
    const attSign = attDeg > 0 ? "+" : (attDeg < 0 ? "-" : " ");
    g.text("ATT:" + attSign + String(Math.abs(attDeg)).padStart(2, "0") + "°", 198, 12, attSafe ? 2 : 3);

    // Row 3: Mission, LEM Lives & Touchdown Status Indicator
    g.text("M:0" + this.mission, 6, 20, 2);
    let lemsStr = "";
    for (let i = 0; i < this.lives; i++) lemsStr += "▲";
    g.text("LEM:" + lemsStr, 40, 20, 2);

    const allSafe = hSafe && vSafe && attSafe;
    if (allSafe) {
      g.textR("[TOUCHDOWN READY]", 250, 20, 3);
    } else {
      const warnFlash = (Math.floor(this.time * 4) % 2 === 0);
      if (warnFlash) g.textR("! VELOCITY UNSAFE !", 250, 20, 3);
    }

    // Horizontal Telemetry dividing vector line
    g.line(0, 28, 256, 28, 1);

    // 9. On-Screen Touch Controls (Mobile Friendly Zone Indicators)
    const leftActive = PAD.state.left || this.touchLeft;
    const thrustActive = this.thrusting;
    const rightActive = PAD.state.right || this.touchRight;

    // Left ROT Button
    if (leftActive) {
      g.rect(6, 218, 48, 18, 2);
      g.text("◀ ROT", 14, 224, 3);
    } else {
      g.box(6, 218, 48, 18, 1);
      g.text("◀ ROT", 14, 224, 2);
    }

    // Center MAIN THRUST Button
    if (thrustActive) {
      g.rect(74, 218, 108, 18, 2);
      g.text("▲ THRUST ▲", 98, 224, 3);
    } else {
      g.box(74, 218, 108, 18, 1);
      g.text("▲ THRUST ▲", 98, 224, 2);
    }

    // Right ROT Button
    if (rightActive) {
      g.rect(202, 218, 48, 18, 2);
      g.text("ROT ▶", 210, 224, 3);
    } else {
      g.box(202, 218, 48, 18, 1);
      g.text("ROT ▶", 210, 224, 2);
    }

    // 10. Success / Crash Dialog Windows
    if (this.state === 'LANDED') {
      g.dither(36, 60, 184, 114, 0, 1);
      g.box(36, 60, 184, 114, 3);
      g.textC("★ TOUCHDOWN SUCCESSFUL! ★", 68, 3);
      g.line(46, 78, 210, 78, 2);

      g.text("MISSION " + (this.mission < 10 ? "0" : "") + this.mission + " COMPLETE", 48, 84, 3);
      g.text("PAD MULTIPLIER: " + this.lastPadMult + "X", 48, 94, 2);
      g.text("PAD BASE SCORE: +" + this.lastPadScore, 48, 104, 2);
      g.text("REMAINING FUEL: +" + this.lastFuelScore, 48, 114, 2);
      if (this.lastSoftScore > 0) {
        g.text("SOFT TOUCH BONUS: +" + this.lastSoftScore, 48, 124, 3);
      }
      g.text("MISSION REFILL: +350 FUEL", 48, 134, 2);
      g.text("TOTAL SCORE: " + this.score, 48, 146, 3);

      const blink = (Math.floor(this.time * 3) % 2 === 0);
      if (blink) g.textC("[A] NEXT MISSION", 160, 3);
    } else if (this.state === 'CRASHED' && this.explosionTimer > 0.5) {
      g.dither(34, 60, 188, 114, 0, 1);
      g.box(34, 60, 188, 114, 3);
      g.textC("▲ LANDER DESTROYED ▲", 68, 3);
      g.line(44, 78, 212, 78, 2);

      g.textC("CRITICAL TOUCHDOWN FAILURE", 84, 3);
      g.textC(this.crashReason, 96, 2);

      g.text("MISSION: " + (this.mission < 10 ? "0" : "") + this.mission, 46, 112, 2);
      g.text("FINAL SCORE: " + this.score, 46, 122, 3);
      g.text("HIGH SCORE:  " + this.highScore, 46, 132, 2);
      g.text("LANDERS REMAINING: " + Math.max(0, this.lives - 1), 46, 142, 2);

      const blink = (Math.floor(this.time * 3) % 2 === 0);
      if (this.lives > 1) {
        if (blink) g.textC("[A] DEPLOY REPLACEMENT LEM", 160, 3);
      } else {
        if (blink) g.textC("[A] RESTART MISSION 01", 160, 3);
      }
    }
  },

  save() {
    return {
      hi: this.highScore,
      score: this.score,
      mission: this.mission
    };
  },

  load(data) {
    if (!data) return;
    if (data.hi !== undefined) this.highScore = data.hi;
  }
};
