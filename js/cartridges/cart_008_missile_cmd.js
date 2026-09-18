// js/cartridges/cart_008_missile_cmd.js
// ============================================================================
// Cartridge #008: MISSILE CMD
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 8. MISSILE COMMAND
CARTS[8] = {
  id: 8,
  name: "MISSILE CMD",
  genre: 0,
  scoreLabel: "PTS",
  desc: "DEFEND 6 CITIES & 3 MISSILE SILOS FROM ICBM & MIRV STRIKES.",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Ground
    g.rect(x, y + 27, 32, 5, 1);
    // Center bunker silo
    g.tri(x + 12, y + 27, x + 16, y + 23, x + 20, y + 27, 2);
    // Cities left and right
    g.rect(x + 4, y + 24, 5, 3, 2);
    g.rect(x + 23, y + 24, 5, 3, 2);
    // Incoming ICBM contrail
    g.line(x + 5, y + 3, x + 14, y + 16, 2);
    g.px(x + 14, y + 16, 3);
    // Ascending ABM interceptor trail
    g.line(x + 16, y + 23, x + 19, y + 12, 3);
    // Expanding phosphor flak fireball
    g.disc(x + 19, y + 12, 5, 1);
    g.disc(x + 19, y + 12, 3, 2);
    g.disc(x + 19, y + 12, 1, 3);
  },

  init() {
    this.crossX = 128;
    this.crossY = 100;
    this.missiles = [];
    this.interceptors = [];
    this.explosions = [];
    this.popups = [];
    this.particles = [];
    this.wave = 1;
    this.score = 0;
    this.highScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? (SAVE.getScore(this.id) || 0) : 0;
    this.over = false;
    this.state = 'PLAY'; // 'PLAY', 'BONUS', 'OVER'
    this.spawnTimer = 0.8;
    this.spawnedCount = 0;
    this.totalWarheads = 12;
    this.waveBannerTimer = 1.6;
    this.lastPointerDown = false;
    this.cityBonus = 0;
    this.ammoBonus = 0;
    this.totalBonus = 0;
    this.bonusTimer = 0;

    // 3 Missile Batteries: Alpha (x=20), Delta (x=128), Omega (x=236)
    this.silos = [
      { name: 'ALPHA', short: 'A', x: 20, y: 224, ammo: 10, maxAmmo: 10, alive: true },
      { name: 'DELTA', short: 'D', x: 128, y: 224, ammo: 10, maxAmmo: 10, alive: true },
      { name: 'OMEGA', short: 'O', x: 236, y: 224, ammo: 10, maxAmmo: 10, alive: true }
    ];

    // 6 Classic Cities: 3 left of center, 3 right of center
    this.cities = [
      { x: 47, y: 224, alive: true, type: 0 },
      { x: 74, y: 224, alive: true, type: 1 },
      { x: 101, y: 224, alive: true, type: 2 },
      { x: 155, y: 224, alive: true, type: 0 },
      { x: 182, y: 224, alive: true, type: 1 },
      { x: 209, y: 224, alive: true, type: 2 }
    ];
  },

  playLaunchSfx() {
    if (typeof APU !== 'undefined') {
      APU.sfx('SWISH');
      if (APU.softTone) APU.softTone(380, 0.08, 'triangle', 0.08, 0, 0.005, 1200);
    }
  },

  playBoomSfx() {
    if (typeof APU !== 'undefined') APU.sfx('BOOM');
  },

  playInterceptSfx() {
    if (typeof APU !== 'undefined') APU.sfx('COIN');
  },

  playMirvSplitSfx() {
    if (typeof APU !== 'undefined') {
      if (APU.softTone) APU.softTone(784, 0.08, 'sine', 0.09, 0, 0.005, 1400);
      else APU.sfx('TICK');
    }
  },

  playDenySfx() {
    if (typeof APU !== 'undefined') APU.sfx('DENY');
  },

  playWaveEndSfx() {
    if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
  },

  spawnParticles(x, y, count = 8, color = 3) {
    for (let k = 0; k < count; k++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 20 + Math.random() * 60;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.3 + Math.random() * 0.4,
        color: color
      });
    }
    if (this.particles.length > 60) {
      this.particles.splice(0, this.particles.length - 60);
    }
  },

  spawnExplosion(x, y, isChain = false) {
    this.explosions.push({
      x: x,
      y: y,
      r: 2,
      maxR: isChain ? 22 : 25,
      grow: true,
      age: 0,
      isChain: isChain
    });
    this.playBoomSfx();
    if (typeof PAD !== 'undefined' && PAD.vibrate) {
      PAD.vibrate(isChain ? 16 : 10);
    }
  },

  fireInterceptor(tx, ty) {
    if (this.over || this.state !== 'PLAY') return false;

    // Target must be in the sky above ground/bunkers
    ty = Math.max(12, Math.min(212, ty));
    tx = Math.max(8, Math.min(248, tx));

    // Find closest alive silo with ammo
    let bestSilo = null;
    let bestDist = Infinity;
    for (let s of this.silos) {
      if (s.alive && s.ammo > 0) {
        const d = Math.hypot(s.x - tx, s.y - ty);
        if (d < bestDist) {
          bestDist = d;
          bestSilo = s;
        }
      }
    }

    if (!bestSilo) {
      this.playDenySfx();
      return false;
    }

    bestSilo.ammo--;
    const sx = bestSilo.x;
    const sy = bestSilo.y - 4;
    const dist = Math.hypot(tx - sx, ty - sy);

    this.interceptors.push({
      sx: sx,
      sy: sy,
      tx: tx,
      ty: ty,
      x: sx,
      y: sy,
      speed: 300,
      dist: Math.max(1, dist),
      progress: 0
    });

    this.playLaunchSfx();
    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(8);
    return true;
  },

  advanceWave() {
    this.wave++;
    // Re-arm all silos to 10 ammo and repair any damaged silos
    for (let s of this.silos) {
      s.alive = true;
      s.ammo = 10;
    }
    this.missiles = [];
    this.interceptors = [];
    this.explosions = [];
    this.popups = [];
    this.particles = [];
    this.spawnedCount = 0;
    this.totalWarheads = Math.min(26, 10 + this.wave * 2);
    this.spawnTimer = 0.8;
    this.waveBannerTimer = 1.6;
    this.state = 'PLAY';
    this.playWaveEndSfx();
  },

  update(dt) {
    // 1. GAME OVER STATE
    if (this.over) {
      const pointerDown = !!(PAD.pointer && PAD.pointer.down);
      const tapOrClick = PAD.tapPos || (pointerDown && !this.lastPointerDown);
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || tapOrClick) {
        this.init();
      }
      this.lastPointerDown = pointerDown;
      return;
    }

    // 2. BONUS / WAVE COMPLETE TALLY STATE
    if (this.state === 'BONUS') {
      this.bonusTimer += dt;
      // Update lingering explosions and particles during bonus
      this.updateExplosions(dt);
      this.updateParticles(dt);

      const pointerDown = !!(PAD.pointer && PAD.pointer.down);
      const tapOrClick = PAD.tapPos || (pointerDown && !this.lastPointerDown);
      if (this.bonusTimer > 3.2 || PAD.hit('a') || PAD.hit('start') || tapOrClick) {
        this.advanceWave();
      }
      this.lastPointerDown = pointerDown;
      return;
    }

    // 3. RETICLE MOVEMENT (D-PAD / KEYBOARD)
    const spd = 180;
    if (PAD.state.left) this.crossX = Math.max(8, this.crossX - spd * dt);
    if (PAD.state.right) this.crossX = Math.min(248, this.crossX + spd * dt);
    if (PAD.state.up) this.crossY = Math.max(12, this.crossY - spd * dt);
    if (PAD.state.down) this.crossY = Math.min(212, this.crossY + spd * dt);

    // 4. MOBILE TOUCH & POINTER INPUT
    const pointerDown = !!(PAD.pointer && PAD.pointer.down);
    let touchFired = false;

    // Direct Tap targeting
    if (PAD.tapPos) {
      const tx = Math.max(8, Math.min(248, PAD.tapPos.x));
      const ty = Math.max(12, Math.min(212, PAD.tapPos.y));
      this.crossX = tx;
      this.crossY = ty;
      this.fireInterceptor(tx, ty);
      touchFired = true;
    }

    // Pointer Drag / Fresh Touch-Down
    if (pointerDown) {
      const px = Math.max(8, Math.min(248, PAD.pointer.x));
      const py = Math.max(12, Math.min(212, PAD.pointer.y));
      this.crossX = px;
      this.crossY = py;

      if (!this.lastPointerDown && !touchFired && py <= 214) {
        this.fireInterceptor(px, py);
        touchFired = true;
      }
    }
    this.lastPointerDown = pointerDown;

    // 5. BUTTON FIRING (A / B)
    if (!touchFired && (PAD.hit('a') || PAD.hit('b'))) {
      this.fireInterceptor(this.crossX, this.crossY);
    }

    // 6. WAVE BANNER & SPAWN TIMING
    if (this.waveBannerTimer > 0) {
      this.waveBannerTimer -= dt;
    } else {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && this.spawnedCount < this.totalWarheads) {
        this.spawnIncomingICBM();
        const baseInterval = Math.max(0.65, 1.8 - this.wave * 0.12);
        this.spawnTimer = baseInterval + Math.random() * 0.45;
      }
    }

    // 7. UPDATE INTERCEPTORS
    for (let i = this.interceptors.length - 1; i >= 0; i--) {
      const inter = this.interceptors[i];
      inter.progress += (inter.speed / inter.dist) * dt;
      inter.x = inter.sx + (inter.tx - inter.sx) * inter.progress;
      inter.y = inter.sy + (inter.ty - inter.sy) * inter.progress;

      if (inter.progress >= 1.0) {
        this.interceptors.splice(i, 1);
        this.spawnExplosion(inter.tx, inter.ty, false);
      }
    }

    // 8. UPDATE EXPLOSIONS
    this.updateExplosions(dt);

    // 9. UPDATE INCOMING MISSILES & DETECTIONS
    this.updateMissiles(dt);

    // 10. UPDATE PARTICLES & FLOATING POPUPS
    this.updateParticles(dt);
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.y -= 16 * dt;
      p.life -= dt;
      if (p.life <= 0) this.popups.splice(i, 1);
    }

    // 11. CHECK WAVE DEFENDED CONDITION
    if (this.spawnedCount >= this.totalWarheads &&
        this.missiles.length === 0 &&
        this.interceptors.length === 0 &&
        this.explosions.length === 0) {

      const survivingCities = this.cities.filter(c => c.alive).length;
      if (survivingCities > 0) {
        this.state = 'BONUS';
        this.bonusTimer = 0;
        this.cityBonus = survivingCities * 100;
        this.ammoBonus = this.silos.reduce((sum, s) => sum + (s.alive ? s.ammo : 0), 0) * 5;
        this.totalBonus = this.cityBonus + this.ammoBonus;
        this.score += this.totalBonus;
        if (this.score > this.highScore) {
          this.highScore = this.score;
          if (typeof SAVE !== 'undefined' && SAVE.setScore) SAVE.setScore(this.id, this.highScore);
        }
        this.playWaveEndSfx();
      } else {
        this.over = true;
        this.state = 'OVER';
        if (typeof SAVE !== 'undefined' && SAVE.setScore) SAVE.setScore(this.id, Math.max(this.score, this.highScore));
      }
    }
  },

  spawnIncomingICBM() {
    // Gather viable targets (surviving cities and surviving silos)
    const targets = [];
    this.cities.forEach((c, idx) => {
      if (c.alive) targets.push({ x: c.x, y: 220, type: 'city', index: idx });
    });
    this.silos.forEach((s, idx) => {
      if (s.alive) targets.push({ x: s.x, y: 220, type: 'silo', index: idx });
    });

    if (targets.length === 0) {
      targets.push({ x: 128, y: 220, type: 'ground', index: -1 });
    }

    const target = targets[Math.floor(Math.random() * targets.length)];
    const sx = 10 + Math.random() * 236;
    const sy = 0;
    const dist = Math.hypot(target.x - sx, target.y - sy);
    const speed = 22 + Math.min(this.wave * 3.5, 30) + Math.random() * 8;

    // MIRV warheads: in wave 2+, some ICBMs split into cluster warheads
    const isMirv = (this.wave >= 2 && Math.random() < Math.min(0.20 + (this.wave - 2) * 0.10, 0.55));
    const splitY = isMirv ? (60 + Math.random() * 65) : 0;

    this.missiles.push({
      sx: sx,
      sy: sy,
      tx: target.x,
      ty: target.y,
      progress: 0,
      dist: Math.max(1, dist),
      speed: speed,
      isMirv: isMirv,
      splitY: splitY,
      hasSplit: false,
      targetType: target.type,
      targetIndex: target.index
    });

    this.spawnedCount++;
  },

  updateExplosions(dt) {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const e = this.explosions[i];
      e.age += dt;
      if (e.grow) {
        e.r += 65 * dt;
        if (e.r >= e.maxR) {
          e.r = e.maxR;
          e.grow = false;
        }
      } else {
        e.r -= 28 * dt;
        if (e.r <= 0) {
          this.explosions.splice(i, 1);
        }
      }
    }
  },

  updateMissiles(dt) {
    // Valid targets for MIRV child warheads
    const targets = [];
    this.cities.forEach((c, idx) => {
      if (c.alive) targets.push({ x: c.x, y: 220, type: 'city', index: idx });
    });
    this.silos.forEach((s, idx) => {
      if (s.alive) targets.push({ x: s.x, y: 220, type: 'silo', index: idx });
    });

    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      m.progress += (m.speed / m.dist) * dt;
      const curX = m.sx + (m.tx - m.sx) * m.progress;
      const curY = m.sy + (m.ty - m.sy) * m.progress;

      // Check MIRV Split at mid-altitude
      if (m.isMirv && !m.hasSplit && curY >= m.splitY) {
        m.hasSplit = true;
        this.missiles.splice(i, 1);
        this.playMirvSplitSfx();
        this.spawnParticles(curX, curY, 6, 3);

        const numClusters = (Math.random() < 0.5) ? 2 : 3;
        for (let k = 0; k < numClusters; k++) {
          const subTarget = targets.length > 0 ? targets[Math.floor(Math.random() * targets.length)] : { x: 128, y: 220, type: 'ground', index: -1 };
          const subDist = Math.hypot(subTarget.x - curX, subTarget.y - curY);
          this.missiles.push({
            sx: curX,
            sy: curY,
            tx: subTarget.x,
            ty: subTarget.y,
            progress: 0,
            dist: Math.max(1, subDist),
            speed: m.speed * (0.95 + Math.random() * 0.25),
            isMirv: false,
            splitY: 0,
            hasSplit: false,
            targetType: subTarget.type,
            targetIndex: subTarget.index
          });
        }
        continue;
      }

      // Check Interception by Active Fireballs
      let hit = false;
      for (let e of this.explosions) {
        if (Math.hypot(curX - e.x, curY - e.y) <= e.r) {
          hit = true;
          break;
        }
      }

      if (hit) {
        this.missiles.splice(i, 1);
        const pts = m.isMirv ? 50 : 25;
        this.score += pts;
        if (this.score > this.highScore) {
          this.highScore = this.score;
          if (typeof SAVE !== 'undefined' && SAVE.setScore) SAVE.setScore(this.id, this.highScore);
        }
        this.popups.push({ text: "+" + pts, x: curX, y: curY, life: 0.7 });
        this.spawnParticles(curX, curY, 8, 3);
        this.playInterceptSfx();

        // Chain Reaction: intercepted warhead detonates into an expanding fireball!
        this.spawnExplosion(curX, curY, true);
        continue;
      }

      // Check Ground Impact
      if (m.progress >= 1.0) {
        this.missiles.splice(i, 1);
        this.spawnExplosion(m.tx, m.ty, false);
        this.playBoomSfx();
        if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(22);

        // Destroy target city or silo
        if (m.targetType === 'city') {
          const c = this.cities[m.targetIndex];
          if (c && c.alive) {
            c.alive = false;
            this.spawnParticles(c.x, 222, 12, 2);
          }
        } else if (m.targetType === 'silo') {
          const s = this.silos[m.targetIndex];
          if (s && s.alive) {
            s.alive = false;
            s.ammo = 0;
            this.spawnParticles(s.x, 222, 12, 2);
          }
        }

        // Check if all cities fallen -> Game Over!
        if (this.cities.every(city => !city.alive)) {
          this.over = true;
          this.state = 'OVER';
          if (this.score > this.highScore) {
            this.highScore = this.score;
            if (typeof SAVE !== 'undefined' && SAVE.setScore) SAVE.setScore(this.id, this.highScore);
          }
        }
      }
    }
  },

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  },

  drawCity(g, c) {
    const cx = c.x;
    if (c.alive) {
      if (c.type === 0) {
        // Skyscraper with high antenna spire
        g.rect(cx - 6, 219, 12, 5, 2);
        g.rect(cx - 5, 215, 3, 4, 2);
        g.rect(cx - 1, 212, 3, 7, 2);
        g.line(cx, 209, cx, 211, 3);
        g.rect(cx + 3, 214, 3, 5, 2);
        g.px(cx, 214, 3); g.px(cx, 216, 3);
        g.px(cx - 4, 217, 3); g.px(cx + 4, 216, 3);
      } else if (c.type === 1) {
        // Twin commercial towers with skybridge
        g.rect(cx - 6, 220, 12, 4, 2);
        g.rect(cx - 5, 212, 4, 8, 2);
        g.rect(cx + 1, 212, 4, 8, 2);
        g.rect(cx - 1, 215, 2, 2, 3);
        g.line(cx - 3, 209, cx - 3, 211, 3);
        g.line(cx + 3, 209, cx + 3, 211, 3);
        g.px(cx - 4, 214, 3); g.px(cx - 4, 217, 3);
        g.px(cx + 2, 214, 3); g.px(cx + 2, 217, 3);
      } else {
        // Stepped domed observatory / civic center
        g.rect(cx - 6, 220, 12, 4, 2);
        g.rect(cx - 4, 216, 8, 4, 2);
        g.disc(cx, 215, 3, 2);
        g.px(cx, 211, 3);
        g.px(cx - 3, 218, 3); g.px(cx, 218, 3); g.px(cx + 3, 218, 3);
      }
    } else {
      // Destroyed city rubble & scorched ruins
      g.rect(cx - 6, 222, 12, 2, 1);
      g.rect(cx - 4, 220, 8, 2, 2);
      g.rect(cx - 2, 219, 4, 1, 1);
      g.px(cx - 5, 221, 2);
      g.px(cx - 3, 219, 3);
      g.px(cx + 3, 220, 2);
      g.px(cx + 5, 222, 1);
      g.line(cx - 1, 218, cx + 1, 219, 2);
    }
  },

  drawSilo(g, s) {
    const sx = s.x;
    if (s.alive) {
      // Fortified bunker mound & launch tube
      g.tri(sx - 11, 224, sx, 216, sx + 11, 224, 2);
      g.rect(sx - 4, 218, 8, 5, 1);
      g.rect(sx - 2, 216, 4, 2, 3);

      // Remaining ammo label
      const ammoColor = s.ammo > 0 ? 3 : 1;
      if (s.short === 'A') g.text("A:" + s.ammo, sx - 10, 227, ammoColor);
      else if (s.short === 'D') g.textC("D:" + s.ammo, 227, ammoColor);
      else g.text("O:" + s.ammo, sx - 8, 227, ammoColor);
    } else {
      // Demolished silo crater
      g.disc(sx, 223, 6, 0);
      g.circle(sx, 223, 6, 1);
      g.line(sx - 8, 223, sx + 8, 223, 1);
      g.px(sx - 3, 221, 2);
      g.px(sx + 2, 222, 1);

      if (s.short === 'A') g.text("A:---", sx - 10, 227, 1);
      else if (s.short === 'D') g.textC("D:---", 227, 1);
      else g.text("O:---", sx - 8, 227, 1);
    }
  },

  render(g) {
    g.clear(0);

    // Ground terrain & defense sector
    g.rect(0, 224, 256, 16, 1);
    g.line(0, 223, 255, 223, 2);

    // Render 6 Cities
    for (let c of this.cities) {
      this.drawCity(g, c);
    }

    // Render 3 Missile Silos
    for (let s of this.silos) {
      this.drawSilo(g, s);
    }

    // Incoming ICBMs & MIRV contrails
    for (let m of this.missiles) {
      const curX = m.sx + (m.tx - m.sx) * m.progress;
      const curY = m.sy + (m.ty - m.sy) * m.progress;
      g.line(Math.floor(m.sx), Math.floor(m.sy), Math.floor(curX), Math.floor(curY), 2);
      g.disc(Math.floor(curX), Math.floor(curY), m.isMirv ? 2 : 1, 3);
      if (m.isMirv) {
        g.circle(Math.floor(curX), Math.floor(curY), 3, 2);
      }
    }

    // Ascending ABM Interceptors & Target Markers
    for (let inter of this.interceptors) {
      g.line(Math.floor(inter.sx), Math.floor(inter.sy), Math.floor(inter.x), Math.floor(inter.y), 3);
      g.px(Math.floor(inter.x), Math.floor(inter.y), 3);

      // Target coordinate cross in the sky
      const tx = Math.floor(inter.tx), ty = Math.floor(inter.ty);
      g.px(tx - 1, ty, 3);
      g.px(tx + 1, ty, 3);
      g.px(tx, ty - 1, 3);
      g.px(tx, ty + 1, 3);
    }

    // Expanding 4-Color Phosphor Fireballs
    for (let e of this.explosions) {
      const r = Math.floor(e.r);
      if (r <= 0) continue;
      const ex = Math.floor(e.x);
      const ey = Math.floor(e.y);

      // Outer phosphor aura
      g.disc(ex, ey, r, 1);
      if (r >= 4) g.circle(ex, ey, r, 2);
      // Mid fireball shell
      if (r >= 3) g.disc(ex, ey, Math.floor(r * 0.72), 2);
      // Intense bright core
      if (r >= 2) g.disc(ex, ey, Math.floor(r * 0.45), 3);
      // Nuclear epicenter
      if (r >= 5) g.disc(ex, ey, Math.floor(r * 0.20), 3);
    }

    // Particles
    for (let p of this.particles) {
      g.px(Math.floor(p.x), Math.floor(p.y), p.color);
    }

    // Floating Score Popups
    for (let pop of this.popups) {
      g.text(pop.text, Math.floor(pop.x - 6), Math.floor(pop.y), 3);
    }

    // Aiming Crosshair Reticle
    const rx = Math.floor(this.crossX), ry = Math.floor(this.crossY);
    g.line(rx - 5, ry, rx - 1, ry, 3);
    g.line(rx + 1, ry, rx + 5, ry, 3);
    g.line(rx, ry - 5, rx, ry - 1, 3);
    g.line(rx, ry + 1, rx, ry + 5, 3);

    // Top HUD (SCORE, HI, WAVE)
    g.text("SCORE: " + this.score, 8, 4, 3);
    g.textC("HI: " + this.highScore, 4, 2);
    g.textR("WAVE: " + this.wave, 248, 4, 3);
    g.line(8, 11, 248, 11, 1);

    // Wave Intro Banner
    if (this.state === 'PLAY' && this.waveBannerTimer > 0) {
      g.dither(52, 88, 152, 28, 0, 1);
      g.box(52, 88, 152, 28, 3);
      g.textC("DEFEND CITIES - WAVE " + this.wave, 94, 3);
      g.textC("PREPARE FOR ICBM STRIKE", 104, 2);
    }

    // Bonus / Wave Defended Tally Overlay
    if (this.state === 'BONUS') {
      const survivingCities = this.cities.filter(c => c.alive).length;
      const remainingAmmo = this.silos.reduce((sum, s) => sum + (s.alive ? s.ammo : 0), 0);
      g.dither(34, 60, 188, 88, 0, 1);
      g.box(34, 60, 188, 88, 3);
      g.textC("WAVE " + this.wave + " DEFENDED!", 68, 3);
      g.textC("SURVIVING CITIES: " + survivingCities + " X 100 = " + this.cityBonus, 82, 2);
      g.textC("REMAINING AMMO:   " + remainingAmmo + " X 5  = " + this.ammoBonus, 94, 2);
      g.textC("TOTAL BONUS: +" + this.totalBonus, 108, 3);
      g.textC("[A] OR TAP TO ADVANCE", 126, 2);
    }

    // Game Over Overlay
    if (this.over) {
      g.dither(48, 76, 160, 72, 0, 1);
      g.box(48, 76, 160, 72, 3);
      g.textC("THE END", 88, 3);
      g.textC("ALL CITIES FALLEN", 100, 2);
      g.textC("FINAL SCORE: " + this.score, 114, 3);
      g.textC("[A] OR TAP TO RETRY", 128, 2);
    }
  }
};
