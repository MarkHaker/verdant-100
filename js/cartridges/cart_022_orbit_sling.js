// js/cartridges/cart_022_orbit_sling.js
// ============================================================================
// Cartridge #022: ORBIT SLING
// ============================================================================
// Authentic 10-level space navigation campaign featuring various celestial
// configurations, sub-stepped Velocity Verlet orbital physics, trajectory
// prediction arc, slingshot touch aiming, and wormhole warp portals.
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[22] = {
  id: 22,
  name: "ORBIT SLING",
  genre: 2, // PHYSICS
  scoreLabel: "ZONES",
  desc: "USE GRAVITY WELLS OF CELESTIAL BODIES TO SLINGSHOT PROBE INTO PORTAL!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Planet & atmosphere
    g.disc(x + 16, y + 16, 6, 2);
    g.circle(x + 16, y + 16, 11, 1);
    // Orbit curve
    for (let t = 0; t <= 12; t++) {
      const px = x + 5 + t * 1.8;
      const py = y + 25 - Math.sin(t * 0.28) * 16;
      if (t % 2 === 0) g.px(Math.round(px), Math.round(py), 3);
    }
    // Probe
    g.disc(x + 7, y + 23, 2, 3);
    // Target portal
    g.circle(x + 25, y + 8, 3, 3);
    g.px(x + 25, y + 8, 2);
  },

  // --------------------------------------------------------------------------
  // 10-LEVEL SPACE NAVIGATION CAMPAIGN CONFIGURATIONS
  // --------------------------------------------------------------------------
  levels: [
    // Level 1: Single terrestrial planet (Earth)
    {
      num: 1,
      name: "TERRA SLINGSHOT",
      desc: "USE EARTH'S GRAVITY TO WHIP INTO THE WARP PORTAL",
      launch: { x: 26, y: 180 },
      portal: { x: 226, y: 50, r: 12 },
      defaultAngle: -0.75, // ~-43 deg
      defaultPower: 92,
      bodies: [
        { name: "EARTH", x: 128, y: 118, r: 18, mass: 8500, type: "planet", color: 2 }
      ]
    },

    // Level 2: Planet + Moon orbital system
    {
      num: 2,
      name: "EARTH & LUNA",
      desc: "TIMING IS CRITICAL: LUNA'S ORBIT DEFLECTS TRAJECTORY",
      launch: { x: 26, y: 55 },
      portal: { x: 226, y: 185, r: 12 },
      defaultAngle: 0.42, // ~24 deg
      defaultPower: 90,
      bodies: [
        { name: "EARTH", x: 116, y: 120, r: 16, mass: 7500, type: "planet", color: 2 },
        { name: "LUNA", parentIdx: 0, orbR: 50, orbSpd: 0.65, initTheta: 1.2, r: 6, mass: 1600, type: "moon", color: 3 }
      ]
    },

    // Level 3: Dual binary stars (opposing gravitational wells)
    {
      num: 3,
      name: "BINARY DANCERS",
      desc: "S-CURVE SLALOM BETWEEN TWO OPPOSING SUNS",
      launch: { x: 26, y: 120 },
      portal: { x: 230, y: 120, r: 12 },
      defaultAngle: -0.04, // -2 deg
      defaultPower: 96,
      bodies: [
        { name: "SOL-A", x: 96, y: 72, r: 12, mass: 6500, type: "star", color: 3 },
        { name: "SOL-B", x: 160, y: 168, r: 12, mass: 6500, type: "star", color: 3 }
      ]
    },

    // Level 4: Gas giant (Jupiter) with strong gravity + satellite ring
    {
      num: 4,
      name: "JOVIAN GRAVITY WELL",
      desc: "IMMENSE GRAVITATIONAL MASS. BEWARE THE DENSE RING SYSTEM!",
      launch: { x: 26, y: 195 },
      portal: { x: 226, y: 45, r: 13 },
      defaultAngle: -0.44, // -25 deg
      defaultPower: 120,
      bodies: [
        {
          name: "JUPITER", x: 128, y: 115, r: 24, mass: 16000, type: "gasgiant", color: 2,
          ringInner: 34, ringOuter: 46
        }
      ]
    },

    // Level 5: Asteroid obstacle belt to avoid
    {
      num: 5,
      name: "ASTEROID CORRIDOR",
      desc: "CURVE AROUND MARS UNDERNEATH THE DENSE ASTEROID BELT",
      launch: { x: 26, y: 115 },
      portal: { x: 230, y: 115, r: 12 },
      defaultAngle: -0.07, // -4 deg
      defaultPower: 98,
      bodies: [
        { name: "MARS", x: 128, y: 170, r: 14, mass: 6800, type: "planet", color: 2 }
      ],
      obstacles: [
        { x: 128, y: 28, r: 6 },
        { x: 128, y: 46, r: 6 },
        { x: 128, y: 64, r: 6 },
        { x: 128, y: 82, r: 6 },
        { x: 128, y: 100, r: 6 },
        { x: 128, y: 118, r: 6 }
      ]
    },

    // Level 6: Superdense White Dwarf
    {
      num: 6,
      name: "WHITE DWARF",
      desc: "TINY CORE, ULTRA-HIGH GRAVITY. EXECUTE A SHARP U-TURN!",
      launch: { x: 26, y: 185 },
      portal: { x: 230, y: 185, r: 12 },
      defaultAngle: -0.04, // -2 deg
      defaultPower: 115,
      bodies: [
        { name: "DWARF", x: 128, y: 112, r: 5, mass: 18000, type: "whitedwarf", color: 3 }
      ]
    },

    // Level 7: Lagrange Point navigation
    {
      num: 7,
      name: "LAGRANGE EQUILIBRIUM",
      desc: "PORTAL AT L1 SADDLE POINT. BALANCE OPPOSING GRAVITY WELLS",
      launch: { x: 26, y: 48 },
      portal: { x: 136, y: 120, r: 11 },
      defaultAngle: 0.49, // 28 deg
      defaultPower: 82,
      bodies: [
        { name: "STAR-A", x: 70, y: 120, r: 15, mass: 9000, type: "star", color: 3 },
        { name: "PLANET-B", x: 196, y: 120, r: 11, mass: 4200, type: "planet", color: 2 }
      ]
    },

    // Level 8: Black Hole with event horizon (crushes probe if too close)
    {
      num: 8,
      name: "EVENT HORIZON",
      desc: "SKIM THE ACCRETION DISK. CROSSING HORIZON IS FATAL!",
      launch: { x: 26, y: 200 },
      portal: { x: 228, y: 38, r: 13 },
      defaultAngle: -0.91, // -52 deg
      defaultPower: 135,
      bodies: [
        {
          name: "CYGNUS-X", x: 128, y: 114, r: 7, eventR: 20, accretionR: 42,
          mass: 24000, type: "blackhole", color: 0
        }
      ]
    },

    // Level 9: Triple Star System (chaotic 3-body gravitational slingshot)
    {
      num: 9,
      name: "TRIPLE STAR CHAOS",
      desc: "THREE ROTATING SUNS. TIME THE GRAVITATIONAL APERTURE!",
      launch: { x: 24, y: 120 },
      portal: { x: 232, y: 120, r: 12 },
      defaultAngle: -0.07, // -4 deg
      defaultPower: 110,
      bodies: [
        { name: "SOL-1", cx: 128, cy: 120, orbR: 45, orbSpd: 0.32, initTheta: 0, r: 10, mass: 6500, type: "star", color: 3 },
        { name: "SOL-2", cx: 128, cy: 120, orbR: 45, orbSpd: 0.32, initTheta: (2 * Math.PI) / 3, r: 10, mass: 6500, type: "star", color: 3 },
        { name: "SOL-3", cx: 128, cy: 120, orbR: 45, orbSpd: 0.32, initTheta: (4 * Math.PI) / 3, r: 10, mass: 6500, type: "star", color: 3 }
      ]
    },

    // Level 10: The Grand Slingshot (multi-body gravity assist chain)
    {
      num: 10,
      name: "THE GRAND SLINGSHOT",
      desc: "TRIPLE GRAVITY ASSIST: PLANET -> STAR -> GAS GIANT -> WARP",
      launch: { x: 24, y: 195 },
      portal: { x: 232, y: 48, r: 13 },
      defaultAngle: -0.59, // -34 deg
      defaultPower: 115,
      bodies: [
        { name: "INNER", x: 74, y: 148, r: 9, mass: 4500, type: "planet", color: 2 },
        { name: "SOL", x: 128, y: 72, r: 16, mass: 9500, type: "star", color: 3 },
        { name: "GIANT", x: 184, y: 152, r: 14, mass: 7200, type: "gasgiant", color: 2 }
      ]
    }
  ],

  init() {
    this.highScore = (typeof SAVE !== 'undefined' ? SAVE.getScore(this.id) : 0) || 0;
    this.score = 0;
    this.bestScore = this.highScore;
    this.unlockedLevel = Math.min(9, Math.max(0, this.highScore));
    this.levelIdx = 0;

    // Load persistent save state if available
    if (typeof SAVE !== 'undefined' && SAVE.getPersistent) {
      const saved = SAVE.getPersistent(this.id);
      if (saved) this.load(saved);
    }

    // Stars background (fixed deterministic coordinates)
    this.stars = [];
    for (let i = 0; i < 40; i++) {
      this.stars.push({
        x: Math.floor((Math.sin(i * 19.3 + 1.7) * 0.5 + 0.5) * 252 + 2),
        y: Math.floor((Math.cos(i * 31.7 + 2.4) * 0.5 + 0.5) * 196 + 20),
        period: 1.5 + (i % 5) * 0.4,
        phase: (i * 0.7) % 6.28
      });
    }

    // Visual FX pools
    this.particles = [];
    this.blasts = [];
    this.trail = [];
    this.shake = 0;
    this.time = 0;
    this.flightTime = 0;
    this.trailTimer = 0;
    this.portalVortexTimer = 0;
    this.stateTimer = 0;

    // Touch Slingshot interaction state
    this.isDragging = false;
    this.dragOrigin = { x: 0, y: 0 };
    this.dragCurrent = { x: 0, y: 0 };
    this.activeButton = null;

    // Touch button geometries
    this.buttons = {
      prev: { id: 'prev', x: 4, y: 221, w: 46, h: 17, label: "◀ LVL" },
      abort: { id: 'abort', x: 54, y: 221, w: 68, h: 17, label: "ABORT" },
      launch: { id: 'launch', x: 126, y: 221, w: 76, h: 17, label: "LAUNCH" },
      next: { id: 'next', x: 206, y: 221, w: 46, h: 17, label: "LVL ▶" }
    };

    // Load level
    this.loadLevel(this.levelIdx, true);
  },

  loadLevel(idx, resetProbes = true) {
    this.levelIdx = Math.max(0, Math.min(this.levels.length - 1, idx));
    const lvl = this.levels[this.levelIdx];

    this.aimAngle = lvl.defaultAngle;
    this.aimPower = lvl.defaultPower;
    if (resetProbes) this.probesLeft = 3;

    this.probe = null;
    this.trail = [];
    this.particles = [];
    this.blasts = [];
    this.shake = 0;
    this.flightTime = 0;
    this.trailTimer = 0;
    this.stateTimer = 0;
    this.state = 'AIM'; // 'AIM', 'FLIGHT', 'CRASH', 'LEVEL_CLEAR', 'GAME_OVER', 'VICTORY'
    this.isDragging = false;
    this.activeButton = null;

    this.calcTrajectory();
  },

  // Compute instantaneous position of any body (including orbiting moons and stars)
  getBodyPos(bDef, t) {
    const lvl = this.levels[this.levelIdx];
    if (bDef.parentIdx !== undefined) {
      const p = this.getBodyPos(lvl.bodies[bDef.parentIdx], t);
      const th = bDef.initTheta + bDef.orbSpd * t;
      return {
        name: bDef.name,
        x: p.x + Math.cos(th) * bDef.orbR,
        y: p.y + Math.sin(th) * bDef.orbR,
        r: bDef.r,
        mass: bDef.mass,
        type: bDef.type,
        color: bDef.color,
        eventR: bDef.eventR,
        accretionR: bDef.accretionR
      };
    } else if (bDef.cx !== undefined) {
      const th = bDef.initTheta + bDef.orbSpd * t;
      return {
        name: bDef.name,
        x: bDef.cx + Math.cos(th) * bDef.orbR,
        y: bDef.cy + Math.sin(th) * bDef.orbR,
        r: bDef.r,
        mass: bDef.mass,
        type: bDef.type,
        color: bDef.color,
        eventR: bDef.eventR,
        accretionR: bDef.accretionR
      };
    }
    return {
      name: bDef.name,
      x: bDef.x,
      y: bDef.y,
      r: bDef.r,
      mass: bDef.mass,
      type: bDef.type,
      color: bDef.color,
      eventR: bDef.eventR,
      accretionR: bDef.accretionR,
      ringInner: bDef.ringInner,
      ringOuter: bDef.ringOuter
    };
  },

  // Gravitational acceleration calculation with softening epsilon to prevent singularities
  calcAccel(x, y, t) {
    const lvl = this.levels[this.levelIdx];
    let ax = 0, ay = 0;
    const eps2 = 16; // Gravitational softening parameter (never div by zero)

    for (let i = 0; i < lvl.bodies.length; i++) {
      const b = this.getBodyPos(lvl.bodies[i], t);
      const dx = b.x - x;
      const dy = b.y - y;
      const d2 = dx * dx + dy * dy;
      const distSoft = Math.sqrt(d2 + eps2);
      const f = b.mass / (distSoft * distSoft * distSoft);
      ax += dx * f;
      ay += dy * f;
    }
    return { ax, ay };
  },

  // Collision detection against all celestial surfaces, black hole event horizons, and portals
  checkCollisions(x, y, t) {
    const lvl = this.levels[this.levelIdx];

    // Check portal entrance
    const pDist = Math.hypot(lvl.portal.x - x, lvl.portal.y - y);
    if (pDist <= lvl.portal.r) {
      return { type: 'PORTAL', x, y };
    }

    // Check celestial bodies
    for (let i = 0; i < lvl.bodies.length; i++) {
      const b = this.getBodyPos(lvl.bodies[i], t);
      const dist = Math.hypot(b.x - x, b.y - y);

      // Black hole event horizon (lethal capture zone)
      if (b.type === 'blackhole' && dist <= b.eventR) {
        return { type: 'BLACKHOLE', name: b.name, x, y, body: b };
      }

      // Celestial solid surface (planet, moon, star, white dwarf)
      if (dist <= b.r + 1.5) {
        return { type: 'SURFACE', name: b.name, x, y, body: b };
      }
    }

    // Check asteroid obstacles
    if (lvl.obstacles) {
      for (let i = 0; i < lvl.obstacles.length; i++) {
        const obs = lvl.obstacles[i];
        if (Math.hypot(obs.x - x, obs.y - y) <= obs.r + 1.5) {
          return { type: 'ASTEROID', x, y, obs };
        }
      }
    }

    // Check deep space boundary exit
    if (x < -25 || x > 281 || y < -25 || y > 265) {
      return { type: 'BOUNDS', x, y };
    }

    return null;
  },

  // --------------------------------------------------------------------------
  // TRAJECTORY PREDICTION ARC (200 SIMULATION STEPS)
  // --------------------------------------------------------------------------
  calcTrajectory() {
    const lvl = this.levels[this.levelIdx];
    let x = lvl.launch.x;
    let y = lvl.launch.y;
    let vx = Math.cos(this.aimAngle) * this.aimPower;
    let vy = Math.sin(this.aimAngle) * this.aimPower;

    this.trajectory = [{ x, y }];
    this.trajectoryHitsPortal = false;
    this.trajectoryCrash = null;

    const steps = 200;
    const h = 0.025; // Prediction step interval
    let simTime = this.time;

    for (let s = 0; s < steps; s++) {
      // Sub-step Velocity Verlet for trajectory prediction
      for (let sub = 0; sub < 2; sub++) {
        const dh = h / 2;
        simTime += dh;

        const a1 = this.calcAccel(x, y, simTime);
        const nx = x + vx * dh + 0.5 * a1.ax * dh * dh;
        const ny = y + vy * dh + 0.5 * a1.ay * dh * dh;

        const hit = this.checkCollisions(nx, ny, simTime);
        if (hit) {
          if (hit.type === 'PORTAL') {
            this.trajectoryHitsPortal = true;
            this.trajectory.push({ x: nx, y: ny });
          } else if (hit.type !== 'BOUNDS') {
            this.trajectoryCrash = { x: nx, y: ny, type: hit.type };
            this.trajectory.push({ x: nx, y: ny });
          }
          return;
        }

        const a2 = this.calcAccel(nx, ny, simTime + dh);
        vx += 0.5 * (a1.ax + a2.ax) * dh;
        vy += 0.5 * (a1.ay + a2.ay) * dh;
        x = nx;
        y = ny;
      }

      this.trajectory.push({ x, y });
    }
  },

  // --------------------------------------------------------------------------
  // PROBE LAUNCH & FLIGHT DYNAMICS
  // --------------------------------------------------------------------------
  launchProbe() {
    if (this.state !== 'AIM' || this.probesLeft <= 0) return;
    const lvl = this.levels[this.levelIdx];

    this.probesLeft--;
    this.probe = {
      x: lvl.launch.x,
      y: lvl.launch.y,
      vx: Math.cos(this.aimAngle) * this.aimPower,
      vy: Math.sin(this.aimAngle) * this.aimPower
    };

    this.trail = [];
    this.flightTime = this.time;
    this.trailTimer = 0;
    this.state = 'FLIGHT';
    this.stateTimer = 0;
    APU.sfx('SWISH');
  },

  abortProbe(isFail = true) {
    if (this.state !== 'FLIGHT') return;
    const px = this.probe ? this.probe.x : 128;
    const py = this.probe ? this.probe.y : 120;
    this.spawnExplosion(px, py, 8, false);
    this.probe = null;
    APU.sfx('BOOM');
    this.shake = 4;

    if (this.probesLeft > 0) {
      this.state = 'CRASH';
      this.stateTimer = 0.6;
    } else {
      this.state = 'GAME_OVER';
      this.stateTimer = 1.0;
    }
  },

  spawnExplosion(ix, iy, r, isBlackHole = false) {
    this.shake = isBlackHole ? 8 : 5;
    this.blasts.push({
      x: ix, y: iy, r: 2, maxR: r * 2.2, life: 0.45, maxLife: 0.45
    });

    const count = isBlackHole ? 36 : 22;
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = (isBlackHole ? 15 : 30) + Math.random() * (isBlackHole ? 40 : 80);
      this.particles.push({
        x: ix,
        y: iy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.35 + Math.random() * 0.4,
        maxLife: 0.75,
        color: isBlackHole ? (Math.random() < 0.5 ? 3 : 1) : (Math.random() < 0.6 ? 3 : 2),
        size: Math.random() < 0.3 ? 2 : 1
      });
    }
  },

  spawnPortalBurst(px, py) {
    this.shake = 4;
    this.blasts.push({
      x: px, y: py, r: 2, maxR: 32, life: 0.6, maxLife: 0.6
    });

    for (let i = 0; i < 40; i++) {
      const ang = (i / 40) * Math.PI * 2;
      const spd = 40 + Math.random() * 70;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1.0,
        color: i % 2 === 0 ? 3 : 2,
        size: i % 3 === 0 ? 2 : 1
      });
    }
  },

  // --------------------------------------------------------------------------
  // GAMEPLAY LOOP & UPDATE ROUTINES
  // --------------------------------------------------------------------------
  update(dt) {
    this.time += dt;
    this.portalVortexTimer += dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - 12 * dt);

    // Update particle systems
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.94;
      p.vy *= 0.94;
    }

    // Update blast shockwaves
    for (let i = this.blasts.length - 1; i >= 0; i--) {
      const b = this.blasts[i];
      b.life -= dt;
      if (b.life <= 0) {
        this.blasts.splice(i, 1);
        continue;
      }
      const progress = 1 - (b.life / b.maxLife);
      b.r = 2 + progress * (b.maxR - 2);
    }

    // Handle button taps and touch down states
    this.updateTouchControls(dt);

    // ------------------------------------------------------------------------
    // STATE: AIMING
    // ------------------------------------------------------------------------
    if (this.state === 'AIM') {
      let aimChanged = false;

      // D-Pad smooth controls
      if (PAD.held('left')) { this.aimAngle -= 1.6 * dt; aimChanged = true; }
      if (PAD.held('right')) { this.aimAngle += 1.6 * dt; aimChanged = true; }
      if (PAD.held('up')) { this.aimPower = Math.min(160, this.aimPower + 45 * dt); aimChanged = true; }
      if (PAD.held('down')) { this.aimPower = Math.max(40, this.aimPower - 45 * dt); aimChanged = true; }

      // Discrete taps on D-pad
      if (PAD.hit('left')) { this.aimAngle -= 0.04; aimChanged = true; }
      if (PAD.hit('right')) { this.aimAngle += 0.04; aimChanged = true; }
      if (PAD.hit('up')) { this.aimPower = Math.min(160, this.aimPower + 2); aimChanged = true; }
      if (PAD.hit('down')) { this.aimPower = Math.max(40, this.aimPower - 2); aimChanged = true; }

      // Reset to level recommendation on [B]
      if (PAD.hit('b')) {
        const lvl = this.levels[this.levelIdx];
        this.aimAngle = lvl.defaultAngle;
        this.aimPower = lvl.defaultPower;
        aimChanged = true;
        APU.sfx('UI_MOVE');
      }

      // Launch on [A]
      if (PAD.hit('a')) {
        this.launchProbe();
        return;
      }

      // Cycle levels on [SELECT]
      if (PAD.hit('select')) {
        const nextIdx = (this.levelIdx + 1) % (Math.min(9, this.unlockedLevel) + 1);
        this.loadLevel(nextIdx, true);
        APU.sfx('UI_MOVE');
        return;
      }

      // Recalculate trajectory prediction if dynamic bodies or aim changed
      this.calcTrajectory();
    }

    // ------------------------------------------------------------------------
    // STATE: PROBE IN FLIGHT (SUB-STEPPED VELOCITY VERLET INTEGRATION <= 1.0 PX)
    // ------------------------------------------------------------------------
    else if (this.state === 'FLIGHT' && this.probe) {
      this.stateTimer += dt;

      // Flight abort via [A], [B], or [START]
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start')) {
        this.abortProbe(true);
        return;
      }

      // Flight timeout (15 seconds maximum fuel burn)
      if (this.stateTimer > 15.0) {
        this.abortProbe(true);
        return;
      }

      const speed = Math.hypot(this.probe.vx, this.probe.vy);
      const estStepDist = speed * dt;
      // Guaranteed sub-step displacement <= 1.0 pixel
      const nSub = Math.max(4, Math.min(32, Math.ceil(estStepDist / 1.0)));
      const subDt = dt / nSub;

      for (let i = 0; i < nSub; i++) {
        this.flightTime += subDt;

        // Velocity Verlet Step 1: initial acceleration
        const a1 = this.calcAccel(this.probe.x, this.probe.y, this.flightTime);

        // Position update
        const nx = this.probe.x + this.probe.vx * subDt + 0.5 * a1.ax * subDt * subDt;
        const ny = this.probe.y + this.probe.vy * subDt + 0.5 * a1.ay * subDt * subDt;

        // Anti-tunneling continuous collision check
        const hit = this.checkCollisions(nx, ny, this.flightTime);
        if (hit) {
          if (hit.type === 'PORTAL') {
            // SUCCESSFUL ORBIT WARP!
            this.spawnPortalBurst(hit.x, hit.y);
            this.probe = null;
            this.state = 'LEVEL_CLEAR';
            this.stateTimer = 0;
            APU.sfx('LEVELUP');

            // Record progress & persistence
            const nextLvl = this.levelIdx + 1;
            if (nextLvl > this.unlockedLevel) {
              this.unlockedLevel = Math.min(9, nextLvl);
            }
            this.score = Math.max(this.score, nextLvl);
            this.bestScore = Math.max(this.bestScore, this.score);
            if (typeof SAVE !== 'undefined') {
              SAVE.setScore(this.id, this.score);
              if (SAVE.setPersistent) SAVE.setPersistent(this.id, this.save());
            }
            return;
          } else if (hit.type === 'BLACKHOLE') {
            // Black hole singularity consumption
            this.spawnExplosion(hit.x, hit.y, 14, true);
            this.probe = null;
            APU.sfx('BOOM');
            if (this.probesLeft > 0) {
              this.state = 'CRASH';
              this.stateTimer = 0.75;
            } else {
              this.state = 'GAME_OVER';
              this.stateTimer = 1.0;
            }
            return;
          } else if (hit.type === 'SURFACE' || hit.type === 'ASTEROID') {
            // Celestial crash
            this.spawnExplosion(hit.x, hit.y, 9, false);
            this.probe = null;
            APU.sfx('BOOM');
            if (this.probesLeft > 0) {
              this.state = 'CRASH';
              this.stateTimer = 0.6;
            } else {
              this.state = 'GAME_OVER';
              this.stateTimer = 1.0;
            }
            return;
          } else if (hit.type === 'BOUNDS') {
            // Lost to deep space
            this.probe = null;
            APU.sfx('HURT');
            if (this.probesLeft > 0) {
              this.state = 'CRASH';
              this.stateTimer = 0.5;
            } else {
              this.state = 'GAME_OVER';
              this.stateTimer = 1.0;
            }
            return;
          }
        }

        // Velocity Verlet Step 2: final acceleration & velocity update
        const a2 = this.calcAccel(nx, ny, this.flightTime + subDt);
        this.probe.vx += 0.5 * (a1.ax + a2.ax) * subDt;
        this.probe.vy += 0.5 * (a1.ay + a2.ay) * subDt;
        this.probe.x = nx;
        this.probe.y = ny;

        // Exhaust trail contrail
        this.trailTimer -= subDt;
        if (this.trailTimer <= 0) {
          this.trail.push({ x: this.probe.x, y: this.probe.y, age: 0 });
          if (this.trail.length > 36) this.trail.shift();
          this.trailTimer = 0.035;
        }
      }
    }

    // ------------------------------------------------------------------------
    // STATE: CRASH (BRIEF EXPLOSION RECOVERY BEFORE RETRYING ATTEMPT)
    // ------------------------------------------------------------------------
    else if (this.state === 'CRASH') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.state = 'AIM';
        this.calcTrajectory();
      }
    }

    // ------------------------------------------------------------------------
    // STATE: LEVEL CLEAR / CAMPAIGN ADVANCE
    // ------------------------------------------------------------------------
    else if (this.state === 'LEVEL_CLEAR') {
      this.stateTimer += dt;
      const advance = PAD.hit('a') || PAD.hit('start') || (PAD.tapPos && PAD.tapPos.y < 218);

      if (advance) {
        APU.sfx('UI_OK');
        if (this.levelIdx >= 9) {
          this.state = 'VICTORY';
          this.stateTimer = 0;
        } else {
          this.loadLevel(this.levelIdx + 1, true);
        }
      }
    }

    // ------------------------------------------------------------------------
    // STATE: GAME OVER (OUT OF PROBES)
    // ------------------------------------------------------------------------
    else if (this.state === 'GAME_OVER') {
      this.stateTimer += dt;
      const retry = PAD.hit('a') || PAD.hit('start') || (PAD.tapPos && PAD.tapPos.y < 218);

      if (retry) {
        APU.sfx('UI_OK');
        this.loadLevel(this.levelIdx, true);
      }
    }

    // ------------------------------------------------------------------------
    // STATE: CAMPAIGN VICTORY
    // ------------------------------------------------------------------------
    else if (this.state === 'VICTORY') {
      this.stateTimer += dt;
      // Spawn victory fireworks
      if (Math.random() < 0.12) {
        const rx = 40 + Math.random() * 176;
        const ry = 40 + Math.random() * 140;
        this.spawnPortalBurst(rx, ry);
        APU.sfx('COIN');
      }

      if (PAD.hit('a') || PAD.hit('start') || (PAD.tapPos && PAD.tapPos.y < 218)) {
        APU.sfx('UI_OK');
        this.loadLevel(0, true);
      }
    }
  },

  // --------------------------------------------------------------------------
  // TOUCH SCREEN INTERACTION & SLINGSHOT DRAG LOGIC
  // --------------------------------------------------------------------------
  updateTouchControls(dt) {
    const lvl = this.levels[this.levelIdx];
    const pointer = PAD.pointer;

    if (!pointer) return;

    if (pointer.down) {
      // 1. Bottom touch buttons check
      if (pointer.y >= 218) {
        if (this.isDragging) {
          this.isDragging = false;
        }
        for (let key in this.buttons) {
          const btn = this.buttons[key];
          if (pointer.x >= btn.x && pointer.x <= btn.x + btn.w && pointer.y >= btn.y && pointer.y <= btn.y + btn.h) {
            this.activeButton = btn.id;
            return;
          }
        }
        this.activeButton = null;
        return;
      }

      // 2. Slingshot direct touch drag on playfield
      if (this.state === 'AIM') {
        if (!this.isDragging) {
          // Touch initiated
          this.isDragging = true;
          this.dragOrigin = { x: lvl.launch.x, y: lvl.launch.y };
          this.dragCurrent = { x: pointer.x, y: pointer.y };
        } else {
          this.dragCurrent = { x: pointer.x, y: pointer.y };
        }

        // Pull vector (from launch pad to finger)
        const dx = this.dragCurrent.x - this.dragOrigin.x;
        const dy = this.dragCurrent.y - this.dragOrigin.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 8) {
          // Pulling backwards shoots forwards (slingshot mechanics)
          this.aimAngle = Math.atan2(-dy, -dx);
          this.aimPower = Math.max(40, Math.min(160, dist * 1.6));
          this.calcTrajectory();
        }
      }
    } else {
      // Touch released
      if (this.activeButton) {
        const btnId = this.activeButton;
        this.activeButton = null;

        if (btnId === 'prev') {
          const prevIdx = Math.max(0, this.levelIdx - 1);
          if (prevIdx !== this.levelIdx) {
            this.loadLevel(prevIdx, true);
            APU.sfx('UI_MOVE');
          }
        } else if (btnId === 'next') {
          const maxAllowed = Math.min(9, this.unlockedLevel);
          const nextIdx = Math.min(maxAllowed, this.levelIdx + 1);
          if (nextIdx !== this.levelIdx) {
            this.loadLevel(nextIdx, true);
            APU.sfx('UI_MOVE');
          }
        } else if (btnId === 'launch') {
          if (this.state === 'AIM') {
            this.launchProbe();
          }
        } else if (btnId === 'abort') {
          if (this.state === 'FLIGHT') {
            this.abortProbe(true);
          } else if (this.state === 'GAME_OVER' || this.state === 'CRASH') {
            this.loadLevel(this.levelIdx, true);
            APU.sfx('UI_OK');
          } else if (this.state === 'LEVEL_CLEAR') {
            this.loadLevel(Math.min(9, this.levelIdx + 1), true);
            APU.sfx('UI_OK');
          }
        }
        return;
      }

      if (this.isDragging) {
        this.isDragging = false;
        const dx = this.dragCurrent.x - this.dragOrigin.x;
        const dy = this.dragCurrent.y - this.dragOrigin.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 14 && this.state === 'AIM') {
          // Fire probe on release!
          this.launchProbe();
        }
      }
    }
  },

  // --------------------------------------------------------------------------
  // RENDERING & RETRO CRT GRAPHICS
  // --------------------------------------------------------------------------
  render(g) {
    // Screen shake offset
    let ox = 0, oy = 0;
    if (this.shake > 0) {
      ox = Math.round((Math.random() - 0.5) * this.shake);
      oy = Math.round((Math.random() - 0.5) * this.shake);
    }

    g.clear(0);
    const lvl = this.levels[this.levelIdx];

    // 1. Starfield background
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      const brightness = Math.sin(this.time * (3.14 / s.period) + s.phase) > 0.3 ? 2 : 1;
      g.px(s.x + ox, s.y + oy, brightness);
    }

    // 2. Gravity well shimmer rings & celestial bodies
    for (let i = 0; i < lvl.bodies.length; i++) {
      const b = this.getBodyPos(lvl.bodies[i], this.state === 'FLIGHT' ? this.flightTime : this.time);
      const bx = Math.round(b.x + ox);
      const by = Math.round(b.y + oy);

      // Faint gravitational field rings
      g.circle(bx, by, Math.round(b.r + 14), 1);
      if (b.type === 'blackhole' || b.type === 'whitedwarf' || b.type === 'gasgiant') {
        g.circle(bx, by, Math.round(b.r + 26), 1);
      }

      // Body-specific rendering
      if (b.type === 'planet') {
        // Shaded terrestrial planet
        g.disc(bx, by, b.r, b.color || 2);
        g.circle(bx, by, b.r + 2, 1); // Atmosphere
        // Surface continents / crater texture
        g.px(bx - 3, by - 2, 3);
        g.px(bx + 4, by + 1, 3);
        g.px(bx + 1, by + 4, 3);
        // Crescent shadow
        for (let dy = -b.r; dy <= b.r; dy++) {
          const dxMax = Math.floor(Math.sqrt(Math.max(0, b.r * b.r - dy * dy)));
          if (dxMax > 2) {
            g.line(bx - dxMax, by + dy, bx - Math.floor(dxMax * 0.4), by + dy, 1);
          }
        }
      } else if (b.type === 'moon') {
        // Lunar body with orbit trail
        if (lvl.bodies[i].parentIdx !== undefined) {
          const p = this.getBodyPos(lvl.bodies[lvl.bodies[i].parentIdx], this.time);
          g.circle(Math.round(p.x + ox), Math.round(p.y + oy), lvl.bodies[i].orbR, 1);
        }
        g.disc(bx, by, b.r, b.color || 3);
        g.px(bx - 1, by - 1, 1);
      } else if (b.type === 'star') {
        // Blazing star with corona rays
        g.disc(bx, by, b.r, 3);
        g.circle(bx, by, b.r + 2, 2);
        // Pulsating flares
        const flareDist = Math.sin(this.time * 6 + i) * 2 + 4;
        g.line(bx - b.r - flareDist, by, bx + b.r + flareDist, by, 2);
        g.line(bx, by - b.r - flareDist, bx, by + b.r + flareDist, 2);
      } else if (b.type === 'gasgiant') {
        // Jupiter with horizontal bands & rings
        g.disc(bx, by, b.r, 2);
        // Storm bands
        g.line(bx - b.r + 2, by - 6, bx + b.r - 2, by - 6, 1);
        g.line(bx - b.r + 1, by - 2, bx + b.r - 1, by - 2, 3);
        g.line(bx - b.r + 1, by + 3, bx + b.r - 1, by + 3, 1);
        g.line(bx - b.r + 3, by + 7, bx + b.r - 3, by + 7, 1);
        // Rings
        if (b.ringInner && b.ringOuter) {
          for (let deg = 0; deg < 360; deg += 6) {
            const rad = deg * (Math.PI / 180);
            const rx1 = bx + Math.cos(rad) * b.ringInner;
            const ry1 = by + Math.sin(rad) * (b.ringInner * 0.35);
            const rx2 = bx + Math.cos(rad) * b.ringOuter;
            const ry2 = by + Math.sin(rad) * (b.ringOuter * 0.35);
            if (deg % 12 === 0) g.line(Math.round(rx1), Math.round(ry1), Math.round(rx2), Math.round(ry2), 1);
          }
        }
      } else if (b.type === 'whitedwarf') {
        // Ultra-dense white dwarf
        g.disc(bx, by, b.r, 3);
        g.line(bx - 8, by, bx + 8, by, 3);
        g.line(bx, by - 8, bx, by + 8, 3);
        g.circle(bx, by, 8, 2);
      } else if (b.type === 'blackhole') {
        // Black hole with event horizon & glowing accretion disk
        const accR = b.accretionR || 40;
        // Accretion disk particles
        for (let j = 0; j < 24; j++) {
          const aAng = this.time * 4.5 + j * (Math.PI / 12);
          const aRad = b.eventR + 4 + (j % 5) * 3.5;
          const ax = bx + Math.cos(aAng) * aRad;
          const ay = by + Math.sin(aAng) * (aRad * 0.55);
          g.px(Math.round(ax), Math.round(ay), (j % 2 === 0) ? 3 : 2);
        }
        // Event horizon photon sphere
        g.circle(bx, by, b.eventR, 3);
        // Absolute black singularity core
        g.disc(bx, by, b.eventR - 1, 0);
      }
    }

    // 3. Obstacle Asteroid Belts
    if (lvl.obstacles) {
      for (let i = 0; i < lvl.obstacles.length; i++) {
        const obs = lvl.obstacles[i];
        const oxp = Math.round(obs.x + ox);
        const oyp = Math.round(obs.y + oy);
        g.disc(oxp, oyp, obs.r, 2);
        g.circle(oxp, oyp, obs.r, 1);
        g.px(oxp - 1, oyp - 1, 3);
      }
    }

    // 4. Wormhole / Warp Portal Destination (Swirling Vortex Animation)
    const pX = Math.round(lvl.portal.x + ox);
    const pY = Math.round(lvl.portal.y + oy);
    const pR = lvl.portal.r;

    // Concentric pulsing portal rings
    const pulse = Math.sin(this.portalVortexTimer * 5) * 2;
    g.circle(pX, pY, Math.round(pR + pulse), 2);
    g.circle(pX, pY, Math.max(3, Math.round(pR - 3)), 3);

    // Swirling vortex particle animation
    for (let i = 0; i < 16; i++) {
      const vAng = this.portalVortexTimer * 3.5 + i * (Math.PI / 8);
      const vRad = 3 + ((this.portalVortexTimer * 24 + i * 3) % (pR - 2));
      const vx = pX + Math.cos(vAng) * vRad;
      const vy = pY + Math.sin(vAng) * vRad;
      g.px(Math.round(vx), Math.round(vy), (i % 2 === 0) ? 3 : 2);
    }
    g.disc(pX, pY, 2, 3);
    g.px(pX, pY, 0);
    g.text("WARP", pX - 9, pY - pR - 8, 3);

    // 5. Trajectory Prediction Arc (Dashed Line)
    if (this.state === 'AIM' && this.trajectory && this.trajectory.length > 1) {
      const isLocked = this.trajectoryHitsPortal;
      const col = isLocked ? 3 : 2;

      for (let i = 0; i < this.trajectory.length; i += 2) {
        const pt = this.trajectory[i];
        g.px(Math.round(pt.x + ox), Math.round(pt.y + oy), col);
      }

      // If locked on portal, render lock-on target brackets
      if (isLocked) {
        const bSize = pR + 4;
        g.line(pX - bSize, pY - bSize, pX - bSize + 4, pY - bSize, 3);
        g.line(pX - bSize, pY - bSize, pX - bSize, pY - bSize + 4, 3);
        g.line(pX + bSize, pY - bSize, pX + bSize - 4, pY - bSize, 3);
        g.line(pX + bSize, pY - bSize, pX + bSize, pY - bSize + 4, 3);
        g.line(pX - bSize, pY + bSize, pX - bSize + 4, pY + bSize, 3);
        g.line(pX - bSize, pY + bSize, pX - bSize, pY + bSize - 4, 3);
        g.line(pX + bSize, pY + bSize, pX + bSize - 4, pY + bSize, 3);
        g.line(pX + bSize, pY + bSize, pX + bSize, pY + bSize - 4, 3);
      }

      // Impact cross marker if trajectory crashes
      if (this.trajectoryCrash) {
        const cx = Math.round(this.trajectoryCrash.x + ox);
        const cy = Math.round(this.trajectoryCrash.y + oy);
        g.line(cx - 2, cy - 2, cx + 2, cy + 2, 3);
        g.line(cx - 2, cy + 2, cx + 2, cy - 2, 3);
      }
    }

    // 6. Launch Platform & Slingshot Elastic Tether
    const lx = Math.round(lvl.launch.x + ox);
    const ly = Math.round(lvl.launch.y + oy);

    // Mechanical launch pad gantry
    g.rect(lx - 6, ly + 4, 12, 3, 1);
    g.box(lx - 6, ly + 4, 12, 3, 2);
    g.line(lx - 4, ly + 4, lx - 4, ly - 3, 2);
    g.line(lx + 4, ly + 4, lx + 4, ly - 3, 2);

    if (this.state === 'AIM') {
      if (this.isDragging) {
        // Elastic slingshot rubber band stretched to touch position
        const dx = this.dragCurrent.x;
        const dy = this.dragCurrent.y;
        g.line(lx - 4, ly - 3, Math.round(dx + ox), Math.round(dy + oy), 3);
        g.line(lx + 4, ly - 3, Math.round(dx + ox), Math.round(dy + oy), 3);
        // Probe in sling pocket
        g.disc(Math.round(dx + ox), Math.round(dy + oy), 3, 3);
        // Thrust direction arrow
        const arrX = lx + Math.cos(this.aimAngle) * 18;
        const arrY = ly + Math.sin(this.aimAngle) * 18;
        g.line(lx, ly, Math.round(arrX), Math.round(arrY), 2);
      } else {
        // Probe waiting on launch platform
        g.disc(lx, ly, 3, 3);
        const arrX = lx + Math.cos(this.aimAngle) * 16;
        const arrY = ly + Math.sin(this.aimAngle) * 16;
        g.line(lx, ly, Math.round(arrX), Math.round(arrY), 3);
      }
    }

    // 7. Probe in flight with rocket exhaust trail
    if (this.state === 'FLIGHT' && this.probe) {
      // Draw contrail
      for (let i = 0; i < this.trail.length; i++) {
        const tr = this.trail[i];
        const col = (i % 3 === 0) ? 3 : 2;
        g.px(Math.round(tr.x + ox), Math.round(tr.y + oy), col);
      }

      // Draw oriented probe spacecraft
      const prX = Math.round(this.probe.x + ox);
      const prY = Math.round(this.probe.y + oy);
      const ang = Math.atan2(this.probe.vy, this.probe.vx);

      const noseX = prX + Math.cos(ang) * 4;
      const noseY = prY + Math.sin(ang) * 4;
      const leftX = prX + Math.cos(ang + 2.4) * 3.5;
      const leftY = prY + Math.sin(ang + 2.4) * 3.5;
      const rightX = prX + Math.cos(ang - 2.4) * 3.5;
      const rightY = prY + Math.sin(ang - 2.4) * 3.5;

      g.tri(noseX, noseY, leftX, leftY, rightX, rightY, 3);
      // Thruster flame
      if (Math.random() < 0.75) {
        const flameX = prX - Math.cos(ang) * 4;
        const flameY = prY - Math.sin(ang) * 4;
        g.px(Math.round(flameX), Math.round(flameY), 3);
      }
    }

    // 8. Visual FX: Particles and Blasts
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.size === 2) {
        g.rect(Math.round(p.x + ox), Math.round(p.y + oy), 2, 2, p.color);
      } else {
        g.px(Math.round(p.x + ox), Math.round(p.y + oy), p.color);
      }
    }

    for (let i = 0; i < this.blasts.length; i++) {
      const b = this.blasts[i];
      g.circle(Math.round(b.x + ox), Math.round(b.y + oy), Math.round(b.r), 3);
    }

    // ------------------------------------------------------------------------
    // TOP BAR HUD (ZONE, PROBES ATTEMPTS, RECORD, TRAJECTORY LOCK)
    // ------------------------------------------------------------------------
    g.rect(0, 0, 256, 17, 0);
    g.line(0, 17, 256, 17, 1);

    // Zone Title
    const zoneStr = "Z" + lvl.num + ": " + lvl.name;
    g.text(zoneStr, 4, 3, 3);

    // Probes Remaining indicator
    let probeIcons = "";
    for (let p = 0; p < this.probesLeft; p++) probeIcons += "▲ ";
    g.text("PROBES: " + (probeIcons || "NONE"), 118, 3, this.probesLeft > 1 ? 3 : 2);

    // Best Record
    g.textR("BEST: " + this.bestScore, 252, 3, 3);

    // Trajectory Status indicator
    if (this.state === 'AIM') {
      const deg = Math.round(this.aimAngle * (180 / Math.PI));
      const pwr = Math.round(this.aimPower);
      if (this.trajectoryHitsPortal) {
        g.text("★ WARP TRAJECTORY LOCKED ★", 4, 11, 3);
      } else {
        g.text("ANG: " + deg + "°  PWR: " + pwr, 4, 11, 2);
      }
    } else if (this.state === 'FLIGHT') {
      g.text("TELEMETRY: PROBE IN FLIGHT...", 4, 11, 3);
    }

    // ------------------------------------------------------------------------
    // BOTTOM BAR TOUCH CONTROLS ([◀ LVL], [ABORT], [LAUNCH], [LVL ▶])
    // ------------------------------------------------------------------------
    g.rect(0, 219, 256, 21, 0);
    g.line(0, 219, 256, 21, 1);

    for (let key in this.buttons) {
      const btn = this.buttons[key];
      const isDown = this.activeButton === btn.id;

      let isEnabled = true;
      let label = btn.label;

      if (btn.id === 'prev') {
        isEnabled = this.levelIdx > 0;
      } else if (btn.id === 'next') {
        isEnabled = this.levelIdx < Math.min(9, this.unlockedLevel);
      } else if (btn.id === 'launch') {
        isEnabled = this.state === 'AIM';
        label = (this.state === 'FLIGHT') ? "FLYING" : "LAUNCH";
      } else if (btn.id === 'abort') {
        if (this.state === 'FLIGHT') {
          label = "ABORT";
          isEnabled = true;
        } else if (this.state === 'LEVEL_CLEAR') {
          label = "NEXT ▶";
          isEnabled = true;
        } else if (this.state === 'GAME_OVER' || this.state === 'CRASH') {
          label = "RETRY";
          isEnabled = true;
        } else {
          label = "RESET";
          isEnabled = true;
        }
      }

      if (isDown && isEnabled) {
        g.rect(btn.x, btn.y, btn.w, btn.h, 3);
        g.textC(label, btn.y + 6, 0);
      } else {
        g.rect(btn.x, btn.y, btn.w, btn.h, 0);
        g.box(btn.x, btn.y, btn.w, btn.h, isEnabled ? 2 : 1);
        const col = isEnabled ? (btn.id === 'launch' && this.trajectoryHitsPortal ? 3 : 2) : 1;
        g.text(label, btn.x + Math.floor((btn.w - label.length * 5) / 2), btn.y + 6, col);
      }
    }

    // ------------------------------------------------------------------------
    // VICTORY / LEVEL CLEAR / GAME OVER OVERLAYS
    // ------------------------------------------------------------------------
    if (this.state === 'LEVEL_CLEAR') {
      g.rect(28, 70, 200, 72, 0);
      g.box(28, 70, 200, 72, 3);
      g.box(30, 72, 196, 68, 2);
      g.textC("WARP JUMP SUCCESSFUL!", 82, 3);
      g.textC("ZONE " + lvl.num + " CLEARED!", 96, 2);
      g.textC("PRESS [A] OR TAP NEXT FOR ZONE " + (lvl.num + 1), 114, 3);
    } else if (this.state === 'GAME_OVER') {
      g.rect(28, 70, 200, 72, 0);
      g.box(28, 70, 200, 72, 3);
      g.box(30, 72, 196, 68, 1);
      g.textC("ALL PROBES LOST", 82, 3);
      g.textC("GRAVITATIONAL CAPTURE FATALITY", 96, 2);
      g.textC("PRESS [A] OR TAP RETRY", 114, 3);
    } else if (this.state === 'VICTORY') {
      g.rect(20, 60, 216, 92, 0);
      g.box(20, 60, 216, 92, 3);
      g.box(22, 62, 212, 88, 2);
      g.textC("★ GRAND TOUR COMPLETED! ★", 74, 3);
      g.textC("YOU CONQUERED ALL 10 ORBITAL ZONES!", 88, 3);
      g.textC("MASTER OF RETRO CELESTIAL MECHANICS", 102, 2);
      g.textC("PRESS [A] TO RESTART CAMPAIGN", 124, 3);
    }
  },

  // --------------------------------------------------------------------------
  // PERSISTENCE: SAVE / LOAD STATE
  // --------------------------------------------------------------------------
  save() {
    return {
      unlockedLevel: this.unlockedLevel,
      completedZones: this.score,
      bestScore: this.bestScore
    };
  },

  load(data) {
    if (!data) return;
    if (typeof data.unlockedLevel === 'number') {
      this.unlockedLevel = Math.max(0, Math.min(9, data.unlockedLevel));
    }
    if (typeof data.completedZones === 'number') {
      this.score = Math.max(this.score, data.completedZones);
    }
    if (typeof data.bestScore === 'number') {
      this.bestScore = Math.max(this.bestScore, data.bestScore);
    }
  }
};
