# Feature: Dynamic Music Visualizer System

## Overview

Replace static animal emoji characters with a dynamic, mode-appropriate visualizer system that responds to musical parameters (notes, octaves, velocity, reverb, delay) with particle effects, geometric animations, and interactive visual feedback.

---

## Current Issues

1. **Animal emojis not responding** - The `Character.dance()` method is being called in `Game.playBeat()`, but CSS animations may not be retriggering properly
2. **Not age-appropriate for older modes** - Animal emojis are perfect for Kid Mode (3-6), but Teen/Studio modes need more sophisticated visuals
3. **Limited musical feedback** - Current system only shows which tracks are playing, doesn't visualize pitch, octave, velocity, or effects

---

## Mode-Specific Visualizer Designs

### 🧸 Kid Mode (Ages 3-6)
**Keep current animal emojis with fixed animations**

**Status:** Fix existing bugs

**Visual Elements:**
- Three animal emojis (🐱 🐶 🐰) remain unchanged
- Simple bounce/spin animations when notes play
- Large, clear, high-contrast

**Technical:**
- Keep existing `Character.js` class
- Fix CSS animation retriggering (force reflow working correctly)
- No new features needed

---

### 🎸 Tween Mode (Ages 7-12)
**Theme:** Neon particle bursts, arcade-style effects, rhythm-responsive shapes

**Visual Elements:**

#### 1. **Particle Burst System**
- **Position:** Centered in stage area (replaces center character)
- **Trigger:** Every note played creates a burst
- **Particle Count:** 8-16 particles per burst
- **Lifespan:** 600-800ms (fades out)

#### 2. **Note-to-Color Mapping**
Map each chromatic note to a distinct hue (12 colors):
```javascript
NOTE_COLORS = {
    1:  '#FF6B6B',  // C  - Red
    2:  '#FF8E53',  // C# - Orange-Red
    3:  '#FFA94D',  // D  - Orange
    4:  '#FFD93D',  // D# - Yellow-Orange
    5:  '#6BCF7F',  // E  - Yellow-Green
    6:  '#4ECDC4',  // F  - Cyan
    7:  '#45B7D1',  // F# - Light Blue
    8:  '#5B9BD5',  // G  - Blue
    9:  '#7B68EE',  // G# - Purple-Blue
    10: '#9B59B6',  // A  - Purple
    11: '#E056A8',  // A# - Magenta
    12: '#FF5E9A'   // B  - Pink
}
```

#### 3. **Octave Effects**
- **Size:** Higher octaves = smaller, faster particles
  - Octave 2: 30px particles, slow (300ms travel)
  - Octave 4: 20px particles, medium (200ms travel)
  - Octave 6: 12px particles, fast (100ms travel)

#### 4. **Track-Based Positioning**
- Track 1 (Melody): Bursts from **left** third of stage
- Track 2 (Bass): Bursts from **center** of stage
- Track 3 (Percussion): Bursts from **right** third of stage

#### 5. **Velocity (Volume) Feedback**
- Velocity 0.3: Small particles, low opacity (0.6), short travel distance
- Velocity 0.8: Medium particles (normal)
- Velocity 1.0: Large particles, full opacity, long travel distance

#### 6. **Geometric Background Rings**
- Three concentric rings that pulse/scale when their track plays
- Track 1 ring: Outermost, pulsates when melody plays
- Track 2 ring: Middle, pulsates when bass plays
- Track 3 ring: Innermost, pulsates when percussion plays
- Colors match note colors

**Technical Implementation:**
```javascript
class TweenVisualizer {
    constructor(stageEl) {
        this.stage = stageEl;
        this.particles = []; // Active particle objects
        this.rings = this.createRings();
    }
    
    createRings() {
        // Three SVG circles positioned absolutely
        const svg = createSVGElement('svg', {class: 'viz-rings'});
        const ring1 = createSVGElement('circle', {
            cx: '50%', cy: '50%', r: '45%',
            class: 'viz-ring ring-melody'
        });
        const ring2 = createSVGElement('circle', {
            cx: '50%', cy: '50%', r: '30%',
            class: 'viz-ring ring-bass'
        });
        const ring3 = createSVGElement('circle', {
            cx: '50%', cy: '50%', r: '15%',
            class: 'viz-ring ring-percussion'
        });
        svg.append(ring1, ring2, ring3);
        this.stage.appendChild(svg);
        return {melody: ring1, bass: ring2, percussion: ring3};
    }
    
    burstParticles(note, trackNum, octave, velocity) {
        const color = NOTE_COLORS[note];
        const position = this.getTrackPosition(trackNum);
        const size = this.getOctaveSize(octave);
        const count = Math.floor(8 + velocity * 8); // 8-16 particles
        
        for (let i = 0; i < count; i++) {
            this.createParticle(position, color, size, velocity);
        }
        
        // Pulse ring
        this.pulseRing(trackNum, color);
    }
    
    createParticle(pos, color, size, velocity) {
        const particle = document.createElement('div');
        particle.className = 'viz-particle';
        particle.style.left = pos.x + 'px';
        particle.style.top = pos.y + 'px';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.backgroundColor = color;
        particle.style.opacity = 0.6 + velocity * 0.4;
        
        // Random direction (360 degrees)
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + velocity * 100; // pixels to travel
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        
        particle.style.setProperty('--dx', dx + 'px');
        particle.style.setProperty('--dy', dy + 'px');
        
        this.stage.appendChild(particle);
        this.particles.push(particle);
        
        // Remove after animation
        setTimeout(() => {
            particle.remove();
            const idx = this.particles.indexOf(particle);
            if (idx > -1) this.particles.splice(idx, 1);
        }, 800);
    }
    
    getTrackPosition(trackNum) {
        const rect = this.stage.getBoundingClientRect();
        const thirds = rect.width / 3;
        const x = thirds * (trackNum - 0.5); // Center of third
        const y = rect.height / 2;
        return {x, y};
    }
    
    getOctaveSize(octave) {
        // Higher octave = smaller particles
        if (octave <= 2) return 30;
        if (octave <= 4) return 20;
        return 12;
    }
    
    pulseRing(trackNum, color) {
        const ringMap = {1: 'melody', 2: 'bass', 3: 'percussion'};
        const ring = this.rings[ringMap[trackNum]];
        if (!ring) return;
        
        ring.style.stroke = color;
        ring.classList.add('pulse');
        setTimeout(() => ring.classList.remove('pulse'), 300);
    }
    
    reset() {
        this.particles.forEach(p => p.remove());
        this.particles = [];
    }
}
```

**CSS:**
```css
/* Particle animation */
.viz-particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    animation: particleBurst 0.8s ease-out forwards;
    box-shadow: 0 0 10px currentColor;
}

@keyframes particleBurst {
    0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
    }
    100% {
        transform: translate(var(--dx), var(--dy)) scale(0);
        opacity: 0;
    }
}

/* Ring pulsing */
.viz-ring {
    fill: none;
    stroke-width: 3;
    stroke: rgba(255, 255, 255, 0.1);
    transition: stroke 0.1s ease;
}

.viz-ring.pulse {
    animation: ringPulse 0.3s ease-out;
}

@keyframes ringPulse {
    0%, 100% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.1); opacity: 1; }
}
```

---

### 🎛️ Studio Mode (Ages 13+)
**Theme:** Professional audio waveforms, frequency bars, effect visualizers

**Visual Elements:**

#### 1. **Waveform Display**
- **Position:** Top half of stage
- **Type:** Oscilloscope-style waveform
- **Real-time:** Updates as notes play
- **Color:** Single color (white/cyan), professional look

#### 2. **Frequency Spectrum Bars**
- **Position:** Bottom half of stage
- **Type:** 24-32 vertical bars (like audio EQ)
- **Frequency Mapping:**
  - Low octaves (2-3) → Left bars
  - Mid octaves (4) → Center bars
  - High octaves (5-6) → Right bars
- **Height:** Driven by velocity
- **Color:** Gradient from blue (low) to red (high)

#### 3. **Effect Visualizers**
When effects are implemented:
- **Reverb:** Trailing echo effect on waveform
- **Delay:** Repeated bars at intervals
- **Filter:** Change spectrum bar colors/heights

#### 4. **Peak Meter**
- **Position:** Right edge of stage
- **Type:** Vertical VU meter showing overall volume
- **Color:** Green → Yellow → Red (as volume increases)

#### 5. **Note Info Overlay** *(optional)*
- Small text showing current notes playing
- "C4 + E4 + G4" (chord display)
- Only show during playback, fade out after 1s

**Technical Implementation:**
```javascript
class StudioVisualizer {
    constructor(stageEl) {
        this.stage = stageEl;
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.spectrumBars = 32;
        this.barValues = new Array(this.spectrumBars).fill(0);
        this.peakLevel = 0;
        this.animationFrame = null;
        
        this.startAnimation();
    }
    
    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.className = 'viz-canvas';
        canvas.width = this.stage.offsetWidth;
        canvas.height = this.stage.offsetHeight;
        this.stage.appendChild(canvas);
        return canvas;
    }
    
    onNotePlay(note, trackNum, octave, velocity) {
        // Map note + octave to spectrum bar index
        const barIndex = this.getSpectrumBarIndex(note, octave);
        
        // Set bar height based on velocity
        this.barValues[barIndex] = Math.max(
            this.barValues[barIndex],
            velocity
        );
        
        // Update peak meter
        this.peakLevel = Math.max(this.peakLevel, velocity);
    }
    
    getSpectrumBarIndex(note, octave) {
        // Map 12 notes * 5 octaves (60 total notes) to 32 bars
        const totalNote = (octave - 2) * 12 + note; // 0-59
        const barIndex = Math.floor(totalNote / 60 * this.spectrumBars);
        return Math.max(0, Math.min(barIndex, this.spectrumBars - 1));
    }
    
    startAnimation() {
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw waveform (top half)
            this.drawWaveform();
            
            // Draw spectrum bars (bottom half)
            this.drawSpectrum();
            
            // Draw peak meter (right edge)
            this.drawPeakMeter();
            
            // Decay values
            this.barValues = this.barValues.map(v => v * 0.92);
            this.peakLevel *= 0.95;
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }
    
    drawWaveform() {
        const width = this.canvas.width;
        const height = this.canvas.height / 2;
        const centerY = height / 2;
        
        this.ctx.strokeStyle = '#00f5d4';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        // Simple sine wave affected by peak level
        for (let x = 0; x < width; x++) {
            const y = centerY + Math.sin(x * 0.05 + Date.now() * 0.01) 
                * this.peakLevel * 20;
            if (x === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
    }
    
    drawSpectrum() {
        const width = this.canvas.width;
        const height = this.canvas.height / 2;
        const barWidth = width / this.spectrumBars;
        const startY = this.canvas.height / 2;
        
        this.barValues.forEach((value, i) => {
            const barHeight = value * height * 0.8;
            const x = i * barWidth;
            const y = startY + height - barHeight;
            
            // Gradient color based on frequency (low=blue, high=red)
            const hue = 240 - (i / this.spectrumBars) * 240;
            this.ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
            
            this.ctx.fillRect(x, y, barWidth - 2, barHeight);
        });
    }
    
    drawPeakMeter() {
        const meterWidth = 20;
        const meterHeight = this.canvas.height * 0.8;
        const x = this.canvas.width - meterWidth - 10;
        const y = (this.canvas.height - meterHeight) / 2;
        
        // Background
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(x, y, meterWidth, meterHeight);
        
        // Peak level bar
        const peakHeight = this.peakLevel * meterHeight;
        const peakY = y + meterHeight - peakHeight;
        
        // Color gradient based on level
        let color;
        if (this.peakLevel < 0.6) {
            color = '#6BCF7F'; // Green
        } else if (this.peakLevel < 0.85) {
            color = '#FFD93D'; // Yellow
        } else {
            color = '#FF6B6B'; // Red
        }
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, peakY, meterWidth, peakHeight);
    }
    
    reset() {
        this.barValues.fill(0);
        this.peakLevel = 0;
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.canvas.remove();
    }
}
```

**CSS:**
```css
.viz-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}
```

---

## Unified Visualizer Manager

To handle mode switching and maintain a clean API:

```javascript
class VisualizerManager {
    constructor(stageEl) {
        this.stage = stageEl;
        this.currentMode = null;
        this.visualizer = null;
    }
    
    setMode(mode) {
        // Cleanup old visualizer
        if (this.visualizer) {
            if (this.visualizer.destroy) {
                this.visualizer.destroy();
            } else if (this.visualizer.reset) {
                this.visualizer.reset();
            }
            this.visualizer = null;
        }
        
        // Clear stage
        this.stage.innerHTML = '';
        
        // Create new visualizer based on mode
        switch(mode) {
            case 'kid':
                this.visualizer = new Character(
                    this.createCharacterElement('🐱', 'main'),
                    this.createCharacterElement('🐶', 'backup left'),
                    this.createCharacterElement('🐰', 'backup right')
                );
                break;
            case 'tween':
                this.visualizer = new TweenVisualizer(this.stage);
                break;
            case 'studio':
                this.visualizer = new StudioVisualizer(this.stage);
                break;
        }
        
        this.currentMode = mode;
    }
    
    createCharacterElement(emoji, className) {
        const el = document.createElement('div');
        el.className = `character ${className}`;
        el.textContent = emoji;
        this.stage.appendChild(el);
        return el;
    }
    
    onNotePlay(note, trackNum, octave, velocity, duration) {
        if (!this.visualizer) return;
        
        if (this.currentMode === 'kid') {
            // Map track to Character.dance() format
            const playing = {
                melody: trackNum === 1,
                bass: trackNum === 2,
                percussion: trackNum === 3
            };
            const durations = {
                melody: trackNum === 1 ? duration : 1,
                bass: trackNum === 2 ? duration : 1,
                percussion: 1
            };
            this.visualizer.dance(playing, durations);
        } else if (this.currentMode === 'tween') {
            this.visualizer.burstParticles(note, trackNum, octave, velocity);
        } else if (this.currentMode === 'studio') {
            this.visualizer.onNotePlay(note, trackNum, octave, velocity);
        }
    }
    
    celebrate() {
        if (this.visualizer && this.visualizer.celebrate) {
            this.visualizer.celebrate();
        }
    }
    
    reset() {
        if (this.visualizer && this.visualizer.reset) {
            this.visualizer.reset();
        }
    }
}
```

---

## Integration with Game.js

Replace `Character` instantiation with `VisualizerManager`:

```javascript
// In Game.constructor()
this.visualizer = new VisualizerManager(this.elements.stage);
this.visualizer.setMode(this.currentMode);

// In Game.setMode()
setMode(mode) {
    this.currentMode = mode;
    this.visualizer.setMode(mode);
    // ... rest of mode switching logic
}

// In Game.playBeat()
playBeat(beat) {
    const notes = this.timeline.getNotesAtBeat(beat);
    
    // Play sounds and trigger visualizer
    if (notes[1] && !notes[1].sustained) {
        const noteDuration = (notes[1].duration || 1) * beatDurationSec;
        const velocity = notes[1].velocity || 0.8;
        const octave = notes[1].octave || 4;
        this.audio.playNote(notes[1].note, 1, noteDuration, velocity, octave);
        this.visualizer.onNotePlay(notes[1].note, 1, octave, velocity, notes[1].duration || 1);
    }
    
    // ... same for tracks 2 and 3
}
```

---

## Implementation Phases

### Phase 1: Fix Kid Mode (Immediate)
- [ ] Debug Character.js animation retriggering
- [ ] Ensure CSS animations restart properly
- [ ] Test on mobile devices

### Phase 2: Tween Mode Particle System (v4.1)
- [ ] Create TweenVisualizer class
- [ ] Implement particle burst system
- [ ] Add note-to-color mapping
- [ ] Add octave size variations
- [ ] Create geometric ring backgrounds
- [ ] Test performance (max 50 particles at once)

### Phase 3: Studio Mode Waveform (v4.1)
- [ ] Create StudioVisualizer class
- [ ] Implement canvas-based waveform
- [ ] Add frequency spectrum bars
- [ ] Add peak meter
- [ ] Optimize canvas rendering (60fps minimum)

### Phase 4: Effect Visualizers (v4.2 - Deferred)
- [ ] Add reverb trail effect to Studio waveform
- [ ] Add delay echo effect to Studio spectrum
- [ ] Add filter sweep visualizations

### Phase 5: VisualizerManager Integration
- [ ] Create VisualizerManager class
- [ ] Update Game.js to use manager
- [ ] Add mode switching support
- [ ] Test all three modes

---

## Performance Considerations

### Tween Mode
- **Particle limit:** Max 50 particles on screen simultaneously
- **Cleanup:** Remove particles immediately after animation
- **Use GPU:** CSS transforms and opacity only
- **Throttle:** If FPS drops below 30, reduce particle count

### Studio Mode
- **Canvas size:** Match container exactly, don't overdraw
- **Animation frame:** Use requestAnimationFrame, not setInterval
- **Decay rate:** Smooth but not CPU-intensive (exponential decay)
- **Mobile:** Reduce bar count to 16 on smaller screens

---

## Visual Examples

### Tween Mode - Multiple Notes Playing
```
     🎸 TWEEN MODE
┌────────────────────────┐
│   ⚪ ⚪          ⚪    │ ← Particles from all tracks
│  ⚪    ⚪      ⚪   ⚪  │   Different colors per note
│    ⚪⚪  💥  ⚪⚪      │   Different sizes per octave
│  ⚪    ⚪⚪    ⚪   ⚪  │
│   ⚪      ⚪⚪    ⚪    │
│ [───Ring1───]        │ ← Pulsing rings
│  [──Ring2──]         │
│   [─Ring3─]          │
└────────────────────────┘
```

### Studio Mode - Complex Chord
```
    🎛️ STUDIO MODE
┌────────────────────────┐
│ ~~~Wave~Form~~~~~      │ ← Oscilloscope waveform
│         ▁▂▃▄▅▆▇█       │
├────────────────────────┤
│ ▂ ▄ █ █ ▆ ▄ ▂         │ ← Frequency spectrum bars
│ ▁ ▂ ▃ ▃ ▂ ▁           │   (color: blue→red)
│ Bass  Mid  Treble     │
│                     █  │ ← Peak meter (right edge)
│                     █  │
└────────────────────────┘
```

---

## Accessibility Notes

- **Kid Mode:** Large emojis remain accessible, high contrast
- **Tween Mode:** Particle colors meet WCAG AA contrast ratios
- **Studio Mode:** Waveform/bars have sufficient contrast against dark background
- **Motion sensitivity:** Consider adding "Reduce motion" mode that disables particles/animations (use `prefers-reduced-motion` media query)

---

## Testing Checklist

- [ ] Kid mode: Animals dance correctly, no lag
- [ ] Tween mode: Particles don't cause FPS drops
- [ ] Tween mode: Color mapping is visually distinct
- [ ] Tween mode: Octave size differences are noticeable
- [ ] Studio mode: Canvas renders at 60fps
- [ ] Studio mode: Spectrum bars match played notes
- [ ] Studio mode: Peak meter responds to volume
- [ ] Mode switching: Visualizers clean up properly
- [ ] Mobile: All modes work on touch devices
- [ ] Mobile: Performance is acceptable on mid-range phones

---

## File Structure

```
music-box-composer/
├── js/
│   ├── Character.js            (existing - keep for Kid mode)
│   ├── TweenVisualizer.js      (NEW)
│   ├── StudioVisualizer.js     (NEW)
│   ├── VisualizerManager.js    (NEW)
│   └── Game.js                 (modify)
├── styles/
│   ├── stage.css               (modify)
│   ├── visualizer-tween.css    (NEW)
│   └── visualizer-studio.css   (NEW)
└── docs/features/
    └── VISUALIZER_SYSTEM.md    (this file)
```

---

## Future Enhancements (v5.0+)

- **Custom particle shapes** (stars, squares, triangles) in Tween mode
- **User-selectable color themes** per mode
- **3D canvas effects** in Studio mode (WebGL)
- **Photo upload** as visualizer background (Kid mode)
- **Sync with external MIDI hardware** for live visualizations
