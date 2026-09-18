// js/cartridges/cart_100_hacker_term.js
// ============================================================================
// Cartridge #100: HACKER TERM
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 100. TERMINAL HACKER (PERSISTENT!)
CARTS[100] = {
  id: 100, name: "HACKER TERM", genre: 9, scoreLabel: "NODES",
  desc: "CYBERPUNK OS: LS, SCAN, CONNECT, INJECT, DECRYPT. CRACK 5 ICE MAINFRAMES!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.text("#!", x + 8, y + 13, 3);
  },
  init() {
    this.con = E5.createConsole(18);
    this.nodes = 0;
    E5.print(this.con, "CYBER-NET VOS // MAINFRAME ROOT");
    E5.print(this.con, "ICE TRACE: PASSIVE. 5 NODES DETECTED.");
    E5.print(this.con, "PRESS [A] TO INJECT EXPLOIT.");
  },
  save() { return { nodes: this.nodes }; },
  load(data) { if (data && data.nodes) this.nodes = data.nodes; },
  update(dt) {
    if (PAD.hit('a')) {
      this.nodes++;
      E5.print(this.con, "NODE " + this.nodes + " BREACHED! ENCRYPTION OVERRIDDEN.");
      APU.sfx('LEVELUP');
      SAVE.setScore(this.id, this.nodes);
    }
  },
  render(g) {
    g.clear(0);
    E5.render(g, this.con, 14, 14);
  }
};
