/**
 * Tests for Ant class
 */
import { Ant } from '../js/Ant.js';

export function runAntTests() {
    const results = [];

    results.push(test('Ant initializes with start position and heading', () => {
        const ant = new Ant({ x: 2, y: 3 }, 'right');
        assertEqual(ant.position.x, 2);
        assertEqual(ant.position.y, 3);
        assertEqual(ant.getHeadingName(), 'right');
        assertEqual(ant.rotationDeg, 90);
    }));

    results.push(test('Ant moves forward facing up', () => {
        const ant = new Ant({ x: 2, y: 2 }, 'up');
        ant.moveForward();
        assertEqual(ant.position.x, 2);
        assertEqual(ant.position.y, 1);
    }));

    results.push(test('Ant moves forward facing right', () => {
        const ant = new Ant({ x: 2, y: 2 }, 'right');
        ant.moveForward();
        assertEqual(ant.position.x, 3);
        assertEqual(ant.position.y, 2);
    }));

    results.push(test('Ant moves forward facing down', () => {
        const ant = new Ant({ x: 2, y: 2 }, 'down');
        ant.moveForward();
        assertEqual(ant.position.y, 3);
    }));

    results.push(test('Ant moves forward facing left', () => {
        const ant = new Ant({ x: 2, y: 2 }, 'left');
        ant.moveForward();
        assertEqual(ant.position.x, 1);
    }));

    results.push(test('Rotate right cycles through headings', () => {
        const ant = new Ant({ x: 0, y: 0 }, 'up');
        ant.rotate('right');
        assertEqual(ant.getHeadingName(), 'right');
        ant.rotate('right');
        assertEqual(ant.getHeadingName(), 'down');
        ant.rotate('right');
        assertEqual(ant.getHeadingName(), 'left');
        ant.rotate('right');
        assertEqual(ant.getHeadingName(), 'up');
    }));

    results.push(test('Rotate left cycles through headings', () => {
        const ant = new Ant({ x: 0, y: 0 }, 'up');
        ant.rotate('left');
        assertEqual(ant.getHeadingName(), 'left');
        ant.rotate('left');
        assertEqual(ant.getHeadingName(), 'down');
    }));

    results.push(test('Rotation degrees accumulate (no unwinding)', () => {
        const ant = new Ant({ x: 0, y: 0 }, 'up');
        ant.rotate('right');
        ant.rotate('right');
        ant.rotate('right');
        ant.rotate('right');
        assertEqual(ant.rotationDeg, 360);
        ant.rotate('left');
        assertEqual(ant.rotationDeg, 270);
    }));

    results.push(test('Detects out of bounds', () => {
        const ant = new Ant({ x: 0, y: 0 }, 'up');
        ant.moveForward();
        assertTrue(ant.isOutOfBounds(5));
    }));

    results.push(test('Reset restores position, heading, and carrying', () => {
        const ant = new Ant({ x: 1, y: 1 }, 'up');
        ant.moveForward();
        ant.rotate('right');
        ant.carrying = true;
        ant.reset();
        assertEqual(ant.position.x, 1);
        assertEqual(ant.position.y, 1);
        assertEqual(ant.getHeadingName(), 'up');
        assertEqual(ant.rotationDeg, 0);
        assertEqual(ant.carrying, false);
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
