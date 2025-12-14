/**
 * Tests for Plants module
 */
import { PLANTS, ACTIONS, getPlantForRecipe, isValidRecipe, getAllPlants, getPlantByEmoji, getTotalPlants, WILTED } from '../js/Plants.js';

export function runPlantsTests() {
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

    function assertNotNull(value, message = '') {
        if (value === null || value === undefined) {
            throw new Error(`${message} Expected non-null value`);
        }
    }

    // Basic structure tests
    test('PLANTS array has at least 10 plants', () => {
        assertTrue(PLANTS.length >= 10, `Only ${PLANTS.length} plants defined`);
    });

    test('All plants have required properties', () => {
        PLANTS.forEach((plant, i) => {
            assertNotNull(plant.emoji, `Plant ${i} missing emoji`);
            assertNotNull(plant.name, `Plant ${i} missing name`);
            assertNotNull(plant.recipe, `Plant ${i} missing recipe`);
            assertTrue(Array.isArray(plant.recipe), `Plant ${i} recipe not array`);
        });
    });

    test('All plant names are unique', () => {
        const names = PLANTS.map(p => p.name);
        const uniqueNames = new Set(names);
        assertEqual(uniqueNames.size, names.length, 'Duplicate plant names');
    });

    test('All plant emojis are unique', () => {
        const emojis = PLANTS.map(p => p.emoji);
        const uniqueEmojis = new Set(emojis);
        assertEqual(uniqueEmojis.size, emojis.length, 'Duplicate plant emojis');
    });

    // Recipe tests
    test('Tulip recipe: seed + water + sun', () => {
        const plant = getPlantForRecipe([ACTIONS.SEED, ACTIONS.WATER, ACTIONS.SUN]);
        assertEqual(plant.emoji, '🌷', 'Wrong plant for tulip recipe');
    });

    test('Sunflower recipe: seed + sun + water', () => {
        const plant = getPlantForRecipe([ACTIONS.SEED, ACTIONS.SUN, ACTIONS.WATER]);
        assertEqual(plant.emoji, '🌻', 'Wrong plant for sunflower recipe');
    });

    test('Rose recipe: seed + water + water + sun', () => {
        const plant = getPlantForRecipe([ACTIONS.SEED, ACTIONS.WATER, ACTIONS.WATER, ACTIONS.SUN]);
        assertEqual(plant.emoji, '🌹', 'Wrong plant for rose recipe');
    });

    test('Order matters: water+sun vs sun+water', () => {
        const tulip = getPlantForRecipe([ACTIONS.SEED, ACTIONS.WATER, ACTIONS.SUN]);
        const sunflower = getPlantForRecipe([ACTIONS.SEED, ACTIONS.SUN, ACTIONS.WATER]);
        assertTrue(tulip.emoji !== sunflower.emoji, 'Order should produce different plants');
    });

    test('Invalid recipe returns wilted plant', () => {
        const plant = getPlantForRecipe([ACTIONS.SEED, ACTIONS.MAGIC, ACTIONS.MAGIC]);
        assertEqual(plant, WILTED, 'Invalid recipe should return wilted');
    });

    test('Recipe without seed returns null', () => {
        const plant = getPlantForRecipe([ACTIONS.WATER, ACTIONS.SUN]);
        assertEqual(plant, null, 'Recipe without seed should return null');
    });

    test('Empty recipe returns null', () => {
        const plant = getPlantForRecipe([]);
        assertEqual(plant, null, 'Empty recipe should return null');
    });

    test('Only seed returns null', () => {
        const plant = getPlantForRecipe([ACTIONS.SEED]);
        assertEqual(plant, null, 'Only seed should return null');
    });

    // Validation tests
    test('isValidRecipe returns true for valid recipes', () => {
        assertTrue(isValidRecipe([ACTIONS.SEED, ACTIONS.WATER, ACTIONS.SUN]));
    });

    test('isValidRecipe returns false for invalid recipes', () => {
        assertTrue(!isValidRecipe([ACTIONS.SEED, ACTIONS.MAGIC, ACTIONS.MAGIC]));
    });

    // Helper function tests
    test('getAllPlants returns copy of plants array', () => {
        const plants = getAllPlants();
        assertEqual(plants.length, PLANTS.length);
        plants.push({ emoji: '🧪', name: 'test', recipe: [] });
        assertEqual(PLANTS.length, plants.length - 1, 'Should not modify original');
    });

    test('getPlantByEmoji finds correct plant', () => {
        const plant = getPlantByEmoji('🌷');
        assertEqual(plant.name, 'tulip');
    });

    test('getPlantByEmoji returns null for unknown emoji', () => {
        const plant = getPlantByEmoji('🧪');
        assertEqual(plant, null);
    });

    test('getTotalPlants returns correct count', () => {
        assertEqual(getTotalPlants(), PLANTS.length);
    });

    return results;
}
