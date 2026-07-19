/**
 * Deck - Card definitions and pure deck operations for Robo Go Fish
 */

/** The six robot part types (one card face each) */
export const PART_TYPES = ['⚙️', '🔋', '💡', '🛞', '🔩', '🧲'];

/** Copies of each part in the deck (a full set) */
export const COPIES_PER_TYPE = 4;

/**
 * Build an unshuffled deck: COPIES_PER_TYPE copies of every part type.
 * @returns {string[]}
 */
export function buildDeck() {
    const deck = [];
    PART_TYPES.forEach(type => {
        for (let i = 0; i < COPIES_PER_TYPE; i++) {
            deck.push(type);
        }
    });
    return deck;
}

/**
 * Fisher-Yates shuffle. Pure: returns a new array.
 * @param {string[]} deck
 * @param {() => number} rng - returns [0, 1), injectable for tests
 * @returns {string[]}
 */
export function shuffle(deck, rng = Math.random) {
    const result = [...deck];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Draw the top card. Pure: returns the card and the remaining deck.
 * @param {string[]} deck
 * @returns {{ card: string|null, rest: string[] }}
 */
export function draw(deck) {
    if (deck.length === 0) {
        return { card: null, rest: [] };
    }
    return { card: deck[0], rest: deck.slice(1) };
}
