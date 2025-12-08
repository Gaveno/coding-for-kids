/**
 * Game.js - Main game controller for Music Box Composer
 */
class Game {
    constructor() {
        this.audio = new Audio();
        this.sequencer = new Sequencer();
        this.character = null;
        this.isPlaying = false;
        this.currentNoteIndex = -1;
        
        // DOM Elements
        this.sequencerTrack = null;
        this.playBtn = null;
        this.stopBtn = null;
        this.clearBtn = null;
        this.soundBlocks = null;
    }

    /**
     * Initialize the game
     */
    init() {
        this.cacheElements();
        this.character = new Character(document.getElementById('character'));
        this.bindEvents();
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.sequencerTrack = document.getElementById('sequencerTrack');
        this.playBtn = document.getElementById('playBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.soundBlocks = document.querySelectorAll('.sound-block');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Sound block clicks
        this.soundBlocks.forEach(block => {
            block.addEventListener('click', () => this.handleBlockClick(block));
            block.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleBlockClick(block);
            });
        });

        // Control buttons
        this.playBtn.addEventListener('click', () => this.play());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.clearBtn.addEventListener('click', () => this.clear());

        // Initialize audio on first interaction
        document.addEventListener('click', () => this.audio.init(), { once: true });
        document.addEventListener('touchstart', () => this.audio.init(), { once: true });
    }

    /**
     * Handle sound block click
     * @param {HTMLElement} block - The clicked block element
     */
    handleBlockClick(block) {
        const note = block.dataset.note;
        const color = block.dataset.color;

        // Play the note immediately
        this.audio.playNote(note);
        
        // Visual feedback on block
        block.classList.add('playing');
        setTimeout(() => block.classList.remove('playing'), 300);

        // Add to sequence
        if (this.sequencer.addNote(note, color)) {
            this.renderSequence();
        }
    }

    /**
     * Render the sequence track
     */
    renderSequence() {
        this.sequencerTrack.innerHTML = '';
        
        const notes = this.sequencer.getNotes();
        notes.forEach((noteObj, index) => {
            const noteEl = document.createElement('div');
            noteEl.className = 'seq-note';
            noteEl.dataset.color = noteObj.color;
            noteEl.dataset.index = index;
            noteEl.textContent = this.getEmojiForColor(noteObj.color);
            
            // Click to remove
            noteEl.addEventListener('click', () => this.removeNote(index));
            
            this.sequencerTrack.appendChild(noteEl);
        });
    }

    /**
     * Get emoji for a color
     * @param {string} color - Color name
     * @returns {string} - Emoji
     */
    getEmojiForColor(color) {
        const emojis = {
            'red': '🔴',
            'orange': '🟠',
            'yellow': '🟡',
            'green': '🟢',
            'blue': '🔵',
            'purple': '🟣'
        };
        return emojis[color] || '⚪';
    }

    /**
     * Remove a note from the sequence
     * @param {number} index - Index to remove
     */
    removeNote(index) {
        if (this.isPlaying) return;
        
        this.sequencer.removeNote(index);
        this.renderSequence();
    }

    /**
     * Play the sequence
     */
    async play() {
        if (this.isPlaying || this.sequencer.isEmpty()) return;

        this.isPlaying = true;
        this.playBtn.classList.add('playing');
        this.character.setIdle(false);

        const notes = this.sequencer.getNotes();
        const noteElements = this.sequencerTrack.querySelectorAll('.seq-note');

        for (let i = 0; i < notes.length; i++) {
            if (!this.isPlaying) break;

            this.currentNoteIndex = i;
            const noteObj = notes[i];
            const noteEl = noteElements[i];

            // Highlight current note
            noteEl.classList.add('active');

            // Play sound and animate character
            this.audio.playNote(noteObj.note, 0.4);
            await this.character.dance(noteObj.color);

            // Remove highlight
            noteEl.classList.remove('active');

            // Wait before next note
            if (i < notes.length - 1) {
                await this.delay(100);
            }
        }

        // Celebrate at the end
        if (this.isPlaying && notes.length > 0) {
            this.character.celebrate();
            this.audio.playSuccess();
        }

        this.isPlaying = false;
        this.currentNoteIndex = -1;
        this.playBtn.classList.remove('playing');
        this.character.setIdle(true);
    }

    /**
     * Stop playback
     */
    stop() {
        this.isPlaying = false;
        this.currentNoteIndex = -1;
        this.playBtn.classList.remove('playing');
        this.character.reset();

        // Remove all active states
        const noteElements = this.sequencerTrack.querySelectorAll('.seq-note');
        noteElements.forEach(el => el.classList.remove('active'));
    }

    /**
     * Clear the sequence
     */
    clear() {
        if (this.isPlaying) return;
        
        this.sequencer.clear();
        this.renderSequence();
    }

    /**
     * Delay helper
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other modules
window.Game = Game;
