/**
 * PianoKeyboard.js - Piano keyboard component with chromatic notes
 */

const PIANO_NOTES = ['', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PIANO_ICONS = {
    'C': 'C', 'C#': 'C♯', 'D': 'D', 'D#': 'D♯', 'E': 'E', 'F': 'F',
    'F#': 'F♯', 'G': 'G', 'G#': 'G♯', 'A': 'A', 'A#': 'A♯', 'B': 'B'
};

class PianoKeyboard {
    constructor(containerElement) {
        this.container = containerElement;
        this.keys = [];
        this.dragStartHandler = null;
        this.whiteKeyIndices = [1, 3, 5, 6, 8, 10, 12]; // C, D, E, F, G, A, B
        this.blackKeyIndices = [2, 4, 7, 9, 11]; // C#, D#, F#, G#, A#
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
        
        // Create black keys with dynamic positioning
        this.blackKeyIndices.forEach((index, i) => {
            const key = this.createKey(index, 'black');
            
            // Position black keys between white keys using CSS calc
            // C# is between C and D, D# is between D and E, etc.
            const positionMap = {
                2: 0,   // C# - after C
                4: 1,   // D# - after D
                7: 3,   // F# - after F
                9: 4,   // G# - after G
                11: 5   // A# - after A
            };
            
            const offset = positionMap[index];
            key.style.left = `calc(${offset} * (var(--white-key-width) + var(--white-key-gap)) + var(--white-key-width) * 0.67)`;
            
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
        key.dataset.note = note;
        
        // Add note label
        const label = document.createElement('div');
        label.className = 'key-label';
        label.textContent = icon;
        key.appendChild(label);
        
        return key;
    }

    getNoteData(noteIndex) {
        return {
            note: PIANO_NOTES[noteIndex],
            icon: PIANO_ICONS[PIANO_NOTES[noteIndex]],
            octave: null
        };
    }

    updateDisabledKeys(allowedNoteIndices) {
        // Disable all keys first
        this.keys.forEach((key, index) => {
            if (key && index > 0) {
                key.classList.remove('enabled');
                key.classList.add('disabled');
            }
        });
        // Enable allowed keys
        allowedNoteIndices.forEach(index => {
            const key = this.keys[index];
            if (key) {
                key.classList.remove('disabled');
                key.classList.add('enabled');
            }
        });
    }
}
