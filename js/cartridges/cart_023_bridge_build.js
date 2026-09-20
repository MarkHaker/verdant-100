// js/cartridges/cart_023_bridge_build.js
// ============================================================================
// Cartridge #023: BRIDGE BUILD
// Authentic Poly Bridge / Bridge Builder simulation engine for VERDANT-100.
// Mass-spring truss physics, multi-wheel heavy cart, stress visualization,
// structural snapping, mobile touch & D-pad construction, 6 canyon levels.
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[23] = {
  id: 23,
  name: "BRIDGE BUILD",
  genre: 2,
  scoreLabel: "CLEARED",
  desc: "CONSTRUCT TRUSS BRIDGES WITH ROAD & STEEL TO CARRY HEAVY VEHICLES.",

  icon(g, x, y) {
    // 32x32 retro pixel art icon
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Canyon cliffs
    g.rect(x, y + 16, 7, 16, 1);
    g.rect(x + 25, y + 16, 7, 16, 1);
    g.line(x + 7, y + 16, x + 7, y + 31, 2);
    g.line(x + 24, y + 16, x + 24, y + 31, 2);
    // River at bottom
    g.rect(x + 8, y + 27, 16, 4, 1);
    g.line(x + 9, y + 28, x + 23, y + 28, 2);
    // Road deck
    g.line(x + 6, y + 16, x + 25, y + 16, 3);
    g.line(x + 6, y + 17, x + 25, y + 17, 2);
    // Truss triangles underneath
    g.line(x + 6, y + 17, x + 16, y + 24, 2);
    g.line(x + 16, y + 24, x + 25, y + 17, 2);
    g.line(x + 6, y + 23, x + 16, y + 24, 2);
    g.line(x + 16, y + 24, x + 25, y + 23, 2);
    g.disc(x + 16, y + 24, 1, 3);
    // Mini cart crossing
    g.rect(x + 13, y + 12, 6, 3, 3);
    g.disc(x + 14, y + 15, 1, 1);
    g.disc(x + 18, y + 15, 1, 1);
  },

  // Levels configuration
  levels: [
    {
      name: "SHORT CHASM",
      budget: 1200,
      leftCliff: { x: 50, y: 130 },
      rightCliff: { x: 150, y: 130 },
      anchors: [
        { x: 50, y: 130 },
        { x: 50, y: 170 },
        { x: 150, y: 130 },
        { x: 150, y: 170 }
      ],
      waterY: 204
    },
    {
      name: "DEEP GORGE",
      budget: 1800,
      leftCliff: { x: 40, y: 120 },
      rightCliff: { x: 160, y: 120 },
      anchors: [
        { x: 40, y: 80 },
        { x: 40, y: 120 },
        { x: 40, y: 160 },
        { x: 160, y: 80 },
        { x: 160, y: 120 },
        { x: 160, y: 160 }
      ],
      waterY: 204
    },
    {
      name: "STEPPED CLIFFS",
      budget: 2200,
      leftCliff: { x: 40, y: 100 },
      rightCliff: { x: 160, y: 150 },
      anchors: [
        { x: 40, y: 100 },
        { x: 40, y: 140 },
        { x: 160, y: 110 },
        { x: 160, y: 150 },
        { x: 160, y: 190 }
      ],
      waterY: 208
    },
    {
      name: "CENTRAL PIER",
      budget: 2600,
      leftCliff: { x: 30, y: 130 },
      rightCliff: { x: 190, y: 130 },
      pier: { x: 110, topY: 150, botY: 204 },
      anchors: [
        { x: 30, y: 130 },
        { x: 30, y: 170 },
        { x: 110, y: 150 },
        { x: 110, y: 180 },
        { x: 190, y: 130 },
        { x: 190, y: 170 }
      ],
      waterY: 204
    },
    {
      name: "THE CHASM",
      budget: 3200,
      leftCliff: { x: 30, y: 120 },
      rightCliff: { x: 200, y: 120 },
      anchors: [
        { x: 30, y: 70 },
        { x: 30, y: 120 },
        { x: 30, y: 170 },
        { x: 200, y: 70 },
        { x: 200, y: 120 },
        { x: 200, y: 170 }
      ],
      waterY: 204
    },
    {
      name: "TWIN GORGES",
      budget: 3600,
      leftCliff: { x: 30, y: 125 },
      island: { leftX: 100, rightX: 120, y: 125 },
      rightCliff: { x: 190, y: 125 },
      anchors: [
        { x: 30, y: 125 },
        { x: 30, y: 165 },
        { x: 100, y: 125 },
        { x: 120, y: 125 },
        { x: 110, y: 170 },
        { x: 190, y: 125 },
        { x: 190, y: 165 }
      ],
      waterY: 204
    }
  ],

  // Materials definition
  materials: {
    road: {
      name: 'ROAD',
      cost: 100,
      maxLen: 43,
      k: 5000,
      maxStrain: 0.10,
      mass: 1.0,
      color: 3
    },
    truss: {
      name: 'TRUSS',
      cost: 40,
      maxLen: 48,
      k: 7000,
      maxStrain: 0.18,
      mass: 0.6,
      color: 2
    }
  },

  init() {
    this.currentLevel = 0;
    this.score = 0;
    this.clearedLevels = new Set();
    this.userDesigns = {};
    this.activeMaterial = 'road'; // 'road' or 'truss'
    this.mode = 'BUILD'; // 'BUILD' or 'TEST'
    this.simStatus = 'IDLE'; // 'IDLE', 'RUNNING', 'VICTORY', 'FAILED'

    // Controller cursor
    this.cursor = { x: 60, y: 130 };
    this.cursorSelectedNode = null;

    // Touch dragging
    this.touchDragNode = null;
    this.touchPreviewPos = null;
    this.touchCandidateBeam = null;
    this.touchDownTime = 0;

    // Simulation & visual state
    this.simTime = 0;
    this.maxRecordedStress = 0;
    this.screenShake = 0;
    this.particles = [];
    this.waterAnim = 0;

    // Restore saved progression if available
    if (typeof SAVE !== 'undefined' && SAVE.data && SAVE.data.per && SAVE.data.per.cart23) {
      try {
        const saved = SAVE.data.per.cart23;
        if (saved.cleared && Array.isArray(saved.cleared)) {
          saved.cleared.forEach(lvl => this.clearedLevels.add(lvl));
          this.score = this.clearedLevels.size;
        }
      } catch (_) {}
    }

    this.loadLevel(this.currentLevel);
  },

  loadLevel(lvlIdx) {
    this.userDesigns = this.userDesigns || {};
    this.clearedLevels = this.clearedLevels || new Set();
    this.currentLevel = Math.max(0, Math.min(this.levels.length - 1, lvlIdx));
    const lvl = this.levels[this.currentLevel];

    // Check if user has a saved bridge design for this level
    if (this.userDesigns[this.currentLevel]) {
      const saved = this.userDesigns[this.currentLevel];
      this.nodes = saved.nodes.map(n => ({
        x: n.x,
        y: n.y,
        origX: n.x,
        origY: n.y,
        vx: 0,
        vy: 0,
        fx: 0,
        fy: 0,
        fix: !!n.fix,
        mass: n.mass || 1.0
      }));
      this.beams = saved.beams.map(b => ({
        n1: b.n1,
        n2: b.n2,
        type: b.type,
        k: b.k,
        maxStrain: b.maxStrain,
        L0: b.L0,
        broken: false,
        stress: 0
      }));
    } else {
      // Default: generate anchors from level definition
      this.nodes = lvl.anchors.map(a => ({
        x: a.x,
        y: a.y,
        origX: a.x,
        origY: a.y,
        vx: 0,
        vy: 0,
        fx: 0,
        fy: 0,
        fix: true,
        mass: 1.0
      }));
      this.beams = [];
    }

    this.cursor.x = lvl.leftCliff.x;
    this.cursor.y = lvl.leftCliff.y;
    this.cursorSelectedNode = null;
    this.touchDragNode = null;
    this.touchPreviewPos = null;

    this.resetSimulation();
  },

  saveCurrentDesign() {
    this.userDesigns = this.userDesigns || {};
    this.userDesigns[this.currentLevel] = {
      nodes: this.nodes.map(n => ({ x: n.origX || n.x, y: n.origY || n.y, fix: n.fix, mass: n.mass })),
      beams: this.beams.map(b => ({
        n1: b.n1,
        n2: b.n2,
        type: b.type,
        k: b.k,
        maxStrain: b.maxStrain,
        L0: b.L0
      }))
    };
  },

  resetSimulation() {
    this.mode = 'BUILD';
    this.simStatus = 'IDLE';
    this.simTime = 0;
    this.maxRecordedStress = 0;
    this.particles = [];

    // Restore node positions and clear velocities
    for (let n of this.nodes) {
      n.x = n.origX !== undefined ? n.origX : n.x;
      n.y = n.origY !== undefined ? n.origY : n.y;
      n.vx = 0;
      n.vy = 0;
      n.fx = 0;
      n.fy = 0;
    }

    // Reset beam lengths & broken state
    for (let b of this.beams) {
      b.broken = false;
      b.stress = 0;
      const na = this.nodes[b.n1], nb = this.nodes[b.n2];
      if (na && nb) {
        b.L0 = Math.hypot(nb.x - na.x, nb.y - na.y);
      }
    }

    // Reset heavy cart
    const lvl = this.levels[this.currentLevel];
    this.cart = {
      x: 10,
      y: lvl.leftCliff.y - 5,
      vx: 32,
      vy: 0,
      angle: 0,
      rotSpeed: 0,
      falling: false,
      rearSupported: true,
      frontSupported: true,
      rearY: lvl.leftCliff.y,
      frontY: lvl.leftCliff.y,
      mass: 5.2,
      wheelBase: 16
    };
  },

  startSimulation() {
    this.saveCurrentDesign();
    this.resetSimulation();
    this.mode = 'TEST';
    this.simStatus = 'RUNNING';
    this.cursorSelectedNode = null;
    this.touchDragNode = null;
    this.touchPreviewPos = null;
  },

  calcTotalCost() {
    let total = 0;
    for (let b of this.beams) {
      const mat = this.materials[b.type] || this.materials.truss;
      total += mat.cost;
    }
    return total;
  },

  snapToGrid(val, step = 10) {
    return Math.round(val / step) * step;
  },

  findNodeNear(x, y, maxDist = 10) {
    let best = null, bestDist = maxDist;
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      const dist = Math.hypot(n.x - x, n.y - y);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  },

  findBeamNear(x, y, maxDist = 6) {
    let best = null, bestDist = maxDist;
    for (let i = 0; i < this.beams.length; i++) {
      const b = this.beams[i];
      if (b.broken) continue;
      const n1 = this.nodes[b.n1], n2 = this.nodes[b.n2];
      if (!n1 || !n2) continue;
      const dx = n2.x - n1.x, dy = n2.y - n1.y;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) continue;
      let t = ((x - n1.x) * dx + (y - n1.y) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const px = n1.x + t * dx, py = n1.y + t * dy;
      const dist = Math.hypot(x - px, y - py);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  },

  createBeam(idxA, idxB, type) {
    if (idxA === idxB || idxA === null || idxB === null) return false;
    const na = this.nodes[idxA], nb = this.nodes[idxB];
    if (!na || !nb) return false;

    // Check existing beam between these nodes
    for (let b of this.beams) {
      if ((b.n1 === idxA && b.n2 === idxB) || (b.n1 === idxB && b.n2 === idxA)) {
        return false;
      }
    }

    const mat = this.materials[type] || this.materials.road;
    const dist = Math.hypot(nb.x - na.x, nb.y - na.y);
    if (dist > mat.maxLen || dist < 6) return false;

    const currentCost = this.calcTotalCost();
    const lvl = this.levels[this.currentLevel];
    if (currentCost + mat.cost > lvl.budget) {
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('DENY');
      return false;
    }

    this.beams.push({
      n1: idxA,
      n2: idxB,
      type: type,
      k: mat.k,
      maxStrain: mat.maxStrain,
      L0: dist,
      broken: false,
      stress: 0
    });

    if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_OK');
    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(10);
    this.saveCurrentDesign();
    return true;
  },

  deleteBeam(beamIdx) {
    if (beamIdx < 0 || beamIdx >= this.beams.length) return false;
    this.beams.splice(beamIdx, 1);
    this.cleanupOrphanNodes();
    if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_BACK');
    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(8);
    this.saveCurrentDesign();
    return true;
  },

  cleanupOrphanNodes() {
    // Collect used node indices
    const used = new Set();
    for (let b of this.beams) {
      used.add(b.n1);
      used.add(b.n2);
    }
    // Remove non-anchor nodes that have no beams attached
    const oldNodes = this.nodes;
    const newNodes = [];
    const indexMap = [];

    for (let i = 0; i < oldNodes.length; i++) {
      const n = oldNodes[i];
      if (n.fix || used.has(i)) {
        indexMap[i] = newNodes.length;
        newNodes.push(n);
      } else {
        indexMap[i] = -1;
      }
    }

    this.nodes = newNodes;
    for (let b of this.beams) {
      b.n1 = indexMap[b.n1];
      b.n2 = indexMap[b.n2];
    }
  },

  clearCurrentBridge() {
    // Clear all beams and free nodes, keeping level anchors
    const lvl = this.levels[this.currentLevel];
    this.nodes = lvl.anchors.map(a => ({
      x: a.x,
      y: a.y,
      origX: a.x,
      origY: a.y,
      vx: 0,
      vy: 0,
      fx: 0,
      fy: 0,
      fix: true,
      mass: 1.0
    }));
    this.beams = [];
    this.cursorSelectedNode = null;
    this.touchDragNode = null;
    this.saveCurrentDesign();
    if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_BACK');
  },

  undoLastAction() {
    if (this.beams.length > 0) {
      this.deleteBeam(this.beams.length - 1);
    }
  },

  update(dt) {
    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 15);
    }

    // Water animation timer
    this.waterAnim = (this.waterAnim + dt * 4) % (Math.PI * 2);

    // Update debris particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 320 * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    if (this.mode === 'TEST') {
      this.updateSimulation(dt);
    } else {
      this.updateConstruction(dt);
    }
  },

  updateConstruction(dt) {
    const lvl = this.levels[this.currentLevel];

    // Handle touch/mouse buttons on bottom utility bar
    this.handleTouchInput();

    // Gamepad / Keyboard Controls
    // Toggle Mode via START
    if (typeof PAD !== 'undefined' && PAD.hit('start')) {
      this.startSimulation();
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_OK');
      return;
    }

    // Toggle Material via SELECT
    if (typeof PAD !== 'undefined' && PAD.hit('select')) {
      this.activeMaterial = this.activeMaterial === 'road' ? 'truss' : 'road';
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
    }

    // Cursor movement with D-pad
    const speed = 90;
    let moved = false;
    if (PAD.held('left'))  { this.cursor.x -= speed * dt; moved = true; }
    if (PAD.held('right')) { this.cursor.x += speed * dt; moved = true; }
    if (PAD.held('up'))    { this.cursor.y -= speed * dt; moved = true; }
    if (PAD.held('down'))  { this.cursor.y += speed * dt; moved = true; }

    // Clamp cursor to construction area
    this.cursor.x = Math.max(10, Math.min(246, this.cursor.x));
    this.cursor.y = Math.max(30, Math.min(210, this.cursor.y));

    // [A] Button: Place or connect node
    if (PAD.hit('a')) {
      const snapX = this.snapToGrid(this.cursor.x);
      const snapY = this.snapToGrid(this.cursor.y);
      const nearIdx = this.findNodeNear(this.cursor.x, this.cursor.y, 10);

      if (this.cursorSelectedNode === null) {
        if (nearIdx !== null) {
          this.cursorSelectedNode = nearIdx;
          if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('TICK');
        } else {
          // Create node on empty space if valid
          const currentCost = this.calcTotalCost();
          const mat = this.materials[this.activeMaterial];
          if (currentCost + mat.cost <= lvl.budget) {
            this.nodes.push({
              x: snapX,
              y: snapY,
              origX: snapX,
              origY: snapY,
              vx: 0,
              vy: 0,
              fx: 0,
              fy: 0,
              fix: false,
              mass: 1.0
            });
            this.cursorSelectedNode = this.nodes.length - 1;
            if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('TICK');
          } else {
            if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('DENY');
          }
        }
      } else {
        // We already have a selected node, try connecting to target
        let targetIdx = nearIdx;
        if (targetIdx === null) {
          // Create target node on empty grid
          this.nodes.push({
            x: snapX,
            y: snapY,
            origX: snapX,
            origY: snapY,
            vx: 0,
            vy: 0,
            fx: 0,
            fy: 0,
            fix: false,
            mass: 1.0
          });
          targetIdx = this.nodes.length - 1;
        }

        const success = this.createBeam(this.cursorSelectedNode, targetIdx, this.activeMaterial);
        if (success) {
          this.cursorSelectedNode = targetIdx; // Allow continuous chaining!
        } else {
          this.cleanupOrphanNodes();
        }
      }
    }

    // [B] Button: Cancel selection, delete beam near cursor, or undo
    if (PAD.hit('b')) {
      if (this.cursorSelectedNode !== null) {
        this.cursorSelectedNode = null;
        if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_BACK');
      } else {
        const nearBeam = this.findBeamNear(this.cursor.x, this.cursor.y, 8);
        if (nearBeam !== null) {
          this.deleteBeam(nearBeam);
        } else {
          this.undoLastAction();
        }
      }
    }
  },

  handleTouchInput() {
    if (typeof PAD === 'undefined' || !PAD.pointer) return;
    const pt = PAD.pointer;
    const lvl = this.levels[this.currentLevel];

    // Bottom On-Screen Buttons Area: Y: 218..238
    if (pt.down && pt.y >= 216) {
      if (!this.touchBtnCooldown) {
        this.touchBtnCooldown = true;

        // Button 1: [TEST / BUILD] (X: 3..45)
        if (pt.x >= 3 && pt.x <= 45) {
          if (this.mode === 'BUILD') this.startSimulation();
          else this.resetSimulation();
          if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_OK');
        }
        // Button 2: [ROAD / TRUSS] (X: 48..94)
        else if (pt.x >= 48 && pt.x <= 94) {
          this.activeMaterial = this.activeMaterial === 'road' ? 'truss' : 'road';
          if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
        }
        // Button 3: [UNDO] (X: 97..133)
        else if (pt.x >= 97 && pt.x <= 133) {
          this.undoLastAction();
        }
        // Button 4: [CLEAR] (X: 136..172)
        else if (pt.x >= 136 && pt.x <= 172) {
          this.clearCurrentBridge();
        }
        // Button 5: [◀ LVL] (X: 176..210)
        else if (pt.x >= 176 && pt.x <= 210) {
          this.saveCurrentDesign();
          this.loadLevel(this.currentLevel - 1);
          if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
        }
        // Button 6: [LVL ▶] (X: 214..248)
        else if (pt.x >= 214 && pt.x <= 248) {
          this.saveCurrentDesign();
          this.loadLevel(this.currentLevel + 1);
          if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
        }
      }
      return;
    } else {
      this.touchBtnCooldown = false;
    }

    // Touch Drawing & Deleting in Playfield (Y < 216)
    if (this.mode === 'BUILD') {
      if (pt.down) {
        if (this.touchDragNode === null && !this.touchDownTracked) {
          this.touchDownTracked = true;
          this.touchDownPos = { x: pt.x, y: pt.y };
          const nearNode = this.findNodeNear(pt.x, pt.y, 14);
          if (nearNode !== null) {
            this.touchDragNode = nearNode;
            this.touchPreviewPos = { x: pt.x, y: pt.y };
          } else {
            // Check tap on beam for delete
            this.touchCandidateBeam = this.findBeamNear(pt.x, pt.y, 8);
          }
        } else if (this.touchDragNode !== null) {
          this.touchPreviewPos = { x: pt.x, y: pt.y };
        }
      } else {
        // Pointer Released
        if (this.touchDownTracked) {
          this.touchDownTracked = false;

          if (this.touchDragNode !== null) {
            const snapX = this.snapToGrid(pt.x);
            const snapY = this.snapToGrid(pt.y);
            const targetNode = this.findNodeNear(pt.x, pt.y, 12);

            if (targetNode !== null && targetNode !== this.touchDragNode) {
              this.createBeam(this.touchDragNode, targetNode, this.activeMaterial);
            } else if (targetNode === null) {
              // Create new node at snapped position
              const distFromStart = Math.hypot(snapX - this.nodes[this.touchDragNode].x, snapY - this.nodes[this.touchDragNode].y);
              if (distFromStart >= 8 && distFromStart <= this.materials[this.activeMaterial].maxLen) {
                this.nodes.push({
                  x: snapX,
                  y: snapY,
                  origX: snapX,
                  origY: snapY,
                  vx: 0,
                  vy: 0,
                  fx: 0,
                  fy: 0,
                  fix: false,
                  mass: 1.0
                });
                this.createBeam(this.touchDragNode, this.nodes.length - 1, this.activeMaterial);
              }
            }
            this.touchDragNode = null;
            this.touchPreviewPos = null;
          } else if (this.touchCandidateBeam !== null) {
            const dragDist = Math.hypot(pt.x - this.touchDownPos.x, pt.y - this.touchDownPos.y);
            if (dragDist < 6) {
              this.deleteBeam(this.touchCandidateBeam);
            }
            this.touchCandidateBeam = null;
          }
        }
      }
    }
  },

  updateSimulation(dt) {
    this.simTime += dt;
    const lvl = this.levels[this.currentLevel];

    // Bottom touch controls remain active during simulation
    this.handleTouchInput();

    // Toggle back to build mode via START
    if (typeof PAD !== 'undefined' && PAD.hit('start')) {
      this.resetSimulation();
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_BACK');
      return;
    }

    const anyTap = typeof PAD !== 'undefined' && (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || (PAD.tapPos !== null));
    if (this.simStatus === 'VICTORY') {
      if (anyTap) {
        if (this.currentLevel < this.levels.length - 1) {
          this.loadLevel(this.currentLevel + 1);
        } else {
          this.resetSimulation();
        }
      }
      return;
    }

    if (this.simStatus === 'FAILED') {
      if (anyTap) {
        this.resetSimulation();
      }
      return;
    }

    // Mass-Spring Physics Solver (Symplectic Euler with adaptive Substepping)
    const gravity = 340;
    const clampedDt = Math.min(dt, 0.04);
    const targetSubDt = 0.0022; // ~2.2 ms per substep for rock-solid stability
    const substeps = Math.max(10, Math.ceil(clampedDt / targetSubDt));
    const subDt = clampedDt / substeps;

    for (let step = 0; step < substeps; step++) {
      this.stepPhysics(subDt, gravity, lvl);
    }

    // Vehicle exhaust puff particles
    if (this.cart.vx > 5 && Math.random() < 0.35 && !this.cart.falling) {
      this.particles.push({
        x: this.cart.x - 6,
        y: this.cart.y - 7,
        vx: -12 - Math.random() * 8,
        vy: -8 - Math.random() * 8,
        life: 0.45,
        maxLife: 0.45,
        color: 1
      });
    }

    // Win condition check: heavy cart reached landing pad
    if (this.cart.x > lvl.rightCliff.x + 16 && !this.cart.falling && this.simStatus === 'RUNNING') {
      this.simStatus = 'VICTORY';
      this.clearedLevels.add(this.currentLevel);
      this.score = this.clearedLevels.size;

      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('LEVELUP');
      if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(60);

      // Save score and progress
      if (typeof SAVE !== 'undefined') {
        SAVE.setScore(this.id, this.score);
        if (!SAVE.data.per) SAVE.data.per = {};
        SAVE.data.per.cart23 = {
          cleared: Array.from(this.clearedLevels),
          lastLvl: this.currentLevel
        };
        SAVE.commit();
      }

      // Spawn victory fireworks / sparkles
      for (let i = 0; i < 24; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 40 + Math.random() * 80;
        this.particles.push({
          x: lvl.rightCliff.x + 18,
          y: lvl.rightCliff.y - 6,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 30,
          life: 0.7 + Math.random() * 0.5,
          maxLife: 1.2,
          color: 3
        });
      }
    }

    // Fail condition check: cart plunged into abyss
    if (this.cart.y > lvl.waterY && this.simStatus === 'RUNNING') {
      this.simStatus = 'FAILED';
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('SPLASH');
      if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(50);
      this.screenShake = 6;

      // Water splash particles
      for (let i = 0; i < 20; i++) {
        this.particles.push({
          x: this.cart.x + (Math.random() * 16 - 8),
          y: lvl.waterY,
          vx: Math.random() * 60 - 30,
          vy: -60 - Math.random() * 60,
          life: 0.6,
          maxLife: 0.6,
          color: 3
        });
      }
    }
  },

  stepPhysics(dt, gravity, lvl) {
    // 1. Reset node forces
    for (let n of this.nodes) {
      n.fx = 0;
      n.fy = n.fix ? 0 : n.mass * gravity;
    }

    // 2. Wheel loads onto road deck
    const halfBase = this.cart.wheelBase / 2;
    const cosA = Math.cos(this.cart.angle);
    const sinA = Math.sin(this.cart.angle);
    const rearX = this.cart.x - halfBase * cosA;
    const frontX = this.cart.x + halfBase * cosA;

    let rearDeckY = null;
    let frontDeckY = null;

    if (!this.cart.falling) {
      // Find road deck or cliff height under rear wheel
      rearDeckY = this.sampleSurfaceAt(rearX, lvl);
      // Find road deck or cliff height under front wheel
      frontDeckY = this.sampleSurfaceAt(frontX, lvl);

      // Check if both wheels are supported
      if (rearDeckY !== null && frontDeckY !== null) {
        // Vehicle tracks the road deck
        this.cart.rearY = rearDeckY;
        this.cart.frontY = frontDeckY;
        const targetAngle = Math.atan2(frontDeckY - rearDeckY, frontX - rearX);
        this.cart.angle = targetAngle;
        this.cart.y = (rearDeckY + frontDeckY) / 2 - 5;

        // Apply drive traction and wheel downward gravity load onto road nodes
        const wheelLoad = (this.cart.mass * gravity) / 2;
        const driveFwd = 50; // Engine forward drive force

        this.applyWheelLoadToRoad(rearX, wheelLoad, driveFwd, lvl);
        this.applyWheelLoadToRoad(frontX, wheelLoad, driveFwd, lvl);

        // Forward cart motion along road slope
        const slopeAcc = gravity * Math.sin(targetAngle) * 0.35;
        this.cart.vx = Math.max(16, Math.min(55, this.cart.vx + slopeAcc * dt));
        this.cart.x += this.cart.vx * cosA * dt;
      } else {
        // Lost road support: enter tumbling free fall!
        this.cart.falling = true;
        this.cart.vy = 10;
        this.cart.rotSpeed = (frontDeckY === null ? 3.5 : -3.5);
      }
    } else {
      // Vehicle in free fall
      this.cart.vy += gravity * dt;
      this.cart.x += this.cart.vx * dt;
      this.cart.y += this.cart.vy * dt;
      this.cart.angle += this.cart.rotSpeed * dt;
    }

    // 3. Beam spring forces (Hooke's Law + axial damping)
    const beamDamping = 65;
    for (let b of this.beams) {
      if (b.broken) continue;
      const na = this.nodes[b.n1], nb = this.nodes[b.n2];
      if (!na || !nb) continue;

      const dx = nb.x - na.x;
      const dy = nb.y - na.y;
      const len = Math.hypot(dx, dy);
      if (len < 0.001) continue;

      const ux = dx / len;
      const uy = dy / len;
      const deltaL = len - b.L0;
      const strain = deltaL / Math.max(1.0, b.L0);
      const stressRatio = Math.abs(strain) / b.maxStrain;
      b.stress = stressRatio;

      if (stressRatio > this.maxRecordedStress) {
        this.maxRecordedStress = stressRatio;
      }

      // Check structural breaking threshold!
      if (stressRatio >= 1.0) {
        b.broken = true;
        this.screenShake = 5;
        if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('BOOM');
        if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(35);

        // Spawn snapping debris particles
        const midX = (na.x + nb.x) / 2;
        const midY = (na.y + nb.y) / 2;
        for (let p = 0; p < 7; p++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 30 + Math.random() * 60;
          this.particles.push({
            x: midX,
            y: midY,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            life: 0.5 + Math.random() * 0.4,
            maxLife: 0.9,
            color: b.type === 'road' ? 3 : 2
          });
        }
        continue;
      }

      // Axial damping
      const dvx = nb.vx - na.vx;
      const dvy = nb.vy - na.vy;
      const vrel = dvx * ux + dvy * uy;

      const force = b.k * deltaL + beamDamping * vrel;
      const fx = force * ux;
      const fy = force * uy;

      if (!na.fix) { na.fx += fx; na.fy += fy; }
      if (!nb.fix) { nb.fx -= fx; nb.fy -= fy; }
    }

    // 4. Integrate node equations of motion (Symplectic Euler)
    const nodeDrag = Math.pow(0.992, dt * 60);
    const maxVel = 320;

    for (let n of this.nodes) {
      if (n.fix) {
        n.vx = 0;
        n.vy = 0;
        continue;
      }

      const ax = n.fx / n.mass;
      const ay = n.fy / n.mass;

      n.vx = (n.vx + ax * dt) * nodeDrag;
      n.vy = (n.vy + ay * dt) * nodeDrag;

      // Fail-safe velocity clamping against division-by-zero or numerical explosions
      n.vx = Math.max(-maxVel, Math.min(maxVel, n.vx));
      n.vy = Math.max(-maxVel, Math.min(maxVel, n.vy));

      n.x += n.vx * dt;
      n.y += n.vy * dt;

      // Fail-safe NaN protection
      if (isNaN(n.x) || isNaN(n.y)) {
        n.x = n.origX || 100;
        n.y = n.origY || 130;
        n.vx = 0;
        n.vy = 0;
      }
    }
  },

  sampleSurfaceAt(x, lvl) {
    // Check left cliff approach road
    if (x <= lvl.leftCliff.x) {
      return lvl.leftCliff.y;
    }
    // Check right cliff landing pad
    if (x >= lvl.rightCliff.x) {
      return lvl.rightCliff.y;
    }
    // Check central island if present
    if (lvl.island && x >= lvl.island.leftX && x <= lvl.island.rightX) {
      return lvl.island.y;
    }

    // Check active road beams spanning this X coordinate
    let bestY = null;
    for (let b of this.beams) {
      if (b.broken || b.type !== 'road') continue;
      const na = this.nodes[b.n1], nb = this.nodes[b.n2];
      if (!na || !nb) continue;
      const minX = Math.min(na.x, nb.x) - 1;
      const maxX = Math.max(na.x, nb.x) + 1;
      if (x >= minX && x <= maxX) {
        const span = nb.x - na.x;
        if (Math.abs(span) < 0.001) continue;
        const t = Math.max(0, Math.min(1, (x - na.x) / span));
        const deckY = na.y + t * (nb.y - na.y);
        if (bestY === null || Math.abs(deckY - this.cart.y) < Math.abs(bestY - this.cart.y)) {
          bestY = deckY;
        }
      }
    }
    return bestY;
  },

  applyWheelLoadToRoad(x, load, driveFwd, lvl) {
    if (x <= lvl.leftCliff.x || x >= lvl.rightCliff.x) return;
    if (lvl.island && x >= lvl.island.leftX && x <= lvl.island.rightX) return;

    for (let b of this.beams) {
      if (b.broken || b.type !== 'road') continue;
      const na = this.nodes[b.n1], nb = this.nodes[b.n2];
      if (!na || !nb) continue;
      const minX = Math.min(na.x, nb.x) - 1;
      const maxX = Math.max(na.x, nb.x) + 1;
      if (x >= minX && x <= maxX) {
        const span = nb.x - na.x;
        if (Math.abs(span) < 0.001) continue;
        const t = Math.max(0, Math.min(1, (x - na.x) / span));
        // Vertical downward load
        na.fy += load * (1 - t);
        nb.fy += load * t;
        // Tangential forward traction pushes nodes backward
        na.fx -= driveFwd * (1 - t);
        nb.fx -= driveFwd * t;
      }
    }
  },

  render(g) {
    g.clear(0);
    const lvl = this.levels[this.currentLevel];

    // Phosphor screen shake offset
    let offX = 0, offY = 0;
    if (this.screenShake > 0.1) {
      offX = Math.round((Math.random() * 2 - 1) * this.screenShake);
      offY = Math.round((Math.random() * 2 - 1) * this.screenShake);
    }

    // 1. Canyon Backdrop, Cliffs & Water
    this.renderCanyon(g, lvl, offX, offY);

    // 2. Grid dots in construction mode (blueprint drafting feel)
    if (this.mode === 'BUILD') {
      for (let gx = 20; gx <= 236; gx += 10) {
        for (let gy = 40; gy <= 200; gy += 10) {
          g.px(gx + offX, gy + offY, 1);
        }
      }
    }

    // 3. Structural Beams
    this.renderBeams(g, offX, offY);

    // 4. Touch Drag Preview Beam
    if (this.mode === 'BUILD' && this.touchDragNode !== null && this.touchPreviewPos !== null) {
      const na = this.nodes[this.touchDragNode];
      const snapX = this.snapToGrid(this.touchPreviewPos.x);
      const snapY = this.snapToGrid(this.touchPreviewPos.y);
      const dist = Math.hypot(snapX - na.x, snapY - na.y);
      const mat = this.materials[this.activeMaterial];
      const valid = dist <= mat.maxLen && dist >= 6 && this.calcTotalCost() + mat.cost <= lvl.budget;

      g.line(na.x + offX, na.y + offY, snapX + offX, snapY + offY, valid ? 3 : 1);
      g.disc(snapX + offX, snapY + offY, 2, valid ? 3 : 1);

      // Show floating cost and length
      const midX = (na.x + snapX) / 2;
      const midY = (na.y + snapY) / 2 - 8;
      g.text(`$${mat.cost}`, midX + offX - 6, midY + offY, valid ? 3 : 1);
    }

    // 5. Nodes (Rivets / Bedrock Anchors)
    this.renderNodes(g, offX, offY);

    // 6. Heavy Cart / Truck
    this.renderCart(g, offX, offY);

    // 7. Particles (Smoke, Debris, Splashes, Fireworks)
    for (let p of this.particles) {
      g.px(Math.round(p.x + offX), Math.round(p.y + offY), p.color || 3);
    }

    // 8. Controller Cursor
    if (this.mode === 'BUILD') {
      this.renderCursor(g, offX, offY);
    }

    // 9. UI HUD & On-Screen Buttons
    this.renderUI(g, lvl);
  },

  renderCanyon(g, lvl, offX, offY) {
    // Left Cliff
    const lx = lvl.leftCliff.x + offX;
    const ly = lvl.leftCliff.y + offY;
    g.rect(0, ly, lx, 214 - ly, 1);
    g.dither(0, ly, lx, 214 - ly, 0, 1);
    g.line(0, ly, lx, ly, 3);
    g.line(lx, ly, lx, 214, 2);

    // Right Cliff
    const rx = lvl.rightCliff.x + offX;
    const ry = lvl.rightCliff.y + offY;
    g.rect(rx, ry, 256 - rx, 214 - ry, 1);
    g.dither(rx, ry, 256 - rx, 214 - ry, 0, 1);
    g.line(rx, ry, 256, ry, 3);
    g.line(rx, ry, rx, 214, 2);

    // Central Pier if present (Level 4)
    if (lvl.pier) {
      const px = lvl.pier.x + offX;
      const pTop = lvl.pier.topY + offY;
      g.rect(px - 6, pTop, 12, 214 - pTop, 1);
      g.box(px - 6, pTop, 12, 214 - pTop, 2);
    }

    // Central Island if present (Level 6)
    if (lvl.island) {
      const ix1 = lvl.island.leftX + offX;
      const ix2 = lvl.island.rightX + offX;
      const iy = lvl.island.y + offY;
      g.rect(ix1, iy, ix2 - ix1, 214 - iy, 1);
      g.dither(ix1, iy, ix2 - ix1, 214 - iy, 0, 1);
      g.line(ix1, iy, ix2, iy, 3);
      g.line(ix1, iy, ix1, 214, 2);
      g.line(ix2, iy, ix2, 214, 2);
    }

    // River rapids at canyon bottom
    const wy = lvl.waterY + offY;
    g.rect(0, wy, 256, 12, 1);
    g.dither(0, wy, 256, 12, 0, 1);
    for (let x = 0; x < 256; x += 16) {
      const wave = Math.sin(this.waterAnim + x * 0.1) * 2;
      g.line(x, Math.round(wy + 2 + wave), x + 8, Math.round(wy + 2 + wave), 2);
    }
  },

  renderBeams(g, offX, offY) {
    for (let b of this.beams) {
      if (b.broken) continue;
      const na = this.nodes[b.n1], nb = this.nodes[b.n2];
      if (!na || !nb) continue;

      let color = b.type === 'road' ? 3 : 2;
      const stress = b.stress || 0;

      if (this.mode === 'TEST') {
        if (stress >= 0.82) {
          // Overstressed flashing warning!
          color = (Math.floor(this.simTime * 24) % 2 === 0) ? 3 : 1;
        } else if (stress >= 0.5) {
          // Moderate load
          color = b.type === 'road' ? 3 : 2;
        }
      }

      const x1 = Math.round(na.x + offX);
      const y1 = Math.round(na.y + offY);
      const x2 = Math.round(nb.x + offX);
      const y2 = Math.round(nb.y + offY);

      if (b.type === 'road') {
        // Double-line road deck with asphalt thickness
        g.line(x1, y1, x2, y2, color);
        g.line(x1, y1 + 1, x2, y2 + 1, 2);
        // Subtle road centerline dashes
        const midX = Math.round((x1 + x2) / 2);
        const midY = Math.round((y1 + y2) / 2);
        g.px(midX, midY, 1);
      } else {
        // Steel / Wood truss strut
        g.line(x1, y1, x2, y2, color);
      }
    }
  },

  renderNodes(g, offX, offY) {
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      const nx = Math.round(n.x + offX);
      const ny = Math.round(n.y + offY);

      if (n.fix) {
        // Bedrock anchor bolt
        g.disc(nx, ny, 3, 2);
        g.circle(nx, ny, 3, 3);
        g.px(nx, ny, 0); // Rivet center hole
      } else {
        // Structural pin joint
        const isSelected = (this.cursorSelectedNode === i || this.touchDragNode === i);
        g.disc(nx, ny, isSelected ? 3 : 2, isSelected ? 3 : 2);
        g.px(nx, ny, isSelected ? 0 : 3);
      }
    }
  },

  renderCart(g, offX, offY) {
    const cx = Math.round(this.cart.x + offX);
    const cy = Math.round(this.cart.y + offY);
    const ang = this.cart.angle;
    const cosA = Math.cos(ang);
    const sinA = Math.sin(ang);

    // Helper to rotate local points into world coords
    const rot = (lx, ly) => ({
      x: Math.round(cx + lx * cosA - ly * sinA),
      y: Math.round(cy + lx * sinA + ly * cosA)
    });

    // Truck Chassis & Cab
    const c1 = rot(-9, -2);
    const c2 = rot(9, -2);
    const c3 = rot(9, -7);
    const c4 = rot(2, -7);
    const c5 = rot(1, -5);
    const c6 = rot(-9, -5);

    // Cab body
    g.rect(Math.min(c1.x, c6.x), Math.min(c4.y, c1.y), 18, 6, 2);
    g.box(Math.min(c1.x, c6.x), Math.min(c4.y, c1.y), 18, 6, 3);

    // Cab windshield (glowing phosphor)
    const w1 = rot(3, -6);
    g.rect(w1.x, w1.y, 4, 3, 3);

    // Cargo bed load (steel beams)
    const b1 = rot(-8, -8);
    g.rect(b1.x, b1.y, 8, 3, 1);
    g.box(b1.x, b1.y, 8, 3, 2);

    // Headlights beam in test mode
    if (this.mode === 'TEST' && !this.cart.falling) {
      const hl = rot(10, -3);
      g.line(hl.x, hl.y, hl.x + 8, hl.y + 1, 3);
    }

    // Multi-wheel heavy cart: rear and front wheels
    const rw = rot(-7, 2);
    const fw = rot(7, 2);
    g.disc(rw.x, rw.y, 2, 1);
    g.circle(rw.x, rw.y, 2, 3);
    g.disc(fw.x, fw.y, 2, 1);
    g.circle(fw.x, fw.y, 2, 3);
  },

  renderCursor(g, offX, offY) {
    const cx = Math.round(this.cursor.x + offX);
    const cy = Math.round(this.cursor.y + offY);

    // Neat 7x7 crosshair cursor with center hole
    g.line(cx - 3, cy, cx + 3, cy, 3);
    g.line(cx, cy - 3, cx, cy + 3, 3);
    g.px(cx, cy, 0);

    // If a node is currently selected, draw dynamic connection line to cursor
    if (this.cursorSelectedNode !== null) {
      const na = this.nodes[this.cursorSelectedNode];
      const snapX = this.snapToGrid(cx);
      const snapY = this.snapToGrid(cy);
      g.line(na.x + offX, na.y + offY, snapX, snapY, 3);
    }
  },

  renderUI(g, lvl) {
    const cost = this.calcTotalCost();
    const budget = lvl.budget;

    // Top Status Header Bar
    g.rect(0, 0, 256, 18, 1);
    g.line(0, 18, 256, 18, 2);

    // Left: Level Title
    g.text(`LVL ${this.currentLevel + 1}: ${lvl.name}`, 6, 6, 3);

    // Right: Budget & Cost
    const costCol = cost > budget ? 1 : 3;
    g.textR(`$${cost}/$${budget}`, 250, 6, costCol);

    // Simulation Max Stress Meter in TEST mode
    if (this.mode === 'TEST') {
      const pct = Math.min(100, Math.round(this.maxRecordedStress * 100));
      const stressCol = pct >= 80 ? 3 : 2;
      g.textC(`STRESS: ${pct}%`, 22, stressCol);
    }

    // Win / Fail Overlay Banners
    if (this.simStatus === 'VICTORY') {
      g.rect(38, 80, 180, 52, 0);
      g.box(38, 80, 180, 52, 3);
      g.box(40, 82, 176, 48, 2);
      g.textC("LEVEL CLEAR!", 90, 3, 2);
      g.textC(`BUDGET USED: $${cost} (REMAIN: $${budget - cost})`, 110, 2);
      g.textC("PRESS [A] OR TAP NEXT LVL", 122, 3);
    } else if (this.simStatus === 'FAILED') {
      g.rect(48, 84, 160, 48, 0);
      g.box(48, 84, 160, 48, 2);
      g.textC("BRIDGE COLLAPSED!", 94, 3);
      g.textC("TRUCK PLUNGED INTO ABYSS", 106, 2);
      g.textC("PRESS [A] OR TAP BUILD TO RETRY", 118, 3);
    }

    // Bottom Touch Controls Bar: Y: 216..240
    g.rect(0, 216, 256, 24, 0);
    g.line(0, 216, 256, 216, 2);

    // 1. [TEST / BUILD] (X: 3..45)
    const testLabel = this.mode === 'BUILD' ? "TEST" : "BUILD";
    g.rect(3, 219, 42, 17, this.mode === 'TEST' ? 2 : 1);
    g.box(3, 219, 42, 17, 3);
    g.textC(testLabel, 224, 3, 1);
    g.text(testLabel, 10, 224, 3);

    // 2. [ROAD / TRUSS] (X: 48..94)
    const matLabel = this.activeMaterial === 'road' ? "ROAD" : "TRUSS";
    g.rect(48, 219, 46, 17, 1);
    g.box(48, 219, 46, 17, this.activeMaterial === 'road' ? 3 : 2);
    g.text(matLabel, 54, 224, 3);

    // 3. [UNDO] (X: 97..133)
    g.rect(97, 219, 36, 17, 1);
    g.box(97, 219, 36, 17, 2);
    g.text("UNDO", 103, 224, 3);

    // 4. [CLEAR] (X: 136..172)
    g.rect(136, 219, 36, 17, 1);
    g.box(136, 219, 36, 17, 2);
    g.text("CLR", 144, 224, 3);

    // 5. [◀ LVL] (X: 176..210)
    g.rect(176, 219, 34, 17, 1);
    g.box(176, 219, 34, 17, 2);
    g.text("<LVL", 181, 224, 3);

    // 6. [LVL ▶] (X: 214..248)
    g.rect(214, 219, 34, 17, 1);
    g.box(214, 219, 34, 17, 2);
    g.text("LVL>", 219, 224, 3);
  }
};
