// js/cartridges/cart_034_quick_draw.js
// ============================================================================
// Cartridge #034: QUICK DRAW (Wild West High-Noon Standoff Overhaul)
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 34. QUICK DRAW
CARTS[34] = {
  id: 34,
  name: "QUICK DRAW",
  genre: 3,
  scoreLabel: "MS",
  desc: "WAIT FOR 'DRAW!' SIGNAL, THEN HIT [A] INSTANTLY. FALSE START LOSES!",

  // 32x32 Retro Icon: Cowboy Stetson Hat & Classic Six-Shooter Revolver
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Double inner corner accent
    g.px(x + 1, y + 1, 3); g.px(x + 30, y + 1, 3);
    g.px(x + 1, y + 30, 3); g.px(x + 30, y + 30, 3);

    // Stetson Cowboy Hat (top half)
    // Brim
    g.line(x + 4, y + 13, x + 27, y + 13, 3);
    g.line(x + 5, y + 14, x + 26, y + 14, 2);
    g.px(x + 3, y + 12, 2); g.px(x + 28, y + 12, 2);
    // Crown with crease
    g.rect(x + 10, y + 6, 12, 7, 2);
    g.line(x + 11, y + 5, x + 20, y + 5, 3);
    g.line(x + 14, y + 6, x + 17, y + 6, 0); // Hat crease
    g.line(x + 10, y + 12, x + 21, y + 12, 1); // Hatband

    // Revolver (bottom half)
    // Barrel pointing right
    g.rect(x + 13, y + 19, 13, 3, 3);
    g.px(x + 25, y + 18, 3); // Front sight blade
    // Cylinder
    g.rect(x + 9, y + 18, 5, 5, 2);
    g.line(x + 9, y + 20, x + 13, y + 20, 0); // Flute
    // Hammer
    g.px(x + 8, y + 18, 3);
    // Grip / Handle
    g.rect(x + 6, y + 22, 4, 6, 2);
    g.line(x + 7, y + 23, x + 7, y + 26, 3);
    // Trigger guard
    g.box(x + 10, y + 23, 4, 3, 2);

    // Muzzle flash spark
    g.px(x + 28, y + 20, 3);
    g.px(x + 29, y + 19, 3);
    g.px(x + 29, y + 21, 3);
    g.px(x + 30, y + 20, 3);
  },

  // 5 Outlaw Opponents with unique personalities, bounties, and reaction time windows
  outlaws: [
    {
      id: 0,
      name: "SLOPPY SAM",
      alias: "THE RUSTLER",
      bounty: "$100",
      minMs: 480,
      maxMs: 540,
      quote: "HIC... MY FINGER SLIPPED ON THE TRIGGER!",
      hatType: "FLOPPY",
      color: 2
    },
    {
      id: 1,
      name: "RATTLESNAKE RICK",
      alias: "THE VIPER",
      bounty: "$250",
      minMs: 380,
      maxMs: 430,
      quote: "S-S-SNAKEBIT! I'LL GET YE NEXT TIME!",
      hatType: "VIPER",
      color: 2
    },
    {
      id: 2,
      name: "CALAMITY JANE",
      alias: "DEADEYE REBEL",
      bounty: "$500",
      minMs: 300,
      maxMs: 350,
      quote: "FAST HANDS, SHERIFF... REAL FAST.",
      hatType: "FEATHER",
      color: 2
    },
    {
      id: 3,
      name: "EL DIABLO",
      alias: "BANDITO KING",
      bounty: "$1,000",
      minMs: 235,
      maxMs: 275,
      quote: "AY DIOS MIO! HOW DID YOU OUTDRAW ME?!",
      hatType: "SOMBRERO",
      color: 2
    },
    {
      id: 4,
      name: "THE LEGENDARY KID",
      alias: "LIGHTNING DRAW",
      bounty: "$5,000",
      minMs: 185,
      maxMs: 215,
      quote: "A NEW LEGEND RISES IN THE WEST...",
      hatType: "WHITE_STETSON",
      color: 3
    }
  ],

  init() {
    this.round = 0;
    this.unlockedRound = 0;
    this.duelsWon = 0;
    this.time = 0;
    this.state = 'INTRO'; // 'INTRO', 'STANDOFF', 'DRAW', 'RESOLVE_WIN', 'RESOLVE_LOSS', 'FOUL', 'CHAMPION'
    this.standoffTime = 0;
    this.standoffDuration = 3.0;
    this.duelTimer = 0;
    this.playerMs = null;
    this.outlawMs = 400;
    this.winner = null;
    this.isNewRecord = false;
    this.inputLockout = 0.3;
    this.shake = 0;
    this.pointerDownPrev = false;

    // Load persistent record (fastest reaction time in MS)
    this.bestTime = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;
    const persistent = (typeof SAVE !== 'undefined' && SAVE.getPersistent) ? SAVE.getPersistent(this.id) : null;
    if (persistent) {
      if (typeof persistent.bestTime === 'number' && persistent.bestTime > 0) this.bestTime = persistent.bestTime;
      if (typeof persistent.unlockedRound === 'number') this.unlockedRound = persistent.unlockedRound;
      if (typeof persistent.duelsWon === 'number') this.duelsWon = persistent.duelsWon;
    }

    // Tumbleweed ambient entity
    this.tumbleweed = {
      x: -20,
      y: 180,
      vx: 38,
      vy: -15,
      r: 6,
      rot: 0
    };

    // Flying hat physics entity for gunshot knockback
    this.flyingHat = null;

    // Gun smoke and spark particles
    this.particles = [];

    // Local statistics
    this.stats = {
      wins: 0,
      losses: 0,
      fouls: 0,
      reactionTimes: []
    };

    this.startRound(0);
  },

  save() {
    return {
      bestTime: this.bestTime,
      unlockedRound: this.unlockedRound,
      duelsWon: this.duelsWon
    };
  },

  load(data) {
    if (!data) return;
    if (typeof data.bestTime === 'number' && data.bestTime > 0) this.bestTime = data.bestTime;
    if (typeof data.unlockedRound === 'number') this.unlockedRound = data.unlockedRound;
    if (typeof data.duelsWon === 'number') this.duelsWon = data.duelsWon;
  },

  getDifficulty() {
    return (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : 1;
  },

  getDifficultyName() {
    const d = this.getDifficulty();
    return ['EASY', 'NORMAL', 'HARD'][d] || 'NORMAL';
  },

  startRound(idx) {
    this.round = Math.max(0, Math.min(this.outlaws.length - 1, idx));
    this.state = 'INTRO';
    this.inputLockout = 0.35;
    this.flyingHat = null;
    this.playerMs = null;
    this.winner = null;
    this.isNewRecord = false;
  },

  startStandoff() {
    this.state = 'STANDOFF';
    this.inputLockout = 0.15;
    this.standoffTime = 0;
    // Standoff delay randomized between 2.0s and 4.8s
    this.standoffDuration = 2.0 + Math.random() * 2.8;
    this.flyingHat = null;
    this.playerMs = null;
    this.winner = null;
    this.isNewRecord = false;
  },

  triggerFoul() {
    this.state = 'FOUL';
    this.inputLockout = 0.5;
    this.shake = 0.25;
    this.stats.fouls++;
    if (typeof APU !== 'undefined' && APU.sfx) {
      APU.sfx('DENY');
    }
  },

  triggerSignal() {
    this.state = 'DRAW';
    this.duelTimer = 0;
    this.playerMs = null;

    // Roll outlaw reaction time based on opponent window & difficulty
    const outlaw = this.outlaws[this.round];
    let rolled = outlaw.minMs + Math.random() * (outlaw.maxMs - outlaw.minMs);
    const diff = this.getDifficulty();
    if (diff === 0) {
      // EASY: Outlaw reacts 18% slower
      rolled *= 1.18;
    } else if (diff === 2) {
      // HARD: Outlaw reacts 12% faster
      rolled *= 0.88;
    }
    this.outlawMs = Math.max(150, Math.round(rolled));

    if (typeof APU !== 'undefined' && APU.sfx) {
      APU.sfx('ALARM');
    }
  },

  spawnFlyingHat(isPlayer) {
    const startX = isPlayer ? 54 : 182;
    const startY = 142;
    this.flyingHat = {
      x: startX,
      y: startY,
      vx: isPlayer ? -65 : 65,
      vy: -130,
      rot: 0,
      vrot: isPlayer ? -9 : 9,
      hatType: isPlayer ? 'STETSON' : this.outlaws[this.round].hatType,
      bounces: 0
    };
  },

  spawnSmoke(x, y, dir) {
    for (let i = 0; i < 10; i++) {
      const angle = (dir > 0 ? -0.35 : Math.PI + 0.35) + (Math.random() - 0.5) * 0.7;
      const spd = 25 + Math.random() * 45;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * spd + (dir * 12),
        vy: Math.sin(angle) * spd - 12,
        r: 2 + Math.random() * 2,
        maxR: 5 + Math.random() * 3,
        life: 0.6 + Math.random() * 0.35,
        maxLife: 0.95,
        shade: Math.random() > 0.4 ? 3 : 2
      });
    }
  },

  saveBestScore(ms) {
    if (typeof ms !== 'number' || ms <= 0) return false;
    const current = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : this.bestTime;
    let isBetter = (current === 0 || ms < current);

    if (isBetter) {
      this.bestTime = ms;
      if (typeof SAVE !== 'undefined') {
        if (SAVE.data && SAVE.data.rec) {
          const rec = SAVE.data.rec[String(this.id)] || { s: 0, t: 0 };
          rec.s = ms;
          SAVE.data.rec[String(this.id)] = rec;
          SAVE.commit();
        } else if (SAVE.setScore) {
          SAVE.setScore(this.id, ms);
        }
      }
      return true;
    }
    return false;
  },

  resolveDuel(playerWon) {
    this.winner = playerWon ? 'PLAYER' : 'OUTLAW';
    this.state = playerWon ? 'RESOLVE_WIN' : 'RESOLVE_LOSS';
    this.inputLockout = 0.65;
    this.shake = 0.45;

    // Visual gunshots & physics
    if (playerWon) {
      this.spawnSmoke(54 + 28, 150, 1);
      this.spawnFlyingHat(false); // Outlaw hat knocked off
      this.stats.wins++;
      this.duelsWon++;
      if (this.round >= this.unlockedRound) this.unlockedRound = this.round + 1;
      this.stats.reactionTimes.push(this.playerMs);
      this.isNewRecord = this.saveBestScore(this.playerMs);

      // Sound FX
      if (typeof APU !== 'undefined' && APU.sfx) {
        APU.sfx('BOOM');
        APU.sfx('LEVELUP');
        try { APU.sfx('EXPLODE'); } catch (e) {}
      }
    } else {
      this.spawnSmoke(182 - 28, 150, -1);
      this.spawnFlyingHat(true); // Player hat knocked off
      this.stats.losses++;

      // Sound FX
      if (typeof APU !== 'undefined' && APU.sfx) {
        APU.sfx('BOOM');
        APU.sfx('HURT');
        try { APU.sfx('EXPLODE'); } catch (e) {}
        try { APU.sfx('GAMEOVER'); } catch (e) {}
      }
    }
  },

  update(dt) {
    this.time += dt;

    // Decay screen shake
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 2.2);
    }

    // Input lockout countdown
    if (this.inputLockout > 0) {
      this.inputLockout = Math.max(0, this.inputLockout - dt);
    }

    // Unified low-latency input check (Gamepad / Keys + Zero-latency Touch Contact)
    const pointerDownNow = !!(typeof PAD !== 'undefined' && PAD.pointer && PAD.pointer.down);
    const pointerJustPressed = (pointerDownNow && !this.pointerDownPrev);
    this.pointerDownPrev = pointerDownNow;

    const actionHit = (typeof PAD !== 'undefined') && (
      PAD.hit('a') || PAD.hit('b') || PAD.hit('start') ||
      (PAD.tapPos !== null) || pointerJustPressed
    );

    // Update Tumbleweed
    const tw = this.tumbleweed;
    if (tw) {
      tw.x += tw.vx * dt;
      tw.vy += 130 * dt;
      tw.y += tw.vy * dt;
      tw.rot += 5 * dt;
      if (tw.y >= 180) {
        tw.y = 180;
        tw.vy = -(22 + Math.random() * 18);
      }
      if (tw.x > 280) {
        tw.x = -25;
        tw.y = 180;
        tw.vx = 34 + Math.random() * 16;
        tw.vy = -16;
      }
    }

    // Update Flying Hat Arc Physics
    const fh = this.flyingHat;
    if (fh) {
      fh.vy += 320 * dt;
      fh.x += fh.vx * dt;
      fh.y += fh.vy * dt;
      fh.rot += fh.vrot * dt;
      if (fh.y >= 181) {
        fh.y = 181;
        if (fh.bounces < 2) {
          fh.vy = -fh.vy * 0.42;
          fh.vx *= 0.6;
          fh.vrot *= 0.6;
          fh.bounces++;
        } else {
          fh.vy = 0;
          fh.vx = 0;
          fh.vrot = 0;
        }
      }
    }

    // Update Smoke Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 12 * dt; // Smoke billows upward
      p.vx *= 0.94;
    }

    // State Machine Processing
    if (this.state === 'INTRO') {
      // Allow cycling difficulty with Left/Right/Select on Intro
      if (typeof PAD !== 'undefined' && typeof VOS !== 'undefined' && VOS.difficulty !== undefined) {
        if (PAD.hit('left') || PAD.hit('select')) {
          VOS.difficulty = (VOS.difficulty - 1 + 3) % 3;
          if (APU.sfx) APU.sfx('UI_MOVE');
        } else if (PAD.hit('right')) {
          VOS.difficulty = (VOS.difficulty + 1) % 3;
          if (APU.sfx) APU.sfx('UI_MOVE');
        }
      }

      if (actionHit && this.inputLockout <= 0) {
        if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_OK');
        this.startStandoff();
      }
    } else if (this.state === 'STANDOFF') {
      this.standoffTime += dt;

      // False Start check! Any draw attempt before signal triggers FOUL
      if (actionHit) {
        this.triggerFoul();
        return;
      }

      // Standoff timer expired -> Signal DRAW!
      if (this.standoffTime >= this.standoffDuration) {
        this.triggerSignal();
      }
    } else if (this.state === 'DRAW') {
      this.duelTimer += dt;
      const curMs = Math.round(this.duelTimer * 1000);

      // Player hits draw button / taps screen
      if (actionHit) {
        this.playerMs = Math.max(1, curMs);
        if (this.playerMs <= this.outlawMs) {
          this.resolveDuel(true);
        } else {
          this.resolveDuel(false);
        }
        return;
      }

      // Outlaw reacts before player draws
      if (curMs >= this.outlawMs) {
        this.playerMs = null; // Player was too slow to even fire
        this.resolveDuel(false);
        return;
      }
    } else if (this.state === 'RESOLVE_WIN') {
      if (actionHit && this.inputLockout <= 0) {
        if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_OK');
        if (this.round < this.outlaws.length - 1) {
          this.startRound(this.round + 1);
        } else {
          // Conquered all 5 Outlaws! Epilogue Screen
          this.state = 'CHAMPION';
          this.inputLockout = 0.8;
          if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('POWER');
        }
      }
    } else if (this.state === 'RESOLVE_LOSS') {
      // Allow cycling difficulty if struggling
      if (typeof PAD !== 'undefined' && typeof VOS !== 'undefined' && VOS.difficulty !== undefined) {
        if (PAD.hit('left') || PAD.hit('select')) {
          VOS.difficulty = (VOS.difficulty - 1 + 3) % 3;
          if (APU.sfx) APU.sfx('UI_MOVE');
        } else if (PAD.hit('right')) {
          VOS.difficulty = (VOS.difficulty + 1) % 3;
          if (APU.sfx) APU.sfx('UI_MOVE');
        }
      }

      if (actionHit && this.inputLockout <= 0) {
        if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_OK');
        this.startStandoff();
      }
    } else if (this.state === 'FOUL') {
      if (actionHit && this.inputLockout <= 0) {
        if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_OK');
        this.startStandoff();
      }
    } else if (this.state === 'CHAMPION') {
      if (actionHit && this.inputLockout <= 0) {
        if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_OK');
        this.init();
      }
    }
  },

  // RENDER ROUTINE
  render(g) {
    g.clear(0);

    // Calculate Screen Shake Offset
    let ox = 0, oy = 0;
    if (this.shake > 0) {
      const mag = Math.ceil(this.shake * 8);
      ox = Math.floor((Math.random() * 2 - 1) * mag);
      oy = Math.floor((Math.random() * 2 - 1) * mag);
    }

    // 1. Scenery & Environment
    this.renderDesertSky(g, ox, oy);
    this.renderSaloon(g, ox, oy);
    this.renderSheriffBank(g, ox, oy);
    this.renderMainStreet(g, ox, oy);

    // 2. Ambient Props
    this.renderTumbleweed(g, ox, oy);

    // 3. Characters
    this.renderPlayer(g, ox, oy);
    this.renderOutlaw(g, ox, oy);

    // 4. Combat FX: Gunflash, Bullets, Smoke & Flying Hat
    this.renderCombatFx(g, ox, oy);

    // 5. Top HUD
    this.renderHUD(g);

    // 6. State Overlays
    if (this.state === 'INTRO') {
      this.renderWantedPoster(g);
    } else if (this.state === 'STANDOFF') {
      this.renderStandoffUI(g);
    } else if (this.state === 'DRAW') {
      this.renderDrawBanner(g);
    } else if (this.state === 'FOUL') {
      this.renderFoulBanner(g);
    } else if (this.state === 'RESOLVE_WIN') {
      this.renderWinBanner(g);
    } else if (this.state === 'RESOLVE_LOSS') {
      this.renderLossBanner(g);
    } else if (this.state === 'CHAMPION') {
      this.renderChampionScreen(g);
    }
  },

  // 1. Desert Horizon, Mesas & Sun
  renderDesertSky(g, ox, oy) {
    // High-Noon Desert Sun
    const sx = 128 + ox, sy = 34 + oy;
    g.disc(sx, sy, 11, 2);
    g.disc(sx, sy, 7, 3);
    // Radiant Sunbeams
    g.line(sx - 16, sy, sx + 16, sy, 1);
    g.line(sx, sy - 16, sx, sy + 16, 1);
    g.line(sx - 11, sy - 11, sx + 11, sy + 11, 1);
    g.line(sx - 11, sy + 11, sx + 11, sy - 11, 1);

    // Distant Mesa Silhouette
    g.rect(98 + ox, 114 + oy, 60, 32, 1);
    g.tri(82 + ox, 146 + oy, 98 + ox, 114 + oy, 98 + ox, 146 + oy, 1);
    g.tri(158 + ox, 114 + oy, 174 + ox, 146 + oy, 158 + ox, 146 + oy, 1);
    g.line(98 + ox, 114 + oy, 158 + ox, 114 + oy, 2);

    // Distant Saguaro Cacti
    const cx1 = 162 + ox, cy1 = 125 + oy;
    g.rect(cx1, cy1, 3, 21, 1);
    g.line(cx1 - 3, cy1 + 8, cx1, cy1 + 8, 1);
    g.line(cx1 - 3, cy1 + 3, cx1 - 3, cy1 + 8, 1);
    g.line(cx1 + 3, cy1 + 11, cx1 + 5, cy1 + 11, 1);
    g.line(cx1 + 5, cy1 + 6, cx1 + 5, cy1 + 11, 1);

    const cx2 = 91 + ox, cy2 = 132 + oy;
    g.rect(cx2, cy2, 2, 14, 1);
    g.line(cx2 + 2, cy2 + 5, cx2 + 4, cy2 + 5, 1);
    g.line(cx2 + 4, cy2 + 2, cx2 + 4, cy2 + 5, 1);
  },

  // Left Building: "THE GOLDEN NUGGET SALOON"
  renderSaloon(g, ox, oy) {
    const bx = ox, by = 30 + oy;
    // Main wooden facade
    g.rect(bx, by, 84, 116, 0);
    g.box(bx, by, 84, 116, 2);

    // Wood plank horizontal seams
    for (let py = by + 12; py < by + 114; py += 12) {
      g.line(bx, py, bx + 83, py, 1);
    }

    // False roof cornice
    g.rect(bx, by - 2, 88, 5, 2);
    g.box(bx, by - 2, 88, 5, 3);
    g.tri(bx + 42, by - 8, bx + 28, by - 2, bx + 56, by - 2, 2);

    // SALOON Sign
    g.rect(bx + 12, by + 8, 60, 14, 1);
    g.box(bx + 12, by + 8, 60, 14, 3);
    g.text("SALOON", bx + 22, by + 13, 3);

    // Second story balcony & windows
    g.box(bx + 16, by + 28, 16, 18, 2);
    g.line(bx + 24, by + 28, bx + 24, by + 46, 1);
    g.box(bx + 52, by + 28, 16, 18, 2);
    g.line(bx + 60, by + 28, bx + 60, by + 46, 1);

    // Porch overhang roof
    g.rect(bx, by + 58, 88, 5, 2);
    g.line(bx, by + 58, bx + 88, by + 58, 3);

    // Porch wooden pillars
    g.rect(bx + 4, by + 63, 4, 53, 2);
    g.rect(bx + 80, by + 63, 4, 53, 2);

    // Saloon Batwing swinging doors
    const doorX = bx + 36, doorY = by + 78;
    g.rect(doorX, doorY, 24, 38, 0);
    const swing = Math.round(Math.sin(this.time * 3.5) * 2);
    // Left door flap
    g.rect(doorX + swing, doorY + 8, 11, 22, 2);
    g.box(doorX + swing, doorY + 8, 11, 22, 3);
    // Right door flap
    g.rect(doorX + 13 - swing, doorY + 8, 11, 22, 2);
    g.box(doorX + 13 - swing, doorY + 8, 11, 22, 3);

    // Wooden Hitching post
    g.line(bx + 60, by + 104, bx + 84, by + 104, 2);
    g.line(bx + 64, by + 104, bx + 64, by + 116, 2);
    g.line(bx + 80, by + 104, bx + 80, by + 116, 2);
    // Tied horse reins
    g.line(bx + 72, by + 104, bx + 74, by + 110, 1);
  },

  // Right Building: "TOWN JAIL & SHERIFF"
  renderSheriffBank(g, ox, oy) {
    const bx = 172 + ox, by = 36 + oy;
    g.rect(bx, by, 84, 110, 0);
    g.box(bx, by, 84, 110, 2);

    // Wood planks
    for (let py = by + 12; py < by + 108; py += 12) {
      g.line(bx, py, bx + 83, py, 1);
    }

    // Top pediment with sign
    g.rect(bx + 14, by + 6, 56, 14, 1);
    g.box(bx + 14, by + 6, 56, 14, 2);
    g.text("SHERIFF", bx + 22, by + 11, 3);

    // Barred jail cell window
    g.box(bx + 26, by + 30, 26, 20, 2);
    g.line(bx + 32, by + 30, bx + 32, by + 50, 3);
    g.line(bx + 39, by + 30, bx + 39, by + 50, 3);
    g.line(bx + 46, by + 30, bx + 46, by + 50, 3);

    // Hanging brass lantern
    g.line(bx + 10, by + 44, bx + 10, by + 51, 2);
    g.rect(bx + 8, by + 51, 5, 7, 3);
    g.px(bx + 10, by + 54, 0);

    // Wooden water barrels stacked outside
    g.rect(bx + 4, by + 86, 14, 24, 1);
    g.box(bx + 4, by + 86, 14, 24, 2);
    g.line(bx + 4, by + 93, bx + 17, by + 93, 3);
    g.line(bx + 4, by + 102, bx + 17, by + 102, 3);
  },

  // Main dusty street & wooden boardwalks
  renderMainStreet(g, ox, oy) {
    // Horizon line
    g.line(0 + ox, 146 + oy, 256 + ox, 146 + oy, 2);

    // Ground shading & dust texture
    g.dither(0, 147, 256, 10, 0, 1);
    g.rect(0, 157, 256, 83, 0);

    // Boardwalk sidewalks
    g.rect(0 + ox, 146 + oy, 32, 42, 1);
    g.line(32 + ox, 146 + oy, 32 + ox, 188 + oy, 2);
    for (let py = 152; py < 188; py += 6) {
      g.line(0 + ox, py + oy, 31 + ox, py + oy, 2);
    }

    g.rect(224 + ox, 146 + oy, 32, 42, 1);
    g.line(224 + ox, 146 + oy, 224 + ox, 188 + oy, 2);
    for (let py = 152; py < 188; py += 6) {
      g.line(225 + ox, py + oy, 256 + ox, py + oy, 2);
    }

    // Wagon wheel ruts in dusty street
    g.line(36 + ox, 168 + oy, 220 + ox, 172 + oy, 1);
    g.line(36 + ox, 184 + oy, 220 + ox, 188 + oy, 1);

    // Scattered desert pebbles & dust tufts
    g.px(74 + ox, 162 + oy, 2);
    g.px(112 + ox, 178 + oy, 1);
    g.px(144 + ox, 166 + oy, 2);
    g.px(196 + ox, 174 + oy, 1);
  },

  // Rolling tumbleweed
  renderTumbleweed(g, ox, oy) {
    const tw = this.tumbleweed;
    if (!tw || tw.x < -15 || tw.x > 265) return;
    const x = Math.round(tw.x + ox);
    const y = Math.round(tw.y + oy);
    g.circle(x, y, tw.r, 2);
    const cos = Math.cos(tw.rot);
    const sin = Math.sin(tw.rot);
    g.line(x - cos * tw.r, y - sin * tw.r, x + cos * tw.r, y + sin * tw.r, 1);
    g.line(x + sin * tw.r, y - cos * tw.r, x - sin * tw.r, y + cos * tw.r, 1);
    g.px(x, y, 3);
  },

  // PLAYER SPRITE (Left Cowboy Gunslinger)
  renderPlayer(g, ox, oy) {
    let px = 54 + ox;
    let py = 142 + oy;

    const isHit = (this.state === 'RESOLVE_LOSS' && this.winner === 'OUTLAW');
    const isDrawing = (this.state === 'RESOLVE_WIN' && this.winner === 'PLAYER');
    const isBlinking = (Math.floor(this.time * 2) % 4 === 0 && Math.sin(this.time * 10) > 0.85);

    // Hit knockback jolt
    if (isHit) {
      px -= 5;
    }

    // Boots & Spurs (standing at ground level y = 180)
    g.rect(px + 4, py + 34, 6, 5, 2);
    g.rect(px + 14, py + 34, 6, 5, 2);
    g.px(px + 2, py + 36, 3); // Left spur sparkle
    g.px(px + 12, py + 36, 3); // Right spur sparkle

    // Trousers & Chaps
    g.rect(px + 4, py + 22, 6, 12, 1);
    g.rect(px + 14, py + 22, 6, 12, 1);
    g.line(px + 3, py + 22, px + 3, py + 34, 2); // Chaps fringe outer seam
    g.line(px + 20, py + 22, px + 20, py + 34, 2);

    // Gunbelt & Ammo loops
    g.line(px + 3, py + 20, px + 21, py + 22, 2);
    g.px(px + 7, py + 20, 3);
    g.px(px + 11, py + 21, 3);
    g.px(px + 15, py + 21, 3);

    // Torso & Vest
    if (isHit) {
      // Reeling backward in defeat
      g.rect(px + 2, py + 10, 13, 11, 2);
      g.line(px + 2, py + 10, px + 2, py + 21, 1);
    } else {
      g.rect(px + 5, py + 10, 14, 11, 2);
      g.line(px + 5, py + 10, px + 5, py + 21, 1); // Open vest fold
      g.line(px + 18, py + 10, px + 18, py + 21, 1);
    }

    // Neck Bandana
    g.tri(px + 8, py + 9, px + 15, py + 9, px + 11, py + 13, 3);

    // Head & Focused Gunslinger Eye
    const headX = isHit ? px + 3 : px + 7;
    g.rect(headX, py + 2, 9, 8, 2);
    if (!isBlinking && !isHit) {
      g.px(headX + 6, py + 4, 3); // Focused eye
    }

    // Nervous Sweat Drop during tense standoff
    if (this.state === 'STANDOFF' && this.standoffTime > 1.8) {
      const drip = Math.min(5, Math.floor((this.standoffTime - 1.8) * 3));
      g.px(headX + 7, py + 3 + drip, 3);
    }

    // Arms, Holster & Gun Action Pose
    if (isDrawing) {
      // FIRING POSE: Arm extended forward, leveling revolver!
      g.rect(px + 12, py + 11, 12, 3, 2); // Outstretched arm
      g.rect(px + 24, py + 10, 8, 3, 3);  // Revolver barrel
      g.rect(px + 22, py + 9, 4, 4, 2);   // Cylinder
      g.rect(px + 21, py + 13, 3, 4, 1);  // Grip
    } else if (isHit) {
      // HIT POSE: Arms flailing up
      g.line(px + 4, py + 12, px, py + 4, 2);
      g.line(px + 14, py + 12, px + 18, py + 4, 2);
    } else {
      // STANDOFF POSE: Hand hovering ready right over holster
      g.line(px + 6, py + 11, px + 8, py + 18, 2);
      // Holster at hip
      g.rect(px + 15, py + 20, 4, 6, 1);
      // Twitching hand hovering over weapon
      const twitch = (Math.sin(this.time * 8) > 0.8) ? 1 : 0;
      g.rect(px + 14, py + 17 + twitch, 4, 3, 3);
    }

    // Cowboy Stetson Hat (Only drawn on head if not knocked off)
    if (!this.flyingHat || this.flyingHat.hatType !== 'STETSON' || this.winner === 'PLAYER') {
      const hx = headX - 3, hy = py - 4;
      g.line(hx - 2, hy + 6, hx + 16, hy + 6, 3); // Wide brim
      g.line(hx - 1, hy + 7, hx + 15, hy + 7, 2);
      g.rect(hx + 3, hy, 9, 6, 2); // Crown
      g.line(hx + 3, hy, hx + 11, hy, 3); // Top crease
      g.line(hx + 3, hy + 5, hx + 11, hy + 5, 1); // Hatband
    }
  },

  // OUTLAW SPRITE (Right Opponent Gunslinger with unique visual styles)
  renderOutlaw(g, ox, oy) {
    let ex = 182 + ox;
    let ey = 142 + oy;

    const outlaw = this.outlaws[this.round];
    const isHit = (this.state === 'RESOLVE_WIN' && this.winner === 'PLAYER');
    const isDrawing = (this.state === 'RESOLVE_LOSS' && this.winner === 'OUTLAW');
    const isBlinking = (Math.floor(this.time * 2.2) % 4 === 0 && Math.sin(this.time * 11) > 0.85);

    // Hit knockback jolt
    if (isHit) {
      ex += 5;
    }

    // Boots
    g.rect(ex + 4, ey + 34, 6, 5, 2);
    g.rect(ex + 14, ey + 34, 6, 5, 2);

    // Trousers
    g.rect(ex + 4, ey + 22, 6, 12, 1);
    g.rect(ex + 14, ey + 22, 6, 12, 1);
    if (outlaw.id === 0) {
      // Sloppy Sam: Patched ragged trousers
      g.px(ex + 6, ey + 26, 3);
      g.px(ex + 7, ey + 26, 3);
    }

    // Torso / Outfit
    g.rect(ex + 5, ey + 10, 14, 11, 2);

    // Custom Outlaw Clothing Details
    if (outlaw.id === 1) {
      // Rattlesnake Rick: Crossed ammo bandoliers
      g.line(ex + 5, ey + 10, ex + 18, ey + 21, 3);
      g.line(ex + 18, ey + 10, ex + 5, ey + 21, 3);
    } else if (outlaw.id === 2) {
      // Calamity Jane: Fringed leather jacket
      g.line(ex + 5, ey + 21, ex + 18, ey + 21, 3);
      g.px(ex + 7, ey + 22, 3); g.px(ex + 11, ey + 22, 3); g.px(ex + 15, ey + 22, 3);
    } else if (outlaw.id === 3) {
      // El Diablo: Draped striped serape/poncho
      g.line(ex + 4, ey + 12, ex + 19, ey + 12, 3);
      g.line(ex + 4, ey + 15, ex + 19, ey + 15, 1);
      g.line(ex + 4, ey + 18, ex + 19, ey + 18, 3);
    } else if (outlaw.id === 4) {
      // The Legendary Kid: Sleek black vest with gold star brooch
      g.line(ex + 5, ey + 10, ex + 5, ey + 21, 0);
      g.line(ex + 18, ey + 10, ex + 18, ey + 21, 0);
      g.px(ex + 12, ey + 14, 3); // Glistening star brooch
    }

    // Head
    const headX = isHit ? ex + 9 : ex + 7;
    g.rect(headX, ey + 2, 9, 8, 2);

    // Face / Eyes / Masks
    if (outlaw.id === 1) {
      // Rattlesnake Rick: Bandit Bandana Mask over mouth/nose
      g.rect(headX, ey + 5, 7, 5, 3);
      if (!isBlinking && !isHit) g.px(headX + 2, ey + 4, 0); // Menacing slit eye
    } else {
      if (!isBlinking && !isHit) g.px(headX + 2, ey + 4, 3); // Focused eye facing left
    }

    // Outlaw Custom Facial Features
    if (outlaw.id === 0) {
      // Sloppy Sam: Bushy unkempt beard
      g.tri(headX, ey + 6, headX + 7, ey + 6, headX + 2, ey + 14, 2);
    } else if (outlaw.id === 2) {
      // Calamity Jane: Long ponytail braid behind head
      g.line(headX + 9, ey + 4, headX + 12, ey + 14, 2);
    } else if (outlaw.id === 3) {
      // El Diablo: Handlebar mustache
      g.line(headX - 1, ey + 7, headX + 4, ey + 7, 1);
      g.px(headX - 2, ey + 6, 1); // Curled tip
    }

    // Arms, Holster & Action Pose
    if (isDrawing) {
      // FIRING POSE: Arm extended left toward player!
      g.rect(ex - 2, ey + 11, 12, 3, 2);
      g.rect(ex - 8, ey + 10, 8, 3, 3); // Barrel
      g.rect(ex - 2, ey + 9, 4, 4, 2);  // Cylinder
      g.rect(ex + 1, ey + 13, 3, 4, 1);
    } else if (isHit) {
      // HIT POSE: Reeling back
      g.line(ex + 18, ey + 12, ex + 23, ey + 4, 2);
      g.line(ex + 8, ey + 12, ex + 4, ey + 4, 2);
    } else {
      // STANDOFF POSE: Hand ready over holster
      g.line(ex + 17, ey + 11, ex + 15, ey + 18, 2);
      g.rect(ex + 5, ey + 20, 4, 6, 1);
      const twitch = (Math.sin(this.time * 8.5) > 0.8) ? 1 : 0;
      g.rect(ex + 5, ey + 17 + twitch, 4, 3, 3);
    }

    // Custom Outlaw Hats (Rendered on head unless shot off)
    const hatIsOff = (this.flyingHat && this.flyingHat.hatType === outlaw.hatType && this.winner === 'PLAYER');
    if (!hatIsOff) {
      const hx = headX - 3, hy = ey - 4;
      if (outlaw.id === 0) {
        // Sloppy Sam: Floppy crumpled hat with hole
        g.line(hx - 2, hy + 6, hx + 16, hy + 6, 2);
        g.rect(hx + 2, hy + 1, 10, 5, 2);
        g.px(hx + 6, hy + 2, 0); // Hole in hat
      } else if (outlaw.id === 1) {
        // Rattlesnake Rick: Tall crown with snake band
        g.line(hx - 2, hy + 6, hx + 16, hy + 6, 3);
        g.rect(hx + 3, hy - 2, 9, 8, 2);
        g.line(hx + 3, hy + 4, hx + 11, hy + 4, 3); // Snake band
      } else if (outlaw.id === 2) {
        // Calamity Jane: Sleek hat with tall feather
        g.line(hx - 2, hy + 6, hx + 16, hy + 6, 3);
        g.rect(hx + 3, hy, 9, 6, 2);
        g.line(hx + 9, hy - 4, hx + 11, hy + 1, 3); // Feather
      } else if (outlaw.id === 3) {
        // El Diablo: Huge Sombrero with upturned brim
        g.line(hx - 5, hy + 6, hx + 19, hy + 6, 3);
        g.px(hx - 6, hy + 5, 2); g.px(hx + 20, hy + 5, 2);
        g.disc(hx + 7, hy + 2, 6, 2);
        g.line(hx + 3, hy + 4, hx + 11, hy + 4, 3);
      } else if (outlaw.id === 4) {
        // The Legendary Kid: Pristine White Stetson
        g.line(hx - 2, hy + 6, hx + 16, hy + 6, 3);
        g.line(hx - 1, hy + 7, hx + 15, hy + 7, 3);
        g.rect(hx + 3, hy, 9, 6, 3);
        g.line(hx + 3, hy, hx + 11, hy, 2);
        g.line(hx + 3, hy + 5, hx + 11, hy + 5, 0); // Black contrast band
      }
    }
  },

  // 4. Combat FX: Muzzle Flashes, Bullet Tracer, Smoke, and Flying Hats
  renderCombatFx(g, ox, oy) {
    // Muzzle flash on firing
    if (this.state === 'RESOLVE_WIN' && this.duelTimer < 0.22) {
      const fx = 54 + 32 + ox, fy = 151 + oy;
      g.disc(fx, fy, 5, 3);
      g.line(fx - 9, fy, fx + 9, fy, 3);
      g.line(fx, fy - 9, fx, fy + 9, 3);
      g.line(fx - 5, fy - 5, fx + 5, fy + 5, 2);
      g.line(fx - 5, fy + 5, fx + 5, fy - 5, 2);
      // Tracer line across to outlaw
      g.line(fx + 6, fy, fx + 85, fy, 3);
    } else if (this.state === 'RESOLVE_LOSS' && this.duelTimer < 0.22) {
      const fx = 182 - 10 + ox, fy = 151 + oy;
      g.disc(fx, fy, 5, 3);
      g.line(fx - 9, fy, fx + 9, fy, 3);
      g.line(fx, fy - 9, fx, fy + 9, 3);
      g.line(fx - 5, fy - 5, fx + 5, fy + 5, 2);
      g.line(fx - 5, fy + 5, fx + 5, fy - 5, 2);
      // Tracer line across to player
      g.line(fx - 6, fy, fx - 85, fy, 3);
    }

    // Gun Smoke Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const progress = 1 - (p.life / p.maxLife);
      const rad = Math.floor(p.r + progress * (p.maxR - p.r));
      g.disc(p.x + ox, p.y + oy, rad, p.life > 0.3 ? p.shade : 1);
    }

    // Flying Hat Arc Physics
    const fh = this.flyingHat;
    if (fh) {
      const hx = Math.round(fh.x + ox);
      const hy = Math.round(fh.y + oy);
      // Render rotating hat entity
      const flip = (Math.floor(fh.rot) % 2 === 0);
      if (flip) {
        g.line(hx - 8, hy, hx + 8, hy, 3);
        g.rect(hx - 4, hy - 5, 8, 5, 2);
      } else {
        g.line(hx, hy - 8, hx, hy + 8, 3);
        g.rect(hx - 4, hy - 4, 5, 8, 2);
      }
    }
  },

  // 5. Top Retro HUD
  renderHUD(g) {
    g.rect(0, 0, 256, 24, 0);
    g.line(0, 23, 256, 23, 2);
    g.line(0, 24, 256, 24, 1);

    // Round / Outlaw Name
    const outlaw = this.outlaws[this.round];
    g.text("RD " + (this.round + 1) + "/5: " + outlaw.name, 6, 8, 3);

    // Best Record
    const bestStr = (this.bestTime > 0) ? (this.bestTime + " MS") : "-- MS";
    g.text("BEST: " + bestStr, 138, 8, 2);

    // Difficulty Tag
    const diffTag = "[" + this.getDifficultyName() + "]";
    g.textR(diffTag, 250, 8, 3);
  },

  // 6. OVERLAYS

  // Wanted Poster Challenge Card
  renderWantedPoster(g) {
    const outlaw = this.outlaws[this.round];
    g.rect(34, 36, 188, 168, 0);
    g.box(34, 36, 188, 168, 3);
    g.box(36, 38, 184, 164, 2);

    // Poster Header
    g.textC("W A N T E D", 46, 3, 2);
    g.textC("DEAD OR ALIVE", 62, 2);

    // Outlaw Portrait Box
    g.box(96, 74, 64, 40, 2);
    g.rect(98, 76, 60, 36, 0);
    // Mini Outlaw Face inside portrait
    g.rect(122, 86, 12, 12, 2);
    g.px(125, 90, 3); g.px(129, 90, 3); // Eyes
    if (outlaw.id === 0) g.tri(124, 94, 132, 94, 128, 100, 3); // Beard
    if (outlaw.id === 1) g.rect(122, 92, 12, 6, 3); // Bandana
    if (outlaw.id === 3) g.line(121, 95, 134, 95, 3); // Mustache
    // Mini Hat
    g.line(116, 85, 139, 85, 3);
    g.rect(122, 80, 12, 5, 2);

    // Outlaw Details
    g.textC(outlaw.name, 122, 3);
    g.textC("\"" + outlaw.alias + "\"", 132, 2);
    g.textC("REWARD: " + outlaw.bounty, 144, 3);
    g.textC("REFLEX: ~" + Math.round((outlaw.minMs + outlaw.maxMs) / 2) + " MS", 154, 2);

    g.line(48, 166, 208, 166, 1);
    g.textC("PRESS [A] OR TAP TO DUEL!", 174, 3);
    g.textC("DIFF: [" + this.getDifficultyName() + "] (SELECT/PAD)", 186, 1);
  },

  // Standoff prompt & tension heartbeat
  renderStandoffUI(g) {
    g.rect(44, 204, 168, 22, 0);
    g.box(44, 204, 168, 22, 2);
    g.textC("STEADY... WAIT FOR SIGNAL!", 210, 2);
    g.textC("(EARLY DRAW = FOUL)", 218, 1);

    // Pulsing heartbeat tension dot
    const beat = (Math.sin(this.time * 9) > 0.3) ? 3 : 2;
    g.disc(128, 198, beat === 3 ? 3 : 2, beat);
  },

  // Explosive DRAW! banner
  renderDrawBanner(g) {
    const flash = (Math.floor(this.duelTimer * 24) % 2 === 0) ? 3 : 2;
    g.rect(36, 68, 184, 52, 0);
    g.box(36, 68, 184, 52, flash);
    g.box(38, 70, 180, 48, flash);

    g.textC("! !   D R A W   ! !", 82, 3, 2);
    g.textC("FIRE NOW! HIT [A] / TAP!", 106, flash);
  },

  // False Start Foul Screen
  renderFoulBanner(g) {
    g.rect(34, 58, 188, 104, 0);
    g.box(34, 58, 188, 104, 3);
    g.box(36, 60, 184, 100, 2);

    g.textC("! ! !   F O U L   ! ! !", 72, 3, 2);
    g.textC("FALSE START PENALTY!", 92, 3);
    g.textC("YOU DREW BEFORE THE SIGNAL!", 106, 2);
    g.textC("KEEP YER HAND OFF YER IRON!", 118, 1);

    g.line(48, 130, 208, 130, 1);
    g.textC("PRESS [A] OR TAP TO RETRY", 140, 3);
  },

  // Duel Win Resolution Card
  renderWinBanner(g) {
    const outlaw = this.outlaws[this.round];
    g.rect(28, 54, 200, 114, 0);
    g.box(28, 54, 200, 114, 3);
    g.box(30, 56, 196, 110, 2);

    g.textC("* * *   W I N N E R !   * * *", 66, 3, 2);
    g.textC(outlaw.name + " OUTDRAWN!", 84, 2);
    g.line(40, 94, 216, 94, 1);

    g.textC("YOU: " + this.playerMs + " MS  |  OUTLAW: " + this.outlawMs + " MS", 102, 3);
    const margin = this.outlawMs - this.playerMs;
    g.textC("MARGIN: +" + margin + " MS FASTER!", 114, 2);

    if (this.isNewRecord) {
      g.textC("★ NEW FASTEST RECORD TIME! ★", 126, 3);
    } else {
      g.textC("BOUNTY " + outlaw.bounty + " CLAIMED!", 126, 2);
    }

    g.line(40, 138, 216, 138, 1);
    const nextMsg = (this.round < this.outlaws.length - 1) ? "PRESS [A] FOR NEXT BOUNTY" : "PRESS [A] FOR FINAL VICTORY!";
    g.textC(nextMsg, 148, 3);
  },

  // Duel Loss (Too Slow) Resolution Card
  renderLossBanner(g) {
    const outlaw = this.outlaws[this.round];
    g.rect(28, 54, 200, 114, 0);
    g.box(28, 54, 200, 114, 2);
    g.box(30, 56, 196, 110, 1);

    g.textC("T O O   S L O W . . .", 66, 3, 2);
    g.textC(outlaw.quote, 84, 2);
    g.line(40, 94, 216, 94, 1);

    const youStr = (this.playerMs !== null) ? (this.playerMs + " MS") : "DID NOT DRAW";
    g.textC("YOU: " + youStr + "  |  OUTLAW: " + this.outlawMs + " MS", 102, 3);

    if (this.playerMs !== null) {
      const margin = this.playerMs - this.outlawMs;
      g.textC("MARGIN: -" + margin + " MS SLOWER", 114, 1);
    } else {
      g.textC("THE OUTLAW DREW FIRST!", 114, 1);
    }

    g.line(40, 134, 216, 134, 1);
    g.textC("PRESS [A] OR TAP TO RETRY ROUND", 144, 3);
    g.textC("DIFF: [" + this.getDifficultyName() + "] (SELECT/PAD)", 154, 1);
  },

  // Grand Champion / Sheriff Badge Epilogue Screen
  renderChampionScreen(g) {
    g.rect(18, 26, 220, 188, 0);
    g.box(18, 26, 220, 188, 3);
    g.box(20, 28, 216, 184, 2);

    // Sheriff 6-Point Star Badge (Drawn in retro vector geometry)
    const bx = 128, by = 60;
    g.disc(bx, by, 12, 2);
    g.box(bx - 12, by - 12, 24, 24, 3);
    // 6 Star Points
    g.tri(bx, by - 18, bx - 5, by - 10, bx + 5, by - 10, 3);
    g.tri(bx, by + 18, bx - 5, by + 10, bx + 5, by + 10, 3);
    g.tri(bx - 18, by - 5, bx - 10, by - 10, bx - 10, by, 3);
    g.tri(bx + 18, by - 5, bx + 10, by - 10, bx + 10, by, 3);
    g.tri(bx - 18, by + 5, bx - 10, by, bx - 10, by + 10, 3);
    g.tri(bx + 18, by + 5, bx + 10, by, bx + 10, by + 10, 3);
    g.text("SHERIFF", bx - 16, by - 3, 0);

    // Sparkles around star badge
    const spk = (Math.sin(this.time * 6) > 0);
    if (spk) {
      g.px(bx - 24, by - 12, 3);
      g.px(bx + 24, by + 12, 3);
    } else {
      g.px(bx + 24, by - 12, 3);
      g.px(bx - 24, by + 12, 3);
    }

    g.textC("FASTEST GUN IN THE WEST", 88, 3, 2);
    g.textC("VERDANT VALLEY IS SAFE!", 106, 2);
    g.line(34, 116, 222, 116, 1);

    g.textC("ALL 5 OUTLAWS BROUGHT TO JUSTICE", 124, 3);
    g.textC("BEST REACTION TIME: " + (this.bestTime || "--") + " MS", 136, 2);

    const count = this.stats.reactionTimes.length;
    const avg = count > 0 ? Math.round(this.stats.reactionTimes.reduce((a, b) => a + b, 0) / count) : 0;
    g.textC("AVERAGE REACTION: " + (avg > 0 ? avg + " MS" : "--"), 148, 2);
    g.textC("TOTAL BOUNTY EARNED: $6,850", 160, 3);

    g.line(34, 172, 222, 172, 1);
    g.textC("PRESS [A] OR TAP TO PLAY AGAIN", 182, 3);
  }
};
