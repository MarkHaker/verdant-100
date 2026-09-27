// js/cartridges/cart_088_speed_typer.js
// ============================================================================
// Cartridge #088: SPEED TYPER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[88] = {
  id: 88,
  name: "SPEED TYPER",
  genre: 8,
  scoreLabel: "WPM",
  desc: "ZTYPE ARCADE: BLAST FALLING WORD METEORS BY TYPING LETTERS VIA KEYBOARD OR ON-SCREEN TOUCH KEYS!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Keyboard key icon with 'A'
    g.box(x + 7, y + 8, 18, 16, 3);
    g.text("A", x + 13, y + 13, 3);
    g.line(x + 7, y + 21, x + 25, y + 21, 2);
  },

  init() {
    this.score = 0;
    this.wordsBlasted = 0;
    this.totalCharsTyped = 0;
    this.totalErrors = 0;
    this.hp = 100;
    this.elapsedTime = 0;

    this.meteors = [];
    this.activeMeteor = null;
    this.particles = [];
    this.laserBeam = null; // { x1, y1, x2, y2, life }

    this.state = 'PLAY'; // 'PLAY', 'GAMEOVER'
    this.stateTimer = 0;
    this.spawnTimer = 0.5;

    // Virtual Keyboard cursor
    this.vkRow = 0;
    this.vkCol = 0;
    this.vkRows = [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["Z", "X", "C", "V", "B", "N", "M"]
    ];

    // Word Dictionary
    this.dictionary = [
      "BIT", "BYTE", "RAM", "ROM", "CPU", "BUS", "CODE",
      "PIXEL", "LASER", "CYBER", "NEON", "GLOW", "CORE",
      "CHIP", "DATA", "NODE", "PORT", "SYNC", "WAVE",
      "ROBOT", "RADAR", "SONAR", "ALARM", "SHIELD", "MATRIX",
      "CONSOLE", "PHOSPHOR", "VERDANT", "TERMINAL"
    ];

    // Hook keyboard listener if available
    this.hookKeyboard();
  },

  hookKeyboard() {
    if (typeof window !== 'undefined' && window.addEventListener && !window._speedTyperHooked) {
      window._speedTyperHooked = true;
      window.addEventListener('keydown', function(e) {
        var cart = (window.CONSOLE && window.CONSOLE.cart) ? window.CONSOLE.cart : (window.CARTS ? window.CARTS[88] : null);
        if (cart && cart.id === 88 && cart.state === 'PLAY') {
          var k = e.key.toUpperCase();
          if (k.length === 1 && k >= 'A' && k <= 'Z') {
            cart.onCharInput(k);
          }
        }
      });
    }
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;

    if (this.state === 'GAMEOVER') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    this.elapsedTime += dt;

    // Laser beam animation
    if (this.laserBeam) {
      this.laserBeam.life -= dt;
      if (this.laserBeam.life <= 0) this.laserBeam = null;
    }

    // Spawn falling word meteors
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = Math.max(1.2, 3.2 - this.wordsBlasted * 0.05);
      this.spawnMeteor();
    }

    // Update Meteors
    for (var i = this.meteors.length - 1; i >= 0; i--) {
      var m = this.meteors[i];
      m.y += m.speed * dt;

      // Check reaching ground shield line (y = 168)
      if (m.y >= 162) {
        this.hp = Math.max(0, this.hp - 25);
        this.spawnExplosion(m.x, m.y, 8);
        APU.sfx('EXPLODE');
        if (this.activeMeteor === m) this.activeMeteor = null;
        this.meteors.splice(i, 1);

        if (this.hp <= 0) {
          this.state = 'GAMEOVER';
          this.stateTimer = 0;
          var wpm = Math.floor((this.totalCharsTyped / 5) / (Math.max(1, this.elapsedTime) / 60));
          SAVE.setScore(this.id, wpm);
          APU.sfx('ERROR');
        }
      }
    }

    // Update Particles
    for (var p = this.particles.length - 1; p >= 0; p--) {
      var pt = this.particles[p];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(p, 1);
    }

    // Virtual Keyboard Navigation via Gamepad D-pad
    if (PAD.hit('up')) {
      this.vkRow = (this.vkRow - 1 + 3) % 3;
      this.vkCol = Math.min(this.vkCol, this.vkRows[this.vkRow].length - 1);
      APU.sfx('SELECT');
    }
    if (PAD.hit('down')) {
      this.vkRow = (this.vkRow + 1) % 3;
      this.vkCol = Math.min(this.vkCol, this.vkRows[this.vkRow].length - 1);
      APU.sfx('SELECT');
    }
    if (PAD.hit('left')) {
      this.vkCol = (this.vkCol - 1 + this.vkRows[this.vkRow].length) % this.vkRows[this.vkRow].length;
      APU.sfx('SELECT');
    }
    if (PAD.hit('right')) {
      this.vkCol = (this.vkCol + 1) % this.vkRows[this.vkRow].length;
      APU.sfx('SELECT');
    }

    // [A] Type selected virtual key
    if (PAD.hit('a')) {
      var char = this.vkRows[this.vkRow][this.vkCol];
      this.onCharInput(char);
    }

    // Direct Touch typing on virtual keyboard
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      var kbY = 176, keyH = 18;
      for (var r = 0; r < 3; r++) {
        var rowKeys = this.vkRows[r];
        var rowOffX = r === 1 ? 10 : (r === 2 ? 30 : 0);
        var keyW = 22;
        var ry = kbY + r * (keyH + 2);
        for (var c = 0; c < rowKeys.length; c++) {
          var rx = 10 + rowOffX + c * (keyW + 2);
          if (tx >= rx && tx <= rx + keyW && ty >= ry && ty <= ry + keyH) {
            this.vkRow = r;
            this.vkCol = c;
            this.onCharInput(rowKeys[c]);
            break;
          }
        }
      }
    }
  },

  spawnMeteor() {
    var word = this.dictionary[Math.floor(Math.random() * this.dictionary.length)];
    var spawnX = 25 + Math.random() * (240 - word.length * 8 - 50);
    this.meteors.push({
      word: word,
      typedIdx: 0,
      x: spawnX,
      y: 26,
      speed: 16 + Math.random() * 12 + this.wordsBlasted * 0.5
    });
  },

  onCharInput(char) {
    this.totalCharsTyped++;

    if (!this.activeMeteor) {
      // Find meteor matching this initial letter
      for (var i = 0; i < this.meteors.length; i++) {
        var m = this.meteors[i];
        if (m.word[0] === char) {
          this.activeMeteor = m;
          break;
        }
      }
    }

    if (this.activeMeteor) {
      var m = this.activeMeteor;
      if (m.word[m.typedIdx] === char) {
        // Correct letter!
        m.typedIdx++;
        APU.sfx('TICK');

        // Laser shot from ground cannon
        var mx = m.x + m.typedIdx * 8;
        this.laserBeam = { x1: 120, y1: 166, x2: mx, y2: m.y + 6, life: 0.12 };

        if (m.typedIdx >= m.word.length) {
          // Word destroyed!
          this.wordsBlasted++;
          this.score += m.word.length * 20;
          this.spawnExplosion(m.x + (m.word.length * 8) / 2, m.y + 6, 12);
          APU.sfx('COIN');

          // Remove meteor
          var mIdx = this.meteors.indexOf(m);
          if (mIdx !== -1) this.meteors.splice(mIdx, 1);
          this.activeMeteor = null;

          var wpm = Math.floor((this.totalCharsTyped / 5) / (Math.max(1, this.elapsedTime) / 60));
          SAVE.setScore(this.id, wpm);
        }
      } else {
        // Letter mismatch error
        this.totalErrors++;
        APU.sfx('HIT');
      }
    } else {
      // No meteor starts with this letter
      this.totalErrors++;
      APU.sfx('HIT');
    }
  },

  spawnExplosion(x, y, count) {
    for (var k = 0; k < count; k++) {
      var a = Math.random() * Math.PI * 2;
      var s = 25 + Math.random() * 45;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 0.4 + Math.random() * 0.3
      });
    }
  },

  render(g) {
    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("SPEED TYPER", 6, 6, 3);
    var wpm = Math.floor((this.totalCharsTyped / 5) / (Math.max(1, this.elapsedTime) / 60));
    g.text("WPM:" + wpm, 96, 6, 3);
    g.text("SHIELD:" + this.hp + "%", 146, 6, this.hp < 40 ? 3 : 2);
    g.textR("W:" + this.wordsBlasted, 234, 6, 3);

    // Shield defense line
    g.line(0, 168, 240, 168, 2);
    g.disc(120, 168, 4, 3); // Laser cannon base

    // Laser Beam
    if (this.laserBeam) {
      g.line(this.laserBeam.x1, this.laserBeam.y1, this.laserBeam.x2, this.laserBeam.y2, 3);
    }

    // Falling Meteors
    for (var i = 0; i < this.meteors.length; i++) {
      var m = this.meteors[i];
      var isTarget = (m === this.activeMeteor);
      var wLen = m.word.length * 8 + 8;

      // Word capsule
      g.rect(m.x - 2, m.y - 2, wLen, 14, 0);
      g.box(m.x - 2, m.y - 2, wLen, 14, isTarget ? 3 : 1);

      // Render letters (typed in shade 2/1, remaining in shade 3)
      for (var l = 0; l < m.word.length; l++) {
        var charX = m.x + 3 + l * 8;
        var charY = m.y + 2;
        var isTyped = (l < m.typedIdx);
        var col = isTyped ? 1 : (isTarget ? 3 : 2);
        g.text(m.word[l], charX, charY, col);
      }
    }

    // Particles
    for (var p = 0; p < this.particles.length; p++) {
      var pt = this.particles[p];
      g.px(pt.x, pt.y, pt.life > 0.2 ? 3 : 2);
    }

    // On-Screen Virtual Keyboard (Bottom)
    var kbY = 176, keyH = 18;
    for (var r = 0; r < 3; r++) {
      var rowKeys = this.vkRows[r];
      var rowOffX = r === 1 ? 10 : (r === 2 ? 30 : 0);
      var keyW = 20;
      var ry = kbY + r * (keyH + 2);
      for (var c = 0; c < rowKeys.length; c++) {
        var rx = 10 + rowOffX + c * (keyW + 2);
        var isSel = (r === this.vkRow && c === this.vkCol);
        g.rect(rx, ry, keyW, keyH, isSel ? 1 : 0);
        g.box(rx, ry, keyW, keyH, isSel ? 3 : 2);
        g.text(rowKeys[c], rx + 6, ry + 5, isSel ? 3 : 2);
      }
    }

    // Overlays
    if (this.state === 'GAMEOVER') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("BASE BREACHED!", 70, 3);
      g.textC("TYPING SPEED: " + wpm + " WPM", 95, 3);
      g.textC("WORDS INTERCEPTED: " + this.wordsBlasted, 115, 2);
      g.textC("TOTAL TYPOS: " + this.totalErrors, 132, 2);
      g.textC("PRESS [A] TO DEFEND AGAIN", 158, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  }
};
