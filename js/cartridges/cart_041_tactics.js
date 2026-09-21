// js/cartridges/cart_041_tactics.js
// ============================================================================
// Cartridge #041: TACTICS
// Genre: STRATEGY (4) | Turn-based Tactical Squad Warfare
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[41] = {
  id: 41,
  name: "TACTICS",
  genre: 4,
  scoreLabel: "WINS",
  desc: "TURN-BASED TACTICAL GRID: SWORD, SPEAR, ARCHER. OUTSMART ENEMY SQUAD!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Crossed sword and spear behind a riveted knight kite shield with banner laurels
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Crossed weapons behind shield:
    // 1. Broadsword blade (top-left to bottom-right)
    g.line(x + 5, y + 5, x + 26, y + 26, 3);
    g.line(x + 6, y + 5, x + 26, y + 25, 2);
    // Sword crossguard & pommel
    g.line(x + 4, y + 9, x + 9, y + 4, 3);
    g.px(x + 3, y + 3, 3);

    // 2. Spear (top-right to bottom-left)
    g.line(x + 26, y + 5, x + 5, y + 26, 2);
    // Pointed spearhead
    g.tri(x + 26, y + 3, x + 23, y + 8, x + 28, y + 8, 3);
    g.px(x + 26, y + 2, 3);

    // 3. Central Riveted Knight Kite Shield
    // Upper shield body
    g.rect(x + 10, y + 9, 12, 6, 2);
    // Lower tapering triangle to point
    g.tri(x + 10, y + 14, x + 21, y + 14, x + 15, y + 24, 2);
    g.tri(x + 10, y + 15, x + 21, y + 15, x + 16, y + 24, 2);

    // Shield rim / border
    g.line(x + 10, y + 8, x + 21, y + 8, 3);
    g.line(x + 9, y + 9, x + 9, y + 14, 3);
    g.line(x + 22, y + 9, x + 22, y + 14, 3);
    g.line(x + 9, y + 14, x + 15, y + 25, 3);
    g.line(x + 22, y + 14, x + 16, y + 25, 3);
    g.px(x + 15, y + 25, 3);

    // Rivets on shield corners
    g.px(x + 10, y + 9, 3);
    g.px(x + 21, y + 9, 3);
    g.px(x + 10, y + 14, 3);
    g.px(x + 21, y + 14, 3);

    // Shield Heraldry: Central Crusader Cross
    g.line(x + 15, y + 11, x + 16, y + 20, 3);
    g.line(x + 12, y + 13, x + 19, y + 13, 3);

    // 4. Banner Laurels at base
    // Left branch
    g.line(x + 6, y + 24, x + 10, y + 28, 3);
    g.line(x + 10, y + 28, x + 14, y + 29, 2);
    g.px(x + 5, y + 23, 3);
    g.px(x + 8, y + 26, 3);
    // Right branch
    g.line(x + 25, y + 24, x + 21, y + 28, 3);
    g.line(x + 21, y + 28, x + 17, y + 29, 2);
    g.px(x + 26, y + 23, 3);
    g.px(x + 23, y + 26, 3);
    // Center ribbon knot
    g.rect(x + 14, y + 28, 4, 2, 3);
  },

  // --------------------------------------------------------------------------
  // 2. TERRAIN CONSTANTS & DEFINITIONS
  // --------------------------------------------------------------------------
  T_PLAINS: 0,
  T_FOREST: 1,
  T_MOUNTAIN: 2,
  T_WATER: 3,
  T_BRIDGE: 4,
  T_HQ_PLAYER: 5,
  T_HQ_ENEMY: 6,
  T_FORT: 7,

  TERRAINS: {
    0: { name: "PLAINS", def: 0, cost: { S: 1, P: 1, A: 1 }, desc: "CLEAR GROUND" },
    1: { name: "FOREST", def: 1, cost: { S: 2, P: 2, A: 2 }, desc: "COVER +1D SLOW" },
    2: { name: "MOUNTAIN", def: 2, cost: { S: 99, P: 99, A: 2 }, desc: "ARCHER +1R RNG" },
    3: { name: "WATER", def: 0, cost: { S: 99, P: 99, A: 99 }, desc: "IMPASSABLE" },
    4: { name: "BRIDGE", def: 0, cost: { S: 1, P: 1, A: 1 }, desc: "CHOKEWAY" },
    5: { name: "BASE (P)", def: 2, cost: { S: 1, P: 1, A: 1 }, regen: 1, desc: "HQ REGEN +1HP" },
    6: { name: "BASE (E)", def: 2, cost: { S: 1, P: 1, A: 1 }, regen: 1, desc: "FOE HQ TARGET" },
    7: { name: "FORTRESS", def: 2, cost: { S: 1, P: 1, A: 1 }, regen: 1, desc: "FORT REGEN+1" }
  },

  // --------------------------------------------------------------------------
  // 3. SQUAD CLASSES SPECIFICATIONS
  // --------------------------------------------------------------------------
  CLASSES: {
    S: {
      type: 'S',
      name: 'SWORDSMAN',
      shortName: 'SWORD',
      maxHp: 4,
      move: 3,
      atk: 2,
      def: 1,
      minRng: 1,
      maxRng: 1,
      reach: false,
      desc: 'ARMORED MELEE. COUNTERS ADJACENT.'
    },
    P: {
      type: 'P',
      name: 'SPEARMAN',
      shortName: 'SPEAR',
      maxHp: 3,
      move: 3,
      atk: 2,
      def: 0,
      minRng: 1,
      maxRng: 2,
      reach: true,
      desc: 'REACH 1-2. SAFELY POKES DIST 2.'
    },
    A: {
      type: 'A',
      name: 'ARCHER',
      shortName: 'ARCHER',
      maxHp: 2,
      move: 2,
      atk: 2,
      def: 0,
      minRng: 2,
      maxRng: 3,
      reach: false,
      desc: 'RANGE 2-3. NO MELEE. +1R ON MT.'
    }
  },

  // --------------------------------------------------------------------------
  // 4. CAMPAIGN MAPS (5 TACTICAL STAGES)
  // --------------------------------------------------------------------------
  MAPS: [
    {
      name: "SKIRMISH",
      desc: "ROUT PATROL OR TAKE FOE HQ",
      tiles: [
        0, 0, 1, 0, 0, 1, 0, 0,
        0, 5, 0, 0, 0, 0, 6, 0,
        0, 0, 0, 1, 1, 0, 0, 0,
        1, 0, 2, 2, 0, 0, 0, 1,
        1, 0, 0, 2, 2, 0, 0, 1,
        0, 0, 0, 1, 1, 0, 0, 0,
        0, 5, 0, 0, 0, 0, 6, 0,
        0, 0, 1, 0, 0, 1, 0, 0
      ],
      units: [
        { type: 'S', player: true, x: 1, y: 2 },
        { type: 'P', player: true, x: 1, y: 3 },
        { type: 'A', player: true, x: 0, y: 4 },
        { type: 'S', player: false, x: 6, y: 5 },
        { type: 'P', player: false, x: 6, y: 4 },
        { type: 'A', player: false, x: 7, y: 3 }
      ]
    },
    {
      name: "FOREST CHOKE",
      desc: "AMBUSH IN THE WOODS",
      tiles: [
        1, 1, 0, 0, 0, 0, 1, 1,
        1, 0, 0, 1, 1, 0, 0, 1,
        0, 5, 1, 7, 7, 1, 6, 0,
        0, 0, 1, 0, 0, 1, 0, 0,
        0, 0, 1, 0, 0, 1, 0, 0,
        0, 5, 1, 7, 7, 1, 6, 0,
        1, 0, 0, 1, 1, 0, 0, 1,
        1, 1, 0, 0, 0, 0, 1, 1
      ],
      units: [
        { type: 'S', player: true, x: 1, y: 3 },
        { type: 'S', player: true, x: 1, y: 4 },
        { type: 'P', player: true, x: 0, y: 2 },
        { type: 'A', player: true, x: 0, y: 5 },
        { type: 'S', player: false, x: 6, y: 3 },
        { type: 'S', player: false, x: 6, y: 4 },
        { type: 'P', player: false, x: 7, y: 2 },
        { type: 'A', player: false, x: 7, y: 5 }
      ]
    },
    {
      name: "BRIDGE CROSSING",
      desc: "DEFEND TWIN BRIDGES",
      tiles: [
        0, 0, 0, 3, 3, 0, 0, 0,
        0, 5, 0, 3, 3, 0, 6, 0,
        0, 0, 0, 4, 4, 0, 0, 0,
        0, 1, 0, 3, 3, 0, 1, 0,
        0, 1, 0, 3, 3, 0, 1, 0,
        0, 0, 0, 4, 4, 0, 0, 0,
        0, 5, 0, 3, 3, 0, 6, 0,
        0, 0, 0, 3, 3, 0, 0, 0
      ],
      units: [
        { type: 'S', player: true, x: 2, y: 2 },
        { type: 'S', player: true, x: 2, y: 5 },
        { type: 'P', player: true, x: 1, y: 2 },
        { type: 'P', player: true, x: 1, y: 5 },
        { type: 'A', player: true, x: 0, y: 3 },
        { type: 'S', player: false, x: 5, y: 2 },
        { type: 'S', player: false, x: 5, y: 5 },
        { type: 'P', player: false, x: 6, y: 2 },
        { type: 'P', player: false, x: 6, y: 5 },
        { type: 'A', player: false, x: 7, y: 4 }
      ]
    },
    {
      name: "MOUNTAIN PASS",
      desc: "SEIZE THE HIGH GROUND",
      tiles: [
        0, 0, 2, 2, 2, 2, 0, 0,
        0, 5, 0, 2, 2, 0, 6, 0,
        0, 0, 1, 0, 0, 1, 0, 0,
        0, 1, 2, 2, 2, 2, 1, 0,
        0, 1, 2, 2, 2, 2, 1, 0,
        0, 0, 1, 0, 0, 1, 0, 0,
        0, 5, 0, 2, 2, 0, 6, 0,
        0, 0, 2, 2, 2, 2, 0, 0
      ],
      units: [
        { type: 'S', player: true, x: 1, y: 2 },
        { type: 'P', player: true, x: 1, y: 5 },
        { type: 'A', player: true, x: 1, y: 3 },
        { type: 'A', player: true, x: 1, y: 4 },
        { type: 'S', player: false, x: 6, y: 2 },
        { type: 'P', player: false, x: 6, y: 5 },
        { type: 'A', player: false, x: 6, y: 3 },
        { type: 'A', player: false, x: 6, y: 4 }
      ]
    },
    {
      name: "CASTLE SIEGE",
      desc: "STORM THE ROYAL FORTRESS",
      tiles: [
        0, 0, 0, 0, 3, 3, 7, 6,
        0, 5, 0, 0, 3, 3, 7, 7,
        0, 0, 1, 0, 3, 4, 0, 0,
        0, 1, 0, 0, 3, 3, 0, 1,
        0, 0, 0, 0, 3, 3, 0, 1,
        0, 0, 1, 0, 3, 4, 0, 0,
        0, 5, 0, 0, 3, 3, 7, 7,
        0, 0, 0, 0, 3, 3, 7, 6
      ],
      units: [
        { type: 'S', player: true, x: 1, y: 1 },
        { type: 'S', player: true, x: 1, y: 6 },
        { type: 'P', player: true, x: 2, y: 2 },
        { type: 'P', player: true, x: 2, y: 5 },
        { type: 'A', player: true, x: 0, y: 3 },
        { type: 'A', player: true, x: 0, y: 4 },
        { type: 'S', player: false, x: 7, y: 0, isBoss: true },
        { type: 'S', player: false, x: 6, y: 2 },
        { type: 'P', player: false, x: 6, y: 5 },
        { type: 'A', player: false, x: 7, y: 1 },
        { type: 'A', player: false, x: 7, y: 7 }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // 5. INITIALIZATION & STATE MANAGEMENT
  // --------------------------------------------------------------------------
  init() {
    this.mapIdx = 0;
    this.wins = (typeof SAVE !== 'undefined' && SAVE.getScore) ? (SAVE.getScore(this.id) || 0) : 0;
    this.gridOx = 10;
    this.gridOy = 24;
    this.tileSize = 22;
    this.gridW = 8;
    this.gridH = 8;

    this.cursor = { x: 1, y: 2 };
    this.animTimer = 0;
    this.particles = [];
    this.floatTexts = [];
    this.combatAnim = null;
    this.aiState = null;

    this.loadMap(this.mapIdx);
  },

  loadMap(idx) {
    this.cursor = this.cursor || { x: 1, y: 2 };
    this.particles = this.particles || [];
    this.floatTexts = this.floatTexts || [];
    this.gridOx = this.gridOx || 10;
    this.gridOy = this.gridOy || 24;
    this.tileSize = this.tileSize || 22;
    this.gridW = this.gridW || 8;
    this.gridH = this.gridH || 8;

    this.mapIdx = idx % this.MAPS.length;
    const mapDef = this.MAPS[this.mapIdx];
    this.tiles = [...mapDef.tiles];
    this.turnCount = 1;
    this.phase = 'PLAYER'; // 'PLAYER' | 'ENEMY'
    this.subState = 'SELECT'; // 'SELECT' | 'MOVE' | 'ACTION' | 'TARGET' | 'COMBAT' | 'VICTORY' | 'DEFEAT' | 'ALL_CLEARED'

    // Instantiate units with full state
    this.units = mapDef.units.map((uDef, index) => {
      const cls = this.CLASSES[uDef.type];
      const maxHp = uDef.isBoss ? (cls.maxHp + 1) : cls.maxHp;
      return {
        id: index + 1,
        type: uDef.type,
        player: uDef.player,
        x: uDef.x,
        y: uDef.y,
        hp: maxHp,
        maxHp: maxHp,
        atk: uDef.isBoss ? (cls.atk + 1) : cls.atk,
        def: cls.def,
        move: cls.move,
        minRng: cls.minRng,
        maxRng: cls.maxRng,
        hasActed: false,
        isBoss: !!uDef.isBoss
      };
    });

    this.selectedUnit = null;
    this.moveStartTile = null;
    this.moveTiles = [];
    this.targetUnits = [];
    this.targetIdx = 0;
    this.actionMenuIdx = 0; // 0 = ATTACK, 1 = WAIT

    // Place cursor on first ready player unit
    const firstP = this.units.find(u => u.player && u.hp > 0);
    if (firstP) {
      this.cursor.x = firstP.x;
      this.cursor.y = firstP.y;
    }
  },

  save() {
    return { mapIdx: this.mapIdx, wins: this.wins };
  },

  load(data) {
    if (data && typeof data.mapIdx === 'number') {
      this.wins = data.wins || this.wins;
      this.loadMap(data.mapIdx);
    }
  },

  // --------------------------------------------------------------------------
  // 6. TACTICAL GRID & PATHFINDING HELPERS
  // --------------------------------------------------------------------------
  getTerrain(x, y) {
    if (x < 0 || x >= this.gridW || y < 0 || y >= this.gridH) return this.T_WATER;
    return this.tiles[y * this.gridW + x];
  },

  getUnitAt(x, y) {
    return this.units.find(u => u.hp > 0 && u.x === x && u.y === y) || null;
  },

  getEffectiveMaxRange(unit, atX, atY) {
    if (unit.type === 'A') {
      const t = this.getTerrain(atX, atY);
      return (t === this.T_MOUNTAIN) ? 4 : 3;
    }
    return unit.maxRng;
  },

  computeReachableTiles(unit) {
    const reachable = [];
    const visited = new Map();
    const q = [{ x: unit.x, y: unit.y, costLeft: unit.move }];
    visited.set(unit.y * this.gridW + unit.x, unit.move);

    while (q.length > 0) {
      const cur = q.shift();
      const key = cur.y * this.gridW + cur.x;
      if (visited.get(key) > cur.costLeft) continue;

      const occ = this.getUnitAt(cur.x, cur.y);
      if (!occ || occ === unit) {
        reachable.push({ x: cur.x, y: cur.y });
      }

      const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (let [dx, dy] of dirs) {
        const nx = cur.x + dx;
        const ny = cur.y + dy;
        if (nx < 0 || nx >= this.gridW || ny < 0 || ny >= this.gridH) continue;

        // Enemy units completely block passage
        const blocker = this.getUnitAt(nx, ny);
        if (blocker && blocker.player !== unit.player) continue;

        const terrId = this.getTerrain(nx, ny);
        const terrDef = this.TERRAINS[terrId];
        const enterCost = terrDef.cost[unit.type] || 99;
        if (enterCost > 50) continue; // Impassable terrain

        const nextCost = cur.costLeft - enterCost;
        if (nextCost >= 0) {
          const nKey = ny * this.gridW + nx;
          if (!visited.has(nKey) || visited.get(nKey) < nextCost) {
            visited.set(nKey, nextCost);
            q.push({ x: nx, y: ny, costLeft: nextCost });
          }
        }
      }
    }
    return reachable;
  },

  canAttackFrom(attacker, ax, ay, defender, tx, ty) {
    const dx = Math.abs(tx - ax);
    const dy = Math.abs(ty - ay);
    const dist = dx + dy;

    if (attacker.type === 'S') {
      return dist === 1;
    }
    if (attacker.type === 'P') {
      // Straight line cardinal reach attack 1 or 2 tiles
      const isStraight = (dx === 0 && dy >= 1 && dy <= 2) || (dy === 0 && dx >= 1 && dx <= 2);
      return isStraight;
    }
    if (attacker.type === 'A') {
      // Ranged parabolic arrow attack 2-3 (or 2-4 on mountain)
      const maxR = this.getEffectiveMaxRange(attacker, ax, ay);
      return dist >= 2 && dist <= maxR;
    }
    return false;
  },

  canCounterAttack(defender, tx, ty, attacker, ax, ay) {
    if (defender.hp <= 0) return false;
    const dx = Math.abs(ax - tx);
    const dy = Math.abs(ay - ty);
    const dist = dx + dy;

    // Swordsman counters adjacent melee attackers
    if (defender.type === 'S') {
      return dist === 1;
    }
    // Spearman reach counters if straight line distance <= 2
    if (defender.type === 'P') {
      const isStraight = (dx === 0 && dy >= 1 && dy <= 2) || (dy === 0 && dx >= 1 && dx <= 2);
      // If attacker is an archer shooting from afar, melee pikeman cannot counter
      if (attacker.type === 'A') return false;
      return isStraight;
    }
    // Archer cannot counter at melee range 1
    if (defender.type === 'A') {
      if (dist === 1) return false;
      // Archer can counter enemy archers or ranged strikes within its bow range
      const maxR = this.getEffectiveMaxRange(defender, tx, ty);
      return dist >= 2 && dist <= maxR;
    }
    return false;
  },

  calculateCombatForecast(attacker, defender, ax, ay, tx, ty) {
    // 1. Attacker Damage
    let atkPower = (attacker.atk !== undefined) ? attacker.atk : (this.CLASSES[attacker.type] ? this.CLASSES[attacker.type].atk : 2);
    // Weapon triangle / Class advantages:
    // Archers deal bonus damage to unarmored Spearmen
    if (attacker.type === 'A' && defender.type === 'P') atkPower += 1;
    // Swordsmen deal bonus damage to Archers in close quarters
    if (attacker.type === 'S' && defender.type === 'A' && (Math.abs(tx - ax) + Math.abs(ty - ay) === 1)) atkPower += 1;

    const defTerr = this.getTerrain(tx, ty);
    const defCover = (this.TERRAINS[defTerr] && this.TERRAINS[defTerr].def) || 0;
    const defStat = (defender.def !== undefined) ? defender.def : (this.CLASSES[defender.type] ? this.CLASSES[defender.type].def : 0);
    const totalDef = defCover + defStat;
    const atkDmg = Math.max(1, atkPower - totalDef);

    // 2. Defender Counter Damage
    const canCounter = this.canCounterAttack(defender, tx, ty, attacker, ax, ay);
    let defDmg = 0;
    if (canCounter) {
      let ctrPower = (defender.atk !== undefined) ? defender.atk : (this.CLASSES[defender.type] ? this.CLASSES[defender.type].atk : 2);
      if (defender.type === 'A' && attacker.type === 'P') ctrPower += 1;
      if (defender.type === 'S' && attacker.type === 'A' && (Math.abs(tx - ax) + Math.abs(ty - ay) === 1)) ctrPower += 1;

      const atkTerr = this.getTerrain(ax, ay);
      const atkCover = (this.TERRAINS[atkTerr] && this.TERRAINS[atkTerr].def) || 0;
      const atkDefStat = (attacker.def !== undefined) ? attacker.def : (this.CLASSES[attacker.type] ? this.CLASSES[attacker.type].def : 0);
      const totalAtkDef = atkCover + atkDefStat;
      defDmg = Math.max(1, ctrPower - totalAtkDef);
    }

    return {
      atkDmg,
      canCounter,
      defDmg,
      defCover
    };
  },

  // --------------------------------------------------------------------------
  // 7. AUDIO & SFX DISPATCHER
  // --------------------------------------------------------------------------
  playSfx(type) {
    if (typeof APU === 'undefined') return;
    switch (type) {
      case 'MOVE':
        APU.sfx('UI_MOVE');
        break;
      case 'SELECT':
        APU.sfx('UI_OK');
        break;
      case 'CANCEL':
        APU.sfx('UI_BACK');
        break;
      case 'SWORD':
        APU.sfx('HIT');
        break;
      case 'SPEAR':
        APU.sfx('HIT');
        if (APU.softTone) APU.softTone(320, 0.05, 'triangle', 0.1, 0, 0.005, 900);
        break;
      case 'BOW':
        // Twang audio
        APU.sfx('CONFIRM');
        if (APU.tone) APU.tone(480, 0.08, 'triangle', 0.12, 960);
        break;
      case 'CRIT':
        APU.sfx('EXPLODE');
        APU.sfx('BOOM');
        break;
      case 'DEATH':
        APU.sfx('BOOM');
        break;
      case 'VICTORY':
        APU.sfx('LEVELUP');
        break;
      case 'REGEN':
        APU.sfx('COIN');
        break;
      case 'TURN':
        if (APU.softTone) {
          APU.softTone(440, 0.12, 'sine', 0.08, 0, 0.02, 1400);
          APU.softTone(659, 0.18, 'sine', 0.08, 0.08, 0.02, 1400);
        }
        break;
    }
  },

  // --------------------------------------------------------------------------
  // 8. COMBAT ANIMATION & RESOLUTION
  // --------------------------------------------------------------------------
  triggerCombat(attacker, defender, onComplete) {
    const ax = attacker.x, ay = attacker.y;
    const tx = defender.x, ty = defender.y;
    const forecast = this.calculateCombatForecast(attacker, defender, ax, ay, tx, ty);

    // 18% Critical strike probability
    const isCrit = Math.random() < 0.18;
    const finalAtkDmg = isCrit ? (forecast.atkDmg * 2) : forecast.atkDmg;

    // SFX for initial attack
    if (attacker.type === 'A') {
      this.playSfx('BOW');
    } else if (attacker.type === 'P') {
      this.playSfx('SPEAR');
    } else {
      this.playSfx('SWORD');
    }

    const startPxX = this.gridOx + ax * this.tileSize + 11;
    const startPxY = this.gridOy + ay * this.tileSize + 11;
    const targetPxX = this.gridOx + tx * this.tileSize + 11;
    const targetPxY = this.gridOy + ty * this.tileSize + 11;

    this.combatAnim = {
      attacker,
      defender,
      ax, ay, tx, ty,
      forecast,
      isCrit,
      finalAtkDmg,
      stage: 'ATTACK', // 'ATTACK' | 'COUNTER' | 'DONE'
      timer: 0,
      duration: (attacker.type === 'A') ? 0.38 : 0.28,
      startPxX, startPxY,
      targetPxX, targetPxY,
      onComplete
    };
    this.subState = 'COMBAT';
  },

  updateCombat(dt) {
    if (!this.combatAnim) return;
    const anim = this.combatAnim;
    anim.timer += dt;

    if (anim.stage === 'ATTACK') {
      if (anim.timer >= anim.duration) {
        // Attack lands!
        if (anim.isCrit) {
          this.playSfx('CRIT');
          this.addFloatText(anim.targetPxX, anim.targetPxY - 8, `CRIT! -${anim.finalAtkDmg}`, 3);
        } else {
          this.playSfx(anim.attacker.type === 'A' ? 'SWORD' : 'SWORD');
          this.addFloatText(anim.targetPxX, anim.targetPxY - 8, `-${anim.finalAtkDmg}`, 3);
        }
        this.addSparks(anim.targetPxX, anim.targetPxY, anim.isCrit ? 14 : 8);

        // Apply damage to defender
        anim.defender.hp = Math.max(0, anim.defender.hp - anim.finalAtkDmg);

        if (anim.defender.hp <= 0) {
          this.playSfx('DEATH');
          this.addSparks(anim.targetPxX, anim.targetPxY, 18);
          // Defender eliminated! No counter attack possible
          anim.stage = 'DONE';
          anim.timer = 0;
          anim.duration = 0.25;
        } else if (anim.forecast.canCounter) {
          // Defender survived and counter-attacks!
          anim.stage = 'COUNTER';
          anim.timer = 0;
          anim.duration = (anim.defender.type === 'A') ? 0.38 : 0.28;
          if (anim.defender.type === 'A') this.playSfx('BOW');
          else if (anim.defender.type === 'P') this.playSfx('SPEAR');
          else this.playSfx('SWORD');
        } else {
          anim.stage = 'DONE';
          anim.timer = 0;
          anim.duration = 0.25;
        }
      }
    } else if (anim.stage === 'COUNTER') {
      if (anim.timer >= anim.duration) {
        // Counter attack lands
        this.playSfx('SWORD');
        this.addSparks(anim.startPxX, anim.startPxY, 8);
        this.addFloatText(anim.startPxX, anim.startPxY - 8, `-${anim.forecast.defDmg}`, 2);

        anim.attacker.hp = Math.max(0, anim.attacker.hp - anim.forecast.defDmg);
        if (anim.attacker.hp <= 0) {
          this.playSfx('DEATH');
          this.addSparks(anim.startPxX, anim.startPxY, 18);
        }

        anim.stage = 'DONE';
        anim.timer = 0;
        anim.duration = 0.25;
      }
    } else if (anim.stage === 'DONE') {
      if (anim.timer >= anim.duration) {
        const cb = anim.onComplete;
        this.combatAnim = null;
        if (cb) cb();
      }
    }
  },

  addFloatText(x, y, text, color = 3) {
    this.floatTexts.push({ x, y, text, color, life: 0.8, maxLife: 0.8 });
  },

  addSparks(cx, cy, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 20 + Math.random() * 55;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.35 + Math.random() * 0.25,
        color: (Math.random() < 0.6) ? 3 : 2
      });
    }
  },

  // --------------------------------------------------------------------------
  // 9. TURN MANAGEMENT & WIN/LOSS CONDITIONS
  // --------------------------------------------------------------------------
  checkObjectives() {
    const playerUnits = this.units.filter(u => u.player && u.hp > 0);
    const enemyUnits = this.units.filter(u => !u.player && u.hp > 0);

    // Defeat condition: all player units eliminated or enemy captures player HQ
    let playerHqCaptured = false;
    let enemyHqCaptured = false;

    for (let y = 0; y < this.gridH; y++) {
      for (let x = 0; x < this.gridW; x++) {
        const t = this.getTerrain(x, y);
        const occ = this.getUnitAt(x, y);
        if (t === this.T_HQ_PLAYER && occ && !occ.player) playerHqCaptured = true;
        if (t === this.T_HQ_ENEMY && occ && occ.player) enemyHqCaptured = true;
      }
    }

    if (playerUnits.length === 0 || playerHqCaptured) {
      this.subState = 'DEFEAT';
      this.playSfx('DEATH');
      return true;
    }

    // Victory condition: all enemy units eliminated or player captures enemy HQ
    if (enemyUnits.length === 0 || enemyHqCaptured) {
      this.wins++;
      if (typeof SAVE !== 'undefined' && SAVE.setScore) {
        SAVE.setScore(this.id, this.wins);
      }
      this.playSfx('VICTORY');
      if (this.mapIdx >= this.MAPS.length - 1) {
        this.subState = 'ALL_CLEARED';
      } else {
        this.subState = 'VICTORY';
      }
      return true;
    }

    return false;
  },

  endPlayerTurn() {
    if (this.subState !== 'SELECT' && this.subState !== 'MOVE' && this.subState !== 'ACTION') return;
    this.selectedUnit = null;
    this.moveTiles = [];
    this.targetUnits = [];

    // Reset acted flag on player units
    this.units.forEach(u => {
      if (u.player) u.hasActed = false;
    });

    this.phase = 'ENEMY';
    this.playSfx('TURN');

    // Regenerate HP on enemy HQ / fortress tiles
    this.units.forEach(u => {
      if (!u.player && u.hp > 0) {
        const t = this.getTerrain(u.x, u.y);
        const tDef = this.TERRAINS[t];
        if (tDef && tDef.regen && u.hp < u.maxHp) {
          u.hp = Math.min(u.maxHp, u.hp + tDef.regen);
          this.addFloatText(this.gridOx + u.x * this.tileSize + 11, this.gridOy + u.y * this.tileSize + 4, '+1 HP', 3);
        }
      }
    });

    this.startEnemyTurn();
  },

  startEnemyTurn() {
    const enemyUnits = this.units.filter(u => !u.player && u.hp > 0);
    this.aiState = {
      queue: [...enemyUnits],
      unitIdx: 0,
      step: 'THINK', // 'THINK' | 'MOVING' | 'ATTACK' | 'WAIT'
      timer: 0.15,
      currentAction: null
    };
  },

  endEnemyTurn() {
    this.phase = 'PLAYER';
    this.turnCount++;
    this.playSfx('TURN');

    // Reset acted flags
    this.units.forEach(u => {
      u.hasActed = false;
      // Regenerate player units on friendly HQ or fortress
      if (u.player && u.hp > 0) {
        const t = this.getTerrain(u.x, u.y);
        const tDef = this.TERRAINS[t];
        if (tDef && tDef.regen && u.hp < u.maxHp) {
          u.hp = Math.min(u.maxHp, u.hp + tDef.regen);
          this.addFloatText(this.gridOx + u.x * this.tileSize + 11, this.gridOy + u.y * this.tileSize + 4, '+1 HP', 3);
        }
      }
    });

    this.subState = 'SELECT';
    const firstReady = this.units.find(u => u.player && u.hp > 0);
    if (firstReady) {
      this.cursor.x = firstReady.x;
      this.cursor.y = firstReady.y;
    }
  },

  // --------------------------------------------------------------------------
  // 10. TACTICAL ENEMY AI DECISION TREE
  // --------------------------------------------------------------------------
  computeBestActionForAI(aiUnit) {
    const reachable = this.computeReachableTiles(aiUnit);
    let bestScore = -9999;
    let bestAction = { moveX: aiUnit.x, moveY: aiUnit.y, target: null };

    const playerUnits = this.units.filter(u => u.player && u.hp > 0);

    for (let pos of reachable) {
      // Find candidate targets from this position
      const validTargets = [];
      for (let p of playerUnits) {
        if (this.canAttackFrom(aiUnit, pos.x, pos.y, p, p.x, p.y)) {
          validTargets.push(p);
        }
      }

      if (validTargets.length > 0) {
        for (let target of validTargets) {
          const forecast = this.calculateCombatForecast(aiUnit, target, pos.x, pos.y, target.x, target.y);
          let score = 200;

          // Priority: Damage dealt
          score += forecast.atkDmg * 40;

          // High Priority: Eliminating a player unit
          if (target.hp <= forecast.atkDmg) {
            score += 350;
          }

          // Penalize counter-damage
          if (forecast.canCounter) {
            score -= forecast.defDmg * 25;
            // Heavily penalize suicide unless killing player target
            if (aiUnit.hp <= forecast.defDmg && target.hp > forecast.atkDmg) {
              score -= 300;
            }
          }

          // Archer specific tactics: stay at range and avoid adjacent melee
          if (aiUnit.type === 'A') {
            const dist = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y);
            if (dist >= 2) score += 40;
            // Vulnerable to adjacent player units
            for (let p of playerUnits) {
              if (Math.abs(p.x - pos.x) + Math.abs(p.y - pos.y) === 1) score -= 90;
            }
          }

          // Spearman reach advantage: dist 2 without receiving counter
          if (aiUnit.type === 'P' && !forecast.canCounter) {
            score += 50;
          }

          // Terrain cover incentive
          score += forecast.defCover * 20;

          // Target player HQ
          const terr = this.getTerrain(pos.x, pos.y);
          if (terr === this.T_HQ_PLAYER) score += 500;

          if (score > bestScore) {
            bestScore = score;
            bestAction = { moveX: pos.x, moveY: pos.y, target };
          }
        }
      } else {
        // No target directly reachable; advance toward player units or player HQ
        let score = 0;
        let minDist = 99;
        for (let p of playerUnits) {
          const d = Math.abs(p.x - pos.x) + Math.abs(p.y - pos.y);
          if (d < minDist) minDist = d;
        }
        score -= minDist * 12;

        // Archer keeps safe distance (around 3 tiles)
        if (aiUnit.type === 'A') {
          if (minDist === 3) score += 30;
          if (minDist <= 1) score -= 120;
        }

        // Terrain cover preference
        const terr = this.getTerrain(pos.x, pos.y);
        const terrDef = (this.TERRAINS[terr] && this.TERRAINS[terr].def) || 0;
        score += terrDef * 15;

        // Head toward Player HQ
        for (let y = 0; y < this.gridH; y++) {
          for (let x = 0; x < this.gridW; x++) {
            if (this.getTerrain(x, y) === this.T_HQ_PLAYER) {
              const hqDist = Math.abs(x - pos.x) + Math.abs(y - pos.y);
              score -= hqDist * 10;
              if (pos.x === x && pos.y === y) score += 600;
            }
          }
        }

        if (score > bestScore) {
          bestScore = score;
          bestAction = { moveX: pos.x, moveY: pos.y, target: null };
        }
      }
    }

    return bestAction;
  },

  updateEnemyAI(dt) {
    if (!this.aiState) return;
    const ai = this.aiState;
    ai.timer -= dt;
    if (ai.timer > 0) return;

    if (ai.step === 'THINK') {
      if (ai.unitIdx >= ai.queue.length) {
        // All enemy units have moved
        this.aiState = null;
        if (!this.checkObjectives()) {
          this.endEnemyTurn();
        }
        return;
      }

      const unit = ai.queue[ai.unitIdx];
      if (unit.hp <= 0) {
        ai.unitIdx++;
        ai.timer = 0.05;
        return;
      }

      this.cursor.x = unit.x;
      this.cursor.y = unit.y;

      const action = this.computeBestActionForAI(unit);
      ai.currentAction = action;

      // Move unit to destination
      unit.x = action.moveX;
      unit.y = action.moveY;
      this.cursor.x = action.moveX;
      this.cursor.y = action.moveY;

      if (action.target) {
        ai.step = 'ATTACK';
        ai.timer = 0.2;
      } else {
        unit.hasActed = true;
        ai.unitIdx++;
        ai.step = 'THINK';
        ai.timer = 0.25;
      }
    } else if (ai.step === 'ATTACK') {
      const unit = ai.queue[ai.unitIdx];
      const target = ai.currentAction.target;

      this.triggerCombat(unit, target, () => {
        unit.hasActed = true;
        ai.unitIdx++;
        ai.step = 'THINK';
        ai.timer = 0.25;
        this.checkObjectives();
      });
    }
  },

  // --------------------------------------------------------------------------
  // 11. INPUT HANDLING & TOUCH CONTROLS
  // --------------------------------------------------------------------------
  handleTouchInput() {
    if (typeof PAD === 'undefined' || !PAD.tapPos) return;
    const tap = PAD.tapPos;

    // 1. Check Victory / Defeat screen restart tap
    if (this.subState === 'VICTORY') {
      this.loadMap(this.mapIdx + 1);
      this.playSfx('SELECT');
      return;
    }
    if (this.subState === 'DEFEAT' || this.subState === 'ALL_CLEARED') {
      this.loadMap(this.mapIdx);
      this.playSfx('SELECT');
      return;
    }

    // 2. Check Right Sidebar UI Buttons:
    // [END TURN] button: x: 190..250, y: 192..212
    if (tap.x >= 190 && tap.x <= 250 && tap.y >= 192 && tap.y <= 212) {
      if (this.phase === 'PLAYER' && this.subState === 'SELECT') {
        this.endPlayerTurn();
        return;
      }
    }

    // [UNDO / CANCEL] button: x: 190..250, y: 216..234
    if (tap.x >= 190 && tap.x <= 250 && tap.y >= 216 && tap.y <= 234) {
      if (this.subState === 'MOVE' || this.subState === 'ACTION' || this.subState === 'TARGET') {
        this.cancelCurrentAction();
        return;
      }
    }

    // [ATTACK] action button in action menu
    if (this.subState === 'ACTION') {
      if (tap.x >= 190 && tap.x <= 250 && tap.y >= 148 && tap.y <= 168) {
        if (this.targetUnits.length > 0) {
          this.subState = 'TARGET';
          this.targetIdx = 0;
          this.cursor.x = this.targetUnits[0].x;
          this.cursor.y = this.targetUnits[0].y;
          this.playSfx('SELECT');
          return;
        }
      }
      if (tap.x >= 190 && tap.x <= 250 && tap.y >= 170 && tap.y <= 188) {
        this.commitWait();
        return;
      }
    }

    // 3. Check Grid Taps
    const gx = Math.floor((tap.x - this.gridOx) / this.tileSize);
    const gy = Math.floor((tap.y - this.gridOy) / this.tileSize);

    if (gx >= 0 && gx < this.gridW && gy >= 0 && gy < this.gridH) {
      if (this.phase !== 'PLAYER') return;

      if (this.subState === 'SELECT') {
        this.cursor.x = gx;
        this.cursor.y = gy;
        const u = this.getUnitAt(gx, gy);
        if (u && u.player && !u.hasActed) {
          this.selectUnitForMove(u);
        } else {
          this.playSfx('MOVE');
        }
      } else if (this.subState === 'MOVE') {
        const isReachable = this.moveTiles.some(t => t.x === gx && t.y === gy);
        if (isReachable) {
          this.cursor.x = gx;
          this.cursor.y = gy;
          this.executeUnitMove(gx, gy);
        } else if (gx === this.selectedUnit.x && gy === this.selectedUnit.y) {
          this.executeUnitMove(gx, gy);
        } else {
          this.cancelCurrentAction();
        }
      } else if (this.subState === 'TARGET') {
        const targetClicked = this.targetUnits.find(u => u.x === gx && u.y === gy);
        if (targetClicked) {
          this.cursor.x = gx;
          this.cursor.y = gy;
          this.executeAttack(targetClicked);
        } else {
          this.cancelCurrentAction();
        }
      }
    }
  },

  selectUnitForMove(unit) {
    this.selectedUnit = unit;
    this.moveStartTile = { x: unit.x, y: unit.y };
    this.moveTiles = this.computeReachableTiles(unit);
    this.subState = 'MOVE';
    this.playSfx('SELECT');
  },

  executeUnitMove(destX, destY) {
    this.selectedUnit.x = destX;
    this.selectedUnit.y = destY;

    // Scan for enemy units in attack range
    const enemies = this.units.filter(u => !u.player && u.hp > 0);
    this.targetUnits = enemies.filter(e => this.canAttackFrom(this.selectedUnit, destX, destY, e, e.x, e.y));

    if (this.targetUnits.length > 0) {
      this.subState = 'ACTION';
      this.actionMenuIdx = 0;
      this.playSfx('SELECT');
    } else {
      // No targets in range: unit waits and ends move
      this.commitWait();
    }
  },

  cancelCurrentAction() {
    if (this.subState === 'TARGET') {
      this.subState = 'ACTION';
      this.cursor.x = this.selectedUnit.x;
      this.cursor.y = this.selectedUnit.y;
      this.playSfx('CANCEL');
    } else if (this.subState === 'ACTION') {
      // Undo movement back to starting tile
      this.selectedUnit.x = this.moveStartTile.x;
      this.selectedUnit.y = this.moveStartTile.y;
      this.cursor.x = this.selectedUnit.x;
      this.cursor.y = this.selectedUnit.y;
      this.subState = 'MOVE';
      this.playSfx('CANCEL');
    } else if (this.subState === 'MOVE') {
      this.selectedUnit = null;
      this.moveTiles = [];
      this.subState = 'SELECT';
      this.playSfx('CANCEL');
    }
  },

  commitWait() {
    this.selectedUnit.hasActed = true;
    this.selectedUnit = null;
    this.moveTiles = [];
    this.targetUnits = [];
    this.subState = 'SELECT';
    this.playSfx('SELECT');

    if (this.checkObjectives()) return;

    // If all player units have acted, automatically transition to enemy turn
    const readyPlayerUnits = this.units.filter(u => u.player && u.hp > 0 && !u.hasActed);
    if (readyPlayerUnits.length === 0) {
      this.endPlayerTurn();
    }
  },

  executeAttack(target) {
    const attacker = this.selectedUnit;
    this.triggerCombat(attacker, target, () => {
      attacker.hasActed = true;
      this.selectedUnit = null;
      this.moveTiles = [];
      this.targetUnits = [];
      this.subState = 'SELECT';

      if (!this.checkObjectives()) {
        const readyPlayerUnits = this.units.filter(u => u.player && u.hp > 0 && !u.hasActed);
        if (readyPlayerUnits.length === 0) {
          this.endPlayerTurn();
        }
      }
    });
  },

  // --------------------------------------------------------------------------
  // 12. MAIN LOOP: UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    this.animTimer += dt;

    // Update floating damage texts
    for (let i = this.floatTexts.length - 1; i >= 0; i--) {
      const ft = this.floatTexts[i];
      ft.life -= dt;
      ft.y -= 16 * dt;
      if (ft.life <= 0) this.floatTexts.splice(i, 1);
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Update combat resolution if active
    if (this.combatAnim) {
      this.updateCombat(dt);
      return;
    }

    // Update Enemy AI turn if active
    if (this.phase === 'ENEMY') {
      this.updateEnemyAI(dt);
      return;
    }

    // Process touch inputs
    this.handleTouchInput();

    // Victory / Game Over screen advance via A/B/Start
    if (this.subState === 'VICTORY') {
      if (PAD.hit('a') || PAD.hit('start')) {
        this.loadMap(this.mapIdx + 1);
        this.playSfx('SELECT');
      }
      return;
    }
    if (this.subState === 'DEFEAT' || this.subState === 'ALL_CLEARED') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start')) {
        this.loadMap(this.mapIdx);
        this.playSfx('SELECT');
      }
      return;
    }

    // End Turn shortcuts
    if (PAD.hit('select') || PAD.hit('start')) {
      if (this.subState === 'SELECT') {
        this.endPlayerTurn();
        return;
      }
    }

    // Cancel / Undo shortcut with [B]
    if (PAD.hit('b')) {
      this.cancelCurrentAction();
      return;
    }

    // D-Pad Navigation & Action Processing
    if (this.subState === 'SELECT') {
      if (PAD.hit('left')) { this.cursor.x = Math.max(0, this.cursor.x - 1); this.playSfx('MOVE'); }
      if (PAD.hit('right')) { this.cursor.x = Math.min(this.gridW - 1, this.cursor.x + 1); this.playSfx('MOVE'); }
      if (PAD.hit('up')) { this.cursor.y = Math.max(0, this.cursor.y - 1); this.playSfx('MOVE'); }
      if (PAD.hit('down')) { this.cursor.y = Math.min(this.gridH - 1, this.cursor.y + 1); this.playSfx('MOVE'); }

      if (PAD.hit('a')) {
        const u = this.getUnitAt(this.cursor.x, this.cursor.y);
        if (u && u.player && !u.hasActed) {
          this.selectUnitForMove(u);
        } else {
          this.playSfx('SELECT');
        }
      }
    } else if (this.subState === 'MOVE') {
      if (PAD.hit('left')) { this.cursor.x = Math.max(0, this.cursor.x - 1); this.playSfx('MOVE'); }
      if (PAD.hit('right')) { this.cursor.x = Math.min(this.gridW - 1, this.cursor.x + 1); this.playSfx('MOVE'); }
      if (PAD.hit('up')) { this.cursor.y = Math.max(0, this.cursor.y - 1); this.playSfx('MOVE'); }
      if (PAD.hit('down')) { this.cursor.y = Math.min(this.gridH - 1, this.cursor.y + 1); this.playSfx('MOVE'); }

      if (PAD.hit('a')) {
        const isReachable = this.moveTiles.some(t => t.x === this.cursor.x && t.y === this.cursor.y);
        if (isReachable || (this.cursor.x === this.selectedUnit.x && this.cursor.y === this.selectedUnit.y)) {
          this.executeUnitMove(this.cursor.x, this.cursor.y);
        } else {
          this.playSfx('CANCEL');
        }
      }
    } else if (this.subState === 'ACTION') {
      if (PAD.hit('up') || PAD.hit('down')) {
        this.actionMenuIdx = (this.actionMenuIdx === 0) ? 1 : 0;
        this.playSfx('MOVE');
      }

      if (PAD.hit('a')) {
        if (this.actionMenuIdx === 0) {
          // ATTACK selected
          if (this.targetUnits.length > 0) {
            this.subState = 'TARGET';
            this.targetIdx = 0;
            this.cursor.x = this.targetUnits[0].x;
            this.cursor.y = this.targetUnits[0].y;
            this.playSfx('SELECT');
          }
        } else {
          // WAIT selected
          this.commitWait();
        }
      }
    } else if (this.subState === 'TARGET') {
      if (PAD.hit('left') || PAD.hit('up')) {
        this.targetIdx = (this.targetIdx - 1 + this.targetUnits.length) % this.targetUnits.length;
        this.cursor.x = this.targetUnits[this.targetIdx].x;
        this.cursor.y = this.targetUnits[this.targetIdx].y;
        this.playSfx('MOVE');
      }
      if (PAD.hit('right') || PAD.hit('down')) {
        this.targetIdx = (this.targetIdx + 1) % this.targetUnits.length;
        this.cursor.x = this.targetUnits[this.targetIdx].x;
        this.cursor.y = this.targetUnits[this.targetIdx].y;
        this.playSfx('MOVE');
      }

      if (PAD.hit('a')) {
        const target = this.targetUnits[this.targetIdx];
        this.executeAttack(target);
      }
    }
  },

  // --------------------------------------------------------------------------
  // 13. RENDERING ENGINE: PIXEL ART & CRT LAYOUT
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    // Top Header Bar
    g.rect(0, 0, 256, 18, 1);
    g.line(0, 18, 256, 18, 2);
    g.text("TACTICS", 8, 6, 3);
    const mapName = `M${this.mapIdx + 1}: ${this.MAPS[this.mapIdx].name}`;
    g.text(mapName, 68, 6, 2);
    g.textR(`WINS:${this.wins} T:${this.turnCount}`, 248, 6, 3);

    // Render Grid & Terrain
    this.renderTerrain(g);

    // Render Movement & Attack Range Highlights
    this.renderHighlights(g);

    // Render Units
    this.renderUnits(g);

    // Render Animated Cursor
    this.renderCursor(g);

    // Render Projectiles & Combat FX
    this.renderCombatFX(g);

    // Render Bottom HUD (Combat Forecast or Terrain Info)
    this.renderBottomHUD(g);

    // Render Right Command & Status Panel
    this.renderRightPanel(g);

    // Overlays: Victory / Defeat banners
    this.renderOverlays(g);
  },

  renderTerrain(g) {
    const ox = this.gridOx;
    const oy = this.gridOy;
    const sz = this.tileSize;

    for (let y = 0; y < this.gridH; y++) {
      for (let x = 0; x < this.gridW; x++) {
        const bx = ox + x * sz;
        const by = oy + y * sz;
        const t = this.getTerrain(x, y);

        // Tile base background
        g.rect(bx, by, sz, sz, 0);

        switch (t) {
          case this.T_PLAINS:
            // Standard Plains with subtle grass texture
            g.box(bx, by, sz, sz, 1);
            g.px(bx + 6, by + 12, 2);
            g.px(bx + 7, by + 11, 2);
            g.px(bx + 15, by + 6, 2);
            g.px(bx + 16, by + 5, 2);
            break;

          case this.T_FOREST:
            // Dense Forest canopy and pine shapes
            g.rect(bx + 1, by + 1, sz - 2, sz - 2, 1);
            g.tri(bx + 11, by + 3, bx + 5, by + 11, bx + 17, by + 11, 2);
            g.tri(bx + 11, by + 8, bx + 3, by + 16, bx + 19, by + 16, 2);
            g.rect(bx + 10, by + 16, 3, 4, 0); // Trunk
            // Defense cover marker (+1)
            g.px(bx + 2, by + 2, 3);
            break;

          case this.T_MOUNTAIN:
            // Dual mountain peaks with snowy summits
            g.rect(bx + 1, by + 1, sz - 2, sz - 2, 1);
            g.tri(bx + 8, by + 4, bx + 2, by + 18, bx + 14, by + 18, 2);
            g.tri(bx + 15, by + 7, bx + 10, by + 18, bx + 20, by + 18, 2);
            // Snow caps
            g.px(bx + 8, by + 4, 3);
            g.px(bx + 7, by + 5, 3);
            g.px(bx + 8, by + 5, 3);
            g.px(bx + 15, by + 7, 3);
            break;

          case this.T_WATER:
            // Flowing water with animated ripples
            g.rect(bx, by, sz, sz, 0);
            const rip = Math.floor(this.animTimer * 4 + x + y) % 4;
            g.line(bx + 2, by + 5 + rip, bx + 9, by + 5 + rip, 1);
            g.line(bx + 11, by + 13 - rip, bx + 19, by + 13 - rip, 1);
            break;

          case this.T_BRIDGE:
            // Wooden plank bridge crossing water
            g.rect(bx, by, sz, sz, 0);
            g.line(bx + 2, by + 6, bx + 19, by + 6, 1);
            g.line(bx + 2, by + 15, bx + 19, by + 15, 1);
            g.rect(bx + 3, by + 2, 4, sz - 4, 2);
            g.rect(bx + 9, by + 2, 4, sz - 4, 2);
            g.rect(bx + 15, by + 2, 4, sz - 4, 2);
            g.line(bx + 2, by + 1, bx + 19, by + 1, 3);
            g.line(bx + 2, by + sz - 2, bx + 19, by + sz - 2, 3);
            break;

          case this.T_HQ_PLAYER:
          case this.T_HQ_ENEMY:
          case this.T_FORT:
            // Fortress / Headquarters with crenellated battlements & flag
            g.rect(bx + 2, by + 6, sz - 4, sz - 8, 1);
            g.box(bx + 2, by + 6, sz - 4, sz - 8, 2);
            // Battlements
            g.rect(bx + 3, by + 3, 4, 4, 2);
            g.rect(bx + 9, by + 3, 4, 4, 2);
            g.rect(bx + 15, by + 3, 4, 4, 2);
            // Base emblem / letter
            const label = (t === this.T_HQ_PLAYER) ? "P" : (t === this.T_HQ_ENEMY ? "E" : "F");
            const col = (t === this.T_HQ_PLAYER) ? 3 : 2;
            g.text(label, bx + 8, by + 8, col);
            break;
        }
      }
    }
  },

  renderHighlights(g) {
    const ox = this.gridOx;
    const oy = this.gridOy;
    const sz = this.tileSize;

    // 1. Move range tiles
    if (this.subState === 'MOVE' && this.moveTiles) {
      for (let t of this.moveTiles) {
        const bx = ox + t.x * sz;
        const by = oy + t.y * sz;
        // Dotted phosphor boundary & center beacon
        g.box(bx + 1, by + 1, sz - 2, sz - 2, 2);
        g.px(bx + 5, by + 5, 3);
        g.px(bx + sz - 6, by + 5, 3);
        g.px(bx + 5, by + sz - 6, 3);
        g.px(bx + sz - 6, by + sz - 6, 3);
        g.px(bx + 11, by + 11, 3);
      }
    }

    // 2. Attack range targets
    if ((this.subState === 'ACTION' || this.subState === 'TARGET') && this.targetUnits) {
      for (let target of this.targetUnits) {
        const bx = ox + target.x * sz;
        const by = oy + target.y * sz;
        // Danger flashing red/bright brackets
        const flash = Math.floor(this.animTimer * 6) % 2 === 0;
        const c = flash ? 3 : 2;
        g.box(bx, by, sz, sz, c);
        g.line(bx + 2, by + 2, bx + 6, by + 2, 3);
        g.line(bx + 2, by + 2, bx + 2, by + 6, 3);
        g.line(bx + sz - 3, by + 2, bx + sz - 7, by + 2, 3);
        g.line(bx + sz - 3, by + 2, bx + sz - 3, by + 6, 3);
      }
    }
  },

  renderUnits(g) {
    const ox = this.gridOx;
    const oy = this.gridOy;
    const sz = this.tileSize;

    for (let u of this.units) {
      if (u.hp <= 0) continue;
      const bx = ox + u.x * sz;
      const by = oy + u.y * sz;

      // Color scheme:
      // Player units: Bright PAL[3] and PAL[2]
      // Enemy units: PAL[2] with dark/inverted accents
      // Grayed out when hasActed
      let cPrimary = u.player ? 3 : 2;
      let cSecondary = u.player ? 2 : 1;
      if (u.hasActed) {
        cPrimary = 1;
        cSecondary = 0;
      }

      // Render custom unit sprite based on squad class
      if (u.type === 'S') {
        // Swordsman (Infantry with kite shield and raised blade)
        // Helm & plume
        g.rect(bx + 7, by + 3, 6, 5, cPrimary);
        g.px(bx + 9, by + 2, cPrimary); // Crest
        // Torso / Cuirass
        g.rect(bx + 6, by + 8, 7, 5, cSecondary);
        // Left arm kite shield
        g.rect(bx + 3, by + 7, 4, 7, cPrimary);
        g.line(bx + 3, by + 13, bx + 6, by + 15, cPrimary);
        g.px(bx + 4, by + 9, 0); // Shield cross
        // Right arm raised broadsword
        g.line(bx + 14, by + 4, bx + 14, by + 12, cPrimary);
        g.line(bx + 12, by + 9, bx + 16, by + 9, cPrimary); // Guard
      } else if (u.type === 'P') {
        // Spearman (Pikeman with long vertical pike)
        // Kettle hat
        g.line(bx + 5, by + 4, bx + 13, by + 4, cPrimary);
        g.rect(bx + 7, by + 2, 5, 3, cPrimary);
        // Body
        g.rect(bx + 7, by + 6, 5, 7, cSecondary);
        // Pike shaft (long vertical weapon)
        g.line(bx + 15, by + 2, bx + 15, by + 16, cPrimary);
        // Spearhead
        g.tri(bx + 15, by + 1, bx + 13, by + 4, bx + 17, by + 4, cPrimary);
      } else if (u.type === 'A') {
        // Archer (Ranger with recurve bow and cowl)
        // Feathered hood
        g.rect(bx + 7, by + 3, 6, 5, cPrimary);
        g.px(bx + 12, by + 2, cPrimary); // Feather
        // Torso
        g.rect(bx + 7, by + 8, 5, 5, cSecondary);
        // Curved Bow
        g.line(bx + 4, by + 4, bx + 3, by + 9, cPrimary);
        g.line(bx + 3, by + 9, bx + 4, by + 14, cPrimary);
        // Bowstring & knocked arrow
        g.line(bx + 4, by + 4, bx + 4, by + 14, cSecondary);
        g.line(bx + 4, by + 9, bx + 11, by + 9, cPrimary);
      }

      // Boss marker
      if (u.isBoss) {
        g.px(bx + 10, by + 1, 3);
        g.px(bx + 8, by + 1, 3);
        g.px(bx + 12, by + 1, 3);
      }

      // Health bar under unit
      const maxBars = u.maxHp;
      const curHp = u.hp;
      const barW = sz - 6;
      const barX = bx + 3;
      const barY = by + sz - 4;

      g.rect(barX, barY, barW, 2, 0);
      const pipW = Math.floor(barW / maxBars);
      for (let i = 0; i < maxBars; i++) {
        const px = barX + i * pipW;
        if (i < curHp) {
          g.rect(px, barY, pipW - 1, 2, u.player ? 3 : 2);
        } else {
          g.rect(px, barY, pipW - 1, 2, 1);
        }
      }
    }
  },

  renderCursor(g) {
    const ox = this.gridOx;
    const oy = this.gridOy;
    const sz = this.tileSize;
    const bx = ox + this.cursor.x * sz;
    const by = oy + this.cursor.y * sz;

    // Pulsing corner brackets
    const pulse = Math.floor(this.animTimer * 5) % 2 === 0;
    const c = pulse ? 3 : 2;

    g.line(bx - 1, by - 1, bx + 4, by - 1, c);
    g.line(bx - 1, by - 1, bx - 1, by + 4, c);

    g.line(bx + sz, by - 1, bx + sz - 5, by - 1, c);
    g.line(bx + sz, by - 1, bx + sz, by + 4, c);

    g.line(bx - 1, by + sz, bx + 4, by + sz, c);
    g.line(bx - 1, by + sz, bx - 1, by + sz - 5, c);

    g.line(bx + sz, by + sz, bx + sz - 5, by + sz, c);
    g.line(bx + sz, by + sz, bx + sz, by + sz - 5, c);
  },

  renderCombatFX(g) {
    // 1. Draw Arrow flight path
    if (this.combatAnim && this.combatAnim.attacker.type === 'A') {
      const anim = this.combatAnim;
      const p = Math.min(1.0, anim.timer / anim.duration);
      const arcHeight = 22;
      const curX = anim.startPxX + (anim.targetPxX - anim.startPxX) * p;
      const curY = anim.startPxY + (anim.targetPxY - anim.startPxY) * p - Math.sin(p * Math.PI) * arcHeight;

      // Draw arrow head & shaft
      g.disc(Math.floor(curX), Math.floor(curY), 2, 3);
      // Trailing dust particles
      g.px(Math.floor(curX - 2), Math.floor(curY + 2), 2);
      g.px(Math.floor(curX - 4), Math.floor(curY + 4), 1);
    }

    // 2. Draw Sparks & Particles
    for (let p of this.particles) {
      g.px(Math.floor(p.x), Math.floor(p.y), p.color);
    }

    // 3. Draw Floating Combat Damage Texts
    for (let ft of this.floatTexts) {
      g.textC(ft.text, Math.floor(ft.y), ft.color);
    }
  },

  renderBottomHUD(g) {
    // Bottom panel beneath tactical grid: x: 10..184, y: 202..238 (36px high)
    const hx = 10, hy = 202, hw = 176, hh = 36;
    g.rect(hx, hy, hw, hh, 0);
    g.box(hx, hy, hw, hh, 2);

    if (this.subState === 'ACTION' || this.subState === 'TARGET') {
      // Combat Forecast HUD
      const attacker = this.selectedUnit;
      const defender = (this.subState === 'TARGET' && this.targetUnits[this.targetIdx])
        ? this.targetUnits[this.targetIdx]
        : (this.targetUnits[0] || null);

      if (attacker && defender) {
        const ax = attacker.x, ay = attacker.y;
        const tx = defender.x, ty = defender.y;
        const fc = this.calculateCombatForecast(attacker, defender, ax, ay, tx, ty);

        // Header: Attacker vs Defender
        g.text(`${attacker.shortName} VS ${defender.shortName}`, hx + 6, hy + 4, 3);

        // Odds & Damage
        const defNewHp = Math.max(0, defender.hp - fc.atkDmg);
        g.text(`DMG:${fc.atkDmg} (HP ${defender.hp}▶${defNewHp})`, hx + 6, hy + 14, 3);

        if (fc.canCounter) {
          const atkNewHp = Math.max(0, attacker.hp - fc.defDmg);
          g.text(`CTR:${fc.defDmg} (HP ${attacker.hp}▶${atkNewHp})`, hx + 6, hy + 23, 2);
        } else {
          g.text("CTR: NONE (SAFELY OUT OF RANGE)", hx + 6, hy + 23, 2);
        }
        return;
      }
    }

    // Default: Cursor & Terrain Information HUD
    const curTerrainId = this.getTerrain(this.cursor.x, this.cursor.y);
    const terrDef = this.TERRAINS[curTerrainId];
    const unitUnderCursor = this.getUnitAt(this.cursor.x, this.cursor.y);

    if (unitUnderCursor) {
      const allegiance = unitUnderCursor.player ? "ALLY" : "FOE";
      const status = unitUnderCursor.hasActed ? "[WAIT]" : "[READY]";
      g.text(`${allegiance} ${unitUnderCursor.type}: ${this.CLASSES[unitUnderCursor.type].name}`, hx + 6, hy + 4, unitUnderCursor.player ? 3 : 2);
      g.text(`HP:${unitUnderCursor.hp}/${unitUnderCursor.maxHp}  ATK:${unitUnderCursor.atk}  DEF:${unitUnderCursor.def}  MOV:${unitUnderCursor.move}`, hx + 6, hy + 14, 3);
      g.text(`TERRAIN: ${terrDef.name} (${terrDef.desc}) ${status}`, hx + 6, hy + 24, 2);
    } else {
      g.text(`TERRAIN: ${terrDef.name}`, hx + 6, hy + 4, 3);
      g.text(`COVER DEF: +${terrDef.def}  ${terrDef.desc}`, hx + 6, hy + 14, 2);
      g.text("[A] SELECT  [B] UNDO  [SEL] END TURN", hx + 6, hy + 24, 1);
    }
  },

  renderRightPanel(g) {
    // Right Command & Status Panel: x: 190..252, y: 24..238 (62px wide)
    const px = 190, py = 24, pw = 62, ph = 214;
    g.rect(px, py, pw, ph, 0);
    g.box(px, py, pw, ph, 2);

    // 1. Current Phase Banner
    if (this.phase === 'PLAYER') {
      g.rect(px + 2, py + 2, pw - 4, 14, 3);
      g.textC("PLAYER", py + 6, 0);
    } else {
      g.rect(px + 2, py + 2, pw - 4, 14, 2);
      g.textC("ENEMY", py + 6, 3);
    }

    // 2. Squad Count
    const pCount = this.units.filter(u => u.player && u.hp > 0).length;
    const eCount = this.units.filter(u => !u.player && u.hp > 0).length;
    g.text(`ALLY: ${pCount}`, px + 6, py + 22, 3);
    g.text(`FOE : ${eCount}`, px + 6, py + 31, 2);
    g.line(px + 4, py + 41, px + pw - 5, py + 41, 1);

    // 3. Selected / Focused Unit Card
    const focusUnit = this.selectedUnit || this.getUnitAt(this.cursor.x, this.cursor.y) || null;
    if (focusUnit) {
      g.textC(this.CLASSES[focusUnit.type].shortName, py + 46, 3);
      // HP Bar Visual
      g.text(`HP ${focusUnit.hp}/${focusUnit.maxHp}`, px + 6, py + 56, 3);
      g.rect(px + 6, py + 65, pw - 12, 3, 1);
      const curW = Math.floor(((pw - 12) * focusUnit.hp) / focusUnit.maxHp);
      g.rect(px + 6, py + 65, curW, 3, focusUnit.player ? 3 : 2);

      g.text(`ATK:${focusUnit.atk}`, px + 6, py + 72, 2);
      g.text(`DEF:${focusUnit.def}`, px + 34, py + 72, 2);
      g.text(`MOV:${focusUnit.move}`, px + 6, py + 81, 2);
      const rngStr = (focusUnit.type === 'P') ? "1-2" : (focusUnit.type === 'A' ? "2-3" : "1");
      g.text(`RNG:${rngStr}`, px + 34, py + 81, 2);
    } else {
      g.textC("NO UNIT", py + 52, 1);
      g.textC("FOCUSED", py + 62, 1);
    }

    g.line(px + 4, py + 92, px + pw - 5, py + 92, 1);

    // 4. Action Menu (when unit has moved)
    if (this.subState === 'ACTION') {
      g.textC("ACTION", py + 98, 3);

      // [ATTACK] Button
      const canAtk = this.targetUnits.length > 0;
      const isAtkSel = this.actionMenuIdx === 0;
      g.rect(px + 4, py + 110, pw - 8, 16, isAtkSel ? 3 : 1);
      g.textC("ATTACK", py + 115, isAtkSel ? 0 : (canAtk ? 3 : 2));

      // [WAIT] Button
      const isWaitSel = this.actionMenuIdx === 1;
      g.rect(px + 4, py + 130, pw - 8, 16, isWaitSel ? 3 : 1);
      g.textC("WAIT", py + 135, isWaitSel ? 0 : 3);
    } else {
      // Squad Guide Hints
      g.text("CLASSES:", px + 4, py + 98, 3);
      g.text("S:SHIELD", px + 4, py + 108, 2);
      g.text("P:REACH", px + 4, py + 117, 2);
      g.text("A:RANGED", px + 4, py + 126, 2);
      g.text("M:ARCHER", px + 4, py + 137, 1);
      g.text("  +1R RNG", px + 4, py + 146, 1);
    }

    // 5. Dedicated Touch Control Buttons:
    // [END TURN] Touch Button
    const endActive = (this.phase === 'PLAYER' && this.subState === 'SELECT');
    g.rect(px + 4, py + 168, pw - 8, 18, endActive ? 1 : 0);
    g.box(px + 4, py + 168, pw - 8, 18, endActive ? 3 : 1);
    g.textC("END TURN", py + 174, endActive ? 3 : 1);

    // [UNDO] Touch Button
    const undoActive = (this.subState === 'MOVE' || this.subState === 'ACTION' || this.subState === 'TARGET');
    g.rect(px + 4, py + 190, pw - 8, 16, undoActive ? 1 : 0);
    g.box(px + 4, py + 190, pw - 8, 16, undoActive ? 2 : 1);
    g.textC("UNDO [B]", py + 195, undoActive ? 2 : 1);
  },

  renderOverlays(g) {
    // Victory Banner Overlay
    if (this.subState === 'VICTORY') {
      g.rect(32, 70, 192, 90, 0);
      g.box(32, 70, 192, 90, 3);
      g.box(34, 72, 188, 86, 2);

      g.textC("★ VICTORY! ★", 84, 3);
      g.textC(`MAP ${this.mapIdx + 1} SECURED IN ${this.turnCount} TURNS`, 100, 2);
      g.textC(`TOTAL VICTORIES: ${this.wins}`, 114, 3);
      g.textC("[A/TAP] NEXT BATTLEFIELD", 136, 3);
    } else if (this.subState === 'ALL_CLEARED') {
      g.rect(24, 60, 208, 110, 0);
      g.box(24, 60, 208, 110, 3);
      g.box(26, 62, 204, 106, 2);

      g.textC("★ CAMPAIGN CONQUERED! ★", 74, 3);
      g.textC("THE REALM IS LIBERATED!", 90, 2);
      g.textC(`SUPREME TACTICIAN WINS: ${this.wins}`, 106, 3);
      g.textC("CONGRATULATIONS!", 124, 3);
      g.textC("[A/TAP] REPLAY CAMPAIGN", 146, 2);
    } else if (this.subState === 'DEFEAT') {
      g.rect(32, 70, 192, 86, 0);
      g.box(32, 70, 192, 86, 2);
      g.box(34, 72, 188, 82, 1);

      g.textC("SQUAD FALLEN", 84, 2);
      g.textC("YOUR BASE WAS COMPROMISED", 100, 1);
      g.textC("[A/TAP] RETRY BATTLE", 126, 3);
    }
  }
};
