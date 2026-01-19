# Feature: Additional Tracks

## Overview

Allow users to add more than 3 tracks to their songs, including additional piano octaves and percussion tracks. This feature unlocks richer musical arrangements but requires careful URL size management and potential fallback to QR-only sharing.

**Target Version:** v9.0  
**Priority:** LOW  
**Complexity:** HIGH  
**Impact:** Medium (empowers advanced users, but niche use case)

---

## Current State

**Fixed 3-track system:**
- Track 1: High Piano (C4-B4)
- Track 2: Low Piano (C3-B3)
- Track 3: Percussion (4-12 sounds depending on mode)

**Limitations:**
- Cannot create complex arrangements (e.g., melody + harmony + bass + drums)
- Only 2 melodic octaves available
- Cannot separate percussion types (e.g., kicks on one track, cymbals on another)

---

## Proposed Behavior

### Track Limits by Mode

| Mode | Max Tracks | Default Tracks | Can Add Tracks? |
|------|-----------|----------------|-----------------|
| 🧸 Kid Mode | 3 | 3 (fixed) | ❌ No |
| 🎸 Tween Mode | 5 | 3 (fixed) | ❌ No |
| 🎛️ Studio Mode | 8 | 3 | ✅ Yes |

**Rationale:**
- Kid/Tween modes stay simple (no track management)
- Studio Mode enables complex arrangements
- 8 tracks max prevents URL size explosion and UI clutter

### Track Types

**Available track types:**
1. **Piano (High)** - C4-B4 octave, bright sound
2. **Piano (Mid-High)** - C4-B4 octave, slightly softer
3. **Piano (Mid-Low)** - C3-B3 octave
4. **Piano (Low)** - C2-B2 octave, bass notes
5. **Percussion (Drums)** - Kick, snare, hihat, etc.
6. **Percussion (Melodic)** - Cowbell, wood block, shaker, etc.
7. **Bass** - Synthesized bass tones (future consideration)
8. **Synth Lead** - Synthesized melody (future consideration)

**v9.0 Scope:** Piano and Percussion variants only (keep audio files manageable)

### Track Management UI

**Add Track Button:**
```html
<button class="add-track-btn" title="Add Track (max 8)">
  ➕ Add Track
</button>
```

**Track Type Selector Modal:**
```
┌─────────────────────────────────┐
│  Choose Track Type              │
├─────────────────────────────────┤
│  🎹 Piano (High)                │
│  🎹 Piano (Mid-High)            │
│  🎹 Piano (Mid-Low)             │
│  🎹 Piano (Low)                 │
│  🥁 Percussion (Drums)          │
│  🎵 Percussion (Melodic)        │
├─────────────────────────────────┤
│  [Cancel]      [Add Track]      │
└─────────────────────────────────┘
```

**Track Row UI Updates:**
```html
<div class="track-row">
  <div class="track-label">
    🎹 Piano (High)
    <button class="remove-track-btn">❌</button>
  </div>
  <div class="track-timeline">
    <!-- notes -->
  </div>
</div>
```

**Drag-to-Reorder:**
- User can drag track rows up/down to reorder
- Visual placeholder shows drop position
- Useful for organizing arrangement (e.g., melody on top, bass on bottom)

---

## URL Size Analysis

### Current URL Size (v4, 3 tracks, 64 beats)

**Worst-case scenario:** Every beat has a note on all 3 tracks

| Component | Size |
|-----------|------|
| Header (version, mode, key, speed) | ~10 bits |
| Track 1 (64 notes, 4 bits/note) | 256 bits |
| Track 2 (64 notes, 4 bits/note) | 256 bits |
| Track 3 (64 notes, 4 bits/note) | 256 bits |
| **Total** | **778 bits = 97 bytes** |

**Base64 encoded:** ~130 characters  
**Full URL:** `https://example.com/music-box-composer/?c=v4_[130 chars]` = ~170 chars

### Projected URL Size (v9, 8 tracks, 64 beats)

**Worst-case scenario:** Every beat has a note on all 8 tracks

| Component | Size |
|-----------|------|
| Header (version, mode, key, speed, track count) | ~16 bits |
| Track metadata (type per track, 3 bits × 8) | 24 bits |
| Track 1-8 (64 notes each, 4 bits/note) | 2048 bits |
| **Total** | **2088 bits = 261 bytes** |

**Base64 encoded:** ~350 characters  
**Full URL:** `https://example.com/music-box-composer/?c=v9_[350 chars]` = ~390 chars

### URL Size Limits

| Platform | Max URL Length | v9 Max URL Safe? |
|----------|----------------|------------------|
| Chrome | 2MB | ✅ Yes (390 chars) |
| Firefox | 65,536 chars | ✅ Yes |
| Safari | 80,000 chars | ✅ Yes |
| Internet Explorer | 2,083 chars | ✅ Yes |
| Mobile browsers | ~2,000 chars | ✅ Yes |
| SMS text message | 160 chars | ❌ NO (390 chars) |
| Twitter/X | 280 chars | ❌ NO (390 chars) |

**Conclusion:** URLs remain shareable by link, but **exceed SMS/social media length**.

---

## Shareability Solutions

### Automatic Share Method Selection

**Logic:**
1. **If URL < 160 chars** → Offer "Copy Link" + "QR Code" + "SMS"
2. **If URL < 280 chars** → Offer "Copy Link" + "QR Code" (no SMS)
3. **If URL > 280 chars** → Offer "QR Code Only" + warning message

**Warning Message for Large Songs:**
```
⚠️ Your song is too long to share by link.
Use the QR code to share instead!
```

### QR Code as Primary Share Method

**Why QR codes work:**
- QR codes can store ~3,000 characters (Version 40, Low error correction)
- v9 max URL (390 chars) fits comfortably
- Scanning QR code works the same as clicking link
- Mobile-friendly (camera app opens URL directly)

**QR Code UI Enhancement:**
```html
<div class="share-panel">
  <h3>Share Your Song</h3>
  
  <!-- Show QR code prominently -->
  <div class="qr-code-display">
    <canvas id="qr-canvas"></canvas>
    <p>Scan to play song</p>
  </div>
  
  <!-- Conditional link sharing -->
  <div class="link-share" data-visible="url-short-enough">
    <button class="copy-link-btn">📋 Copy Link</button>
    <button class="sms-share-btn">💬 Send via SMS</button>
  </div>
  
  <!-- Warning for large songs -->
  <div class="share-warning" data-visible="url-too-long">
    ⚠️ This song is too complex to share by link. Use QR code instead.
  </div>
</div>
```

### URL Compression (Future Optimization)

**If URL size becomes prohibitive, consider:**
1. **Run-length encoding** for silent beats (reduce sparse song sizes)
2. **Custom base encoding** (use full ASCII range, not just base64)
3. **Huffman coding** for common note patterns
4. **Server-side storage** with short IDs (requires backend)

**Not implemented in v9.0** - Current URL sizes are acceptable.

---

## Technical Implementation

### Data Model Changes

**Game Class Updates:**
```javascript
class Game {
  constructor() {
    this.tracks = [];
    this.maxTracks = this.getMaxTracksForMode();
  }
  
  getMaxTracksForMode() {
    switch (this.mode) {
      case 'kid': return 3;
      case 'tween': return 5;
      case 'studio': return 8;
    }
  }
  
  addTrack(trackType) {
    if (this.tracks.length >= this.maxTracks) {
      throw new Error('Maximum tracks reached');
    }
    
    const track = new Track(trackType, this.maxBeats);
    this.tracks.push(track);
    this.ui.renderNewTrack(track);
  }
  
  removeTrack(trackIndex) {
    if (this.tracks.length <= 3) {
      throw new Error('Cannot remove default tracks');
    }
    
    this.tracks.splice(trackIndex, 1);
    this.ui.removeTrackRow(trackIndex);
  }
  
  reorderTracks(fromIndex, toIndex) {
    const track = this.tracks.splice(fromIndex, 1)[0];
    this.tracks.splice(toIndex, 0, track);
    this.ui.reorderTrackRows();
  }
}
```

**Track Class Updates:**
```javascript
class Track {
  constructor(trackType, maxBeats) {
    this.trackType = trackType; // 'highPiano', 'midHighPiano', etc.
    this.instrument = this.getInstrumentForType(trackType);
    this.notes = [];
    this.maxBeats = maxBeats;
    this.octaveShift = this.getOctaveShift(trackType);
  }
  
  getInstrumentForType(trackType) {
    if (trackType.includes('Piano')) return 'piano';
    if (trackType.includes('Percussion')) return 'percussion';
    return 'piano'; // default
  }
  
  getOctaveShift(trackType) {
    const shiftMap = {
      'highPiano': 0,      // C4-B4
      'midHighPiano': 0,   // C4-B4
      'midLowPiano': -12,  // C3-B3
      'lowPiano': -24,     // C2-B2
      'percussionDrums': 0,
      'percussionMelodic': 0
    };
    return shiftMap[trackType] || 0;
  }
}
```

### URL Serialization (v9)

**Header Structure:**
```
[version:4][mode:2][trackCount:3][key:4][speed:2][timeSig:3]... = 18 bits header
```

**Track Metadata:**
```
[trackType:3] × trackCount
```

**Track Type IDs:**
| ID | Type |
|----|------|
| 0 | highPiano |
| 1 | midHighPiano |
| 2 | midLowPiano |
| 3 | lowPiano |
| 4 | percussionDrums |
| 5 | percussionMelodic |
| 6-7 | Reserved for future |

**Serialization Example:**
```javascript
serializeV9() {
  let data = '';
  
  // Header
  data += '1001'; // version 9
  data += this.mode === 'studio' ? '10' : '00';
  data += this.tracks.length.toString(2).padStart(3, '0');
  data += this.serializeKey();
  data += this.serializeSpeed();
  data += this.serializeTimeSignature();
  
  // Track metadata
  this.tracks.forEach(track => {
    data += this.getTrackTypeId(track.trackType).toString(2).padStart(3, '0');
  });
  
  // Track notes (existing serialization)
  this.tracks.forEach(track => {
    data += this.serializeTrackNotes(track);
  });
  
  return this.encodeToBase64(data);
}
```

**Backward Compatibility:**
- v8 and earlier URLs default to 3 standard tracks
- Track count of 3 = legacy format (highPiano, lowPiano, percussion)
- Track count > 3 = new format (read track type metadata)

---

## Mobile Considerations

**UI Challenges:**
- 8 tracks may not fit on small screens without scrolling
- Add track button must remain accessible
- Track reordering needs touch-friendly drag handles

**Solutions:**
1. **Vertical scroll for tracks** - Timeline becomes scrollable container
2. **Collapsible tracks** - Minimize/expand tracks to save space
3. **Track labels sideways** - Vertical text for track names (saves width)
4. **Responsive track height** - Tracks shrink when many tracks present

**Example: 8 Tracks on Mobile (Portrait)**
```
┌─────────────────────┐
│ 🏠  ▶️  🔄  💾  📤 │ ← Controls (fixed)
├─────────────────────┤
│ 🎹 High   ████░░░░ │ ← Track 1 (scrollable)
│ 🎹 Mid-H  ░░██░░░░ │ ← Track 2
│ 🎹 Mid-L  ░░░░██░░ │ ← Track 3
│ 🎹 Low    ░░░░░░██ │ ← Track 4
│ 🥁 Drums  █░█░█░█░ │ ← Track 5
│ 🎵 Melody ░██░░██░ │ ← Track 6
│ ... more tracks ... │ ← Scroll down
├─────────────────────┤
│ ➕ Add Track        │ ← Fixed at bottom
└─────────────────────┘
```

---

## Testing Checklist

**Functional Tests:**
- [ ] Add track button works (up to max for mode)
- [ ] Remove track button works (can't remove below 3)
- [ ] Track type selector modal appears
- [ ] Track reordering works (drag-drop or buttons)
- [ ] All track types play correct sounds
- [ ] URL serialization includes track count and types
- [ ] Backward compatibility (v8 URLs load with 3 tracks)

**URL Size Tests:**
- [ ] 3 tracks → URL < 200 chars (shareable everywhere)
- [ ] 5 tracks → URL < 280 chars (shareable by link, not SMS)
- [ ] 8 tracks → URL < 400 chars (QR code only)
- [ ] Share UI shows appropriate options based on size
- [ ] QR code generation works for all sizes

**Mobile Tests:**
- [ ] 8 tracks fit on screen (with scrolling)
- [ ] Add track button accessible on mobile
- [ ] Track reordering works with touch
- [ ] Performance maintained (60fps with 8 tracks)

**Edge Cases:**
- [ ] Adding track when at max shows error
- [ ] Removing last custom track returns to 3 tracks
- [ ] Reordering tracks updates track selection correctly
- [ ] Very dense song (all tracks, all beats) serializes correctly

---

## Future Enhancements

**Not included in v9.0:**

| Enhancement | Reason Deferred |
|-------------|----------------|
| Server-side song storage | Requires backend, accounts, moderation |
| Track groups/busses | Too advanced, mixing console concept |
| Per-track effects (reverb, pan) | Large UI change, audio architecture |
| Import/export MIDI | Desktop-focused, niche use case |
| Unlimited tracks | URL size explodes, UI becomes unmanageable |
| Track templates (e.g., "Rock Band") | Nice-to-have, after track system stabilizes |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Studio Mode users add tracks | >30% try adding 4+ tracks |
| Complex songs created | >10% of Studio Mode songs use 5+ tracks |
| Share success rate | >95% successful shares (link or QR) |
| URL size manageable | <500 chars for 8-track songs |
| Mobile usability | 8 tracks usable on phones (with scroll) |

---

## Related Features

- **Track Selection (v7)** - More important with 8 tracks
- **Time Signatures (v8)** - Applies to all tracks
- **Custom UI Layout (v10)** - Track panel could be repositioned/resized
- **Pattern Library (v5)** - Patterns could span multiple tracks
