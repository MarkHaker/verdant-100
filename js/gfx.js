// js/gfx.js
// ============================================================================
// [GFX] 256x240 RENDERING ENGINE & DRAWING PRIMITIVES
// ============================================================================
let canvas = null;
let ctx = null;
let GHOST_MODE = false;

function ensureCtx() {
  if (!ctx && typeof document !== 'undefined') {
    canvas = document.getElementById('screen-canvas');
    if (canvas) {
      ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) ctx.imageSmoothingEnabled = false;
    }
  }
  return ctx;
}

const GFX = {
  init() {
    ensureCtx();
  },

  clear(c = 0) {
    if (!ensureCtx()) return;
    if (GHOST_MODE) {
      ctx.fillStyle = 'rgba(5,20,8,0.35)';
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = PAL[c | 0];
      ctx.fillRect(0, 0, W, H);
    }
  },

  px(x, y, c = 3) {
    if (!ensureCtx()) return;
    ctx.fillStyle = PAL[c | 0];
    ctx.fillRect(x | 0, y | 0, 1, 1);
  },

  rect(x, y, w, h, c = 2) {
    if (!ensureCtx() || w <= 0 || h <= 0) return;
    ctx.fillStyle = PAL[c | 0];
    ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
  },

  box(x, y, w, h, c = 2) {
    if (!ensureCtx() || w <= 0 || h <= 0) return;
    ctx.fillStyle = PAL[c | 0];
    ctx.fillRect(x | 0, y | 0, w | 0, 1);
    ctx.fillRect(x | 0, (y + h - 1) | 0, w | 0, 1);
    ctx.fillRect(x | 0, y | 0, 1, h | 0);
    ctx.fillRect((x + w - 1) | 0, y | 0, 1, h | 0);
  },

  line(x0, y0, x1, y1, c = 2) {
    if (!ensureCtx()) return;
    x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;
    ctx.fillStyle = PAL[c | 0];
    while (true) {
      ctx.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  },

  circle(cx, cy, r, c = 2) {
    if (!ensureCtx()) return;
    cx |= 0; cy |= 0; r |= 0;
    let x = r, y = 0, err = 0;
    ctx.fillStyle = PAL[c | 0];
    while (x >= y) {
      ctx.fillRect(cx + x, cy + y, 1, 1);
      ctx.fillRect(cx + y, cy + x, 1, 1);
      ctx.fillRect(cx - y, cy + x, 1, 1);
      ctx.fillRect(cx - x, cy + y, 1, 1);
      ctx.fillRect(cx - x, cy - y, 1, 1);
      ctx.fillRect(cx - y, cy - x, 1, 1);
      ctx.fillRect(cx + y, cy - x, 1, 1);
      ctx.fillRect(cx + x, cy - y, 1, 1);
      y++;
      if (err <= 0) err += 2 * y + 1;
      if (err > 0) { x--; err -= 2 * x + 1; }
    }
  },

  disc(cx, cy, r, c = 2) {
    if (!ensureCtx()) return;
    cx |= 0; cy |= 0; r |= 0;
    ctx.fillStyle = PAL[c | 0];
    for (let dy = -r; dy <= r; dy++) {
      const dx = Math.floor(Math.sqrt(r * r - dy * dy));
      ctx.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1);
    }
  },

  tri(x0, y0, x1, y1, x2, y2, c = 2) {
    if (!ensureCtx()) return;
    ctx.fillStyle = PAL[c | 0];
    ctx.beginPath();
    ctx.moveTo(x0 | 0, y0 | 0);
    ctx.lineTo(x1 | 0, y1 | 0);
    ctx.lineTo(x2 | 0, y2 | 0);
    ctx.closePath();
    ctx.fill();
  },

  dither(x, y, w, h, c1 = 1, c2 = 2) {
    if (!ensureCtx() || w <= 0 || h <= 0) return;
    x |= 0; y |= 0; w |= 0; h |= 0;
    if (x >= W || y >= H || x + w <= 0 || y + h <= 0) return;
    const x0 = Math.max(0, x);
    const y0 = Math.max(0, y);
    const x1 = Math.min(W, x + w);
    const y1 = Math.min(H, y + h);
    const rw = x1 - x0;
    const rh = y1 - y0;
    if (rw <= 0 || rh <= 0) return;

    const imgData = ctx.createImageData(rw, rh);
    const d32 = new Uint32Array(imgData.data.buffer);
    const rgb1 = PAL_RGB[c1 | 0] || PAL_RGB[0];
    const rgb2 = PAL_RGB[c2 | 0] || PAL_RGB[1];
    const p1 = (255 << 24) | (rgb1[2] << 16) | (rgb1[1] << 8) | rgb1[0];
    const p2 = (255 << 24) | (rgb2[2] << 16) | (rgb2[1] << 8) | rgb2[0];

    for (let j = 0; j < rh; j++) {
      const rowOffset = j * rw;
      const jParity = (y0 + j) & 1;
      for (let i = 0; i < rw; i++) {
        d32[rowOffset + i] = (((x0 + i) & 1) ^ jParity) ? p2 : p1;
      }
    }
    ctx.putImageData(imgData, x0, y0);
  },

  sprite(x, y, w, h, rows, c = 3, scale = 1) {
    if (!ensureCtx()) return;
    ctx.fillStyle = PAL[c | 0];
    scale |= 0; if (scale < 1) scale = 1;
    for (let r = 0; r < h; r++) {
      const rowVal = rows[r];
      for (let col = 0; col < w; col++) {
        if ((rowVal >> (w - 1 - col)) & 1) {
          ctx.fillRect((x + col * scale) | 0, (y + r * scale) | 0, scale, scale);
        }
      }
    }
  },

  text(str, x, y, c = 3, scale = 1) {
    if (!ensureCtx()) return;
    str = String(str).toUpperCase();
    x |= 0; y |= 0; scale |= 0; if (scale < 1) scale = 1;
    ctx.fillStyle = PAL[c | 0];
    let curX = x;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === '\n') {
        curX = x;
        y += 7 * scale;
        continue;
      }
      const glyph = FONT_4x6[ch] || FONT_4x6['?'] || [0,0,0,0,0,0];
      for (let r = 0; r < 6; r++) {
        const row = glyph[r];
        if (!row) continue;
        for (let col = 0; col < 4; col++) {
          if ((row >> (3 - col)) & 1) {
            ctx.fillRect(curX + col * scale, y + r * scale, scale, scale);
          }
        }
      }
      curX += 5 * scale;
    }
  },

  textC(str, y, c = 3, scale = 1) {
    str = String(str).toUpperCase();
    scale |= 0; if (scale < 1) scale = 1;
    const textW = (str.length * 5 - 1) * scale;
    const x = Math.floor((W - textW) / 2);
    this.text(str, x, y, c, scale);
  },

  textR(str, x, y, c = 3, scale = 1) {
    str = String(str).toUpperCase();
    scale |= 0; if (scale < 1) scale = 1;
    const textW = (str.length * 5 - 1) * scale;
    this.text(str, x - textW, y, c, scale);
  }
};
