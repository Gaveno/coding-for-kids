/**
 * Tests for Grid class (state only - rendering is manual-tested)
 */
import { Grid } from '../js/Grid.js';

const level = (extra = {}) => ({
    gridSize: 5, start: { x: 0, y: 0 }, heading: 'up', nest: '2,1',
    leaves: [], obstacles: [], crumbs: [], tunnels: [], ...extra
});

export function runGridTests() {
    const results = [];

    results.push(test('Grid initializes with nest, leaves, obstacles', () => {
        const grid = new Grid(level({ leaves: ['1,1'], obstacles: ['3,3'] }));
        assertTrue(grid.isNest('2,1'));
        assertTrue(grid.hasLeaf('1,1'));
        assertTrue(grid.hasObstacle('3,3'));
        assertEqual(grid.totalLeaves, 1);
        assertEqual(grid.delivered, 0);
    }));

    results.push(test('Leaf can be picked up and set down anywhere', () => {
        const grid = new Grid(level({ leaves: ['1,1'] }));
        assertTrue(grid.removeLeaf('1,1'));
        assertEqual(grid.hasLeaf('1,1'), false);
        grid.addLeaf('3,2');
        assertTrue(grid.hasLeaf('3,2'));
    }));

    results.push(test('Delivering all leaves completes the goal', () => {
        const grid = new Grid(level({ leaves: ['1,1', '2,2'] }));
        assertEqual(grid.allLeavesDelivered(), false);
        grid.deliverLeaf();
        grid.deliverLeaf();
        assertTrue(grid.allLeavesDelivered());
    }));

    results.push(test('Level with no leaves counts as delivered', () => {
        const grid = new Grid(level());
        assertTrue(grid.allLeavesDelivered());
    }));

    results.push(test('Crumbs can be collected once', () => {
        const grid = new Grid(level({ crumbs: ['2,2'] }));
        assertEqual(grid.totalCrumbs, 1);
        assertTrue(grid.collectCrumb('2,2'));
        assertEqual(grid.collectCrumb('2,2'), false);
        assertEqual(grid.crumbsCollected, 1);
    }));

    results.push(test('Tunnel exits map to the opposite end', () => {
        const grid = new Grid(level({ tunnels: ['1,3', '4,3'] }));
        assertEqual(grid.tunnelExit('1,3'), '4,3');
        assertEqual(grid.tunnelExit('4,3'), '1,3');
        assertEqual(grid.tunnelExit('0,0'), null);
    }));

    results.push(test('Reset restores leaves, crumbs, and counters', () => {
        const data = level({ leaves: ['1,1'], crumbs: ['2,2'] });
        const grid = new Grid(data);
        grid.removeLeaf('1,1');
        grid.deliverLeaf();
        grid.collectCrumb('2,2');
        grid.reset(data);
        assertTrue(grid.hasLeaf('1,1'));
        assertTrue(grid.hasCrumb('2,2'));
        assertEqual(grid.delivered, 0);
        assertEqual(grid.crumbsCollected, 0);
    }));

    results.push(test('Configure replaces the whole board', () => {
        const grid = new Grid(level());
        grid.configure(level({ gridSize: 6, nest: '5,3', leaves: ['2,3', '4,3'], obstacles: ['3,3'] }));
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
