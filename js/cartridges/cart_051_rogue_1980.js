// js/cartridges/cart_051_rogue_1980.js
// ============================================================================
// Cartridge #051: ROGUE 1980
// Genre: RPG (5) | Procedural ASCII Roguelike Dungeon Crawler
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// Ensure 4x6 bitmap font includes authentic classic Rogue '@' glyph
if (typeof FONT_4x6 !== 'undefined' && !FONT_4x6['@']) {
  FONT_4x6['@'] = [0x6, 0x9, 0xb, 0x8, 0x7, 0x0];
}

// 51. ROGUE 1980
CARTS[51] = {
  id: 51,
  name: "ROGUE 1980",
  genre: 5,
  scoreLabel: "SCORE",
  desc: "DUNGEON CRAWLER: MOVE/ATK WITH D-PAD. [A] INTERACT/WAIT. [B] INVENTORY. RETRIEVE THE AMULET OF YENDOR ON DEPTH 8!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Stone dungeon archway doorway, crossed swords, and central hero '@'
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Stone dungeon archway doorway
    // Left pillar
    g.rect(x + 3, y + 8, 3, 21, 2);
    g.line(x + 2, y + 8, x + 2, y + 28, 1);
    // Right pillar
    g.rect(x + 26, y + 8, 3, 21, 2);
    g.line(x + 29, y + 8, x + 29, y + 28, 1);
    // Arch top
    g.rect(x + 4, y + 5, 24, 3, 2);
    g.line(x + 6, y + 4, x + 25, y + 4, 3);
    g.line(x + 9, y + 3, x + 22, y + 3, 3);
    // Arch keystone
    g.rect(x + 14, y + 2, 4, 4, 3);

    // Dark dungeon interior
    g.rect(x + 6, y + 8, 20, 20, 0);

    // Crossed Swords behind hero
    // Blade 1 (top-left to bottom-right)
    g.line(x + 7, y + 9, x + 24, y + 26, 3);
    g.line(x + 6, y + 11, x + 10, y + 7, 2); // crossguard
    // Blade 2 (top-right to bottom-left)
    g.line(x + 24, y + 9, x + 7, y + 26, 3);
    g.line(x + 25, y + 11, x + 21, y + 7, 2); // crossguard

    // Flagstone floor at base
    g.line(x + 6, y + 28, x + 25, y + 28, 2);
    g.line(x + 3, y + 29, x + 28, y + 29, 1);

    // Central glowing Hero '@'
    g.rect(x + 11, y + 12, 10, 10, 0);
    g.text("@", x + 14, y + 14, 3);
  },

  // --------------------------------------------------------------------------
  // AUDIO HELPER
  // --------------------------------------------------------------------------
  sfx(name) {
    if (typeof APU === 'undefined' || !APU.sfx) return;
    const map = {
      'SELECT': 'UI_MOVE',
      'CONFIRM': 'UI_OK',
      'CANCEL': 'UI_BACK',
      'HIT': 'HIT',
      'COIN': 'COIN',
      'ERROR': 'DENY',
      'EXPLODE': 'BOOM',
      'TICK': 'TICK',
      'FANFARE': 'LEVELUP',
      'POWERUP': 'POWER',
      'HURT': 'HURT',
      'LEVELUP': 'LEVELUP'
    };
    try {
      APU.sfx(map[name] || name);
    } catch (_) {}
  },

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------
  init() {
    this.MAP_W = 30;
    this.MAP_H = 21;
    this.TILE_SZ = 8;
    this.OX = 8;
    this.OY = 20;

    // Difficulty settings
    const diff = (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : 1;
    this.difficulty = diff; // 0: Easy, 1: Normal, 2: Hard

    // Hero state
    this.lvl = 1;
    this.exp = 0;
    this.expNext = 12;
    this.maxHp = (diff === 0) ? 22 : (diff === 2) ? 13 : 16;
    this.hp = this.maxHp;
    this.baseAtk = 3;
    this.gold = 0;
    this.food = (diff === 0) ? 600 : (diff === 2) ? 400 : 500;
    this.starveCounter = 0;
    this.restCounter = 0;

    // Status buffs/debuffs
    this.strTurns = 0;
    this.spdTurns = 0;
    this.poisonTurns = 0;
    this.hasAmulet = false;

    // Equipment
    this.equippedWeap = { type: 'WEAPON', sub: 'DAGGER', name: "DAGGER", bonus: 2, glyph: ')' };
    this.equippedArm = (diff === 0) ? { type: 'ARMOR', sub: 'LEATHER', name: "LEATHER", def: 2, glyph: ']' } : null;

    // Pack Inventory (up to 8 items)
    this.inventory = [
      { type: 'POTION', sub: 'HEAL', name: "HEAL POTION", glyph: '!' },
      { type: 'FOOD', sub: 'RATIONS', name: "IRON RATIONS", glyph: '%' }
    ];

    // Floor & Progress
    this.floor = 1;
    this.maxFloors = 8;
    this.state = 'PLAY'; // 'PLAY' | 'INVENTORY' | 'GAMEOVER' | 'VICTORY'
    this.killer = "";
    this.turns = 0;
    this.shake = 0;

    // UI & Message Ticker
    this.msgLog = [
      "WELCOME TO THE DUNGEONS OF DOOM!",
      "SEEK THE AMULET OF YENDOR ON DEPTH 8."
    ];
    this.invOpen = false;
    this.invCursor = 0;

    // Procedural Floor Generation
    this.generateFloor();
  },

  // --------------------------------------------------------------------------
  // MESSAGE LOG HELPER
  // --------------------------------------------------------------------------
  addMsg(msg) {
    if (!msg) return;
    this.msgLog.unshift(msg.toUpperCase());
    if (this.msgLog.length > 6) this.msgLog.pop();
  },

  // --------------------------------------------------------------------------
  // SCORE CALCULATION
  // High score formula: Gold + (Level * 100) + (Dungeon Depth * 250) + (Amulet bonus 2000)
  // --------------------------------------------------------------------------
  calcScore() {
    let score = this.gold + (this.lvl * 100) + (this.floor * 250);
    if (this.hasAmulet) score += 2000;
    return score;
  },

  // --------------------------------------------------------------------------
  // PROCEDURAL DUNGEON GENERATOR (3x3 SECTOR GRID)
  // 100% self-contained: no external dependencies.
  // --------------------------------------------------------------------------
  generateFloor() {
    const W = this.MAP_W;
    const H = this.MAP_H;

    // Initialize map grid
    // ' ' = empty void, '#' = corridor, '.' = room floor, '-' / '|' = wall, '+' = door, '>' = stairs
    this.map = [];
    this.explored = [];
    this.visible = [];

    for (let y = 0; y < H; y++) {
      this.map[y] = new Array(W).fill(' ');
      this.explored[y] = new Array(W).fill(false);
      this.visible[y] = new Array(W).fill(false);
    }

    this.rooms = [];

    // 3x3 sectors: sector width 10, sector height 7
    for (let sy = 0; sy < 3; sy++) {
      for (let sx = 0; sx < 3; sx++) {
        const roomId = sy * 3 + sx;
        const secX = sx * 10;
        const secY = sy * 7;

        // Random room dimensions
        const rw = 4 + Math.floor(Math.random() * 4); // 4 to 7
        const rh = 3 + Math.floor(Math.random() * 3); // 3 to 5
        const rx = secX + 1 + Math.floor(Math.random() * (9 - rw));
        const ry = secY + 1 + Math.floor(Math.random() * (6 - rh));

        const room = {
          id: roomId,
          x: rx, y: ry, w: rw, h: rh,
          cx: Math.floor(rx + rw / 2),
          cy: Math.floor(ry + rh / 2)
        };
        this.rooms.push(room);

        // Carve room floor
        for (let y = ry; y < ry + rh; y++) {
          for (let x = rx; x < rx + rw; x++) {
            this.map[y][x] = '.';
          }
        }

        // Room walls
        for (let x = rx - 1; x <= rx + rw; x++) {
          if (x >= 0 && x < W) {
            if (ry - 1 >= 0 && this.map[ry - 1][x] === ' ') this.map[ry - 1][x] = '-';
            if (ry + rh < H && this.map[ry + rh][x] === ' ') this.map[ry + rh][x] = '-';
          }
        }
        for (let y = ry - 1; y <= ry + rh; y++) {
          if (y >= 0 && y < H) {
            if (rx - 1 >= 0 && this.map[y][rx - 1] === ' ') this.map[y][rx - 1] = '|';
            if (rx + rw < W && this.map[y][rx + rw] === ' ') this.map[y][rx + rw] = '|';
          }
        }
      }
    }

    // Connect rooms using randomized spanning tree + extra loop edges
    const allEdges = [
      [0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8], // Horizontal
      [0, 3], [1, 4], [2, 5], [3, 6], [4, 7], [5, 8]  // Vertical
    ];

    const connectedEdges = [];
    const inTree = new Set([0]);

    while (inTree.size < 9) {
      const candidates = allEdges.filter(e =>
        (inTree.has(e[0]) && !inTree.has(e[1])) || (inTree.has(e[1]) && !inTree.has(e[0]))
      );
      if (candidates.length === 0) break;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      connectedEdges.push(pick);
      inTree.add(pick[0]);
      inTree.add(pick[1]);
    }

    // Add 2-3 extra edges for loops and alternate paths
    for (let e of allEdges) {
      if (!connectedEdges.some(ce => (ce[0] === e[0] && ce[1] === e[1]) || (ce[0] === e[1] && ce[1] === e[0]))) {
        if (Math.random() < 0.4) connectedEdges.push(e);
      }
    }

    // Carve corridors between connected rooms
    for (let edge of connectedEdges) {
      const r1 = this.rooms[edge[0]];
      const r2 = this.rooms[edge[1]];
      this.carveCorridor(r1.cx, r1.cy, r2.cx, r2.cy);
    }

    // Spawn player in room 0 (or random room)
    const startRoom = this.rooms[0];
    this.px = startRoom.cx;
    this.py = startRoom.cy;

    // Spawn stairs down in room 8 (farthest room from player)
    const stairRoom = this.rooms[8];
    this.stairsX = stairRoom.cx;
    this.stairsY = stairRoom.cy;
    this.map[this.stairsY][this.stairsX] = '>';

    // Bestiary & Items placement
    this.monsters = [];
    this.items = [];

    // On Floor 8: AMULET OF YENDOR and DRAGON BOSS in room 8!
    if (this.floor === this.maxFloors && !this.hasAmulet) {
      const amX = Math.min(W - 2, Math.max(1, stairRoom.x + 1));
      const amY = Math.min(H - 2, Math.max(1, stairRoom.y + 1));
      this.items.push({
        x: amX, y: amY,
        type: 'AMULET', sub: 'YENDOR',
        name: "AMULET OF YENDOR",
        glyph: '*'
      });

      // Guarding Dragon Boss
      this.monsters.push(this.createMonster('D', stairRoom.cx - 1, stairRoom.cy, 8));
    }

    // Spawn Monsters on this floor
    const numMonsters = 3 + this.floor + (this.difficulty === 2 ? 2 : 0);
    for (let i = 0; i < numMonsters; i++) {
      // Pick random room other than start room
      const rmIdx = 1 + Math.floor(Math.random() * 8);
      const rm = this.rooms[rmIdx];
      const mx = rm.x + Math.floor(Math.random() * rm.w);
      const my = rm.y + Math.floor(Math.random() * rm.h);

      if ((mx === this.px && my === this.py) || (mx === this.stairsX && my === this.stairsY)) continue;
      if (this.monsters.some(m => m.x === mx && m.y === my)) continue;

      const mType = this.pickMonsterTypeForFloor(this.floor);
      this.monsters.push(this.createMonster(mType, mx, my, rmIdx));
    }

    // Spawn Items on this floor
    const numItems = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numItems; i++) {
      const rmIdx = Math.floor(Math.random() * 9);
      const rm = this.rooms[rmIdx];
      const ix = rm.x + Math.floor(Math.random() * rm.w);
      const iy = rm.y + Math.floor(Math.random() * rm.h);

      if ((ix === this.px && iy === this.py) || (ix === this.stairsX && iy === this.stairsY)) continue;
      if (this.items.some(it => it.x === ix && it.y === iy)) continue;

      const it = this.createRandomItem(this.floor);
      if (it) {
        it.x = ix;
        it.y = iy;
        this.items.push(it);
      }
    }

    // Compute initial Field of View
    this.updateFOV();
  },

  // --------------------------------------------------------------------------
  // CORRIDOR CARVER
  // --------------------------------------------------------------------------
  carveCorridor(x1, y1, x2, y2) {
    const W = this.MAP_W;
    const H = this.MAP_H;

    const cornerX = Math.random() < 0.5 ? x2 : x1;
    const cornerY = (cornerX === x2) ? y1 : y2;

    const plot = (x, y) => {
      if (x < 1 || x >= W - 1 || y < 1 || y >= H - 1) return;
      const cur = this.map[y][x];
      if (cur === ' ') {
        this.map[y][x] = '#';
      } else if (cur === '-' || cur === '|') {
        this.map[y][x] = '+'; // Doorway where corridor meets room wall
      }
    };

    let cx = x1, cy = y1;
    const sx1 = Math.sign(cornerX - cx);
    while (cx !== cornerX) {
      plot(cx, cy);
      cx += sx1;
    }
    const sy1 = Math.sign(cornerY - cy);
    while (cy !== cornerY) {
      plot(cx, cy);
      cy += sy1;
    }
    const sx2 = Math.sign(x2 - cx);
    while (cx !== x2) {
      plot(cx, cy);
      cx += sx2;
    }
    const sy2 = Math.sign(y2 - cy);
    while (cy !== y2) {
      plot(cx, cy);
      cy += sy2;
    }
    plot(x2, y2);
  },

  // --------------------------------------------------------------------------
  // MONSTER BESTIARY FACTORY
  // 'K' Kobold, 'B' Bat, 'G' Goblin, 'O' Orc, 'T' Troll, 'D' Dragon
  // --------------------------------------------------------------------------
  pickMonsterTypeForFloor(floor) {
    const r = Math.random();
    if (floor === 1) return (r < 0.65) ? 'K' : 'B';
    if (floor === 2) return (r < 0.40) ? 'K' : (r < 0.70) ? 'B' : 'G';
    if (floor === 3) return (r < 0.25) ? 'K' : (r < 0.50) ? 'G' : (r < 0.80) ? 'B' : 'O';
    if (floor === 4) return (r < 0.35) ? 'G' : (r < 0.65) ? 'O' : (r < 0.85) ? 'B' : 'T';
    if (floor === 5) return (r < 0.25) ? 'G' : (r < 0.60) ? 'O' : 'T';
    if (floor === 6) return (r < 0.40) ? 'O' : (r < 0.85) ? 'T' : 'D';
    if (floor === 7) return (r < 0.30) ? 'O' : (r < 0.75) ? 'T' : 'D';
    return (r < 0.30) ? 'O' : (r < 0.70) ? 'T' : 'D';
  },

  createMonster(type, x, y, roomId) {
    const diff = this.difficulty;
    const hpMult = (diff === 0) ? 0.8 : (diff === 2) ? 1.2 : 1.0;
    const atkBonus = (diff === 2) ? 1 : 0;

    let name = "KOBOLD", hp = 6, atk = 3, def = 0, exp = 6;
    if (type === 'B') {
      name = "BAT"; hp = 4; atk = 2; def = 1; exp = 7;
    } else if (type === 'G') {
      name = "GOBLIN"; hp = 12; atk = 4; def = 1; exp = 14;
    } else if (type === 'O') {
      name = "ORC"; hp = 20; atk = 7; def = 2; exp = 26;
    } else if (type === 'T') {
      name = "TROLL"; hp = 32; atk = 9; def = 3; exp = 52;
    } else if (type === 'D') {
      name = "DRAGON"; hp = 75; atk = 14; def = 5; exp = 180;
    }

    hp = Math.max(2, Math.floor(hp * hpMult));
    atk += atkBonus;

    return {
      type, name, x, y,
      hp, maxHp: hp,
      atk, def, exp,
      roomId,
      alive: true,
      alert: 0
    };
  },

  // --------------------------------------------------------------------------
  // RANDOM ITEM GENERATOR
  // Potions, scrolls, weapons, armors, gold heaps, rations
  // --------------------------------------------------------------------------
  createRandomItem(floor) {
    const roll = Math.random();

    // 1. Gold heaps ($) - 35%
    if (roll < 0.35) {
      const amt = 15 + Math.floor(Math.random() * (25 + floor * 15));
      return { type: 'GOLD', sub: 'COINS', name: amt + " GOLD", amount: amt, glyph: '$' };
    }

    // 2. Potions (!) - 25%
    if (roll < 0.60) {
      const p = Math.random();
      if (p < 0.45) return { type: 'POTION', sub: 'HEAL', name: "HEAL POTION", glyph: '!', desc: "RESTORES 16 HP" };
      if (p < 0.70) return { type: 'POTION', sub: 'STR', name: "STRENGTH POTION", glyph: '!', desc: "+3 ATK FOR 30 TURNS" };
      if (p < 0.90) return { type: 'POTION', sub: 'SPD', name: "SPEED POTION", glyph: '!', desc: "2X ACTIONS FOR 20 TURNS" };
      return { type: 'POTION', sub: 'POISON', name: "YELLOW POTION", glyph: '!', desc: "DANGEROUS VENOM!" };
    }

    // 3. Scrolls (?) - 15%
    if (roll < 0.75) {
      const s = Math.random();
      if (s < 0.30) return { type: 'SCROLL', sub: 'TELE', name: "TELEPORT SCROLL", glyph: '?', desc: "WARP SAFELY" };
      if (s < 0.60) return { type: 'SCROLL', sub: 'MISSILE', name: "MISSILE SCROLL", glyph: '?', desc: "14 DMG TO FOES" };
      if (s < 0.80) return { type: 'SCROLL', sub: 'MAP', name: "MAP SCROLL", glyph: '?', desc: "REVEAL LEVEL" };
      return { type: 'SCROLL', sub: 'ENCHANT', name: "ENCHANT SCROLL", glyph: '?', desc: "UPGRADE GEAR" };
    }

    // 4. Weapons ()) - 8%
    if (roll < 0.83) {
      if (floor <= 2) return { type: 'WEAPON', sub: 'DAGGER', name: "DAGGER", bonus: 2, glyph: ')' };
      if (floor <= 4) return { type: 'WEAPON', sub: 'SWORD', name: "SHORTSWORD", bonus: 4, glyph: ')' };
      if (floor <= 6) return { type: 'WEAPON', sub: 'BROAD', name: "BROADSWORD", bonus: 6, glyph: ')' };
      return { type: 'WEAPON', sub: 'WARHAMMER', name: "WAR HAMMER", bonus: 9, glyph: ')' };
    }

    // 5. Armors (]) - 7%
    if (roll < 0.90) {
      if (floor <= 3) return { type: 'ARMOR', sub: 'LEATHER', name: "LEATHER ARMOR", def: 2, glyph: ']' };
      if (floor <= 6) return { type: 'ARMOR', sub: 'CHAIN', name: "CHAINMAIL", def: 4, glyph: ']' };
      return { type: 'ARMOR', sub: 'PLATE', name: "PLATE MAIL", def: 7, glyph: ']' };
    }

    // 6. Food rations (%) - 10%
    return { type: 'FOOD', sub: 'RATIONS', name: "IRON RATIONS", glyph: '%', desc: "+350 FOOD" };
  },

  // --------------------------------------------------------------------------
  // FIELD OF VIEW & FOG OF WAR
  // Rooms are lit entirely when hero is inside; corridors use circular torchlight.
  // --------------------------------------------------------------------------
  updateFOV() {
    const W = this.MAP_W;
    const H = this.MAP_H;

    // Reset current visible mask
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        this.visible[y][x] = false;
      }
    }

    // Check if player is inside any room
    this.playerRoomId = null;
    for (let r of this.rooms) {
      if (this.px >= r.x && this.px < r.x + r.w && this.py >= r.y && this.py < r.y + r.h) {
        this.playerRoomId = r.id;
        // Light up entire room interior & surrounding walls
        for (let y = Math.max(0, r.y - 1); y <= Math.min(H - 1, r.y + r.h); y++) {
          for (let x = Math.max(0, r.x - 1); x <= Math.min(W - 1, r.x + r.w); x++) {
            this.visible[y][x] = true;
            this.explored[y][x] = true;
          }
        }
        break;
      }
    }

    // Circular torchlight (radius 3.5) around player in all directions
    const torchR = 3.5;
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= torchR) {
          const tx = this.px + dx;
          const ty = this.py + dy;
          if (tx >= 0 && tx < W && ty >= 0 && ty < H) {
            // Line of sight raycast
            if (this.hasLineOfSight(this.px, this.py, tx, ty)) {
              this.visible[tx][ty] = true;
              this.explored[tx][ty] = true;
            }
          }
        }
      }
    }
  },

  hasLineOfSight(x0, y0, x1, y1) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    let cx = x0, cy = y0;
    while (true) {
      if (cx === x1 && cy === y1) return true;
      if (cx !== x0 || cy !== y0) {
        const t = this.map[cy][cx];
        if (t === '-' || t === '|' || t === ' ') return false;
      }
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; cx += sx; }
      if (e2 < dx) { err += dx; cy += sy; }
    }
  },

  // --------------------------------------------------------------------------
  // GAMEPLAY LIFECYCLE: UPDATE LOOP
  // --------------------------------------------------------------------------
  update(dt) {
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 10);

    // 1. GAME OVER / VICTORY STATES
    if (this.state === 'GAMEOVER' || this.state === 'VICTORY') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || PAD.tapPos) {
        this.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    // 2. INVENTORY MODAL STATE
    if (this.invOpen) {
      this.updateInventoryInput();
      return;
    }

    // 3. EXPLORATION & COMBAT INPUT HANDLING
    let dx = 0, dy = 0;
    let restAction = false;
    let invAction = false;
    let stairAction = false;

    // Direct Screen Taps (HUD Buttons, Map Tiles, Touch D-Pad)
    if (PAD.tapPos) {
      const tap = PAD.tapPos;

      // Check on-screen Action Buttons
      if (tap.y >= 220 && tap.y <= 239) {
        if (tap.x >= 8 && tap.x <= 50) {
          restAction = true; // [WAIT]
        } else if (tap.x >= 54 && tap.x <= 96) {
          invAction = true;  // [INV]
        } else if (tap.x >= 100 && tap.x <= 146) {
          stairAction = true; // [STAIR]
        } else if (tap.x >= 154 && tap.x <= 173) {
          dx = -1; // [◀]
        } else if (tap.x >= 174 && tap.x <= 194) {
          if (tap.y <= 228) dy = -1; else dy = 1; // [▲] / [▼]
        } else if (tap.x >= 195 && tap.x <= 214) {
          dx = 1;  // [▶]
        }
      }
      // Check tap on Playfield Map
      else if (tap.x >= this.OX && tap.x < this.OX + this.MAP_W * this.TILE_SZ &&
               tap.y >= this.OY && tap.y < this.OY + this.MAP_H * this.TILE_SZ) {
        const tx = Math.floor((tap.x - this.OX) / this.TILE_SZ);
        const ty = Math.floor((tap.y - this.OY) / this.TILE_SZ);

        if (tx === this.px && ty === this.py) {
          restAction = true;
        } else if (Math.abs(tx - this.px) + Math.abs(ty - this.py) === 1) {
          dx = tx - this.px;
          dy = ty - this.py;
        } else {
          // Move 1 step towards target
          if (Math.abs(tx - this.px) > Math.abs(ty - this.py)) {
            dx = Math.sign(tx - this.px);
          } else {
            dy = Math.sign(ty - this.py);
          }
        }
      }
    }

    // Touch Swipes
    if (PAD.swipe) {
      if (PAD.swipe === 'up') dy = -1;
      else if (PAD.swipe === 'down') dy = 1;
      else if (PAD.swipe === 'left') dx = -1;
      else if (PAD.swipe === 'right') dx = 1;
    }

    // Hardware / Keyboard D-Pad
    if (PAD.hit('left')) dx = -1;
    if (PAD.hit('right')) dx = 1;
    if (PAD.hit('up')) dy = -1;
    if (PAD.hit('down')) dy = 1;

    // Face Buttons
    if (PAD.hit('select')) invAction = true;
    if (PAD.hit('b')) invAction = true;

    if (PAD.hit('a')) {
      if (this.px === this.stairsX && this.py === this.stairsY) {
        stairAction = true;
      } else {
        restAction = true;
      }
    }

    // Process Actions
    if (invAction) {
      this.openInventory();
      return;
    }

    if (stairAction) {
      this.descendStairs();
      return;
    }

    if (restAction) {
      this.waitTurn();
      return;
    }

    if (dx !== 0 || dy !== 0) {
      this.stepPlayer(dx, dy);
    }
  },

  // --------------------------------------------------------------------------
  // INVENTORY MODAL LOGIC
  // --------------------------------------------------------------------------
  openInventory() {
    this.invOpen = true;
    this.invCursor = 0;
    this.sfx('SELECT');
  },

  closeInventory() {
    this.invOpen = false;
    this.sfx('CANCEL');
  },

  updateInventoryInput() {
    const totalOptions = 1 + this.inventory.length; // 0: REST TURN, 1..N: Items

    if (PAD.hit('up')) {
      this.invCursor = (this.invCursor - 1 + totalOptions) % totalOptions;
      this.sfx('SELECT');
    }
    if (PAD.hit('down')) {
      this.invCursor = (this.invCursor + 1) % totalOptions;
      this.sfx('SELECT');
    }
    if (PAD.hit('b') || PAD.hit('select')) {
      this.closeInventory();
      return;
    }

    let executeItem = false;
    if (PAD.hit('a')) executeItem = true;

    // Direct touch tap on inventory items or close button
    if (PAD.tapPos) {
      const tap = PAD.tapPos;
      // Click outside modal or on close area
      if (tap.x < 20 || tap.x > 236 || tap.y < 24 || tap.y > 196) {
        this.closeInventory();
        return;
      }
      // Click on an item row
      const startY = 54;
      const rowH = 12;
      for (let i = 0; i < totalOptions; i++) {
        const ry = startY + i * rowH;
        if (tap.y >= ry && tap.y < ry + rowH) {
          this.invCursor = i;
          executeItem = true;
          break;
        }
      }
    }

    if (executeItem) {
      if (this.invCursor === 0) {
        // [REST / WAIT TURN]
        this.closeInventory();
        this.waitTurn();
      } else {
        const itemIdx = this.invCursor - 1;
        this.useItem(itemIdx);
      }
    }
  },

  useItem(idx) {
    if (idx < 0 || idx >= this.inventory.length) return;
    const item = this.inventory[idx];

    if (item.type === 'POTION') {
      if (item.sub === 'HEAL') {
        const healAmt = 16;
        this.hp = Math.min(this.maxHp, this.hp + healAmt);
        this.poisonTurns = 0;
        this.addMsg("DRANK HEAL POTION! (+16 HP, CURED)");
        this.sfx('POWERUP');
      } else if (item.sub === 'STR') {
        this.strTurns = 30;
        this.addMsg("DRANK STRENGTH POTION! (+3 ATK)");
        this.sfx('POWERUP');
      } else if (item.sub === 'SPD') {
        this.spdTurns = 20;
        this.addMsg("DRANK SPEED POTION! (2X SPEED)");
        this.sfx('POWERUP');
      } else if (item.sub === 'POISON') {
        this.hp = Math.max(1, this.hp - 5);
        this.poisonTurns = 12;
        this.addMsg("VENOMOUS POTION! (-5 HP, POISONED)");
        this.sfx('HURT');
      }
      this.inventory.splice(idx, 1);
      this.closeInventory();
      this.processTurn();
    } else if (item.type === 'SCROLL') {
      if (item.sub === 'TELE') {
        const rm = this.rooms[Math.floor(Math.random() * this.rooms.length)];
        this.px = rm.cx;
        this.py = rm.cy;
        this.addMsg("READ TELEPORT SCROLL! WARPED!");
        this.sfx('POWERUP');
      } else if (item.sub === 'MISSILE') {
        let hits = 0;
        for (let m of this.monsters) {
          if (m.alive && (this.visible[m.y][m.x] || m.roomId === this.playerRoomId)) {
            m.hp -= 14;
            hits++;
            if (m.hp <= 0) {
              m.alive = false;
              this.gainExp(m.exp);
            }
          }
        }
        this.addMsg("MAGIC MISSILE STRIKES " + hits + " FOES (14 DMG)!");
        this.sfx('EXPLODE');
      } else if (item.sub === 'MAP') {
        for (let y = 0; y < this.MAP_H; y++) {
          for (let x = 0; x < this.MAP_W; x++) {
            this.explored[y][x] = true;
          }
        }
        this.addMsg("MAGIC MAP REVEALS ENTIRE FLOOR!");
        this.sfx('POWERUP');
      } else if (item.sub === 'ENCHANT') {
        if (this.equippedWeap) {
          this.equippedWeap.bonus += 2;
          this.equippedWeap.name += "+";
          this.addMsg("WEAPON ENCHANTED! (+2 ATK)");
          this.sfx('POWERUP');
        } else if (this.equippedArm) {
          this.equippedArm.def += 1;
          this.equippedArm.name += "+";
          this.addMsg("ARMOR ENCHANTED! (+1 DEF)");
          this.sfx('POWERUP');
        } else {
          this.addMsg("NO GEAR EQUIPPED TO ENCHANT!");
          this.sfx('ERROR');
          return;
        }
      }
      this.inventory.splice(idx, 1);
      this.closeInventory();
      this.processTurn();
    } else if (item.type === 'WEAPON') {
      const oldWeap = this.equippedWeap;
      this.equippedWeap = item;
      this.inventory.splice(idx, 1);
      if (oldWeap) this.inventory.push(oldWeap);
      this.addMsg("EQUIPPED " + item.name + " (+" + item.bonus + " ATK)!");
      this.sfx('CONFIRM');
      this.closeInventory();
    } else if (item.type === 'ARMOR') {
      const oldArm = this.equippedArm;
      this.equippedArm = item;
      this.inventory.splice(idx, 1);
      if (oldArm) this.inventory.push(oldArm);
      this.addMsg("EQUIPPED " + item.name + " (+" + item.def + " DEF)!");
      this.sfx('CONFIRM');
      this.closeInventory();
    } else if (item.type === 'FOOD') {
      this.food = Math.min(600, this.food + 350);
      this.addMsg("CRUNCH! SATISFYING FOOD (+350)!");
      this.sfx('CONFIRM');
      this.inventory.splice(idx, 1);
      this.closeInventory();
      this.processTurn();
    }
  },

  // --------------------------------------------------------------------------
  // MOVEMENT & COMBAT STEP
  // --------------------------------------------------------------------------
  stepPlayer(dx, dy) {
    const nx = this.px + dx;
    const ny = this.py + dy;

    // Bounds check
    if (nx < 0 || nx >= this.MAP_W || ny < 0 || ny >= this.MAP_H) {
      this.sfx('ERROR');
      return;
    }

    // Check if monster at target tile: ATTACK!
    const targetMonster = this.monsters.find(m => m.alive && m.x === nx && m.y === ny);
    if (targetMonster) {
      this.playerAttack(targetMonster);
      this.processTurn();
      return;
    }

    // Check tile passability
    const tile = this.map[ny][nx];
    if (tile === '-' || tile === '|' || tile === ' ') {
      this.addMsg("A SOLID WALL BLOCKS YOUR WAY.");
      this.sfx('ERROR');
      return;
    }

    // Step into tile
    this.px = nx;
    this.py = ny;
    this.sfx('TICK');

    // Pick up items at new tile
    this.checkItemPickup();

    // Recompute Field of View
    this.updateFOV();

    // Turn resolution (speed buff grants 2 actions per monster turn)
    if (this.spdTurns > 0 && (this.turns % 2 === 1)) {
      // Free action without monsters moving!
    } else {
      this.processTurn();
    }
  },

  // --------------------------------------------------------------------------
  // TACTICAL COMBAT SYSTEM
  // --------------------------------------------------------------------------
  playerAttack(monster) {
    let atk = this.baseAtk;
    if (this.equippedWeap) atk += this.equippedWeap.bonus;
    if (this.strTurns > 0) atk += 3;

    // Weapon roll
    let roll = atk + Math.floor(Math.random() * 4) - 1;
    let dmg = Math.max(1, roll - monster.def);

    // Critical hit chance (10%)
    const isCrit = Math.random() < 0.10;
    if (isCrit) dmg = Math.floor(dmg * 1.5) + 1;

    monster.hp -= dmg;
    this.shake = 3;
    this.sfx('HIT');

    if (isCrit) {
      this.addMsg("CRITICAL HIT! SLICED " + monster.name + " (" + dmg + " DMG)!");
    } else {
      this.addMsg("YOU HIT " + monster.name + " (" + dmg + " DMG)!");
    }

    // Check monster death
    if (monster.hp <= 0) {
      monster.alive = false;
      this.addMsg(monster.name + " DEFEATED! (+" + monster.exp + " EXP)");
      this.sfx('EXPLODE');
      this.gainExp(monster.exp);
    }
  },

  gainExp(amount) {
    this.exp += amount;
    while (this.exp >= this.expNext) {
      this.exp -= this.expNext;
      this.lvl++;
      this.expNext = Math.floor(this.expNext * 2.2);
      this.maxHp += 6;
      this.hp = this.maxHp;
      this.baseAtk += 1;
      this.addMsg("*** LEVEL UP! YOU ARE LEVEL " + this.lvl + "! ***");
      this.sfx('LEVELUP');
      SAVE.setScore(this.id, this.calcScore());
    }
  },

  // --------------------------------------------------------------------------
  // ITEM PICKUP
  // --------------------------------------------------------------------------
  checkItemPickup() {
    const itemIdx = this.items.findIndex(it => it.x === this.px && it.y === this.py);
    if (itemIdx === -1) return;

    const item = this.items[itemIdx];

    if (item.type === 'GOLD') {
      this.gold += item.amount;
      this.addMsg("YOU FIND " + item.amount + " GOLD PIECES!");
      this.sfx('COIN');
      this.items.splice(itemIdx, 1);
      SAVE.setScore(this.id, this.calcScore());
    } else if (item.type === 'AMULET') {
      this.hasAmulet = true;
      this.items.splice(itemIdx, 1);
      this.addMsg("*** AMULET OF YENDOR OBTAINED! ***");
      this.addMsg("HEAD TO THE EXIT PORTAL (>) TO WIN!");
      this.sfx('POWERUP');
      SAVE.setScore(this.id, this.calcScore());
    } else {
      // Pack inventory item
      if (this.inventory.length < 8) {
        this.inventory.push(item);
        this.items.splice(itemIdx, 1);
        this.addMsg("PICKED UP: " + item.name + " (" + item.glyph + ")");
        this.sfx('CONFIRM');
      } else {
        this.addMsg("PACK IS FULL! CANNOT CARRY " + item.name);
      }
    }
  },

  // --------------------------------------------------------------------------
  // REST / WAIT TURN ACTION
  // --------------------------------------------------------------------------
  waitTurn() {
    this.restCounter++;

    // Recover HP if not starving
    if (this.food > 0) {
      if (this.restCounter % 3 === 0 && this.hp < this.maxHp) {
        this.hp++;
        this.addMsg("YOU REST AND RECOVER (+1 HP).");
      } else {
        this.addMsg("YOU WAIT A TURN...");
      }
    } else {
      this.addMsg("YOU WAIT ANXIOUSLY IN THE DARK...");
    }

    this.sfx('TICK');
    this.processTurn();
  },

  // --------------------------------------------------------------------------
  // STAIRS DOWN / ESCAPE PORTAL
  // --------------------------------------------------------------------------
  descendStairs() {
    if (this.px !== this.stairsX || this.py !== this.stairsY) {
      this.addMsg("NO STAIRS HERE TO DESCEND.");
      this.sfx('ERROR');
      return;
    }

    if (this.floor === this.maxFloors) {
      // Final floor exit portal
      if (this.hasAmulet) {
        this.state = 'VICTORY';
        this.addMsg("*** YOU ESCAPED WITH THE AMULET OF YENDOR! ***");
        this.sfx('FANFARE');
        SAVE.setScore(this.id, this.calcScore());
      } else {
        this.addMsg("THE PORTAL IS SEALED! RETRIEVE THE AMULET!");
        this.sfx('ERROR');
      }
      return;
    }

    // Descend to next depth
    this.floor++;
    this.addMsg("YOU DESCEND TO DUNGEON FLOOR " + this.floor + "...");
    this.sfx('LEVELUP');
    this.generateFloor();
    SAVE.setScore(this.id, this.calcScore());
  },

  // --------------------------------------------------------------------------
  // ENVIRONMENT & MONSTER TURN CYCLE
  // --------------------------------------------------------------------------
  processTurn() {
    this.turns++;

    // 1. Hunger & Food
    const drain = (this.difficulty === 0) ? 0.75 : (this.difficulty === 2) ? 1.25 : 1.0;
    this.food = Math.max(0, this.food - drain);

    if (Math.floor(this.food) === 150) {
      this.addMsg("YOU ARE FEELING HUNGRY!");
    } else if (Math.floor(this.food) === 50) {
      this.addMsg("YOU ARE FAINT FROM HUNGER!");
    } else if (this.food <= 0) {
      this.starveCounter++;
      if (this.starveCounter >= 2) {
        this.starveCounter = 0;
        this.hp -= 1;
        this.shake = 3;
        this.addMsg("STARVING! YOU LOSE 1 HP.");
        this.sfx('HURT');
        if (this.hp <= 0) {
          this.die("STARVATION");
          return;
        }
      }
    }

    // 2. Poison debuff
    if (this.poisonTurns > 0) {
      this.poisonTurns--;
      if (this.turns % 3 === 0) {
        this.hp -= 1;
        this.shake = 2;
        this.addMsg("POISON BURNS IN YOUR VEINS (-1 HP)!");
        this.sfx('HURT');
        if (this.hp <= 0) {
          this.die("LETHAL POISON");
          return;
        }
      }
    }

    // 3. Buff durations
    if (this.strTurns > 0) {
      this.strTurns--;
      if (this.strTurns === 0) this.addMsg("STRENGTH BUFF WORE OFF.");
    }
    if (this.spdTurns > 0) {
      this.spdTurns--;
      if (this.spdTurns === 0) this.addMsg("SPEED BUFF WORE OFF.");
    }

    // 4. Monster Turns: Chase & Attack
    for (let m of this.monsters) {
      if (!m.alive) continue;
      this.monsterStep(m);
      if (this.state === 'GAMEOVER') return;
    }

    // Recompute FOV
    this.updateFOV();
  },

  monsterStep(m) {
    // Troll Regeneration
    if (m.type === 'T' && m.hp < m.maxHp) {
      m.hp++;
    }

    const dist = Math.abs(this.px - m.x) + Math.abs(this.py - m.y);
    const inSameRoom = (m.roomId !== null && m.roomId === this.playerRoomId);

    if (inSameRoom || dist <= 6 || m.alert > 0) {
      m.alert = 8;
    }

    if (!m.alert) return;
    m.alert--;

    // Dragon Firebreath Attack (range <= 4, line of sight)
    if (m.type === 'D' && dist > 1 && dist <= 4 && Math.random() < 0.28) {
      const armDef = this.equippedArm ? this.equippedArm.def : 0;
      const dmg = Math.max(3, Math.floor(10 + Math.random() * 6) - Math.floor(armDef / 2));
      this.hp -= dmg;
      this.shake = 6;
      this.sfx('EXPLODE');
      this.addMsg("DRAGON BREATHES FIRE! (-" + dmg + " HP)!");
      if (this.hp <= 0) {
        this.die("DRAGON FIREBREATH");
        return;
      }
      return;
    }

    // Bat Erratic Movement (moves 2 steps per turn, 50% random flutter)
    const steps = (m.type === 'B') ? 2 : 1;

    for (let s = 0; s < steps; s++) {
      const curDist = Math.abs(this.px - m.x) + Math.abs(this.py - m.y);

      // Melee attack if adjacent to hero
      if (curDist === 1) {
        let dmg = m.atk + Math.floor(Math.random() * 3) - 1;
        // Orc 15% critical strike
        if (m.type === 'O' && Math.random() < 0.15) {
          dmg = Math.floor(dmg * 1.5) + 1;
          this.addMsg(m.name + " DELIVERS CRUSHING CRIT!");
        }
        const armDef = this.equippedArm ? this.equippedArm.def : 0;
        dmg = Math.max(1, dmg - armDef);

        this.hp -= dmg;
        this.shake = 4;
        this.sfx('HURT');
        this.addMsg(m.name + " STRIKES YOU (-" + dmg + " HP)!");

        if (this.hp <= 0) {
          this.die(m.name);
          return;
        }
        break;
      }

      // Step towards player
      let bestX = m.x, bestY = m.y;
      let minD = curDist;

      const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      // Bat erratic jitter
      if (m.type === 'B' && Math.random() < 0.5) {
        dirs.sort(() => Math.random() - 0.5);
      }

      for (let [dx, dy] of dirs) {
        const nx = m.x + dx;
        const ny = m.y + dy;
        if (nx < 1 || nx >= this.MAP_W - 1 || ny < 1 || ny >= this.MAP_H - 1) continue;

        const tile = this.map[ny][nx];
        if (tile !== '.' && tile !== '#' && tile !== '+' && tile !== '>') continue;
        if (nx === this.px && ny === this.py) continue; // attacking handled above
        if (this.monsters.some(other => other.alive && other !== m && other.x === nx && other.y === ny)) continue;

        const d = Math.abs(this.px - nx) + Math.abs(this.py - ny);
        if (d < minD || (m.type === 'B' && Math.random() < 0.3)) {
          minD = d;
          bestX = nx;
          bestY = ny;
        }
      }

      m.x = bestX;
      m.y = bestY;
    }
  },

  // --------------------------------------------------------------------------
  // DEATH & GAME OVER
  // --------------------------------------------------------------------------
  die(cause) {
    this.state = 'GAMEOVER';
    this.killer = cause;
    const finalScore = this.calcScore();
    SAVE.setScore(this.id, finalScore);
    this.addMsg("*** SLAIN BY " + cause + " ON FLOOR " + this.floor + " ***");
    this.sfx('EXPLODE');
  },

  // --------------------------------------------------------------------------
  // RENDER GRAPHICS (256x240 CRT)
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    const shakeX = (this.shake > 0) ? (Math.random() * 4 - 2) | 0 : 0;
    const shakeY = (this.shake > 0) ? (Math.random() * 4 - 2) | 0 : 0;

    // ------------------------------------------------------------------------
    // 1. TOP STATUS BAR (HUD)
    // ------------------------------------------------------------------------
    // Row 1: Title, Floor, Level, EXP, Gold
    g.text("ROGUE 1980", 6, 2, 3);
    g.text("FL:" + this.floor + "/" + this.maxFloors, 72, 2, 2);
    g.text("LV:" + this.lvl, 116, 2, 2);
    g.text("XP:" + this.exp + "/" + this.expNext, 148, 2, 2);
    g.textR("$:" + this.gold, 250, 2, 3);

    // Row 2: HP Bar, ATK, DEF, Food Status
    g.text("HP:", 6, 10, 2);
    g.rect(24, 10, 48, 6, 1);
    g.box(24, 10, 48, 6, 2);
    const hpPct = Math.max(0, Math.min(1, this.hp / this.maxHp));
    const barW = Math.floor(46 * hpPct);
    if (barW > 0) g.rect(25, 11, barW, 4, hpPct < 0.25 ? 2 : 3);
    g.text(this.hp + "/" + this.maxHp, 76, 10, 3);

    const curAtk = this.baseAtk + (this.equippedWeap ? this.equippedWeap.bonus : 0) + (this.strTurns > 0 ? 3 : 0);
    const curDef = this.equippedArm ? this.equippedArm.def : 0;
    g.text("ATK:" + curAtk, 116, 10, 2);
    g.text("DEF:" + curDef, 156, 10, 2);

    let foodStr = "OK", foodCol = 2;
    if (this.food <= 0) {
      foodStr = "STARVE";
      foodCol = (Math.floor(Date.now() / 250) % 2 === 0) ? 3 : 1;
    } else if (this.food <= 80) {
      foodStr = "WEAK";
      foodCol = 3;
    } else if (this.food <= 250) {
      foodStr = "HUNGRY";
      foodCol = 2;
    }
    g.textR(foodStr, 250, 10, foodCol);

    g.line(0, 18, 255, 18, 2);

    // ------------------------------------------------------------------------
    // 2. PLAYFIELD DUNGEON MAP (30x21 Grid @ 8x8)
    // ------------------------------------------------------------------------
    const ox = this.OX + shakeX;
    const oy = this.OY + shakeY;
    const sz = this.TILE_SZ;

    for (let y = 0; y < this.MAP_H; y++) {
      for (let x = 0; x < this.MAP_W; x++) {
        const isExp = this.explored[y][x];
        if (!isExp) continue; // Fog of War: Pitch black (shade 0)

        const isVis = this.visible[y][x];
        const tile = this.map[y][x];
        const rx = ox + x * sz;
        const ry = oy + y * sz;

        // Render terrain
        const col = isVis ? 2 : 1; // Lit = shade 2, Memory = shade 1

        if (tile === '.') {
          g.px(rx + 3, ry + 3, col);
        } else if (tile === '#') {
          g.text("#", rx + 2, ry + 1, col);
        } else if (tile === '-' || tile === '|') {
          if (tile === '-') g.line(rx, ry + 3, rx + 7, ry + 3, col);
          else g.line(rx + 3, ry, rx + 3, ry + 7, col);
        } else if (tile === '+') {
          g.text("+", rx + 2, ry + 1, isVis ? 3 : 1);
        } else if (tile === '>') {
          const stairCol = (isVis && Math.floor(Date.now() / 300) % 2 === 0) ? 3 : 2;
          g.text(">", rx + 2, ry + 1, stairCol);
        }
      }
    }

    // Render Items in visible tiles
    for (let it of this.items) {
      if (!this.visible[it.y][it.x]) continue;
      const rx = ox + it.x * sz;
      const ry = oy + it.y * sz;
      g.text(it.glyph, rx + 2, ry + 1, 3);
    }

    // Render Monsters in visible tiles
    for (let m of this.monsters) {
      if (!m.alive || !this.visible[m.y][m.x]) continue;
      const rx = ox + m.x * sz;
      const ry = oy + m.y * sz;
      // Monster glyph in bright shade 3 with subtle tint
      g.text(m.type, rx + 2, ry + 1, 3);
    }

    // Render Hero '@'
    const pxPos = ox + this.px * sz;
    const pyPos = oy + this.py * sz;
    g.rect(pxPos, pyPos, sz, sz, 1);
    g.text("@", pxPos + 2, pyPos + 1, 3);

    // ------------------------------------------------------------------------
    // 3. BOTTOM AREA: COMBAT TICKER, GEAR & QUICK CONTROLS
    // ------------------------------------------------------------------------
    g.line(0, 190, 255, 190, 2);

    // Message Log Lines
    g.text(this.msgLog[0] || "", 8, 193, 3);
    g.text(this.msgLog[1] || "", 8, 202, 1);

    // Equipment Summary
    const wName = this.equippedWeap ? this.equippedWeap.name + " (+" + this.equippedWeap.bonus + ")" : "BARE HANDS";
    const aName = this.equippedArm ? this.equippedArm.name + " (+" + this.equippedArm.def + ")" : "UNARMORED";
    g.text("EQ: " + wName + " | " + aName, 8, 212, 2);

    // Action Buttons & Virtual Touch Toolbar
    // [WAIT]
    g.rect(8, 222, 42, 15, 1);
    g.box(8, 222, 42, 15, 2);
    g.text("WAIT", 17, 226, 3);

    // [INV]
    g.rect(54, 222, 42, 15, 1);
    g.box(54, 222, 42, 15, 2);
    g.text("INV", 66, 226, 3);

    // [STAIR]
    const onStair = (this.px === this.stairsX && this.py === this.stairsY);
    g.rect(100, 222, 46, 15, onStair ? 2 : 1);
    g.box(100, 222, 46, 15, onStair ? 3 : 2);
    g.text("STAIR", 107, 226, onStair ? 3 : 2);

    // Touch D-Pad Arrows
    // [◀]
    g.rect(154, 222, 19, 15, 1);
    g.box(154, 222, 19, 15, 2);
    g.text("◀", 160, 226, 3);

    // [▲]
    g.rect(176, 221, 18, 7, 1);
    g.box(176, 221, 18, 7, 2);
    g.text("▲", 181, 222, 3);

    // [▼]
    g.rect(176, 230, 18, 7, 1);
    g.box(176, 230, 18, 7, 2);
    g.text("▼", 181, 231, 3);

    // [▶]
    g.rect(197, 222, 19, 15, 1);
    g.box(197, 222, 19, 15, 2);
    g.text("▶", 203, 226, 3);

    // Helper text
    g.text("[B] PACK", 220, 226, 2);

    // ------------------------------------------------------------------------
    // 4. INVENTORY MODAL OVERLAY
    // ------------------------------------------------------------------------
    if (this.invOpen) {
      this.renderInventoryModal(g);
    }

    // ------------------------------------------------------------------------
    // 5. GAME OVER DIALOG
    // ------------------------------------------------------------------------
    if (this.state === 'GAMEOVER') {
      this.renderGameOverDialog(g);
    }

    // ------------------------------------------------------------------------
    // 6. VICTORY DIALOG
    // ------------------------------------------------------------------------
    if (this.state === 'VICTORY') {
      this.renderVictoryDialog(g);
    }
  },

  renderInventoryModal(g) {
    g.rect(20, 24, 216, 172, 0);
    g.box(20, 24, 216, 172, 3);
    g.box(22, 26, 212, 168, 1);

    g.textC("=== INVENTORY & PACK ===", 30, 3);
    g.line(24, 38, 232, 38, 2);
    g.text("[UP/DN] SELECT   [A] USE/EQUIP   [B] CLOSE", 26, 42, 2);
    g.line(24, 50, 232, 50, 1);

    const startY = 54;
    const rowH = 12;

    // Option 0: REST TURN
    const isSel0 = (this.invCursor === 0);
    if (isSel0) g.rect(26, startY - 1, 204, 11, 1);
    g.text((isSel0 ? "▶ " : "  ") + "[REST / WAIT 1 TURN] (+HP)", 28, startY + 1, isSel0 ? 3 : 2);

    // Options 1..N: Inventory Items
    for (let i = 0; i < this.inventory.length; i++) {
      const it = this.inventory[i];
      const curIdx = i + 1;
      const isSel = (this.invCursor === curIdx);
      const iy = startY + curIdx * rowH;

      if (isSel) g.rect(26, iy - 1, 204, 11, 1);

      let lineStr = (isSel ? "▶ " : "  ") + curIdx + ". (" + it.glyph + ") " + it.name;
      if (it.bonus) lineStr += " (+" + it.bonus + " ATK)";
      if (it.def) lineStr += " (+" + it.def + " DEF)";

      g.text(lineStr, 28, iy + 1, isSel ? 3 : 2);
    }

    if (this.inventory.length === 0) {
      g.textC("(PACK IS EMPTY - ONLY REST AVAILABLE)", 100, 2);
    }

    g.textC("TAP ITEM TO USE · TAP OUTSIDE TO CLOSE", 184, 1);
  },

  renderGameOverDialog(g) {
    g.rect(28, 40, 200, 155, 0);
    g.box(28, 40, 200, 155, 3);
    g.box(30, 42, 196, 151, 1);

    g.textC("REST IN PEACE", 52, 3, 2);
    g.textC("HERO '@' DIED IN THE CRYPT", 72, 2);
    g.textC("SLAIN BY: " + this.killer, 86, 3);
    g.textC("DUNGEON DEPTH: FLOOR " + this.floor, 98, 2);
    g.textC("GOLD: " + this.gold + "  LEVEL: " + this.lvl, 110, 2);

    const finalScore = this.calcScore();
    g.textC("FINAL SCORE: " + finalScore, 126, 3);
    g.textC("BEST RECORD: " + SAVE.getScore(this.id), 140, 2);

    g.textC("[PRESS A / START TO PLAY AGAIN]", 174, 3);
  },

  renderVictoryDialog(g) {
    g.rect(22, 32, 212, 172, 0);
    g.box(22, 32, 212, 172, 3);
    g.box(24, 34, 208, 168, 2);

    g.textC("VICTORY!", 44, 3, 2);
    g.textC("AMULET OF YENDOR RETRIEVED!", 64, 3);
    g.textC("YOU CONQUERED ALL 8 FLOORS OF DOOM!", 78, 2);
    g.textC("AND ESCAPED SAFELY TO THE SURFACE!", 90, 2);

    g.textC("GOLD FOUND: " + this.gold, 108, 2);
    g.textC("HERO LEVEL BONUS: " + (this.lvl * 100), 120, 2);
    g.textC("AMULET BONUS: 2000 PTS", 132, 3);

    const finalScore = this.calcScore();
    g.textC("TOTAL SCORE: " + finalScore, 150, 3);

    g.textC("[PRESS A / START TO EMBARK AGAIN]", 184, 3);
  }
};
