// js/cartridges/cart_095_elevator.js
// ============================================================================
// Cartridge #095: ELEVATOR
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[95] = {
  id: 95,
  name: "ELEVATOR",
  genre: 9,
  scoreLabel: "SERVED",
  desc: "SKYSCRAPER ELEVATOR DISPATCHER: ROUTE DUAL ELEVATORS TO TRANSPORT RUSH-HOUR PASSENGERS BEFORE THEY RAGE-QUIT!",

  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Elevator shaft with car
    g.box(x + 10, y + 4, 12, 24, 2);
    g.rect(x + 12, y + 12, 8, 8, 3);
    g.line(x + 16, y + 4, x + 16, y + 12, 1); // Cable
  },

  init() {
    this.floors = 8;
    this.score = 0;
    this.servedCount = 0;
    this.rageQuitCount = 0;
    this.activeCar = 0; // 0: Car A, 1: Car B

    // Dual Elevator Cars
    this.cars = [
      {
        id: "A",
        shaftX: 74,
        floor: 1, // 1 to 8
        targetFloor: 1,
        y: 198, // pixel position
        speed: 55,
        doors: 'CLOSED', // 'OPEN', 'CLOSING', 'CLOSED'
        doorTimer: 0,
        passengers: []
      },
      {
        id: "B",
        shaftX: 130,
        floor: 8,
        targetFloor: 8,
        y: 44,
        speed: 55,
        doors: 'CLOSED',
        doorTimer: 0,
        passengers: []
      }
    ];

    this.waitingPeople = []; // { floor, dest, waitTimer, maxWait: 18 }
    this.spawnTimer = 1.0;
    this.shiftTime = 0;

    this.state = 'PLAY'; // 'PLAY', 'GAMEOVER'
    this.stateTimer = 0;
  },

  floorToY(f) {
    // Floor 1 is bottom (y ~ 198), Floor 8 is top (y ~ 44)
    return 198 - (f - 1) * 22;
  },

  yToFloor(y) {
    return Math.max(1, Math.min(8, Math.round(1 + (198 - y) / 22)));
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

    this.shiftTime += dt;

    // Switch active elevator car: [B] or Left/Right
    if (PAD.hit('b') || PAD.hit('left') || PAD.hit('right')) {
      this.activeCar = (this.activeCar + 1) % 2;
      APU.sfx('SELECT');
    }

    // Direct active elevator: [Up] / [Down]
    var car = this.cars[this.activeCar];
    if (PAD.hit('up')) {
      car.targetFloor = Math.min(8, car.floor + 1);
      APU.sfx('TICK');
    }
    if (PAD.hit('down')) {
      car.targetFloor = Math.max(1, car.floor - 1);
      APU.sfx('TICK');
    }

    // [A] Open doors / Stop at current floor
    if (PAD.hit('a')) {
      car.targetFloor = car.floor;
      this.openDoors(car);
    }

    // Touch controls: tap on floors in shaft A or shaft B
    if (TOUCH.down) {
      var tx = TOUCH.x, ty = TOUCH.y;
      for (var f = 1; f <= 8; f++) {
        var fy = this.floorToY(f);
        if (Math.abs(ty - fy) <= 11) {
          if (tx >= 60 && tx <= 100) {
            this.activeCar = 0;
            this.cars[0].targetFloor = f;
            APU.sfx('TICK');
          } else if (tx >= 115 && tx <= 155) {
            this.activeCar = 1;
            this.cars[1].targetFloor = f;
            APU.sfx('TICK');
          }
          break;
        }
      }
    }

    // Spawn Waiting Commuters
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = Math.max(1.4, 3.5 - this.shiftTime * 0.03);
      if (this.waitingPeople.length < 12) {
        var startF = Math.floor(Math.random() * 8) + 1;
        var endF = Math.floor(Math.random() * 8) + 1;
        while (endF === startF) endF = Math.floor(Math.random() * 8) + 1;

        this.waitingPeople.push({
          floor: startF,
          dest: endF,
          waitTimer: 0,
          maxWait: 18.0
        });
      }
    }

    // Update Waiting Commuters (patience drain)
    for (var p = this.waitingPeople.length - 1; p >= 0; p--) {
      var person = this.waitingPeople[p];
      person.waitTimer += dt;
      if (person.waitTimer >= person.maxWait) {
        // Rage quit!
        this.rageQuitCount++;
        this.waitingPeople.splice(p, 1);
        APU.sfx('HIT');

        if (this.rageQuitCount >= 5) {
          this.state = 'GAMEOVER';
          this.stateTimer = 0;
          SAVE.setScore(this.id, this.servedCount);
          APU.sfx('ERROR');
        }
      }
    }

    // Update Both Elevator Cars
    for (var c = 0; c < 2; c++) {
      var ec = this.cars[c];
      var targetY = this.floorToY(ec.targetFloor);

      if (ec.doors === 'OPEN') {
        ec.doorTimer += dt;
        if (ec.doorTimer > 1.2) {
          ec.doors = 'CLOSED';
          ec.doorTimer = 0;
        }
      } else {
        // Move car towards target Y
        var dy = targetY - ec.y;
        if (Math.abs(dy) > 1.5) {
          ec.y += Math.sign(dy) * ec.speed * dt;
          ec.floor = this.yToFloor(ec.y);
        } else {
          ec.y = targetY;
          ec.floor = ec.targetFloor;
          // Arrived at target floor: open doors
          if (ec.doors === 'CLOSED') {
            this.openDoors(ec);
          }
        }
      }
    }
  },

  openDoors(car) {
    if (car.doors !== 'OPEN') {
      car.doors = 'OPEN';
      car.doorTimer = 0;

      // 1. Alight passengers who reached their destination floor
      for (var i = car.passengers.length - 1; i >= 0; i--) {
        if (car.passengers[i].dest === car.floor) {
          car.passengers.splice(i, 1);
          this.servedCount++;
          this.score += 100;
          APU.sfx('COIN');
          SAVE.setScore(this.id, this.servedCount);
        }
      }

      // 2. Board waiting passengers from this floor (up to capacity 4)
      for (var w = this.waitingPeople.length - 1; w >= 0; w--) {
        if (car.passengers.length >= 4) break;
        var person = this.waitingPeople[w];
        if (person.floor === car.floor) {
          car.passengers.push(person);
          this.waitingPeople.splice(w, 1);
          APU.sfx('TICK');
        }
      }
    }
  },

  render(g) {
    g.clear(0);

    // Top Header & Stats
    g.rect(0, 0, 240, 22, 1);
    g.text("ELEVATOR", 6, 6, 3);
    g.text("SERVED:" + this.servedCount, 82, 6, 3);
    g.text("RAGE:" + this.rageQuitCount + "/5", 154, 6, this.rageQuitCount > 2 ? 3 : 2);
    g.textR(Math.floor(this.shiftTime) + "S", 234, 6, 2);

    // Render 8 Floors of Skyscraper
    for (var f = 1; f <= 8; f++) {
      var fy = this.floorToY(f);
      // Floor slab line
      g.line(4, fy + 10, 236, fy + 10, 1);
      g.text("F" + f, 6, fy - 3, 2);

      // Render waiting commuters on left and right hallways
      var waitingOnF = 0;
      for (var p = 0; p < this.waitingPeople.length; p++) {
        var wp = this.waitingPeople[p];
        if (wp.floor === f) {
          var hx = 24 + waitingOnF * 10;
          var isAngry = (wp.waitTimer > wp.maxWait * 0.65);
          g.disc(hx, fy, 2, isAngry ? 3 : 2);
          g.line(hx, fy + 2, hx, fy + 8, isAngry ? 3 : 1);
          // Destination badge above
          g.text("" + wp.dest, hx - 2, fy - 8, isAngry ? 3 : 1);
          waitingOnF++;
        }
      }
    }

    // Elevator Shafts Vertical Framing
    g.line(64, 26, 64, 216, 2);
    g.line(100, 26, 100, 216, 2); // Shaft A
    g.line(120, 26, 120, 216, 2);
    g.line(156, 26, 156, 216, 2); // Shaft B

    // Render Both Elevator Cars
    for (var c = 0; c < 2; c++) {
      var car = this.cars[c];
      var cx = car.shaftX;
      var cy = car.y - 8;
      var isSel = (c === this.activeCar);

      // Suspension cable
      g.line(cx + 12, 26, cx + 12, cy, 1);

      // Elevator Car cabin (24w x 18h)
      g.rect(cx, cy, 24, 18, 0);
      g.box(cx, cy, 24, 18, isSel ? 3 : 2);

      // Inside cabin: passenger dots
      for (var pi = 0; pi < car.passengers.length; pi++) {
        g.disc(cx + 4 + pi * 5, cy + 9, 2, 3);
      }

      // Doors animation (doors opening/closing)
      if (car.doors === 'OPEN') {
        g.line(cx + 2, cy + 1, cx + 2, cy + 17, 3);
        g.line(cx + 22, cy + 1, cx + 22, cy + 17, 3);
      } else {
        g.line(cx + 12, cy + 1, cx + 12, cy + 17, 1);
      }

      // Selection Marker above shaft
      if (isSel) {
        g.textC("▼", cx + 12, cy - 8, 3);
      }
    }

    // Bottom Help Banner
    g.rect(0, 224, 240, 16, 0);
    g.line(0, 224, 240, 224, 2);
    g.text("UP/DN: CALL  [B]: SWAP CAR  [A]: STOP", 6, 227, 2);

    // Game Over Overlay
    if (this.state === 'GAMEOVER') {
      g.rect(20, 50, 200, 130, 0);
      g.box(20, 50, 200, 130, 3);
      g.textC("DISPATCH TERMINATED!", 70, 3);
      g.textC("5 PASSENGERS RAGE-QUIT", 95, 2);
      g.textC("PASSENGERS SERVED: " + this.servedCount, 115, 3);
      g.textC("PRESS [A] TO RESTART", 145, (Math.floor(this.stateTimer * 4) % 2 === 0) ? 3 : 1);
    }
  }
};
