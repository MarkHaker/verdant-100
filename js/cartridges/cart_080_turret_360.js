// js/cartridges/cart_080_turret_360.js
// ============================================================================
// Cartridge #080: TURRET 360
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[80] = {
  id: 80,
  name: "TURRET 360",
  genre: 7,
  scoreLabel: "WAVE",
  desc: "360-DEGREE ROTATING CITADEL CANNON: DEFEND CENTRAL CORE AGAINST ATTACKING DRONE SWARMS!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Citadel base disc
    g.circle(x + 16, y + 16, 10, 2);
    g.disc(x + 16, y + 16, 6, 3);
    // Dual turret barrels pointing top-right
    var ang = -Math.PI / 4;
    var bx = x + 16 + Math.cos(ang) * 12;
    var by = y + 16 + Math.sin(ang) * 12;
    g.line(x + 16, y + 16, bx, by, 3);
    // Incoming threat dots
    g.px(x + 5, y + 6, 2);
    g.px(x + 26, y + 25, 2);
    g.px(x + 28, y + 8, 3);
  },

  init() {
    this.cx = 120;
    this.cy = 120;
    this.angle = -Math.PI / 2; // Pointing UP initially
    this.rotSpeed = 3.6;

    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.hp = 100;
    this.shield = 50;
    this.shieldMax = 50;
    this.empBombs = 2;
    this.recoil = 0;
    this.fireTimer = 0;

    this.bullets = [];
    this.enemies = [];
    this.particles = [];
    this.empWaves = [];
    this.screenShake = 0;

    this.state = 'PLAY'; // 'PLAY', 'WAVE_CLEAR', 'GAMEOVER'
    this.stateTimer = 0;
    this.enemiesRemaining = 12;
    this.spawnTimer = 0;

    this.startWave(1);
  },

  startWave(w) {
    this.wave = w;
    this.state = 'PLAY';
    this.stateTimer = 0;
    this.enemiesRemaining = 10 + w * 4;
    this.spawnTimer = 0.5;
    this.enemies = [];
    this.bullets = [];
    this.empWaves = [];
    if (w % 2 === 0 && this.empBombs < 3) this.empBombs++;
    this.shield = this.shieldMax;
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 20);
    }

    if (this.state === 'WAVE_CLEAR') {
      if (this.stateTimer > 2.0 || PAD.hit('a') || TOUCH.down) {
        APU.sfx('CONFIRM');
        this.startWave(this.wave + 1);
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

    // Shield slow regeneration
    if (this.shield < this.shieldMax) {
      this.shield = Math.min(this.shieldMax, this.shield + dt * 4);
    }

    // Turret Rotation Inputs
    if (PAD.state.left) this.angle -= this.rotSpeed * dt;
    if (PAD.state.right) this.angle += this.rotSpeed * dt;

    // Direct touch aim & fire
    if (TOUCH.down || TOUCH.held) {
      var tdx = TOUCH.x - this.cx;
      var tdy = TOUCH.y - this.cy;
      if (Math.hypot(tdx, tdy) > 15) {
        this.angle = Math.atan2(tdy, tdx);
        this.fireCannon();
      }
    }

    // Fire Cannon [A]
    this.fireTimer += dt;
    if (PAD.hit('a') || PAD.state.a) {
      this.fireCannon();
    }

    // EMP Shockwave [B]
    if (PAD.hit('b')) {
      if (this.empBombs > 0) {
        this.empBombs--;
        this.triggerEmp();
      } else {
        APU.sfx('ERROR');
      }
    }

    if (this.recoil > 0) {
      this.recoil = Math.max(0, this.recoil - dt * 30);
    }

    // Spawning Enemies
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.enemiesRemaining > 0) {
      this.spawnTimer = Math.max(0.4, 1.6 - this.wave * 0.1);
      this.enemiesRemaining--;
      this.spawnEnemy();
    }

    // Update Bullets
    for (var b = this.bullets.length - 1; b >= 0; b--) {
      var bl = this.bullets[b];
      bl.x += bl.vx * dt;
      bl.y += bl.vy * dt;
      bl.life -= dt;
      if (bl.life <= 0 || bl.x < 0 || bl.x > 240 || bl.y < 0 || bl.y > 240) {
        this.bullets.splice(b, 1);
      }
    }

    // Update EMP shockwaves
    for (var ew = this.empWaves.length - 1; ew >= 0; ew--) {
      var wave = this.empWaves[ew];
      wave.r += dt * 140;
      if (wave.r > 160) {
        this.empWaves.splice(ew, 1);
        continue;
      }
      // EMP destroys all enemies within ring
      for (var e = this.enemies.length - 1; e >= 0; e--) {
        var en = this.enemies[e];
        var edist = Math.hypot(en.x - this.cx, en.y - this.cy);
        if (Math.abs(edist - wave.r) < 14) {
          this.killEnemy(e);
        }
      }
    }

    // Update Enemies
    for (var i = this.enemies.length - 1; i >= 0; i--) {
      var enm = this.enemies[i];
      var dx = this.cx - enm.x;
      var dy = this.cy - enm.y;
      var dist = Math.hypot(dx, dy);

      if (dist > 14) {
        // Move towards center
        var spd = enm.speed;
        if (enm.type === 'KAMIKAZE' && dist < 65) spd *= 1.7; // Rush when close
        enm.x += (dx / dist) * spd * dt;
        enm.y += (dy / dist) * spd * dt;
      } else {
        // Impact with Citadel Core!
        this.damageCore(enm.damage);
        this.spawnExplosion(enm.x, enm.y, 8);
        this.enemies.splice(i, 1);
        continue;
      }

      // Check bullet collisions
      for (var j = this.bullets.length - 1; j >= 0; j--) {
        var bul = this.bullets[j];
        if (Math.hypot(bul.x - enm.x, bul.y - enm.y) < enm.r + 3) {
          this.bullets.splice(j, 1);
          enm.hp -= 20;
          this.spawnSpark(enm.x, enm.y);
          if (enm.hp <= 0) {
            this.killEnemy(i);
            break;
          } else {
            APU.sfx('HIT');
          }
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
    if (this.enemiesRemaining === 0 && this.enemies.length === 0) {
      this.state = 'WAVE_CLEAR';
      this.stateTimer = 0;
      this.score += 500 * this.wave;
      SAVE.setScore(this.id, this.score);
      APU.sfx('FANFARE');
    }
  },

  fireCannon() {
    if (this.fireTimer >= 0.12) {
      this.fireTimer = 0;
      this.recoil = 4;
      var speed = 260;
      var bx = this.cx + Math.cos(this.angle) * 16;
      var by = this.cy + Math.sin(this.angle) * 16;
      this.bullets.push({
        x: bx,
        y: by,
        vx: Math.cos(this.angle) * speed,
        vy: Math.sin(this.angle) * speed,
        life: 1.2
      });
      APU.sfx('TICK');
    }
  },

  triggerEmp() {
    this.empWaves.push({ r: 12 });
    this.screenShake = 6;
    APU.sfx('EXPLODE');
  },

  spawnEnemy() {
    var ang = Math.random() * Math.PI * 2;
    var dist = 145;
    var spawnX = this.cx + Math.cos(ang) * dist;
    var spawnY = this.cy + Math.sin(ang) * dist;

    var roll = Math.random();
    var type = 'SCOUT';
    var speed = 36 + this.wave * 3;
    var hp = 20;
    var r = 4;
    var dmg = 10;

    if (roll < 0.25 && this.wave >= 2) {
      type = 'KAMIKAZE';
      speed = 48 + this.wave * 4;
      hp = 15;
      r = 4;
      dmg = 25;
    } else if (roll < 0.5 && this.wave >= 3) {
      type = 'TANK';
      speed = 18 + this.wave * 2;
      hp = 60;
      r = 7;
      dmg = 35;
    }

    this.enemies.push({
      type: type,
      x: spawnX,
      y: spawnY,
      speed: speed,
      hp: hp,
      r: r,
      damage: dmg
    });
  },

  killEnemy(index) {
    var en = this.enemies[index];
    this.kills++;
    var pts = en.type === 'TANK' ? 75 : (en.type === 'KAMIKAZE' ? 50 : 25);
    this.score += pts;
    this.spawnExplosion(en.x, en.y, en.r * 2);
    this.enemies.splice(index, 1);
    APU.sfx('HIT');
    SAVE.setScore(this.id, this.score);
  },

  damageCore(dmg) {
    this.screenShake = 7;
    APU.sfx('EXPLODE');
    if (this.shield > 0) {
      var absorbed = Math.min(this.shield, dmg);
      this.shield -= absorbed;
      dmg -= absorbed;
    }
    if (dmg > 0) {
      this.hp = Math.max(0, this.hp - dmg);
      if (this.hp <= 0) {
        this.state = 'GAMEOVER';
        this.stateTimer = 0;
        APU.sfx('ERROR');
      }
    }
  },

  spawnExplosion(x, y, count) {
    for (var k = 0; k < count; k++) {
      var a = Math.random() * Math.PI * 2;
      var s = 20 + Math.random() * 45;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 0.4 + Math.random() * 0.3,
        type: 'DEBRIS'
      });
    }
  },

  spawnSpark(x, y) {
    for (var k = 0; k < 3; k++) {
      this.particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40,
        life: 0.25,
        type: 'SPARK'
      });
    }
  },

  render(g) {
    var sx = (this.screenShake > 0) ? (Math.random() - 0.5) * this.screenShake : 0;
    var sy = (this.screenShake > 0) ? (Math.random() - 0.5) * this.screenShake : 0;

    g.clear(0);

    // Radar distance rings
    g.circle(this.cx + sx, this.cy + sy, 45, 1);
    g.circle(this.cx + sx, this.cy + sy, 85, 1);
    g.circle(this.cx + sx, this.cy + sy, 125, 1);

    // Crosshairs
    g.line(this.cx + sx - 130, this.cy + sy, this.cx + sx + 130, this.cy + sy, 1);
    g.line(this.cx + sx, this.cy + sy - 130, this.cx + sx, this.cy + sy + 130, 1);

    // EMP Waves
    for (var w = 0; w < this.empWaves.length; w++) {
      var wave = this.empWaves[w];
      g.circle(this.cx + sx, this.cy + sy, wave.r, 3);
      g.circle(this.cx + sx, this.cy + sy, Math.max(1, wave.r - 3), 2);
    }

    // Bullets
    for (var b = 0; b < this.bullets.length; b++) {
      var bul = this.bullets[b];
      g.disc(bul.x + sx, bul.y + sy, 2, 3);
    }

    // Enemies
    for (var e = 0; e < this.enemies.length; e++) {
      var en = this.enemies[e];
      var ex = en.x + sx, ey = en.y + sy;
      if (en.type === 'TANK') {
        g.box(ex - 6, ey - 6, 12, 12, 3);
        g.disc(ex, ey, 3, 2);
      } else if (en.type === 'KAMIKAZE') {
        g.tri(ex, ey - 5, ex - 5, ey + 4, ex + 5, ey + 4, 3);
      } else {
        // Fast Scout
        g.disc(ex, ey, 3, 2);
        g.circle(ex, ey, 5, 3);
      }
    }

    // Particles
    for (var p = 0; p < this.particles.length; p++) {
      var pt = this.particles[p];
      g.px(pt.x + sx, pt.y + sy, pt.life > 0.2 ? 3 : 2);
    }

    // Central Citadel Bunker & Turret
    var recoilX = Math.cos(this.angle) * (-this.recoil);
    var recoilY = Math.sin(this.angle) * (-this.recoil);

    // Core base
    g.circle(this.cx + sx, this.cy + sy, 14, 2);
    g.disc(this.cx + sx, this.cy + sy, 10, 1);
    if (this.shield > 0) {
      g.circle(this.cx + sx, this.cy + sy, 16, 3);
    }

    // Cannon Barrel
    var bx = this.cx + sx + recoilX + Math.cos(this.angle) * 16;
    var by = this.cy + sy + recoilY + Math.sin(this.angle) * 16;
    g.line(this.cx + sx + recoilX, this.cy + sy + recoilY, bx, by, 3);
    // Double barrel parallel line
    var perpA = this.angle + Math.PI / 2;
    var offX = Math.cos(perpA) * 2;
    var offY = Math.sin(perpA) * 2;
    g.line(this.cx + sx + recoilX + offX, this.cy + sy + recoilY + offY, bx + offX, by + offY, 3);
    g.disc(this.cx + sx + recoilX, this.cy + sy + recoilY, 4, 3);

    // Top HUD
    g.rect(0, 0, 240, 22, 1);
    g.text("WAVE " + this.wave, 6, 6, 3);
    g.text("HP:" + this.hp, 66, 6, this.hp < 30 ? 3 : 2);
    g.text("SHD:" + Math.floor(this.shield), 114, 6, 3);
    g.text("EMP:" + this.empBombs, 172, 6, this.empBombs > 0 ? 3 : 1);
    g.textR("SCR:" + this.score, 234, 6, 3);

    // Bottom Action / Touch Help
    g.rect(0, 226, 240, 14, 0);
    g.line(0, 226, 240, 226, 2);
    g.text("D-PAD / TOUCH: AIM  [A]: FIRE", 6, 229, 2);
    g.textR("[B] EMP BOMB", 234, 229, this.empBombs > 0 ? 3 : 1);

    // Overlays
    if (this.state === 'WAVE_CLEAR') {
      g.rect(30, 80, 180, 80, 0);
      g.box(30, 80, 180, 80, 3);
      g.textC("WAVE " + this.wave + " CLEARED!", 95, 3);
      g.textC("CORE STATUS SECURE", 115, 2);
      g.textC("PREPARE FOR WAVE " + (this.wave + 1), 135, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    } else if (this.state === 'GAMEOVER') {
      g.rect(30, 80, 180, 80, 0);
      g.box(30, 80, 180, 80, 3);
      g.textC("CITADEL CORE DESTROYED", 95, 3);
      g.textC("SURVIVED WAVES: " + this.wave, 115, 2);
      g.textC("FINAL SCORE: " + this.score, 130, 3);
      g.textC("PRESS [A] TO RESTART", 146, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  }
};
