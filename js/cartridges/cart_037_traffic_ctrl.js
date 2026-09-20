// js/cartridges/cart_037_traffic_ctrl.js
// ============================================================================
// Cartridge #037: TRAFFIC CTRL
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[37] = {
  id: 37,
  name: "TRAFFIC CTRL",
  genre: 3,
  scoreLabel: "CARS",
  desc: "[A] SWITCH LIGHTS. MANAGE BUSY INTERSECTION WITHOUT ANY VEHICLE CRASHES!",

  // 32x32 retro icon: Detailed crossroads with miniature sedan and traffic light
  icon(g, x, y) {
    // Ground base
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);

    // Sidewalk corners
    g.rect(x + 1, y + 1, 9, 9, 1);
    g.rect(x + 22, y + 1, 9, 9, 1);
    g.rect(x + 1, y + 22, 9, 9, 1);
    g.rect(x + 22, y + 22, 9, 9, 1);

    // Asphalt roads
    g.rect(x + 10, y + 1, 12, 30, 1);
    g.rect(x + 1, y + 10, 30, 12, 1);

    // Lane dividing dashed lines
    g.line(x + 16, y + 2, x + 16, y + 7, 2);
    g.line(x + 16, y + 25, x + 16, y + 30, 2);
    g.line(x + 2, y + 16, x + 7, y + 16, 2);
    g.line(x + 25, y + 16, x + 30, y + 16, 2);

    // Zebra crosswalks
    g.line(x + 11, y + 9, x + 21, y + 9, 3);
    g.line(x + 11, y + 23, x + 21, y + 23, 3);
    g.line(x + 9, y + 11, x + 9, y + 21, 3);
    g.line(x + 23, y + 11, x + 23, y + 21, 3);

    // Miniature sedan in Eastbound lane (heading right)
    g.rect(x + 12, y + 18, 9, 4, 3);
    g.rect(x + 14, y + 17, 4, 2, 2);
    g.px(x + 20, y + 18, 3); // Headlight
    g.px(x + 12, y + 18, 1); // Taillight

    // Traffic signal post at Top-Left corner
    g.rect(x + 5, y + 4, 4, 5, 0);
    g.box(x + 5, y + 4, 4, 5, 2);
    g.px(x + 6, y + 5, 3); // Active green/lit signal
    g.px(x + 7, y + 5, 3);
  },

  init() {
    // 3-Phase Traffic Signal:
    // 'NS_GREEN' -> 'NS_YELLOW' -> 'ALL_RED_NS' -> 'EW_GREEN' -> 'EW_YELLOW' -> 'ALL_RED_EW' -> 'NS_GREEN'
    this.phase = 'NS_GREEN';
    this.phaseTimer = 0;
    this.yellowDuration = 1.0;
    this.allRedDuration = 0.25;

    this.cars = [];
    this.particles = [];
    this.floatingTexts = [];
    this.skidMarks = [];
    this.nearMissPairs = new Set();

    this.score = 0;
    this.nearMisses = 0;
    this.spawnTimer = 0.6;
    this.nextCarId = 1;

    this.over = false;
    this.overTimer = 0;
    this.crashPt = null;
    this.shake = 0;
    this.sirenCooldown = 0;

    this.highScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? (SAVE.getScore(this.id) || 0) : 0;
  },

  // Audio helper wrappers
  playTick() {
    if (typeof APU !== 'undefined') APU.sfx('TICK');
  },
  playCoin() {
    if (typeof APU !== 'undefined') APU.sfx('COIN');
  },
  playCrash() {
    if (typeof APU !== 'undefined') {
      APU.sfx('BOOM');
      APU.sfx('HURT');
    }
  },
  playHorn() {
    if (typeof APU !== 'undefined') {
      APU.tone(370, 0.12, 'triangle', 0.12);
      APU.tone(466, 0.12, 'triangle', 0.10);
    }
  },
  playTireSqueal() {
    if (typeof APU !== 'undefined') {
      APU.noise(0.14, 0.18, 1600, 'bandpass');
      APU.tone(880, 0.09, 'sine', 0.08, 1300);
    }
  },
  playSiren() {
    if (typeof APU !== 'undefined') {
      APU.softTone(740, 0.12, 'sine', 0.07, 0, 0.02, 1400);
      APU.softTone(980, 0.12, 'sine', 0.07, 0.10, 0.02, 1400);
    }
  },
  playNearMiss() {
    if (typeof APU !== 'undefined') {
      APU.softTone(1046.5, 0.07, 'sine', 0.08, 0, 0.01, 2000);
      APU.softTone(1318.5, 0.10, 'sine', 0.08, 0.04, 0.01, 2000);
    }
  },

  addFloatingText(x, y, text, color = 3) {
    this.floatingTexts.push({
      x, y, text, color,
      life: 0.9, maxLife: 0.9
    });
  },

  toggleLights() {
    if (this.over) return;
    if (this.phase === 'NS_GREEN') {
      this.phase = 'NS_YELLOW';
      this.phaseTimer = this.yellowDuration;
      this.playTick();
    } else if (this.phase === 'EW_GREEN') {
      this.phase = 'EW_YELLOW';
      this.phaseTimer = this.yellowDuration;
      this.playTick();
    }
  },

  boostCar(c) {
    if (!c || c.crashed) return;
    c.boosted = true;
    c.boostTimer = 1.4;
    c.speed = Math.max(c.speed, c.baseSpeed * 2.2);
    this.playTireSqueal();
    if (typeof PAD !== 'undefined') PAD.vibrate(25);

    // Spawn tire smoke and floating boost text
    this.addFloatingText(c.x, c.y - 10, "TURBO!", 3);
    for (let p = 0; p < 6; p++) {
      this.particles.push({
        x: c.x + (Math.random() - 0.5) * 6,
        y: c.y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        life: 0.35, maxLife: 0.35,
        type: 'smoke',
        color: 3, size: 2
      });
    }

    // Leave skid mark
    this.skidMarks.push({
      x: c.x, y: c.y,
      dir: c.dir,
      life: 3.5, maxLife: 3.5
    });
  },

  boostNearestQueuedCar() {
    if (this.over || this.cars.length === 0) return;

    // First priority: Lead car waiting at a red signal
    let candidates = this.cars.filter(c => !c.crashed && (c.isStopped || c.speed < 12));
    if (candidates.length > 0) {
      // Find candidate closest to intersection center (128, 120)
      candidates.sort((a, b) => {
        const da = Math.hypot(a.x - 128, a.y - 120);
        const db = Math.hypot(b.x - 128, b.y - 120);
        return da - db;
      });
      this.boostCar(candidates[0]);
      return;
    }

    // Second priority: Any car approaching the intersection
    let approaching = this.cars.filter(c => !c.crashed && !c.clearedBox);
    if (approaching.length > 0) {
      approaching.sort((a, b) => {
        const da = Math.hypot(a.x - 128, a.y - 120);
        const db = Math.hypot(b.x - 128, b.y - 120);
        return da - db;
      });
      this.boostCar(approaching[0]);
    }
  },

  spawnCar() {
    // 4 Incoming Lanes:
    // 'S': North -> South (down, x=118, enter y=-18, stopY=98, clearY=142)
    // 'N': South -> North (up, x=138, enter y=258, stopY=142, clearY=98)
    // 'E': West -> East (right, y=130, enter x=-18, stopX=106, clearX=150)
    // 'W': East -> West (left, y=110, enter x=274, stopX=150, clearX=106)
    const dirs = ['S', 'N', 'E', 'W'];
    const available = dirs.filter(d => {
      if (d === 'S') return !this.cars.some(c => c.dir === 'S' && c.y < 32);
      if (d === 'N') return !this.cars.some(c => c.dir === 'N' && c.y > 208);
      if (d === 'E') return !this.cars.some(c => c.dir === 'E' && c.x < 32);
      if (d === 'W') return !this.cars.some(c => c.dir === 'W' && c.x > 224);
      return true;
    });

    if (available.length === 0) return;
    const dir = available[Math.floor(Math.random() * available.length)];

    // Vehicle Class Archetypes:
    // 1. sedan (50%): balanced, normal speed
    // 2. coupe (22%): fast, zippy
    // 3. truck (18%): long chassis, slow, heavy clearance
    // 4. ambulance (10%): emergency strobe, priority siren, bonus pts
    const roll = Math.random();
    let type = 'sedan';
    let len = 14;
    let wid = 8;
    let baseSpeed = 58;
    let accel = 85;
    let decel = 150;

    if (roll < 0.22) {
      type = 'coupe';
      len = 13;
      wid = 8;
      baseSpeed = 88;
      accel = 130;
      decel = 170;
    } else if (roll < 0.40) {
      type = 'truck';
      len = 26;
      wid = 9;
      baseSpeed = 40;
      accel = 45;
      decel = 90;
    } else if (roll < 0.50) {
      type = 'ambulance';
      len = 16;
      wid = 9;
      baseSpeed = 74;
      accel = 110;
      decel = 160;
    }

    let x = 0, y = 0;
    if (dir === 'S') { x = 118; y = -len / 2 - 2; }
    else if (dir === 'N') { x = 138; y = 240 + len / 2 + 2; }
    else if (dir === 'E') { x = -len / 2 - 2; y = 130; }
    else if (dir === 'W') { x = 256 + len / 2 + 2; y = 110; }

    this.cars.push({
      id: this.nextCarId++,
      type,
      dir,
      x, y,
      len, wid,
      baseSpeed,
      speed: baseSpeed,
      accel, decel,
      boosted: false,
      boostTimer: 0,
      waitTime: 0,
      honkCooldown: 1.5,
      honkBubbleTimer: 0,
      isBraking: false,
      isStopped: false,
      inBox: false,
      clearedBox: false,
      crashed: false,
      spin: 0,
      angle: 0
    });
  },

  update(dt) {
    // Screen shake decay
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 2.2);
    }

    // Handle Game Over state
    if (this.over) {
      this.overTimer += dt;
      // Update lingering debris & smoke
      this.updateParticles(dt);

      if (this.overTimer > 0.45) {
        if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || PAD.tapPos) {
          this.init();
          APU.sfx('UI_OK');
        }
      }
      return;
    }

    // Player Controls (Gamepad / Keyboard)
    if (PAD.hit('a')) {
      this.toggleLights();
    }
    if (PAD.hit('b')) {
      this.boostNearestQueuedCar();
    }

    // Touch Controls: direct car tap or light switch
    if (PAD.tapPos) {
      const tx = PAD.tapPos.x;
      const ty = PAD.tapPos.y;

      // Check if tap hit any car
      const tappedCar = this.cars.find(c => {
        if (c.crashed) return false;
        return Math.hypot(c.x - tx, c.y - ty) < 18;
      });

      if (tappedCar) {
        this.boostCar(tappedCar);
      } else {
        // Tap elsewhere on intersection toggles signal
        this.toggleLights();
      }
    }

    // 3-Phase Signal State Machine
    if (this.phase === 'NS_YELLOW') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.phase = 'ALL_RED_NS';
        this.phaseTimer = this.allRedDuration;
      }
    } else if (this.phase === 'ALL_RED_NS') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.phase = 'EW_GREEN';
        this.playTick();
      }
    } else if (this.phase === 'EW_YELLOW') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.phase = 'ALL_RED_EW';
        this.phaseTimer = this.allRedDuration;
      }
    } else if (this.phase === 'ALL_RED_EW') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.phase = 'NS_GREEN';
        this.playTick();
      }
    }

    // Ambulance Siren Audio
    const activeAmbulance = this.cars.find(c => c.type === 'ambulance' && !c.crashed && !c.clearedBox);
    if (activeAmbulance) {
      this.sirenCooldown -= dt;
      if (this.sirenCooldown <= 0) {
        this.playSiren();
        this.sirenCooldown = 1.1;
      }
    }

    // Spawning System
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      // Dynamic difficulty: traffic spawn rate increases with score
      const rateMin = Math.max(0.65, 1.6 - this.score * 0.025);
      this.spawnTimer = rateMin + Math.random() * 0.45;
      this.spawnCar();
    }

    // Update Cars Physics & Traffic Queuing
    this.updateCars(dt);

    // Near Miss & Collision Detection
    this.checkInteractions();

    // Particles & Floating Text Updates
    this.updateParticles(dt);
  },

  updateCars(dt) {
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const c = this.cars[i];

      // Boost timer decay
      if (c.boosted) {
        c.boostTimer -= dt;
        if (c.boostTimer <= 0) {
          c.boosted = false;
        } else if (Math.random() < 0.4) {
          // Spawn boost trail
          this.particles.push({
            x: c.x + (Math.random() - 0.5) * 4,
            y: c.y + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 0.25, maxLife: 0.25,
            type: 'smoke',
            color: 3, size: 1
          });
        }
      }

      if (c.honkBubbleTimer > 0) c.honkBubbleTimer -= dt;
      if (c.honkCooldown > 0) c.honkCooldown -= dt;

      // Determine signal clearance status for current direction
      let greenForThis = false;
      let yellowForThis = false;

      if (c.dir === 'S' || c.dir === 'N') {
        greenForThis = (this.phase === 'NS_GREEN');
        yellowForThis = (this.phase === 'NS_YELLOW');
      } else {
        greenForThis = (this.phase === 'EW_GREEN');
        yellowForThis = (this.phase === 'EW_YELLOW');
      }

      // Check whether car has entered or cleared the intersection box
      // Box area: x in [109, 147], y in [101, 139]
      if (c.dir === 'S') {
        if (c.y + c.len / 2 >= 99) c.inBox = true;
        if (c.y - c.len / 2 > 141) { c.inBox = false; c.clearedBox = true; }
      } else if (c.dir === 'N') {
        if (c.y - c.len / 2 <= 141) c.inBox = true;
        if (c.y + c.len / 2 < 99) { c.inBox = false; c.clearedBox = true; }
      } else if (c.dir === 'E') {
        if (c.x + c.len / 2 >= 107) c.inBox = true;
        if (c.x - c.len / 2 > 149) { c.inBox = false; c.clearedBox = true; }
      } else if (c.dir === 'W') {
        if (c.x - c.len / 2 <= 149) c.inBox = true;
        if (c.x + c.len / 2 < 107) { c.inBox = false; c.clearedBox = true; }
      }

      // Calculate desired movement & braking:
      // A car stops if:
      // 1. Red light ahead AND car is before stop line AND not boosted.
      // 2. Yellow light ahead AND car has enough space to brake safely before stop line AND not boosted.
      // 3. Another car is ahead in the same lane with inadequate stopping distance.
      let stopTarget = null;

      // Signal stop check
      if (!c.clearedBox && !c.inBox && !c.boosted) {
        if (!greenForThis) {
          if (yellowForThis) {
            // Yellow light amber-dilemma check:
            // If car is traveling fast and very close to stop line, proceed safely
            let distToLine = 999;
            if (c.dir === 'S') distToLine = 99 - (c.y + c.len / 2);
            else if (c.dir === 'N') distToLine = (c.y - c.len / 2) - 141;
            else if (c.dir === 'E') distToLine = 107 - (c.x + c.len / 2);
            else if (c.dir === 'W') distToLine = (c.x - c.len / 2) - 149;

            if (distToLine > 18) {
              if (c.dir === 'S') stopTarget = 99 - c.len / 2;
              else if (c.dir === 'N') stopTarget = 141 + c.len / 2;
              else if (c.dir === 'E') stopTarget = 107 - c.len / 2;
              else if (c.dir === 'W') stopTarget = 149 + c.len / 2;
            }
          } else {
            // Red light: stop strictly at the line
            if (c.dir === 'S') stopTarget = 99 - c.len / 2;
            else if (c.dir === 'N') stopTarget = 141 + c.len / 2;
            else if (c.dir === 'E') stopTarget = 107 - c.len / 2;
            else if (c.dir === 'W') stopTarget = 149 + c.len / 2;
          }
        }
      }

      // Queuing check: car ahead in same lane
      let carAhead = null;
      let minGap = 999;

      for (let j = 0; j < this.cars.length; j++) {
        const other = this.cars[j];
        if (other === c || other.dir !== c.dir) continue;

        if (c.dir === 'S' && other.y > c.y) {
          const gap = (other.y - other.len / 2) - (c.y + c.len / 2);
          if (gap >= 0 && gap < minGap) { minGap = gap; carAhead = other; }
        } else if (c.dir === 'N' && other.y < c.y) {
          const gap = (c.y - c.len / 2) - (other.y + other.len / 2);
          if (gap >= 0 && gap < minGap) { minGap = gap; carAhead = other; }
        } else if (c.dir === 'E' && other.x > c.x) {
          const gap = (other.x - other.len / 2) - (c.x + c.len / 2);
          if (gap >= 0 && gap < minGap) { minGap = gap; carAhead = other; }
        } else if (c.dir === 'W' && other.x < c.x) {
          const gap = (c.x - c.len / 2) - (other.x + other.len / 2);
          if (gap >= 0 && gap < minGap) { minGap = gap; carAhead = other; }
        }
      }

      if (carAhead) {
        const safeBuffer = 6;
        let aheadStopPos = null;
        if (c.dir === 'S') aheadStopPos = (carAhead.y - carAhead.len / 2) - safeBuffer - c.len / 2;
        else if (c.dir === 'N') aheadStopPos = (carAhead.y + carAhead.len / 2) + safeBuffer + c.len / 2;
        else if (c.dir === 'E') aheadStopPos = (carAhead.x - carAhead.len / 2) - safeBuffer - c.len / 2;
        else if (c.dir === 'W') aheadStopPos = (carAhead.x + carAhead.len / 2) + safeBuffer + c.len / 2;

        if (minGap < 32) {
          // Choose the more restrictive stopping position
          if (stopTarget === null) {
            stopTarget = aheadStopPos;
          } else {
            if (c.dir === 'S' || c.dir === 'E') stopTarget = Math.min(stopTarget, aheadStopPos);
            else stopTarget = Math.max(stopTarget, aheadStopPos);
          }
        }
      }

      // Execute Braking or Acceleration
      let targetSpeed = c.boosted ? c.baseSpeed * 2.2 : c.baseSpeed;

      if (stopTarget !== null) {
        let dist = 0;
        if (c.dir === 'S') dist = stopTarget - c.y;
        else if (c.dir === 'N') dist = c.y - stopTarget;
        else if (c.dir === 'E') dist = stopTarget - c.x;
        else if (c.dir === 'W') dist = c.x - stopTarget;

        if (dist <= 0) {
          // Completely halted
          c.speed = 0;
          c.isStopped = true;
          c.isBraking = false;
          if (c.dir === 'S') c.y = stopTarget;
          else if (c.dir === 'N') c.y = stopTarget;
          else if (c.dir === 'E') c.x = stopTarget;
          else if (c.dir === 'W') c.x = stopTarget;
        } else {
          // Decelerate smoothly
          c.isBraking = true;
          c.isStopped = false;
          c.speed = Math.max(0, c.speed - c.decel * dt);
          const step = c.speed * dt;
          if (step >= dist) {
            c.speed = 0;
            c.isStopped = true;
            c.isBraking = false;
            if (c.dir === 'S') c.y = stopTarget;
            else if (c.dir === 'N') c.y = stopTarget;
            else if (c.dir === 'E') c.x = stopTarget;
            else if (c.dir === 'W') c.x = stopTarget;
          } else {
            if (c.dir === 'S') c.y += step;
            else if (c.dir === 'N') c.y -= step;
            else if (c.dir === 'E') c.x += step;
            else if (c.dir === 'W') c.x -= step;
          }
        }
      } else {
        // Accelerate up to target speed
        c.isBraking = false;
        c.isStopped = false;
        if (c.speed < targetSpeed) {
          c.speed = Math.min(targetSpeed, c.speed + c.accel * dt);
        }
        const step = c.speed * dt;
        if (c.dir === 'S') c.y += step;
        else if (c.dir === 'N') c.y -= step;
        else if (c.dir === 'E') c.x += step;
        else if (c.dir === 'W') c.x -= step;
      }

      // Impatience Horn: Cars queued for too long honk their horns!
      if (c.isStopped) {
        c.waitTime += dt;
        if (c.waitTime > 3.0 && c.honkCooldown <= 0) {
          this.playHorn();
          c.honkCooldown = 2.4 + Math.random() * 1.5;
          c.honkBubbleTimer = 0.9;
        }
      } else {
        c.waitTime = Math.max(0, c.waitTime - dt * 2);
      }

      // Screen Exit & Safe Transit Award
      let exited = false;
      if (c.dir === 'S' && c.y > 255) exited = true;
      else if (c.dir === 'N' && c.y < -25) exited = true;
      else if (c.dir === 'E' && c.x > 275) exited = true;
      else if (c.dir === 'W' && c.x < -25) exited = true;

      if (exited) {
        this.cars.splice(i, 1);
        if (c.type === 'ambulance') {
          this.score += 3;
          this.addFloatingText(Math.max(16, Math.min(240, c.x)), Math.max(16, Math.min(224, c.y)), "AMBULANCE +3!", 3);
          if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
        } else {
          this.score++;
          this.playCoin();
          this.addFloatingText(Math.max(16, Math.min(240, c.x)), Math.max(16, Math.min(224, c.y)), "+1", 3);
        }

        if (this.score > this.highScore) {
          this.highScore = this.score;
          if (typeof SAVE !== 'undefined' && SAVE.setScore) SAVE.setScore(this.id, this.highScore);
        }
      }
    }
  },

  checkInteractions() {
    // Check bounding box collisions and near misses between all active cars
    for (let i = 0; i < this.cars.length; i++) {
      for (let j = i + 1; j < this.cars.length; j++) {
        const c1 = this.cars[i];
        const c2 = this.cars[j];

        // Compute axis-aligned half dimensions
        const isC1Vert = (c1.dir === 'S' || c1.dir === 'N');
        const isC2Vert = (c2.dir === 'S' || c2.dir === 'N');

        const hw1 = (isC1Vert ? c1.wid : c1.len) / 2;
        const hh1 = (isC1Vert ? c1.len : c1.wid) / 2;
        const hw2 = (isC2Vert ? c2.wid : c2.len) / 2;
        const hh2 = (isC2Vert ? c2.len : c2.wid) / 2;

        const dx = Math.abs(c1.x - c2.x);
        const dy = Math.abs(c1.y - c2.y);

        // Crash overlap condition (with 1.5px inset to avoid false positive edge grazes)
        if (dx < (hw1 + hw2 - 1.5) && dy < (hh1 + hh2 - 1.5)) {
          this.triggerCrash(c1, c2);
          return;
        }

        // Near Miss Detection:
        // Only between perpendicular vehicles crossing the intersection zone
        if (isC1Vert !== isC2Vert && (c1.inBox || c1.clearedBox) && (c2.inBox || c2.clearedBox)) {
          const gapX = dx - (hw1 + hw2);
          const gapY = dy - (hh1 + hh2);
          const gap = Math.max(gapX, gapY);

          if (gap >= 0 && gap <= 7.5) {
            const pairKey = Math.min(c1.id, c2.id) + '_' + Math.max(c1.id, c2.id);
            if (!this.nearMissPairs.has(pairKey)) {
              this.nearMissPairs.add(pairKey);
              this.nearMisses++;
              this.score += 2;
              this.playNearMiss();
              if (typeof PAD !== 'undefined') PAD.vibrate(20);

              const mx = (c1.x + c2.x) / 2;
              const my = (c1.y + c2.y) / 2;
              this.addFloatingText(mx, my - 8, "NEAR MISS! +2", 3);

              if (this.score > this.highScore) {
                this.highScore = this.score;
                if (typeof SAVE !== 'undefined' && SAVE.setScore) SAVE.setScore(this.id, this.highScore);
              }
            }
          }
        }
      }
    }
  },

  triggerCrash(c1, c2) {
    this.over = true;
    c1.crashed = true;
    c2.crashed = true;
    this.crashPt = { x: (c1.x + c2.x) / 2, y: (c1.y + c2.y) / 2 };
    this.shake = 0.55;
    this.playCrash();
    if (typeof PAD !== 'undefined') PAD.vibrate(60);

    if (typeof SAVE !== 'undefined' && SAVE.setScore) {
      SAVE.setScore(this.id, this.score);
    }

    // Spawn 28 shards of spinning metal debris
    for (let p = 0; p < 28; p++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 25 + Math.random() * 85;
      this.particles.push({
        x: this.crashPt.x,
        y: this.crashPt.y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.6 + Math.random() * 0.9,
        maxLife: 1.5,
        type: 'debris',
        color: Math.random() < 0.6 ? 3 : 2,
        size: Math.random() < 0.5 ? 2 : 3
      });
    }

    // Initial blast shockwave & smoke
    for (let s = 0; s < 12; s++) {
      this.particles.push({
        x: this.crashPt.x + (Math.random() - 0.5) * 12,
        y: this.crashPt.y + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 20,
        vy: -15 - Math.random() * 25,
        life: 0.8 + Math.random() * 0.7,
        maxLife: 1.5,
        type: 'smoke',
        color: 3,
        size: 3
      });
    }
  },

  updateParticles(dt) {
    // Skid marks decay
    for (let i = this.skidMarks.length - 1; i >= 0; i--) {
      this.skidMarks[i].life -= dt;
      if (this.skidMarks[i].life <= 0) this.skidMarks.splice(i, 1);
    }

    // Floating text rise & fade
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 14 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // Particles physics
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      if (p.type === 'debris') {
        p.vx *= 0.94;
        p.vy *= 0.94;
      } else if (p.type === 'smoke') {
        p.vy -= 6 * dt; // Smoke rises
        p.vx *= 0.95;
      }

      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Continuous smoking wreckage on crash site
    if (this.over && this.crashPt && Math.random() < 0.35) {
      this.particles.push({
        x: this.crashPt.x + (Math.random() - 0.5) * 14,
        y: this.crashPt.y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 12,
        vy: -18 - Math.random() * 20,
        life: 0.7 + Math.random() * 0.5,
        maxLife: 1.2,
        type: 'smoke',
        color: Math.random() < 0.5 ? 2 : 1,
        size: 2
      });
    }
  },

  // --------------------------------------------------------------------------
  // RENDER ROUTINES
  // --------------------------------------------------------------------------
  render(g) {
    // Calculate screen shake offsets
    let ox = 0, oy = 0;
    if (this.shake > 0) {
      ox = Math.round((Math.random() * 2 - 1) * this.shake * 8);
      oy = Math.round((Math.random() * 2 - 1) * this.shake * 8);
    }

    g.clear(0);

    // 1. Draw Sidewalks & Background City Scenery (Corners)
    this.renderEnvironment(g, ox, oy);

    // 2. Draw 4-Way Crossroads Asphalt, Lines & Zebras
    this.renderRoads(g, ox, oy);

    // 3. Draw Skid Marks
    for (let sm of this.skidMarks) {
      const sx = Math.floor(sm.x + ox);
      const sy = Math.floor(sm.y + oy);
      const col = sm.life > 1.5 ? 2 : 1;
      if (sm.dir === 'S' || sm.dir === 'N') {
        g.line(sx - 3, sy - 4, sx - 3, sy + 4, col);
        g.line(sx + 2, sy - 4, sx + 2, sy + 4, col);
      } else {
        g.line(sx - 4, sy - 3, sx + 4, sy - 3, col);
        g.line(sx - 4, sy + 2, sx + 4, sy + 2, col);
      }
    }

    // 4. Draw Traffic Signal Heads on 4 Corners
    this.renderSignals(g, ox, oy);

    // 5. Draw Vehicles
    for (let c of this.cars) {
      this.renderVehicle(g, c, ox, oy);
    }

    // 6. Draw Particles (Debris & Smoke)
    for (let p of this.particles) {
      const px = Math.floor(p.x + ox);
      const py = Math.floor(p.y + oy);
      if (p.type === 'debris') {
        g.rect(px - 1, py - 1, p.size, p.size, p.color);
      } else if (p.type === 'smoke') {
        const radius = Math.floor((1 - (p.life / p.maxLife)) * 3) + 1;
        g.disc(px, py, radius, p.color);
      }
    }

    // 7. Draw Floating Notification Texts
    for (let ft of this.floatingTexts) {
      g.textC(ft.text, Math.floor(ft.y), ft.color);
    }

    // 8. Stable Top & Bottom HUD Overlays
    this.renderHUD(g);

    // 9. Results Modal on Game Over
    if (this.over && this.overTimer > 0.3) {
      this.renderGameOver(g);
    }
  },

  renderEnvironment(g, ox, oy) {
    // 4 Sidewalk corner pavements:
    // Top-Left: x: 0..109, y: 0..101
    // Top-Right: x: 147..255, y: 0..101
    // Bottom-Left: x: 0..109, y: 139..239
    // Bottom-Right: x: 147..255, y: 139..239
    const c1x = ox, c1y = oy;

    // Pavement slabs (Color 1 with subtle grid/texture)
    g.rect(c1x, c1y, 109, 101, 1);
    g.rect(c1x + 147, c1y, 109, 101, 1);
    g.rect(c1x, c1y + 139, 109, 101, 1);
    g.rect(c1x + 147, c1y + 139, 109, 101, 1);

    // Sidewalk border curbs (Color 2)
    g.line(c1x, c1y + 101, c1x + 109, c1y + 101, 2);
    g.line(c1x + 109, c1y, c1x + 109, c1y + 101, 2);

    g.line(c1x + 147, c1y + 101, c1x + 255, c1y + 101, 2);
    g.line(c1x + 147, c1y, c1x + 147, c1y + 101, 2);

    g.line(c1x, c1y + 139, c1x + 109, c1y + 139, 2);
    g.line(c1x + 109, c1y + 139, c1x + 109, c1y + 239, 2);

    g.line(c1x + 147, c1y + 139, c1x + 255, c1y + 139, 2);
    g.line(c1x + 147, c1y + 139, c1x + 147, c1y + 239, 2);

    // City Retro Details:
    // Top-Left: Park planter & Street Tree
    g.rect(c1x + 16, c1y + 36, 44, 38, 0);
    g.box(c1x + 16, c1y + 36, 44, 38, 2);
    g.disc(c1x + 38, c1y + 55, 12, 2);
    g.disc(c1x + 38, c1y + 55, 9, 3);
    g.rect(c1x + 36, c1y + 58, 4, 10, 1); // Trunk

    // Top-Right: City building facade with lit windows
    g.rect(c1x + 166, c1y + 22, 74, 58, 0);
    g.box(c1x + 166, c1y + 22, 74, 58, 2);
    for (let r = 0; r < 3; r++) {
      for (let col = 0; col < 5; col++) {
        g.rect(c1x + 172 + col * 13, c1y + 28 + r * 16, 6, 8, ((r + col) % 3 === 0) ? 3 : 1);
      }
    }

    // Bottom-Left: Fire hydrant & street lamp
    g.rect(c1x + 88, c1y + 155, 4, 7, 3); // Hydrant
    g.box(c1x + 87, c1y + 157, 6, 3, 2);
    g.disc(c1x + 40, c1y + 190, 8, 2); // Plaza fountain / monument
    g.disc(c1x + 40, c1y + 190, 4, 3);

    // Bottom-Right: Park benches & tiled plaza
    g.rect(c1x + 175, c1y + 165, 24, 7, 0);
    g.box(c1x + 175, c1y + 165, 24, 7, 2);
    g.rect(c1x + 175, c1y + 195, 24, 7, 0);
    g.box(c1x + 175, c1y + 195, 24, 7, 2);
  },

  renderRoads(g, ox, oy) {
    const rx = ox, ry = oy;

    // Asphalt road surface (Color 1)
    g.rect(rx + 110, ry, 36, 240, 1);
    g.rect(rx, ry + 102, 256, 36, 1);

    // Center Intersection Yellow Box Junction (Yellow criss-cross pattern)
    // Area: x in [110, 146], y in [102, 138]
    g.rect(rx + 110, ry + 102, 36, 36, 0);
    g.box(rx + 110, ry + 102, 36, 36, 2);
    // Criss-cross diagonal hatching
    for (let d = -28; d <= 28; d += 8) {
      g.line(rx + 110 + Math.max(0, d), ry + 102 + Math.max(0, -d),
             rx + 146 - Math.max(0, -d), ry + 138 - Math.max(0, d), 1);
      g.line(rx + 110 + Math.max(0, d), ry + 138 - Math.max(0, -d),
             rx + 146 - Math.max(0, -d), ry + 102 + Math.max(0, d), 1);
    }

    // Dashed center lane divider lines
    // Vertical road center: x = 128
    for (let y = 0; y < 240; y += 10) {
      if (y < 90 || y > 150) {
        g.line(rx + 128, ry + y, rx + 128, ry + y + 4, 2);
      }
    }
    // Horizontal road center: y = 120
    for (let x = 0; x < 256; x += 10) {
      if (x < 98 || x > 158) {
        g.line(rx + x, ry + 120, rx + x + 4, ry + 120, 2);
      }
    }

    // Zebra Crosswalks & Solid White Stop Lines
    // North Approach:
    for (let bx = 112; bx <= 142; bx += 7) {
      g.rect(rx + bx, ry + 91, 5, 6, 3); // Crosswalk stripes
    }
    g.line(rx + 110, ry + 99, rx + 127, ry + 99, 3); // Southbound Stop Line

    // South Approach:
    for (let bx = 112; bx <= 142; bx += 7) {
      g.rect(rx + bx, ry + 143, 5, 6, 3);
    }
    g.line(rx + 129, ry + 141, rx + 146, ry + 141, 3); // Northbound Stop Line

    // West Approach:
    for (let by = 104; by <= 134; by += 7) {
      g.rect(rx + 99, ry + by, 6, 5, 3);
    }
    g.line(rx + 107, ry + 121, rx + 107, ry + 138, 3); // Eastbound Stop Line

    // East Approach:
    for (let by = 104; by <= 134; by += 7) {
      g.rect(rx + 151, ry + by, 6, 5, 3);
    }
    g.line(rx + 149, ry + 103, rx + 149, ry + 119, 3); // Westbound Stop Line
  },

  renderSignals(g, ox, oy) {
    // 4 Traffic Light Housings located at the 4 corners
    // Post 1: NW corner (x=96, y=81) -> controls North-South
    // Post 2: NE corner (x=150, y=81) -> controls East-West
    // Post 3: SW corner (x=96, y=143) -> controls East-West
    // Post 4: SE corner (x=150, y=143) -> controls North-South
    const posts = [
      { x: 96, y: 81, ctrl: 'NS' },
      { x: 150, y: 81, ctrl: 'EW' },
      { x: 96, y: 143, ctrl: 'EW' },
      { x: 150, y: 143, ctrl: 'NS' }
    ];

    const blink = (Math.floor(Date.now() / 140) % 2 === 0);

    for (let p of posts) {
      const sx = Math.floor(p.x + ox);
      const sy = Math.floor(p.y + oy);

      // Metal signal housing
      g.rect(sx, sy, 10, 16, 0);
      g.box(sx, sy, 10, 16, 2);

      let isRed = false;
      let isYellow = false;
      let isGreen = false;

      if (p.ctrl === 'NS') {
        if (this.phase === 'NS_GREEN') isGreen = true;
        else if (this.phase === 'NS_YELLOW') isYellow = true;
        else isRed = true;
      } else {
        if (this.phase === 'EW_GREEN') isGreen = true;
        else if (this.phase === 'EW_YELLOW') isYellow = true;
        else isRed = true;
      }

      // Top Lamp: RED
      if (isRed) {
        g.disc(sx + 5, sy + 3, 2, 3);
      } else {
        g.disc(sx + 5, sy + 3, 2, 1);
      }

      // Middle Lamp: AMBER / YELLOW
      if (isYellow) {
        g.disc(sx + 5, sy + 8, 2, blink ? 3 : 2);
      } else {
        g.disc(sx + 5, sy + 8, 2, 1);
      }

      // Bottom Lamp: GREEN
      if (isGreen) {
        g.disc(sx + 5, sy + 13, 2, 3);
      } else {
        g.disc(sx + 5, sy + 13, 2, 1);
      }
    }
  },

  renderVehicle(g, c, ox, oy) {
    const cx = Math.floor(c.x + ox);
    const cy = Math.floor(c.y + oy);

    // Check if vehicle has crashed
    if (c.crashed) {
      g.rect(cx - 5, cy - 5, 10, 10, 0);
      g.box(cx - 5, cy - 5, 10, 10, 3);
      g.line(cx - 4, cy - 4, cx + 4, cy + 4, 3);
      g.line(cx - 4, cy + 4, cx + 4, cy - 4, 3);
      return;
    }

    const isBraking = c.isBraking || c.isStopped;
    const isBoosted = c.boosted;
    const isAmbulanceStrobe = (c.type === 'ambulance' && (Math.floor(Date.now() / 100) % 2 === 0));

    // Vehicle Sprites based on Direction & Archetype
    if (c.dir === 'S') {
      // Heading DOWN
      if (c.type === 'sedan') {
        g.rect(cx - 4, cy - 7, 8, 14, isBoosted ? 3 : 2);
        g.rect(cx - 3, cy - 4, 6, 7, isBoosted ? 2 : 3);
        g.rect(cx - 2, cy - 3, 4, 1, 0); // Front windshield
        g.rect(cx - 2, cy + 1, 4, 1, 0); // Rear window
        // Headlights (bottom)
        g.px(cx - 3, cy + 6, 3); g.px(cx + 2, cy + 6, 3);
        // Taillights / Brake lights (top)
        g.px(cx - 3, cy - 7, isBraking ? 3 : 1);
        g.px(cx + 2, cy - 7, isBraking ? 3 : 1);
      } else if (c.type === 'coupe') {
        g.rect(cx - 4, cy - 6, 8, 13, 3);
        g.line(cx, cy - 6, cx, cy + 6, 0); // Racing stripe
        g.rect(cx - 3, cy - 2, 6, 4, 2); // Cockpit
        g.line(cx - 4, cy - 6, cx + 3, cy - 6, 3); // Rear spoiler
        g.px(cx - 3, cy + 6, 3); g.px(cx + 2, cy + 6, 3); // Headlights
        g.px(cx - 3, cy - 6, isBraking ? 3 : 1);
        g.px(cx + 2, cy - 6, isBraking ? 3 : 1);
      } else if (c.type === 'truck') {
        // Heavy Cab at front (bottom), Cargo Trailer at rear (top)
        g.rect(cx - 4, cy - 13, 9, 17, 2); // Trailer
        g.line(cx - 3, cy - 10, cx + 3, cy - 10, 1);
        g.line(cx - 3, cy - 5, cx + 3, cy - 5, 1);
        g.rect(cx - 4, cy + 6, 9, 7, 3); // Front Cab
        g.rect(cx - 3, cy + 7, 7, 2, 0); // Windshield
        g.px(cx - 3, cy + 12, 3); g.px(cx + 3, cy + 12, 3); // Headlights
        g.px(cx - 4, cy - 13, isBraking ? 3 : 1);
        g.px(cx + 4, cy - 13, isBraking ? 3 : 1);
      } else if (c.type === 'ambulance') {
        g.rect(cx - 4, cy - 8, 9, 16, 3);
        g.rect(cx - 3, cy - 4, 7, 3, 0); // Windows
        // Roof medical cross
        g.px(cx, cy + 2, 0); g.px(cx - 1, cy + 2, 0); g.px(cx + 1, cy + 2, 0);
        g.px(cx, cy + 1, 0); g.px(cx, cy + 3, 0);
        // Flashing Strobe Bar
        g.rect(cx - 2, cy - 6, 5, 2, isAmbulanceStrobe ? 3 : 1);
        g.px(cx - 3, cy + 7, 3); g.px(cx + 3, cy + 7, 3); // Headlights
        g.px(cx - 3, cy - 8, isBraking ? 3 : 1);
        g.px(cx + 3, cy - 8, isBraking ? 3 : 1);
      }
    } else if (c.dir === 'N') {
      // Heading UP
      if (c.type === 'sedan') {
        g.rect(cx - 4, cy - 7, 8, 14, isBoosted ? 3 : 2);
        g.rect(cx - 3, cy - 3, 6, 7, isBoosted ? 2 : 3);
        g.rect(cx - 2, cy + 1, 4, 1, 0);
        g.rect(cx - 2, cy - 3, 4, 1, 0);
        g.px(cx - 3, cy - 7, 3); g.px(cx + 2, cy - 7, 3); // Headlights (top)
        g.px(cx - 3, cy + 6, isBraking ? 3 : 1); // Taillights (bottom)
        g.px(cx + 2, cy + 6, isBraking ? 3 : 1);
      } else if (c.type === 'coupe') {
        g.rect(cx - 4, cy - 6, 8, 13, 3);
        g.line(cx, cy - 6, cx, cy + 6, 0);
        g.rect(cx - 3, cy - 2, 6, 4, 2);
        g.line(cx - 4, cy + 6, cx + 3, cy + 6, 3); // Rear spoiler
        g.px(cx - 3, cy - 6, 3); g.px(cx + 2, cy - 6, 3);
        g.px(cx - 3, cy + 6, isBraking ? 3 : 1);
        g.px(cx + 2, cy + 6, isBraking ? 3 : 1);
      } else if (c.type === 'truck') {
        g.rect(cx - 4, cy - 4, 9, 17, 2); // Trailer (bottom)
        g.line(cx - 3, cy + 2, cx + 3, cy + 2, 1);
        g.line(cx - 3, cy + 7, cx + 3, cy + 7, 1);
        g.rect(cx - 4, cy - 13, 9, 7, 3); // Cab (top)
        g.rect(cx - 3, cy - 9, 7, 2, 0);
        g.px(cx - 3, cy - 13, 3); g.px(cx + 3, cy - 13, 3);
        g.px(cx - 4, cy + 12, isBraking ? 3 : 1);
        g.px(cx + 4, cy + 12, isBraking ? 3 : 1);
      } else if (c.type === 'ambulance') {
        g.rect(cx - 4, cy - 8, 9, 16, 3);
        g.rect(cx - 3, cy + 1, 7, 3, 0);
        g.px(cx, cy - 2, 0); g.px(cx - 1, cy - 2, 0); g.px(cx + 1, cy - 2, 0);
        g.px(cx, cy - 3, 0); g.px(cx, cy - 1, 0);
        g.rect(cx - 2, cy + 4, 5, 2, isAmbulanceStrobe ? 3 : 1);
        g.px(cx - 3, cy - 8, 3); g.px(cx + 3, cy - 8, 3);
        g.px(cx - 3, cy + 7, isBraking ? 3 : 1);
        g.px(cx + 3, cy + 7, isBraking ? 3 : 1);
      }
    } else if (c.dir === 'E') {
      // Heading RIGHT
      if (c.type === 'sedan') {
        g.rect(cx - 7, cy - 4, 14, 8, isBoosted ? 3 : 2);
        g.rect(cx - 4, cy - 3, 7, 6, isBoosted ? 2 : 3);
        g.rect(cx + 1, cy - 2, 1, 4, 0);
        g.rect(cx - 3, cy - 2, 1, 4, 0);
        g.px(cx + 6, cy - 3, 3); g.px(cx + 6, cy + 2, 3); // Headlights (right)
        g.px(cx - 7, cy - 3, isBraking ? 3 : 1); // Taillights (left)
        g.px(cx - 7, cy + 2, isBraking ? 3 : 1);
      } else if (c.type === 'coupe') {
        g.rect(cx - 6, cy - 4, 13, 8, 3);
        g.line(cx - 6, cy, cx + 6, cy, 0);
        g.rect(cx - 2, cy - 3, 4, 6, 2);
        g.line(cx - 6, cy - 4, cx - 6, cy + 3, 3); // Rear spoiler
        g.px(cx + 6, cy - 3, 3); g.px(cx + 6, cy + 2, 3);
        g.px(cx - 6, cy - 3, isBraking ? 3 : 1);
        g.px(cx - 6, cy + 2, isBraking ? 3 : 1);
      } else if (c.type === 'truck') {
        g.rect(cx - 13, cy - 4, 17, 9, 2); // Trailer (left)
        g.line(cx - 8, cy - 3, cx - 8, cy + 3, 1);
        g.line(cx - 3, cy - 3, cx - 3, cy + 3, 1);
        g.rect(cx + 6, cy - 4, 7, 9, 3); // Cab (right)
        g.rect(cx + 7, cy - 3, 2, 7, 0);
        g.px(cx + 12, cy - 3, 3); g.px(cx + 12, cy + 3, 3);
        g.px(cx - 13, cy - 4, isBraking ? 3 : 1);
        g.px(cx - 13, cy + 4, isBraking ? 3 : 1);
      } else if (c.type === 'ambulance') {
        g.rect(cx - 8, cy - 4, 16, 9, 3);
        g.rect(cx - 4, cy - 3, 3, 7, 0);
        g.px(cx + 2, cy, 0); g.px(cx + 2, cy - 1, 0); g.px(cx + 2, cy + 1, 0);
        g.px(cx + 1, cy, 0); g.px(cx + 3, cy, 0);
        g.rect(cx - 6, cy - 2, 2, 5, isAmbulanceStrobe ? 3 : 1);
        g.px(cx + 7, cy - 3, 3); g.px(cx + 7, cy + 3, 3);
        g.px(cx - 8, cy - 3, isBraking ? 3 : 1);
        g.px(cx - 8, cy + 3, isBraking ? 3 : 1);
      }
    } else if (c.dir === 'W') {
      // Heading LEFT
      if (c.type === 'sedan') {
        g.rect(cx - 7, cy - 4, 14, 8, isBoosted ? 3 : 2);
        g.rect(cx - 3, cy - 3, 7, 6, isBoosted ? 2 : 3);
        g.rect(cx - 2, cy - 2, 1, 4, 0);
        g.rect(cx + 2, cy - 2, 1, 4, 0);
        g.px(cx - 7, cy - 3, 3); g.px(cx - 7, cy + 2, 3); // Headlights (left)
        g.px(cx + 6, cy - 3, isBraking ? 3 : 1); // Taillights (right)
        g.px(cx + 6, cy + 2, isBraking ? 3 : 1);
      } else if (c.type === 'coupe') {
        g.rect(cx - 6, cy - 4, 13, 8, 3);
        g.line(cx - 6, cy, cx + 6, cy, 0);
        g.rect(cx - 2, cy - 3, 4, 6, 2);
        g.line(cx + 6, cy - 4, cx + 6, cy + 3, 3); // Rear spoiler
        g.px(cx - 6, cy - 3, 3); g.px(cx - 6, cy + 2, 3);
        g.px(cx + 6, cy - 3, isBraking ? 3 : 1);
        g.px(cx + 6, cy + 2, isBraking ? 3 : 1);
      } else if (c.type === 'truck') {
        g.rect(cx - 4, cy - 4, 17, 9, 2); // Trailer (right)
        g.line(cx + 2, cy - 3, cx + 2, cy + 3, 1);
        g.line(cx + 7, cy - 3, cx + 7, cy + 3, 1);
        g.rect(cx - 13, cy - 4, 7, 9, 3); // Cab (left)
        g.rect(cx - 9, cy - 3, 2, 7, 0);
        g.px(cx - 13, cy - 3, 3); g.px(cx - 13, cy + 3, 3);
        g.px(cx + 12, cy - 4, isBraking ? 3 : 1);
        g.px(cx + 12, cy + 4, isBraking ? 3 : 1);
      } else if (c.type === 'ambulance') {
        g.rect(cx - 8, cy - 4, 16, 9, 3);
        g.rect(cx + 1, cy - 3, 3, 7, 0);
        g.px(cx - 2, cy, 0); g.px(cx - 2, cy - 1, 0); g.px(cx - 2, cy + 1, 0);
        g.px(cx - 1, cy, 0); g.px(cx - 3, cy, 0);
        g.rect(cx + 4, cy - 2, 2, 5, isAmbulanceStrobe ? 3 : 1);
        g.px(cx - 8, cy - 3, 3); g.px(cx - 8, cy + 3, 3);
        g.px(cx + 7, cy - 3, isBraking ? 3 : 1);
        g.px(cx + 7, cy + 3, isBraking ? 3 : 1);
      }
    }

    // Horn exclamation balloon when honking
    if (c.honkBubbleTimer > 0) {
      g.rect(cx - 5, cy - 15, 11, 8, 0);
      g.box(cx - 5, cy - 15, 11, 8, 3);
      g.text("!", cx - 2, cy - 14, 3);
      g.line(cx, cy - 7, cx, cy - 5, 3);
    }
  },

  renderHUD(g) {
    // Top Status Bar (y: 2..16)
    // Left: Live Traffic Signal Phase
    if (this.phase === 'NS_GREEN') {
      g.text("N-S: [GREEN]", 8, 4, 3);
      g.text("E-W: [RED]", 8, 12, 1);
    } else if (this.phase === 'NS_YELLOW') {
      g.text("N-S: [SLOW " + Math.ceil(this.phaseTimer * 10) / 10 + "s]", 8, 4, 3);
      g.text("E-W: [RED]", 8, 12, 1);
    } else if (this.phase === 'ALL_RED_NS' || this.phase === 'ALL_RED_EW') {
      g.text("N-S: [RED]", 8, 4, 1);
      g.text("E-W: [RED]", 8, 12, 1);
    } else if (this.phase === 'EW_GREEN') {
      g.text("N-S: [RED]", 8, 4, 1);
      g.text("E-W: [GREEN]", 8, 12, 3);
    } else if (this.phase === 'EW_YELLOW') {
      g.text("N-S: [RED]", 8, 4, 1);
      g.text("E-W: [SLOW " + Math.ceil(this.phaseTimer * 10) / 10 + "s]", 8, 12, 3);
    }

    // Right: Score & High Record
    g.textR("CARS: " + this.score, 248, 4, 3);
    g.textR("BEST: " + this.highScore, 248, 12, 2);

    // Bottom Bar (y: 228..238)
    g.text("[A] LIGHTS  [B] BOOST", 8, 230, 2);
    g.textR("NEAR MISS: " + this.nearMisses, 248, 230, 2);
  },

  renderGameOver(g) {
    // Translucent styled dialogue box
    g.rect(34, 62, 188, 114, 0);
    g.box(34, 62, 188, 114, 3);
    g.box(36, 64, 184, 110, 2);

    g.textC("💥 INTERSECTION PILEUP! 💥", 72, 3);
    g.line(44, 82, 212, 82, 2);

    g.text("CARS TRANSITED:", 48, 90, 2);
    g.textR(String(this.score), 208, 90, 3);

    g.text("NEAR MISSES:", 48, 102, 2);
    g.textR(String(this.nearMisses), 208, 102, 3);

    g.text("ALL-TIME BEST:", 48, 114, 2);
    g.textR(String(this.highScore), 208, 114, 3);

    if (this.score >= this.highScore && this.score > 0) {
      g.textC("★ NEW ALL-TIME RECORD! ★", 128, (Math.floor(Date.now() / 250) % 2 === 0 ? 3 : 2));
    }

    g.line(44, 140, 212, 140, 2);
    g.textC("PRESS [A] OR TAP TO RETRY", 148, (Math.floor(Date.now() / 350) % 2 === 0 ? 3 : 2));
  }
};
