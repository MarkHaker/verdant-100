// js/pad.js
// ============================================================================
// [PAD] INPUT MANAGER (KEYBOARD + MULTI-TOUCH D-PAD + GESTURES + HAPTICS)
// ============================================================================
const PAD = {
  state: {
    up: false, down: false, left: false, right: false,
    a: false, b: false, start: false, select: false
  },
  hits: {
    up: false, down: false, left: false, right: false,
    a: false, b: false, start: false, select: false
  },
  rels: {
    up: false, down: false, left: false, right: false,
    a: false, b: false, start: false, select: false
  },

  swipe: null,
  tilt: { x: 0, y: 0 },
  longPress: false,

  setDown(k) {
    if (!this.state[k]) {
      this.hits[k] = true;
    }
    this.state[k] = true;
  },

  setUp(k) {
    if (this.state[k]) {
      this.rels[k] = true;
    }
    this.state[k] = false;
  },

  hit(k) {
    return !!this.hits[k];
  },

  held(k) {
    return !!this.state[k];
  },

  rel(k) {
    return !!this.rels[k];
  },

  vibrate(ms = 8) {
    if (typeof SAVE !== 'undefined' && SAVE.data && SAVE.data.set && SAVE.data.set.vib && navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  },

  tick() {
    for (let k in this.hits) {
      this.hits[k] = false;
      this.rels[k] = false;
    }
    this.swipe = null;
  },

  init() {
    const codeMap = {
      'ArrowUp': 'up', 'KeyW': 'up',
      'ArrowDown': 'down', 'KeyS': 'down',
      'ArrowLeft': 'left', 'KeyA': 'left',
      'ArrowRight': 'right', 'KeyD': 'right',
      'KeyZ': 'a', 'KeyJ': 'a', 'Space': 'a', 'KeyC': 'a',
      'KeyX': 'b', 'KeyK': 'b', 'KeyV': 'b',
      'Enter': 'start', 'NumpadEnter': 'start',
      'ShiftLeft': 'select', 'ShiftRight': 'select', 'Tab': 'select',
      'Escape': 'b', 'Backspace': 'b'
    };

    const keyMap = {
      'arrowup': 'up', 'w': 'up', 'ц': 'up',
      'arrowdown': 'down', 's': 'down', 'ы': 'down',
      'arrowleft': 'left', 'a': 'left', 'ф': 'left',
      'arrowright': 'right', 'd': 'right', 'в': 'right',
      'z': 'a', 'я': 'a', 'j': 'a', 'о': 'a', ' ': 'a', 'c': 'a', 'с': 'a',
      'x': 'b', 'ч': 'b', 'k': 'b', 'л': 'b', 'v': 'b', 'м': 'b',
      'enter': 'start',
      'shift': 'select', 'tab': 'select',
      'escape': 'b', 'backspace': 'b'
    };

    window.addEventListener('keydown', (e) => {
      APU.init();
      const action = codeMap[e.code] || (e.key ? keyMap[e.key.toLowerCase()] : null);
      if (action) {
        if (!this.state[action]) this.vibrate(8);
        this.setDown(action);
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('keyup', (e) => {
      const action = codeMap[e.code] || (e.key ? keyMap[e.key.toLowerCase()] : null);
      if (action) {
        this.setUp(action);
        e.preventDefault();
      }
    }, { passive: false });

    const attachButton = (el, actionKey) => {
      if (!el) return;
      const onDown = (e) => {
        APU.init();
        el.classList.add('active');
        this.setDown(actionKey);
        this.vibrate(10);
        if (e.cancelable) e.preventDefault();
      };
      const onUp = (e) => {
        el.classList.remove('active');
        this.setUp(actionKey);
        if (e.cancelable) e.preventDefault();
      };

      el.addEventListener('pointerdown', onDown, { passive: false });
      el.addEventListener('pointerup', onUp, { passive: false });
      el.addEventListener('pointercancel', onUp, { passive: false });
      el.addEventListener('pointerleave', onUp, { passive: false });
      el.addEventListener('touchstart', onDown, { passive: false });
      el.addEventListener('touchend', onUp, { passive: false });
      el.addEventListener('touchcancel', onUp, { passive: false });
      el.addEventListener('mousedown', onDown);
      el.addEventListener('mouseup', onUp);
    };

    attachButton(document.getElementById('btn-a'), 'a');
    attachButton(document.getElementById('btn-b'), 'b');
    attachButton(document.getElementById('btn-select'), 'select');
    attachButton(document.getElementById('col-select'), 'select');
    attachButton(document.getElementById('btn-start'), 'start');
    attachButton(document.getElementById('col-start'), 'start');

    const dpadZone = document.getElementById('dpad-zone');
    const dpadButtons = {
      up: document.querySelector('.dpad-up'),
      down: document.querySelector('.dpad-down'),
      left: document.querySelector('.dpad-left'),
      right: document.querySelector('.dpad-right')
    };

    for (let dir in dpadButtons) {
      attachButton(dpadButtons[dir], dir);
    }

    let dpadTracking = false;
    let dpadPointerId = null;

    const updateDpadFromCoords = (clientX, clientY) => {
      const rect = dpadZone.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const nextState = { up: false, down: false, left: false, right: false };

      if (dist > 10) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle >= -135 && angle <= -45) nextState.up = true;
        else if (angle >= 45 && angle <= 135) nextState.down = true;
        else if (Math.abs(angle) > 135) nextState.left = true;
        else if (Math.abs(angle) < 45) nextState.right = true;
      }

      for (let dir in nextState) {
        if (nextState[dir] !== this.state[dir]) {
          if (nextState[dir]) {
            this.setDown(dir);
            this.vibrate(8);
            if (dpadButtons[dir]) dpadButtons[dir].classList.add('active');
          } else {
            this.setUp(dir);
            if (dpadButtons[dir]) dpadButtons[dir].classList.remove('active');
          }
        }
      }
    };

    const clearDpad = () => {
      dpadTracking = false;
      dpadPointerId = null;
      ['up', 'down', 'left', 'right'].forEach(dir => {
        this.setUp(dir);
        if (dpadButtons[dir]) dpadButtons[dir].classList.remove('active');
      });
    };

    if (dpadZone) {
      dpadZone.addEventListener('pointerdown', (e) => {
        APU.init();
        dpadTracking = true;
        dpadPointerId = e.pointerId;
        try { dpadZone.setPointerCapture(e.pointerId); } catch (_) {}
        updateDpadFromCoords(e.clientX, e.clientY);
        if (e.cancelable) e.preventDefault();
      }, { passive: false });

      dpadZone.addEventListener('pointermove', (e) => {
        if (dpadTracking && e.pointerId === dpadPointerId) {
          updateDpadFromCoords(e.clientX, e.clientY);
          if (e.cancelable) e.preventDefault();
        }
      }, { passive: false });

      dpadZone.addEventListener('pointerup', (e) => {
        if (e.pointerId === dpadPointerId) clearDpad();
      }, { passive: false });

      dpadZone.addEventListener('pointercancel', (e) => {
        if (e.pointerId === dpadPointerId) clearDpad();
      }, { passive: false });

      dpadZone.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length > 0) {
          updateDpadFromCoords(e.touches[0].clientX, e.touches[0].clientY);
          if (e.cancelable) e.preventDefault();
        }
      }, { passive: false });

      dpadZone.addEventListener('touchend', () => clearDpad(), { passive: false });
    }

    // Direct click/tap support on screen for Pause Menu items
    const screenCanvas = document.getElementById('screen-canvas');
    if (screenCanvas) {
      screenCanvas.addEventListener('click', (e) => {
        if (VOS.mode !== 'PAUSE') return;
        const rect = screenCanvas.getBoundingClientRect();
        const scaleX = 256 / rect.width;
        const scaleY = 240 / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Pause menu box: X: 24..232, startY: 56, itemH: 16
        if (x >= 24 && x <= 232) {
          const idx = Math.floor((y - 56) / 16);
          if (idx >= 0 && idx < 8) {
            VOS.pauseCursor = idx;
            APU.sfx('UI_OK');
            if (idx === 0) {
              VOS.resumeGame();
            } else if (idx === 1) {
              VOS.mode = 'GAME';
              VOS.activeCart.init();
            } else if (idx === 2) {
              SAVE.data.set.vol = (SAVE.data.set.vol + 1) % 11;
              APU.setVolume(SAVE.data.set.vol / 10);
              SAVE.commit();
            } else if (idx === 3) {
              SAVE.data.set.crt = SAVE.data.set.crt ? 0 : 1;
              SAVE.commit();
              const crtEl = document.getElementById('crt-scanlines');
              if (crtEl) crtEl.classList.toggle('disabled', !SAVE.data.set.crt);
            } else if (idx === 4) {
              GHOST_MODE = !GHOST_MODE;
              SAVE.data.set.ghost = GHOST_MODE ? 1 : 0;
              SAVE.commit();
            } else if (idx === 5) {
              SAVE.data.set.vib = SAVE.data.set.vib ? 0 : 1;
              SAVE.commit();
            } else if (idx === 7) {
              VOS.exitToMenu();
            }
          }
        }
      });
    }

    const btnMute = document.getElementById('btn-mute');
    if (btnMute) {
      btnMute.addEventListener('click', () => {
        const isMuted = APU.toggleMute();
        btnMute.textContent = isMuted ? 'MUTE: ON' : 'MUTE: OFF';
      });
    }

    const btnCrt = document.getElementById('btn-crt');
    const scanlinesEl = document.getElementById('crt-scanlines');
    if (btnCrt && scanlinesEl) {
      btnCrt.addEventListener('click', () => {
        SAVE.data.set.crt = SAVE.data.set.crt ? 0 : 1;
        SAVE.commit();
        scanlinesEl.classList.toggle('disabled', !SAVE.data.set.crt);
        btnCrt.textContent = SAVE.data.set.crt ? 'CRT: ON' : 'CRT: OFF';
      });
    }

    const btnFs = document.getElementById('btn-fs');
    if (btnFs) {
      btnFs.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
          btnFs.textContent = 'WINDOWED';
        } else {
          document.exitFullscreen().catch(() => {});
          btnFs.textContent = 'FULLSCREEN';
        }
      });
    }

    const btnMenu = document.getElementById('btn-menu');
    if (btnMenu) {
      btnMenu.addEventListener('click', () => {
        if (VOS.mode === 'GAME') {
          VOS.pauseGame();
        } else if (VOS.mode === 'PAUSE') {
          VOS.exitToMenu();
        }
      });
    }

    const btnPower = document.getElementById('btn-power');
    if (btnPower) {
      btnPower.addEventListener('click', () => {
        APU.init();
        VOS.togglePower();
      });
    }
  }
};