/**
 * Tests for BuildArea class
 */
import { BuildArea } from '../js/BuildArea.js';

export function runBuildAreaTests() {
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
    test('BuildArea initializes with correct dimensions', () => {
        const area = new BuildArea(5, 4);
        assertEqual(area.width, 5);
        assertEqual(area.height, 4);
    });

    test('BuildArea starts with no blocks', () => {
        const area = new BuildArea(5, 4);
        assertEqual(area.getBlockCount(), 0);
    });

    // Placement tests
    test('Can place block on ground (bottom row)', () => {
        const area = new BuildArea(5, 4);
        const result = area.placeBlock(2, '🧱');
        assertTrue(result.success);
        assertEqual(result.position.x, 2);
        assertEqual(result.position.y, 3);
        assertEqual(result.type, '🧱');
    });

    test('Blocks stack on top of each other', () => {
        const area = new BuildArea(5, 4);
        area.placeBlock(2, '🧱');
        const result = area.placeBlock(2, '🪟');
        assertTrue(result.success);
        assertEqual(result.position.y, 2);
    });

    test('Cannot place block if column is full', () => {
        const area = new BuildArea(5, 2);
        area.placeBlock(2, '🧱');
        area.placeBlock(2, '🧱');
        const result = area.placeBlock(2, '🧱');
        assertFalse(result.success);
    });

    test('Cannot place block outside bounds', () => {
        const area = new BuildArea(5, 4);
        const left = area.placeBlock(-1, '🧱');
        const right = area.placeBlock(5, '🧱');
        assertFalse(left.success);
        assertFalse(right.success);
    });

    // Target tests
    test('Set and check target cells', () => {
        const area = new BuildArea(5, 4);
        area.setTargets([{ x: 2, y: 3, type: '🧱' }, { x: 2, y: 2, type: '🪟' }]);
        assertTrue(area.isTarget(2, 3));
        assertTrue(area.isTarget(2, 2));
        assertFalse(area.isTarget(0, 0));
    });

    test('Get target type at position', () => {
        const area = new BuildArea(5, 4);
        area.setTargets([{ x: 2, y: 3, type: '🧱' }, { x: 2, y: 2, type: '🪟' }]);
        assertEqual(area.getTargetType(2, 3), '🧱');
        assertEqual(area.getTargetType(2, 2), '🪟');
        assertEqual(area.getTargetType(0, 0), null);
    });

    // Block checking tests
    test('Check if block exists at position', () => {
        const area = new BuildArea(5, 4);
        area.placeBlock(2, '🧱');
        assertTrue(area.hasBlock(2, 3));
        assertFalse(area.hasBlock(2, 2));
        assertFalse(area.hasBlock(0, 3));
    });

    test('Get block at position', () => {
        const area = new BuildArea(5, 4);
        area.placeBlock(2, '🧱');
        const block = area.getBlock(2, 3);
        assertEqual(block.type, '🧱');
        assertEqual(area.getBlock(0, 0), null);
    });

    // Target matching tests
    test('Detect target match with correct block type', () => {
        const area = new BuildArea(5, 4);
        area.setTargets([{ x: 2, y: 3, type: '🧱' }]);
        
        assertFalse(area.isTargetMatched(2, 3));
        
        area.placeBlock(2, '🧱');
        assertTrue(area.isTargetMatched(2, 3));
    });

    test('Wrong block type does not match target', () => {
        const area = new BuildArea(5, 4);
        area.setTargets([{ x: 2, y: 3, type: '🪟' }]);
        
        area.placeBlock(2, '🧱');
        assertFalse(area.isTargetMatched(2, 3));
    });

    test('Detect when all targets are matched', () => {
        const area = new BuildArea(5, 4);
        area.setTargets([{ x: 2, y: 3, type: '🧱' }, { x: 2, y: 2, type: '🪟' }]);
        
        assertFalse(area.allTargetsMatched());
        
        area.placeBlock(2, '🧱');
        assertFalse(area.allTargetsMatched());
        
        area.placeBlock(2, '🪟');
        assertTrue(area.allTargetsMatched());
    });

    // Column tests
    test('Get column height correctly', () => {
        const area = new BuildArea(5, 4);
        assertEqual(area.getColumnHeight(2), 0);
        
        area.placeBlock(2, '🧱');
        assertEqual(area.getColumnHeight(2), 1);
        
        area.placeBlock(2, '🧱');
        assertEqual(area.getColumnHeight(2), 2);
    });

    test('Get next Y position for column', () => {
        const area = new BuildArea(5, 4);
        assertEqual(area.getNextY(2), 3); // Bottom row
        
        area.placeBlock(2, '🧱');
        assertEqual(area.getNextY(2), 2);
    });

    // Clear/reset tests
    test('Clear all blocks', () => {
        const area = new BuildArea(5, 4);
        area.placeBlock(0, '🧱');
        area.placeBlock(2, '🧱');
        area.placeBlock(2, '🪟');
        
        area.clear();
        
        assertEqual(area.getBlockCount(), 0);
        assertFalse(area.hasBlock(0, 3));
        assertFalse(area.hasBlock(2, 3));
    });

    // Progress tests
    test('Track progress correctly', () => {
        const area = new BuildArea(5, 4);
        area.setTargets([
            { x: 0, y: 3, type: '🧱' },
            { x: 1, y: 3, type: '🧱' },
            { x: 2, y: 3, type: '🪟' }
        ]);
        
        let progress = area.getProgress();
        assertEqual(progress.filled, 0);
        assertEqual(progress.matched, 0);
        assertEqual(progress.total, 3);
        
        area.placeBlock(0, '🧱');
        area.placeBlock(1, '🧱');
        
        progress = area.getProgress();
        assertEqual(progress.filled, 2);
        assertEqual(progress.matched, 2);
        assertEqual(progress.total, 3);
    });

    return results;
}
