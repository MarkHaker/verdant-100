// js/cartridges/cart_048_lemmings.js
// ============================================================================
// Cartridge #048: LEMMINGS
// ============================================================================
// Complete overhaul of Lemmings for the VERDANT-100 console.
// Features:
// - 128x92 destructible tile/bitmask terrain grid mapped to 256x184 playfield
// - 5 core skills: Digger, Builder, Blocker, Floater, Bomber
// - Lethal hazards: Acid pools, Spikes, Fatal fall splatters (>45px)
// - Indestructible steel plates with metal clinks
// - Trapdoor ceiling hatch dropping clan at steady cadence
// - Glowing swirl exit portal with "Yippee!" fanfare
// - 4 handcrafted puzzle stages: "JUST DIG!", "MIND THE GAP", "PRISON BREAK", "THE LABYRINTH"
// - Full mobile touch ergonomics & D-pad cursor selection
// - Fast-Forward (2.5x) and Armageddon Nuke controls
// - Substepped deterministic physics robust across all speeds (0.75x to 1.4x)
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[48] = {
  id: 48,
  name: "LEMMINGS",
  genre: 4, // STRATEGY
  scoreLabel: "SAVED",
  desc: "ASSIGN TASKS (BLOCKER, DIGGER, BUILDER) TO GUIDE MARCHING CLAN SAFELY TO EXIT!",

  // --------------------------------------------------------------------------
  // 1. RETRO 32x32 ICON: Floater lemming descending toward glowing exit arch
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);

    // Background scenery: cliff on left, ground at bottom
    g.rect(x + 2, y + 8, 8, 4, 1);
    g.line(x + 2, y + 8, x + 9, y + 8, 2);
    g.rect(x + 2, y + 25, 28, 6, 1);
    g.line(x + 2, y + 25, x + 29, y + 25, 3);

    // Exit archway on bottom right
    g.rect(x + 21, y + 15, 2, 10, 2);
    g.rect(x + 27, y + 15, 2, 10, 2);
    g.line(x + 20, y + 14, x + 28, y + 14, 3);
    g.px(x + 24, y + 19, 3);
    g.px(x + 25, y + 20, 2);

    // Descending Floater lemming with umbrella
    // Umbrella canopy:
    g.line(x + 9, y + 7, x + 18, y + 7, 3);
    g.line(x + 10, y + 6, x + 17, y + 6, 3);
    g.line(x + 12, y + 5, x + 15, y + 5, 2);
    g.px(x + 14, y + 4, 3);
    // Umbrella handle:
    g.line(x + 14, y + 8, x + 14, y + 12, 2);
    // Lemming hanging:
    g.rect(x + 12, y + 11, 4, 2, 3); // green hair
    g.px(x + 14, y + 13, 2); // face
    g.rect(x + 12, y + 14, 4, 4, 1); // blue tunic (shade 1)
    g.line(x + 13, y + 14, x + 15, y + 14, 2);
    // Marching / dangling legs:
    g.line(x + 12, y + 18, x + 11, y + 21, 2);
    g.line(x + 15, y + 18, x + 16, y + 21, 2);

    // Sparkles
    g.px(x + 5, y + 16, 3);
    g.px(x + 21, y + 9, 3);
  },

  // --------------------------------------------------------------------------
  // 2. CAMPAIGN DATA: 4 Handcrafted Stages
  // --------------------------------------------------------------------------
  levels: [
    {
      name: "JUST DIG!",
      subtitle: "DIGGER & FLOATER BASICS",
      totalLemms: 10,
      quota: 7, // 70%
        time: 120,
        spawnInterval: 1.8,
        dropX: 36,
        dropY: 26,
        exitX: 216,
        exitY: 172,
        skills: { dig: 5, bld: 2, blk: 2, flt: 5, bmb: 2 },
        build: (cart) => {
          // Steel borders
          cart.fillBox(0, 0, 4, 92, 2);
          cart.fillBox(124, 0, 4, 92, 2);
          cart.fillBox(0, 90, 128, 2, 2);

          // Upper Ledge under drop
          cart.fillBox(4, 8, 4, 20, 2); // left backstop
          cart.fillBox(4, 24, 42, 47, 1); // solid plateau (gx: 4..45, gy: 24..70)

          // Abyss gap with spikes on right (gx: 46..80)
          cart.fillBox(46, 88, 36, 2, 4); // SPIKES

          // Lower cavern floor leading to exit archway
          cart.fillBox(4, 78, 120, 4, 1);
          cart.fillBox(4, 82, 120, 8, 2); // bedrock steel
        }
      },
      {
        name: "MIND THE GAP",
        subtitle: "BRIDGING THE ACID CHASM",
        totalLemms: 15,
        quota: 11, // 73%
        time: 150,
        spawnInterval: 1.4,
        dropX: 32,
        dropY: 46,
        exitX: 216,
        exitY: 64,
        skills: { dig: 3, bld: 8, blk: 4, flt: 4, bmb: 4 },
        build: (cart) => {
          // Left cliff (gx: 5..39, gy: 34..38, screen Y: 84)
          cart.fillBox(0, 0, 5, 92, 2);
          cart.fillBox(5, 34, 35, 5, 1);
          cart.fillBox(5, 39, 14, 51, 2); // support pillar

          // Bubbling acid pool at bottom of chasm
          cart.fillBox(19, 84, 76, 6, 3);

          // Right cliff holding exit archway (gx: 75..123, gy: 24..28, screen Y: 64)
          cart.fillBox(75, 24, 49, 5, 1);
          cart.fillBox(110, 29, 14, 61, 2);
          cart.fillBox(124, 0, 4, 92, 2);
          cart.fillBox(0, 90, 128, 2, 2);
        }
      },
      {
        name: "PRISON BREAK",
        subtitle: "CONTAINMENT & TUNNELING",
        totalLemms: 16,
        quota: 12, // 75%
        time: 160,
        spawnInterval: 1.3,
        dropX: 48,
        dropY: 24,
        exitX: 226,
        exitY: 152,
        skills: { dig: 5, bld: 6, blk: 4, flt: 4, bmb: 4 },
        build: (cart) => {
          cart.fillBox(0, 0, 4, 92, 2);
          cart.fillBox(124, 0, 4, 92, 2);
          cart.fillBox(0, 90, 128, 2, 2);

          // Prison cell chamber (floor at gy: 24, screen Y: 64, drop 40px safe)
          cart.fillBox(12, 10, 4, 18, 2); // left wall
          cart.fillBox(54, 10, 4, 18, 2); // right wall
          cart.fillBox(12, 10, 46, 3, 2); // ceiling

          // Cell floor: steel sides, dirt center
          cart.fillBox(12, 24, 14, 4, 2); // left steel floor
          cart.fillBox(26, 24, 14, 4, 1); // central DIRT patch (dig here!)
          cart.fillBox(40, 24, 18, 4, 2); // right steel floor

          // Vertical soil chimney under dirt patch
          cart.fillBox(26, 28, 14, 46, 1);

          // Lower cavern floor
          cart.fillBox(8, 74, 116, 4, 1);
          cart.fillBox(8, 78, 116, 12, 2);

          // Obstacles in lower cavern:
          // Soil bunker at gx: 64..77
          cart.fillBox(64, 62, 14, 12, 1);

          // Spike pit at gx: 84..95
          cart.fillBox(84, 74, 12, 4, 4);

          // Elevated exit platform
          cart.fillBox(102, 68, 22, 6, 2);
        }
      },
      {
        name: "THE LABYRINTH",
        subtitle: "THE GRANDMASTER GAUNTLET",
        totalLemms: 20,
        quota: 16, // 80%
        time: 180,
        spawnInterval: 1.1,
        dropX: 24,
        dropY: 20,
        exitX: 226,
        exitY: 172,
        skills: { dig: 6, bld: 8, blk: 4, flt: 6, bmb: 5 },
        build: (cart) => {
          cart.fillBox(0, 0, 4, 92, 2);
          cart.fillBox(124, 0, 4, 92, 2);
          cart.fillBox(0, 90, 128, 2, 2);

          // Tier 1: High steel drop platform (landing at Y: 56, safe 36px drop)
          cart.fillBox(4, 20, 20, 4, 2);

          // Tier 2: Middle terrace with steel divider wall
          cart.fillBox(16, 48, 50, 4, 1);
          cart.fillBox(66, 28, 4, 24, 2); // vertical steel wall divider

          // Soil layer under Tier 2 for digging down
          cart.fillBox(50, 52, 16, 26, 1);

          // Tier 3: Bottom corridor
          cart.fillBox(8, 78, 116, 4, 1);
          cart.fillBox(8, 82, 116, 8, 2);

          // Acid hazard in bottom corridor
          cart.fillBox(72, 78, 18, 4, 3); // acid pit

          // Final dirt barrier before exit
          cart.fillBox(94, 66, 10, 12, 1);
        }
      }
  ],

  // --------------------------------------------------------------------------
  // 3. INITIALIZATION & STAGE LOADING
  // --------------------------------------------------------------------------
  init() {
    this.GRID_W = 128;
    this.GRID_H = 92;
    if (!this.grid) this.grid = new Uint8Array(this.GRID_W * this.GRID_H);

    this.currentLevelIdx = 0;
    this.totalSavedAcrossLevels = 0;
    this.simAccum = 0;
    this.gameTime = 0;
    this.activeSkill = 0; // 0: DIG, 1: BLD, 2: BLK, 3: FLT, 4: BMB
    this.fastForward = false;
    this.nuked = false;

    this.cursorX = 40;
    this.cursorY = 50;
    this.targetLemming = null;

    this.particles = [];
    this.popups = [];
    this.lemmings = [];
    this.nextLemmId = 1;

    this.loadLevel(this.currentLevelIdx);
  },

  loadLevel(idx) {
    this.GRID_W = 128;
    this.GRID_H = 92;
    if (!this.grid) this.grid = new Uint8Array(this.GRID_W * this.GRID_H);

    this.currentLevelIdx = Math.max(0, Math.min(idx, this.levels.length - 1));
    this.curLevel = this.levels[this.currentLevelIdx];

    this.grid.fill(0);
    this.curLevel.build(this);

    this.lemmings = [];
    this.spawnCount = 0;
    this.spawnTimer = 0.6; // first drop after trapdoor swings open
    this.hatchOpen = false;
    this.hatchTimer = 0;
    this.simAccum = 0;
    this.gameTime = 0;
    this.activeSkill = 0;
    this.targetLemming = null;

    this.savedCount = 0;
    this.deadCount = 0;
    this.levelTime = this.curLevel.time;
    this.skills = Object.assign({}, this.curLevel.skills);

    this.particles = [];
    this.popups = [];
    this.nuked = false;
    this.fastForward = false;

    this.cursorX = this.curLevel.dropX;
    this.cursorY = this.curLevel.dropY + 22;

    this.state = 'INTRO';
    this.stateTimer = 0;
    APU.sfx('POWER'); // "Let's Go!" fanfare
  },

  // --------------------------------------------------------------------------
  // 3. TERRAIN GRID HELPERS
  // --------------------------------------------------------------------------
  fillBox(gx, gy, gw, gh, type) {
    gx = Math.max(0, gx | 0);
    gy = Math.max(0, gy | 0);
    const ex = Math.min(this.GRID_W, gx + (gw | 0));
    const ey = Math.min(this.GRID_H, gy + (gh | 0));
    for (let y = gy; y < ey; y++) {
      const row = y * this.GRID_W;
      for (let x = gx; x < ex; x++) {
        this.grid[row + x] = type;
      }
    }
  },

  getGrid(gx, gy) {
    if (gx < 0 || gx >= this.GRID_W) return 2; // STEEL boundaries
    if (gy < 0) return 0; // Ceiling is empty
    if (gy >= this.GRID_H) return 3; // Bottom abyss is lethal
    return this.grid[gy * this.GRID_W + gx];
  },

  setGrid(gx, gy, type) {
    if (gx >= 0 && gx < this.GRID_W && gy >= 0 && gy < this.GRID_H) {
      this.grid[gy * this.GRID_W + gx] = type;
    }
  },

  isSolid(px, py) {
    const gx = Math.floor(px / 2);
    const gy = Math.floor((py - 16) / 2);
    const c = this.getGrid(gx, gy);
    return c === 1 || c === 2 || c === 5; // DIRT, STEEL, STEP
  },

  isHazard(px, py) {
    const gx = Math.floor(px / 2);
    const gy = Math.floor((py - 16) / 2);
    const c = this.getGrid(gx, gy);
    return c === 3 || c === 4; // ACID, SPIKE
  },

  // --------------------------------------------------------------------------
  // 4. PARTICLES & POPUP MESSAGES
  // --------------------------------------------------------------------------
  spawnParticle(x, y, vx, vy, color, life = 0.5, grav = 70) {
    if (this.particles.length > 50) this.particles.shift();
    this.particles.push({ x, y, vx, vy, color, life, grav });
  },

  spawnPopup(text, x, y, color = 3) {
    if (this.popups.length > 8) this.popups.shift();
    this.popups.push({ text, x, y, vy: -18, color, life: 1.0 });
  },

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.grav * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.y += pop.vy * dt;
      pop.life -= dt;
      if (pop.life <= 0) this.popups.splice(i, 1);
    }
  },

  // --------------------------------------------------------------------------
  // 5. SKILL ASSIGNMENT & ARMAGEDDON NUKE
  // --------------------------------------------------------------------------
  assignSkill(lemming, skillIdx) {
    if (!lemming || lemming.state === 'DEAD' || lemming.state === 'EXITING') return false;

    const skillKeys = ['dig', 'bld', 'blk', 'flt', 'bmb'];
    const key = skillKeys[skillIdx];
    if (!this.skills[key] || this.skills[key] <= 0) {
      APU.sfx('DENY');
      this.spawnPopup("NONE!", lemming.x, lemming.y - 12, 2);
      return false;
    }

    if (skillIdx === 0) { // DIGGER
      if (lemming.state === 'DIGGING' || lemming.state === 'FALLING' || lemming.state === 'FLOATING') {
        APU.sfx('DENY');
        return false;
      }
      lemming.state = 'DIGGING';
      lemming.actionTimer = 0;
    } else if (skillIdx === 1) { // BUILDER
      if (lemming.state === 'BUILDING' || lemming.state === 'FALLING' || lemming.state === 'FLOATING') {
        APU.sfx('DENY');
        return false;
      }
      lemming.state = 'BUILDING';
      lemming.buildSteps = 0;
      lemming.actionTimer = 0;
    } else if (skillIdx === 2) { // BLOCKER
      if (lemming.state === 'BLOCKING' || lemming.state === 'FALLING' || lemming.state === 'FLOATING') {
        APU.sfx('DENY');
        return false;
      }
      lemming.state = 'BLOCKING';
      lemming.vx = 0;
    } else if (skillIdx === 3) { // FLOATER
      if (lemming.isFloater) {
        APU.sfx('DENY');
        return false;
      }
      lemming.isFloater = true;
      if (lemming.state === 'FALLING') {
        lemming.state = 'FLOATING';
      }
    } else if (skillIdx === 4) { // BOMBER
      if (lemming.isBomber) {
        APU.sfx('DENY');
        return false;
      }
      lemming.isBomber = true;
      lemming.bombTimer = 5.0;
    }

    this.skills[key]--;
    APU.sfx('COIN');
    this.spawnPopup(key.toUpperCase() + "!", lemming.x, lemming.y - 14, 3);
    for (let i = 0; i < 6; i++) {
      this.spawnParticle(lemming.x, lemming.y - 6, (Math.random() - 0.5) * 30, -Math.random() * 25, 3, 0.4, 50);
    }
    return true;
  },

  triggerNuke() {
    if (this.nuked) return;
    this.nuked = true;
    APU.sfx('ALARM');
    this.spawnPopup("ARMAGEDDON!", 128, 60, 3);
    let delay = 0.5;
    for (const l of this.lemmings) {
      if (l.state !== 'DEAD' && l.state !== 'EXITING' && !l.isBomber) {
        l.isBomber = true;
        l.bombTimer = delay;
        delay += 0.25;
      }
    }
  },

  explodeLemming(l) {
    l.state = 'DEAD';
    this.deadCount++;
    APU.sfx('BOOM');

    const cx = Math.floor(l.x / 2);
    const cy = Math.floor((l.y - 6 - 16) / 2);
    const r = 6; // blast crater radius in grid cells (~12 px)
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          const cell = this.getGrid(cx + dx, cy + dy);
          if (cell === 1 || cell === 5) {
            this.setGrid(cx + dx, cy + dy, 0); // carve crater
          }
        }
      }
    }

    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 25 + Math.random() * 60;
      this.spawnParticle(l.x, l.y - 6, Math.cos(angle) * speed, Math.sin(angle) * speed, (i % 2 === 0 ? 3 : 2), 0.55, 60);
    }
    this.spawnPopup("BOOM!", l.x, l.y - 16, 3);
  },

  // --------------------------------------------------------------------------
  // 6. SIMULATION SUBSTEPPING & PHYSICS
  // --------------------------------------------------------------------------
  tickSimulation(dt) {
    this.gameTime += dt;

    // Hatch opening animation
    if (!this.hatchOpen) {
      this.hatchTimer += dt;
      if (this.hatchTimer >= 0.4) {
        this.hatchOpen = true;
        APU.sfx('INSERT');
      }
    }

    // Spawn lemmings from trapdoor
    if (this.hatchOpen && this.spawnCount < this.curLevel.totalLemms) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = this.curLevel.spawnInterval;
        this.spawnCount++;
        this.lemmings.push({
          id: this.nextLemmId++,
          x: this.curLevel.dropX,
          y: this.curLevel.dropY,
          vx: 0,
          vy: 20,
          dir: 1,
          state: 'FALLING',
          isFloater: false,
          isBomber: false,
          bombTimer: 0,
          fallStartY: this.curLevel.dropY,
          animTimer: 0,
          actionTimer: 0,
          buildSteps: 0,
          exitTimer: 0
        });
      }
    }

    // Update each lemming
    for (const l of this.lemmings) {
      if (l.state === 'DEAD') continue;

      // Exit state resolution
      if (l.state === 'EXITING') {
        l.exitTimer += dt;
        l.animTimer += dt;
        if (Math.random() < 0.35) {
          this.spawnParticle(l.x + (Math.random() - 0.5) * 8, l.y - 8 + (Math.random() - 0.5) * 8, 0, -25, 3, 0.4, 0);
        }
        if (l.exitTimer >= 0.4) {
          l.state = 'DEAD';
          this.savedCount++;
          this.spawnPopup("+1 SAVED!", l.x, l.y - 14, 3);
          APU.sfx('LEVELUP');
          SAVE.setScore(this.id, this.totalSavedAcrossLevels + this.savedCount);
        }
        continue;
      }

      // Bomber countdown
      if (l.isBomber) {
        const oldSec = Math.ceil(l.bombTimer);
        l.bombTimer -= dt;
        const newSec = Math.ceil(l.bombTimer);
        if (newSec !== oldSec && newSec > 0 && newSec <= 5) {
          APU.sfx('TICK');
        }
        if (l.bombTimer <= 0) {
          this.explodeLemming(l);
          continue;
        }
      }

      // Hazard check (acid, spikes)
      if (this.isHazard(l.x, l.y) || this.isHazard(l.x, l.y - 4)) {
        l.state = 'DEAD';
        this.deadCount++;
        APU.sfx('SPLASH');
        for (let i = 0; i < 10; i++) {
          this.spawnParticle(l.x, l.y - 4, (Math.random() - 0.5) * 40, -Math.random() * 35, 2, 0.5, 80);
        }
        continue;
      }

      // Exit portal entry check (within 9px box)
      const dxToExit = Math.abs(l.x - this.curLevel.exitX);
      const dyToExit = Math.abs(l.y - this.curLevel.exitY);
      if (dxToExit <= 9 && dyToExit <= 10 && l.state !== 'FALLING') {
        l.state = 'EXITING';
        l.exitTimer = 0;
        continue;
      }

      // State-specific behavior
      if (l.state === 'FALLING') {
        l.animTimer += dt;
        if (l.isFloater && (l.y - l.fallStartY) > 16) {
          l.state = 'FLOATING';
        }
        l.vy += 160 * dt;
        if (l.vy > 140) l.vy = 140;
        const ny = l.y + l.vy * dt;

        if (this.isSolid(l.x, ny)) {
          const fallDist = ny - l.fallStartY;
          if (!l.isFloater && fallDist > 45) {
            // Splat! Fatal fall
            l.state = 'DEAD';
            this.deadCount++;
            APU.sfx('HURT');
            this.spawnPopup("SPLAT!", l.x, ny - 6, 2);
            for (let i = 0; i < 12; i++) {
              this.spawnParticle(l.x, ny, (Math.random() - 0.5) * 50, -Math.random() * 35, 3, 0.6, 100);
            }
            continue;
          } else {
            // Soft landing
            let testY = Math.floor(l.y);
            while (!this.isSolid(l.x, testY) && testY <= ny + 4) {
              testY++;
            }
            l.y = testY - 1;
            l.vy = 0;
            l.fallStartY = l.y;
            l.state = 'WALKING';
          }
        } else {
          l.y = ny;
          if (l.y > 200) {
            l.state = 'DEAD';
            this.deadCount++;
            APU.sfx('HURT');
            continue;
          }
        }
      } else if (l.state === 'FLOATING') {
        l.animTimer += dt;
        l.vy = 28; // gentle parachute glide
        const ny = l.y + l.vy * dt;

        if (this.isSolid(l.x, ny)) {
          let testY = Math.floor(l.y);
          while (!this.isSolid(l.x, testY) && testY <= ny + 4) {
            testY++;
          }
          l.y = testY - 1;
          l.vy = 0;
          l.fallStartY = l.y;
          l.state = 'WALKING';
        } else {
          l.y = ny;
          if (l.y > 200) {
            l.state = 'DEAD';
            this.deadCount++;
            continue;
          }
        }
      } else if (l.state === 'BLOCKING') {
        l.animTimer += dt;
        // Stationary blocker turns other lemmings in walking section
      } else if (l.state === 'DIGGING') {
        l.animTimer += dt;
        l.actionTimer += dt;
        if (l.actionTimer >= 0.26) {
          l.actionTimer = 0;
          const gx = Math.floor(l.x / 2);
          const gy = Math.floor((l.y - 16) / 2);

          let hitSteel = false;
          let hasGround = false;
          for (let dx = -2; dx <= 2; dx++) {
            const cell = this.getGrid(gx + dx, gy + 1);
            if (cell === 2) hitSteel = true;
            if (cell === 1 || cell === 5) hasGround = true;
          }

          if (hitSteel) {
            APU.sfx('HIT');
            this.spawnPopup("CLINK!", l.x, l.y - 10, 3);
            for (let i = 0; i < 6; i++) {
              this.spawnParticle(l.x, l.y, (Math.random() - 0.5) * 40, -Math.random() * 30, 3, 0.35, 100);
            }
            l.state = 'WALKING';
          } else if (!hasGround) {
            l.state = 'FALLING';
            l.fallStartY = l.y;
            l.vy = 20;
          } else {
            for (let dx = -2; dx <= 2; dx++) {
              const cell = this.getGrid(gx + dx, gy + 1);
              if (cell === 1 || cell === 5) {
                this.setGrid(gx + dx, gy + 1, 0);
              }
            }
            l.y += 2;
            l.fallStartY = l.y;
            APU.sfx('HIT');
            for (let i = 0; i < 4; i++) {
              this.spawnParticle(l.x + (Math.random() - 0.5) * 6, l.y, (Math.random() - 0.5) * 20, -Math.random() * 20, 1, 0.4, 90);
            }
          }
        }
      } else if (l.state === 'BUILDING') {
        l.animTimer += dt;
        l.actionTimer += dt;
        if (l.actionTimer >= 0.40) {
          l.actionTimer = 0;
          if (l.buildSteps >= 12) {
            l.state = 'WALKING';
          } else {
            const stepTargetX = l.x + l.dir * 4;
            const stepTargetY = l.y;

            if (this.isSolid(stepTargetX, stepTargetY - 4)) {
              l.dir = -l.dir;
              l.state = 'WALKING';
            } else {
              const gx = Math.floor(stepTargetX / 2);
              const gy = Math.floor((stepTargetY - 16) / 2);
              for (let k = -1; k <= 1; k++) {
                if (this.getGrid(gx + k, gy) === 0) {
                  this.setGrid(gx + k, gy, 5); // STEP
                }
              }
              APU.sfx('TICK');
              l.buildSteps++;
              l.x = stepTargetX;
              l.y = stepTargetY - 1; // 1px rise per step for smooth traversable bridge
              l.fallStartY = l.y;
              this.spawnParticle(l.x, l.y, l.dir * 8, -8, 3, 0.25, 40);
            }
          }
        }
      } else if (l.state === 'WALKING') {
        l.animTimer += dt;

        // Check if ground fell away
        if (!this.isSolid(l.x, l.y + 1)) {
          l.state = 'FALLING';
          l.fallStartY = l.y;
          l.vy = 20;
          continue;
        }

        // Blocker repulsion
        for (const other of this.lemmings) {
          if (other.id !== l.id && other.state === 'BLOCKING') {
            const dx = l.x - other.x;
            const dy = Math.abs(l.y - other.y);
            if (dy < 10 && Math.abs(dx) < 8) {
              if (l.dir === 1 && dx < 0) {
                l.dir = -1;
                l.x = other.x - 8;
              } else if (l.dir === -1 && dx > 0) {
                l.dir = 1;
                l.x = other.x + 8;
              }
            }
          }
        }

        // Horizontal movement & slope detection
        const walkSpeed = 22;
        const nx = l.x + l.dir * walkSpeed * dt;

        if (!this.isSolid(nx, l.y)) {
          // Check small declines to stick to slopes
          if (!this.isSolid(nx, l.y + 1)) {
            if (this.isSolid(nx, l.y + 2)) l.y += 1;
            else if (this.isSolid(nx, l.y + 3)) l.y += 2;
            else if (this.isSolid(nx, l.y + 4)) l.y += 3;
          }
          l.x = nx;
          l.fallStartY = l.y;
        } else {
          // Check small step-up incline (1..3 px)
          let stepUp = 0;
          for (let s = 1; s <= 3; s++) {
            if (!this.isSolid(nx, l.y - s)) {
              stepUp = s;
              break;
            }
          }
          if (stepUp > 0 && !this.isSolid(nx, l.y - stepUp - 7)) {
            l.y -= stepUp;
            l.x = nx;
            l.fallStartY = l.y;
          } else {
            // Impassable wall, reverse direction
            l.dir = -l.dir;
          }
        }
      }
    }
  },

  // --------------------------------------------------------------------------
  // 7. MAIN UPDATE LIFECYCLE
  // --------------------------------------------------------------------------
  update(dt) {
    // Clamp delta time to avoid huge frame spikes
    dt = Math.min(dt, 0.1);

    // INTRO & SUMMARY SCREENS
    if (this.state === 'INTRO') {
      this.stateTimer += dt;
      if (PAD.hit('a') || PAD.hit('start') || PAD.tapPos) {
        this.state = 'PLAYING';
        APU.sfx('UI_OK');
      }
      return;
    }

    if (this.state === 'STAGE_CLEAR') {
      if (PAD.hit('a') || PAD.hit('start') || PAD.tapPos) {
        this.totalSavedAcrossLevels += this.savedCount;
        this.currentLevelIdx++;
        if (this.currentLevelIdx >= this.levels.length) {
          this.state = 'CAMPAIGN_CLEAR';
        } else {
          this.loadLevel(this.currentLevelIdx);
        }
        APU.sfx('UI_OK');
      }
      return;
    }

    if (this.state === 'STAGE_FAIL') {
      if (PAD.hit('a') || PAD.hit('start') || PAD.tapPos) {
        this.loadLevel(this.currentLevelIdx);
        APU.sfx('UI_OK');
      }
      return;
    }

    if (this.state === 'CAMPAIGN_CLEAR') {
      if (PAD.hit('a') || PAD.hit('start') || PAD.tapPos) {
        this.currentLevelIdx = 0;
        this.totalSavedAcrossLevels = 0;
        this.loadLevel(0);
        APU.sfx('UI_OK');
      }
      return;
    }

    // PLAYING CONTROLS & INPUTS
    // D-pad cursor movement
    const cursorSpeed = 110;
    if (PAD.held('left')) this.cursorX -= cursorSpeed * dt;
    if (PAD.held('right')) this.cursorX += cursorSpeed * dt;
    if (PAD.held('up')) this.cursorY -= cursorSpeed * dt;
    if (PAD.held('down')) this.cursorY += cursorSpeed * dt;
    this.cursorX = Math.max(8, Math.min(248, this.cursorX));
    this.cursorY = Math.max(20, Math.min(195, this.cursorY));

    // [B] cycles through skills
    if (PAD.hit('b')) {
      this.activeSkill = (this.activeSkill + 1) % 5;
      APU.sfx('UI_MOVE');
    }

    // [SELECT] toggles Fast-Forward
    if (PAD.hit('select')) {
      this.fastForward = !this.fastForward;
      APU.sfx('UI_MOVE');
    }

    // Find nearest lemming to cursor
    let nearestLemm = null;
    let minDist = 24;
    for (const l of this.lemmings) {
      if (l.state !== 'DEAD' && l.state !== 'EXITING') {
        const d = Math.hypot(l.x - this.cursorX, (l.y - 5) - this.cursorY);
        if (d < minDist) {
          minDist = d;
          nearestLemm = l;
        }
      }
    }
    this.targetLemming = nearestLemm;

    // [A] assigns active skill to highlighted lemming
    if (PAD.hit('a') && this.targetLemming) {
      this.assignSkill(this.targetLemming, this.activeSkill);
    }

    // Touch / Tap Handling
    if (PAD.tapPos) {
      const tx = PAD.tapPos.x;
      const ty = PAD.tapPos.y;

      if (ty >= 200) {
        // Bottom toolbar card selection
        if (tx >= 3 && tx < 38) { this.activeSkill = 0; APU.sfx('UI_MOVE'); }
        else if (tx >= 41 && tx < 76) { this.activeSkill = 1; APU.sfx('UI_MOVE'); }
        else if (tx >= 79 && tx < 114) { this.activeSkill = 2; APU.sfx('UI_MOVE'); }
        else if (tx >= 117 && tx < 152) { this.activeSkill = 3; APU.sfx('UI_MOVE'); }
        else if (tx >= 155 && tx < 190) { this.activeSkill = 4; APU.sfx('UI_MOVE'); }
        else if (tx >= 193 && tx < 221) { this.fastForward = !this.fastForward; APU.sfx('UI_MOVE'); }
        else if (tx >= 224 && tx < 253) { this.triggerNuke(); }
      } else {
        // Playfield direct lemming tap
        let touchTarget = null;
        let minTouchD = 20;
        for (const l of this.lemmings) {
          if (l.state !== 'DEAD' && l.state !== 'EXITING') {
            const d = Math.hypot(l.x - tx, (l.y - 5) - ty);
            if (d < minTouchD) {
              minTouchD = d;
              touchTarget = l;
            }
          }
        }

        if (touchTarget) {
          this.cursorX = touchTarget.x;
          this.cursorY = touchTarget.y - 5;
          this.assignSkill(touchTarget, this.activeSkill);
        } else {
          this.cursorX = tx;
          this.cursorY = ty;
        }
      }
    }

    // Level timer countdown
    this.levelTime -= dt;
    if (this.levelTime <= 0 && !this.nuked) {
      this.levelTime = 0;
      this.triggerNuke();
    }

    // Run fixed 60Hz physics substepping
    const mult = this.fastForward ? 2.5 : 1.0;
    this.simAccum += dt * mult;
    const STEP = 1 / 60;
    let subSteps = 0;
    while (this.simAccum >= STEP && subSteps < 8) {
      this.tickSimulation(STEP);
      this.simAccum -= STEP;
      subSteps++;
    }

    this.updateParticles(dt * mult);

    // Check level win/loss condition
    const allSpawned = this.spawnCount >= this.curLevel.totalLemms;
    const livingCount = this.lemmings.filter(l => l.state !== 'DEAD').length;
    if (allSpawned && livingCount === 0) {
      if (this.savedCount >= this.curLevel.quota) {
        this.state = 'STAGE_CLEAR';
        APU.sfx('LEVELUP');
        SAVE.setScore(this.id, this.totalSavedAcrossLevels + this.savedCount);
      } else {
        this.state = 'STAGE_FAIL';
        APU.sfx('HURT');
      }
    }
  },

  // --------------------------------------------------------------------------
  // 8. RENDERING: PIXEL SPRITES, TERRAIN, STATUS & TOOLBAR
  // --------------------------------------------------------------------------
  drawLemming(g, l) {
    if (l.state === 'DEAD') return;

    const x = Math.round(l.x);
    const y = Math.round(l.y);

    if (l.state === 'EXITING') {
      const scale = Math.max(0, 1.0 - l.exitTimer / 0.4);
      g.disc(x, y - 4, Math.max(1, Math.round(3 * scale)), 3);
      return;
    }

    if (l.state === 'BLOCKING') {
      // Outstretched arms
      g.line(x - 5, y - 6, x + 5, y - 6, 3);
      g.px(x - 5, y - 7, 3);
      g.px(x + 5, y - 7, 3);
      // Body & hair
      g.rect(x - 2, y - 8, 4, 5, 2);
      g.line(x - 2, y - 10, x + 2, y - 10, 3);
      g.px(x, y - 11, 3);
      // Feet
      g.px(x - 3, y - 1, 2); g.px(x - 3, y, 2);
      g.px(x + 3, y - 1, 2); g.px(x + 3, y, 2);
    } else if (l.state === 'FLOATING') {
      // Umbrella dome canopy
      g.line(x - 6, y - 16, x + 6, y - 16, 3);
      g.line(x - 5, y - 17, x + 5, y - 17, 3);
      g.line(x - 3, y - 18, x + 3, y - 18, 2);
      g.px(x, y - 19, 3);
      g.line(x, y - 16, x, y - 10, 2);
      // Dangling body
      const sway = Math.sin(l.animTimer * 8) * 1.5;
      const bx = x + Math.round(sway);
      g.rect(bx - 2, y - 9, 4, 5, 1);
      g.line(bx - 2, y - 11, bx + 2, y - 11, 3);
      g.line(bx - 2, y - 4, bx - 1, y - 1, 2);
      g.line(bx + 2, y - 4, bx + 1, y - 1, 2);
    } else if (l.state === 'DIGGING') {
      g.rect(x - 2, y - 7, 4, 4, 2);
      g.line(x - 2, y - 9, x + 2, y - 9, 3);
      const digPhase = Math.floor(l.animTimer * 10) % 3;
      if (digPhase === 0) {
        g.line(x + l.dir * 3, y - 8, x + l.dir * 4, y - 11, 3);
      } else {
        g.line(x, y - 3, x + l.dir * 3, y, 3);
        g.px(x - 3, y - 2, 3); g.px(x + 3, y - 2, 3);
      }
    } else if (l.state === 'BUILDING') {
      g.rect(x - 2, y - 7, 4, 4, 2);
      g.line(x - 2, y - 9, x + 2, y - 9, 3);
      g.rect(x + l.dir * 2, y - 1, 4, 2, 3); // step brick
      if (l.buildSteps >= 9 && Math.floor(Date.now() / 150) % 2 === 0) {
        g.text("!", x - 2, y - 16, 3);
      }
    } else if (l.state === 'FALLING') {
      g.rect(x - 2, y - 7, 4, 4, 1);
      g.line(x - 2, y - 9, x + 2, y - 9, 3);
      const flail = Math.floor(l.animTimer * 12) % 2;
      if (flail === 0) {
        g.line(x - 4, y - 8, x - 2, y - 6, 2);
        g.line(x + 2, y - 6, x + 4, y - 8, 2);
      } else {
        g.line(x - 4, y - 5, x - 2, y - 6, 2);
        g.line(x + 2, y - 6, x + 4, y - 5, 2);
      }
      g.line(x - 1, y - 3, x - 2, y, 2);
      g.line(x + 1, y - 3, x + 2, y, 2);
    } else { // WALKING
      const step = Math.floor(l.animTimer * 8) % 4;
      g.rect(x - 2, y - 7, 4, 4, 1); // tunic
      g.line(x - 2, y - 9, x + 2, y - 9, 3); // green hair
      g.px(x - l.dir, y - 10, 3);
      g.px(x + l.dir, y - 8, 2); // face
      if (step === 0 || step === 2) {
        g.line(x - 1, y - 3, x - 1, y, 2);
        g.line(x + 1, y - 3, x + 1, y, 2);
      } else if (step === 1) {
        g.line(x - 2, y - 3, x - 2, y, 2);
        g.line(x + 2, y - 3, x + 1, y - 1, 2);
      } else {
        g.line(x - 2, y - 3, x - 1, y - 1, 2);
        g.line(x + 2, y - 3, x + 2, y, 2);
      }
    }

    // Floater icon overhead if not floating
    if (l.isFloater && l.state !== 'FLOATING') {
      g.px(x, y - 12, 3);
      g.px(x - 1, y - 13, 3);
      g.px(x + 1, y - 13, 3);
    }

    // Bomber countdown display
    if (l.isBomber) {
      const sec = Math.ceil(l.bombTimer);
      if (sec > 0) {
        if ((l.bombTimer % 1.0) < 0.8) {
          g.text(String(sec), x - 2, y - 18, 3);
        }
      } else {
        g.text("OH NO!", x - 12, y - 20, 3);
      }
    }

    // Selection target bracket
    if (this.targetLemming && this.targetLemming.id === l.id) {
      g.box(x - 6, y - 14, 12, 16, 3);
      g.px(x, y - 16, 3);
    }
  },

  render(g) {
    g.clear(0);

    // ------------------------------------------------------------------------
    // TOP STATUS HUD BAR (Y: 0..15)
    // ------------------------------------------------------------------------
    g.rect(0, 0, 256, 16, 0);
    g.line(0, 15, 256, 15, 2);

    const lvlName = "L" + (this.currentLevelIdx + 1) + ": " + this.curLevel.name;
    g.text(lvlName, 4, 2, 3);
    g.text("OUT: " + (this.curLevel.totalLemms - this.spawnCount), 84, 2, 2);
    g.text("IN: " + this.savedCount + "/" + this.curLevel.quota, 142, 2, 3);

    const timeCol = (this.levelTime < 20 && Math.floor(Date.now() / 250) % 2 === 0) ? 3 : 2;
    g.text(Math.ceil(this.levelTime) + "S", 224, 2, timeCol);

    const reqPct = Math.round((this.curLevel.quota / this.curLevel.totalLemms) * 100);
    g.text("REQ: " + reqPct + "%", 84, 9, 1);
    g.text(this.fastForward ? "[FF 2X]" : " 1X ", 220, 9, this.fastForward ? 3 : 1);

    // ------------------------------------------------------------------------
    // TERRAIN BITMASK RENDERING (Y: 16..199)
    // ------------------------------------------------------------------------
    for (let gy = 0; gy < this.GRID_H; gy++) {
      const rowStart = gy * this.GRID_W;
      const sy = 16 + gy * 2;
      let gx = 0;
      while (gx < this.GRID_W) {
        const type = this.grid[rowStart + gx];
        if (type === 0) {
          gx++;
          continue;
        }
        let len = 1;
        while (gx + len < this.GRID_W && this.grid[rowStart + gx + len] === type) {
          len++;
        }
        const sx = gx * 2;
        const sw = len * 2;

        if (type === 1) { // DIRT / SOIL
          g.rect(sx, sy, sw, 2, 1);
          // Grass trim on surface dirt
          if (gy > 0 && this.grid[(gy - 1) * this.GRID_W + gx] === 0) {
            g.line(sx, sy, sx + sw - 1, sy, 3);
          }
        } else if (type === 2) { // STEEL
          g.rect(sx, sy, sw, 2, 2);
          g.line(sx, sy, sx + sw - 1, sy, 3); // metallic highlight
        } else if (type === 3) { // ACID
          g.rect(sx, sy, sw, 2, 2);
          // Animated bubbling foam
          const wave = Math.sin(this.gameTime * 8 + sx * 0.2);
          if (wave > 0.2) g.px(sx + 1, sy, 3);
        } else if (type === 4) { // SPIKE
          g.rect(sx, sy, sw, 2, 1);
          for (let i = 0; i < sw; i += 4) {
            g.px(sx + i, sy, 3);
          }
        } else if (type === 5) { // STEP
          g.rect(sx, sy, sw, 2, 3);
        }
        gx += len;
      }
    }

    // ------------------------------------------------------------------------
    // TRAPDOOR & EXIT PORTAL
    // ------------------------------------------------------------------------
    const dropX = this.curLevel.dropX;
    const dropY = this.curLevel.dropY;

    // Trapdoor frame
    g.box(dropX - 10, dropY - 8, 20, 8, 2);
    if (!this.hatchOpen) {
      g.rect(dropX - 9, dropY - 7, 18, 6, 1);
      g.text("TRAP", dropX - 8, dropY - 6, 2);
    } else {
      g.line(dropX - 9, dropY, dropX - 13, dropY + 5, 3);
      g.line(dropX + 9, dropY, dropX + 13, dropY + 5, 3);
    }

    // Exit Archway
    const exitX = this.curLevel.exitX;
    const exitY = this.curLevel.exitY;
    g.rect(exitX - 10, exitY - 18, 3, 18, 2);
    g.rect(exitX + 7, exitY - 18, 3, 18, 2);
    g.rect(exitX - 11, exitY - 21, 22, 4, 3);
    g.text("EXIT", exitX - 8, exitY - 27, 3);

    // Glowing swirl vortex inside exit
    const sw = this.gameTime * 5;
    g.line(exitX + Math.cos(sw) * 5, exitY - 9 + Math.sin(sw) * 6, exitX - Math.cos(sw) * 5, exitY - 9 - Math.sin(sw) * 6, 3);
    g.line(exitX + Math.sin(sw) * 4, exitY - 9 - Math.cos(sw) * 5, exitX - Math.sin(sw) * 4, exitY - 9 + Math.cos(sw) * 5, 2);

    // ------------------------------------------------------------------------
    // LEMMINGS & PARTICLES
    // ------------------------------------------------------------------------
    for (const l of this.lemmings) {
      this.drawLemming(g, l);
    }

    for (const p of this.particles) {
      g.px(Math.round(p.x), Math.round(p.y), p.color);
    }

    for (const pop of this.popups) {
      g.text(pop.text, Math.round(pop.x) - 6, Math.round(pop.y), pop.color);
    }

    // Crosshair cursor
    g.line(this.cursorX - 4, this.cursorY, this.cursorX + 4, this.cursorY, 3);
    g.line(this.cursorX, this.cursorY - 4, this.cursorX, this.cursorY + 4, 3);

    // ------------------------------------------------------------------------
    // BOTTOM TOOLBAR & SKILL PANEL (Y: 200..240)
    // ------------------------------------------------------------------------
    g.rect(0, 200, 256, 40, 0);
    g.line(0, 200, 256, 200, 2);

    const skills = [
      { name: "DIG", count: this.skills.dig },
      { name: "BLD", count: this.skills.bld },
      { name: "BLK", count: this.skills.blk },
      { name: "FLT", count: this.skills.flt },
      { name: "BMB", count: this.skills.bmb }
    ];

    for (let i = 0; i < 5; i++) {
      const bx = 3 + i * 38;
      const by = 202;
      const bw = 35;
      const bh = 36;
      const isSel = (this.activeSkill === i);

      g.rect(bx, by, bw, bh, isSel ? 2 : 0);
      g.box(bx, by, bw, bh, isSel ? 3 : 1);

      g.text(skills[i].name, bx + 5, by + 4, isSel ? 0 : 3);

      // Mini skill icon
      if (i === 0) { // Shovel
        g.line(bx + 16, by + 13, bx + 20, by + 21, isSel ? 0 : 3);
        g.rect(bx + 18, by + 19, 4, 3, isSel ? 0 : 3);
      } else if (i === 1) { // Stairs
        g.line(bx + 12, by + 21, bx + 16, by + 21, isSel ? 0 : 3);
        g.line(bx + 16, by + 17, bx + 20, by + 17, isSel ? 0 : 3);
        g.line(bx + 20, by + 13, bx + 24, by + 13, isSel ? 0 : 3);
      } else if (i === 2) { // Hands out
        g.line(bx + 12, by + 16, bx + 24, by + 16, isSel ? 0 : 3);
        g.disc(bx + 18, by + 14, 2, isSel ? 0 : 3);
      } else if (i === 3) { // Umbrella
        g.line(bx + 12, by + 15, bx + 24, by + 15, isSel ? 0 : 3);
        g.line(bx + 14, by + 14, bx + 22, by + 14, isSel ? 0 : 3);
        g.line(bx + 18, by + 15, bx + 18, by + 21, isSel ? 0 : 3);
      } else if (i === 4) { // Bomb
        g.disc(bx + 18, by + 18, 3, isSel ? 0 : 3);
        g.line(bx + 18, by + 15, bx + 22, by + 12, isSel ? 0 : 3);
      }

      g.text("x" + skills[i].count, bx + 6, by + 26, isSel ? 0 : 2);
    }

    // Fast-Forward button
    const ffx = 193;
    g.rect(ffx, 202, 28, 36, this.fastForward ? 2 : 0);
    g.box(ffx, 202, 28, 36, this.fastForward ? 3 : 1);
    g.text("FF", ffx + 8, 208, this.fastForward ? 0 : 3);
    g.text(this.fastForward ? "2X" : "1X", ffx + 8, 222, this.fastForward ? 0 : 2);

    // Nuke button
    const nkx = 224;
    g.rect(nkx, 202, 29, 36, this.nuked ? 2 : 0);
    g.box(nkx, 202, 29, 36, this.nuked ? 3 : 1);
    g.text("NUKE", nkx + 3, 208, this.nuked ? 0 : 3);
    g.text("BOOM", nkx + 3, 222, this.nuked ? 0 : 2);

    // ------------------------------------------------------------------------
    // POPUP OVERLAY BANNERS (INTRO / CLEAR / FAIL)
    // ------------------------------------------------------------------------
    if (this.state === 'INTRO') {
      g.dither(28, 55, 200, 90, 0, 1);
      g.rect(28, 55, 200, 90, 0);
      g.box(28, 55, 200, 90, 3);

      g.textC("=== " + lvlName + " ===", 65, 3);
      g.textC(this.curLevel.subtitle, 78, 2);
      g.textC("CLAN: " + this.curLevel.totalLemms + " LEMMINGS", 92, 2);
      g.textC("RESCUE QUOTA: " + reqPct + "% (" + this.curLevel.quota + " MIN)", 104, 3);

      const blink = Math.floor(Date.now() / 250) % 2 === 0;
      g.textC("PRESS [A] OR TAP TO MARCH!", 124, blink ? 3 : 2);
    } else if (this.state === 'STAGE_CLEAR') {
      g.dither(28, 55, 200, 90, 0, 1);
      g.rect(28, 55, 200, 90, 0);
      g.box(28, 55, 200, 90, 3);

      g.textC("★ LEVEL COMPLETE! ★", 65, 3);
      g.textC("SAVED: " + this.savedCount + " / " + this.curLevel.totalLemms, 82, 3);
      const savedPct = Math.round((this.savedCount / this.curLevel.totalLemms) * 100);
      g.textC("SUCCESS RATE: " + savedPct + "% (REQ: " + reqPct + "%)", 95, 2);
      g.textC("EXCELLENT WORK, COMMANDER!", 108, 2);

      const blink = Math.floor(Date.now() / 250) % 2 === 0;
      g.textC("PRESS [A] FOR NEXT STAGE", 124, blink ? 3 : 2);
    } else if (this.state === 'STAGE_FAIL') {
      g.dither(28, 55, 200, 90, 0, 1);
      g.rect(28, 55, 200, 90, 0);
      g.box(28, 55, 200, 90, 2);

      g.textC("DISASTER STRIKES!", 65, 3);
      g.textC("ONLY " + this.savedCount + " / " + this.curLevel.totalLemms + " SAVED", 82, 2);
      const savedPct = Math.round((this.savedCount / this.curLevel.totalLemms) * 100);
      g.textC("ACHIEVED: " + savedPct + "%  NEEDED: " + reqPct + "%", 95, 2);
      g.textC("THE CLAN NEEDS YOU!", 108, 1);

      const blink = Math.floor(Date.now() / 250) % 2 === 0;
      g.textC("PRESS [A] TO RETRY STAGE", 124, blink ? 3 : 2);
    } else if (this.state === 'CAMPAIGN_CLEAR') {
      g.dither(24, 45, 208, 110, 0, 1);
      g.rect(24, 45, 208, 110, 0);
      g.box(24, 45, 208, 110, 3);

      g.textC("★ ★ ★ GRANDMASTER ★ ★ ★", 55, 3);
      g.textC("ALL 4 STAGES CONQUERED!", 70, 3);
      g.textC("TOTAL SAVED: " + (this.totalSavedAcrossLevels + this.savedCount) + " LEMMINGS", 86, 2);
      g.textC("THE CLAN HAS REACHED PARADISE!", 100, 2);
      g.textC("HONORARY CHIEF AWARDED", 114, 1);

      const blink = Math.floor(Date.now() / 250) % 2 === 0;
      g.textC("PRESS [A] TO PLAY AGAIN", 135, blink ? 3 : 2);
    }
  }
};
