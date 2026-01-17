# Feature: Live Performance / Jam Mode

## Overview

Transform the sequencer into a real-time instrument with live performance capabilities. Users can play sounds immediately, record performances to the timeline, and jam over loops.

---

## Core Concept

Current flow:
```
Place notes → Press play → Hear music
```

Jam Mode flow:
```
Tap keys → Hear sound immediately → Optionally record to timeline
```

This provides **immediate gratification** and a more intuitive music creation experience.

---

## Feature Definition by Mode

### 🧸 Kid Mode
- **Tap-to-play only** - No recording
- **Big glowing keys** that respond to touch
- **Fun visual feedback** (ripples, sparkles)
- **Single-note polyphony** (one sound at a time)

### 🎸 Tween Mode
- **Tap-to-play** with multi-touch (3-note polyphony)
- **Simple recording** - Record button, plays back loop
- **Quantized recording** - Snaps to nearest beat
- **Loop length** - 4, 8, or 16 beat loops
- **Overdub mode** - Add layers to existing loop

### 🎛️ Studio Mode
- **Full polyphony** (8+ simultaneous notes)
- **Precise recording** - Optional quantization
- **Adjustable quantization** - 1/4, 1/8, 1/16 beat
- **Punch-in recording** - Record only during specific section
- **Duet mode** - Split-screen for two players
- **Metronome** - Audible click during recording

---

## Technical Architecture

### Jam Mode State

```javascript
// In Game.js or new JamMode.js
{
    isJamMode: boolean,       // Jam mode active
    isRecording: boolean,     // Currently recording
    recordStartBeat: number,  // Beat when recording started
    loopLength: number,       // 4, 8, 16 beats
    quantization: number,     // Beat subdivision (1, 0.5, 0.25)
    overdubEnabled: boolean,  // Add to existing or replace
    polyphonyLimit: number,   // Max simultaneous notes
    activeNotes: Set<string>  // Currently held notes
}
```

### Recording Buffer

```javascript
// Temporary storage during recording
recordBuffer: [
    { time: 0.000, note: 'C', type: 'piano', track: 1 },
    { time: 0.523, note: 'kick', type: 'percussion', track: 3 },
    { time: 1.234, note: 'E', type: 'piano', track: 1 },
    // ...
]

// After recording ends, quantize and commit to timeline
```

### New Files Required

| File | Responsibility | Est. Lines |
|------|----------------|------------|
| `JamMode.js` | Jam mode state, recording logic | ~150 |
| `Metronome.js` | Metronome audio and timing | ~60 |
| `styles/jam.css` | Jam mode UI styling | ~80 |

---

## UI Design

### Jam Mode Toggle

```
┌────────────────────────────────────┐
│  [🎹 Sequence]  [🎤 Jam]          │  ← Mode toggle in header
└────────────────────────────────────┘
```

### Kid Mode Jam UI

```
┌────────────────────────────────────┐
│                                    │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐         │
│   │🔴│ │🟡│ │🔵│ │🟣│    ...      │  ← Giant glowing keys
│   │ C │ │ D │ │ E │ │ F │         │
│   └───┘ └───┘ └───┘ └───┘         │
│                                    │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐         │
│   │🥁│ │🪘│ │🔔│ │👏│             │  ← Giant percussion
│   └───┘ └───┘ └───┘ └───┘         │
│                                    │
└────────────────────────────────────┘
```

### Tween/Studio Mode Jam UI

```
┌────────────────────────────────────┐
│ Loop: [4] [8] [16]  Quant: [1/4]  │
│ [⏺️ Record] [🔄 Overdub] [🔊 Metro]│
├────────────────────────────────────┤
│ ●○○○ ○○○○ ○○○○ ○○○○               │  ← Beat indicator
├────────────────────────────────────┤
│      Piano Keyboard               │
│   [🎹🎹🎹🎹🎹🎹🎹🎹🎹🎹🎹🎹]      │
├────────────────────────────────────┤
│   [🥁] [🪘] [🔔] [👏] ...         │  ← Percussion pads
└────────────────────────────────────┘
```

### Duet Mode (Studio)

```
┌─────────────────┬─────────────────┐
│   Player 1 🔵   │   Player 2 🔴   │
│                 │                 │
│  [C][D][E][F]   │  [C][D][E][F]   │
│  [G][A][B][C]   │  [G][A][B][C]   │
│                 │                 │
│  [🥁][🪘]       │  [🔔][👏]       │
└─────────────────┴─────────────────┘
```

---

## Implementation Tasks

> **⚠️ MAINTENANCE INSTRUCTIONS**
> 
> - Update task status immediately after completing each task
> - Add verification notes with date when testing
> - If a task is blocked, note the blocker and mark as ⏸️
> - Do NOT proceed to Review phase until all tasks show ✅

### Prerequisites
- [ ] **Mode System** must be implemented first (see [MODE_SYSTEM.md](MODE_SYSTEM.md))

### Phase 1: Tap-to-Play Foundation
**Status:** 🔲 Not Started

- [ ] **Task 1.1** - Immediate Sound Playback
  - Modify piano keys to play on touch start
  - Modify percussion buttons to play on touch start
  - Bypass timeline completely in jam mode
  - Handle both touch and mouse events
  
- [ ] **Task 1.2** - JamMode.js Class
  - Create JamMode class with state properties
  - `activate()` / `deactivate()` methods
  - `playNote(note, type, track)` for immediate playback
  - Integrate with existing Audio.js
  
- [ ] **Task 1.3** - Jam Mode Toggle UI
  - Add mode toggle in header/controls
  - Clear visual distinction between modes
  - Animate transition between modes
  - Preserve timeline state when switching

- [ ] **Task 1.4** - Visual Feedback
  - Key/button press visual feedback (scale, glow)
  - Ripple effect on touch (CSS animation)
  - Color pulse that matches note color

### Phase 2: Polyphony & Touch Handling
**Status:** 🔲 Not Started

- [ ] **Task 2.1** - Multi-Touch Support
  - Track multiple simultaneous touches
  - Limit polyphony by mode (1/3/8 notes)
  - Handle touch start, move, end, cancel
  
- [ ] **Task 2.2** - Note Release Handling
  - For piano: optional sustain (hold = longer note)
  - For percussion: trigger only (no sustain)
  - Visual feedback on release
  
- [ ] **Task 2.3** - Prevent Accidental Triggers
  - Debounce rapid touches on same key
  - Ignore touches that slide onto keys (optional setting)
  - Handle edge cases (touch cancel, screen rotation)

### Phase 3: Recording System
**Status:** 🔲 Not Started

- [ ] **Task 3.1** - Recording Buffer
  - Create recording buffer data structure
  - Capture timestamp relative to recording start
  - Store note, type, and track info
  
- [ ] **Task 3.2** - Record Start/Stop
  - Record button with clear visual state
  - Count-in option (1 bar before recording starts)
  - Auto-stop when loop completes (optional)
  
- [ ] **Task 3.3** - Quantization
  - Quantize recorded notes to nearest beat subdivision
  - Configurable quantization (1/4, 1/8, 1/16)
  - "No quantization" option for Studio Mode
  
- [ ] **Task 3.4** - Commit to Timeline
  - Convert buffer to timeline note format
  - Merge with or replace existing notes
  - Visual confirmation of added notes

### Phase 4: Loop Playback
**Status:** 🔲 Not Started

- [ ] **Task 4.1** - Metronome.js
  - Create Metronome class
  - Configurable click sound (high/low)
  - Visual beat indicator sync
  - Mute option
  
- [ ] **Task 4.2** - Beat Indicator UI
  - Visual dots/lights showing current beat
  - Different color for downbeat
  - Sync with metronome and playback
  
- [ ] **Task 4.3** - Loop Length Selection
  - UI for selecting loop length (4/8/16 beats)
  - Loop automatically repeats during jam
  - Visual loop boundary indicators
  
- [ ] **Task 4.4** - Overdub Mode
  - Toggle for overdub vs. replace
  - Layer new recordings on existing
  - Clear loop button

### Phase 5: Studio Mode Extras
**Status:** 🔲 Not Started

- [ ] **Task 5.1** - Duet Mode UI
  - Split-screen layout
  - Independent instrument assignment
  - Visual player distinction
  
- [ ] **Task 5.2** - Punch-In Recording
  - Set punch-in start/end points
  - Only record during that window
  - Visual indication of punch window
  
- [ ] **Task 5.3** - Advanced Quantization UI
  - Dropdown for quantization values
  - Real-time adjustment during playback
  - Quantize existing recording (post-process)

### Phase 6: Integration & Polish
**Status:** 🔲 Not Started

- [ ] **Task 6.1** - Jam to Sequence Workflow
  - "Keep recording" button to add to timeline
  - Seamless transition from jam to sequence mode
  - Playhead syncs between modes
  
- [ ] **Task 6.2** - styles/jam.css
  - Jam mode specific styling
  - Giant touch targets for Kid Mode
  - Recording state visual indicators
  - Beat indicator styling
  
- [ ] **Task 6.3** - Audio Latency Optimization
  - Minimize touch-to-sound latency
  - Pre-load audio buffers
  - Test on various devices

### Phase 7: Testing
**Status:** 🔲 Not Started

- [ ] **Task 7.1** - Touch Response Testing
  - Measure touch-to-sound latency
  - Test multi-touch on various devices
  - Verify polyphony limits work
  
- [ ] **Task 7.2** - Recording Accuracy Testing
  - Record known patterns, verify timing
  - Test quantization at all settings
  - Verify overdub merges correctly
  
- [ ] **Task 7.3** - Cross-Mode Testing
  - Switch modes during playback
  - Switch modes during recording
  - Verify state preserved correctly

---

## Review Task

> **⚠️ REVIEW REQUIREMENTS**
> 
> This review task must be **explicitly requested** by the developer.
> Do NOT begin review until all Phase 1-7 tasks show ✅.

### Pre-Review Checklist

Before requesting review, verify:
- [ ] All implementation tasks marked ✅
- [ ] Each task has verification date noted
- [ ] No known bugs or blockers remain
- [ ] Mobile testing completed on real devices
- [ ] Mode System integration verified
- [ ] Audio latency acceptable (< 50ms ideal)

### Review Scope

When review is requested, perform the following thorough analysis:

#### 1. Code Quality Review
- [ ] JamMode.js under 200 lines
- [ ] Metronome.js under 100 lines
- [ ] Clear separation between jam and sequence logic
- [ ] No event listener leaks on mode switch

#### 2. Cross-System Impact Analysis
- [ ] **Audio.js**: Immediate playback doesn't conflict with timeline playback
- [ ] **Game.js**: Jam mode state properly isolated
- [ ] **Timeline.js**: Recording commits don't corrupt timeline state
- [ ] **DragDrop.js**: Drag disabled during jam mode (or handled correctly)
- [ ] **PianoKeyboard.js**: Touch events don't double-fire
- [ ] **Mode System**: Jam features properly gated by mode
- [ ] **Pattern Library**: Patterns work with jam recordings (if applicable)

#### 3. Audio Quality Review
- [ ] No audio glitches during rapid note playing
- [ ] Polyphony sounds clean (no distortion)
- [ ] Metronome timing accurate
- [ ] Recording playback matches original performance

#### 4. User Experience Review
- [ ] Touch response feels immediate
- [ ] Recording workflow intuitive
- [ ] Mode transition smooth
- [ ] Visual feedback satisfying

#### 5. Performance Review
- [ ] No frame drops during jam
- [ ] Touch responsiveness on low-end devices
- [ ] Memory stable during long jam sessions
- [ ] Audio context doesn't accumulate nodes

#### 6. Accessibility Review
- [ ] Jam mode keyboard accessible
- [ ] Visual indicators for audio feedback
- [ ] Screen reader announces mode changes

#### 7. Documentation Review
- [ ] DESIGN.md updated with jam mode
- [ ] ROADMAP.md status updated
- [ ] Code comments explain timing logic

### Review Sign-Off

| Reviewer | Date | Status | Notes |
|----------|------|--------|-------|
| | | | |

---

## Technical Notes

### Audio Latency Considerations

Web Audio latency is critical for jam mode. Strategies:

1. **Pre-created oscillators**: Keep oscillator nodes ready
2. **Audio worklet**: For lowest latency (if needed)
3. **Buffer pre-loading**: All sounds ready before jam mode
4. **Avoid GC during play**: Reuse audio nodes where possible

### Touch Event Flow

```
touchstart
  → Check if on playable element
  → Get note/percussion info
  → Immediately trigger Audio.playNote()
  → Add to activeNotes set
  → If recording, add to buffer with timestamp

touchend
  → Remove from activeNotes
  → Stop sustained notes (piano)
  → Visual feedback reset
```

### Recording Timestamp Calculation

```javascript
// During recording
const recordStartTime = performance.now();
const bpm = this.getCurrentBPM();
const msPerBeat = 60000 / bpm;

// On note play
const elapsedMs = performance.now() - recordStartTime;
const beatPosition = elapsedMs / msPerBeat;

// After recording, quantize
const quantizedBeat = Math.round(beatPosition / quantization) * quantization;
```

---

## Related Documents

- [Roadmap](../ROADMAP.md)
- [Mode System Feature](MODE_SYSTEM.md) - **Prerequisite**
- [Pattern Library Feature](PATTERN_LIBRARY.md) - May integrate recorded loops
- [Core Design](../../DESIGN.md)
