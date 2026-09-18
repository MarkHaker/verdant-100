// js/carts.js
// ============================================================================
// [CARTS] MODULAR CARTRIDGE REGISTRY & NODE.JS COMPATIBILITY LOADER
// ============================================================================
// All 100 individual cartridge implementations reside in js/cartridges/*.js

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

if (typeof module !== 'undefined' && typeof require !== 'undefined') {
  const fs = require('fs');
  const path = require('path');
  const dir = path.join(__dirname, 'cartridges');
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).sort().forEach(file => {
      if (file.endsWith('.js')) {
        require(path.join(dir, file));
      }
    });
  }
  module.exports = CARTS;
}
