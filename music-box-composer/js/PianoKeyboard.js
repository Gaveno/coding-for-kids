/**
 * PianoKeyboard.js - Piano keyboard component with chromatic notes
 */

const PIANO_NOTES = ['', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PIANO_ICONS = {
    'C': 'C', 'C#': 'C♯', 'D': 'D', 'D#': 'D♯', 'E': 'E', 'F': 'F',
    'F#': 'F♯', 'G': 'G', 'G#': 'G♯', 'A': 'A', 'A#': 'A♯', 'B': 'B'
};

class PianoKeyboard {
    constructor(containerElement, onRender = null) {
        this.container = containerElement;
        this.keys = [];
        this.dragStartHandler = null;
        this.whiteKeyIndices = [1, 3, 5, 6, 8, 10, 12]; // C, D, E, F, G, A, B
        this.blackKeyIndices = [2, 4, 7, 9, 11]; // C#, D#, F#, G#, A#
        this.currentOctave = 4; // Default octave for multi-octave mode
        this.multiOctaveMode = false; // Enable multi-octave in Studio Mode
        this.octaveRange = [2, 3, 4, 5, 6]; // Available octaves (5 octaves for Studio Mode)
        this.showDualOctaves = false; // Show 2 octaves when there's space
        this.onRender = onRender; // Callback after rendering
        this.checkDualOctaveSupport();
        
        // Re-check on window resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    /**
     * Check if there's enough space to show 2 octaves
     */
    checkDualOctaveSupport() {
        // Calculate space needed for 2 octaves: 14 white keys + gaps + padding
        // At base: 48px * 14 + 2px * 13 = 672 + 26 = 698px
        // At 768px+: 52px * 14 + 2px * 13 = 728 + 26 = 754px
        // At 1200px+: 58px * 14 + 2px * 13 = 812 + 26 = 838px
        const minWidth = 800; // Safe minimum to show 2 octaves nicely
        const wasShowing = this.showDualOctaves;
        this.showDualOctaves = window.innerWidth >= minWidth && this.multiOctaveMode;
        
        // Re-render if state changed
        if (wasShowing !== this.showDualOctaves && this.multiOctaveMode) {
            this.render();
        }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        this.checkDualOctaveSupport();
    }

    /**
     * Render the piano keyboard
     */
    render() {
        this.container.innerHTML = '';
        this.container.className = 'piano-keyboard';
        
        if (this.showDualOctaves) {
            this.renderDualOctaves();
        } else {
            this.renderSingleOctave();
        }
        
        // Call render callback to re-setup event listeners
        if (this.onRender) {
            this.onRender();
        }
    }
    
    /**
     * Render single octave
     */
    renderSingleOctave() {
        // Create white keys container
        const whiteKeysContainer = document.createElement('div');
        whiteKeysContainer.className = 'white-keys';
        
        // Create white keys
        this.whiteKeyIndices.forEach(index => {
            const key = this.createKey(index, 'white', this.currentOctave);
            whiteKeysContainer.appendChild(key);
            this.keys[index] = key;
        });
        
        this.container.appendChild(whiteKeysContainer);
        
        // Create black keys container (positioned absolutely)
        const blackKeysContainer = document.createElement('div');
        blackKeysContainer.className = 'black-keys';
        
        // Create black keys with dynamic positioning
        this.blackKeyIndices.forEach((index, i) => {
            const key = this.createKey(index, 'black', this.currentOctave);
            
            // Position black keys between white keys using CSS calc
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
     * Render dual octaves side-by-side
     */
    renderDualOctaves() {
        const octave1 = this.currentOctave;
        const octave2 = this.currentOctave + 1;
        
        // Create white keys container
        const whiteKeysContainer = document.createElement('div');
        whiteKeysContainer.className = 'white-keys';
        
        // Create first octave white keys
        this.whiteKeyIndices.forEach(index => {
            const key = this.createKey(index, 'white', octave1);
            whiteKeysContainer.appendChild(key);
            if (!this.keys[index]) this.keys[index] = [];
            this.keys[index] = key;
        });
        
        // Create second octave white keys
        this.whiteKeyIndices.forEach(index => {
            const key = this.createKey(index, 'white', octave2);
            key.dataset.octave2 = 'true';
            whiteKeysContainer.appendChild(key);
        });
        
        this.container.appendChild(whiteKeysContainer);
        
        // Create black keys container
        const blackKeysContainer = document.createElement('div');
        blackKeysContainer.className = 'black-keys';
        
        const positionMap = {
            2: 0,   // C# - after C
            4: 1,   // D# - after D
            7: 3,   // F# - after F
            9: 4,   // G# - after G
            11: 5   // A# - after A
        };
        
        // Create first octave black keys
        this.blackKeyIndices.forEach(index => {
            const key = this.createKey(index, 'black', octave1);
            const offset = positionMap[index];
            key.style.left = `calc(${offset} * (var(--white-key-width) + var(--white-key-gap)) + var(--white-key-width) * 0.67)`;
            blackKeysContainer.appendChild(key);
            if (!this.keys[index]) this.keys[index] = [];
            this.keys[index] = key;
        });
        
        // Create second octave black keys
        this.blackKeyIndices.forEach(index => {
            const key = this.createKey(index, 'black', octave2);
            key.dataset.octave2 = 'true';
            const offset = positionMap[index];
            key.style.left = `calc((${offset} + 7) * (var(--white-key-width) + var(--white-key-gap)) + var(--white-key-width) * 0.67)`;
            blackKeysContainer.appendChild(key);
        });
        
        this.container.appendChild(blackKeysContainer);
    }

    /**
     * Create a piano key element
     * @param {number} noteIndex - Note index in PIANO_NOTES array
     * @param {string} keyType - 'white' or 'black'
     * @param {number} octave - Octave number for this key
     * @returns {HTMLElement} - Key element
     */
    createKey(noteIndex, keyType, octave) {
        const key = document.createElement('div');
        const note = PIANO_NOTES[noteIndex];
        const icon = PIANO_ICONS[note];
        
        key.className = `piano-key ${keyType}-key enabled`;
        key.dataset.noteIndex = noteIndex;
        key.dataset.note = note;
        key.dataset.octave = octave;
        
        // Add note label
        const label = document.createElement('div');
        label.className = 'key-label';
        label.textContent = icon;
        key.appendChild(label);
        
        return key;
    }

    getNoteData(noteIndex, keyElement = null) {
        const note = PIANO_NOTES[noteIndex];
        let octave = this.currentOctave;
        
        // If key element is provided and has octave data, use that
        if (keyElement && keyElement.dataset.octave) {
            octave = parseInt(keyElement.dataset.octave);
        }
        
        return {
            note: note,
            icon: PIANO_ICONS[note],
            octave: this.multiOctaveMode ? octave : null
        };
    }
    
    /**
     * Set multi-octave mode and enable octave controls
     * @param {boolean} enabled - Whether to enable multi-octave mode
     */
    setMultiOctaveMode(enabled) {
        this.multiOctaveMode = enabled;
        
        // Check if we can show dual octaves
        this.checkDualOctaveSupport();
        
        // Show/hide octave controls
        const controls = this.container.parentElement.querySelector('.octave-controls');
        if (controls) {
            controls.style.display = enabled ? 'flex' : 'none';
        }
        
        // Update current octave display
        if (enabled) {
            this.updateOctaveDisplay();
        }
    }
    
    /**
     * Change current octave
     * @param {number} octave - New octave number
     */
    setOctave(octave) {
        // In dual octave mode, ensure we don't go beyond valid range
        if (this.showDualOctaves && octave + 1 > this.octaveRange[this.octaveRange.length - 1]) {
            return; // Can't show octave+1, so don't change
        }
        
        if (this.octaveRange.includes(octave)) {
            this.currentOctave = octave;
            this.render(); // Re-render to show new octave(s)
            this.updateOctaveDisplay();
        }
    }
    
    /**
     * Shift octave up
     */
    octaveUp() {
        const currentIndex = this.octaveRange.indexOf(this.currentOctave);
        const maxIndex = this.showDualOctaves ? this.octaveRange.length - 2 : this.octaveRange.length - 1;
        if (currentIndex < maxIndex) {
            this.setOctave(this.octaveRange[currentIndex + 1]);
        }
    }
    
    /**
     * Shift octave down
     */
    octaveDown() {
        const currentIndex = this.octaveRange.indexOf(this.currentOctave);
        if (currentIndex > 0) {
            this.setOctave(this.octaveRange[currentIndex - 1]);
        }
    }
    
    /**
     * Update octave display in controls
     */
    updateOctaveDisplay() {
        const display = this.container.parentElement.querySelector('.octave-display');
        if (display) {
            if (this.showDualOctaves) {
                display.textContent = `Oct ${this.currentOctave}-${this.currentOctave + 1}`;
            } else {
                display.textContent = `Oct ${this.currentOctave}`;
            }
        }
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
    
    /**
     * Set whether sharps/flats (black keys) should be visible
     * @param {boolean} show - Whether to show black keys
     */
    setShowSharps(show) {
        const blackKeysContainer = this.container.querySelector('.black-keys');
        if (blackKeysContainer) {
            blackKeysContainer.style.display = show ? 'block' : 'none';
        }
    }
}
