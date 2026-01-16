# Piano Keyboard UI - Design Mockup

## Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  🎵 Music Box Composer                    Key: [C Major ▼]  🏠  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────── PIANO KEYBOARD ─────────────────┐            │
│  │  ┌─┐ ┌─┐   ┌─┐ ┌─┐ ┌─┐   ┌─┐ ┌─┐               │            │
│  │  │C│ │D│   │F│ │G│ │A│   │C│ │D│    (Black)    │            │
│  │  │#│ │#│   │#│ │#│ │#│   │#│ │#│               │            │
│  │  └┬┘ └┬┘   └┬┘ └┬┘ └┬┘   └┬┘ └┬┘               │            │
│  │ ┌─┴┐ ┌┴┐ ┌─┴┐ ┌┴┐ ┌┴┐ ┌─┴┐ ┌┴┐ ┌─┴┐           │            │
│  │ │🔴│ │🟡│ │🔵│ │⚪│ │🟧│ │🟩│ │🔴│ │🟡│ (White)  │            │
│  │ │ C│ │ D│ │ E│ │ F│ │ G│ │ A│ │ B│ │ C│          │            │
│  │ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘          │            │
│  └───────────────────────────────────────────────────┘            │
│                                                                  │
│  ┌──────────── PERCUSSION ──────────┐                           │
│  │  🥁 Kick  │  🥁 Snare  │  🔔 Hat  │  👏 Clap  │              │
│  └──────────────────────────────────┘                           │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                         TIMELINE                                │
├─────────────────────────────────────────────────────────────────┤
│  Track 1 (High): [🔴][  ][🟡][🟡][  ][🔵][  ][⚪]...             │
│  Track 2 (Low):  [  ][🔴][  ][  ][🟧][  ][🟩][  ]...             │
│  Track 3 (Perc): [🥁][  ][🥁][  ][🔔][  ][👏][  ]...             │
│                  1   2   3   4   5   6   7   8   ...            │
├─────────────────────────────────────────────────────────────────┤
│  ▶️ Play   ⏸️ Pause   🔄 Reset   🔁 Loop   🎚️ Speed   💾 Share  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Selection Dropdown States

### C Major (Default - All White Keys)
```
┌────────────────────────┐
│ Key: C Major ▼         │
├────────────────────────┤
│ ✓ C Major              │  ← Selected
│   G Major              │
│   D Major              │
│   A Major              │
│   F Major              │
│   ───────────────      │
│   A Minor              │
│   E Minor              │
│   D Minor              │
│   ───────────────      │
│   Freeform (All)       │
└────────────────────────┘

Piano state: C D E F G A B enabled (white keys only)
             C# D# F# G# A# disabled (grayed out)
```

### G Major (One Sharp: F#)
```
Piano state: G A B C D E F# enabled
             C# D# G# A# disabled (grayed out)
```

### A Minor (No Sharps/Flats)
```
Piano state: A B C D E F G enabled
             C# D# F# G# A# disabled (grayed out)
```

### Freeform (All Chromatic)
```
Piano state: ALL 12 notes enabled
             C C# D D# E F F# G G# A A# B all draggable
```

## Visual States

### Enabled Piano Key
```
┌────────┐
│  🔴    │  ← Full opacity (100%)
│  C     │  ← Bold text
└────────┘  ← Cursor: grab
            ← Draggable
```

### Disabled Piano Key
```
┌────────┐
│  🔴    │  ← 50% opacity
│  C     │  ← Gray text
└────────┘  ← Cursor: not-allowed
            ← Not draggable
            ← Gray overlay filter
```

### Piano Key Being Dragged
```
┌────────┐
│  🔴    │  ← Ghost/transparent while dragging
│  C     │  ← Follows cursor
└────────┘  
```

## Responsive Layout

### Desktop (Wide Screen)
```
Piano: Full octave + repeat C (13 keys visible)
Timeline: 16-24 beats visible at once
Percussion: Horizontal row
```

### Tablet (Medium Screen)
```
Piano: Full octave (12 keys, compact spacing)
Timeline: 12-16 beats visible, horizontal scroll
Percussion: Horizontal row (slightly smaller)
```

### Mobile (Narrow Screen)
```
Piano: Scrollable horizontally, 6-8 keys visible
Timeline: 8 beats visible, horizontal scroll
Percussion: 2×2 grid layout

┌─────────────────────┐
│ [🎵] Key:[C Major▼] │
│ ┌─────── Piano ───┐ │
│ │ [C][D][E][F]→   │ │ ← Scroll
│ └─────────────────┘ │
│ ┌── Percussion ───┐ │
│ │ [🥁][🥁]         │ │
│ │ [🔔][👏]         │ │
│ └─────────────────┘ │
│ ┌──── Timeline ───┐ │
│ │ T1: [🔴][🟡]→   │ │ ← Scroll
│ │ T2: [ ][ ]→     │ │
│ │ T3: [🥁][ ]→    │ │
│ └─────────────────┘ │
│ [▶️][⏸️][🔄][🔁]     │
└─────────────────────┘
```

## Color Scheme

### Piano Note Colors (Matching Chromatic Circle)
```
C  = 🔴 Red       (Root)
C# = 🟠 Orange    
D  = 🟡 Yellow    
D# = 🟢 Green     
E  = 🔵 Blue      
F  = 🟣 Purple    
F# = 🟤 Brown     
G  = ⚪ White     (Perfect 5th)
G# = 🟥 Dark Red  
A  = 🟧 Orange    
A# = 🟨 Light Yellow
B  = 🟩 Light Green
```

### Track Backgrounds
```
Track 1 (High Piano): Light blue background (#E3F2FD)
Track 2 (Low Piano):  Light purple background (#F3E5F5)
Track 3 (Percussion): Light gray background (#F5F5F5)
```

### Key Selection States
```
Enabled key:  Full saturation, white background
Disabled key: Grayscale filter, light gray background
Selected key: Green checkmark indicator
```

## Interaction Flow

### Dragging a Piano Note

1. **Pick up**: User taps/clicks piano key
   ```
   [🔴 C] → Becomes semi-transparent
   ```

2. **Drag over timeline**: Shows drop indicator
   ```
   Track 1: [  ] ← Drop here (green outline)
   Track 2: [  ] ← Drop here (blue outline)
   Track 3: [  ] ← Not valid (no highlight)
   ```

3. **Drop**: Note appears in timeline
   ```
   Track 1: [🔴] ← High C (C5)
   Track 2: [🔴] ← Low C (C3)  (same color, different octave)
   ```

### Changing Musical Key

1. **Click dropdown**: Shows key options
2. **Select key**: Piano updates immediately
   ```
   Before (C Major): C D E F G A B enabled
   After (G Major):  G A B C D E F# enabled (F# now enabled, F disabled)
   ```
3. **Timeline updates**: Notes outside new key are NOT removed (user choice preserved)
4. **Visual indicator**: Status text shows "Key: G Major"

### Extending Note Duration

1. **Click and drag note right**: Extends duration
   ```
   [🔴] → [🔴────] (2 beats)
   [🔴] → [🔴────────] (3 beats)
   ```

2. **Visual feedback**: Note becomes wider rounded rectangle
3. **Collision detection**: Stops extending if hits another note

## Accessibility Features

### Visual
- High contrast piano keys (white/black clearly distinct)
- Large touch targets (48px minimum)
- Color + icon (not color-only identification)

### Keyboard Navigation
- Tab through piano keys
- Enter/Space to "pick up" note
- Arrow keys to select timeline position
- Enter to drop note

### Screen Reader
- Piano keys: "C note, red, enabled" or "C sharp, disabled"
- Timeline: "Track 1, beat 5, C note, high octave"
- Dropdown: "Key selector, currently C Major"

## Animation Details

### Note Drop Animation
```css
@keyframes note-drop {
    0%   { transform: scale(1.2); opacity: 0.5; }
    50%  { transform: scale(0.9); }
    100% { transform: scale(1); opacity: 1; }
}
/* Duration: 300ms */
```

### Piano Key Press
```css
@keyframes key-press {
    0%   { transform: translateY(0); }
    50%  { transform: translateY(2px); }
    100% { transform: translateY(0); }
}
/* Duration: 150ms */
```

### Disabled Key Gray-out
```css
@keyframes disable-key {
    from { opacity: 1; filter: none; }
    to   { opacity: 0.5; filter: grayscale(100%); }
}
/* Duration: 200ms */
```

## Implementation Notes

### CSS Variables
```css
:root {
    --piano-white-key-width: 48px;
    --piano-white-key-height: 120px;
    --piano-black-key-width: 32px;
    --piano-black-key-height: 80px;
    --piano-key-gap: 2px;
    
    --track-1-color: #E3F2FD;  /* Light blue */
    --track-2-color: #F3E5F5;  /* Light purple */
    --track-3-color: #F5F5F5;  /* Light gray */
    
    --disabled-opacity: 0.5;
    --disabled-filter: grayscale(100%);
}
```

### HTML Structure
```html
<div class="piano-keyboard">
    <div class="piano-key white enabled" data-note="C" data-octave="variable">
        <span class="icon">🔴</span>
        <span class="label">C</span>
    </div>
    <div class="piano-key black disabled" data-note="C#">
        <span class="icon">🟠</span>
        <span class="label">C#</span>
    </div>
    <!-- ... more keys ... -->
</div>
```

### Key Selection Logic
```javascript
const KEY_SIGNATURES = {
    'C Major': [0, 2, 4, 5, 7, 9, 11],  // C D E F G A B
    'G Major': [0, 2, 4, 6, 7, 9, 11],  // C D E F# G A B
    // ... etc
};

function updatePianoKeys(keyName) {
    const allowedNotes = KEY_SIGNATURES[keyName];
    pianoKeys.forEach((key, index) => {
        if (allowedNotes.includes(index)) {
            key.classList.remove('disabled');
            key.draggable = true;
        } else {
            key.classList.add('disabled');
            key.draggable = false;
        }
    });
}
```
