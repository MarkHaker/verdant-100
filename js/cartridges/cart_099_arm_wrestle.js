// js/cartridges/cart_099_arm_wrestle.js
// ============================================================================
// Cartridge #099: ARM WRESTLE
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[99] = {
  id: 99,
  name: "ARM WRESTLE",
  genre: 9,
  scoreLabel: "WINS",
  desc: "ARCADE ARM WRESTLING: RHYTHMICALLY MASH [◀]/[▶] TO FLEX BICEPS AND SLAM THE OPPONENT TO THE TABLE!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Clashing arms
    g.line(x + 8, y + 26, x + 16, y + 14, 3);
    g.line(x + 24, y + 26, x + 16, y + 14, 2);
    g.disc(x + 16, y + 14, 3, 3); // Clenched fists
  },

  init() {
    this.opponentIdx = 0;
    this.wins = 0;
    this.score = 0;

    this.opponents = [
      { name: "BURLY BOB", power: 28, surgeInterval: 4.0, maxStamina: 100 },
      { name: "IRON BORIS", power: 42, surgeInterval: 3.0, maxStamina: 140 },
      { name: "TITAN CYBORG", power: 58, surgeInterval: 2.2, maxStamina: 180 }
    ];

    this.armAngle = 0; // -55 (Player Pinned / Loss) to +55 (Opponent Pinned / Win)
    this.playerStamina = 100;
    this.aiStamina = 100;
    this.lastMashKey = ''; // 'L' or 'R'
    this.cadenceTimer = 0;

    this.aiSurgeTimer = 0;
    this.aiSurging = false;
    this.screenShake = 0;
    this.sweatParticles = [];

    this.state = 'MATCH'; // 'MATCH', 'WIN', 'LOSS', 'CHAMPION'
    this.stateTimer = 0;

    this.startMatch(0);
  },

  startMatch(idx) {
    this.opponentIdx = idx;
    var opp = this.opponents[idx];
    this.armAngle = 0;
    this.playerStamina = 100;
    this.aiStamina = opp.maxStamina;
    this.lastMashKey = '';
    this.aiSurging = false;
    this.aiSurgeTimer = 3.0;
    this.state = 'MATCH';
    this.stateTimer = 0;
    this.sweatParticles = [];
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;
    this.cadenceTimer += dt;

    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 15);

    if (this.state === 'WIN') {
      if (this.stateTimer > 2.0 || PAD.hit('a') || TOUCH.down) {
        if (this.opponentIdx + 1 < this.opponents.length) {
          this.startMatch(this.opponentIdx + 1);
        } else {
          this.state = 'CHAMPION';
          this.stateTimer = 0;
          SAVE.setScore(this.id, this.wins);
          APU.sfx('FANFARE');
        }
      }
      return;
    }

    if (this.state === 'LOSS' || this.state === 'CHAMPION') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    var opp = this.opponents[this.opponentIdx];

    // Player Mashing Input (Alternating Left & Right)
    var mashed = false;
    var validRhythm = false;

    if (PAD.hit('left')) {
      if (this.lastMashKey !== 'L') {
        validRhythm = true;
        this.lastMashKey = 'L';
      }
      mashed = true;
    } else if (PAD.hit('right')) {
      if (this.lastMashKey !== 'R') {
        validRhythm = true;
        this.lastMashKey = 'R';
      }
      mashed = true;
    } else if (PAD.hit('a')) {
      mashed = true;
      validRhythm = true;
    }

    // Touch screen side-alternating mash
    if (TOUCH.down) {
      var tx = TOUCH.x;
      if (tx < 120 && this.lastMashKey !== 'L') {
        validRhythm = true;
        this.lastMashKey = 'L';
        mashed = true;
      } else if (tx >= 120 && this.lastMashKey !== 'R') {
        validRhythm = true;
        this.lastMashKey = 'R';
        mashed = true;
      }
    }

    if (mashed) {
      var pushForce = validRhythm ? 4.5 : 2.0;
      if (this.playerStamina > 20) pushForce *= 1.3;

      this.armAngle += pushForce;
      this.playerStamina = Math.max(0, this.playerStamina - 1.5);
      this.aiStamina = Math.max(0, this.aiStamina - 2.5);
      this.screenShake = 3;

      this.spawnSweat(120 + this.armAngle, 110);
      APU.sfx('TICK');
    } else {
      // Natural stamina slow recovery
      if (this.playerStamina < 100) this.playerStamina += dt * 10;
    }

    // Opponent AI Dynamics
    this.aiSurgeTimer -= dt;
    if (this.aiSurgeTimer <= 0) {
      this.aiSurging = !this.aiSurging;
      this.aiSurgeTimer = this.aiSurging ? 1.6 : opp.surgeInterval;
      if (this.aiSurging) {
        APU.sfx('HIT');
        this.spawnSweat(140, 100);
      }
    }

    var aiPushForce = opp.power;
    if (this.aiSurging) aiPushForce *= 1.8;
    if (this.aiStamina < 30) aiPushForce *= 0.55; // AI fatigued

    // Push arm back towards player (-angle)
    this.armAngle -= aiPushForce * dt;

    // Check Victory / Loss limits (+50 / -50)
    if (this.armAngle >= 50.0) {
      this.armAngle = 50.0;
      this.state = 'WIN';
      this.stateTimer = 0;
      this.wins++;
      this.score += 1000 + Math.floor(this.playerStamina * 10);
      SAVE.setScore(this.id, this.wins);
      APU.sfx('FANFARE');
    } else if (this.armAngle <= -50.0) {
      this.armAngle = -50.0;
      this.state = 'LOSS';
      this.stateTimer = 0;
      APU.sfx('ERROR');
    }

    // Update Sweat Particles
    for (var p = this.sweatParticles.length - 1; p >= 0; p--) {
      var sp = this.sweatParticles[p];
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.life -= dt;
      if (sp.life <= 0) this.sweatParticles.splice(p, 1);
    }
  },

  spawnSweat(x, y) {
    for (var k = 0; k < 3; k++) {
      this.sweatParticles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 45,
        vy: -15 - Math.random() * 20,
        life: 0.35
      });
    }
  },

  render(g) {
    var sx = (this.screenShake > 0) ? (Math.random() - 0.5) * this.screenShake : 0;
    var sy = (this.screenShake > 0) ? (Math.random() - 0.5) * this.screenShake : 0;

    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("ARM WRESTLE", 6, 6, 3);
    var opp = this.opponents[this.opponentIdx];
    g.text("VS: " + opp.name, 92, 6, this.aiSurging ? 3 : 2);
    g.textR("WINS:" + this.wins, 234, 6, 3);

    // Tournament Table (x: 20 to 220, y: 160 to 200)
    g.rect(20 + sx, 160 + sy, 200, 40, 1);
    g.box(20 + sx, 160 + sy, 200, 40, 2);

    // Elbow pads on table
    g.box(45 + sx, 156 + sy, 30, 8, 3); // Player pad
    g.box(165 + sx, 156 + sy, 30, 8, 3); // AI pad

    // Center Pin Indicator Line
    g.line(120 + sx, 80 + sy, 120 + sx, 160 + sy, 1);

    // Arm Clashing Kinematics
    var rad = (this.armAngle * Math.PI) / 180;
    var gripX = 120 + sx + Math.sin(rad) * 48;
    var gripY = 120 + sy - Math.cos(rad) * 48;

    // Player Forearm (Left elbow at 60, 156)
    var pElbowX = 60 + sx, pElbowY = 156 + sy;
    g.line(pElbowX, pElbowY, gripX, gripY, 3);
    g.line(pElbowX + 1, pElbowY, gripX + 1, gripY, 3);
    g.line(pElbowX - 1, pElbowY, gripX - 1, gripY, 2);

    // Opponent Forearm (Right elbow at 180, 156)
    var aElbowX = 180 + sx, aElbowY = 156 + sy;
    g.line(aElbowX, aElbowY, gripX, gripY, 2);
    g.line(aElbowX + 1, aElbowY, gripX + 1, gripY, 2);

    // Gripped Clenched Fists at (gripX, gripY)
    g.disc(gripX, gripY, 7, 3);
    g.circle(gripX, gripY, 8, 2);

    // Sweat Particles
    for (var p = 0; p < this.sweatParticles.length; p++) {
      var pt = this.sweatParticles[p];
      g.px(pt.x + sx, pt.y + sy, 3);
    }

    // Power / Tension Tug-of-War Bar (Top)
    g.box(30, 28, 180, 14, 2);
    var pinRatio = (this.armAngle + 50) / 100;
    var barW = Math.max(2, Math.min(176, Math.floor(pinRatio * 176)));
    g.rect(32, 30, barW, 10, this.aiSurging ? 3 : 2);
    g.line(120, 26, 120, 44, 3); // Center marker

    // Tension Status
    if (this.aiSurging) {
      g.textC("!! OPPONENT POWER SURGE !!", 52, 3);
    } else if (this.aiStamina < 30) {
      g.textC("OPPONENT TIRED! SLAM THEM NOW!", 52, 3);
    } else {
      g.textC("LOCKED IN COMBAT", 52, 1);
    }

    // Stamina Meters
    g.text("YOU: " + Math.floor(this.playerStamina) + "%", 30, 70, 2);
    g.textR("CPU: " + Math.floor(this.aiStamina), 210, 70, 2);

    // Bottom Help Banner
    g.rect(0, 218, 240, 22, 0);
    g.line(0, 218, 240, 218, 2);
    g.textC("ALTERNATE [◀] AND [▶] IN RHYTHM!", 224, 3);

    // Overlays
    if (this.state === 'WIN') {
      g.rect(30, 80, 180, 70, 0);
      g.box(30, 80, 180, 70, 3);
      g.textC("TABLE SLAM PIN!", 95, 3);
      g.textC(opp.name + " DEFEATED!", 115, 2);
      g.textC("PRESS [A] FOR NEXT BOUT", 132, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    } else if (this.state === 'LOSS') {
      g.rect(30, 80, 180, 70, 0);
      g.box(30, 80, 180, 70, 3);
      g.textC("YOU WERE PINNED!", 95, 3);
      g.textC("CHAMPIONSHIP RUN OVER", 115, 2);
      g.textC("PRESS [A] TO RETRY", 132, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    } else if (this.state === 'CHAMPION') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("WORLD ARM-WRESTLING CHAMPION!", 70, 3);
      g.textC("ALL 3 CONTENDERS CRUSHED", 95, 2);
      g.textC("TOTAL BOUTS WON: " + this.wins, 115, 3);
      g.textC("PRESS [A] TO DEFEND TITLE", 145, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  }
};
