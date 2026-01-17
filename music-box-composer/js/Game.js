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
        this.updateShareButtons();
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
            shareBtn: document.getElementById('shareBtn'),
            qrBtn: document.getElementById('qrBtn'),
            loadQrBtn: document.getElementById('loadQrBtn'),
            qrFileInput: document.getElementById('qrFileInput'),
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
            characterRight: document.getElementById('characterRight'),
            qrModal: document.getElementById('qr-modal'),
            qrModalOverlay: document.getElementById('qr-modal-overlay'),
            qrCanvas: document.getElementById('qr-canvas'),
            closeQrBtn: document.getElementById('close-qr-btn'),
            downloadQrBtn: document.getElementById('download-qr-btn')
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
        this.elements.shareBtn.addEventListener('click', () => this.shareURL());
        this.elements.qrBtn.addEventListener('click', () => this.showQRCode());
        this.elements.loadQrBtn.addEventListener('click', () => this.loadFromQRCode());
        this.elements.qrFileInput.addEventListener('change', (e) => this.handleQRFileSelected(e));
        this.elements.lengthUpBtn.addEventListener('click', () => this.changeLength(1));
        this.elements.lengthDownBtn.addEventListener('click', () => this.changeLength(-1));
        this.elements.keySelect.addEventListener('change', (e) => this.setKey(e.target.value));
        
        // QR modal events
        this.elements.closeQrBtn.addEventListener('click', () => this.closeQRModal());
        this.elements.qrModalOverlay.addEventListener('click', () => this.closeQRModal());
        this.elements.downloadQrBtn.addEventListener('click', () => this.downloadQRCode());
        
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
    
    // Piano keyboard icon mapping (matches PianoKeyboard.js)
    static PIANO_ICONS = {
        'C': 'C', 'C#': 'C♯', 'D': 'D', 'D#': 'D♯', 'E': 'E', 'F': 'F',
        'F#': 'F♯', 'G': 'G', 'G#': 'G♯', 'A': 'A', 'A#': 'A♯', 'B': 'B'
    };
    
    // Encoding version: increment when format changes
    // v1: 10 bits per beat (no duration)
    // v2: 16 bits per beat (with duration for melody/bass)
    // v3: 17 bits per beat (piano notes with octave, key signature)
    static ENCODING_VERSION = 3;

    /**
     * Serialize current state to a compact binary URL-safe string
     * Format: "v{version}_{base64data}"
     * @returns {string}
     */
    serializeState() {
        return this.serializeV3();
    }

    /**
     * Serialize v3 format with piano keyboard and key signatures
     * 
     * v3 Binary format:
     * Header: 9 bits (speed:2, loop:1, lengthIndex:2, keyIndex:4)
     * Per beat: 17 bits (piano1:4, dur1:3, piano2:4, dur2:3, percussion:3)
     * Duration is stored as (duration - 1) to fit 1-8 in 3 bits
     * @returns {string}
     */
    serializeV3() {
        const beatCount = this.timeline.getBeatCount();
        const lengthIndex = this.beatLengths.indexOf(beatCount);
        const keyIndex = Game.KEY_NAMES.indexOf(this.currentKey);
        
        // Build bit array
        const bits = [];
        
        // Header: speed (2 bits), loop (1 bit), length index (2 bits), key (4 bits)
        this.pushBits(bits, this.currentSpeedIndex, 2);
        this.pushBits(bits, this.isLooping ? 1 : 0, 1);
        this.pushBits(bits, lengthIndex, 2);
        this.pushBits(bits, keyIndex, 4);
        
        // Track data for each beat
        for (let beat = 0; beat < beatCount; beat++) {
            const notes = this.timeline.getNotesAtBeat(beat);
            
            // Piano track 1 (high): note index (4 bits) + duration (3 bits)
            const note1 = notes[1];
            const note1Index = note1 && !note1.sustained ? this.getNoteIndex(note1.note) : 0;
            const duration1 = note1 && !note1.sustained ? note1.duration : 1;
            this.pushBits(bits, note1Index, 4);
            this.pushBits(bits, Math.min(7, Math.max(0, duration1 - 1)), 3);
            
            // Piano track 2 (low): note index (4 bits) + duration (3 bits)
            const note2 = notes[2];
            const note2Index = note2 && !note2.sustained ? this.getNoteIndex(note2.note) : 0;
            const duration2 = note2 && !note2.sustained ? note2.duration : 1;
            this.pushBits(bits, note2Index, 4);
            this.pushBits(bits, Math.min(7, Math.max(0, duration2 - 1)), 3);
            
            // Percussion track: note index (3 bits)
            const note3 = notes[3];
            const note3Index = note3 && !note3.sustained ? Game.PERC_NOTES.indexOf(note3.note) : 0;
            this.pushBits(bits, Math.max(0, note3Index), 3);
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
     * Get note index in PIANO_NOTES array from note name (without octave)
     * @param {string} note - Note name (e.g., 'C', 'C#', 'D')
     * @returns {number} - Index (0-12)
     */
    getNoteIndex(note) {
        // PIANO_NOTES array from PianoKeyboard.js: ['', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        const PIANO_NOTES = ['', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const index = PIANO_NOTES.indexOf(note);
        return Math.max(0, index);
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
            } else if (version === 3) {
                return this.deserializeV3(bits);
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
     * Get proper piano icon for a note (with sharp symbols)
     * @param {string} note - Note name (C, C#, D, etc.)
     * @returns {string} Display icon
     */
    getPianoIcon(note) {
        return Game.PIANO_ICONS[note] || note;
    }

    /**
     * Deserialize v1 format (no duration support)
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
        
        // v1 used [8, 16, 24, 32], map to v3's [16, 32, 48, 64]
        const v1BeatLengths = [8, 16, 24, 32];
        const v1BeatCount = v1BeatLengths[lengthIndex] || 16;
        const beatCount = v1BeatCount <= 16 ? 16 : v1BeatCount <= 32 ? 32 : v1BeatCount <= 48 ? 48 : 64;
        
        // Read track data (v1: no duration)
        const melody = [];
        const bass = [];
        const percussion = [];
        
        for (let i = 0; i < beatCount; i++) {
            const melodyIdx = this.readBits(bits, offset, 4); offset += 4;
            const bassIdx = this.readBits(bits, offset, 3); offset += 3;
            const percIdx = this.readBits(bits, offset, 3); offset += 3;
            
            if (melodyIdx > 0 && melodyIdx < Game.MELODY_NOTES.length) {
                // Convert old format (C4) to new format (C with octave 5)
                const oldNote = Game.MELODY_NOTES[melodyIdx];
                const note = oldNote.replace(/\d+$/, ''); // Remove octave from note name
                const icon = this.getPianoIcon(note); // Use proper icon with sharp symbols
                melody.push([i, note, icon, 1, 5]); // Add octave 5 for melody track
            }
            if (bassIdx > 0 && bassIdx < Game.BASS_NOTES.length) {
                // Convert old format (C3) to new format (C with octave 3)
                const oldNote = Game.BASS_NOTES[bassIdx];
                const note = oldNote.replace(/\d+$/, ''); // Remove octave from note name
                const icon = this.getPianoIcon(note); // Use proper icon with sharp symbols
                bass.push([i, note, icon, 1, 3]); // Add octave 3 for bass track
            }
            if (percIdx > 0 && percIdx < Game.PERC_NOTES.length) {
                percussion.push([i, Game.PERC_NOTES[percIdx], Game.PERC_ICONS[percIdx], 1, null]);
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
        
        // v2 used [8, 16, 24, 32], map to v3's [16, 32, 48, 64]
        const v2BeatLengths = [8, 16, 24, 32];
        const v2BeatCount = v2BeatLengths[lengthIndex] || 16;
        const beatCount = v2BeatCount <= 16 ? 16 : v2BeatCount <= 32 ? 32 : v2BeatCount <= 48 ? 48 : 64;
        
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
                // Convert old format (C4) to new format (C with octave 5)
                const oldNote = Game.MELODY_NOTES[melodyIdx];
                const note = oldNote.replace(/\d+$/, ''); // Remove octave from note name
                const icon = this.getPianoIcon(note); // Use proper icon with sharp symbols
                melody.push([i, note, icon, melodyDur, 5]); // Add octave 5 for melody track
            }
            if (bassIdx > 0 && bassIdx < Game.BASS_NOTES.length) {
                // Convert old format (C3) to new format (C with octave 3)
                const oldNote = Game.BASS_NOTES[bassIdx];
                const note = oldNote.replace(/\d+$/, ''); // Remove octave from note name
                const icon = this.getPianoIcon(note); // Use proper icon with sharp symbols
                bass.push([i, note, icon, bassDur, 3]); // Add octave 3 for bass track
            }
            if (percIdx > 0 && percIdx < Game.PERC_NOTES.length) {
                percussion.push([i, Game.PERC_NOTES[percIdx], Game.PERC_ICONS[percIdx], 1, null]);
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
     * Deserialize v3 format (piano keyboard with key signatures)
     * Header: 9 bits (speed:2, loop:1, lengthIndex:2, keyIndex:4)
     * Per beat: 17 bits (piano1:4, dur1:3, piano2:4, dur2:3, percussion:3)
     */
    deserializeV3(bits) {
        const PIANO_NOTES = ['', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const PIANO_ICONS = {
            'C': '🔴', 'C#': '🟠', 'D': '🟡', 'D#': '🟢', 'E': '🔵', 'F': '🟣',
            'F#': '🟤', 'G': '⚪', 'G#': '🟥', 'A': '🟧', 'A#': '🟨', 'B': '🟩'
        };
        
        let offset = 0;
        
        // Read header (9 bits)
        const speedIndex = this.readBits(bits, offset, 2); offset += 2;
        const loop = this.readBits(bits, offset, 1); offset += 1;
        const lengthIndex = this.readBits(bits, offset, 2); offset += 2;
        const keyIndex = this.readBits(bits, offset, 4); offset += 4;
        
        const beatCount = this.beatLengths[lengthIndex] || 16;
        const keyName = Game.KEY_NAMES[keyIndex] || 'C Major';
        
        // Read track data
        const track1 = []; // High piano (octave 5)
        const track2 = []; // Low piano (octave 3)
        const track3 = []; // Percussion
        
        for (let beat = 0; beat < beatCount; beat++) {
            // Piano track 1: 4 bits note + 3 bits duration
            const note1Index = this.readBits(bits, offset, 4); offset += 4;
            const duration1 = this.readBits(bits, offset, 3) + 1; offset += 3;
            
            // Piano track 2: 4 bits note + 3 bits duration
            const note2Index = this.readBits(bits, offset, 4); offset += 4;
            const duration2 = this.readBits(bits, offset, 3) + 1; offset += 3;
            
            // Percussion: 3 bits note
            const percIndex = this.readBits(bits, offset, 3); offset += 3;
            
            // Add notes if valid
            if (note1Index > 0 && note1Index < PIANO_NOTES.length) {
                const note = PIANO_NOTES[note1Index];
                track1.push([beat, note, PIANO_ICONS[note], duration1, 5]); // octave 5
            }
            if (note2Index > 0 && note2Index < PIANO_NOTES.length) {
                const note = PIANO_NOTES[note2Index];
                track2.push([beat, note, PIANO_ICONS[note], duration2, 3]); // octave 3
            }
            if (percIndex > 0 && percIndex < Game.PERC_NOTES.length) {
                track3.push([beat, Game.PERC_NOTES[percIndex], Game.PERC_ICONS[percIndex], 1, null]); // no octave
            }
        }
        
        return {
            s: speedIndex,
            l: loop,
            b: beatCount,
            k: keyName,
            t: { track1, track2, track3 }
        };
    }

    /**
     * Update URL with current state
     */
    updateURL() {
        const encoded = this.serializeState();
        const newURL = `${window.location.pathname}?c=${encoded}`;
        window.history.replaceState(null, '', newURL);
        this.updateShareButtons();
    }

    /**
     * Share current song URL using Web Share API or clipboard fallback
     */
    async shareURL() {
        const url = window.location.href;
        
        // Try Web Share API first (mobile support)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Music Box Composer',
                    text: 'Check out my song!',
                    url: url
                });
            } catch (err) {
                // User cancelled share or error occurred
                if (err.name !== 'AbortError') {
                    console.error('Share failed:', err);
                    this.fallbackCopyURL(url);
                }
            }
        } else {
            // Fallback to clipboard copy
            this.fallbackCopyURL(url);
        }
    }

    /**
     * Fallback method to copy URL to clipboard
     */
    fallbackCopyURL(url) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url)
                .then(() => {
                    this.showShareMessage('Copied to clipboard!');
                })
                .catch(err => {
                    console.error('Clipboard copy failed:', err);
                    this.showShareMessage('Failed to copy', true);
                });
        } else {
            // Ultra-fallback: use older execCommand
            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showShareMessage('Copied to clipboard!');
            } catch (err) {
                console.error('Copy failed:', err);
                this.showShareMessage('Failed to copy', 'error');
            }
            document.body.removeChild(textArea);
        }
    }

    /**
     * Show temporary message to user
     */
    showShareMessage(message, type = 'success') {
        const messageEl = document.getElementById('share-message');
        if (!messageEl) return;
        
        messageEl.textContent = message;
        messageEl.className = `share-message ${type}`;
        messageEl.classList.remove('hidden');
        
        // Hide after 3 seconds (longer for info messages)
        const duration = type === 'info' ? 3000 : 2000;
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, duration);
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
        
        this.applyState(state);
    }

    /**
     * Generate and display QR code for current song URL
     */
    showQRCode() {
        const url = window.location.href;
        
        // For local development, suggest using network IP instead of localhost
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            console.warn('QR code contains localhost URL - this will not work on other devices.');
            console.log('To test on mobile, access the site using your computer\'s network IP address.');
        }
        
        // Generate QR code
        const canvas = QRCodeGenerator.generate(url, 256);
        
        // Replace existing canvas
        const oldCanvas = this.elements.qrCanvas;
        canvas.id = 'qr-canvas';
        oldCanvas.replaceWith(canvas);
        
        // Update cache reference
        this.elements.qrCanvas = canvas;
        
        // Show modal
        this.elements.qrModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    /**
     * Close QR code modal
     */
    closeQRModal() {
        this.elements.qrModal.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scroll
    }

    /**
     * Download QR code as PNG image
     */
    downloadQRCode() {
        const canvas = this.elements.qrCanvas;
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'music-box-song-qr.png';
            link.href = url;
            link.click();
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }, 'image/png');
    }

    /**
     * Update share button visibility based on song length
     * Shows QR button for songs >32 beats or long URLs
     */
    updateShareButtons() {
        // Both QR buttons are always visible now
        // Generate QR: useful for all song lengths
        // Load QR: essential for PWA users
    }

    /**
     * Trigger file picker to load QR code from image
     */
    loadFromQRCode() {
        this.elements.qrFileInput.click();
    }

    /**
     * Handle QR code image file selection
     * @param {Event} event - File input change event
     */
    async handleQRFileSelected(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            // Show loading message
            this.showShareMessage('📷 Reading QR code...', 'info');

            // Read file as data URL
            const reader = new FileReader();
            reader.onload = async (e) => {
                const imageData = e.target.result;
                
                // Use API to decode QR code
                const formData = new FormData();
                formData.append('file', file);
                
                try {
                    const response = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    
                    if (result && result[0] && result[0].symbol && result[0].symbol[0]) {
                        const qrData = result[0].symbol[0].data;
                        
                        if (qrData) {
                            // Extract the 'c' parameter from the URL
                            const url = new URL(qrData);
                            const encoded = url.searchParams.get('c');
                            
                            if (encoded) {
                                // Load the song
                                const state = this.deserializeState(encoded);
                                if (state) {
                                    this.applyState(state);
                                    this.showShareMessage('✅ Song loaded!', 'success');
                                } else {
                                    this.showShareMessage('❌ Invalid song data', 'error');
                                }
                            } else {
                                this.showShareMessage('❌ No song data in QR code', 'error');
                            }
                        } else {
                            this.showShareMessage('❌ Could not read QR code', 'error');
                        }
                    } else {
                        this.showShareMessage('❌ No QR code found in image', 'error');
                    }
                } catch (error) {
                    console.error('QR decode error:', error);
                    this.showShareMessage('❌ Failed to decode QR code', 'error');
                }
            };
            
            reader.onerror = () => {
                this.showShareMessage('❌ Failed to read image file', 'error');
            };
            
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('QR load error:', error);
            this.showShareMessage('❌ Failed to load QR code', 'error');
        } finally {
            // Reset file input
            event.target.value = '';
        }
    }

    /**
     * Apply deserialized state to the game
     * @param {Object} state - Deserialized state object
     */
    applyState(state) {
        // Apply speed
        if (typeof state.s === 'number' && state.s >= 0 && state.s < this.speeds.length) {
            this.currentSpeedIndex = state.s;
            this.elements.speedBtn.textContent = this.speeds[this.currentSpeedIndex].icon;
        }
        
        // Apply loop
        if (state.l === 1) {
            this.isLooping = true;
            this.elements.loopBtn.classList.add('active');
        } else {
            this.isLooping = false;
            this.elements.loopBtn.classList.remove('active');
        }
        
        // Apply beat count
        if (typeof state.b === 'number' && this.beatLengths.includes(state.b)) {
            this.timeline.setBeatCount(state.b);
            this.elements.beatCount.textContent = state.b;
        }
        
        // Apply key (v3 only)
        if (state.k && Game.KEY_NAMES.includes(state.k)) {
            this.setKey(state.k);
            this.elements.keySelect.value = state.k;
        }
        
        // Apply tracks
        if (state.t) {
            this.timeline.deserializeTracks(state.t);
        }
        
        // Update URL
        this.updateURL();
    }
}

window.Game = Game;
