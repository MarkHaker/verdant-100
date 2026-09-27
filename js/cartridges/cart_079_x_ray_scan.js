// js/cartridges/cart_079_x_ray_scan.js
// ============================================================================
// Cartridge #079: X-RAY SCAN
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[79] = {
  id: 79,
  name: "X-RAY SCAN",
  genre: 7,
  scoreLabel: "SCORE",
  desc: "SCREEN AIRPORT LUGGAGE USING DUAL-ENERGY X-RAY! SEIZE WEAPONS & CONTRABAND, APPROVE CLEAN BAGS!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Luggage suitcase outline
    g.box(x + 5, y + 8, 22, 16, 2);
    g.box(x + 12, y + 5, 8, 3, 2); // handle
    // X-ray beam lines
    g.line(x + 8, y + 12, x + 16, y + 20, 3);
    g.line(x + 16, y + 20, x + 24, y + 12, 3);
    // Gun silhouette
    g.line(x + 12, y + 15, x + 20, y + 15, 3);
    g.line(x + 14, y + 15, x + 14, y + 19, 3);
  },

  init() {
    this.score = 0;
    this.bagsInspected = 0;
    this.totalBags = 10;
    this.strikes = 0;
    this.state = 'SCAN'; // 'SCAN', 'RESULT', 'SHIFT_COMPLETE', 'GAMEOVER'
    this.stateTimer = 0;

    this.filterMode = 0; // 0: DUAL-ENERGY (Full), 1: HIGH-DENSITY (Metal), 2: ORGANIC INVERT
    this.filterNames = ["DUAL-ENERGY", "HIGH-DENSITY", "ORGANIC INVERT"];

    this.curBag = null;
    this.beltOffset = 0;
    this.conveyorMoving = false;
    this.cursorX = 120;
    this.cursorY = 110;
    this.feedbackText = "";
    this.feedbackColor = 3;

    this.nextBag();
  },

  nextBag() {
    this.bagsInspected++;
    if (this.bagsInspected > this.totalBags) {
      this.state = 'SHIFT_COMPLETE';
      this.stateTimer = 0;
      APU.sfx('FANFARE');
      SAVE.setScore(this.id, this.score);
      return;
    }

    var bagTypes = [
      { name: "HARDSHELL TROLLEY", w: 130, h: 80, rounded: true },
      { name: "DUFFLE BAG", w: 140, h: 70, rounded: false },
      { name: "LEATHER BRIEFCASE", w: 120, h: 75, rounded: false },
      { name: "BACKPACK", w: 110, h: 85, rounded: true }
    ];
    var type = bagTypes[Math.floor(Math.random() * bagTypes.length)];

    var hasContraband = Math.random() < 0.6; // 60% chance of threat
    var items = [];

    // Innocent items pool
    var innocentTypes = ['LAPTOP', 'SHOES', 'UMBRELLA', 'WATER_BOTTLE', 'BOOKS', 'CAMERA', 'HAIRDRYER'];
    // Contraband types pool
    var contrabandTypes = ['PISTOL', 'COMBAT_KNIFE', 'DYNAMITE', 'CONTRABAND_GEM'];

    var itemCount = 3 + Math.floor(Math.random() * 3);
    for (var i = 0; i < itemCount; i++) {
      var inType = innocentTypes[Math.floor(Math.random() * innocentTypes.length)];
      var ix = 70 + Math.random() * (type.w - 40);
      var iy = 75 + Math.random() * (type.h - 35);
      items.push({
        type: inType,
        x: ix,
        y: iy,
        w: 24 + Math.random() * 10,
        h: 18 + Math.random() * 8,
        isContraband: false,
        density: 1 + Math.floor(Math.random() * 2) // 1=organic, 2=mixed
      });
    }

    if (hasContraband) {
      var cType = contrabandTypes[Math.floor(Math.random() * contrabandTypes.length)];
      var cx = 75 + Math.random() * (type.w - 40);
      var cy = 80 + Math.random() * (type.h - 35);
      items.push({
        type: cType,
        x: cx,
        y: cy,
        w: 26,
        h: 20,
        isContraband: true,
        density: 3 // High-density metal/explosive
      });
    }

    this.curBag = {
      type: type,
      items: items,
      hasContraband: hasContraband,
      passenger: "PASSENGER #" + (100 + this.bagsInspected)
    };

    this.state = 'SCAN';
    this.conveyorMoving = false;
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;

    if (this.state === 'SHIFT_COMPLETE' || this.state === 'GAMEOVER') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    if (this.state === 'RESULT') {
      if (this.stateTimer > 1.2) {
        this.nextBag();
      }
      return;
    }

    // Cursor Navigation
    var moveSpeed = 90 * dt;
    if (PAD.state.left) this.cursorX = Math.max(50, this.cursorX - moveSpeed);
    if (PAD.state.right) this.cursorX = Math.min(190, this.cursorX + moveSpeed);
    if (PAD.state.up) this.cursorY = Math.max(65, this.cursorY - moveSpeed);
    if (PAD.state.down) this.cursorY = Math.min(155, this.cursorY + moveSpeed);

    // Filter mode switch
    if (PAD.hit('up') && !PAD.state.up) {
      this.filterMode = (this.filterMode + 1) % 3;
      APU.sfx('SELECT');
    }

    // Action [A]: SEIZE CONTRABAND
    if (PAD.hit('a')) {
      this.handleSeize();
    }

    // Action [B]: PASS / APPROVE BAG
    if (PAD.hit('b')) {
      this.handleApprove();
    }

    // Touch controls
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      // Filter button top right: x: 140-230, y: 22-42
      if (tx >= 140 && tx <= 236 && ty >= 22 && ty <= 42) {
        this.filterMode = (this.filterMode + 1) % 3;
        APU.sfx('SELECT');
      }
      // Seize button bottom left: x: 12-110, y: 195-230
      else if (tx >= 10 && tx <= 115 && ty >= 195 && ty <= 235) {
        this.handleSeize();
      }
      // Approve button bottom right: x: 125-228, y: 195-230
      else if (tx >= 125 && tx <= 230 && ty >= 195 && ty <= 235) {
        this.handleApprove();
      }
      // Tap directly inside luggage chamber
      else if (tx >= 50 && tx <= 190 && ty >= 60 && ty <= 160) {
        this.cursorX = tx;
        this.cursorY = ty;
        this.handleSeize();
      }
    }
  },

  handleSeize() {
    // Check if cursor or bag has contraband
    if (this.curBag.hasContraband) {
      this.score += 150;
      this.feedbackText = "+150 WEAPON INTERCEPTED!";
      this.feedbackColor = 3;
      APU.sfx('COIN');
    } else {
      this.score = Math.max(0, this.score - 50);
      this.strikes++;
      this.feedbackText = "-50 FALSE ALARM: CLEAN BAG";
      this.feedbackColor = 2;
      APU.sfx('ERROR');
    }
    this.checkStrikesOrNext();
  },

  handleApprove() {
    if (!this.curBag.hasContraband) {
      this.score += 100;
      this.feedbackText = "+100 LUGGAGE CLEARED";
      this.feedbackColor = 3;
      APU.sfx('CONFIRM');
    } else {
      this.score = Math.max(0, this.score - 100);
      this.strikes++;
      this.feedbackText = "-100 SECURITY BREACH!";
      this.feedbackColor = 3;
      APU.sfx('HIT');
    }
    this.checkStrikesOrNext();
  },

  checkStrikesOrNext() {
    this.state = 'RESULT';
    this.stateTimer = 0;
    SAVE.setScore(this.id, this.score);
    if (this.strikes >= 3) {
      this.state = 'GAMEOVER';
      APU.sfx('ERROR');
    }
  },

  render(g) {
    g.clear(0);

    // Top Header & Status
    g.rect(0, 0, 240, 22, 1);
    g.text("TSA SCANNER", 6, 6, 3);
    g.text("BAG " + Math.min(this.bagsInspected, this.totalBags) + "/" + this.totalBags, 92, 6, 2);
    g.text("SCORE:" + this.score, 142, 6, 3);
    // Strikes warning
    g.textR("STRIKES:" + this.strikes + "/3", 234, 6, this.strikes > 0 ? 3 : 2);

    // Sub-header: Passenger & Filter button
    g.text(this.curBag ? this.curBag.passenger : "", 12, 28, 2);
    g.box(130, 24, 102, 16, 2);
    g.text("MODE:" + this.filterNames[this.filterMode].substring(0, 9), 134, 28, 3);

    // X-Ray Tunnel Screen Chamber (x: 35, y: 44, w: 170, h: 120)
    g.rect(35, 44, 170, 120, 0);
    g.box(35, 44, 170, 120, 2);

    // Lead conveyor rollers at left and right
    for (var r = 0; r < 240; r += 16) {
      g.line(r, 168, r + 8, 178, 1);
    }
    g.line(0, 168, 240, 168, 2);
    g.line(0, 178, 240, 178, 2);

    // X-ray scan beam effect
    var scanY = 46 + (Math.floor(this.stateTimer * 40) % 116);
    g.line(36, scanY, 204, scanY, 1);

    // Render Baggage in X-Ray
    if (this.curBag) {
      this.renderLuggage(g, this.curBag);
    }

    // Reticle / Cursor
    g.line(this.cursorX - 6, this.cursorY, this.cursorX + 6, this.cursorY, 3);
    g.line(this.cursorX, this.cursorY - 6, this.cursorX, this.cursorY + 6, 3);
    g.circle(this.cursorX, this.cursorY, 4, 3);

    // Result Feedback Text Banner
    if (this.state === 'RESULT') {
      g.rect(30, 90, 180, 26, 0);
      g.box(30, 90, 180, 26, 3);
      g.textC(this.feedbackText, 98, this.feedbackColor);
    }

    // Bottom Action Buttons
    // Left: [A] SEIZE CONTRABAND
    g.rect(10, 190, 105, 34, 1);
    g.box(10, 190, 105, 34, 3);
    g.textC("[A] SEIZE", 198, 3);
    g.textC("CONTRABAND", 210, 2);

    // Right: [B] APPROVE
    g.rect(125, 190, 105, 34, 1);
    g.box(125, 190, 105, 34, 3);
    g.textC("[B] APPROVE", 198, 3);
    g.textC("PASS LUGGAGE", 210, 2);

    // Overlays
    if (this.state === 'SHIFT_COMPLETE') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("SHIFT CONCLUDED!", 70, 3);
      g.textC("SECURITY SCORE: " + this.score, 95, 2);
      g.textC("PENALTY STRIKES: " + this.strikes + "/3", 115, 2);
      g.textC("RATING: " + (this.strikes === 0 ? "EXEMPLARY OFFICER" : "APPROVED"), 135, 3);
      g.textC("PRESS [A] TO RESTART", 158, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    } else if (this.state === 'GAMEOVER') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("SECURITY SUSPENDED!", 70, 3);
      g.textC("3 FATAL BREACHES/ERRORS", 95, 2);
      g.textC("AIRPORT ON LOCKDOWN", 115, 2);
      g.textC("PRESS [A] TO RETRY", 150, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  },

  renderLuggage(g, bag) {
    var bx = 120 - bag.type.w / 2;
    var by = 104 - bag.type.h / 2;

    // Outer Suitcase Hull
    g.box(bx, by, bag.type.w, bag.type.h, 1);
    // Luggage handles and corner guards
    g.box(bx + bag.type.w / 2 - 12, by - 6, 24, 6, 2);
    g.disc(bx + 6, by + bag.type.h, 3, 2);
    g.disc(bx + bag.type.w - 6, by + bag.type.h, 3, 2);

    // Render Internal Items based on Filter Mode
    for (var i = 0; i < bag.items.length; i++) {
      var it = bag.items[i];
      var vis = true;
      var col = 2;

      if (this.filterMode === 1) {
        // High-density filter: only high density (metal/explosive) items stand out brightly!
        if (it.density < 3) {
          vis = false;
        } else {
          col = 3;
        }
      } else if (this.filterMode === 2) {
        // Organic invert: organic stands out, metals blacked
        if (it.density === 3) {
          col = 1;
        } else {
          col = 3;
        }
      } else {
        // Dual Energy: metals are brightest 3, organics are 2
        col = (it.density === 3) ? 3 : 2;
      }

      if (!vis) continue;

      this.drawItem(g, it.type, it.x, it.y, col);
    }
  },

  drawItem(g, type, x, y, col) {
    if (type === 'PISTOL') {
      // Gun barrel & grip
      g.rect(x, y, 16, 5, col);
      g.rect(x + 2, y + 5, 6, 10, col);
      g.box(x + 6, y + 4, 4, 4, col); // trigger guard
    } else if (type === 'COMBAT_KNIFE') {
      // Blade and hilt
      g.line(x, y + 14, x + 18, y, col);
      g.line(x + 1, y + 15, x + 19, y + 1, col);
      g.line(x + 14, y + 8, x + 8, y + 2, col); // crossguard
      g.rect(x - 4, y + 14, 6, 4, col); // handle
    } else if (type === 'DYNAMITE') {
      // 3 explosive sticks wrapped with clock timer
      g.rect(x, y, 20, 5, col);
      g.rect(x, y + 6, 20, 5, col);
      g.rect(x, y + 12, 20, 5, col);
      g.line(x + 6, y - 2, x + 14, y - 2, col); // band
      g.disc(x + 10, y + 8, 4, col); // timer face
    } else if (type === 'CONTRABAND_GEM') {
      // Diamond facet
      g.tri(x + 8, y, x, y + 6, x + 16, y + 6, col);
      g.tri(x, y + 6, x + 16, y + 6, x + 8, y + 15, col);
    } else if (type === 'LAPTOP') {
      g.box(x, y, 22, 16, col);
      g.line(x + 2, y + 12, x + 20, y + 12, col);
    } else if (type === 'SHOES') {
      g.oval(x + 6, y + 6, 6, 3, col);
      g.oval(x + 16, y + 6, 6, 3, col);
    } else if (type === 'WATER_BOTTLE') {
      g.box(x + 2, y + 2, 8, 16, col);
      g.box(x + 4, y - 2, 4, 4, col); // cap
    } else if (type === 'CAMERA') {
      g.box(x, y, 18, 12, col);
      g.circle(x + 9, y + 6, 4, col);
    } else if (type === 'BOOKS') {
      g.box(x, y, 16, 20, col);
      g.line(x + 3, y + 3, x + 13, y + 3, col);
      g.line(x + 3, y + 8, x + 13, y + 8, col);
    } else {
      // Umbrella / miscellaneous
      g.line(x, y, x + 18, y + 14, col);
      g.circle(x + 18, y + 14, 3, col);
    }
  }
};
