/**
 * Progress - Saves completed levels and stars to localStorage
 */
import { TOTAL_LEVELS } from './Words.js';

const STORAGE_KEY = 'word-safari-progress-v1';

export class Progress {
    constructor(storage) {
        // Injectable storage for tests; falls back to localStorage
        this.storage = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
        this.data = this.load();
    }

    load() {
        let data = null;
        try {
            data = JSON.parse(this.storage && this.storage.getItem(STORAGE_KEY));
        } catch (e) {
            data = null;
        }
        if (!data || typeof data !== 'object') data = {};
        if (typeof data.level !== 'number') data.level = 1;
        if (typeof data.stars !== 'number') data.stars = 0;
        data.level = Math.max(1, Math.min(TOTAL_LEVELS, Math.floor(data.level)));
        return data;
    }

    save() {
        try {
            if (this.storage) this.storage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            // Private mode / storage full - play on without saving
        }
    }

    /** Current level to play (1-based) */
    getLevel() {
        return this.data.level;
    }

    /** Total stars earned */
    getStars() {
        return this.data.stars;
    }

    /** Record a completed level: earn a star, advance (clamped to last level) */
    completeLevel() {
        this.data.stars += 1;
        this.data.level = Math.min(TOTAL_LEVELS, this.data.level + 1);
        this.save();
    }

    /** True once the final level has been completed at least once */
    isFinished() {
        return this.data.stars >= TOTAL_LEVELS;
    }

    /** Start over from level 1 (keeps stars as a trophy count) */
    restart() {
        this.data.level = 1;
        this.save();
    }
}
