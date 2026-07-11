/**
 * Tests for Sequence class
 */
import { Sequence, MAX_COUNT } from '../js/Sequence.js';

export function runSequenceTests() {
    const results = [];

    results.push(test('Adds commands with count 1', () => {
        const seq = new Sequence();
        seq.add('forward');
        assertEqual(seq.commands.length, 1);
        assertEqual(seq.commands[0].action, 'forward');
        assertEqual(seq.commands[0].count, 1);
    }));

    results.push(test('Rejects unknown actions', () => {
        const seq = new Sequence();
        assertEqual(seq.add('fly'), false);
        assertTrue(seq.isEmpty());
    }));

    results.push(test('Count can be incremented and decremented', () => {
        const seq = new Sequence();
        seq.add('forward');
        seq.changeCount(0, 1);
        seq.changeCount(0, 1);
        assertEqual(seq.commands[0].count, 3);
        seq.changeCount(0, -1);
        assertEqual(seq.commands[0].count, 2);
    }));

    results.push(test('Count clamps between 1 and MAX_COUNT', () => {
        const seq = new Sequence();
        seq.add('right');
        assertEqual(seq.changeCount(0, -1), false);
        assertEqual(seq.commands[0].count, 1);
        for (let i = 0; i < 20; i++) seq.changeCount(0, 1);
        assertEqual(seq.commands[0].count, MAX_COUNT);
    }));

    results.push(test('Removes command at index', () => {
        const seq = new Sequence();
        seq.add('forward');
        seq.add('right');
        seq.add('forward');
        seq.removeAt(1);
        assertEqual(seq.commands.length, 2);
        assertEqual(seq.commands[1].action, 'forward');
    }));

    results.push(test('Expand repeats actions by count with block indices', () => {
        const seq = new Sequence();
        seq.add('forward');
        seq.changeCount(0, 1); // forward x2
        seq.add('right');
        const steps = seq.expand();
        assertEqual(steps.length, 3);
        assertEqual(steps[0].action, 'forward');
        assertEqual(steps[1].action, 'forward');
        assertEqual(steps[1].blockIndex, 0);
        assertEqual(steps[2].action, 'right');
        assertEqual(steps[2].blockIndex, 1);
    }));

    results.push(test('totalSteps sums counts', () => {
        const seq = new Sequence();
        seq.add('forward');
        seq.changeCount(0, 1);
        seq.changeCount(0, 1); // 3
        seq.add('pickup');     // 1
        assertEqual(seq.totalSteps(), 4);
    }));

    results.push(test('Clear empties the sequence', () => {
        const seq = new Sequence();
        seq.add('forward');
        seq.clear();
        assertTrue(seq.isEmpty());
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
