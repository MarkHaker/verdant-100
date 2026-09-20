// js/vos.js

// ============================================================================
// [VOS] CONSOLE OPERATING SYSTEM, CAROUSEL, CRT BOOT & PAUSE MENU
// ============================================================================
// GENRES is defined in config.js

const VOS = {
  powerOn: true,
  mode: 'BOOT', // 'BOOT' | 'MENU' | 'PREVIEW' | 'GAME' | 'PAUSE'
  bootTime: 0,
  bootDone: false,
  selectedCartId: 1,
  filterIdx: 0, // 0 = ALL, 1..10 = GENRES, 11 = RECORDS
  cartList: [],
  filteredList: [],
  carouselOffset: 0,
  carouselTarget: 0,
  activeCart: null,
  gameTime: 0,
  pauseCursor: 0,
  resetHoldTimer: 0,
  insertAnim: 0, // > 0 while cartridge is inserting

  difficulty: 1, // 0 = EASY (0.75x), 1 = NORMAL (1.0x), 2 = HARD (1.4x)
  difficultyNames: ['EASY', 'NORMAL', 'HARD'],
  difficultyMultipliers: [0.75, 1.0, 1.4],

  turnBasedCarts: new Set([
    11, 12, 13, 14, 16, 17, 18, 19, 20, 29, 41, 43, 44, 46, 49,
    50, 51, 53, 54, 56, 57, 67, 72, 75, 76, 77, 79, 81, 82, 83, 85, 87,
    88, 89, 90, 91, 95, 97, 98, 100
  ]),

  isTurnBased(id) {
    return this.turnBasedCarts.has(id);
  },

  getSpeedMultiplier() {
    return this.difficultyMultipliers[this.difficulty] || 1.0;
  },

  getDifficultyName() {
    return this.difficultyNames[this.difficulty] || 'NORMAL';
  },

  getStickerTitle(name) {
    if (name.length <= 8) return name;
    const map = {
      "ASTEROIDS": "ASTEROID", "LUNAR LANDER": "LANDER", "MISSILE CMD": "MISSILE",
      "MINESWEEPER": "MINESWEEP", "LIGHTS OUT": "LIGHTS", "PIPE MANIA": "PIPES",
      "15-PUZZLE": "PUZZLE15", "MASTERMIND": "M-MIND", "TOWER HANOI": "HANOI",
      "ARTILLERY": "CANNON", "ORBIT SLING": "ORBIT", "BRIDGE BUILD": "BRIDGES",
      "PORTAL DROP": "PORTAL", "FALLING SAND": "SANDBOX", "CHAIN REACT": "CHAIN",
      "BILLIARDS 2D": "BILLIARD", "ROPE SWING": "ROPES", "LIQUID SORT": "LIQUIDS",
      "MARBLE MAZE": "MARBLE", "GUITAR TAP": "GUITAR", "WHACK MOLE": "MOLES",
      "QUICK DRAW": "OUTLAW", "LINE RUNNER": "RUNNER", "DOODLE JUMP": "DOODLE",
      "TRAFFIC CTRL": "TRAFFIC", "BLINK MATCH": "BLINK", "TOWER DEF": "TOWERDEF",
      "NAVAL BATTLE": "WARSHIP", "VIRUS SPREAD": "VIRUS", "AUTOBATTLER": "BATTLE",
      "ANT COLONY": "ANTS", "ROGUE 1980": "ROGUE", "DUNGEON 3D": "DUNGEON",
      "TEXT QUEST": "QUEST", "DECKBUILDER": "CARDS", "BOSS DUEL": "BOSS",
      "TAMAGOTCHI": "PET", "ALCHEMY DESK": "ALCHEMY", "PRISON BREAK": "ESCAPE",
      "DEEP DIVER": "DIVER", "RETRO GOLF": "GOLF", "AIR HOCKEY": "HOCKEY",
      "PENALTY KICK": "PENALTY", "SLALOM SKI": "SLALOM", "BOXING 2D": "BOXING",
      "FISHING ROD": "FISHING", "METAL GEAR": "STEALTH", "ZOMBIE CABIN": "ZOMBIES",
      "SONAR SUB": "SONAR", "BOMB DEFUSE": "DEFUSE", "LASER MIRROR": "MIRRORS",
      "CROWD EVAC": "EVACUATE", "FNAF CAMS": "SURVIVAL", "X-RAY SCAN": "X-RAY",
      "TURRET 360": "TURRET", "SUDOKU 6X6": "SUDOKU", "MATH RUSH": "MATH",
      "MEMORY FLIP": "MEMORY", "CHIMP TEST": "CHIMP", "STROOP TEST": "STROOP",
      "SIMON SOUND": "SIMON", "MATRIX IQ": "MATRIX", "SPEED TYPER": "TYPER",
      "ODD PIXEL": "ODD PIX", "BINARY BYTE": "BINARY", "THERMOSTAT": "REACTOR",
      "GLITCH FIX": "GLITCH", "SINE SYNC": "SINE", "SOLAR TRACK": "SOLAR",
      "DICE POKER": "POKER", "SHOPKEEPER": "MERCHANT", "ARM WRESTLE": "WRESTLE",
      "HACKER TERM": "TERMINAL"
    };
    return map[name] || name.substring(0, 8);
  },
  togglePower() {
    this.powerOn = !this.powerOn;
    const led = document.getElementById('power-led');
    const overlay = document.getElementById('crt-beam-overlay');

    if (!this.powerOn) {
      if (led) led.className = 'power-led off';
      if (overlay) overlay.classList.add('off');
      APU.stopMenuMusic();
      APU.sfx('BOOM');
    } else {
      if (led) led.className = 'power-led';
      if (overlay) overlay.classList.remove('off');
      this.mode = 'BOOT';
      this.bootTime = 0;
      APU.bootJingle();
    }
  },

  init() {
    this.cartList = Object.values(CARTS).sort((a, b) => a.id - b.id);
    this.updateFilter();
    this.mode = 'BOOT';
    this.bootTime = 0;
    APU.bootJingle();
  },

  updateFilter() {
    if (this.filterIdx === 0) {
      this.filteredList = [...this.cartList];
    } else if (this.filterIdx <= 10) {
      const g = this.filterIdx - 1;
      this.filteredList = this.cartList.filter(c => c.genre === g);
    } else {
      // RECORDS ONLY
      this.filteredList = this.cartList.filter(c => SAVE.getScore(c.id) > 0);
      if (this.filteredList.length === 0) this.filteredList = [...this.cartList];
    }
    // Clamp selected cart
    if (!this.filteredList.some(c => c.id === this.selectedCartId)) {
      if (this.filteredList.length > 0) this.selectedCartId = this.filteredList[0].id;
    }
  },

  getFilterName() {
    if (this.filterIdx === 0) return 'ALL (100)';
    if (this.filterIdx <= 10) return GENRES[this.filterIdx - 1];
    return '★ RECORDS';
  },

  launchGame(id) {
    const cart = CARTS[id];
    if (!cart) return;
    this.activeCart = cart;
    this.gameTime = 0;
    this.insertAnim = 0.5; // 0.5s slide-in animation
    APU.sfx('INSERT');
    APU.stopMenuMusic();

    if (this.launchTimer) clearTimeout(this.launchTimer);
    this.launchTimer = setTimeout(() => {
      this.launchTimer = null;
      if (this.mode === 'MENU' || !this.activeCart) return;
      APU.jingle(id);
      cart.init();
      const savedPer = SAVE.getPersistent(id);
      if (savedPer && cart.load) cart.load(savedPer);
      this.mode = 'GAME';
      this.updateLED();
    }, 450);
  },

  pauseGame() {
    if (this.mode === 'GAME') {
      this.mode = 'PAUSE';
      this.pauseCursor = 0;
      APU.sfx('UI_BACK');
      this.updateLED();
    }
  },

  resumeGame() {
    if (this.mode === 'PAUSE') {
      this.mode = 'GAME';
      APU.sfx('UI_OK');
      this.updateLED();
    }
  },

  exitToMenu() {
    if (this.launchTimer) {
      clearTimeout(this.launchTimer);
      this.launchTimer = null;
    }
    if (this.activeCart) {
      if (this.activeCart.save) {
        const per = this.activeCart.save();
        if (per) SAVE.setPersistent(this.activeCart.id, per);
      }
      SAVE.addPlayTime(this.activeCart.id, Math.floor(this.gameTime));
    }
    this.mode = 'MENU';
    this.activeCart = null;
    this.pauseCursor = 0;
    this.resetHoldTimer = 0;
    this.updateFilter();
    APU.sfx('UI_BACK');
    APU.startMenuMusic();
    this.updateLED();
  },

  updateLED() {
    const led = document.getElementById('power-led');
    if (!led) return;
    if (!this.powerOn) {
      led.className = 'power-led off';
    } else if (this.mode === 'PAUSE') {
      led.className = 'power-led pause';
    } else {
      led.className = 'power-led';
    }
  },

  update(dt) {
    if (!this.powerOn) return;
    // Enter pause with START while in game
    if (PAD.hit('start') && this.mode === 'GAME') {
      this.pauseGame();
      return;
    }

    if (this.mode === 'BOOT') {
      this.bootTime += dt;
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || PAD.hit('select') || this.bootTime > 0.85) {
        this.mode = 'MENU';
        APU.startMenuMusic();
        this.updateLED();
      }
    } else if (this.mode === 'MENU') {
      // Navigate carousel
      const curIdx = this.filteredList.findIndex(c => c.id === this.selectedCartId);
      if (PAD.hit('left')) {
        const nextIdx = (curIdx - 1 + this.filteredList.length) % this.filteredList.length;
        this.selectedCartId = this.filteredList[nextIdx].id;
        APU.sfx('UI_MOVE');
      } else if (PAD.hit('right')) {
        const nextIdx = (curIdx + 1) % this.filteredList.length;
        this.selectedCartId = this.filteredList[nextIdx].id;
        APU.sfx('UI_MOVE');
      } else if (PAD.hit('up')) {
        const nextIdx = (curIdx - 10 + this.filteredList.length) % this.filteredList.length;
        this.selectedCartId = this.filteredList[nextIdx].id;
        APU.sfx('UI_MOVE');
      } else if (PAD.hit('down')) {
        const nextIdx = (curIdx + 10) % this.filteredList.length;
        this.selectedCartId = this.filteredList[nextIdx].id;
        APU.sfx('UI_MOVE');
      }

      // Filter switch via SELECT
      if (PAD.hit('select')) {
        this.filterIdx = (this.filterIdx + 1) % 12;
        this.updateFilter();
        APU.sfx('UI_MOVE');
      }

      // Open Cartridge Card (A or START / Enter)
      if (PAD.hit('a') || PAD.hit('start')) {
        APU.sfx('UI_OK');
        this.mode = 'PREVIEW';
      }
    } else if (this.mode === 'PREVIEW') {
      if (this.insertAnim > 0) {
        this.insertAnim -= dt;
        return;
      }
      // Difficulty selection for reaction games
      const isTurnBased = this.isTurnBased(this.selectedCartId);
      if (!isTurnBased) {
        if (PAD.hit('left')) {
          this.difficulty = (this.difficulty - 1 + 3) % 3;
          APU.sfx('UI_MOVE');
        } else if (PAD.hit('right')) {
          this.difficulty = (this.difficulty + 1) % 3;
          APU.sfx('UI_MOVE');
        }
      }

      // Launch game with A or START / Enter
      if (PAD.hit('a') || PAD.hit('start')) {
        this.launchGame(this.selectedCartId);
      } else if (PAD.hit('b') || PAD.hit('select')) {
        APU.sfx('UI_BACK');
        this.mode = 'MENU';
      }
    } else if (this.mode === 'GAME') {
      this.gameTime += dt;
      if (this.activeCart && this.activeCart.update) {
        const mult = this.isTurnBased(this.activeCart.id) ? 1.0 : this.getSpeedMultiplier();
        this.activeCart.update(dt * mult);
      }
    } else if (this.mode === 'PAUSE') {
      // Pause menu navigation
      const items = 8;
      if (PAD.hit('up')) {
        this.pauseCursor = (this.pauseCursor - 1 + items) % items;
        APU.sfx('UI_MOVE');
      } else if (PAD.hit('down')) {
        this.pauseCursor = (this.pauseCursor + 1) % items;
        APU.sfx('UI_MOVE');
      }

      // Options action
      const confirm = PAD.hit('a') || PAD.hit('start');

      if (this.pauseCursor === 0 && confirm) {
        this.resumeGame();
      } else if (this.pauseCursor === 1 && confirm) {
        APU.sfx('UI_OK');
        this.mode = 'GAME';
        this.activeCart.init();
      } else if (this.pauseCursor === 2) { // Volume
        if (PAD.hit('left')) {
          SAVE.data.set.vol = Math.max(0, SAVE.data.set.vol - 1);
          APU.setVolume(SAVE.data.set.vol / 10);
          SAVE.commit();
          APU.sfx('TICK');
        } else if (PAD.hit('right') || confirm) {
          SAVE.data.set.vol = (SAVE.data.set.vol + 1) % 11;
          APU.setVolume(SAVE.data.set.vol / 10);
          SAVE.commit();
          APU.sfx('TICK');
        }
      } else if (this.pauseCursor === 3 && confirm) { // CRT scanlines
        SAVE.data.set.crt = SAVE.data.set.crt ? 0 : 1;
        SAVE.commit();
        document.getElementById('crt-scanlines').classList.toggle('disabled', !SAVE.data.set.crt);
        APU.sfx('UI_OK');
      } else if (this.pauseCursor === 4 && confirm) { // Phosphor ghosting
        GHOST_MODE = !GHOST_MODE;
        SAVE.data.set.ghost = GHOST_MODE ? 1 : 0;
        SAVE.commit();
        APU.sfx('UI_OK');
      } else if (this.pauseCursor === 5 && confirm) { // Vibration
        SAVE.data.set.vib = SAVE.data.set.vib ? 0 : 1;
        SAVE.commit();
        APU.sfx('UI_OK');
      } else if (this.pauseCursor === 6) { // Reset data
        if (PAD.state.a || PAD.state.start) {
          this.resetHoldTimer += dt;
          if (this.resetHoldTimer >= 2.0) {
            SAVE.reset();
            this.resetHoldTimer = 0;
            APU.sfx('BOOM');
          }
        } else {
          this.resetHoldTimer = 0;
        }
      } else if (this.pauseCursor === 7 && confirm) { // Eject
        this.exitToMenu();
      } else if (PAD.hit('b')) {
        this.resumeGame();
      }
    }
  },

  render(g) {
    if (!this.powerOn) {
      g.clear(0);
      return;
    }
    if (this.mode === 'BOOT') {
      this.renderBoot(g);
    } else if (this.mode === 'MENU') {
      this.renderCarousel(g);
    } else if (this.mode === 'PREVIEW') {
      this.renderPreview(g);
    } else if (this.mode === 'GAME') {
      g.clear(0);
      if (this.activeCart && this.activeCart.render) {
        this.activeCart.render(g);
      }
    } else if (this.mode === 'PAUSE') {
      // Draw frozen game state behind pause overlay
      g.clear(0);
      if (this.activeCart && this.activeCart.render) {
        this.activeCart.render(g);
      }
      this.renderPause(g);
    }
  },

  renderBoot(g) {
    g.clear(0);
    const t = this.bootTime;

    // Fast CRT beam expansion (0.0s - 0.2s)
    if (t < 0.2) {
      const p = Math.max(0.15, t / 0.2);
      const beamW = Math.floor(p * W);
      const midY = 120;
      g.rect(Math.floor((W - beamW) / 2), midY, beamW, 2, 3);
      g.rect(Math.floor((W - beamW * 0.6) / 2), midY - 1, Math.floor(beamW * 0.6), 4, 2);
      return;
    }

    // Phase 2: Vertical phosphor bloom expansion (0.2s - 0.45s)
    if (t < 0.45) {
      const p = (t - 0.2) / 0.25;
      const bloomH = Math.min(H, Math.floor(p * H));
      const topY = Math.floor((H - bloomH) / 2);
      g.dither(0, topY, W, bloomH, 1, 2);
      g.rect(0, 119, W, 2, 3);
      return;
    }

    // Phase 3: Typing logo and OS info (0.45s - 0.85s)
    g.clear(0);
    g.dither(0, 0, W, 24, 0, 1);
    g.line(0, 24, W, 24, 2);

    const logoText = "VERDANT-100";
    const charsToShow = Math.min(logoText.length, Math.floor((t - 0.45) * 28));
    g.textC(logoText.substring(0, charsToShow), 80, 3, 2);

    if (t > 0.6) {
      g.textC("PHOSPHOR SYSTEM V1.0", 116, 2, 1);
    }
    if (t > 0.72) {
      g.textC("64KB ROM · 100 CARTRIDGES READY", 132, 1, 1);
    }
  },

  renderCarousel(g) {
    g.clear(0);

    // Header bar
    g.rect(0, 0, W, 18, 1);
    g.line(0, 18, W, 18, 2);
    g.text("VERDANT-100", 8, 6, 3);
    g.textR(this.getFilterName(), W - 8, 6, 3);

    const cart = CARTS[this.selectedCartId];
    if (!cart) return;

    // Cartridge Slot & 3D Cartridge Graphic (centered at x=128, y=100)
    const cx = 128, cy = 96;

    // Cartridge Body (56px wide, 72px high)
    const cw = 64, ch = 80;
    const left = cx - Math.floor(cw / 2);
    const top = cy - Math.floor(ch / 2);

    // Cartridge plastic shell bevels
    g.rect(left, top, cw, ch, 1);
    g.box(left, top, cw, ch, 2);
    g.line(left + 6, top, left + 6, top + 14, 2);
    g.line(left + cw - 7, top, left + cw - 7, top + 14, 2);

    // Cartridge Label area (44 x 46)
    const lx = left + 10, ly = top + 16;
    g.rect(lx, ly, 44, 46, 0);
    g.box(lx, ly, 44, 46, 2);

    // Draw 32x32 pixel art icon inside label
    if (cart.icon) {
      cart.icon(g, lx + 6, ly + 4);
    } else {
      g.rect(lx + 6, ly + 4, 32, 32, 1);
      g.textC("#" + cart.id, ly + 16, 3);
    }

    // Label bottom text (centered authentic title)
    g.rect(lx + 1, ly + 38, 42, 7, 1);
    const stickerTitle = this.getStickerTitle(cart.name);
    const tw = stickerTitle.length * 5 - 1;
    const tx = lx + 1 + Math.max(0, Math.floor((42 - tw) / 2));
    g.text(stickerTitle, tx, ly + 39, 3);

    // Left/Right Navigation Indicators
    const blink = Math.floor(Date.now() / 300) % 2 === 0;
    if (blink) {
      g.text("◀", left - 24, cy - 3, 3, 2);
      g.text("▶", left + cw + 10, cy - 3, 3, 2);
    }

    // Information Card below cartridge
    const cardY = top + ch + 10;
    g.rect(14, cardY, W - 28, 44, 1);
    g.box(14, cardY, W - 28, 44, 2);

    // ID + Name
    const idStr = String(cart.id).padStart(3, '0');
    g.text("#" + idStr + " " + cart.name, 22, cardY + 6, 3);
    g.textR(GENRES[cart.genre] || 'GENRE', W - 22, cardY + 6, 2);

    // High score & Play time
    const rec = SAVE.getScore(cart.id);
    const label = cart.scoreLabel || 'BEST';
    g.text("BEST: " + rec + " " + label, 22, cardY + 18, 2);

    const timeInSec = (SAVE.data.rec[String(cart.id)] ? SAVE.data.rec[String(cart.id)].t : 0) || 0;
    const mins = Math.floor(timeInSec / 60);
    g.textR("PLAYED: " + mins + "M", W - 22, cardY + 18, 1);

    // Action hints footer
    g.line(14, cardY + 28, W - 14, cardY + 28, 2);
    g.textC("[START / ENTER / A] PLAY   [SELECT] FILTER", cardY + 33, 3);
  },

  renderPreview(g) {
    g.clear(0);

    const cart = CARTS[this.selectedCartId];
    if (!cart) return;

    // Header
    g.rect(0, 0, W, 18, 1);
    g.line(0, 18, W, 18, 2);
    g.text("CARTRIDGE #" + String(cart.id).padStart(3, '0'), 8, 6, 3);
    g.textR(GENRES[cart.genre], W - 8, 6, 2);

    // Cartridge large icon preview and header
    const py = 24;
    g.rect(16, py, 52, 52, 1);
    g.box(16, py, 52, 52, 2);
    if (cart.icon) {
      cart.icon(g, 26, py + 10);
    } else {
      g.textC("#" + cart.id, py + 22, 3);
    }

    // Title and stats
    g.text(cart.name, 74, py + 4, 3, 2);
    g.text("GENRE: " + GENRES[cart.genre], 74, py + 22, 2);
    g.text("RECORD: " + SAVE.getScore(cart.id) + " " + (cart.scoreLabel || 'PTS'), 74, py + 33, 2);

    const playTime = (SAVE.data.rec[String(cart.id)] ? SAVE.data.rec[String(cart.id)].t : 0) || 0;
    g.text("TIME PLAYED: " + Math.floor(playTime / 60) + " MIN", 74, py + 43, 1);

    // Instructions Box
    const iy = 80;
    g.rect(16, iy, W - 32, 56, 1);
    g.box(16, iy, W - 32, 56, 2);
    g.text("CONTROLS & HOW TO PLAY:", 24, iy + 6, 3);

    const desc = cart.desc || "USE D-PAD TO MOVE. [A] ACTION. [B] CANCEL/ALT. SCORE AS HIGH AS YOU CAN!";
    const words = desc.split(' ');
    let lineStr = "";
    let lineY = iy + 18;
    for (let w of words) {
      if ((lineStr + " " + w).length > 38) {
        g.text(lineStr, 24, lineY, 2);
        lineStr = w;
        lineY += 10;
      } else {
        lineStr += (lineStr.length ? " " : "") + w;
      }
    }
    if (lineStr.length && lineY <= iy + 42) g.text(lineStr, 24, lineY, 2);

    // Difficulty / Game Speed Box
    const dy = 140;
    g.rect(16, dy, W - 32, 38, 1);
    g.box(16, dy, W - 32, 38, 2);

    const isTurnBased = this.isTurnBased(cart.id);
    if (isTurnBased) {
      g.textC("GAME TYPE: TURN-BASED (LOGIC)", dy + 8, 2);
      g.textC("NO SPEED MULTIPLIER · TAKE YOUR TIME", dy + 21, 3);
    } else {
      g.textC("SELECT DIFFICULTY / SPEED:", dy + 7, 2);
      const diffStr = "◀  " + this.getDifficultyName() + " (" + this.getSpeedMultiplier().toFixed(2) + "x)  ▶";
      g.textC(diffStr, dy + 20, 3, 2);
    }

    // Insertion animation or button prompt
    const promptY = 186;
    if (this.insertAnim > 0) {
      g.rect(64, promptY + 4, 128, 22, 2);
      g.box(64, promptY + 4, 128, 22, 3);
      g.textC("INSERTING CARTRIDGE...", promptY + 11, 3);
    } else {
      const blink = Math.floor(Date.now() / 250) % 2 === 0;
      g.textC("PRESS [START / ENTER / A] TO PLAY", promptY + 4, blink ? 3 : 2);
      if (isTurnBased) {
        g.textC("[B / ESC] RETURN TO MENU", promptY + 18, 1);
      } else {
        g.textC("[◀ / ▶] CHANGE SPEED   [B / ESC] MENU", promptY + 18, 1);
      }
    }
  },

  renderPause(g) {
    // Semi-transparent phosphor dithering over screen
    g.dither(24, 20, W - 48, H - 40, 0, 1);
    g.rect(24, 20, W - 48, H - 40, 0);
    g.box(24, 20, W - 48, H - 40, 3);

    g.textC("=== PAUSED ===", 32, 3);

    const menuItems = [
      "RESUME",
      "RESTART GAME",
      "VOLUME: [" + SAVE.data.set.vol + "]",
      "CRT SCANLINES: [" + (SAVE.data.set.crt ? "ON" : "OFF") + "]",
      "GHOST TRAILS: [" + (SAVE.data.set.ghost ? "ON" : "OFF") + "]",
      "HAPTICS: [" + (SAVE.data.set.vib ? "ON" : "OFF") + "]",
      this.resetHoldTimer > 0 ? "HOLDING A: " + (2.0 - this.resetHoldTimer).toFixed(1) + "S" : "RESET ALL DATA",
      "EJECT TO MENU"
    ];

    let startY = 56;
    for (let i = 0; i < menuItems.length; i++) {
      const isSel = (i === this.pauseCursor);
      const color = isSel ? 3 : 2;
      const prefix = isSel ? "▶ " : "  ";
      g.text(prefix + menuItems[i], 36, startY, color);
      startY += 16;
    }

    g.line(30, startY + 4, W - 30, startY + 4, 1);
    g.textC("[A] SELECT   [START] RESUME", startY + 10, 1);
  }
};
