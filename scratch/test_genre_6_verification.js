// scratch/test_genre_6_verification.js
// Deep verification suite for Genre 6 (Racing & Vehicles / Sports, #061 - #070)
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
console.log("DEEP VERIFICATION SUITE: GENRE 6 (RACING & VEHICLES / SPORTS, #061 - #070)");
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
// #061: 3D RACER
// ----------------------------------------------------------------------------
runTest(61, '../js/cartridges/cart_061_3d_racer.js', (cart) => {
  cart.init();
  assert.strictEqual(cart.state, 'RACE');
  assert(cart.track.length > 500, "Pseudo-3D road track generated");
  assert(cart.traffic.length > 0, "Rival traffic cars spawned");
  assert(cart.sprites.length > 0, "Roadside scenery spawned");
  cart.render(g);

  // Accelerate [A]
  PAD.state.a = true;
  for (let i = 0; i < 35; i++) cart.update(0.04);
  PAD.state.a = false;
  assert(cart.speed > 80, "Car accelerated down highway");
  assert(cart.dist > 0 || cart.playerZ > 0, "Distance accumulated");

  // Steer Left
  PAD.state.left = true;
  cart.update(0.04);
  PAD.state.left = false;
  assert(cart.carX < 0, "Car steered left");

  // Brake [B]
  const prevSpeed = cart.speed;
  PAD.state.b = true;
  for (let i = 0; i < 10; i++) cart.update(0.04);
  PAD.state.b = false;
  assert(cart.speed < prevSpeed, "Brakes decelerated car");
});

// ----------------------------------------------------------------------------
// #062: RETRO GOLF
// ----------------------------------------------------------------------------
runTest(62, '../js/cartridges/cart_062_retro_golf.js', (cart) => {
  cart.init();
  assert.strictEqual(cart.holes.length, 9, "9-Hole tournament ready");
  assert.strictEqual(cart.currentHoleIdx, 0, "Starts on Hole 1");
  assert(cart.clubs.length === 4, "4 clubs available");
  cart.render(g);

  // Cycle Club [B]
  const initialClub = cart.clubIdx;
  PAD.hits.b = true;
  cart.update(0.04);
  PAD.hits.b = false;
  assert.notStrictEqual(cart.clubIdx, initialClub, "Club cycled");

  // Start swing meter [A]
  PAD.hits.a = true;
  cart.update(0.04);
  PAD.hits.a = false;
  assert.strictEqual(cart.state, 'POWER', "Power meter active");

  // Advance meter and lock power
  cart.update(0.2);
  PAD.hits.a = true;
  cart.update(0.04);
  PAD.hits.a = false;
  assert.strictEqual(cart.state, 'ACCURACY', "Accuracy snap active");

  // Snap accuracy and strike ball
  PAD.hits.a = true;
  cart.update(0.04);
  PAD.hits.a = false;
  assert.strictEqual(cart.state, 'FLIGHT', "Ball launched in flight");
  assert(cart.ball.inAir, "Ball is airborne");

  // Advance flight until touchdown
  for (let i = 0; i < 30; i++) cart.update(0.04);
  cart.render(g);
});

// ----------------------------------------------------------------------------
// #063: AIR HOCKEY
// ----------------------------------------------------------------------------
runTest(63, '../js/cartridges/cart_063_air_hockey.js', (cart) => {
  cart.init();
  assert.strictEqual(cart.state, 'PLAY');
  assert.strictEqual(cart.playerScore, 0);
  assert.strictEqual(cart.aiScore, 0);
  cart.render(g);

  // Player paddle movement
  const initialX = cart.player.x;
  PAD.state.right = true;
  cart.update(0.04);
  PAD.state.right = false;
  assert(cart.player.x > initialX, "Player mallet moved right");

  // Puck movement & wall rebounds
  const initPuckX = cart.puck.x;
  // Collision resolution test
  cart.state = 'PLAY';
  cart.player.vx = 0;
  cart.player.vy = 0;
  cart.puck.x = cart.player.x + 10;
  cart.puck.y = cart.player.y;
  cart.puck.vx = -50;
  cart.puck.vy = 0;
  cart.update(0.02);
  assert(cart.puck.vx > 0, "Puck rebounded off player mallet");
});

// ----------------------------------------------------------------------------
// #064: PENALTY KICK
// ----------------------------------------------------------------------------
runTest(64, '../js/cartridges/cart_064_penalty_kick.js', (cart) => {
  cart.init();
  assert.strictEqual(cart.round, 1);
  assert.strictEqual(cart.state, 'AIM');
  cart.render(g);

  // Aim crosshair
  PAD.state.left = true;
  cart.update(0.04);
  PAD.state.left = false;
  assert(cart.aimX < 128, "Aim crosshair adjusted left");

  // Start power meter [A]
  PAD.hits.a = true;
  cart.update(0.04);
  PAD.hits.a = false;
  assert.strictEqual(cart.state, 'POWER');

  // Curve ball and shoot
  PAD.state.right = true;
  cart.update(0.1);
  PAD.state.right = false;
  assert(cart.curve > 0, "Curve spin applied");

  PAD.hits.a = true;
  cart.update(0.04);
  PAD.hits.a = false;
  assert.strictEqual(cart.state, 'FLIGHT', "Ball shot towards goal net");

  // Advance flight until goal plane resolved
  for (let i = 0; i < 30; i++) cart.update(0.04);
  assert.strictEqual(cart.state, 'OUTCOME', "Goal line outcome resolved");
  cart.render(g);
});

// ----------------------------------------------------------------------------
// #065: ARCHERY
// ----------------------------------------------------------------------------
runTest(65, '../js/cartridges/cart_065_archery.js', (cart) => {
  cart.init();
  assert.strictEqual(cart.currentEnd, 1);
  assert.strictEqual(cart.arrowsLeft, 15);
  assert.strictEqual(cart.state, 'AIM');
  cart.render(g);

  // Draw bow [A]
  PAD.hits.a = true;
  PAD.state.a = true;
  cart.update(0.04);
  PAD.hits.a = false;
  assert.strictEqual(cart.state, 'DRAW', "Bow string drawing");

  // Hold draw for power
  for (let i = 0; i < 15; i++) cart.update(0.04);
  assert(cart.drawTime > 0.5, "Tension built up");

  // Release bow string
  PAD.state.a = false;
  cart.update(0.04);
  assert.strictEqual(cart.state, 'FLIGHT', "Arrow loosed towards target");

  // Advance flight to impact
  for (let i = 0; i < 25; i++) cart.update(0.04);
  assert.strictEqual(cart.arrowsLeft, 14, "Arrow recorded in target");
  assert(cart.totalScore >= 0, "Score calculated");
  cart.render(g);
});

// ----------------------------------------------------------------------------
// #066: SLALOM SKI
// ----------------------------------------------------------------------------
runTest(66, '../js/cartridges/cart_066_slalom_ski.js', (cart) => {
  cart.init();
  assert.strictEqual(cart.state, 'RACE');
  assert(cart.gates.length >= 25, "Slalom gates generated");
  assert(cart.scenery.length > 0, "Pine trees and snow generated");
  cart.render(g);

  // Carve right
  PAD.state.right = true;
  for (let i = 0; i < 8; i++) cart.update(0.04);
  PAD.state.right = false;
  assert(cart.skierX > 128, "Skier carved right");
  assert(cart.carveAngle > 0, "Ski edge angled");

  // Aerodynamic tuck [Down]
  const initialSpeed = cart.speed;
  PAD.state.down = true;
  for (let i = 0; i < 10; i++) cart.update(0.04);
  PAD.state.down = false;
  assert(cart.speed > initialSpeed, "Tuck posture boosted speed");

  // Advance downhill
  for (let i = 0; i < 30; i++) cart.update(0.04);
  assert(cart.courseDist > 0, "Course distance accumulated");
});

// ----------------------------------------------------------------------------
// #067: BOXING 2D
// ----------------------------------------------------------------------------
runTest(67, '../js/cartridges/cart_067_boxing_2d.js', (cart) => {
  cart.init();
  assert.strictEqual(cart.bout, 1);
  assert.strictEqual(cart.state, 'FIGHT');
  assert.strictEqual(cart.player.hp, 100);
  cart.render(g);

  // Throw Left Jab [A]
  PAD.hits.a = true;
  cart.update(0.04);
  PAD.hits.a = false;
  assert.strictEqual(cart.player.state, 'JAB', "Player threw left jab");

  // Recovery past jab
  for (let i = 0; i < 8; i++) cart.update(0.04);
  assert.strictEqual(cart.player.state, 'IDLE', "Player returned to guard");

  // Dodge Left
  PAD.state.left = true;
  cart.update(0.04);
  PAD.state.left = false;
  assert.strictEqual(cart.player.state, 'DODGE_L', "Player dodged left");

  // Duck
  for (let i = 0; i < 10; i++) cart.update(0.04);
  PAD.state.down = true;
  cart.update(0.04);
  PAD.state.down = false;
  assert.strictEqual(cart.player.state, 'DUCK', "Player ducked under punch");
});

// ----------------------------------------------------------------------------
// #068: FISHING ROD
// ----------------------------------------------------------------------------
runTest(68, '../js/cartridges/cart_068_fishing_rod.js', (cart) => {
  cart.init();
  assert.strictEqual(cart.state, 'CAST');
  cart.render(g);

  // Cast line [A]
  cart.update(0.1);
  PAD.hits.a = true;
  cart.update(0.04);
  PAD.hits.a = false;
  assert.strictEqual(cart.state, 'WAIT', "Line cast into river");

  // Trigger bite
  cart.timer = 0.01;
  cart.update(0.04);
  assert.strictEqual(cart.state, 'BITE', "Fish bit the hook");

  // Strike hookset [A]
  PAD.hits.a = true;
  cart.update(0.04);
  PAD.hits.a = false;
  assert.strictEqual(cart.state, 'FIGHT', "Fish hooked! Tension fight started");
  assert(cart.hookedFish, "Fish identified");

  // Reel in fish
  PAD.state.a = true;
  const initialDist = cart.fishDist;
  for (let i = 0; i < 10; i++) cart.update(0.04);
  PAD.state.a = false;
  assert(cart.fishDist < initialDist, "Reeling drew fish closer to shore");
});

// ----------------------------------------------------------------------------
// #069: CURLING
// ----------------------------------------------------------------------------
runTest(69, '../js/cartridges/cart_069_curling.js', (cart) => {
  cart.init();
  assert.strictEqual(cart.end, 1);
  assert.strictEqual(cart.state, 'AIM');
  cart.render(g);

  // Toggle Curl Handle [B]
  const initialCurl = cart.curlDirection;
  PAD.hits.b = true;
  cart.update(0.04);
  PAD.hits.b = false;
  assert.notStrictEqual(cart.curlDirection, initialCurl, "Handle curl toggled");

  // Start force meter [A]
  PAD.hits.a = true;
  cart.update(0.04);
  PAD.hits.a = false;
  assert.strictEqual(cart.state, 'WEIGHT');

  // Throw stone
  cart.update(0.15);
  PAD.hits.a = true;
  cart.update(0.04);
  PAD.hits.a = false;
  assert.strictEqual(cart.state, 'GLIDE', "Stone gliding across ice sheet");
  assert(cart.activeStone, "Active stone in motion");

  // Sweep ice
  PAD.hits.a = true;
  cart.update(0.04);
  PAD.hits.a = false;
  assert(cart.sweepHeat > 0, "Broom sweeping reduced ice friction");

  // Advance until rest
  for (let i = 0; i < 60; i++) cart.update(0.04);
  cart.render(g);
});

// ----------------------------------------------------------------------------
// #070: BOWLING
// ----------------------------------------------------------------------------
runTest(70, '../js/cartridges/cart_070_bowling.js', (cart) => {
  cart.init();
  assert.strictEqual(cart.currentFrame, 1);
  assert.strictEqual(cart.ballNumber, 1);
  assert.strictEqual(cart.state, 'STANCE');
  assert.strictEqual(cart.pins.length, 10, "10 pins racked on deck");
  cart.render(g);

  // Position stance on approach
  PAD.state.left = true;
  cart.update(0.04);
  PAD.state.left = false;
  assert(cart.stanceX < 128, "Stance shifted left");

  // Start power meter [A]
  PAD.hits.a = true;
  cart.update(0.04);
  PAD.hits.a = false;
  assert.strictEqual(cart.state, 'POWER');

  // Add hook spin and bowl
  PAD.state.left = true;
  cart.update(0.1);
  PAD.state.left = false;
  assert(cart.hookSpin < 0, "Hook spin applied");

  PAD.hits.a = true;
  cart.update(0.04);
  PAD.hits.a = false;
  assert.strictEqual(cart.state, 'ROLL', "Ball rolling down lane");

  // Advance roll into pins
  for (let i = 0; i < 40; i++) cart.update(0.04);
  assert.strictEqual(cart.state, 'SWEEP', "Pins impacted and swept");
  assert(cart.frames[0].length === 1, "Roll recorded on score sheet");
  cart.render(g);
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
