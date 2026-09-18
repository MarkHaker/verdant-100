// js/cartridges/cart_010_pac_maze.js
// ============================================================================
// Cartridge #010: PAC-MAZE
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// Authentic 19x19 Symmetrical Arcade Maze Layout
const PAC_MAZE_MAP = [
  "###################", // 0
  "#o.......#.......o#", // 1
  "#.##.###.#.###.##.#", // 2
  "#.................#", // 3
  "#.##.#.#####.#.##.#", // 4
  "#....#...#...#....#", // 5
  "####.### # ###.####", // 6
  "####.#       #.####", // 7
  "####.# ##-## #.####", // 8
  "====.  #GGG#  .====", // 9: Tunnel on left/right, Ghost House center
  "####.# ##### #.####", // 10
  "####.#   F   #.####", // 11: Fruit spawn below ghost house
  "####.# ##### #.####", // 12
  "#........#........#", // 13
  "#.##.###.#.###.##.#", // 14
  "#o.#.....P.....#.o#", // 15: Power pellets & Player start
  "##.#.#.#####.#.#.##", // 16
  "#....#...#...#....#", // 17
  "###################"  // 18
];

const PAC_MAZE_W = 19;
const PAC_MAZE_H = 19;

// 10. PAC-MAZE
CARTS[10] = {
  id: 10,
  name: "PAC-MAZE",
  genre: 0,
  scoreLabel: "PTS",
  desc: "NAVIGATE LABYRINTH, MUNCH DOTS & POWER PELLETS TO CHASE 4 CLEVER GHOSTS!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Maze walls
    g.rect(x + 3, y + 3, 26, 2, 1);
    g.rect(x + 3, y + 27, 26, 2, 1);
    g.rect(x + 3, y + 3, 2, 26, 1);
    g.rect(x + 27, y + 3, 2, 26, 1);
    // Pacman with open chomp mouth
    const pcx = x + 14, pcy = y + 16;
    g.disc(pcx, pcy, 6, 3);
    g.tri(pcx, pcy, pcx + 8, pcy - 4, pcx + 8, pcy + 4, 0);
    // Dot
    g.disc(x + 23, y + 16, 2, 3);
    // Ghost (Blinky)
    const gcx = x + 7, gcy = y + 16;
    g.disc(gcx, gcy - 2, 3, 2);
    g.rect(gcx - 3, gcy - 2, 7, 4, 2);
    g.px(gcx - 2, gcy - 2, 3);
    g.px(gcx + 1, gcy - 2, 3);
    g.px(gcx - 1, gcy - 2, 0);
    g.px(gcx + 2, gcy - 2, 0);
    g.px(gcx - 3, gcy + 2, 2);
    g.px(gcx - 1, gcy + 2, 2);
    g.px(gcx + 1, gcy + 2, 2);
    g.px(gcx + 3, gcy + 2, 2);
  },

  isPassable(x, y, isGhost = false, isEyes = false) {
    if (y === 9 && (x < 0 || x >= PAC_MAZE_W)) return true; // Wrap tunnel
    if (x < 0 || x >= PAC_MAZE_W || y < 0 || y >= PAC_MAZE_H) return false;
    const ch = PAC_MAZE_MAP[y][x];
    if (ch === '#') return false;
    if (ch === 'G') return isGhost;
    if (ch === '-') return isEyes || isGhost;
    return true;
  },

  init() {
    this.round = (this.round && this.won) ? (this.round + 1) : 1;
    this.ox = 23;
    this.oy = 15;
    this.sz = 11; // 19 * 11 = 209 px (centered on 256x240 screen)

    // Player state
    this.px = 9.0;
    this.py = 15.0;
    this.dir = [0, 0];
    this.nextDir = [-1, 0];
    this.facingAngle = Math.PI; // Looking left initially
    this.speed = 5.2 + Math.min(1.2, (this.round - 1) * 0.2); // Tiles per sec
    this.animTimer = 0;
    this.mouthAngle = 0;

    // Game lifecycle state
    if (!this.won) {
      this.score = 0;
      this.lives = 3;
    }
    this.over = false;
    this.won = false;
    this.state = 'ready'; // 'ready', 'play', 'dying', 'round_clear'
    this.readyTimer = 1.6;
    this.dyingTimer = 0;

    // High score
    this.highScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? (SAVE.getScore(this.id) || 0) : 0;
    if (this.score > this.highScore) this.highScore = this.score;

    // Dots and Power Pellets
    this.dots = new Uint8Array(PAC_MAZE_W * PAC_MAZE_H);
    this.totalDots = 0;
    this.dotsEaten = 0;
    this.powerPellets = [];

    for (let y = 0; y < PAC_MAZE_H; y++) {
      for (let x = 0; x < PAC_MAZE_W; x++) {
        const ch = PAC_MAZE_MAP[y][x];
        if (ch === '.' || ch === 'P' || ch === 'F') {
          this.dots[y * PAC_MAZE_W + x] = 1;
          this.totalDots++;
        } else if (ch === 'o') {
          this.powerPellets.push({ x, y, active: true });
        }
      }
    }

    // 4 Classic Ghosts with authentic personalities
    // Blinky: Aggressive direct chaser (Red / Bright Phosphor)
    // Pinky: Ambush flanker (Pink / Smooth Green)
    // Inky: Tactical vector flanker (Cyan / Dithered)
    // Clyde: Fickle coward (Orange / Shaded)
    this.ghosts = [
      {
        name: 'Blinky',
        x: 9.0, y: 7.0,
        homeX: 9.0, homeY: 7.0,
        dir: [-1, 0],
        state: 'chase', // 'inside', 'leaving', 'chase', 'scatter', 'frightened', 'eyes'
        scatter: [17, 1], // Top-right corner
        color: 3,
        accent: 3,
        exitTimer: 0,
        speed: 4.7
      },
      {
        name: 'Pinky',
        x: 9.0, y: 9.0,
        homeX: 9.0, homeY: 9.0,
        dir: [0, -1],
        state: 'inside',
        scatter: [1, 1], // Top-left corner
        color: 2,
        accent: 3,
        exitTimer: 1.2,
        speed: 4.5
      },
      {
        name: 'Inky',
        x: 8.0, y: 9.0,
        homeX: 8.0, homeY: 9.0,
        dir: [0, 1],
        state: 'inside',
        scatter: [17, 17], // Bottom-right corner
        color: 2,
        accent: 1,
        exitTimer: 4.0,
        speed: 4.4
      },
      {
        name: 'Clyde',
        x: 10.0, y: 9.0,
        homeX: 10.0, homeY: 9.0,
        dir: [0, 1],
        state: 'inside',
        scatter: [1, 17], // Bottom-left corner
        color: 2,
        accent: 2,
        exitTimer: 8.0,
        speed: 4.3
      }
    ];

    // Fruit setup
    this.fruitSpawned = false;
    this.fruitActive = false;
    this.fruitTimer = 0;
    this.fruitType = Math.min(4, this.round - 1); // 0: Cherry (100), 1: Strawberry (300), 2: Orange (500), 3: Apple (700), 4: Melon (1000)
    this.fruitScores = [100, 300, 500, 700, 1000];
    this.fruitNames = ["CHERRY", "STRAWBERRY", "ORANGE", "APPLE", "MELON"];
    this.fruitsCollected = this.fruitsCollected || [];

    // Precompute BFS distance field for ghost eyes returning to ghost house (9, 8)
    this.eyesDistField = new Int16Array(PAC_MAZE_W * PAC_MAZE_H);
    this.eyesDistField.fill(999);
    const eq = [[9, 8, 0]];
    this.eyesDistField[8 * PAC_MAZE_W + 9] = 0;
    while (eq.length > 0) {
      const [cx, cy, d] = eq.shift();
      for (const [dx, dy] of [[0, -1], [-1, 0], [0, 1], [1, 0]]) {
        let nx = cx + dx, ny = cy + dy;
        if (ny === 9) {
          if (nx < 0) nx = PAC_MAZE_W - 1;
          else if (nx >= PAC_MAZE_W) nx = 0;
        }
        if (this.isPassable(nx, ny, true, true)) {
          const idx = ny * PAC_MAZE_W + nx;
          if (this.eyesDistField[idx] > d + 1) {
            this.eyesDistField[idx] = d + 1;
            eq.push([nx, ny, d + 1]);
          }
        }
      }
    }

    // Frightened & Combo system
    this.powerTimer = 0;
    this.ghostCombo = 0;
    this.popups = []; // Floating score indicators: { text, x, y, timer }
    this.scatterMode = false;
    this.modeTimer = 0;
    this.sirenTimer = 0;
    this.wakaTone = false;
  },

  resetPositions() {
    this.px = 9.0;
    this.py = 15.0;
    this.dir = [0, 0];
    this.nextDir = [-1, 0];
    this.facingAngle = Math.PI;

    this.ghosts[0].x = 9.0; this.ghosts[0].y = 7.0; this.ghosts[0].dir = [-1, 0]; this.ghosts[0].state = 'chase';
    this.ghosts[1].x = 9.0; this.ghosts[1].y = 9.0; this.ghosts[1].dir = [0, -1]; this.ghosts[1].state = 'inside'; this.ghosts[1].exitTimer = 1.0;
    this.ghosts[2].x = 8.0; this.ghosts[2].y = 9.0; this.ghosts[2].dir = [0, 1];  this.ghosts[2].state = 'inside'; this.ghosts[2].exitTimer = 3.5;
    this.ghosts[3].x = 10.0; this.ghosts[3].y = 9.0; this.ghosts[3].dir = [0, 1]; this.ghosts[3].state = 'inside'; this.ghosts[3].exitTimer = 6.5;

    this.powerTimer = 0;
    this.ghostCombo = 0;
  },

  getGhostTarget(g) {
    if (g.state === 'eyes') {
      return [9, 8]; // Return to door of ghost house
    }
    if (g.state === 'frightened') {
      return null; // Random wandering
    }
    if (this.scatterMode || g.state === 'scatter') {
      return g.scatter;
    }

    // Classic Chase AI targeting
    if (g.name === 'Blinky') {
      // Direct Chaser
      return [Math.round(this.px), Math.round(this.py)];
    } else if (g.name === 'Pinky') {
      // Ambush: targets 4 tiles ahead of player in direction of movement
      return [
        Math.round(this.px) + this.dir[0] * 4,
        Math.round(this.py) + this.dir[1] * 4
      ];
    } else if (g.name === 'Inky') {
      // Flanker: doubled vector from Blinky through 2 tiles ahead of player
      const blinky = this.ghosts[0];
      const ax = Math.round(this.px) + this.dir[0] * 2;
      const ay = Math.round(this.py) + this.dir[1] * 2;
      const vx = ax - blinky.x;
      const vy = ay - blinky.y;
      return [ax + vx, ay + vy];
    } else if (g.name === 'Clyde') {
      // Fickle: Chases if far (>= 8 tiles), retreats to scatter corner if close (< 8 tiles)
      const d = Math.hypot(g.x - this.px, g.y - this.py);
      if (d >= 7.5) {
        return [Math.round(this.px), Math.round(this.py)];
      } else {
        return g.scatter;
      }
    }
    return [Math.round(this.px), Math.round(this.py)];
  },

  updateGhost(g, dt) {
    // 1. Ghost inside house: gentle vertical idle bobbing until exit timer expires
    if (g.state === 'inside') {
      g.exitTimer -= dt;
      g.y += g.dir[1] * 1.5 * dt;
      if (g.y > 9.3) { g.y = 9.3; g.dir[1] = -1; }
      if (g.y < 8.7) { g.y = 8.7; g.dir[1] = 1; }
      if (g.exitTimer <= 0) {
        g.state = 'leaving';
        g.x = 9.0;
      }
      return;
    }

    // 2. Ghost leaving house: move up through the door (9, 8) into corridor (9, 7)
    if (g.state === 'leaving') {
      g.dir = [0, -1];
      g.x = 9.0;
      g.y -= 2.6 * dt;
      if (g.y <= 7.0) {
        g.y = 7.0;
        g.state = this.powerTimer > 0 ? 'frightened' : 'chase';
        g.dir = [-1, 0];
      }
      return;
    }

    // 3. Normal ghost movement
    let spd = g.speed;
    if (g.state === 'eyes') {
      spd = 8.2; // Very fast eyes returning home
    } else if (g.state === 'frightened') {
      spd = 2.6; // Slow frightened movement
    } else if (Math.round(g.y) === 9 && (g.x < 3.5 || g.x > 14.5)) {
      spd = 2.4; // Tunnel slow zone
    } else if (g.name === 'Blinky' && (this.totalDots - this.dotsEaten) < 20) {
      spd += 0.5; // Cruise Elroy speedup
    }

    const moveDist = spd * dt;
    const cx = Math.round(g.x);
    const cy = Math.round(g.y);

    // Decision at tile intersection when entering a new tile
    if (g.lastTileX === undefined || cx !== g.lastTileX || cy !== g.lastTileY) {
      g.lastTileX = cx;
      g.lastTileY = cy;

      // Snap perpendicular axis to lane center
      if (g.dir[0] !== 0) g.y = cy;
      if (g.dir[1] !== 0) g.x = cx;

      // When eyes reach the ghost house door, go down into house to respawn
      if (g.state === 'eyes' && cx === 9 && cy === 8) {
        g.dir = [0, 1];
      } else if (g.state === 'eyes' && cx === 9 && cy === 9) {
        // Respawn in house and exit!
        g.state = 'leaving';
        g.dir = [0, -1];
        g.lastTileX = undefined;
        return;
      } else {
        const target = this.getGhostTarget(g);
        const candidates = [];
        const isEyes = (g.state === 'eyes');
        const DIRS = [[0, -1], [-1, 0], [0, 1], [1, 0]]; // Up, Left, Down, Right

        for (const [dx, dy] of DIRS) {
          // Cannot reverse 180 degrees (unless eyes)
          if (!isEyes && dx === -g.dir[0] && dy === -g.dir[1]) continue;
          let nx = cx + dx, ny = cy + dy;
          if (ny === 9) {
            if (nx < 0) nx = PAC_MAZE_W - 1;
            else if (nx >= PAC_MAZE_W) nx = 0;
          }
          if (this.isPassable(nx, ny, true, isEyes)) {
            // Normal ghosts cannot enter ghost door downwards
            if (!isEyes && cx === 9 && cy === 8 && dx === 0 && dy === 1) continue;
            candidates.push([dx, dy]);
          }
        }

        if (candidates.length > 0) {
          if (isEyes) {
            // Optimal shortest BFS path back to ghost house
            let bestD = Infinity;
            let bestDir = candidates[0];
            for (const cand of candidates) {
              let nx = cx + cand[0], ny = cy + cand[1];
              if (ny === 9) {
                if (nx < 0) nx = PAC_MAZE_W - 1;
                else if (nx >= PAC_MAZE_W) nx = 0;
              }
              const d = this.eyesDistField[ny * PAC_MAZE_W + nx];
              if (d < bestD) {
                bestD = d;
                bestDir = cand;
              }
            }
            g.dir = bestDir;
          } else if (g.state === 'frightened' || !target) {
            // Erratic frightened turn
            g.dir = candidates[Math.floor(Math.random() * candidates.length)];
          } else {
            // Distance-minimizing turn to target
            let bestDist = Infinity;
            let bestDir = candidates[0];
            for (const cand of candidates) {
              let nx = cx + cand[0], ny = cy + cand[1];
              if (ny === 9) {
                if (nx < 0) nx = PAC_MAZE_W - 1;
                else if (nx >= PAC_MAZE_W) nx = 0;
              }
              const d = Math.hypot(nx - target[0], ny - target[1]);
              if (d < bestDist) {
                bestDist = d;
                bestDir = cand;
              }
            }
            g.dir = bestDir;
          }
        } else {
          // Dead end reverse
          g.dir = [-g.dir[0], -g.dir[1]];
        }
      }
    }

    // Move in current dir
    g.x += g.dir[0] * moveDist;
    g.y += g.dir[1] * moveDist;

    // Tunnel wrap
    if (Math.round(g.y) === 9) {
      if (g.x < -0.5) g.x = PAC_MAZE_W - 0.5;
      else if (g.x > PAC_MAZE_W - 0.5) g.x = -0.5;
    }
  },

  updatePlayer(dt) {
    const moveDist = this.speed * dt;
    const cx = Math.round(this.px);
    const cy = Math.round(this.py);

    // Direction buffering & Cornering
    // 1. Instant 180 reverse
    if (this.nextDir[0] === -this.dir[0] && this.nextDir[1] === -this.dir[1] &&
       (this.nextDir[0] !== 0 || this.nextDir[1] !== 0)) {
      this.dir = this.nextDir;
    }

    // 2. Corner turn / turn from stop
    const isDifferentDir = (this.nextDir[0] !== this.dir[0] || this.nextDir[1] !== this.dir[1]);
    const distToCenter = Math.hypot(this.px - cx, this.py - cy);
    if (isDifferentDir && distToCenter < 0.38) {
      const ndx = this.nextDir[0], ndy = this.nextDir[1];
      if (ndx !== 0 || ndy !== 0) {
        let nx = cx + ndx, ny = cy + ndy;
        if (ny === 9) {
          if (nx < 0) nx = PAC_MAZE_W - 1;
          else if (nx >= PAC_MAZE_W) nx = 0;
        }
        if (this.isPassable(nx, ny, false)) {
          if (ndx !== 0) this.py = cy;
          if (ndy !== 0) this.px = cx;
          this.dir = this.nextDir;
        }
      }
    }

    // 3. Move along current dir
    if (this.dir[0] !== 0 || this.dir[1] !== 0) {
      const dx = this.dir[0], dy = this.dir[1];
      let nx = cx + dx, ny = cy + dy;
      if (ny === 9) {
        if (nx < 0) nx = PAC_MAZE_W - 1;
        else if (nx >= PAC_MAZE_W) nx = 0;
      }

      // Update facing angle for mouth
      if (dx > 0) this.facingAngle = 0;
      else if (dx < 0) this.facingAngle = Math.PI;
      else if (dy > 0) this.facingAngle = Math.PI / 2;
      else if (dy < 0) this.facingAngle = -Math.PI / 2;

      // Animate chomp
      this.animTimer += dt * 14;
      this.mouthAngle = Math.abs(Math.sin(this.animTimer)) * 1.1;

      // Check wall collision ahead
      if (!this.isPassable(nx, ny, false)) {
        if ((dx > 0 && this.px >= cx) || (dx < 0 && this.px <= cx) ||
            (dy > 0 && this.py >= cy) || (dy < 0 && this.py <= cy)) {
          this.px = cx;
          this.py = cy;
          this.dir = [0, 0];
          this.mouthAngle = 0.2; // Subtle resting mouth
        } else {
          this.px += dx * moveDist;
          this.py += dy * moveDist;
        }
      } else {
        this.px += dx * moveDist;
        this.py += dy * moveDist;
      }
    } else {
      this.mouthAngle = 0; // Closed mouth when stopped
    }

    // Tunnel wrap
    if (Math.round(this.py) === 9) {
      if (this.px < -0.5) this.px = PAC_MAZE_W - 0.5;
      else if (this.px > PAC_MAZE_W - 0.5) this.px = -0.5;
    }

    // Eating Dots & Power Pellets
    const tcx = Math.round(this.px);
    const tcy = Math.round(this.py);
    if (Math.hypot(this.px - tcx, this.py - tcy) < 0.3) {
      // Dot
      const dotIdx = tcy * PAC_MAZE_W + tcx;
      if (this.dots[dotIdx] === 1) {
        this.dots[dotIdx] = 0;
        this.dotsEaten++;
        this.score += 10;
        if (this.score > this.highScore) this.highScore = this.score;

        // Waka-waka alternating rhythm
        this.wakaTone = !this.wakaTone;
        const freq = this.wakaTone ? 480 : 340;
        if (typeof APU !== 'undefined') {
          APU.softTone(freq, 0.045, 'triangle', 0.08, 0, 0.003, 1500);
        }

        // Fruit trigger at 30 and 70 dots
        if ((this.dotsEaten === 30 || this.dotsEaten === 70) && !this.fruitActive) {
          this.fruitActive = true;
          this.fruitTimer = 9.5;
        }
      }

      // Power Pellet
      for (const p of this.powerPellets) {
        if (p.active && p.x === tcx && p.y === tcy) {
          p.active = false;
          this.score += 50;
          if (this.score > this.highScore) this.highScore = this.score;
          this.powerTimer = 7.5;
          this.ghostCombo = 0;
          if (typeof APU !== 'undefined') {
            APU.sfx('POWER');
          }
          for (const g of this.ghosts) {
            if (g.state !== 'eyes' && g.state !== 'inside' && g.state !== 'leaving') {
              g.state = 'frightened';
              g.dir = [-g.dir[0], -g.dir[1]]; // Classic reverse turn on power pellet
            }
          }
        }
      }

      // Bonus Fruit eating
      if (this.fruitActive && tcx === 9 && tcy === 11) {
        this.fruitActive = false;
        const pts = this.fruitScores[this.fruitType];
        this.score += pts;
        if (this.score > this.highScore) this.highScore = this.score;
        this.popups.push({ text: "+" + pts, x: 9, y: 11, timer: 1.0 });
        this.fruitsCollected.push(this.fruitType);
        if (typeof APU !== 'undefined') {
          [440, 554, 659, 880].forEach((f, i) => {
            APU.softTone(f, 0.09, 'triangle', 0.08, i * 0.04, 0.01, 1600);
          });
        }
      }
    }
  },

  update(dt) {
    // Game Over or Round Won - Handle restart / next round
    if (this.over || this.won) {
      if (typeof PAD !== 'undefined' && (PAD.hit('a') || PAD.hit('start') || PAD.tapPos)) {
        this.init();
      }
      return;
    }

    // Input Handling: D-pad, WASD, Arrow keys
    if (typeof PAD !== 'undefined') {
      if (PAD.hit('up') || PAD.held('up')) this.nextDir = [0, -1];
      if (PAD.hit('down') || PAD.held('down')) this.nextDir = [0, 1];
      if (PAD.hit('left') || PAD.held('left')) this.nextDir = [-1, 0];
      if (PAD.hit('right') || PAD.held('right')) this.nextDir = [1, 0];

      // Mobile swipe gestures
      if (PAD.swipe === 'up') this.nextDir = [0, -1];
      if (PAD.swipe === 'down') this.nextDir = [0, 1];
      if (PAD.swipe === 'left') this.nextDir = [-1, 0];
      if (PAD.swipe === 'right') this.nextDir = [1, 0];

      // Mobile directional screen tap zones
      if (PAD.tapPos) {
        const pacSx = this.ox + this.px * this.sz + this.sz / 2;
        const pacSy = this.oy + this.py * this.sz + this.sz / 2;
        const dx = PAD.tapPos.x - pacSx;
        const dy = PAD.tapPos.y - pacSy;
        if (Math.hypot(dx, dy) > 8) {
          if (Math.abs(dx) > Math.abs(dy)) {
            this.nextDir = dx > 0 ? [1, 0] : [-1, 0];
          } else {
            this.nextDir = dy > 0 ? [0, 1] : [0, -1];
          }
        }
      }
    }

    // "READY!" intro delay
    if (this.state === 'ready') {
      this.readyTimer -= dt;
      if (this.readyTimer <= 0) {
        this.state = 'play';
      }
      return;
    }

    // Death Deflate Animation
    if (this.state === 'dying') {
      this.dyingTimer -= dt;
      this.mouthAngle = Math.min(Math.PI * 2, (1.0 - this.dyingTimer) * Math.PI * 2);
      if (this.dyingTimer <= 0) {
        this.lives--;
        if (this.lives <= 0) {
          this.over = true;
          if (typeof SAVE !== 'undefined' && SAVE.setScore) {
            SAVE.setScore(this.id, this.score);
          }
        } else {
          this.resetPositions();
          this.state = 'ready';
          this.readyTimer = 1.4;
        }
      }
      return;
    }

    // Fruit countdown
    if (this.fruitActive) {
      this.fruitTimer -= dt;
      if (this.fruitTimer <= 0) {
        this.fruitActive = false;
      }
    }

    // Power Pellet countdown & audio siren
    if (this.powerTimer > 0) {
      this.powerTimer = Math.max(0, this.powerTimer - dt);
      this.sirenTimer += dt;
      if (this.sirenTimer >= 0.22) {
        this.sirenTimer = 0;
        const sirenFreq = (Math.floor(Date.now() / 220) % 2 === 0) ? 145 : 180;
        if (typeof APU !== 'undefined') {
          APU.softTone(sirenFreq, 0.18, 'triangle', 0.04, 0, 0.02, 450);
        }
      }
      if (this.powerTimer === 0) {
        for (const g of this.ghosts) {
          if (g.state === 'frightened') g.state = 'chase';
        }
      }
    }

    // Scatter / Chase cycle
    this.modeTimer += dt;
    if (this.modeTimer > (this.scatterMode ? 7.0 : 20.0)) {
      this.scatterMode = !this.scatterMode;
      this.modeTimer = 0;
    }

    // Floating score popups timer
    for (const p of this.popups) {
      p.timer -= dt;
      p.y -= 0.6 * dt;
    }
    this.popups = this.popups.filter(p => p.timer > 0);

    // Update Player & Ghosts
    this.updatePlayer(dt);
    for (const g of this.ghosts) {
      this.updateGhost(g, dt);
    }

    // Ghost Clumping Avoidance: if two non-eyes ghosts overlap closely, apply slight separation
    for (let i = 0; i < this.ghosts.length; i++) {
      for (let j = i + 1; j < this.ghosts.length; j++) {
        const g1 = this.ghosts[i], g2 = this.ghosts[j];
        if (g1.state !== 'inside' && g2.state !== 'inside' && g1.state !== 'eyes' && g2.state !== 'eyes') {
          const gDist = Math.hypot(g1.x - g2.x, g1.y - g2.y);
          if (gDist < 0.35 && gDist > 0.001) {
            const sep = (0.35 - gDist) * 0.5;
            const nx = (g1.x - g2.x) / gDist;
            const ny = (g1.y - g2.y) / gDist;
            g1.x += nx * sep; g1.y += ny * sep;
            g2.x -= nx * sep; g2.y -= ny * sep;
          }
        }
      }
    }

    // Player-Ghost Collision Detection
    for (const g of this.ghosts) {
      const d = Math.hypot(this.px - g.x, this.py - g.y);
      if (d < 0.65) {
        if (g.state === 'frightened') {
          // Eat ghost combo
          this.ghostCombo++;
          const pts = 200 * Math.pow(2, Math.min(3, this.ghostCombo - 1));
          this.score += pts;
          if (this.score > this.highScore) this.highScore = this.score;
          this.popups.push({ text: pts.toString(), x: g.x, y: g.y, timer: 0.9 });
          g.state = 'eyes';

          // Ghost eaten fanfare
          if (typeof APU !== 'undefined') {
            [523.25, 659.25, 783.99, 1046.50].forEach((f, idx) => {
              APU.softTone(f, 0.12, 'sine', 0.09, idx * 0.04, 0.005, 1800);
            });
          }
        } else if (g.state === 'chase' || g.state === 'scatter') {
          // Pac-Man caught!
          this.state = 'dying';
          this.dyingTimer = 1.0;
          if (typeof APU !== 'undefined') {
            APU.tone(550, 0.65, 'triangle', 0.14, 60);
          }
          return;
        }
      }
    }

    // Win condition: All dots & power pellets eaten!
    const remainingPellets = this.powerPellets.filter(p => p.active).length;
    if (this.dotsEaten >= this.totalDots && remainingPellets === 0) {
      this.won = true;
      this.score += 1000;
      if (this.score > this.highScore) this.highScore = this.score;
      if (typeof APU !== 'undefined') {
        APU.sfx('LEVELUP');
      }
      if (typeof SAVE !== 'undefined' && SAVE.setScore) {
        SAVE.setScore(this.id, this.score);
      }
    }
  },

  render(g) {
    g.clear(0);
    const ox = this.ox, oy = this.oy, sz = this.sz;

    // 1. Maze Walls
    for (let y = 0; y < PAC_MAZE_H; y++) {
      for (let x = 0; x < PAC_MAZE_W; x++) {
        const ch = PAC_MAZE_MAP[y][x];
        const rx = ox + x * sz;
        const ry = oy + y * sz;
        if (ch === '#') {
          g.rect(rx, ry, sz, sz, 1);
          g.box(rx, ry, sz, sz, 2);
        } else if (ch === '-') {
          // Ghost house door
          g.line(rx, ry + 5, rx + sz - 1, ry + 5, 3);
        }
      }
    }

    // 2. Dots
    for (let y = 0; y < PAC_MAZE_H; y++) {
      for (let x = 0; x < PAC_MAZE_W; x++) {
        if (this.dots[y * PAC_MAZE_W + x] === 1) {
          const dx = ox + x * sz + 5;
          const dy = oy + y * sz + 5;
          g.rect(dx, dy, 2, 2, 3);
        }
      }
    }

    // 3. Power Pellets (pulsing)
    const pelletPulse = Math.sin(Date.now() / 120) > 0;
    for (const p of this.powerPellets) {
      if (p.active) {
        const px = ox + p.x * sz + 5;
        const py = oy + p.y * sz + 5;
        g.disc(px, py, pelletPulse ? 4 : 3, 3);
        g.px(px, py, 0); // Inner hole for classic neon pellet look
      }
    }

    // 4. Bonus Fruit
    if (this.fruitActive) {
      const flash = (this.fruitTimer < 2.5) && (Math.floor(Date.now() / 150) % 2 === 0);
      if (!flash) {
        const fx = ox + 9 * sz + 5;
        const fy = oy + 11 * sz + 5;
        this.renderFruit(g, fx, fy, this.fruitType);
      }
    }

    // 5. Pacman
    const pacSx = Math.round(ox + this.px * sz + 5);
    const pacSy = Math.round(oy + this.py * sz + 5);

    if (this.state === 'dying') {
      // Death deflate animation: mouth opens full 360 deg
      const deathAngle = this.mouthAngle;
      if (deathAngle < Math.PI * 1.95) {
        g.disc(pacSx, pacSy, 5, 3);
        const a1 = this.facingAngle - deathAngle / 2;
        const a2 = this.facingAngle + deathAngle / 2;
        g.tri(pacSx, pacSy, pacSx + Math.cos(a1) * 8, pacSy + Math.sin(a1) * 8, pacSx + Math.cos(a2) * 8, pacSy + Math.sin(a2) * 8, 0);
      } else {
        // Disappearing sparks
        const spk = Math.floor((1.0 - this.dyingTimer) * 12);
        g.px(pacSx + spk, pacSy, 3);
        g.px(pacSx - spk, pacSy, 3);
        g.px(pacSx, pacSy + spk, 3);
        g.px(pacSx, pacSy - spk, 3);
      }
    } else {
      // Normal Pacman with animated chomp mouth
      g.disc(pacSx, pacSy, 5, 3);
      if (this.mouthAngle > 0.15) {
        const a1 = this.facingAngle - this.mouthAngle / 2;
        const a2 = this.facingAngle + this.mouthAngle / 2;
        g.tri(pacSx, pacSy, pacSx + Math.cos(a1) * 8, pacSy + Math.sin(a1) * 8, pacSx + Math.cos(a2) * 8, pacSy + Math.sin(a2) * 8, 0);
      }
    }

    // 6. Ghosts
    for (const gh of this.ghosts) {
      const gsx = Math.round(ox + gh.x * sz + 5);
      const gsy = Math.round(oy + gh.y * sz + 5);
      this.renderGhost(g, gh, gsx, gsy);
    }

    // 7. Floating Score Popups
    for (const pop of this.popups) {
      const ppx = Math.round(ox + pop.x * sz + 5);
      const ppy = Math.round(oy + pop.y * sz + 5);
      g.text(pop.text, ppx - Math.floor((pop.text.length * 5) / 2), ppy - 3, 3);
    }

    // 8. Top HUD: Score, High Score, Lives
    g.text("SCORE " + this.score, 12, 4, 3);
    g.textC("HI " + this.highScore, 4, 2);
    g.textR("♥".repeat(Math.max(0, this.lives)), 244, 4, 3);

    // 9. Bottom HUD: Fruit tally, Hunt alert, Round
    if (this.powerTimer > 0) {
      g.textC("HUNT! " + Math.ceil(this.powerTimer), 227, 3);
    } else {
      g.text("ROUND " + this.round, 12, 228, 2);
    }
    // Render collected fruits on bottom right
    let fruitX = 240;
    for (let i = Math.max(0, this.fruitsCollected.length - 4); i < this.fruitsCollected.length; i++) {
      this.renderFruit(g, fruitX, 232, this.fruitsCollected[i]);
      fruitX -= 12;
    }

    // 10. Overlays: READY, WON, GAME OVER
    if (this.state === 'ready') {
      g.dither(80, 110, 96, 20, 0, 1);
      g.box(80, 110, 96, 20, 3);
      g.textC("READY!", 116, 3);
    } else if (this.won) {
      g.dither(56, 92, 144, 52, 0, 1);
      g.box(56, 92, 144, 52, 3);
      g.textC("MAZE CLEARED!", 102, 3);
      g.textC("BONUS +1000 PTS", 116, 2);
      g.textC("[A] NEXT ROUND", 128, 3);
    } else if (this.over) {
      g.dither(56, 92, 144, 52, 0, 1);
      g.box(56, 92, 144, 52, 3);
      g.textC("GAME OVER", 102, 3);
      g.textC("SCORE " + this.score, 116, 2);
      g.textC("[A] PLAY AGAIN", 128, 3);
    }
  },

  renderGhost(g, gh, sx, sy) {
    if (gh.state === 'eyes') {
      // Floating eyes only returning to house
      g.rect(sx - 3, sy - 2, 3, 4, 3);
      g.rect(sx + 1, sy - 2, 3, 4, 3);
      const pdx = Math.max(-1, Math.min(1, gh.dir[0]));
      const pdy = Math.max(-1, Math.min(1, gh.dir[1]));
      g.rect(sx - 2 + pdx, sy - 1 + pdy, 2, 2, 0);
      g.rect(sx + 2 + pdx, sy - 1 + pdy, 2, 2, 0);
      return;
    }

    const ruffle = (Math.floor(Date.now() / 150) % 2 === 0);

    if (gh.state === 'frightened') {
      // Frightened Ghost: Dark wobbly body with white flash warning
      const isFlashing = (this.powerTimer < 2.2) && (Math.floor(Date.now() / 140) % 2 === 0);
      const bodyColor = isFlashing ? 3 : 1;
      const faceColor = isFlashing ? 0 : 3;

      // Dome head & body
      g.disc(sx, sy - 1, 4, bodyColor);
      g.rect(sx - 4, sy - 1, 9, 4, bodyColor);

      // 2-frame ruffled skirt
      if (ruffle) {
        g.rect(sx - 4, sy + 3, 2, 2, bodyColor);
        g.rect(sx - 1, sy + 3, 3, 2, bodyColor);
        g.rect(sx + 3, sy + 3, 2, 2, bodyColor);
      } else {
        g.rect(sx - 3, sy + 3, 3, 2, bodyColor);
        g.rect(sx + 1, sy + 3, 3, 2, bodyColor);
      }

      // Frightened Face: Small blank eyes and wavy mouth
      g.px(sx - 2, sy - 1, faceColor);
      g.px(sx + 2, sy - 1, faceColor);
      g.line(sx - 3, sy + 2, sx - 2, sy + 1, faceColor);
      g.line(sx - 2, sy + 1, sx, sy + 2, faceColor);
      g.line(sx, sy + 2, sx + 2, sy + 1, faceColor);
      g.line(sx + 2, sy + 1, sx + 3, sy + 2, faceColor);
      return;
    }

    // Normal Ghost: Blinky (3), Pinky (2), Inky (2 dither), Clyde (2 accent)
    const bodyColor = gh.color;
    g.disc(sx, sy - 1, 4, bodyColor);
    g.rect(sx - 4, sy - 1, 9, 4, bodyColor);

    // Inky dither pattern for authentic differentiation
    if (gh.name === 'Inky') {
      for (let dy = -2; dy <= 2; dy += 2) {
        for (let dx = -3; dx <= 3; dx += 2) {
          g.px(sx + dx, sy + dy, 3);
        }
      }
    } else if (gh.name === 'Clyde') {
      g.px(sx - 2, sy + 1, 1);
      g.px(sx + 2, sy + 1, 1);
    }

    // 2-frame ruffled skirt
    if (ruffle) {
      g.rect(sx - 4, sy + 3, 2, 2, bodyColor);
      g.rect(sx - 1, sy + 3, 3, 2, bodyColor);
      g.rect(sx + 3, sy + 3, 2, 2, bodyColor);
    } else {
      g.rect(sx - 3, sy + 3, 3, 2, bodyColor);
      g.rect(sx + 1, sy + 3, 3, 2, bodyColor);
    }

    // Directional Eyes & Pupils looking in movement direction
    g.rect(sx - 3, sy - 2, 3, 4, 3);
    g.rect(sx + 1, sy - 2, 3, 4, 3);
    const pdx = Math.max(-1, Math.min(1, gh.dir[0]));
    const pdy = Math.max(-1, Math.min(1, gh.dir[1]));
    g.rect(sx - 2 + pdx, sy - 1 + pdy, 2, 2, 0);
    g.rect(sx + 2 + pdx, sy - 1 + pdy, 2, 2, 0);
  },

  renderFruit(g, fx, fy, type) {
    if (type === 0) {
      // Cherry
      g.disc(fx - 2, fy + 2, 2, 3);
      g.disc(fx + 2, fy + 1, 2, 3);
      g.line(fx - 2, fy, fx, fy - 3, 2);
      g.line(fx + 2, fy - 1, fx, fy - 3, 2);
      g.px(fx, fy - 3, 3);
    } else if (type === 1) {
      // Strawberry
      g.rect(fx - 2, fy - 3, 5, 1, 3);
      g.disc(fx, fy, 3, 2);
      g.px(fx, fy + 3, 2);
      g.px(fx - 1, fy, 3);
      g.px(fx + 1, fy + 1, 3);
    } else if (type === 2) {
      // Orange
      g.disc(fx, fy, 3, 3);
      g.px(fx, fy - 4, 2);
      g.px(fx + 1, fy - 3, 2);
      g.px(fx - 1, fy - 1, 1);
    } else if (type === 3) {
      // Apple
      g.disc(fx, fy, 3, 2);
      g.line(fx, fy - 2, fx + 1, fy - 4, 3);
      g.px(fx - 1, fy + 1, 3);
    } else {
      // Melon
      g.disc(fx, fy, 4, 3);
      g.line(fx - 2, fy - 3, fx - 2, fy + 3, 1);
      g.line(fx + 2, fy - 3, fx + 2, fy + 3, 1);
    }
  }
};
