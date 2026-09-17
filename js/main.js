// js/main.js
// ============================================================================
// [MAIN] BOOTSTRAP & 60 FPS ACCUMULATOR GAME LOOP
// ============================================================================
let acc = 0;
let lastTime = performance.now();

function tick() {
  const now = performance.now();
  let dt = now - lastTime;
  lastTime = now;
  if (dt < 0) dt = 0;
  if (dt > 100) dt = 100;
  acc += dt;

  while (acc >= 1000 / 60) {
    VOS.update(1 / 60);
    PAD.tick();
    acc -= 1000 / 60;
  }

  VOS.render(GFX);
}

function frame() {
  tick();
  requestAnimationFrame(frame);
}

// Backup interval ensures simulation ticks even if rAF throttles
setInterval(() => {
  if (performance.now() - lastTime > 60) {
    tick();
  }
}, 33);

function updateConsoleScale() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxWByHeight = (vh * 0.96) / 1.75;
  const maxWByWidth = vw * 0.96;
  const w = Math.min(maxWByWidth, maxWByHeight, 450);
  const h = w * 1.75;
  const u = w / 400;

  document.documentElement.style.setProperty('--chassis-w', `${w}px`);
  document.documentElement.style.setProperty('--chassis-h', `${h}px`);
  document.documentElement.style.setProperty('--u', `${u}px`);
}

window.addEventListener('resize', updateConsoleScale);
window.addEventListener('orientationchange', updateConsoleScale);

function startConsole() {
  console.log("[VERDANT-100] Initializing system...");
  updateConsoleScale();
  GFX.init();
  PAD.init();
  VOS.init();
  requestAnimationFrame(frame);
  console.log("[VERDANT-100] System ready! 100 cartridges operational.");
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startConsole);
} else {
  startConsole();
}
