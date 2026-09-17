// js/apu.js
// ============================================================================
// [APU] 4-CHANNEL CHIPTUNE AUDIO PROCESSING UNIT & SEQUENCER
// ============================================================================
const APU = {
  ctx: null,
  masterGain: null,
  compressor: null,
  noiseBuffer: null,
  volume: 0.7,
  muted: false,
  musicTimer: null,
  musicStep: 0,
  isMusicPlaying: false,

  init() {
    try {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        return;
      }
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.ctx = new AudioContext();

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(40, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(8, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume * 0.25, this.ctx.currentTime);

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Create 1-second white noise buffer
      const bufferSize = this.ctx.sampleRate;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } catch (e) {
      console.warn('APU init warning (waiting for user interaction):', e);
    }
  },

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume * 0.25, this.ctx.currentTime);
      } catch (e) {}
    }
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume * 0.25, this.ctx.currentTime);
      } catch (e) {}
    }
    return this.muted;
  },

  // Soft Ambient Synthesizer for warm, relaxing, melodious tones
  softTone(freq, dur = 0.8, type = 'sine', vol = 0.08, delay = 0, attack = 0.04, cutoff = 1200) {
    try {
      this.init();
      if (!this.ctx || this.muted) return;
      const t0 = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(cutoff, t0);

      osc.type = type; // 'sine' or 'triangle'
      osc.frequency.setValueAtTime(Math.max(20, freq), t0);

      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(vol, t0 + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);

      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch (e) {}
  },

  tone(freq, dur = 0.1, type = 'triangle', vol = 0.15, slideTo = null, delay = 0) {
    try {
      this.init();
      if (!this.ctx || this.muted) return;
      const t0 = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, freq), t0);
      if (slideTo !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
      }

      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(vol, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(gain);
      gain.connect(this.compressor);

      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (e) {}
  },

  noise(dur = 0.15, vol = 0.2, filterFreq = 800, filterType = 'bandpass', delay = 0) {
    try {
      this.init();
      if (!this.ctx || !this.noiseBuffer || this.muted) return;
      const t0 = this.ctx.currentTime + delay;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(filterFreq, t0);
      filter.Q.setValueAtTime(2.0, t0);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);

      src.start(t0);
      src.stop(t0 + dur + 0.02);
    } catch (e) {}
  },

  sfx(name) {
    switch (name) {
      case 'UI_MOVE':
        this.softTone(587.33, 0.04, 'triangle', 0.06, 0, 0.005, 1400);
        break;
      case 'UI_OK':
        this.softTone(523.25, 0.08, 'sine', 0.08, 0, 0.01, 1600);
        this.softTone(659.25, 0.14, 'sine', 0.08, 0.05, 0.01, 1600);
        break;
      case 'UI_BACK':
        this.softTone(587.33, 0.07, 'triangle', 0.07, 0, 0.01, 1400);
        this.softTone(392.00, 0.10, 'triangle', 0.06, 0.04, 0.01, 1200);
        break;
      case 'INSERT':
        this.noise(0.06, 0.12, 350, 'lowpass');
        this.softTone(261.63, 0.10, 'triangle', 0.08, 0.03, 0.02, 1000);
        this.softTone(523.25, 0.20, 'sine', 0.08, 0.07, 0.02, 1400);
        break;
      case 'COIN':
        this.softTone(987.77, 0.08, 'sine', 0.08, 0, 0.01, 1800);
        this.softTone(1318.51, 0.18, 'sine', 0.08, 0.05, 0.01, 1800);
        break;
      case 'JUMP':
        this.softTone(220, 0.10, 'sine', 0.07, 0, 0.01, 1000);
        break;
      case 'HIT':
        this.softTone(200, 0.06, 'triangle', 0.10, 0, 0.005, 700);
        this.noise(0.04, 0.08, 500);
        break;
      case 'BOOM':
        this.noise(0.35, 0.25, 220, 'lowpass');
        this.softTone(90, 0.28, 'sine', 0.16, 0, 0.02, 280);
        break;
      case 'POWER':
        [330, 440, 554, 659].forEach((f, i) => this.softTone(f, 0.16, 'sine', 0.06, i * 0.05, 0.02, 1600));
        break;
      case 'HURT':
        this.softTone(240, 0.10, 'triangle', 0.10, 0, 0.01, 600);
        this.noise(0.06, 0.08, 250);
        break;
      case 'TICK':
        this.softTone(880, 0.015, 'sine', 0.03, 0, 0.003, 1400);
        break;
      case 'ALARM':
        this.softTone(660, 0.08, 'sine', 0.07, 0, 0.01, 1200);
        this.softTone(880, 0.08, 'sine', 0.07, 0.08, 0.01, 1200);
        break;
      case 'SPLASH':
        this.noise(0.15, 0.14, 900, 'bandpass');
        break;
      case 'SWISH':
        this.noise(0.08, 0.10, 1500, 'bandpass');
        break;
      case 'DENY':
        this.softTone(160, 0.08, 'triangle', 0.08, 0, 0.01, 700);
        this.softTone(130, 0.12, 'triangle', 0.08, 0.06, 0.01, 700);
        break;
      case 'LEVELUP':
        [261.63, 329.63, 392.00, 523.25, 659.25, 784.00].forEach((f, idx) => {
          this.softTone(f, 0.18, 'sine', 0.06, idx * 0.07, 0.01, 1800);
        });
        break;
    }
  },

  jingle(cartId) {
    const baseFreqs = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const n1 = baseFreqs[(cartId * 3) % baseFreqs.length];
    const n2 = baseFreqs[(cartId * 5 + 2) % baseFreqs.length];
    this.softTone(n1, 0.14, 'sine', 0.08, 0, 0.01, 1600);
    this.softTone(n2, 0.22, 'sine', 0.08, 0.08, 0.01, 1600);
  },

  bootJingle() {
    this.softTone(330.00, 0.20, 'sine', 0.06, 0.00, 0.03, 1200);
    this.softTone(440.00, 0.25, 'sine', 0.07, 0.08, 0.03, 1400);
    this.softTone(659.25, 0.45, 'sine', 0.08, 0.18, 0.03, 1600);
    this.softTone(880.00, 0.80, 'sine', 0.06, 0.32, 0.04, 1800);
  },

  startMenuMusic() {
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // Peaceful, ambient chord progression: Cmaj9 -> Am9 -> Fmaj7 -> G6/Em7
    const chordPads = [
      { bass: 130.81, freqs: [196.00, 246.94, 329.63], dur: 3.5 }, // Cmaj9
      { bass: 110.00, freqs: [164.81, 196.00, 246.94], dur: 3.5 }, // Am9
      { bass: 87.31,  freqs: [174.61, 220.00, 261.63], dur: 3.5 }, // Fmaj7
      { bass: 98.00,  freqs: [146.83, 196.00, 246.94], dur: 3.5 }  // G6
    ];

    // Melodic music-box chimes: sparse, gentle, relaxing notes (seconds, Hz, duration, volume)
    const melodyPattern = [
      [0.2,  329.63, 1.4, 0.055], // E4
      [1.1,  392.00, 1.2, 0.050], // G4
      [2.0,  493.88, 1.5, 0.055], // B4
      [2.9,  587.33, 1.1, 0.045], // D5

      [3.8,  523.25, 1.8, 0.055], // C5
      [4.8,  493.88, 1.2, 0.050], // B4
      [5.7,  392.00, 1.6, 0.055], // G4

      [7.4,  440.00, 1.5, 0.055], // A4
      [8.4,  329.63, 1.2, 0.050], // E4
      [9.3,  392.00, 1.3, 0.050], // G4
      [10.1, 440.00, 1.2, 0.050], // A4

      [11.0, 392.00, 1.4, 0.050], // G4
      [11.9, 293.66, 1.3, 0.050], // D4
      [12.8, 329.63, 1.8, 0.055]  // E4
    ];

    const cycleSeconds = 14.4;
    const barDuration = 3.6;
    let cycleStartTime = Date.now();

    const scheduleCycle = () => {
      if (!this.isMusicPlaying) return;

      // Play the 4 ambient pad chords across 14.4 seconds
      chordPads.forEach((chord, barIdx) => {
        const barDelay = barIdx * barDuration;
        // Warm deep root bass
        this.softTone(chord.bass, chord.dur, 'sine', 0.045, barDelay, 0.12, 350);
        // Soft shimmering chord notes
        chord.freqs.forEach(f => {
          this.softTone(f, chord.dur, 'triangle', 0.022, barDelay, 0.18, 650);
        });
      });

      // Play the peaceful melodic chimes
      melodyPattern.forEach(item => {
        const [timeSec, freq, dur, vol] = item;
        this.softTone(freq, dur, 'sine', vol, timeSec, 0.035, 1300);
      });

      // Schedule next cycle seamlessly
      this.musicTimer = setTimeout(() => {
        if (this.isMusicPlaying) scheduleCycle();
      }, cycleSeconds * 1000);
    };

    scheduleCycle();
  },

  stopMenuMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
};
