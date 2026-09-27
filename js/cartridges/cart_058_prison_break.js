// js/cartridges/cart_058_prison_break.js
// ============================================================================
// Cartridge #058: PRISON BREAK
// Genre: STEALTH (7) | Complete Prison Routine & Life Simulator
// ============================================================================
// Complete overhaul:
// 1. Full 24-Hour Routine Cycle (Roll Call, Canteen, Work, Yard, Bed Check, Night Dig).
// 2. Contraband Crafting: Sturdy Shovel, Bed Dummy, Wall Poster, Wire Cutters.
// 3. Digging & Dirt Management: Dig under bunk, manage dirt bags, flush or scatter.
// 4. Guard AI & Patrols: Sight cones, night flashlights, shakedowns, 0-100% heat & lockdown sirens.
// 5. 4-Phase Underground Tunnel: Cell Wall -> Utility Corridor -> Sewer -> Perimeter Fence.
// 6. Rainy Night Escape Climax: Sneak past watchtower searchlights, snip fence to freedom!
// 7. Dynamic 240x240 CRT visuals, animated sprites, touch & D-pad ergonomics, persistent score.
// 8. 32x32 retro phosphor icon: cell window bars with moonlight beam and bent iron escape bar.
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

(function() {
  'use strict';

  // --------------------------------------------------------------------------
  // AUDIO HELPER (Safe fallback mapping to APU sound effects)
  // --------------------------------------------------------------------------
  function playSfx(name) {
    if (typeof APU === 'undefined' || !APU || !APU.sfx) return;
    const map = {
      'SELECT': 'UI_MOVE',
      'CONFIRM': 'UI_OK',
      'CANCEL': 'UI_BACK',
      'ERROR': 'DENY',
      'EXPLODE': 'BOOM',
      'FANFARE': 'LEVELUP',
      'POWERUP': 'POWER',
      'COIN': 'COIN',
      'HIT': 'HIT',
      'TICK': 'TICK',
      'ALARM': 'ALARM',
      'SPLASH': 'SPLASH',
      'SWISH': 'SWISH',
      'HURT': 'HURT'
    };
    try {
      const target = map[name] || name;
      APU.sfx(target);
    } catch (_) {}
  }

  // --------------------------------------------------------------------------
  // ITEMS & CONTRABAND REGISTRY
  // --------------------------------------------------------------------------
  const ITEMS = {
    spoon: {
      id: 'spoon', name: 'SPOON', desc: 'FLIMSY CANTEEN UTENSIL. DIGS SLOWLY.',
      contra: true, power: 1.2, cost: 3
    },
    tape: {
      id: 'tape', name: 'DUCT TAPE', desc: 'STRONG INDUSTRIAL ADHESIVE.',
      contra: true, power: 0, cost: 8
    },
    shovel: {
      id: 'shovel', name: 'STURDY SHOVEL', desc: 'REINFORCED SHOVEL. DIGS RAPIDLY.',
      contra: true, power: 3.6, cost: 20
    },
    pillow: {
      id: 'pillow', name: 'PILLOW', desc: 'STANDARD ISSUE CELL PILLOW.',
      contra: false, power: 0, cost: 4
    },
    sheet: {
      id: 'sheet', name: 'BED SHEET', desc: 'COTTON LAUNDRY BED SHEET.',
      contra: false, power: 0, cost: 5
    },
    dummy: {
      id: 'dummy', name: 'BED DUMMY', desc: 'FOOLS GUARDS DURING BED CHECK.',
      contra: true, power: 0, cost: 15
    },
    mag: {
      id: 'mag', name: 'MAGAZINE', desc: 'SMUGGLED ISSUE #42 WITH PINUPS.',
      contra: false, power: 0, cost: 6
    },
    poster: {
      id: 'poster', name: 'WALL POSTER', desc: 'CONCEALS TUNNEL HOLE IN CELL.',
      contra: true, power: 0, cost: 14
    },
    file: {
      id: 'file', name: 'METAL FILE', desc: 'STEEL FILE FROM WORKSHOP.',
      contra: true, power: 0, cost: 10
    },
    pliers: {
      id: 'pliers', name: 'PLIERS', desc: 'HEAVY GRIPPING PLIERS.',
      contra: true, power: 0, cost: 10
    },
    cutters: {
      id: 'cutters', name: 'WIRE CUTTERS', desc: 'SNIPS PERIMETER RAZOR WIRE.',
      contra: true, power: 0, cost: 25
    },
    dirt: {
      id: 'dirt', name: 'DIRT BAG', desc: 'BAG OF EXCAVATED TUNNEL DIRT.',
      contra: true, power: 0, cost: 0
    },
    snack: {
      id: 'snack', name: 'ENERGY BAR', desc: 'SWEET CANDY. RESTORES +35 STAMINA.',
      contra: false, power: 0, cost: 5
    }
  };

  // Crafting Recipes
  const RECIPES = [
    { a: 'spoon', b: 'tape', res: 'shovel', name: 'STURDY SHOVEL' },
    { a: 'pillow', b: 'sheet', res: 'dummy', name: 'BED DUMMY' },
    { a: 'mag', b: 'tape', res: 'poster', name: 'WALL POSTER' },
    { a: 'file', b: 'pliers', res: 'cutters', name: 'WIRE CUTTERS' }
  ];

  // --------------------------------------------------------------------------
  // 24-HOUR ROUTINE TIMETABLE
  // --------------------------------------------------------------------------
  const ROUTINE_DEFS = [
    { start: 7.0,  end: 9.0,  id: 'ROLL_MORN', name: 'MORNING ROLL CALL', zone: 'YARD', desc: 'REPORT TO YARD BOX' },
    { start: 9.0,  end: 12.0, id: 'CANTEEN',   name: 'BREAKFAST / MESS',  zone: 'MESS', desc: 'EAT TRAY & TRADE' },
    { start: 12.0, end: 16.0, id: 'WORK',      name: 'PRISON WORK',       zone: 'WORK', desc: 'LATHE OR LAUNDRY' },
    { start: 16.0, end: 19.0, id: 'EXERCISE',  name: 'YARD EXERCISE',     zone: 'YARD', desc: 'TRAIN & SCATTER DIRT' },
    { start: 19.0, end: 21.0, id: 'ROLL_EVE',  name: 'EVENING ROLL CALL', zone: 'YARD', desc: 'REPORT TO YARD BOX' },
    { start: 21.0, end: 22.0, id: 'FREETIME',  name: 'FREE TIME / RETURN',zone: 'CELL', desc: 'RETURN TO CELL' },
    { start: 22.0, end: 22.5, id: 'BEDCHECK',  name: 'BED CHECK (CURFEW)',zone: 'CELL', desc: 'IN BED OR USE DUMMY!' },
    { start: 22.5, end: 31.0, id: 'NIGHTDIG',  name: 'NIGHT DIG WINDOW',  zone: 'CELL', desc: 'DIG TUNNEL / ESCAPE!' }
  ];

  // --------------------------------------------------------------------------
  // PRISON FACILITY TILE MAP (44 wide x 30 high)
  // --------------------------------------------------------------------------
  // Map characters:
  // '#' = Solid Wall, '.' = Cell corridor, '|' = Cell bars (open by day, locked by night)
  // 'B' = Bunk, 'T' = Toilet, 'D' = Desk
  // 'C' = Canteen floor, 'S' = Serving Counter, 't' = Dining Table
  // 'W' = Metal Lathe, 'L' = Laundry Press, 'w' = Workshop floor
  // ',' = Yard grass/dirt, 'R' = Roll Call muster square, 'X' = Workout bench, 'P' = Dirt disposal
  // 'F' = Chain-link perimeter fence, 'O' = Watchtower base
  const MAP_ROWS = [
    "############################################",
    "#BT..##BT..#C..........C,FFFFFFFFFFFFFFFFFF#",
    "#B...##B...#C..........C,F...............OF#",
    "#....##....#CSSSSSSSSSS,,F...............OF#",
    "#D...##D...#C..........,,F...............OF#",
    "###|####|###C..........,,F...RRRRRRR......F#",
    "#..........#C.tt....tt.,,F...RRRRRRR......F#",
    "#..........#C.tt....tt.,,F...RRRRRRR......F#",
    "#..........#C.tt....tt.,,F...RRRRRRR......F#",
    "#..........#C.tt....tt.,,F...RRRRRRR......F#",
    "#..........#C..........,,F...RRRRRRR......F#",
    "###|####|###C..........,,F...RRRRRRR......F#",
    "#BT..##BT..#C..........,,F................F#",
    "#B...##B...#............,F................F#",
    "#....##....#............,.................F#",
    "#D...##D...#............,.................F#",
    "###|####|###wwwwwwwwwwww,.................F#",
    "#..........#wwwwwwwwwwww,.................F#",
    "#..........#wWW..wLL..ww,....XXXXX........F#",
    "#..........#wWW..wLL..ww,....XXXXX........F#",
    "#..........#wWW..wLL..ww,....XXXXX........F#",
    "#..........#wwwwwwwwwwww,.................F#",
    "###|####|###wwwwwwwwwwww,.........PPP.....F#",
    "#....##....#wwwwwwwwwwww,.........PPP.....F#",
    "#....##....#wwwwwwwwwwww,.........PPP.....F#",
    "#....##....#wwwwwwwwwwww,.................F#",
    "############wwwwwwwwwwww,FFFFFFFFFFFFFFFFFF#",
    "############################################",
    "############################################",
    "############################################"
  ];

  const MAP_W = 44;
  const MAP_H = 30;
  const TILE_SZ = 8;

  // --------------------------------------------------------------------------
  // CARTRIDGE DEFINITION
  // --------------------------------------------------------------------------
  CARTS[58] = {
    id: 58,
    name: "PRISON BREAK",
    genre: 7, // STEALTH
    scoreLabel: "ESCAPE PTS",
    desc: "COMPLY BY DAY, CRAFT CONTRABAND & DIG BY NIGHT. ESCAPE UNDER RAIN & SEARCHLIGHTS!",

    // ------------------------------------------------------------------------
    // 1. 32x32 RETRO PHOSPHOR CONSOLE ICON
    // Prison cell window bars with moonlight beam and bent iron escape bar
    // ------------------------------------------------------------------------
    icon(g, x, y) {
      g.rect(x, y, 32, 32, 0);
      g.box(x, y, 32, 32, 1);
      g.rect(x + 2, y + 2, 28, 28, 0);
      g.box(x + 2, y + 2, 28, 28, 2);

      // Night sky window opening
      g.rect(x + 4, y + 4, 24, 24, 0);

      // Distant full moon in top-right
      g.disc(x + 23, y + 8, 3, 3);
      g.disc(x + 22, y + 7, 2, 3);

      // Diagonal moonlight beam cutting across bars
      for (let i = 0; i < 22; i += 2) {
        g.line(x + 14 + i, y + 4, x + 4, y + 14 + i, 1);
      }

      // Stone window sill at bottom
      g.rect(x + 3, y + 25, 26, 4, 2);
      g.line(x + 3, y + 25, x + 28, y + 25, 3);

      // Horizontal iron crossbars
      g.line(x + 4, y + 10, x + 27, y + 10, 2);
      g.line(x + 4, y + 20, x + 27, y + 20, 2);

      // Vertical iron bars:
      // Bar 1 (straight)
      g.rect(x + 8, y + 4, 2, 21, 3);
      // Bar 2 (straight)
      g.rect(x + 13, y + 4, 2, 21, 3);

      // Bar 3: BENT IRON BAR! Bent outward to create an escape breach
      g.rect(x + 18, y + 4, 2, 5, 3);
      g.line(x + 18, y + 9, x + 22, y + 13, 3);
      g.line(x + 19, y + 9, x + 23, y + 13, 3);
      g.line(x + 22, y + 13, x + 18, y + 17, 3);
      g.line(x + 23, y + 13, x + 19, y + 17, 3);
      g.rect(x + 18, y + 17, 2, 8, 3);

      // Bar 4 (straight)
      g.rect(x + 24, y + 4, 2, 21, 2);

      // Glints on the bent bar breach
      g.px(x + 23, y + 13, 3);
      g.px(x + 24, y + 13, 3);
      g.px(x + 13, y + 10, 3);
    },

    // ------------------------------------------------------------------------
    // 2. INITIALIZATION
    // ------------------------------------------------------------------------
    init() {
      // Difficulty: 0=EASY (0.8x clock, lenient guards), 1=NORMAL, 2=HARD (1.3x clock, strict guards)
      this.diff = 1;

      // Mode: 'TITLE', 'GAME', 'TUNNEL', 'BAG', 'ESCAPE', 'SOLITARY', 'VICTORY', 'GAMEOVER'
      this.mode = 'TITLE';
      this.subMode = 'NONE';

      // Game Clock: Day 1, 06:45 AM (15 minutes before Morning Roll Call)
      this.day = 1;
      this.hour = 6;
      this.minute = 45;
      this.timeSec = 0;
      this.rollAttended = false;
      this.curRoutine = this.getRoutineAt(this.hour + this.minute / 60);

      // Player Stats
      // Player starts inside Cell #4 (tx: 10, ty: 4)
      this.px = 10 * TILE_SZ + 4;
      this.py = 4 * TILE_SZ + 4;
      this.pdir = 2; // 0=up, 1=right, 2=down, 3=left
      this.walkTimer = 0;
      this.energy = 100;
      this.maxEnergy = 100;
      this.coins = 12;

      // Heat / Suspicion (0 to 100%)
      this.heat = 0;
      this.maxHeatRecorded = 0;
      this.lockdown = false;
      this.lockdownTimer = 0;
      this.solitaryCount = 0;

      // Inventory & Concealment
      // Pockets (max 6 items)
      this.pockets = ['pillow', 'sheet'];
      // Cell Desk Stash (max 6 items)
      this.deskStash = [];

      // Cell Concealment Flags
      this.dummyOnBed = false;
      this.posterOnHole = false;
      this.holeExposed = true; // initially uncovered if dug
      this.toiletClogged = 0;  // flushes today (max 2)

      // Escape Tunnel System
      this.tunnel = 0; // 0.0 to 100.0%
      this.tunnelPhase = 0; // 0: Cell Wall, 1: Utility, 2: Sewers, 3: Fence
      this.toolDurability = 100;
      this.equippedTool = null;
      this.digNoise = 0;
      this.dirtWaiting = 0;

      // Guards (3 Officers)
      this.guards = [
        {
          id: 0, name: 'OFFICER DAVIS',
          x: 10 * TILE_SZ + 4, y: 8 * TILE_SZ + 4,
          dir: 1, speed: 28,
          waypoints: [
            { x: 3 * TILE_SZ, y: 8 * TILE_SZ },
            { x: 12 * TILE_SZ, y: 8 * TILE_SZ },
            { x: 12 * TILE_SZ, y: 15 * TILE_SZ },
            { x: 3 * TILE_SZ, y: 15 * TILE_SZ }
          ],
          wpIdx: 0, state: 'PATROL', timer: 0
        },
        {
          id: 1, name: 'OFFICER MILLER',
          x: 20 * TILE_SZ + 4, y: 10 * TILE_SZ + 4,
          dir: 2, speed: 28,
          waypoints: [
            { x: 18 * TILE_SZ, y: 6 * TILE_SZ },
            { x: 26 * TILE_SZ, y: 6 * TILE_SZ },
            { x: 26 * TILE_SZ, y: 22 * TILE_SZ },
            { x: 18 * TILE_SZ, y: 22 * TILE_SZ }
          ],
          wpIdx: 0, state: 'PATROL', timer: 0
        },
        {
          id: 2, name: 'OFFICER STONE',
          x: 35 * TILE_SZ + 4, y: 14 * TILE_SZ + 4,
          dir: 0, speed: 28,
          waypoints: [
            { x: 32 * TILE_SZ, y: 8 * TILE_SZ },
            { x: 40 * TILE_SZ, y: 8 * TILE_SZ },
            { x: 40 * TILE_SZ, y: 24 * TILE_SZ },
            { x: 32 * TILE_SZ, y: 24 * TILE_SZ }
          ],
          wpIdx: 0, state: 'PATROL', timer: 0
        }
      ];

      // Inmate NPCs
      this.inmates = [
        { id: 'red', name: 'RED', x: 4 * TILE_SZ, y: 4 * TILE_SZ, cellX: 4, cellY: 4, tip: 'TAPE + SPOON MAKES A SHOVEL!' },
        { id: 'slim', name: 'SLIM', x: 20 * TILE_SZ, y: 8 * TILE_SZ, cellX: 4, cellY: 14, tip: 'FLUSH DIRT DOWN THE TOILET OR SCATTER IN YARD.' },
        { id: 'rock', name: 'ROCK', x: 37 * TILE_SZ, y: 19 * TILE_SZ, cellX: 10, cellY: 14, tip: 'BED DUMMY FOOLS THE NIGHT BED CHECK.' }
      ];

      // Night Escape Scene State
      this.escapeState = {
        ex: 20, ey: 120,
        cutting: false, cutProgress: 0,
        search1Angle: 0, search2Angle: Math.PI * 0.5,
        rainDrops: [],
        alertTime: 0
      };

      // Populate rain droplets
      for (let i = 0; i < 35; i++) {
        this.escapeState.rainDrops.push({
          x: Math.random() * 256,
          y: Math.random() * 240,
          sp: 160 + Math.random() * 120,
          len: 4 + Math.random() * 6
        });
      }

      // UI, Toasts & Interaction Prompt
      this.toastMsg = "WELCOME TO GREENHAVEN. OBEY ROUTINE OR SUFFER!";
      this.toastTimer = 5.0;
      this.actionPrompt = "";
      this.actionTarget = null;
      this.bagCursor = 0; // 0..5 pockets, 6..11 desk
      this.combineFirst = -1;
      this.shakedownTimer = 180; // Shakedown check interval

      // Camera
      this.camX = 0;
      this.camY = 0;

      // Stats
      this.shakedownsEvaded = 0;
      this.finalScore = 0;
      this.stealthGrade = 'A';
    },

    // ------------------------------------------------------------------------
    // ROUTINE & TIME HELPERS
    // ------------------------------------------------------------------------
    getRoutineAt(h) {
      if (h < 0) h += 24;
      if (h >= 24) h %= 24;
      for (let r of ROUTINE_DEFS) {
        if (r.end > 24) {
          if (h >= r.start || h < (r.end - 24)) return r;
        } else {
          if (h >= r.start && h < r.end) return r;
        }
      }
      return ROUTINE_DEFS[0];
    },

    showToast(msg, dur = 3.5) {
      this.toastMsg = msg;
      this.toastTimer = dur;
    },

    // ------------------------------------------------------------------------
    // MAP & COLLISION
    // ------------------------------------------------------------------------
    getTile(tx, ty) {
      if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) return '#';
      return MAP_ROWS[ty][tx] || '#';
    },

    isSolid(tx, ty) {
      const ch = this.getTile(tx, ty);
      // Closed bars at night: between 22:00 and 07:00
      const isNightLocked = (this.hour >= 22 || this.hour < 7);
      if (ch === '#') return true;
      if (ch === '|' && isNightLocked) return true;
      if (ch === 'F' || ch === 'O') return true;
      if (ch === 'B' || ch === 'T' || ch === 'D') return true;
      if (ch === 'S' || ch === 't') return true;
      if (ch === 'W' || ch === 'L' || ch === 'X') return true;
      return false;
    },

    canWalk(x, y, r = 3) {
      const minTx = Math.floor((x - r) / TILE_SZ);
      const maxTx = Math.floor((x + r) / TILE_SZ);
      const minTy = Math.floor((y - r) / TILE_SZ);
      const maxTy = Math.floor((y + r) / TILE_SZ);
      for (let ty = minTy; ty <= maxTy; ty++) {
        for (let tx = minTx; tx <= maxTx; tx++) {
          if (this.isSolid(tx, ty)) return false;
        }
      }
      return true;
    },

    // ------------------------------------------------------------------------
    // 3. MAIN UPDATE LOOP
    // ------------------------------------------------------------------------
    update(dt) {
      // Clamp dt to avoid physics jump
      if (dt > 0.1) dt = 0.1;

      // Toast decay
      if (this.toastTimer > 0) {
        this.toastTimer -= dt;
      }

      switch (this.mode) {
        case 'TITLE':
          this.updateTitle(dt);
          break;
        case 'GAME':
          this.updateGame(dt);
          break;
        case 'TUNNEL':
          this.updateTunnel(dt);
          break;
        case 'BAG':
          this.updateBag(dt);
          break;
        case 'ESCAPE':
          this.updateEscape(dt);
          break;
        case 'SOLITARY':
          this.updateSolitary(dt);
          break;
        case 'VICTORY':
        case 'GAMEOVER':
          this.updateEndScreen(dt);
          break;
      }
    },

    // ------------------------------------------------------------------------
    // TITLE SCREEN UPDATE
    // ------------------------------------------------------------------------
    updateTitle(dt) {
      if (PAD.hit('left') || PAD.hit('up')) {
        this.diff = (this.diff + 2) % 3;
        playSfx('SELECT');
      }
      if (PAD.hit('right') || PAD.hit('down')) {
        this.diff = (this.diff + 1) % 3;
        playSfx('SELECT');
      }
      if (PAD.hit('a') || PAD.hit('start') || (PAD.tapPos && PAD.tapPos.y > 150)) {
        playSfx('CONFIRM');
        this.mode = 'GAME';
        this.showToast("ATTEND 07:00 MORNING ROLL CALL IN YARD!");
      }
    },

    // ------------------------------------------------------------------------
    // MAIN GAMEPLAY UPDATE (ROUTINE, STEALTH, GUARDS)
    // ------------------------------------------------------------------------
    updateGame(dt) {
      // 1. Clock Progression
      const timeScale = (this.diff === 0 ? 0.75 : (this.diff === 2 ? 1.3 : 1.0));
      // 1 game minute every 0.35 seconds real-time
      this.timeSec += dt * timeScale;
      if (this.timeSec >= 0.35) {
        this.timeSec -= 0.35;
        this.minute++;
        if (this.minute >= 60) {
          this.minute = 0;
          this.hour++;
          if (this.hour >= 24) {
            this.hour = 0;
            this.day++;
            this.toiletClogged = 0; // reset daily flush limit
            this.showToast("A NEW DAY DAWNS: DAY " + this.day);
          }
          this.onHourChange();
        }
      }

      const decimalHour = this.hour + this.minute / 60;
      const nextRoutine = this.getRoutineAt(decimalHour);
      if (nextRoutine.id !== this.curRoutine.id) {
        this.curRoutine = nextRoutine;
        playSfx('ALARM');
        this.showToast("ROUTINE: " + this.curRoutine.name + " (" + this.curRoutine.desc + ")");
        if (this.curRoutine.id === 'ROLL_MORN' || this.curRoutine.id === 'ROLL_EVE') {
          this.rollAttended = false;
        }
      }

      // 2. Input & Player Movement
      let dx = 0, dy = 0;
      if (PAD.state.left)  { dx -= 1; this.pdir = 3; }
      if (PAD.state.right) { dx += 1; this.pdir = 1; }
      if (PAD.state.up)    { dy -= 1; this.pdir = 0; }
      if (PAD.state.down)  { dy += 1; this.pdir = 2; }

      // Touch tap-to-walk or on-screen action
      if (PAD.pointer && PAD.pointer.down) {
        const scrX = PAD.pointer.x;
        const scrY = PAD.pointer.y;
        // If not tapping bottom UI buttons:
        if (scrY < 200) {
          const worldTapX = scrX + this.camX;
          const worldTapY = scrY + this.camY;
          const tdx = worldTapX - this.px;
          const tdy = worldTapY - this.py;
          const dist = Math.hypot(tdx, tdy);
          if (dist > 6) {
            dx = tdx / dist;
            dy = tdy / dist;
            if (Math.abs(dx) > Math.abs(dy)) {
              this.pdir = dx > 0 ? 1 : 3;
            } else {
              this.pdir = dy > 0 ? 2 : 0;
            }
          }
        }
      }

      const speed = 48; // px/sec
      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy) || 1;
        const moveX = (dx / len) * speed * dt;
        const moveY = (dy / len) * speed * dt;

        if (this.canWalk(this.px + moveX, this.py)) {
          this.px += moveX;
        }
        if (this.canWalk(this.px, this.py + moveY)) {
          this.py += moveY;
        }
        this.walkTimer += dt * 8;
      }

      // Keep inside bounds
      this.px = Math.max(8, Math.min(MAP_W * TILE_SZ - 8, this.px));
      this.py = Math.max(8, Math.min(MAP_H * TILE_SZ - 8, this.py));

      // 3. Camera Tracking (Horizontal scroll across 44 tiles)
      const targetCamX = Math.max(0, Math.min(MAP_W * TILE_SZ - 256, this.px - 128));
      this.camX += (targetCamX - this.camX) * 0.15;
      this.camY = 0; // map height fits inside 240 px

      // 4. Current Zone Check & Routine Adherence
      const playerTx = Math.floor(this.px / TILE_SZ);
      const playerTy = Math.floor(this.py / TILE_SZ);
      let playerZone = 'CELL';
      if (playerTx >= 14 && playerTx <= 28 && playerTy < 16) playerZone = 'MESS';
      else if (playerTx >= 14 && playerTx <= 28 && playerTy >= 16) playerZone = 'WORK';
      else if (playerTx > 28) playerZone = 'YARD';

      // Roll Call Box: tx: 32..38, ty: 6..12
      const inRollCallBox = (playerTx >= 32 && playerTx <= 38 && playerTy >= 6 && playerTy <= 12);
      if ((this.curRoutine.id === 'ROLL_MORN' || this.curRoutine.id === 'ROLL_EVE') && inRollCallBox) {
        this.rollAttended = true;
        // Cool down heat during roll call
        this.heat = Math.max(0, this.heat - 8 * dt);
      }

      // Missing Roll Call Penalty
      if ((this.curRoutine.id === 'ROLL_MORN' || this.curRoutine.id === 'ROLL_EVE')) {
        if (!this.rollAttended && (this.minute > 15 || this.hour === 8 || this.hour === 20)) {
          this.heat = Math.min(100, this.heat + 12 * dt);
          if (Math.floor(this.timeSec * 10) % 5 === 0) {
            this.showToast("WARNING: MISSING ROLL CALL! HEAT RISING!");
          }
        }
      } else {
        // Natural heat decay when complying
        if (this.heat > 0 && !this.lockdown) {
          this.heat = Math.max(0, this.heat - 1.5 * dt);
        }
      }

      // Tracking highest heat for stealth score
      if (this.heat > this.maxHeatRecorded) {
        this.maxHeatRecorded = this.heat;
      }

      // Curfew Violation Check (22:00 to 06:00 outside Cell block)
      const isNight = (this.hour >= 22 || this.hour < 6);
      if (isNight && playerZone !== 'CELL') {
        this.heat = Math.min(100, this.heat + 18 * dt);
        this.showToast("CURFEW VIOLATION! PATROLS ON HIGH ALERT!");
      }

      // 5. Lockdown Trigger
      if (this.heat >= 100 && !this.lockdown) {
        this.triggerLockdown();
      }

      // 6. Inspect Nearby Objects & Set Action Prompt
      this.checkInteractables(playerTx, playerTy);

      // 7. Action Button [A] Handling
      if (PAD.hit('a') || (PAD.tapPos && PAD.tapPos.y >= 200 && PAD.tapPos.x > 180)) {
        this.executeAction();
      }

      // 8. Open Inventory / Crafting [B]
      if (PAD.hit('b') || (PAD.tapPos && PAD.tapPos.y >= 200 && PAD.tapPos.x < 70)) {
        playSfx('SELECT');
        this.mode = 'BAG';
        this.combineFirst = -1;
      }

      // 9. Guard AI & Patrols
      this.updateGuards(dt, isNight);

      // 10. Random Shakedown Check
      this.shakedownTimer -= dt;
      if (this.shakedownTimer <= 0) {
        this.shakedownTimer = 160 + Math.random() * 60;
        this.triggerShakedown();
      }
    },

    // ------------------------------------------------------------------------
    // HOURLY EVENTS (BED CHECK, MEALTIMES)
    // ------------------------------------------------------------------------
    onHourChange() {
      // 22:00 Bed Check: Guard checks Cell #4
      if (this.hour === 22) {
        this.showToast("LIGHTS OUT! GUARDS CONDUCTING CELL BED CHECK!");
        playSfx('ALARM');
        // If player is not in bed and no dummy is on bed -> Busted!
        const inBed = (this.px >= 8 * TILE_SZ && this.px <= 11 * TILE_SZ && this.py >= 1 * TILE_SZ && this.py <= 4 * TILE_SZ);
        if (!inBed && !this.dummyOnBed) {
          this.showToast("EMPTY BED DETECTED! INMATE AT LARGE!");
          this.heat = 100;
          this.triggerLockdown();
        } else if (this.dummyOnBed && !inBed) {
          this.showToast("BED DUMMY FOOLED THE PATROLLING GUARD!");
          playSfx('POWERUP');
        }
      }
    },

    // ------------------------------------------------------------------------
    // INTERACTION SYSTEM
    // ------------------------------------------------------------------------
    checkInteractables(tx, ty) {
      this.actionPrompt = "";
      this.actionTarget = null;

      // Check adjacent 4 cardinal tiles
      const neighbors = [
        { x: tx, y: ty - 1, dir: 0 },
        { x: tx + 1, y: ty, dir: 1 },
        { x: tx, y: ty + 1, dir: 2 },
        { x: tx - 1, y: ty, dir: 3 },
        { x: tx, y: ty, dir: -1 }
      ];

      for (let n of neighbors) {
        const tile = this.getTile(n.x, n.y);

        // Player's Bunk (Cell #4: tx: 9, 10, ty: 2, 3)
        if (tile === 'B' && n.x >= 8 && n.x <= 10 && n.y >= 2 && n.y <= 3) {
          if (this.hour >= 22 || this.hour < 6) {
            this.actionPrompt = "[A] DIG TUNNEL / SLEEP";
            this.actionTarget = 'BUNK';
          } else {
            this.actionPrompt = "[A] REST / EXAMINE HOLE";
            this.actionTarget = 'BUNK';
          }
          return;
        }

        // Toilet in Player Cell (tx: 10, ty: 2)
        if (tile === 'T' && n.x === 10 && n.y === 2) {
          const hasDirt = this.pockets.includes('dirt');
          this.actionPrompt = hasDirt ? "[A] FLUSH DIRT BAG" : "[A] INSPECT TOILET";
          this.actionTarget = 'TOILET';
          return;
        }

        // Desk in Player Cell (tx: 9, ty: 5)
        if (tile === 'D' && n.x === 9 && n.y === 5) {
          this.actionPrompt = "[A] OPEN CELL DESK STASH";
          this.actionTarget = 'DESK';
          return;
        }

        // Canteen Serving Counter (ty: 3, tx: 18..25)
        if (tile === 'S') {
          this.actionPrompt = "[A] TAKE MEAL TRAY & SPOON";
          this.actionTarget = 'FOOD';
          return;
        }

        // Metal Lathe in Workshop (tx: 17..19, ty: 19..21)
        if (tile === 'W') {
          this.actionPrompt = "[A] WORK METAL LATHE (+$6)";
          this.actionTarget = 'LATHE';
          return;
        }

        // Laundry Press in Workshop (tx: 23..25, ty: 19..21)
        if (tile === 'L') {
          this.actionPrompt = "[A] PRESS LAUNDRY (+$6)";
          this.actionTarget = 'LAUNDRY';
          return;
        }

        // Workout Bench in Yard (tx: 34..36, ty: 19..21)
        if (tile === 'X') {
          this.actionPrompt = "[A] WORK OUT (+MAX NRG)";
          this.actionTarget = 'WORKOUT';
          return;
        }

        // Dirt Disposal Pile in Yard (tx: 39..41, ty: 23..25)
        if (tile === 'P') {
          const hasDirt = this.pockets.includes('dirt');
          this.actionPrompt = hasDirt ? "[A] SCATTER DIRT IN YARD" : "[A] DIRT DISPOSAL YARD";
          this.actionTarget = 'SCATTER';
          return;
        }
      }

      // Check NPCs
      for (let npc of this.inmates) {
        const d = Math.hypot(this.px - npc.x, this.py - npc.y);
        if (d < 16) {
          this.actionPrompt = "[A] TALK TO " + npc.name;
          this.actionTarget = 'NPC_' + npc.id;
          return;
        }
      }
    },

    executeAction() {
      if (!this.actionTarget) return;

      // 1. Bunk (Dig Tunnel / Sleep)
      if (this.actionTarget === 'BUNK') {
        playSfx('CONFIRM');
        this.mode = 'TUNNEL';
        return;
      }

      // 2. Toilet (Flush Dirt)
      if (this.actionTarget === 'TOILET') {
        const dirtIdx = this.pockets.indexOf('dirt');
        if (dirtIdx >= 0) {
          if (this.toiletClogged >= 2) {
            playSfx('ERROR');
            this.showToast("TOILET CLOGGED! WAIT FOR MAINTENANCE TOMORROW!");
          } else {
            this.pockets.splice(dirtIdx, 1);
            this.toiletClogged++;
            playSfx('SPLASH');
            this.showToast("DIRT FLUSHED! (" + this.toiletClogged + "/2 DAILY FLUSHES)");
          }
        } else {
          playSfx('SELECT');
          this.showToast("TOILET DRAIN CLEAR. READY FOR DIRT DISPOSAL.");
        }
        return;
      }

      // 3. Desk (Cell Stash)
      if (this.actionTarget === 'DESK') {
        playSfx('SELECT');
        this.mode = 'BAG';
        this.bagCursor = 6; // start on desk stash side
        return;
      }

      // 4. Food Counter (Canteen)
      if (this.actionTarget === 'FOOD') {
        if (this.curRoutine.zone === 'MESS') {
          playSfx('POWERUP');
          this.energy = Math.min(this.maxEnergy, this.energy + 45);
          if (!this.pockets.includes('spoon') && this.pockets.length < 6) {
            this.pockets.push('spoon');
            this.showToast("ATE TRAY (+45 NRG). POCKETED A SPOON!");
          } else {
            this.showToast("ATE HEARTY PRISON MEAL! (+45 NRG)");
          }
        } else {
          playSfx('ERROR');
          this.showToast("CANTEEN CLOSED OUTSIDE MEAL HOURS!");
        }
        return;
      }

      // 5. Metal Lathe (Workshop)
      if (this.actionTarget === 'LATHE') {
        if (this.curRoutine.zone === 'WORK') {
          if (this.energy >= 15) {
            this.energy -= 15;
            this.coins += 6;
            playSfx('COIN');
            // 35% chance of finding File or Pliers
            if (Math.random() < 0.35 && this.pockets.length < 6) {
              const item = Math.random() < 0.5 ? 'file' : 'pliers';
              this.pockets.push(item);
              this.showToast("SHIFT DONE (+$6)! SCAVENGED A " + ITEMS[item].name + "!");
            } else {
              this.showToast("METAL SHIFT FINISHED: EARNED $6 CASH!");
            }
          } else {
            playSfx('ERROR');
            this.showToast("TOO EXHAUSTED TO WORK! EAT OR REST!");
          }
        } else {
          playSfx('ERROR');
          this.showToast("WORKSHOP ACTIVE ONLY DURING 12:00 WORK SHIFT!");
        }
        return;
      }

      // 6. Laundry Press (Workshop)
      if (this.actionTarget === 'LAUNDRY') {
        if (this.curRoutine.zone === 'WORK') {
          if (this.energy >= 15) {
            this.energy -= 15;
            this.coins += 6;
            playSfx('COIN');
            // 35% chance of finding Sheet or Tape
            if (Math.random() < 0.35 && this.pockets.length < 6) {
              const item = Math.random() < 0.5 ? 'sheet' : 'tape';
              this.pockets.push(item);
              this.showToast("LAUNDRY DONE (+$6)! FOUND A " + ITEMS[item].name + "!");
            } else {
              this.showToast("LAUNDRY SHIFT FINISHED: EARNED $6 CASH!");
            }
          } else {
            playSfx('ERROR');
            this.showToast("TOO TIRED FOR HEAVY LAUNDRY PRESS!");
          }
        } else {
          playSfx('ERROR');
          this.showToast("LAUNDRY WORKROOM ACTIVE DURING WORK HOURS!");
        }
        return;
      }

      // 7. Workout Bench (Yard)
      if (this.actionTarget === 'WORKOUT') {
        if (this.energy >= 12) {
          this.energy -= 12;
          this.maxEnergy = Math.min(150, this.maxEnergy + 2);
          playSfx('POWERUP');
          this.showToast("PUMPED IRON! MAX ENERGY INCREASED TO " + this.maxEnergy + "!");
        } else {
          playSfx('ERROR');
          this.showToast("TOO TIRED TO LIFT WEIGHTS!");
        }
        return;
      }

      // 8. Dirt Scatter (Yard)
      if (this.actionTarget === 'SCATTER') {
        const dirtIdx = this.pockets.indexOf('dirt');
        if (dirtIdx >= 0) {
          this.pockets.splice(dirtIdx, 1);
          playSfx('SWISH');
          this.showToast("SCATTERED DIRT CLEANLY IN YARD GRAVEL!");
        } else {
          playSfx('SELECT');
          this.showToast("YARD GRAVEL BED. SAFE PLACE TO SCATTER DIRT.");
        }
        return;
      }

      // 9. Inmate NPCs
      if (this.actionTarget.startsWith('NPC_')) {
        const id = this.actionTarget.substring(4);
        const npc = this.inmates.find(n => n.id === id);
        if (npc) {
          playSfx('SELECT');
          // Offer special inmate trade
          if (npc.id === 'slim' && this.coins >= 6 && !this.pockets.includes('mag') && this.pockets.length < 6) {
            this.coins -= 6;
            this.pockets.push('mag');
            playSfx('COIN');
            this.showToast("SLIM: 'BOUGHT MY PINUP MAG FOR $6!'");
          } else if (npc.id === 'rock' && this.coins >= 8 && !this.pockets.includes('tape') && this.pockets.length < 6) {
            this.coins -= 8;
            this.pockets.push('tape');
            playSfx('COIN');
            this.showToast("ROCK: 'SMUGGLED INDUSTRIAL TAPE FOR $8!'");
          } else {
            this.showToast(npc.name + ": \"" + npc.tip + "\"");
          }
        }
      }
    },

    // ------------------------------------------------------------------------
    // GUARD AI & PATROL BEHAVIOR
    // ------------------------------------------------------------------------
    updateGuards(dt, isNight) {
      for (let g of this.guards) {
        if (this.lockdown) {
          // Chase player directly during lockdown
          const dx = this.px - g.x;
          const dy = this.py - g.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 4) {
            g.x += (dx / dist) * (g.speed * 1.6) * dt;
            g.y += (dy / dist) * (g.speed * 1.6) * dt;
            if (Math.abs(dx) > Math.abs(dy)) g.dir = dx > 0 ? 1 : 3;
            else g.dir = dy > 0 ? 2 : 0;
          }
          if (dist < 10) {
            this.capturePlayer("APPREHENDED BY " + g.name + " DURING LOCKDOWN!");
            return;
          }
          continue;
        }

        // Standard Waypoint Patrol
        const target = g.waypoints[g.wpIdx];
        const dx = target.x - g.x;
        const dy = target.y - g.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 4) {
          g.timer += dt;
          if (g.timer > 2.0) {
            g.timer = 0;
            g.wpIdx = (g.wpIdx + 1) % g.waypoints.length;
          }
        } else {
          g.x += (dx / dist) * g.speed * dt;
          g.y += (dy / dist) * g.speed * dt;
          if (Math.abs(dx) > Math.abs(dy)) g.dir = dx > 0 ? 1 : 3;
          else g.dir = dy > 0 ? 2 : 0;
        }

        // Sight Cone Detection
        const coneDist = isNight ? 70 : 48; // night flashlight reaches farther
        const pdx = this.px - g.x;
        const pdy = this.py - g.y;
        const pdist = Math.hypot(pdx, pdy);

        if (pdist < coneDist) {
          // Angle check
          let inCone = false;
          if (g.dir === 0 && pdy < 0 && Math.abs(pdx) < -pdy * 0.7) inCone = true;
          if (g.dir === 1 && pdx > 0 && Math.abs(pdy) < pdx * 0.7) inCone = true;
          if (g.dir === 2 && pdy > 0 && Math.abs(pdx) < pdy * 0.7) inCone = true;
          if (g.dir === 3 && pdx < 0 && Math.abs(pdy) < -pdx * 0.7) inCone = true;

          if (inCone) {
            // Line of sight raycast check through walls
            if (this.hasLineOfSight(g.x, g.y, this.px, this.py)) {
              if (isNight) {
                // Instant detection at night!
                this.heat = Math.min(100, this.heat + 40 * dt);
                this.showToast(g.name + "'S FLASHLIGHT SPOTTED YOU!");
                if (pdist < 14) {
                  this.capturePlayer("CAUGHT OUT OF BED AT NIGHT BY " + g.name + "!");
                  return;
                }
              } else if (this.heat > 50) {
                // Suspicious guard approaches
                this.heat = Math.min(100, this.heat + 15 * dt);
                if (pdist < 12) {
                  this.friskPlayer(g);
                  return;
                }
              }
            }
          }
        }
      }
    },

    hasLineOfSight(x0, y0, x1, y1) {
      const steps = 8;
      for (let i = 1; i < steps; i++) {
        const tx = Math.floor((x0 + (x1 - x0) * (i / steps)) / TILE_SZ);
        const ty = Math.floor((y0 + (y1 - y0) * (i / steps)) / TILE_SZ);
        if (this.isSolid(tx, ty)) return false;
      }
      return true;
    },

    // ------------------------------------------------------------------------
    // SHAKEDOWN & CONTRABAND SEARCH
    // ------------------------------------------------------------------------
    triggerShakedown() {
      this.showToast("INSPECTION! GUARDS CONDUCTING RANDOM CELL SEARCH!");
      playSfx('ALARM');
      this.shakedownsEvaded++;

      // Guard checks Cell #4 (player's cell)
      // 1. Check if hole is exposed
      if (this.tunnel > 0 && !this.posterOnHole) {
        this.capturePlayer("GUARDS DISCOVERED UNCOVERED TUNNEL IN CELL #4!");
        return;
      }

      // 2. Check for dirt bags left in cell desk
      if (this.deskStash.includes('dirt')) {
        this.capturePlayer("CONTRABAND DIRT BAGS FOUND IN YOUR DESK!");
        return;
      }

      // 3. Shakedown passed!
      playSfx('CONFIRM');
      this.showToast("CELL SHAKEDOWN PASSED! NO CONTRABAND FOUND.");
    },

    friskPlayer(guard) {
      // Guard frisks pockets
      const illegal = this.pockets.filter(id => ITEMS[id] && ITEMS[id].contra);
      if (illegal.length > 0) {
        this.capturePlayer(guard.name + " CONFISCATED CONTRABAND FROM YOUR POCKETS!");
      } else {
        playSfx('CONFIRM');
        this.showToast(guard.name + ": 'CLEAN INMATE. KEEP MOVING.'");
        this.heat = Math.max(0, this.heat - 15);
      }
    },

    triggerLockdown() {
      this.lockdown = true;
      this.lockdownTimer = 20;
      playSfx('ALARM');
      this.showToast("LOCKDOWN ALARM! GUARDS DISPATCHED!");
    },

    capturePlayer(reason) {
      playSfx('HURT');
      this.solitaryCount++;
      // Confiscate all contraband from pockets
      this.pockets = this.pockets.filter(id => ITEMS[id] && !ITEMS[id].contra);

      // If tunnel was exposed, guards fill 15% of it with cement!
      if (!this.posterOnHole && this.tunnel > 0) {
        this.tunnel = Math.max(0, this.tunnel - 15);
      }

      this.mode = 'SOLITARY';
      this.toastMsg = reason;
      this.heat = 15;
      this.lockdown = false;
    },

    // ------------------------------------------------------------------------
    // 4. TUNNEL EXCAVATION MINI-GAME
    // ------------------------------------------------------------------------
    updateTunnel(dt) {
      // Determine equipped tool
      let bestTool = null;
      if (this.pockets.includes('shovel')) bestTool = 'shovel';
      else if (this.pockets.includes('spoon')) bestTool = 'spoon';
      this.equippedTool = bestTool;

      // Dig Action [A]
      if (PAD.hit('a') || (PAD.tapPos && PAD.tapPos.y > 170 && PAD.tapPos.x > 130)) {
        if (this.tunnel >= 100) {
          // Tunnel is 100% complete: Initiate Night Escape!
          if (this.hour >= 22 || this.hour < 6) {
            playSfx('FANFARE');
            this.mode = 'ESCAPE';
            this.escapeState.ex = 20;
            this.escapeState.ey = 120;
            this.escapeState.cutProgress = 0;
            return;
          } else {
            playSfx('ERROR');
            this.showToast("WAIT FOR CURFEW (22:00) UNDER COVER OF DARKNESS!");
          }
          return;
        }

        if (this.energy < 8) {
          playSfx('ERROR');
          this.showToast("TOO EXHAUSTED TO DIG! EAT OR REST!");
          return;
        }

        // Digging calculation
        const power = bestTool ? ITEMS[bestTool].power : 0.4;
        const nrgCost = bestTool === 'shovel' ? 6 : (bestTool === 'spoon' ? 9 : 14);
        this.energy -= nrgCost;
        this.tunnel = Math.min(100, this.tunnel + power);
        this.tunnelPhase = Math.min(3, Math.floor(this.tunnel / 25));
        SAVE.setScore(58, Math.floor(this.tunnel));

        // Noise & Sparks
        playSfx(bestTool === 'shovel' ? 'HIT' : 'TICK');
        this.digNoise = Math.min(100, this.digNoise + 20);

        // Tool wear & breakage
        if (bestTool === 'spoon' && Math.random() < 0.12) {
          const idx = this.pockets.indexOf('spoon');
          if (idx >= 0) this.pockets.splice(idx, 1);
          playSfx('HIT');
          this.showToast("YOUR FLIMSY SPOON SNAPPED!");
        }

        // Accumulate dirt
        this.dirtWaiting += power;
        if (this.dirtWaiting >= 5.0) {
          this.dirtWaiting -= 5.0;
          if (this.pockets.length < 6) {
            this.pockets.push('dirt');
            playSfx('SWISH');
            this.showToast("FILLED 1 DIRT BAG. DISPOSE IN TOILET/YARD!");
          } else {
            this.showToast("POCKETS FULL! DISPOSE DIRT BAGS BEFORE DIGGING!");
          }
        }
      }

      // Toggle Poster / Exit [B]
      if (PAD.hit('b') || (PAD.tapPos && PAD.tapPos.y > 170 && PAD.tapPos.x < 130)) {
        playSfx('CONFIRM');
        // Check if player has poster to cover hole
        if (this.pockets.includes('poster')) {
          this.posterOnHole = true;
          this.showToast("HOLE SECURELY COVERED WITH POSTER!");
        } else {
          this.posterOnHole = false;
          this.showToast("CAUTION: TUNNEL HOLE LEFT EXPOSED!");
        }
        this.mode = 'GAME';
      }

      // Noise dissipation
      this.digNoise = Math.max(0, this.digNoise - 15 * dt);
    },

    // ------------------------------------------------------------------------
    // 5. INVENTORY & CRAFTING [BAG]
    // ------------------------------------------------------------------------
    updateBag(dt) {
      // D-pad navigation between 12 slots (0..5 pockets, 6..11 desk)
      if (PAD.hit('left'))  { if (this.bagCursor >= 6) this.bagCursor -= 6; playSfx('SELECT'); }
      if (PAD.hit('right')) { if (this.bagCursor < 6)  this.bagCursor += 6; playSfx('SELECT'); }
      if (PAD.hit('up'))    { if (this.bagCursor % 6 > 0) this.bagCursor--; playSfx('SELECT'); }
      if (PAD.hit('down'))  { if (this.bagCursor % 6 < 5) this.bagCursor++; playSfx('SELECT'); }

      // Direct touch on slot
      if (PAD.tapPos && PAD.tapPos.y >= 50 && PAD.tapPos.y <= 180) {
        const col = PAD.tapPos.x < 128 ? 0 : 1;
        const row = Math.floor((PAD.tapPos.y - 50) / 20);
        if (row >= 0 && row < 6) {
          this.bagCursor = col * 6 + row;
          playSfx('SELECT');
        }
      }

      // Action [A]: Select item for Crafting or Transfer
      if (PAD.hit('a') || (PAD.tapPos && PAD.tapPos.y > 190 && PAD.tapPos.x > 130)) {
        if (this.combineFirst === -1) {
          // First item picked
          this.combineFirst = this.bagCursor;
          playSfx('SELECT');
        } else {
          // Second item picked: Attempt Crafting or Transfer
          const srcIdx = this.combineFirst;
          const dstIdx = this.bagCursor;
          this.combineFirst = -1;

          // If transfer between Pockets and Desk
          const srcInPockets = srcIdx < 6;
          const dstInDesk = dstIdx >= 6;
          const srcList = srcInPockets ? this.pockets : this.deskStash;
          const dstList = dstInDesk ? this.deskStash : this.pockets;
          const srcSlot = srcIdx % 6;
          const dstSlot = dstIdx % 6;

          const itemA = srcList[srcSlot];

          // If crafting inside pockets
          if (srcInPockets && dstIdx < 6 && srcIdx !== dstIdx) {
            const itemB = this.pockets[dstSlot];
            if (itemA && itemB) {
              const recipe = RECIPES.find(r =>
                (r.a === itemA && r.b === itemB) || (r.a === itemB && r.b === itemA)
              );
              if (recipe) {
                // Success! Remove both, insert recipe result
                const maxI = Math.max(srcSlot, dstSlot);
                const minI = Math.min(srcSlot, dstSlot);
                this.pockets.splice(maxI, 1);
                this.pockets.splice(minI, 1);
                this.pockets.push(recipe.res);
                playSfx('POWERUP');
                this.showToast("CRAFTED: " + recipe.name + "!");
                return;
              } else {
                playSfx('ERROR');
                this.showToast("THOSE ITEMS CANNOT BE COMBINED!");
                return;
              }
            }
          }

          // Use consumable item (snack)
          if (itemA === 'snack') {
            srcList.splice(srcSlot, 1);
            this.energy = Math.min(this.maxEnergy, this.energy + 35);
            playSfx('POWERUP');
            this.showToast("ATE ENERGY BAR! (+35 STAMINA)");
            return;
          }

          // Bed Dummy placement
          if (itemA === 'dummy') {
            this.dummyOnBed = !this.dummyOnBed;
            playSfx('CONFIRM');
            this.showToast(this.dummyOnBed ? "BED DUMMY PLACED ON BUNK!" : "BED DUMMY TAKEN OFF BUNK.");
            return;
          }

          // Transfer item to desk if standing at desk
          if (srcInPockets && dstInDesk && this.actionTarget === 'DESK') {
            if (itemA && this.deskStash.length < 6) {
              srcList.splice(srcSlot, 1);
              this.deskStash.push(itemA);
              playSfx('SWISH');
              this.showToast("STASHED " + ITEMS[itemA].name + " IN DESK.");
            }
            return;
          }
        }
      }

      // Exit [B]
      if (PAD.hit('b') || (PAD.tapPos && PAD.tapPos.y > 190 && PAD.tapPos.x < 130)) {
        playSfx('CANCEL');
        this.mode = 'GAME';
      }
    },

    // ------------------------------------------------------------------------
    // 6. NIGHT ESCAPE CLIMAX (RAIN, SEARCHLIGHTS, WIRE CUTTING)
    // ------------------------------------------------------------------------
    updateEscape(dt) {
      const s = this.escapeState;

      // Update falling rain
      for (let r of s.rainDrops) {
        r.y += r.sp * dt;
        r.x -= r.sp * 0.4 * dt;
        if (r.y > 240) { r.y = -10; r.x = Math.random() * 280; }
      }

      // Player sneak movement
      let dx = 0, dy = 0;
      if (PAD.state.left)  dx -= 1;
      if (PAD.state.right) dx += 1;
      if (PAD.state.up)    dy -= 1;
      if (PAD.state.down)  dy += 1;

      // Touch steering
      if (PAD.pointer && PAD.pointer.down) {
        const tdx = PAD.pointer.x - s.ex;
        const tdy = PAD.pointer.y - s.ey;
        if (Math.hypot(tdx, tdy) > 8) {
          dx = tdx;
          dy = tdy;
        }
      }

      const spd = 40;
      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy) || 1;
        s.ex += (dx / len) * spd * dt;
        s.ey += (dy / len) * spd * dt;
      }
      s.ex = Math.max(10, Math.min(240, s.ex));
      s.ey = Math.max(20, Math.min(220, s.ey));

      // Oscillate Watchtower Searchlights
      s.search1Angle = Math.sin(performance.now() * 0.001) * 0.6 + Math.PI * 0.45;
      s.search2Angle = Math.cos(performance.now() * 0.0009) * 0.6 + Math.PI * 0.55;

      // Spotlight Beam Detection
      const t1x = 60, t1y = 15;
      const t2x = 180, t2y = 15;

      const p1Angle = Math.atan2(s.ey - t1y, s.ex - t1x);
      const p2Angle = Math.atan2(s.ey - t2y, s.ex - t2x);
      const dist1 = Math.hypot(s.ex - t1x, s.ey - t1y);
      const dist2 = Math.hypot(s.ex - t2y, s.ey - t2y);

      let inSpotlight = false;
      if (dist1 < 170 && Math.abs(p1Angle - s.search1Angle) < 0.22) inSpotlight = true;
      if (dist2 < 170 && Math.abs(p2Angle - s.search2Angle) < 0.22) inSpotlight = true;

      if (inSpotlight) {
        s.alertTime += dt;
        this.heat = 100;
        playSfx('ALARM');
        this.showToast("SPOTLIGHT TRACKING YOU! RUN OR REACH COVER!");
        if (s.alertTime > 2.8) {
          this.capturePlayer("SEARCHLIGHT SPOTTERS DIRECTED GUARDS TO YOU!");
          return;
        }
      } else {
        s.alertTime = Math.max(0, s.alertTime - dt * 1.5);
      }

      // Perimeter Razor Wire Fence at Right Edge (x >= 225)
      if (s.ex >= 225) {
        const hasCutters = this.pockets.includes('cutters');
        this.actionPrompt = hasCutters ? "HOLD [A] TO CUT FENCE!" : "CUTTERS NEEDED! PRYING...";

        if (PAD.state.a || (PAD.pointer && PAD.pointer.down)) {
          const cutRate = hasCutters ? 0.75 : 0.25;
          s.cutProgress += cutRate * dt;
          playSfx('HIT');

          if (s.cutProgress >= 1.0) {
            // THE GREAT ESCAPE COMPLETE!
            playSfx('FANFARE');
            this.triggerVictory();
          }
        }
      } else {
        this.actionPrompt = "SNEAK TO OUTER FENCE (RIGHT) ->";
      }
    },

    triggerVictory() {
      this.mode = 'VICTORY';
      // Calculate high score
      const basePoints = 10000;
      const daysBonus = Math.max(0, (12 - this.day) * 1000);
      const stealthBonus = Math.max(0, Math.floor((100 - this.maxHeatRecorded) * 80));
      const cashBonus = this.coins * 100;
      const solitaryPenalty = this.solitaryCount * 2000;

      this.finalScore = Math.max(1000, basePoints + daysBonus + stealthBonus + cashBonus - solitaryPenalty);
      if (this.solitaryCount === 0 && this.maxHeatRecorded < 30) this.stealthGrade = 'S';
      else if (this.solitaryCount === 0) this.stealthGrade = 'A';
      else if (this.solitaryCount === 1) this.stealthGrade = 'B';
      else this.stealthGrade = 'C';

      SAVE.setScore(58, this.finalScore);
    },

    // ------------------------------------------------------------------------
    // 7. SOLITARY CONFINEMENT SCREEN
    // ------------------------------------------------------------------------
    updateSolitary(dt) {
      if (PAD.hit('a') || (PAD.tapPos && PAD.tapPos.y > 150)) {
        playSfx('CONFIRM');
        // Serve 24 hours: advance to next morning 07:00
        this.day++;
        this.hour = 7;
        this.minute = 0;
        this.energy = 40; // hungry & exhausted
        this.px = 10 * TILE_SZ + 4;
        this.py = 4 * TILE_SZ + 4;
        this.mode = 'GAME';
        this.showToast("RELEASED FROM THE HOLE. ATTEND MORNING ROLL CALL!");
      }
    },

    updateEndScreen(dt) {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || (PAD.tapPos && PAD.tapPos.y > 180)) {
        playSfx('CONFIRM');
        this.init();
      }
    },

    // ------------------------------------------------------------------------
    // 8. GRAPHICS & RENDER ROUTINES (240x240 CRT PHOSPHOR)
    // ------------------------------------------------------------------------
    render(g) {
      g.clear(0);

      switch (this.mode) {
        case 'TITLE':
          this.renderTitle(g);
          break;
        case 'GAME':
          this.renderGame(g);
          break;
        case 'TUNNEL':
          this.renderTunnel(g);
          break;
        case 'BAG':
          this.renderBag(g);
          break;
        case 'ESCAPE':
          this.renderEscape(g);
          break;
        case 'SOLITARY':
          this.renderSolitary(g);
          break;
        case 'VICTORY':
          this.renderVictory(g);
          break;
      }
    },

    // ------------------------------------------------------------------------
    // TITLE SCREEN RENDER
    // ------------------------------------------------------------------------
    renderTitle(g) {
      // Prison Wall Silhouettes
      g.rect(0, 0, 256, 75, 1);
      g.rect(0, 75, 256, 165, 0);

      // Watchtower with Spotlight on Title
      g.rect(200, 20, 36, 55, 2);
      g.box(200, 20, 36, 55, 3);
      g.line(200, 45, 15, 120, 1);
      g.line(236, 45, 120, 140, 1);

      // Title Banner
      g.textC("VERDANT RETRO CONSOLE", 16, 1);
      g.textC("CARTRIDGE #058", 28, 2);

      // Big Title Header
      g.textC("★ PRISON BREAK ★", 48, 3, 2);
      g.textC("THE GREAT ESCAPE SIMULATOR", 68, 2);

      // 32x32 Icon Centerpiece
      this.icon(g, 112, 85);

      // Difficulty Selector
      const diffNames = ["EASY (LENIENT)", "NORMAL (AUTHENTIC)", "HARD (STRICT)"];
      g.rect(36, 134, 184, 18, 1);
      g.box(36, 134, 184, 18, 2);
      g.textC("◀ DIFFICULTY: " + diffNames[this.diff] + " ▶", 140, 3);

      // Controls Summary
      g.textC("D-PAD: MOVE / CYCLE    [A]: INTERACT / DIG", 164, 2);
      g.textC("[B]: INVENTORY & CRAFT   TOUCH: DIRECT TAP", 176, 2);

      // Flashing Start Prompt
      if (Math.floor(performance.now() * 0.003) % 2 === 0) {
        g.textC("PRESS [A] OR TAP TO COMMENCE SENTENCE", 205, 3);
      }

      g.textC("BEST ESCAPE RECORD: " + SAVE.getScore(58) + " PTS", 224, 1);
    },

    // ------------------------------------------------------------------------
    // MAIN FACILITY VIEW RENDER
    // ------------------------------------------------------------------------
    renderGame(g) {
      const ox = Math.floor(-this.camX);
      const oy = 20; // HUD header offset

      // 1. Draw Map Tiles
      for (let ty = 0; ty < MAP_H; ty++) {
        for (let tx = 0; tx < MAP_W; tx++) {
          const sx = ox + tx * TILE_SZ;
          const sy = oy + ty * TILE_SZ;
          if (sx + TILE_SZ < 0 || sx >= 256) continue;

          const ch = MAP_ROWS[ty][tx];
          switch (ch) {
            case '#': // Solid Brick Wall
              g.rect(sx, sy, 8, 8, 1);
              g.box(sx, sy, 8, 8, 2);
              g.line(sx, sy + 4, sx + 8, sy + 4, 0);
              break;
            case '|': // Cell Bars
              g.rect(sx, sy, 8, 8, 0);
              for (let b = 1; b < 8; b += 2) g.line(sx + b, sy, sx + b, sy + 8, 2);
              break;
            case 'B': // Bunk Bed
              g.rect(sx, sy, 8, 8, 1);
              g.rect(sx + 1, sy + 1, 6, 3, 2); // pillow/sheet
              if (tx === 9 && ty === 2 && this.dummyOnBed) {
                g.disc(sx + 4, sy + 4, 2, 3); // dummy silhouette
              }
              break;
            case 'T': // Toilet
              g.rect(sx + 2, sy + 1, 4, 6, 2);
              g.disc(sx + 4, sy + 4, 2, 3);
              break;
            case 'D': // Desk
              g.rect(sx + 1, sy + 1, 6, 6, 2);
              g.line(sx + 2, sy + 4, sx + 6, sy + 4, 3);
              break;
            case 'C': // Canteen Checkered Tile
              g.rect(sx, sy, 8, 8, ((tx + ty) % 2 === 0) ? 0 : 1);
              break;
            case 'S': // Serving Counter
              g.rect(sx, sy, 8, 8, 2);
              g.line(sx, sy + 1, sx + 8, sy + 1, 3);
              break;
            case 't': // Dining Table
              g.rect(sx + 1, sy + 1, 6, 6, 2);
              g.box(sx + 1, sy + 1, 6, 6, 3);
              break;
            case 'w': // Workshop Floor
              g.rect(sx, sy, 8, 8, 0);
              if ((tx + ty) % 3 === 0) g.px(sx + 4, sy + 4, 1);
              break;
            case 'W': // Metal Lathe
              g.rect(sx + 1, sy + 1, 6, 6, 2);
              g.rect(sx + 2, sy + 2, 4, 4, 3);
              break;
            case 'L': // Laundry Press
              g.rect(sx + 1, sy + 1, 6, 6, 1);
              g.box(sx + 1, sy + 1, 6, 6, 2);
              break;
            case ',': // Yard Dirt / Grass
              g.rect(sx, sy, 8, 8, 0);
              if ((tx * 7 + ty * 13) % 5 === 0) g.px(sx + 2, sy + 3, 1);
              break;
            case 'R': // Roll Call Muster Box
              g.rect(sx, sy, 8, 8, 1);
              if (tx === 32 || tx === 38 || ty === 6 || ty === 12) {
                g.line(sx, sy, sx + 8, sy, 3);
              }
              break;
            case 'X': // Workout Bench
              g.rect(sx + 1, sy + 2, 6, 4, 2);
              g.line(sx + 1, sy + 4, sx + 7, sy + 4, 3);
              break;
            case 'P': // Dirt Compost Pile
              g.rect(sx + 1, sy + 1, 6, 6, 1);
              g.disc(sx + 4, sy + 4, 2, 2);
              break;
            case 'F': // Chain-link Fence
              g.rect(sx, sy, 8, 8, 0);
              g.line(sx, sy, sx + 8, sy + 8, 2);
              g.line(sx + 8, sy, sx, sy + 8, 2);
              break;
            case 'O': // Watchtower
              g.rect(sx, sy, 8, 8, 2);
              g.box(sx, sy, 8, 8, 3);
              break;
            default:
              g.rect(sx, sy, 8, 8, 0);
              break;
          }
        }
      }

      // 2. Render Inmate NPCs
      for (let npc of this.inmates) {
        const nx = ox + npc.x;
        const ny = oy + npc.y;
        if (nx < -10 || nx > 260) continue;
        // Striped Inmate Uniform
        g.disc(nx, ny - 3, 2, 3); // head
        g.rect(nx - 2, ny - 1, 5, 5, 2); // body
        g.line(nx - 2, ny + 1, nx + 2, ny + 1, 0); // prison stripe
        g.text(npc.name, nx - 6, ny - 9, 1);
      }

      // 3. Render Guards & Sight Cones
      const isNight = (this.hour >= 22 || this.hour < 6);
      for (let gd of this.guards) {
        const gx = ox + gd.x;
        const gy = oy + gd.y;
        if (gx < -60 || gx > 320) continue;

        // Draw Sight Cone / Flashlight Beam
        const coneDist = isNight ? 70 : 45;
        const beamCol = isNight ? 2 : 1;
        if (gd.dir === 0) { // Up
          g.tri(gx, gy, gx - 25, gy - coneDist, gx + 25, gy - coneDist, beamCol);
        } else if (gd.dir === 1) { // Right
          g.tri(gx, gy, gx + coneDist, gy - 25, gx + coneDist, gy + 25, beamCol);
        } else if (gd.dir === 2) { // Down
          g.tri(gx, gy, gx - 25, gy + coneDist, gx + 25, gy + coneDist, beamCol);
        } else if (gd.dir === 3) { // Left
          g.tri(gx, gy, gx - coneDist, gy - 25, gx - coneDist, gy + 25, beamCol);
        }

        // Guard Sprite (Blue/Dark Guard Uniform with Cap)
        g.disc(gx, gy - 3, 2, 2); // head
        g.rect(gx - 2, gy - 4, 5, 2, 3); // cap visor
        g.rect(gx - 2, gy - 1, 5, 6, 2); // torso
        g.line(gx - 2, gy + 5, gx - 2, gy + 7, 3); // legs
        g.line(gx + 2, gy + 5, gx + 2, gy + 7, 3);
      }

      // 4. Render Player Sprite
      const pxScreen = ox + this.px;
      const pyScreen = oy + this.py;
      const walkFrame = Math.floor(this.walkTimer) % 2;

      // Player Head & Orange/Green Prison Uniform
      g.disc(pxScreen, pyScreen - 3, 3, 3); // head
      g.rect(pxScreen - 3, pyScreen, 7, 5, 3); // orange/bright torso
      g.line(pxScreen - 3, pyScreen + 2, pxScreen + 3, pyScreen + 2, 0); // uniform stripe
      // Animated legs
      if (walkFrame === 0) {
        g.line(pxScreen - 2, pyScreen + 5, pxScreen - 2, pyScreen + 8, 2);
        g.line(pxScreen + 2, pyScreen + 5, pxScreen + 3, pyScreen + 7, 2);
      } else {
        g.line(pxScreen - 2, pyScreen + 5, pxScreen - 3, pyScreen + 7, 2);
        g.line(pxScreen + 2, pyScreen + 5, pxScreen + 2, pyScreen + 8, 2);
      }

      // 5. HUD Top Bar
      g.rect(0, 0, 256, 20, 0);
      g.line(0, 20, 256, 20, 2);

      // Time & Routine
      const hh = (this.hour < 10 ? "0" : "") + this.hour;
      const mm = (this.minute < 10 ? "0" : "") + this.minute;
      g.text("D" + this.day + " " + hh + ":" + mm, 4, 3, 3);
      g.text(this.curRoutine.name, 56, 3, 2);

      // Energy Bar
      g.text("NRG:", 156, 3, 1);
      g.rect(176, 3, 32, 6, 1);
      const nrgW = Math.floor((this.energy / this.maxEnergy) * 32);
      g.rect(176, 3, nrgW, 6, 3);

      // Heat Meter (Alerts if high!)
      const heatCol = this.heat > 70 ? (Math.floor(performance.now() * 0.008) % 2 === 0 ? 3 : 0) : 2;
      g.text("HEAT:", 212, 3, heatCol);
      g.rect(236, 3, 16, 6, 1);
      g.rect(236, 3, Math.floor((this.heat / 100) * 16), 6, heatCol);

      // Sub-bar (Tunnel progress & Cash)
      g.rect(0, 11, 256, 9, 0);
      g.text("TUNNEL: " + Math.floor(this.tunnel) + "%", 4, 12, 2);
      g.text("$" + this.coins, 80, 12, 3);
      if (this.dummyOnBed) g.text("[DUMMY SET]", 110, 12, 3);
      if (this.posterOnHole) g.text("[POSTER COVER]", 180, 12, 2);

      // 6. Action Prompt Toast / Floating interaction banner
      if (this.actionPrompt) {
        g.rect(16, 206, 224, 14, 1);
        g.box(16, 206, 224, 14, 3);
        g.textC(this.actionPrompt, 210, 3);
      } else if (this.toastTimer > 0) {
        g.rect(10, 206, 236, 14, 0);
        g.box(10, 206, 236, 14, 2);
        g.textC(this.toastMsg, 210, 3);
      }

      // 7. On-Screen Touch Buttons
      g.rect(6, 223, 44, 15, 1);
      g.box(6, 223, 44, 15, 2);
      g.text("[B] BAG", 10, 228, 3);

      g.rect(206, 223, 44, 15, 1);
      g.box(206, 223, 44, 15, 2);
      g.text("[A] ACT", 210, 228, 3);
    },

    // ------------------------------------------------------------------------
    // TUNNEL EXCAVATION SCREEN RENDER
    // ------------------------------------------------------------------------
    renderTunnel(g) {
      g.clear(0);
      g.box(2, 2, 252, 236, 2);

      // Header
      const phaseNames = ["CELL WALL MASONRY", "UTILITY CORRIDOR", "SEWER DRAIN PIPES", "PERIMETER FENCE EXIT"];
      g.textC("★ UNDERGROUND ESCAPE TUNNEL ★", 10, 3);
      g.textC("PHASE " + (this.tunnelPhase + 1) + ": " + phaseNames[this.tunnelPhase], 22, 2);

      // Cutaway of cell floor above
      g.rect(10, 36, 236, 12, 1);
      g.box(10, 36, 236, 12, 2);
      g.text("CELL #4 FLOORBOARDS & BUNK LEGS", 20, 39, 3);

      // Cross-Section Underground Shaft
      g.rect(20, 52, 216, 100, 0);
      g.box(20, 52, 216, 100, 1);

      // Strata Textures based on tunnelPhase
      if (this.tunnelPhase === 0) {
        // Heavy stone bricks
        for (let y = 60; y < 140; y += 14) {
          g.line(20, y, 236, y, 1);
          for (let x = 20 + (y % 20); x < 236; x += 30) g.line(x, y, x, y + 14, 1);
        }
      } else if (this.tunnelPhase === 1) {
        // Industrial utility pipes
        g.rect(30, 70, 196, 8, 2);
        g.rect(40, 110, 176, 6, 2);
        g.text("HIGH VOLTAGE CONDUITS & STEAM MAINS", 34, 82, 1);
      } else if (this.tunnelPhase === 2) {
        // Sewer culvert
        g.rect(20, 120, 216, 20, 1);
        g.line(20, 130, 236, 130, 2);
        g.text("DRAINAGE SLUDGE & CEMENT CULVERT", 40, 124, 3);
      } else {
        // Tree roots and perimeter fence foundation
        g.line(50, 60, 90, 110, 2);
        g.line(180, 60, 140, 115, 2);
        g.text("SOIL STRATA BENEATH PERIMETER RAZOR WIRE", 30, 90, 3);
      }

      // Excavated Hole Silhouette
      const holeW = Math.floor((this.tunnel / 100) * 190);
      g.rect(30, 75, holeW, 45, 0);
      g.box(30, 75, holeW, 45, 3);

      // Inmate silhouette digging
      const digX = 30 + holeW - 10;
      g.disc(digX, 90, 4, 3); // head
      g.rect(digX - 3, 95, 8, 12, 2); // body
      // Tool in hand
      if (this.equippedTool === 'shovel') {
        g.line(digX + 5, 95, digX + 14, 105, 3);
        g.rect(digX + 13, 104, 4, 4, 3);
      } else if (this.equippedTool === 'spoon') {
        g.line(digX + 4, 98, digX + 10, 103, 3);
      }

      // Dig Noise Meter
      g.text("SURFACE NOISE:", 20, 158, 2);
      g.rect(100, 158, 100, 6, 1);
      g.rect(100, 158, this.digNoise, 6, this.digNoise > 60 ? 3 : 2);
      if (this.digNoise > 60) g.text("[CAUTION! GUARDS LISTENING]", 20, 168, 3);

      // Tunnel Progress Bar
      g.text("TOTAL PROGRESS: " + Math.floor(this.tunnel) + "%", 20, 178, 3);
      g.rect(20, 188, 216, 8, 1);
      g.rect(20, 188, Math.floor((this.tunnel / 100) * 216), 8, 3);

      // Action Hints
      const toolName = this.equippedTool ? ITEMS[this.equippedTool].name : "BARE HANDS";
      g.text("EQUIPPED TOOL: " + toolName, 20, 202, 2);
      g.text("STAMINA: " + this.energy + " / " + this.maxEnergy, 150, 202, 2);

      // Bottom Control Prompts
      if (this.tunnel >= 100) {
        g.rect(20, 214, 216, 18, 1);
        g.box(20, 214, 216, 18, 3);
        g.textC("★ [A] INITIATE THE GREAT ESCAPE! ★", 220, 3);
      } else {
        g.rect(20, 216, 96, 16, 1);
        g.box(20, 216, 96, 16, 2);
        g.textC("[B] COVER & EXIT", 221, 3);

        g.rect(140, 216, 96, 16, 1);
        g.box(140, 216, 96, 16, 3);
        g.textC("[A] DIG TUNNEL", 221, 3);
      }
    },

    // ------------------------------------------------------------------------
    // INVENTORY & CRAFTING SCREEN RENDER
    // ------------------------------------------------------------------------
    renderBag(g) {
      g.clear(0);
      g.box(2, 2, 252, 236, 2);
      g.textC("★ CONTRABAND & INVENTORY ★", 10, 3);

      // Pockets Column (Left)
      g.rect(12, 24, 110, 14, 1);
      g.textC("POCKETS (ON PERSON)", 28, 3);

      for (let i = 0; i < 6; i++) {
        const sy = 42 + i * 20;
        const isSel = (this.bagCursor === i);
        g.rect(12, sy, 110, 18, isSel ? 2 : 0);
        g.box(12, sy, 110, 18, isSel ? 3 : 1);

        const itemKey = this.pockets[i];
        if (itemKey && ITEMS[itemKey]) {
          const it = ITEMS[itemKey];
          g.text(it.name, 18, sy + 5, isSel ? 0 : 3);
          if (it.contra) g.text("!", 112, sy + 5, isSel ? 0 : 3);
        } else {
          g.text("(EMPTY)", 18, sy + 5, 1);
        }
      }

      // Desk Stash Column (Right)
      g.rect(134, 24, 110, 14, 1);
      g.textC("CELL DESK STASH", 28, 3);

      for (let i = 0; i < 6; i++) {
        const sy = 42 + i * 20;
        const isSel = (this.bagCursor === i + 6);
        g.rect(134, sy, 110, 18, isSel ? 2 : 0);
        g.box(134, sy, 110, 18, isSel ? 3 : 1);

        const itemKey = this.deskStash[i];
        if (itemKey && ITEMS[itemKey]) {
          const it = ITEMS[itemKey];
          g.text(it.name, 140, sy + 5, isSel ? 0 : 3);
          if (it.contra) g.text("!", 234, sy + 5, isSel ? 0 : 3);
        } else {
          g.text("(EMPTY)", 140, sy + 5, 1);
        }
      }

      // Selected Item Details
      const curList = this.bagCursor < 6 ? this.pockets : this.deskStash;
      const curItemKey = curList[this.bagCursor % 6];
      const curItem = curItemKey ? ITEMS[curItemKey] : null;

      g.rect(12, 168, 232, 28, 1);
      g.box(12, 168, 232, 28, 2);
      if (curItem) {
        g.text(curItem.name + (curItem.contra ? " [CONTRABAND]" : " [PERMITTED]"), 18, 172, 3);
        g.text(curItem.desc, 18, 182, 2);
      } else {
        g.text("SLOT IS EMPTY. CRAFT OR LOOT MATERIALS.", 18, 177, 2);
      }

      // Combine Selection Indicator
      if (this.combineFirst !== -1) {
        g.textC("COMBINE WITH SECOND ITEM TO CRAFT...", 202, 3);
      } else {
        g.textC("SELECT TWO ITEMS TO CRAFT CONTRABAND", 202, 2);
      }

      // Bottom Buttons
      g.rect(16, 214, 100, 16, 1);
      g.box(16, 214, 100, 16, 2);
      g.textC("[B] CLOSE BAG", 219, 3);

      g.rect(140, 214, 100, 16, 1);
      g.box(140, 214, 100, 16, 3);
      g.textC("[A] USE / CRAFT", 219, 3);
    },

    // ------------------------------------------------------------------------
    // NIGHT ESCAPE CLIMAX RENDER
    // ------------------------------------------------------------------------
    renderEscape(g) {
      const s = this.escapeState;

      // Dark stormy sky background
      g.clear(0);

      // Rain droplets falling diagonally
      for (let r of s.rainDrops) {
        g.line(r.x, r.y, r.x - 3, r.y + r.len, 1);
      }

      // Occasional lightning flash
      if (Math.floor(performance.now() * 0.002) % 17 === 0) {
        g.rect(0, 0, 256, 20, 2);
      }

      // Prison Outer Wall on Left
      g.rect(0, 0, 16, 240, 1);
      g.box(0, 0, 16, 240, 2);
      g.text("WALL", 4, 100, 0);

      // Escape Tunnel Exit Hole on ground
      g.disc(20, 120, 6, 1);
      g.disc(20, 120, 4, 0);

      // Outer Perimeter Razor Wire Fence on Right (x: 236..240)
      for (let y = 0; y < 240; y += 8) {
        g.line(236, y, 244, y + 8, 2);
        g.line(244, y, 236, y + 8, 2);
        g.disc(240, y + 4, 2, 3); // barbed razor coil
      }

      // Concrete Obstacles / Crates on Field
      g.rect(80, 50, 24, 20, 1);
      g.box(80, 50, 24, 20, 2);
      g.rect(140, 150, 30, 24, 1);
      g.box(140, 150, 30, 24, 2);

      // Two Watchtowers with Sweeping Searchlights
      const t1x = 60, t1y = 15;
      const t2x = 180, t2y = 15;

      // Watchtower cabins
      g.rect(t1x - 10, t1y - 10, 20, 14, 2);
      g.rect(t2x - 10, t2y - 10, 20, 14, 2);

      // Searchlight 1 Cone
      const s1Len = 190;
      const c1x1 = t1x + Math.cos(s.search1Angle - 0.22) * s1Len;
      const c1y1 = t1y + Math.sin(s.search1Angle - 0.22) * s1Len;
      const c1x2 = t1x + Math.cos(s.search1Angle + 0.22) * s1Len;
      const c1y2 = t1y + Math.sin(s.search1Angle + 0.22) * s1Len;
      g.tri(t1x, t1y, c1x1, c1y1, c1x2, c1y2, 1);

      // Searchlight 2 Cone
      const s2Len = 190;
      const c2x1 = t2x + Math.cos(s.search2Angle - 0.22) * s2Len;
      const c2y1 = t2y + Math.sin(s.search2Angle - 0.22) * s2Len;
      const c2x2 = t2x + Math.cos(s.search2Angle + 0.22) * s2Len;
      const c2y2 = t2y + Math.sin(s.search2Angle + 0.22) * s2Len;
      g.tri(t2x, t2y, c2x1, c2y1, c2x2, c2y2, 1);

      // Player Inmate Sneaking
      g.disc(s.ex, s.ey - 3, 3, 3); // head
      g.rect(s.ex - 3, s.ey, 6, 6, 2); // body
      g.line(s.ex - 2, s.ey + 6, s.ex - 2, s.ey + 8, 3);
      g.line(s.ex + 2, s.ey + 6, s.ex + 2, s.ey + 8, 3);

      // Wire Cutting Progress Indicator
      if (s.ex >= 225 && s.cutProgress > 0) {
        g.rect(s.ex - 15, s.ey - 18, 30, 6, 1);
        g.rect(s.ex - 15, s.ey - 18, Math.floor(s.cutProgress * 30), 6, 3);
        g.textC("CUTTING FENCE...", s.ey - 26, 3);
      }

      // HUD Overlay
      g.rect(0, 222, 256, 18, 0);
      g.line(0, 222, 256, 222, 2);
      g.textC(this.actionPrompt, 228, 3);
    },

    // ------------------------------------------------------------------------
    // SOLITARY CONFINEMENT RENDER
    // ------------------------------------------------------------------------
    renderSolitary(g) {
      g.clear(0);
      g.box(8, 8, 240, 224, 1);

      // Dark cell bars
      for (let x = 16; x < 240; x += 16) {
        g.line(x, 16, x, 224, 1);
      }

      g.rect(32, 50, 192, 130, 0);
      g.box(32, 50, 192, 130, 2);

      g.textC("★ SOLITARY CONFINEMENT ★", 65, 3);
      g.textC("24 HOURS IN THE HOLE", 80, 2);

      g.textC(this.toastMsg, 110, 3);
      g.textC("ALL CONTRABAND IN POCKETS CONFISCATED.", 130, 2);

      if (Math.floor(performance.now() * 0.003) % 2 === 0) {
        g.textC("PRESS [A] TO SERVE SENTENCE", 160, 3);
      }
    },

    // ------------------------------------------------------------------------
    // VICTORY SCREEN RENDER
    // ------------------------------------------------------------------------
    renderVictory(g) {
      g.clear(0);

      // Moonlit Forest Horizon
      g.rect(0, 0, 256, 110, 1);
      g.disc(200, 40, 16, 3); // Full Moon

      // Running Silhouettes of Freedom
      for (let x = 0; x < 256; x += 24) {
        g.tri(x, 110, x + 12, 60, x + 24, 110, 0); // pine trees
      }

      // Escaped Inmate Silhouette running into forest
      g.disc(128, 80, 4, 3);
      g.rect(125, 84, 7, 8, 3);
      g.line(125, 92, 121, 98, 3);
      g.line(129, 92, 134, 96, 3);

      // Victory Stats Box
      g.rect(16, 118, 224, 112, 0);
      g.box(16, 118, 224, 112, 3);

      g.textC("★ ★ ★ THE GREAT ESCAPE! ★ ★ ★", 124, 3);
      g.textC("INMATE #58 REACHED FREEDOM!", 136, 2);

      g.text("DAYS INCARCERATED: " + this.day + " DAYS", 28, 150, 3);
      g.text("STEALTH GRADE: " + this.stealthGrade + " (" + (100 - Math.floor(this.maxHeatRecorded)) + "% STEALTH)", 28, 162, 3);
      g.text("SHAKEDOWNS EVADED: " + this.shakedownsEvaded, 28, 174, 2);
      g.text("SOLITARY VISITS: " + this.solitaryCount, 28, 184, 2);

      g.textC("FINAL ESCAPE SCORE: " + this.finalScore + " PTS", 198, 3);
      g.textC("PRESS [A] TO PLAY AGAIN", 216, 2);
    }
  };

})();
