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

    // rng that always returns 0 → picks first option
    const firstRng = () => 0;

    test('chooseAsk returns a type from its own hand', () => {
        const ai = new Opponent(firstRng);
        const type = ai.chooseAsk(['🔋', '💡']);
        assertTrue(['🔋', '💡'].includes(type), `Got ${type}`);
    });

    test('chooseAsk returns null for empty hand', () => {
        const ai = new Opponent(firstRng);
        assertEqual(ai.chooseAsk([]), null);
    });

    test('prefers a remembered type it also holds', () => {
        const ai = new Opponent(firstRng);
        ai.rememberAsk('💡');
        const type = ai.chooseAsk(['🔋', '💡', '⚙️']);
        assertEqual(type, '💡');
    });

    test('ignores remembered types it does not hold', () => {
        const ai = new Opponent(firstRng);
        ai.rememberAsk('🧲');
        const type = ai.chooseAsk(['🔋', '⚙️']);
        assertTrue(['🔋', '⚙️'].includes(type), `Got ${type}`);
    });

    test('most recent memory wins', () => {
        const ai = new Opponent(firstRng);
        ai.rememberAsk('🔋');
        ai.rememberAsk('💡');
        assertEqual(ai.chooseAsk(['🔋', '💡']), '💡');
    });

    test('forget removes a memory', () => {
        const ai = new Opponent(firstRng);
        ai.rememberAsk('💡');
        ai.forget('💡');
        const type = ai.chooseAsk(['🔋', '💡']);
        assertEqual(type, '🔋', 'Should fall back to first-in-hand rng pick');
    });

    test('remembering same type twice does not duplicate', () => {
        const ai = new Opponent(firstRng);
        ai.rememberAsk('💡');
        ai.rememberAsk('💡');
        ai.forget('💡');
        assertEqual(ai.chooseAsk(['🔋', '💡']), '🔋');
    });

    test('memory is capped (no unbounded growth)', () => {
        const ai = new Opponent(firstRng);
        for (let i = 0; i < 50; i++) ai.rememberAsk('🔋');
        ai.rememberAsk('💡');
        assertTrue(ai.memorySize() <= 4, `Memory size ${ai.memorySize()}`);
    });

    test('random fallback respects injected rng', () => {
        // rng returning just under 1 → picks last option
        const ai = new Opponent(() => 0.999);
        assertEqual(ai.chooseAsk(['🔋', '💡', '⚙️']), '⚙️');
    });

    return results;
}
