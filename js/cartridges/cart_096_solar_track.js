// js/cartridges/cart_096_solar_track.js
// ============================================================================
// Cartridge #096: SOLAR TRACK
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[96] = {
  id: 96,
  name: "SOLAR TRACK",
  genre: 9,
  scoreLabel: "MWH",
  desc: "HELIOSTAT SOLAR COLLECTOR: DUAL-AXIS AZIMUTH & TILT ALIGNMENT TO HARVEST SOLAR POWER THROUGH CLOUDS!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Sun and angled panel
    g.disc(x + 20, y + 8, 4, 3);
    g.line(x + 6, y + 24, x + 24, y + 16, 3); // Solar panel
    g.line(x + 15, y + 20, x + 15, y + 28, 2); // Mast
  },

  init() {
    this.dayTime = 6.0; // 06:00 to 18:00 (12 hour daylight transit)
    this.daySpeed = 0.15; // Transit speed
    this.dayCount = 1;

    // Sun sky coordinates (azimuth 0..PI, elevation)
    this.sunAzimuth = 0.1; // 0: East, PI/2: South, PI: West
    this.sunElevation = 0.2;

    // Panel orientation
    this.panelAngle = 0.2; // Angle in radians
    this.dustLevel = 0.0; // 0 to 100% dust
    this.battery = 50.0; // 0 to 100%
    this.totalMWh = 0;
    this.efficiency = 0;

    // Clouds
    this.clouds = [
      { x: -40, y: 55, w: 45, speed: 12 },
      { x: 120, y: 40, w: 60, speed: 8 }
    ];

    this.state = 'PLAY'; // 'PLAY', 'NIGHT', 'GAMEOVER'
    this.stateTimer = 0;
    this.wiperActive = 0;
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

    if (this.wiperActive > 0) {
      this.wiperActive -= dt;
      this.dustLevel = Math.max(0, this.dustLevel - dt * 60);
    }

    // Advance Sun transit along daylight arc
    this.dayTime += dt * this.daySpeed;
    if (this.dayTime >= 18.0) {
      this.dayTime = 6.0;
      this.dayCount++;
      APU.sfx('COIN');
    }

    // Sun transit angle (0 at dawn, PI/2 at noon, PI at dusk)
    this.sunAzimuth = ((this.dayTime - 6.0) / 12.0) * Math.PI;

    // Update Clouds
    for (var c = 0; c < this.clouds.length; c++) {
      var cl = this.clouds[c];
      cl.x += cl.speed * dt;
      if (cl.x > 260) {
        cl.x = -cl.w - 20;
        cl.y = 35 + Math.random() * 35;
      }
    }

    // Panel Tilt Inputs [Left] / [Right]
    if (PAD.state.left) this.panelAngle = Math.max(0, this.panelAngle - 1.4 * dt);
    if (PAD.state.right) this.panelAngle = Math.min(Math.PI, this.panelAngle + 1.4 * dt);

    // Wiper Spray [B]
    if (PAD.hit('b')) {
      if (this.dustLevel > 10) {
        this.wiperActive = 1.0;
        APU.sfx('POWERUP');
      } else {
        APU.sfx('TICK');
      }
    }

    // Touch controls: tap / drag to point panel
    if (TOUCH.down || TOUCH.held) {
      var tx = TOUCH.x, ty = TOUCH.y;
      var mastX = 120, mastY = 180;
      var tAngle = Math.atan2(mastY - ty, tx - mastX);
      if (tAngle >= 0 && tAngle <= Math.PI) {
        this.panelAngle = Math.PI - tAngle;
      }
      // Tap Wiper button bottom right
      if (tx >= 160 && ty >= 210) {
        this.wiperActive = 1.0;
        APU.sfx('POWERUP');
      }
    }

    // Environmental Dust accumulation
    this.dustLevel = Math.min(100, this.dustLevel + dt * 1.5);

    // Calculate Irradiance & Cloud Obstruction
    var sunX = 120 - Math.cos(this.sunAzimuth) * 90;
    var sunY = 175 - Math.sin(this.sunAzimuth) * 115;
    var cloudCover = 1.0;

    for (var c = 0; c < this.clouds.length; c++) {
      var cl = this.clouds[c];
      if (sunX >= cl.x && sunX <= cl.x + cl.w && Math.abs(sunY - cl.y) < 18) {
        cloudCover = 0.35; // Cloud shading
        break;
      }
    }

    // Solar Alignment Efficiency: cosine of angular error
    var angleDiff = Math.abs(this.sunAzimuth - this.panelAngle);
    var alignment = Math.max(0, Math.cos(angleDiff));
    var cleanMult = 1.0 - (this.dustLevel / 100) * 0.55;

    this.efficiency = Math.floor(alignment * cleanMult * cloudCover * 100);

    // Energy Generation & Grid Consumption
    var genMW = (this.efficiency / 100) * 12.0; // Up to 12 MW
    var gridDemandMW = 6.0 + Math.sin(this.dayTime * 0.5) * 3.0; // Demand profile

    var netEnergy = (genMW - gridDemandMW) * dt;
    this.battery = Math.max(0, Math.min(100, this.battery + netEnergy * 0.8));

    if (genMW > 0) {
      this.totalMWh += (genMW * dt * 0.1);
      SAVE.setScore(this.id, Math.floor(this.totalMWh));
    }

    // Blackout / Grid Collapse check
    if (this.battery <= 0 && gridDemandMW > genMW) {
      this.state = 'GAMEOVER';
      this.stateTimer = 0;
      APU.sfx('ERROR');
    }
  },

  render(g) {
    g.clear(0);

    // Sky Dome Horizon line
    g.line(0, 185, 240, 185, 2);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("SOLAR TRACK", 6, 6, 3);
    var hrs = Math.floor(this.dayTime);
    var mins = Math.floor((this.dayTime - hrs) * 60);
    var timeStr = (hrs < 10 ? "0" : "") + hrs + ":" + (mins < 10 ? "0" : "") + mins;
    g.text(timeStr, 88, 6, 3);
    g.text("EFF:" + this.efficiency + "%", 140, 6, this.efficiency > 70 ? 3 : 2);
    g.textR(Math.floor(this.totalMWh) + " MWH", 234, 6, 3);

    // Battery Bank Level Bar
    g.rect(0, 22, Math.floor(240 * (this.battery / 100)), 4, this.battery < 20 ? (Math.floor(this.stateTimer * 8) % 2 === 0 ? 3 : 1) : 2);

    // Sun Arc Guideline (Dotted)
    for (var a = 0.2; a <= Math.PI - 0.2; a += 0.15) {
      var ax = 120 - Math.cos(a) * 90;
      var ay = 175 - Math.sin(a) * 115;
      g.px(Math.floor(ax), Math.floor(ay), 1);
    }

    // Sun Disc & Rays
    var sunX = Math.floor(120 - Math.cos(this.sunAzimuth) * 90);
    var sunY = Math.floor(175 - Math.sin(this.sunAzimuth) * 115);
    g.disc(sunX, sunY, 7, 3);
    g.circle(sunX, sunY, 11, 2);

    // Clouds
    for (var c = 0; c < this.clouds.length; c++) {
      var cl = this.clouds[c];
      g.rect(cl.x, cl.y, cl.w, 14, 1);
      g.box(cl.x, cl.y, cl.w, 14, 2);
    }

    // Heliostat Solar Collector (Central Mast at 120, 185)
    var mastX = 120, mastY = 185;
    g.line(mastX, mastY, mastX, mastY - 25, 2);
    g.disc(mastX, mastY - 25, 4, 3); // Gimbal joint

    // Photovoltaic Collector Panel Blade (Rotated around gimbal)
    var pLen = 32;
    var normAngle = this.panelAngle + Math.PI / 2;
    var px1 = mastX - Math.cos(normAngle) * pLen;
    var py1 = (mastY - 25) - Math.sin(normAngle) * pLen;
    var px2 = mastX + Math.cos(normAngle) * pLen;
    var py2 = (mastY - 25) + Math.sin(normAngle) * pLen;
    g.line(px1, py1, px2, py2, 3);
    g.line(px1, py1 + 1, px2, py2 + 1, 2);

    // Normal solar vector ray
    var vx = mastX + Math.sin(normAngle) * 16;
    var vy = (mastY - 25) - Math.cos(normAngle) * 16;
    g.line(mastX, mastY - 25, vx, vy, 1);

    // Dust & Wiper Spray
    if (this.wiperActive > 0) {
      g.textC("* SPRAY CLEANING *", 140, 3);
    } else if (this.dustLevel > 40) {
      g.textC("DUST DETECTED: " + Math.floor(this.dustLevel) + "%", 140, 2);
    }

    // Bottom Telemetry & Controls
    g.rect(0, 196, 240, 44, 0);
    g.line(0, 196, 240, 196, 2);
    g.text("D-PAD: TILT PANEL  [B]: WIPER SPRAY", 6, 204, 2);
    g.text("BATTERY STORAGE: " + Math.floor(this.battery) + "%", 6, 222, this.battery < 20 ? 3 : 2);
    g.textR("DAY " + this.dayCount, 234, 222, 3);

    // Game Over Overlay
    if (this.state === 'GAMEOVER') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("GRID BLACKOUT!", 70, 3);
      g.textC("BATTERY STORAGE DEPLETED", 95, 2);
      g.textC("ENERGY HARVESTED: " + Math.floor(this.totalMWh) + " MWH", 115, 3);
      g.textC("PRESS [A] TO RESTART", 145, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  }
};
