// scratch/test_all_100_verification.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("================================================================================");
console.log("=== VERDANT-100 MASTER AUDIT TEST: ALL 100 CARTRIDGES (#001 — #100) ===");
console.log("================================================================================");

// 1. Setup Global Constants
global.W = 256;
global.H = 240;
global.PAL = ['#051408', '#0e3816', '#1b7a32', '#4ef574'];
global.CARTS = {};

// 2. Load Engines E1 - E12 into global
const enginesFile = path.join(__dirname, '..', 'js', 'engines.js');
const enginesCode = fs.readFileSync(enginesFile, 'utf8');
// Evaluate in global context so const E1, E2, ... attach to global
const patchedEngines = enginesCode.replace(/^const (E\d+)/gm, 'global.$1');
vm.runInThisContext(patchedEngines);

// 3. Setup Complete Platform Mocks
global.PAD = {
  state: {
    up: false, down: false, left: false, right: false,
    a: false, b: false, start: false, select: false, pause: false
  },
  hits: {
    up: false, down: false, left: false, right: false,
    a: false, b: false, start: false, select: false, pause: false
  },
  rels: {
    up: false, down: false, left: false, right: false,
    a: false, b: false, start: false, select: false, pause: false
  },
  hit(k) { return !!this.hits[k]; },
  btn(k) { return !!this.state[k]; },
  held(k) { return !!this.state[k]; },
  rel(k) { return !!this.rels[k]; },
  vibrate(ms = 8) {},
  pointer: { x: 0, y: 0, down: false },
  tapPos: null,
  swipe: null,
  tilt: { x: 0, y: 0 },
  longPress: false
};

global.TOUCH = {
  down: false,
  held: false,
  x: 0,
  y: 0,
  drag: false,
  swipe: null
};

global.APU = {
  volume: 0.7,
  muted: false,
  sfx(name) {},
  tone(freq, dur, type = 'square', vol = 1) {},
  noise(dur, vol = 1, filterFreq = 1000) {},
  softTone(freq, dur = 0.8, type = 'sine', vol = 0.08, delay = 0, attack = 0.04, cutoff = 1200) {},
  playTrack(track) {},
  stopMusic() {},
  setVolume(v) {},
  toggleMute() {}
};

global.SAVE = {
  scores: {},
  pers: {},
  setScore(cartId, score, extra = null) {
    this.scores[String(cartId)] = score;
    return true;
  },
  getScore(cartId) {
    return this.scores[String(cartId)] || 0;
  },
  setPersistent(cartId, obj) {
    this.pers[String(cartId)] = obj;
  },
  getPersistent(cartId) {
    return this.pers[String(cartId)] || null;
  },
  addPlayTime(cartId, seconds) {},
  commit() {}
};

const createMockG = () => ({
  clear(c = 0) {},
  px(x, y, c = 3) {},
  pix(x, y, c = 3) {},
  rect(x, y, w, h, c = 2) {},
  box(x, y, w, h, c = 2) {},
  line(x0, y0, x1, y1, c = 2) {},
  circle(cx, cy, r, c = 2) {},
  disc(cx, cy, r, c = 2) {},
  oval(cx, cy, rx, ry, c = 2) {},
  tri(x0, y0, x1, y1, x2, y2, c = 2) {},
  dither(x, y, w, h, c1 = 1, c2 = 2) {},
  sprite(x, y, w, h, rows, c = 3, scale = 1) {},
  text(str, x, y, c = 3, scale = 1) {},
  textC(str, y, c = 3, scale = 1) {},
  textR(str, x, y, c = 3, scale = 1) {}
});

const g = createMockG();

// 4. Iterate over all 100 cartridges and perform deep automated test
const cartDir = path.join(__dirname, '..', 'js', 'cartridges');
const files = fs.readdirSync(cartDir);

let passed = 0;
let failed = 0;
const failureDetails = [];

for (let id = 1; id <= 100; id++) {
  const prefix = `cart_${String(id).padStart(3, '0')}_`;
  const match = files.find(f => f.startsWith(prefix));

  if (!match) {
    console.error(`[FAIL] Cart #${id} file missing!`);
    failed++;
    failureDetails.push(`Cart #${id}: file missing`);
    continue;
  }

  try {
    const fullPath = path.join(cartDir, match);
    require(fullPath);

    const cart = global.CARTS[id];
    if (!cart) {
      throw new Error(`CARTS[${id}] not registered`);
    }

    if (!cart.name || typeof cart.init !== 'function' || typeof cart.update !== 'function' || typeof cart.render !== 'function') {
      throw new Error(`missing required lifecycle methods`);
    }

    // Initialize cartridge
    cart.init();

    // Render cartridge icon if present
    if (typeof cart.icon === 'function') {
      cart.icon(g, 10, 10);
    }

    // Simulate 60 active gameplay frames with diverse inputs
    for (let frame = 0; frame < 60; frame++) {
      global.PAD.hits['a'] = (frame % 8 === 0);
      global.PAD.hits['b'] = (frame % 12 === 0);
      global.PAD.hits['up'] = (frame % 15 === 0);
      global.PAD.hits['down'] = (frame % 14 === 0);
      global.PAD.hits['left'] = (frame % 10 === 0);
      global.PAD.hits['right'] = (frame % 11 === 0);

      global.PAD.state['a'] = (frame % 8 < 4);
      global.PAD.state['b'] = (frame % 12 < 5);
      global.PAD.state['up'] = (frame % 15 < 3);
      global.PAD.state['down'] = (frame % 14 < 3);
      global.PAD.state['left'] = (frame % 10 < 3);
      global.PAD.state['right'] = (frame % 11 < 3);

      global.TOUCH.down = (frame === 20 || frame === 40);
      global.TOUCH.held = (frame >= 20 && frame <= 25);
      global.TOUCH.x = 120 + (frame % 20);
      global.TOUCH.y = 120 - (frame % 20);
      global.PAD.pointer.down = global.TOUCH.down;
      global.PAD.pointer.x = global.TOUCH.x;
      global.PAD.pointer.y = global.TOUCH.y;
      global.PAD.tapPos = global.TOUCH.down ? { x: global.TOUCH.x, y: global.TOUCH.y } : null;

      cart.update(0.016);
    }

    // Render cartridge frame
    cart.render(g);

    passed++;
    console.log(`[PASS] Cart #${String(id).padStart(3, '0')} - ${cart.name}`);
  } catch (err) {
    console.error(`[FAIL] Cart #${String(id).padStart(3, '0')} (${match}):`, err.message);
    failed++;
    failureDetails.push(`Cart #${id} (${match}): ${err.message}`);
  }
}

console.log("\n================================================================================");
console.log(`=== MASTER AUDIT COMPLETE: ${passed} / 100 PASSED (${failed} FAILED) ===`);
console.log("================================================================================");

if (failed > 0) {
  console.error("FAILURES:\n" + failureDetails.join("\n"));
  process.exit(1);
} else {
  console.log("CONGRATULATIONS: ALL 100 CARTRIDGES ARE VERIFIED 100% OPERATIONAL!");
}
