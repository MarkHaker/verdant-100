<p align="center">
  <b>English</b> | <a href="README_RU.md">Русский</a> | <a href="README_ZH.md">简体中文</a>
</p>

# 📟 VERDANT-100 — Retro Phosphor Handheld Console

> **100 Built-In Cartridges in One Vintage Handheld · Pure Vanilla Web Platform · Zero Dependencies**

![License: MIT](https://img.shields.io/badge/License-MIT-4ef574?style=for-the-badge)
![Platform: Web](https://img.shields.io/badge/Platform-HTML5%20%7C%20Canvas2D%20%7C%20WebAudio-1b7a32?style=for-the-badge)
![Games: 100](https://img.shields.io/badge/Games-100%20Cartridges-0e3816?style=for-the-badge)
![FPS: 60](https://img.shields.io/badge/FPS-60%20Hz%20Phosphor%20CRT-4ef574?style=for-the-badge)

🎮 **[Play Live in Browser (GitHub Pages)](https://markhaker.github.io/verdant-100/)**

**VERDANT-100** is an authentic virtual handheld game console simulator inspired by the late-1980s P1 green-phosphor CRT monitors and early monochrome portables. Packed inside is a full library of **100 complete, handcrafted games** across 10 distinct genres (10 cartridges each) — backed by a custom real-time Web Audio APU chiptune synth, persistent high-score saves, reactive difficulty multipliers, and a tactile retro shell that dynamically scales to any screen, from mobile phones to 4K desktop monitors.

---

## 🎮 Controls

### Keyboard (Desktop / Laptop)
| Console Control | Primary Key | Secondary Keys |
|---|---|---|
| **D-PAD (Up / Down / Left / Right)** | `↑` `↓` `←` `→` | `W` `S` `A` `D` (or Cyrillic `Ц` `Ы` `Ф` `В`) |
| **A Button (Action / Confirm)** | `Z` / `Space` | `C`, `J` |
| **B Button (Back / In-game Action)** | `X` | `V`, `K`, `Backspace` |
| **START (Start / Pause)** | `Enter` | `NumpadEnter` |
| **SORT BY CATEGORY (Filter Genre)** | `Shift` | `Tab` |
| **ESCAPE TO MENU (Instant Exit to Main Menu)** | `Escape` | Chassis `MENU` Dock Button |

### Touchscreen & Mouse
- **Molded D-Pad**: Click the 4 directional arrow buttons or swipe freely within the circular D-Pad zone.
- **START & SORT BY CATEGORY**: Angled tactile pill buttons positioned right beneath the screen.
- **A & B Action Buttons**: Classic round arcade buttons on the right flank with tactile press states.
- **POWER Switch**: Beefy physical power toggle in the top-right corner with a working multicolor status LED.
- **Bottom Utility Dock**: Quick toggles for sound (`MUTE`), scanlines (`CRT`), full-screen scaling (`FULLSCREEN`), and system exit (`MENU`).

---

## ⚡ Key Features

- **Pre-Game Speed & Difficulty Select**:
  - Reaction-driven arcade games feature switchable difficulty multipliers on the cartridge preview card:
    - **EASY (0.75x)** — Relaxed tempo for casual playthroughs.
    - **NORMAL (1.00x)** — Canonical arcade speed.
    - **HARD (1.40x)** — Fast-paced hardcore reflexes.
  - Turn-based logic games (2048, Sokoban, Chess, Sudoku) run without speed modifiers or countdown timers so you can ponder moves at your own leisure.
- **Real-Time Web Audio Chiptune APU**:
  - 100% of sound effects and music are synthesized on the fly using native Web Audio oscillator nodes (Square, Triangle, Sine, Noise) filtered through low-pass filters. Zero external MP3/WAV audio files.
  - Features relaxing ambient menu chords (Cmaj9 → Am9 → Fmaj7 → G6) and soft tactile click feedback.
- **P1 Phosphor Green CRT Pipeline**:
  - Pixel-perfect 256x240 internal canvas raster, authentic horizontal scanlines, corner vignetting, and retro beam-collapse power on/off transitions.
- **Zero External Dependencies**:
  - Zero npm packages, zero libraries, zero build steps. Runs out of the box from any static web server or simply by double-clicking `index.html`.

---

## 📚 Cartridge Catalog (100 Games)

### 🕹️ 1. ARCADE (Cartridges #001 — #010)
| ID | Game | Description |
|---|---|---|
| #001 | **SNAKE** | Classic greedy serpent. Eat apples, grow longer, and avoid walls and self-collision. |
| #002 | **TETRIS** | Pack falling tetromino blocks into gap-free horizontal lines. |
| #003 | **PONG** | Fast paddle duel against an adaptive computer opponent. |
| #004 | **ARKANOID** | Demolish brick formations with bouncing balls and a motorized deflector paddle. |
| #005 | **INVADERS** | Defend earth from descending extraterrestrial marching formations. |
| #006 | **ASTEROIDS** | Vector space flight with realistic momentum, rotation, and hyper-space blasters. |
| #007 | **LUNAR LANDER** | Delicate lunar module descent balancing thruster fuel burn against gravity. |
| #008 | **MISSILE CMD** | Intercept ballistic nuclear warheads with detonating flak batteries. |
| #009 | **FROGGER** | Guide a helpless frog across a multi-lane highway and floating river logs. |
| #010 | **PAC-MAZE** | Chomp maze pellets while dodging patrol ghost AI routines. |

### 🧩 2. PUZZLE (Cartridges #011 — #020)
| ID | Game | Description |
|---|---|---|
| #011 | **2048** | Slide numbered tiles on a 4x4 grid and merge matching powers of two. |
| #012 | **SOKOBAN** | Push warehouse crates onto target goal spots with minimal step count. |
| #013 | **MINESWEEPER** | Classic 9x9 minefield logic. Flag hidden explosives and sweep empty clearings. |
| #014 | **LIGHTS OUT** | Toggle toggle-matrix switches to extinguish all glowing nodes. |
| #015 | **PIPE MANIA** | Rotate pipe segments to form continuous aqueducts before water valves open. |
| #016 | **15-PUZZLE** | Order scrambled numbered sliding tiles 1 through 15. |
| #017 | **MASTERMIND** | Decipher a secret 4-digit color cipher using bulls-and-cows feedback hints. |
| #018 | **NONOGRAM** | Japanese picture logic crosswords: reveal pixel illustrations from numeric clues. |
| #019 | **TOWER HANOI** | Transfer graduated disc stacks between three peg poles following size constraints. |
| #020 | **MATCH-3** | Swap adjacent gems to trigger chain reactions of 3+ matching gems. |

### ⚛️ 3. PHYSICS (Cartridges #021 — #030)
| ID | Game | Description |
|---|---|---|
| #021 | **ARTILLERY** | Calibrate cannon barrel elevation angle and powder charge against dynamic crosswinds. |
| #022 | **ORBIT SLING** | Exploit planetary gravitational slingshots to slingshot satellite probes. |
| #023 | **BRIDGE BUILD** | Design structural girder trusses capable of supporting dynamic transit loads. |
| #024 | **PORTAL DROP** | Shoot dynamic interdimensional portals to slingshot projectiles preserving kinetic momentum. |
| #025 | **FALLING SAND** | Particle sandbox simulation: dynamic sand grain avalanches, fluid water, rock, and fire. |
| #026 | **CHAIN REACT** | Trigger a nuclear fission cluster explosion across dense atomic nodes. |
| #027 | **BILLIARDS 2D** | Pocket pool featuring authentic elastic cue-ball collision physics. |
| #028 | **ROPE SWING** | Build pendulum angular momentum on ropes and time mid-air releases. |
| #029 | **LIQUID SORT** | Decant multi-colored test-tube potions into pure single-color fractions. |
| #030 | **MARBLE MAZE** | Tilt labyrinth floorplates with tilt controls to guide rolling steel marbles into holes. |

### 🎵 4. RHYTHM & REFLEX (Cartridges #031 — #040)
| ID | Game | Description |
|---|---|---|
| #031 | **FLAPPY** | Tap rhythmic wing flaps to navigate tight pipe corridors. |
| #032 | **GUITAR TAP** | Strike fretboard chords in synchronization with descending musical markers. |
| #033 | **WHACK MOLE** | Hammer popping burrowing pests across 9 holes before timer expiration. |
| #034 | **QUICK DRAW** | High-noon cowboy showdown: holster quick-draw reaction upon the audible "DRAW!" signal. |
| #035 | **LINE RUNNER** | Leap spike pits and hurdles at progressively accelerating conveyor speeds. |
| #036 | **DOODLE JUMP** | Bounce up trampoline ledges towards infinite vertical heights. |
| #037 | **TRAFFIC CTRL** | Toggle four-way traffic lights to prevent high-speed intersection pileups. |
| #038 | **DOWNWELL** | Freefall down a subterranean abyss firing gunboots downward to slow descent. |
| #039 | **BALANCE** | Inverted broomstick pendulum balancing challenge on fingertips. |
| #040 | **BLINK MATCH** | Instantaneous cognitive reflex test comparing consecutive glyph flashes. |

### 🛡️ 5. STRATEGY (Cartridges #041 — #050)
| ID | Game | Description |
|---|---|---|
| #041 | **TACTICS** | Grid turn-based warfare: position pikemen, archers, and heavy infantry. |
| #042 | **TOWER DEF** | Erect ballistic defensive turrets along creeping enemy marching lanes. |
| #043 | **NAVAL BATTLE** | 8x8 Battleship grid: triangulate and torpedo opposing dreadnought flotillas. |
| #044 | **VIRUS SPREAD** | Contagion territorial conquest via cell cloning and long-range orbital hops. |
| #045 | **AUTOBATTLER** | Draft unit rosters and watch real-time simulated army clashes unfold. |
| #046 | **CITY 8X8** | Micro urban town planning: balance residential zones, smog-emitting factories, and commercial hubs. |
| #047 | **ANT COLONY** | Pheromone trail network management guiding worker ants to scavenge sugar morsels. |
| #048 | **LEMMINGS** | Assign digger, builder, and blocker specializations to preserve a marching clan. |
| #049 | **MICRO-4X** | 20-turn pocket civilization: technological breakthroughs, star systems, and star fleets. |
| #050 | **REVERSI** | Classic 8x8 Othello: flank and flip opposing stones to seize corner footholds. |

### ⚔️ 6. RPG & ADVENTURE (Cartridges #051 — #060)
| ID | Game | Description |
|---|---|---|
| #051 | **ROGUE 1980** | Pure ASCII dungeon crawler: venture deep into procedural crypts as `@`, chug unknown potions. |
| #052 | **DUNGEON 3D** | Pseudo-3D raycaster labyrinth exploration reminiscent of classic early 90s FPS pioneers. |
| #053 | **TEXT QUEST** | Branching interactive prose fiction: 40 distinct nodes, inventory management, and 3 story endings. |
| #054 | **DECKBUILDER** | Card battler: spend energy crystals on strikes, blocks, and status curses. |
| #055 | **BOSS DUEL** | Titan showdown: read attack tells, execute roll-dodges, and exploit vulnerability windows. |
| #056 | **TAMAGOTCHI** | Phosphor virtual pet: sustain feeding schedules, tidy messes, and nurture companionship. |
| #057 | **ALCHEMY DESK** | Synthesize 30+ compounds starting from prime elemental seeds (Earth, Fire, Water, Air). |
| #058 | **PRISON BREAK** | Evade watchtower spotlights while tunneling through masonry with a hidden spoon. |
| #059 | **DEEP DIVER** | Navigate an exploratory submersible through treacherous abyssal trenches littered with mines. |
| #060 | **MINECART** | High-speed runaway minecart rail coaster: throw switch tracks before derailment. |

### 🏆 7. SPORTS & ACTION (Cartridges #061 — #070)
| ID | Game | Description |
|---|---|---|
| #061 | **3D RACER** | Outrun-style pseudo-3D highway racer: overtake dense traffic along undulating hills. |
| #062 | **RETRO GOLF** | Read fairway contours and power meters to sink delicate green putts. |
| #063 | **AIR HOCKEY** | Lightning-fast air hockey rink showdown against an aggressive digital mallet. |
| #064 | **PENALTY KICK** | Penalty shootout: curl spinning soccer balls past the leaping goalkeeper's gloves. |
| #065 | **ARCHERY** | Olympic target archery: steady aiming reticles against variable wind drift. |
| #066 | **SLALOM SKI** | Alpine downhill skiing: slalom tightly between descending red and blue flag gates. |
| #067 | **BOXING 2D** | 2D ring bout: jabs, hooks, high guards, and counter-punches inside the square circle. |
| #068 | **FISHING ROD** | Sport fishing simulator: cast lures, detect gentle nibbles, and manage line reel tension. |
| #069 | **CURLING** | Winter curling bonspiel: throw polished granite stones and sweep ice to hold the button. |
| #070 | **BOWLING** | Adjust approach vectors and hook spin to demolish ten pins for a clean Strike. |

### 👁️ 8. STEALTH & SURVIVAL (Cartridges #071 — #080)
| ID | Game | Description |
|---|---|---|
| #071 | **METAL GEAR** | Tactical espionage action: slip past patrolling guard vision cones to reach extraction. |
| #072 | **ZOMBIE CABIN** | Fortify cabin windows with lumber barricades against relentless undead swarms. |
| #073 | **SONAR SUB** | Blind submarine navigation: ping active sonar transducers to chart submerged topography. |
| #074 | **BOMB DEFUSE** | High-stakes bomb technician challenge: parse wire schematics before the detonator trips. |
| #075 | **SNIPER** | Scan crowded public plazas through high-magnification scopes to eliminate designated marks. |
| #076 | **LASER MIRROR** | Rotate optical prism mirrors to route coherent laser beams onto target photodiodes. |
| #077 | **CROWD EVAC** | Route panicking civilian crowds past raging structural blazes toward emergency exits. |
| #078 | **FNAF CAMS** | Night security watchman: cycle surveillance monitors and manage auxiliary backup wattage. |
| #079 | **X-RAY SCAN** | Baggage inspection scanner: identify concealed contraband within commuter luggage. |
| #080 | **TURRET 360** | 360-degree point-defense perimeter turret: vaporize incoming swarm missiles. |

### 🧠 9. BRAIN & LOGIC (Cartridges #081 — #090)
| ID | Game | Description |
|---|---|---|
| #081 | **SUDOKU 6X6** | Compact 6x6 number placement: fill grids without duplicating digits across blocks. |
| #082 | **MATH RUSH** | Rapid mental arithmetic under extreme clock pressure: solve missing operator equations. |
| #083 | **MEMORY FLIP** | Classic tile concentration: match paired phosphor hieroglyphs in minimal flips. |
| #084 | **CHIMP TEST** | Working memory benchmark: memorize numerical sequences and tap covered tiles in order. |
| #085 | **STROOP TEST** | Neuropsychological interference drill: identify true font hues while disregarding semantic text. |
| #086 | **SIMON SOUND** | Reproduce escalating sequences of 4 tonal chime frequencies. |
| #087 | **MATRIX IQ** | Raven's progressive matrices: deduce underlying rules across 3x3 abstract geometric grids. |
| #088 | **SPEED TYPER** | Shoot down descending space debris by rapid-firing corresponding keyboard letters. |
| #089 | **ODD PIXEL** | Visual acuity test: pinpoint the solitary anomalous symbol within sprawling glyph matrices. |
| #090 | **BINARY BYTE** | Flip 8-bit binary registers (128..1) to synthesize targeted base-10 integers. |

### 🔬 10. SIMULATION & SANDBOX (Cartridges #091 — #100)
| ID | Game | Description |
|---|---|---|
| #091 | **LIFE** | Conway's Game of Life: witness gliders, oscillators, and pulsars emerge from simple rules. |
| #092 | **THERMOSTAT** | Nuclear core thermal manager: balance liquid coolant pumps and graphite control rods. |
| #093 | **GLITCH FIX** | Diagnostic VRAM memory scrubber: purge corrupted video artifact bytes before system crash. |
| #094 | **SINE SYNC** | Oscilloscope calibration: match frequency and phase angles to achieve waveform lock. |
| #095 | **ELEVATOR** | Skyscraper elevator dispatch: optimize multi-floor cabin routing to minimize passenger delays. |
| #096 | **SOLAR TRACK** | Photovoltaic array positioning: adjust solar panel angles toward peak irradiance. |
| #097 | **DICE POKER** | Classic Yacht dice poker: roll five dice over 3 turns to score Full Houses and Straights. |
| #098 | **SHOPKEEPER** | Fantasy merchant barter simulator: buy low from returning adventurers and sell high to nobles. |
| #099 | **ARM WRESTLE** | Rapid-button mash athletic duel: overpower your rival across the arm-wrestling table. |
| #100 | **HACKER TERM** | Cyberpunk command prompt: scan subnet nodes, bypass security ICE, and decrypt neural files. |

---

## 🚀 Getting Started

### Option 1: Instant Play (No Installation Required)
1. Download or clone this repository.
2. Double-click `index.html` in any modern desktop or mobile browser (Chrome, Edge, Safari, Firefox).

### Option 2: Run via Local Static Server
```bash
# Using Node.js (npx)
npx serve .

# Or using Python 3
python -m http.server 8080
```
Open `http://localhost:8080` in your browser.

---

## 🌐 Deploy to GitHub Pages

1. Fork or push this repository to your **GitHub** account.
2. In your GitHub repository, navigate to **Settings** $\to$ **Pages**.
3. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main`, folder `/ (root)`
4. Click **Save**. Within 60 seconds, your handheld is live at:
   `https://<your-username>.github.io/verdant-100/`

---

## 🛠️ Architecture & Source Organization

```
verdant-100/
├── index.html          # Console shell markup, CRT lens, and responsive tactile controls
├── .nojekyll           # GitHub Pages marker (bypasses Jekyll static processing)
├── README.md           # Primary Documentation (English)
├── README_RU.md        # Documentation (Русский)
├── README_ZH.md        # Documentation (简体中文)
├── css/
│   └── console.css     # CSS variable scaling, 3x3 D-Pad grid, scanlines & vignette shaders
└── js/
    ├── config.js       # 4-color phosphor palette, 4x6 bitmap font, genre metadata
    ├── gfx.js          # Hardware-accelerated 128x128 Canvas2D primitive rendering
    ├── apu.js          # 4-channel Web Audio APU synthesizer & relaxing ambient engine
    ├── pad.js          # Unified controller: multi-touch, keyboard bindings & haptics
    ├── save.js         # Non-volatile cartridge save data & records (localStorage)
    ├── engines.js      # 10 shared game engines (Verlet physics, 3D raycaster, BFS, Life)
    ├── carts.js        # 100 complete cartridges with game loops & custom 24x24 icons
    ├── vos.js          # Console OS: cartridge carousel, preview cards, speed multipliers
    └── main.js         # 60 FPS fixed-timestep accumulator game loop & bootstrap
```

---

*Handcrafted with genuine love for the classic golden era of handheld gaming.*
