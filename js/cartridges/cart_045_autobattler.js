// js/cartridges/cart_045_autobattler.js
// ============================================================================
// Cartridge #045: AUTOBATTLER
// Genre: STRATEGY (4) | Tactical Drafting, Squad Synergy & Auto-Combat Arena
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[45] = {
  id: 45,
  name: "AUTOBATTLER",
  genre: 4,
  scoreLabel: "STAGES",
  desc: "DRAFT UNITS FROM SHOP, ARRANGE FORMATION, AND WATCH SQUAD AUTO-COMBAT!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Crossed swords over a champion drafting card with a gleaming golden star
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Drafting Card Backing & Frame (x+4, y+3, w=24, h=26)
    g.rect(x + 5, y + 4, 22, 24, 1);
    g.box(x + 5, y + 4, 22, 24, 2);
    // Card header banner
    g.rect(x + 7, y + 6, 18, 4, 2);

    // Golden Champion Star at top center (x+16, y+8)
    g.px(x + 15, y + 6, 3);
    g.px(x + 16, y + 6, 3);
    g.line(x + 13, y + 7, x + 18, y + 7, 3);
    g.px(x + 15, y + 8, 3);
    g.px(x + 16, y + 8, 3);
    g.px(x + 14, y + 9, 3);
    g.px(x + 17, y + 9, 3);

    // Crossed Swords (Blades & Crossguards)
    // Sword 1 (Top-Left to Bottom-Right)
    g.line(x + 7, y + 12, x + 24, y + 26, 3);
    g.line(x + 8, y + 12, x + 25, y + 26, 2);
    // Sword 1 Hilt & Pommel
    g.line(x + 6, y + 14, x + 10, y + 10, 3);
    g.px(x + 6, y + 11, 3);

    // Sword 2 (Top-Right to Bottom-Left)
    g.line(x + 24, y + 12, x + 7, y + 26, 3);
    g.line(x + 23, y + 12, x + 6, y + 26, 2);
    // Sword 2 Hilt & Pommel
    g.line(x + 21, y + 10, x + 25, y + 14, 3);
    g.px(x + 25, y + 11, 3);

    // Central Gleam at weapon intersection
    g.rect(x + 14, y + 18, 3, 3, 3);
    g.px(x + 15, y + 17, 3);
    g.px(x + 15, y + 21, 3);
  },

  // --------------------------------------------------------------------------
  // 2. CHAMPION DEFINITIONS & DATA
  // --------------------------------------------------------------------------
  CHAMP_TYPES: {
    KNIGHT: {
      id: 'KNIGHT', name: 'KNIGHT', role: 'TANK', classId: 'WARRIOR', cost: 2,
      range: 1, hp: 260, hp2: 480, atk: 24, atk2: 44, armor: 25, armor2: 40,
      atkCd: 0.85, ultName: 'SHIELD SLAM', ultDesc: 'STUNS 1.5S, 80 DMG, +100 SHIELD'
    },
    ARCHER: {
      id: 'ARCHER', name: 'ARCHER', role: 'RANGER', classId: 'RANGER', cost: 2,
      range: 3, hp: 140, hp2: 260, atk: 30, atk2: 56, armor: 5, armor2: 10,
      atkCd: 0.65, ultName: 'ARROW VOLLEY', ultDesc: 'RAPID 3 ARROWS (35 DMG EACH)'
    },
    MAGE: {
      id: 'MAGE', name: 'MAGE', role: 'SORCERER', classId: 'MAGE', cost: 3,
      range: 2, hp: 130, hp2: 240, atk: 26, atk2: 48, armor: 5, armor2: 10,
      atkCd: 0.90, ultName: 'CHAIN LIGHT', ultDesc: '90 DMG ZAP, BOUNCE 2 FOES (60 DMG)'
    },
    ASSASSIN: {
      id: 'ASSASSIN', name: 'ASSASSIN', role: 'ROGUE', classId: 'ROGUE', cost: 3,
      range: 1, hp: 150, hp2: 280, atk: 38, atk2: 70, armor: 10, armor2: 18,
      atkCd: 0.75, ultName: 'BACKSTAB', ultDesc: 'CRIT BURST FOR 160 DMG'
    },
    CLERIC: {
      id: 'CLERIC', name: 'CLERIC', role: 'SUPPORT', classId: 'CLERIC', cost: 2,
      range: 2, hp: 160, hp2: 290, atk: 18, atk2: 34, armor: 10, armor2: 18,
      atkCd: 0.95, ultName: 'HOLY HEAL', ultDesc: 'HEALS LOWEST ALLY 120 HP +15 ARM'
    },
    BERSERKER: {
      id: 'BERSERKER', name: 'BERSERK', role: 'BRUISER', classId: 'WARRIOR', cost: 3,
      range: 1, hp: 230, hp2: 420, atk: 32, atk2: 58, armor: 15, armor2: 25,
      atkCd: 0.90, ultName: 'WHIRLWIND', ultDesc: 'SPIN CLEAVE ADJACENT FOES (85 DMG)'
    }
  },

  // Monster / Boss definitions for PvE & Dragon Encounter
  MONSTER_TYPES: {
    GOBLIN: {
      id: 'GOBLIN', name: 'GOBLIN', role: 'SCRAPPER', classId: 'MONSTER', cost: 1,
      range: 1, hp: 130, atk: 18, armor: 5, atkCd: 0.90, ultName: 'RABID BITE', ultDesc: '45 DMG'
    },
    WOLF: {
      id: 'WOLF', name: 'WOLF', role: 'BEAST', classId: 'MONSTER', cost: 1,
      range: 1, hp: 160, atk: 22, armor: 10, atkCd: 0.75, ultName: 'HOWL', ultDesc: '+25% ATK'
    },
    HATCHLING: {
      id: 'HATCHLING', name: 'DRAKE', role: 'MINION', classId: 'MONSTER', cost: 2,
      range: 1, hp: 240, atk: 26, armor: 15, atkCd: 0.85, ultName: 'FIRE SPIT', ultDesc: '60 DMG'
    },
    DRAGON: {
      id: 'DRAGON', name: 'WYRM', role: 'BOSS', classId: 'BOSS', cost: 5,
      range: 2, hp: 1600, atk: 45, armor: 40, atkCd: 1.10, ultName: 'TOXIC BREATH', ultDesc: '140 CONE AOE BURN'
    }
  },

  // --------------------------------------------------------------------------
  // 3. CAMPAIGN STAGES (10 PROGRESSIVE ROUNDS)
  // --------------------------------------------------------------------------
  STAGES: [
    // Stage 1: PvE Goblin Patrol
    {
      name: "GOBLIN AMBUSH", type: "PVE", cap: 3,
      enemies: [
        { type: 'GOBLIN', stars: 1, r: 1, c: 2 },
        { type: 'GOBLIN', stars: 1, r: 1, c: 3 }
      ]
    },
    // Stage 2: PvE Dire Wolves
    {
      name: "DIRE WOLVES", type: "PVE", cap: 3,
      enemies: [
        { type: 'WOLF', stars: 1, r: 1, c: 1 },
        { type: 'WOLF', stars: 1, r: 1, c: 3 },
        { type: 'WOLF', stars: 1, r: 1, c: 4 }
      ]
    },
    // Stage 3: Royal Vanguard Squad
    {
      name: "ROYAL VANGUARD", type: "PVP", cap: 4,
      enemies: [
        { type: 'KNIGHT', stars: 2, r: 1, c: 2 },
        { type: 'ARCHER', stars: 1, r: 0, c: 1 },
        { type: 'CLERIC', stars: 1, r: 0, c: 4 }
      ]
    },
    // Stage 4: Night Assassins
    {
      name: "NIGHT ASSASSINS", type: "PVP", cap: 4,
      enemies: [
        { type: 'BERSERKER', stars: 1, r: 1, c: 2 },
        { type: 'ASSASSIN', stars: 1, r: 0, c: 1 },
        { type: 'ASSASSIN', stars: 1, r: 0, c: 4 }
      ]
    },
    // Stage 5: Spellweaver Battery
    {
      name: "SPELL BATTERY", type: "PVP", cap: 4,
      enemies: [
        { type: 'KNIGHT', stars: 1, r: 1, c: 2 },
        { type: 'KNIGHT', stars: 1, r: 1, c: 3 },
        { type: 'MAGE', stars: 1, r: 0, c: 1 },
        { type: 'MAGE', stars: 1, r: 0, c: 4 }
      ]
    },
    // Stage 6: Iron Warband
    {
      name: "IRON WARBAND", type: "PVP", cap: 5,
      enemies: [
        { type: 'KNIGHT', stars: 2, r: 1, c: 1 },
        { type: 'BERSERKER', stars: 2, r: 1, c: 3 },
        { type: 'ARCHER', stars: 1, r: 0, c: 2 },
        { type: 'ARCHER', stars: 1, r: 0, c: 4 }
      ]
    },
    // Stage 7: Holy Crusaders
    {
      name: "HOLY CRUSADE", type: "PVP", cap: 5,
      enemies: [
        { type: 'KNIGHT', stars: 2, r: 1, c: 2 },
        { type: 'KNIGHT', stars: 2, r: 1, c: 3 },
        { type: 'CLERIC', stars: 2, r: 0, c: 1 },
        { type: 'CLERIC', stars: 2, r: 0, c: 4 },
        { type: 'MAGE', stars: 2, r: 0, c: 2 }
      ]
    },
    // Stage 8: Shadow Fleet
    {
      name: "SHADOW FLEET", type: "PVP", cap: 5,
      enemies: [
        { type: 'BERSERKER', stars: 2, r: 1, c: 2 },
        { type: 'ASSASSIN', stars: 2, r: 0, c: 0 },
        { type: 'ASSASSIN', stars: 2, r: 0, c: 5 },
        { type: 'ARCHER', stars: 2, r: 0, c: 2 },
        { type: 'ARCHER', stars: 2, r: 0, c: 3 }
      ]
    },
    // Stage 9: Grand Champion Guild
    {
      name: "CHAMPION GUILD", type: "PVP", cap: 6,
      enemies: [
        { type: 'KNIGHT', stars: 2, r: 1, c: 1 },
        { type: 'BERSERKER', stars: 2, r: 1, c: 3 },
        { type: 'ARCHER', stars: 2, r: 0, c: 0 },
        { type: 'MAGE', stars: 2, r: 0, c: 5 },
        { type: 'ASSASSIN', stars: 2, r: 0, c: 2 },
        { type: 'CLERIC', stars: 2, r: 0, c: 4 }
      ]
    },
    // Stage 10: Final Boss - Ancient Emerald Wyrm
    {
      name: "EMERALD WYRM", type: "BOSS", cap: 6,
      enemies: [
        { type: 'HATCHLING', stars: 1, r: 1, c: 1 },
        { type: 'DRAGON', stars: 2, r: 0, c: 2 },
        { type: 'HATCHLING', stars: 1, r: 1, c: 4 }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // 4. LIFECYCLE & STATE INITIALIZATION
  // --------------------------------------------------------------------------
  init() {
    this.stage = 1;
    this.maxStage = 1;
    this.playerHP = 100;
    this.maxPlayerHP = 100;
    this.gold = 5;
    this.streak = 0;

    // Board: 6 columns x 4 rows (Rows 0-1: Enemy, Rows 2-3: Player)
    // Nullable grid cells
    this.board = [
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null]
    ];

    // Bench: 4 slots
    this.bench = [null, null, null, null];

    // Shop: 3 slots
    this.shop = [null, null, null];

    // State machine: 'PREP' | 'COMBAT' | 'ROUND_END' | 'GAMEOVER' | 'VICTORY'
    this.state = 'PREP';
    this.stateTimer = 0;
    this.combatSpeed = 1; // 1x or 2x speed

    // Cursor navigation: zone 'BOARD' | 'BENCH' | 'SHOP'
    this.cursorZone = 'BENCH';
    this.cursorX = 0;
    this.cursorY = 0;

    // Held / Selected unit for moving or swapping: { source: 'BOARD'|'BENCH', r, c, idx, unit }
    this.heldUnit = null;

    // Combat simulation structures
    this.combatants = [];
    this.projectiles = [];
    this.floatingTexts = [];
    this.particles = [];
    this.combatTime = 0;
    this.banner = null; // { text, sub, timer, color }

    // Start with 1 free starting champion on the bench
    this.bench[0] = { type: 'KNIGHT', stars: 1 };
    this.rollShop(true);
  },

  // --------------------------------------------------------------------------
  // 5. ECONOMY, SHOP & UPGRADES
  // --------------------------------------------------------------------------
  rollShop(free = false) {
    if (!free) {
      if (this.gold < 1) {
        this.notify("NEED $1 GOLD!", 2);
        APU.sfx('DENY');
        return;
      }
      this.gold -= 1;
      APU.sfx('SWISH');
    }

    const pool = ['KNIGHT', 'ARCHER', 'MAGE', 'ASSASSIN', 'CLERIC', 'BERSERKER'];
    this.shop = [];
    for (let i = 0; i < 3; i++) {
      const type = pool[Math.floor(Math.random() * pool.length)];
      this.shop.push({ type, stars: 1, cost: this.CHAMP_TYPES[type].cost });
    }
  },

  buyShop(slotIdx) {
    const card = this.shop[slotIdx];
    if (!card) return;

    if (this.gold < card.cost) {
      this.notify("NOT ENOUGH GOLD!", 2);
      APU.sfx('DENY');
      return;
    }

    // Find free bench slot, or free player board slot if bench is full
    let benchSlot = -1;
    for (let i = 0; i < 4; i++) {
      if (!this.bench[i]) { benchSlot = i; break; }
    }

    if (benchSlot === -1) {
      // Bench is full; check if player board has space within army cap
      const stageDef = this.STAGES[this.stage - 1] || this.STAGES[0];
      const currentDeployed = this.countDeployed();
      if (currentDeployed < stageDef.cap) {
        const freeCell = this.findFreePlayerCell();
        if (freeCell) {
          this.gold -= card.cost;
          this.board[freeCell.r][freeCell.c] = { type: card.type, stars: 1 };
          this.shop[slotIdx] = null;
          APU.sfx('COIN');
          this.checkTriple(card.type);
          return;
        }
      }
      this.notify("BENCH IS FULL!", 2);
      APU.sfx('DENY');
      return;
    }

    // Buy unit to bench
    this.gold -= card.cost;
    this.bench[benchSlot] = { type: card.type, stars: 1 };
    this.shop[slotIdx] = null;
    APU.sfx('COIN');

    // Auto-check for 3-copy upgrade
    this.checkTriple(card.type);
  },

  sellUnit(source, indexOrR, c) {
    let unit = null;
    if (source === 'BENCH') {
      unit = this.bench[indexOrR];
      if (unit) this.bench[indexOrR] = null;
    } else if (source === 'BOARD') {
      unit = this.board[indexOrR][c];
      if (unit) this.board[indexOrR][c] = null;
    }

    if (!unit) return;
    const def = this.CHAMP_TYPES[unit.type];
    if (!def) return;

    // Refund: 1-Star = full cost, 2-Star = 3x cost - 1
    const refund = (unit.stars === 2) ? (def.cost * 3 - 1) : def.cost;
    this.gold += refund;
    APU.sfx('COIN');
    this.spawnFloatingText(128, 120, "+$" + refund + " SOLD", 3);
    if (this.heldUnit) this.heldUnit = null;
  },

  // Auto-merges 3 1-Star units of the same type into a 2-Star champion!
  checkTriple(champType) {
    const copies = [];
    // Collect from bench
    for (let i = 0; i < 4; i++) {
      if (this.bench[i] && this.bench[i].type === champType && this.bench[i].stars === 1) {
        copies.push({ loc: 'BENCH', idx: i });
      }
    }
    // Collect from board
    for (let r = 2; r <= 3; r++) {
      for (let c = 0; c < 6; c++) {
        if (this.board[r][c] && this.board[r][c].type === champType && this.board[r][c].stars === 1) {
          copies.push({ loc: 'BOARD', r, c });
        }
      }
    }

    if (copies.length >= 3) {
      // Prioritize keeping the upgraded unit on the board if already deployed
      const target = copies.find(c => c.loc === 'BOARD') || copies[0];
      const others = copies.filter(c => c !== target).slice(0, 2);

      // Remove the 2 sacrifice copies
      others.forEach(o => {
        if (o.loc === 'BENCH') this.bench[o.idx] = null;
        else this.board[o.r][o.c] = null;
      });

      // Upgrade the target copy
      if (target.loc === 'BENCH') {
        this.bench[target.idx].stars = 2;
      } else {
        this.board[target.r][target.c].stars = 2;
      }

      APU.sfx('LEVELUP');
      this.notify("★ " + champType + " 2-STAR UPGRADE! ★", 3);
      this.spawnParticleBurst(128, 80, 16);
    }
  },

  countDeployed() {
    let count = 0;
    for (let r = 2; r <= 3; r++) {
      for (let c = 0; c < 6; c++) {
        if (this.board[r][c]) count++;
      }
    }
    return count;
  },

  findFreePlayerCell() {
    // Frontline first, then backline
    for (let r = 2; r <= 3; r++) {
      for (let c = 0; c < 6; c++) {
        if (!this.board[r][c]) return { r, c };
      }
    }
    return null;
  },

  // --------------------------------------------------------------------------
  // 6. SYNERGY CALCULATOR
  // --------------------------------------------------------------------------
  getSynergies(teamUnits) {
    // Unique classes count (duplicate champions do not give multiple class points)
    const uniqueTypes = new Set();
    teamUnits.forEach(u => {
      if (u && u.type) uniqueTypes.add(u.type);
    });

    let warriorCount = 0;
    let rangerMageCount = 0;
    let rogueClericCount = 0;

    uniqueTypes.forEach(type => {
      const def = this.CHAMP_TYPES[type];
      if (!def) return;
      if (def.classId === 'WARRIOR') warriorCount++;
      if (def.classId === 'RANGER' || def.classId === 'MAGE') rangerMageCount++;
      if (def.classId === 'ROGUE' || def.classId === 'CLERIC') rogueClericCount++;
    });

    return {
      warrior: warriorCount >= 2,
      warriorCount,
      rangerMage: rangerMageCount >= 2,
      rangerMageCount,
      rogueCleric: rogueClericCount >= 2,
      rogueClericCount
    };
  },

  // --------------------------------------------------------------------------
  // 7. REAL-TIME AUTONOMOUS COMBAT ENGINE
  // --------------------------------------------------------------------------
  startCombat() {
    const deployed = this.countDeployed();
    if (deployed === 0) {
      this.notify("DEPLOY AT LEAST 1 UNIT!", 2);
      APU.sfx('DENY');
      return;
    }

    this.state = 'COMBAT';
    this.combatTime = 0;
    this.combatants = [];
    this.projectiles = [];
    this.floatingTexts = [];
    this.particles = [];
    this.heldUnit = null;

    // Load Stage enemy definition
    const stageDef = this.STAGES[this.stage - 1] || this.STAGES[this.STAGES.length - 1];

    // Collect Player Units
    const playerSquad = [];
    for (let r = 2; r <= 3; r++) {
      for (let c = 0; c < 6; c++) {
        const u = this.board[r][c];
        if (u) {
          playerSquad.push({
            type: u.type,
            stars: u.stars || 1,
            r, c,
            team: 'player'
          });
        }
      }
    }

    // Collect Enemy Units
    const enemySquad = [];
    stageDef.enemies.forEach(e => {
      enemySquad.push({
        type: e.type,
        stars: e.stars || 1,
        r: e.r, c: e.c,
        team: 'enemy'
      });
    });

    // Synergies for Player
    const pSynergies = this.getSynergies(playerSquad);
    // Synergies for Enemy
    const eSynergies = this.getSynergies(enemySquad);

    // Instantiate Combatants
    const spawnUnit = (data, synergies) => {
      const isPlayer = (data.team === 'player');
      const def = this.CHAMP_TYPES[data.type] || this.MONSTER_TYPES[data.type];
      const stars = data.stars;

      const baseHp = (stars === 2 && def.hp2) ? def.hp2 : def.hp;
      const baseAtk = (stars === 2 && def.atk2) ? def.atk2 : def.atk;
      let baseArmor = (stars === 2 && def.armor2) ? def.armor2 : def.armor;
      let atkCd = def.atkCd;
      let startMana = 0;

      // Class Synergies:
      // 1. Warrior +30 Armor
      if (synergies.warrior && def.classId === 'WARRIOR') {
        baseArmor += 30;
      }
      // 2. Ranger/Mage +30% Attack Speed (reduces cooldown by 30%)
      if (synergies.rangerMage && (def.classId === 'RANGER' || def.classId === 'MAGE')) {
        atkCd *= 0.70;
      }
      // 3. Rogue/Cleric +40 Starting Mana
      if (synergies.rogueCleric && (def.classId === 'ROGUE' || def.classId === 'CLERIC')) {
        startMana = 40;
      }

      return {
        id: Math.random().toString(36).substr(2, 6),
        type: data.type,
        name: def.name,
        classId: def.classId,
        team: data.team,
        stars,
        gx: data.c,
        gy: data.r,
        renderX: 26 + data.c * 34 + 17,
        renderY: 22 + data.r * 24 + 12,
        targetGx: data.c,
        targetGy: data.r,
        hp: baseHp,
        maxHp: baseHp,
        shield: 0,
        mana: startMana,
        maxMana: 100,
        atk: baseAtk,
        armor: baseArmor,
        range: def.range,
        baseAtkCd: atkCd,
        atkTimer: Math.random() * 0.3, // slight stagger
        moveTimer: 0,
        stunTimer: 0,
        dead: false,
        isBoss: (def.classId === 'BOSS'),
        anim: null
      };
    };

    playerSquad.forEach(u => this.combatants.push(spawnUnit(u, pSynergies)));
    enemySquad.forEach(u => this.combatants.push(spawnUnit(u, eSynergies)));

    // Assassin Rogue Innate: Teleport to enemy backline at start!
    this.combatants.forEach(c => {
      if (c.classId === 'ROGUE') {
        const targetRow = (c.team === 'player') ? 0 : 3;
        // Find best unoccupied column in target row
        let openCol = -1;
        for (let col = 0; col < 6; col++) {
          if (!this.combatants.some(o => o.gx === col && o.gy === targetRow)) {
            openCol = col;
            break;
          }
        }
        if (openCol !== -1) {
          c.gx = openCol;
          c.gy = targetRow;
          c.renderX = 26 + openCol * 34 + 17;
          c.renderY = 22 + targetRow * 24 + 12;
          this.spawnParticleBurst(c.renderX, c.renderY, 8);
        }
      }
    });

    APU.sfx('SWISH');
    this.notify("BATTLE ENGAGED!", 1.5);
  },

  updateCombat(dt) {
    // Substep physics/combat at 60Hz rate for rock-solid stability even at 2x or 1.4x speed
    const step = 1 / 60;
    let accumulated = Math.min(dt * this.combatSpeed, 0.15);

    while (accumulated > 0) {
      const currentDt = Math.min(accumulated, step);
      this.stepCombat(currentDt);
      accumulated -= step;
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.t += dt * this.combatSpeed * p.speed;
      p.x = p.sx + (p.tx - p.sx) * Math.min(1, p.t);
      p.y = p.sy + (p.ty - p.sy) * Math.min(1, p.t);

      if (p.t >= 1) {
        if (p.onHit) p.onHit();
        this.projectiles.splice(i, 1);
      }
    }

    // Update floating damage/heal numbers
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.t += dt * this.combatSpeed;
      ft.y -= 14 * dt * this.combatSpeed;
      if (ft.t >= ft.dur) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update visual particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.t += dt * this.combatSpeed;
      pt.x += pt.vx * dt * this.combatSpeed;
      pt.y += pt.vy * dt * this.combatSpeed;
      if (pt.t >= pt.dur) {
        this.particles.splice(i, 1);
      }
    }

    // Check Victory / Defeat outcome
    const livingPlayer = this.combatants.filter(c => c.team === 'player' && !c.dead);
    const livingEnemy = this.combatants.filter(c => c.team === 'enemy' && !c.dead);

    if (livingEnemy.length === 0) {
      this.endCombat(true);
    } else if (livingPlayer.length === 0) {
      this.endCombat(false, livingEnemy.length);
    } else if (this.combatTime > 35) {
      // Overtime tiebreaker: Army with highest % HP remaining wins
      let pTotal = 0, pMax = 0, eTotal = 0, eMax = 0;
      livingPlayer.forEach(p => { pTotal += p.hp; pMax += p.maxHp; });
      livingEnemy.forEach(e => { eTotal += e.hp; eMax += e.maxHp; });
      const pPct = pTotal / Math.max(1, pMax);
      const ePct = eTotal / Math.max(1, eMax);
      if (pPct >= ePct) {
        this.endCombat(true);
      } else {
        this.endCombat(false, livingEnemy.length);
      }
    }
  },

  stepCombat(dt) {
    this.combatTime += dt;

    for (let i = 0; i < this.combatants.length; i++) {
      const c = this.combatants[i];
      if (c.dead) continue;

      // Handle Stun
      if (c.stunTimer > 0) {
        c.stunTimer -= dt;
        continue;
      }

      // Decrement Attack and Move timers
      c.atkTimer -= dt;
      c.moveTimer -= dt;

      // Berserker passive: lower HP increases attack speed up to +60%
      let currentAtkCd = c.baseAtkCd;
      if (c.type === 'BERSERKER') {
        const missingHpRatio = 1 - (c.hp / c.maxHp);
        currentAtkCd = Math.max(0.35, c.baseAtkCd * (1 - missingHpRatio * 0.6));
      }

      // Smooth visual coordinate interpolation
      const targetPx = 26 + c.gx * 34 + 17;
      const targetPy = 22 + c.gy * 24 + 12;
      c.renderX += (targetPx - c.renderX) * Math.min(1, dt * 12);
      c.renderY += (targetPy - c.renderY) * Math.min(1, dt * 12);

      // Find nearest living enemy
      const foes = this.combatants.filter(o => o.team !== c.team && !o.dead);
      if (foes.length === 0) continue;

      let nearestFoe = null;
      let minChebyshev = 999;
      foes.forEach(f => {
        const dx = Math.abs(f.gx - c.gx);
        const dy = Math.abs(f.gy - c.gy);
        const chebyshev = Math.max(dx, dy);
        if (chebyshev < minChebyshev) {
          minChebyshev = chebyshev;
          nearestFoe = f;
        }
      });

      if (!nearestFoe) continue;

      // Target in Attack Range?
      if (minChebyshev <= c.range) {
        // Can Cast Ultimate?
        if (c.mana >= c.maxMana) {
          this.castUltimate(c, nearestFoe);
          c.mana = 0;
          c.atkTimer = currentAtkCd * 0.8;
        } else if (c.atkTimer <= 0) {
          // Standard Auto-Attack
          this.performAttack(c, nearestFoe);
          c.atkTimer = currentAtkCd;
        }
      } else if (c.moveTimer <= 0) {
        // Path step towards nearest foe
        this.stepTowards(c, nearestFoe);
        c.moveTimer = 0.32; // step delay
      }
    }
  },

  performAttack(attacker, target) {
    attacker.mana = Math.min(100, attacker.mana + 15);

    // Ranged units fire a projectile
    if (attacker.range > 1) {
      this.spawnProjectile(
        attacker.renderX, attacker.renderY,
        target.renderX, target.renderY,
        (attacker.classId === 'MAGE') ? 'BOLT' : 'ARROW',
        () => {
          this.applyDamage(attacker, target, attacker.atk, 'PHYSICAL');
        }
      );
      APU.sfx('SWISH');
    } else {
      // Melee attack
      this.applyDamage(attacker, target, attacker.atk, 'PHYSICAL');
      APU.sfx('HIT');
      this.spawnParticleBurst(target.renderX, target.renderY, 4);
    }
  },

  castUltimate(caster, target) {
    const is2Star = (caster.stars === 2);

    switch (caster.type) {
      case 'KNIGHT': {
        // SHIELD SLAM: Stuns target and gains shield
        const stunDuration = is2Star ? 2.0 : 1.5;
        const dmg = is2Star ? 160 : 80;
        const shieldAmount = is2Star ? 200 : 100;

        target.stunTimer = stunDuration;
        caster.shield += shieldAmount;
        this.applyDamage(caster, target, dmg, 'MAGIC');
        this.spawnFloatingText(target.renderX, target.renderY - 8, "STUNNED!", 3);
        this.spawnFloatingText(caster.renderX, caster.renderY - 8, "+" + shieldAmount + " SHIELD", 2);
        APU.sfx('BOOM');
        break;
      }

      case 'ARCHER': {
        // ARROW VOLLEY: 3 rapid arrows
        const count = 3;
        const arrowDmg = is2Star ? 65 : 35;
        for (let k = 0; k < count; k++) {
          setTimeout(() => {
            if (!caster.dead && !target.dead) {
              this.spawnProjectile(
                caster.renderX, caster.renderY,
                target.renderX, target.renderY,
                'ARROW',
                () => this.applyDamage(caster, target, arrowDmg, 'PHYSICAL')
              );
              APU.sfx('SWISH');
            }
          }, k * 120);
        }
        this.spawnFloatingText(caster.renderX, caster.renderY - 8, "VOLLEY!", 3);
        break;
      }

      case 'MAGE': {
        // LIGHTNING CHAIN: Primary zap, bounces to up to 2 other enemies
        const primaryDmg = is2Star ? 170 : 90;
        const bounceDmg = is2Star ? 110 : 60;

        this.applyDamage(caster, target, primaryDmg, 'MAGIC');
        this.spawnLightning(caster.renderX, caster.renderY, target.renderX, target.renderY);

        // Find up to 2 other living enemies
        const others = this.combatants.filter(o => o.team !== caster.team && !o.dead && o !== target);
        others.sort((a, b) => {
          const d1 = Math.hypot(a.renderX - target.renderX, a.renderY - target.renderY);
          const d2 = Math.hypot(b.renderX - target.renderX, b.renderY - target.renderY);
          return d1 - d2;
        });

        const bounces = others.slice(0, 2);
        bounces.forEach((b, idx) => {
          setTimeout(() => {
            if (!b.dead) {
              this.applyDamage(caster, b, bounceDmg, 'MAGIC');
              this.spawnLightning(target.renderX, target.renderY, b.renderX, b.renderY);
            }
          }, (idx + 1) * 100);
        });

        APU.sfx('POWER');
        this.spawnFloatingText(caster.renderX, caster.renderY - 8, "LIGHTNING!", 3);
        break;
      }

      case 'ASSASSIN': {
        // CRIT BACKSTAB: Massive burst damage
        const burstDmg = is2Star ? 300 : 160;
        this.applyDamage(caster, target, burstDmg, 'CRIT');
        this.spawnParticleBurst(target.renderX, target.renderY, 10);
        this.spawnFloatingText(target.renderX, target.renderY - 8, "CRIT " + burstDmg + "!", 3);
        APU.sfx('BOOM');
        break;
      }

      case 'CLERIC': {
        // HOLY HEAL: Heals the lowest-HP percentage ally
        const healAmt = is2Star ? 220 : 120;
        const allies = this.combatants.filter(o => o.team === caster.team && !o.dead);
        allies.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
        const lowestAlly = allies[0] || caster;

        lowestAlly.hp = Math.min(lowestAlly.maxHp, lowestAlly.hp + healAmt);
        lowestAlly.armor += (is2Star ? 25 : 15);
        this.spawnFloatingText(lowestAlly.renderX, lowestAlly.renderY - 8, "+" + healAmt + " HEAL", 3);
        this.spawnParticleBurst(lowestAlly.renderX, lowestAlly.renderY, 8);
        APU.sfx('LEVELUP');
        break;
      }

      case 'BERSERKER': {
        // WHIRLWIND: Cleaves all adjacent enemies
        const cleaveDmg = is2Star ? 160 : 85;
        const adjacentFoes = this.combatants.filter(o => {
          return o.team !== caster.team && !o.dead && Math.max(Math.abs(o.gx - caster.gx), Math.abs(o.gy - caster.gy)) <= 1;
        });

        adjacentFoes.forEach(f => {
          this.applyDamage(caster, f, cleaveDmg, 'PHYSICAL');
        });
        this.spawnParticleBurst(caster.renderX, caster.renderY, 12);
        this.spawnFloatingText(caster.renderX, caster.renderY - 8, "WHIRLWIND!", 3);
        APU.sfx('BOOM');
        break;
      }

      case 'DRAGON': {
        // TOXIC BREATH: Cone breath burning across rows
        const breathDmg = 140;
        const hitFoes = this.combatants.filter(o => o.team !== caster.team && !o.dead);
        hitFoes.forEach(f => {
          this.applyDamage(caster, f, breathDmg, 'MAGIC');
        });
        this.spawnParticleBurst(128, 80, 24);
        this.spawnFloatingText(caster.renderX, caster.renderY - 12, "TOXIC BREATH!", 3);
        APU.sfx('BOOM');
        break;
      }

      default: {
        // Fallback for monsters
        this.applyDamage(caster, target, caster.atk * 1.5, 'PHYSICAL');
        APU.sfx('HIT');
        break;
      }
    }
  },

  applyDamage(attacker, target, rawDmg, type) {
    // Armor mitigation: dmg * (50 / (50 + armor))
    const mitigation = 50 / (50 + Math.max(0, target.armor));
    let finalDmg = Math.max(1, Math.round(rawDmg * mitigation));
    if (type === 'CRIT') finalDmg = Math.round(rawDmg); // crits pierce partial armor

    // Absorb with shield first
    if (target.shield > 0) {
      if (target.shield >= finalDmg) {
        target.shield -= finalDmg;
        this.spawnFloatingText(target.renderX, target.renderY - 4, "-" + finalDmg + " (SHIELD)", 2);
        finalDmg = 0;
      } else {
        finalDmg -= target.shield;
        target.shield = 0;
      }
    }

    if (finalDmg > 0) {
      target.hp -= finalDmg;
      target.mana = Math.min(100, target.mana + 10);
      const color = (type === 'CRIT' || type === 'MAGIC') ? 3 : 2;
      this.spawnFloatingText(target.renderX, target.renderY - 4, "-" + finalDmg, color);
    }

    if (target.hp <= 0) {
      target.hp = 0;
      target.dead = true;
      this.spawnParticleBurst(target.renderX, target.renderY, 10);
      APU.sfx('HURT');
    }
  },

  stepTowards(unit, target) {
    // Determine 1-tile step on 6x4 grid that minimizes distance to target
    const dx = Math.sign(target.gx - unit.gx);
    const dy = Math.sign(target.gy - unit.gy);

    const candidates = [
      { x: unit.gx + dx, y: unit.gy + dy },
      { x: unit.gx + dx, y: unit.gy },
      { x: unit.gx, y: unit.gy + dy },
      { x: unit.gx - dx, y: unit.gy + dy },
      { x: unit.gx + dx, y: unit.gy - dy }
    ];

    for (let i = 0; i < candidates.length; i++) {
      const pos = candidates[i];
      if (pos.x >= 0 && pos.x < 6 && pos.y >= 0 && pos.y < 4) {
        // Check if cell is occupied by another living combatant
        const occupied = this.combatants.some(o => !o.dead && o !== unit && o.gx === pos.x && o.gy === pos.y);
        if (!occupied) {
          unit.gx = pos.x;
          unit.gy = pos.y;
          break;
        }
      }
    }
  },

  endCombat(won, survivingFoes = 0) {
    this.state = 'ROUND_END';
    this.stateTimer = 1.4;

    if (won) {
      // Calculate gold income: +$5 Base + Interest + $1 Win bonus
      const interest = Math.min(3, Math.floor(this.gold / 10));
      const income = 5 + interest + 1;
      this.gold += income;
      this.streak++;

      APU.sfx('LEVELUP');
      SAVE.setScore(this.id, this.stage);

      if (this.stage >= 10) {
        // VICTORY - BEAT THE CAMPAIGN!
        this.state = 'VICTORY';
        this.notify("GRAND VICTORY! CAMPAIGN CLEARED!", 5);
      } else {
        this.notify("STAGE " + this.stage + " CLEARED! +$" + income + " GOLD", 2);
      }
    } else {
      // DEFEAT: Player takes damage based on surviving enemies
      const damageTaken = 4 + survivingFoes * 3;
      this.playerHP = Math.max(0, this.playerHP - damageTaken);
      this.streak = 0;

      // Consolation income: +$5 Base + Interest
      const interest = Math.min(3, Math.floor(this.gold / 10));
      this.gold += (5 + interest);

      APU.sfx('BOOM');

      if (this.playerHP <= 0) {
        this.state = 'GAMEOVER';
        this.notify("SQUAD DEFEATED! GAME OVER", 4);
      } else {
        this.notify("DEFEAT! -" + damageTaken + " HP (HP: " + this.playerHP + ")", 2.2);
      }
    }
  },

  advanceToNextRound() {
    if (this.state === 'VICTORY' || this.state === 'GAMEOVER') return;
    this.stage++;
    this.maxStage = Math.max(this.maxStage, this.stage);
    this.state = 'PREP';
    this.rollShop(true);
    this.notify("STAGE " + this.stage + ": " + (this.STAGES[this.stage - 1] ? this.STAGES[this.stage - 1].name : "BATTLE"), 2);
  },

  retryRound() {
    this.state = 'PREP';
    this.rollShop(true);
    this.notify("RETRY STAGE " + this.stage + " - DRAFT STRONGER UNITS!", 2);
  },

  // --------------------------------------------------------------------------
  // 8. VISUAL PARTICLES, PROJECTILES & FLOATING TEXTS
  // --------------------------------------------------------------------------
  spawnProjectile(sx, sy, tx, ty, type, onHit) {
    this.projectiles.push({
      sx, sy, tx, ty,
      x: sx, y: sy,
      type,
      t: 0,
      speed: 3.5,
      onHit
    });
  },

  spawnFloatingText(x, y, text, color = 3) {
    this.floatingTexts.push({
      x, y, text, color,
      t: 0, dur: 0.8
    });
  },

  spawnParticleBurst(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 20 + Math.random() * 35;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        t: 0, dur: 0.4 + Math.random() * 0.3,
        color: (Math.random() > 0.4) ? 3 : 2
      });
    }
  },

  spawnLightning(x1, y1, x2, y2) {
    // Add visual jagged lightning segment particles
    const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * 16;
    const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 16;
    this.particles.push({ x: midX, y: midY, vx: 0, vy: 0, t: 0, dur: 0.18, color: 3, lineTo: { x1, y1, x2, y2 } });
  },

  notify(text, dur = 2, sub = null) {
    this.banner = { text, sub, timer: dur, maxTimer: dur };
  },

  // --------------------------------------------------------------------------
  // 9. CONTROLLER & TOUCH INPUT HANDLING
  // --------------------------------------------------------------------------
  update(dt) {
    // Banner timer
    if (this.banner) {
      this.banner.timer -= dt;
      if (this.banner.timer <= 0) this.banner = null;
    }

    // State Transitions
    if (this.state === 'ROUND_END') {
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        if (this.playerHP > 0) {
          // If won, advance; if lost, retry
          const livingPlayer = this.combatants.filter(c => c.team === 'player' && !c.dead);
          if (livingPlayer.length > 0) this.advanceToNextRound();
          else this.retryRound();
        }
      }
      return;
    }

    if (this.state === 'GAMEOVER' || this.state === 'VICTORY') {
      if (PAD.hit('a') || PAD.hit('start') || PAD.tapPos) {
        APU.sfx('UI_OK');
        this.init();
      }
      return;
    }

    if (this.state === 'COMBAT') {
      // Toggle combat speed with SELECT or tapping speed button
      if (PAD.hit('select')) {
        this.combatSpeed = (this.combatSpeed === 1) ? 2 : 1;
        APU.sfx('UI_MOVE');
      }
      this.updateCombat(dt);
      return;
    }

    // PREPARATION PHASE INPUTS:
    // 1. Direct Touch / Tap Ergonomics
    if (PAD.tapPos) {
      this.handleTouchTap(PAD.tapPos.x, PAD.tapPos.y);
    }

    // 2. Gamepad / Keyboard D-Pad Navigation
    if (PAD.hit('start')) {
      // Shortcut to immediately engage battle
      this.startCombat();
      return;
    }

    if (PAD.hit('select')) {
      // Shortcut to reroll shop
      this.rollShop(false);
      return;
    }

    if (PAD.hit('b')) {
      // Cancel held unit or sell hovered unit
      if (this.heldUnit) {
        this.heldUnit = null;
        APU.sfx('UI_BACK');
      } else {
        // Quick sell currently hovered unit
        if (this.cursorZone === 'BENCH') {
          this.sellUnit('BENCH', this.cursorX);
        } else if (this.cursorZone === 'BOARD' && this.cursorY >= 2) {
          this.sellUnit('BOARD', this.cursorY, this.cursorX);
        }
      }
      return;
    }

    // D-Pad Zone Navigation
    if (PAD.hit('up')) {
      if (this.cursorZone === 'SHOP') {
        this.cursorZone = 'BENCH';
        this.cursorX = Math.min(3, this.cursorX);
        APU.sfx('UI_MOVE');
      } else if (this.cursorZone === 'BENCH') {
        this.cursorZone = 'BOARD';
        this.cursorY = 3; // Player Backline
        APU.sfx('UI_MOVE');
      } else if (this.cursorZone === 'BOARD') {
        if (this.cursorY > 0) {
          this.cursorY--;
          APU.sfx('UI_MOVE');
        }
      }
    } else if (PAD.hit('down')) {
      if (this.cursorZone === 'BOARD') {
        if (this.cursorY < 3) {
          this.cursorY++;
          APU.sfx('UI_MOVE');
        } else {
          this.cursorZone = 'BENCH';
          this.cursorX = Math.min(3, this.cursorX);
          APU.sfx('UI_MOVE');
        }
      } else if (this.cursorZone === 'BENCH') {
        this.cursorZone = 'SHOP';
        this.cursorX = 0;
        APU.sfx('UI_MOVE');
      }
    } else if (PAD.hit('left')) {
      if (this.cursorZone === 'BOARD') {
        this.cursorX = (this.cursorX - 1 + 6) % 6;
        APU.sfx('UI_MOVE');
      } else if (this.cursorZone === 'BENCH') {
        this.cursorX = (this.cursorX - 1 + 4) % 4;
        APU.sfx('UI_MOVE');
      } else if (this.cursorZone === 'SHOP') {
        this.cursorX = (this.cursorX - 1 + 5) % 5;
        APU.sfx('UI_MOVE');
      }
    } else if (PAD.hit('right')) {
      if (this.cursorZone === 'BOARD') {
        this.cursorX = (this.cursorX + 1) % 6;
        APU.sfx('UI_MOVE');
      } else if (this.cursorZone === 'BENCH') {
        this.cursorX = (this.cursorX + 1) % 4;
        APU.sfx('UI_MOVE');
      } else if (this.cursorZone === 'SHOP') {
        this.cursorX = (this.cursorX + 1) % 5;
        APU.sfx('UI_MOVE');
      }
    }

    // Button [A] Action
    if (PAD.hit('a')) {
      this.handleActionConfirm();
    }
  },

  handleActionConfirm() {
    if (this.cursorZone === 'SHOP') {
      if (this.cursorX >= 0 && this.cursorX <= 2) {
        this.buyShop(this.cursorX);
      } else if (this.cursorX === 3) {
        // [REROLL]
        this.rollShop(false);
      } else if (this.cursorX === 4) {
        // [BATTLE]
        this.startCombat();
      }
    } else if (this.cursorZone === 'BENCH') {
      const idx = this.cursorX;
      if (!this.heldUnit) {
        // Pick up unit if exists
        if (this.bench[idx]) {
          this.heldUnit = { source: 'BENCH', idx, unit: this.bench[idx] };
          APU.sfx('UI_OK');
        }
      } else {
        // Drop or Swap into bench slot
        this.deployOrSwap(this.heldUnit, { target: 'BENCH', idx });
      }
    } else if (this.cursorZone === 'BOARD') {
      const r = this.cursorY;
      const c = this.cursorX;

      if (r < 2) {
        this.notify("ENEMY TERRITORY!", 1.2);
        APU.sfx('DENY');
        return;
      }

      if (!this.heldUnit) {
        // Pick up unit if exists
        if (this.board[r][c]) {
          this.heldUnit = { source: 'BOARD', r, c, unit: this.board[r][c] };
          APU.sfx('UI_OK');
        }
      } else {
        // Drop or Swap into player board slot
        this.deployOrSwap(this.heldUnit, { target: 'BOARD', r, c });
      }
    }
  },

  handleTouchTap(tx, ty) {
    // 1. Check Shop Cards: Card 0: x=8..66, Card 1: x=70..128, Card 2: x=132..190, y=152..206
    if (ty >= 152 && ty <= 206) {
      if (tx >= 8 && tx <= 66) { this.buyShop(0); return; }
      if (tx >= 70 && tx <= 128) { this.buyShop(1); return; }
      if (tx >= 132 && tx <= 190) { this.buyShop(2); return; }
    }

    // 2. Check Action Buttons: REROLL (x=194..250, y=152..177), BATTLE (x=194..250, y=181..206)
    if (tx >= 194 && tx <= 250) {
      if (ty >= 152 && ty <= 177) { this.rollShop(false); return; }
      if (ty >= 181 && ty <= 206) { this.startCombat(); return; }
    }

    // 3. Check Sell Button: x=214..250, y=122..146
    if (tx >= 214 && tx <= 250 && ty >= 122 && ty <= 146) {
      if (this.heldUnit) {
        if (this.heldUnit.source === 'BENCH') this.sellUnit('BENCH', this.heldUnit.idx);
        else this.sellUnit('BOARD', this.heldUnit.r, this.heldUnit.c);
      } else {
        this.notify("TAP UNIT TO SELL!", 1.5);
      }
      return;
    }

    // 4. Check Bench Slots (4 slots): x=40, 84, 128, 172 (w=36, h=25, y=122..146)
    if (ty >= 122 && ty <= 146) {
      for (let i = 0; i < 4; i++) {
        const bx = 40 + i * 44;
        if (tx >= bx && tx <= bx + 36) {
          this.cursorZone = 'BENCH';
          this.cursorX = i;
          if (!this.heldUnit) {
            if (this.bench[i]) {
              this.heldUnit = { source: 'BENCH', idx: i, unit: this.bench[i] };
              APU.sfx('UI_OK');
            }
          } else {
            this.deployOrSwap(this.heldUnit, { target: 'BENCH', idx: i });
          }
          return;
        }
      }
    }

    // 5. Check Grid Board: 6 cols (x=26..230, colW=34), 4 rows (y=21..117, rowH=24)
    if (tx >= 26 && tx <= 230 && ty >= 21 && ty <= 117) {
      const col = Math.floor((tx - 26) / 34);
      const row = Math.floor((ty - 21) / 24);
      if (col >= 0 && col < 6 && row >= 0 && row < 4) {
        this.cursorZone = 'BOARD';
        this.cursorX = col;
        this.cursorY = row;

        if (row < 2) {
          this.notify("ENEMY FORMATION PREVIEW", 1.2);
          return;
        }

        if (!this.heldUnit) {
          if (this.board[row][col]) {
            this.heldUnit = { source: 'BOARD', r: row, c: col, unit: this.board[row][col] };
            APU.sfx('UI_OK');
          }
        } else {
          this.deployOrSwap(this.heldUnit, { target: 'BOARD', r: row, c: col });
        }
        return;
      }
    }
  },

  deployOrSwap(sourceObj, targetObj) {
    const stageDef = this.STAGES[this.stage - 1] || this.STAGES[0];
    const unitToMove = sourceObj.unit;

    // Moving to BENCH
    if (targetObj.target === 'BENCH') {
      const targetIdx = targetObj.idx;
      const existingInTarget = this.bench[targetIdx];

      // Remove from source
      if (sourceObj.source === 'BENCH') this.bench[sourceObj.idx] = null;
      else this.board[sourceObj.r][sourceObj.c] = null;

      // Swap or Place
      this.bench[targetIdx] = unitToMove;
      if (existingInTarget) {
        if (sourceObj.source === 'BENCH') this.bench[sourceObj.idx] = existingInTarget;
        else this.board[sourceObj.r][sourceObj.c] = existingInTarget;
      }

      APU.sfx('UI_MOVE');
      this.heldUnit = null;
      return;
    }

    // Moving to BOARD
    if (targetObj.target === 'BOARD') {
      const tr = targetObj.r;
      const tc = targetObj.c;
      const existingInTarget = this.board[tr][tc];

      // Check army cap if moving a new unit from bench onto an empty board tile
      if (sourceObj.source === 'BENCH' && !existingInTarget) {
        if (this.countDeployed() >= stageDef.cap) {
          this.notify("ARMY CAP REACHED! (" + stageDef.cap + " MAX)", 2);
          APU.sfx('DENY');
          return;
        }
      }

      // Remove from source
      if (sourceObj.source === 'BENCH') this.bench[sourceObj.idx] = null;
      else this.board[sourceObj.r][sourceObj.c] = null;

      // Swap or Place
      this.board[tr][tc] = unitToMove;
      if (existingInTarget) {
        if (sourceObj.source === 'BENCH') this.bench[sourceObj.idx] = existingInTarget;
        else this.board[sourceObj.r][sourceObj.c] = existingInTarget;
      }

      APU.sfx('UI_MOVE');
      this.heldUnit = null;
    }
  },

  // --------------------------------------------------------------------------
  // 10. RENDERING ENGINE (256x240 CRT PHOSPHOR AESTHETIC)
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    // 1. Top HUD Header Bar (y: 0..19)
    this.renderHUD(g);

    // 2. 6x4 Grid Battlefield (y: 21..117)
    this.renderBattlefield(g);

    // 3. Bench Slots (y: 122..146)
    this.renderBench(g);

    // 4. Shop / Combat Action Section (y: 151..238)
    if (this.state === 'COMBAT') {
      this.renderCombatDashboard(g);
    } else {
      this.renderShop(g);
    }

    // 5. Overlays (Banner / Floating Numbers / Particles / Victory / Game Over)
    this.renderOverlays(g);
  },

  renderHUD(g) {
    g.rect(0, 0, 256, 19, 1);
    g.line(0, 19, 256, 19, 2);

    // Stage Label
    const stageDef = this.STAGES[this.stage - 1] || this.STAGES[0];
    g.text("STG " + this.stage + "/10", 6, 6, 3);

    // Player HP
    g.text("HP:" + this.playerHP, 62, 6, (this.playerHP <= 25) ? 3 : 2);

    // Player Gold & Interest
    const interest = Math.min(3, Math.floor(this.gold / 10));
    g.text("$" + this.gold + " (+" + interest + ")", 104, 6, 3);

    // Army Deploy Cap
    const deployed = this.countDeployed();
    const cap = stageDef.cap;
    g.text("CAP:" + deployed + "/" + cap, 154, 6, (deployed > cap) ? 3 : 2);

    // Synergies Active Indicators
    const pUnits = [];
    for (let r = 2; r <= 3; r++) {
      for (let c = 0; c < 6; c++) {
        if (this.board[r][c]) pUnits.push(this.board[r][c]);
      }
    }
    const syn = this.getSynergies(pUnits);
    let synX = 210;
    if (syn.warrior) { g.text("W2", synX, 6, 3); synX += 14; }
    if (syn.rangerMage) { g.text("R2", synX, 6, 3); synX += 14; }
    if (syn.rogueCleric) { g.text("C2", synX, 6, 3); }
  },

  renderBattlefield(g) {
    const ox = 26;
    const oy = 21;
    const cw = 34;
    const ch = 24;

    // Outer Battlefield Frame
    g.box(ox - 2, oy - 2, cw * 6 + 4, ch * 4 + 4, 1);

    // Dotted Center Line dividing Enemy and Player zones (between row 1 and 2)
    const midY = oy + ch * 2;
    for (let x = ox; x < ox + cw * 6; x += 4) {
      g.px(x, midY - 1, 2);
    }

    // Grid Cells
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        const cx = ox + c * cw;
        const cy = oy + r * ch;

        // Subtle cell border
        g.box(cx, cy, cw, ch, 1);

        // Highlight player deployment zone with faint corner markers
        if (r >= 2) {
          g.px(cx + 2, cy + 2, 1);
          g.px(cx + cw - 3, cy + 2, 1);
          g.px(cx + 2, cy + ch - 3, 1);
          g.px(cx + cw - 3, cy + ch - 3, 1);
        }

        // Cursor highlight in PREP phase
        if (this.state === 'PREP' && this.cursorZone === 'BOARD' && this.cursorX === c && this.cursorY === r) {
          g.box(cx + 1, cy + 1, cw - 2, ch - 2, 3);
        }

        // In PREPARATION: Render units placed on the board
        if (this.state === 'PREP') {
          if (r < 2) {
            // Preview of Enemy layout from Stage definition
            const stageDef = this.STAGES[this.stage - 1] || this.STAGES[0];
            const enemy = stageDef.enemies.find(e => e.r === r && e.c === c);
            if (enemy) {
              this.renderUnitSprite(g, enemy.type, enemy.stars, cx + cw / 2, cy + ch / 2, 'enemy', false);
            }
          } else {
            // Player unit
            const unit = this.board[r][c];
            if (unit) {
              const isHeld = (this.heldUnit && this.heldUnit.source === 'BOARD' && this.heldUnit.r === r && this.heldUnit.c === c);
              this.renderUnitSprite(g, unit.type, unit.stars, cx + cw / 2, cy + ch / 2, 'player', isHeld);
            }
          }
        }
      }
    }

    // In COMBAT: Render active dynamic combatants, health bars, and mana bars
    if (this.state === 'COMBAT' || this.state === 'ROUND_END') {
      this.combatants.forEach(combatant => {
        if (!combatant.dead) {
          this.renderCombatant(g, combatant);
        }
      });
    }
  },

  renderCombatant(g, c) {
    const px = Math.round(c.renderX);
    const py = Math.round(c.renderY);

    // Unit Sprite
    this.renderUnitSprite(g, c.type, c.stars, px, py, c.team, false);

    // Health Bar (Width 20, Height 2, at py - 8)
    const barW = 20;
    const hpW = Math.max(0, Math.min(barW, Math.round((c.hp / c.maxHp) * barW)));
    g.rect(px - 10, py - 9, barW, 2, 0);
    g.rect(px - 10, py - 9, hpW, 2, (c.team === 'player') ? 3 : 2);

    // Shield Bar overlay in bright color if active
    if (c.shield > 0) {
      const shieldW = Math.min(barW, Math.round((c.shield / c.maxHp) * barW));
      g.rect(px - 10, py - 9, shieldW, 1, 3);
    }

    // Mana Bar (Width 20, Height 1, at py - 6)
    const manaW = Math.max(0, Math.min(barW, Math.round((c.mana / c.maxMana) * barW)));
    g.rect(px - 10, py - 6, barW, 1, 0);
    g.rect(px - 10, py - 6, manaW, 1, (c.mana >= 100) ? 3 : 2);
  },

  renderUnitSprite(g, type, stars, cx, cy, team, isDim = false) {
    const col = isDim ? 1 : ((team === 'player') ? 3 : 2);
    const subCol = isDim ? 0 : 2;

    cx = Math.round(cx);
    cy = Math.round(cy);

    // 2-Star Unit: Star badge above head
    if (stars === 2) {
      g.text("★", cx - 3, cy - 12, 3);
    }

    // Custom 12x12 Pixel Art Sprites
    switch (type) {
      case 'KNIGHT':
        // Great Helm with T-visor slit & Shield
        g.rect(cx - 4, cy - 5, 8, 9, col);
        g.rect(cx - 2, cy - 3, 4, 2, 0); // Visor slit
        g.rect(cx + 4, cy - 2, 3, 6, subCol); // Broad Shield
        g.line(cx - 5, cy + 4, cx + 5, cy + 4, col); // Feet
        break;

      case 'ARCHER':
        // Hooded Ranger with Recurve Bow
        g.tri(cx - 3, cy - 5, cx + 3, cy - 5, cx, cy - 7, col); // Hood peak
        g.rect(cx - 3, cy - 4, 6, 8, col);
        g.line(cx - 5, cy - 5, cx - 5, cy + 3, subCol); // Bow spine
        g.line(cx - 4, cy - 1, cx - 1, cy - 1, 3); // Arrow nocked
        break;

      case 'MAGE':
        // Pointed Wizard Hat with staff
        g.tri(cx - 4, cy - 3, cx + 4, cy - 3, cx, cy - 8, col); // Hat cone
        g.line(cx - 5, cy - 3, cx + 5, cy - 3, col); // Brim
        g.rect(cx - 3, cy - 2, 6, 7, col); // Robe
        g.line(cx + 4, cy - 6, cx + 4, cy + 4, subCol); // Staff
        g.px(cx + 4, cy - 7, 3); // Arcane gem orb
        break;

      case 'ASSASSIN':
        // Ninja cowl with dual curved daggers
        g.rect(cx - 4, cy - 5, 8, 8, col);
        g.line(cx - 3, cy - 2, cx + 3, cy - 2, 0); // Eye slit
        g.line(cx - 6, cy - 1, cx - 4, cy + 2, 3); // Left dagger
        g.line(cx + 6, cy - 1, cx + 4, cy + 2, 3); // Right dagger
        break;

      case 'CLERIC':
        // Mitre & Robes with Holy Cross
        g.rect(cx - 3, cy - 6, 6, 10, col);
        g.line(cx, cy - 3, cx, cy + 1, 3); // Cross vertical
        g.line(cx - 2, cy - 1, cx + 2, cy - 1, 3); // Cross horizontal
        g.line(cx + 4, cy - 5, cx + 4, cy + 4, subCol); // Mace/Censer
        break;

      case 'BERSERKER':
        // Horned barbarian helm & dual heavy battleaxes
        g.rect(cx - 4, cy - 4, 8, 8, col);
        g.line(cx - 5, cy - 6, cx - 3, cy - 4, 3); // Left horn
        g.line(cx + 5, cy - 6, cx + 3, cy - 4, 3); // Right horn
        g.line(cx - 6, cy - 2, cx - 6, cy + 3, subCol); // Left axe
        g.line(cx + 6, cy - 2, cx + 6, cy + 3, subCol); // Right axe
        break;

      case 'DRAGON':
        // Giant Emerald Wyrm (24x16 imposing monster)
        g.rect(cx - 10, cy - 6, 20, 12, col);
        g.tri(cx + 8, cy - 8, cx + 12, cy - 4, cx + 8, cy, 3); // Spout/jaw
        g.line(cx - 8, cy - 10, cx - 2, cy - 6, 3); // Left wing horn
        g.line(cx + 2, cy - 10, cx + 8, cy - 6, 3); // Right wing horn
        g.px(cx + 6, cy - 4, 0); // Dragon eye slit
        break;

      default:
        // Generic Monster / Wolf / Goblin
        g.rect(cx - 4, cy - 4, 8, 8, col);
        g.px(cx - 2, cy - 2, 0);
        g.px(cx + 2, cy - 2, 0);
        break;
    }
  },

  renderBench(g) {
    g.rect(0, 119, 256, 30, 0);
    g.line(0, 119, 256, 119, 1);
    g.text("BENCH", 8, 131, 2);

    // 4 Bench Slots
    for (let i = 0; i < 4; i++) {
      const bx = 40 + i * 44;
      const by = 122;
      const isSelected = (this.state === 'PREP' && this.cursorZone === 'BENCH' && this.cursorX === i);

      g.box(bx, by, 36, 24, isSelected ? 3 : 1);

      const unit = this.bench[i];
      if (unit) {
        const isHeld = (this.heldUnit && this.heldUnit.source === 'BENCH' && this.heldUnit.idx === i);
        this.renderUnitSprite(g, unit.type, unit.stars, bx + 18, by + 12, 'player', isHeld);
      }
    }

    // Sell Button
    const isSellHovered = (this.heldUnit !== null);
    g.box(214, 122, 38, 24, isSellHovered ? 3 : 1);
    g.text("SELL", 220, 127, isSellHovered ? 3 : 2);
    g.text("[B]", 224, 136, 1);
  },

  renderShop(g) {
    g.rect(0, 150, 256, 90, 1);
    g.line(0, 150, 256, 150, 2);

    // 3 Shop Cards
    for (let i = 0; i < 3; i++) {
      const card = this.shop[i];
      const cx = 8 + i * 62;
      const cy = 153;
      const isSelected = (this.cursorZone === 'SHOP' && this.cursorX === i);

      g.box(cx, cy, 58, 52, isSelected ? 3 : 2);

      if (card) {
        const def = this.CHAMP_TYPES[card.type];
        // Header: Name & Cost
        g.text(def.name.substr(0, 7), cx + 3, cy + 4, 3);
        g.text("$" + card.cost, cx + 43, cy + 4, (this.gold >= card.cost) ? 3 : 1);

        // Role & Class
        g.text(def.role.substr(0, 8), cx + 3, cy + 12, 2);

        // Sprite portrait
        this.renderUnitSprite(g, card.type, 1, cx + 29, cy + 27, 'player', false);

        // Stats summary: HP / ATK
        g.text("H:" + def.hp, cx + 3, cy + 39, 2);
        g.text("A:" + def.atk, cx + 31, cy + 39, 2);
      } else {
        g.textC("SOLD", cy + 22, 1);
      }
    }

    // Action Buttons: [REROLL $1] and [BATTLE (A)]
    const isRerollSelected = (this.cursorZone === 'SHOP' && this.cursorX === 3);
    const isBattleSelected = (this.cursorZone === 'SHOP' && this.cursorX === 4);

    // Reroll Button
    g.box(196, 153, 54, 24, isRerollSelected ? 3 : 2);
    g.text("REROLL", 204, 158, (this.gold >= 1) ? 3 : 1);
    g.text("$1 [SEL]", 206, 167, 2);

    // Battle Button
    g.box(196, 181, 54, 24, isBattleSelected ? 3 : 2);
    g.text("BATTLE", 204, 186, 3);
    g.text("[A/START]", 199, 195, 2);

    // Bottom Selected Unit Inspection Bar (y: 208..238)
    g.line(0, 208, 256, 208, 2);
    this.renderInspectionBar(g);
  },

  renderInspectionBar(g) {
    let inspectUnit = null;

    if (this.heldUnit) {
      inspectUnit = this.heldUnit.unit;
    } else if (this.cursorZone === 'BENCH' && this.bench[this.cursorX]) {
      inspectUnit = this.bench[this.cursorX];
    } else if (this.cursorZone === 'BOARD' && this.board[this.cursorY] && this.board[this.cursorY][this.cursorX]) {
      inspectUnit = this.board[this.cursorY][this.cursorX];
    }

    if (inspectUnit) {
      const def = this.CHAMP_TYPES[inspectUnit.type] || this.MONSTER_TYPES[inspectUnit.type];
      const starStr = (inspectUnit.stars === 2) ? "★★" : "★";
      g.text(starStr + " " + def.name + " (" + def.role + ")", 8, 212, 3);
      const hp = (inspectUnit.stars === 2 && def.hp2) ? def.hp2 : def.hp;
      const atk = (inspectUnit.stars === 2 && def.atk2) ? def.atk2 : def.atk;
      const arm = (inspectUnit.stars === 2 && def.armor2) ? def.armor2 : def.armor;
      g.text("HP:" + hp + " ATK:" + atk + " ARM:" + arm + " RNG:" + def.range, 8, 221, 2);
      g.text("ULT: " + def.ultDesc, 8, 230, 3);
    } else {
      g.textC("TAP / [A]: PICK & MOVE | [B]: SELL | [A/START]: BATTLE", 218, 2);
      g.textC("COLLECT 3 COPIES TO MERGE INTO A 2-STAR UNIT!", 228, 1);
    }
  },

  renderCombatDashboard(g) {
    g.rect(0, 150, 256, 90, 1);
    g.line(0, 150, 256, 150, 2);

    const livingPlayer = this.combatants.filter(c => c.team === 'player' && !c.dead).length;
    const livingEnemy = this.combatants.filter(c => c.team === 'enemy' && !c.dead).length;

    g.text("AUTO-COMBAT IN PROGRESS...", 14, 158, 3);
    g.text("SPEED: " + this.combatSpeed + "X [SELECT]", 166, 158, 2);

    g.box(14, 170, 228, 24, 2);
    g.text("ALLIES ALIVE: " + livingPlayer, 24, 178, 3);
    g.text("FOES ALIVE: " + livingEnemy, 144, 178, 2);

    // Tip / Ticker
    g.textC("MANA FILLS ON ATTACKING & TAKING DAMAGE!", 206, 2);
    g.textC("UNITS UNLEASH ULTIMATES AUTOMATICALLY AT 100 MANA!", 218, 3);
    g.textC("SUDDEN DEATH AT 35 SECONDS!", 228, 1);
  },

  renderOverlays(g) {
    // Projectiles
    this.projectiles.forEach(p => {
      const px = Math.round(p.x);
      const py = Math.round(p.y);
      if (p.type === 'ARROW') {
        g.line(px - 2, py, px + 2, py, 3);
      } else {
        g.rect(px - 1, py - 1, 3, 3, 3);
      }
    });

    // Particles
    this.particles.forEach(pt => {
      if (pt.lineTo) {
        g.line(pt.lineTo.x1, pt.lineTo.y1, pt.x, pt.y, pt.color);
        g.line(pt.x, pt.y, pt.lineTo.x2, pt.lineTo.y2, pt.color);
      } else {
        g.px(Math.round(pt.x), Math.round(pt.y), pt.color);
      }
    });

    // Floating Numbers
    this.floatingTexts.forEach(ft => {
      g.text(ft.text, Math.round(ft.x - ft.text.length * 2), Math.round(ft.y), ft.color);
    });

    // Notification Banner
    if (this.banner) {
      const bannerW = 220;
      const bx = (256 - bannerW) / 2;
      const by = 80;
      g.rect(bx - 2, by - 2, bannerW + 4, 24, 0);
      g.box(bx, by, bannerW, 20, 3);
      g.textC(this.banner.text, by + 6, 3);
    }

    // VICTORY Screen
    if (this.state === 'VICTORY') {
      g.rect(20, 40, 216, 140, 0);
      g.box(20, 40, 216, 140, 3);
      g.box(24, 44, 208, 132, 2);

      g.textC("★ GRAND CAMPAIGN VICTORY! ★", 58, 3);
      g.textC("THE EMERALD WYRM HAS FALLEN!", 74, 2);
      g.textC("YOU ARE THE AUTOBATTLER CHAMPION!", 88, 3);
      g.textC("FINAL SCORE: 10 STAGES CLEARED", 108, 3);
      g.textC("TOTAL GOLD HOARD: $" + this.gold, 122, 2);
      g.textC("[A] PLAY NEW CAMPAIGN", 146, 3);
    }

    // GAME OVER Screen
    if (this.state === 'GAMEOVER') {
      g.rect(24, 50, 208, 120, 0);
      g.box(24, 50, 208, 120, 2);
      g.box(28, 54, 200, 112, 1);

      g.textC("GAME OVER", 68, 3);
      g.textC("YOUR SQUAD WAS OVERWHELMED!", 84, 2);
      g.textC("STAGE REACHED: " + this.stage + " / 10", 100, 3);
      g.textC("BEST SCORE: " + this.maxStage + " STAGES", 114, 2);
      g.textC("PRESS [A] OR TAP TO RESTART", 136, 3);
    }
  },

  // --------------------------------------------------------------------------
  // 11. PERSISTENCE (SAVE / LOAD STATE)
  // --------------------------------------------------------------------------
  save() {
    return {
      stage: this.stage,
      maxStage: this.maxStage,
      playerHP: this.playerHP,
      gold: this.gold,
      streak: this.streak,
      board: this.board,
      bench: this.bench
    };
  },

  load(data) {
    if (!data) return;
    if (typeof data.stage === 'number') this.stage = Math.max(1, Math.min(10, data.stage));
    if (typeof data.maxStage === 'number') this.maxStage = Math.max(1, data.maxStage);
    if (typeof data.playerHP === 'number') this.playerHP = Math.max(1, data.playerHP);
    if (typeof data.gold === 'number') this.gold = Math.max(0, data.gold);
    if (typeof data.streak === 'number') this.streak = data.streak || 0;
    if (Array.isArray(data.board)) this.board = data.board;
    if (Array.isArray(data.bench)) this.bench = data.bench;
    this.rollShop(true);
  }
};
