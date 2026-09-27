// js/cartridges/cart_075_sniper.js
// ============================================================================
// Cartridge #075: SNIPER
// Genre: Stealth & Defense (7) | Precision Sniper Rifle & Target Dossier
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[75] = {
  id: 75,
  name: "SNIPER",
  genre: 7,
  scoreLabel: "SCORE",
  desc: "SNIPER SCOPE: D-PAD TO PAN, [UP/DOWN] ZOOM, HOLD [B] STEADY BREATH, [A] ELIMINATE TARGET!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Circular sniper crosshair with mil-dots over silhouette head
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 1);

    // Sniper Reticle Ring
    g.circle(x + 16, y + 16, 13, 2);
    g.line(x + 16, y + 3, x + 16, y + 29, 3);
    g.line(x + 3, y + 16, x + 29, y + 16, 3);

    // Mil-dots
    g.px(x + 16, y + 10, 3);
    g.px(x + 16, y + 22, 3);
    g.px(x + 10, y + 16, 3);
    g.px(x + 22, y + 16, 3);

    // Target Head Silhouette
    g.disc(x + 16, y + 16, 4, 3);
    g.line(x + 13, y + 14, x + 19, y + 14, 2); // hat brim
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.contract = 1;
    this.maxContracts = 3;
    this.score = 0;
    this.state = 'AIM'; // 'AIM', 'FIRED', 'CONTRACT_CLEAR', 'GAMEOVER'
    this.timer = 0;

    // Camera Pan & Scope Position (World coords: 0 to 450)
    this.camX = 180;
    this.camY = 120;
    this.zoomLevel = 1; // 1 = 1x, 2 = 2x, 3 = 4x

    // Breath Holding State
    this.holdingBreath = false;
    this.breathTimer = 2.8;
    this.maxBreath = 2.8;

    // Crosshair sway
    this.swayTime = 0;

    // Windage (mph & angle)
    this.windSpeed = Math.floor(Math.random() * 8 + 2); // 2 to 9 mph
    this.windDir = Math.random() < 0.5 ? -1 : 1;

    // Dossier Target Description
    this.dossier = {
      desc: "TARGET: SYNDICATE COURIER (FEDORA HAT, TRENCH COAT, BRIEFCASE)",
      targetId: 7
    };

    // Populate Crowd of 30 Civilians & 1 Target
    this.crowd = [];
    this.spawnCrowd();
  },

  spawnCrowd() {
    this.crowd = [];
    for (let i = 0; i < 32; i++) {
      const isTarget = (i === this.dossier.targetId);
      this.crowd.push({
        id: i,
        x: Math.random() * 400 + 20,
        y: 110 + Math.random() * 90,
        vx: (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 12),
        isTarget: isTarget,
        hasHat: isTarget ? true : Math.random() < 0.25,
        hasBriefcase: isTarget ? true : Math.random() < 0.2,
        alive: true,
        panicking: false
      });
    }
  },

  // --------------------------------------------------------------------------
  // 3. MAIN GAMEPLAY UPDATE
  // --------------------------------------------------------------------------
  update(dt) {
    if (dt > 0.05) dt = 0.05;

    // Handle Contract Clear / Game Over restart
    if (this.state === 'CONTRACT_CLEAR' || this.state === 'GAMEOVER') {
      if (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || TOUCH.down) {
        if (this.state === 'CONTRACT_CLEAR' && this.contract < this.maxContracts) {
          this.contract++;
          this.init();
        } else {
          this.init();
        }
      }
      return;
    }

    // Update Crowd Walking
    for (let c of this.crowd) {
      if (!c.alive) continue;
      c.x += c.vx * dt;
      if (c.x < 20 || c.x > 430) c.vx = -c.vx;
    }

    // 1. ZOOM TOGGLE [Up/Down]
    if (PAD.hit('up')) {
      this.zoomLevel = Math.min(3, this.zoomLevel + 1);
      APU.sfx('SELECT');
    } else if (PAD.hit('down')) {
      this.zoomLevel = Math.max(1, this.zoomLevel - 1);
      APU.sfx('SELECT');
    }

    // 2. SCOPE PANNING
    let panSpeed = 70 / this.zoomLevel;
    if (PAD.state.left) this.camX -= panSpeed * dt;
    if (PAD.state.right) this.camX += panSpeed * dt;

    // Direct touch drag
    if (TOUCH.drag) {
      this.camX -= (TOUCH.dx || 0) * 0.5;
    }

    this.camX = Math.max(80, Math.min(370, this.camX));

    // 3. HOLD BREATH [B]
    if (PAD.state.b && this.breathTimer > 0) {
      this.holdingBreath = true;
      this.breathTimer -= dt;
      if (Math.random() < 0.08) APU.sfx('TICK'); // heartbeat
    } else {
      this.holdingBreath = false;
      this.breathTimer = Math.min(this.maxBreath, this.breathTimer + 0.8 * dt);
    }

    // Crosshair respiratory sway
    if (!this.holdingBreath) {
      this.swayTime += dt * 2.4;
    }

    // 4. PULL TRIGGER [A]
    if (PAD.hit('a')) {
      this.pullTrigger();
    }
  },

  pullTrigger() {
    APU.sfx('EXPLODE'); // Gunshot crack!

    // Calculate crosshair center coordinate in world space
    const swayX = this.holdingBreath ? 0 : Math.sin(this.swayTime) * 6;
    const swayY = this.holdingBreath ? 0 : Math.cos(this.swayTime * 1.5) * 5;
    const windOffset = this.windDir * (this.windSpeed * 1.2);

    const hitWorldX = this.camX + swayX + windOffset;
    const hitWorldY = this.camY + swayY;

    // Check hit on crowd members
    let someoneHit = false;
    for (let c of this.crowd) {
      if (!c.alive) continue;
      const dist = Math.hypot(hitWorldX - c.x, hitWorldY - c.y);

      if (dist < 8) {
        someoneHit = true;
        c.alive = false;

        if (c.isTarget) {
          // TARGET ELIMINATED! CONTRACT COMPLETE!
          this.state = 'CONTRACT_CLEAR';
          this.score += 1500;
          SAVE.setScore(this.id, this.score);
          APU.sfx('FANFARE');
        } else {
          // CIVILIAN CASUALTY! MISSION COMPROMISED!
          this.state = 'GAMEOVER';
          APU.sfx('ERROR');
        }
        break;
      }
    }

    if (!someoneHit) {
      // Missed shot! Crowd panics
      for (let c of this.crowd) {
        c.panicking = true;
        c.vx *= 2.5;
      }
      APU.sfx('ALARM');
    }
  },

  // --------------------------------------------------------------------------
  // 4. 256x240 CRT RENDERING
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    const scale = this.zoomLevel === 1 ? 1.0 : this.zoomLevel === 2 ? 1.6 : 2.4;

    // 1. City Plaza Background (Pavement, Buildings, Streetlamps)
    g.rect(0, 30, 256, 184, 1);
    g.line(0, 30, 256, 30, 2);

    // City Plaza Fountain
    const fountainScreenX = Math.floor(128 + (220 - this.camX) * scale);
    const fountainScreenY = Math.floor(120 + (140 - this.camY) * scale);
    if (fountainScreenX > -50 && fountainScreenX < 300) {
      g.oval(fountainScreenX, fountainScreenY, Math.floor(28 * scale), Math.floor(14 * scale), 2);
      g.disc(fountainScreenX, fountainScreenY, Math.floor(8 * scale), 3);
    }

    // 2. Render Walking Crowd & Target
    for (let c of this.crowd) {
      const sx = Math.floor(128 + (c.x - this.camX) * scale);
      const sy = Math.floor(120 + (c.y - this.camY) * scale);

      if (sx > -20 && sx < 276 && sy > 20 && sy < 220) {
        if (c.alive) {
          // Standing Civilian
          const headR = Math.max(2, Math.floor(3 * scale));
          g.disc(sx, sy - Math.floor(7 * scale), headR, 3); // Head
          g.line(sx, sy - Math.floor(7 * scale), sx, sy + Math.floor(6 * scale), 3); // Body
          // Legs walking
          const legSwing = Math.sin(Date.now() * 0.008 + c.id) * 3 * scale;
          g.line(sx, sy + Math.floor(6 * scale), sx - legSwing, sy + Math.floor(14 * scale), 2);
          g.line(sx, sy + Math.floor(6 * scale), sx + legSwing, sy + Math.floor(14 * scale), 2);

          // Accessories (Hat / Briefcase)
          if (c.hasHat) {
            g.line(sx - 4 * scale, sy - 9 * scale, sx + 4 * scale, sy - 9 * scale, 3); // Fedora brim
          }
          if (c.hasBriefcase) {
            g.box(sx + 4 * scale, sy, Math.floor(4 * scale), Math.floor(4 * scale), 2);
          }
        } else {
          // Collapsed casualty
          g.oval(sx, sy + 6, Math.floor(6 * scale), Math.floor(3 * scale), 0);
        }
      }
    }

    // 3. Telescopic Scope Vignette (Black circular mask around screen)
    const scopeR = 98;
    g.circle(128, 120, scopeR, 2);
    g.circle(128, 120, scopeR + 1, 3);

    // Crosshair Lines with Mil-dots
    const swayX = this.holdingBreath ? 0 : Math.sin(this.swayTime) * 6;
    const swayY = this.holdingBreath ? 0 : Math.cos(this.swayTime * 1.5) * 5;
    const cx = Math.floor(128 + swayX);
    const cy = Math.floor(120 + swayY);

    g.line(cx - 70, cy, cx + 70, cy, 3);
    g.line(cx, cy - 70, cx, cy + 70, 3);

    // Mil-dot tick marks
    for (let d = -40; d <= 40; d += 15) {
      if (d === 0) continue;
      g.px(cx + d, cy - 2, 3);
      g.px(cx + d, cy + 2, 3);
      g.px(cx - 2, cy + d, 3);
      g.px(cx + 2, cy + d, 3);
    }

    // Center precision dot
    g.px(cx, cy, 3);

    // 4. Top HUD (Dossier Briefing, Zoom, Wind)
    g.rect(0, 0, 256, 26, 0);
    g.line(0, 26, 256, 26, 2);

    g.text("ZOOM " + (scale).toFixed(1) + "X", 10, 8, 3);

    // Wind Indicator
    const windStr = "WIND " + this.windSpeed + " MPH " + (this.windDir === 1 ? "►" : "◄");
    g.text(windStr, 75, 8, 2);

    // Breath Bar
    g.text("BREATH", 155, 8, 2);
    g.box(198, 8, 48, 7, 2);
    g.rect(199, 9, Math.floor((this.breathTimer / this.maxBreath) * 46), 5, this.holdingBreath ? 3 : 2);

    // 5. Bottom Dossier & Controls Prompt
    g.rect(0, 214, 256, 26, 0);
    g.line(0, 214, 256, 214, 2);

    g.text(this.dossier.desc, 10, 218, 2);
    g.text("[A] FIRE   HOLD [B] STEADY   UP/DN ZOOM", 10, 228, 3);

    // 6. Overlays
    if (this.state === 'CONTRACT_CLEAR') {
      g.dither(25, 65, 206, 75, 0, 1);
      g.box(25, 65, 206, 75, 3);
      g.textC("★ CONTRACT FULFILLED! ★", 80, 3);
      g.textC("TARGET NEUTRALIZED CLEANLY!", 96, 2);
      g.textC("+1500 SILENT ASSASSIN BONUS", 112, 3);
      g.textC("[A] NEXT ASSIGNMENT", 128, 3);
    } else if (this.state === 'GAMEOVER') {
      g.dither(35, 75, 186, 65, 0, 1);
      g.box(35, 75, 186, 65, 3);
      g.textC("CIVILIAN CASUALTY!", 92, 3);
      g.textC("MISSION COMPROMISED", 108, 2);
      g.textC("[A] RETRY CONTRACT", 124, 3);
    }
  }
};
