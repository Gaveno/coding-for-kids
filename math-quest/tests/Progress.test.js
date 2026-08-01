/**
 * Tests for Progress module
 */
import { Progress } from '../js/Progress.js';

export function runProgressTests() {
    const results = [];

    /** In-memory stand-in for localStorage */
    function fakeStorage(initial = {}) {
        const store = { ...initial };
        return {
            getItem: k => (k in store ? store[k] : null),
            setItem: (k, v) => { store[k] = String(v); },
            _store: store
        };
    }

    const KEY = 'math-quest-progress-v1';

    test('Starts with no stars anywhere', () => {
        const p = new Progress(fakeStorage());
        assertEqual(p.getStars('add1-choice'), 0);
        assertEqual(p.totalStars(), 0);
    });

    test('setStars records a finished track', () => {
        const p = new Progress(fakeStorage());
        p.setStars('add1-choice', 2);
        assertEqual(p.getStars('add1-choice'), 2);
    });

    test('setStars keeps the best result', () => {
        const p = new Progress(fakeStorage());
        p.setStars('add1-choice', 3);
        p.setStars('add1-choice', 1);
        assertEqual(p.getStars('add1-choice'), 3);
    });

    test('Progress persists through storage', () => {
        const storage = fakeStorage();
        const p1 = new Progress(storage);
        p1.setStars('add1-choice', 2);
        p1.setStars('add1-type', 3);
        const p2 = new Progress(storage);
        assertEqual(p2.getStars('add1-choice'), 2);
        assertEqual(p2.getStars('add1-type'), 3);
    });

    test('totalStars sums across tracks', () => {
        const p = new Progress(fakeStorage());
        p.setStars('add1-choice', 2);
        p.setStars('sub1-choice', 3);
        assertEqual(p.totalStars(), 5);
    });

    test('Corrupt saved data falls back to empty', () => {
        const storage = fakeStorage({ [KEY]: '{not json!' });
        const p = new Progress(storage);
        assertEqual(p.getStars('add1-choice'), 0);
    });

    test('Invalid star values are dropped, high ones clamped to 3', () => {
        const storage = fakeStorage({
            [KEY]: JSON.stringify({
                stars: { 'add1-choice': 99, 'sub1-choice': 'three', 'mul1-choice': -2 }
            })
        });
        const p = new Progress(storage);
        assertEqual(p.getStars('add1-choice'), 3, 'Clamped to 3.');
        assertEqual(p.getStars('sub1-choice'), 0, 'Non-number dropped.');
        assertEqual(p.getStars('mul1-choice'), 0, 'Negative dropped.');
    });

    test('Works without any storage (private mode)', () => {
        const p = new Progress(null);
        p.setStars('add1-choice', 2);
        assertEqual(p.getStars('add1-choice'), 2, 'Still tracks in memory.');
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

    return results;
}
