// js/cartridges/cart_059_deep_diver.js
// ============================================================================
// Cartridge #059: DEEP DIVER
// Genre: RPG & ADVENTURE (5) | Oceanic Diving, Treasure Salvage & Predator Survival
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[59] = {
  id: 59,
  name: "DEEP DIVER",
  genre: 5,
  scoreLabel: "TREASURE",
  desc: "DIVE FOR PEARLS, GOLD & THE ABYSSAL DIAMOND. HARPOON SHARKS, MONITOR O2 & ESCAPE!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON: VINTAGE BRASS DIVING HELMET WITH RISING BUBBLES
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);

    // Helmet dome & collar
    g.disc(x + 16, y + 14, 9, 2);
    g.box(x + 10, y + 21, 12, 5, 3);
    g.rect(x + 8, y + 24, 16, 4, 1);

    // Circular glass viewport with brass grill
    g.disc(x + 16, y + 14, 5, 0);
    g.box(x + 12, y + 10, 8, 8, 3);
    g.line(x + 16, y + 10, x + 16, y + 18, 2);
    g.line(x + 12, y + 14, x + 20, y + 14, 2);

    // Top exhaust valve & side rivets
    g.rect(x + 14, y + 3, 4, 3, 3);
    g.pix(x + 8, y + 15, 3);
    g.pix(x + 24, y + 15, 3);

    // Rising air bubbles
    g.pix(x + 22, y + 8, 3);
    g.pix(x + 25, y + 5, 2);
    g.pix(x + 23, y + 2, 3);
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.maxDepth = 400; // meters (world height = 1600px, 4px = 1m)
    this.worldWidth = 256;
    this.worldHeight = 1600;

    // Diver state
    this.x = 128;
    this.y = 28; // starts at surface boat
    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1 = right, -1 = left

    // Upgrades & Equipment
    this.tankLevel = 1;      // 1: 60s, 2: 95s, 3: 140s
    this.finLevel = 1;       // 1: 1.0x, 2: 1.25x, 3: 1.55x
    this.harpoonLevel = 1;   // 1: 1 shot, 2: 2 shots, 3: 3 shots
    this.suitLevel = 1;      // 1: Normal, 2: Shark-resistant, 3: Abyssal pressure

    this.maxO2 = 60;
    this.o2 = 60;
    this.hp = 100;
    this.maxHp = 100;
    this.harpoons = 2;
    this.maxHarpoons = 2;

    // Bag & Economy
    this.bagPearls = 0;
    this.bagGold = 0;
    this.bagRelics = 0;
    this.bankPearls = 0;
    this.bankGold = 0;
    this.bankRelics = 0;
    this.cash = 0;
    this.score = 0;
    this.recordDepth = 0;

    // Heart of the ocean relic claimed
    this.hasHeartOfOcean = false;
    this.gameWon = false;
    this.gameOver = false;
    this.mode = 'PLAY'; // 'PLAY', 'SHOP', 'GAMEOVER', 'WIN'

    // Environmental entities
    this.bubbles = [];
    this.spears = [];
    this.particles = [];
    this.pearlClams = [];
    this.goldChests = [];
    this.sharks = [];
    this.jellyfish = [];
    this.morays = [];
    this.kraken = null;

    this.timer = 0;
    this.hurtTimer = 0;
    this.flashTimer = 0;
    this.alertTimer = 0;
    this.shopCursor = 0;

    this.spawnEcosystem();
  },

  spawnEcosystem() {
    this.pearlClams = [];
    this.goldChests = [];
    this.sharks = [];
    this.jellyfish = [];
    this.morays = [];

    // Clams with pearls (Zone 1 & 2: 60m - 180m -> y: 240..720)
    for (let i = 0; i < 9; i++) {
      this.pearlClams.push({
        x: 20 + Math.random() * 216,
        y: 220 + i * 55 + Math.random() * 20,
        hasPearl: true,
        open: Math.random() > 0.5,
        timer: Math.random() * 3
      });
    }

    // Gold chests & relics in sunken galleon (Zone 3: 180m - 320m -> y: 720..1280)
    for (let i = 0; i < 6; i++) {
      this.goldChests.push({
        x: 30 + Math.random() * 196,
        y: 760 + i * 85 + Math.random() * 30,
        collected: false,
        value: 150 + Math.floor(Math.random() * 150)
      });
    }

    // Patrolling Great White & Hammerhead Sharks (Zone 2 & 3: y: 320..1100)
    const sharkY = [360, 520, 680, 890, 1050];
    for (let i = 0; i < sharkY.length; i++) {
      this.sharks.push({
        x: Math.random() * 200,
        y: sharkY[i],
        vx: (i % 2 === 0 ? 1 : -1) * (35 + Math.random() * 20),
        stunned: 0,
        hp: 3,
        aggro: false
      });
    }

    // Swarming Electric Jellyfish (Zone 2 & 3: y: 400..1250)
    for (let i = 0; i < 7; i++) {
      this.jellyfish.push({
        x: 25 + Math.random() * 206,
        baseY: 420 + i * 110,
        y: 420 + i * 110,
        phase: Math.random() * Math.PI * 2,
        pulseSpd: 1.5 + Math.random() * 1.5
      });
    }

    // Moray Eels in rock crevices (Zone 3: y: 800..1200)
    this.morays.push({ x: 18, y: 840, dir: 1, timer: 0, lunge: 0 });
    this.morays.push({ x: 238, y: 980, dir: -1, timer: 1.5, lunge: 0 });
    this.morays.push({ x: 20, y: 1150, dir: 1, timer: 2.8, lunge: 0 });

    // Abyssal Kraken Boss (Zone 4: y: 1420)
    this.kraken = {
      x: 128,
      y: 1460,
      hp: 12,
      maxHp: 12,
      tentacles: [
        { angle: -0.6, phase: 0 },
        { angle: -0.2, phase: 1.2 },
        { angle: 0.2, phase: 2.4 },
        { angle: 0.6, phase: 3.6 }
      ],
      eyeOpen: true,
      rage: false,
      relicGuarded: true
    };
  },

  // --------------------------------------------------------------------------
  // 3. UPDATE LOOP & MECHANICS
  // --------------------------------------------------------------------------
  update(dt) {
    dt = Math.min(dt, 0.05);
    this.timer += dt;

    if (this.gameOver) {
      if (PAD.hit('a') || PAD.hit('b') || TOUCH.down) this.init();
      return;
    }

    if (this.gameWon) {
      if (PAD.hit('a') || PAD.hit('b') || TOUCH.down) this.init();
      return;
    }

    if (this.mode === 'SHOP') {
      this.updateShop();
      return;
    }

    // ------------------------------------------------------------------------
    // Diver Physics & Movement
    // ------------------------------------------------------------------------
    const finMult = this.finLevel === 1 ? 1.0 : (this.finLevel === 2 ? 1.3 : 1.6);
    const speed = 75 * finMult;
    const isTurbo = PAD.state.b && this.o2 > 2;

    let moveX = 0, moveY = 0;
    if (PAD.state.left) moveX -= 1;
    if (PAD.state.right) moveX += 1;
    if (PAD.state.up) moveY -= 1;
    if (PAD.state.down) moveY += 1;

    // Mobile touch virtual controls / tap-to-move
    if (TOUCH.held) {
      const tx = TOUCH.x, ty = TOUCH.y;
      if (tx < 100) {
        moveX = (tx - 50) / 40;
        moveY = (ty - 190) / 40;
      } else if (tx > 180 && ty > 160) {
        // right side action buttons
      } else {
        const screenDiverY = this.y - (this.y - 120);
        moveX = tx > 128 ? 1 : -1;
        moveY = ty > screenDiverY ? 1 : -1;
      }
    }

    const len = Math.hypot(moveX, moveY);
    if (len > 0) {
      moveX /= len;
      moveY /= len;
      if (moveX > 0.1) this.facing = 1;
      if (moveX < -0.1) this.facing = -1;
    }

    const accel = isTurbo ? speed * 1.55 : speed;
    this.vx += moveX * accel * dt * 4.5;
    this.vy += moveY * accel * dt * 4.5;

    // Water resistance & slight natural positive buoyancy near surface
    this.vx *= Math.pow(0.82, dt * 60);
    this.vy *= Math.pow(0.82, dt * 60);

    // Natural buoyancy: drifts upward slightly if not diving downward
    if (this.y > 35) {
      this.vy -= (this.bagGold * 0.08 + this.bagPearls * 0.04 - 6.0) * dt;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Boundaries
    this.x = Math.max(16, Math.min(this.worldWidth - 16, this.x));
    this.y = Math.max(22, Math.min(this.worldHeight - 20, this.y));

    // Record deepest dive depth (1m = 4px)
    const currentMeters = Math.floor((this.y - 28) / 3.8);
    if (currentMeters > this.recordDepth) this.recordDepth = currentMeters;

    // ------------------------------------------------------------------------
    // Oxygen & Pressure Dynamics
    // ------------------------------------------------------------------------
    if (this.y <= 34) {
      // AT SURFACE BOAT: Full replenish & bank goods!
      if (this.o2 < this.maxO2 || this.bagPearls > 0 || this.bagGold > 0 || this.bagRelics > 0) {
        this.o2 = this.maxO2;
        this.hp = Math.min(this.maxHp, this.hp + 20 * dt);
        this.harpoons = this.maxHarpoons;

        if (this.bagPearls > 0 || this.bagGold > 0 || this.bagRelics > 0) {
          const haul = this.bagPearls * 30 + this.bagGold + this.bagRelics * 500;
          this.cash += haul;
          this.score += haul;
          this.bankPearls += this.bagPearls;
          this.bankGold += this.bagGold;
          this.bankRelics += this.bagRelics;

          this.bagPearls = 0;
          this.bagGold = 0;
          this.bagRelics = 0;
          APU.sfx('COIN');
          SAVE.setScore(this.id, this.score);

          // Check win condition: Retrieved the Heart of the Ocean and returned!
          if (this.hasHeartOfOcean) {
            this.gameWon = true;
            this.score += 2500;
            SAVE.setScore(this.id, this.score);
            APU.sfx('FANFARE');
            return;
          }
        }
      }

      // Open Dive Shop at boat
      if (PAD.hit('select') || (TOUCH.down && TOUCH.x > 200 && TOUCH.y < 40)) {
        this.mode = 'SHOP';
        APU.sfx('SELECT');
        return;
      }
    } else {
      // Submerged: Oxygen consumption scaled by depth zone
      const depthMultiplier = 1.0 + (this.y / 1600) * 1.5;
      const turboCost = isTurbo ? 2.2 : 1.0;
      this.o2 -= (1.35 * depthMultiplier * turboCost) * dt;

      // Low O2 Alarm
      if (this.o2 < 15) {
        this.alertTimer += dt;
        if (this.alertTimer > 0.8) {
          this.alertTimer = 0;
          APU.sfx('TICK');
        }
      }

      // Suffocation / Drowning
      if (this.o2 <= 0) {
        this.o2 = 0;
        this.hp -= 18 * dt;
        this.hurtTimer = 0.2;
        if (this.hp <= 0) {
          this.gameOver = true;
          APU.sfx('HURT');
          return;
        }
      }
    }

    // Regulator air bubbles
    if (Math.random() < 0.25 && this.y > 32) {
      this.bubbles.push({
        x: this.x + (this.facing === 1 ? 5 : -5),
        y: this.y - 2,
        r: 1 + Math.floor(Math.random() * 2),
        vy: -25 - Math.random() * 20,
        vx: (Math.random() - 0.5) * 8
      });
    }

    // ------------------------------------------------------------------------
    // Harpoon Weapon [A]
    // ------------------------------------------------------------------------
    if ((PAD.hit('a') || (TOUCH.down && TOUCH.x > 180 && TOUCH.y > 170)) && this.harpoons > 0 && this.y > 34) {
      this.harpoons--;
      this.spears.push({
        x: this.x + this.facing * 8,
        y: this.y,
        vx: this.facing * 180,
        life: 0.9
      });
      APU.sfx('CONFIRM');
    }

    // Update spears
    for (let i = this.spears.length - 1; i >= 0; i--) {
      const s = this.spears[i];
      s.x += s.vx * dt;
      s.life -= dt;
      if (s.life <= 0 || s.x < 10 || s.x > this.worldWidth - 10) {
        this.spears.splice(i, 1);
      }
    }

    // ------------------------------------------------------------------------
    // Pearl Clams Logic
    // ------------------------------------------------------------------------
    for (let c of this.pearlClams) {
      c.timer -= dt;
      if (c.timer <= 0) {
        c.open = !c.open;
        c.timer = 2.0 + Math.random() * 2.5;
      }
      if (c.hasPearl && c.open) {
        const d = Math.hypot(this.x - c.x, this.y - c.y);
        if (d < 16) {
          c.hasPearl = false;
          this.bagPearls++;
          APU.sfx('COIN');
          this.spawnSparkles(c.x, c.y, 8);
        }
      }
    }

    // ------------------------------------------------------------------------
    // Sunken Gold Chests
    // ------------------------------------------------------------------------
    for (let ch of this.goldChests) {
      if (!ch.collected) {
        const d = Math.hypot(this.x - ch.x, this.y - ch.y);
        if (d < 18) {
          ch.collected = true;
          this.bagGold += ch.value;
          this.bagRelics++;
          APU.sfx('POWERUP');
          this.spawnSparkles(ch.x, ch.y, 14);
        }
      }
    }

    // ------------------------------------------------------------------------
    // Sharks AI & Combat
    // ------------------------------------------------------------------------
    for (let s of this.sharks) {
      if (s.stunned > 0) {
        s.stunned -= dt;
        continue;
      }

      // Detection & pursuit
      const distToDiver = Math.hypot(this.x - s.x, this.y - s.y);
      if (distToDiver < 85) {
        s.aggro = true;
        const dx = (this.x - s.x) / distToDiver;
        const dy = (this.y - s.y) / distToDiver;
        s.x += dx * 65 * dt;
        s.y += dy * 45 * dt;

        // Bite diver
        if (distToDiver < 16) {
          const dmg = this.suitLevel >= 2 ? 14 : 26;
          this.hp -= dmg;
          this.hurtTimer = 0.4;
          this.o2 = Math.max(0, this.o2 - 6);
          s.stunned = 1.2; // brief retreat recoil
          APU.sfx('HURT');
          if (this.hp <= 0) {
            this.gameOver = true;
            return;
          }
        }
      } else {
        s.aggro = false;
        s.x += s.vx * dt;
        if (s.x < 30 || s.x > this.worldWidth - 30) s.vx *= -1;
      }

      // Harpoon collision with shark
      for (let j = this.spears.length - 1; j >= 0; j--) {
        const sp = this.spears[j];
        if (Math.hypot(sp.x - s.x, sp.y - s.y) < 18) {
          s.stunned = 3.5;
          s.hp--;
          this.spears.splice(j, 1);
          APU.sfx('HIT');
          this.spawnSparkles(s.x, s.y, 10);
          break;
        }
      }
    }

    // ------------------------------------------------------------------------
    // Jellyfish AI (Vertical pulsing & shocking)
    // ------------------------------------------------------------------------
    for (let jf of this.jellyfish) {
      jf.phase += jf.pulseSpd * dt;
      jf.y = jf.baseY + Math.sin(jf.phase) * 35;

      const d = Math.hypot(this.x - jf.x, this.y - jf.y);
      if (d < 14) {
        this.o2 = Math.max(0, this.o2 - 12);
        this.hp -= 8;
        this.hurtTimer = 0.3;
        this.vx *= 0.2; // electric paralyze
        this.vy *= 0.2;
        APU.sfx('EXPLODE');
        if (this.hp <= 0) {
          this.gameOver = true;
          return;
        }
      }
    }

    // ------------------------------------------------------------------------
    // Moray Eels (Crevice ambushes)
    // ------------------------------------------------------------------------
    for (let m of this.morays) {
      const dist = Math.hypot(this.x - m.x, this.y - m.y);
      if (dist < 55) {
        m.lunge = Math.min(32, m.lunge + 80 * dt);
        if (dist < 18) {
          this.hp -= 18;
          this.hurtTimer = 0.35;
          APU.sfx('HURT');
          m.lunge = 0;
          if (this.hp <= 0) {
            this.gameOver = true;
            return;
          }
        }
      } else {
        m.lunge = Math.max(0, m.lunge - 40 * dt);
      }
    }

    // ------------------------------------------------------------------------
    // Abyssal Kraken Boss
    // ------------------------------------------------------------------------
    if (this.kraken && this.y > 1320) {
      const k = this.kraken;
      for (let t of k.tentacles) {
        t.phase += 2.0 * dt;
      }

      // Heart of the ocean relic pickup
      if (k.relicGuarded) {
        const d = Math.hypot(this.x - k.x, this.y - (k.y - 30));
        if (d < 22) {
          k.relicGuarded = false;
          this.hasHeartOfOcean = true;
          this.bagRelics += 3;
          this.score += 2000;
          APU.sfx('FANFARE');
          this.spawnSparkles(k.x, k.y - 30, 25);
        }
      }

      // Harpoon collision with Kraken Eye
      for (let j = this.spears.length - 1; j >= 0; j--) {
        const sp = this.spears[j];
        if (Math.hypot(sp.x - k.x, sp.y - k.y) < 26) {
          k.hp--;
          this.spears.splice(j, 1);
          APU.sfx('HIT');
          this.spawnSparkles(k.x, k.y, 16);
          if (k.hp <= 0) {
            k.eyeOpen = false;
            k.relicGuarded = false;
            this.hasHeartOfOcean = true;
            this.score += 3000;
            APU.sfx('POWERUP');
          }
          break;
        }
      }
    }

    // ------------------------------------------------------------------------
    // Particles & Bubbles update
    // ------------------------------------------------------------------------
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.y += b.vy * dt;
      b.x += b.vx * dt;
      if (b.y < 28) this.bubbles.splice(i, 1);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  },

  spawnSparkles(x, y, count) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 20 + Math.random() * 40;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.6 + Math.random() * 0.4
      });
    }
  },

  updateShop() {
    if (PAD.hit('up')) {
      this.shopCursor = (this.shopCursor - 1 + 4) % 4;
      APU.sfx('SELECT');
    }
    if (PAD.hit('down')) {
      this.shopCursor = (this.shopCursor + 1) % 4;
      APU.sfx('SELECT');
    }
    if (PAD.hit('b') || (TOUCH.down && TOUCH.y < 35)) {
      this.mode = 'PLAY';
      APU.sfx('CONFIRM');
      return;
    }

    // Buy upgrade
    if (PAD.hit('a') || (TOUCH.down && TOUCH.y > 180)) {
      if (this.shopCursor === 0 && this.tankLevel < 3 && this.cash >= 150 * this.tankLevel) {
        this.cash -= 150 * this.tankLevel;
        this.tankLevel++;
        this.maxO2 = this.tankLevel === 2 ? 95 : 140;
        this.o2 = this.maxO2;
        APU.sfx('POWERUP');
      } else if (this.shopCursor === 1 && this.finLevel < 3 && this.cash >= 120 * this.finLevel) {
        this.cash -= 120 * this.finLevel;
        this.finLevel++;
        APU.sfx('POWERUP');
      } else if (this.shopCursor === 2 && this.harpoonLevel < 3 && this.cash >= 180 * this.harpoonLevel) {
        this.cash -= 180 * this.harpoonLevel;
        this.harpoonLevel++;
        this.maxHarpoons = this.harpoonLevel + 1;
        this.harpoons = this.maxHarpoons;
        APU.sfx('POWERUP');
      } else if (this.shopCursor === 3 && this.suitLevel < 3 && this.cash >= 250 * this.suitLevel) {
        this.cash -= 250 * this.suitLevel;
        this.suitLevel++;
        this.maxHp = 100 + (this.suitLevel - 1) * 35;
        this.hp = this.maxHp;
        APU.sfx('POWERUP');
      } else {
        APU.sfx('ERROR');
      }
    }
  },

  // --------------------------------------------------------------------------
  // 4. RENDERING (256x240 CRT PHOSPHOR DISPLAY)
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    if (this.mode === 'SHOP') {
      this.renderShop(g);
      return;
    }

    // Camera offset: centers around diver vertically
    const camY = Math.max(0, Math.min(this.worldHeight - 240, this.y - 110));

    // Zone Background Shading & Depths
    this.renderWaterGradients(g, camY);

    // Render Clams & Pearls
    for (let c of this.pearlClams) {
      const sy = c.y - camY;
      if (sy > -20 && sy < 250) {
        g.box(c.x - 7, sy - 4, 14, 8, 2);
        if (c.open) {
          g.line(c.x - 7, sy - 4, c.x, sy - 8, 3);
          g.line(c.x + 7, sy - 4, c.x, sy - 8, 3);
          if (c.hasPearl) g.disc(c.x, sy - 2, 3, 3);
        } else {
          g.line(c.x - 7, sy, c.x + 7, sy, 1);
        }
      }
    }

    // Render Gold Chests
    for (let ch of this.goldChests) {
      const sy = ch.y - camY;
      if (sy > -20 && sy < 250) {
        if (!ch.collected) {
          g.box(ch.x - 9, sy - 6, 18, 12, 3);
          g.line(ch.x - 9, sy, ch.x + 9, sy, 2);
          g.disc(ch.x, sy, 2, 0);
        } else {
          g.box(ch.x - 9, sy - 2, 18, 8, 1);
        }
      }
    }

    // Render Sharks
    for (let s of this.sharks) {
      const sy = s.y - camY;
      if (sy > -30 && sy < 260) {
        const dir = s.vx >= 0 ? 1 : -1;
        const shade = s.stunned > 0 ? 1 : (s.aggro ? 3 : 2);

        // Shark body & tail
        g.oval(s.x, sy, 16, 7, shade);
        g.tri(s.x - dir * 16, sy, s.x - dir * 26, sy - 8, s.x - dir * 26, sy + 8, shade);
        // Dorsal fin
        g.tri(s.x - dir * 2, sy - 5, s.x + dir * 6, sy - 5, s.x, sy - 14, shade);
        // Eye & jaw
        g.pix(s.x + dir * 10, sy - 2, 0);
        g.line(s.x + dir * 8, sy + 3, s.x + dir * 14, sy + 2, 0);
      }
    }

    // Render Jellyfish
    for (let jf of this.jellyfish) {
      const sy = jf.y - camY;
      if (sy > -30 && sy < 260) {
        g.disc(jf.x, sy, 6, 3);
        g.rect(jf.x - 6, sy, 12, 4, 0);
        for (let k = -4; k <= 4; k += 2) {
          g.line(jf.x + k, sy + 2, jf.x + k + Math.sin(this.timer * 4 + k) * 3, sy + 12, 2);
        }
      }
    }

    // Render Moray Eels
    for (let m of this.morays) {
      const sy = m.y - camY;
      if (sy > -20 && sy < 250) {
        g.rect(m.dir === 1 ? 0 : 236, sy - 6, 20, 12, 1);
        const headX = m.dir === 1 ? m.x + m.lunge : m.x - m.lunge;
        g.oval(headX, sy, 12, 5, 2);
        g.pix(headX + m.dir * 4, sy - 2, 3);
      }
    }

    // Render Abyssal Kraken
    if (this.kraken && (this.kraken.y - camY) > -60) {
      const k = this.kraken;
      const sy = k.y - camY;
      g.disc(k.x, sy, 22, 2);
      if (k.eyeOpen) {
        g.disc(k.x, sy - 2, 8, 3);
        g.disc(k.x, sy - 2, 3, 0);
      }
      for (let t of k.tentacles) {
        const tx = k.x + Math.sin(t.angle + Math.sin(t.phase) * 0.3) * 45;
        const ty = sy + Math.cos(t.angle + Math.sin(t.phase) * 0.3) * 45;
        g.line(k.x, sy + 10, tx, ty, 2);
      }
      if (k.relicGuarded) {
        // Glowing Heart of Ocean jewel
        g.tri(k.x, sy - 36, k.x - 7, sy - 24, k.x + 7, sy - 24, 3);
        g.tri(k.x, sy - 18, k.x - 7, sy - 24, k.x + 7, sy - 24, 3);
      }
    }

    // Render Spears
    for (let sp of this.spears) {
      const sy = sp.y - camY;
      g.line(sp.x - 6, sy, sp.x + 6, sy, 3);
      g.pix(sp.x + (sp.vx > 0 ? 7 : -7), sy, 3);
    }

    // Render Bubbles & Sparkles
    for (let b of this.bubbles) {
      const sy = b.y - camY;
      if (sy > 0 && sy < 240) g.disc(b.x, sy, b.r, 2);
    }
    for (let p of this.particles) {
      const sy = p.y - camY;
      if (sy > 0 && sy < 240) g.pix(p.x, sy, 3);
    }

    // ------------------------------------------------------------------------
    // Render Diver
    // ------------------------------------------------------------------------
    const dsy = this.y - camY;
    const f = this.facing;
    const suitShade = this.suitLevel >= 2 ? 3 : 2;

    // Body wetsuit & head
    g.oval(this.x, dsy, 7, 5, suitShade);
    g.disc(this.x + f * 6, dsy - 1, 4, 3);
    // Mask viewport
    g.pix(this.x + f * 8, dsy - 1, 0);
    // Oxygen Tank on back
    g.rect(this.x - f * 4, dsy - 6, 4, 9, 2);
    // Flippers kicking
    const kick = Math.sin(this.timer * 8) * 3;
    g.line(this.x - f * 6, dsy + 2, this.x - f * 12, dsy + 3 + kick, 3);

    // ------------------------------------------------------------------------
    // HUD & Overlays
    // ------------------------------------------------------------------------
    this.renderHUD(g);

    // Game Over & Victory banners
    if (this.gameOver) {
      g.rect(30, 90, 196, 56, 0);
      g.box(30, 90, 196, 56, 3);
      g.textC("SUCCUMBED TO THE DEEP", 102, 3);
      g.textC("FINAL SCORE: " + this.score, 116, 2);
      g.textC("PRESS [A] TO DIVE AGAIN", 132, 3);
    } else if (this.gameWon) {
      g.rect(20, 80, 216, 76, 0);
      g.box(20, 80, 216, 76, 3);
      g.textC("HEART OF THE OCEAN RECOVERED!", 92, 3);
      g.textC("MASTER OF THE SEAS VICTORY!", 106, 2);
      g.textC("FINAL SCORE: " + this.score, 122, 3);
      g.textC("PRESS [A] TO DIVE AGAIN", 140, 2);
    }
  },

  renderWaterGradients(g, camY) {
    // Surface Boat & Sky (y: 0..36)
    if (camY < 60) {
      const boatY = 24 - camY;
      g.rect(0, 0, 256, Math.max(0, boatY), 1); // Sky
      // Boat Hull & Cabin
      g.rect(80, boatY - 14, 96, 14, 2);
      g.tri(60, boatY - 14, 80, boatY - 14, 80, boatY, 2);
      g.tri(196, boatY - 14, 176, boatY - 14, 176, boatY, 2);
      g.rect(106, boatY - 26, 44, 12, 3);
      g.text("R/V VERDANT", 96, boatY - 10, 0);
      g.text("[DIVE SHOP]", 184, boatY - 8, 3);
      // Surface wave line
      for (let x = 0; x < 256; x += 12) {
        g.line(x, boatY, x + 6, boatY - 1, 2);
      }
    }

    // Depth Zone Indicators
    const depthMeters = Math.floor((this.y - 28) / 3.8);
    if (depthMeters > 300) {
      // Midnight Abyss: vignette darkness
      g.box(4, 4, 248, 232, 1);
    }
  },

  renderHUD(g) {
    // Top Bar HUD
    g.rect(0, 0, 256, 18, 0);
    g.line(0, 18, 256, 18, 2);

    const depthMeters = Math.max(0, Math.floor((this.y - 28) / 3.8));
    g.text("DEPTH: " + depthMeters + "m", 6, 4, 3);

    // Oxygen Bar
    const o2W = Math.floor((this.o2 / this.maxO2) * 54);
    const o2Shade = this.o2 < 15 ? (Math.floor(this.timer * 6) % 2 === 0 ? 3 : 1) : 2;
    g.text("O2", 82, 4, 2);
    g.box(96, 4, 56, 8, 2);
    g.rect(97, 5, Math.max(0, o2W), 6, o2Shade);

    // HP Bar
    const hpW = Math.floor((this.hp / this.maxHp) * 36);
    g.text("HP", 158, 4, 2);
    g.box(172, 4, 38, 8, 2);
    g.rect(173, 5, Math.max(0, hpW), 6, 3);

    // Pearls & Cash
    g.textR("P:" + (this.bankPearls + this.bagPearls) + " $" + this.cash, 250, 4, 3);

    // Bottom Action Touch Indicators (Mobile Friendly)
    if (this.y > 34) {
      g.box(184, 196, 32, 22, 2);
      g.text("ATK", 190, 202, 3);
      g.box(220, 196, 32, 22, 2);
      g.text("TURB", 222, 202, 3);
    } else {
      g.textC("★ AT SURFACE BOAT: REFILLED! [SELECT] DIVE SHOP ★", 216, 3);
    }
  },

  renderShop(g) {
    g.textC("=== R/V VERDANT DIVE SHOP ===", 14, 3);
    g.text("CURRENT CASH: $" + this.cash, 24, 30, 2);

    const items = [
      { name: "O2 TANK", lv: this.tankLevel, cost: 150 * this.tankLevel, max: 3 },
      { name: "CARBON FINS", lv: this.finLevel, cost: 120 * this.finLevel, max: 3 },
      { name: "HARPOON GUN", lv: this.harpoonLevel, cost: 180 * this.harpoonLevel, max: 3 },
      { name: "DIVING SUIT", lv: this.suitLevel, cost: 250 * this.suitLevel, max: 3 }
    ];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const y = 56 + i * 28;
      const isSel = i === this.shopCursor;
      if (isSel) g.rect(18, y - 2, 220, 22, 1);
      g.box(18, y - 2, 220, 22, isSel ? 3 : 2);
      g.text((isSel ? "▶ " : "  ") + it.name + " (LV " + it.lv + ")", 24, y + 4, isSel ? 3 : 2);
      if (it.lv >= it.max) {
        g.textR("MAXED", 230, y + 4, 2);
      } else {
        g.textR("$" + it.cost + " [A]", 230, y + 4, this.cash >= it.cost ? 3 : 1);
      }
    }

    g.textC("[▲/▼] SELECT   [A] PURCHASE   [B] EXIT SHOP", 190, 2);
  }
};
