/**
 * Tests for the Words module
 */
import {
    CHOICE_WORDS, TYPING_WORDS, TOTAL_LEVELS, PHASE_SIZE,
    getMode, getLevel, getChoices
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

    test('There are 3 phases of 20 levels (60 total)', () => {
        assertEqual(CHOICE_WORDS.length, 20);
        assertEqual(TYPING_WORDS.length, 20);
        assertEqual(PHASE_SIZE, 20);
        assertEqual(TOTAL_LEVELS, 60);
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
        assertTrue(CHOICE_WORDS[19].word.length >= 5, 'Last choice word too short.');
        for (let i = 1; i < CHOICE_WORDS.length; i++) {
            assertTrue(
                CHOICE_WORDS[i].word.length >= CHOICE_WORDS[i - 1].word.length,
                `Choice ramp breaks at level ${i + 1}.`
            );
        }
    });

    test('Typing phase resets to short words then ramps up again', () => {
        assertTrue(TYPING_WORDS[0].word.length <= 3, 'Typing phase should restart short.');
        assertTrue(TYPING_WORDS[19].word.length >= 5, 'Last typing word too short.');
        for (let i = 1; i < TYPING_WORDS.length; i++) {
            assertTrue(
                TYPING_WORDS[i].word.length >= TYPING_WORDS[i - 1].word.length,
                `Typing ramp breaks at level ${i + 1}.`
            );
        }
    });

    test('No word appears in both choice and typing phases', () => {
        const choice = new Set(CHOICE_WORDS.map(e => e.word));
        TYPING_WORDS.forEach(e => {
            assertTrue(!choice.has(e.word), `"${e.word}" appears in both phases.`);
        });
    });

    test('getMode splits the phases at 20/21 and 40/41', () => {
        assertEqual(getMode(1), 'choice');
        assertEqual(getMode(20), 'choice');
        assertEqual(getMode(21), 'review');
        assertEqual(getMode(40), 'review');
        assertEqual(getMode(41), 'typing');
        assertEqual(getMode(60), 'typing');
        assertEqual(getMode(0), null);
        assertEqual(getMode(61), null);
    });

    test('Review levels repeat the choice words in order', () => {
        for (let i = 0; i < PHASE_SIZE; i++) {
            assertEqual(getLevel(21 + i).word, CHOICE_WORDS[i].word, `Review level ${21 + i}:`);
        }
    });

    test('getLevel returns null past the last level', () => {
        assertEqual(getLevel(61), null);
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
