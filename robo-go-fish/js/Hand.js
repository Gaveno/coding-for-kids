/**
 * Hand - Pure helpers for hands of cards (arrays of part-type strings)
 */
import { COPIES_PER_TYPE } from './Deck.js';

/**
 * Count copies of a type in a hand.
 * @param {string[]} hand
 * @param {string} type
 * @returns {number}
 */
export function countType(hand, type) {
    return hand.filter(card => card === type).length;
}

/**
 * Unique types present in a hand, in first-seen order.
 * @param {string[]} hand
 * @returns {string[]}
 */
export function typesInHand(hand) {
    return [...new Set(hand)];
}

/**
 * @param {string[]} hand
 * @param {string} type
 * @returns {boolean}
 */
export function hasType(hand, type) {
    return hand.includes(type);
}

/**
 * Add cards to a hand. Pure: returns a new hand.
 * @param {string[]} hand
 * @param {string[]} cards
 * @returns {string[]}
 */
export function addCards(hand, cards) {
    return [...hand, ...cards];
}

/**
 * Remove all copies of a type. Pure.
 * @param {string[]} hand
 * @param {string} type
 * @returns {{ removed: string[], hand: string[] }}
 */
export function removeType(hand, type) {
    return {
        removed: hand.filter(card => card === type),
        hand: hand.filter(card => card !== type)
    };
}

/**
 * Types that form a complete set (COPIES_PER_TYPE copies).
 * @param {string[]} hand
 * @returns {string[]}
 */
export function completedSets(hand) {
    return typesInHand(hand).filter(
        type => countType(hand, type) >= COPIES_PER_TYPE
    );
}

/**
 * Remove a completed set from the hand. Pure.
 * @param {string[]} hand
 * @param {string} type
 * @returns {string[]}
 */
export function extractSet(hand, type) {
    return removeType(hand, type).hand;
}
