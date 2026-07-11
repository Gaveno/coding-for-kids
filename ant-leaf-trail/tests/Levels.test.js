/**
 * Tests for Levels - includes a solver-style walk of each level's
 * known solution to guarantee every level is completable.
 */
import { LEVELS, getLevel, getTotalLevels, validateLevel } from '../js/Levels.js';
import { Ant } from '../js/Ant.js';
import { Grid } from '../js/Grid.js';

/** Known solutions: F=forward, R=right, L=left, P=pickup, D=drop */
export const SOLUTIONS = [
    'FFF',
    'FFFFF',
    'FFFRFFF',
    'FFRFFFLFF',
    'FFFF',
    'FLFRFFRFLF',
    'FLFFRFFRFLFFRF',
    'FFPFFD',
    'FFFPRFFFFD',
    'FFPRFLFFLFRFD',
    'FFPFFFDRRFPRRFD'
];

export function runLevelsTests() {
    const results = [];

    results.push(test('Has at least 10 levels', () => {
        assertTrue(getTotalLevels() >= 10);
    }));

    LEVELS.forEach((level, i) => {
        results.push(test(`Level ${i + 1} configuration is valid`, () => {
            const { valid, errors } = validateLevel(level);
            if (!valid) throw new Error(errors.join('; '));
        }));
    });

    LEVELS.forEach((level, i) => {
        results.push(test(`Level ${i + 1} is solvable with its known solution`, () => {
            assertTrue(simulate(getLevel(i + 1), SOLUTIONS[i]));
        }));
    });

    results.push(test('Level 1 has no leaves or obstacles', () => {
        const level = getLevel(1);
        assertEqual(level.leaves.length, 0);
        assertEqual(level.obstacles.length, 0);
    }));

    results.push(test('getLevel clamps out-of-range level numbers', () => {
        const last = getLevel(999);
        assertEqual(last.gridSize, LEVELS[LEVELS.length - 1].gridSize);
        const first = getLevel(-5);
        assertEqual(first.gridSize, LEVELS[0].gridSize);
    }));

    return results;
}

/** Headless run of a solution string against a level. True if solved. */
export function simulate(level, solution) {
    const ant = new Ant(level.start, level.heading);
    const grid = new Grid(level.gridSize, level.nest, level.leaves, level.obstacles);

    for (const ch of solution) {
        if (ch === 'F') {
            const next = ant.getForwardPosition();
            if (grid.hasObstacle(`${next.x},${next.y}`)) return false;
            ant.moveForward();
            if (ant.isOutOfBounds(grid.size)) return false;
        } else if (ch === 'R') {
            ant.rotate('right');
        } else if (ch === 'L') {
            ant.rotate('left');
        } else if (ch === 'P') {
            if (ant.carrying || !grid.hasLeaf(ant.getPositionKey())) return false;
            grid.removeLeaf(ant.getPositionKey());
            ant.carrying = true;
        } else if (ch === 'D') {
            if (!ant.carrying) return false;
            ant.carrying = false;
            if (grid.isNest(ant.getPositionKey())) grid.deliverLeaf();
            else grid.addLeaf(ant.getPositionKey());
        }
    }

    return grid.isNest(ant.getPositionKey()) && grid.allLeavesDelivered() && !ant.carrying;
}

function test(name, fn) {
    try {
        fn();
        return { name, passed: true };
    } catch (e) {
        return { name, passed: false, error: e.message };
    }
}

function assertEqual(actual, expected) {
    if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
    }
}

function assertTrue(value) {
    if (!value) {
        throw new Error(`Expected true, got ${value}`);
    }
}
