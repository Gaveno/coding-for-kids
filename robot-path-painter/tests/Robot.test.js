/**
 * Tests for Robot class
 */
import { Robot } from '../js/Robot.js';

export function runRobotTests() {
    const results = [];

    // Test: Robot initializes with correct position
    results.push(test('Robot initializes with start position', () => {
        const robot = new Robot({ x: 2, y: 3 });
        assertEqual(robot.position.x, 2);
        assertEqual(robot.position.y, 3);
    }));

    // Test: Robot moves up correctly
    results.push(test('Robot moves up correctly', () => {
        const robot = new Robot({ x: 2, y: 2 });
        robot.move('up');
        assertEqual(robot.position.x, 2);
        assertEqual(robot.position.y, 1);
    }));

    // Test: Robot moves down correctly
    results.push(test('Robot moves down correctly', () => {
        const robot = new Robot({ x: 2, y: 2 });
        robot.move('down');
        assertEqual(robot.position.x, 2);
        assertEqual(robot.position.y, 3);
    }));

    // Test: Robot moves left correctly
    results.push(test('Robot moves left correctly', () => {
        const robot = new Robot({ x: 2, y: 2 });
        robot.move('left');
        assertEqual(robot.position.x, 1);
        assertEqual(robot.position.y, 2);
    }));

    // Test: Robot moves right correctly
    results.push(test('Robot moves right correctly', () => {
        const robot = new Robot({ x: 2, y: 2 });
        robot.move('right');
        assertEqual(robot.position.x, 3);
        assertEqual(robot.position.y, 2);
    }));

    // Test: Robot detects out of bounds (top)
    results.push(test('Robot detects out of bounds at top', () => {
        const robot = new Robot({ x: 2, y: 0 });
        robot.move('up');
        assertTrue(robot.isOutOfBounds(5));
    }));

    // Test: Robot detects out of bounds (left)
    results.push(test('Robot detects out of bounds at left', () => {
        const robot = new Robot({ x: 0, y: 2 });
        robot.move('left');
        assertTrue(robot.isOutOfBounds(5));
    }));

    // Test: Robot detects out of bounds (bottom)
    results.push(test('Robot detects out of bounds at bottom', () => {
        const robot = new Robot({ x: 2, y: 4 });
        robot.move('down');
        assertTrue(robot.isOutOfBounds(5));
    }));

    // Test: Robot detects out of bounds (right)
    results.push(test('Robot detects out of bounds at right', () => {
        const robot = new Robot({ x: 4, y: 2 });
        robot.move('right');
        assertTrue(robot.isOutOfBounds(5));
    }));

    // Test: Robot within bounds returns false
    results.push(test('Robot within bounds returns false for isOutOfBounds', () => {
        const robot = new Robot({ x: 2, y: 2 });
        assertFalse(robot.isOutOfBounds(5));
    }));

    // Test: Robot resets to start position
    results.push(test('Robot resets to start position', () => {
        const robot = new Robot({ x: 1, y: 1 });
        robot.move('right');
        robot.move('down');
        robot.reset();
        assertEqual(robot.position.x, 1);
        assertEqual(robot.position.y, 1);
    }));

    // Test: Robot getPositionKey returns correct format
    results.push(test('Robot getPositionKey returns correct format', () => {
        const robot = new Robot({ x: 3, y: 4 });
        assertEqual(robot.getPositionKey(), '3,4');
    }));

    // Test: Robot setStartPosition updates both positions
    results.push(test('Robot setStartPosition updates positions', () => {
        const robot = new Robot({ x: 0, y: 0 });
        robot.setStartPosition({ x: 3, y: 3 });
        assertEqual(robot.position.x, 3);
        assertEqual(robot.position.y, 3);
        assertEqual(robot.startPosition.x, 3);
        assertEqual(robot.startPosition.y, 3);
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
