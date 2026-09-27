// js/cartridges/cart_098_shopkeeper.js
// ============================================================================
// Cartridge #098: SHOPKEEPER
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[98] = {
  id: 98,
  name: "SHOPKEEPER",
  genre: 9,
  scoreLabel: "GOLD",
  desc: "MEDIEVAL MERCHANT: APPRAISE RARE RELICS, HAGGLE CUSTOMERS, AND PROFIT WITHOUT OFFENDING BUYERS!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Gold coin and scale
    g.disc(x + 16, y + 12, 6, 3);
    g.text("$", x + 14, y + 9, 0);
    g.line(x + 8, y + 24, x + 24, y + 24, 2);
    g.line(x + 16, y + 20, x + 16, y + 26, 2);
  },

  init() {
    this.gold = 50;
    this.reputation = 100;
    this.customerIdx = 0;
    this.totalCustomers = 8;
    this.dealsMade = 0;

    this.curCustomer = null;
    this.curItem = null;
    this.playerOffer = 50;
    this.customerOffer = 40;
    this.customerPatience = 3; // 3 chances before storming out

    this.dialogue = "";
    this.state = 'CUSTOMER_ENTER'; // 'CUSTOMER_ENTER', 'HAGGLE', 'DEAL_MADE', 'WALK_OUT', 'DAY_END'
    this.stateTimer = 0;

    this.itemsCatalog = [
      { name: "RUNIC BROADSWORD", baseCost: 30, marketVal: 65, icon: 'SWORD' },
      { name: "ELIXIR OF YOUTH", baseCost: 15, marketVal: 40, icon: 'POTION' },
      { name: "OBSIDIAN AMULET", baseCost: 45, marketVal: 95, icon: 'AMULET' },
      { name: "GOLDEN CHALICE", baseCost: 60, marketVal: 120, icon: 'CHALICE' },
      { name: "ANCIENT SPELLBOOK", baseCost: 50, marketVal: 110, icon: 'BOOK' },
      { name: "EMERALD CROWN", baseCost: 80, marketVal: 180, icon: 'CROWN' }
    ];

    this.customerTypes = [
      { role: "PALADIN", maxBudgetRatio: 1.25, patience: 4, greed: 0.15 },
      { role: "WIZARD", maxBudgetRatio: 1.40, patience: 3, greed: 0.20 },
      { role: "ROGUE", maxBudgetRatio: 0.95, patience: 2, greed: 0.35 },
      { role: "NOBLE", maxBudgetRatio: 1.60, patience: 3, greed: 0.10 }
    ];

    this.nextCustomer();
  },

  nextCustomer() {
    this.customerIdx++;
    if (this.customerIdx > this.totalCustomers) {
      this.state = 'DAY_END';
      this.stateTimer = 0;
      APU.sfx('FANFARE');
      SAVE.setScore(this.id, this.gold);
      return;
    }

    var item = this.itemsCatalog[Math.floor(Math.random() * this.itemsCatalog.length)];
    var cType = this.customerTypes[Math.floor(Math.random() * this.customerTypes.length)];

    this.curItem = item;
    this.curCustomer = cType;
    this.customerPatience = cType.patience;

    // Customer opening offer is ~60-80% of market value
    this.customerOffer = Math.floor(item.marketVal * (0.65 + Math.random() * 0.15));
    this.playerOffer = item.marketVal; // Initial counter is market val

    this.dialogue = "I WISH TO BUY YOUR " + item.name + "!";
    this.state = 'HAGGLE';
    this.stateTimer = 0;
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;

    if (this.state === 'DEAL_MADE' || this.state === 'WALK_OUT') {
      if (this.stateTimer > 1.6 || PAD.hit('a') || TOUCH.down) {
        this.nextCustomer();
      }
      return;
    }

    if (this.state === 'DAY_END') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    // Haggle Controls:
    // [Up] / [Down] adjusts player asking price
    var step = PAD.btn('b') ? 1 : 5;
    if (PAD.hit('up')) {
      this.playerOffer = Math.min(300, this.playerOffer + step);
      APU.sfx('TICK');
    }
    if (PAD.hit('down')) {
      this.playerOffer = Math.max(10, this.playerOffer - step);
      APU.sfx('TICK');
    }

    // [A] SUBMIT COUNTER-OFFER
    if (PAD.hit('a')) {
      this.submitCounterOffer();
    }

    // [B] ACCEPT CUSTOMER'S CURRENT OFFER
    if (PAD.hit('b')) {
      this.acceptCustomerOffer();
    }

    // Direct Touch Controls
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      // Price up/down buttons on counter
      if (tx >= 180 && tx <= 210 && ty >= 120 && ty <= 145) {
        this.playerOffer = Math.min(300, this.playerOffer + 5);
        APU.sfx('TICK');
      } else if (tx >= 180 && tx <= 210 && ty >= 150 && ty <= 175) {
        this.playerOffer = Math.max(10, this.playerOffer - 5);
        APU.sfx('TICK');
      }
      // Counter button [A]: x: 10-115, y: 195-230
      else if (tx >= 10 && tx <= 115 && ty >= 195 && ty <= 235) {
        this.submitCounterOffer();
      }
      // Accept button [B]: x: 125-230, y: 195-230
      else if (tx >= 125 && tx <= 230 && ty >= 195 && ty <= 235) {
        this.acceptCustomerOffer();
      }
    }
  },

  submitCounterOffer() {
    var maxWillingToPay = Math.floor(this.curItem.marketVal * this.curCustomer.maxBudgetRatio);

    if (this.playerOffer <= maxWillingToPay) {
      // DEAL ACCEPTED!
      var profit = this.playerOffer - this.curItem.baseCost;
      this.gold += this.playerOffer;
      this.dealsMade++;
      this.dialogue = "DEAL! FAIR PRICE FOR FINE CRAFT!";
      this.state = 'DEAL_MADE';
      this.stateTimer = 0;
      APU.sfx('COIN');
      SAVE.setScore(this.id, this.gold);
    } else {
      // Counter too high! Customer resistance
      this.customerPatience--;
      if (this.customerPatience <= 0) {
        // Customer walks out in disgust!
        this.dialogue = "PREPOSTEROUS THIEVERY! I'M LEAVING!";
        this.reputation = Math.max(0, this.reputation - 15);
        this.state = 'WALK_OUT';
        this.stateTimer = 0;
        APU.sfx('HIT');
      } else {
        // Customer budges slightly but warns merchant
        var bump = Math.floor((maxWillingToPay - this.customerOffer) * 0.4);
        this.customerOffer += Math.max(2, bump);
        this.dialogue = "TOO STEEP! BEST I CAN DO IS " + this.customerOffer + " GOLD!";
        APU.sfx('SELECT');
      }
    }
  },

  acceptCustomerOffer() {
    this.gold += this.customerOffer;
    this.dealsMade++;
    this.dialogue = "PLEASURE DOING BUSINESS WITH YOU!";
    this.state = 'DEAL_MADE';
    this.stateTimer = 0;
    APU.sfx('COIN');
    SAVE.setScore(this.id, this.gold);
  },

  render(g) {
    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("SHOPKEEPER", 6, 6, 3);
    g.text("CUSTOMER " + Math.min(this.customerIdx, this.totalCustomers) + "/" + this.totalCustomers, 86, 6, 2);
    g.textR("GOLD:" + this.gold, 234, 6, 3);

    // Shop Counter Scene
    // Wooden counter bar
    g.rect(0, 110, 240, 16, 1);
    g.line(0, 110, 240, 110, 2);
    g.line(0, 126, 240, 126, 2);

    // Customer Sprite on Left
    var cx = 45, cy = 68;
    g.circle(cx, cy, 14, 2); // Head
    g.box(cx - 18, cy + 14, 36, 28, 1); // Body cloak
    g.text(this.curCustomer ? this.curCustomer.role : "", cx - 18, cy + 30, 3);

    // Patience Hearts/Dots above customer
    g.text("PATIENCE:", cx - 22, cy - 24, 1);
    for (var p = 0; p < 4; p++) {
      g.disc(cx + 26 + p * 8, cy - 22, 2, p < this.customerPatience ? 3 : 0);
    }

    // Dialogue Bubble on Right
    g.rect(95, 28, 135, 46, 0);
    g.box(95, 28, 135, 46, 2);
    g.text(this.dialogue.substring(0, 20), 100, 34, 3);
    g.text(this.dialogue.substring(20, 42), 100, 46, 2);
    g.text(this.dialogue.substring(42, 64), 100, 58, 2);

    // Relic on Counter
    if (this.curItem) {
      g.box(100, 84, 40, 24, 2);
      g.textC(this.curItem.name, 114, 3);
      g.text("BASE: " + this.curItem.baseCost + "G", 12, 130, 1);
      g.text("MARKET: ~" + this.curItem.marketVal + "G", 12, 144, 2);
    }

    // Pricing Board on Right
    g.rect(115, 128, 115, 54, 0);
    g.box(115, 128, 115, 54, 2);
    g.text("THEIR OFFER: " + this.customerOffer + " G", 120, 134, 2);
    g.text("YOUR ASKING: " + this.playerOffer + " G", 120, 150, 3);

    // Price adjust arrows
    g.box(205, 148, 16, 12, 2);
    g.text("▲", 209, 150, 3);
    g.box(205, 164, 16, 12, 2);
    g.text("▼", 209, 166, 3);

    // Bottom Action Buttons
    g.rect(10, 192, 105, 30, 1);
    g.box(10, 192, 105, 30, 3);
    g.textC("[A] COUNTER", 198, 3);
    g.textC("ASK FOR " + this.playerOffer + "G", 210, 2);

    g.rect(125, 192, 105, 30, 1);
    g.box(125, 192, 105, 30, 2);
    g.textC("[B] ACCEPT", 198, 3);
    g.textC("TAKE " + this.customerOffer + "G", 210, 2);

    // Day End Overlay
    if (this.state === 'DAY_END') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("SHOP SHUTTERS CLOSED!", 70, 3);
      g.textC("FINAL GOLD VAULT: " + this.gold + " G", 95, 3);
      g.textC("DEALS CONCLUDED: " + this.dealsMade + " / " + this.totalCustomers, 115, 2);
      g.textC(this.gold >= 250 ? "MASTER MERCHANT OF THE REALM!" : "MODEST VILLAGE PEDDLER", 132, 2);
      g.textC("PRESS [A] FOR NEXT DAY", 155, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  }
};
