/**
 * Tests for Sequence class
 */
import { Sequence } from '../js/Sequence.js';

export function runSequenceTests() {
    const results = [];

    // Test: Sequence initializes empty
    results.push(test('Sequence initializes empty', () => {
        const seq = new Sequence();
        assertTrue(seq.isEmpty());
        assertEqual(seq.commands.length, 0);
    }));

    // Test: Sequence adds commands
    results.push(test('Sequence adds move commands', () => {
        const seq = new Sequence();
        seq.addCommand('up');
        seq.addCommand('right');
        
        assertEqual(seq.commands.length, 2);
        assertEqual(seq.commands[0].direction, 'up');
        assertEqual(seq.commands[1].direction, 'right');
    }));

    // Test: Sequence removes commands by index
    results.push(test('Sequence removes commands by index', () => {
        const seq = new Sequence();
        seq.addCommand('up');
        seq.addCommand('right');
        seq.addCommand('down');
        
        seq.removeAt(1);
        
        assertEqual(seq.commands.length, 2);
        assertEqual(seq.commands[0].direction, 'up');
        assertEqual(seq.commands[1].direction, 'down');
    }));

    // Test: Sequence clears all commands
    results.push(test('Sequence clears all commands', () => {
        const seq = new Sequence();
        seq.addCommand('up');
        seq.addCommand('right');
        
        seq.clear();
        
        assertTrue(seq.isEmpty());
    }));

    // Test: Sequence saves function
    results.push(test('Sequence saves commands as function', () => {
        const seq = new Sequence();
        seq.addCommand('up');
        seq.addCommand('right');
        
        const saved = seq.saveAsFunction();
        
        assertTrue(saved);
        assertEqual(seq.savedFunctions.length, 1);
        assertEqual(seq.savedFunctions[0].commands.length, 2);
    }));

    // Test: Sequence save fails when empty
    results.push(test('Sequence save fails when empty', () => {
        const seq = new Sequence();
        const saved = seq.saveAsFunction();
        
        assertFalse(saved);
        assertEqual(seq.savedFunctions.length, 0);
    }));

    // Test: Sequence adds function call
    results.push(test('Sequence adds function call', () => {
        const seq = new Sequence();
        seq.addCommand('up');
        seq.saveAsFunction();
        seq.clear();
        
        seq.addFunctionCall(0);
        
        assertEqual(seq.commands.length, 1);
        assertEqual(seq.commands[0].type, 'function');
        assertEqual(seq.commands[0].id, 1);
    }));

    // Test: Sequence flattens with functions
    results.push(test('Sequence flattens with function expansion', () => {
        const seq = new Sequence();
        
        // Create a function with 2 moves
        seq.addCommand('up');
        seq.addCommand('right');
        seq.saveAsFunction();
        seq.clear();
        
        // Add function call + regular move
        seq.addFunctionCall(0);
        seq.addCommand('down');
        
        const flat = seq.flatten();
        
        assertEqual(flat.length, 3);
        assertEqual(flat[0].direction, 'up');
        assertEqual(flat[1].direction, 'right');
        assertEqual(flat[2].direction, 'down');
    }));

    // Test: Sequence getTotalMoves counts correctly
    results.push(test('Sequence getTotalMoves counts correctly', () => {
        const seq = new Sequence();
        seq.addCommand('up');
        seq.addCommand('right');
        seq.saveAsFunction();
        seq.clear();
        
        seq.addFunctionCall(0); // 2 moves
        seq.addCommand('down'); // 1 move
        
        assertEqual(seq.getTotalMoves(), 3);
    }));

    // Test: Sequence deletes function
    results.push(test('Sequence deletes saved function', () => {
        const seq = new Sequence();
        seq.addCommand('up');
        seq.saveAsFunction();
        seq.addCommand('down');
        seq.saveAsFunction();
        
        assertEqual(seq.savedFunctions.length, 2);
        
        seq.deleteFunction(0);
        
        assertEqual(seq.savedFunctions.length, 1);
    }));

    // Test: Static getDirectionEmoji works
    results.push(test('getDirectionEmoji returns correct emojis', () => {
        assertEqual(Sequence.getDirectionEmoji('up'), '⬆️');
        assertEqual(Sequence.getDirectionEmoji('down'), '⬇️');
        assertEqual(Sequence.getDirectionEmoji('left'), '⬅️');
        assertEqual(Sequence.getDirectionEmoji('right'), '➡️');
        assertEqual(Sequence.getDirectionEmoji('invalid'), '❓');
    }));

    // Test: Function only saves move commands
    results.push(test('Function only saves move commands, not function calls', () => {
        const seq = new Sequence();
        seq.addCommand('up');
        seq.saveAsFunction();
        seq.clear();
        
        // Add mix of moves and function calls
        seq.addCommand('left');
        seq.addFunctionCall(0);
        seq.addCommand('right');
        
        const saved = seq.saveAsFunction();
        
        assertTrue(saved);
        // Should only save 'left' and 'right', not the function call
        assertEqual(seq.savedFunctions[1].commands.length, 2);
    }));

    // Test: Sequence adds fire commands
    results.push(test('Sequence adds fire commands', () => {
        const seq = new Sequence();
        seq.addFireCommand('up');
        seq.addFireCommand('right');
        
        assertEqual(seq.commands.length, 2);
        assertEqual(seq.commands[0].type, 'fire');
        assertEqual(seq.commands[0].direction, 'up');
        assertEqual(seq.commands[1].type, 'fire');
        assertEqual(seq.commands[1].direction, 'right');
    }));

    // Test: Fire commands in flatten
    results.push(test('Fire commands are included in flatten', () => {
        const seq = new Sequence();
        seq.addCommand('up');
        seq.addFireCommand('right');
        seq.addCommand('down');
        
        const flat = seq.flatten();
        
        assertEqual(flat.length, 3);
        assertEqual(flat[0].type, 'move');
        assertEqual(flat[1].type, 'fire');
        assertEqual(flat[2].type, 'move');
    }));

    // Test: Static getFireEmoji works
    results.push(test('getFireEmoji returns correct emojis', () => {
        assertEqual(Sequence.getFireEmoji('up'), '🚀⬆️');
        assertEqual(Sequence.getFireEmoji('down'), '🚀⬇️');
        assertEqual(Sequence.getFireEmoji('left'), '🚀⬅️');
        assertEqual(Sequence.getFireEmoji('right'), '🚀➡️');
        assertEqual(Sequence.getFireEmoji('invalid'), '🚀');
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
