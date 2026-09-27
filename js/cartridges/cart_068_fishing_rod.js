// js/cartridges/cart_068_fishing_rod.js
// ============================================================================
// Cartridge #068: FISHING ROD
// Genre: Racing & Vehicles / Sports (6) | Riverbank Angling & Reel Tension Simulation
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[68] = {
  id: 68,
  name: "FISHING ROD",
  genre: 6,
  scoreLabel: "KG",
  desc: "ANGLING SIM: CAST INTO REEDS, STRIKE ON '!' BITE, BALANCE REEL TENSION TO LAND FISH!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Fishing rod bending over river, leaping trout, water splash
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // River water waves
    g.line(x + 2, y + 24, x + 29, y + 24, 1);
    g.line(x + 5, y + 27, x + 27, y + 27, 2);

    // Fishing Rod bending in arc
    g.line(x + 5, y + 26, x + 12, y + 16, 2);
    g.line(x + 12, y + 16, x + 20, y + 8, 3);
    g.line(x + 20, y + 8, x + 24, y + 9, 3); // tip

    // Fishing Line
    g.line(x + 24, y + 9, x + 20, y + 21, 1);

    // Leaping Fish Silhouette
    g.oval(x + 18, y + 18, 5, 3, 3);
    g.tri(x + 23, y + 18, x + 27, y + 15, x + 27, y + 21, 3); // tail
    g.px(x + 15, y + 17, 0); // eye

    // Splash drops
    g.px(x + 14, y + 23, 2);
    g.px(x + 22, y + 22, 2);
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.totalWeightKg = 0.0;
    this.fishCaughtCount = 0;
    this.state = 'CAST'; // 'CAST', 'WAIT', 'BITE', 'FIGHT', 'LANDED', 'LOGBOOK'
    this.timer = 0;

    // Cast Meter
    this.castPower = 0;
    this.castDir = 1;

    // Bobber & Line in water
    this.bobber = {
      x: 128,
      y: 160,
      dipY: 0,
      nibbleTimer: 0
    };

    // Fighting Fish State
    this.hookedFish = null;
    this.lineTension = 50; // 0 to 100%
    this.fishDist = 30; // meters from shore
    this.fishTiredness = 0; // 0 to 100%

    // Species Catalog
    this.species = [
      { name: "BLUEGILL", minKg: 0.3, maxKg: 0.8, strength: 25 },
      { name: "SMALLMOUTH BASS", minKg: 1.2, maxKg: 3.5, strength: 45 },
      { name: "NORTHERN PIKE", minKg: 4.0, maxKg: 9.5, strength: 70 },
      { name: "GIANT STURGEON", minKg: 14.0, maxKg: 32.0, strength: 100 }
    ];

    // Background swimming fish silhouettes
    this.shadows = [];
    for (let i = 0; i < 4; i++) {
      this.shadows.push({
        x: Math.random() * 200 + 28,
        y: Math.random() * 60 + 130,
        vx: (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 15),
        len: 8 + Math.random() * 8
      });
    }
  },

  // --------------------------------------------------------------------------
  // 3. MAIN GAMEPLAY UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    if (dt > 0.05) dt = 0.05;

    // Update swimming ambient shadows
    for (let sh of this.shadows) {
      sh.x += sh.vx * dt;
      if (sh.x < 30 || sh.x > 226) sh.vx = -sh.vx;
    }

    // 1. CAST PHASE (Charge distance meter)
    if (this.state === 'CAST') {
      this.castPower += this.castDir * 2.2 * dt;
      if (this.castPower >= 1.0) {
        this.castPower = 1.0;
        this.castDir = -1;
      } else if (this.castPower <= 0.0) {
        this.castPower = 0.0;
        this.castDir = 1;
      }

      // Release [A] or tap to fling line
      if (PAD.hit('a') || TOUCH.down) {
        this.state = 'WAIT';
        this.bobber.x = 80 + Math.floor(this.castPower * 110);
        this.bobber.y = 135 + Math.floor((1.0 - this.castPower) * 45);
        this.timer = 1.8 + Math.random() * 3.5;
        APU.sfx('CONFIRM');
      }
      return;
    }

    // 2. WAIT FOR NIBBLE PHASE
    if (this.state === 'WAIT') {
      this.timer -= dt;

      // Bobber water bobbing animation
      this.bobber.dipY = Math.sin(Date.now() * 0.006) * 2;

      // Fish bite triggers!
      if (this.timer <= 0) {
        this.state = 'BITE';
        this.timer = 0.65; // 0.65s strike window!
        this.bobber.dipY = 8; // Plunges underwater
        APU.sfx('ALARM');
      }
      return;
    }

    // 3. BITE REACTION PHASE (STRIKE!)
    if (this.state === 'BITE') {
      this.timer -= dt;

      // Strike on [A] or [Up]
      if (PAD.hit('a') || PAD.hit('up') || TOUCH.down) {
        // Successful Hookset!
        this.state = 'FIGHT';
        // Pick random species based on cast distance
        const spIdx = this.castPower > 0.75 ? 3 : this.castPower > 0.5 ? 2 : this.castPower > 0.25 ? 1 : 0;
        const sp = this.species[spIdx];
        const weight = (sp.minKg + Math.random() * (sp.maxKg - sp.minKg)).toFixed(1);
        this.hookedFish = {
          name: sp.name,
          weight: parseFloat(weight),
          strength: sp.strength
        };
        this.fishDist = 20 + Math.floor(this.castPower * 25);
        this.lineTension = 50;
        this.fishTiredness = 0;
        APU.sfx('HIT');
        return;
      }

      // Missed bite window
      if (this.timer <= 0) {
        this.state = 'CAST';
        APU.sfx('ERROR');
      }
      return;
    }

    // 4. REEL TENSION FIGHT PHASE
    if (this.state === 'FIGHT') {
      const f = this.hookedFish;

      // Is player actively reeling?
      const isReeling = PAD.state.a || (TOUCH.held && TOUCH.y > 180);

      if (isReeling) {
        // Reeling pulls fish in and raises tension
        this.lineTension += (40 + f.strength * 0.5) * dt;
        this.fishDist = Math.max(0, this.fishDist - 8.5 * dt);
        this.fishTiredness = Math.min(100, this.fishTiredness + 18 * dt);
        if (Math.random() < 0.2) APU.sfx('TICK');
      } else {
        // Letting line run releases tension, but fish swims away!
        this.lineTension = Math.max(0, this.lineTension - 55 * dt);
        const pullAwaySpeed = (f.strength * 0.12) * (1.0 - this.fishTiredness / 100);
        this.fishDist += pullAwaySpeed * dt;
      }

      // Check Line Snap (> 100% tension)
      if (this.lineTension >= 100) {
        this.state = 'CAST';
        APU.sfx('EXPLODE');
        return;
      }

      // Check Slack Hook Spit (< 5% tension while fish is strong)
      if (this.lineTension <= 5 && this.fishTiredness < 80) {
        this.state = 'CAST';
        APU.sfx('ERROR');
        return;
      }

      // Fish Landed at Shore! (Distance <= 0)
      if (this.fishDist <= 0) {
        this.state = 'LANDED';
        this.timer = 2.4;
        this.totalWeightKg += f.weight;
        this.fishCaughtCount++;
        SAVE.setScore(this.id, Math.floor(this.totalWeightKg * 10));
        APU.sfx('FANFARE');
      }
      return;
    }

    // 5. LANDED CELEBRATION
    if (this.state === 'LANDED') {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.state = 'CAST';
      }
    }
  },

  // --------------------------------------------------------------------------
  // 4. 256x240 CRT RENDERING
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    // 1. Shoreline & Riverbed
    g.rect(0, 110, 256, 104, 1);
    g.line(0, 110, 256, 110, 2);

    // Water ripple lines
    for (let r = 0; r < 5; r++) {
      const ry = 125 + r * 16;
      g.line(20, ry, 65, ry, 0);
      g.line(110, ry + 6, 170, ry + 6, 0);
      g.line(190, ry - 4, 235, ry - 4, 0);
    }

    // Reeds & Lily pads
    g.disc(40, 150, 7, 2);
    g.disc(215, 175, 8, 2);
    g.line(15, 120, 18, 90, 2);
    g.line(19, 120, 24, 85, 3);
    g.line(23, 120, 27, 92, 2);

    // 2. Swimming Ambient Fish Shadows
    for (let sh of this.shadows) {
      g.oval(Math.floor(sh.x), Math.floor(sh.y), Math.floor(sh.len), 3, 0);
    }

    // 3. Fisherman on Grassy Bank (Bottom Left)
    g.rect(0, 180, 70, 34, 2);
    g.box(0, 180, 70, 34, 3);

    // Angler silhouette sitting on tackle box
    g.disc(32, 168, 5, 3); // Hat & head
    g.rect(27, 173, 10, 14, 3); // Torso

    // Fishing Rod bending towards water
    const rodTipX = 64;
    const rodTipY = 138;
    g.line(34, 172, rodTipX, rodTipY, 3);

    // 4. Fishing Line to Bobber
    if (this.state === 'WAIT' || this.state === 'BITE' || this.state === 'FIGHT') {
      const bx = this.bobber.x;
      const by = Math.floor(this.bobber.y + this.bobber.dipY);
      g.line(rodTipX, rodTipY, bx, by, 2);

      // Bobber Float
      g.disc(bx, by, 4, 3);
      g.line(bx, by - 4, bx, by + 4, 0);
    }

    // 5. Bite Alert Banner
    if (this.state === 'BITE') {
      g.textC("! BITE !  STRIKE [A] !", 85, 3);
      g.circle(this.bobber.x, Math.floor(this.bobber.y + this.bobber.dipY), 12, 3);
    }

    // 6. Top HUD (Total Catch Weight & Count)
    g.rect(0, 0, 256, 26, 0);
    g.line(0, 26, 256, 26, 2);

    g.text("TOTAL CATCH: " + this.totalWeightKg.toFixed(1) + " KG", 10, 8, 3);
    g.textR("FISH: " + this.fishCaughtCount, 246, 8, 2);

    // 7. Bottom Control Panel & Meters
    g.rect(0, 214, 256, 26, 0);
    g.line(0, 214, 256, 214, 2);

    if (this.state === 'CAST') {
      // Cast Power Meter
      g.box(60, 220, 120, 10, 2);
      g.rect(61, 221, Math.floor(this.castPower * 118), 8, 3);
      g.text("CAST", 20, 222, 3);
      g.textR("[A] RELEASE", 248, 222, 2);
    } else if (this.state === 'FIGHT') {
      // Tension Bar & Distance
      g.box(60, 220, 110, 10, 2);
      const fillW = Math.floor((this.lineTension / 100) * 108);
      // High tension flashes critical bright
      const barColor = this.lineTension > 80 ? (Date.now() % 200 < 100 ? 3 : 1) : 3;
      g.rect(61, 221, fillW, 8, barColor);

      // Safe tension sweet zone marks (40% to 80%)
      g.line(104, 218, 104, 232, 2);
      g.line(148, 218, 148, 232, 2);

      g.text("TENS", 20, 222, 3);
      g.textR(Math.ceil(this.fishDist) + "M", 248, 222, 3);
    } else {
      g.textC("WAITING FOR BITE... WATCH THE BOBBER", 222, 2);
    }

    // 8. Fish Landed Celebration Card
    if (this.state === 'LANDED' && this.hookedFish) {
      g.dither(30, 65, 196, 75, 0, 1);
      g.box(30, 65, 196, 75, 3);
      g.textC("★ TROPHY LANDED! ★", 78, 3);
      g.textC(this.hookedFish.name, 94, 3);
      g.textC("WEIGHT: " + this.hookedFish.weight.toFixed(1) + " KG", 110, 2);
      g.textC("+ " + Math.floor(this.hookedFish.weight * 100) + " POINTS", 126, 3);
    }
  }
};
