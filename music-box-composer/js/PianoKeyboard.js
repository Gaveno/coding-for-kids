/**
 * PianoKeyboard.js - Piano keyboard component with chromatic notes
 * Provides 12-note chromatic piano keyboard for note selection
 */

// Piano note constants (index 0 is empty/no note)
const PIANO_NOTES = ['', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Emoji icons for each note
const PIANO_ICONS = {
    'C': '🔴',
    'C#': '🟠',
    'D': '🟡',
    'D#': '🟢',
    'E': '🔵',
    'F': '🟣',
    'F#': '🟤',
    'G': '⚪',
    'G#': '🟥',
    'A': '🟧',
    'A#': '🟨',
    'B': '🟩'
};

class PianoKeyboard {
    /**
     * Initialize piano keyboard
     * @param {HTMLElement} containerElement - Container element for keyboard
     */
    constructor(containerElement) {
        this.container = containerElement;
        this.keys = [];
        this.dragStartHandler = null;
        
        // White keys: C, D, E, F, G, A, B (indices 1, 3, 5, 6, 8, 10, 12)
        this.whiteKeyIndices = [1, 3, 5, 6, 8, 10, 12];
        
        // Black keys: C#, D#, F#, G#, A# (indices 2, 4, 7, 9, 11)
        this.blackKeyIndices = [2, 4, 7, 9, 11];
    }

    /**
     * Render the piano keyboard
     */
    render() {
        this.container.innerHTML = '';
        this.container.className = 'piano-keyboard';
        
        // Create white keys container
        const whiteKeysContainer = document.createElement('div');
        whiteKeysContainer.className = 'white-keys';
        
        // Create white keys
        this.whiteKeyIndices.forEach(index => {
            const key = this.createKey(index, 'white');
            whiteKeysContainer.appendChild(key);
            this.keys[index] = key;
        });
        
        this.container.appendChild(whiteKeysContainer);
        
        // Create black keys container (positioned absolutely)
        const blackKeysContainer = document.createElement('div');
        blackKeysContainer.className = 'black-keys';
        
        // Create black keys with positioning
        this.blackKeyIndices.forEach((index, i) => {
            const key = this.createKey(index, 'black');
            
            // Position black keys between white keys
            // C# is between C and D, D# is between D and E, etc.
            const positionMap = {
                2: 0,   // C# - after C
                4: 1,   // D# - after D
                7: 3,   // F# - after F
                9: 4,   // G# - after G
                11: 5   // A# - after A
            };
            
            key.style.left = `${positionMap[index] * 48 + 32}px`;
            blackKeysContainer.appendChild(key);
            this.keys[index] = key;
        });
        
        this.container.appendChild(blackKeysContainer);
    }

    /**
     * Create a piano key element
     * @param {number} noteIndex - Note index in PIANO_NOTES array
     * @param {string} keyType - 'white' or 'black'
     * @returns {HTMLElement} - Key element
     */
    createKey(noteIndex, keyType) {
        const key = document.createElement('div');
        const note = PIANO_NOTES[noteIndex];
        const icon = PIANO_ICONS[note];
        
        key.className = `piano-key ${keyType}-key enabled`;
        key.dataset.noteIndex = noteIndex;
        key.draggable = true;
        
        // Add note label
        const label = document.createElement('div');
        label.className = 'key-label';
        label.textContent = icon;
        key.appendChild(label);
        
        // Add pointer events for drag and drop
        key.addEventListener('pointerdown', (e) => this.handleKeyPointerDown(e, noteIndex));
        key.addEventListener('dragstart', (e) => this.handleDragStart(e, noteIndex));
        key.addEventListener('dragend', (e) => this.handleDragEnd(e));
        
        return key;
    }

    /**
     * Handle pointer down on key
     * @param {PointerEvent} e - Pointer event
     * @param {number} noteIndex - Note index
     */
    handleKeyPointerDown(e, noteIndex) {
        const key = this.keys[noteIndex];
        if (!key || key.classList.contains('disabled')) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    /**
     * Handle drag start
     * @param {DragEvent} e - Drag event
     * @param {number} noteIndex - Note index
     */
    handleDragStart(e, noteIndex) {
        const key = this.keys[noteIndex];
        
        // Don't allow drag if key is disabled
        if (key.classList.contains('disabled')) {
            e.preventDefault();
            return;
        }
        
        key.classList.add('dragging');
        
        // Call external drag start handler if set
        if (this.dragStartHandler) {
            const noteData = this.getNoteData(noteIndex);
            this.dragStartHandler(e, noteData);
        }
    }

    /**
     * Handle drag end
     * @param {DragEvent} e - Drag event
     */
    handleDragEnd(e) {
        // Remove dragging class from all keys
        this.keys.forEach(key => {
            if (key) {
                key.classList.remove('dragging');
            }
        });
    }

    /**
     * Get note data for a note index
     * @param {number} noteIndex - Note index in PIANO_NOTES array
     * @returns {Object} - Note data {note, icon, octave}
     */
    getNoteData(noteIndex) {
        const note = PIANO_NOTES[noteIndex];
        const icon = PIANO_ICONS[note];
        
        return {
            note: note,
            icon: icon,
            octave: null // Octave will be set based on target track
        };
    }

    /**
     * Update which keys are enabled/disabled based on musical key
     * @param {Array<number>} allowedNoteIndices - Array of allowed note indices (1-12)
     */
    updateDisabledKeys(allowedNoteIndices) {
        // Disable all keys first
        this.keys.forEach((key, index) => {
            if (key && index > 0) {
                key.classList.remove('enabled');
                key.classList.add('disabled');
                key.draggable = false;
            }
        });
        
        // Enable allowed keys
        allowedNoteIndices.forEach(index => {
            const key = this.keys[index];
            if (key) {
                key.classList.remove('disabled');
                key.classList.add('enabled');
                key.draggable = true;
            }
        });
    }

    /**
     * Set drag start handler callback
     * @param {Function} callback - Callback function(event, noteData)
     */
    setDragStartHandler(callback) {
        this.dragStartHandler = callback;
    }
}
