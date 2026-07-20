/**
 * Tests for the Words module
 */
import {
    CHOICE_WORDS, TYPING_WORDS, TOTAL_LEVELS, PHASE_SIZE,
    getMode, getLevel, getChoices, makeOrder
} from '../js/Words.js';

export function runWordsTests() {
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

    /** Simple seeded RNG so choice tests are deterministic */
    function seededRandom(seed) {
        let s = seed;
        return () => {
            s = (s * 1664525 + 1013904223) % 4294967296;
            return s / 4294967296;
        };
    }

    test('Read and write modes share one master word list', () => {
        assertEqual(CHOICE_WORDS.length, 70);
        assertEqual(TYPING_WORDS.length, 70);
        assertEqual(PHASE_SIZE, 70);
        assertEqual(TOTAL_LEVELS, PHASE_SIZE * 2 + TYPING_WORDS.length);
    });

    test('Every level has a lowercase word and an emoji', () => {
        for (let level = 1; level <= TOTAL_LEVELS; level++) {
            const entry = getLevel(level);
            assertTrue(!!entry, `Level ${level} missing.`);
            assertTrue(entry.word === entry.word.toLowerCase(), `Level ${level} not lowercase.`);
            assertTrue(/^[a-z]{2,6}$/.test(entry.word), `Level ${level} word "${entry.word}" invalid.`);
            assertTrue(entry.emoji.length > 0, `Level ${level} has no emoji.`);
        }
    });

    test('Choice phase ramps from short words to long words', () => {
        assertTrue(CHOICE_WORDS[0].word.length <= 3, 'First choice word too long.');
        assertTrue(CHOICE_WORDS[CHOICE_WORDS.length - 1].word.length >= 5, 'Last choice word too short.');
        for (let i = 1; i < CHOICE_WORDS.length; i++) {
            assertTrue(
                CHOICE_WORDS[i].word.length >= CHOICE_WORDS[i - 1].word.length,
                `Choice ramp breaks at level ${i + 1}.`
            );
        }
    });

    test('Typing phase resets to short words then ramps up again', () => {
        assertTrue(TYPING_WORDS[0].word.length <= 3, 'Typing phase should restart short.');
        assertTrue(TYPING_WORDS[TYPING_WORDS.length - 1].word.length >= 5, 'Last typing word too short.');
        for (let i = 1; i < TYPING_WORDS.length; i++) {
            assertTrue(
                TYPING_WORDS[i].word.length >= TYPING_WORDS[i - 1].word.length,
                `Typing ramp breaks at level ${i + 1}.`
            );
        }
    });

    test('Every word appears in both reading and writing sets', () => {
        assertEqual(CHOICE_WORDS.length, TYPING_WORDS.length, 'Sets differ in size.');
        const typing = new Set(TYPING_WORDS.map(e => e.word));
        CHOICE_WORDS.forEach(e => {
            assertTrue(typing.has(e.word), `"${e.word}" missing from writing set.`);
        });
    });

    test('getMode splits choice/review/typing at the phase edges', () => {
        assertEqual(getMode(1), 'choice');
        assertEqual(getMode(PHASE_SIZE), 'choice');
        assertEqual(getMode(PHASE_SIZE + 1), 'review');
        assertEqual(getMode(PHASE_SIZE * 2), 'review');
        assertEqual(getMode(PHASE_SIZE * 2 + 1), 'typing');
        assertEqual(getMode(TOTAL_LEVELS), 'typing');
        assertEqual(getMode(0), null);
        assertEqual(getMode(TOTAL_LEVELS + 1), null);
    });

    test('Review levels repeat the choice words in order', () => {
        for (let i = 0; i < PHASE_SIZE; i++) {
            assertEqual(
                getLevel(PHASE_SIZE + 1 + i).word, CHOICE_WORDS[i].word,
                `Review level ${PHASE_SIZE + 1 + i}:`
            );
        }
    });

    test('getLevel returns null past the last level', () => {
        assertEqual(getLevel(TOTAL_LEVELS + 1), null);
    });

    test('getLevel maps positions through a supplied word order', () => {
        const reverse = CHOICE_WORDS.map((_, i) => CHOICE_WORDS.length - 1 - i);
        assertEqual(getLevel(1, reverse).word, CHOICE_WORDS[reverse[0]].word);
        // Review reuses the same order, so it lines up with the choice sub-phase
        assertEqual(getLevel(PHASE_SIZE + 1, reverse).word, CHOICE_WORDS[reverse[0]].word);
    });

    test('makeOrder shuffles within length bands but keeps the ramp', () => {
        const order = makeOrder('read', seededRandom(3));
        assertEqual(order.length, CHOICE_WORDS.length, 'Order length differs.');
        assertEqual(new Set(order).size, CHOICE_WORDS.length, 'Order is not a permutation.');
        let prev = 0;
        order.forEach(idx => {
            const len = CHOICE_WORDS[idx].word.length;
            assertTrue(len >= prev, 'Length ramp broken by the shuffle.');
            prev = len;
        });
    });

    test('makeOrder varies the order between sessions', () => {
        const a = makeOrder('read', seededRandom(1)).join(',');
        const b = makeOrder('read', seededRandom(9)).join(',');
        assertTrue(a !== b, 'Order did not change between sessions.');
    });

    test('getChoices returns 3 unique options including the answer', () => {
        for (let seed = 1; seed <= 30; seed++) {
            const choices = getChoices('cat', { random: seededRandom(seed) });
            assertEqual(choices.length, 3, 'Wrong choice count.');
            assertEqual(new Set(choices).size, 3, 'Choices not unique.');
            assertTrue(choices.includes('cat'), 'Answer missing from choices.');
        }
    });

    test('Decoys match the answer word length for every choice level', () => {
        CHOICE_WORDS.forEach(({ word }) => {
            const choices = getChoices(word, { random: seededRandom(7) });
            choices.forEach(c => {
                assertEqual(c.length, word.length, `Decoy "${c}" length differs from "${word}".`);
            });
        });
    });

    test('Review decoys share first letter AND length for every word', () => {
        CHOICE_WORDS.forEach(({ word }) => {
            for (let seed = 1; seed <= 10; seed++) {
                const choices = getChoices(word, { random: seededRandom(seed), sameStart: true });
                assertEqual(choices.length, 3, `"${word}" wrong choice count.`);
                assertTrue(choices.includes(word), `"${word}" missing from its choices.`);
                choices.forEach(c => {
                    assertEqual(c[0], word[0], `Decoy "${c}" starts differently from "${word}".`);
                    assertEqual(c.length, word.length, `Decoy "${c}" length differs from "${word}".`);
                });
            }
        });
    });

    test('The answer position varies (choices are shuffled)', () => {
        const positions = new Set();
        for (let seed = 1; seed <= 50; seed++) {
            positions.add(getChoices('dog', { random: seededRandom(seed) }).indexOf('dog'));
        }
        assertTrue(positions.size > 1, 'Answer is always in the same slot.');
    });

    return results;
}
