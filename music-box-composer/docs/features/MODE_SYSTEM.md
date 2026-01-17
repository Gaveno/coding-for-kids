# Feature: Multi-Mode Complexity System

## Overview

Three distinct experience modes that progressively unlock features, allowing the app to serve ages 3-18+ with appropriate complexity levels and visual themes.

---

## Mode Definitions

### 🧸 Kid Mode (Ages 3-6)
**Theme:** Bright colors, large emojis, playful animals

| Aspect | Implementation |
|--------|----------------|
| **Visual** | Large touch targets (60px+), high contrast, bouncy animations |
| **Piano** | Only white keys visible (7 notes), no sharps/flats |
| **Key Selection** | Hidden - locked to C Major |
| **Percussion** | 4 sounds (current set) |
| **Timeline** | Max 16 beats, simplified beat markers |
| **Speed** | 2 speeds only (🐢 slow, 🐰 fast) |
| **Duration** | Hidden - all notes 1 beat |

### 🎸 Tween Mode (Ages 7-12)
**Theme:** Neon/gaming aesthetic, gradient backgrounds, dynamic effects

| Aspect | Implementation |
|--------|----------------|
| **Visual** | Standard touch targets (48px), animated transitions |
| **Piano** | Full 12-note chromatic keyboard |
| **Key Selection** | Visible - all 16 keys available |
| **Percussion** | 8 sounds (add: tom, cymbal, shaker, cowbell) |
| **Timeline** | Max 64 beats, full beat markers |
| **Speed** | 4 speeds (current set) |
| **Duration** | Note duration selector (1-4 beats) |
| **New Features** | Velocity/volume per note, tap-tempo |

### 🎛️ Studio Mode (Ages 13+)
**Theme:** Pro DAW-inspired, dark mode, compact layout

| Aspect | Implementation |
|--------|----------------|
| **Visual** | Compact touch targets (44px), minimal animations |
| **Piano** | Multi-octave keyboard (2-3 octaves) |
| **Key Selection** | Full key selector + custom scale builder |
| **Percussion** | 12+ sounds (full drum kit) |
| **Timeline** | Unlimited beats (scroll), zoom controls |
| **Speed** | BPM input (40-200 BPM) |
| **Duration** | Full duration (1-8 beats) + ties |
| **New Features** | Waveform selection, effects (reverb/delay), WAV export |

---

## Technical Architecture

### Mode State Management

```javascript
// In Game.js
class Game {
    static MODES = {
        KID: 'kid',
        TWEEN: 'tween', 
        STUDIO: 'studio'
    };
    
    static MODE_CONFIGS = {
        kid: {
            maxBeats: 16,
            showSharps: false,
            showKeySelector: false,
            showDuration: false,
            speeds: [0, 2],  // indices into speeds array
            percussionCount: 4
        },
        tween: {
            maxBeats: 64,
            showSharps: true,
            showKeySelector: true,
            showDuration: true,
            speeds: [0, 1, 2, 3],
            percussionCount: 8
        },
        studio: {
            maxBeats: 128,
            showSharps: true,
            showKeySelector: true,
            showDuration: true,
            speeds: 'bpm',  // Uses BPM input instead
            percussionCount: 12
        }
    };
}
```

### CSS Theming

```css
/* In variables.css */
:root {
    /* Base theme (Kid Mode) */
    --mode: 'kid';
    --bg-primary: #fff5e6;
    --accent-primary: #ff6b6b;
    --touch-target-size: 60px;
    --animation-bounce: 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

[data-mode="tween"] {
    --bg-primary: #1a1a2e;
    --accent-primary: #00f5d4;
    --touch-target-size: 48px;
    --animation-bounce: 0.2s ease-out;
}

[data-mode="studio"] {
    --bg-primary: #0d0d0d;
    --accent-primary: #4a9eff;
    --touch-target-size: 44px;
    --animation-bounce: 0.1s ease-out;
}
```

### URL Serialization

Mode is encoded in the URL header (2 bits):
```
v4_{mode}{base64data}
  └── 0=kid, 1=tween, 2=studio
```

---

## Implementation Tasks

> **⚠️ MAINTENANCE INSTRUCTIONS**
> 
> - Update task status immediately after completing each task
> - Add verification notes with date when testing
> - If a task is blocked, note the blocker and mark as ⏸️
> - Do NOT proceed to Review phase until all tasks show ✅

### Phase 1: Core Infrastructure
**Status:** ✅ Complete (Jan 17, 2026)

- [x] **Task 1.1** - Mode State in Game.js
  - Add `currentMode` property to Game class
  - Add `setMode(mode)` method
  - Add `getModeConfig()` helper method
  - Persist mode in localStorage for returning users
  
- [x] **Task 1.2** - Mode Selector UI
  - Add mode toggle button group in header
  - Icons: 🧸 / 🎸 / 🎛️
  - Touch-friendly (min 44px targets)
  - Animate transition between modes
  
- [x] **Task 1.3** - CSS Theme Variables
  - Create mode-specific CSS custom properties
  - Add `[data-mode]` attribute to `<body>`
  - Implement Kid Mode theme (bright, playful)
  - Implement Tween Mode theme (neon, gaming)
  - Implement Studio Mode theme (dark, professional)

- [x] **Task 1.4** - Feature Flag System
  - Create `isFeatureEnabled(featureName)` method
  - Gate existing features based on mode config
  - Ensure graceful degradation (hide, don't break)

### Phase 2: Kid Mode Restrictions
**Status:** ✅ Complete (Jan 17, 2026)

- [x] **Task 2.1** - Piano Keyboard Simplification
  - Hide black keys (sharps/flats) in Kid Mode
  - Increase white key size for larger touch targets
  - Lock to C Major (no key selector)
  
- [x] **Task 2.2** - Timeline Simplification
  - Limit to 16 beats maximum
  - Hide duration controls
  - Simplify beat markers (show only 4, 8, 12, 16)
  
- [x] **Task 2.3** - Speed Simplification
  - Show only 2 speeds: 🐢 and 🐰
  - Increase icon sizes
  
- [x] **Task 2.4** - UI Polish
  - Larger emojis throughout
  - More bounce in animations
  - Celebratory effects on play

### Phase 3: Tween Mode Features
**Status:** ✅ Complete (Jan 17, 2026)

- [x] **Task 3.1** - Extended Percussion
  - Add 4 new percussion sounds to Audio.js
  - Create palette buttons for new sounds
  - Gate behind Tween Mode check
  
- [x] **Task 3.2** - Velocity/Volume Control
  - Add velocity property to note data model
  - Create volume slider on note long-press
  - Display volume indicator on timeline notes
  
- [x] **Task 3.3** - Tap Tempo
  - Add tap tempo button
  - Calculate BPM from tap intervals
  - Convert to nearest speed preset

- [x] **Task 3.4** - Visual Theme
  - Implement neon glow effects
  - Add gradient backgrounds
  - Create smooth transition animations

### Phase 4: Studio Mode Features
**Status:** ✅ Complete (Jan 17, 2026)

- [x] **Task 4.1** - Multi-Octave Keyboard
  - Extend PianoKeyboard for 2-3 octaves
  - Add octave shift controls
  - Update Audio.js for extended range
  - ✅ **Completed Jan 17, 2026** - Implemented 5-octave range (2-6) with up/down controls, octave indicators on timeline, full URL serialization support (v5)
  
- [x] **Task 4.2** - BPM Input
  - Replace speed buttons with BPM number input
  - Range: 40-200 BPM
  - Tap tempo integration
  - ✅ **Completed Jan 17, 2026** - BPM input field shown in Studio Mode, tap tempo updates BPM directly, getBeatDuration() returns exact timing
  
- [x] **Task 4.3** - Waveform Selection
  - Add waveform dropdown per track (sine, triangle, square, sawtooth)
  - Update Audio.js oscillator creation
  - Visual indicator on track labels
  - ✅ **Completed Jan 17, 2026** - Waveform selectors on piano tracks with visual symbols (~, △, ⊓, ⩘), URL v6 encoding with 4 additional header bits, mode-based visibility
  
- [x] **Task 4.4** - Basic Effects
  - Add reverb toggle (ConvolverNode)
  - Add delay toggle (DelayNode)
  - Per-track or global effect routing
  - ✅ **Completed Jan 17, 2026** - Implemented per-track reverb and delay effects with ConvolverNode impulse response (2s decay) and DelayNode (300ms, 40% feedback). Effect buttons (🌊 reverb, ⏱️ delay) visible in Studio Mode with active state styling. Effects route through parallel wet/dry mixing with proper gain staging.

- [x] **Task 4.5** - Export Features
  - WAV export using OfflineAudioContext
  - MIDI export (basic note data)
  - Show export buttons in Studio Mode only
  - ✅ **Completed Jan 17, 2026** - WAV export with ADSR envelopes, MIDI Type 1 file generation, export buttons (🎵 🎹) visible in Studio Mode

### Phase 5: URL Serialization Update
**Status:** ✅ Complete (Jan 17, 2026)

- [x] **Task 5.1** - v4 URL Format
  - Design v4 format with mode encoding
  - Implement serialize/deserialize
  - Maintain backward compatibility with v3 URLs
  
- [x] **Task 5.2** - QR Code Updates
  - Ensure mode is preserved in QR
  - Test QR scanning across modes

### Phase 6: Testing & Polish
**Status:** ⏸️ Partial - Core features tested

- [ ] **Task 6.1** - Mode Transition Testing
  - Test all mode transitions without page reload
  - Verify no data loss on mode switch
  - Test with existing v3 URLs
  
- [ ] **Task 6.2** - Mobile Testing
  - Test each mode on iOS Safari
  - Test each mode on Android Chrome
  - Verify touch targets meet minimums per mode
  
- [ ] **Task 6.3** - Accessibility
  - Verify ARIA labels per mode
  - Test keyboard navigation
  - Ensure color contrast ratios

---

## Review Task

> **⚠️ REVIEW REQUIREMENTS**
> 
> This review task must be **explicitly requested** by the developer.
> Do NOT begin review until all Phase 1-6 tasks show ✅.

### Pre-Review Checklist

Before requesting review, verify:
- [ ] All implementation tasks marked ✅
- [ ] Each task has verification date noted
- [ ] No known bugs or blockers remain
- [ ] Mobile testing completed on real devices

### Review Scope

When review is requested, perform the following thorough analysis:

#### 1. Code Quality Review
- [ ] Each JS file under 200 lines
- [ ] No code duplication across modes
- [ ] Feature flags cleanly implemented
- [ ] CSS variables properly scoped

#### 2. Cross-System Impact Analysis
- [ ] **Audio.js**: New sounds/effects properly isolated
- [ ] **Timeline.js**: Mode restrictions don't break core logic
- [ ] **Track.js**: Data model handles all mode variations
- [ ] **DragDrop.js**: Touch behavior consistent across modes
- [ ] **PianoKeyboard.js**: Key hiding doesn't break state
- [ ] **URL Serialization**: v4 format backward compatible
- [ ] **QRCode.js**: Mode encoded correctly

#### 3. User Experience Review
- [ ] Mode transition feels smooth (< 300ms)
- [ ] No jarring visual changes
- [ ] User's work preserved on mode switch
- [ ] Returning users see their last mode

#### 4. Performance Review
- [ ] No memory leaks on mode switch
- [ ] Animation performance on mobile
- [ ] Audio latency unchanged

#### 5. Documentation Review
- [ ] DESIGN.md updated with mode system
- [ ] ROADMAP.md status updated
- [ ] Code comments explain mode logic

### Review Sign-Off

| Reviewer | Date | Status | Notes |
|----------|------|--------|-------|
| | | | |

---

## Related Documents

- [Roadmap](../ROADMAP.md)
- [Pattern Library Feature](PATTERN_LIBRARY.md) - Depends on mode system
- [Jam Mode Feature](JAM_MODE.md) - Depends on mode system
- [Core Design](../../DESIGN.md)
