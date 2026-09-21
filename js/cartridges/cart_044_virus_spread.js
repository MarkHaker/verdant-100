// js/cartridges/cart_044_virus_spread.js
// ============================================================================
// Cartridge #044: VIRUS SPREAD
// Genre: STRATEGY (4) | Tactical Ataxx/Infection Board Conquest
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

(function() {
  // --------------------------------------------------------------------------
  // 4 PROGRESSIVE ARENA LAYOUTS
  // --------------------------------------------------------------------------
  const LAYOUTS = [
    {
      name: "STANDARD ARENA",
      shortName: "STANDARD",
      desc: "CLASSIC 7x7 OPEN PETRI DISH",
      obstacles: []
    },
    {
      name: "BIO-ISLANDS",
      shortName: "ISLANDS",
      desc: "4 CENTRAL HAZARD PILLARS",
      obstacles: [
        [2, 2], [4, 2],
        [2, 4], [4, 4]
      ]
    },
    {
      name: "CORNER POCKETS",
      shortName: "POCKETS",
      desc: "CHOKE CORRIDORS & DEFENSIVE NESTS",
      obstacles: [
        [1, 2], [2, 1], [2, 2],
        [5, 2], [4, 1], [4, 2],
        [1, 4], [2, 5], [2, 4],
        [5, 4], [4, 5], [4, 4]
      ]
    },
    {
      name: "CRUCIFORM",
      shortName: "CRUCIFORM",
      desc: "QUADRANT BARRIERS & CENTRAL NEXUS",
      obstacles: [
        [3, 1], [3, 2], [3, 4], [3, 5],
        [1, 3], [2, 3], [4, 3], [5, 3]
      ]
    }
  ];

  CARTS[44] = {
    id: 44,
    name: "VIRUS SPREAD",
    genre: 4,
    scoreLabel: "CELLS",
    desc: "INVASION BOARD: CLONE TO ADJACENT CELL OR JUMP 2 SPACES TO CONVERT ENEMY!",

    // ------------------------------------------------------------------------
    // 1. 32x32 RETRO ICON: DIVIDING ORGANIC VIRUS WITH NUCLEI & DRIFTING SPORES
    // ------------------------------------------------------------------------
    icon(g, x, y) {
      g.rect(x, y, 32, 32, 0);
      g.box(x, y, 32, 32, 1);

      // Circular petri dish rim
      g.circle(x + 16, y + 16, 14, 1);

      // Dividing virus particle: two budding amoebic lobes
      // Mother lobe (left)
      g.disc(x + 12, y + 16, 6, 2);
      // Daughter budding lobe (right)
      g.disc(x + 20, y + 15, 5, 2);

      // Radiating surface spikes & peplomers
      g.line(x + 5, y + 16, x + 8, y + 16, 3);
      g.line(x + 12, y + 9, x + 12, y + 11, 3);
      g.line(x + 12, y + 21, x + 12, y + 23, 3);
      g.line(x + 7, y + 11, x + 9, y + 13, 3);
      g.line(x + 7, y + 21, x + 9, y + 19, 3);

      g.line(x + 24, y + 15, x + 26, y + 15, 3);
      g.line(x + 20, y + 9, x + 20, y + 11, 3);
      g.line(x + 20, y + 19, x + 20, y + 21, 3);
      g.line(x + 23, y + 11, x + 25, y + 12, 3);
      g.line(x + 23, y + 19, x + 25, y + 18, 3);

      // Cleavage furrow constriction
      g.px(x + 16, y + 10, 0);
      g.px(x + 16, y + 21, 0);

      // Glowing internal nuclei
      g.disc(x + 12, y + 16, 2, 3);
      g.disc(x + 20, y + 15, 2, 3);
      g.px(x + 12, y + 16, 0);
      g.px(x + 20, y + 15, 0);

      // Drifting infectious spore particles
      g.px(x + 4, y + 7, 3);
      g.px(x + 27, y + 8, 3);
      g.px(x + 26, y + 24, 2);
      g.px(x + 6, y + 25, 2);
    },

    // ------------------------------------------------------------------------
    // 2. LIFECYCLE & STATE INITIALIZATION
    // ------------------------------------------------------------------------
    init() {
      // 7x7 board coordinates & dimensions
      this.gw = 7;
      this.gh = 7;
      this.sz = 24; // 24x24 px per cell (7 * 24 = 168 px arena)
      this.ox = 44; // (256 - 168) / 2 = 44 px horizontal centering
      this.oy = 40; // Top-left board origin

      this.layoutIdx = (this.layoutIdx !== undefined) ? this.layoutIdx : 0;
      this.cursor = { x: 0, y: 0 };
      this.selected = null;
      this.validMoves = [];
      this.particles = [];
      this.conversions = [];
      this.lastMove = null;
      this.time = 0;
      this.animTimer = 0;
      this.aiTimer = 0;
      this.bannerText = null;
      this.bannerTimer = 0;
      this.state = 'PLAYER_SELECT'; // 'PLAYER_SELECT' | 'PLAYER_TARGET' | 'ANIMATING' | 'AI_THINKING' | 'GAME_OVER'
      this.turn = 1; // 1 = Player (Green Spores), 2 = AI (Dark Phages)
      this.winner = 0; // 0 = In Progress, 1 = Player, 2 = AI, 3 = Draw
      this.scores = { p1: 2, ai: 2 };

      this.loadMap(this.layoutIdx);
    },

    loadMap(idx) {
      this.layoutIdx = (idx + LAYOUTS.length) % LAYOUTS.length;
      const layout = LAYOUTS[this.layoutIdx];

      // 0 = empty agar, 1 = player, 2 = AI, -1 = void obstacle
      this.board = new Array(this.gw * this.gh).fill(0);

      // Place terrain obstacles
      for (let i = 0; i < layout.obstacles.length; i++) {
        const obs = layout.obstacles[i];
        this.setTile(obs[0], obs[1], -1);
      }

      // Initial Ataxx symmetrical corner setup
      // Strain 1 (Green Spores): Top-Left (0,0) & Bottom-Right (6,6)
      this.setTile(0, 0, 1);
      this.setTile(6, 6, 1);

      // Strain 2 (Dark Phages): Top-Right (6,0) & Bottom-Left (0,6)
      this.setTile(6, 0, 2);
      this.setTile(0, 6, 2);

      this.selected = null;
      this.validMoves = [];
      this.cursor = { x: 0, y: 0 };
      this.turn = 1;
      this.state = 'PLAYER_SELECT';
      this.winner = 0;
      this.lastMove = null;
      this.conversions = [];
      this.bannerText = null;
      this.bannerTimer = 0;
      this.updateScores();
    },

    save() {
      return { layoutIdx: this.layoutIdx };
    },

    load(data) {
      if (data && typeof data.layoutIdx === 'number') {
        this.layoutIdx = data.layoutIdx;
        this.loadMap(this.layoutIdx);
      }
    },

    // ------------------------------------------------------------------------
    // 3. GRID & UTILITY METHODS
    // ------------------------------------------------------------------------
    inBounds(x, y) {
      return x >= 0 && x < this.gw && y >= 0 && y < this.gh;
    },

    idx(x, y) {
      return y * this.gw + x;
    },

    getTile(x, y) {
      if (!this.inBounds(x, y)) return -1;
      return this.board[this.idx(x, y)];
    },

    setTile(x, y, val) {
      if (!this.inBounds(x, y)) return;
      this.board[this.idx(x, y)] = val;
    },

    gridToScreenX(x) {
      return this.ox + x * this.sz + Math.floor(this.sz / 2);
    },

    gridToScreenY(y) {
      return this.oy + y * this.sz + Math.floor(this.sz / 2);
    },

    updateScores() {
      let p1 = 0, ai = 0;
      for (let i = 0; i < this.board.length; i++) {
        const v = this.board[i];
        if (v === 1) p1++;
        else if (v === 2) ai++;
      }
      this.scores.p1 = p1;
      this.scores.ai = ai;
    },

    hasEmptyTile() {
      for (let i = 0; i < this.board.length; i++) {
        if (this.board[i] === 0) return true;
      }
      return false;
    },

    // ------------------------------------------------------------------------
    // 4. ATAXX / INFECTION MOVEMENT & RULES
    // ------------------------------------------------------------------------
    getLegalMoves(sx, sy) {
      const moves = [];
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          const tx = sx + dx, ty = sy + dy;
          if (!this.inBounds(tx, ty)) continue;
          if (this.getTile(tx, ty) !== 0) continue; // Target must be empty agar
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          if (dist === 1) {
            moves.push({ x: tx, y: ty, type: 'clone' });
          } else if (dist === 2) {
            moves.push({ x: tx, y: ty, type: 'jump' });
          }
        }
      }
      return moves;
    },

    hasAnyLegalMoves(strain) {
      for (let y = 0; y < this.gh; y++) {
        for (let x = 0; x < this.gw; x++) {
          if (this.getTile(x, y) === strain) {
            for (let dy = -2; dy <= 2; dy++) {
              for (let dx = -2; dx <= 2; dx++) {
                if (dx === 0 && dy === 0) continue;
                const tx = x + dx, ty = y + dy;
                if (this.inBounds(tx, ty) && this.getTile(tx, ty) === 0) {
                  return true;
                }
              }
            }
          }
        }
      }
      return false;
    },

    executeMove(fromX, fromY, toX, toY, type, strain) {
      const opp = (strain === 1 ? 2 : 1);

      // Perform physical displacement
      if (type === 'clone') {
        // Clone: origin cell remains, target gets spawned
        this.setTile(toX, toY, strain);
        this.playSfx('clone');
      } else {
        // Jump: origin cell is vacated, moves to target
        this.setTile(fromX, fromY, 0);
        this.setTile(toX, toY, strain);
        this.playSfx('jump');
      }

      this.lastMove = { fromX, fromY, toX, toY, type, strain };
      this.spawnParticles(this.gridToScreenX(toX), this.gridToScreenY(toY), strain === 1 ? 3 : 2, 8, 32);

      // Scan all 8 surrounding neighbors for enemy cells to convert
      const converts = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = toX + dx, ny = toY + dy;
          if (this.inBounds(nx, ny) && this.getTile(nx, ny) === opp) {
            converts.push({ x: nx, y: ny });
          }
        }
      }

      if (converts.length > 0) {
        this.state = 'ANIMATING';
        this.conversions = converts.map((c, i) => ({
          x: c.x,
          y: c.y,
          delay: (i + 1) * 0.08,
          toStrain: strain,
          done: false
        }));
        this.animTimer = (converts.length + 2) * 0.08;
        if (typeof APU !== 'undefined') APU.sfx('POWER');
      } else {
        this.endTurn();
      }
    },

    endTurn() {
      this.updateScores();

      // Check instant win by wiping out enemy strain
      if (this.scores.p1 === 0 || this.scores.ai === 0) {
        this.triggerGameOver();
        return;
      }

      // Check if petri dish is completely full
      if (!this.hasEmptyTile()) {
        this.triggerGameOver();
        return;
      }

      const nextTurn = (this.turn === 1 ? 2 : 1);
      const nextHasMoves = this.hasAnyLegalMoves(nextTurn);

      if (nextHasMoves) {
        this.turn = nextTurn;
        if (this.turn === 1) {
          this.state = 'PLAYER_SELECT';
          this.selected = null;
          this.validMoves = [];
        } else {
          this.state = 'AI_THINKING';
          this.aiTimer = 0.42;
        }
      } else {
        // Next side has no legal moves: pass turn!
        const currentHasMoves = this.hasAnyLegalMoves(this.turn);
        if (!currentHasMoves) {
          // Neither side can move: board is locked, trigger game over
          this.triggerGameOver();
        } else {
          this.bannerText = (nextTurn === 2 ? "PHAGE STALLED! PASSING TO YOU" : "NO MOVES! PASSING TO PHAGE");
          this.bannerTimer = 1.5;
          if (typeof APU !== 'undefined') APU.sfx('ALARM');

          if (this.turn === 1) {
            this.state = 'PLAYER_SELECT';
            this.selected = null;
            this.validMoves = [];
          } else {
            this.state = 'AI_THINKING';
            this.aiTimer = 0.42;
          }
        }
      }
    },

    triggerGameOver() {
      this.updateScores();
      this.state = 'GAME_OVER';

      if (this.scores.p1 > this.scores.ai) {
        this.winner = 1;
        this.playSfx('victory');
        if (typeof SAVE !== 'undefined') {
          SAVE.setScore(this.id, this.scores.p1);
        }
      } else if (this.scores.ai > this.scores.p1) {
        this.winner = 2;
        this.playSfx('defeat');
      } else {
        this.winner = 3; // Draw
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
      }
    },

    // ------------------------------------------------------------------------
    // 5. STRATEGIC HEURISTIC AI (DARK PHAGES)
    // ------------------------------------------------------------------------
    evaluateAiMove(fromX, fromY, toX, toY, isClone) {
      let score = 0;

      // 1. Cloning preserves origin (+1 net friendly piece on board)
      if (isClone) {
        score += 1.35;
      } else {
        // Jumping vacates origin. Penalize abandoning valuable defensive corners
        if ((fromX === 0 || fromX === 6) && (fromY === 0 || fromY === 6)) {
          score -= 0.8;
        }
      }

      // 2. Immediate enemy cell conversions
      let conversions = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = toX + dx, ny = toY + dy;
          if (this.inBounds(nx, ny) && this.getTile(nx, ny) === 1) {
            conversions++;
          }
        }
      }
      // Each converted cell swings the count by +2 (Player loses 1, AI gains 1)
      score += conversions * 2.7;

      // 3. Positional board dominance
      // Corner tiles are virtually impossible to re-convert
      if ((toX === 0 || toX === 6) && (toY === 0 || toY === 6)) {
        score += 2.2;
      } else if (toX === 0 || toX === 6 || toY === 0 || toY === 6) {
        // Edges have fewer exposed sides
        score += 0.6;
      }

      // 4. Counter-attack threat evaluation
      let threat = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = toX + dx, ny = toY + dy;
          if (this.inBounds(nx, ny) && this.getTile(nx, ny) === 1) {
            threat++;
          }
        }
      }
      if (conversions === 0) {
        score -= threat * 0.35;
      } else {
        score -= Math.max(0, threat - conversions) * 0.2;
      }

      // 5. Centrality
      const distToCenter = Math.abs(toX - 3) + Math.abs(toY - 3);
      score += (6 - distToCenter) * 0.1;

      // 6. Difficulty tuning based on console setting
      const diff = (typeof VOS !== 'undefined' ? VOS.difficulty : 1);
      if (diff === 0) {
        // EASY: noticeable blunder variance
        score += (Math.random() - 0.5) * 3.2;
      } else if (diff === 1) {
        // NORMAL: realistic tactical variance
        score += (Math.random() - 0.5) * 0.5;
      } else {
        // HARD: ruthless, optimal decision with tiny tiebreaker
        score += Math.random() * 0.05;
      }

      return score;
    },

    getAiBestMove() {
      const candidates = [];
      for (let y = 0; y < this.gh; y++) {
        for (let x = 0; x < this.gw; x++) {
          if (this.getTile(x, y) === 2) {
            const moves = this.getLegalMoves(x, y);
            for (let i = 0; i < moves.length; i++) {
              const m = moves[i];
              const score = this.evaluateAiMove(x, y, m.x, m.y, m.type === 'clone');
              candidates.push({
                fromX: x,
                fromY: y,
                toX: m.x,
                toY: m.y,
                type: m.type,
                score: score
              });
            }
          }
        }
      }

      if (candidates.length === 0) return null;
      candidates.sort((a, b) => b.score - a.score);
      return candidates[0];
    },

    // ------------------------------------------------------------------------
    // 6. AUDIO EFFECTS
    // ------------------------------------------------------------------------
    playSfx(name) {
      if (typeof APU === 'undefined') return;
      try {
        if (name === 'clone') {
          // Squishy cellular division
          APU.softTone(260, 0.07, 'sine', 0.08, 0, 0.01, 800);
          APU.softTone(340, 0.09, 'sine', 0.07, 0.03, 0.01, 950);
          APU.noise(0.04, 0.05, 400);
        } else if (name === 'jump') {
          // Organic trajectory whoosh
          APU.sfx('SWISH');
          APU.softTone(180, 0.10, 'triangle', 0.07, 0, 0.01, 600);
        } else if (name === 'select') {
          APU.softTone(520, 0.05, 'triangle', 0.06, 0, 0.005, 1200);
        } else if (name === 'deselect') {
          APU.softTone(330, 0.06, 'triangle', 0.05, 0, 0.005, 900);
        } else if (name === 'deny') {
          APU.sfx('DENY');
        } else if (name === 'victory') {
          APU.sfx('LEVELUP');
        } else if (name === 'defeat') {
          APU.sfx('BOOM');
          APU.softTone(130, 0.35, 'sawtooth', 0.08, 0.1, 0.02, 300);
        }
      } catch (e) {}
    },

    // ------------------------------------------------------------------------
    // 7. PARTICLES & VISUAL POLISH
    // ------------------------------------------------------------------------
    spawnParticles(x, y, color, count = 8, speed = 25) {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = (0.4 + Math.random() * 0.8) * speed;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 0.35 + Math.random() * 0.25,
          maxLife: 0.5,
          color: color
        });
      }
    },

    // ------------------------------------------------------------------------
    // 8. INPUT & TURN HANDLING
    // ------------------------------------------------------------------------
    selectCell(gx, gy) {
      this.selected = { x: gx, y: gy };
      this.validMoves = this.getLegalMoves(gx, gy);

      if (this.validMoves.length > 0) {
        this.state = 'PLAYER_TARGET';
        this.playSfx('select');
      } else {
        this.selected = null;
        this.validMoves = [];
        this.state = 'PLAYER_SELECT';
        this.bannerText = "SPORE TRAPPED! CANNOT MOVE";
        this.bannerTimer = 1.2;
        this.playSfx('deny');
      }
    },

    deselect() {
      this.selected = null;
      this.validMoves = [];
      this.state = 'PLAYER_SELECT';
      this.playSfx('deselect');
    },

    cycleMap() {
      this.loadMap(this.layoutIdx + 1);
      this.playSfx('select');
      if (typeof SAVE !== 'undefined') {
        SAVE.setPersistent(this.id, { layoutIdx: this.layoutIdx });
      }
    },

    handleActionAt(gx, gy) {
      if (this.state === 'GAME_OVER') {
        this.loadMap(this.layoutIdx);
        this.playSfx('select');
        return;
      }

      if (this.state !== 'PLAYER_SELECT' && this.state !== 'PLAYER_TARGET') {
        return;
      }

      const tile = this.getTile(gx, gy);

      if (this.state === 'PLAYER_SELECT') {
        if (tile === 1) {
          this.selectCell(gx, gy);
        } else {
          this.playSfx('deny');
        }
      } else if (this.state === 'PLAYER_TARGET') {
        // Check if destination is a valid move
        const valid = this.validMoves.find(m => m.x === gx && m.y === gy);
        if (valid) {
          this.executeMove(this.selected.x, this.selected.y, gx, gy, valid.type, 1);
        } else if (tile === 1) {
          if (gx === this.selected.x && gy === this.selected.y) {
            this.deselect();
          } else {
            this.selectCell(gx, gy);
          }
        } else {
          this.deselect();
        }
      }
    },

    update(dt) {
      this.time += dt;

      // Update spore particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.92;
          p.vy *= 0.92;
        }
      }

      // Update banner notification timer
      if (this.bannerTimer > 0) {
        this.bannerTimer -= dt;
      }

      // Infection conversion wave animation step
      if (this.state === 'ANIMATING') {
        this.animTimer -= dt;
        let allDone = true;
        for (let i = 0; i < this.conversions.length; i++) {
          const c = this.conversions[i];
          if (!c.done) {
            c.delay -= dt;
            if (c.delay <= 0) {
              c.done = true;
              this.setTile(c.x, c.y, c.toStrain);
              const px = this.gridToScreenX(c.x), py = this.gridToScreenY(c.y);
              this.spawnParticles(px, py, c.toStrain === 1 ? 3 : 2, 7, 26);

              // Mutating arpeggio tone per converted cell
              const pitch = (c.toStrain === 1 ? (380 + i * 75) : (340 - i * 40));
              if (typeof APU !== 'undefined') {
                APU.softTone(Math.max(80, pitch), 0.08, c.toStrain === 1 ? 'sine' : 'triangle', 0.07, 0, 0.01, 1400);
              }
            } else {
              allDone = false;
            }
          }
        }
        if (this.animTimer <= 0 && allDone) {
          this.conversions = [];
          this.endTurn();
        }
        return; // Lock input while converting
      }

      // AI turn thinking step
      if (this.state === 'AI_THINKING') {
        this.aiTimer -= dt;
        if (this.aiTimer <= 0) {
          const best = this.getAiBestMove();
          if (best) {
            this.executeMove(best.fromX, best.fromY, best.toX, best.toY, best.type, 2);
          } else {
            // No moves available for AI: pass turn
            this.endTurn();
          }
        }
        return; // Lock input while AI is thinking
      }

      // Mobile touch ergonomics
      if (typeof PAD !== 'undefined' && PAD.tapPos) {
        const tapX = PAD.tapPos.x;
        const tapY = PAD.tapPos.y;

        if (this.state === 'GAME_OVER') {
          this.loadMap(this.layoutIdx);
          this.playSfx('select');
          return;
        }

        // Tap top MAP button area (X: 160..250, Y: 0..16)
        if (tapY < 16 && tapX > 155) {
          this.cycleMap();
          return;
        }

        const gx = Math.floor((tapX - this.ox) / this.sz);
        const gy = Math.floor((tapY - this.oy) / this.sz);

        if (this.inBounds(gx, gy)) {
          this.cursor.x = gx;
          this.cursor.y = gy;
          this.handleActionAt(gx, gy);
        }
      }

      // D-Pad navigation
      if (typeof PAD !== 'undefined') {
        if (PAD.hit('left'))  { this.cursor.x = Math.max(0, this.cursor.x - 1); APU.sfx('UI_MOVE'); }
        if (PAD.hit('right')) { this.cursor.x = Math.min(6, this.cursor.x + 1); APU.sfx('UI_MOVE'); }
        if (PAD.hit('up'))    { this.cursor.y = Math.max(0, this.cursor.y - 1); APU.sfx('UI_MOVE'); }
        if (PAD.hit('down'))  { this.cursor.y = Math.min(6, this.cursor.y + 1); APU.sfx('UI_MOVE'); }

        if (PAD.hit('b')) {
          if (this.state === 'PLAYER_TARGET') {
            this.deselect();
          }
        }

        if (PAD.hit('select')) {
          this.cycleMap();
        }

        if (PAD.hit('a')) {
          this.handleActionAt(this.cursor.x, this.cursor.y);
        }
      }
    },

    // ------------------------------------------------------------------------
    // 9. RENDERING (PETRI DISH ARENA, ORGANIC CELLS, HUD & OVERLAYS)
    // ------------------------------------------------------------------------
    render(g) {
      g.clear(0);

      const dishCx = 128;
      const dishCy = 124;

      // Circular Petri Dish Glass Rim
      g.circle(dishCx, dishCy, 116, 1);
      g.circle(dishCx, dishCy, 117, 2);
      g.circle(dishCx, dishCy, 118, 1);

      // Specular glass rim highlights (upper-left quadrant)
      g.line(dishCx - 86, dishCy - 68, dishCx - 68, dishCy - 86, 3);
      g.line(dishCx - 80, dishCy - 76, dishCx - 76, dishCy - 80, 3);
      g.line(dishCx - 94, dishCy - 50, dishCx - 90, dishCy - 58, 2);

      // 7x7 Grid Cells
      for (let y = 0; y < this.gh; y++) {
        for (let x = 0; x < this.gw; x++) {
          const bx = this.ox + x * this.sz;
          const by = this.oy + y * this.sz;
          const cx = bx + Math.floor(this.sz / 2);
          const cy = by + Math.floor(this.sz / 2);
          const val = this.getTile(x, y);

          // Cell boundary in mid-green
          g.box(bx, by, this.sz, this.sz, 1);

          if (val === 0) {
            // Empty agar culture dot
            g.px(cx, cy, 1);
          } else if (val === -1) {
            // Bio-hazard / Void obstacle tile
            g.rect(bx + 2, by + 2, this.sz - 4, this.sz - 4, 0);
            g.box(bx + 2, by + 2, this.sz - 4, this.sz - 4, 1);
            g.line(bx + 3, by + 3, bx + this.sz - 4, by + this.sz - 4, 1);
            g.line(bx + 3, by + this.sz - 4, bx + this.sz - 4, by + 3, 1);
            g.disc(cx, cy, 3, 1);
            g.px(cx, cy, 2);
          } else if (val === 1) {
            // STRAIN 1: PLAYER (GREEN SPORES) - Pulsing amoeba with animated cilia
            const pulse = Math.sin(this.time * 6 + (x * 3 + y * 5)) * 0.8;
            const r = 5 + Math.round(pulse);

            // Radiating waving cilia
            for (let ci = 0; ci < 6; ci++) {
              const th = ci * (Math.PI / 3) + Math.sin(this.time * 5 + ci * 1.5) * 0.28;
              const len = 6.8 + Math.sin(this.time * 6 + ci) * 1.4;
              g.line(cx, cy, Math.round(cx + Math.cos(th) * len), Math.round(cy + Math.sin(th) * len), 3);
            }

            // Outer amoebic cytoplasm
            g.disc(cx, cy, r, 2);
            // Glowing bioluminescent nucleus
            g.disc(cx, cy, 2, 3);
            g.px(cx, cy, 0);
          } else if (val === 2) {
            // STRAIN 2: AI (DARK PHAGES) - Icosahedral capsid with angular spider legs
            // Menacing dark capsid with diamond core
            g.disc(cx, cy, 5, 1);
            g.box(cx - 3, cy - 3, 7, 7, 2);
            g.line(cx - 4, cy, cx + 4, cy, 2);
            g.line(cx, cy - 4, cx, cy + 4, 2);

            // Phage tail fibers & tendrils
            g.line(cx - 3, cy + 3, cx - 6, cy + 7, 2);
            g.line(cx + 3, cy + 3, cx + 6, cy + 7, 2);
            g.line(cx, cy + 4, cx, cy + 8, 3);
            g.line(cx - 4, cy - 2, cx - 7, cy - 5, 2);
            g.line(cx + 4, cy - 2, cx + 7, cy - 5, 2);

            // Sinister viral core eye
            g.px(cx, cy, 3);
            g.px(cx - 1, cy, 0);
            g.px(cx + 1, cy, 0);
          }
        }
      }

      // Breadcrumb indicator for last move
      if (this.lastMove) {
        const lx0 = this.gridToScreenX(this.lastMove.fromX);
        const ly0 = this.gridToScreenY(this.lastMove.fromY);
        const lx1 = this.gridToScreenX(this.lastMove.toX);
        const ly1 = this.gridToScreenY(this.lastMove.toY);

        g.line(lx0, ly0, lx1, ly1, 1);
        g.box(this.ox + this.lastMove.fromX * this.sz + 4, this.oy + this.lastMove.fromY * this.sz + 4, this.sz - 8, this.sz - 8, 1);
      }

      // Valid move highlights when a friendly cell is selected
      if (this.selected) {
        // Flashing box on origin cell
        const selBoxC = (Math.sin(this.time * 12) > 0) ? 3 : 2;
        const selBx = this.ox + this.selected.x * this.sz;
        const selBy = this.oy + this.selected.y * this.sz;
        g.box(selBx + 1, selBy + 1, this.sz - 2, this.sz - 2, selBoxC);

        for (let i = 0; i < this.validMoves.length; i++) {
          const m = this.validMoves[i];
          const mcx = this.gridToScreenX(m.x);
          const mcy = this.gridToScreenY(m.y);

          if (m.type === 'clone') {
            // CLONE: Solid bright green diamond/dot in target
            g.disc(mcx, mcy, 4, 3);
            g.circle(mcx, mcy, 6, 2);
            g.px(mcx, mcy, 0);
          } else {
            // JUMP: Hollow target ring with crosshair ticks
            g.circle(mcx, mcy, 5, 2);
            g.circle(mcx, mcy, 3, 3);
            g.px(mcx - 6, mcy, 3);
            g.px(mcx + 6, mcy, 3);
            g.px(mcx, mcy - 6, 3);
            g.px(mcx, mcy + 6, 3);
          }
        }
      }

      // Infection conversion wave halos
      for (let i = 0; i < this.conversions.length; i++) {
        const c = this.conversions[i];
        if (!c.done) {
          const ccx = this.gridToScreenX(c.x);
          const ccy = this.gridToScreenY(c.y);
          const haloR = 7 + Math.round(Math.sin(this.time * 18 + i) * 2);
          g.circle(ccx, ccy, haloR, 3);
        }
      }

      // Spore burst particles
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        const pc = (p.life < p.maxLife * 0.3) ? 1 : p.color;
        g.px(Math.round(p.x), Math.round(p.y), pc);
      }

      // Cursor Reticle (Corner Brackets)
      const curBx = this.ox + this.cursor.x * this.sz;
      const curBy = this.oy + this.cursor.y * this.sz;
      const curC = 3;
      g.line(curBx, curBy, curBx + 4, curBy, curC);
      g.line(curBx, curBy, curBx, curBy + 4, curC);
      g.line(curBx + this.sz - 1, curBy, curBx + this.sz - 5, curBy, curC);
      g.line(curBx + this.sz - 1, curBy, curBx + this.sz - 1, curBy + 4, curC);
      g.line(curBx, curBy + this.sz - 1, curBx + 4, curBy + this.sz - 1, curC);
      g.line(curBx, curBy + this.sz - 1, curBx, curBy + this.sz - 5, curC);
      g.line(curBx + this.sz - 1, curBy + this.sz - 1, curBx + this.sz - 5, curBy + this.sz - 1, curC);
      g.line(curBx + this.sz - 1, curBy + this.sz - 1, curBx + this.sz - 1, curBy + this.sz - 5, curC);

      // ----------------------------------------------------------------------
      // HUD: TOP BAR (SCORE, RATIO METER, MAP SELECTOR)
      // ----------------------------------------------------------------------
      const layout = LAYOUTS[this.layoutIdx];

      // Title & Map Button
      g.text("VIRUS SPREAD", 8, 3, 3);
      g.box(158, 1, 90, 11, 1);
      g.text("MAP:" + layout.shortName, 162, 3, 2);

      // Player Score on Left
      g.disc(12, 16, 4, 3);
      g.px(12, 16, 0);
      g.text("YOU:" + this.scores.p1, 20, 14, 3);

      // AI Score on Right
      g.text("AI:" + this.scores.ai, 196, 14, 2);
      g.disc(244, 16, 4, 2);
      g.px(244, 16, 3);

      // Dominance Tug-of-War Ratio Bar (156 px wide, centered at X: 50, Y: 23)
      const totalCells = this.scores.p1 + this.scores.ai;
      let ratioP1 = 0.5;
      if (totalCells > 0) ratioP1 = this.scores.p1 / totalCells;
      const barW = 156;
      const p1W = Math.max(2, Math.min(barW - 2, Math.round(ratioP1 * barW)));

      g.rect(50, 23, p1W, 5, 3); // Player Green
      g.rect(50 + p1W, 23, barW - p1W, 5, 1); // AI Dark Phage
      g.box(49, 22, barW + 2, 7, 2); // Meter border
      g.line(49 + Math.floor(barW / 2), 21, 49 + Math.floor(barW / 2), 29, 2); // 50/50 balance tick

      // Dynamic Turn Status Indicator
      if (this.bannerTimer > 0) {
        g.textC(this.bannerText, 32, 3);
      } else if (this.state === 'PLAYER_SELECT') {
        g.textC("SELECT FRIENDLY SPORE", 32, 3);
      } else if (this.state === 'PLAYER_TARGET') {
        g.textC("DOT=CLONE(+1)  RING=JUMP", 32, 3);
      } else if (this.state === 'AI_THINKING') {
        g.textC("PHAGE SWARM EVALUATING...", 32, 2);
      } else if (this.state === 'ANIMATING') {
        g.textC("*** VIRAL ASSIMILATION! ***", 32, 3);
      } else if (this.state === 'GAME_OVER') {
        g.textC(this.winner === 1 ? "★ PETRI DISH SECURED! ★" : (this.winner === 2 ? "X HOST OVERRUN! DEFEAT X" : "= EQUILIBRIUM STALEMATE ="), 32, this.winner === 1 ? 3 : 2);
      }

      // ----------------------------------------------------------------------
      // HUD: BOTTOM CONTROLS & HINTS
      // ----------------------------------------------------------------------
      if (this.state !== 'GAME_OVER') {
        g.textC("[D-PAD] MOVE  [A] ACT  [B] DESEL", 213, 2);
        g.textC("[SELECT] CYCLE MAP (" + (this.layoutIdx + 1) + "/4)", 222, 1);
        g.textC("CLONE ADJACENT / JUMP 2 SPACES", 231, 1);
      } else {
        // Game Over modal dialogue box
        g.rect(26, 76, 204, 88, 0);
        g.box(26, 76, 204, 88, this.winner === 1 ? 3 : 2);
        g.box(28, 78, 200, 84, 1);

        const bannerTitle = (this.winner === 1 ? "★ INVASION VICTORY! ★" : (this.winner === 2 ? "X STRAIN OVERRUN X" : "= STALEMATE DRAW ="));
        g.textC(bannerTitle, 84, this.winner === 1 ? 3 : 2);
        g.textC("DOMINANCE RESULTS:", 98, 2);
        g.textC("YOU: " + this.scores.p1 + " CELLS  |  AI: " + this.scores.ai + " CELLS", 110, 3);

        const topRec = (typeof SAVE !== 'undefined' ? SAVE.getScore(this.id) : this.scores.p1);
        g.textC("RECORD CELLS: " + topRec, 122, 2);

        const blink = (Math.sin(this.time * 8) > 0);
        g.textC("PRESS [A] OR TAP TO RESTART", 138, blink ? 3 : 2);
        g.textC("[SELECT] NEXT MAP ARENA", 148, 1);
      }
    }
  };
})();
