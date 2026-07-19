/**
 * Tests for Deck module
 */
import { PART_TYPES, COPIES_PER_TYPE, buildDeck, shuffle, draw } from '../js/Deck.js';

export function runDeckTests() {
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

    test('There are 6 part types', () => {
        assertEqual(PART_TYPES.length, 6);
    });

    test('Part types are unique', () => {
        assertEqual(new Set(PART_TYPES).size, PART_TYPES.length, 'Duplicate part types');
    });

    test('buildDeck returns copies * types cards', () => {
        assertEqual(buildDeck().length, PART_TYPES.length * COPIES_PER_TYPE);
    });

    test('buildDeck has exactly COPIES_PER_TYPE of each type', () => {
        const deck = buildDeck();
        PART_TYPES.forEach(type => {
            const count = deck.filter(c => c === type).length;
            assertEqual(count, COPIES_PER_TYPE, `Type ${type}:`);
        });
    });

    test('shuffle keeps the same cards', () => {
        const deck = buildDeck();
        const shuffled = shuffle(deck);
        assertEqual(shuffled.length, deck.length);
        assertEqual([...shuffled].sort().join(','), [...deck].sort().join(','));
    });

    test('shuffle does not mutate the original', () => {
        const deck = buildDeck();
        const copy = [...deck];
        shuffle(deck);
        assertEqual(deck.join(','), copy.join(','));
    });

    test('shuffle with seeded rng is deterministic', () => {
        const rng = (seed) => () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
        const a = shuffle(buildDeck(), rng(42)).join(',');
        const b = shuffle(buildDeck(), rng(42)).join(',');
        assertEqual(a, b);
    });

    test('draw returns top card and remaining deck', () => {
        const { card, rest } = draw(['⚙️', '🔋']);
        assertEqual(card, '⚙️');
        assertEqual(rest.length, 1);
        assertEqual(rest[0], '🔋');
    });

    test('draw does not mutate the original deck', () => {
        const deck = ['⚙️', '🔋'];
        draw(deck);
        assertEqual(deck.length, 2);
    });

    test('draw from empty deck returns null card', () => {
        const { card, rest } = draw([]);
        assertEqual(card, null);
        assertEqual(rest.length, 0);
    });

    test('drawing entire deck yields all cards', () => {
        let deck = buildDeck();
        let count = 0;
        while (deck.length > 0) {
            const { card, rest } = draw(deck);
            assertTrue(card !== null, 'Card should not be null');
            deck = rest;
            count++;
        }
        assertEqual(count, PART_TYPES.length * COPIES_PER_TYPE);
    });

    return results;
}
