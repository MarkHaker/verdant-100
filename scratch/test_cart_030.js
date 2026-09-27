// Headless test suite for Cartridge #030: MARBLE MAZE
const fs = require('fs');
const path = require('path');

// Mock browser globals
global.window = global;
global.CARTS = {};
global.PAD = {
  state: { up: false, down: false, left: false, right: false, a: false, b: false, start: false, select: false },
  hits: { up: false, down: false, left: false, right: false, a: false, b: false, start: false, select: false },
  pointer: { x: 0, y: 0, down: false },
  tilt: { x: 0, y: 0 },
  hit(k) { return !!this.hits[k]; },
  held(k) { return !!this.state[k]; },
  vibrate(ms) {}
};

global.APU = {
  softTone() {},
  tone() {},
  noise() {},
  sfx() {}
};

global.SAVE = {
  score: 0,
  data: { rec: {} },
  setScore(id, s) { this.score = Math.max(this.score, s); return true; },
  getScore(id) { return this.score; }
};

global.VOS = {
  difficulty: 1, // 0 = Easy, 1 = Normal, 2 = Hard
};

// Mock graphics context
global.g = {
  clear() {},
  rect() {},
  box() {},
  line() {},
  circle() {},
  disc() {},
  dither() {},
  px() {},
  text() {},
  textC() {},
  textR() {}
};

// Load cart
require(path.join(__dirname, '../js/cartridges/cart_030_marble_maze.js'));
const cart = CARTS[30];

console.log("=== MARBLE MAZE AUDIT SUITE ===");
console.log("Cartridge ID:", cart.id, cart.name, "Genre:", cart.genre);

// Test 1: init
cart.init();
console.log("✓ Initialized successfully. Start level:", cart.currentLevelIdx);
console.log("  Ball pos:", cart.bx, cart.by, "radius:", cart.br);

// Test 2: Verify all 8 levels are defined and possess necessary properties
console.log("\n--- Auditing 8 Levels ---");
cart.levels.forEach((lvl, idx) => {
  if (!lvl.name || !lvl.start || !lvl.goal || typeof lvl.par !== 'number') {
    throw new Error(`Level ${idx + 1} is missing essential properties!`);
  }
  console.log(`Level ${idx + 1}: ${lvl.name} | Par: ${lvl.par}s | Start: (${lvl.start.x}, ${lvl.start.y}) | Goal: (${lvl.goal.x}, ${lvl.goal.y}) | Walls: ${lvl.walls ? lvl.walls.length : 0} | Holes: ${lvl.holes ? lvl.holes.length : 0} | Stars: ${lvl.stars ? lvl.stars.length : 0}`);
});

// Test 3: Simulation under EASY, NORMAL, and HARD
console.log("\n--- Testing Difficulty Settings ---");
[0, 1, 2].forEach(diff => {
  VOS.difficulty = diff;
  cart.startLevel(0);
  const settings = cart.getDifficulty();
  console.log(`Difficulty ${diff} (${settings.name}): Ball R=${settings.ballR}, Gravity=${settings.gravity}, Suction=${settings.suctionForce}, FatalMargin=${settings.fatalMargin}`);
  
  // Simulate 60 frames of rightward tilt
  PAD.state.right = true;
  for (let f = 0; f < 60; f++) {
    cart.update(1 / 60);
  }
  PAD.state.right = false;
  console.log(`  After 1s right tilt: X=${cart.bx.toFixed(2)}, Vx=${cart.bvx.toFixed(2)}, TiltX=${cart.tx.toFixed(2)}`);
  if (cart.bx <= 34 || isNaN(cart.bx)) {
    throw new Error(`Physics failure under difficulty ${diff}!`);
  }
});

// Test 4: Wall collision & non-tunneling test at extreme speed
console.log("\n--- Wall Collision and Continuous Tunneling Test ---");
cart.startLevel(0);
cart.bx = 34;
cart.by = 50;
cart.bvx = 200; // Moving fast towards right wall
cart.by = 74 - 4.1; // Skimming horizontally right above wall 1 [18, 74, 176, 5]
cart.update(0.016);
console.log(`  Fast ball pos after update: (${cart.bx.toFixed(2)}, ${cart.by.toFixed(2)}), Vx=${cart.bvx.toFixed(2)}`);

// Direct impact test into a wall
cart.bx = 50;
cart.by = 65;
cart.bvx = 0;
cart.bvy = 300; // Moving downward into wall [18, 74, 176, 5]
cart.update(0.05); // High dt step
console.log(`  Ball y after wall impact: ${cart.by.toFixed(2)} (Wall top is 74, ball R is ${cart.br}), Vy=${cart.bvy.toFixed(2)}`);
if (cart.by > 74 + 5) {
  throw new Error("Tunneling occurred through wall!");
} else {
  console.log("✓ No tunneling! Ball successfully deflected by continuous collision.");
}

// Test 5: Hole suction and falling sequence
console.log("\n--- Hole Gravitational Suction & Trap Falling Test ---");
cart.startLevel(0);
const hole = cart.levels[0].holes[0]; // [128, 99, 7]
cart.bx = hole[0] - 12;
cart.by = hole[1];
cart.bvx = 0;
cart.bvy = 0;
console.log(`  Placing ball near hole suction zone at (${cart.bx}, ${cart.by}), hole at (${hole[0]}, ${hole[1]})`);
cart.update(0.033);
console.log(`  After suction step: Vx=${cart.bvx.toFixed(2)}, Vy=${cart.bvy.toFixed(2)}`);
if (cart.bvx <= 0) {
  throw new Error("Hole suction failed to attract ball toward center!");
}
console.log("✓ Hole suction physics correctly pulls ball toward hole center!");

// Place directly inside fatal lip
cart.bx = hole[0] - 2;
cart.by = hole[1];
cart.update(0.016);
if (cart.state !== 'FALLING') {
  throw new Error("Ball did not trigger FALLING state when entering hole lip!");
}
console.log("✓ Falling state triggered! State:", cart.state);
cart.update(0.6); // Wait for fall timer to complete
if (cart.state !== 'PLAYING') {
  throw new Error("Ball did not respawn after fall timer!");
}
console.log("✓ Ball successfully respawned at level start. Pos:", cart.bx, cart.by);

// Test 6: Level completion, stars, and progression
console.log("\n--- Level Completion & Campaign Progression Test ---");
cart.startLevel(0);
// Collect stars
cart.collectedStars = [true, true, true];
// Move ball to goal
const goal = cart.levels[0].goal;
cart.bx = goal.x;
cart.by = goal.y;
cart.update(0.016);
if (cart.state !== 'LEVEL_CLEAR') {
  throw new Error("Level did not complete upon reaching goal!");
}
console.log("✓ Level clear triggered! State:", cart.state, "Stars earned:", cart.levelStars[0], "Score:", cart.score);

// Proceed to next level via [A]
PAD.hits.a = true;
cart.update(0.016);
PAD.hits.a = false;
console.log("✓ Proceeded to next level. Current level index:", cart.currentLevelIdx);
if (cart.currentLevelIdx !== 1) {
  throw new Error("Did not advance to Level 2!");
}

// Test 7: Level 8 Checkpoints
console.log("\n--- Level 8 Grand Master Checkpoint Progression Test ---");
cart.startLevel(7);
console.log("  Level 8 checkpoints total:", cart.levels[7].checkpoints.length);
// Reach checkpoint 12 (milestone 10)
const cp12 = cart.levels[7].checkpoints[12];
cart.bx = cp12[0];
cart.by = cp12[1];
cart.update(0.016);
console.log("  Reached CP 13 (index 12). Tracked checkpointIdx:", cart.checkpointIdx);
if (cart.checkpointIdx < 12) {
  throw new Error("Checkpoint was not recorded!");
}

// Fall into hole on level 8
cart.startHoleFall(100, 100);
cart.update(0.6); // respawn
const milestone10Pos = cart.levels[7].checkpoints[10];
console.log(`  After respawn: ball at (${cart.bx}, ${cart.by}), expected milestone 10 at (${milestone10Pos[0]}, ${milestone10Pos[1]})`);
if (cart.bx !== milestone10Pos[0] || cart.by !== milestone10Pos[1]) {
  throw new Error("Did not respawn at milestone checkpoint!");
}
console.log("✓ Milestone checkpoint respawn works perfectly!");

// Test 8: Render test
console.log("\n--- Render Integrity Test ---");
cart.render(global.g);
console.log("✓ Render executed with zero errors across all components.");

// Test 9: Save and Load
console.log("\n--- Persistence (SAVE / LOAD) Test ---");
const savedState = cart.save();
console.log("  Saved state:", JSON.stringify(savedState));
cart.unlockedLevels = 1;
cart.score = 0;
cart.load(savedState);
if (cart.unlockedLevels !== savedState.unlockedLevels || cart.score !== savedState.highScore) {
  throw new Error("Load failed to restore state!");
}
console.log("✓ Save and Load verified successfully.");

console.log("\n>>> ALL 9 AUDIT CHECKS PASSED! <<<");
