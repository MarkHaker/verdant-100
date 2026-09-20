// js/cartridges/cart_020_match_3.js
// ============================================================================
// Cartridge #020: MATCH-3
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 20. MATCH-3
CARTS[20] = {
  id: 20,
  name: "MATCH-3",
  genre: 1,
  scoreLabel: "GEMS",
  desc: "SWAP NEIGHBORING GEMS TO FORM LINES OF 3+ MATCHES AND CASCADE MULTIPLIERS!",
  ox: 50,
  oy: 36,
  sz: 26,

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Diamond gem (color 3)
    g.tri(x + 9, y + 10, x + 5, y + 16, x + 13, y + 16, 3);
    g.tri(x + 9, y + 22, x + 5, y + 16, x + 13, y + 16, 2);
    g.px(x + 9, y + 15, 3);
    // Square / Emerald cut gem (color 2)
    g.rect(x + 16, y + 12, 8, 8, 2);
    g.box(x + 16, y + 12, 8, 8, 3);
    g.px(x + 19, y + 15, 3);
    // Trilliant triangle gem (color 3)
    g.tri(x + 25, y + 19, x + 21, y + 27, x + 29, y + 27, 3);
    // Star sparkle
    g.px(x + 24, y + 8, 3);
    g.px(x + 23, y + 8, 2); g.px(x + 25, y + 8, 2);
    g.px(x + 24, y + 7, 2); g.px(x + 24, y + 9, 2);
  },

  init() {
    this.grid = E1.create(6, 6, 0);
    this.score = 0;
    this.moves = 30;
    this.maxMoves = 30;
    this.highScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? (SAVE.getScore(this.id) || 0) : 0;
    this.newHighScore = false;
    this.cx = 2;
    this.cy = 2;
    this.selected = null;
    this.state = 'IDLE'; // 'IDLE', 'SWAP', 'SWAP_BACK', 'MATCH', 'FALL', 'GAMEOVER'
    this.animTimer = 0;
    this.animDuration = 0;
    this.swapData = null;
    this.matchData = null;
    this.fallingGems = [];
    this.pendingGridData = null;
    this.combo = 1;
    this.particles = [];
    this.floatingTexts = [];
    this.time = 0;
    this.dragStart = null;
    this.shuffleBannerTimer = 0;

    this.generateBoard();
  },

  gemColor(v) {
    if (v >= 1 && v <= 5) return v;
    if (v >= 11 && v <= 15) return v - 10;
    if (v === 6) return 6;
    return 0;
  },

  isLineBomb(v) {
    return v >= 11 && v <= 15;
  },

  isHyper(v) {
    return v === 6;
  },

  generateBoard() {
    let attempts = 0;
    while (attempts < 200) {
      attempts++;
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
          const forbidden = [];
          if (x >= 2) {
            const c1 = this.gemColor(E1.get(this.grid, x - 1, y));
            const c2 = this.gemColor(E1.get(this.grid, x - 2, y));
            if (c1 > 0 && c1 === c2) forbidden.push(c1);
          }
          if (y >= 2) {
            const c1 = this.gemColor(E1.get(this.grid, x, y - 1));
            const c2 = this.gemColor(E1.get(this.grid, x, y - 2));
            if (c1 > 0 && c1 === c2) forbidden.push(c1);
          }
          const available = [1, 2, 3, 4, 5].filter(c => !forbidden.includes(c));
          const color = available[Math.floor(Math.random() * available.length)];
          E1.set(this.grid, x, y, color);
        }
      }
      if (this.findRawMatches().length === 0 && this.hasValidMove()) {
        return;
      }
    }
  },

  hasValidMove() {
    for (let i = 0; i < 36; i++) {
      if (this.grid.data[i] === 6) return true;
    }
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 5; x++) {
        E1.swap(this.grid, x, y, x + 1, y);
        const matches = this.findRawMatches();
        E1.swap(this.grid, x, y, x + 1, y);
        if (matches.length > 0) return true;
      }
    }
    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 5; y++) {
        E1.swap(this.grid, x, y, x, y + 1);
        const matches = this.findRawMatches();
        E1.swap(this.grid, x, y, x, y + 1);
        if (matches.length > 0) return true;
      }
    }
    return false;
  },

  findRawMatches() {
    const matched = new Set();
    for (let y = 0; y < 6; y++) {
      let runColor = 0, runStart = 0, runLen = 0;
      for (let x = 0; x < 6; x++) {
        const col = this.gemColor(E1.get(this.grid, x, y));
        if (col > 0 && col !== 6 && col === runColor) {
          runLen++;
        } else {
          if (runLen >= 3) {
            for (let k = 0; k < runLen; k++) matched.add(y * 6 + (runStart + k));
          }
          runColor = col;
          runStart = x;
          runLen = (col > 0 && col !== 6) ? 1 : 0;
        }
      }
      if (runLen >= 3) {
        for (let k = 0; k < runLen; k++) matched.add(y * 6 + (runStart + k));
      }
    }
    for (let x = 0; x < 6; x++) {
      let runColor = 0, runStart = 0, runLen = 0;
      for (let y = 0; y < 6; y++) {
        const col = this.gemColor(E1.get(this.grid, x, y));
        if (col > 0 && col !== 6 && col === runColor) {
          runLen++;
        } else {
          if (runLen >= 3) {
            for (let k = 0; k < runLen; k++) matched.add((runStart + k) * 6 + x);
          }
          runColor = col;
          runStart = y;
          runLen = (col > 0 && col !== 6) ? 1 : 0;
        }
      }
      if (runLen >= 3) {
        for (let k = 0; k < runLen; k++) matched.add((runStart + k) * 6 + x);
      }
    }
    return Array.from(matched);
  },

  analyzeMatches(lastSwapA, lastSwapB) {
    const hRuns = [];
    const vRuns = [];

    for (let y = 0; y < 6; y++) {
      let runColor = 0, runStart = 0, runLen = 0;
      for (let x = 0; x < 6; x++) {
        const col = this.gemColor(E1.get(this.grid, x, y));
        if (col > 0 && col !== 6 && col === runColor) {
          runLen++;
        } else {
          if (runLen >= 3) {
            hRuns.push({ y, startX: runStart, len: runLen, color: runColor });
          }
          runColor = col;
          runStart = x;
          runLen = (col > 0 && col !== 6) ? 1 : 0;
        }
      }
      if (runLen >= 3) {
        hRuns.push({ y, startX: runStart, len: runLen, color: runColor });
      }
    }

    for (let x = 0; x < 6; x++) {
      let runColor = 0, runStart = 0, runLen = 0;
      for (let y = 0; y < 6; y++) {
        const col = this.gemColor(E1.get(this.grid, x, y));
        if (col > 0 && col !== 6 && col === runColor) {
          runLen++;
        } else {
          if (runLen >= 3) {
            vRuns.push({ x, startY: runStart, len: runLen, color: runColor });
          }
          runColor = col;
          runStart = y;
          runLen = (col > 0 && col !== 6) ? 1 : 0;
        }
      }
      if (runLen >= 3) {
        vRuns.push({ x, startY: runStart, len: runLen, color: runColor });
      }
    }

    if (hRuns.length === 0 && vRuns.length === 0) return null;

    const matchedCoords = new Map();
    const specialsToCreate = [];
    const usedH = new Set();
    const usedV = new Set();

    // Check for L/T intersections -> creates Hyper-Gem
    for (let hi = 0; hi < hRuns.length; hi++) {
      const hr = hRuns[hi];
      for (let vi = 0; vi < vRuns.length; vi++) {
        const vr = vRuns[vi];
        if (hr.color === vr.color) {
          if (vr.x >= hr.startX && vr.x < hr.startX + hr.len &&
              hr.y >= vr.startY && hr.y < vr.startY + vr.len) {
            usedH.add(hi);
            usedV.add(vi);
            let spawnX = vr.x, spawnY = hr.y;
            if (lastSwapA && ( (lastSwapA.x === vr.x && lastSwapA.y >= vr.startY && lastSwapA.y < vr.startY + vr.len) ||
                               (lastSwapA.y === hr.y && lastSwapA.x >= hr.startX && lastSwapA.x < hr.startX + hr.len) )) {
              spawnX = lastSwapA.x; spawnY = lastSwapA.y;
            } else if (lastSwapB && ( (lastSwapB.x === vr.x && lastSwapB.y >= vr.startY && lastSwapB.y < vr.startY + vr.len) ||
                                      (lastSwapB.y === hr.y && lastSwapB.x >= hr.startX && lastSwapB.x < hr.startX + hr.len) )) {
              spawnX = lastSwapB.x; spawnY = lastSwapB.y;
            }
            specialsToCreate.push({ x: spawnX, y: spawnY, type: 6 });
          }
        }
      }
    }

    // Process remaining horizontal runs
    for (let hi = 0; hi < hRuns.length; hi++) {
      if (usedH.has(hi)) continue;
      const hr = hRuns[hi];
      if (hr.len >= 5) {
        let spawnX = hr.startX + Math.floor(hr.len / 2);
        if (lastSwapA && lastSwapA.y === hr.y && lastSwapA.x >= hr.startX && lastSwapA.x < hr.startX + hr.len) spawnX = lastSwapA.x;
        else if (lastSwapB && lastSwapB.y === hr.y && lastSwapB.x >= hr.startX && lastSwapB.x < hr.startX + hr.len) spawnX = lastSwapB.x;
        specialsToCreate.push({ x: spawnX, y: hr.y, type: 6 });
      } else if (hr.len === 4) {
        let spawnX = hr.startX + 1;
        if (lastSwapA && lastSwapA.y === hr.y && lastSwapA.x >= hr.startX && lastSwapA.x < hr.startX + hr.len) spawnX = lastSwapA.x;
        else if (lastSwapB && lastSwapB.y === hr.y && lastSwapB.x >= hr.startX && lastSwapB.x < hr.startX + hr.len) spawnX = lastSwapB.x;
        specialsToCreate.push({ x: spawnX, y: hr.y, type: hr.color + 10 });
      }
    }

    // Process remaining vertical runs
    for (let vi = 0; vi < vRuns.length; vi++) {
      if (usedV.has(vi)) continue;
      const vr = vRuns[vi];
      if (vr.len >= 5) {
        let spawnY = vr.startY + Math.floor(vr.len / 2);
        if (lastSwapA && lastSwapA.x === vr.x && lastSwapA.y >= vr.startY && lastSwapA.y < vr.startY + vr.len) spawnY = lastSwapA.y;
        else if (lastSwapB && lastSwapB.x === vr.x && lastSwapB.y >= vr.startY && lastSwapB.y < vr.startY + vr.len) spawnY = lastSwapB.y;
        specialsToCreate.push({ x: vr.x, y: spawnY, type: 6 });
      } else if (vr.len === 4) {
        let spawnY = vr.startY + 1;
        if (lastSwapA && lastSwapA.x === vr.x && lastSwapA.y >= vr.startY && lastSwapA.y < vr.startY + vr.len) spawnY = lastSwapA.y;
        else if (lastSwapB && lastSwapB.x === vr.x && lastSwapB.y >= vr.startY && lastSwapB.y < vr.startY + vr.len) spawnY = lastSwapB.y;
        specialsToCreate.push({ x: vr.x, y: spawnY, type: vr.color + 10 });
      }
    }

    for (const hr of hRuns) {
      for (let k = 0; k < hr.len; k++) {
        const x = hr.startX + k, y = hr.y;
        matchedCoords.set(`${x},${y}`, { x, y });
      }
    }
    for (const vr of vRuns) {
      for (let k = 0; k < vr.len; k++) {
        const x = vr.x, y = vr.startY + k;
        matchedCoords.set(`${x},${y}`, { x, y });
      }
    }

    return {
      matchedCoords: Array.from(matchedCoords.values()),
      specialsToCreate
    };
  },

  expandDestroyedSet(baseCoords) {
    const destroyed = new Map();
    const lineBombQueue = [];
    const processedBombs = new Set();

    for (const pt of baseCoords) {
      destroyed.set(`${pt.x},${pt.y}`, pt);
      const val = E1.get(this.grid, pt.x, pt.y);
      if (this.isLineBomb(val)) {
        lineBombQueue.push(pt);
        processedBombs.add(`${pt.x},${pt.y}`);
      }
    }

    let hadBomb = lineBombQueue.length > 0;
    while (lineBombQueue.length > 0) {
      const bomb = lineBombQueue.shift();
      for (let x = 0; x < 6; x++) {
        const key = `${x},${bomb.y}`;
        if (!destroyed.has(key)) {
          const pt = { x, y: bomb.y };
          destroyed.set(key, pt);
          const v = E1.get(this.grid, x, bomb.y);
          if (this.isLineBomb(v) && !processedBombs.has(key)) {
            lineBombQueue.push(pt);
            processedBombs.add(key);
          }
        }
      }
      for (let y = 0; y < 6; y++) {
        const key = `${bomb.x},${y}`;
        if (!destroyed.has(key)) {
          const pt = { x: bomb.x, y };
          destroyed.set(key, pt);
          const v = E1.get(this.grid, bomb.x, y);
          if (this.isLineBomb(v) && !processedBombs.has(key)) {
            lineBombQueue.push(pt);
            processedBombs.add(key);
          }
        }
      }
    }

    return {
      allDestroyed: Array.from(destroyed.values()),
      hadBomb
    };
  },

  shuffleBoard() {
    this.shuffleBannerTimer = 1.0;
    APU.sfx('SWISH');
    let attempts = 0;
    while (attempts < 100) {
      attempts++;
      for (let i = 35; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = this.grid.data[i];
        this.grid.data[i] = this.grid.data[j];
        this.grid.data[j] = tmp;
      }
      if (this.findRawMatches().length === 0 && this.hasValidMove()) {
        return;
      }
    }
    this.generateBoard();
  },

  addFloatingText(text, x, y, color = 3) {
    this.floatingTexts.push({ text, x, y, color, life: 0.8, maxLife: 0.8, vy: -18 });
  },

  spawnGemBurst(px, py, count = 8) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 20 + Math.random() * 60;
      if (this.particles.length < 100) {
        this.particles.push({
          x: px,
          y: py,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 10,
          color: Math.random() < 0.6 ? 3 : 2,
          life: 0.25 + Math.random() * 0.15
        });
      }
    }
  },

  playComboSound(combo) {
    if (combo <= 1) {
      APU.sfx('COIN');
    } else if (combo === 2) {
      APU.softTone(659.25, 0.10, 'sine', 0.09, 0, 0.01, 1800);
      APU.softTone(783.99, 0.14, 'sine', 0.09, 0.035, 0.01, 1800);
    } else if (combo === 3) {
      APU.softTone(783.99, 0.12, 'sine', 0.10, 0, 0.01, 2000);
      APU.softTone(987.77, 0.16, 'sine', 0.10, 0.035, 0.01, 2000);
    } else if (combo === 4) {
      APU.softTone(987.77, 0.13, 'sine', 0.11, 0, 0.01, 2200);
      APU.softTone(1318.51, 0.18, 'sine', 0.11, 0.035, 0.01, 2200);
    } else {
      APU.sfx('POWER');
      APU.softTone(1567.98, 0.20, 'sine', 0.12, 0.05, 0.01, 2400);
    }
  },

  initiateSwap(x1, y1, x2, y2) {
    if (this.state !== 'IDLE') return;
    const val1 = E1.get(this.grid, x1, y1);
    const val2 = E1.get(this.grid, x2, y2);
    if (val1 === 0 || val2 === 0) return;

    this.state = 'SWAP';
    this.animDuration = 0.12;
    this.animTimer = 0.12;
    this.swapData = {
      x1, y1, x2, y2,
      val1, val2,
      isHyper: (val1 === 6 || val2 === 6)
    };
    APU.sfx('SWISH');
  },

  triggerMatchAnimation(destroyedCoords, specialsToCreate) {
    this.state = 'MATCH';
    this.animDuration = 0.15;
    this.animTimer = 0.15;
    this.matchData = { destroyedCoords, specialsToCreate };

    const count = destroyedCoords.length;
    const points = count * 10 * this.combo;
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.newHighScore = true;
    }
    SAVE.setScore(this.id, this.score);

    const centerPt = destroyedCoords[Math.floor(destroyedCoords.length / 2)] || { x: 2, y: 2 };
    this.addFloatingText(`+${points}`, this.ox + centerPt.x * this.sz + 13, this.oy + centerPt.y * this.sz);

    if (this.combo > 1) {
      this.addFloatingText(`x${this.combo} COMBO!`, 128, 26, 3);
    }

    this.playComboSound(this.combo);

    for (const pt of destroyedCoords) {
      const px = this.ox + pt.x * this.sz + 13;
      const py = this.oy + pt.y * this.sz + 13;
      this.spawnGemBurst(px, py, 6);
    }

    if (specialsToCreate && specialsToCreate.length > 0) {
      for (const sp of specialsToCreate) {
        if (sp.type === 6) {
          this.addFloatingText("HYPER GEM!", this.ox + sp.x * this.sz + 13, this.oy + sp.y * this.sz - 6, 3);
          APU.sfx('POWER');
        } else {
          this.addFloatingText("LINE BOMB!", this.ox + sp.x * this.sz + 13, this.oy + sp.y * this.sz - 6, 3);
          APU.sfx('HIT');
        }
      }
    }
  },

  triggerHyperSwap(hyperPt, otherPt) {
    this.moves--;
    const targetVal = E1.get(this.grid, otherPt.x, otherPt.y);
    const isDualHyper = (targetVal === 6);
    const targetColor = this.gemColor(targetVal);

    const destroyed = [hyperPt];
    if (isDualHyper) {
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
          if (!(x === hyperPt.x && y === hyperPt.y)) destroyed.push({ x, y });
        }
      }
      this.addFloatingText("SUPERNOVA!", 128, 48, 3);
    } else {
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
          if (x === otherPt.x && y === otherPt.y) {
            destroyed.push({ x, y });
          } else {
            const v = E1.get(this.grid, x, y);
            if (this.gemColor(v) === targetColor) destroyed.push({ x, y });
          }
        }
      }
      this.addFloatingText("HYPER CLEAR!", 128, 48, 3);
    }

    APU.sfx('POWER');
    const { allDestroyed, hadBomb } = this.expandDestroyedSet(destroyed);
    if (hadBomb) APU.sfx('BOOM');
    this.triggerMatchAnimation(allDestroyed, []);
  },

  finishMatchAndStartFall() {
    const { destroyedCoords, specialsToCreate } = this.matchData;
    for (const pt of destroyedCoords) {
      E1.set(this.grid, pt.x, pt.y, 0);
    }
    for (const sp of specialsToCreate) {
      E1.set(this.grid, sp.x, sp.y, sp.type);
    }

    const fallingGems = [];
    const newGridData = [...this.grid.data];

    for (let x = 0; x < 6; x++) {
      let writeY = 5;
      for (let y = 5; y >= 0; y--) {
        const val = E1.get(this.grid, x, y);
        if (val !== 0) {
          fallingGems.push({ x, fromY: y, toY: writeY, val });
          newGridData[writeY * 6 + x] = val;
          writeY--;
        }
      }
      let spawnOffset = 1;
      while (writeY >= 0) {
        const newVal = Math.floor(Math.random() * 5) + 1;
        fallingGems.push({ x, fromY: -spawnOffset, toY: writeY, val: newVal });
        newGridData[writeY * 6 + x] = newVal;
        writeY--;
        spawnOffset++;
      }
    }

    this.pendingGridData = newGridData;
    this.fallingGems = fallingGems;
    this.state = 'FALL';
    this.animDuration = 0.15;
    this.animTimer = 0.15;
  },

  finishFall() {
    this.grid.data = this.pendingGridData;
    this.pendingGridData = null;
    this.fallingGems = [];

    APU.softTone(260, 0.03, 'triangle', 0.04, 0, 0.005, 900);

    const analysis = this.analyzeMatches(null, null);
    if (analysis && analysis.matchedCoords.length > 0) {
      this.combo++;
      const { allDestroyed, hadBomb } = this.expandDestroyedSet(analysis.matchedCoords);
      if (hadBomb) APU.sfx('BOOM');
      this.triggerMatchAnimation(allDestroyed, analysis.specialsToCreate);
    } else {
      this.combo = 1;
      if (this.moves <= 0) {
        this.state = 'GAMEOVER';
        SAVE.setScore(this.id, this.score);
        APU.sfx(this.newHighScore ? 'LEVELUP' : 'UI_OK');
      } else {
        if (!this.hasValidMove()) {
          this.shuffleBoard();
        }
        this.state = 'IDLE';
      }
    }
  },

  update(dt) {
    this.time += dt;

    if (this.shuffleBannerTimer > 0) {
      this.shuffleBannerTimer = Math.max(0, this.shuffleBannerTimer - dt);
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 80 * dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y += ft.vy * dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    if (this.state === 'SWAP') {
      this.animTimer -= dt;
      if (this.animTimer <= 0) {
        const { x1, y1, x2, y2, val1, val2, isHyper } = this.swapData;
        E1.swap(this.grid, x1, y1, x2, y2);
        if (isHyper) {
          const hyperPt = (val1 === 6) ? { x: x2, y: y2 } : { x: x1, y: y1 };
          const otherPt = (val1 === 6) ? { x: x1, y: y1 } : { x: x2, y: y2 };
          this.triggerHyperSwap(hyperPt, otherPt);
        } else {
          const analysis = this.analyzeMatches({ x: x1, y: y1 }, { x: x2, y: y2 });
          if (analysis && analysis.matchedCoords.length > 0) {
            this.moves--;
            this.combo = 1;
            const { allDestroyed, hadBomb } = this.expandDestroyedSet(analysis.matchedCoords);
            if (hadBomb) APU.sfx('BOOM');
            this.triggerMatchAnimation(allDestroyed, analysis.specialsToCreate);
          } else {
            this.state = 'SWAP_BACK';
            this.animDuration = 0.12;
            this.animTimer = 0.12;
            APU.sfx('DENY');
          }
        }
      }
      return;
    }

    if (this.state === 'SWAP_BACK') {
      this.animTimer -= dt;
      if (this.animTimer <= 0) {
        const { x1, y1, x2, y2 } = this.swapData;
        E1.swap(this.grid, x1, y1, x2, y2);
        this.swapData = null;
        this.state = 'IDLE';
      }
      return;
    }

    if (this.state === 'MATCH') {
      this.animTimer -= dt;
      if (this.animTimer <= 0) {
        this.finishMatchAndStartFall();
      }
      return;
    }

    if (this.state === 'FALL') {
      this.animTimer -= dt;
      if (this.animTimer <= 0) {
        this.finishFall();
      }
      return;
    }

    if (this.state === 'GAMEOVER') {
      if (PAD.hit('a') || PAD.hit('start') || PAD.tapPos) {
        this.init();
        APU.sfx('UI_OK');
      }
      return;
    }

    // STATE: IDLE
    if (PAD.hit('left'))  { this.cx = Math.max(0, this.cx - 1); APU.sfx('UI_MOVE'); }
    if (PAD.hit('right')) { this.cx = Math.min(5, this.cx + 1); APU.sfx('UI_MOVE'); }
    if (PAD.hit('up'))    { this.cy = Math.max(0, this.cy - 1); APU.sfx('UI_MOVE'); }
    if (PAD.hit('down'))  { this.cy = Math.min(5, this.cy + 1); APU.sfx('UI_MOVE'); }

    if (PAD.hit('b')) {
      if (this.selected) {
        this.selected = null;
        APU.sfx('UI_BACK');
      }
    }

    if (PAD.hit('a')) {
      if (!this.selected) {
        this.selected = { x: this.cx, y: this.cy };
        APU.sfx('TICK');
      } else {
        const dx = Math.abs(this.cx - this.selected.x);
        const dy = Math.abs(this.cy - this.selected.y);
        if (dx === 0 && dy === 0) {
          this.selected = null;
          APU.sfx('TICK');
        } else if (dx + dy === 1) {
          this.initiateSwap(this.selected.x, this.selected.y, this.cx, this.cy);
          this.selected = null;
        } else {
          this.selected = { x: this.cx, y: this.cy };
          APU.sfx('TICK');
        }
      }
    }

    // Direct touch drag tracking
    if (PAD.pointer && PAD.pointer.down) {
      const px = PAD.pointer.x, py = PAD.pointer.y;
      const gx = Math.floor((px - this.ox) / this.sz);
      const gy = Math.floor((py - this.oy) / this.sz);
      if (gx >= 0 && gx < 6 && gy >= 0 && gy < 6) {
        if (!this.dragStart) {
          this.dragStart = { x: gx, y: gy, startPx: px, startPy: py };
          this.cx = gx; this.cy = gy;
        } else {
          const dx = Math.abs(gx - this.dragStart.x);
          const dy = Math.abs(gy - this.dragStart.y);
          if (dx + dy === 1) {
            this.initiateSwap(this.dragStart.x, this.dragStart.y, gx, gy);
            this.selected = null;
            this.dragStart = null;
          } else {
            const dpx = px - this.dragStart.startPx;
            const dpy = py - this.dragStart.startPy;
            if (Math.hypot(dpx, dpy) >= 15) {
              let tx = this.dragStart.x, ty = this.dragStart.y;
              if (Math.abs(dpx) > Math.abs(dpy)) {
                tx += dpx > 0 ? 1 : -1;
              } else {
                ty += dpy > 0 ? 1 : -1;
              }
              if (tx >= 0 && tx < 6 && ty >= 0 && ty < 6) {
                this.initiateSwap(this.dragStart.x, this.dragStart.y, tx, ty);
                this.selected = null;
                this.dragStart = null;
              }
            }
          }
        }
      }
    } else {
      this.dragStart = null;
    }

    // Mobile swipe gesture
    if (PAD.swipe) {
      const dirMap = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };
      const d = dirMap[PAD.swipe];
      if (d) {
        const fx = this.selected ? this.selected.x : this.cx;
        const fy = this.selected ? this.selected.y : this.cy;
        const tx = fx + d[0], ty = fy + d[1];
        if (tx >= 0 && tx < 6 && ty >= 0 && ty < 6) {
          this.initiateSwap(fx, fy, tx, ty);
          this.selected = null;
        }
      }
      PAD.swipe = null;
    }

    // Tap to select / tap adjacent to swap
    if (PAD.tapPos) {
      const tx = Math.floor((PAD.tapPos.x - this.ox) / this.sz);
      const ty = Math.floor((PAD.tapPos.y - this.oy) / this.sz);
      if (tx >= 0 && tx < 6 && ty >= 0 && ty < 6) {
        if (!this.selected) {
          this.selected = { x: tx, y: ty };
          this.cx = tx; this.cy = ty;
          APU.sfx('TICK');
        } else {
          const dx = Math.abs(tx - this.selected.x);
          const dy = Math.abs(ty - this.selected.y);
          if (dx === 0 && dy === 0) {
            this.selected = null;
            APU.sfx('TICK');
          } else if (dx + dy === 1) {
            this.initiateSwap(this.selected.x, this.selected.y, tx, ty);
            this.selected = null;
            this.cx = tx; this.cy = ty;
          } else {
            this.selected = { x: tx, y: ty };
            this.cx = tx; this.cy = ty;
            APU.sfx('TICK');
          }
        }
      }
      PAD.tapPos = null;
    }
  },

  drawGem(g, bx, by, sz, val, scale = 1, flash = false) {
    if (val <= 0) return;
    const cx = Math.floor(bx + sz / 2);
    const cy = Math.floor(by + sz / 2);
    const base = this.gemColor(val);
    const isLineBomb = this.isLineBomb(val);
    const isHyper = (val === 6);

    if (flash) {
      g.disc(cx, cy, Math.floor(9 * scale), 3);
      g.px(cx - 3, cy, 0); g.px(cx + 3, cy, 0);
      g.px(cx, cy - 3, 0); g.px(cx, cy + 3, 0);
      return;
    }

    if (isHyper) {
      const r = Math.floor(8 * scale);
      g.disc(cx, cy, r, 1);
      g.circle(cx, cy, r, 3);
      g.line(cx - r - 2, cy, cx + r + 2, cy, 3);
      g.line(cx, cy - r - 2, cx, cy + r + 2, 3);
      const diag = Math.floor(5 * scale);
      g.line(cx - diag, cy - diag, cx + diag, cy + diag, 2);
      g.line(cx - diag, cy + diag, cx + diag, cy - diag, 2);
      const cr = Math.floor(4 * scale);
      g.tri(cx, cy - cr, cx - cr, cy, cx + cr, cy, 3);
      g.tri(cx, cy + cr, cx - cr, cy, cx + cr, cy, 3);
      g.px(cx, cy, 0);
      g.px(cx - 3, cy - 3, 3); g.px(cx + 3, cy - 3, 3);
      g.px(cx - 3, cy + 3, 3); g.px(cx + 3, cy + 3, 3);
      return;
    }

    // 1. Diamond / Rhombus (color 3)
    if (base === 1) {
      const rx = Math.floor(9 * scale);
      const ry = Math.floor(9 * scale);
      g.tri(cx, cy - ry, cx - rx, cy, cx + rx, cy, 3);
      g.tri(cx, cy + ry, cx - rx, cy, cx + rx, cy, 2);
      const tx = Math.floor(4 * scale);
      const ty = Math.floor(4 * scale);
      g.tri(cx, cy - ty, cx - tx, cy, cx + tx, cy, 2);
      g.tri(cx, cy + ty, cx - tx, cy, cx + tx, cy, 1);
      g.line(cx, cy - ry, cx, cy - ty, 3);
      g.line(cx, cy + ry, cx, cy + ty, 3);
      g.line(cx - rx, cy, cx - tx, cy, 3);
      g.line(cx + rx, cy, cx + tx, cy, 3);
      g.line(cx, cy - ry, cx + rx, cy, 3);
      g.line(cx + rx, cy, cx, cy + ry, 3);
      g.line(cx, cy + ry, cx - rx, cy, 3);
      g.line(cx - rx, cy, cx, cy - ry, 3);
      g.px(cx - 2, cy - 2, 3);
    }
    // 2. Square / Emerald cut with beveled facets (color 2)
    else if (base === 2) {
      const s = Math.floor(16 * scale);
      const hs = Math.floor(s / 2);
      const x0 = cx - hs, y0 = cy - hs;
      g.rect(x0, y0, s, s, 2);
      const b = Math.max(2, Math.floor(3 * scale));
      for (let i = 0; i < b; i++) {
        for (let j = 0; j < b - i; j++) {
          g.px(x0 + i, y0 + j, 0);
          g.px(x0 + s - 1 - i, y0 + j, 0);
          g.px(x0 + i, y0 + s - 1 - j, 0);
          g.px(x0 + s - 1 - i, y0 + s - 1 - j, 0);
        }
      }
      const ts = Math.floor(8 * scale);
      const tx = cx - Math.floor(ts / 2), ty = cy - Math.floor(ts / 2);
      g.rect(tx, ty, ts, ts, 1);
      g.box(tx, ty, ts, ts, 3);
      g.line(tx, ty, x0 + b, y0 + b, 3);
      g.line(tx + ts - 1, ty, x0 + s - 1 - b, y0 + b, 3);
      g.line(tx, ty + ts - 1, x0 + b, y0 + s - 1 - b, 2);
      g.line(tx + ts - 1, ty + ts - 1, x0 + s - 1 - b, y0 + s - 1 - b, 2);
      g.line(x0 + b, y0, x0 + s - 1 - b, y0, 3);
      g.line(x0, y0 + b, x0, y0 + s - 1 - b, 3);
      g.line(x0 + b, y0 + s - 1, x0 + s - 1 - b, y0 + s - 1, 2);
      g.line(x0 + s - 1, y0 + b, x0 + s - 1, y0 + s - 1 - b, 2);
    }
    // 3. Triangle / Trilliant cut (color 3)
    else if (base === 3) {
      const rx = Math.floor(9 * scale);
      const ry = Math.floor(8 * scale);
      const topY = cy - ry;
      const botY = cy + ry - 1;
      g.tri(cx, topY, cx - rx, botY, cx + rx, botY, 2);
      const itx = Math.floor(4 * scale);
      const ity = Math.floor(3 * scale);
      g.tri(cx - itx, cy - ity, cx + itx, cy - ity, cx, cy + ity + 1, 3);
      g.line(cx, topY, cx - itx, cy - ity, 3);
      g.line(cx, topY, cx + itx, cy - ity, 3);
      g.line(cx - rx, botY, cx - itx, cy - ity, 3);
      g.line(cx - rx, botY, cx, cy + ity + 1, 2);
      g.line(cx + rx, botY, cx + itx, cy - ity, 3);
      g.line(cx + rx, botY, cx, cy + ity + 1, 2);
      g.line(cx, topY, cx + rx, botY, 3);
      g.line(cx + rx, botY, cx - rx, botY, 3);
      g.line(cx - rx, botY, cx, topY, 3);
      g.px(cx, topY, 3);
    }
    // 4. Circle / Round brilliant with star core (color 2)
    else if (base === 4) {
      const r = Math.floor(8 * scale);
      g.disc(cx, cy, r, 2);
      g.circle(cx, cy, r, 3);
      g.px(cx, cy, 3);
      g.px(cx - 1, cy, 3); g.px(cx + 1, cy, 3);
      g.px(cx, cy - 1, 3); g.px(cx, cy + 1, 3);
      g.px(cx - 2, cy, 3); g.px(cx + 2, cy, 3);
      g.px(cx, cy - 2, 3); g.px(cx, cy + 2, 3);
      const fr = Math.floor(5 * scale);
      g.line(cx - 2, cy - 2, cx - fr, cy - fr, 3);
      g.line(cx + 2, cy - 2, cx + fr, cy - fr, 3);
      g.line(cx - 2, cy + 2, cx - fr, cy + fr, 1);
      g.line(cx + 2, cy + 2, cx + fr, cy + fr, 2);
    }
    // 5. Hexagon / Honeycomb cut (color 1/3)
    else if (base === 5) {
      const rx = Math.floor(8 * scale);
      const ry = Math.floor(8 * scale);
      const my = Math.floor(4 * scale);
      const v0 = [cx, cy - ry];
      const v1 = [cx + rx, cy - my];
      const v2 = [cx + rx, cy + my];
      const v3 = [cx, cy + ry];
      const v4 = [cx - rx, cy + my];
      const v5 = [cx - rx, cy - my];
      g.tri(cx, cy, v0[0], v0[1], v1[0], v1[1], 3);
      g.tri(cx, cy, v1[0], v1[1], v2[0], v2[1], 2);
      g.tri(cx, cy, v2[0], v2[1], v3[0], v3[1], 1);
      g.tri(cx, cy, v3[0], v3[1], v4[0], v4[1], 2);
      g.tri(cx, cy, v4[0], v4[1], v5[0], v5[1], 1);
      g.tri(cx, cy, v5[0], v5[1], v0[0], v0[1], 3);
      g.line(v0[0], v0[1], v1[0], v1[1], 3);
      g.line(v1[0], v1[1], v2[0], v2[1], 3);
      g.line(v2[0], v2[1], v3[0], v3[1], 3);
      g.line(v3[0], v3[1], v4[0], v4[1], 3);
      g.line(v4[0], v4[1], v5[0], v5[1], 3);
      g.line(v5[0], v5[1], v0[0], v0[1], 3);
      g.px(cx, cy, 3);
    }

    // Line-Bomb: flashing crossbar (+)
    if (isLineBomb) {
      const flash = ((this.time * 8) | 0) % 2 === 0 ? 3 : 2;
      g.rect(bx + 2, cy - 1, sz - 4, 3, flash);
      g.rect(cx - 1, by + 2, 3, sz - 4, flash);
      g.rect(cx - 2, cy - 2, 5, 5, 0);
      g.rect(cx - 1, cy - 1, 3, 3, 3);
    }
  },

  render(g) {
    g.clear(0);

    // Grid frame
    g.box(this.ox - 2, this.oy - 2, 6 * this.sz + 4, 6 * this.sz + 4, 2);
    g.box(this.ox - 3, this.oy - 3, 6 * this.sz + 6, 6 * this.sz + 6, 1);

    // Top HUD
    g.text("MATCH-3 GEMS", 14, 8, 3);
    g.textR("SCORE: " + this.score, 242, 8, 3);

    const moveColor = (this.moves <= 5 && (Math.floor(this.time * 6) % 2 === 0)) ? 2 : 3;
    g.text("MOVES: " + this.moves, 14, 19, moveColor);
    g.textR("BEST: " + this.highScore, 242, 19, 2);

    // Grid boxes
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const bx = this.ox + x * this.sz;
        const by = this.oy + y * this.sz;
        g.box(bx, by, this.sz, this.sz, 1);
      }
    }

    // Gems rendering depending on state
    if (this.state === 'FALL') {
      const t = 1 - Math.max(0, this.animTimer / this.animDuration);
      const gravT = t * t;
      for (let i = 0; i < this.fallingGems.length; i++) {
        const gem = this.fallingGems[i];
        const curY = gem.fromY + (gem.toY - gem.fromY) * gravT;
        if (curY >= -0.5) {
          const gx = this.ox + gem.x * this.sz;
          const gy = this.oy + curY * this.sz;
          this.drawGem(g, gx, gy, this.sz, gem.val);
        }
      }
    } else if (this.state === 'SWAP' || this.state === 'SWAP_BACK') {
      const { x1, y1, x2, y2, val1, val2 } = this.swapData;
      const t = 1 - Math.max(0, this.animTimer / this.animDuration);
      const ease = 0.5 - 0.5 * Math.cos(t * Math.PI);

      // Draw all non-swapping gems
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
          if ((x === x1 && y === y1) || (x === x2 && y === y2)) continue;
          const bx = this.ox + x * this.sz, by = this.oy + y * this.sz;
          this.drawGem(g, bx, by, this.sz, E1.get(this.grid, x, y));
        }
      }

      // Draw sliding gems
      let g1x, g1y, g2x, g2y;
      if (this.state === 'SWAP') {
        g1x = this.ox + (x1 + (x2 - x1) * ease) * this.sz;
        g1y = this.oy + (y1 + (y2 - y1) * ease) * this.sz;
        g2x = this.ox + (x2 + (x1 - x2) * ease) * this.sz;
        g2y = this.oy + (y2 + (y1 - y2) * ease) * this.sz;
      } else {
        g1x = this.ox + (x2 + (x1 - x2) * ease) * this.sz;
        g1y = this.oy + (y2 + (y1 - y2) * ease) * this.sz;
        g2x = this.ox + (x1 + (x2 - x1) * ease) * this.sz;
        g2y = this.oy + (y1 + (y2 - y1) * ease) * this.sz;
      }
      this.drawGem(g, g1x, g1y, this.sz, val1);
      this.drawGem(g, g2x, g2y, this.sz, val2);
    } else if (this.state === 'MATCH') {
      const destroyedSet = new Set(this.matchData.destroyedCoords.map(pt => `${pt.x},${pt.y}`));
      const t = 1 - Math.max(0, this.animTimer / this.animDuration);
      const flash = (Math.floor(this.time * 20) % 2 === 0);

      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
          const bx = this.ox + x * this.sz, by = this.oy + y * this.sz;
          const val = E1.get(this.grid, x, y);
          if (destroyedSet.has(`${x},${y}`)) {
            this.drawGem(g, bx, by, this.sz, val, Math.max(0.2, 1 - t * 0.4), flash);
          } else {
            this.drawGem(g, bx, by, this.sz, val);
          }
        }
      }
    } else {
      // IDLE or GAMEOVER: draw normal grid
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
          const bx = this.ox + x * this.sz, by = this.oy + y * this.sz;
          const val = E1.get(this.grid, x, y);
          this.drawGem(g, bx, by, this.sz, val);
        }
      }
    }

    // Cursor & Selection overlays
    if (this.state === 'IDLE') {
      if (this.selected) {
        const sbx = this.ox + this.selected.x * this.sz;
        const sby = this.oy + this.selected.y * this.sz;
        const selC = (Math.floor(this.time * 8) % 2 === 0) ? 3 : 2;
        g.box(sbx - 1, sby - 1, this.sz + 2, this.sz + 2, selC);
        g.box(sbx - 2, sby - 2, this.sz + 4, this.sz + 4, 3);
      }
      const cbx = this.ox + this.cx * this.sz;
      const cby = this.oy + this.cy * this.sz;
      g.box(cbx - 1, cby - 1, this.sz + 2, this.sz + 2, 2);
    }

    // Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      g.px(p.x, p.y, p.color);
    }

    // Floating text
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      g.text(ft.text, ft.x - Math.floor(ft.text.length * 2.5), ft.y, ft.color);
    }

    // Shuffle banner
    if (this.shuffleBannerTimer > 0) {
      g.rect(60, 102, 136, 24, 0);
      g.box(60, 102, 136, 24, 3);
      g.textC("NO MOVES - SHUFFLE!", 110, 3);
    }

    // Bottom tip
    g.textC("D-PAD+A: SWAP  |  TOUCH & DRAG", 226, 1);

    // Game Over modal overlay
    if (this.state === 'GAMEOVER') {
      g.rect(28, 54, 200, 128, 0);
      g.box(28, 54, 200, 128, 2);
      g.box(30, 56, 196, 124, 3);

      g.textC("30-MOVE CHALLENGE", 66, 2);
      g.textC("FINAL SCORE", 82, 1);
      g.textC("" + this.score, 94, 3, 2);

      if (this.newHighScore) {
        const flash = (Math.floor(this.time * 6) % 2 === 0) ? 3 : 2;
        g.textC("★ NEW HIGH SCORE! ★", 118, flash);
      } else {
        g.textC("BEST: " + this.highScore, 118, 2);
      }

      const tapPrompt = (Math.floor(this.time * 4) % 2 === 0) ? 3 : 2;
      g.textC("PRESS [A] TO PLAY AGAIN", 144, tapPrompt);
      g.textC("OR TAP SCREEN", 156, 1);
    }
  }
};


// ============================================================================
// CARTRIDGES 21 - 40 (BLOCK 3: PHYSICS & BLOCK 4: RHYTHM/REACTION)
// ============================================================================;
