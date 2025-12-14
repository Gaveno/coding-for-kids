/**
 * Track.js - Manages a single track's note data
 */
class Track {
    constructor(type, length = 16) {
        this.type = type; // 'melody', 'bass', or 'percussion'
        this.length = length;
        this.notes = new Array(length).fill(null);
    }

    /**
     * Set a note at a beat position
     * @param {number} beat - Beat index (0-based)
     * @param {string|null} note - Note value or null to clear
     * @param {string} icon - Emoji icon for the note
     */
    setNote(beat, note, icon = null) {
        if (beat >= 0 && beat < this.length) {
            this.notes[beat] = note ? { note, icon } : null;
        }
    }

    /**
     * Get note at beat position
     * @param {number} beat - Beat index
     * @returns {Object|null} - Note object or null
     */
    getNote(beat) {
        return this.notes[beat] || null;
    }

    /**
     * Check if beat has a note
     * @param {number} beat - Beat index
     * @returns {boolean}
     */
    hasNote(beat) {
        return this.notes[beat] !== null;
    }

    /**
     * Clear note at beat position
     * @param {number} beat - Beat index
     */
    clearNote(beat) {
        if (beat >= 0 && beat < this.length) {
            this.notes[beat] = null;
        }
    }

    /**
     * Clear all notes
     */
    clear() {
        this.notes = new Array(this.length).fill(null);
    }

    /**
     * Resize track length
     * @param {number} newLength - New length
     */
    resize(newLength) {
        if (newLength > this.length) {
            // Extend with nulls
            this.notes = [...this.notes, ...new Array(newLength - this.length).fill(null)];
        } else if (newLength < this.length) {
            // Truncate
            this.notes = this.notes.slice(0, newLength);
        }
        this.length = newLength;
    }

    /**
     * Check if track is empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.notes.every(n => n === null);
    }

    /**
     * Get all notes as array
     * @returns {Array}
     */
    getNotes() {
        return [...this.notes];
    }

    /**
     * Serialize track to compact array of [beat, note, icon] tuples
     * Only includes beats that have notes
     * @returns {Array}
     */
    serialize() {
        const data = [];
        this.notes.forEach((note, beat) => {
            if (note) {
                data.push([beat, note.note, note.icon]);
            }
        });
        return data;
    }

    /**
     * Deserialize track from array of [beat, note, icon] tuples
     * @param {Array} data - Serialized data
     */
    deserialize(data) {
        this.clear();
        if (!Array.isArray(data)) return;
        
        data.forEach(item => {
            if (Array.isArray(item) && item.length >= 3) {
                const [beat, note, icon] = item;
                if (beat >= 0 && beat < this.length) {
                    this.notes[beat] = { note, icon };
                }
            }
        });
    }
}

window.Track = Track;
