// js/engines.js
// ============================================================================
// [ENG] THE 12 COMMON ENGINES (E1 - E12)
// ============================================================================

// E1: GRID ENGINE
const E1 = {
  create(w, h, fillVal = 0) {
    const data = new Array(w * h).fill(fillVal);
    return { w, h, data };
  },
  idx(g, x, y) { return (y | 0) * g.w + (x | 0); },
  inBounds(g, x, y) { return x >= 0 && x < g.w && y >= 0 && y < g.h; },
  get(g, x, y) {
    if (!this.inBounds(g, x, y)) return 0;
    return g.data[this.idx(g, x, y)];
  },
  set(g, x, y, v) {
    if (!this.inBounds(g, x, y)) return;
    g.data[this.idx(g, x, y)] = v;
  },
  swap(g, x1, y1, x2, y2) {
    if (!this.inBounds(g, x1, y1) || !this.inBounds(g, x2, y2)) return;
    const i1 = this.idx(g, x1, y1), i2 = this.idx(g, x2, y2);
    const tmp = g.data[i1]; g.data[i1] = g.data[i2]; g.data[i2] = tmp;
  },
  floodFill(g, sx, sy, targetVal, fillVal) {
    if (targetVal === fillVal || !this.inBounds(g, sx, sy)) return 0;
    if (this.get(g, sx, sy) !== targetVal) return 0;
    const q = [[sx, sy]];
    let count = 0;
    while (q.length > 0) {
      const [cx, cy] = q.pop();
      if (!this.inBounds(g, cx, cy) || this.get(g, cx, cy) !== targetVal) continue;
      this.set(g, cx, cy, fillVal);
      count++;
      q.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
    return count;
  },
  findMatches(g, minLen = 3) {
    const matches = new Set();
    for (let y = 0; y < g.h; y++) {
      let runVal = null, runStart = 0, runLen = 0;
      for (let x = 0; x < g.w; x++) {
        const v = this.get(g, x, y);
        if (v !== 0 && v === runVal) {
          runLen++;
        } else {
          if (runLen >= minLen) {
            for (let k = 0; k < runLen; k++) matches.add(this.idx(g, runStart + k, y));
          }
          runVal = v; runStart = x; runLen = (v !== 0 ? 1 : 0);
        }
      }
      if (runLen >= minLen) {
        for (let k = 0; k < runLen; k++) matches.add(this.idx(g, runStart + k, y));
      }
    }
    for (let x = 0; x < g.w; x++) {
      let runVal = null, runStart = 0, runLen = 0;
      for (let y = 0; y < g.h; y++) {
        const v = this.get(g, x, y);
        if (v !== 0 && v === runVal) {
          runLen++;
        } else {
          if (runLen >= minLen) {
            for (let k = 0; k < runLen; k++) matches.add(this.idx(g, x, runStart + k));
          }
          runVal = v; runStart = y; runLen = (v !== 0 ? 1 : 0);
        }
      }
      if (runLen >= minLen) {
        for (let k = 0; k < runLen; k++) matches.add(this.idx(g, x, runStart + k));
      }
    }
    return Array.from(matches);
  },
  draw(gfx, g, ox, oy, sz, renderCell) {
    for (let y = 0; y < g.h; y++) {
      for (let x = 0; x < g.w; x++) {
        const val = this.get(g, x, y);
        renderCell(gfx, x, y, ox + x * sz, oy + y * sz, sz, val);
      }
    }
  }
};

// E2: 2D RIGID/VERLET PHYSICS ENGINE
const E2 = {
  createWorld(gx = 0, gy = 200, damping = 0.99) {
    return { gx, gy, damping, bodies: [], constraints: [] };
  },
  addBody(w, b) {
    const body = Object.assign({
      x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0,
      r: 4, mass: 1, bounce: 0.7, friction: 0.98,
      isStatic: false
    }, b);
    w.bodies.push(body);
    return body;
  },
  addConstraint(w, p1, p2, dist, stiffness = 1.0) {
    const c = { p1, p2, dist, stiffness };
    w.constraints.push(c);
    return c;
  },
  update(w, dt, bounds = { x0: 0, y0: 0, x1: 256, y1: 240 }) {
    for (let b of w.bodies) {
      if (b.isStatic) continue;
      b.vx += (w.gx + b.ax) * dt;
      b.vy += (w.gy + b.ay) * dt;
      b.vx *= w.damping * b.friction;
      b.vy *= w.damping;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.x - b.r < bounds.x0) { b.x = bounds.x0 + b.r; b.vx = -b.vx * b.bounce; }
      if (b.x + b.r > bounds.x1) { b.x = bounds.x1 - b.r; b.vx = -b.vx * b.bounce; }
      if (b.y - b.r < bounds.y0) { b.y = bounds.y0 + b.r; b.vy = -b.vy * b.bounce; }
      if (b.y + b.r > bounds.y1) { b.y = bounds.y1 - b.r; b.vy = -b.vy * b.bounce; }
    }

    for (let iter = 0; iter < 3; iter++) {
      for (let c of w.constraints) {
        const dx = c.p2.x - c.p1.x;
        const dy = c.p2.y - c.p1.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const diff = (d - c.dist) / d * 0.5 * c.stiffness;
        if (!c.p1.isStatic) { c.p1.x += dx * diff; c.p1.y += dy * diff; }
        if (!c.p2.isStatic) { c.p2.x -= dx * diff; c.p2.y -= dy * diff; }
      }
    }

    for (let i = 0; i < w.bodies.length; i++) {
      for (let j = i + 1; j < w.bodies.length; j++) {
        const b1 = w.bodies[i], b2 = w.bodies[j];
        const dx = b2.x - b1.x, dy = b2.y - b1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = b1.r + b2.r;
        if (dist < minDist && dist > 0) {
          const nx = dx / dist, ny = dy / dist;
          const overlap = minDist - dist;
          if (!b1.isStatic) { b1.x -= nx * overlap * 0.5; b1.y -= ny * overlap * 0.5; }
          if (!b2.isStatic) { b2.x += nx * overlap * 0.5; b2.y += ny * overlap * 0.5; }

          const kx = b1.vx - b2.vx, ky = b1.vy - b2.vy;
          const p = 2 * (nx * kx + ny * ky) / (b1.mass + b2.mass);
          if (!b1.isStatic) { b1.vx -= p * b2.mass * nx * b1.bounce; b1.vy -= p * b2.mass * ny * b1.bounce; }
          if (!b2.isStatic) { b2.vx += p * b1.mass * nx * b2.bounce; b2.vy += p * b1.mass * ny * b2.bounce; }
        }
      }
    }
  }
};

// E3: MAZE & PATHFINDING
const E3 = {
  generate(w, h) {
    const grid = E1.create(w, h, 1);
    for (let y = 1; y < h; y += 2) {
      for (let x = 1; x < w; x += 2) {
        E1.set(grid, x, y, 0);
      }
    }
    for (let y = 1; y < h - 1; y += 2) {
      for (let x = 1; x < w - 1; x += 2) {
        const dir = (x === w - 2) ? 'down' : (y === h - 2) ? 'right' : (Math.random() < 0.5 ? 'right' : 'down');
        if (dir === 'right' && x + 1 < w - 1) E1.set(grid, x + 1, y, 0);
        else if (dir === 'down' && y + 1 < h - 1) E1.set(grid, x, y + 1, 0);
      }
    }
    return grid;
  },
  bfs(grid, sx, sy, gx, gy) {
    if (sx === gx && sy === gy) return [];
    const q = [[sx, sy]];
    const visited = new Map();
    visited.set(E1.idx(grid, sx, sy), null);

    while (q.length > 0) {
      const [cx, cy] = q.shift();
      if (cx === gx && cy === gy) break;

      const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (let [dx, dy] of dirs) {
        const nx = cx + dx, ny = cy + dy;
        if (E1.inBounds(grid, nx, ny) && E1.get(grid, nx, ny) === 0) {
          const id = E1.idx(grid, nx, ny);
          if (!visited.has(id)) {
            visited.set(id, [cx, cy]);
            q.push([nx, ny]);
          }
        }
      }
    }

    const path = [];
    let cur = [gx, gy];
    while (cur) {
      path.push(cur);
      cur = visited.get(E1.idx(grid, cur[0], cur[1]));
    }
    return path.reverse();
  },
  distanceField(grid, gx, gy) {
    const field = E1.create(grid.w, grid.h, 999);
    const q = [[gx, gy, 0]];
    E1.set(field, gx, gy, 0);
    while (q.length > 0) {
      const [cx, cy, d] = q.shift();
      const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (let [dx, dy] of dirs) {
        const nx = cx + dx, ny = cy + dy;
        if (E1.inBounds(grid, nx, ny) && E1.get(grid, nx, ny) === 0) {
          if (E1.get(field, nx, ny) > d + 1) {
            E1.set(field, nx, ny, d + 1);
            q.push([nx, ny, d + 1]);
          }
        }
      }
    }
    return field;
  }
};

// E4: FAST DDA RAYCASTER ENGINE
const E4 = {
  render(gfx, map, mapW, mapH, posX, posY, dirX, dirY, planeX, planeY, sprites = []) {
    gfx.rect(0, 0, W, 120, 0);
    gfx.dither(0, 120, W, 120, 0, 1);

    const numRays = 128;
    const zBuffer = new Float32Array(numRays);

    for (let i = 0; i < numRays; i++) {
      const cameraX = (2 * i) / numRays - 1;
      const rayDirX = dirX + planeX * cameraX;
      const rayDirY = dirY + planeY * cameraX;

      let mapX = Math.floor(posX);
      let mapY = Math.floor(posY);

      const deltaDistX = Math.abs(1 / (rayDirX || 0.0001));
      const deltaDistY = Math.abs(1 / (rayDirY || 0.0001));

      let stepX, stepY, sideDistX, sideDistY;
      if (rayDirX < 0) { stepX = -1; sideDistX = (posX - mapX) * deltaDistX; }
      else { stepX = 1; sideDistX = (mapX + 1.0 - posX) * deltaDistX; }
      if (rayDirY < 0) { stepY = -1; sideDistY = (posY - mapY) * deltaDistY; }
      else { stepY = 1; sideDistY = (mapY + 1.0 - posY) * deltaDistY; }

      let hit = 0, side = 0;
      while (hit === 0) {
        if (sideDistX < sideDistY) { sideDistX += deltaDistX; mapX += stepX; side = 0; }
        else { sideDistY += deltaDistY; mapY += stepY; side = 1; }
        if (mapX < 0 || mapX >= mapW || mapY < 0 || mapY >= mapH) { hit = 1; break; }
        if (map[mapY * mapW + mapX] > 0) hit = 1;
      }

      let perpWallDist;
      if (side === 0) perpWallDist = (mapX - posX + (1 - stepX) / 2) / rayDirX;
      else perpWallDist = (mapY - posY + (1 - stepY) / 2) / rayDirY;
      if (perpWallDist <= 0.01) perpWallDist = 0.01;

      zBuffer[i] = perpWallDist;

      const lineHeight = Math.floor(H / perpWallDist);
      const drawStart = Math.max(0, Math.floor(-lineHeight / 2 + H / 2));
      const drawEnd = Math.min(H - 1, Math.floor(lineHeight / 2 + H / 2));

      let color = (perpWallDist < 4) ? (side === 1 ? 3 : 2) : (perpWallDist < 8 ? 2 : 1);
      const colX = i * 2;
      gfx.rect(colX, drawStart, 2, drawEnd - drawStart + 1, color);
    }

    for (let s of sprites) {
      const spriteX = s.x - posX;
      const spriteY = s.y - posY;
      const invDet = 1.0 / (planeX * dirY - dirX * planeY || 0.0001);
      const transformX = invDet * (dirY * spriteX - dirX * spriteY);
      const transformY = invDet * (-planeY * spriteX + planeX * spriteY);

      if (transformY > 0.2) {
        const spriteScreenX = Math.floor((W / 2) * (1 + transformX / transformY));
        const spriteHeight = Math.abs(Math.floor(H / transformY));
        const spriteWidth = spriteHeight;

        const startY = Math.max(0, Math.floor(-spriteHeight / 2 + H / 2));
        const endY = Math.min(H - 1, Math.floor(spriteHeight / 2 + H / 2));
        const startX = Math.max(0, Math.floor(-spriteWidth / 2 + spriteScreenX));
        const endX = Math.min(W - 1, Math.floor(spriteWidth / 2 + spriteScreenX));

        const rayIdx = Math.floor(spriteScreenX / 2);
        if (rayIdx >= 0 && rayIdx < numRays && transformY < zBuffer[rayIdx]) {
          gfx.disc(spriteScreenX, Math.floor(H / 2), Math.floor(spriteWidth / 4), s.color || 3);
        }
      }
    }
  }
};

// E5: TEXT & TYPEWRITER ENGINE
const E5 = {
  createConsole(maxLines = 24) {
    return { lines: [], maxLines, scroll: 0 };
  },
  print(con, text) {
    con.lines.push(String(text));
    if (con.lines.length > con.maxLines) con.lines.shift();
  },
  clear(con) { con.lines = []; },
  render(gfx, con, x = 10, y = 10, lineHeight = 9, color = 3) {
    for (let i = 0; i < con.lines.length; i++) {
      gfx.text(con.lines[i], x, y + i * lineHeight, color);
    }
  }
};

// E6: CARD / DICE ENGINE
const E6 = {
  SUITS: ['♠', '♥', '♦', '♣'],
  RANKS: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
  createDeck() {
    const deck = [];
    for (let s of this.SUITS) {
      for (let r of this.RANKS) {
        deck.push({ s, r, val: this.RANKS.indexOf(r) + 2 });
      }
    }
    return deck;
  },
  shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
    }
    return deck;
  },
  draw(deck, count = 1) {
    return deck.splice(0, count);
  },
  rollDice(count = 5) {
    const dice = [];
    for (let i = 0; i < count; i++) dice.push(Math.floor(Math.random() * 6) + 1);
    return dice;
  }
};

// E7: TOWER DEFENSE / INTERCEPTION ENGINE
const E7 = {
  createTower(x, y, range = 45, damage = 1, fireRate = 0.8) {
    return { x, y, range, damage, fireRate, timer: 0 };
  },
  findTarget(tower, creeps) {
    let closest = null, minDist = tower.range;
    for (let c of creeps) {
      if (c.hp <= 0) continue;
      const dx = c.x - tower.x, dy = c.y - tower.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < minDist) { minDist = d; closest = c; }
    }
    return closest;
  }
};

// E8: RHYTHM / TIMELINE ENGINE
const E8 = {
  createTimeline() {
    return { notes: [], score: 0, combo: 0, lastGrade: '' };
  },
  addNote(tl, track, timeSec) {
    tl.notes.push({ track, time: timeSec, hit: false });
  },
  checkHit(tl, track, currentTimeSec) {
    for (let n of tl.notes) {
      if (!n.hit && n.track === track) {
        const diff = Math.abs(currentTimeSec - n.time);
        if (diff < 0.06) {
          n.hit = true; tl.combo++; tl.score += 100 * tl.combo; tl.lastGrade = 'PERFECT';
          APU.sfx('COIN'); return 'PERFECT';
        } else if (diff < 0.14) {
          n.hit = true; tl.combo++; tl.score += 50 * tl.combo; tl.lastGrade = 'GOOD';
          APU.sfx('HIT'); return 'GOOD';
        }
      }
    }
    tl.combo = 0; tl.lastGrade = 'MISS';
    APU.sfx('DENY');
    return 'MISS';
  }
};

// E9: CELLULAR AUTOMATA ENGINE
const E9 = {
  stepLife(grid) {
    const next = E1.create(grid.w, grid.h, 0);
    for (let y = 0; y < grid.h; y++) {
      for (let x = 0; x < grid.w; x++) {
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            if (E1.get(grid, x + dx, y + dy) === 1) n++;
          }
        }
        const cur = E1.get(grid, x, y);
        if (cur === 1 && (n === 2 || n === 3)) E1.set(next, x, y, 1);
        else if (cur === 0 && n === 3) E1.set(next, x, y, 1);
      }
    }
    grid.data = next.data;
  },
  stepSand(grid) {
    for (let y = grid.h - 2; y >= 0; y--) {
      for (let x = 0; x < grid.w; x++) {
        const cell = E1.get(grid, x, y);
        if (cell === 1 || cell === 5) {
          if (E1.get(grid, x, y + 1) === 0) {
            E1.set(grid, x, y + 1, cell); E1.set(grid, x, y, 0);
          } else if (x > 0 && E1.get(grid, x - 1, y + 1) === 0) {
            E1.set(grid, x - 1, y + 1, cell); E1.set(grid, x, y, 0);
          } else if (x < grid.w - 1 && E1.get(grid, x + 1, y + 1) === 0) {
            E1.set(grid, x + 1, y + 1, cell); E1.set(grid, x, y, 0);
          }
        } else if (cell === 2) {
          if (E1.get(grid, x, y + 1) === 0) {
            E1.set(grid, x, y + 1, 2); E1.set(grid, x, y, 0);
          } else {
            const dir = Math.random() < 0.5 ? -1 : 1;
            if (E1.inBounds(grid, x + dir, y) && E1.get(grid, x + dir, y) === 0) {
              E1.set(grid, x + dir, y, 2); E1.set(grid, x, y, 0);
            }
          }
        }
      }
    }
  }
};

// E10: BOARD GAME / MINIMAX ENGINE
const E10 = {
  createReversi() {
    const b = E1.create(8, 8, 0);
    E1.set(b, 3, 3, 2); E1.set(b, 4, 4, 2);
    E1.set(b, 3, 4, 1); E1.set(b, 4, 3, 1);
    return b;
  },
  getValidFlips(board, x, y, player) {
    if (E1.get(board, x, y) !== 0) return [];
    const opp = player === 1 ? 2 : 1;
    const flips = [];
    const dirs = [
      [0, -1], [0, 1], [-1, 0], [1, 0],
      [-1, -1], [1, -1], [-1, 1], [1, 1]
    ];
    for (let [dx, dy] of dirs) {
      let cx = x + dx, cy = y + dy;
      const ray = [];
      while (E1.inBounds(board, cx, cy) && E1.get(board, cx, cy) === opp) {
        ray.push([cx, cy]);
        cx += dx; cy += dy;
      }
      if (ray.length > 0 && E1.inBounds(board, cx, cy) && E1.get(board, cx, cy) === player) {
        flips.push(...ray);
      }
    }
    return flips;
  }
};

// E11: PSEUDO-3D RUNNER & ROAD ENGINE
const E11 = {
  project(p, cameraX, cameraY, cameraZ, cameraDepth = 0.8) {
    p.camera = {
      x: p.world.x - cameraX,
      y: p.world.y - cameraY,
      z: p.world.z - cameraZ
    };
    p.screen = {
      scale: cameraDepth / (p.camera.z || 0.0001),
      x: Math.floor(W / 2 + (cameraDepth * p.camera.x / p.camera.z) * W / 2),
      y: Math.floor(H / 2 - (cameraDepth * p.camera.y / p.camera.z) * H / 2),
      w: Math.floor((cameraDepth * p.world.w / p.camera.z) * W / 2)
    };
  }
};

// E12: GAUGE & REACTION ENGINE
const E12 = {
  createMeter(min = 0, max = 100, targetMin = 40, targetMax = 60) {
    return { val: (min + max) / 2, min, max, targetMin, targetMax, speed: 60 };
  },
  updateMeter(m, dt) {
    m.val += m.speed * dt;
    if (m.val > m.max) { m.val = m.max; m.speed = -Math.abs(m.speed); }
    if (m.val < m.min) { m.val = m.min; m.speed = Math.abs(m.speed); }
  },
  inTarget(m) {
    return m.val >= m.targetMin && m.val <= m.targetMax;
  }
};
