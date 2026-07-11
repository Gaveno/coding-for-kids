/**
 * Tests for Grid class (state only - rendering is manual-tested)
 */
import { Grid } from '../js/Grid.js';

export function runGridTests() {
    const results = [];

    results.push(test('Grid initializes with nest, leaves, obstacles', () => {
        const grid = new Grid(5, '2,1', ['1,1'], ['3,3']);
        assertTrue(grid.isNest('2,1'));
        assertTrue(grid.hasLeaf('1,1'));
        assertTrue(grid.hasObstacle('3,3'));
        assertEqual(grid.totalLeaves, 1);
        assertEqual(grid.delivered, 0);
    }));

    results.push(test('Leaf can be picked up (removed)', () => {
        const grid = new Grid(5, '2,1', ['1,1']);
        assertTrue(grid.removeLeaf('1,1'));
        assertEqual(grid.hasLeaf('1,1'), false);
    }));

    results.push(test('Leaf can be set down on any cell', () => {
        const grid = new Grid(5, '2,1', ['1,1']);
        grid.removeLeaf('1,1');
        grid.addLeaf('3,2');
        assertTrue(grid.hasLeaf('3,2'));
    }));

    results.push(test('Delivering all leaves completes the goal', () => {
        const grid = new Grid(5, '2,1', ['1,1', '2,2']);
        assertEqual(grid.allLeavesDelivered(), false);
        grid.deliverLeaf();
        assertEqual(grid.allLeavesDelivered(), false);
        grid.deliverLeaf();
        assertTrue(grid.allLeavesDelivered());
    }));

    results.push(test('Level with no leaves counts as delivered', () => {
        const grid = new Grid(5, '2,1');
        assertTrue(grid.allLeavesDelivered());
    }));

    results.push(test('Reset restores leaves and clears delivered count', () => {
        const grid = new Grid(5, '2,1', ['1,1']);
        grid.removeLeaf('1,1');
        grid.deliverLeaf();
        grid.reset(['1,1'], []);
        assertTrue(grid.hasLeaf('1,1'));
        assertEqual(grid.delivered, 0);
    }));

    results.push(test('Configure replaces the whole board', () => {
        const grid = new Grid(5, '2,1', ['1,1']);
        grid.configure(6, '5,3', ['2,3', '4,3'], ['3,3']);
        assertEqual(grid.size, 6);
        assertTrue(grid.isNest('5,3'));
        assertEqual(grid.totalLeaves, 2);
        assertTrue(grid.hasObstacle('3,3'));
    }));

    return results;
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
