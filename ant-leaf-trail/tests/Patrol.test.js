/**
 * Tests for Patrol class
 */
import { Patrol } from '../js/Patrol.js';

export function runPatrolTests() {
    const results = [];

    results.push(test('Patrol starts at configured index', () => {
        const p = new Patrol({ path: ['2,1', '2,2', '2,3'], start: 1, dir: -1 });
        assertEqual(p.key(), '2,2');
        assertEqual(p.position().x, 2);
        assertEqual(p.position().y, 2);
    }));

    results.push(test('Patrol ping-pongs at path ends', () => {
        const p = new Patrol({ path: ['2,1', '2,2', '2,3'], start: 1, dir: -1 });
        assertEqual(p.step(), '2,1'); // toward start
        assertEqual(p.step(), '2,2'); // bounced
        assertEqual(p.step(), '2,3');
        assertEqual(p.step(), '2,2'); // bounced at far end
    }));

    results.push(test('Reset restores start position and direction', () => {
        const p = new Patrol({ path: ['0,0', '1,0', '2,0'], start: 0, dir: 1 });
        p.step();
        p.step();
        p.reset();
        assertEqual(p.key(), '0,0');
        assertEqual(p.step(), '1,0');
    }));

    results.push(test('Single-cell path never moves', () => {
        const p = new Patrol({ path: ['3,3'], start: 0, dir: 1 });
        assertEqual(p.step(), '3,3');
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
