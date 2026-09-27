// js/cartridges/cart_077_crowd_evac.js
// ============================================================================
// Cartridge #077: CROWD EVAC
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[77] = {
  id: 77,
  name: "CROWD EVAC",
  genre: 7,
  scoreLabel: "SAVED",
  desc: "DIRECT BULKHEAD DOORS AND SPRINKLERS TO GUIDE CIVILIANS SAFELY PAST FIRES TO EXITS!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Exit door sign
    g.box(x + 22, y + 6, 8, 20, 3);
    g.line(x + 22, y + 16, x + 28, y + 16, 1);
    // Running agents
    g.disc(x + 8, y + 12, 2, 3);
    g.line(x + 8, y + 14, x + 8, y + 22, 2);
    g.line(x + 8, y + 22, x + 6, y + 27, 2);
    g.line(x + 8, y + 22, x + 11, y + 26, 2);

    g.disc(x + 15, y + 14, 2, 2);
    g.line(x + 15, y + 16, x + 15, y + 23, 2);
    g.line(x + 15, y + 23, x + 13, y + 28, 2);
    g.line(x + 15, y + 23, x + 18, y + 27, 2);
    // Fire flames
    g.tri(x + 3, y + 28, x + 5, y + 21, x + 7, y + 28, 3);
  },

  init() {
    this.level = 1;
    this.totalSaved = 0;
    this.totalLost = 0;
    this.state = 'TITLE'; // 'TITLE', 'PLAY', 'WAVECLEAR', 'GAMEOVER'
    this.stateTimer = 0;
    this.waterCooldown = 0;
    this.waterMax = 3;
    this.waterCharges = 3;

    this.doors = [];
    this.selectedDoor = 0;
    this.agents = [];
    this.fires = [];
    this.particles = [];
    this.exits = [];
    this.walls = [];
    this.sprinklers = [];
    this.alarmBlink = 0;

    this.startLevel(1);
  },

  startLevel(lvl) {
    this.level = lvl;
    this.state = 'PLAY';
    this.stateTimer = 0;
    this.waterCharges = 3;
    this.waterCooldown = 0;
    this.particles = [];
    this.sprinklers = [];

    // Facility rooms layout (240x240 CRT)
    // 3 main corridors / 4 chambers
    this.walls = [
      // Outer bounds
      { x1: 12, y1: 24, x2: 228, y2: 24 },
      { x1: 12, y1: 224, x2: 228, y2: 224 },
      { x1: 12, y1: 24, x2: 12, y2: 224 },
      { x1: 228, y1: 24, x2: 228, y2: 90 },
      { x1: 228, y1: 150, x2: 228, y2: 224 }, // Exit gap at (228, 90-150)

      // Internal dividing walls
      { x1: 80, y1: 24, x2: 80, y2: 100 },
      { x1: 80, y1: 140, x2: 80, y2: 224 },

      { x1: 155, y1: 24, x2: 155, y2: 70 },
      { x1: 155, y1: 110, x2: 155, y2: 170 },
      { x1: 155, y1: 200, x2: 155, y2: 224 },

      // Horizontal dividers
      { x1: 12, y1: 124, x2: 50, y2: 124 },
      { x1: 80, y1: 124, x2: 155, y2: 124 }
    ];

    // Exits: East side safety dock
    this.exits = [
      { x: 228, y: 92, w: 10, h: 56, label: "EXIT 1" }
    ];
    if (lvl >= 2) {
      // Add top exit gap
      this.exits.push({ x: 100, y: 20, w: 40, h: 6, label: "ROOF" });
    }

    // Bulkhead controllable doors
    this.doors = [
      { id: 0, x: 80, y: 100, w: 4, h: 40, open: true, label: "D1", orient: 'V' },
      { id: 1, x: 155, y: 70, w: 4, h: 40, open: true, label: "D2", orient: 'V' },
      { id: 2, x: 155, y: 170, w: 4, h: 30, open: false, label: "D3", orient: 'V' },
      { id: 3, x: 50, y: 124, w: 30, h: 4, open: true, label: "D4", orient: 'H' }
    ];
    if (lvl >= 2) {
      this.doors.push({ id: 4, x: 100, y: 24, w: 40, h: 4, open: true, label: "D5", orient: 'H' });
    }
    this.selectedDoor = 0;

    // Spawn crowd
    var count = 25 + lvl * 10;
    this.agents = [];
    for (var i = 0; i < count; i++) {
      var spawnX = 20 + Math.random() * 55;
      var spawnY = 35 + Math.random() * 180;
      this.agents.push({
        x: spawnX,
        y: spawnY,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        speed: 28 + Math.random() * 14,
        saved: false,
        dead: false,
        panic: 0,
        frame: Math.random() * 10
      });
    }

    // Spawn initial fires
    this.fires = [];
    var fireCount = 1 + lvl;
    for (var f = 0; f < fireCount; f++) {
      var fx = 25 + Math.random() * 45;
      var fy = 40 + Math.random() * 150;
      this.fires.push({ x: fx, y: fy, r: 8, spreadTimer: 0 });
    }
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;
    this.alarmBlink += dt * 4;

    if (this.state === 'TITLE') {
      if (PAD.hit('a') || PAD.hit('b') || TOUCH.down) {
        APU.sfx('CONFIRM');
        this.startLevel(1);
      }
      return;
    }

    if (this.state === 'WAVECLEAR') {
      if (this.stateTimer > 2.0 || PAD.hit('a') || TOUCH.down) {
        APU.sfx('CONFIRM');
        this.startLevel(this.level + 1);
      }
      return;
    }

    if (this.state === 'GAMEOVER') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    // Door selection
    if (PAD.hit('up') || PAD.hit('left')) {
      this.selectedDoor = (this.selectedDoor - 1 + this.doors.length) % this.doors.length;
      APU.sfx('SELECT');
    }
    if (PAD.hit('down') || PAD.hit('right')) {
      this.selectedDoor = (this.selectedDoor + 1) % this.doors.length;
      APU.sfx('SELECT');
    }

    // Touch tap on door directly
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      var hitDoor = false;
      for (var d = 0; d < this.doors.length; d++) {
        var dr = this.doors[d];
        var hitX = dr.orient === 'V' ? dr.x - 12 : dr.x;
        var hitY = dr.orient === 'H' ? dr.y - 12 : dr.y;
        var hitW = dr.orient === 'V' ? 24 : dr.w;
        var hitH = dr.orient === 'H' ? 24 : dr.h;
        if (tx >= hitX && tx <= hitX + hitW && ty >= hitY && ty <= hitY + hitH) {
          this.selectedDoor = d;
          dr.open = !dr.open;
          APU.sfx('CONFIRM');
          hitDoor = true;
          break;
        }
      }
      // Tap Extinguisher button bottom-right
      if (!hitDoor && tx > 160 && ty > 220) {
        this.triggerSprinkler();
      }
    }

    // Toggle Door [A]
    if (PAD.hit('a')) {
      var curDoor = this.doors[this.selectedDoor];
      if (curDoor) {
        curDoor.open = !curDoor.open;
        APU.sfx('CONFIRM');
      }
    }

    // Trigger Sprinkler [B]
    if (PAD.hit('b')) {
      this.triggerSprinkler();
    }

    if (this.waterCooldown > 0) {
      this.waterCooldown -= dt;
    }

    // Update Fire Spread
    for (var i = 0; i < this.fires.length; i++) {
      var fire = this.fires[i];
      fire.spreadTimer += dt;
      // Fire smoke particles
      if (Math.random() < 0.3) {
        this.particles.push({
          x: fire.x + (Math.random() - 0.5) * fire.r,
          y: fire.y + (Math.random() - 0.5) * fire.r,
          vx: (Math.random() - 0.5) * 6,
          vy: -8 - Math.random() * 10,
          life: 0.8,
          maxLife: 0.8,
          type: 'SMOKE'
        });
      }

      if (fire.spreadTimer > 3.0 && this.fires.length < 35) {
        fire.spreadTimer = 0;
        fire.r = Math.min(22, fire.r + 2);
        // Expand fire towards adjacent area if unobstructed by closed door
        var nAngle = Math.random() * Math.PI * 2;
        var nDist = fire.r + 6;
        var nfx = fire.x + Math.cos(nAngle) * nDist;
        var nfy = fire.y + Math.sin(nAngle) * nDist;

        // Check if inside map
        if (nfx > 20 && nfx < 220 && nfy > 30 && nfy < 220) {
          // Check if blocked by closed doors
          var blocked = false;
          for (var d = 0; d < this.doors.length; d++) {
            var door = this.doors[d];
            if (!door.open) {
              if (door.orient === 'V' && Math.abs(nfx - door.x) < 8 && nfy >= door.y && nfy <= door.y + door.h) {
                blocked = true;
              }
              if (door.orient === 'H' && Math.abs(nfy - door.y) < 8 && nfx >= door.x && nfx <= door.x + door.w) {
                blocked = true;
              }
            }
          }
          if (!blocked) {
            this.fires.push({ x: nfx, y: nfy, r: 6, spreadTimer: 0 });
          }
        }
      }
    }

    // Update Sprinklers
    for (var s = this.sprinklers.length - 1; s >= 0; s--) {
      var sp = this.sprinklers[s];
      sp.life -= dt;
      // Water foam particles
      for (var p = 0; p < 4; p++) {
        var ang = Math.random() * Math.PI * 2;
        var rad = Math.random() * sp.r;
        this.particles.push({
          x: sp.x + Math.cos(ang) * rad,
          y: sp.y + Math.sin(ang) * rad,
          vx: (Math.random() - 0.5) * 12,
          vy: 10 + Math.random() * 15,
          life: 0.4,
          maxLife: 0.4,
          type: 'WATER'
        });
      }
      // Extinguish nearby fires
      for (var f = this.fires.length - 1; f >= 0; f--) {
        var ff = this.fires[f];
        var distF = Math.hypot(sp.x - ff.x, sp.y - ff.y);
        if (distF < sp.r + ff.r) {
          ff.r -= dt * 15;
          if (ff.r <= 2) {
            this.fires.splice(f, 1);
            APU.sfx('HIT');
          }
        }
      }
      if (sp.life <= 0) {
        this.sprinklers.splice(s, 1);
      }
    }

    // Update Evacuees (Crowd AI)
    var activeCount = 0;
    for (var a = 0; a < this.agents.length; a++) {
      var ag = this.agents[a];
      if (ag.saved || ag.dead) continue;
      activeCount++;
      ag.frame += dt * 8;

      // Find nearest exit
      var targetExit = this.exits[0];
      var bestExitDist = 9999;
      for (var e = 0; e < this.exits.length; e++) {
        var ex = this.exits[e];
        var edist = Math.hypot((ex.x + ex.w / 2) - ag.x, (ex.y + ex.h / 2) - ag.y);
        if (edist < bestExitDist) {
          bestExitDist = edist;
          targetExit = ex;
        }
      }

      // Desired velocity towards exit
      var tx = targetExit.x + targetExit.w / 2;
      var ty = targetExit.y + targetExit.h / 2;
      var ddx = tx - ag.x;
      var ddy = ty - ag.y;
      var len = Math.hypot(ddx, ddy) || 1;
      var desVx = (ddx / len) * ag.speed;
      var desVy = (ddy / len) * ag.speed;

      // Repulsion from fires
      var panicForceX = 0;
      var panicForceY = 0;
      for (var f = 0; f < this.fires.length; f++) {
        var fire = this.fires[f];
        var fdx = ag.x - fire.x;
        var fdy = ag.y - fire.y;
        var fdist = Math.hypot(fdx, fdy);
        if (fdist < fire.r + 25 && fdist > 0.1) {
          var rep = (1 - fdist / (fire.r + 25)) * 60;
          panicForceX += (fdx / fdist) * rep;
          panicForceY += (fdy / fdist) * rep;
          ag.panic = 1.0;
        }
        // Burn collision
        if (fdist < fire.r + 3) {
          ag.dead = true;
          this.totalLost++;
          APU.sfx('HIT');
          // Spawn death burst
          for (var k = 0; k < 6; k++) {
            this.particles.push({
              x: ag.x, y: ag.y,
              vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20,
              life: 0.5, maxLife: 0.5, type: 'SMOKE'
            });
          }
          break;
        }
      }
      if (ag.dead) continue;

      if (ag.panic > 0) ag.panic -= dt * 0.5;

      // Combine flow
      ag.vx += (desVx + panicForceX - ag.vx) * dt * 4;
      ag.vy += (desVy + panicForceY - ag.vy) * dt * 4;

      // Apply movement with wall and closed door collisions
      var nextX = ag.x + ag.vx * dt;
      var nextY = ag.y + ag.vy * dt;

      // Check closed doors
      for (var d = 0; d < this.doors.length; d++) {
        var dr = this.doors[d];
        if (!dr.open) {
          if (dr.orient === 'V') {
            if (nextX >= dr.x - 3 && nextX <= dr.x + dr.w + 3 && nextY >= dr.y && nextY <= dr.y + dr.h) {
              nextX = ag.x;
              ag.vx = -ag.vx * 0.5;
            }
          } else {
            if (nextY >= dr.y - 3 && nextY <= dr.y + dr.h + 3 && nextX >= dr.x && nextX <= dr.x + dr.w) {
              nextY = ag.y;
              ag.vy = -ag.vy * 0.5;
            }
          }
        }
      }

      // Check walls
      if (nextX < 16) { nextX = 16; ag.vx = 0; }
      if (nextY < 28) { nextY = 28; ag.vy = 0; }
      if (nextY > 220) { nextY = 220; ag.vy = 0; }

      // Room divider lines collision
      if (ag.x <= 80 && nextX > 80 && (nextY < 100 || nextY > 140)) nextX = 80;
      if (ag.x >= 80 && nextX < 80 && (nextY < 100 || nextY > 140)) nextX = 80;
      if (ag.x <= 155 && nextX > 155 && (nextY < 70 || (nextY > 110 && nextY < 170) || nextY > 200)) nextX = 155;
      if (ag.x >= 155 && nextX < 155 && (nextY < 70 || (nextY > 110 && nextY < 170) || nextY > 200)) nextX = 155;

      ag.x = nextX;
      ag.y = nextY;

      // Check reach exit
      for (var e = 0; e < this.exits.length; e++) {
        var ex = this.exits[e];
        if (ag.x >= ex.x - 4 && ag.x <= ex.x + ex.w + 4 && ag.y >= ex.y && ag.y <= ex.y + ex.h) {
          ag.saved = true;
          this.totalSaved++;
          APU.sfx('COIN');
          SAVE.setScore(this.id, this.totalSaved * 100 - this.totalLost * 50);
          break;
        }
      }
    }

    // Update Particles
    for (var p = this.particles.length - 1; p >= 0; p--) {
      var pt = this.particles[p];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(p, 1);
    }

    // Check Wave Completion
    if (activeCount === 0) {
      if (this.totalLost >= this.agents.length * 0.6) {
        this.state = 'GAMEOVER';
        this.stateTimer = 0;
        APU.sfx('ERROR');
      } else {
        this.state = 'WAVECLEAR';
        this.stateTimer = 0;
        APU.sfx('FANFARE');
      }
    }
  },

  triggerSprinkler() {
    if (this.waterCharges > 0 && this.waterCooldown <= 0) {
      this.waterCharges--;
      this.waterCooldown = 1.2;
      APU.sfx('POWERUP');
      // Deploy extinguisher foam near selected door
      var dr = this.doors[this.selectedDoor];
      if (dr) {
        this.sprinklers.push({ x: dr.x, y: dr.y + dr.h / 2, r: 38, life: 1.5 });
      }
    } else {
      APU.sfx('ERROR');
    }
  },

  render(g) {
    g.clear(0);

    // Alarm warning banner flashing on edges
    var flash = Math.sin(this.alarmBlink) > 0;
    if (flash) {
      g.box(0, 0, 240, 240, 1);
    }

    // Header
    g.rect(0, 0, 240, 22, 1);
    g.text("EVAC LVL " + this.level, 6, 6, 3);
    g.text("SAVED:" + this.totalSaved, 82, 6, 3);
    g.text("LOST:" + this.totalLost, 142, 6, flash ? 3 : 2);
    g.textR("EXT:" + this.waterCharges, 234, 6, this.waterCharges > 0 ? 3 : 1);

    // Render Walls
    for (var w = 0; w < this.walls.length; w++) {
      var wl = this.walls[w];
      g.line(wl.x1, wl.y1, wl.x2, wl.y2, 2);
    }

    // Render Exits
    for (var e = 0; e < this.exits.length; e++) {
      var ex = this.exits[e];
      g.rect(ex.x, ex.y, ex.w, ex.h, 2);
      g.box(ex.x, ex.y, ex.w, ex.h, 3);
      g.text(ex.label, ex.x - 30, ex.y + ex.h / 2 - 3, 3);
    }

    // Render Doors
    for (var d = 0; d < this.doors.length; d++) {
      var dr = this.doors[d];
      var isSel = (d === this.selectedDoor);
      if (dr.open) {
        // Open door: dotted line
        if (dr.orient === 'V') {
          for (var dy = dr.y; dy < dr.y + dr.h; dy += 4) {
            g.px(dr.x, dy, isSel ? 3 : 2);
          }
        } else {
          for (var dx = dr.x; dx < dr.x + dr.w; dx += 4) {
            g.px(dx, dr.y, isSel ? 3 : 2);
          }
        }
      } else {
        // Closed door: solid thick barrier
        g.rect(dr.x - 1, dr.y - 1, dr.w + 2, dr.h + 2, 3);
      }
      // Label
      var lx = dr.orient === 'V' ? dr.x - 14 : dr.x + dr.w / 2 - 6;
      var ly = dr.orient === 'V' ? dr.y + dr.h / 2 - 3 : dr.y - 10;
      g.text(dr.label, lx, ly, isSel ? 3 : 1);
      if (isSel) {
        g.circle(dr.x + dr.w / 2, dr.y + dr.h / 2, 8, 3);
      }
    }

    // Render Fires
    for (var f = 0; f < this.fires.length; f++) {
      var fire = this.fires[f];
      var flicker = Math.sin(this.stateTimer * 15 + f) * 2;
      g.disc(fire.x, fire.y, Math.max(2, fire.r + flicker), 3);
      g.circle(fire.x, fire.y, Math.max(3, fire.r + flicker + 3), 2);
    }

    // Render Sprinklers Foam
    for (var s = 0; s < this.sprinklers.length; s++) {
      var sp = this.sprinklers[s];
      g.circle(sp.x, sp.y, sp.r, 2);
      g.dither(1);
      g.disc(sp.x, sp.y, sp.r * 0.7, 3);
      g.dither(0);
    }

    // Render Particles
    for (var p = 0; p < this.particles.length; p++) {
      var pt = this.particles[p];
      var col = pt.type === 'WATER' ? 2 : (pt.life > 0.4 ? 3 : 1);
      g.px(pt.x, pt.y, col);
    }

    // Render Evacuees
    for (var a = 0; a < this.agents.length; a++) {
      var ag = this.agents[a];
      if (ag.saved || ag.dead) continue;
      var col = ag.panic > 0.2 ? 3 : 2;
      // Head
      g.disc(ag.x, ag.y - 3, 2, col);
      // Torso & legs
      var legOff = Math.sin(ag.frame) * 2;
      g.line(ag.x, ag.y - 1, ag.x, ag.y + 3, col);
      g.line(ag.x, ag.y + 3, ag.x + legOff, ag.y + 6, col);
      g.line(ag.x, ag.y + 3, ag.x - legOff, ag.y + 6, col);
    }

    // Bottom Action Bar
    g.rect(0, 226, 240, 14, 0);
    g.line(0, 226, 240, 226, 2);
    g.text("D-PAD: SEL DOOR  [A]: TOGGLE", 4, 229, 2);
    g.textR("[B] EXTINGUISH", 236, 229, this.waterCharges > 0 ? 3 : 1);

    // Overlays
    if (this.state === 'TITLE') {
      g.rect(20, 50, 200, 140, 0);
      g.box(20, 50, 200, 140, 3);
      g.textC("CROWD EVACUATION", 68, 3);
      g.textC("BUILDING INFERNO DETECTED!", 90, 2);
      g.textC("D-PAD: SELECT BULKHEAD DOOR", 112, 2);
      g.textC("[A]: OPEN / CLOSE DOOR", 126, 2);
      g.textC("[B]: DISCHARGE FOAM SPRINKLER", 140, 2);
      g.textC("PRESS [A] TO COMMENCE", 166, flash ? 3 : 1);
    } else if (this.state === 'WAVECLEAR') {
      g.rect(30, 80, 180, 80, 0);
      g.box(30, 80, 180, 80, 3);
      g.textC("ZONE EVACUATED!", 95, 3);
      g.textC("CIVILIANS SAVED: " + this.totalSaved, 115, 2);
      g.textC("PROCEEDING TO NEXT SECTOR...", 135, flash ? 3 : 2);
    } else if (this.state === 'GAMEOVER') {
      g.rect(30, 80, 180, 80, 0);
      g.box(30, 80, 180, 80, 3);
      g.textC("CATASTROPHIC LOSS!", 95, 3);
      g.textC("CASUALTIES EXCEEDED 60%", 115, 2);
      g.textC("PRESS [A] TO RETRY", 135, flash ? 3 : 1);
    }
  }
};
