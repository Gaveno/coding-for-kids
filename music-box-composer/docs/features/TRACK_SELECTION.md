# Feature: Track Selection & Preview

## Overview

Allow users to select which track is active for note preview, with visual feedback showing the selected track. When tapping piano keys to preview sounds, the preview uses the selected track's instrument and effects settings.

**Target Version:** v7.0  
**Priority:** MEDIUM  
**Complexity:** Low  
**Impact:** Medium (improves UX, reduces confusion)

---

## Current Behavior

- Piano keyboard always previews high piano sound
- No visual indication of which track notes will be added to
- Users must rely on mental model of timeline position

**Problems:**
- Confusing when working on percussion track (piano preview doesn't match)
- No way to preview percussion sounds before placing them
- Unclear which track is "active"

---

## Proposed Behavior

### Track Selection

**Selection Methods:**
1. **Click/tap track row** - Selects that track
2. **Default selection** - First track (high piano) selected on load
3. **Keyboard shortcuts** (Studio Mode only):
   - `1` = High Piano
   - `2` = Low Piano  
   - `3` = Percussion
   - `4+` = Additional tracks (if future feature)

### Visual Feedback

**Selected Track Styling:**
```css
.track-row.selected {
  box-shadow: 0 0 20px var(--primary-glow);
  border: 2px solid var(--primary-color);
  background: var(--track-selected-bg);
}
```

**Mode-Specific Glow Colors:**
| Mode | Glow Color |
|------|-----------|
| Kid Mode | `rgba(255, 215, 0, 0.6)` (Gold) |
| Tween Mode | `rgba(0, 255, 255, 0.6)` (Cyan) |
| Studio Mode | `rgba(100, 200, 255, 0.5)` (Blue) |

**Additional Indicators:**
- Animated pulse on selection (300ms)
- Track label highlighted
- Piano keyboard border matches track color

### Preview Behavior

**Piano Key Preview:**
```javascript
// When user taps/clicks piano key
pianoKey.addEventListener('click', () => {
  const selectedTrack = game.getSelectedTrack();
  const instrument = selectedTrack.instrument; // 'highPiano', 'lowPiano', 'percussion'
  const effects = selectedTrack.effects; // velocity, reverb, etc. (future)
  
  audio.playPreview(note, instrument, effects);
});
```

**Percussion Preview:**
- When percussion track selected, piano keys trigger percussion sounds
- Visual mapping: C = kick, D = snare, E = hihat, etc.
- Percussion labels appear above piano keys when percussion selected

---

## Technical Implementation

### Data Model Changes

**Track Class Addition:**
```javascript
class Track {
  constructor(instrument, maxBeats) {
    this.instrument = instrument; // 'highPiano', 'lowPiano', 'percussion'
    this.notes = [];
    this.maxBeats = maxBeats;
    this.selected = false; // NEW
  }
  
  select() {
    this.selected = true;
  }
  
  deselect() {
    this.selected = false;
  }
}
```

**Game Class Updates:**
```javascript
class Game {
  selectTrack(trackIndex) {
    // Deselect all tracks
    this.tracks.forEach(t => t.deselect());
    
    // Select target track
    this.tracks[trackIndex].select();
    
    // Update UI
    this.updateTrackVisuals();
    
    // Update piano preview mapping
    this.updatePianoPreview();
  }
  
  getSelectedTrack() {
    return this.tracks.find(t => t.selected) || this.tracks[0];
  }
}
```

### UI Updates

**Track Row Click Handler:**
```javascript
trackRow.addEventListener('click', (e) => {
  // Don't interfere with note clicks
  if (e.target.classList.contains('note')) return;
  
  game.selectTrack(trackIndex);
});
```

**Piano Preview Update:**
```javascript
updatePianoPreview() {
  const track = this.getSelectedTrack();
  
  if (track.instrument === 'percussion') {
    // Show percussion labels
    this.showPercussionLabels();
  } else {
    // Show normal piano
    this.hidePercussionLabels();
  }
  
  // Update piano border color to match track
  piano.style.borderColor = track.color;
}
```

---

## Mobile Considerations

**Touch Interactions:**
- Track row tap area must be large enough (min 48px height)
- Don't conflict with existing note drag-drop
- Visual feedback immediate (<100ms)

**Small Screens:**
- Glow effect should be visible but not overwhelming
- Selected track label could be larger/bold
- Consider floating indicator (e.g., "🎹 High Piano selected")

---

## Mode-Specific Behavior

### 🧸 Kid Mode
- Track selection enabled, but simplified
- Large glow effect (very obvious)
- No keyboard shortcuts
- Percussion preview shows emoji labels (🥁 🎵 etc.)

### 🎸 Tween Mode
- Full track selection
- Animated glow effect (pulsing)
- Optional keyboard shortcuts
- Percussion labels with icons

### 🎛️ Studio Mode
- Full track selection
- Keyboard shortcuts enabled
- Compact glow effect
- Percussion labels with waveform icons

---

## URL Serialization

**No URL changes required.**

- Track selection is a UI state, not song data
- Default to first track on load
- User must manually select track each session

---

## Testing Checklist

**Functional Tests:**
- [ ] Clicking track row selects it
- [ ] Only one track selected at a time
- [ ] Piano preview uses correct instrument
- [ ] Percussion preview shows correct sounds
- [ ] Glow effect animates on selection
- [ ] Keyboard shortcuts work (Studio Mode)

**Visual Tests:**
- [ ] Glow effect visible in all modes
- [ ] Selected track clearly distinguishable
- [ ] No performance impact (60fps maintained)
- [ ] Works on mobile (touch targets adequate)

**Edge Cases:**
- [ ] Selection persists when adding/removing notes
- [ ] Selection works with undo/redo
- [ ] Selection works after timeline scroll (future feature)
- [ ] Percussion labels don't overflow on small screens

---

## Future Enhancements

**Not included in v7.0, consider for later:**

| Enhancement | Reason Deferred |
|-------------|----------------|
| Multi-track selection | Adds complexity, unclear use case |
| Solo/mute per track | Requires audio mixing architecture |
| Track color customization | Nice-to-have, not priority |
| Visual metronome on selected track | Consider after time signature feature |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Selection discoverable | >70% of users select track within 2 minutes |
| Preview clarity | >80% positive feedback on "preview matches track" |
| Mobile usability | Works on tablets without issues |
| Performance | 60fps maintained with glow effects |

---

## Related Features

- **Time Signatures (v8)** - Selected track could show time signature meter
- **Additional Tracks (v9)** - Selection becomes more important with 4+ tracks
- **Effects (future)** - Preview would use per-track effects settings
