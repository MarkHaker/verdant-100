// js/cartridges/cart_037_traffic_ctrl.js
// ============================================================================
// Cartridge #037: TRAFFIC CTRL
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 37. TRAFFIC CONTROL
CARTS[37] = {
  id: 37, name: "TRAFFIC CTRL", genre: 3, scoreLabel: "CARS",
  desc: "[A] SWITCH LIGHTS. MANAGE BUSY INTERSECTION WITHOUT ANY VEHICLE CRASHES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.rect(x + 14, y + 4, 4, 24, 2);
    g.rect(x + 4, y + 14, 24, 4, 2);
  },
  init() {
    this.light = 'NS'; // 'NS' or 'EW'
    this.cars = [];
    this.score = 0;
    this.spawnTimer = 0.5;
    this.over = false;
    this.crashPt = null;
  },
  update(dt) {
    if (this.over) {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start')) this.init();
      return;
    }
    if (PAD.hit('a') || PAD.hit('b')) {
      this.light = this.light === 'NS' ? 'EW' : 'NS';
      APU.sfx('TICK');
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 1.0 + Math.random() * 0.8;
      const isNS = Math.random() < 0.5;
      if (isNS) {
        const busy = this.cars.some(c => c.dir === 'NS' && c.y < 35);
        if (!busy) this.cars.push({ dir: 'NS', x: 122, y: -16, speed: 65 });
      } else {
        const busy = this.cars.some(c => c.dir === 'EW' && c.x < 35);
        if (!busy) this.cars.push({ dir: 'EW', x: -16, y: 114, speed: 65 });
      }
    }

    // Move cars and check traffic stops
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const c = this.cars[i];
      let canMove = true;

      if (c.dir === 'NS') {
        if (this.light !== 'NS' && c.y >= 82 && c.y <= 96) {
          canMove = false;
        }
        for (let other of this.cars) {
          if (other !== c && other.dir === 'NS' && other.y > c.y && other.y - c.y < 16) {
            canMove = false;
          }
        }
        if (canMove) c.y += c.speed * dt;
      } else {
        if (this.light !== 'EW' && c.x >= 86 && c.x <= 100) {
          canMove = false;
        }
        for (let other of this.cars) {
          if (other !== c && other.dir === 'EW' && other.x > c.x && other.x - c.x < 16) {
            canMove = false;
          }
        }
        if (canMove) c.x += c.speed * dt;
      }

      if (c.x > 265 || c.y > 245) {
        this.cars.splice(i, 1);
        this.score++;
        APU.sfx('COIN');
      }
    }

    // Car-car crash detection
    for (let i = 0; i < this.cars.length; i++) {
      for (let j = i + 1; j < this.cars.length; j++) {
        const c1 = this.cars[i];
        const c2 = this.cars[j];
        if (Math.abs(c1.x - c2.x) < 11 && Math.abs(c1.y - c2.y) < 11) {
          this.over = true;
          this.crashPt = { x: (c1.x + c2.x) / 2, y: (c1.y + c2.y) / 2 };
          APU.sfx('BOOM');
          SAVE.setScore(this.id, this.score);
          return;
        }
      }
    }
  },
  render(g) {
    g.clear(0);
    // Roads
    g.rect(114, 0, 28, 240, 1);
    g.rect(0, 106, 256, 28, 1);
    for (let y = 0; y < 240; y += 12) {
      if (y < 100 || y > 140) g.line(128, y, 128, y + 6, 0);
    }
    for (let x = 0; x < 256; x += 12) {
      if (x < 110 || x > 145) g.line(x, 120, x + 6, 120, 0);
    }

    if (this.light === 'NS') {
      g.line(100, 106, 100, 134, 3);
    } else {
      g.line(114, 96, 142, 96, 3);
    }

    // Traffic signals
    g.rect(98, 86, 12, 16, 0);
    g.box(98, 86, 12, 16, 2);
    g.disc(104, 91, 2, this.light === 'NS' ? 3 : 1);
    g.disc(104, 97, 2, this.light === 'EW' ? 3 : 1);

    for (let c of this.cars) {
      const cx = Math.floor(c.x);
      const cy = Math.floor(c.y);
      if (c.dir === 'NS') {
        g.rect(cx - 5, cy - 6, 10, 14, 3);
        g.rect(cx - 3, cy - 4, 6, 4, 1);
      } else {
        g.rect(cx - 6, cy - 5, 14, 10, 3);
        g.rect(cx - 4, cy - 3, 4, 6, 1);
      }
    }

    if (this.crashPt) {
      g.disc(Math.floor(this.crashPt.x), Math.floor(this.crashPt.y), 12, 3);
      g.circle(Math.floor(this.crashPt.x), Math.floor(this.crashPt.y), 16, 2);
    }

    g.text("LIGHT: " + this.light, 14, 14, 3);
    g.textR("CARS: " + this.score, 240, 14, 3);
    g.textC("[A] SWITCH SIGNAL", 226, 2);

    if (this.over) {
      g.rect(48, 85, 160, 60, 0);
      g.box(48, 85, 160, 60, 3);
      g.textC("INTERSECTION PILEUP!", 98, 1);
      g.textC("SAFE TRANSITS: " + this.score, 114, 3);
      g.textC("PRESS [A] TO RETRY", 130, 2);
    }
  }
};
