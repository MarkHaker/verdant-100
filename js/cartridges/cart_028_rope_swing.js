// js/cartridges/cart_028_rope_swing.js
// ============================================================================
// Cartridge #028: ROPE SWING
// ============================================================================
// Complete overhaul featuring authentic Verlet / constrained pendulum physics,
// conservation of angular momentum reeling, directional swing torque pumping,
// projectile grappling hook with cord travel, articulated stick acrobat animations,
// procedural cavern terrain with stalactites, stalagmites, moving pendulum anchors,
// neon boost hoops, glowing combo crystals, parallax depth, and full touch controls.
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[28] = {
  id: 28,
  name: "ROPE SWING",
  genre: 2, // PHYSICS
  scoreLabel: "DISTANCE",
  desc: "[HOLD A / TOUCH] SWING & RELEASE, [B / TAP] FLIP, [▲/▼] REEL ROPE!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Cave ceiling teeth
    g.tri(x + 2, y + 1, x + 8, y + 1, x + 5, y + 7, 1);
    g.tri(x + 12, y + 1, x + 20, y + 1, x + 16, y + 9, 2);
    g.tri(x + 24, y + 1, x + 30, y + 1, x + 27, y + 6, 1);
    // Anchor ring
    g.disc(x + 16, y + 9, 2, 3);
    // Rope arc
    g.line(x + 16, y + 9, x + 24, y + 21, 2);
    // Acrobat stick figure swinging
    g.disc(x + 24, y + 21, 2, 3); // Head
    g.line(x + 24, y + 22, x + 26, y + 26, 3); // Torso
    g.line(x + 26, y + 26, x + 29, y + 29, 3); // Legs
    g.line(x + 24, y + 21, x + 22, y + 19, 2); // Arms to rope
    // Floating crystal
    g.tri(x + 8, y + 18, x + 10, y + 15, x + 12, y + 18, 3);
    g.tri(x + 8, y + 18, x + 10, y + 21, x + 12, y + 18, 3);
    // Speed lines
    g.line(x + 3, y + 26, x + 9, y + 26, 1);
    g.line(x + 5, y + 29, x + 13, y + 29, 2);
  },

  getDifficulty() {
    return (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : 1;
  },

  init() {
    const diff = this.getDifficulty();

    // Physics parameters tuned by difficulty
    // EASY: floatier gravity, wider grapple range, 2 aerial flips, faster reeling
    // NORMAL: realistic tension, standard range, 1 aerial flip
    // HARD: heavy gravity, tighter reach, narrow cavern margins
    this.gravity = diff === 0 ? 290 : (diff === 2 ? 390 : 340);
    this.maxReach = diff === 0 ? 142 : (diff === 2 ? 104 : 122);
    this.maxFlips = diff === 0 ? 2 : 1;
    this.reelSpeed = diff === 0 ? 82 : (diff === 2 ? 56 : 68);
    this.pumpForce = diff === 0 ? 280 : (diff === 2 ? 200 : 240);
    this.scoreMult = diff === 0 ? 1.0 : (diff === 2 ? 1.6 : 1.25);

    // Acrobat Player Kinematics
    this.px = 45;
    this.py = 115;
    this.vx = 110;
    this.vy = 0;
    this.radius = 4;
    this.flipsLeft = this.maxFlips;
    this.flipAnim = 0;

    // Grapple Hook State: 'IDLE' | 'FLYING' | 'LATCHED'
    this.hookState = 'IDLE';
    this.hookX = 0;
    this.hookY = 0;
    this.hookTarget = null;
    this.activeAnchor = null;
    this.ropeLen = 70;
    this.minRope = 20;
    this.maxRope = 118;

    // Camera & World Scroll
    this.camX = 0;
    this.nextGenX = 0;
    this.dist = 0;
    this.score = 0;
    this.crystals = 0;
    this.crystalScore = 0;
    this.hoopScore = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.maxSpeed = 0;
    this.over = false;
    this.newRecord = false;
    this.gameTime = 0;

    // Juice & FX
    this.shakeTimer = 0;
    this.boostTimer = 0;
    this.whooshTimer = 0;
    this.particles = [];
    this.motionTrails = [];
    this.windLines = [];
    for (let i = 0; i < 14; i++) {
      this.windLines.push({
        x: Math.random() * 256,
        y: 20 + Math.random() * 190,
        len: 12 + Math.random() * 20,
        spd: 1.2 + Math.random() * 0.8
      });
    }

    // World Collections
    this.anchors = [];
    this.stalactites = [];
    this.stalagmites = [];
    this.crystalsList = [];
    this.boostHoops = [];

    // Retrieve High Score
    this.hiScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;

    // Initial safe run-up terrain
    this.spawnCavernSegment(0, 380, true);
    this.nextGenX = 380;
  },

  // Cavern Roof Elevation Function (Organic multi-frequency wave)
  getRoofY(worldX) {
    return 24 +
      10 * Math.sin(worldX * 0.007) +
      7 * Math.cos(worldX * 0.016 + 1.2) +
      4 * Math.sin(worldX * 0.038);
  },

  // Procedural Cavern Generator
  spawnCavernSegment(startX, endX, isIntro = false) {
    const diff = this.getDifficulty();
    let curX = startX;

    while (curX < endX) {
      const step = 72 + Math.random() * 24;
      curX += step;
      const roofY = this.getRoofY(curX);

      // 1. Overhead Anchors
      const isMoving = !isIntro && (Math.random() < (diff === 2 ? 0.38 : 0.25));
      const moveType = Math.random() < 0.5 ? 'horiz' : 'vert';
      const anchor = {
        id: Math.random(),
        baseX: curX,
        baseY: roofY + 16 + Math.random() * 12,
        x: curX,
        y: roofY + 16 + Math.random() * 12,
        moving: isMoving,
        moveType: moveType,
        amp: 14 + Math.random() * 12,
        speed: 1.4 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        vx: 0,
        vy: 0
      };
      this.anchors.push(anchor);

      // 2. Hanging Stalactites (Ceiling Hazards)
      if (!isIntro && Math.random() < (diff === 0 ? 0.45 : (diff === 2 ? 0.85 : 0.65))) {
        const stX = curX - step * 0.45 + (Math.random() - 0.5) * 16;
        const stRoof = this.getRoofY(stX);
        const height = 24 + Math.random() * (diff === 2 ? 36 : 26);
        this.stalactites.push({
          x: stX,
          baseY: stRoof,
          tipY: stRoof + height,
          width: 14 + Math.random() * 8
        });
      }

      // 3. Rising Stalagmites (Floor Hazards)
      if (!isIntro && Math.random() < (diff === 0 ? 0.35 : (diff === 2 ? 0.70 : 0.50))) {
        const smX = curX - step * 0.5 + (Math.random() - 0.5) * 20;
        const height = 24 + Math.random() * (diff === 2 ? 40 : 28);
        this.stalagmites.push({
          x: smX,
          baseY: 226,
          tipY: 226 - height,
          width: 16 + Math.random() * 8
        });
      }

      // 4. Floating Crystals (Parabolic Jump Arcs)
      if (Math.random() < 0.75) {
        const numCrystals = Math.random() < 0.4 ? 3 : 2;
        for (let k = 0; k < numCrystals; k++) {
          const frac = (k + 1) / (numCrystals + 1);
          const crysX = curX - step * (1.0 - frac);
          // Curve height along swing arc
          const arcDip = Math.sin(frac * Math.PI) * 35;
          const crysY = roofY + 45 + arcDip + (Math.random() - 0.5) * 10;
          this.crystalsList.push({
            x: crysX,
            y: crysY,
            collected: false,
            sparkleTimer: Math.random() * 6.28
          });
        }
      }

      // 5. Neon Boost Hoops
      if (!isIntro && Math.random() < 0.32) {
        const hoopX = curX + step * 0.5;
        const hoopY = roofY + 55 + (Math.random() - 0.5) * 25;
        this.boostHoops.push({
          x: hoopX,
          y: Math.max(50, Math.min(185, hoopY)),
          radius: 11,
          pulse: 0,
          triggered: false
        });
      }
    }
  },

  // Grapple Hook Target Finder
  findBestAnchor(touchWorldX, touchWorldY) {
    let best = null;

    // Direct touch / click targeting
    if (touchWorldX !== undefined && touchWorldY !== undefined) {
      let minDist = 42;
      for (let a of this.anchors) {
        const d = Math.hypot(touchWorldX - a.x, touchWorldY - a.y);
        if (d < minDist) {
          minDist = d;
          best = a;
        }
      }
      if (best) return best;
    }

    // Overhead / Forward trajectory scoring
    let bestScore = -99999;
    for (let a of this.anchors) {
      const dx = a.x - this.px;
      const dy = a.y - this.py;
      const dist = Math.hypot(dx, dy);

      if (dist <= this.maxReach && a.y < this.py + 15) {
        let score = (this.maxReach - dist);
        // Strongly favor anchors in front of acrobat for forward propulsion
        if (dx > 8) score += 45;
        if (dx > 25 && dx < 85) score += 35;
        if (score > bestScore) {
          bestScore = score;
          best = a;
        }
      }
    }
    return best;
  },

  fireHook(targetAnchor) {
    if (!targetAnchor) return;
    this.hookState = 'FLYING';
    this.hookTarget = targetAnchor;
    this.hookX = this.px;
    this.hookY = this.py;
    this.playSfx('WHIP');
  },

  releaseHook() {
    if (this.hookState === 'LATCHED') {
      this.hookState = 'IDLE';
      this.activeAnchor = null;
      this.hookTarget = null;
      this.playSfx('RELEASE');
    } else if (this.hookState === 'FLYING') {
      this.hookState = 'IDLE';
      this.hookTarget = null;
    }
  },

  doAcrobaticFlip() {
    if (this.flipsLeft <= 0 || this.hookState === 'LATCHED') return;
    this.flipsLeft--;
    this.flipAnim = 1.0;
    // Extra vertical leap + forward momentum
    this.vy = Math.min(this.vy - 120, -145);
    this.vx = Math.max(this.vx + 45, 85);
    this.playSfx('FLIP');
    if (typeof PAD !== 'undefined') PAD.vibrate(10);
    this.spawnSparks(this.px, this.py, 10, 3);
  },

  updateAnchorsKinematics(dt) {
    for (let a of this.anchors) {
      if (a.moving) {
        if (a.moveType === 'horiz') {
          const oldX = a.x;
          a.x = a.baseX + Math.sin(this.gameTime * a.speed + a.phase) * a.amp;
          a.vx = (a.x - oldX) / (dt || 0.001);
          a.vy = 0;
        } else {
          const oldY = a.y;
          a.y = a.baseY + Math.sin(this.gameTime * a.speed + a.phase) * a.amp;
          a.vy = (a.y - oldY) / (dt || 0.001);
          a.vx = 0;
        }
      } else {
        a.vx = 0;
        a.vy = 0;
      }
    }
  },

  spawnSparks(x, y, count = 6, col = 3) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 30 + Math.random() * 80;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.25 + Math.random() * 0.25,
        maxLife: 0.5,
        col: col
      });
    }
  },

  playSfx(type, extra = 0) {
    if (typeof APU === 'undefined') return;
    try {
      switch (type) {
        case 'WHIP':
          APU.noise(0.05, 0.12, 1700, 'bandpass');
          APU.tone(460, 0.06, 'triangle', 0.1, 950);
          break;
        case 'CLINK':
          APU.softTone(1174.66, 0.04, 'sine', 0.12, 0, 0.003, 2400);
          APU.softTone(1760.00, 0.06, 'sine', 0.10, 0.02, 0.003, 3000);
          break;
        case 'RELEASE':
          APU.noise(0.06, 0.08, 1100, 'lowpass');
          break;
        case 'FLIP':
          APU.softTone(340, 0.10, 'sine', 0.12, 0, 0.01, 1400);
          APU.tone(480, 0.09, 'sine', 0.10, 720);
          break;
        case 'CRYSTAL': {
          const baseFreq = 523.25 * Math.pow(1.122, Math.min(extra, 9));
          APU.softTone(baseFreq, 0.06, 'sine', 0.10, 0, 0.005, 2200);
          APU.softTone(baseFreq * 1.5, 0.14, 'sine', 0.10, 0.04, 0.005, 2600);
          break;
        }
        case 'BOOST':
          APU.sfx('POWER');
          break;
        case 'WHOOSH':
          APU.noise(0.12, 0.06, 850, 'bandpass');
          break;
        case 'CRASH':
          APU.sfx('BOOM');
          break;
      }
    } catch (e) {}
  },

  update(dt) {
    if (this.over) {
      const restart = (typeof PAD !== 'undefined') &&
        (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || PAD.tapPos);
      if (restart) this.init();
      return;
    }

    this.gameTime += dt;
    if (this.shakeTimer > 0) this.shakeTimer -= dt;
    if (this.boostTimer > 0) this.boostTimer -= dt;
    if (this.whooshTimer > 0) this.whooshTimer -= dt;
    if (this.flipAnim > 0) this.flipAnim = Math.max(0, this.flipAnim - dt * 3.2);

    // ========================================================================
    // INPUT HANDLING: BUTTONS & MULTI-TOUCH
    // ========================================================================
    let wantsGrapple = false;
    let touchTargetAnchor = null;

    if (typeof PAD !== 'undefined') {
      // Touch Screen: Tap or Touch-and-Hold
      if (PAD.pointer && PAD.pointer.down) {
        wantsGrapple = true;
        const worldTouchX = PAD.pointer.x + this.camX;
        const worldTouchY = PAD.pointer.y;
        touchTargetAnchor = this.findBestAnchor(worldTouchX, worldTouchY);
      }

      // Controller / Keyboard: [A] to latch
      if (PAD.held('a')) {
        wantsGrapple = true;
      }

      // Release Grapple: Releasing [A] and lifting finger
      if ((PAD.rel('a') || (PAD.pointer && !PAD.pointer.down && this.wasPointerDown)) && this.hookState !== 'IDLE') {
        this.releaseHook();
      }
      this.wasPointerDown = !!(PAD.pointer && PAD.pointer.down);

      // Start firing hook on fresh press
      if (wantsGrapple && this.hookState === 'IDLE') {
        const target = touchTargetAnchor || this.findBestAnchor();
        if (target) this.fireHook(target);
      }

      // Acrobatic Flip ([B] or quick tap in air)
      if (PAD.hit('b')) {
        this.doAcrobaticFlip();
      } else if (PAD.tapPos && this.hookState !== 'LATCHED') {
        this.doAcrobaticFlip();
      }
    }

    // ========================================================================
    // HOOK PROJECTILE FLIGHT DYNAMICS
    // ========================================================================
    if (this.hookState === 'FLYING' && this.hookTarget) {
      const dx = this.hookTarget.x - this.hookX;
      const dy = this.hookTarget.y - this.hookY;
      const dist = Math.hypot(dx, dy);
      const hookSpeed = 1150;
      const step = hookSpeed * dt;

      if (dist <= step) {
        // Impact with ceiling anchor: Latch firmly!
        this.hookX = this.hookTarget.x;
        this.hookY = this.hookTarget.y;
        this.hookState = 'LATCHED';
        this.activeAnchor = this.hookTarget;
        const curDist = Math.hypot(this.px - this.activeAnchor.x, this.py - this.activeAnchor.y);
        this.ropeLen = Math.max(this.minRope, Math.min(this.maxRope, curDist));
        this.flipsLeft = this.maxFlips;
        this.playSfx('CLINK');
        if (typeof PAD !== 'undefined') PAD.vibrate(12);
        this.spawnSparks(this.activeAnchor.x, this.activeAnchor.y, 7, 3);
      } else {
        this.hookX += (dx / dist) * step;
        this.hookY += (dy / dist) * step;
      }
    }

    // ========================================================================
    // SUB-STEPPED CONSTRAINED PENDULUM / VERLET PHYSICS (4 substeps / frame)
    // ========================================================================
    const subSteps = 4;
    const subDt = Math.min(0.04, dt) / subSteps;
    const g = this.gravity;

    for (let s = 0; s < subSteps; s++) {
      this.updateAnchorsKinematics(subDt);

      if (this.hookState === 'LATCHED' && this.activeAnchor) {
        const ax = this.activeAnchor.x;
        const ay = this.activeAnchor.y;
        const avx = this.activeAnchor.vx || 0;
        const avy = this.activeAnchor.vy || 0;

        let rx = this.px - ax;
        let ry = this.py - ay;
        let r = Math.hypot(rx, ry) || 0.001;
        let urx = rx / r;
        let ury = ry / r;
        let utx = -ury;
        let uty = urx;

        // 1. Rope Reel In / Reel Out (Up / Down / Swipe)
        let dL = 0;
        if (typeof PAD !== 'undefined') {
          const reelUp = PAD.held('up') || PAD.swipe === 'up';
          const reelDown = PAD.held('down') || PAD.swipe === 'down';
          if (reelUp) dL -= this.reelSpeed * subDt;
          if (reelDown) dL += this.reelSpeed * subDt;
        }

        if (dL !== 0) {
          const oldL = this.ropeLen;
          const newL = Math.max(this.minRope, Math.min(this.maxRope, oldL + dL));
          if (newL !== oldL) {
            // Conservation of angular momentum: L * v_tan = const => v_tan' = v_tan * (oldL / newL)
            const relVx = this.vx - avx;
            const relVy = this.vy - avy;
            const vTan = relVx * utx + relVy * uty;
            const vTanNew = vTan * (oldL / newL);
            const deltaVTan = vTanNew - vTan;
            this.vx += utx * deltaVTan;
            this.vy += uty * deltaVTan;
            this.ropeLen = newL;
          }
        }

        // 2. Directional Swing Pumping (Left / Right torque)
        let pumpDir = 0;
        if (typeof PAD !== 'undefined') {
          if (PAD.held('left')) pumpDir -= 1;
          if (PAD.held('right')) pumpDir += 1;
        }
        if (pumpDir !== 0) {
          const relVx = this.vx - avx;
          const relVy = this.vy - avy;
          const curTanSpd = relVx * utx + relVy * uty;
          const tanSign = curTanSpd >= 0 ? 1 : -1;
          const pumpTangent = utx * pumpDir;
          if (pumpTangent * tanSign > 0.15) {
            const pumpAcc = this.pumpForce * Math.abs(pumpTangent);
            this.vx += utx * tanSign * pumpAcc * subDt;
            this.vy += uty * tanSign * pumpAcc * subDt;
          }
        }

        // 3. Gravity
        this.vy += g * subDt;

        // 4. Integrate Position
        this.px += this.vx * subDt;
        this.py += this.vy * subDt;

        // 5. Constrain Tether: Verlet Distance Relaxation & Radial Velocity Strip
        rx = this.px - ax;
        ry = this.py - ay;
        r = Math.hypot(rx, ry) || 0.001;
        if (r >= this.ropeLen) {
          urx = rx / r;
          ury = ry / r;
          // Position relaxation to circular arc
          this.px = ax + urx * this.ropeLen;
          this.py = ay + ury * this.ropeLen;
          // Velocity projection: preserve tangential momentum, strip outward radial velocity
          const relVx = this.vx - avx;
          const relVy = this.vy - avy;
          const vRad = relVx * urx + relVy * ury;
          if (vRad > 0) {
            this.vx -= vRad * urx;
            this.vy -= vRad * ury;
          }
        }
      } else {
        // Free Flight: Ballistic projectile motion with aerodynamic drag
        this.vy += g * subDt;
        this.vx *= (1.0 - 0.0006);
        this.vy *= (1.0 - 0.0006);
        this.px += this.vx * subDt;
        this.py += this.vy * subDt;
      }
    }

    // Velocity & Distance Stats
    const curSpeed = Math.hypot(this.vx, this.vy);
    this.maxSpeed = Math.max(this.maxSpeed, curSpeed);
    this.dist = Math.max(this.dist, (this.px - 45) / 10);
    this.score = Math.floor(this.dist * this.scoreMult) + this.crystalScore + this.hoopScore;

    // High Speed Audio Whoosh & Trails
    if (curSpeed > 210 && this.whooshTimer <= 0) {
      this.playSfx('WHOOSH');
      this.whooshTimer = 0.4;
    }
    if (curSpeed > 180) {
      this.motionTrails.unshift({
        x: this.px,
        y: this.py,
        vx: this.vx,
        vy: this.vy,
        hookState: this.hookState,
        life: 0.18
      });
      if (this.motionTrails.length > 5) this.motionTrails.pop();
    }

    // Update Motion Trails
    for (let i = this.motionTrails.length - 1; i >= 0; i--) {
      this.motionTrails[i].life -= dt;
      if (this.motionTrails[i].life <= 0) this.motionTrails.splice(i, 1);
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Update Wind Lines
    for (let w of this.windLines) {
      w.x -= (this.vx * 0.4 + 100 * w.spd) * dt;
      if (w.x < -40) {
        w.x = 280 + Math.random() * 40;
        w.y = 20 + Math.random() * 190;
      }
    }

    // ========================================================================
    // COLLECTIBLES & INTERACTION CHECKS
    // ========================================================================
    // 1. Crystals
    for (let c of this.crystalsList) {
      if (c.collected) continue;
      c.sparkleTimer += dt * 4;
      if (Math.hypot(this.px - c.x, this.py - c.y) < 13) {
        c.collected = true;
        this.crystals++;
        this.crystalScore += Math.floor(100 * this.combo * this.scoreMult);
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.playSfx('CRYSTAL', this.combo);
        if (typeof PAD !== 'undefined') PAD.vibrate(8);
        this.spawnSparks(c.x, c.y, 8, 3);
      }
    }

    // 2. Boost Hoops
    for (let h of this.boostHoops) {
      h.pulse += dt * 5;
      if (!h.triggered && Math.abs(this.px - h.x) < 14 && Math.abs(this.py - h.y) < 22) {
        h.triggered = true;
        this.vx = Math.max(this.vx + 140, 275);
        this.vy = -35;
        this.flipsLeft = this.maxFlips;
        this.boostTimer = 0.45;
        this.hoopScore += Math.floor(250 * this.scoreMult);
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.playSfx('BOOST');
        if (typeof PAD !== 'undefined') PAD.vibrate(16);
        this.spawnSparks(h.x, h.y, 14, 3);
      }
    }

    // ========================================================================
    // HAZARD & OBSTACLE COLLISION CHECKS
    // ========================================================================
    // 1. Floor Chasm (Pit Death)
    if (this.py >= 224) {
      this.triggerGameOver("FELL INTO MOLTEN CHASM!");
      return;
    }

    // 2. Hanging Stalactites (Triangle spike hit-test)
    for (let s of this.stalactites) {
      const halfW = s.width / 2;
      if (this.px >= s.x - halfW && this.px <= s.x + halfW) {
        let edgeY;
        if (this.px <= s.x) {
          edgeY = s.baseY + (s.tipY - s.baseY) * ((this.px - (s.x - halfW)) / (halfW || 1));
        } else {
          edgeY = s.tipY + (s.baseY - s.tipY) * ((this.px - s.x) / (halfW || 1));
        }
        if (this.py - this.radius <= edgeY) {
          this.triggerGameOver("SMASHED INTO STALACTITE!");
          return;
        }
      }
    }

    // 3. Rising Stalagmites (Floor spike hit-test)
    for (let m of this.stalagmites) {
      const halfW = m.width / 2;
      if (this.px >= m.x - halfW && this.px <= m.x + halfW) {
        let edgeY;
        if (this.px <= m.x) {
          edgeY = m.baseY + (m.tipY - m.baseY) * ((this.px - (m.x - halfW)) / (halfW || 1));
        } else {
          edgeY = m.tipY + (m.baseY - m.tipY) * ((this.px - m.x) / (halfW || 1));
        }
        if (this.py + this.radius >= edgeY) {
          this.triggerGameOver("IMPALED ON STALAGMITE!");
          return;
        }
      }
    }

    // ========================================================================
    // CAMERA & CHUNK GENERATION FRONTIER
    // ========================================================================
    const targetCamX = this.px - 68;
    this.camX += (targetCamX - this.camX) * Math.min(1, 12 * dt);

    // Spawn further chunks ahead
    if (this.camX + 320 > this.nextGenX) {
      this.spawnCavernSegment(this.nextGenX, this.nextGenX + 220);
      this.nextGenX += 220;
    }

    // Prune distant objects behind camera to maintain constant memory
    const cullX = this.camX - 120;
    this.anchors = this.anchors.filter(a => a.x >= cullX);
    this.stalactites = this.stalactites.filter(s => s.x >= cullX);
    this.stalagmites = this.stalagmites.filter(m => m.x >= cullX);
    this.crystalsList = this.crystalsList.filter(c => c.x >= cullX);
    this.boostHoops = this.boostHoops.filter(h => h.x >= cullX);
  },

  triggerGameOver(reason) {
    this.over = true;
    this.deathReason = reason;
    this.shakeTimer = 0.45;
    this.playSfx('CRASH');
    if (typeof PAD !== 'undefined') PAD.vibrate(35);
    this.spawnSparks(this.px, this.py, 22, 2);

    if (typeof SAVE !== 'undefined' && SAVE.setScore) {
      this.newRecord = SAVE.setScore(this.id, this.score);
      this.hiScore = Math.max(this.hiScore, this.score);
    }
  },

  // ==========================================================================
  // RENDERING PIPELINE
  // ==========================================================================
  render(g) {
    // Screen Shake displacement
    let offX = 0, offY = 0;
    if (this.shakeTimer > 0) {
      offX = Math.floor((Math.random() - 0.5) * 6);
      offY = Math.floor((Math.random() - 0.5) * 6);
    }

    g.clear(0);

    // ------------------------------------------------------------------------
    // LAYER 0: PARALLAX DISTANT CAVERN SILHOUETTES (0.2x scroll)
    // ------------------------------------------------------------------------
    const bgScroll = this.camX * 0.2;
    for (let x = 0; x < 256; x += 16) {
      const worldX = x + bgScroll;
      const bgRoofY = 32 + Math.sin(worldX * 0.015) * 16;
      g.line(x + offX, 0, x + offX, Math.floor(bgRoofY), 1);
    }
    // Distant background pillars
    for (let p = -2; p < 6; p++) {
      const pilX = Math.floor(p * 70 - (bgScroll % 70));
      g.rect(pilX + offX, 20, 6, 190, 1);
    }

    // ------------------------------------------------------------------------
    // LAYER 1: FOREGROUND CAVERN CEILING & FLOOR (1.0x scroll)
    // ------------------------------------------------------------------------
    for (let x = 0; x < 256; x += 3) {
      const worldX = x + this.camX;
      const roofY = Math.floor(this.getRoofY(worldX));
      // Solid ceiling rock
      g.line(x + offX, 0, x + offX, roofY + offY, 1);
      g.px(x + offX, roofY + offY, 2);
    }

    // Craggy Stalactites (Ceiling Spikes)
    for (let s of this.stalactites) {
      const scrX = Math.floor(s.x - this.camX) + offX;
      if (scrX >= -24 && scrX <= 280) {
        const halfW = Math.floor(s.width / 2);
        g.tri(
          scrX - halfW, Math.floor(s.baseY) + offY,
          scrX + halfW, Math.floor(s.baseY) + offY,
          scrX, Math.floor(s.tipY) + offY,
          2
        );
        g.line(scrX - halfW, Math.floor(s.baseY) + offY, scrX, Math.floor(s.tipY) + offY, 3);
      }
    }

    // Craggy Stalagmites (Floor Spikes)
    for (let m of this.stalagmites) {
      const scrX = Math.floor(m.x - this.camX) + offX;
      if (scrX >= -24 && scrX <= 280) {
        const halfW = Math.floor(m.width / 2);
        g.tri(
          scrX - halfW, Math.floor(m.baseY) + offY,
          scrX + halfW, Math.floor(m.baseY) + offY,
          scrX, Math.floor(m.tipY) + offY,
          2
        );
        g.line(scrX, Math.floor(m.tipY) + offY, scrX + halfW, Math.floor(m.baseY) + offY, 3);
      }
    }

    // Molten Lava Lake Floor (Animated hazard)
    const lavaY = 226 + offY;
    g.line(0, lavaY, 256, lavaY, 2);
    for (let x = 0; x < 256; x += 8) {
      const wave = Math.sin((x + this.camX) * 0.08 + this.gameTime * 6) * 2;
      g.px(x + offX, Math.floor(lavaY + wave), 3);
    }
    g.dither(0, lavaY + 2, 256, 14, 1, 2);

    // ------------------------------------------------------------------------
    // LAYER 2: INTERACTIVE ELEMENTS (Anchors, Hoops, Crystals)
    // ------------------------------------------------------------------------
    // Anchors & Chains
    for (let a of this.anchors) {
      const scrX = Math.floor(a.x - this.camX) + offX;
      const scrY = Math.floor(a.y) + offY;
      if (scrX >= -24 && scrX <= 280) {
        const ceilY = Math.floor(this.getRoofY(a.x)) + offY;
        // Hanging chain
        g.line(scrX, ceilY, scrX, scrY, 1);
        // Anchor metallic ring
        const isTarget = (a === this.activeAnchor || a === this.hookTarget);
        g.disc(scrX, scrY, isTarget ? 4 : 3, isTarget ? 3 : 2);
        g.circle(scrX, scrY, isTarget ? 5 : 4, isTarget ? 3 : 1);
        g.px(scrX, scrY, 0);
      }
    }

    // Neon Boost Hoops
    for (let h of this.boostHoops) {
      const scrX = Math.floor(h.x - this.camX) + offX;
      const scrY = Math.floor(h.y) + offY;
      if (scrX >= -20 && scrX <= 276) {
        const col = h.triggered ? 1 : 3;
        g.circle(scrX, scrY, 10, col);
        g.circle(scrX, scrY, 11, col === 3 ? 2 : 1);
        // Inner Chevrons (>> arrow)
        if (!h.triggered) {
          g.line(scrX - 3, scrY - 4, scrX + 2, scrY, 3);
          g.line(scrX - 3, scrY + 4, scrX + 2, scrY, 3);
        }
      }
    }

    // Floating Combo Crystals
    for (let c of this.crystalsList) {
      if (c.collected) continue;
      const scrX = Math.floor(c.x - this.camX) + offX;
      const scrY = Math.floor(c.y) + offY;
      if (scrX >= -10 && scrX <= 266) {
        // Sparkling 4-point diamond
        g.tri(scrX - 3, scrY, scrX, scrY - 4, scrX + 3, scrY, 3);
        g.tri(scrX - 3, scrY, scrX, scrY + 4, scrX + 3, scrY, 3);
        g.px(scrX, scrY, 0);
        g.px(scrX, scrY - 1, 3);
        g.px(scrX, scrY + 1, 3);
      }
    }

    // ------------------------------------------------------------------------
    // LAYER 3: GRAPPLING ROPE & FLYING HOOK
    // ------------------------------------------------------------------------
    const playerScrX = Math.floor(this.px - this.camX) + offX;
    const playerScrY = Math.floor(this.py) + offY;

    if (this.hookState === 'LATCHED' && this.activeAnchor) {
      const anchorScrX = Math.floor(this.activeAnchor.x - this.camX) + offX;
      const anchorScrY = Math.floor(this.activeAnchor.y) + offY;
      // High tension line
      g.line(anchorScrX, anchorScrY, playerScrX, playerScrY, 3);
      // Rope carabiner / hook head
      g.disc(anchorScrX, anchorScrY, 2, 3);
    } else if (this.hookState === 'FLYING') {
      const hookScrX = Math.floor(this.hookX - this.camX) + offX;
      const hookScrY = Math.floor(this.hookY) + offY;
      // Extending tether line
      g.line(playerScrX, playerScrY, hookScrX, hookScrY, 2);
      // 3-Pronged grappling hook projectile
      g.disc(hookScrX, hookScrY, 2, 3);
      g.px(hookScrX - 1, hookScrY - 1, 2);
      g.px(hookScrX + 1, hookScrY - 1, 2);
    }

    // ------------------------------------------------------------------------
    // LAYER 4: SPEED TRAILS & WIND LINES
    // ------------------------------------------------------------------------
    const curSpeed = Math.hypot(this.vx, this.vy);
    if (curSpeed > 180) {
      for (let w of this.windLines) {
        g.line(Math.floor(w.x), Math.floor(w.y), Math.floor(w.x - w.len), Math.floor(w.y), 1);
      }
      for (let i = 0; i < this.motionTrails.length; i++) {
        const t = this.motionTrails[i];
        const tx = Math.floor(t.x - this.camX) + offX;
        const ty = Math.floor(t.y) + offY;
        g.disc(tx, ty, 3, i === 0 ? 2 : 1);
      }
    }

    // ------------------------------------------------------------------------
    // LAYER 5: ARTICULATED STICK ACROBAT ANIMATION
    // ------------------------------------------------------------------------
    if (!this.over) {
      this.renderAcrobat(g, playerScrX, playerScrY);
    }

    // Particles (Sparks, Chimes, Debris)
    for (let p of this.particles) {
      const scrX = Math.floor(p.x - this.camX) + offX;
      const scrY = Math.floor(p.y) + offY;
      if (scrX >= 0 && scrX < 256 && scrY >= 0 && scrY < 240) {
        g.px(scrX, scrY, p.col);
      }
    }

    // ------------------------------------------------------------------------
    // LAYER 6: RETRO HUD & OVERLAYS
    // ------------------------------------------------------------------------
    g.text("DIST:" + Math.floor(this.dist) + "M", 10, 8, 3);
    const kmh = Math.round(curSpeed * 0.36);
    g.text("SPD:" + kmh + "KM/H", 78, 8, curSpeed > 220 ? 3 : 2);
    g.text("CRYS:" + this.crystals, 150, 8, 3);
    if (this.combo > 1) {
      g.text("x" + this.combo, 192, 8, 3);
    }
    g.textR("HI:" + this.hiScore, 248, 8, 2);

    // Initial controls helper prompt
    if (this.dist < 50 && !this.over) {
      g.textC("[HOLD A / TOUCH] SWING & RELEASE", 204, 2);
      g.textC("[B / TAP] FLIP   [▲/▼] REEL ROPE", 214, 2);
    }

    // Game Over Summary Dialog
    if (this.over) {
      g.dither(34, 56, 188, 118, 0, 1);
      g.box(34, 56, 188, 118, 3);
      g.rect(36, 58, 184, 14, 2);
      g.textC("EXPEDITION TERMINATED", 62, 3);

      g.textC(this.deathReason || "FELL INTO CHASM", 80, 2);
      g.text("DISTANCE: " + Math.floor(this.dist) + " METERS", 48, 96, 3);
      g.text("CRYSTALS: " + this.crystals + " (" + this.crystalScore + " PTS)", 48, 108, 2);
      g.text("PEAK SPEED: " + Math.round(this.maxSpeed * 0.36) + " KM/H", 48, 120, 2);
      g.text("BEST COMBO: x" + this.maxCombo, 48, 132, 2);

      if (this.newRecord) {
        g.textC("★ NEW ALL-TIME RECORD! ★", 146, 3);
      } else {
        g.textC("BEST RECORD: " + this.hiScore + " PTS", 146, 2);
      }

      g.textC("[A / TOUCH] RETRY EXPEDITION", 160, 3);
    }
  },

  // Articulated Acrobat Renderer
  renderAcrobat(g, scrX, scrY) {
    const speed = Math.hypot(this.vx, this.vy);
    const vx = this.vx, vy = this.vy;

    if (this.hookState === 'LATCHED' && this.activeAnchor) {
      // Swinger Mode: Arms grasp the rope at (scrX, scrY); torso aligns with tension vector
      const ax = Math.floor(this.activeAnchor.x - this.camX);
      const ay = Math.floor(this.activeAnchor.y);
      const dx = scrX - ax, dy = scrY - ay;
      const d = Math.hypot(dx, dy) || 1;
      const urx = dx / d, ury = dy / d;
      const utx = -ury, uty = urx;

      const neckX = Math.round(scrX - urx * 3);
      const neckY = Math.round(scrY - ury * 3);
      const headX = Math.round(neckX - urx * 3);
      const headY = Math.round(neckY - ury * 3);
      const hipX = Math.round(neckX + urx * 7);
      const hipY = Math.round(neckY + ury * 7);

      // Head
      g.disc(headX, headY, 2, 3);

      // Fluttering scarf (streaming opposite to velocity)
      const scarfDirX = -vx / (speed || 1);
      const scarfDirY = -vy / (speed || 1);
      g.line(headX, headY, Math.round(headX + scarfDirX * 4), Math.round(headY + scarfDirY * 4), 3);

      // Torso
      g.line(neckX, neckY, hipX, hipY, 3);

      // Arms grasping rope
      g.line(neckX, neckY, scrX, scrY, 2);
      g.disc(scrX, scrY, 1, 3); // Hands / knot

      // Dynamic legs swinging with centrifugal momentum
      const legOffset = (this.vx * utx + this.vy * uty) * 0.025;
      const foot1X = Math.round(hipX + urx * 6 - utx * (legOffset + 2));
      const foot1Y = Math.round(hipY + ury * 6 - uty * (legOffset + 2));
      const foot2X = Math.round(hipX + urx * 6 - utx * (legOffset - 2));
      const foot2Y = Math.round(hipY + ury * 6 - uty * (legOffset - 2));

      g.line(hipX, hipY, foot1X, foot1Y, 3);
      g.line(hipX, hipY, foot2X, foot2Y, 2);
    } else if (this.flipAnim > 0) {
      // Acrobatic Flip tuck animation: spinning compact ball
      const angle = (1.0 - this.flipAnim) * Math.PI * 4;
      const cosA = Math.cos(angle), sinA = Math.sin(angle);
      g.disc(scrX, scrY, 3, 3);
      g.circle(scrX, scrY, 4, 2);
      const armX = Math.round(scrX + cosA * 4);
      const armY = Math.round(scrY + sinA * 4);
      g.line(scrX, scrY, armX, armY, 3);
    } else {
      // Free Soaring Diver: Streamlined aerodynamic flight posture
      const hx = vx / (speed || 1);
      const hy = vy / (speed || 1);
      const px = -hy, py = hx; // Perpendicular vector

      const headX = Math.round(scrX + hx * 6);
      const headY = Math.round(scrY + hy * 6);
      const neckX = Math.round(scrX + hx * 3);
      const neckY = Math.round(scrY + hy * 3);
      const hipX = Math.round(scrX - hx * 4);
      const hipY = Math.round(scrY - hy * 4);

      // Head & Scarf
      g.disc(headX, headY, 2, 3);
      g.line(headX, headY, Math.round(headX - hx * 5), Math.round(headY - hy * 5), 3);

      // Torso
      g.line(neckX, neckY, hipX, hipY, 3);

      // Outstretched Arms
      g.line(neckX, neckY, Math.round(neckX + hx * 5 + px * 3), Math.round(neckY + hy * 5 + py * 3), 2);
      g.line(neckX, neckY, Math.round(neckX + hx * 5 - px * 3), Math.round(neckY + hy * 5 - py * 3), 2);

      // Trailing Legs
      g.line(hipX, hipY, Math.round(hipX - hx * 6 + px * 2), Math.round(hipY - hy * 6 + py * 2), 3);
      g.line(hipX, hipY, Math.round(hipX - hx * 6 - px * 2), Math.round(hipY - hy * 6 - py * 2), 2);
    }
  }
};
