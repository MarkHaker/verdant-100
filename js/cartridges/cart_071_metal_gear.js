// js/cartridges/cart_071_metal_gear.js
// ============================================================================
// Cartridge #071: METAL GEAR
// Genre: Stealth & Defense (7) | Top-Down Tactical Espionage Action
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[71] = {
  id: 71,
  name: "METAL GEAR",
  genre: 7,
  scoreLabel: "RANK",
  desc: "TACTICAL STEALTH: SNEAK PAST PATROL CONES, USE CARDBOARD BOX [B], HACK TERMINALS!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Infiltrator in bandana with silenced pistol, guard with vision cone
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Wall structure
    g.rect(x + 14, y + 4, 4, 18, 1);

    // Guard with Vision Cone (Top Right)
    g.disc(x + 22, y + 8, 3, 2);
    g.tri(x + 22, y + 8, x + 30, y + 2, x + 30, y + 14, 1);

    // Solid Snake Silhouette (Bottom Left)
    g.disc(x + 8, y + 21, 3, 3); // head
    g.line(x + 5, y + 19, x + 7, y + 19, 3); // bandana tail
    g.rect(x + 6, y + 24, 5, 6, 3); // body
    // Silenced pistol pointed forward
    g.line(x + 11, y + 23, x + 15, y + 23, 3);

    // Cardboard Box icon (Bottom Right)
    g.rect(x + 20, y + 22, 9, 8, 2);
    g.box(x + 20, y + 22, 9, 8, 3);
    g.line(x + 22, y + 25, x + 27, y + 25, 0);
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.state = 'SNEAK'; // 'SNEAK', 'ALERT', 'HACKING', 'GAMEOVER', 'CLEAR'
    this.alertTimer = 0;
    this.rankScore = 1000;
    this.discoveredCount = 0;

    // Player (Solid Snake)
    this.player = {
      x: 32,
      y: 205,
      dir: 0, // 0: up, 1: right, 2: down, 3: left
      inBox: false,
      hasKeycard: false,
      ammo: 5,
      hp: 100,
      maxHp: 100
    };

    // Level Layout Walls (Solid blocks)
    this.walls = [
      { x: 0, y: 26, w: 256, h: 6 }, // Top border
      { x: 0, y: 218, w: 256, h: 6 }, // Bottom border
      { x: 0, y: 26, w: 6, h: 198 }, // Left border
      { x: 250, y: 26, w: 6, h: 198 }, // Right border

      // Compound Interior Rooms & Corridors
      { x: 55, y: 32, w: 6, h: 110 },
      { x: 55, y: 175, w: 6, h: 45 },
      { x: 61, y: 100, w: 85, h: 6 },
      { x: 140, y: 32, w: 6, h: 74 },
      { x: 110, y: 145, w: 90, h: 6 },
      { x: 194, y: 80, w: 6, h: 105 },
      { x: 145, y: 185, w: 6, h: 35 }
    ];

    // Patrolling Guards (3 Sentries)
    this.guards = [
      { x: 95, y: 65, dir: 1, p0: 70, p1: 125, axis: 'x', speed: 45, state: 'PATROL', coneLen: 55, coneAngle: 0.55 },
      { x: 80, y: 175, dir: 1, p0: 70, p1: 135, axis: 'x', speed: 40, state: 'PATROL', coneLen: 50, coneAngle: 0.55 },
      { x: 220, y: 140, dir: -1, p0: 100, p1: 180, axis: 'y', speed: 42, state: 'PATROL', coneLen: 50, coneAngle: 0.55 }
    ];

    // Mission Objectives & Items
    this.keycard = { x: 170, y: 55, collected: false };
    this.terminal = { x: 226, y: 48, hacked: false };
    this.exitHelipad = { x: 28, y: 50 };

    // Cardboard Boxes placed around map for disguise
    this.crateLoot = { x: 125, y: 120, collected: false };

    // Bullets fired by player/guards
    this.bullets = [];
  },

  // --------------------------------------------------------------------------
  // 3. MAIN GAMEPLAY UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    if (dt > 0.05) dt = 0.05;

    // Handle Game Over / Clear restart
    if (this.state === 'GAMEOVER' || this.state === 'CLEAR') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || TOUCH.down) {
        this.init();
      }
      return;
    }

    const p = this.player;

    // Alert siren countdown
    if (this.state === 'ALERT') {
      this.alertTimer -= dt;
      if (this.alertTimer <= 0) {
        this.state = 'SNEAK';
        for (let g of this.guards) g.state = 'PATROL';
      }
    }

    // 1. CARDBOARD BOX TOGGLE [B]
    if (PAD.hit('b')) {
      p.inBox = !p.inBox;
      APU.sfx(p.inBox ? 'CONFIRM' : 'SELECT');
    }

    // 2. PLAYER MOVEMENT
    let dx = 0;
    let dy = 0;
    const moveSpeed = p.inBox ? 40 : 85;

    if (PAD.state.left) { dx -= 1; p.dir = 3; }
    if (PAD.state.right) { dx += 1; p.dir = 1; }
    if (PAD.state.up) { dy -= 1; p.dir = 0; }
    if (PAD.state.down) { dy += 1; p.dir = 2; }

    const isMoving = (dx !== 0 || dy !== 0);
    if (isMoving) {
      const len = Math.hypot(dx, dy);
      const newX = p.x + (dx / len) * moveSpeed * dt;
      const newY = p.y + (dy / len) * moveSpeed * dt;

      // Wall collisions
      if (!this.checkWallCollision(newX, p.y, 5)) p.x = newX;
      if (!this.checkWallCollision(p.x, newY, 5)) p.y = newY;
    }

    // 3. SILENCED TRANQ PISTOL [A]
    if (PAD.hit('a')) {
      if (!p.inBox && p.ammo > 0) {
        p.ammo--;
        const dirs = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];
        const d = dirs[p.dir];
        this.bullets.push({
          x: p.x + d.x * 8,
          y: p.y + d.y * 8,
          vx: d.x * 220,
          vy: d.y * 220,
          isPlayer: true
        });
        APU.sfx('TICK');
      }
    }

    // Update Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Check wall hit
      if (this.checkWallCollision(b.x, b.y, 2)) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Check guard hit by player bullet
      if (b.isPlayer) {
        for (let g of this.guards) {
          if (g.state !== 'ASLEEP' && Math.hypot(b.x - g.x, b.y - g.y) < 9) {
            g.state = 'ASLEEP';
            g.sleepTimer = 6.0;
            this.bullets.splice(i, 1);
            APU.sfx('HIT');
            break;
          }
        }
      } else {
        // Guard bullet hits player
        if (Math.hypot(b.x - p.x, b.y - p.y) < 7) {
          p.hp -= 20;
          this.bullets.splice(i, 1);
          APU.sfx('BOOM');
          if (p.hp <= 0) {
            this.state = 'GAMEOVER';
            APU.sfx('ERROR');
            SAVE.setScore(this.id, 0);
            return;
          }
        }
      }
    }

    // 4. GUARD PATROL & SIGHT CONE AI
    for (let g of this.guards) {
      if (g.state === 'ASLEEP') {
        g.sleepTimer -= dt;
        if (g.sleepTimer <= 0) g.state = 'PATROL';
        continue;
      }

      // Patrol movement along axis
      if (g.state === 'PATROL') {
        if (g.axis === 'x') {
          g.x += g.dir * g.speed * dt;
          if (g.x > g.p1) { g.x = g.p1; g.dir = -1; }
          else if (g.x < g.p0) { g.x = g.p0; g.dir = 1; }
        } else {
          g.y += g.dir * g.speed * dt;
          if (g.y > g.p1) { g.y = g.p1; g.dir = -1; }
          else if (g.y < g.p0) { g.y = g.p0; g.dir = 1; }
        }
      } else if (g.state === 'ALERT') {
        // Pursue player and shoot
        const gdx = p.x - g.x;
        const gdy = p.y - g.y;
        const gdist = Math.hypot(gdx, gdy);
        if (gdist > 15) {
          g.x += (gdx / gdist) * (g.speed * 1.3) * dt;
          g.y += (gdy / gdist) * (g.speed * 1.3) * dt;
        }

        // Fire burst occasionally
        if (Math.random() < 0.03 && gdist < 120) {
          this.bullets.push({
            x: g.x,
            y: g.y,
            vx: (gdx / gdist) * 160,
            vy: (gdy / gdist) * 160,
            isPlayer: false
          });
          APU.sfx('TICK');
        }
      }

      // Check Vision Cone Detection
      this.checkGuardSight(g, p, isMoving);
    }

    // 5. OBJECTIVES & PICKUPS
    // Collect Keycard
    if (!this.keycard.collected && Math.hypot(p.x - this.keycard.x, p.y - this.keycard.y) < 10) {
      this.keycard.collected = true;
      p.hasKeycard = true;
      APU.sfx('COIN');
    }

    // Collect Ammo Crate
    if (!this.crateLoot.collected && Math.hypot(p.x - this.crateLoot.x, p.y - this.crateLoot.y) < 10) {
      this.crateLoot.collected = true;
      p.ammo += 5;
      APU.sfx('CONFIRM');
    }

    // Hack Masterframe Terminal (Requires Keycard)
    if (!this.terminal.hacked && p.hasKeycard && Math.hypot(p.x - this.terminal.x, p.y - this.terminal.y) < 12) {
      this.terminal.hacked = true;
      APU.sfx('FANFARE');
    }

    // Exfiltrate to Helipad
    if (this.terminal.hacked && Math.hypot(p.x - this.exitHelipad.x, p.y - this.exitHelipad.y) < 14) {
      this.state = 'CLEAR';
      APU.sfx('POWERUP');
      const finalRank = Math.max(100, 2000 - this.discoveredCount * 300);
      SAVE.setScore(this.id, finalRank);
    }
  },

  checkGuardSight(g, p, isMoving) {
    // If player is inside cardboard box and NOT moving, guards completely ignore it!
    if (p.inBox && !isMoving) return;

    // Guard facing angle
    let gAngle = 0;
    if (g.axis === 'x') gAngle = g.dir === 1 ? 0 : Math.PI;
    else gAngle = g.dir === 1 ? Math.PI / 2 : -Math.PI / 2;

    const dx = p.x - g.x;
    const dy = p.y - g.y;
    const dist = Math.hypot(dx, dy);

    if (dist < g.coneLen) {
      const angleToPlayer = Math.atan2(dy, dx);
      let diff = Math.abs(angleToPlayer - gAngle);
      while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);

      if (diff < g.coneAngle) {
        // Line-of-sight raycast check through walls
        if (!this.isRayBlockedByWall(g.x, g.y, p.x, p.y)) {
          // SPOTTED! Trigger ALERT state!
          if (this.state !== 'ALERT') {
            this.state = 'ALERT';
            this.alertTimer = 6.0;
            this.discoveredCount++;
            for (let guard of this.guards) guard.state = 'ALERT';
            APU.sfx('ALARM');
          }
        }
      }
    }
  },

  isRayBlockedByWall(x0, y0, x1, y1) {
    // 5-point ray sample
    for (let step = 1; step < 5; step++) {
      const rx = x0 + (x1 - x0) * (step / 5);
      const ry = y0 + (y1 - y0) * (step / 5);
      if (this.checkWallCollision(rx, ry, 2)) return true;
    }
    return false;
  },

  checkWallCollision(x, y, r) {
    for (let w of this.walls) {
      if (x + r > w.x && x - r < w.x + w.w && y + r > w.y && y - r < w.y + w.h) {
        return true;
      }
    }
    return false;
  },

  // --------------------------------------------------------------------------
  // 4. 256x240 CRT RENDERING
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    // 1. Floor Grid (Dark covert facility)
    for (let x = 20; x < 240; x += 30) g.line(x, 30, x, 220, 0);

    // 2. Interior Walls & Security Barriers
    for (let w of this.walls) {
      g.rect(w.x, w.y, w.w, w.h, 1);
      g.box(w.x, w.y, w.w, w.h, 2);
    }

    // 3. Objectives & Terminals
    // Keycard
    if (!this.keycard.collected) {
      g.box(this.keycard.x - 3, this.keycard.y - 2, 7, 5, 3);
      g.line(this.keycard.x - 1, this.keycard.y, this.keycard.x + 2, this.keycard.y, 2);
    }

    // Ammo crate
    if (!this.crateLoot.collected) {
      g.box(this.crateLoot.x - 4, this.crateLoot.y - 4, 8, 8, 2);
      g.text("A", this.crateLoot.x - 2, this.crateLoot.y - 3, 3);
    }

    // Masterframe Computer Terminal
    g.rect(this.terminal.x - 6, this.terminal.y - 6, 12, 12, this.terminal.hacked ? 2 : 1);
    g.box(this.terminal.x - 6, this.terminal.y - 6, 12, 12, 3);
    g.px(this.terminal.x, this.terminal.y - 2, this.terminal.hacked ? 0 : 3);

    // Helipad Exfil Point
    g.circle(this.exitHelipad.x, this.exitHelipad.y, 14, 2);
    g.text("H", this.exitHelipad.x - 2, this.exitHelipad.y - 3, this.terminal.hacked ? 3 : 1);

    // 4. Guards & Vision Cones
    for (let gd of this.guards) {
      const gx = Math.floor(gd.x);
      const gy = Math.floor(gd.y);

      // Vision Cone (Semi-transparent / dithered triangle)
      if (gd.state !== 'ASLEEP') {
        let gAngle = 0;
        if (gd.axis === 'x') gAngle = gd.dir === 1 ? 0 : Math.PI;
        else gAngle = gd.dir === 1 ? Math.PI / 2 : -Math.PI / 2;

        const p1x = Math.floor(gx + Math.cos(gAngle - gd.coneAngle) * gd.coneLen);
        const p1y = Math.floor(gy + Math.sin(gAngle - gd.coneAngle) * gd.coneLen);
        const p2x = Math.floor(gx + Math.cos(gAngle + gd.coneAngle) * gd.coneLen);
        const p2y = Math.floor(gy + Math.sin(gAngle + gd.coneAngle) * gd.coneLen);

        const coneColor = (this.state === 'ALERT') ? 3 : 1;
        g.line(gx, gy, p1x, p1y, coneColor);
        g.line(gx, gy, p2x, p2y, coneColor);
        g.line(p1x, p1y, p2x, p2y, coneColor);
      }

      // Guard Silhouette
      g.disc(gx, gy, 4, gd.state === 'ALERT' ? 3 : 2);
      g.px(gx, gy, 0);

      if (gd.state === 'ASLEEP') {
        g.text("Zzz", gx + 4, gy - 8, 2);
      } else if (this.state === 'ALERT') {
        g.text("!", gx - 1, gy - 10, 3);
      }
    }

    // 5. Bullets
    for (let b of this.bullets) {
      g.disc(Math.floor(b.x), Math.floor(b.y), 2, 3);
    }

    // 6. Solid Snake (Player)
    const px = Math.floor(this.player.x);
    const py = Math.floor(this.player.y);

    if (this.player.inBox) {
      // Disguised in Cardboard Box
      g.rect(px - 5, py - 5, 10, 10, 2);
      g.box(px - 5, py - 5, 10, 10, 3);
      g.text("THE", px - 4, py - 3, 0);
    } else {
      // Infiltrator Sprite
      g.disc(px, py, 4, 3);
      // Directional weapon muzzle / nose
      const dirs = [{ x: 0, y: -5 }, { x: 5, y: 0 }, { x: 0, y: 5 }, { x: -5, y: 0 }];
      const d = dirs[this.player.dir];
      g.line(px, py, px + d.x, py + d.y, 3);
      // Bandana tails fluttering
      g.line(px - d.x * 0.8, py - d.y * 0.8, px - d.x * 1.5, py - d.y * 1.5, 2);
    }

    // 7. Top HUD (Status, HP, Ammo, Keycard)
    g.rect(0, 0, 256, 26, 0);
    g.line(0, 26, 256, 26, 2);

    const alertStr = (this.state === 'ALERT') ? "!! ALERT: " + Math.ceil(this.alertTimer) + "S !!" : "SNEAK";
    g.text(alertStr, 10, 8, this.state === 'ALERT' ? 3 : 2);

    // HP Bar
    g.text("HP", 90, 8, 2);
    g.box(105, 8, 40, 7, 2);
    g.rect(106, 9, Math.floor((this.player.hp / this.player.maxHp) * 38), 5, 3);

    // Ammo & Keycard
    g.text("AMMO: " + this.player.ammo, 155, 8, 3);
    g.textR(this.player.hasKeycard ? "[KEY 2]" : "[NO KEY]", 246, 8, this.player.hasKeycard ? 3 : 1);

    // 8. Bottom Controls Prompt
    g.rect(0, 214, 256, 26, 0);
    g.line(0, 214, 256, 214, 2);
    g.textC("D-PAD: SNEAK    [B]: BOX DISGUISE    [A]: TRANQ PISTOL", 222, 2);

    // 9. Mission Clear Overlay
    if (this.state === 'CLEAR') {
      g.dither(25, 65, 206, 80, 0, 1);
      g.box(25, 65, 206, 80, 3);
      g.textC("★ MISSION ACCOMPLISHED ★", 80, 3);
      g.textC("PLANS RETRIEVED. EXFILTRATION CLEAN!", 98, 2);
      g.textC("STEALTH RANK: " + (this.discoveredCount === 0 ? "BIG BOSS (PERFECT)" : "FOX HOUND"), 114, 3);
      g.textC("[A] PLAY AGAIN", 132, 3);
    } else if (this.state === 'GAMEOVER') {
      g.dither(35, 75, 186, 65, 0, 1);
      g.box(35, 75, 186, 65, 3);
      g.textC("SNAKE IS DEAD...", 92, 3);
      g.textC("MISSION FAILED", 108, 2);
      g.textC("[A] RETRY MISSION", 124, 3);
    }
  }
};
