// js/cartridges/cart_055_boss_duel.js
// ============================================================================
// Cartridge #055: BOSS DUEL (Souls/Sekiro Colossal Boss Duel Overhaul)
// ============================================================================
// A deep, methodical fantasy duel against the Iron Sentinel / Abyssal Knight.
// Features Soulslike stamina management, tight Sekiro deflection/parry windows,
// i-frame roll dodges, guard mitigation, boss posture & staggered visceral ripostes,
// 2 distinct boss phases, visual telegraphs, perilous attacks, and CRT presentation.
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[55] = {
  id: 55,
  name: "BOSS DUEL",
  genre: 5,
  scoreLabel: "SCORE",
  desc: "SOULSLIKE DUEL: READ BOSS WINDUP, PARRY [A], DODGE ROLL [B], GUARD [▼]!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON: Clashing Crossed Blades with Spark Burst & Knight Crest
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);

    // Beveled corners
    g.px(x + 1, y + 1, 3);
    g.px(x + 30, y + 1, 3);
    g.px(x + 1, y + 30, 3);
    g.px(x + 30, y + 30, 3);

    // Crossed Sword 1 (Top-Left to Bottom-Right)
    g.line(x + 6, y + 6, x + 21, y + 21, 3);
    g.line(x + 7, y + 5, x + 22, y + 20, 2);
    // Crossguard & Hilt 1
    g.line(x + 19, y + 23, x + 23, y + 19, 2);
    g.line(x + 21, y + 21, x + 24, y + 24, 1);
    g.px(x + 25, y + 25, 3); // Pommel

    // Crossed Sword 2 (Top-Right to Bottom-Left)
    g.line(x + 25, y + 6, x + 10, y + 21, 3);
    g.line(x + 24, y + 5, x + 9, y + 20, 2);
    // Crossguard & Hilt 2
    g.line(x + 8, y + 19, x + 12, y + 23, 2);
    g.line(x + 10, y + 21, x + 7, y + 24, 1);
    g.px(x + 6, y + 25, 3); // Pommel

    // Brilliant central deflection spark burst (x + 16, y + 13)
    g.disc(x + 16, y + 13, 2, 3);
    g.line(x + 13, y + 13, x + 19, y + 13, 3);
    g.line(x + 16, y + 10, x + 16, y + 16, 3);
    g.px(x + 12, y + 9, 2);
    g.px(x + 20, y + 9, 2);
    g.px(x + 12, y + 17, 2);
    g.px(x + 20, y + 17, 2);

    // Knight Bascinet Helmet Visor at bottom center (x + 12..19, y + 22..28)
    g.rect(x + 13, y + 23, 6, 5, 2);
    g.line(x + 14, y + 25, x + 17, y + 25, 0); // Visor slit
    g.line(x + 14, y + 27, x + 17, y + 27, 3); // Chin guard
    g.px(x + 15, y + 22, 3); // Plume tip
  },

  // --------------------------------------------------------------------------
  // 2. AUDIO DISPATCHER: Punchy SFX & Resonant Metallic Deflection Tones
  // --------------------------------------------------------------------------
  playSfx(type) {
    if (typeof APU === 'undefined') return;
    try {
      switch (type) {
        case 'PARRY':
        case 'CLANG':
          // Crisp metallic clang: high-frequency triangle/sine chime with sharp attack
          if (APU.softTone) {
            APU.softTone(1174.66, 0.12, 'triangle', 0.16, 0, 0.002, 3200);
            APU.softTone(1760.00, 0.18, 'sine', 0.14, 0.015, 0.002, 3600);
          }
          if (APU.noise) APU.noise(0.025, 0.06, 2400, 'bandpass');
          break;

        case 'SLASH':
        case 'SWORD':
          APU.sfx('SWISH');
          break;

        case 'HIT':
          APU.sfx('HIT');
          break;

        case 'GUARD':
          APU.sfx('TICK');
          if (APU.softTone) APU.softTone(280, 0.07, 'triangle', 0.12, 0, 0.005, 900);
          break;

        case 'ROLL':
          APU.sfx('SWISH');
          break;

        case 'HURT':
          APU.sfx('HURT');
          break;

        case 'DANGER':
        case 'ALARM':
          APU.sfx('ALARM');
          break;

        case 'BOOM':
        case 'EXPLODE':
          APU.sfx('BOOM');
          break;

        case 'POWER':
        case 'POWERUP':
          APU.sfx('POWER');
          break;

        case 'STAGGER':
          if (APU.softTone) {
            APU.softTone(349.23, 0.22, 'triangle', 0.14, 0, 0.01, 1200);
            APU.softTone(261.63, 0.30, 'sine', 0.16, 0.08, 0.02, 900);
          }
          APU.sfx('BOOM');
          break;

        case 'RIPOSTE':
        case 'EXECUTION':
          APU.sfx('HIT');
          APU.sfx('BOOM');
          if (APU.softTone) {
            APU.softTone(523.25, 0.20, 'sine', 0.14, 0.02, 0.01, 1800);
            APU.softTone(783.99, 0.32, 'triangle', 0.16, 0.08, 0.01, 2400);
          }
          break;

        case 'VICTORY':
        case 'FANFARE':
          APU.sfx('LEVELUP');
          break;

        case 'SELECT':
        case 'CONFIRM':
          APU.sfx('UI_OK');
          break;

        case 'ERROR':
          APU.sfx('DENY');
          break;

        case 'TICK':
          APU.sfx('TICK');
          break;

        default:
          if (APU.sfx) APU.sfx(type);
          break;
      }
    } catch (_) {}
  },

  // --------------------------------------------------------------------------
  // 3. DIFFICULTY INTEGRATION (0=EASY, 1=NORMAL, 2=HARD)
  // --------------------------------------------------------------------------
  getDifficulty() {
    if (typeof VOS !== 'undefined' && typeof VOS.difficulty === 'number') {
      return Math.max(0, Math.min(2, VOS.difficulty));
    }
    return 1; // Default to Normal
  },

  getDiffSettings() {
    const diff = this.getDifficulty();
    if (diff === 0) { // EASY (0.75x speed)
      return {
        parryWindow: 0.22,       // Generous 0.22s window
        bossDmgMult: 0.75,       // 25% less damage
        staminaRegen: 45,        // Quick stamina recovery
        bossCooldownBase: 1.1,   // Longer pauses between boss attacks
        perilousChance: 0.20     // Fewer dangerous attacks
      };
    } else if (diff === 2) { // HARD (1.4x speed)
      return {
        parryWindow: 0.12,       // Strict 0.12s window
        bossDmgMult: 1.25,       // High punishment
        staminaRegen: 28,        // Demands strict stamina management
        bossCooldownBase: 0.55,  // Relentless boss pressure
        perilousChance: 0.45     // Frequent perilous moves
      };
    }
    // NORMAL (1.0x speed)
    return {
      parryWindow: 0.16,
      bossDmgMult: 1.0,
      staminaRegen: 35,
      bossCooldownBase: 0.85,
      perilousChance: 0.32
    };
  },

  // --------------------------------------------------------------------------
  // 4. INITIALIZATION & STATE SETUP
  // --------------------------------------------------------------------------
  init() {
    this.state = 'INTRO'; // 'INTRO', 'FIGHT', 'PHASE_SHIFT', 'EXECUTION', 'VICTORY', 'DEFEAT'
    this.time = 0;
    this.battleTime = 0;
    this.introTimer = 2.2;
    this.hitStop = 0;

    // Screen Shake
    this.shake = 0;
    this.shakeX = 0;
    this.shakeY = 0;

    // Arena Floor level
    this.groundY = 186;

    // Player State
    this.player = {
      x: 64,
      y: 160,
      vx: 0,
      dir: 1, // 1 = right (facing boss)
      hp: 100,
      maxHp: 100,
      stamina: 100,
      maxStamina: 100,
      state: 'IDLE', // 'IDLE', 'MOVE', 'ATTACK', 'PARRY', 'GUARD', 'ROLL', 'HURT', 'STAGGERED'
      stateTimer: 0,
      iFrames: 0,
      guarding: false,
      staminaDelay: 0,
      comboStep: 0,
      comboResetTimer: 0,
      attackHitDone: false,
      parryWindowTimer: 0
    };

    // Boss State ("IRON SENTINEL" -> "ABYSSAL KNIGHT")
    this.boss = {
      name: "IRON SENTINEL",
      title: "GUARDIAN OF THE FORGOTTEN SANCTUM",
      phase: 1,
      hp: 250,
      maxHp: 250,
      displayHp: 250, // Trailing damage bar
      posture: 0,
      maxPosture: 100,
      x: 182,
      y: 138,
      vx: 0,
      state: 'IDLE', // 'IDLE', 'WINDUP', 'ATTACK', 'RECOVERY', 'STAGGERED', 'PHASE_SHIFT', 'DEATH'
      moveName: null, // 'OVERHEAD_SLAM', 'HORIZONTAL_SWEEP', 'DOUBLE_THRUST', 'PERILOUS_THRUST', 'LEAP_SLAM'
      moveTimer: 0,
      windupDuration: 0,
      attackDuration: 0,
      recoveryDuration: 0,
      cooldownTimer: 1.2,
      hitConnected: false,
      staggerTimer: 0,
      subStep: 0,
      isPerilous: false,
      leapY: 0,
      leapVelY: 0,
      glowTimer: 0
    };

    // Particle pool and floating combat texts
    this.particles = [];
    this.floatTexts = [];
    this.cracks = []; // Ground battle cracks

    // Battle Stats & Evaluation
    this.stats = {
      perfectParries: 0,
      normalGuards: 0,
      rollsPerformed: 0,
      damageDealt: 0,
      damageTaken: 0,
      executions: 0,
      finalScore: 0,
      grade: 'C'
    };

    // Spawn initial atmospheric torch embers
    for (let i = 0; i < 18; i++) {
      this.particles.push({
        x: 10 + Math.random() * 236,
        y: 40 + Math.random() * 150,
        vx: (Math.random() - 0.5) * 8,
        vy: -10 - Math.random() * 15,
        life: 1 + Math.random() * 2,
        maxLife: 3,
        type: 'ember',
        c: Math.random() > 0.4 ? 2 : 3
      });
    }
  },

  // --------------------------------------------------------------------------
  // 5. COMBAT ACTION TRIGGERS (PARRY, ATTACK, ROLL, GUARD)
  // --------------------------------------------------------------------------
  triggerParry() {
    const p = this.player;
    if (p.state === 'ROLL' || p.state === 'HURT' || p.state === 'STAGGERED') return;
    if (p.stamina < 15) {
      this.playSfx('ERROR');
      this.addFloatText("NO STAMINA", p.x, p.y - 12, 1);
      return;
    }

    p.stamina = Math.max(0, p.stamina - 15);
    p.staminaDelay = 0.5;
    p.state = 'PARRY';
    p.stateTimer = 0.28;
    p.parryWindowTimer = this.getDiffSettings().parryWindow;
    this.playSfx('SWISH');

    // Check if boss attack is actively in telegraph / parry window!
    this.checkParryTiming();
  },

  checkParryTiming() {
    const b = this.boss;
    const p = this.player;
    if (b.state !== 'WINDUP' && b.state !== 'ATTACK') return;
    if (b.isPerilous) {
      // Perilous attacks CANNOT be parried!
      return;
    }

    // Determine how close the boss attack is to landing
    let timeLeftBeforeStrike = 0;
    if (b.state === 'WINDUP') {
      timeLeftBeforeStrike = b.windupDuration - b.moveTimer;
    } else if (b.state === 'ATTACK' && !b.hitConnected) {
      timeLeftBeforeStrike = 0.02; // Just landing
    }

    const windowLimit = this.getDiffSettings().parryWindow;
    if (timeLeftBeforeStrike <= windowLimit && timeLeftBeforeStrike >= -0.04) {
      // PERFECT PARRY SUCCESS!
      this.executePerfectParry();
    }
  },

  executePerfectParry() {
    const b = this.boss;
    const p = this.player;

    this.stats.perfectParries++;
    this.playSfx('PARRY');
    this.hitStop = 0.08; // Freeze frame for impact
    this.shake = 5;

    // Reward player with stamina refund and zero damage
    p.stamina = Math.min(p.maxStamina, p.stamina + 10);
    p.parryWindowTimer = 0;

    // Interrupt boss attack & deal heavy posture damage!
    b.state = 'RECOVERY';
    b.moveTimer = 0;
    b.recoveryDuration = 0.65;
    b.hitConnected = true; // Prevents any lingering hit

    // Posture calculation
    const postureGain = (b.moveName === 'DOUBLE_THRUST') ? 26 : 34;
    b.posture = Math.min(b.maxPosture, b.posture + postureGain);

    // Spawn dazzling deflection sparks at collision point
    const sparkX = Math.floor((p.x + b.x) / 2) + 6;
    const sparkY = p.y + 4;
    this.spawnClangSparks(sparkX, sparkY);

    this.addFloatText("PERFECT PARRY!", sparkX - 10, sparkY - 14, 3);

    // Check for Boss Stagger / Posture Break!
    if (b.posture >= b.maxPosture) {
      this.triggerBossStagger();
    }
  },

  triggerBossStagger() {
    const b = this.boss;
    b.state = 'STAGGERED';
    b.staggerTimer = 2.8; // 2.8s vulnerability window
    b.moveTimer = 0;
    this.hitStop = 0.12;
    this.shake = 8;
    this.playSfx('STAGGER');
    this.addFloatText("★ STAGGERED! [A] RIPOSTE ★", b.x - 24, b.y - 18, 3);
  },

  triggerAttack() {
    const p = this.player;
    const b = this.boss;
    if (p.state === 'ROLL' || p.state === 'HURT' || p.state === 'STAGGERED') return;

    // Check if boss is STAGGERED and player is in execution range!
    if (b.state === 'STAGGERED') {
      const dist = Math.abs((p.x + 10) - (b.x + 14));
      if (dist < 64) {
        this.executeVisceralRiposte();
        return;
      }
    }

    if (p.stamina < 20) {
      this.playSfx('ERROR');
      this.addFloatText("NO STAMINA", p.x, p.y - 12, 1);
      return;
    }

    p.stamina = Math.max(0, p.stamina - 20);
    p.staminaDelay = 0.65;
    p.state = 'ATTACK';
    p.stateTimer = 0.30;
    p.attackHitDone = false;

    // Combo Chain step 0 -> 1 -> 2 -> 0
    p.comboStep = (p.comboStep + 1) % 3;
    p.comboResetTimer = 0.85;

    this.playSfx('SLASH');

    // Swing sword animation & hit detection
    this.resolvePlayerSlashHit();
  },

  executeVisceralRiposte() {
    const p = this.player;
    const b = this.boss;

    this.state = 'EXECUTION';
    p.state = 'ATTACK';
    p.stateTimer = 0.65;
    b.state = 'STAGGERED';
    b.staggerTimer = 0.65;

    this.stats.executions++;
    this.hitStop = 0.22; // Dramatic freeze frame
    this.shake = 12;

    const damage = 52;
    b.hp = Math.max(0, b.hp - damage);
    this.stats.damageDealt += damage;
    b.posture = 0; // Posture fully depleted

    this.playSfx('RIPOSTE');

    // Plunge spark eruption
    const ripX = b.x + 8;
    const ripY = b.y + 16;
    for (let i = 0; i < 24; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 110;
      this.particles.push({
        x: ripX,
        y: ripY,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.3 + Math.random() * 0.4,
        maxLife: 0.7,
        type: 'spark',
        c: Math.random() > 0.3 ? 3 : 2
      });
    }

    this.addFloatText("CRITICAL EXECUTION! -" + damage, ripX - 28, ripY - 20, 3);

    // Check boss death or phase 2 trigger
    if (b.hp <= 0) {
      this.triggerBossDeath();
    } else if (b.phase === 1 && b.hp <= (b.maxHp * 0.5)) {
      this.triggerPhaseShift();
    }
  },

  resolvePlayerSlashHit() {
    const p = this.player;
    const b = this.boss;
    const dist = (b.x + 12) - (p.x + 14);

    // Melee range check
    if (dist >= -10 && dist <= 48 && !p.attackHitDone) {
      p.attackHitDone = true;

      // Base damage scaled by combo step
      const comboDmg = [12, 15, 22][p.comboStep] || 12;
      b.hp = Math.max(0, b.hp - comboDmg);
      this.stats.damageDealt += comboDmg;

      // Regular strikes slightly increase posture
      b.posture = Math.min(b.maxPosture, b.posture + 6);

      this.playSfx('HIT');
      this.shake = 3;

      // Impact sparks
      const hitX = b.x + 4;
      const hitY = b.y + 12 + Math.floor(Math.random() * 14);
      for (let i = 0; i < 8; i++) {
        const ang = (Math.random() - 0.5) * 1.5 + Math.PI;
        const spd = 30 + Math.random() * 70;
        this.particles.push({
          x: hitX,
          y: hitY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 0.2 + Math.random() * 0.2,
          maxLife: 0.4,
          type: 'spark',
          c: 3
        });
      }

      this.addFloatText("-" + comboDmg, hitX, hitY - 8, 2);

      if (b.hp <= 0) {
        this.triggerBossDeath();
      } else if (b.phase === 1 && b.hp <= (b.maxHp * 0.5)) {
        this.triggerPhaseShift();
      } else if (b.posture >= b.maxPosture) {
        this.triggerBossStagger();
      }
    }
  },

  triggerRoll(dir = 0) {
    const p = this.player;
    if (p.state === 'ROLL' || p.state === 'HURT' || p.state === 'STAGGERED') return;
    if (p.stamina < 25) {
      this.playSfx('ERROR');
      this.addFloatText("NO STAMINA", p.x, p.y - 12, 1);
      return;
    }

    p.stamina = Math.max(0, p.stamina - 25);
    p.staminaDelay = 0.75;
    p.state = 'ROLL';
    p.stateTimer = 0.42;
    p.iFrames = 0.32; // Invulnerable for 0.32s!
    this.stats.rollsPerformed++;

    // Roll direction
    let rollDir = dir;
    if (rollDir === 0) {
      if (PAD.held('left')) rollDir = -1;
      else if (PAD.held('right')) rollDir = 1;
      else rollDir = -1; // Default back-step roll for safety
    }
    p.vx = rollDir * 135;

    this.playSfx('ROLL');

    // Dust particles at feet
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: p.x + 8 + (Math.random() - 0.5) * 8,
        y: this.groundY - 1,
        vx: -rollDir * (20 + Math.random() * 40),
        vy: -8 - Math.random() * 12,
        life: 0.25 + Math.random() * 0.2,
        maxLife: 0.45,
        type: 'dust',
        c: 1
      });
    }
  },

  // --------------------------------------------------------------------------
  // 6. BOSS AI & ATTACK SYSTEM
  // --------------------------------------------------------------------------
  updateBossAI(dt) {
    const b = this.boss;
    const p = this.player;
    const diff = this.getDiffSettings();

    // Natural Posture Decay when idle / not being deflected
    if (b.state === 'IDLE' || b.state === 'RECOVERY') {
      b.posture = Math.max(0, b.posture - 3.5 * dt);
    }

    if (b.state === 'IDLE') {
      b.cooldownTimer -= dt;
      if (b.cooldownTimer <= 0) {
        this.selectNextBossMove();
      }
    } else if (b.state === 'WINDUP') {
      b.moveTimer += dt;

      // Perilous Kanji Flash & Audio Warning
      if (b.isPerilous && b.moveTimer >= 0.15 && !b.perilousAlarmSounded) {
        b.perilousAlarmSounded = true;
        this.playSfx('DANGER');
      }

      // Check if windup finished -> Transition into active ATTACK frame!
      if (b.moveTimer >= b.windupDuration) {
        b.state = 'ATTACK';
        b.moveTimer = 0;
        b.hitConnected = false;
        this.playSfx('SWORD');
      }
    } else if (b.state === 'ATTACK') {
      b.moveTimer += dt;

      // Handle active attack hitboxes
      this.resolveBossAttackHit(dt);

      if (b.moveTimer >= b.attackDuration) {
        // Multi-hit moves check (Double Thrust)
        if (b.moveName === 'DOUBLE_THRUST' && b.subStep === 0) {
          b.subStep = 1;
          b.state = 'WINDUP';
          b.moveTimer = 0;
          b.windupDuration = 0.24; // Very fast secondary rhythm jab!
          b.attackDuration = 0.12;
          b.hitConnected = false;
        } else {
          b.state = 'RECOVERY';
          b.moveTimer = 0;
        }
      }
    } else if (b.state === 'RECOVERY') {
      b.moveTimer += dt;
      if (b.moveTimer >= b.recoveryDuration) {
        b.state = 'IDLE';
        b.cooldownTimer = diff.bossCooldownBase * (0.8 + Math.random() * 0.4);
      }
    } else if (b.state === 'STAGGERED') {
      b.staggerTimer -= dt;
      if (b.staggerTimer <= 0) {
        // Stagger ends; boss recovers
        b.state = 'RECOVERY';
        b.recoveryDuration = 0.6;
        b.posture = Math.floor(b.maxPosture * 0.4); // Retains 40% posture
        this.addFloatText("BOSS RECOVERED", b.x - 8, b.y - 12, 1);
      }
    }
  },

  selectNextBossMove() {
    const b = this.boss;
    const p = this.player;
    const diff = this.getDiffSettings();
    const dist = Math.abs(b.x - p.x);

    b.moveTimer = 0;
    b.hitConnected = false;
    b.subStep = 0;
    b.isPerilous = false;
    b.perilousAlarmSounded = false;

    // Available moves pool based on current Phase
    const moves = ['OVERHEAD_SLAM', 'HORIZONTAL_SWEEP', 'DOUBLE_THRUST'];

    if (b.phase === 2) {
      if (Math.random() < diff.perilousChance) {
        moves.push('PERILOUS_THRUST');
      }
      if (dist > 70 || Math.random() < 0.35) {
        moves.push('LEAP_SLAM');
      }
    }

    // Pick move
    const chosen = moves[Math.floor(Math.random() * moves.length)];
    b.moveName = chosen;
    b.state = 'WINDUP';

    // Set precise telegraph and attack durations
    if (chosen === 'OVERHEAD_SLAM') {
      b.windupDuration = b.phase === 2 ? 0.72 : 0.85;
      b.attackDuration = 0.15;
      b.recoveryDuration = 0.70;
    } else if (chosen === 'HORIZONTAL_SWEEP') {
      b.windupDuration = b.phase === 2 ? 0.48 : 0.58;
      b.attackDuration = 0.14;
      b.recoveryDuration = 0.55;
    } else if (chosen === 'DOUBLE_THRUST') {
      b.windupDuration = b.phase === 2 ? 0.42 : 0.52;
      b.attackDuration = 0.12;
      b.recoveryDuration = 0.65;
    } else if (chosen === 'PERILOUS_THRUST') {
      b.isPerilous = true;
      b.windupDuration = 0.68;
      b.attackDuration = 0.16;
      b.recoveryDuration = 0.80;
    } else if (chosen === 'LEAP_SLAM') {
      b.windupDuration = 0.35; // Crouch & leap launch
      b.attackDuration = 0.65; // Air-time & dive crash
      b.recoveryDuration = 0.75;
      b.leapVelY = -220;
    }
  },

  resolveBossAttackHit(dt) {
    const b = this.boss;
    const p = this.player;
    if (b.hitConnected) return;

    // Special Leap Slam mechanics
    if (b.moveName === 'LEAP_SLAM') {
      b.leapVelY += 450 * dt;
      b.leapY += b.leapVelY * dt;
      if (b.leapY >= 0) {
        b.leapY = 0;
        b.hitConnected = true;

        // Ground Impact Crater & Shockwave!
        this.playSfx('BOOM');
        this.shake = 10;
        this.spawnShockwave(b.x + 12, this.groundY);

        // Check if player caught in ground impact
        const dist = Math.abs((p.x + 8) - (b.x + 12));
        if (dist < 80) {
          if (p.iFrames > 0) {
            // Clean i-frame roll through shockwave!
            this.addFloatText("DODGED!", p.x, p.y - 12, 3);
          } else {
            // Hit by shockwave!
            this.applyDamageToPlayer(26, false);
          }
        }
      }
      return;
    }

    // Standard melee reach calculations
    const strikeRange = b.moveName === 'HORIZONTAL_SWEEP' ? 68 : 56;
    const distToPlayer = (b.x + 10) - (p.x + 10);

    if (distToPlayer > -10 && distToPlayer <= strikeRange) {
      b.hitConnected = true;

      // 1. Invulnerability frames (Roll Dodge)
      if (p.iFrames > 0) {
        this.addFloatText("CLEAN DODGE!", p.x, p.y - 14, 3);
        return;
      }

      // 2. Active Perfect Parry window
      if (p.parryWindowTimer > 0 && !b.isPerilous) {
        this.executePerfectParry();
        return;
      }

      // 3. Normal Guard (Holding [Down] or [GUARD] touch)
      if (p.guarding) {
        if (b.isPerilous) {
          // Unblockable perilous attack shatters guard!
          this.playSfx('HURT');
          this.addFloatText("GUARD PIERCED!", p.x - 10, p.y - 16, 1);
          p.state = 'STAGGERED';
          p.stateTimer = 0.9;
          this.applyDamageToPlayer(38, true, true);
        } else {
          // Successful Guard Mitigation (70% damage reduction)
          this.stats.normalGuards++;
          const chipDamage = Math.max(3, Math.floor(this.getBaseMoveDamage(b.moveName) * 0.30));
          p.stamina = Math.max(0, p.stamina - 22);
          p.staminaDelay = 0.8;

          this.playSfx('GUARD');
          this.shake = 3;

          // Shield spark
          this.spawnClangSparks(p.x + 14, p.y + 6);
          this.addFloatText("GUARDED -" + chipDamage, p.x, p.y - 12, 2);

          p.hp = Math.max(0, p.hp - chipDamage);
          this.stats.damageTaken += chipDamage;

          // Guard break if stamina exhausted!
          if (p.stamina <= 0) {
            p.state = 'STAGGERED';
            p.stateTimer = 1.1;
            this.playSfx('ERROR');
            this.addFloatText("GUARD BROKEN!", p.x - 8, p.y - 20, 1);
          }

          if (p.hp <= 0) this.triggerPlayerDeath();
        }
        return;
      }

      // 4. Failed / Late / Unblocked -> Full Damage!
      const rawDmg = this.getBaseMoveDamage(b.moveName);
      this.applyDamageToPlayer(rawDmg, b.isPerilous);
    }
  },

  getBaseMoveDamage(moveName) {
    const diff = this.getDiffSettings();
    let dmg = 24;
    if (moveName === 'OVERHEAD_SLAM') dmg = 28;
    else if (moveName === 'HORIZONTAL_SWEEP') dmg = 22;
    else if (moveName === 'DOUBLE_THRUST') dmg = 16;
    else if (moveName === 'PERILOUS_THRUST') dmg = 38;
    else if (moveName === 'LEAP_SLAM') dmg = 32;
    return Math.floor(dmg * diff.bossDmgMult);
  },

  applyDamageToPlayer(damage, isPerilous, forceStagger = false) {
    const p = this.player;
    p.hp = Math.max(0, p.hp - damage);
    this.stats.damageTaken += damage;

    if (forceStagger || p.state === 'STAGGERED') {
      p.state = 'STAGGERED';
      p.stateTimer = 0.9;
    } else {
      p.state = 'HURT';
      p.stateTimer = 0.28;
    }
    p.vx = isPerilous ? -90 : -60; // Knockback

    this.hitStop = 0.10;
    this.shake = isPerilous ? 10 : 7;
    this.playSfx('HURT');

    // Hurt particles
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: p.x + 8,
        y: p.y + 8,
        vx: (Math.random() - 0.5) * 60 - 20,
        vy: -15 - Math.random() * 40,
        life: 0.25 + Math.random() * 0.2,
        maxLife: 0.45,
        type: 'spark',
        c: 1
      });
    }

    this.addFloatText("-" + damage, p.x + 4, p.y - 10, 1);

    if (p.hp <= 0) {
      this.triggerPlayerDeath();
    }
  },

  // --------------------------------------------------------------------------
  // 7. PHASE TRANSITION & VICTORY / DEFEAT SEQUENCING
  // --------------------------------------------------------------------------
  triggerPhaseShift() {
    const b = this.boss;
    b.phase = 2;
    b.name = "ABYSSAL KNIGHT";
    b.title = "DREAD LORD OF THE BLACKENED BLADE";
    b.state = 'PHASE_SHIFT';
    b.moveTimer = 0;
    b.posture = 0; // Clear posture

    this.state = 'PHASE_SHIFT';
    this.shake = 14;
    this.hitStop = 0.20;

    this.playSfx('BOOM');
    this.playSfx('POWER');

    // Push player back
    this.player.vx = -120;

    // Dark flame eruption
    for (let i = 0; i < 35; i++) {
      this.particles.push({
        x: b.x + (Math.random() - 0.5) * 36,
        y: this.groundY - 2,
        vx: (Math.random() - 0.5) * 60,
        vy: -30 - Math.random() * 90,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1.0,
        type: 'ember',
        c: 3
      });
    }

    this.addFloatText("★ PHASE 2: ABYSSAL AWAKENING ★", 28, 70, 3);
  },

  triggerBossDeath() {
    const b = this.boss;
    b.hp = 0;
    b.state = 'DEATH';
    b.moveTimer = 0;
    this.state = 'VICTORY';
    this.shake = 12;

    this.playSfx('BOOM');
    this.playSfx('VICTORY');

    // Calculate final score
    const hpBonus = this.player.hp * 10;
    const parryBonus = this.stats.perfectParries * 150;
    const speedBonus = Math.max(0, Math.floor((140 - this.battleTime) * 20));
    const executionBonus = this.stats.executions * 300;
    const totalScore = hpBonus + parryBonus + speedBonus + executionBonus;
    this.stats.finalScore = totalScore;

    // Assign performance grade
    if (totalScore >= 3200 && this.stats.damageTaken === 0) this.stats.grade = 'S+';
    else if (totalScore >= 2800) this.stats.grade = 'S';
    else if (totalScore >= 2100) this.stats.grade = 'A';
    else if (totalScore >= 1400) this.stats.grade = 'B';
    else this.stats.grade = 'C';

    // Commit high score to persistent cartridge memory
    SAVE.setScore(55, totalScore);
  },

  triggerPlayerDeath() {
    this.player.hp = 0;
    this.player.state = 'HURT';
    this.state = 'DEFEAT';
    this.shake = 10;
    this.playSfx('BOOM');
  },

  // --------------------------------------------------------------------------
  // 8. UPDATE LOOP & INPUT DISPATCH
  // --------------------------------------------------------------------------
  update(dt) {
    // Safety clamp dt to guarantee rock-solid physics at extreme speeds or lag spikes
    dt = Math.min(0.04, Math.max(0.001, dt));

    this.time += dt;

    // Camera screen shake decay
    if (this.shake > 0) {
      this.shake = Math.max(0, this.shake - dt * 25);
      this.shakeX = Math.round((Math.random() - 0.5) * this.shake);
      this.shakeY = Math.round((Math.random() - 0.5) * this.shake);
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }

    // Hit-stop slow-motion dampening
    let isHitStopping = false;
    if (this.hitStop > 0) {
      this.hitStop -= dt;
      isHitStopping = true;
    }

    // Atmospheric embers update
    this.updateParticles(dt);
    this.updateFloatTexts(dt);

    // ------------------------------------------------------------------------
    // STATE: INTRO CUTSCENE
    // ------------------------------------------------------------------------
    if (this.state === 'INTRO') {
      this.introTimer -= dt;
      if (this.introTimer <= 0 || PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || (PAD.tapPos && PAD.tapPos.y >= 0)) {
        this.state = 'FIGHT';
        this.playSfx('CONFIRM');
      }
      return;
    }

    // ------------------------------------------------------------------------
    // STATE: VICTORY OR DEFEAT OVERLAY
    // ------------------------------------------------------------------------
    if (this.state === 'VICTORY' || this.state === 'DEFEAT') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || (PAD.tapPos && PAD.tapPos.y >= 0)) {
        this.playSfx('CONFIRM');
        this.init();
      }
      return;
    }

    // ------------------------------------------------------------------------
    // STATE: PHASE SHIFT CUTSCENE
    // ------------------------------------------------------------------------
    if (this.state === 'PHASE_SHIFT') {
      this.boss.moveTimer += dt;
      if (this.boss.moveTimer >= 1.5) {
        this.state = 'FIGHT';
        this.boss.state = 'IDLE';
        this.boss.cooldownTimer = 0.8;
      }
      return;
    }

    // ------------------------------------------------------------------------
    // STATE: EXECUTION ZOOM FREEZE
    // ------------------------------------------------------------------------
    if (this.state === 'EXECUTION') {
      this.player.stateTimer -= dt;
      if (this.player.stateTimer <= 0) {
        this.state = 'FIGHT';
        this.player.state = 'IDLE';
        this.boss.state = 'RECOVERY';
        this.boss.recoveryDuration = 0.8;
      }
      return;
    }

    // ------------------------------------------------------------------------
    // ACTIVE DUEL: COMBAT INPUT HANDLING
    // ------------------------------------------------------------------------
    this.battleTime += dt;
    this.handleCombatInputs(dt);

    // Update Player & Boss Physics (frozen during hitStop)
    if (!isHitStopping) {
      this.updatePlayer(dt);
      this.updateBossAI(dt);
    }

    // Smooth trailing HP bar decay for boss
    if (this.boss.displayHp > this.boss.hp) {
      this.boss.displayHp = Math.max(this.boss.hp, this.boss.displayHp - dt * 60);
    }
  },

  handleCombatInputs(dt) {
    const p = this.player;

    // Detect On-Screen Touch / Pointer coordinates
    let tapX = -1, tapY = -1;
    if (typeof PAD !== 'undefined' && PAD.tapPos) {
      tapX = PAD.tapPos.x;
      tapY = PAD.tapPos.y;
    } else if (typeof TOUCH !== 'undefined' && TOUCH && TOUCH.tapPos) {
      tapX = TOUCH.tapPos.x;
      tapY = TOUCH.tapPos.y;
    }

    // Continuous touch hold (for Guard button)
    let pointerHeld = false, ptrX = -1, ptrY = -1;
    if (typeof PAD !== 'undefined' && PAD.pointer && PAD.pointer.down) {
      pointerHeld = true;
      ptrX = PAD.pointer.x;
      ptrY = PAD.pointer.y;
    } else if (typeof TOUCH !== 'undefined' && TOUCH && TOUCH.down) {
      pointerHeld = true;
      ptrX = TOUCH.x;
      ptrY = TOUCH.y;
    }

    // Swipe gestures
    const swipe = (typeof PAD !== 'undefined' ? PAD.swipe : null) || (typeof TOUCH !== 'undefined' ? TOUCH.swipe : null);
    if (swipe === 'left') {
      this.triggerRoll(-1);
    } else if (swipe === 'right') {
      this.triggerRoll(1);
    }

    // 1. Guard Button / Stance
    // Keyboard [Down] or Touch [GUARD] zone (x: 8..54, y: 212..236)
    const isGuardTouchHeld = (pointerHeld && ptrX >= 8 && ptrX <= 54 && ptrY >= 210);
    const isGuardTap = (tapX >= 8 && tapX <= 54 && tapY >= 210);
    if (PAD.held('down') || isGuardTouchHeld || isGuardTap) {
      if (p.state !== 'ROLL' && p.state !== 'HURT' && p.state !== 'STAGGERED' && p.state !== 'ATTACK') {
        p.guarding = true;
        p.state = 'GUARD';
      }
    } else {
      p.guarding = false;
      if (p.state === 'GUARD') p.state = 'IDLE';
    }

    // 2. Roll Dodge Button [B]
    // Keyboard/Gamepad [B] or Touch [ROLL] zone (x: 58..104, y: 212..236)
    if (PAD.hit('b') || (tapX >= 58 && tapX <= 104 && tapY >= 210)) {
      this.triggerRoll(0);
    }

    // 3. Parry / Deflect Button
    // Touch [PARRY] zone (x: 152..198, y: 212..236)
    if (tapX >= 152 && tapX <= 198 && tapY >= 210) {
      this.triggerParry();
    }

    // 4. Strike / Attack Button [A]
    // Keyboard/Gamepad [A] or Touch [SLASH] zone (x: 202..248, y: 212..236)
    // Or tap in upper arena near boss (tapX > 120 && tapY < 205)
    if (PAD.hit('a') || (tapX >= 202 && tapX <= 248 && tapY >= 210) || (tapX > 120 && tapY >= 50 && tapY < 205)) {
      // If boss is actively winding up in parry window, pressing [A] automatically performs deflect!
      const b = this.boss;
      let inParryZone = false;
      if (b.state === 'WINDUP') {
        const timeLeft = b.windupDuration - b.moveTimer;
        if (timeLeft <= (this.getDiffSettings().parryWindow + 0.05) && !b.isPerilous) {
          inParryZone = true;
        }
      }

      if (inParryZone) {
        this.triggerParry();
      } else {
        this.triggerAttack();
      }
    }

    // 5. Spacing Movement: [Left] / [Right]
    if (p.state === 'IDLE' || p.state === 'MOVE') {
      let moveDir = 0;
      if (PAD.held('left')) moveDir -= 1;
      if (PAD.held('right')) moveDir += 1;

      if (moveDir !== 0) {
        p.vx = moveDir * 75;
        p.state = 'MOVE';
      } else {
        p.vx = 0;
        p.state = 'IDLE';
      }
    }
  },

  updatePlayer(dt) {
    const p = this.player;
    const diff = this.getDiffSettings();

    // Invulnerability frames decay
    if (p.iFrames > 0) p.iFrames = Math.max(0, p.iFrames - dt);

    // Parry window timer decay
    if (p.parryWindowTimer > 0) p.parryWindowTimer = Math.max(0, p.parryWindowTimer - dt);

    // Combo reset timer decay
    if (p.comboResetTimer > 0) {
      p.comboResetTimer -= dt;
      if (p.comboResetTimer <= 0) p.comboStep = 0;
    }

    // State Timer updates (Roll, Attack, Parry, Hurt, Staggered)
    if (p.state === 'ROLL') {
      p.stateTimer -= dt;
      p.x += p.vx * dt;
      p.vx *= 0.94; // Friction
      if (p.stateTimer <= 0) {
        p.state = 'IDLE';
        p.vx = 0;
      }
    } else if (p.state === 'ATTACK') {
      p.stateTimer -= dt;
      if (p.stateTimer <= 0) {
        p.state = 'IDLE';
      }
    } else if (p.state === 'PARRY') {
      p.stateTimer -= dt;
      if (p.stateTimer <= 0) {
        p.state = 'IDLE';
      }
    } else if (p.state === 'HURT') {
      p.stateTimer -= dt;
      p.x += p.vx * dt;
      p.vx *= 0.90;
      if (p.stateTimer <= 0) {
        p.state = 'IDLE';
        p.vx = 0;
      }
    } else if (p.state === 'STAGGERED') {
      p.stateTimer -= dt;
      if (p.stateTimer <= 0) {
        p.state = 'IDLE';
      }
    } else if (p.state === 'MOVE') {
      p.x += p.vx * dt;
    }

    // Clamp Player Arena bounds (keeps duel strictly in frame)
    p.x = Math.max(34, Math.min(148, p.x));

    // Stamina Natural Recovery
    if (p.staminaDelay > 0) {
      p.staminaDelay -= dt;
    } else {
      let regenRate = diff.staminaRegen;
      if (p.guarding) regenRate *= 0.35; // Slower while guarding
      if (p.state === 'ROLL' || p.state === 'ATTACK') regenRate = 0;
      p.stamina = Math.min(p.maxStamina, p.stamina + regenRate * dt);
    }
  },

  // --------------------------------------------------------------------------
  // 9. PARTICLES & FLOATING COMBAT TEXTS
  // --------------------------------------------------------------------------
  spawnClangSparks(x, y) {
    for (let i = 0; i < 14; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 50 + Math.random() * 90;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.2 + Math.random() * 0.25,
        maxLife: 0.45,
        type: 'spark',
        c: 3
      });
    }
  },

  spawnShockwave(x, y) {
    // Expanding ground shockwave lines
    this.particles.push({ x: x, y: y, vx: -160, vy: 0, life: 0.4, maxLife: 0.4, type: 'shockwave', c: 3 });
    this.particles.push({ x: x, y: y, vx: 160, vy: 0, life: 0.4, maxLife: 0.4, type: 'shockwave', c: 3 });

    // Impact debris
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y - 2,
        vx: (Math.random() - 0.5) * 80,
        vy: -40 - Math.random() * 60,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.6,
        type: 'dust',
        c: 2
      });
    }
  },

  addFloatText(str, x, y, c = 3) {
    this.floatTexts.push({
      str: str,
      x: x,
      y: y,
      vy: -18,
      life: 0.85,
      c: c
    });
  },

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;

      if (pt.type === 'spark') {
        pt.vy += 120 * dt; // Gravity
        if (pt.y >= this.groundY) {
          pt.y = this.groundY;
          pt.vy = -pt.vy * 0.4;
        }
      } else if (pt.type === 'dust') {
        pt.vx *= 0.92;
        pt.vy *= 0.92;
      } else if (pt.type === 'ember') {
        pt.x += Math.sin(this.time * 4 + pt.y * 0.1) * 6 * dt;
      }
    }
  },

  updateFloatTexts(dt) {
    for (let i = this.floatTexts.length - 1; i >= 0; i--) {
      const ft = this.floatTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * dt;
      ft.vy *= 0.94;
    }
  },

  // --------------------------------------------------------------------------
  // 10. RENDERING ENGINE: ATMOSPHERE, SPRITES, HUD, & OVERLAYS
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    const ox = this.shakeX;
    const oy = this.shakeY;

    // 1. Temple Sanctuary Background & Stone Architecture
    this.renderSanctuaryBackground(g, ox, oy);

    // 2. Boss Titan Sprite
    this.renderBoss(g, ox, oy);

    // 3. Player Knight Sprite
    this.renderPlayer(g, ox, oy);

    // 4. Ground Sparks, Dust & Shockwaves
    this.renderParticles(g, ox, oy);

    // 5. Floating Alerts & Combat Numbers
    this.renderFloatTexts(g, ox, oy);

    // 6. Tactical HUD: Boss HP/Posture & Player HP/Stamina
    this.renderHUD(g);

    // 7. On-Screen Ergonomic Touch Controls
    this.renderTouchControls(g);

    // 8. Cutscene Overlays (Intro, Victory, Defeat)
    if (this.state === 'INTRO') {
      this.renderIntroOverlay(g);
    } else if (this.state === 'VICTORY') {
      this.renderVictoryOverlay(g);
    } else if (this.state === 'DEFEAT') {
      this.renderDefeatOverlay(g);
    }
  },

  renderSanctuaryBackground(g, ox, oy) {
    // Gothic Arches & Vaulted Ceilings (y: 0..70)
    g.dither(0, 0, 256, 40, 0, 1);

    // Far Wall Archway Columns
    const cols = [18, 70, 128, 186, 238];
    for (let i = 0; i < cols.length; i++) {
      const cx = cols[i] + ox;
      g.rect(cx - 3, 20 + oy, 6, 166, 1);
      g.line(cx - 4, 20 + oy, cx + 3, 20 + oy, 2); // Capital
      g.px(cx - 4, 19 + oy, 2);
      g.px(cx + 3, 19 + oy, 2);
      // Gothic arch ribs
      if (i < cols.length - 1) {
        const nextX = cols[i + 1] + ox;
        const midX = Math.floor((cx + nextX) / 2);
        g.line(cx, 20 + oy, midX, 6 + oy, 1);
        g.line(midX, 6 + oy, nextX, 20 + oy, 1);
      }
    }

    // Braziers / Wall Torches (Flanking pillars)
    const torches = [44, 212];
    for (let i = 0; i < torches.length; i++) {
      const tx = torches[i] + ox;
      const ty = 96 + oy;
      // Sconce bracket
      g.rect(tx - 2, ty, 5, 6, 2);
      g.line(tx, ty + 6, tx, ty + 12, 1);
      // Flickering flame
      const flk = Math.floor(Math.sin(this.time * 12 + i * 2) * 2);
      g.disc(tx, ty - 3 + flk, 3, 3);
      g.px(tx, ty - 6 + flk, 2);
    }

    // Stone Arena Ground Flagstones (y = 186)
    g.rect(0, this.groundY + oy, 256, 54, 1);
    g.line(0, this.groundY + oy, 256, this.groundY + oy, 2); // Ground threshold

    // Perspective floor paving lines
    for (let x = 0; x < 256; x += 32) {
      g.line(x + ox, this.groundY + oy, x - 18 + ox, 240, 0);
    }
    g.line(0, this.groundY + 14 + oy, 256, this.groundY + 14 + oy, 0);
    g.line(0, this.groundY + 28 + oy, 256, this.groundY + 28 + oy, 0);
  },

  // --------------------------------------------------------------------------
  // 11. PLAYER KNIGHT SPRITE RENDERING
  // --------------------------------------------------------------------------
  renderPlayer(g, ox, oy) {
    const p = this.player;
    let px = Math.floor(p.x) + ox;
    let py = Math.floor(p.y) + oy;

    const isRolling = (p.state === 'ROLL');
    const isAttacking = (p.state === 'ATTACK');
    const isParrying = (p.state === 'PARRY');
    const isGuarding = (p.state === 'GUARD');
    const isHurt = (p.state === 'HURT');

    // 1. Ghost Afterimage Trail during roll
    if (isRolling) {
      const ghostX = px - Math.sign(p.vx) * 8;
      g.disc(ghostX + 8, py + 14, 6, 1);
    }

    // 2. Rolling Animation (Dynamic Rotating Ball)
    if (isRolling) {
      g.disc(px + 8, py + 16, 8, 2);
      g.circle(px + 8, py + 16, 8, 3);
      // Spinning blade sparkle
      const rot = (p.stateTimer / 0.42) * Math.PI * 4;
      const sx = px + 8 + Math.floor(Math.cos(rot) * 9);
      const sy = py + 16 + Math.floor(Math.sin(rot) * 9);
      g.px(sx, sy, 3);
      return;
    }

    // Bobbing for idle / move
    let bob = 0;
    if (p.state === 'MOVE') {
      bob = Math.floor(Math.sin(this.time * 16) * 1.5);
    } else if (p.state === 'IDLE') {
      bob = Math.floor(Math.sin(this.time * 5) * 0.8);
    }
    py += bob;

    // Hit Stun Flash
    const bodyColor = (isHurt && Math.floor(this.time * 24) % 2 === 0) ? 3 : 2;

    // Boots & Greaves (Ground y = 186)
    g.rect(px + 3, py + 20, 4, 6, bodyColor);
    g.rect(px + 9, py + 20, 4, 6, bodyColor);

    // Surcoat & Plated Tassets
    g.rect(px + 2, py + 13, 12, 7, 1);
    g.line(px + 2, py + 15, px + 13, py + 15, bodyColor); // Belt
    g.px(px + 7, py + 15, 3); // Belt buckle

    // Steel Cuirass (Breastplate)
    g.rect(px + 3, py + 6, 10, 7, bodyColor);
    g.line(px + 4, py + 7, px + 11, py + 7, 3); // Breastplate ridge shine

    // Armored Bascinet Helmet & Plume
    g.rect(px + 4, py - 1, 8, 7, bodyColor);
    g.line(px + 6, py + 2, px + 10, py + 2, 0); // Visor eye slit
    // Helmet Plume
    g.line(px + 3, py - 3, px + 7, py - 1, 3);
    g.px(px + 2, py - 3, 2);

    // Off-Hand Heater Shield / Buckler
    if (isGuarding) {
      // SHIELD RAISED IN GUARD
      g.rect(px + 10, py + 4, 5, 12, 3);
      g.box(px + 10, py + 4, 5, 12, 1);
      g.line(px + 11, py + 16, px + 13, py + 16, 2); // Shield point
    } else {
      // Shield at side
      g.rect(px, py + 7, 3, 9, bodyColor);
      g.line(px, py + 16, px + 1, py + 16, 1);
    }

    // Main Weapon (Longsword) Action Poses
    if (isParrying) {
      // PARRY DEFLECTION POSE: Angled blade held diagonally
      g.line(px + 7, py + 14, px + 21, py + 1, 3);
      g.line(px + 6, py + 15, px + 10, py + 13, bodyColor); // Crossguard
      g.px(px + 22, py, 3); // Blade tip glint
    } else if (isAttacking) {
      // ATTACK COMBO SLASH POSES
      if (p.comboStep === 0) { // Horizontal Slash
        g.line(px + 10, py + 8, px + 26, py + 12, 3);
        g.line(px + 12, py + 4, px + 28, py + 10, 2); // Motion arc
      } else if (p.comboStep === 1) { // Upward Slash
        g.line(px + 8, py + 16, px + 24, py + 2, 3);
        g.line(px + 10, py + 18, px + 26, py + 4, 2);
      } else { // Heavy Overhead Cleave
        g.line(px + 10, py - 2, px + 24, py + 20, 3);
        g.line(px + 8, py - 4, px + 22, py + 18, 2);
      }
    } else {
      // IDLE READY POSE
      g.line(px + 11, py + 10, px + 18, py + 2, 3);
      g.line(px + 10, py + 11, px + 13, py + 9, bodyColor);
    }
  },

  // --------------------------------------------------------------------------
  // 12. BOSS TITAN SPRITE RENDERING ("IRON SENTINEL / ABYSSAL KNIGHT")
  // --------------------------------------------------------------------------
  renderBoss(g, ox, oy) {
    const b = this.boss;
    let bx = Math.floor(b.x) + ox;
    let by = Math.floor(b.y) + oy + Math.floor(b.leapY);

    const isPhase2 = (b.phase === 2);
    const isWindingUp = (b.state === 'WINDUP');
    const isAttacking = (b.state === 'ATTACK');
    const isStaggered = (b.state === 'STAGGERED');
    const isDying = (b.state === 'DEATH');

    // Menacing Abyssal Aura in Phase 2
    if (isPhase2 && !isDying) {
      b.glowTimer += 0.05;
      const auraPulse = Math.sin(this.time * 8);
      if (auraPulse > 0.3) {
        g.circle(bx + 14, by + 18, 26, 1);
      }
    }

    // Perilous Kanji Flash & Danger Glyph
    if (b.isPerilous && isWindingUp) {
      const flash = (Math.floor(this.time * 16) % 2 === 0);
      const glyphColor = flash ? 3 : 2;
      g.textC("▲ DANGER! ▲", by - 16, glyphColor, 1);
      g.disc(bx + 14, by - 5, 4, glyphColor);
      g.line(bx + 14, by - 8, bx + 14, by - 4, 0); // Exclamation
      g.px(bx + 14, by - 2, 0);
    }

    // 1. Tattered Dark Cape billowing behind armor
    const capeWave = Math.floor(Math.sin(this.time * 4) * 3);
    g.rect(bx + 16, by + 10, 10 + capeWave, 36, 1);
    g.line(bx + 16, by + 46, bx + 27 + capeWave, by + 46, 0); // Torn tattered fringe

    // 2. Colossal Armored Legs & Sabatons
    if (isStaggered) {
      // Kneeling on one knee
      g.rect(bx + 4, by + 34, 10, 14, 2);
      g.rect(bx + 16, by + 40, 12, 8, 2);
    } else {
      // Firm wide combat stance
      g.rect(bx + 4, by + 30, 8, 18, 2);
      g.rect(bx + 16, by + 30, 8, 18, 2);
      g.rect(bx + 2, by + 44, 10, 4, 3); // Heavy sabaton boots
      g.rect(bx + 16, by + 44, 10, 4, 3);
    }

    // 3. Segmented Fauld & Plate Tassets
    g.rect(bx + 2, by + 22, 24, 10, 1);
    g.line(bx + 2, by + 24, bx + 25, by + 24, 2);
    g.line(bx + 7, by + 25, bx + 7, by + 32, 2);
    g.line(bx + 20, by + 25, bx + 20, by + 32, 2);

    // 4. Massive Iron Breastplate & Spiked Pauldrons
    g.rect(bx + 4, by + 10, 20, 14, 2);
    g.box(bx + 4, by + 10, 20, 14, 3);
    // Dark Rune engraving on chest
    g.line(bx + 10, by + 14, bx + 18, by + 14, isPhase2 ? 3 : 0);
    g.line(bx + 14, by + 12, bx + 14, by + 20, isPhase2 ? 3 : 0);

    // Spiked Pauldrons (Shoulders)
    g.rect(bx - 3, by + 8, 8, 8, 3);
    g.line(bx - 2, by + 7, bx + 2, by + 7, 3); // Left shoulder spike
    g.rect(bx + 23, by + 8, 8, 8, 3);
    g.line(bx + 25, by + 7, bx + 29, by + 7, 3); // Right shoulder spike

    // 5. Great Horned Helmet
    g.rect(bx + 8, by - 2, 12, 12, 2);
    g.box(bx + 8, by - 2, 12, 12, 3);
    // Curving Horns
    g.line(bx + 7, by + 2, bx + 2, by - 4, 3);
    g.line(bx + 2, by - 4, bx + 2, by - 7, 3);
    g.line(bx + 20, by + 2, bx + 25, by - 4, 3);
    g.line(bx + 25, by - 4, bx + 25, by - 7, 3);

    // Glowing Visor Slit
    const visorColor = isPhase2 ? 3 : (Math.floor(this.time * 8) % 2 === 0 ? 3 : 2);
    g.line(bx + 10, by + 3, bx + 17, by + 3, isStaggered ? 1 : visorColor);

    // 6. Colossal Greatsword Action Poses
    this.renderBossWeapon(g, bx, by, isPhase2, isWindingUp, isAttacking, isStaggered);

    // 7. Staggered Critical Reticle Indicator
    if (isStaggered) {
      const pulse = Math.floor(Math.sin(this.time * 14) * 3);
      const retX = bx + 14;
      const retY = by + 16;
      g.circle(retX, retY, 9 + pulse, 3);
      g.line(retX - 14, retY, retX + 14, retY, 3);
      g.line(retX, retY - 14, retX, retY + 14, 3);
      g.textC("RIPOSTE! [A]", by - 12, 3);
    }
  },

  renderBossWeapon(g, bx, by, isPhase2, isWindingUp, isAttacking, isStaggered) {
    const b = this.boss;
    const bladeColor = isPhase2 ? 3 : 2;

    if (isStaggered) {
      // Weapon dropped, resting tip-down in ground
      g.line(bx - 6, by + 24, bx - 14, this.groundY, bladeColor);
      g.line(bx - 5, by + 22, bx - 9, by + 20, 2); // Guard
      return;
    }

    if (isWindingUp) {
      if (b.moveName === 'OVERHEAD_SLAM') {
        // High 2-Handed Raise (Reaches high into sky)
        g.line(bx + 14, by + 6, bx + 14, by - 36, bladeColor);
        g.line(bx + 13, by + 6, bx + 13, by - 36, 3);
        g.line(bx + 9, by + 4, bx + 19, by + 4, 2); // Wide crossguard
        g.px(bx + 14, by - 37, 3); // Glint tip
      } else if (b.moveName === 'HORIZONTAL_SWEEP') {
        // Angled back over right shoulder
        g.line(bx + 20, by + 12, bx + 42, by - 8, bladeColor);
        g.line(bx + 21, by + 13, bx + 43, by - 7, 3);
      } else if (b.moveName === 'DOUBLE_THRUST' || b.moveName === 'PERILOUS_THRUST') {
        // Low chambered stabbing pose
        g.line(bx + 8, by + 18, bx + 32, by + 14, bladeColor);
      } else {
        // Neutral ready stance
        g.line(bx - 2, by + 16, bx - 16, by + 42, bladeColor);
      }
    } else if (isAttacking) {
      if (b.moveName === 'OVERHEAD_SLAM') {
        // Smashed into floor!
        g.line(bx - 8, by + 14, bx - 8, this.groundY + 2, 3);
        g.line(bx - 9, by + 14, bx - 9, this.groundY + 2, bladeColor);
        g.line(bx - 14, by + 12, bx - 2, by + 12, 2);
        // Floor Impact Cracks
        g.line(bx - 16, this.groundY, bx - 2, this.groundY, 3);
      } else if (b.moveName === 'HORIZONTAL_SWEEP') {
        // Sweeping slash arc across screen to the left
        g.line(bx + 14, by + 16, bx - 32, by + 16, 3);
        g.line(bx + 10, by + 12, bx - 28, by + 14, 2);
        g.line(bx + 10, by + 20, bx - 28, by + 18, 2);
      } else if (b.moveName === 'DOUBLE_THRUST' || b.moveName === 'PERILOUS_THRUST') {
        // Fully extended forward thrust!
        g.line(bx + 8, by + 18, bx - 28, by + 18, 3);
        g.line(bx + 6, by + 19, bx - 26, by + 19, bladeColor);
        g.px(bx - 29, by + 18, 3); // Piercing tip
      } else {
        g.line(bx - 4, by + 18, bx - 22, by + 32, bladeColor);
      }
    } else {
      // Idle combat stance: Two-handed grip at front
      g.line(bx + 4, by + 14, bx - 8, by + 44, bladeColor);
      g.line(bx + 3, by + 15, bx - 7, by + 45, 3);
      g.line(bx + 2, by + 18, bx + 8, by + 14, 2); // Crossguard
    }
  },

  // --------------------------------------------------------------------------
  // 13. PARTICLES & FLOATING COMBAT TEXTS
  // --------------------------------------------------------------------------
  renderParticles(g, ox, oy) {
    for (let i = 0; i < this.particles.length; i++) {
      const pt = this.particles[i];
      const px = Math.floor(pt.x) + ox;
      const py = Math.floor(pt.y) + oy;

      if (pt.type === 'spark') {
        g.px(px, py, pt.c);
        g.px(px - Math.floor(pt.vx * 0.02), py - Math.floor(pt.vy * 0.02), 2);
      } else if (pt.type === 'dust') {
        g.disc(px, py, 2, pt.c);
      } else if (pt.type === 'ember') {
        g.px(px, py, pt.c);
      } else if (pt.type === 'shockwave') {
        g.line(px - 6, py - 1, px + 6, py - 1, pt.c);
      }
    }
  },

  renderFloatTexts(g, ox, oy) {
    for (let i = 0; i < this.floatTexts.length; i++) {
      const ft = this.floatTexts[i];
      const fx = Math.floor(ft.x) + ox;
      const fy = Math.floor(ft.y) + oy;
      g.text(ft.str, fx, fy, ft.c);
    }
  },

  // --------------------------------------------------------------------------
  // 14. TACTICAL HUD: BOSS HP/POSTURE & PLAYER HP/STAMINA
  // --------------------------------------------------------------------------
  renderHUD(g) {
    const b = this.boss;
    const p = this.player;

    // --- TOP PANEL: BOSS HEALTH & POSTURE BARS ---
    // Boss Name & Phase Badge
    const bossLabel = b.name + (b.phase === 2 ? " [PHASE 2]" : "");
    g.text(bossLabel, 24, 8, 3);

    // Difficulty Indicator (Top Right)
    const diffNames = ['EASY', 'NORMAL', 'HARD'];
    g.textR(diffNames[this.getDifficulty()], 232, 8, 1);

    // 1. Boss HP Bar (x: 24, y: 16, w: 208, h: 6)
    g.box(23, 15, 210, 8, 1);
    const hpPct = Math.max(0, b.hp / b.maxHp);
    const dispHpPct = Math.max(0, b.displayHp / b.maxHp);
    const barW = 206;

    // Delayed Trailing Chip Damage Bar (Darker shade 1)
    if (dispHpPct > hpPct) {
      g.rect(25 + Math.floor(hpPct * barW), 17, Math.floor((dispHpPct - hpPct) * barW), 4, 1);
    }
    // Active Health Fill (Bright shade 3)
    if (hpPct > 0) {
      g.rect(25, 17, Math.floor(hpPct * barW), 4, 3);
    }

    // 2. Boss Posture / Stagger Bar (x: 48, y: 25, w: 160, h: 4)
    g.box(47, 24, 162, 5, 1);
    const postPct = Math.min(1.0, b.posture / b.maxPosture);
    if (postPct > 0) {
      const postColor = (b.state === 'STAGGERED' && Math.floor(this.time * 12) % 2 === 0) ? 3 : 2;
      g.rect(48, 25, Math.floor(postPct * 160), 3, postColor);
    }
    // Posture Stagger Warning indicator
    if (b.state === 'STAGGERED') {
      g.textC("★ POSTURE BROKEN ★", 31, 3);
    }

    // --- BOTTOM PANEL: PLAYER HEALTH & STAMINA ---
    // Player HP Bar (x: 12, y: 194, w: 76, h: 5)
    g.text("HP", 12, 186, 2);
    g.text(p.hp + "/100", 30, 186, 3);
    g.box(11, 193, 78, 6, 1);
    const pHealthPct = Math.max(0, p.hp / p.maxHp);
    if (pHealthPct > 0) {
      g.rect(12, 194, Math.floor(pHealthPct * 76), 4, 3);
    }

    // Player Stamina Bar (x: 12, y: 202, w: 76, h: 4)
    g.text("ST", 94, 186, 2);
    g.text(Math.floor(p.stamina) + "/100", 112, 186, p.stamina < 20 ? 1 : 2);
    g.box(93, 193, 54, 6, 1);
    const pStamPct = Math.max(0, p.stamina / p.maxStamina);
    if (pStamPct > 0) {
      const stamCol = (p.stamina < 20 && Math.floor(this.time * 8) % 2 === 0) ? 1 : 2;
      g.rect(94, 194, Math.floor(pStamPct * 52), 4, stamCol);
    }
  },

  // --------------------------------------------------------------------------
  // 15. ON-SCREEN ERGONOMIC TOUCH CONTROLS
  // --------------------------------------------------------------------------
  renderTouchControls(g) {
    const p = this.player;

    // LEFT TOUCH BUTTONS: [GUARD] & [ROLL]
    // 1. [GUARD] (x: 8..54, y: 212..234)
    const isGuarding = p.guarding;
    g.box(8, 212, 44, 22, isGuarding ? 3 : 1);
    g.textC("GUARD", 216, isGuarding ? 3 : 2);
    g.textC("[▼]", 224, isGuarding ? 3 : 1);

    // 2. [ROLL] (x: 58..104, y: 212..234)
    const isRolling = (p.state === 'ROLL');
    g.box(58, 212, 44, 22, isRolling ? 3 : 1);
    g.textC("ROLL", 216, isRolling ? 3 : 2);
    g.textC("[B]", 224, isRolling ? 3 : 1);

    // RIGHT TOUCH BUTTONS: [PARRY] & [SLASH]
    // 3. [PARRY] (x: 152..198, y: 212..234)
    const isParrying = (p.state === 'PARRY');
    g.box(152, 212, 44, 22, isParrying ? 3 : 1);
    g.textC("PARRY", 216, isParrying ? 3 : 2);
    g.textC("[A]", 224, isParrying ? 3 : 1);

    // 4. [SLASH] (x: 202..248, y: 212..234)
    const isSlashing = (p.state === 'ATTACK');
    g.box(202, 212, 44, 22, isSlashing ? 3 : 1);
    g.textC("SLASH", 216, isSlashing ? 3 : 2);
    g.textC("[A]", 224, isSlashing ? 3 : 1);
  },

  // --------------------------------------------------------------------------
  // 16. CUTSCENE OVERLAYS (INTRO, VICTORY, DEFEAT)
  // --------------------------------------------------------------------------
  renderIntroOverlay(g) {
    g.rect(20, 68, 216, 88, 0);
    g.box(20, 68, 216, 88, 2);
    g.box(22, 70, 212, 84, 1);

    g.textC("★ TITAN BOSS DUEL ★", 78, 3);
    g.textC("THE IRON SENTINEL", 92, 2);
    g.textC("PARRY [A] RIGHT BEFORE STRIKE LANDS", 108, 2);
    g.textC("DODGE ROLL [B] THROUGH PERILOUS HITS", 118, 2);
    g.textC("HOLD [▼] TO GUARD  |  SPACE TO WIN", 128, 1);

    const flash = (Math.floor(this.time * 4) % 2 === 0);
    g.textC("[A] / [START] BEGIN DUEL", 142, flash ? 3 : 2);
  },

  renderVictoryOverlay(g) {
    g.rect(24, 44, 208, 152, 0);
    g.box(24, 44, 208, 152, 3);
    g.box(26, 46, 204, 148, 1);

    g.textC("★ TITAN VANQUISHED! ★", 54, 3);
    g.textC("ABYSSAL KNIGHT DEFEATED", 68, 2);

    g.text("PERFECT PARRIES: " + this.stats.perfectParries, 38, 86, 2);
    g.text("GUARDS EXECUTED: " + this.stats.normalGuards, 38, 98, 2);
    g.text("VISCERAL RIPOSTES: " + this.stats.executions, 38, 110, 2);
    g.text("TIME: " + this.battleTime.toFixed(1) + "s", 38, 122, 2);

    // Final Score & Grade
    g.text("FINAL SCORE: " + this.stats.finalScore, 38, 138, 3);
    g.text("GRADE: [ " + this.stats.grade + " ]", 38, 150, 3);

    const flash = (Math.floor(this.time * 4) % 2 === 0);
    g.textC("PRESS [A] OR TOUCH TO RETRY", 176, flash ? 3 : 2);
  },

  renderDefeatOverlay(g) {
    g.rect(34, 64, 188, 110, 0);
    g.box(34, 64, 188, 110, 2);

    g.textC("YOU DIED", 78, 3);
    g.textC("ASHES SCATTER IN THE SANCTUM", 94, 2);

    g.text("BOSS HP REMAIN: " + Math.max(0, this.boss.hp) + "/" + this.boss.maxHp, 44, 114, 1);
    g.text("PARRIES LANDED: " + this.stats.perfectParries, 44, 126, 1);
    g.text("TIP: DODGE ROLL UNPARRYABLE DANGER!", 44, 140, 2);

    const flash = (Math.floor(this.time * 4) % 2 === 0);
    g.textC("PRESS [A] OR TOUCH TO RETRY", 158, flash ? 3 : 2);
  }
};
