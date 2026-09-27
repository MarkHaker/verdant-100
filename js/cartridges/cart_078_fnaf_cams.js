// js/cartridges/cart_078_fnaf_cams.js
// ============================================================================
// Cartridge #078: FNAF CAMS
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[78] = {
  id: 78,
  name: "FNAF CAMS",
  genre: 7,
  scoreLabel: "SURVIVED",
  desc: "SURVIVE THE NIGHT SHIFT! MONITOR SURVEILLANCE CAMERAS AND MANAGE POWER TO SEAL BLAST DOORS!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Security monitor screen
    g.box(x + 5, y + 6, 22, 16, 3);
    g.line(x + 7, y + 10, x + 15, y + 10, 2);
    g.line(x + 7, y + 14, x + 18, y + 14, 1);
    // Glowing red eyes in camera
    g.disc(x + 13, y + 13, 1, 3);
    g.disc(x + 18, y + 13, 1, 3);
    // Desk base
    g.line(x + 4, y + 25, x + 28, y + 25, 2);
  },

  init() {
    this.night = 1;
    this.time = 0; // 0 to 60 seconds (10s = 1 hour, 0 to 6 AM)
    this.power = 100.0;
    this.state = 'OFFICE'; // 'OFFICE', 'CAMS', 'JUMPSCARE', 'VICTORY', 'BLACKOUT'
    this.stateTimer = 0;
    this.staticNoise = 0;

    // Office doors & lights
    this.leftDoor = false;
    this.rightDoor = false;
    this.leftLight = false;
    this.rightLight = false;

    // Cameras
    this.curCam = 0; // 0: 1A(Stage), 1: 1B(Dining), 2: 2A(W-Hall), 3: 2B(W-Corner), 4: 3(Cove), 5: 4A(E-Hall), 6: 4B(E-Corner)
    this.camNames = ["1A:STAGE", "1B:DINING", "2A:W-HALL", "2B:W-CORNER", "3:COVE", "4A:E-HALL", "4B:E-CORNER"];

    // Animatronics AI positions
    // Bonnie: Stage(0) -> Dining(1) -> W-Hall(2) -> W-Corner(3) -> At Left Door(7) -> Attack(-1)
    this.bonniePos = 0;
    this.bonnieTimer = 0;
    this.bonnieWaitDoor = 0;

    // Chica: Stage(0) -> Dining(1) -> E-Hall(5) -> E-Corner(6) -> At Right Door(8) -> Attack(-1)
    this.chicaPos = 0;
    this.chicaTimer = 0;
    this.chicaWaitDoor = 0;

    // Foxy: Cove(4) states: 0=hiding, 1=peeking, 2=out, 3=running down W-Hall
    this.foxyState = 0;
    this.foxyTimer = 0;
    this.foxyRunTimer = 0;

    this.jumpscareWho = 'BONNIE';
    this.fanSpin = 0;
    this.jumpscareFrame = 0;
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;
    this.fanSpin += dt * 25;
    this.staticNoise = (this.staticNoise + 1) % 100;

    if (this.state === 'VICTORY') {
      if (this.stateTimer > 4.0 || PAD.hit('a') || TOUCH.down) {
        APU.sfx('CONFIRM');
        this.night++;
        this.init();
      }
      return;
    }

    if (this.state === 'JUMPSCARE') {
      this.jumpscareFrame += dt * 15;
      if (this.stateTimer > 2.5 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    // Advance In-Game Time (10 seconds per hour: 60s total for 6 AM)
    this.time += dt;
    if (this.time >= 60.0) {
      this.state = 'VICTORY';
      this.stateTimer = 0;
      APU.sfx('FANFARE');
      SAVE.setScore(this.id, Math.floor(6 * 1000 + this.power * 20));
      return;
    }

    // Power Drain Calculation
    var usageBars = 1; // base office
    if (this.state === 'CAMS') usageBars++;
    if (this.leftDoor) usageBars += 2;
    if (this.rightDoor) usageBars += 2;
    if (this.leftLight) usageBars++;
    if (this.rightLight) usageBars++;

    this.power -= usageBars * 0.35 * dt;
    if (this.power <= 0) {
      this.power = 0;
      if (this.state !== 'BLACKOUT') {
        this.state = 'BLACKOUT';
        this.stateTimer = 0;
        this.leftDoor = false;
        this.rightDoor = false;
        this.leftLight = false;
        this.rightLight = false;
        APU.sfx('ERROR');
      }
    }

    if (this.state === 'BLACKOUT') {
      // Freddy eyes flash in the dark, jumpscare after 3-5 seconds
      if (this.stateTimer > 3.5) {
        this.triggerJumpscare('FREDDY');
      }
      return;
    }

    // Inputs & Touch Controls
    // Toggle Cams [A] or Touch monitor button
    if (PAD.hit('a')) {
      if (this.state === 'OFFICE') {
        this.state = 'CAMS';
        this.leftLight = false;
        this.rightLight = false;
        APU.sfx('SELECT');
      } else {
        this.state = 'OFFICE';
        APU.sfx('SELECT');
      }
    }

    if (this.state === 'OFFICE') {
      // Left Door [Left]
      if (PAD.hit('left')) {
        this.leftDoor = !this.leftDoor;
        APU.sfx('CONFIRM');
      }
      // Right Door [Right]
      if (PAD.hit('right')) {
        this.rightDoor = !this.rightDoor;
        APU.sfx('CONFIRM');
      }
      // Lights: [Up] toggles Left Light, [Down] toggles Right Light
      if (PAD.hit('up')) {
        this.leftLight = !this.leftLight;
        if (this.leftLight) this.rightLight = false;
        APU.sfx('TICK');
      }
      if (PAD.hit('down')) {
        this.rightLight = !this.rightLight;
        if (this.rightLight) this.leftLight = false;
        APU.sfx('TICK');
      }

      // Touch Buttons in Office
      if (TOUCH.down) {
        var tx = TOUCH.x, ty = TOUCH.y;
        // Left door button: x: 10-34, y: 120-150
        if (tx >= 8 && tx <= 36 && ty >= 115 && ty <= 145) {
          this.leftDoor = !this.leftDoor;
          APU.sfx('CONFIRM');
        }
        // Left light button: x: 10-34, y: 155-185
        else if (tx >= 8 && tx <= 36 && ty >= 150 && ty <= 180) {
          this.leftLight = !this.leftLight;
          if (this.leftLight) this.rightLight = false;
          APU.sfx('TICK');
        }
        // Right door button: x: 204-232, y: 120-150
        else if (tx >= 204 && tx <= 232 && ty >= 115 && ty <= 145) {
          this.rightDoor = !this.rightDoor;
          APU.sfx('CONFIRM');
        }
        // Right light button: x: 204-232, y: 155-185
        else if (tx >= 204 && tx <= 232 && ty >= 150 && ty <= 180) {
          this.rightLight = !this.rightLight;
          if (this.rightLight) this.leftLight = false;
          APU.sfx('TICK');
        }
        // Monitor flip bar: bottom screen
        else if (ty >= 210) {
          this.state = 'CAMS';
          APU.sfx('SELECT');
        }
      }
    } else if (this.state === 'CAMS') {
      // Camera selection D-pad
      if (PAD.hit('left')) {
        this.curCam = (this.curCam - 1 + this.camNames.length) % this.camNames.length;
        APU.sfx('TICK');
      }
      if (PAD.hit('right')) {
        this.curCam = (this.curCam + 1) % this.camNames.length;
        APU.sfx('TICK');
      }
      if (PAD.hit('b')) {
        this.state = 'OFFICE';
        APU.sfx('SELECT');
      }

      // Touch cam buttons on minimap
      if (TOUCH.down) {
        var tx = TOUCH.x, ty = TOUCH.y;
        if (ty >= 210) {
          this.state = 'OFFICE';
          APU.sfx('SELECT');
        } else {
          // Minimap bounds: 140 to 235, y: 100 to 195
          for (var c = 0; c < 7; c++) {
            var cbx = 150 + (c % 2) * 44;
            var cby = 105 + Math.floor(c / 2) * 22;
            if (tx >= cbx - 2 && tx <= cbx + 38 && ty >= cby - 2 && ty <= cby + 18) {
              this.curCam = c;
              APU.sfx('TICK');
              break;
            }
          }
        }
      }
    }

    // Animatronics AI Simulation
    var aiSpeed = 1.0 + (this.time / 60.0) * 0.8 + (this.night - 1) * 0.4;

    // BONNIE AI
    this.bonnieTimer += dt * aiSpeed;
    if (this.bonniePos < 7) {
      if (this.bonnieTimer > 4.5) {
        this.bonnieTimer = 0;
        if (Math.random() < 0.6) {
          // Advance path: 0 -> 1 -> 2 -> 3 -> 7 (door)
          if (this.bonniePos === 0) this.bonniePos = 1;
          else if (this.bonniePos === 1) this.bonniePos = 2;
          else if (this.bonniePos === 2) this.bonniePos = 3;
          else if (this.bonniePos === 3) this.bonniePos = 7;
        }
      }
    } else if (this.bonniePos === 7) {
      // Bonnie standing outside Left Door!
      this.bonnieWaitDoor += dt;
      if (this.leftDoor) {
        // Door is closed! Bonnie is blocked and retreats to dining room
        if (this.bonnieWaitDoor > 2.0) {
          this.bonniePos = 1;
          this.bonnieWaitDoor = 0;
          APU.sfx('HIT'); // Thump on door
        }
      } else {
        // Door is open!
        if (this.bonnieWaitDoor > 3.0) {
          this.triggerJumpscare('BONNIE');
        }
      }
    }

    // CHICA AI
    this.chicaTimer += dt * aiSpeed;
    if (this.chicaPos < 8) {
      if (this.chicaTimer > 5.5) {
        this.chicaTimer = 0;
        if (Math.random() < 0.55) {
          // Advance path: 0 -> 1 -> 5 -> 6 -> 8 (door)
          if (this.chicaPos === 0) this.chicaPos = 1;
          else if (this.chicaPos === 1) this.chicaPos = 5;
          else if (this.chicaPos === 5) this.chicaPos = 6;
          else if (this.chicaPos === 6) this.chicaPos = 8;
        }
      }
    } else if (this.chicaPos === 8) {
      // Chica standing outside Right Door!
      this.chicaWaitDoor += dt;
      if (this.rightDoor) {
        // Door is closed! Chica retreats
        if (this.chicaWaitDoor > 2.0) {
          this.chicaPos = 1;
          this.chicaWaitDoor = 0;
          APU.sfx('HIT');
        }
      } else {
        if (this.chicaWaitDoor > 3.2) {
          this.triggerJumpscare('CHICA');
        }
      }
    }

    // FOXY AI (Cove CAM 3)
    if (this.state === 'CAMS' && this.curCam === 4) {
      // Looking at Foxy resets his urge to run
      this.foxyTimer = Math.max(0, this.foxyTimer - dt * 1.5);
    } else {
      this.foxyTimer += dt * (0.25 * aiSpeed);
    }

    if (this.foxyState === 0 && this.foxyTimer > 4.0) {
      this.foxyState = 1; // Peeking curtain
    } else if (this.foxyState === 1 && this.foxyTimer > 9.0) {
      this.foxyState = 2; // Stepped out
    } else if (this.foxyState === 2 && this.foxyTimer > 14.0) {
      this.foxyState = 3; // SPRINTING!
      this.foxyRunTimer = 2.2;
      APU.sfx('ALARM');
    }

    if (this.foxyState === 3) {
      this.foxyRunTimer -= dt;
      if (this.foxyRunTimer <= 0) {
        if (this.leftDoor) {
          // Blocked by door!
          APU.sfx('HIT');
          this.foxyState = 0;
          this.foxyTimer = 0;
          this.power = Math.max(0, this.power - 4); // Foxy bangs door, consumes extra battery
        } else {
          this.triggerJumpscare('FOXY');
        }
      }
    }
  },

  triggerJumpscare(who) {
    this.state = 'JUMPSCARE';
    this.stateTimer = 0;
    this.jumpscareWho = who;
    this.jumpscareFrame = 0;
    APU.sfx('EXPLODE');
  },

  render(g) {
    g.clear(0);

    var hour = Math.floor(this.time / 10);
    var hourStr = (hour === 0 ? "12" : hour) + " AM";

    if (this.state === 'OFFICE') {
      this.renderOffice(g, hourStr);
    } else if (this.state === 'CAMS') {
      this.renderCams(g, hourStr);
    } else if (this.state === 'BLACKOUT') {
      this.renderBlackout(g);
    } else if (this.state === 'JUMPSCARE') {
      this.renderJumpscare(g);
    } else if (this.state === 'VICTORY') {
      this.renderVictory(g);
    }
  },

  renderOffice(g, hourStr) {
    // 3D Perspective Office Room
    // Ceiling & floor perspective lines
    g.line(0, 0, 45, 45, 1);
    g.line(240, 0, 195, 45, 1);
    g.line(0, 220, 45, 185, 1);
    g.line(240, 220, 195, 185, 1);

    // Back wall
    g.box(45, 45, 150, 140, 2);

    // Left Doorway (x: 0 to 45, y: 45 to 185)
    if (this.leftDoor) {
      g.rect(2, 45, 40, 140, 2);
      g.box(2, 45, 40, 140, 3);
      // Hazard stripes on door
      for (var y = 50; y < 180; y += 12) {
        g.line(4, y, 40, y + 8, 1);
      }
    } else {
      // Open doorway
      g.rect(2, 45, 40, 140, 0);
      g.box(2, 45, 40, 140, 1);
      // Hallway light illuminates Bonnie outside!
      if (this.leftLight) {
        g.rect(4, 47, 36, 136, 1);
        if (this.bonniePos === 7) {
          // Bonnie silhouette with glowing ears & eyes
          g.disc(22, 100, 10, 3);
          g.box(16, 75, 4, 16, 3); // Left ear
          g.box(24, 75, 4, 16, 3); // Right ear
          g.disc(19, 98, 2, 0);
          g.disc(25, 98, 2, 0);
          g.textC("!", 22, 120, 3);
        }
      }
    }

    // Left Door & Light Buttons
    g.rect(6, 115, 28, 28, this.leftDoor ? 3 : 1);
    g.text("DOOR", 8, 126, this.leftDoor ? 0 : 3);

    g.rect(6, 150, 28, 28, this.leftLight ? 3 : 1);
    g.text("LIGHT", 7, 161, this.leftLight ? 0 : 3);

    // Right Doorway (x: 195 to 238, y: 45 to 185)
    if (this.rightDoor) {
      g.rect(198, 45, 40, 140, 2);
      g.box(198, 45, 40, 140, 3);
      for (var ry = 50; ry < 180; ry += 12) {
        g.line(200, ry, 236, ry + 8, 1);
      }
    } else {
      g.rect(198, 45, 40, 140, 0);
      g.box(198, 45, 40, 140, 1);
      if (this.rightLight) {
        g.rect(200, 47, 36, 136, 1);
        if (this.chicaPos === 8) {
          // Chica silhouette at window/door
          g.disc(218, 102, 11, 3);
          g.tri(214, 102, 222, 102, 218, 110, 2); // Beak
          g.disc(215, 98, 2, 0);
          g.disc(221, 98, 2, 0);
          g.textC("!", 218, 120, 3);
        }
      }
    }

    // Right Door & Light Buttons
    g.rect(204, 115, 28, 28, this.rightDoor ? 3 : 1);
    g.text("DOOR", 206, 126, this.rightDoor ? 0 : 3);

    g.rect(204, 150, 28, 28, this.rightLight ? 3 : 1);
    g.text("LIGHT", 205, 161, this.rightLight ? 0 : 3);

    // Office Desk & Fan
    g.rect(60, 160, 120, 45, 1);
    g.box(60, 160, 120, 45, 2);
    // Desk fan spinning
    var fx = 120, fy = 150;
    g.circle(fx, fy, 12, 2);
    var fanAng = this.fanSpin;
    for (var b = 0; b < 3; b++) {
      var a = fanAng + (b * Math.PI * 2 / 3);
      g.line(fx, fy, fx + Math.cos(a) * 10, fy + Math.sin(a) * 10, 3);
    }
    g.line(fx, fy + 12, fx, fy + 18, 2);

    // Posters on back wall
    g.box(85, 60, 28, 38, 2);
    g.textC("CELEBRATE", 99, 74, 1);

    // Top HUD
    g.rect(0, 0, 240, 22, 1);
    g.text("NIGHT " + this.night, 6, 6, 3);
    g.textR(hourStr, 234, 6, 3);

    // Power Meter
    g.text("PWR:" + Math.floor(this.power) + "%", 76, 6, this.power < 20 ? 3 : 2);
    var bars = 1 + (this.leftDoor ? 2 : 0) + (this.rightDoor ? 2 : 0) + (this.leftLight ? 1 : 0) + (this.rightLight ? 1 : 0);
    g.text("USE:", 140, 6, 2);
    for (var u = 0; u < bars; u++) {
      g.rect(166 + u * 6, 6, 4, 8, 3);
    }

    // Bottom Monitor Flip Bar
    g.rect(50, 215, 140, 24, 2);
    g.box(50, 215, 140, 24, 3);
    g.textC("[A] SECURITY MONITOR", 222, 0);
  },

  renderCams(g, hourStr) {
    // CRT Monitor Frame
    g.box(0, 0, 240, 210, 2);

    // Camera Static noise scanlines
    for (var sy = 4; sy < 206; sy += 6) {
      if ((sy + this.staticNoise) % 12 === 0) {
        g.line(4, sy, 236, sy, 1);
      }
    }

    // Top Header
    g.rect(4, 4, 232, 18, 1);
    g.text("CAM " + this.camNames[this.curCam], 10, 8, 3);
    g.disc(12, 12, 2, (this.staticNoise % 20 < 10) ? 3 : 0); // Recording dot
    g.textR(hourStr, 230, 8, 3);

    // Render Camera Feeds
    this.renderCamFeed(g, this.curCam);

    // Security Minimap on Right side
    var mapX = 142, mapY = 85;
    g.rect(mapX - 2, mapY - 2, 96, 120, 0);
    g.box(mapX - 2, mapY - 2, 96, 120, 2);
    g.text("BUILDING MAP", mapX + 12, mapY + 2, 1);

    // Cam Buttons
    for (var c = 0; c < 7; c++) {
      var cbx = mapX + 4 + (c % 2) * 44;
      var cby = mapY + 14 + Math.floor(c / 2) * 24;
      var active = (c === this.curCam);
      g.rect(cbx, cby, 40, 18, active ? 3 : 1);
      g.box(cbx, cby, 40, 18, active ? 0 : 2);
      g.text(this.camNames[c].substring(0, 2), cbx + 4, cby + 5, active ? 0 : 3);
    }

    // Bottom Monitor Bar
    g.rect(50, 215, 140, 24, 2);
    g.box(50, 215, 140, 24, 3);
    g.textC("[A] LOWER MONITOR", 222, 0);
  },

  renderCamFeed(g, camIdx) {
    if (camIdx === 0) {
      // 1A: SHOW STAGE
      g.text("MAIN STAGE", 20, 30, 2);
      g.box(20, 45, 100, 70, 1);
      // Bonnie, Freddy, Chica presence
      if (this.bonniePos === 0) {
        g.disc(35, 75, 8, 2); // Bonnie
        g.box(32, 60, 3, 10, 2); g.box(37, 60, 3, 10, 2);
      }
      // Freddy (center)
      g.disc(65, 70, 10, 3);
      g.box(60, 55, 10, 6, 2); // Top hat
      // Chica (right)
      if (this.chicaPos === 0) {
        g.disc(95, 75, 8, 2);
        g.tri(92, 75, 98, 75, 95, 82, 3);
      }
    } else if (camIdx === 1) {
      // 1B: DINING AREA
      g.text("DINING TABLES", 20, 30, 2);
      g.box(25, 60, 30, 18, 1);
      g.box(75, 60, 30, 18, 1);
      if (this.bonniePos === 1) {
        g.disc(38, 50, 8, 3);
        g.text("BONNIE", 25, 85, 2);
      }
      if (this.chicaPos === 1) {
        g.disc(88, 50, 8, 3);
        g.text("CHICA", 78, 85, 2);
      }
    } else if (camIdx === 2) {
      // 2A: WEST HALL
      g.text("WEST CORRIDOR", 20, 30, 2);
      g.line(20, 45, 50, 160, 1);
      g.line(110, 45, 80, 160, 1);
      if (this.bonniePos === 2) {
        g.disc(65, 90, 10, 3);
        g.text("MOVEMENT DETECTED", 20, 175, 3);
      }
    } else if (camIdx === 3) {
      // 2B: WEST HALL CORNER
      g.text("W-CORNER (BLIND SPOT)", 20, 30, 2);
      if (this.bonniePos === 3) {
        g.disc(60, 80, 14, 3);
        g.box(52, 60, 5, 14, 3); g.box(63, 60, 5, 14, 3);
        g.text("HOSTILE AT DOORWAY!", 15, 140, 3);
      } else {
        g.text("CORNER CLEAR", 30, 90, 1);
      }
    } else if (camIdx === 4) {
      // 3: PIRATE COVE
      g.text("PIRATE COVE", 20, 30, 2);
      g.box(25, 45, 85, 85, 1);
      if (this.foxyState === 0) {
        // Curtains closed
        g.textC("CURTAINS CLOSED", 85, 1);
      } else if (this.foxyState === 1) {
        // Peeking
        g.disc(55, 75, 8, 3);
        g.textC("FOXY PEEKING!", 95, 3);
      } else if (this.foxyState === 2) {
        // Stepped out
        g.disc(65, 75, 10, 3);
        g.textC("COVE EMPTY!", 95, 3);
      } else if (this.foxyState === 3) {
        // SPRINTING DOWN HALL!
        g.textC("!! FOXY CHARGING !!", 75, 3);
        g.textC("CLOSE LEFT DOOR NOW!", 95, 3);
      }
    } else if (camIdx === 5) {
      // 4A: EAST HALL
      g.text("EAST CORRIDOR", 20, 30, 2);
      g.line(20, 45, 50, 160, 1);
      g.line(110, 45, 80, 160, 1);
      if (this.chicaPos === 5) {
        g.disc(65, 90, 10, 3);
        g.text("MOVEMENT DETECTED", 20, 175, 3);
      }
    } else if (camIdx === 6) {
      // 4B: EAST HALL CORNER
      g.text("E-CORNER (BLIND SPOT)", 20, 30, 2);
      if (this.chicaPos === 6) {
        g.disc(60, 80, 14, 3);
        g.tri(55, 80, 65, 80, 60, 90, 2);
        g.text("HOSTILE AT DOORWAY!", 15, 140, 3);
      } else {
        g.text("CORNER CLEAR", 30, 90, 1);
      }
    }
  },

  renderBlackout(g) {
    g.clear(0);
    // Freddy glowing eyes
    if (Math.sin(this.stateTimer * 8) > 0) {
      g.disc(95, 110, 3, 3);
      g.disc(145, 110, 3, 3);
    }
    g.textC("POWER EXHAUSTED", 60, 1);
    g.textC("FACILITY SHUTDOWN...", 180, 1);
  },

  renderJumpscare(g) {
    g.clear(3);
    // Shaking animatronic face in phosphor CRT
    var shakeX = (Math.random() - 0.5) * 14;
    var shakeY = (Math.random() - 0.5) * 14;
    var cx = 120 + shakeX;
    var cy = 110 + shakeY;

    g.disc(cx, cy, 55, 0);
    // Giant jaws with sharp teeth
    g.box(cx - 30, cy + 10, 60, 25, 3);
    for (var t = cx - 25; t < cx + 25; t += 8) {
      g.tri(t, cy + 10, t + 6, cy + 10, t + 3, cy + 18, 0);
      g.tri(t, cy + 35, t + 6, cy + 35, t + 3, cy + 27, 0);
    }
    // Eyes
    g.disc(cx - 20, cy - 15, 12, 3);
    g.disc(cx + 20, cy - 15, 12, 3);
    g.disc(cx - 20, cy - 15, 4, 0);
    g.disc(cx + 20, cy - 15, 4, 0);

    g.textC(this.jumpscareWho + " CAUGHT YOU!", 210, 0);
  },

  renderVictory(g) {
    g.clear(0);
    g.box(20, 40, 200, 160, 3);
    g.textC("6:00 AM", 70, 3);
    g.textC("NIGHT " + this.night + " COMPLETED!", 110, 2);
    g.textC("BATTERY SURPLUS: " + Math.floor(this.power) + "%", 130, 2);
    g.textC("PAYCHECK ISSUED: $120.00", 150, 3);
    g.textC("PRESS [A] FOR NEXT SHIFT", 180, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
  }
};
