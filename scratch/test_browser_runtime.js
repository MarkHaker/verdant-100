// scratch/test_browser_runtime.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 1. Mock Browser Window & DOM
const mockCtx = {
  fillStyle: '#000',
  fillRect(x, y, w, h) {},
  beginPath() {},
  moveTo(x, y) {},
  lineTo(x, y) {},
  closePath() {},
  fill() {},
  stroke() {},
  createImageData(w, h) {
    return { data: new Uint8ClampedArray(w * h * 4) };
  },
  putImageData(imgData, x, y) {}
};

const mockCanvas = {
  getContext(type, opts) { return mockCtx; }
};

const mockLocalStorage = {
  _store: {},
  getItem(key) { return this._store[key] || null; },
  setItem(key, val) { this._store[key] = String(val); },
  removeItem(key) { delete this._store[key]; }
};

global.window = global;
global.document = {
  getElementById(id) {
    if (id === 'screen-canvas') return mockCanvas;
    return { className: '', style: {}, addEventListener() {} };
  },
  addEventListener() {},
  documentElement: { style: { setProperty() {} } },
  readyState: 'complete'
};
global.localStorage = mockLocalStorage;
global.performance = { now: () => Date.now() };
global.navigator = { vibrate() {} };

// 2. Load Core Scripts in order as in index.html
const scripts = [
  'js/config.js',
  'js/gfx.js',
  'js/apu.js',
  'js/save.js',
  'js/pad.js',
  'js/engines.js',
  'js/carts.js'
];

for (const s of scripts) {
  const code = fs.readFileSync(s, 'utf8');
  // For engines.js and others, evaluate in global context
  // In browser, top-level const in script tag is in script scope, accessible across scripts.
  // In node vm.runInThisContext, var/functions attach to global, but const/let don't attach to global object.
  // We can convert top-level `const X =` or `let X =` to `var X =` or `window.X =`
  const converted = code.replace(/^(const|let) ([a-zA-Z0-9_]+)\s*=/gm, 'window.$2 =');
  vm.runInThisContext(converted);
}

// Ensure GFX is initialized
GFX.init();
SAVE.init();

// 3. Load all 100 Cartridges
const cartDir = 'js/cartridges';
const files = fs.readdirSync(cartDir).filter(f => f.endsWith('.js'));

const loadErrors = [];
for (let id = 1; id <= 100; id++) {
  const prefix = 'cart_' + String(id).padStart(3, '0') + '_';
  const file = files.find(f => f.startsWith(prefix));
  if (!file) {
    loadErrors.push(`Cart #${id} missing file`);
    continue;
  }
  try {
    const code = fs.readFileSync(path.join(cartDir, file), 'utf8');
    const converted = code.replace(/^(const|let) ([a-zA-Z0-9_]+)\s*=/gm, 'window.$2 =');
    vm.runInThisContext(converted);
  } catch (err) {
    loadErrors.push(`Cart #${id} (${file}) LOAD ERROR: ${err.message}`);
  }
}

if (loadErrors.length > 0) {
  console.error("LOAD ERRORS FOUND:");
  console.error(loadErrors.join('\n'));
} else {
  console.log("All 100 cartridges loaded without script syntax errors.");
}

// 4. Load VOS
const vosCode = fs.readFileSync('js/vos.js', 'utf8').replace(/^(const|let) (VOS)\s*=/gm, 'window.$2 =');
vm.runInThisContext(vosCode);
VOS.init();

// 5. Test launchGame flow for all 100 cartridges
console.log("\n--- TESTING LAUNCH & RUNTIME FOR ALL 100 CARTRIDGES ---");
const runtimeFailures = [];

for (let id = 1; id <= 100; id++) {
  const cart = CARTS[id];
  if (!cart) {
    runtimeFailures.push(`Cart #${id}: NOT IN CARTS!`);
    continue;
  }

  try {
    // Exact steps from VOS.launchGame:
    VOS.mode = 'PREVIEW';
    VOS.selectedCartId = id;
    VOS.activeCart = cart;

    // APU jingle
    APU.jingle(id);

    // cart.init
    cart.init();

    // persistent load
    const savedPer = SAVE.getPersistent(id);
    if (savedPer && cart.load) {
      cart.load(savedPer);
    }

    // icon render (preview screen)
    if (cart.icon) {
      cart.icon(GFX, 26, 34);
    }

    // 10 simulation frames
    for (let f = 0; f < 10; f++) {
      cart.update(1 / 60);
      cart.render(GFX);
    }

    // Also test VOS.render in GAME mode
    VOS.mode = 'GAME';
    VOS.update(1 / 60);
    VOS.render(GFX);

  } catch (err) {
    console.error(`[FAIL] Cart #${id} (${cart.name}): ${err.message}\n${err.stack}`);
    runtimeFailures.push(`Cart #${id} (${cart.name}): ${err.message}`);
  }
}

console.log("\n=======================================================");
if (runtimeFailures.length === 0) {
  console.log("ALL 100 CARTRIDGES PASSED RUNTIME SIMULATION!");
} else {
  console.error(`FOUND ${runtimeFailures.length} RUNTIME FAILURES:`);
  console.error(runtimeFailures.join('\n'));
}
