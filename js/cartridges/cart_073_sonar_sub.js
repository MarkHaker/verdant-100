// js/cartridges/cart_073_sonar_sub.js
// ============================================================================
// Cartridge #073: SONAR SUB
// Genre: Stealth & Defense (7) | Silent Hunter Deep-Sea Sonar Submarine
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[73] = {
  id: 73,
  name: "SONAR SUB",
  genre: 7,
  scoreLabel: "TONNAGE",
  desc: "SILENT HUNTER: [A] EMIT SONAR PING TO ILLUMINATE TRENCH, [B] FIRE TORPEDO AT WARSHIPS!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Circular sonar CRT scope with sweeping beam and submarine contact blip
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Circular Sonar Scope
    g.circle(x + 16, y + 16, 13, 2);
    g.circle(x + 16, y + 16, 8, 1);
    g.circle(x + 16, y + 16, 4, 1);
    g.line(x + 16, y + 3, x + 16, y + 29, 1);
    g.line(x + 3, y + 16, x + 29, y + 16, 1);

    // Rotating Sonar Beam line
    g.line(x + 16, y + 16, x + 25, y + 8, 3);

    // Target Contact Blip
    g.disc(x + 22, y + 10, 2, 3);
    g.px(x + 24, y + 10, 2);
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.tonnageSunk = 0;
    this.state = 'PATROL'; // 'PATROL', 'SUNK', 'VICTORY', 'GAMEOVER'
    this.activePingWave = null; // { x, y, r, maxR, timer }

    // Submarine (Player)
    this.sub = {
      x: 128,
      y: 125,
      angle: -Math.PI / 2, // Heading
      speed: 35,
      maxSpeed: 65,
      hullHp: 100,
      torpedoes: 8,
      silentRunning: false
    };

    // Ocean Trench Sea Mounts & Rocks (Obstacles)
    this.terrainRocks = [
      { x: 50, y: 70, r: 24 },
      { x: 210, y: 70, r: 28 },
      { x: 45, y: 180, r: 30 },
      { x: 205, y: 185, r: 32 },
      { x: 128, y: 220, r: 22 }
    ];

    // Moored Naval Mines
    this.mines = [
      { x: 85, y: 125, active: true },
      { x: 170, y: 125, active: true },
      { x: 128, y: 80, active: true }
    ];

    // Enemy Warships (Surface Destroyer & Patrol Sub)
    this.enemies = [
      { id: 1, name: "DESTROYER", x: 60, y: 45, vx: 25, vy: 0, hp: 60, tonnage: 2400, depthCharges: 6, pingAlert: 0 },
      { id: 2, name: "CORVETTE", x: 180, y: 55, vx: -20, vy: 0, hp: 40, tonnage: 1200, depthCharges: 4, pingAlert: 0 }
    ];

    // Projectiles (Torpedoes & Depth Charges)
    this.torpedoes = [];
    this.depthCharges = [];

    // Fading Sonar Echoes array
    this.sonarEchoes = [];
  },

  // --------------------------------------------------------------------------
  // 3. MAIN GAMEPLAY UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    if (dt > 0.05) dt = 0.05;

    // Handle Game Over restart
    if (this.state === 'GAMEOVER' || this.state === 'VICTORY') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || TOUCH.down) {
        this.init();
      }
      return;
    }

    const s = this.sub;

    // 1. SUBMARINE HELM & PROPULSION
    if (PAD.state.left) s.angle -= 1.6 * dt;
    if (PAD.state.right) s.angle += 1.6 * dt;

    if (PAD.state.up) s.speed = Math.min(s.maxSpeed, s.speed + 25 * dt);
    else if (PAD.state.down) s.speed = Math.max(10, s.speed - 30 * dt);

    // Toggle Silent Running [Down + B] or select
    if (PAD.hit('select')) {
      s.silentRunning = !s.silentRunning;
      s.maxSpeed = s.silentRunning ? 30 : 65;
      APU.sfx('SELECT');
    }

    s.x += Math.cos(s.angle) * s.speed * dt;
    s.y += Math.sin(s.angle) * s.speed * dt;

    // Screen wrapping / border clamping
    s.x = Math.max(16, Math.min(240, s.x));
    s.y = Math.max(34, Math.min(215, s.y));

    // 2. ACTIVE SONAR PING [A]
    if (PAD.hit('a') || TOUCH.down) {
      this.activePingWave = {
        x: s.x,
        y: s.y,
        r: 5,
        maxR: 190,
        speed: 130
      };
      APU.sfx('ALARM');

      // Active ping alerts all enemies in range!
      for (let en of this.enemies) {
        en.pingAlert = 5.0; // Investigate ping origin
      }
    }

    // 3. FIRE ACOUSTIC TORPEDO [B]
    if (PAD.hit('b')) {
      if (s.torpedoes > 0) {
        s.torpedoes--;
        this.torpedoes.push({
          x: s.x + Math.cos(s.angle) * 10,
          y: s.y + Math.sin(s.angle) * 10,
          vx: Math.cos(s.angle) * 95,
          vy: Math.sin(s.angle) * 95,
          life: 4.0
        });
        APU.sfx('CONFIRM');
      }
    }

    // 4. ADVANCE ACTIVE SONAR WAVE & DETECT CONTACTS
    if (this.activePingWave) {
      const pw = this.activePingWave;
      pw.r += pw.speed * dt;

      // Check Echoes with Rocks
      for (let r of this.terrainRocks) {
        const d = Math.hypot(r.x - pw.x, r.y - pw.y);
        if (Math.abs(d - pw.r) < 8) {
          this.addEcho(r.x, r.y, 'ROCK', r.r);
        }
      }

      // Check Echoes with Mines
      for (let m of this.mines) {
        if (!m.active) continue;
        const d = Math.hypot(m.x - pw.x, m.y - pw.y);
        if (Math.abs(d - pw.r) < 8) {
          this.addEcho(m.x, m.y, 'MINE', 4);
        }
      }

      // Check Echoes with Enemies
      for (let e of this.enemies) {
        const d = Math.hypot(e.x - pw.x, e.y - pw.y);
        if (Math.abs(d - pw.r) < 8) {
          this.addEcho(e.x, e.y, 'WARSHIP', 10);
        }
      }

      if (pw.r >= pw.maxR) {
        this.activePingWave = null;
      }
    }

    // Decay Sonar Echoes over 2.5 seconds
    for (let i = this.sonarEchoes.length - 1; i >= 0; i--) {
      this.sonarEchoes[i].life -= dt;
      if (this.sonarEchoes[i].life <= 0) this.sonarEchoes.splice(i, 1);
    }

    // 5. UPDATE TORPEDOES & ENEMY IMPACTS
    for (let i = this.torpedoes.length - 1; i >= 0; i--) {
      const torp = this.torpedoes[i];
      torp.x += torp.vx * dt;
      torp.y += torp.vy * dt;
      torp.life -= dt;

      if (torp.life <= 0) {
        this.torpedoes.splice(i, 1);
        continue;
      }

      // Check hit on Enemy Warships
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const en = this.enemies[j];
        if (Math.hypot(torp.x - en.x, torp.y - en.y) < 14) {
          // Direct Torpedo Impact!
          en.hp -= 40;
          this.torpedoes.splice(i, 1);
          APU.sfx('EXPLODE');

          if (en.hp <= 0) {
            this.tonnageSunk += en.tonnage;
            this.enemies.splice(j, 1);
            APU.sfx('FANFARE');

            if (this.enemies.length === 0) {
              this.state = 'VICTORY';
              SAVE.setScore(this.id, this.tonnageSunk);
            }
          }
          break;
        }
      }
    }

    // 6. ENEMY WARSHIPS AI & DEPTH CHARGE BARRAGE
    for (let en of this.enemies) {
      en.x += en.vx * dt;
      if (en.x < 30 || en.x > 225) en.vx = -en.vx;

      if (en.pingAlert > 0) {
        en.pingAlert -= dt;

        // Drop depth charge over sub area
        if (Math.abs(en.x - s.x) < 40 && Math.random() < 0.04) {
          this.depthCharges.push({
            x: en.x,
            y: en.y,
            vy: 45,
            targetDepth: s.y,
            detonated: false
          });
          APU.sfx('TICK');
        }
      }
    }

    // Update Depth Charges
    for (let i = this.depthCharges.length - 1; i >= 0; i--) {
      const dc = this.depthCharges[i];
      dc.y += dc.vy * dt;

      if (dc.y >= dc.targetDepth) {
        // Detonate depth charge!
        APU.sfx('BOOM');
        const dist = Math.hypot(s.x - dc.x, s.y - dc.y);
        if (dist < 32) {
          // Shockwave damage
          s.hullHp -= Math.floor((32 - dist) * 1.5);
          if (s.hullHp <= 0) {
            this.state = 'GAMEOVER';
            APU.sfx('ERROR');
            SAVE.setScore(this.id, this.tonnageSunk);
            return;
          }
        }
        this.depthCharges.splice(i, 1);
      }
    }
  },

  addEcho(x, y, type, size) {
    this.sonarEchoes.push({
      x: x,
      y: y,
      type: type,
      size: size,
      life: 2.2
    });
  },

  // --------------------------------------------------------------------------
  // 4. 256x240 CRT RENDERING
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    // 1. Dark Trench (Underwater Ambient)
    // Compass grid markings
    for (let x = 30; x <= 226; x += 40) g.line(x, 30, x, 215, 0);

    // 2. Active Sonar Expanding Wave
    if (this.activePingWave) {
      const pw = this.activePingWave;
      g.circle(Math.floor(pw.x), Math.floor(pw.y), Math.floor(pw.r), 3);
      g.circle(Math.floor(pw.x), Math.floor(pw.y), Math.max(1, Math.floor(pw.r - 4)), 2);
    }

    // 3. Render Sonar Contact Echoes
    for (let ec of this.sonarEchoes) {
      const ex = Math.floor(ec.x);
      const ey = Math.floor(ec.y);
      const shade = ec.life > 1.2 ? 3 : ec.life > 0.5 ? 2 : 1;

      if (ec.type === 'ROCK') {
        g.circle(ex, ey, Math.floor(ec.size), shade);
        g.px(ex, ey, shade);
      } else if (ec.type === 'MINE') {
        g.circle(ex, ey, 4, shade);
        g.line(ex - 4, ey, ex + 4, ey, shade);
      } else { // WARSHIP CONTACT
        g.rect(ex - 8, ey - 3, 16, 6, shade);
        g.text("CONTACT", ex - 14, ey - 10, shade);
      }
    }

    // 4. Sinking Depth Charges
    for (let dc of this.depthCharges) {
      g.disc(Math.floor(dc.x), Math.floor(dc.y), 3, 2);
    }

    // 5. Active Torpedoes
    for (let t of this.torpedoes) {
      g.disc(Math.floor(t.x), Math.floor(t.y), 2, 3);
      g.line(Math.floor(t.x), Math.floor(t.y), Math.floor(t.x - t.vx * 0.05), Math.floor(t.y - t.vy * 0.05), 1);
    }

    // 6. Player Submarine Sprite (Foreground)
    const sx = Math.floor(this.sub.x);
    const sy = Math.floor(this.sub.y);
    const ang = this.sub.angle;

    // Submarine Hull oval
    g.oval(sx, sy, 8, 4, 3);
    // Conning Tower / Sail
    g.line(sx, sy, Math.floor(sx + Math.cos(ang) * 9), Math.floor(sy + Math.sin(ang) * 9), 3);
    // Propeller Cavitation
    if (this.sub.speed > 40) {
      g.px(Math.floor(sx - Math.cos(ang) * 10), Math.floor(sy - Math.sin(ang) * 10), 2);
    }

    // 7. Top HUD (Hull Integrity, Torpedoes, Sunk Tonnage)
    g.rect(0, 0, 256, 26, 0);
    g.line(0, 26, 256, 26, 2);

    g.text("HULL: " + Math.max(0, Math.floor(this.sub.hullHp)) + "%", 10, 8, this.sub.hullHp < 35 ? 3 : 2);
    g.text("TORPS: " + this.sub.torpedoes, 95, 8, 3);
    g.textR(this.tonnageSunk + " TONS SUNK", 246, 8, 3);

    // 8. Bottom Controls
    g.rect(0, 214, 256, 26, 0);
    g.line(0, 214, 256, 214, 2);
    g.textC("[A]: ACTIVE PING    [B]: FIRE TORPEDO    D-PAD: RUDDER", 222, 2);

    // 9. Victory / Game Over Overlay
    if (this.state === 'VICTORY') {
      g.dither(25, 65, 206, 75, 0, 1);
      g.box(25, 65, 206, 75, 3);
      g.textC("★ PATROL SECTOR CLEARED! ★", 80, 3);
      g.textC("ALL ENEMY WARSHIPS SUNK!", 96, 2);
      g.textC("TOTAL TONNAGE: " + this.tonnageSunk + " BRT", 112, 3);
      g.textC("[A] NEXT PATROL", 128, 3);
    } else if (this.state === 'GAMEOVER') {
      g.dither(35, 75, 186, 65, 0, 1);
      g.box(35, 75, 186, 65, 3);
      g.textC("HULL CRUSH DEPTH REACHED", 92, 3);
      g.textC("SUBMARINE LOST AT SEA", 108, 2);
      g.textC("[A] RETRY PATROL", 124, 3);
    }
  }
};
