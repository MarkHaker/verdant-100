// js/cartridges/cart_013_minesweeper.js
// ============================================================================
// Cartridge #013: MINESWEEPER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 13. MINESWEEPER
CARTS[13] = {
  id: 13, name: "MINESWEEPER", genre: 1, scoreLabel: "TIME",
  desc: "9X9 MINEFIELD. TAP TO DIG OR FAST-CHORD. [B] OR DOUBLE-TAP TO FLAG. FIRST CLICK SAFE!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 2);
    // 3D Bevel on icon
    g.line(x, y, x + 31, y, 3);
    g.line(x, y + 1, x + 30, y + 1, 3);
    g.line(x, y, x, y + 31, 3);
    g.line(x + 1, y, x + 1, y + 30, 3);
    g.line(x, y + 31, x + 31, y + 31, 0);
    g.line(x + 31, y, x + 31, y + 31, 0);
    g.line(x + 1, y + 30, x + 30, y + 30, 1);
    g.line(x + 30, y + 1, x + 30, y + 30, 1);

    // Spiked retro mine
    g.disc(x + 16, y + 16, 6, 0);
    g.line(x + 7, y + 16, x + 25, y + 16, 0);
    g.line(x + 16, y + 7, x + 16, y + 25, 0);
    g.line(x + 10, y + 10, x + 22, y + 22, 0);
    g.line(x + 10, y + 22, x + 22, y + 10, 0);
    g.px(x + 14, y + 14, 3);

    // Little flag on top right
    g.line(x + 23, y + 6, x + 23, y + 12, 0);
    g.tri(x + 23, y + 6, x + 19, y + 8, x + 23, y + 10, 3);
  },

  init() {
    this.cx = 4;
    this.cy = 4;
    this.revealed = E1.create(9, 9, 0);
    this.flags = E1.create(9, 9, 0);
    this.mines = E1.create(9, 9, 0);
    this.generated = false;
    this.over = false;
    this.won = false;
    this.time = 0;
    this.explodedTile = null;
    this.shake = 0;
    this.flagMode = false; // false = DIG mode, true = FLAG mode
    this.lastTapTile = null;
    this.lastTapTime = 0;
  },

  // First click is guaranteed safe and opens a zero-tile blank cascade!
  // Mines are only placed outside the 3x3 neighborhood of the initial click.
  spawnMines(firstX, firstY) {
    const candidates = [];
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (Math.abs(x - firstX) > 1 || Math.abs(y - firstY) > 1) {
          candidates.push([x, y]);
        }
      }
    }
    // Fisher-Yates shuffle candidates
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = candidates[i];
      candidates[i] = candidates[j];
      candidates[j] = tmp;
    }
    // Place 10 mines
    for (let i = 0; i < 10; i++) {
      const [mx, my] = candidates[i];
      E1.set(this.mines, mx, my, 1);
    }
    this.generated = true;
  },

  countMines(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (E1.get(this.mines, x + dx, y + dy) === 1) count++;
      }
    }
    return count;
  },

  countFlags(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (E1.get(this.flags, x + dx, y + dy) === 1) count++;
      }
    }
    return count;
  },

  getRemainingMines() {
    let flagCount = 0;
    for (let i = 0; i < 81; i++) {
      if (this.flags.data[i] === 1) flagCount++;
    }
    return 10 - flagCount;
  },

  // Optimal non-recursive BFS flood-fill with single-queue tracking
  reveal(sx, sy) {
    if (E1.get(this.flags, sx, sy) === 1) return;
    if (E1.get(this.revealed, sx, sy) === 1) return;

    const queued = new Uint8Array(81);
    const queue = [[sx, sy]];
    queued[sy * 9 + sx] = 1;

    while (queue.length > 0) {
      const [x, y] = queue.pop();
      if (x < 0 || x >= 9 || y < 0 || y >= 9) continue;
      if (E1.get(this.revealed, x, y) === 1) continue;
      if (E1.get(this.flags, x, y) === 1) continue;
      if (E1.get(this.mines, x, y) === 1) continue;

      E1.set(this.revealed, x, y, 1);
      const count = this.countMines(x, y);
      if (count === 0) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx !== 0 || dy !== 0) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < 9 && ny >= 0 && ny < 9) {
                const idx = ny * 9 + nx;
                if (!queued[idx] && E1.get(this.revealed, nx, ny) === 0 && E1.get(this.flags, nx, ny) === 0) {
                  queued[idx] = 1;
                  queue.push([nx, ny]);
                }
              }
            }
          }
        }
      }
    }
  },

  dig(x, y) {
    if (E1.get(this.flags, x, y) === 1) return;
    if (E1.get(this.revealed, x, y) === 1) {
      this.chord(x, y);
      return;
    }

    if (!this.generated) {
      this.spawnMines(x, y);
    }

    if (E1.get(this.mines, x, y) === 1) {
      this.over = true;
      this.explodedTile = [x, y];
      this.shake = 0.45;
      APU.sfx('BOOM');
      PAD.vibrate(60);
      return;
    }

    this.reveal(x, y);
    APU.sfx('COIN');
    PAD.vibrate(10);
    this.checkWin();
  },

  // Fast clear / Chording: if adjacent flags equal number, open all other neighbors!
  chord(x, y) {
    const mineCount = this.countMines(x, y);
    if (mineCount === 0) return;
    const flagCount = this.countFlags(x, y);
    if (flagCount !== mineCount) {
      APU.sfx('TICK');
      return;
    }

    // Check if any unflagged neighbor has a mine (due to incorrect flag)
    let detonated = false;
    let detX = -1, detY = -1;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < 9 && ny >= 0 && ny < 9) {
          if (E1.get(this.flags, nx, ny) === 0 && E1.get(this.revealed, nx, ny) === 0) {
            if (E1.get(this.mines, nx, ny) === 1) {
              detonated = true;
              detX = nx; detY = ny;
              break;
            }
          }
        }
      }
      if (detonated) break;
    }

    if (detonated) {
      this.over = true;
      this.explodedTile = [detX, detY];
      this.shake = 0.45;
      APU.sfx('BOOM');
      PAD.vibrate(60);
      return;
    }

    // Reveal all unflagged, unrevealed neighbors
    let revealedAny = false;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < 9 && ny >= 0 && ny < 9) {
          if (E1.get(this.flags, nx, ny) === 0 && E1.get(this.revealed, nx, ny) === 0) {
            this.reveal(nx, ny);
            revealedAny = true;
          }
        }
      }
    }

    if (revealedAny) {
      APU.sfx('COIN');
      PAD.vibrate(10);
      this.checkWin();
    }
  },

  toggleFlag(x, y) {
    if (E1.get(this.revealed, x, y) === 1) return;
    const f = E1.get(this.flags, x, y);
    E1.set(this.flags, x, y, f ? 0 : 1);
    APU.sfx('TICK');
    PAD.vibrate(15);
  },

  checkWin() {
    let revCount = 0;
    for (let i = 0; i < 81; i++) {
      if (this.revealed.data[i] === 1) revCount++;
    }
    if (revCount === 71) {
      this.won = true;
      // Auto-flag all 10 mines
      for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
          if (E1.get(this.mines, x, y) === 1) {
            E1.set(this.flags, x, y, 1);
          }
        }
      }
      APU.sfx('LEVELUP');
      PAD.vibrate(30);

      const finalTime = Math.max(1, Math.floor(this.time));
      const curBest = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;
      if (curBest === 0 || finalTime < curBest) {
        if (typeof SAVE !== 'undefined' && SAVE.data && SAVE.data.rec) {
          const existing = SAVE.data.rec[String(this.id)] || { s: 0, t: 0 };
          existing.s = finalTime;
          SAVE.data.rec[String(this.id)] = existing;
          SAVE.commit();
        } else if (typeof SAVE !== 'undefined' && SAVE.setScore) {
          SAVE.setScore(this.id, finalTime);
        }
      }
    }
  },

  update(dt) {
    // Screen shake decay
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt);
    }

    // Restart check on Game Over or Victory
    if (this.over || this.won) {
      if (PAD.hit('a') || PAD.hit('start')) {
        this.init();
        return;
      }
      if (PAD.tapPos) {
        const tx = PAD.tapPos.x, ty = PAD.tapPos.y;
        // Tapping the status smiley face or dialog overlay restarts immediately
        if ((tx >= 116 && tx <= 140 && ty >= 20 && ty <= 44) ||
            (tx >= 40 && tx <= 216 && ty >= 90 && ty <= 150)) {
          this.init();
          APU.sfx('UI_OK');
          return;
        }
      }
      return;
    }

    // Timer increments once initial move is made
    if (this.generated) {
      this.time += dt;
    }

    // D-Pad Navigation
    if (PAD.hit('left')) this.cx = Math.max(0, this.cx - 1);
    if (PAD.hit('right')) this.cx = Math.min(8, this.cx + 1);
    if (PAD.hit('up')) this.cy = Math.max(0, this.cy - 1);
    if (PAD.hit('down')) this.cy = Math.min(8, this.cy + 1);

    // Swipes
    if (PAD.swipe === 'left') this.cx = Math.max(0, this.cx - 1);
    if (PAD.swipe === 'right') this.cx = Math.min(8, this.cx + 1);
    if (PAD.swipe === 'up') this.cy = Math.max(0, this.cy - 1);
    if (PAD.swipe === 'down') this.cy = Math.min(8, this.cy + 1);

    // Mode toggle via SELECT key
    if (PAD.hit('select')) {
      this.flagMode = !this.flagMode;
      APU.sfx('UI_MOVE');
      PAD.vibrate(12);
    }

    // Flag toggle via B button or Long-Press
    if (PAD.hit('b') || PAD.longPress) {
      this.toggleFlag(this.cx, this.cy);
    }

    // [A] Button Action
    if (PAD.hit('a')) {
      if (this.flagMode) {
        this.toggleFlag(this.cx, this.cy);
      } else {
        const isRev = E1.get(this.revealed, this.cx, this.cy) === 1;
        if (isRev) {
          this.chord(this.cx, this.cy);
        } else {
          this.dig(this.cx, this.cy);
        }
      }
    }

    // Direct Mobile Touch Controls
    if (PAD.tapPos) {
      const tapX = PAD.tapPos.x;
      const tapY = PAD.tapPos.y;

      // 1. Tapping Status Face button (Restart)
      if (tapX >= 116 && tapX <= 140 && tapY >= 20 && tapY <= 44) {
        this.init();
        APU.sfx('UI_OK');
        return;
      }

      // 2. Tapping DIG / FLAG mode toggle button in bottom HUD
      if (tapX >= 45 && tapX <= 122 && tapY >= 218 && tapY <= 238) {
        this.flagMode = !this.flagMode;
        APU.sfx('UI_MOVE');
        PAD.vibrate(12);
        return;
      }

      // 3. Tapping directly on a 9x9 board tile
      const ox = 47, oy = 52, sz = 18;
      if (tapX >= ox && tapX < ox + 9 * sz && tapY >= oy && tapY < oy + 9 * sz) {
        const tx = Math.floor((tapX - ox) / sz);
        const ty = Math.floor((tapY - oy) / sz);
        if (tx >= 0 && tx < 9 && ty >= 0 && ty < 9) {
          this.cx = tx;
          this.cy = ty;

          const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
          const isDoubleTap = (this.lastTapTile && this.lastTapTile.x === tx && this.lastTapTile.y === ty && (now - this.lastTapTime) < 350);
          this.lastTapTile = { x: tx, y: ty };
          this.lastTapTime = now;

          if (isDoubleTap) {
            // Quick double-tap always toggles flag!
            this.toggleFlag(tx, ty);
          } else if (this.flagMode) {
            // FLAG mode tap
            this.toggleFlag(tx, ty);
          } else {
            // DIG mode tap: if already revealed, chord-clear; else dig!
            const isRev = E1.get(this.revealed, tx, ty) === 1;
            if (isRev) {
              this.chord(tx, ty);
            } else {
              this.dig(tx, ty);
            }
          }
        }
      }
    }
  },

  drawTile(g, x, y, bx, by, sz) {
    const rev = E1.get(this.revealed, x, y) === 1;
    const flg = E1.get(this.flags, x, y) === 1;
    const isMine = E1.get(this.mines, x, y) === 1;
    const isExploded = this.over && this.explodedTile && this.explodedTile[0] === x && this.explodedTile[1] === y;

    if (isExploded) {
      // Detonating mine: bright glowing red/white tile with black mine
      g.rect(bx, by, sz, sz, 3);
      g.box(bx, by, sz, sz, 0);
      this.drawMine(g, bx, by, sz, 0, 0);
    } else if (this.over && flg && !isMine) {
      // Misflagged tile on game over: false flag crossed out
      g.rect(bx, by, sz, sz, 1);
      g.line(bx, by, bx + sz - 1, by, 0);
      g.line(bx, by, bx, by + sz - 1, 0);
      g.line(bx, by + sz - 1, bx + sz - 1, by + sz - 1, 2);
      g.line(bx + sz - 1, by, bx + sz - 1, by + sz - 1, 2);
      this.drawMine(g, bx, by, sz, 2, 1);
      g.line(bx + 3, by + 3, bx + sz - 4, by + sz - 4, 3);
      g.line(bx + 3, by + sz - 4, bx + sz - 4, by + 3, 3);
    } else if (this.over && isMine && !flg) {
      // Unflagged mine revealed on loss
      g.rect(bx, by, sz, sz, 1);
      g.line(bx, by, bx + sz - 1, by, 0);
      g.line(bx, by, bx, by + sz - 1, 0);
      g.line(bx, by + sz - 1, bx + sz - 1, by + sz - 1, 2);
      g.line(bx + sz - 1, by, bx + sz - 1, by + sz - 1, 2);
      this.drawMine(g, bx, by, sz, 3, 2);
    } else if (rev) {
      // Revealed sunken recessed tile
      g.rect(bx, by, sz, sz, 1);
      // Recessed 3D border
      g.line(bx, by, bx + sz - 1, by, 0);
      g.line(bx, by, bx, by + sz - 1, 0);
      g.line(bx, by + sz - 1, bx + sz - 1, by + sz - 1, 2);
      g.line(bx + sz - 1, by, bx + sz - 1, by + sz - 1, 2);

      const count = this.countMines(x, y);
      if (count > 0) {
        const tx = bx + 5, ty = by + 3;
        // Distinct color styling: 1=color 2, 2=color 3, 3=color 3 bold, 4=color 2 bold, 5+=color 3 bold
        if (count === 1) {
          g.text("1", tx, ty, 2, 2);
        } else if (count === 2) {
          g.text("2", tx, ty, 3, 2);
        } else if (count === 3) {
          g.text("3", tx, ty, 3, 2);
          g.text("3", tx + 1, ty, 3, 2);
        } else if (count === 4) {
          g.text("4", tx, ty, 2, 2);
          g.text("4", tx + 1, ty, 2, 2);
        } else {
          g.text("" + count, tx, ty, 3, 2);
          g.text("" + count, tx + 1, ty, 3, 2);
        }
      }
    } else {
      // Hidden tile with authentic 3D raised bevels
      g.rect(bx, by, sz, sz, 2);
      // Light highlight on top & left
      g.line(bx, by, bx + sz - 1, by, 3);
      g.line(bx, by + 1, bx + sz - 2, by + 1, 3);
      g.line(bx, by, bx, by + sz - 1, 3);
      g.line(bx + 1, by, bx + 1, by + sz - 2, 3);
      // Dark shadow on bottom & right
      g.line(bx, by + sz - 1, bx + sz - 1, by + sz - 1, 0);
      g.line(bx + sz - 1, by, bx + sz - 1, by + sz - 1, 0);
      g.line(bx + 1, by + sz - 2, bx + sz - 2, by + sz - 2, 1);
      g.line(bx + sz - 2, by + 1, bx + sz - 2, by + sz - 2, 1);

      if (flg) {
        this.drawFlag(g, bx, by, sz);
      }
    }
  },

  drawMine(g, bx, by, sz, mineColor, spikeColor) {
    const mx = bx + Math.floor(sz / 2);
    const my = by + Math.floor(sz / 2);
    g.disc(mx, my, 4, mineColor);
    // Spikes
    g.line(mx - 6, my, mx + 6, my, spikeColor);
    g.line(mx, my - 6, mx, my + 6, spikeColor);
    g.line(mx - 4, my - 4, mx + 4, my + 4, spikeColor);
    g.line(mx - 4, my + 4, mx + 4, my - 4, spikeColor);
    if (mineColor !== 0) {
      g.px(mx - 1, my - 1, 3);
    }
  },

  drawFlag(g, bx, by, sz) {
    const cx = bx + 9;
    // Flag pole
    g.line(cx + 1, by + 4, cx + 1, by + 13, 0);
    // Triangular flag
    g.tri(cx + 1, by + 4, cx - 5, by + 7, cx + 1, by + 10, 3);
    // Base stand
    g.line(cx - 2, by + 12, cx + 4, by + 12, 0);
    g.line(cx - 3, by + 13, cx + 5, by + 13, 0);
  },

  render(g) {
    g.clear(0);

    // Screen Shake offset calculation
    let shakeX = 0, shakeY = 0;
    if (this.shake > 0) {
      const mag = Math.ceil(this.shake * 8);
      shakeX = (Math.random() * (mag * 2 + 1) - mag) | 0;
      shakeY = (Math.random() * (mag * 2 + 1) - mag) | 0;
    }

    const ox = 47, oy = 52, sz = 18;

    // Header Title and High Score Record
    g.text("MINESWEEPER", 47, 6, 3);
    const best = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;
    const bestStr = best > 0 ? (best + "S") : "---";
    g.textR("BEST: " + bestStr, 209, 6, 2);

    // ========================================================================
    // Authentic Retro Minesweeper HUD Header Panel
    // ========================================================================
    const hx = 45 + shakeX, hy = 18 + shakeY;
    g.rect(hx, hy, 166, 28, 1);
    // Beveled frame
    g.line(hx, hy, hx + 165, hy, 0);
    g.line(hx, hy, hx, hy + 27, 0);
    g.line(hx, hy + 27, hx + 165, hy + 27, 2);
    g.line(hx + 165, hy, hx + 165, hy + 27, 2);

    // 1. Mines Remaining Counter (Digital LED Style)
    g.rect(hx + 4, hy + 4, 34, 20, 0);
    g.box(hx + 4, hy + 4, 34, 20, 1);
    g.text("888", hx + 7, hy + 8, 1, 2); // Dim background unlit segments
    const rem = this.getRemainingMines();
    let remStr;
    if (rem < 0) {
      remStr = "-" + String(Math.min(99, Math.abs(rem))).padStart(2, '0');
    } else {
      remStr = String(Math.min(999, rem)).padStart(3, '0');
    }
    g.text(remStr, hx + 7, hy + 8, 3, 2);

    // 2. Smiley Status Face Button
    const fx = hx + 73, fy = hy + 4;
    g.rect(fx, fy, 20, 20, 2);
    g.line(fx, fy, fx + 19, fy, 3);
    g.line(fx, fy, fx, fy + 19, 3);
    g.line(fx, fy + 19, fx + 19, fy + 19, 0);
    g.line(fx + 19, fy, fx + 19, fy + 19, 0);

    const fcx = fx + 10, fcy = fy + 10;
    g.circle(fcx, fcy, 6, 3);
    if (this.won) {
      // Cool shades + smile
      g.rect(fcx - 5, fcy - 3, 11, 3, 3);
      g.line(fcx - 6, fcy - 2, fcx + 5, fcy - 2, 3);
      g.line(fcx - 3, fcy + 3, fcx + 3, fcy + 3, 3);
      g.px(fcx - 4, fcy + 2, 3); g.px(fcx + 4, fcy + 2, 3);
    } else if (this.over) {
      // Dead eyes + frown
      g.px(fcx - 3, fcy - 3, 3); g.px(fcx - 1, fcy - 1, 3);
      g.px(fcx - 3, fcy - 1, 3); g.px(fcx - 1, fcy - 3, 3);
      g.px(fcx + 1, fcy - 3, 3); g.px(fcx + 3, fcy - 1, 3);
      g.px(fcx + 1, fcy - 1, 3); g.px(fcx + 3, fcy - 3, 3);
      g.line(fcx - 3, fcy + 3, fcx + 3, fcy + 3, 3);
      g.px(fcx - 4, fcy + 4, 3); g.px(fcx + 4, fcy + 4, 3);
    } else if ((PAD.held('a') && !this.over && !this.won) || (PAD.pointer && PAD.pointer.down)) {
      // Tension / surprised mouth
      g.px(fcx - 3, fcy - 2, 3); g.px(fcx + 3, fcy - 2, 3);
      g.circle(fcx, fcy + 2, 2, 3);
    } else {
      // Normal happy smile
      g.px(fcx - 3, fcy - 2, 3); g.px(fcx + 3, fcy - 2, 3);
      g.line(fcx - 2, fcy + 2, fcx + 2, fcy + 2, 3);
      g.px(fcx - 3, fcy + 1, 3); g.px(fcx + 3, fcy + 1, 3);
    }

    // 3. Timer (Digital LED Style)
    g.rect(hx + 128, hy + 4, 34, 20, 0);
    g.box(hx + 128, hy + 4, 34, 20, 1);
    g.text("888", hx + 131, hy + 8, 1, 2); // Dim background unlit segments
    const timeSec = Math.min(999, Math.floor(this.time));
    const timeStr = String(timeSec).padStart(3, '0');
    g.text(timeStr, hx + 131, hy + 8, 3, 2);

    // ========================================================================
    // 9x9 Board Rendering
    // ========================================================================
    // Outer sunken board frame
    g.line(45 + shakeX, 50 + shakeY, 210 + shakeX, 50 + shakeY, 0);
    g.line(45 + shakeX, 50 + shakeY, 45 + shakeX, 215 + shakeY, 0);
    g.line(45 + shakeX, 215 + shakeY, 210 + shakeX, 215 + shakeY, 2);
    g.line(210 + shakeX, 50 + shakeY, 210 + shakeX, 215 + shakeY, 2);

    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const bx = ox + x * sz + shakeX;
        const by = oy + y * sz + shakeY;
        this.drawTile(g, x, y, bx, by, sz);
      }
    }

    // Cursor reticle
    const curBx = ox + this.cx * sz + shakeX;
    const curBy = oy + this.cy * sz + shakeY;
    g.box(curBx - 1, curBy - 1, sz + 2, sz + 2, 3);

    // ========================================================================
    // Bottom Controls & DIG / FLAG Mode Toggle
    // ========================================================================
    const byY = 219;
    if (this.flagMode) {
      g.rect(45, byY, 76, 17, 2);
      g.box(45, byY, 76, 17, 3);
      g.text("MODE: FLAG", 49, byY + 6, 3);
    } else {
      g.rect(45, byY, 76, 17, 1);
      g.box(45, byY, 76, 17, 2);
      g.text("MODE: DIG", 52, byY + 6, 3);
    }

    g.text("[SEL] MODE  [B] FLAG", 128, byY + 3, 2);
    g.text("[A] DIG / CHORD", 128, byY + 11, 1);

    // ========================================================================
    // Game Over & Victory Overlays
    // ========================================================================
    if (this.won) {
      g.dither(40, 92, 176, 56, 0, 1);
      g.rect(40, 92, 176, 56, 0);
      g.box(40, 92, 176, 56, 3);
      g.textC("MINEFIELD CLEARED!", 100, 3);
      const curBest = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;
      g.textC("TIME: " + Math.floor(this.time) + "S  BEST: " + curBest + "S", 114, 2);
      g.textC("[A] OR TAP FACE TO PLAY", 128, 3);
    } else if (this.over) {
      g.dither(44, 96, 168, 48, 0, 1);
      g.rect(44, 96, 168, 48, 0);
      g.box(44, 96, 168, 48, 3);
      g.textC("BOOM! MINE EXPLODED", 106, 3);
      g.textC("[A] OR TAP FACE TO RETRY", 122, 2);
    }
  }
};
