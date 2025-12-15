/**
 * Tests for Levels module
 */
import { LEVELS, getLevel, getTotalLevels, validateLevel, getAvailableActions } from '../js/Levels.js';
import { ACTIONS, PLANTS } from '../js/Plants.js';

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

    // Basic structure tests
    test('Has at least 10 levels', () => {
        assertTrue(LEVELS.length >= 10, `Only ${LEVELS.length} levels`);
    });

    test('getLevel returns valid level object', () => {
        const level = getLevel(1);
        assertTrue(level.id !== undefined, 'Missing id');
        assertTrue(level.target !== undefined, 'Missing target');
        assertTrue(level.supply !== undefined, 'Missing supply');
    });

    test('getLevel clamps to valid range', () => {
        const levelHigh = getLevel(999);
        const levelLow = getLevel(-5);
        assertTrue(levelHigh !== undefined);
        assertTrue(levelLow !== undefined);
        assertEqual(levelLow.id, 1, 'Low clamp should return level 1');
    });

    test('getTotalLevels returns correct count', () => {
        assertEqual(getTotalLevels(), LEVELS.length);
    });

    // Level validation tests
    test('All levels have sequential IDs', () => {
        LEVELS.forEach((level, i) => {
            assertEqual(level.id, i + 1, `Level ${i + 1} has wrong ID`);
        });
    });

    test('All levels have valid target plant', () => {
        LEVELS.forEach((level, i) => {
            const targetPlant = PLANTS.find(p => p.emoji === level.target);
            assertTrue(targetPlant !== undefined, `Level ${i + 1} has invalid target ${level.target}`);
        });
    });

    test('All levels include seed in supply', () => {
        LEVELS.forEach((level, i) => {
            assertTrue(
                level.supply[ACTIONS.SEED] >= 1,
                `Level ${i + 1} missing seed in supply`
            );
        });
    });

    test('All levels are solvable with supply', () => {
        LEVELS.forEach((level, i) => {
            const targetPlant = PLANTS.find(p => p.emoji === level.target);
            if (targetPlant) {
                const supplyCopy = { ...level.supply };
                
                // Use seed
                assertTrue(supplyCopy[ACTIONS.SEED] >= 1, `Level ${i + 1} needs seed`);
                supplyCopy[ACTIONS.SEED]--;
                
                // Check each recipe action
                for (const action of targetPlant.recipe) {
                    assertTrue(
                        supplyCopy[action] >= 1,
                        `Level ${i + 1} missing ${action} for recipe`
                    );
                    supplyCopy[action]--;
                }
            }
        });
    });

    test('Supply gives exact ingredients needed (no extras)', () => {
        LEVELS.forEach((level, i) => {
            const targetPlant = PLANTS.find(p => p.emoji === level.target);
            if (targetPlant) {
                // Count total supply
                const totalSupply = Object.values(level.supply).reduce((a, b) => a + b, 0);
                // Recipe length + 1 for seed
                const recipeLength = targetPlant.recipe.length + 1;
                assertEqual(
                    totalSupply,
                    recipeLength,
                    `Level ${i + 1} supply should equal recipe length`
                );
            }
        });
    });

    // Progression tests
    test('Level 1 is clover (easiest - all same action)', () => {
        const level = getLevel(1);
        assertEqual(level.target, '🍀', 'Level 1 should be clover');
    });

    test('Music action introduced at level 8', () => {
        for (let i = 1; i <= 7; i++) {
            const level = getLevel(i);
            assertTrue(
                !level.supply[ACTIONS.MUSIC],
                `Level ${i} should not have music`
            );
        }
        const level8 = getLevel(8);
        assertTrue(level8.supply[ACTIONS.MUSIC] >= 1, 'Level 8 should have music');
    });

    test('validateLevel returns true for valid levels', () => {
        LEVELS.forEach((level, i) => {
            assertTrue(validateLevel(level), `Level ${i + 1} failed validation`);
        });
    });

    test('validateLevel returns false for invalid level', () => {
        const invalidLevel = {
            id: 99,
            target: '🧪', // Invalid plant
            supply: { [ACTIONS.SEED]: 1 }
        };
        assertTrue(!validateLevel(invalidLevel));
    });

    test('getAvailableActions returns actions with supply > 0', () => {
        const supply = {
            [ACTIONS.SEED]: 1,
            [ACTIONS.WATER]: 2,
            [ACTIONS.SUN]: 0
        };
        const available = getAvailableActions(supply);
        assertTrue(available.includes(ACTIONS.SEED));
        assertTrue(available.includes(ACTIONS.WATER));
        assertTrue(!available.includes(ACTIONS.SUN));
    });

    return results;
}    });

    test('validateLevel returns false for invalid level', () => {
        const invalidLevel = {
            id: 99,
            target: '🧪', // Invalid plant
            availableActions: [ACTIONS.SEED]
        };
        assertTrue(!validateLevel(invalidLevel));
    });

    return results;
}
