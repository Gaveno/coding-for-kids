# Feature: Time Signature Support

## Overview

Add musical time signature options to Studio Mode, allowing users to create songs in different meters beyond the default 4/4. Includes visual beat grouping, measure lines, and automatic measure counting.

**Target Version:** v8.0  
**Priority:** MEDIUM  
**Complexity:** Medium  
**Impact:** Medium (expands musical possibilities for advanced users)

---

## Time Signatures to Support

### Core Signatures (v8.0)

| Signature | Name | Description | Use Cases |
|-----------|------|-------------|-----------|
| **4/4** | Common Time | 4 beats per measure (DEFAULT) | Pop, rock, most western music |
| **3/4** | Waltz Time | 3 beats per measure | Waltzes, some folk music |
| **6/8** | Compound Duple | 6 eighth notes per measure (2 dotted quarter beats) | Slow ballads, Irish jigs |
| **5/4** | Quintuple Time | 5 beats per measure | Progressive rock, jazz (Take Five) |
| **7/8** | Septuple Time | 7 eighth notes per measure | Balkan music, progressive music |

**Most Common Signatures in Western Music:**
1. 4/4 (Common Time) - 90% of popular music
2. 3/4 (Waltz Time) - 5% of popular music
3. 6/8 (Compound) - 3% of popular music
4. 2/4 (March Time) - 1% (skipped for simplicity, similar to 4/4)
5. 5/4, 7/8 (Odd Meters) - <1% but popular in educational contexts

---

## Current Behavior

- Timeline implicitly uses 4/4 time
- No visual measure separators
- Beat markers every 4 beats (matching 4/4)
- Users cannot change time signature

**Problems:**
- Cannot create waltzes (3/4)
- Cannot create compound meters (6/8)
- No visual measure grouping
- Advanced users limited to 4/4

---

## Proposed Behavior

### Mode Availability

| Mode | Time Signatures Available |
|------|---------------------------|
| 🧸 Kid Mode | 4/4 only (hidden) |
| 🎸 Tween Mode | 4/4 only (hidden) |
| 🎛️ Studio Mode | All 5 signatures selectable |

**Rationale:**
- Kid/Tween users don't understand time signatures
- Studio Mode users are learning advanced music theory
- Keeps Kid/Tween modes simple and accessible

### Time Signature Selector (Studio Mode)

**UI Location:**
- Near key signature selector (top controls area)
- Labeled with icon: 🎵 "Time Signature"
- Dropdown or segmented control

**Selector Options:**
```
🎵 4/4 (Common)
🎵 3/4 (Waltz)
🎵 6/8 (Compound)
🎵 5/4 (Quintuple)
🎵 7/8 (Septuple)
```

### Visual Timeline Changes

**Measure Lines:**
```css
.measure-line {
  position: absolute;
  height: 100%;
  border-left: 2px solid var(--measure-line-color);
  opacity: 0.6;
}

.measure-line.strong {
  border-width: 3px;
  opacity: 0.8;
}
```

**Beat Emphasis:**
- Strong beats (beat 1 of each measure) slightly larger/brighter
- Weak beats normal size
- Visual grouping matches time signature

**Example: 3/4 Time**
```
|  •   •   •  |  •   •   •  |  •   •   •  |
   1   2   3     1   2   3     1   2   3
   ↑ strong      ↑ strong      ↑ strong
```

**Example: 6/8 Time**
```
|  •  •  •  •  •  •  |  •  •  •  •  •  •  |
   1  2  3  4  5  6     1  2  3  4  5  6
   ↑        ↑           ↑        ↑
   strong   medium      strong   medium
```

### Metronome Click Pattern

**Implement "conductor beat" for preview:**
- Strong beat (downbeat): Higher pitch click
- Medium beat (mid-measure): Medium pitch click  
- Weak beats: Lower pitch click

**Example Patterns:**
- **4/4:** STRONG weak medium weak
- **3/4:** STRONG weak weak
- **6/8:** STRONG weak weak medium weak weak
- **5/4:** STRONG weak weak medium weak (most common feel)
- **7/8:** STRONG weak medium weak medium weak weak (2+2+3 grouping)

---

## Technical Implementation

### Data Model Changes

**Game Class Updates:**
```javascript
class Game {
  constructor() {
    // ... existing properties
    this.timeSignature = {
      numerator: 4,
      denominator: 4,
      beatsPerMeasure: 4
    };
  }
  
  setTimeSignature(numerator, denominator) {
    this.timeSignature = {
      numerator,
      denominator,
      beatsPerMeasure: numerator
    };
    
    this.updateTimelineVisuals();
    this.updateMetronomePattern();
  }
  
  getMeasureCount() {
    return Math.ceil(this.maxBeats / this.timeSignature.beatsPerMeasure);
  }
}
```

**Timeline Updates:**
```javascript
class Timeline {
  renderMeasureLines() {
    const beatsPerMeasure = game.timeSignature.beatsPerMeasure;
    
    for (let beat = 0; beat <= game.maxBeats; beat += beatsPerMeasure) {
      const measureLine = document.createElement('div');
      measureLine.className = 'measure-line';
      if (beat % (beatsPerMeasure * 4) === 0) {
        measureLine.classList.add('strong'); // Every 4 measures
      }
      measureLine.style.left = `${(beat / game.maxBeats) * 100}%`;
      this.container.appendChild(measureLine);
    }
  }
  
  renderBeatMarkers() {
    const beatsPerMeasure = game.timeSignature.beatsPerMeasure;
    
    for (let beat = 1; beat <= game.maxBeats; beat++) {
      const isDownbeat = (beat - 1) % beatsPerMeasure === 0;
      const marker = document.createElement('div');
      marker.className = 'beat-marker';
      if (isDownbeat) marker.classList.add('strong');
      marker.style.left = `${(beat / game.maxBeats) * 100}%`;
      this.container.appendChild(marker);
    }
  }
}
```

**Audio Class Updates:**
```javascript
class Audio {
  playMetronomeClick(beat, timeSignature) {
    const position = (beat % timeSignature.beatsPerMeasure) + 1;
    let frequency;
    
    switch (timeSignature.numerator) {
      case 3: // 3/4 waltz
        frequency = position === 1 ? 1000 : 600;
        break;
      case 4: // 4/4 common
        frequency = position === 1 ? 1000 : (position === 3 ? 800 : 600);
        break;
      case 5: // 5/4
        frequency = position === 1 ? 1000 : (position === 4 ? 800 : 600);
        break;
      case 6: // 6/8
        frequency = position === 1 ? 1000 : (position === 4 ? 800 : 600);
        break;
      case 7: // 7/8 (2+2+3 grouping)
        frequency = position === 1 ? 1000 : ([3, 5].includes(position) ? 800 : 600);
        break;
    }
    
    this.playClick(frequency);
  }
}
```

---

## URL Serialization

**Additional data required:**

| Field | Bits | Values |
|-------|------|--------|
| Time Signature ID | 3 bits | 0=4/4, 1=3/4, 2=6/8, 3=5/4, 4=7/8, 5-7=reserved |

**Total: 3 bits (0.375 bytes)**

**Serialization Format:**
```javascript
// In v8 header (after mode bits)
serializeV8() {
  const timeSigId = this.getTimeSignatureId();
  header += timeSigId.toString(2).padStart(3, '0');
  // ... rest of serialization
}

getTimeSignatureId() {
  const { numerator, denominator } = this.timeSignature;
  const sigMap = {
    '4/4': 0,
    '3/4': 1,
    '6/8': 2,
    '5/4': 3,
    '7/8': 4
  };
  return sigMap[`${numerator}/${denominator}`] || 0;
}

deserializeV8(data) {
  const timeSigId = parseInt(data.substr(offset, 3), 2);
  const timeSignatures = [
    [4, 4], [3, 4], [6, 8], [5, 4], [7, 8]
  ];
  const [numerator, denominator] = timeSignatures[timeSigId];
  this.setTimeSignature(numerator, denominator);
  // ... rest of deserialization
}
```

**Backward Compatibility:**
- v7 and earlier URLs default to 4/4 time
- No changes to existing URL structure
- v8 URLs include time signature in header

---

## Mobile Considerations

**Touch Interactions:**
- Time signature selector must be accessible on mobile
- Measure lines should be visible but not cluttered on small screens
- Beat grouping should be clear even at 320px width

**Performance:**
- Rendering measure lines must not impact 60fps
- Use CSS transforms for positioning (GPU acceleration)
- Limit measure line elements (max 64 / beatsPerMeasure)

---

## Educational Value

**Learning Outcomes:**
- Understanding different rhythmic feels
- Introduction to musical meter
- Exposure to non-4/4 music (broadens musical horizons)

**Progressive Learning Path:**
1. Start with 4/4 (familiar, easy)
2. Try 3/4 (simple odd meter, waltz feel)
3. Explore 6/8 (compound meter, different feel)
4. Challenge with 5/4 and 7/8 (complex, "groovy")

---

## Testing Checklist

**Functional Tests:**
- [ ] Time signature selector works in Studio Mode
- [ ] Timeline renders correct measure lines
- [ ] Beat emphasis matches time signature
- [ ] Metronome click pattern is correct
- [ ] Playback feels correct for each signature
- [ ] URL serialization preserves time signature
- [ ] Backward compatibility (old URLs load as 4/4)

**Visual Tests:**
- [ ] Measure lines visible but not cluttered
- [ ] Strong beats are visually emphasized
- [ ] Works on mobile screens (320px+)
- [ ] No performance degradation (60fps maintained)

**Musical Tests:**
- [ ] 3/4 feels like a waltz
- [ ] 6/8 feels compound (not just fast 3/4)
- [ ] 5/4 feels asymmetrical but groovy
- [ ] 7/8 grouping makes musical sense

**Edge Cases:**
- [ ] Changing time signature mid-song adjusts measure lines
- [ ] Timeline with max beats (64) renders correctly
- [ ] Very short songs (4-8 beats) still show measure line
- [ ] Switching between signatures doesn't break layout

---

## Future Enhancements

**Not included in v8.0:**

| Enhancement | Reason Deferred |
|-------------|----------------|
| Custom time signatures (e.g., 9/8, 11/8) | Too advanced, niche use case |
| Mixed meters (changing mid-song) | Complex UI, rare use case |
| Polyrhythms (different time per track) | Very advanced, confusing |
| Time signature tutorial | Requires text-based instruction |
| Measure numbers on timeline | Could add clutter, consider for v9 |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time signature selector discoverable | >60% of Studio Mode users try it |
| Songs in non-4/4 created | >20% of Studio Mode songs |
| Visual clarity | >80% feedback "measure lines help" |
| URL size impact | <5 bytes added |
| Performance | 60fps maintained with measure lines |

---

## Related Features

- **Track Selection (v7)** - Selected track could pulse on strong beats
- **Additional Tracks (v9)** - Time signature applies to all tracks
- **Custom UI Layout (v10)** - Time signature selector repositionable
- **Metronome (future)** - Would use time signature for click pattern
