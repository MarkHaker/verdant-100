// js/cartridges/cart_039_balance.js
// ============================================================================
// Cartridge #039: BALANCE
// ============================================================================
// A high-tension, kinetic arcade balancing simulation on the VERDANT-100.
// Accelerate the mechanical cart along the railed track to balance a tall
// inverted pendulum crowned with a spinning gyroscopic stabilizer.
// Fight shifting wind squalls, absorb boundary spring jolts, scare off
// perching crows with your brass horn, and catch celestial falling stars!
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[39] = {
  id: 39,
  name: "BALANCE",
  genre: 3,
  scoreLabel: "SECONDS",
  desc: "ACCELERATE CART LEFT/RIGHT TO BALANCE INVERTED PENDULUM IN WIND GUSTS!",

  // 32x32 Hand-Crafted Retro Icon: Balancing cart on track with angled pole & spinning gyro
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Wind gust speed streaks in sky
    g.line(x + 3, y + 4, x + 10, y + 4, 1);
    g.line(x + 1, y + 8, x + 7, y + 8, 1);
    g.line(x + 22, y + 6, x + 30, y + 6, 2);

    // Track rails at bottom
    g.line(x + 2, y + 26, x + 29, y + 26, 2);
    g.line(x + 2, y + 27, x + 29, y + 27, 1);
    for (let tx = 4; tx <= 28; tx += 6) {
      g.line(x + tx, y + 27, x + tx, y + 29, 1);
    }

    // Left & right bumper spring assemblies
    g.rect(x + 2, y + 22, 3, 5, 2);
    g.rect(x + 27, y + 22, 3, 5, 2);
    g.line(x + 5, y + 23, x + 8, y + 25, 2);
    g.line(x + 26, y + 23, x + 23, y + 25, 2);

    // Balancing Cart Chassis
    const cx = x + 14;
    const cy = y + 21;
    g.rect(cx - 6, cy, 13, 4, 2);
    g.box(cx - 6, cy, 13, 4, 3);
    // Spoked wheels
    g.circle(cx - 4, cy + 4, 2, 3);
    g.circle(cx + 4, cy + 4, 2, 3);
    g.px(cx - 4, cy + 4, 0);
    g.px(cx + 4, cy + 4, 0);

    // Plucky driver with goggles looking up
    g.disc(cx + 3, cy - 2, 2, 3);
    g.px(cx + 4, cy - 2, 0);

    // Angled Inverted Pendulum Pole
    const px0 = cx;
    const py0 = cy;
    const px1 = cx + 6;
    const py1 = cy - 16;
    g.line(px0, py0, px1, py1, 3);
    g.px(Math.floor((px0 + px1) / 2), Math.floor((py0 + py1) / 2), 2);

    // Spinning Balance Gyroscope / Flywheel at tip
    g.disc(px1, py1, 3, 3);
    g.circle(px1, py1, 4, 2);
    g.px(px1, py1, 0);
    // Gyro motion sparkles
    g.px(px1 - 3, py1 - 2, 3);
    g.px(px1 + 3, py1 + 2, 3);
    g.px(px1 + 1, py1 - 4, 2);
  },

  init() {
    // Kinematic track limits & geometry
    this.trackLeft = 20;
    this.trackRight = 220;
    this.trackCenter = 120;
    this.railY = 190;
    this.cartHalfW = 14;

    // Cart State
    this.cartX = 120;
    this.cartVX = 0;
    this.cartAX = 0;
    this.wheelRot = 0;

    // Spring Bumper State
    this.springRestLen = 14;
    this.leftSpringComp = 0;
    this.rightSpringComp = 0;

    // Inverted Pendulum Physics State
    this.poleL = 76;
    this.angle = 0.035; // gentle initial tilt to initiate active balance
    this.angVel = 0;
    this.angAcc = 0;
    this.gyroAngle = 0;

    // Gameplay Timers & Scoring
    this.time = 0;
    this.starsCaught = 0;
    this.birdsShooed = 0;
    this.over = false;
    this.crashTimer = 0;
    this.highScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;

    // Dynamic Wind Simulation
    this.wind = 0;
    this.windGustActive = false;
    this.windGustWarning = false;
    this.windGustDir = 1;
    this.windGustTimer = 0;
    this.nextGustTimer = 6.0 + Math.random() * 5.0;
    this.windsockAngle = 0;
    this.windsockFlutter = 0;
    this.windStreaks = [];

    // Mischievous Bird Mechanics
    this.bird = {
      active: false,
      state: 'none', // 'swoop' | 'perched' | 'flee'
      x: -20,
      y: 20,
      vx: 0,
      vy: 0,
      targetSide: 1, // 1 = right, -1 = left
      flapPhase: 0,
      perchTimer: 0,
      chirpTimer: 0
    };
    this.birdSpawnTimer = 8.0 + Math.random() * 6.0;

    // Lifetime statistics
    this.lifetimeStars = (this.lifetimeStars || 0);
    this.lifetimeBirds = (this.lifetimeBirds || 0);

    // Falling Star Pickups
    this.stars = [];
    this.starSpawnTimer = 7.0 + Math.random() * 5.0;

    // Milestone Tiers (15s Bronze, 30s Silver, 45s Gold, 60s Platinum)
    this.milestones = {
      bronze: false,
      silver: false,
      gold: false,
      platinum: false
    };
    this.banner = {
      active: false,
      text: '',
      sub: '',
      badge: '',
      timer: 0,
      y: -30
    };

    // Audio & Feedback Clocks
    this.shake = 0;
    this.creakTimer = 0;
    this.sweatTimer = 0;
    this.rollSoundTimer = 0;
    this.hornCooldown = 0;
    this.hornAnim = 0;
    this.lastCartDir = 0;

    // Active Particle Systems
    this.particles = [];
    this.floatTexts = [];
    this.dustParticles = [];

    // Prepopulate ambient dust / wind particles
    for (let i = 0; i < 18; i++) {
      this.dustParticles.push({
        x: Math.random() * 240,
        y: 20 + Math.random() * 160,
        spd: 20 + Math.random() * 40,
        life: Math.random() * 3.0,
        maxLife: 3.0
      });
    }
  },

  // Center text strictly within 240-wide CRT screen area
  centerText(g, str, y, c = 3, scale = 1) {
    str = String(str).toUpperCase();
    scale |= 0; if (scale < 1) scale = 1;
    const textW = (str.length * 5 - 1) * scale;
    const x = Math.floor((240 - textW) / 2);
    g.text(str, x, y, c, scale);
  },

  // Audio helpers using APU
  playHorn() {
    if (typeof APU === 'undefined') return;
    APU.tone(440, 0.08, 'triangle', 0.16);
    APU.tone(554, 0.12, 'triangle', 0.16, null, 0.06);
  },

  playSpringTwang() {
    if (typeof APU === 'undefined') return;
    APU.tone(260, 0.14, 'triangle', 0.18, 95);
    APU.noise(0.04, 0.10, 1100, 'bandpass');
  },

  playCreak() {
    if (typeof APU === 'undefined') return;
    APU.softTone(180 + Math.random() * 50, 0.07, 'triangle', 0.09, 0, 0.015, 650);
  },

  playBirdChirp() {
    if (typeof APU === 'undefined') return;
    APU.softTone(1500, 0.04, 'sine', 0.08);
    APU.softTone(1800, 0.05, 'sine', 0.08, 0.03);
  },

  playBirdSquawk() {
    if (typeof APU === 'undefined') return;
    APU.tone(850, 0.09, 'triangle', 0.15, 380);
    APU.noise(0.05, 0.10, 1500, 'bandpass');
  },

  playStarChime() {
    if (typeof APU === 'undefined') return;
    APU.softTone(1046.5, 0.08, 'sine', 0.12);
    APU.softTone(1318.5, 0.10, 'sine', 0.12, 0.05);
    APU.softTone(1567.98, 0.18, 'sine', 0.14, 0.10);
  },

  spawnFloatText(txt, x, y, col = 3) {
    this.floatTexts.push({
      txt: String(txt),
      x: x,
      y: y,
      vy: -24,
      life: 1.0,
      maxLife: 1.0,
      col: col
    });
  },

  triggerMilestone(tierName, subText, badge) {
    if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
    this.banner = {
      active: true,
      text: tierName,
      sub: subText,
      badge: badge,
      timer: 2.8,
      y: -24
    };
    // Sparkle burst around banner
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16;
      const spd = 30 + Math.random() * 40;
      this.particles.push({
        type: 'sparkle',
        x: 120,
        y: 45,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.8,
        col: 3
      });
    }
  },

  shooBird(scaredByShake = false) {
    if (!this.bird.active || this.bird.state === 'flee') return;
    this.bird.state = 'flee';
    this.bird.vx = (this.bird.x < 120 ? -60 : 60);
    this.bird.vy = -110;
    this.playBirdSquawk();
    this.birdsShooed++;
    this.lifetimeBirds++;
    this.spawnFloatText(scaredByShake ? "SHAKEN OFF! +50" : "HORN SHOO! +100", this.bird.x, this.bird.y - 10, 3);

    // Scatter feather particles
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        type: 'feather',
        x: this.bird.x,
        y: this.bird.y,
        vx: (Math.random() - 0.5) * 45,
        vy: -20 - Math.random() * 30,
        life: 1.2,
        col: 2
      });
    }
  },

  update(dt) {
    // ------------------------------------------------------------------------
    // GAME OVER CRASH STATE
    // ------------------------------------------------------------------------
    if (this.over) {
      this.crashTimer += dt;
      if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 8);

      // Particle physics during crash
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.type === 'splinter' || p.type === 'debris') p.vy += 220 * dt;
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      // Restart input: Gamepad buttons [A], [B], [Start], or screen tap
      const touchRestart = (PAD.tapPos || (PAD.pointer && PAD.pointer.down));
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || touchRestart) {
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        this.init();
      }
      return;
    }

    // ------------------------------------------------------------------------
    // ACTIVE SURVIVAL TIME & CLOCK UPDATES
    // ------------------------------------------------------------------------
    this.time += dt;
    this.gyroAngle += dt * 32.0;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 10);
    if (this.hornCooldown > 0) this.hornCooldown -= dt;
    if (this.hornAnim > 0) this.hornAnim -= dt;

    // Milestone checking
    if (this.time >= 15.0 && !this.milestones.bronze) {
      this.milestones.bronze = true;
      this.triggerMilestone("★ BRONZE BALANCER ★", "15 SECONDS REACHED", "[BRZ]");
    } else if (this.time >= 30.0 && !this.milestones.silver) {
      this.milestones.silver = true;
      this.triggerMilestone("★ SILVER BALANCER ★", "30 SECONDS REACHED", "[SLV]");
    } else if (this.time >= 45.0 && !this.milestones.gold) {
      this.milestones.gold = true;
      this.triggerMilestone("★ GOLDEN MASTER ★", "45 SECONDS REACHED", "[GLD]");
    } else if (this.time >= 60.0 && !this.milestones.platinum) {
      this.milestones.platinum = true;
      this.triggerMilestone("★ PLATINUM LEGEND ★", "60 SECONDS REACHED", "[PLT]");
    }

    // Banner animation
    if (this.banner.active) {
      this.banner.timer -= dt;
      if (this.banner.timer > 2.2) {
        this.banner.y += (42 - this.banner.y) * Math.min(1, dt * 12);
      } else if (this.banner.timer < 0.5) {
        this.banner.y += (-35 - this.banner.y) * Math.min(1, dt * 8);
      }
      if (this.banner.timer <= 0) this.banner.active = false;
    }

    // ------------------------------------------------------------------------
    // DYNAMIC WIND & SQUALL WEATHER SYSTEM
    // ------------------------------------------------------------------------
    // Baseline gentle breeze oscillation
    const baseBreeze = Math.sin(this.time * 0.45) * 0.35 + Math.sin(this.time * 1.1) * 0.20;

    // Gust storm scheduler
    this.nextGustTimer -= dt;
    if (this.nextGustTimer <= 0 && !this.windGustWarning && !this.windGustActive) {
      this.windGustWarning = true;
      this.windGustTimer = 1.8; // warning telegraph duration
      this.windGustDir = Math.random() < 0.5 ? -1 : 1;
      if (typeof APU !== 'undefined') APU.softTone(550, 0.12, 'sine', 0.05);
    }

    if (this.windGustWarning) {
      this.windGustTimer -= dt;
      if (this.windGustTimer <= 0) {
        this.windGustWarning = false;
        this.windGustActive = true;
        this.windGustTimer = 3.6; // gust duration
        if (typeof APU !== 'undefined') APU.noise(0.25, 0.10, 600, 'bandpass');
      }
    } else if (this.windGustActive) {
      this.windGustTimer -= dt;
      if (this.windGustTimer <= 0) {
        this.windGustActive = false;
        this.nextGustTimer = 10.0 + Math.random() * 8.0;
      }
    }

    // Target wind velocity
    let targetWind = baseBreeze;
    if (this.windGustWarning) {
      targetWind = this.windGustDir * 0.6; // pre-gust breeze shift
    } else if (this.windGustActive) {
      const gustProg = 1.0 - Math.abs((this.windGustTimer / 3.6) - 0.5) * 2.0; // smooth bell curve
      targetWind = this.windGustDir * (1.6 + gustProg * 1.0);
    }
    this.wind += (targetWind - this.wind) * Math.min(1, dt * 3.5);

    // Windsock rotation & flutter
    const targetWindsockAngle = Math.max(-1.15, Math.min(1.15, this.wind * 0.65));
    this.windsockAngle += (targetWindsockAngle - this.windsockAngle) * Math.min(1, dt * 6.0);
    this.windsockFlutter = Math.sin(this.time * (18.0 + Math.abs(this.wind) * 12.0)) * Math.abs(this.wind) * 2.5;

    // Wind dust / leaf particle simulation
    for (let i = 0; i < this.dustParticles.length; i++) {
      const dp = this.dustParticles[i];
      dp.x += (dp.spd * (this.wind >= 0 ? 1 : -1) + this.wind * 45) * dt;
      dp.y += Math.sin(this.time * 2.0 + i) * 12 * dt;
      if (dp.x > 242) dp.x = -2;
      if (dp.x < -2) dp.x = 242;
    }

    // ------------------------------------------------------------------------
    // INPUT HANDLING: KEYBOARD, GAMEPAD, & MOBILE TOUCH CONTROLS
    // ------------------------------------------------------------------------
    let inputAx = 0;
    const drivePower = 400;

    // D-Pad / Arrow keys
    if (PAD.held('left') || PAD.state.left) inputAx -= drivePower;
    if (PAD.held('right') || PAD.state.right) inputAx += drivePower;

    // Mobile On-Screen Touch Buttons: Left [x: 6..40, y: 202..234], Right [x: 44..78, y: 202..234]
    let touchLeftHeld = false;
    let touchRightHeld = false;
    let touchHornHit = false;

    if (PAD.pointer && PAD.pointer.down) {
      const px = PAD.pointer.x;
      const py = PAD.pointer.y;

      if (py >= 200 && py <= 236) {
        if (px >= 4 && px <= 42) {
          touchLeftHeld = true;
          inputAx -= drivePower;
        } else if (px >= 44 && px <= 82) {
          touchRightHeld = true;
          inputAx += drivePower;
        } else if (px >= 164 && px <= 236) {
          touchHornHit = true;
        }
      } else if (py >= 120 && py < 200) {
        // Direct Touch Drag: Touching lower screen smoothly tracks finger position
        const targetCartX = Math.max(48, Math.min(192, px));
        const diffX = targetCartX - this.cartX;
        inputAx += Math.max(-drivePower * 1.2, Math.min(drivePower * 1.2, diffX * 24.0));
      }
    }
    this.touchLeftHeld = touchLeftHeld;
    this.touchRightHeld = touchRightHeld;

    // Swipe gesture support
    if (PAD.swipe === 'left') {
      this.cartVX -= 90;
      PAD.vibrate(8);
    } else if (PAD.swipe === 'right') {
      this.cartVX += 90;
      PAD.vibrate(8);
    }

    // Horn / Scare Action [A] or Touch Horn Button
    const hornPressed = PAD.hit('a') || (PAD.tapPos && PAD.tapPos.y >= 200 && PAD.tapPos.x >= 164) || touchHornHit;
    if (hornPressed && this.hornCooldown <= 0) {
      this.hornCooldown = 0.32;
      this.hornAnim = 0.22;
      this.playHorn();
      PAD.vibrate(10);
      this.shooBird(false);

      // Horn acoustic shockwave arcs
      this.particles.push({
        type: 'horn_wave',
        x: this.cartX + 16,
        y: this.railY - 10,
        r: 4,
        maxR: 26,
        life: 0.35,
        col: 3
      });
    }

    // Rapid Cart Jerk Detection: violently jerking cart dislodges perching birds
    const curCartDir = Math.sign(inputAx);
    if (curCartDir !== 0 && this.lastCartDir !== 0 && curCartDir !== this.lastCartDir) {
      if (Math.abs(this.cartVX) > 90) {
        this.shooBird(true);
      }
    }
    if (curCartDir !== 0) this.lastCartDir = curCartDir;

    // ------------------------------------------------------------------------
    // RIGID & SPRING PHYSICS SUB-STEPPING (3 sub-steps per frame)
    // ------------------------------------------------------------------------
    const subSteps = 3;
    const sdt = dt / subSteps;

    for (let step = 0; step < subSteps; step++) {
      // 1. End-Stop Coil Spring Geometry & Forces
      // Left spring rest face is at x = 38 (bracket at 20 + spring 18)
      // Right spring rest face is at x = 202 (bracket at 220 - spring 18)
      const leftBumperFace = 38;
      const rightBumperFace = 202;
      let springForce = 0;

      this.leftSpringComp = 0;
      this.rightSpringComp = 0;

      const cartLeftEdge = this.cartX - this.cartHalfW;
      const cartRightEdge = this.cartX + this.cartHalfW;

      if (cartLeftEdge < leftBumperFace) {
        const delta = leftBumperFace - cartLeftEdge;
        this.leftSpringComp = Math.min(12, delta);
        // Spring recoil force + velocity damping
        springForce = 1200 * delta - 28 * this.cartVX;
        if (this.cartVX < -20 && step === 0) {
          this.playSpringTwang();
          this.shake = Math.min(6, this.shake + 2.5);
          PAD.vibrate(12);
        }
      } else if (cartRightEdge > rightBumperFace) {
        const delta = cartRightEdge - rightBumperFace;
        this.rightSpringComp = Math.min(12, delta);
        springForce = -1200 * delta - 28 * this.cartVX;
        if (this.cartVX > 20 && step === 0) {
          this.playSpringTwang();
          this.shake = Math.min(6, this.shake + 2.5);
          PAD.vibrate(12);
        }
      }

      // Total cart acceleration
      const rollFriction = -this.cartVX * 1.8;
      this.cartAX = inputAx + springForce + rollFriction;

      // Cart velocity & position update
      this.cartVX += this.cartAX * sdt;
      this.cartVX = Math.max(-240, Math.min(240, this.cartVX));
      this.cartX += this.cartVX * sdt;

      // Absolute hard limits
      if (this.cartX < 36) { this.cartX = 36; if (this.cartVX < 0) this.cartVX = 0; }
      if (this.cartX > 204) { this.cartX = 204; if (this.cartVX > 0) this.cartVX = 0; }

      // 2. Nonlinear Inverted Pendulum Angular Dynamics
      // Gravity torque: tau_g = g * sin(theta)
      const gravTorque = Math.sin(this.angle) * 11.2;

      // Inertial coupling from cart acceleration: tau_a = -ax * cos(theta) / L
      const accelCoupling = -this.cartAX * 0.041 * Math.cos(this.angle);

      // Aerodynamic wind drag torque
      const windTorque = this.wind * 4.6 * Math.cos(this.angle);

      // Bird mass & perch perturbation torque
      let birdTorque = 0;
      if (this.bird.active && this.bird.state === 'perched') {
        const birdMassOffset = this.bird.targetSide * 0.18;
        birdTorque = Math.sin(this.angle + birdMassOffset) * 4.8;
      }

      // Viscous & quadratic damping
      const angDamping = -this.angVel * 0.16 - Math.sign(this.angVel) * (this.angVel * this.angVel) * 0.035;

      // Total angular acceleration
      this.angAcc = gravTorque + accelCoupling + windTorque + birdTorque + angDamping;

      // Semi-implicit Euler integration
      this.angVel += this.angAcc * sdt;
      this.angle += this.angVel * sdt;
    }

    // Rotate wheel spokes visually with linear cart motion
    this.wheelRot += (this.cartVX * dt) / 4.0;

    // ------------------------------------------------------------------------
    // DANGER & STRESS FEEDBACK (> 25° / 0.436 rad)
    // ------------------------------------------------------------------------
    const absAngle = Math.abs(this.angle);
    if (absAngle > 0.436) {
      // Wood creaking stress sound
      this.creakTimer -= dt;
      if (this.creakTimer <= 0) {
        this.creakTimer = 0.28 + Math.random() * 0.15;
        this.playCreak();
      }

      // Panic sweat drops from driver
      this.sweatTimer -= dt;
      if (this.sweatTimer <= 0) {
        this.sweatTimer = 0.18;
        this.particles.push({
          type: 'sweat',
          x: this.cartX + (this.angle > 0 ? 5 : -5),
          y: this.railY - 14,
          vx: (this.angle > 0 ? 25 : -25) + (Math.random() - 0.5) * 15,
          vy: -35 - Math.random() * 20,
          life: 0.5,
          col: 3
        });
      }
    }

    // ------------------------------------------------------------------------
    // COLLAPSE & GAME OVER CHECK (> 66° / 1.15 rad)
    // ------------------------------------------------------------------------
    if (absAngle > 1.15) {
      this.over = true;
      this.shake = 9;
      if (typeof APU !== 'undefined') APU.sfx('BOOM');
      if (typeof SAVE !== 'undefined' && SAVE.setScore) {
        SAVE.setScore(this.id, Math.floor(this.time));
      }
      this.highScore = Math.max(this.highScore, Math.floor(this.time));
      PAD.vibrate(40);

      // Explosive shatter particles: wood splinters, brass flywheel, bolts
      const tipX = this.cartX + Math.sin(this.angle) * this.poleL;
      const tipY = (this.railY - 8) - Math.cos(this.angle) * this.poleL;

      for (let i = 0; i < 18; i++) {
        const a = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5);
        const spd = 40 + Math.random() * 85;
        this.particles.push({
          type: 'splinter',
          x: tipX + (Math.random() - 0.5) * 12,
          y: tipY + (Math.random() - 0.5) * 12,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd - 30,
          life: 1.4 + Math.random() * 0.6,
          col: (i % 2 === 0 ? 3 : 2)
        });
      }
      this.shooBird(false);
      return;
    }

    // ------------------------------------------------------------------------
    // MISCHIEVOUS BIRD LIFECYCLE
    // ------------------------------------------------------------------------
    const tipX = this.cartX + Math.sin(this.angle) * this.poleL;
    const tipY = (this.railY - 8) - Math.cos(this.angle) * this.poleL;

    if (!this.bird.active) {
      this.birdSpawnTimer -= dt;
      if (this.birdSpawnTimer <= 0) {
        this.bird.active = true;
        this.bird.state = 'swoop';
        const fromLeft = Math.random() < 0.5;
        this.bird.x = fromLeft ? -15 : 255;
        this.bird.y = 15 + Math.random() * 30;
        this.bird.targetSide = Math.random() < 0.5 ? -1 : 1;
        this.bird.perchTimer = 6.0;
        this.bird.chirpTimer = 0.5;
        this.playBirdChirp();
      }
    } else {
      this.bird.flapPhase += dt * 14.0;

      if (this.bird.state === 'swoop') {
        // Fly towards tip of pole
        const destX = tipX + this.bird.targetSide * 3;
        const destY = tipY - 4;
        const dx = destX - this.bird.x;
        const dy = destY - this.bird.y;
        const dist = Math.hypot(dx, dy);

        this.bird.x += dx * Math.min(1, dt * 3.5);
        this.bird.y += dy * Math.min(1, dt * 3.5);

        if (dist < 7) {
          this.bird.state = 'perched';
          this.playBirdChirp();
          this.spawnFloatText("BIRD LANDED!", tipX, tipY - 14, 2);
        }
      } else if (this.bird.state === 'perched') {
        // Cling to pole tip
        this.bird.x = tipX + this.bird.targetSide * 4;
        this.bird.y = tipY - 3;
        this.bird.perchTimer -= dt;
        if (this.bird.perchTimer <= 0) {
          this.shooBird(false);
        }
      } else if (this.bird.state === 'flee') {
        this.bird.x += this.bird.vx * dt;
        this.bird.y += this.bird.vy * dt;
        if (this.bird.y < -30 || this.bird.x < -30 || this.bird.x > 270) {
          this.bird.active = false;
          this.birdSpawnTimer = 12.0 + Math.random() * 8.0;
        }
      }
    }

    // ------------------------------------------------------------------------
    // FALLING CELESTIAL STARS
    // ------------------------------------------------------------------------
    this.starSpawnTimer -= dt;
    if (this.starSpawnTimer <= 0) {
      this.starSpawnTimer = 8.5 + Math.random() * 6.5;
      this.stars.push({
        x: 35 + Math.random() * 170,
        y: -10,
        vy: 32 + Math.random() * 16,
        swayPhase: Math.random() * Math.PI * 2,
        life: 8.0
      });
    }

    for (let i = this.stars.length - 1; i >= 0; i--) {
      const s = this.stars[i];
      s.y += s.vy * dt;
      s.swayPhase += dt * 3.5;
      s.x += Math.sin(s.swayPhase) * 14 * dt + this.wind * 10 * dt;

      // Pole tip collision detection
      const dTip = Math.hypot(s.x - tipX, s.y - tipY);
      if (dTip < 13.0) {
        this.stars.splice(i, 1);
        this.playStarChime();
        this.starsCaught++;
        this.lifetimeStars++;
        this.time += 5.0; // +5 seconds score bonus!
        this.spawnFloatText("+5.0S STAR BONUS!", tipX, tipY - 14, 3);

        // Star glitter particles
        for (let k = 0; k < 12; k++) {
          const a = (Math.PI * 2 * k) / 12;
          this.particles.push({
            type: 'sparkle',
            x: tipX,
            y: tipY,
            vx: Math.cos(a) * (25 + Math.random() * 35),
            vy: Math.sin(a) * (25 + Math.random() * 35),
            life: 0.6,
            col: 3
          });
        }
        continue;
      }

      if (s.y > 210) this.stars.splice(i, 1);
    }

    // ------------------------------------------------------------------------
    // PARTICLE & FLOATING TEXT UPDATES
    // ------------------------------------------------------------------------
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      if (p.type === 'sweat') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 120 * dt;
      } else if (p.type === 'feather') {
        p.x += (p.vx + this.wind * 20) * dt;
        p.y += (18 + Math.sin(p.life * 8.0) * 10) * dt;
      } else if (p.type === 'horn_wave') {
        p.r += (p.maxR - p.r) * Math.min(1, dt * 10);
      } else if (p.type === 'sparkle') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    }

    for (let i = this.floatTexts.length - 1; i >= 0; i--) {
      const ft = this.floatTexts[i];
      ft.life -= dt;
      ft.y += ft.vy * dt;
      if (ft.life <= 0) this.floatTexts.splice(i, 1);
    }
  },

  // --------------------------------------------------------------------------
  // RENDER: STRICT 240x240 CRT PHOSPHOR PRESENTATION
  // --------------------------------------------------------------------------
  render(g) {
    // Screen shake offset
    const ox = this.shake > 0 ? Math.floor((Math.random() - 0.5) * this.shake) : 0;
    const oy = this.shake > 0 ? Math.floor((Math.random() - 0.5) * this.shake) : 0;

    // Clear phosphor screen
    g.clear(0);

    // Subtle CRT background grid / distant hills in dither
    g.dither(0, 150, 240, 40, 0, 1);
    g.line(0, 150, 240, 150, 1);

    // Floating dust & wind particles
    for (let dp of this.dustParticles) {
      g.px(Math.floor(dp.x) + ox, Math.floor(dp.y) + oy, 1);
    }

    // ------------------------------------------------------------------------
    // TRACK BED, STEEL RAILS & END BUFFERS (x = 20 to x = 220)
    // ------------------------------------------------------------------------
    const ry = this.railY + oy;

    // Ballast stone foundation under rail
    g.rect(12, ry + 2, 216, 8, 1);

    // Cross-ties every 10 pixels
    for (let tx = 18; tx <= 222; tx += 10) {
      g.line(tx + ox, ry + 1, tx + ox, ry + 7, 2);
    }

    // Solid Steel Rail
    g.line(14 + ox, ry, 226 + ox, ry, 3);
    g.line(14 + ox, ry + 1, 226 + ox, ry + 1, 2);

    // Left End-Stop Assembly (x = 20)
    // Iron mounting bracket bolted to deck
    g.rect(14 + ox, ry - 8, 6, 10, 2);
    g.box(14 + ox, ry - 8, 6, 10, 3);
    g.px(16 + ox, ry - 6, 3); // bolt
    g.px(16 + ox, ry - 1, 3); // bolt

    // Left coil spring (zigzag coils squashing dynamically)
    const leftHeadX = Math.floor(38 - this.leftSpringComp) + ox;
    const lSpan = leftHeadX - (20 + ox);
    const lSegs = 4;
    let lxPrev = 20 + ox;
    let lyPrev = ry - 4;
    for (let s = 1; s <= lSegs; s++) {
      const lxNext = (20 + ox) + Math.floor((lSpan * s) / lSegs);
      const lyNext = (s % 2 === 1) ? ry - 7 : ry - 1;
      g.line(lxPrev, lyPrev, lxNext, lyNext, 2);
      lxPrev = lxNext;
      lyPrev = lyNext;
    }
    // Left bumper contact rubber head
    g.rect(leftHeadX, ry - 7, 3, 7, 3);

    // Right End-Stop Assembly (x = 220)
    g.rect(220 + ox, ry - 8, 6, 10, 2);
    g.box(220 + ox, ry - 8, 6, 10, 3);
    g.px(223 + ox, ry - 6, 3);
    g.px(223 + ox, ry - 1, 3);

    // Right coil spring
    const rightHeadX = Math.floor(202 + this.rightSpringComp) + ox;
    const rSpan = (220 + ox) - rightHeadX;
    let rxPrev = 220 + ox;
    let ryPrev = ry - 4;
    for (let s = 1; s <= lSegs; s++) {
      const rxNext = (220 + ox) - Math.floor((rSpan * s) / lSegs);
      const ryNext = (s % 2 === 1) ? ry - 7 : ry - 1;
      g.line(rxPrev, ryPrev, rxNext, ryNext, 2);
      rxPrev = rxNext;
      ryPrev = ryNext;
    }
    // Right bumper contact rubber head
    g.rect(rightHeadX - 3, ry - 7, 3, 7, 3);

    // ------------------------------------------------------------------------
    // BALANCING MECHANICAL CART & ANIMATED PILOT
    // ------------------------------------------------------------------------
    const cx = Math.floor(this.cartX) + ox;
    const cy = ry - 8;

    // Chassis iron deck with rivets
    g.rect(cx - 14, cy, 28, 7, 2);
    g.box(cx - 14, cy, 28, 7, 3);
    // Brass corner rivets
    g.px(cx - 12, cy + 1, 3);
    g.px(cx + 11, cy + 1, 3);
    g.px(cx - 12, cy + 5, 3);
    g.px(cx + 11, cy + 5, 3);
    // Radiator vents on chassis body
    g.line(cx - 5, cy + 2, cx - 5, cy + 4, 1);
    g.line(cx, cy + 2, cx, cy + 4, 1);
    g.line(cx + 5, cy + 2, cx + 5, cy + 4, 1);

    // Brass Universal Joint Pivot at Center
    g.rect(cx - 3, cy - 3, 7, 4, 3);
    g.disc(cx, cy - 2, 2, 2);
    g.px(cx, cy - 2, 3);

    // Spoked Wheels with Dynamic Rotation
    const wheelY = ry;
    const wheelLX = cx - 9;
    const wheelRX = cx + 9;

    // Draw Wheel Helper
    const drawSpokedWheel = (wx, wy, rot) => {
      g.circle(wx, wy, 4, 3);
      g.px(wx, wy, 3); // center hub
      // 4 rotating spokes
      for (let sp = 0; sp < 4; sp++) {
        const a = rot + (Math.PI / 2) * sp;
        const sx = wx + Math.round(Math.cos(a) * 3);
        const sy = wy + Math.round(Math.sin(a) * 3);
        g.line(wx, wy, sx, sy, 2);
      }
    };
    drawSpokedWheel(wheelLX, wheelY, this.wheelRot);
    drawSpokedWheel(wheelRX, wheelY, this.wheelRot);

    // Animated Brass Horn on Front/Side
    const hornBulbX = cx + 13;
    const hornBulbY = cy - 2;
    g.disc(hornBulbX, hornBulbY, 2, 3);
    g.line(hornBulbX - 2, hornBulbY, cx + 8, hornBulbY, 3);
    // Horn bell flare
    g.tri(hornBulbX + 2, hornBulbY - 3, hornBulbX + 5, hornBulbY - 4, hornBulbX + 5, hornBulbY + 2, 3);

    // Animated Driver / Aviator Mechanic
    const driverX = cx - 4;
    const driverY = cy - 7;
    const absAngle = Math.abs(this.angle);
    const isPanicked = absAngle > 0.436;

    // Driver body / overalls
    g.rect(driverX - 2, driverY + 2, 5, 4, 2);
    // Driver head / aviator cap
    g.disc(driverX, driverY, 3, 2);
    // Goggles
    g.rect(driverX - 2, driverY - 1, 5, 2, 3);
    // Eyes looking up towards pole tip
    const lookOffset = Math.sign(Math.sin(this.angle));
    if (isPanicked) {
      // Wide alarmed eyes
      g.px(driverX - 1, driverY - 1, 0);
      g.px(driverX + 1, driverY - 1, 0);
      // Open shouting mouth
      g.px(driverX, driverY + 2, 0);
    } else {
      g.px(driverX - 1 + lookOffset, driverY - 1, 0);
      g.px(driverX + 1 + lookOffset, driverY - 1, 0);
    }
    // Arm pulling horn bulb when horn is honked
    if (this.hornAnim > 0) {
      g.line(driverX + 2, driverY + 2, hornBulbX - 1, hornBulbY, 3);
    }

    // ------------------------------------------------------------------------
    // INVERTED PENDULUM POLE & GYROSCOPIC STABILIZER
    // ------------------------------------------------------------------------
    const pivX = cx;
    const pivY = cy - 2;
    const tipX = pivX + Math.sin(this.angle) * this.poleL;
    const tipY = pivY - Math.cos(this.angle) * this.poleL;

    // Wood & Brass Segmented Pole
    g.line(pivX, pivY, Math.floor(tipX), Math.floor(tipY), 3);

    // Brass reinforcement bands at 25%, 50%, 75%
    for (let frac of [0.25, 0.50, 0.75]) {
      const bx = pivX + Math.sin(this.angle) * (this.poleL * frac);
      const by = pivY - Math.cos(this.angle) * (this.poleL * frac);
      const perpX = -Math.cos(this.angle) * 2;
      const perpY = -Math.sin(this.angle) * 2;
      g.line(Math.floor(bx - perpX), Math.floor(by - perpY), Math.floor(bx + perpX), Math.floor(by + perpY), 2);
    }

    // Tension guy wires from cart joint to middle pole band
    const midX = pivX + Math.sin(this.angle) * (this.poleL * 0.45);
    const midY = pivY - Math.cos(this.angle) * (this.poleL * 0.45);
    g.line(cx - 10, cy, Math.floor(midX), Math.floor(midY), 1);
    g.line(cx + 10, cy, Math.floor(midX), Math.floor(midY), 1);

    // Spinning Balance Gyroscope at Tip
    const itipX = Math.floor(tipX);
    const itipY = Math.floor(tipY);

    // Outer bronze gimbal housing ring
    g.circle(itipX, itipY, 6, 2);
    // Spinning brass flywheel rotor
    g.disc(itipX, itipY, 4, 3);
    g.px(itipX, itipY, 0); // axle hub

    // Spinning rotor spokes
    for (let s = 0; s < 3; s++) {
      const a = this.gyroAngle + (Math.PI * 2 / 3) * s;
      const gx = itipX + Math.round(Math.cos(a) * 3);
      const gy = itipY + Math.round(Math.sin(a) * 3);
      g.px(gx, gy, 0);
    }

    // Danger / Stress Aura Sparks when angle > 25°
    if (isPanicked && Math.floor(this.time * 16) % 2 === 0) {
      g.circle(itipX, itipY, 7, 3);
    }

    // ------------------------------------------------------------------------
    // MISCHIEVOUS BIRD
    // ------------------------------------------------------------------------
    if (this.bird.active) {
      const bx = Math.floor(this.bird.x) + ox;
      const by = Math.floor(this.bird.y) + oy;
      const flapUp = Math.sin(this.bird.flapPhase) > 0;

      // Bird body
      g.disc(bx, by, 2, 2);
      g.px(bx, by, 3);
      // Bird head & beak
      const faceDir = (this.bird.state === 'flee') ? Math.sign(this.bird.vx) : this.bird.targetSide;
      g.px(bx + faceDir * 2, by - 1, 3);
      g.px(bx + faceDir * 3, by - 1, 3); // beak
      g.px(bx + faceDir * 2, by - 2, 0); // eye
      // Animated flapping wings
      if (flapUp) {
        g.line(bx - 2, by - 2, bx + 2, by - 4, 3);
      } else {
        g.line(bx - 2, by + 1, bx + 2, by + 3, 3);
      }
      // Tail feathers
      g.line(bx - faceDir * 2, by, bx - faceDir * 4, by + 1, 1);
    }

    // ------------------------------------------------------------------------
    // FALLING CELESTIAL STARS
    // ------------------------------------------------------------------------
    for (let s of this.stars) {
      const sx = Math.floor(s.x) + ox;
      const sy = Math.floor(s.y) + oy;
      // 4-pointed sparkle star
      g.px(sx, sy, 3);
      g.px(sx - 1, sy, 3);
      g.px(sx + 1, sy, 3);
      g.px(sx, sy - 1, 3);
      g.px(sx, sy + 1, 3);
      g.px(sx - 2, sy, 2);
      g.px(sx + 2, sy, 2);
      g.px(sx, sy - 2, 2);
      g.px(sx, sy + 2, 2);
    }

    // ------------------------------------------------------------------------
    // PARTICLES (SWEAT, HORN WAVES, FEATHERS, SPARKLES)
    // ------------------------------------------------------------------------
    for (let p of this.particles) {
      const px = Math.floor(p.x) + ox;
      const py = Math.floor(p.y) + oy;
      if (p.type === 'sweat') {
        g.px(px, py, p.col);
        g.px(px, py - 1, 2);
      } else if (p.type === 'feather') {
        g.line(px - 1, py, px + 1, py - 1, p.col);
      } else if (p.type === 'horn_wave') {
        g.circle(px, py, Math.floor(p.r), p.col);
      } else if (p.type === 'sparkle' || p.type === 'splinter') {
        g.px(px, py, p.col);
      }
    }

    // Floating score / event texts
    for (let ft of this.floatTexts) {
      this.centerText(g, ft.txt, Math.floor(ft.y) + oy, ft.col);
    }

    // ------------------------------------------------------------------------
    // WEATHERCOCK & ANIMATED WINDSOCK (Top Center x = 120, y = 8..26)
    // ------------------------------------------------------------------------
    const sockMastX = 120 + ox;
    const sockMastY = 12 + oy;

    // Mast pole & base
    g.line(sockMastX, sockMastY - 4, sockMastX, sockMastY + 12, 2);
    g.disc(sockMastX, sockMastY - 4, 1, 3);

    // Weathercock arrow / vane at top
    const vaneDir = this.wind >= 0 ? 1 : -1;
    g.line(sockMastX - 4 * vaneDir, sockMastY - 4, sockMastX + 6 * vaneDir, sockMastY - 4, 3);
    g.px(sockMastX + 6 * vaneDir, sockMastY - 5, 3);
    g.px(sockMastX + 6 * vaneDir, sockMastY - 3, 3);

    // Conical striped windsock
    const sAng = this.windsockAngle;
    const sockLen = 14;
    const sockTipX = sockMastX + Math.sin(sAng) * sockLen;
    const sockTipY = sockMastY + Math.cos(sAng) * sockLen + this.windsockFlutter;

    // Mouth ring
    g.rect(sockMastX - 2, sockMastY - 1, 5, 2, 3);
    // Striped cone body
    g.line(sockMastX - 2, sockMastY, Math.floor(sockTipX), Math.floor(sockTipY), 2);
    g.line(sockMastX + 2, sockMastY, Math.floor(sockTipX), Math.floor(sockTipY), 3);
    g.line(sockMastX, sockMastY, Math.floor(sockTipX), Math.floor(sockTipY), 3);

    // ------------------------------------------------------------------------
    // TOP HUD: TIME, BEST, TILT INCLINOMETER, & WIND GAUGE
    // ------------------------------------------------------------------------
    // Top bar boundary & status
    g.text("TIME: " + this.time.toFixed(1) + "S", 12, 10, 3);
    g.textR("BEST: " + this.highScore + "S", 228, 10, 2);

    // Wind status text & warning indicators
    if (this.windGustWarning) {
      const flash = Math.floor(this.time * 8) % 2 === 0;
      const warnTxt = (this.windGustDir > 0) ? "GUST >>" : "<< GUST";
      this.centerText(g, "! " + warnTxt + " !", 22, flash ? 3 : 1);
    } else if (Math.abs(this.wind) > 0.4) {
      const dirTxt = (this.wind > 0) ? "WIND >>" : "<< WIND";
      this.centerText(g, dirTxt, 22, 2);
    }

    // Inclinometer / Spirit Level Gauge (x = 88..152, y = 30..35)
    const gaugeX = 88;
    const gaugeY = 30;
    const gaugeW = 64;
    const gaugeH = 5;

    g.box(gaugeX, gaugeY, gaugeW, gaugeH, 1);
    // Center reference mark (0 degrees)
    g.line(gaugeX + 32, gaugeY, gaugeX + 32, gaugeY + gaugeH - 1, 2);
    // Danger threshold ticks (±25 degrees = ±12 px)
    g.px(gaugeX + 32 - 12, gaugeY + 1, 3);
    g.px(gaugeX + 32 + 12, gaugeY + 1, 3);

    // Sliding bubble / gyro marker
    const bubbleOffset = Math.max(-28, Math.min(28, this.angle * 26.0));
    const bubbleX = Math.floor(gaugeX + 32 + bubbleOffset);
    const bubbleCol = (absAngle > 0.436) ? 3 : 2;
    g.rect(bubbleX - 1, gaugeY + 1, 3, 3, bubbleCol);

    // ------------------------------------------------------------------------
    // MILESTONE FANFARE BANNER
    // ------------------------------------------------------------------------
    if (this.banner.active && this.banner.y > -20) {
      const by = Math.floor(this.banner.y);
      g.rect(36, by, 168, 22, 0);
      g.box(36, by, 168, 22, 3);
      g.line(38, by + 2, 202, by + 2, 2);
      g.line(38, by + 19, 202, by + 19, 2);
      this.centerText(g, this.banner.text, by + 5, 3);
      this.centerText(g, this.banner.sub, by + 13, 2);
    }

    // ------------------------------------------------------------------------
    // TOUCH CONTROLS ON-SCREEN OVERLAY (y = 204..234)
    // ------------------------------------------------------------------------
    // Left Steer Touch Button
    const lBtnCol = this.touchLeftHeld ? 3 : 1;
    g.box(6, 206, 36, 26, lBtnCol);
    g.text("◀", 12, 215, this.touchLeftHeld ? 3 : 2);
    g.text("STEER", 20, 215, this.touchLeftHeld ? 3 : 2);

    // Right Steer Touch Button
    const rBtnCol = this.touchRightHeld ? 3 : 1;
    g.box(46, 206, 36, 26, rBtnCol);
    g.text("STEER", 50, 215, this.touchRightHeld ? 3 : 2);
    g.text("▶", 74, 215, this.touchRightHeld ? 3 : 2);

    // Horn / Action Button
    const hBtnCol = (this.hornAnim > 0) ? 3 : 1;
    g.box(166, 206, 68, 26, hBtnCol);
    g.text("[A] HORN / SHOO", 172, 215, (this.hornAnim > 0) ? 3 : 2);

    // ------------------------------------------------------------------------
    // GAME OVER MODAL DIALOG
    // ------------------------------------------------------------------------
    if (this.over) {
      g.rect(32, 68, 176, 104, 0);
      g.box(32, 68, 176, 104, 3);
      g.line(34, 70, 206, 70, 2);
      g.line(34, 169, 206, 169, 2);

      this.centerText(g, "STICK COLLAPSED!", 76, 3);
      g.line(48, 86, 192, 86, 1);

      g.text("TIME BALANCED:", 42, 94, 2);
      g.textR(this.time.toFixed(1) + " S", 198, 94, 3);

      g.text("STARS CAUGHT:", 42, 106, 2);
      g.textR(String(this.starsCaught), 198, 106, 3);

      g.text("BIRDS SHOOED:", 42, 118, 2);
      g.textR(String(this.birdsShooed), 198, 118, 3);

      g.text("ALL-TIME BEST:", 42, 130, 2);
      g.textR(this.highScore + " S", 198, 130, 3);

      const blink = Math.floor(this.crashTimer * 4) % 2 === 0;
      this.centerText(g, "PRESS [A] OR TAP TO RETRY", 152, blink ? 3 : 1);
    }

    // ------------------------------------------------------------------------
    // CRT CABINET RIGHT BEZEL (Strict 240x240 active CRT area in 256 frame)
    // ------------------------------------------------------------------------
    g.line(240, 0, 240, 240, 2);
    g.rect(241, 0, 15, 240, 0);
    g.dither(241, 0, 15, 240, 0, 1);
    // Industrial chassis fasteners
    g.box(244, 14, 8, 8, 2); g.px(247, 17, 3);
    g.box(244, 116, 8, 8, 2); g.px(247, 119, 3);
    g.box(244, 218, 8, 8, 2); g.px(247, 221, 3);
    g.line(0, 0, 0, 240, 2); // Left CRT frame line
  },

  // Persistent save & load support
  save() {
    return {
      best: this.highScore,
      stars: this.lifetimeStars,
      birds: this.lifetimeBirds
    };
  },

  load(data) {
    if (!data) return;
    if (data.best) this.highScore = Math.max(this.highScore, data.best);
    if (data.stars) this.lifetimeStars = data.stars;
    if (data.birds) this.lifetimeBirds = data.birds;
  }
};
