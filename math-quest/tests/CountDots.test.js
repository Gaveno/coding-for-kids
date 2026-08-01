/**
 * Tests for CountDots module
 */
import {
    DOTS_PER_ROW, MAX_DOTS, dotEmoji, showsDots, dotRows, buildDots
} from '../js/CountDots.js';
import { OPERATIONS } from '../js/Problems.js';

export function runCountDotsTests() {
    const results = [];

    test('Rows hold five dots so they stay easy to count', () => {
        assertEqual(DOTS_PER_ROW, 5);
    });

    test('Small numbers show dots, big ones do not', () => {
        assertEqual(showsDots(1), true);
        assertEqual(showsDots(10), true);
        assertEqual(showsDots(MAX_DOTS), true);
        assertEqual(showsDots(MAX_DOTS + 1), false, 'Too many to count.');
        assertEqual(showsDots(0), false, 'Zero has nothing to count.');
        assertEqual(showsDots(-3), false, 'Negative has nothing to count.');
        assertEqual(showsDots(2.5), false, 'Fractions are not countable dots.');
    });

    test('dotRows splits numbers into rows of five', () => {
        assertSameRows(dotRows(1), [1]);
        assertSameRows(dotRows(4), [4]);
        assertSameRows(dotRows(5), [5]);
        assertSameRows(dotRows(7), [5, 2]);
        assertSameRows(dotRows(20), [5, 5, 5, 5]);
    });

    test('Ten renders as two full rows - just like two hands', () => {
        assertSameRows(dotRows(10), [5, 5]);
    });

    test('Rows always add back up to the number', () => {
        for (let n = 1; n <= MAX_DOTS; n++) {
            const rows = dotRows(n);
            const total = rows.reduce((sum, count) => sum + count, 0);
            assertEqual(total, n, `Rows for ${n} sum correctly.`);
            assertTrue(rows.every(count => count >= 1 && count <= DOTS_PER_ROW),
                `Rows for ${n} are all 1-${DOTS_PER_ROW}.`);
        }
    });

    test('Uncountable numbers produce no rows', () => {
        assertEqual(dotRows(0).length, 0);
        assertEqual(dotRows(MAX_DOTS + 1).length, 0);
        assertEqual(dotRows(59).length, 0, 'Nobody counts 59 apples.');
    });

    test('Every operation has a counting emoji', () => {
        Object.keys(OPERATIONS).forEach(opId => {
            const emoji = dotEmoji(opId);
            assertTrue(typeof emoji === 'string' && emoji.length > 0, `Emoji for ${opId}.`);
        });
    });

    test('Unknown operations still get a fallback emoji', () => {
        assertTrue(dotEmoji('nope').length > 0, 'Fallback emoji exists.');
    });

    test('buildDots renders one emoji per unit', () => {
        for (const n of [1, 3, 7, 10, 20]) {
            const el = buildDots(n, '🍎');
            assertEqual(el.querySelectorAll('.dot-emoji').length, n, `${n} emojis rendered.`);
            assertEqual(el.querySelectorAll('.dot-row').length, dotRows(n).length,
                `${n} rendered in the right number of rows.`);
        }
    });

    test('buildDots uses the emoji it is given', () => {
        const el = buildDots(3, '⭐');
        assertEqual(el.textContent, '⭐⭐⭐');
    });

    test('buildDots is hidden from screen readers', () => {
        // The numeral beside it already announces the value
        assertEqual(buildDots(4, '🍎').getAttribute('aria-hidden'), 'true');
    });

    test('buildDots returns nothing for uncountable numbers', () => {
        assertEqual(buildDots(0, '🍎'), null);
        assertEqual(buildDots(59, '🍎'), null);
    });

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

    function assertSameRows(actual, expected) {
        if (actual.join(',') !== expected.join(',')) {
            throw new Error(`Expected rows [${expected}], got [${actual}]`);
        }
    }

    return results;
}
