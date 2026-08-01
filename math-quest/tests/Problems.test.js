/**
 * Tests for Problems module
 */
import { OPERATIONS, generateProblem, problemFor, makeChoices } from '../js/Problems.js';

export function runProblemsTests() {
    const results = [];

    const RUNS = 100;

    test('add1 stays within single digits and sums correctly', () => {
        for (let i = 0; i < RUNS; i++) {
            const p = generateProblem('add1');
            assertTrue(p.a >= 1 && p.a <= 9, `a in range (got ${p.a}).`);
            assertTrue(p.b >= 1 && p.b <= 9, `b in range (got ${p.b}).`);
            assertEqual(p.result, p.a + p.b);
        }
    });

    test('add2 uses two-digit operands', () => {
        for (let i = 0; i < RUNS; i++) {
            const p = generateProblem('add2');
            assertTrue(p.a >= 10 && p.a <= 99, `a in range (got ${p.a}).`);
            assertTrue(p.b >= 10 && p.b <= 99, `b in range (got ${p.b}).`);
            assertEqual(p.result, p.a + p.b);
        }
    });

    test('sub1 never goes negative and subtracts correctly', () => {
        for (let i = 0; i < RUNS; i++) {
            const p = generateProblem('sub1');
            assertTrue(p.a >= 1 && p.a <= 9, `a in range (got ${p.a}).`);
            assertTrue(p.b >= 1 && p.b <= p.a, `b <= a (got ${p.b} > ${p.a}).`);
            assertTrue(p.result >= 0, 'Result is not negative.');
            assertEqual(p.result, p.a - p.b);
        }
    });

    test('sub2 uses two-digit operands and never goes negative', () => {
        for (let i = 0; i < RUNS; i++) {
            const p = generateProblem('sub2');
            assertTrue(p.a >= 11 && p.a <= 99, `a in range (got ${p.a}).`);
            assertTrue(p.b >= 10 && p.b <= p.a, `b <= a (got ${p.b} > ${p.a}).`);
            assertEqual(p.result, p.a - p.b);
        }
    });

    test('mul1 stays within single digits and multiplies correctly', () => {
        for (let i = 0; i < RUNS; i++) {
            const p = generateProblem('mul1');
            assertTrue(p.a >= 1 && p.a <= 9, `a in range (got ${p.a}).`);
            assertTrue(p.b >= 1 && p.b <= 9, `b in range (got ${p.b}).`);
            assertEqual(p.result, p.a * p.b);
        }
    });

    test('div1 always divides exactly with a single-digit answer', () => {
        for (let i = 0; i < RUNS; i++) {
            const p = generateProblem('div1');
            assertTrue(p.b >= 2 && p.b <= 9, `Divisor in range (got ${p.b}).`);
            assertTrue(p.result >= 1 && p.result <= 9, `Quotient in range (got ${p.result}).`);
            assertEqual(p.a, p.b * p.result, 'Dividend divides exactly.');
        }
    });

    test('Unknown operation throws', () => {
        let threw = false;
        try {
            generateProblem('nope');
        } catch (e) {
            threw = true;
        }
        assertTrue(threw, 'Expected generateProblem to throw.');
    });

    test('Every operation has a symbol and example', () => {
        for (const op of Object.values(OPERATIONS)) {
            assertTrue(typeof op.symbol === 'string' && op.symbol.length > 0, 'Has symbol.');
            assertTrue(typeof op.example === 'string' && op.example.length > 0, 'Has example.');
        }
    });

    test('choice/type problems answer with the result', () => {
        for (let i = 0; i < RUNS; i++) {
            const p = problemFor('add1', 'choice');
            assertEqual(p.answer, p.result);
            assertEqual(p.missing, undefined, 'No missing operand.');
        }
    });

    test('missing problems hide one operand and answer with it', () => {
        for (let i = 0; i < RUNS; i++) {
            const p = problemFor('sub1', 'missing');
            assertTrue(p.missing === 'a' || p.missing === 'b', `missing is a|b (got ${p.missing}).`);
            assertEqual(p.answer, p[p.missing]);
        }
    });

    test('missing problems hide both positions over many runs', () => {
        const seen = new Set();
        for (let i = 0; i < RUNS; i++) {
            seen.add(problemFor('add1', 'missing').missing);
        }
        assertTrue(seen.has('a') && seen.has('b'), 'Both operands get hidden.');
    });

    test('makeChoices returns 4 unique options including the answer', () => {
        for (const answer of [0, 1, 5, 12, 42, 198]) {
            for (let i = 0; i < 20; i++) {
                const choices = makeChoices(answer);
                assertEqual(choices.length, 4, `4 choices for ${answer}.`);
                assertEqual(new Set(choices).size, 4, `Unique choices for ${answer}.`);
                assertTrue(choices.includes(answer), `Answer ${answer} included.`);
                assertTrue(choices.every(c => c >= 0), `No negative choices for ${answer}.`);
            }
        }
    });

    test('makeChoices shuffles the answer position', () => {
        const positions = new Set();
        for (let i = 0; i < 60; i++) {
            positions.add(makeChoices(7).indexOf(7));
        }
        assertTrue(positions.size > 1, 'Answer lands in different positions.');
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
