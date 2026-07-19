/**
 * Tests for Progress module
 */
import { Progress } from '../js/Progress.js';
import { TOTAL_LEVELS } from '../js/Words.js';

export function runProgressTests() {
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

    /** In-memory stand-in for localStorage */
    function fakeStorage(initial = {}) {
        const store = { ...initial };
        return {
            getItem: k => (k in store ? store[k] : null),
            setItem: (k, v) => { store[k] = String(v); },
            _store: store
        };
    }

    test('New player starts at level 1 with 0 stars', () => {
        const p = new Progress(fakeStorage());
        assertEqual(p.getLevel(), 1);
        assertEqual(p.getStars(), 0);
        assertEqual(p.isFinished(), false);
    });

    test('Completing a level earns a star and advances', () => {
        const p = new Progress(fakeStorage());
        p.completeLevel();
        assertEqual(p.getLevel(), 2);
        assertEqual(p.getStars(), 1);
    });

    test('Progress persists through storage', () => {
        const storage = fakeStorage();
        const p1 = new Progress(storage);
        p1.completeLevel();
        p1.completeLevel();
        const p2 = new Progress(storage);
        assertEqual(p2.getLevel(), 3);
        assertEqual(p2.getStars(), 2);
    });

    test('Level never advances past the last level', () => {
        const p = new Progress(fakeStorage());
        for (let i = 0; i < TOTAL_LEVELS + 5; i++) p.completeLevel();
        assertEqual(p.getLevel(), TOTAL_LEVELS);
    });

    test('isFinished becomes true after completing all levels', () => {
        const p = new Progress(fakeStorage());
        for (let i = 0; i < TOTAL_LEVELS; i++) p.completeLevel();
        assertTrue(p.isFinished());
    });

    test('restart returns to level 1 but keeps stars', () => {
        const p = new Progress(fakeStorage());
        p.completeLevel();
        p.completeLevel();
        p.restart();
        assertEqual(p.getLevel(), 1);
        assertEqual(p.getStars(), 2);
    });

    test('Corrupt saved data falls back to defaults', () => {
        const storage = fakeStorage({ 'word-safari-progress-v1': '{not json!' });
        const p = new Progress(storage);
        assertEqual(p.getLevel(), 1);
        assertEqual(p.getStars(), 0);
    });

    test('Out-of-range saved level is clamped', () => {
        const storage = fakeStorage({
            'word-safari-progress-v1': JSON.stringify({ level: 999, stars: 3 })
        });
        const p = new Progress(storage);
        assertEqual(p.getLevel(), TOTAL_LEVELS);
        assertEqual(p.getStars(), 3);
    });

    return results;
}
