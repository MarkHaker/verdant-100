// scratch/test_genre_8_verification.js
const fs = require('fs');
const path = require('path');

// Mock Console Environment
global.CARTS = {};
global.PAD = {
  state: { up: false, down: false, left: false, right: false, a: false, b: false, pause: false },
  hitState: {},
  hit(btn) { return !!this.hitState[btn]; },
  btn(btn) { return !!this.state[btn]; }
};
global.TOUCH = { down: false, held: false, x: 0, y: 0, drag: false, swipe: null };
global.APU = {
  sfx(name) { /* mock sfx */ },
  tone(freq, dur, type, vol) { /* mock tone */ },
  playTrack(track) { /* mock music */ }
};
global.SAVE = {
  scores: {},
  setScore(id, score) { this.scores[id] = score; },
  getScore(id) { return this.scores[id] || 0; }
};

const createMockG = () => ({
  clear(col) {},
  rect(x, y, w, h, col) {},
  box(x, y, w, h, col) {},
  line(x1, y1, x2, y2, col) {},
  circle(x, y, r, col) {},
  disc(x, y, r, col) {},
  tri(x1, y1, x2, y2, x3, y3, col) {},
  oval(x, y, rx, ry, col) {},
  px(x, y, col) {},
  dither(level) {},
  text(str, x, y, col) {},
  textC(str, y, col) {},
  textR(str, x, y, col) {}
});

const g = createMockG();

console.log("=== STARTING GENRE 8 AUTOMATED VERIFICATION TEST (#081 - #090) ===");

const cartsToTest = [81, 82, 83, 84, 85, 86, 87, 88, 89, 90];
let passed = 0;
let failed = 0;

for (const id of cartsToTest) {
  try {
    const cartDir = path.join(__dirname, '..', 'js', 'cartridges');
    const files = fs.readdirSync(cartDir);
    const match = files.find(f => f.startsWith(`cart_${String(id).padStart(3, '0')}_`));
    
    if (!match) {
      throw new Error(`File not found for cartridge #${id}`);
    }

    const fullPath = path.join(cartDir, match);
    require(fullPath);

    const cart = global.CARTS[id];
    if (!cart) {
      throw new Error(`CARTS[${id}] not registered after require!`);
    }

    // 1. Check metadata
    if (!cart.name || typeof cart.init !== 'function' || typeof cart.update !== 'function' || typeof cart.render !== 'function') {
      throw new Error(`Cart #${id} missing critical lifecycle methods or name!`);
    }

    // 2. Test Init
    cart.init();

    // 3. Test Icon
    if (typeof cart.icon === 'function') {
      cart.icon(g, 10, 10);
    }

    // 4. Test Update loop (100 frames with input variance)
    for (let frame = 0; frame < 100; frame++) {
      if (frame === 10) global.PAD.hitState['a'] = true;
      else if (frame === 11) global.PAD.hitState['a'] = false;

      if (frame === 20) global.PAD.hitState['b'] = true;
      else if (frame === 21) global.PAD.hitState['b'] = false;

      if (frame === 30) global.PAD.hitState['left'] = true;
      else if (frame === 35) global.PAD.hitState['left'] = false;

      if (frame === 40) global.PAD.hitState['right'] = true;
      else if (frame === 45) global.PAD.hitState['right'] = false;

      if (frame === 50) { global.TOUCH.down = true; global.TOUCH.x = 120; global.TOUCH.y = 120; }
      else if (frame === 55) { global.TOUCH.down = false; }

      cart.update(0.016);
    }

    // 5. Test Render loop
    cart.render(g);

    console.log(`[PASS] Cart #${id} (${cart.name}) - verified lifecycle, icon, update, and render cleanly.`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] Cart #${id} ERROR:`, err.message);
    failed++;
  }
}

console.log(`\n=== GENRE 8 VERIFICATION RESULTS: ${passed} / ${cartsToTest.length} PASSED (${failed} FAILED) ===`);
if (failed > 0) process.exit(1);
