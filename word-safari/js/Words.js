/**
 * Words - Level data for Word Safari
 *
 * Two phases, each ramping from 2-3 letter words up to 5-6 letter words:
 *   Phase 1 (choice): see the picture, pick the right word from 3 choices
 *   Phase 2 (typing): see the picture, spell the word with the keyboard
 */

/** Phase 1 - pick the matching word (levels 1-20) */
export const CHOICE_WORDS = [
    { word: 'ox',     emoji: '🐂' },
    { word: 'cat',    emoji: '🐱' },
    { word: 'dog',    emoji: '🐶' },
    { word: 'sun',    emoji: '☀️' },
    { word: 'bee',    emoji: '🐝' },
    { word: 'pig',    emoji: '🐷' },
    { word: 'egg',    emoji: '🥚' },
    { word: 'fish',   emoji: '🐟' },
    { word: 'frog',   emoji: '🐸' },
    { word: 'duck',   emoji: '🦆' },
    { word: 'star',   emoji: '⭐' },
    { word: 'book',   emoji: '📖' },
    { word: 'ball',   emoji: '⚽' },
    { word: 'apple',  emoji: '🍎' },
    { word: 'house',  emoji: '🏠' },
    { word: 'snake',  emoji: '🐍' },
    { word: 'train',  emoji: '🚂' },
    { word: 'banana', emoji: '🍌' },
    { word: 'monkey', emoji: '🐵' },
    { word: 'rocket', emoji: '🚀' }
];

/** Phase 2 - type the word (levels 21-40) */
export const TYPING_WORDS = [
    { word: 'ax',     emoji: '🪓' },
    { word: 'cow',    emoji: '🐮' },
    { word: 'fox',    emoji: '🦊' },
    { word: 'hat',    emoji: '🎩' },
    { word: 'car',    emoji: '🚗' },
    { word: 'bus',    emoji: '🚌' },
    { word: 'key',    emoji: '🔑' },
    { word: 'moon',   emoji: '🌙' },
    { word: 'cake',   emoji: '🎂' },
    { word: 'tree',   emoji: '🌳' },
    { word: 'milk',   emoji: '🥛' },
    { word: 'lion',   emoji: '🦁' },
    { word: 'ship',   emoji: '🚢' },
    { word: 'horse',  emoji: '🐴' },
    { word: 'pizza',  emoji: '🍕' },
    { word: 'robot',  emoji: '🤖' },
    { word: 'clock',  emoji: '⏰' },
    { word: 'flower', emoji: '🌸' },
    { word: 'spider', emoji: '🕷️' },
    { word: 'orange', emoji: '🍊' }
];

/** Extra words used only as wrong answers in choice levels */
const DECOYS = [
    'ant', 'bed', 'cup', 'eye', 'jam', 'leg', 'map', 'net', 'owl', 'pen',
    'bird', 'boat', 'corn', 'door', 'kite', 'nose', 'ring', 'sock', 'wolf',
    'bread', 'chair', 'cloud', 'mouse', 'sheep', 'tiger', 'whale',
    'candle', 'castle', 'garden', 'pencil', 'turtle', 'window',
    'go', 'in', 'up', 'me', 'we'
];

export const TOTAL_LEVELS = CHOICE_WORDS.length + TYPING_WORDS.length;

/** True when a level (1-based) is a word-choice level */
export function isChoiceLevel(level) {
    return level >= 1 && level <= CHOICE_WORDS.length;
}

/** Get the { word, emoji } entry for a level (1-based), or null */
export function getLevel(level) {
    if (isChoiceLevel(level)) return CHOICE_WORDS[level - 1];
    const i = level - CHOICE_WORDS.length - 1;
    return TYPING_WORDS[i] || null;
}

/** Every word that can appear as a wrong answer */
function decoyPool() {
    return CHOICE_WORDS.map(e => e.word)
        .concat(TYPING_WORDS.map(e => e.word))
        .concat(DECOYS);
}

/**
 * Build 3 shuffled choices (1 correct + 2 same-length decoys).
 * @param {string} word - The correct word
 * @param {Function} random - RNG returning [0,1), injectable for tests
 * @returns {string[]} Array of 3 words including `word`
 */
export function getChoices(word, random = Math.random) {
    const sameLength = decoyPool().filter(w => w !== word && w.length === word.length);
    const anyLength = decoyPool().filter(w => w !== word);
    const pool = sameLength.length >= 2 ? sameLength : anyLength;

    const decoys = [];
    const copy = pool.slice();
    while (decoys.length < 2 && copy.length > 0) {
        const i = Math.floor(random() * copy.length);
        const pick = copy.splice(i, 1)[0];
        if (!decoys.includes(pick)) decoys.push(pick);
    }

    const choices = [word, ...decoys];
    for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return choices;
}
