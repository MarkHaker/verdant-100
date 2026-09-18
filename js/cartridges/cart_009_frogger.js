// js/cartridges/cart_009_frogger.js
// ============================================================================
// Cartridge #009: FROGGER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 8x8 Frog Sprites: [Idle, Leap] for 4 directions
const FROG_SPRITES = {
  up_idle:    [0x42, 0xff, 0x7e, 0x3c, 0x7e, 0xe7, 0x81, 0x00],
  up_leap:    [0x81, 0x42, 0x7e, 0x3c, 0x7e, 0xbd, 0xc3, 0x81],
  down_idle:  [0x81, 0xe7, 0x7e, 0x3c, 0x7e, 0xff, 0x42, 0x00],
  down_leap:  [0x81, 0xc3, 0xbd, 0x7e, 0x3c, 0x7e, 0x42, 0x81],
  left_idle:  [0x24, 0xbe, 0x7f, 0x7d, 0x7d, 0x7f, 0xbe, 0x24],
  left_leap:  [0x81, 0x43, 0x3e, 0xbd, 0xbd, 0x3e, 0x43, 0x81],
  right_idle: [0x24, 0x7d, 0xfe, 0xbe, 0xbe, 0xfe, 0x7d, 0x24],
  right_leap: [0x81, 0xc2, 0x7c, 0xbd, 0xbd, 0x7c, 0xc2, 0x81]
};

// 9. FROGGER
CARTS[9] = {
  id: 9,
  name: "FROGGER",
  genre: 0,
  scoreLabel: "PTS",
  desc: "GUIDE FROGS ACROSS 5 HIGHWAY LANES AND 5 RIVER LOGS INTO GOAL HOMES.",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // River lane with floating log
    g.rect(x + 2, y + 2, 28, 9, 0);
    g.rect(x + 5, y + 4, 18, 5, 2);
    g.line(x + 7, y + 5, x + 15, y + 5, 1);
    // Lily pad with sitting frog
    g.rect(x + 2, y + 11, 28, 8, 1);
    g.disc(x + 16, y + 15, 4, 3);
    g.px(x + 14, y + 13, 0);
    g.px(x + 18, y + 13, 0);
    // Highway lane with sport car
    g.rect(x + 2, y + 19, 28, 11, 0);
    g.rect(x + 6, y + 23, 18, 5, 3);
    g.rect(x + 10, y + 21, 9, 3, 3);
    g.px(x + 8, y + 27, 2);
    g.px(x + 20, y + 27, 2);
  },

  createRoadLanes() {
    return [
      // Lane 1 (Row 12, y=192): Sport cars (left)
      { row: 12, y: 192, type: 'sport', len: 24, speed: -68, period: 270, items: [{ x: 20 }, { x: 110 }, { x: 200 }] },
      // Lane 2 (Row 11, y=176): Tractors (right)
      { row: 11, y: 176, type: 'tractor', len: 22, speed: 38, period: 270, items: [{ x: 10 }, { x: 100 }, { x: 190 }] },
      // Lane 3 (Row 10, y=160): Sedans (left)
      { row: 10, y: 160, type: 'sedan', len: 24, speed: -58, period: 270, items: [{ x: 30 }, { x: 120 }, { x: 210 }] },
      // Lane 4 (Row 9, y=144): Racecars (right, fast)
      { row: 9, y: 144, type: 'racecar', len: 24, speed: 102, period: 280, items: [{ x: 40 }, { x: 180 }] },
      // Lane 5 (Row 8, y=128): Semi-Trucks (left, long)
      { row: 8, y: 128, type: 'truck', len: 44, speed: -48, period: 280, items: [{ x: 20 }, { x: 160 }] }
    ];
  },

  createRiverLanes() {
    return [
      // Lane 1 (Row 6, y=96): Swimming turtles (left)
      {
        row: 6, y: 96, type: 'turtle', len: 34, count: 3, speed: -46, period: 270,
        items: [
          { x: 10, canDive: false, diveTimer: 0, diveState: 0 },
          { x: 100, canDive: true, diveTimer: 3.5, diveState: 0 },
          { x: 190, canDive: false, diveTimer: 0, diveState: 0 }
        ]
      },
      // Lane 2 (Row 5, y=80): Small logs (right)
      { row: 5, y: 80, type: 'log', len: 42, speed: 40, period: 270, items: [{ x: 15 }, { x: 105 }, { x: 195 }] },
      // Lane 3 (Row 4, y=64): Long logs (right)
      { row: 4, y: 64, type: 'log', len: 96, speed: 64, period: 300, items: [{ x: 20 }, { x: 170 }] },
      // Lane 4 (Row 3, y=48): Diving turtles (left)
      {
        row: 3, y: 48, type: 'turtle', len: 22, count: 2, speed: -54, period: 280,
        items: [
          { x: 15, canDive: true, diveTimer: 0, diveState: 0 },
          { x: 85, canDive: false, diveTimer: 0, diveState: 0 },
          { x: 155, canDive: true, diveTimer: 3.2, diveState: 0 },
          { x: 225, canDive: false, diveTimer: 0, diveState: 0 }
        ]
      },
      // Lane 5 (Row 2, y=32): Medium logs (right)
      { row: 2, y: 32, type: 'log', len: 64, speed: 48, period: 270, items: [{ x: 25 }, { x: 115 }, { x: 205 }] }
    ];
  },

  init() {
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.speedMult = 1.0;
    this.over = false;
    this.gameTime = 0;
    this.highScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? (SAVE.getScore(this.id) || 0) : 0;
    this.homes = [false, false, false, false, false];
    this.fly = { active: false, homeIdx: -1, timer: 0 };
    this.flySpawnTimer = 4.0 + Math.random() * 4.0;
    this.flyScoreTimer = 0;
    this.flyScorePos = { x: 0, y: 0 };
    this.roadLanes = this.createRoadLanes();
    this.riverLanes = this.createRiverLanes();
    this.respawnFrog();
  },

  respawnFrog() {
    this.fx = 124;
    this.fy = 212; // Row 13 (Bottom sidewalk)
    this.facing = 'up';
    this.timer = 30.0;
    this.highestRow = 13;
    this.dead = false;
    this.deathReason = null;
    this.deadTimer = 0;
    this.hopCooldown = 0;
    this.hopAnimTimer = 0;
  },

  hop(dir) {
    if (this.dead || this.over) return;
    this.facing = dir;
    this.hopAnimTimer = 0.12;
    this.hopCooldown = 0.12;
    APU.sfx('JUMP');

    let targetX = this.fx;
    let targetY = this.fy;
    const step = 16;

    if (dir === 'up') targetY -= step;
    else if (dir === 'down') targetY = Math.min(212, targetY + step);
    else if (dir === 'left') targetX = Math.max(4, targetX - step);
    else if (dir === 'right') targetX = Math.min(244, targetX + step);

    // Forward progress scoring: award +10 pts for each new forward row reached
    const targetRow = Math.round((targetY - 4) / 16);
    if (targetRow < this.highestRow) {
      this.score += 10 * (this.highestRow - targetRow);
      this.highestRow = targetRow;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        if (typeof SAVE !== 'undefined' && SAVE.setScore) SAVE.setScore(this.id, this.highScore);
      }
    }

    this.fx = targetX;
    this.fy = targetY;

    // Check immediate home landing if jumped into Row 1
    if (this.fy < 32) {
      this.checkHomeLanding();
    }
  },

  die(reason) {
    if (this.dead || this.over) return;
    this.dead = true;
    this.deadTimer = 0.8;
    this.deathReason = reason;
    this.lives--;

    if (reason === 'SQUASH' || reason === 'WALL') {
      APU.sfx('HIT');
    } else if (reason === 'DROWN') {
      APU.sfx('SPLASH');
    } else if (reason === 'TIMEOUT') {
      APU.sfx('ALARM');
    }

    if (this.lives <= 0) {
      this.over = true;
      if (typeof SAVE !== 'undefined' && SAVE.setScore) {
        SAVE.setScore(this.id, this.highScore);
      }
    }
  },

  checkHomeLanding() {
    const frogCx = this.fx + 4;
    let matchedHome = -1;

    for (let i = 0; i < 5; i++) {
      const minX = 16 + i * 50;
      const maxX = minX + 24;
      if (frogCx >= minX + 2 && frogCx <= maxX - 2) {
        matchedHome = i;
        break;
      }
    }

    if (matchedHome >= 0) {
      if (this.homes[matchedHome]) {
        // Already occupied
        this.die('WALL');
      } else {
        // Successful home landing!
        this.homes[matchedHome] = true;
        let earned = 50 + Math.max(0, Math.floor(this.timer)) * 10;

        if (this.fly.active && this.fly.homeIdx === matchedHome) {
          earned += 200;
          this.fly.active = false;
          this.flyScoreTimer = 1.2;
          this.flyScorePos = { x: 16 + matchedHome * 50 + 2, y: 18 };
          APU.sfx('COIN');
        } else {
          APU.sfx('LEVELUP');
        }

        this.score += earned;
        if (this.score > this.highScore) {
          this.highScore = this.score;
          if (typeof SAVE !== 'undefined' && SAVE.setScore) SAVE.setScore(this.id, this.highScore);
        }

        // Check if all 5 homes are filled
        if (this.homes.every(Boolean)) {
          this.score += 1000;
          if (this.score > this.highScore) {
            this.highScore = this.score;
            if (typeof SAVE !== 'undefined' && SAVE.setScore) SAVE.setScore(this.id, this.highScore);
          }
          this.wave++;
          this.homes.fill(false);
          this.speedMult = 1.0 + (this.wave - 1) * 0.14;
          APU.sfx('LEVELUP');
        }

        this.respawnFrog();
      }
    } else {
      // Landed on divider hedge
      this.die('WALL');
    }
  },

  update(dt) {
    // Game Over input handling
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || PAD.swipe || PAD.tapPos) {
        this.init();
      }
      return;
    }

    this.gameTime += dt;

    // Death state animation handling
    if (this.dead) {
      this.deadTimer -= dt;
      if (this.deadTimer <= 0) {
        if (this.lives > 0) {
          this.respawnFrog();
        } else {
          this.dead = false;
        }
      }
      return;
    }

    // Round countdown timer
    const prevTimer = this.timer;
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = 0;
      this.die('TIMEOUT');
      return;
    }
    // Low time tick warning
    if (this.timer <= 5.0 && Math.floor(prevTimer) !== Math.floor(this.timer)) {
      APU.sfx('TICK');
    }

    if (this.flyScoreTimer > 0) {
      this.flyScoreTimer -= dt;
    }

    // Cooldown timers
    if (this.hopCooldown > 0) this.hopCooldown -= dt;
    if (this.hopAnimTimer > 0) this.hopAnimTimer -= dt;

    // Update Road hazards
    for (const lane of this.roadLanes) {
      const spd = lane.speed * this.speedMult;
      for (const c of lane.items) {
        c.x += spd * dt;
        if (spd > 0 && c.x > 260) c.x -= lane.period;
        if (spd < 0 && c.x < -lane.len - 10) c.x += lane.period;
      }
    }

    // Update River hazards & diving turtle state machine
    for (const lane of this.riverLanes) {
      const spd = lane.speed * this.speedMult;
      for (const item of lane.items) {
        item.x += spd * dt;
        if (spd > 0 && item.x > 260) item.x -= lane.period;
        if (spd < 0 && item.x < -lane.len - 10) item.x += lane.period;

        if (lane.type === 'turtle' && item.canDive) {
          item.diveTimer = (item.diveTimer + dt) % 6.6;
          if (item.diveTimer < 3.2) {
            item.diveState = 0; // SWIMMING
          } else if (item.diveTimer < 4.2) {
            item.diveState = 1; // WARNING DIVE
          } else if (item.diveTimer < 5.8) {
            item.diveState = 2; // SUBMERGED
          } else {
            item.diveState = 3; // SURFACING
          }
        } else {
          item.diveState = 0;
        }
      }
    }

    // Update bonus fly
    if (!this.fly.active) {
      this.flySpawnTimer -= dt;
      if (this.flySpawnTimer <= 0) {
        const empty = [];
        for (let i = 0; i < 5; i++) {
          if (!this.homes[i]) empty.push(i);
        }
        if (empty.length > 0) {
          this.fly.homeIdx = empty[Math.floor(Math.random() * empty.length)];
          this.fly.active = true;
          this.fly.timer = 5.0;
        }
        this.flySpawnTimer = 6.0 + Math.random() * 6.0;
      }
    } else {
      this.fly.timer -= dt;
      if (this.fly.timer <= 0 || (this.fly.homeIdx >= 0 && this.homes[this.fly.homeIdx])) {
        this.fly.active = false;
        this.fly.homeIdx = -1;
      }
    }

    // Input handling: D-pad, Swipe gestures, and Screen touch zones
    if (this.hopCooldown <= 0) {
      let hopDir = null;

      if (PAD.hit('up')) hopDir = 'up';
      else if (PAD.hit('down')) hopDir = 'down';
      else if (PAD.hit('left')) hopDir = 'left';
      else if (PAD.hit('right')) hopDir = 'right';

      if (!hopDir && PAD.swipe) {
        hopDir = PAD.swipe;
      }

      if (!hopDir && PAD.tapPos) {
        const dx = PAD.tapPos.x - (this.fx + 4);
        const dy = PAD.tapPos.y - (this.fy + 4);
        if (Math.abs(dy) >= Math.abs(dx)) {
          hopDir = dy < 0 ? 'up' : 'down';
        } else {
          hopDir = dx < 0 ? 'left' : 'right';
        }
      }

      if (hopDir) {
        this.hop(hopDir);
        if (this.dead) return;
      }
    }

    // River physics: check platform support & log riding
    const frogRow = Math.round((this.fy - 4) / 16);
    if (frogRow >= 2 && frogRow <= 6) {
      const lane = this.riverLanes.find(l => l.row === frogRow);
      let supported = false;
      let platSpeed = 0;
      const frogCx = this.fx + 4;

      if (lane) {
        for (const item of lane.items) {
          const left = item.x;
          const right = item.x + lane.len;
          if (frogCx >= left + 1 && frogCx <= right - 1) {
            if (lane.type === 'turtle' && item.diveState === 2) {
              // Turtle submerged under water!
              supported = false;
            } else {
              supported = true;
              platSpeed = lane.speed * this.speedMult;
              break;
            }
          }
        }
      }

      if (supported) {
        this.fx += platSpeed * dt;
        if (this.fx < 0 || this.fx > 248) {
          this.die('DROWN');
          return;
        }
      } else {
        // Plunged into river water!
        this.die('DROWN');
        return;
      }
    }

    // Road physics: collision with vehicles
    if (frogRow >= 8 && frogRow <= 12) {
      const lane = this.roadLanes.find(l => l.row === frogRow);
      if (lane) {
        const frogLeft = this.fx + 1;
        const frogRight = this.fx + 7;
        for (const item of lane.items) {
          const vehLeft = item.x;
          const vehRight = item.x + lane.len;
          if (frogRight >= vehLeft && frogLeft <= vehRight) {
            this.die('SQUASH');
            return;
          }
        }
      }
    }
  },

  drawSportCar(g, x, y, len) {
    const rx = Math.floor(x);
    // Body & Cabin
    g.rect(rx + 2, y + 5, len - 4, 5, 3);
    g.rect(rx + 7, y + 2, len - 13, 4, 3);
    // Windows
    g.px(rx + 6, y + 3, 0);
    g.px(rx + 6, y + 4, 0);
    g.px(rx + len - 6, y + 3, 0);
    // Wheels
    g.rect(rx + 4, y + 9, 4, 3, 2);
    g.rect(rx + len - 8, y + 9, 4, 3, 2);
    // Headlight (front is left) & rear spoiler
    g.px(rx + 2, y + 6, 3);
    g.line(rx + len - 4, y + 2, rx + len - 2, y + 2, 3);
  },

  drawTractor(g, x, y, len) {
    const rx = Math.floor(x);
    // Front is right!
    // Giant rear wheel (left) & small front wheel (right)
    g.disc(rx + 5, y + 8, 4, 2);
    g.px(rx + 5, y + 8, 3);
    g.disc(rx + len - 5, y + 10, 2, 2);
    // Cab & Hood
    g.rect(rx + 3, y + 2, 9, 5, 3);
    g.rect(rx + 5, y + 3, 5, 3, 0);
    g.rect(rx + 12, y + 5, len - 14, 5, 3);
    // Exhaust stack & smoke puff
    g.line(rx + 13, y + 1, rx + 13, y + 5, 3);
    if (Math.floor(this.gameTime * 6) % 2 === 0) g.px(rx + 14, y, 2);
    // Front scoop
    g.line(rx + len - 1, y + 6, rx + len - 1, y + 10, 2);
  },

  drawSedan(g, x, y, len) {
    const rx = Math.floor(x);
    // Front is left!
    g.rect(rx + 1, y + 5, len - 2, 5, 2);
    g.rect(rx + 5, y + 2, len - 10, 4, 2);
    // Windows
    g.rect(rx + 6, y + 3, 4, 2, 0);
    g.rect(rx + 12, y + 3, 4, 2, 0);
    // Wheels & Bumpers
    g.rect(rx + 3, y + 9, 3, 3, 3);
    g.rect(rx + len - 7, y + 9, 3, 3, 3);
    g.line(rx, y + 6, rx, y + 9, 3);
    g.line(rx + len - 1, y + 6, rx + len - 1, y + 9, 3);
  },

  drawRacecar(g, x, y, len) {
    const rx = Math.floor(x);
    // Front is right!
    g.rect(rx + 8, y + 5, len - 9, 3, 3);
    g.px(rx + len - 1, y + 6, 3);
    g.line(rx + len - 3, y + 2, rx + len - 3, y + 10, 2);
    // Cockpit
    g.rect(rx + 6, y + 4, 4, 5, 2);
    g.px(rx + 8, y + 6, 0);
    // Rear wing & wide tires
    g.line(rx + 1, y + 1, rx + 1, y + 11, 3);
    g.line(rx + 2, y + 6, rx + 5, y + 6, 3);
    g.rect(rx + len - 6, y + 1, 3, 2, 2);
    g.rect(rx + len - 6, y + 9, 3, 2, 2);
    g.rect(rx + 3, y + 1, 4, 2, 2);
    g.rect(rx + 3, y + 9, 4, 2, 2);
  },

  drawTruck(g, x, y, len) {
    const rx = Math.floor(x);
    // Front is left!
    // Truck Cab
    g.rect(rx + 1, y + 3, 10, 7, 3);
    g.rect(rx + 2, y + 4, 3, 3, 0);
    g.line(rx + 11, y + 1, rx + 11, y + 4, 2);
    // Trailer
    g.rect(rx + 14, y + 1, len - 15, 9, 2);
    for (let px = rx + 18; px < rx + len - 4; px += 6) {
      g.line(px, y + 2, px, y + 9, 1);
    }
    g.line(rx + 14, y + 1, rx + len - 1, y + 1, 3);
    // Wheels
    g.rect(rx + 3, y + 9, 4, 3, 1);
    g.rect(rx + len - 12, y + 9, 4, 3, 1);
    g.rect(rx + len - 6, y + 9, 4, 3, 1);
  },

  drawLog(g, x, y, len) {
    const rx = Math.floor(x);
    // Main wood body
    g.rect(rx + 2, y, len - 4, 12, 2);
    // Rounded bark ends
    g.line(rx + 1, y + 1, rx + 1, y + 10, 2);
    g.line(rx, y + 3, rx, y + 8, 2);
    g.line(rx + len - 2, y + 1, rx + len - 2, y + 10, 2);
    g.line(rx + len - 1, y + 3, rx + len - 1, y + 8, 2);
    // Dark bark outline top/bottom
    g.line(rx + 2, y, rx + len - 3, y, 1);
    g.line(rx + 2, y + 11, rx + len - 3, y + 11, 1);
    // Tree rings at ends
    g.line(rx + 3, y + 3, rx + 3, y + 8, 1);
    g.px(rx + 4, y + 5, 3);
    g.px(rx + 4, y + 6, 3);
    // Wood grain lines
    for (let gx = rx + 10; gx < rx + len - 8; gx += 16) {
      g.line(gx, y + 3, gx + 8, y + 3, 1);
      g.line(gx + 4, y + 8, gx + 12, y + 8, 1);
    }
  },

  drawTurtleFormation(g, x, y, count, diveState) {
    const rx = Math.floor(x);
    for (let k = 0; k < count; k++) {
      const tx = rx + k * 12;

      if (diveState === 0) {
        // SWIMMING: full shell, head, paddling flippers
        g.disc(tx + 5, y + 6, 4, 2);
        g.circle(tx + 5, y + 6, 4, 3);
        g.px(tx + 5, y + 6, 1);
        g.disc(tx + 1, y + 6, 2, 3);
        g.px(tx, y + 5, 0);

        const anim = Math.floor(this.gameTime * 8) % 2;
        if (anim === 0) {
          g.line(tx + 2, y + 1, tx + 4, y + 3, 3);
          g.line(tx + 2, y + 11, tx + 4, y + 9, 3);
          g.line(tx + 7, y + 2, tx + 9, y + 1, 3);
          g.line(tx + 7, y + 10, tx + 9, y + 11, 3);
        } else {
          g.line(tx + 1, y + 3, tx + 3, y + 4, 3);
          g.line(tx + 1, y + 9, tx + 3, y + 8, 3);
          g.line(tx + 6, y + 1, tx + 8, y + 2, 3);
          g.line(tx + 6, y + 11, tx + 8, y + 10, 3);
        }
      } else if (diveState === 1) {
        // WARNING DIVE: shells dipping, water ripples
        g.disc(tx + 5, y + 6, 3, 2);
        g.circle(tx + 5, y + 6, 3, 1);
        g.circle(tx + 5, y + 6, 5, 1);
        g.px(tx + 1, y + 6, 2);
      } else if (diveState === 2) {
        // FULLY SUBMERGED: underwater bubbles and ripples only
        const phase = Math.floor(this.gameTime * 4) % 3;
        g.circle(tx + 5, y + 6, 3 + phase, 1);
        g.px(tx + 4, y + 5, 1);
        g.px(tx + 6, y + 7, 1);
      } else if (diveState === 3) {
        // SURFACING: shell breaking water, splash droplets
        g.rect(tx + 3, y + 4, 5, 4, 2);
        g.px(tx + 2, y + 3, 3);
        g.px(tx + 8, y + 3, 3);
        g.circle(tx + 5, y + 6, 6, 1);
      }
    }
  },

  drawFly(g, x, y) {
    const flap = Math.floor(this.gameTime * 14) % 2;
    g.disc(x + 12, y + 8, 2, 0);
    g.px(x + 12, y + 6, 3);
    if (flap === 0) {
      g.line(x + 9, y + 7, x + 11, y + 8, 3);
      g.line(x + 15, y + 7, x + 13, y + 8, 3);
    } else {
      g.line(x + 9, y + 9, x + 11, y + 8, 3);
      g.line(x + 15, y + 9, x + 13, y + 8, 3);
    }
  },

  drawHomeFrog(g, x, y) {
    const cx = x + 12;
    const cy = y + 8;
    g.disc(cx, cy, 4, 3);
    g.px(cx - 2, cy - 4, 3);
    g.px(cx + 2, cy - 4, 3);
    g.px(cx - 2, cy - 3, 0);
    g.px(cx + 2, cy - 3, 0);
    g.line(cx - 5, cy + 2, cx - 3, cy + 4, 3);
    g.line(cx + 5, cy + 2, cx + 3, cy + 4, 3);
  },

  render(g) {
    g.clear(0);

    // 1. Top HUD (Row 0, y=0..15)
    g.rect(0, 0, 256, 16, 0);
    g.text("1-UP " + this.score, 8, 5, 3);
    g.textC("HI " + Math.max(this.score, this.highScore), 5, 3);
    g.textR("WAVE " + this.wave, 248, 5, 2);
    g.line(0, 15, 255, 15, 2);

    // 2. Goal Homes & Hedge Dividers (Row 1, y=16..31)
    const hedgeRanges = [
      [0, 16], [40, 26], [90, 26], [140, 26], [190, 26], [240, 16]
    ];
    for (const [hx, hw] of hedgeRanges) {
      g.rect(hx, 16, hw, 16, 1);
      g.dither(hx, 16, hw, 16, 1, 2);
      g.box(hx, 16, hw, 16, 2);
      for (let lx = hx + 2; lx < hx + hw - 2; lx += 6) {
        g.px(lx, 20, 3);
        g.px(lx + 3, 26, 3);
      }
    }

    // 5 Home Bays
    for (let i = 0; i < 5; i++) {
      const bx = 16 + i * 50;
      g.rect(bx, 16, 24, 16, 0);
      g.line(bx, 31, bx + 23, 31, 1);
      // Lily pad base
      g.disc(bx + 12, 24, 6, 1);
      g.circle(bx + 12, 24, 6, 2);
      g.line(bx + 12, 24, bx + 16, 27, 0);

      if (this.homes[i]) {
        this.drawHomeFrog(g, bx, 16);
      } else if (this.fly.active && this.fly.homeIdx === i) {
        this.drawFly(g, bx, 16);
      }
    }

    // 3. River Flowing Currents & Background (Rows 2-6, y=32..111)
    g.rect(0, 32, 256, 80, 0);
    for (let r = 0; r < 5; r++) {
      const ry = 36 + r * 16;
      const flowDir = (r % 2 === 0) ? 1 : -1;
      const offset = (this.gameTime * 24 * flowDir) % 32;
      for (let rx = -32; rx < 288; rx += 32) {
        const wx = Math.floor(rx + offset);
        if (wx >= 0 && wx < 250) {
          g.line(wx, ry + 12, wx + 6, ry + 12, 1);
          g.px(wx + 10, ry + 13, 1);
        }
      }
    }

    // River Hazards (Logs & Turtles)
    for (const lane of this.riverLanes) {
      for (const item of lane.items) {
        if (lane.type === 'log') {
          this.drawLog(g, item.x, lane.y + 2, lane.len);
        } else if (lane.type === 'turtle') {
          this.drawTurtleFormation(g, item.x, lane.y + 2, lane.count, item.diveState);
        }
      }
    }

    // 4. Safe Middle Median Sidewalk (Row 7, y=112..127)
    g.rect(0, 112, 256, 16, 1);
    g.dither(0, 112, 256, 16, 1, 2);
    g.line(0, 112, 255, 112, 3);
    g.line(0, 127, 255, 127, 3);
    for (let sx = 0; sx < 256; sx += 32) {
      g.line(sx, 113, sx, 126, 2);
    }

    // 5. Highway Road & Lanes (Rows 8-12, y=128..207)
    g.rect(0, 128, 256, 80, 0);
    for (let ly = 144; ly <= 192; ly += 16) {
      for (let lx = 0; lx < 256; lx += 16) {
        g.line(lx, ly, lx + 8, ly, 1);
      }
    }

    // Road Vehicles
    for (const lane of this.roadLanes) {
      for (const item of lane.items) {
        if (lane.type === 'sport') {
          this.drawSportCar(g, item.x, lane.y + 2, lane.len);
        } else if (lane.type === 'tractor') {
          this.drawTractor(g, item.x, lane.y + 2, lane.len);
        } else if (lane.type === 'sedan') {
          this.drawSedan(g, item.x, lane.y + 2, lane.len);
        } else if (lane.type === 'racecar') {
          this.drawRacecar(g, item.x, lane.y + 2, lane.len);
        } else if (lane.type === 'truck') {
          this.drawTruck(g, item.x, lane.y + 2, lane.len);
        }
      }
    }

    // 6. Safe Bottom Starting Sidewalk (Row 13, y=208..223)
    g.rect(0, 208, 256, 16, 1);
    g.dither(0, 208, 256, 16, 1, 2);
    g.line(0, 208, 255, 208, 3);
    g.line(0, 223, 255, 223, 3);
    for (let sx = 0; sx < 256; sx += 32) {
      g.line(sx, 209, sx, 222, 2);
    }

    // 7. Player Frog / Death Effects
    if (!this.dead) {
      const isLeap = this.hopAnimTimer > 0;
      const spriteKey = this.facing + '_' + (isLeap ? 'leap' : 'idle');
      const rows = FROG_SPRITES[spriteKey] || FROG_SPRITES.up_idle;
      const drawY = Math.round(this.fy) + (isLeap ? -2 : 0);
      g.sprite(Math.round(this.fx), drawY, 8, 8, rows, 3);
    } else {
      const cx = Math.round(this.fx) + 4;
      const cy = Math.round(this.fy) + 4;
      const prog = 1.0 - (this.deadTimer / 0.8);

      if (this.deathReason === 'SQUASH') {
        const r = Math.floor(3 + prog * 4);
        g.disc(cx, cy, r, 2);
        g.line(cx - 3, cy - 3, cx + 3, cy + 3, 3);
        g.line(cx - 3, cy + 3, cx + 3, cy - 3, 3);
      } else if (this.deathReason === 'DROWN') {
        const r1 = Math.floor(prog * 12);
        const r2 = Math.max(0, r1 - 4);
        if (r1 > 0) g.circle(cx, cy, r1, 3);
        if (r2 > 0) g.circle(cx, cy, r2, 2);
        g.px(cx - 3, cy - 2, 3);
        g.px(cx + 3, cy - 2, 3);
      } else {
        g.circle(cx, cy, 6, 3);
        g.text("X", cx - 2, cy - 3, 3);
      }
    }

    // Floating Bonus Fly score text
    if (this.flyScoreTimer > 0) {
      const rise = Math.floor((1.2 - this.flyScoreTimer) * 8);
      g.text("+200", this.flyScorePos.x, this.flyScorePos.y - rise, 3);
    }

    // 8. Bottom Bar & HUD (Row 14, y=224..239)
    g.rect(0, 224, 256, 16, 0);
    g.line(0, 224, 255, 224, 2);
    // Lives frogs
    g.text("FROGS", 8, 229, 2);
    for (let i = 0; i < Math.max(0, this.lives - 1); i++) {
      const lx = 42 + i * 11;
      g.rect(lx, 229, 5, 4, 3);
      g.px(lx - 1, 228, 3); g.px(lx + 5, 228, 3);
      g.px(lx - 1, 233, 3); g.px(lx + 5, 233, 3);
    }
    // Time Bar
    g.text("TIME", 112, 229, 2);
    g.box(140, 228, 108, 8, 2);
    const timeRatio = Math.max(0, this.timer / 30.0);
    const fillW = Math.floor(timeRatio * 104);
    const isBlink = this.timer < 6.0 && (Math.floor(this.timer * 4) % 2 === 0);
    const barCol = isBlink ? 1 : 3;
    if (fillW > 0) {
      g.rect(142, 230, fillW, 4, barCol);
    }

    // 9. Game Over Overlay
    if (this.over) {
      g.dither(56, 88, 144, 64, 0, 1);
      g.box(56, 88, 144, 64, 3);
      g.box(58, 90, 140, 60, 2);
      g.textC("GAME OVER", 98, 3);
      g.textC("FINAL: " + this.score, 112, 3);
      g.textC("HI: " + this.highScore, 124, 2);
      const blink = Math.floor(this.gameTime * 3) % 2 === 0;
      if (blink) g.textC("[A] OR TAP TO RETRY", 138, 3);
    }
  }
};
