// js/cartridges/cart_092_thermostat.js
// ============================================================================
// Cartridge #092: THERMOSTAT
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[92] = {
  id: 92,
  name: "THERMOSTAT",
  genre: 9,
  scoreLabel: "TIME",
  desc: "OFFICE THERMOSTAT WAR: DEFEND THE 21.0°C DIAL AGAINST SNEAKING COWORKERS AND PREVENT ANARCHY!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Round thermostat dial
    g.circle(x + 16, y + 16, 11, 2);
    g.disc(x + 16, y + 16, 4, 3);
    g.line(x + 16, y + 16, x + 21, y + 10, 3);
  },

  init() {
    this.temp = 21.0;
    this.setpoint = 21.0;
    this.outsideTemp = 28.0; // Hot summer outside
    this.morale = 100.0;
    this.turboEnergy = 100.0;
    this.shiftTime = 0;

    this.sneaker = null; // Coworker sneaking up: { name, side, x, targetX, state: 'SNEAK'|'TAMPER'|'FLEE', timer }
    this.sneakTimer = 3.0;

    this.state = 'PLAY'; // 'PLAY', 'GAMEOVER'
    this.stateTimer = 0;
    this.handSlapTimer = 0;
    this.hvacMode = 'IDLE'; // 'COOLING', 'HEATING', 'IDLE'

    this.coworkerTypes = [
      { name: "CHILLY CHLOE", target: 27.5, speed: 45, icon: 'BLANKET' },
      { name: "SWEATY BOB", target: 16.0, speed: 60, icon: 'FAN' },
      { name: "ECO DAVE", target: 24.0, speed: 35, icon: 'CLIPBOARD' }
    ];
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;

    if (this.state === 'GAMEOVER') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    this.shiftTime += dt;
    if (this.handSlapTimer > 0) this.handSlapTimer -= dt;

    // Dial Adjustment [Up] / [Down]
    if (PAD.hit('up')) {
      this.setpoint = Math.min(32.0, this.setpoint + 0.5);
      APU.sfx('TICK');
    }
    if (PAD.hit('down')) {
      this.setpoint = Math.max(12.0, this.setpoint - 0.5);
      APU.sfx('TICK');
    }

    // Slap Away Coworker [A]
    if (PAD.hit('a')) {
      this.slapCoworker();
    }

    // Turbo HVAC Boost [B]
    if (PAD.btn('b') && this.turboEnergy > 0) {
      this.turboEnergy = Math.max(0, this.turboEnergy - dt * 25);
      // Rapidly drives temp to setpoint
      this.temp += (this.setpoint - this.temp) * dt * 3.5;
    } else if (this.turboEnergy < 100) {
      this.turboEnergy = Math.min(100, this.turboEnergy + dt * 8);
    }

    // Touch controls
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      // Slap if touching near sneaking coworker (x: 20-80 or 160-220)
      if (this.sneaker && Math.abs(tx - this.sneaker.x) < 35) {
        this.slapCoworker();
      }
      // Tap dial up/down
      else if (tx >= 90 && tx <= 150 && ty <= 100) {
        this.setpoint = Math.min(32.0, this.setpoint + 0.5);
        APU.sfx('TICK');
      } else if (tx >= 90 && tx <= 150 && ty >= 150 && ty <= 210) {
        this.setpoint = Math.max(12.0, this.setpoint - 0.5);
        APU.sfx('TICK');
      }
    }

    // Thermodynamic Heat Transfer & HVAC Simulation
    var thermalLoss = (this.outsideTemp - this.temp) * 0.08;
    var hvacPower = 0;
    if (this.temp > this.setpoint + 0.2) {
      hvacPower = -1.2; // Cooling active
      this.hvacMode = 'COOLING';
    } else if (this.temp < this.setpoint - 0.2) {
      hvacPower = 1.2; // Heating active
      this.hvacMode = 'HEATING';
    } else {
      this.hvacMode = 'IDLE';
    }
    this.temp += (thermalLoss + hvacPower) * dt;

    // Morale calculation: optimal zone is 20.0 to 22.5
    var tempError = Math.abs(this.temp - 21.0);
    if (tempError > 2.0) {
      this.morale = Math.max(0, this.morale - (tempError - 2.0) * 4.0 * dt);
    } else {
      this.morale = Math.min(100.0, this.morale + dt * 2.0);
    }

    if (this.morale <= 0) {
      this.state = 'GAMEOVER';
      this.stateTimer = 0;
      SAVE.setScore(this.id, Math.floor(this.shiftTime));
      APU.sfx('ERROR');
      return;
    }

    // Sneaking Coworker AI
    this.sneakTimer -= dt;
    if (!this.sneaker && this.sneakTimer <= 0) {
      var type = this.coworkerTypes[Math.floor(Math.random() * this.coworkerTypes.length)];
      var fromLeft = Math.random() < 0.5;
      this.sneaker = {
        name: type.name,
        targetTemp: type.target,
        speed: type.speed + this.shiftTime * 0.5,
        icon: type.icon,
        side: fromLeft ? 'LEFT' : 'RIGHT',
        x: fromLeft ? 15 : 225,
        targetX: fromLeft ? 85 : 155,
        state: 'SNEAK',
        tamperTimer: 0
      };
    }

    if (this.sneaker) {
      var s = this.sneaker;
      if (s.state === 'SNEAK') {
        var dx = s.targetX - s.x;
        if (Math.abs(dx) > 3) {
          s.x += Math.sign(dx) * s.speed * dt;
        } else {
          // Reached dial! Begin tampering!
          s.state = 'TAMPER';
          s.tamperTimer = 0;
        }
      } else if (s.state === 'TAMPER') {
        s.tamperTimer += dt;
        // Sneaker forcefully spins the dial!
        this.setpoint += Math.sign(s.targetTemp - this.setpoint) * dt * 4.5;
        if (Math.floor(s.tamperTimer * 4) % 2 === 0) {
          APU.sfx('TICK');
        }
        if (s.tamperTimer > 2.8) {
          // Coworker finishes tampering and runs away satisfied
          s.state = 'FLEE';
        }
      } else if (s.state === 'FLEE') {
        var fleeX = (s.side === 'LEFT') ? -30 : 270;
        s.x += Math.sign(fleeX - s.x) * (s.speed * 1.5) * dt;
        if ((s.side === 'LEFT' && s.x < 10) || (s.side === 'RIGHT' && s.x > 230)) {
          this.sneaker = null;
          this.sneakTimer = Math.max(1.8, 5.0 - this.shiftTime * 0.05);
        }
      }
    }
  },

  slapCoworker() {
    this.handSlapTimer = 0.25;
    if (this.sneaker && (this.sneaker.state === 'SNEAK' || this.sneaker.state === 'TAMPER')) {
      // SLAP!
      this.sneaker.state = 'FLEE';
      APU.sfx('HIT');
      this.morale = Math.min(100, this.morale + 10);
    } else {
      APU.sfx('TICK');
    }
  },

  render(g) {
    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("THERMOSTAT", 6, 6, 3);
    g.text("MORALE:" + Math.floor(this.morale) + "%", 94, 6, this.morale < 35 ? 3 : 2);
    g.textR("TIME:" + Math.floor(this.shiftTime) + "S", 234, 6, 3);

    // Morale progress bar
    g.rect(0, 22, Math.floor(240 * (this.morale / 100)), 4, this.morale < 35 ? 3 : 2);

    // Wall Plate & Circular Honeywell Thermostat
    var cx = 120, cy = 110;
    g.box(80, 50, 80, 120, 2); // Wall mount base

    // Round Dial Body
    g.circle(cx, cy, 38, 2);
    g.circle(cx, cy, 35, 1);
    g.disc(cx, cy, 32, 0);

    // Temperature Tick Marks around bezel
    for (var a = -Math.PI * 0.8; a <= Math.PI * 0.8; a += 0.25) {
      var tx1 = cx + Math.cos(a) * 31;
      var ty1 = cy + Math.sin(a) * 31;
      var tx2 = cx + Math.cos(a) * 35;
      var ty2 = cy + Math.sin(a) * 35;
      g.line(tx1, ty1, tx2, ty2, 1);
    }

    // Digital Temperature Display inside Dial
    var tStr = this.temp.toFixed(1) + "°C";
    var inComfort = Math.abs(this.temp - 21.0) <= 1.0;
    g.textC(tStr, cy - 8, inComfort ? 3 : (this.temp > 22 ? 3 : 2));
    g.textC("SET: " + this.setpoint.toFixed(1) + "°C", cy + 6, 2);

    // HVAC Mode indicator
    g.textC(this.hvacMode, cy + 18, this.hvacMode === 'IDLE' ? 1 : 3);

    // Dial Needle pointing to setpoint
    var setpointAngle = -Math.PI / 2 + (this.setpoint - 21.0) * 0.18;
    var nx = cx + Math.cos(setpointAngle) * 28;
    var ny = cy + Math.sin(setpointAngle) * 28;
    g.line(cx, cy, nx, ny, 3);

    // Sneaking Coworker Sprite
    if (this.sneaker) {
      var s = this.sneaker;
      var sx = s.x, sy = 120;
      // Stick figure coworker
      g.circle(sx, sy - 14, 6, 3); // Head
      g.line(sx, sy - 8, sx, sy + 14, 2); // Body
      // Reaching arms
      var armReach = s.side === 'LEFT' ? 10 : -10;
      g.line(sx, sy - 2, sx + armReach, sy - 4, 3);
      // Legs
      g.line(sx, sy + 14, sx - 4, sy + 28, 2);
      g.line(sx, sy + 14, sx + 4, sy + 28, 2);

      // Warning text
      if (s.state === 'TAMPER') {
        g.textC("TAMPERING!", 42, 3);
      } else {
        g.textC(s.name, 42, 2);
      }
    }

    // Hand Slap Animation
    if (this.handSlapTimer > 0) {
      g.textC("* SLAP! *", 80, 3);
    }

    // Bottom Help Banner
    g.rect(0, 224, 240, 16, 0);
    g.line(0, 224, 240, 224, 2);
    g.text("UP/DN: SETPOINT  [A]: SLAP HAND", 6, 227, 2);
    g.textR("[B] TURBO (" + Math.floor(this.turboEnergy) + "%)", 234, 227, this.turboEnergy > 20 ? 3 : 1);

    // Game Over Overlay
    if (this.state === 'GAMEOVER') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("OFFICE WALKOUT MUTINY!", 70, 3);
      g.textC("CLIMATE CONDITIONS INTOLERABLE", 95, 2);
      g.textC("SHIFT SURVIVED: " + Math.floor(this.shiftTime) + " SECONDS", 115, 3);
      g.textC("PRESS [A] TO RETRY", 145, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  }
};
