// js/cartridges/cart_056_tamagotchi.js
// ============================================================================
// Cartridge #056: TAMAGOTCHI (Virtual Phosphor Pet Engine Overhaul)
// ============================================================================
// Complete Tamagotchi simulation featuring real-time offline progression,
// multi-stage life cycle (Egg -> Baby -> Child -> Teen -> Adult -> Senior -> Angel),
// 8 classic action commands, interactive "Heading / Guess" mini-game, direct touch
// petting, animated CRT phosphor room, hygiene/sickness, and persistent save records.
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

(function() {
  'use strict';

  // --------------------------------------------------------------------------
  // SOUND EFFECTS & AUDIO HELPER
  // --------------------------------------------------------------------------
  function playSfx(name) {
    if (typeof APU === 'undefined' || !APU.sfx) return;
    const map = {
      'SELECT': 'UI_MOVE',
      'CONFIRM': 'UI_OK',
      'CANCEL': 'UI_BACK',
      'ERROR': 'DENY',
      'EXPLODE': 'BOOM',
      'FANFARE': 'LEVELUP',
      'POWERUP': 'POWER',
      'COIN': 'COIN',
      'HIT': 'HIT',
      'TICK': 'TICK',
      'ALARM': 'ALARM',
      'SPLASH': 'SPLASH',
      'SWISH': 'SWISH'
    };
    try {
      const target = map[name] || name;
      APU.sfx(target);
    } catch (_) {}
  }

  // --------------------------------------------------------------------------
  // PET CONSTANTS & EVOLUTION STAGES
  // --------------------------------------------------------------------------
  const STAGE = {
    EGG: 0,
    BABY: 1,
    CHILD: 2,
    TEEN: 3,
    ADULT: 4,
    SENIOR: 5,
    ANGEL: 6
  };

  const ADULT_SPECIES = [
    { name: 'MAMETCHI', title: 'SCHOLAR PET', desc: 'Genius breed raised with stellar discipline!' },
    { name: 'KUCHIPATCHI', title: 'FOODIE PET', desc: 'Relaxed, duck-billed foodie who loves snacks!' },
    { name: 'MASKTCHI', title: 'REBEL PET', desc: 'Secretive ninja pet with an independent streak!' }
  ];

  // 8 Classic Tamagotchi Menu Commands
  const MENU_ACTIONS = [
    { id: 0, label: 'FEED', desc: 'MEAL OR SNACK' },
    { id: 1, label: 'LIGHTS', desc: 'TOGGLE ROOM LIGHT' },
    { id: 2, label: 'PLAY', desc: 'GUESS DIRECTION GAME' },
    { id: 3, label: 'MEDICINE', desc: 'CURE SICKNESS' },
    { id: 4, label: 'CLEAN', desc: 'SHOWER AWAY POOP' },
    { id: 5, label: 'DISCIPLINE', desc: 'PRAISE OR SCOLD' },
    { id: 6, label: 'STATUS', desc: 'VITALS & RECORDS' },
    { id: 7, label: 'ATTENTION', desc: 'CARE ALARM CALL' }
  ];

  // --------------------------------------------------------------------------
  // CARTRIDGE DEFINITION
  // --------------------------------------------------------------------------
  CARTS[56] = {
    id: 56,
    name: "TAMAGOTCHI",
    genre: 5, // RPG / SIM
    scoreLabel: "DAYS",
    desc: "VIRTUAL PHOSPHOR PET: TICKS OFFLINE IN REAL TIME! FEED, CLEAN, AND PET.",

    // ------------------------------------------------------------------------
    // 1. RETRO 32x32 ICON: Egg-shaped Tamagotchi Keychain with Buttons & Face
    // ------------------------------------------------------------------------
    icon(g, x, y) {
      // Clear icon cell
      g.rect(x, y, 32, 32, 0);
      g.box(x, y, 32, 32, 2);

      // Keychain ring at top
      g.circle(x + 16, y + 4, 3, 2);
      g.px(x + 16, y + 2, 3);
      g.px(x + 16, y + 7, 2);

      // Tamagotchi egg casing (rounded oval)
      g.disc(x + 16, y + 18, 10, 1);
      g.disc(x + 16, y + 14, 8, 1);
      g.circle(x + 16, y + 18, 10, 2);
      g.circle(x + 16, y + 14, 8, 2);
      // Highlights on casing
      g.line(x + 10, y + 12, x + 12, y + 9, 3);

      // LCD Screen in center
      g.rect(x + 10, y + 11, 12, 10, 0);
      g.box(x + 10, y + 11, 12, 10, 3);

      // Mini digital pet inside LCD
      g.px(x + 13, y + 14, 3); // Left eye
      g.px(x + 18, y + 14, 3); // Right eye
      g.px(x + 12, y + 16, 2); // Blush
      g.px(x + 19, y + 16, 2); // Blush
      g.line(x + 14, y + 17, x + 17, y + 17, 3); // Smile

      // 3 classic rubber buttons at bottom
      g.disc(x + 11, y + 24, 1, 3); // A
      g.disc(x + 16, y + 25, 1, 3); // B
      g.disc(x + 21, y + 24, 1, 3); // C
    },

    // ------------------------------------------------------------------------
    // 2. INITIALIZATION
    // ------------------------------------------------------------------------
    init() {
      this.resetPet();

      // UI & Interaction State
      this.menuOpen = false;
      this.menuIndex = 0; // 0..7
      this.subMenu = null; // null, 'FEED', 'DISCIPLINE', 'STATUS', 'GAME'
      this.subIndex = 0;
      this.statusPage = 0; // 0: Profile, 1: Vitals, 2: Records

      // Animations & Transient Effects
      this.bannerText = "WELCOME TO TAMAGOTCHI!";
      this.bannerTimer = 3.0;
      this.particles = []; // Floating hearts, sparks, steam, water drops
      this.actionAnim = null; // Current ongoing cutscene: { type, timer, duration, data }
      this.speechBubble = null; // { text, timer }

      // Pet physics in room
      this.petX = 128;
      this.petY = 168;
      this.petVx = 0;
      this.petDir = 1; // 1 = right, -1 = left
      this.walkTimer = 0;
      this.frame = 0;
      this.animTime = 0;
      this.blinkTimer = 2.0;
      this.isBlinking = false;
      this.roomClockTime = 0;

      // Direct Touch Petting State
      this.petTouchCooldown = 0;
      this.lastPointerDown = false;

      // High Score retrieval
      this.highScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(56) : 0;
    },

    resetPet(gen = 1) {
      const now = Date.now();
      this.pet = {
        v: 2,
        born: now,
        generation: gen,
        ageSeconds: 0,
        hunger: 80,       // 0 to 100
        happy: 80,        // 0 to 100
        energy: 90,       // 0 to 100
        clean: 100,       // 0 to 100
        weight: 5,        // in oz
        discipline: 20,   // 0 to 100
        stage: STAGE.EGG,
        adultSpecies: 0,  // 0: Mametchi, 1: Kuchipatchi, 2: Masktchi
        poops: [],        // [{ x, y }]
        sick: false,
        sickTimer: 0,
        isSleeping: false,
        lights: true,     // true = ON, false = OFF
        careMistakes: 0,
        attentionAlarm: false,
        alarmTimer: 0,
        unattendedTimer: 0,
        consecutiveSnacks: 0,
        totalMeals: 0,
        totalSnacks: 0,
        totalCleaned: 0,
        miniWins: 0,
        miniGamesPlayed: 0,
        patsReceived: 0,
        lastTick: now
      };
    },

    // ------------------------------------------------------------------------
    // 3. PERSISTENCE: SAVE & LOAD WITH OFFLINE SIMULATION
    // ------------------------------------------------------------------------
    save() {
      this.pet.lastTick = Date.now();
      return JSON.parse(JSON.stringify(this.pet));
    },

    load(data) {
      if (!data) return;
      try {
        // Upgrade legacy v1 format or assign v2
        const now = Date.now();
        this.pet = Object.assign(this.pet, data);

        // Calculate real elapsed seconds since cartridge was last saved
        const elapsedSec = Math.max(0, (now - (this.pet.lastTick || now)) / 1000);
        this.pet.lastTick = now;

        if (elapsedSec > 5) {
          this.simulateOfflineProgression(elapsedSec);
          this.showBanner("WELCOME BACK! PET TICKED OFFLINE.");
        }
      } catch (err) {
        console.warn('Tamagotchi load warning:', err);
      }
    },

    simulateOfflineProgression(sec) {
      if (this.pet.stage === STAGE.ANGEL) return;

      const diff = this.getDifficultyMult();
      // Add to total age
      this.pet.ageSeconds += sec;

      // Hours elapsed
      const hours = sec / 3600;

      // Natural hunger & happiness decay
      const hungerDrop = Math.floor(hours * 12 * diff);
      const happyDrop = Math.floor(hours * 10 * diff);
      this.pet.hunger = Math.max(0, this.pet.hunger - hungerDrop);
      this.pet.happy = Math.max(0, this.pet.happy - happyDrop);

      // Sleep & Energy simulation
      if (this.pet.isSleeping || !this.pet.lights) {
        // Rested peacefully in the dark
        this.pet.energy = Math.min(100, this.pet.energy + Math.floor(hours * 35));
        if (this.pet.energy >= 95) {
          this.pet.isSleeping = false;
        }
      } else {
        // Lights were left on while sleeping, or pet was awake
        const energyDrop = Math.floor(hours * 15 * diff);
        this.pet.energy = Math.max(0, this.pet.energy - energyDrop);
        if (this.pet.energy < 15) {
          this.pet.isSleeping = true;
          // Stress penalty for lights left on
          this.pet.happy = Math.max(0, this.pet.happy - Math.floor(hours * 8));
        }
      }

      // Poop accumulation (1 poop every ~1.5 hours, max 4)
      const poopsToAdd = Math.min(4 - this.pet.poops.length, Math.floor((hours + 0.5) / 1.5));
      for (let i = 0; i < poopsToAdd; i++) {
        this.spawnPoop();
      }

      // Hygiene calculation
      this.pet.clean = Math.max(0, 100 - (this.pet.poops.length * 25));

      // Sickness check if left in squalor or starving
      if (this.pet.poops.length >= 3 || this.pet.hunger <= 0) {
        if (hours >= 1.5) {
          this.pet.sick = true;
        }
      }

      // Egg auto-hatch if loaded after egg phase
      if (this.pet.stage === STAGE.EGG && this.pet.ageSeconds >= 15) {
        this.pet.stage = STAGE.BABY;
      }

      // Check evolution
      this.checkEvolution();
    },

    getDifficultyMult() {
      const diff = (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : 1;
      if (diff === 0) return 0.70; // EASY
      if (diff === 2) return 1.40; // HARD
      return 1.00; // NORMAL
    },

    getDifficultyName() {
      const diff = (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : 1;
      return ['EASY', 'NORMAL', 'HARD'][diff] || 'NORMAL';
    },

    // ------------------------------------------------------------------------
    // 4. LIFECYCLE & EVOLUTION PROGRESSION
    // ------------------------------------------------------------------------
    checkEvolution() {
      const p = this.pet;
      if (p.stage === STAGE.ANGEL) return;

      const age = p.ageSeconds;

      // EGG -> BABY (happens after ~15s or tap)
      if (p.stage === STAGE.EGG && age >= 15) {
        this.triggerEvolution(STAGE.BABY, "EGG HATCHED INTO A BABY!");
        return;
      }

      // BABY -> CHILD (happens after ~90s of care)
      if (p.stage === STAGE.BABY && age >= 90) {
        this.triggerEvolution(STAGE.CHILD, "BABY GREW INTO A CHILD (MARUTCHI)!");
        return;
      }

      // CHILD -> TEEN (happens after ~240s)
      if (p.stage === STAGE.CHILD && age >= 240) {
        this.triggerEvolution(STAGE.TEEN, "CHILD GREW INTO A TEEN (TAMATCHI)!");
        return;
      }

      // TEEN -> ADULT (happens after ~500s)
      if (p.stage === STAGE.TEEN && age >= 500) {
        // Adult species selection based on care quality & discipline
        if (p.discipline >= 65 && p.careMistakes <= 2) {
          p.adultSpecies = 0; // Mametchi (Scholar)
        } else if (p.discipline >= 35 && p.careMistakes <= 5) {
          p.adultSpecies = 1; // Kuchipatchi (Foodie)
        } else {
          p.adultSpecies = 2; // Masktchi (Rebel)
        }
        const species = ADULT_SPECIES[p.adultSpecies];
        this.triggerEvolution(STAGE.ADULT, "EVOLVED INTO " + species.name + " (" + species.title + ")!");
        return;
      }

      // ADULT -> SENIOR (happens after surviving 1200s or 5+ game days)
      if (p.stage === STAGE.ADULT && age >= 1200) {
        this.triggerEvolution(STAGE.SENIOR, "PET BECAME A WISE SENIOR ELDER!");
        return;
      }

      // Health / Neglect check: If starving and sick for > 180s, pet becomes an Angel
      if (p.hunger <= 0 && p.sick && p.stage !== STAGE.EGG) {
        p.sickTimer += 0.05;
        if (p.sickTimer >= 180) {
          p.stage = STAGE.ANGEL;
          playSfx('EXPLODE');
          this.showBanner("PET DEPARTED AS A SWEET GUARDIAN ANGEL.");
          this.commitSaveAndScore();
        }
      } else {
        p.sickTimer = Math.max(0, p.sickTimer - 0.1);
      }
    },

    triggerEvolution(newStage, msg) {
      this.pet.stage = newStage;
      playSfx('FANFARE');
      this.showBanner(msg);
      // Spawn burst of sparkle particles around pet
      for (let i = 0; i < 24; i++) {
        const ang = (i / 24) * Math.PI * 2;
        const spd = 20 + Math.random() * 35;
        this.particles.push({
          x: this.petX,
          y: this.petY,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 10,
          life: 1.2,
          maxLife: 1.2,
          type: 'spark'
        });
      }
      this.commitSaveAndScore();
    },

    commitSaveAndScore() {
      // Calculate comprehensive score: Days * 100 + happiness + discipline + mini-game points
      const ageDays = Math.floor(this.pet.ageSeconds / 180); // 1 game day = 3 minutes of active play
      const score = (ageDays * 100) + Math.floor(this.pet.happy) + Math.floor(this.pet.discipline) + (this.pet.miniWins * 15);
      if (typeof SAVE !== 'undefined' && SAVE.setScore) {
        SAVE.setScore(56, score);
        if (SAVE.setPersistent) {
          SAVE.setPersistent(56, this.save());
        }
      }
      this.highScore = Math.max(this.highScore, score);
    },

    showBanner(txt) {
      this.bannerText = txt;
      this.bannerTimer = 3.2;
    },

    showSpeech(txt, dur = 2.5) {
      this.speechBubble = { text: txt, timer: dur };
    },

    spawnPoop() {
      if (this.pet.poops.length >= 4) return;
      // Scatter poops naturally across room floor
      const slots = [
        { x: 50, y: 174 },
        { x: 78, y: 182 },
        { x: 180, y: 176 },
        { x: 210, y: 182 }
      ];
      const slot = slots[this.pet.poops.length % slots.length];
      this.pet.poops.push({ x: slot.x, y: slot.y, steamTimer: Math.random() });
      playSfx('HIT');
      this.pet.clean = Math.max(0, 100 - (this.pet.poops.length * 25));
    },

    // ------------------------------------------------------------------------
    // 5. UPDATE LOOP: INPUTS, PHYSICS, SIMULATION & ANIMATION
    // ------------------------------------------------------------------------
    update(dt) {
      // Clamp dt against large frame-drops
      dt = Math.min(dt, 0.1);
      const diffMult = this.getDifficultyMult();

      // Clock & room ambient timers
      this.roomClockTime += dt;
      this.animTime += dt;
      this.frame = Math.floor(this.animTime * 3) % 2;

      // Banner timer
      if (this.bannerTimer > 0) this.bannerTimer -= dt;

      // Speech bubble timer
      if (this.speechBubble) {
        this.speechBubble.timer -= dt;
        if (this.speechBubble.timer <= 0) this.speechBubble = null;
      }

      // Natural pet aging & decay (real-time simulation active)
      if (this.pet.stage !== STAGE.ANGEL) {
        this.pet.ageSeconds += dt;

        // Egg stage wobbles & cracks automatically after 15s
        if (this.pet.stage === STAGE.EGG) {
          if (this.pet.ageSeconds >= 15) {
            this.triggerEvolution(STAGE.BABY, "EGG HATCHED INTO A BABY!");
          }
        } else {
          // Decay hunger (~1 pt every 6s scaled by difficulty)
          const hungerDecay = (1.0 / 6.0) * diffMult * dt;
          this.pet.hunger = Math.max(0, this.pet.hunger - hungerDecay);

          // Decay happiness (~1 pt every 7s)
          const happyDecay = (1.0 / 7.0) * diffMult * dt;
          this.pet.happy = Math.max(0, this.pet.happy - happyDecay);

          // Energy & Sleep
          if (this.pet.isSleeping) {
            if (!this.pet.lights) {
              // Restful sleep with lights off: +4 pt/s
              this.pet.energy = Math.min(100, this.pet.energy + 4.0 * dt);
              if (this.pet.energy >= 100) {
                this.pet.isSleeping = false;
                this.showSpeech("WIDE AWAKE! *YAWN*");
                playSfx('CONFIRM');
              }
            } else {
              // Restless sleep with lights on: slow recharge, stress
              this.pet.energy = Math.min(100, this.pet.energy + 1.2 * dt);
              this.pet.happy = Math.max(0, this.pet.happy - 1.0 * dt);
            }
          } else {
            // Awake: natural energy consumption
            const energyDecay = (1.0 / 12.0) * diffMult * dt;
            this.pet.energy = Math.max(0, this.pet.energy - energyDecay);
            // If completely exhausted, falls asleep automatically
            if (this.pet.energy <= 0) {
              this.pet.isSleeping = true;
              this.showSpeech("SO SLEEPY... ZZzz");
              playSfx('TICK');
            }
          }

          // Natural pooping cycle: poops periodically if hunger was satisfied
          if (this.pet.totalMeals > 0 && Math.random() < (0.003 * diffMult * dt)) {
            this.spawnPoop();
          }

          // Cleanliness depends on poops on floor
          this.pet.clean = Math.max(0, 100 - (this.pet.poops.length * 25));

          // Sickness risk from dirty environment
          if (this.pet.poops.length >= 3 && Math.random() < (0.02 * dt)) {
            if (!this.pet.sick) {
              this.pet.sick = true;
              playSfx('ERROR');
              this.showSpeech("ACHOO! I CAUGHT A COLD!");
            }
          }

          // Attention Alarm Check: triggers when pet needs urgent help
          const needsCare = (this.pet.hunger < 20 || this.pet.happy < 20 || this.pet.sick || this.pet.poops.length >= 3);
          if (needsCare && !this.pet.attentionAlarm) {
            this.pet.attentionAlarm = true;
            this.pet.alarmTimer = 0;
            this.pet.unattendedTimer = 0;
            playSfx('ALARM');
          } else if (!needsCare) {
            this.pet.attentionAlarm = false;
            this.pet.unattendedTimer = 0;
          }

          if (this.pet.attentionAlarm) {
            this.pet.alarmTimer += dt;
            if (this.pet.alarmTimer >= 2.0) {
              this.pet.alarmTimer = 0;
              playSfx('ALARM');
            }
            this.pet.unattendedTimer += dt;
            if (this.pet.unattendedTimer >= 35.0) {
              // Care mistake recorded for ignoring alarm!
              this.pet.careMistakes++;
              this.pet.unattendedTimer = 0;
              playSfx('ERROR');
            }
          }

          // Check evolution milestones
          this.checkEvolution();
        }
      }

      // Update active Cutscene / Action animation if playing
      if (this.actionAnim) {
        this.updateActionAnimation(dt);
        this.updateParticles(dt);
        return; // Pause normal menu input during cutscenes
      }

      // Update Pet Movement & Idle Behaviors
      this.updatePetMovement(dt);

      // Direct Touch Petting & Rubbing
      this.handleTouchPetting(dt);

      // Menu & Player Inputs
      this.handleInputs();

      // Update Particle System
      this.updateParticles(dt);

      // Periodically commit score
      if (Math.floor(this.pet.ageSeconds) % 30 === 0 && Math.floor(this.pet.ageSeconds) > 0) {
        this.commitSaveAndScore();
      }
    },

    updatePetMovement(dt) {
      if (this.pet.stage === STAGE.EGG || this.pet.isSleeping || this.pet.stage === STAGE.ANGEL) {
        this.petVx = 0;
        return;
      }

      this.walkTimer -= dt;
      if (this.walkTimer <= 0) {
        this.walkTimer = 1.5 + Math.random() * 2.5;
        // Randomly choose walk or stay idle
        const action = Math.random();
        if (action < 0.4) {
          this.petDir = 1;
          this.petVx = 16;
        } else if (action < 0.8) {
          this.petDir = -1;
          this.petVx = -16;
        } else {
          this.petVx = 0;
        }
      }

      // Move pet
      this.petX += this.petVx * dt;
      // Boundaries inside room
      if (this.petX < 60) {
        this.petX = 60;
        this.petDir = 1;
        this.petVx = 16;
      } else if (this.petX > 196) {
        this.petX = 196;
        this.petDir = -1;
        this.petVx = -16;
      }

      // Blinking eye timer
      this.blinkTimer -= dt;
      if (this.blinkTimer <= 0) {
        this.isBlinking = !this.isBlinking;
        this.blinkTimer = this.isBlinking ? 0.15 : (2.0 + Math.random() * 3.0);
      }
    },

    // ------------------------------------------------------------------------
    // 6. DIRECT TOUCH PETTING & ROOM INTERACTION
    // ------------------------------------------------------------------------
    handleTouchPetting(dt) {
      if (this.petTouchCooldown > 0) this.petTouchCooldown -= dt;

      // Check touch or pointer coordinates
      const pointer = (typeof PAD !== 'undefined' && PAD.pointer) ? PAD.pointer : null;
      const tapPos = (typeof PAD !== 'undefined' && PAD.tapPos) ? PAD.tapPos : null;
      const isDown = pointer ? pointer.down : false;

      const pX = tapPos ? tapPos.x : (pointer ? pointer.x : -1);
      const pY = tapPos ? tapPos.y : (pointer ? pointer.y : -1);

      if (pX >= 0 && pY >= 0 && (isDown || tapPos)) {
        // Direct tap on menu icons
        this.checkDirectIconTaps(pX, pY);

        // Pet bounding box
        const petRadius = (this.pet.stage === STAGE.ADULT || this.pet.stage === STAGE.SENIOR) ? 22 : 16;
        const dx = pX - this.petX;
        const dy = pY - (this.petY - 12);
        const dist = Math.hypot(dx, dy);

        if (dist <= petRadius + 10 && this.petTouchCooldown <= 0) {
          this.petTouchCooldown = 0.25;

          // Egg cracking on tap
          if (this.pet.stage === STAGE.EGG) {
            playSfx('HIT');
            this.pet.ageSeconds += 3.0; // Hasten egg hatch
            this.showSpeech("*CRACK!*");
            // Egg crack sparks
            for (let i = 0; i < 6; i++) {
              this.particles.push({
                x: this.petX, y: this.petY - 10,
                vx: (Math.random() - 0.5) * 40, vy: -Math.random() * 40,
                life: 0.5, maxLife: 0.5, type: 'spark'
              });
            }
            if (this.pet.ageSeconds >= 15) {
              this.triggerEvolution(STAGE.BABY, "EGG HATCHED INTO A BABY!");
            }
            return;
          }

          // Petting active pet!
          if (this.pet.stage !== STAGE.ANGEL && !this.pet.isSleeping) {
            this.pet.happy = Math.min(100, this.pet.happy + 2.0);
            this.pet.patsReceived++;
            playSfx('COIN');
            this.showSpeech("♥ *PURRR!* ♥", 1.2);

            // Floating love heart particle
            this.particles.push({
              x: this.petX + (Math.random() - 0.5) * 16,
              y: this.petY - 24,
              vx: (Math.random() - 0.5) * 15,
              vy: -25 - Math.random() * 20,
              life: 1.0,
              maxLife: 1.0,
              type: 'heart'
            });
          }
        }
      }
    },

    checkDirectIconTaps(x, y) {
      if (this.actionAnim) return;

      // Top row icons: 0..3 (Y: 6 to 30)
      if (y >= 6 && y <= 32) {
        for (let i = 0; i < 4; i++) {
          const ix = 18 + i * 56;
          if (x >= ix - 4 && x <= ix + 44) {
            this.menuIndex = i;
            this.executeAction(i);
            return;
          }
        }
      }

      // Bottom row icons: 4..7 (Y: 206 to 234)
      if (y >= 204 && y <= 236) {
        for (let i = 0; i < 4; i++) {
          const ix = 18 + i * 56;
          if (x >= ix - 4 && x <= ix + 44) {
            this.menuIndex = 4 + i;
            this.executeAction(4 + i);
            return;
          }
        }
      }
    },

    // ------------------------------------------------------------------------
    // 7. ACTION EXECUTION & SUB-MENUS
    // ------------------------------------------------------------------------
    handleInputs() {
      if (typeof PAD === 'undefined') return;

      // Angel / Rebirth prompt handling
      if (this.pet.stage === STAGE.ANGEL) {
        if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start')) {
          this.resetPet(this.pet.generation + 1);
          playSfx('FANFARE');
          this.showBanner("NEW EGG ARRIVED! GENERATION " + this.pet.generation);
        }
        return;
      }

      // Sub-menu modal navigation
      if (this.subMenu) {
        this.handleSubMenuInputs();
        return;
      }

      // D-Pad Menu Navigation
      if (PAD.hit('left')) {
        this.menuIndex = (this.menuIndex - 1 + 8) % 8;
        playSfx('SELECT');
      } else if (PAD.hit('right')) {
        this.menuIndex = (this.menuIndex + 1) % 8;
        playSfx('SELECT');
      } else if (PAD.hit('up') || PAD.hit('down')) {
        // Jump between top row (0..3) and bottom row (4..7)
        this.menuIndex = (this.menuIndex + 4) % 8;
        playSfx('SELECT');
      }

      // Action Confirmation
      if (PAD.hit('a')) {
        this.executeAction(this.menuIndex);
      }
    },

    handleSubMenuInputs() {
      // 1. FEED SUBMENU (Meal vs Snack)
      if (this.subMenu === 'FEED') {
        if (PAD.hit('left') || PAD.hit('right') || PAD.hit('up') || PAD.hit('down')) {
          this.subIndex = 1 - this.subIndex;
          playSfx('SELECT');
        }
        if (PAD.hit('a')) {
          if (this.subIndex === 0) {
            this.feedMeal();
          } else {
            this.feedSnack();
          }
          this.subMenu = null;
        } else if (PAD.hit('b')) {
          this.subMenu = null;
          playSfx('CANCEL');
        }
      }

      // 2. DISCIPLINE SUBMENU (Praise vs Scold)
      else if (this.subMenu === 'DISCIPLINE') {
        if (PAD.hit('left') || PAD.hit('right') || PAD.hit('up') || PAD.hit('down')) {
          this.subIndex = 1 - this.subIndex;
          playSfx('SELECT');
        }
        if (PAD.hit('a')) {
          if (this.subIndex === 0) {
            this.praisePet();
          } else {
            this.scoldPet();
          }
          this.subMenu = null;
        } else if (PAD.hit('b')) {
          this.subMenu = null;
          playSfx('CANCEL');
        }
      }

      // 3. STATUS SCREEN (Pages 0..2)
      else if (this.subMenu === 'STATUS') {
        if (PAD.hit('left')) {
          this.statusPage = (this.statusPage - 1 + 3) % 3;
          playSfx('SELECT');
        } else if (PAD.hit('right')) {
          this.statusPage = (this.statusPage + 1) % 3;
          playSfx('SELECT');
        } else if (PAD.hit('a') && this.statusPage === 0) {
          // Toggle difficulty in Page 0!
          if (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) {
            VOS.difficulty = (VOS.difficulty + 1) % 3;
            playSfx('CONFIRM');
            this.showBanner("DIFFICULTY SET TO: " + this.getDifficultyName());
          }
        } else if (PAD.hit('b') || PAD.hit('start')) {
          this.subMenu = null;
          playSfx('CANCEL');
        }
      }

      // 4. MINI-GAME: HEADING / GUESS DIRECTION
      else if (this.subMenu === 'GAME') {
        this.handleMiniGameInput();
      }
    },

    executeAction(idx) {
      if (this.actionAnim) return;
      if (this.pet.stage === STAGE.EGG) {
        this.showSpeech("STILL IN EGG! *TAP TO HATCH*", 1.8);
        playSfx('ERROR');
        return;
      }

      playSfx('CONFIRM');

      switch (idx) {
        case 0: // FEED
          if (this.pet.isSleeping) {
            this.showSpeech("SLEEPING! CANNOT EAT.", 1.5);
            playSfx('ERROR');
            return;
          }
          this.subMenu = 'FEED';
          this.subIndex = 0;
          break;

        case 1: // LIGHTS
          this.pet.lights = !this.pet.lights;
          if (!this.pet.lights) {
            this.showBanner("LIGHTS OFF! SWEET DREAMS.");
            if (this.pet.energy < 75) {
              this.pet.isSleeping = true;
            }
          } else {
            this.showBanner("LIGHTS ON! RISE AND SHINE.");
          }
          playSfx('CONFIRM');
          this.commitSaveAndScore();
          break;

        case 2: // PLAY MINI-GAME
          if (this.pet.isSleeping) {
            this.showSpeech("SLEEPING! CANNOT PLAY.", 1.5);
            playSfx('ERROR');
            return;
          }
          if (this.pet.sick) {
            this.showSpeech("TOO SICK TO PLAY! *COUGH*", 1.8);
            playSfx('ERROR');
            return;
          }
          this.startMiniGame();
          break;

        case 3: // MEDICINE
          this.giveMedicine();
          break;

        case 4: // CLEAN
          this.cleanRoom();
          break;

        case 5: // DISCIPLINE
          if (this.pet.isSleeping) {
            this.showSpeech("PET IS ASLEEP...", 1.5);
            playSfx('ERROR');
            return;
          }
          this.subMenu = 'DISCIPLINE';
          this.subIndex = 0;
          break;

        case 6: // STATUS
          this.subMenu = 'STATUS';
          this.statusPage = 0;
          break;

        case 7: // ATTENTION ALARM
          this.checkAttentionAlarm();
          break;
      }
    },

    // ------------------------------------------------------------------------
    // ACTION HANDLERS
    // ------------------------------------------------------------------------
    feedMeal() {
      if (this.pet.hunger >= 100) {
        this.showSpeech("NO MORE! I'M FULL! *BURP*", 2.0);
        playSfx('ERROR');
        return;
      }
      this.pet.hunger = Math.min(100, this.pet.hunger + 25);
      this.pet.weight += 1;
      this.pet.totalMeals++;
      this.pet.consecutiveSnacks = 0;

      // Start animated eating cutscene
      this.actionAnim = {
        type: 'FEED',
        foodType: 'MEAL',
        timer: 1.8,
        duration: 1.8
      };
      playSfx('HIT');
      this.commitSaveAndScore();
    },

    feedSnack() {
      this.pet.happy = Math.min(100, this.pet.happy + 15);
      this.pet.weight += 2;
      this.pet.totalSnacks++;
      this.pet.consecutiveSnacks++;

      // Cavities / stomach ache risk from excessive snacks!
      if (this.pet.consecutiveSnacks >= 4) {
        this.pet.sick = true;
        playSfx('ERROR');
        this.showSpeech("OUCH! TOOTH CAVITY / BELLYACHE!", 2.2);
      }

      this.actionAnim = {
        type: 'FEED',
        foodType: 'SNACK',
        timer: 1.8,
        duration: 1.8
      };
      playSfx('COIN');
      this.commitSaveAndScore();
    },

    giveMedicine() {
      if (!this.pet.sick) {
        this.showSpeech("NOT SICK! DOESN'T NEED PILL.", 1.8);
        playSfx('ERROR');
        return;
      }

      this.actionAnim = {
        type: 'MEDICINE',
        timer: 2.0,
        duration: 2.0
      };
      this.pet.sick = false;
      this.pet.sickTimer = 0;
      this.pet.clean = Math.min(100, this.pet.clean + 20);
      playSfx('POWERUP');
      this.showBanner("MEDICINE GIVEN! HEALTH RESTORED.");
      this.commitSaveAndScore();
    },

    cleanRoom() {
      this.actionAnim = {
        type: 'CLEAN',
        timer: 2.2,
        duration: 2.2
      };
      this.pet.totalCleaned += this.pet.poops.length;
      this.pet.poops = [];
      this.pet.clean = 100;
      playSfx('SPLASH');
      this.showBanner("BATH & FLUSH! ROOM IS SPARKLING.");
      this.commitSaveAndScore();
    },

    praisePet() {
      // Praise encourages happiness & slight discipline
      this.pet.happy = Math.min(100, this.pet.happy + 10);
      this.pet.discipline = Math.min(100, this.pet.discipline + 10);
      this.actionAnim = {
        type: 'PRAISE',
        timer: 1.5,
        duration: 1.5
      };
      playSfx('CONFIRM');
      this.showSpeech("♥ GOOD PET! ♥", 1.8);
      this.commitSaveAndScore();
    },

    scoldPet() {
      // Scolding: boosts discipline if pet was misbehaving/crying with full stats
      const isMischievous = (this.pet.hunger > 50 && this.pet.happy > 50 && !this.pet.sick);
      if (isMischievous) {
        this.pet.discipline = Math.min(100, this.pet.discipline + 25);
        this.showSpeech("DISCIPLINE LEARNED! +25%", 2.0);
        playSfx('CONFIRM');
      } else {
        // Unfair scolding when actually sick/hungry lowers happiness
        this.pet.happy = Math.max(0, this.pet.happy - 15);
        this.showSpeech("UNFAIR! I REALLY NEEDED HELP! ;(", 2.0);
        playSfx('ERROR');
      }
      this.actionAnim = {
        type: 'SCOLD',
        timer: 1.5,
        duration: 1.5
      };
      this.commitSaveAndScore();
    },

    checkAttentionAlarm() {
      let msg = "I AM FEELING WONDERFUL!";
      if (this.pet.hunger < 20) {
        msg = "FEED ME! I AM STARVING!";
      } else if (this.pet.sick) {
        msg = "MEDICINE! I FEEL TERRIBLE!";
      } else if (this.pet.poops.length >= 2) {
        msg = "STINKY! FLUSH THE ROOM PLEASE!";
      } else if (this.pet.happy < 20) {
        msg = "I AM LONELY! PLAY A GAME WITH ME!";
      } else if (this.pet.energy < 20) {
        msg = "TIRED! TURN OFF THE LIGHTS!";
      }
      this.showSpeech(msg, 3.0);
      this.pet.attentionAlarm = false;
      playSfx('CONFIRM');
    },

    // ------------------------------------------------------------------------
    // 8. MINI-GAME: "HEADING / GUESS DIRECTION"
    // ------------------------------------------------------------------------
    startMiniGame() {
      this.subMenu = 'GAME';
      this.miniGame = {
        round: 1,
        maxRounds: 5,
        score: 0,
        state: 'PROMPT', // 'PROMPT', 'REVEAL', 'RESULT'
        petChoice: 0,    // -1 = left, 1 = right
        playerChoice: 0,
        timer: 0,
        roundResult: null
      };
      this.showBanner("ROUND 1/5: GUESS DIRECTION! [◀] OR [▶]");
    },

    handleMiniGameInput() {
      const g = this.miniGame;
      if (!g) return;

      // Handle touch taps on on-screen arrows
      const tapPos = (typeof PAD !== 'undefined' && PAD.tapPos) ? PAD.tapPos : null;
      let touchedLeft = false;
      let touchedRight = false;
      if (tapPos && tapPos.y >= 130 && tapPos.y <= 190) {
        if (tapPos.x < 110) touchedLeft = true;
        else if (tapPos.x > 146) touchedRight = true;
      }

      if (g.state === 'PROMPT') {
        let chosen = 0;
        if (PAD.hit('left') || touchedLeft) chosen = -1;
        else if (PAD.hit('right') || touchedRight) chosen = 1;

        if (chosen !== 0) {
          g.playerChoice = chosen;
          // Pet chooses a direction (fair 50/50 with slight predictability)
          g.petChoice = Math.random() < 0.5 ? -1 : 1;
          g.state = 'REVEAL';
          g.timer = 1.2;

          if (g.playerChoice === g.petChoice) {
            g.score++;
            g.roundResult = 'WIN';
            playSfx('FANFARE');
          } else {
            g.roundResult = 'MISS';
            playSfx('ERROR');
          }
        } else if (PAD.hit('b')) {
          this.subMenu = null;
          playSfx('CANCEL');
        }
      } else if (g.state === 'REVEAL') {
        g.timer -= 0.03;
        if (g.timer <= 0) {
          if (g.round < g.maxRounds) {
            g.round++;
            g.state = 'PROMPT';
            g.roundResult = null;
          } else {
            // End of Game!
            g.state = 'RESULT';
            g.timer = 2.5;
            this.pet.miniGamesPlayed++;
            this.pet.weight = Math.max(5, this.pet.weight - 1); // Trim weight from exercise

            if (g.score >= 3) {
              // Victory!
              this.pet.miniWins++;
              this.pet.happy = Math.min(100, this.pet.happy + 25);
              playSfx('FANFARE');
              this.showBanner("VICTORY! " + g.score + "/5 WINS! +25 HAPPY!");
            } else {
              this.pet.happy = Math.min(100, this.pet.happy + 10);
              playSfx('CONFIRM');
              this.showBanner("GOOD TRY! " + g.score + "/5. +10 HAPPY.");
            }
            this.commitSaveAndScore();
          }
        }
      } else if (g.state === 'RESULT') {
        g.timer -= 0.03;
        if (g.timer <= 0 || PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || tapPos) {
          this.subMenu = null;
          this.miniGame = null;
          playSfx('CONFIRM');
        }
      }
    },

    // ------------------------------------------------------------------------
    // 9. ANIMATIONS & PARTICLES
    // ------------------------------------------------------------------------
    updateActionAnimation(dt) {
      const a = this.actionAnim;
      if (!a) return;

      a.timer -= dt;

      // Eating animation: spawn food bits
      if (a.type === 'FEED') {
        if (Math.random() < 0.3) {
          this.particles.push({
            x: this.petX + 16,
            y: this.petY - 8,
            vx: (Math.random() - 0.5) * 15,
            vy: -Math.random() * 15,
            life: 0.4,
            maxLife: 0.4,
            type: 'spark'
          });
        }
      }

      // Cleaning shower: water spray drops
      if (a.type === 'CLEAN') {
        for (let i = 0; i < 4; i++) {
          this.particles.push({
            x: 40 + Math.random() * 176,
            y: 40,
            vx: (Math.random() - 0.5) * 20,
            vy: 80 + Math.random() * 80,
            life: 0.9,
            maxLife: 0.9,
            type: 'bubble'
          });
        }
      }

      // Medicine sparkles
      if (a.type === 'MEDICINE') {
        if (Math.random() < 0.5) {
          this.particles.push({
            x: this.petX + (Math.random() - 0.5) * 20,
            y: this.petY - 10 + (Math.random() - 0.5) * 20,
            vx: 0,
            vy: -15,
            life: 0.6,
            maxLife: 0.6,
            type: 'spark'
          });
        }
      }

      if (a.timer <= 0) {
        this.actionAnim = null;
      }
    },

    updateParticles(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    },

    // ------------------------------------------------------------------------
    // 10. RENDERING ENGINE: ROOM, PHOSPHOR CRT SPRITES & UI
    // ------------------------------------------------------------------------
    render(g) {
      // Clear screen (0 = darkest CRT background)
      g.clear(0);

      // Room border frame
      g.box(4, 32, 248, 172, 2);
      g.box(5, 33, 246, 170, 1);

      // 1. Draw Room Interior
      this.renderRoom(g);

      // 2. Draw Poops on floor
      this.renderPoops(g);

      // 3. Draw Cutscenes / Food Props
      this.renderProps(g);

      // 4. Draw Animated Pet
      this.renderPet(g);

      // 5. Draw Particle Layer
      this.renderParticles(g);

      // 6. Draw Night / Dark Dim Overlay if lights OFF
      if (!this.pet.lights) {
        this.renderNightOverlay(g);
      }

      // 7. Draw Speech / Thought Bubbles
      if (this.speechBubble) {
        this.renderSpeechBubble(g, this.speechBubble.text);
      }

      // 8. Draw Top & Bottom Tamagotchi Action Bars
      this.renderActionBars(g);

      // 9. Draw Active Submenus / Overlays
      if (this.subMenu === 'FEED') {
        this.renderFeedMenu(g);
      } else if (this.subMenu === 'DISCIPLINE') {
        this.renderDisciplineMenu(g);
      } else if (this.subMenu === 'STATUS') {
        this.renderStatusScreen(g);
      } else if (this.subMenu === 'GAME') {
        this.renderMiniGame(g);
      }

      // 10. Draw Notification Banner
      if (this.bannerTimer > 0 && !this.subMenu) {
        this.renderBanner(g);
      }
    },

    renderRoom(g) {
      // Wall (Y: 34 to 134)
      g.rect(6, 34, 244, 100, 0);

      // Cute wallpaper stripes
      for (let x = 14; x < 246; x += 18) {
        g.line(x, 34, x, 134, 1);
      }

      // Room Window (X: 24, Y: 46, W: 42, H: 46)
      g.rect(24, 46, 42, 46, 0);
      g.box(24, 46, 42, 46, 2);
      g.line(45, 46, 45, 91, 2); // Cross vertical
      g.line(24, 68, 65, 68, 2); // Cross horizontal

      if (this.pet.lights) {
        // Sun & day clouds in window
        g.disc(35, 57, 5, 3); // Sun
        g.px(30, 57, 2); g.px(40, 57, 2); g.px(35, 52, 2); g.px(35, 62, 2);
        // Cloud
        g.disc(52, 60, 4, 2);
        g.disc(56, 61, 3, 2);
      } else {
        // Crescent Moon & twinkle stars in window
        g.disc(36, 56, 5, 3);
        g.disc(38, 54, 4, 0); // Moon cutout
        g.px(54, 53, 3); // Star 1
        g.px(50, 62, 2); // Star 2
        g.px(58, 64, 3); // Star 3
      }

      // Wall Clock (X: 200, Y: 56, R: 12)
      g.circle(200, 56, 12, 2);
      g.px(200, 56, 3); // Center pivot
      g.px(200, 48, 2); // 12 o'clock
      g.px(208, 56, 2); // 3 o'clock
      g.px(200, 64, 2); // 6 o'clock
      g.px(192, 56, 2); // 9 o'clock
      // Ticking hands
      const secAng = (this.roomClockTime * 6) * (Math.PI / 180);
      g.line(200, 56, 200 + Math.floor(Math.sin(secAng) * 7), 56 - Math.floor(Math.cos(secAng) * 7), 3);
      g.line(200, 56, 204, 56, 2); // Hour hand

      // Poster on the wall (X: 112, Y: 46, W: 32, H: 24)
      g.box(112, 46, 32, 24, 2);
      g.text("VERDANT", 116, 52, 3);
      g.text("CONSOLE", 116, 60, 2);

      // Floor Baseboard (Y: 134)
      g.line(6, 134, 249, 134, 3);
      g.line(6, 135, 249, 135, 2);

      // Checkered Floor (Y: 136 to 201)
      for (let y = 136; y < 202; y += 11) {
        g.line(6, y, 249, y, 1);
      }
      for (let x = 6; x < 250; x += 22) {
        g.line(x, 136, x, 201, 1);
      }

      // Comfy Oval Pet Rug in Center (X: 78 to 178, Y: 156 to 184)
      g.disc(128, 170, 36, 1);
      g.circle(128, 170, 36, 2);
      g.circle(128, 170, 34, 1);
    },

    renderPoops(g) {
      for (let i = 0; i < this.pet.poops.length; i++) {
        const p = this.pet.poops[i];
        // Classic coil poop sprite
        g.disc(p.x, p.y, 5, 2);
        g.disc(p.x, p.y - 3, 4, 3);
        g.disc(p.x, p.y - 6, 2, 2);
        g.px(p.x + 1, p.y - 8, 3); // Swirl tip
        g.px(p.x - 2, p.y - 2, 0); // Shadow indent
        g.px(p.x + 2, p.y - 4, 0);

        // Animated rising steam lines
        const steamY = p.y - 12 - (Math.floor(this.animTime * 4 + i) % 6);
        g.px(p.x - 2, steamY, 2);
        g.px(p.x + 2, steamY - 2, 2);
      }
    },

    renderProps(g) {
      if (!this.actionAnim) return;

      const a = this.actionAnim;
      if (a.type === 'FEED') {
        const fx = this.petX + 24 * this.petDir;
        const fy = this.petY - 4;

        if (a.foodType === 'MEAL') {
          // Rice ball (triangle with nori strip)
          g.tri(fx, fy - 10, fx - 7, fy + 2, fx + 7, fy + 2, 3);
          g.rect(fx - 3, fy - 2, 6, 4, 0); // Seaweed wrap
        } else {
          // Sweet Candy
          g.disc(fx, fy - 4, 5, 3);
          g.line(fx - 9, fy - 7, fx - 4, fy - 4, 2); // Wrapper twist left
          g.line(fx + 4, fy - 4, fx + 9, fy - 7, 2); // Wrapper twist right
        }
      } else if (a.type === 'MEDICINE') {
        // Syringe descending from top
        const sy = 100 + Math.floor((1 - a.timer / a.duration) * 30);
        const sx = this.petX + 16;
        g.rect(sx, sy, 6, 14, 2);
        g.box(sx, sy, 6, 14, 3);
        g.line(sx + 3, sy + 14, sx + 3, sy + 20, 3); // Needle
        g.line(sx + 1, sy - 4, sx + 5, sy - 4, 3); // Plunger
      } else if (a.type === 'CLEAN') {
        // Shower head at top spraying down
        const sx = 128;
        const sy = 50;
        g.disc(sx, sy, 8, 2);
        g.box(sx - 8, sy, 16, 4, 3);
        // Shower handle
        g.line(sx, sy - 8, sx + 20, sy - 20, 2);
      }
    },

    renderPet(g) {
      const px = Math.floor(this.petX);
      const py = Math.floor(this.petY);
      const f = this.frame;
      const stage = this.pet.stage;

      // Draw shadow underneath pet
      if (stage !== STAGE.ANGEL) {
        g.disc(px, py + 2, 12, 1);
      }

      // ---------------- STAGE 0: EGG ----------------
      if (stage === STAGE.EGG) {
        // Wobble left/right
        const wobble = Math.sin(this.animTime * 6) * 2;
        const ex = px + Math.floor(wobble);
        const ey = py - 12;

        g.disc(ex, ey + 4, 10, 3);
        g.disc(ex, ey - 2, 8, 3);
        g.circle(ex, ey + 4, 10, 2);
        g.circle(ex, ey - 2, 8, 2);

        // Egg decorative spots
        g.disc(ex - 3, ey, 2, 1);
        g.disc(ex + 4, ey + 4, 2, 1);
        g.disc(ex, ey - 5, 1, 1);

        // Progressive crack lines as hatch time nears
        if (this.pet.ageSeconds > 8) {
          g.line(ex - 2, ey - 4, ex + 2, ey - 1, 0);
          g.line(ex + 2, ey - 1, ex - 1, ey + 3, 0);
        }
        if (this.pet.ageSeconds > 12) {
          g.line(ex - 5, ey + 2, ex - 2, ey + 4, 0);
          g.line(ex + 3, ey - 2, ex + 6, ey - 4, 0);
        }
        return;
      }

      // ---------------- STAGE 6: ANGEL / GHOST ----------------
      if (stage === STAGE.ANGEL) {
        // Memorial tombstone on floor
        g.rect(px - 14, py - 10, 28, 14, 2);
        g.box(px - 14, py - 10, 28, 14, 3);
        g.text("R.I.P", px - 9, py - 7, 0);

        // Floating Angel Tamagotchi
        const gy = py - 36 + Math.sin(this.animTime * 4) * 4;
        // Halo
        g.circle(px, gy - 12, 6, 3);
        // Angel wings
        g.line(px - 10, gy - 2, px - 18, gy - 8, 3);
        g.line(px + 10, gy - 2, px + 18, gy - 8, 3);
        // Ghost Body
        g.disc(px, gy, 9, 3);
        g.px(px - 3, gy - 1, 0); // Peaceful closed eyes
        g.px(px + 3, gy - 1, 0);
        g.line(px - 2, gy + 3, px + 2, gy + 3, 0); // Serene smile
        return;
      }

      // ---------------- ACTIVE PET SPRITES ----------------
      const bob = (this.petVx !== 0) ? (f * 2) : 0;
      const cy = py - 10 - bob;

      // Sickness distressed skull icon next to pet
      if (this.pet.sick) {
        const skX = px + 18 * this.petDir;
        const skY = cy - 14;
        g.disc(skX, skY, 4, 3);
        g.px(skX - 2, skY - 1, 0); // Eye
        g.px(skX + 2, skY - 1, 0);
        g.rect(skX - 2, skY + 3, 5, 2, 3); // Jaw
        g.line(skX - 1, skY + 4, skX + 1, skY + 4, 0); // Teeth
      }

      // Sleeping "Zzz" indicator
      if (this.pet.isSleeping) {
        const zOffset = Math.floor(this.animTime * 2) % 3;
        g.text("Z", px + 14, cy - 10 - zOffset * 4, 3);
        g.text("z", px + 20, cy - 14 - zOffset * 4, 2);
      }

      // Crying distress tears if starving
      if (this.pet.hunger < 15 && !this.pet.isSleeping) {
        g.px(px - 10, cy + (f * 3), 3);
        g.px(px + 10, cy + (f * 3), 3);
      }

      // STAGE 1: BABY (Cute bouncing blob)
      if (stage === STAGE.BABY) {
        g.disc(px, cy, 8, 3);
        g.circle(px, cy, 8, 2);
        // Little ears / tufts
        g.px(px - 4, cy - 9, 3);
        g.px(px + 4, cy - 9, 3);
        // Eyes
        this.renderPetEyes(g, px, cy, 3, 2);
        // Feet
        if (f === 0) {
          g.px(px - 4, cy + 9, 2); g.px(px + 4, cy + 9, 2);
        } else {
          g.px(px - 6, cy + 8, 2); g.px(px + 6, cy + 8, 2);
        }
      }

      // STAGE 2: CHILD (Marutchi - Round toddler with hands)
      else if (stage === STAGE.CHILD) {
        g.disc(px, cy, 11, 3);
        g.circle(px, cy, 11, 2);
        // Rounded cheek tufts
        g.disc(px - 10, cy, 2, 3);
        g.disc(px + 10, cy, 2, 3);
        // Eyes & smile
        this.renderPetEyes(g, px, cy, 4, 3);
        // Little stubby feet
        const footOff = (f === 0) ? 0 : 2;
        g.disc(px - 5 + footOff, cy + 12, 2, 2);
        g.disc(px + 5 - footOff, cy + 12, 2, 2);
      }

      // STAGE 3: TEEN (Tamatchi - Active with spiky crown)
      else if (stage === STAGE.TEEN) {
        // Body
        g.disc(px, cy, 13, 3);
        g.circle(px, cy, 13, 2);
        // 3 Cute crown spikes on head
        g.tri(px - 8, cy - 13, px - 4, cy - 18, px, cy - 13, 3);
        g.tri(px - 3, cy - 13, px, cy - 20, px + 3, cy - 13, 3);
        g.tri(px, cy - 13, px + 4, cy - 18, px + 8, cy - 13, 3);
        // Eyes & Mouth
        this.renderPetEyes(g, px, cy, 5, 4);
        // Walking feet
        g.disc(px - 6, cy + 14 - bob, 3, 2);
        g.disc(px + 6, cy + 14 + bob, 3, 2);
      }

      // STAGE 4: ADULT (Mametchi / Kuchipatchi / Masktchi)
      else if (stage === STAGE.ADULT) {
        const sp = this.pet.adultSpecies;
        if (sp === 0) {
          // MAMETCHI (Scholar with tall rabbit ears & bowtie)
          g.disc(px, cy + 2, 14, 3);
          g.circle(px, cy + 2, 14, 2);
          // Long scholar ears
          g.rect(px - 9, cy - 20, 5, 12, 3);
          g.rect(px + 4, cy - 20, 5, 12, 3);
          g.box(px - 9, cy - 20, 5, 12, 2);
          g.box(px + 4, cy - 20, 5, 12, 2);
          // Bowtie
          g.tri(px - 4, cy + 14, px, cy + 12, px - 4, cy + 10, 2);
          g.tri(px + 4, cy + 14, px, cy + 12, px + 4, cy + 10, 2);
          // Eyes
          this.renderPetEyes(g, px, cy + 2, 5, 4);
          // Shoes
          g.rect(px - 8, cy + 16 - bob, 6, 3, 2);
          g.rect(px + 2, cy + 16 + bob, 6, 3, 2);
        } else if (sp === 1) {
          // KUCHIPATCHI (Foodie with wide duck bill & sleepy eyes)
          g.disc(px, cy + 2, 15, 3);
          g.circle(px, cy + 2, 15, 2);
          // Big iconic duck bill
          g.disc(px, cy + 5, 6, 2);
          g.line(px - 6, cy + 5, px + 6, cy + 5, 0); // Bill crease
          // Sleepy round eyes
          this.renderPetEyes(g, px, cy - 2, 5, 3);
          // Rounded feet
          g.disc(px - 7, cy + 16, 3, 2);
          g.disc(px + 7, cy + 16, 3, 2);
        } else {
          // MASKTCHI (Rebel Ninja Pet with bandit cowl)
          g.disc(px, cy + 2, 14, 3);
          g.circle(px, cy + 2, 14, 2);
          // Pointy ninja ears
          g.tri(px - 10, cy - 12, px - 8, cy - 18, px - 4, cy - 12, 3);
          g.tri(px + 4, cy - 12, px + 8, cy - 18, px + 10, cy - 12, 3);
          // Ninja black mask band
          g.rect(px - 12, cy - 2, 24, 7, 0);
          g.px(px - 4, cy + 1, 3); // Fierce glowing eye left
          g.px(px + 4, cy + 1, 3); // Fierce glowing eye right
          // Boots
          g.rect(px - 7, cy + 16, 5, 3, 2);
          g.rect(px + 2, cy + 16, 5, 3, 2);
        }
      }

      // STAGE 5: SENIOR (Ojitchi - Wise elder with specs, mustache & cane)
      else if (stage === STAGE.SENIOR) {
        g.disc(px, cy + 2, 14, 3);
        g.circle(px, cy + 2, 14, 2);
        // Three hairs on bald head
        g.line(px - 4, cy - 14, px - 6, cy - 18, 2);
        g.line(px, cy - 14, px, cy - 19, 2);
        g.line(px + 4, cy - 14, px + 6, cy - 18, 2);
        // Round spectacles
        g.circle(px - 5, cy, 3, 2);
        g.circle(px + 5, cy, 3, 2);
        g.line(px - 2, cy, px + 2, cy, 2); // Bridge
        this.renderPetEyes(g, px, cy, 4, 3);
        // Elder mustache
        g.line(px - 6, cy + 6, px + 6, cy + 6, 2);
        // Wooden walking stick / cane
        g.line(px + 14, cy - 2, px + 14, cy + 16, 2);
        g.line(px + 12, cy - 4, px + 14, cy - 2, 2);
      }
    },

    renderPetEyes(g, px, cy, spacing, yOff) {
      if (this.pet.isSleeping) {
        // Sleeping closed eye slashes
        g.line(px - spacing - 1, cy - yOff, px - spacing + 2, cy - yOff, 0);
        g.line(px + spacing - 2, cy - yOff, px + spacing + 1, cy - yOff, 0);
        return;
      }

      if (this.isBlinking) {
        g.line(px - spacing - 1, cy - yOff, px - spacing + 2, cy - yOff, 0);
        g.line(px + spacing - 2, cy - yOff, px + spacing + 1, cy - yOff, 0);
        return;
      }

      // Open bright phosphor eyes
      g.disc(px - spacing, cy - yOff, 2, 0);
      g.disc(px + spacing, cy - yOff, 2, 0);
      g.px(px - spacing, cy - yOff - 1, 3); // Eye highlight
      g.px(px + spacing, cy - yOff - 1, 3);

      // Cheerful smile
      if (this.pet.happy >= 40) {
        g.line(px - 2, cy + 3, px + 2, cy + 3, 0);
      } else {
        // Sad frown
        g.line(px - 2, cy + 4, px + 2, cy + 4, 0);
        g.px(px - 2, cy + 5, 0);
        g.px(px + 2, cy + 5, 0);
      }
    },

    renderParticles(g) {
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        if (p.type === 'heart') {
          // Floating pixel heart: ♥
          g.text("♥", Math.floor(p.x), Math.floor(p.y), 3);
        } else if (p.type === 'bubble') {
          g.circle(Math.floor(p.x), Math.floor(p.y), 2, 3);
        } else {
          // Spark
          g.px(Math.floor(p.x), Math.floor(p.y), (p.life > 0.5 ? 3 : 2));
        }
      }
    },

    renderNightOverlay(g) {
      // CRT phosphor nighttime dither pattern across room
      if (typeof g.dither === 'function') {
        g.dither(6, 34, 244, 168, 0, 1);
      } else {
        // Fallback scanline dither
        for (let y = 35; y < 202; y += 2) {
          g.line(6, y, 249, y, 0);
        }
      }
    },

    renderSpeechBubble(g, txt) {
      txt = String(txt).toUpperCase();
      const tw = txt.length * 5 + 6;
      let bx = Math.floor(this.petX - tw / 2);
      bx = Math.max(12, Math.min(244 - tw, bx));
      const by = Math.floor(this.petY - 48);

      g.rect(bx, by, tw, 14, 0);
      g.box(bx, by, tw, 14, 3);
      g.text(txt, bx + 3, by + 4, 3);

      // Bubble pointer triangle down to pet
      g.line(this.petX - 2, by + 14, this.petX, by + 18, 3);
      g.line(this.petX + 2, by + 14, this.petX, by + 18, 3);
    },

    // ------------------------------------------------------------------------
    // 11. ACTION MENUS & HUD OVERLAYS
    // ------------------------------------------------------------------------
    renderActionBars(g) {
      // Top Bar: 0..3 (Y: 4 to 30)
      for (let i = 0; i < 4; i++) {
        this.renderActionIcon(g, i, 18 + i * 56, 6);
      }

      // Bottom Bar: 4..7 (Y: 206 to 234)
      for (let i = 0; i < 4; i++) {
        this.renderActionIcon(g, 4 + i, 18 + i * 56, 206);
      }
    },

    renderActionIcon(g, id, x, y) {
      const isSelected = (!this.subMenu && this.menuIndex === id);
      const isAlarming = (id === 7 && this.pet.attentionAlarm && Math.floor(this.animTime * 4) % 2 === 0);

      // Icon box background
      g.rect(x, y, 44, 24, isSelected ? 2 : 0);
      g.box(x, y, 44, 24, isAlarming ? 3 : (isSelected ? 3 : 1));

      const c = isSelected ? 0 : 3;

      // Draw custom icon glyphs
      switch (id) {
        case 0: // FEED: Fork & Bowl
          g.line(x + 10, y + 6, x + 10, y + 14, c);
          g.line(x + 8, y + 6, x + 12, y + 6, c);
          g.disc(x + 16, y + 11, 4, c); // Rice bowl
          g.line(x + 12, y + 8, x + 20, y + 8, c);
          break;

        case 1: // LIGHTS: Lightbulb
          g.disc(x + 14, y + 9, 4, c);
          g.rect(x + 12, y + 12, 5, 3, c);
          // Glowing rays
          g.px(x + 14, y + 3, c);
          g.px(x + 8, y + 9, c);
          g.px(x + 20, y + 9, c);
          break;

        case 2: // PLAY: Game Controller / Ball
          g.box(x + 8, y + 7, 14, 8, c);
          g.px(x + 11, y + 10, c); // Dpad
          g.px(x + 18, y + 9, c);  // Button A
          g.px(x + 19, y + 11, c); // Button B
          break;

        case 3: // MEDICINE: Syringe / Cross
          g.line(x + 14, y + 6, x + 14, y + 14, c);
          g.line(x + 10, y + 10, x + 18, y + 10, c);
          break;

        case 4: // CLEAN: Shower / Spray
          g.disc(x + 14, y + 8, 4, c);
          g.line(x + 11, y + 13, x + 11, y + 16, c);
          g.line(x + 14, y + 13, x + 14, y + 17, c);
          g.line(x + 17, y + 13, x + 17, y + 16, c);
          break;

        case 5: // DISCIPLINE: Whistle / Badge
          g.disc(x + 14, y + 10, 4, c);
          g.rect(x + 14, y + 8, 6, 3, c);
          g.px(x + 12, y + 10, isSelected ? 3 : 0);
          break;

        case 6: // STATUS: Notebook / Meter
          g.box(x + 9, y + 6, 12, 11, c);
          g.line(x + 11, y + 9, x + 18, y + 9, c);
          g.line(x + 11, y + 12, x + 16, y + 12, c);
          break;

        case 7: // ATTENTION: Alarm Bell
          g.disc(x + 14, y + 10, 5, isAlarming ? 3 : c);
          g.line(x + 8, y + 13, x + 20, y + 13, isAlarming ? 3 : c);
          g.px(x + 14, y + 5, isAlarming ? 3 : c);
          if (this.pet.attentionAlarm) {
            g.text("!", x + 26, y + 7, 3);
          }
          break;
      }

      // Action Label
      g.text(MENU_ACTIONS[id].label, x + 23, y + 8, c);
    },

    renderFeedMenu(g) {
      g.rect(50, 80, 156, 70, 0);
      g.box(50, 80, 156, 70, 3);
      g.box(52, 82, 152, 66, 1);

      g.textC("SELECT FOOD", 88, 3);

      // Option 0: MEAL
      const mSel = (this.subIndex === 0);
      g.rect(58, 102, 66, 36, mSel ? 2 : 0);
      g.box(58, 102, 66, 36, mSel ? 3 : 1);
      g.text("1. MEAL", 64, 108, mSel ? 0 : 3);
      g.text("+25 HUNGER", 64, 118, mSel ? 0 : 2);
      g.text("+1 OZ WT", 64, 126, mSel ? 0 : 2);

      // Option 1: SNACK
      const sSel = (this.subIndex === 1);
      g.rect(132, 102, 66, 36, sSel ? 2 : 0);
      g.box(132, 102, 66, 36, sSel ? 3 : 1);
      g.text("2. SNACK", 138, 108, sSel ? 0 : 3);
      g.text("+15 HAPPY", 138, 118, sSel ? 0 : 2);
      g.text("+2 OZ WT", 138, 126, sSel ? 0 : 2);
    },

    renderDisciplineMenu(g) {
      g.rect(50, 80, 156, 70, 0);
      g.box(50, 80, 156, 70, 3);
      g.box(52, 82, 152, 66, 1);

      g.textC("DISCIPLINE ACTION", 88, 3);

      const pSel = (this.subIndex === 0);
      g.rect(58, 102, 66, 36, pSel ? 2 : 0);
      g.box(58, 102, 66, 36, pSel ? 3 : 1);
      g.text("1. PRAISE", 64, 108, pSel ? 0 : 3);
      g.text("PET ON HEAD", 64, 118, pSel ? 0 : 2);
      g.text("+10 HAPPY", 64, 126, pSel ? 0 : 2);

      const scSel = (this.subIndex === 1);
      g.rect(132, 102, 66, 36, scSel ? 2 : 0);
      g.box(132, 102, 66, 36, scSel ? 3 : 1);
      g.text("2. SCOLD", 138, 108, scSel ? 0 : 3);
      g.text("CORRECT PET", 138, 118, scSel ? 0 : 2);
      g.text("+25 TRAIN", 138, 126, scSel ? 0 : 2);
    },

    renderMiniGame(g) {
      const mg = this.miniGame;
      if (!mg) return;

      g.rect(36, 50, 184, 134, 0);
      g.box(36, 50, 184, 134, 3);
      g.box(38, 52, 180, 130, 1);

      g.textC("MINI-GAME: GUESS HEADING!", 58, 3);
      g.textC("ROUND " + mg.round + "/" + mg.maxRounds + "  |  WINS: " + mg.score, 70, 2);

      // Center Pet Facing Direction
      const cx = 128;
      const cy = 104;

      if (mg.state === 'PROMPT') {
        // Pet looking straight at player
        g.disc(cx, cy, 14, 3);
        g.circle(cx, cy, 14, 2);
        g.disc(cx - 4, cy - 2, 2, 0); // Eyes looking center
        g.disc(cx + 4, cy - 2, 2, 0);
        g.line(cx - 2, cy + 4, cx + 2, cy + 4, 0);

        g.textC("WHICH WAY WILL PET TURN?", 128, 3);

        // On-screen clickable / keypad direction buttons
        g.rect(60, 144, 46, 22, 1);
        g.box(60, 144, 46, 22, 3);
        g.text("[◀] LEFT", 64, 151, 3);

        g.rect(150, 144, 46, 22, 1);
        g.box(150, 144, 46, 22, 3);
        g.text("RIGHT [▶]", 153, 151, 3);
      } else if (mg.state === 'REVEAL') {
        // Pet turned in chosen direction
        const dir = mg.petChoice;
        g.disc(cx, cy, 14, 3);
        g.circle(cx, cy, 14, 2);
        // Eyes shifted left or right
        g.disc(cx + dir * 6, cy - 2, 2, 0);
        g.px(cx + dir * 6, cy - 3, 3);

        if (mg.roundResult === 'WIN') {
          g.textC("★ MATCH! YOU WIN ROUND! ★", 132, 3);
        } else {
          g.textC("MISS! PET TURNED " + (dir > 0 ? "RIGHT" : "LEFT"), 132, 2);
        }
      } else if (mg.state === 'RESULT') {
        const won = (mg.score >= 3);
        g.textC(won ? "★ GAME CLEAR! VICTORY! ★" : "NICE EFFORT! GAME OVER.", 95, 3);
        g.textC("FINAL SCORE: " + mg.score + " / 5", 112, 2);
        g.textC(won ? "+25 HAPPINESS & -1 OZ WEIGHT!" : "+10 HAPPINESS & -1 OZ WEIGHT!", 126, 3);
        g.textC("[A] CONTINUE", 152, 3);
      }
    },

    renderStatusScreen(g) {
      g.rect(16, 40, 224, 156, 0);
      g.box(16, 40, 224, 156, 3);
      g.box(18, 42, 220, 152, 1);

      // Header tab
      g.textC("TAMAGOTCHI VITAL RECORDS", 46, 3);
      g.textC("PAGE " + (this.statusPage + 1) + " / 3  (USE [◀] / [▶])", 56, 2);
      g.line(22, 64, 234, 64, 2);

      const p = this.pet;
      const ageDays = Math.floor(p.ageSeconds / 180);
      const ageHours = Math.floor((p.ageSeconds % 180) / 7.5);

      // --- PAGE 1: PROFILE & CARE GRADE ---
      if (this.statusPage === 0) {
        let stageName = "EGG";
        if (p.stage === STAGE.BABY) stageName = "BABY (BABYTCHI)";
        else if (p.stage === STAGE.CHILD) stageName = "CHILD (MARUTCHI)";
        else if (p.stage === STAGE.TEEN) stageName = "TEEN (TAMATCHI)";
        else if (p.stage === STAGE.ADULT) stageName = "ADULT (" + ADULT_SPECIES[p.adultSpecies].name + ")";
        else if (p.stage === STAGE.SENIOR) stageName = "SENIOR (OJITCHI)";
        else if (p.stage === STAGE.ANGEL) stageName = "ANGEL (GUARDIAN)";

        g.text("STAGE: " + stageName, 26, 72, 3);
        g.text("AGE:   " + ageDays + " DAYS, " + ageHours + " HRS", 26, 84, 3);
        g.text("WT:    " + p.weight + " OZ", 26, 96, 3);

        // Discipline bar
        g.text("DISCIPLINE: " + Math.floor(p.discipline) + "%", 26, 110, 3);
        g.box(26, 120, 120, 8, 2);
        const discW = Math.floor((p.discipline / 100) * 118);
        if (discW > 0) g.rect(27, 121, discW, 6, 3);

        // Difficulty Setting
        g.text("MODE:  " + this.getDifficultyName() + " (PRESS [A] TO CYCLE)", 26, 136, 3);

        // Generation
        g.text("GENERATION: #" + p.generation, 26, 150, 2);
        g.textC("[B] RETURN TO ROOM", 176, 2);
      }

      // --- PAGE 2: HEART METERS & HEALTH ---
      else if (this.statusPage === 1) {
        // Hunger Hearts (4 slots)
        g.text("HUNGER:", 26, 74, 3);
        const hungerHearts = Math.round((p.hunger / 100) * 4);
        for (let i = 0; i < 4; i++) {
          g.text((i < hungerHearts) ? "♥" : "·", 76 + i * 14, 74, 3);
        }

        // Happy Hearts (4 slots)
        g.text("HAPPY: ", 26, 92, 3);
        const happyHearts = Math.round((p.happy / 100) * 4);
        for (let i = 0; i < 4; i++) {
          g.text((i < happyHearts) ? "♥" : "·", 76 + i * 14, 92, 3);
        }

        // Energy Bar
        g.text("ENERGY:     " + Math.floor(p.energy) + "%", 26, 110, 3);
        g.box(106, 110, 100, 7, 2);
        const enW = Math.floor((p.energy / 100) * 98);
        if (enW > 0) g.rect(107, 111, enW, 5, 3);

        // Cleanliness Bar
        g.text("HYGIENE:    " + Math.floor(p.clean) + "%", 26, 126, 3);
        g.box(106, 126, 100, 7, 2);
        const clW = Math.floor((p.clean / 100) * 98);
        if (clW > 0) g.rect(107, 127, clW, 5, 3);

        // Health Status
        g.text("HEALTH: " + (p.sick ? "* SICK (NEEDS MEDICINE) *" : "EXCELLENT & HEALTHY"), 26, 144, p.sick ? 3 : 2);
        g.textC("[B] RETURN TO ROOM", 176, 2);
      }

      // --- PAGE 3: CARE LOG & HIGH SCORES ---
      else if (this.statusPage === 2) {
        // Grade calculation
        let grade = "C";
        if (ageDays >= 5 && p.discipline >= 75 && p.happy >= 70 && p.careMistakes <= 1) grade = "S";
        else if (ageDays >= 3 && p.discipline >= 55 && p.happy >= 50) grade = "A";
        else if (ageDays >= 1 && p.happy >= 40) grade = "B";

        g.text("CARE GRADE:  GRADE [" + grade + "]", 26, 74, 3);
        g.text("HIGH SCORE:  " + this.highScore + " PTS", 26, 88, 3);
        g.text("TOTAL MEALS: " + p.totalMeals + " FED", 26, 102, 2);
        g.text("POOPS FLUSH: " + p.totalCleaned + " CLEANED", 26, 116, 2);
        g.text("GAMES WON:   " + p.miniWins + " / " + p.miniGamesPlayed, 26, 130, 2);
        g.text("PATS GIVEN:  " + p.patsReceived + " STROKES", 26, 144, 2);

        g.textC("[B] RETURN TO ROOM", 176, 2);
      }
    },

    renderBanner(g) {
      g.rect(12, 186, 232, 14, 0);
      g.box(12, 186, 232, 14, 3);
      g.textC(this.bannerText, 190, 3);
    }
  };

})();
