/**
 * Opponent - A robot's Go Fish brain (multiplayer).
 *
 * Fair and teachable: it only "knows" what any attentive player would —
 * the part types other players have asked about (they must hold those!).
 * Otherwise it guesses a random type from its own hand and a random target.
 *
 * Difficulty = how reliable the robot's memory is. Each time an ask is
 * made, the robot rolls: with `rememberChance` probability it records the
 * ask, otherwise it forgets it ever happened.
 *   hard   → 1.0  (always remembers)
 *   medium → 0.5  (50% chance to NOT remember)
 *   easy   → 0.25 (75% chance to NOT remember)
 */

import { typesInHand } from './Hand.js';

const MEMORY_LIMIT = 8;

export class Opponent {
    /**
     * @param {number} rememberChance - probability [0,1] of remembering an ask
     * @param {() => number} rng - returns [0, 1), injectable for tests
     */
    constructor(rememberChance = 1, rng = Math.random) {
        this.rememberChance = rememberChance;
        this.rng = rng;
        /** @type {{player: number, type: string}[]} Most recent at the end */
        this.memory = [];
    }

    /**
     * Another player asked for this type, so they hold at least one.
     * Subject to the difficulty memory roll.
     * @param {number} player - index of the player who asked
     * @param {string} type
     */
    observeAsk(player, type) {
        if (this.rng() >= this.rememberChance) return; // didn't stick!
        this.memory = this.memory.filter(
            m => !(m.player === player && m.type === type)
        );
        this.memory.push({ player, type });
        if (this.memory.length > MEMORY_LIMIT) {
            this.memory.shift();
        }
    }

    /**
     * Drop a memory about one player+type (used it, or learned it is stale).
     * @param {number} player
     * @param {string} type
     */
    forget(player, type) {
        this.memory = this.memory.filter(
            m => !(m.player === player && m.type === type)
        );
    }

    /**
     * A set of this type was laid down — nobody holds it anymore.
     * @param {string} type
     */
    forgetType(type) {
        this.memory = this.memory.filter(m => m.type !== type);
    }

    /** @returns {number} */
    memorySize() {
        return this.memory.length;
    }

    /**
     * Pick a type to ask for and who to ask. Must be a type in its own hand
     * and a target holding at least one card.
     * Prefers the most recent remembered ask; falls back to random.
     * @param {string[]} hand - the robot's own hand
     * @param {{index: number, count: number}[]} targets - opponents with card counts
     * @returns {{type: string, target: number}|null}
     */
    chooseAsk(hand, targets) {
        const options = typesInHand(hand);
        const askable = targets.filter(t => t.count > 0);
        if (options.length === 0 || askable.length === 0) {
            return null;
        }

        for (let i = this.memory.length - 1; i >= 0; i--) {
            const { player, type } = this.memory[i];
            if (options.includes(type) && askable.some(t => t.index === player)) {
                return { type, target: player };
            }
        }

        const type = options[Math.floor(this.rng() * options.length)];
        const target = askable[Math.floor(this.rng() * askable.length)].index;
        return { type, target };
    }
}
