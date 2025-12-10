---
applyTo: "**/tests/**"
---

# Testing Guidelines

## Test-Driven Development (TDD)

Follow Red-Green-Refactor:
1. **Red**: Write a failing test first
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve while keeping tests green

## What to Test

### Pure Logic Functions
```javascript
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
```

### Level Configurations
```javascript
describe('Levels', () => {
    test('level 1 has valid start position', () => {
        const level = getLevel(1);
        expect(level.start.x).toBeGreaterThanOrEqual(0);
        expect(level.start.x).toBeLessThan(level.gridSize);
    });

    test('all targets within bounds', () => {
        const level = getLevel(1);
        level.targets.forEach(target => {
            const [x, y] = target.split(',').map(Number);
            expect(x).toBeLessThan(level.gridSize);
        });
    });
});
```

### Win/Lose Conditions
```javascript
describe('Game Logic', () => {
    test('wins when all targets painted', () => {
        const game = new Game(level1);
        game.paintCells(['0,0', '1,0', '2,0']);
        expect(game.checkWin()).toBe(true);
    });
});
```

## Test Tools

Use vanilla JS test runner (no dependencies):
```javascript
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

## Test File Structure

```
game-name/tests/
├── index.html          # Test runner page
├── Robot.test.js
├── Grid.test.js
└── Sequence.test.js
```

## Running Tests

Open `tests/index.html` in browser. No build step needed.
