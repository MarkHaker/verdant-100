// js/cartridges/cart_026_chain_react.js
// ============================================================================
// Cartridge #026: CHAIN REACT (Overhaul: 12-Level Campaign & Reactive Physics)
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// Escalating combo musical scale: 31 ascending notes spanning 110Hz (A2) to 2093Hz (C7)
const CHAIN_COMBO_SCALE = [
  110.00, 123.47, 130.81, 146.83, 164.81, 174.61, 196.00, // A2 - G3
  220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, // A3 - G4
  440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, // A4 - G5
  880.00, 987.77, 1046.50, 1174.66, 1318.51, 1396.91, 1567.98, // A5 - G6
  1760.00, 1975.53, 2093.00 // A6 - C7 crystalline apex
];

// 12-Level Campaign Progression Table
const CHAIN_LEVELS = [
  { target: 1,  total: 10, name: "TUTORIAL" },
  { target: 2,  total: 15, name: "WARMUP" },
  { target: 4,  total: 20, name: "IGNITION" },
  { target: 8,  total: 25, name: "REACTION" },
  { target: 12, total: 30, name: "SPREAD" },
  { target: 18, total: 35, name: "CRITICAL" },
  { target: 25, total: 40, name: "OVERLOAD" },
  { target: 32, total: 45, name: "CASCADE" },
  { target: 40, total: 50, name: "FIREWALL" },
  { target: 46, total: 55, name: "MELTDOWN" },
  { target: 52, total: 60, name: "SUPERCRITICAL" },
  { target: 58, total: 65, name: "MASTERY" }
];

// 26. CHAIN REACTION
CARTS[26] = {
  id: 26,
  name: "CHAIN REACT",
  genre: 2,
  scoreLabel: "ORBS",
  desc: "12-STAGE CAMPAIGN! TRIGGER CHAIN REACTIONS TO DETONATE BOUNCING ORB SWARMS.",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Outer blast wave
    g.circle(x + 16, y + 16, 12, 2);
    // Glowing shockwave core
    g.disc(x + 16, y + 16, 6, 3);
    // Bouncing and chaining orbs
    g.disc(x + 7, y + 8, 2, 2);
    g.disc(x + 25, y + 9, 3, 3);
    g.disc(x + 24, y + 23, 2, 2);
    g.disc(x + 8, y + 23, 2, 3);
    // Connecting ionization spark
    g.line(x + 16, y + 16, x + 25, y + 9, 1);
  },

  init() {
    this.score = 0;
    this.scoreAtLevelStart = 0;
    this.highScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? (SAVE.getScore(this.id) || 0) : 0;
    this.levelIndex = 0;
    this.maxCombo = 0;
    this.lastPointerDown = false;
    this.startLevel(0);
  },

  getArchetypeList(lvlIdx, total) {
    // Archetype distributions across campaign levels: Normal, Fast, Cluster, Supernova
    const table = [
      { n: 10, f: 0,  c: 0,  s: 0 }, // Lvl 1: 10 (Tutorial)
      { n: 13, f: 2,  c: 0,  s: 0 }, // Lvl 2: 15
      { n: 15, f: 3,  c: 2,  s: 0 }, // Lvl 3: 20
      { n: 17, f: 4,  c: 3,  s: 1 }, // Lvl 4: 25
      { n: 20, f: 5,  c: 3,  s: 2 }, // Lvl 5: 30
      { n: 22, f: 6,  c: 4,  s: 3 }, // Lvl 6: 35
      { n: 25, f: 7,  c: 5,  s: 3 }, // Lvl 7: 40
      { n: 27, f: 8,  c: 6,  s: 4 }, // Lvl 8: 45
      { n: 30, f: 9,  c: 7,  s: 4 }, // Lvl 9: 50
      { n: 32, f: 10, c: 8,  s: 5 }, // Lvl 10: 55
      { n: 35, f: 11, c: 9,  s: 5 }, // Lvl 11: 60
      { n: 37, f: 12, c: 10, s: 6 }  // Lvl 12: 65 (Mastery)
    ];

    const conf = table[lvlIdx] || { n: total, f: 0, c: 0, s: 0 };
    const list = [];
    for (let i = 0; i < conf.n; i++) list.push('normal');
    for (let i = 0; i < conf.f; i++) list.push('fast');
    for (let i = 0; i < conf.c; i++) list.push('cluster');
    for (let i = 0; i < conf.s; i++) list.push('supernova');

    while (list.length < total) list.push('normal');

    // Deterministic shuffle using Fisher-Yates
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    return list;
  },

  startLevel(idx) {
    this.levelIndex = Math.max(0, Math.min(CHAIN_LEVELS.length - 1, idx));
    const lvl = CHAIN_LEVELS[this.levelIndex];

    if (this.state === 'FAILED') {
      // Revert to score at start of this level to prevent failure score farming
      this.score = this.scoreAtLevelStart;
    } else {
      this.scoreAtLevelStart = this.score;
    }

    this.targetQuota = lvl.target;
    this.levelOrbsPopped = 0;
    this.combo = 0;
    this.state = 'AIM'; // 'AIM' | 'CHAIN' | 'CLEARED' | 'FAILED' | 'VICTORY'
    this.triggered = false;
    this.quotaAnnounced = false;
    this.cx = 128;
    this.cy = 126;
    this.time = 0;
    this.shake = 0;
    this.flashTimer = 0;
    this.explosions = [];
    this.shrapnel = [];
    this.particles = [];

    // Spawn orbs within play area bounds (x: 14..242, y: 34..224)
    const types = this.getArchetypeList(this.levelIndex, lvl.total);
    this.orbs = [];

    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      let baseSpeed = 50;
      let r = 3;
      let pts = 1;
      let expR = 24;
      let expLife = 1.8;

      if (type === 'normal') {
        baseSpeed = 40 + Math.random() * 20;
        r = 3;
        pts = 1;
        expR = 24;
        expLife = 1.8;
      } else if (type === 'fast') {
        baseSpeed = 95 + Math.random() * 25;
        r = 2;
        pts = 2;
        expR = 22;
        expLife = 1.7;
      } else if (type === 'cluster') {
        baseSpeed = 42 + Math.random() * 20;
        r = 4;
        pts = 3;
        expR = 24;
        expLife = 1.8;
      } else if (type === 'supernova') {
        baseSpeed = 26 + Math.random() * 16;
        r = 4;
        pts = 5;
        expR = 34; // Massive 34px radius shockwave
        expLife = 2.5; // Persists longer
      }

      const angle = Math.random() * Math.PI * 2;
      this.orbs.push({
        x: 18 + Math.random() * 220,
        y: 36 + Math.random() * 184,
        vx: Math.cos(angle) * baseSpeed,
        vy: Math.sin(angle) * baseSpeed,
        type: type,
        r: r,
        points: pts,
        expR: expR,
        expLife: expLife,
        pulsePhase: Math.random() * Math.PI * 2,
        detonated: false
      });
    }
  },

  triggerCharge(x, y) {
    if (this.state !== 'AIM') return;
    this.state = 'CHAIN';
    this.triggered = true;
    this.combo = 0;

    // Initial trigger explosion: lethal blast radius 26px, 2.0s life
    this.explosions.push({
      x: x,
      y: y,
      r: 3,
      maxR: 26,
      life: 2.0,
      maxLife: 2.0,
      type: 'initial'
    });

    // Particle spark burst
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 30 + Math.random() * 70;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 0.35 + Math.random() * 0.35,
        maxLife: 0.7,
        c: 3
      });
    }

    this.shake = 2.5;
    if (typeof APU !== 'undefined') {
      APU.sfx('BOOM');
    }
  },

  detonateOrb(o) {
    if (o.detonated) return;
    o.detonated = true;
    if (this.state === 'AIM') this.state = 'CHAIN';
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    this.levelOrbsPopped++;

    // Calculate score with combo chain multiplier
    const mult = 1 + (this.combo - 1) * 0.1;
    const earned = Math.round(o.points * mult);
    this.score += earned;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      if (typeof SAVE !== 'undefined' && SAVE.setScore) {
        SAVE.setScore(this.id, this.score);
      }
    }

    // Spawn expanding shockwave
    this.explosions.push({
      x: o.x,
      y: o.y,
      r: 3,
      maxR: o.expR,
      life: o.expLife,
      maxLife: o.expLife,
      type: o.type
    });

    // Proportional screen shake
    let addShake = Math.min(5, 1 + this.combo * 0.3);
    if (o.type === 'supernova') addShake += 3.5;
    this.shake = Math.min(8, this.shake + addShake);

    // Particle sparks
    const sparkCount = (o.type === 'supernova') ? 18 : ((o.type === 'cluster') ? 12 : 8);
    for (let i = 0; i < sparkCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 25 + Math.random() * 85;
      this.particles.push({
        x: o.x,
        y: o.y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 0.3 + Math.random() * 0.35,
        maxLife: 0.65,
        c: (o.type === 'supernova' || Math.random() < 0.6) ? 3 : 2
      });
    }

    // Cluster orb: launch 3 high-speed shrapnel bullets in trifecta spread
    if (o.type === 'cluster') {
      const baseA = Math.random() * Math.PI * 2;
      for (let k = 0; k < 3; k++) {
        const a = baseA + (k * Math.PI * 2 / 3);
        const shrapSpd = 185;
        this.shrapnel.push({
          x: o.x,
          y: o.y,
          vx: Math.cos(a) * shrapSpd,
          vy: Math.sin(a) * shrapSpd,
          life: 0.95
        });
      }
      if (typeof APU !== 'undefined') APU.sfx('SWISH');
    }

    // Escalating musical combo pitch
    this.playComboSound(this.combo, o.type === 'supernova');

    // Massive fanfare on first reaching stage quota
    if (!this.quotaAnnounced && this.levelOrbsPopped >= this.targetQuota) {
      this.quotaAnnounced = true;
      this.flashTimer = 0.35;
      if (typeof APU !== 'undefined') {
        APU.sfx('LEVELUP');
      }
    }
  },

  playComboSound(combo, isSupernova) {
    if (typeof APU === 'undefined') return;
    const idx = Math.min(CHAIN_COMBO_SCALE.length - 1, Math.max(0, combo - 1));
    const freq = CHAIN_COMBO_SCALE[idx];
    const dur = Math.max(0.12, 0.28 - combo * 0.003);

    APU.softTone(freq, dur, 'sine', 0.12, 0, 0.01, Math.min(3200, freq * 3));

    if (isSupernova) {
      APU.softTone(freq * 0.5, 0.35, 'triangle', 0.14, 0, 0.02, 800);
      APU.noise(0.2, 0.18, 400, 'lowpass');
    } else if (combo % 5 === 0) {
      // Harmonic sparkle on combo milestones
      APU.softTone(freq * 1.5, dur * 0.8, 'triangle', 0.06, 0.02, 0.01, 2400);
    }
  },

  update(dt) {
    this.time += dt;
    if (this.flashTimer > 0) this.flashTimer -= dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 14);

    // Mobile touch & mouse pointer handling
    const pointerDown = !!(PAD.pointer && PAD.pointer.down);
    const tapPoint = PAD.tapPos || ((pointerDown && !this.lastPointerDown) ? { x: PAD.pointer.x, y: PAD.pointer.y } : null);

    // 1. AIM STATE
    if (this.state === 'AIM') {
      const spd = 160;
      if (PAD.state.left) this.cx = Math.max(12, this.cx - spd * dt);
      if (PAD.state.right) this.cx = Math.min(244, this.cx + spd * dt);
      if (PAD.state.up) this.cy = Math.max(30, this.cy - spd * dt);
      if (PAD.state.down) this.cy = Math.min(226, this.cy + spd * dt);

      // Re-roll current level layout on SELECT
      if (PAD.hit('select')) {
        if (typeof APU !== 'undefined') APU.sfx('UI_BACK');
        this.startLevel(this.levelIndex);
        this.lastPointerDown = pointerDown;
        return;
      }

      if (tapPoint) {
        this.cx = Math.max(12, Math.min(244, tapPoint.x));
        this.cy = Math.max(30, Math.min(226, tapPoint.y));
        this.triggerCharge(this.cx, this.cy);
      } else if (PAD.hit('a')) {
        this.triggerCharge(this.cx, this.cy);
      }
    }

    // 2. CHAIN STATE (evaluated after physics update below)

    // 3. CLEARED STATE
    if (this.state === 'CLEARED') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || tapPoint) {
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        this.startLevel(this.levelIndex + 1);
        this.lastPointerDown = pointerDown;
        return;
      }
    }

    // 4. FAILED STATE
    if (this.state === 'FAILED') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || PAD.hit('select') || tapPoint) {
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        this.startLevel(this.levelIndex);
        this.lastPointerDown = pointerDown;
        return;
      }
    }

    // 5. VICTORY STATE
    if (this.state === 'VICTORY') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || tapPoint) {
        if (typeof APU !== 'undefined') APU.sfx('UI_OK');
        this.init();
        this.lastPointerDown = pointerDown;
        return;
      }
    }

    this.lastPointerDown = pointerDown;

    // Move & reflect orbs
    for (let o of this.orbs) {
      if (!o.detonated) {
        o.x += o.vx * dt;
        o.y += o.vy * dt;

        // Playfield perimeter reflection (x: 10..246, y: 28..230)
        if (o.x < 10) { o.x = 10; o.vx = Math.abs(o.vx); }
        else if (o.x > 246) { o.x = 246; o.vx = -Math.abs(o.vx); }
        if (o.y < 28) { o.y = 28; o.vy = Math.abs(o.vy); }
        else if (o.y > 230) { o.y = 230; o.vy = -Math.abs(o.vy); }

        // Collision check against active shockwave fireballs
        for (let e of this.explosions) {
          if (Math.hypot(o.x - e.x, o.y - e.y) <= (e.r + o.r)) {
            this.detonateOrb(o);
            break;
          }
        }
      }
    }

    // Update explosions (expanding -> peak hold -> contracting/dissipating)
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const e = this.explosions[i];
      e.life -= dt;
      const progress = 1 - Math.max(0, e.life) / e.maxLife;

      if (progress < 0.35) {
        // Smooth ease-out expansion
        const p = progress / 0.35;
        e.r = 3 + (e.maxR - 3) * Math.sin(p * Math.PI * 0.5);
      } else if (progress < 0.70) {
        // Peak glow hold
        e.r = e.maxR;
      } else {
        // Dissipation contraction
        const p = (progress - 0.70) / 0.30;
        e.r = Math.max(1, e.maxR * (1 - p * 0.45));
      }

      if (e.life <= 0) {
        this.explosions.splice(i, 1);
      }
    }

    // Update high-speed shrapnel bullets from cluster orbs
    for (let i = this.shrapnel.length - 1; i >= 0; i--) {
      const s = this.shrapnel[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;

      // Wall ricochet
      if (s.x < 8) { s.x = 8; s.vx = Math.abs(s.vx); }
      else if (s.x > 248) { s.x = 248; s.vx = -Math.abs(s.vx); }
      if (s.y < 26) { s.y = 26; s.vy = Math.abs(s.vy); }
      else if (s.y > 232) { s.y = 232; s.vy = -Math.abs(s.vy); }

      // Check collision against undetonated orbs
      for (let o of this.orbs) {
        if (!o.detonated && Math.hypot(o.x - s.x, o.y - s.y) <= (o.r + 4)) {
          this.detonateOrb(o);
          s.life = 0;
          break;
        }
      }

      if (s.life <= 0) {
        this.shrapnel.splice(i, 1);
      }
    }

    // Update sparks and phosphor particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= (1 - 3.5 * dt);
      p.vy *= (1 - 3.5 * dt);
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Evaluate CHAIN completion immediately when explosions & shrapnel finish
    if (this.state === 'CHAIN' && this.explosions.length === 0 && this.shrapnel.length === 0) {
      if (this.levelOrbsPopped >= this.targetQuota) {
        if (this.levelIndex >= CHAIN_LEVELS.length - 1) {
          this.state = 'VICTORY';
        } else {
          this.state = 'CLEARED';
        }
        if (typeof APU !== 'undefined') APU.sfx('LEVELUP');
        if (typeof SAVE !== 'undefined' && SAVE.setScore) SAVE.setScore(this.id, this.score);
      } else {
        this.state = 'FAILED';
        if (typeof APU !== 'undefined') APU.sfx('HURT');
      }
    }
  },

  render(g) {
    // Screen shake vector
    const ox = this.shake > 0 ? Math.round((Math.random() * 2 - 1) * this.shake) : 0;
    const oy = this.shake > 0 ? Math.round((Math.random() * 2 - 1) * this.shake) : 0;

    g.clear(0);

    // Playfield CRT boundary border
    g.box(4 + ox, 22 + oy, 248, 214, 1);
    g.px(4 + ox, 22 + oy, 2);
    g.px(251 + ox, 22 + oy, 2);
    g.px(4 + ox, 235 + oy, 2);
    g.px(251 + ox, 235 + oy, 2);

    // Particle sparks
    for (let p of this.particles) {
      const px = Math.floor(p.x + ox);
      const py = Math.floor(p.y + oy);
      if (px >= 4 && px < 252 && py >= 22 && py < 236) {
        g.px(px, py, p.life > 0.15 ? p.c : 1);
      }
    }

    // Shrapnel tracers
    for (let s of this.shrapnel) {
      const sx = Math.floor(s.x + ox);
      const sy = Math.floor(s.y + oy);
      const tx = Math.floor(s.x - s.vx * 0.035 + ox);
      const ty = Math.floor(s.y - s.vy * 0.035 + oy);
      g.line(tx, ty, sx, sy, 3);
      g.px(sx, sy, 3);
    }

    // Concentric shockwave explosions
    for (let e of this.explosions) {
      const ex = Math.floor(e.x + ox);
      const ey = Math.floor(e.y + oy);
      const r = Math.floor(e.r);
      const progress = 1 - Math.max(0, e.life) / e.maxLife;

      if (r <= 1) continue;

      if (progress < 0.35) {
        // Expanding phase
        g.circle(ex, ey, r, 3);
        if (r > 6) g.circle(ex, ey, r - 3, 2);
        if (r > 12) g.disc(ex, ey, Math.floor(r * 0.35), 1);
        g.px(ex, ey, 3);
      } else if (progress < 0.70) {
        // Peak hold phase: glowing phosphor core
        g.circle(ex, ey, r, 3);
        g.circle(ex, ey, Math.max(1, Math.floor(r * 0.65)), 2);
        g.disc(ex, ey, Math.max(1, Math.floor(r * 0.35)), (Math.floor(this.time * 12) % 2 === 0) ? 2 : 1);
        g.px(ex, ey, 3);
        if (e.type === 'supernova') {
          g.circle(ex, ey, Math.max(1, r - 6), 3);
          g.circle(ex, ey, Math.max(1, Math.floor(r * 0.45)), 3);
        }
      } else {
        // Dissipating phase: fading phosphor rings
        const p = (progress - 0.70) / 0.30;
        const c = p > 0.6 ? 1 : 2;
        g.circle(ex, ey, r, c);
        if (r > 8) g.circle(ex, ey, Math.max(1, Math.floor(r * 0.5)), 1);
      }
    }

    // Multiple Orb Archetypes
    for (let o of this.orbs) {
      if (!o.detonated) {
        const x = Math.floor(o.x + ox);
        const y = Math.floor(o.y + oy);

        if (o.type === 'normal') {
          // Normal Orb (Green, 1 pt): standard sphere with bright phosphor highlight
          g.disc(x, y, 3, 2);
          g.px(x, y, 3);
        } else if (o.type === 'fast') {
          // Fast Agile Orb (Cyan/Yellow speed spark, 2 pts): rapid tracer tail
          const tx = Math.floor(o.x - o.vx * 0.045 + ox);
          const ty = Math.floor(o.y - o.vy * 0.045 + oy);
          g.line(tx, ty, x, y, 2);
          g.disc(x, y, 2, 3);
          g.px(x, y, 3);
        } else if (o.type === 'cluster') {
          // Cluster Splitter Orb (Double ring, 3 pts): concentric rings
          g.circle(x, y, 4, 3);
          g.disc(x, y, 2, 2);
          g.px(x, y, 3);
        } else if (o.type === 'supernova') {
          // Supernova Orb (Pulsing diamond, 5 pts): radiant geometry
          const pr = 3 + (Math.floor(this.time * 5 + o.pulsePhase) % 3);
          g.line(x, y - pr, x + pr, y, 3);
          g.line(x + pr, y, x, y + pr, 3);
          g.line(x, y + pr, x - pr, y, 3);
          g.line(x - pr, y, x, y - pr, 3);
          g.px(x, y, 3);
          g.px(x - 1, y, 2); g.px(x + 1, y, 2);
          g.px(x, y - 1, 2); g.px(x, y + 1, 2);
        }
      }
    }

    // Reticle cursor & hint during AIM mode
    if (this.state === 'AIM') {
      const rx = Math.floor(this.cx);
      const ry = Math.floor(this.cy);
      const cr = 6 + (Math.floor(this.time * 4) % 2);
      g.circle(rx, ry, cr, 2);
      g.line(rx - cr - 2, ry, rx - 2, ry, 3);
      g.line(rx + 2, ry, rx + cr + 2, ry, 3);
      g.line(rx, ry - cr - 2, rx, ry - 2, 3);
      g.line(rx, ry + 2, rx, ry + cr + 2, 3);
      g.px(rx, ry, 3);

      g.textC("TAP SCREEN OR [A] TO TRIGGER CHARGE", 226, 1);
    }

    // Top HUD Bar (stable without screen shake)
    g.rect(0, 0, 256, 21, 0);
    g.line(0, 21, 255, 21, 2);

    const curLvl = CHAIN_LEVELS[this.levelIndex];
    // Row 1: LVL, TARGET quota, Score
    g.text("LVL:" + (this.levelIndex + 1) + "/12", 6, 3, 3);
    const targetCol = (this.levelOrbsPopped >= this.targetQuota) ? 3 : 2;
    g.textC("TARGET:" + this.levelOrbsPopped + "/" + this.targetQuota, 3, targetCol);
    g.textR("ORBS:" + this.score, 250, 3, 3);

    // Row 2: Sub-info & Combo / State status
    g.text(curLvl.name, 6, 12, 1);
    if (this.state === 'AIM') {
      g.textC("READY - 1 TRIGGER", 12, 2);
    } else if (this.combo > 0) {
      const multStr = (1 + (this.combo - 1) * 0.1).toFixed(1);
      g.textC("COMBO:" + this.combo + " (x" + multStr + ")", 12, 3);
    } else if (this.state === 'CHAIN') {
      g.textC("CASCADE ACTIVE", 12, 2);
    }
    g.textR("BEST:" + Math.max(this.score, this.highScore), 250, 12, 2);

    // Quota reached border flash effect
    if (this.flashTimer > 0) {
      g.box(4, 22, 248, 214, 3);
      g.box(5, 23, 246, 212, 2);
    }

    // Summary modal cards
    if (this.state === 'CLEARED') {
      g.dither(36, 58, 184, 116, 0, 1);
      g.box(36, 58, 184, 116, 3);
      g.box(38, 60, 180, 112, 2);

      g.textC("STAGE CLEARED!", 68, 3);
      g.textC("LVL " + (this.levelIndex + 1) + ": " + curLvl.name, 82, 2);
      g.textC("DETONATED: " + this.levelOrbsPopped + "/" + curLvl.total, 96, 3);
      g.textC("MAX COMBO: " + this.maxCombo + "x", 108, 2);
      g.textC("TOTAL SCORE: " + this.score, 120, 3);

      const blink = Math.floor(this.time * 3) % 2 === 0;
      g.textC("[A] OR TAP: NEXT LEVEL", 146, blink ? 3 : 2);
    } else if (this.state === 'FAILED') {
      g.dither(36, 62, 184, 110, 0, 1);
      g.box(36, 62, 184, 110, 2);
      g.box(38, 64, 180, 106, 1);

      g.textC("QUOTA FAILED!", 72, 2);
      g.textC("TARGET: " + this.targetQuota + "  POPPED: " + this.levelOrbsPopped, 88, 3);
      g.textC("MISSED BY " + (this.targetQuota - this.levelOrbsPopped) + " ORBS", 102, 1);
      g.textC("TRY A NEW TIMING & POSITION!", 118, 2);

      const blink = Math.floor(this.time * 3) % 2 === 0;
      g.textC("[A] / [B] / TAP: RETRY", 144, blink ? 3 : 2);
    } else if (this.state === 'VICTORY') {
      g.dither(32, 52, 192, 128, 0, 1);
      g.box(32, 52, 192, 128, 3);
      g.box(34, 54, 188, 124, 2);

      g.textC("*** GRAND MASTERY! ***", 62, 3);
      g.textC("ALL 12 STAGES COMPLETED!", 76, 3);
      g.textC("FINAL ORBS SCORE: " + this.score, 92, 3);
      g.textC("PEAK CHAIN COMBO: " + this.maxCombo + "x", 106, 2);
      g.textC("VERDANT-100 CHAIN MASTER", 122, 2);

      const blink = Math.floor(this.time * 3) % 2 === 0;
      g.textC("[A] OR TAP: PLAY AGAIN", 152, blink ? 3 : 2);
    }
  }
};
