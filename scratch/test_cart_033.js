// Comprehensive Headless Test Suite for Cartridge #033: WHACK MOLE
const fs = require('fs');
const path = require('path');

// Setup mock console globals
global.window = global;
global.CARTS = {};
global.PAD = {
  state: { up: false, down: false, left: false, right: false, a: false, b: false, start: false, select: false },
  hits: { up: false, down: false, left: false, right: false, a: false, b: false, start: false, select: false },
  tapPos: null,
  hit(k) { return !!this.hits[k]; },
  held(k) { return !!this.state[k]; },
  vibrate(ms) { this.lastVib = ms; }
};

const apuLog = [];
global.APU = {
  softTone(f, d, t, v, dl, a, c) { apuLog.push({ type: 'softTone', f, d, t }); },
  tone(f, d, t, v, s, dl) { apuLog.push({ type: 'tone', f, d, t, s }); },
  noise(d, v, f, t, dl) { apuLog.push({ type: 'noise', d, v, f }); },
  sfx(name) { apuLog.push({ type: 'sfx', name }); }
};

global.SAVE = {
  score: 0,
  data: { rec: {} },
  setScore(id, s) { this.score = Math.max(this.score, s); return true; },
  getScore(id) { return this.score; }
};

global.VOS = {
  difficulty: 1 // 0: Easy, 1: Normal, 2: Hard
};

global.g = {
  clear() {},
  rect() {},
  box() {},
  line() {},
  circle() {},
  disc() {},
  tri() {},
  dither() {},
  px() {},
  text() {},
  textC() {},
  textR() {}
};

function advanceTime(cart, totalTime, step = 0.02) {
  let elapsed = 0;
  while (elapsed < totalTime) {
    const dt = Math.min(step, totalTime - elapsed);
    cart.update(dt);
    elapsed += dt;
  }
}

// Require cartridge
require(path.join(__dirname, '../js/cartridges/cart_033_whack_mole.js'));
const cart = CARTS[33];

console.log("=================================================");
console.log(`AUDITING CARTRIDGE #033: ${cart.name} (Genre: ${cart.genre})`);
console.log("=================================================");

// -----------------------------------------------------------------------------
// TEST 1: Initialization & 3x3 Grid State
// -----------------------------------------------------------------------------
console.log("\n[TEST 1] Initializing Cartridge & 3x3 Grid...");
cart.init();
if (cart.holes.length !== 9) throw new Error("Expected 9 holes, got " + cart.holes.length);
if (cart.cx !== 1 || cart.cy !== 1) throw new Error("Cursor not centered at (1,1)");
if (cart.gameState !== 'READY') throw new Error("Expected initial gameState READY, got " + cart.gameState);

for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 3; c++) {
    const idx = r * 3 + c;
    const h = cart.holes[idx];
    if (h.c !== c || h.r !== r) throw new Error(`Hole ${idx} coordinates mismatch: (${h.c}, ${h.r})`);
    if (h.state !== 'EMPTY') throw new Error(`Hole ${idx} not initially EMPTY`);
    if (h.x <= 0 || h.x >= 256 || h.y <= 0 || h.y >= 240) {
      throw new Error(`Hole ${idx} out of screen bounds: (${h.x}, ${h.y})`);
    }
  }
}
console.log("✓ Initialized successfully with 9 independent holes centered in 256x240 screen.");

// -----------------------------------------------------------------------------
// TEST 2: Difficulty Audit (EASY / NORMAL / HARD)
// -----------------------------------------------------------------------------
console.log("\n[TEST 2] Auditing Difficulty Configurations...");
[0, 1, 2].forEach(diff => {
  VOS.difficulty = diff;
  const p = cart.getDifficultyParams();
  console.log(`  Diff ${diff} (${p.name}): StartTime=${p.startTime}s, Spawn=[${p.spawnMin}-${p.spawnMax}]s, MaxConcurrent=${p.maxConcurrent} (Fever: ${p.feverMaxConcurrent}), BombWt=${p.bombWeight}`);
  if (diff === 0 && (p.startTime !== 35 || p.maxConcurrent !== 2)) throw new Error("EASY difficulty params mismatch!");
  if (diff === 1 && (p.startTime !== 30 || p.maxConcurrent !== 3)) throw new Error("NORMAL difficulty params mismatch!");
  if (diff === 2 && (p.startTime !== 25 || p.maxConcurrent !== 4)) throw new Error("HARD difficulty params mismatch!");
});

// Test cycleDifficulty
VOS.difficulty = 0;
cart.cycleDifficulty();
if (VOS.difficulty !== 1) throw new Error("cycleDifficulty did not advance from 0 to 1");
cart.cycleDifficulty();
if (VOS.difficulty !== 2) throw new Error("cycleDifficulty did not advance from 1 to 2");
cart.cycleDifficulty();
if (VOS.difficulty !== 0) throw new Error("cycleDifficulty did not wrap from 2 to 0");
console.log("✓ Difficulty cycle and parameter scaling verified.");

// -----------------------------------------------------------------------------
// TEST 3: Round Start & Gameplay Lifecycle
// -----------------------------------------------------------------------------
console.log("\n[TEST 3] Testing Start Round & Concurrent Moles...");
VOS.difficulty = 1; // NORMAL
cart.startRound();
if (cart.gameState !== 'PLAYING') throw new Error("Expected gameState PLAYING");
if (cart.timeLeft !== 30) throw new Error("Expected starting time 30s");

// Simulate 2 seconds of gameplay to allow moles to spawn and rise
advanceTime(cart, 2.0);
const activeMoles = cart.holes.filter(h => h.state !== 'EMPTY');
console.log(`  Active concurrent moles after 2s: ${activeMoles.length} (Max concurrent: ${cart.getDifficultyParams().maxConcurrent})`);
if (activeMoles.length < 1 || activeMoles.length > cart.getDifficultyParams().maxConcurrent) {
  throw new Error(`Unexpected concurrent mole count: ${activeMoles.length}`);
}
console.log("✓ Multiple concurrent moles spawning independently within difficulty limits.");

// -----------------------------------------------------------------------------
// TEST 4: Archetype 1 - Standard Brown Mole (+100 PTS)
// -----------------------------------------------------------------------------
console.log("\n[TEST 4] Testing Archetype 1: Standard Brown Mole...");
cart.startRound();
const hBrown = cart.holes[0];
hBrown.state = 'PEEK';
hBrown.type = 'BROWN';
hBrown.height = 18;
hBrown.timer = 1.0;

cart.cx = 0; cart.cy = 0;
cart.strike();
if (!cart.swinging) throw new Error("Mallet did not initiate swing!");

// Step through swing animation to impact (impact at swingTimer <= 0.08, swingTimer started at 0.16)
cart.update(0.085);
if (!cart.impactDone) throw new Error("Impact was not resolved!");
if (hBrown.state !== 'HIT') throw new Error("Brown mole not in HIT state!");
if (hBrown.squishFactor !== 0.4) throw new Error("Brown mole did not squish to 0.4!");
if (cart.score !== 100) throw new Error("Expected score 100, got " + cart.score);
if (cart.combo !== 1) throw new Error("Expected combo 1, got " + cart.combo);
if (cart.stats.brown !== 1) throw new Error("Expected brown stat 1, got " + cart.stats.brown);

// Step until mole finishes HIT timer (0.35s) and transitions to BURROWING
advanceTime(cart, 0.4);
if (hBrown.state !== 'BURROWING' && hBrown.state !== 'EMPTY') {
  throw new Error("Expected mole to transition to BURROWING or EMPTY, got " + hBrown.state);
}
advanceTime(cart, 0.3);
if (hBrown.state !== 'EMPTY') throw new Error("Expected mole to transition to EMPTY, got " + hBrown.state);
console.log("✓ Standard Brown Mole: single whack (+100 pts), squish animation, and burrow cycle verified.");

// -----------------------------------------------------------------------------
// TEST 5: Archetype 2 - Hardhat Helmet Mole (2 Whacks, +50 + 250 PTS)
// -----------------------------------------------------------------------------
console.log("\n[TEST 5] Testing Archetype 2: Hardhat Helmet Mole...");
cart.startRound();
const hHelmet = cart.holes[4]; // Center hole (1,1)
hHelmet.state = 'PEEK';
hHelmet.type = 'HELMET';
hHelmet.height = 18;
hHelmet.timer = 1.2;
hHelmet.helmetOff = false;

cart.cx = 1; cart.cy = 1;
cart.strike();
cart.update(0.085); // Impact 1

if (!hHelmet.helmetOff) throw new Error("First hit did not knock off helmet!");
if (hHelmet.state === 'HIT') throw new Error("First hit should NOT squish mole, only knock helmet off!");
if (cart.score !== 50) throw new Error("Expected 50 pts for cracking helmet, got " + cart.score);
if (cart.stats.helmetsCracked !== 1) throw new Error("Expected helmetsCracked stat 1");

// Verify flying helmet particle spawned
const helmetParticle = cart.particles.find(p => p.type === 'HELMET');
if (!helmetParticle) throw new Error("Flying helmet particle was not spawned!");
console.log("  Flying helmet particle spawned at Y=" + helmetParticle.y + ", Vy=" + helmetParticle.vy);

// Finish swing recoil
advanceTime(cart, 0.1);

// Strike 2 on unarmored mole
cart.strike();
cart.update(0.085); // Impact 2
if (hHelmet.state !== 'HIT') throw new Error("Second hit did not squish unarmored mole!");
if (cart.score !== 300) throw new Error("Expected score 50 + 250 = 300, got " + cart.score);
if (cart.stats.helmet !== 1) throw new Error("Expected helmet mole final whacked stat 1");
console.log("✓ Hardhat Helmet Mole: 2-stage whack (helmet ping/particle + unarmored squish) verified.");

// -----------------------------------------------------------------------------
// TEST 6: Archetype 3 - Golden King Mole (+500 PTS and +3s Bonus Time!)
// -----------------------------------------------------------------------------
console.log("\n[TEST 6] Testing Archetype 3: Golden King Mole...");
cart.startRound();
cart.timeLeft = 20.0;
const hGold = cart.holes[2];
hGold.state = 'PEEK';
hGold.type = 'GOLDEN';
hGold.height = 18;
hGold.timer = 0.6;

cart.cx = 2; cart.cy = 0;
cart.strike();
cart.update(0.085);

if (hGold.state !== 'HIT') throw new Error("Golden King mole not in HIT state!");
if (cart.score !== 500) throw new Error("Expected 500 pts, got " + cart.score);
if (Math.abs(cart.timeLeft - 22.915) > 0.1) {
  throw new Error("Expected bonus +3s time added! Time: " + cart.timeLeft);
}
if (cart.stats.golden !== 1) throw new Error("Expected golden stat 1");
console.log("✓ Golden King Mole: awarded +500 pts and +3s time extension successfully.");

// -----------------------------------------------------------------------------
// TEST 7: Archetype 4 - TNT / Bomb Bandit (Explosion, -300 PTS & Mallet Stun)
// -----------------------------------------------------------------------------
console.log("\n[TEST 7] Testing Archetype 4: TNT / Bomb Bandit...");
// Test A: Untouched burrow
cart.startRound();
const hBombSafe = cart.holes[0];
hBombSafe.state = 'PEEK';
hBombSafe.type = 'BOMB';
hBombSafe.height = 18;
hBombSafe.timer = 0.05;

cart.update(0.06);
if (hBombSafe.state !== 'BURROWING') throw new Error("Untouched bomb did not burrow safely!");
if (cart.stats.bombsAvoided !== 1) throw new Error("Expected bombsAvoided stat 1!");
if (cart.score !== 0) throw new Error("Score changed on untouched bomb!");

// Test B: Whacking a Bomb
cart.score = 500;
cart.combo = 5;
const hBombHit = cart.holes[0];
hBombHit.state = 'PEEK';
hBombHit.type = 'BOMB';
hBombHit.height = 18;
hBombHit.timer = 1.0;

cart.cx = 0; cart.cy = 0;
cart.strike();
cart.update(0.085);

if (hBombHit.state !== 'BOMB_EXPLODING') throw new Error("Bomb did not explode!");
if (cart.score !== 200) throw new Error("Expected score 500 - 300 = 200, got " + cart.score);
if (cart.combo !== 0) throw new Error("Expected combo reset to 0 on bomb explosion!");
if (cart.malletStun <= 0.6) throw new Error("Expected mallet stun ~0.8s, got " + cart.malletStun);
if (cart.shakeTimer <= 0) throw new Error("Expected screen shake triggered!");

// Verify mallet cannot strike while stunned
const attemptScore = cart.score;
cart.strike();
if (cart.swinging) throw new Error("Mallet was able to strike while stunned!");
console.log("✓ TNT / Bomb Bandit: safe burrowing, explosion, score penalty (-300), combo reset, and mallet stun verified.");

// -----------------------------------------------------------------------------
// TEST 8: Combo System & Fever Mode
// -----------------------------------------------------------------------------
console.log("\n[TEST 8] Testing Combo Multipliers & Fever Mode...");
cart.startRound();
// Rapidly simulate 10 consecutive accurate hits
for (let i = 1; i <= 10; i++) {
  const h = cart.holes[i % 9];
  h.state = 'PEEK';
  h.type = 'BROWN';
  h.height = 18;
  h.timer = 1.0;
  cart.cx = h.c;
  cart.cy = h.r;
  cart.strike();
  cart.update(0.085);
  advanceTime(cart, 0.10); // reset swing
}

console.log(`  After 10 hits: Combo=${cart.combo}, Fever=${cart.fever}, FeverTimer=${cart.feverTimer}s, Score=${cart.score}`);
if (cart.combo !== 10) throw new Error("Expected combo 10, got " + cart.combo);
if (!cart.fever) throw new Error("Fever mode was not triggered at 10 combo!");
if (cart.feverTimer <= 0) throw new Error("Fever timer not initialized!");

// Test double score during Fever Mode
const preScore = cart.score;
const hFever = cart.holes[0];
hFever.state = 'PEEK';
hFever.type = 'BROWN';
hFever.height = 18;
hFever.timer = 1.0;
cart.cx = 0; cart.cy = 0;
cart.strike();
cart.update(0.085);
// Brown mole = 100 base * 4 (combo tier) * 2 (fever bonus) = 800 pts!
const earned = cart.score - preScore;
console.log(`  Points earned during Fever Mode for Brown Mole: ${earned} (Expected: 800 pts)`);
if (earned !== 800) throw new Error(`Expected 800 pts in fever mode, got ${earned}`);

// Test miss breaks combo and ends fever
advanceTime(cart, 0.1);
cart.holes[0].state = 'EMPTY';
cart.strike();
cart.update(0.085);
if (cart.combo !== 0) throw new Error("Miss did not reset combo to 0!");
if (cart.fever) throw new Error("Miss did not cancel fever mode!");
console.log("✓ Combo multipliers (up to 4x), Fever Mode (double score), and miss penalty verified.");

// -----------------------------------------------------------------------------
// TEST 9: Direct Touch Tap Controls
// -----------------------------------------------------------------------------
console.log("\n[TEST 9] Testing Direct Touch Tap Controls...");
cart.startRound();
const targetHole = cart.holes[7]; // (c=1, r=2) -> x=128, y=192
targetHole.state = 'PEEK';
targetHole.type = 'BROWN';
targetHole.height = 18;
targetHole.timer = 1.0;

// Player starts with cursor at (0, 0)
cart.cx = 0; cart.cy = 0;

// Tap directly on hole 7: (128, 192)
PAD.tapPos = { x: 128, y: 192 };
cart.update(0.016);
PAD.tapPos = null;

if (cart.cx !== 1 || cart.cy !== 2) {
  throw new Error(`Direct touch did not target hole (1, 2)! Got (${cart.cx}, ${cart.cy})`);
}
if (!cart.swinging) throw new Error("Direct touch did not trigger mallet strike!");
cart.update(0.085);
if (targetHole.state !== 'HIT') throw new Error("Target hole was not struck by touch tap!");
console.log("✓ Direct Touch Tap instantly locks onto tapped hole and executes strike.");

// -----------------------------------------------------------------------------
// TEST 10: Urgency Audio Heartbeat & Game Over Condition
// -----------------------------------------------------------------------------
console.log("\n[TEST 10] Testing Urgency Heartbeat & Game Over Sequence...");
cart.startRound();
cart.timeLeft = 5.2;

apuLog.length = 0;
advanceTime(cart, 0.3); // cross 5.0s mark
const urgentTicks = apuLog.filter(a => a.type === 'softTone');
if (urgentTicks.length === 0) throw new Error("Urgency tick did not trigger at <= 5s!");
console.log("  Urgency heartbeat audio triggered at 5s remaining.");

// Run time out to 0
advanceTime(cart, 6.0);
if (cart.gameState !== 'GAMEOVER') throw new Error("Expected gameState GAMEOVER, got " + cart.gameState);
if (cart.timeLeft !== 0) throw new Error("Time left should be 0");
console.log(`  Game Over reached! Score: ${cart.score}, Prize: "${cart.getPrize()}"`);
console.log("✓ Game Over transition, prize calculation, and time out verified.");

// -----------------------------------------------------------------------------
// TEST 11: Render Pipeline Integrity
// -----------------------------------------------------------------------------
console.log("\n[TEST 11] Auditing Render Pipeline Integrity across all states...");
// State: READY
cart.gameState = 'READY';
cart.render(global.g);

// State: PLAYING with active moles, particles, and floating text
cart.startRound();
cart.holes[0].state = 'PEEK'; cart.holes[0].type = 'BROWN'; cart.holes[0].height = 18;
cart.holes[1].state = 'PEEK'; cart.holes[1].type = 'HELMET'; cart.holes[1].height = 18;
cart.holes[2].state = 'PEEK'; cart.holes[2].type = 'GOLDEN'; cart.holes[2].height = 18;
cart.holes[3].state = 'PEEK'; cart.holes[3].type = 'BOMB'; cart.holes[3].height = 18;
cart.holes[4].state = 'BOMB_EXPLODING'; cart.holes[4].timer = 0.2;
cart.fever = true;
cart.swinging = true;
cart.swingTimer = 0.08; // impact frame
cart.addFloatingText("TEST", 100, 100, 3);
cart.render(global.g);

// State: GAMEOVER
cart.gameState = 'GAMEOVER';
cart.render(global.g);

// Icon rendering
cart.icon(global.g, 10, 10);
console.log("✓ Render executed without error across READY, PLAYING, GAMEOVER, and ICON.");

// -----------------------------------------------------------------------------
// TEST 12: Persistence (SAVE / LOAD)
// -----------------------------------------------------------------------------
console.log("\n[TEST 12] Testing Persistence (Save & Load)...");
cart.score = 3500;
cart.highScore = 4000;
cart.maxCombo = 15;
const saved = cart.save();
console.log("  Saved state:", JSON.stringify(saved));
if (saved.highScore !== 4000 || saved.maxCombo !== 15) throw new Error("Save state mismatch!");

cart.highScore = 0;
cart.maxCombo = 0;
cart.load(saved);
if (cart.highScore !== 4000 || cart.maxCombo !== 15) throw new Error("Load state mismatch!");
console.log("✓ Save and Load routines verified.");

console.log("\n=================================================");
console.log(">>> ALL 12 AUDIT TESTS PASSED SUCCESSFULLY! <<<");
console.log("=================================================");
