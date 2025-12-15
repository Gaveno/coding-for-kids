# Music Box Composer - Design Document

## Overview

A visual music sequencer for pre-literate children. Users drag emoji notes onto a 3-track timeline (melody, bass, percussion) to compose songs.

---

## Architecture

### Core Classes

| File | Responsibility |
|------|----------------|
| `Game.js` | Main controller, playback, URL serialization |
| `Timeline.js` | Multi-track timeline UI rendering |
| `Track.js` | Single track data model |
| `Audio.js` | Web Audio API synthesis |
| `DragDrop.js` | Drag notes from palette to timeline |
| `Character.js` | Animated character reactions |

### Data Flow

```
User drags note → DragDrop → Game.handleNoteDrop() → Timeline.setNote() → Track.setNote()
                                    ↓
                            Game.updateURL() → serializeState() → URL ?c=...
```

---

## Note Data Model

Each note in `Track.js` stores:

```javascript
{
    note: string,      // Note name (e.g., 'C4', 'kick')
    icon: string,      // Emoji display (e.g., '🔴', '🥁')
    duration: number   // Duration in beats (1-8, default 1)
}
```

### Track Serialization Format

`Track.serialize()` returns an array of tuples:
```javascript
[[beat, note, icon, duration], ...]
// Example: [[0, 'C4', '🔴', 2], [3, 'E4', '🟡', 1]]
```

---

## URL State Serialization

Songs are saved in the URL query parameter `?c=` using compact binary encoding with a version prefix.

### URL Format

```
?c=v{version}_{base64data}
```

- **Version prefix**: `v2_` identifies the encoding format
- **Base64 data**: URL-safe base64 (uses `-` and `_` instead of `+` and `/`)
- **Legacy URLs** without version prefix are treated as v1

### Version History

| Version | Bits/Beat | Features |
|---------|-----------|----------|
| v1 | 10 | No duration (melody:4, bass:3, perc:3) |
| v2 | 16 | With duration (melody:4+3, bass:3+3, perc:3) |

### Current Format (v2)

```
Header: 5 bits
  - Speed index:     2 bits (0-3)
  - Loop enabled:    1 bit  (0-1)
  - Length index:    2 bits (0-3 → 8/16/24/32 beats)

Per beat: 16 bits
  - Melody note:     4 bits (0-8, index into MELODY_NOTES)
  - Melody duration: 3 bits (0-7 → duration 1-8)
  - Bass note:       3 bits (0-5, index into BASS_NOTES)
  - Bass duration:   3 bits (0-7 → duration 1-8)
  - Percussion:      3 bits (0-4, index into PERC_NOTES)
```

### Legacy Format (v1)

```
Per beat: 10 bits
  - Melody note:   4 bits
  - Bass note:     3 bits
  - Percussion:    3 bits
```

### Note Index Tables

```javascript
MELODY_NOTES = ['', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
BASS_NOTES   = ['', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3']
PERC_NOTES   = ['', 'kick', 'snare', 'hihat', 'clap']
```

---

## Adding New Saveable Features (Versioning Guide)

When adding features that need URL persistence:

### 1. Increment the Version

In `Game.js`, update:
```javascript
static ENCODING_VERSION = 3; // Was 2
```

### 2. Update `serializeState()`

- Add bits for new data in the current format
- Update the JSDoc comment with new bit layout
- The version prefix is added automatically

### 3. Create a New Deserialize Method

```javascript
deserializeV3(bits) {
    // Read v3 format
}
```

### 4. Update `deserializeState()` Dispatcher

Add the new version to the switch:
```javascript
if (version === 3) {
    return this.deserializeV3(bits);
}
```

### 5. Keep Old Deserialize Methods

**NEVER delete old `deserializeVX()` methods!** Old shared URLs must continue working.

### 6. Update This Document

- Add new version to Version History table
- Document new bit allocations
- Update "Current Format" section

### Backwards Compatibility Rules

1. **Old URLs load with defaults**: Missing data uses sensible defaults (e.g., duration=1)
2. **New URLs always versioned**: `v{N}_` prefix ensures correct decoder is used
3. **Legacy unversioned URLs**: Treated as v1 for backwards compatibility
4. **Never break old versions**: Each `deserializeVX()` is frozen once released

---

## Extended Notes (Duration)

Notes can be extended to last multiple beats by dragging horizontally.

### Visual Behavior
- Drag a note left/right to resize
- Extended notes show as wider rounded rectangles
- Covered cells are marked with `covered-by-note` class

### Audio Behavior
- Extended notes play once at their start beat
- Audio duration = `note.duration * beatDurationMs / 1000` seconds
- Melody/bass get longer sustain; percussion ignores duration

### Collision Rules
- Notes cannot overlap on the same track
- Cannot extend into a cell that has another note
- Dropping on a covered cell is blocked

---

## Key Implementation Notes

### Timeline Rendering
- Notes use `position: absolute` to extend beyond cell boundaries
- Width calculated as: `calc(duration * var(--cell-size) - 4px)`
- `getCoveringNote(beat)` in Track.js finds if a beat is covered

### Playback
- `getNotesAtBeat()` returns notes starting at beat OR covering it
- Covering notes have `sustained: true` flag
- `playBeat()` only triggers audio for non-sustained notes

---

## Future Considerations

- [ ] Add more note types (may need more bits)
- [ ] Volume per note (would need 2-3 bits per note)
- [ ] Note pitch bend/effects
- [ ] Multiple instruments per track type
