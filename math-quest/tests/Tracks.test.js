/**
 * Tests for Tracks module
 */
import {
    OP_ORDER, MODE_ORDER, QUESTIONS_PER_TRACK, MODE_ICONS,
    trackId, isUnlocked, starsForMistakes
} from '../js/Tracks.js';

export function runTracksTests() {
    const results = [];

    /** getStars stub backed by a plain object */
    const starsFrom = data => id => data[id] || 0;

    test('There are 6 operations and 3 modes', () => {
        assertEqual(OP_ORDER.length, 6);
        assertEqual(MODE_ORDER.length, 3);
        assertEqual(QUESTIONS_PER_TRACK, 10);
    });

    test('Every mode has an icon', () => {
        MODE_ORDER.forEach(mode => {
            assertTrue(typeof MODE_ICONS[mode] === 'string' && MODE_ICONS[mode].length > 0,
                `Icon for ${mode}.`);
        });
    });

    test('First choice track starts unlocked, everything else locked', () => {
        const getStars = starsFrom({});
        assertEqual(isUnlocked('add1', 'choice', getStars), true);
        OP_ORDER.slice(1).forEach(op => {
            assertEqual(isUnlocked(op, 'choice', getStars), false, `${op}-choice locked.`);
        });
        OP_ORDER.forEach(op => {
            assertEqual(isUnlocked(op, 'type', getStars), false, `${op}-type locked.`);
            assertEqual(isUnlocked(op, 'missing', getStars), false, `${op}-missing locked.`);
        });
    });

    test('Finishing a choice track unlocks the next operation choice track', () => {
        const getStars = starsFrom({ [trackId('add1', 'choice')]: 1 });
        assertEqual(isUnlocked('add2', 'choice', getStars), true);
        assertEqual(isUnlocked('sub1', 'choice', getStars), false, 'Only the next one.');
    });

    test('Finishing a choice track unlocks typing for the same operation', () => {
        const getStars = starsFrom({ [trackId('mul1', 'choice')]: 2 });
        assertEqual(isUnlocked('mul1', 'type', getStars), true);
        assertEqual(isUnlocked('mul1', 'missing', getStars), false, 'Missing still locked.');
    });

    test('Finishing a typing track unlocks the missing-number track', () => {
        const getStars = starsFrom({
            [trackId('div1', 'choice')]: 1,
            [trackId('div1', 'type')]: 3
        });
        assertEqual(isUnlocked('div1', 'missing', getStars), true);
    });

    test('The full chain unlocks operation by operation', () => {
        const data = {};
        OP_ORDER.forEach(op => { data[trackId(op, 'choice')] = 1; });
        const getStars = starsFrom(data);
        OP_ORDER.forEach(op => {
            assertEqual(isUnlocked(op, 'choice', getStars), true, `${op}-choice open.`);
            assertEqual(isUnlocked(op, 'type', getStars), true, `${op}-type open.`);
        });
    });

    test('Unknown operations and modes are never unlocked', () => {
        const getStars = starsFrom({});
        assertEqual(isUnlocked('pow1', 'choice', getStars), false);
        assertEqual(isUnlocked('add1', 'quiz', getStars), false);
    });

    test('trackId joins operation and mode', () => {
        assertEqual(trackId('add1', 'choice'), 'add1-choice');
        assertEqual(trackId('div1', 'missing'), 'div1-missing');
    });

    test('Star rating rewards fewer mistakes', () => {
        assertEqual(starsForMistakes(0), 3);
        assertEqual(starsForMistakes(1), 2);
        assertEqual(starsForMistakes(2), 2);
        assertEqual(starsForMistakes(3), 1);
        assertEqual(starsForMistakes(25), 1);
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

    return results;
}
