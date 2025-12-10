# Block Builder - Design Document

## Game Concept

A crane-programming puzzle game where children build structures by commanding a crane to pick up materials from supply stacks and place them in a build area. The crane has a hook that physically lowers, grabs, lifts, and places blocks.

---

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🏠                    Block Builder              ⭐ 1      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    🏗️ (crane trolley)                       │
│  ════════════════════╤══════════════════════════════════   │
│     SUPPLY           │ hook/string        BUILD AREA       │
│   ┌───┬───┬───┐      ↓                 ┌───┬───┬───┬───┐   │
│   │   │ 🪟 │   │     🪝                │   │   │   │   │   │
│   │ 🧱│ 🧱 │ 🚪│                       ├───┼───┼───┼───┤   │
│   │ 🧱│ 🧱 │ 🧱│                       │   │   │   │   │   │
│   │ 🧱│ 🧱 │ 🧱│                       ├───┼───┼───┼───┤   │
│   └───┴───┴───┘                       │ ▓ │ ▓ │ ▓ │ ▓ │   │
│                                       └───┴───┴───┴───┘   │
│                                         (ground/foundation)│
├─────────────────────────────────────────────────────────────┤
│  SEQUENCE:  [⬅️] [🪝⬇️] [➡️] [➡️] [🪝⬆️] ...               │
├─────────────────────────────────────────────────────────────┤
│  COMMANDS:   ⬅️    ➡️    🪝⬇️   🪝⬆️                        │
│             left  right lower raise                        │
├─────────────────────────────────────────────────────────────┤
│              [▶️ RUN]  [🗑️ CLEAR]  [↩️ RESET]              │
└─────────────────────────────────────────────────────────────┘
```

---

## Command Set

| Icon | Command | Action |
|------|---------|--------|
| ⬅️ | Move Left | Crane trolley moves one column left |
| ➡️ | Move Right | Crane trolley moves one column right |
| 🪝 + ⬇️ | Lower Hook | Hook descends; if over supply, grabs top block; if holding block over build area, places it |
| 🪝 + ⬆️ | Raise Hook | Hook ascends back to crane |

### Command Button Design

Hook commands show hook emoji (smaller) above arrow:
```
┌─────┐   ┌─────┐
│  🪝 │   │  🪝 │
│  ⬇️ │   │  ⬆️ │
└─────┘   └─────┘
 lower     raise
```

---

## Game Mechanics

### Crane Behavior

1. **Move Left/Right**: Trolley slides along rail (smooth 300ms animation)
2. **Lower Hook**: 
   - Hook extends downward with string animation
   - If over **supply stack**: hook stops at top block, attaches it
   - If over **build area** with block: hook lowers to lowest valid position, releases block
   - If over **empty area** with no block: hook lowers to bottom, does nothing
3. **Raise Hook**:
   - Hook retracts upward with string animation
   - If block attached, block rises with hook

### Supply Stacks

- 3 columns of materials
- Blocks stack vertically (take from top)
- Different materials in different columns
- Visually show remaining blocks

### Build Area

- 4-6 column grid
- Blocks must stack on ground or other blocks (gravity)
- Ghost overlay shows target pattern

### Win Condition

- Built structure matches target pattern exactly
- Celebrate with confetti 🎉

---

## Animation Specifications

| Animation | Duration | Easing | Description |
|-----------|----------|--------|-------------|
| Crane move | 300ms | ease-out | Horizontal slide |
| Hook lower | 400ms | ease-in | Accelerates down (gravity) |
| Hook raise | 350ms | ease-out | Decelerates at top |
| Block attach | 100ms | - | Quick "click" feedback |
| Block release | 100ms | - | Quick release feedback |

### Hook String Visualization

```
🏗️ (trolley)
 │
 │  ← string (CSS border or repeated │)
 │
 🪝 ← hook (or 🪝🧱 when holding block)
```

---

## File Structure

```
block-builder/
├── index.html              # Updated layout
├── DESIGN.md               # This file
├── styles/
│   ├── variables.css       # CSS custom properties
│   ├── main.css            # Global styles
│   ├── crane.css           # Trolley + hook + string
│   ├── supply.css          # Supply stacks styling
│   ├── build-area.css      # Build grid styling
│   ├── blocks.css          # Block types (brick, door, window, roof)
│   ├── sequence.css        # Command sequence display
│   ├── controls.css        # Command buttons
│   ├── overlays.css        # Win/level overlays
│   ├── animations.css      # Keyframe animations
│   └── responsive.css      # Mobile responsiveness
├── js/
│   ├── main.js             # Entry point
│   ├── Game.js             # Main game controller
│   ├── Crane.js            # Crane position + hook state + held block
│   ├── Supply.js           # Supply stack management
│   ├── BuildArea.js        # Build grid tracking
│   ├── Sequence.js         # Command sequence management
│   ├── Levels.js           # Level definitions
│   ├── Audio.js            # Sound effects
│   └── DragDrop.js         # Touch/mouse drag handling
└── tests/
    ├── index.html          # Test runner
    ├── Crane.test.js       # Crane unit tests
    ├── Supply.test.js      # Supply unit tests
    ├── BuildArea.test.js   # BuildArea unit tests
    └── Levels.test.js      # Level validation tests
```

---

## Level Format

```javascript
{
    id: 1,
    name: "First Stack",
    supply: {
        columns: [
            ['🧱', '🧱', '🧱'],  // Column 0 (left) - bottom to top
            ['🧱', '🧱'],        // Column 1 (middle)
            []                   // Column 2 (right) - empty
        ]
    },
    buildArea: {
        width: 4,
        height: 4
    },
    target: [
        // [x, y, block] - positions where blocks should be placed
        [0, 0, '🧱'],
        [0, 1, '🧱'],
        [1, 0, '🧱']
    ],
    craneStart: 0,  // Starting column (0 = leftmost supply)
    hint: "🧱➡️🏗️"  // Visual hint (optional)
}
```

---

## Progressive Levels

| Level | Supply | Target | Teaches |
|-------|--------|--------|---------|
| 1 | 2🧱 | Stack of 2 | Basic lower/raise cycle |
| 2 | 3🧱 | Stack of 3 | Repetition |
| 3 | 3🧱 | Row of 3 | Horizontal placement |
| 4 | 4🧱 | 2x2 square | Grid thinking |
| 5 | 🧱🧱🧱 + 🪟 | Wall with window | Multiple materials |
| 6 | 🧱🧱🧱🧱 + 🚪 | Wall with door | Door at bottom |
| 7 | Mixed | Small house outline | Combine skills |
| 8 | Mixed | House with window | Window placement |
| 9 | Mixed + 🔺 | House with roof | Roof pieces |
| 10 | Full set | Complete house | Final challenge |

---

## Coordinate System

- **Columns 0-2**: Supply area (3 supply stacks)
- **Columns 3+**: Build area (4-6 columns depending on level)
- **Crane position**: Column index (spans entire width)
- **Y-axis**: 0 = ground level, increases upward

---

## Key Technical Decisions

1. **Hook as separate element**: Visual element with its own position, not just state
2. **String rendering**: CSS pseudo-element that stretches as hook lowers
3. **Block attachment**: Hook holds reference to block type when grabbed
4. **Hook states**: `raised`, `lowering`, `lowered`, `raising`
5. **Smooth animations**: All movements use CSS transitions with proper easing

---

## Block Types

| Emoji | Type | Notes |
|-------|------|-------|
| 🧱 | Brick | Basic building block |
| 🪟 | Window | Must be placed above ground |
| 🚪 | Door | Usually at ground level |
| 🔺 | Roof | Placed at top of structures |

---

## Implementation Phases

### Phase 1: Core Structure
- Update `index.html` with new layout (supply + rail + build area)
- Create `supply.css` for supply stack styling
- Update `crane.css` for trolley + string + hook
- Update command buttons with hook icons

### Phase 2: Game Logic
- Create `Supply.js` - stack management
- Rewrite `Crane.js` - position, hook state, held block
- Update `BuildArea.js` - simplified grid tracking
- Update `Sequence.js` - new command types

### Phase 3: Animations
- Crane horizontal movement (smooth slide)
- Hook lower animation (string extends)
- Hook raise animation (string retracts)
- Block attach/detach feedback

### Phase 4: Game Integration
- Rewrite `Game.js` - new game loop
- Implement command execution with animations
- Win detection
- Level progression

### Phase 5: Levels & Polish
- Create 10 progressive levels
- Add new block types (🪟 🚪 🔺)
- Target pattern ghost overlay
- Sound effects
- Responsive layout testing
