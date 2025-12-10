/**
 * Tests for Levels module
 */
import { LEVELS, getLevel, getTotalLevels, validateLevel, parseTargets } from '../js/Levels.js';

export function runLevelsTests() {
    const results = [];

    function test(name, fn) {
        try {
            fn();
            results.push({ name, passed: true });
        } catch (error) {
            results.push({ name, passed: false, error: error.message });
        }
    }

    function assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} Expected ${expected}, got ${actual}`);
        }
    }

    function assertTrue(value, message = '') {
        if (value !== true) {
            throw new Error(`${message} Expected true, got ${value}`);
        }
    }

    function assertFalse(value, message = '') {
        if (value !== false) {
            throw new Error(`${message} Expected false, got ${value}`);
        }
    }

    // Basic tests
    test('Has at least 5 levels', () => {
        assertTrue(LEVELS.length >= 5);
    });

    test('getLevel returns valid level object', () => {
        const level = getLevel(1);
        assertTrue(level.supply !== undefined, 'Missing supply');
        assertTrue(level.buildArea !== undefined, 'Missing buildArea');
        assertTrue(level.target !== undefined, 'Missing target');
        assertTrue(Array.isArray(level.target), 'target should be array');
    });

    test('getLevel clamps to valid range', () => {
        const levelHigh = getLevel(999);
        const levelLow = getLevel(-5);
        assertTrue(levelHigh !== undefined);
        assertTrue(levelLow !== undefined);
    });

    test('getTotalLevels returns correct count', () => {
        assertEqual(getTotalLevels(), LEVELS.length);
    });

    // Supply validation tests
    test('All levels have 3 supply columns', () => {
        LEVELS.forEach((level, i) => {
            assertEqual(
                level.supply.columns.length, 
                3, 
                `Level ${i + 1} should have 3 supply columns`
            );
        });
    });

    test('All levels have valid build area dimensions', () => {
        LEVELS.forEach((level, i) => {
            assertTrue(level.buildArea.width >= 3, `Level ${i + 1} buildArea.width too small`);
            assertTrue(level.buildArea.height >= 3, `Level ${i + 1} buildArea.height too small`);
            assertTrue(level.buildArea.width <= 8, `Level ${i + 1} buildArea.width too large`);
            assertTrue(level.buildArea.height <= 6, `Level ${i + 1} buildArea.height too large`);
        });
    });

    // Target validation tests
    test('All levels have targets within bounds', () => {
        LEVELS.forEach((level, i) => {
            level.target.forEach(([x, y, type]) => {
                assertTrue(x >= 0, `Level ${i + 1} target x out of bounds`);
                assertTrue(x < level.buildArea.width, `Level ${i + 1} target x out of bounds`);
                assertTrue(y >= 0, `Level ${i + 1} target y out of bounds`);
                assertTrue(y < level.buildArea.height, `Level ${i + 1} target y out of bounds`);
                assertTrue(type !== undefined, `Level ${i + 1} target missing block type`);
            });
        });
    });

    test('All levels have at least one target', () => {
        LEVELS.forEach((level, i) => {
            assertTrue(level.target.length >= 1, `Level ${i + 1} has no targets`);
        });
    });

    // Supply/target balance tests
    test('All levels have enough supply blocks for targets', () => {
        LEVELS.forEach((level, i) => {
            const totalSupply = level.supply.columns.reduce((sum, col) => sum + col.length, 0);
            const targetsNeeded = level.target.length;
            assertTrue(
                totalSupply >= targetsNeeded,
                `Level ${i + 1} needs ${targetsNeeded} blocks but supply only has ${totalSupply}`
            );
        });
    });

    // parseTargets utility test
    test('parseTargets converts array format to objects', () => {
        const targets = [[0, 3, '🧱'], [1, 2, '🪟']];
        const parsed = parseTargets(targets);
        
        assertEqual(parsed.length, 2);
        assertEqual(parsed[0].x, 0);
        assertEqual(parsed[0].y, 3);
        assertEqual(parsed[0].type, '🧱');
        assertEqual(parsed[1].x, 1);
        assertEqual(parsed[1].y, 2);
        assertEqual(parsed[1].type, '🪟');
    });

    // Validation function tests
    test('validateLevel detects invalid target positions', () => {
        const invalidLevel = {
            supply: { columns: [['🧱'], [], []] },
            buildArea: { width: 4, height: 4 },
            target: [[10, 0, '🧱']]
        };
        const result = validateLevel(invalidLevel);
        assertFalse(result.valid);
        assertTrue(result.errors.length > 0);
    });

    test('validateLevel passes valid levels', () => {
        const validLevel = {
            supply: { columns: [['🧱', '🧱'], [], []] },
            buildArea: { width: 4, height: 4 },
            target: [[0, 3, '🧱'], [0, 2, '🧱']]
        };
        const result = validateLevel(validLevel);
        assertTrue(result.valid, result.errors.join(', '));
    });

    test('validateLevel detects insufficient supply', () => {
        const invalidLevel = {
            supply: { columns: [['🧱'], [], []] },
            buildArea: { width: 4, height: 4 },
            target: [[0, 3, '🧱'], [0, 2, '🧱'], [1, 3, '🧱']]
        };
        const result = validateLevel(invalidLevel);
        assertFalse(result.valid);
    });

    // Difficulty progression test
    test('Levels generally increase in difficulty', () => {
        const firstLevelTargets = LEVELS[0].target.length;
        const lastLevelTargets = LEVELS[LEVELS.length - 1].target.length;
        assertTrue(lastLevelTargets >= firstLevelTargets);
    });

    return results;
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
