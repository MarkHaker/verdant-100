// js/cartridges/cart_046_city_8x8.js
// ============================================================================
// Cartridge #046: CITY 8X8
// Genre: STRATEGY (4) | Micro Urban Simulation & Regional Metro Planner
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[46] = {
  id: 46,
  name: "CITY 8X8",
  genre: 4,
  scoreLabel: "POP",
  desc: "MICRO URBAN PLANNER: RESIDENTIAL, COMMERCIAL, INDUSTRIAL. BALANCE JOBS & SMOG!",

  // --------------------------------------------------------------------------
  // 1. 32x32 RETRO ICON
  // Detailed city skyline: residential townhouse, commercial office tower
  // with antenna beacon, smoking factory chimney, and high-voltage power pylon.
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);

    // Ground horizon line
    g.line(x + 1, y + 26, x + 30, y + 26, 1);
    g.line(x + 1, y + 27, x + 30, y + 27, 2);

    // 1. Residential Townhouse (Left: x+3..x+9, y+14..y+25)
    // Triangular pitched roof
    g.line(x + 3, y + 17, x + 6, y + 14, 3);
    g.line(x + 6, y + 14, x + 9, y + 17, 3);
    g.px(x + 6, y + 14, 3);
    // House facade
    g.rect(x + 3, y + 18, 7, 8, 2);
    // Door & glowing window
    g.px(x + 5, y + 20, 3);
    g.rect(x + 7, y + 22, 2, 4, 0);

    // 2. Commercial Office Tower (Center-left: x+11..x+18, y+7..y+25)
    g.rect(x + 11, y + 9, 8, 17, 1);
    g.box(x + 11, y + 9, 8, 17, 3);
    // Antenna spire with blinking aircraft beacon
    g.line(x + 15, y + 3, x + 15, y + 8, 2);
    g.px(x + 15, y + 2, 3);
    // Lit office window grid
    g.px(x + 13, y + 12, 3); g.px(x + 16, y + 12, 3);
    g.px(x + 13, y + 16, 3); g.px(x + 16, y + 16, 3);
    g.px(x + 13, y + 20, 3); g.px(x + 16, y + 20, 3);

    // 3. Smoking Factory Chimney (Center-right: x+20..x+25, y+11..y+25)
    g.rect(x + 20, y + 16, 6, 10, 2);
    g.rect(x + 23, y + 11, 3, 5, 2);
    g.px(x + 23, y + 11, 3); g.px(x + 25, y + 11, 3);
    // Drifting chimney smoke puffs
    g.px(x + 24, y + 8, 2);
    g.rect(x + 22, y + 5, 2, 2, 1);
    g.px(x + 21, y + 3, 2);

    // 4. Power Pylon / Transmission Lattice (Far right: x+26..x+31, y+9..y+25)
    g.line(x + 28, y + 10, x + 26, y + 25, 2);
    g.line(x + 28, y + 10, x + 30, y + 25, 2);
    g.line(x + 26, y + 14, x + 30, y + 14, 3); // upper crossarm
    g.line(x + 25, y + 18, x + 31, y + 18, 3); // lower crossarm
    g.px(x + 28, y + 9, 3);                     // pylon apex
    g.line(x + 27, y + 21, x + 29, y + 21, 2);
  },

  // --------------------------------------------------------------------------
  // 2. TOOLS SPECIFICATION (7 BUILD TOOLS)
  // --------------------------------------------------------------------------
  TOOLS: [
    { id: 1, name: "ROAD", cost: 10,  label: "ROAD", desc: "TRAFFIC & POWER" },
    { id: 2, name: "RES",  cost: 30,  label: "RES",  desc: "HOMES (TIER 1-3)" },
    { id: 3, name: "COM",  cost: 40,  label: "COM",  desc: "SHOPS & OFFICES" },
    { id: 4, name: "IND",  cost: 50,  label: "IND",  desc: "FACTORIES & SMOG" },
    { id: 5, name: "PWR",  cost: 100, label: "PWR",  desc: "PLANT (24 TILES)" },
    { id: 6, name: "PARK", cost: 20,  label: "PARK", desc: "CLEANS SMOG +HAP" },
    { id: 7, name: "DOZ",  cost: 5,   label: "DOZ",  desc: "DEMOLISH TILE" }
  ],

  // Milestone Progression Thresholds
  MILESTONES: [
    { pop: 100,  title: "HAMLET",     bonus: 100 },
    { pop: 500,  title: "VILLAGE",    bonus: 250 },
    { pop: 1500, title: "TOWN",       bonus: 500 },
    { pop: 4000, title: "CITY",       bonus: 1000 },
    { pop: 8000, title: "METROPOLIS", bonus: 2500 }
  ],

  // --------------------------------------------------------------------------
  // 3. INITIALIZATION & STATE
  // --------------------------------------------------------------------------
  init() {
    // 8x8 Tile Grid Initialization
    this.grid = [];
    for (let y = 0; y < 8; y++) {
      const row = [];
      for (let x = 0; x < 8; x++) {
        row.push({
          type: 0,         // 0:NONE, 1:ROAD, 2:RES, 3:COM, 4:IND, 5:PWR, 6:PARK
          tier: 0,         // 0:zoned lot, 1:small, 2:medium, 3:dense highrise
          powered: false,  // conducted by power grid BFS
          hasRoad: false,  // connected to orthogonal road network
          abandoned: false,// deserted/ruined if unserviced or extreme smog
          abandonTimer: 0, // consecutive failed sim cycles
          pop: 0,          // resident count
          jobs: 0,         // worker capacity
          pollution: 0     // local smog level (0..4)
        });
      }
      this.grid.push(row);
    }

    // Grid cursor position (0..7)
    this.cx = 3;
    this.cy = 3;

    // Active tool index (0..6)
    this.selectedTool = 0; // ROAD by default

    // Difficulty-tuned starting treasury & parameters
    const diff = this.getDifficulty();
    this.cash = diff === 0 ? 600 : (diff === 2 ? 320 : 450);

    // City Statistics
    this.pop = 0;
    this.comJobs = 0;
    this.indJobs = 0;
    this.totJobs = 0;
    this.workforce = 0;
    this.happiness = 75; // 0..100%

    // RCI Demands (-100..+100)
    this.demandR = 60;
    this.demandC = 20;
    this.demandI = 40;

    // Power Grid Status
    this.powerPlants = 0;
    this.powerCapacity = 0;
    this.powerUsed = 0;

    // Budget Tracking
    this.lastTaxRev = 0;
    this.lastMaint = 0;
    this.lastNet = 0;
    this.bankruptcyGranted = false;

    // Calendar Clock
    this.year = 1;
    this.month = 1;
    this.simTimer = 0;
    this.simInterval = diff === 0 ? 3.0 : (diff === 2 ? 2.0 : 2.5);

    // Visual Timers & Day/Night
    this.dayNightTimer = 0;
    this.beaconBlinkTimer = 0;

    // Particles & Traffic
    this.particles = [];
    this.smokeSpawnTimer = 0;
    this.cars = [];
    this.carSpawnTimer = 0;

    // UI Overlays & Alerts
    this.milestoneIndex = 0;
    this.milestoneTitle = "HAMLET";
    this.bannerMsg = "";
    this.bannerTimer = 0;
    this.toastMsg = "";
    this.toastTimer = 0;
    this.floatingNotif = null;
    this.showLedger = false;

    // Initialize simulation matrices
    this.refreshSimulation();
  },

  getDifficulty() {
    return (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) ? VOS.difficulty : 1;
  },

  // --------------------------------------------------------------------------
  // 4. SIMULATION PIPELINE
  // --------------------------------------------------------------------------
  // Fast topological updates run immediately upon tile construction/bulldozing
  refreshSimulation() {
    this.calcRoadConnections();
    this.calcPowerGrid();
    this.calcPollution();
    this.calcDemand();
    this.calcHappiness();
  },

  // Comprehensive monthly simulation cycle
  runSimCycle() {
    // Advance municipal calendar
    this.month++;
    if (this.month > 12) {
      this.month = 1;
      this.year++;
    }

    // Step 1: Road & Power infrastructure audits
    this.calcRoadConnections();
    this.calcPowerGrid();

    // Step 2: Environmental smog propagation
    this.calcPollution();

    // Step 3: Economic RCI balances
    this.calcDemand();

    // Step 4: Happiness aggregation
    this.calcHappiness();

    // Step 5: Zone evolution / tier development
    this.evolveZones();

    // Step 6: Treasury & taxation
    this.collectTaxes();

    // Step 7: Milestone inspection & persistence
    this.checkMilestones();
  },

  // 4a. Power Propagation via BFS Flood-Fill
  calcPowerGrid() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        this.grid[y][x].powered = false;
      }
    }

    const queue = [];
    let plants = 0;

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const t = this.grid[y][x];
        if (t.type === 5) { // POWER PLANT
          plants++;
          t.powered = true;
          queue.push({ x, y });
        }
      }
    }

    this.powerPlants = plants;
    this.powerCapacity = plants * 32; // 32 megawatt tiles per plant

    const visited = new Set();
    for (let i = 0; i < queue.length; i++) {
      visited.add(queue[i].y * 8 + queue[i].x);
    }

    let poweredCount = plants;

    while (queue.length > 0) {
      const cur = queue.shift();
      const neighbors = [
        { x: cur.x, y: cur.y - 1 },
        { x: cur.x, y: cur.y + 1 },
        { x: cur.x - 1, y: cur.y },
        { x: cur.x + 1, y: cur.y }
      ];

      for (let i = 0; i < neighbors.length; i++) {
        const n = neighbors[i];
        if (n.x >= 0 && n.x < 8 && n.y >= 0 && n.y < 8) {
          const key = n.y * 8 + n.x;
          if (!visited.has(key)) {
            visited.add(key);
            const target = this.grid[n.y][n.x];
            // Infrastructure & buildings conduct electricity
            if (target.type > 0) {
              if (poweredCount < this.powerCapacity) {
                target.powered = true;
                poweredCount++;
              } else {
                target.powered = false; // Brownout!
              }
              queue.push({ x: n.x, y: n.y });
            }
          }
        }
      }
    }

    this.powerUsed = poweredCount;
  },

  // 4b. Road Network Adjacency Check
  calcRoadConnections() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const t = this.grid[y][x];
        if (t.type === 0 || t.type === 1) {
          t.hasRoad = true;
          continue;
        }
        let connected = false;
        const neighbors = [
          { x, y: y - 1 },
          { x, y: y + 1 },
          { x: x - 1, y },
          { x: x + 1, y }
        ];
        for (let i = 0; i < neighbors.length; i++) {
          const n = neighbors[i];
          if (n.x >= 0 && n.x < 8 && n.y >= 0 && n.y < 8) {
            if (this.grid[n.y][n.x].type === 1) { // Orthogonal ROAD
              connected = true;
              break;
            }
          }
        }
        t.hasRoad = connected;
      }
    }
  },

  // 4c. Smog Emission, Diffusion & Park Scrubbing
  calcPollution() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        this.grid[y][x].pollution = 0;
      }
    }

    // Industrial plants emit smog based on tier
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const t = this.grid[y][x];
        if (t.type === 4 && t.powered && t.hasRoad) { // Active Industrial
          const emit = t.tier === 3 ? 3 : (t.tier === 2 ? 2 : 1);
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const dist = Math.abs(dx) + Math.abs(dy);
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
                if (dist === 0) this.grid[ny][nx].pollution += emit;
                else if (dist === 1) this.grid[ny][nx].pollution += Math.max(1, emit - 1);
                else if (dist === 2 && emit >= 2) this.grid[ny][nx].pollution += 1;
              }
            }
          }
        } else if (t.type === 5) { // Power Plant generates light local soot
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
                this.grid[ny][nx].pollution += 1;
              }
            }
          }
        }
      }
    }

    // Parks scrub smog in a 2-tile radius
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const t = this.grid[y][x];
        if (t.type === 6) { // PARK
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const dist = Math.abs(dx) + Math.abs(dy);
              if (dist <= 2) {
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
                  this.grid[ny][nx].pollution = Math.max(0, this.grid[ny][nx].pollution - 2);
                }
              }
            }
          }
        }
      }
    }
  },

  // 4d. Macro RCI Demand Calculations
  calcDemand() {
    if (this.pop === 0) {
      this.demandR = 65;
      this.demandC = 20;
      this.demandI = 45;
      return;
    }

    // Residential demand: Surplus jobs attract citizens; unemployment repels them
    const jobSurplus = this.totJobs - this.workforce;
    let dR = 0;
    if (jobSurplus > 0) {
      dR = Math.min(85, Math.round((jobSurplus / Math.max(25, this.workforce)) * 100));
    } else {
      dR = Math.max(-65, Math.round((jobSurplus / Math.max(25, this.totJobs)) * 80));
    }
    if (this.happiness >= 75) dR += 20;
    else if (this.happiness < 45) dR -= 25;

    // Commercial demand: Driven by consumer population base vs store capacity
    let dC = 0;
    const shopperSurplus = this.pop - Math.round(this.comJobs * 1.5);
    if (shopperSurplus > 0) {
      dC = Math.min(80, Math.round((shopperSurplus / Math.max(30, this.pop)) * 90));
    } else {
      dC = Math.max(-55, Math.round((shopperSurplus / Math.max(30, this.comJobs * 1.5)) * 60));
    }

    // Industrial demand: Driven by available workforce looking for factory jobs
    let dI = 0;
    const laborSurplus = this.workforce - this.indJobs;
    if (laborSurplus > 0) {
      dI = Math.min(80, Math.round((laborSurplus / Math.max(30, this.workforce)) * 90));
    } else {
      dI = Math.max(-65, Math.round((laborSurplus / Math.max(30, this.indJobs)) * 70));
    }

    this.demandR = Math.max(-100, Math.min(100, dR));
    this.demandC = Math.max(-100, Math.min(100, dC));
    this.demandI = Math.max(-100, Math.min(100, dI));
  },

  // 4e. Happiness Aggregation
  calcHappiness() {
    let totalZones = 0;
    let poweredZones = 0;
    let roadedZones = 0;
    let resCount = 0;
    let totalResSmog = 0;
    let parkCount = 0;

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const t = this.grid[y][x];
        if (t.type >= 2 && t.type <= 5) {
          totalZones++;
          if (t.powered) poweredZones++;
          if (t.hasRoad) roadedZones++;
        }
        if (t.type === 2) {
          resCount++;
          totalResSmog += t.pollution;
        }
        if (t.type === 6) {
          parkCount++;
        }
      }
    }

    if (totalZones === 0) {
      this.happiness = 75;
      return;
    }

    // Grid service scores
    const pwrScore = (poweredZones / Math.max(1, totalZones)) * 30; // max 30 pts
    const roadScore = (roadedZones / Math.max(1, totalZones)) * 25; // max 25 pts

    // Environmental air quality penalty on residences
    const avgSmog = resCount > 0 ? (totalResSmog / resCount) : 0;
    const smogPenalty = Math.min(25, avgSmog * 10);

    // Park recreation bonus
    const parkBonus = Math.min(20, parkCount * 6);

    // Employment balance score
    let jobsScore = 20;
    if (this.workforce > 0) {
      const unemp = Math.max(0, this.workforce - this.totJobs) / this.workforce;
      if (unemp > 0.10) jobsScore -= Math.min(15, unemp * 25);
    }

    // Deficit debt penalty
    let deficitPenalty = 0;
    if (this.cash < 0) deficitPenalty = 15;

    let hap = Math.round(pwrScore + roadScore - smogPenalty + parkBonus + jobsScore - deficitPenalty);
    this.happiness = Math.max(5, Math.min(100, hap));
  },

  // 4f. Zone Tier Evolution & Abandonment
  evolveZones() {
    let totalPop = 0;
    let comJobs = 0;
    let indJobs = 0;

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const t = this.grid[y][x];

        // 1. RESIDENTIAL ZONES
        if (t.type === 2) {
          if (t.powered && t.hasRoad) {
            t.abandonTimer = 0;
            if (t.abandoned) {
              t.abandoned = false;
              t.tier = 1;
            }
            // Upgrades: Tier 1 Shack (25) -> Tier 2 Apts (120) -> Tier 3 Highrise (400)
            if (t.tier === 0 && this.demandR > 0) {
              t.tier = 1;
            } else if (t.tier === 1 && this.demandR > 15 && this.happiness >= 65 && t.pollution <= 1) {
              t.tier = 2;
            } else if (t.tier === 2 && this.demandR > 35 && this.happiness >= 80 && t.pollution === 0) {
              t.tier = 3;
            }
            // Downgrades if unhappy or toxic smog
            if (this.happiness < 35 || t.pollution >= 3) {
              if (Math.random() < 0.20) {
                if (t.tier > 1) t.tier--;
                else t.abandoned = true;
              }
            }
          } else {
            t.abandonTimer++;
            if (t.abandonTimer >= 3) t.abandoned = true;
          }
          t.pop = t.abandoned ? 0 : (t.tier === 3 ? 450 : (t.tier === 2 ? 120 : (t.tier === 1 ? 25 : 0)));
          totalPop += t.pop;
        }

        // 2. COMMERCIAL ZONES
        else if (t.type === 3) {
          if (t.powered && t.hasRoad) {
            t.abandonTimer = 0;
            if (t.abandoned) {
              t.abandoned = false;
              t.tier = 1;
            }
            if (t.tier === 0 && this.demandC > 0) {
              t.tier = 1;
            } else if (t.tier === 1 && this.demandC > 15 && this.happiness >= 60) {
              t.tier = 2;
            } else if (t.tier === 2 && this.demandC > 35 && this.happiness >= 75) {
              t.tier = 3;
            }
            if (this.happiness < 30) {
              if (Math.random() < 0.20) {
                if (t.tier > 1) t.tier--;
                else t.abandoned = true;
              }
            }
          } else {
            t.abandonTimer++;
            if (t.abandonTimer >= 3) t.abandoned = true;
          }
          t.jobs = t.abandoned ? 0 : (t.tier === 3 ? 250 : (t.tier === 2 ? 70 : (t.tier === 1 ? 15 : 0)));
          comJobs += t.jobs;
        }

        // 3. INDUSTRIAL ZONES
        else if (t.type === 4) {
          if (t.powered && t.hasRoad) {
            t.abandonTimer = 0;
            if (t.abandoned) {
              t.abandoned = false;
              t.tier = 1;
            }
            if (t.tier === 0 && this.demandI > 0) {
              t.tier = 1;
            } else if (t.tier === 1 && this.demandI > 15) {
              t.tier = 2;
            } else if (t.tier === 2 && this.demandI > 35) {
              t.tier = 3;
            }
            if (this.demandI < -30) {
              if (Math.random() < 0.20) {
                if (t.tier > 1) t.tier--;
                else t.abandoned = true;
              }
            }
          } else {
            t.abandonTimer++;
            if (t.abandonTimer >= 3) t.abandoned = true;
          }
          t.jobs = t.abandoned ? 0 : (t.tier === 3 ? 300 : (t.tier === 2 ? 90 : (t.tier === 1 ? 25 : 0)));
          indJobs += t.jobs;
        }
      }
    }

    this.pop = totalPop;
    this.comJobs = comJobs;
    this.indJobs = indJobs;
    this.totJobs = comJobs + indJobs;
    this.workforce = Math.round(this.pop * 0.60);
  },

  // 4g. Municipal Tax Collection & Maintenance Ledger
  collectTaxes() {
    let taxRev = 0;
    let powerMaint = 0;
    let roadMaint = 0;
    let parkMaint = 0;
    let roadCount = 0;
    let plantCount = 0;
    let parkCount = 0;

    const diff = this.getDifficulty();
    const plantCost = diff === 0 ? 8 : (diff === 2 ? 16 : 12);
    const roadCostRate = diff === 0 ? 0.25 : (diff === 2 ? 0.75 : 0.50);
    const parkCost = diff === 0 ? 1 : (diff === 2 ? 2 : 1);
    const taxMultiplier = diff === 0 ? 1.25 : (diff === 2 ? 0.85 : 1.0);

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const t = this.grid[y][x];
        if (t.powered && t.hasRoad && !t.abandoned) {
          if (t.type === 2) {
            taxRev += (t.tier === 3 ? 18 : (t.tier === 2 ? 6 : (t.tier === 1 ? 2 : 0)));
          } else if (t.type === 3) {
            taxRev += (t.tier === 3 ? 25 : (t.tier === 2 ? 9 : (t.tier === 1 ? 3 : 0)));
          } else if (t.type === 4) {
            taxRev += (t.tier === 3 ? 28 : (t.tier === 2 ? 10 : (t.tier === 1 ? 4 : 0)));
          }
        }
        if (t.type === 1) roadCount++;
        else if (t.type === 5) plantCount++;
        else if (t.type === 6) parkCount++;
      }
    }

    taxRev = Math.round(taxRev * taxMultiplier);
    powerMaint = plantCount * plantCost;
    roadMaint = Math.round(roadCount * roadCostRate);
    parkMaint = parkCount * parkCost;

    const totalMaint = powerMaint + roadMaint + parkMaint;
    const netIncome = taxRev - totalMaint;

    this.lastTaxRev = taxRev;
    this.lastMaint = totalMaint;
    this.lastNet = netIncome;
    this.cash += netIncome;

    // Visual floating revenue tag
    this.floatingNotif = {
      text: (netIncome >= 0 ? "+$" : "-$") + Math.abs(netIncome),
      color: netIncome >= 0 ? 3 : 1,
      x: 104,
      y: 12,
      timer: 2.2
    };

    if (netIncome > 0 && Math.random() < 0.35) APU.sfx('TICK');

    // Emergency restructuring grant if deep in debt
    if (this.cash < -100 && !this.bankruptcyGranted) {
      this.bankruptcyGranted = true;
      this.cash += 150;
      this.bannerMsg = "DISASTER GRANT +$150!";
      this.bannerTimer = 4.0;
      APU.sfx('ALARM');
    }
  },

  checkMilestones() {
    // Current civic rank based on population
    let rank = "HAMLET";
    if (this.pop >= 8000) rank = "METROPOLIS";
    else if (this.pop >= 4000) rank = "CITY";
    else if (this.pop >= 1500) rank = "TOWN";
    else if (this.pop >= 500) rank = "VILLAGE";
    this.milestoneTitle = rank;

    for (let i = 0; i < this.MILESTONES.length; i++) {
      const m = this.MILESTONES[i];
      if (this.pop >= m.pop && this.milestoneIndex < i + 1) {
        this.milestoneIndex = i + 1;
        this.cash += m.bonus;
        this.bannerMsg = "★ " + m.title + " REACHED! +$" + m.bonus + " ★";
        this.bannerTimer = 5.0;
        APU.sfx('LEVELUP');
      }
    }

    // Persist highest metropolitan population
    SAVE.setScore(this.id, this.pop);
  },

  // --------------------------------------------------------------------------
  // 5. CONSTRUCTION & DEMOLITION ACTION
  // --------------------------------------------------------------------------
  buildAt(tx, ty) {
    if (tx < 0 || tx > 7 || ty < 0 || ty > 7) return;
    const tool = this.TOOLS[this.selectedTool];
    const tile = this.grid[ty][tx];

    // Tool 7: Bulldozer ($5)
    if (tool.id === 7) {
      if (tile.type === 0) {
        APU.sfx('DENY');
        this.toastMsg = "EMPTY LOT";
        this.toastTimer = 1.2;
        return;
      }
      if (this.cash < tool.cost) {
        APU.sfx('DENY');
        this.toastMsg = "NEED $" + tool.cost;
        this.toastTimer = 1.2;
        return;
      }
      this.cash -= tool.cost;
      tile.type = 0;
      tile.tier = 0;
      tile.abandoned = false;
      tile.abandonTimer = 0;
      tile.pop = 0;
      tile.jobs = 0;
      tile.pollution = 0;
      APU.sfx('BOOM');
      PAD.vibrate(15);
      this.refreshSimulation();
      return;
    }

    // Placing infrastructure or zones (Tools 1..6)
    if (tile.type !== 0) {
      APU.sfx('DENY');
      this.toastMsg = "BULLDOZE FIRST";
      this.toastTimer = 1.2;
      return;
    }

    if (this.cash < tool.cost) {
      APU.sfx('DENY');
      this.toastMsg = "NEED $" + tool.cost;
      this.toastTimer = 1.2;
      return;
    }

    this.cash -= tool.cost;
    tile.type = tool.id;
    tile.tier = 0;
    tile.abandoned = false;
    tile.abandonTimer = 0;
    tile.pop = 0;
    tile.jobs = 0;

    if (tool.id === 5) APU.sfx('POWER');
    else if (tool.id === 6) APU.sfx('UI_OK');
    else APU.sfx('COIN');

    PAD.vibrate(10);
    this.refreshSimulation();
  },

  // --------------------------------------------------------------------------
  // 6. UPDATE LOOP (INPUTS, DYNAMICS & CYCLES)
  // --------------------------------------------------------------------------
  update(dt) {
    // Clamp delta-time to avoid physics or simulation spikes
    dt = Math.min(0.2, dt);

    // Dynamic timers
    this.dayNightTimer = (this.dayNightTimer + dt) % 24;
    this.beaconBlinkTimer = (this.beaconBlinkTimer + dt) % 1.0;

    if (this.bannerTimer > 0) this.bannerTimer -= dt;
    if (this.toastTimer > 0) this.toastTimer -= dt;

    if (this.floatingNotif) {
      this.floatingNotif.timer -= dt;
      this.floatingNotif.y -= dt * 3;
      if (this.floatingNotif.timer <= 0) this.floatingNotif = null;
    }

    // Simulation cycle clock
    this.simTimer += dt;
    let simSteps = 0;
    while (this.simTimer >= this.simInterval && simSteps < 3) {
      this.simTimer -= this.simInterval;
      this.runSimCycle();
      simSteps++;
    }
    if (this.simTimer >= this.simInterval) this.simTimer = 0;

    // Particles & Traffic
    this.updateParticles(dt);
    this.updateTraffic(dt);

    // Input Handling
    this.handleTouchInput();
    this.handleGamepadInput();
  },

  handleTouchInput() {
    if (!PAD.tapPos) return;
    const tap = PAD.tapPos;

    // 1. Dismiss Ledger modal if active
    if (this.showLedger) {
      this.showLedger = false;
      APU.sfx('UI_BACK');
      return;
    }

    // 2. Tap Top HUD (y: 0..24) -> Open Ledger
    if (tap.y < 25) {
      this.showLedger = true;
      APU.sfx('UI_OK');
      return;
    }

    // 3. Tap Right Panel [LEDGER] Button (x: 210..255, y: 154..184)
    if (tap.x >= 210 && tap.x <= 255 && tap.y >= 154 && tap.y <= 184) {
      this.showLedger = true;
      APU.sfx('UI_OK');
      return;
    }

    // 4. Tap Left Panel Difficulty Selector (x: 4..44, y: 166..184)
    if (tap.x >= 4 && tap.x <= 44 && tap.y >= 166 && tap.y <= 184) {
      if (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) {
        VOS.difficulty = (VOS.difficulty + 1) % 3;
        const diff = this.getDifficulty();
        this.simInterval = diff === 0 ? 3.0 : (diff === 2 ? 2.0 : 2.5);
      }
      APU.sfx('UI_MOVE');
      return;
    }

    // 5. Tap Bottom Toolbar Buttons (y: 188..240)
    if (tap.y >= 188 && tap.y <= 240) {
      for (let i = 0; i < 7; i++) {
        const bx = 5 + i * 36;
        if (tap.x >= bx && tap.x < bx + 34) {
          this.selectedTool = i;
          APU.sfx('UI_MOVE');
          PAD.vibrate(8);
          return;
        }
      }
    }

    // 6. Direct Tap on 8x8 Grid (x: 48..208, y: 26..186)
    if (tap.x >= 48 && tap.x < 208 && tap.y >= 26 && tap.y < 186) {
      const tx = Math.floor((tap.x - 48) / 20);
      const ty = Math.floor((tap.y - 26) / 20);
      if (tx >= 0 && tx < 8 && ty >= 0 && ty < 8) {
        this.cx = tx;
        this.cy = ty;
        this.buildAt(tx, ty);
      }
    }
  },

  handleGamepadInput() {
    if (this.showLedger) {
      if (PAD.hit('b') || PAD.hit('select') || PAD.hit('start') || PAD.hit('a')) {
        this.showLedger = false;
        APU.sfx('UI_BACK');
      }
      return;
    }

    // D-Pad Cursor Navigation
    if (PAD.hit('left'))  { this.cx = Math.max(0, this.cx - 1); APU.sfx('UI_MOVE'); }
    if (PAD.hit('right')) { this.cx = Math.min(7, this.cx + 1); APU.sfx('UI_MOVE'); }
    if (PAD.hit('up'))    { this.cy = Math.max(0, this.cy - 1); APU.sfx('UI_MOVE'); }
    if (PAD.hit('down'))  { this.cy = Math.min(7, this.cy + 1); APU.sfx('UI_MOVE'); }

    // [B] Cycle Build Tool
    if (PAD.hit('b')) {
      this.selectedTool = (this.selectedTool + 1) % 7;
      APU.sfx('UI_MOVE');
      PAD.vibrate(6);
    }

    // [A] Build / Bulldoze on cursor
    if (PAD.hit('a')) {
      this.buildAt(this.cx, this.cy);
    }

    // [SELECT] or [START] Toggle Ledger Modal
    if (PAD.hit('select') || PAD.hit('start')) {
      this.showLedger = true;
      APU.sfx('UI_OK');
    }
  },

  // --------------------------------------------------------------------------
  // 7. PARTICLES & VEHICLE TRAFFIC SIMULATION
  // --------------------------------------------------------------------------
  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    this.smokeSpawnTimer += dt;
    if (this.smokeSpawnTimer >= 0.35) {
      this.smokeSpawnTimer = 0;
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const t = this.grid[y][x];
          if ((t.type === 4 && t.tier > 0 && t.powered && t.hasRoad) || t.type === 5) {
            if (Math.random() < 0.45 && this.particles.length < 24) {
              const bx = 48 + x * 20;
              const by = 26 + y * 20;
              this.particles.push({
                x: bx + (t.type === 5 ? 16 : (t.tier === 3 ? 16 : (t.tier === 2 ? 14 : 5))),
                y: by + 2,
                vx: (Math.random() - 0.3) * 6,
                vy: -10 - Math.random() * 8,
                life: 0,
                maxLife: 1.2 + Math.random() * 0.5
              });
            }
          }
        }
      }
    }
  },

  updateTraffic(dt) {
    // Spawn car on road network
    this.carSpawnTimer += dt;
    if (this.carSpawnTimer >= 1.4 && this.cars.length < 6) {
      this.carSpawnTimer = 0;
      const roadTiles = [];
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          if (this.grid[y][x].type === 1) roadTiles.push({ x, y });
        }
      }
      if (roadTiles.length > 0) {
        const start = roadTiles[Math.floor(Math.random() * roadTiles.length)];
        this.cars.push({
          tx: start.x,
          ty: start.y,
          px: 48 + start.x * 20 + 9,
          py: 26 + start.y * 20 + 9,
          dir: 'E',
          speed: 20 + Math.random() * 10,
          color: Math.random() < 0.65 ? 3 : 2
        });
      }
    }

    // Advance traffic along road lanes
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const car = this.cars[i];
      if (this.grid[car.ty][car.tx].type !== 1) {
        this.cars.splice(i, 1);
        continue;
      }

      const targetPx = 48 + car.tx * 20 + 9;
      const targetPy = 26 + car.ty * 20 + 9;
      const dist = Math.hypot(car.px - targetPx, car.py - targetPy);

      if (dist < 2.5) {
        const candidates = [];
        const dirs = [
          { d: 'N', dx: 0, dy: -1, opp: 'S' },
          { d: 'S', dx: 0, dy: 1,  opp: 'N' },
          { d: 'W', dx: -1, dy: 0, opp: 'E' },
          { d: 'E', dx: 1,  dy: 0, opp: 'W' }
        ];
        for (let j = 0; j < dirs.length; j++) {
          const d = dirs[j];
          const nx = car.tx + d.dx, ny = car.ty + d.dy;
          if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
            if (this.grid[ny][nx].type === 1) candidates.push(d);
          }
        }
        if (candidates.length === 0) {
          this.cars.splice(i, 1);
          continue;
        }
        const nonReverse = candidates.filter(c => c.opp !== car.dir);
        const chosen = (nonReverse.length > 0)
          ? nonReverse[Math.floor(Math.random() * nonReverse.length)]
          : candidates[0];

        car.dir = chosen.d;
        car.tx += chosen.dx;
        car.ty += chosen.dy;
      }

      if (car.dir === 'N') car.py -= car.speed * dt;
      else if (car.dir === 'S') car.py += car.speed * dt;
      else if (car.dir === 'W') car.px -= car.speed * dt;
      else if (car.dir === 'E') car.px += car.speed * dt;
    }
  },

  // --------------------------------------------------------------------------
  // 8. GRAPHICS RENDERING PIPELINE
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    const isNight = (this.dayNightTimer % 24) >= 12;

    // 1. Top Municipal HUD
    this.renderTopHUD(g);

    // 2. Left Telemetry Panel (RCI, Smog, Day/Night, Difficulty)
    this.renderLeftPanel(g, isNight);

    // 3. Central 8x8 Grid Playfield
    this.renderGrid(g, isNight);

    // 4. Moving Traffic Cars & Smoke Puffs
    this.renderTrafficAndSmoke(g);

    // 5. Right Selected Tile Card & Ledger Button
    this.renderRightPanel(g);

    // 6. Bottom Build Toolbar
    this.renderToolbar(g);

    // 7. Overlays (Alert Banner, Toast, Ledger Modal)
    this.renderOverlays(g);
  },

  // 8a. Top Municipal HUD
  renderTopHUD(g) {
    g.rect(0, 0, 256, 24, 0);
    g.line(0, 24, 255, 24, 1);

    // Row 1 (y: 3): Milestone, Date, Treasury, Population
    const title = this.milestoneTitle;
    g.text(title, 4, 3, 3);

    const monthStr = (this.month < 10 ? "0" : "") + this.month;
    const yearStr = (this.year < 10 ? "0" : "") + this.year;
    g.text("Y" + yearStr + "/M" + monthStr, 56, 3, 2);

    g.text("$" + this.cash, 106, 3, this.cash < 0 ? 1 : 3);
    g.textR("POP: " + this.pop.toLocaleString(), 252, 3, 3);

    // Row 2 (y: 13): Happiness, Power Grid, Floating Income
    g.text("HAP:" + this.happiness + "%", 4, 13, this.happiness >= 65 ? 3 : (this.happiness >= 40 ? 2 : 1));

    const pwrColor = (this.powerUsed <= this.powerCapacity && this.powerCapacity > 0) ? 3 : (this.powerCapacity === 0 ? 1 : 2);
    g.text("PWR:" + this.powerUsed + "/" + this.powerCapacity, 56, 13, pwrColor);

    if (this.floatingNotif) {
      g.text(this.floatingNotif.text, this.floatingNotif.x, this.floatingNotif.y | 0, this.floatingNotif.color);
    }
  },

  // 8b. Left Telemetry Panel (RCI Demand & Environment)
  renderLeftPanel(g, isNight) {
    g.rect(0, 25, 46, 162, 0);
    g.line(46, 25, 46, 186, 1);

    // RCI Demand Meters
    g.text("DEMAND", 6, 27, 2);
    g.text("R", 10, 36, 3);
    g.text("C", 22, 36, 2);
    g.text("I", 34, 36, 1);

    // Zero baseline at y: 62 (height 20 up, 20 down)
    const baseY = 62;
    g.line(8, baseY, 39, baseY, 1);

    const drawDemandBar = (val, colX, color) => {
      const h = Math.round((Math.abs(val) / 100) * 18);
      if (h > 0) {
        if (val >= 0) {
          g.rect(colX, baseY - h, 5, h, color);
        } else {
          g.rect(colX, baseY + 1, 5, h, 1);
        }
      }
    };
    drawDemandBar(this.demandR, 8, 3);
    drawDemandBar(this.demandC, 20, 2);
    drawDemandBar(this.demandI, 32, 3);

    // Smog Gauge
    g.text("SMOG", 10, 86, 2);
    let totalSmog = 0;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) totalSmog += this.grid[y][x].pollution;
    }
    const smogPips = Math.min(4, Math.floor(totalSmog / 4));
    for (let i = 0; i < 4; i++) {
      const bx = 8 + i * 8;
      if (i < smogPips) g.rect(bx, 96, 6, 4, 3);
      else g.box(bx, 96, 6, 4, 1);
    }

    // Day / Night Indicator
    if (isNight) {
      // Crescent Moon icon
      g.circle(23, 118, 5, 2);
      g.disc(21, 117, 4, 0);
      g.text("NIGHT", 9, 127, 1);
    } else {
      // Sun icon
      g.disc(23, 118, 4, 3);
      g.line(23, 112, 23, 124, 2);
      g.line(17, 118, 29, 118, 2);
      g.text("DAY", 13, 127, 3);
    }

    // Difficulty Indicator (Tap to cycle)
    const diff = this.getDifficulty();
    const diffNames = ["EASY", "NORM", "HARD"];
    g.rect(4, 168, 38, 14, 1);
    g.box(4, 168, 38, 14, 2);
    g.textC(diffNames[diff], 172, 3);
  },

  // 8c. Central 8x8 Grid Playfield
  renderGrid(g, isNight) {
    const ox = 48, oy = 26, sz = 20;

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const bx = ox + x * sz;
        const by = oy + y * sz;
        const t = this.grid[y][x];

        // Background terrain box
        g.rect(bx, by, sz, sz, 0);
        g.box(bx, by, sz, sz, 1);

        // Render Tile Artwork by Type
        if (t.type === 0) {
          this.renderEmptyTile(g, bx, by);
        } else if (t.type === 1) {
          this.renderRoadTile(g, bx, by, x, y);
        } else if (t.type === 2) {
          this.renderResTile(g, bx, by, t, isNight);
        } else if (t.type === 3) {
          this.renderComTile(g, bx, by, t, isNight);
        } else if (t.type === 4) {
          this.renderIndTile(g, bx, by, t);
        } else if (t.type === 5) {
          this.renderPowerTile(g, bx, by);
        } else if (t.type === 6) {
          this.renderParkTile(g, bx, by);
        }

        // Service Warning Badges
        if (t.type >= 2 && t.type <= 5) {
          // Unpowered Flashing Badge (top-right)
          if (!t.powered && (this.beaconBlinkTimer < 0.5)) {
            g.px(bx + 17, by + 1, 3);
            g.line(bx + 15, by + 2, bx + 16, by + 2, 3);
            g.px(bx + 15, by + 3, 3);
            g.line(bx + 14, by + 4, bx + 16, by + 4, 3);
            g.px(bx + 15, by + 5, 3);
          }
          // No Road Flashing Badge (top-left)
          if (!t.hasRoad && (this.beaconBlinkTimer < 0.5)) {
            g.rect(bx + 2, by + 1, 2, 4, 3);
            g.px(bx + 2, by + 6, 3);
          }
        }

        // Active Cursor Reticle
        if (x === this.cx && y === this.cy) {
          const cCol = (this.beaconBlinkTimer < 0.5) ? 3 : 2;
          // 4-corner brackets
          g.line(bx - 1, by - 1, bx + 3, by - 1, cCol);
          g.line(bx - 1, by - 1, bx - 1, by + 3, cCol);
          g.line(bx + sz, by - 1, bx + sz - 4, by - 1, cCol);
          g.line(bx + sz, by - 1, bx + sz, by + 3, cCol);
          g.line(bx - 1, by + sz, bx + 3, by + sz, cCol);
          g.line(bx - 1, by + sz, bx - 1, by + sz - 4, cCol);
          g.line(bx + sz, by + sz, bx + sz - 4, by + sz, cCol);
          g.line(bx + sz, by + sz, bx + sz, by + sz - 4, cCol);
        }
      }
    }
  },

  // Tile Sprite: Vacant Lot (EMPTY)
  renderEmptyTile(g, bx, by) {
    g.px(bx + 5, by + 6, 1);
    g.px(bx + 14, by + 13, 1);
  },

  // Tile Sprite: Connected Asphalt Road with Dashed Centerlines
  renderRoadTile(g, bx, by, x, y) {
    // Check 4 orthogonal neighbors for connected road
    const n = (y > 0 && this.grid[y - 1][x].type === 1);
    const s = (y < 7 && this.grid[y + 1][x].type === 1);
    const w = (x > 0 && this.grid[y][x - 1].type === 1);
    const e = (x < 7 && this.grid[y][x + 1].type === 1);

    // Asphalt surface
    g.rect(bx + 4, by + 4, 12, 12, 1);
    if (n) g.rect(bx + 4, by, 12, 4, 1);
    if (s) g.rect(bx + 4, by + 16, 12, 4, 1);
    if (w) g.rect(bx, by + 4, 4, 12, 1);
    if (e) g.rect(bx + 16, by + 4, 4, 12, 1);

    // Curbs along edges with no connected road
    if (!n) g.line(bx + 4, by + 3, bx + 15, by + 3, 2);
    if (!s) g.line(bx + 4, by + 16, bx + 15, by + 16, 2);
    if (!w) g.line(bx + 3, by + 4, bx + 3, by + 15, 2);
    if (!e) g.line(bx + 16, by + 4, bx + 16, by + 15, 2);

    // Center Dashes (White / Bright Green)
    g.rect(bx + 9, by + 9, 2, 2, 3);
    if (n) g.rect(bx + 9, by + 2, 2, 3, 3);
    if (s) g.rect(bx + 9, by + 15, 2, 3, 3);
    if (w) g.rect(bx + 2, by + 9, 3, 2, 3);
    if (e) g.rect(bx + 15, by + 9, 3, 2, 3);
  },

  // Tile Sprite: Residential (Tier 0 Zoned -> Tier 1 Shack -> Tier 2 Apts -> Tier 3 Condo Tower)
  renderResTile(g, bx, by, t, isNight) {
    if (t.abandoned) {
      // Abandoned / Ruined Shack
      g.box(bx + 3, by + 6, 14, 11, 1);
      g.line(bx + 5, by + 8, bx + 15, by + 15, 1);
      g.line(bx + 15, by + 8, bx + 5, by + 15, 1);
      return;
    }

    if (t.tier === 0) {
      // Zoned Lot blueprint
      g.box(bx + 2, by + 2, 16, 16, 2);
      g.text("R", bx + 8, by + 7, 2);
      return;
    }

    if (t.tier === 1) {
      // Suburban Cottage / Shack
      g.line(bx + 3, by + 8, bx + 9, by + 3, 3);
      g.line(bx + 9, by + 3, bx + 16, by + 8, 3);
      g.px(bx + 9, by + 3, 3);
      // House facade
      g.rect(bx + 4, by + 9, 12, 8, 2);
      // Front door & glowing window
      g.rect(bx + 9, by + 12, 3, 5, 0);
      g.px(bx + 6, by + 11, (isNight ? 3 : 2));
      // Chimney
      g.rect(bx + 13, by + 4, 2, 4, 2);
      return;
    }

    if (t.tier === 2) {
      // Brick Apartment Building
      g.rect(bx + 3, by + 3, 14, 15, 2);
      g.box(bx + 3, by + 3, 14, 15, 3);
      // Windows (2 rows of 3)
      const winCol = isNight ? 3 : 0;
      g.px(bx + 5, by + 6, winCol);  g.px(bx + 9, by + 6, winCol);  g.px(bx + 13, by + 6, winCol);
      g.px(bx + 5, by + 10, winCol); g.px(bx + 9, by + 10, winCol); g.px(bx + 13, by + 10, winCol);
      // Main Entrance
      g.rect(bx + 8, by + 14, 4, 4, 0);
      return;
    }

    if (t.tier === 3) {
      // Highrise Modernist Condos
      g.rect(bx + 2, by + 2, 16, 16, 1);
      g.box(bx + 2, by + 2, 16, 16, 3);
      // Penthouse step
      g.rect(bx + 5, by, 10, 3, 2);
      // Roof antenna with blinking beacon
      g.line(bx + 9, by - 2, bx + 9, by + 1, 3);
      if (this.beaconBlinkTimer < 0.5) g.px(bx + 9, by - 2, 3);
      // Grid of windows
      const winC = isNight ? 3 : 2;
      for (let wy = by + 4; wy <= by + 14; wy += 4) {
        g.px(bx + 5, wy, winC); g.px(bx + 9, wy, winC); g.px(bx + 13, wy, winC);
      }
    }
  },

  // Tile Sprite: Commercial (Tier 0 Zoned -> Tier 1 Shop -> Tier 2 Plaza -> Tier 3 Megatower)
  renderComTile(g, bx, by, t, isNight) {
    if (t.abandoned) {
      g.box(bx + 2, by + 4, 16, 14, 1);
      g.line(bx + 4, by + 6, bx + 16, by + 16, 1);
      return;
    }

    if (t.tier === 0) {
      g.box(bx + 2, by + 2, 16, 16, 2);
      g.text("C", bx + 8, by + 7, 2);
      return;
    }

    if (t.tier === 1) {
      // Corner Deli / Shop with Striped Awning
      g.rect(bx + 3, by + 5, 14, 12, 1);
      g.box(bx + 3, by + 5, 14, 12, 2);
      // Striped Awning
      for (let ax = bx + 3; ax <= bx + 16; ax += 2) g.px(ax, by + 8, 3);
      g.line(bx + 3, by + 9, bx + 16, by + 9, 3);
      // Storefront glass & door
      g.rect(bx + 5, by + 11, 4, 4, isNight ? 3 : 2);
      g.rect(bx + 11, by + 11, 3, 6, 0);
      return;
    }

    if (t.tier === 2) {
      // Commercial Office Plaza
      g.rect(bx + 2, by + 3, 16, 15, 2);
      g.box(bx + 2, by + 3, 16, 15, 3);
      // Wide ribbon display windows
      const wC = isNight ? 3 : 1;
      g.line(bx + 4, by + 6, bx + 15, by + 6, wC);
      g.line(bx + 4, by + 10, bx + 15, by + 10, wC);
      // Rooftop billboard / sign
      g.rect(bx + 5, by + 1, 10, 3, 3);
      g.rect(bx + 8, by + 14, 4, 4, 0);
      return;
    }

    if (t.tier === 3) {
      // Sleek Financial Skyscraper
      g.rect(bx + 3, by + 1, 14, 17, 1);
      g.box(bx + 3, by + 1, 14, 17, 3);
      // Communications spire
      g.line(bx + 9, by - 2, bx + 9, by + 1, 2);
      if (this.beaconBlinkTimer < 0.5) g.px(bx + 9, by - 2, 3);
      // Exterior cross-bracing (X-girder motif)
      g.line(bx + 4, by + 3, bx + 15, by + 15, 2);
      g.line(bx + 15, by + 3, bx + 4, by + 15, 2);
      // Glowing ticker band across mid-level
      g.line(bx + 4, by + 9, bx + 15, by + 9, isNight ? 3 : 2);
    }
  },

  // Tile Sprite: Industrial (Tier 0 Zoned -> Tier 1 Workshop -> Tier 2 Factory -> Tier 3 Refinery)
  renderIndTile(g, bx, by, t) {
    if (t.abandoned) {
      g.box(bx + 2, by + 6, 16, 12, 1);
      g.line(bx + 4, by + 8, bx + 16, by + 16, 1);
      return;
    }

    if (t.tier === 0) {
      g.box(bx + 2, by + 2, 16, 16, 2);
      g.text("I", bx + 8, by + 7, 2);
      return;
    }

    if (t.tier === 1) {
      // Workshop with single chimney stack
      g.rect(bx + 3, by + 7, 14, 10, 2);
      g.box(bx + 3, by + 7, 14, 10, 3);
      // Chimney stack
      g.rect(bx + 4, by + 2, 3, 6, 2);
      g.px(bx + 4, by + 2, 3); g.px(bx + 6, by + 2, 3);
      // Cargo freight roll-up door
      g.rect(bx + 9, by + 11, 6, 6, 0);
      g.line(bx + 9, by + 13, bx + 14, by + 13, 2);
      return;
    }

    if (t.tier === 2) {
      // Manufacturing Plant with Sawtooth Roofline
      g.rect(bx + 2, by + 6, 16, 12, 1);
      g.box(bx + 2, by + 6, 16, 12, 2);
      // Sawtooth roof peaks
      g.line(bx + 2, by + 6, bx + 6, by + 2, 3);
      g.line(bx + 6, by + 2, bx + 6, by + 6, 3);
      g.line(bx + 6, by + 6, bx + 10, by + 2, 3);
      g.line(bx + 10, by + 2, bx + 10, by + 6, 3);
      // Twin chimneys
      g.rect(bx + 13, by + 2, 2, 5, 2);
      g.rect(bx + 16, by + 3, 2, 4, 2);
      return;
    }

    if (t.tier === 3) {
      // Heavy Industrial Chemical Refinery
      g.rect(bx + 2, by + 6, 16, 12, 1);
      // Cylindrical Chemical Storage Tank
      g.rect(bx + 2, by + 8, 6, 10, 2);
      g.disc(bx + 5, by + 8, 2, 3);
      // Central fractionating distillation column
      g.rect(bx + 9, by + 3, 4, 15, 2);
      g.line(bx + 9, by + 7, bx + 12, by + 7, 3);
      // Tall flarestack pipe
      g.line(bx + 16, by, bx + 16, by + 16, 3);
      g.px(bx + 16, by, 3);
    }
  },

  // Tile Sprite: High-Voltage Power Plant
  renderPowerTile(g, bx, by) {
    g.rect(bx + 2, by + 3, 16, 15, 1);
    g.box(bx + 2, by + 3, 16, 15, 3);

    // Transformer insulators on roof
    g.px(bx + 4, by + 1, 3); g.line(bx + 4, by + 1, bx + 4, by + 3, 2);
    g.px(bx + 8, by + 1, 3); g.line(bx + 8, by + 1, bx + 8, by + 3, 2);
    g.px(bx + 12, by + 1, 3); g.line(bx + 12, by + 1, bx + 12, by + 3, 2);

    // Painted High-Voltage Lightning Bolt Crest
    g.px(bx + 10, by + 7, 3);
    g.line(bx + 8, by + 8, bx + 9, by + 8, 3);
    g.px(bx + 7, by + 9, 3);
    g.line(bx + 6, by + 10, bx + 10, by + 10, 3);
    g.px(bx + 8, by + 11, 3);
    g.px(bx + 7, by + 12, 3);

    // Cooling vent grates
    g.line(bx + 4, by + 15, bx + 14, by + 15, 2);
  },

  // Tile Sprite: Public Park & Splashing Fountain
  renderParkTile(g, bx, by) {
    // Cross cobblestone path
    g.rect(bx + 8, by + 1, 4, 18, 1);
    g.rect(bx + 1, by + 8, 18, 4, 1);

    // Lush Trees with round leafy canopy
    g.disc(bx + 5, by + 5, 3, 2);
    g.px(bx + 5, by + 5, 3);
    g.disc(bx + 15, by + 15, 3, 2);
    g.px(bx + 15, by + 15, 3);

    // Center Circular Fountain Basin
    g.circle(bx + 10, by + 10, 3, 3);
    g.px(bx + 10, by + 10, (this.beaconBlinkTimer < 0.5) ? 3 : 2);
  },

  // 8d. Smoke Puffs & Moving Traffic Cars
  renderTrafficAndSmoke(g) {
    // Moving Car Sprites (2x2 pixel vehicles)
    for (let i = 0; i < this.cars.length; i++) {
      const car = this.cars[i];
      const cx = Math.round(car.px);
      const cy = Math.round(car.py);
      g.rect(cx, cy, 2, 2, car.color);
      // Headlight dot
      if (car.dir === 'E') g.px(cx + 2, cy, 3);
      else if (car.dir === 'W') g.px(cx - 1, cy, 3);
      else if (car.dir === 'S') g.px(cx, cy + 2, 3);
      else if (car.dir === 'N') g.px(cx, cy - 1, 3);
    }

    // Drifting Smoke Puff Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const px = Math.round(p.x);
      const py = Math.round(p.y);
      const prog = p.life / p.maxLife;
      if (prog < 0.4) {
        g.px(px, py, 3);
      } else if (prog < 0.75) {
        g.rect(px, py, 2, 2, 2);
      } else {
        g.px(px, py, 1);
      }
    }
  },

  // 8e. Right Inspector Panel & City Ledger Action
  renderRightPanel(g) {
    g.rect(210, 25, 46, 162, 0);
    g.line(210, 25, 210, 186, 1);

    g.text("TILE", 220, 27, 2);
    g.text("(" + this.cx + "," + this.cy + ")", 218, 37, 3);

    const t = this.grid[this.cy][this.cx];
    const typeNames = ["EMPTY", "ROAD", "RES", "COM", "IND", "POWER", "PARK"];
    const nameStr = t.abandoned ? "RUINS" : (typeNames[t.type] + (t.tier > 0 ? " T" + t.tier : ""));
    g.text(nameStr, 213, 50, t.abandoned ? 1 : 3);

    // Services
    if (t.type >= 2 && t.type <= 5) {
      g.text("PWR:" + (t.powered ? "OK" : "NO"), 213, 64, t.powered ? 3 : 1);
      g.text("RD: " + (t.hasRoad ? "OK" : "NO"), 213, 75, t.hasRoad ? 3 : 1);
    } else {
      g.text("PWR:--", 213, 64, 1);
      g.text("RD: --", 213, 75, 1);
    }

    // Capacity / Jobs
    if (t.type === 2) g.text("P:" + t.pop, 213, 89, 3);
    else if (t.type === 3 || t.type === 4) g.text("J:" + t.jobs, 213, 89, 2);
    else g.text("P/J: 0", 213, 89, 1);

    // Local Smog
    g.text("SMOG:" + t.pollution, 213, 103, t.pollution > 0 ? 1 : 2);

    // Ledger Modal Touch Button
    g.rect(213, 154, 40, 28, 1);
    g.box(213, 154, 40, 28, 2);
    g.text("CITY", 220, 158, 3);
    g.text("LEDGER", 215, 168, 3);
  },

  // 8f. Bottom 7-Tool Selection Bar
  renderToolbar(g) {
    g.rect(0, 188, 256, 52, 0);
    g.line(0, 187, 255, 187, 1);

    for (let i = 0; i < this.TOOLS.length; i++) {
      const tool = this.TOOLS[i];
      const bx = 5 + i * 36;
      const by = 191;
      const bw = 34;
      const bh = 46;
      const isSel = (this.selectedTool === i);

      // Button background and frame
      g.rect(bx, by, bw, bh, isSel ? 1 : 0);
      g.box(bx, by, bw, bh, isSel ? 3 : 2);

      // Mini Tool Icon (16x14 pixel art centered at bx + 9, by + 4)
      const ix = bx + 9;
      const iy = by + 4;
      if (i === 0) {
        // ROAD icon
        g.rect(ix + 4, iy + 1, 8, 12, 1);
        g.line(ix + 8, iy + 2, ix + 8, iy + 12, 3);
      } else if (i === 1) {
        // RES icon
        g.line(ix + 2, iy + 6, ix + 8, iy + 1, 3);
        g.line(ix + 8, iy + 1, ix + 14, iy + 6, 3);
        g.rect(ix + 4, iy + 7, 8, 6, 2);
        g.px(ix + 8, iy + 9, 3);
      } else if (i === 2) {
        // COM icon
        g.rect(ix + 3, iy + 3, 10, 10, 1);
        g.box(ix + 3, iy + 3, 10, 10, 2);
        g.line(ix + 3, iy + 6, ix + 12, iy + 6, 3);
        g.px(ix + 6, iy + 9, 3);
      } else if (i === 3) {
        // IND icon
        g.rect(ix + 2, iy + 5, 12, 8, 2);
        g.rect(ix + 3, iy + 2, 3, 4, 3);
        g.px(ix + 4, iy + 1, 2);
      } else if (i === 4) {
        // PWR icon
        g.px(ix + 9, iy + 2, 3);
        g.line(ix + 7, iy + 3, ix + 8, iy + 3, 3);
        g.line(ix + 5, iy + 6, ix + 11, iy + 6, 3);
        g.px(ix + 8, iy + 8, 3);
        g.px(ix + 7, iy + 11, 3);
      } else if (i === 5) {
        // PARK icon
        g.disc(ix + 8, iy + 6, 4, 2);
        g.px(ix + 8, iy + 6, 3);
        g.line(ix + 8, iy + 10, ix + 8, iy + 13, 1);
      } else if (i === 6) {
        // BULLDOZER icon
        g.rect(ix + 2, iy + 7, 8, 5, 2);
        g.line(ix + 10, iy + 5, ix + 14, iy + 12, 3);
        g.circle(ix + 5, iy + 12, 2, 3);
      }

      // Name & Cost
      g.textC(tool.label, by + 21, isSel ? 3 : 2, 1);
      // Manual center for button width
      const nameW = tool.label.length * 5 - 1;
      g.text(tool.label, bx + Math.floor((bw - nameW) / 2), by + 22, isSel ? 3 : 2);

      const costStr = "$" + tool.cost;
      const costW = costStr.length * 5 - 1;
      g.text(costStr, bx + Math.floor((bw - costW) / 2), by + 34, isSel ? 3 : 1);
    }
  },

  // 8g. Modals, Alerts & Ledger Breakdown
  renderOverlays(g) {
    // 1. Toast / Alert Message
    if (this.toastTimer > 0) {
      const tw = (this.toastMsg.length * 5) + 8;
      const tx = Math.floor((256 - tw) / 2);
      g.rect(tx, 76, tw, 14, 0);
      g.box(tx, 76, tw, 14, 3);
      g.textC(this.toastMsg, 80, 3);
    }

    // 2. Grand Milestone Banner
    if (this.bannerTimer > 0) {
      g.rect(12, 40, 232, 22, 0);
      g.box(12, 40, 232, 22, 3);
      g.box(14, 42, 228, 18, 2);
      g.textC(this.bannerMsg, 47, 3);
    }

    // 3. Metropolitan Ledger Dialog Modal
    if (this.showLedger) {
      const lx = 14, ly = 16, lw = 228, lh = 208;
      g.rect(lx, ly, lw, lh, 0);
      g.box(lx, ly, lw, lh, 3);
      g.box(lx + 2, ly + 2, lw - 4, lh - 4, 1);

      g.textC("--- METROPOLITAN LEDGER ---", ly + 8, 3);
      g.line(lx + 10, ly + 18, lx + lw - 10, ly + 18, 2);

      // Population & Demographics
      g.text("TITLE: " + this.milestoneTitle, lx + 12, ly + 24, 3);
      g.text("POPULATION: " + this.pop.toLocaleString(), lx + 12, ly + 34, 3);
      g.text("WORKFORCE:  " + this.workforce + " (" + Math.round(this.workforce / Math.max(1, this.pop) * 100) + "%)", lx + 12, ly + 44, 2);
      g.text("TOTAL JOBS: " + this.totJobs + " (C:" + this.comJobs + " I:" + this.indJobs + ")", lx + 12, ly + 54, 2);

      // Environment & Services
      g.line(lx + 10, ly + 64, lx + lw - 10, ly + 64, 1);
      g.text("HAPPINESS:  " + this.happiness + "%", lx + 12, ly + 70, this.happiness >= 60 ? 3 : 2);
      g.text("POWER GRID: " + this.powerUsed + "/" + this.powerCapacity + " (" + (this.powerUsed <= this.powerCapacity ? "OPTIMAL" : "BROWNOUT") + ")", lx + 12, ly + 80, 2);
      g.text("RCI DEMAND: R:" + this.demandR + "% C:" + this.demandC + "% I:" + this.demandI + "%", lx + 12, ly + 90, 2);

      // Financial Balance Sheet
      g.line(lx + 10, ly + 100, lx + lw - 10, ly + 100, 1);
      g.text("TAX REVENUE:   +$" + this.lastTaxRev + "/MO", lx + 12, ly + 106, 3);
      g.text("MAINTENANCE:   -$" + this.lastMaint + "/MO", lx + 12, ly + 116, 2);
      g.text("NET CASH FLOW: " + (this.lastNet >= 0 ? "+$" : "-$") + Math.abs(this.lastNet) + "/MO", lx + 12, ly + 126, this.lastNet >= 0 ? 3 : 1);
      g.text("TREASURY:      $" + this.cash, lx + 12, ly + 136, this.cash >= 0 ? 3 : 1);

      // Next Milestone Target
      g.line(lx + 10, ly + 146, lx + lw - 10, ly + 146, 1);
      let nextM = null;
      for (let i = 0; i < this.MILESTONES.length; i++) {
        if (this.pop < this.MILESTONES[i].pop) {
          nextM = this.MILESTONES[i];
          break;
        }
      }
      if (nextM) {
        g.text("NEXT TARGET: " + nextM.title + " (" + nextM.pop.toLocaleString() + " POP)", lx + 12, ly + 154, 2);
        g.text("REWARD: +$" + nextM.bonus + " FEDERAL GRANT", lx + 12, ly + 164, 3);
      } else {
        g.text("MAXIMUM METROPOLIS ACHIEVED!", lx + 12, ly + 154, 3);
        g.text("CONTINUE EXPANDING THE CITY!", lx + 12, ly + 164, 2);
      }

      // Close Button
      g.line(lx + 10, ly + 176, lx + lw - 10, ly + 176, 2);
      g.rect(lx + 20, ly + 182, lw - 40, 16, 1);
      g.box(lx + 20, ly + 182, lw - 40, 16, 3);
      g.textC("[TAP OR PRESS B TO CLOSE]", ly + 187, 3);
    }
  }
};
