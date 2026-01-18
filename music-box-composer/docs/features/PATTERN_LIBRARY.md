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

### 🧸 Kid Mode
- **Pre-made patterns only** - Cannot create custom patterns
- **4-6 simple patterns**: "Happy", "March", "Lullaby", "Dance"
- **Drag patterns** directly to main timeline (expands in place)
- **Visual**: Large colorful blocks with animal icons

### 🎸 Tween Mode
- **Create custom 4-beat patterns**
- **Save up to 8 patterns** with emoji names
- **Pattern palette** alongside note palette
- **Macro timeline** view toggle (see patterns vs. notes)
- **Visual**: Gradient blocks with custom colors

### 🎛️ Studio Mode
- **Variable-length patterns** (1-16 beats)
- **Unlimited pattern slots**
- **Pattern bank** with folders/categories
- **Import/export** pattern packs
- **Pattern transposition** (shift to different key)
- **Visual**: Compact waveform preview in blocks

---

## Technical Architecture

### Pattern Data Model

```javascript
// Pattern structure
{
    id: string,           // Unique identifier (uuid or index)
    name: string,         // Display name (emoji for kids, text for studio)
    icon: string,         // Emoji icon for the pattern
    color: string,        // CSS color for the block
    length: number,       // Length in beats (4, 8, 16)
    tracks: {
        1: [[beat, noteIndex, duration], ...],  // High piano
        2: [[beat, noteIndex, duration], ...],  // Low piano  
        3: [[beat, noteIndex, duration], ...]   // Percussion
    },
    isPreset: boolean,    // True for built-in patterns
    created: timestamp    // For user patterns
}
```

### Macro Timeline Model

```javascript
// Macro timeline = array of pattern placements
[
    { patternId: 'p1', startBeat: 0 },
    { patternId: 'p2', startBeat: 4 },
    { patternId: 'p1', startBeat: 8 },  // Reused pattern
    { patternId: 'p3', startBeat: 12 }
]
```

### New Files Required

| File | Responsibility | Est. Lines |
|------|----------------|------------|
| `Pattern.js` | Pattern data model, validation | ~80 |
| `PatternLibrary.js` | Pattern storage, presets, CRUD | ~150 |
| `PatternPalette.js` | UI for pattern selection/creation | ~120 |
| `MacroTimeline.js` | Pattern arrangement timeline | ~150 |
| `styles/patterns.css` | Pattern block styling | ~100 |

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

### Phase 2: Pattern Palette UI
**Status:** 🔲 Not Started

- [ ] **Task 2.1** - PatternPalette.js Class
  - Render pattern blocks in palette area
  - Mode-aware: show appropriate patterns
  - Drag initiation for patterns
  - Touch-friendly (min 44px targets)
  
- [ ] **Task 2.2** - Pattern Block Visual Design
  - Colorful blocks with icons
  - Size indicates pattern length
  - Hover/touch preview (play pattern)
  - Drag ghost matches block appearance
  
- [ ] **Task 2.3** - Pattern Creation UI (Tween/Studio)
  - "New Pattern" button
  - Pattern name input (emoji picker for Tween)
  - Color selector
  - Save current selection as pattern

- [ ] **Task 2.4** - styles/patterns.css
  - Pattern block styling
  - Palette layout (horizontal scroll)
  - Creation modal styling
  - Mode-specific theming

### Phase 3: Pattern Timeline Integration
**Status:** 🔲 Not Started

- [ ] **Task 3.1** - Expand Pattern on Drop
  - When pattern dropped on timeline, expand notes
  - Handle pattern overlap (replace or merge?)
  - Respect timeline length limits
  
- [ ] **Task 3.2** - Pattern Highlighting
  - After drop, briefly highlight the expanded region
  - Visual feedback that pattern was applied
  
- [ ] **Task 3.3** - DragDrop.js Updates
  - Handle pattern drag (different from note drag)
  - Calculate drop position for multi-beat patterns
  - Preview placement before drop

### Phase 4: Macro Timeline (Tween/Studio)
**Status:** 🔲 Not Started

- [ ] **Task 4.1** - MacroTimeline.js Class
  - Separate view showing pattern blocks
  - Click to expand/collapse to note view
  - Drag to reorder pattern blocks
  - Delete pattern placements
  
- [ ] **Task 4.2** - View Toggle UI
  - Button to switch between macro/detail view
  - Smooth transition animation
  - Preserve scroll position
  
- [ ] **Task 4.3** - Macro Timeline Rendering
  - Render pattern blocks proportional to length
  - Show pattern icon and color
  - Playhead works in macro view
  
- [ ] **Task 4.4** - Sync Macro and Detail Views
  - Changes in detail view update macro
  - Changes in macro view update detail
  - Handle partial pattern modifications

### Phase 5: URL Serialization
**Status:** 🔲 Not Started

- [ ] **Task 5.1** - Pattern Serialization
  - Serialize user patterns in URL (space permitting)
  - Or: generate pattern IDs, serialize placements only
  - Consider URL length limits
  
- [ ] **Task 5.2** - Macro Timeline Serialization
  - Serialize pattern placement array
  - Handle case where pattern was modified after placement
  
- [ ] **Task 5.3** - Backward Compatibility
  - v3 URLs should work (no patterns)
  - v4+ URLs include pattern data

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
