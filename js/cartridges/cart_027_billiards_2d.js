// js/cartridges/cart_027_billiards_2d.js
// ============================================================================
// Cartridge #027: BILLIARDS 2D (Championship Edition)
// ============================================================================
// Comprehensive retro 2D billiards simulation featuring:
// - Authentic 9-Ball Diamond Rack, 8-Ball Quick Rack, and 5 Trick Shot Challenges
// - Substepped continuous collision detection (4 substeps/frame) with elastic
//   ball-to-ball impact, felt rolling friction, and cushion restitution (e = 0.82)
// - 6 corner/side pockets with drop funnel suction physics
// - Raycast aim guide with ball collision detection, ghost ball outline, and
//   tangent deflection trajectory
// - Hold [A] backswing charge power meter and mobile touch slingshot pull-back
// - Foul / scratch handling with free Ball-In-Hand placement
// - Velocity-scaled acoustic phenolic clack, cushion thud, cue thwack, and sink SFX
// - Easy / Normal / Hard difficulty tuning
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[27] = {
  id: 27,
  name: "BILLIARDS 2D",
  genre: 2, // PHYSICS
  scoreLabel: "POTS",
  desc: "REALISTIC 9-BALL & TRICKSHOT BILLIARDS. AIM RAYCAST, CHARGE [A] OR DRAG SLING.",

  // --------------------------------------------------------------------------
  // ICON
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Table corner pocket
    g.disc(x + 4, y + 4, 4, 1);
    g.disc(x + 4, y + 4, 2, 0);
    // Cue ball
    g.disc(x + 10, y + 20, 3, 3);
    // 8-Ball
    g.disc(x + 20, y + 12, 3, 0);
    g.circle(x + 20, y + 12, 3, 3);
    g.px(x + 20, y + 12, 3);
    // 9-Ball (striped)
    g.disc(x + 24, y + 22, 3, 3);
    g.rect(x + 22, y + 21, 5, 2, 2);
    // Cue stick
    g.line(x + 4, y + 26, x + 8, y + 22, 2);
  },

  // --------------------------------------------------------------------------
  // SOUND SYNTHESIS HELPERS (Velocity-scaled retro chiptune SFX)
  // --------------------------------------------------------------------------
  sfxClack(speed) {
    if (typeof APU === 'undefined') return;
    const vol = Math.min(0.32, Math.max(0.04, speed / 550));
    APU.softTone(1100 + Math.random() * 250, 0.022, 'triangle', vol, 0, 0.002, 2600);
    APU.softTone(2200, 0.014, 'sine', vol * 0.6, 0, 0.001, 3200);
  },

  sfxCueHit(pwr) {
    if (typeof APU === 'undefined') return;
    const vol = Math.min(0.35, Math.max(0.06, pwr / 110));
    APU.noise(0.035, vol * 0.85, 600, 'lowpass');
    APU.softTone(230, 0.05, 'triangle', vol, 0, 0.004, 850);
  },

  sfxCushion(speed) {
    if (typeof APU === 'undefined') return;
    const vol = Math.min(0.24, Math.max(0.03, speed / 500));
    APU.softTone(95, 0.06, 'sine', vol, 0, 0.005, 300);
    APU.noise(0.025, vol * 0.45, 260, 'lowpass');
  },

  sfxPocket() {
    if (typeof APU === 'undefined') return;
    APU.softTone(150, 0.12, 'sine', 0.18, 0, 0.01, 400);
    APU.noise(0.07, 0.14, 480, 'lowpass', 0.03);
  },

  // --------------------------------------------------------------------------
  // INITIALIZATION & MODES
  // --------------------------------------------------------------------------
  init() {
    this.mode = 0; // 0 = 9-BALL, 1 = 8-BALL, 2 = TRICK SHOTS
    this.trickLevel = 0; // 0..4 (5 Trick Shot levels)
    this.score = 0;
    this.shots = 0;
    this.pots = 0;
    this.won = false;
    this.lost = false;

    // Table pocket positions: [x, y]
    // Cushion playing bounds: x in [26, 230], y in [38, 202]
    this.pockets = [
      [26, 38],   // Top-Left
      [128, 36],  // Top-Middle
      [230, 38],  // Top-Right
      [26, 202],  // Bottom-Left
      [128, 204], // Bottom-Middle
      [230, 202]  // Bottom-Right
    ];

    // Cue stick state
    this.angle = 0;
    this.power = 0;
    this.charging = false;
    this.chargeDir = 1;
    this.strikeAnim = 0;
    this.touchPulling = false;

    // Scratch & foul state
    this.ballInHand = false;
    this.foulMsg = "";
    this.foulTimer = 0;
    this.firstHitBall = null;
    this.wasMoving = false;

    this.obstacles = [];
    this.initRack();
  },

  initMode(modeIdx) {
    this.mode = modeIdx;
    this.score = 0;
    this.shots = 0;
    this.pots = 0;
    this.won = false;
    this.lost = false;
    this.foulMsg = "";
    this.foulTimer = 0;
    this.ballInHand = false;
    this.initRack();
  },

  initRack() {
    const ballRadius = 4.5;
    this.cue = {
      id: 0,
      num: 0,
      type: 'cue',
      x: 62,
      y: 120,
      vx: 0,
      vy: 0,
      r: ballRadius,
      active: true,
      potted: false
    };

    this.balls = [];
    this.obstacles = [];
    this.angle = 0;
    this.power = 0;
    this.charging = false;
    this.chargeDir = 1;
    this.strikeAnim = 0;
    this.touchPulling = false;
    this.firstHitBall = null;
    this.wasMoving = false;

    if (this.mode === 0) {
      // ----------------------------------------------------------------------
      // MODE 1: 9-BALL CLASSIC (Diamond rack formation)
      // ----------------------------------------------------------------------
      // Row 1 (apex): Ball 1
      // Row 2: Balls 2, 3
      // Row 3: Balls 4, 9 (Center!), 5
      // Row 4: Balls 6, 7
      // Row 5: Ball 8
      const apexX = 172, apexY = 120;
      const dx = 8.0; // row step: 9.2 * sqrt(3)/2
      const dy = 9.2; // ball spacing

      const rackPlan = [
        { num: 1, type: 'solid',  rx: 0, ry: 0 },
        { num: 2, type: 'solid',  rx: 1, ry: -0.5 },
        { num: 3, type: 'solid',  rx: 1, ry:  0.5 },
        { num: 4, type: 'solid',  rx: 2, ry: -1.0 },
        { num: 9, type: '9',      rx: 2, ry:  0.0 }, // 9-ball in dead center!
        { num: 5, type: 'solid',  rx: 2, ry:  1.0 },
        { num: 6, type: 'stripe', rx: 3, ry: -0.5 },
        { num: 7, type: 'stripe', rx: 3, ry:  0.5 },
        { num: 8, type: '8',      rx: 4, ry:  0.0 }
      ];

      rackPlan.forEach((p, idx) => {
        this.balls.push({
          id: idx + 1,
          num: p.num,
          type: p.type,
          x: apexX + p.rx * dx,
          y: apexY + p.ry * dy,
          vx: 0,
          vy: 0,
          r: ballRadius,
          active: true,
          potted: false
        });
      });

    } else if (this.mode === 1) {
      // ----------------------------------------------------------------------
      // MODE 2: 8-BALL QUICK RACK (8 object balls: 7 solids/stripes + 8-ball)
      // ----------------------------------------------------------------------
      const apexX = 172, apexY = 120;
      const dx = 8.0, dy = 9.2;

      const rackPlan = [
        { num: 1, type: 'solid',  rx: 0, ry: 0 },
        { num: 2, type: 'stripe', rx: 1, ry: -0.5 },
        { num: 3, type: 'solid',  rx: 1, ry:  0.5 },
        { num: 4, type: 'stripe', rx: 2, ry: -1.0 },
        { num: 8, type: '8',      rx: 2, ry:  0.0 }, // 8-ball in center!
        { num: 5, type: 'solid',  rx: 2, ry:  1.0 },
        { num: 6, type: 'stripe', rx: 3, ry: -0.5 },
        { num: 7, type: 'solid',  rx: 3, ry:  0.5 }
      ];

      rackPlan.forEach((p, idx) => {
        this.balls.push({
          id: idx + 1,
          num: p.num,
          type: p.type,
          x: apexX + p.rx * dx,
          y: apexY + p.ry * dy,
          vx: 0,
          vy: 0,
          r: ballRadius,
          active: true,
          potted: false
        });
      });

    } else if (this.mode === 2) {
      // ----------------------------------------------------------------------
      // MODE 3: TRICK SHOT CHALLENGES (5 Puzzle Levels)
      // ----------------------------------------------------------------------
      this.initTrickLevel(this.trickLevel);
    }
  },

  initTrickLevel(lvl) {
    const ballRadius = 4.5;
    this.mode = 2;
    this.balls = [];
    this.obstacles = [];
    this.trickLevel = Math.max(0, Math.min(4, lvl));
    this.won = false;
    this.lost = false;
    this.shots = 0;
    this.pots = 0;
    this.cue.vx = 0;
    this.cue.vy = 0;
    this.cue.active = true;
    this.ballInHand = false;
    this.foulMsg = "";
    this.foulTimer = 0;
    this.charging = false;
    this.power = 0;
    this.strikeAnim = 0;
    this.touchPulling = false;

    if (this.trickLevel === 0) {
      // Level 1: "THE SPLIT" - Pot both balls in 2 shots
      this.trickShotsMax = 2;
      this.cue.x = 65; this.cue.y = 120;
      this.balls.push(
        { id: 1, num: 1, type: 'solid', x: 175, y: 72, vx: 0, vy: 0, r: ballRadius, active: true, potted: false },
        { id: 2, num: 2, type: 'solid', x: 175, y: 168, vx: 0, vy: 0, r: ballRadius, active: true, potted: false }
      );
    } else if (this.trickLevel === 1) {
      // Level 2: "BANK AROUND WALL" - Direct line blocked by bumper barrier
      this.trickShotsMax = 2;
      this.cue.x = 60; this.cue.y = 120;
      this.balls.push(
        { id: 1, num: 1, type: 'solid', x: 185, y: 120, vx: 0, vy: 0, r: ballRadius, active: true, potted: false }
      );
      this.obstacles.push({
        type: 'box', x: 120, y: 72, w: 14, h: 96
      });
    } else if (this.trickLevel === 2) {
      // Level 3: "CAROM COMBO" - Hit Ball 1 to push Ball 2 into pocket
      this.trickShotsMax = 1;
      this.cue.x = 62; this.cue.y = 96;
      this.balls.push(
        { id: 1, num: 1, type: 'solid', x: 122, y: 82, vx: 0, vy: 0, r: ballRadius, active: true, potted: false },
        { id: 2, num: 9, type: '9',     x: 178, y: 60, vx: 0, vy: 0, r: ballRadius, active: true, potted: false }
      );
      this.obstacles.push({
        type: 'box', x: 142, y: 92, w: 12, h: 84
      });
    } else if (this.trickLevel === 3) {
      // Level 4: "AROUND THE HORN" - Double bank through dual baffles
      this.trickShotsMax = 2;
      this.cue.x = 55; this.cue.y = 66;
      this.balls.push(
        { id: 1, num: 1, type: 'solid', x: 195, y: 174, vx: 0, vy: 0, r: ballRadius, active: true, potted: false }
      );
      this.obstacles.push(
        { type: 'box', x: 42, y: 106, w: 98, h: 10 },
        { type: 'box', x: 116, y: 140, w: 98, h: 10 }
      );
    } else if (this.trickLevel === 4) {
      // Level 5: "PINPOINT CUT" - Cut shot between hazard posts into side pocket
      this.trickShotsMax = 1;
      this.cue.x = 76; this.cue.y = 156;
      this.balls.push(
        { id: 1, num: 1, type: 'solid', x: 128, y: 84, vx: 0, vy: 0, r: ballRadius, active: true, potted: false }
      );
      this.obstacles.push(
        { type: 'circle', x: 114, y: 55, r: 7 },
        { type: 'circle', x: 142, y: 55, r: 7 }
      );
    }
  },

  // --------------------------------------------------------------------------
  // UTILITIES & STATE QUERIES
  // --------------------------------------------------------------------------
  lowestActiveBall() {
    let minNum = 999;
    for (let b of this.balls) {
      if (b.active && b.num < minNum) minNum = b.num;
    }
    return minNum === 999 ? null : minNum;
  },

  totalPotsNeeded() {
    if (this.mode === 0) return 9;
    if (this.mode === 1) return 8;
    return this.balls.length;
  },

  getModeTitle() {
    if (this.mode === 0) return "MODE: 9-BALL";
    if (this.mode === 1) return "MODE: 8-BALL";
    return "TRICK " + (this.trickLevel + 1) + "/5";
  },

  getModeName() {
    if (this.mode === 0) return "9-BALL CLASSIC";
    if (this.mode === 1) return "8-BALL QUICK RACK";
    const names = ["THE SPLIT", "BANK SPECIAL", "CAROM COMBO", "AROUND HORN", "PINPOINT CUT"];
    return "TRICK: " + (names[this.trickLevel] || "CHALLENGE");
  },

  triggerFoul(msg) {
    this.foulMsg = msg;
    this.foulTimer = 3.5;
    this.ballInHand = true;
    this.cue.active = false;
    this.cue.vx = 0;
    this.cue.vy = 0;
    if (typeof APU !== 'undefined') APU.sfx('HURT');
  },

  // --------------------------------------------------------------------------
  // PREDICTIVE RAYCAST AIM GUIDE
  // --------------------------------------------------------------------------
  computeRaycast() {
    const rCue = this.cue.r;
    const x0 = this.cue.x;
    const y0 = this.cue.y;
    const dx = Math.cos(this.angle);
    const dy = Math.sin(this.angle);

    let tMin = 300;
    let hitType = 'none';
    let hitBall = null;
    let hitNormal = { x: 0, y: 0 };

    // 1. Intersect active object balls (2r bounding cylinder)
    for (let b of this.balls) {
      if (!b.active) continue;
      const vx = b.x - x0;
      const vy = b.y - y0;
      const tProj = vx * dx + vy * dy;
      if (tProj > 0) {
        const perpSq = (vx * vx + vy * vy) - (tProj * tProj);
        const colDist = rCue + b.r;
        if (perpSq < colDist * colDist) {
          const tHit = tProj - Math.sqrt(Math.max(0, colDist * colDist - perpSq));
          if (tHit > 0 && tHit < tMin) {
            tMin = tHit;
            hitType = 'ball';
            hitBall = b;
          }
        }
      }
    }

    // 2. Intersect table cushion rails
    const xMin = 30.5, xMax = 225.5;
    const yMin = 42.5, yMax = 197.5;

    if (dx < 0) {
      const t = (xMin - x0) / dx;
      if (t > 0 && t < tMin) {
        tMin = t;
        hitType = 'cushion';
        hitNormal = { x: 1, y: 0 };
      }
    } else if (dx > 0) {
      const t = (xMax - x0) / dx;
      if (t > 0 && t < tMin) {
        tMin = t;
        hitType = 'cushion';
        hitNormal = { x: -1, y: 0 };
      }
    }

    if (dy < 0) {
      const t = (yMin - y0) / dy;
      if (t > 0 && t < tMin) {
        tMin = t;
        hitType = 'cushion';
        hitNormal = { x: 0, y: 1 };
      }
    } else if (dy > 0) {
      const t = (yMax - y0) / dy;
      if (t > 0 && t < tMin) {
        tMin = t;
        hitType = 'cushion';
        hitNormal = { x: 0, y: -1 };
      }
    }

    // 3. Intersect trick shot obstacles
    for (let obs of this.obstacles) {
      if (obs.type === 'circle') {
        const vx = obs.x - x0;
        const vy = obs.y - y0;
        const tProj = vx * dx + vy * dy;
        if (tProj > 0) {
          const perpSq = (vx * vx + vy * vy) - (tProj * tProj);
          const colDist = rCue + obs.r;
          if (perpSq < colDist * colDist) {
            const tHit = tProj - Math.sqrt(Math.max(0, colDist * colDist - perpSq));
            if (tHit > 0 && tHit < tMin) {
              tMin = tHit;
              hitType = 'obstacle';
              hitNormal = { x: (x0 + dx * tHit - obs.x) / colDist, y: (y0 + dy * tHit - obs.y) / colDist };
            }
          }
        }
      } else if (obs.type === 'box') {
        const bMinX = obs.x - rCue, bMaxX = obs.x + obs.w + rCue;
        const bMinY = obs.y - rCue, bMaxY = obs.y + obs.h + rCue;
        const tx1 = (bMinX - x0) / (dx || 0.0001);
        const tx2 = (bMaxX - x0) / (dx || 0.0001);
        const ty1 = (bMinY - y0) / (dy || 0.0001);
        const ty2 = (bMaxY - y0) / (dy || 0.0001);
        const tNearX = Math.min(tx1, tx2), tFarX = Math.max(tx1, tx2);
        const tNearY = Math.min(ty1, ty2), tFarY = Math.max(ty1, ty2);
        const tNear = Math.max(tNearX, tNearY);
        const tFar = Math.min(tFarX, tFarY);
        if (tNear < tFar && tNear > 0 && tNear < tMin) {
          tMin = tNear;
          hitType = 'obstacle';
          hitNormal = (tNearX > tNearY) ? { x: dx > 0 ? -1 : 1, y: 0 } : { x: 0, y: dy > 0 ? -1 : 1 };
        }
      }
    }

    const gx = x0 + dx * tMin;
    const gy = y0 + dy * tMin;

    let targetDeflect = null;
    let cueDeflect = null;

    if (hitType === 'ball' && hitBall) {
      let nx = hitBall.x - gx;
      let ny = hitBall.y - gy;
      const len = Math.hypot(nx, ny) || 1;
      nx /= len; ny /= len;

      targetDeflect = { x: nx, y: ny };

      const dot = dx * nx + dy * ny;
      const tx = dx - dot * nx;
      const ty = dy - dot * ny;
      const tLen = Math.hypot(tx, ty);
      if (tLen > 0.04) {
        cueDeflect = { x: tx / tLen, y: ty / tLen };
      }
    } else if (hitType === 'cushion' || hitType === 'obstacle') {
      const dot = dx * hitNormal.x + dy * hitNormal.y;
      cueDeflect = {
        x: dx - 2 * dot * hitNormal.x,
        y: dy - 2 * dot * hitNormal.y
      };
    }

    return {
      t: tMin,
      gx, gy,
      hitType,
      hitBall,
      targetDeflect,
      cueDeflect
    };
  },

  // --------------------------------------------------------------------------
  // SHOT TRIGGER & PHYSICS EXECUTION
  // --------------------------------------------------------------------------
  shoot(powerVal) {
    this.shots++;
    const speed = (powerVal / 100) * 350;
    this.cue.vx = Math.cos(this.angle) * speed;
    this.cue.vy = Math.sin(this.angle) * speed;
    this.cue.active = true;
    this.strikeAnim = 0.14;
    this.firstHitBall = null;
    this.sfxCueHit(powerVal);
  },

  // --------------------------------------------------------------------------
  // UPDATE LOOP (Substepped continuous physics)
  // --------------------------------------------------------------------------
  update(dt) {
    if (this.strikeAnim > 0) {
      this.strikeAnim = Math.max(0, this.strikeAnim - dt);
    }
    if (this.foulTimer > 0) {
      this.foulTimer = Math.max(0, this.foulTimer - dt);
    }

    // Win / Loss modal handling
    if (this.won) {
      if (PAD.hit('a') || PAD.hit('start')) {
        if (this.mode === 2 && this.trickLevel < 4) {
          this.initTrickLevel(this.trickLevel + 1);
        } else {
          this.initMode(this.mode);
        }
      } else if (PAD.hit('select')) {
        this.initMode((this.mode + 1) % 3);
      }
      return;
    }

    if (this.lost) {
      if (PAD.hit('a') || PAD.hit('start')) {
        this.initTrickLevel(this.trickLevel);
      } else if (PAD.hit('select')) {
        this.initMode((this.mode + 1) % 3);
      }
      return;
    }

    const allBalls = [this.cue, ...this.balls];
    const isMoving = allBalls.some(b => b.active && Math.hypot(b.vx, b.vy) > 3.0);

    // ------------------------------------------------------------------------
    // BALL-IN-HAND REPOSITIONING
    // ------------------------------------------------------------------------
    if (this.ballInHand) {
      const moveSpeed = 90 * dt;
      if (PAD.state.left)  this.cue.x -= moveSpeed;
      if (PAD.state.right) this.cue.x += moveSpeed;
      if (PAD.state.up)    this.cue.y -= moveSpeed;
      if (PAD.state.down)  this.cue.y += moveSpeed;

      if (PAD.pointer && PAD.pointer.down) {
        this.cue.x = PAD.pointer.x;
        this.cue.y = PAD.pointer.y;
      }

      this.cue.x = Math.max(34, Math.min(222, this.cue.x));
      this.cue.y = Math.max(46, Math.min(194, this.cue.y));

      const canPlace = !this.balls.some(b => b.active && Math.hypot(b.x - this.cue.x, b.y - this.cue.y) < 10);
      if (canPlace && (PAD.hit('a') || (PAD.tapPos && !PAD.pointer.down))) {
        this.ballInHand = false;
        this.cue.active = true;
        this.cue.vx = 0;
        this.cue.vy = 0;
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
      }
      return;
    }

    // ------------------------------------------------------------------------
    // INPUT HANDLING (When balls are stationary)
    // ------------------------------------------------------------------------
    if (!isMoving) {
      // Switch game modes via SELECT
      if (PAD.hit('select')) {
        this.initMode((this.mode + 1) % 3);
        if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
        return;
      }

      // In Trick Shot mode: Up/Down or B switches challenge level
      if (this.mode === 2) {
        if (PAD.hit('up')) {
          this.initTrickLevel((this.trickLevel - 1 + 5) % 5);
          if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
          return;
        } else if (PAD.hit('down')) {
          this.initTrickLevel((this.trickLevel + 1) % 5);
          if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
          return;
        }
      }

      // D-pad Aiming: Left/Right to rotate cue (hold [B] for precision fine-nudge)
      const rotSpeed = PAD.state.b ? 0.75 : 2.2;
      if (PAD.state.left)  this.angle -= rotSpeed * dt;
      if (PAD.state.right) this.angle += rotSpeed * dt;

      // Tap on table to re-orient cue direction immediately
      if (PAD.tapPos) {
        const dist = Math.hypot(PAD.tapPos.x - this.cue.x, PAD.tapPos.y - this.cue.y);
        if (dist >= 16) {
          this.angle = Math.atan2(PAD.tapPos.y - this.cue.y, PAD.tapPos.x - this.cue.x);
        }
      }

      // Mobile Touch Slingshot Pull-back
      if (PAD.pointer && PAD.pointer.down) {
        const distToCue = Math.hypot(PAD.pointer.x - this.cue.x, PAD.pointer.y - this.cue.y);
        if (!this.touchPulling && distToCue < 32) {
          this.touchPulling = true;
        }
        if (this.touchPulling) {
          const dx = this.cue.x - PAD.pointer.x;
          const dy = this.cue.y - PAD.pointer.y;
          const pullDist = Math.hypot(dx, dy);
          if (pullDist > 4) {
            this.angle = Math.atan2(dy, dx);
            this.power = Math.min(100, Math.max(5, (pullDist / 50) * 100));
          }
        }
      } else {
        if (this.touchPulling) {
          this.touchPulling = false;
          if (this.power >= 10) {
            this.shoot(this.power);
          }
          this.power = 0;
          this.chargeDir = 1;
        }
      }

      // Button [A] Power Meter Charging
      if (PAD.state.a) {
        this.charging = true;
        this.power += this.chargeDir * 125 * dt;
        if (this.power >= 100) {
          this.power = 100;
          this.chargeDir = -1;
        } else if (this.power <= 5) {
          this.power = 5;
          this.chargeDir = 1;
        }
      } else if (this.charging) {
        this.charging = false;
        this.shoot(this.power);
        this.power = 0;
        this.chargeDir = 1;
      }
    }

    // ------------------------------------------------------------------------
    // CONTINUOUS SUBSTEPPED BILLIARDS PHYSICS (4 substeps / frame)
    // ------------------------------------------------------------------------
    const diff = (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : 1;
    // Difficulty friction & pocket tuning:
    // EASY: slightly slicker felt, larger pocket funnel
    // NORMAL: standard felt, standard pockets
    // HARD: higher friction decel, narrower pockets
    const fricMultipliers = [0.85, 1.0, 1.2];
    const suckRadii = [13.0, 10.5, 8.5];
    const dropRadii = [7.5, 6.5, 5.5];

    const fricMult = fricMultipliers[diff] || 1.0;
    const suckRadius = suckRadii[diff] || 10.5;
    const dropRadius = dropRadii[diff] || 6.5;

    const subSteps = 4;
    const subDt = Math.min(0.04, dt) / subSteps;
    const cushionRestitution = 0.82;

    for (let step = 0; step < subSteps; step++) {
      // 1. Motion & Felt Rolling Friction
      for (let b of allBalls) {
        if (!b.active) continue;
        const speed = Math.hypot(b.vx, b.vy);
        if (speed > 0) {
          const decel = 32.0 * fricMult;
          const newSpeed = Math.max(0, speed - decel * subDt) * Math.pow(0.992, subDt * 60);
          b.vx = (b.vx / speed) * newSpeed;
          b.vy = (b.vy / speed) * newSpeed;
          if (newSpeed < 1.2) {
            b.vx = 0; b.vy = 0;
          }
        }
        b.x += b.vx * subDt;
        b.y += b.vy * subDt;

        // 2. Pocket Drop & Suction Funnel
        for (let p of this.pockets) {
          const pdx = p[0] - b.x;
          const pdy = p[1] - b.y;
          const pdist = Math.hypot(pdx, pdy);
          if (pdist < suckRadius) {
            const suckForce = (1.0 - pdist / suckRadius) * 75;
            b.vx += (pdx / (pdist || 1)) * suckForce * subDt;
            b.vy += (pdy / (pdist || 1)) * suckForce * subDt;

            if (pdist < dropRadius) {
              this.sfxPocket();
              if (b === this.cue) {
                b.active = false;
                b.vx = 0; b.vy = 0;
                this.triggerFoul("SCRATCH! BALL IN HAND");
              } else {
                b.active = false;
                b.vx = 0; b.vy = 0;
                b.potted = true;
                this.pots++;
                this.score += 500;
                if (typeof SAVE !== 'undefined') SAVE.setScore(this.id, this.score);
              }
              break;
            }
          }
        }

        // 3. Cushion Bounces (with opening clearances for pockets)
        // Left & Right rail cushions
        if (b.y >= 46 && b.y <= 194) {
          if (b.x < 30.5) {
            b.x = 30.5;
            b.vx = Math.abs(b.vx) * cushionRestitution;
            this.sfxCushion(Math.abs(b.vx));
          } else if (b.x > 225.5) {
            b.x = 225.5;
            b.vx = -Math.abs(b.vx) * cushionRestitution;
            this.sfxCushion(Math.abs(b.vx));
          }
        }

        // Top & Bottom rail cushions (split around side pockets)
        const inTopBottomCushion = (b.x >= 34 && b.x <= 122) || (b.x >= 134 && b.x <= 222);
        if (inTopBottomCushion) {
          if (b.y < 42.5) {
            b.y = 42.5;
            b.vy = Math.abs(b.vy) * cushionRestitution;
            this.sfxCushion(Math.abs(b.vy));
          } else if (b.y > 197.5) {
            b.y = 197.5;
            b.vy = -Math.abs(b.vy) * cushionRestitution;
            this.sfxCushion(Math.abs(b.vy));
          }
        }

        // Failsafe clamp to table edge
        if (b.active) {
          b.x = Math.max(26, Math.min(230, b.x));
          b.y = Math.max(38, Math.min(202, b.y));
        }

        // 4. Trick Shot Obstacle Bounces
        for (let obs of this.obstacles) {
          if (obs.type === 'box') {
            const cx = Math.max(obs.x, Math.min(obs.x + obs.w, b.x));
            const cy = Math.max(obs.y, Math.min(obs.y + obs.h, b.y));
            const dx = b.x - cx;
            const dy = b.y - cy;
            const dist = Math.hypot(dx, dy);
            if (dist < b.r && dist > 0.0001) {
              const nx = dx / dist, ny = dy / dist;
              const overlap = b.r - dist;
              b.x += nx * overlap;
              b.y += ny * overlap;
              const vDotN = b.vx * nx + b.vy * ny;
              if (vDotN < 0) {
                b.vx -= (1 + cushionRestitution) * vDotN * nx;
                b.vy -= (1 + cushionRestitution) * vDotN * ny;
                this.sfxCushion(Math.abs(vDotN));
              }
            }
          } else if (obs.type === 'circle') {
            const dx = b.x - obs.x;
            const dy = b.y - obs.y;
            const dist = Math.hypot(dx, dy);
            const minDist = b.r + obs.r;
            if (dist < minDist && dist > 0.0001) {
              const nx = dx / dist, ny = dy / dist;
              const overlap = minDist - dist;
              b.x += nx * overlap;
              b.y += ny * overlap;
              const vDotN = b.vx * nx + b.vy * ny;
              if (vDotN < 0) {
                b.vx -= (1 + cushionRestitution) * vDotN * nx;
                b.vy -= (1 + cushionRestitution) * vDotN * ny;
                this.sfxCushion(Math.abs(vDotN));
              }
            }
          }
        }
      }

      // 5. Ball-to-Ball Elastic Collisions (Linear momentum conservation)
      for (let i = 0; i < allBalls.length; i++) {
        const b1 = allBalls[i];
        if (!b1.active) continue;
        for (let j = i + 1; j < allBalls.length; j++) {
          const b2 = allBalls[j];
          if (!b2.active) continue;

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const distSq = dx * dx + dy * dy;
          const minDist = b1.r + b2.r; // 9.0 px

          if (distSq < minDist * minDist && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;

            // Separate overlapping balls
            b1.x -= nx * overlap * 0.5;
            b1.y -= ny * overlap * 0.5;
            b2.x += nx * overlap * 0.5;
            b2.y += ny * overlap * 0.5;

            // Relative approach velocity along impact normal
            const rvx = b1.vx - b2.vx;
            const rvy = b1.vy - b2.vy;
            const velAlongNormal = rvx * nx + rvy * ny;

            if (velAlongNormal > 0) {
              const restitution = 0.96; // Phenolic billiard balls
              const impulse = (1 + restitution) * velAlongNormal * 0.5;

              b1.vx -= impulse * nx;
              b1.vy -= impulse * ny;
              b2.vx += impulse * nx;
              b2.vy += impulse * ny;

              // Record first ball contacted by cue ball for foul check
              if (b1 === this.cue && !this.firstHitBall) {
                this.firstHitBall = b2;
              } else if (b2 === this.cue && !this.firstHitBall) {
                this.firstHitBall = b1;
              }

              this.sfxClack(velAlongNormal);
            }
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // SHOT CONCLUSION & WIN/LOSS CHECKS
    // ------------------------------------------------------------------------
    if (this.wasMoving && !isMoving) {
      this.onShotFinished();
    }
    this.wasMoving = isMoving;
  },

  onShotFinished() {
    // Check 9-Ball rules
    if (this.mode === 0) {
      const targetNum = this.lowestActiveBall();
      // Check if 9-ball potted
      const ball9 = this.balls.find(b => b.num === 9);
      const is9Potted = ball9 && !ball9.active;

      // Contact rule: must contact lowest ball first
      if (!this.ballInHand) {
        if (!this.firstHitBall) {
          this.triggerFoul("FOUL: NO BALL HIT");
        } else if (targetNum !== null && this.firstHitBall.num !== targetNum) {
          this.triggerFoul("FOUL: HIT #" + targetNum + " FIRST");
        }
      }

      if (is9Potted) {
        if (this.ballInHand) {
          // 9-Ball potted on foul -> respot to foot spot
          ball9.active = true;
          ball9.x = 172; ball9.y = 120;
          ball9.vx = 0; ball9.vy = 0;
        } else {
          // Legally potted 9-Ball -> WIN!
          this.won = true;
          this.score = Math.max(0, 10000 - this.shots * 250 + this.pots * 500);
          if (typeof SAVE !== 'undefined') SAVE.setScore(this.id, this.score);
          if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
        }
      } else if (this.balls.every(b => !b.active)) {
        this.won = true;
        this.score = Math.max(0, 10000 - this.shots * 250 + this.pots * 500);
        if (typeof SAVE !== 'undefined') SAVE.setScore(this.id, this.score);
        if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
      }

    } else if (this.mode === 1) {
      // 8-Ball Quick Rack rules
      const ball8 = this.balls.find(b => b.num === 8);
      const is8Potted = ball8 && !ball8.active;
      const otherBallsRemain = this.balls.some(b => b.num !== 8 && b.active);

      if (is8Potted) {
        if (otherBallsRemain) {
          // Early 8-ball -> respot with penalty
          ball8.active = true;
          ball8.x = 172; ball8.y = 120;
          ball8.vx = 0; ball8.vy = 0;
          this.triggerFoul("EARLY 8-BALL! RESOTTED");
        } else {
          // Win!
          this.won = true;
          this.score = Math.max(0, 8000 - this.shots * 200 + this.pots * 400);
          if (typeof SAVE !== 'undefined') SAVE.setScore(this.id, this.score);
          if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
        }
      }

    } else if (this.mode === 2) {
      // Trick Shot challenge rules
      const allPotted = this.balls.every(b => !b.active);
      if (allPotted) {
        this.won = true;
        this.score += 2000;
        if (typeof SAVE !== 'undefined') SAVE.setScore(this.id, this.score);
        if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
      } else if (this.shots >= this.trickShotsMax) {
        this.lost = true;
        if (typeof APU !== 'undefined') APU.sfx('HURT');
      }
    }
  },

  // --------------------------------------------------------------------------
  // VISUAL RENDERING
  // --------------------------------------------------------------------------
  drawBall(g, b) {
    if (!b.active) return;
    const bx = Math.round(b.x);
    const by = Math.round(b.y);

    if (b.type === 'cue') {
      g.disc(bx, by, 4, 3);
      g.px(bx - 1, by - 1, 3);
      g.px(bx + 1, by + 1, 2);
    } else if (b.num === 8) {
      g.disc(bx, by, 4, 0);
      g.circle(bx, by, 4, 3);
      g.disc(bx, by, 1, 3);
      g.px(bx, by, 0);
    } else if (b.num === 9) {
      g.disc(bx, by, 4, 3);
      g.rect(bx - 3, by - 1, 7, 3, 2);
      g.px(bx, by, 3);
    } else if (b.type === 'stripe') {
      g.disc(bx, by, 4, 3);
      g.rect(bx - 3, by - 1, 7, 3, 1);
      g.px(bx, by, 3);
    } else {
      g.disc(bx, by, 4, 2);
      g.px(bx, by, 3);
    }

    // Specular shine highlight dot
    g.px(bx - 2, by - 2, 3);
  },

  drawCueStick(g) {
    const stickLen = 42;
    const backOffset = 6 + (this.power / 100) * 16 - (this.strikeAnim > 0 ? (1.0 - this.strikeAnim / 0.14) * 20 : 0);
    const stickAngle = this.angle + Math.PI;
    const cosS = Math.cos(stickAngle);
    const sinS = Math.sin(stickAngle);

    const tipX = this.cue.x + cosS * (this.cue.r + backOffset);
    const tipY = this.cue.y + sinS * (this.cue.r + backOffset);
    const midX = tipX + cosS * 24;
    const midY = tipY + sinS * 24;
    const buttX = tipX + cosS * stickLen;
    const buttY = tipY + sinS * stickLen;

    // Chalk tip (c=3), wooden shaft (c=2), butt grip (c=1)
    g.line(Math.round(tipX), Math.round(tipY), Math.round(tipX + cosS * 4), Math.round(tipY + sinS * 4), 3);
    g.line(Math.round(tipX + cosS * 4), Math.round(tipY + sinS * 4), Math.round(midX), Math.round(midY), 2);
    g.line(Math.round(midX), Math.round(midY), Math.round(buttX), Math.round(buttY), 1);
  },

  render(g) {
    g.clear(0);

    const allBalls = [this.cue, ...this.balls];
    const isMoving = allBalls.some(b => b.active && Math.hypot(b.vx, b.vy) > 3.0);

    // ------------------------------------------------------------------------
    // TOP HUD OVERLAY
    // ------------------------------------------------------------------------
    g.rect(0, 0, 256, 26, 0);
    g.line(0, 26, 256, 26, 1);

    // Row 1: Mode title, Shots, Pots, High Score
    g.text(this.getModeTitle(), 8, 4, 3);
    g.text("SHOTS:" + this.shots, 94, 4, 2);
    g.text("POTS:" + this.pots + "/" + this.totalPotsNeeded(), 148, 4, 2);
    const hiScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;
    g.textR("HI:" + hiScore, 248, 4, 3);

    // Row 2: Target / Remaining info & Power Gauge Bar
    if (this.mode === 0) {
      const tgt = this.lowestActiveBall();
      g.text("TGT:#" + (tgt || "-"), 8, 15, 3);
    } else if (this.mode === 1) {
      const rem = this.balls.filter(b => b.active && b.num !== 8).length;
      g.text(rem > 0 ? "REM:" + rem : "POT 8-BALL!", 8, 15, rem > 0 ? 2 : 3);
    } else {
      g.text("PAR:" + this.trickShotsMax, 8, 15, 2);
    }

    g.text("PWR", 80, 15, 2);
    g.box(100, 14, 60, 8, 2);
    const fillW = Math.round((this.power / 100) * 56);
    if (fillW > 0) {
      g.rect(102, 16, fillW, 4, this.power > 80 ? 3 : 2);
    }

    if (this.foulTimer > 0) {
      g.textR(this.foulMsg, 248, 15, 3);
    } else if (this.ballInHand) {
      g.textR("BALL IN HAND", 248, 15, 3);
    } else {
      g.textR("[SEL] MODE", 248, 15, 1);
    }

    // ------------------------------------------------------------------------
    // TABLE SURFACE & WOODEN RAILS
    // ------------------------------------------------------------------------
    // Wood frame
    g.rect(16, 28, 224, 184, 1);
    g.box(16, 28, 224, 184, 2);
    g.box(22, 34, 212, 172, 2);

    // Green felt playing surface
    g.rect(26, 38, 204, 164, 0);

    // Subtle baulk line & foot spot
    for (let ly = 42; ly <= 198; ly += 4) {
      g.px(76, ly, 1);
    }
    g.px(76, 120, 2);
    g.px(172, 120, 2);

    // Inlaid diamond aiming sights along rails
    const sightsX = [76, 128, 172];
    for (let sx of sightsX) {
      g.px(sx, 31, 3); g.px(sx - 1, 31, 2); g.px(sx + 1, 31, 2);
      g.px(sx, 209, 3); g.px(sx - 1, 209, 2); g.px(sx + 1, 209, 2);
    }
    const sightsY = [80, 120, 160];
    for (let sy of sightsY) {
      g.px(19, sy, 3); g.px(19, sy - 1, 2); g.px(19, sy + 1, 2);
      g.px(237, sy, 3); g.px(237, sy - 1, 2); g.px(237, sy + 1, 2);
    }

    // 6 Leather pockets with drop depth shading
    for (let p of this.pockets) {
      g.disc(p[0], p[1], 8, 1);
      g.circle(p[0], p[1], 8, 2);
      g.disc(p[0], p[1], 6, 0);
    }

    // Trick shot obstacles
    for (let obs of this.obstacles) {
      if (obs.type === 'box') {
        g.rect(obs.x, obs.y, obs.w, obs.h, 1);
        g.box(obs.x, obs.y, obs.w, obs.h, 3);
        for (let hx = obs.x + 2; hx < obs.x + obs.w - 2; hx += 4) {
          g.line(hx, obs.y + 1, Math.min(obs.x + obs.w - 1, hx + obs.h - 2), obs.y + obs.h - 1, 2);
        }
      } else if (obs.type === 'circle') {
        g.disc(obs.x, obs.y, obs.r, 2);
        g.circle(obs.x, obs.y, obs.r, 3);
        g.disc(obs.x, obs.y, 2, 0);
      }
    }

    // ------------------------------------------------------------------------
    // EXTENDED RAYCAST AIM GUIDE & CUE STICK
    // ------------------------------------------------------------------------
    if (!isMoving && !this.won && !this.lost && !this.ballInHand) {
      const ray = this.computeRaycast();

      // Dashed laser guide line from cue ball to ghost ball
      const steps = Math.floor(ray.t / 4);
      const cosA = Math.cos(this.angle);
      const sinA = Math.sin(this.angle);
      for (let s = 1; s < steps; s += 2) {
        const lx1 = this.cue.x + cosA * (s * 4);
        const ly1 = this.cue.y + sinA * (s * 4);
        const lx2 = this.cue.x + cosA * Math.min(ray.t, (s + 1) * 4);
        const ly2 = this.cue.y + sinA * Math.min(ray.t, (s + 1) * 4);
        g.line(Math.round(lx1), Math.round(ly1), Math.round(lx2), Math.round(ly2), 2);
      }

      // Ghost ball indicator outline
      g.circle(Math.round(ray.gx), Math.round(ray.gy), 4, 3);

      // Object ball projected deflection vector
      if (ray.hitType === 'ball' && ray.hitBall && ray.targetDeflect) {
        const bx = ray.hitBall.x;
        const by = ray.hitBall.y;
        const tx = bx + ray.targetDeflect.x * 24;
        const ty = by + ray.targetDeflect.y * 24;
        g.line(Math.round(bx), Math.round(by), Math.round(tx), Math.round(ty), 3);
        g.disc(Math.round(tx), Math.round(ty), 1, 3);
      }

      // Cue ball deflection vector
      if (ray.cueDeflect) {
        const cx = ray.gx + ray.cueDeflect.x * 16;
        const cy = ray.gy + ray.cueDeflect.y * 16;
        g.line(Math.round(ray.gx), Math.round(ray.gy), Math.round(cx), Math.round(cy), 2);
      }

      // Slingshot pull indicator line
      if (this.touchPulling && PAD.pointer && PAD.pointer.down) {
        g.line(Math.round(this.cue.x), Math.round(this.cue.y), Math.round(PAD.pointer.x), Math.round(PAD.pointer.y), 3);
        g.circle(Math.round(PAD.pointer.x), Math.round(PAD.pointer.y), 3, 3);
      }

      // Tapered cue stick
      this.drawCueStick(g);
    }

    // ------------------------------------------------------------------------
    // BALLS
    // ------------------------------------------------------------------------
    for (let b of this.balls) {
      this.drawBall(g, b);
    }

    // Cue ball
    if (this.cue.active) {
      this.drawBall(g, this.cue);
    }

    // Ball-in-hand placement indicator ring
    if (this.ballInHand) {
      const canPlace = !this.balls.some(b => b.active && Math.hypot(b.x - this.cue.x, b.y - this.cue.y) < 10);
      g.circle(Math.round(this.cue.x), Math.round(this.cue.y), 8, canPlace ? 3 : 1);
      g.disc(Math.round(this.cue.x), Math.round(this.cue.y), 4, canPlace ? 3 : 2);
    }

    // ------------------------------------------------------------------------
    // BOTTOM CONTROLS & STATUS BAR
    // ------------------------------------------------------------------------
    g.rect(0, 216, 256, 24, 0);
    g.line(0, 216, 256, 216, 1);

    if (this.ballInHand) {
      g.textC("FOUL! MOVE BALL WITH D-PAD/TOUCH. [A] PLACE", 222, 3);
    } else if (this.charging) {
      g.textC("CHARGING CUE... RELEASE [A] TO STRIKE", 222, 3);
    } else if (this.touchPulling) {
      g.textC("SLINGSHOT PULL: " + Math.round(this.power) + "%", 222, 3);
    } else if (isMoving) {
      g.textC("BALLS IN MOTION...", 222, 2);
    } else {
      g.textC("◀▶ AIM  HOLD [A] CHARGE  [B] FINE  TOUCH/DRAG", 222, 2);
    }

    // ------------------------------------------------------------------------
    // MODAL VICTORY / LOSS OVERLAYS
    // ------------------------------------------------------------------------
    if (this.won) {
      g.dither(32, 58, 192, 118, 0, 1);
      g.box(32, 58, 192, 118, 3);
      g.textC("★ VICTORY! TABLE CLEARED ★", 70, 3);
      g.textC(this.getModeName(), 84, 2);
      g.textC("SHOTS TAKEN: " + this.shots, 102, 3);
      g.textC("BALLS POTTED: " + this.pots, 114, 3);
      g.textC("FINAL SCORE: " + this.score, 128, 3);
      g.textC("[A] " + (this.mode === 2 && this.trickLevel < 4 ? "NEXT LEVEL" : "PLAY AGAIN"), 146, 3);
      g.textC("[SELECT] SWITCH MODE", 160, 2);
    } else if (this.lost) {
      g.dither(36, 68, 184, 98, 0, 1);
      g.box(36, 68, 184, 98, 3);
      g.textC("CHALLENGE FAILED", 80, 3);
      g.textC("EXCEEDED SHOT LIMIT (" + this.trickShotsMax + ")", 96, 2);
      g.textC("[A] RETRY CHALLENGE", 118, 3);
      g.textC("[SELECT] SWITCH MODE", 134, 2);
    }
  }
};
