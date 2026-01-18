/**
 * Pattern.js - Musical pattern data model
 * Represents a reusable musical pattern (function/loop concept)
 */

class Pattern {
    constructor({ id, name, icon, color, length, tracks, isPreset = false, created = Date.now(), index }) {
        this.id = id || this.generateId();
        this.name = name;
        this.icon = icon;
        this.color = color;
        this.length = length;
        this.tracks = tracks || { 1: [], 2: [], 3: [] };
        this.isPreset = isPreset;
        this.created = created;
        this.index = index; // Optional: used for custom patterns (0-7)

        this.validate();
    }

    /**
     * Generate unique pattern ID
     */
    generateId() {
        return `p${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Validate pattern structure
     */
    validate() {
        if (!this.name || typeof this.name !== 'string') {
            throw new Error('Pattern must have a valid name');
        }
        if (!this.icon || typeof this.icon !== 'string') {
            throw new Error('Pattern must have a valid icon');
        }
        if (!this.color || typeof this.color !== 'string') {
            throw new Error('Pattern must have a valid color');
        }
        if (!Number.isInteger(this.length) || this.length < 1 || this.length > 16) {
            throw new Error('Pattern length must be between 1 and 16 beats');
        }
        if (!this.tracks || typeof this.tracks !== 'object') {
            throw new Error('Pattern must have tracks object');
        }

        // Validate each track
        for (const trackId in this.tracks) {
            const track = this.tracks[trackId];
            if (!Array.isArray(track)) {
                throw new Error(`Track ${trackId} must be an array`);
            }
            // Validate each note in track
            for (const note of track) {
                if (!Array.isArray(note) || note.length !== 3) {
                    throw new Error(`Invalid note format in track ${trackId}`);
                }
                const [beat, noteIndex, duration] = note;
                if (typeof beat !== 'number' || beat < 0 || beat >= this.length) {
                    throw new Error(`Invalid beat ${beat} in track ${trackId} (pattern length: ${this.length})`);
                }
                if (!Number.isInteger(noteIndex)) {
                    throw new Error(`Invalid noteIndex in track ${trackId}`);
                }
                if (typeof duration !== 'number' || duration <= 0) {
                    throw new Error(`Invalid duration in track ${trackId}`);
                }
            }
        }
    }

    /**
     * Serialize pattern to JSON-compatible object
     */
    serialize() {
        const data = {
            id: this.id,
            name: this.name,
            icon: this.icon,
            color: this.color,
            length: this.length,
            tracks: this.tracks,
            isPreset: this.isPreset,
            created: this.created
        };
        
        // Include index if present (for custom patterns)
        if (this.index !== undefined) {
            data.index = this.index;
        }
        
        return data;
    }

    /**
     * Deserialize pattern from JSON object
     */
    static deserialize(data) {
        return new Pattern(data);
    }

    /**
     * Create a deep clone of the pattern
     */
    clone(newId = true) {
        const clonedTracks = {};
        for (const trackId in this.tracks) {
            clonedTracks[trackId] = this.tracks[trackId].map(note => [...note]);
        }

        return new Pattern({
            id: newId ? this.generateId() : this.id,
            name: this.name,
            icon: this.icon,
            color: this.color,
            length: this.length,
            tracks: clonedTracks,
            isPreset: this.isPreset,
            created: this.created
        });
    }

    /**
     * Get all notes from all tracks, sorted by beat
     */
    getAllNotes() {
        const allNotes = [];
        for (const trackId in this.tracks) {
            const track = this.tracks[trackId];
            for (const note of track) {
                allNotes.push({
                    trackId: parseInt(trackId),
                    beat: note[0],
                    noteIndex: note[1],
                    duration: note[2]
                });
            }
        }
        return allNotes.sort((a, b) => a.beat - b.beat);
    }

    /**
     * Get notes for a specific track
     */
    getTrackNotes(trackId) {
        return this.tracks[trackId] || [];
    }
}
