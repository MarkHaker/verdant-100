// js/cartridges/cart_060_minecart.js
// ============================================================================
// Cartridge #060: MINECART
// Genre: RPG & ADVENTURE (5) | Kinetic Minecart Carnage & Track Switching Run
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[60] = {
  id: 60,
  name: "MINECART",
  genre: 5,
  scoreLabel: "GEMS",
  desc: "SWITCH FORKS, LEAP GAPS & DUCK BEAMS IN RAPID SUBTERRANEAN MINECART RUN!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON: MINECART WITH CRYSTALS ON RAIL
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);

    // Rail tracks
    g.line(x + 2, y + 25, x + 30, y + 25, 2);
    for (let i = 0; i < 6; i++) {
      g.line(x + 4 + i * 5, y + 25, x + 2 + i * 5, y + 28, 1);
    }

    // Heavy iron minecart body
    g.rect(x + 6, y + 14, 20, 8, 2);
    g.line(x + 4, y + 14, x + 6, y + 22, 3);
    g.line(x + 28, y + 14, x + 26, y + 22, 3);
    g.box(x + 5, y + 14, 22, 8, 3);

    // Glowing raw gems inside cart
    g.tri(x + 10, y + 13, x + 8, y + 9, x + 12, y + 9, 3);
    g.tri(x + 16, y + 13, x + 14, y + 7, x + 18, y + 7, 3);
    g.tri(x + 22, y + 13, x + 20, y + 10, x + 24, y + 10, 3);

    // Iron flanged wheels
    g.disc(x + 10, y + 23, 3, 3);
    g.disc(x + 10, y + 23, 1, 0);
    g.disc(x + 22, y + 23, 3, 3);
    g.disc(x + 22, y + 23, 1, 0);
  },

  // --------------------------------------------------------------------------
  // 2. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    this.cartX = 48;
    this.lane = 1; // 0 = upper rail (y: 85), 1 = middle rail (y: 135), 2 = lower rail (y: 185)
    this.targetY = 135;
    this.cartY = 135;
    this.vy = 0;
    this.isJumping = false;
    this.jumpY = 0;
    this.jumpVy = 0;
    this.isDucking = false;

    this.speed = 135; // px/sec
    this.distance = 0;
    this.gemsCollected = 0;
    this.score = 0;
    this.lives = 3;
    this.invulnTimer = 0;

    this.zone = 1; // 1: Crystal Grotto, 2: Lava Trestle, 3: Abyssal Rift, 4: Gold Vault
    this.zoneProgress = 0;
    this.zoneLength = 2200;

    // Environmental elements
    this.rails = [];
    this.switches = [];
    this.gems = [];
    this.hazards = []; // 'GAP', 'BARREL', 'BEAM', 'FALLING_ROCK'
    this.sparks = [];
    this.scenery = [];

    this.gameOver = false;
    this.gameWon = false;
    this.timer = 0;
    this.clackTimer = 0;

    this.generateCavern();
  },

  generateCavern() {
    this.rails = [];
    this.switches = [];
    this.gems = [];
    this.hazards = [];
    this.scenery = [];

    // Background stalactites and timber arches
    for (let i = 0; i < 40; i++) {
      this.scenery.push({
        x: i * 70 + Math.random() * 30,
        type: Math.random() > 0.5 ? 'STALACTITE' : 'TIMBER',
        y: Math.random() > 0.5 ? 20 : 205,
        h: 20 + Math.random() * 30
      });
    }

    // Switches along the track (every ~280px)
    for (let i = 1; i <= 24; i++) {
      const sx = i * 280 + (Math.random() - 0.5) * 60;
      const fromLane = Math.floor(Math.random() * 3);
      const toLane = fromLane === 0 ? 1 : (fromLane === 2 ? 1 : (Math.random() > 0.5 ? 0 : 2));
      this.switches.push({
        x: sx,
        fromLane: fromLane,
        toLane: toLane,
        state: 0, // 0 = straight, 1 = switched
        triggered: false
      });
    }

    // Gems (Emeralds, Rubies, Diamonds)
    for (let i = 0; i < 45; i++) {
      this.gems.push({
        x: 180 + i * 160 + Math.random() * 60,
        lane: Math.floor(Math.random() * 3),
        type: Math.random() < 0.6 ? 1 : (Math.random() < 0.85 ? 2 : 3), // 1=Emerald 50, 2=Ruby 100, 3=Diamond 250
        collected: false
      });
    }

    // Hazards (Gaps to jump over, low beams to duck under, TNT barrels)
    for (let i = 0; i < 28; i++) {
      const hx = 260 + i * 220 + Math.random() * 80;
      const hLane = Math.floor(Math.random() * 3);
      const hType = Math.random() < 0.38 ? 'GAP' : (Math.random() < 0.7 ? 'BEAM' : 'BARREL');
      this.hazards.push({
        x: hx,
        lane: hLane,
        type: hType,
        cleared: false
      });
    }
  },

  // --------------------------------------------------------------------------
  // 3. UPDATE LOOP
  // --------------------------------------------------------------------------
  update(dt) {
    dt = Math.min(dt, 0.05);
    this.timer += dt;

    if (this.gameOver || this.gameWon) {
      if (PAD.hit('a') || PAD.hit('b') || TOUCH.down) this.init();
      return;
    }

    if (this.invulnTimer > 0) this.invulnTimer -= dt;

    // Speed progression
    this.speed = 135 + (this.zone - 1) * 35;
    const scroll = this.speed * dt;
    this.distance += scroll;
    this.zoneProgress += scroll;

    // Check Zone Milestone
    if (this.zoneProgress >= this.zoneLength) {
      this.zone++;
      this.zoneProgress = 0;
      APU.sfx('LEVELUP');
      if (this.zone > 4) {
        this.gameWon = true;
        this.score += 5000;
        SAVE.setScore(this.id, this.score);
        APU.sfx('FANFARE');
        return;
      }
    }

    // Wheel clatter audio
    this.clackTimer += dt * (this.speed / 100);
    if (this.clackTimer >= 0.28 && !this.isJumping) {
      this.clackTimer = 0;
      APU.sfx('TICK');
    }

    // ------------------------------------------------------------------------
    // Controls: Lane Switching & Jumping & Ducking
    // ------------------------------------------------------------------------
    // Track switch toggle [A] or D-pad Up/Down near junctions
    if (PAD.hit('up') && this.lane > 0 && !this.isJumping) {
      this.lane--;
      APU.sfx('SELECT');
    }
    if (PAD.hit('down') && this.lane < 2 && !this.isJumping) {
      this.lane++;
      APU.sfx('SELECT');
    }

    // Toggle approaching track switch
    if (PAD.hit('a') || (TOUCH.down && TOUCH.x > 180 && TOUCH.y < 120)) {
      for (let sw of this.switches) {
        const dist = sw.x - this.cartX;
        if (dist > 0 && dist < 120) {
          sw.state = sw.state ? 0 : 1;
          APU.sfx('CONFIRM');
          break;
        }
      }
    }

    // Jump [B] or Swipe Up
    if ((PAD.hit('b') || (TOUCH.down && TOUCH.x > 180 && TOUCH.y >= 120) || TOUCH.swipe === 'up') && !this.isJumping) {
      this.isJumping = true;
      this.jumpVy = -190;
      APU.sfx('POWERUP');
    }

    // Ducking (Hold Down or Touch lower screen)
    this.isDucking = PAD.state.down || (TOUCH.held && TOUCH.y > 180);

    // ------------------------------------------------------------------------
    // Cart Physics & Lane Interpolation
    // ------------------------------------------------------------------------
    const laneY = [85, 135, 185];
    this.targetY = laneY[this.lane];
    this.cartY += (this.targetY - this.cartY) * 14 * dt;

    // Jump gravity
    if (this.isJumping) {
      this.jumpVy += 560 * dt;
      this.jumpY += this.jumpVy * dt;
      if (this.jumpY >= 0) {
        this.jumpY = 0;
        this.jumpVy = 0;
        this.isJumping = false;
        // Landing wheel sparks
        this.spawnSparks(this.cartX, this.cartY, 8);
      }
    }

    // Wheel sparks on track
    if (Math.random() < 0.25 && !this.isJumping) {
      this.spawnSparks(this.cartX - 10, this.cartY + 8, 2);
    }

    // ------------------------------------------------------------------------
    // World Scrolling & Entity Management
    // ------------------------------------------------------------------------
    // Scroll track switches
    for (let sw of this.switches) {
      sw.x -= scroll;
      // Auto-divert cart if switch is active and cart enters switch threshold
      if (!sw.triggered && Math.abs(sw.x - this.cartX) < 14 && this.lane === sw.fromLane) {
        sw.triggered = true;
        if (sw.state === 1) {
          this.lane = sw.toLane;
          this.spawnSparks(this.cartX, this.cartY, 6);
        }
      }
    }

    // Scroll Gems & Collision
    for (let g of this.gems) {
      g.x -= scroll;
      if (!g.collected && g.lane === this.lane && Math.abs(g.x - this.cartX) < 18) {
        // Can collect if on rail or jumped into air
        if (!this.isDucking) {
          g.collected = true;
          this.gemsCollected++;
          const val = g.type === 1 ? 50 : (g.type === 2 ? 100 : 250);
          this.score += val;
          APU.sfx('COIN');
          this.spawnSparks(this.cartX + 6, this.cartY - 4, 8);
          SAVE.setScore(this.id, this.score);
        }
      }
    }

    // Scroll Hazards & Collision Check
    for (let h of this.hazards) {
      h.x -= scroll;
      if (!h.cleared && h.lane === this.lane && Math.abs(h.x - this.cartX) < 16) {
        let hit = false;
        if (h.type === 'GAP') {
          // Must be high in jump to clear gap!
          if (!this.isJumping || this.jumpY > -14) hit = true;
        } else if (h.type === 'BEAM') {
          // Must be ducking to clear low beam!
          if (!this.isDucking && this.jumpY > -10) hit = true;
        } else if (h.type === 'BARREL') {
          // Must jump cleanly over barrel!
          if (!this.isJumping || this.jumpY > -16) hit = true;
        }

        if (hit && this.invulnTimer <= 0) {
          h.cleared = true;
          this.lives--;
          this.invulnTimer = 1.6;
          APU.sfx('EXPLODE');
          this.spawnSparks(this.cartX, this.cartY, 18);
          if (this.lives <= 0) {
            this.gameOver = true;
            APU.sfx('HURT');
            return;
          }
        }
      }
    }

    // Scroll Scenery
    for (let sc of this.scenery) {
      sc.x -= scroll * 0.7; // parallax
      if (sc.x < -40) sc.x += 1600;
    }

    // Update Sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.life -= dt;
      if (sp.life <= 0) this.sparks.splice(i, 1);
    }
  },

  spawnSparks(x, y, count) {
    for (let i = 0; i < count; i++) {
      this.sparks.push({
        x: x,
        y: y,
        vx: -60 - Math.random() * 80,
        vy: (Math.random() - 0.7) * 90,
        life: 0.2 + Math.random() * 0.25
      });
    }
  },

  // --------------------------------------------------------------------------
  // 4. RENDERING (256x240 CRT PHOSPHOR)
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    // 1. Background Cavern Rock Walls & Trestles
    this.renderCavernBackdrop(g);

    // 2. Three Continuous Iron Rails
    const railsY = [85, 135, 185];
    for (let r = 0; r < 3; r++) {
      const ry = railsY[r];
      // Iron Rail Track
      g.line(0, ry + 6, 256, ry + 6, 2);
      g.line(0, ry + 8, 256, ry + 8, 1);

      // Wooden cross-ties with movement illusion
      const tieOffset = Math.floor(this.distance * 1.0) % 16;
      for (let tx = -tieOffset; tx < 256; tx += 16) {
        g.line(tx, ry + 5, tx - 2, ry + 11, 1);
      }
    }

    // 3. Track Switch Levers & Junctions
    for (let sw of this.switches) {
      if (sw.x > -20 && sw.x < 270) {
        const fromY = railsY[sw.fromLane];
        const toY = railsY[sw.toLane];

        // Diagonal branch rail
        g.line(sw.x, fromY + 6, sw.x + 36, toY + 6, sw.state ? 3 : 1);

        // Switch lever post & signal lamp
        g.line(sw.x - 4, fromY - 14, sw.x - 4, fromY + 4, 2);
        // Signal Lamp (3 = Green/Active, 1 = Dim/Diverted)
        g.disc(sw.x - 4, fromY - 16, 3, sw.state ? 3 : 1);
        g.text("[SW]", sw.x - 10, fromY - 26, sw.state ? 3 : 2);
      }
    }

    // 4. Hazards (Gaps, Low Beams, TNT Barrels)
    for (let h of this.hazards) {
      if (h.x > -30 && h.x < 280) {
        const hy = railsY[h.lane];
        if (h.type === 'GAP') {
          // Rail Gap / Chasm Hole
          g.rect(h.x - 12, hy + 5, 24, 7, 0);
          g.line(h.x - 12, hy + 6, h.x - 12, hy + 16, 2);
          g.line(h.x + 12, hy + 6, h.x + 12, hy + 16, 2);
          g.text("!GAP!", h.x - 14, hy - 8, 3);
        } else if (h.type === 'BEAM') {
          // Low overhead timber beam
          g.rect(h.x - 8, hy - 18, 16, 6, 2);
          g.box(h.x - 8, hy - 18, 16, 6, 3);
          g.line(h.x, hy - 18, h.x, hy - 35, 1);
          g.text("DUCK!", h.x - 12, hy - 28, 3);
        } else if (h.type === 'BARREL') {
          // TNT Dynamite Barrel
          g.box(h.x - 7, hy - 6, 14, 12, 3);
          g.text("TNT", h.x - 6, hy - 4, 3);
        }
      }
    }

    // 5. Cavern Crystals & Gems
    for (let gem of this.gems) {
      if (!gem.collected && gem.x > -15 && gem.x < 270) {
        const gy = railsY[gem.lane] - 4;
        if (gem.type === 1) {
          // Emerald
          g.tri(gem.x, gy - 6, gem.x - 4, gy, gem.x + 4, gy, 3);
          g.tri(gem.x, gy + 4, gem.x - 4, gy, gem.x + 4, gy, 3);
        } else if (gem.type === 2) {
          // Ruby
          g.disc(gem.x, gy - 1, 4, 3);
          g.pix(gem.x, gy - 1, 0);
        } else {
          // Radiant Diamond
          g.tri(gem.x, gy - 8, gem.x - 6, gy - 2, gem.x + 6, gy - 2, 3);
          g.tri(gem.x, gy + 4, gem.x - 6, gy - 2, gem.x + 6, gy - 2, 3);
        }
      }
    }

    // 6. Flying Wheel Sparks
    for (let sp of this.sparks) {
      g.pix(sp.x, sp.y, 3);
    }

    // 7. Render Minecart & Miner
    if (this.invulnTimer <= 0 || Math.floor(this.timer * 12) % 2 === 0) {
      const cy = this.cartY + this.jumpY;

      // Miner inside cart
      if (!this.isDucking) {
        // Hardhat with miner lamp
        g.disc(this.cartX + 2, cy - 14, 4, 2);
        g.pix(this.cartX + 6, cy - 15, 3); // headlamp
        // Light cone beam
        g.line(this.cartX + 6, cy - 15, this.cartX + 28, cy - 12, 1);
        g.line(this.cartX + 6, cy - 15, this.cartX + 28, cy - 18, 1);
      } else {
        // Ducking posture
        g.rect(this.cartX - 2, cy - 4, 8, 4, 2);
      }

      // Minecart body
      g.box(this.cartX - 12, cy - 4, 24, 10, 3);
      g.rect(this.cartX - 11, cy - 3, 22, 8, 2);

      // Iron Flanged Wheels
      g.disc(this.cartX - 8, cy + 6, 3, 3);
      g.disc(this.cartX - 8, cy + 6, 1, 0);
      g.disc(this.cartX + 8, cy + 6, 3, 3);
      g.disc(this.cartX + 8, cy + 6, 1, 0);
    }

    // 8. HUD & Overlays
    this.renderHUD(g);

    // Game Over & Victory modals
    if (this.gameOver) {
      g.rect(34, 85, 188, 62, 0);
      g.box(34, 85, 188, 62, 3);
      g.textC("CARTRIDGE DERAILMENT!", 98, 3);
      g.textC("FINAL SCORE: " + this.score, 114, 2);
      g.textC("PRESS [A] TO RETRY", 130, 3);
    } else if (this.gameWon) {
      g.rect(26, 80, 204, 74, 0);
      g.box(26, 80, 204, 74, 3);
      g.textC("GOLD VAULT BREACHED!", 92, 3);
      g.textC("CAVERN ESCAPE COMPLETE!", 106, 2);
      g.textC("FINAL SCORE: " + this.score, 122, 3);
      g.textC("PRESS [A] TO RUN AGAIN", 138, 2);
    }
  },

  renderCavernBackdrop(g) {
    // Parallax background scenery (Stalactites & Timber struts)
    for (let sc of this.scenery) {
      if (sc.x > -20 && sc.x < 270) {
        if (sc.type === 'STALACTITE') {
          g.tri(sc.x, sc.y, sc.x - 6, sc.y - sc.h, sc.x + 6, sc.y - sc.h, 1);
        } else {
          g.line(sc.x, 30, sc.x, 210, 1);
          g.line(sc.x - 12, 30, sc.x + 12, 30, 1);
        }
      }
    }

    // Zone Title Banner (top-right watermarked)
    const zoneNames = ["", "CRYSTAL GROTTO", "LAVA TRESTLE", "ABYSSAL RIFT", "THE GOLD VAULT"];
    g.text("ZONE " + this.zone + ": " + zoneNames[this.zone], 12, 22, 1);
  },

  renderHUD(g) {
    // Header Bar
    g.rect(0, 0, 256, 16, 0);
    g.line(0, 16, 256, 16, 2);

    // Lives
    g.text("LIVES:", 6, 4, 2);
    for (let l = 0; l < 3; l++) {
      g.text(l < this.lives ? "♥" : "♡", 44 + l * 10, 4, 3);
    }

    // Distance & Gems
    const distM = Math.floor(this.distance / 10);
    g.text("DIST: " + distM + "M", 88, 4, 2);
    g.textR("GEMS:" + this.gemsCollected + "  SCR:" + this.score, 250, 4, 3);

    // On-screen Touch Controls (Mobile Friendly)
    g.box(186, 196, 32, 22, 2);
    g.text("JUMP", 188, 202, 3);
    g.box(220, 196, 32, 22, 2);
    g.text("FORK", 222, 202, 3);
  }
};
