// js/cartridges/cart_052_dungeon_3d.js
// ============================================================================
// Cartridge #052: DUNGEON 3D
// Genre: RPG (5) | Fast Self-Contained First-Person DDA Raycaster Dungeon Crawler
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[52] = {
  id: 52,
  name: "DUNGEON 3D",
  genre: 5,
  scoreLabel: "SCORE",
  desc: "3D RAYCASTER LABYRINTH. EXPLORE 3 FLOORS, SLAY FOES, UNLOCK GATES, AND ESCAPE!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // 3D perspective dungeon hallway with torches, stone archway, and glowing exit
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Ceiling perspective lines
    g.line(x + 1, y + 1, x + 12, y + 9, 2);
    g.line(x + 30, y + 1, x + 19, y + 9, 2);
    g.line(x + 8, y + 1, x + 14, y + 9, 1);
    g.line(x + 23, y + 1, x + 17, y + 9, 1);

    // Floor perspective lines
    g.line(x + 1, y + 30, x + 12, y + 22, 2);
    g.line(x + 30, y + 30, x + 19, y + 22, 2);
    g.line(x + 7, y + 30, x + 14, y + 22, 1);
    g.line(x + 24, y + 30, x + 17, y + 22, 1);

    // Distant stone doorway arch
    g.rect(x + 12, y + 9, 8, 14, 2);
    g.rect(x + 13, y + 11, 6, 12, 0);
    g.line(x + 13, y + 9, x + 18, y + 9, 3); // keystone glow
    // Radiant doorway exit glow
    g.line(x + 15, y + 13, x + 16, y + 22, 3);
    g.line(x + 14, y + 18, x + 17, y + 22, 2);

    // Left wall torch & flame
    g.rect(x + 5, y + 13, 2, 4, 1); // bracket
    g.px(x + 5, y + 12, 2);
    g.px(x + 5, y + 11, 3); // flame core
    g.px(x + 6, y + 10, 3);
    // Torchlight glow on left wall
    g.line(x + 3, y + 8, x + 3, y + 18, 1);

    // Right wall torch & flame
    g.rect(x + 25, y + 13, 2, 4, 1); // bracket
    g.px(x + 26, y + 12, 2);
    g.px(x + 26, y + 11, 3); // flame core
    g.px(x + 25, y + 10, 3);
    // Torchlight glow on right wall
    g.line(x + 28, y + 8, x + 28, y + 18, 1);

    // Cobblestone horizontal floor rungs
    g.line(x + 5, y + 25, x + 26, y + 25, 1);
    g.line(x + 9, y + 23, x + 22, y + 23, 2);
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
      'SWISH': 'SWISH',
      'ALARM': 'ALARM'
    };
    try {
      APU.sfx(map[name] || name);
    } catch (_) {}
  },

  // --------------------------------------------------------------------------
  // DUNGEON FLOOR MAP DEFINITIONS (16x16 GRIDS)
  // Wall Types:
  // 0 = Open corridor / floor
  // 1 = Plain stone wall
  // 2 = Carved rune wall / brick wall
  // 3 = Locked Iron Door (requires Golden Key)
  // 4 = Exit Portal / Stairs Down
  // --------------------------------------------------------------------------
  MAP_W: 16,
  MAP_H: 16,

  FLOORS: [
    {
      name: "THE CRYPT",
      desc: "FIND THE GOLDEN KEY TO UNLOCK THE EXIT GATE",
      spawnX: 1.5,
      spawnY: 1.5,
      spawnAngle: 0,
      map: [
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
        1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,
        1,0,0,0,1,0,1,1,1,0,1,0,0,0,0,1,
        1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,
        1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,
        1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,
        1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1,
        1,0,1,0,0,0,1,0,0,0,0,0,0,1,0,1,
        1,0,1,0,0,0,1,1,1,1,1,0,0,3,4,1,
        1,0,1,0,0,0,1,0,0,0,1,0,0,1,1,1,
        1,0,1,1,0,1,1,0,1,0,1,0,0,0,0,1,
        1,0,0,0,0,0,0,0,1,0,1,1,1,1,0,1,
        1,1,1,0,1,1,1,0,1,0,0,0,0,1,0,1,
        1,0,0,0,0,0,1,0,1,1,1,0,0,1,0,1,
        1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
      ],
      entities: [
        { type: 'KEY', x: 13.5, y: 2.5 },
        { type: 'GEM', x: 2.5, y: 14.5 },
        { type: 'GEM', x: 13.5, y: 14.5 },
        { type: 'FLASK', x: 4.5, y: 8.5 },
        { type: 'SKELETON', x: 7.5, y: 3.5, hp: 35, maxHp: 35, speed: 1.3, state: 'ROAM' },
        { type: 'SKELETON', x: 3.5, y: 11.5, hp: 35, maxHp: 35, speed: 1.3, state: 'ROAM' }
      ]
    },
    {
      name: "THE CATACOMBS",
      desc: "WANDERING GHOULS, PILLARS, AND HIDDEN ALCOVES",
      spawnX: 1.5,
      spawnY: 14.5,
      spawnAngle: -Math.PI / 2,
      map: [
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
        1,0,0,0,1,0,0,0,4,0,0,0,1,0,0,1,
        1,0,0,0,1,0,1,1,3,1,1,0,1,0,0,1,
        1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,
        1,1,1,0,1,1,1,0,2,0,1,1,1,0,1,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,1,1,0,1,1,1,0,2,0,1,1,1,0,1,1,
        1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1,
        1,0,0,0,1,0,1,1,1,1,1,0,1,0,0,1,
        1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,
        1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1,
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
      ],
      entities: [
        { type: 'KEY', x: 2.5, y: 2.5 },
        { type: 'GEM', x: 14.5, y: 2.5 },
        { type: 'GEM', x: 8.5, y: 14.5 },
        { type: 'GEM', x: 13.5, y: 5.5 },
        { type: 'FLASK', x: 2.5, y: 12.5 },
        { type: 'FLASK', x: 14.5, y: 12.5 },
        { type: 'SKELETON', x: 4.5, y: 7.5, hp: 40, maxHp: 40, speed: 1.4, state: 'ROAM' },
        { type: 'GHOUL', x: 11.5, y: 7.5, hp: 45, maxHp: 45, speed: 1.7, state: 'ROAM' },
        { type: 'SKELETON', x: 8.5, y: 9.5, hp: 40, maxHp: 40, speed: 1.4, state: 'ROAM' },
        { type: 'GHOUL', x: 8.5, y: 3.5, hp: 45, maxHp: 45, speed: 1.7, state: 'ROAM' }
      ]
    },
    {
      name: "THE SANCTUM",
      desc: "SLAY THE LICH KING TO UNSEAL THE MASTER PORTAL",
      spawnX: 8.5,
      spawnY: 14.5,
      spawnAngle: -Math.PI / 2,
      map: [
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
        1,0,0,0,1,0,0,4,4,0,0,1,0,0,0,1,
        1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,
        1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1,
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,
        1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,
        1,0,0,1,1,1,0,0,0,0,1,1,1,0,0,1,
        1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,
        1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
      ],
      entities: [
        { type: 'GEM', x: 2.5, y: 2.5 },
        { type: 'GEM', x: 13.5, y: 2.5 },
        { type: 'FLASK', x: 2.5, y: 5.5 },
        { type: 'FLASK', x: 13.5, y: 5.5 },
        { type: 'SKELETON', x: 4.5, y: 9.5, hp: 45, maxHp: 45, speed: 1.4, state: 'ROAM' },
        { type: 'SKELETON', x: 11.5, y: 9.5, hp: 45, maxHp: 45, speed: 1.4, state: 'ROAM' },
        { type: 'BOSS', x: 8.5, y: 7.0, hp: 120, maxHp: 120, speed: 1.25, state: 'ROAM' }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------
  init() {
    const vosDiff = (typeof VOS !== 'undefined' && typeof VOS.difficulty === 'number') ? VOS.difficulty : 1;
    this.difficulty = Math.max(0, Math.min(2, vosDiff)); // 0: Easy, 1: Normal, 2: Hard

    this.state = 'TITLE'; // 'TITLE', 'PLAYING', 'FLOOR_CLEAR', 'VICTORY', 'GAMEOVER'
    this.floor = 0; // 0: F1 Crypt, 1: F2 Catacombs, 2: F3 Sanctum
    this.floorsCleared = 0;

    this.hp = 100;
    this.maxHp = 100;
    if (this.difficulty === 0) { this.hp = 120; this.maxHp = 120; }
    else if (this.difficulty === 2) { this.hp = 80; this.maxHp = 80; }

    this.score = 0;
    this.gems = 0;
    this.kills = 0;
    this.time = 0;

    this.hasKey = false;
    this.bossDefeated = false;

    // Viewport Raycaster properties (W=256, H=240; Viewport: 256x188)
    this.numCols = 128; // 128 rays (2 pixels wide each)
    this.zBuffer = new Float32Array(this.numCols);
    this.viewportW = 256;
    this.viewportH = 188;
    this.horizonY = 94;

    // Weapon & combat animation
    this.swingTimer = 0;
    this.walkTimer = 0;
    this.hurtFlash = 0;
    this.notifyText = "";
    this.notifyTimer = 0;

    // Minimap toggle
    this.mapExpanded = false;

    // Explored fog-of-war bitmask (16x16 = 256 cells)
    this.explored = new Uint8Array(256);

    // Touch dragging tracking
    this.lastTouchX = null;
    this.lastTouchY = null;
    this.touchTurnCooldown = 0;

    // Load initial floor
    this.loadFloor(0);
  },

  notify(text, dur = 2.0) {
    this.notifyText = text;
    this.notifyTimer = dur;
  },

  // --------------------------------------------------------------------------
  // FLOOR LOADER
  // --------------------------------------------------------------------------
  loadFloor(floorIdx) {
    this.floor = floorIdx;
    const fData = this.FLOORS[floorIdx];
    this.floorName = fData.name;
    this.floorDesc = fData.desc;

    // Clone grid
    this.map = new Uint8Array(fData.map);
    this.mapW = this.MAP_W;
    this.mapH = this.MAP_H;

    // Reset exploration for new floor
    this.explored = new Uint8Array(256);

    // Player pose
    this.posX = fData.spawnX;
    this.posY = fData.spawnY;
    this.angle = fData.spawnAngle;
    this.updateCameraVectors();

    // Reset key for this floor
    this.hasKey = false;
    if (floorIdx === 2) {
      this.bossDefeated = false;
    }

    // Clone entities with difficulty scaling
    const diffDmg = (this.difficulty === 0 ? 0.75 : this.difficulty === 2 ? 1.35 : 1.0);
    const diffHp = (this.difficulty === 0 ? 0.8 : this.difficulty === 2 ? 1.25 : 1.0);

    this.entities = fData.entities.map(e => {
      const ent = Object.assign({}, e);
      if (ent.hp) {
        ent.hp = Math.round(ent.hp * diffHp);
        ent.maxHp = ent.hp;
      }
      ent.atkCooldown = 0.5 + Math.random() * 0.5;
      ent.hurtTimer = 0;
      ent.alerted = false;
      ent.roamTimer = 1.0 + Math.random() * 2.0;
      ent.roamDirX = (Math.random() - 0.5);
      ent.roamDirY = (Math.random() - 0.5);
      return ent;
    });

    this.notify("FLOOR " + (floorIdx + 1) + ": " + this.floorName);
    this.revealFog();
  },

  updateCameraVectors() {
    this.dirX = Math.cos(this.angle);
    this.dirY = Math.sin(this.angle);
    // Camera plane perpendicular to direction vector (FOV ~66 degrees)
    this.planeX = -Math.sin(this.angle) * 0.66;
    this.planeY = Math.cos(this.angle) * 0.66;
  },

  revealFog() {
    const px = Math.floor(this.posX);
    const py = Math.floor(this.posY);
    const r = 4;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const mx = px + dx;
        const my = py + dy;
        if (mx >= 0 && mx < this.mapW && my >= 0 && my < this.mapH) {
          if (dx * dx + dy * dy <= r * r + 1) {
            this.explored[my * this.mapW + mx] = 1;
          }
        }
      }
    }
  },

  // --------------------------------------------------------------------------
  // SLIDING CIRCLE COLLISION
  // --------------------------------------------------------------------------
  canMoveTo(x, y, r = 0.28) {
    const minX = Math.floor(x - r);
    const maxX = Math.floor(x + r);
    const minY = Math.floor(y - r);
    const maxY = Math.floor(y + r);

    for (let my = minY; my <= maxY; my++) {
      for (let mx = minX; mx <= maxX; mx++) {
        if (mx < 0 || mx >= this.mapW || my < 0 || my >= this.mapH) return false;
        const tile = this.map[my * this.mapW + mx];
        // Tile 1, 2, 3 are solid blocking walls
        // Tile 4 is Exit Portal (walkable trigger)
        if (tile === 1 || tile === 2 || tile === 3) {
          const closestX = Math.max(mx, Math.min(x, mx + 1));
          const closestY = Math.max(my, Math.min(y, my + 1));
          const distX = x - closestX;
          const distY = y - closestY;
          if (distX * distX + distY * distY < r * r) return false;
        }
      }
    }
    return true;
  },

  tryMove(dx, dy) {
    const r = 0.28;
    const newX = this.posX + dx;
    const newY = this.posY + dy;

    if (this.canMoveTo(newX, newY, r)) {
      this.posX = newX;
      this.posY = newY;
      return true;
    } else if (this.canMoveTo(newX, this.posY, r)) {
      this.posX = newX;
      return true;
    } else if (this.canMoveTo(this.posX, newY, r)) {
      this.posY = newY;
      return true;
    }
    return false;
  },

  hasLineOfSight(x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy);
    if (dist <= 0.1) return true;
    const steps = Math.ceil(dist * 5);
    for (let i = 1; i < steps; i++) {
      const tx = x0 + (dx * i) / steps;
      const ty = y0 + (dy * i) / steps;
      const mx = Math.floor(tx);
      const my = Math.floor(ty);
      if (mx < 0 || mx >= this.mapW || my < 0 || my >= this.mapH) return false;
      const tile = this.map[my * this.mapW + mx];
      if (tile === 1 || tile === 2 || tile === 3) return false;
    }
    return true;
  },

  calcScore() {
    const timeBonus = Math.max(0, 3000 - Math.floor(this.time) * 10);
    const diffBonus = (this.difficulty === 2 ? 1.25 : 1.0);
    return Math.floor(((this.floorsCleared * 1000) + (this.gems * 100) + (this.kills * 150) + timeBonus) * diffBonus);
  },

  // --------------------------------------------------------------------------
  // INPUT & GAMEPLAY UPDATE LOOP
  // --------------------------------------------------------------------------
  update(dt) {
    // Clamp delta time to prevent tunneling during lag spikes or extreme speeds
    dt = Math.min(dt, 0.05);

    // Timers
    if (this.notifyTimer > 0) this.notifyTimer -= dt;
    if (this.hurtFlash > 0) this.hurtFlash -= dt;

    // Detect tap / pointer
    let tapX = -1, tapY = -1;
    if (typeof PAD !== 'undefined' && PAD.tapPos) {
      tapX = PAD.tapPos.x;
      tapY = PAD.tapPos.y;
    } else if (typeof TOUCH !== 'undefined' && TOUCH.down) {
      tapX = TOUCH.x;
      tapY = TOUCH.y;
    }

    // STATE: TITLE SCREEN
    if (this.state === 'TITLE') {
      // Gentle camera pan
      this.angle += 0.4 * dt;
      this.updateCameraVectors();

      if ((typeof PAD !== 'undefined' && (PAD.hit('a') || PAD.hit('start'))) || tapX >= 0) {
        this.sfx('CONFIRM');
        this.state = 'PLAYING';
      }
      return;
    }

    // STATE: FLOOR CLEAR TRANSITION
    if (this.state === 'FLOOR_CLEAR') {
      this.transTimer -= dt;
      if (this.transTimer <= 0) {
        if (this.floor < 2) {
          this.loadFloor(this.floor + 1);
          this.state = 'PLAYING';
        } else {
          this.floorsCleared = 3;
          this.state = 'VICTORY';
          this.score = this.calcScore();
          if (typeof SAVE !== 'undefined' && SAVE.setScore) {
            SAVE.setScore(52, this.score);
          }
        }
      }
      return;
    }

    // STATE: VICTORY OR GAME OVER
    if (this.state === 'VICTORY' || this.state === 'GAMEOVER') {
      if ((typeof PAD !== 'undefined' && (PAD.hit('a') || PAD.hit('start') || PAD.hit('b'))) || tapX >= 0) {
        this.sfx('SELECT');
        this.init();
      }
      return;
    }

    // STATE: ACTIVE PLAYING
    this.time += dt;

    // Check Minimap click toggle
    if (tapX >= 204 && tapX <= 252 && tapY >= 4 && tapY <= 52) {
      this.mapExpanded = !this.mapExpanded;
      this.sfx('SELECT');
      tapX = -1; tapY = -1;
    }

    // Movement & Rotation speeds
    const rotSpd = 2.4;
    const moveSpd = 3.2;

    let isMoving = false;

    // D-Pad and Keyboard Controls
    if (typeof PAD !== 'undefined') {
      const bHeld = PAD.state.b;

      // 180-Degree Quick Turn when tapping [B] alone
      if (PAD.hit('b') && !PAD.state.left && !PAD.state.right && !PAD.state.up && !PAD.state.down) {
        this.angle += Math.PI;
        this.updateCameraVectors();
        this.sfx('SELECT');
      }

      // Rotation / Strafing
      if (PAD.state.left) {
        if (bHeld) {
          // Strafe Left
          const sx = -this.planeX * (moveSpd * 0.85) * dt;
          const sy = -this.planeY * (moveSpd * 0.85) * dt;
          if (this.tryMove(sx, sy)) isMoving = true;
        } else {
          // Turn Left
          this.angle -= rotSpd * dt;
          this.updateCameraVectors();
        }
      }
      if (PAD.state.right) {
        if (bHeld) {
          // Strafe Right
          const sx = this.planeX * (moveSpd * 0.85) * dt;
          const sy = this.planeY * (moveSpd * 0.85) * dt;
          if (this.tryMove(sx, sy)) isMoving = true;
        } else {
          // Turn Right
          this.angle += rotSpd * dt;
          this.updateCameraVectors();
        }
      }

      // Forward / Backward
      if (PAD.state.up) {
        const mx = this.dirX * moveSpd * dt;
        const my = this.dirY * moveSpd * dt;
        if (this.tryMove(mx, my)) isMoving = true;
      }
      if (PAD.state.down) {
        const mx = -this.dirX * (moveSpd * 0.7) * dt;
        const my = -this.dirY * (moveSpd * 0.7) * dt;
        if (this.tryMove(mx, my)) isMoving = true;
      }

      // Swipe gestures
      if (PAD.swipe) {
        if (PAD.swipe === 'left') { this.angle -= Math.PI / 4; this.updateCameraVectors(); }
        else if (PAD.swipe === 'right') { this.angle += Math.PI / 4; this.updateCameraVectors(); }
        else if (PAD.swipe === 'down') { this.angle += Math.PI; this.updateCameraVectors(); this.sfx('SELECT'); }
      }
    }

    // Touch screen on-screen buttons
    let pointerDown = false;
    let ptrX = 0, ptrY = 0;
    if (typeof PAD !== 'undefined' && PAD.pointer && PAD.pointer.down) {
      pointerDown = true;
      ptrX = PAD.pointer.x;
      ptrY = PAD.pointer.y;
    } else if (typeof TOUCH !== 'undefined' && TOUCH.down) {
      pointerDown = true;
      ptrX = TOUCH.x;
      ptrY = TOUCH.y;
    }

    let touchAttack = false;
    if (pointerDown) {
      // Left D-pad buttons:
      // Up: x: 16..36, y: 120..144
      if (ptrX >= 16 && ptrX <= 36 && ptrY >= 120 && ptrY <= 144) {
        const mx = this.dirX * moveSpd * dt;
        const my = this.dirY * moveSpd * dt;
        if (this.tryMove(mx, my)) isMoving = true;
      }
      // Down: x: 16..36, y: 156..180
      else if (ptrX >= 16 && ptrX <= 36 && ptrY >= 156 && ptrY <= 180) {
        const mx = -this.dirX * (moveSpd * 0.7) * dt;
        const my = -this.dirY * (moveSpd * 0.7) * dt;
        if (this.tryMove(mx, my)) isMoving = true;
      }
      // Strafe Left: x: 0..20, y: 138..162
      else if (ptrX >= 0 && ptrX <= 20 && ptrY >= 138 && ptrY <= 162) {
        const sx = -this.planeX * (moveSpd * 0.85) * dt;
        const sy = -this.planeY * (moveSpd * 0.85) * dt;
        if (this.tryMove(sx, sy)) isMoving = true;
      }
      // Strafe Right: x: 32..52, y: 138..162
      else if (ptrX >= 32 && ptrX <= 52 && ptrY >= 138 && ptrY <= 162) {
        const sx = this.planeX * (moveSpd * 0.85) * dt;
        const sy = this.planeY * (moveSpd * 0.85) * dt;
        if (this.tryMove(sx, sy)) isMoving = true;
      }
      // Right Turn buttons:
      // Turn Left: x: 188..214, y: 140..170
      else if (ptrX >= 188 && ptrX <= 214 && ptrY >= 140 && ptrY <= 170) {
        this.angle -= rotSpd * dt;
        this.updateCameraVectors();
      }
      // Turn Right: x: 226..252, y: 140..170
      else if (ptrX >= 226 && ptrX <= 252 && ptrY >= 140 && ptrY <= 170) {
        this.angle += rotSpd * dt;
        this.updateCameraVectors();
      }
      // Attack Button: x: 200..252, y: 104..134
      else if (ptrX >= 200 && ptrX <= 252 && ptrY >= 104 && ptrY <= 134) {
        touchAttack = true;
      }
    }

    if (tapX >= 70 && tapX <= 186 && tapY >= 40 && tapY <= 170) {
      touchAttack = true;
    }

    // Walking bob timer
    if (isMoving) {
      this.walkTimer += dt;
      this.revealFog();
    } else {
      this.walkTimer = 0;
    }

    // Weapon Swing Cooldown
    if (this.swingTimer > 0) {
      this.swingTimer -= dt;
    }

    // Attack / Interaction Input: [A] or touch
    const aPressed = (typeof PAD !== 'undefined' && PAD.hit('a')) || touchAttack;
    if (aPressed && this.swingTimer <= 0) {
      this.performAttack();
    }

    // Auto-check for door unlocking when walking directly up to it
    this.checkDoorProximity();

    // Check item pickups (Key, Gems, Flasks)
    this.checkPickups();

    // Check Exit Portal trigger
    this.checkExitPortal();

    // Update Monsters AI
    this.updateMonsters(dt);
  },

  // --------------------------------------------------------------------------
  // INTERACTION & COMBAT
  // --------------------------------------------------------------------------
  performAttack() {
    this.swingTimer = 0.28;
    this.sfx('SWISH');

    // 1. Check if facing locked door to unlock with Key
    const checkDist = 1.25;
    const targetX = Math.floor(this.posX + this.dirX * checkDist);
    const targetY = Math.floor(this.posY + this.dirY * checkDist);

    if (targetX >= 0 && targetX < this.mapW && targetY >= 0 && targetY < this.mapH) {
      if (this.map[targetY * this.mapW + targetX] === 3) {
        if (this.hasKey) {
          this.map[targetY * this.mapW + targetX] = 0; // Open door
          this.hasKey = false;
          this.sfx('CONFIRM');
          this.notify("GATE UNLOCKED!");
          return;
        } else {
          this.sfx('ERROR');
          this.notify("KEY REQUIRED TO UNLOCK!");
          return;
        }
      }
    }

    // 2. Check melee attack against monsters
    let hitMonster = null;
    let closestDist = 1.65; // Melee strike range

    for (let ent of this.entities) {
      if (!ent.hp || ent.hp <= 0) continue;
      const dx = ent.x - this.posX;
      const dy = ent.y - this.posY;
      const dist = Math.hypot(dx, dy);

      if (dist < closestDist) {
        // Dot product to check if monster is within ~50° cone in front
        const dot = (dx * this.dirX + dy * this.dirY) / dist;
        if (dot > 0.6) {
          if (this.hasLineOfSight(this.posX, this.posY, ent.x, ent.y)) {
            closestDist = dist;
            hitMonster = ent;
          }
        }
      }
    }

    if (hitMonster) {
      const dmg = 25 + Math.floor(Math.random() * 15);
      hitMonster.hp -= dmg;
      hitMonster.hurtTimer = 0.25;
      hitMonster.alerted = true;

      // Knockback
      const kbX = hitMonster.x + this.dirX * 0.35;
      const kbY = hitMonster.y + this.dirY * 0.35;
      if (this.canMoveTo(kbX, kbY, 0.28)) {
        hitMonster.x = kbX;
        hitMonster.y = kbY;
      }

      this.sfx('HIT');

      if (hitMonster.hp <= 0) {
        this.sfx('EXPLODE');
        this.kills++;
        if (hitMonster.type === 'BOSS') {
          this.bossDefeated = true;
          this.score += 1000;
          this.notify("★ BOSS SLAIN! PORTAL UNSEALED! ★", 3.5);
          // Drop 3 gems
          this.entities.push({ type: 'GEM', x: hitMonster.x - 0.4, y: hitMonster.y });
          this.entities.push({ type: 'GEM', x: hitMonster.x + 0.4, y: hitMonster.y });
          this.entities.push({ type: 'GEM', x: hitMonster.x, y: hitMonster.y - 0.4 });
        } else {
          this.score += 150;
          this.notify(hitMonster.type + " SLAIN! +150", 1.5);
          // 50% drop rate of gems or flasks
          if (Math.random() < 0.5) {
            if (this.hp < 70 && Math.random() < 0.5) {
              this.entities.push({ type: 'FLASK', x: hitMonster.x, y: hitMonster.y });
            } else {
              this.entities.push({ type: 'GEM', x: hitMonster.x, y: hitMonster.y });
            }
          }
        }
      }
    }
  },

  checkDoorProximity() {
    const checkDist = 0.95;
    const targetX = Math.floor(this.posX + this.dirX * checkDist);
    const targetY = Math.floor(this.posY + this.dirY * checkDist);

    if (targetX >= 0 && targetX < this.mapW && targetY >= 0 && targetY < this.mapH) {
      if (this.map[targetY * this.mapW + targetX] === 3 && this.hasKey) {
        this.map[targetY * this.mapW + targetX] = 0; // Unlock door!
        this.hasKey = false;
        this.sfx('CONFIRM');
        this.notify("GATE UNLOCKED!");
      }
    }
  },

  checkPickups() {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const ent = this.entities[i];
      if (ent.hp !== undefined) continue; // Monsters handled separately

      const dx = ent.x - this.posX;
      const dy = ent.y - this.posY;
      if (Math.hypot(dx, dy) < 0.65) {
        if (ent.type === 'KEY') {
          this.hasKey = true;
          this.sfx('POWERUP');
          this.notify("GOLDEN KEY ACQUIRED!");
          this.entities.splice(i, 1);
        } else if (ent.type === 'GEM') {
          this.gems++;
          this.score += 100;
          this.sfx('COIN');
          this.notify("+100 GEM!");
          this.entities.splice(i, 1);
        } else if (ent.type === 'FLASK') {
          const heal = (this.difficulty === 0 ? 35 : this.difficulty === 2 ? 20 : 25);
          this.hp = Math.min(this.maxHp, this.hp + heal);
          this.sfx('POWERUP');
          this.notify("POTION USED +" + heal + " HP!");
          this.entities.splice(i, 1);
        }
      }
    }
  },

  checkExitPortal() {
    const curTileX = Math.floor(this.posX);
    const curTileY = Math.floor(this.posY);

    if (this.map[curTileY * this.mapW + curTileX] === 4) {
      if (this.floor === 2 && !this.bossDefeated) {
        if (this.notifyTimer <= 0) {
          this.sfx('ERROR');
          this.notify("PORTAL SEALED! SLAY THE BOSS!");
        }
        return;
      }

      // Portal reached!
      this.floorsCleared = this.floor + 1;
      this.sfx('FANFARE');
      this.state = 'FLOOR_CLEAR';
      this.transTimer = 1.8;
      this.notify(this.floor === 2 ? "SANCTUM PURIFIED!" : "FLOOR CLEARED!", 2.0);
    }
  },

  updateMonsters(dt) {
    const diffSpeed = (this.difficulty === 0 ? 0.8 : this.difficulty === 2 ? 1.25 : 1.0);
    const diffDmg = (this.difficulty === 0 ? 0.75 : this.difficulty === 2 ? 1.4 : 1.0);

    for (let ent of this.entities) {
      if (!ent.hp || ent.hp <= 0) continue;

      if (ent.hurtTimer > 0) ent.hurtTimer -= dt;
      if (ent.atkCooldown > 0) ent.atkCooldown -= dt;

      const dx = this.posX - ent.x;
      const dy = this.posY - ent.y;
      const dist = Math.hypot(dx, dy);

      // Line of sight check
      const los = (dist < 8.0 && this.hasLineOfSight(ent.x, ent.y, this.posX, this.posY));
      if (los) ent.alerted = true;

      if (ent.alerted) {
        // Move towards player
        if (dist > 0.85) {
          const step = ent.speed * diffSpeed * dt;
          const nx = (dx / dist) * step;
          const ny = (dy / dist) * step;

          if (this.canMoveTo(ent.x + nx, ent.y + ny, 0.28)) {
            ent.x += nx;
            ent.y += ny;
          } else if (this.canMoveTo(ent.x + nx, ent.y, 0.28)) {
            ent.x += nx;
          } else if (this.canMoveTo(ent.x, ent.y + ny, 0.28)) {
            ent.y += ny;
          }
        }

        // Melee Attack when within striking distance
        if (dist <= 0.95 && ent.atkCooldown <= 0) {
          let baseDmg = 10;
          if (ent.type === 'SKELETON') baseDmg = 9;
          else if (ent.type === 'GHOUL') baseDmg = 13;
          else if (ent.type === 'BOSS') baseDmg = 22;

          const dmg = Math.round(baseDmg * diffDmg);
          this.hp = Math.max(0, this.hp - dmg);
          this.hurtFlash = 0.25;
          this.sfx('HURT');
          ent.atkCooldown = (ent.type === 'BOSS' ? 0.9 : 1.2) / diffSpeed;

          if (this.hp <= 0) {
            this.sfx('EXPLODE');
            this.state = 'GAMEOVER';
            this.score = this.calcScore();
            if (typeof SAVE !== 'undefined' && SAVE.setScore) {
              SAVE.setScore(52, this.score);
            }
          }
        }
      } else {
        // Roaming corridor wanderer
        ent.roamTimer -= dt;
        if (ent.roamTimer <= 0) {
          ent.roamTimer = 2.0 + Math.random() * 2.0;
          const ang = Math.random() * Math.PI * 2;
          ent.roamDirX = Math.cos(ang);
          ent.roamDirY = Math.sin(ang);
        }

        const step = ent.speed * 0.45 * dt;
        const nx = ent.roamDirX * step;
        const ny = ent.roamDirY * step;
        if (this.canMoveTo(ent.x + nx, ent.y + ny, 0.28)) {
          ent.x += nx;
          ent.y += ny;
        } else {
          ent.roamTimer = 0;
        }
      }
    }
  },

  // --------------------------------------------------------------------------
  // RENDERING ENGINE (256x240 CRT PHOSPHOR DISPLAY)
  // --------------------------------------------------------------------------
  render(g) {
    // Clear screen with darkest shade 0
    g.rect(0, 0, 256, 240, 0);

    // 1. Raycaster 3D Viewport (0..188)
    this.renderRaycasterViewport(g);

    // 2. Billboard Sprites (Keys, Gems, Flasks, Monsters)
    this.renderBillboardSprites(g);

    // 3. First-person weapon & attack animations
    this.renderWeapon(g);

    // 4. Crosshair & aiming feedback
    this.renderCrosshair(g);

    // 5. Boss health bar (if boss encounter active)
    this.renderBossHealthBar(g);

    // 6. Damage / Hurt Flash
    if (this.hurtFlash > 0) {
      g.box(0, 0, 256, this.viewportH, 3);
      g.box(1, 1, 254, this.viewportH - 2, 2);
    }

    // 7. Minimap (Compact in top-right, or Expanded in center)
    this.renderMinimap(g);

    // 8. On-Screen Touch Controls Overlay
    this.renderTouchControls(g);

    // 9. Retro HUD Console Bar (188..240)
    this.renderHUD(g);

    // 10. Title / Overlay Screens
    if (this.state === 'TITLE') {
      this.renderTitleScreen(g);
    } else if (this.state === 'FLOOR_CLEAR') {
      this.renderFloorClearScreen(g);
    } else if (this.state === 'VICTORY') {
      this.renderVictoryScreen(g);
    } else if (this.state === 'GAMEOVER') {
      this.renderGameOverScreen(g);
    }
  },

  // --------------------------------------------------------------------------
  // DDA RAYCASTER VIEWPORT (256x188)
  // --------------------------------------------------------------------------
  renderRaycasterViewport(g) {
    const VW = this.viewportW;
    const VH = this.viewportH;
    const HZ = this.horizonY;

    // Floor cobblestone perspective depth lines
    const floorRungs = [96, 100, 106, 114, 126, 142, 164];
    for (let r of floorRungs) {
      g.line(0, r, VW, r, 1);
    }

    // Raycasting across 128 columns (2 pixels per column)
    const numRays = this.numCols;

    for (let i = 0; i < numRays; i++) {
      const cameraX = (2 * i) / (numRays - 1) - 1; // -1 to +1
      const rayDirX = this.dirX + this.planeX * cameraX;
      const rayDirY = this.dirY + this.planeY * cameraX;

      let mapX = Math.floor(this.posX);
      let mapY = Math.floor(this.posY);

      const deltaDistX = Math.abs(1 / (rayDirX || 0.00001));
      const deltaDistY = Math.abs(1 / (rayDirY || 0.00001));

      let stepX, stepY, sideDistX, sideDistY;
      if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (this.posX - mapX) * deltaDistX;
      } else {
        stepX = 1;
        sideDistX = (mapX + 1.0 - this.posX) * deltaDistX;
      }
      if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (this.posY - mapY) * deltaDistY;
      } else {
        stepY = 1;
        sideDistY = (mapY + 1.0 - this.posY) * deltaDistY;
      }

      let hit = 0, side = 0, wallType = 1;
      while (hit === 0) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0; // East/West wall
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1; // North/South wall
        }

        if (mapX < 0 || mapX >= this.mapW || mapY < 0 || mapY >= this.mapH) {
          hit = 1;
          wallType = 1;
          break;
        }

        const tile = this.map[mapY * this.mapW + mapX];
        if (tile > 0) {
          hit = 1;
          wallType = tile;
        }
      }

      // Perpendicular wall distance prevents fisheye distortion
      let perpWallDist;
      if (side === 0) {
        perpWallDist = (mapX - this.posX + (1 - stepX) / 2) / (rayDirX || 0.00001);
      } else {
        perpWallDist = (mapY - this.posY + (1 - stepY) / 2) / (rayDirY || 0.00001);
      }
      if (perpWallDist < 0.05) perpWallDist = 0.05;

      // Store in depth buffer for billboard sprite occlusion
      this.zBuffer[i] = perpWallDist;

      // Wall column slice bounds
      const lineHeight = Math.floor(VH / perpWallDist);
      const drawStart = Math.max(0, Math.floor(-lineHeight / 2 + HZ));
      const drawEnd = Math.min(VH - 1, Math.floor(lineHeight / 2 + HZ));
      const colX = i * 2;

      // Distance Fog Shading (0..3) & N/S vs E/W face contrast
      let baseShade;
      if (perpWallDist < 2.8) {
        baseShade = (side === 0) ? 3 : 2;
      } else if (perpWallDist < 5.6) {
        baseShade = (side === 0) ? 2 : 1;
      } else if (perpWallDist < 9.0) {
        baseShade = 1;
      } else {
        baseShade = 0;
      }

      // Horizontal texture coordinate (wallX)
      let wallX = (side === 0) ? (this.posY + perpWallDist * rayDirY) : (this.posX + perpWallDist * rayDirX);
      wallX -= Math.floor(wallX);

      // Render Wall Column based on wall type
      if (wallType === 1) {
        // Plain Stone Wall
        g.rect(colX, drawStart, 2, drawEnd - drawStart + 1, baseShade);
        // Stone block mortar seams
        if (baseShade >= 2 && perpWallDist < 5.5) {
          if (wallX < 0.06 || (wallX > 0.47 && wallX < 0.53)) {
            g.rect(colX, drawStart, 2, drawEnd - drawStart + 1, Math.max(0, baseShade - 1));
          }
          // Horizontal mortar lines
          const h1 = Math.floor(drawStart + (drawEnd - drawStart) * 0.33);
          const h2 = Math.floor(drawStart + (drawEnd - drawStart) * 0.66);
          g.px(colX, h1, Math.max(0, baseShade - 1));
          g.px(colX + 1, h1, Math.max(0, baseShade - 1));
          g.px(colX, h2, Math.max(0, baseShade - 1));
          g.px(colX + 1, h2, Math.max(0, baseShade - 1));
        }
      } else if (wallType === 2) {
        // Carved Rune Wall
        g.rect(colX, drawStart, 2, drawEnd - drawStart + 1, baseShade);
        // Glowing carved arcane rune glyph in center
        if (wallX > 0.35 && wallX < 0.65 && perpWallDist < 7.0) {
          const midY = Math.floor((drawStart + drawEnd) / 2);
          const runeH = Math.max(2, Math.floor(lineHeight * 0.15));
          g.rect(colX, midY - runeH, 2, runeH * 2, 3);
        }
      } else if (wallType === 3) {
        // Locked Iron Door
        g.rect(colX, drawStart, 2, drawEnd - drawStart + 1, Math.max(0, baseShade - 1));
        // Vertical Iron Bars
        if ((wallX > 0.20 && wallX < 0.28) || (wallX > 0.44 && wallX < 0.56) || (wallX > 0.72 && wallX < 0.80)) {
          g.rect(colX, drawStart, 2, drawEnd - drawStart + 1, baseShade);
        }
        // Center Keyhole Plate
        if (wallX > 0.42 && wallX < 0.58 && perpWallDist < 6.5) {
          const midY = Math.floor((drawStart + drawEnd) / 2);
          const plateH = Math.max(2, Math.floor(lineHeight * 0.12));
          g.rect(colX, midY - plateH, 2, plateH * 2, 3);
          g.px(colX, midY, 0); // keyhole slot
        }
      } else if (wallType === 4) {
        // Exit Portal / Stairs Down
        g.rect(colX, drawStart, 2, drawEnd - drawStart + 1, 1);
        // Swirling magical vortex
        const pulse = Math.sin(this.time * 6 + wallX * 12);
        const portalShade = pulse > 0 ? 3 : 2;
        if (wallX > 0.15 && wallX < 0.85) {
          g.rect(colX, drawStart + 2, 2, drawEnd - drawStart - 3, portalShade);
        }
      }
    }
  },

  // --------------------------------------------------------------------------
  // 2.5D BILLBOARD SPRITES
  // Distance-sorted rendering with depth buffer occlusion
  // --------------------------------------------------------------------------
  renderBillboardSprites(g) {
    const VW = this.viewportW;
    const VH = this.viewportH;
    const HZ = this.horizonY;

    // Calculate squared distance to player for all active entities
    const activeList = [];
    for (let ent of this.entities) {
      if (ent.hp !== undefined && ent.hp <= 0) continue; // dead
      const dx = ent.x - this.posX;
      const dy = ent.y - this.posY;
      ent.distSq = dx * dx + dy * dy;
      activeList.push(ent);
    }

    // Sort furthest to closest (back-to-front painter's algorithm)
    activeList.sort((a, b) => b.distSq - a.distSq);

    const invDet = 1.0 / (this.planeX * this.dirY - this.dirX * this.planeY || 0.00001);

    for (let ent of activeList) {
      const spriteX = ent.x - this.posX;
      const spriteY = ent.y - this.posY;

      // Transform with inverse camera matrix
      const transformX = invDet * (this.dirY * spriteX - this.dirX * spriteY);
      const transformY = invDet * (-this.planeY * spriteX + this.planeX * spriteY);

      if (transformY <= 0.2) continue; // Behind camera or clipping near plane

      const spriteScreenX = Math.floor((VW / 2) * (1 + transformX / transformY));
      const scale = (ent.type === 'BOSS') ? 1.35 : 0.85;
      const spriteH = Math.abs(Math.floor(VH / transformY * scale));
      const spriteW = spriteH;

      const drawStartY = Math.max(0, Math.floor(-spriteH / 2 + HZ + (VH * 0.45) / transformY));
      const drawEndY = Math.min(VH - 1, Math.floor(spriteH / 2 + HZ + (VH * 0.45) / transformY));
      const drawStartX = Math.max(0, Math.floor(-spriteW / 2 + spriteScreenX));
      const drawEndX = Math.min(VW - 1, Math.floor(spriteW / 2 + spriteScreenX));

      if (drawStartX >= VW || drawEndX < 0 || drawStartY >= VH || drawEndY < 0) continue;

      // Check depth buffer for visibility
      const midCol = Math.floor(spriteScreenX / 2);
      if (midCol >= 0 && midCol < this.numCols && transformY > this.zBuffer[midCol] + 0.3) {
        continue; // Fully occluded by wall
      }

      // Draw Billboard Sprite by Type
      this.drawBillboardEntity(g, ent, spriteScreenX, drawStartX, drawEndX, drawStartY, drawEndY, spriteW, spriteH, transformY);
    }
  },

  drawBillboardEntity(g, ent, centerX, startX, endX, startY, endY, w, h, dist) {
    const bob = Math.sin(this.time * 5 + ent.x) * (h * 0.08);

    for (let x = startX; x <= endX; x += 2) {
      const colIdx = Math.floor(x / 2);
      if (colIdx < 0 || colIdx >= this.numCols || dist > this.zBuffer[colIdx]) continue;

      const u = (x - (centerX - w / 2)) / w; // 0.0 to 1.0

      if (ent.type === 'KEY') {
        // Golden Key: loop ring at top, stem, teeth
        const ky = startY + bob;
        const kh = endY - startY;
        if (u >= 0.35 && u <= 0.65) {
          g.rect(x, ky + kh * 0.15, 2, kh * 0.3, 3);
          g.rect(x, ky + kh * 0.45, 2, kh * 0.45, 3);
        }
        if (u >= 0.65 && u <= 0.85) {
          g.rect(x, ky + kh * 0.65, 2, kh * 0.15, 3);
        }
      } else if (ent.type === 'GEM') {
        // Shimmering Emerald/Ruby Gem: diamond faceted shape
        const gy = startY + bob;
        const gh = endY - startY;
        const midY = gy + gh * 0.5;
        const dFromCenter = Math.abs(u - 0.5) * 2; // 0 at center, 1 at edge
        if (dFromCenter <= 0.8) {
          const halfSpan = (gh * 0.45) * (1 - dFromCenter);
          g.rect(x, midY - halfSpan, 2, halfSpan * 2, u < 0.5 ? 3 : 2);
        }
      } else if (ent.type === 'FLASK') {
        // Health Flask: round vial with potion fluid
        const fy = startY;
        const fh = endY - startY;
        if (u >= 0.42 && u <= 0.58) {
          g.rect(x, fy + fh * 0.1, 2, fh * 0.25, 2); // neck
        }
        const dFromCenter = Math.abs(u - 0.5) * 2;
        if (dFromCenter <= 0.75) {
          const halfSpan = (fh * 0.35) * Math.sqrt(Math.max(0, 1 - dFromCenter * dFromCenter));
          g.rect(x, fy + fh * 0.65 - halfSpan, 2, halfSpan * 2, 3);
          g.px(x, fy + fh * 0.65, 0); // bubble
        }
      } else if (ent.type === 'SKELETON') {
        // Skeleton Warrior: skull, ribs, sword
        const sy = startY;
        const sh = endY - startY;
        const color = ent.hurtTimer > 0 ? 3 : (dist < 5.0 ? 3 : 2);

        // Skull
        if (u >= 0.38 && u <= 0.62) {
          g.rect(x, sy + sh * 0.05, 2, sh * 0.22, color);
          if (dist < 4.0) g.px(x, sy + sh * 0.12, 0); // dark eye sockets
        }
        // Ribs & spine
        if (u >= 0.32 && u <= 0.68) {
          g.rect(x, sy + sh * 0.30, 2, sh * 0.08, color);
          g.rect(x, sy + sh * 0.42, 2, sh * 0.08, color);
        }
        if (u >= 0.46 && u <= 0.54) {
          g.rect(x, sy + sh * 0.27, 2, sh * 0.35, color); // spine
        }
        // Legs
        if ((u >= 0.34 && u <= 0.44) || (u >= 0.56 && u <= 0.66)) {
          g.rect(x, sy + sh * 0.62, 2, sh * 0.36, color);
        }
        // Sword blade in right hand
        if (u >= 0.70 && u <= 0.82) {
          g.rect(x, sy + sh * 0.15, 2, sh * 0.50, 3);
        }
      } else if (ent.type === 'GHOUL') {
        // Lurking Ghoul: hunched beast with claws
        const gy = startY;
        const gh = endY - startY;
        const color = ent.hurtTimer > 0 ? 3 : 2;

        if (u >= 0.30 && u <= 0.70) {
          g.rect(x, gy + gh * 0.18, 2, gh * 0.55, color);
        }
        // Claws
        if ((u >= 0.15 && u <= 0.28) || (u >= 0.72 && u <= 0.85)) {
          g.rect(x, gy + gh * 0.40, 2, gh * 0.35, 3);
        }
      } else if (ent.type === 'BOSS') {
        // Lich King / Minotaur Boss: giant horned figure with radiant staff
        const by = startY;
        const bh = endY - startY;
        const color = ent.hurtTimer > 0 ? 3 : (dist < 6.0 ? 3 : 2);

        // Horned Crown
        if ((u >= 0.22 && u <= 0.32) || (u >= 0.68 && u <= 0.78)) {
          g.rect(x, by + bh * 0.02, 2, bh * 0.18, 3);
        }
        // Skull & Head
        if (u >= 0.34 && u <= 0.66) {
          g.rect(x, by + bh * 0.12, 2, bh * 0.20, color);
          if (dist < 6.0) g.px(x, by + bh * 0.18, 0); // glowing void eyes
        }
        // Broad Robe & Armor
        if (u >= 0.24 && u <= 0.76) {
          g.rect(x, by + bh * 0.32, 2, bh * 0.64, color);
        }
        // Staff of Power in hand
        if (u >= 0.82 && u <= 0.90) {
          g.rect(x, by, 2, bh * 0.95, 2);
          g.rect(x, by - 4, 2, 8, 3); // top radiant orb
        }
      }
    }
  },

  // --------------------------------------------------------------------------
  // FIRST-PERSON WEAPON & ATTACK ANIMATION
  // --------------------------------------------------------------------------
  renderWeapon(g) {
    const HZ = this.horizonY;
    const VH = this.viewportH;

    // Bobbing motion when moving
    const bobX = Math.cos(this.walkTimer * 8) * 4;
    const bobY = Math.abs(Math.sin(this.walkTimer * 8)) * 5;

    let baseSwordX = 148 + bobX;
    let baseSwordY = 142 + bobY;

    // Attack Swing Animation
    if (this.swingTimer > 0) {
      const p = 1.0 - (this.swingTimer / 0.28); // 0.0 to 1.0
      if (p < 0.3) {
        // Windup: pulls back to the right
        baseSwordX += p * 30;
        baseSwordY += p * 15;
      } else if (p < 0.75) {
        // Diagonal Slash: sweeps across from right to left
        const slashP = (p - 0.3) / 0.45;
        baseSwordX = 178 - slashP * 90;
        baseSwordY = 157 - slashP * 30;

        // Glowing motion trail arc
        g.line(baseSwordX + 30, baseSwordY - 40, baseSwordX - 25, baseSwordY + 10, 3);
        g.line(baseSwordX + 28, baseSwordY - 38, baseSwordX - 23, baseSwordY + 12, 2);
      } else {
        // Recovery: returns to idle
        const recP = (p - 0.75) / 0.25;
        baseSwordX = 88 + recP * 60;
        baseSwordY = 127 + recP * 15;
      }
    }

    // Draw First-Person Steel Broadsword
    // Hilt & Pommel
    g.rect(baseSwordX + 16, baseSwordY + 36, 6, 12, 1);
    g.rect(baseSwordX + 14, baseSwordY + 48, 10, 4, 2); // pommel
    // Crossguard
    g.rect(baseSwordX - 4, baseSwordY + 32, 46, 6, 2);
    g.rect(baseSwordX + 17, baseSwordY + 30, 4, 10, 3);

    // Double-edged Steel Blade pointing up-left
    g.line(baseSwordX + 16, baseSwordY + 30, baseSwordX + 2, baseSwordY - 44, 2);
    g.line(baseSwordX + 18, baseSwordY + 30, baseSwordX + 4, baseSwordY - 46, 3); // bright edge
    g.line(baseSwordX + 20, baseSwordY + 30, baseSwordX + 6, baseSwordY - 44, 2);
    g.px(baseSwordX + 4, baseSwordY - 47, 3); // tip
  },

  // --------------------------------------------------------------------------
  // CROSSHAIR & AIMING
  // --------------------------------------------------------------------------
  renderCrosshair(g) {
    const cx = 128;
    const cy = this.horizonY;

    // Check if aiming at enemy within reach
    let inRange = false;
    for (let ent of this.entities) {
      if (!ent.hp || ent.hp <= 0) continue;
      const dx = ent.x - this.posX;
      const dy = ent.y - this.posY;
      const dist = Math.hypot(dx, dy);
      if (dist < 1.65) {
        const dot = (dx * this.dirX + dy * this.dirY) / dist;
        if (dot > 0.6) { inRange = true; break; }
      }
    }

    const c = inRange ? 3 : 1;
    g.px(cx, cy, c);
    g.line(cx - 4, cy, cx - 2, cy, c);
    g.line(cx + 2, cy, cx + 4, cy, c);
    g.line(cx, cy - 4, cx, cy - 2, c);
    g.line(cx, cy + 2, cx, cy + 4, c);
  },

  // --------------------------------------------------------------------------
  // BOSS HEALTH BAR (WHEN FIGHTING BOSS)
  // --------------------------------------------------------------------------
  renderBossHealthBar(g) {
    if (this.floor !== 2) return;
    const boss = this.entities.find(e => e.type === 'BOSS');
    if (!boss || boss.hp <= 0) return;

    const dx = boss.x - this.posX;
    const dy = boss.y - this.posY;
    if (Math.hypot(dx, dy) > 8.5 && !boss.alerted) return;

    // Draw Boss HP Bar at Top of Viewport
    g.box(48, 6, 160, 11, 1);
    g.rect(49, 7, 158, 9, 0);

    const ratio = Math.max(0, boss.hp / boss.maxHp);
    g.rect(51, 9, Math.floor(154 * ratio), 5, 3);
    g.textC("LICH KING - " + boss.hp + "/" + boss.maxHp, 19, 3);
  },

  // --------------------------------------------------------------------------
  // MINIMAP (FOG OF WAR, PLAYER POSITION, CONE OF SIGHT)
  // --------------------------------------------------------------------------
  renderMinimap(g) {
    if (this.mapExpanded) {
      // Expanded Tactical Map in center
      const ox = 48, oy = 16, sz = 10;
      g.rect(ox - 4, oy - 4, 168, 168, 0);
      g.box(ox - 4, oy - 4, 168, 168, 3);

      for (let my = 0; my < this.mapH; my++) {
        for (let mx = 0; mx < this.mapW; mx++) {
          const idx = my * this.mapW + mx;
          if (this.explored[idx]) {
            const tile = this.map[idx];
            if (tile === 1) g.rect(ox + mx * sz, oy + my * sz, sz, sz, 1);
            else if (tile === 2) g.rect(ox + mx * sz, oy + my * sz, sz, sz, 2);
            else if (tile === 3) g.rect(ox + mx * sz, oy + my * sz, sz, sz, 3);
            else if (tile === 4) g.rect(ox + mx * sz, oy + my * sz, sz, sz, 3);
          }
        }
      }

      // Player marker
      const px = ox + this.posX * sz;
      const py = oy + this.posY * sz;
      g.disc(px, py, 3, 3);
      g.line(px, py, px + this.dirX * 8, py + this.dirY * 8, 3);
      g.textC("TACTICAL MAP (TAP TO CLOSE)", 174, 3);
      return;
    }

    // Compact Minimap in top-right corner (48x48)
    const mx0 = 204, my0 = 4, sz = 3;
    g.rect(mx0, my0, 48, 48, 0);
    g.box(mx0, my0, 48, 48, 1);

    for (let my = 0; my < this.mapH; my++) {
      for (let mx = 0; mx < this.mapW; mx++) {
        const idx = my * this.mapW + mx;
        if (this.explored[idx]) {
          const tile = this.map[idx];
          if (tile === 1) g.rect(mx0 + mx * sz, my0 + my * sz, sz, sz, 1);
          else if (tile === 2) g.rect(mx0 + mx * sz, my0 + my * sz, sz, sz, 2);
          else if (tile === 3) g.rect(mx0 + mx * sz, my0 + my * sz, sz, sz, 3); // Locked door
          else if (tile === 4) {
            // Pulsing exit portal dot
            const pulse = (Math.floor(this.time * 4) % 2 === 0);
            g.rect(mx0 + mx * sz, my0 + my * sz, sz, sz, pulse ? 3 : 2);
          }
        }
      }
    }

    // Discovered Items / Monsters dots on Minimap
    for (let ent of this.entities) {
      const ex = Math.floor(ent.x);
      const ey = Math.floor(ent.y);
      if (this.explored[ey * this.mapW + ex]) {
        if (ent.type === 'KEY') g.px(mx0 + ent.x * sz, my0 + ent.y * sz, 3);
        else if (ent.type === 'GEM') g.px(mx0 + ent.x * sz, my0 + ent.y * sz, 2);
        else if (ent.hp !== undefined && ent.hp > 0 && ent.alerted) {
          g.px(mx0 + ent.x * sz, my0 + ent.y * sz, (Math.floor(this.time * 6) % 2 ? 3 : 0));
        }
      }
    }

    // Player position dot and directional cone
    const px = mx0 + this.posX * sz;
    const py = my0 + this.posY * sz;
    g.px(px, py, 3);
    g.px(px + 1, py, 3);
    g.px(px, py + 1, 3);
    g.px(px + 1, py + 1, 3);
    g.line(px, py, px + this.dirX * 4, py + this.dirY * 4, 3);
  },

  // --------------------------------------------------------------------------
  // ON-SCREEN TOUCH CONTROLS OVERLAY
  // --------------------------------------------------------------------------
  renderTouchControls(g) {
    // Subtle D-pad hints on lower-left
    g.box(16, 120, 20, 24, 1); g.text("▲", 22, 128, 1);
    g.box(16, 156, 20, 24, 1); g.text("▼", 22, 164, 1);
    g.box(0, 138, 20, 24, 1);  g.text("◄", 6, 146, 1);
    g.box(32, 138, 20, 24, 1); g.text("►", 38, 146, 1);

    // Turn and Attack on lower-right
    g.box(188, 140, 26, 26, 1); g.text("L", 198, 148, 1);
    g.box(226, 140, 26, 26, 1); g.text("R", 236, 148, 1);

    // Large Attack Button
    g.box(200, 106, 52, 28, 2);
    g.text("ATK", 214, 116, 3);
  },

  // --------------------------------------------------------------------------
  // RETRO CRT HUD CONSOLE BAR (188..240)
  // --------------------------------------------------------------------------
  renderHUD(g) {
    const y0 = 188;

    // Top border separator line
    g.line(0, y0, 256, y0, 2);
    g.line(0, y0 + 1, 256, y0 + 1, 1);

    // Background rect
    g.rect(0, y0 + 2, 256, 50, 0);

    // Row 1: Floor & Score (y = 192)
    g.text("F" + (this.floor + 1) + ": " + this.floorName, 8, 192, 3);
    g.textR("SCORE: " + this.score, 248, 192, 3);

    // Row 2: Player HP Bar & Key Status (y = 203)
    g.text("HP", 8, 204, 2);
    g.box(24, 203, 76, 7, 1);
    const hpRatio = Math.max(0, Math.min(1, this.hp / this.maxHp));
    const barW = Math.floor(72 * hpRatio);
    g.rect(26, 205, barW, 3, this.hp > 25 ? 3 : 2);
    g.text(this.hp + "/" + this.maxHp, 104, 204, 3);

    // Key Status
    if (this.hasKey) {
      g.text("[KEY: GOLD]", 176, 204, 3);
    } else {
      g.text("[KEY: --- ]", 176, 204, 1);
    }

    // Row 3: Elapsed Time, Gems, Foes (y = 215)
    const mins = Math.floor(this.time / 60);
    const secs = Math.floor(this.time % 60);
    const timeStr = (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
    g.text("TIME: " + timeStr, 8, 215, 2);
    g.text("GEMS: " + this.gems, 96, 215, 3);
    g.text("FOES: " + this.kills, 176, 215, 2);

    // Row 4: Notification or Control Hints (y = 227)
    if (this.notifyTimer > 0) {
      g.textC("★ " + this.notifyText + " ★", 228, 3);
    } else {
      g.textC("[A] ATTACK / OPEN   [B] 180° / STRAFE", 228, 1);
    }
  },

  // --------------------------------------------------------------------------
  // TITLE SCREEN
  // --------------------------------------------------------------------------
  renderTitleScreen(g) {
    g.rect(20, 24, 216, 150, 0);
    g.box(20, 24, 216, 150, 3);
    g.box(22, 26, 212, 146, 1);

    g.textC("DUNGEON 3D", 36, 3, 2);
    g.textC("RETRO RAYCASTER LABYRINTH", 54, 2, 1);

    g.line(32, 66, 224, 66, 2);

    g.textC("F1: THE CRYPT", 74, 3);
    g.textC("F2: THE CATACOMBS", 86, 3);
    g.textC("F3: THE SANCTUM (BOSS)", 98, 3);

    g.line(32, 110, 224, 110, 2);

    g.textC("D-PAD: MOVE / TURN  [A]: ATK", 118, 2);
    g.textC("[B]: 180-TURN / HOLD TO STRAFE", 128, 2);

    const blink = (Math.floor(this.angle * 4) % 2 === 0);
    if (blink) {
      g.textC("PRESS [A] OR TOUCH TO ENTER", 146, 3);
    }
  },

  // --------------------------------------------------------------------------
  // FLOOR CLEAR SCREEN
  // --------------------------------------------------------------------------
  renderFloorClearScreen(g) {
    g.rect(30, 48, 196, 92, 0);
    g.box(30, 48, 196, 92, 3);
    g.textC("★ " + this.floorName + " CLEARED! ★", 64, 3);
    g.textC("DESCENDING DEEPER INTO DARKNESS...", 84, 2);
    g.textC("PREPARE YOUR WEAPON!", 104, 3);
  },

  // --------------------------------------------------------------------------
  // VICTORY SCREEN
  // --------------------------------------------------------------------------
  renderVictoryScreen(g) {
    g.rect(20, 20, 216, 160, 0);
    g.box(20, 20, 216, 160, 3);
    g.box(22, 22, 212, 156, 1);

    g.textC("★ VICTORY! ★", 32, 3, 2);
    g.textC("DUNGEON MASTER ESCAPED!", 50, 3);

    g.line(32, 62, 224, 62, 2);

    g.text("FLOORS CLEARED : 3 / 3", 40, 72, 3);
    g.text("FOES DEFEATED  : " + this.kills, 40, 84, 2);
    g.text("GEMS COLLECTED : " + this.gems, 40, 96, 3);

    const mins = Math.floor(this.time / 60);
    const secs = Math.floor(this.time % 60);
    g.text("TIME TAKEN     : " + mins + "M " + secs + "S", 40, 108, 2);

    g.line(32, 122, 224, 122, 2);
    g.textC("FINAL SCORE: " + this.score, 130, 3);

    const blink = (Math.floor(this.time * 3) % 2 === 0);
    if (blink) {
      g.textC("PRESS [A] TO PLAY AGAIN", 152, 3);
    }
  },

  // --------------------------------------------------------------------------
  // GAME OVER SCREEN
  // --------------------------------------------------------------------------
  renderGameOverScreen(g) {
    g.rect(24, 30, 208, 140, 0);
    g.box(24, 30, 208, 140, 3);
    g.box(26, 32, 204, 136, 1);

    g.textC("YOU PERISHED", 44, 3, 2);
    g.textC("THE DUNGEON CLAIMS YOUR SOUL", 62, 2);

    g.line(36, 76, 220, 76, 2);

    g.textC("REACHED: F" + (this.floor + 1) + " " + this.floorName, 88, 2);
    g.textC("GEMS: " + this.gems + "  |  KILLS: " + this.kills, 102, 2);
    g.textC("SCORE: " + this.score, 118, 3);

    const blink = (Math.floor(this.time * 3) % 2 === 0);
    if (blink) {
      g.textC("PRESS [A] TO RETRY", 142, 3);
    }
  },

  // --------------------------------------------------------------------------
  // PERSISTENCE (SAVE & LOAD)
  // --------------------------------------------------------------------------
  save() {
    return {
      state: this.state,
      floor: this.floor,
      floorsCleared: this.floorsCleared,
      posX: this.posX,
      posY: this.posY,
      angle: this.angle,
      hp: this.hp,
      maxHp: this.maxHp,
      score: this.score,
      gems: this.gems,
      kills: this.kills,
      time: this.time,
      hasKey: this.hasKey,
      bossDefeated: this.bossDefeated,
      difficulty: this.difficulty
    };
  },

  load(data) {
    if (!data) return;
    this.floor = (data.floor !== undefined) ? data.floor : 0;
    this.loadFloor(this.floor);
    this.state = data.state || 'PLAYING';
    this.floorsCleared = data.floorsCleared || 0;
    if (data.posX !== undefined) this.posX = data.posX;
    if (data.posY !== undefined) this.posY = data.posY;
    if (data.angle !== undefined) {
      this.angle = data.angle;
      this.updateCameraVectors();
    }
    this.hp = data.hp || 100;
    this.maxHp = data.maxHp || 100;
    this.score = data.score || 0;
    this.gems = data.gems || 0;
    this.kills = data.kills || 0;
    this.time = data.time || 0;
    this.hasKey = !!data.hasKey;
    this.bossDefeated = !!data.bossDefeated;
    if (data.difficulty !== undefined) this.difficulty = data.difficulty;
  }
};
