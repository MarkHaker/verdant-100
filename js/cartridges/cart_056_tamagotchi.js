// js/cartridges/cart_056_tamagotchi.js
// ============================================================================
// Cartridge #056: TAMAGOTCHI
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 56. TAMAGOTCHI (PERSISTENT!)
CARTS[56] = {
  id: 56, name: "TAMAGOTCHI", genre: 5, scoreLabel: "DAYS",
  desc: "VIRTUAL PHOSPHOR PET: TICKS OFFLINE IN REAL TIME! FEED, CLEAN, AND PET.",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.disc(x + 16, y + 16, 8, 3);
    g.disc(x + 12, y + 14, 2, 0);
    g.disc(x + 20, y + 14, 2, 0);
  },
  init() {
    this.pet = { born: Date.now(), hunger: 80, happy: 80, lastTick: Date.now() };
  },
  save() { return this.pet; },
  load(data) {
    if (data) {
      this.pet = data;
      const elapsedMins = (Date.now() - this.pet.lastTick) / 60000;
      this.pet.hunger = Math.max(0, this.pet.hunger - Math.floor(elapsedMins * 2));
      this.pet.happy = Math.max(0, this.pet.happy - Math.floor(elapsedMins));
      this.pet.lastTick = Date.now();
    }
  },
  update(dt) {
    if (PAD.hit('a')) {
      this.pet.hunger = Math.min(100, this.pet.hunger + 20);
      APU.sfx('COIN');
    }
    if (PAD.hit('b')) {
      this.pet.happy = Math.min(100, this.pet.happy + 15);
      APU.sfx('POWER');
    }
  },
  render(g) {
    g.clear(0);
    g.text("TAMAGOTCHI PET", 14, 14, 3);
    // Pet body
    g.disc(128, 110, 26, 3);
    g.disc(120, 104, 3, 0);
    g.disc(136, 104, 3, 0);
    g.line(124, 120, 132, 120, 0);

    g.text("HUNGER: " + this.pet.hunger + "%  [A] FEED", 30, 170, 3);
    g.text("HAPPY:  " + this.pet.happy + "%  [B] PLAY", 30, 184, 3);
  }
};
