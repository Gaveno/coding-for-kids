/**
 * Track.js - Manages a single track's note data
 */
class Track {
    constructor(trackNumber, length = 16) {
        this.trackNumber = trackNumber; // 1 = high piano, 2 = low piano, 3 = percussion
        this.length = length;
        this.notes = new Array(length).fill(null);
    }

    /**
     * Set a note at a beat position
     * @param {number} beat - Beat index (0-based)
     * @param {Object|null} noteData - Note data {note, icon, duration, octave} or null to clear
     */
    setNote(beat, noteData) {
        if (beat >= 0 && beat < this.length) {
            this.notes[beat] = noteData;
        }
    }

    /**
     * Set note using legacy parameters (for backwards compatibility)
     * @param {number} beat - Beat index (0-based)
     * @param {string|null} note - Note value or null to clear
     * @param {string} icon - Emoji icon for the note
     * @param {number} duration - Note duration in beats (default 1)
     * @param {number|null} octave - Octave number or null
     */
    setNoteLegacy(beat, note, icon = null, duration = 1, octave = null) {
        if (beat >= 0 && beat < this.length) {
            this.notes[beat] = note ? { note, icon, duration, octave } : null;
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
     * Expand note duration by 1 beat
     * @param {number} beat - Beat index of note to expand
     * @returns {boolean} - Whether expansion succeeded
     */
    expandNote(beat) {
        const note = this.notes[beat];
        if (!note) return false;
        
        const newDuration = (note.duration || 1) + 1;
        const endBeat = beat + newDuration - 1;
        
        // Check if expansion would go out of bounds
        if (endBeat >= this.length) return false;
        
        // Check if expansion would overlap another note
        if (this.notes[endBeat] !== null) return false;
        
        note.duration = newDuration;
        return true;
    }

    /**
     * Shrink note duration by 1 beat
     * @param {number} beat - Beat index of note to shrink
     * @returns {boolean} - Whether shrink succeeded
     */
    shrinkNote(beat) {
        const note = this.notes[beat];
        if (!note) return false;
        
        const currentDuration = note.duration || 1;
        if (currentDuration <= 1) return false;
        
        note.duration = currentDuration - 1;
        return true;
    }

    /**
     * Check if a beat is covered by an extended note starting earlier
     * @param {number} beat - Beat index to check
     * @returns {Object|null} - { startBeat, note } if covered, null otherwise
     */
    getCoveringNote(beat) {
        // Look backwards to find a note that might cover this beat
        for (let i = beat - 1; i >= 0; i--) {
            const note = this.notes[i];
            if (note) {
                const duration = note.duration || 1;
                if (i + duration > beat) {
                    return { startBeat: i, note };
                }
                break; // Found a note that doesn't cover, stop looking
            }
        }
        return null;
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
     * Serialize track to compact array
     * For v3 format, stores note indices instead of note names
     * @returns {Array}
     */
    serialize() {
        const data = [];
        this.notes.forEach((noteData, beat) => {
            if (noteData) {
                // Store with octave for v3 format
                data.push([
                    beat,
                    noteData.note,
                    noteData.icon,
                    noteData.duration || 1,
                    noteData.octave || null
                ]);
            }
        });
        return data;
    }

    /**
     * Deserialize track from array
     * @param {Array} data - Serialized data
     */
    deserialize(data) {
        this.clear();
        if (!Array.isArray(data)) return;
        
        data.forEach(item => {
            if (Array.isArray(item) && item.length >= 3) {
                const [beat, note, icon, duration = 1, octave = null] = item;
                if (beat >= 0 && beat < this.length) {
                    this.notes[beat] = { note, icon, duration, octave };
                }
            }
        });
    }
}

window.Track = Track;
