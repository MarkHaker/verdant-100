// js/cartridges/cart_050_reversi.js
// ============================================================================
// Cartridge #050: REVERSI (OTHELLO 8x8)
// Genre: STRATEGY (4) | Turn-Based 8x8 Tactical Flanking Board Simulation
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

(function() {
  // --------------------------------------------------------------------------
  // 1. ENGINE & HELPER ROUTINES (Self-contained, zero external E1/E10 dependencies)
  // --------------------------------------------------------------------------
  const DIRS = [
    [-1, -1], [0, -1], [1, -1],
    [-1,  0],          [1,  0],
    [-1,  1], [0,  1], [1,  1]
  ];

  function bIdx(x, y) {
    return (y << 3) | x;
  }

  function inB(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
  }

  function playSfx(name) {
    if (typeof APU === 'undefined' || !APU.sfx) return;
    const map = {
      'SELECT': 'UI_MOVE',
      'CONFIRM': 'UI_OK',
      'ERROR': 'DENY',
      'EXPLODE': 'BOOM',
      'FANFARE': 'LEVELUP',
      'POWERUP': 'POWER'
    };
    try {
      APU.sfx(map[name] || name);
    } catch (_) {}
  }

  function getFlips(board, x, y, player) {
    if (board[bIdx(x, y)] !== 0) return [];
    const opp = (player === 1 ? 2 : 1);
    const flips = [];

    for (let d = 0; d < 8; d++) {
      const [dx, dy] = DIRS[d];
      let step = 1;
      const ray = [];
      while (true) {
        const nx = x + dx * step;
        const ny = y + dy * step;
        if (!inB(nx, ny)) break;
        const val = board[bIdx(nx, ny)];
        if (val === opp) {
          ray.push({ x: nx, y: ny });
          step++;
        } else if (val === player) {
          if (ray.length > 0) {
            for (let k = 0; k < ray.length; k++) flips.push(ray[k]);
          }
          break;
        } else {
          break;
        }
      }
    }
    return flips;
  }

  function getLegalMoves(board, player) {
    const moves = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (board[bIdx(x, y)] === 0) {
          const flips = getFlips(board, x, y, player);
          if (flips.length > 0) moves.push({ x, y, flips });
        }
      }
    }
    return moves;
  }

  function countDiscs(board) {
    let p1 = 0, p2 = 0, empty = 0;
    for (let i = 0; i < 64; i++) {
      const v = board[i];
      if (v === 1) p1++;
      else if (v === 2) p2++;
      else empty++;
    }
    return { p1, p2, empty };
  }

  // --------------------------------------------------------------------------
  // 2. AI HEURISTICS & MINIMAX
  // --------------------------------------------------------------------------
  const BASE_WEIGHTS = [
    100, -20,  15,   5,   5,  15, -20, 100,
    -20, -40,  -5,  -5,  -5,  -5, -40, -20,
     15,  -5,   5,   2,   2,   5,  -5,  15,
      5,  -5,   2,   1,   1,   2,  -5,   5,
      5,  -5,   2,   1,   1,   2,  -5,   5,
     15,  -5,   5,   2,   2,   5,  -5,  15,
    -20, -40,  -5,  -5,  -5,  -5, -40, -20,
    100, -20,  15,   5,   5,  15, -20, 100
  ];

  function evaluateBoard(b, aiPlayer, difficulty) {
    let score = 0;
    let aiCount = 0;
    let oppCount = 0;
    let emptyCount = 0;
    const oppPlayer = (aiPlayer === 1 ? 2 : 1);

    const weights = BASE_WEIGHTS.slice();
    const cornerChecks = [
      { c: 0, x: 9, c1: 1, c2: 8 },
      { c: 7, x: 14, c1: 6, c2: 15 },
      { c: 56, x: 49, c1: 48, c2: 57 },
      { c: 63, x: 54, c1: 62, c2: 55 }
    ];

    for (let i = 0; i < 4; i++) {
      const { c, x, c1, c2 } = cornerChecks[i];
      const cVal = b[c];
      if (cVal === aiPlayer) {
        weights[x] = 20;
        weights[c1] = 15;
        weights[c2] = 15;
      } else if (cVal === oppPlayer) {
        weights[x] = -15;
        weights[c1] = -10;
        weights[c2] = -10;
      }
    }

    for (let i = 0; i < 64; i++) {
      const v = b[i];
      if (v === aiPlayer) {
        aiCount++;
        score += weights[i];
      } else if (v === oppPlayer) {
        oppCount++;
        score -= weights[i];
      } else {
        emptyCount++;
      }
    }

    const totalPieces = aiCount + oppCount;
    if (totalPieces >= 54) {
      score += (aiCount - oppCount) * 20;
    } else if (totalPieces <= 20) {
      const aiMoves = getLegalMoves(b, aiPlayer).length;
      const oppMoves = getLegalMoves(b, oppPlayer).length;
      score += (aiMoves - oppMoves) * 12;
      score -= (aiCount - oppCount) * 2;
    } else {
      const aiMoves = getLegalMoves(b, aiPlayer).length;
      const oppMoves = getLegalMoves(b, oppPlayer).length;
      score += (aiMoves - oppMoves) * 7;
      score += (aiCount - oppCount) * 2;
    }

    return score;
  }

  function endgameSolve(board, turn, alpha, beta, aiPlayer) {
    const opp = (turn === 1 ? 2 : 1);
    const moves = getLegalMoves(board, turn);

    if (moves.length === 0) {
      const oppMoves = getLegalMoves(board, opp);
      if (oppMoves.length === 0) {
        const counts = countDiscs(board);
        return (aiPlayer === 1 ? counts.p1 - counts.p2 : counts.p2 - counts.p1) * 100;
      }
      return -endgameSolve(board, opp, -beta, -alpha, aiPlayer);
    }

    let bestVal = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      const m = moves[i];
      const bCopy = board.slice();
      bCopy[bIdx(m.x, m.y)] = turn;
      for (let k = 0; k < m.flips.length; k++) bCopy[bIdx(m.flips[k].x, m.flips[k].y)] = turn;

      const val = -endgameSolve(bCopy, opp, -beta, -alpha, aiPlayer);
      if (val > bestVal) bestVal = val;
      if (bestVal > alpha) alpha = bestVal;
      if (alpha >= beta) break;
    }
    return bestVal;
  }

  function selectAiMove(board, legalMoves, difficulty) {
    if (legalMoves.length === 0) return null;
    if (legalMoves.length === 1) return legalMoves[0];

    // EASY: 1-ply evaluation with stochastic noise
    if (difficulty === 0) {
      let bestScore = -Infinity;
      let bestMove = legalMoves[0];
      for (let i = 0; i < legalMoves.length; i++) {
        const m = legalMoves[i];
        const bCopy = board.slice();
        bCopy[bIdx(m.x, m.y)] = 2;
        for (let k = 0; k < m.flips.length; k++) bCopy[bIdx(m.flips[k].x, m.flips[k].y)] = 2;
        const s = evaluateBoard(bCopy, 2, difficulty) + (Math.random() * 32 - 16);
        if (s > bestScore) {
          bestScore = s;
          bestMove = m;
        }
      }
      return bestMove;
    }

    // HARD: Endgame exact solver if <= 8 empty squares remain
    const counts = countDiscs(board);
    if (difficulty === 2 && counts.empty <= 8) {
      let bestScore = -Infinity;
      let bestMove = legalMoves[0];
      for (let i = 0; i < legalMoves.length; i++) {
        const m = legalMoves[i];
        const bCopy = board.slice();
        bCopy[bIdx(m.x, m.y)] = 2;
        for (let k = 0; k < m.flips.length; k++) bCopy[bIdx(m.flips[k].x, m.flips[k].y)] = 2;
        const val = -endgameSolve(bCopy, 1, -Infinity, Infinity, 2);
        if (val > bestScore) {
          bestScore = val;
          bestMove = m;
        }
      }
      return bestMove;
    }

    // NORMAL & HARD: 2-ply Minimax with corner & mobility heuristics
    let bestScore = -Infinity;
    let bestMove = legalMoves[0];

    for (let i = 0; i < legalMoves.length; i++) {
      const m = legalMoves[i];
      const bCopy = board.slice();
      bCopy[bIdx(m.x, m.y)] = 2;
      for (let k = 0; k < m.flips.length; k++) bCopy[bIdx(m.flips[k].x, m.flips[k].y)] = 2;

      const oppMoves = getLegalMoves(bCopy, 1);
      let minOppScore = Infinity;

      if (oppMoves.length === 0) {
        minOppScore = evaluateBoard(bCopy, 2, difficulty) + 40;
      } else {
        for (let j = 0; j < oppMoves.length; j++) {
          const om = oppMoves[j];
          const bCopy2 = bCopy.slice();
          bCopy2[bIdx(om.x, om.y)] = 1;
          for (let l = 0; l < om.flips.length; l++) bCopy2[bIdx(om.flips[l].x, om.flips[l].y)] = 1;
          const evalScore = evaluateBoard(bCopy2, 2, difficulty);
          if (evalScore < minOppScore) minOppScore = evalScore;
        }
      }

      if (minOppScore > bestScore) {
        bestScore = minOppScore;
        bestMove = m;
      }
    }

    return bestMove;
  }

  // --------------------------------------------------------------------------
  // 3. CARTRIDGE DEFINITION
  // --------------------------------------------------------------------------
  CARTS[50] = {
    id: 50,
    name: "REVERSI",
    genre: 4,
    scoreLabel: "MARGIN",
    desc: "OTHELLO/REVERSI 8X8. OUTFLANK AND FLIP OPPONENT DISCS. DOMINATE CORNERS!",

    // ------------------------------------------------------------------------
    // 32x32 CRT ICON
    // ------------------------------------------------------------------------
    icon(g, x, y) {
      g.rect(x, y, 32, 32, 0);
      g.box(x, y, 32, 32, 1);
      g.box(x + 2, y + 2, 28, 28, 2);

      // Wood/grid lines
      for (let i = 1; i <= 3; i++) {
        const p = x + 2 + i * 7;
        g.line(p, y + 3, p, y + 28, 1);
        const q = y + 2 + i * 7;
        g.line(x + 3, q, x + 28, q, 1);
      }

      // Classic center 4 discs
      // AI disc at (12, 12)
      g.disc(x + 12, y + 12, 3, 1);
      g.circle(x + 12, y + 12, 3, 2);

      // Player disc at (19, 12)
      g.disc(x + 19, y + 12, 3, 3);

      // Player disc at (12, 19)
      g.disc(x + 12, y + 19, 3, 3);

      // AI disc at (19, 19)
      g.disc(x + 19, y + 19, 3, 1);
      g.circle(x + 19, y + 19, 3, 2);

      // Captured corner star at top-left
      g.px(x + 5, y + 5, 3);
      g.px(x + 5, y + 6, 2);
      g.px(x + 6, y + 5, 2);

      // Corner white disc at bottom-right
      g.disc(x + 26, y + 26, 2, 3);
    },

    // ------------------------------------------------------------------------
    // INITIALIZATION
    // ------------------------------------------------------------------------
    init() {
      this.board = new Array(64).fill(0);
      // Standard Reversi center configuration:
      // (3,3)=AI, (4,4)=AI, (3,4)=Player, (4,3)=Player
      this.board[bIdx(3, 3)] = 2; // AI
      this.board[bIdx(4, 4)] = 2; // AI
      this.board[bIdx(3, 4)] = 1; // Player
      this.board[bIdx(4, 3)] = 1; // Player

      this.cx = 2;
      this.cy = 3;
      this.state = 'PLAYER_TURN'; // 'PLAYER_TURN' | 'AI_THINKING' | 'ANIMATING' | 'PASS_NOTICE' | 'GAME_OVER'
      this.turn = 1; // 1 = Player, 2 = AI
      this.legalMoves = [];
      this.flipAnims = [];
      this.placedAnim = null;
      this.aiThinkTimer = 0;
      this.passWhom = null;
      this.passTimer = 0;
      this.gameOverTimer = 0;
      this.pulseTimer = 0;
      this.bannerText = "";
      this.bannerTimer = 0;
      this.lastPointerDown = false;
      this.isNewRecord = false;
      this.finalMargin = 0;

      const vosDiff = (typeof VOS !== 'undefined' && typeof VOS.difficulty === 'number') ? VOS.difficulty : 1;
      this.difficulty = Math.max(0, Math.min(2, vosDiff));

      this.counts = countDiscs(this.board);
      this.startTurn(1);
    },

    startTurn(player) {
      this.turn = player;
      this.counts = countDiscs(this.board);
      const moves = getLegalMoves(this.board, player);

      if (moves.length === 0) {
        // Active player has no moves! Check if opponent has moves:
        const opp = (player === 1 ? 2 : 1);
        const oppMoves = getLegalMoves(this.board, opp);
        if (oppMoves.length === 0 || this.counts.empty === 0 || this.counts.p1 === 0 || this.counts.p2 === 0) {
          this.triggerGameOver();
          return;
        }
        // Pass active player's turn
        this.state = 'PASS_NOTICE';
        this.passWhom = (player === 1 ? 'PLAYER' : 'AI');
        this.passTimer = 1.2;
        playSfx('ERROR');
        return;
      }

      if (player === 1) {
        this.state = 'PLAYER_TURN';
        this.legalMoves = moves;
        // Snap cursor to legal move if current spot is invalid
        const curIsLegal = moves.some(m => m.x === this.cx && m.y === this.cy);
        if (!curIsLegal && moves.length > 0) {
          this.cx = moves[0].x;
          this.cy = moves[0].y;
        }
      } else {
        this.state = 'AI_THINKING';
        this.legalMoves = moves;
        this.aiThinkTimer = 0.45 + Math.random() * 0.15;
      }
    },

    makeMove(x, y, player, flips) {
      this.board[bIdx(x, y)] = player;
      this.placedAnim = { x, y, timer: 0.25, player };

      const opp = (player === 1 ? 2 : 1);
      this.flipAnims = [];

      for (let i = 0; i < flips.length; i++) {
        const f = flips[i];
        const dist = Math.max(Math.abs(f.x - x), Math.abs(f.y - y));
        const delay = (dist - 1) * 0.05;
        this.flipAnims.push({
          x: f.x,
          y: f.y,
          from: opp,
          to: player,
          delay,
          timer: 0,
          dur: 0.20,
          sfxPlayed: false,
          done: false
        });
      }

      playSfx(player === 1 ? 'CONFIRM' : 'UI_OK');
      this.state = 'ANIMATING';
    },

    triggerGameOver() {
      this.counts = countDiscs(this.board);
      this.state = 'GAME_OVER';
      this.gameOverTimer = 0;
      this.finalMargin = this.counts.p1 - this.counts.p2;
      this.isNewRecord = false;

      if (this.finalMargin > 0) {
        playSfx('FANFARE');
        if (typeof SAVE !== 'undefined' && SAVE.setScore) {
          this.isNewRecord = SAVE.setScore(50, this.finalMargin);
        }
      } else if (this.finalMargin < 0) {
        playSfx('ERROR');
      } else {
        playSfx('CONFIRM');
      }
    },

    // ------------------------------------------------------------------------
    // UPDATE LOOP
    // ------------------------------------------------------------------------
    update(dt) {
      dt = Math.min(dt, 0.1);
      this.pulseTimer += dt;
      if (this.bannerTimer > 0) this.bannerTimer -= dt;

      // Detect touch/tap input
      let tapX = -1, tapY = -1;
      if (typeof PAD !== 'undefined' && PAD.tapPos) {
        tapX = PAD.tapPos.x;
        tapY = PAD.tapPos.y;
      } else if (typeof TOUCH !== 'undefined' && TOUCH.down) {
        tapX = TOUCH.x;
        tapY = TOUCH.y;
      } else if (typeof PAD !== 'undefined' && PAD.pointer && PAD.pointer.down) {
        if (!this.lastPointerDown) {
          tapX = PAD.pointer.x;
          tapY = PAD.pointer.y;
        }
      }
      this.lastPointerDown = !!(typeof PAD !== 'undefined' && PAD.pointer && PAD.pointer.down);

      // State: ANIMATING
      if (this.state === 'ANIMATING') {
        if (this.placedAnim) {
          this.placedAnim.timer -= dt;
          if (this.placedAnim.timer <= 0) this.placedAnim = null;
        }

        let allDone = true;
        for (let i = 0; i < this.flipAnims.length; i++) {
          const anim = this.flipAnims[i];
          anim.timer += dt;

          if (anim.timer >= anim.delay + anim.dur * 0.5) {
            if (!anim.sfxPlayed) {
              anim.sfxPlayed = true;
              playSfx('TICK');
            }
            this.board[bIdx(anim.x, anim.y)] = anim.to;
          }

          if (anim.timer < anim.delay + anim.dur) {
            allDone = false;
          } else {
            anim.done = true;
            this.board[bIdx(anim.x, anim.y)] = anim.to;
          }
        }

        if (allDone && this.flipAnims.length > 0) {
          this.flipAnims = [];
          this.counts = countDiscs(this.board);
          const nextPlayer = (this.turn === 1 ? 2 : 1);
          this.startTurn(nextPlayer);
        }
        return;
      }

      // State: PASS_NOTICE
      if (this.state === 'PASS_NOTICE') {
        this.passTimer -= dt;
        const skip = (typeof PAD !== 'undefined' && (PAD.hit('a') || PAD.hit('b') || PAD.hit('start'))) || tapX >= 0;
        if (this.passTimer <= 0 || skip) {
          const nextPlayer = (this.passWhom === 'PLAYER' ? 2 : 1);
          this.startTurn(nextPlayer);
        }
        return;
      }

      // State: GAME_OVER
      if (this.state === 'GAME_OVER') {
        this.gameOverTimer += dt;
        const restart = (typeof PAD !== 'undefined' && (PAD.hit('a') || PAD.hit('b') || PAD.hit('start'))) || (tapX >= 0 && this.gameOverTimer > 0.4);
        if (restart) {
          playSfx('CONFIRM');
          this.init();
        }
        return;
      }

      // State: AI_THINKING
      if (this.state === 'AI_THINKING') {
        this.aiThinkTimer -= dt;
        if (this.aiThinkTimer <= 0) {
          const bestMove = selectAiMove(this.board, this.legalMoves, this.difficulty);
          if (bestMove) {
            this.cx = bestMove.x;
            this.cy = bestMove.y;
            this.makeMove(bestMove.x, bestMove.y, 2, bestMove.flips);
          } else {
            this.startTurn(1);
          }
        }
        return;
      }

      // State: PLAYER_TURN
      if (this.state === 'PLAYER_TURN') {
        if (typeof PAD !== 'undefined') {
          let moved = false;
          if (PAD.hit('left')) { this.cx = (this.cx - 1 + 8) % 8; moved = true; }
          if (PAD.hit('right')) { this.cx = (this.cx + 1) % 8; moved = true; }
          if (PAD.hit('up')) { this.cy = (this.cy - 1 + 8) % 8; moved = true; }
          if (PAD.hit('down')) { this.cy = (this.cy + 1) % 8; moved = true; }
          if (moved) playSfx('SELECT');

          if (PAD.hit('a')) {
            const match = this.legalMoves.find(m => m.x === this.cx && m.y === this.cy);
            if (match) {
              this.makeMove(match.x, match.y, 1, match.flips);
              return;
            } else {
              playSfx('ERROR');
            }
          }

          if (PAD.hit('select') || PAD.hit('b')) {
            this.difficulty = (this.difficulty + 1) % 3;
            playSfx('SELECT');
            this.bannerText = "AI: " + (this.difficulty === 0 ? "EASY" : this.difficulty === 1 ? "NORMAL" : "HARD");
            this.bannerTimer = 1.0;
          }
        }

        if (tapX >= 0) {
          const ox = 32, oy = 34, sz = 24;
          if (tapX >= ox && tapX < ox + 192 && tapY >= oy && tapY < oy + 192) {
            const tx = Math.floor((tapX - ox) / sz);
            const ty = Math.floor((tapY - oy) / sz);
            this.cx = tx;
            this.cy = ty;
            const match = this.legalMoves.find(m => m.x === tx && m.y === ty);
            if (match) {
              this.makeMove(match.x, match.y, 1, match.flips);
              return;
            } else {
              playSfx('ERROR');
            }
          } else if (tapY < 32 && tapX >= 180) {
            this.difficulty = (this.difficulty + 1) % 3;
            playSfx('SELECT');
            this.bannerText = "AI: " + (this.difficulty === 0 ? "EASY" : this.difficulty === 1 ? "NORMAL" : "HARD");
            this.bannerTimer = 1.0;
          }
        }
      }
    },

    // ------------------------------------------------------------------------
    // RENDER ROUTINES
    // ------------------------------------------------------------------------
    render(g) {
      g.clear(0);
      this.renderHeader(g);
      this.renderBoard(g);
      this.renderBottomBar(g);
      this.renderOverlays(g);
    },

    renderHeader(g) {
      g.rect(0, 0, 256, 32, 0);
      g.line(0, 32, 256, 32, 2);

      // Title
      g.text("REVERSI", 12, 5, 3);

      // Scoreboard
      // Player White Disc
      g.disc(78, 9, 4, 3);
      g.text("YOU:" + this.counts.p1, 86, 7, 3);

      // AI Dark Disc
      g.disc(134, 9, 4, 1);
      g.circle(134, 9, 4, 2);
      g.text("AI:" + this.counts.p2, 142, 7, 2);

      // Realtime margin diff
      const diff = this.counts.p1 - this.counts.p2;
      const diffStr = (diff >= 0 ? "+" : "") + diff;
      g.text(diffStr, 186, 7, diff >= 0 ? 3 : 1);

      // Difficulty Badge
      const diffName = this.difficulty === 0 ? "EZ" : this.difficulty === 1 ? "NORM" : "HARD";
      g.box(220, 4, 28, 11, 1);
      g.text(diffName, 223, 7, 2);

      // Subheader line (y = 20)
      if (this.state === 'PLAYER_TURN') {
        const blink = (this.pulseTimer % 0.5 < 0.25);
        g.text("▶ YOUR TURN (" + this.legalMoves.length + " MOVES)", 12, 20, blink ? 3 : 2);
      } else if (this.state === 'AI_THINKING') {
        const dots = ".".repeat(1 + (Math.floor(this.pulseTimer * 4) % 3));
        g.text("■ AI THINKING" + dots, 12, 20, 2);
      } else if (this.state === 'ANIMATING') {
        g.text("FLIPPING DISCS...", 12, 20, 3);
      } else if (this.state === 'PASS_NOTICE') {
        g.text("PASSING TURN...", 12, 20, 2);
      } else if (this.state === 'GAME_OVER') {
        g.text("MATCH FINISHED", 12, 20, 3);
      }

      const best = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(50) : 0;
      if (best > 0) {
        g.textR("BEST:+" + best, 248, 20, 2);
      }
    },

    renderBoard(g) {
      const ox = 32, oy = 34, sz = 24;

      // Outer bezel & board boundary
      g.box(ox - 3, oy - 3, 198, 198, 1);
      g.box(ox - 2, oy - 2, 196, 196, 2);
      g.box(ox - 1, oy - 1, 194, 194, 1);

      // Grid cells
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const bx = ox + x * sz, by = oy + y * sz;
          g.rect(bx, by, sz, sz, 0);
          g.box(bx, by, sz, sz, 1);
        }
      }

      // Classic Othello Star Points at grid intersections
      const starPoints = [
        [2, 2], [2, 6], [6, 2], [6, 6]
      ];
      for (let i = 0; i < starPoints.length; i++) {
        const [sx, sy] = starPoints[i];
        const px = ox + sx * sz, py = oy + sy * sz;
        g.rect(px - 1, py - 1, 3, 3, 2);
      }

      // Subtle phosphor indicators for legal player moves
      if (this.state === 'PLAYER_TURN') {
        const blink = (this.pulseTimer % 0.6 < 0.3);
        for (let i = 0; i < this.legalMoves.length; i++) {
          const m = this.legalMoves[i];
          const bx = ox + m.x * sz, by = oy + m.y * sz;
          g.circle(bx + 12, by + 12, 3, blink ? 3 : 2);
          g.px(bx + 12, by + 12, blink ? 3 : 1);
        }
      }

      // Render Discs
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const bx = ox + x * sz, by = oy + y * sz;
          const cx = bx + 12, cy = by + 12;

          // Check if animated flip is in progress
          const anim = this.flipAnims.find(a => a.x === x && a.y === y);
          if (anim && anim.timer >= anim.delay) {
            const p = Math.min(1.0, Math.max(0.0, (anim.timer - anim.delay) / anim.dur));
            this.drawFlippingDisc(g, cx, cy, anim.from, anim.to, p);
          } else {
            const v = this.board[bIdx(x, y)];
            if (v === 1) this.drawPlayerDisc(g, cx, cy);
            else if (v === 2) this.drawAiDisc(g, cx, cy);
          }
        }
      }

      // Placement ripple animation
      if (this.placedAnim) {
        const pax = ox + this.placedAnim.x * sz + 12;
        const pay = oy + this.placedAnim.y * sz + 12;
        const ringR = Math.floor(12 - this.placedAnim.timer * 20);
        if (ringR > 0 && ringR < 13) {
          g.circle(pax, pay, ringR, 3);
        }
      }

      // Player Cursor
      if (this.state === 'PLAYER_TURN' || this.state === 'AI_THINKING') {
        const curX = ox + this.cx * sz;
        const curY = oy + this.cy * sz;
        const col = (this.pulseTimer % 0.4 < 0.2) ? 3 : 2;
        // Top-left bracket
        g.line(curX, curY, curX + 5, curY, col);
        g.line(curX, curY, curX, curY + 5, col);
        // Top-right bracket
        g.line(curX + 23, curY, curX + 18, curY, col);
        g.line(curX + 23, curY, curX + 23, curY + 5, col);
        // Bottom-left bracket
        g.line(curX, curY + 23, curX + 5, curY + 23, col);
        g.line(curX, curY + 23, curX, curY + 18, col);
        // Bottom-right bracket
        g.line(curX + 23, curY + 23, curX + 18, curY + 23, col);
        g.line(curX + 23, curY + 23, curX + 23, curY + 18, col);
      }
    },

    drawPlayerDisc(g, cx, cy) {
      g.disc(cx, cy, 9, 3);
      g.circle(cx, cy, 9, 2);
      g.px(cx - 3, cy - 3, 3);
      g.px(cx - 2, cy - 3, 3);
      g.px(cx - 3, cy - 2, 3);
    },

    drawAiDisc(g, cx, cy) {
      g.disc(cx, cy, 9, 1);
      g.circle(cx, cy, 9, 2);
      g.circle(cx, cy, 5, 2);
      g.px(cx, cy, 2);
    },

    drawFlippingDisc(g, cx, cy, fromPlayer, toPlayer, progress) {
      const scaleX = Math.abs(Math.cos(progress * Math.PI));
      const curPlayer = (progress < 0.5 ? fromPlayer : toPlayer);

      for (let dy = -8; dy <= 8; dy++) {
        const rAtY = Math.sqrt(Math.max(0, 64 - dy * dy));
        const dx = Math.round(rAtY * scaleX);
        if (dx <= 0) {
          g.px(cx, cy + dy, curPlayer === 1 ? 3 : 2);
        } else {
          const col = (curPlayer === 1 ? 3 : 1);
          g.rect(cx - dx, cy + dy, dx * 2 + 1, 1, col);
          g.px(cx - dx, cy + dy, 2);
          g.px(cx + dx, cy + dy, 2);
        }
      }
      g.px(cx, cy - 9, 2);
      g.px(cx, cy + 9, 2);
    },

    renderBottomBar(g) {
      g.line(0, 227, 256, 227, 1);
      if (this.bannerTimer > 0) {
        g.textC(this.bannerText, 230, 3);
      } else if (this.state === 'PLAYER_TURN') {
        g.textC("[D-PAD/TAP] MOVE  [A] PLACE  [B] DIFF", 230, 2);
      } else if (this.state === 'AI_THINKING') {
        g.textC("CALCULATING STRATEGIC POSITIONS...", 230, 1);
      } else if (this.state === 'ANIMATING') {
        g.textC("OUTFLANKED DISCS FLIPPING...", 230, 2);
      } else if (this.state === 'PASS_NOTICE') {
        g.textC("[A / TAP] ACKNOWLEDGE PASS", 230, 3);
      } else if (this.state === 'GAME_OVER') {
        g.textC("[A / TAP] PLAY AGAIN", 230, 3);
      }
    },

    renderOverlays(g) {
      // Pass Notice Banner
      if (this.state === 'PASS_NOTICE') {
        g.dither(36, 88, 184, 52, 0, 1);
        g.rect(40, 92, 176, 44, 0);
        g.box(40, 92, 176, 44, 3);
        g.textC("NO LEGAL MOVES!", 100, 3);
        const msg = (this.passWhom === 'PLAYER' ? "PLAYER MUST PASS TURN" : "AI MUST PASS TURN");
        g.textC(msg, 114, 2);
        g.textC("PRESS [A / TAP] TO CONTINUE", 126, 1);
      }

      // Game Over Modal
      if (this.state === 'GAME_OVER') {
        g.dither(28, 52, 200, 136, 0, 1);
        g.rect(32, 56, 192, 128, 0);
        g.box(32, 56, 192, 128, 3);
        g.box(34, 58, 188, 124, 1);

        g.textC("=== GAME OVER ===", 66, 3);
        g.textC("YOU: " + this.counts.p1 + "   AI: " + this.counts.p2, 82, 2);

        const best = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(50) : 0;

        if (this.finalMargin > 0) {
          g.textC("★ VICTORY! ★", 100, 3);
          g.textC("WIN MARGIN: +" + this.finalMargin, 116, 3);
          if (this.isNewRecord) {
            g.textC("★ NEW BEST RECORD! ★", 132, 3);
          } else {
            g.textC("BEST MARGIN: +" + best, 132, 2);
          }
        } else if (this.finalMargin < 0) {
          g.textC("DEFEAT", 100, 2);
          g.textC("MARGIN: " + this.finalMargin, 116, 1);
          if (best > 0) g.textC("RECORD: +" + best, 132, 2);
        } else {
          g.textC("DRAW GAME!", 100, 2);
          g.textC("PERFECT TIE: 32 - 32", 116, 2);
          if (best > 0) g.textC("RECORD: +" + best, 132, 2);
        }

        const blink = (this.pulseTimer % 0.5 < 0.25);
        g.textC("PRESS [A / START] TO PLAY AGAIN", 160, blink ? 3 : 2);
      }
    },

    // ------------------------------------------------------------------------
    // PERSISTENCE
    // ------------------------------------------------------------------------
    save() {
      return {
        board: Array.from(this.board),
        state: this.state,
        turn: this.turn,
        cx: this.cx,
        cy: this.cy,
        difficulty: this.difficulty,
        counts: { ...this.counts },
        finalMargin: this.finalMargin
      };
    },

    load(data) {
      if (!data || !Array.isArray(data.board) || data.board.length !== 64) return;
      this.board = data.board.slice();
      this.state = data.state || 'PLAYER_TURN';
      this.turn = data.turn || 1;
      this.cx = (typeof data.cx === 'number') ? data.cx : 2;
      this.cy = (typeof data.cy === 'number') ? data.cy : 3;
      this.difficulty = (typeof data.difficulty === 'number') ? data.difficulty : 1;
      this.counts = data.counts || countDiscs(this.board);
      this.finalMargin = data.finalMargin || 0;
      this.legalMoves = getLegalMoves(this.board, this.turn);
      this.flipAnims = [];
      this.placedAnim = null;
    }
  };
})();
