---
applyTo: "**/*.js"
---

# JavaScript Code Style

## ES6+ Features Required

```javascript
// ✅ DO: Arrow functions, destructuring, async/await
const calculateScore = (moves) => moves.reduce((sum, m) => sum + m.points, 0);

async executeSequence(commands) {
    for (const cmd of commands) {
        await this.executeCommand(cmd);
        await this.delay(300);
    }
}

// ❌ DON'T: var, nested callbacks, function keyword for simple functions
```

## Smooth Movement & Animations (Required)

All movements between grid cells or positions MUST be animated smoothly. Never snap instantly.

```javascript
// ✅ DO: Wait for animation to complete before next action
async executeSequence(commands) {
    for (const cmd of commands) {
        await this.executeCommand(cmd);
        await this.delay(300); // Match CSS transition duration
    }
}

// ✅ DO: Use CSS transitions, triggered by class/style changes
renderPosition() {
    // CSS handles the smooth animation via transition property
    this.element.style.transform = `translate(${x}px, ${y}px)`;
}

// ✅ DO: Coordinate timing with CSS
const MOVE_DURATION = 300; // Match --move-duration in CSS
await this.delay(MOVE_DURATION);

// ❌ DON'T: Move without waiting for animation
for (const cmd of commands) {
    this.move(cmd); // Instant, no delay = no visible animation
}
```

## Naming Conventions

- Use descriptive, self-documenting names
- `isRobotOutOfBounds`, not `check` or `calc`
- No single-letter variables except loop indices (`i`, `j`)

## Class Design

Single responsibility per class:
```javascript
// ✅ Good: focused class
class Robot {
    constructor(startPosition) { ... }
    move(direction) { ... }
    isOutOfBounds(gridSize) { ... }
    reset() { ... }
}

// ❌ Bad: God class doing everything
class Game { /* 1000 lines */ }
```

## File Limits

- **Maximum 200 lines** per JS file (excluding comments)
- If larger, split into modules

## Touch/Mobile Events (Critical)

```javascript
// ✅ DO: Support touch and mouse via pointer events
element.addEventListener('pointerdown', handleInteraction);
element.addEventListener('pointerup', handleInteraction);
element.addEventListener('pointermove', handleInteraction);

// ✅ DO: Prevent unwanted touch behaviors
element.addEventListener('touchstart', (e) => {
    e.preventDefault();
}, { passive: false });

// ❌ DON'T: Mouse-only events
element.addEventListener('mousedown', handleClick); // Misses touch!
```

## No External Dependencies

- No npm packages, CDN imports, or frameworks
- Vanilla JavaScript only
