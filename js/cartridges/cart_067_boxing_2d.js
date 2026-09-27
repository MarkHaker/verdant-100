// js/cartridges/cart_067_boxing_2d.js
// ============================================================================
// Cartridge #067: BOXING 2D
// Genre: Racing & Vehicles / Sports (6) | Punch-Out!! Style Arcade Boxing Duel
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[67] = {
  id: 67,
  name: "BOXING 2D",
  genre: 6,
  scoreLabel: "SCORE",
  desc: "PUNCH-OUT BOXING: [A] JAB, [UP+A] HOOK, DODGE/DUCK TELEGRAPHS, STAR PUNCH COUNTERS!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Two clashing boxing gloves inside ring ropes, sweat droplet burst
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Ring ropes
    g.line(x + 2, y + 8, x + 29, y + 8, 1);
    g.line(x + 2, y + 16, x + 29, y + 16, 1);
    g.line(x + 2, y + 24, x + 29, y + 24, 1);

    // Player Boxing Glove (Left, Bright phosphor)
    g.disc(x + 11, y + 15, 6, 3);
    g.rect(x + 6, y + 16, 5, 5, 2); // wrist wrap
    g.line(x + 11, y + 10, x + 15, y + 14, 3); // thumb contour

    // Opponent Glove (Right, Dark green)
    g.disc(x + 21, y + 16, 6, 2);
    g.rect(x + 21, y + 17, 5, 5, 1);
    g.line(x + 17, y + 15, x + 21, y + 11, 2);

    // Impact Sweat Sparks
    g.px(x + 16, y + 10, 3);
    g.px(x + 15, y + 8, 2);
    g.px(x + 17, y + 9, 3);
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.bout = 1;
    this.maxBouts = 3;
    this.round = 1;
    this.roundTime = 90; // 90 seconds per round

    this.state = 'FIGHT'; // 'FIGHT', 'KNOCKDOWN', 'COUNT', 'VICTORY', 'DEFEAT'
    this.refCount = 0;
    this.refTimer = 0;
    this.knockedDown = null; // 'PLAYER' or 'CPU'

    // Player State
    this.player = {
      hp: 100,
      maxHp: 100,
      hearts: 20, // Stamina
      maxHearts: 20,
      stars: 1, // Special Star Uppercut
      state: 'IDLE', // 'IDLE', 'JAB', 'HOOK', 'BODY', 'DODGE_L', 'DODGE_R', 'DUCK', 'GUARD', 'HURT'
      stateTimer: 0,
      x: 128,
      y: 175
    };

    // Opponent Roster
    this.opponents = [
      { name: "KID GREEN", hp: 120, maxHp: 120, speed: 1.0, power: 12, telegraphTime: 0.65 },
      { name: "IRON BRUISER", hp: 160, maxHp: 160, speed: 1.25, power: 18, telegraphTime: 0.50 },
      { name: "PHANTOM MACH", hp: 200, maxHp: 200, speed: 1.5, power: 24, telegraphTime: 0.38 }
    ];

    this.loadOpponent(0);
  },

  loadOpponent(idx) {
    const opp = this.opponents[idx];
    this.cpu = {
      name: opp.name,
      hp: opp.hp,
      maxHp: opp.maxHp,
      speed: opp.speed,
      power: opp.power,
      telegraphTime: opp.telegraphTime,
      state: 'IDLE', // 'IDLE', 'WINDUP_HOOK', 'WINDUP_JAB', 'WINDUP_UPPER', 'ATTACK', 'GUARD', 'HURT', 'STUNNED', 'DOWN'
      stateTimer: 0,
      cooldown: 1.2,
      punchType: 'HOOK',
      guarding: false,
      flash: false,
      x: 128,
      y: 110
    };
  },

  // --------------------------------------------------------------------------
  // 3. MAIN GAMEPLAY UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    if (dt > 0.05) dt = 0.05;

    // Handle Victory / Defeat restart
    if (this.state === 'VICTORY' || this.state === 'DEFEAT') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || TOUCH.down) {
        this.init();
      }
      return;
    }

    // Referee 10-count countdown
    if (this.state === 'COUNT') {
      this.refTimer -= dt;
      if (this.refTimer <= 0) {
        this.refTimer = 1.0;
        this.refCount++;
        APU.sfx('TICK');

        if (this.knockedDown === 'CPU') {
          // Opponent recovery roll
          if (this.refCount >= 10 || Math.random() < 0.25 * (10 - this.refCount)) {
            if (this.refCount >= 10) {
              // KO Victory!
              if (this.bout < this.maxBouts) {
                this.bout++;
                this.loadOpponent(this.bout - 1);
                this.state = 'FIGHT';
                APU.sfx('FANFARE');
              } else {
                this.state = 'VICTORY';
                APU.sfx('POWERUP');
                SAVE.setScore(this.id, 5000 + Math.floor(this.player.hp * 30));
              }
            } else {
              // Opponent gets back up!
              this.cpu.state = 'IDLE';
              this.cpu.hp = Math.floor(this.cpu.maxHp * 0.4);
              this.state = 'FIGHT';
            }
          }
        } else {
          // Player recovery on mash [A]
          if (this.refCount >= 10) {
            this.state = 'DEFEAT';
            APU.sfx('ERROR');
            SAVE.setScore(this.id, this.bout * 1000);
          }
        }
      }

      // Player mashing [A] to stand up from canvas
      if (this.knockedDown === 'PLAYER' && PAD.hit('a')) {
        this.player.hp += 6;
        if (this.player.hp >= 35) {
          this.player.state = 'IDLE';
          this.state = 'FIGHT';
          APU.sfx('CONFIRM');
        }
      }
      return;
    }

    // Round timer
    this.roundTime -= dt;
    if (this.roundTime <= 0) {
      // Decision / round end
      if (this.player.hp >= this.cpu.hp) {
        if (this.bout < this.maxBouts) {
          this.bout++;
          this.loadOpponent(this.bout - 1);
          this.roundTime = 90;
          APU.sfx('FANFARE');
        } else {
          this.state = 'VICTORY';
        }
      } else {
        this.state = 'DEFEAT';
      }
      return;
    }

    // 1. UPDATE PLAYER STATE & ACTIONS
    const p = this.player;
    if (p.stateTimer > 0) {
      p.stateTimer -= dt;
      if (p.stateTimer <= 0) {
        p.state = 'IDLE';
      }
    }

    // Player inputs when idle
    if (p.state === 'IDLE') {
      // Defensive maneuvers
      if (PAD.state.left) {
        p.state = 'DODGE_L';
        p.stateTimer = 0.35;
      } else if (PAD.state.right) {
        p.state = 'DODGE_R';
        p.stateTimer = 0.35;
      } else if (PAD.state.down && !PAD.state.a) {
        p.state = 'DUCK';
        p.stateTimer = 0.32;
      } else if (PAD.state.b) {
        p.state = 'GUARD';
        p.stateTimer = 0.15;
      }

      // Offensive punches [A]
      if (PAD.hit('a')) {
        if (p.hearts > 0) {
          p.hearts = Math.max(0, p.hearts - 1);

          if (PAD.state.up) {
            p.state = 'HOOK';
            p.stateTimer = 0.28;
            this.tryPlayerPunch('HOOK', 16);
          } else if (PAD.state.down) {
            p.state = 'BODY';
            p.stateTimer = 0.26;
            this.tryPlayerPunch('BODY', 12);
          } else {
            p.state = 'JAB';
            p.stateTimer = 0.22;
            this.tryPlayerPunch('JAB', 10);
          }
        } else {
          APU.sfx('ERROR'); // Exhausted gasping
        }
      }

      // Special Star Punch [Start] or tap star
      if ((PAD.hit('start') || (TOUCH.down && TOUCH.y < 50)) && p.stars > 0) {
        p.stars--;
        p.state = 'HOOK';
        p.stateTimer = 0.40;
        this.tryPlayerPunch('STAR', 45);
        APU.sfx('FANFARE');
      }
    }

    // Natural heart/stamina recovery when idle
    if (p.state === 'IDLE' && p.hearts < p.maxHearts) {
      p.hearts = Math.min(p.maxHearts, p.hearts + 2.5 * dt);
    }

    // 2. UPDATE OPPONENT AI
    const c = this.cpu;
    if (c.stateTimer > 0) {
      c.stateTimer -= dt;
      if (c.stateTimer <= 0) {
        if (c.state.startsWith('WINDUP')) {
          // Windup complete: unleash strike!
          c.state = 'ATTACK';
          c.stateTimer = 0.25;
          this.executeCpuAttack();
        } else {
          c.state = 'IDLE';
          c.cooldown = 0.8 + Math.random() * 0.8;
        }
      }
    }

    // AI decisions when idle
    if (c.state === 'IDLE') {
      c.cooldown -= dt;
      if (c.cooldown <= 0) {
        // Choose attack windup
        const roll = Math.random();
        if (roll < 0.4) {
          c.state = 'WINDUP_HOOK';
          c.punchType = 'HOOK';
          c.stateTimer = c.telegraphTime;
          c.flash = true;
          APU.sfx('TICK');
        } else if (roll < 0.75) {
          c.state = 'WINDUP_JAB';
          c.punchType = 'JAB';
          c.stateTimer = c.telegraphTime * 0.8;
          c.flash = true;
          APU.sfx('TICK');
        } else {
          c.state = 'WINDUP_UPPER';
          c.punchType = 'UPPER';
          c.stateTimer = c.telegraphTime * 1.3;
          c.flash = true;
          APU.sfx('ALARM');
        }
      }
    }
  },

  tryPlayerPunch(type, dmg) {
    const c = this.cpu;
    const p = this.player;

    // Check if opponent is wide open during windup (COUNTER HIT!)
    if (c.state.startsWith('WINDUP')) {
      c.state = 'STUNNED';
      c.stateTimer = 0.65;
      c.hp -= Math.floor(dmg * 1.5);
      p.stars = Math.min(3, p.stars + 1); // Reward star!
      p.hearts = Math.min(p.maxHearts, p.hearts + 4);
      APU.sfx('COIN');
      this.checkCpuKnockdown();
      return;
    }

    // Check opponent stunned
    if (c.state === 'STUNNED' || c.state === 'HURT') {
      c.hp -= dmg;
      c.stateTimer = 0.35;
      APU.sfx('HIT');
      this.checkCpuKnockdown();
      return;
    }

    // Normal guard check
    if (c.state === 'IDLE' && Math.random() < 0.35) {
      // Opponent blocks!
      APU.sfx('TICK');
    } else {
      c.state = 'HURT';
      c.stateTimer = 0.28;
      c.hp -= dmg;
      APU.sfx('HIT');
      this.checkCpuKnockdown();
    }
  },

  checkCpuKnockdown() {
    if (this.cpu.hp <= 0) {
      this.cpu.hp = 0;
      this.cpu.state = 'DOWN';
      this.state = 'COUNT';
      this.knockedDown = 'CPU';
      this.refCount = 1;
      this.refTimer = 1.0;
      APU.sfx('EXPLODE');
    }
  },

  executeCpuAttack() {
    const p = this.player;
    const c = this.cpu;

    // Check if player successfully dodged or ducked
    let evaded = false;
    if (c.punchType === 'HOOK' && (p.state === 'DODGE_L' || p.state === 'DUCK')) evaded = true;
    else if (c.punchType === 'JAB' && (p.state === 'DODGE_R' || p.state === 'DUCK')) evaded = true;
    else if (c.punchType === 'UPPER' && (p.state === 'DODGE_L' || p.state === 'DODGE_R')) evaded = true;

    if (evaded) {
      // Clean dodge! Opponent is vulnerable
      c.state = 'STUNNED';
      c.stateTimer = 0.55;
      APU.sfx('CONFIRM');
      return;
    }

    // Guarding reduces damage
    if (p.state === 'GUARD') {
      p.hp -= Math.floor(c.power * 0.3);
      p.hearts = Math.max(0, p.hearts - 3);
      APU.sfx('TICK');
    } else {
      // Clean hit on player
      p.hp -= c.power;
      p.state = 'HURT';
      p.stateTimer = 0.35;
      APU.sfx('BOOM');
    }

    if (p.hp <= 0) {
      p.hp = 0;
      p.state = 'DOWN';
      this.state = 'COUNT';
      this.knockedDown = 'PLAYER';
      this.refCount = 1;
      this.refTimer = 1.0;
      APU.sfx('EXPLODE');
    }
  },

  // --------------------------------------------------------------------------
  // 4. 256x240 CRT RENDERING
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    // 1. Boxing Ring Mat & Ropes
    g.rect(20, 50, 216, 160, 1);
    g.box(20, 50, 216, 160, 2);

    // Ropes across ring
    g.line(20, 80, 236, 80, 2);
    g.line(20, 120, 236, 120, 2);
    g.line(20, 160, 236, 160, 2);

    // Corner turnbuckle pads
    g.rect(16, 46, 10, 16, 3);
    g.rect(230, 46, 10, 16, 3);

    // 2. Render Opponent Boxer (Facing Camera)
    const c = this.cpu;
    const cx = c.x + (c.state === 'HURT' ? (Math.random() - 0.5) * 6 : 0);
    const cy = c.y;

    if (c.state !== 'DOWN') {
      // Boxer Body
      const bodyColor = (c.state.startsWith('WINDUP') && (Math.floor(this.roundTime * 12) % 2 === 0)) ? 3 : 2;
      g.rect(cx - 16, cy - 20, 32, 38, bodyColor);
      g.box(cx - 16, cy - 20, 32, 38, 3);

      // Head & Facial Expression
      g.disc(cx, cy - 32, 10, 3);
      g.px(cx - 3, cy - 34, 0); // eye L
      g.px(cx + 3, cy - 34, 0); // eye R
      g.line(cx - 4, cy - 27, cx + 4, cy - 27, 0); // mouth

      // Boxing Gloves
      if (c.state === 'WINDUP_HOOK') {
        g.disc(cx + 28, cy - 24, 9, 3); // Raised high right hook
        g.disc(cx - 18, cy - 4, 7, 2);
      } else if (c.state === 'WINDUP_JAB') {
        g.disc(cx - 24, cy - 18, 9, 3); // Cocked left jab
        g.disc(cx + 18, cy - 4, 7, 2);
      } else if (c.state === 'STUNNED') {
        g.disc(cx - 22, cy + 6, 7, 2); // Dropped guard
        g.disc(cx + 22, cy + 6, 7, 2);
        g.textC("★ DIZZY ★", cy - 48, 3);
      } else {
        // Standard guard stance
        g.disc(cx - 16, cy - 10, 8, 3);
        g.disc(cx + 16, cy - 10, 8, 3);
      }
    } else {
      // Knocked down on canvas
      g.rect(cx - 30, cy + 18, 60, 14, 1);
      g.disc(cx - 26, cy + 24, 7, 2);
    }

    // 3. Render Player Boxer (Foreground Back View)
    const p = this.player;
    let px = p.x;
    let py = p.y;
    if (p.state === 'DODGE_L') px -= 28;
    else if (p.state === 'DODGE_R') px += 28;
    else if (p.state === 'DUCK') py += 18;

    if (p.state !== 'DOWN') {
      // Wireframe muscular back silhouette
      g.rect(px - 20, py - 24, 40, 36, 0);
      g.box(px - 20, py - 24, 40, 36, 3);
      g.disc(px, py - 34, 11, 2); // Back of head

      // Player Gloves punching out
      if (p.state === 'JAB') {
        g.disc(px - 14, py - 46, 8, 3); // Left jab extended
        g.disc(px + 16, py - 16, 7, 2);
      } else if (p.state === 'HOOK') {
        g.disc(px + 18, py - 48, 9, 3); // Right hook extended
        g.disc(px - 16, py - 16, 7, 2);
      } else {
        // Idle rear guard
        g.disc(px - 18, py - 22, 7, 3);
        g.disc(px + 18, py - 22, 7, 3);
      }
    }

    // 4. Top HUD (Health Bars, Hearts, Stars, Clock)
    g.rect(0, 0, 256, 36, 0);
    g.line(0, 36, 256, 36, 2);

    // Player Health Bar (Left)
    g.text("YOU", 10, 8, 3);
    g.box(36, 8, 70, 7, 2);
    g.rect(37, 9, Math.floor((p.hp / p.maxHp) * 68), 5, 3);

    // Opponent Health Bar (Right)
    g.textR(c.name, 246, 8, 2);
    g.box(150, 8, 70, 7, 2);
    g.rect(151, 9, Math.floor((c.hp / c.maxHp) * 68), 5, 2);

    // Stamina Hearts
    g.text("♥ " + Math.floor(p.hearts), 36, 22, p.hearts < 5 ? 3 : 2);

    // Star Punches
    let starStr = "";
    for (let s = 0; s < p.stars; s++) starStr += "★";
    g.text(starStr || "--", 80, 22, 3);

    // Round Clock
    const sec = Math.ceil(this.roundTime);
    g.textC(Math.floor(sec / 60) + ":" + (sec % 60).toString().padStart(2, '0'), 22, 3);

    // 5. Bottom Controls Legend
    g.rect(0, 214, 256, 26, 0);
    g.line(0, 214, 256, 214, 2);
    g.textC("[A]: JAB/HOOK   LEFT/RIGHT: DODGE   DOWN: DUCK   [B]: BLOCK", 222, 2);

    // 6. Referee 10-Count Overlay
    if (this.state === 'COUNT') {
      g.dither(50, 80, 156, 60, 0, 1);
      g.box(50, 80, 156, 60, 3);
      g.textC("REFEREE COUNT:", 94, 2);
      g.textC(this.refCount.toString(), 110, 3);
      if (this.knockedDown === 'PLAYER') {
        g.textC("MASH [A] TO STAND UP!", 126, 3);
      }
    }

    // 7. Victory / Defeat Overlay
    if (this.state === 'VICTORY') {
      g.dither(25, 65, 206, 80, 0, 1);
      g.box(25, 65, 206, 80, 3);
      g.textC("★ WORLD BOXING CHAMPION! ★", 80, 3);
      g.textC("ALL 3 CONTENDERS DEFEATED BY KO!", 98, 2);
      g.textC("[A] DEFEND YOUR TITLE", 124, 3);
    } else if (this.state === 'DEFEAT') {
      g.dither(35, 75, 186, 70, 0, 1);
      g.box(35, 75, 186, 70, 3);
      g.textC("KNOCKOUT DEFEAT", 92, 3);
      g.textC("YOU HAVE BEEN COUNTED OUT", 108, 2);
      g.textC("[A] REMATCH", 126, 3);
    }
  }
};
