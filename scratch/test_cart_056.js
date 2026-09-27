// Comprehensive test suite for Cartridge #056: TAMAGOTCHI
const assert = require('assert');

// Mock Console Environment
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

const apuLog = [];
global.APU = {
  sfx(name) { apuLog.push(name); }
};

global.SAVE = {
  score: 0,
  persistent: {},
  setScore(id, s) { this.score = Math.max(this.score, s); return true; },
  getScore(id) { return this.score; },
  setPersistent(id, obj) { this.persistent[id] = obj; },
  getPersistent(id) { return this.persistent[id] || null; }
};

global.VOS = {
  difficulty: 1
};

// Mock Graphics Context
global.g = {
  clear(c) {},
  rect(x, y, w, h, c) {},
  box(x, y, w, h, c) {},
  line(x0, y0, x1, y1, c) {},
  circle(cx, cy, r, c) {},
  disc(cx, cy, r, c) {},
  tri(x0, y0, x1, y1, x2, y2, c) {},
  dither(x, y, w, h, c1, c2) {},
  px(x, y, c) {},
  text(str, x, y, c, s) {},
  textC(str, y, c, s) {},
  textR(str, x, y, c, s) {}
};

// Require cartridge
require('../js/cartridges/cart_056_tamagotchi.js');
const cart = CARTS[56];

console.log("Loaded Cart #56:", cart.name, "(id:", cart.id + ")");

// Test 1: Icon rendering
assert.strictEqual(typeof cart.icon, 'function');
cart.icon(g, 0, 0);
console.log("PASS: Icon rendered without error.");

// Test 2: Initialization
cart.init();
assert.strictEqual(cart.pet.stage, 0); // EGG
assert.strictEqual(cart.pet.hunger, 80);
assert.strictEqual(cart.pet.happy, 80);
assert.strictEqual(cart.pet.energy, 90);
console.log("PASS: Init correctly set default egg state.");

// Test 3: Rendering Egg and Room
cart.render(g);
console.log("PASS: Render egg and room executed successfully.");

// Test 4: Egg Hatching by aging
cart.pet.ageSeconds = 16;
cart.update(0.1);
assert.strictEqual(cart.pet.stage, 1); // BABY
console.log("PASS: Egg hatched into Baby after 15s.");

// Test 5: Feeding (Meal & Snack)
cart.menuIndex = 0; // FEED
cart.executeAction(0);
assert.strictEqual(cart.subMenu, 'FEED');
// Submenu Meal
PAD.hits.a = true;
cart.update(0.016);
PAD.hits.a = false;
assert.strictEqual(cart.pet.hunger, 100);
assert.strictEqual(cart.pet.weight, 6);
console.log("PASS: Meal fed successfully (+25 hunger capped at 100, +1 weight).");

// Snack
cart.actionAnim = null;
cart.pet.happy = 80;
cart.executeAction(0);
assert.strictEqual(cart.subMenu, 'FEED');
PAD.hits.right = true;
cart.update(0.016);
PAD.hits.right = false;
assert.strictEqual(cart.subIndex, 1);
PAD.hits.a = true;
cart.update(0.016);
PAD.hits.a = false;
assert(cart.pet.happy >= 94.9);
assert.strictEqual(cart.pet.weight, 8);
cart.actionAnim = null;
console.log("PASS: Snack fed successfully (+15 happy, +2 weight).");

// Test 6: Poop generation and Cleaning
cart.spawnPoop();
cart.spawnPoop();
assert.strictEqual(cart.pet.poops.length, 2);
assert.strictEqual(cart.pet.clean, 50);
cart.render(g); // Test poop rendering

// Shower clean
cart.executeAction(4); // CLEAN
assert.strictEqual(cart.pet.poops.length, 0);
assert.strictEqual(cart.pet.clean, 100);
cart.actionAnim = null;
console.log("PASS: Shower flushed away poops and restored 100% cleanliness.");

// Test 7: Lights Toggle and Sleeping
assert.strictEqual(cart.pet.lights, true);
cart.executeAction(1); // LIGHTS
assert.strictEqual(cart.pet.lights, false);
cart.render(g); // Test night overlay render
cart.executeAction(1);
assert.strictEqual(cart.pet.lights, true);
console.log("PASS: Lights toggle working correctly.");

// Test 8: Sickness & Medicine
cart.pet.sick = true;
cart.render(g); // Test sickness skull render
cart.executeAction(3); // MEDICINE
assert.strictEqual(cart.pet.sick, false);
cart.actionAnim = null;
console.log("PASS: Medicine cured sickness.");

// Test 9: Discipline (Praise & Scold)
cart.executeAction(5); // DISCIPLINE
assert.strictEqual(cart.subMenu, 'DISCIPLINE');
PAD.hits.a = true; // Praise
cart.update(0.016);
PAD.hits.a = false;
assert.strictEqual(cart.pet.discipline, 30);
cart.actionAnim = null;
console.log("PASS: Praise granted discipline.");

// Test 10: Mini-Game ("Heading / Guess Direction")
cart.executeAction(2); // PLAY
assert.strictEqual(cart.subMenu, 'GAME');
assert.strictEqual(cart.miniGame.round, 1);
cart.render(g); // Test minigame rendering
// Play all 5 rounds
for (let r = 1; r <= 5; r++) {
  assert.strictEqual(cart.miniGame.state, 'PROMPT');
  PAD.hits.left = true;
  cart.update(0.016);
  PAD.hits.left = false;
  assert.strictEqual(cart.miniGame.state, 'REVEAL');
  // Advance timer
  for (let step = 0; step < 50; step++) {
    cart.update(0.03);
  }
}
assert.strictEqual(cart.miniGame.state, 'RESULT');
PAD.hits.a = true;
cart.update(0.016);
PAD.hits.a = false;
assert.strictEqual(cart.subMenu, null);
console.log("PASS: Mini-game completed all 5 rounds cleanly.");

// Test 11: Direct Touch Petting
PAD.pointer = { x: cart.petX, y: cart.petY - 10, down: true };
const happyBefore = cart.pet.happy;
cart.update(0.016);
assert(cart.pet.happy >= happyBefore);
assert.strictEqual(cart.pet.patsReceived, 1);
assert(cart.particles.length > 0);
console.log("PASS: Direct touch petting triggered purr and heart particle.");
PAD.pointer.down = false;

// Test 12: Status Screen (3 pages)
cart.executeAction(6); // STATUS
assert.strictEqual(cart.subMenu, 'STATUS');
assert.strictEqual(cart.statusPage, 0);
cart.render(g);
PAD.hits.right = true;
cart.update(0.016);
PAD.hits.right = false;
assert.strictEqual(cart.statusPage, 1);
cart.render(g);
PAD.hits.right = true;
cart.update(0.016);
PAD.hits.right = false;
assert.strictEqual(cart.statusPage, 2);
cart.render(g);
PAD.hits.b = true;
cart.update(0.016);
PAD.hits.b = false;
assert.strictEqual(cart.subMenu, null);
console.log("PASS: Status screen all 3 pages rendered and navigated.");

// Test 13: Full Evolution Stages
cart.pet.stage = 1; // Baby
cart.pet.ageSeconds = 95;
cart.update(0.1);
assert.strictEqual(cart.pet.stage, 2); // CHILD
cart.render(g);

cart.pet.ageSeconds = 250;
cart.update(0.1);
assert.strictEqual(cart.pet.stage, 3); // TEEN
cart.render(g);

// Test Mametchi evolution (high discipline)
cart.pet.discipline = 80;
cart.pet.careMistakes = 0;
cart.pet.ageSeconds = 510;
cart.update(0.1);
assert.strictEqual(cart.pet.stage, 4); // ADULT
assert.strictEqual(cart.pet.adultSpecies, 0); // MAMETCHI
cart.render(g);

// Test Senior evolution
cart.pet.ageSeconds = 1250;
cart.update(0.1);
assert.strictEqual(cart.pet.stage, 5); // SENIOR
cart.render(g);

// Test Angel / Ghost stage
cart.pet.stage = 6; // ANGEL
cart.render(g);
console.log("PASS: All evolution stages (Baby, Child, Teen, Mametchi Adult, Senior, Angel) rendered perfectly.");

// Test 14: Save and Offline Load Simulation
cart.pet.stage = 4; // ADULT (living pet)
cart.pet.poops = [];
const saved = cart.save();
assert.strictEqual(typeof saved, 'object');
assert.strictEqual(saved.v, 2);
// Simulate loading 2 hours later
saved.lastTick = Date.now() - (2 * 3600 * 1000);
cart.load(saved);
assert(cart.pet.poops.length >= 1);
console.log("PASS: Offline progression simulation calculated hunger decay and poops over 2 hours.");

// Test 15: Score Saving
cart.commitSaveAndScore();
assert(SAVE.score > 0);
console.log("PASS: Score computed and committed to SAVE (Score:", SAVE.score, ").");

console.log("\nALL 15 TESTS PASSED WITH 100% SUCCESS!");
