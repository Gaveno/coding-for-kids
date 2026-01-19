/**
 * Track.js - Manages a single track's note data
 */
class Track {
    constructor(trackNumber, length = 16) {
        this.trackNumber = trackNumber; // 1 = high piano, 2 = low piano, 3 = percussion
        this.length = length;
        this.notes = new Array(length).fill(null);
        this.selected = false; // Track selection state for preview
        
        // Track type and configuration (v9)
        this.trackType = this.getDefaultTrackType(trackNumber);
        this.octaveShift = this.getDefaultOctaveShift(trackNumber);
    }

    /**
     * Get default track type based on track number
     * @param {number} trackNumber - Track number
     * @returns {string} - 'piano' or 'percussion'
     */
    getDefaultTrackType(trackNumber) {
        return trackNumber === 3 ? 'percussion' : 'piano';
    }

    /**
     * Get default octave shift based on track number
     * @param {number} trackNumber - Track number
     * @returns {number} - Semitone shift (0 = C4-B4, -12 = C3-B3)
     */
    getDefaultOctaveShift(trackNumber) {
        if (trackNumber === 1) return 0;   // High piano C4-B4
        if (trackNumber === 2) return -12; // Low piano C3-B3
        return 0; // Percussion (no shift)
    }

    /**
     * Get instrument type for audio playback
     * @returns {string} - 'piano' or 'percussion'
     */
    getInstrument() {
        return this.trackType;
    }

    /**
     * Check if this is a piano track
     * @returns {boolean}
     */
    isPiano() {
        return this.trackType === 'piano';
    }

    /**
     * Check if this is a percussion track
     * @returns {boolean}
     */
    isPercussion() {
        return this.trackType === 'percussion';
    }

    /**
     * Set a note at a beat position
     * @param {number} beat - Beat index (0-based)
     * @param {Object|null} noteData - Note data {note, icon, duration, octave, velocity} or null to clear
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
     * @param {number} velocity - Note velocity 0.0-1.0 (default 0.8)
     */
    setNoteLegacy(beat, note, icon = null, duration = 1, octave = null, velocity = 0.8) {
        if (beat >= 0 && beat < this.length) {
            this.notes[beat] = note ? { note, icon, duration, octave, velocity } : null;
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
     * Set velocity for a note
     * @param {number} beat - Beat index of note
     * @param {number} velocity - Velocity value 0.0-1.0
     * @returns {boolean} - Whether velocity was set
     */
    setNoteVelocity(beat, velocity) {
        const note = this.notes[beat];
        if (!note) return false;
        
        note.velocity = Math.max(0, Math.min(1, velocity));
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
     * Select this track (for preview)
     */
    select() {
        this.selected = true;
    }

    /**
     * Deselect this track
     */
    deselect() {
        this.selected = false;
    }

    /**
     * Serialize track to compact array
     * For v4 format, stores note indices with velocity
     * @returns {Array}
     */
    serialize() {
        const data = [];
        this.notes.forEach((noteData, beat) => {
            if (noteData) {
                // Store with octave and velocity for v4 format
                data.push([
                    beat,
                    noteData.note,
                    noteData.icon,
                    noteData.duration || 1,
                    noteData.octave || null,
                    noteData.velocity || 0.8
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
                const [beat, note, icon, duration = 1, octave = null, velocity = 0.8] = item;
                if (beat >= 0 && beat < this.length) {
                    this.notes[beat] = { note, icon, duration, octave, velocity };
                }
            }
        });
    }
}

window.Track = Track;
