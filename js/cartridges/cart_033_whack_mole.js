// js/cartridges/cart_033_whack_mole.js
// ============================================================================
// Cartridge #033: WHACK MOLE (Carnival Arcade Overhaul)
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[33] = {
  id: 33,
  name: "WHACK MOLE",
  genre: 3,
  scoreLabel: "PTS",
  desc: "CARNIVAL ARCADE! WHACK MULTIPLE MOLES, CRACK HELMETS & CATCH GOLDEN KINGS. DODGE BOMBS!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Dirt mound & hole
    g.disc(x + 16, y + 22, 10, 1);
    g.disc(x + 16, y + 20, 8, 0);
    // Mole emerging
    g.disc(x + 16, y + 15, 6, 2);
    g.disc(x + 16, y + 17, 3, 3);
    g.px(x + 14, y + 13, 3);
    g.px(x + 18, y + 13, 3);
    g.line(x + 10, y + 22, x + 22, y + 22, 3);
    // Mallet poised to strike
    g.line(x + 20, y + 6, x + 27, y + 3, 3);
    g.rect(x + 17, y + 4, 6, 8, 3);
    g.px(x + 18, y + 5, 0);
  },

  init() {
    this.highScore = (typeof SAVE !== 'undefined' && SAVE.getScore) ? SAVE.getScore(this.id) : 0;
    this.localDifficulty = (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : 1;
    this.gameState = 'READY'; // 'READY', 'PLAYING', 'GAMEOVER'
    this.cx = 1;
    this.cy = 1;
    this.score = 0;
    this.timeLeft = 30;
    this.time = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.fever = false;
    this.feverTimer = 0;
    this.malletStun = 0;
    this.swinging = false;
    this.swingTimer = 0;
    this.impactDone = false;
    this.shakeTimer = 0;
    this.shakeAmount = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.lastUrgentSec = -1;
    this.spawnTimer = 0.5;

    // Statistics
    this.stats = {
      brown: 0,
      helmet: 0,
      helmetsCracked: 0,
      golden: 0,
      bombsAvoided: 0,
      bombsHit: 0,
      whiffs: 0,
      totalWhacked: 0
    };

    // 9 Holes in a 3x3 Carnival Grid
    // Col X centers: 58, 128, 198 (spacing: 70)
    // Row Y centers: 84, 138, 192 (spacing: 54)
    this.holes = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        this.holes.push({
          c, r,
          x: 58 + c * 70,
          y: 84 + r * 54,
          state: 'EMPTY', // 'EMPTY', 'RISING', 'PEEK', 'BURROWING', 'HIT', 'BOMB_EXPLODING'
          type: 'BROWN',  // 'BROWN', 'HELMET', 'GOLDEN', 'BOMB'
          height: 0,
          maxHeight: 18,
          timer: 0,
          peekTime: 1.1,
          riseSpeed: 90,
          hitsLeft: 1,
          helmetOff: false,
          squishFactor: 1.0,
          animFrame: 0,
          fuseTimer: 0
        });
      }
    }

    this.particles = [];
    this.floatingTexts = [];
  },

  getDifficulty() {
    return (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : (this.localDifficulty || 1);
  },

  cycleDifficulty() {
    if (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) {
      VOS.difficulty = (VOS.difficulty + 1) % 3;
    } else {
      this.localDifficulty = ((this.localDifficulty || 1) + 1) % 3;
    }
    if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
  },

  getDifficultyParams() {
    const diff = this.getDifficulty();
    // 0: EASY (0.75x speed/urgency), 1: NORMAL (1.0x), 2: HARD (1.4x)
    if (diff === 0) {
      return {
        name: 'EASY',
        startTime: 35,
        spawnMin: 0.8,
        spawnMax: 1.2,
        maxConcurrent: 2,
        feverMaxConcurrent: 3,
        peekBrown: 1.4,
        peekHelmet: 1.7,
        peekGolden: 0.8,
        peekBomb: 1.4,
        riseSpeed: 75,
        bombWeight: 0.08,
        goldenWeight: 0.12
      };
    } else if (diff === 2) {
      return {
        name: 'HARD',
        startTime: 25,
        spawnMin: 0.35,
        spawnMax: 0.65,
        maxConcurrent: 4,
        feverMaxConcurrent: 5,
        peekBrown: 0.8,
        peekHelmet: 0.95,
        peekGolden: 0.45,
        peekBomb: 1.0,
        riseSpeed: 115,
        bombWeight: 0.22,
        goldenWeight: 0.08
      };
    }
    // NORMAL
    return {
      name: 'NORMAL',
      startTime: 30,
      spawnMin: 0.55,
      spawnMax: 0.95,
      maxConcurrent: 3,
      feverMaxConcurrent: 4,
      peekBrown: 1.1,
      peekHelmet: 1.3,
      peekGolden: 0.6,
      peekBomb: 1.2,
      riseSpeed: 90,
      bombWeight: 0.15,
      goldenWeight: 0.10
    };
  },

  startRound() {
    const p = this.getDifficultyParams();
    this.gameState = 'PLAYING';
    this.score = 0;
    this.timeLeft = p.startTime;
    this.combo = 0;
    this.maxCombo = 0;
    this.fever = false;
    this.feverTimer = 0;
    this.malletStun = 0;
    this.swinging = false;
    this.swingTimer = 0;
    this.impactDone = false;
    this.shakeTimer = 0;
    this.shakeAmount = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.lastUrgentSec = -1;
    this.spawnTimer = 0.3;
    this.particles = [];
    this.floatingTexts = [];
    this.stats = {
      brown: 0,
      helmet: 0,
      helmetsCracked: 0,
      golden: 0,
      bombsAvoided: 0,
      bombsHit: 0,
      whiffs: 0,
      totalWhacked: 0
    };
    for (let i = 0; i < this.holes.length; i++) {
      const h = this.holes[i];
      h.state = 'EMPTY';
      h.height = 0;
      h.timer = 0;
      h.squishFactor = 1.0;
      h.helmetOff = false;
      h.fuseTimer = 0;
    }
    if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_OK');
  },

  spawnMole() {
    const p = this.getDifficultyParams();
    const activeCount = this.holes.filter(h => h.state !== 'EMPTY').length;
    const maxActive = this.fever ? p.feverMaxConcurrent : p.maxConcurrent;
    if (activeCount >= maxActive) return;

    // Available empty holes
    const emptyIndices = [];
    for (let i = 0; i < this.holes.length; i++) {
      if (this.holes[i].state === 'EMPTY') emptyIndices.push(i);
    }
    if (emptyIndices.length === 0) return;

    const chosenIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const hole = this.holes[chosenIdx];

    // Decide archetype
    let type = 'BROWN';
    const roll = Math.random();
    if (this.fever) {
      // Swarm of golden moles during Fever Mode!
      if (roll < 0.45) type = 'GOLDEN';
      else if (roll < 0.78) type = 'BROWN';
      else if (roll < 0.94) type = 'HELMET';
      else type = 'BOMB';
    } else {
      if (roll < p.bombWeight) {
        type = 'BOMB';
      } else if (roll < p.bombWeight + p.goldenWeight) {
        type = 'GOLDEN';
      } else if (roll < p.bombWeight + p.goldenWeight + 0.25) {
        type = 'HELMET';
      } else {
        type = 'BROWN';
      }
    }

    hole.type = type;
    hole.state = 'RISING';
    hole.height = 0;
    hole.maxHeight = 18;
    hole.timer = 0;
    hole.riseSpeed = p.riseSpeed;
    hole.squishFactor = 1.0;
    hole.helmetOff = false;
    hole.hitsLeft = (type === 'HELMET') ? 2 : 1;
    hole.animFrame = 0;
    hole.fuseTimer = 0;

    if (type === 'GOLDEN') hole.peekTime = p.peekGolden;
    else if (type === 'HELMET') hole.peekTime = p.peekHelmet;
    else if (type === 'BOMB') hole.peekTime = p.peekBomb;
    else hole.peekTime = p.peekBrown;
  },

  strike(targetC = null, targetR = null) {
    if (this.gameState !== 'PLAYING') return;
    if (this.malletStun > 0) {
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('DENY');
      return;
    }
    if (targetC !== null && targetR !== null) {
      this.cx = targetC;
      this.cy = targetR;
    }
    if (this.swinging && this.swingTimer > 0.05) return;

    this.swinging = true;
    this.swingTimer = 0.16;
    this.impactDone = false;
    this.playMalletSwing();
  },

  resolveImpact() {
    this.impactDone = true;
    const holeIdx = this.cy * 3 + this.cx;
    const hole = this.holes[holeIdx];

    if (hole.state === 'PEEK' || hole.state === 'RISING' || hole.state === 'BURROWING') {
      if (hole.type === 'BOMB') {
        this.onHitBomb(hole);
      } else if (hole.type === 'HELMET' && !hole.helmetOff) {
        this.onHitHelmet(hole);
      } else {
        this.onHitMole(hole);
      }
    } else {
      this.onMiss(hole);
    }
  },

  getComboMultiplier() {
    if (this.combo >= 10) return 4;
    if (this.combo >= 6) return 3;
    if (this.combo >= 3) return 2;
    return 1;
  },

  addFloatingText(text, x, y, color = 3, scale = 1) {
    this.floatingTexts.push({
      text, x, y,
      vy: -26,
      life: 0.6,
      maxLife: 0.6,
      color,
      scale
    });
  },

  onHitMole(hole) {
    hole.hitsLeft--;
    hole.state = 'HIT';
    hole.timer = 0.35;
    hole.squishFactor = 0.4;
    this.stats.totalWhacked++;

    let basePts = 100;
    if (hole.type === 'GOLDEN') {
      basePts = 500;
      this.stats.golden++;
      this.timeLeft = Math.min(99, this.timeLeft + 3);
      this.playGoldenChime();
      this.addFloatingText("+500! +3S", hole.x, hole.y - 14, 3);
      // Golden star burst
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const spd = 35 + Math.random() * 35;
        this.particles.push({
          type: 'STAR',
          x: hole.x, y: hole.y - 12,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 0.5, maxLife: 0.5,
          color: 3
        });
      }
    } else if (hole.type === 'HELMET') {
      basePts = 250;
      this.stats.helmet++;
      this.playWoodBonk();
      this.playToySqueak();
      this.addFloatingText("+250!", hole.x, hole.y - 14, 3);
    } else {
      basePts = 100;
      this.stats.brown++;
      this.playWoodBonk();
      this.playToySqueak();
      this.addFloatingText("+100", hole.x, hole.y - 14, 3);
    }

    // Impact burst dust
    for (let i = 0; i < 6; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 25 + Math.random() * 35;
      this.particles.push({
        type: 'DUST',
        x: hole.x + (Math.random() - 0.5) * 8,
        y: hole.y - 6,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 12,
        life: 0.35, maxLife: 0.35,
        color: 2
      });
    }

    // Combo & Fever
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    const mult = this.getComboMultiplier();
    const feverBonus = this.fever ? 2 : 1;
    const pts = basePts * mult * feverBonus;
    this.score += pts;

    if (this.combo === 10 && !this.fever) {
      this.fever = true;
      this.feverTimer = 6.0;
      this.playFeverStart();
      this.addFloatingText("FEVER MODE x2!", 128, 56, 3, 1);
    } else if (this.fever) {
      this.feverTimer = Math.min(8.0, this.feverTimer + 0.8);
    }

    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(15);
  },

  onHitHelmet(hole) {
    hole.helmetOff = true;
    hole.timer = Math.min(hole.timer + 0.35, 1.3);
    this.stats.helmetsCracked++;
    this.playHelmetClank();

    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    const mult = this.getComboMultiplier();
    const feverBonus = this.fever ? 2 : 1;
    const pts = 50 * mult * feverBonus;
    this.score += pts;

    this.addFloatingText("+50 CLANG!", hole.x, hole.y - 16, 3);

    // Flying helmet particle
    this.particles.push({
      type: 'HELMET',
      x: hole.x, y: hole.y - 16,
      vx: (Math.random() - 0.5) * 80,
      vy: -140 - Math.random() * 30,
      rot: 0,
      vrot: (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 8),
      life: 0.8, maxLife: 0.8,
      color: 3
    });

    // Metallic sparks
    for (let i = 0; i < 5; i++) {
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      const spd = 40 + Math.random() * 45;
      this.particles.push({
        type: 'SPARK',
        x: hole.x, y: hole.y - 14,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.4, maxLife: 0.4,
        color: 3
      });
    }

    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(20);
  },

  onHitBomb(hole) {
    hole.state = 'BOMB_EXPLODING';
    hole.timer = 0.5;
    this.stats.bombsHit++;

    this.swinging = false;
    this.swingTimer = 0;
    this.score = Math.max(0, this.score - 300);
    this.combo = 0;
    this.fever = false;
    this.feverTimer = 0;
    this.malletStun = 0.8;
    this.shakeTimer = 0.4;
    this.shakeAmount = 4;

    this.playBombExplosion();
    this.addFloatingText("-300 BOMB!", hole.x, hole.y - 20, 3);

    // Explosion smoke & fireball debris
    for (let i = 0; i < 14; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 35 + Math.random() * 65;
      this.particles.push({
        type: 'SMOKE',
        x: hole.x + (Math.random() - 0.5) * 8,
        y: hole.y - 8,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 15,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        color: (i % 2 === 0) ? 3 : 2
      });
    }

    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(50);
  },

  onMiss(hole) {
    this.stats.whiffs++;
    this.combo = 0;
    this.fever = false;
    this.feverTimer = 0;
    this.playMissWhiff();
    this.addFloatingText("MISS!", hole.x, hole.y - 12, 1);

    for (let i = 0; i < 4; i++) {
      this.particles.push({
        type: 'DUST',
        x: hole.x + (Math.random() - 0.5) * 8,
        y: hole.y + 4,
        vx: (Math.random() - 0.5) * 25,
        vy: -8 - Math.random() * 12,
        life: 0.25, maxLife: 0.25,
        color: 1
      });
    }

    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(8);
  },

  // Procedural Carnival Chiptune Synthesis
  playMalletSwing() {
    if (typeof APU === 'undefined') return;
    if (APU.noise) APU.noise(0.05, 0.08, 1400, 'bandpass');
  },

  playWoodBonk() {
    if (typeof APU === 'undefined') return;
    if (APU.softTone) APU.softTone(180, 0.08, 'triangle', 0.16, 0, 0.003, 700);
    if (APU.noise) APU.noise(0.03, 0.08, 350, 'lowpass');
  },

  playToySqueak() {
    if (typeof APU === 'undefined') return;
    if (APU.tone) APU.tone(680, 0.08, 'sine', 0.12, 1350);
  },

  playHelmetClank() {
    if (typeof APU === 'undefined') return;
    if (APU.softTone) {
      APU.softTone(1760, 0.14, 'triangle', 0.14, 0, 0.001, 2800);
      APU.softTone(2637, 0.12, 'sine', 0.10, 0.02, 0.001, 3200);
    }
  },

  playGoldenChime() {
    if (typeof APU === 'undefined') return;
    if (APU.softTone) {
      const notes = [1046.50, 1318.51, 1567.98, 2093.00];
      notes.forEach((freq, idx) => {
        APU.softTone(freq, 0.22, 'sine', 0.09, idx * 0.04, 0.005, 3000);
      });
    }
  },

  playBombExplosion() {
    if (typeof APU === 'undefined') return;
    if (APU.sfx) APU.sfx('BOOM');
    if (APU.softTone) APU.softTone(60, 0.35, 'sine', 0.25, 0, 0.02, 220);
    if (APU.noise) APU.noise(0.35, 0.25, 180, 'lowpass');
  },

  playFuseCrackle() {
    if (typeof APU === 'undefined') return;
    if (APU.noise) APU.noise(0.02, 0.025, 2400, 'highpass');
  },

  playFeverStart() {
    if (typeof APU === 'undefined') return;
    if (APU.softTone) {
      const chords = [523.25, 659.25, 783.99, 1046.50];
      chords.forEach((freq, i) => {
        APU.softTone(freq, 0.20, 'triangle', 0.10, i * 0.05, 0.01, 2000);
      });
    }
  },

  playMissWhiff() {
    if (typeof APU === 'undefined') return;
    if (APU.sfx) APU.sfx('SWISH');
  },

  playUrgencyTick(sec) {
    if (typeof APU === 'undefined') return;
    if (APU.softTone) {
      APU.softTone(140, 0.04, 'triangle', 0.14, 0, 0.003, 600);
      APU.softTone(110, 0.06, 'triangle', 0.12, 0.10, 0.003, 500);
    }
  },

  getPrize() {
    if (this.score >= 5000) return "GRAND: GIANT PLUSH BEAR";
    if (this.score >= 3500) return "1ST: GOLDEN TROPHY";
    if (this.score >= 2000) return "2ND: BLUE RIBBON";
    if (this.score >= 1000) return "3RD: CARNIVAL PIN";
    return "CONSOLATION: BAG OF PEANUTS";
  },

  update(dt) {
    // Clamp delta-time against extreme hiccups
    dt = Math.min(dt, 0.1);
    this.time += dt;

    if (this.gameState === 'READY') {
      if (PAD.hit('a') || PAD.hit('start')) {
        this.startRound();
        return;
      }
      if (PAD.hit('left') || PAD.hit('right') || PAD.hit('select')) {
        this.cycleDifficulty();
      }
      if (PAD.tapPos) {
        if (PAD.tapPos.y >= 140 && PAD.tapPos.y <= 170) {
          this.cycleDifficulty();
        } else {
          this.startRound();
        }
      }
      return;
    }

    if (this.gameState === 'GAMEOVER') {
      if (PAD.hit('a') || PAD.hit('start')) {
        this.startRound();
        return;
      }
      if (PAD.hit('left') || PAD.hit('right') || PAD.hit('select')) {
        this.cycleDifficulty();
      }
      if (PAD.tapPos) {
        if (PAD.tapPos.y >= 155 && PAD.tapPos.y <= 175) {
          this.cycleDifficulty();
        } else {
          this.startRound();
        }
      }
      return;
    }

    // GAMEPLAY UPDATE (PLAYING)
    this.timeLeft -= dt;

    // Urgency heartbeat in last 5 seconds
    if (this.timeLeft <= 5.0 && this.timeLeft > 0) {
      const sec = Math.ceil(this.timeLeft);
      if (sec !== this.lastUrgentSec) {
        this.lastUrgentSec = sec;
        this.playUrgencyTick(sec);
      }
    }

    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.gameState = 'GAMEOVER';
      if (this.score > this.highScore) this.highScore = this.score;
      if (typeof SAVE !== 'undefined' && SAVE.setScore) SAVE.setScore(this.id, this.score);
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('LEVELUP');
      return;
    }

    // Fever timer
    if (this.fever) {
      this.feverTimer -= dt;
      if (this.feverTimer <= 0) {
        this.fever = false;
        this.feverTimer = 0;
      }
    }

    // Mallet stun
    if (this.malletStun > 0) {
      this.malletStun -= dt;
      if (this.malletStun < 0) this.malletStun = 0;
    }

    // Screen shake
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      this.shakeX = (Math.random() * 2 - 1) * this.shakeAmount;
      this.shakeY = (Math.random() * 2 - 1) * this.shakeAmount;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }

    // Mallet swing animation & impact resolution
    if (this.swinging) {
      this.swingTimer -= dt;
      if (!this.impactDone && this.swingTimer <= 0.08) {
        this.resolveImpact();
      }
      if (this.swingTimer <= 0) {
        this.swinging = false;
        this.swingTimer = 0;
      }
    }

    // D-pad controls
    if (PAD.hit('left')) {
      this.cx = Math.max(0, this.cx - 1);
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
    }
    if (PAD.hit('right')) {
      this.cx = Math.min(2, this.cx + 1);
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
    }
    if (PAD.hit('up')) {
      this.cy = Math.max(0, this.cy - 1);
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
    }
    if (PAD.hit('down')) {
      this.cy = Math.min(2, this.cy + 1);
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
    }

    // Direct Touch tap
    if (PAD.tapPos) {
      let tappedHole = null;
      for (let i = 0; i < this.holes.length; i++) {
        const h = this.holes[i];
        if (Math.hypot(PAD.tapPos.x - h.x, PAD.tapPos.y - h.y) < 28) {
          tappedHole = h;
          break;
        }
      }
      if (tappedHole) {
        this.strike(tappedHole.c, tappedHole.r);
      }
    } else if (PAD.hit('a')) {
      this.strike();
    }

    // Spawn ticker
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      const p = this.getDifficultyParams();
      this.spawnTimer = p.spawnMin + Math.random() * (p.spawnMax - p.spawnMin);
      this.spawnMole();
    }

    // Update 9 holes
    for (let i = 0; i < this.holes.length; i++) {
      const hole = this.holes[i];
      if (hole.state === 'RISING') {
        hole.height += hole.riseSpeed * dt;
        if (hole.height >= hole.maxHeight) {
          hole.height = hole.maxHeight;
          hole.state = 'PEEK';
          hole.timer = hole.peekTime;
        }
      } else if (hole.state === 'PEEK') {
        hole.timer -= dt;
        if (hole.type === 'BOMB') {
          hole.fuseTimer = (hole.fuseTimer || 0) + dt;
          if (hole.fuseTimer >= 0.12) {
            hole.fuseTimer = 0;
            this.playFuseCrackle();
            this.particles.push({
              type: 'SPARK',
              x: hole.x + 7,
              y: hole.y - hole.height - 2,
              vx: (Math.random() - 0.5) * 12,
              vy: 12 + Math.random() * 12,
              life: 0.25,
              maxLife: 0.25,
              color: 3
            });
          }
        } else if (hole.type === 'GOLDEN') {
          if (Math.random() < 0.2) {
            this.particles.push({
              type: 'STAR',
              x: hole.x + (Math.random() - 0.5) * 14,
              y: hole.y - hole.height - 4 + Math.random() * 6,
              vx: (Math.random() - 0.5) * 10,
              vy: -12 - Math.random() * 12,
              life: 0.35,
              maxLife: 0.35,
              color: 3
            });
          }
        }
        if (hole.timer <= 0) {
          if (hole.type === 'BOMB') {
            this.stats.bombsAvoided++;
          }
          hole.state = 'BURROWING';
        }
      } else if (hole.state === 'BURROWING') {
        hole.height -= hole.riseSpeed * dt;
        if (hole.height <= 0) {
          hole.height = 0;
          hole.state = 'EMPTY';
          hole.squishFactor = 1.0;
          hole.helmetOff = false;
        }
      } else if (hole.state === 'HIT') {
        hole.timer -= dt;
        if (hole.timer <= 0) {
          hole.state = 'BURROWING';
        }
      } else if (hole.state === 'BOMB_EXPLODING') {
        hole.timer -= dt;
        if (hole.timer <= 0) {
          hole.state = 'EMPTY';
          hole.height = 0;
        }
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.type === 'HELMET') {
        p.vy += 260 * dt;
        p.rot += p.vrot * dt;
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.life -= dt;
      t.y += t.vy * dt;
      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  },

  render(g) {
    g.clear(0);
    const ox = Math.floor(this.shakeX);
    const oy = Math.floor(this.shakeY);

    this.renderMarquee(g);

    if (this.gameState === 'READY') {
      this.renderReady(g);
      return;
    }

    this.renderHoles(g, ox, oy);
    this.renderParticles(g, ox, oy);
    this.renderMallet(g, ox, oy);
    this.renderHUD(g);

    if (this.gameState === 'GAMEOVER') {
      this.renderGameOver(g);
    }
  },

  renderMarquee(g) {
    const timeSpeed = this.fever ? 18 : 6;
    let bIdx = 0;
    // Top & Bottom marquee bulbs
    for (let bx = 4; bx <= 252; bx += 12) {
      const cTop = ((Math.floor(this.time * timeSpeed) + bIdx) % 3) + 1;
      g.px(bx, 2, cTop);
      g.px(bx + 1, 2, cTop);
      const cBot = ((Math.floor(this.time * timeSpeed) + bIdx + 2) % 3) + 1;
      g.px(bx, 237, cBot);
      g.px(bx + 1, 237, cBot);
      bIdx++;
    }
    // Left & Right marquee bulbs
    for (let by = 14; by <= 226; by += 12) {
      const cLeft = ((Math.floor(this.time * timeSpeed) + bIdx) % 3) + 1;
      g.px(2, by, cLeft);
      g.px(2, by + 1, cLeft);
      const cRight = ((Math.floor(this.time * timeSpeed) + bIdx + 1) % 3) + 1;
      g.px(253, by, cRight);
      g.px(253, by + 1, cRight);
      bIdx++;
    }
  },

  renderHoles(g, ox, oy) {
    for (let i = 0; i < this.holes.length; i++) {
      const hole = this.holes[i];
      const hx = hole.x + ox;
      const hy = hole.y + oy;

      // 1. Dark Pit Background
      g.disc(hx, hy, 16, 0);
      g.line(hx - 14, hy - 3, hx + 14, hy - 3, 1);

      // 2. Mole Sprite
      if (hole.height > 0 || hole.state === 'HIT' || hole.state === 'BOMB_EXPLODING') {
        this.renderMole(g, hole, hx, hy);
      }

      // 3. Front Dirt Mound (Occludes base of mole for rising 3D depth)
      g.disc(hx, hy + 6, 18, 1);
      g.rect(hx - 18, hy + 4, 37, 6, 1);
      g.line(hx - 16, hy + 2, hx + 16, hy + 2, 2);
      g.line(hx - 12, hy + 3, hx + 12, hy + 3, 3);
      g.px(hx - 10, hy + 7, 2);
      g.px(hx + 8, hy + 6, 2);
      g.px(hx + 2, hy + 8, 3);

      // Cute paws gripping rim
      if (hole.height >= 8 && hole.state !== 'HIT' && hole.type !== 'BOMB') {
        g.disc(hx - 10, hy + 1, 2, 2);
        g.disc(hx + 10, hy + 1, 2, 2);
        g.px(hx - 10, hy, 3);
        g.px(hx + 10, hy, 3);
      }

      // 4. Cursor Corner Brackets
      if (this.cx === hole.c && this.cy === hole.r && this.gameState === 'PLAYING') {
        const bc = this.fever ? 3 : 2;
        g.line(hx - 22, hy - 16, hx - 17, hy - 16, bc);
        g.line(hx - 22, hy - 16, hx - 22, hy - 11, bc);
        g.line(hx + 22, hy - 16, hx + 17, hy - 16, bc);
        g.line(hx + 22, hy - 16, hx + 22, hy - 11, bc);
        g.line(hx - 22, hy + 14, hx - 17, hy + 14, bc);
        g.line(hx - 22, hy + 14, hx - 22, hy + 9, bc);
        g.line(hx + 22, hy + 14, hx + 17, hy + 14, bc);
        g.line(hx + 22, hy + 14, hx + 22, hy + 9, bc);
      }
    }
  },

  renderMole(g, hole, hx, hy) {
    if (hole.state === 'BOMB_EXPLODING') {
      const blastProgress = 1.0 - hole.timer / 0.5;
      const blastR = Math.floor(blastProgress * 22);
      if (blastR > 0) {
        g.circle(hx, hy - 4, blastR, 3);
        if (blastR > 4) g.circle(hx, hy - 4, blastR - 4, 2);
        if (blastR > 8) g.disc(hx, hy - 4, blastR - 8, 0);
      }
      return;
    }

    const isHit = (hole.state === 'HIT');
    const h = isHit ? Math.max(5, hole.height * hole.squishFactor) : hole.height;
    const squishW = isHit ? 3 : 0;
    const my = Math.floor(hy - h + 9);
    const rx = 10 + squishW;

    // Body colors
    let bodyCol = 2;
    if (hole.type === 'GOLDEN') bodyCol = 3;
    else if (hole.type === 'BOMB') bodyCol = 1;

    // Head dome & body
    g.disc(hx, my, rx, bodyCol);
    g.rect(hx - rx, my, rx * 2 + 1, Math.max(1, hy - my), bodyCol);

    if (hole.type !== 'BOMB') {
      // Ears
      g.disc(hx - 9 - squishW, my - 6, 3, bodyCol);
      g.disc(hx + 9 + squishW, my - 6, 3, bodyCol);
      g.px(hx - 9 - squishW, my - 6, 0);
      g.px(hx + 9 + squishW, my - 6, 0);

      // Eyes
      if (isHit) {
        // Dizzy X eyes
        g.line(hx - 5, my - 3, hx - 2, my, 3);
        g.line(hx - 2, my - 3, hx - 5, my, 3);
        g.line(hx + 2, my - 3, hx + 5, my, 3);
        g.line(hx + 5, my - 3, hx + 2, my, 3);
        // Swirling dizzy stars
        const starAng = this.time * 9;
        g.px(Math.floor(hx + Math.cos(starAng) * 8), Math.floor(my - 9 + Math.sin(starAng) * 3), 3);
        g.px(Math.floor(hx + Math.cos(starAng + 3.14) * 8), Math.floor(my - 9 + Math.sin(starAng + 3.14) * 3), 3);
      } else {
        const isBlinking = ((Math.floor(this.time * 2.5) % 6 === 0) && h > 10);
        if (isBlinking) {
          g.line(hx - 5, my - 2, hx - 2, my - 2, 3);
          g.line(hx + 2, my - 2, hx + 5, my - 2, 3);
        } else {
          g.disc(hx - 4, my - 2, 2, 3);
          g.disc(hx + 4, my - 2, 2, 3);
          g.px(hx - 4, my - 3, 0);
          g.px(hx + 4, my - 3, 0);
        }
      }

      // Snout & Whiskers
      g.disc(hx, my + 3, 4, (hole.type === 'GOLDEN' ? 2 : 1));
      g.disc(hx, my + 2, 2, 3);
      g.line(hx - 9, my + 2, hx - 4, my + 2, 3);
      g.line(hx - 8, my + 4, hx - 4, my + 3, 3);
      g.line(hx + 4, my + 2, hx + 9, my + 2, 3);
      g.line(hx + 4, my + 3, hx + 8, my + 4, 3);
      g.px(hx, my + 5, 3); // cute tooth
    } else {
      // BOMB BANDIT
      g.disc(hx, my, 9, 0);
      g.circle(hx, my, 9, 2);
      g.text("TNT", hx - 7, my - 3, 3);
      // Fuse
      g.line(hx, my - 8, hx + 4, my - 13, 2);
      g.line(hx + 4, my - 13, hx + 7, my - 11, 2);
      // Sputtering spark flame
      const flk = ((this.time * 24) | 0) & 1;
      g.disc(hx + 7, my - 11, flk ? 3 : 2, 3);
      g.px(hx + 8, my - 12, flk ? 2 : 3);
    }

    // Archetype Hats & Crowns
    if (hole.type === 'HELMET' && !hole.helmetOff) {
      // Protective Construction Hardhat
      g.disc(hx, my - 5, 10, 3);
      g.rect(hx - 10, my - 5, 21, 5, 3);
      g.line(hx - 12, my - 1, hx + 12, my - 1, 3);
      g.line(hx - 12, my, hx + 12, my, 2);
      g.rect(hx - 2, my - 8, 5, 4, 0);
      g.px(hx, my - 6, 3);
    } else if (hole.type === 'GOLDEN') {
      // Royal Golden Crown
      const cy = my - 8;
      g.rect(hx - 8, cy + 3, 17, 3, 3);
      g.tri(hx - 8, cy + 3, hx - 5, cy - 3, hx - 2, cy + 3, 3);
      g.tri(hx - 3, cy + 3, hx, cy - 6, hx + 3, cy + 3, 3);
      g.tri(hx + 2, cy + 3, hx + 5, cy - 3, hx + 8, cy + 3, 3);
      g.px(hx - 5, cy - 1, 0);
      g.px(hx, cy - 3, 0);
      g.px(hx + 5, cy - 1, 0);
    }
  },

  renderMallet(g, ox, oy) {
    const targetHole = this.holes[this.cy * 3 + this.cx];
    const hx = targetHole.x + ox;
    const hy = targetHole.y + oy;

    if (this.swinging) {
      const progress = 1.0 - this.swingTimer / 0.16;
      if (progress < 0.45) {
        // Downward swing
        const t = progress / 0.45;
        const mx = Math.floor(hx + 12 * (1 - t));
        const my = Math.floor(hy - 32 + 18 * t);
        g.line(mx + 4, my, mx + 24, my - 20, 2);
        g.line(mx + 5, my, mx + 25, my - 20, 3);
        g.rect(mx - 8, my - 6, 16, 12, 2);
        g.box(mx - 8, my - 6, 16, 12, 3);
      } else if (progress < 0.70) {
        // Impact hold frame
        const mx = hx;
        const my = hy - 14;
        g.rect(mx - 9, my - 5, 18, 10, 2);
        g.box(mx - 9, my - 5, 18, 10, 3);
        g.line(mx - 9, my, mx + 8, my, 1);
        g.line(mx + 5, my, mx + 25, my - 14, 2);
        g.line(mx + 5, my - 1, mx + 25, my - 15, 3);
        // Impact bursts
        g.line(mx - 14, my + 2, mx - 20, my - 2, 3);
        g.line(mx + 14, my + 2, mx + 20, my - 2, 3);
        g.px(mx - 16, my - 5, 3);
        g.px(mx + 16, my - 5, 3);
      } else {
        // Recoil
        const t = (progress - 0.70) / 0.30;
        const mx = Math.floor(hx + 12 * t);
        const my = Math.floor(hy - 14 - 18 * t);
        g.line(mx + 4, my, mx + 22, my - 22, 2);
        g.line(mx + 5, my, mx + 23, my - 22, 3);
        g.rect(mx - 8, my - 6, 16, 12, 2);
        g.box(mx - 8, my - 6, 16, 12, 3);
      }
    } else {
      // Idle Hover
      if (this.malletStun > 0) {
        const shake = (Math.random() * 4 - 2);
        const mx = Math.floor(hx + 10 + shake);
        const my = Math.floor(hy - 24 + shake);
        g.rect(mx - 8, my - 6, 16, 12, 1);
        g.box(mx - 8, my - 6, 16, 12, 0);
        g.line(mx + 3, my, mx + 20, my - 14, 1);
        g.text("STUN!", hx - 12, hy - 40, 3);
      } else {
        const bob = Math.sin(this.time * 5) * 2;
        const mx = hx + 12;
        const my = Math.floor(hy - 30 + bob);
        g.line(mx + 4, my, mx + 24, my - 22, 2);
        g.line(mx + 5, my, mx + 25, my - 22, 3);
        g.rect(mx - 8, my - 6, 16, 12, 2);
        g.box(mx - 8, my - 6, 16, 12, 3);
        g.line(mx - 8, my - 6, mx - 8, my + 5, 3);
        g.line(mx + 7, my - 6, mx + 7, my + 5, 3);
        g.line(mx - 4, my, mx + 3, my, 1);
      }
    }
  },

  renderParticles(g, ox, oy) {
    // Render particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const px = Math.floor(p.x + ox);
      const py = Math.floor(p.y + oy);
      if (p.type === 'HELMET') {
        g.disc(px, py, 6, p.color);
        g.line(px - 7, py + 2, px + 7, py + 2, p.color);
      } else if (p.type === 'STAR') {
        g.px(px, py, p.color);
        g.px(px - 1, py, p.color);
        g.px(px + 1, py, p.color);
        g.px(px, py - 1, p.color);
        g.px(px, py + 1, p.color);
      } else if (p.type === 'SMOKE') {
        const r = Math.floor(2 + (1 - p.life / p.maxLife) * 4);
        g.circle(px, py, r, p.color);
      } else {
        g.px(px, py, p.color);
      }
    }

    // Render floating text bursts
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const t = this.floatingTexts[i];
      const tx = Math.floor(t.x + ox - (t.text.length * 5) / 2);
      const ty = Math.floor(t.y + oy);
      g.text(t.text, tx, ty, t.color, t.scale);
    }
  },

  renderHUD(g) {
    // Top marquee header box
    g.rect(14, 6, 228, 20, 0);
    g.box(14, 6, 228, 20, 2);

    // Score
    g.text("SCORE:" + this.score, 18, 12, 3);

    // Time (Flashes bright when <= 5s)
    const timeSec = Math.ceil(this.timeLeft);
    const timeCol = (timeSec <= 5 && (Math.floor(this.time * 8) & 1)) ? 3 : 2;
    g.textC("TIME:" + timeSec + "S", 12, timeCol);

    // High Score
    const curHigh = Math.max(this.score, this.highScore);
    g.textR("HI:" + curHigh, 238, 12, 2);

    // Sub-header Banner (Fever or Combo Meter)
    if (this.fever) {
      g.rect(14, 28, 228, 9, 3);
      g.textC("★ FEVER MODE! DOUBLE SCORE! ★", 30, 0);
    } else {
      const mult = this.getComboMultiplier();
      const multStr = "x" + mult;
      g.text("COMBO:" + this.combo + "[" + multStr + "]", 18, 29, 2);

      // Fever progress gauge
      g.text("FEVER:", 132, 29, 1);
      g.box(166, 29, 44, 7, 1);
      const fillW = Math.floor((Math.min(10, this.combo) / 10) * 42);
      if (fillW > 0) g.rect(167, 30, fillW, 5, 3);
      g.textR("" + Math.min(10, this.combo) + "/10", 238, 29, 2);
    }

    // Bottom Bar
    g.line(14, 214, 242, 214, 1);
    g.text("[A]/TAP:WHACK", 16, 220, 2);

    if (this.malletStun > 0) {
      g.textC("MALLET STUNNED!", 220, 3);
    } else if (this.fever) {
      g.textC("FEVER:" + this.feverTimer.toFixed(1) + "S", 220, 3);
    } else {
      const diffName = this.getDifficultyParams().name;
      g.textC("MODE:" + diffName, 220, 2);
    }

    g.textR("HITS:" + this.stats.totalWhacked, 240, 220, 2);
  },

  renderReady(g) {
    // Title Showcase
    g.textC("★ CARNIVAL WHACK-A-MOLE ★", 24, 3);
    g.line(20, 34, 236, 34, 2);

    // Mini showcase booth
    g.box(30, 42, 196, 78, 2);
    g.dither(30, 42, 196, 78, 0, 1);
    g.rect(32, 44, 192, 74, 0);

    g.textC("TARGET POINT VALUES:", 48, 2);
    g.text("BROWN MOLE:", 40, 60, 2);
    g.textR("100 PTS", 216, 60, 3);
    g.text("HARDHAT HELMET:", 40, 72, 2);
    g.textR("250 PTS (2 HITS)", 216, 72, 3);
    g.text("GOLDEN KING:", 40, 84, 2);
    g.textR("500 PTS +3S", 216, 84, 3);
    g.text("BOMB BANDIT:", 40, 96, 2);
    g.textR("-300 & STUN!", 216, 96, 3);

    // Difficulty Box
    const p = this.getDifficultyParams();
    g.box(30, 128, 196, 32, 3);
    g.rect(32, 130, 192, 28, 0);
    g.textC("DIFFICULTY: ◀ " + p.name + " ▶", 136, 3);
    g.textC("[SELECT] OR TAP TO TOGGLE", 148, 1);

    // Controls & Start prompt
    g.textC("D-PAD: MOVE  |  [A] OR TOUCH: SLAM", 172, 2);
    g.box(40, 186, 176, 22, (Math.floor(this.time * 4) & 1) ? 3 : 2);
    g.textC("PRESS [A] OR TAP TO START!", 194, 3);

    if (this.highScore > 0) {
      g.textC("HIGH SCORE: " + this.highScore + " PTS", 216, 2);
    }
  },

  renderGameOver(g) {
    // Game Over Summary Overlay
    g.dither(22, 24, 212, 194, 0, 1);
    g.box(22, 24, 212, 194, 3);
    g.rect(24, 26, 208, 190, 0);

    g.textC("★ CARNIVAL PRIZE BOOTH ★", 32, 3);
    g.line(30, 42, 226, 42, 2);

    g.textC("FINAL SCORE: " + this.score, 48, 3);
    if (this.score >= this.highScore && this.score > 0) {
      g.textC("★ NEW ALL-TIME HIGH SCORE! ★", 58, 3);
    } else {
      g.textC("HIGH SCORE: " + this.highScore, 58, 2);
    }

    g.line(30, 68, 226, 68, 1);
    g.textC(this.getPrize(), 73, 3);
    g.line(30, 83, 226, 83, 1);

    // Breakdown Stats
    g.text("STANDARD MOLES:", 34, 88, 2);
    g.textR("" + this.stats.brown, 222, 88, 3);
    g.text("HELMETS CRACKED:", 34, 98, 2);
    g.textR("" + this.stats.helmetsCracked, 222, 98, 3);
    g.text("GOLDEN KINGS:", 34, 108, 2);
    g.textR("" + this.stats.golden, 222, 108, 3);
    g.text("BOMBS AVOIDED:", 34, 118, 2);
    g.textR("" + this.stats.bombsAvoided, 222, 118, 3);
    g.text("MAX COMBO STREAK:", 34, 128, 2);
    g.textR("" + this.maxCombo, 222, 128, 3);

    g.line(30, 140, 226, 140, 2);

    const diffName = this.getDifficultyParams().name;
    g.textC("DIFFICULTY: ◀ " + diffName + " ▶", 148, 2);
    g.textC("[SELECT] CHANGE DIFFICULTY", 158, 1);

    g.box(34, 172, 188, 22, (Math.floor(this.time * 4) & 1) ? 3 : 2);
    g.textC("PRESS [A] OR TAP TO PLAY AGAIN", 180, 3);
  },

  save() {
    return {
      highScore: this.highScore,
      maxCombo: this.maxCombo,
      totalWhacked: this.stats ? this.stats.totalWhacked : 0
    };
  },

  load(data) {
    if (!data) return;
    if (typeof data.highScore === 'number') this.highScore = data.highScore;
    if (typeof data.maxCombo === 'number') this.maxCombo = data.maxCombo;
  }
};
