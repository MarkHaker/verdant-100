// js/cartridges/cart_100_hacker_term.js
// ============================================================================
// Cartridge #100: HACKER TERM
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[100] = {
  id: 100,
  name: "HACKER TERM",
  genre: 9,
  scoreLabel: "NODES",
  desc: "CYBERPUNK TERMINAL OS: SCAN SUBNETS, PROBE PORTS, CRACK ICE FIREWALLS, AND BREACH THE CORTEX ROOT!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Terminal prompt '#!>'
    g.text("#!", x + 6, y + 10, 3);
    g.text(">", x + 20, y + 10, 2);
    g.line(x + 6, y + 24, x + 16, y + 24, 3); // blinking cursor
  },

  init() {
    this.nodesBreached = 0;
    this.credits = 0;
    this.targetIdx = 0;
    this.traceTimer = 0;
    this.traceActive = false;
    this.traceMax = 25.0;

    // Self-contained scrolling terminal buffer
    this.lines = [];
    this.maxLines = 12;

    // Command palette
    this.cmdIdx = 0;
    this.commands = ["SCAN", "PROBE", "INJECT", "DECRYPT", "ROOT"];

    // Network Target Nodes
    this.nodes = [
      { ip: "192.168.1.1", name: "GATEWAY PROXY", ice: 1, port: "SSH:22", cracked: false, key: "7F" },
      { ip: "10.0.4.12", name: "CORP MAIL RELAY", ice: 2, port: "SMTP:25", cracked: false, key: "A4" },
      { ip: "172.16.88.9", name: "CIPHER VAULT", ice: 3, port: "SSL:443", cracked: false, key: "E1" },
      { ip: "10.250.0.1", name: "AI BLACK-ICE", ice: 4, port: "NEURAL:8080", cracked: false, key: "3C" },
      { ip: "0.0.0.0", name: "CORTEX MAINFRAME", ice: 5, port: "ROOT:0", cracked: false, key: "FF" }
    ];

    // Mini-game breach buffer
    this.breachActive = false;
    this.breachHex = ["1C", "7F", "E1", "A4", "3C", "FF", "BD", "55"];
    this.breachTarget = [];
    this.breachSelected = [];
    this.breachCursor = 0;

    this.state = 'TERMINAL'; // 'TERMINAL', 'BREACH', 'ROOT_VICTORY', 'TRACED'
    this.stateTimer = 0;
    this.cursorBlink = 0;

    this.print("=== CYBER-NET VOS v4.09 ===");
    this.print("INITIALIZING NEURAL INTERFACE...");
    this.print("READY. SELECT COMMAND OR TAP CMD:");
  },

  save() {
    return { nodes: this.nodesBreached, credits: this.credits };
  },

  load(data) {
    if (data && typeof data.nodes === 'number') {
      this.nodesBreached = data.nodes;
      this.credits = data.credits || 0;
    }
  },

  print(str) {
    this.lines.push(str);
    if (this.lines.length > this.maxLines) {
      this.lines.shift();
    }
  },

  update(dt) {
    if (dt > 0.05) dt = 0.05;
    this.stateTimer += dt;
    this.cursorBlink += dt * 4;

    if (this.state === 'ROOT_VICTORY' || this.state === 'TRACED') {
      if (this.stateTimer > 2.0 && (PAD.hit('a') || PAD.hit('b') || TOUCH.down)) {
        APU.sfx('CONFIRM');
        this.init();
      }
      return;
    }

    // Active ICE trace timer
    if (this.traceActive) {
      this.traceTimer -= dt;
      if (this.traceTimer <= 0) {
        this.traceActive = false;
        this.state = 'TRACED';
        this.stateTimer = 0;
        APU.sfx('ERROR');
        return;
      }
    }

    if (this.state === 'BREACH') {
      this.updateBreach(dt);
      return;
    }

    // Command navigation
    if (PAD.hit('left')) { this.cmdIdx = (this.cmdIdx - 1 + this.commands.length) % this.commands.length; APU.sfx('SELECT'); }
    if (PAD.hit('right')) { this.cmdIdx = (this.cmdIdx + 1) % this.commands.length; APU.sfx('SELECT'); }

    // [A] Execute selected command
    if (PAD.hit('a')) {
      this.executeCommand(this.commands[this.cmdIdx]);
    }

    // Touch controls: tap bottom command buttons
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      // 5 command buttons at bottom: y: 195 to 226
      if (ty >= 195 && ty <= 230) {
        var btnW = 42;
        for (var c = 0; c < 5; c++) {
          var bx = 10 + c * 46;
          if (tx >= bx && tx <= bx + btnW) {
            this.cmdIdx = c;
            this.executeCommand(this.commands[c]);
            break;
          }
        }
      }
    }
  },

  executeCommand(cmd) {
    this.print("> " + cmd);
    APU.sfx('TICK');

    var cur = this.nodes[this.targetIdx];

    if (cmd === 'SCAN') {
      this.print("SCANNING LOCAL SUBNET...");
      this.print("FOUND: " + cur.ip + " (" + cur.name + ")");
      this.print("ICE LEVEL: " + cur.ice + " | PORT: " + cur.port);
      APU.sfx('CONFIRM');
    } else if (cmd === 'PROBE') {
      this.print("PROBING VULNERABILITY AT " + cur.port + "...");
      this.print("CIPHER SIGNATURE: " + cur.key);
      this.print("READY TO INJECT BUFFER PAYLOAD!");
      APU.sfx('SELECT');
    } else if (cmd === 'INJECT') {
      // Start breach mini-game
      this.startBreach();
    } else if (cmd === 'DECRYPT') {
      if (cur.cracked) {
        this.print("NODE ALREADY DECRYPTED.");
      } else {
        this.print("ERROR: MUST INJECT EXPLOIT FIRST!");
        APU.sfx('ERROR');
      }
    } else if (cmd === 'ROOT') {
      if (cur.cracked) {
        this.nodesBreached++;
        this.credits += cur.ice * 250;
        this.print("*** ACCESS GRANTED: ROOT SHELL ***");
        this.print("LOOT EXTRACTED: +" + (cur.ice * 250) + " CREDITS");
        this.traceActive = false;
        APU.sfx('COIN');
        SAVE.setScore(this.id, this.nodesBreached);

        if (this.targetIdx + 1 < this.nodes.length) {
          this.targetIdx++;
          this.print("TARGETING NEXT NODE: " + this.nodes[this.targetIdx].name);
        } else {
          // Breached final Cortex Mainframe!
          this.state = 'ROOT_VICTORY';
          this.stateTimer = 0;
          APU.sfx('FANFARE');
        }
      } else {
        this.print("ERROR: ACCESS DENIED. INJECT PAYLOAD!");
        APU.sfx('ERROR');
      }
    }
  },

  startBreach() {
    this.state = 'BREACH';
    this.stateTimer = 0;
    this.traceActive = true;
    this.traceTimer = 20.0 - this.targetIdx * 2.5;

    // Pick 2 target hex bytes
    var cur = this.nodes[this.targetIdx];
    this.breachTarget = [cur.key, this.breachHex[Math.floor(Math.random() * this.breachHex.length)]];
    this.breachSelected = [];
    this.breachCursor = 0;
    APU.sfx('POWERUP');
  },

  updateBreach(dt) {
    if (PAD.hit('left')) { this.breachCursor = (this.breachCursor - 1 + 8) % 8; APU.sfx('SELECT'); }
    if (PAD.hit('right')) { this.breachCursor = (this.breachCursor + 1) % 8; APU.sfx('SELECT'); }

    if (PAD.hit('a')) {
      var chosen = this.breachHex[this.breachCursor];
      this.breachSelected.push(chosen);
      APU.sfx('TICK');

      var matchSoFar = true;
      for (var i = 0; i < this.breachSelected.length; i++) {
        if (this.breachSelected[i] !== this.breachTarget[i]) matchSoFar = false;
      }

      if (!matchSoFar) {
        // Breach failed
        this.print("PAYLOAD REJECTED BY FIREWALL!");
        this.state = 'TERMINAL';
        APU.sfx('ERROR');
      } else if (this.breachSelected.length === this.breachTarget.length) {
        // Full match!
        this.nodes[this.targetIdx].cracked = true;
        this.print("EXPLOIT INJECTED SUCCESSFULLY!");
        this.print("RUN 'ROOT' TO ESCALATE PRIVILEGES!");
        this.state = 'TERMINAL';
        APU.sfx('COIN');
      }
    }

    if (PAD.hit('b')) {
      this.state = 'TERMINAL';
    }

    // Touch controls for breach
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      if (ty >= 120 && ty <= 160) {
        for (var b = 0; b < 8; b++) {
          var bx = 16 + b * 26;
          if (tx >= bx && tx <= bx + 24) {
            this.breachCursor = b;
            var chosen = this.breachHex[b];
            this.breachSelected.push(chosen);
            APU.sfx('TICK');
            if (this.breachSelected[this.breachSelected.length - 1] !== this.breachTarget[this.breachSelected.length - 1]) {
              this.print("PAYLOAD REJECTED BY FIREWALL!");
              this.state = 'TERMINAL';
              APU.sfx('ERROR');
            } else if (this.breachSelected.length === this.breachTarget.length) {
              this.nodes[this.targetIdx].cracked = true;
              this.print("EXPLOIT INJECTED SUCCESSFULLY!");
              this.print("RUN 'ROOT' TO ESCALATE PRIVILEGES!");
              this.state = 'TERMINAL';
              APU.sfx('COIN');
            }
            break;
          }
        }
      }
    }
  },

  render(g) {
    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("HACKER TERM", 6, 6, 3);
    g.text("NODES:" + this.nodesBreached + "/5", 96, 6, 3);
    g.textR("$" + this.credits, 234, 6, 2);

    // ICE Trace Warning Line
    if (this.traceActive) {
      var traceRatio = Math.max(0, this.traceTimer / this.traceMax);
      g.rect(0, 22, Math.floor(240 * traceRatio), 4, (Math.floor(this.stateTimer * 8) % 2 === 0) ? 3 : 2);
      g.text("TRACE: " + this.traceTimer.toFixed(1) + "S", 140, 6, 3);
    }

    if (this.state === 'BREACH') {
      this.renderBreachModal(g);
      return;
    }

    // Monospace Terminal Window (x: 8, y: 28, w: 224, h: 160)
    g.rect(8, 28, 224, 160, 0);
    g.box(8, 28, 224, 160, 2);

    // Terminal Lines
    for (var i = 0; i < this.lines.length; i++) {
      var ly = 34 + i * 12;
      var str = this.lines[i];
      var col = str.startsWith(">") ? 3 : (str.startsWith("***") ? 3 : 2);
      g.text(str, 12, ly, col);
    }

    // Blinking Prompt Cursor
    var curLineY = 34 + this.lines.length * 12;
    if (curLineY < 180 && Math.sin(this.cursorBlink) > 0) {
      g.rect(12, curLineY, 6, 8, 3);
    }

    // Bottom Quick Command Buttons
    g.rect(0, 192, 240, 48, 0);
    g.line(0, 192, 240, 192, 2);

    for (var c = 0; c < 5; c++) {
      var bx = 10 + c * 46;
      var by = 198;
      var isSel = (c === this.cmdIdx);
      g.rect(bx, by, 42, 28, isSel ? 1 : 0);
      g.box(bx, by, 42, 28, isSel ? 3 : 2);
      g.textC(this.commands[c], by + 10, isSel ? 3 : 2);
    }

    // Overlays
    if (this.state === 'ROOT_VICTORY') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("*** CORTEX MAINFRAME BREACHED ***", 68, 3);
      g.textC("ROOT MASTER PRIVILEGES ACHIEVED", 92, 2);
      g.textC("TOTAL CREDITS: $" + this.credits, 115, 3);
      g.textC("ALL 5 ICE BARRIERS ANNIHILATED", 132, 2);
      g.textC("PRESS [A] TO RESTART SYSTEM", 155, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    } else if (this.state === 'TRACED') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("TRACE DETECTED!", 70, 3);
      g.textC("NETWATCH EMERGENCY LOCKDOWN", 95, 2);
      g.textC("GATEWAY CONNECTION SEVERED", 115, 2);
      g.textC("PRESS [A] TO RE-ESTABLISH PROXY", 145, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  },

  renderBreachModal(g) {
    g.rect(14, 30, 212, 175, 0);
    g.box(14, 30, 212, 175, 3);

    g.textC("CYBERPUNK BUFFER INJECTION", 42, 3);
    g.textC("TARGET CIPHER: [ " + this.breachTarget.join(" ") + " ]", 62, 3);

    var curBuffer = this.breachSelected.length > 0 ? this.breachSelected.join(" ") : "(EMPTY)";
    g.textC("BUFFER: [ " + curBuffer + " ]", 82, 2);

    // 8 Hex Blocks
    g.textC("SELECT MATCHING HEX CODE:", 106, 2);
    for (var b = 0; b < 8; b++) {
      var bx = 16 + b * 26;
      var by = 122;
      var isCursor = (b === this.breachCursor);
      g.rect(bx, by, 24, 24, isCursor ? 1 : 0);
      g.box(bx, by, 24, 24, isCursor ? 3 : 2);
      g.text(this.breachHex[b], bx + 4, by + 8, isCursor ? 3 : 2);
    }

    g.textC("[A] INJECT CODE   [B] ABORT", 164, 2);
    g.textC("TRACE COUNTDOWN: " + this.traceTimer.toFixed(1) + "S", 182, 3);
  }
};
