/**
 * Problems - Pure math problem generation for every track
 *
 * A problem is { opId, symbol, a, b, result, answer } where `answer` is the
 * number the child must produce. Missing-number problems add missing:'a'|'b'
 * and the answer becomes that hidden operand instead of the result.
 */

const randInt = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

export const OPERATIONS = {
    add1: { symbol: '+', example: '3+4' },
    add2: { symbol: '+', example: '25+34' },
    sub1: { symbol: '−', example: '8−3' },
    sub2: { symbol: '−', example: '57−24' },
    mul1: { symbol: '×', example: '3×4' },
    div1: { symbol: '÷', example: '8÷2' }
};

/**
 * Generate one problem for an operation. Subtraction never goes negative;
 * division always divides exactly.
 * @param {string} opId - Key of OPERATIONS
 * @param {Function} [rng] - Injectable random source for tests
 */
export function generateProblem(opId, rng = Math.random) {
    let a, b, q;
    switch (opId) {
        case 'add1':
            a = randInt(rng, 1, 9); b = randInt(rng, 1, 9);
            return build(opId, a, b, a + b);
        case 'add2':
            a = randInt(rng, 10, 99); b = randInt(rng, 10, 99);
            return build(opId, a, b, a + b);
        case 'sub1':
            a = randInt(rng, 1, 9); b = randInt(rng, 1, a);
            return build(opId, a, b, a - b);
        case 'sub2':
            a = randInt(rng, 11, 99); b = randInt(rng, 10, a);
            return build(opId, a, b, a - b);
        case 'mul1':
            a = randInt(rng, 1, 9); b = randInt(rng, 1, 9);
            return build(opId, a, b, a * b);
        case 'div1':
            q = randInt(rng, 1, 9); b = randInt(rng, 2, 9);
            return build(opId, q * b, b, q);
        default:
            throw new Error(`Unknown operation: ${opId}`);
    }
}

function build(opId, a, b, result) {
    return { opId, symbol: OPERATIONS[opId].symbol, a, b, result };
}

/**
 * Generate a problem shaped for a play mode.
 * choice/type: answer is the result. missing: one operand is hidden
 * and becomes the answer (e.g. 4 + ▢ = 6, answer 2).
 * @param {string} opId
 * @param {'choice'|'type'|'missing'} mode
 * @param {Function} [rng]
 */
export function problemFor(opId, mode, rng = Math.random) {
    const problem = generateProblem(opId, rng);
    if (mode === 'missing') {
        problem.missing = rng() < 0.5 ? 'a' : 'b';
        problem.answer = problem[problem.missing];
    } else {
        problem.answer = problem.result;
    }
    return problem;
}

/**
 * Shuffled answer options including the real one - unique, never negative.
 * Distractors sit near the answer so close-but-wrong sums stay tempting.
 * @param {number} answer
 * @param {Function} [rng]
 * @param {number} [count]
 * @returns {number[]}
 */
export function makeChoices(answer, rng = Math.random, count = 4) {
    const near = [-10, -2, -1, 1, 2, 10]
        .map(offset => answer + offset)
        .filter(v => v >= 0 && v !== answer);

    const picks = new Set();
    while (picks.size < count - 1 && near.length > 0) {
        const i = Math.floor(rng() * near.length);
        picks.add(near.splice(i, 1)[0]);
    }
    // Fallback for tiny answers where too few near values survive the filter
    let extra = 3;
    while (picks.size < count - 1) {
        const v = answer + extra;
        if (!picks.has(v)) picks.add(v);
        extra += 2;
    }

    const all = [answer, ...picks];
    for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
}
