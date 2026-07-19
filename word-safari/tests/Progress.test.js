/**
 * Tests for Progress module
 */
import { Progress } from '../js/Progress.js';
import { modeRange } from '../js/Words.js';

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

    const READ = modeRange('read');
    const WRITE = modeRange('write');

    test('Read mode starts at its first level with 0 stars', () => {
        const p = new Progress(fakeStorage());
        p.startMode('read');
        assertEqual(p.getLevel(), READ.start);
        assertEqual(p.getStars(), 0);
        assertEqual(p.isFinished(), false);
    });

    test('Write mode starts at its own first level', () => {
        const p = new Progress(fakeStorage());
        p.startMode('write');
        assertEqual(p.getLevel(), WRITE.start);
    });

    test('Completing a level earns a star and advances', () => {
        const p = new Progress(fakeStorage());
        p.startMode('read');
        p.completeLevel();
        assertEqual(p.getLevel(), READ.start + 1);
        assertEqual(p.getStars(), 1);
    });

    test('Progress persists per mode through storage', () => {
        const storage = fakeStorage();
        const p1 = new Progress(storage);
        p1.startMode('read');
        p1.completeLevel();
        p1.completeLevel();
        const p2 = new Progress(storage);
        p2.startMode('read');
        assertEqual(p2.getLevel(), READ.start + 2);
        assertEqual(p2.getStars(), 2);
    });

    test('Each mode keeps its own separate level', () => {
        const storage = fakeStorage();
        const p = new Progress(storage);
        p.startMode('read');
        p.completeLevel();
        p.startMode('write');
        assertEqual(p.getLevel(), WRITE.start);
        p.startMode('read');
        assertEqual(p.getLevel(), READ.start + 1);
    });

    test('Level never advances past the mode last level', () => {
        const p = new Progress(fakeStorage());
        p.startMode('read');
        const span = READ.end - READ.start + 5;
        for (let i = 0; i < span; i++) p.completeLevel();
        assertEqual(p.getLevel(), READ.end);
    });

    test('isFinished becomes true after completing all mode levels', () => {
        const p = new Progress(fakeStorage());
        p.startMode('write');
        for (let i = 0; i <= WRITE.end - WRITE.start; i++) p.completeLevel();
        assertTrue(p.isFinished());
    });

    test('Re-selecting a finished mode restarts it', () => {
        const p = new Progress(fakeStorage());
        p.startMode('read');
        for (let i = 0; i <= READ.end - READ.start; i++) p.completeLevel();
        assertTrue(p.isFinished());
        p.startMode('read');
        assertEqual(p.getLevel(), READ.start);
        assertEqual(p.isFinished(), false);
    });

    test('restart returns to the mode first level but keeps stars', () => {
        const p = new Progress(fakeStorage());
        p.startMode('read');
        p.completeLevel();
        p.completeLevel();
        p.restart();
        assertEqual(p.getLevel(), READ.start);
        assertEqual(p.getStars(), 2);
    });

    test('Corrupt saved data falls back to defaults', () => {
        const storage = fakeStorage({ 'word-safari-progress-v2': '{not json!' });
        const p = new Progress(storage);
        p.startMode('read');
        assertEqual(p.getLevel(), READ.start);
        assertEqual(p.getStars(), 0);
    });

    test('Out-of-range saved level is clamped to the mode', () => {
        const storage = fakeStorage({
            'word-safari-progress-v2': JSON.stringify({
                levels: { read: 999, write: 999 }, stars: 3
            })
        });
        const p = new Progress(storage);
        p.startMode('read');
        assertEqual(p.getLevel(), READ.end);
        assertEqual(p.getStars(), 3);
    });

    return results;
}
