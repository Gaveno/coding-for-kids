# Quick Implementation Checklist

## Version 3 Implementation Tasks

### Phase 1: Core Piano System

- [ ] Create `js/PianoKeyboard.js`
  - [ ] Constructor with 12 chromatic notes
  - [ ] `render()` method for visual piano layout
  - [ ] `updateDisabledKeys(keySignature)` method
  - [ ] Piano key press animation
  - [ ] Export note data with icons

- [ ] Update `js/Audio.js`
  - [ ] Add `transposeOctave(note, trackNumber)` method
  - [ ] Track 1 → octave 5 (high)
  - [ ] Track 2 → octave 3 (low)
  - [ ] Track 3 → percussion (unchanged)

- [ ] Update `js/Track.js`
  - [ ] Change note storage format (add octave field)
  - [ ] Update `serialize()` to use note indices (0-12)
  - [ ] Update `deserialize()` to rebuild note objects

- [ ] Update `js/DragDrop.js`
  - [ ] Check if piano key is disabled before allowing drag
  - [ ] Update drop logic to set octave based on track

### Phase 2: Key Selection

- [ ] Update `js/Game.js`
  - [ ] Add `currentKey` state variable
  - [ ] Add `KEY_SIGNATURES` constant (16 keys)
  - [ ] Add `setKey(keyName)` method
  - [ ] Update URL serialization header to 9 bits (add 4 bits for key)
  - [ ] Increment `ENCODING_VERSION` to 3

- [ ] Update UI (HTML)
  - [ ] Add key selector dropdown in controls
  - [ ] Populate with key options (majors, minors, freeform)
  - [ ] Add change event listener

- [ ] Update `styles/controls.css`
  - [ ] Style key selector dropdown
  - [ ] Ensure mobile-friendly touch target (44px+)

### Phase 3: 64-Beat Support

- [ ] Update `js/Timeline.js`
  - [ ] Update length constants: `[16, 32, 48, 64]`
  - [ ] Ensure horizontal scroll works smoothly
  - [ ] Update beat counter display

- [ ] Update `js/Game.js`
  - [ ] Update length options in UI
  - [ ] Update serialization header length bits (2 bits = 4 options)

- [ ] Update `styles/timeline.css`
  - [ ] Test responsive layout with 64 beats
  - [ ] Ensure smooth horizontal scrolling
  - [ ] Mobile: show 8-12 beats at a time

### Phase 4: URL Serialization v3

- [ ] Update `js/Game.js`
  - [ ] Implement `serializeV3()` method
    - [ ] Header: 9 bits (speed, loop, length, key)
    - [ ] Per beat: 17 bits (piano1+dur, piano2+dur, perc)
  - [ ] Implement `deserializeV3(bits)` method
  - [ ] Update version dispatcher in `deserializeState()`
  - [ ] Keep `deserializeV1()` and `deserializeV2()` unchanged

### Phase 5: Backwards Compatibility

- [ ] Test loading v1 URLs
  - [ ] Should load with default key (C Major)
  - [ ] Melody notes map to Track 1
  - [ ] Bass notes map to Track 2

- [ ] Test loading v2 URLs
  - [ ] Should load with default key (C Major)
  - [ ] Duration preserved
  - [ ] Notes map correctly

- [ ] Ensure new saves always use v3 format

### Phase 6: Visual Polish

- [ ] Piano keyboard styling
  - [ ] White keys: white background, black border
  - [ ] Black keys: black background, white text, offset positioning
  - [ ] Disabled state: 50% opacity, grayscale filter
  - [ ] Hover/active states

- [ ] Track visual indicators
  - [ ] Track 1 label: "High Piano 🎹"
  - [ ] Track 2 label: "Low Piano 🎹"
  - [ ] Track 3 label: "Percussion 🥁"

- [ ] Timeline styling
  - [ ] Track 1 background: Light blue (#E3F2FD)
  - [ ] Track 2 background: Light purple (#F3E5F5)
  - [ ] Track 3 background: Light gray (#F5F5F5)

### Phase 7: Testing

- [ ] Unit tests
  - [ ] `PianoKeyboard.test.js` - Key disabling logic
  - [ ] Update `Track.test.js` - New note format
  - [ ] Update `Game.test.js` - v3 serialization
  - [ ] `Audio.test.js` - Octave transposition

- [ ] Manual testing
  - [ ] Drag piano notes to both tracks, verify octave difference
  - [ ] Change key signature, verify correct keys disabled
  - [ ] Create 64-beat song, verify playback
  - [ ] Save and reload URL, verify state preserved
  - [ ] Load old v1/v2 URLs, verify migration

- [ ] Mobile testing
  - [ ] Piano keys touch-friendly (48px minimum)
  - [ ] Timeline scrolls smoothly
  - [ ] Dropdown works on mobile
  - [ ] No zoom issues

### Phase 8: Documentation

- [ ] Update README.md with v3 features
- [ ] Update DESIGN.md (already done ✅)
- [ ] Add code comments for key signatures
- [ ] Document note index mapping

---

## Critical Implementation Details

### Note Index Mapping
```javascript
PIANO_NOTES = ['', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
// Index 0 = empty, 1-12 = notes
```

### Key Signature Example
```javascript
KEY_SIGNATURES = {
    'C Major': [1, 3, 5, 6, 8, 10, 12],  // Indices for C, D, E, F, G, A, B
    'G Major': [1, 3, 5, 7, 8, 10, 12],  // Indices for C, D, E, F#, G, A, B
    'Freeform': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]  // All notes
};
```

### Octave Transposition
```javascript
// In Audio.js
playNote(note, trackNumber) {
    let octave = 4;  // Default
    if (trackNumber === 1) octave = 5;  // High
    if (trackNumber === 2) octave = 3;  // Low
    
    const frequency = this.noteToFrequency(note + octave);
    // ... play frequency
}
```

### Serialization Header (9 bits)
```javascript
// Bit layout
let bits = '';
bits += speedIndex.toString(2).padStart(2, '0');    // 2 bits
bits += (loopEnabled ? '1' : '0');                  // 1 bit
bits += lengthIndex.toString(2).padStart(2, '0');   // 2 bits
bits += keyIndex.toString(2).padStart(4, '0');      // 4 bits
// Total: 9 bits
```

### Per-Beat Serialization (17 bits)
```javascript
// For each beat
bits += piano1NoteIndex.toString(2).padStart(4, '0');     // 4 bits (0-12)
bits += (piano1Duration - 1).toString(2).padStart(3, '0'); // 3 bits (0-7)
bits += piano2NoteIndex.toString(2).padStart(4, '0');     // 4 bits (0-12)
bits += (piano2Duration - 1).toString(2).padStart(3, '0'); // 3 bits (0-7)
bits += percNoteIndex.toString(2).padStart(3, '0');        // 3 bits (0-4)
// Total: 17 bits per beat
```

---

## Time Estimates

| Phase | Task Count | Hours | Priority |
|-------|-----------|-------|----------|
| Phase 1 | Core Piano | 6-8h | Critical |
| Phase 2 | Key Selection | 4-6h | Critical |
| Phase 3 | 64 Beats | 2-3h | Critical |
| Phase 4 | Serialization | 4-5h | Critical |
| Phase 5 | Compatibility | 2-3h | Critical |
| Phase 6 | Visual Polish | 3-4h | Important |
| Phase 7 | Testing | 4-6h | Critical |
| Phase 8 | Documentation | 1-2h | Important |
| **Total** | | **26-37h** | |

---

## Risk Areas

### High Risk
- Backwards compatibility with v1/v2 URLs
- Mobile touch interactions on piano keys
- Octave transposition audio bugs

### Medium Risk
- Timeline scrolling with 64 beats on mobile
- Key signature logic edge cases
- Drag/drop on disabled piano keys

### Low Risk
- Visual styling
- Documentation
- QR code features (not implementing)

---

## Definition of Done

A task is complete when:
- [ ] Code written and commented
- [ ] Unit tests pass
- [ ] Manual testing on desktop passed
- [ ] Manual testing on mobile passed
- [ ] No console errors
- [ ] Backwards compatible with old URLs
- [ ] Code reviewed (self or peer)
- [ ] Documentation updated

---

## Launch Checklist

Before considering v3 complete:
- [ ] All phases 1-5 complete (critical features)
- [ ] All unit tests passing
- [ ] Manual smoke test on 3+ devices (desktop, tablet, phone)
- [ ] 5+ test songs created and shared via URL
- [ ] Old v1 and v2 URLs load correctly
- [ ] No browser console warnings or errors
- [ ] Performance acceptable (smooth playback/drag)
- [ ] DESIGN.md updated
- [ ] README.md updated

---

## Quick Start Command

```bash
# From repo root
cd music-box-composer

# Test current version
npx serve ..
# Open http://localhost:3000/music-box-composer/

# Run tests
# Open tests/index.html in browser
```
