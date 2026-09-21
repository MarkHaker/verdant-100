// js/cartridges/cart_049_micro_4x.js
// ============================================================================
// Cartridge #049: MICRO-4X
// Genre: STRATEGY (4) | 25-Turn Pocket 4X Space Empire Strategy
// eXplore star systems, eXpand colonies, eXploit resources, eXterminate rivals!
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[49] = {
  id: 49,
  name: "MICRO-4X",
  genre: 4,
  scoreLabel: "EMPIRE",
  desc: "25-TURN POCKET 4X: EXPLORE STAR SYSTEMS, COLONIZE WORLDS, AND CRUSH RIVALS!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Central sun with planetary orbit ring, starship cruiser in orbit, and hyperlane link
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);

    // Distant background stars
    g.px(x + 5, y + 6, 1);
    g.px(x + 26, y + 7, 1);
    g.px(x + 7, y + 25, 1);
    g.px(x + 27, y + 24, 2);

    // Hyperlane connection link to bottom-left outer star node
    g.line(x + 16, y + 16, x + 6, y + 26, 1);
    g.disc(x + 6, y + 26, 2, 2);
    g.px(x + 6, y + 26, 3);

    // Planetary elliptical orbit ring
    for (let a = 0; a < Math.PI * 2; a += 0.22) {
      const rx = Math.round(x + 16 + Math.cos(a) * 11);
      const ry = Math.round(y + 16 + Math.sin(a) * 6);
      if ((Math.floor(a * 4)) % 2 === 0) g.px(rx, ry, 1);
    }

    // Central Sun (glowing star core)
    g.disc(x + 16, y + 16, 4, 3);
    g.circle(x + 16, y + 16, 5, 2);
    g.px(x + 16, y + 10, 2);
    g.px(x + 16, y + 22, 2);
    g.px(x + 10, y + 16, 2);
    g.px(x + 22, y + 16, 2);

    // Orbiting world
    g.disc(x + 25, y + 14, 2, 2);
    g.px(x + 25, y + 13, 3);

    // Starship Cruiser in orbit (facing forward-left)
    g.line(x + 14, y + 8, x + 20, y + 8, 3);
    g.line(x + 13, y + 9, x + 19, y + 9, 3);
    g.line(x + 15, y + 7, x + 18, y + 7, 2);
    g.px(x + 21, y + 7, 3);
    g.px(x + 21, y + 9, 3);
    g.px(x + 22, y + 8, 2); // thruster flare
  },

  // --------------------------------------------------------------------------
  // 2. CONSTANTS & TECH DEFINITIONS
  // --------------------------------------------------------------------------
  TECHS: {
    WARP_DRIVES: {
      id: 'WARP_DRIVES',
      name: 'WARP DRIVES',
      tier: 1,
      cost: 20,
      desc: '+FLEET SPEED (2-LANE JUMPS)',
      flavor: 'Subspace fold engines permit deep hyperlane transit.'
    },
    SENSOR_ARRAYS: {
      id: 'SENSOR_ARRAYS',
      name: 'SENSOR ARRAYS',
      tier: 1,
      cost: 20,
      desc: '+2 VISION RANGE & +15% EVADE',
      flavor: 'Deep-space radar detects rival fleet warps.'
    },
    PLASMA_TORPEDOES: {
      id: 'PLASMA_TORPEDOES',
      name: 'PLASMA TORPEDOES',
      tier: 2,
      cost: 40,
      desc: '+2 WARSHIP COMBAT POWER',
      flavor: 'Concentrated plasma bursts pierce alien hulls.'
    },
    HYDROPONICS: {
      id: 'HYDROPONICS',
      name: 'HYDROPONICS',
      tier: 2,
      cost: 40,
      desc: '+1 MAX POP & +50% GROWTH',
      flavor: 'Orbital biodomes sustain flourishing colonies.'
    },
    PLANETARY_SHIELDS: {
      id: 'PLANETARY_SHIELDS',
      name: 'PLANETARY SHIELDS',
      tier: 3,
      cost: 65,
      desc: '3 DMG ORBITAL BATTERIES',
      flavor: 'Fortified orbital grid shoots at hostile invaders.'
    },
    STAR_CITADEL: {
      id: 'STAR_CITADEL',
      name: 'STAR CITADEL',
      tier: 3,
      cost: 65,
      desc: 'UNLOCKS TITAN WARSHIP',
      flavor: 'Colossal capital dreadnought with heavy shielding.'
    },
    DYSON_SPHERE: {
      id: 'DYSON_SPHERE',
      name: 'DYSON SPHERE',
      tier: 4,
      cost: 100,
      desc: 'DOUBLE PRODUCTION & +150 PTS',
      flavor: 'Total stellar energy harness powers empire shipyards.'
    },
    SINGULARITY_CANNON: {
      id: 'SINGULARITY_CANNON',
      name: 'SINGULARITY CANNON',
      tier: 4,
      cost: 100,
      desc: '50% PRE-BATTLE STRIKE & +150',
      flavor: 'Micro black hole launcher obliterates enemy vanguard.'
    }
  },

  BUILDS: [
    { id: 'SCOUT', name: 'SCOUT VESSEL', cost: 6, power: 1, desc: 'FAST RECON SHIP (EXPLORES)' },
    { id: 'COLONY', name: 'COLONY SHIP', cost: 12, power: 0, desc: 'SETTLES EXPLORED WORLDS' },
    { id: 'BATTLESHIP', name: 'BATTLESHIP', cost: 16, power: 3, desc: 'HEAVY COMBAT CRUISER' },
    { id: 'TITAN', name: 'TITAN DREADNOUGHT', cost: 24, power: 6, req: 'STAR_CITADEL', desc: 'MAMMOTH SHIELDED CAPITAL SHIP' },
    { id: 'SCIENCE', name: 'SCIENCE NEXUS', cost: 0, power: 0, desc: 'ALL PROD CONVERTED TO RESEARCH' },
    { id: 'ECONOMY', name: 'ECONOMY EXPANSION', cost: 0, power: 0, desc: 'ACCELERATES POPULATION GROWTH' }
  ],

  ANOMALIES: {
    COLONISTS: {
      title: 'CRYO-COLONY ARK',
      text: 'ANCIENT EARTH SLEEPER SHIP DISCOVERED IN ORBIT!',
      rewardText: '+2 POPULATION TO PLANET',
      apply(game, star) {
        star.pop = Math.min(star.maxPop, star.pop + 2);
      }
    },
    MINERALS: {
      title: 'TITANIUM RICH VEIN',
      text: 'SUPER-DENSE ORE SEAM DETECTED ON SURFACE!',
      rewardText: '+15 PRODUCTION ADVANCE',
      apply(game, star) {
        star.buildProgress += 15;
      }
    },
    DATABANK: {
      title: 'PRECURSOR ARCHIVE',
      text: 'ANCIENT SATELLITE ARRAY FULL OF RESEARCH DATA!',
      rewardText: '+20 SCIENCE POINTS SECURED',
      apply(game, star) {
        game.addScience(20);
      }
    },
    DERELICT: {
      title: 'DERELICT WARSHIP',
      text: 'ABANDONED BATTLECRUISER REACTIVATED!',
      rewardText: 'FREE BATTLESHIP JOINED FLEET',
      apply(game, star) {
        star.ships.player.battleship = (star.ships.player.battleship || 0) + 1;
      }
    },
    BEACON: {
      title: 'SUBSPACE RELAY ARRAY',
      text: 'SURVEY SENSORS MAP ADJACENT SECTORS!',
      rewardText: 'REVEALED 2 ADJACENT SYSTEMS',
      apply(game, star) {
        const neighbors = game.getConnectedStars(star.id);
        neighbors.forEach(nid => {
          game.stars[nid].explored = true;
        });
      }
    }
  },

  // --------------------------------------------------------------------------
  // 3. INITIALIZATION & LIFECYCLE
  // --------------------------------------------------------------------------
  init() {
    this.turn = 1;
    this.maxTurns = 25;
    this.mode = 'MAP'; // 'MAP', 'BUILD', 'TECH', 'DISPATCH', 'COMBAT', 'EVENT', 'GAMEOVER'
    this.selectedStar = 0; // SOL
    this.targetStar = null;
    this.buildCursor = 0;
    this.techCursor = 0;
    this.researchedTechs = {};
    this.activeTech = 'WARP_DRIVES';
    this.techProgress = 0;
    this.notification = { text: '', timer: 0 };
    this.animTimer = 0;
    this.endGameType = null;

    // Difficulty configuration (0=EASY, 1=NORMAL, 2=HARD)
    const diff = this.getDifficulty();

    // 42 Static Starfield coordinates
    this.starfield = [];
    for (let i = 0; i < 42; i++) {
      this.starfield.push({
        x: (i * 37 + 13) % 252 + 2,
        y: (i * 53 + 29) % 158 + 20,
        b: (i % 3 === 0) ? 2 : 1,
        phase: (i * 0.7) % (Math.PI * 2)
      });
    }

    // 9 Distinct Star Systems
    // Types: 0=SOL-LIKE (Balanced), 1=MINERAL RICH (High Prod), 2=SCIENCE NEXUS (High Sci), 3=NEBULA OUTPOST (Defense)
    this.stars = [
      {
        id: 0, name: "SOL", type: 0, desc: "TERRA FIRMA (HOMEWORLD)",
        x: 34, y: 100, owner: 'PLAYER', explored: true, vornExplored: false,
        pop: 2, maxPop: 5, popGrowth: 0, prodBase: 2, sciBase: 2,
        buildQueue: 'SCOUT', buildProgress: 0,
        ships: {
          player: { scout: diff === 0 ? 2 : 1, colony: 0, battleship: 0, titan: 0 },
          vorn: { scout: 0, colony: 0, battleship: 0, titan: 0 }
        },
        hasShield: false, anomaly: null, anomalyClaimed: false
      },
      {
        id: 1, name: "CENTAURI", type: 0, desc: "HABITABLE CONTINENTAL",
        x: 82, y: 54, owner: 'NEUTRAL', explored: false, vornExplored: false,
        pop: 0, maxPop: 4, popGrowth: 0, prodBase: 2, sciBase: 1,
        buildQueue: 'SCOUT', buildProgress: 0,
        ships: { player: { scout: 0, colony: 0, battleship: 0, titan: 0 }, vorn: { scout: 0, colony: 0, battleship: 0, titan: 0 } },
        hasShield: false, anomaly: 'COLONISTS', anomalyClaimed: false
      },
      {
        id: 2, name: "SIRIUS", type: 1, desc: "HEAVY METAL ASTEROIDS",
        x: 82, y: 146, owner: 'NEUTRAL', explored: false, vornExplored: false,
        pop: 0, maxPop: 3, popGrowth: 0, prodBase: 4, sciBase: 0,
        buildQueue: 'BATTLESHIP', buildProgress: 0,
        ships: { player: { scout: 0, colony: 0, battleship: 0, titan: 0 }, vorn: { scout: 0, colony: 0, battleship: 0, titan: 0 } },
        hasShield: false, anomaly: 'MINERALS', anomalyClaimed: false
      },
      {
        id: 3, name: "VEGA", type: 2, desc: "PRECURSOR OBSERVATORY",
        x: 128, y: 44, owner: 'NEUTRAL', explored: false, vornExplored: false,
        pop: 0, maxPop: 3, popGrowth: 0, prodBase: 1, sciBase: 4,
        buildQueue: 'SCOUT', buildProgress: 0,
        ships: { player: { scout: 0, colony: 0, battleship: 0, titan: 0 }, vorn: { scout: 0, colony: 0, battleship: 0, titan: 0 } },
        hasShield: false, anomaly: 'DATABANK', anomalyClaimed: false
      },
      {
        id: 4, name: "CYGNUS", type: 3, desc: "CENTRAL NEBULA CROSSROADS",
        x: 128, y: 100, owner: 'NEUTRAL', explored: false, vornExplored: false,
        pop: 0, maxPop: 3, popGrowth: 0, prodBase: 2, sciBase: 2,
        buildQueue: 'BATTLESHIP', buildProgress: 0,
        ships: { player: { scout: 0, colony: 0, battleship: 0, titan: 0 }, vorn: { scout: 0, colony: 0, battleship: 0, titan: 0 } },
        hasShield: false, anomaly: 'DERELICT', anomalyClaimed: false
      },
      {
        id: 5, name: "RIGEL", type: 1, desc: "VOLCANIC MINERAL FOUNDRY",
        x: 128, y: 156, owner: 'NEUTRAL', explored: false, vornExplored: false,
        pop: 0, maxPop: 3, popGrowth: 0, prodBase: 4, sciBase: 0,
        buildQueue: 'BATTLESHIP', buildProgress: 0,
        ships: { player: { scout: 0, colony: 0, battleship: 0, titan: 0 }, vorn: { scout: 0, colony: 0, battleship: 0, titan: 0 } },
        hasShield: false, anomaly: 'MINERALS', anomalyClaimed: false
      },
      {
        id: 6, name: "ANTARES", type: 2, desc: "PULSAR SCIENCE NEXUS",
        x: 174, y: 54, owner: 'NEUTRAL', explored: false, vornExplored: true,
        pop: 0, maxPop: 3, popGrowth: 0, prodBase: 1, sciBase: 4,
        buildQueue: 'SCOUT', buildProgress: 0,
        ships: { player: { scout: 0, colony: 0, battleship: 0, titan: 0 }, vorn: { scout: 0, colony: 0, battleship: 0, titan: 0 } },
        hasShield: false, anomaly: 'BEACON', anomalyClaimed: false
      },
      {
        id: 7, name: "ORION", type: 0, desc: "VERDANT JUNGLE WORLDS",
        x: 174, y: 146, owner: 'NEUTRAL', explored: false, vornExplored: true,
        pop: 0, maxPop: 4, popGrowth: 0, prodBase: 2, sciBase: 1,
        buildQueue: 'BATTLESHIP', buildProgress: 0,
        ships: { player: { scout: 0, colony: 0, battleship: 0, titan: 0 }, vorn: { scout: 0, colony: 0, battleship: 0, titan: 0 } },
        hasShield: false, anomaly: 'COLONISTS', anomalyClaimed: false
      },
      {
        id: 8, name: "VORN PRIME", type: 1, desc: "VORN HIVE MOTHERWORLD",
        x: 222, y: 100, owner: 'VORN', explored: false, vornExplored: true,
        pop: 3, maxPop: 5, popGrowth: 0, prodBase: 3, sciBase: 2,
        buildQueue: 'COLONY', buildProgress: 0,
        ships: {
          player: { scout: 0, colony: 0, battleship: 0, titan: 0 },
          vorn: { scout: 1, colony: 0, battleship: diff === 2 ? 1 : 0, titan: 0 }
        },
        hasShield: true, anomaly: null, anomalyClaimed: false
      }
    ];

    // Hyperlane Network Graph
    this.hyperlanes = [
      [0, 1], [0, 2],
      [1, 3], [1, 4],
      [2, 4], [2, 5],
      [3, 4], [3, 6],
      [4, 5], [4, 6], [4, 7],
      [5, 7],
      [6, 8],
      [7, 8]
    ];

    // Easy mode starting science bonus
    if (diff === 0) {
      this.techProgress = 10;
    }

    this.resetFleetMovement();
  },

  getDifficulty() {
    if (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) return VOS.difficulty;
    return this.localDiff !== undefined ? this.localDiff : 1;
  },

  resetFleetMovement() {
    this.stars.forEach(s => {
      s.hasMovedP = false;
      s.hasMovedV = false;
    });
  },

  hasTech(techId) {
    return !!this.researchedTechs[techId];
  },

  getConnectedStars(starId) {
    const list = [];
    this.hyperlanes.forEach(([a, b]) => {
      if (a === starId) list.push(b);
      else if (b === starId) list.push(a);
    });
    return list;
  },

  isAdjacent(s1, s2) {
    return this.hyperlanes.some(([a, b]) => (a === s1 && b === s2) || (a === s2 && b === s1));
  },

  canReach(s1, s2) {
    if (s1 === s2) return false;
    if (this.isAdjacent(s1, s2)) return true;
    // Warp Drives allows 2-hyperlane jumps!
    if (this.hasTech('WARP_DRIVES')) {
      const neighbors = this.getConnectedStars(s1);
      for (let i = 0; i < neighbors.length; i++) {
        if (this.isAdjacent(neighbors[i], s2)) return true;
      }
    }
    return false;
  },

  sfxHyperdrive() {
    if (typeof APU !== 'undefined') {
      APU.softTone(180, 0.20, 'triangle', 0.12, 0, 0.02, 1200);
      APU.softTone(380, 0.25, 'sine', 0.10, 0.06, 0.02, 1600);
      APU.softTone(760, 0.30, 'sine', 0.08, 0.12, 0.02, 2000);
      APU.sfx('SWISH');
    }
  },

  // --------------------------------------------------------------------------
  // 4. EMPIRE RESOURCE CALCULATIONS
  // --------------------------------------------------------------------------
  calcIncome() {
    let prod = 0;
    let sci = 0;
    let pop = 0;
    const multProd = this.hasTech('DYSON_SPHERE') ? 2 : 1;

    this.stars.forEach(s => {
      if (s.owner === 'PLAYER') {
        pop += s.pop;
        const p = s.pop * s.prodBase * multProd;
        const c = s.pop * s.sciBase;
        prod += p;
        sci += c;
        if (s.buildQueue === 'SCIENCE') sci += p;
      }
    });

    return { prod, sci, pop };
  },

  calcFleetPower(side = 'player') {
    let power = 0;
    const plasmaBonus = (side === 'player' && this.hasTech('PLASMA_TORPEDOES')) ? 2 : 0;
    this.stars.forEach(s => {
      const sh = s.ships[side];
      power += (sh.scout || 0) * 1;
      power += (sh.battleship || 0) * (3 + plasmaBonus);
      power += (sh.titan || 0) * (6 + plasmaBonus);
    });
    return power;
  },

  calcScore() {
    let colonized = 0;
    let totalPop = 0;
    let anomalies = 0;

    this.stars.forEach(s => {
      if (s.owner === 'PLAYER') {
        colonized++;
        totalPop += s.pop;
      }
      if (s.anomalyClaimed) anomalies++;
    });

    const fleetPower = this.calcFleetPower('player');
    const techCount = Object.keys(this.researchedTechs).length;
    const vornHomeworldCrushed = (this.stars[8].owner === 'PLAYER');

    let score = (colonized * 25) +
                (totalPop * 10) +
                (techCount * 30) +
                (fleetPower * 15) +
                (anomalies * 10) +
                (vornHomeworldCrushed ? 150 : 0);

    if (this.hasTech('DYSON_SPHERE')) score += 150;
    if (this.hasTech('SINGULARITY_CANNON')) score += 150;

    const diff = this.getDifficulty();
    const diffMult = (diff === 0) ? 1.0 : (diff === 1) ? 1.25 : 1.5;
    return Math.round(score * diffMult);
  },

  addScience(amount) {
    if (!this.activeTech) return;
    this.techProgress += amount;
    const tech = this.TECHS[this.activeTech];
    if (tech && this.techProgress >= tech.cost) {
      this.researchedTechs[tech.id] = true;
      this.notify("BREAKTHROUGH: " + tech.name + "!");
      if (typeof APU !== 'undefined') APU.sfx('LEVELUP');

      // Apply instant tech effects
      if (tech.id === 'HYDROPONICS') {
        this.stars.forEach(s => {
          s.maxPop += 1;
          if (s.owner === 'PLAYER') s.pop = Math.min(s.maxPop, s.pop + 1);
        });
      } else if (tech.id === 'SENSOR_ARRAYS') {
        this.stars.forEach(s => {
          if (s.owner === 'PLAYER') {
            const near = this.getConnectedStars(s.id);
            near.forEach(nid => {
              this.stars[nid].explored = true;
              this.getConnectedStars(nid).forEach(n2 => this.stars[n2].explored = true);
            });
          }
        });
      } else if (tech.id === 'PLANETARY_SHIELDS') {
        this.stars.forEach(s => {
          if (s.owner === 'PLAYER') s.hasShield = true;
        });
      }

      this.selectNextAvailableTech();
    }
  },

  selectNextAvailableTech() {
    const list = Object.values(this.TECHS);
    const next = list.find(t => !this.researchedTechs[t.id]);
    this.activeTech = next ? next.id : null;
    this.techProgress = 0;
  },

  notify(msg) {
    this.notification = { text: msg, timer: 3.5 };
  },

  // --------------------------------------------------------------------------
  // 5. UPDATE LOOP & USER INPUT
  // --------------------------------------------------------------------------
  update(dt) {
    this.animTimer += dt;
    if (this.notification.timer > 0) {
      this.notification.timer -= dt;
    }

    let tap = (typeof PAD !== 'undefined' && PAD.tapPos) ? PAD.tapPos : null;

    switch (this.mode) {
      case 'MAP':
        this.updateMap(dt, tap);
        break;
      case 'BUILD':
        this.updateBuildMenu(dt, tap);
        break;
      case 'TECH':
        this.updateTechMenu(dt, tap);
        break;
      case 'DISPATCH':
        this.updateDispatchMenu(dt, tap);
        break;
      case 'COMBAT':
        this.updateCombat(dt, tap);
        break;
      case 'EVENT':
        this.updateEvent(dt, tap);
        break;
      case 'GAMEOVER':
        this.updateGameOver(dt, tap);
        break;
    }
  },

  updateMap(dt, tap) {
    // 1. D-Pad Directional Navigation
    if (PAD.hit('right')) this.navigateStar('right');
    else if (PAD.hit('left')) this.navigateStar('left');
    else if (PAD.hit('up')) this.navigateStar('up');
    else if (PAD.hit('down')) this.navigateStar('down');

    // 2. Mobile Touch on Star Nodes
    if (tap) {
      let tappedStar = -1;
      for (let i = 0; i < this.stars.length; i++) {
        const s = this.stars[i];
        if (Math.hypot(tap.x - s.x, tap.y - s.y) <= 18) {
          tappedStar = i;
          break;
        }
      }

      if (tappedStar !== -1) {
        const curStar = this.stars[this.selectedStar];
        const hasFleet = (curStar.ships.player.scout > 0 || curStar.ships.player.colony > 0 ||
                          curStar.ships.player.battleship > 0 || curStar.ships.player.titan > 0);

        if (tappedStar !== this.selectedStar && hasFleet && !curStar.hasMovedP && this.canReach(this.selectedStar, tappedStar)) {
          this.targetStar = tappedStar;
          this.mode = 'DISPATCH';
          if (typeof APU !== 'undefined') APU.sfx('UI_OK');
          return;
        } else {
          this.selectedStar = tappedStar;
          if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
        }
      }

      // 3. Touch Buttons on Bottom Command Panel
      // [BUILD] / [COLONIZE] Button (X: 144, Y: 184, W: 52, H: 23)
      if (tap.x >= 144 && tap.x <= 196 && tap.y >= 184 && tap.y <= 207) {
        const sel = this.stars[this.selectedStar];
        if (sel.owner === 'PLAYER') {
          this.mode = 'BUILD';
          this.buildCursor = 0;
          if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        } else if (sel.owner === 'NEUTRAL' && sel.explored && sel.ships.player.colony > 0) {
          this.colonizeStar(sel);
        } else {
          if (typeof APU !== 'undefined') APU.sfx('DENY');
          this.notify("CANNOT BUILD ON UNOWNED WORLD");
        }
        return;
      }

      // [TECH] Button (X: 200, Y: 184, W: 52, H: 23)
      if (tap.x >= 200 && tap.x <= 252 && tap.y >= 184 && tap.y <= 207) {
        this.mode = 'TECH';
        this.techCursor = 0;
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        return;
      }

      // [END TURN] Button (X: 144, Y: 211, W: 108, H: 25)
      if (tap.x >= 144 && tap.x <= 252 && tap.y >= 211 && tap.y <= 236) {
        this.endTurn();
        return;
      }
    }

    // 4. Physical Controller Buttons
    if (PAD.hit('a')) {
      const cur = this.stars[this.selectedStar];
      if (cur.owner === 'PLAYER') {
        this.mode = 'BUILD';
        this.buildCursor = 0;
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
      } else if (cur.owner === 'NEUTRAL' && cur.explored && cur.ships.player.colony > 0) {
        this.colonizeStar(cur);
      }
    } else if (PAD.hit('start')) {
      this.endTurn();
    } else if (PAD.hit('select')) {
      this.mode = 'TECH';
      this.techCursor = 0;
      if (typeof APU !== 'undefined') APU.sfx('UI_OK');
    }
  },

  colonizeStar(star) {
    if (star.ships.player.colony > 0 && star.owner === 'NEUTRAL') {
      star.ships.player.colony -= 1;
      star.owner = 'PLAYER';
      star.pop = 1;
      star.buildQueue = 'BATTLESHIP';
      star.buildProgress = 0;
      this.notify("FOUNDED COLONY AT " + star.name + "!");
      if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
    }
  },

  navigateStar(dir) {
    const cur = this.stars[this.selectedStar];
    let bestId = -1;
    let bestDist = 999999;
    for (let i = 0; i < this.stars.length; i++) {
      if (i === this.selectedStar) continue;
      const s = this.stars[i];
      const dx = s.x - cur.x;
      const dy = s.y - cur.y;
      let match = false;
      if (dir === 'right' && dx > 15 && Math.abs(dx) >= Math.abs(dy) * 0.4) match = true;
      if (dir === 'left' && dx < -15 && Math.abs(dx) >= Math.abs(dy) * 0.4) match = true;
      if (dir === 'up' && dy < -15 && Math.abs(dy) >= Math.abs(dx) * 0.4) match = true;
      if (dir === 'down' && dy > 15 && Math.abs(dy) >= Math.abs(dx) * 0.4) match = true;
      if (match) {
        const d = Math.hypot(dx, dy);
        if (d < bestDist) {
          bestDist = d;
          bestId = i;
        }
      }
    }
    if (bestId !== -1) {
      this.selectedStar = bestId;
      if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
    }
  },

  // --------------------------------------------------------------------------
  // 6. BUILD MENU SUBSYSTEM
  // --------------------------------------------------------------------------
  updateBuildMenu(dt, tap) {
    const star = this.stars[this.selectedStar];
    if (PAD.hit('up')) {
      this.buildCursor = (this.buildCursor - 1 + this.BUILDS.length) % this.BUILDS.length;
      if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
    } else if (PAD.hit('down')) {
      this.buildCursor = (this.buildCursor + 1) % this.BUILDS.length;
      if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
    } else if (PAD.hit('a')) {
      this.selectBuildProject(this.buildCursor);
    } else if (PAD.hit('b') || PAD.hit('select')) {
      this.mode = 'MAP';
      if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
    }

    if (tap) {
      for (let i = 0; i < this.BUILDS.length; i++) {
        const rowY = 44 + i * 22;
        if (tap.x >= 28 && tap.x <= 228 && tap.y >= rowY && tap.y <= rowY + 20) {
          this.selectBuildProject(i);
          return;
        }
      }
      if (tap.x >= 88 && tap.x <= 168 && tap.y >= 182 && tap.y <= 200) {
        this.mode = 'MAP';
        if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
      }
    }
  },

  selectBuildProject(idx) {
    const proj = this.BUILDS[idx];
    if (proj.req && !this.hasTech(proj.req)) {
      if (typeof APU !== 'undefined') APU.sfx('DENY');
      this.notify("REQUIRES " + proj.req + " RESEARCH!");
      return;
    }
    const star = this.stars[this.selectedStar];
    star.buildQueue = proj.id;
    star.buildProgress = 0;
    this.mode = 'MAP';
    if (typeof APU !== 'undefined') APU.sfx('UI_OK');
    this.notify(star.name + " BUILDING: " + proj.name);
  },

  // --------------------------------------------------------------------------
  // 7. TECH TREE RESEARCH SUBSYSTEM
  // --------------------------------------------------------------------------
  updateTechMenu(dt, tap) {
    const techKeys = Object.keys(this.TECHS);

    if (PAD.hit('up')) {
      this.techCursor = (this.techCursor - 2 + techKeys.length) % techKeys.length;
      if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
    } else if (PAD.hit('down')) {
      this.techCursor = (this.techCursor + 2) % techKeys.length;
      if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
    } else if (PAD.hit('left') || PAD.hit('right')) {
      this.techCursor = (this.techCursor % 2 === 0) ? this.techCursor + 1 : this.techCursor - 1;
      if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
    } else if (PAD.hit('a')) {
      this.selectTech(this.techCursor);
    } else if (PAD.hit('b') || PAD.hit('select')) {
      this.mode = 'MAP';
      if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
    }

    if (tap) {
      for (let i = 0; i < techKeys.length; i++) {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const bx = 16 + col * 114;
        const by = 34 + row * 40;
        if (tap.x >= bx && tap.x <= bx + 110 && tap.y >= by && tap.y <= by + 36) {
          this.selectTech(i);
          return;
        }
      }
      if (tap.x >= 88 && tap.x <= 168 && tap.y >= 196 && tap.y <= 214) {
        this.mode = 'MAP';
        if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
      }
    }
  },

  selectTech(idx) {
    const techKeys = Object.keys(this.TECHS);
    const techId = techKeys[idx];
    if (this.researchedTechs[techId]) {
      if (typeof APU !== 'undefined') APU.sfx('UI_OK');
      this.notify("ALREADY RESEARCHED!");
      return;
    }
    const tech = this.TECHS[techId];
    if (tech.tier > 1) {
      const prevTier = tech.tier - 1;
      const prevTierTechs = Object.values(this.TECHS).filter(t => t.tier === prevTier);
      const hasPrev = prevTierTechs.some(t => this.researchedTechs[t.id]);
      if (!hasPrev) {
        if (typeof APU !== 'undefined') APU.sfx('DENY');
        this.notify("RESEARCH A TIER " + prevTier + " TECH FIRST!");
        return;
      }
    }

    if (this.activeTech !== techId) {
      this.activeTech = techId;
      this.techProgress = 0;
      if (typeof APU !== 'undefined') APU.sfx('UI_OK');
      this.notify("RESEARCHING: " + tech.name);
    }
    this.mode = 'MAP';
  },

  // --------------------------------------------------------------------------
  // 8. FLEET DISPATCH SUBSYSTEM
  // --------------------------------------------------------------------------
  updateDispatchMenu(dt, tap) {
    if (PAD.hit('a')) {
      this.executeFleetMove('ALL');
    } else if (PAD.hit('b')) {
      this.mode = 'MAP';
      if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
    }

    if (tap) {
      // Tap [ALL SHIPS] (X: 30, Y: 120, W: 90, H: 22)
      if (tap.x >= 30 && tap.x <= 120 && tap.y >= 120 && tap.y <= 142) {
        this.executeFleetMove('ALL');
        return;
      }
      // Tap [SCOUT ONLY] (X: 136, Y: 120, W: 90, H: 22)
      if (tap.x >= 136 && tap.x <= 226 && tap.y >= 120 && tap.y <= 142) {
        this.executeFleetMove('SCOUT');
        return;
      }
      // Tap [WARSHIPS] (X: 30, Y: 150, W: 90, H: 22)
      if (tap.x >= 30 && tap.x <= 120 && tap.y >= 150 && tap.y <= 172) {
        this.executeFleetMove('WAR');
        return;
      }
      // Tap [CANCEL] (X: 136, Y: 150, W: 90, H: 22)
      if (tap.x >= 136 && tap.x <= 226 && tap.y >= 150 && tap.y <= 172) {
        this.mode = 'MAP';
        if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
        return;
      }
    }
  },

  executeFleetMove(selection) {
    const origin = this.stars[this.selectedStar];
    const dest = this.stars[this.targetStar];
    const sp = origin.ships.player;

    const moving = { scout: 0, colony: 0, battleship: 0, titan: 0 };
    if (selection === 'ALL') {
      moving.scout = sp.scout;
      moving.colony = sp.colony;
      moving.battleship = sp.battleship;
      moving.titan = sp.titan;
    } else if (selection === 'SCOUT') {
      moving.scout = sp.scout;
    } else if (selection === 'WAR') {
      moving.battleship = sp.battleship;
      moving.titan = sp.titan;
    }

    const totalMoving = moving.scout + moving.colony + moving.battleship + moving.titan;
    if (totalMoving <= 0) {
      if (typeof APU !== 'undefined') APU.sfx('DENY');
      this.notify("NO SHIPS SELECTED TO MOVE!");
      this.mode = 'MAP';
      return;
    }

    sp.scout -= moving.scout;
    sp.colony -= moving.colony;
    sp.battleship -= moving.battleship;
    sp.titan -= moving.titan;
    origin.hasMovedP = true;

    this.sfxHyperdrive();

    dest.ships.player.scout += moving.scout;
    dest.ships.player.colony += moving.colony;
    dest.ships.player.battleship += moving.battleship;
    dest.ships.player.titan += moving.titan;

    this.selectedStar = dest.id;
    this.mode = 'MAP';

    // 1. eXplore Fog of War
    if (!dest.explored) {
      dest.explored = true;
      this.notify("EXPLORED " + dest.name + " (" + dest.desc + ")");
      if (typeof APU !== 'undefined') APU.sfx('POWER');
      if (dest.anomaly && !dest.anomalyClaimed) {
        dest.anomalyClaimed = true;
        this.triggerAnomaly(dest);
        return;
      }
    }

    // 2. eXpand: Colony ship settlement
    if (dest.owner === 'NEUTRAL' && dest.ships.player.colony > 0) {
      this.colonizeStar(dest);
    }

    // 3. eXterminate: Check for combat clash with Vorn
    const vornCount = (dest.ships.vorn.scout || 0) + (dest.ships.vorn.colony || 0) +
                      (dest.ships.vorn.battleship || 0) + (dest.ships.vorn.titan || 0);
    if (dest.owner === 'VORN' || vornCount > 0) {
      this.startCombat(dest.id, 'PLAYER');
    }
  },

  triggerAnomaly(star) {
    const anom = this.ANOMALIES[star.anomaly];
    if (!anom) return;
    anom.apply(this, star);
    this.eventData = {
      starName: star.name,
      title: anom.title,
      text: anom.text,
      reward: anom.rewardText
    };
    this.mode = 'EVENT';
    if (typeof APU !== 'undefined') APU.sfx('POWER');
  },

  updateEvent(dt, tap) {
    if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || tap) {
      this.mode = 'MAP';
      if (typeof APU !== 'undefined') APU.sfx('UI_OK');
    }
  },

  // --------------------------------------------------------------------------
  // 9. SPACE COMBAT SYSTEM (eXterminate)
  // --------------------------------------------------------------------------
  startCombat(starId, attacker) {
    const star = this.stars[starId];
    this.mode = 'COMBAT';

    const pHp = (star.ships.player.scout * 2) + (star.ships.player.battleship * 6) + (star.ships.player.titan * 12);
    const vHp = (star.ships.vorn.scout * 2) + (star.ships.vorn.battleship * 6) + (star.ships.vorn.titan * 12);

    this.combatData = {
      starId: starId,
      attacker: attacker,
      round: 1,
      maxRounds: 6,
      timer: 0,
      subState: 'CLASH',
      pHp: Math.max(1, pHp),
      pMaxHp: Math.max(1, pHp),
      vHp: Math.max(1, vHp),
      vMaxHp: Math.max(1, vHp),
      log: ["ORBITAL COMBAT ENGAGED AT " + star.name + "!"],
      particles: [],
      lasers: []
    };

    if (attacker === 'PLAYER' && this.hasTech('SINGULARITY_CANNON')) {
      const strikeDmg = Math.max(1, Math.floor(this.combatData.vHp * 0.5));
      this.combatData.vHp -= strikeDmg;
      this.combatData.log.push("SINGULARITY CANNON HIT: -" + strikeDmg + " VORN HP!");
      if (typeof APU !== 'undefined') APU.sfx('BOOM');
    }

    if (star.hasShield) {
      if (star.owner === 'PLAYER') {
        this.combatData.vHp = Math.max(0, this.combatData.vHp - 3);
        this.combatData.log.push("ORBITAL DEFENSE CANNON: -3 VORN HP!");
      } else if (star.owner === 'VORN') {
        this.combatData.pHp = Math.max(0, this.combatData.pHp - 3);
        this.combatData.log.push("VORN SPORE BATTERIES: -3 HUMAN HP!");
      }
      if (typeof APU !== 'undefined') APU.sfx('HIT');
    }
  },

  calcFleetPowerAt(star, side) {
    const sh = star.ships[side];
    const plasma = (side === 'player' && this.hasTech('PLASMA_TORPEDOES')) ? 2 : 0;
    return (sh.scout * 1) + (sh.battleship * (3 + plasma)) + (sh.titan * (6 + plasma));
  },

  updateCombat(dt, tap) {
    const cd = this.combatData;
    cd.timer += dt;

    for (let i = cd.lasers.length - 1; i >= 0; i--) {
      cd.lasers[i].life -= dt;
      if (cd.lasers[i].life <= 0) cd.lasers.splice(i, 1);
    }

    for (let i = cd.particles.length - 1; i >= 0; i--) {
      const p = cd.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) cd.particles.splice(i, 1);
    }

    if (cd.subState === 'CLASH') {
      const proceed = (cd.timer >= 1.4) || PAD.hit('a') || PAD.hit('start') || tap;
      if (proceed) {
        cd.timer = 0;
        this.resolveCombatRound();
      }
    } else if (cd.subState === 'RESULT') {
      if (PAD.hit('a') || PAD.hit('start') || PAD.hit('b') || tap) {
        this.finishCombat();
      }
    }
  },

  resolveCombatRound() {
    const cd = this.combatData;
    const star = this.stars[cd.starId];
    const pPower = this.calcFleetPowerAt(star, 'player');
    const vPower = this.calcFleetPowerAt(star, 'vorn');

    // Animated lasers
    cd.lasers.push({
      x0: 60 + Math.random() * 20, y0: 80 + Math.random() * 50,
      x1: 170 + Math.random() * 20, y1: 80 + Math.random() * 50,
      color: 3, life: 0.35
    });
    cd.lasers.push({
      x0: 170 + Math.random() * 20, y0: 80 + Math.random() * 50,
      x1: 60 + Math.random() * 20, y1: 80 + Math.random() * 50,
      color: 2, life: 0.35
    });

    // Sparks
    for (let i = 0; i < 8; i++) {
      cd.particles.push({
        x: 110 + (Math.random() - 0.5) * 40,
        y: 105 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 60,
        life: 0.4 + Math.random() * 0.3,
        c: (i % 2 === 0) ? 3 : 2
      });
    }

    const pDmg = Math.max(1, Math.round(pPower * (0.6 + Math.random() * 0.5)));
    const vDmg = Math.max(1, Math.round(vPower * (0.6 + Math.random() * 0.5)));

    cd.vHp = Math.max(0, cd.vHp - pDmg);
    cd.pHp = Math.max(0, cd.pHp - vDmg);

    if (typeof APU !== 'undefined') {
      APU.sfx('HIT');
      if (Math.random() > 0.4) APU.sfx('BOOM');
    }

    cd.log.push("R" + cd.round + ": HUMAN -" + vDmg + " HP | VORN -" + pDmg + " HP");
    if (cd.log.length > 4) cd.log.shift();

    cd.round++;

    if (cd.vHp <= 0 || cd.pHp <= 0 || cd.round > cd.maxRounds) {
      cd.subState = 'RESULT';
      if (cd.vHp <= 0 && cd.pHp > 0) {
        cd.log.push("*** VICTORY! VORN FORCES WIPED OUT! ***");
        if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
      } else if (cd.pHp <= 0 && cd.vHp > 0) {
        cd.log.push("*** DEFEAT! HUMAN SQUADRON LOST! ***");
        if (typeof APU !== 'undefined') APU.sfx('HURT');
      } else {
        cd.log.push("*** STALEMATE: FORCES DISENGAGED! ***");
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
      }
    }
  },

  finishCombat() {
    const cd = this.combatData;
    const star = this.stars[cd.starId];

    if (cd.vHp <= 0 && cd.pHp > 0) {
      // Player won!
      star.ships.vorn = { scout: 0, colony: 0, battleship: 0, titan: 0 };

      // Apply proportional casualties to player fleet
      let lostHp = cd.pMaxHp - cd.pHp;
      while (lostHp >= 2 && star.ships.player.scout > 0) {
        star.ships.player.scout--;
        lostHp -= 2;
      }
      while (lostHp >= 6 && star.ships.player.battleship > 0) {
        star.ships.player.battleship--;
        lostHp -= 6;
      }
      while (lostHp >= 12 && star.ships.player.titan > 0) {
        star.ships.player.titan--;
        lostHp -= 12;
      }

      if (star.owner === 'VORN') {
        star.owner = 'PLAYER';
        star.pop = Math.max(1, star.pop - 1);
        star.buildQueue = 'BATTLESHIP';
        star.buildProgress = 0;
        this.notify("SYSTEM LIBERATED: " + star.name + "!");

        // Victory check: Vorn Prime captured!
        if (star.id === 8) {
          this.mode = 'GAMEOVER';
          this.endGameType = 'CONQUEST';
          SAVE.setScore(this.id, this.calcScore());
          if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
          return;
        }
      }
    } else if (cd.pHp <= 0 && cd.vHp > 0) {
      // Vorn won!
      star.ships.player = { scout: 0, colony: 0, battleship: 0, titan: 0 };

      // Apply proportional casualties to Vorn fleet
      let vLostHp = cd.vMaxHp - cd.vHp;
      while (vLostHp >= 2 && star.ships.vorn.scout > 0) {
        star.ships.vorn.scout--;
        vLostHp -= 2;
      }
      while (vLostHp >= 6 && star.ships.vorn.battleship > 0) {
        star.ships.vorn.battleship--;
        vLostHp -= 6;
      }

      if (star.owner === 'PLAYER') {
        star.owner = 'VORN';
        star.pop = Math.max(1, star.pop - 1);
        star.buildQueue = 'BATTLESHIP';
        this.notify("SYSTEM LOST: " + star.name + "!");

        // Defeat check: Sol captured and no other colonies exist!
        const remainingPlayerColonies = this.stars.filter(s => s.owner === 'PLAYER' && s.id !== 0);
        if (star.id === 0 && remainingPlayerColonies.length === 0) {
          this.mode = 'GAMEOVER';
          this.endGameType = 'DEFEAT';
          SAVE.setScore(this.id, this.calcScore());
          if (typeof APU !== 'undefined') APU.sfx('HURT');
          return;
        } else if (star.id === 0) {
          this.notify("SOL LOST! COLONIAL GOVERNMENT RESISTS!");
        }
      }
    } else {
      // Stalemate
      star.ships.player.scout = Math.floor(star.ships.player.scout / 2);
      star.ships.player.battleship = Math.floor(star.ships.player.battleship / 2);
      star.ships.vorn.scout = Math.floor(star.ships.vorn.scout / 2);
      star.ships.vorn.battleship = Math.floor(star.ships.vorn.battleship / 2);
    }

    this.mode = 'MAP';
  },

  // --------------------------------------------------------------------------
  // 10. END TURN & RIVAL AI (The Vorn Hive)
  // --------------------------------------------------------------------------
  endTurn() {
    if (this.mode !== 'MAP') return;

    this.resetFleetMovement();

    // 1. Advance Player Production & Population
    const income = this.calcIncome();
    this.addScience(income.sci);

    const multProd = this.hasTech('DYSON_SPHERE') ? 2 : 1;
    this.stars.forEach(s => {
      if (s.owner === 'PLAYER') {
        const prod = s.pop * s.prodBase * multProd;
        if (s.buildQueue === 'ECONOMY') {
          s.popGrowth += 0.5 * (this.hasTech('HYDROPONICS') ? 1.5 : 1.0);
        } else if (s.buildQueue !== 'SCIENCE') {
          s.buildProgress += prod;
          const proj = this.BUILDS.find(b => b.id === s.buildQueue);
          if (proj && s.buildProgress >= proj.cost) {
            s.buildProgress -= proj.cost;
            if (proj.id === 'SCOUT') s.ships.player.scout += 1;
            else if (proj.id === 'COLONY') s.ships.player.colony += 1;
            else if (proj.id === 'BATTLESHIP') s.ships.player.battleship += 1;
            else if (proj.id === 'TITAN') s.ships.player.titan += 1;
            this.notify(s.name + " COMPLETED " + proj.name + "!");
            if (typeof APU !== 'undefined') APU.sfx('COIN');
          }
        }

        s.popGrowth += 0.25 * (this.hasTech('HYDROPONICS') ? 1.5 : 1.0);
        if (s.popGrowth >= 1.0 && s.pop < s.maxPop) {
          s.pop += 1;
          s.popGrowth = 0;
        }
      }
    });

    // 2. Rival Alien AI: The Vorn Hive
    this.updateVornHiveAI();

    // 3. Advance Turn Counter
    this.turn++;
    if (typeof APU !== 'undefined') APU.sfx('UI_OK');

    // Check for campaign completion at Turn 25
    if (this.turn > this.maxTurns) {
      this.mode = 'GAMEOVER';
      this.endGameType = 'DOMINION';
      SAVE.setScore(this.id, this.calcScore());
      if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
      return;
    }

    SAVE.setScore(this.id, this.calcScore());
  },

  updateVornHiveAI() {
    const diff = this.getDifficulty();
    const vornSpeedMult = (diff === 0) ? 0.75 : (diff === 1) ? 1.0 : 1.35;

    // A. Vorn Production
    this.stars.forEach(s => {
      if (s.owner === 'VORN') {
        const prod = Math.round(s.pop * s.prodBase * vornSpeedMult);
        s.buildProgress += prod;
        const targetCost = (s.buildQueue === 'COLONY') ? 12 : 16;
        if (s.buildProgress >= targetCost) {
          s.buildProgress = 0;
          if (s.buildQueue === 'COLONY') {
            s.ships.vorn.colony = (s.ships.vorn.colony || 0) + 1;
          } else {
            s.ships.vorn.battleship = (s.ships.vorn.battleship || 0) + 1;
          }

          const neighbors = this.getConnectedStars(s.id);
          const hasNeutral = neighbors.some(nid => this.stars[nid].owner === 'NEUTRAL');
          s.buildQueue = (hasNeutral && Math.random() > 0.3) ? 'COLONY' : 'BATTLESHIP';
        }

        s.popGrowth += 0.25;
        if (s.popGrowth >= 1.0 && s.pop < s.maxPop) {
          s.pop += 1;
          s.popGrowth = 0;
        }
      }
    });

    // B. Vorn Fleet Decisions & Maneuvers
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const s = this.stars[i];
      if (s.hasMovedV) continue;

      const sv = s.ships.vorn;

      // 1. Colonization: If Vorn has Colony Ship
      if (sv.colony > 0) {
        const neighbors = this.getConnectedStars(s.id);
        const neutralTarget = neighbors.find(nid => this.stars[nid].owner === 'NEUTRAL');
        if (neutralTarget !== undefined) {
          sv.colony -= 1;
          const target = this.stars[neutralTarget];
          target.owner = 'VORN';
          target.pop = 1;
          target.buildQueue = 'BATTLESHIP';
          target.vornExplored = true;
          s.hasMovedV = true;
          this.notify("VORN HIVE COLONIZED " + target.name + "!");
          continue;
        }
      }

      // 2. Scout Movement: If Vorn has Scout
      if (sv.scout > 0) {
        const neighbors = this.getConnectedStars(s.id);
        const unexplored = neighbors.find(nid => !this.stars[nid].vornExplored);
        if (unexplored !== undefined) {
          sv.scout -= 1;
          this.stars[unexplored].ships.vorn.scout = (this.stars[unexplored].ships.vorn.scout || 0) + 1;
          this.stars[unexplored].vornExplored = true;
          s.hasMovedV = true;
          continue;
        }
      }

      // 3. Warship Aggression & Pacing
      const warPower = (sv.battleship || 0) * 3 + (sv.titan || 0) * 6;
      if (warPower >= 3 && !s.hasMovedV) {
        const neighbors = this.getConnectedStars(s.id);
        const playerNeighbor = neighbors.find(nid => this.stars[nid].owner === 'PLAYER' || this.calcFleetPowerAt(this.stars[nid], 'player') > 0);

        const minAggroTurn = (diff === 2) ? 6 : (diff === 1 ? 8 : 12);

        if (playerNeighbor !== undefined && (this.turn >= minAggroTurn || this.stars[playerNeighbor].id === 4)) {
          const targetStar = this.stars[playerNeighbor];
          const bCount = sv.battleship || 0;
          sv.battleship = 0;
          targetStar.ships.vorn.battleship = (targetStar.ships.vorn.battleship || 0) + bCount;
          s.hasMovedV = true;
          this.startCombat(playerNeighbor, 'VORN');
          return;
        } else if (this.turn >= minAggroTurn) {
          if (s.id !== 4 && neighbors.includes(4)) {
            const bCount = sv.battleship || 0;
            sv.battleship = 0;
            this.stars[4].ships.vorn.battleship = (this.stars[4].ships.vorn.battleship || 0) + bCount;
            s.hasMovedV = true;
            if (this.stars[4].owner === 'PLAYER' || this.calcFleetPowerAt(this.stars[4], 'player') > 0) {
              this.startCombat(4, 'VORN');
              return;
            }
          }
        }
      }
    }
  },

  // --------------------------------------------------------------------------
  // 11. GAME OVER / VICTORY SUBSYSTEM
  // --------------------------------------------------------------------------
  updateGameOver(dt, tap) {
    if (PAD.hit('a') || PAD.hit('start') || tap) {
      this.init();
      if (typeof APU !== 'undefined') APU.sfx('UI_OK');
    }
  },

  // --------------------------------------------------------------------------
  // 12. RENDERING PIPELINE
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    switch (this.mode) {
      case 'MAP':
      case 'DISPATCH':
        this.renderMap(g);
        if (this.mode === 'DISPATCH') this.renderDispatchDialog(g);
        break;
      case 'BUILD':
        this.renderMap(g);
        this.renderBuildDialog(g);
        break;
      case 'TECH':
        this.renderTechTree(g);
        break;
      case 'COMBAT':
        this.renderCombat(g);
        break;
      case 'EVENT':
        this.renderMap(g);
        this.renderEventPopup(g);
        break;
      case 'GAMEOVER':
        this.renderGameOver(g);
        break;
    }

    if (this.notification.timer > 0) {
      const nw = this.notification.text.length * 5 + 10;
      const nx = Math.floor((256 - nw) / 2);
      g.rect(nx, 20, nw, 11, 0);
      g.box(nx, 20, nw, 11, 3);
      g.textC(this.notification.text, 23, 3);
    }
  },

  renderMap(g) {
    // 1. Deep Space Starfield & Cosmic Dust
    this.starfield.forEach(s => {
      const tw = Math.sin(this.animTimer * 3 + s.phase);
      const c = (tw > 0.6) ? 3 : ((tw > -0.2) ? s.b : 0);
      if (c > 0) g.px(s.x, s.y, c);
    });

    // Nebula dust clouds around Cygnus (128, 100) & Sirius
    g.dither(112, 86, 32, 28, 0, 1);
    g.dither(68, 134, 28, 22, 0, 1);

    // 2. Starlane Hyperlane Lines
    this.hyperlanes.forEach(([a, b]) => {
      const s1 = this.stars[a];
      const s2 = this.stars[b];
      const explored = s1.explored || s2.explored;
      const isSelected = (this.selectedStar === a || this.selectedStar === b);
      const curStar = this.stars[this.selectedStar];
      const hasFleet = (curStar.ships.player.scout > 0 || curStar.ships.player.colony > 0 ||
                        curStar.ships.player.battleship > 0 || curStar.ships.player.titan > 0);

      if (isSelected && hasFleet && this.canReach(this.selectedStar, (this.selectedStar === a ? b : a))) {
        const pulse = (Math.floor(this.animTimer * 8) % 2 === 0) ? 3 : 2;
        g.line(s1.x, s1.y, s2.x, s2.y, pulse);
      } else if (explored) {
        g.line(s1.x, s1.y, s2.x, s2.y, 1);
      }
    });

    // 3. Star System Nodes
    this.stars.forEach(s => {
      const isCur = (s.id === this.selectedStar);

      if (!s.explored) {
        g.disc(s.x, s.y, 4, 1);
        g.px(s.x, s.y - 1, 2);
        g.px(s.x, s.y + 1, 2);
        g.text("?", s.x - 2, s.y - 3, 2);
        g.text("UNSEEN", s.x - 14, s.y + 7, 1);
      } else {
        if (s.owner === 'PLAYER') {
          g.circle(s.x, s.y, 8, 3);
          g.px(s.x, s.y - 9, 3);
        } else if (s.owner === 'VORN') {
          g.box(s.x - 7, s.y - 7, 15, 15, 2);
        } else {
          g.circle(s.x, s.y, 7, 1);
        }

        if (s.type === 0) {
          g.disc(s.x, s.y, 4, 3);
          g.circle(s.x, s.y, 5, 2);
        } else if (s.type === 1) {
          g.disc(s.x, s.y, 4, 2);
          g.px(s.x, s.y, 3);
          g.px(s.x + 5, s.y - 2, 2);
          g.px(s.x - 5, s.y + 3, 2);
        } else if (s.type === 2) {
          g.disc(s.x, s.y, 3, 3);
          g.line(s.x - 6, s.y, s.x + 6, s.y, 2);
          g.line(s.x, s.y - 6, s.x, s.y + 6, 2);
        } else {
          g.disc(s.x, s.y, 4, 2);
          g.box(s.x - 3, s.y - 3, 7, 7, 3);
        }

        const nameX = s.x - Math.floor(s.name.length * 2.5);
        g.text(s.name, nameX, s.y + 7, isCur ? 3 : 2);

        const pShips = (s.ships.player.scout || 0) + (s.ships.player.colony || 0) +
                      (s.ships.player.battleship || 0) + (s.ships.player.titan || 0);
        const vShips = (s.ships.vorn.scout || 0) + (s.ships.vorn.battleship || 0) + (s.ships.vorn.titan || 0);

        if (pShips > 0) {
          g.tri(s.x - 11, s.y - 5, s.x - 7, s.y - 8, s.x - 7, s.y - 2, 3);
          g.text("" + pShips, s.x - 17, s.y - 6, 3);
        }
        if (vShips > 0) {
          g.px(s.x + 8, s.y - 6, 2);
          g.px(s.x + 9, s.y - 5, 2);
          g.px(s.x + 10, s.y - 6, 2);
          g.text("" + vShips, s.x + 12, s.y - 6, 2);
        }
      }

      if (isCur) {
        const pulse = (Math.floor(this.animTimer * 6) % 2 === 0);
        const c = pulse ? 3 : 2;
        g.line(s.x - 11, s.y - 10, s.x - 8, s.y - 10, c);
        g.line(s.x - 11, s.y - 10, s.x - 11, s.y - 7, c);

        g.line(s.x + 8, s.y - 10, s.x + 11, s.y - 10, c);
        g.line(s.x + 11, s.y - 10, s.x + 11, s.y - 7, c);

        g.line(s.x - 11, s.y + 10, s.x - 8, s.y + 10, c);
        g.line(s.x - 11, s.y + 10, s.x - 11, s.y + 7, c);

        g.line(s.x + 8, s.y + 10, s.x + 11, s.y + 10, c);
        g.line(s.x + 11, s.y + 10, s.x + 11, s.y + 7, c);
      }
    });

    // 4. Top Header HUD Bar (Y: 0 to 18)
    g.rect(0, 0, 256, 18, 0);
    g.line(0, 18, 256, 18, 2);

    const income = this.calcIncome();
    const diffNames = ["EASY", "NORM", "HARD"];
    g.text("T:" + this.turn + "/" + this.maxTurns, 4, 6, 3);
    g.text("SCI:" + this.techProgress + (this.activeTech ? "/" + this.TECHS[this.activeTech].cost : "") + " (+" + income.sci + ")", 52, 6, 2);
    g.text("FLEET:" + this.calcFleetPower('player'), 150, 6, 3);
    g.text(diffNames[this.getDifficulty()], 214, 6, 1);

    // 5. Bottom Command & Inspector Panel (Y: 181 to 240)
    g.rect(0, 181, 256, 59, 0);
    g.line(0, 181, 256, 181, 2);
    g.line(140, 181, 140, 240, 2);

    const sel = this.stars[this.selectedStar];
    if (sel.explored) {
      const ownerLabel = sel.owner === 'PLAYER' ? "[YOU]" : (sel.owner === 'VORN' ? "[VORN HIVE]" : "[UNCLAIMED]");
      const ownerCol = sel.owner === 'PLAYER' ? 3 : (sel.owner === 'VORN' ? 2 : 1);
      g.text(sel.name + " " + ownerLabel, 4, 185, ownerCol);

      if (sel.owner === 'PLAYER') {
        g.text("POP:" + sel.pop + "/" + sel.maxPop + "  PROD:+" + (sel.pop * sel.prodBase) + "  SCI:+" + (sel.pop * sel.sciBase), 4, 196, 2);
        const proj = this.BUILDS.find(b => b.id === sel.buildQueue);
        if (proj && proj.cost > 0) {
          g.text("PROJ:" + proj.name + " (" + sel.buildProgress + "/" + proj.cost + ")", 4, 207, 3);
          const barW = 76;
          const pct = Math.min(1, sel.buildProgress / Math.max(1, proj.cost));
          g.box(4, 216, barW, 4, 2);
          g.rect(4, 216, Math.floor(barW * pct), 4, 3);
        } else {
          g.text("FOCUS:" + (proj ? proj.name : "NONE"), 4, 207, 2);
        }

        const sp = sel.ships.player;
        const fleetStr = "FLEET: " + (sp.scout ? sp.scout + "S " : "") +
                                    (sp.colony ? sp.colony + "C " : "") +
                                    (sp.battleship ? sp.battleship + "B " : "") +
                                    (sp.titan ? sp.titan + "T" : "");
        g.text(fleetStr.length > 7 ? fleetStr : "FLEET: ORBIT EMPTY", 4, 224, 2);
      } else {
        g.text("TYPE:" + sel.desc, 4, 198, 2);
        if (sel.owner === 'NEUTRAL') {
          if (sel.ships.player.colony > 0) {
            g.text("COLONY SHIP IN ORBIT!", 4, 210, 3);
            g.text("TAP [SETTLE] TO COLONIZE WORLD", 4, 222, 3);
          } else {
            g.text("HABITABLE SECTOR", 4, 210, 3);
            g.text("DISPATCH COLONY SHIP TO CLAIM", 4, 222, 1);
          }
        } else {
          g.text("ENEMY FORTIFIED HOMEWORLD", 4, 210, 2);
          g.text("INVADE WITH BATTLESHIPS!", 4, 222, 3);
        }
      }
    } else {
      g.text("SECTOR: UNEXPLORED", 4, 188, 2);
      g.text("DEEP SPACE FOG OF WAR", 4, 204, 1);
      g.text("DISPATCH SCOUT VESSEL TO SCAN", 4, 220, 3);
    }

    // Touch Action Buttons (Right side of bottom panel)
    // 1. [BUILD] / [SETTLE] Button
    const isPlayerWorld = sel.owner === 'PLAYER';
    const canSettle = (sel.owner === 'NEUTRAL' && sel.explored && sel.ships.player.colony > 0);
    const buildActive = isPlayerWorld || canSettle;
    const btnLabel = canSettle ? "SETTLE" : "BUILD";

    g.rect(144, 184, 52, 23, buildActive ? 1 : 0);
    g.box(144, 184, 52, 23, buildActive ? 3 : 1);
    g.textC(btnLabel, 192, buildActive ? 3 : 1);

    // 2. [TECH] Button
    g.rect(200, 184, 52, 23, 1);
    g.box(200, 184, 52, 23, 3);
    g.textC("TECH", 192, 3);

    // 3. [END TURN] Button
    g.rect(144, 211, 108, 25, 2);
    g.box(144, 211, 108, 25, 3);
    g.textC("END TURN [START]", 220, 3);
  },

  // --------------------------------------------------------------------------
  // 13. MODAL DIALOGS RENDERING
  // --------------------------------------------------------------------------
  renderBuildDialog(g) {
    const star = this.stars[this.selectedStar];
    g.rect(20, 22, 216, 188, 0);
    g.box(20, 22, 216, 188, 3);
    g.line(20, 38, 236, 38, 2);

    g.text("SHIPYARD: " + star.name, 28, 28, 3);

    for (let i = 0; i < this.BUILDS.length; i++) {
      const b = this.BUILDS[i];
      const by = 44 + i * 22;
      const isSel = (this.buildCursor === i);
      const isCurrent = (star.buildQueue === b.id);
      const isLocked = b.req && !this.hasTech(b.req);

      if (isSel) {
        g.rect(24, by, 208, 20, 1);
        g.box(24, by, 208, 20, 3);
      } else {
        g.box(24, by, 208, 20, 1);
      }

      const col = isLocked ? 1 : (isSel ? 3 : 2);
      g.text(b.name + (b.cost > 0 ? " (" + b.cost + "P)" : ""), 28, by + 4, col);
      g.text(b.desc, 28, by + 12, isLocked ? 1 : 2);

      if (isCurrent) g.text("[ACTIVE]", 186, by + 6, 3);
      else if (isLocked) g.text("[LOCKED]", 186, by + 6, 1);
    }

    g.rect(88, 182, 80, 18, 1);
    g.box(88, 182, 80, 18, 2);
    g.textC("[B] CLOSE", 188, 3);
  },

  renderTechTree(g) {
    g.rect(0, 0, 256, 240, 0);
    g.box(10, 8, 236, 224, 3);
    g.line(10, 26, 246, 26, 2);

    const income = this.calcIncome();
    g.text("EMPIRE RESEARCH LABS", 16, 14, 3);
    g.text("SCI: " + this.techProgress + " (+" + income.sci + "/TURN)", 156, 14, 2);

    const techKeys = Object.keys(this.TECHS);
    for (let i = 0; i < techKeys.length; i++) {
      const tech = this.TECHS[techKeys[i]];
      const row = Math.floor(i / 2);
      const col = i % 2;
      const bx = 16 + col * 114;
      const by = 34 + row * 40;
      const isSel = (this.techCursor === i);
      const isDone = !!this.researchedTechs[tech.id];
      const isActive = (this.activeTech === tech.id);

      if (isActive) {
        g.rect(bx, by, 110, 36, 1);
        g.box(bx, by, 110, 36, 3);
      } else if (isSel) {
        g.box(bx, by, 110, 36, 3);
      } else {
        g.box(bx, by, 110, 36, isDone ? 2 : 1);
      }

      g.text(tech.name, bx + 4, by + 4, isDone ? 2 : (isActive ? 3 : 2));
      g.text("T" + tech.tier + " | COST: " + tech.cost, bx + 4, by + 13, 1);
      g.text(tech.desc, bx + 4, by + 22, isDone ? 2 : 3);

      if (isDone) g.text("[DONE]", bx + 76, by + 4, 2);
      else if (isActive) g.text("[" + Math.min(100, Math.round(this.techProgress * 100 / tech.cost)) + "%]", bx + 76, by + 4, 3);
    }

    g.rect(88, 196, 80, 18, 1);
    g.box(88, 196, 80, 18, 3);
    g.textC("[B] RETURN TO MAP", 202, 3);
  },

  renderDispatchDialog(g) {
    const origin = this.stars[this.selectedStar];
    const dest = this.stars[this.targetStar];

    g.rect(16, 70, 224, 120, 0);
    g.box(16, 70, 224, 120, 3);
    g.line(16, 88, 240, 88, 2);

    g.text("DISPATCH FLEET TO " + dest.name, 24, 76, 3);

    const sp = origin.ships.player;
    g.text("AVAILABLE: " + sp.scout + " SCOUT, " + sp.colony + " COLONY, " + sp.battleship + " BATTLE", 24, 96, 2);
    g.text("DESTINATION: " + dest.desc, 24, 106, 1);

    // Button Row 1
    g.rect(30, 120, 90, 22, 1); g.box(30, 120, 90, 22, 3);
    g.textC("ALL SHIPS [A]", 127, 3);

    g.rect(136, 120, 90, 22, 1); g.box(136, 120, 90, 22, 2);
    g.textC("SCOUT ONLY", 127, 2);

    // Button Row 2
    g.rect(30, 150, 90, 22, 1); g.box(30, 150, 90, 22, 2);
    g.textC("WARSHIPS ONLY", 157, 2);

    g.rect(136, 150, 90, 22, 1); g.box(136, 150, 90, 22, 1);
    g.textC("CANCEL [B]", 157, 1);
  },

  renderEventPopup(g) {
    const ev = this.eventData;
    g.rect(20, 50, 216, 140, 0);
    g.box(20, 50, 216, 140, 3);
    g.line(20, 70, 236, 70, 2);

    g.text(">>> SENSOR DISCOVERY: " + ev.starName + " <<<", 28, 58, 3);
    g.text(ev.title, 28, 80, 3);
    g.text(ev.text, 28, 96, 2);
    g.text("REWARD: " + ev.reward, 28, 118, 3);

    g.rect(78, 148, 100, 22, 1);
    g.box(78, 148, 100, 22, 3);
    g.textC("CLAIM DISCOVERY [A]", 155, 3);
  },

  renderCombat(g) {
    const cd = this.combatData;
    const star = this.stars[cd.starId];

    g.box(8, 8, 240, 224, 2);
    g.line(8, 26, 248, 26, 2);
    g.textC("ORBITAL CLASH: " + star.name + " (ROUND " + cd.round + ")", 14, 3);

    // Left Side: Human Fleet Squadron
    g.text("UNITED EARTH FLEET", 16, 36, 3);
    const pScout = star.ships.player.scout;
    const pBat = star.ships.player.battleship;
    const pTit = star.ships.player.titan;
    g.text("SHIPS: " + pScout + "S " + pBat + "B " + pTit + "T", 16, 48, 2);

    const pHpPct = Math.min(1, cd.pHp / cd.pMaxHp);
    g.box(16, 58, 80, 7, 2);
    g.rect(16, 58, Math.floor(80 * pHpPct), 7, 3);
    g.text("HP: " + cd.pHp + "/" + cd.pMaxHp, 16, 68, 3);

    // Right Side: Vorn Hive Fleet
    g.text("VORN HIVE FLEET", 152, 36, 2);
    const vBat = star.ships.vorn.battleship;
    const vScout = star.ships.vorn.scout;
    g.text("SHIPS: " + vScout + "D " + vBat + "R", 152, 48, 2);

    const vHpPct = Math.min(1, cd.vHp / cd.vMaxHp);
    g.box(152, 58, 80, 7, 2);
    g.rect(152, 58, Math.floor(80 * vHpPct), 7, 2);
    g.text("HP: " + cd.vHp + "/" + cd.vMaxHp, 152, 68, 2);

    // Lasers & Particles
    cd.lasers.forEach(l => {
      g.line(Math.floor(l.x0), Math.floor(l.y0), Math.floor(l.x1), Math.floor(l.y1), l.color);
    });

    cd.particles.forEach(p => {
      g.px(Math.floor(p.x), Math.floor(p.y), p.c);
    });

    // Central Star Planet Icon
    g.disc(124, 110, 8, 1);
    g.circle(124, 110, 8, 2);

    // Bottom Combat Log Ticker
    g.rect(16, 152, 224, 46, 0);
    g.box(16, 152, 224, 46, 1);
    for (let i = 0; i < cd.log.length; i++) {
      g.text(cd.log[i], 22, 156 + i * 10, i === cd.log.length - 1 ? 3 : 2);
    }

    g.rect(68, 204, 120, 20, 1);
    g.box(68, 204, 120, 20, 3);
    if (cd.subState === 'CLASH') {
      g.textC("[A] FAST FORWARD / ADVANCE", 210, 3);
    } else {
      g.textC("[A] CONTINUE AFTERMATH", 210, 3);
    }
  },

  renderGameOver(g) {
    g.rect(0, 0, 256, 240, 0);
    g.box(12, 10, 232, 220, 3);
    g.line(12, 34, 244, 34, 2);

    if (this.endGameType === 'CONQUEST') {
      g.textC("*** CONQUEST VICTORY ***", 18, 3);
      g.textC("VORN PRIME CRUSHED! GALAXY LIBERATED!", 26, 2);
    } else if (this.endGameType === 'DOMINION') {
      g.textC("*** 25-TURN CAMPAIGN COMPLETE ***", 18, 3);
      g.textC("GALACTIC EMPIRE RANKING ESTABLISHED", 26, 2);
    } else {
      g.textC("*** EMPIRE COLLAPSED ***", 18, 2);
      g.textC("SOL HOMEWORLD OVERRUN BY THE HIVE", 26, 1);
    }

    let colonized = 0, totalPop = 0, anomalies = 0;
    this.stars.forEach(s => {
      if (s.owner === 'PLAYER') { colonized++; totalPop += s.pop; }
      if (s.anomalyClaimed) anomalies++;
    });
    const fleetPower = this.calcFleetPower('player');
    const techCount = Object.keys(this.researchedTechs).length;
    const finalScore = this.calcScore();

    g.text("COLONIZED WORLDS: " + colonized + " (x25 PTS)", 24, 46, 2);
    g.text("TOTAL POPULATION: " + totalPop + " (x10 PTS)", 24, 58, 2);
    g.text("RESEARCH ADVANCES: " + techCount + " (x30 PTS)", 24, 70, 2);
    g.text("MILITARY POWER:    " + fleetPower + " (x15 PTS)", 24, 82, 2);
    g.text("ANOMALIES FOUND:   " + anomalies + " (x10 PTS)", 24, 94, 2);

    if (this.stars[8].owner === 'PLAYER') {
      g.text("VORN PRIME CRUSHED: +150 PTS", 24, 106, 3);
    }

    g.line(24, 120, 232, 120, 2);
    g.textC("FINAL EMPIRE SCORE: " + finalScore, 130, 3);

    let rank = "PROVINCIAL CADET (D)";
    if (finalScore >= 600) rank = "GALACTIC EMPEROR (S)";
    else if (finalScore >= 420) rank = "STAR OVERLORD (A)";
    else if (finalScore >= 280) rank = "FLEET ADMIRAL (B)";
    else if (finalScore >= 160) rank = "SECTOR GOVERNOR (C)";

    g.textC("RANK: " + rank, 146, 3);

    const high = SAVE.getScore(this.id);
    g.textC("ALL-TIME HIGH SCORE: " + high, 168, 2);

    g.rect(68, 192, 120, 24, 1);
    g.box(68, 192, 120, 24, 3);
    g.textC("[A] PLAY AGAIN", 200, 3);
  }
};
