/**
 * Progress - Tracks per-mode level and stars for the current session
 *
 * The player picks a game mode ('read' or 'write') at the start; each mode
 * keeps its own current level. Progress is NOT persisted across page loads so
 * kids always start fresh and the word order is newly randomised each visit.
 * Tests can inject a storage object to verify save/load behaviour in isolation.
 */
import { modeRange, makeOrder, phaseWordCount } from './Words.js';

const STORAGE_KEY = 'word-safari-progress-v2';
const MODES = ['read', 'write'];

/** True if `order` is a permutation of 0..count-1 */
function isValidOrder(order, count) {
    if (!Array.isArray(order) || order.length !== count) return false;
    const seen = new Set(order);
    if (seen.size !== count) return false;
    return order.every(n => Number.isInteger(n) && n >= 0 && n < count);
}

export class Progress {
    constructor(storage) {
        // Injectable storage for tests; defaults to null (no persistence) in the game
        this.storage = storage || null;
        this.data = this.load();
        this.mode = 'read';
    }

    load() {
        let data = null;
        try {
            data = JSON.parse(this.storage && this.storage.getItem(STORAGE_KEY));
        } catch (e) {
            data = null;
        }
        if (!data || typeof data !== 'object') data = {};
        if (typeof data.stars !== 'number') data.stars = 0;
        if (!data.levels || typeof data.levels !== 'object') data.levels = {};
        if (!data.done || typeof data.done !== 'object') data.done = {};
        if (!data.order || typeof data.order !== 'object') data.order = {};

        // Clamp each mode's saved level into its own range; drop bad orders
        for (const mode of MODES) {
            const { start, end } = modeRange(mode);
            const level = Math.floor(data.levels[mode]);
            data.levels[mode] = Number.isFinite(level)
                ? Math.max(start, Math.min(end, level))
                : start;
            data.done[mode] = data.done[mode] === true;
            if (!isValidOrder(data.order[mode], phaseWordCount(mode))) {
                data.order[mode] = null;
            }
        }
        return data;
    }

    save() {
        try {
            if (this.storage) this.storage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            // Private mode / storage full - play on without saving
        }
    }

    /**
     * Choose which mode to play. Resumes the saved level, or restarts from
     * the first level if that mode was already finished.
     * @param {'read'|'write'} mode
     * @returns {string} The active mode after normalising
     */
    startMode(mode) {
        this.mode = MODES.includes(mode) ? mode : 'read';
        if (this.data.done[this.mode]) this.restart();
        else this.ensureOrder();
        return this.mode;
    }

    /** Make sure the active mode has a play order, generating one if needed */
    ensureOrder() {
        if (!this.data.order[this.mode]) {
            this.data.order[this.mode] = makeOrder(this.mode);
            this.save();
        }
    }

    /** The shuffled word order for the active mode (for getLevel) */
    getOrder() {
        return this.data.order[this.mode];
    }

    /** The currently selected game mode ('read' | 'write') */
    getMode() {
        return this.mode;
    }

    /** { start, end } level range for the active mode */
    range() {
        return modeRange(this.mode);
    }

    /** Current level to play (1-based) within the active mode */
    getLevel() {
        return this.data.levels[this.mode];
    }

    /** True when the current level is the last one in the active mode */
    isLastLevel() {
        return this.getLevel() >= this.range().end;
    }

    /** Total stars earned across all modes */
    getStars() {
        return this.data.stars;
    }

    /** Record a completed level: earn a star, advance within the active mode */
    completeLevel() {
        this.data.stars += 1;
        if (this.isLastLevel()) {
            this.data.done[this.mode] = true;
        } else {
            this.data.levels[this.mode] += 1;
        }
        this.save();
    }

    /** True once the active mode's final level has been completed */
    isFinished() {
        return this.data.done[this.mode] === true;
    }

    /** Start the active mode over from its first level (keeps stars) */
    restart() {
        this.data.levels[this.mode] = this.range().start;
        this.data.done[this.mode] = false;
        this.data.order[this.mode] = makeOrder(this.mode);
        this.save();
    }
}
