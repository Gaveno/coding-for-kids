/**
 * Tests for Grid class
 */
import { Grid } from '../js/Grid.js';

export function runGridTests() {
    const results = [];

    // Test: Grid initializes with correct size
    results.push(test('Grid initializes with correct size', () => {
        const grid = new Grid(5, ['1,1', '2,2']);
        assertEqual(grid.size, 5);
    }));

    // Test: Grid tracks target cells
    results.push(test('Grid tracks target cells', () => {
        const grid = new Grid(5, ['1,1', '2,2', '3,3']);
        assertTrue(grid.isTarget('1,1'));
        assertTrue(grid.isTarget('2,2'));
        assertTrue(grid.isTarget('3,3'));
        assertFalse(grid.isTarget('0,0'));
    }));

    // Test: Grid paints cells
    results.push(test('Grid paints cells correctly', () => {
        const grid = new Grid(5, []);
        grid.paintCell('2,3');
        assertTrue(grid.isPainted('2,3'));
        assertFalse(grid.isPainted('0,0'));
    }));

    // Test: Grid detects all targets painted
    results.push(test('Grid detects when all targets are painted', () => {
        const grid = new Grid(5, ['1,1', '2,2']);
        assertFalse(grid.allTargetsPainted());
        
        grid.paintCell('1,1');
        assertFalse(grid.allTargetsPainted());
        
        grid.paintCell('2,2');
        assertTrue(grid.allTargetsPainted());
    }));

    // Test: Grid progress tracking
    results.push(test('Grid tracks progress correctly', () => {
        const grid = new Grid(5, ['1,1', '2,2', '3,3']);
        
        let progress = grid.getProgress();
        assertEqual(progress.painted, 0);
        assertEqual(progress.total, 3);
        
        grid.paintCell('1,1');
        grid.paintCell('2,2');
        
        progress = grid.getProgress();
        assertEqual(progress.painted, 2);
        assertEqual(progress.total, 3);
    }));

    // Test: Grid clears paint
    results.push(test('Grid clears paint correctly', () => {
        const grid = new Grid(5, ['1,1']);
        grid.paintCell('1,1');
        grid.paintCell('2,2');
        
        assertTrue(grid.isPainted('1,1'));
        assertTrue(grid.isPainted('2,2'));
        
        grid.clearPaint();
        
        assertFalse(grid.isPainted('1,1'));
        assertFalse(grid.isPainted('2,2'));
    }));

    // Test: Grid configure updates state
    results.push(test('Grid configure updates state', () => {
        const grid = new Grid(5, ['1,1']);
        grid.paintCell('1,1');
        
        grid.configure(7, ['0,0', '1,0', '2,0']);
        
        assertEqual(grid.size, 7);
        assertTrue(grid.isTarget('0,0'));
        assertTrue(grid.isTarget('1,0'));
        assertFalse(grid.isTarget('1,1'));
        assertFalse(grid.isPainted('1,1'));
    }));

    // Test: Painting non-target cells still counts
    results.push(test('Painting non-target cells works', () => {
        const grid = new Grid(5, ['1,1']);
        grid.paintCell('0,0'); // Not a target
        grid.paintCell('4,4'); // Not a target
        
        assertTrue(grid.isPainted('0,0'));
        assertTrue(grid.isPainted('4,4'));
        assertFalse(grid.allTargetsPainted()); // Target not painted
    }));

    // Test: Empty targets grid always returns true for allTargetsPainted
    results.push(test('Empty targets grid returns true for allTargetsPainted', () => {
        const grid = new Grid(5, []);
        assertTrue(grid.allTargetsPainted());
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

function assertTrue(value) {
    if (value !== true) {
        throw new Error(`Expected true, got ${value}`);
    }
}

function assertFalse(value) {
    if (value !== false) {
        throw new Error(`Expected false, got ${value}`);
    }
}
