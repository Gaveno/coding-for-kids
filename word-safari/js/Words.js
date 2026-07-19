/**
 * Words - Level logic for Word Safari (word data lives in WordData.js)
 *
 * Two player-chosen modes, each ramping 2-3 letter words up to 6:
 *   'read'  - tap the matching word. Runs a 'choice' sub-phase (decoys are
 *             any words) then a tricky 'review' sub-phase where decoys START
 *             WITH THE SAME LETTER, so the first letter alone isn't enough.
 *   'write' - fresh words, spell them with the keyboard.
 *
 * Word lists are kept in ascending length order (easy -> hard). The play
 * order is shuffled WITHIN each length band every session (see makeOrder),
 * so kids can't just memorise the sequence but the difficulty still ramps.
 */
import { CHOICE_WORDS, TYPING_WORDS, DECOYS } from './WordData.js';

// Re-export the word lists so callers can keep importing from Words.js
export { CHOICE_WORDS, TYPING_WORDS } from './WordData.js';

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

/** How many unique picture words a game mode draws from */
export function phaseWordCount(gameMode) {
    return gameMode === 'write' ? TYPING_WORDS.length : CHOICE_WORDS.length;
}

/**
 * Build a play order for a mode's words: a permutation of word indices
 * shuffled WITHIN each word-length band. Every play-through varies, but
 * because the lists are stored shortest-first the easy->hard ramp survives.
 * @param {'read'|'write'} gameMode
 * @param {Function} [random] - injectable RNG (defaults to Math.random)
 * @returns {number[]} permutation of 0..count-1
 */
export function makeOrder(gameMode, random = Math.random) {
    const words = gameMode === 'write' ? TYPING_WORDS : CHOICE_WORDS;
    const bands = new Map();
    words.forEach((entry, i) => {
        const len = entry.word.length;
        if (!bands.has(len)) bands.set(len, []);
        bands.get(len).push(i);
    });
    const order = [];
    for (const idxs of bands.values()) {
        for (let i = idxs.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
        }
        order.push(...idxs);
    }
    return order;
}

/** Which play mode a level (1-based) uses: 'choice' | 'review' | 'typing' */
export function getMode(level) {
    if (level < 1 || level > TOTAL_LEVELS) return null;
    if (level <= PHASE_SIZE) return 'choice';
    if (level <= PHASE_SIZE * 2) return 'review';
    return 'typing';
}

/**
 * Get the { word, emoji } entry for a level (1-based), or null.
 * Pass a play `order` (from makeOrder) to walk the words in a shuffled
 * sequence; omit it to use the natural shortest-first order.
 */
export function getLevel(level, order = null) {
    const mode = getMode(level);
    if (mode === 'choice') return orderedEntry(CHOICE_WORDS, level - 1, order);
    if (mode === 'review') return orderedEntry(CHOICE_WORDS, level - PHASE_SIZE - 1, order);
    if (mode === 'typing') return orderedEntry(TYPING_WORDS, level - PHASE_SIZE * 2 - 1, order);
    return null;
}

/** Look up a phase word by position, remapped through an optional order */
function orderedEntry(words, position, order) {
    const index = Array.isArray(order) && order.length === words.length
        ? order[position]
        : position;
    return words[index];
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
