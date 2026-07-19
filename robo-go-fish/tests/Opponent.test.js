/**
 * Tests for Opponent (robot AI) module
 */
import { Opponent } from '../js/Opponent.js';

export function runOpponentTests() {
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

    // rng that always returns 0 → always remembers, picks first option
    const firstRng = () => 0;
    const targets = [{ index: 0, count: 5 }, { index: 2, count: 5 }];

    test('chooseAsk returns a type from its own hand and a valid target', () => {
        const ai = new Opponent(1, firstRng);
        const { type, target } = ai.chooseAsk(['🔋', '💡'], targets);
        assertTrue(['🔋', '💡'].includes(type), `Got ${type}`);
        assertTrue([0, 2].includes(target), `Got target ${target}`);
    });

    test('chooseAsk returns null for empty hand', () => {
        const ai = new Opponent(1, firstRng);
        assertEqual(ai.chooseAsk([], targets), null);
    });

    test('chooseAsk returns null when no target has cards', () => {
        const ai = new Opponent(1, firstRng);
        assertEqual(ai.chooseAsk(['🔋'], [{ index: 0, count: 0 }]), null);
    });

    test('never targets a player with zero cards', () => {
        const ai = new Opponent(1, () => 0.999);
        const mixed = [{ index: 0, count: 0 }, { index: 2, count: 3 }];
        for (let i = 0; i < 10; i++) {
            assertEqual(ai.chooseAsk(['🔋', '💡'], mixed).target, 2);
        }
    });

    test('prefers a remembered ask it can use (type + who asked)', () => {
        const ai = new Opponent(1, firstRng);
        ai.observeAsk(0, '💡');
        const { type, target } = ai.chooseAsk(['🔋', '💡', '⚙️'], targets);
        assertEqual(type, '💡');
        assertEqual(target, 0, 'Should ask the player who revealed the part');
    });

    test('ignores remembered types it does not hold', () => {
        const ai = new Opponent(1, firstRng);
        ai.observeAsk(0, '🧲');
        const { type } = ai.chooseAsk(['🔋', '⚙️'], targets);
        assertTrue(['🔋', '⚙️'].includes(type), `Got ${type}`);
    });

    test('ignores memories about players with no cards', () => {
        const ai = new Opponent(1, firstRng);
        ai.observeAsk(0, '💡');
        const only2 = [{ index: 0, count: 0 }, { index: 2, count: 4 }];
        const { target } = ai.chooseAsk(['🔋', '💡'], only2);
        assertEqual(target, 2);
    });

    test('most recent memory wins', () => {
        const ai = new Opponent(1, firstRng);
        ai.observeAsk(0, '🔋');
        ai.observeAsk(2, '💡');
        const { type, target } = ai.chooseAsk(['🔋', '💡'], targets);
        assertEqual(type, '💡');
        assertEqual(target, 2);
    });

    test('forget removes a memory', () => {
        const ai = new Opponent(1, firstRng);
        ai.observeAsk(0, '💡');
        ai.forget(0, '💡');
        const { type } = ai.chooseAsk(['🔋', '💡'], targets);
        assertEqual(type, '🔋', 'Should fall back to first-in-hand rng pick');
    });

    test('forget only removes that player+type pair', () => {
        const ai = new Opponent(1, firstRng);
        ai.observeAsk(0, '💡');
        ai.observeAsk(2, '💡');
        ai.forget(0, '💡');
        const { target } = ai.chooseAsk(['🔋', '💡'], targets);
        assertEqual(target, 2);
    });

    test('forgetType clears the type for every player', () => {
        const ai = new Opponent(1, firstRng);
        ai.observeAsk(0, '💡');
        ai.observeAsk(2, '💡');
        ai.forgetType('💡');
        assertEqual(ai.memorySize(), 0);
    });

    test('remembering same ask twice does not duplicate', () => {
        const ai = new Opponent(1, firstRng);
        ai.observeAsk(0, '💡');
        ai.observeAsk(0, '💡');
        assertEqual(ai.memorySize(), 1);
    });

    test('memory is capped (no unbounded growth)', () => {
        const ai = new Opponent(1, firstRng);
        for (let i = 0; i < 50; i++) ai.observeAsk(i, '🔋');
        assertTrue(ai.memorySize() <= 8, `Memory size ${ai.memorySize()}`);
    });

    test('hard (chance 1) always remembers', () => {
        const ai = new Opponent(1, () => 0.99);
        ai.observeAsk(0, '💡');
        assertEqual(ai.memorySize(), 1);
    });

    test('easy (chance 0.25) forgets when the roll fails', () => {
        // rng 0.5 >= 0.25 → the ask does not stick
        const ai = new Opponent(0.25, () => 0.5);
        ai.observeAsk(0, '💡');
        assertEqual(ai.memorySize(), 0);
    });

    test('easy (chance 0.25) remembers when the roll succeeds', () => {
        const ai = new Opponent(0.25, () => 0.1);
        ai.observeAsk(0, '💡');
        assertEqual(ai.memorySize(), 1);
    });

    test('medium (chance 0.5) remembers about half the time', () => {
        let calls = 0;
        // Alternates 0.25, 0.75, 0.25, ... → remember, forget, remember...
        const ai = new Opponent(0.5, () => (calls++ % 2 === 0 ? 0.25 : 0.75));
        for (let i = 0; i < 8; i++) ai.observeAsk(i, '🔋');
        assertEqual(ai.memorySize(), 4);
    });

    test('random fallback respects injected rng', () => {
        // rng returning just under 1 → picks last option and last target
        const ai = new Opponent(1, () => 0.999);
        const { type, target } = ai.chooseAsk(['🔋', '💡', '⚙️'], targets);
        assertEqual(type, '⚙️');
        assertEqual(target, 2);
    });

    return results;
}
