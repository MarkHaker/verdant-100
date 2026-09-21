// js/cartridges/cart_042_tower_def.js
// ============================================================================
// Cartridge #042: TOWER DEF
// Genre: STRATEGY (4) | Arcade Kingdom Tower Defense
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

(function() {
  // --------------------------------------------------------------------------
  // ROAD GEOMETRY & WAYPOINTS
  // S-shaped winding cobblestone pathway across the 256x240 playfield
  // --------------------------------------------------------------------------
  const WAYPOINTS = [
    { x: -12, y: 44 },
    { x: 80,  y: 44 },
    { x: 80,  y: 96 },
    { x: 210, y: 96 },
    { x: 210, y: 156 },
    { x: 44,  y: 156 },
    { x: 44,  y: 198 }
  ];

  // Precalculate segments and total path length
  const SEGMENTS = [];
  let TOTAL_PATH_LEN = 0;
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const p0 = WAYPOINTS[i];
    const p1 = WAYPOINTS[i + 1];
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy);
    SEGMENTS.push({
      x0: p0.x, y0: p0.y,
      x1: p1.x, y1: p1.y,
      dx, dy, len,
      startDist: TOTAL_PATH_LEN
    });
    TOTAL_PATH_LEN += len;
  }

  function getPathPos(dist) {
    if (dist <= 0) return { x: WAYPOINTS[0].x, y: WAYPOINTS[0].y, angle: 0 };
    if (dist >= TOTAL_PATH_LEN) {
      const last = WAYPOINTS[WAYPOINTS.length - 1];
      return { x: last.x, y: last.y, angle: Math.PI / 2 };
    }
    for (let i = 0; i < SEGMENTS.length; i++) {
      const seg = SEGMENTS[i];
      if (dist <= seg.startDist + seg.len || i === SEGMENTS.length - 1) {
        const t = Math.max(0, Math.min(1, (dist - seg.startDist) / seg.len));
        return {
          x: seg.x0 + seg.dx * t,
          y: seg.y0 + seg.dy * t,
          angle: Math.atan2(seg.dy, seg.dx)
        };
      }
    }
    return { x: WAYPOINTS[0].x, y: WAYPOINTS[0].y, angle: 0 };
  }

  function distToSegment(px, py, x0, y0, x1, y1) {
    const dx = x1 - x0, dy = y1 - y0;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) return Math.hypot(px - x0, py - y0);
    let t = ((px - x0) * dx + (py - y0) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy));
  }

  // --------------------------------------------------------------------------
  // TOWER ARCHETYPES & UPGRADE DATA
  // --------------------------------------------------------------------------
  const TOWER_TYPES = [
    {
      name: "GATLING",
      desc: "RAPID-FIRE SINGLE TARGET",
      cost: 40,
      levels: [
        { cost: 40, range: 48, dmg: 1.4, rate: 0.15, upgradeCost: 35 },
        { cost: 35, range: 58, dmg: 2.3, rate: 0.11, upgradeCost: 55 },
        { cost: 55, range: 70, dmg: 3.6, rate: 0.08, upgradeCost: 0 }
      ]
    },
    {
      name: "CANNON",
      desc: "EXPLOSIVE AOE MORTAR",
      cost: 65,
      levels: [
        { cost: 65, range: 64, dmg: 9.0, blast: 24, rate: 1.4, upgradeCost: 50 },
        { cost: 50, range: 76, dmg: 16.0, blast: 30, rate: 1.2, upgradeCost: 75 },
        { cost: 75, range: 90, dmg: 26.0, blast: 38, rate: 1.0, upgradeCost: 0 }
      ]
    },
    {
      name: "CRYO",
      desc: "PERIODIC SLOW RING",
      cost: 50,
      levels: [
        { cost: 50, range: 52, dmg: 1.5, slow: 0.50, slowDur: 3.0, rate: 1.8, upgradeCost: 45 },
        { cost: 45, range: 65, dmg: 3.0, slow: 0.60, slowDur: 3.8, rate: 1.5, upgradeCost: 65 },
        { cost: 65, range: 80, dmg: 5.0, slow: 0.70, slowDur: 4.5, rate: 1.2, upgradeCost: 0 }
      ]
    }
  ];

  // --------------------------------------------------------------------------
  // CREEP ARCHETYPES
  // --------------------------------------------------------------------------
  const CREEP_TYPES = [
    { name: "SCOUT",   speed: 46, baseHp: 12,  bounty: 4,  size: 6,  color: 3 },
    { name: "SOLDIER", speed: 28, baseHp: 30,  bounty: 6,  size: 8,  color: 2 },
    { name: "GOLEM",   speed: 16, baseHp: 80,  bounty: 12, size: 10, color: 3, armor: 0.5 },
    { name: "BOSS",    speed: 11, baseHp: 360, bounty: 50, size: 16, color: 3, isBoss: true }
  ];

  // --------------------------------------------------------------------------
  // 15 WAVES OF PROGRESSIVE INVASIONS
  // --------------------------------------------------------------------------
  const WAVES_DATA = [
    // Wave 1: Intro Scouts
    { spawns: [{ type: 0, count: 10, interval: 1.0 }] },
    // Wave 2: Scouts + Soldiers
    { spawns: [{ type: 0, count: 12, interval: 0.8 }, { type: 1, count: 6, interval: 1.2 }] },
    // Wave 3: Soldier March
    { spawns: [{ type: 1, count: 16, interval: 0.85 }] },
    // Wave 4: Golem Vanguard (Introduces armor)
    { spawns: [{ type: 1, count: 12, interval: 0.8 }, { type: 2, count: 5, interval: 1.5 }] },
    // Wave 5: BOSS 1: Behemoth I + Scout rush
    { spawns: [{ type: 3, count: 1, interval: 1.0, hp: 360 }, { type: 0, count: 14, interval: 0.7 }] },
    // Wave 6: Heavy mixed assault
    { spawns: [{ type: 1, count: 16, interval: 0.7 }, { type: 2, count: 8, interval: 1.2 }] },
    // Wave 7: Fast swarm blitz (tests Cryo slows)
    { spawns: [{ type: 0, count: 28, interval: 0.4 }, { type: 2, count: 6, interval: 1.2 }] },
    // Wave 8: Iron March (High armor)
    { spawns: [{ type: 2, count: 14, interval: 0.95 }, { type: 1, count: 14, interval: 0.6 }] },
    // Wave 9: Triple threat
    { spawns: [{ type: 0, count: 22, interval: 0.5 }, { type: 1, count: 16, interval: 0.6 }, { type: 2, count: 10, interval: 1.1 }] },
    // Wave 10: BOSS 2: Behemoth II + Heavy Golems
    { spawns: [{ type: 3, count: 1, interval: 1.0, hp: 950 }, { type: 2, count: 10, interval: 1.1 }, { type: 1, count: 14, interval: 0.6 }] },
    // Wave 11: Speed Overdrive
    { spawns: [{ type: 0, count: 36, interval: 0.35 }, { type: 1, count: 18, interval: 0.5 }] },
    // Wave 12: Titan Phalanx
    { spawns: [{ type: 2, count: 22, interval: 0.85 }, { type: 1, count: 16, interval: 0.6 }] },
    // Wave 13: Relentless Siege
    { spawns: [{ type: 0, count: 28, interval: 0.4 }, { type: 2, count: 16, interval: 0.8 }] },
    // Wave 14: Overwhelming Vanguard
    { spawns: [{ type: 1, count: 24, interval: 0.5 }, { type: 2, count: 18, interval: 0.7 }, { type: 0, count: 22, interval: 0.35 }] },
    // Wave 15: FINAL BOSS: Omega Behemoth III + Sub-boss
    { spawns: [
      { type: 3, count: 1, interval: 1.0, hp: 2200 },
      { type: 2, count: 12, interval: 0.8 },
      { type: 3, count: 1, interval: 8.0, hp: 750 },
      { type: 0, count: 25, interval: 0.4 }
    ]}
  ];

  // --------------------------------------------------------------------------
  // CARTRIDGE DEFINITION
  // --------------------------------------------------------------------------
  CARTS[42] = {
    id: 42,
    name: "TOWER DEF",
    genre: 4,
    scoreLabel: "WAVES",
    desc: "PLACE DEFENSE TURRETS ALONG PATHWAY TO ANNIHILATE MARCHING INVADERS!",

    // ------------------------------------------------------------------------
    // 1. 32x32 RETRO ICON
    // Fortified stone battlement turret with crenellations, twin cannons, and firing projectile trails
    // ------------------------------------------------------------------------
    icon(g, x, y) {
      g.rect(x, y, 32, 32, 0);
      g.box(x, y, 32, 32, 1);

      // Stone ground foundation
      g.rect(x + 2, y + 26, 28, 5, 1);
      g.line(x + 2, y + 26, x + 30, y + 26, 2);

      // Stone battlement turret body
      g.rect(x + 7, y + 12, 18, 14, 2);
      // Brick texture lines
      g.line(x + 7, y + 18, x + 24, y + 18, 1);
      g.line(x + 7, y + 22, x + 24, y + 22, 1);
      g.line(x + 13, y + 12, x + 13, y + 18, 1);
      g.line(x + 19, y + 18, x + 19, y + 22, 1);
      g.line(x + 11, y + 22, x + 11, y + 26, 1);

      // Turret Crenellations / Battlements rim
      g.rect(x + 5, y + 9, 22, 3, 2);
      // Cutouts
      g.rect(x + 10, y + 8, 3, 3, 0);
      g.rect(x + 19, y + 8, 3, 3, 0);
      // Merlons (teeth)
      g.rect(x + 5, y + 7, 5, 3, 3);
      g.rect(x + 13, y + 7, 6, 3, 3);
      g.rect(x + 22, y + 7, 5, 3, 3);

      // Twin Cannons pointing angled outward
      g.line(x + 9, y + 9, x + 4, y + 3, 3);
      g.line(x + 10, y + 9, x + 5, y + 3, 3);
      g.line(x + 22, y + 9, x + 27, y + 3, 3);
      g.line(x + 21, y + 9, x + 26, y + 3, 3);

      // Firing projectile trails & muzzle sparks
      g.px(x + 3, y + 2, 3);
      g.px(x + 28, y + 2, 3);
      g.line(x + 2, y + 1, x + 1, y + 0, 3);
      g.line(x + 29, y + 1, x + 30, y + 0, 3);

      // Observation slit
      g.rect(x + 14, y + 15, 4, 2, 0);
    },

    // ------------------------------------------------------------------------
    // 2. INITIALIZATION
    // ------------------------------------------------------------------------
    init() {
      this.state = 'PLAY'; // 'PLAY' | 'OVER' | 'VICTORY'
      this.cash = 100;
      this.lives = 15;
      this.maxLives = 15;
      this.wave = 1;
      this.maxWaves = 15;
      this.kills = 0;

      // Speed toggle: 1 = normal, 2 = fast forward (2x)
      this.speedMult = 1;

      // Wave state & countdown timer
      this.waveActive = false;
      this.waveCountdown = 5.0; // 5 seconds before auto-start
      this.spawnQueue = [];
      this.spawnTimer = 0;

      // Entities
      this.towers = [];
      this.creeps = [];
      this.projectiles = [];
      this.shockwaves = [];
      this.particles = [];
      this.popups = [];

      // Audio throttle timers
      this.lastTickTime = 0;
      this.lastCryoTime = 0;

      // Interactive cursor & selection
      this.curX = 135;
      this.curY = 125;
      this.selectedTower = null;
      this.buildingPlot = null;
      this.selectedArchetype = 0; // 0: Gatling, 1: Cannon, 2: Cryo

      // Screen shake & visual juice
      this.shake = 0;
      this.animTimer = 0;
      this.bannerTimer = 0;
      this.bannerText = "";

      // High score
      this.bestWave = (typeof SAVE !== 'undefined' && SAVE.getScore) ? (SAVE.getScore(this.id) || 0) : 0;
    },

    // ------------------------------------------------------------------------
    // PLACEMENT VALIDATION
    // ------------------------------------------------------------------------
    isValidPlot(x, y) {
      // Bounds check within playable field
      if (x < 14 || x > 242 || y < 28 || y > 194) return false;

      // Base HQ exclusion zone
      if (Math.hypot(x - 44, y - 198) < 22) return false;

      // Enemy Portal exclusion zone
      if (Math.hypot(x - (-12), y - 44) < 24) return false;

      // Distance to road segments (must be >= 15px from road centerline)
      for (let i = 0; i < SEGMENTS.length; i++) {
        const seg = SEGMENTS[i];
        if (distToSegment(x, y, seg.x0, seg.y0, seg.x1, seg.y1) < 15) {
          return false;
        }
      }

      // Distance to existing towers (must be >= 16px apart)
      for (let t of this.towers) {
        if (Math.hypot(x - t.x, y - t.y) < 16) {
          return false;
        }
      }

      return true;
    },

    // ------------------------------------------------------------------------
    // WAVE DISPATCHER
    // ------------------------------------------------------------------------
    startWave() {
      if (this.waveActive || this.state !== 'PLAY') return;
      if (this.wave > this.maxWaves) return;

      const wIdx = Math.min(this.wave - 1, WAVES_DATA.length - 1);
      const waveDef = WAVES_DATA[wIdx];

      this.spawnQueue = [];
      for (let sp of waveDef.spawns) {
        for (let i = 0; i < sp.count; i++) {
          this.spawnQueue.push({
            type: sp.type,
            delay: sp.interval,
            hp: sp.hp || null
          });
        }
      }

      this.waveActive = true;
      this.waveCountdown = 0;
      this.spawnTimer = 0.4;
      this.bannerText = "WAVE " + this.wave + " ENGAGED!";
      this.bannerTimer = 2.0;
      APU.sfx('ALARM');
    },

    spawnCreep(typeIdx, hpOverride) {
      const def = CREEP_TYPES[typeIdx];
      // Wave scaling factor
      const waveScale = 1 + (this.wave - 1) * 0.15;
      const hp = hpOverride ? hpOverride : Math.round(def.baseHp * waveScale);

      const creep = {
        type: typeIdx,
        name: def.name,
        dist: 0,
        x: WAYPOINTS[0].x,
        y: WAYPOINTS[0].y,
        angle: 0,
        hp: hp,
        maxHp: hp,
        speed: def.speed,
        bounty: def.bounty,
        size: def.size,
        color: def.color,
        armor: def.armor || 0,
        isBoss: !!def.isBoss,
        slowMult: 1.0,
        slowTimer: 0,
        animFrame: 0,
        stompTimer: 0
      };
      this.creeps.push(creep);
    },

    // ------------------------------------------------------------------------
    // TOWER ACTIONS (BUILD, UPGRADE, SELL)
    // ------------------------------------------------------------------------
    buildTower(archIdx, x, y) {
      const arch = TOWER_TYPES[archIdx];
      if (this.cash < arch.cost) {
        APU.sfx('DENY');
        this.addPopup(x, y, "NO CASH!", 2);
        return false;
      }
      if (!this.isValidPlot(x, y)) {
        APU.sfx('DENY');
        return false;
      }

      this.cash -= arch.cost;
      const t = {
        type: archIdx,
        level: 1, // 1..3
        x: Math.round(x),
        y: Math.round(y),
        angle: 0,
        cooldown: 0,
        invested: arch.cost,
        recoil: 0
      };
      this.towers.push(t);
      this.selectedTower = t;
      this.buildingPlot = null;
      APU.sfx('POWER');
      this.addPopup(x, y - 8, "+BUILT", 3);
      this.addSparks(x, y, 8, 3);
      return true;
    },

    upgradeTower(t) {
      if (!t || t.level >= 3) {
        APU.sfx('DENY');
        return false;
      }
      const arch = TOWER_TYPES[t.type];
      const curLvl = arch.levels[t.level - 1];
      const upCost = curLvl.upgradeCost;
      if (this.cash < upCost) {
        APU.sfx('DENY');
        this.addPopup(t.x, t.y - 8, "NEED $" + upCost, 2);
        return false;
      }

      this.cash -= upCost;
      t.invested += upCost;
      t.level++;
      APU.sfx('POWER');
      this.addPopup(t.x, t.y - 10, "LV." + t.level + "!", 3);
      this.addSparks(t.x, t.y, 12, 3);
      return true;
    },

    sellTower(t) {
      if (!t) return;
      const refund = Math.floor(t.invested * 0.70);
      this.cash += refund;
      const idx = this.towers.indexOf(t);
      if (idx >= 0) this.towers.splice(idx, 1);
      this.selectedTower = null;
      APU.sfx('COIN');
      this.addPopup(t.x, t.y - 8, "+$" + refund, 3);
      this.addSparks(t.x, t.y, 6, 2);
    },

    // ------------------------------------------------------------------------
    // PARTICLES & POPUPS
    // ------------------------------------------------------------------------
    addSparks(x, y, count, color) {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 35 + 15;
        this.particles.push({
          x, y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: Math.random() * 0.35 + 0.15,
          maxLife: 0.5,
          color: color || 3
        });
      }
    },

    addPopup(x, y, text, color) {
      this.popups.push({
        x: Math.round(x),
        y: Math.round(y),
        text,
        color: color || 3,
        timer: 0.8
      });
    },

    // ------------------------------------------------------------------------
    // 3. UPDATE LOOP
    // ------------------------------------------------------------------------
    update(dt) {
      // Clamp extreme dt spikes
      if (dt > 0.1) dt = 0.1;

      // Handle Game Over / Victory input
      if (this.state !== 'PLAY') {
        if (PAD.hit('a') || PAD.hit('start') || PAD.tapPos) {
          APU.sfx('UI_OK');
          this.init();
        }
        return;
      }

      // Fast-forward speed toggle
      if (PAD.hit('select')) {
        this.speedMult = this.speedMult === 1 ? 2 : 1;
        APU.sfx('UI_MOVE');
      }

      // Effective game delta time
      const gdt = dt * this.speedMult;
      this.animTimer += gdt;

      // Screen shake decay
      if (this.shake > 0) {
        this.shake = Math.max(0, this.shake - 10 * dt);
      }

      // Wave banner timer
      if (this.bannerTimer > 0) {
        this.bannerTimer -= dt;
      }

      // ----------------------------------------------------------------------
      // CURSOR & INPUT NAVIGATION (D-pad + Mouse / Touch)
      // ----------------------------------------------------------------------
      const curSpeed = 110;
      if (PAD.held('left'))  this.curX -= curSpeed * dt;
      if (PAD.held('right')) this.curX += curSpeed * dt;
      if (PAD.held('up'))    this.curY -= curSpeed * dt;
      if (PAD.held('down'))  this.curY += curSpeed * dt;
      this.curX = Math.max(14, Math.min(242, this.curX));
      this.curY = Math.max(28, Math.min(194, this.curY));

      // Handle direct mobile touch tap
      if (PAD.tapPos) {
        const tx = PAD.tapPos.x;
        const ty = PAD.tapPos.y;

        // 1. Check Bottom UI Touch Buttons (y: 206..240)
        if (ty >= 206) {
          if (this.selectedTower) {
            // Upgrade button (x: 108..180)
            if (tx >= 108 && tx <= 180) {
              this.upgradeTower(this.selectedTower);
            }
            // Sell button (x: 184..246)
            else if (tx >= 184 && tx <= 246) {
              this.sellTower(this.selectedTower);
            }
            // Deselect area (x: 6..100)
            else {
              this.selectedTower = null;
              APU.sfx('UI_MOVE');
            }
          } else if (this.buildingPlot) {
            // [GAT $40] (x: 6..60)
            if (tx >= 6 && tx <= 60) {
              this.selectedArchetype = 0;
              this.buildTower(0, this.buildingPlot.x, this.buildingPlot.y);
            }
            // [CAN $65] (x: 64..118)
            else if (tx >= 64 && tx <= 118) {
              this.selectedArchetype = 1;
              this.buildTower(1, this.buildingPlot.x, this.buildingPlot.y);
            }
            // [CRY $50] (x: 122..176)
            else if (tx >= 122 && tx <= 176) {
              this.selectedArchetype = 2;
              this.buildTower(2, this.buildingPlot.x, this.buildingPlot.y);
            }
            // [CANCEL] (x: 182..246)
            else if (tx >= 182 && tx <= 246) {
              this.buildingPlot = null;
              APU.sfx('UI_BACK');
            }
          } else {
            // [START WAVE] (x: 6..88)
            if (tx >= 6 && tx <= 88 && !this.waveActive) {
              this.startWave();
            }
            // [SPEED: 1x/2x] (x: 94..158)
            else if (tx >= 94 && tx <= 158) {
              this.speedMult = this.speedMult === 1 ? 2 : 1;
              APU.sfx('UI_MOVE');
            }
          }
        }
        // 2. Playfield Touch Tap (y: 19..205)
        else {
          this.curX = tx;
          this.curY = ty;

          // Check if tapped existing tower
          const tappedTower = this.towers.find(t => Math.hypot(t.x - tx, t.y - ty) < 14);
          if (tappedTower) {
            this.selectedTower = tappedTower;
            this.buildingPlot = null;
            APU.sfx('UI_OK');
          } else if (this.isValidPlot(tx, ty)) {
            // Selected valid ground plot for building
            this.buildingPlot = { x: Math.round(tx), y: Math.round(ty) };
            this.selectedTower = null;
            APU.sfx('UI_MOVE');
          } else {
            // Tapped road or invalid ground: deselect
            this.selectedTower = null;
            this.buildingPlot = null;
            APU.sfx('UI_BACK');
          }
        }
      }

      // Handle Gamepad / Keyboard button presses
      if (PAD.hit('start')) {
        if (!this.waveActive) {
          this.startWave();
        } else {
          this.speedMult = this.speedMult === 1 ? 2 : 1;
          APU.sfx('UI_MOVE');
        }
      }

      if (PAD.hit('a')) {
        if (this.selectedTower) {
          this.upgradeTower(this.selectedTower);
        } else if (this.buildingPlot) {
          this.buildTower(this.selectedArchetype, this.buildingPlot.x, this.buildingPlot.y);
        } else {
          // Check hover over tower
          const hoverTower = this.towers.find(t => Math.hypot(t.x - this.curX, t.y - this.curY) < 13);
          if (hoverTower) {
            this.selectedTower = hoverTower;
            APU.sfx('UI_OK');
          } else if (this.isValidPlot(this.curX, this.curY)) {
            this.buildingPlot = { x: Math.round(this.curX), y: Math.round(this.curY) };
            APU.sfx('UI_MOVE');
          } else {
            APU.sfx('DENY');
          }
        }
      }

      if (PAD.hit('b')) {
        if (this.selectedTower) {
          this.sellTower(this.selectedTower);
        } else if (this.buildingPlot) {
          this.buildingPlot = null;
          APU.sfx('UI_BACK');
        } else if (!this.waveActive) {
          // Cycle selected tower archetype
          this.selectedArchetype = (this.selectedArchetype + 1) % 3;
          APU.sfx('UI_MOVE');
        }
      }

      // In build menu: Left / Right cycles archetype
      if (this.buildingPlot) {
        if (PAD.hit('left')) {
          this.selectedArchetype = (this.selectedArchetype + 2) % 3;
          APU.sfx('UI_MOVE');
        } else if (PAD.hit('right')) {
          this.selectedArchetype = (this.selectedArchetype + 1) % 3;
          APU.sfx('UI_MOVE');
        }
      }

      // ----------------------------------------------------------------------
      // WAVE AUTO-START COUNTDOWN
      // ----------------------------------------------------------------------
      if (!this.waveActive) {
        this.waveCountdown -= gdt;
        if (this.waveCountdown <= 0) {
          this.startWave();
        }
      }

      // ----------------------------------------------------------------------
      // CREEP SPAWNER
      // ----------------------------------------------------------------------
      if (this.waveActive && this.spawnQueue.length > 0) {
        this.spawnTimer -= gdt;
        if (this.spawnTimer <= 0) {
          const item = this.spawnQueue.shift();
          this.spawnCreep(item.type, item.hp);
          this.spawnTimer = item.delay;
        }
      }

      // ----------------------------------------------------------------------
      // CREEP UPDATE (Movement, Slow Timers, Base HQ Invasion)
      // ----------------------------------------------------------------------
      for (let i = this.creeps.length - 1; i >= 0; i--) {
        const c = this.creeps[i];

        // Handle cryogenic freeze / slow timer
        if (c.slowTimer > 0) {
          c.slowTimer -= gdt;
          if (c.slowTimer <= 0) {
            c.slowMult = 1.0;
          }
        }

        // Boss footstep stomping screen shake
        if (c.isBoss) {
          c.stompTimer += gdt;
          if (c.stompTimer >= 0.75) {
            c.stompTimer = 0;
            this.shake = Math.max(this.shake, 1.8);
          }
        }

        // Move along winding pathway
        c.dist += c.speed * c.slowMult * gdt;
        const pos = getPathPos(c.dist);
        c.x = pos.x;
        c.y = pos.y;
        c.angle = pos.angle;

        // Check if invaded Base HQ at end of road
        if (c.dist >= TOTAL_PATH_LEN) {
          this.creeps.splice(i, 1);
          const dmg = c.isBoss ? 5 : 1;
          this.lives = Math.max(0, this.lives - dmg);
          this.shake = c.isBoss ? 8 : 4;
          APU.sfx('HURT');
          this.addPopup(44, 185, "-" + dmg + " LIFE!", 3);
          this.addSparks(44, 198, 16, 2);

          if (this.lives <= 0) {
            this.state = 'OVER';
            if (typeof SAVE !== 'undefined' && SAVE.setScore) {
              SAVE.setScore(this.id, this.wave);
            }
            return;
          }
          continue;
        }

        // Check creep death
        if (c.hp <= 0) {
          this.creeps.splice(i, 1);
          this.cash += c.bounty;
          this.kills++;
          APU.sfx('COIN');
          this.addPopup(c.x, c.y - 6, "+$" + c.bounty, 3);
          this.addSparks(c.x, c.y, c.isBoss ? 24 : 10, c.isBoss ? 3 : 2);
          if (c.isBoss) {
            APU.sfx('BOOM');
            this.shake = 6;
          }
        }
      }

      // ----------------------------------------------------------------------
      // TOWER ATTACK UPDATE
      // ----------------------------------------------------------------------
      const now = performance.now();

      for (let t of this.towers) {
        const arch = TOWER_TYPES[t.type];
        const lvl = arch.levels[t.level - 1];

        if (t.cooldown > 0) {
          t.cooldown -= gdt;
        }
        if (t.recoil > 0) {
          t.recoil = Math.max(0, t.recoil - 8 * gdt);
        }

        // 1. GATLING TURRET: Rapid-fire single-target tracer
        if (t.type === 0) {
          // Find creep furthest along path within range
          let bestCreep = null;
          let maxDist = -1;
          for (let c of this.creeps) {
            if (c.hp <= 0) continue;
            const d = Math.hypot(c.x - t.x, c.y - t.y);
            if (d <= lvl.range && c.dist > maxDist) {
              maxDist = c.dist;
              bestCreep = c;
            }
          }

          if (bestCreep) {
            t.angle = Math.atan2(bestCreep.y - t.y, bestCreep.x - t.x);
            if (t.cooldown <= 0) {
              t.cooldown = lvl.rate;
              t.recoil = 3;

              // Armored Golem resistance (takes 50% damage from bullets)
              let damage = lvl.dmg;
              if (bestCreep.armor > 0) {
                damage *= (1 - bestCreep.armor);
              }
              bestCreep.hp -= damage;

              // Bullet tracer effect
              this.particles.push({
                type: 'tracer',
                x0: t.x + Math.cos(t.angle) * 7,
                y0: t.y + Math.sin(t.angle) * 7,
                x1: bestCreep.x,
                y1: bestCreep.y,
                life: 0.05,
                maxLife: 0.05,
                color: 3
              });

              // Muzzle flash & impact sparks
              this.addSparks(bestCreep.x, bestCreep.y, 2, 3);

              if (now - this.lastTickTime > 75) {
                APU.sfx('TICK');
                this.lastTickTime = now;
              }
            }
          }
        }

        // 2. CANNON / MORTAR TOWER: Arcing explosive ballistic shell
        else if (t.type === 1) {
          let bestCreep = null;
          let maxDist = -1;
          for (let c of this.creeps) {
            if (c.hp <= 0) continue;
            const d = Math.hypot(c.x - t.x, c.y - t.y);
            if (d <= lvl.range && c.dist > maxDist) {
              maxDist = c.dist;
              bestCreep = c;
            }
          }

          if (bestCreep) {
            t.angle = Math.atan2(bestCreep.y - t.y, bestCreep.x - t.x);
            if (t.cooldown <= 0) {
              t.cooldown = lvl.rate;
              t.recoil = 5;

              // Launch arcing mortar projectile
              this.projectiles.push({
                startX: t.x,
                startY: t.y,
                targetX: bestCreep.x,
                targetY: bestCreep.y,
                t: 0,
                duration: 0.50,
                blast: lvl.blast,
                dmg: lvl.dmg
              });
              APU.sfx('SWISH');
            }
          }
        }

        // 3. CRYO / SLOW TOWER: Periodic frost pulse shockwave
        else if (t.type === 2) {
          // Check if any creep in range
          const hasCreepInRange = this.creeps.some(c => c.hp > 0 && Math.hypot(c.x - t.x, c.y - t.y) <= lvl.range);
          if (hasCreepInRange && t.cooldown <= 0) {
            t.cooldown = lvl.rate;
            t.recoil = 4;

            // Spawn expanding frost shockwave ring
            this.shockwaves.push({
              x: t.x,
              y: t.y,
              r: 4,
              maxR: lvl.range,
              dmg: lvl.dmg,
              slow: lvl.slow,
              slowDur: lvl.slowDur,
              life: 0.35,
              maxLife: 0.35
            });

            if (now - this.lastCryoTime > 250) {
              APU.sfx('SWISH');
              this.lastCryoTime = now;
            }
          }
        }
      }

      // ----------------------------------------------------------------------
      // PROJECTILES UPDATE (Mortar flight & AoE blast)
      // ----------------------------------------------------------------------
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        p.t += gdt / p.duration;

        if (p.t >= 1.0) {
          this.projectiles.splice(i, 1);
          const bx = p.targetX;
          const by = p.targetY;

          // Mortar detonation & screen shake
          APU.sfx('BOOM');
          this.shake = Math.max(this.shake, 3.2);

          // Spawn blast shockwave
          this.shockwaves.push({
            x: bx,
            y: by,
            r: 4,
            maxR: p.blast,
            life: 0.25,
            maxLife: 0.25,
            isExplosion: true
          });

          // Blast smoke and shrapnel particles
          this.addSparks(bx, by, 14, 3);
          this.addSparks(bx, by, 8, 2);

          // AoE Blast Damage to all nearby creeps (Armored Golems take FULL damage!)
          for (let c of this.creeps) {
            if (c.hp <= 0) continue;
            const d = Math.hypot(c.x - bx, c.y - by);
            if (d <= p.blast) {
              const falloff = 1 - (d / p.blast) * 0.4;
              c.hp -= p.dmg * falloff;
              this.addSparks(c.x, c.y, 3, 3);
            }
          }
        }
      }

      // ----------------------------------------------------------------------
      // SHOCKWAVES UPDATE
      // ----------------------------------------------------------------------
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const s = this.shockwaves[i];
        s.life -= gdt;
        const progress = 1 - (s.life / s.maxLife);
        s.r = 4 + (s.maxR - 4) * progress;

        // If Cryo shockwave: apply frost slow to any newly reached creep
        if (s.slow) {
          for (let c of this.creeps) {
            if (c.hp <= 0) continue;
            const d = Math.hypot(c.x - s.x, c.y - s.y);
            if (Math.abs(d - s.r) < 8 || d < s.r) {
              c.slowMult = 1 - s.slow;
              c.slowTimer = Math.max(c.slowTimer, s.slowDur);
              c.hp -= s.dmg * gdt;
            }
          }
        }

        if (s.life <= 0) {
          this.shockwaves.splice(i, 1);
        }
      }

      // ----------------------------------------------------------------------
      // PARTICLES & POPUPS UPDATE
      // ----------------------------------------------------------------------
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= gdt;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
        if (p.vx !== undefined) {
          p.x += p.vx * gdt;
          p.y += p.vy * gdt;
        }
      }

      for (let i = this.popups.length - 1; i >= 0; i--) {
        const pop = this.popups[i];
        pop.timer -= gdt;
        pop.y -= 14 * gdt;
        if (pop.timer <= 0) {
          this.popups.splice(i, 1);
        }
      }

      // ----------------------------------------------------------------------
      // WAVE CLEAR & VICTORY CHECKS
      // ----------------------------------------------------------------------
      if (this.waveActive && this.spawnQueue.length === 0 && this.creeps.length === 0) {
        this.waveActive = false;

        // Check Campaign Victory at Wave 15
        if (this.wave >= this.maxWaves) {
          this.state = 'VICTORY';
          APU.sfx('LEVELUP');
          if (typeof SAVE !== 'undefined' && SAVE.setScore) {
            SAVE.setScore(this.id, this.maxWaves, { lives: this.lives, cash: this.cash });
          }
          return;
        }

        // Wave cleared bonus
        const waveBonus = 20 + this.wave * 5;
        this.cash += waveBonus;
        this.addPopup(128, 90, "+$" + waveBonus + " WAVE CLEAR!", 3);
        APU.sfx('LEVELUP');

        this.wave++;
        this.waveCountdown = 5.0; // 5 seconds intermission before next wave
        this.bannerText = "WAVE CLEARED! +$" + waveBonus;
        this.bannerTimer = 2.2;

        if (typeof SAVE !== 'undefined' && SAVE.setScore) {
          SAVE.setScore(this.id, this.wave);
        }
      }
    },

    // ------------------------------------------------------------------------
    // 4. RENDER PIPELINE
    // ------------------------------------------------------------------------
    render(g) {
      // Calculate screen shake offsets
      let ox = 0, oy = 0;
      if (this.shake > 0.2) {
        ox = Math.round((Math.random() - 0.5) * this.shake);
        oy = Math.round((Math.random() - 0.5) * this.shake);
      }

      // Clear display with dark phosphor background
      g.clear(0);

      // Subtle terrain ground texture
      for (let py = 24; py < 204; py += 16) {
        for (let px = 8; px < 248; px += 24) {
          const pseudo = (px * 37 + py * 19) % 29;
          if (pseudo < 4) {
            g.px(px + ox, py + oy, 1);
          }
        }
      }

      // ----------------------------------------------------------------------
      // SERPENTINE COBBLESTONE PATHWAY
      // ----------------------------------------------------------------------
      for (let i = 0; i < SEGMENTS.length; i++) {
        const seg = SEGMENTS[i];
        const minX = Math.min(seg.x0, seg.x1);
        const maxX = Math.max(seg.x0, seg.x1);
        const minY = Math.min(seg.y0, seg.y1);
        const maxY = Math.max(seg.y0, seg.y1);

        if (seg.dx !== 0) {
          // Horizontal road section
          const rx = minX - 7 + ox;
          const ry = seg.y0 - 7 + oy;
          const rw = (maxX - minX) + 14;
          g.rect(rx, ry, rw, 14, 1);
          // Road stone borders
          g.line(rx, ry, rx + rw - 1, ry, 2);
          g.line(rx, ry + 13, rx + rw - 1, ry + 13, 2);
          // Paver dots
          for (let k = minX; k <= maxX; k += 8) {
            g.px(k + ox, ry + 4, 2);
            g.px(k + 4 + ox, ry + 9, 2);
          }
        } else {
          // Vertical road section
          const rx = seg.x0 - 7 + ox;
          const ry = minY - 7 + oy;
          const rh = (maxY - minY) + 14;
          g.rect(rx, ry, 14, rh, 1);
          // Road stone borders
          g.line(rx, ry, rx, ry + rh - 1, 2);
          g.line(rx + 13, ry, rx + 13, ry + rh - 1, 2);
          // Paver dots
          for (let k = minY; k <= maxY; k += 8) {
            g.px(rx + 4, k + oy, 2);
            g.px(rx + 9, k + 4 + oy, 2);
          }
        }
      }

      // Fill corner joints
      for (let wp of WAYPOINTS) {
        g.rect(wp.x - 7 + ox, wp.y - 7 + oy, 14, 14, 1);
        g.box(wp.x - 7 + ox, wp.y - 7 + oy, 14, 14, 2);
      }

      // ----------------------------------------------------------------------
      // ENEMY SPAWN PORTAL (Top-Left)
      // ----------------------------------------------------------------------
      const spX = WAYPOINTS[0].x + 12 + ox;
      const spY = WAYPOINTS[0].y + oy;
      g.box(spX - 6, spY - 8, 12, 16, 2);
      g.rect(spX - 4, spY - 6, 8, 12, 1);
      g.line(spX - 4, spY - 6, spX + 3, spY + 5, 3);
      g.text("GATE", spX - 8, spY - 14, 2);

      // ----------------------------------------------------------------------
      // PLAYER BASE HQ (Fortified Citadel at bottom-left: 44, 198)
      // ----------------------------------------------------------------------
      const hqX = 44 + ox;
      const hqY = 196 + oy;
      // Castle walls & battlements
      g.rect(hqX - 12, hqY - 8, 24, 14, 1);
      g.box(hqX - 12, hqY - 8, 24, 14, 2);
      // Crenellations
      g.rect(hqX - 12, hqY - 11, 6, 3, 2);
      g.rect(hqX - 2, hqY - 11, 4, 3, 2);
      g.rect(hqX + 6, hqY - 11, 6, 3, 2);
      // Arched citadel gate
      g.rect(hqX - 3, hqY + 1, 6, 5, 0);
      g.box(hqX - 3, hqY + 1, 6, 5, 3);
      // Signal beacon antenna
      g.line(hqX, hqY - 11, hqX, hqY - 16, 3);
      g.px(hqX, hqY - 16, ((this.animTimer * 4) | 0) % 2 === 0 ? 3 : 2);
      g.text("HQ", hqX - 4, hqY - 6, 3);

      // ----------------------------------------------------------------------
      // CREEPS RENDERING (Marching invader sprites + health bars)
      // ----------------------------------------------------------------------
      for (let c of this.creeps) {
        const cx = Math.round(c.x) + ox;
        const cy = Math.round(c.y) + oy;

        // Draw Creep Sprite based on Archetype
        if (c.type === 0) {
          // SCOUT: Fast 6x6 bug
          const leg = ((this.animTimer * 12) | 0) % 2 === 0 ? 1 : -1;
          g.disc(cx, cy, 3, c.color);
          g.px(cx - 2, cy + leg, 3);
          g.px(cx + 2, cy - leg, 3);
          g.px(cx, cy - 3, 0); // Eye
        } else if (c.type === 1) {
          // SOLDIER: 8x8 Armored Footman
          const bob = ((this.animTimer * 8) | 0) % 2 === 0 ? 0 : 1;
          g.rect(cx - 3, cy - 3 + bob, 6, 6, c.color);
          g.box(cx - 3, cy - 3 + bob, 6, 6, 3);
          g.line(cx - 4, cy + bob, cx - 4, cy + 3 + bob, 2); // Shield
          g.px(cx + 4, cy - 1 + bob, 3); // Weapon tip
        } else if (c.type === 2) {
          // ARMORED GOLEM: 10x10 Heavy Tank
          g.rect(cx - 4, cy - 4, 8, 8, 1);
          g.box(cx - 4, cy - 4, 8, 8, 3);
          g.rect(cx - 2, cy - 2, 4, 4, 2);
          g.px(cx, cy, 3); // Glowing core
          // Heavy corner rivets
          g.px(cx - 4, cy - 4, 3);
          g.px(cx + 3, cy - 4, 3);
          g.px(cx - 4, cy + 3, 3);
          g.px(cx + 3, cy + 3, 3);
        } else if (c.type === 3) {
          // BOSS BEHEMOTH: Massive 16x16 Demonic War Engine
          g.rect(cx - 7, cy - 7, 14, 14, 1);
          g.box(cx - 7, cy - 7, 14, 14, 3);
          // Plated armor lines
          g.line(cx - 7, cy, cx + 6, cy, 2);
          g.line(cx, cy - 7, cx, cy + 6, 2);
          // Horns
          g.line(cx - 6, cy - 7, cx - 8, cy - 11, 3);
          g.line(cx + 5, cy - 7, cx + 7, cy - 11, 3);
          // Glowing skull eyes
          g.px(cx - 3, cy - 2, 3);
          g.px(cx + 2, cy - 2, 3);
          g.rect(cx - 2, cy + 2, 4, 2, 0); // Gritted maw
        }

        // Frost freeze visual cue
        if (c.slowTimer > 0) {
          g.circle(cx, cy, c.size / 2 + 2, 3);
        }

        // Health Bar above creep
        const barW = Math.max(10, c.size + 4);
        const barH = 2;
        const barX = cx - Math.floor(barW / 2);
        const barY = cy - Math.floor(c.size / 2) - 5;

        g.rect(barX, barY, barW, barH, 0);
        const fillW = Math.max(1, Math.round((c.hp / c.maxHp) * barW));
        g.rect(barX, barY, fillW, barH, c.isBoss ? 3 : 2);
      }

      // ----------------------------------------------------------------------
      // TOWERS RENDERING
      // ----------------------------------------------------------------------
      for (let t of this.towers) {
        const tx = t.x + ox;
        const ty = t.y + oy;
        const arch = TOWER_TYPES[t.type];
        const isSel = (this.selectedTower === t);

        // Tower stone base
        g.rect(tx - 6, ty - 6, 12, 12, 1);
        g.box(tx - 6, ty - 6, 12, 12, isSel ? 3 : 2);

        // Turret mechanics by archetype
        if (t.type === 0) {
          // GATLING: Rotating circular pod with gun barrels
          g.disc(tx, ty, 3, 2);
          const recoilOff = t.recoil > 0 ? -t.recoil : 0;
          const bLen = 8 + recoilOff;
          const cos = Math.cos(t.angle);
          const sin = Math.sin(t.angle);
          g.line(tx, ty, tx + Math.round(cos * bLen), ty + Math.round(sin * bLen), 3);
          if (t.level >= 2) {
            // Twin parallel barrel
            const perpX = -sin * 2;
            const perpY = cos * 2;
            g.line(tx + perpX, ty + perpY, tx + perpX + cos * bLen, ty + perpY + sin * bLen, 3);
          }
        } else if (t.type === 1) {
          // CANNON: Heavy mortar bunker with thick barrel
          g.box(tx - 4, ty - 4, 8, 8, 2);
          const cos = Math.cos(t.angle);
          const sin = Math.sin(t.angle);
          const bLen = 7 - (t.recoil > 0 ? 2 : 0);
          g.line(tx, ty, tx + Math.round(cos * bLen), ty + Math.round(sin * bLen), 3);
          g.disc(tx + Math.round(cos * bLen), ty + Math.round(sin * bLen), 1, 3);
        } else if (t.type === 2) {
          // CRYO: Pulsing crystal obelisk
          const pulse = Math.abs(Math.sin(this.animTimer * 5)) > 0.5 ? 3 : 2;
          g.rect(tx - 2, ty - 2, 4, 4, pulse);
          g.px(tx, ty - 4, 3);
          g.px(tx, ty + 4, 3);
          g.px(tx - 4, ty, 3);
          g.px(tx + 4, ty, 3);
        }

        // Level rank pips
        for (let l = 0; l < t.level; l++) {
          g.px(tx - 3 + l * 3, ty + 5, 3);
        }

        // Highlight ring if currently selected
        if (isSel) {
          const lvl = arch.levels[t.level - 1];
          g.circle(tx, ty, lvl.range, 2);
          g.box(tx - 8, ty - 8, 16, 16, 3);
        }
      }

      // ----------------------------------------------------------------------
      // PROJECTILES & SHOCKWAVES RENDERING
      // ----------------------------------------------------------------------
      for (let p of this.projectiles) {
        // Ground shadow
        const pFrac = Math.min(1, p.t);
        const curGx = p.startX + (p.targetX - p.startX) * pFrac + ox;
        const curGy = p.startY + (p.targetY - p.startY) * pFrac + oy;
        g.disc(Math.round(curGx), Math.round(curGy), 1, 1);

        // Ballistic arcing shell
        const arcY = -Math.sin(pFrac * Math.PI) * 26;
        g.disc(Math.round(curGx), Math.round(curGy + arcY), 2, 3);
      }

      for (let s of this.shockwaves) {
        const sx = s.x + ox;
        const sy = s.y + oy;
        const r = Math.round(s.r);
        if (r > 1) {
          g.circle(sx, sy, r, s.isExplosion ? 3 : 2);
          if (r > 6) {
            g.circle(sx, sy, r - 3, 1);
          }
        }
      }

      // Tracer bullet rays & spark particles
      for (let p of this.particles) {
        if (p.type === 'tracer') {
          g.line(Math.round(p.x0) + ox, Math.round(p.y0) + oy, Math.round(p.x1) + ox, Math.round(p.y1) + oy, p.color);
        } else {
          g.px(Math.round(p.x) + ox, Math.round(p.y) + oy, p.color);
        }
      }

      // Floating combat popups
      for (let pop of this.popups) {
        g.text(pop.text, Math.round(pop.x) + ox, Math.round(pop.y) + oy, pop.color);
      }

      // ----------------------------------------------------------------------
      // PLACEMENT PREVIEW & CURSOR
      // ----------------------------------------------------------------------
      if (this.buildingPlot) {
        const bx = this.buildingPlot.x + ox;
        const by = this.buildingPlot.y + oy;
        const arch = TOWER_TYPES[this.selectedArchetype];
        const lvl = arch.levels[0];

        // Range preview circle
        g.circle(bx, by, lvl.range, 2);
        // Tower silhouette
        g.box(bx - 6, by - 6, 12, 12, 3);
        g.text("$" + arch.cost, bx - 8, by - 14, 3);
      } else if (!this.selectedTower) {
        // D-pad Cursor indicator
        const cx = Math.round(this.curX) + ox;
        const cy = Math.round(this.curY) + oy;
        const canBuild = this.isValidPlot(this.curX, this.curY);
        const col = canBuild ? 3 : 1;

        g.box(cx - 6, cy - 6, 12, 12, col);
        g.px(cx, cy, col);
      }

      // ----------------------------------------------------------------------
      // TOP HUD BAR (Cash, Lives, Wave, Kills, Speed)
      // ----------------------------------------------------------------------
      g.rect(0, 0, 256, 18, 1);
      g.line(0, 18, 256, 18, 2);

      // Cash
      g.text("$" + this.cash, 6, 6, 3);

      // Lives with heart icon
      g.text("♥" + this.lives, 58, 6, this.lives <= 3 ? 3 : 2);

      // Wave indicator
      g.text("WAVE " + this.wave + "/" + this.maxWaves, 102, 6, 3);

      // Speed indicator
      g.text(this.speedMult === 1 ? "1X" : "2X>>", 182, 6, 3);

      // High Score / Kills
      g.textR("K:" + this.kills, 250, 6, 2);

      // ----------------------------------------------------------------------
      // BOTTOM ACTION & TOUCH CONTROL BAR (y: 206..240)
      // ----------------------------------------------------------------------
      g.rect(0, 206, 256, 34, 1);
      g.line(0, 206, 256, 206, 2);

      // CASE 1: EXISTING TOWER SELECTED (Upgrade / Sell Inspector)
      if (this.selectedTower) {
        const t = this.selectedTower;
        const arch = TOWER_TYPES[t.type];
        const curLvl = arch.levels[t.level - 1];

        // Tower info
        g.text(arch.name + " LV." + t.level, 6, 212, 3);
        g.text("RNG:" + curLvl.range + " DMG:" + curLvl.dmg, 6, 222, 2);

        // Upgrade button [A: UPGRADE]
        if (t.level < 3) {
          const upCost = curLvl.upgradeCost;
          const canUp = this.cash >= upCost;
          g.rect(108, 210, 72, 24, canUp ? 2 : 0);
          g.box(108, 210, 72, 24, canUp ? 3 : 1);
          g.text("[A] UPGRADE", 112, 214, canUp ? 3 : 1);
          g.text("$" + upCost, 112, 223, canUp ? 3 : 2);
        } else {
          g.rect(108, 210, 72, 24, 0);
          g.box(108, 210, 72, 24, 2);
          g.text("MAX LEVEL", 116, 218, 2);
        }

        // Sell button [B: SELL]
        const refund = Math.floor(t.invested * 0.70);
        g.rect(184, 210, 64, 24, 0);
        g.box(184, 210, 64, 24, 2);
        g.text("[B] SELL", 192, 214, 3);
        g.text("+$" + refund, 192, 223, 2);
      }

      // CASE 2: GROUND PLOT SELECTED (Build Menu: Gatling, Cannon, Cryo)
      else if (this.buildingPlot) {
        // Option 0: Gatling ($40)
        const s0 = (this.selectedArchetype === 0);
        g.rect(6, 210, 54, 24, s0 ? 2 : 0);
        g.box(6, 210, 54, 24, s0 ? 3 : 2);
        g.text("GATLING", 10, 214, s0 ? 3 : 2);
        g.text("$40", 10, 223, s0 ? 3 : 1);

        // Option 1: Cannon ($65)
        const s1 = (this.selectedArchetype === 1);
        g.rect(64, 210, 54, 24, s1 ? 2 : 0);
        g.box(64, 210, 54, 24, s1 ? 3 : 2);
        g.text("CANNON", 68, 214, s1 ? 3 : 2);
        g.text("$65", 68, 223, s1 ? 3 : 1);

        // Option 2: Cryo ($50)
        const s2 = (this.selectedArchetype === 2);
        g.rect(122, 210, 54, 24, s2 ? 2 : 0);
        g.box(122, 210, 54, 24, s2 ? 3 : 2);
        g.text("CRYO", 126, 214, s2 ? 3 : 2);
        g.text("$50", 126, 223, s2 ? 3 : 1);

        // Cancel button [B: CANCEL]
        g.rect(182, 210, 66, 24, 0);
        g.box(182, 210, 66, 24, 2);
        g.text("[B] CANCEL", 188, 218, 2);
      }

      // CASE 3: DEFAULT IDLE HUD (Start Wave, Fast Forward, Tip)
      else {
        // [START WAVE] Touch Button
        if (!this.waveActive) {
          const cd = Math.ceil(this.waveCountdown);
          g.rect(6, 210, 84, 24, 2);
          g.box(6, 210, 84, 24, 3);
          g.text("START WAVE", 12, 214, 3);
          g.text("AUTO IN " + cd + "S", 12, 223, 2);
        } else {
          g.rect(6, 210, 84, 24, 0);
          g.box(6, 210, 84, 24, 1);
          g.text("DEFENDING", 16, 214, 2);
          g.text("WAVE " + this.wave, 16, 223, 3);
        }

        // [SPEED: 1x / 2x] Touch Button
        g.rect(94, 210, 58, 24, 0);
        g.box(94, 210, 58, 24, 2);
        g.text("SPEED", 102, 214, 2);
        g.text(this.speedMult === 1 ? "[1X] >" : "[2X] >>", 102, 223, 3);

        // Help text / Choke Point tip
        g.text("TAP GROUND OR [A]", 158, 214, 2);
        g.text("TO BUILD DEFENSES", 158, 223, 1);
      }

      // Wave announcement banner overlay
      if (this.bannerTimer > 0) {
        g.rect(40, 96, 176, 20, 0);
        g.box(40, 96, 176, 20, 3);
        g.textC(this.bannerText, 103, 3);
      }

      // ----------------------------------------------------------------------
      // GAME OVER OVERLAY
      // ----------------------------------------------------------------------
      if (this.state === 'OVER') {
        g.dither(0, 0, 256, 240, 0, 1);
        g.rect(32, 70, 192, 100, 0);
        g.box(32, 70, 192, 100, 3);

        g.textC("KINGDOM HAS FALLEN!", 84, 3);
        g.line(48, 96, 208, 96, 2);

        g.textC("SURVIVED " + (this.wave - 1) + " WAVES", 106, 2);
        g.textC("ENEMIES SLAIN: " + this.kills, 120, 2);
        g.textC("BEST RECORD: " + Math.max(this.bestWave, this.wave) + " WAVES", 134, 1);

        const blink = ((this.animTimer * 4) | 0) % 2 === 0;
        if (blink) {
          g.textC("[A] OR TAP TO REBUILD", 152, 3);
        }
      }

      // ----------------------------------------------------------------------
      // VICTORY OVERLAY
      // ----------------------------------------------------------------------
      else if (this.state === 'VICTORY') {
        g.dither(0, 0, 256, 240, 0, 1);
        g.rect(28, 60, 200, 120, 0);
        g.box(28, 60, 200, 120, 3);

        g.textC("★ VICTORY! CITADEL SAVED! ★", 74, 3);
        g.line(44, 86, 212, 86, 2);

        g.textC("ALL 15 INVASION WAVES ROUTED!", 96, 2);
        g.textC("FINAL LIVES: " + this.lives + "/15", 112, 3);
        g.textC("TOTAL BOUNTY: $" + this.cash, 126, 2);
        g.textC("TOTAL INVADERS SLAIN: " + this.kills, 140, 2);

        const blink = ((this.animTimer * 4) | 0) % 2 === 0;
        if (blink) {
          g.textC("[A] OR TAP TO PLAY AGAIN", 160, 3);
        }
      }
    },

    // ------------------------------------------------------------------------
    // PERSISTENCE (SAVE / LOAD)
    // ------------------------------------------------------------------------
    save() {
      return {
        bestWave: Math.max(this.bestWave, this.wave),
        kills: this.kills
      };
    },

    load(data) {
      if (data && typeof data.bestWave === 'number') {
        this.bestWave = Math.max(this.bestWave, data.bestWave);
      }
    }
  };
})();
