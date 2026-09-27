// js/cartridges/cart_057_alchemy_desk.js
// ============================================================================
// Cartridge #057: ALCHEMY DESK (Little Alchemy / Retro Transmutation Engine)
// ============================================================================
// Complete overhaul:
// 1. 38 Discoverable Elements across 6 progressive tiers (from Primordial to Magnum Opus).
// 2. 51 Bidirectional Alchemical Recipes culminating in the PHILOSOPHER'S STONE.
// 3. Fully animated CRT Retort Apparatus: boiling liquid, rising bubbles, swan neck
//    condensation tube, dripping distillate flask, and flickering alcohol burner.
// 4. Two interactive ingredient beakers (Slot 1 & Slot 2) with meniscus and glowing reagents.
// 5. Scrollable 3-page element library shelf with custom handcrafted 8x8 glyphs for all 38 elements.
// 6. Ancient Alchemical Grimoire Hint System with poetic riddles for undiscovered recipes.
// 7. Full Touch & D-pad controls: tap beakers, tap shelf items, tap action buttons, swipe pages.
// 8. Dynamic particle systems: celebration stars, boiling bubbles, and grey smoke on inert mixtures.
// 9. Persistent save state (discovered elements, recipes, high score) via SAVE manager.
// 10. 32x32 retro phosphor console icon of alembic, boiling potion, and celestial sparks.
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

(function() {
  'use strict';

  // --------------------------------------------------------------------------
  // AUDIO HELPER (Safe fallback mapping to APU sound effects)
  // --------------------------------------------------------------------------
  function playSfx(name) {
    if (typeof APU === 'undefined' || !APU || !APU.sfx) return;
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
  // 38 DISCOVERABLE ELEMENTS ACROSS 6 TIERS
  // --------------------------------------------------------------------------
  const ELEMENTS = {
    FIRE: {
      id: 0, key: 'FIRE', name: 'FIRE', tag: 'FIRE', tier: 1, tierName: 'PRIMORDIAL',
      desc: 'PRIMORDIAL FLAME OF TRANSFORMATION.',
      icon: [0x10, 0x30, 0x78, 0x7c, 0xde, 0xee, 0x7c, 0x38]
    },
    WATER: {
      id: 1, key: 'WATER', name: 'WATER', tag: 'WATR', tier: 1, tierName: 'PRIMORDIAL',
      desc: 'PRISTINE ESSENCE OF FLUIDITY.',
      icon: [0x10, 0x38, 0x38, 0x7c, 0x6c, 0xce, 0x7c, 0x38]
    },
    EARTH: {
      id: 2, key: 'EARTH', name: 'EARTH', tag: 'ERTH', tier: 1, tierName: 'PRIMORDIAL',
      desc: 'SOLID FOUNDATION OF MATTER.',
      icon: [0x00, 0x10, 0x38, 0x7c, 0xee, 0xff, 0xb5, 0xff]
    },
    AIR: {
      id: 3, key: 'AIR', name: 'AIR', tag: ' AIR', tier: 1, tierName: 'PRIMORDIAL',
      desc: 'INVISIBLY SWIFT BREATH OF HEAVEN.',
      icon: [0x78, 0x0c, 0xf8, 0x00, 0x3e, 0xc0, 0x78, 0x00]
    },

    // Tier 2: Dualities & Phenomena
    STEAM: {
      id: 4, key: 'STEAM', name: 'STEAM', tag: 'STEM', tier: 2, tierName: 'DUALITY',
      desc: 'SCALDING VAPOR BORN OF FIRE AND WATER.',
      icon: [0x48, 0x24, 0x48, 0x24, 0x48, 0x00, 0x7e, 0x3c]
    },
    LAVA: {
      id: 5, key: 'LAVA', name: 'LAVA', tag: 'LAVA', tier: 2, tierName: 'DUALITY',
      desc: 'MOLTEN ROCK FLOWING FROM THE INFERNO.',
      icon: [0x7e, 0xff, 0x76, 0x22, 0x33, 0x31, 0x10, 0x00]
    },
    MUD: {
      id: 6, key: 'MUD', name: 'MUD', tag: ' MUD', tier: 2, tierName: 'DUALITY',
      desc: 'FERTILE SLIME AT THE BIRTH OF SHORES.',
      icon: [0x00, 0x34, 0x7e, 0xff, 0xef, 0x7e, 0x3c, 0x00]
    },
    ENERGY: {
      id: 7, key: 'ENERGY', name: 'ENERGY', tag: 'ENRG', tier: 2, tierName: 'DUALITY',
      desc: 'PURE DYNAMIC ESSENCE DRIVING MOTION.',
      icon: [0x0c, 0x18, 0x30, 0x7e, 0x0c, 0x18, 0x30, 0x20]
    },
    RAIN: {
      id: 8, key: 'RAIN', name: 'RAIN', tag: 'RAIN', tier: 2, tierName: 'DUALITY',
      desc: 'HEAVENLY SHOWERS NOURISHING THE SOIL.',
      icon: [0x38, 0x7e, 0xff, 0x00, 0x49, 0x24, 0x49, 0x00]
    },
    DUST: {
      id: 9, key: 'DUST', name: 'DUST', tag: 'DUST', tier: 2, tierName: 'DUALITY',
      desc: 'FINE POWDER CARRIED UPON ZEPHYRS.',
      icon: [0x42, 0x10, 0x85, 0x28, 0x52, 0x08, 0xa5, 0x10]
    },
    SUN: {
      id: 10, key: 'SUN', name: 'SUN', tag: ' SUN', tier: 2, tierName: 'DUALITY',
      desc: 'RADIANT CELESTIAL BEACON OF WARMTH.',
      icon: [0x18, 0x99, 0x42, 0x3c, 0x3c, 0x42, 0x99, 0x18]
    },

    // Tier 3: Formations & Minerals
    STONE: {
      id: 11, key: 'STONE', name: 'STONE', tag: 'STON', tier: 3, tierName: 'MINERAL',
      desc: 'DENSE MINERAL HARDENED BY TEMPERING.',
      icon: [0x3c, 0x7e, 0xe7, 0xdb, 0xff, 0xdd, 0x7e, 0x3c]
    },
    SAND: {
      id: 12, key: 'SAND', name: 'SAND', tag: 'SAND', tier: 3, tierName: 'MINERAL',
      desc: 'CRUSHED QUARTZ SHIFTING IN DUNES.',
      icon: [0x00, 0x01, 0x07, 0x3f, 0xfe, 0xf8, 0xff, 0xff]
    },
    PLANT: {
      id: 13, key: 'PLANT', name: 'PLANT', tag: 'PLNT', tier: 3, tierName: 'MINERAL',
      desc: 'LIVING FLORA SPROUTING TOWARD LIGHT.',
      icon: [0x12, 0x54, 0x38, 0x10, 0x78, 0x10, 0x10, 0x7e]
    },
    STORM: {
      id: 14, key: 'STORM', name: 'STORM', tag: 'STRM', tier: 3, tierName: 'MINERAL',
      desc: 'TURBULENT TEMPEST OF THUNDER AND GALE.',
      icon: [0x38, 0x7e, 0xff, 0x18, 0x30, 0x78, 0x18, 0x10]
    },
    METAL: {
      id: 15, key: 'METAL', name: 'METAL', tag: 'METL', tier: 3, tierName: 'MINERAL',
      desc: 'MALLEABLE ORE SMELTED IN FURNACES.',
      icon: [0x00, 0x3c, 0x7e, 0xc3, 0xff, 0xff, 0x7e, 0x00]
    },
    FOG: {
      id: 16, key: 'FOG', name: 'FOG', tag: ' FOG', tier: 3, tierName: 'MINERAL',
      desc: 'OBSCURING HAZE HOVERING OVER VALLEYS.',
      icon: [0x00, 0x7e, 0x00, 0xff, 0x00, 0x7e, 0x00, 0xfc]
    },
    VOLCANO: {
      id: 17, key: 'VOLCANO', name: 'VOLCANO', tag: 'VOLC', tier: 3, tierName: 'MINERAL',
      desc: 'CRATER VENTING TECTONIC FURY.',
      icon: [0x4a, 0x34, 0x24, 0x3c, 0x7e, 0xe7, 0xff, 0xff]
    },

    // Tier 4: Organisms & Vessels
    LIFE: {
      id: 18, key: 'LIFE', name: 'LIFE', tag: 'LIFE', tier: 4, tierName: 'ORGANISM',
      desc: 'MYSTIC SPARK ANIMATING INERT CLAY.',
      icon: [0x66, 0xff, 0xff, 0xff, 0x7e, 0x3c, 0x18, 0x00]
    },
    BEAST: {
      id: 19, key: 'BEAST', name: 'BEAST', tag: 'BEAS', tier: 4, tierName: 'ORGANISM',
      desc: 'WILD CREATURE ROAMING FERTILE WILDS.',
      icon: [0x81, 0xc3, 0x7e, 0xff, 0xbd, 0xe7, 0x7e, 0x24]
    },
    FISH: {
      id: 20, key: 'FISH', name: 'FISH', tag: 'FISH', tier: 4, tierName: 'ORGANISM',
      desc: 'AQUATIC BEING SWIMMING OCEAN CURRENTS.',
      icon: [0x10, 0x39, 0x7f, 0xde, 0x7f, 0x39, 0x10, 0x00]
    },
    BIRD: {
      id: 21, key: 'BIRD', name: 'BIRD', tag: 'BIRD', tier: 4, tierName: 'ORGANISM',
      desc: 'FEATHERED SOVEREIGN OF OPEN SKIES.',
      icon: [0x81, 0xc3, 0x66, 0x3c, 0x18, 0x3c, 0x18, 0x00]
    },
    GOLEM: {
      id: 22, key: 'GOLEM', name: 'GOLEM', tag: 'GOLM', tier: 4, tierName: 'ORGANISM',
      desc: 'ARTIFICIAL SENTINEL OF CHISELED ROCK.',
      icon: [0x7e, 0xff, 0xbd, 0xff, 0xc3, 0xff, 0x7e, 0x3c]
    },
    GLASS: {
      id: 23, key: 'GLASS', name: 'GLASS', tag: 'GLAS', tier: 4, tierName: 'VESSEL',
      desc: 'TRANSPARENT AMORPHOUS SILICA VESSEL.',
      icon: [0xff, 0x81, 0x81, 0x42, 0x3c, 0x18, 0x18, 0x7e]
    },
    WEAPON: {
      id: 24, key: 'WEAPON', name: 'WEAPON', tag: 'WEAP', tier: 4, tierName: 'VESSEL',
      desc: 'SHARPENED BLADE FORGED FOR BATTLE.',
      icon: [0x18, 0x18, 0x18, 0x18, 0x7e, 0x18, 0x18, 0x3c]
    },
    ASH: {
      id: 25, key: 'ASH', name: 'ASH', tag: ' ASH', tier: 4, tierName: 'RESIDUE',
      desc: 'RESIDUAL FLAKES OF CONSUMED FUEL.',
      icon: [0x00, 0x10, 0x08, 0x24, 0x3c, 0x7e, 0xef, 0xff]
    },
    SWAMP: {
      id: 26, key: 'SWAMP', name: 'SWAMP', tag: 'SWMP', tier: 4, tierName: 'ORGANISM',
      desc: 'MURKY BOG TEEMING WITH PRIMORDIAL SEED.',
      icon: [0x44, 0x54, 0x74, 0x3e, 0xff, 0x7e, 0xff, 0x3c]
    },

    // Tier 5: Civilization & Wisdom
    TOOL: {
      id: 27, key: 'TOOL', name: 'TOOL', tag: 'TOOL', tier: 5, tierName: 'CIVILIZATION',
      desc: 'INSTRUMENT EXTENDING SINEW AND WILL.',
      icon: [0x7e, 0xff, 0x7e, 0x18, 0x18, 0x18, 0x18, 0x18]
    },
    HUMAN: {
      id: 28, key: 'HUMAN', name: 'HUMAN', tag: 'HUMN', tier: 5, tierName: 'CIVILIZATION',
      desc: 'MIND CONTEMPLATING THE GREAT COSMOS.',
      icon: [0x18, 0x18, 0x7e, 0xdb, 0x99, 0x18, 0x24, 0x66]
    },
    POTION: {
      id: 29, key: 'POTION', name: 'POTION', tag: 'POTN', tier: 5, tierName: 'CIVILIZATION',
      desc: 'BREWED ELIXIR CONDENSED IN A FLASK.',
      icon: [0x18, 0x18, 0x3c, 0x7e, 0xcf, 0xff, 0x7e, 0x3c]
    },
    ELECTRICITY: {
      id: 30, key: 'ELECTRICITY', name: 'ELECTRICITY', tag: 'ELEC', tier: 5, tierName: 'CIVILIZATION',
      desc: 'CRACKLING LIGHTNING HARNESSED IN WIRE.',
      icon: [0x42, 0x24, 0x18, 0xff, 0xff, 0x18, 0x24, 0x42]
    },
    WHEEL: {
      id: 31, key: 'WHEEL', name: 'WHEEL', tag: 'WHEL', tier: 5, tierName: 'CIVILIZATION',
      desc: 'REVOLVING CIRCLE CONQUERING DISTANCE.',
      icon: [0x3c, 0x66, 0xdb, 0xbd, 0xbd, 0xdb, 0x66, 0x3c]
    },
    TIME: {
      id: 32, key: 'TIME', name: 'TIME', tag: 'TIME', tier: 5, tierName: 'CIVILIZATION',
      desc: 'CHRONIC RIVER MEASURED BY FALLING SAND.',
      icon: [0xff, 0x7e, 0x3c, 0x18, 0x24, 0x5a, 0x7e, 0xff]
    },

    // Tier 6: Magnum Opus / Transmutation
    PHILOSOPHER: {
      id: 33, key: 'PHILOSOPHER', name: 'PHILOSOPHER', tag: 'PHIL', tier: 6, tierName: 'MAGNUM OPUS',
      desc: 'SAGE PENETRATING THE VEIL OF NATURE.',
      icon: [0x3c, 0x7e, 0x5a, 0x3c, 0x18, 0x3c, 0x7e, 0x3c]
    },
    HOMUNCULUS: {
      id: 34, key: 'HOMUNCULUS', name: 'HOMUNCULUS', tag: 'HOMU', tier: 6, tierName: 'MAGNUM OPUS',
      desc: 'SYNTHETIC LIFE NURTURED IN A GLASS PHIAL.',
      icon: [0x7e, 0x81, 0x99, 0xbd, 0x99, 0xa5, 0x81, 0x7e]
    },
    GOLD: {
      id: 35, key: 'GOLD', name: 'GOLD', tag: 'GOLD', tier: 6, tierName: 'MAGNUM OPUS',
      desc: 'CORROSIONLESS SUN-METAL OF MONARCHS.',
      icon: [0x92, 0xba, 0xff, 0x7e, 0x3c, 0x7e, 0xff, 0x00]
    },
    'ELIXIR OF LIFE': {
      id: 36, key: 'ELIXIR OF LIFE', name: 'ELIXIR OF LIFE', tag: 'ELXR', tier: 6, tierName: 'MAGNUM OPUS',
      desc: 'SOVEREIGN DRAFT GRANTING PERPETUAL YOUTH.',
      icon: [0x18, 0x5a, 0x3c, 0x5a, 0xff, 0xdb, 0x7e, 0x3c]
    },
    "PHILOSOPHER'S STONE": {
      id: 37, key: "PHILOSOPHER'S STONE", name: "PHILOSOPHER'S STONE", tag: 'P.ST', tier: 6, tierName: 'MAGNUM OPUS',
      desc: 'APEX OF ALCHEMY: TRANSMUTER OF ALL DROSS!',
      icon: [0x18, 0x7e, 0xff, 0xdb, 0xff, 0x7e, 0x3c, 0x18]
    }
  };

  // Ordered list of element keys
  const ELEMENT_KEYS = Object.keys(ELEMENTS);

  // --------------------------------------------------------------------------
  // BIDIRECTIONAL COMBINATION MATRIX (51 RECIPES)
  // --------------------------------------------------------------------------
  const RECIPES_LIST = [
    // Tier 2
    ['FIRE', 'WATER', 'STEAM'],
    ['FIRE', 'EARTH', 'LAVA'],
    ['WATER', 'EARTH', 'MUD'],
    ['FIRE', 'AIR', 'ENERGY'],
    ['WATER', 'AIR', 'RAIN'],
    ['EARTH', 'AIR', 'DUST'],
    ['FIRE', 'ENERGY', 'SUN'],

    // Tier 3
    ['LAVA', 'WATER', 'STONE'],
    ['LAVA', 'AIR', 'STONE'],
    ['STONE', 'AIR', 'SAND'],
    ['STONE', 'WATER', 'SAND'],
    ['EARTH', 'RAIN', 'PLANT'],
    ['MUD', 'RAIN', 'PLANT'],
    ['AIR', 'ENERGY', 'STORM'],
    ['RAIN', 'ENERGY', 'STORM'],
    ['STONE', 'FIRE', 'METAL'],
    ['LAVA', 'STONE', 'METAL'],
    ['STEAM', 'AIR', 'FOG'],
    ['LAVA', 'EARTH', 'VOLCANO'],

    // Tier 4
    ['ENERGY', 'MUD', 'LIFE'],
    ['ENERGY', 'PLANT', 'LIFE'],
    ['LIFE', 'EARTH', 'BEAST'],
    ['LIFE', 'MUD', 'BEAST'],
    ['LIFE', 'WATER', 'FISH'],
    ['LIFE', 'AIR', 'BIRD'],
    ['LIFE', 'STONE', 'GOLEM'],
    ['FIRE', 'SAND', 'GLASS'],
    ['METAL', 'FIRE', 'WEAPON'],
    ['FIRE', 'PLANT', 'ASH'],
    ['FIRE', 'DUST', 'ASH'],
    ['FIRE', 'BEAST', 'ASH'],
    ['MUD', 'PLANT', 'SWAMP'],

    // Tier 5
    ['METAL', 'STONE', 'TOOL'],
    ['BEAST', 'TOOL', 'HUMAN'],
    ['GOLEM', 'LIFE', 'HUMAN'],
    ['PLANT', 'GLASS', 'POTION'],
    ['WATER', 'PLANT', 'POTION'],
    ['ENERGY', 'METAL', 'ELECTRICITY'],
    ['STORM', 'METAL', 'ELECTRICITY'],
    ['TOOL', 'STONE', 'WHEEL'],
    ['GLASS', 'SAND', 'TIME'],

    // Tier 6
    ['HUMAN', 'TIME', 'PHILOSOPHER'],
    ['LIFE', 'POTION', 'HOMUNCULUS'],
    ['GOLEM', 'POTION', 'HOMUNCULUS'],
    ['METAL', 'SUN', 'GOLD'],
    ['METAL', 'PHILOSOPHER', 'GOLD'],
    ['POTION', 'TIME', 'ELIXIR OF LIFE'],
    ['GOLD', 'POTION', 'ELIXIR OF LIFE'],
    ['GOLD', 'ELIXIR OF LIFE', "PHILOSOPHER'S STONE"],
    ['PHILOSOPHER', 'ELIXIR OF LIFE', "PHILOSOPHER'S STONE"],
    ['GOLD', 'PHILOSOPHER', "PHILOSOPHER'S STONE"]
  ];

  // Fast Bidirectional Lookup Table
  const COMBINATIONS = {};
  for (let i = 0; i < RECIPES_LIST.length; i++) {
    const [a, b, res] = RECIPES_LIST[i];
    const key = [a, b].sort().join('+');
    COMBINATIONS[key] = res;
  }

  // --------------------------------------------------------------------------
  // CRYPTIC ALCHEMICAL RIDDLES (FOR GRIMOIRE HINT ENGINE)
  // --------------------------------------------------------------------------
  const RIDDLES = {
    STEAM: 'COLD WATERS DASHED UPON FURIOUS FIRE UNLEASH BILLOWING SCALDING MIST.',
    LAVA: 'WHEN PRIMORDIAL FLAMES CONSUME SOLID EARTH, RIVERS OF MOLTEN ROCK ARE BORN.',
    MUD: 'CLEAR STREAMS SOAKING SOFT EARTH LEAVE FERTILE MIRE UPON THE BANK.',
    ENERGY: 'FEED CELESTIAL WINDS INTO HUNGRY FLAMES TO SUMMON PURE INVIGORATING VIGOR.',
    RAIN: 'WHEN HEAVY BREEZES MEET DEEP WATERS, GRAY SKIES WEEP LIFE-GIVING DROPLETS.',
    DUST: 'WINDS SCATTERING DRY SOIL CAST FINE POWDER TO THE HORIZON.',
    SUN: 'KINDLE COSMIC ENERGY WITH BLAZING FIRE TO BIRTH THE RADIANT SOLAR SPHERE.',
    STONE: 'QUENCH SEARING LAVA WITH COOLING WATER TO TEMPER ETERNAL ROCK.',
    SAND: 'BATTERING GUSTS GRINDING AGAINST ROUGH STONE CRUMBLE CRAGS INTO DESERT DUNES.',
    PLANT: 'NURTURE BARREN SOIL WITH FALLING RAIN TO COAX EMERALD SPROUTS FROM SLEEP.',
    STORM: 'SWIRLING AIR CHARGED WITH RAW ENERGY BREWS THUNDER AND BLINDING TEMPEST.',
    METAL: 'BAKE DENSE STONE IN SCORCHING FIRE TO EXTRACT DUCTILE, GLEAMING ORE.',
    FOG: 'WARM STEAM DRIFTING INTO CRISP AIR VEILS THE WORLD IN GHOSTLY MIST.',
    VOLCANO: 'TRAP SEARING LAVA DEEP WITHIN THE EARTH TO BUILD MOUNTAINS OF ERUPTING FURY.',
    LIFE: 'INFUSE FERTILE MUD WITH PULSING ENERGY TO SPARK THE SACRED BREATH OF ANIMATION.',
    BEAST: 'ANIMATE THE FERTILE EARTH WITH LIFE TO SET WILD PREDATORS PROWLING.',
    FISH: 'BESTOW LIFE UPON AZURE WATERS TO POPULATE THE DEEP OCEANIC ABYSS.',
    BIRD: 'GRANT THE GIFT OF LIFE TO ENDLESS SKIES TO UNFURL FEATHERED WINGS IN FLIGHT.',
    GOLEM: 'CARVE HEAVY STONE AND BREATHE LIFE INTO ITS CORE TO CRAFT AN OBEDIENT SENTINEL.',
    GLASS: 'MELT SHIFTING DESERT SAND WITH SEARING FIRE TO FORM CLEAR, RIGID SILICA.',
    WEAPON: 'TEMPER RAW METAL IN BLAZING FLAME TO FORGE AN EDGE THIRSTING FOR COMBAT.',
    ASH: 'CONSUME GREEN FLORA WITH HUNGRY FLAME UNTIL ONLY PALE GRAY SOOT REMAINS.',
    SWAMP: 'SATURATE WILD FLORA WITH THICK MUD TO CULTIVATE A MURKY, ANCIENT FEN.',
    TOOL: 'SHAPE HARD METAL AGAINST STUBBORN STONE TO EXTEND HUMAN WILL AND LABOR.',
    HUMAN: 'PLACE INGENIOUS TOOLS IN THE GRASP OF BEASTS TO AWAKEN CONTEMPLATIVE MAN.',
    POTION: 'BREW DRIED PLANTS INSIDE TRANSPARENT GLASS TO BOTTLE CONCENTRATED VIGOR.',
    ELECTRICITY: 'CHANNEL COSMIC ENERGY THROUGH CONDUCTIVE METAL TO HARNESS CRACKLING LIGHTNING.',
    WHEEL: 'CARVE A TOOL INTO ROUNDED STONE TO CONQUER MOUNTAINS AND LONG TRAILS.',
    TIME: 'POUR DELICATE SAND THROUGH GLASS GLOBES TO MEASURE THE PASSAGE OF MORTAL HOURS.',
    PHILOSOPHER: 'STEEP MORTAL MAN IN THE RIVER OF TIME TO REFINE WISDOM AND OCCULT LORE.',
    HOMUNCULUS: 'NURTURE PURE LIFE IN A MYSTIC POTION TO GROW A SYNTHETIC SOUL IN GLASS.',
    GOLD: 'ENRICH BASE METAL WITH SOLAR ESSENCE TO CRYSTALLIZE THE INCORRUPTIBLE SUN-METAL.',
    'ELIXIR OF LIFE': 'DISTILL CONCENTRATED POTION ACROSS EPOCHS OF TIME TO BREW IMMORTALITY.',
    "PHILOSOPHER'S STONE": 'FUSE ROYAL GOLD WITH THE ELIXIR OF LIFE TO CONSUMMATE THE GREAT WORK!'
  };

  // --------------------------------------------------------------------------
  // MULTI-LINE CENTERED TEXT HELPER
  // --------------------------------------------------------------------------
  function drawMultilineC(g, str, startY, color, scale, lineH) {
    if (!str) return;
    const lines = String(str).split('\n');
    for (let i = 0; i < lines.length; i++) {
      g.textC(lines[i], startY + i * (lineH || 7), color, scale || 1);
    }
  }

  // Word-wrap helper for lore descriptions & riddles
  function wrapText(str, maxChars) {
    const words = str.split(' ');
    const lines = [];
    let cur = '';
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (!cur) {
        cur = w;
      } else if ((cur + ' ' + w).length <= maxChars) {
        cur += ' ' + w;
      } else {
        lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  // --------------------------------------------------------------------------
  // CARTRIDGE OBJECT DEFINITION
  // --------------------------------------------------------------------------
  CARTS[57] = {
    id: 57,
    name: "ALCHEMY DESK",
    genre: 1, // PUZZLE
    scoreLabel: "SCORE",
    desc: "TRANSMUTE 4 PRIMORDIAL ELEMENTS INTO 38 DISCOVERIES & THE PHILOSOPHER'S STONE!",

    // ------------------------------------------------------------------------
    // RETRO 32x32 CONSOLE ICON: Alembic, Boiling Liquid, Burner & Star Sparks
    // ------------------------------------------------------------------------
    icon(g, x, y) {
      g.rect(x, y, 32, 32, 0);
      g.box(x, y, 32, 32, 2);

      // Glass Alembic Cucurbit / Retort bulb
      g.disc(x + 13, y + 20, 6, 1);
      g.circle(x + 13, y + 20, 6, 2);

      // Boiling Liquid Meniscus & Bubbles
      g.disc(x + 13, y + 21, 5, 2);
      g.px(x + 11, y + 19, 3);
      g.px(x + 15, y + 21, 3);

      // Retort Neck and Rounded Dome
      g.rect(x + 11, y + 12, 5, 4, 2);
      g.disc(x + 13, y + 11, 4, 2);
      g.circle(x + 13, y + 11, 4, 3);

      // Curved Swan-neck Beak Spout
      g.line(x + 16, y + 11, x + 23, y + 16, 2);
      g.line(x + 23, y + 16, x + 24, y + 22, 2);

      // Receiver Flask on Right with Distillate
      g.box(x + 22, y + 21, 6, 7, 2);
      g.rect(x + 23, y + 24, 4, 3, 3);

      // Alcohol Burner Base & Flickering Flame
      g.rect(x + 8, y + 28, 11, 2, 2);
      g.tri(x + 13, y + 26, x + 10, y + 28, x + 16, y + 28, 3);

      // Ascending Celestial Sparkle Stars
      g.px(x + 6, y + 6, 3);
      g.px(x + 5, y + 7, 2);
      g.px(x + 7, y + 7, 2);
      g.px(x + 6, y + 8, 3);

      g.px(x + 24, y + 5, 3);
      g.px(x + 25, y + 6, 2);

      g.px(x + 13, y + 3, 3);
    },

    // ------------------------------------------------------------------------
    // INITIALIZATION & STATE SETUP
    // ------------------------------------------------------------------------
    init() {
      // Progression state: start with the 4 Primordial elements
      this.discovered = ['FIRE', 'WATER', 'EARTH', 'AIR'];
      this.discoveredRecipes = [];
      this.hintsUsed = 0;
      this.score = 400;

      // Apparatus state
      this.slot1 = null;
      this.slot2 = null;

      // Element Shelf cursor and navigation
      this.cursor = 0;       // Index in this.discovered
      this.page = 0;         // 0..2 (18 elements per page)
      this.focusZone = 'shelf'; // 'shelf' or 'buttons'
      this.btnIndex = 1;     // 0 = CLEAR, 1 = TRANSMUTE, 2 = HINT

      // UI State
      this.state = 'DESK';   // 'DESK', 'TRANSMUTING', 'DISCOVERY', 'HINT', 'VICTORY'
      this.statusToast = 'SELECT 2 REAGENTS TO BREW';
      this.toastTimer = 3.0;

      // Animation & particle state
      this.transmuteTimer = 0;
      this.transmuteMax = 0.7;
      this.animTime = 0;
      this.screenShake = 0;
      this.sparkles = [];
      this.bubbles = [];
      this.smoke = [];

      // Modal payload caches
      this.newElem = null;
      this.newFormula = '';
      this.curHint = null;

      // Init retort bubbles
      for (let i = 0; i < 7; i++) {
        this.bubbles.push({
          x: (Math.random() - 0.5) * 16,
          y: 4 + Math.random() * 12,
          r: 1 + Math.floor(Math.random() * 2),
          vy: 12 + Math.random() * 16,
          wobble: Math.random() * 6.28
        });
      }

      this.updateScore();
    },

    // ------------------------------------------------------------------------
    // SCORE CALCULATION & LOCAL STORAGE PERSISTENCE
    // ------------------------------------------------------------------------
    updateScore() {
      const diff = (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : 1;
      const mult = diff === 0 ? 0.8 : (diff === 2 ? 1.5 : 1.0);
      const base = (this.discovered.length * 100) + (this.discoveredRecipes.length * 50);
      this.score = Math.floor(base * mult);

      if (typeof SAVE !== 'undefined' && SAVE.setScore) {
        SAVE.setScore(this.id, this.score);
      }
    },

    save() {
      return {
        discovered: [...this.discovered],
        recipes: [...this.discoveredRecipes],
        hintsUsed: this.hintsUsed,
        score: this.score
      };
    },

    load(data) {
      if (!data || typeof data !== 'object') return;
      if (Array.isArray(data.discovered) && data.discovered.length >= 4) {
        this.discovered = [...data.discovered];
      }
      if (Array.isArray(data.recipes)) {
        this.discoveredRecipes = [...data.recipes];
      }
      if (typeof data.hintsUsed === 'number') {
        this.hintsUsed = data.hintsUsed;
      }
      this.updateScore();
    },

    // ------------------------------------------------------------------------
    // HINT RESOLVER: Finds an undiscovered recipe with reagents the player owns
    // ------------------------------------------------------------------------
    findNextHint() {
      const owned = new Set(this.discovered);
      // Prioritize lowest tier recipe available
      let bestCandidate = null;
      let lowestTier = 99;

      for (let i = 0; i < RECIPES_LIST.length; i++) {
        const [a, b, res] = RECIPES_LIST[i];
        if (owned.has(a) && owned.has(b) && !owned.has(res)) {
          const resTier = ELEMENTS[res] ? ELEMENTS[res].tier : 99;
          if (resTier < lowestTier) {
            lowestTier = resTier;
            bestCandidate = { a, b, res, riddle: RIDDLES[res] || 'COMBINE BOTH ESSENCES IN THE RETORT.' };
          }
        }
      }

      return bestCandidate;
    },

    // ------------------------------------------------------------------------
    // TRANSMUTATION ENGINE LOGIC
    // ------------------------------------------------------------------------
    triggerTransmute() {
      if (!this.slot1 || !this.slot2) {
        playSfx('ERROR');
        this.statusToast = 'BOTH BEAKERS MUST BE FILLED!';
        this.toastTimer = 2.0;
        return;
      }

      playSfx('SWISH');
      this.state = 'TRANSMUTING';
      const diff = (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : 1;
      this.transmuteMax = diff === 0 ? 0.5 : (diff === 2 ? 0.9 : 0.7);
      this.transmuteTimer = this.transmuteMax;
      this.statusToast = 'BREWING TRANSMUTATION...';
    },

    finishTransmute() {
      const key = [this.slot1, this.slot2].sort().join('+');
      const resultKey = COMBINATIONS[key];

      if (!resultKey) {
        // Inert combination / failed reaction
        playSfx('ERROR');
        const diff = (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : 1;
        this.screenShake = diff === 2 ? 0.4 : 0.2;
        this.statusToast = 'NO REACTION: INERT MIXTURE';
        this.toastTimer = 2.5;

        // Spawn grey smoke puffs from retort
        for (let i = 0; i < 16; i++) {
          this.smoke.push({
            x: 128 + (Math.random() - 0.5) * 12,
            y: 48 + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 20,
            vy: -15 - Math.random() * 25,
            life: 0.8 + Math.random() * 0.6,
            maxLife: 1.4,
            size: 2 + Math.floor(Math.random() * 3)
          });
        }

        this.state = 'DESK';
        return;
      }

      // Valid recipe! Record recipe if new
      if (!this.discoveredRecipes.includes(key)) {
        this.discoveredRecipes.push(key);
      }

      const isNewDiscovery = !this.discovered.includes(resultKey);

      if (isNewDiscovery) {
        // Brand new element discovered!
        this.discovered.push(resultKey);
        this.updateScore();
        playSfx('FANFARE');

        // Spawn celebration sparkles
        for (let i = 0; i < 30; i++) {
          const angle = Math.random() * 6.28;
          const spd = 20 + Math.random() * 60;
          this.sparkles.push({
            x: 128,
            y: 50,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd - 10,
            life: 1.2 + Math.random() * 0.8,
            maxLife: 2.0,
            c: Math.random() < 0.6 ? 3 : 2
          });
        }

        this.newElem = ELEMENTS[resultKey];
        this.newFormula = this.slot1 + ' + ' + this.slot2;

        // Clear beakers for next experiment
        this.slot1 = null;
        this.slot2 = null;

        // Check for Magnum Opus Endgame victory!
        if (resultKey === "PHILOSOPHER'S STONE") {
          this.state = 'VICTORY';
        } else {
          this.state = 'DISCOVERY';
        }
      } else {
        // Element was already known
        playSfx('CONFIRM');
        this.statusToast = 'ALREADY KNOWN: ' + resultKey;
        this.toastTimer = 2.5;
        this.slot1 = null;
        this.slot2 = null;
        this.state = 'DESK';
      }
    },

    // ------------------------------------------------------------------------
    // INPUT HANDLING & MULTI-TOUCH COORD RESOLVER
    // ------------------------------------------------------------------------
    update(dt) {
      this.animTime += dt;

      // Screen shake decay
      if (this.screenShake > 0) {
        this.screenShake = Math.max(0, this.screenShake - dt);
      }

      // Toast timer decay
      if (this.toastTimer > 0) {
        this.toastTimer -= dt;
      }

      // Procedural Retort Bubbles
      for (let i = 0; i < this.bubbles.length; i++) {
        const b = this.bubbles[i];
        const spd = this.state === 'TRANSMUTING' ? b.vy * 2.5 : b.vy;
        b.y -= spd * dt;
        b.wobble += dt * 5;
        b.x += Math.sin(b.wobble) * 4 * dt;
        if (b.y <= -2) {
          b.y = 14 + Math.random() * 6;
          b.x = (Math.random() - 0.5) * 16;
        }
      }

      // Particles: Celebration Sparkles
      for (let i = this.sparkles.length - 1; i >= 0; i--) {
        const p = this.sparkles[i];
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 45 * dt; // gravity
        if (p.life <= 0) this.sparkles.splice(i, 1);
      }

      // Particles: Grey Smoke on Failure
      for (let i = this.smoke.length - 1; i >= 0; i--) {
        const sm = this.smoke[i];
        sm.life -= dt;
        sm.x += sm.vx * dt;
        sm.y += sm.vy * dt;
        sm.vx *= 0.95;
        if (sm.life <= 0) this.smoke.splice(i, 1);
      }

      // Transmutation brewing timer
      if (this.state === 'TRANSMUTING') {
        this.transmuteTimer -= dt;
        if (this.transmuteTimer <= 0) {
          this.finishTransmute();
        }
        return; // Pause user input during brewing sequence
      }

      // Multi-touch detection
      let tapX = -1, tapY = -1;
      if (typeof PAD !== 'undefined' && PAD.tapPos) {
        tapX = PAD.tapPos.x;
        tapY = PAD.tapPos.y;
      } else if (typeof TOUCH !== 'undefined' && TOUCH && TOUCH.tapPos) {
        tapX = TOUCH.tapPos.x;
        tapY = TOUCH.tapPos.y;
      }

      const swipe = (typeof PAD !== 'undefined' ? PAD.swipe : null) ||
                    (typeof TOUCH !== 'undefined' ? TOUCH.swipe : null);

      // Handle Swipes for Page Navigation
      if (swipe === 'left') {
        const maxPages = Math.ceil(this.discovered.length / 18);
        this.page = (this.page + 1) % maxPages;
        this.cursor = this.page * 18;
        playSfx('SELECT');
      } else if (swipe === 'right') {
        const maxPages = Math.ceil(this.discovered.length / 18);
        this.page = (this.page - 1 + maxPages) % maxPages;
        this.cursor = this.page * 18;
        playSfx('SELECT');
      }

      // ----------------------------------------------------------------------
      // MODAL OVERLAYS: DISCOVERY, HINT, VICTORY
      // ----------------------------------------------------------------------
      if (this.state === 'DISCOVERY') {
        if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || (tapX >= 0 && tapY >= 0)) {
          playSfx('CONFIRM');
          this.state = 'DESK';
        }
        return;
      }

      if (this.state === 'HINT') {
        if (PAD.hit('b') || PAD.hit('a') || PAD.hit('select') || PAD.hit('start') || (tapX >= 0 && tapY >= 0)) {
          playSfx('CANCEL');
          this.state = 'DESK';
        }
        return;
      }

      if (this.state === 'VICTORY') {
        if (PAD.hit('a') || PAD.hit('b') || (tapX >= 0 && tapY >= 0)) {
          playSfx('CONFIRM');
          this.state = 'DESK';
        } else if (PAD.hit('start')) {
          playSfx('CONFIRM');
          this.init();
        }
        return;
      }

      // ----------------------------------------------------------------------
      // TOUCH HANDLING: BEAKERS, BUTTONS, SHELF CELLS
      // ----------------------------------------------------------------------
      if (tapX >= 0 && tapY >= 0) {
        // Tap Slot 1 (Left Beaker)
        if (tapX >= 16 && tapX <= 62 && tapY >= 20 && tapY <= 80) {
          if (this.slot1) {
            playSfx('CANCEL');
            this.slot1 = null;
          }
          return;
        }

        // Tap Slot 2 (Right Beaker)
        if (tapX >= 194 && tapX <= 240 && tapY >= 20 && tapY <= 80) {
          if (this.slot2) {
            playSfx('CANCEL');
            this.slot2 = null;
          }
          return;
        }

        // Tap Center Retort Apparatus: Trigger Transmute if filled
        if (tapX >= 90 && tapX <= 166 && tapY >= 18 && tapY <= 82) {
          if (this.slot1 && this.slot2) {
            this.triggerTransmute();
          } else {
            playSfx('SELECT');
          }
          return;
        }

        // Tap [CLEAR] button (X: 16..62, Y: 84..102)
        if (tapX >= 16 && tapX <= 62 && tapY >= 84 && tapY <= 102) {
          if (this.slot1 || this.slot2) {
            playSfx('CANCEL');
            this.slot1 = null;
            this.slot2 = null;
            this.statusToast = 'CRUCIBLE CLEARED';
          }
          return;
        }

        // Tap [TRANSMUTE] button (X: 74..182, Y: 84..102)
        if (tapX >= 74 && tapX <= 182 && tapY >= 84 && tapY <= 102) {
          this.triggerTransmute();
          return;
        }

        // Tap [? HINT] button (X: 194..240, Y: 84..102)
        if (tapX >= 194 && tapX <= 240 && tapY >= 84 && tapY <= 102) {
          this.openHintModal();
          return;
        }

        // Tap [◀ PREV] page button (X: 16..60, Y: 114..126)
        if (tapX >= 16 && tapX <= 60 && tapY >= 114 && tapY <= 126) {
          const maxPages = Math.ceil(this.discovered.length / 18);
          this.page = (this.page - 1 + maxPages) % maxPages;
          this.cursor = this.page * 18;
          playSfx('SELECT');
          return;
        }

        // Tap [NEXT ▶] page button (X: 196..240, Y: 114..126)
        if (tapX >= 196 && tapX <= 240 && tapY >= 114 && tapY <= 126) {
          const maxPages = Math.ceil(this.discovered.length / 18);
          this.page = (this.page + 1) % maxPages;
          this.cursor = this.page * 18;
          playSfx('SELECT');
          return;
        }

        // Tap shelf elements grid (Rows: Y 128..188, Cols: X 17..236)
        if (tapY >= 126 && tapY <= 190 && tapX >= 16 && tapX <= 238) {
          const col = Math.floor((tapX - 17) / 37);
          const row = Math.floor((tapY - 128) / 21);
          if (col >= 0 && col < 6 && row >= 0 && row < 3) {
            const index = this.page * 18 + (row * 6 + col);
            if (index < this.discovered.length) {
              this.cursor = index;
              this.focusZone = 'shelf';
              this.slotElement(this.discovered[index]);
            }
          }
          return;
        }
      }

      // ----------------------------------------------------------------------
      // D-PAD & GAMEPAD BUTTON HANDLING
      // ----------------------------------------------------------------------
      const maxPages = Math.ceil(this.discovered.length / 18);

      // Global buttons
      if (PAD.hit('b')) {
        if (this.slot2) {
          playSfx('CANCEL');
          this.slot2 = null;
        } else if (this.slot1) {
          playSfx('CANCEL');
          this.slot1 = null;
        }
      }

      if (PAD.hit('start')) {
        if (this.slot1 && this.slot2) {
          this.triggerTransmute();
        } else {
          playSfx('SELECT');
        }
      }

      if (PAD.hit('select')) {
        this.openHintModal();
      }

      // Zone: BUTTONS (Clear, Transmute, Hint)
      if (this.focusZone === 'buttons') {
        if (PAD.hit('left')) {
          this.btnIndex = (this.btnIndex - 1 + 3) % 3;
          playSfx('SELECT');
        }
        if (PAD.hit('right')) {
          this.btnIndex = (this.btnIndex + 1) % 3;
          playSfx('SELECT');
        }
        if (PAD.hit('down')) {
          this.focusZone = 'shelf';
          playSfx('SELECT');
        }
        if (PAD.hit('a')) {
          if (this.btnIndex === 0) {
            if (this.slot1 || this.slot2) {
              playSfx('CANCEL');
              this.slot1 = null;
              this.slot2 = null;
              this.statusToast = 'CRUCIBLE CLEARED';
            }
          } else if (this.btnIndex === 1) {
            this.triggerTransmute();
          } else if (this.btnIndex === 2) {
            this.openHintModal();
          }
        }
        return;
      }

      // Zone: SHELF GRID NAVIGATION
      if (this.focusZone === 'shelf') {
        const pageStart = this.page * 18;
        const pageCount = Math.min(18, this.discovered.length - pageStart);
        const relCursor = this.cursor - pageStart;
        const curCol = relCursor % 6;
        const curRow = Math.floor(relCursor / 6);

        if (PAD.hit('left')) {
          if (curCol > 0) {
            this.cursor--;
            playSfx('SELECT');
          } else if (this.page > 0) {
            this.page--;
            this.cursor = Math.min(this.page * 18 + curRow * 6 + 5, this.discovered.length - 1);
            playSfx('SELECT');
          }
        }

        if (PAD.hit('right')) {
          if (curCol < 5 && this.cursor + 1 < this.discovered.length) {
            this.cursor++;
            playSfx('SELECT');
          } else if (this.page < maxPages - 1) {
            this.page++;
            this.cursor = Math.min(this.page * 18 + curRow * 6, this.discovered.length - 1);
            playSfx('SELECT');
          }
        }

        if (PAD.hit('up')) {
          if (curRow > 0) {
            this.cursor -= 6;
            playSfx('SELECT');
          } else {
            // Move focus up to Action Buttons bar
            this.focusZone = 'buttons';
            this.btnIndex = curCol < 2 ? 0 : (curCol < 4 ? 1 : 2);
            playSfx('SELECT');
          }
        }

        if (PAD.hit('down')) {
          if (this.cursor + 6 < this.discovered.length) {
            this.cursor += 6;
            playSfx('SELECT');
          }
        }

        if (PAD.hit('a')) {
          if (this.cursor >= 0 && this.cursor < this.discovered.length) {
            this.slotElement(this.discovered[this.cursor]);
          }
        }
      }
    },

    slotElement(elemKey) {
      playSfx('SELECT');
      if (!this.slot1) {
        this.slot1 = elemKey;
        this.statusToast = 'SLOT 1 READY. CHOOSE REAGENT 2';
      } else if (!this.slot2) {
        this.slot2 = elemKey;
        this.statusToast = 'READY! PRESS [START] OR TRANSMUTE';
      } else {
        // Both full: replace slot 2
        this.slot2 = elemKey;
        this.statusToast = 'SLOT 2 REPLACED';
      }
    },

    openHintModal() {
      playSfx('SELECT');
      this.hintsUsed++;
      this.curHint = this.findNextHint();
      this.state = 'HINT';
    },

    // ------------------------------------------------------------------------
    // RENDERING PIPELINE (256x240 CRT PHOSPHOR MONITOR)
    // ------------------------------------------------------------------------
    render(g) {
      // Screen shake displacement
      let sx = 0, sy = 0;
      if (this.screenShake > 0) {
        sx = Math.floor((Math.random() - 0.5) * 6);
        sy = Math.floor((Math.random() - 0.5) * 6);
      }

      g.clear(0);

      // Outer bezel line
      g.box(0, 0, 256, 240, 1);

      // ----------------------------------------------------------------------
      // 1. TOP STATS HEADER (Y: 2..12)
      // ----------------------------------------------------------------------
      g.rect(1, 1, 254, 11, 0);
      g.text("ALCHEMY DESK", 6 + sx, 3 + sy, 3);
      g.text("DISC:" + this.discovered.length + "/38", 96 + sx, 3 + sy, 2);
      g.text("REC:" + this.discoveredRecipes.length, 160 + sx, 3 + sy, 2);
      g.textR("SCR:" + this.score, 250 + sx, 3 + sy, 3);
      g.line(1, 13, 254, 13, 2);

      // ----------------------------------------------------------------------
      // 2. LABORATORY APPARATUS (Y: 15..82)
      // ----------------------------------------------------------------------
      this.renderBeakerSlot1(g, sx, sy);
      this.renderRetortApparatus(g, sx, sy);
      this.renderBeakerSlot2(g, sx, sy);

      // ----------------------------------------------------------------------
      // 3. ACTION BUTTONS BAR (Y: 84..102)
      // ----------------------------------------------------------------------
      this.renderActionButtons(g, sx, sy);

      // ----------------------------------------------------------------------
      // 4. STATUS / REACTION TOAST BANNER (Y: 104..112)
      // ----------------------------------------------------------------------
      const toastC = (this.animTime % 0.4 < 0.2 && this.state === 'TRANSMUTING') ? 3 : 2;
      g.textC(this.statusToast, 105 + sy, toastC);
      g.line(12, 113, 244, 113, 1);

      // ----------------------------------------------------------------------
      // 5. ELEMENT SHELF HEADER (Y: 115..123)
      // ----------------------------------------------------------------------
      const maxPages = Math.ceil(this.discovered.length / 18);
      g.text("[◀ PREV]", 18 + sx, 116 + sy, this.page > 0 ? 3 : 1);
      g.textC("REAGENT SHELF (" + (this.page + 1) + "/" + maxPages + ")", 116 + sy, 2);
      g.textR("[NEXT ▶]", 238 + sx, 116 + sy, (this.page < maxPages - 1) ? 3 : 1);

      // ----------------------------------------------------------------------
      // 6. ELEMENT SHELF GRID (Y: 125..189)
      // ----------------------------------------------------------------------
      this.renderShelfGrid(g, sx, sy);

      // ----------------------------------------------------------------------
      // 7. HOVERED ELEMENT INSPECTOR BANNER (Y: 191..218)
      // ----------------------------------------------------------------------
      this.renderInspector(g, sx, sy);

      // ----------------------------------------------------------------------
      // 8. CONTROLS FOOTER (Y: 228..238)
      // ----------------------------------------------------------------------
      g.line(1, 226, 254, 226, 2);
      g.textC("[A]:SLOT  [B]:CLEAR  [START]:BREW  [SEL]:HINT", 230, 2);

      // ----------------------------------------------------------------------
      // 9. DYNAMIC PARTICLES (Sparkles & Smoke)
      // ----------------------------------------------------------------------
      this.renderParticles(g);

      // ----------------------------------------------------------------------
      // 10. MODAL DIALOGS (Discovery, Hint, Victory)
      // ----------------------------------------------------------------------
      if (this.state === 'DISCOVERY') {
        this.renderDiscoveryModal(g);
      } else if (this.state === 'HINT') {
        this.renderHintModal(g);
      } else if (this.state === 'VICTORY') {
        this.renderVictoryModal(g);
      }
    },

    // ------------------------------------------------------------------------
    // RENDER HELPER: Left Beaker Slot 1
    // ------------------------------------------------------------------------
    renderBeakerSlot1(g, sx, sy) {
      const bx = 18 + sx;
      const by = 20 + sy;

      // Beaker glass contours
      g.box(bx, by + 12, 44, 48, 2);
      g.rect(bx + 4, by + 4, 36, 9, 0);
      g.box(bx + 4, by + 4, 36, 9, 2); // neck rim
      g.line(bx + 4, by + 4, bx + 39, by + 4, 3); // top lip

      // Side measurement tick marks
      g.line(bx + 1, by + 24, bx + 5, by + 24, 1);
      g.line(bx + 1, by + 34, bx + 7, by + 34, 2);
      g.line(bx + 1, by + 44, bx + 5, by + 44, 1);
      g.line(bx + 1, by + 54, bx + 7, by + 54, 2);

      if (this.slot1 && ELEMENTS[this.slot1]) {
        const el = ELEMENTS[this.slot1];
        // Reagent liquid fill
        g.rect(bx + 2, by + 36, 40, 23, 1);
        g.line(bx + 2, by + 35, bx + 41, by + 35, 3); // meniscus

        // 8x8 Element Icon scale 2 (16x16)
        g.sprite(bx + 14, by + 39, 8, 8, el.icon, 3, 2);

        // Element Name below beaker
        g.textC(el.name, by + 62, 3);
      } else {
        // Empty slot placeholder
        g.textC("SLOT 1", by + 30, 1);
        g.textC("[EMPTY]", by + 40, 1);
        g.textC("TAP / [A]", by + 62, 1);
      }
    },

    // ------------------------------------------------------------------------
    // RENDER HELPER: Right Beaker Slot 2
    // ------------------------------------------------------------------------
    renderBeakerSlot2(g, sx, sy) {
      const bx = 194 + sx;
      const by = 20 + sy;

      // Beaker glass contours
      g.box(bx, by + 12, 44, 48, 2);
      g.rect(bx + 4, by + 4, 36, 9, 0);
      g.box(bx + 4, by + 4, 36, 9, 2);
      g.line(bx + 4, by + 4, bx + 39, by + 4, 3);

      // Measurement tick marks
      g.line(bx + 39, by + 24, bx + 42, by + 24, 1);
      g.line(bx + 37, by + 34, bx + 42, by + 34, 2);
      g.line(bx + 39, by + 44, bx + 42, by + 44, 1);
      g.line(bx + 37, by + 54, bx + 42, by + 54, 2);

      if (this.slot2 && ELEMENTS[this.slot2]) {
        const el = ELEMENTS[this.slot2];
        // Reagent liquid fill
        g.rect(bx + 2, by + 36, 40, 23, 1);
        g.line(bx + 2, by + 35, bx + 41, by + 35, 3);

        // 8x8 Element Icon scale 2 (16x16)
        g.sprite(bx + 14, by + 39, 8, 8, el.icon, 3, 2);

        // Element Name below beaker
        g.textC(el.name, by + 62, 3);
      } else {
        // Empty slot placeholder
        g.textC("SLOT 2", by + 30, 1);
        g.textC("[EMPTY]", by + 40, 1);
        g.textC("TAP / [A]", by + 62, 1);
      }
    },

    // ------------------------------------------------------------------------
    // RENDER HELPER: Center Alembic & Retort Apparatus
    // ------------------------------------------------------------------------
    renderRetortApparatus(g, sx, sy) {
      const cx = 128 + sx;
      const cy = 48 + sy;

      // 1. Boiling Liquid in Retort Sphere
      const liquidC = this.state === 'TRANSMUTING' ? (this.animTime % 0.2 < 0.1 ? 3 : 2) : 1;
      g.disc(cx, cy + 3, 14, liquidC);
      g.line(cx - 13, cy - 2, cx + 13, cy - 2, 3); // liquid surface

      // 2. Rising Bubbles in Retort
      for (let i = 0; i < this.bubbles.length; i++) {
        const b = this.bubbles[i];
        const bx = Math.floor(cx + b.x);
        const by = Math.floor(cy + b.y);
        if (by >= cy - 2 && by <= cy + 14) {
          if (b.r > 1) g.disc(bx, by, b.r, 3);
          else g.px(bx, by, 3);
        }
      }

      // 3. Retort Outer Glass Sphere & Reflection
      g.circle(cx, cy, 16, 2);
      g.px(cx - 11, cy - 8, 3);
      g.px(cx - 10, cy - 9, 3);
      g.px(cx - 9, cy - 10, 3);

      // 4. Alembic Dome Cap & Neck
      g.rect(cx - 4, cy - 22, 8, 8, 2);
      g.disc(cx, cy - 23, 6, 2);
      g.circle(cx, cy - 23, 6, 3);

      // 5. Swan-neck Condensation Tube (arches to the right)
      g.line(cx + 4, cy - 24, cx + 18, cy - 18, 2);
      g.line(cx + 18, cy - 18, cx + 28, cy - 4, 2);
      g.line(cx + 28, cy - 4, cx + 30, cy + 12, 2);

      // 6. Condensate Droplet dripping into Receiver
      const dripPhase = (this.animTime * 1.8) % 1.0;
      const dripY = Math.floor(cy + 13 + dripPhase * 8);
      g.px(cx + 30, dripY, 3);

      // 7. Small Receiver Beaker on Right
      g.box(cx + 26, cy + 20, 9, 10, 2);
      g.rect(cx + 27, cy + 24, 7, 5, 3); // collected pure elixir

      // 8. Alcohol Burner Lamp underneath Retort
      g.rect(cx - 12, cy + 24, 24, 4, 2); // lamp stand base
      g.rect(cx - 3, cy + 21, 6, 3, 2);  // wick holder

      // 9. Animated Flickering Flame
      const flameH = (this.state === 'TRANSMUTING' ? 9 : 5) + Math.floor(Math.sin(this.animTime * 18) * 2);
      g.tri(cx, cy + 20 - flameH, cx - 6, cy + 21, cx + 6, cy + 21, 3);
      g.line(cx - 2, cy + 21, cx + 2, cy + 21, 2);

      // Flickering Embers around the retort
      if (this.state === 'TRANSMUTING') {
        const ex1 = cx + Math.sin(this.animTime * 12) * 14;
        const ey1 = cy + 8 - ((this.animTime * 20) % 20);
        g.px(Math.floor(ex1), Math.floor(ey1), 3);

        const ex2 = cx - Math.cos(this.animTime * 15) * 14;
        const ey2 = cy + 8 - (((this.animTime + 0.5) * 22) % 20);
        g.px(Math.floor(ex2), Math.floor(ey2), 3);
      }
    },

    // ------------------------------------------------------------------------
    // RENDER HELPER: Action Buttons Bar
    // ------------------------------------------------------------------------
    renderActionButtons(g, sx, sy) {
      const by = 84 + sy;

      // [CLEAR] Button (X: 16..62, W: 46, H: 17)
      const clearActive = (this.focusZone === 'buttons' && this.btnIndex === 0);
      g.box(16 + sx, by, 46, 17, clearActive ? 3 : 1);
      if (clearActive) g.box(17 + sx, by + 1, 44, 15, 2);
      g.textC("CLEAR", by + 6, clearActive ? 3 : 2);

      // [★ TRANSMUTE ★] Button (X: 74..182, W: 108, H: 17)
      const transActive = (this.focusZone === 'buttons' && this.btnIndex === 1);
      const readyToBrew = (this.slot1 && this.slot2);
      const brewBorderC = readyToBrew ? (this.animTime % 0.4 < 0.2 ? 3 : 2) : (transActive ? 3 : 1);

      g.box(74 + sx, by, 108, 17, brewBorderC);
      if (transActive || (readyToBrew && this.animTime % 0.6 < 0.3)) {
        g.box(75 + sx, by + 1, 106, 15, 2);
      }
      g.textC(readyToBrew ? "★ TRANSMUTE ★" : "TRANSMUTE", by + 6, readyToBrew ? 3 : (transActive ? 3 : 1));

      // [? HINT] Button (X: 194..240, W: 46, H: 17)
      const hintActive = (this.focusZone === 'buttons' && this.btnIndex === 2);
      g.box(194 + sx, by, 46, 17, hintActive ? 3 : 1);
      if (hintActive) g.box(195 + sx, by + 1, 44, 15, 2);
      g.textC("? HINT", by + 6, hintActive ? 3 : 2);
    },

    // ------------------------------------------------------------------------
    // RENDER HELPER: Reagent Shelf Grid (6 Cols x 3 Rows = 18 items per page)
    // ------------------------------------------------------------------------
    renderShelfGrid(g, sx, sy) {
      const pageStart = this.page * 18;

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 6; c++) {
          const index = pageStart + (r * 6 + c);
          const cx = 17 + c * 37 + sx;
          const cy = 126 + r * 21 + sy;

          if (index < this.discovered.length) {
            const elKey = this.discovered[index];
            const el = ELEMENTS[elKey];
            const isSelected = (this.focusZone === 'shelf' && this.cursor === index);

            // Cell border
            g.box(cx, cy, 35, 19, isSelected ? 3 : 1);
            if (isSelected) {
              g.box(cx + 1, cy + 1, 33, 17, 2);
            }

            // 8x8 Element Icon
            g.sprite(cx + 3, cy + 5, 8, 8, el.icon, isSelected ? 3 : 2, 1);

            // 4-letter tag
            g.text(el.tag, cx + 13, cy + 7, isSelected ? 3 : 2);
          } else {
            // Empty placeholder slot
            g.box(cx, cy, 35, 19, 0);
            g.px(cx + 17, cy + 9, 1); // center dot
          }
        }
      }
    },

    // ------------------------------------------------------------------------
    // RENDER HELPER: Hovered Element Inspector Banner
    // ------------------------------------------------------------------------
    renderInspector(g, sx, sy) {
      g.line(12, 191, 244, 191, 1);

      if (this.cursor >= 0 && this.cursor < this.discovered.length) {
        const elKey = this.discovered[this.cursor];
        const el = ELEMENTS[elKey];

        // Large 16x16 icon (scale 2)
        g.box(18 + sx, 195 + sy, 20, 20, 2);
        g.sprite(20 + sx, 197 + sy, 8, 8, el.icon, 3, 2);

        // Element Name & Tier Badge
        g.text(el.name, 44 + sx, 196 + sy, 3);
        g.textR("TIER " + el.tier + ": " + el.tierName, 238 + sx, 196 + sy, 2);

        // Lore description
        g.text(el.desc, 44 + sx, 207 + sy, 1);
      } else {
        g.textC("SELECT ANY REAGENT TO INSPECT", 204 + sy, 1);
      }
    },

    // ------------------------------------------------------------------------
    // RENDER HELPER: Particles (Sparkles & Failure Smoke)
    // ------------------------------------------------------------------------
    renderParticles(g) {
      // Sparks
      for (let i = 0; i < this.sparkles.length; i++) {
        const p = this.sparkles[i];
        if (p.x >= 0 && p.x < 256 && p.y >= 0 && p.y < 240) {
          g.px(Math.floor(p.x), Math.floor(p.y), p.c);
        }
      }

      // Smoke puffs
      for (let i = 0; i < this.smoke.length; i++) {
        const sm = this.smoke[i];
        if (sm.x >= 0 && sm.x < 256 && sm.y >= 0 && sm.y < 240) {
          if (sm.size > 2) g.disc(Math.floor(sm.x), Math.floor(sm.y), 2, 1);
          else g.px(Math.floor(sm.x), Math.floor(sm.y), 1);
        }
      }
    },

    // ------------------------------------------------------------------------
    // MODAL POPUP: Brand New Discovery Celebration
    // ------------------------------------------------------------------------
    renderDiscoveryModal(g) {
      // Dithered dark phosphor backdrop
      g.dither(0, 0, 256, 240, 0, 1);

      // Ornate Parchment Frame
      g.rect(20, 24, 216, 188, 0);
      g.box(20, 24, 216, 188, 2);
      g.box(22, 26, 212, 184, 3);

      // Header Banner
      g.textC("★ NEW DISCOVERY! ★", 34, 3);
      g.line(30, 44, 226, 44, 2);

      if (this.newElem) {
        // Large Center Icon (scale 3 = 24x24 px)
        g.box(112, 50, 32, 32, 2);
        g.rect(113, 51, 30, 30, 1);
        g.sprite(116, 54, 8, 8, this.newElem.icon, 3, 3);

        // Element Name
        g.textC(this.newElem.name, 90, 3);

        // Tier classification
        g.textC("TIER " + this.newElem.tier + " - " + this.newElem.tierName, 102, 2);

        // Formula line
        g.textC(this.newFormula + " = " + this.newElem.name, 116, 3);

        // Lore description
        g.textC(this.newElem.desc, 134, 1);

        // Score bonus
        g.textC("+150 ALCHEMY POINTS", 154, 3);
      }

      // Dismiss instruction
      const flash = this.animTime % 0.6 < 0.3;
      g.textC("[A] OR TAP TO CONTINUE", 186, flash ? 3 : 2);
    },

    // ------------------------------------------------------------------------
    // MODAL POPUP: Ancient Alchemical Grimoire (Hint Riddle)
    // ------------------------------------------------------------------------
    renderHintModal(g) {
      g.dither(0, 0, 256, 240, 0, 1);

      g.rect(16, 26, 224, 186, 0);
      g.box(16, 26, 224, 186, 2);
      g.box(18, 28, 220, 182, 3);

      g.textC("ANCIENT ALCHEMICAL GRIMOIRE", 36, 3);
      g.line(26, 46, 230, 46, 2);

      if (this.curHint) {
        g.textC("UNSOLVED FORMULA RIDDLE:", 54, 2);

        // Wrapped riddle text
        const lines = wrapText(this.curHint.riddle, 38);
        for (let i = 0; i < lines.length; i++) {
          g.textC(lines[i], 72 + i * 11, 3);
        }

        // On Easy difficulty: show exact reagents
        const diff = (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : 1;
        if (diff === 0) {
          g.line(30, 130, 226, 130, 1);
          g.textC("REAGENTS: " + this.curHint.a + " & " + this.curHint.b, 136, 3);
        }

        g.textC("HINTS SOUGHT: " + this.hintsUsed, 160, 1);
      } else {
        g.textC("THE VEIL IS TRANSCENDED!", 74, 3);
        g.textC("ALL CURRENT FORMULAS DISCOVERED.", 94, 2);
        g.textC("CONTINUE TRANSMUTING HIGHER ESSENCES!", 114, 1);
      }

      g.textC("[B] OR TAP TO CLOSE", 186, 2);
    },

    // ------------------------------------------------------------------------
    // MODAL POPUP: Magnum Opus Endgame Victory!
    // ------------------------------------------------------------------------
    renderVictoryModal(g) {
      g.dither(0, 0, 256, 240, 0, 1);

      g.rect(14, 20, 228, 200, 0);
      g.box(14, 20, 228, 200, 3);
      g.box(16, 22, 224, 196, 2);

      // Mystic alchemical circle
      const pulseR = 18 + Math.floor(Math.sin(this.animTime * 4) * 3);
      g.circle(128, 54, pulseR, 2);
      g.circle(128, 54, 12, 3);
      g.sprite(124, 50, 8, 8, ELEMENTS["PHILOSOPHER'S STONE"].icon, 3, 1);

      g.textC("★ MAGNUM OPUS COMPLETE ★", 80, 3);
      g.textC("THE GREAT WORK IS ACCOMPLISHED!", 94, 2);

      g.line(26, 106, 230, 106, 2);

      g.textC("TITLE: SUPREME MASTER ALCHEMIST", 114, 3);
      g.textC("ELEMENTS DISCOVERED: " + this.discovered.length + " / 38", 128, 2);
      g.textC("RECIPES UNVEILED: " + this.discoveredRecipes.length, 140, 2);
      g.textC("FINAL ALCHEMY SCORE: " + this.score, 154, 3);

      const flash = this.animTime % 0.6 < 0.3;
      g.textC("[A] OR TAP TO CONTINUE", 182, flash ? 3 : 2);
      g.textC("[START] NEW EXPERIMENT", 196, 1);
    }
  };

})();
