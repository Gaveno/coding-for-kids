/**
 * Tests for Sequence class
 */
import { Sequence } from '../js/Sequence.js';

export function runSequenceTests() {
    const results = [];

    // Test: Sequence starts empty
    results.push(test('Sequence starts empty', () => {
        const seq = new Sequence();
        assertEqual(seq.length, 0);
        assertTrue(seq.isEmpty());
    }));

    // Test: Add command
    results.push(test('Add command to sequence', () => {
        const seq = new Sequence();
        seq.addCommand('left');
        assertEqual(seq.length, 1);
        assertEqual(seq.getCommand(0).type, 'left');
    }));

    // Test: Add multiple commands
    results.push(test('Add multiple commands', () => {
        const seq = new Sequence();
        seq.addCommand('left');
        seq.addCommand('right');
        seq.addCommand('lower');
        seq.addCommand('raise');
        assertEqual(seq.length, 4);
    }));

    // Test: Get all commands
    results.push(test('Get all commands returns array', () => {
        const seq = new Sequence();
        seq.addCommand('left');
        seq.addCommand('lower');
        const commands = seq.getCommands();
        assertTrue(Array.isArray(commands));
        assertEqual(commands.length, 2);
    }));

    // Test: Remove command at index
    results.push(test('Remove command at index', () => {
        const seq = new Sequence();
        seq.addCommand('left');
        seq.addCommand('right');
        seq.addCommand('lower');
        
        seq.removeAt(1);
        
        assertEqual(seq.length, 2);
        assertEqual(seq.getCommand(0).type, 'left');
        assertEqual(seq.getCommand(1).type, 'lower');
    }));

    // Test: Clear all commands
    results.push(test('Clear all commands', () => {
        const seq = new Sequence();
        seq.addCommand('left');
        seq.addCommand('right');
        seq.clear();
        assertEqual(seq.length, 0);
        assertTrue(seq.isEmpty());
    }));

    // Test: Move command from one index to another
    results.push(test('Move command within sequence', () => {
        const seq = new Sequence();
        seq.addCommand('left');   // 0
        seq.addCommand('right');  // 1
        seq.addCommand('lower');   // 2
        
        seq.moveCommand(2, 0); // Move lower to front
        
        assertEqual(seq.getCommand(0).type, 'lower');
        assertEqual(seq.getCommand(1).type, 'left');
        assertEqual(seq.getCommand(2).type, 'right');
    }));

    // Test: Insert command at index
    results.push(test('Insert command at specific index', () => {
        const seq = new Sequence();
        seq.addCommand('left');
        seq.addCommand('lower');
        
        seq.insertAt(1, 'right');
        
        assertEqual(seq.length, 3);
        assertEqual(seq.getCommand(0).type, 'left');
        assertEqual(seq.getCommand(1).type, 'right');
        assertEqual(seq.getCommand(2).type, 'lower');
    }));

    // Test: Valid command types
    results.push(test('Only accepts valid command types', () => {
        const seq = new Sequence();
        assertTrue(seq.addCommand('left'));
        assertTrue(seq.addCommand('right'));
        assertTrue(seq.addCommand('lower'));
        assertTrue(seq.addCommand('raise'));
        assertFalse(seq.addCommand('invalid'));
        assertFalse(seq.addCommand('grab'));  // Old command no longer valid
        assertFalse(seq.addCommand('drop'));  // Old command no longer valid
        assertEqual(seq.length, 4);
    }));

    // Test: Remove at invalid index does nothing
    results.push(test('Remove at invalid index does nothing', () => {
        const seq = new Sequence();
        seq.addCommand('left');
        seq.removeAt(-1);
        seq.removeAt(100);
        assertEqual(seq.length, 1);
    }));

    // Test: Iteration support
    results.push(test('Supports iteration', () => {
        const seq = new Sequence();
        seq.addCommand('left');
        seq.addCommand('right');
        
        let count = 0;
        for (const cmd of seq) {
            count++;
            assertTrue(cmd.type === 'left' || cmd.type === 'right');
        }
        assertEqual(count, 2);
    }));

    // ===== Loop Tests =====
    
    // Test: Add loop command
    results.push(test('Add loop to sequence', () => {
        const seq = new Sequence();
        seq.addLoop(3);
        assertEqual(seq.length, 1);
        assertEqual(seq.getCommand(0).type, 'loop');
        assertEqual(seq.getCommand(0).iterations, 3);
        assertTrue(Array.isArray(seq.getCommand(0).commands));
    }));

    // Test: Add commands to active loop
    results.push(test('Add commands to active loop', () => {
        const seq = new Sequence();
        seq.addLoop(2);
        seq.setActiveLoop(0);
        seq.addCommand('left');
        seq.addCommand('right');
        
        assertEqual(seq.length, 1); // Only loop in main sequence
        assertEqual(seq.getCommand(0).commands.length, 2);
        assertEqual(seq.getCommand(0).commands[0].type, 'left');
        assertEqual(seq.getCommand(0).commands[1].type, 'right');
    }));

    // Test: Deactivate loop
    results.push(test('Deactivate loop adds commands to main sequence', () => {
        const seq = new Sequence();
        seq.addLoop(2);
        seq.setActiveLoop(0);
        seq.addCommand('left');
        seq.setActiveLoop(null); // Deactivate
        seq.addCommand('right');
        
        assertEqual(seq.length, 2); // Loop + right command
        assertEqual(seq.getCommand(0).commands.length, 1);
        assertEqual(seq.getCommand(1).type, 'right');
    }));

    // Test: Flatten simple loop
    results.push(test('Flatten expands loop commands', () => {
        const seq = new Sequence();
        seq.addLoop(3);
        seq.setActiveLoop(0);
        seq.addCommand('left');
        seq.addCommand('right');
        
        const flat = seq.flatten();
        assertEqual(flat.length, 6); // (left + right) * 3
        assertEqual(flat[0].type, 'left');
        assertEqual(flat[1].type, 'right');
        assertEqual(flat[2].type, 'left');
        assertEqual(flat[3].type, 'right');
        assertEqual(flat[4].type, 'left');
        assertEqual(flat[5].type, 'right');
    }));

    // Test: Update loop iterations
    results.push(test('Update loop iterations', () => {
        const seq = new Sequence();
        seq.addLoop(2);
        seq.updateLoopIterations(0, 5);
        assertEqual(seq.getCommand(0).iterations, 5);
        
        // Clamp to min 1
        seq.updateLoopIterations(0, 0);
        assertEqual(seq.getCommand(0).iterations, 1);
        
        // Clamp to max 9
        seq.updateLoopIterations(0, 15);
        assertEqual(seq.getCommand(0).iterations, 9);
    }));

    // Test: Remove command from loop
    results.push(test('Remove command from loop', () => {
        const seq = new Sequence();
        seq.addLoop(2);
        seq.setActiveLoop(0);
        seq.addCommand('left');
        seq.addCommand('right');
        seq.addCommand('lower');
        
        seq.removeFromLoop(0, 1); // Remove 'right'
        
        assertEqual(seq.getCommand(0).commands.length, 2);
        assertEqual(seq.getCommand(0).commands[0].type, 'left');
        assertEqual(seq.getCommand(0).commands[1].type, 'lower');
    }));

    // Test: Remove loop clears activeLoopIndex
    results.push(test('Removing active loop clears activeLoopIndex', () => {
        const seq = new Sequence();
        seq.addLoop(2);
        seq.setActiveLoop(0);
        assertEqual(seq.activeLoopIndex, 0);
        
        seq.removeAt(0);
        assertEqual(seq.activeLoopIndex, null);
    }));

    // Test: Clear resets activeLoopIndex
    results.push(test('Clear resets activeLoopIndex', () => {
        const seq = new Sequence();
        seq.addLoop(2);
        seq.setActiveLoop(0);
        seq.clear();
        
        assertEqual(seq.length, 0);
        assertEqual(seq.activeLoopIndex, null);
    }));

    // Test: Flatten mixed sequence
    results.push(test('Flatten mixed sequence with loops and commands', () => {
        const seq = new Sequence();
        seq.addCommand('lower'); // 0: lower
        seq.addLoop(2);          // 1: loop
        seq.setActiveLoop(1);
        seq.addCommand('left');  // Inside loop
        seq.addCommand('right'); // Inside loop
        seq.setActiveLoop(null);
        seq.addCommand('raise'); // 2: raise
        
        const flat = seq.flatten();
        assertEqual(flat.length, 6); // lower + (left + right) * 2 + raise
        assertEqual(flat[0].type, 'lower');
        assertEqual(flat[1].type, 'left');
        assertEqual(flat[2].type, 'right');
        assertEqual(flat[3].type, 'left');
        assertEqual(flat[4].type, 'right');
        assertEqual(flat[5].type, 'raise');
    }));

    return results;
}

// Test utilities
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
