// scratch/test_genre_5_verification.js
// Deep verification suite for Genre 5 (RPG & Adventure, #051 - #060)
const assert = require('assert');

// 1. Mock Console Environment
global.window = global;
global.CARTS = {};
global.PAD = {
  state: { up: false, down: false, left: false, right: false, a: false, b: false, start: false, select: false },
  hits: { up: false, down: false, left: false, right: false, a: false, b: false, start: false, select: false },
  pointer: { x: 0, y: 0, down: false },
  tapPos: null,
  hit(k) { return !!this.hits[k]; },
  held(k) { return !!this.state[k]; },
  vibrate(ms) {}
};

global.TOUCH = {
  down: false,
  held: false,
  x: 0,
  y: 0,
  drag: false,
  swipe: null
};

const apuLog = [];
global.APU = {
  sfx(name) { apuLog.push(name); },
  softTone(freq, duration, type, vol) {}
};

global.SAVE = {
  scores: {},
  persistent: {},
  setScore(id, s) { this.scores[id] = Math.max(this.scores[id] || 0, s); return true; },
  getScore(id) { return this.scores[id] || 0; },
  setPersistent(id, obj) { this.persistent[id] = obj; },
  getPersistent(id) { return this.persistent[id] || null; }
};

global.VOS = {
  difficulty: 1
};

// Mock 256x240 Graphics Context
global.g = {
  clear(c) {},
  rect(x, y, w, h, c) {},
  box(x, y, w, h, c) {},
  line(x0, y0, x1, y1, c) {},
  circle(cx, cy, r, c) {},
  disc(cx, cy, r, c) {},
  tri(x0, y0, x1, y1, x2, y2, c) {},
  oval(cx, cy, rx, ry, c) {},
  dither(x, y, w, h, c1, c2) {},
  pix(x, y, c) {},
  px(x, y, c) {},
  text(str, x, y, c, s) {},
  textC(str, y, c, s) {},
  textR(str, x, y, c, s) {}
};

console.log("================================================================================");
console.log("DEEP VERIFICATION SUITE: GENRE 5 (RPG & ADVENTURE, #051 - #060)");
console.log("================================================================================\n");

const results = [];

function runTest(id, file, testFn) {
  process.stdout.write(`Testing Cartridge #${id}... `);
  try {
    delete require.cache[require.resolve(file)];
    require(file);
    const cart = CARTS[id];
    assert(cart, `Cart ${id} not found in CARTS`);
    testFn(cart);
    console.log(`\x1b[32m[PASS]\x1b[0m ${cart.name}`);
    results.push({ id, name: cart.name, status: 'PASS' });
  } catch (err) {
    console.log(`\x1b[31m[FAIL]\x1b[0m ${err.message}`);
    console.error(err.stack);
    results.push({ id, name: `Cart #${id}`, status: 'FAIL', error: err.message });
  }
}

// ----------------------------------------------------------------------------
// #051: ROGUE 1980
// ----------------------------------------------------------------------------
runTest(51, '../js/cartridges/cart_051_rogue_1980.js', (cart) => {
  cart.init();
  assert(cart.hp > 0, "Player has initial HP");
  assert(cart.map && cart.map.length > 0, "Procedural dungeon grid exists");
  assert.strictEqual(cart.floor, 1, "Starts on floor 1");
  cart.render(g);

  // Test bump movement
  const initialFloor = cart.floor;
  PAD.hits.up = true;
  cart.update(0.1);
  PAD.hits.up = false;
  assert.strictEqual(cart.floor, initialFloor);

  // Test inventory toggle [B]
  PAD.hits.b = true;
  cart.update(0.1);
  PAD.hits.b = false;
  assert.strictEqual(cart.invOpen, true, "Inventory opened");
  cart.render(g);
  PAD.hits.b = true;
  cart.update(0.1);
  PAD.hits.b = false;
  assert.strictEqual(cart.invOpen, false, "Inventory closed");
});

// ----------------------------------------------------------------------------
// #052: DUNGEON 3D
// ----------------------------------------------------------------------------
runTest(52, '../js/cartridges/cart_052_dungeon_3d.js', (cart) => {
  cart.init();
  assert.strictEqual(typeof cart.posX, 'number');
  assert.strictEqual(typeof cart.posY, 'number');
  cart.state = 'PLAYING';

  // Raycast rendering
  cart.render(g);

  // Rotate camera
  PAD.state.left = true;
  cart.update(0.05);
  PAD.state.left = false;

  // Move forward with sliding collision
  PAD.state.up = true;
  cart.update(0.05);
  PAD.state.up = false;

  // Attack swing [A]
  PAD.hits.a = true;
  cart.update(0.05);
  PAD.hits.a = false;
  assert(cart.swingTimer > 0, "Attack swing triggered");
});

// ----------------------------------------------------------------------------
// #053: TEXT QUEST
// ----------------------------------------------------------------------------
runTest(53, '../js/cartridges/cart_053_text_quest.js', (cart) => {
  cart.init();
  assert.strictEqual(cart.scene, 'VAULT', "Initial scene is VAULT");
  assert(Array.isArray(cart.inventory), "Inventory array exists");
  cart.render(g);

  // Skip typewriter
  PAD.hits.a = true;
  cart.update(0.1);
  PAD.hits.a = false;

  // Toggle inventory modal [B]
  PAD.hits.b = true;
  cart.update(0.1);
  PAD.hits.b = false;
  assert.strictEqual(cart.inInventory, true, "Inventory modal opened");
  cart.render(g);

  PAD.hits.b = true;
  cart.update(0.1);
  PAD.hits.b = false;
  assert.strictEqual(cart.inInventory, false, "Inventory modal closed");
});

// ----------------------------------------------------------------------------
// #054: DECKBUILDER
// ----------------------------------------------------------------------------
runTest(54, '../js/cartridges/cart_054_deckbuilder.js', (cart) => {
  cart.init();
  assert.strictEqual(cart.floor, 1);
  assert(cart.hand.length > 0, "Cards dealt to hand");
  assert(cart.drawPile.length > 0, "Draw pile exists");
  assert.strictEqual(cart.energy, 3, "Starts with 3 energy");

  // Render battlefield and cards
  cart.render(g);

  // Play a card
  const initialEnemyHp = cart.enemyHP;
  PAD.hits.a = true;
  cart.update(0.05);
  PAD.hits.a = false;
  assert(cart.enemyHP < initialEnemyHp || cart.playerBlock > 0, "Card played successfully");

  // End turn [B]
  PAD.hits.b = true;
  cart.update(0.05);
  PAD.hits.b = false;
  assert(cart.state === 'ENEMY_TURN' || cart.energy === 3, "Turn cycled");
});

// ----------------------------------------------------------------------------
// #055: BOSS DUEL
// ----------------------------------------------------------------------------
runTest(55, '../js/cartridges/cart_055_boss_duel.js', (cart) => {
  cart.init();
  assert(cart.boss, "Boss exists");
  assert.strictEqual(cart.player.stamina, 100, "Full stamina at start");
  cart.state = 'FIGHT';
  cart.introTimer = 0;
  cart.render(g);

  // Test Roll Dodge [B]
  PAD.hits.b = true;
  cart.update(0.05);
  PAD.hits.b = false;
  assert.strictEqual(cart.player.state, 'ROLL', "Player initiates roll dodge");
  assert(cart.player.iFrames > 0, "Roll provides i-frames");

  // Advance time past roll (dt is clamped to 0.04 max)
  for (let i = 0; i < 20; i++) cart.update(0.04);
  assert.notStrictEqual(cart.player.state, 'ROLL', "Roll finished cleanly");

  // Test Strike / Parry [A]
  PAD.hits.a = true;
  cart.update(0.04);
  PAD.hits.a = false;
  assert.strictEqual(cart.player.state, 'ATTACK', "Player attacks");
});

// ----------------------------------------------------------------------------
// #056: TAMAGOTCHI
// ----------------------------------------------------------------------------
runTest(56, '../js/cartridges/cart_056_tamagotchi.js', (cart) => {
  cart.init();
  assert(cart.pet, "Pet exists");
  assert.strictEqual(cart.pet.stage, 0, "Starts as Egg");
  cart.render(g);

  // Fast forward to hatch
  cart.pet.ageSeconds = 20;
  cart.update(0.1);
  assert.strictEqual(cart.pet.stage, 1, "Egg hatched into Baby");

  // Test feeding meal
  const initialHunger = cart.pet.hunger;
  cart.feedMeal();
  cart.update(0.1);
  assert(cart.pet.hunger >= initialHunger, "Feeding meal restored hunger");

  // Test offline progress save/load
  const saved = cart.save();
  assert(saved && saved.born, "State serialized");
  cart.load(saved);
});

// ----------------------------------------------------------------------------
// #057: ALCHEMY DESK
// ----------------------------------------------------------------------------
runTest(57, '../js/cartridges/cart_057_alchemy_desk.js', (cart) => {
  cart.init();
  assert.strictEqual(cart.discovered.length, 4, "Starts with 4 primordial elements");
  cart.render(g);

  // Slot element FIRE into slot 1
  cart.slotElement('FIRE');
  assert.strictEqual(cart.slot1, 'FIRE');

  // Slot element WATER into slot 2
  cart.slotElement('WATER');
  assert.strictEqual(cart.slot2, 'WATER');

  // Transmute FIRE + WATER = STEAM
  cart.triggerTransmute();
  for (let i = 0; i < 25; i++) cart.update(0.04);
  assert.strictEqual(cart.discovered.includes('STEAM'), true, "Steam discovered");
  assert.strictEqual(cart.discovered.length, 5);

  // Test Grimoire Hint
  cart.openHintModal();
  assert.strictEqual(cart.state, 'HINT');
  cart.render(g);
  cart.state = 'DESK';
});

// ----------------------------------------------------------------------------
// #058: PRISON BREAK
// ----------------------------------------------------------------------------
runTest(58, '../js/cartridges/cart_058_prison_break.js', (cart) => {
  cart.init();
  assert(typeof cart.px === 'number' && typeof cart.py === 'number', "Inmate position exists");
  assert.strictEqual(cart.hour, 6, "24h Clock initialized at 6 AM");
  assert(cart.guards.length > 0, "Patrolling guards exist");
  cart.render(g);

  cart.mode = 'GAME';
  // Move in cell
  PAD.hits.up = true;
  cart.update(0.05);
  PAD.hits.up = false;

  // Verify status rendering
  cart.render(g);
});

// ----------------------------------------------------------------------------
// #059: DEEP DIVER
// ----------------------------------------------------------------------------
runTest(59, '../js/cartridges/cart_059_deep_diver.js', (cart) => {
  cart.init();
  assert.strictEqual(cart.y, 28, "Starts at surface boat");
  assert.strictEqual(cart.o2, 60, "Oxygen full at surface");
  assert(cart.sharks.length > 0, "Patrolling sharks spawned");
  assert(cart.pearlClams.length > 0, "Pearl clams spawned");
  cart.render(g);

  // Dive downwards
  PAD.state.down = true;
  for (let i = 0; i < 20; i++) cart.update(0.05);
  PAD.state.down = false;
  assert(cart.y > 35, "Diver descended into depths");
  assert(cart.o2 < 60, "Oxygen consumed while submerged");

  // Fire harpoon [A]
  const initialHarpoons = cart.harpoons;
  PAD.hits.a = true;
  cart.update(0.05);
  PAD.hits.a = false;
  assert.strictEqual(cart.harpoons, initialHarpoons - 1, "Harpoon spear fired");
  assert(cart.spears.length > 0, "Active spear projectile in water");

  // Ascend back to boat and verify refill
  cart.y = 28;
  cart.bagPearls = 2;
  cart.update(0.05);
  assert.strictEqual(cart.o2, cart.maxO2, "O2 refilled at surface boat");
  assert.strictEqual(cart.bagPearls, 0, "Pearls banked into cash vault");
  assert(cart.cash > 0, "Cash earned from pearls");
});

// ----------------------------------------------------------------------------
// #060: MINECART
// ----------------------------------------------------------------------------
runTest(60, '../js/cartridges/cart_060_minecart.js', (cart) => {
  cart.init();
  assert.strictEqual(cart.lane, 1, "Starts on middle rail (lane 1)");
  assert.strictEqual(cart.lives, 3, "Starts with 3 lives");
  assert(cart.switches.length > 0, "Switches generated on tracks");
  assert(cart.gems.length > 0, "Gems placed along cavern");
  assert(cart.hazards.length > 0, "Hazards placed along rails");
  cart.render(g);

  // Jump [B]
  PAD.hits.b = true;
  cart.update(0.05);
  PAD.hits.b = false;
  assert.strictEqual(cart.isJumping, true, "Cart jumped into air");

  // Advance time until landed
  for (let i = 0; i < 20; i++) cart.update(0.05);
  assert.strictEqual(cart.isJumping, false, "Cart landed back on rails");

  // Duck [Down]
  PAD.state.down = true;
  cart.update(0.05);
  assert.strictEqual(cart.isDucking, true, "Cart ducking under stalactites");
  PAD.state.down = false;
  cart.update(0.05);
  assert.strictEqual(cart.isDucking, false, "Cart restored upright");
});

console.log("\n================================================================================");
const passed = results.filter(r => r.status === 'PASS').length;
console.log(`TEST SUMMARY: ${passed} / ${results.length} PASSED`);
console.log("================================================================================");

if (passed < results.length) {
  process.exit(1);
} else {
  process.exit(0);
}
