# Music Box Composer - Design Document

## Overview

A visual music sequencer for pre-literate children. Users drag piano notes from a single-octave keyboard onto a 3-track timeline:
- **Track 1 (High Piano)**: Notes play in higher octave
- **Track 2 (Low Piano)**: Same notes play in lower octave  
- **Track 3 (Percussion)**: Drums and percussion sounds

A **key selector** lets users choose musical keys (C Major, G Major, etc.), which grays out and disables notes outside the selected key. Songs can be up to **64 beats long**.

---

## Architecture

### Core Classes

| File | Responsibility |
|------|----------------|
| `Game.js` | Main controller, playback, key selection, URL serialization, QR generation |
| `Timeline.js` | Multi-track timeline UI rendering |
| `Track.js` | Single track data model |
| `Audio.js` | Web Audio API synthesis (with octave transposition) |
| `DragDrop.js` | Drag notes from piano/percussion palette to timeline |
| `Character.js` | Animated character reactions |
| `PianoKeyboard.js` | Piano UI with key signature support |
| `QRCode.js` | QR code generation for song URLs |

### Data Flow

```
User drags note → DragDrop → Game.handleNoteDrop() → Timeline.setNote() → Track.setNote()
                                    ↓
                            Game.updateURL() → serializeState() → URL ?c=...

User selects key → Game.setKey() → PianoKeyboard.updateDisabledKeys() → UI updates
```

---

## Musical Key System

### Key Selector UI
- Dropdown in controls area
- Default: **C Major** (all white keys: C, D, E, F, G, A, B)
- Options include major and minor keys:
  - **Major keys**: C, G, D, A, E, B, F, Bb, Eb, Ab, Db
  - **Minor keys**: A, E, B, F#, C#, G#, D, G, C, F, Bb, Eb
  - **Freeform**: All 12 chromatic notes enabled

### Key Signature Tables

```javascript
// Notes in each key (0-11 = C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
const KEY_SIGNATURES = {
    'C Major':  [0, 2, 4, 5, 7, 9, 11],     // C D E F G A B
    'G Major':  [0, 2, 4, 6, 7, 9, 11],     // C D E F# G A B  
    'D Major':  [0, 2, 4, 6, 7, 9, 10],     // C# D E F# G A B
    'A Major':  [0, 1, 2, 4, 6, 7, 9],      // C# D E F# G# A B
    'F Major':  [0, 2, 3, 5, 7, 9, 11],     // C D Eb F G A Bb
    'A Minor':  [0, 2, 3, 5, 7, 8, 10],     // A B C D E F G
    'E Minor':  [0, 2, 4, 5, 7, 9, 10],     // E F# G A B C D
    'Freeform': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]  // All chromatic
};
```

### Visual Behavior
- **Enabled keys**: Full opacity, draggable
- **Disabled keys**: 50% opacity, gray filter, not draggable, cursor: not-allowed
- Piano visually shows which notes are in the current key

---

## Piano Keyboard Design

### Single Octave Layout
- **12 chromatic notes**: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
- Visual layout mimics piano keyboard:
  - White keys: C, D, E, F, G, A, B (7 keys)
  - Black keys: C#, D#, F#, G#, A# (5 keys, offset between white keys)
- Each key shows note name and color-coded icon

### Octave Transposition
- **High Piano Track (Track 1)**: Notes play as C5-B5
- **Low Piano Track (Track 2)**: Notes play as C3-B3
- Same visual note, different octave based on track placement
- `Audio.js` transposes frequency based on track type

### Note Colors (Emoji Icons)
```javascript
const PIANO_ICONS = {
    'C':  '🔴',  'C#': '🟠',  'D':  '🟡',  'D#': '🟢',
    'E':  '🔵',  'F':  '🟣',  'F#': '🟤',  'G':  '⚪',
    'G#': '🟥',  'A':  '🟧',  'A#': '🟨',  'B':  '🟩'
};
```

---

## Note Data Model

Each note in `Track.js` stores:

```javascript
{
    note: string,      // Note name (e.g., 'C', 'D#', 'kick')
    icon: string,      // Emoji display (e.g., '🔴', '🟡', '🥁')
    duration: number,  // Duration in beats (1-8, default 1)
    octave: number     // Octave number (3 or 5 for piano, null for percussion)
}
```

### Track Serialization Format

`Track.serialize()` returns an array of tuples:
```javascript
[[beat, noteIndex, duration], ...]
// Example: [[0, 0, 2], [3, 4, 1]]  // C for 2 beats, E for 1 beat
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

| Version | Max Beats | Bits/Beat | Features |
|---------|-----------|-----------|----------|
| v1 | 32 | 10 | No duration (melody:4, bass:3, perc:3) |
| v2 | 32 | 16 | With duration (melody:4+3, bass:3+3, perc:3) |
| v3 | 64 | 17 | Piano keyboard + key selection (piano1:4+3, piano2:4+3, perc:3) |

### Current Format (v3)

```
Header: 9 bits
  - Speed index:     2 bits (0-3)
  - Loop enabled:    1 bit  (0-1)
  - Length index:    2 bits (0-3 → 16/32/48/64 beats)
  - Key signature:   4 bits (0-15, index into KEY_SIGNATURES array)

Per beat: 17 bits
  - Piano track 1:   4 bits (0-12, index into PIANO_NOTES)
  - Piano 1 duration: 3 bits (0-7 → duration 1-8)
  - Piano track 2:   4 bits (0-12, index into PIANO_NOTES)  
  - Piano 2 duration: 3 bits (0-7 → duration 1-8)
  - Percussion:      3 bits (0-4, index into PERC_NOTES)
```

### Data Size Analysis

**Maximum song (64 beats):**
- Header: 9 bits
- Data: 64 beats × 17 bits = 1088 bits
- Total: 1097 bits = 137.125 bytes → **~183 base64 characters**
- Full URL: `https://example.com/music-box-composer/?c=v3_` + 183 chars = **~230 characters**

**Browser URL limits:**  
- Most browsers support 2000+ character URLs
- Our maximum URL is **~12% of typical limit**
- Conclusion: **URL-based sharing is efficient and recommended**

### Legacy Format (v2)

```
Per beat: 10 bits
  - Melody note:   4 bits
  - Bass note:     3 bits
  - Percussion:    3 bits
```

### Note Index Tables

```javascript
PIANO_NOTES = ['', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
PERC_NOTES  = ['', 'kick', 'snare', 'hihat', 'clap']

KEY_SIGNATURES = [
    'C Major', 'G Major', 'D Major', 'A Major', 'E Major', 'B Major', 'F Major',
    'Bb Major', 'Eb Major', 'A Minor', 'E Minor', 'B Minor', 'D Minor', 'G Minor',
    'C Minor', 'Freeform'
]
```

---

## Adding New Saveable Features (Versioning Guide)

When adding features that need URL persistence:

### 1. Increment the Version

In `Game.js`, update:
```javascript
static ENCODING_VERSION = 4; // Was 3
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

## Song Sharing System

### Overview

Songs are shared using multiple methods depending on song length and user preference:

1. **URL-based sharing** (Primary) - Works for all songs, optimal for songs ≤32 beats
2. **Web Share API** (Primary on mobile) - Native OS sharing, works for all apps
3. **QR Code generation** (Supplementary) - Solves SMS limitation for songs >32 beats

### SMS Character Limitation

**Critical Constraint:** SMS has a 160-character limit.

| Song Length | URL Size | SMS Compatible? | Sharing Method |
|-------------|----------|-----------------|----------------|
| 16 beats | ~95 chars | ✅ Yes | URL, Web Share, SMS |
| 32 beats | ~140 chars | ✅ Yes | URL, Web Share, SMS |
| 48 beats | ~186 chars | ❌ No | URL, Web Share, QR Code |
| 64 beats | ~230 chars | ❌ No | URL, Web Share, QR Code |

**Solution:** QR codes provide SMS-compatible sharing for long songs via screenshot/photo.

---

### Method 1: URL-Based Sharing

**Status:** ✅ **Implemented**

With v3 format, even the maximum 64-beat song with full notes on all tracks:
- Uses only ~230 characters
- Far below browser URL limits (2000+ chars)
- Works in email, chat apps, browsers
- No server, database, or third-party service needed
- Copy/paste friendly

**Limitations:**
- Songs >32 beats don't fit in SMS (160 char limit)
- Some messaging apps may truncate very long URLs

---

### Method 2: Web Share API

**Status:** ✅ **Implemented**

**Implementation:**
```javascript
// In Game.js
async shareURL() {
    if (navigator.share) {
        await navigator.share({
            title: 'Music Box Composer',
            text: 'Check out my song!',
            url: window.location.href
        });
    } else {
        this.fallbackCopyURL(); // Copy to clipboard
    }
}
```

**Benefits:**
- Native OS sharing dialog
- User chooses sharing destination
- Bypasses SMS limitation in many apps
- Graceful fallback to clipboard

**Limitations:**
- Requires HTTPS
- Requires user gesture (button click)
- Not supported on all browsers (requires fallback)

---

### Method 3: QR Code Generation

**Status:** ✅ **Implemented** (v3)

**Purpose:** Solves SMS limitation for songs >32 beats by enabling visual sharing.

#### Implementation Details

**QR Code Encoder** (`QRCode.js`):
- Vanilla JS implementation (no external dependencies)
- Supports QR Version 4-5 (up to 370 characters)
- Error correction level: Medium
- Renders to HTML5 Canvas
- ~300 lines of code

**QR Code Encoder** (`QRCode.js`):
- Vanilla JS implementation (no external dependencies)
- Supports QR Version 4-5 (up to 370 characters)
- Error correction level: Medium
- Renders to HTML5 Canvas
- ~300 lines of code

**Generation Logic:**
```javascript
// In Game.js
generateQRCode() {
    const url = window.location.href;
    const canvas = QRCodeGenerator.generate(url, 256);
    
    // Show in modal
    const modal = document.getElementById('qr-modal');
    const qrCanvas = document.getElementById('qr-canvas');
    qrCanvas.replaceWith(canvas);
    canvas.id = 'qr-canvas';
    modal.classList.remove('hidden');
}

downloadQRCode() {
    const canvas = document.getElementById('qr-canvas');
    const link = document.createElement('a');
    link.download = 'music-box-song.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}
```

**Smart UI Logic:**
```javascript
// Show QR button only for long songs
updateShareButtons() {
    const qrBtn = document.getElementById('qr-btn');
    if (this.songLength > 32 || this.getEstimatedURLLength() > 160) {
        qrBtn.classList.remove('hidden');
    } else {
        qrBtn.classList.add('hidden');
    }
}
```

**UI Components:**

1. **QR Button** (conditionally shown):
   - Appears in controls when song >32 beats
   - Icon: 📱 or QR code emoji
   - Text: "Share QR Code"

2. **QR Modal**:
   ```html
   <div id="qr-modal" class="modal hidden">
       <div class="modal-content">
           <h2>Share QR Code</h2>
           <canvas id="qr-canvas"></canvas>
           <p>Scan with camera or save image</p>
           <div class="modal-buttons">
               <button id="download-qr-btn">Download Image</button>
               <button id="close-qr-btn">Close</button>
           </div>
       </div>
   </div>
   ```

3. **User Flow**:
   - User creates song >32 beats
   - "Share QR Code" button appears
   - Click button → Modal opens with QR code
   - User can: (a) Screenshot the modal, (b) Download PNG, (c) Scan with another device

**Benefits:**
- ✅ Works for ALL song lengths (even 64 beats)
- ✅ Bypasses SMS character limit completely
- ✅ Visual/screenshot sharing in messaging apps
- ✅ Fun camera interaction for kids
- ✅ No server required (client-side generation)
- ✅ Generated QR codes are scannable by any camera app

**Trade-offs:**
- Adds ~300 lines of code (QR encoder)
- QR generation takes 100-300ms (acceptable)
- Modal adds UI complexity (minimal)

---

### Sharing Decision Tree

```
User clicks "Share"
    │
    ├── Song ≤32 beats?
    │   ├── Yes → Show: [Copy URL] [Share]
    │   └── No  → Show: [Copy URL] [Share] [QR Code]
    │
    ├── User clicks [Share]?
    │   ├── Web Share API available? → Show native sheet
    │   └── Not available? → Copy to clipboard
    │
    └── User clicks [QR Code]?
        └── Generate QR → Show modal → User screenshots/downloads
```

---

### QR Code Camera Scanning

**Status:** ❌ **Not Implemented** (intentionally excluded)

**Reason:** Camera scanning adds significant complexity for marginal benefit:
- Requires camera permissions (scary for parents/kids)
- HTTPS-only requirement
- Adds ~200+ lines of code
- Browser compatibility issues
- Users can already scan QR with native camera apps

**Alternative:** Users scan QR codes with their phone's built-in camera app, which opens the URL in the browser automatically.

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

### Piano Keyboard with Key Selection
- `PianoKeyboard.js` manages visual layout and enabled/disabled states
- When key changes: loop through all piano keys, check if in current key signature
- Disabled keys: `pointer-events: none`, grayed out visually
- `Audio.js` transposes notes based on track: Track 1 = octave 5, Track 2 = octave 3

---

## Implementation Priorities

### Phase 1: Core Piano System (Required for v3)
1. ✅ Replace melody/bass with single piano note set (12 chromatic notes)
2. ✅ Add `PianoKeyboard.js` with visual piano layout (white/black keys)
3. ✅ Update `Audio.js` to transpose octaves based on track (Track 1 = high, Track 2 = low)
4. ✅ Increase max song length: 32 → 64 beats
5. ✅ Update serialization to v3 format

### Phase 2: Key Selection (Required for v3)
1. ✅ Add key selector dropdown to UI (C Major, G Major, etc.)
2. ✅ Implement `KEY_SIGNATURES` lookup table
3. ✅ Update `PianoKeyboard.updateDisabledKeys()` based on selected key
4. ✅ Save key selection in URL (4 bits in header)
5. ✅ Load key from URL on page load

### Phase 3: Polish & Testing (Required)
1. ✅ Test all key signatures for correct note enabling/disabling
2. ✅ Verify octave transposition sounds correct
3. ✅ Test backwards compatibility with v1/v2 URLs
4. ✅ Mobile touch testing on piano keyboard
5. ✅ Update visual design for 64-beat timeline (scrolling/responsiveness)

### Phase 4: QR Code Sharing (Optional - Future)
- Only implement if user testing shows demand
- Estimated effort: 300-400 LOC
- Would not replace URL sharing, only supplement it

---

## Future Considerations

- [ ] Additional key signatures (modes: Dorian, Mixolydian, etc.)
- [ ] Volume per note (would need 2-3 bits per note)
- [ ] Note pitch bend/effects
- [ ] Multiple percussion instrument sets
- [ ] QR code generation/scanning (if user demand exists)
- [ ] Visual indicators showing which notes are in the current key (highlighting)

