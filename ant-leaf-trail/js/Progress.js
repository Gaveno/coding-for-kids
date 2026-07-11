/**
 * Progress - Saves stars, unlocks, and the sandbox layout to localStorage
 */
const STORAGE_KEY = 'ant-leaf-trail-progress-v1';

export class Progress {
    constructor() {
        this.data = this.load();
    }

    load() {
        let data = null;
        try {
            data = JSON.parse(localStorage.getItem(STORAGE_KEY));
        } catch (e) {
            data = null;
        }
        if (!data || typeof data !== 'object') data = {};
        if (!data.stars || typeof data.stars !== 'object') data.stars = {};
        if (!('sandbox' in data)) data.sandbox = null;
        return data;
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            // Private mode / storage full - play on without saving
        }
    }

    getStars(level) {
        return this.data.stars[level] || 0;
    }

    /** Keeps the best result */
    setStars(level, stars) {
        if (stars > this.getStars(level)) {
            this.data.stars[level] = stars;
            this.save();
        }
    }

    /** Level 1 is always open; others unlock when the previous level is done */
    isUnlocked(level) {
        return level === 1 || this.getStars(level - 1) > 0;
    }

    saveSandbox(layout) {
        this.data.sandbox = layout;
        this.save();
    }

    getSandbox() {
        return this.data.sandbox;
    }
}
