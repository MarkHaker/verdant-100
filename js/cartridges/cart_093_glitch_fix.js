// js/cartridges/cart_093_glitch_fix.js
// ============================================================================
// Cartridge #093: GLITCH FIX
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[93] = {
  id: 93,
  name: "GLITCH FIX",
  genre: 9,
  scoreLabel: "PURGED",
  desc: "DEFRAG RAM MEMORY BLOCKS! PURGE SPREADING GLITCH SECTORS BEFORE KERNEL PANIC OCCURS!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Glitchy memory grid
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 3; c++) {
        var col = (r + c) % 2 === 0 ? 3 : 1;
        g.box(x + 6 + c * 7, y + 6 + r * 7, 5, 5, col);
      }
    }
  },

  init() {
    this.cols = 10;
    this.rows = 8;
    this.totalSectors = 80;
    this.sectors = new Uint8Array(80); // 0: CLEAN, 1: GLITCH, 2: CORRUPT_L2

    this.cursorX = 4;
    this.cursorY = 4;
    this.purgedCount = 0;
    this.heapsCleared = 0;
    this.empCharges = 2;
    this.empCooldown = 0;

    this.spreadTimer = 0;
    this.corruptionRatio = 0.0;
    this.state = 'PLAY'; // 'PLAY', 'HEAP_CLEAR', 'KERNEL_PANIC'
    this.stateTimer = 0;
    this.particles = [];
    this.glitchNoise = 0;

    this.spawnHeap(1);
  },

  spawnHeap(round) {
    this.sectors.fill(0);
    // Seed initial glitches (5 to 10)
    var initialGlitches = 6 + round * 2;
    for (var i = 0; i < initialGlitches; i++) {
      var rx = Math.floor(Math.random() * this.cols);
      var ry = Math.floor(Math.random() * this.rows);
      this.sectors[ry * this.cols + rx] = 1;
    }
    this.spreadTimer = 0;
    this.state = 'PLAY';
    this.updateCorruptionRatio();
  },

  updateCorruptionRatio() {
    var corrupted = 0;
    for (var i = 0; i < this.totalSectors; i++) {
      if (this.sectors[i] > 0) corrupted++;
    }
    this.corruptionRatio = corrupted / this.totalSectors;
    if (this.corruptionRatio >= 0.75 && this.state === 'PLAY') {
      this.state = 'KERNEL_PANIC';
      this.stateTimer = 0;
      APU.sfx('EXPLODE');
      SAVE.setScore(this.id, this.purgedCount);
    }
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;
    this.glitchNoise = (this.glitchNoise + 1) % 100;

    if (this.empCooldown > 0) this.empCooldown -= dt;

    if (this.state === 'HEAP_CLEAR') {
      if (this.stateTimer > 1.2 || PAD.hit('a') || TOUCH.down) {
        this.heapsCleared++;
        if (this.heapsCleared % 2 === 0 && this.empCharges < 3) this.empCharges++;
        this.spawnHeap(this.heapsCleared + 1);
        APU.sfx('CONFIRM');
      }
      return;
    }

    if (this.state === 'KERNEL_PANIC') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    // Cursor navigation D-pad
    if (PAD.hit('left')) { this.cursorX = (this.cursorX - 1 + this.cols) % this.cols; APU.sfx('SELECT'); }
    if (PAD.hit('right')) { this.cursorX = (this.cursorX + 1) % this.cols; APU.sfx('SELECT'); }
    if (PAD.hit('up')) { this.cursorY = (this.cursorY - 1 + this.rows) % this.rows; APU.sfx('SELECT'); }
    if (PAD.hit('down')) { this.cursorY = (this.cursorY + 1) % this.rows; APU.sfx('SELECT'); }

    // [A] Purge Sector at Cursor
    if (PAD.hit('a')) {
      this.purgeSector(this.cursorX, this.cursorY);
    }

    // [B] EMP Flush (3x3 area)
    if (PAD.hit('b')) {
      this.triggerEmpFlush();
    }

    // Direct Touch Controls: tap sector directly
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      var ox = 20, oy = 32, sz = 20;
      if (tx >= ox && tx < ox + this.cols * sz && ty >= oy && ty < oy + this.rows * sz) {
        var gx = Math.floor((tx - ox) / sz);
        var gy = Math.floor((ty - oy) / sz);
        this.cursorX = gx;
        this.cursorY = gy;
        this.purgeSector(gx, gy);
      }
      // Tap EMP button bottom right
      if (tx >= 160 && ty >= 210) {
        this.triggerEmpFlush();
      }
    }

    // Spreading Corruption AI
    this.spreadTimer += dt;
    var spreadInterval = Math.max(0.6, 2.0 - this.heapsCleared * 0.1);
    if (this.spreadTimer >= spreadInterval) {
      this.spreadTimer = 0;
      this.spreadCorruption();
    }

    // Update Particles
    for (var p = this.particles.length - 1; p >= 0; p--) {
      var pt = this.particles[p];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(p, 1);
    }

    // Check if heap is completely cleansed
    var activeGlitches = 0;
    for (var k = 0; k < this.totalSectors; k++) {
      if (this.sectors[k] > 0) activeGlitches++;
    }
    if (activeGlitches === 0 && this.state === 'PLAY') {
      this.state = 'HEAP_CLEAR';
      this.stateTimer = 0;
      APU.sfx('FANFARE');
    }
  },

  purgeSector(x, y) {
    var idx = y * this.cols + x;
    if (this.sectors[idx] > 0) {
      this.sectors[idx]--;
      this.purgedCount++;
      APU.sfx('HIT');

      // Spark particles
      var ox = 20, oy = 32, sz = 20;
      var px = ox + x * sz + sz / 2;
      var py = oy + y * sz + sz / 2;
      for (var k = 0; k < 4; k++) {
        this.particles.push({
          x: px, y: py,
          vx: (Math.random() - 0.5) * 35, vy: (Math.random() - 0.5) * 35,
          life: 0.3
        });
      }

      this.updateCorruptionRatio();
      SAVE.setScore(this.id, this.purgedCount);
    } else {
      APU.sfx('TICK');
    }
  },

  triggerEmpFlush() {
    if (this.empCharges > 0 && this.empCooldown <= 0) {
      this.empCharges--;
      this.empCooldown = 0.5;
      APU.sfx('POWERUP');

      // Purge 3x3 area around cursor
      for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
          var nx = this.cursorX + dx;
          var ny = this.cursorY + dy;
          if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
            var idx = ny * this.cols + nx;
            if (this.sectors[idx] > 0) {
              this.sectors[idx] = 0;
              this.purgedCount++;
            }
          }
        }
      }
      this.updateCorruptionRatio();
      SAVE.setScore(this.id, this.purgedCount);
    } else {
      APU.sfx('ERROR');
    }
  },

  spreadCorruption() {
    // Pick an existing glitch and infect an adjacent neighbor
    var glitches = [];
    for (var i = 0; i < this.totalSectors; i++) {
      if (this.sectors[i] > 0) glitches.push(i);
    }
    if (glitches.length === 0) return;

    var sourceIdx = glitches[Math.floor(Math.random() * glitches.length)];
    var sx = sourceIdx % this.cols;
    var sy = Math.floor(sourceIdx / this.cols);

    var dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
    var d = dirs[Math.floor(Math.random() * dirs.length)];
    var nx = sx + d.dx;
    var ny = sy + d.dy;

    if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
      var nIdx = ny * this.cols + nx;
      if (this.sectors[nIdx] < 2) {
        this.sectors[nIdx]++;
        this.updateCorruptionRatio();
      }
    }
  },

  render(g) {
    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("GLITCH FIX", 6, 6, 3);
    var pct = Math.floor(this.corruptionRatio * 100);
    g.text("CORRUPT:" + pct + "%", 86, 6, pct > 45 ? 3 : 2);
    g.text("HEAP:" + (this.heapsCleared + 1), 162, 6, 2);
    g.textR("EMP:" + this.empCharges, 234, 6, this.empCharges > 0 ? 3 : 1);

    // Corruption Warning Bar
    g.rect(0, 22, Math.floor(240 * this.corruptionRatio), 4, pct > 50 ? 3 : 2);

    // 10x8 RAM Matrix Rendering
    var ox = 20, oy = 30, sz = 20;

    for (var y = 0; y < this.rows; y++) {
      for (var x = 0; x < this.cols; x++) {
        var idx = y * this.cols + x;
        var bx = ox + x * sz;
        var by = oy + y * sz;
        var state = this.sectors[idx];
        var isCursor = (x === this.cursorX && y === this.cursorY);

        if (state === 0) {
          // Clean sector
          g.box(bx + 1, by + 1, sz - 2, sz - 2, 1);
          g.px(bx + sz / 2, by + sz / 2, 1);
        } else if (state === 1) {
          // Glitching sector
          var jitterX = (Math.random() - 0.5) * 2;
          var jitterY = (Math.random() - 0.5) * 2;
          g.rect(bx + 1 + jitterX, by + 1 + jitterY, sz - 2, sz - 2, 2);
          g.text("?", bx + 6, by + 5, 0);
        } else if (state === 2) {
          // Hard corrupt sector
          g.rect(bx + 1, by + 1, sz - 2, sz - 2, 3);
          g.line(bx + 2, by + 2, bx + sz - 3, by + sz - 3, 0);
          g.line(bx + 2, by + sz - 3, bx + sz - 3, by + 2, 0);
        }

        if (isCursor) {
          g.box(bx - 1, by - 1, sz + 2, sz + 2, 3);
        }
      }
    }

    // Particles
    for (var p = 0; p < this.particles.length; p++) {
      var pt = this.particles[p];
      g.px(pt.x, pt.y, 3);
    }

    // Bottom Help Banner
    g.rect(0, 224, 240, 16, 0);
    g.line(0, 224, 240, 224, 2);
    g.text("D-PAD: MOVE  [A]: PURGE", 6, 227, 2);
    g.textR("[B] EMP FLUSH (3X3)", 234, 227, this.empCharges > 0 ? 3 : 1);

    // Overlays
    if (this.state === 'HEAP_CLEAR') {
      g.rect(30, 80, 180, 70, 0);
      g.box(30, 80, 180, 70, 3);
      g.textC("HEAP PURGED CLEAN!", 95, 3);
      g.textC("TOTAL BLOCKS FIXED: " + this.purgedCount, 115, 2);
      g.textC("ALLOCATING NEXT HEAP...", 132, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    } else if (this.state === 'KERNEL_PANIC') {
      g.rect(15, 50, 210, 130, 0);
      g.box(15, 50, 210, 130, 3);
      g.textC("*** KERNEL PANIC ***", 68, 3);
      g.textC("RAM CORRUPTION EXCEEDED 75%", 92, 2);
      g.textC("TOTAL SECTORS PURGED: " + this.purgedCount, 112, 2);
      g.textC("PRESS [A] TO REBOOT SYSTEM", 145, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  }
};
