// js/cartridges/cart_024_portal_drop.js
// ============================================================================
// Cartridge #024: PORTAL DROP
// ============================================================================
// An authentic Aperture-inspired 2D momentum physics puzzle campaign featuring:
// - Dynamic Dual-Portal Gun with surface normal alignment & clamping
// - Exact Momentum Conservation Vector Physics ("Speedy thing goes in, speedy thing comes out")
// - Symplectic Euler substepped simulation with anti-re-entry safeguards
// - Weighted floor buttons, heavy barrier doors, toxic acid hazard pools, and crystals
// - 8 Progressive puzzle test chambers testing vertical drops, horizontal flings,
//   infinite kinetic loops, and multi-redirect trajectory arcs
// - Swirling animated portal vortexes with spark particle systems
// - Full D-pad, Gamepad, Keyboard, and Mobile Touch tap/drag controls
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[24] = {
  id: 24,
  name: "PORTAL DROP",
  genre: 2, // PHYSICS
  scoreLabel: "CRYSTALS",
  desc: "[A] BLUE PORTAL, [B] ORANGE PORTAL. CONSERVE MOMENTUM TO REACH GEMS!",

  // --------------------------------------------------------------------------
  // ICON RENDERING (32x32)
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Blue portal ring (left)
    g.circle(x + 10, y + 16, 7, 3);
    g.disc(x + 10, y + 16, 4, 1);
    g.px(x + 10, y + 16, 3);
    // Orange portal ring (right)
    g.circle(x + 22, y + 16, 7, 2);
    g.disc(x + 22, y + 16, 4, 0);
    g.px(x + 22, y + 16, 2);
    // Kinetic sphere catapulting between portals
    g.disc(x + 16, y + 12, 2, 3);
    // Shimmering particle sparks
    g.px(x + 8, y + 9, 3);
    g.px(x + 24, y + 23, 2);
    g.px(x + 16, y + 26, 3);
  },

  // --------------------------------------------------------------------------
  // 8 PROGRESSIVE PUZZLE CHAMBERS
  // --------------------------------------------------------------------------
  chambers: [
    // Chamber 1: Simple Drop (Tutorial)
    {
      name: "SIMPLE DROP",
      par: 2,
      spawn: { x: 38, y: 44 },
      blocks: [
        // Spawn shelf (unportalable)
        { x: 16, y: 56, w: 44, h: 8, portalable: false },
        // Portalable floor pad below drop
        { x: 16, y: 220, w: 56, h: 8, portalable: true, faces: ['top'] },
        // Center dividing wall
        { x: 92, y: 110, w: 14, h: 118, portalable: false },
        // Portalable ceiling pad over right side
        { x: 156, y: 22, w: 68, h: 8, portalable: true, faces: ['bottom'] },
        // Right landing platform
        { x: 150, y: 172, w: 84, h: 10, portalable: false }
      ],
      hazards: [],
      buttons: [],
      doors: [],
      gems: [
        { x: 190, y: 92 }
      ],
      exit: { x: 204, y: 150, w: 16, h: 22 }
    },

    // Chamber 2: Horizontal Fling
    {
      name: "HORIZONTAL FLING",
      par: 2,
      spawn: { x: 34, y: 36 },
      blocks: [
        // High spawn shelf
        { x: 16, y: 48, w: 36, h: 8, portalable: false },
        // Floor at bottom of left drop shaft
        { x: 16, y: 220, w: 44, h: 8, portalable: true, faces: ['top'] },
        // Pillar with right-facing portalable surface pointing over gap
        { x: 60, y: 80, w: 14, h: 148, portalable: true, faces: ['right'] },
        // Far right landing ledge
        { x: 170, y: 152, w: 68, h: 10, portalable: false }
      ],
      hazards: [
        // Acid pit stretching across bottom gap
        { x: 74, y: 216, w: 96, h: 16 }
      ],
      buttons: [],
      doors: [],
      gems: [
        { x: 126, y: 112 }
      ],
      exit: { x: 206, y: 130, w: 16, h: 22 }
    },

    // Chamber 3: High Ledge (Kinetic Loop Buildup)
    {
      name: "HIGH LEDGE",
      par: 3,
      spawn: { x: 36, y: 32 },
      blocks: [
        // High spawn ledge
        { x: 16, y: 44, w: 38, h: 8, portalable: false },
        // Drop chute ceiling
        { x: 16, y: 22, w: 46, h: 8, portalable: true, faces: ['bottom'] },
        // Drop chute floor
        { x: 16, y: 220, w: 46, h: 8, portalable: true, faces: ['top'] },
        // Chute partition wall with open launch window
        { x: 62, y: 120, w: 14, h: 108, portalable: false },
        // Launch floor pad on right
        { x: 150, y: 220, w: 56, h: 8, portalable: true, faces: ['top'] },
        // Ultra-high ledge
        { x: 144, y: 68, w: 86, h: 10, portalable: false }
      ],
      hazards: [],
      buttons: [],
      doors: [],
      gems: [
        { x: 176, y: 46 }
      ],
      exit: { x: 204, y: 46, w: 16, h: 22 }
    },

    // Chamber 4: Button & Barrier
    {
      name: "BUTTON & BARRIER",
      par: 3,
      spawn: { x: 34, y: 36 },
      blocks: [
        // Spawn platform
        { x: 16, y: 50, w: 40, h: 8, portalable: false },
        // Lower button alcove floor
        { x: 20, y: 170, w: 70, h: 10, portalable: true, faces: ['top'] },
        // Dividing wall
        { x: 96, y: 22, w: 14, h: 128, portalable: false },
        { x: 96, y: 198, w: 14, h: 30, portalable: false },
        // Right chamber portalable ceiling
        { x: 140, y: 22, w: 70, h: 8, portalable: true, faces: ['bottom'] },
        // Right chamber floor
        { x: 120, y: 220, w: 110, h: 8, portalable: false }
      ],
      hazards: [],
      buttons: [
        { id: 'b1', x: 44, y: 166, w: 18, h: 4, doorId: 'd1', pressed: false }
      ],
      doors: [
        { id: 'd1', x: 96, y: 150, w: 14, h: 48, open: false }
      ],
      gems: [
        { x: 175, y: 120 }
      ],
      exit: { x: 204, y: 198, w: 16, h: 22 }
    },

    // Chamber 5: Acid Pit Clearance
    {
      name: "ACID PIT CLEARANCE",
      par: 4,
      spawn: { x: 36, y: 34 },
      blocks: [
        // High spawn ledge
        { x: 16, y: 46, w: 38, h: 8, portalable: false },
        // Left shaft bottom pad
        { x: 16, y: 220, w: 38, h: 8, portalable: true, faces: ['top'] },
        // Suspended middle bunker with left face and ceiling portalable
        { x: 106, y: 22, w: 38, h: 56, portalable: true, faces: ['left', 'bottom'] },
        // Floating high exit island
        { x: 176, y: 130, w: 58, h: 10, portalable: false }
      ],
      hazards: [
        // Massive bubbling acid ocean
        { x: 54, y: 218, w: 188, h: 14 }
      ],
      buttons: [],
      doors: [],
      gems: [
        { x: 80, y: 165 },
        { x: 144, y: 98 }
      ],
      exit: { x: 206, y: 108, w: 16, h: 22 }
    },

    // Chamber 6: Angled Fling
    {
      name: "ANGLED FLING",
      par: 4,
      spawn: { x: 214, y: 34 },
      blocks: [
        // Upper right spawn ledge
        { x: 190, y: 48, w: 46, h: 8, portalable: false },
        // Roll ramp wall with left portalable surface
        { x: 154, y: 64, w: 14, h: 72, portalable: true, faces: ['left'] },
        // Lower center divider
        { x: 110, y: 130, w: 14, h: 98, portalable: false },
        // Portalable floor in left chamber
        { x: 26, y: 220, w: 56, h: 8, portalable: true, faces: ['top'] },
        // Portalable ceiling in left chamber
        { x: 40, y: 22, w: 60, h: 8, portalable: true, faces: ['bottom'] },
        // Bottom left exit ledge
        { x: 16, y: 190, w: 46, h: 10, portalable: false }
      ],
      hazards: [
        { x: 110, y: 222, w: 124, h: 10 }
      ],
      buttons: [],
      doors: [],
      gems: [
        { x: 92, y: 56 },
        { x: 38, y: 130 }
      ],
      exit: { x: 30, y: 168, w: 16, h: 22 }
    },

    // Chamber 7: Triple Gem Cascade
    {
      name: "TRIPLE CASCADE",
      par: 5,
      spawn: { x: 34, y: 34 },
      blocks: [
        // Upper left spawn
        { x: 16, y: 46, w: 36, h: 8, portalable: false },
        // Left shaft bottom pad
        { x: 16, y: 220, w: 40, h: 8, portalable: true, faces: ['top'] },
        // Floating central platform
        { x: 98, y: 144, w: 60, h: 10, portalable: true, faces: ['top'] },
        // Center ceiling pillar
        { x: 116, y: 22, w: 24, h: 48, portalable: true, faces: ['left', 'right'] },
        // Lower right exit landing
        { x: 178, y: 196, w: 56, h: 10, portalable: false },
        // Security divider guarding exit
        { x: 168, y: 154, w: 10, h: 74, portalable: false }
      ],
      hazards: [
        { x: 56, y: 220, w: 42, h: 12 },
        { x: 158, y: 220, w: 80, h: 12 }
      ],
      buttons: [
        { id: 'b2', x: 118, y: 140, w: 18, h: 4, doorId: 'd2', pressed: false }
      ],
      doors: [
        { id: 'd2', x: 168, y: 154, w: 10, h: 42, open: false }
      ],
      gems: [
        { x: 54, y: 90 },
        { x: 128, y: 88 },
        { x: 206, y: 120 }
      ],
      exit: { x: 206, y: 174, w: 16, h: 22 }
    },

    // Chamber 8: Master Test Chamber
    {
      name: "MASTER TEST CHAMBER",
      par: 6,
      spawn: { x: 36, y: 34 },
      blocks: [
        // High spawn launch ledge
        { x: 16, y: 46, w: 40, h: 8, portalable: false },
        // Chute floor pad
        { x: 16, y: 220, w: 42, h: 8, portalable: true, faces: ['top'] },
        // Left ceiling pad
        { x: 16, y: 22, w: 42, h: 8, portalable: true, faces: ['bottom'] },
        // Middle ceiling structure with portalable faces
        { x: 102, y: 22, w: 44, h: 62, portalable: true, faces: ['left', 'bottom', 'right'] },
        // Island with weighted button across acid
        { x: 92, y: 168, w: 46, h: 10, portalable: false },
        // Dividing blast door wall
        { x: 166, y: 22, w: 12, h: 140, portalable: false },
        { x: 166, y: 198, w: 12, h: 30, portalable: false },
        // Far right exit platform
        { x: 178, y: 218, w: 60, h: 10, portalable: false }
      ],
      hazards: [
        // Deadly acid pools on floor
        { x: 58, y: 220, w: 108, h: 12 }
      ],
      buttons: [
        { id: 'b3', x: 104, y: 164, w: 18, h: 4, doorId: 'd3', pressed: false }
      ],
      doors: [
        { id: 'd3', x: 166, y: 162, w: 12, h: 36, open: false }
      ],
      gems: [
        { x: 74, y: 110 },
        { x: 124, y: 110 },
        { x: 210, y: 140 }
      ],
      exit: { x: 212, y: 196, w: 16, h: 22 }
    }
  ],

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------
  init() {
    this.chamberIdx = 0;
    this.score = 0;
    this.totalShots = 0;
    this.chamberShots = 0;
    this.state = 'PLAYING'; // 'PLAYING' | 'CLEAR' | 'VICTORY'
    this.bannerTimer = 0;
    this.flashTimer = 0;
    this.gameTime = 0;

    // Reticle & Touch input
    this.reticle = { x: 128, y: 120, vx: 0, vy: 0 };
    this.activeTouchGun = 'A'; // 'A' (Blue) or 'B' (Orange)

    // Particles system (sparks, bubbles, portal vortexes)
    this.particles = [];

    // Load first chamber
    this.loadChamber(this.chamberIdx);
  },

  // --------------------------------------------------------------------------
  // CHAMBER LOADER & SURFACE GENERATOR
  // --------------------------------------------------------------------------
  loadChamber(idx) {
    const ch = this.chambers[idx];
    this.curChamber = ch;
    this.chamberShots = 0;
    this.portalCooldown = 0;

    // Ball state
    this.ball = {
      x: ch.spawn.x,
      y: ch.spawn.y,
      vx: 0,
      vy: 0,
      radius: 4,
      dead: false,
      respawnTimer: 0,
      trail: []
    };

    // Portals
    this.portalA = { active: false, x: 0, y: 0, nx: 0, ny: 0, tx: 0, ty: 0, halfLen: 9, anim: 0 };
    this.portalB = { active: false, x: 0, y: 0, nx: 0, ny: 0, tx: 0, ty: 0, halfLen: 9, anim: 0 };

    // Deep copy interactive objects
    this.buttons = ch.buttons.map(b => Object.assign({}, b));
    this.doors = ch.doors.map(d => Object.assign({}, d));
    this.gems = ch.gems.map(g => Object.assign({ collected: false, sparkle: 0 }, g));
    this.exit = Object.assign({ open: false }, ch.exit);

    // Build portalable and solid surface segments
    this.buildSurfaces();

    // Default reticle position
    this.reticle.x = 128;
    this.reticle.y = 120;
    this.state = 'PLAYING';
  },

  // Builds discrete surface edges with outward normal vectors
  buildSurfaces() {
    this.surfaces = [];
    const ch = this.curChamber;

    // Room boundaries (x: 12..244, y: 22..226)
    // Left boundary wall
    this.surfaces.push({
      x1: 12, y1: 22, x2: 12, y2: 226,
      nx: 1, ny: 0, tx: 0, ty: 1, len: 204,
      portalable: false
    });
    // Right boundary wall
    this.surfaces.push({
      x1: 244, y1: 22, x2: 244, y2: 226,
      nx: -1, ny: 0, tx: 0, ty: 1, len: 204,
      portalable: false
    });
    // Top boundary ceiling
    this.surfaces.push({
      x1: 12, y1: 22, x2: 244, y2: 22,
      nx: 0, ny: 1, tx: 1, ty: 0, len: 232,
      portalable: false
    });
    // Bottom boundary floor
    this.surfaces.push({
      x1: 12, y1: 226, x2: 244, y2: 226,
      nx: 0, ny: -1, tx: 1, ty: 0, len: 232,
      portalable: false
    });

    // Add block faces
    ch.blocks.forEach(b => {
      const faces = b.faces || ['top', 'bottom', 'left', 'right'];
      const p = !!b.portalable;

      // Top edge (Floor) -> normal (0, -1)
      if (faces.includes('top')) {
        this.surfaces.push({
          x1: b.x, y1: b.y, x2: b.x + b.w, y2: b.y,
          nx: 0, ny: -1, tx: 1, ty: 0, len: b.w,
          portalable: p
        });
      }
      // Bottom edge (Ceiling) -> normal (0, 1)
      if (faces.includes('bottom')) {
        this.surfaces.push({
          x1: b.x, y1: b.y + b.h, x2: b.x + b.w, y2: b.y + b.h,
          nx: 0, ny: 1, tx: 1, ty: 0, len: b.w,
          portalable: p
        });
      }
      // Left edge (Wall facing left) -> normal (-1, 0)
      if (faces.includes('left')) {
        this.surfaces.push({
          x1: b.x, y1: b.y, x2: b.x, y2: b.y + b.h,
          nx: -1, ny: 0, tx: 0, ty: 1, len: b.h,
          portalable: p
        });
      }
      // Right edge (Wall facing right) -> normal (1, 0)
      if (faces.includes('right')) {
        this.surfaces.push({
          x1: b.x + b.w, y1: b.y, x2: b.x + b.w, y2: b.y + b.h,
          nx: 1, ny: 0, tx: 0, ty: 1, len: b.h,
          portalable: p
        });
      }
    });
  },

  // --------------------------------------------------------------------------
  // AUDIO HELPER
  // --------------------------------------------------------------------------
  playSfx(type) {
    if (typeof APU === 'undefined') return;
    try {
      if (type === 'fireA') {
        APU.softTone(587, 0.08, 'triangle', 0.09, 0, 0.01, 1400);
        APU.softTone(880, 0.10, 'sine', 0.08, 0.02, 0.01, 1800);
      } else if (type === 'fireB') {
        APU.softTone(440, 0.08, 'triangle', 0.09, 0, 0.01, 1200);
        APU.softTone(659, 0.10, 'sine', 0.08, 0.02, 0.01, 1600);
      } else if (type === 'teleport') {
        APU.sfx('POWER');
      } else if (type === 'coin') {
        APU.sfx('COIN');
      } else if (type === 'button') {
        APU.sfx('UI_OK');
      } else if (type === 'hurt') {
        APU.sfx('HURT');
      } else if (type === 'clear') {
        APU.sfx('LEVELUP');
      } else if (type === 'victory') {
        APU.sfx('LEVELUP');
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
          APU.softTone(f, 0.25, 'sine', 0.08, i * 0.08, 0.02, 2000);
        });
      } else if (type === 'deny') {
        APU.sfx('DENY');
      }
    } catch (e) {}
  },

  // --------------------------------------------------------------------------
  // RETICLE TARGET SURFACE FINDER
  // --------------------------------------------------------------------------
  getTargetSurface(rx, ry) {
    let bestPortalableDist = Infinity;
    let bestPortalableTarget = null;
    let bestAnyDist = Infinity;
    let bestAnyTarget = null;
    const halfLen = 9;

    for (let i = 0; i < this.surfaces.length; i++) {
      const s = this.surfaces[i];
      if (s.len < halfLen * 2) continue; // Surface too small for portal

      // Project reticle onto line segment
      const dx = rx - s.x1;
      const dy = ry - s.y1;
      const proj = dx * s.tx + dy * s.ty;
      const clampedProj = Math.max(halfLen, Math.min(s.len - halfLen, proj));

      const px = s.x1 + clampedProj * s.tx;
      const py = s.y1 + clampedProj * s.ty;

      const dist = Math.hypot(rx - px, ry - py);
      const cand = {
        x: px,
        y: py,
        nx: s.nx,
        ny: s.ny,
        tx: s.tx,
        ty: s.ty,
        portalable: s.portalable,
        dist: dist
      };

      if (dist < bestAnyDist) {
        bestAnyDist = dist;
        bestAnyTarget = cand;
      }
      if (s.portalable && dist < bestPortalableDist) {
        bestPortalableDist = dist;
        bestPortalableTarget = cand;
      }
    }

    // If a valid portalable surface is within snap distance, prefer it!
    if (bestPortalableTarget && bestPortalableDist <= 45) {
      return bestPortalableTarget;
    }
    return bestAnyTarget;
  },

  // --------------------------------------------------------------------------
  // PORTAL FIRING MECHANIC
  // --------------------------------------------------------------------------
  firePortal(color) {
    const target = this.getTargetSurface(this.reticle.x, this.reticle.y);
    if (!target) return;

    if (!target.portalable) {
      this.playSfx('deny');
      // Spark deny puff at reticle
      for (let i = 0; i < 4; i++) {
        this.spawnParticle(this.reticle.x, this.reticle.y, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, 1, 0.2);
      }
      return;
    }

    const portal = (color === 'A') ? this.portalA : this.portalB;
    portal.active = true;
    portal.x = target.x;
    portal.y = target.y;
    portal.nx = target.nx;
    portal.ny = target.ny;
    portal.tx = target.tx;
    portal.ty = target.ty;
    portal.anim = 1.0;

    this.chamberShots++;
    this.totalShots++;
    this.playSfx(color === 'A' ? 'fireA' : 'fireB');

    // Firing beam sparks from reticle to surface
    for (let i = 0; i < 10; i++) {
      const p = i / 10;
      const bx = this.reticle.x * (1 - p) + target.x * p;
      const by = this.reticle.y * (1 - p) + target.y * p;
      this.spawnParticle(bx, by, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, color === 'A' ? 3 : 2, 0.25);
    }
  },

  // --------------------------------------------------------------------------
  // PARTICLES
  // --------------------------------------------------------------------------
  spawnParticle(x, y, vx, vy, color = 3, life = 0.4) {
    this.particles.push({
      x, y, vx, vy,
      color,
      life,
      maxLife: life
    });
    if (this.particles.length > 90) this.particles.shift();
  },

  // --------------------------------------------------------------------------
  // UPDATE LOOP (SYMPLECTIC EULER PHYSICS)
  // --------------------------------------------------------------------------
  update(dt) {
    this.gameTime += dt;
    if (this.flashTimer > 0) this.flashTimer -= dt;
    if (this.portalCooldown > 0) this.portalCooldown -= dt;

    // Decay portal spawn animation pulse
    if (this.portalA.anim > 0) this.portalA.anim = Math.max(0, this.portalA.anim - dt * 3);
    if (this.portalB.anim > 0) this.portalB.anim = Math.max(0, this.portalB.anim - dt * 3);

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // State: CLEAR or VICTORY banner overlay
    if (this.state === 'CLEAR') {
      this.bannerTimer += dt;
      if (typeof PAD !== 'undefined' && (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || PAD.tapPos)) {
        this.chamberIdx++;
        if (this.chamberIdx >= this.chambers.length) {
          this.state = 'VICTORY';
          this.playSfx('victory');
        } else {
          this.loadChamber(this.chamberIdx);
        }
      }
      return;
    }

    if (this.state === 'VICTORY') {
      if (typeof PAD !== 'undefined' && (PAD.hit('a') || PAD.hit('start') || PAD.tapPos)) {
        this.init();
      }
      return;
    }

    // ------------------------------------------------------------------------
    // INPUT HANDLING
    // ------------------------------------------------------------------------
    if (typeof PAD !== 'undefined') {
      // D-Pad / Keyboard aiming reticle movement
      let moveX = 0, moveY = 0;
      if (PAD.held('left')) moveX -= 1;
      if (PAD.held('right')) moveX += 1;
      if (PAD.held('up')) moveY -= 1;
      if (PAD.held('down')) moveY += 1;

      const aimSpeed = 160;
      this.reticle.x += moveX * aimSpeed * dt;
      this.reticle.y += moveY * aimSpeed * dt;

      // Pointer / Touch drag controls
      if (PAD.pointer && PAD.pointer.down) {
        this.reticle.x = PAD.pointer.x;
        this.reticle.y = PAD.pointer.y;
      }

      // Clamp reticle inside chamber view
      this.reticle.x = Math.max(16, Math.min(240, this.reticle.x));
      this.reticle.y = Math.max(26, Math.min(222, this.reticle.y));

      // Button [A]: Fire Blue Portal
      if (PAD.hit('a')) {
        this.activeTouchGun = 'A';
        this.firePortal('A');
      }

      // Button [B]: Fire Orange Portal
      if (PAD.hit('b')) {
        this.activeTouchGun = 'B';
        this.firePortal('B');
      }

      // Reset Ball / Quick Respawn via SELECT
      if (PAD.hit('select')) {
        this.resetBall();
      }

      // Direct Touch Screen Tap handling
      if (PAD.tapPos) {
        const tx = PAD.tapPos.x;
        const ty = PAD.tapPos.y;

        // HUD Touch Buttons in bottom bar (y: 226..240)
        if (ty >= 222) {
          if (tx <= 60) {
            this.activeTouchGun = 'A';
            this.firePortal('A');
          } else if (tx >= 196) {
            this.activeTouchGun = 'B';
            this.firePortal('B');
          } else if (tx >= 100 && tx <= 156) {
            this.resetBall();
          }
        } else {
          // Tap inside chamber directly aims and fires active portal
          this.reticle.x = tx;
          this.reticle.y = ty;
          this.firePortal(this.activeTouchGun);
        }
      }
    }

    // ------------------------------------------------------------------------
    // BALL PHYSICS (SYMPLECTIC EULER WITH 4 SUBSTEPS)
    // ------------------------------------------------------------------------
    if (this.ball.dead) {
      this.ball.respawnTimer -= dt;
      if (this.ball.respawnTimer <= 0) {
        this.resetBall();
      }
      return;
    }

    const substeps = 4;
    const subDt = dt / substeps;

    for (let step = 0; step < substeps; step++) {
      // 1. Symplectic Euler Velocity update (Gravity + Air Resistance)
      this.ball.vy += 260 * subDt;
      this.ball.vx *= Math.pow(0.9992, subDt * 60);
      this.ball.vy *= Math.pow(0.9992, subDt * 60);

      // Terminal velocity clamp
      const spd = Math.hypot(this.ball.vx, this.ball.vy);
      if (spd > 340) {
        this.ball.vx = (this.ball.vx / spd) * 340;
        this.ball.vy = (this.ball.vy / spd) * 340;
      }

      // 2. Symplectic Euler Position update
      this.ball.x += this.ball.vx * subDt;
      this.ball.y += this.ball.vy * subDt;

      // 3. Portal Teleportation Check
      if (this.checkPortalPair(this.portalA, this.portalB)) break;
      if (this.checkPortalPair(this.portalB, this.portalA)) break;

      // 4. Acid / Hazard Collision
      if (this.checkHazardCollision()) {
        this.killBall();
        break;
      }

      // 5. Solid Block & Door Collisions
      this.checkSolidCollisions();

      // 6. Chamber Outer Boundary Safety
      if (this.ball.x < 16) { this.ball.x = 16; this.ball.vx = Math.abs(this.ball.vx) * 0.4; }
      if (this.ball.x > 240) { this.ball.x = 240; this.ball.vx = -Math.abs(this.ball.vx) * 0.4; }
      if (this.ball.y < 26) { this.ball.y = 26; this.ball.vy = Math.abs(this.ball.vy) * 0.4; }
      if (this.ball.y > 220) {
        this.ball.y = 220;
        this.ball.vy = -Math.abs(this.ball.vy) * 0.35;
        this.ball.vx *= 0.92;
      }
    }

    // ------------------------------------------------------------------------
    // INTERACTIVE CHAMBER ELEMENTS
    // ------------------------------------------------------------------------
    // Ball motion trail
    if (Math.hypot(this.ball.vx, this.ball.vy) > 110) {
      this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
      if (this.ball.trail.length > 5) this.ball.trail.shift();
    } else if (this.ball.trail.length > 0) {
      this.ball.trail.shift();
    }

    // 1. Weighted Buttons
    this.buttons.forEach(btn => {
      const bdx = this.ball.x - (btn.x + btn.w / 2);
      const bdy = this.ball.y - (btn.y + btn.h / 2);
      const isTouching = Math.abs(bdx) <= btn.w / 2 + 2 && Math.abs(bdy) <= btn.h / 2 + 4;

      if (isTouching && !btn.pressed) {
        btn.pressed = true;
        this.playSfx('button');
        // Open linked door
        const door = this.doors.find(d => d.id === btn.doorId);
        if (door) door.open = true;
      }
    });

    // 2. Crystal / Gem Pickups
    let remainingGems = 0;
    this.gems.forEach(gem => {
      if (!gem.collected) {
        remainingGems++;
        const gdist = Math.hypot(this.ball.x - gem.x, this.ball.y - gem.y);
        if (gdist < this.ball.radius + 6) {
          gem.collected = true;
          this.score++;
          this.playSfx('coin');
          SAVE.setScore(this.id, this.score);

          // Sparkle burst
          for (let i = 0; i < 8; i++) {
            const ang = (i / 8) * Math.PI * 2;
            this.spawnParticle(gem.x, gem.y, Math.cos(ang) * 50, Math.sin(ang) * 50, 3, 0.4);
          }
        }
      }
    });

    // 3. Exit Door / Goal Portal Activation
    // Exit unlocks when all gems are collected
    this.exit.open = (remainingGems === 0);

    if (this.exit.open) {
      const edx = this.ball.x - (this.exit.x + this.exit.w / 2);
      const edy = this.ball.y - (this.exit.y + this.exit.h / 2);
      if (Math.abs(edx) < this.exit.w / 2 + 2 && Math.abs(edy) < this.exit.h / 2 + 2) {
        // Chamber cleared!
        this.state = 'CLEAR';
        this.bannerTimer = 0;
        this.playSfx('clear');

        // Victory vortex burst
        for (let i = 0; i < 16; i++) {
          const ang = (i / 16) * Math.PI * 2;
          this.spawnParticle(this.exit.x + 8, this.exit.y + 10, Math.cos(ang) * 70, Math.sin(ang) * 70, 3, 0.6);
        }
      }
    }
  },

  // --------------------------------------------------------------------------
  // PORTAL PAIR MOMENTUM VECTOR TRANSFORM
  // --------------------------------------------------------------------------
  checkPortalPair(pIn, pOut) {
    if (!pIn.active || !pOut.active || this.portalCooldown > 0) return false;

    // Normal and tangent displacement relative to entry portal
    const dx = this.ball.x - pIn.x;
    const dy = this.ball.y - pIn.y;
    const dNorm = dx * pIn.nx + dy * pIn.ny;
    const dTan = dx * pIn.tx + dy * pIn.ty;

    // Ball velocity components relative to entry portal
    const vNorm = this.ball.vx * pIn.nx + this.ball.vy * pIn.ny;
    const vTan = this.ball.vx * pIn.tx + this.ball.vy * pIn.ty;

    // Entry criteria: within aperture width, touching threshold, moving inward
    if (Math.abs(dTan) <= pIn.halfLen + 1 && dNorm > -5 && dNorm < 7 && vNorm < -8) {
      // TELEPORTATION: MOMENTUM CONSERVATION & NORMAL ROTATION
      // Magnitude of entry velocity is conserved
      const entrySpeed = Math.hypot(vNorm, vTan);
      // Guarantee healthy clearance emergence speed
      const emergenceSpeed = Math.max(entrySpeed, 90);

      // Exit velocity: outward along exit normal + lateral tangent preserved
      this.ball.vx = pOut.nx * emergenceSpeed + pOut.tx * vTan;
      this.ball.vy = pOut.ny * emergenceSpeed + pOut.ty * vTan;

      // Anti-re-entry offset: place ball slightly outside exit portal aperture
      const clampedTan = Math.max(-pOut.halfLen + 2, Math.min(pOut.halfLen - 2, dTan));
      this.ball.x = pOut.x + pOut.tx * clampedTan + pOut.nx * (this.ball.radius + 5);
      this.ball.y = pOut.y + pOut.ty * clampedTan + pOut.ny * (this.ball.radius + 5);

      // Cooldown timer prevents oscillation
      this.portalCooldown = 0.14;
      this.flashTimer = 0.08;
      this.playSfx('teleport');

      // Teleportation flash particles
      for (let i = 0; i < 6; i++) {
        this.spawnParticle(pIn.x, pIn.y, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, 3, 0.3);
        this.spawnParticle(pOut.x, pOut.y, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, 2, 0.3);
      }
      return true;
    }
    return false;
  },

  // --------------------------------------------------------------------------
  // SOLID COLLISION RESOLUTION (BOX-CIRCLE)
  // --------------------------------------------------------------------------
  checkSolidCollisions() {
    const blocks = this.curChamber.blocks;
    const r = this.ball.radius;

    // Check chamber blocks
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      this.resolveBoxCollision(b.x, b.y, b.w, b.h);
    }

    // Check barrier doors if closed
    for (let i = 0; i < this.doors.length; i++) {
      const d = this.doors[i];
      if (!d.open) {
        this.resolveBoxCollision(d.x, d.y, d.w, d.h);
      }
    }
  },

  resolveBoxCollision(bx, by, bw, bh) {
    const r = this.ball.radius;
    // Find closest point on AABB
    const cx = Math.max(bx, Math.min(bx + bw, this.ball.x));
    const cy = Math.max(by, Math.min(by + bh, this.ball.y));
    const dx = this.ball.x - cx;
    const dy = this.ball.y - cy;
    const dist = Math.hypot(dx, dy);

    // If ball overlaps box
    if (dist < r) {
      // Check if this contact point is inside an active portal aperture (allow pass-through)
      if (this.isNearPortal(cx, cy)) return;

      if (dist > 0.001) {
        const nx = dx / dist;
        const ny = dy / dist;
        const pen = r - dist;
        this.ball.x += nx * pen;
        this.ball.y += ny * pen;

        // Velocity reflection with restitution
        const vDot = this.ball.vx * nx + this.ball.vy * ny;
        if (vDot < 0) {
          const rest = 0.35;
          this.ball.vx -= (1 + rest) * vDot * nx;
          this.ball.vy -= (1 + rest) * vDot * ny;

          // Surface tangent friction
          const tx = -ny, ty = nx;
          const vTan = this.ball.vx * tx + this.ball.vy * ty;
          this.ball.vx -= vTan * 0.08 * tx;
          this.ball.vy -= vTan * 0.08 * ty;
        }
      } else {
        // Deep penetration fallback: push out of nearest face
        const dl = Math.abs(this.ball.x - bx);
        const dr = Math.abs(bx + bw - this.ball.x);
        const dt = Math.abs(this.ball.y - by);
        const db = Math.abs(by + bh - this.ball.y);
        const minD = Math.min(dl, dr, dt, db);
        if (minD === dl) { this.ball.x = bx - r; this.ball.vx = -Math.abs(this.ball.vx) * 0.3; }
        else if (minD === dr) { this.ball.x = bx + bw + r; this.ball.vx = Math.abs(this.ball.vx) * 0.3; }
        else if (minD === dt) { this.ball.y = by - r; this.ball.vy = -Math.abs(this.ball.vy) * 0.3; }
        else { this.ball.y = by + bh + r; this.ball.vy = Math.abs(this.ball.vy) * 0.3; }
      }
    }
  },

  isNearPortal(x, y) {
    const portals = [this.portalA, this.portalB];
    for (let i = 0; i < portals.length; i++) {
      const p = portals[i];
      if (p.active && Math.hypot(x - p.x, y - p.y) < p.halfLen + 2) {
        return true;
      }
    }
    return false;
  },

  // --------------------------------------------------------------------------
  // HAZARD CHECKS (ACID PITS)
  // --------------------------------------------------------------------------
  checkHazardCollision() {
    const hazards = this.curChamber.hazards;
    for (let i = 0; i < hazards.length; i++) {
      const h = hazards[i];
      if (
        this.ball.x + this.ball.radius >= h.x &&
        this.ball.x - this.ball.radius <= h.x + h.w &&
        this.ball.y + this.ball.radius >= h.y &&
        this.ball.y - this.ball.radius <= h.y + h.h
      ) {
        return true;
      }
    }
    return false;
  },

  killBall() {
    this.ball.dead = true;
    this.ball.respawnTimer = 0.45;
    this.playSfx('hurt');

    // Toxic splash particles
    for (let i = 0; i < 14; i++) {
      this.spawnParticle(
        this.ball.x, this.ball.y,
        (Math.random() - 0.5) * 60,
        -Math.random() * 50 - 20,
        1, 0.5
      );
    }
  },

  resetBall() {
    this.ball.dead = false;
    this.ball.x = this.curChamber.spawn.x;
    this.ball.y = this.curChamber.spawn.y;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.trail = [];
  },

  // --------------------------------------------------------------------------
  // RENDERING ENGINE (256x240 CRT PHOSPHOR)
  // --------------------------------------------------------------------------
  render(g) {
    // Background screen clear with screen flash
    if (this.flashTimer > 0) {
      g.clear(1);
    } else {
      g.clear(0);
    }

    // Chamber background test tile grid
    for (let x = 16; x < 240; x += 16) {
      for (let y = 24; y < 224; y += 16) {
        g.px(x, y, 1);
      }
    }

    // Outer chamber border walls
    g.rect(0, 0, 12, 240, 2);
    g.rect(244, 0, 12, 240, 2);
    g.rect(0, 226, 256, 14, 2);

    // Render chamber blocks
    const blocks = this.curChamber.blocks;
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      g.rect(b.x, b.y, b.w, b.h, 2);

      // If portalable, highlight portalable faces with bright line
      if (b.portalable) {
        const faces = b.faces || ['top', 'bottom', 'left', 'right'];
        if (faces.includes('top')) g.line(b.x, b.y, b.x + b.w, b.y, 3);
        if (faces.includes('bottom')) g.line(b.x, b.y + b.h, b.x + b.w, b.y + b.h, 3);
        if (faces.includes('left')) g.line(b.x, b.y, b.x, b.y + b.h, 3);
        if (faces.includes('right')) g.line(b.x + b.w, b.y, b.x + b.w, b.y + b.h, 3);
      } else {
        // Non-portalable dark cross-hatch corner
        g.box(b.x, b.y, b.w, b.h, 1);
      }
    }

    // Render barrier doors
    for (let i = 0; i < this.doors.length; i++) {
      const d = this.doors[i];
      if (!d.open) {
        // Closed door: heavy metal hatch with cross
        g.rect(d.x, d.y, d.w, d.h, 2);
        g.box(d.x, d.y, d.w, d.h, 3);
        g.line(d.x, d.y, d.x + d.w, d.y + d.h, 1);
        g.line(d.x + d.w, d.y, d.x, d.y + d.h, 1);
      } else {
        // Open door: retracted frame with green energy field
        g.box(d.x, d.y, d.w, d.h, 1);
        for (let py = d.y + 4; py < d.y + d.h - 4; py += 6) {
          g.px(d.x + Math.floor(d.w / 2), py, 3);
        }
      }
    }

    // Render weighted floor buttons & conduit wires
    for (let i = 0; i < this.buttons.length; i++) {
      const btn = this.buttons[i];
      // Conduit wire from button to door
      const linkedDoor = this.doors.find(d => d.id === btn.doorId);
      if (linkedDoor) {
        const wireColor = btn.pressed ? 3 : 1;
        g.line(btn.x + 8, btn.y + 2, linkedDoor.x + 4, linkedDoor.y + linkedDoor.h, wireColor);
      }

      // Button base pad
      g.rect(btn.x, btn.y + 2, btn.w, 3, 1);
      // Depressed or raised button plate
      if (btn.pressed) {
        g.rect(btn.x + 2, btn.y + 2, btn.w - 4, 2, 3);
      } else {
        g.rect(btn.x + 2, btn.y, btn.w - 4, 3, 2);
        g.box(btn.x + 2, btn.y, btn.w - 4, 3, 3);
      }
    }

    // Render acid hazards (bubbling animated toxic pool)
    const hazards = this.curChamber.hazards;
    for (let i = 0; i < hazards.length; i++) {
      const h = hazards[i];
      g.rect(h.x, h.y, h.w, h.h, 1);
      // Animated bubbling wave top
      for (let bx = 0; bx < h.w; bx += 4) {
        const waveY = Math.sin(this.gameTime * 6 + (h.x + bx) * 0.25) * 1.5;
        g.px(h.x + bx, Math.round(h.y + waveY), 3);
        if ((bx + Math.floor(this.gameTime * 4)) % 8 === 0) {
          g.px(h.x + bx, h.y + 4, 2);
        }
      }
    }

    // Render collectible gems (shimmering diamond shape)
    for (let i = 0; i < this.gems.length; i++) {
      const gem = this.gems[i];
      if (!gem.collected) {
        const floatY = gem.y + Math.sin(this.gameTime * 4 + gem.x) * 2;
        // Diamond crystal
        g.tri(gem.x, floatY - 5, gem.x - 4, floatY, gem.x + 4, floatY, 3);
        g.tri(gem.x, floatY + 5, gem.x - 4, floatY, gem.x + 4, floatY, 2);
        g.px(gem.x, Math.round(floatY), 3);
      }
    }

    // Render Exit Goal Portal
    const ex = this.exit.x, ey = this.exit.y, ew = this.exit.w, eh = this.exit.h;
    if (this.exit.open) {
      // Swirling active exit vortex
      g.box(ex, ey, ew, eh, 3);
      g.disc(ex + ew / 2, ey + eh / 2, 6, 2);
      g.circle(ex + ew / 2, ey + eh / 2, 7 + Math.sin(this.gameTime * 8) * 1.5, 3);
      g.px(ex + ew / 2, ey + eh / 2, 3);
      g.text("GOAL", ex - 2, ey - 7, 3);
    } else {
      // Locked exit airlock
      g.box(ex, ey, ew, eh, 2);
      g.rect(ex + 2, ey + 2, ew - 4, eh - 4, 1);
      g.text("LOCK", ex - 2, ey - 7, 1);
      g.px(ex + ew / 2, ey + eh / 2, 3);
    }

    // Render Portals (Blue: Portal A, Orange: Portal B)
    this.renderPortal(g, this.portalA, 'A', 3);
    this.renderPortal(g, this.portalB, 'B', 2);

    // Render Ball motion trail
    if (!this.ball.dead) {
      for (let i = 0; i < this.ball.trail.length; i++) {
        const t = this.ball.trail[i];
        g.disc(Math.round(t.x), Math.round(t.y), 2, 1);
      }
      // Ball itself (Kinetic Sphere)
      const bx = Math.round(this.ball.x);
      const by = Math.round(this.ball.y);
      g.disc(bx, by, this.ball.radius, 3);
      g.circle(bx, by, this.ball.radius, 2);
      g.px(bx, by, 0); // Aperture core
    }

    // Render Particle sparks
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      g.px(Math.round(p.x), Math.round(p.y), p.color);
    }

    // Render Aiming Reticle & Surface Preview Ghost
    this.renderReticle(g);

    // Render Top HUD & Bottom Touch Controls
    this.renderHUD(g);

    // Overlays for Chamber Clear or Game Complete
    if (this.state === 'CLEAR') {
      this.renderClearOverlay(g);
    } else if (this.state === 'VICTORY') {
      this.renderVictoryOverlay(g);
    }
  },

  // Renders a portal aperture with oval geometry & orbiting sparks
  renderPortal(g, portal, label, color) {
    if (!portal.active) return;
    const px = Math.round(portal.x);
    const py = Math.round(portal.y);
    const pulse = Math.sin(this.gameTime * 8) * 1.5;

    // Horizontal vs Vertical portal rendering
    if (Math.abs(portal.ny) > Math.abs(portal.nx)) {
      // Horizontal (Floor or Ceiling)
      const w = 18 + pulse;
      const h = 5;
      g.disc(px, py, 4, 0);
      g.circle(px, py, 4, color);
      g.line(px - 9, py, px + 9, py, color);
      g.px(px, py, 3);
      g.text(label, px - 2, py + (portal.ny < 0 ? -9 : 7), color);
    } else {
      // Vertical (Left or Right Wall)
      const w = 5;
      const h = 18 + pulse;
      g.disc(px, py, 4, 0);
      g.circle(px, py, 4, color);
      g.line(px, py - 9, px, py + 9, color);
      g.px(px, py, 3);
      g.text(label, px + (portal.nx < 0 ? 6 : -8), py - 3, color);
    }

    // Orbiting spark
    const sparkAng = this.gameTime * 7;
    const sx = px + Math.cos(sparkAng) * 7;
    const sy = py + Math.sin(sparkAng) * 4;
    g.px(Math.round(sx), Math.round(sy), 3);
  },

  // Renders aiming reticle and target surface preview ghost
  renderReticle(g) {
    const rx = Math.round(this.reticle.x);
    const ry = Math.round(this.reticle.y);

    // Crosshair target
    g.line(rx - 4, ry, rx + 4, ry, 3);
    g.line(rx, ry - 4, rx, ry + 4, 3);
    g.circle(rx, ry, 3, 2);

    // Find nearest surface for ghost preview
    const target = this.getTargetSurface(rx, ry);
    if (target) {
      const gx = Math.round(target.x);
      const gy = Math.round(target.y);

      // Subtle targeting line from reticle to ghost
      g.line(rx, ry, gx, gy, 1);

      if (target.portalable) {
        const pColor = this.activeTouchGun === 'A' ? 3 : 2;
        // Ghost portal outline
        if (Math.abs(target.ny) > Math.abs(target.nx)) {
          g.line(gx - 8, gy, gx + 8, gy, pColor);
          g.px(gx, gy, pColor);
        } else {
          g.line(gx, gy - 8, gx, gy + 8, pColor);
          g.px(gx, gy, pColor);
        }
      } else {
        // Denied surface (red/dim X)
        g.px(gx - 2, gy - 2, 1);
        g.px(gx + 2, gy - 2, 1);
        g.px(gx, gy, 1);
        g.px(gx - 2, gy + 2, 1);
        g.px(gx + 2, gy + 2, 1);
      }
    }
  },

  // Top status HUD and bottom touch button controls
  renderHUD(g) {
    // Top bar background
    g.rect(0, 0, 256, 18, 0);
    g.line(0, 18, 256, 18, 2);

    // Chamber info & stats
    const chNum = this.chamberIdx + 1;
    g.text("CH." + chNum + "/8", 6, 6, 3);

    const remGems = this.gems.filter(gem => !gem.collected).length;
    const totGems = this.gems.length;
    g.text("GEMS:" + (totGems - remGems) + "/" + totGems, 70, 6, 3);

    g.text("SHOTS:" + this.chamberShots + " (PAR " + this.curChamber.par + ")", 146, 6, 2);

    // High score from SAVE
    const hi = typeof SAVE !== 'undefined' ? SAVE.getScore(this.id) : 0;
    if (hi > 0) {
      g.textR("HI:" + hi, 250, 6, 1);
    }

    // Bottom mobile touch bar
    g.rect(0, 226, 256, 14, 0);
    g.line(0, 226, 256, 226, 2);

    // Touch Button A [BLUE]
    const aActive = this.activeTouchGun === 'A';
    g.box(4, 228, 48, 10, aActive ? 3 : 2);
    g.text("[A] BLUE", 8, 230, aActive ? 3 : 2);

    // Touch Button B [ORANGE]
    const bActive = this.activeTouchGun === 'B';
    g.box(204, 228, 48, 10, bActive ? 3 : 2);
    g.text("[B] ORN", 208, 230, bActive ? 3 : 2);

    // Middle Reset helper
    g.textC("[SEL] RETRY", 230, 1);
  },

  // Chamber Clear Overlay Banner
  renderClearOverlay(g) {
    g.rect(28, 70, 200, 80, 0);
    g.box(28, 70, 200, 80, 3);
    g.box(30, 72, 196, 76, 2);

    g.textC("TEST CHAMBER CLEAR!", 82, 3);
    g.textC(this.curChamber.name, 94, 2);

    const parStatus = (this.chamberShots <= this.curChamber.par) ? "EXCELLENT (<= PAR)!" : "PASSED";
    g.textC("SHOTS: " + this.chamberShots + " / PAR: " + this.curChamber.par + " - " + parStatus, 110, 3);

    const blink = (Math.floor(this.gameTime * 4) % 2 === 0);
    if (blink) {
      g.textC("PRESS [A] TO ADVANCE", 132, 3);
    }
  },

  // Game Victory Screen (All 8 Chambers Conquered)
  renderVictoryOverlay(g) {
    g.rect(16, 40, 224, 150, 0);
    g.box(16, 40, 224, 150, 3);
    g.box(18, 42, 220, 146, 2);

    g.textC("*** TESTING COMPLETE ***", 52, 3);
    g.textC("APERTURE EVALUATION CERTIFICATE", 66, 2);
    g.textC("SUBJECT #024 QUALIFIED!", 82, 3);

    g.textC("ALL 8 CHAMBERS CONQUERED", 98, 2);
    g.textC("TOTAL PORTAL SHOTS: " + this.totalShots, 112, 3);
    g.textC("TOTAL CRYSTALS: " + this.score, 126, 3);

    const rank = (this.totalShots <= 32) ? "RANK: PORTAL MASTER!" : "RANK: APERTURE SCIENTIST";
    g.textC(rank, 144, 3);

    const blink = (Math.floor(this.gameTime * 4) % 2 === 0);
    if (blink) {
      g.textC("PRESS [A] TO PLAY AGAIN", 168, 3);
    }
  }
};
