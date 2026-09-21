// js/cartridges/cart_047_ant_colony.js
// ============================================================================
// Cartridge #047: ANT COLONY
// ============================================================================
// Authentic, arcade-quality Ant Colony simulator inspired by SimAnt and
// biological stigmergy algorithms. Features realistic pheromone diffusion,
// 3 specialized castes (Worker, Soldier, Queen), interactive trail drawing
// via D-pad and mobile multi-touch, food foraging, invading predators,
// epic Brood Spider boss battles, colony economy, and milestone achievements.
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[47] = {
  id: 47,
  name: "ANT COLONY",
  genre: 4, // STRATEGY
  scoreLabel: "SUGAR",
  desc: "DRAW PHEROMONE TRAILS FOR WORKER ANTS TO HARVEST SUGAR FOR THE QUEEN!",

  // --------------------------------------------------------------------------
  // 1. RETRO 32x32 ICON: Detailed worker ant carrying glowing sugar crystal
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);

    // Underground mound silhouette & soil texture
    g.disc(x + 5, y + 26, 9, 1);
    g.disc(x + 5, y + 26, 4, 0); // Nest entrance tunnel
    g.px(x + 3, y + 8, 1);
    g.px(x + 28, y + 6, 1);
    g.px(x + 10, y + 29, 2);
    g.px(x + 25, y + 27, 1);

    // Glowing pheromone trail leading from right garden into the nest
    g.px(x + 9, y + 22, 2);
    g.px(x + 13, y + 20, 2);
    g.px(x + 17, y + 19, 3);
    g.px(x + 22, y + 17, 2);
    g.px(x + 27, y + 16, 1);

    // Worker ant body angled toward nest entrance:
    // Abdomen (rear oval)
    g.disc(x + 22, y + 13, 3, 2);
    g.px(x + 23, y + 13, 3); // Chitin shine
    g.px(x + 24, y + 14, 2);

    // Petiole (narrow ant waist)
    g.px(x + 18, y + 15, 2);

    // Thorax (center body)
    g.rect(x + 15, y + 15, 3, 3, 2);
    g.px(x + 16, y + 15, 3);

    // Neck & Head
    g.px(x + 14, y + 17, 2);
    g.disc(x + 12, y + 18, 2, 2);
    g.px(x + 12, y + 17, 3); // Eye

    // Articulated antennae pointing forward
    g.line(x + 11, y + 17, x + 8, y + 15, 3);
    g.line(x + 8, y + 15, x + 7, y + 17, 3);
    g.line(x + 11, y + 19, x + 8, y + 21, 3);

    // Mandibles grasping glowing sugar crystal
    g.px(x + 10, y + 19, 2);
    g.px(x + 10, y + 18, 2);

    // Glowing Sugar Crystal (in mandibles at x+6, y+18)
    g.rect(x + 6, y + 18, 3, 3, 3);
    g.px(x + 7, y + 17, 3); // Top facet
    g.px(x + 5, y + 19, 3);
    g.px(x + 9, y + 20, 3);

    // 6 Articulated walking legs with distinct joints
    // Front pair
    g.line(x + 15, y + 17, x + 13, y + 21, 2);
    g.line(x + 13, y + 21, x + 11, y + 24, 2);
    g.line(x + 15, y + 15, x + 13, y + 12, 2);
    g.line(x + 13, y + 12, x + 10, y + 11, 2);

    // Middle pair
    g.line(x + 16, y + 17, x + 16, y + 22, 2);
    g.line(x + 16, y + 22, x + 17, y + 25, 2);
    g.line(x + 16, y + 15, x + 16, y + 10, 2);
    g.line(x + 16, y + 10, x + 18, y + 8, 2);

    // Back pair
    g.line(x + 17, y + 17, x + 20, y + 21, 2);
    g.line(x + 20, y + 21, x + 23, y + 24, 2);
    g.line(x + 17, y + 15, x + 20, y + 11, 2);
    g.line(x + 20, y + 11, x + 23, y + 9, 2);
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE MANAGEMENT
  // --------------------------------------------------------------------------
  init() {
    // Screen & Pheromone Grid geometry
    this.GW = 64;
    this.GH = 50;
    this.CSZ = 4;
    this.OX = 0;
    this.OY = 20;
    this.pheroTotal = this.GW * this.GH;
    this.phero = new Float32Array(this.pheroTotal);

    // Colony Headquarters & Architecture
    this.nestX = 128;
    this.nestY = 120;
    this.nestRadius = 16;
    this.nestLevel = 1; // Expands to 2, 3, 4
    this.maxAnts = 20;

    // Economy & Progress
    this.sugar = 25; // Starting sugar stockpile
    this.totalHarvested = 0;
    this.score = 0;

    // Queen stats
    this.queenHp = 100;
    this.maxQueenHp = 100;
    this.emergencyTimer = 0;

    // Castes: Workers and Soldiers
    this.ants = [];
    this.antIdSeq = 1;

    // Initial brood: 8 workers and 2 soldiers
    for (let i = 0; i < 8; i++) this.spawnAnt('worker');
    for (let i = 0; i < 2; i++) this.spawnAnt('soldier');

    // Garden Food & Predators
    this.foods = [];
    this.predators = [];
    this.floatingTexts = [];
    this.particles = [];

    // Ambient floating spores/pollen
    this.spores = [];
    for (let i = 0; i < 10; i++) {
      this.spores.push({
        x: 10 + Math.random() * 236,
        y: 24 + Math.random() * 184,
        vx: 4 + Math.random() * 6,
        vy: (Math.random() - 0.5) * 4
      });
    }

    // Seed initial food deposits across garden quadrants
    this.spawnFood('sugar', 45, 60, 6);
    this.spawnFood('fruit', 205, 55, 16);
    this.spawnFood('seed', 60, 175, 6);
    this.spawnFood('sugar', 200, 170, 6);

    // Interactive Controls
    this.cx = 128;
    this.cy = 120;
    this.selectedAction = 0; // 0 = +WRK (10), 1 = +SLD (20), 2 = +EXP (40)

    // Touch dragging state
    this.lastTouchX = null;
    this.lastTouchY = null;

    // Timers & Milestones
    this.time = 0;
    this.diffTimer = 0;
    this.predatorTimer = 10.0;
    this.foodSpawnTimer = 0;
    this.sfxThrottle = 0;
    this.shake = 0;

    // Milestones & Boss
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.victoryCelebrated = false;
    this.won = false;
    this.over = false;

    // Restore persistent career high
    if (typeof SAVE !== 'undefined' && SAVE.getScore) {
      const savedScore = SAVE.getScore(this.id);
      if (savedScore > 0) this.score = savedScore;
    }
  },

  // --------------------------------------------------------------------------
  // 3. PERSISTENCE (SAVE / LOAD)
  // --------------------------------------------------------------------------
  save() {
    return {
      bestHarvest: this.totalHarvested,
      bossDefeated: this.bossDefeated ? 1 : 0,
      nestLevel: this.nestLevel
    };
  },

  load(data) {
    if (!data) return;
    if (data.bossDefeated) this.bossDefeated = true;
  },

  // --------------------------------------------------------------------------
  // 4. ENTITY SPAWNERS & FACTORIES
  // --------------------------------------------------------------------------
  spawnAnt(caste) {
    const angle = Math.random() * Math.PI * 2;
    const isSoldier = (caste === 'soldier');
    this.ants.push({
      id: this.antIdSeq++,
      caste: caste,
      x: this.nestX + Math.cos(angle) * 4,
      y: this.nestY + Math.sin(angle) * 4,
      angle: angle,
      speed: isSoldier ? 30 : 38,
      turnSpeed: 4.5,
      hp: isSoldier ? 35 : 12,
      maxHp: isSoldier ? 35 : 12,
      damage: isSoldier ? 8 : 2,
      state: 'wander', // 'wander' | 'carry' | 'attack'
      foodVal: 0,
      foodType: null,
      targetEnemy: null,
      attackCooldown: 0,
      legPhase: Math.random() * Math.PI * 2
    });
  },

  spawnFood(type, x, y, crumbs) {
    const values = { sugar: 5, fruit: 5, seed: 8, meat: 15 };
    this.foods.push({
      x: x,
      y: y,
      type: type,
      crumbs: crumbs,
      maxCrumbs: crumbs,
      val: values[type] || 5
    });
  },

  addPredator(type) {
    // Spawn along the outer garden perimeter
    let px, py;
    const side = Math.floor(Math.random() * 4);
    if (side === 0) { px = 14 + Math.random() * 228; py = 24; }
    else if (side === 1) { px = 244; py = 26 + Math.random() * 180; }
    else if (side === 2) { px = 14 + Math.random() * 228; py = 206; }
    else { px = 12; py = 26 + Math.random() * 180; }

    if (type === 'boss') {
      px = 236;
      py = 32;
      this.predators.push({
        type: 'boss',
        x: px,
        y: py,
        vx: 0,
        vy: 0,
        speed: 13,
        hp: 140,
        maxHp: 140,
        damage: 16,
        r: 12,
        attackCooldown: 0,
        animTimer: 0
      });
    } else if (type === 'beetle') {
      this.predators.push({
        type: 'beetle',
        x: px,
        y: py,
        vx: 0,
        vy: 0,
        speed: 15,
        hp: 36,
        maxHp: 36,
        damage: 9,
        r: 5,
        attackCooldown: 0,
        animTimer: 0
      });
    } else {
      // Default: spider
      this.predators.push({
        type: 'spider',
        x: px,
        y: py,
        vx: 0,
        vy: 0,
        speed: 28,
        hp: 22,
        maxHp: 22,
        damage: 7,
        r: 4,
        attackCooldown: 0,
        animTimer: 0
      });
    }
  },

  // --------------------------------------------------------------------------
  // 5. PHEROMONE DIFFUSION & SENSORY SYSTEM
  // --------------------------------------------------------------------------
  addPhero(x, y, amount) {
    const gx = (x / this.CSZ) | 0;
    const gy = ((y - this.OY) / this.CSZ) | 0;
    if (gx >= 0 && gx < this.GW && gy >= 0 && gy < this.GH) {
      const idx = gy * this.GW + gx;
      this.phero[idx] = Math.min(100, this.phero[idx] + amount);
      // Gentle splat on orthogonal neighbors
      if (gx > 0) this.phero[idx - 1] = Math.min(100, this.phero[idx - 1] + amount * 0.3);
      if (gx < this.GW - 1) this.phero[idx + 1] = Math.min(100, this.phero[idx + 1] + amount * 0.3);
      if (gy > 0) this.phero[idx - this.GW] = Math.min(100, this.phero[idx - this.GW] + amount * 0.3);
      if (gy < this.GH - 1) this.phero[idx + this.GW] = Math.min(100, this.phero[idx + this.GW] + amount * 0.3);
    }
  },

  getPhero(x, y) {
    const gx = (x / this.CSZ) | 0;
    const gy = ((y - this.OY) / this.CSZ) | 0;
    if (gx >= 0 && gx < this.GW && gy >= 0 && gy < this.GH) {
      return this.phero[gy * this.GW + gx];
    }
    return 0;
  },

  // --------------------------------------------------------------------------
  // 6. ECONOMY & UPGRADE LOGIC
  // --------------------------------------------------------------------------
  buyWorker() {
    const cost = 10;
    if (this.ants.length >= this.maxAnts) {
      this.addFloatingText(this.nestX, this.nestY - 14, "MAX CAPACITY!", 2);
      if (typeof APU !== 'undefined') APU.sfx('DENY');
      return;
    }
    if (this.sugar < cost) {
      this.addFloatingText(this.nestX, this.nestY - 14, "NEED 10 SUGAR", 2);
      if (typeof APU !== 'undefined') APU.sfx('DENY');
      return;
    }
    this.sugar -= cost;
    this.spawnAnt('worker');
    this.addFloatingText(this.nestX, this.nestY - 14, "+WORKER!", 3);
    if (typeof APU !== 'undefined') APU.sfx('UI_OK');
    if (typeof SAVE !== 'undefined') SAVE.setScore(this.id, this.totalHarvested);
  },

  buySoldier() {
    const cost = 20;
    if (this.ants.length >= this.maxAnts) {
      this.addFloatingText(this.nestX, this.nestY - 14, "MAX CAPACITY!", 2);
      if (typeof APU !== 'undefined') APU.sfx('DENY');
      return;
    }
    if (this.sugar < cost) {
      this.addFloatingText(this.nestX, this.nestY - 14, "NEED 20 SUGAR", 2);
      if (typeof APU !== 'undefined') APU.sfx('DENY');
      return;
    }
    this.sugar -= cost;
    this.spawnAnt('soldier');
    this.addFloatingText(this.nestX, this.nestY - 14, "+SOLDIER!", 3);
    if (typeof APU !== 'undefined') APU.sfx('POWER');
    if (typeof SAVE !== 'undefined') SAVE.setScore(this.id, this.totalHarvested);
  },

  buyExpand() {
    const cost = 40;
    if (this.nestLevel >= 4) {
      this.addFloatingText(this.nestX, this.nestY - 14, "MAX NEST LEVEL", 2);
      if (typeof APU !== 'undefined') APU.sfx('DENY');
      return;
    }
    if (this.sugar < cost) {
      this.addFloatingText(this.nestX, this.nestY - 14, "NEED 40 SUGAR", 2);
      if (typeof APU !== 'undefined') APU.sfx('DENY');
      return;
    }
    this.sugar -= cost;
    this.nestLevel++;
    this.maxAnts += 10;
    this.queenHp = Math.min(100, this.queenHp + 30);
    this.nestRadius += 3;
    this.addFloatingText(this.nestX, this.nestY - 16, "NEST EXPANDED!", 3);
    if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
    if (typeof SAVE !== 'undefined') SAVE.setScore(this.id, this.totalHarvested);
  },

  addFloatingText(x, y, text, color = 3) {
    this.floatingTexts.push({ x: x, y: y, text: text, color: color, life: 1.2 });
  },

  addParticle(x, y, vx, vy, color = 3, life = 0.5) {
    if (this.particles.length > 70) return;
    this.particles.push({ x: x, y: y, vx: vx, vy: vy, color: color, life: life });
  },

  // --------------------------------------------------------------------------
  // 7. SIMULATION UPDATE (PHYSICS, AI, AUDIO, ERGONOMICS)
  // --------------------------------------------------------------------------
  update(dt) {
    // Safe dt clamp for high frame-rates, low-spec devices, and extreme difficulty
    dt = Math.min(dt, 0.08);
    this.time += dt;

    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 2.5);
    if (this.sfxThrottle > 0) this.sfxThrottle = Math.max(0, this.sfxThrottle - dt);

    // Restart game from Game Over or Victory screens
    if (this.over || (this.won && !this.victoryCelebrated)) {
      if (typeof PAD !== 'undefined' && (PAD.hit('a') || PAD.hit('start') || (PAD.tapPos && PAD.tapPos.y < 210))) {
        if (this.over) {
          this.init();
          return;
        } else {
          this.victoryCelebrated = true; // Dismiss banner, continue sandbox play
        }
      }
    }

    // --- MOBILE TOUCH CONTROLS ---
    if (typeof PAD !== 'undefined' && PAD.pointer && PAD.pointer.down) {
      const tx = PAD.pointer.x;
      const ty = PAD.pointer.y;

      if (ty >= 22 && ty <= 210) {
        // Direct finger trail drawing across garden!
        if (this.lastTouchX !== null) {
          const dist = Math.hypot(tx - this.lastTouchX, ty - this.lastTouchY);
          const steps = Math.max(1, Math.ceil(dist / 3));
          for (let s = 0; s <= steps; s++) {
            const ix = this.lastTouchX + (tx - this.lastTouchX) * (s / steps);
            const iy = this.lastTouchY + (ty - this.lastTouchY) * (s / steps);
            this.addPhero(ix, iy, 75);
          }
        } else {
          this.addPhero(tx, ty, 75);
        }
        this.lastTouchX = tx;
        this.lastTouchY = ty;

        // Sparkle particles & subtle audio tick
        this.addParticle(tx + (Math.random() - 0.5) * 4, ty + (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 8, -4, 3, 0.3);
        if (this.sfxThrottle <= 0 && typeof APU !== 'undefined') {
          APU.sfx('TICK');
          this.sfxThrottle = 0.08;
        }
      }
    } else {
      this.lastTouchX = null;
      this.lastTouchY = null;
    }

    // Touch tap on HUD buttons (bottom bar: y 214..238)
    if (typeof PAD !== 'undefined' && PAD.tapPos) {
      const tap = PAD.tapPos;
      if (tap.y >= 212 && tap.y <= 238) {
        if (tap.x >= 6 && tap.x <= 82) {
          this.selectedAction = 0;
          this.buyWorker();
        } else if (tap.x >= 88 && tap.x <= 166) {
          this.selectedAction = 1;
          this.buySoldier();
        } else if (tap.x >= 172 && tap.x <= 250) {
          this.selectedAction = 2;
          this.buyExpand();
        }
      }
    }

    // --- GAMEPAD & KEYBOARD CONTROLS ---
    if (typeof PAD !== 'undefined') {
      const cursorSpeed = 95;
      let mx = 0, my = 0;
      if (PAD.held('left')) mx -= 1;
      if (PAD.held('right')) mx += 1;
      if (PAD.held('up')) my -= 1;
      if (PAD.held('down')) my += 1;

      if (mx !== 0 || my !== 0) {
        const len = Math.hypot(mx, my);
        this.cx = Math.max(12, Math.min(244, this.cx + (mx / len) * cursorSpeed * dt));
        this.cy = Math.max(26, Math.min(206, this.cy + (my / len) * cursorSpeed * dt));
      }

      // [A] Held: Paint rich glowing pheromone trail with cursor
      if (PAD.held('a')) {
        this.addPhero(this.cx, this.cy, 65 * dt * 5);
        this.addParticle(this.cx, this.cy, (Math.random() - 0.5) * 6, -3, 3, 0.35);
        if (this.sfxThrottle <= 0 && typeof APU !== 'undefined') {
          APU.sfx('TICK');
          this.sfxThrottle = 0.09;
        }
      }

      // [SELECT]: Cycle selected purchase action
      if (PAD.hit('select')) {
        this.selectedAction = (this.selectedAction + 1) % 3;
        if (typeof APU !== 'undefined') APU.sfx('UI_MOVE');
      }

      // [B]: Execute currently selected purchase action
      if (PAD.hit('b')) {
        if (this.selectedAction === 0) this.buyWorker();
        else if (this.selectedAction === 1) this.buySoldier();
        else if (this.selectedAction === 2) this.buyExpand();
      }
    }

    // --- PHEROMONE EVAPORATION & DIFFUSION ---
    const decay = Math.max(0, 1 - 0.09 * dt);
    for (let i = 0; i < this.pheroTotal; i++) {
      if (this.phero[i] > 0) {
        this.phero[i] *= decay;
        if (this.phero[i] < 0.4) this.phero[i] = 0;
      }
    }

    this.diffTimer += dt;
    if (this.diffTimer >= 0.14) {
      this.diffTimer = 0;
      // High-performance Stigmergic blur
      for (let gy = 1; gy < this.GH - 1; gy += 2) {
        for (let gx = 1; gx < this.GW - 1; gx += 2) {
          const idx = gy * this.GW + gx;
          if (this.phero[idx] > 3) {
            const spread = this.phero[idx] * 0.12;
            this.phero[idx] -= spread;
            this.phero[idx - 1] += spread * 0.25;
            this.phero[idx + 1] += spread * 0.25;
            this.phero[idx - this.GW] += spread * 0.25;
            this.phero[idx + this.GW] += spread * 0.25;
          }
        }
      }
    }

    // --- ANTS AI & MOVEMENT ---
    for (let i = this.ants.length - 1; i >= 0; i--) {
      const ant = this.ants[i];
      ant.legPhase += dt * (ant.speed * 0.35);

      if (ant.caste === 'worker') {
        // --- WORKER BEHAVIOR ---
        if (ant.state === 'wander') {
          // 1. Sniff food clumps nearby
          let closestFood = null;
          let minFoodDist = 18; // Direct sensory radius
          for (let f of this.foods) {
            if (f.crumbs <= 0) continue;
            const dist = Math.hypot(f.x - ant.x, f.y - ant.y);
            if (dist < minFoodDist) {
              minFoodDist = dist;
              closestFood = f;
            }
          }

          if (closestFood) {
            // Turn toward food
            const targetAngle = Math.atan2(closestFood.y - ant.y, closestFood.x - ant.x);
            let diff = targetAngle - ant.angle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            ant.angle += Math.sign(diff) * Math.min(Math.abs(diff), ant.turnSpeed * dt * 2.5);

            // Harvest crumb if reached
            if (minFoodDist < 6) {
              closestFood.crumbs--;
              ant.state = 'carry';
              ant.foodType = closestFood.type;
              ant.foodVal = closestFood.val;
              ant.angle += Math.PI; // Flip around toward nest
              this.addParticle(closestFood.x, closestFood.y, 0, -5, 3, 0.4);
              if (typeof APU !== 'undefined') APU.sfx('TICK');
            }
          } else {
            // 2. Sample 3 forward pheromone sensory cones (ahead, left 35°, right 35°)
            const sensorDist = 9;
            const cos = Math.cos(ant.angle);
            const sin = Math.sin(ant.angle);
            const cosL = Math.cos(ant.angle - 0.6);
            const sinL = Math.sin(ant.angle - 0.6);
            const cosR = Math.cos(ant.angle + 0.6);
            const sinR = Math.sin(ant.angle + 0.6);

            const pC = this.getPhero(ant.x + cos * sensorDist, ant.y + sin * sensorDist);
            const pL = this.getPhero(ant.x + cosL * sensorDist, ant.y + sinL * sensorDist);
            const pR = this.getPhero(ant.x + cosR * sensorDist, ant.y + sinR * sensorDist);

            if (pC > pL && pC > pR && pC > 2) {
              // Path straight ahead is strongest
            } else if (pL > pR && pL > 2) {
              ant.angle -= ant.turnSpeed * dt;
            } else if (pR > pL && pR > 2) {
              ant.angle += ant.turnSpeed * dt;
            } else {
              // Gentle organic wander
              ant.angle += (Math.random() - 0.5) * 2.2 * dt;
            }
          }
        } else if (ant.state === 'carry') {
          // --- CARRYING FOOD BACK TO NEST ---
          // Deposit rich returning food pheromone trail!
          this.addPhero(ant.x, ant.y, 35 * dt * 4);

          // Head directly toward nest entrance
          const targetAngle = Math.atan2(this.nestY - ant.y, this.nestX - ant.x);
          let diff = targetAngle - ant.angle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          ant.angle += Math.sign(diff) * Math.min(Math.abs(diff), ant.turnSpeed * dt * 2.0);

          // Deliver to Queen inside nest
          const nestDist = Math.hypot(this.nestX - ant.x, this.nestY - ant.y);
          if (nestDist < this.nestRadius - 3) {
            ant.state = 'wander';
            this.sugar += ant.foodVal;
            this.totalHarvested += ant.foodVal;
            this.score += ant.foodVal * 10;
            this.addFloatingText(this.nestX, this.nestY - 10, "+" + ant.foodVal + " SUGAR", 3);
            this.addParticle(this.nestX, this.nestY, 0, -8, 3, 0.5);
            if (typeof APU !== 'undefined') APU.sfx('COIN');
            if (typeof SAVE !== 'undefined') SAVE.setScore(this.id, this.totalHarvested);
            ant.angle += Math.PI + (Math.random() - 0.5) * 0.8;
          }
        }
      } else if (ant.caste === 'soldier') {
        // --- SOLDIER BEHAVIOR ---
        // Scan for nearest invading predator within alert perimeter (65px)
        let threat = null;
        let minThreatDist = 70;
        for (let p of this.predators) {
          const dist = Math.hypot(p.x - ant.x, p.y - ant.y);
          if (dist < minThreatDist) {
            minThreatDist = dist;
            threat = p;
          }
        }

        if (threat) {
          // Lock on and swarm!
          const targetAngle = Math.atan2(threat.y - ant.y, threat.x - ant.x);
          ant.angle = targetAngle;
          ant.speed = 34; // Charge speed

          if (minThreatDist < 10) {
            // Mandible bite attack!
            ant.attackCooldown -= dt;
            if (ant.attackCooldown <= 0) {
              ant.attackCooldown = 0.35;
              threat.hp -= ant.damage;
              this.addParticle(threat.x, threat.y, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, 3, 0.3);
              if (typeof APU !== 'undefined') APU.sfx('HIT');
            }
          }
        } else {
          // Patrol perimeter around nest
          const nestDist = Math.hypot(ant.x - this.nestX, ant.y - this.nestY);
          if (nestDist < 30) {
            ant.angle += (Math.random() - 0.5) * 2 * dt;
          } else if (nestDist > 85) {
            ant.angle = Math.atan2(this.nestY - ant.y, this.nestX - ant.x);
          } else {
            // Orbiting patrol angle
            ant.angle += 1.5 * dt;
          }
          ant.speed = 28;
        }
      }

      // Step physics
      ant.x += Math.cos(ant.angle) * ant.speed * dt;
      ant.y += Math.sin(ant.angle) * ant.speed * dt;

      // Arena boundary collision: smooth bounce inward
      if (ant.x < 10) { ant.x = 10; ant.angle = Math.PI - ant.angle; }
      if (ant.x > 246) { ant.x = 246; ant.angle = Math.PI - ant.angle; }
      if (ant.y < 24) { ant.y = 24; ant.angle = -ant.angle; }
      if (ant.y > 208) { ant.y = 208; ant.angle = -ant.angle; }

      // Ant death check
      if (ant.hp <= 0) {
        if (ant.foodVal > 0) {
          // Drop carried crumb
          this.spawnFood('sugar', ant.x, ant.y, 1);
        }
        this.addParticle(ant.x, ant.y, 0, 0, 1, 0.6);
        this.ants.splice(i, 1);
      }
    }

    // --- PREDATORS UPDATE (SPIDERS, BEETLES, BROOD SPIDER BOSS) ---
    for (let i = this.predators.length - 1; i >= 0; i--) {
      const pred = this.predators[i];
      pred.animTimer = (pred.animTimer || 0) + dt;

      // Target selection
      let targetX = this.nestX;
      let targetY = this.nestY;

      if (pred.type === 'spider') {
        // Spiders hunt lone worker ants
        let closestWorker = null;
        let minDist = 75;
        for (let a of this.ants) {
          if (a.caste === 'worker') {
            const d = Math.hypot(a.x - pred.x, a.y - pred.y);
            if (d < minDist) { minDist = d; closestWorker = a; }
          }
        }
        if (closestWorker) {
          targetX = closestWorker.x;
          targetY = closestWorker.y;
          // Attack worker
          if (minDist < 8) {
            pred.attackCooldown -= dt;
            if (pred.attackCooldown <= 0) {
              pred.attackCooldown = 0.5;
              closestWorker.hp -= pred.damage;
              if (typeof APU !== 'undefined') APU.sfx('HURT');
            }
          }
        }
      } else {
        // Beetles & Boss march inexorably toward the nest
        const nestDist = Math.hypot(this.nestX - pred.x, this.nestY - pred.y);
        if (nestDist < this.nestRadius + 4) {
          // Attacking the Queen's Mound!
          this.queenHp -= (pred.type === 'boss' ? 14 : 6) * dt;
          this.shake = 0.35;
          if (this.sfxThrottle <= 0 && typeof APU !== 'undefined') {
            APU.sfx('ALARM');
            this.sfxThrottle = 0.3;
          }
        }
      }

      // Move toward target
      const ang = Math.atan2(targetY - pred.y, targetX - pred.x);
      pred.x += Math.cos(ang) * pred.speed * dt;
      pred.y += Math.sin(ang) * pred.speed * dt;

      // Predator Defeated check
      if (pred.hp <= 0) {
        this.predators.splice(i, 1);
        if (pred.type === 'boss') {
          // BOSS SLAIN!
          this.bossDefeated = true;
          this.addFloatingText(this.nestX, 60, "★ BROOD SPIDER SLAIN! ★", 3);
          this.score += 2000;
          this.shake = 0.8;
          if (typeof APU !== 'undefined') {
            APU.sfx('BOOM');
            APU.sfx('LEVELUP');
          }
          // Spawns 4 massive Meat Chunks for the victorious colony!
          for (let k = 0; k < 4; k++) {
            this.spawnFood('meat', pred.x + (Math.random() - 0.5) * 20, pred.y + (Math.random() - 0.5) * 20, 3);
          }
        } else {
          // Standard bug slain
          this.addFloatingText(pred.x, pred.y - 6, "+MEAT!", 3);
          if (typeof APU !== 'undefined') APU.sfx('SPLASH');
          this.spawnFood('meat', pred.x, pred.y, 2);
          this.score += 150;
        }
      }
    }

    // --- PREDATOR INVASIONS & BOSS SPAWNING ---
    this.predatorTimer -= dt;
    if (this.predatorTimer <= 0) {
      this.predatorTimer = 16.0 + Math.random() * 8.0;
      // Spawn beetle or spider
      this.addPredator(Math.random() < 0.4 ? 'beetle' : 'spider');
    }

    // Boss trigger: once colony harvests 150+ sugar
    if (this.totalHarvested >= 150 && !this.bossSpawned) {
      this.bossSpawned = true;
      this.addPredator('boss');
      this.shake = 0.6;
      this.addFloatingText(this.nestX, 50, "⚠ BROOD SPIDER EMERGES! ⚠", 3);
      if (typeof APU !== 'undefined') APU.sfx('ALARM');
    }

    // --- FOOD CLEANUP & RESUPPLY ---
    for (let i = this.foods.length - 1; i >= 0; i--) {
      if (this.foods[i].crumbs <= 0) this.foods.splice(i, 1);
    }

    if (this.foods.length < 3) {
      this.foodSpawnTimer += dt;
      if (this.foodSpawnTimer >= 4.0) {
        this.foodSpawnTimer = 0;
        const fx = 25 + Math.random() * 206;
        const fy = 35 + Math.random() * 160;
        if (Math.hypot(fx - this.nestX, fy - this.nestY) > 40) {
          const rand = Math.random();
          if (rand < 0.5) this.spawnFood('sugar', fx, fy, 5);
          else if (rand < 0.8) this.spawnFood('fruit', fx, fy, 12);
          else this.spawnFood('seed', fx, fy, 6);
          this.addFloatingText(fx, fy - 8, "FOOD!", 2);
        }
      }
    }

    // --- EMERGENCY WORKER RESCUE (ANTI-SOFTLOCK) ---
    if (this.ants.length === 0 && this.sugar < 10) {
      this.emergencyTimer += dt;
      if (this.emergencyTimer >= 4.0) {
        this.emergencyTimer = 0;
        this.spawnAnt('worker');
        this.addFloatingText(this.nestX, this.nestY - 14, "QUEEN HATCHED EMERGENCY EGG!", 3);
        if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
      }
    } else {
      this.emergencyTimer = 0;
    }

    // --- QUEEN HEALTH & GAME OVER ---
    if (this.queenHp <= 0) {
      this.queenHp = 0;
      if (!this.over) {
        this.over = true;
        if (typeof APU !== 'undefined') APU.sfx('BOOM');
        if (typeof SAVE !== 'undefined') SAVE.setScore(this.id, this.totalHarvested);
      }
    }

    // --- VICTORY MILESTONE CHECK ---
    // Goal: 300+ Sugar harvested, 35+ colony ants, and Brood Spider defeated!
    if (!this.won && this.totalHarvested >= 300 && this.ants.length >= 35 && this.bossDefeated) {
      this.won = true;
      this.score += 3000;
      if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
      if (typeof SAVE !== 'undefined') SAVE.setScore(this.id, this.totalHarvested);
    }

    // --- PARTICLES & SPORES DRIFT ---
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let s of this.spores) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.x > 250) s.x = 8;
      if (s.y > 210) s.y = 22;
      if (s.x < 8) s.x = 250;
      if (s.y < 22) s.y = 210;
    }

    // Floating text updates
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y -= 11 * dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  },

  // --------------------------------------------------------------------------
  // 8. GRAPHICS & CRT PHOSPHOR RENDERING
  // --------------------------------------------------------------------------
  render(g) {
    // Screen shake
    const shkX = this.shake > 0 ? Math.floor((Math.random() - 0.5) * 4 * this.shake) : 0;
    const shkY = this.shake > 0 ? Math.floor((Math.random() - 0.5) * 4 * this.shake) : 0;

    g.clear(0);

    // Garden arena boundaries
    g.box(shkX + 4, shkY + 20, 248, 192, 1);
    g.line(shkX + 4, shkY + 20, shkX + 251, shkY + 20, 2);
    g.line(shkX + 4, shkY + 211, shkX + 251, shkY + 211, 2);

    // Decorative corner moss/grass sprigs
    g.line(shkX + 6, shkY + 22, shkX + 12, shkY + 27, 1);
    g.line(shkX + 248, shkY + 22, shkX + 242, shkY + 28, 1);
    g.line(shkX + 7, shkY + 208, shkX + 13, shkY + 202, 1);
    g.line(shkX + 247, shkY + 208, shkX + 241, shkY + 202, 1);

    // Ambient spores floating in garden
    for (let s of this.spores) {
      g.px(Math.floor(shkX + s.x), Math.floor(shkY + s.y), 1);
    }

    // --- GLOWING PHOSPHOR PHEROMONE TRAILS ---
    for (let gy = 0; gy < this.GH; gy++) {
      const row = gy * this.GW;
      const sy = shkY + this.OY + gy * this.CSZ;
      for (let gx = 0; gx < this.GW; gx++) {
        const val = this.phero[row + gx];
        if (val > 3) {
          const sx = shkX + gx * this.CSZ;
          if (val > 55) {
            g.rect(sx + 1, sy + 1, 2, 2, 3);
          } else if (val > 22) {
            g.px(sx + 1, sy + 1, 2);
          } else {
            g.px(sx + 1, sy + 1, 1);
          }
        }
      }
    }

    // --- FOOD DEPOSITS ---
    for (let f of this.foods) {
      const fx = Math.floor(shkX + f.x);
      const fy = Math.floor(shkY + f.y);

      if (f.type === 'sugar') {
        // Sugar crystals
        g.rect(fx - 2, fy - 2, 5, 5, 2);
        g.rect(fx - 1, fy - 1, 3, 3, 3);
        g.px(fx + 2, fy - 3, 3);
        g.px(fx - 3, fy + 2, 3);
        g.text(String(f.crumbs), fx + 5, fy - 3, 3);
      } else if (f.type === 'fruit') {
        // Watermelon slice
        g.disc(fx, fy, 6, 2);
        g.disc(fx, fy, 4, 3);
        g.px(fx - 1, fy - 1, 0);
        g.px(fx + 1, fy + 1, 0);
        g.text(String(f.crumbs), fx + 6, fy - 4, 3);
      } else if (f.type === 'seed') {
        // Seed deposit
        g.disc(fx, fy, 4, 1);
        g.box(fx - 3, fy - 3, 7, 7, 2);
        g.px(fx, fy, 3);
        g.text(String(f.crumbs), fx + 5, fy - 3, 2);
      } else if (f.type === 'meat') {
        // Meat chunks from fallen bugs
        g.disc(fx, fy, 5, 2);
        g.rect(fx - 2, fy - 2, 4, 4, 1);
        g.px(fx - 1, fy - 1, 3);
        g.text(String(f.crumbs), fx + 6, fy - 3, 3);
      }
    }

    // --- NEST MOUND & QUEEN'S CHAMBER ---
    const nx = Math.floor(shkX + this.nestX);
    const ny = Math.floor(shkY + this.nestY);

    // Textured mound rings
    g.circle(nx, ny, this.nestRadius, 1);
    g.disc(nx, ny, this.nestRadius - 2, 1);
    g.disc(nx, ny, this.nestRadius - 5, 2);
    // Tunnel entrance
    g.disc(nx, ny, 7, 0);

    // Majestic Queen Ant residing in royal chamber
    const qPulse = Math.sin(this.time * 3);
    // Abdomen
    g.disc(nx, ny + 2, 4 + (qPulse > 0 ? 1 : 0), 2);
    g.line(nx - 2, ny + 1, nx + 2, ny + 1, 3);
    g.line(nx - 3, ny + 3, nx + 3, ny + 3, 1);
    // Royal Thorax & Crown
    g.rect(nx - 1, ny - 3, 3, 3, 2);
    g.disc(nx, ny - 5, 2, 3);
    g.px(nx - 2, ny - 7, 3);
    g.px(nx, ny - 8, 3);
    g.px(nx + 2, ny - 7, 3);

    // Queen HP Bar (above nest)
    g.rect(nx - 14, ny - this.nestRadius - 6, 28, 3, 0);
    g.box(nx - 14, ny - this.nestRadius - 6, 28, 3, 2);
    const qHpW = Math.max(0, Math.floor(26 * (this.queenHp / this.maxQueenHp)));
    g.rect(nx - 13, ny - this.nestRadius - 5, qHpW, 1, 3);

    // --- ANTS (WORKERS & SOLDIERS) ---
    for (let a of this.ants) {
      this.drawAnt(g, a, shkX, shkY);
    }

    // --- INVADING PREDATORS ---
    for (let p of this.predators) {
      this.drawPredator(g, p, shkX, shkY);
    }

    // --- PARTICLES ---
    for (let p of this.particles) {
      g.px(Math.floor(shkX + p.x), Math.floor(shkY + p.y), p.color);
    }

    // --- GAMEPAD RETICLE SCENT CURSOR ---
    if (typeof PAD !== 'undefined') {
      const kx = Math.floor(shkX + this.cx);
      const ky = Math.floor(shkY + this.cy);
      g.circle(kx, ky, 4, 3);
      g.px(kx, ky, 3);
      g.px(kx - 6, ky, 2);
      g.px(kx + 6, ky, 2);
      g.px(kx, ky - 6, 2);
      g.px(kx, ky + 6, 2);
    }

    // --- FLOATING FEEDBACK TEXTS ---
    for (let ft of this.floatingTexts) {
      const tx = Math.floor(shkX + ft.x - (ft.text.length * 5) / 2);
      g.text(ft.text, tx, Math.floor(shkY + ft.y), ft.color);
    }

    // --- TOP STATUS BAR (y: 0..20) ---
    g.dither(0, 0, 256, 20, 0, 1);
    g.line(0, 20, 256, 20, 2);

    let workerCount = 0, soldierCount = 0;
    for (let a of this.ants) {
      if (a.caste === 'soldier') soldierCount++;
      else workerCount++;
    }

    g.text("SUG:" + this.sugar, 6, 3, 3);
    g.text("COLONY:" + this.ants.length + "/" + this.maxAnts, 64, 3, 2);
    g.text("WRK:" + workerCount, 154, 3, 2);
    g.text("SLD:" + soldierCount, 196, 3, 2);

    g.text("SCORE:" + this.score, 6, 11, 2);
    g.text("HARVEST:" + this.totalHarvested, 102, 11, 3);
    if (this.bossSpawned && !this.bossDefeated) {
      g.text("⚠ BROOD SPIDER!", 180, 11, 3);
    } else if (this.bossDefeated) {
      g.text("★ BOSS SLAIN!", 184, 11, 3);
    }

    // --- BOTTOM HUD & INTERACTIVE ACTION BUTTONS (y: 212..240) ---
    g.dither(0, 212, 256, 28, 0, 1);
    g.line(0, 212, 256, 212, 2);

    // Button 1: [+WRK (10)]
    const b1Active = (this.selectedAction === 0);
    g.rect(6, 215, 76, 17, b1Active ? 2 : 0);
    g.box(6, 215, 76, 17, b1Active ? 3 : 2);
    g.text("+WRK (10)", 10, 220, b1Active ? 3 : 2);

    // Button 2: [+SLD (20)]
    const b2Active = (this.selectedAction === 1);
    g.rect(88, 215, 78, 17, b2Active ? 2 : 0);
    g.box(88, 215, 78, 17, b2Active ? 3 : 2);
    g.text("+SLD (20)", 92, 220, b2Active ? 3 : 2);

    // Button 3: [+EXP (40)]
    const b3Active = (this.selectedAction === 2);
    g.rect(172, 215, 78, 17, b3Active ? 2 : 0);
    g.box(172, 215, 78, 17, b3Active ? 3 : 2);
    g.text("+EXP (40)", 176, 220, b3Active ? 3 : 2);

    g.textC("[A/DRAG] PAINT SCENT  [B] BUY  [SEL] CHOOSE", 233, 2);

    // --- OVERLAYS: GAME OVER & VICTORY ---
    if (this.over) {
      g.rect(32, 70, 192, 85, 0);
      g.box(32, 70, 192, 85, 3);
      g.textC("COLONY COLLAPSE!", 82, 3);
      g.textC("THE QUEEN HAS PERISHED", 98, 2);
      g.textC("TOTAL HARVEST: " + this.totalHarvested + " SUGAR", 114, 3);
      g.textC("PRESS [A] OR TAP TO REBUILD", 132, 2);
    } else if (this.won && !this.victoryCelebrated) {
      g.rect(24, 60, 208, 95, 0);
      g.box(24, 60, 208, 95, 3);
      g.textC("★ COLONY SUPREMACY! ★", 72, 3);
      g.textC("BROOD SPIDER SLAIN & COLONY FLOURISHES!", 88, 2);
      g.textC("SUGAR HARVESTED: " + this.totalHarvested, 104, 3);
      g.textC("FINAL SCORE: " + this.score, 118, 3);
      g.textC("PRESS [A] OR TAP TO KEEP PLAYING", 134, 2);
    }
  },

  // --------------------------------------------------------------------------
  // 9. ARTICULATED SPRITE DRAWING HELPERS
  // --------------------------------------------------------------------------
  drawAnt(g, ant, ox, oy) {
    const ax = Math.floor(ox + ant.x);
    const ay = Math.floor(oy + ant.y);
    const th = ant.angle;
    const cos = Math.cos(th);
    const sin = Math.sin(th);

    if (ant.caste === 'worker') {
      // 6px articulated worker ant
      // Abdomen (rear)
      const rx = Math.floor(ax - cos * 3);
      const ry = Math.floor(ay - sin * 3);
      g.px(rx, ry, 2);
      g.px(rx - (sin > 0 ? 1 : 0), ry + (cos > 0 ? 1 : 0), 1);

      // Thorax (center)
      g.px(ax, ay, 2);

      // Head (front)
      const hx = Math.floor(ax + cos * 3);
      const hy = Math.floor(ay + sin * 3);
      g.px(hx, hy, 3);

      // Antennae
      g.px(Math.floor(hx + cos * 2 - sin * 1), Math.floor(hy + sin * 2 + cos * 1), 3);
      g.px(Math.floor(hx + cos * 2 + sin * 1), Math.floor(hy + sin * 2 - cos * 1), 3);

      // 6 jointed animated walking legs
      const legPhase = ant.legPhase;
      for (let i = -1; i <= 1; i++) {
        const legWave = Math.sin(legPhase + i * 1.5) * 2;
        const lx1 = Math.floor(ax + cos * i * 2 + sin * (3 + legWave));
        const ly1 = Math.floor(ay + sin * i * 2 - cos * (3 + legWave));
        const lx2 = Math.floor(ax + cos * i * 2 - sin * (3 - legWave));
        const ly2 = Math.floor(ay + sin * i * 2 + cos * (3 - legWave));
        g.px(lx1, ly1, 1);
        g.px(lx2, ly2, 1);
      }

      // Carried sugar crystal in mandibles
      if (ant.state === 'carry') {
        const fx = Math.floor(hx + cos * 2);
        const fy = Math.floor(hy + sin * 2);
        const c = (ant.foodType === 'meat') ? 2 : 3;
        g.px(fx, fy, c);
        g.px(fx + 1, fy, 3);
        g.px(fx, fy + 1, 3);
      }
    } else if (ant.caste === 'soldier') {
      // 9px armored soldier ant with formidable mandibles
      const rx = Math.floor(ax - cos * 5);
      const ry = Math.floor(ay - sin * 5);
      g.disc(rx, ry, 2, 2);
      g.px(rx, ry, 1);

      // Thorax
      g.rect(ax - 1, ay - 1, 2, 2, 2);

      // Large head
      const hx = Math.floor(ax + cos * 4);
      const hy = Math.floor(ay + sin * 4);
      g.disc(hx, hy, 2, 3);

      // Sharp mandibles
      const mx1 = Math.floor(hx + cos * 3 - sin * 2);
      const my1 = Math.floor(hy + sin * 3 + cos * 2);
      const mx2 = Math.floor(hx + cos * 3 + sin * 2);
      const my2 = Math.floor(hy + sin * 3 - cos * 2);
      g.px(mx1, my1, 3);
      g.px(mx2, my2, 3);

      // Heavy legs
      const legPhase = ant.legPhase;
      for (let i = -1; i <= 1; i++) {
        const legWave = Math.sin(legPhase + i * 1.5) * 2.5;
        const lx1 = Math.floor(ax + cos * i * 3 + sin * (4 + legWave));
        const ly1 = Math.floor(ay + sin * i * 3 - cos * (4 + legWave));
        const lx2 = Math.floor(ax + cos * i * 3 - sin * (4 - legWave));
        const ly2 = Math.floor(ay + sin * i * 3 + cos * (4 - legWave));
        g.line(ax, ay, lx1, ly1, 2);
        g.line(ax, ay, lx2, ly2, 2);
      }
    }
  },

  drawPredator(g, p, ox, oy) {
    const px = Math.floor(ox + p.x);
    const py = Math.floor(oy + p.y);

    if (p.type === 'spider') {
      // 8-legged garden spider
      g.disc(px, py, 3, 1);
      g.disc(px, py, 2, 2);
      g.px(px, py - 1, 3);
      // Fangs
      g.px(px - 1, py - 3, 3);
      g.px(px + 1, py - 3, 3);
      // Jointed creeping legs
      const t = p.animTimer || 0;
      for (let k = 0; k < 4; k++) {
        const ang = (k / 4) * Math.PI - Math.PI / 2;
        const wave = Math.sin(t * 8 + k * 1.5) * 2;
        g.line(px, py, Math.floor(px + Math.cos(ang) * (6 + wave)), Math.floor(py + Math.sin(ang) * (6 + wave)), 2);
        g.line(px, py, Math.floor(px - Math.cos(ang) * (6 + wave)), Math.floor(py + Math.sin(ang) * (6 + wave)), 2);
      }
    } else if (p.type === 'beetle') {
      // Armored beetle
      g.disc(px, py, 4, 1);
      g.box(px - 4, py - 4, 9, 9, 2);
      g.line(px, py - 4, px, py + 4, 0); // Wing casing
      g.px(px - 2, py - 5, 3);
      g.px(px + 2, py - 5, 3);
    } else if (p.type === 'boss') {
      // Giant 24x24 Brood Spider Boss
      const pulse = Math.sin(this.time * 4) > 0 ? 3 : 2;
      g.disc(px, py + 4, 8, 1);
      g.disc(px, py + 4, 6, 2);
      // Chitin skull pattern
      g.px(px - 2, py + 2, 3);
      g.px(px + 2, py + 2, 3);
      g.px(px, py + 4, 3);
      g.px(px - 1, py + 6, 3);
      g.px(px + 1, py + 6, 3);

      // Head & multiple eyes
      g.disc(px, py - 5, 5, 2);
      g.px(px - 2, py - 6, 3);
      g.px(px, py - 7, 3);
      g.px(px + 2, py - 6, 3);

      // Venom fangs
      g.line(px - 3, py - 8, px - 2, py - 11, pulse);
      g.line(px + 3, py - 8, px + 2, py - 11, pulse);

      // 8 massive animated spiky legs
      const t = this.time * 5;
      for (let k = 0; k < 4; k++) {
        const legWave = Math.sin(t + k * 1.4) * 4;
        const angleL = -Math.PI * 0.2 - (k * 0.25);
        const angleR = -Math.PI * 0.8 + (k * 0.25);

        const jxL = Math.floor(px - 6 + Math.cos(angleL) * (8 + legWave));
        const jyL = Math.floor(py + Math.sin(angleL) * (8 + legWave));
        g.line(px - 3, py, jxL, jyL, 2);
        g.line(jxL, jyL, Math.floor(jxL - 6), Math.floor(jyL + 6), 3);

        const jxR = Math.floor(px + 6 - Math.cos(angleR) * (8 + legWave));
        const jyR = Math.floor(py + Math.sin(angleR) * (8 + legWave));
        g.line(px + 3, py, jxR, jyR, 2);
        g.line(jxR, jyR, Math.floor(jxR + 6), Math.floor(jyR + 6), 3);
      }

      // Boss Health Bar
      g.rect(px - 16, py - 17, 32, 4, 0);
      g.box(px - 16, py - 17, 32, 4, 2);
      const hpW = Math.max(0, Math.floor(30 * (p.hp / p.maxHp)));
      g.rect(px - 15, py - 16, hpW, 2, 3);
    }
  }
};
