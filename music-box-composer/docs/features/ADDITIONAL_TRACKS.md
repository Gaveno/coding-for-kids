# Feature: Additional Tracks

## Overview

Allow users to add more than 3 tracks to their songs, including additional piano octaves and percussion tracks. This feature unlocks richer musical arrangements but requires careful URL size management and potential fallback to QR-only sharing.

**Target Version:** v9.0  
**Priority:** MEDIUM  
**Complexity:** HIGH  
**Impact:** High (enables full-length songs with advanced arrangements)

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
- 64 beats = 32 seconds @ 120 BPM (too short for full songs)

---

## Proposed Behavior

### Track and Beat Limits by Mode

| Mode | Max Tracks | Default Tracks | Can Add? | Max Beats | Max Duration @ 120 BPM |
|------|-----------|----------------|----------|-----------|------------------------|
| 🧸 Kid Mode | 3 | 3 (fixed) | ❌ No | 64 | 32 seconds |
| 🎸 Tween Mode | 4 | 3 | ✅ Yes (+1) | 128 | 64 seconds |
| 🎛️ Studio Mode | 6 | 3 | ✅ Yes (+3) | 256 | 128 seconds (2:08) |

**Rationale:**
- Kid Mode: Keep it simple, short songs
- Tween Mode: Allow one extra track for experimentation
- Studio Mode: Full song length (2+ minutes) with 6-track arrangements
- 6 tracks max balances creativity with URL size and UI complexity

### Track Types

**Default tracks (always present):**
1. **Piano (High)** - C4-B4 octave, bright melody
2. **Piano (Low)** - C3-B3 octave, harmony/bass
3. **Percussion** - Mode-specific drum/sound set

**Additional tracks (user choice in Tween/Studio Mode):**
- **Piano Track** - Adds another piano octave (C4-B4 or C3-B3)
- **Percussion Track** - Adds another percussion layer

**Why simplified?**
- Reduces audio file overhead (no need for 6+ instrument types)
- Simpler UI - users choose "Piano" or "Percussion" when adding
- Piano tracks auto-assign octaves (alternates high/low)
- Percussion tracks use same sound set (mix/match freely)

**v9.0 Scope:** Piano and Percussion only (bass/synth deferred to v11+)

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
│  Add Track (3/6)                │
├─────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  │
│  │    🎹     │  │    🥁     │  │
│  │   Piano   │  │Percussion │  │
│  └───────────┘  └───────────┘  │
│                                 │
│  Piano tracks alternate octaves │
│  (C4-B4 ➜ C3-B3 ➜ C4-B4...)   │
├─────────────────────────────────┤
│         [Cancel]                │
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

### URL Size Scenarios (v9)

#### Scenario A: Current State (3 tracks, 64 beats)
**Worst-case:** Every beat has a note on all 3 tracks

| Component | Size |
|-----------|------|
| Header | ~10 bits |
| Track data (3 × 64 × 4 bits) | 768 bits |
| **Total** | **778 bits = 97 bytes = ~130 base64 chars** |
| **Full URL** | **~170 characters** ✅ |

#### Scenario B: Studio Mode - Short Song (6 tracks, 64 beats)
**Worst-case:** Every beat has a note on all 6 tracks

| Component | Size |
|-----------|------|
| Header (+ track count, track types) | ~20 bits |
| Track metadata (1 bit × 6 tracks) | 6 bits |
| Track data (6 × 64 × 4 bits) | 1,536 bits |
| **Total (uncompressed)** | **1,562 bits = 195 bytes = ~260 base64 chars** |
| **Total (RLE compressed)** | **~130 bytes = ~175 base64 chars** |
| **Full URL** | **~215 characters** ✅ |

#### Scenario C: Studio Mode - Full Song (6 tracks, 256 beats)
**Worst-case:** Every beat has a note on all 6 tracks

| Component | Size |
|-----------|------|
| Header (+ track count, track types) | ~20 bits |
| Track metadata (1 bit × 6 tracks) | 6 bits |
| Track data (6 × 256 × 4 bits) | 6,144 bits |
| **Total (uncompressed)** | **6,170 bits = 771 bytes = ~1,028 base64 chars** |
| **Total (RLE compressed)** | **~350 bytes = ~467 base64 chars** |
| **Full URL** | **~510 characters** ✅ |

#### Scenario D: Studio Mode - Dense Full Song (6 tracks, 256 beats, 80% filled)
**Realistic:** Most beats have notes (typical complex song)

| Component | Size |
|-----------|------|
| Track data (80% filled) | 4,915 bits |
| **Total (uncompressed)** | **4,941 bits = 618 bytes = ~824 base64 chars** |
| **Total (RLE + Delta compressed)** | **~280 bytes = ~373 base64 chars** |
| **Full URL** | **~415 characters** ✅ |

**Key Finding:** With compression, even full-length 6-track songs stay under 600 chars, well within browser limits.

### URL Size Limits

| Platform | Max URL Length | v9 Max URL (6 tracks, 256 beats)? |
|----------|----------------|-----------------------------------|
| Chrome | 2MB | ✅ Yes (~510 chars worst-case) |
| Firefox | 65,536 chars | ✅ Yes |
| Safari | 80,000 chars | ✅ Yes |
| Internet Explorer | 2,083 chars | ✅ Yes |
| Mobile browsers | ~2,000 chars | ✅ Yes |
| SMS text message | 160 chars | ❌ NO (510 chars) |
| Twitter/X | 280 chars | ❌ NO (510 chars) |

**Conclusion:** URLs remain shareable by link in all browsers. Typical songs (with compression) stay under 450 chars. QR code recommended for dense full-length songs.

---

## Shareability Solutions

### Automatic Share Method Selection

**Logic:**
1. **If URL < 160 chars** → Offer "Copy Link" + "QR Code" + "SMS"
2. **If URL < 280 chars** → Offer "Copy Link" + "QR Code" (no SMS)
3. **If URL < 600 chars** → Offer "Copy Link" + "QR Code" (QR recommended)
4. **If URL > 600 chars** → QR Code prominently, link small

**Progressive Warning Messages:**
```
// 280-450 chars
ℹ️ Share link works everywhere!

// 450-600 chars  
💡 QR code recommended for easier sharing.

// 600+ chars (rare)
⚠️ This song is very complex! QR code is the best way to share.
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

### URL Compression (v9 Implementation)

**Implemented optimizations:**

#### 1. Run-Length Encoding (RLE) for Silence
**How it works:**
```javascript
// Without RLE: 8 silent beats = 0000 0000 0000 0000 (32 bits)
silentBeats: [0, 0, 0, 0, 0, 0, 0, 0]

// With RLE: [silence flag: 1][count: 7] = 8 bits
encoded: '10000111' // 75% savings!
```

**Encoding logic:**
- Silence runs of 4+ beats → Use RLE (1 bit flag + 7 bit count = 8 bits per run)
- Silence runs of 1-3 beats → Store normally (4 bits each)
- Benefit: Sparse songs (intro/outro/breaks) compress dramatically

#### 2. Delta Encoding for Piano Melodies
**How it works:**
```javascript
// Without delta: C4, D4, E4, F4 = 0000 0001 0010 0011 (16 bits)
notes: [0, 1, 2, 3]

// With delta: C4, +1, +1, +1 = 0000 01 01 01 (11 bits)
encoded: 'C4' then three 2-bit deltas (+1, +1, +1)
```

**Encoding logic:**
- First note in run → Full 4 bits
- Subsequent notes → 2-bit delta if change ≤ ±2 semitones
- Delta range: -2, -1, 0, +1, +2 (fits in 3 values, optimize to 2 bits)
- Benefit: Melodic sequences save 50% space

#### 3. Track Type Flag Compression
**Simple 1-bit encoding:**
- `0` = Piano track (alternates octaves automatically)
- `1` = Percussion track
- 6 tracks = 6 bits (0.75 bytes) vs 18 bits (2.25 bytes) for explicit octave IDs

#### 4. Typical Compression Results

| Song Type | Uncompressed | RLE Only | RLE + Delta | Savings |
|-----------|--------------|----------|-------------|----------|
| Sparse (30% notes) | 771 bytes | 350 bytes | 320 bytes | 58% |
| Melodic (50% notes) | 771 bytes | 520 bytes | 380 bytes | 51% |
| Dense (80% notes) | 771 bytes | 650 bytes | 550 bytes | 29% |

**Result:** Most songs stay under 500 bytes = ~670 base64 chars = URLs under 710 chars ✅

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
      case 'tween': return 4;
      case 'studio': return 6;
    }
  }
  
  getMaxBeatsForMode() {
    switch (this.mode) {
      case 'kid': return 64;
      case 'tween': return 128;
      case 'studio': return 256;
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
[version:4][mode:2][trackCount:3][key:4][speed:2][timeSig:3][beatCount:9] = 27 bits header
```

**Track Type Flags:**
```
[isPiano:1] × (trackCount - 3)  // Only for additional tracks beyond default 3
```

**Example:** 6 tracks in Studio Mode = 3 default + 3 additional = 3 bits of track type flags

**Track Type Flags (1 bit per track):**
| Flag | Type | Auto-behavior |
|------|------|---------------|
| 0 | Piano | Alternates octaves (C4-B4 ➜ C3-B3 ➜ C4-B4...) |
| 1 | Percussion | Uses mode-appropriate percussion set |

**Serialization Example:**
```javascript
serializeV9() {
  let data = '';
  
  // Header
  data += '1001'; // version 9
  data += this.serializeModeId();
  data += this.tracks.length.toString(2).padStart(3, '0');
  data += this.serializeKey();
  data += this.serializeSpeed();
  data += this.serializeTimeSignature();
  data += this.maxBeats.toString(2).padStart(9, '0'); // 0-511 range
  
  // Track type flags (only for additional tracks beyond default 3)
  for (let i = 3; i < this.tracks.length; i++) {
    data += this.tracks[i].instrument === 'piano' ? '0' : '1';
  }
  
  // Track notes (with RLE and delta encoding)
  this.tracks.forEach(track => {
    data += this.serializeTrackNotesCompressed(track);
  });
  
  return this.encodeToBase64(data);
}

serializeTrackNotesCompressed(track) {
  let data = '';
  let i = 0;
  
  while (i < track.notes.length) {
    // Check for silence runs (4+ beats)
    const silenceRun = this.countSilenceRun(track.notes, i);
    if (silenceRun >= 4) {
      data += '1'; // RLE flag
      data += (silenceRun - 1).toString(2).padStart(7, '0'); // 1-128 range
      i += silenceRun;
      continue;
    }
    
    // Check for melodic runs (piano tracks only)
    if (track.instrument === 'piano') {
      const melodicRun = this.getMelodicRun(track.notes, i);
      if (melodicRun.length >= 3) {
        data += '01'; // Delta encoding flag
        data += melodicRun[0].toString(2).padStart(4, '0'); // First note (full)
        for (let j = 1; j < melodicRun.length; j++) {
          const delta = melodicRun[j] - melodicRun[j-1];
          data += this.encodeDelta(delta); // 2-bit delta
        }
        i += melodicRun.length;
        continue;
      }
    }
    
    // Normal encoding
    data += '00'; // Normal flag
    data += track.notes[i].toString(2).padStart(4, '0');
    i++;
  }
  
  return this.encodeToBase64(data);
}
```

**Backward Compatibility:**
- v8 and earlier URLs → Load with 3 tracks, 64 beats (legacy mode)
- v9 URLs with trackCount=3, beatCount=64 → Legacy format (no compression)
- v9 URLs with trackCount>3 or beatCount>64 → New format (compression enabled)
- Deserialization auto-detects flags (`1` = RLE, `01` = delta, `00` = normal)

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

**Example: 6 Tracks on Mobile (Portrait)**
```
┌─────────────────────────────────┐
│ 🏠  ▶️  🔄  💾  📤  [••• 2:08] │ ← Controls (fixed)
├─────────────────────────────────┤
│ 🎹 Piano (High)  ████░░░░░░░░░░ │ ← Track 1 (default)
│ 🎹 Piano (Low)   ░░██░░░░░░░░░░ │ ← Track 2 (default)
│ 🥁 Percussion     █░█░█░░░░░░░░░ │ ← Track 3 (default)
│ 🎹 Piano (High)  ░░░░██░░░░░░░░ │ ← Track 4 (added)
│ 🥁 Percussion     ░░░░░█░█░░░░░░ │ ← Track 5 (added)
│ 🎹 Piano (Low)   ░░░░░░░░██░░░░ │ ← Track 6 (added)
├─────────────────────────────────┤
│      ➕ Add Track (max 6)       │ ← Fixed at bottom
└─────────────────────────────────┘

← Scroll horizontally for 256 beats →
```

**Responsive behaviors:**
- **64 beats:** All visible, no scroll (Kid Mode)
- **128 beats:** ~50% visible, smooth scroll (Tween Mode)
- **256 beats:** ~25% visible, scroll with beat markers every 16 beats (Studio Mode)

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
- [ ] 3 tracks, 64 beats → URL < 200 chars
- [ ] 6 tracks, 64 beats → URL < 300 chars (with compression)
- [ ] 6 tracks, 256 beats (sparse) → URL < 400 chars
- [ ] 6 tracks, 256 beats (dense) → URL < 600 chars
- [ ] RLE compression works for silence runs
- [ ] Delta encoding works for melodic sequences
- [ ] Share UI shows appropriate options based on size
- [ ] QR code generation works for all sizes

**Mobile Tests:**
- [ ] 6 tracks fit on screen (with vertical scrolling)
- [ ] 256 beats scroll horizontally smoothly
- [ ] Beat markers every 16 beats aid navigation
- [ ] Add track button accessible on mobile
- [ ] Track reordering works with touch
- [ ] Performance maintained (60fps with 6 tracks × 256 beats)

**Edge Cases:**
- [ ] Adding track when at max (4 in Tween, 6 in Studio) shows error
- [ ] Removing last custom track returns to 3 tracks
- [ ] Reordering tracks updates track selection correctly
- [ ] Very dense song (all tracks, all beats) serializes correctly
- [ ] RLE handles max silence run (127 beats)
- [ ] Delta encoding handles non-melodic jumps (falls back to normal)
- [ ] Switching modes adjusts track/beat limits correctly

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
| Studio Mode users add tracks | >40% try adding 4+ tracks |
| Full-length songs created | >25% of Studio Mode songs use 128+ beats |
| Complex arrangements | >15% use 5+ tracks |
| Share success rate | >95% successful shares (link or QR) |
| URL size manageable | <500 chars for typical 6-track songs |
| Mobile usability | 6 tracks × 256 beats usable on phones |
| Compression effectiveness | >40% size reduction on average |

---

## Related Features

- **Track Selection (v7)** - More important with 8 tracks
- **Time Signatures (v8)** - Applies to all tracks
- **Custom UI Layout (v10)** - Track panel could be repositioned/resized
- **Pattern Library (v5)** - Patterns could span multiple tracks
