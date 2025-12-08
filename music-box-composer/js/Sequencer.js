/**
 * Sequencer.js - Manages the sequence of notes
 */
class Sequencer {
    constructor() {
        this.notes = [];
        this.maxNotes = 12;
    }

    /**
     * Add a note to the sequence
     * @param {string} note - Note name (e.g., 'C4')
     * @param {string} color - Color identifier
     * @returns {boolean} - Whether the note was added
     */
    addNote(note, color) {
        if (this.notes.length >= this.maxNotes) {
            return false;
        }
        
        this.notes.push({ note, color, id: Date.now() });
        return true;
    }

    /**
     * Remove a note from the sequence by index
     * @param {number} index - Index to remove
     */
    removeNote(index) {
        if (index >= 0 && index < this.notes.length) {
            this.notes.splice(index, 1);
        }
    }

    /**
     * Clear all notes from the sequence
     */
    clear() {
        this.notes = [];
    }

    /**
     * Get all notes in the sequence
     * @returns {Array} - Array of note objects
     */
    getNotes() {
        return [...this.notes];
    }

    /**
     * Get the number of notes in the sequence
     * @returns {number}
     */
    getLength() {
        return this.notes.length;
    }

    /**
     * Check if the sequence is empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.notes.length === 0;
    }
}

// Export for use in other modules
window.Sequencer = Sequencer;
