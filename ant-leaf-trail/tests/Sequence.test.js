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

    results.push(test('Active loop receives new commands', () => {
        const seq = new Sequence();
        seq.addLoop();
        seq.add('forward');
        seq.add('right');
        assertEqual(seq.commands.length, 1);
        assertEqual(seq.commands[0].children.length, 2);
        seq.setActiveLoop(0); // deactivate
        seq.add('forward');
        assertEqual(seq.commands.length, 2);
    }));

    results.push(test('Loop expands children by iteration count', () => {
        const seq = new Sequence();
        seq.addLoop();          // iterations default 2
        seq.add('forward');
        seq.changeCount(0, 1, 0); // forward x2 inside loop
        seq.add('right');
        const steps = seq.expand();
        // (F F R) x2 = 6 steps, all tagged with block 0
        assertEqual(steps.length, 6);
        assertTrue(steps.every(s => s.blockIndex === 0));
        assertEqual(steps.map(s => s.action).join(','),
            'forward,forward,right,forward,forward,right');
    }));

    results.push(test('countBlocks counts loop plus its children', () => {
        const seq = new Sequence();
        seq.add('forward');
        seq.addLoop();
        seq.add('right');
        assertEqual(seq.countBlocks(), 3);
    }));

    results.push(test('Removing a child block from a loop', () => {
        const seq = new Sequence();
        seq.addLoop();
        seq.add('forward');
        seq.add('right');
        assertTrue(seq.removeAt(0, 0));
        assertEqual(seq.commands[0].children.length, 1);
        assertEqual(seq.commands[0].children[0].action, 'right');
    }));

    results.push(test('Removing a loop clears/adjusts the active index', () => {
        const seq = new Sequence();
        seq.add('forward');
        seq.addLoop();
        assertEqual(seq.activeLoop, 1);
        seq.removeAt(0);
        assertEqual(seq.activeLoop, 0);
        seq.removeAt(0);
        assertEqual(seq.activeLoop, null);
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
