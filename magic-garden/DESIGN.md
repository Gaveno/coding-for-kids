# Magic Garden - Design Document

## Concept
Help a wizard grow a garden by creating "spell recipes" (sequences of magical actions). Different combinations of actions grow different plants. Discover all the flower types!

## Target Audience
Pre-literate children (ages 3-7)

---

## Core Mechanics

### Actions (Spell Icons)
| Icon | Action | Description |
|------|--------|-------------|
| 🌱 | Seed | Plant a seed (required first step) |
| 💧 | Water | Water the plant |
| ☀️ | Sunshine | Give sunlight |
| 🎵 | Music | Sing to the plant |
| ✨ | Magic | Sprinkle magic dust |

### Recipe System
Plants grow based on the sequence of actions after planting a seed.
Order matters! 💧→☀️ produces different results than ☀️→💧.

### Example Recipes
```
🌱 → 💧 → ☀️        = 🌷 (Tulip - basic flower)
🌱 → ☀️ → 💧        = 🌻 (Sunflower)
🌱 → 💧 → 💧 → ☀️   = 🌹 (Rose - more water)
🌱 → 💧 → ☀️ → 🎵   = 🌸 (Cherry blossom - with music)
🌱 → 💧 → ☀️ → ✨   = 🌺 (Hibiscus - with magic)
🌱 → 💧 → 💧 → 💧   = 🍀 (Clover - too much water, no sun)
🌱 → ☀️ → ☀️ → ☀️   = 🌵 (Cactus - too much sun, no water)
```

---

## Game Flow

### Level Structure
1. Show a **target flower** to grow
2. Player builds a **spell sequence** by dragging action icons
3. Press **play** to cast the spell
4. Wizard **animates** each action
5. Plant **grows progressively** (stages)
6. **Success** = matches target → celebration!
7. **Miss** = wrong flower or wilted → gentle retry

### Growth Animation Stages
1. Empty pot
2. Seed planted (🌱 buried)
3. Sprouting (small green sprout)
4. Growing (larger plant)
5. Blooming (final flower appears)
6. If failed: Wilted (😢 droopy plant)

---

## Supply System (Key Design Decision)

Instead of unlimited actions, each level gives **exact ingredients** needed:
- Level shows supply counts (e.g., 🌱×1, 💧×2, ☀️×1)
- Player must figure out the correct **ORDER**
- No guessing about quantities - just arrangement
- Similar to Block Builder's supply stacks

### Example Level
```
Target: 🌹 Rose
Supply: 🌱×1, 💧×2, ☀️×1
Solution: 🌱 → 💧 → 💧 → ☀️
```

---

## Level Progression

### Phase 1: Basic Sequencing (Levels 1-7)
- Only 💧 and ☀️ (plus 🌱)
- Learn that order matters
- Learn that repetition matters (💧×2 vs 💧×3)

### Phase 2: Introduce Music (Levels 8-10)
- Add 🎵 action
- 4-action recipes

### Phase 3: Magic (Levels 11-12)
- Add ✨ action
- 5-action grand finale

---

## Visual Design

### Layout (Mobile-First)
```
┌─────────────────────────┐
│ 🏠    🌻 Magic Garden ⭐3 │  Header
├─────────────────────────┤
│                         │
│      🧙 Wizard          │  Wizard Area
│      🪴 Pot             │  (centered)
│                         │
├─────────────────────────┤
│  Target: 🌷             │  Target display
├─────────────────────────┤
│ [📝 sequence area    🗑️]│  Sequence
├─────────────────────────┤
│ [🌱][💧][☀️][🎵][✨]   │  Palette
├─────────────────────────┤
│   [▶️ Cast]  [🔄 Reset] │  Controls
└─────────────────────────┘
```

### Color Palette
- Background: Garden/nature theme (soft greens, earth tones)
- Primary: Forest green (#2D5A27)
- Secondary: Warm brown (#8B4513)
- Accent: Magic purple (#9B59B6)
- Success: Bloom pink (#FF69B4)

---

## Technical Architecture

### Files
```
magic-garden/
├── index.html
├── styles/
│   ├── variables.css
│   ├── main.css
│   ├── controls.css
│   ├── sequence.css
│   ├── garden.css
│   ├── wizard.css
│   ├── plants.css
│   ├── overlays.css
│   ├── animations.css
│   └── responsive.css
├── js/
│   ├── main.js
│   ├── Game.js
│   ├── DragDrop.js
│   ├── Sequence.js
│   ├── Garden.js
│   ├── Wizard.js
│   ├── Plants.js
│   ├── Levels.js
│   └── Audio.js
└── tests/
    ├── index.html
    ├── Plants.test.js
    ├── Garden.test.js
    └── Levels.test.js
```

### Key Classes

**Plants.js** - Recipe system and plant database
- `getPlantForRecipe(actions)` - Returns plant emoji for action sequence
- `PLANTS` - All discoverable plants with recipes
- `isValidRecipe(actions)` - Check if sequence produces a plant

**Garden.js** - Pot and growth state management
- `plantSeed()` - Start growth
- `applyAction(action)` - Apply water/sun/etc
- `getGrowthStage()` - Current visual stage
- `getResult()` - Final plant or failure

**Wizard.js** - Character animations
- `castAction(action)` - Animate wizard casting
- `celebrate()` - Success animation
- `puzzled()` - Failure animation

---

## Audio Design

### Sound Effects
- Seed planting: Soft "plop"
- Watering: Splashing water
- Sunshine: Warm chime
- Music: Musical note
- Magic: Sparkle sound
- Growth: Ascending tones
- Success: Celebration arpeggio
- Failure: Sad "wah wah"

---

## Accessibility

- Large touch targets (48px minimum)
- No text required
- High contrast icons
- Visual feedback for all actions
- Screen reader labels on buttons

---

*Created: December 14, 2025*
