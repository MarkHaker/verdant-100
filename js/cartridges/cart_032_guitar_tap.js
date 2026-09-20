// js/cartridges/cart_032_guitar_tap.js
// ============================================================================
// Cartridge #032: GUITAR TAP
// ============================================================================
// 4-Lane Rhythm Highway with 3D Perspective, Chiptune Rock Classics,
// Real Lead Guitar Audio Synthesis, Sustained Holds, Star Power, and Touch Zones.
// ============================================================================

var CARTS = (typeof window !== 'undefined' ? (window.CARTS = window.CARTS || {}) : (global.CARTS = global.CARTS || {}));

CARTS[32] = {
  id: 32,
  name: "GUITAR TAP",
  genre: 3, // RHYTHM
  scoreLabel: "SCORE",
  desc: "SHRED 4-LANE PERSPECTIVE HIGHWAY! HIT TIMED NOTES & SUSTAINED HOLDS IN CHIPTUNE ROCK CLASSICS!",

  // --------------------------------------------------------------------------
  // 3 Authentically Charted Chiptune Rock Classics
  // --------------------------------------------------------------------------
  SONGS: [
    {
      id: 0,
      name: "NEON HIGHWAY",
      bpm: 120,
      genre: "CLASSIC ROCK",
      desc: "120 BPM - PUNCHY 70s HEAVY ROCK RIFF & OVERDRIVEN POWER CHORDS",
      rootBass: [82.41, 110.00, 130.81, 146.83], // E2, A2, C3, D3
      notes: [
        // beat, lane (0..3), dur (beats), freq (Hz), isStar
        [0, 0, 0, 164.81], [1.5, 1, 0, 196.00], [3, 2, 1.0, 220.00],
        [5, 0, 0, 164.81], [6.5, 1, 0, 196.00], [7.5, 3, 0, 233.08], [8, 2, 1.5, 220.00],
        [10.5, 0, 0, 164.81], [12, 1, 0, 196.00], [13.5, 2, 0, 220.00], [14.5, 1, 0, 196.00],
        [15, 0, 2.0, 164.81, true],
        [18, 0, 0, 164.81], [18.5, 0, 0, 164.81], [19, 1, 0, 196.00], [20, 2, 1.0, 220.00],
        [22, 1, 0, 196.00], [22.5, 1, 0, 196.00], [23, 2, 0, 220.00], [24, 3, 1.5, 261.63],
        [26.5, 3, 0, 261.63], [27, 2, 0, 220.00], [27.5, 1, 0, 196.00], [28, 0, 1.0, 164.81],
        [29.5, 1, 0, 196.00], [30, 2, 0, 220.00], [31, 3, 1.5, 293.66, true],
        [34, 0, 0, 164.81], [35, 1, 0, 196.00], [36, 2, 0, 220.00], [37, 3, 1.0, 329.63],
        [38.5, 3, 0, 329.63], [39, 2, 0, 220.00], [39.5, 1, 0, 196.00], [40, 0, 1.0, 164.81],
        [41.5, 1, 0, 196.00], [42, 2, 0, 220.00], [42.5, 3, 0, 293.66], [43, 2, 0, 220.00],
        [43.5, 1, 0, 196.00], [44, 2, 1.5, 220.00], [46, 2, 0, 220.00], [46.5, 2, 0, 220.00],
        [47, 3, 1.5, 329.63, true],
        [50, 0, 0, 164.81], [50.5, 1, 0, 196.00], [51, 2, 0, 220.00], [51.5, 3, 0, 293.66],
        [52, 2, 0, 220.00], [52.5, 1, 0, 196.00], [53, 0, 1.5, 164.81],
        [55, 1, 0, 196.00], [55.5, 2, 0, 220.00], [56, 3, 1.0, 329.63],
        [57.5, 2, 0, 220.00], [58, 1, 0, 196.00], [59, 0, 0, 164.81],
        [60, 0, 0, 164.81], [60.5, 2, 0, 220.00], [61, 3, 3.0, 329.63, true]
      ]
    },
    {
      id: 1,
      name: "CYBER SHREDDER",
      bpm: 144,
      genre: "POWER METAL",
      desc: "144 BPM - SYNTHWAVE SPEED METAL GALLOP & HARMONIC SWEEPS",
      rootBass: [73.42, 87.31, 98.00, 110.00], // D2, F2, G2, A2
      notes: [
        // Intro Gallop
        [0, 0, 0, 146.83], [0.5, 0, 0, 146.83], [1, 1, 0, 174.61], [1.5, 2, 0, 220.00],
        [2, 0, 0, 146.83], [2.5, 0, 0, 146.83], [3, 3, 1.0, 293.66],
        [4.5, 0, 0, 146.83], [5, 1, 0, 174.61], [5.5, 2, 0, 220.00], [6, 1, 0, 174.61],
        [6.5, 0, 0, 146.83], [7, 2, 1.0, 220.00],
        [8.5, 0, 0, 146.83], [9, 0, 0, 146.83], [9.5, 1, 0, 174.61], [10, 2, 0, 220.00],
        [10.5, 3, 0, 293.66], [11, 2, 0, 220.00], [11.5, 1, 0, 174.61], [12, 0, 1.5, 146.83],
        [14, 1, 0, 174.61], [14.5, 2, 0, 220.00], [15, 3, 1.5, 349.23, true],

        // Section 2: Arpeggio Sweeps
        [17, 0, 0, 146.83], [17.5, 1, 0, 174.61], [18, 2, 0, 220.00], [18.5, 3, 0, 293.66],
        [19, 2, 0, 220.00], [19.5, 1, 0, 174.61], [20, 0, 1.0, 146.83],
        [21.5, 0, 0, 146.83], [22, 1, 0, 174.61], [22.5, 2, 0, 220.00], [23, 3, 1.0, 392.00],
        [24.5, 3, 0, 392.00], [25, 2, 0, 293.66], [25.5, 1, 0, 220.00], [26, 0, 1.0, 146.83],
        [27.5, 1, 0, 174.61], [28, 2, 0, 220.00], [28.5, 3, 0, 293.66], [29, 2, 0, 220.00],
        [29.5, 1, 0, 174.61], [30, 2, 0, 220.00], [30.5, 3, 1.5, 349.23],
        [32.5, 3, 0, 349.23], [33, 2, 0, 293.66], [33.5, 1, 0, 220.00], [34, 0, 1.5, 146.83, true],

        // Section 3: Speed Riffing
        [36, 0, 0, 146.83], [36.5, 0, 0, 146.83], [37, 2, 0, 220.00], [37.5, 2, 0, 220.00],
        [38, 1, 0, 174.61], [38.5, 3, 0, 293.66], [39, 2, 1.0, 220.00],
        [40.5, 0, 0, 146.83], [41, 1, 0, 174.61], [41.5, 2, 0, 220.00], [42, 3, 1.0, 349.23],
        [43.5, 3, 0, 349.23], [44, 2, 0, 293.66], [44.5, 1, 0, 220.00], [45, 0, 0, 146.83],
        [45.5, 1, 0, 174.61], [46, 2, 0, 220.00], [46.5, 3, 1.5, 440.00],
        [48.5, 2, 0, 349.23], [49, 1, 0, 261.63], [49.5, 0, 1.0, 146.83],
        [51, 1, 0, 174.61], [51.5, 2, 0, 220.00], [52, 3, 1.5, 392.00, true],

        // Section 4: Blistering Outro Shred
        [54, 0, 0, 146.83], [54.5, 1, 0, 174.61], [55, 2, 0, 220.00], [55.5, 3, 0, 293.66],
        [56, 3, 0, 349.23], [56.5, 2, 0, 293.66], [57, 1, 0, 220.00], [57.5, 0, 0, 146.83],
        [58, 0, 0, 146.83], [58.5, 1, 0, 174.61], [59, 2, 0, 220.00], [59.5, 3, 1.0, 392.00],
        [61, 2, 0, 293.66], [61.5, 1, 0, 220.00], [62, 0, 1.0, 146.83],
        [63.5, 1, 0, 174.61], [64, 2, 0, 220.00], [64.5, 3, 0, 349.23], [65, 3, 0, 392.00],
        [65.5, 3, 1.5, 440.00], [67.5, 2, 0, 293.66], [68, 1, 0, 220.00], [68.5, 0, 0, 146.83],
        [69, 0, 0, 146.83], [69.5, 2, 0, 220.00], [70, 3, 3.0, 440.00, true]
      ]
    },
    {
      id: 2,
      name: "DRAGON'S SOLO",
      bpm: 168,
      genre: "THRASH SOLO",
      desc: "168 BPM - LIGHTNING SPEED TWO-HANDED TAPPING & THRASH CLIMAX",
      rootBass: [61.74, 82.41, 98.00, 110.00], // B1, E2, G2, A2
      notes: [
        // Rapid Tapping Intro
        [0, 0, 0, 246.94], [0.5, 1, 0, 293.66], [1, 2, 0, 369.99], [1.5, 3, 0, 493.88],
        [2, 2, 0, 369.99], [2.5, 1, 0, 293.66], [3, 0, 0, 246.94], [3.5, 2, 0, 369.99],
        [4, 3, 1.0, 587.33],
        [5.5, 2, 0, 369.99], [6, 1, 0, 293.66], [6.5, 0, 0, 246.94], [7, 1, 0, 293.66],
        [7.5, 2, 0, 369.99], [8, 3, 0, 493.88], [8.5, 3, 0, 587.33], [9, 3, 1.5, 659.25],

        [11, 0, 0, 246.94], [11.5, 0, 0, 246.94], [12, 1, 0, 293.66], [12.5, 2, 0, 369.99],
        [13, 3, 0, 493.88], [13.5, 2, 0, 369.99], [14, 1, 0, 293.66], [14.5, 0, 1.0, 246.94],
        [16, 1, 0, 293.66], [16.5, 2, 0, 369.99], [17, 3, 0, 493.88], [17.5, 3, 0, 587.33],
        [18, 3, 1.5, 659.25, true],

        // Section 2: Shred Cascades
        [20, 0, 0, 246.94], [20.5, 1, 0, 293.66], [21, 0, 0, 246.94], [21.5, 2, 0, 369.99],
        [22, 0, 0, 246.94], [22.5, 3, 0, 493.88], [23, 2, 0, 369.99], [23.5, 1, 0, 293.66],
        [24, 0, 1.0, 246.94],
        [25.5, 3, 0, 587.33], [26, 2, 0, 369.99], [26.5, 1, 0, 293.66], [27, 0, 0, 246.94],
        [27.5, 1, 0, 293.66], [28, 2, 0, 369.99], [28.5, 3, 1.0, 659.25],
        [30, 2, 0, 369.99], [30.5, 1, 0, 293.66], [31, 2, 0, 369.99], [31.5, 3, 1.5, 783.99],

        [33.5, 3, 0, 659.25], [34, 2, 0, 493.88], [34.5, 1, 0, 369.99], [35, 0, 1.0, 246.94],
        [36.5, 1, 0, 293.66], [37, 2, 0, 369.99], [37.5, 3, 0, 587.33], [38, 3, 1.5, 659.25, true],

        // Section 3: Dual Harmonic Climbing Runs
        [40, 0, 0, 246.94], [40.5, 0, 0, 246.94], [41, 1, 0, 293.66], [41.5, 1, 0, 293.66],
        [42, 2, 0, 369.99], [42.5, 2, 0, 369.99], [43, 3, 0, 493.88], [43.5, 3, 0, 587.33],
        [44, 3, 1.0, 659.25],
        [45.5, 2, 0, 369.99], [46, 1, 0, 293.66], [46.5, 0, 0, 246.94], [47, 0, 0, 246.94],
        [47.5, 1, 0, 293.66], [48, 2, 0, 369.99], [48.5, 3, 1.5, 659.25],
        [50.5, 3, 0, 783.99], [51, 2, 0, 587.33], [51.5, 1, 0, 369.99], [52, 0, 1.0, 246.94],
        [53.5, 1, 0, 293.66], [54, 2, 0, 369.99], [54.5, 3, 1.5, 659.25, true],

        // Section 4: Hyper-Speed Thrash Climax
        [56.5, 0, 0, 246.94], [57, 1, 0, 293.66], [57.5, 2, 0, 369.99], [58, 3, 0, 493.88],
        [58.5, 3, 0, 587.33], [59, 2, 0, 369.99], [59.5, 1, 0, 293.66], [60, 0, 0, 246.94],
        [60.5, 1, 0, 293.66], [61, 2, 0, 369.99], [61.5, 3, 0, 493.88], [62, 3, 0, 587.33],
        [62.5, 3, 1.0, 659.25],
        [64, 2, 0, 369.99], [64.5, 1, 0, 293.66], [65, 0, 1.0, 246.94],
        [66.5, 0, 0, 246.94], [67, 1, 0, 293.66], [67.5, 2, 0, 369.99], [68, 3, 0, 587.33],
        [68.5, 3, 0, 659.25], [69, 3, 0, 783.99], [69.5, 2, 0, 587.33], [70, 1, 0, 369.99],
        [70.5, 0, 0, 246.94], [71, 1, 0, 293.66], [71.5, 2, 0, 369.99], [72, 3, 4.0, 783.99, true]
      ]
    }
  ],

  // --------------------------------------------------------------------------
  // Cartridge Icon (32x32 Electric Rock Guitar)
  // --------------------------------------------------------------------------
  icon(g, x, y) {
    g.rect(x, y, 32, 32, 0);
    g.box(x, y, 32, 32, 2);
    // Guitar Body
    g.disc(x + 16, y + 21, 8, 2);
    g.disc(x + 12, y + 17, 5, 2);
    g.disc(x + 20, y + 17, 5, 2);
    g.disc(x + 16, y + 21, 5, 3);
    // Sound hole / Pickups
    g.box(x + 14, y + 18, 5, 6, 0);
    g.line(x + 13, y + 26, x + 19, y + 26, 3); // Bridge
    // Neck & Headstock
    g.rect(x + 15, y + 5, 3, 13, 3);
    g.line(x + 14, y + 5, x + 18, y + 5, 3); // Headstock
    g.px(x + 13, y + 4, 3); g.px(x + 19, y + 4, 3); // Tuning pegs
    // Strings
    g.line(x + 15, y + 5, x + 15, y + 26, 0);
    g.line(x + 17, y + 5, x + 17, y + 26, 0);
  },

  // --------------------------------------------------------------------------
  // Lifecycle: init()
  // --------------------------------------------------------------------------
  init() {
    this.state = 'TITLE'; // 'TITLE' | 'COUNTDOWN' | 'PLAYING' | 'FAILED' | 'COMPLETED'
    this.selectedSong = 0;
    this.countdownTimer = 3.0;

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.rockMeter = 50.0; // 0..100%
    this.starEnergy = 0.0; // 0..100%
    this.starActive = false;
    this.starTimer = 0.0;
    this.songTime = 0.0;
    this.totalSongTime = 0.0;
    this.lastDrumStep = -1;

    this.notes = [];
    this.particles = [];
    this.judgments = [];
    this.stats = { perfect: 0, great: 0, good: 0, miss: 0, total: 0 };
    this.isNewRecord = false;
    this.gameTime = 0;

    // Track active hold states
    this.activeHolds = [null, null, null, null];

    // Pointer input tracking
    this.lastPointerDown = false;

    // Lane press states for visual strike buttons
    this.lanePressState = [false, false, false, false];
  },

  // --------------------------------------------------------------------------
  // Audio Synthesis Routines (Lead Guitar, Buzz, Screech & Drums)
  // --------------------------------------------------------------------------
  playGuitar(freq, dur = 0.22, isStar = false) {
    if (typeof APU === 'undefined') return;
    try {
      APU.init();
      // Overdriven lead guitar tone
      APU.tone(freq, dur, 'triangle', isStar ? 0.20 : 0.16);
      APU.softTone(freq * 1.5, dur * 0.7, 'sine', 0.08, 0, 0.005, 2400);
      if (isStar) {
        APU.softTone(freq * 2, dur * 0.5, 'sine', 0.06, 0.02, 0.005, 3000);
      }
    } catch (e) {}
  },

  playHoldBuzz(freq) {
    if (typeof APU === 'undefined') return;
    try {
      APU.init();
      const detune = (Math.random() - 0.5) * 6;
      APU.softTone(freq + detune, 0.06, 'triangle', 0.12, 0, 0.004, 1800);
    } catch (e) {}
  },

  playMissScreech() {
    if (typeof APU === 'undefined') return;
    try {
      APU.init();
      APU.noise(0.06, 0.15, 350, 'bandpass');
      APU.tone(85, 0.08, 'sawtooth', 0.12);
    } catch (e) {}
  },

  playDrumBeat(step, rootFreq) {
    if (typeof APU === 'undefined') return;
    try {
      APU.init();
      const beat = step % 4;
      if (beat === 0) {
        // Kick Drum & Driving Bass pulse
        APU.tone(110, 0.07, 'sine', 0.16, 45);
        APU.noise(0.02, 0.05, 180, 'lowpass');
        if (rootFreq) APU.softTone(rootFreq, 0.22, 'triangle', 0.11, 0, 0.01, 800);
      } else if (beat === 2) {
        // Snare Drum
        APU.noise(0.07, 0.14, 1400, 'bandpass');
        APU.tone(180, 0.04, 'triangle', 0.08);
      } else {
        // Hi-hat
        APU.noise(0.015, 0.035, 4000, 'highpass');
      }
    } catch (e) {}
  },

  // --------------------------------------------------------------------------
  // Song Loader & Highway Setup
  // --------------------------------------------------------------------------
  loadSong(songIndex) {
    this.selectedSong = songIndex;
    const song = this.SONGS[songIndex];
    this.songTime = -2.0; // 2-second lead-in countdown
    this.countdownTimer = 2.0;
    this.state = 'COUNTDOWN';

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.rockMeter = 50.0;
    this.starEnergy = 0.0;
    this.starActive = false;
    this.starTimer = 0.0;
    this.lastDrumStep = -1;
    this.isNewRecord = false;
    this.particles = [];
    this.judgments = [];
    this.activeHolds = [null, null, null, null];

    const secPerBeat = 60.0 / song.bpm;
    this.notes = song.notes.map((n, idx) => {
      const beat = n[0];
      const lane = n[1];
      const dur = n[2] || 0;
      const freq = n[3];
      const isStar = !!n[4];
      const timeSec = beat * secPerBeat;
      const durSec = dur * secPerBeat;
      return {
        id: idx,
        beat,
        lane,
        dur,
        freq,
        isStar,
        time: timeSec,
        durSec: durSec,
        hit: false,
        holding: false,
        completed: false,
        missed: false,
        holdTicks: 0,
        y: -999
      };
    });

    const lastNote = this.notes[this.notes.length - 1];
    this.totalSongTime = lastNote ? (lastNote.time + lastNote.durSec + 2.5) : 30.0;
    this.stats = { perfect: 0, great: 0, good: 0, miss: 0, total: this.notes.length };
  },

  // --------------------------------------------------------------------------
  // Multiplier calculation (Normal x1..x4, Star Power x2..x8)
  // --------------------------------------------------------------------------
  getMultiplier() {
    let base = 1;
    if (this.combo >= 30) base = 4;
    else if (this.combo >= 20) base = 3;
    else if (this.combo >= 10) base = 2;
    return this.starActive ? base * 2 : base;
  },

  // --------------------------------------------------------------------------
  // Highway Geometry & 3D Perspective Math
  // --------------------------------------------------------------------------
  // Horizon: Y0 = 32, vanishing point X = 128
  // Hit Line: Yhit = 190
  // Perspective mapping: progress p in [0, 1] -> y = 32 + 158 * (p ^ 1.65)
  getPerspectiveY(p) {
    if (p <= 0) return 32;
    return 32 + 158 * Math.pow(Math.max(0, p), 1.65);
  },

  getHighwayLeftX(y) {
    const ty = Math.max(0, Math.min(1.2, (y - 32) / 158));
    return 100 - 64 * ty; // 100 at horizon, 36 at hit line
  },

  getHighwayRightX(y) {
    const ty = Math.max(0, Math.min(1.2, (y - 32) / 158));
    return 156 + 64 * ty; // 156 at horizon, 220 at hit line
  },

  getLaneX(lane, y) {
    const left = this.getHighwayLeftX(y);
    const right = this.getHighwayRightX(y);
    const w = right - left;
    return left + (lane + 0.5) * (w / 4);
  },

  getApproachDuration() {
    // Difficulty speed scaling
    let mult = 1.0;
    if (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) {
      if (VOS.difficulty === 0) mult = 0.75; // EASY: slower, longer approach
      else if (VOS.difficulty === 2) mult = 1.4; // HARD: faster approach
    }
    return 1.7 / mult;
  },

  // --------------------------------------------------------------------------
  // Input queries (Keyboard, Gamepad, Touch Strike Zones)
  // --------------------------------------------------------------------------
  isLanePressed(lane, pointerDown, justTouched) {
    if (typeof PAD === 'undefined') return false;
    let padHit = false;
    if (lane === 0) padHit = PAD.hit('left');
    else if (lane === 1) padHit = PAD.hit('down');
    else if (lane === 2) padHit = PAD.hit('up');
    else if (lane === 3) padHit = PAD.hit('right') || PAD.hit('a');

    let touchHit = false;
    if (justTouched && PAD.pointer && PAD.pointer.y >= 160) {
      const px = PAD.pointer.x;
      if (lane === 0 && px < 65) touchHit = true;
      else if (lane === 1 && px >= 65 && px < 125) touchHit = true;
      else if (lane === 2 && px >= 125 && px < 185) touchHit = true;
      else if (lane === 3 && px >= 185) touchHit = true;
    }
    return padHit || touchHit;
  },

  isLaneHeld(lane, pointerDown) {
    if (typeof PAD === 'undefined') return false;
    let padHeld = false;
    if (lane === 0) padHeld = PAD.held('left');
    else if (lane === 1) padHeld = PAD.held('down');
    else if (lane === 2) padHeld = PAD.held('up');
    else if (lane === 3) padHeld = PAD.held('right') || PAD.held('a');

    let touchHeld = false;
    if (pointerDown && PAD.pointer && PAD.pointer.y >= 160) {
      const px = PAD.pointer.x;
      if (lane === 0 && px < 65) touchHeld = true;
      else if (lane === 1 && px >= 65 && px < 125) touchHeld = true;
      else if (lane === 2 && px >= 125 && px < 185) touchHeld = true;
      else if (lane === 3 && px >= 185) touchHeld = true;
    }
    return padHeld || touchHeld;
  },

  // --------------------------------------------------------------------------
  // Hit Detection & Timing Windows (+-6px PERFECT, +-14px GREAT, +-22px GOOD)
  // --------------------------------------------------------------------------
  checkLaneHit(lane) {
    const hitLineY = 190;
    let closestNote = null;
    let minDiff = 999;

    for (let i = 0; i < this.notes.length; i++) {
      const n = this.notes[i];
      if (n.lane === lane && !n.hit && !n.missed && n.y > 100) {
        const diff = Math.abs(n.y - hitLineY);
        if (diff < minDiff) {
          minDiff = diff;
          closestNote = n;
        }
      }
    }

    if (closestNote && minDiff <= 22) {
      closestNote.hit = true;
      const mult = this.getMultiplier();
      let rating = 'GOOD';
      let pts = 50;
      let hpGain = 1.5;
      let starGain = 1.0;
      let pColor = 2;
      let pCount = 4;

      if (minDiff <= 6) {
        rating = 'PERFECT';
        pts = 300;
        hpGain = 5.0;
        starGain = closestNote.isStar ? 15.0 : 3.5;
        pColor = 3;
        pCount = 12;
        this.stats.perfect++;
      } else if (minDiff <= 14) {
        rating = 'GREAT';
        pts = 150;
        hpGain = 3.0;
        starGain = closestNote.isStar ? 10.0 : 2.0;
        pColor = 3;
        pCount = 8;
        this.stats.great++;
      } else {
        this.stats.good++;
      }

      this.score += pts * mult;
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.rockMeter = Math.min(100.0, this.rockMeter + hpGain);
      this.starEnergy = Math.min(100.0, this.starEnergy + starGain);

      // Play lead guitar synth
      this.playGuitar(closestNote.freq, closestNote.durSec > 0 ? closestNote.durSec : 0.22, closestNote.isStar);
      if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(8);

      // Floating judgment & particle burst
      const targetX = this.getLaneX(lane, hitLineY);
      this.addJudgment(rating, targetX, hitLineY - 14, pColor);
      this.addBurst(targetX, hitLineY, pColor, pCount);

      // Initialize sustained hold tracking
      if (closestNote.durSec > 0) {
        closestNote.holding = true;
        this.activeHolds[lane] = closestNote;
      }
      return true;
    }

    // Empty strum / timing error
    this.combo = 0;
    this.rockMeter = Math.max(0, this.rockMeter - 5.0);
    this.playMissScreech();
    if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(15);
    const targetX = this.getLaneX(lane, hitLineY);
    this.addJudgment("STRUM ERR", targetX, hitLineY - 12, 1);
    return false;
  },

  // --------------------------------------------------------------------------
  // Visual Effects (Particles & Judgment Text)
  // --------------------------------------------------------------------------
  addBurst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 60 + 20;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 4,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 30,
        color: color,
        life: 0.35 + Math.random() * 0.2
      });
    }
  },

  addJudgment(text, x, y, color) {
    this.judgments.push({
      text: text,
      x: x,
      y: y,
      color: color,
      timer: 0.55
    });
  },

  // --------------------------------------------------------------------------
  // Star Power Activation
  // --------------------------------------------------------------------------
  activateStarPower() {
    if (this.starEnergy >= 50.0 && !this.starActive) {
      this.starActive = true;
      this.starTimer = 10.0; // 10 seconds of x2 multiplier & neck flames
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('POWER');
      if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(30);
      this.addJudgment("★ STAR POWER! ★", 128, 120, 3);
      this.addBurst(128, 190, 3, 20);
    }
  },

  // --------------------------------------------------------------------------
  // Game Loop: update(dt)
  // --------------------------------------------------------------------------
  update(dt) {
    // Substep clamp for dt stability at HARD 1.4x or lag spikes
    dt = Math.min(0.05, Math.max(0.001, dt));
    this.gameTime += dt;

    const pointerDown = !!(typeof PAD !== 'undefined' && PAD.pointer && PAD.pointer.down);
    const justTouched = pointerDown && !this.lastPointerDown;

    // ------------------------------------------------------------------------
    // STATE: TITLE / SONG SELECT
    // ------------------------------------------------------------------------
    if (this.state === 'TITLE') {
      // Cycle songs with Left / Right
      if (typeof PAD !== 'undefined' && (PAD.hit('left') || PAD.hit('right'))) {
        const dir = PAD.hit('right') ? 1 : -1;
        this.selectedSong = (this.selectedSong + dir + this.SONGS.length) % this.SONGS.length;
        if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
      }

      // Cycle difficulty with Up / Down / Select
      if (typeof PAD !== 'undefined' && (PAD.hit('up') || PAD.hit('down') || PAD.hit('select'))) {
        if (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) {
          VOS.difficulty = (VOS.difficulty + 1) % 3;
          if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
        }
      }

      // Touch button handling for song select & difficulty
      if (justTouched && PAD.pointer) {
        const px = PAD.pointer.x, py = PAD.pointer.y;
        if (py >= 65 && py <= 95) {
          // Song select arrows
          if (px < 60) {
            this.selectedSong = (this.selectedSong - 1 + this.SONGS.length) % this.SONGS.length;
            if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
          } else if (px > 196) {
            this.selectedSong = (this.selectedSong + 1) % this.SONGS.length;
            if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
          }
        } else if (py >= 105 && py <= 135) {
          // Difficulty toggle
          if (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) {
            VOS.difficulty = (VOS.difficulty + 1) % 3;
            if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_MOVE');
          }
        } else if (py >= 170 && py <= 220) {
          // Tap to Start
          this.loadSong(this.selectedSong);
          if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_OK');
          this.lastPointerDown = pointerDown;
          return;
        }
      }

      // Start song with A or START
      if (typeof PAD !== 'undefined' && (PAD.hit('a') || PAD.hit('start'))) {
        this.loadSong(this.selectedSong);
        if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_OK');
      }
      this.lastPointerDown = pointerDown;
      return;
    }

    // ------------------------------------------------------------------------
    // STATE: COUNTDOWN (3... 2... 1... ROCK!)
    // ------------------------------------------------------------------------
    if (this.state === 'COUNTDOWN') {
      this.countdownTimer -= dt;
      this.songTime += dt;
      if (this.countdownTimer <= 0) {
        this.state = 'PLAYING';
      }
      this.lastPointerDown = pointerDown;
      return;
    }

    // ------------------------------------------------------------------------
    // STATE: FAILED or COMPLETED
    // ------------------------------------------------------------------------
    if (this.state === 'FAILED' || this.state === 'COMPLETED') {
      if (typeof PAD !== 'undefined' && (PAD.hit('a') || PAD.hit('b') || PAD.hit('start') || justTouched)) {
        this.state = 'TITLE';
        if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('UI_BACK');
      }
      this.lastPointerDown = pointerDown;
      return;
    }

    // ------------------------------------------------------------------------
    // STATE: PLAYING (Active 3D Rhythm Simulation)
    // ------------------------------------------------------------------------
    this.songTime += dt;
    const song = this.SONGS[this.selectedSong];
    const approachDur = this.getApproachDuration();
    const hitLineY = 190;

    // Star Power timer & energy drain
    if (this.starActive) {
      this.starTimer -= dt;
      this.starEnergy = Math.max(0, (this.starTimer / 10.0) * 100.0);
      if (this.starTimer <= 0) {
        this.starActive = false;
        this.starEnergy = 0;
      }
    }

    // Star Power activation via [B] or tapping Star Power button
    if (typeof PAD !== 'undefined' && PAD.hit('b')) {
      this.activateStarPower();
    }
    if (justTouched && PAD.pointer && PAD.pointer.x >= 170 && PAD.pointer.y <= 36) {
      this.activateStarPower();
    }

    // Backing rhythm section & drum accompaniment
    const secPerBeat = 60.0 / song.bpm;
    const currentStep = Math.floor(this.songTime / secPerBeat);
    if (currentStep > this.lastDrumStep && currentStep >= 0) {
      this.lastDrumStep = currentStep;
      const rootIndex = Math.floor(currentStep / 8) % song.rootBass.length;
      this.playDrumBeat(currentStep, song.rootBass[rootIndex]);
    }

    // Update Highway Notes (3D perspective position calculation)
    for (let i = 0; i < this.notes.length; i++) {
      const n = this.notes[i];
      if (n.completed) continue;

      const tRel = n.time - this.songTime;
      const p = 1.0 - (tRel / approachDur);
      n.y = this.getPerspectiveY(p);

      // Miss check: dropped past hit window (+22px)
      if (!n.hit && !n.missed && n.y > hitLineY + 22) {
        n.missed = true;
        this.combo = 0;
        this.stats.miss++;
        this.rockMeter = Math.max(0, this.rockMeter - 8.0);
        this.playMissScreech();
        const targetX = this.getLaneX(n.lane, hitLineY);
        this.addJudgment("MISS", targetX, hitLineY + 10, 1);
      }
    }

    // Input checks for 4 lanes
    for (let lane = 0; lane < 4; lane++) {
      const pressed = this.isLanePressed(lane, pointerDown, justTouched);
      const held = this.isLaneHeld(lane, pointerDown);
      this.lanePressState[lane] = held;

      if (pressed) {
        this.checkLaneHit(lane);
      }

      // Sustained hold updates
      const activeHold = this.activeHolds[lane];
      if (activeHold && activeHold.holding) {
        if (held) {
          activeHold.holdTicks += dt;
          const mult = this.getMultiplier();
          this.score += Math.floor(dt * 200 * mult);
          this.rockMeter = Math.min(100.0, this.rockMeter + dt * 4.0);

          // Hold audio buzz & sparks
          if (Math.random() < 0.3) this.playHoldBuzz(activeHold.freq);
          const targetX = this.getLaneX(lane, hitLineY);
          if (Math.random() < 0.4) this.addBurst(targetX, hitLineY, 3, 2);

          // Check if hold duration completed
          if (this.songTime >= activeHold.time + activeHold.durSec) {
            activeHold.holding = false;
            activeHold.completed = true;
            this.activeHolds[lane] = null;
            this.score += 150 * mult;
            this.addJudgment("HOLD OK!", targetX, hitLineY - 14, 3);
            this.addBurst(targetX, hitLineY, 3, 10);
            if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('COIN');
          }
        } else {
          // Player released early
          activeHold.holding = false;
          activeHold.completed = true;
          this.activeHolds[lane] = null;
        }
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 80 * dt; // gravity
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Update Floating Judgments
    for (let i = this.judgments.length - 1; i >= 0; i--) {
      const j = this.judgments[i];
      j.y -= 25 * dt;
      j.timer -= dt;
      if (j.timer <= 0) this.judgments.splice(i, 1);
    }

    // Game Over: Rock health dropped to 0
    if (this.rockMeter <= 0) {
      this.state = 'FAILED';
      this.activeHolds = [null, null, null, null];
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('BOOM');
      if (typeof PAD !== 'undefined' && PAD.vibrate) PAD.vibrate(60);
      this.lastPointerDown = pointerDown;
      return;
    }

    // Win Check: Reached song end
    if (this.songTime >= this.totalSongTime) {
      this.state = 'COMPLETED';
      this.activeHolds = [null, null, null, null];
      if (typeof APU !== 'undefined' && APU.sfx) APU.sfx('LEVELUP');
      if (typeof SAVE !== 'undefined' && SAVE.setScore) {
        this.isNewRecord = SAVE.setScore(this.id, this.score);
      }
    }

    this.lastPointerDown = pointerDown;
  },

  // --------------------------------------------------------------------------
  // Performance Evaluation & Grades
  // --------------------------------------------------------------------------
  getPerformanceGrade() {
    const hits = this.stats.perfect + this.stats.great + this.stats.good;
    const total = Math.max(1, this.stats.total);
    const acc = (hits / total) * 100.0;

    let rank = 'D';
    let stars = 1;

    if (acc >= 98.0) { rank = 'S'; stars = 5; }
    else if (acc >= 90.0) { rank = 'A'; stars = 4; }
    else if (acc >= 80.0) { rank = 'B'; stars = 3; }
    else if (acc >= 70.0) { rank = 'C'; stars = 2; }

    return { rank, stars, acc: acc.toFixed(1) };
  },

  // --------------------------------------------------------------------------
  // Visual Layout & Rendering: render(g)
  // --------------------------------------------------------------------------
  render(g) {
    g.clear(0);

    // ------------------------------------------------------------------------
    // RENDER: TITLE / SONG SELECT
    // ------------------------------------------------------------------------
    if (this.state === 'TITLE') {
      g.textC("=== GUITAR TAP ===", 14, 3);
      g.textC("4-LANE 3D RHYTHM HIGHWAY", 26, 2);

      // Song Carousel Box
      const song = this.SONGS[this.selectedSong];
      g.box(16, 44, 224, 76, 2);
      g.rect(18, 46, 220, 14, 1);
      g.textC("< SONG " + (this.selectedSong + 1) + "/3 >", 50, 3);

      g.textC(song.name, 68, 3);
      g.textC(song.genre + " | " + song.bpm + " BPM | " + song.notes.length + " NOTES", 82, 2);

      let record = 0;
      if (typeof SAVE !== 'undefined' && SAVE.getScore) record = SAVE.getScore(this.id);
      g.textC("BEST RECORD: " + record, 96, 2);

      // Difficulty Selector
      let diffName = "NORMAL";
      let diffMult = "1.0x";
      if (typeof VOS !== 'undefined' && VOS.difficulty !== undefined) {
        diffName = VOS.getDifficultyName ? VOS.getDifficultyName() : ['EASY', 'NORMAL', 'HARD'][VOS.difficulty];
        diffMult = (VOS.getSpeedMultiplier ? VOS.getSpeedMultiplier() : [0.75, 1.0, 1.4][VOS.difficulty]) + "x";
      }
      g.box(28, 128, 200, 22, 2);
      g.textC("DIFFICULTY: [" + diffName + " " + diffMult + "]", 135, 3);

      // Multi-Platform Controls Guide
      g.textC("CONTROLS: [◀] [▼] [▲] [▶] OR [A]", 162, 2);
      g.textC("STAR POWER: [B] / TAP METER", 174, 2);

      // Blinking Play prompt button
      const blink = Math.floor(this.gameTime * 4) % 2 === 0;
      g.box(36, 194, 184, 24, blink ? 3 : 2);
      g.textC("★ PRESS [A] / [START] TO ROCK! ★", 202, blink ? 3 : 2);
      return;
    }

    // ------------------------------------------------------------------------
    // RENDER: 3D PERSPECTIVE HIGHWAY
    // ------------------------------------------------------------------------
    const song = this.SONGS[this.selectedSong];
    const hitLineY = 190;
    const approachDur = this.getApproachDuration();

    // Highway background & borders
    g.line(100, 32, 36, 202, this.starActive ? 3 : 2); // Left rail
    g.line(156, 32, 220, 202, this.starActive ? 3 : 2); // Right rail

    // Lane dividers (3 inner perspective lines)
    g.line(114, 32, 82, 200, 1);
    g.line(128, 32, 128, 200, 1);
    g.line(142, 32, 174, 200, 1);

    // Subtle string guidelines
    for (let l = 0; l < 4; l++) {
      const topX = 100 + (l + 0.5) * 14;
      const botX = 36 + (l + 0.5) * 46;
      g.line(topX, 32, botX, 200, 1);
    }

    // Scrolling Beat Bars & Fret Markers
    const secPerBeat = 60.0 / song.bpm;
    const startBeat = Math.max(0, Math.floor((this.songTime - 0.2) / secPerBeat));
    const endBeat = Math.ceil((this.songTime + approachDur) / secPerBeat);

    for (let b = startBeat; b <= endBeat; b++) {
      const bTime = b * secPerBeat;
      const tRel = bTime - this.songTime;
      const p = 1.0 - (tRel / approachDur);
      if (p >= 0 && p <= 1.08) {
        const fy = Math.floor(this.getPerspectiveY(p));
        if (fy >= 32 && fy <= 200) {
          const lx = Math.floor(this.getHighwayLeftX(fy));
          const rx = Math.floor(this.getHighwayRightX(fy));
          const isMeasure = (b % 4 === 0);
          g.line(lx, fy, rx, fy, isMeasure ? 2 : 1);

          // Fret marker dots on measure bars
          if (isMeasure && b % 8 === 0) {
            g.disc(128, fy, 2, 1);
          }
        }
      }
    }

    // Star Power Neck Flames
    if (this.starActive) {
      for (let fy = 40; fy <= 190; fy += 12) {
        const lx = Math.floor(this.getHighwayLeftX(fy));
        const rx = Math.floor(this.getHighwayRightX(fy));
        const flmW = Math.floor(3 + Math.sin(this.gameTime * 25 + fy * 0.2) * 3);
        g.line(lx - flmW, fy, lx, fy, 3);
        g.line(rx, fy, rx + flmW, fy, 3);
      }
    }

    // ------------------------------------------------------------------------
    // RENDER: SUSTAINED HOLD RIBBONS & NOTES
    // ------------------------------------------------------------------------
    for (let i = 0; i < this.notes.length; i++) {
      const n = this.notes[i];
      if (n.completed) continue;

      // Draw Hold Ribbon
      if (n.durSec > 0 && n.y > 20) {
        const tRelTail = (n.time + n.durSec) - this.songTime;
        const pTail = 1.0 - (tRelTail / approachDur);
        const yTail = Math.max(32, Math.floor(this.getPerspectiveY(pTail)));
        const yHead = Math.min(hitLineY, Math.floor(n.y));

        if (yHead > yTail && yTail < 200) {
          const ribbonColor = n.holding ? 3 : (n.missed ? 1 : 2);
          for (let ry = yTail; ry <= yHead; ry += 2) {
            const cx = Math.floor(this.getLaneX(n.lane, ry));
            const rw = Math.max(2, Math.floor(2 + 4 * ((ry - 32) / 158)));
            g.line(cx - rw, ry, cx + rw, ry, ribbonColor);
          }
        }
      }

      // Draw Note Head
      if (n.y >= 30 && n.y <= 212 && !n.completed) {
        const nx = Math.floor(this.getLaneX(n.lane, n.y));
        const ny = Math.floor(n.y);
        const ty = Math.max(0, Math.min(1.2, (ny - 32) / 158));
        const nr = Math.max(2, Math.floor(2.5 + 4.5 * ty));

        if (n.isStar) {
          // Glowing Diamond Star Gem
          g.disc(nx, ny, nr + 1, 3);
          g.circle(nx, ny, nr + 2, 2);
          g.px(nx, ny, 0);
        } else {
          // Circular Note Puck with Inner Core
          g.disc(nx, ny, nr, n.missed ? 1 : 3);
          g.circle(nx, ny, nr, 2);
          if (nr >= 4) g.disc(nx, ny, Math.max(1, nr - 3), 0);
          if (nr >= 5) g.px(nx, ny, 3);
        }
      }
    }

    // ------------------------------------------------------------------------
    // RENDER: HIT LINE & CIRCULAR STRIKE TARGETS
    // ------------------------------------------------------------------------
    // Glowing strike line across highway
    g.line(36, hitLineY, 220, hitLineY, this.starActive ? 3 : 2);
    if (this.starActive) {
      g.line(36, hitLineY + 1, 220, hitLineY + 1, 2);
    }

    // 4 Circular Strike Targets
    const laneLabels = ['◀', '▼', '▲', '▶'];
    for (let l = 0; l < 4; l++) {
      const tx = Math.floor(this.getLaneX(l, hitLineY));
      const isHeld = this.lanePressState[l];

      if (isHeld) {
        // Bright illuminated disc on hit / hold
        g.disc(tx, hitLineY, 9, 3);
        g.circle(tx, hitLineY, 11, 2);
        g.disc(tx, hitLineY, 3, 0);
      } else {
        // Crisp target ring
        g.circle(tx, hitLineY, 8, 2);
        g.circle(tx, hitLineY, 7, 1);
        g.disc(tx, hitLineY, 2, 2);
      }
      // Controller guide symbol
      g.text(laneLabels[l], tx - 2, hitLineY + 10, isHeld ? 3 : 2);
    }

    // ------------------------------------------------------------------------
    // RENDER: PARTICLES & FLOATING JUDGMENT TEXT
    // ------------------------------------------------------------------------
    for (let p of this.particles) {
      g.px(Math.floor(p.x), Math.floor(p.y), p.color);
    }

    for (let j of this.judgments) {
      const len = j.text.length;
      g.text(j.text, Math.floor(j.x - len * 2.5), Math.floor(j.y), j.color);
    }

    // ------------------------------------------------------------------------
    // RENDER: ROCK HEALTH METER (Vertical Gauge on Left)
    // ------------------------------------------------------------------------
    g.box(6, 38, 16, 150, 2);
    const meterFillH = Math.floor((this.rockMeter / 100.0) * 146);
    const danger = this.rockMeter < 25.0;
    const blinkDanger = danger && (Math.floor(this.gameTime * 8) % 2 === 0);

    // Render 15 stacked segments
    for (let seg = 0; seg < 15; seg++) {
      const segY = 184 - seg * 10;
      const segVal = (seg + 1) * (100 / 15);
      if (this.rockMeter >= segVal) {
        let segCol = (seg >= 10) ? 3 : (seg >= 5 ? 2 : 1);
        if (danger && blinkDanger) segCol = 3;
        g.rect(8, segY, 12, 8, segCol);
      } else {
        g.rect(8, segY, 12, 8, 0);
      }
    }
    g.text("ROCK", 6, 28, danger ? 3 : 2);

    // ------------------------------------------------------------------------
    // RENDER: TOP STATUS BAR (Score, Multiplier, Star Power)
    // ------------------------------------------------------------------------
    g.text(song.name, 6, 4, 3);
    g.text("SCORE:" + this.score, 6, 16, 3);

    const mult = this.getMultiplier();
    const multText = (this.starActive ? "x" + mult + " STAR!" : "x" + mult);
    g.text(multText, 108, 16, this.starActive ? 3 : 2);
    g.text("C:" + this.combo, 150, 16, this.combo >= 10 ? 3 : 2);

    // Star Power Bar (Right side)
    g.box(174, 3, 76, 9, 2);
    const starFillW = Math.floor((this.starEnergy / 100.0) * 72);
    if (starFillW > 0) {
      g.rect(176, 5, starFillW, 5, this.starActive ? 3 : 2);
    }
    if (this.starEnergy >= 50.0 && !this.starActive) {
      const readyBlink = Math.floor(this.gameTime * 6) % 2 === 0;
      g.text("★READY[B]", 182, 4, readyBlink ? 3 : 0);
    } else {
      g.text("STAR", 198, 4, 2);
    }

    // ------------------------------------------------------------------------
    // RENDER: MOBILE TOUCH STRIKE BUTTONS (Bottom Highway Zone)
    // ------------------------------------------------------------------------
    const touchBtn = [
      { x: 8, w: 54, label: "[◀]GRN" },
      { x: 68, w: 54, label: "[▼]RED" },
      { x: 128, w: 54, label: "[▲]YEL" },
      { x: 188, w: 54, label: "[▶]BLU" }
    ];

    for (let l = 0; l < 4; l++) {
      const b = touchBtn[l];
      const isDown = this.lanePressState[l];
      if (isDown) {
        g.rect(b.x, 214, b.w, 22, 3);
        g.textC(b.label, 222, 0); // dark text on bright phosphor fill
      } else {
        g.box(b.x, 214, b.w, 22, 2);
        g.text(b.label, b.x + 8, 222, 2);
      }
    }

    // ------------------------------------------------------------------------
    // RENDER: COUNTDOWN OVERLAY
    // ------------------------------------------------------------------------
    if (this.state === 'COUNTDOWN') {
      const countNum = Math.ceil(this.countdownTimer);
      const txt = countNum > 0 ? String(countNum) : "ROCK!";
      g.box(84, 96, 88, 36, 3);
      g.rect(86, 98, 84, 32, 0);
      g.textC(txt, 108, 3, 2);
    }

    // ------------------------------------------------------------------------
    // RENDER: SONG FAILED SCREEN
    // ------------------------------------------------------------------------
    if (this.state === 'FAILED') {
      g.rect(24, 50, 208, 140, 0);
      g.box(24, 50, 208, 140, 3);
      g.textC("=== SONG FAILED ===", 62, 3);
      g.textC("THE CROWD BOOED YOU OFF STAGE!", 78, 2);

      const prog = Math.floor(Math.min(100, Math.max(0, (this.songTime / this.totalSongTime) * 100)));
      g.textC("SONG COMPLETED: " + prog + "%", 100, 2);
      g.textC("NOTES HIT: " + (this.stats.perfect + this.stats.great + this.stats.good) + " / " + this.stats.total, 114, 2);
      g.textC("MAX COMBO: " + this.maxCombo, 128, 2);

      const blink = Math.floor(this.gameTime * 4) % 2 === 0;
      g.textC("PRESS [A] / [START] TO RETRY", 160, blink ? 3 : 2);
    }

    // ------------------------------------------------------------------------
    // RENDER: SONG COMPLETED SCREEN
    // ------------------------------------------------------------------------
    if (this.state === 'COMPLETED') {
      g.rect(20, 34, 216, 172, 0);
      g.box(20, 34, 216, 172, 3);

      g.textC("★ SONG CLEARED! ★", 44, 3);

      const evalData = this.getPerformanceGrade();
      let starStr = "";
      for (let s = 0; s < 5; s++) starStr += (s < evalData.stars ? "★ " : "· ");
      g.textC(starStr, 60, 3);

      g.textC("RANK: " + evalData.rank + " (" + evalData.acc + "%)", 76, 3);
      g.textC("FINAL SCORE: " + this.score, 92, 3);

      if (this.isNewRecord) {
        g.textC("★ NEW HIGH SCORE RECORD! ★", 106, 3);
      }

      g.textC("PERFECT: " + this.stats.perfect + " | GREAT: " + this.stats.great, 122, 2);
      g.textC("GOOD: " + this.stats.good + " | MISS: " + this.stats.miss, 134, 2);
      g.textC("MAX COMBO: " + this.maxCombo, 146, 2);

      const blink = Math.floor(this.gameTime * 4) % 2 === 0;
      g.textC("PRESS [A] / [START] TO CONTINUE", 178, blink ? 3 : 2);
    }
  }
};
