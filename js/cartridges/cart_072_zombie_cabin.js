// js/cartridges/cart_072_zombie_cabin.js
// ============================================================================
// Cartridge #072: ZOMBIE CABIN
// Genre: Stealth & Defense (7) | 4-Window Cabin Barricade Siege
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[72] = {
  id: 72,
  name: "ZOMBIE CABIN",
  genre: 7,
  scoreLabel: "WAVES",
  desc: "CABIN SIEGE: DEFEND 4 WINDOWS! [A] HAMMER BOARDS, [B] SHOTGUN BLAST INCOMING HORDES!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Barricaded wooden window with zombie hands reaching through planks
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Cabin log window frame
    g.box(x + 5, y + 5, 22, 22, 2);
    g.box(x + 7, y + 7, 18, 18, 1);

    // Wooden Barricade Planks nailed horizontally
    g.rect(x + 4, y + 9, 24, 3, 3);
    g.rect(x + 4, y + 15, 24, 3, 2);
    g.rect(x + 4, y + 21, 24, 3, 3);

    // Nails
    g.px(x + 6, y + 10, 0);
    g.px(x + 25, y + 10, 0);
    g.px(x + 6, y + 22, 0);
    g.px(x + 25, y + 22, 0);

    // Zombie decaying claw reaching through middle gap
    g.line(x + 13, y + 12, x + 13, y + 18, 3);
    g.line(x + 16, y + 11, x + 16, y + 17, 3);
    g.line(x + 19, y + 13, x + 19, y + 18, 3);
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.wave = 1;
    this.maxWaves = 10;
    this.kills = 0;
    this.state = 'FIGHT'; // 'FIGHT', 'WAVE_CLEAR', 'GAMEOVER'
    this.waveTimer = 0;

    // Player Survivor in Cabin Center
    this.player = {
      x: 128,
      y: 125,
      hp: 100,
      maxHp: 100,
      ammo: 6,
      maxAmmo: 6,
      boardsInPack: 12,
      facing: 'N', // 'N', 'S', 'E', 'W'
      shootCooldown: 0
    };

    // Cabin Walls & 4 Windows (North, South, East, West)
    this.cabin = {
      x0: 64, x1: 192,
      y0: 60, y1: 190
    };

    this.windows = {
      N: { x: 128, y: 60, boards: 5, maxBoards: 5, width: 34, isHoriz: true },
      S: { x: 128, y: 190, boards: 5, maxBoards: 5, width: 34, isHoriz: true },
      W: { x: 64, y: 125, boards: 5, maxBoards: 5, width: 34, isHoriz: false },
      E: { x: 192, y: 125, boards: 5, maxBoards: 5, width: 34, isHoriz: false }
    };

    // Zombies array
    this.zombies = [];
    this.spawnWave(this.wave);

    // Muzzle flashes & debris particles
    this.particles = [];
  },

  spawnWave(w) {
    this.zombies = [];
    const count = 6 + w * 4;
    const dirs = ['N', 'S', 'E', 'W'];

    for (let i = 0; i < count; i++) {
      const targetWinKey = dirs[i % 4];
      const win = this.windows[targetWinKey];

      // Spawn outside cabin perimeter
      let sx = 128, sy = 125;
      if (targetWinKey === 'N') { sx = win.x + (Math.random() - 0.5) * 40; sy = 28 - Math.random() * 50; }
      else if (targetWinKey === 'S') { sx = win.x + (Math.random() - 0.5) * 40; sy = 225 + Math.random() * 50; }
      else if (targetWinKey === 'W') { sx = 10 - Math.random() * 50; sy = win.y + (Math.random() - 0.5) * 40; }
      else { sx = 245 + Math.random() * 50; sy = win.y + (Math.random() - 0.5) * 40; }

      this.zombies.push({
        x: sx,
        y: sy,
        targetWindow: targetWinKey,
        hp: 20 + w * 4,
        speed: 18 + Math.random() * 14 + w * 2,
        attackTimer: 0,
        breached: false
      });
    }
  },

  // --------------------------------------------------------------------------
  // 3. MAIN GAMEPLAY UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    if (dt > 0.05) dt = 0.05;

    // Handle Game Over restart
    if (this.state === 'GAMEOVER') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || TOUCH.down) {
        this.init();
      }
      return;
    }

    // Wave Clear transition pause
    if (this.state === 'WAVE_CLEAR') {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) {
        this.wave++;
        this.player.boardsInPack += 10;
        this.player.ammo = this.player.maxAmmo;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30);
        this.spawnWave(this.wave);
        this.state = 'FIGHT';
      }
      return;
    }

    const p = this.player;
    if (p.shootCooldown > 0) p.shootCooldown -= dt;

    // 1. PLAYER MOVEMENT & ORIENTATION
    let mx = 0, my = 0;
    if (PAD.state.left) { mx -= 1; p.facing = 'W'; }
    if (PAD.state.right) { mx += 1; p.facing = 'E'; }
    if (PAD.state.up) { my -= 1; p.facing = 'N'; }
    if (PAD.state.down) { my += 1; p.facing = 'S'; }

    if (mx !== 0 || my !== 0) {
      const len = Math.hypot(mx, my);
      p.x += (mx / len) * 85 * dt;
      p.y += (my / len) * 85 * dt;
    }

    // Clamp player inside cabin floor
    p.x = Math.max(this.cabin.x0 + 12, Math.min(this.cabin.x1 - 12, p.x));
    p.y = Math.max(this.cabin.y0 + 12, Math.min(this.cabin.y1 - 12, p.y));

    // 2. REPAIR BARRICADE [A]
    if (PAD.hit('a')) {
      const nearWin = this.getNearestWindow(p.x, p.y);
      if (nearWin && nearWin.dist < 26) {
        const w = nearWin.window;
        if (w.boards < w.maxBoards && p.boardsInPack > 0) {
          w.boards++;
          p.boardsInPack--;
          APU.sfx('HIT');
        }
      }
    }

    // 3. SHOTGUN BLAST [B]
    if (PAD.hit('b')) {
      if (p.ammo > 0 && p.shootCooldown <= 0) {
        p.ammo--;
        p.shootCooldown = 0.35;
        APU.sfx('BOOM');
        this.fireShotgunSpread();
      } else if (p.ammo <= 0) {
        // Reload shotgun
        p.ammo = p.maxAmmo;
        p.shootCooldown = 0.65;
        APU.sfx('CONFIRM');
      }
    }

    // 4. ZOMBIE SWARM BEHAVIOR
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];
      const win = this.windows[z.targetWindow];

      if (!z.breached) {
        // Move towards assigned window
        const zdx = win.x - z.x;
        const zdy = win.y - z.y;
        const distToWin = Math.hypot(zdx, zdy);

        if (distToWin > 8) {
          z.x += (zdx / distToWin) * z.speed * dt;
          z.y += (zdy / distToWin) * z.speed * dt;
        } else {
          // Attacking window barricade planks!
          z.attackTimer += dt;
          if (z.attackTimer >= 1.2) {
            z.attackTimer = 0;
            if (win.boards > 0) {
              win.boards--;
              APU.sfx('TICK');
            } else {
              // Barricade destroyed! Zombie breaches inside cabin!
              z.breached = true;
              APU.sfx('ALARM');
            }
          }
        }
      } else {
        // Breached zombie pursues player!
        const pdx = p.x - z.x;
        const pdy = p.y - z.y;
        const pdist = Math.hypot(pdx, pdy);

        if (pdist > 10) {
          z.x += (pdx / pdist) * (z.speed * 1.2) * dt;
          z.y += (pdy / pdist) * (z.speed * 1.2) * dt;
        } else {
          // Attacking player!
          p.hp -= 25 * dt;
          if (p.hp <= 0) {
            this.state = 'GAMEOVER';
            APU.sfx('ERROR');
            SAVE.setScore(this.id, this.wave);
            return;
          }
        }
      }
    }

    // Check if Wave Cleared
    if (this.zombies.length === 0 && this.state === 'FIGHT') {
      this.state = 'WAVE_CLEAR';
      this.waveTimer = 2.4;
      APU.sfx('FANFARE');
    }
  },

  getNearestWindow(px, py) {
    let closest = null;
    let minDist = 999;
    for (let k in this.windows) {
      const w = this.windows[k];
      const d = Math.hypot(w.x - px, w.y - py);
      if (d < minDist) {
        minDist = d;
        closest = { key: k, window: w, dist: d };
      }
    }
    return closest;
  },

  fireShotgunSpread() {
    const p = this.player;
    const dirVectors = {
      N: { x: 0, y: -1 },
      S: { x: 0, y: 1 },
      W: { x: -1, y: 0 },
      E: { x: 1, y: 0 }
    };
    const fv = dirVectors[p.facing];

    // Check zombie hits in cone
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];
      const zdx = z.x - p.x;
      const zdy = z.y - p.y;
      const dist = Math.hypot(zdx, zdy);

      if (dist < 95) {
        const dot = (zdx * fv.x + zdy * fv.y) / dist;
        if (dot > 0.65) {
          // Shotgun hit!
          z.hp -= 35;
          // Knockback
          z.x += fv.x * 12;
          z.y += fv.y * 12;

          if (z.hp <= 0) {
            this.zombies.splice(i, 1);
            this.kills++;
            APU.sfx('HIT');
          }
        }
      }
    }
  },

  // --------------------------------------------------------------------------
  // 4. 256x240 CRT RENDERING
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    const cb = this.cabin;

    // 1. Dark Foggy Forest (Exterior)
    for (let i = 0; i < 6; i++) {
      g.disc(25 + i * 40, 20, 10, 1);
      g.disc(25 + i * 40, 230, 10, 1);
    }

    // 2. Cabin Structure
    // Floor
    g.rect(cb.x0, cb.y0, cb.x1 - cb.x0, cb.y1 - cb.y0, 1);
    // Log Walls
    g.box(cb.x0, cb.y0, cb.x1 - cb.x0, cb.y1 - cb.y0, 2);
    g.box(cb.x0 - 2, cb.y0 - 2, (cb.x1 - cb.x0) + 4, (cb.y1 - cb.y0) + 4, 3);

    // 3. Render 4 Windows & Barricade Planks
    for (let k in this.windows) {
      const w = this.windows[k];
      if (w.isHoriz) {
        // Window opening in wall
        g.rect(w.x - Math.floor(w.width / 2), w.y - 3, w.width, 6, 0);
        // Planks nailed across
        for (let b = 0; b < w.boards; b++) {
          const py = w.y - 2 + b;
          g.line(w.x - Math.floor(w.width / 2), py, w.x + Math.floor(w.width / 2), py, 3);
        }
      } else {
        // Vertical window opening
        g.rect(w.x - 3, w.y - Math.floor(w.width / 2), 6, w.width, 0);
        for (let b = 0; b < w.boards; b++) {
          const px = w.x - 2 + b;
          g.line(px, w.y - Math.floor(w.width / 2), px, w.y + Math.floor(w.width / 2), 3);
        }
      }

      // Board count indicator
      g.text(w.boards + "/5", w.x - 6, w.y - 3, w.boards > 0 ? 3 : 1);
    }

    // 4. Render Zombies
    for (let z of this.zombies) {
      const zx = Math.floor(z.x);
      const zy = Math.floor(z.y);
      g.disc(zx, zy, 4, 2);
      g.px(zx, zy, 0); // rotting eyes
    }

    // 5. Player Survivor
    const px = Math.floor(this.player.x);
    const py = Math.floor(this.player.y);
    g.disc(px, py, 5, 3);

    // Shotgun Barrel pointing in facing direction
    const barrelOffsets = { N: { x: 0, y: -9 }, S: { x: 0, y: 9 }, W: { x: -9, y: 0 }, E: { x: 9, y: 0 } };
    const bOff = barrelOffsets[this.player.facing];
    g.line(px, py, px + bOff.x, py + bOff.y, 3);

    // 6. Top HUD
    g.rect(0, 0, 256, 26, 0);
    g.line(0, 26, 256, 26, 2);

    g.text("WAVE: " + this.wave, 10, 8, 3);
    g.text("HP: " + Math.max(0, Math.floor(this.player.hp)), 80, 8, this.player.hp < 30 ? 3 : 2);
    g.text("SHELLS: " + this.player.ammo + "/" + this.player.maxAmmo, 140, 8, 3);
    g.textR("WOOD: " + this.player.boardsInPack, 246, 8, 2);

    // 7. Bottom Controls Prompt
    g.rect(0, 214, 256, 26, 0);
    g.line(0, 214, 256, 214, 2);
    g.textC("[A]: REPAIR WINDOW PLANK    [B]: SHOTGUN BLAST", 222, 2);

    // 8. Wave Clear Overlay
    if (this.state === 'WAVE_CLEAR') {
      g.dither(30, 85, 196, 46, 0, 1);
      g.box(30, 85, 196, 46, 3);
      g.textC("★ WAVE " + this.wave + " CLEARED! ★", 98, 3);
      g.textC("+10 BOARDS  |  AMMO RESTOCKED", 114, 2);
    }

    // 9. Game Over Overlay
    if (this.state === 'GAMEOVER') {
      g.dither(30, 75, 196, 65, 0, 1);
      g.box(30, 75, 196, 65, 3);
      g.textC("CABIN BREACHED & OVERRUN!", 90, 3);
      g.textC("SURVIVED " + this.wave + " WAVES  (" + this.kills + " KILLS)", 106, 2);
      g.textC("[A] DEFEND CABIN AGAIN", 124, 3);
    }
  }
};
