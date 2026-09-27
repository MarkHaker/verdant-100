// js/cartridges/cart_053_text_quest.js
// ============================================================================
// Cartridge #053: TEXT QUEST ("CRYPT OF THE OBSIDIAN CROWN")
// Genre: RPG / TEXT ADVENTURE (5)
// Deep Branching Narrative, CRT Terminal Engine, 4 Endings, Inventory & Lore
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

(function() {
  'use strict';

  // --------------------------------------------------------------------------
  // AUDIO & SOUND EFFECT DISPATCHER
  // --------------------------------------------------------------------------
  function playSfx(name) {
    if (typeof APU === 'undefined' || !APU.sfx) return;
    const sfxMap = {
      'SELECT': 'UI_MOVE',
      'CONFIRM': 'UI_OK',
      'HIT': 'HIT',
      'COIN': 'COIN',
      'ERROR': 'DENY',
      'EXPLODE': 'BOOM',
      'TICK': 'TICK',
      'FANFARE': 'LEVELUP',
      'POWERUP': 'POWER',
      'HURT': 'HURT'
    };
    try {
      APU.sfx(sfxMap[name] || name);
    } catch (_) {}
  }

  // --------------------------------------------------------------------------
  // TEXT FORMATTING & WORD-WRAPPING ENGINE (4x6 FONT, 5PX PER CHAR)
  // --------------------------------------------------------------------------
  function wrapText(str, maxChars) {
    if (!str) return [];
    maxChars = maxChars || 42;
    const words = String(str).split(' ');
    const lines = [];
    let current = '';

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (current.length === 0) {
        current = w;
      } else if (current.length + 1 + w.length <= maxChars) {
        current += ' ' + w;
      } else {
        lines.push(current);
        current = w;
      }
    }
    if (current.length > 0) lines.push(current);
    return lines;
  }

  // --------------------------------------------------------------------------
  // CRT LOCATION VIGNETTES (1-BIT PROCEDURAL RETRO GRAPHICS)
  // --------------------------------------------------------------------------
  function drawVignette(g, vx, vy, vw, vh, loc, sceneId, animTimer) {
    // Backdrop & Frame
    g.rect(vx, vy, vw, vh, 0);
    g.box(vx, vy, vw, vh, 2);
    g.px(vx, vy, 3);
    g.px(vx + vw - 1, vy, 3);
    g.px(vx, vy + vh - 1, 3);
    g.px(vx + vw - 1, vy + vh - 1, 3);

    // Decorative scanlines inside the vignette frame
    for (let sy = vy + 2; sy < vy + vh - 2; sy += 4) {
      g.line(vx + 2, sy, vx + vw - 3, sy, 1);
    }

    const cx = vx + Math.floor(vw / 2);
    const cy = vy + Math.floor(vh / 2);

    if (sceneId === 'ENDING_EXILE') {
      // Rugged sewer tunnel arch opening to daylight
      g.circle(cx, cy + 18, 28, 2);
      g.rect(cx - 32, cy + 8, 64, 18, 0);
      // Rolling sunlit mountains
      g.line(cx - 40, cy + 10, cx - 12, cy - 2, 3);
      g.line(cx - 12, cy - 2, cx + 18, cy + 12, 3);
      g.line(cx + 8, cy + 12, cx + 38, cy - 1, 3);
      // Morning Sun & Rays
      g.disc(cx + 26, cy - 8, 5, 3);
      g.line(cx + 26, cy - 16, cx + 26, cy - 14, 2);
      g.line(cx + 18, cy - 8, cx + 20, cy - 8, 2);
      g.line(cx + 32, cy - 8, cx + 34, cy - 8, 2);
      // Free silhouetted wanderer
      g.line(cx - 2, cy + 12, cx - 2, cy + 18, 3);
      g.disc(cx - 2, cy + 10, 1, 3);
      return;
    }

    if (sceneId === 'ENDING_DOOM') {
      // Dark Sovereign Throne with Glowing Obsidian Crown
      g.rect(cx - 16, cy - 4, 32, 22, 1);
      g.box(cx - 16, cy - 4, 32, 22, 2);
      g.line(cx - 12, cy - 16, cx - 12, cy - 4, 2);
      g.line(cx + 12, cy - 16, cx + 12, cy - 4, 2);
      g.line(cx - 12, cy - 16, cx + 12, cy - 16, 2);
      // Crown on player's brow
      g.disc(cx, cy - 2, 3, 3);
      g.line(cx - 5, cy - 7, cx + 5, cy - 7, 3);
      g.px(cx - 4, cy - 9, 3);
      g.px(cx, cy - 10, 3);
      g.px(cx + 4, cy - 9, 3);
      // Bowing spectral legions
      for (let s = -2; s <= 2; s += 2) {
        if (s === 0) continue;
        const bx = cx + s * 22;
        g.line(bx - 4, cy + 16, bx + 4, cy + 10, 2);
        g.disc(bx, cy + 8, 2, 1);
        g.line(bx - 6, cy + 16, bx - 2, cy + 16, 3);
      }
      return;
    }

    if (sceneId === 'ENDING_HOPE') {
      // Shattered Obsidian Crown with Radiant Celestial Light Beams
      const pulse = Math.floor((animTimer * 6) % 4);
      for (let a = 0; a < 8; a++) {
        const rad = (a * Math.PI) / 4;
        const len = 18 + pulse * 2;
        g.line(cx, cy, Math.floor(cx + Math.cos(rad) * len), Math.floor(cy + Math.sin(rad) * len), 3);
      }
      // Crown fragments exploding outward
      g.rect(cx - 8, cy - 8, 3, 3, 3);
      g.rect(cx + 6, cy - 7, 3, 2, 3);
      g.rect(cx - 5, cy + 6, 2, 3, 3);
      g.rect(cx + 7, cy + 7, 3, 3, 3);
      g.disc(cx, cy, 4, 0);
      g.circle(cx, cy, 4, 3);
      return;
    }

    if (sceneId === 'ENDING_TRUTH') {
      // 4 Floating Cosmic Glyph Tablets orbiting Celestial Portal
      g.circle(cx, cy, 14, 2);
      g.disc(cx, cy, 3, 3);
      // 4 orbital tablets
      const tPos = [
        { x: cx, y: cy - 16 },
        { x: cx + 22, y: cy },
        { x: cx, y: cy + 16 },
        { x: cx - 22, y: cy }
      ];
      for (let i = 0; i < 4; i++) {
        g.rect(tPos[i].x - 4, tPos[i].y - 5, 8, 10, 0);
        g.box(tPos[i].x - 4, tPos[i].y - 5, 8, 10, 3);
        g.px(tPos[i].x, tPos[i].y, 3);
      }
      return;
    }

    if (sceneId === 'GAME_OVER_TRAP' || sceneId === 'GAME_OVER_CHASM') {
      // Crypt skull & extinguished torch
      g.disc(cx, cy - 2, 7, 2);
      g.rect(cx - 5, cy + 3, 10, 5, 2);
      g.px(cx - 3, cy - 2, 0); // eye socket
      g.px(cx + 3, cy - 2, 0); // eye socket
      g.px(cx, cy + 1, 0);     // nasal cavity
      g.line(cx - 3, cy + 6, cx + 3, cy + 6, 0);
      // Smoke wisp
      g.line(cx + 12, cy + 10, cx + 18, cy + 2, 1);
      g.line(cx + 18, cy + 2, cx + 14, cy - 6, 2);
      return;
    }

    // Standard Location Vignettes
    switch (loc) {
      case 'VAULT': {
        // Vault Cell Bars & Moss
        for (let row = 0; row < 4; row++) {
          const ry = vy + 6 + row * 10;
          g.line(vx + 4, ry, vx + vw - 4, ry, 1);
        }
        // Iron cell bars
        for (let bx = cx - 36; bx <= cx + 36; bx += 12) {
          g.line(bx, vy + 4, bx, vy + vh - 5, 2);
        }
        // Heavy iron crossbars & padlock
        g.line(cx - 40, cy - 6, cx + 40, cy - 6, 3);
        g.line(cx - 40, cy + 8, cx + 40, cy + 8, 3);
        g.rect(cx - 4, cy - 3, 8, 8, 0);
        g.box(cx - 4, cy - 3, 8, 8, 3);
        g.px(cx, cy + 1, 3);
        // Dangling ceiling moss
        g.line(vx + 16, vy + 4, vx + 16, vy + 12, 3);
        g.line(vx + 28, vy + 4, vx + 28, vy + 9, 2);
        g.line(vx + vw - 24, vy + 4, vx + vw - 24, vy + 13, 3);
        break;
      }

      case 'CISTERN': {
        // Subterranean Aqueduct & Gargoyle Fountain
        g.line(vx + 6, cy + 8, vx + vw - 6, cy + 8, 2);
        // Water ripples
        for (let r = 0; r < 3; r++) {
          const wy = cy + 12 + r * 4;
          for (let wx = vx + 14; wx < vx + vw - 14; wx += 16) {
            g.line(wx, wy, wx + 8, wy, (r % 2 === 0) ? 2 : 1);
          }
        }
        // Gargoyle head carving
        g.rect(cx - 8, cy - 14, 16, 14, 2);
        g.box(cx - 8, cy - 14, 16, 14, 3);
        g.px(cx - 4, cy - 10, 0);
        g.px(cx + 4, cy - 10, 0);
        g.line(cx - 3, cy - 4, cx + 3, cy - 4, 0); // fanged mouth
        // Water stream falling into pool
        g.line(cx, cy - 2, cx, cy + 8, 3);
        g.px(cx - 2, cy + 9, 3);
        g.px(cx + 2, cy + 9, 3);
        break;
      }

      case 'SCRIPTORIUM': {
        // Towering Bookshelves & Great Codex Lectern
        // Left bookshelf
        g.box(cx - 60, vy + 5, 24, vh - 10, 2);
        g.line(cx - 60, cy - 4, cx - 36, cy - 4, 2);
        g.line(cx - 60, cy + 8, cx - 36, cy + 8, 2);
        for (let b = 0; b < 4; b++) {
          g.line(cx - 56 + b * 5, vy + 8, cx - 56 + b * 5, cy - 5, 1);
          g.line(cx - 56 + b * 5, cy + 9, cx - 56 + b * 5, vy + vh - 6, 1);
        }
        // Right bookshelf
        g.box(cx + 36, vy + 5, 24, vh - 10, 2);
        g.line(cx + 36, cy - 4, cx + 60, cy - 4, 2);
        g.line(cx + 36, cy + 8, cx + 60, cy + 8, 2);
        // Central Codex on reading stand
        g.line(cx - 10, cy + 8, cx, cy - 4, 3);
        g.line(cx, cy - 4, cx + 10, cy + 8, 3);
        g.line(cx - 8, cy + 12, cx + 8, cy + 12, 2);
        g.line(cx, cy + 12, cx, cy + 18, 2);
        // Flickering candle
        g.line(cx + 14, cy + 2, cx + 14, cy + 8, 2);
        const candleFlicker = Math.floor(animTimer * 8) % 2;
        g.px(cx + 14, cy - candleFlicker, 3);
        break;
      }

      case 'WHISPERS': {
        // Colossal Stone Idol & Trap Floor
        // Flanking obsidian pillars
        g.rect(cx - 50, vy + 6, 10, vh - 12, 1);
        g.box(cx - 50, vy + 6, 10, vh - 12, 2);
        g.rect(cx + 40, vy + 6, 10, vh - 12, 1);
        g.box(cx + 40, vy + 6, 10, vh - 12, 2);
        // Colossal Idol Head
        g.rect(cx - 16, cy - 14, 32, 24, 1);
        g.box(cx - 16, cy - 14, 32, 24, 2);
        // Glowing almond eyes
        const eyeColor = (Math.floor(animTimer * 4) % 2 === 0) ? 3 : 2;
        g.rect(cx - 9, cy - 6, 5, 3, eyeColor);
        g.rect(cx + 5, cy - 6, 5, 3, eyeColor);
        // Parted whispering lips
        g.rect(cx - 6, cy + 2, 12, 4, 0);
        g.box(cx - 6, cy + 2, 12, 4, 3);
        // Floating whisper glyphs
        g.text("~", cx - 22, cy - 4, 2);
        g.text("*", cx + 20, cy - 8, 2);
        break;
      }

      case 'CHASM': {
        // Gulf of Despair & Suspension Bridge
        // Left & Right jagged cliffs
        g.line(vx + 6, vy + 6, cx - 32, cy + 6, 2);
        g.line(cx - 32, cy + 6, cx - 38, vy + vh - 5, 2);
        g.line(vx + vw - 6, vy + 6, cx + 32, cy + 6, 2);
        g.line(cx + 32, cy + 6, cx + 38, vy + vh - 5, 2);
        // Sagging suspension rope bridge
        g.line(cx - 32, cy + 6, cx, cy + 12, 3);
        g.line(cx, cy + 12, cx + 32, cy + 6, 3);
        // Planks
        for (let p = -20; p <= 20; p += 8) {
          g.line(cx + p, cy + 7 + Math.floor(Math.abs(p) / 7), cx + p, cy + 10 + Math.floor(Math.abs(p) / 7), 2);
        }
        // Sharp stalactites
        g.line(cx - 14, vy + 4, cx - 14, vy + 12, 2);
        g.line(cx + 12, vy + 4, cx + 12, vy + 10, 2);
        // Crystal clusters on right
        g.line(cx + 42, cy - 2, cx + 46, cy - 8, 3);
        g.line(cx + 46, cy - 8, cx + 50, cy - 2, 3);
        break;
      }

      case 'TOMB': {
        // Sarcophagus & Ghostly Guardian
        // Sarcophagus base
        g.rect(cx - 24, cy + 4, 48, 14, 1);
        g.box(cx - 24, cy + 4, 48, 14, 2);
        g.line(cx - 20, cy + 8, cx + 20, cy + 8, 3);
        // Floating Spectral Guardian
        const floatY = cy - 8 + Math.sin(animTimer * 3) * 2;
        g.circle(cx, Math.floor(floatY), 6, 3);
        g.px(cx - 2, Math.floor(floatY), 0);
        g.px(cx + 2, Math.floor(floatY), 0);
        // Crown on ghost head
        g.line(cx - 4, Math.floor(floatY) - 7, cx + 4, Math.floor(floatY) - 7, 3);
        g.px(cx, Math.floor(floatY) - 9, 3);
        // Ethereal broadsword
        g.line(cx + 12, Math.floor(floatY) - 8, cx + 12, Math.floor(floatY) + 12, 3);
        g.line(cx + 9, Math.floor(floatY) - 4, cx + 15, Math.floor(floatY) - 4, 3);
        break;
      }

      case 'SANCTUM': {
        // The Altar & The Floating Obsidian Crown
        // Stepped basalt altar
        g.rect(cx - 30, cy + 10, 60, 10, 1);
        g.box(cx - 30, cy + 10, 60, 10, 2);
        g.rect(cx - 20, cy + 4, 40, 6, 1);
        g.box(cx - 20, cy + 4, 40, 6, 2);
        // Floating Obsidian Crown
        const crownY = cy - 8 + Math.sin(animTimer * 4) * 2;
        g.rect(cx - 10, Math.floor(crownY), 20, 6, 0);
        g.box(cx - 10, Math.floor(crownY), 20, 6, 3);
        // 5 Crown Spires
        g.line(cx - 9, Math.floor(crownY), cx - 9, Math.floor(crownY) - 5, 3);
        g.line(cx - 4, Math.floor(crownY), cx - 4, Math.floor(crownY) - 7, 3);
        g.line(cx, Math.floor(crownY), cx, Math.floor(crownY) - 9, 3);
        g.line(cx + 4, Math.floor(crownY), cx + 4, Math.floor(crownY) - 7, 3);
        g.line(cx + 9, Math.floor(crownY), cx + 9, Math.floor(crownY) - 5, 3);
        // Radiating dark power aura
        const glow = Math.floor(animTimer * 5) % 2;
        g.circle(cx, Math.floor(crownY) - 2, 14 + glow * 2, 2);
        break;
      }

      default:
        g.textC(loc, cy - 3, 2);
        break;
    }
  }

  // --------------------------------------------------------------------------
  // ITEM & GLYPH DEFINITIONS
  // --------------------------------------------------------------------------
  const ITEM_DEFS = {
    key: { name: 'BRASS KEY', desc: 'TARNISHED KEY WITH LION EMBLEM' },
    torch: { name: 'RESIN TORCH', desc: 'PINE BRANCH THAT PIERCES DARKNESS' },
    crowbar: { name: 'IRON CROWBAR', desc: 'STOUT LEVER FOR PRYING BARS & SLABS' },
    cipher: { name: 'ANCIENT CIPHER', desc: 'STONE CODEX TRANSLATING SECRET RUNES' },
    chalice: { name: 'SILVER CHALICE', desc: 'SACRED VESSEL OF PURIFYING WATER' },
    prism: { name: 'SUN PRISM', desc: 'CRYSTAL LENS FOCUSING CELESTIAL LIGHT' }
  };

  const GLYPH_DEFS = [
    { id: 1, title: 'I: GLYPH OF AMBITION', text: 'THE CROWN FEEDS ON MORTAL AMBITION.' },
    { id: 2, title: 'II: GLYPH OF PURITY', text: 'THE CISTERN YIELDS TO PURE SILVER.' },
    { id: 3, title: 'III: GLYPH OF SILENCE', text: 'THE IDOL BOWS ONLY TO SILENCE.' },
    { id: 4, title: 'IV: GLYPH OF DAWN', text: 'THE SUN PRISM SHATTERS FALSE DIVINITY.' }
  ];

  // --------------------------------------------------------------------------
  // CARTRIDGE EXPORT OBJECT
  // --------------------------------------------------------------------------
  CARTS[53] = {
    id: 53,
    name: "TEXT QUEST",
    genre: 5,
    scoreLabel: "SCORE",
    desc: "CRYPT OF THE OBSIDIAN CROWN: 4 ENDINGS, INVENTORY, CRT TERMINAL & LORE.",

    // ------------------------------------------------------------------------
    // 32x32 CRT ICON
    // ------------------------------------------------------------------------
    icon(g, x, y) {
      // Monitor Bezel
      g.rect(x, y, 32, 32, 0);
      g.box(x, y, 32, 32, 1);
      g.box(x + 1, y + 1, 30, 30, 2);
      g.rect(x + 3, y + 3, 26, 26, 0);

      // CRT Scanlines
      for (let i = 4; i < 28; i += 2) {
        g.line(x + 4, y + i, x + 27, y + i, 1);
      }

      // Terminal text prompt '>_'
      g.text(">_", x + 5, y + 5, 3);

      // Ancient Parchment Scroll
      g.rect(x + 9, y + 14, 18, 13, 0);
      g.box(x + 9, y + 14, 18, 13, 2);
      g.line(x + 8, y + 14, x + 8, y + 27, 3);   // Left roll
      g.line(x + 27, y + 14, x + 27, y + 27, 3); // Right roll
      // Scroll text lines
      g.line(x + 11, y + 17, x + 21, y + 17, 2);
      g.line(x + 11, y + 20, x + 24, y + 20, 2);
      g.line(x + 11, y + 23, x + 19, y + 23, 2);

      // Feather Quill Pen crossing scroll diagonally
      g.px(x + 6, y + 29, 3); // Nib
      g.px(x + 7, y + 28, 3);
      g.line(x + 8, y + 27, x + 18, y + 13, 2); // Shaft
      g.line(x + 9, y + 26, x + 19, y + 12, 3);
      // Feather Vane / Barbs
      g.line(x + 15, y + 15, x + 18, y + 10, 3);
      g.line(x + 18, y + 11, x + 22, y + 9, 3);
      g.line(x + 20, y + 14, x + 24, y + 11, 2);
      g.line(x + 21, y + 17, x + 25, y + 14, 2);
    },

    // ------------------------------------------------------------------------
    // LIFECYCLE: INIT
    // ------------------------------------------------------------------------
    init() {
      // Game State Variables
      this.scene = 'VAULT';
      this.inventory = [];      // Array of item keys
      this.flags = {};          // Story flags
      this.charIndex = 0;       // Typewriter progress
      this.targetText = '';     // Full raw text for current scene
      this.wrappedLines = [];   // Cached wrapped lines
      this.choiceCursor = 0;    // Currently highlighted choice
      this.choices = [];        // Contextual choices for current scene
      this.animTimer = 0;       // General animation clock
      this.inInventory = false; // Modal toggle state
      this.statusToast = '';    // Temporary notification banner
      this.toastTimer = 0;

      // Load persistent records
      if (typeof SAVE !== 'undefined') {
        const per = SAVE.getPersistent(this.id) || {};
        this.unlockedEndings = per.endings || { 1: false, 2: false, 3: false, 4: false };
        this.unlockedSecrets = per.secrets || { 1: false, 2: false, 3: false, 4: false };
        this.itemsUsed = per.itemsUsed || {};
      } else {
        this.unlockedEndings = { 1: false, 2: false, 3: false, 4: false };
        this.unlockedSecrets = { 1: false, 2: false, 3: false, 4: false };
        this.itemsUsed = {};
      }

      this.setScene('VAULT', true);
    },

    // ------------------------------------------------------------------------
    // ITEM & LORE UTILITIES
    // ------------------------------------------------------------------------
    hasItem(id) {
      return this.inventory.indexOf(id) !== -1;
    },

    addItem(id) {
      if (!this.hasItem(id)) {
        this.inventory.push(id);
        playSfx('COIN');
        this.setToast('ACQUIRED: ' + (ITEM_DEFS[id] ? ITEM_DEFS[id].name : id));
      }
    },

    markItemUsed(id) {
      this.itemsUsed[id] = true;
      this.commitScore();
    },

    discoverGlyph(num) {
      if (!this.unlockedSecrets[num]) {
        this.unlockedSecrets[num] = true;
        playSfx('POWERUP');
        this.setToast('DISCOVERED GLYPH TABLET ' + num + '/4!');
        this.commitScore();
      }
    },

    unlockEnding(num) {
      if (!this.unlockedEndings[num]) {
        this.unlockedEndings[num] = true;
        playSfx('FANFARE');
        this.commitScore();
      }
    },

    countGlyphs() {
      let count = 0;
      for (let i = 1; i <= 4; i++) {
        if (this.unlockedSecrets[i]) count++;
      }
      return count;
    },

    countEndings() {
      let count = 0;
      for (let i = 1; i <= 4; i++) {
        if (this.unlockedEndings[i]) count++;
      }
      return count;
    },

    countItemsUsed() {
      return Object.keys(this.itemsUsed).length;
    },

    calcScore() {
      const endScore = this.countEndings() * 1000;
      const secScore = this.countGlyphs() * 250;
      const itemScore = this.countItemsUsed() * 100;
      return endScore + secScore + itemScore;
    },

    commitScore() {
      const finalScore = this.calcScore();
      if (typeof SAVE !== 'undefined') {
        SAVE.setScore(this.id, finalScore);
        SAVE.setPersistent(this.id, {
          endings: this.unlockedEndings,
          secrets: this.unlockedSecrets,
          itemsUsed: this.itemsUsed
        });
      }
    },

    setToast(msg) {
      this.statusToast = String(msg).toUpperCase();
      this.toastTimer = 2.5;
    },

    getDifficulty() {
      return (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : 1;
    },

    // ------------------------------------------------------------------------
    // SCENE CONTROLLER & STORY BRANCHES
    // ------------------------------------------------------------------------
    setScene(sceneId, resetCursor = true) {
      this.scene = sceneId;
      this.charIndex = 0;
      if (resetCursor) this.choiceCursor = 0;

      const def = this.getSceneData(sceneId);
      this.targetText = def.text.toUpperCase();
      this.wrappedLines = wrapText(this.targetText, 42);
      this.choices = def.choices;
    },

    getSceneData(id) {
      const self = this;
      switch (id) {
        // --------------------------------------------------------------------
        // ROOM 1: MOSS VAULT
        // --------------------------------------------------------------------
        case 'VAULT':
          return {
            loc: 'VAULT',
            text: "YOU AWAKEN IN A DAMP STONE CELL. COLD WATER DRIPS OVER EMERALD MOSS. TO THE NORTH STANDS A MASSIVE RUSTED IRON GATE. AT YOUR FEET, A HEAVY FLOOR DRAINAGE GRATE LEADS DOWN INTO DARK DEPTHS.",
            choices: [
              {
                text: "1. SEARCH THE MOSSY RUBBLE",
                action() { self.setScene('VAULT_RUBBLE'); }
              },
              {
                text: self.flags.gateOpen ? "2. WALK THROUGH THE OPEN GATE" : "2. INSPECT THE IRON GATE",
                action() { self.setScene('VAULT_GATE'); }
              },
              {
                text: self.flags.grateOpen ? "3. CLIMB DOWN THE DRAIN CHUTE" : "3. EXAMINE THE DRAINAGE GRATE",
                action() { self.setScene('VAULT_GRATE'); }
              }
            ]
          };

        case 'VAULT_RUBBLE': {
          let desc = "YOU SIFT THROUGH THE LOOSE RUBBLE AND DEBRIS. ";
          if (!self.hasItem('torch') || !self.hasItem('crowbar')) {
            desc += "BENEATH A CRACKED SLAB YOU UNCOVER A STOUT IRON CROWBAR AND A RESIN TORCH WITH FLINT! YOU STRIKE A FLAME, PIERCING THE DANK SHADOWS.";
          } else if (!self.unlockedSecrets[1]) {
            desc += "HOLDING YOUR TORCH CLOSE, YOU SPOT A HOLLOW MORTAR BRICK. INSIDE LIES SECRET GLYPH I: 'THE CROWN FEEDS ON MORTAL AMBITION.'";
          } else {
            desc += "NOTHING REMAINS IN THE CORNER EXCEPT CRUSHED GRAVEL AND MOIST WALL MOSS.";
          }
          return {
            loc: 'VAULT',
            text: desc,
            choices: [
              {
                text: "1. RETURN TO CELL CENTER",
                action() {
                  if (!self.hasItem('torch')) self.addItem('torch');
                  if (!self.hasItem('crowbar')) self.addItem('crowbar');
                  else if (!self.unlockedSecrets[1]) {
                    self.markItemUsed('torch');
                    self.discoverGlyph(1);
                  }
                  self.setScene('VAULT');
                }
              },
              {
                text: "2. INSPECT THE IRON GATE",
                action() {
                  if (!self.hasItem('torch')) self.addItem('torch');
                  if (!self.hasItem('crowbar')) self.addItem('crowbar');
                  else if (!self.unlockedSecrets[1]) {
                    self.markItemUsed('torch');
                    self.discoverGlyph(1);
                  }
                  self.setScene('VAULT_GATE');
                }
              }
            ]
          };
        }

        case 'VAULT_GATE': {
          let desc = "";
          const opts = [];

          if (self.flags.gateOpen) {
            desc = "THE HEAVY IRON GATE STANDS OPEN. BEYOND LIES THE SUNKEN CISTERN AND THE PASSAGES LEADING TO THE REST OF THE CRYPT.";
            opts.push({
              text: "1. PROCEED TO SUNKEN CISTERN",
              action() { self.setScene('CISTERN'); }
            });
            opts.push({
              text: "2. PROCEED TO HALL OF WHISPERS",
              action() { self.setScene('HALL'); }
            });
            opts.push({
              text: "3. STEP BACK INTO THE CELL",
              action() { self.setScene('VAULT'); }
            });
          } else {
            desc = "A MASSIVE LION HEAD PADLOCK SECURES THE RUSTED IRON BARS. THE LATCH IS SOLID FORGED DWARVEN STEEL.";
            if (self.hasItem('key')) {
              opts.push({
                text: "1. UNLOCK GATE WITH BRASS KEY",
                action() {
                  self.flags.gateOpen = true;
                  self.markItemUsed('key');
                  playSfx('CONFIRM');
                  self.setToast("GATE UNLOCKED!");
                  self.setScene('VAULT_GATE');
                }
              });
            } else if (self.hasItem('crowbar')) {
              opts.push({
                text: "1. PRY THE PADLOCK WITH CROWBAR",
                action() {
                  self.flags.gateOpen = true;
                  self.markItemUsed('crowbar');
                  playSfx('CONFIRM');
                  self.setToast("GATE FORCED OPEN!");
                  self.setScene('VAULT_GATE');
                }
              });
            } else {
              opts.push({
                text: "1. [LOCKED] NEEDS BRASS KEY OR CROWBAR",
                locked: true,
                action() { playSfx('ERROR'); self.setToast("LOCKED TIGHT!"); }
              });
            }
            opts.push({
              text: "2. RETURN TO CELL CENTER",
              action() { self.setScene('VAULT'); }
            });
          }
          return { loc: 'VAULT', text: desc, choices: opts };
        }

        case 'VAULT_GRATE': {
          let desc = "";
          const opts = [];

          if (self.flags.grateOpen) {
            desc = "THE PRIED DRAINAGE GRATE REVEALS A SLICK STONE CHUTE LEADING DEEP INTO THE SUNKEN CISTERN RESERVOIR.";
            opts.push({
              text: "1. SLIDE DOWN CHUTE TO CISTERN",
              action() { self.setScene('CISTERN'); }
            });
            opts.push({
              text: "2. RETURN TO CELL CENTER",
              action() { self.setScene('VAULT'); }
            });
          } else {
            desc = "THROUGH THE RUSTED FLOOR GRATING, YOU HEAR FLOWING WATER. POLISHED METAL GLEAMS IN THE SILT BELOW, BUT THE BARS ARE WEDGED FAST.";
            if (self.hasItem('crowbar')) {
              opts.push({
                text: "1. PRY UP GRATE WITH CROWBAR",
                action() {
                  self.flags.grateOpen = true;
                  self.markItemUsed('crowbar');
                  self.addItem('chalice');
                  playSfx('CONFIRM');
                  self.setToast("ACQUIRED SILVER CHALICE!");
                  self.setScene('VAULT_GRATE');
                }
              });
            } else {
              opts.push({
                text: "1. [LOCKED] NEEDS CROWBAR TO PRY",
                locked: true,
                action() { playSfx('ERROR'); self.setToast("TOO TIGHT TO PRY BY HAND!"); }
              });
            }
            opts.push({
              text: "2. RETURN TO CELL CENTER",
              action() { self.setScene('VAULT'); }
            });
          }
          return { loc: 'VAULT', text: desc, choices: opts };
        }

        // --------------------------------------------------------------------
        // ROOM 2: SUNKEN CISTERN
        // --------------------------------------------------------------------
        case 'CISTERN':
          return {
            loc: 'CISTERN',
            text: "A VAST FLOODED UNDERGROUND RESERVOIR. MURKY WATER LAPS AGAINST SLICK WALKWAYS. A CARVED GARGOYLE FOUNTAIN SPEWS WATER TO THE NORTH. A NARROW SEWER WATERWAY FLOWS WEST.",
            choices: [
              {
                text: "1. INSPECT THE GARGOYLE FOUNTAIN",
                action() { self.setScene('CISTERN_FOUNTAIN'); }
              },
              {
                text: self.flags.poolDrained ? "2. INSPECT DRAINED BASIN" : "2. EXAMINE FLOODED CENTRAL POOL",
                action() { self.setScene('CISTERN_POOL'); }
              },
              {
                text: "3. FOLLOW WESTERN SEWER FLUME",
                action() { self.setScene('SEWER_TUNNEL'); }
              },
              {
                text: "4. CLIMB STAIRS TO SCRIPTORIUM",
                action() { self.setScene('SCRIPTORIUM'); }
              }
            ]
          };

        case 'CISTERN_FOUNTAIN': {
          let desc = "";
          const opts = [];
          if (!self.hasItem('key')) {
            desc = "COLD WATER POURS FROM THE STONE GARGOYLE'S FANGED MAW. SOMETHING METALLIC GLINTS DEEP IN ITS THROAT!";
            opts.push({
              text: "1. REACH INTO GARGOYLE'S JAWS",
              action() {
                self.addItem('key');
                self.setScene('CISTERN_FOUNTAIN');
              }
            });
          } else {
            desc = "THE GARGOYLE FOUNTAIN CONTINUES TO POUR WATER INTO THE BASIN. ITS JAWS ARE NOW EMPTY.";
            opts.push({
              text: "1. GARGOYLE JAWS ARE EMPTY",
              action() { self.setToast("KEY ALREADY TAKEN."); }
            });
          }
          opts.push({
            text: "2. RETURN TO CISTERN WALKWAY",
            action() { self.setScene('CISTERN'); }
          });
          return { loc: 'CISTERN', text: desc, choices: opts };
        }

        case 'CISTERN_POOL': {
          let desc = "";
          const opts = [];
          if (self.flags.poolDrained) {
            desc = "THE RESERVOIR HAS BEEN DRAINED TO THE BEDROCK. UPON THE CENTRAL PEDESTAL SHINES SECRET GLYPH II: 'THE CISTERN YIELDS TO SILVER.'";
            opts.push({
              text: "1. RETURN TO CISTERN WALKWAY",
              action() { self.setScene('CISTERN'); }
            });
          } else {
            desc = "TOXIC GREEN SILT CLOUDS THE BASIN. SUBMERGED AT THE BOTTOM RESTS A BRONZE LEVER, BUT THE LIQUID BURNS YOUR TOUCH.";
            if (self.hasItem('chalice')) {
              opts.push({
                text: "1. PURIFY WATER WITH SILVER CHALICE",
                action() {
                  self.flags.poolDrained = true;
                  self.markItemUsed('chalice');
                  self.discoverGlyph(2);
                  playSfx('POWERUP');
                  self.setToast("WATER PURIFIED & DRAINED!");
                  self.setScene('CISTERN_POOL');
                }
              });
            } else {
              opts.push({
                text: "1. [HAZARD] NEED PURIFYING VESSEL",
                locked: true,
                action() { playSfx('ERROR'); self.setToast("ACIDIC SILT! BURNS HANDS!"); }
              });
            }
            opts.push({
              text: "2. BACK AWAY FROM THE POOL",
              action() { self.setScene('CISTERN'); }
            });
          }
          return { loc: 'CISTERN', text: desc, choices: opts };
        }

        case 'SEWER_TUNNEL': {
          let desc = "";
          const opts = [];
          if (self.flags.sewerOpen) {
            desc = "THE SEWER FLOODGATES ARE DISLODGED! A ROARING CURRENT OF FRESH SPRINGWATER FLOWS OUTWARD TOWARD THE SURFACE WILDERNESS.";
            opts.push({
              text: "1. DIVE INTO THE WATERWAY FLUME",
              action() {
                self.unlockEnding(1);
                self.setScene('ENDING_EXILE');
              }
            });
            opts.push({
              text: "2. RETURN TO CISTERN",
              action() { self.setScene('CISTERN'); }
            });
          } else {
            desc = "HEAVY RUSTED IRON BARS BLOCK THE SEWER OUTLET PIPE. A POWERFUL DRAFT OF FRESH SURFACE AIR BLOWS THROUGH.";
            if (self.hasItem('crowbar')) {
              opts.push({
                text: "1. PRY LOOSE FLOODGATE WITH CROWBAR",
                action() {
                  self.flags.sewerOpen = true;
                  self.markItemUsed('crowbar');
                  playSfx('CONFIRM');
                  self.setToast("SEWER BARS DISLODGED!");
                  self.setScene('SEWER_TUNNEL');
                }
              });
            } else {
              opts.push({
                text: "1. [LOCKED] NEEDS CROWBAR TO DISLODGE",
                locked: true,
                action() { playSfx('ERROR'); self.setToast("BARS ARE WEDGED FAST!"); }
              });
            }
            opts.push({
              text: "2. RETURN TO CISTERN",
              action() { self.setScene('CISTERN'); }
            });
          }
          return { loc: 'CISTERN', text: desc, choices: opts };
        }

        // --------------------------------------------------------------------
        // ROOM 3: SCRIBE'S SCRIPTORIUM
        // --------------------------------------------------------------------
        case 'SCRIPTORIUM':
          return {
            loc: 'SCRIPTORIUM',
            text: "DUST-LADEN ARCHIVES STACKED WITH CRUMBLING TOMES. AN ILLUMINATED CODEX RESTS ON A STONE LECTERN. TO THE SIDE STANDS A LOCKED CABINET AND AN ALCHEMICAL WORKBENCH.",
            choices: [
              {
                text: "1. READ CODEX & EXAMINE BENCH",
                action() { self.setScene('SCRIPTORIUM_CODEX'); }
              },
              {
                text: "2. INSPECT CABINET & BOOKSHELF",
                action() { self.setScene('SCRIPTORIUM_CABINET'); }
              },
              {
                text: "3. GO EAST TO HALL OF WHISPERS",
                action() { self.setScene('HALL'); }
              },
              {
                text: "4. RETURN TO SUNKEN CISTERN",
                action() { self.setScene('CISTERN'); }
              }
            ]
          };

        case 'SCRIPTORIUM_CODEX': {
          let desc = "THE CODEX READS: 'ONLY SILENCE CAN CALM THE IDOL'S WRATH, AND ONLY THE SUN PRISM CAN CLEANSE THE CURSED CROWN.' ";
          const opts = [];
          if (!self.hasItem('prism')) {
            desc += "BESIDE THE CODEX RESTS A FLAWLESS OCTAGONAL SUN PRISM!";
            opts.push({
              text: "1. TAKE THE SUN PRISM",
              action() {
                self.addItem('prism');
                self.setScene('SCRIPTORIUM_CODEX');
              }
            });
          } else {
            desc += "THE PRISM GIMBAL SITS EMPTY BESIDE THE OPEN CODEX.";
            opts.push({
              text: "1. PRISM ALREADY TAKEN",
              action() { self.setToast("PRISM ALREADY IN INVENTORY."); }
            });
          }
          opts.push({
            text: "2. RETURN TO SCRIPTORIUM",
            action() { self.setScene('SCRIPTORIUM'); }
          });
          opts.push({
            text: "3. PROCEED TO HALL OF WHISPERS",
            action() { self.setScene('HALL'); }
          });
          return { loc: 'SCRIPTORIUM', text: desc, choices: opts };
        }

        case 'SCRIPTORIUM_CABINET': {
          let desc = "";
          const opts = [];
          if (!self.flags.cabinetOpen) {
            desc = "AN IRON-BANDED CABINET WITH A BRASS TUMBLER LOCK. ";
            if (self.hasItem('key')) {
              opts.push({
                text: "1. UNLOCK CABINET WITH BRASS KEY",
                action() {
                  self.flags.cabinetOpen = true;
                  self.markItemUsed('key');
                  self.addItem('cipher');
                  self.setScene('SCRIPTORIUM_CABINET');
                }
              });
            } else if (self.hasItem('crowbar')) {
              opts.push({
                text: "1. PRY CABINET WITH CROWBAR",
                action() {
                  self.flags.cabinetOpen = true;
                  self.markItemUsed('crowbar');
                  self.addItem('cipher');
                  self.setScene('SCRIPTORIUM_CABINET');
                }
              });
            } else {
              opts.push({
                text: "1. [LOCKED] NEEDS KEY OR CROWBAR",
                locked: true,
                action() { playSfx('ERROR'); self.setToast("LOCKED TIGHT!"); }
              });
            }
          } else {
            desc = "THE IRON-BANDED CABINET HAS BEEN OPENED AND IS EMPTY. ";
            opts.push({
              text: "1. CABINET IS EMPTY",
              action() { self.setToast("NOTHING LEFT IN CABINET."); }
            });
          }

          if (!self.unlockedSecrets[3]) {
            desc += "STRANGE RUNES ARE CARVED INTO THE BOOKSHELF. ";
            if (self.hasItem('cipher')) {
              opts.push({
                text: "2. DECIPHER BOOKSHELF RUNES",
                action() {
                  self.markItemUsed('cipher');
                  self.discoverGlyph(3);
                  self.setScene('SCRIPTORIUM_CABINET');
                }
              });
            } else {
              opts.push({
                text: "2. [LOCKED] NEEDS CIPHER",
                locked: true,
                action() { playSfx('ERROR'); self.setToast("CANNOT READ RUNES!"); }
              });
            }
          } else {
            desc += "SECRET GLYPH III SHINES IN THE REVEALED ALCOVE. ";
            opts.push({
              text: "2. GLYPH III ALREADY CLAIMED",
              action() { self.setToast("GLYPH III ALREADY CLAIMED."); }
            });
          }

          opts.push({
            text: "3. RETURN TO SCRIPTORIUM",
            action() { self.setScene('SCRIPTORIUM'); }
          });
          return { loc: 'SCRIPTORIUM', text: desc, choices: opts };
        }

        // --------------------------------------------------------------------
        // ROOM 4: HALL OF WHISPERS
        // --------------------------------------------------------------------
        case 'HALL':
          return {
            loc: 'WHISPERS',
            text: "A VAST COLONNADE OF OBSIDIAN PILLARS. GHOSTLY WHISPERS ECHO FROM THE CEILING. RAISED PRESSURE TILES LINE THE FLOOR. AT THE FAR END SITS A COLOSSAL CARVED STONE IDOL WITH BURNING RUBY EYES.",
            choices: [
              {
                text: "1. INSPECT THE FLOOR PRESSURE TILES",
                action() { self.setScene('HALL_TRAPS'); }
              },
              {
                text: self.flags.idolSolved ? "2. APPROACH THE DORMANT IDOL" : "2. CONFRONT THE WHISPERING IDOL",
                action() { self.setScene('HALL_IDOL'); }
              },
              {
                text: "3. RETURN WEST TO SCRIPTORIUM",
                action() { self.setScene('SCRIPTORIUM'); }
              },
              {
                text: "4. RETURN SOUTH TO MOSS VAULT",
                action() { self.setScene('VAULT'); }
              }
            ]
          };

        case 'HALL_TRAPS': {
          let desc = "";
          if (self.hasItem('torch')) {
            desc = "HOLDING YOUR TORCH CLOSE, YOU SPOT HIDDEN DART VENTS CONNECTED TO THE RAISED SLABS. WITH LIGHT GUIDING YOUR STEPS, YOU MARK A SAFE ZIG-ZAG PATH ACROSS THE TRAP FIELD.";
          } else {
            desc = "IN THE SHADOWS, IT IS NEARLY IMPOSSIBLE TO DISTINGUISH SAFE SLABS FROM THE TRIGGER TILES. A WRONG STEP IN THE DARK COULD SPRING DEADLY POISON DARTS!";
          }
          return {
            loc: 'WHISPERS',
            text: desc,
            choices: [
              {
                text: "1. CAREFULLY CROSS TO THE IDOL",
                action() {
                  if (!self.hasItem('torch') && self.getDifficulty() === 2) {
                    playSfx('HIT');
                    self.setScene('GAME_OVER_TRAP');
                  } else {
                    self.setScene('HALL_IDOL');
                  }
                }
              },
              {
                text: "2. RETREAT TO HALLWAY ENTRANCE",
                action() { self.setScene('HALL'); }
              }
            ]
          };
        }

        case 'HALL_IDOL': {
          let desc = "";
          const opts = [];
          if (self.flags.idolSolved) {
            desc = "THE COLOSSAL STONE IDOL'S TEETH HAVE PARTED INTO A WIDE PASSAGEWAY. THE PATH LEADS EAST TO THE CHASMS OF DESPAIR AND THE TOMB OF THE KING.";
            opts.push({
              text: "1. PROCEED TO CHASMS OF DESPAIR",
              action() { self.setScene('CHASM'); }
            });
            opts.push({
              text: "2. ENTER TOMB OF THE KING",
              action() { self.setScene('TOMB'); }
            });
            opts.push({
              text: "3. STEP BACK INTO THE HALL",
              action() { self.setScene('HALL'); }
            });
          } else {
            desc = "THE IDOL'S EYES BLAZE CRIMSON FIRE. ITS JAW GRINDS DOWNWARD AS A HOLLOW VOICE SHAKES THE HALL: 'MORTAL TRAVELER... WHAT IS SO FRAGILE THAT TO SPEAK ITS NAME IS TO BREAK IT FOREVER?'";
            opts.push({
              text: "1. ANSWER: 'A SHADOW'",
              action() { self.setScene('HALL_WRONG'); }
            });
            opts.push({
              text: "2. ANSWER: 'SILENCE'",
              action() {
                self.flags.idolSolved = true;
                playSfx('CONFIRM');
                self.setToast("RIDDLE SOLVED!");
                self.setScene('HALL_CORRECT');
              }
            });
            opts.push({
              text: "3. ANSWER: 'A SECRET'",
              action() { self.setScene('HALL_WRONG'); }
            });
            opts.push({
              text: "4. ANSWER: 'A MIRROR'",
              action() { self.setScene('HALL_WRONG'); }
            });
          }
          return { loc: 'WHISPERS', text: desc, choices: opts };
        }

        case 'HALL_CORRECT':
          return {
            loc: 'WHISPERS',
            text: "YOU UTTER: 'SILENCE.' THE RUBY EYES SOFTEN INTO CALM EMERALD GLOW. 'TRUTH DWELLS IN THE STILL VOID,' RUMBLES THE STONE. ITS MASSIVE FANGED JAWS PART WIDE, OPENING THE EASTERN ARTERIES OF THE CRYPT!",
            choices: [
              {
                text: "1. ADVANCE TO CHASMS OF DESPAIR",
                action() { self.setScene('CHASM'); }
              },
              {
                text: "2. ADVANCE TO TOMB OF THE KING",
                action() { self.setScene('TOMB'); }
              },
              {
                text: "3. RETURN TO HALL OF WHISPERS",
                action() { self.setScene('HALL'); }
              }
            ]
          };

        case 'HALL_WRONG': {
          playSfx('EXPLODE');
          return {
            loc: 'WHISPERS',
            text: "THE IDOL'S EYES FLARE BLOOD RED! 'WRONG!' A SHOCKWAVE OF TOXIC VAPOR BLASTS ACROSS THE TILES! YOU COUGH VIOLENTLY AND SCRAMBLE BACK TO THE SHADOWS, NARROWLY AVOIDING ASPHYXIATION.",
            choices: [
              {
                text: "1. REGROUP AND FACE IDOL AGAIN",
                action() { self.setScene('HALL_IDOL'); }
              },
              {
                text: "2. RETREAT TO HALLWAY ENTRANCE",
                action() { self.setScene('HALL'); }
              }
            ]
          };
        }

        // --------------------------------------------------------------------
        // ROOM 5: CHASMS OF DESPAIR
        // --------------------------------------------------------------------
        case 'CHASM':
          return {
            loc: 'CHASM',
            text: "A BOTTOMLESS ABYSS TEARS THROUGH THE CAVERN BEDROCK. ICY WINDS ROAR FROM THE DEPTHS. A FRAYED ROPE BRIDGE SPANS THE GAP. ALONG THE RIGHT WALL, CRYSTAL VEINS SPARKLE WITH MYSTICAL ENERGY.",
            choices: [
              {
                text: "1. CROSS THE FRAYED ROPE BRIDGE",
                action() { self.setScene('CHASM_BRIDGE'); }
              },
              {
                text: "2. EXAMINE SHIMMERING CRYSTALS",
                action() { self.setScene('CHASM_CRYSTALS'); }
              },
              {
                text: "3. DESCEND STAIRS TO OBSIDIAN SANCTUM",
                action() { self.setScene('SANCTUM'); }
              },
              {
                text: "4. RETURN WEST TO HALL OF WHISPERS",
                action() { self.setScene('HALL'); }
              }
            ]
          };

        case 'CHASM_BRIDGE': {
          let desc = "";
          if (self.hasItem('torch')) {
            desc = "YOUR TORCHLIGHT ILLUMINATES THE BRIDGE CLEARLY, REVEALING THREE ROTTED PLANKS. STEPPING OVER THEM WITH EASE, YOU SAFELY REACH THE ROYAL TOMB PLATFORM.";
          } else {
            desc = "IN PITCH BLACKNESS, YOU CREEP ACROSS THE SWAYING ROPES. A PLANK SNAPS UNDERFOOT! YOU LEAP FORWARD IN DESPERATION, SCRAPING ONTO THE LEDGE BY YOUR FINGERTIPS!";
          }
          return {
            loc: 'CHASM',
            text: desc,
            choices: [
              {
                text: "1. ENTER TOMB OF THE KING",
                action() { self.setScene('TOMB'); }
              },
              {
                text: "2. STEP BACK ACROSS TO CHASM",
                action() { self.setScene('CHASM'); }
              }
            ]
          };
        }

        case 'CHASM_CRYSTALS': {
          let desc = "";
          const opts = [];
          if (!self.unlockedSecrets[4]) {
            if (self.hasItem('prism')) {
              desc = "YOU HOLD UP THE SUN PRISM. ITS POLARIZED FACETS BURN AWAY THE ROCK CRUST, UNCOVERING SECRET GLYPH IV ETCHED IN BEDROCK!";
              opts.push({
                text: "1. CLAIM SECRET GLYPH IV",
                action() {
                  self.markItemUsed('prism');
                  self.discoverGlyph(4);
                  self.setScene('CHASM_CRYSTALS');
                }
              });
            } else {
              desc = "LUMINESCENT GREEN CRYSTALS SHIMMER WITH RAW RESONANCE, BUT ARE TOO BLINDING TO DECIPHER WITHOUT A LENS.";
              opts.push({
                text: "1. [LOCKED] NEEDS SUN PRISM",
                locked: true,
                action() { playSfx('ERROR'); self.setToast("BLINDING CRYSTAL GLARE!"); }
              });
            }
          } else {
            desc = "THE CRYSTAL VEIN GLOWS WITH STEADY RADIANCE, REVEALING SECRET GLYPH IV: 'THE SUN PRISM SHATTERS FALSE DIVINITY.'";
            opts.push({
              text: "1. GLYPH IV ALREADY CLAIMED",
              action() { self.setToast("GLYPH IV ALREADY CLAIMED."); }
            });
          }
          opts.push({
            text: "2. RETURN TO CHASM LEDGE",
            action() { self.setScene('CHASM'); }
          });
          return { loc: 'CHASM', text: desc, choices: opts };
        }

        // --------------------------------------------------------------------
        // ROOM 6: TOMB OF THE FORGOTTEN KING
        // --------------------------------------------------------------------
        case 'TOMB':
          return {
            loc: 'TOMB',
            text: "A MAJESTIC SEPULCHER OF BLACK POLISHED JET. UPON A RAISED MARBLE DAIS RESTS A ROYAL SARCOPHAGUS. HOVERING ABOVE FLOATS THE TRANSLUCENT SPECTER OF THE FORGOTTEN KING, BROADSIDE DRAWN!",
            choices: [
              {
                text: "1. CONFRONT THE SPECTRAL KING",
                action() { self.setScene('TOMB_GUARDIAN'); }
              },
              {
                text: (self.hasItem('chalice') && !self.flags.kingBlessed)
                  ? "2. OFFER SILVER CHALICE TO KING"
                  : "2. DECIPHER SARCOPHAGUS EPITAPH",
                action() {
                  if (self.hasItem('chalice') && !self.flags.kingBlessed) self.setScene('TOMB_CHALICE');
                  else self.setScene('TOMB_EPITAPH');
                }
              },
              {
                text: "3. ENTER THE OBSIDIAN SANCTUM",
                action() { self.setScene('SANCTUM'); }
              },
              {
                text: "4. RETURN TO CHASMS OF DESPAIR",
                action() { self.setScene('CHASM'); }
              }
            ]
          };

        case 'TOMB_GUARDIAN':
          return {
            loc: 'TOMB',
            text: "THE GHOSTLY MONARCH'S VOICE PIERCES YOUR SOUL: 'I WAS THE FIRST TO WEAR THE OBSIDIAN CROWN, AND IN MY VANITY I CURSED MY PEOPLE TO DWELL IN STONE. BEYOND THIS ARCH LIES THE CURSED ALTAR. RESIST ITS DARK CALLING, OR DIE!'",
            choices: [
              {
                text: "1. PRESENT OFFERING OF SILVER",
                action() { self.setScene('TOMB_CHALICE'); }
              },
              {
                text: "2. PROCEED TO OBSIDIAN SANCTUM",
                action() { self.setScene('SANCTUM'); }
              },
              {
                text: "3. STEP BACK TO SEPULCHER",
                action() { self.setScene('TOMB'); }
              }
            ]
          };

        case 'TOMB_CHALICE': {
          let desc = "";
          const opts = [];
          if (self.flags.kingBlessed) {
            desc = "THE SPECTRAL KING HOVERS AT PEACE, HIS SWORD RESTING AT HIS SIDE. 'MAY THY WILL STAND UNBROKEN, CHAMPION.'";
            opts.push({
              text: "1. ROYAL BLESSING RECEIVED",
              action() { self.setToast("ALREADY RECEIVED BLESSING."); }
            });
          } else if (self.hasItem('chalice')) {
            desc = "YOU RAISE THE SILVER CHALICE OF SACRED WATER. THE GHOSTLY GUARDIAN LOWERS HIS BLADE AND BOWS: 'THOU BEAREST THE WATERS OF REBIRTH. BEHOLD MY BLESSING!'";
            opts.push({
              text: "1. ACCEPT ROYAL BLESSING",
              action() {
                self.flags.kingBlessed = true;
                self.markItemUsed('chalice');
                playSfx('POWERUP');
                self.setToast("ROYAL BLESSING CONFERRED!");
                self.setScene('TOMB_CHALICE');
              }
            });
          } else {
            desc = "YOU HAVE NO SACRED RITUAL OFFERING WITH WHICH TO HONOR THE FALLEN MONARCH.";
            opts.push({
              text: "1. [LOCKED] NEEDS SILVER CHALICE",
              locked: true,
              action() { playSfx('ERROR'); self.setToast("NEED RITUAL OFFERING!"); }
            });
          }
          opts.push({
            text: "2. RETURN TO TOMB",
            action() { self.setScene('TOMB'); }
          });
          return { loc: 'TOMB', text: desc, choices: opts };
        }

        case 'TOMB_EPITAPH': {
          let desc = "";
          if (self.hasItem('cipher')) {
            desc = "USING THE ANCIENT CIPHER, YOU READ THE EPITAPH: 'WHEN ALL FOUR CELESTIAL GLYPH TABLETS REST UPON THE ALTAR, THE CURSE DISSOLVES INTO STARRY HEAVENS, BESTOWING COSMIC TRUTH UPON THE ARCHIVIST.'";
          } else {
            desc = "COMPLEX RUNIC CARVINGS RING THE SARCOPHAGUS RIM. WITHOUT THE ANCIENT CIPHER, THE SCRIPT CANNOT BE READ.";
          }
          return {
            loc: 'TOMB',
            text: desc,
            choices: [
              {
                text: "1. RETURN TO TOMB",
                action() { self.setScene('TOMB'); }
              }
            ]
          };
        }

        // --------------------------------------------------------------------
        // ROOM 7: THE OBSIDIAN SANCTUM (CLIMAX & ENDINGS)
        // --------------------------------------------------------------------
        case 'SANCTUM': {
          const glyphsFound = self.countGlyphs();
          return {
            loc: 'SANCTUM',
            text: "THE HEART OF THE CRYPT. SUSPENDED ABOVE A HIGH BASALT ALTAR FLOATS THE OBSIDIAN CROWN. DARK EMERALD LIGHTNING CRACKLES THROUGH ITS GEMSTONES, PULSING WITH TERRIBLE POWER. THE FATE OF THE REALM LIES IN YOUR HANDS.",
            choices: [
              {
                text: "1. DON THE OBSIDIAN CROWN",
                action() {
                  self.unlockEnding(2);
                  self.setScene('ENDING_DOOM');
                }
              },
              {
                text: self.hasItem('prism') ? "2. SHATTER CROWN WITH SUN PRISM" : "2. [LOCKED] NEED SUN PRISM",
                locked: !self.hasItem('prism'),
                action() {
                  if (!self.hasItem('prism')) {
                    playSfx('ERROR');
                    self.setToast("SUN PRISM REQUIRED!");
                  } else {
                    self.markItemUsed('prism');
                    self.unlockEnding(3);
                    self.setScene('ENDING_HOPE');
                  }
                }
              },
              {
                text: (glyphsFound === 4) ? "3. PLACE 4 GLYPH TABLETS ON ALTAR" : "3. [LOCKED] 4 GLYPHS (" + glyphsFound + "/4)",
                locked: (glyphsFound !== 4),
                action() {
                  if (glyphsFound !== 4) {
                    playSfx('ERROR');
                    self.setToast("ALL 4 GLYPHS NEEDED (" + glyphsFound + "/4)!");
                  } else {
                    self.unlockEnding(4);
                    self.setScene('ENDING_TRUTH');
                  }
                }
              },
              {
                text: "4. RETREAT TO TOMB OF THE KING",
                action() { self.setScene('TOMB'); }
              }
            ]
          };
        }

        // --------------------------------------------------------------------
        // ENDING 1: THE EXILE
        // --------------------------------------------------------------------
        case 'ENDING_EXILE':
          return {
            loc: 'CISTERN',
            text: "ENDING 1: THE EXILE! THE ROARING WATERWAY HURRY-FLUMES YOU THROUGH COLLAPSED CANALS OUT INTO THE OPEN NIGHT AIR! FRESH PINE BREEZES FILL YOUR LUNGS AS YOU STAND BENEATH THE TWILIGHT STARS. FREE AT LAST FROM THE CRYPT'S DANK SHADOWS!",
            choices: [
              {
                text: "1. PLAY AGAIN (NEW ADVENTURE)",
                action() { self.init(); }
              },
              {
                text: "2. VIEW INVENTORY & QUEST LOG",
                action() { self.inInventory = true; }
              },
              {
                text: "3. RETURN TO CISTERN",
                action() { self.setScene('CISTERN'); }
              }
            ]
          };

        // --------------------------------------------------------------------
        // ENDING 2: CORONATION OF DOOM
        // --------------------------------------------------------------------
        case 'ENDING_DOOM':
          return {
            loc: 'SANCTUM',
            text: "ENDING 2: CORONATION OF DOOM! YOU PLACE THE OBSIDIAN CROWN UPON YOUR BROW. TERRIFYING DARK POWER SURGES THROUGH YOUR VEINS! SPECTRAL KNIGHTS AWAKEN AND KNEEL BEFORE YOUR MIGHT. YOU SHALL RULE THE CRYPT FOR ETERNITY... BUT YOUR HUMAN SOUL IS LOST FOREVER.",
            choices: [
              {
                text: "1. PLAY AGAIN (NEW ADVENTURE)",
                action() { self.init(); }
              },
              {
                text: "2. VIEW INVENTORY & QUEST LOG",
                action() { self.inInventory = true; }
              },
              {
                text: "3. RETURN TO OBSIDIAN SANCTUM",
                action() { self.setScene('SANCTUM'); }
              }
            ]
          };

        // --------------------------------------------------------------------
        // ENDING 3: DAWN OF HOPE
        // --------------------------------------------------------------------
        case 'ENDING_HOPE':
          return {
            loc: 'SANCTUM',
            text: "ENDING 3: DAWN OF HOPE! YOU RAISE THE SUN PRISM. CONCENTRATED BEAMS OF RADIANT SUNFIRE PIERCE THE OBSIDIAN SPHERES! WITH A DEAFENING SHATTER, THE CURSED CROWN DETONATES INTO DUST! CEILING STONES CRUMBLE AS GOLDEN DAWN FLOODS THE SANCTUM, BREAKING THE CURSE!",
            choices: [
              {
                text: "1. PLAY AGAIN (NEW ADVENTURE)",
                action() { self.init(); }
              },
              {
                text: "2. VIEW INVENTORY & QUEST LOG",
                action() { self.inInventory = true; }
              },
              {
                text: "3. RETURN TO OBSIDIAN SANCTUM",
                action() { self.setScene('SANCTUM'); }
              }
            ]
          };

        // --------------------------------------------------------------------
        // ENDING 4 (SECRET): ARCHIVIST OF TRUTH
        // --------------------------------------------------------------------
        case 'ENDING_TRUTH':
          return {
            loc: 'SANCTUM',
            text: "ENDING 4 (SECRET): ARCHIVIST OF TRUTH! THE FOUR GLYPH TABLETS LOCK INTO THE ALTAR. HARMONIC WAVES TEAR OPEN A STARRY CELESTIAL VORTEX! YOU TRANSCEND MORTAL FLESH, ASCENDING AS THE ETERNAL GUARDIAN OF ANCIENT COSMIC WISDOM. TRUE TRANSCENDENCE IS YOURS!",
            choices: [
              {
                text: "1. PLAY AGAIN (NEW ADVENTURE)",
                action() { self.init(); }
              },
              {
                text: "2. VIEW INVENTORY & QUEST LOG",
                action() { self.inInventory = true; }
              },
              {
                text: "3. RETURN TO OBSIDIAN SANCTUM",
                action() { self.setScene('SANCTUM'); }
              }
            ]
          };

        // --------------------------------------------------------------------
        // GAME OVER / HAZARD STATES
        // --------------------------------------------------------------------
        case 'GAME_OVER_TRAP':
          return {
            loc: 'WHISPERS',
            text: "YOUR BLIND STEPS TRIGGER A PRESSURE TILE! A SALVO OF VENOMOUS DARTS STRIKES YOUR CHEST IN THE DARK. AS YOUR VISION DISSOLVES, THE CRYPT CLAIMS ANOTHER FALLEN SOUL.",
            choices: [
              {
                text: "1. REVIVE AT MOSS VAULT",
                action() { self.setScene('VAULT'); }
              }
            ]
          };

        case 'GAME_OVER_CHASM':
          return {
            loc: 'CHASM',
            text: "THE ROTTED PLANK SHATTERS BENEATH YOUR WEIGHT! YOU PLUNGE DOWNWARD INTO THE INKY, BOTTOMLESS GULF OF DESPAIR.",
            choices: [
              {
                text: "1. REVIVE AT HALL OF WHISPERS",
                action() { self.setScene('HALL'); }
              }
            ]
          };

        default:
          return {
            loc: 'VAULT',
            text: "YOU STAND IN THE ANCIENT CRYPT.",
            choices: [
              {
                text: "1. RETURN TO CELL",
                action() { self.setScene('VAULT'); }
              }
            ]
          };
      }
    },

    executeChoice(idx) {
      if (idx < 0 || idx >= this.choices.length) return;
      const ch = this.choices[idx];
      if (ch.locked) {
        if (ch.action) ch.action();
        return;
      }
      playSfx('CONFIRM');
      if (ch.action) ch.action();
    },

    // ------------------------------------------------------------------------
    // LIFECYCLE: UPDATE
    // ------------------------------------------------------------------------
    update(dt) {
      dt = Math.min(0.1, Math.max(0.001, dt || 0.016));
      this.animTimer += dt;

      if (this.toastTimer > 0) {
        this.toastTimer -= dt;
        if (this.toastTimer <= 0) this.statusToast = '';
      }

      // Input Polling
      const padUp = (typeof PAD !== 'undefined' && (PAD.hit('up') || PAD.swipe === 'up'));
      const padDown = (typeof PAD !== 'undefined' && (PAD.hit('down') || PAD.swipe === 'down'));
      const padA = (typeof PAD !== 'undefined' && PAD.hit('a'));
      const padB = (typeof PAD !== 'undefined' && PAD.hit('b'));

      let tapped = false;
      let tx = 0, ty = 0;
      if (typeof PAD !== 'undefined' && PAD.tapPos) {
        tapped = true;
        tx = PAD.tapPos.x;
        ty = PAD.tapPos.y;
      }

      // Handle [INV] touch button at top right (x: 210..252, y: 2..18)
      if (tapped && tx >= 210 && tx <= 252 && ty >= 2 && ty <= 18) {
        this.inInventory = !this.inInventory;
        playSfx(this.inInventory ? 'SELECT' : 'CONFIRM');
        return;
      }

      // Modal Inventory & Quest Log Handling
      if (this.inInventory) {
        if (padB || padA || (tapped && (ty > 210 || ty < 24))) {
          this.inInventory = false;
          playSfx('CONFIRM');
          return;
        }
        if (tapped) {
          this.inInventory = false;
          playSfx('CONFIRM');
          return;
        }
        return;
      }

      // Open Inventory with [B] button
      if (padB) {
        this.inInventory = true;
        playSfx('SELECT');
        return;
      }

      // Typewriter Effect handling
      const diff = this.getDifficulty();
      const speed = (diff === 0 ? 36 : (diff === 2 ? 72 : 50));

      if (this.charIndex < this.targetText.length) {
        const prevChar = Math.floor(this.charIndex);
        this.charIndex = Math.min(this.targetText.length, this.charIndex + dt * speed);
        const newChar = Math.floor(this.charIndex);

        // Sound ticker for typewriter
        if (newChar > prevChar && (newChar % 3 === 0)) {
          playSfx('TICK');
        }

        // Tap or [A] skips typewriter immediately to full text
        if (padA || (tapped && ty >= 74 && ty <= 158)) {
          this.charIndex = this.targetText.length;
          return;
        }

        // Tapping directly on a choice skips typewriter and selects choice
        if (tapped && ty >= 160 && ty <= 226 && tx >= 12 && tx <= 244) {
          this.charIndex = this.targetText.length;
          const row = Math.floor((ty - 160) / 16);
          if (row >= 0 && row < this.choices.length) {
            this.choiceCursor = row;
            this.executeChoice(row);
            return;
          }
        }
      }

      // Choice Navigation (D-pad & Touch)
      const numChoices = this.choices.length;
      if (numChoices > 0) {
        if (padUp) {
          this.choiceCursor = (this.choiceCursor - 1 + numChoices) % numChoices;
          playSfx('SELECT');
        } else if (padDown) {
          this.choiceCursor = (this.choiceCursor + 1) % numChoices;
          playSfx('SELECT');
        }

        if (padA) {
          this.executeChoice(this.choiceCursor);
          return;
        }

        // Direct Touch Tapping on Choices
        if (tapped && ty >= 160 && ty <= 226 && tx >= 12 && tx <= 244) {
          const row = Math.floor((ty - 160) / 16);
          if (row >= 0 && row < numChoices) {
            this.choiceCursor = row;
            this.executeChoice(row);
            return;
          }
        }
      }
    },

    // ------------------------------------------------------------------------
    // LIFECYCLE: RENDER
    // ------------------------------------------------------------------------
    render(g) {
      g.clear(0);

      const sceneDef = this.getSceneData(this.scene);
      const locName = sceneDef.loc || 'CRYPT';

      // 1. TOP HEADER BAR (y: 0..18)
      g.rect(0, 0, 256, 18, 0);
      g.line(0, 18, 255, 18, 1);
      g.text("[CRYPT OF OBSIDIAN CROWN]", 8, 6, 2);

      // Top right [INV] button
      g.rect(212, 3, 38, 12, this.inInventory ? 3 : 1);
      g.box(212, 3, 38, 12, 2);
      g.text("INV", 222, 6, this.inInventory ? 0 : 3);

      // 2. CRT LOCATION VIGNETTE (y: 20..72)
      drawVignette(g, 28, 20, 200, 52, locName, this.scene, this.animTimer);

      // Current location label inside vignette frame
      const titleStr = "[ " + locName + " ]";
      g.rect(128 - Math.floor((titleStr.length * 5) / 2) - 4, 21, titleStr.length * 5 + 8, 8, 0);
      g.textC(titleStr, 22, 3);

      // 3. STORY DESCRIPTION BOX (y: 74..158)
      g.rect(12, 74, 232, 84, 0);
      g.box(12, 74, 232, 84, 1);

      // Word-wrapped text display with typewriter reveal
      let charsLeft = Math.floor(this.charIndex);
      for (let i = 0; i < this.wrappedLines.length; i++) {
        const line = this.wrappedLines[i];
        const ly = 77 + i * 9;
        if (charsLeft <= 0) break;

        if (charsLeft >= line.length) {
          g.text(line, 18, ly, 3);
          charsLeft -= line.length;
        } else {
          const partial = line.substring(0, charsLeft);
          g.text(partial, 18, ly, 3);
          // Blinking typewriter cursor
          if (Math.floor(this.animTimer * 6) % 2 === 0) {
            g.text("_", 18 + partial.length * 5, ly, 3);
          }
          charsLeft = 0;
          break;
        }
      }

      // 4. CONTEXTUAL CHOICES BOX (y: 160..226)
      for (let c = 0; c < this.choices.length; c++) {
        const ch = this.choices[c];
        const cy = 161 + c * 16;
        const isSelected = (this.choiceCursor === c);

        if (isSelected) {
          g.rect(14, cy, 228, 14, 1);
          g.box(14, cy, 228, 14, 3);
          g.text("▶ " + ch.text, 18, cy + 4, 3);
        } else {
          g.rect(14, cy, 228, 14, 0);
          g.box(14, cy, 228, 14, ch.locked ? 1 : 1);
          g.text("  " + ch.text, 18, cy + 4, ch.locked ? 1 : 2);
        }
      }

      // 5. FOOTER STATUS BAR (y: 228..240)
      g.line(0, 228, 255, 228, 1);

      if (this.statusToast.length > 0) {
        g.rect(16, 230, 224, 9, 3);
        g.textC(this.statusToast, 232, 0);
      } else {
        const hint = (this.getDifficulty() === 0)
          ? "EASY: HINT [TORCH GUIDES TRAPS]"
          : "▲▼:CHOOSE  [A]:CONFIRM  [B]:INVENTORY";
        g.textC(hint, 232, 1);
      }

      // 6. MODAL INVENTORY & QUEST LOG OVERLAY
      if (this.inInventory) {
        this.renderInventoryModal(g);
      }
    },

    renderInventoryModal(g) {
      // Dark translucent backdrop
      g.dither(0, 0, 256, 240, 0, 1);

      // Modal Frame (x: 14, y: 16, w: 228, h: 208)
      g.rect(14, 16, 228, 208, 0);
      g.box(14, 16, 228, 208, 3);
      g.box(16, 18, 224, 204, 1);

      g.textC("=== INVENTORY & QUEST LOG ===", 22, 3);
      g.line(20, 31, 236, 31, 2);

      // Inventory Items (6 slots)
      g.text("--- INVENTORY SLOTS ---", 22, 35, 2);
      const allItemKeys = ['key', 'torch', 'crowbar', 'cipher', 'chalice', 'prism'];
      for (let i = 0; i < allItemKeys.length; i++) {
        const k = allItemKeys[i];
        const has = this.hasItem(k);
        const iy = 46 + i * 11;
        const itemInfo = ITEM_DEFS[k];

        if (has) {
          g.rect(22, iy, 8, 8, 2);
          g.text("★", 23, iy + 1, 3);
          g.text(itemInfo.name, 34, iy + 1, 3);
        } else {
          g.box(22, iy, 8, 8, 1);
          g.text("--- EMPTY SLOT ---", 34, iy + 1, 1);
        }
      }

      // Lore Tablets Found
      const gy = 118;
      g.line(20, gy - 4, 236, gy - 4, 2);
      const glyphCount = this.countGlyphs();
      g.text("GLYPH TABLETS FOUND (" + glyphCount + "/4):", 22, gy, 2);

      for (let gIdx = 0; gIdx < 4; gIdx++) {
        const num = gIdx + 1;
        const found = !!this.unlockedSecrets[num];
        const gRowY = gy + 10 + gIdx * 9;
        const gDef = GLYPH_DEFS[gIdx];

        if (found) {
          g.text("★ " + gDef.title, 24, gRowY, 3);
        } else {
          g.text("? GLYPH " + num + ": [UNDISCOVERED]", 24, gRowY, 1);
        }
      }

      // Endings & Score Status
      const ey = 162;
      g.line(20, ey - 4, 236, ey - 4, 2);
      const endingsCount = this.countEndings();
      g.text("ENDINGS DISCOVERED (" + endingsCount + "/4):", 22, ey, 2);

      const endNames = ["EXILE", "DOOM", "HOPE", "TRUTH"];
      let endTags = "";
      for (let e = 1; e <= 4; e++) {
        endTags += (this.unlockedEndings[e] ? "[" + endNames[e-1] + "] " : "[???] ");
      }
      g.text(endTags, 24, ey + 10, 3);

      // Score display
      const currentScore = this.calcScore();
      g.text("DISCOVERY SCORE: " + currentScore + " PTS", 24, ey + 23, 3);

      // Close button banner
      g.rect(22, 198, 212, 14, 1);
      g.box(22, 198, 212, 14, 3);
      g.textC("[B] OR TAP TO RESUME QUEST", 202, 3);
    },

    // ------------------------------------------------------------------------
    // PERSISTENCE (SAVE / LOAD STATE)
    // ------------------------------------------------------------------------
    save() {
      return {
        scene: this.scene,
        inventory: Array.from(this.inventory),
        flags: Object.assign({}, this.flags),
        itemsUsed: Object.assign({}, this.itemsUsed),
        unlockedEndings: Object.assign({}, this.unlockedEndings),
        unlockedSecrets: Object.assign({}, this.unlockedSecrets)
      };
    },

    load(data) {
      if (!data) return;
      if (data.scene) this.scene = data.scene;
      if (Array.isArray(data.inventory)) this.inventory = data.inventory.slice();
      if (data.flags) this.flags = Object.assign({}, data.flags);
      if (data.itemsUsed) this.itemsUsed = Object.assign({}, data.itemsUsed);
      if (data.unlockedEndings) this.unlockedEndings = Object.assign({}, data.unlockedEndings);
      if (data.unlockedSecrets) this.unlockedSecrets = Object.assign({}, data.unlockedSecrets);
      this.setScene(this.scene || 'VAULT', true);
    }
  };
})();
