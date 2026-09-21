// js/cartridges/cart_043_naval_battle.js
// ============================================================================
// Cartridge #043: NAVAL BATTLE
// Genre: STRATEGY (4) | Turn-Based 8x8 Tactical Battleship Simulation
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[43] = {
  id: 43,
  name: "NAVAL BATTLE",
  genre: 4,
  scoreLabel: "ACCURACY",
  desc: "BATTLESHIP 8X8: HUNT ENEMY FLEET (4-3-2-1). SMART AI HUNTS ADJACENT TILES!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Warship silhouette on ocean waves with radar crosshair and falling artillery shell
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Radar crosshairs & concentric range rings in upper quadrant
    g.circle(x + 10, y + 10, 8, 1);
    g.circle(x + 10, y + 10, 4, 1);
    g.line(x + 10, y + 2, x + 10, y + 18, 1);
    g.line(x + 2, y + 10, x + 18, y + 10, 1);
    // Radar phosphor blip
    g.px(x + 14, y + 7, 3);
    g.px(x + 15, y + 8, 2);

    // Falling artillery shell along ballistic trajectory
    g.line(x + 28, y + 2, x + 25, y + 5, 1);
    g.line(x + 24, y + 6, x + 22, y + 9, 2);
    g.line(x + 21, y + 10, x + 19, y + 13, 3);
    g.px(x + 18, y + 14, 3);
    g.px(x + 19, y + 14, 2);

    // Warship silhouette
    // Waterline hull base
    g.line(x + 5, y + 23, x + 26, y + 23, 2);
    // Raked bow prow (right side)
    g.line(x + 24, y + 20, x + 27, y + 23, 3);
    // Tapered stern (left side)
    g.line(x + 4, y + 23, x + 5, y + 20, 2);
    // Main armor belt hull
    g.rect(x + 5, y + 20, 20, 3, 2);
    g.line(x + 6, y + 20, x + 24, y + 20, 3); // Main deck

    // Bridge Tower & Superstructure
    g.rect(x + 12, y + 15, 6, 5, 2);
    g.rect(x + 14, y + 12, 3, 3, 3); // Conning bridge
    // Radar mast & spar
    g.line(x + 15, y + 8, x + 15, y + 12, 3);
    g.line(x + 13, y + 9, x + 17, y + 9, 3);
    // Smokestack funnel
    g.rect(x + 18, y + 16, 3, 4, 1);
    g.line(x + 18, y + 15, x + 20, y + 15, 2);

    // Forward Turret (elevated dual guns)
    g.rect(x + 20, y + 18, 4, 2, 3);
    g.line(x + 23, y + 18, x + 27, y + 16, 3);
    g.line(x + 23, y + 19, x + 26, y + 17, 2);

    // Aft Gun Turret
    g.rect(x + 7, y + 18, 4, 2, 2);
    g.line(x + 7, y + 18, x + 4, y + 17, 3);

    // Ocean waves with foam crests
    g.line(x + 2, y + 25, x + 6, y + 24, 2);
    g.line(x + 7, y + 25, x + 12, y + 24, 3);
    g.line(x + 13, y + 25, x + 18, y + 24, 2);
    g.line(x + 19, y + 25, x + 24, y + 24, 3);
    g.line(x + 25, y + 25, x + 30, y + 24, 2);
    g.px(x + 11, y + 24, 3);
    g.px(x + 23, y + 24, 3);
    g.line(x + 3, y + 28, x + 14, y + 28, 1);
    g.line(x + 17, y + 28, x + 28, y + 28, 1);
    g.line(x + 6, y + 29, x + 11, y + 29, 2);
    g.line(x + 20, y + 29, x + 25, y + 29, 2);
  },

  // --------------------------------------------------------------------------
  // 2. FLEET SPECIFICATIONS
  // --------------------------------------------------------------------------
  SHIP_DEFS: [
    { id: 'battleship', name: 'BATTLESHIP', code: 'BB', size: 4 },
    { id: 'cruiser',    name: 'CRUISER',    code: 'CA', size: 3 },
    { id: 'destroyer',  name: 'DESTROYER',  code: 'DD', size: 2 },
    { id: 'submarine',  name: 'SUBMARINE',  code: 'SS', size: 1 }
  ],

  // --------------------------------------------------------------------------
  // 3. INITIALIZATION
  // --------------------------------------------------------------------------
  init() {
    // Phase states: 'DEPLOY', 'BATTLE', 'GAME_OVER'
    this.phase = 'DEPLOY';
    // Sub-states: 'PLAYER_AIM', 'PLAYER_SALVO', 'PLAYER_IMPACT', 'AI_THINKING', 'AI_SALVO', 'AI_IMPACT'
    this.battleState = 'PLAYER_AIM';

    // Grids: 8x8
    // Grid values: 0 = Empty water, 1..4 = Ship ID (1-based)
    this.playerGrid = E1.create(8, 8, 0);
    this.aiGrid = E1.create(8, 8, 0);

    // Shots tracking: 0 = unshot, 1 = miss, 2 = hit
    this.playerShots = E1.create(8, 8, 0); // Enemy shots fired on player fleet
    this.aiShots = E1.create(8, 8, 0);     // Player shots fired on enemy fleet

    // Fleet structures
    this.playerShips = this.createFleet();
    this.aiShips = this.createFleet();

    // Deployment cursor
    this.deployIdx = 0; // Current ship being placed: 0..3
    this.deployDir = 0; // 0 = Horizontal, 1 = Vertical
    this.cx = 3;
    this.cy = 3;

    // View toggle: 'RADAR' (Primary = Enemy Waters) or 'FLEET' (Primary = Player Waters)
    this.viewMode = 'RADAR';

    // Statistics
    this.playerShotsCount = 0;
    this.playerHitsCount = 0;
    this.aiShotsCount = 0;
    this.aiHitsCount = 0;
    this.turnCount = 1;
    this.won = false;

    // Animation & FX
    this.sonarAngle = 0;
    this.shake = 0;
    this.particles = [];
    this.salvo = null; // Active artillery projectile
    this.impactTimer = 0;
    this.aiThinkTimer = 0;
    this.bannerText = "";
    this.bannerTimer = 0;

    // AI memory & tracking
    this.aiInit();

    // Auto-generate AI fleet with zero overlaps
    this.generateRandomFleet(this.aiShips, this.aiGrid);
  },

  createFleet() {
    return this.SHIP_DEFS.map(d => ({
      id: d.id,
      name: d.name,
      code: d.code,
      size: d.size,
      cells: [],
      sunk: false
    }));
  },

  // --------------------------------------------------------------------------
  // 4. FLEET PLACEMENT & VALIDATION
  // --------------------------------------------------------------------------
  canPlaceShip(grid, x, y, size, dir) {
    const dx = dir === 0 ? 1 : 0;
    const dy = dir === 1 ? 1 : 0;
    for (let i = 0; i < size; i++) {
      const px = x + i * dx;
      const py = y + i * dy;
      if (px < 0 || px >= 8 || py < 0 || py >= 8) return false;
      if (E1.get(grid, px, py) !== 0) return false;
    }
    return true;
  },

  placeShip(grid, shipObj, x, y, dir, index) {
    const dx = dir === 0 ? 1 : 0;
    const dy = dir === 1 ? 1 : 0;
    shipObj.cells = [];
    shipObj.x = x;
    shipObj.y = y;
    shipObj.dir = dir;
    for (let i = 0; i < shipObj.size; i++) {
      const px = x + i * dx;
      const py = y + i * dy;
      E1.set(grid, px, py, index + 1);
      shipObj.cells.push({ x: px, y: py, hit: false });
    }
  },

  generateRandomFleet(fleetList, grid) {
    let success = false;
    while (!success) {
      for (let i = 0; i < 64; i++) grid.data[i] = 0;
      success = true;
      for (let i = 0; i < fleetList.length; i++) {
        const ship = fleetList[i];
        let placed = false;
        for (let att = 0; att < 250; att++) {
          const dir = Math.random() < 0.5 ? 0 : 1;
          const x = Math.floor(Math.random() * 8);
          const y = Math.floor(Math.random() * 8);
          if (this.canPlaceShip(grid, x, y, ship.size, dir)) {
            this.placeShip(grid, ship, x, y, dir, i);
            placed = true;
            break;
          }
        }
        if (!placed) {
          success = false;
          break;
        }
      }
    }
  },

  autoDeployPlayer() {
    this.generateRandomFleet(this.playerShips, this.playerGrid);
    this.deployIdx = 4; // All ships placed
    this.setBanner("FLEET AUTO-DEPLOYED! READY TO ENGAGE.", 2.5);
    APU.sfx('UI_OK');
  },

  startBattle() {
    this.phase = 'BATTLE';
    this.battleState = 'PLAYER_AIM';
    this.viewMode = 'RADAR';
    this.cx = 3;
    this.cy = 3;
    this.setBanner("BATTLE STATIONS! RADAR ONLINE.", 2.5);
    this.playFoghorn();
    APU.sfx('ALARM');
  },

  // --------------------------------------------------------------------------
  // 5. TOURNAMENT AI: HUNT & TARGET ALGORITHM
  // --------------------------------------------------------------------------
  aiInit() {
    this.aiMode = 'HUNT'; // 'HUNT' | 'TARGET'
    this.aiHits = [];     // Array of hits on unsunk ships: [{ x, y, shipId }]
  },

  aiOnHit(x, y, ship) {
    this.aiHits.push({ x, y, shipId: ship.id });
    if (ship.sunk) {
      // Remove hits belonging to this sunk vessel
      this.aiHits = this.aiHits.filter(h => h.shipId !== ship.id);
      this.aiMode = this.aiHits.length > 0 ? 'TARGET' : 'HUNT';
    } else {
      this.aiMode = 'TARGET';
    }
  },

  aiOnMiss(x, y) {
    // Memory recorded directly on this.playerShots
  },

  aiChooseShot() {
    // Gather all unshot cells from AI's perspective
    const unshot = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (E1.get(this.playerShots, x, y) === 0) {
          unshot.push([x, y]);
        }
      }
    }
    if (unshot.length === 0) return [0, 0];

    // 1. TARGET MODE (orthogonal search & line continuation)
    if (this.aiMode === 'TARGET' && this.aiHits.length > 0) {
      if (this.aiHits.length === 1) {
        // Single hit: investigate orthogonal neighbors (N, S, E, W)
        const h = this.aiHits[0];
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        // Randomize direction exploration
        for (let i = dirs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const tmp = dirs[i]; dirs[i] = dirs[j]; dirs[j] = tmp;
        }
        for (const [dx, dy] of dirs) {
          const nx = h.x + dx, ny = h.y + dy;
          if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && E1.get(this.playerShots, nx, ny) === 0) {
            return [nx, ny];
          }
        }
      } else {
        // 2 or more hits: establish line orientation and fire at endpoints
        const isHorizontal = this.aiHits.every(h => h.y === this.aiHits[0].y);
        const isVertical = this.aiHits.every(h => h.x === this.aiHits[0].x);

        if (isHorizontal) {
          const y = this.aiHits[0].y;
          let minX = 8, maxX = -1;
          for (const h of this.aiHits) {
            if (h.x < minX) minX = h.x;
            if (h.x > maxX) maxX = h.x;
          }
          const candidates = [];
          if (minX - 1 >= 0 && E1.get(this.playerShots, minX - 1, y) === 0) candidates.push([minX - 1, y]);
          if (maxX + 1 < 8 && E1.get(this.playerShots, maxX + 1, y) === 0) candidates.push([maxX + 1, y]);
          if (candidates.length > 0) {
            return candidates[Math.floor(Math.random() * candidates.length)];
          }
        } else if (isVertical) {
          const x = this.aiHits[0].x;
          let minY = 8, maxY = -1;
          for (const h of this.aiHits) {
            if (h.y < minY) minY = h.y;
            if (h.y > maxY) maxY = h.y;
          }
          const candidates = [];
          if (minY - 1 >= 0 && E1.get(this.playerShots, x, minY - 1) === 0) candidates.push([x, minY - 1]);
          if (maxY + 1 < 8 && E1.get(this.playerShots, x, maxY + 1) === 0) candidates.push([x, maxY + 1]);
          if (candidates.length > 0) {
            return candidates[Math.floor(Math.random() * candidates.length)];
          }
        }

        // Fallback for adjacent non-collinear targets: probe all adjacent unshot tiles
        for (const h of this.aiHits) {
          const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
          for (const [dx, dy] of dirs) {
            const nx = h.x + dx, ny = h.y + dy;
            if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && E1.get(this.playerShots, nx, ny) === 0) {
              return [nx, ny];
            }
          }
        }
      }
    }

    // 2. HUNT MODE (Parity / Heatmap search)
    const diff = typeof VOS !== 'undefined' ? VOS.difficulty : 1;

    if (diff === 0) {
      // EASY: Random hunting
      return unshot[Math.floor(Math.random() * unshot.length)];
    }

    const unsunkShips = this.playerShips.filter(s => !s.sunk);
    const minSize = unsunkShips.length > 0 ? Math.min(...unsunkShips.map(s => s.size)) : 1;

    if (diff === 2) {
      // HARD: Probability Density Heatmap
      const heat = new Array(64).fill(0);
      for (const ship of unsunkShips) {
        const sz = ship.size;
        // Horizontal fits
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x <= 8 - sz; x++) {
            let legal = true;
            for (let k = 0; k < sz; k++) {
              if (E1.get(this.playerShots, x + k, y) === 1) { legal = false; break; }
            }
            if (legal) {
              for (let k = 0; k < sz; k++) {
                if (E1.get(this.playerShots, x + k, y) === 0) {
                  heat[y * 8 + (x + k)]++;
                }
              }
            }
          }
        }
        // Vertical fits
        for (let x = 0; x < 8; x++) {
          for (let y = 0; y <= 8 - sz; y++) {
            let legal = true;
            for (let k = 0; k < sz; k++) {
              if (E1.get(this.playerShots, x, y + k) === 1) { legal = false; break; }
            }
            if (legal) {
              for (let k = 0; k < sz; k++) {
                if (E1.get(this.playerShots, x, y + k) === 0) {
                  heat[(y + k) * 8 + x]++;
                }
              }
            }
          }
        }
      }

      let bestHeat = -1;
      let topCells = [];
      for (const [x, y] of unshot) {
        const val = heat[y * 8 + x];
        if (val > bestHeat) {
          bestHeat = val;
          topCells = [[x, y]];
        } else if (val === bestHeat) {
          topCells.push([x, y]);
        }
      }
      if (topCells.length > 0 && bestHeat > 0) {
        return topCells[Math.floor(Math.random() * topCells.length)];
      }
    }

    // NORMAL: Checkerboard Parity Hunt
    const parityList = unshot.filter(([x, y]) => (x + y) % 2 === 0);
    if (parityList.length > 0 && minSize >= 2) {
      // Favor central radar waters
      parityList.sort((a, b) => {
        const distA = Math.abs(a[0] - 3.5) + Math.abs(a[1] - 3.5);
        const distB = Math.abs(b[0] - 3.5) + Math.abs(b[1] - 3.5);
        return (distA - distB) + (Math.random() - 0.5);
      });
      return parityList[0];
    }

    // Fallback
    return unshot[Math.floor(Math.random() * unshot.length)];
  },

  // --------------------------------------------------------------------------
  // 6. SALVO LAUNCH & IMPACT
  // --------------------------------------------------------------------------
  firePlayerSalvo() {
    if (this.phase !== 'BATTLE' || this.battleState !== 'PLAYER_AIM') return;
    if (this.viewMode === 'FLEET') {
      this.viewMode = 'RADAR';
      APU.sfx('UI_MOVE');
      return;
    }

    const x = this.cx, y = this.cy;
    if (E1.get(this.aiShots, x, y) !== 0) {
      APU.sfx('DENY');
      this.setBanner("TILE ALREADY TARGETED!", 1.2);
      return;
    }

    this.playerShotsCount++;
    this.battleState = 'PLAYER_SALVO';
    APU.sfx('SWISH');

    const ox = 16, oy = 26, sz = 17;
    this.salvo = {
      source: 'PLAYER',
      gx: x,
      gy: y,
      startX: ox + x * sz + 8,
      startY: 235,
      targetX: ox + x * sz + 8,
      targetY: oy + y * sz + 8,
      t: 0,
      dur: 0.32
    };
  },

  resolvePlayerImpact(x, y) {
    const ox = 16, oy = 26, sz = 17;
    const px = ox + x * sz + 8;
    const py = oy + y * sz + 8;
    const hitVal = E1.get(this.aiGrid, x, y);

    if (hitVal > 0) {
      // HIT!
      this.playerHitsCount++;
      E1.set(this.aiShots, x, y, 2);
      const ship = this.aiShips[hitVal - 1];
      const seg = ship.cells.find(c => c.x === x && c.y === y);
      if (seg) seg.hit = true;

      this.spawnExplosion(px, py);
      this.shake = 8;
      APU.sfx('BOOM');

      if (ship.cells.every(c => c.hit)) {
        ship.sunk = true;
        this.playFoghorn();
        APU.sfx('ALARM');
        this.setBanner(ship.name + " SUNK!", 2.2);
      } else {
        this.setBanner("DIRECT HIT ON TARGET!", 1.2);
      }

      // Check Victory
      if (this.aiShips.every(s => s.sunk)) {
        this.phase = 'GAME_OVER';
        this.won = true;
        const acc = Math.floor((this.playerHitsCount / this.playerShotsCount) * 100);
        SAVE.setScore(this.id, acc);
        APU.sfx('LEVELUP');
        return;
      }
    } else {
      // MISS!
      E1.set(this.aiShots, x, y, 1);
      this.spawnSplash(px, py);
      APU.sfx('SPLASH');
      this.setBanner("SPLASH! WATER ONLY.", 1.0);
    }

    this.impactTimer = 0.45;
    this.battleState = 'PLAYER_IMPACT';
  },

  fireAiSalvo() {
    const [ax, ay] = this.aiChooseShot();
    this.aiShotsCount++;
    this.battleState = 'AI_SALVO';
    APU.sfx('SWISH');

    let tx, ty;
    if (this.viewMode === 'FLEET') {
      tx = 16 + ax * 17 + 8;
      ty = 26 + ay * 17 + 8;
    } else {
      tx = 176 + ax * 7 + 3;
      ty = 28 + ay * 7 + 3;
    }

    this.salvo = {
      source: 'AI',
      gx: ax,
      gy: ay,
      startX: tx + 20,
      startY: 5,
      targetX: tx,
      targetY: ty,
      t: 0,
      dur: 0.32
    };
  },

  resolveAiImpact(x, y) {
    let px, py;
    if (this.viewMode === 'FLEET') {
      px = 16 + x * 17 + 8;
      py = 26 + y * 17 + 8;
    } else {
      px = 176 + x * 7 + 3;
      py = 28 + y * 7 + 3;
    }

    const hitVal = E1.get(this.playerGrid, x, y);

    if (hitVal > 0) {
      // Player ship hit!
      this.aiHitsCount++;
      E1.set(this.playerShots, x, y, 2);
      const ship = this.playerShips[hitVal - 1];
      const seg = ship.cells.find(c => c.x === x && c.y === y);
      if (seg) seg.hit = true;

      this.spawnExplosion(px, py);
      this.shake = 8;
      APU.sfx('BOOM');
      this.aiOnHit(x, y, ship);

      if (ship.cells.every(c => c.hit)) {
        ship.sunk = true;
        this.playFoghorn();
        APU.sfx('ALARM');
        this.setBanner("WARNING: OUR " + ship.name + " SUNK!", 2.2);
      } else {
        this.setBanner("WARNING: HULL BREACHED!", 1.2);
      }

      // Check Defeat
      if (this.playerShips.every(s => s.sunk)) {
        this.phase = 'GAME_OVER';
        this.won = false;
        APU.sfx('BOOM');
        return;
      }
    } else {
      // Missed player
      E1.set(this.playerShots, x, y, 1);
      this.spawnSplash(px, py);
      APU.sfx('SPLASH');
      this.aiOnMiss(x, y);
      this.setBanner("ENEMY SALVO MISSED!", 1.0);
    }

    this.impactTimer = 0.45;
    this.battleState = 'AI_IMPACT';
  },

  // --------------------------------------------------------------------------
  // 7. PARTICLES, SFX & AUDIO
  // --------------------------------------------------------------------------
  spawnExplosion(x, y) {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 20 + Math.random() * 55;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.2 + Math.random() * 0.35,
        maxLife: 0.5,
        color: Math.random() < 0.6 ? 3 : 2,
        size: Math.random() < 0.5 ? 2 : 1,
        gravity: 30
      });
    }
  },

  spawnSplash(x, y) {
    for (let i = 0; i < 14; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const spd = 30 + Math.random() * 60;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.25 + Math.random() * 0.3,
        maxLife: 0.55,
        color: Math.random() < 0.5 ? 3 : 2,
        size: 1,
        gravity: 120
      });
    }
  },

  playFoghorn() {
    APU.tone(82.4, 0.55, 'sawtooth', 0.16);
    APU.tone(123.5, 0.65, 'triangle', 0.14);
  },

  setBanner(txt, dur = 2.0) {
    this.bannerText = txt;
    this.bannerTimer = dur;
  },

  // --------------------------------------------------------------------------
  // 8. GAMEPLAY LIFECYCLE: UPDATE(dt)
  // --------------------------------------------------------------------------
  update(dt) {
    // Sonar radar sweep line rotation
    this.sonarAngle = (this.sonarAngle + dt * 2.2) % (Math.PI * 2);

    // Screen shake decay
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 18);
    }

    // Banner message decay
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
    }

    // Particle physics updates
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Tap coordinate check helper
    const tap = PAD.tapPos;
    const inBox = (x, y, w, h) => tap && tap.x >= x && tap.x < x + w && tap.y >= y && tap.y < y + h;

    // ------------------------------------------------------------------------
    // PHASE: DEPLOYMENT
    // ------------------------------------------------------------------------
    if (this.phase === 'DEPLOY') {
      if (PAD.hit('left'))  { this.cx = Math.max(0, this.cx - 1); APU.sfx('UI_MOVE'); }
      if (PAD.hit('right')) { this.cx = Math.min(7, this.cx + 1); APU.sfx('UI_MOVE'); }
      if (PAD.hit('up'))    { this.cy = Math.max(0, this.cy - 1); APU.sfx('UI_MOVE'); }
      if (PAD.hit('down'))  { this.cy = Math.min(7, this.cy + 1); APU.sfx('UI_MOVE'); }

      // Rotate ship [B] or button
      if (PAD.hit('b') || inBox(134, 184, 110, 22)) {
        this.deployDir = 1 - this.deployDir;
        APU.sfx('UI_MOVE');
      }

      // Auto-deploy [Select] or button
      if (PAD.hit('select') || inBox(12, 184, 110, 22)) {
        this.autoDeployPlayer();
      }

      // Launch battle button (when all 4 placed)
      if (this.deployIdx >= 4) {
        if (PAD.hit('a') || PAD.hit('start') || inBox(48, 210, 160, 24)) {
          this.startBattle();
          return;
        }
      }

      // Main grid tap handling
      const ox = 16, oy = 26, sz = 17;
      if (tap && tap.x >= ox && tap.x < ox + 136 && tap.y >= oy && tap.y < oy + 136) {
        const tx = Math.floor((tap.x - ox) / sz);
        const ty = Math.floor((tap.y - oy) / sz);
        if (tx === this.cx && ty === this.cy && this.deployIdx < 4) {
          // Double-tap or tap on selected cell: place ship
          this.tryPlaceCurrentShip();
        } else {
          this.cx = tx;
          this.cy = ty;
          APU.sfx('UI_MOVE');
        }
      }

      // [A] key placement
      if (PAD.hit('a') && this.deployIdx < 4) {
        this.tryPlaceCurrentShip();
      }
      return;
    }

    // ------------------------------------------------------------------------
    // PHASE: BATTLE
    // ------------------------------------------------------------------------
    if (this.phase === 'BATTLE') {
      // Toggle view between Radar and Fleet ([B] key or Mini-Map tap or button)
      if (PAD.hit('b') || inBox(134, 186, 110, 22) || inBox(174, 27, 60, 60)) {
        this.viewMode = this.viewMode === 'RADAR' ? 'FLEET' : 'RADAR';
        APU.sfx('UI_MOVE');
      }

      // Sub-state: PLAYER AIMING
      if (this.battleState === 'PLAYER_AIM') {
        if (PAD.hit('left'))  { this.cx = Math.max(0, this.cx - 1); APU.sfx('UI_MOVE'); }
        if (PAD.hit('right')) { this.cx = Math.min(7, this.cx + 1); APU.sfx('UI_MOVE'); }
        if (PAD.hit('up'))    { this.cy = Math.max(0, this.cy - 1); APU.sfx('UI_MOVE'); }
        if (PAD.hit('down'))  { this.cy = Math.min(7, this.cy + 1); APU.sfx('UI_MOVE'); }

        // Direct tap on radar grid fires immediately at targeted coordinate!
        const ox = 16, oy = 26, sz = 17;
        if (tap && tap.x >= ox && tap.x < ox + 136 && tap.y >= oy && tap.y < oy + 136) {
          this.cx = Math.floor((tap.x - ox) / sz);
          this.cy = Math.floor((tap.y - oy) / sz);
          if (this.viewMode === 'FLEET') {
            this.viewMode = 'RADAR';
            APU.sfx('UI_MOVE');
          } else {
            this.firePlayerSalvo();
          }
        }

        // Fire salvo [A] key or [FIRE] button
        if (PAD.hit('a') || inBox(12, 186, 110, 22)) {
          this.firePlayerSalvo();
        }
      }

      // Sub-state: PLAYER SALVO IN FLIGHT
      else if (this.battleState === 'PLAYER_SALVO') {
        if (this.salvo) {
          this.salvo.t += dt;
          if (this.salvo.t >= this.salvo.dur) {
            const gx = this.salvo.gx, gy = this.salvo.gy;
            this.salvo = null;
            this.resolvePlayerImpact(gx, gy);
          }
        }
      }

      // Sub-state: PLAYER IMPACT FX
      else if (this.battleState === 'PLAYER_IMPACT') {
        this.impactTimer -= dt;
        if (this.impactTimer <= 0) {
          if (this.phase === 'BATTLE') {
            const diff = typeof VOS !== 'undefined' ? VOS.difficulty : 1;
            this.aiThinkTimer = diff === 2 ? 0.35 : (diff === 0 ? 0.75 : 0.5);
            this.battleState = 'AI_THINKING';
          }
        }
      }

      // Sub-state: AI THINKING / TARGETING
      else if (this.battleState === 'AI_THINKING') {
        this.aiThinkTimer -= dt;
        if (this.aiThinkTimer <= 0) {
          this.fireAiSalvo();
        }
      }

      // Sub-state: AI SALVO IN FLIGHT
      else if (this.battleState === 'AI_SALVO') {
        if (this.salvo) {
          this.salvo.t += dt;
          if (this.salvo.t >= this.salvo.dur) {
            const gx = this.salvo.gx, gy = this.salvo.gy;
            this.salvo = null;
            this.resolveAiImpact(gx, gy);
          }
        }
      }

      // Sub-state: AI IMPACT FX
      else if (this.battleState === 'AI_IMPACT') {
        this.impactTimer -= dt;
        if (this.impactTimer <= 0) {
          if (this.phase === 'BATTLE') {
            this.turnCount++;
            this.battleState = 'PLAYER_AIM';
          }
        }
      }
      return;
    }

    // ------------------------------------------------------------------------
    // PHASE: GAME OVER
    // ------------------------------------------------------------------------
    if (this.phase === 'GAME_OVER') {
      if (PAD.hit('a') || PAD.hit('start') || tap) {
        this.init();
        APU.sfx('UI_OK');
      }
    }
  },

  tryPlaceCurrentShip() {
    const ship = this.playerShips[this.deployIdx];
    if (this.canPlaceShip(this.playerGrid, this.cx, this.cy, ship.size, this.deployDir)) {
      this.placeShip(this.playerGrid, ship, this.cx, this.cy, this.deployDir, this.deployIdx);
      this.deployIdx++;
      APU.sfx('UI_OK');
      if (this.deployIdx >= 4) {
        this.setBanner("ALL SHIPS PLACED! PRESS [A] TO BATTLE.", 3.0);
      }
    } else {
      APU.sfx('DENY');
      this.setBanner("OBSTRUCTED! CANNOT PLACE SHIP.", 1.2);
    }
  },

  // --------------------------------------------------------------------------
  // 9. GRAPHICS RENDERING: RENDER(g)
  // --------------------------------------------------------------------------
  render(g) {
    // Screen shake camera offset
    let offX = 0, offY = 0;
    if (this.shake > 0) {
      offX = Math.round((Math.random() - 0.5) * this.shake);
      offY = Math.round((Math.random() - 0.5) * this.shake);
    }

    g.clear(0);

    // 1. TOP HEADER BAR
    g.rect(0, 0, 256, 18, 1);
    g.line(0, 18, 256, 18, 2);
    g.text("NAVAL BATTLE", 6 + offX, 6 + offY, 3);

    // Phase / Turn subtitle
    if (this.phase === 'DEPLOY') {
      g.text("DEPLOY FLEET", 96 + offX, 6 + offY, 3);
    } else if (this.phase === 'BATTLE') {
      if (this.battleState === 'PLAYER_AIM' || this.battleState === 'PLAYER_SALVO') {
        g.text("ADMIRAL'S SALVO", 88 + offX, 6 + offY, 3);
      } else {
        g.text("ENEMY FIRING...", 92 + offX, 6 + offY, 2);
      }
    } else {
      g.text(this.won ? "VICTORY!" : "FLEET SUNK", 98 + offX, 6 + offY, this.won ? 3 : 2);
    }

    // Console Difficulty badge
    const diffNames = ['EASY', 'NORM', 'HARD'];
    const diff = typeof VOS !== 'undefined' ? VOS.difficulty : 1;
    g.text(diffNames[diff] || 'NORM', 222 + offX, 6 + offY, 2);

    // 2. MAIN 8X8 RADAR / FLEET GRID (LEFT SIDE)
    const ox = 16 + offX;
    const oy = 26 + offY;
    const sz = 17;

    // Grid Coordinates (Letters A..H, Numbers 1..8)
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    for (let i = 0; i < 8; i++) {
      g.text(letters[i], ox + i * sz + 6, oy - 7, 2);
      g.text(String(i + 1), ox - 8, oy + i * sz + 6, 2);
    }

    // Grid Background & Sonar Sweep Circle
    g.rect(ox, oy, 136, 136, 0);
    const rcx = ox + 68, rcy = oy + 68;
    g.circle(rcx, rcy, 22, 1);
    g.circle(rcx, rcy, 44, 1);
    g.circle(rcx, rcy, 66, 1);
    g.line(ox, rcy, ox + 136, rcy, 1);
    g.line(rcx, oy, rcx, oy + 136, 1);

    // Sonar Phosphor Sweep Line (active in Radar view)
    if (this.viewMode === 'RADAR' && this.phase !== 'DEPLOY') {
      const slx = rcx + Math.cos(this.sonarAngle) * 66;
      const sly = rcy + Math.sin(this.sonarAngle) * 66;
      g.line(rcx, rcy, Math.round(slx), Math.round(sly), 2);
    }

    // Grid cell frames
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        g.box(ox + x * sz, oy + y * sz, sz + 1, sz + 1, 1);
      }
    }

    // Render Grid Content
    if (this.phase === 'DEPLOY') {
      this.renderPlayerDeploymentGrid(g, ox, oy, sz);
    } else if (this.viewMode === 'RADAR') {
      this.renderEnemyRadarGrid(g, ox, oy, sz);
    } else {
      this.renderPlayerFleetDefenseGrid(g, ox, oy, sz);
    }

    // 3. RIGHT COLUMN: MINI-MAP & FLEET HUD
    this.renderTacticalSidePanel(g, offX, offY);

    // 4. ARTILLERY SALVO TRAJECTORY & PARTICLES
    this.renderSalvoAndParticles(g);

    // 5. BOTTOM TACTICAL BANNER & TOUCH CONTROLS
    this.renderBottomHUD(g, offX, offY);

    // 6. GAME OVER OVERLAY
    if (this.phase === 'GAME_OVER') {
      this.renderGameOverModal(g);
    }
  },

  renderPlayerDeploymentGrid(g, ox, oy, sz) {
    // Render placed player ships
    for (const ship of this.playerShips) {
      if (ship.cells.length > 0) {
        for (const cell of ship.cells) {
          const bx = ox + cell.x * sz;
          const by = oy + cell.y * sz;
          g.rect(bx + 2, by + 2, sz - 3, sz - 3, 2);
          g.box(bx + 1, by + 1, sz - 1, sz - 1, 3);
          g.text(ship.code, bx + 3, by + 6, 0);
        }
      }
    }

    // Render Ghost placement preview
    if (this.deployIdx < 4) {
      const ship = this.SHIP_DEFS[this.deployIdx];
      const valid = this.canPlaceShip(this.playerGrid, this.cx, this.cy, ship.size, this.deployDir);
      const dx = this.deployDir === 0 ? 1 : 0;
      const dy = this.deployDir === 1 ? 1 : 0;

      for (let i = 0; i < ship.size; i++) {
        const px = this.cx + i * dx;
        const py = this.cy + i * dy;
        if (px >= 0 && px < 8 && py >= 0 && py < 8) {
          const bx = ox + px * sz;
          const by = oy + py * sz;
          if (valid) {
            g.box(bx + 2, by + 2, sz - 3, sz - 3, 3);
            g.text(ship.code, bx + 3, by + 6, 3);
          } else {
            g.dither(bx + 2, by + 2, sz - 3, sz - 3, 0, 1);
            g.line(bx + 3, by + 3, bx + sz - 4, by + sz - 4, 2);
            g.line(bx + sz - 4, by + 3, bx + 3, by + sz - 4, 2);
          }
        }
      }
    }
  },

  renderEnemyRadarGrid(g, ox, oy, sz) {
    // Render enemy waters based on player's shots
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const st = E1.get(this.aiShots, x, y);
        const bx = ox + x * sz;
        const by = oy + y * sz;

        if (st === 1) {
          // Miss: Water Splash Peg
          g.text("·", bx + 6, by + 5, 2);
        } else if (st === 2) {
          // Hit: Fiery pin
          const shipVal = E1.get(this.aiGrid, x, y);
          const ship = shipVal > 0 ? this.aiShips[shipVal - 1] : null;
          if (ship && ship.sunk) {
            g.rect(bx + 2, by + 2, sz - 3, sz - 3, 1);
          }
          g.line(bx + 4, by + 4, bx + sz - 5, by + sz - 5, 3);
          g.line(bx + sz - 5, by + 4, bx + 4, by + sz - 5, 3);
          g.px(bx + 8, by + 8, 3);
        }
      }
    }

    // Active crosshair reticle (ADMIRAL'S AIM)
    if (this.battleState === 'PLAYER_AIM') {
      const bx = ox + this.cx * sz;
      const by = oy + this.cy * sz;

      // 4 corner military brackets
      g.line(bx, by, bx + 4, by, 3);
      g.line(bx, by, bx, by + 4, 3);
      g.line(bx + sz, by, bx + sz - 4, by, 3);
      g.line(bx + sz, by, bx + sz, by + 4, 3);
      g.line(bx, by + sz, bx + 4, by + sz, 3);
      g.line(bx, by + sz, bx, by + sz - 4, 3);
      g.line(bx + sz, by + sz, bx + sz - 4, by + sz, 3);
      g.line(bx + sz, by + sz, bx + sz, by + sz - 4, 3);
      g.px(bx + 8, by + 8, 3);
    }
  },

  renderPlayerFleetDefenseGrid(g, ox, oy, sz) {
    // Render full-sized view of player fleet
    for (const ship of this.playerShips) {
      for (const cell of ship.cells) {
        const bx = ox + cell.x * sz;
        const by = oy + cell.y * sz;
        g.rect(bx + 2, by + 2, sz - 3, sz - 3, ship.sunk ? 1 : 2);
        g.box(bx + 1, by + 1, sz - 1, sz - 1, ship.sunk ? 2 : 3);
        g.text(ship.code, bx + 3, by + 6, ship.sunk ? 2 : 0);

        if (cell.hit) {
          g.line(bx + 3, by + 3, bx + sz - 4, by + sz - 4, 3);
          g.line(bx + sz - 4, by + 3, bx + 3, by + sz - 4, 3);
        }
      }
    }

    // Enemy misses on player water
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (E1.get(this.playerShots, x, y) === 1) {
          const bx = ox + x * sz;
          const by = oy + y * sz;
          g.text("·", bx + 6, by + 5, 2);
        }
      }
    }
  },

  renderTacticalSidePanel(g, offX, offY) {
    const px = 162 + offX;

    // Mini-map title
    if (this.viewMode === 'RADAR') {
      g.text("FLEET DEFENSE", px + 2, 19 + offY, 2);
    } else {
      g.text("ENEMY RADAR", px + 4, 19 + offY, 2);
    }

    // Mini-Map Grid (64x64)
    const mx = 174 + offX;
    const my = 27 + offY;
    const msz = 7;
    g.rect(mx, my, 56, 56, 0);
    g.box(mx - 1, my - 1, 58, 58, 2);

    if (this.viewMode === 'RADAR') {
      // Mini-map shows Player Fleet
      for (const ship of this.playerShips) {
        for (const cell of ship.cells) {
          const bx = mx + cell.x * msz;
          const by = my + cell.y * msz;
          g.rect(bx + 1, by + 1, msz - 1, msz - 1, cell.hit ? 3 : 2);
        }
      }
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          if (E1.get(this.playerShots, x, y) === 1) {
            g.px(mx + x * msz + 3, my + y * msz + 3, 1);
          }
        }
      }
    } else {
      // Mini-map shows Enemy Waters
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const st = E1.get(this.aiShots, x, y);
          if (st === 1) g.px(mx + x * msz + 3, my + y * msz + 3, 1);
          if (st === 2) g.rect(mx + x * msz + 1, my + y * msz + 1, msz - 1, msz - 1, 3);
        }
      }
    }

    // FLEET STATUS HUD: Silhouettes & Live Health Pips
    g.text("FLEET STATUS", px + 6, 88 + offY, 2);
    g.text("YOU", px + 26, 96 + offY, 1);
    g.text("FOE", px + 58, 96 + offY, 1);

    const hudShips = [
      { code: "BB", size: 4, pShip: this.playerShips[0], eShip: this.aiShips[0] },
      { code: "CA", size: 3, pShip: this.playerShips[1], eShip: this.aiShips[1] },
      { code: "DD", size: 2, pShip: this.playerShips[2], eShip: this.aiShips[2] },
      { code: "SS", size: 1, pShip: this.playerShips[3], eShip: this.aiShips[3] }
    ];

    hudShips.forEach((s, idx) => {
      const sy = 104 + idx * 9 + offY;
      g.text(s.code, px + 2, sy, s.pShip && s.pShip.sunk ? 1 : 3);

      // Player pips
      for (let i = 0; i < s.size; i++) {
        const pipHit = s.pShip && s.pShip.cells[i] ? s.pShip.cells[i].hit : false;
        const pipX = px + 22 + i * 5;
        if (pipHit) {
          g.box(pipX, sy + 1, 3, 4, 1);
        } else {
          g.rect(pipX, sy + 1, 4, 4, 3);
        }
      }

      // Enemy pips
      for (let i = 0; i < s.size; i++) {
        const pipHit = s.eShip && s.eShip.cells[i] ? s.eShip.cells[i].hit : false;
        const pipX = px + 54 + i * 5;
        if (pipHit) {
          g.box(pipX, sy + 1, 3, 4, 1);
        } else {
          g.rect(pipX, sy + 1, 4, 4, 2);
        }
      }
    });

    // Accuracy & Turn stats
    const acc = this.playerShotsCount > 0 ? Math.floor((this.playerHitsCount / this.playerShotsCount) * 100) : 0;
    g.text("SHOTS:" + this.playerShotsCount, px + 4, 142 + offY, 2);
    g.text("HITS: " + this.playerHitsCount + "/10", px + 4, 150 + offY, 2);
    g.text("ACC:  " + acc + "%", px + 4, 158 + offY, 3);
  },

  renderSalvoAndParticles(g) {
    // Artillery projectile trajectory
    if (this.salvo) {
      const p = Math.min(1.0, this.salvo.t / this.salvo.dur);
      const arcHeight = 55;
      const curX = this.salvo.startX + (this.salvo.targetX - this.salvo.startX) * p;
      const curY = this.salvo.startY + (this.salvo.targetY - this.salvo.startY) * p - Math.sin(p * Math.PI) * arcHeight;

      // Tracer contrail dots
      for (let i = 1; i <= 3; i++) {
        const tp = Math.max(0, p - i * 0.05);
        const tx = this.salvo.startX + (this.salvo.targetX - this.salvo.startX) * tp;
        const ty = this.salvo.startY + (this.salvo.targetY - this.salvo.startY) * tp - Math.sin(tp * Math.PI) * arcHeight;
        g.px(Math.round(tx), Math.round(ty), 2);
      }

      // Artillery shell projectile
      g.disc(Math.round(curX), Math.round(curY), 2, 3);
    }

    // Explosions and Water Geyser particles
    for (const p of this.particles) {
      if (p.size >= 2) {
        g.disc(Math.round(p.x), Math.round(p.y), 1, p.color);
      } else {
        g.px(Math.round(p.x), Math.round(p.y), p.color);
      }
    }
  },

  renderBottomHUD(g, offX, offY) {
    g.line(0, 168 + offY, 256, 168 + offY, 2);

    // Event Ticker Banner
    if (this.bannerTimer > 0) {
      g.textC(this.bannerText, 172 + offY, 3);
    } else {
      if (this.phase === 'DEPLOY') {
        const cur = this.deployIdx < 4 ? this.SHIP_DEFS[this.deployIdx].name : "FLEET READY";
        g.textC("SELECTING: " + cur + " | [B] ROTATE", 172 + offY, 2);
      } else {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        g.textC("TARGET LOC: " + letters[this.cx] + "-" + (this.cy + 1) + " | FLEET READY", 172 + offY, 2);
      }
    }

    // Touch and Controls Interface
    if (this.phase === 'DEPLOY') {
      // Button 1: AUTO DEPLOY
      g.rect(12, 184, 110, 22, 1);
      g.box(12, 184, 110, 22, 3);
      g.textC("[AUTO DEPLOY]", 191, 3);

      // Button 2: ROTATE
      g.rect(134, 184, 110, 22, 1);
      g.box(134, 184, 110, 22, 2);
      g.textC("[B] ROTATE DIR", 191, 3);

      if (this.deployIdx >= 4) {
        g.rect(48, 210, 160, 24, 2);
        g.box(48, 210, 160, 24, 3);
        g.textC("[A] LAUNCH BATTLE!", 218, 3);
      } else {
        g.textC("[A] PLACE SHIP   [SELECT] AUTO", 212 + offY, 2);
        g.textC("TAP RADAR GRID CELL TO PLACE", 222 + offY, 1);
      }
    } else if (this.phase === 'BATTLE') {
      // Button 1: FIRE SALVO
      const isFireReady = this.battleState === 'PLAYER_AIM';
      g.rect(12, 186, 110, 22, isFireReady ? 2 : 1);
      g.box(12, 186, 110, 22, isFireReady ? 3 : 2);
      g.textC("[A] FIRE SALVO", 193, isFireReady ? 3 : 1);

      // Button 2: TOGGLE FLEET/RADAR VIEW
      g.rect(134, 186, 110, 22, 1);
      g.box(134, 186, 110, 22, 2);
      const vText = this.viewMode === 'RADAR' ? "[VIEW FLEET]" : "[VIEW RADAR]";
      g.textC(vText, 193, 3);

      g.textC("[D-PAD] AIM   [A] FIRE   [B] FLEET TOGGLE", 214 + offY, 2);
      g.textC("DIRECT TAP ON RADAR GRID TO FIRE", 224 + offY, 1);
    }
  },

  renderGameOverModal(g) {
    // Backdrop shadow box
    g.rect(24, 48, 208, 140, 0);
    g.box(24, 48, 208, 140, 3);
    g.box(26, 50, 204, 136, 1);

    if (this.won) {
      g.textC("★ VICTORY! ENEMY FLEET SUNK! ★", 60, 3);
    } else {
      g.textC("! DEFEAT: FLEET ANNIHILATED !", 60, 2);
    }

    const acc = this.playerShotsCount > 0 ? Math.floor((this.playerHitsCount / this.playerShotsCount) * 100) : 0;
    const best = SAVE.getScore(this.id);

    g.textC("TOTAL TURNS: " + this.turnCount, 80, 2);
    g.textC("FINAL ACCURACY: " + acc + "%", 94, 3);
    g.textC("HIGH ACCURACY:  " + best + "%", 108, 2);
    g.textC("ENEMY SHOTS: " + this.aiShotsCount + " (" + this.aiHitsCount + " HITS)", 122, 1);

    // Replay Button
    g.rect(48, 142, 160, 24, 1);
    g.box(48, 142, 160, 24, 3);
    g.textC("[A] PLAY AGAIN / TAP", 150, 3);
  }
};
