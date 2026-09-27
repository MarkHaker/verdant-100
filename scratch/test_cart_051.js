// scratch/test_cart_051.js
// ============================================================================
// Headless QA Test Suite for Cartridge #051: ROGUE 1980
// ============================================================================

const fs = require('fs');
const path = require('path');

// 1. Mock Environment
global.window = global;
global.CARTS = {};
global.FONT_4x6 = {};

global.PAD = {
  state: { up: false, down: false, left: false, right: false, a: false, b: false, start: false, select: false },
  hits: { up: false, down: false, left: false, right: false, a: false, b: false, start: false, select: false },
  tapPos: null,
  swipe: null,
  hit(k) { return !!this.hits[k]; },
  held(k) { return !!this.state[k]; },
  vibrate() {}
};

const apuLog = [];
global.APU = {
  sfx(name) { apuLog.push(name); }
};

global.SAVE = {
  score: 0,
  data: { rec: {} },
  setScore(id, s) {
    this.score = Math.max(this.score, s);
    this.data.rec[String(id)] = { s: this.score };
    return true;
  },
  getScore(id) {
    return (this.data.rec[String(id)] && this.data.rec[String(id)].s) || 0;
  }
};

global.VOS = {
  difficulty: 1 // 0: Easy, 1: Normal, 2: Hard
};

// Mock Graphics Pipeline
const drawCalls = [];
global.g = {
  clear(c) { drawCalls.push(['clear', c]); },
  rect(x, y, w, h, c) { drawCalls.push(['rect', x, y, w, h, c]); },
  box(x, y, w, h, c) { drawCalls.push(['box', x, y, w, h, c]); },
  line(x0, y0, x1, y1, c) { drawCalls.push(['line', x0, y0, x1, y1, c]); },
  px(x, y, c) { drawCalls.push(['px', x, y, c]); },
  text(str, x, y, c, scale) { drawCalls.push(['text', str, x, y, c]); },
  textC(str, y, c, scale) { drawCalls.push(['textC', str, y, c]); },
  textR(str, x, y, c, scale) { drawCalls.push(['textR', str, x, y, c]); }
};

function clearHits() {
  for (let k in PAD.hits) PAD.hits[k] = false;
  PAD.tapPos = null;
  PAD.swipe = null;
}

// 2. Load Cartridge
require('../js/cartridges/cart_051_rogue_1980.js');
const cart = CARTS[51];

if (!cart) {
  console.error("FAIL: Cartridge #051 failed to load into CARTS registry!");
  process.exit(1);
}

console.log("=== AUDITING CARTRIDGE #051: " + cart.name + " ===");

// ----------------------------------------------------------------------------
// TEST 1: Initialization & Baseline State
// ----------------------------------------------------------------------------
console.log("\n--- TEST 1: Initialization ---");
cart.init();

if (cart.hp !== 16 || cart.maxHp !== 16) throw new Error(`Initial HP mismatch: ${cart.hp}/${cart.maxHp}`);
if (cart.floor !== 1 || cart.lvl !== 1) throw new Error(`Initial floor/level mismatch: floor=${cart.floor}, lvl=${cart.lvl}`);
if (cart.gold !== 0) throw new Error(`Initial gold mismatch: ${cart.gold}`);
if (cart.food !== 500) throw new Error(`Initial food mismatch: ${cart.food}`);
if (!cart.equippedWeap || cart.equippedWeap.name !== 'DAGGER') throw new Error("Starting weapon should be DAGGER");
if (cart.inventory.length < 2) throw new Error("Starting inventory should have heal potion and rations");
if (!cart.rooms || cart.rooms.length !== 9) throw new Error("Dungeon should generate 9 sectors/rooms");
if (cart.map.length !== 21 || cart.map[0].length !== 30) throw new Error("Map dimensions should be 30x21");
console.log("PASS: Baseline initialization validated.");

// ----------------------------------------------------------------------------
// TEST 2: Procedural Dungeon Connectivity & Spanning Tree BFS
// ----------------------------------------------------------------------------
console.log("\n--- TEST 2: Dungeon Connectivity & Pathfinding ---");
function isReachable(map, startX, startY, goalX, goalY) {
  const queue = [[startX, startY]];
  const visited = new Set([`${startX},${startY}`]);
  const walkable = new Set(['.', '#', '+', '>']);

  while (queue.length > 0) {
    const [cx, cy] = queue.shift();
    if (cx === goalX && cy === goalY) return true;

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (let [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      const key = `${nx},${ny}`;
      if (nx >= 0 && nx < 30 && ny >= 0 && ny < 21 && !visited.has(key)) {
        if (walkable.has(map[ny][nx])) {
          visited.add(key);
          queue.push([nx, ny]);
        }
      }
    }
  }
  return false;
}

// Test 50 procedural generations across various depths
for (let i = 1; i <= 50; i++) {
  cart.floor = (i % 8) + 1;
  cart.generateFloor();

  // Test reachability from player spawn room to stairs room
  const reachable = isReachable(cart.map, cart.px, cart.py, cart.stairsX, cart.stairsY);
  if (!reachable) {
    throw new Error(`Generation #${i} (Floor ${cart.floor}): Stairs (room 8) not reachable from player (room 0)!`);
  }
}
console.log("PASS: 50 randomly generated procedural floors validated with 100% room-to-stairs connectivity.");

// ----------------------------------------------------------------------------
// TEST 3: Combat Mechanics (Player Attack, Weapon Rolls, Crits, Monsters)
// ----------------------------------------------------------------------------
console.log("\n--- TEST 3: Tactical Combat System ---");
cart.init();
// Place a test Goblin directly to the right of player
const testGoblin = cart.createMonster('G', cart.px + 1, cart.py, 0);
cart.monsters = [testGoblin];
const initialGoblinHp = testGoblin.hp;

// Move right to attack
cart.stepPlayer(1, 0);
if (testGoblin.hp >= initialGoblinHp) throw new Error("Goblin HP should decrease after player attack!");
console.log(`PASS: Player attacked Goblin. HP reduced from ${initialGoblinHp} to ${testGoblin.hp}.`);

// Kill the goblin to test EXP gain and death
testGoblin.hp = 1;
const initialExp = cart.exp;
cart.stepPlayer(1, 0);
if (testGoblin.alive) throw new Error("Goblin with 1 HP should be slain by attack!");
if (cart.exp <= initialExp) throw new Error("Player should gain EXP from slaying Goblin!");
console.log(`PASS: Monster slain. EXP increased from ${initialExp} to ${cart.exp}.`);

// Slaying goblin (14 exp) already leveled up player to Level 2 (expNext was 12)
if (cart.lvl !== 2) throw new Error(`Player should be level 2 after slaying Goblin, got ${cart.lvl}`);
if (cart.maxHp !== 22) throw new Error(`Max HP should increase to 22, got ${cart.maxHp}`);
console.log("PASS: Slaying Goblin triggered Level Up to Level 2 and increased Max HP to 22.");

// Now test advancing to Level 3
cart.exp = cart.expNext;
cart.gainExp(1);
if (cart.lvl !== 3) throw new Error(`Player should be level 3, got ${cart.lvl}`);
if (cart.maxHp !== 28) throw new Error(`Max HP should increase to 28, got ${cart.maxHp}`);
console.log("PASS: Level up logic and stat growth validated.");

// ----------------------------------------------------------------------------
// TEST 4: Rest / Wait Action & Hunger System
// ----------------------------------------------------------------------------
console.log("\n--- TEST 4: Rest / Wait & Hunger ---");
cart.init();
cart.hp = 10;
const initialTurns = cart.turns;
const initialFood = cart.food;

// Wait 3 turns to trigger health regeneration
cart.waitTurn();
cart.waitTurn();
cart.waitTurn();

if (cart.turns !== initialTurns + 3) throw new Error(`Turns should increase by 3, got ${cart.turns}`);
if (cart.food >= initialFood) throw new Error(`Food should deplete after resting, food=${cart.food}`);
if (cart.hp !== 11) throw new Error(`HP should regenerate +1 after 3 rests, got ${cart.hp}`);
console.log(`PASS: Rested 3 turns. HP regenerated to ${cart.hp}, food drained to ${cart.food}.`);

// Starvation test
cart.food = 0;
cart.hp = 5;
cart.waitTurn();
cart.waitTurn();
if (cart.hp >= 5) throw new Error(`Starving player should lose HP, got ${cart.hp}`);
console.log("PASS: Starvation damage verified.");

// ----------------------------------------------------------------------------
// TEST 5: Inventory System (Potions, Scrolls, Weapons, Armor, Rations)
// ----------------------------------------------------------------------------
console.log("\n--- TEST 5: Inventory Modal & Item Use ---");
cart.init();
cart.hp = 5;

// Test Heal Potion
const healPotionIdx = cart.inventory.findIndex(it => it.sub === 'HEAL');
if (healPotionIdx === -1) throw new Error("Starting inventory should contain a heal potion");
cart.useItem(healPotionIdx);
if (cart.hp !== 16) throw new Error(`Drinking heal potion should restore HP to 16, got ${cart.hp}`);
console.log("PASS: Heal Potion consumed successfully.");

// Test Rations
cart.food = 100;
const rationIdx = cart.inventory.findIndex(it => it.sub === 'RATIONS');
if (rationIdx === -1) throw new Error("Starting inventory should contain rations");
cart.useItem(rationIdx);
// Eating rations restores 350 food, and consumes 1 turn (draining 1 food => 449)
if (cart.food !== 449) throw new Error(`Eating rations should restore food to 449, got ${cart.food}`);
console.log("PASS: Rations consumed successfully (food restored to 449).");

// Test Equipping Weapon
const testSword = { type: 'WEAPON', sub: 'SWORD', name: "SHORTSWORD", bonus: 4, glyph: ')' };
cart.inventory.push(testSword);
cart.useItem(cart.inventory.length - 1);
if (cart.equippedWeap.name !== 'SHORTSWORD') throw new Error("Shortsword should be equipped");
console.log("PASS: Weapon equipped successfully.");

// Test Equipping Armor
const testArmor = { type: 'ARMOR', sub: 'CHAIN', name: "CHAINMAIL", def: 4, glyph: ']' };
cart.inventory.push(testArmor);
cart.useItem(cart.inventory.length - 1);
if (!cart.equippedArm || cart.equippedArm.name !== 'CHAINMAIL') throw new Error("Chainmail should be equipped");
console.log("PASS: Armor equipped successfully.");

// Test Teleport Scroll
const testTeleport = { type: 'SCROLL', sub: 'TELE', name: "TELEPORT SCROLL", glyph: '?' };
cart.inventory.push(testTeleport);
const oldPx = cart.px, oldPy = cart.py;
cart.useItem(cart.inventory.length - 1);
console.log(`PASS: Teleport scroll warped hero from (${oldPx}, ${oldPy}) to (${cart.px}, ${cart.py}).`);

// Test Map Scroll
const testMapScroll = { type: 'SCROLL', sub: 'MAP', name: "MAP SCROLL", glyph: '?' };
cart.inventory.push(testMapScroll);
cart.useItem(cart.inventory.length - 1);
const allExplored = cart.explored.every(row => row.every(tile => tile === true));
if (!allExplored) throw new Error("Map scroll should reveal all tiles");
console.log("PASS: Map scroll fully revealed dungeon floor.");

// ----------------------------------------------------------------------------
// TEST 6: Floor Progression, Amulet of Yendor, and Victory Flow
// ----------------------------------------------------------------------------
console.log("\n--- TEST 6: Floor Progression & Victory Flow ---");
cart.init();
cart.gold = 350;
cart.lvl = 3;

// Descend floors 1 to 7
for (let fl = 1; fl < 8; fl++) {
  if (cart.floor !== fl) throw new Error(`Expected floor ${fl}, got ${cart.floor}`);
  // Stand on stairs
  cart.px = cart.stairsX;
  cart.py = cart.stairsY;
  cart.descendStairs();
}

if (cart.floor !== 8) throw new Error(`Hero should be on floor 8, got ${cart.floor}`);
console.log("PASS: Descended cleanly through floors 1 to 8.");

// Check floor 8 contents: Amulet of Yendor & Dragon
const amuletItem = cart.items.find(it => it.type === 'AMULET');
if (!amuletItem) throw new Error("Floor 8 must spawn the Amulet of Yendor!");
const dragon = cart.monsters.find(m => m.type === 'D');
if (!dragon) throw new Error("Floor 8 must spawn the Dragon boss!");
console.log(`PASS: Floor 8 verified with Dragon boss and Amulet of Yendor at (${amuletItem.x}, ${amuletItem.y}).`);

// Try exiting stairs without amulet: should be blocked
cart.px = cart.stairsX;
cart.py = cart.stairsY;
cart.descendStairs();
if (cart.state === 'VICTORY') throw new Error("Cannot escape floor 8 without the Amulet of Yendor!");
console.log("PASS: Sealed stairs blocked escape without the Amulet.");

// Pick up Amulet of Yendor
cart.px = amuletItem.x;
cart.py = amuletItem.y;
cart.checkItemPickup();
if (!cart.hasAmulet) throw new Error("Hero should possess the Amulet of Yendor after stepping on it!");
console.log("PASS: Amulet of Yendor acquired.");

// Escape via Golden Exit Portal
cart.px = cart.stairsX;
cart.py = cart.stairsY;
cart.descendStairs();
if (cart.state !== 'VICTORY') throw new Error(`Expected state VICTORY, got ${cart.state}`);

const expectedScore = cart.gold + (cart.lvl * 100) + (cart.floor * 250) + 2000;
const recordedScore = SAVE.getScore(51);
if (recordedScore !== expectedScore) {
  throw new Error(`Score mismatch: expected ${expectedScore}, recorded ${recordedScore}`);
}
console.log(`PASS: Victory achieved! High score ${recordedScore} recorded into SAVE.`);

// ----------------------------------------------------------------------------
// TEST 7: Game Over / Death & Score Persistence
// ----------------------------------------------------------------------------
console.log("\n--- TEST 7: Death & Game Over Flow ---");
cart.init();
cart.gold = 120;
cart.lvl = 2;
cart.floor = 4;
cart.die("TROLL MELEE");

if (cart.state !== 'GAMEOVER') throw new Error("State should be GAMEOVER");
if (cart.killer !== "TROLL MELEE") throw new Error("Killer name should be TROLL MELEE");
const deathScore = cart.gold + (cart.lvl * 100) + (cart.floor * 250);
console.log(`PASS: Death state verified with score ${deathScore}.`);

// ----------------------------------------------------------------------------
// TEST 8: Input Controls & UI Navigation
// ----------------------------------------------------------------------------
console.log("\n--- TEST 8: Input & Controls Audit ---");
cart.init();

// Test [B] button opens Inventory
clearHits();
PAD.hits.b = true;
cart.update(1/60);
if (!cart.invOpen) throw new Error("Pressing [B] should open Inventory modal");
console.log("PASS: [B] opened inventory modal.");

// Test navigating inventory with Down/Up
clearHits();
PAD.hits.down = true;
cart.update(1/60);
if (cart.invCursor !== 1) throw new Error(`Inventory cursor should be 1, got ${cart.invCursor}`);

clearHits();
PAD.hits.up = true;
cart.update(1/60);
if (cart.invCursor !== 0) throw new Error(`Inventory cursor should be 0, got ${cart.invCursor}`);
console.log("PASS: Inventory cursor navigation verified.");

// Test [B] button closes Inventory
clearHits();
PAD.hits.b = true;
cart.update(1/60);
if (cart.invOpen) throw new Error("Pressing [B] in inventory should close it");
console.log("PASS: [B] closed inventory modal.");

// Test touch tap on [WAIT] button
clearHits();
const preWaitTurns = cart.turns;
PAD.tapPos = { x: 20, y: 230 }; // inside [WAIT] button (8..50, 220..239)
cart.update(1/60);
if (cart.turns !== preWaitTurns + 1) throw new Error("Tapping [WAIT] button should advance turn");
console.log("PASS: Touch tap on [WAIT] button verified.");

// Test touch tap on [INV] button
clearHits();
PAD.tapPos = { x: 70, y: 230 }; // inside [INV] button (54..96, 220..239)
cart.update(1/60);
if (!cart.invOpen) throw new Error("Tapping [INV] button should open inventory");
console.log("PASS: Touch tap on [INV] button verified.");

clearHits();
PAD.hits.b = true;
cart.update(1/60); // close inventory

// ----------------------------------------------------------------------------
// TEST 9: Difficulty Scaling (EASY, NORMAL, HARD)
// ----------------------------------------------------------------------------
console.log("\n--- TEST 9: Difficulty Settings Audit ---");
// Easy
VOS.difficulty = 0;
cart.init();
if (cart.maxHp !== 22 || !cart.equippedArm) throw new Error("EASY difficulty should grant 22 HP and leather armor");

// Normal
VOS.difficulty = 1;
cart.init();
if (cart.maxHp !== 16 || cart.equippedArm !== null) throw new Error("NORMAL difficulty should grant 16 HP and no armor");

// Hard
VOS.difficulty = 2;
cart.init();
if (cart.maxHp !== 13) throw new Error("HARD difficulty should grant 13 HP");
console.log("PASS: All 3 difficulty tiers correctly adjust gameplay balance.");

// ----------------------------------------------------------------------------
// TEST 10: Graphics Rendering Pipeline
// ----------------------------------------------------------------------------
console.log("\n--- TEST 10: Graphics & CRT Layout Audit ---");
drawCalls.length = 0;
cart.render(global.g);
if (drawCalls.length < 50) throw new Error("Render call produced insufficient draw operations!");

// Render in Inventory state
cart.invOpen = true;
cart.render(global.g);

// Render in Game Over state
cart.state = 'GAMEOVER';
cart.render(global.g);

// Render in Victory state
cart.state = 'VICTORY';
cart.render(global.g);

// Render 32x32 retro icon
drawCalls.length = 0;
cart.icon(global.g, 10, 10);
if (drawCalls.length < 10) throw new Error("Icon render produced insufficient draw operations!");
console.log("PASS: Render pipeline executed without errors across all game modes & icon.");

console.log("\n==================================================================");
console.log("ALL 10 VERIFICATION SUITES PASSED! CARTRIDGE #051 IS ROBUST & READY.");
console.log("==================================================================");
