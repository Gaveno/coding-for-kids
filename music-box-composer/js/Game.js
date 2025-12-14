/**
 * Game.js - Main game controller for Music Box Composer
 */
class Game {
    constructor() {
        this.audio = new Audio();
        this.timeline = null;
        this.character = null;
        this.dragDrop = null;
        
        this.isPlaying = false;
        this.isLooping = false;
        this.currentBeat = 0;
        this.playbackInterval = null;
        this.animationFrame = null;
        
        // Speed settings (ms per beat)
        this.speeds = [
            { ms: 200, icon: '🐢' },
            { ms: 120, icon: '🚶' },
            { ms: 80, icon: '🏃' },
            { ms: 50, icon: '⚡' }
        ];
        this.currentSpeedIndex = 1; // Default: medium
        
        // Beat lengths
        this.beatLengths = [8, 16, 24, 32];
        
        // DOM elements
        this.elements = {};
    }

    /**
     * Initialize the game
     */
    init() {
        this.cacheElements();
        this.initComponents();
        this.bindEvents();
        this.loadFromURL();
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            playBtn: document.getElementById('playBtn'),
            stopBtn: document.getElementById('stopBtn'),
            speedBtn: document.getElementById('speedBtn'),
            loopBtn: document.getElementById('loopBtn'),
            clearBtn: document.getElementById('clearBtn'),
            lengthUpBtn: document.getElementById('lengthUpBtn'),
            lengthDownBtn: document.getElementById('lengthDownBtn'),
            beatCount: document.getElementById('beatCount'),
            timeline: document.getElementById('timeline'),
            timelineScroll: document.getElementById('timelineScroll'),
            beatMarkers: document.getElementById('beatMarkers'),
            playhead: document.getElementById('playhead'),
            cellsMelody: document.getElementById('cellsMelody'),
            cellsBass: document.getElementById('cellsBass'),
            cellsPercussion: document.getElementById('cellsPercussion'),
            palette: document.querySelector('.palette'),
            characterMain: document.getElementById('characterMain'),
            characterLeft: document.getElementById('characterLeft'),
            characterRight: document.getElementById('characterRight')
        };
    }

    /**
     * Initialize sub-components
     */
    initComponents() {
        // Character manager
        this.character = new Character(
            this.elements.characterMain,
            this.elements.characterLeft,
            this.elements.characterRight
        );
        
        // Timeline
        this.timeline = new Timeline({
            container: this.elements.timeline,
            scrollContainer: this.elements.timelineScroll,
            beatMarkers: this.elements.beatMarkers,
            playhead: this.elements.playhead,
            cellsMelody: this.elements.cellsMelody,
            cellsBass: this.elements.cellsBass,
            cellsPercussion: this.elements.cellsPercussion,
            onCellClick: (track, beat, note) => this.handleCellClick(track, beat),
            onNoteChange: () => this.updateURL()
        });
        
        // Drag and drop
        this.dragDrop = new DragDrop({
            palette: this.elements.palette,
            timeline: this.timeline,
            onPreview: (note, type) => this.previewNote(note, type),
            onDrop: (track, beat, note, icon) => this.handleNoteDrop(track, beat, note, icon)
        });
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.elements.playBtn.addEventListener('click', () => this.togglePlay());
        this.elements.stopBtn.addEventListener('click', () => this.stop());
        this.elements.speedBtn.addEventListener('click', () => this.cycleSpeed());
        this.elements.loopBtn.addEventListener('click', () => this.toggleLoop());
        this.elements.clearBtn.addEventListener('click', () => this.clear());
        this.elements.lengthUpBtn.addEventListener('click', () => this.changeLength(1));
        this.elements.lengthDownBtn.addEventListener('click', () => this.changeLength(-1));
        
        // Initialize audio on first interaction
        const initAudio = () => {
            this.audio.init();
            document.removeEventListener('click', initAudio);
            document.removeEventListener('touchstart', initAudio);
        };
        document.addEventListener('click', initAudio, { once: true });
        document.addEventListener('touchstart', initAudio, { once: true });
    }

    /**
     * Preview a note (tap on palette)
     */
    previewNote(note, type) {
        this.audio.playNote(note, type);
    }

    /**
     * Handle cell click (remove note)
     */
    handleCellClick(track, beat) {
        if (this.isPlaying) return;
        this.timeline.clearNote(track, beat);
        this.updateURL();
    }

    /**
     * Handle note drop from palette
     */
    handleNoteDrop(track, beat, note, icon) {
        this.timeline.setNote(track, beat, note, icon);
        this.audio.playNote(note, track);
        this.updateURL();
    }

    /**
     * Toggle play/pause
     */
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    /**
     * Start playback
     */
    play() {
        if (this.timeline.isEmpty()) return;
        
        this.isPlaying = true;
        this.elements.playBtn.classList.add('playing');
        this.elements.playBtn.textContent = '⏸️';
        this.character.setIdle(false);
        
        this.timeline.setPlayheadVisible(true);
        this.startPlayback();
    }

    /**
     * Pause playback
     */
    pause() {
        this.isPlaying = false;
        this.elements.playBtn.classList.remove('playing');
        this.elements.playBtn.textContent = '▶️';
        
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
            this.playbackInterval = null;
        }
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /**
     * Stop playback
     */
    stop() {
        this.pause();
        this.currentBeat = 0;
        this.timeline.highlightBeat(-1);
        this.timeline.setPlayheadVisible(false);
        this.timeline.updatePlayheadPosition(0);
        this.character.reset();
    }

    /**
     * Start the playback loop
     */
    startPlayback() {
        const beatDuration = this.speeds[this.currentSpeedIndex].ms;
        let lastBeatTime = performance.now();
        let beatProgress = 0;
        
        const tick = (now) => {
            if (!this.isPlaying) return;
            
            const elapsed = now - lastBeatTime;
            beatProgress = elapsed / beatDuration;
            
            // Update playhead position smoothly
            const smoothBeat = this.currentBeat + Math.min(beatProgress, 1);
            this.timeline.updatePlayheadPosition(smoothBeat);
            
            // Check if we've completed a beat
            if (elapsed >= beatDuration) {
                lastBeatTime = now;
                beatProgress = 0;
                
                this.playBeat(this.currentBeat);
                this.timeline.highlightBeat(this.currentBeat);
                this.timeline.scrollToBeat(this.currentBeat);
                
                this.currentBeat++;
                
                // Check if we've reached the end
                if (this.currentBeat >= this.timeline.getBeatCount()) {
                    if (this.isLooping) {
                        this.currentBeat = 0;
                    } else {
                        this.onPlaybackComplete();
                        return;
                    }
                }
            }
            
            this.animationFrame = requestAnimationFrame(tick);
        };
        
        // Play first beat immediately
        this.playBeat(this.currentBeat);
        this.timeline.highlightBeat(this.currentBeat);
        
        this.animationFrame = requestAnimationFrame(tick);
    }

    /**
     * Play sounds for a beat
     */
    playBeat(beat) {
        const notes = this.timeline.getNotesAtBeat(beat);
        const playing = {
            melody: false,
            bass: false,
            percussion: false
        };
        
        if (notes.melody) {
            this.audio.playNote(notes.melody.note, 'melody');
            playing.melody = true;
        }
        
        if (notes.bass) {
            this.audio.playNote(notes.bass.note, 'bass');
            playing.bass = true;
        }
        
        if (notes.percussion) {
            this.audio.playNote(notes.percussion.note, 'percussion');
            playing.percussion = true;
        }
        
        // Animate characters if any notes played
        if (playing.melody || playing.bass || playing.percussion) {
            this.character.dance(playing);
        }
    }

    /**
     * Handle playback completion
     */
    onPlaybackComplete() {
        this.stop();
        this.character.celebrate();
        this.audio.playSuccess();
    }

    /**
     * Cycle through speed options
     */
    cycleSpeed() {
        this.currentSpeedIndex = (this.currentSpeedIndex + 1) % this.speeds.length;
        this.elements.speedBtn.textContent = this.speeds[this.currentSpeedIndex].icon;
        this.updateURL();
    }

    /**
     * Toggle loop mode
     */
    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.elements.loopBtn.classList.toggle('active', this.isLooping);
        this.updateURL();
    }

    /**
     * Change beat length
     * @param {number} direction - 1 for longer, -1 for shorter
     */
    changeLength(direction) {
        if (this.isPlaying) return;
        
        const currentLength = this.timeline.getBeatCount();
        const currentIndex = this.beatLengths.indexOf(currentLength);
        let newIndex = currentIndex + direction;
        
        // Clamp to valid range
        newIndex = Math.max(0, Math.min(this.beatLengths.length - 1, newIndex));
        
        if (newIndex !== currentIndex) {
            const newLength = this.beatLengths[newIndex];
            this.timeline.setBeatCount(newLength);
            this.elements.beatCount.textContent = newLength;
            this.updateURL();
        }
    }

    /**
     * Clear all tracks
     */
    clear() {
        if (this.isPlaying) {
            this.stop();
        }
        this.timeline.clearAll();
        this.updateURL();
    }

    // Note mappings for compact encoding (index 0 = empty)
    static MELODY_NOTES = ['', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    static BASS_NOTES = ['', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3'];
    static PERC_NOTES = ['', 'kick', 'snare', 'hihat', 'clap'];
    static MELODY_ICONS = ['', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚪', '❤️'];
    static BASS_ICONS = ['', '🟦', '🟪', '🟫', '⬛', '💙', '💜'];
    static PERC_ICONS = ['', '🥁', '🪘', '🔔', '👏'];

    /**
     * Serialize current state to a compact binary URL-safe string
     * Header: 5 bits (speed:2, loop:1, lengthIndex:2)
     * Per beat: 10 bits (melody:4, bass:3, percussion:3)
     * @returns {string}
     */
    serializeState() {
        const beatCount = this.timeline.getBeatCount();
        const lengthIndex = this.beatLengths.indexOf(beatCount);
        
        // Build bit array
        const bits = [];
        
        // Header: speed (2 bits), loop (1 bit), length index (2 bits)
        this.pushBits(bits, this.currentSpeedIndex, 2);
        this.pushBits(bits, this.isLooping ? 1 : 0, 1);
        this.pushBits(bits, lengthIndex, 2);
        
        // Track data for each beat
        const tracks = this.timeline.serializeTracks();
        for (let i = 0; i < beatCount; i++) {
            const melodyNote = this.findNoteAtBeat(tracks.melody, i);
            const bassNote = this.findNoteAtBeat(tracks.bass, i);
            const percNote = this.findNoteAtBeat(tracks.percussion, i);
            
            const melodyIdx = Game.MELODY_NOTES.indexOf(melodyNote);
            const bassIdx = Game.BASS_NOTES.indexOf(bassNote);
            const percIdx = Game.PERC_NOTES.indexOf(percNote);
            
            this.pushBits(bits, Math.max(0, melodyIdx), 4);
            this.pushBits(bits, Math.max(0, bassIdx), 3);
            this.pushBits(bits, Math.max(0, percIdx), 3);
        }
        
        // Convert bits to bytes
        const bytes = this.bitsToBytes(bits);
        
        // Convert to URL-safe base64
        let base64 = '';
        for (let i = 0; i < bytes.length; i++) {
            base64 += String.fromCharCode(bytes[i]);
        }
        return btoa(base64).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    /**
     * Find note value at a specific beat from serialized track data
     */
    findNoteAtBeat(trackData, beat) {
        for (const [b, note] of trackData) {
            if (b === beat) return note;
        }
        return '';
    }

    /**
     * Push bits to bit array (MSB first)
     */
    pushBits(bits, value, count) {
        for (let i = count - 1; i >= 0; i--) {
            bits.push((value >> i) & 1);
        }
    }

    /**
     * Read bits from bit array
     */
    readBits(bits, offset, count) {
        let value = 0;
        for (let i = 0; i < count; i++) {
            value = (value << 1) | (bits[offset + i] || 0);
        }
        return value;
    }

    /**
     * Convert bit array to byte array
     */
    bitsToBytes(bits) {
        const bytes = [];
        for (let i = 0; i < bits.length; i += 8) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                byte = (byte << 1) | (bits[i + j] || 0);
            }
            bytes.push(byte);
        }
        return bytes;
    }

    /**
     * Convert byte array to bit array
     */
    bytesToBits(bytes) {
        const bits = [];
        for (const byte of bytes) {
            for (let i = 7; i >= 0; i--) {
                bits.push((byte >> i) & 1);
            }
        }
        return bits;
    }

    /**
     * Deserialize state from compact binary URL string
     * @param {string} encoded - Encoded state string
     * @returns {Object|null}
     */
    deserializeState(encoded) {
        try {
            // Restore base64 padding and characters
            let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) base64 += '=';
            
            // Decode base64 to bytes
            const decoded = atob(base64);
            const bytes = [];
            for (let i = 0; i < decoded.length; i++) {
                bytes.push(decoded.charCodeAt(i));
            }
            
            // Convert to bits
            const bits = this.bytesToBits(bytes);
            let offset = 0;
            
            // Read header
            const speedIndex = this.readBits(bits, offset, 2); offset += 2;
            const loop = this.readBits(bits, offset, 1); offset += 1;
            const lengthIndex = this.readBits(bits, offset, 2); offset += 2;
            
            const beatCount = this.beatLengths[lengthIndex] || 16;
            
            // Read track data
            const melody = [];
            const bass = [];
            const percussion = [];
            
            for (let i = 0; i < beatCount; i++) {
                const melodyIdx = this.readBits(bits, offset, 4); offset += 4;
                const bassIdx = this.readBits(bits, offset, 3); offset += 3;
                const percIdx = this.readBits(bits, offset, 3); offset += 3;
                
                if (melodyIdx > 0 && melodyIdx < Game.MELODY_NOTES.length) {
                    melody.push([i, Game.MELODY_NOTES[melodyIdx], Game.MELODY_ICONS[melodyIdx]]);
                }
                if (bassIdx > 0 && bassIdx < Game.BASS_NOTES.length) {
                    bass.push([i, Game.BASS_NOTES[bassIdx], Game.BASS_ICONS[bassIdx]]);
                }
                if (percIdx > 0 && percIdx < Game.PERC_NOTES.length) {
                    percussion.push([i, Game.PERC_NOTES[percIdx], Game.PERC_ICONS[percIdx]]);
                }
            }
            
            return {
                s: speedIndex,
                l: loop,
                b: beatCount,
                t: { melody, bass, percussion }
            };
        } catch (e) {
            console.warn('Failed to decode state from URL:', e);
            return null;
        }
    }

    /**
     * Update URL with current state
     */
    updateURL() {
        const encoded = this.serializeState();
        const newURL = `${window.location.pathname}?c=${encoded}`;
        window.history.replaceState(null, '', newURL);
    }

    /**
     * Load state from URL if present
     */
    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get('c');
        
        if (!encoded) return;
        
        const state = this.deserializeState(encoded);
        if (!state) return;
        
        // Apply speed
        if (typeof state.s === 'number' && state.s >= 0 && state.s < this.speeds.length) {
            this.currentSpeedIndex = state.s;
            this.elements.speedBtn.textContent = this.speeds[this.currentSpeedIndex].icon;
        }
        
        // Apply loop
        if (state.l === 1) {
            this.isLooping = true;
            this.elements.loopBtn.classList.add('active');
        }
        
        // Apply beat count
        if (typeof state.b === 'number' && this.beatLengths.includes(state.b)) {
            this.timeline.setBeatCount(state.b);
            this.elements.beatCount.textContent = state.b;
        }
        
        // Apply tracks
        if (state.t) {
            this.timeline.deserializeTracks(state.t);
        }
    }
}

window.Game = Game;
