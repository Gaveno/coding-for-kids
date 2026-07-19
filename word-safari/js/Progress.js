/**
 * Progress - Saves per-mode level progress and stars to localStorage
 *
 * The player picks a game mode ('read' or 'write') at the start; each mode
 * keeps its own current level so kids can resume either one. Stars are a
 * shared trophy count across both modes.
 */
import { modeRange } from './Words.js';

const STORAGE_KEY = 'word-safari-progress-v2';
const MODES = ['read', 'write'];

export class Progress {
    constructor(storage) {
        // Injectable storage for tests; falls back to localStorage
        this.storage = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
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

        // Clamp each mode's saved level into its own range
        for (const mode of MODES) {
            const { start, end } = modeRange(mode);
            const level = Math.floor(data.levels[mode]);
            data.levels[mode] = Number.isFinite(level)
                ? Math.max(start, Math.min(end, level))
                : start;
            data.done[mode] = data.done[mode] === true;
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
        return this.mode;
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
        this.save();
    }
}
