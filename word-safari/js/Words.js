/**
 * Words - Level data for Word Safari
 *
 * Three phases of 20 levels, each ramping 2-3 letter words up to 5-6:
 *   'choice' (1-20):  pick the right word from 3 - decoys are any words
 *   'review' (21-40): same words again, but decoys START WITH THE SAME
 *                     LETTER, so the first letter alone isn't enough
 *   'typing' (41-60): fresh words, spell them with the keyboard
 */

/** Phases 1 & 2 - pick the matching word */
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

/** Phase 3 - type the word */
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

/**
 * Extra words used only as wrong answers. Stocked so every choice word
 * has at least 2 decoys sharing its first letter AND length (for the
 * review phase - e.g. ball vs bell vs bath).
 */
const DECOYS = [
    'on', 'of', 'or', 'go', 'in', 'up', 'me', 'we',
    'ant', 'bat', 'bed', 'big', 'bug', 'can', 'cap', 'cot', 'cub', 'cup',
    'den', 'dig', 'dot', 'ear', 'eat', 'elf', 'eye', 'jam', 'leg', 'map',
    'net', 'owl', 'pan', 'pen', 'pin', 'pot', 'sea', 'sit', 'six',
    'bath', 'bell', 'bird', 'boat', 'boot', 'corn', 'dark', 'desk', 'door',
    'dust', 'farm', 'five', 'fork', 'kite', 'nose', 'ring', 'sand', 'sock',
    'step', 'stop', 'wolf',
    'alarm', 'ankle', 'apron', 'bread', 'chair', 'cloud', 'hands', 'happy',
    'heart', 'mouse', 'sheep', 'smile', 'snail', 'stone', 'table', 'teeth',
    'tiger', 'truck', 'whale',
    'basket', 'bottle', 'bubble', 'button', 'candle', 'castle', 'garden',
    'market', 'mitten', 'mother', 'pencil', 'rabbit', 'ribbon', 'rubber',
    'turtle', 'window'
];

export const PHASE_SIZE = CHOICE_WORDS.length;
export const TOTAL_LEVELS = PHASE_SIZE * 2 + TYPING_WORDS.length;

/**
 * The two player-chosen game modes and the level range each one covers:
 *   'read'  - tap the matching word (choice + review sub-phases, levels 1-40)
 *   'write' - spell the word yourself on the keyboard (levels 41-60)
 */
export const GAME_MODES = {
    read:  { start: 1, end: PHASE_SIZE * 2 },
    write: { start: PHASE_SIZE * 2 + 1, end: TOTAL_LEVELS }
};

/** Get the { start, end } level range for a game mode, defaulting to 'read' */
export function modeRange(gameMode) {
    return GAME_MODES[gameMode] || GAME_MODES.read;
}

/** Which play mode a level (1-based) uses: 'choice' | 'review' | 'typing' */
export function getMode(level) {
    if (level < 1 || level > TOTAL_LEVELS) return null;
    if (level <= PHASE_SIZE) return 'choice';
    if (level <= PHASE_SIZE * 2) return 'review';
    return 'typing';
}

/** Get the { word, emoji } entry for a level (1-based), or null */
export function getLevel(level) {
    const mode = getMode(level);
    if (mode === 'choice') return CHOICE_WORDS[level - 1];
    if (mode === 'review') return CHOICE_WORDS[level - PHASE_SIZE - 1];
    if (mode === 'typing') return TYPING_WORDS[level - PHASE_SIZE * 2 - 1];
    return null;
}

/** Every word that can appear as a wrong answer */
function decoyPool() {
    return CHOICE_WORDS.map(e => e.word)
        .concat(TYPING_WORDS.map(e => e.word))
        .concat(DECOYS);
}

/**
 * Build 3 shuffled choices (1 correct + 2 decoys).
 * Decoys prefer the answer's length; with `sameStart` they must also
 * begin with the answer's first letter, so the player has to sound
 * through more than the first letter.
 * @param {string} word - The correct word
 * @param {Object} [options] - { random, sameStart }
 * @returns {string[]} Array of 3 words including `word`
 */
export function getChoices(word, { random = Math.random, sameStart = false } = {}) {
    const pool = decoyPool().filter(w => w !== word);
    const tiers = sameStart
        ? [
            pool.filter(w => w[0] === word[0] && w.length === word.length),
            pool.filter(w => w[0] === word[0]),
            pool.filter(w => w.length === word.length),
            pool
        ]
        : [
            pool.filter(w => w.length === word.length),
            pool
        ];

    const decoys = [];
    for (const tier of tiers) {
        const copy = tier.filter(w => !decoys.includes(w));
        while (decoys.length < 2 && copy.length > 0) {
            const i = Math.floor(random() * copy.length);
            decoys.push(copy.splice(i, 1)[0]);
        }
        if (decoys.length >= 2) break;
    }

    const choices = [word, ...decoys];
    for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return choices;
}
