/**
 * Progress - Saves the best star rating per track to localStorage
 *
 * The game passes window.localStorage; tests inject a fake storage
 * object to verify save/load behaviour in isolation.
 */
const STORAGE_KEY = 'math-quest-progress-v1';

export class Progress {
    constructor(storage = null) {
        this.storage = storage;
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
        if (!data.stars || typeof data.stars !== 'object') data.stars = {};
        for (const [track, stars] of Object.entries(data.stars)) {
            if (!Number.isInteger(stars) || stars < 1) delete data.stars[track];
            else data.stars[track] = Math.min(3, stars);
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

    /** Stars earned on a track (0 if never finished) */
    getStars(track) {
        return this.data.stars[track] || 0;
    }

    /** Record a finished track, keeping the best result */
    setStars(track, stars) {
        if (stars > this.getStars(track)) {
            this.data.stars[track] = stars;
            this.save();
        }
    }

    /** Sum of stars across every track (for the header) */
    totalStars() {
        return Object.values(this.data.stars).reduce((sum, n) => sum + n, 0);
    }
}
