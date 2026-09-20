// js/cartridges/cart_012_sokoban.js
// ============================================================================
// Cartridge #012: SOKOBAN
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 12. SOKOBAN
CARTS[12] = {
  id: 12,
  name: "SOKOBAN",
  genre: 1,
  scoreLabel: "LEVEL",
  desc: "PUSH CRATES ONTO TARGETS. [B] UNDO, [R] RESET, SWIPE OR TAP TO MOVE.",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);

    // Brick wall segment (top left)
    g.rect(x + 2, y + 2, 10, 8, 1);
    g.line(x + 2, y + 2, x + 11, y + 2, 3);
    g.line(x + 2, y + 6, x + 11, y + 6, 0);
    g.line(x + 6, y + 2, x + 6, y + 5, 0);

    // Target pediment (bottom right)
    g.circle(x + 22, y + 22, 5, 2);
    g.line(x + 16, y + 22, x + 28, y + 22, 2);
    g.line(x + 22, y + 16, x + 22, y + 28, 2);
    g.px(x + 22, y + 22, 3);

    // Wooden crate with X-brace
    g.rect(x + 15, y + 6, 12, 12, 2);
    g.line(x + 15, y + 6, x + 26, y + 6, 3);
    g.line(x + 15, y + 6, x + 15, y + 17, 3);
    g.line(x + 15, y + 17, x + 26, y + 17, 0);
    g.line(x + 26, y + 6, x + 26, y + 17, 0);
    g.rect(x + 17, y + 8, 8, 8, 1);
    g.line(x + 17, y + 8, x + 24, y + 15, 2);
    g.line(x + 24, y + 8, x + 17, y + 15, 2);

    // Mini warehouse keeper facing right
    g.disc(x + 8, y + 18, 3, 3);
    g.line(x + 8, y + 16, x + 12, y + 16, 2); // Cap visor
    g.rect(x + 6, y + 21, 5, 5, 2); // Overalls
    g.rect(x + 6, y + 26, 2, 3, 1);
    g.rect(x + 9, y + 26, 2, 3, 1);
  },

  // 10 Authentic, verified solvable classic levels of progressive complexity
  LEVELS: [
    {
      name: "FIRST STEP",
      map: [
        "######",
        "#    #",
        "# @$ #",
        "#  . #",
        "#    #",
        "######"
      ]
    },
    {
      name: "CORNER DEPOT",
      map: [
        "######",
        "#@   #",
        "# $$ #",
        "# .. #",
        "#    #",
        "######"
      ]
    },
    {
      name: "CARGO ALLEY",
      map: [
        "#######",
        "#  @  #",
        "# $ $ #",
        "#  #  #",
        "# . . #",
        "#######"
      ]
    },
    {
      name: "CROSSWAY",
      map: [
        "  #####",
        "###   #",
        "# $ $ #",
        "# #.#.#",
        "#  @  #",
        "#######"
      ]
    },
    {
      name: "MICRO DOCK",
      map: [
        "########",
        "#  @   #",
        "# $$ # #",
        "#  #   #",
        "# ..   #",
        "########"
      ]
    },
    {
      name: "INNER SANCTUM",
      map: [
        "#######",
        "#  .  #",
        "# $#$ #",
        "#. @ .#",
        "# $#$ #",
        "#  .  #",
        "#######"
      ]
    },
    {
      name: "SWITCHYARD",
      map: [
        "########",
        "#      #",
        "# .$$@ #",
        "# . #  #",
        "#  $$  #",
        "#  ..  #",
        "########"
      ]
    },
    {
      name: "CENTRAL DOCK",
      map: [
        "#########",
        "#   .   #",
        "# $ # $ #",
        "#  ...  #",
        "# $ # $ #",
        "#   @   #",
        "#########"
      ]
    },
    {
      name: "PILLAR MAZE",
      map: [
        "#########",
        "#   #   #",
        "# $ . $ #",
        "# #.#.# #",
        "# $ . $ #",
        "#   @   #",
        "#########"
      ]
    },
    {
      name: "MASTER DEPOT",
      map: [
        "##########",
        "#    #   #",
        "# $$ # . #",
        "# .. # $ #",
        "## ### . #",
        "#    $   #",
        "# @  #   #",
        "##########"
      ]
    }
  ],

  init() {
    this.lvl = 1;
    this.pulseTimer = 0;
    this.loadLevel(this.lvl);
  },

  loadLevel(l) {
    if (l < 1) l = 1;
    if (l > this.LEVELS.length) l = this.LEVELS.length;
    this.lvl = l;

    const data = this.LEVELS[this.lvl - 1];
    this.levelName = data.name;
    const rawMap = data.map;
    this.mapH = rawMap.length;
    this.mapW = Math.max(...rawMap.map(r => r.length));

    this.walls = new Set();
    this.targets = [];
    this.crates = [];
    this.px = 0;
    this.py = 0;
    this.facing = 'down';

    for (let y = 0; y < this.mapH; y++) {
      const row = rawMap[y];
      for (let x = 0; x < this.mapW; x++) {
        const ch = x < row.length ? row[x] : ' ';
        if (ch === '#') {
          this.walls.add(`${x},${y}`);
        } else if (ch === '.') {
          this.targets.push([x, y]);
        } else if (ch === '$') {
          this.crates.push([x, y]);
        } else if (ch === '*') {
          this.targets.push([x, y]);
          this.crates.push([x, y]);
        } else if (ch === '@') {
          this.px = x;
          this.py = y;
        } else if (ch === '+') {
          this.targets.push([x, y]);
          this.px = x;
          this.py = y;
        }
      }
    }

    // Flood-fill interior floor cells reachable from player
    this.floor = new Set();
    const q = [[this.px, this.py]];
    this.floor.add(`${this.px},${this.py}`);
    while (q.length > 0) {
      const [cx, cy] = q.pop();
      const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [dx, dy] of dirs) {
        const nx = cx + dx, ny = cy + dy;
        const key = `${nx},${ny}`;
        if (nx >= 0 && nx < this.mapW && ny >= 0 && ny < this.mapH) {
          if (!this.walls.has(key) && !this.floor.has(key)) {
            this.floor.add(key);
            q.push([nx, ny]);
          }
        }
      }
    }

    this.moves = 0;
    this.pushes = 0;
    this.history = []; // Unlimited deep undo stack
    this.won = false;
    this.winAnimTimer = 0;
    this.stepAnim = 0;
    this.walkPath = null;
    this.walkTimer = 0;
    this.undoFlash = 0;
    this.pulseTimer = 0;
  },

  isWall(x, y) {
    return this.walls.has(`${x},${y}`);
  },

  isFloor(x, y) {
    return this.floor.has(`${x},${y}`);
  },

  getCrateAt(x, y) {
    for (let i = 0; i < this.crates.length; i++) {
      if (this.crates[i][0] === x && this.crates[i][1] === y) return i;
    }
    return -1;
  },

  isTarget(x, y) {
    for (let i = 0; i < this.targets.length; i++) {
      if (this.targets[i][0] === x && this.targets[i][1] === y) return true;
    }
    return false;
  },

  allTargetsCovered() {
    if (this.targets.length === 0) return false;
    for (let i = 0; i < this.targets.length; i++) {
      const [tx, ty] = this.targets[i];
      if (this.getCrateAt(tx, ty) < 0) return false;
    }
    return true;
  },

  getRecord() {
    if (typeof SAVE === 'undefined') return { moves: 0, pushes: 0 };
    const per = SAVE.getPersistent(this.id) || {};
    const bestMoves = per.bestMoves || {};
    const bestPushes = per.bestPushes || {};
    const k = String(this.lvl);
    return {
      moves: bestMoves[k] || 0,
      pushes: bestPushes[k] || 0
    };
  },

  saveRecord() {
    if (typeof SAVE === 'undefined') return;
    const per = SAVE.getPersistent(this.id) || {};
    const bestMoves = per.bestMoves || {};
    const bestPushes = per.bestPushes || {};
    const k = String(this.lvl);
    if (!bestMoves[k] || this.moves < bestMoves[k]) {
      bestMoves[k] = this.moves;
    }
    if (!bestPushes[k] || this.pushes < bestPushes[k]) {
      bestPushes[k] = this.pushes;
    }
    per.bestMoves = bestMoves;
    per.bestPushes = bestPushes;
    SAVE.setPersistent(this.id, per);
  },

  step(dx, dy) {
    if (dx === 0 && dy === 0) return false;

    // Update facing direction
    if (dx < 0) this.facing = 'left';
    else if (dx > 0) this.facing = 'right';
    else if (dy < 0) this.facing = 'up';
    else if (dy > 0) this.facing = 'down';

    const nx = this.px + dx;
    const ny = this.py + dy;

    // Boundary & wall check
    if (nx < 0 || nx >= this.mapW || ny < 0 || ny >= this.mapH || this.isWall(nx, ny)) {
      APU.sfx('DENY');
      return false;
    }

    const crateIdx = this.getCrateAt(nx, ny);
    if (crateIdx >= 0) {
      // Attempting to push crate
      const cnx = nx + dx;
      const cny = ny + dy;

      if (cnx < 0 || cnx >= this.mapW || cny < 0 || cny >= this.mapH || this.isWall(cnx, cny) || this.getCrateAt(cnx, cny) >= 0) {
        APU.sfx('DENY');
        return false;
      }

      // Valid push: store undo state
      this.history.push({
        px: this.px,
        py: this.py,
        facing: this.facing,
        crates: this.crates.map(c => [c[0], c[1]]),
        moves: this.moves,
        pushes: this.pushes
      });

      this.crates[crateIdx] = [cnx, cny];
      this.px = nx;
      this.py = ny;
      this.moves++;
      this.pushes++;
      this.stepAnim = 1 - this.stepAnim;

      if (this.isTarget(cnx, cny)) {
        APU.sfx('POWER');
      } else {
        APU.sfx('HIT');
      }

      // Win check
      if (this.allTargetsCovered()) {
        this.won = true;
        this.winAnimTimer = 0;
        this.walkPath = null;
        APU.sfx('LEVELUP');
        this.saveRecord();
        if (typeof SAVE !== 'undefined') {
          const highest = Math.max(SAVE.getScore(this.id) || 1, Math.min(this.LEVELS.length, this.lvl + 1));
          SAVE.setScore(this.id, highest);
        }
      }
      return true;
    } else {
      // Normal walk step on empty floor
      this.history.push({
        px: this.px,
        py: this.py,
        facing: this.facing,
        crates: this.crates.map(c => [c[0], c[1]]),
        moves: this.moves,
        pushes: this.pushes
      });

      this.px = nx;
      this.py = ny;
      this.moves++;
      this.stepAnim = 1 - this.stepAnim;
      APU.sfx('TICK');
      return true;
    }
  },

  undo() {
    if (this.history.length === 0) {
      APU.sfx('DENY');
      return false;
    }
    const prev = this.history.pop();
    this.px = prev.px;
    this.py = prev.py;
    this.facing = prev.facing;
    this.crates = prev.crates;
    this.moves = prev.moves;
    this.pushes = prev.pushes;
    this.won = false;
    this.walkPath = null;
    this.stepAnim = 1 - this.stepAnim;
    this.undoFlash = 0.2;
    APU.sfx('UI_BACK');
    return true;
  },

  resetLevel() {
    APU.sfx('UI_BACK');
    this.loadLevel(this.lvl);
  },

  nextLevel() {
    this.lvl = (this.lvl % this.LEVELS.length) + 1;
    APU.sfx('UI_MOVE');
    this.loadLevel(this.lvl);
  },

  prevLevel() {
    this.lvl = ((this.lvl - 2 + this.LEVELS.length) % this.LEVELS.length) + 1;
    APU.sfx('UI_MOVE');
    this.loadLevel(this.lvl);
  },

  // Tap-to-walk: BFS pathfinding to reachable empty floor tile
  findWalkPath(targetX, targetY) {
    if (this.isWall(targetX, targetY) || this.getCrateAt(targetX, targetY) >= 0) return null;
    if (!this.isFloor(targetX, targetY)) return null;
    if (targetX === this.px && targetY === this.py) return null;

    const queue = [{ x: this.px, y: this.py, path: [] }];
    const visited = new Set();
    visited.add(`${this.px},${this.py}`);

    const dirs = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 }
    ];

    while (queue.length > 0) {
      const cur = queue.shift();
      if (cur.x === targetX && cur.y === targetY) {
        return cur.path;
      }
      for (const d of dirs) {
        const nx = cur.x + d.dx;
        const ny = cur.y + d.dy;
        const key = `${nx},${ny}`;
        if (nx >= 0 && nx < this.mapW && ny >= 0 && ny < this.mapH && !visited.has(key)) {
          if (!this.isWall(nx, ny) && this.getCrateAt(nx, ny) < 0 && this.isFloor(nx, ny)) {
            visited.add(key);
            queue.push({
              x: nx,
              y: ny,
              path: [...cur.path, d]
            });
          }
        }
      }
    }
    return null;
  },

  update(dt) {
    dt = typeof dt === 'number' && !isNaN(dt) ? dt : 1 / 60;
    this.pulseTimer = (this.pulseTimer || 0) + dt;
    if (this.undoFlash > 0) {
      this.undoFlash = Math.max(0, this.undoFlash - dt);
    }

    // Level clear victory state
    if (this.won) {
      this.winAnimTimer += dt;
      if (PAD.hit('a') || PAD.hit('start')) {
        this.nextLevel();
        return;
      }
      if (PAD.hit('b')) {
        this.undo();
        return;
      }
      if (PAD.hit('select')) {
        this.resetLevel();
        return;
      }
      if (PAD.tapPos) {
        // Modal button clicks: Next Puzzle or Undo
        const tx = PAD.tapPos.x, ty = PAD.tapPos.y;
        if (tx >= 50 && tx <= 206 && ty >= 148 && ty <= 172) {
          this.nextLevel();
          return;
        }
        if (tx >= 50 && tx <= 206 && ty >= 176 && ty <= 196) {
          this.undo();
          return;
        }
      }
      return;
    }

    // Undo action [B]
    if (PAD.hit('b')) {
      this.undo();
      return;
    }

    // Reset action [Select]
    if (PAD.hit('select')) {
      this.resetLevel();
      return;
    }

    // Swipe gestures
    let swDx = 0, swDy = 0;
    if (PAD.swipe === 'up') swDy = -1;
    else if (PAD.swipe === 'down') swDy = 1;
    else if (PAD.swipe === 'left') swDx = -1;
    else if (PAD.swipe === 'right') swDx = 1;

    if (swDx !== 0 || swDy !== 0) {
      this.walkPath = null;
      this.step(swDx, swDy);
      return;
    }

    // Touch Tap handling
    if (PAD.tapPos) {
      const tx = PAD.tapPos.x;
      const ty = PAD.tapPos.y;

      // Top bar navigation buttons: [◀] and [▶]
      if (ty >= 2 && ty <= 22) {
        if (tx >= 4 && tx <= 26) {
          this.prevLevel();
          return;
        }
        if (tx >= 78 && tx <= 100) {
          this.nextLevel();
          return;
        }
      }

      // Bottom bar buttons: [B] UNDO and [R] RESET
      if (ty >= 216 && ty <= 238) {
        if (tx >= 8 && tx <= 66) {
          this.undo();
          return;
        }
        if (tx >= 72 && tx <= 134) {
          this.resetLevel();
          return;
        }
      }

      // Check board touch
      const sz = Math.min(26, Math.floor(220 / this.mapW), Math.floor(174 / this.mapH));
      const ox = Math.floor((256 - this.mapW * sz) / 2);
      const oy = Math.floor(24 + (184 - this.mapH * sz) / 2);

      const cellX = Math.floor((tx - ox) / sz);
      const cellY = Math.floor((ty - oy) / sz);

      if (cellX >= 0 && cellX < this.mapW && cellY >= 0 && cellY < this.mapH) {
        const dx = cellX - this.px;
        const dy = cellY - this.py;

        if (Math.abs(dx) + Math.abs(dy) === 1) {
          // Direct step or push on adjacent tile
          this.walkPath = null;
          this.step(dx, dy);
          return;
        } else if (this.isFloor(cellX, cellY) && !this.isWall(cellX, cellY) && this.getCrateAt(cellX, cellY) < 0) {
          // Tap-to-walk to empty floor cell
          const path = this.findWalkPath(cellX, cellY);
          if (path && path.length > 0) {
            this.walkPath = path;
            this.walkTimer = 0; // Trigger first step immediately
          }
        }
      }
    }

    // D-Pad navigation
    let dx = 0, dy = 0;
    if (PAD.hit('left')) dx = -1;
    else if (PAD.hit('right')) dx = 1;
    else if (PAD.hit('up')) dy = -1;
    else if (PAD.hit('down')) dy = 1;

    if (dx !== 0 || dy !== 0) {
      this.walkPath = null;
      this.step(dx, dy);
      return;
    }

    // Process queued tap-to-walk steps
    if (this.walkPath && this.walkPath.length > 0) {
      this.walkTimer -= dt;
      if (this.walkTimer <= 0) {
        const nextStep = this.walkPath.shift();
        const success = this.step(nextStep.dx, nextStep.dy);
        if (!success || this.won) {
          this.walkPath = null;
        } else {
          this.walkTimer = 0.08;
        }
      }
    }
  },

  drawWall(g, x, y, sz) {
    g.rect(x, y, sz, sz, 1);
    // 3D Bevel highlight
    g.line(x, y, x + sz - 1, y, 3);
    g.line(x, y, x, y + sz - 1, 3);
    // 3D Bevel shadow
    g.line(x, y + sz - 1, x + sz - 1, y + sz - 1, 0);
    g.line(x + sz - 1, y, x + sz - 1, y + sz - 1, 0);

    const midY = y + Math.floor(sz / 2);
    g.line(x + 1, midY, x + sz - 2, midY, 0);

    const midX = x + Math.floor(sz / 2);
    g.line(midX, y + 1, midX, midY - 1, 0);

    const q1X = x + Math.floor(sz / 4);
    const q3X = x + Math.floor((sz * 3) / 4);
    g.line(q1X, midY + 1, q1X, y + sz - 2, 0);
    g.line(q3X, midY + 1, q3X, y + sz - 2, 0);

    g.px(x + 2, y + 2, 2);
    g.px(midX + 2, y + 2, 2);
    g.px(q1X + 2, midY + 2, 2);
  },

  drawFloor(g, x, y, sz) {
    g.rect(x, y, sz, sz, 0);
    g.px(x, y, 1);
    g.px(x + sz - 1, y, 1);
    g.px(x, y + sz - 1, 1);
    g.px(x + sz - 1, y + sz - 1, 1);
    const cx = x + Math.floor(sz / 2);
    const cy = y + Math.floor(sz / 2);
    g.px(cx, cy, 1);
  },

  drawTarget(g, x, y, sz) {
    const cx = x + Math.floor(sz / 2);
    const cy = y + Math.floor(sz / 2);
    const r = Math.max(3, Math.floor(sz / 4));

    g.circle(cx, cy, r, 2);
    g.line(cx - r - 2, cy, cx + r + 2, cy, 2);
    g.line(cx, cy - r - 2, cx, cy + r + 2, 2);
    g.px(cx, cy, 3);
    g.px(cx - r, cy - r, 3);
    g.px(cx + r, cy - r, 3);
    g.px(cx - r, cy + r, 3);
    g.px(cx + r, cy + r, 3);
  },

  drawCrate(g, x, y, sz, onTarget) {
    const pad = 2;
    const bx = x + pad, by = y + pad;
    const bw = sz - pad * 2, bh = sz - pad * 2;

    if (!onTarget) {
      // Standard wooden cargo crate with diagonal X-brace
      g.rect(bx, by, bw, bh, 2);
      g.line(bx, by, bx + bw - 1, by, 3);
      g.line(bx, by, bx, by + bh - 1, 3);
      g.line(bx, by + bh - 1, bx + bw - 1, by + bh - 1, 0);
      g.line(bx + bw - 1, by, bx + bw - 1, by + bh - 1, 0);

      const innerPad = 2;
      const ix = bx + innerPad, iy = by + innerPad;
      const iw = bw - innerPad * 2, ih = bh - innerPad * 2;
      g.rect(ix, iy, iw, ih, 1);

      g.line(ix, iy, ix + iw - 1, iy + ih - 1, 2);
      g.line(ix + iw - 1, iy, ix, iy + ih - 1, 2);

      g.px(ix, iy, 3);
      g.px(ix + iw - 1, iy, 3);
      g.px(ix, iy + ih - 1, 3);
      g.px(ix + iw - 1, iy + ih - 1, 3);
    } else {
      // Glowing / reinforced crate on target
      const pulse = Math.floor(this.pulseTimer * 8) % 2 === 0;
      g.rect(bx, by, bw, bh, 3);
      g.line(bx, by + bh - 1, bx + bw - 1, by + bh - 1, 1);
      g.line(bx + bw - 1, by, bx + bw - 1, by + bh - 1, 1);

      const innerPad = 2;
      const ix = bx + innerPad, iy = by + innerPad;
      const iw = bw - innerPad * 2, ih = bh - innerPad * 2;
      g.rect(ix, iy, iw, ih, 2);

      g.line(ix, iy, ix + iw - 1, iy + ih - 1, 3);
      g.line(ix + iw - 1, iy, ix, iy + ih - 1, 3);

      const cx = bx + Math.floor(bw / 2);
      const cy = by + Math.floor(bh / 2);
      g.disc(cx, cy, 2, 3);
      g.px(cx, cy, pulse ? 0 : 2);
    }
  },

  drawPlayer(g, x, y, sz, facing, stepAnim) {
    const cx = x + Math.floor(sz / 2);
    const cy = y + Math.floor(sz / 2);

    // Ground shadow
    g.disc(cx, y + sz - 3, Math.max(3, Math.floor(sz / 5)), 0);

    const hy = cy - 3;

    if (facing === 'down') {
      g.rect(cx - 3, hy - 4, 7, 3, 2);
      g.line(cx - 4, hy - 2, cx + 4, hy - 2, 3); // Cap brim
      g.rect(cx - 3, hy - 1, 7, 3, 3);           // Face
      g.px(cx - 2, hy, 0);                       // Eyes
      g.px(cx + 2, hy, 0);
      g.rect(cx - 4, cy + 1, 9, 5, 2);           // Overalls
      g.line(cx - 2, cy + 1, cx - 2, cy + 5, 3); // Suspenders
      g.line(cx + 2, cy + 1, cx + 2, cy + 5, 3);
      g.line(cx - 3, cy + 5, cx + 3, cy + 5, 0); // Belt
      if (stepAnim === 0) {
        g.rect(cx - 4, cy + 6, 3, 3, 1);
        g.rect(cx + 1, cy + 6, 3, 3, 1);
        g.line(cx - 4, cy + 8, cx - 2, cy + 8, 3);
        g.line(cx + 1, cy + 8, cx + 3, cy + 8, 3);
      } else {
        g.rect(cx - 4, cy + 5, 3, 4, 1);
        g.rect(cx + 1, cy + 6, 3, 3, 1);
        g.line(cx - 4, cy + 8, cx - 2, cy + 8, 3);
        g.line(cx + 1, cy + 8, cx + 3, cy + 8, 3);
      }
    } else if (facing === 'up') {
      g.rect(cx - 4, hy - 4, 9, 4, 2);           // Cap back
      g.line(cx - 3, hy - 4, cx + 3, hy - 4, 3);
      g.rect(cx - 3, hy, 7, 2, 1);               // Hair
      g.rect(cx - 4, cy + 1, 9, 5, 2);           // Overalls back
      g.line(cx - 2, cy + 1, cx + 2, cy + 5, 3); // Crossed suspenders
      g.line(cx + 2, cy + 1, cx - 2, cy + 5, 3);
      g.line(cx - 3, cy + 5, cx + 3, cy + 5, 0); // Belt
      if (stepAnim === 0) {
        g.rect(cx - 4, cy + 6, 3, 3, 1);
        g.rect(cx + 1, cy + 6, 3, 3, 1);
      } else {
        g.rect(cx - 4, cy + 6, 3, 3, 1);
        g.rect(cx + 1, cy + 5, 3, 4, 1);
      }
    } else if (facing === 'left') {
      g.rect(cx - 3, hy - 4, 6, 3, 2);           // Cap
      g.line(cx - 5, hy - 2, cx - 1, hy - 2, 3); // Visor pointing left
      g.rect(cx - 3, hy - 1, 5, 3, 3);           // Face
      g.px(cx - 2, hy, 0);                       // Eye
      g.rect(cx - 3, cy + 1, 7, 5, 2);           // Overalls
      g.line(cx - 1, cy + 1, cx - 1, cy + 5, 3); // Suspenders
      g.line(cx - 3, cy + 3, cx - 4, cy + 4, 3); // Hand forward
      g.line(cx - 2, cy + 5, cx + 2, cy + 5, 0); // Belt
      if (stepAnim === 0) {
        g.rect(cx - 3, cy + 6, 3, 3, 1);
        g.rect(cx, cy + 6, 3, 3, 1);
        g.line(cx - 4, cy + 8, cx - 1, cy + 8, 3);
      } else {
        g.rect(cx - 4, cy + 6, 3, 3, 1);
        g.rect(cx + 1, cy + 5, 3, 4, 1);
        g.line(cx - 5, cy + 8, cx - 2, cy + 8, 3);
      }
    } else if (facing === 'right') {
      g.rect(cx - 3, hy - 4, 6, 3, 2);           // Cap
      g.line(cx + 1, hy - 2, cx + 5, hy - 2, 3); // Visor pointing right
      g.rect(cx - 2, hy - 1, 5, 3, 3);           // Face
      g.px(cx + 2, hy, 0);                       // Eye
      g.rect(cx - 4, cy + 1, 7, 5, 2);           // Overalls
      g.line(cx + 1, cy + 1, cx + 1, cy + 5, 3); // Suspenders
      g.line(cx + 3, cy + 3, cx + 4, cy + 4, 3); // Hand forward
      g.line(cx - 2, cy + 5, cx + 2, cy + 5, 0); // Belt
      if (stepAnim === 0) {
        g.rect(cx - 3, cy + 6, 3, 3, 1);
        g.rect(cx, cy + 6, 3, 3, 1);
        g.line(cx + 1, cy + 8, cx + 4, cy + 8, 3);
      } else {
        g.rect(cx - 4, cy + 5, 3, 4, 1);
        g.rect(cx + 1, cy + 6, 3, 3, 1);
        g.line(cx + 2, cy + 8, cx + 5, cy + 8, 3);
      }
    }
  },

  render(g) {
    g.clear(0);

    // Top Header Bar
    g.rect(0, 0, 256, 22, 1);
    g.line(0, 22, 256, 22, 2);

    // Prev / Next Level touch buttons
    g.box(4, 3, 22, 16, 2);
    g.text("◀", 11, 8, 3);

    g.text(`LVL ${this.lvl}/${this.LEVELS.length}`, 30, 8, 3);

    g.box(78, 3, 22, 16, 2);
    g.text("▶", 85, 8, 3);

    // Current move and push stats
    g.text(`MVS:${this.moves}`, 110, 8, 3);
    g.text(`PUSH:${this.pushes}`, 162, 8, 2);

    // Level subtitle / name
    g.textR(this.levelName, 250, 8, 2);

    // Board calculations & centering
    const sz = Math.min(26, Math.floor(220 / this.mapW), Math.floor(174 / this.mapH));
    const ox = Math.floor((256 - this.mapW * sz) / 2);
    const oy = Math.floor(24 + (184 - this.mapH * sz) / 2);

    // Warehouse background frame
    g.box(ox - 2, oy - 2, this.mapW * sz + 4, this.mapH * sz + 4, 1);

    // Pass 1: Floor and Walls
    for (let y = 0; y < this.mapH; y++) {
      for (let x = 0; x < this.mapW; x++) {
        const bx = ox + x * sz;
        const by = oy + y * sz;
        if (this.isWall(x, y)) {
          this.drawWall(g, bx, by, sz);
        } else if (this.isFloor(x, y)) {
          this.drawFloor(g, bx, by, sz);
        }
      }
    }

    // Pass 2: Targets
    for (let i = 0; i < this.targets.length; i++) {
      const [tx, ty] = this.targets[i];
      const bx = ox + tx * sz;
      const by = oy + ty * sz;
      this.drawTarget(g, bx, by, sz);
    }

    // Pass 3: Crates
    for (let i = 0; i < this.crates.length; i++) {
      const [cx, cy] = this.crates[i];
      const bx = ox + cx * sz;
      const by = oy + cy * sz;
      const onTarget = this.isTarget(cx, cy);
      this.drawCrate(g, bx, by, sz, onTarget);
    }

    // Pass 4: Warehouse Keeper
    const pxPos = ox + this.px * sz;
    const pyPos = oy + this.py * sz;
    this.drawPlayer(g, pxPos, pyPos, sz, this.facing, this.stepAnim);

    // Bottom Bar (Touch Buttons & Best Record)
    g.rect(0, 216, 256, 24, 1);
    g.line(0, 216, 256, 216, 2);

    // Touch Button: [B] UNDO
    const undoFlashColor = this.undoFlash > 0 ? 3 : 2;
    g.box(8, 219, 58, 17, undoFlashColor);
    g.text("[B] UNDO", 13, 224, this.history.length > 0 ? 3 : 1);

    // Touch Button: [R] RESET
    g.box(72, 219, 62, 17, 2);
    g.text("[R] RESET", 77, 224, 3);

    // Minimum moves record
    const rec = this.getRecord();
    if (rec.moves > 0) {
      g.textR(`BEST: ${rec.moves}M / ${rec.pushes}P`, 248, 224, 2);
    } else {
      g.textR("BEST: --", 248, 224, 1);
    }

    // Level Cleared Victory Overlay
    if (this.won) {
      // Translucent dither overlay
      g.dither(36, 68, 184, 134, 0, 1);
      g.box(36, 68, 184, 134, 3);
      g.box(38, 70, 180, 130, 2);

      g.textC("STAGE CLEARED!", 80, 3);
      g.line(54, 92, 202, 92, 2);

      g.textC(`STAGE ${this.lvl}: ${this.levelName}`, 98, 2);
      g.textC(`MOVES: ${this.moves}  (BEST: ${rec.moves || this.moves})`, 114, 3);
      g.textC(`PUSHES: ${this.pushes}  (BEST: ${rec.pushes || this.pushes})`, 128, 2);

      // Interactive on-screen touch buttons for modal
      g.box(50, 148, 156, 22, 3);
      g.textC("[A] NEXT PUZZLE", 155, 3);

      g.box(50, 176, 156, 18, 2);
      g.textC("[B] UNDO / REPLAY", 181, 2);
    }
  }
};
