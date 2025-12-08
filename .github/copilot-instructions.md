# Copilot Instructions for Coding 4 Kids

## Project Overview

This is an educational game suite designed to teach programming concepts to children who cannot yet read. All games are visual, browser-based, and use no external dependencies.

---

## Core Principles

### 1. Accessibility First
- **No text reliance** - Use emojis, icons, and visual cues instead of words
- **Large touch targets** - Minimum 44x44px for interactive elements
- **High contrast colors** - Ensure visibility for all users
- **Support both mouse and touch** - Mobile-friendly interactions

### 2. Child-Friendly Design
- **Immediate feedback** - Every action should have a visual/audio response
- **Safe to fail** - Mistakes are learning opportunities, never punishing
- **Celebratory success** - Use animations and sounds for achievements
- **Progressive difficulty** - Start simple, add complexity gradually

---

## Code Style & Best Practices

### JavaScript

```javascript
// ✅ DO: Use ES6+ features
const calculateScore = (moves) => moves.reduce((sum, m) => sum + m.points, 0);

// ✅ DO: Use descriptive names (self-documenting code)
const isRobotOutOfBounds = (position, gridSize) => { ... };

// ❌ DON'T: Use abbreviations or single letters (except loop indices)
const calc = (m) => m.reduce((s, x) => s + x.p, 0);

// ✅ DO: Use async/await for asynchronous operations
async executeSequence(commands) {
    for (const cmd of commands) {
        await this.executeCommand(cmd);
        await this.delay(300);
    }
}

// ❌ DON'T: Use nested callbacks
executeSequence(commands, function() {
    executeCommand(cmd, function() { ... });
});
```

### File Organization

Keep files small and focused. Each file should have a single responsibility:

```
game-name/
├── index.html          # Entry point, minimal logic
├── styles/
│   ├── main.css        # Global styles, variables
│   ├── grid.css        # Grid-specific styles
│   ├── controls.css    # Button and control styles
│   └── animations.css  # All @keyframes and transitions
├── js/
│   ├── main.js         # Entry point, initialization
│   ├── Game.js         # Main game class/controller
│   ├── Grid.js         # Grid rendering and logic
│   ├── Robot.js        # Robot state and movement
│   ├── Sequence.js     # Command sequence management
│   ├── Levels.js       # Level definitions and loading
│   ├── Audio.js        # Sound effects helper
│   └── utils.js        # Shared utility functions
└── assets/
    ├── images/
    └── sounds/
```

### Class Structure

```javascript
// ✅ DO: Single responsibility classes
class Robot {
    constructor(startPosition) { ... }
    move(direction) { ... }
    isOutOfBounds(gridSize) { ... }
    reset() { ... }
}

// ❌ DON'T: God classes that do everything
class Game {
    // 1000 lines handling grid, robot, UI, audio, levels...
}
```

### Maximum File Length

- **JavaScript files**: Maximum 200 lines (excluding comments)
- **CSS files**: Maximum 300 lines
- **If a file exceeds these limits**, refactor into smaller modules

---

## Test-Driven Development (TDD)

### Testing Strategy

Follow the Red-Green-Refactor cycle:

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to pass the test
3. **Refactor**: Improve code while keeping tests green

### Test File Structure

```
game-name/
├── js/
│   ├── Robot.js
│   └── Grid.js
└── tests/
    ├── Robot.test.js
    ├── Grid.test.js
    └── integration/
        └── GameFlow.test.js
```

### What to Test

```javascript
// ✅ DO: Test pure logic functions
describe('Robot', () => {
    test('moves up correctly', () => {
        const robot = new Robot({ x: 2, y: 2 });
        robot.move('up');
        expect(robot.position).toEqual({ x: 2, y: 1 });
    });

    test('detects out of bounds', () => {
        const robot = new Robot({ x: 0, y: 0 });
        robot.move('up');
        expect(robot.isOutOfBounds(5)).toBe(true);
    });
});

// ✅ DO: Test level configurations
describe('Levels', () => {
    test('level 1 has valid start position', () => {
        const level = getLevel(1);
        expect(level.start.x).toBeGreaterThanOrEqual(0);
        expect(level.start.x).toBeLessThan(level.gridSize);
    });

    test('all target cells are within grid bounds', () => {
        const level = getLevel(1);
        level.targets.forEach(target => {
            const [x, y] = target.split(',').map(Number);
            expect(x).toBeLessThan(level.gridSize);
            expect(y).toBeLessThan(level.gridSize);
        });
    });
});

// ✅ DO: Test win/lose conditions
describe('Game Logic', () => {
    test('wins when all targets are painted', () => {
        const game = new Game(level1);
        game.paintCells(['0,0', '1,0', '2,0']); // All targets
        expect(game.checkWin()).toBe(true);
    });

    test('does not win with partial completion', () => {
        const game = new Game(level1);
        game.paintCells(['0,0']); // Only one target
        expect(game.checkWin()).toBe(false);
    });
});
```

### Testing Tools

Use vanilla JavaScript testing or lightweight frameworks:

```javascript
// Simple test runner for browser-based games
class TestRunner {
    static assert(condition, message) {
        if (!condition) throw new Error(`❌ ${message}`);
        console.log(`✅ ${message}`);
    }
    
    static assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`❌ ${message}: expected ${expected}, got ${actual}`);
        }
        console.log(`✅ ${message}`);
    }
}
```

Or use Jest for more comprehensive testing:

```bash
npm install --save-dev jest
```

---

## CSS Best Practices

### Use CSS Custom Properties

```css
/* ✅ DO: Define variables in :root */
:root {
    --color-primary: #6C63FF;
    --color-success: #4ECDC4;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --radius-md: 16px;
    --transition-fast: 0.2s ease;
}

/* ✅ DO: Use variables throughout */
.button {
    background: var(--color-primary);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    transition: transform var(--transition-fast);
}
```

### Responsive Design

```css
/* ✅ DO: Mobile-first approach */
.grid {
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
}

@media (min-width: 768px) {
    .grid {
        gap: 8px;
    }
}

/* ✅ DO: Use relative units */
.button {
    font-size: 1.5rem;
    padding: 1em 1.5em;
}
```

### Animation Performance

```css
/* ✅ DO: Animate transform and opacity (GPU accelerated) */
.robot {
    transition: transform 0.3s ease;
}
.robot.moving {
    transform: translateX(100%);
}

/* ❌ DON'T: Animate layout properties */
.robot {
    transition: left 0.3s ease; /* Causes layout recalculation */
}
```

---

## HTML Best Practices

### Semantic Structure

```html
<!-- ✅ DO: Use semantic elements -->
<main class="game-area">
    <section class="grid-section" aria-label="Game Grid">
        ...
    </section>
    <section class="controls" aria-label="Game Controls">
        ...
    </section>
</main>

<!-- ❌ DON'T: Use divs for everything -->
<div class="game-area">
    <div class="grid">...</div>
</div>
```

### Accessibility Attributes

```html
<!-- Even without text, provide screen reader support -->
<button class="move-btn" aria-label="Move Up" data-command="up">
    <span aria-hidden="true">⬆️</span>
</button>
```

---

## Game-Specific Guidelines

### Adding a New Game

1. Create a new folder: `game-name/`
2. Start with tests for core game logic
3. Build minimal game class to pass tests
4. Add UI layer
5. Add polish (animations, sounds)

### Level Design Checklist

- [ ] Start position is within grid bounds
- [ ] All target cells are reachable
- [ ] Difficulty increases gradually from previous level
- [ ] Can be solved in multiple ways (not one exact solution)
- [ ] Tested with actual children if possible

### Performance Guidelines

- Keep animations under 300ms for responsiveness
- Limit simultaneous animations to 3-4 elements
- Use `requestAnimationFrame` for smooth animations
- Debounce rapid user inputs

---

## Git Commit Messages

```
feat: add loop command block to robot painter
fix: robot animation jitters on mobile Safari
test: add unit tests for Grid boundary detection
refactor: extract AudioManager from Game class
docs: update level design guidelines
style: format CSS with consistent spacing
```

---

## Code Review Checklist

Before submitting code, verify:

- [ ] No file exceeds recommended line limits
- [ ] All new logic has corresponding tests
- [ ] Tests pass (`npm test`)
- [ ] No console.log statements (except in debug mode)
- [ ] Works on mobile (touch events)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No hardcoded text (use emojis/icons)
- [ ] CSS variables used for colors/spacing
