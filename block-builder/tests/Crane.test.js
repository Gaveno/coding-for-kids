/**
 * Tests for Crane class
 */
import { Crane } from '../js/Crane.js';

export function runCraneTests() {
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

    // Constructor tests
    test('Crane initializes at start column', () => {
        const crane = new Crane(7, 3, 0);
        assertEqual(crane.column, 0);
        assertEqual(crane.totalColumns, 7);
        assertEqual(crane.supplyColumns, 3);
    });

    test('Crane hook starts raised', () => {
        const crane = new Crane(7, 3, 0);
        assertEqual(crane.hookState, Crane.HOOK_RAISED);
        assertTrue(crane.isHookRaised());
    });

    // Movement tests
    test('Crane moves left correctly', () => {
        const crane = new Crane(7, 3, 2);
        assertTrue(crane.moveLeft());
        assertEqual(crane.column, 1);
    });

    test('Crane moves right correctly', () => {
        const crane = new Crane(7, 3, 2);
        assertTrue(crane.moveRight());
        assertEqual(crane.column, 3);
    });

    test('Crane cannot move past left edge', () => {
        const crane = new Crane(7, 3, 0);
        assertFalse(crane.moveLeft());
        assertEqual(crane.column, 0);
    });

    test('Crane cannot move past right edge', () => {
        const crane = new Crane(7, 3, 6);
        assertFalse(crane.moveRight());
        assertEqual(crane.column, 6);
    });

    test('Crane cannot move with hook lowered', () => {
        const crane = new Crane(7, 3, 2);
        crane.startLower();
        crane.completeLower(3);
        assertFalse(crane.moveLeft());
        assertFalse(crane.moveRight());
        assertEqual(crane.column, 2);
    });

    // Hook state tests
    test('Crane can start lowering hook', () => {
        const crane = new Crane(7, 3, 0);
        assertTrue(crane.startLower());
        assertEqual(crane.hookState, Crane.HOOK_LOWERING);
    });

    test('Crane cannot lower when already lowering', () => {
        const crane = new Crane(7, 3, 0);
        crane.startLower();
        assertFalse(crane.startLower());
    });

    test('Crane completes lowering', () => {
        const crane = new Crane(7, 3, 0);
        crane.startLower();
        crane.completeLower(3);
        assertEqual(crane.hookState, Crane.HOOK_LOWERED);
        assertEqual(crane.hookDepth, 3);
    });

    test('Crane can raise after lowered', () => {
        const crane = new Crane(7, 3, 0);
        crane.startLower();
        crane.completeLower(3);
        assertTrue(crane.startRaise());
        assertEqual(crane.hookState, Crane.HOOK_RAISING);
    });

    test('Crane completes raising', () => {
        const crane = new Crane(7, 3, 0);
        crane.startLower();
        crane.completeLower(3);
        crane.startRaise();
        crane.completeRaise();
        assertTrue(crane.isHookRaised());
        assertEqual(crane.hookDepth, 0);
    });

    // Block handling tests
    test('Crane is not holding block initially', () => {
        const crane = new Crane(7, 3, 0);
        assertFalse(crane.isHolding());
        assertEqual(crane.heldBlock, null);
    });

    test('Crane can grab a block', () => {
        const crane = new Crane(7, 3, 0);
        assertTrue(crane.grabBlock('🧱'));
        assertTrue(crane.isHolding());
        assertEqual(crane.heldBlock, '🧱');
    });

    test('Crane cannot grab when already holding', () => {
        const crane = new Crane(7, 3, 0);
        crane.grabBlock('🧱');
        assertFalse(crane.grabBlock('🪟'));
        assertEqual(crane.heldBlock, '🧱');
    });

    test('Crane can release block', () => {
        const crane = new Crane(7, 3, 0);
        crane.grabBlock('🧱');
        const released = crane.releaseBlock();
        assertEqual(released, '🧱');
        assertFalse(crane.isHolding());
    });

    // Position type tests
    test('Crane detects supply area position', () => {
        const crane = new Crane(7, 3, 1);
        assertTrue(crane.isOverSupply());
        assertFalse(crane.isOverBuildArea());
        assertEqual(crane.getSupplyColumn(), 1);
        assertEqual(crane.getBuildColumn(), -1);
    });

    test('Crane detects build area position', () => {
        const crane = new Crane(7, 3, 4);
        assertFalse(crane.isOverSupply());
        assertTrue(crane.isOverBuildArea());
        assertEqual(crane.getSupplyColumn(), -1);
        assertEqual(crane.getBuildColumn(), 1);
    });

    // Reset tests
    test('Crane resets to initial state', () => {
        const crane = new Crane(7, 3, 1);
        crane.moveRight();
        crane.moveRight();
        crane.startLower();
        crane.completeLower(2);
        crane.grabBlock('🧱');
        crane.reset();
        
        assertEqual(crane.column, 1);
        assertTrue(crane.isHookRaised());
        assertFalse(crane.isHolding());
        assertEqual(crane.hookDepth, 0);
    });

    // State inspection test
    test('getState returns current state', () => {
        const crane = new Crane(7, 3, 0);
        crane.grabBlock('🪟');
        const state = crane.getState();
        
        assertEqual(state.column, 0);
        assertEqual(state.heldBlock, '🪟');
        assertTrue(state.isOverSupply);
        assertFalse(state.isOverBuildArea);
    });

    return results;
}
