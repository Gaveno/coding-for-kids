/**
 * Opponent - The robot's Go Fish brain.
 *
 * Fair and teachable: it only "knows" what any attentive player would —
 * the part types the human has asked about (they must hold those!).
 * Otherwise it guesses randomly from its own hand.
 */
import { typesInHand } from './Hand.js';

const MEMORY_LIMIT = 4;

export class Opponent {
    /**
     * @param {() => number} rng - returns [0, 1), injectable for tests
     */
    constructor(rng = Math.random) {
        this.rng = rng;
        /** Most recent at the end */
        this.memory = [];
    }

    /**
     * The player asked for this type, so they hold at least one.
     * @param {string} type
     */
    rememberAsk(type) {
        this.memory = this.memory.filter(t => t !== type);
        this.memory.push(type);
        if (this.memory.length > MEMORY_LIMIT) {
            this.memory.shift();
        }
    }

    /**
     * Drop a memory (used it, or learned it is stale).
     * @param {string} type
     */
    forget(type) {
        this.memory = this.memory.filter(t => t !== type);
    }

    /** @returns {number} */
    memorySize() {
        return this.memory.length;
    }

    /**
     * Pick a type to ask for. Must be a type in its own hand.
     * Prefers the most recently remembered player type; falls back to random.
     * @param {string[]} hand - the robot's hand
     * @returns {string|null}
     */
    chooseAsk(hand) {
        const options = typesInHand(hand);
        if (options.length === 0) {
            return null;
        }

        for (let i = this.memory.length - 1; i >= 0; i--) {
            if (options.includes(this.memory[i])) {
                return this.memory[i];
            }
        }

        return options[Math.floor(this.rng() * options.length)];
    }
}
