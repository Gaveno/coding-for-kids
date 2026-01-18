# Feature: Pattern Library & Loop Builder

## Overview

A pattern/loop abstraction layer that teaches the programming concept of **functions/reusability**. Users create or select reusable musical patterns that can be arranged on a macro timeline.

---

## Concept: Teaching Abstraction Through Music

| Programming Concept | Music Equivalent |
|---------------------|------------------|
| **Function** | Saved pattern block |
| **Function call** | Dropping pattern on macro timeline |
| **Parameters** | Pattern transposition (shift key) |
| **Library/imports** | Pre-made pattern collection |
| **DRY principle** | "Build once, use everywhere" |

---

## Feature Definition by Mode

### All Modes (Unified Design)
- **Pattern Drawer** - Toggle button next to piano keyboard expands/collapses drawer above keyboard
- **Preset patterns** - Always available (10 built-in patterns)
- **Custom patterns** - Up to 8 user-created patterns (across all modes)
- **Pattern Timeline** - Selectable length: 4, 8, or 16 beats
- **Stamp behavior** - Patterns "stamp" notes into main timeline with pattern mapping
- **Editable notes** - Pattern notes appear at 75% opacity, fully editable
- **Auto-cleanup** - Pattern block auto-removes when all its notes are deleted

### 🧸 Kid Mode
- **Pattern creation**: Compose in pattern timeline only
- **Save as pattern**: Creates custom block with index emoji (1️⃣, 2️⃣, etc.)

### 🎸 Tween Mode
- **Pattern creation**: Compose in pattern timeline OR save from main timeline selection
- **Same save behavior**: Index emoji + preset color

### 🎛️ Studio Mode
- **Same as Tween** - Additional features deferred to future versions

---

## UI Design

### Pattern Drawer Layout
```
┌─────────────────────────────────────────────────────────┐
│ Pattern Blocks:  [🌈][🥁][🌙][💃] ... [1️⃣][2️⃣][➕]     │
├─────────────────────────────────────────────────────────┤
│ Pattern Timeline:  [4][8][16] beats   [🗑️ Clear][💾 Save]│
│ ┌─────┬─────┬─────┬─────┐                               │
│ │  ♪  │     │  ♪  │     │  Track 1 (High Piano)         │
│ ├─────┼─────┼─────┼─────┤                               │
│ │     │  ♪  │     │  ♪  │  Track 2 (Low Piano)          │
│ ├─────┼─────┼─────┼─────┤                               │
│ │  ●  │     │  ●  │     │  Track 3 (Percussion)         │
│ └─────┴─────┴─────┴─────┘                               │
└─────────────────────────────────────────────────────────┘
```

### Pattern Block in Main Timeline
```
┌─────────────────────────────┐
│🗑️🌈│ ♪  ♪  ♪  ♪  │  (normal notes beyond pattern)
├────┤ ♪     ♪     │   75% opacity notes inside
│    │    ♪     ♪  │
└────┴─────────────┴────────────
 ↑ delete tap     ↑ pattern boundary
 target + icon    (semi-transparent overlay)
```

### Pattern Overlap Rules
- **Patterns cannot overlap** with other patterns
- **Notes can coexist** with pattern notes (user notes at 100%, pattern at 75%)
- **Conflict resolution**: User-placed notes take priority over pattern notes

---

## Technical Architecture

### Pattern Data Model

```javascript
// Preset pattern (full structure)
{
    id: string,           // 'preset_happy_bounce' etc.
    name: string,         // Display name
    icon: string,         // Emoji icon (🌈, 🥁, etc.)
    color: string,        // CSS color
    length: number,       // 4, 8, or 16 beats
    tracks: {
        1: [[beat, noteIndex, duration], ...],
        2: [[beat, noteIndex, duration], ...],
        3: [[beat, noteIndex, duration], ...]
    },
    isPreset: true
}

// Custom pattern (simplified for URL storage)
{
    index: number,        // 0-7 (determines icon 1️⃣-8️⃣ and color)
    length: number,       // 4, 8, or 16 beats
    tracks: { ... }       // Same as preset
}

// Icon/color derived from index:
// Icons: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣']
// Colors: ['#4ECDC4', '#FFD93D', '#E63946', '#A8DADC', '#6A4C93', '#FF6B6B', '#95E1D3', '#F38181']
```

### Pattern Placement Model

```javascript
// Pattern placement in main timeline
{
    placementId: string,  // Unique ID for this placement instance
    patternId: string,    // Reference to pattern (preset or custom)
    startBeat: number,    // Where pattern starts in main timeline
    noteIds: Set<string>  // IDs of notes "stamped" by this placement
}

// Note with pattern mapping
{
    id: string,
    beat: number,
    noteIndex: number,
    duration: number,
    patternPlacementId: string | null  // null = user-placed, string = from pattern
}
```

### New Files Required

| File | Responsibility | Est. Lines |
|------|----------------|------------|
| `Pattern.js` ✅ | Pattern data model, validation | ~120 |
| `PatternLibrary.js` ✅ | Pattern storage, presets, CRUD | ~240 |
| `PatternDrawer.js` | Drawer toggle, pattern timeline, save/clear | ~180 |
| `PatternBlock.js` | Pattern block overlay in main timeline | ~100 |
| `styles/patterns.css` | Pattern drawer + block styling | ~150 |

---

## Pre-Made Pattern Library

### Kid Mode Patterns

| Pattern | Icon | Description | Length |
|---------|------|-------------|--------|
| Happy Bounce | 🌈 | Upbeat C-E-G arpeggio with kick | 4 beats |
| March | 🥁 | Steady quarter notes with snare | 4 beats |
| Lullaby | 🌙 | Gentle descending melody | 4 beats |
| Dance | 💃 | Syncopated rhythm with claps | 4 beats |
| Fanfare | 🎺 | Rising triumphant notes | 4 beats |
| Rain | 🌧️ | Soft repeated notes with hihat | 4 beats |

### Tween Mode Additions

| Pattern | Icon | Description | Length |
|---------|------|-------------|--------|
| Drop | 🔥 | EDM-style beat drop | 8 beats |
| Chill | 🧊 | Lo-fi chord progression | 8 beats |
| Epic | ⚔️ | Cinematic building pattern | 8 beats |
| Glitch | 👾 | Irregular rhythmic pattern | 4 beats |

### Studio Mode Additions
- Full drum loops (16 beats)
- Chord progressions (I-IV-V-I patterns)
- Bass lines
- User-importable patterns

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

### Phase 1: Pattern Data Model
**Status:** ✅ Complete (January 17, 2026)

- [x] **Task 1.1** - Pattern.js Class ✅ Complete
  - Create Pattern class with properties above
  - Validate pattern structure
  - Methods: `serialize()`, `deserialize()`, `clone()`
  - Handle variable-length patterns
  
- [x] **Task 1.2** - PatternLibrary.js Class ✅ Complete
  - Pattern storage (in-memory Map)
  - `addPattern()`, `removePattern()`, `getPattern()`
  - `getPresets()` - returns mode-appropriate presets
  - `getUserPatterns()` - returns user-created patterns
  - localStorage persistence for user patterns

- [x] **Task 1.3** - Pre-Made Pattern Definitions ✅ Complete
  - Create Kid Mode patterns (6 patterns: Happy Bounce, March, Lullaby, Dance, Fanfare, Rain)
  - Create Tween Mode patterns (4 patterns: Drop, Chill, Epic, Glitch)
  - Create Studio Mode patterns (same as Tween for now)
  - Store as static data in PatternLibrary.js

### Phase 2: Pattern Drawer UI
**Status:** ✅ Complete (January 17, 2026)

- [x] **Task 2.1** - PatternDrawer.js Class ✅ Complete
  - Toggle button next to piano-keyboard-wrapper
  - Expand/collapse drawer animation (above keyboard)
  - Container for pattern blocks + pattern timeline
  - Touch-friendly toggle (min 44px)
  
- [x] **Task 2.2** - Pattern Block Bar ✅ Complete
  - Horizontal row of preset pattern blocks (scrollable)
  - Custom pattern blocks with index emojis (1️⃣-8️⃣)
  - ➕ button to start new custom pattern
  - Tap pattern block = load into pattern timeline
  - Visual feedback: selected pattern highlighted
  
- [x] **Task 2.3** - Pattern Timeline ✅ Complete
  - Mini timeline (4/8/16 beat selector buttons)
  - 3-track grid matching main timeline style
  - Tap to add/remove notes (same as main timeline)
  - 🗑️ Clear button to reset pattern timeline
  - 💾 Save button opens modal to select slot (1️⃣-8️⃣)
  
- [ ] **Task 2.3b** - Save Pattern Modal
  - Show 8 slots with current status (empty/occupied)
  - Display icon and preview for occupied slots
  - Tap slot to save (confirms overwrite if occupied)
  - Cancel button to close modal
  - Touch-friendly slots (min 44px targets)
  
- [x] **Task 2.4** - Pattern Drag to Main Timeline ✅ Deferred to Phase 3
  - Drag pattern block from bar to main timeline
  - Show drop preview (ghost block at position)
  - Prevent drop where patterns would overlap
  
- [x] **Task 2.5** - styles/patterns.css ✅ Complete
  - Pattern drawer container + toggle button
  - Pattern block bar styling (horizontal scroll)
  - Pattern timeline styling
  - Length selector buttons
  - Save/clear button styling
  - Save modal styling (8-slot grid)

### Phase 3: Pattern Stamp & Block Overlay
**Status:** ✅ Complete (January 17, 2026)

- [x] **Task 3.1** - PatternBlock.js Class ✅ Complete
  - Render semi-transparent overlay (N beats × 3 tracks)
  - Show pattern icon in top-left corner
  - Delete tap target (🗑️ icon, min 44px)
  - Color based on pattern (preset color or index color)
  
- [x] **Task 3.2** - Pattern Stamp Behavior ✅ Complete
  - When pattern dropped: create notes in main timeline
  - Each note gets `patternPlacementId` linking to placement
  - Notes render at 75% opacity when linked to pattern
  - Merge with existing notes (pattern notes lower priority)
  
- [x] **Task 3.3** - Pattern Note Tracking ✅ Complete
  - Pattern placement tracks its note IDs
  - When note deleted: update placement's noteIds set
  - When all notes removed: auto-remove pattern block
  - When pattern block deleted: remove all linked notes
  
- [x] **Task 3.4** - DragDrop.js Updates ✅ Complete
  - Handle pattern drag (different from note drag)
  - Calculate drop position for multi-beat patterns
  - Validate no pattern overlap before drop
  - Create pattern placement + stamp notes on drop

### Phase 4: Save from Selection (Tween/Studio Only)
**Status:** 🔲 Not Started

- [ ] **Task 4.1** - Selection to Pattern
  - Select notes in main timeline (existing selection mechanism)
  - "Save as Pattern" button appears when notes selected
  - Calculates pattern length from selection span
  - Validates selection fits 4/8/16 beat pattern
  
- [ ] **Task 4.2** - Mode-Gated UI
  - "Save as Pattern" only visible in Tween/Studio modes
  - Kid Mode only has compose-in-drawer workflow

### Phase 5: URL Serialization
**Status:** 🔲 Not Started

- [ ] **Task 5.1** - Custom Pattern Serialization
  - Encode custom patterns: index + length + tracks
  - Compact format (no name/icon/color - derived from index)
  - Max 8 custom patterns
  
- [ ] **Task 5.2** - Pattern Placement Serialization
  - Encode placements: patternId + startBeat
  - For presets: use preset ID directly
  - For custom: use index reference
  
- [ ] **Task 5.3** - Note Pattern Mapping
  - Notes modified from pattern lose patternPlacementId
  - Only unmodified pattern notes need placement reference
  - Consider: store placements separately from notes?
  
- [ ] **Task 5.4** - Backward Compatibility
  - v3 URLs should work (no patterns)
  - v4+ URLs include pattern data
  - Version flag in URL to distinguish

### Phase 6: Testing & Polish
**Status:** 🔲 Not Started

- [ ] **Task 6.1** - Pattern Playback Testing
  - Patterns play correctly at all speeds
  - Pattern boundaries don't cause audio glitches
  - Loop points work with patterns
  
- [ ] **Task 6.2** - Mobile Testing
  - Pattern drag/drop on touch devices
  - Palette scrolling smooth
  - Creation modal usable on small screens
  
- [ ] **Task 6.3** - Cross-Mode Testing
  - Switching modes with patterns present
  - User patterns preserved across sessions
  - Presets update when mode changes

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
- [ ] Mode System integration verified

### Review Scope

When review is requested, perform the following thorough analysis:

#### 1. Code Quality Review
- [ ] Each new JS file under 200 lines
- [ ] Pattern.js has clear single responsibility
- [ ] PatternLibrary.js properly separated from UI
- [ ] No circular dependencies introduced

#### 2. Cross-System Impact Analysis
- [ ] **Game.js**: Pattern state properly managed
- [ ] **Timeline.js**: Pattern expansion doesn't break note rendering
- [ ] **Track.js**: Notes from patterns use same data model
- [ ] **DragDrop.js**: Pattern drag doesn't interfere with note drag
- [ ] **Audio.js**: Pattern playback uses existing note playback
- [ ] **URL Serialization**: Pattern data fits in URL limits
- [ ] **Mode System**: Patterns properly gated by mode
- [ ] **Existing v3 songs**: Load correctly without patterns

#### 3. Data Model Review
- [ ] Pattern structure supports all mode features
- [ ] Macro timeline model handles edge cases
- [ ] localStorage doesn't exceed limits
- [ ] Pattern IDs remain unique

#### 4. User Experience Review
- [ ] Pattern creation intuitive
- [ ] Drag feedback clear
- [ ] Macro/detail toggle smooth
- [ ] Pattern preview helpful

#### 5. Performance Review
- [ ] Many patterns don't slow down rendering
- [ ] Pattern expansion doesn't cause lag
- [ ] Memory usage reasonable with saved patterns

#### 6. Documentation Review
- [ ] DESIGN.md updated with pattern system
- [ ] ROADMAP.md status updated
- [ ] Pattern data format documented
- [ ] Code comments explain pattern logic

### Review Sign-Off

| Reviewer | Date | Status | Notes |
|----------|------|--------|-------|
| | | | |

---

## Related Documents

- [Roadmap](../ROADMAP.md)
- [Mode System Feature](MODE_SYSTEM.md) - **Prerequisite**
- [Jam Mode Feature](JAM_MODE.md) - May use patterns
- [Core Design](../../DESIGN.md)
