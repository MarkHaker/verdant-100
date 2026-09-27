// js/cartridges/cart_054_deckbuilder.js
// ============================================================================
// Cartridge #054: DECKBUILDER
// Genre: RPG (5) | Slay the Spire-Style Roguelike Deckbuilder
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[54] = {
  id: 54,
  name: "DECKBUILDER",
  genre: 5,
  scoreLabel: "SCORE",
  desc: "ROGUELIKE DECKBUILDER: 3 ENERGY/TURN. DRAFT CARDS, BALANCE BLOCK & POISON TO CONQUER 10 FLOORS!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO CARTRIDGE ICON
  // Ornate playing card with broadsword and heraldic heater shield emblems
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    // Card Drop Shadow & Border
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Playing card outer frame
    g.rect(x + 3, y + 2, 26, 28, 1);
    g.box(x + 3, y + 2, 26, 28, 2);

    // Card face
    g.rect(x + 5, y + 4, 22, 24, 0);

    // Decorative inner header border
    g.line(x + 5, y + 7, x + 26, y + 7, 2);
    g.line(x + 5, y + 25, x + 26, y + 25, 2);

    // Broadsword Emblem on Left (Blade, Crossguard, Hilt & Pommel)
    g.line(x + 10, y + 9, x + 10, y + 19, 3);
    g.px(x + 10, y + 8, 3); // Tip
    g.line(x + 8, y + 20, x + 12, y + 20, 2); // Guard
    g.line(x + 10, y + 21, x + 10, y + 23, 2); // Grip
    g.px(x + 10, y + 23, 3); // Pommel

    // Heater Shield Emblem on Right (Rim, Cross, Boss)
    g.rect(x + 16, y + 11, 7, 7, 2);
    g.line(x + 17, y + 18, x + 21, y + 18, 2);
    g.px(x + 19, y + 19, 2); // Pointed shield bottom
    // Heraldic Cross on Shield
    g.line(x + 19, y + 12, x + 19, y + 17, 3);
    g.line(x + 17, y + 14, x + 21, y + 14, 3);

    // Corner pips
    g.px(x + 6, y + 5, 3);
    g.px(x + 25, y + 26, 3);
    // Sheen gleam
    g.px(x + 23, y + 4, 3);
  },

  // --------------------------------------------------------------------------
  // 2. CARD LIBRARY (15 DIVERSE CARDS)
  // --------------------------------------------------------------------------
  CARDS: {
    STRIKE: {
      id: 'STRIKE', name: 'STRIKE', cost: 1, type: 'ATK',
      dmg: 6, block: 0, desc1: '6 DMG', desc2: 'BASIC HIT'
    },
    DEFEND: {
      id: 'DEFEND', name: 'DEFEND', cost: 1, type: 'SKL',
      dmg: 0, block: 5, desc1: '5 BLOCK', desc2: 'DEFENSE'
    },
    BASH: {
      id: 'BASH', name: 'BASH', cost: 2, type: 'ATK',
      dmg: 8, block: 0, vuln: 2, desc1: '8 DMG', desc2: '+2 VULN'
    },
    POISON_DART: {
      id: 'POISON_DART', name: 'P.DART', fullName: 'POISON DART', cost: 1, type: 'ATK',
      dmg: 3, block: 0, poison: 4, desc1: '3 DMG', desc2: '+4 POISON'
    },
    IRON_WAVE: {
      id: 'IRON_WAVE', name: 'IR.WAVE', fullName: 'IRON WAVE', cost: 1, type: 'ATK',
      dmg: 5, block: 5, desc1: '5 DMG', desc2: '+5 BLOCK'
    },
    SHRUG_IT_OFF: {
      id: 'SHRUG_IT_OFF', name: 'SHRUG', fullName: 'SHRUG IT OFF', cost: 1, type: 'SKL',
      dmg: 0, block: 8, draw: 1, desc1: '8 BLOCK', desc2: 'DRAW 1'
    },
    CATALYST: {
      id: 'CATALYST', name: 'CATAL', fullName: 'CATALYST', cost: 1, type: 'SKL',
      special: 'CATALYST', desc1: '2X POISON', desc2: 'MULTIPLY'
    },
    HEAVY_BLADE: {
      id: 'HEAVY_BLADE', name: 'H.BLADE', fullName: 'HEAVY BLADE', cost: 2, type: 'ATK',
      dmg: 14, special: 'HEAVY_BLADE', desc1: '14 DMG', desc2: '+3X STR'
    },
    INFLAME: {
      id: 'INFLAME', name: 'INFLAME', cost: 1, type: 'PWR',
      str: 2, desc1: '+2 STR', desc2: 'POWER'
    },
    WHIRLWIND: {
      id: 'WHIRLWIND', name: 'WHIRL', fullName: 'WHIRLWIND', cost: 2, type: 'ATK',
      dmg: 12, desc1: '12 DMG', desc2: 'HEAVY SWP'
    },
    BATTLE_TRANCE: {
      id: 'BATTLE_TRANCE', name: 'TRANCE', fullName: 'BATTLE TRANCE', cost: 0, type: 'SKL',
      draw: 3, desc1: 'DRAW 3', desc2: 'TACTICS'
    },
    DEADLY_POISON: {
      id: 'DEADLY_POISON', name: 'D.POISN', fullName: 'DEADLY POISN', cost: 1, type: 'SKL',
      poison: 6, desc1: '6 POISON', desc2: 'TOXIN'
    },
    IMPERVIOUS: {
      id: 'IMPERVIOUS', name: 'IMPERV', fullName: 'IMPERVIOUS', cost: 2, type: 'SKL',
      block: 15, desc1: '15 BLOCK', desc2: 'IRON WALL'
    },
    CLEAVE: {
      id: 'CLEAVE', name: 'CLEAVE', cost: 1, type: 'ATK',
      dmg: 8, desc1: '8 DMG', desc2: 'SWIFT HIT'
    },
    BLOODLETTING: {
      id: 'BLOODLETTING', name: 'BLOOD', fullName: 'BLOODLETTING', cost: 0, type: 'SKL',
      energy: 2, selfDmg: 3, desc1: '+2 EN', desc2: '-3 HP'
    }
  },

  // --------------------------------------------------------------------------
  // 3. 10 PROGRESSIVE ENEMY FOES & BOSSES
  // --------------------------------------------------------------------------
  ENEMIES: [
    {
      floor: 1, id: 'SLIME', name: 'SLIME', maxHP: 32,
      desc: 'Acidic wobbling dungeon ooze',
      patterns: [
        { type: 'ATK', val: 7, desc: 'TACKLE', icon: 'SWORD' },
        { type: 'ATK_WEAK', val: 5, weak: 1, desc: 'ACID SPIT', icon: 'SWORD' },
        { type: 'DEF', val: 8, desc: 'HARDEN', icon: 'SHIELD' }
      ]
    },
    {
      floor: 2, id: 'CULTIST', name: 'CULTIST', maxHP: 42,
      desc: 'Fanatical avian ritualist chanting dark rites',
      patterns: [
        { type: 'BUFF', val: 2, desc: 'INCANT', icon: 'FLEX' },
        { type: 'ATK', val: 7, desc: 'DARK CLAW', icon: 'SWORD' },
        { type: 'BUFF', val: 2, desc: 'RITUAL', icon: 'FLEX' },
        { type: 'ATK', val: 9, desc: 'SOUL STAB', icon: 'SWORD' }
      ]
    },
    {
      floor: 3, id: 'JAW_WORM', name: 'JAW WORM', maxHP: 52,
      desc: 'Spiked burrower with rows of razor teeth',
      patterns: [
        { type: 'ATK', val: 11, desc: 'CHOMP', icon: 'SWORD' },
        { type: 'DEF_BUFF', val: 6, str: 2, desc: 'BELLOW', icon: 'SHIELD' },
        { type: 'ATK_DEF', val: 7, block: 5, desc: 'THRASH', icon: 'SWORD' }
      ]
    },
    {
      floor: 4, id: 'GREMLIN_NOB', name: 'GREMLIN NOB', maxHP: 68,
      desc: 'Brutal elite berserker: RAGES when Skills are played!',
      isElite: true,
      patterns: [
        { type: 'BUFF', val: 2, desc: 'BELLOW', icon: 'FLEX' },
        { type: 'ATK_VULN', val: 8, vuln: 2, desc: 'SKULL CRUSH', icon: 'SWORD' },
        { type: 'ATK', val: 14, desc: 'HEAVY SLAM', icon: 'SWORD' }
      ]
    },
    {
      floor: 5, id: 'SENTRY', name: 'SENTRY', maxHP: 82,
      desc: 'Ancient brass automaton with laser emitter optics',
      patterns: [
        { type: 'ATK_MULTI', val: 5, hits: 2, desc: 'TWIN BEAM', icon: 'SWORD' },
        { type: 'DEF', val: 12, desc: 'BARRIER', icon: 'SHIELD' },
        { type: 'ATK', val: 16, desc: 'CHARGE BEAM', icon: 'SWORD' }
      ]
    },
    {
      floor: 6, id: 'SPIRE_WITCH', name: 'SPIRE WITCH', maxHP: 95,
      desc: 'Cackling crone slinging noxious curses and hexes',
      patterns: [
        { type: 'CURSE', val: 4, weak: 2, desc: 'WITCH HEX', icon: 'SKULL' },
        { type: 'DRAIN', val: 10, heal: 6, desc: 'SOUL DRAIN', icon: 'SWORD' },
        { type: 'ATK', val: 15, desc: 'DARK BOLT', icon: 'SWORD' }
      ]
    },
    {
      floor: 7, id: 'STONE_GOLEM', name: 'STONE GOLEM', maxHP: 115,
      desc: 'Massive granite construct with rune-carved fists',
      patterns: [
        { type: 'DEF', val: 18, desc: 'FORTIFY', icon: 'SHIELD' },
        { type: 'ATK', val: 18, desc: 'ROCK SLAM', icon: 'SWORD' },
        { type: 'ATK_VULN', val: 10, vuln: 2, desc: 'EARTHQUAKE', icon: 'SWORD' }
      ]
    },
    {
      floor: 8, id: 'CORRUPTED_DEMON', name: 'DEMON FIEND', maxHP: 135,
      desc: 'Fiery horned devil radiating infernal fury',
      patterns: [
        { type: 'BUFF', val: 3, desc: 'DEMON WRATH', icon: 'FLEX' },
        { type: 'ATK_POISON', val: 13, poison: 3, desc: 'HELL BREATH', icon: 'SWORD' },
        { type: 'ATK_MULTI', val: 8, hits: 2, desc: 'TORMENT CLAW', icon: 'SWORD' }
      ]
    },
    {
      floor: 9, id: 'VOID_WRAITH', name: 'VOID WRAITH', maxHP: 155,
      desc: 'Ethereal reaper floating between mortal dimensions',
      patterns: [
        { type: 'DEF_BUFF', val: 16, str: 1, desc: 'VOID SHROUD', icon: 'SHIELD' },
        { type: 'ATK_VULN', val: 16, vuln: 2, desc: 'PHASE SCYTHE', icon: 'SWORD' },
        { type: 'ATK', val: 24, desc: 'ANNIHILATE', icon: 'SWORD' }
      ]
    },
    {
      floor: 10, id: 'ARCH_DRAGON', name: 'ARCH-DRAGON', maxHP: 210,
      desc: 'Ancient Spire Sovereign! Dragon Emperor of the Realm!',
      isBoss: true,
      patterns: [
        { type: 'DEF_BUFF', val: 15, str: 3, desc: 'DRAGON ROAR', icon: 'FLEX' },
        { type: 'ATK_MULTI', val: 6, hits: 3, desc: 'TALON FLURRY', icon: 'SWORD' },
        { type: 'DEF_BUFF', val: 20, str: 2, desc: 'WYRM SCALES', icon: 'SHIELD' },
        { type: 'ATK_VULN', val: 26, vuln: 2, desc: 'CATACLYSM', icon: 'SWORD' }
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // 4. AUDIO SYSTEM WRAPPER
  // Handles standard console SFX mapping
  // --------------------------------------------------------------------------
  playSfx(name) {
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
  },

  // --------------------------------------------------------------------------
  // 5. INITIALIZATION & GAME STATE
  // --------------------------------------------------------------------------
  init() {
    this.floor = 1;
    this.maxHP = 50;
    this.playerHP = 50;
    this.playerBlock = 0;
    this.playerStrength = 0;
    this.playerVulnerable = 0;
    this.playerWeak = 0;
    this.playerPoison = 0;

    this.energy = 3;
    this.maxEnergy = 3;

    // Classic Starter Deck: 4x Strike, 4x Defend, 1x Bash, 1x Poison Dart
    this.deck = [
      'STRIKE', 'STRIKE', 'STRIKE', 'STRIKE',
      'DEFEND', 'DEFEND', 'DEFEND', 'DEFEND',
      'BASH', 'POISON_DART'
    ];

    this.drawPile = [];
    this.discardPile = [];
    this.hand = [];

    this.sel = 0;
    this.cursorZone = 0; // 0 = Hand, 1 = End Turn Button

    // Combat & Animation State
    this.state = 'COMBAT'; // 'COMBAT' | 'ENEMY_TURN' | 'DRAFT' | 'WIN' | 'GAMEOVER'
    this.enemy = null;
    this.enemyHP = 0;
    this.maxEnemyHP = 0;
    this.enemyBlock = 0;
    this.enemyStrength = 0;
    this.enemyVulnerable = 0;
    this.enemyWeak = 0;
    this.enemyPoison = 0;
    this.enemyTurnCount = 0;
    this.intent = null;

    this.enemyActTimer = 0;
    this.shakeTimer = 0;
    this.heroLunge = 0;
    this.heroFlash = 0;
    this.enemyLunge = 0;
    this.enemyFlash = 0;
    this.animTime = 0;

    this.floatingTexts = [];
    this.particles = [];

    // Drafting Rewards
    this.draftChoices = [];
    this.draftSel = 0;

    // Setup Floor 1
    this.startFloor(this.floor);
  },

  // --------------------------------------------------------------------------
  // 6. FLOOR SETUP & COMBAT CYCLES
  // --------------------------------------------------------------------------
  startFloor(fl) {
    const foeDef = this.ENEMIES[fl - 1] || this.ENEMIES[this.ENEMIES.length - 1];
    this.enemy = foeDef;
    this.maxEnemyHP = foeDef.maxHP;
    this.enemyHP = foeDef.maxHP;
    this.enemyBlock = 0;
    this.enemyStrength = 0;
    this.enemyVulnerable = 0;
    this.enemyWeak = 0;
    this.enemyPoison = 0;
    this.enemyTurnCount = 0;

    // Reset temporary combat buffs for player
    this.playerBlock = 0;
    this.playerStrength = 0;
    this.playerVulnerable = 0;
    this.playerWeak = 0;
    this.playerPoison = 0;

    // Shuffle deck into draw pile
    this.drawPile = this.shuffle([...this.deck]);
    this.discardPile = [];
    this.hand = [];

    // Calculate initial enemy intent
    this.calcEnemyIntent();

    // Start Player Turn
    this.startPlayerTurn();
  },

  startPlayerTurn() {
    this.state = 'COMBAT';
    this.energy = this.maxEnergy;
    this.playerBlock = 0; // Block shields reset each turn

    // Player Poison Damage (Directly to HP through block)
    if (this.playerPoison > 0) {
      this.playerHP -= this.playerPoison;
      this.addFloatText('-' + this.playerPoison + ' PSN', 46, 80, 3);
      this.playSfx('HURT');
      this.playerPoison = Math.max(0, this.playerPoison - 1);
      if (this.playerHP <= 0) {
        this.onGameOver();
        return;
      }
    }

    // Decrement player status durations
    if (this.playerVulnerable > 0) this.playerVulnerable--;
    if (this.playerWeak > 0) this.playerWeak--;

    // Discard any remaining cards in hand then draw 5 cards
    while (this.hand.length > 0) {
      this.discardPile.push(this.hand.pop());
    }
    this.drawCards(5);

    this.sel = 0;
    this.cursorZone = 0;
  },

  drawCards(count) {
    for (let i = 0; i < count; i++) {
      if (this.hand.length >= 7) break; // Hand limit
      if (this.drawPile.length === 0) {
        if (this.discardPile.length === 0) break;
        this.drawPile = this.shuffle([...this.discardPile]);
        this.discardPile = [];
        this.playSfx('TICK');
      }
      if (this.drawPile.length > 0) {
        this.hand.push(this.drawPile.pop());
      }
    }
  },

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  },

  calcEnemyIntent() {
    if (!this.enemy || !this.enemy.patterns) return;
    const pIdx = this.enemyTurnCount % this.enemy.patterns.length;
    const baseP = this.enemy.patterns[pIdx];
    this.intent = Object.assign({}, baseP);

    // Calculate effective attack damage taking strength, weak, vulnerable into account
    if (this.intent.val && (this.intent.type.indexOf('ATK') !== -1 || this.intent.type === 'DRAIN')) {
      let dmg = this.intent.val + this.enemyStrength;
      if (this.enemyWeak > 0) dmg = Math.floor(dmg * 0.75);
      if (this.playerVulnerable > 0) dmg = Math.floor(dmg * 1.5);
      this.intent.effectiveDmg = Math.max(1, dmg);
    }
  },

  // --------------------------------------------------------------------------
  // 7. CARD PLAYING & COMBAT ACTIONS
  // --------------------------------------------------------------------------
  playCard(idx) {
    if (idx < 0 || idx >= this.hand.length) return;
    const cardId = this.hand[idx];
    const card = this.CARDS[cardId];
    if (!card) return;

    // Check Energy
    if (this.energy < card.cost) {
      this.playSfx('ERROR');
      this.addFloatText('NO ENERGY!', 40, 92, 2);
      return;
    }

    // Spend Energy
    this.energy -= card.cost;

    // Gremlin Nob Passive: RAGES when Skills are played (+2 Strength!)
    if (this.enemy && this.enemy.id === 'GREMLIN_NOB' && card.type === 'SKL') {
      this.enemyStrength += 2;
      this.addFloatText('NOB ENRAGED! +2 STR', 184, 52, 3);
      this.playSfx('POWERUP');
      this.shakeTimer = 0.2;
      this.calcEnemyIntent();
    }

    // 1. Attack Effects
    if (card.type === 'ATK') {
      let baseDmg = card.dmg;
      if (card.special === 'HEAVY_BLADE') {
        baseDmg = 14 + (this.playerStrength * 3);
      } else {
        baseDmg += this.playerStrength;
      }

      if (this.playerWeak > 0) baseDmg = Math.floor(baseDmg * 0.75);
      if (this.enemyVulnerable > 0) baseDmg = Math.floor(baseDmg * 1.5);
      const totalDmg = Math.max(1, baseDmg);

      // Block absorbs attack damage first
      const blocked = Math.min(this.enemyBlock, totalDmg);
      this.enemyBlock -= blocked;
      const unblocked = totalDmg - blocked;
      this.enemyHP -= unblocked;

      this.heroLunge = 0.18;
      this.enemyFlash = 0.15;
      this.shakeTimer = 0.12;
      this.playSfx('HIT');

      if (blocked > 0) {
        this.addFloatText('-' + totalDmg + ' (' + blocked + ' BLK)', 190, 75, 2);
        this.spawnSparks(195, 75, 5, 2);
      } else {
        this.addFloatText('-' + totalDmg, 195, 75, 3);
        this.spawnSparks(195, 75, 7, 3);
      }

      if (card.vuln) {
        this.enemyVulnerable += card.vuln;
        this.addFloatText('+' + card.vuln + ' VULN', 190, 60, 3);
      }
      if (card.poison) {
        this.enemyPoison += card.poison;
        this.addFloatText('+' + card.poison + ' PSN', 190, 60, 3);
      }
      if (card.block) {
        this.playerBlock += card.block;
        this.addFloatText('+' + card.block + ' BLK', 40, 75, 3);
      }
    }

    // 2. Skill Effects
    if (card.type === 'SKL') {
      if (card.block) {
        this.playerBlock += card.block;
        this.addFloatText('+' + card.block + ' BLK', 40, 75, 3);
        this.playSfx('CONFIRM');
        this.spawnSparks(40, 75, 4, 3);
      }
      if (card.draw) {
        this.drawCards(card.draw);
        this.playSfx('TICK');
      }
      if (card.poison) {
        this.enemyPoison += card.poison;
        this.addFloatText('+' + card.poison + ' PSN', 190, 60, 3);
        this.playSfx('POWERUP');
      }
      if (card.special === 'CATALYST') {
        if (this.enemyPoison > 0) {
          this.enemyPoison *= 2;
          this.addFloatText('POISON 2X! (' + this.enemyPoison + ')', 185, 58, 3);
          this.playSfx('POWERUP');
          this.spawnSparks(195, 70, 8, 3);
        } else {
          this.addFloatText('NO POISON!', 185, 58, 2);
          this.playSfx('CONFIRM');
        }
      }
      if (card.energy) {
        this.energy += card.energy;
        this.addFloatText('+' + card.energy + ' EN', 30, 110, 3);
        this.playSfx('COIN');
      }
      if (card.selfDmg) {
        this.playerHP = Math.max(1, this.playerHP - card.selfDmg);
        this.addFloatText('-' + card.selfDmg + ' HP', 40, 80, 2);
        this.playSfx('HURT');
      }
    }

    // 3. Power Effects
    if (card.type === 'PWR') {
      if (card.str) {
        this.playerStrength += card.str;
        this.addFloatText('+' + card.str + ' STR', 40, 70, 3);
        this.playSfx('POWERUP');
        this.spawnSparks(40, 75, 8, 3);
      }
    }

    // Move card from hand to discard pile
    this.hand.splice(idx, 1);
    this.discardPile.push(cardId);
    this.sel = Math.max(0, Math.min(this.hand.length - 1, this.sel));

    // Check Enemy Defeat
    if (this.enemyHP <= 0) {
      this.enemyHP = 0;
      this.onFloorWin();
      return;
    }

    // Recalculate enemy intent damage in case status changed
    this.calcEnemyIntent();
  },

  // --------------------------------------------------------------------------
  // 8. ENEMY TURN EXECUTION
  // --------------------------------------------------------------------------
  endTurn() {
    if (this.state !== 'COMBAT') return;

    // Discard any remaining cards in hand
    while (this.hand.length > 0) {
      this.discardPile.push(this.hand.pop());
    }

    this.state = 'ENEMY_TURN';
    this.enemyActTimer = 0.65;
    this.enemyBlock = 0; // Enemy block resets at turn start

    // Poison damage directly to enemy HP
    if (this.enemyPoison > 0) {
      this.enemyHP -= this.enemyPoison;
      this.addFloatText('-' + this.enemyPoison + ' PSN', 195, 75, 3);
      this.playSfx('HIT');
      this.enemyPoison = Math.max(0, this.enemyPoison - 1);
      if (this.enemyHP <= 0) {
        this.enemyHP = 0;
        this.onFloorWin();
        return;
      }
    }

    // Decrement enemy status durations
    if (this.enemyVulnerable > 0) this.enemyVulnerable--;
    if (this.enemyWeak > 0) this.enemyWeak--;
  },

  executeEnemyAction() {
    if (!this.intent || this.enemyHP <= 0) return;
    const it = this.intent;

    // 1. Attack action
    if (it.type.indexOf('ATK') !== -1 || it.type === 'DRAIN') {
      const hits = it.hits || 1;
      let totalInflicted = 0;

      for (let h = 0; h < hits; h++) {
        let dmg = it.val + this.enemyStrength;
        if (this.enemyWeak > 0) dmg = Math.floor(dmg * 0.75);
        if (this.playerVulnerable > 0) dmg = Math.floor(dmg * 1.5);
        dmg = Math.max(1, dmg);

        const blocked = Math.min(this.playerBlock, dmg);
        this.playerBlock -= blocked;
        const unblocked = dmg - blocked;
        this.playerHP -= unblocked;
        totalInflicted += dmg;
      }

      this.enemyLunge = 0.22;
      this.heroFlash = 0.18;
      this.shakeTimer = 0.18;
      this.playSfx('HURT');
      this.addFloatText('-' + totalInflicted + ' DMG', 40, 75, 3);

      if (it.vuln) {
        this.playerVulnerable += it.vuln;
        this.addFloatText('+' + it.vuln + ' VULN', 40, 60, 2);
      }
      if (it.weak) {
        this.playerWeak += it.weak;
        this.addFloatText('+' + it.weak + ' WEAK', 40, 60, 2);
      }
      if (it.poison) {
        this.playerPoison += it.poison;
        this.addFloatText('+' + it.poison + ' PSN', 40, 60, 3);
      }
      if (it.block) {
        this.enemyBlock += it.block;
        this.addFloatText('+' + it.block + ' BLK', 195, 75, 2);
      }
      if (it.type === 'DRAIN' && it.heal) {
        this.enemyHP = Math.min(this.maxEnemyHP, this.enemyHP + it.heal);
        this.addFloatText('+' + it.heal + ' HEAL', 195, 60, 3);
      }
    } else if (it.type === 'DEF' || it.type === 'DEF_BUFF') {
      this.enemyBlock += it.val;
      this.addFloatText('+' + it.val + ' BLK', 195, 75, 3);
      this.playSfx('CONFIRM');
      if (it.str) {
        this.enemyStrength += it.str;
        this.addFloatText('+' + it.str + ' STR', 190, 60, 3);
      }
    } else if (it.type === 'BUFF') {
      this.enemyStrength += it.val;
      this.addFloatText('+' + it.val + ' STR', 195, 60, 3);
      this.playSfx('POWERUP');
    } else if (it.type === 'CURSE') {
      this.playerPoison += it.val;
      this.addFloatText('+' + it.val + ' PSN', 40, 60, 3);
      if (it.weak) {
        this.playerWeak += it.weak;
        this.addFloatText('+' + it.weak + ' WEAK', 40, 72, 2);
      }
      this.playSfx('HURT');
    }

    if (this.playerHP <= 0) {
      this.playerHP = 0;
      this.onGameOver();
      return;
    }

    // Advance enemy turn counter & compute next intent
    this.enemyTurnCount++;
    this.calcEnemyIntent();
  },

  // --------------------------------------------------------------------------
  // 9. DRAFTING, VICTORY & GAME OVER FLOWS
  // --------------------------------------------------------------------------
  onFloorWin() {
    this.playSfx('EXPLODE');

    // High score update helper
    const curScore = (this.floor * 500) + (this.playerHP * 10) + (this.deck.length * 50);
    if (typeof SAVE !== 'undefined' && SAVE.setScore) {
      SAVE.setScore(54, curScore);
    }

    // Check complete campaign victory (Floor 10 cleared)
    if (this.floor >= 10) {
      this.state = 'WIN';
      this.playSfx('FANFARE');
      return;
    }

    // Victory Heal +8 HP
    this.playerHP = Math.min(this.maxHP, this.playerHP + 8);

    // Transition to Drafting
    this.state = 'DRAFT';
    this.draftChoices = this.pickDraftCards();
    this.draftSel = 0;
    this.playSfx('FANFARE');
  },

  pickDraftCards() {
    const allKeys = Object.keys(this.CARDS);
    // Exclude basic strike/defend from rewards for higher quality drafting
    const rewardKeys = allKeys.filter(k => k !== 'STRIKE' && k !== 'DEFEND');
    const shuffled = this.shuffle([...rewardKeys]);
    return shuffled.slice(0, 3);
  },

  chooseDraftReward(idx) {
    if (idx >= 0 && idx < 3) {
      const chosenCard = this.draftChoices[idx];
      this.deck.push(chosenCard);
      this.playSfx('COIN');
    } else {
      // Skipped card reward
      this.playSfx('CONFIRM');
    }

    // Advance to next floor
    this.floor++;
    this.startFloor(this.floor);
  },

  onGameOver() {
    this.state = 'GAMEOVER';
    this.playSfx('HURT');
    const floorsCleared = Math.max(0, this.floor - 1);
    const finalScore = (floorsCleared * 500) + (this.deck.length * 50);
    if (typeof SAVE !== 'undefined' && SAVE.setScore) {
      SAVE.setScore(54, finalScore);
    }
  },

  // --------------------------------------------------------------------------
  // 10. VISUAL FX HELPERS (FLOATING COMBAT TEXT & SPARKS)
  // --------------------------------------------------------------------------
  addFloatText(txt, x, y, c = 3) {
    this.floatingTexts.push({
      text: txt,
      x: x,
      y: y,
      color: c,
      life: 0.85,
      vy: -22
    });
  },

  spawnSparks(x, y, count = 5, c = 3) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 20 + Math.random() * 40;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.35,
        color: c
      });
    }
  },

  // --------------------------------------------------------------------------
  // 11. UPDATE LOOP (INPUT HANDLING & ANIMATIONS)
  // --------------------------------------------------------------------------
  update(dt) {
    this.animTime += dt;

    // Timers & Shake
    if (this.shakeTimer > 0) this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    if (this.heroLunge > 0) this.heroLunge = Math.max(0, this.heroLunge - dt);
    if (this.heroFlash > 0) this.heroFlash = Math.max(0, this.heroFlash - dt);
    if (this.enemyLunge > 0) this.enemyLunge = Math.max(0, this.enemyLunge - dt);
    if (this.enemyFlash > 0) this.enemyFlash = Math.max(0, this.enemyFlash - dt);

    // Update Floating Combat Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // ------------------------------------------------------------------------
    // State: ENEMY TURN DELAY & RESOLUTION
    // ------------------------------------------------------------------------
    if (this.state === 'ENEMY_TURN') {
      const prevTimer = this.enemyActTimer;
      this.enemyActTimer -= dt;
      // Trigger enemy attack impact at 0.3s remaining
      if (prevTimer > 0.3 && this.enemyActTimer <= 0.3) {
        this.executeEnemyAction();
      }
      // When animation finishes, begin next player turn
      if (this.enemyActTimer <= 0 && this.state === 'ENEMY_TURN') {
        this.startPlayerTurn();
      }
      return;
    }

    // Touch Input Coordinate detection
    let tapX = -1, tapY = -1;
    if (typeof PAD !== 'undefined' && PAD.tapPos) {
      tapX = PAD.tapPos.x;
      tapY = PAD.tapPos.y;
    } else if (typeof TOUCH !== 'undefined' && TOUCH && TOUCH.tapPos) {
      tapX = TOUCH.tapPos.x;
      tapY = TOUCH.tapPos.y;
    }

    // ------------------------------------------------------------------------
    // State: GAME OVER / CAMPAIGN WIN
    // ------------------------------------------------------------------------
    if (this.state === 'GAMEOVER' || this.state === 'WIN') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || (tapX >= 0 && tapY >= 0)) {
        this.playSfx('CONFIRM');
        this.init();
      }
      return;
    }

    // ------------------------------------------------------------------------
    // State: DRAFTING REWARD SCREEN
    // ------------------------------------------------------------------------
    if (this.state === 'DRAFT') {
      if (PAD.hit('left')) {
        this.draftSel = (this.draftSel - 1 + 4) % 4;
        this.playSfx('SELECT');
      }
      if (PAD.hit('right')) {
        this.draftSel = (this.draftSel + 1) % 4;
        this.playSfx('SELECT');
      }
      if (PAD.hit('up') && this.draftSel === 3) {
        this.draftSel = 1;
        this.playSfx('SELECT');
      }
      if (PAD.hit('down') && this.draftSel < 3) {
        this.draftSel = 3;
        this.playSfx('SELECT');
      }
      if (PAD.hit('a') || PAD.hit('start')) {
        this.chooseDraftReward(this.draftSel);
        return;
      }
      if (PAD.hit('b')) {
        // [B] shortcuts to skip
        this.chooseDraftReward(3);
        return;
      }

      // Touch handling on Draft Screen
      if (tapX >= 0 && tapY >= 0) {
        // Check 3 cards: x = 16, 96, 176; w = 64, h = 90, y = 60
        for (let i = 0; i < 3; i++) {
          const cx = 16 + i * 80;
          if (tapX >= cx && tapX <= cx + 64 && tapY >= 60 && tapY <= 150) {
            if (this.draftSel === i) {
              this.chooseDraftReward(i);
            } else {
              this.draftSel = i;
              this.playSfx('SELECT');
            }
            return;
          }
        }
        // Check Skip button (x: 68..188, y: 172..192)
        if (tapX >= 68 && tapX <= 188 && tapY >= 170 && tapY <= 194) {
          this.chooseDraftReward(3);
          return;
        }
      }
      return;
    }

    // ------------------------------------------------------------------------
    // State: COMBAT (PLAYER'S TURN)
    // ------------------------------------------------------------------------
    if (this.state === 'COMBAT') {
      // Shortcut: Press [B] to end turn immediately
      if (PAD.hit('b')) {
        this.playSfx('CONFIRM');
        this.endTurn();
        return;
      }

      // D-Pad Navigation
      if (this.cursorZone === 0) {
        // In Hand
        if (PAD.hit('left') && this.hand.length > 0) {
          this.sel = Math.max(0, this.sel - 1);
          this.playSfx('SELECT');
        }
        if (PAD.hit('right') && this.hand.length > 0) {
          this.sel = Math.min(this.hand.length - 1, this.sel + 1);
          this.playSfx('SELECT');
        }
        if (PAD.hit('up')) {
          this.cursorZone = 1; // Focus End Turn button
          this.playSfx('SELECT');
        }
        if (PAD.hit('a') && this.hand.length > 0) {
          this.playCard(this.sel);
          return;
        }
      } else {
        // On End Turn Button
        if (PAD.hit('down') && this.hand.length > 0) {
          this.cursorZone = 0;
          this.playSfx('SELECT');
        }
        if (PAD.hit('a') || PAD.hit('start')) {
          this.playSfx('CONFIRM');
          this.endTurn();
          return;
        }
      }

      // Touch Handling in Combat
      if (tapX >= 0 && tapY >= 0) {
        // 1. Tap on [END TURN] button: x: 88..168, y: 134..152
        if (tapX >= 88 && tapX <= 168 && tapY >= 134 && tapY <= 152) {
          this.playSfx('CONFIRM');
          this.endTurn();
          return;
        }

        // 2. Tap on Card in Hand
        const n = this.hand.length;
        if (n > 0) {
          const cardW = Math.min(46, Math.floor((244 - (n - 1) * 3) / n));
          const totalW = n * cardW + (n - 1) * 3;
          const startX = Math.floor((256 - totalW) / 2);

          for (let i = 0; i < n; i++) {
            const cx = startX + i * (cardW + 3);
            const cy = (this.cursorZone === 0 && this.sel === i) ? 154 : 160;
            if (tapX >= cx && tapX <= cx + cardW && tapY >= cy && tapY <= cy + 76) {
              if (this.cursorZone === 0 && this.sel === i) {
                // Second tap plays the card!
                this.playCard(i);
              } else {
                // First tap selects the card
                this.cursorZone = 0;
                this.sel = i;
                this.playSfx('SELECT');
              }
              return;
            }
          }
        }
      }
    }
  },

  // --------------------------------------------------------------------------
  // 12. RENDERING PIPELINE (256x240 CRT PHOSPHOR DISPLAY)
  // --------------------------------------------------------------------------
  render(g) {
    const shake = this.shakeTimer > 0 ? ((Math.random() * 4 - 2) | 0) : 0;

    // Clear phosphor screen
    g.clear(0);

    // Draw Based on Active State
    if (this.state === 'GAMEOVER') {
      this.renderGameOver(g);
      return;
    }
    if (this.state === 'WIN') {
      this.renderWinScreen(g);
      return;
    }
    if (this.state === 'DRAFT') {
      this.renderDraftScreen(g);
      return;
    }

    // 1. Top Header Bar
    this.renderHeader(g);

    // 2. Arena Dither Ground
    g.dither(0, 128 + shake, 256, 6, 0, 1);
    g.line(0, 134 + shake, 256, 134 + shake, 1);

    // 3. Hero & Stats
    this.renderHero(g, shake);

    // 4. Enemy & Stats
    this.renderEnemy(g, shake);

    // 5. Action Row (DRAW, [END TURN], DISC)
    this.renderActionRow(g);

    // 6. Card Hand
    this.renderHand(g);

    // 7. Visual FX (Sparks & Floating Combat Numbers)
    this.renderFX(g);
  },

  // --------------------------------------------------------------------------
  // 13. UI SUB-RENDERERS
  // --------------------------------------------------------------------------
  renderHeader(g) {
    g.rect(0, 0, 256, 17, 1);
    g.line(0, 17, 256, 17, 2);

    // Floor indicator
    const floorStr = this.floor >= 10 ? 'FL 10 (BOSS)' : 'FLOOR ' + this.floor + '/10';
    g.text(floorStr, 8, 6, 3);

    // Enemy Name in Center
    if (this.enemy) {
      g.textC(this.enemy.name, 6, 3);
    }

    // Best Record
    const hi = typeof SAVE !== 'undefined' && SAVE.getScore ? SAVE.getScore(54) : 0;
    g.textR('HI:' + hi, 248, 6, 2);
  },

  renderHero(g, shake) {
    const hx = 32 + (this.heroLunge > 0 ? 12 : 0) + shake;
    const hy = 58;

    // Draw Hero Pixel Knight Sprite
    this.drawHeroSprite(g, hx, hy, this.heroFlash > 0 ? 3 : 2);

    // Player HP Bar (x: 12, y: 96, w: 76, h: 8)
    g.rect(12, 96, 76, 8, 1);
    g.box(12, 96, 76, 8, 2);
    const hpFrac = Math.max(0, Math.min(1, this.playerHP / this.maxHP));
    const hpW = Math.floor(hpFrac * 74);
    if (hpW > 0) {
      g.rect(13, 97, hpW, 6, hpFrac < 0.25 ? 2 : 3);
    }
    g.text(this.playerHP + '/' + this.maxHP, 16, 97, 0);

    // Player Block Badge
    if (this.playerBlock > 0) {
      g.rect(92, 95, 28, 10, 2);
      g.box(92, 95, 28, 10, 3);
      g.text('B:' + this.playerBlock, 95, 97, 3);
    }

    // Energy Orbs (x: 12, y: 108)
    g.text('EN:', 12, 109, 3);
    for (let e = 0; e < this.maxEnergy; e++) {
      const ox = 30 + e * 11;
      if (e < this.energy) {
        g.disc(ox + 4, 112, 4, 3);
        g.circle(ox + 4, 112, 4, 2);
      } else {
        g.circle(ox + 4, 112, 4, 1);
      }
    }

    // Status Badges (x: 12, y: 120)
    let bx = 12;
    if (this.playerStrength > 0) {
      g.text('+STR ' + this.playerStrength, bx, 121, 3);
      bx += 36;
    }
    if (this.playerVulnerable > 0) {
      g.text('VULN:' + this.playerVulnerable, bx, 121, 2);
      bx += 34;
    }
    if (this.playerWeak > 0) {
      g.text('WEAK:' + this.playerWeak, bx, 121, 2);
      bx += 34;
    }
    if (this.playerPoison > 0) {
      g.text('PSN:' + this.playerPoison, bx, 121, 3);
      bx += 30;
    }
  },

  drawHeroSprite(g, x, y, col) {
    // Retro Knight (Sword & Shield)
    // Helmet & glowing visor
    g.rect(x + 8, y, 8, 7, col);
    g.line(x + 10, y + 4, x + 14, y + 4, 3); // Phosphor visor slit

    // Pauldron & Armored Cuirass
    g.rect(x + 6, y + 7, 12, 11, col);
    g.px(x + 11, y + 9, 3);
    g.px(x + 12, y + 9, 3);

    // Left Arm holding Shield
    g.rect(x + 2, y + 9, 5, 9, col);
    g.box(x + 2, y + 9, 5, 9, 3);

    // Right Arm with Broadsword
    g.line(x + 18, y + 10, x + 20, y + 14, col);
    g.line(x + 20, y + 3, x + 20, y + 15, 3); // Gleaming Blade
    g.line(x + 18, y + 15, x + 22, y + 15, col); // Guard
    g.line(x + 20, y + 16, x + 20, y + 18, col); // Grip

    // Tassets, Greaves & Boots
    g.line(x + 7, y + 18, x + 9, y + 26, col);
    g.line(x + 14, y + 18, x + 16, y + 26, col);
    g.line(x + 6, y + 26, x + 10, y + 26, col);
    g.line(x + 14, y + 26, x + 18, y + 26, col);

    // Flowing Cape behind
    g.line(x + 5, y + 9, x + 3, y + 22, 1);
  },

  renderEnemy(g, shake) {
    const ex = 188 - (this.enemyLunge > 0 ? 14 : 0) + shake;
    const ey = 56;

    // 1. Draw Intent Indicator Banner Above Enemy
    if (this.intent) {
      const it = this.intent;
      const ibx = 162, iby = 22;
      const isPulse = Math.sin(this.animTime * 8) > 0;
      g.rect(ibx, iby, 82, 14, 1);
      g.box(ibx, iby, 82, 14, isPulse ? 3 : 2);

      // Icon & Text Format
      let intentStr = '';
      if (it.type.indexOf('ATK') !== -1 || it.type === 'DRAIN') {
        const hits = it.hits ? 'x' + it.hits : '';
        intentStr = 'ATK ' + (it.effectiveDmg || it.val) + hits;
      } else if (it.type === 'DEF' || it.type === 'DEF_BUFF') {
        intentStr = 'DEF ' + it.val;
      } else if (it.type === 'BUFF') {
        intentStr = '+STR ' + it.val;
      } else if (it.type === 'CURSE') {
        intentStr = 'PSN ' + it.val;
      } else {
        intentStr = it.desc || 'ACTION';
      }
      g.textC(intentStr, iby + 4, 3);
    }

    // 2. Draw Enemy Specific Sprite
    this.drawEnemySprite(g, ex, ey, this.enemyFlash > 0 ? 3 : 2);

    // 3. Enemy HP Bar (x: 168, y: 96, w: 76, h: 8)
    g.rect(168, 96, 76, 8, 1);
    g.box(168, 96, 76, 8, 2);
    const hpFrac = Math.max(0, Math.min(1, this.enemyHP / this.maxEnemyHP));
    const hpW = Math.floor(hpFrac * 74);
    if (hpW > 0) {
      g.rect(169, 97, hpW, 6, hpFrac < 0.25 ? 2 : 3);
    }
    g.text(this.enemyHP + '/' + this.maxEnemyHP, 172, 97, 0);

    // Enemy Block Badge
    if (this.enemyBlock > 0) {
      g.rect(136, 95, 28, 10, 2);
      g.box(136, 95, 28, 10, 3);
      g.text('B:' + this.enemyBlock, 139, 97, 3);
    }

    // Status Badges (x: 168, y: 108)
    let bx = 168;
    if (this.enemyPoison > 0) {
      g.text('PSN:' + this.enemyPoison, bx, 109, 3);
      bx += 32;
    }
    if (this.enemyStrength > 0) {
      g.text('+STR ' + this.enemyStrength, bx, 109, 3);
      bx += 36;
    }
    if (this.enemyVulnerable > 0) {
      g.text('VULN:' + this.enemyVulnerable, bx, 109, 2);
      bx += 34;
    }
    if (this.enemyWeak > 0) {
      g.text('WEAK:' + this.enemyWeak, bx, 109, 2);
    }
  },

  drawEnemySprite(g, x, y, col) {
    const f = this.floor;
    const wobble = Math.sin(this.animTime * 6) * 2;

    if (f === 1) {
      // 1. SLIME (Squishy Dome)
      g.disc(x + 10, y + 12 + wobble, 12, col);
      g.px(x + 6, y + 8 + wobble, 0);
      g.px(x + 14, y + 8 + wobble, 0);
      g.px(x + 7, y + 7 + wobble, 3); // Glint
      g.px(x + 15, y + 7 + wobble, 3);
    } else if (f === 2) {
      // 2. CULTIST (Raven Mask & Staff)
      g.rect(x + 6, y + 2, 8, 10, col);
      g.line(x + 14, y + 6, x + 18, y + 9, 3); // Raven Beak
      g.rect(x + 4, y + 12, 12, 14, col); // Robe
      g.line(x + 20, y, x + 20, y + 26, 2); // Staff
      g.disc(x + 20, y + 2, 3, 3); // Skull orb
    } else if (f === 3) {
      // 3. JAW WORM (Segmented spiked beast)
      for (let s = 0; s < 4; s++) {
        g.rect(x + s * 5, y + 8 + s * 3, 7, 10, col);
        g.line(x + s * 5 + 3, y + 6 + s * 3, x + s * 5 + 3, y + 8 + s * 3, 3); // Spine
      }
      // Gaping fanged maw
      g.box(x, y + 6, 8, 12, 3);
      g.px(x + 2, y + 8, 3); g.px(x + 5, y + 8, 3);
      g.px(x + 2, y + 14, 3); g.px(x + 5, y + 14, 3);
    } else if (f === 4) {
      // 4. GREMLIN NOB (Hulking Horned Brute with Club)
      g.rect(x + 4, y + 4, 16, 22, col);
      g.line(x + 2, y, x + 6, y + 4, 3); // Left Horn
      g.line(x + 22, y, x + 18, y + 4, 3); // Right Horn
      g.px(x + 8, y + 9, 3); g.px(x + 16, y + 9, 3); // Angry red eyes
      // Spiked heavy club
      g.line(x - 3, y + 4, x + 2, y + 16, 3);
      g.disc(x - 3, y + 4, 4, col);
      g.px(x - 5, y + 2, 3); g.px(x - 1, y + 6, 3);
    } else if (f === 5) {
      // 5. SENTRY AUTOMATON (Hovering Brass Drone)
      const hover = Math.sin(this.animTime * 5) * 3;
      g.circle(x + 10, y + 12 + hover, 10, col);
      g.disc(x + 10, y + 12 + hover, 5, 3); // Glowing core optic
      g.line(x - 2, y + 12 + hover, x + 2, y + 12 + hover, 3); // Wing emitters
      g.line(x + 18, y + 12 + hover, x + 22, y + 12 + hover, 3);
      g.line(x + 8, y + 24 + hover, x + 12, y + 24 + hover, 2); // Thruster jet
    } else if (f === 6) {
      // 6. SPIRE WITCH (Pointed Hat & Cauldron Robes)
      g.tri(x + 10, y, x + 4, y + 8, x + 16, y + 8, col); // Pointed Hat
      g.line(x + 2, y + 8, x + 18, y + 8, 3); // Brim
      g.rect(x + 6, y + 10, 8, 16, col);
      g.disc(x + 18, y + 18, 4, 3); // Glowing Hex Orb
    } else if (f === 7) {
      // 7. STONE GOLEM (Massive Granite Titan)
      g.rect(x + 2, y + 2, 20, 24, col);
      g.box(x + 2, y + 2, 20, 24, 3);
      // Ancient glowing rune on chest
      g.line(x + 12, y + 8, x + 12, y + 18, 3);
      g.line(x + 7, y + 13, x + 17, y + 13, 3);
      // Massive stone boulder fist
      g.rect(x - 4, y + 14, 6, 10, col);
    } else if (f === 8) {
      // 8. CORRUPTED DEMON (Bat Wings & Horns)
      g.rect(x + 6, y + 6, 12, 18, col);
      g.line(x + 4, y + 2, x + 8, y + 6, 3); // Horns
      g.line(x + 20, y + 2, x + 16, y + 6, 3);
      // Large demon wings
      g.tri(x + 6, y + 8, x - 6, y, x - 2, y + 14, col);
      g.tri(x + 18, y + 8, x + 30, y, x + 26, y + 14, col);
      g.px(x + 9, y + 10, 3); g.px(x + 15, y + 10, 3);
    } else if (f === 9) {
      // 9. VOID WRAITH (Ethereal Reaper & Scythe)
      const sway = Math.sin(this.animTime * 4) * 2;
      g.disc(x + 10 + sway, y + 6, 6, col);
      g.px(x + 9 + sway, y + 6, 0); g.px(x + 12 + sway, y + 6, 0); // Hollow eyes
      g.tri(x + 10 + sway, y + 12, x + 2, y + 26, x + 18, y + 26, col);
      // Curved Death Scythe
      g.line(x + 18, y + 2, x + 22, y + 26, 2);
      g.line(x + 18, y + 2, x + 8, y + 5, 3);
    } else {
      // 10. ARCH-DRAGON (Spire Boss!)
      const pulse = Math.sin(this.animTime * 6) * 2;
      // Head & Jaw
      g.rect(x + 4, y + 6, 18, 14, col);
      g.line(x + 2, y + 2, x + 6, y + 6, 3); // Spiked crest
      g.line(x + 22, y + 2, x + 18, y + 6, 3);
      // Fanged Maw
      g.line(x + 2, y + 14, x + 10, y + 14, 3);
      g.px(x + 4, y + 13, 3); g.px(x + 8, y + 13, 3);
      // Dragon Wings
      g.tri(x + 6, y + 8, x - 10, y - 2 + pulse, x - 4, y + 16, col);
      g.tri(x + 18, y + 8, x + 34, y - 2 + pulse, x + 28, y + 16, col);
      // Glowing Core Eye
      g.px(x + 14, y + 9, 3);
    }
  },

  renderActionRow(g) {
    // Left: Draw pile count
    g.text('DRAW: ' + this.drawPile.length, 12, 142, 2);

    // Center: [END TURN] Button (x: 88, y: 136, w: 80, h: 14)
    const isSel = (this.cursorZone === 1);
    if (isSel) {
      g.rect(88, 136, 80, 14, 3);
      g.box(88, 136, 80, 14, 2);
      g.textC('END TURN [B]', 141, 0);
    } else {
      g.box(88, 136, 80, 14, 2);
      g.textC('END TURN [B]', 141, 2);
    }

    // Right: Discard pile count
    g.textR('DISC: ' + this.discardPile.length, 244, 142, 2);
  },

  renderHand(g) {
    const n = this.hand.length;
    if (n === 0) {
      g.textC('[NO CARDS IN HAND]', 180, 2);
      return;
    }

    // Responsive card hand layout
    const cardW = Math.min(46, Math.floor((244 - (n - 1) * 3) / n));
    const totalW = n * cardW + (n - 1) * 3;
    const startX = Math.floor((256 - totalW) / 2);

    for (let i = 0; i < n; i++) {
      const cardId = this.hand[i];
      const card = this.CARDS[cardId];
      if (!card) continue;

      const isSelected = (this.cursorZone === 0 && this.sel === i);
      const cx = startX + i * (cardW + 3);
      const cy = isSelected ? 154 : 160;
      const ch = 76;

      // Card Background & Frame
      g.rect(cx, cy, cardW, ch, 0);
      g.box(cx, cy, cardW, ch, isSelected ? 3 : 2);
      if (isSelected) {
        g.box(cx + 1, cy + 1, cardW - 2, ch - 2, 3);
      }

      // Energy Cost Gem in Top-Left (9x9 box)
      g.rect(cx + 2, cy + 2, 9, 9, 2);
      g.box(cx + 2, cy + 2, 9, 9, isSelected ? 3 : 1);
      g.text(card.cost, cx + 5, cy + 4, 3);

      // Card Title (Top row)
      g.text(card.name, cx + 13, cy + 5, isSelected ? 3 : 2);

      // Divider Line & Type Badge
      g.line(cx + 2, cy + 14, cx + cardW - 3, cy + 14, 2);
      g.text(card.type, cx + 4, cy + 17, 1);

      // Mini Emblem in Center
      this.drawCardEmblem(g, cx + Math.floor(cardW / 2), cy + 32, card.type, isSelected ? 3 : 2);

      // Card Effect Descriptions (Bottom rows)
      g.line(cx + 2, cy + 48, cx + cardW - 3, cy + 48, 1);
      g.text(card.desc1, cx + 4, cy + 52, isSelected ? 3 : 2);
      if (card.desc2) {
        g.text(card.desc2, cx + 4, cy + 62, isSelected ? 3 : 1);
      }
    }
  },

  drawCardEmblem(g, x, y, type, col) {
    if (type === 'ATK') {
      // Crossed swords
      g.line(x - 5, y - 5, x + 5, y + 5, col);
      g.line(x + 5, y - 5, x - 5, y + 5, col);
      g.px(x, y, 3);
    } else if (type === 'SKL') {
      // Shield
      g.box(x - 4, y - 5, 9, 10, col);
      g.px(x, y + 5, col);
      g.line(x, y - 3, x, y + 3, 3);
    } else {
      // Power / Flame
      g.disc(x, y, 4, col);
      g.px(x, y - 5, 3);
      g.px(x - 2, y - 3, 3);
      g.px(x + 2, y - 3, 3);
    }
  },

  renderFX(g) {
    // Render Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      g.px(Math.floor(p.x), Math.floor(p.y), p.color);
    }

    // Render Floating Combat Numbers
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      g.text(ft.text, Math.floor(ft.x), Math.floor(ft.y), ft.color);
    }
  },

  // --------------------------------------------------------------------------
  // 14. DRAFTING REWARD SCREEN
  // --------------------------------------------------------------------------
  renderDraftScreen(g) {
    g.dither(0, 0, 256, 240, 0, 1);

    // Victory Banner
    g.rect(20, 14, 216, 36, 0);
    g.box(20, 14, 216, 36, 3);
    g.textC('VICTORY! FLOOR ' + this.floor + ' CLEARED', 22, 3);
    g.textC('HEALED +8 HP  (CURRENT HP: ' + this.playerHP + '/' + this.maxHP + ')', 34, 2);

    g.textC('CHOOSE A CARD REWARD TO ADD TO YOUR DECK:', 54, 3);

    // Render 3 Draft Reward Cards
    for (let i = 0; i < 3; i++) {
      const cardId = this.draftChoices[i];
      const card = this.CARDS[cardId];
      if (!card) continue;

      const isSel = (this.draftSel === i);
      const cx = 16 + i * 80;
      const cy = isSel ? 68 : 72;
      const cw = 64, ch = 90;

      g.rect(cx, cy, cw, ch, 0);
      g.box(cx, cy, cw, ch, isSel ? 3 : 2);
      if (isSel) g.box(cx + 1, cy + 1, cw - 2, ch - 2, 3);

      // Cost badge
      g.rect(cx + 3, cy + 3, 11, 10, 2);
      g.text(card.cost, cx + 6, cy + 5, 3);

      // Title & Type
      const displayTitle = card.fullName || card.name;
      g.text(displayTitle.substring(0, 9), cx + 16, cy + 5, isSel ? 3 : 2);
      g.line(cx + 3, cy + 15, cx + cw - 4, cy + 15, 2);
      g.text(card.type, cx + 4, cy + 18, 1);

      // Card Emblem
      this.drawCardEmblem(g, cx + Math.floor(cw / 2), cy + 36, card.type, isSel ? 3 : 2);

      // Full effect description
      g.line(cx + 3, cy + 54, cx + cw - 4, cy + 54, 1);
      g.text(card.desc1, cx + 4, cy + 60, isSel ? 3 : 2);
      if (card.desc2) {
        g.text(card.desc2, cx + 4, cy + 72, isSel ? 3 : 1);
      }
    }

    // Skip Card Reward Button
    const skipSel = (this.draftSel === 3);
    if (skipSel) {
      g.rect(68, 172, 120, 18, 3);
      g.box(68, 172, 120, 18, 2);
      g.textC('[SKIP CARD REWARD]', 177, 0);
    } else {
      g.rect(68, 172, 120, 18, 0);
      g.box(68, 172, 120, 18, 2);
      g.textC('[SKIP CARD REWARD]', 177, 2);
    }

    // Controls footer
    g.textC('< >:SELECT   [A]:TAKE CARD   [B]:SKIP', 204, 2);
    g.textC('TOUCH: TAP CARD OR BUTTON TO CONFIRM', 218, 1);
  },

  // --------------------------------------------------------------------------
  // 15. GAME OVER & CAMPAIGN WIN SCREENS
  // --------------------------------------------------------------------------
  renderGameOver(g) {
    g.dither(0, 0, 256, 240, 0, 1);

    g.rect(28, 40, 200, 145, 0);
    g.box(28, 40, 200, 145, 3);

    g.textC('GAME OVER', 55, 3, 2);

    const foeName = this.enemy ? this.enemy.name : 'DUNGEON FOE';
    g.textC('SLAIN ON FLOOR ' + this.floor + ' BY ' + foeName, 85, 2);

    const floorsCleared = Math.max(0, this.floor - 1);
    const finalScore = (floorsCleared * 500) + (this.deck.length * 50);
    const hi = typeof SAVE !== 'undefined' && SAVE.getScore ? SAVE.getScore(54) : finalScore;

    g.line(40, 102, 216, 102, 2);
    g.textC('FLOORS CLEARED: ' + floorsCleared + '/10', 110, 3);
    g.textC('FINAL DECK SIZE: ' + this.deck.length + ' CARDS', 124, 2);
    g.textC('SCORE: ' + finalScore + '   BEST: ' + hi, 138, 3);
    g.line(40, 150, 216, 150, 2);

    const isBlink = Math.sin(this.animTime * 6) > 0;
    if (isBlink) {
      g.textC('[PRESS A OR TAP TO RETRY]', 162, 3);
    }
  },

  renderWinScreen(g) {
    g.dither(0, 0, 256, 240, 0, 1);

    g.rect(20, 25, 216, 185, 0);
    g.box(20, 25, 216, 185, 3);
    g.box(22, 27, 212, 181, 2);

    g.textC('VICTORY!', 38, 3, 2);
    g.textC('THE ARCH-DRAGON IS SLAIN!', 62, 3);
    g.textC('THE SPIRE HAS BEEN CONQUERED!', 74, 2);

    // Crown Trophy Pixel Emblem
    const cx = 128, cy = 94;
    g.tri(cx - 16, cy, cx + 16, cy, cx, cy + 12, 3);
    g.line(cx - 16, cy, cx - 20, cy - 8, 3);
    g.line(cx, cy, cx, cy - 10, 3);
    g.line(cx + 16, cy, cx + 20, cy - 8, 3);
    g.px(cx - 20, cy - 9, 3); g.px(cx, cy - 11, 3); g.px(cx + 20, cy - 9, 3);

    const finalScore = (10 * 500) + (this.playerHP * 10) + (this.deck.length * 50);
    const hi = typeof SAVE !== 'undefined' && SAVE.getScore ? SAVE.getScore(54) : finalScore;

    g.line(34, 120, 222, 120, 2);
    g.textC('ALL 10 FLOORS CLEARED!', 128, 3);
    g.textC('REMAINING HP: ' + this.playerHP + '/' + this.maxHP, 140, 3);
    g.textC('DECK MASTERY: ' + this.deck.length + ' CARDS', 152, 2);
    g.textC('FINAL SCORE: ' + finalScore + '   HIGH SCORE: ' + hi, 166, 3);
    g.line(34, 180, 222, 180, 2);

    const isBlink = Math.sin(this.animTime * 6) > 0;
    if (isBlink) {
      g.textC('[PRESS A OR TAP TO EMBARK AGAIN]', 190, 3);
    }
  }
};
