// js/cartridges/cart_061_3d_racer.js
// ============================================================================
// Cartridge #061: 3D RACER
// Genre: Racing & Vehicles (6) | OutRun-style Pseudo-3D Highway Racer
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[61] = {
  id: 61,
  name: "3D RACER",
  genre: 6,
  scoreLabel: "DISTANCE",
  desc: "OUTRUN-STYLE RACER: [A] ACCEL, [B] BRAKE, STEER PAST TRAFFIC & CURVES BEFORE TIME RUNS OUT!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Low-poly 3D sports car speeding down curved highway into horizon
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Horizon line
    g.line(x + 2, y + 13, x + 29, y + 13, 1);

    // Distant mountain
    g.tri(x + 5, y + 13, x + 12, y + 7, x + 19, y + 13, 1);
    g.tri(x + 14, y + 13, x + 22, y + 6, x + 29, y + 13, 2);

    // Road vanishing perspective
    g.line(x + 16, y + 13, x + 4, y + 30, 2);
    g.line(x + 16, y + 13, x + 28, y + 30, 2);

    // Road stripes
    g.line(x + 16, y + 17, x + 16, y + 19, 3);
    g.line(x + 16, y + 23, x + 16, y + 26, 3);

    // Sports Car Rear Silhouette
    g.rect(x + 10, y + 23, 12, 5, 3);
    g.rect(x + 12, y + 20, 8, 3, 2); // cabin
    g.disc(x + 9, y + 26, 2, 0); // left rear tire
    g.disc(x + 22, y + 26, 2, 0); // right rear tire
    g.px(x + 11, y + 24, 3); // taillight L
    g.px(x + 20, y + 24, 3); // taillight R
    g.line(x + 10, y + 19, x + 21, y + 19, 3); // spoiler
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.state = 'RACE'; // 'RACE', 'CRASH', 'GAMEOVER', 'CLEAR'
    this.speed = 0;
    this.maxSpeed = 280; // km/h
    this.accel = 120;
    this.brakeRate = 180;
    this.friction = 40;
    this.offroadFriction = 160;

    this.carX = 0; // -1.0 (left curb) to +1.0 (right curb)
    this.playerZ = 0;
    this.dist = 0;
    this.timeLeft = 50; // seconds
    this.checkpointInterval = 3500; // meters per checkpoint
    this.nextCheckpoint = 3500;
    this.stage = 1;
    this.maxStages = 3;

    // Camera perspective
    this.cameraHeight = 1000;
    this.cameraDepth = 0.84;
    this.roadWidth = 2000;
    this.segLength = 200;
    this.drawDistance = 140;

    // Crash / Spin animation
    this.crashTimer = 0;
    this.spinAngle = 0;
    this.shake = 0;

    // Track generation (1200 segments)
    this.totalSegments = 1400;
    this.track = [];
    this.buildTrack();

    // Traffic cars
    this.traffic = [];
    this.spawnTraffic();

    // Roadside scenery objects
    this.sprites = [];
    this.spawnScenery();

    // Particles (tire smoke / skid sparks)
    this.particles = [];
  },

  // --------------------------------------------------------------------------
  // 3. TRACK & SCENERY GENERATION
  // --------------------------------------------------------------------------
  buildTrack() {
    this.track = [];
    for (let i = 0; i < this.totalSegments; i++) {
      let curve = 0;
      let hill = 0;

      // Stage 1: Gentle sweeps & rolling hills
      if (i > 80 && i < 240) curve = 2.4;
      else if (i > 280 && i < 440) curve = -2.8;
      else if (i > 480 && i < 600) hill = Math.sin((i - 480) * 0.05) * 800;

      // Stage 2: Sharp S-curves & blind crests
      else if (i > 650 && i < 800) {
        curve = (i % 80 < 40) ? 3.6 : -3.6;
        hill = Math.cos((i - 650) * 0.04) * 1100;
      }

      // Stage 3: High-speed highway chicane
      else if (i > 850 && i < 1100) {
        curve = Math.sin(i * 0.03) * 4.2;
        hill = Math.sin(i * 0.02) * 1400;
      }

      this.track.push({
        index: i,
        z: i * this.segLength,
        curve: curve,
        hill: hill,
        clip: 0
      });
    }
  },

  spawnTraffic() {
    this.traffic = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      this.traffic.push({
        z: 1200 + i * 1600 + Math.random() * 600,
        x: (Math.random() - 0.5) * 1.5,
        speed: 110 + Math.random() * 80,
        type: (i % 3 === 0) ? 'TRUCK' : 'COUPE'
      });
    }
  },

  spawnScenery() {
    this.sprites = [];
    for (let i = 40; i < this.totalSegments; i += 6) {
      if (Math.random() < 0.65) {
        const side = (Math.random() < 0.5) ? -1 : 1;
        const offset = side * (1.6 + Math.random() * 2.2);
        const type = (i % 12 === 0) ? 'BILLBOARD' : (i % 4 === 0) ? 'CACTUS' : 'PALM';
        this.sprites.push({
          segIndex: i,
          x: offset,
          type: type
        });
      }
    }
  },

  // --------------------------------------------------------------------------
  // 4. MAIN GAME LOOP
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

    // Camera shake decay
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 10);

    // Crash state logic
    if (this.state === 'CRASH') {
      this.crashTimer -= dt;
      this.spinAngle += dt * 14;
      this.speed = Math.max(0, this.speed - 220 * dt);
      this.playerZ += (this.speed * 1000 / 3600) * dt;
      this.dist = Math.floor(this.playerZ / 10);
      if (this.crashTimer <= 0) {
        this.state = 'RACE';
        this.spinAngle = 0;
      }
      return;
    }

    // Timer countdown
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.state = 'GAMEOVER';
      APU.sfx('ERROR');
      SAVE.setScore(this.id, this.dist);
      return;
    }

    // Player Input Handling
    const isOffroad = Math.abs(this.carX) > 1.0;
    const currentMaxSpeed = isOffroad ? 110 : this.maxSpeed;

    // Acceleration [A] or Up or Touch top
    const accelInput = PAD.state.a || PAD.state.up || (TOUCH.held && TOUCH.y < 160 && TOUCH.x > 80 && TOUCH.x < 176);
    const brakeInput = PAD.state.b || PAD.state.down || (TOUCH.held && TOUCH.y >= 160 && TOUCH.x > 80 && TOUCH.x < 176);

    if (accelInput) {
      this.speed = Math.min(currentMaxSpeed, this.speed + this.accel * dt);
    } else if (brakeInput) {
      this.speed = Math.max(0, this.speed - this.brakeRate * dt);
    } else {
      const activeFriction = isOffroad ? this.offroadFriction : this.friction;
      this.speed = Math.max(0, this.speed - activeFriction * dt);
    }

    // Steering (sensitivity scales with speed)
    const steerScale = Math.min(1.0, this.speed / 70);
    let steerDir = 0;
    if (PAD.state.left || (TOUCH.held && TOUCH.x <= 80)) steerDir -= 1;
    if (PAD.state.right || (TOUCH.held && TOUCH.x >= 176)) steerDir += 1;

    this.carX += steerDir * 2.2 * steerScale * dt;

    // Road curve centrifugal force pushes car outwards
    const currentSegIdx = Math.floor(this.playerZ / this.segLength) % this.totalSegments;
    const currentSeg = this.track[currentSegIdx];
    if (currentSeg && currentSeg.curve !== 0) {
      const speedRatio = this.speed / this.maxSpeed;
      this.carX -= (currentSeg.curve * speedRatio * speedRatio) * 1.8 * dt;
    }

    // Advance position
    const speedMs = this.speed * 1000 / 3600;
    this.playerZ += speedMs * dt;
    this.dist = Math.floor(this.playerZ / 10);
    SAVE.setScore(this.id, this.dist);

    // Tire smoke particles when skidding or offroad
    if ((isOffroad || Math.abs(steerDir) > 0) && this.speed > 80) {
      if (Math.random() < 0.4) {
        this.particles.push({
          x: 128 + (this.carX > 0 ? 12 : -12) + (Math.random() - 0.5) * 8,
          y: 218,
          r: 2 + Math.random() * 3,
          life: 0.35
        });
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].life -= dt;
      this.particles[i].y -= 15 * dt;
      if (this.particles[i].life <= 0) this.particles.splice(i, 1);
    }

    // Checkpoint detection
    if (this.playerZ >= this.nextCheckpoint) {
      this.nextCheckpoint += this.checkpointInterval;
      this.stage++;
      this.timeLeft = Math.min(80, this.timeLeft + 25);
      APU.sfx('FANFARE');
      if (this.stage > this.maxStages) {
        this.state = 'CLEAR';
        APU.sfx('POWERUP');
        SAVE.setScore(this.id, this.dist + Math.floor(this.timeLeft) * 100);
      }
    }

    // Update Traffic Cars & Collisions
    for (let car of this.traffic) {
      car.z += (car.speed * 1000 / 3600) * dt;

      // Wrap traffic ahead if far behind
      if (car.z < this.playerZ - 400) {
        car.z = this.playerZ + 2200 + Math.random() * 1200;
        car.x = (Math.random() - 0.5) * 1.6;
      }

      // Check collision with player
      const dz = car.z - this.playerZ;
      if (dz > 0 && dz < 180) {
        const dx = Math.abs(this.carX - car.x);
        if (dx < 0.45) {
          // Rear-end Crash!
          this.state = 'CRASH';
          this.crashTimer = 1.2;
          this.shake = 12;
          APU.sfx('EXPLODE');
          break;
        }
      }
    }
  },

  // --------------------------------------------------------------------------
  // 5. 256x240 CRT RENDERING (PSEUDO-3D ROAD)
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    const horizonY = 104;
    const baseSegIdx = Math.floor(this.playerZ / this.segLength);

    // 1. Sky & Distant Mountain Backdrop
    g.rect(0, 0, 256, horizonY, 0);
    const curveOffset = Math.floor((this.track[baseSegIdx % this.totalSegments].curve || 0) * 14);
    for (let mx = -40; mx < 300; mx += 60) {
      const peakX = mx - curveOffset;
      g.tri(peakX - 30, horizonY, peakX, horizonY - 26, peakX + 30, horizonY, 1);
      g.tri(peakX - 10, horizonY, peakX + 15, horizonY - 18, peakX + 40, horizonY, 2);
    }
    g.line(0, horizonY, 256, horizonY, 2);

    // 2. Road Projection & Rendering
    let maxClipY = 240;
    let accumulatedCurve = 0;

    for (let n = 0; n < this.drawDistance; n++) {
      const segIndex = (baseSegIdx + n) % this.totalSegments;
      const seg = this.track[segIndex];
      accumulatedCurve += seg.curve;

      const segZ = (baseSegIdx + n) * this.segLength;
      const relZ = segZ - this.playerZ;
      if (relZ <= 10) continue;

      // Perspective projection
      const scale = this.cameraDepth / (relZ / 1000);
      const projX = Math.floor(128 + (accumulatedCurve * 0.35 - this.carX * this.roadWidth) * scale);
      const projY = Math.floor(horizonY + (this.cameraHeight - seg.hill) * scale);
      const projW = Math.floor(this.roadWidth * scale);

      if (projY >= maxClipY || projY <= horizonY) continue;

      // Color alternating stripes (shade 0 vs 1 grass, shade 1 vs 2 road, shade 2 vs 3 rumble)
      const isAlt = (segIndex % 4) >= 2;
      const grassColor = isAlt ? 1 : 0;
      const roadColor = isAlt ? 1 : 0;
      const rumbleColor = isAlt ? 3 : 2;

      // Draw Grass
      g.line(0, projY, 256, projY, grassColor);

      // Draw Rumble Strips & Road Surface
      const leftEdge = projX - projW;
      const rightEdge = projX + projW;
      const rumbleW = Math.max(2, Math.floor(projW * 0.12));

      // Left rumble
      g.line(Math.max(0, leftEdge - rumbleW), projY, Math.min(256, leftEdge), projY, rumbleColor);
      // Road asphalt
      g.line(Math.max(0, leftEdge), projY, Math.min(256, rightEdge), projY, roadColor);
      // Right rumble
      g.line(Math.max(0, rightEdge), projY, Math.min(256, rightEdge + rumbleW), projY, rumbleColor);

      // Center dashed road stripe
      if ((segIndex % 6) < 3) {
        const stripeW = Math.max(1, Math.floor(projW * 0.03));
        g.line(projX - stripeW, projY, projX + stripeW, projY, 3);
      }

      seg.clip = projY;
      seg.projX = projX;
      seg.projY = projY;
      seg.scale = scale;
      maxClipY = projY;
    }

    // 3. Render Roadside Scenery (Trees / Billboards)
    for (let sc of this.sprites) {
      const relSeg = sc.segIndex - baseSegIdx;
      if (relSeg > 2 && relSeg < this.drawDistance) {
        const seg = this.track[sc.segIndex % this.totalSegments];
        if (seg.scale) {
          const sx = Math.floor(seg.projX + sc.x * this.roadWidth * seg.scale);
          const sy = seg.projY;
          const sz = Math.floor(40 * seg.scale);
          if (sz > 2 && sx > -40 && sx < 296 && sy < 240) {
            this.drawSceneryObject(g, sx, sy, sz, sc.type);
          }
        }
      }
    }

    // 4. Render Traffic Cars
    for (let car of this.traffic) {
      const relZ = car.z - this.playerZ;
      if (relZ > 20 && relZ < this.drawDistance * this.segLength) {
        const scale = this.cameraDepth / (relZ / 1000);
        const segIdx = Math.floor(car.z / this.segLength) % this.totalSegments;
        const seg = this.track[segIdx];
        const cx = Math.floor(128 + (car.x * this.roadWidth - this.carX * this.roadWidth) * scale);
        const cy = Math.floor(horizonY + (this.cameraHeight - (seg ? seg.hill : 0)) * scale);
        const cw = Math.floor(36 * scale);
        const ch = Math.floor(20 * scale);
        if (cw > 4 && cx > -30 && cx < 280 && cy < 235) {
          this.drawTrafficCar(g, cx, cy, cw, ch, car.type);
        }
      }
    }

    // 5. Smoke & Skid Particles
    for (let p of this.particles) {
      g.disc(Math.floor(p.x), Math.floor(p.y), Math.floor(p.r), 2);
    }

    // 6. Player Sports Car (Screen Bottom Center)
    this.drawPlayerCar(g);

    // 7. HUD Dashboard
    this.renderHUD(g);
  },

  drawSceneryObject(g, x, y, sz, type) {
    if (type === 'PALM') {
      g.line(x, y, x, y - sz * 2, 2);
      g.disc(x, y - sz * 2, Math.max(2, Math.floor(sz * 0.8)), 3);
      g.line(x, y - sz * 2, x - sz, y - sz * 1.5, 2);
      g.line(x, y - sz * 2, x + sz, y - sz * 1.5, 2);
    } else if (type === 'CACTUS') {
      g.rect(x - 2, y - sz * 1.4, 4, sz * 1.4, 3);
      g.line(x - sz * 0.5, y - sz * 0.8, x + sz * 0.5, y - sz * 0.8, 3);
      g.line(x - sz * 0.5, y - sz * 0.8, x - sz * 0.5, y - sz * 1.2, 3);
      g.line(x + sz * 0.5, y - sz * 0.8, x + sz * 0.5, y - sz * 1.2, 3);
    } else { // BILLBOARD
      g.rect(x - sz, y - sz * 1.6, sz * 2, sz, 2);
      g.box(x - sz, y - sz * 1.6, sz * 2, sz, 3);
      g.line(x - sz * 0.6, y - sz * 0.6, x - sz * 0.6, y, 1);
      g.line(x + sz * 0.6, y - sz * 0.6, x + sz * 0.6, y, 1);
    }
  },

  drawTrafficCar(g, cx, cy, cw, ch, type) {
    const halfW = Math.floor(cw / 2);
    g.rect(cx - halfW, cy - ch, cw, ch, 2);
    g.box(cx - halfW, cy - ch, cw, ch, 3);
    // Cabin
    g.rect(cx - Math.floor(halfW * 0.7), cy - ch - Math.floor(ch * 0.6), Math.floor(cw * 0.7), Math.floor(ch * 0.6), 1);
    // Taillights
    g.px(cx - halfW + 1, cy - 2, 3);
    g.px(cx + halfW - 2, cy - 2, 3);
  },

  drawPlayerCar(g) {
    const px = 128;
    const py = 214 + Math.round(this.shake * (Math.random() - 0.5));
    const bounce = (this.speed > 0 && Math.abs(this.carX) > 1.0) ? (Math.random() * 3 - 1) : 0;

    if (this.state === 'CRASH') {
      // Spinning crashed car
      const r = 16;
      g.circle(px, py, r, 3);
      g.line(px - r, py, px + r, py, 2);
      g.disc(px + Math.sin(this.spinAngle) * 12, py + Math.cos(this.spinAngle) * 8, 4, 3);
      return;
    }

    // Car Body (Chassis)
    g.rect(px - 26, py - 12 + bounce, 52, 14, 3);
    g.box(px - 26, py - 12 + bounce, 52, 14, 2);

    // Rear Spoiler Wing
    g.line(px - 24, py - 16 + bounce, px + 24, py - 16 + bounce, 3);
    g.line(px - 20, py - 16 + bounce, px - 20, py - 12 + bounce, 2);
    g.line(px + 20, py - 16 + bounce, px + 20, py - 12 + bounce, 2);

    // Aerodynamic Rear Windshield / Cabin
    g.rect(px - 18, py - 20 + bounce, 36, 9, 2);
    g.line(px - 16, py - 20 + bounce, px + 16, py - 20 + bounce, 3);

    // Fat Racing Tires
    g.rect(px - 29, py - 6 + bounce, 8, 12, 1);
    g.box(px - 29, py - 6 + bounce, 8, 12, 3);
    g.rect(px + 21, py - 6 + bounce, 8, 12, 1);
    g.box(px + 21, py - 6 + bounce, 8, 12, 3);

    // Glowing Twin Exhausts & Taillights
    g.disc(px - 18, py - 4 + bounce, 3, 3);
    g.disc(px + 18, py - 4 + bounce, 3, 3);
    if (this.speed > 160 && (this.dist % 4 < 2)) {
      g.line(px - 8, py + 2 + bounce, px - 8, py + 6 + bounce, 3);
      g.line(px + 8, py + 2 + bounce, px + 8, py + 6 + bounce, 3);
    }
  },

  renderHUD(g) {
    // Top HUD Bar
    g.rect(0, 0, 256, 20, 0);
    g.line(0, 20, 256, 20, 2);

    // Speedometer
    const spdStr = Math.floor(this.speed).toString().padStart(3, '0') + " KM/H";
    g.text("SPD " + spdStr, 10, 6, 3);

    // Time Left
    const sec = Math.ceil(this.timeLeft);
    const timeColor = sec <= 10 ? (this.timeLeft % 0.4 < 0.2 ? 3 : 1) : 3;
    g.textC("TIME " + sec + "S", 6, timeColor);

    // Distance & Stage
    g.textR("ST:" + this.stage + "  " + this.dist + "M", 246, 6, 2);

    // Overlays
    if (this.state === 'GAMEOVER') {
      g.dither(30, 80, 196, 60, 0, 1);
      g.box(30, 80, 196, 60, 3);
      g.textC("TIME UP - GAME OVER", 94, 3);
      g.textC("FINAL DISTANCE: " + this.dist + "M", 108, 2);
      g.textC("[A] PLAY AGAIN", 124, 3);
    } else if (this.state === 'CLEAR') {
      g.dither(30, 80, 196, 60, 0, 1);
      g.box(30, 80, 196, 60, 3);
      g.textC("★ GRAND PRIX CHAMPION! ★", 94, 3);
      g.textC("ALL STAGES CLEARED!", 108, 2);
      g.textC("[A] RACE AGAIN", 124, 3);
    }
  }
};
