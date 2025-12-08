/**
 * Tests for Levels module
 */
import { getLevel, getTotalLevels, validateLevel, LEVELS } from '../js/Levels.js';

export function runLevelsTests() {
    const results = [];

    // Test: getLevel returns correct level
    results.push(test('getLevel returns correct level data', () => {
        const level1 = getLevel(1);
        assertEqual(level1.gridSize, 5);
        assertTrue(level1.start.x >= 0);
        assertTrue(level1.start.y >= 0);
        assertTrue(Array.isArray(level1.targets));
    }));

    // Test: getLevel clamps to valid range
    results.push(test('getLevel clamps level number to valid range', () => {
        const levelHigh = getLevel(999);
        const lastLevel = getLevel(getTotalLevels());
        assertEqual(levelHigh.gridSize, lastLevel.gridSize);
    }));

    // Test: getLevel handles zero and negative
    results.push(test('getLevel handles zero and negative numbers', () => {
        const level0 = getLevel(0);
        const levelNeg = getLevel(-5);
        const level1 = getLevel(1);
        
        assertEqual(level0.gridSize, level1.gridSize);
        assertEqual(levelNeg.gridSize, level1.gridSize);
    }));

    // Test: getTotalLevels returns positive number
    results.push(test('getTotalLevels returns positive number', () => {
        const total = getTotalLevels();
        assertTrue(total > 0);
        assertEqual(total, LEVELS.length);
    }));

    // Test: All levels have valid start positions
    results.push(test('All levels have valid start positions', () => {
        for (let i = 1; i <= getTotalLevels(); i++) {
            const level = getLevel(i);
            assertTrue(level.start.x >= 0, `Level ${i} start.x is negative`);
            assertTrue(level.start.x < level.gridSize, `Level ${i} start.x out of bounds`);
            assertTrue(level.start.y >= 0, `Level ${i} start.y is negative`);
            assertTrue(level.start.y < level.gridSize, `Level ${i} start.y out of bounds`);
        }
    }));

    // Test: All levels have targets within bounds
    results.push(test('All levels have targets within bounds', () => {
        for (let i = 1; i <= getTotalLevels(); i++) {
            const level = getLevel(i);
            level.targets.forEach((target, j) => {
                const [x, y] = target.split(',').map(Number);
                assertTrue(x >= 0, `Level ${i} target ${j} x is negative`);
                assertTrue(x < level.gridSize, `Level ${i} target ${j} x out of bounds`);
                assertTrue(y >= 0, `Level ${i} target ${j} y is negative`);
                assertTrue(y < level.gridSize, `Level ${i} target ${j} y out of bounds`);
            });
        }
    }));

    // Test: validateLevel detects valid level
    results.push(test('validateLevel approves valid level', () => {
        const validLevel = {
            gridSize: 5,
            start: { x: 2, y: 2 },
            targets: ['1,1', '3,3']
        };
        const result = validateLevel(validLevel);
        assertTrue(result.valid);
        assertEqual(result.errors.length, 0);
    }));

    // Test: validateLevel detects out of bounds start
    results.push(test('validateLevel detects out of bounds start', () => {
        const invalidLevel = {
            gridSize: 5,
            start: { x: 5, y: 2 },
            targets: ['1,1']
        };
        const result = validateLevel(invalidLevel);
        assertFalse(result.valid);
        assertTrue(result.errors.length > 0);
    }));

    // Test: validateLevel detects out of bounds targets
    results.push(test('validateLevel detects out of bounds targets', () => {
        const invalidLevel = {
            gridSize: 5,
            start: { x: 2, y: 2 },
            targets: ['1,1', '5,5', '6,6']
        };
        const result = validateLevel(invalidLevel);
        assertFalse(result.valid);
        assertTrue(result.errors.length >= 2);
    }));

    // Test: Levels increase in complexity
    results.push(test('Levels generally increase in target count', () => {
        const level1 = getLevel(1);
        const lastLevel = getLevel(getTotalLevels());
        assertTrue(lastLevel.targets.length >= level1.targets.length);
    }));

    // Test: getLevel returns a copy, not reference
    results.push(test('getLevel returns a copy of level data', () => {
        const level1a = getLevel(1);
        const level1b = getLevel(1);
        level1a.gridSize = 999;
        assertEqual(level1b.gridSize, 5);
    }));

    return results;
}

// ===== Test Utilities =====

function test(name, fn) {
    try {
        fn();
        return { name, passed: true };
    } catch (error) {
        return { name, passed: false, error: error.message };
    }
}

function assertEqual(actual, expected) {
    if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
    }
}

function assertTrue(value, message = '') {
    if (value !== true) {
        throw new Error(message || `Expected true, got ${value}`);
    }
}

function assertFalse(value) {
    if (value !== false) {
        throw new Error(`Expected false, got ${value}`);
    }
}
