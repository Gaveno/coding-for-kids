/**
 * Tests for Garden module
 */
import { Garden, GROWTH_STAGES } from '../js/Garden.js';
import { ACTIONS, WILTED } from '../js/Plants.js';

export function runGardenTests() {
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

    // Initial state tests
    test('Garden starts empty', () => {
        const garden = new Garden();
        assertEqual(garden.getStage(), GROWTH_STAGES.EMPTY);
        assertEqual(garden.getResult(), null);
        assertFalse(garden.hasGrowth());
    });

    test('Garden tracks applied actions', () => {
        const garden = new Garden();
        garden.applyAction(ACTIONS.SEED);
        garden.applyAction(ACTIONS.WATER);
        
        const actions = garden.getAppliedActions();
        assertEqual(actions.length, 2);
        assertEqual(actions[0], ACTIONS.SEED);
        assertEqual(actions[1], ACTIONS.WATER);
    });

    // Growth stage tests
    test('Planting seed changes stage to seeded', () => {
        const garden = new Garden();
        garden.applyAction(ACTIONS.SEED);
        assertEqual(garden.getStage(), GROWTH_STAGES.SEEDED);
    });

    test('Second action changes stage to sprouting', () => {
        const garden = new Garden();
        garden.applyAction(ACTIONS.SEED);
        garden.applyAction(ACTIONS.WATER);
        assertEqual(garden.getStage(), GROWTH_STAGES.SPROUTING);
    });

    test('Third action changes stage to growing', () => {
        const garden = new Garden();
        garden.applyAction(ACTIONS.SEED);
        garden.applyAction(ACTIONS.WATER);
        garden.applyAction(ACTIONS.SUN);
        assertEqual(garden.getStage(), GROWTH_STAGES.GROWING);
    });

    // Finalize tests
    test('Valid recipe finalizes to blooming', () => {
        const garden = new Garden();
        garden.applyAction(ACTIONS.SEED);
        garden.applyAction(ACTIONS.WATER);
        garden.applyAction(ACTIONS.SUN);
        
        const result = garden.finalize();
        assertEqual(garden.getStage(), GROWTH_STAGES.BLOOMING);
        assertEqual(result.emoji, '🌷');
    });

    test('Invalid recipe finalizes to wilted', () => {
        const garden = new Garden();
        garden.applyAction(ACTIONS.SEED);
        garden.applyAction(ACTIONS.MAGIC);
        garden.applyAction(ACTIONS.MAGIC);
        
        const result = garden.finalize();
        assertEqual(garden.getStage(), GROWTH_STAGES.WILTED);
        assertEqual(result, WILTED);
    });

    test('Empty garden does not finalize', () => {
        const garden = new Garden();
        const result = garden.finalize();
        assertEqual(result, null);
    });

    // Reset tests
    test('Reset returns garden to empty state', () => {
        const garden = new Garden();
        garden.applyAction(ACTIONS.SEED);
        garden.applyAction(ACTIONS.WATER);
        garden.finalize();
        
        garden.reset();
        
        assertEqual(garden.getStage(), GROWTH_STAGES.EMPTY);
        assertEqual(garden.getResult(), null);
        assertEqual(garden.getAppliedActions().length, 0);
    });

    // Match target tests
    test('matchesTarget returns true for correct flower', () => {
        const garden = new Garden();
        garden.applyAction(ACTIONS.SEED);
        garden.applyAction(ACTIONS.WATER);
        garden.applyAction(ACTIONS.SUN);
        garden.finalize();
        
        assertTrue(garden.matchesTarget('🌷'));
    });

    test('matchesTarget returns false for wrong flower', () => {
        const garden = new Garden();
        garden.applyAction(ACTIONS.SEED);
        garden.applyAction(ACTIONS.WATER);
        garden.applyAction(ACTIONS.SUN);
        garden.finalize();
        
        assertFalse(garden.matchesTarget('🌻'));
    });

    test('matchesTarget returns false before finalize', () => {
        const garden = new Garden();
        garden.applyAction(ACTIONS.SEED);
        garden.applyAction(ACTIONS.WATER);
        
        assertFalse(garden.matchesTarget('🌷'));
    });

    // hasGrowth tests
    test('hasGrowth returns true after applying action', () => {
        const garden = new Garden();
        garden.applyAction(ACTIONS.SEED);
        assertTrue(garden.hasGrowth());
    });

    return results;
}
