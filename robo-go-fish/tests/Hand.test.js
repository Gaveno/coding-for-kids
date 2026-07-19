/**
 * Tests for Hand module
 */
import {
    countType, typesInHand, hasType, addCards,
    removeType, completedSets, extractSet
} from '../js/Hand.js';

export function runHandTests() {
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

    const HAND = ['⚙️', '🔋', '⚙️', '💡', '⚙️'];

    test('countType counts matching cards', () => {
        assertEqual(countType(HAND, '⚙️'), 3);
        assertEqual(countType(HAND, '🔋'), 1);
        assertEqual(countType(HAND, '🧲'), 0);
    });

    test('typesInHand returns unique types', () => {
        const types = typesInHand(HAND);
        assertEqual(types.length, 3);
        assertTrue(types.includes('⚙️'));
        assertTrue(types.includes('🔋'));
        assertTrue(types.includes('💡'));
    });

    test('hasType is true only for held types', () => {
        assertTrue(hasType(HAND, '⚙️'));
        assertEqual(hasType(HAND, '🧲'), false);
    });

    test('addCards appends without mutating', () => {
        const next = addCards(HAND, ['🧲', '🧲']);
        assertEqual(next.length, 7);
        assertEqual(HAND.length, 5, 'Original mutated!');
        assertEqual(countType(next, '🧲'), 2);
    });

    test('removeType removes all copies and returns them', () => {
        const { removed, hand } = removeType(HAND, '⚙️');
        assertEqual(removed.length, 3);
        assertEqual(hand.length, 2);
        assertEqual(countType(hand, '⚙️'), 0);
        assertEqual(HAND.length, 5, 'Original mutated!');
    });

    test('removeType of absent type removes nothing', () => {
        const { removed, hand } = removeType(HAND, '🧲');
        assertEqual(removed.length, 0);
        assertEqual(hand.length, 5);
    });

    test('completedSets finds types with 4 copies', () => {
        const hand = ['⚙️', '⚙️', '⚙️', '⚙️', '🔋', '💡', '💡', '💡', '💡'];
        const sets = completedSets(hand);
        assertEqual(sets.length, 2);
        assertTrue(sets.includes('⚙️'));
        assertTrue(sets.includes('💡'));
    });

    test('completedSets is empty when no set of 4', () => {
        assertEqual(completedSets(HAND).length, 0);
    });

    test('extractSet removes exactly the 4 set cards', () => {
        const hand = ['⚙️', '⚙️', '⚙️', '⚙️', '🔋'];
        const next = extractSet(hand, '⚙️');
        assertEqual(next.length, 1);
        assertEqual(next[0], '🔋');
        assertEqual(hand.length, 5, 'Original mutated!');
    });

    test('empty hand behaves sanely', () => {
        assertEqual(countType([], '⚙️'), 0);
        assertEqual(typesInHand([]).length, 0);
        assertEqual(completedSets([]).length, 0);
    });

    return results;
}
