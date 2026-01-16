/**
 * Game.js - Main game controller for Music Box Composer
 */
class Game {
    // Key signatures: indices map to PIANO_NOTES array (1-12, 0=empty)
    static KEY_SIGNATURES = {
        'C Major':  [1, 3, 5, 6, 8, 10, 12],     // C D E F G A B
        'G Major':  [1, 3, 5, 7, 8, 10, 12],     // G A B C D E F#
        'D Major':  [1, 2, 3, 5, 7, 9, 10, 12],  // D E F# G A B C#
        'A Major':  [1, 2, 4, 6, 7, 9, 11],      // A B C# D E F# G#
        'E Major':  [1, 2, 4, 6, 8, 9, 11],      // E F# G# A B C# D#
        'B Major':  [1, 2, 4, 5, 7, 9, 11],      // B C# D# E F# G# A#
        'F Major':  [1, 3, 5, 6, 8, 10, 11],     // F G A Bb C D E
        'Bb Major': [1, 3, 4, 6, 8, 10, 11],     // Bb C D Eb F G A
        'Eb Major': [1, 3, 4, 6, 8, 9, 11],      // Eb F G Ab Bb C D
        'A Minor':  [1, 3, 4, 6, 8, 9, 11],      // A B C D E F G
        'E Minor':  [1, 3, 5, 6, 8, 10, 11],     // E F# G A B C D
        'B Minor':  [1, 2, 4, 6, 7, 9, 11],      // B C# D E F# G A
        'D Minor':  [1, 3, 4, 6, 8, 9, 10],      // D E F G A Bb C
        'G Minor':  [1, 3, 4, 5, 7, 9, 10],      // G A Bb C D Eb F
        'C Minor':  [1, 3, 4, 6, 7, 9, 10],      // C D Eb F G Ab Bb
        'Freeform': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]  // All notes
    };
    
    // Key names for dropdown population
    static KEY_NAMES = Object.keys(Game.KEY_SIGNATURES);
    
    constructor() {
        this.audio = new Audio();
        this.timeline = null;
        this.character = null;
        this.dragDrop = null;
        this.pianoKeyboard = null;
        
        this.isPlaying = false;
        this.isLooping = false;
        this.currentBeat = 0;
        this.playbackInterval = null;
        this.animationFrame = null;
        
        // Speed settings (ms per beat)
        this.speeds = [
            { ms: 350, icon: '🐢' },
            { ms: 200, icon: '🚶' },
            { ms: 130, icon: '🏃' },
            { ms: 80, icon: '⚡' }
        ];
        this.currentSpeedIndex = 1; // Default: medium
        
        // Beat lengths (up to 64 beats)
        this.beatLengths = [16, 32, 48, 64];
        
        // Key selection (default: C Major - all white keys)
        this.currentKey = 'C Major';
        
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
            cells1: document.getElementById('cells1'),
            cells2: document.getElementById('cells2'),
            cells3: document.getElementById('cells3'),
            palette: document.querySelector('.palette'),
            pianoKeyboardContainer: document.getElementById('piano-keyboard-container'),
            keySelect: document.getElementById('key-select'),
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
        
        // Piano keyboard
        this.pianoKeyboard = new PianoKeyboard(this.elements.pianoKeyboardContainer);
        this.pianoKeyboard.render();
        
        // Enable all keys initially (C Major = all white keys)
        this.pianoKeyboard.updateDisabledKeys([1, 3, 5, 6, 8, 10, 12]);
        
        // Populate key selector dropdown
        this.populateKeySelector();
        
        // Timeline
        this.timeline = new Timeline({
            container: this.elements.timeline,
            scrollContainer: this.elements.timelineScroll,
            beatMarkers: this.elements.beatMarkers,
            playhead: this.elements.playhead,
            cells1: this.elements.cells1,
            cells2: this.elements.cells2,
            cells3: this.elements.cells3,
            onCellClick: (trackNum, beat) => this.handleCellClick(trackNum, beat),
            onNoteChange: () => this.updateURL()
        });
        
        // Drag and drop
        this.dragDrop = new DragDrop({
            palette: this.elements.palette,
            pianoKeyboard: this.pianoKeyboard,
            timeline: this.timeline,
            onPreview: (note, trackNum) => this.previewNote(note, trackNum),
            onDrop: (trackNum, beat, noteData) => this.handleNoteDrop(trackNum, beat, noteData)
        });
    }

    /**
     * Populate key selector dropdown with available keys
     */
    populateKeySelector() {
        Game.KEY_NAMES.forEach(keyName => {
            const option = document.createElement('option');
            option.value = keyName;
            option.textContent = keyName;
            this.elements.keySelect.appendChild(option);
        });
        
        // Set default to C Major
        this.elements.keySelect.value = this.currentKey;
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
        this.elements.keySelect.addEventListener('change', (e) => this.setKey(e.target.value));
        
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
    previewNote(note, trackNum) {
        this.audio.playNote(note, trackNum);
    }

    /**
     * Handle cell click (remove note)
     */
    handleCellClick(trackNum, beat) {
        if (this.isPlaying) return;
        this.timeline.clearNote(trackNum, beat);
        this.updateURL();
    }

    /**
     * Handle note drop from palette
     */
    handleNoteDrop(trackNum, beat, noteData) {
        this.timeline.setNote(trackNum, beat, noteData);
        this.audio.playNote(noteData.note, trackNum);
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
        let displayBeat = this.currentBeat;
        
        // Play first beat immediately
        this.playBeat(this.currentBeat);
        this.timeline.highlightBeat(this.currentBeat);
        this.currentBeat++;
        
        // Check if only one beat
        if (this.currentBeat >= this.timeline.getBeatCount()) {
            if (this.isLooping) {
                this.currentBeat = 0;
            } else {
                this.onPlaybackComplete();
                return;
            }
        }
        
        const tick = (now) => {
            if (!this.isPlaying) return;
            
            const elapsed = now - lastBeatTime;
            const beatProgress = Math.min(elapsed / beatDuration, 1);
            
            // Update playhead position smoothly
            this.timeline.updatePlayheadPosition(displayBeat + beatProgress);
            
            // Check if we've completed a beat
            if (elapsed >= beatDuration) {
                lastBeatTime = now;
                displayBeat = this.currentBeat;
                
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
        
        this.animationFrame = requestAnimationFrame(tick);
    }

    /**
     * Play sounds for a beat
     * Extended notes only trigger on their first beat (not sustained beats)
     */
    playBeat(beat) {
        const notes = this.timeline.getNotesAtBeat(beat);
        const playing = {
            1: false,
            2: false,
            3: false
        };
        const durations = {
            1: 1,
            2: 1,
            3: 1
        };
        
        // Calculate beat duration in seconds
        const beatDurationMs = this.speeds[this.currentSpeedIndex].ms;
        const beatDurationSec = beatDurationMs / 1000;
        
        // Only play notes that are starting (not sustained from previous beat)
        if (notes[1] && !notes[1].sustained) {
            const noteDuration = (notes[1].duration || 1) * beatDurationSec;
            this.audio.playNote(notes[1].note, 1, noteDuration);
            playing[1] = true;
            durations[1] = notes[1].duration || 1;
        }
        
        if (notes[2] && !notes[2].sustained) {
            const noteDuration = (notes[2].duration || 1) * beatDurationSec;
            this.audio.playNote(notes[2].note, 2, noteDuration);
            playing[2] = true;
            durations[2] = notes[2].duration || 1;
        }
        
        if (notes[3] && !notes[3].sustained) {
            // Percussion doesn't use duration
            this.audio.playNote(notes[3].note, 3);
            playing[3] = true;
        }
        
        // Animate characters if any notes played
        if (playing[1] || playing[2] || playing[3]) {
            this.character.dance(playing, durations);
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

    /**
     * Set the musical key and update piano keyboard
     * @param {string} keyName - The key name (e.g., 'C Major', 'G Minor')
     */
    setKey(keyName) {
        this.currentKey = keyName;
        const allowedNotes = Game.KEY_SIGNATURES[keyName];
        this.pianoKeyboard.updateDisabledKeys(allowedNotes);
        this.updateURL();
    }

    /**
     * Get the index of the current key for serialization
     * @returns {number} - Index in KEY_NAMES array
     */
    getKeyIndex() {
        return Game.KEY_NAMES.indexOf(this.currentKey);
    }

    /**
     * Get key name from index for deserialization
     * @param {number} index - Index in KEY_NAMES array
     * @returns {string} - Key name
     */
    static getKeyNameFromIndex(index) {
        return Game.KEY_NAMES[index] || 'C Major';
    }

    // Note mappings for compact encoding (index 0 = empty)
    static MELODY_NOTES = ['', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    static BASS_NOTES = ['', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3'];
    static PERC_NOTES = ['', 'kick', 'snare', 'hihat', 'clap'];
    static MELODY_ICONS = ['', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚪', '❤️'];
    static BASS_ICONS = ['', '🟦', '🟪', '🟫', '⬛', '💙', '💜'];
    static PERC_ICONS = ['', '🥁', '🪘', '🔔', '👏'];
    
    // Encoding version: increment when format changes
    // v1: 10 bits per beat (no duration)
    // v2: 16 bits per beat (with duration for melody/bass)
    static ENCODING_VERSION = 2;

    /**
     * Serialize current state to a compact binary URL-safe string
     * Format: "v{version}_{base64data}"
     * 
     * v2 Binary format:
     * Header: 5 bits (speed:2, loop:1, lengthIndex:2)
     * Per beat: 16 bits (melody:4, melodyDur:3, bass:3, bassDur:3, percussion:3)
     * Duration is stored as (duration - 1) to fit 1-8 in 3 bits
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
            const melodyData = this.findNoteDataAtBeat(tracks.melody, i);
            const bassData = this.findNoteDataAtBeat(tracks.bass, i);
            const percData = this.findNoteDataAtBeat(tracks.percussion, i);
            
            const melodyIdx = Game.MELODY_NOTES.indexOf(melodyData.note);
            const bassIdx = Game.BASS_NOTES.indexOf(bassData.note);
            const percIdx = Game.PERC_NOTES.indexOf(percData.note);
            
            // Melody: 4 bits note + 3 bits duration (0-7 = duration 1-8)
            this.pushBits(bits, Math.max(0, melodyIdx), 4);
            this.pushBits(bits, Math.min(7, Math.max(0, melodyData.duration - 1)), 3);
            
            // Bass: 3 bits note + 3 bits duration
            this.pushBits(bits, Math.max(0, bassIdx), 3);
            this.pushBits(bits, Math.min(7, Math.max(0, bassData.duration - 1)), 3);
            
            // Percussion: 3 bits note (no duration needed for percussion)
            this.pushBits(bits, Math.max(0, percIdx), 3);
        }
        
        // Convert bits to bytes
        const bytes = this.bitsToBytes(bits);
        
        // Convert to URL-safe base64
        let base64 = '';
        for (let i = 0; i < bytes.length; i++) {
            base64 += String.fromCharCode(bytes[i]);
        }
        const data = btoa(base64).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        
        // Prefix with version
        return `v${Game.ENCODING_VERSION}_${data}`;
    }

    /**
     * Find note data (note and duration) at a specific beat from serialized track data
     * @returns {Object} - { note: string, duration: number }
     */
    findNoteDataAtBeat(trackData, beat) {
        for (const item of trackData) {
            if (item[0] === beat) {
                return { note: item[1], duration: item[3] || 1 };
            }
        }
        return { note: '', duration: 1 };
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
     * Supports both v1 (no duration) and v2 (with duration) formats
     * @param {string} encoded - Encoded state string
     * @returns {Object|null}
     */
    deserializeState(encoded) {
        try {
            // Check for version prefix
            let version = 1;
            let data = encoded;
            
            const versionMatch = encoded.match(/^v(\d+)_(.+)$/);
            if (versionMatch) {
                version = parseInt(versionMatch[1]);
                data = versionMatch[2];
            }
            
            // Restore base64 padding and characters
            let base64 = data.replace(/-/g, '+').replace(/_/g, '/');
            while (base64.length % 4) base64 += '=';
            
            // Decode base64 to bytes
            const decoded = atob(base64);
            const bytes = [];
            for (let i = 0; i < decoded.length; i++) {
                bytes.push(decoded.charCodeAt(i));
            }
            
            // Convert to bits
            const bits = this.bytesToBits(bytes);
            
            // Dispatch to version-specific decoder
            if (version === 1) {
                return this.deserializeV1(bits);
            } else if (version === 2) {
                return this.deserializeV2(bits);
            } else {
                console.warn(`Unknown encoding version: ${version}`);
                return null;
            }
        } catch (e) {
            console.warn('Failed to decode state from URL:', e);
            return null;
        }
    }

    /**
     * Deserialize v1 format (no duration support)
     * Per beat: 10 bits (melody:4, bass:3, percussion:3)
     */
    deserializeV1(bits) {
        let offset = 0;
        
        // Read header
        const speedIndex = this.readBits(bits, offset, 2); offset += 2;
        const loop = this.readBits(bits, offset, 1); offset += 1;
        const lengthIndex = this.readBits(bits, offset, 2); offset += 2;
        
        const beatCount = this.beatLengths[lengthIndex] || 16;
        
        // Read track data (v1: no duration)
        const melody = [];
        const bass = [];
        const percussion = [];
        
        for (let i = 0; i < beatCount; i++) {
            const melodyIdx = this.readBits(bits, offset, 4); offset += 4;
            const bassIdx = this.readBits(bits, offset, 3); offset += 3;
            const percIdx = this.readBits(bits, offset, 3); offset += 3;
            
            if (melodyIdx > 0 && melodyIdx < Game.MELODY_NOTES.length) {
                melody.push([i, Game.MELODY_NOTES[melodyIdx], Game.MELODY_ICONS[melodyIdx], 1]);
            }
            if (bassIdx > 0 && bassIdx < Game.BASS_NOTES.length) {
                bass.push([i, Game.BASS_NOTES[bassIdx], Game.BASS_ICONS[bassIdx], 1]);
            }
            if (percIdx > 0 && percIdx < Game.PERC_NOTES.length) {
                percussion.push([i, Game.PERC_NOTES[percIdx], Game.PERC_ICONS[percIdx], 1]);
            }
        }
        
        return {
            s: speedIndex,
            l: loop,
            b: beatCount,
            t: { melody, bass, percussion }
        };
    }

    /**
     * Deserialize v2 format (with duration support)
     * Per beat: 16 bits (melody:4, melodyDur:3, bass:3, bassDur:3, percussion:3)
     */
    deserializeV2(bits) {
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
            // Melody: 4 bits note + 3 bits duration
            const melodyIdx = this.readBits(bits, offset, 4); offset += 4;
            const melodyDur = this.readBits(bits, offset, 3) + 1; offset += 3;
            
            // Bass: 3 bits note + 3 bits duration
            const bassIdx = this.readBits(bits, offset, 3); offset += 3;
            const bassDur = this.readBits(bits, offset, 3) + 1; offset += 3;
            
            // Percussion: 3 bits note (no duration)
            const percIdx = this.readBits(bits, offset, 3); offset += 3;
            
            if (melodyIdx > 0 && melodyIdx < Game.MELODY_NOTES.length) {
                melody.push([i, Game.MELODY_NOTES[melodyIdx], Game.MELODY_ICONS[melodyIdx], melodyDur]);
            }
            if (bassIdx > 0 && bassIdx < Game.BASS_NOTES.length) {
                bass.push([i, Game.BASS_NOTES[bassIdx], Game.BASS_ICONS[bassIdx], bassDur]);
            }
            if (percIdx > 0 && percIdx < Game.PERC_NOTES.length) {
                percussion.push([i, Game.PERC_NOTES[percIdx], Game.PERC_ICONS[percIdx], 1]);
            }
        }
        
        return {
            s: speedIndex,
            l: loop,
            b: beatCount,
            t: { melody, bass, percussion }
        };
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
