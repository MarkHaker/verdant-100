// js/cartridges/cart_052_dungeon_3d.js
// ============================================================================
// Cartridge #052: DUNGEON 3D
// ============================================================================
var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

// 52. DUNGEON 3D
CARTS[52] = {
  id: 52, name: "DUNGEON 3D", genre: 5, scoreLabel: "TIME",
  desc: "3D FIRST-PERSON RAYCASTER LABYRINTH. LOCATE EXIT DOOR AND ESCAPE!",
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0); g.box(x, y, 32, 32, 2);
    g.line(x + 4, y + 4, x + 16, y + 16, 2);
    g.line(x + 28, y + 4, x + 16, y + 16, 2);
  },
  init() {
    this.map = [
      1,1,1,1,1,1,1,1,
      1,0,0,0,0,0,0,1,
      1,0,1,1,0,1,0,1,
      1,0,1,0,0,1,0,1,
      1,0,0,0,1,1,0,1,
      1,0,1,0,0,0,0,1,
      1,0,0,0,0,0,0,1,
      1,1,1,1,1,1,1,1
    ];
    this.posX = 1.5; this.posY = 1.5;
    this.dirX = 1.0; this.dirY = 0.0;
    this.planeX = 0.0; this.planeY = 0.66;
  },
  update(dt) {
    const rotSpd = 2.0 * dt;
    const moveSpd = 3.0 * dt;

    if (PAD.state.left) {
      const oldDirX = this.dirX;
      this.dirX = this.dirX * Math.cos(-rotSpd) - this.dirY * Math.sin(-rotSpd);
      this.dirY = oldDirX * Math.sin(-rotSpd) + this.dirY * Math.cos(-rotSpd);
      const oldPlaneX = this.planeX;
      this.planeX = this.planeX * Math.cos(-rotSpd) - this.planeY * Math.sin(-rotSpd);
      this.planeY = oldPlaneX * Math.sin(-rotSpd) + this.planeY * Math.cos(-rotSpd);
    }
    if (PAD.state.right) {
      const oldDirX = this.dirX;
      this.dirX = this.dirX * Math.cos(rotSpd) - this.dirY * Math.sin(rotSpd);
      this.dirY = oldDirX * Math.sin(rotSpd) + this.dirY * Math.cos(rotSpd);
      const oldPlaneX = this.planeX;
      this.planeX = this.planeX * Math.cos(rotSpd) - this.planeY * Math.sin(rotSpd);
      this.planeY = oldPlaneX * Math.sin(rotSpd) + this.planeY * Math.cos(rotSpd);
    }
    if (PAD.state.up) {
      this.posX += this.dirX * moveSpd;
      this.posY += this.dirY * moveSpd;
    }
  },
  render(g) {
    E4.render(g, this.map, 8, 8, this.posX, this.posY, this.dirX, this.dirY, this.planeX, this.planeY);
  }
};
