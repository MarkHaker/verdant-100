// js/cartridges/cart_025_falling_sand.js
// ============================================================================
// Cartridge #025: FALLING SAND
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[25] = {
  id: 25,
  name: "FALLING SAND",
  genre: 2,
  scoreLabel: "PARTICLES",
  desc: "INTERACTIVE POWDER SANDBOX: SAND, WATER, STONE, FIRE. DRAW WITH CURSOR!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Hourglass silhouette / mountain crater with glowing particles
    g.line(x + 6, y + 6, x + 15, y + 16, 2);
    g.line(x + 25, y + 6, x + 16, y + 16, 2);
    g.line(x + 15, y + 16, x + 6, y + 26, 2);
    g.line(x + 16, y + 16, x + 25, y + 26, 2);
    g.line(x + 6, y + 26, x + 25, y + 26, 2);
    g.line(x + 6, y + 6, x + 25, y + 6, 2);
    // Falling sand grains
    g.px(x + 15, y + 17, 3);
    g.px(x + 16, y + 19, 3);
    g.px(x + 15, y + 22, 3);
    // Sand heaps
    g.rect(x + 10, y + 8, 12, 4, 3);
    g.rect(x + 12, y + 24, 8, 2, 3);
    // Sparks & flame glints
    g.px(x + 5, y + 12, 2);
    g.px(x + 26, y + 14, 2);
    g.px(x + 16, y + 4, 3);
  },

  init() {
    this.GW = 80;
    this.GH = 60;
    this.SZ = 3;
    this.OX = 8;
    this.OY = 20;

    const total = this.GW * this.GH;
    this.grid = new Uint8Array(total);
    this.life = new Uint8Array(total);
    this.sub = new Uint8Array(total);
    this.updated = new Uint8Array(total);
    this.tickId = 1;

    // Cursor position & sub-pixel velocity
    this.cx = 40;
    this.cy = 30;
    this.fx = 40;
    this.fy = 30;
    this.cursorSpeed = 20;

    // Drawing settings
    this.elem = 1; // 1 = SAND
    this.lastSpoutElem = 2; // For spout: default WATER
    this.brushIdx = 0; // 0 = 1px, 1 = 3px, 2 = 5px
    this.brushSizes = [1, 3, 5];

    // Presets
    this.presetIdx = 0;
    this.presetNames = ["FREE", "HOURGLASS", "DAM", "VOLCANO", "ACID"];

    // Input tracking
    this.selectHoldTimer = 0;
    this.clearedThisHold = false;
    this.lastPointerDown = false;
    this.lastDragX = null;
    this.lastDragY = null;

    // Simulation & stats
    this.simAcc = 0;
    this.particleCount = 0;
    this.score = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;
    this.time = 0;
    this.frame = 0;
    this.shake = 0;

    // Audio throttle timers
    this.sfxRustleTimer = 0;
    this.sfxSplashTimer = 0;
    this.sfxHissTimer = 0;
    this.sfxSizzleTimer = 0;
    this.sfxBoomTimer = 0;

    this.loadPreset(0);
  },

  setCell(x, y, elem, sub = 0, life = 0) {
    if (x < 0 || x >= this.GW || y < 0 || y >= this.GH) return;
    const idx = y * this.GW + x;
    this.grid[idx] = elem;
    this.sub[idx] = sub;
    this.life[idx] = life;
  },

  fillBox(x0, y0, w, h, elem, sub = 0, life = 0) {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        this.setCell(x, y, elem, sub, life);
      }
    }
  },

  drawWallLine(x0, y0, x1, y1, elem) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let cx = x0, cy = y0;
    while (true) {
      this.setCell(cx, cy, elem);
      if (cx === x1 && cy === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; cx += sx; }
      if (e2 < dx) { err += dx; cy += sy; }
    }
  },

  loadPreset(idx) {
    this.presetIdx = idx % 5;
    this.grid.fill(0);
    this.life.fill(0);
    this.sub.fill(0);

    const GW = this.GW, GH = this.GH;

    // Outer boundary walls
    for (let x = 0; x < GW; x++) {
      this.setCell(x, GH - 1, 3);
      this.setCell(x, 0, 3);
    }
    for (let y = 0; y < GH; y++) {
      this.setCell(0, y, 3);
      this.setCell(GW - 1, y, 3);
    }

    if (this.presetIdx === 0) {
      // PRESET 0: FREE CANVAS
      this.fillBox(34, GH - 4, 12, 3, 3);
    } else if (this.presetIdx === 1) {
      // PRESET 1: THE HOURGLASS
      this.drawWallLine(18, 6, 38, 28, 3);
      this.drawWallLine(61, 6, 41, 28, 3);
      this.setCell(38, 29, 3);
      this.setCell(41, 29, 3);
      this.setCell(38, 30, 3);
      this.setCell(41, 30, 3);
      this.drawWallLine(38, 31, 18, 52, 3);
      this.drawWallLine(41, 31, 61, 52, 3);
      this.fillBox(18, 53, 44, 2, 3);

      for (let y = 9; y <= 26; y++) {
        const leftX = Math.round(18 + (38 - 18) * ((y - 6) / 22)) + 1;
        const rightX = Math.round(61 + (41 - 61) * ((y - 6) / 22)) - 1;
        for (let x = leftX; x <= rightX; x++) {
          this.setCell(x, y, 1);
        }
      }
    } else if (this.presetIdx === 2) {
      // PRESET 2: HYDRO DAM
      this.fillBox(1, 22, 34, 33, 2);
      this.fillBox(1, 17, 34, 5, 6);
      this.fillBox(35, 14, 4, 9, 3);
      this.fillBox(35, 23, 3, 25, 4);
      this.fillBox(35, 48, 4, 11, 3);
      this.setCell(6, 6, 9, 2);
      this.fillBox(5, 5, 3, 1, 3);

      for (let x = 40; x < GW - 1; x++) {
        const duneH = Math.round(Math.sin((x - 40) * 0.2) * 3 + 54);
        for (let y = duneH; y < GH - 1; y++) {
          this.setCell(x, y, 1);
        }
      }
      this.fillBox(48, 44, 10, 8, 4);
      this.fillBox(50, 46, 6, 6, 0);
      this.fillBox(64, 45, 8, 7, 4);
      this.fillBox(66, 47, 4, 5, 0);
    } else if (this.presetIdx === 3) {
      // PRESET 3: POWDER KEG / VOLCANO
      this.drawWallLine(8, GH - 2, 28, 24, 3);
      this.drawWallLine(28, 24, 33, 28, 3);
      this.drawWallLine(71, GH - 2, 51, 24, 3);
      this.drawWallLine(51, 24, 46, 28, 3);
      this.fillBox(26, 54, 28, 5, 3);

      this.fillBox(26, 36, 28, 18, 7);
      this.fillBox(28, 29, 24, 7, 6);
      this.fillBox(30, 21, 20, 3, 4);
      this.setCell(40, 20, 6);
      this.drawWallLine(14, GH - 4, 27, 28, 7);
    } else if (this.presetIdx === 4) {
      // PRESET 4: ACID CHAMBER
      this.fillBox(22, 6, 36, 1, 3);
      this.fillBox(22, 7, 1, 10, 3);
      this.fillBox(57, 7, 1, 10, 3);
      this.fillBox(22, 17, 36, 2, 4);
      this.fillBox(23, 7, 34, 10, 8);

      this.fillBox(10, 26, 26, 2, 3);
      this.fillBox(44, 26, 26, 2, 3);
      this.fillBox(12, 28, 22, 4, 1);
      this.fillBox(46, 28, 22, 4, 6);

      this.fillBox(28, 36, 24, 2, 3);
      this.fillBox(28, 38, 24, 3, 4);

      this.fillBox(12, 48, 16, 10, 7);
      this.fillBox(52, 48, 16, 10, 2);
      this.fillBox(10, 47, 20, 1, 3);
      this.fillBox(50, 47, 20, 1, 3);
    }

    if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_OK');
  },

  clearCanvas() {
    this.grid.fill(0);
    this.life.fill(0);
    this.sub.fill(0);
    for (let x = 0; x < this.GW; x++) {
      this.setCell(x, this.GH - 1, 3);
      this.setCell(x, 0, 3);
    }
    for (let y = 0; y < this.GH; y++) {
      this.setCell(0, y, 3);
      this.setCell(this.GW - 1, y, 3);
    }
    if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_BACK');
  },

  selectTool(chipIdx) {
    const toolIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    if (chipIdx >= 0 && chipIdx < toolIds.length) {
      this.elem = toolIds[chipIdx];
      if (this.elem >= 1 && this.elem <= 8 && this.elem !== 3 && this.elem !== 4) {
        this.lastSpoutElem = this.elem;
      }
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
    }
  },

  cycleMaterial() {
    const toolIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const curIdx = toolIds.indexOf(this.elem);
    const nextIdx = (curIdx + 1) % toolIds.length;
    this.elem = toolIds[nextIdx];
    if (this.elem >= 1 && this.elem <= 8 && this.elem !== 3 && this.elem !== 4) {
      this.lastSpoutElem = this.elem;
    }
    if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
  },

  paint(gx, gy) {
    const r = this.brushIdx === 0 ? 0 : (this.brushIdx === 1 ? 1 : 2);
    const elem = this.elem;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (r === 2 && (dx * dx + dy * dy > 5)) continue;
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx < 0 || nx >= this.GW || ny < 0 || ny >= this.GH) continue;
        const idx = ny * this.GW + nx;

        if (elem === 10) {
          this.grid[idx] = 0;
          this.life[idx] = 0;
          this.sub[idx] = 0;
        } else if (elem === 9) {
          this.grid[idx] = 9;
          this.life[idx] = 0;
          this.sub[idx] = this.lastSpoutElem || 2;
        } else {
          const cur = this.grid[idx];
          if (cur === 0 || (elem === 5 && (cur === 4 || cur === 6 || cur === 7)) || elem === 8) {
            if ((elem === 1 || elem === 2 || elem === 6 || elem === 7 || elem === 8) && r > 0) {
              if (Math.random() < 0.65) {
                this.grid[idx] = elem;
                this.life[idx] = 0;
              }
            } else {
              this.grid[idx] = elem;
              this.life[idx] = elem === 5 ? (15 + Math.floor(Math.random() * 20)) : 0;
            }
          }
        }
      }
    }

    if (this.elem === 1 || this.elem === 7) {
      if (this.sfxRustleTimer <= 0) {
        if (typeof APU !== 'undefined' && APU.noise) APU.noise(0.02, 0.04, 1400, 'bandpass');
        this.sfxRustleTimer = 0.08;
      }
    } else if (this.elem === 2 || this.elem === 6 || this.elem === 8) {
      if (this.sfxSplashTimer <= 0) {
        if (typeof APU !== 'undefined' && APU.noise) APU.noise(0.03, 0.05, 900, 'bandpass');
        this.sfxSplashTimer = 0.12;
      }
    }
  },

  paintLine(x0, y0, x1, y1) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let cx = x0, cy = y0;
    while (true) {
      this.paint(cx, cy);
      if (cx === x1 && cy === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; cx += sx; }
      if (e2 < dx) { err += dx; cy += sy; }
    }
  },

  triggerExplosion(cx, cy) {
    const R = 7;
    const R2 = R * R;
    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        const d2 = dx * dx + dy * dy;
        if (d2 > R2) continue;
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || nx >= this.GW || ny < 0 || ny >= this.GH) continue;
        const idx = ny * this.GW + nx;
        const t = this.grid[idx];

        if (t === 3) {
          if (d2 <= 9 && Math.random() < 0.6) {
            this.grid[idx] = 5;
            this.life[idx] = 10 + Math.floor(Math.random() * 15);
          }
        } else if (t === 7) {
          this.grid[idx] = 5;
          this.life[idx] = 20 + Math.floor(Math.random() * 15);
        } else {
          if (d2 <= 16) {
            this.grid[idx] = 5;
            this.life[idx] = 20 + Math.floor(Math.random() * 20);
          } else if (Math.random() < 0.6) {
            this.grid[idx] = 12;
            this.life[idx] = 30 + Math.floor(Math.random() * 25);
          }
        }
      }
    }
    this.shake = 0.25;
    if (this.sfxBoomTimer <= 0) {
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('BOOM');
      this.sfxBoomTimer = 0.25;
    }
  },

  sizzle() {
    if (this.sfxSizzleTimer <= 0) {
      if (typeof APU !== 'undefined' && APU.noise) APU.noise(0.04, 0.06, 1600, 'bandpass');
      this.sfxSizzleTimer = 0.10;
    }
  },

  steamHiss() {
    if (this.sfxHissTimer <= 0) {
      if (typeof APU !== 'undefined' && APU.noise) APU.noise(0.08, 0.08, 2200, 'highpass');
      this.sfxHissTimer = 0.15;
    }
  },

  stepSimulation() {
    this.tickId = (this.tickId + 1) & 0xFF;
    if (this.tickId === 0) {
      this.updated.fill(0);
      this.tickId = 1;
    }
    const tick = this.tickId;
    const GW = this.GW, GH = this.GH;
    const grid = this.grid, life = this.life, sub = this.sub, updated = this.updated;
    const flipX = (this.frame & 1) === 1;

    // PASS 1: FALLING PARTICLES & SOLIDS & LIQUIDS (Bottom to top)
    for (let y = GH - 1; y >= 0; y--) {
      for (let xi = 0; xi < GW; xi++) {
        const x = flipX ? (GW - 1 - xi) : xi;
        const idx = y * GW + x;
        if (updated[idx] === tick) continue;
        const cell = grid[idx];
        if (cell === 0) continue;

        // 1. SAND & 7. GUNPOWDER
        if (cell === 1 || cell === 7) {
          if (cell === 7) {
            let ignited = false;
            for (let dy = -1; dy <= 1 && !ignited; dy++) {
              for (let dx = -1; dx <= 1 && !ignited; dx++) {
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < GW && ny >= 0 && ny < GH) {
                  if (grid[ny * GW + nx] === 5) ignited = true;
                }
              }
            }
            if (ignited) {
              this.triggerExplosion(x, y);
              continue;
            }
          }

          const ny = y + 1;
          if (ny < GH) {
            const bIdx = ny * GW + x;
            const b = grid[bIdx];
            if (b === 0 || b === 5 || b === 11 || b === 12) {
              grid[bIdx] = cell; grid[idx] = 0;
              updated[bIdx] = tick;
            } else if (b === 2 || b === 6 || b === 8) {
              // Sinks in liquids! Displaces liquid up
              grid[bIdx] = cell; grid[idx] = b;
              updated[bIdx] = tick; updated[idx] = tick;
            } else {
              // Diagonal slide
              const dir = Math.random() < 0.5 ? -1 : 1;
              const d1 = x + dir, d2 = x - dir;
              let moved = false;
              if (d1 >= 0 && d1 < GW) {
                const diag1 = ny * GW + d1;
                const db1 = grid[diag1];
                if (db1 === 0 || db1 === 5 || db1 === 11 || db1 === 12) {
                  grid[diag1] = cell; grid[idx] = 0;
                  updated[diag1] = tick; moved = true;
                } else if (db1 === 2 || db1 === 6 || db1 === 8) {
                  grid[diag1] = cell; grid[idx] = db1;
                  updated[diag1] = tick; updated[idx] = tick; moved = true;
                }
              }
              if (!moved && d2 >= 0 && d2 < GW) {
                const diag2 = ny * GW + d2;
                const db2 = grid[diag2];
                if (db2 === 0 || db2 === 5 || db2 === 11 || db2 === 12) {
                  grid[diag2] = cell; grid[idx] = 0;
                  updated[diag2] = tick;
                } else if (db2 === 2 || db2 === 6 || db2 === 8) {
                  grid[diag2] = cell; grid[idx] = db2;
                  updated[diag2] = tick; updated[idx] = tick;
                }
              }
            }
          }
        }
        // 2. WATER
        else if (cell === 2) {
          // Check for nearby fire
          let touchedFire = false;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < GW && ny >= 0 && ny < GH) {
                const nIdx = ny * GW + nx;
                if (grid[nIdx] === 5) {
                  grid[nIdx] = 11; life[nIdx] = 30 + Math.floor(Math.random() * 20);
                  touchedFire = true;
                }
              }
            }
          }
          if (touchedFire) {
            this.steamHiss();
            if (Math.random() < 0.4) {
              grid[idx] = 11; life[idx] = 30 + Math.floor(Math.random() * 20);
              continue;
            }
          }

          // Check for plant / wood absorption & growth
          let absorbed = false;
          for (let dy = -1; dy <= 1 && !absorbed; dy++) {
            for (let dx = -1; dx <= 1 && !absorbed; dx++) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < GW && ny >= 0 && ny < GH) {
                if (grid[ny * GW + nx] === 4 && Math.random() < 0.015) {
                  grid[idx] = 0; absorbed = true;
                  const sy = Math.max(1, ny - 1);
                  if (grid[sy * GW + nx] === 0) {
                    grid[sy * GW + nx] = 4;
                    updated[sy * GW + nx] = tick;
                  }
                }
              }
            }
          }
          if (absorbed) continue;

          // Flow down
          const ny = y + 1;
          let moved = false;
          if (ny < GH) {
            const bIdx = ny * GW + x;
            const b = grid[bIdx];
            if (b === 0 || b === 5 || b === 11 || b === 12) {
              grid[bIdx] = 2; grid[idx] = 0;
              updated[bIdx] = tick; moved = true;
            } else if (b === 6) {
              // Water sinks below Oil!
              grid[bIdx] = 2; grid[idx] = 6;
              updated[bIdx] = tick; updated[idx] = tick; moved = true;
            } else {
              // Diagonal down
              const dir = Math.random() < 0.5 ? -1 : 1;
              const d1 = x + dir, d2 = x - dir;
              if (d1 >= 0 && d1 < GW) {
                const db1 = grid[ny * GW + d1];
                if (db1 === 0 || db1 === 5 || db1 === 11 || db1 === 12) {
                  grid[ny * GW + d1] = 2; grid[idx] = 0;
                  updated[ny * GW + d1] = tick; moved = true;
                } else if (db1 === 6) {
                  grid[ny * GW + d1] = 2; grid[idx] = 6;
                  updated[ny * GW + d1] = tick; updated[idx] = tick; moved = true;
                }
              }
              if (!moved && d2 >= 0 && d2 < GW) {
                const db2 = grid[ny * GW + d2];
                if (db2 === 0 || db2 === 5 || db2 === 11 || db2 === 12) {
                  grid[ny * GW + d2] = 2; grid[idx] = 0;
                  updated[ny * GW + d2] = tick; moved = true;
                } else if (db2 === 6) {
                  grid[ny * GW + d2] = 2; grid[idx] = 6;
                  updated[ny * GW + d2] = tick; updated[idx] = tick; moved = true;
                }
              }
            }
          }
          // Horizontal dispersion
          if (!moved) {
            const dir = Math.random() < 0.5 ? -1 : 1;
            for (let step = 1; step <= 3; step++) {
              const fx = x + dir * step;
              if (fx < 0 || fx >= GW) break;
              const fIdx = y * GW + fx;
              if (grid[fIdx] === 0) {
                grid[fIdx] = 2; grid[idx] = 0;
                updated[fIdx] = tick; moved = true; break;
              } else if (grid[fIdx] === 6) {
                grid[fIdx] = 2; grid[idx] = 6;
                updated[fIdx] = tick; updated[idx] = tick; moved = true; break;
              } else break;
            }
          }
        }
        // 6. OIL
        else if (cell === 6) {
          // Flammable check
          let ignited = false;
          for (let dy = -1; dy <= 1 && !ignited; dy++) {
            for (let dx = -1; dx <= 1 && !ignited; dx++) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < GW && ny >= 0 && ny < GH) {
                if (grid[ny * GW + nx] === 5) ignited = true;
              }
            }
          }
          if (ignited) {
            grid[idx] = 5; life[idx] = 25 + Math.floor(Math.random() * 20);
            updated[idx] = tick;
            continue;
          }

          const ny = y + 1;
          let moved = false;
          if (ny < GH) {
            const bIdx = ny * GW + x;
            const b = grid[bIdx];
            if (b === 0 || b === 5 || b === 11 || b === 12) {
              grid[bIdx] = 6; grid[idx] = 0;
              updated[bIdx] = tick; moved = true;
            } else {
              const dir = Math.random() < 0.5 ? -1 : 1;
              const d1 = x + dir, d2 = x - dir;
              if (d1 >= 0 && d1 < GW && grid[ny * GW + d1] === 0) {
                grid[ny * GW + d1] = 6; grid[idx] = 0;
                updated[ny * GW + d1] = tick; moved = true;
              } else if (d2 >= 0 && d2 < GW && grid[ny * GW + d2] === 0) {
                grid[ny * GW + d2] = 6; grid[idx] = 0;
                updated[ny * GW + d2] = tick; moved = true;
              }
            }
          }
          if (!moved) {
            const dir = Math.random() < 0.5 ? -1 : 1;
            for (let step = 1; step <= 2; step++) {
              const fx = x + dir * step;
              if (fx < 0 || fx >= GW) break;
              const fIdx = y * GW + fx;
              if (grid[fIdx] === 0) {
                grid[fIdx] = 6; grid[idx] = 0;
                updated[fIdx] = tick; break;
              } else break;
            }
          }
        }
        // 8. ACID
        else if (cell === 8) {
          // Corrosion check
          let corroded = false;
          const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
          for (let [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < GW && ny >= 0 && ny < GH) {
              const nIdx = ny * GW + nx;
              const nt = grid[nIdx];
              if (nt === 1 || nt === 4 || nt === 7) {
                grid[nIdx] = 0; grid[idx] = 0;
                this.sizzle(); corroded = true; break;
              } else if (nt === 3 && Math.random() < 0.25) {
                grid[nIdx] = 0; grid[idx] = 0;
                this.sizzle(); corroded = true; break;
              } else if (nt === 2) {
                grid[nIdx] = 0; grid[idx] = 0;
                this.sizzle(); corroded = true; break;
              }
            }
          }
          if (corroded) continue;

          // Down
          const ny = y + 1;
          let moved = false;
          if (ny < GH) {
            const bIdx = ny * GW + x;
            const b = grid[bIdx];
            if (b === 0 || b === 5 || b === 11 || b === 12) {
              grid[bIdx] = 8; grid[idx] = 0;
              updated[bIdx] = tick; moved = true;
            } else if (b === 6 || b === 2) {
              // Acid sinks below Oil and Water
              grid[bIdx] = 8; grid[idx] = b;
              updated[bIdx] = tick; updated[idx] = tick; moved = true;
            } else {
              const dir = Math.random() < 0.5 ? -1 : 1;
              const d1 = x + dir, d2 = x - dir;
              if (d1 >= 0 && d1 < GW && grid[ny * GW + d1] === 0) {
                grid[ny * GW + d1] = 8; grid[idx] = 0;
                updated[ny * GW + d1] = tick; moved = true;
              } else if (d2 >= 0 && d2 < GW && grid[ny * GW + d2] === 0) {
                grid[ny * GW + d2] = 8; grid[idx] = 0;
                updated[ny * GW + d2] = tick; moved = true;
              }
            }
          }
          if (!moved) {
            const dir = Math.random() < 0.5 ? -1 : 1;
            for (let step = 1; step <= 2; step++) {
              const fx = x + dir * step;
              if (fx < 0 || fx >= GW) break;
              const fIdx = y * GW + fx;
              if (grid[fIdx] === 0) {
                grid[fIdx] = 8; grid[idx] = 0;
                updated[fIdx] = tick; break;
              } else break;
            }
          }
        }
        // 4. WOOD
        else if (cell === 4) {
          // Flammability check
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < GW && ny >= 0 && ny < GH) {
                if (grid[ny * GW + nx] === 5 && Math.random() < 0.12) {
                  grid[idx] = 5; life[idx] = 20 + Math.floor(Math.random() * 20);
                  updated[idx] = tick;
                  if (y > 0 && grid[(y - 1) * GW + x] === 0) {
                    grid[(y - 1) * GW + x] = 12;
                    life[(y - 1) * GW + x] = 30 + Math.floor(Math.random() * 25);
                  }
                  break;
                }
              }
            }
          }
        }
        // 9. SPOUT
        else if (cell === 9) {
          if (this.frame % 4 === 0) {
            const emitElem = sub[idx] || 2;
            const offsets = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            for (let [dx, dy] of offsets) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < GW && ny >= 0 && ny < GH) {
                const sIdx = ny * GW + nx;
                if (grid[sIdx] === 0) {
                  grid[sIdx] = emitElem;
                  life[sIdx] = emitElem === 5 ? (15 + Math.floor(Math.random() * 15)) : 0;
                  updated[sIdx] = tick;
                  break;
                }
              }
            }
          }
        }
      }
    }

    // PASS 2: RISING PARTICLES (FIRE, STEAM, SMOKE) (Top to bottom)
    for (let y = 0; y < GH; y++) {
      for (let xi = 0; xi < GW; xi++) {
        const x = flipX ? (GW - 1 - xi) : xi;
        const idx = y * GW + x;
        if (updated[idx] === tick) continue;
        const cell = grid[idx];

        // 5. FIRE
        if (cell === 5) {
          life[idx]--;
          if (life[idx] <= 0) {
            grid[idx] = Math.random() < 0.65 ? 12 : 0;
            life[idx] = 35 + Math.floor(Math.random() * 25);
            continue;
          }

          // Spread to flammable neighbors
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < GW && ny >= 0 && ny < GH) {
                const nIdx = ny * GW + nx;
                const nt = grid[nIdx];
                if (nt === 7) {
                  this.triggerExplosion(nx, ny);
                } else if (nt === 6) {
                  grid[nIdx] = 5; life[nIdx] = 25 + Math.floor(Math.random() * 20);
                  updated[nIdx] = tick;
                } else if (nt === 4 && Math.random() < 0.15) {
                  grid[nIdx] = 5; life[nIdx] = 20 + Math.floor(Math.random() * 20);
                  updated[nIdx] = tick;
                }
              }
            }
          }

          // Rise up
          const ny = y - 1;
          if (ny >= 0) {
            const uIdx = ny * GW + x;
            if (grid[uIdx] === 0 && Math.random() < 0.65) {
              grid[uIdx] = 5; life[uIdx] = life[idx];
              grid[idx] = 0; updated[uIdx] = tick;
            } else {
              const dir = Math.random() < 0.5 ? -1 : 1;
              const d = x + dir;
              if (d >= 0 && d < GW && grid[ny * GW + d] === 0 && Math.random() < 0.4) {
                grid[ny * GW + d] = 5; life[ny * GW + d] = life[idx];
                grid[idx] = 0; updated[ny * GW + d] = tick;
              }
            }
          }
        }
        // 11. STEAM
        else if (cell === 11) {
          life[idx]--;
          if (life[idx] <= 0) {
            grid[idx] = 0; continue;
          }
          if (y > 0 && grid[(y - 1) * GW + x] === 3 && Math.random() < 0.05) {
            grid[idx] = 2; continue;
          }
          const ny = y - 1;
          if (ny >= 0 && grid[ny * GW + x] === 0) {
            grid[ny * GW + x] = 11; life[ny * GW + x] = life[idx];
            grid[idx] = 0; updated[ny * GW + x] = tick;
          } else {
            const dir = Math.random() < 0.5 ? -1 : 1;
            const d = x + dir;
            if (d >= 0 && d < GW && ny >= 0 && grid[ny * GW + d] === 0) {
              grid[ny * GW + d] = 11; life[ny * GW + d] = life[idx];
              grid[idx] = 0; updated[ny * GW + d] = tick;
            } else if (d >= 0 && d < GW && grid[y * GW + d] === 0) {
              grid[y * GW + d] = 11; life[y * GW + d] = life[idx];
              grid[idx] = 0; updated[y * GW + d] = tick;
            }
          }
        }
        // 12. SMOKE
        else if (cell === 12) {
          life[idx]--;
          if (life[idx] <= 0) {
            grid[idx] = 0; continue;
          }
          const ny = y - 1;
          if (ny >= 0 && grid[ny * GW + x] === 0 && Math.random() < 0.7) {
            grid[ny * GW + x] = 12; life[ny * GW + x] = life[idx];
            grid[idx] = 0; updated[ny * GW + x] = tick;
          } else {
            const dir = Math.random() < 0.5 ? -1 : 1;
            const d = x + dir;
            if (d >= 0 && d < GW && ny >= 0 && grid[ny * GW + d] === 0) {
              grid[ny * GW + d] = 12; life[ny * GW + d] = life[idx];
              grid[idx] = 0; updated[ny * GW + d] = tick;
            }
          }
        }
      }
    }
  },

  update(dt) {
    this.simAcc += dt;
    if (this.simAcc > 0.15) this.simAcc = 0.15;
    const stepDt = 1 / 60;
    let stepCount = 0;
    while (this.simAcc >= stepDt && stepCount < 3) {
      this.stepSimulation();
      this.simAcc -= stepDt;
      stepCount++;
    }

    this.time += dt;
    this.frame++;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt);
    if (this.sfxRustleTimer > 0) this.sfxRustleTimer -= dt;
    if (this.sfxSplashTimer > 0) this.sfxSplashTimer -= dt;
    if (this.sfxHissTimer > 0) this.sfxHissTimer -= dt;
    if (this.sfxSizzleTimer > 0) this.sfxSizzleTimer -= dt;
    if (this.sfxBoomTimer > 0) this.sfxBoomTimer -= dt;

    let moveX = 0, moveY = 0;
    if (PAD.state.left) moveX -= 1;
    if (PAD.state.right) moveX += 1;
    if (PAD.state.up) moveY -= 1;
    if (PAD.state.down) moveY += 1;
    if (moveX !== 0 || moveY !== 0) {
      this.cursorSpeed = Math.min(50, this.cursorSpeed + dt * 50);
    } else {
      this.cursorSpeed = 20;
    }
    this.fx += moveX * this.cursorSpeed * dt;
    this.fy += moveY * this.cursorSpeed * dt;
    this.fx = Math.max(0, Math.min(this.GW - 1, this.fx));
    this.fy = Math.max(0, Math.min(this.GH - 1, this.fy));
    this.cx = Math.round(this.fx);
    this.cy = Math.round(this.fy);

    if (PAD.state.a) {
      this.paint(this.cx, this.cy);
    }
    if (PAD.hit('b')) {
      this.cycleMaterial();
    }
    if (PAD.hit('select')) {
      this.brushIdx = (this.brushIdx + 1) % 3;
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
    }
    if (PAD.state.select) {
      this.selectHoldTimer += dt;
      if (this.selectHoldTimer > 0.75 && !this.clearedThisHold) {
        this.clearCanvas();
        this.clearedThisHold = true;
      }
    } else {
      this.selectHoldTimer = 0;
      this.clearedThisHold = false;
    }

    if (PAD.pointer && PAD.pointer.down) {
      const px = PAD.pointer.x, py = PAD.pointer.y;
      if (py >= this.OY && py < this.OY + this.GH * this.SZ && px >= this.OX && px < this.OX + this.GW * this.SZ) {
        const gx = Math.max(0, Math.min(this.GW - 1, Math.floor((px - this.OX) / this.SZ)));
        const gy = Math.max(0, Math.min(this.GH - 1, Math.floor((py - this.OY) / this.SZ)));
        this.cx = gx; this.cy = gy; this.fx = gx; this.fy = gy;
        if (this.lastDragX !== null) {
          this.paintLine(this.lastDragX, this.lastDragY, gx, gy);
        } else {
          this.paint(gx, gy);
        }
        this.lastDragX = gx; this.lastDragY = gy;
      } else if (!this.lastPointerDown) {
        if (py >= 206 && py <= 220 && px >= 8 && px < 248) {
          const chipIdx = Math.floor((px - 8) / 24);
          if (chipIdx >= 0 && chipIdx < 10) {
            this.selectTool(chipIdx);
          }
        } else if (py >= 223 && py <= 238) {
          if (px >= 8 && px < 56) {
            this.brushIdx = (this.brushIdx + 1) % 3;
            if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
          } else if (px >= 58 && px < 164) {
            this.loadPreset((this.presetIdx + 1) % 5);
          } else if (px >= 168 && px < 210) {
            this.clearCanvas();
          }
        }
      }
    } else {
      this.lastDragX = null;
      this.lastDragY = null;
    }
    this.lastPointerDown = !!(PAD.pointer && PAD.pointer.down);

    if (PAD.tapPos) {
      const tx = PAD.tapPos.x, ty = PAD.tapPos.y;
      if (ty >= 206 && ty <= 220 && tx >= 8 && tx < 248) {
        const chipIdx = Math.floor((tx - 8) / 24);
        if (chipIdx >= 0 && chipIdx < 10) this.selectTool(chipIdx);
      } else if (ty >= 223 && ty <= 238) {
        if (tx >= 8 && tx < 56) {
          this.brushIdx = (this.brushIdx + 1) % 3;
          if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
        } else if (tx >= 58 && tx < 164) {
          this.loadPreset((this.presetIdx + 1) % 5);
        } else if (tx >= 168 && tx < 210) {
          this.clearCanvas();
        }
      }
      PAD.tapPos = null;
    }

    this.updateParticleCount();
  },

  updateParticleCount() {
    let count = 0;
    const len = this.grid.length;
    for (let i = 0; i < len; i++) {
      const e = this.grid[i];
      if (e !== 0 && e !== 3) count++;
    }
    this.particleCount = count;
    if (this.particleCount > this.score) {
      this.score = this.particleCount;
      if (typeof SAVE !== 'undefined' && SAVE.setScore) {
        SAVE.setScore(this.id, this.score);
      }
    }
  },

  render(g) {
    g.clear(0);

    let shakeX = 0, shakeY = 0;
    if (this.shake > 0) {
      shakeX = Math.round((Math.random() - 0.5) * 4);
      shakeY = Math.round((Math.random() - 0.5) * 4);
    }
    const ox = this.OX + shakeX;
    const oy = this.OY + shakeY;
    const sz = this.SZ;

    // Simulation viewport border
    g.box(ox - 1, oy - 1, this.GW * sz + 2, this.GH * sz + 2, 2);

    // Top HUD
    g.text("FALLING SAND", 8, 3, 3);
    g.text("P" + this.presetIdx + ":" + this.presetNames[this.presetIdx], 92, 3, 2);
    g.text("PARTS:" + this.particleCount, 192, 3, 3);

    const toolNames = ["", "SAND", "WATER", "STONE", "WOOD", "FIRE", "OIL", "GUNPOWDER", "ACID", "SPOUT", "ERASER"];
    g.text("TOOL:" + (toolNames[this.elem] || "SAND"), 8, 11, 3);
    g.text("BRUSH:" + this.brushSizes[this.brushIdx] + "PX", 96, 11, 2);
    const speedMult = (typeof VOS !== 'undefined' && VOS.getSpeedMultiplier) ? VOS.getSpeedMultiplier().toFixed(2) + "X" : "1.00X";
    g.text(speedMult, 216, 11, 2);

    // Simulation Grid rendering
    const GW = this.GW, GH = this.GH;
    const grid = this.grid;
    const tSec = this.time;
    const frame = this.frame;

    for (let y = 0; y < GH; y++) {
      const rowOffset = y * GW;
      const py = oy + y * sz;
      for (let x = 0; x < GW; x++) {
        const val = grid[rowOffset + x];
        if (val === 0) continue;
        const px = ox + x * sz;

        switch (val) {
          case 1: // SAND (speckled granular texture)
            {
              const grain = ((x * 7 + y * 13) & 3);
              g.rect(px, py, sz, sz, grain === 0 ? 2 : 3);
            }
            break;
          case 2: // WATER (wave shimmer)
            {
              const wave = (x + ((tSec * 6) | 0) + ((y & 1) * 2)) % 5;
              g.rect(px, py, sz, sz, wave === 0 ? 3 : 2);
            }
            break;
          case 3: // STONE (brick mortar texture)
            {
              const mort = (x % 4 === 0 || (y % 3 === 0 && ((x >> 2) & 1) === 0));
              g.rect(px, py, sz, sz, mort ? 1 : 2);
            }
            break;
          case 4: // WOOD (vertical grain)
            {
              const grain = (x % 3 === 0);
              g.rect(px, py, sz, sz, grain ? 1 : 2);
            }
            break;
          case 5: // FIRE (flickering flame)
            {
              const flick = Math.random();
              const c = flick < 0.45 ? 3 : (flick < 0.8 ? 2 : 1);
              g.rect(px, py, sz, sz, c);
            }
            break;
          case 6: // OIL (viscous dark sheen)
            {
              const sheen = ((x + y + (frame >> 2)) % 7 === 0);
              g.rect(px, py, sz, sz, sheen ? 2 : 1);
            }
            break;
          case 7: // GUNPOWDER (metallic powder)
            {
              const spec = ((x * 5 + y * 3) & 3) === 0;
              g.rect(px, py, sz, sz, spec ? 2 : 1);
            }
            break;
          case 8: // ACID (bubbling neon)
            {
              const bub = Math.random() < 0.18;
              g.rect(px, py, sz, sz, bub ? 3 : 2);
            }
            break;
          case 9: // SPOUT (generator nozzle)
            {
              g.rect(px, py, sz, sz, 2);
              g.px(px + 1, py + 1, (frame & 8) ? 3 : 1);
            }
            break;
          case 11: // STEAM (wispy gas)
            {
              if (((x + y) & 1) === 0) {
                g.rect(px, py, sz - 1, sz - 1, (frame & 4) ? 2 : 1);
              }
            }
            break;
          case 12: // SMOKE (dark billow)
            {
              if (((x ^ y) & 1) === 0) {
                g.px(px + 1, py + 1, 1);
              }
            }
            break;
        }
      }
    }

    // Reticle / Cursor
    const curX = ox + this.cx * sz;
    const curY = oy + this.cy * sz;
    const r = this.brushIdx === 0 ? 1 : (this.brushIdx === 1 ? 4 : 7);
    const pulse = (frame & 8) ? 3 : 2;
    g.box(curX - r + 1, curY - r + 1, r * 2 + 1, r * 2 + 1, pulse);
    g.px(curX + 1, curY + 1, 3);

    // Bottom Toolbar (Row 1: Material Chips, Y = 206 to 220)
    const toolIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const toolLabels = ["SND", "WTR", "STN", "WOD", "FIR", "OIL", "POW", "ACD", "SPT", "ERS"];
    for (let i = 0; i < 10; i++) {
      const cx = 8 + i * 24;
      const isSel = (this.elem === toolIds[i]);
      g.box(cx, 206, 23, 14, isSel ? 3 : 1);
      if (isSel) {
        g.rect(cx + 1, 207, 21, 12, 1);
        g.text(toolLabels[i], cx + 4, 210, 3);
      } else {
        g.text(toolLabels[i], cx + 4, 210, 2);
      }
    }

    // Bottom Toolbar (Row 2: Quick Action Buttons, Y = 223 to 237)
    // 1. Brush Size Button
    g.box(8, 223, 46, 14, 2);
    g.text("SZ:" + this.brushSizes[this.brushIdx] + "P", 12, 227, 3);

    // 2. Preset Button
    g.box(58, 223, 106, 14, 2);
    g.text("P" + this.presetIdx + ":" + this.presetNames[this.presetIdx], 62, 227, 3);

    // 3. Clear Button
    g.box(168, 223, 38, 14, 1);
    g.text("CLR", 177, 227, 2);

    // 4. High Score Button
    g.box(210, 223, 38, 14, 1);
    const hiStr = this.score > 9999 ? (this.score / 1000).toFixed(1) + "K" : String(this.score);
    g.text("HI:" + hiStr, 212, 227, 2);
  },

  save() {
    const runs = [];
    let cur = this.grid[0];
    let count = 1;
    const len = this.grid.length;
    for (let i = 1; i < len; i++) {
      if (this.grid[i] === cur && count < 255) {
        count++;
      } else {
        runs.push(cur, count);
        cur = this.grid[i];
        count = 1;
      }
    }
    runs.push(cur, count);
    return { p: this.presetIdx, r: runs, b: this.brushIdx, e: this.elem, s: this.score };
  },

  load(per) {
    if (!per) return;
    if (per.p !== undefined) this.presetIdx = per.p;
    if (per.b !== undefined) this.brushIdx = per.b;
    if (per.e !== undefined) this.elem = per.e;
    if (per.s !== undefined) this.score = per.s;

    if (per.r && Array.isArray(per.r)) {
      let idx = 0;
      for (let i = 0; i < per.r.length; i += 2) {
        const val = per.r[i];
        const count = per.r[i + 1];
        for (let k = 0; k < count && idx < this.grid.length; k++) {
          this.grid[idx++] = val;
        }
      }
    }
  }
};
