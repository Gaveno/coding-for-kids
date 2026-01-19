/**
 * Game.js - Main game controller for Music Box Composer
 */
class Game {
    // Mode definitions
    static MODES = {
        KID: 'kid',
        TWEEN: 'tween',
        STUDIO: 'studio'
    };
    
    // Mode configurations
    static MODE_CONFIGS = {
        kid: {
            maxBeats: 64,
            maxTracks: 3,
            canAddTracks: false,
            showSharps: false,
            showKeySelector: false,
            showDuration: false,
            speeds: [0, 2],  // Only slow and fast
            percussionCount: 4
        },
        tween: {
            maxBeats: 128,
            maxTracks: 4,
            canAddTracks: true,
            showSharps: true,
            showKeySelector: true,
            showDuration: true,
            speeds: [0, 1, 2, 3],  // All speeds
            percussionCount: 8
        },
        studio: {
            maxBeats: 256,
            maxTracks: 6,
            canAddTracks: true,
            showSharps: true,
            showKeySelector: true,
            showDuration: true,
            speeds: 'bpm',  // Uses BPM input instead
            percussionCount: 12
        }
    };
    
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
        // Mode state
        this.currentMode = this.loadMode();
        
        this.audio = new Audio();
        this.timeline = null;
        this.visualizer = null;
        this.dragDrop = null;
        this.pianoKeyboard = null;
        this.patternLibrary = null;
        this.patternDrawer = null;
        
        // Pattern placements
        this.patternPlacements = new Map(); // placementId -> { placementId, patternId, startBeat, noteIds }
        this.patternBlocks = new Map(); // placementId -> PatternBlock instance
        
        this.isPlaying = false;
        this.isLooping = false;
        this.currentBeat = 0;
        this.playbackInterval = null;
        this.animationFrame = null;
        
        // BPM mode (Studio Mode)
        this.currentBPM = 120; // Default BPM
        this.useBPM = false; // Toggle between presets and BPM
        
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
        
        // Apply mode after components are initialized
        this.setMode(this.currentMode, false); // Don't re-save to localStorage
        
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
            tapTempoBtn: document.getElementById('tapTempoBtn'),
            bpmInput: document.getElementById('bpmInput'),
            loopBtn: document.getElementById('loopBtn'),
            clearBtn: document.getElementById('clearBtn'),
            shareBtn: document.getElementById('shareBtn'),
            qrBtn: document.getElementById('qrBtn'),
            loadQrBtn: document.getElementById('loadQrBtn'),
            qrFileInput: document.getElementById('qrFileInput'),
            exportWavBtn: document.getElementById('exportWavBtn'),
            exportMidiBtn: document.getElementById('exportMidiBtn'),
            lengthUpBtn: document.getElementById('lengthUpBtn'),
            lengthDownBtn: document.getElementById('lengthDownBtn'),
            beatCount: document.getElementById('beatCount'),
            timeline: document.getElementById('timeline'),
            timelineScroll: document.getElementById('timelineScroll'),
            beatMarkers: document.getElementById('beatMarkers'),
            patternBlocksRow: document.getElementById('patternBlocksRow'),
            playhead: document.getElementById('playhead'),
            cells1: document.getElementById('cells1'),
            cells2: document.getElementById('cells2'),
            cells3: document.getElementById('cells3'),
            palette: document.querySelector('.palette'),
            pianoKeyboardContainer: document.getElementById('piano-keyboard-container'),
            octaveUpBtn: document.getElementById('octaveUpBtn'),
            octaveDownBtn: document.getElementById('octaveDownBtn'),
            keySelect: document.getElementById('key-select'),
            stage: document.querySelector('.stage'),
            qrModal: document.getElementById('qr-modal'),
            qrModalOverlay: document.getElementById('qr-modal-overlay'),
            qrCanvas: document.getElementById('qr-canvas'),
            closeQrBtn: document.getElementById('close-qr-btn'),
            downloadQrBtn: document.getElementById('download-qr-btn'),
            clearModal: document.getElementById('clear-modal'),
            clearModalOverlay: document.getElementById('clear-modal-overlay'),
            confirmClearBtn: document.getElementById('confirm-clear-btn'),
            cancelClearBtn: document.getElementById('cancel-clear-btn'),
            trackSettingsModal: document.getElementById('track-settings-modal'),
            trackSettingsOverlay: document.getElementById('track-settings-overlay'),
            trackSettingsTitle: document.getElementById('track-settings-title'),
            closeTrackSettingsBtn: document.getElementById('close-track-settings-btn'),
            waveformButtons: document.getElementById('waveform-buttons'),
            modalReverbBtn: document.getElementById('modal-reverb-btn'),
            modalDelayBtn: document.getElementById('modal-delay-btn'),
            addTrackBtn: document.getElementById('addTrackBtn'),
            addTrackModal: document.getElementById('add-track-modal'),
            addTrackOverlay: document.getElementById('add-track-overlay'),
            addTrackTitle: document.getElementById('add-track-title'),
            currentTrackCount: document.getElementById('current-track-count'),
            maxTrackCount: document.getElementById('max-track-count'),
            addPianoBtn: document.getElementById('add-piano-btn'),
            addPercussionBtn: document.getElementById('add-percussion-btn'),
            cancelAddTrackBtn: document.getElementById('cancel-add-track-btn')
        };
        
        // Cache track label buttons
        this.trackLabelButtons = document.querySelectorAll('.track-label.clickable');
    }

    /**
     * Initialize sub-components
     */
    initComponents() {
        // Visualizer manager
        this.visualizer = new VisualizerManager(this.elements.stage);
        
        // Piano keyboard
        this.pianoKeyboard = new PianoKeyboard(
            this.elements.pianoKeyboardContainer,
            () => {
                // Re-setup drag/drop listeners after keyboard renders
                if (this.dragDrop) {
                    this.dragDrop.setupPianoKeyboard();
                }
            }
        );
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
            patternBlocksRow: this.elements.patternBlocksRow,
            playhead: this.elements.playhead,
            cells1: this.elements.cells1,
            cells2: this.elements.cells2,
            cells3: this.elements.cells3,
            onCellClick: (trackNum, beat) => this.handleCellClick(trackNum, beat),
            onNoteChange: () => this.updateURL(),
            onBeatClick: (beat) => this.seekToBeat(beat)
        });
        
        // Set up track management callbacks
        this.timeline.setOnTrackRemove((trackNum) => this.removeTrack(trackNum));
        this.timeline.setOnTrackSelect((trackNum) => this.selectTrack(trackNum));
        this.timeline.setOnTrackLabelClick((trackNum) => {
            if (this.currentMode === Game.MODES.STUDIO) {
                this.showTrackSettings(trackNum);
            }
        });
        
        // Drag and drop
        this.dragDrop = new DragDrop({
            palette: this.elements.palette,
            pianoKeyboard: this.pianoKeyboard,
            timeline: this.timeline,
            onPreview: (note, trackNum, octave) => this.previewNote(note, trackNum, octave),
            onDrop: (trackNum, beat, noteData) => this.handleNoteDrop(trackNum, beat, noteData)
        });
        
        // Pattern library and drawer
        this.patternLibrary = new PatternLibrary();
        this.patternDrawer = new PatternDrawer(this, this.patternLibrary);
        
        // Select default tracks (one piano, one percussion)
        this.selectTrack(1); // Select first piano track
        this.selectTrack(3); // Select first percussion track
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
        // Mode selector buttons
        const modeBtns = document.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                this.setMode(mode);
                this.updateModeButtonStates();
            });
        });
        
        this.elements.playBtn.addEventListener('click', () => this.togglePlay());
        this.elements.stopBtn.addEventListener('click', () => this.stop());
        this.elements.speedBtn.addEventListener('click', () => this.cycleSpeed());
        this.elements.tapTempoBtn.addEventListener('click', () => this.handleTapTempo());
        this.elements.loopBtn.addEventListener('click', () => this.toggleLoop());
        this.elements.clearBtn.addEventListener('click', () => this.showClearConfirmation());
        this.elements.shareBtn.addEventListener('click', () => this.shareURL());
        this.elements.qrBtn.addEventListener('click', () => this.showQRCode());
        this.elements.loadQrBtn.addEventListener('click', () => this.loadFromQRCode());
        this.elements.qrFileInput.addEventListener('change', (e) => this.handleQRFileSelected(e));
        this.elements.exportWavBtn.addEventListener('click', () => this.exportWAV());
        this.elements.exportMidiBtn.addEventListener('click', () => this.exportMIDI());
        this.elements.lengthUpBtn.addEventListener('click', () => this.changeLength(1));
        this.elements.lengthDownBtn.addEventListener('click', () => this.changeLength(-1));
        this.elements.keySelect.addEventListener('change', (e) => this.setKey(e.target.value));
        
        // Octave controls (Studio Mode)
        if (this.elements.octaveUpBtn) {
            this.elements.octaveUpBtn.addEventListener('click', () => {
                if (this.pianoKeyboard) {
                    this.pianoKeyboard.octaveUp();
                }
            });
        }
        if (this.elements.octaveDownBtn) {
            this.elements.octaveDownBtn.addEventListener('click', () => {
                if (this.pianoKeyboard) {
                    this.pianoKeyboard.octaveDown();
                }
            });
        }
        
        // BPM Input (Studio Mode)
        if (this.elements.bpmInput) {
            this.elements.bpmInput.addEventListener('input', (e) => {
                const bpm = parseInt(e.target.value, 10);
                if (bpm >= 40 && bpm <= 800) {
                    this.setBPM(bpm);
                }
            });
            this.elements.bpmInput.addEventListener('change', (e) => {
                // Clamp value on blur
                let bpm = parseInt(e.target.value, 10);
                if (isNaN(bpm) || bpm < 40) bpm = 40;
                if (bpm > 800) bpm = 800;
                e.target.value = bpm;
                this.setBPM(bpm);
            });
        }
        
        // QR modal events
        this.elements.closeQrBtn.addEventListener('click', () => this.closeQRModal());
        this.elements.qrModalOverlay.addEventListener('click', () => this.closeQRModal());
        this.elements.downloadQrBtn.addEventListener('click', () => this.downloadQRCode());
        
        // Clear modal events
        this.elements.confirmClearBtn.addEventListener('click', () => this.confirmClear());
        this.elements.cancelClearBtn.addEventListener('click', () => this.closeClearModal());
        this.elements.clearModalOverlay.addEventListener('click', () => this.closeClearModal());
        
        // Track settings modal events (Studio Mode)
        this.trackLabelButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.currentMode === Game.MODES.STUDIO) {
                    const trackNum = parseInt(btn.getAttribute('data-track'));
                    this.showTrackSettings(trackNum);
                }
            });
        });
        
        // Track row selection (all modes)
        document.querySelectorAll('.track').forEach(trackEl => {
            trackEl.addEventListener('click', (e) => {
                // Don't interfere with note clicks or track label clicks
                if (e.target.closest('.cell-note') || 
                    e.target.closest('.track-label') || 
                    e.target.closest('.track-cell')) {
                    return;
                }
                
                const trackNum = parseInt(trackEl.dataset.track);
                this.selectTrack(trackNum);
            });
        });
        
        this.elements.closeTrackSettingsBtn.addEventListener('click', () => this.closeTrackSettings());
        this.elements.trackSettingsOverlay.addEventListener('click', () => this.closeTrackSettings());
        
        // Add Track modal events
        if (this.elements.addTrackBtn) {
            this.elements.addTrackBtn.addEventListener('click', () => this.showAddTrackModal());
        }
        if (this.elements.addPianoBtn) {
            this.elements.addPianoBtn.addEventListener('click', () => this.handleAddTrack('piano'));
        }
        if (this.elements.addPercussionBtn) {
            this.elements.addPercussionBtn.addEventListener('click', () => this.handleAddTrack('percussion'));
        }
        if (this.elements.cancelAddTrackBtn) {
            this.elements.cancelAddTrackBtn.addEventListener('click', () => this.closeAddTrackModal());
        }
        if (this.elements.addTrackOverlay) {
            this.elements.addTrackOverlay.addEventListener('click', () => this.closeAddTrackModal());
        }
        
        // Waveform buttons in modal
        const waveformBtns = this.elements.waveformButtons.querySelectorAll('.waveform-btn');
        waveformBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const waveform = btn.getAttribute('data-waveform');
                this.setModalWaveform(waveform);
            });
        });
        
        // Effect toggles in modal
        this.elements.modalReverbBtn.addEventListener('click', () => this.toggleModalEffect('reverb'));
        this.elements.modalDelayBtn.addEventListener('click', () => this.toggleModalEffect('delay'));
        
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
    previewNote(note, trackNum, octave = null) {
        // Determine track type from note
        const isPianoNote = !trackNum || trackNum === 1 || trackNum === 2;
        
        // Use selected track of appropriate type if trackNum not specified
        if (!trackNum) {
            const trackType = note === 'kick' || note === 'snare' || note === 'hihat' || 
                            note === 'clap' || note === 'tambourine' || note === 'cowbell' ||
                            note === 'shaker' || note === 'woodblock' ? 'percussion' : 'piano';
            const selectedTrack = this.getSelectedTrack(trackType);
            trackNum = selectedTrack ? selectedTrack.trackNumber : 1;
        }
        
        this.audio.playNote(note, trackNum, 0.25, 0.8, octave);
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
        // If no trackNum specified, use selected track of appropriate type
        if (!trackNum) {
            const trackType = noteData.note === 'kick' || noteData.note === 'snare' || 
                            noteData.note === 'hihat' || noteData.note === 'clap' ? 'percussion' : 'piano';
            const selectedTrack = this.getSelectedTrack(trackType);
            trackNum = selectedTrack ? selectedTrack.trackNumber : 1;
        }
        
        this.timeline.setNote(trackNum, beat, noteData);
        
        // Preview the dropped note with its octave
        // Use track type to determine preview behavior
        const track = this.timeline.tracks[trackNum];
        if (track && track.isPercussion()) {
            // Percussion preview (no octave, short duration)
            this.audio.playNote(noteData.note, trackNum, undefined, noteData.velocity || 0.8);
        } else {
            // Piano preview with octave and duration
            this.audio.playNote(noteData.note, trackNum, 0.25, noteData.velocity || 0.8, noteData.octave);
        }
        
        this.updateURL();
    }
    
    /**
     * Place a pattern in the timeline (stamp notes)
     * @param {string} patternId - Pattern ID (preset or custom)
     * @param {number} startBeat - Beat to place pattern
     */
    placePattern(patternId, startBeat) {
        const pattern = this.patternLibrary.getPattern(patternId);
        if (!pattern) {
            console.error('Pattern not found:', patternId);
            return false;
        }
        
        // Check if pattern would overlap with existing patterns
        const endBeat = startBeat + pattern.length;
        for (const placement of this.patternPlacements.values()) {
            const placementEnd = placement.startBeat + this.patternLibrary.getPattern(placement.patternId).length;
            if (!(endBeat <= placement.startBeat || startBeat >= placementEnd)) {
                console.log('Pattern would overlap with existing pattern');
                return false;
            }
        }
        
        // Generate unique placement ID
        const placementId = `placement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create placement record
        const placement = {
            placementId,
            patternId,
            startBeat,
            noteIds: new Set()
        };
        
        // Stamp notes from pattern into timeline
        for (const trackId in pattern.tracks) {
            const trackNotes = pattern.tracks[trackId];
            for (const noteArr of trackNotes) {
                const [beat, noteIndex, duration = 1, velocity = 0.8] = noteArr;
                const absoluteBeat = startBeat + beat;
                
                // Don't place beyond timeline length
                if (absoluteBeat >= this.timeline.beatCount) continue;
                
                // Convert noteIndex to note name
                const noteName = this.getNoteNameFromIndex(noteIndex, parseInt(trackId));
                const icon = this.getNoteDisplayIcon(noteName, parseInt(trackId));
                
                // Create note data
                const noteData = {
                    note: noteName,
                    duration: duration,
                    velocity: velocity,
                    octave: null,
                    icon: icon,
                    patternPlacementId: placementId // Link to pattern
                };
                
                // Generate note ID
                const noteId = `note_${trackId}_${absoluteBeat}`;
                placement.noteIds.add(noteId);
                
                // Add note to timeline
                this.timeline.setNote(parseInt(trackId), absoluteBeat, noteData);
            }
        }
        
        // Store placement
        this.patternPlacements.set(placementId, placement);
        
        // Create pattern block overlay
        const patternBlock = new PatternBlock(placement, pattern, this.timeline);
        patternBlock.onRemove = (id) => this.removePatternPlacement(id);
        this.patternBlocks.set(placementId, patternBlock);
        
        // Add to pattern blocks row
        this.timeline.patternBlocksRow.appendChild(patternBlock.getElement());
        
        this.updateURL();
        return true;
    }
    
    /**
     * Remove a pattern placement and all its notes
     * @param {string} placementId - Placement ID
     */
    removePatternPlacement(placementId) {
        const placement = this.patternPlacements.get(placementId);
        if (!placement) return;
        
        const pattern = this.patternLibrary.getPattern(placement.patternId);
        if (!pattern) return;
        
        // Remove all notes from this pattern
        for (const trackId in pattern.tracks) {
            const trackNotes = pattern.tracks[trackId];
            for (const [beat] of trackNotes) {
                const absoluteBeat = placement.startBeat + beat;
                const note = this.timeline.getNote(parseInt(trackId), absoluteBeat);
                
                // Only remove if it still belongs to this pattern
                if (note && note.patternPlacementId === placementId) {
                    this.timeline.clearNote(parseInt(trackId), absoluteBeat);
                }
            }
        }
        
        // Remove pattern block (disable callback to prevent recursion)
        const patternBlock = this.patternBlocks.get(placementId);
        if (patternBlock) {
            patternBlock.onRemove = null; // Prevent callback
            patternBlock.remove();
            this.patternBlocks.delete(placementId);
        }
        
        // Remove placement
        this.patternPlacements.delete(placementId);
        
        this.updateURL();
    }
    
    /**
     * Get icon for note (helper method)
     */
    getNoteIcon(trackId, noteIndex) {
        if (trackId === 3) {
            // Percussion
            const percIcons = ['🥁', '🪘', '🔔', '👏', '🎵', '💥', '🎶', '🔊'];
            return percIcons[noteIndex] || '🥁';
        } else {
            // Piano - use musical note
            return '♪';
        }
    }
    
    /**
     * Get display icon for note (shows note name for piano, emoji for percussion)
     */
    getNoteDisplayIcon(noteName, trackId) {
        if (trackId === 3) {
            // Percussion - use emoji icons
            const percIcons = {
                'kick': '🥁', 'snare': '🪘', 'hihat': '🔔', 'clap': '👏',
                'tom': '🎵', 'cymbal': '💥', 'shaker': '🎶', 'cowbell': '🔊'
            };
            return percIcons[noteName] || '🥁';
        } else {
            // Piano - use note name with sharp symbol
            const pianoIcons = {
                'C': 'C', 'C#': 'C♯', 'D': 'D', 'D#': 'D♯', 'E': 'E', 'F': 'F',
                'F#': 'F♯', 'G': 'G', 'G#': 'G♯', 'A': 'A', 'A#': 'A♯', 'B': 'B'
            };
            return pianoIcons[noteName] || noteName;
        }
    }

    getNoteNameFromIndex(noteIndex, trackId) {
        if (trackId === 3) {
            const percNames = ['kick', 'snare', 'hihat', 'clap', 'tom', 'cymbal', 'shaker', 'cowbell'];
            return percNames[noteIndex] || 'kick';
        } else {
            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            return noteNames[noteIndex] || 'C';
        }
    }

    /**
     * Refresh all placements of a specific pattern (re-stamps notes with updated pattern data)
     * @param {string} patternId - Pattern ID to refresh
     */
    refreshPatternPlacements(patternId) {
        const pattern = this.patternLibrary.getPattern(patternId);
        if (!pattern) return;

        // Find all placements of this pattern
        const placementsToRefresh = [];
        for (const [placementId, placement] of this.patternPlacements.entries()) {
            if (placement.patternId === patternId) {
                placementsToRefresh.push({ placementId, placement });
            }
        }

        // Refresh each placement
        for (const { placementId, placement } of placementsToRefresh) {
            // Remove old notes for this placement
            for (const trackId in pattern.tracks) {
                // Clear old notes (scan entire pattern range)
                for (let beat = 0; beat < pattern.length; beat++) {
                    const absoluteBeat = placement.startBeat + beat;
                    const note = this.timeline.getNote(parseInt(trackId), absoluteBeat);
                    
                    if (note && note.patternPlacementId === placementId) {
                        this.timeline.clearNote(parseInt(trackId), absoluteBeat);
                    }
                }
            }

            // Re-stamp notes from updated pattern
            for (const trackId in pattern.tracks) {
                const trackNotes = pattern.tracks[trackId];
                for (const noteArr of trackNotes) {
                    const [beat, noteIndex, duration = 1, velocity = 0.8] = noteArr;
                    const absoluteBeat = placement.startBeat + beat;
                    
                    // Don't place beyond timeline length
                    if (absoluteBeat >= this.timeline.beatCount) continue;
                    
                    // Convert noteIndex to note name
                    const noteName = this.getNoteNameFromIndex(noteIndex, parseInt(trackId));
                    const icon = this.getNoteDisplayIcon(noteName, parseInt(trackId));
                    
                    // Create note data
                    const noteData = {
                        note: noteName,
                        duration: duration,
                        velocity: velocity,
                        octave: null,
                        icon: icon,
                        patternPlacementId: placementId
                    };
                    
                    this.timeline.setNote(parseInt(trackId), absoluteBeat, noteData);
                }
            }

            // Update pattern block overlay
            const patternBlock = this.patternBlocks.get(placementId);
            if (patternBlock) {
                // Update pattern reference and re-render
                patternBlock.pattern = pattern;
                patternBlock.render();
                
                // Re-add event handler
                const deleteBtn = patternBlock.element.querySelector('.pattern-block-delete');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.removePatternPlacement(placementId);
                    });
                }
            }
        }

        // Re-render timeline to show updated notes
        this.timeline.render();
        this.updateURL();
    }

    /**
     * Seek playhead to a specific beat
     * @param {number} beat - Beat index to seek to
     */
    seekToBeat(beat) {
        // Don't seek if currently playing
        if (this.isPlaying) return;
        
        this.currentBeat = beat;
        this.timeline.updatePlayheadPosition(beat);
    }

    /**
     * Select a track for piano/percussion preview
     * @param {number} trackNum - Track number
     */
    selectTrack(trackNum) {
        const track = this.timeline.tracks[trackNum];
        if (!track) return;
        
        // Deselect all tracks of the same type (piano or percussion)
        Object.values(this.timeline.tracks).forEach(t => {
            if (t.trackType === track.trackType) {
                t.deselect();
            }
        });
        
        // Select target track
        track.select();
        this.updateTrackVisuals();
    }

    /**
     * Get the currently selected track
     * @param {string} trackType - 'piano' or 'percussion' (optional)
     * @returns {Track} - Selected track or first track of type
     */
    getSelectedTrack(trackType = null) {
        if (trackType) {
            // Find selected track of specific type
            const selected = Object.values(this.timeline.tracks).find(
                t => t.selected && t.trackType === trackType
            );
            // Default to first track of that type
            if (!selected) {
                return Object.values(this.timeline.tracks).find(t => t.trackType === trackType);
            }
            return selected;
        }
        
        // No type specified - return any selected track
        const selected = Object.values(this.timeline.tracks).find(t => t.selected);
        return selected || this.timeline.tracks[1]; // Default to track 1
    }

    /**
     * Get maximum tracks allowed for current mode
     * @returns {number} - Max track count
     */
    getMaxTracks() {
        return Game.MODE_CONFIGS[this.currentMode].maxTracks;
    }

    /**
     * Get maximum beats allowed for current mode
     * @returns {number} - Max beat count
     */
    getMaxBeats() {
        return Game.MODE_CONFIGS[this.currentMode].maxBeats;
    }

    /**
     * Check if user can add tracks in current mode
     * @returns {boolean}
     */
    canAddTracks() {
        return Game.MODE_CONFIGS[this.currentMode].canAddTracks && 
               Object.keys(this.timeline.tracks).length < this.getMaxTracks();
    }

    /**
     * Add a new track
     * @param {string} trackType - 'piano' or 'percussion'
     * @returns {number|null} - New track number or null if failed
     */
    addTrack(trackType) {
        if (!this.canAddTracks()) {
            console.warn('Cannot add more tracks in current mode');
            return null;
        }

        // Find next available track number
        const trackNumbers = Object.keys(this.timeline.tracks).map(n => parseInt(n));
        const nextTrackNum = Math.max(...trackNumbers) + 1;

        // Create new track
        const track = new Track(nextTrackNum, this.beatCount);
        track.trackType = trackType;
        
        // Assign octave for piano tracks (alternates high/low)
        if (trackType === 'piano') {
            const pianoTracks = Object.values(this.timeline.tracks)
                .filter(t => t.trackType === 'piano' || t.trackNumber <= 2);
            track.octaveShift = pianoTracks.length % 2 === 0 ? 0 : -12; // 0 = C4-B4, -12 = C3-B3
        }

        // Add to timeline
        this.timeline.tracks[nextTrackNum] = track;
        
        // Request UI update
        this.timeline.renderNewTrack(nextTrackNum);
        
        this.updateURL();
        return nextTrackNum;
    }

    /**
     * Remove a track
     * @param {number} trackNum - Track number to remove
     * @returns {boolean} - Success
     */
    removeTrack(trackNum) {
        const trackCount = Object.keys(this.timeline.tracks).length;
        
        // Cannot remove if at minimum (3 tracks)
        if (trackCount <= 3) {
            console.warn('Cannot remove default tracks');
            return false;
        }

        // Cannot remove default tracks (1, 2, 3)
        if (trackNum <= 3) {
            console.warn('Cannot remove default tracks');
            return false;
        }

        // Remove from timeline
        delete this.timeline.tracks[trackNum];
        
        // Request UI update
        this.timeline.removeTrackRow(trackNum);
        
        this.updateURL();
        return true;
    }

    /**
     * Reorder tracks
     * @param {number} fromIndex - Original track number
     * @param {number} toIndex - Target track number
     */
    reorderTracks(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;

        // Get all track numbers sorted
        const trackNums = Object.keys(this.timeline.tracks)
            .map(n => parseInt(n))
            .sort((a, b) => a - b);

        // Find positions in sorted array
        const fromPos = trackNums.indexOf(fromIndex);
        const toPos = trackNums.indexOf(toIndex);

        if (fromPos === -1 || toPos === -1) return;

        // Reorder array
        trackNums.splice(fromPos, 1);
        trackNums.splice(toPos, 0, fromIndex);

        // Rebuild tracks object in new order (reassign track numbers)
        const newTracks = {};
        trackNums.forEach((oldNum, idx) => {
            const track = this.timeline.tracks[oldNum];
            const newNum = idx + 1;
            track.trackNumber = newNum;
            newTracks[newNum] = track;
        });

        this.timeline.tracks = newTracks;
        
        // Request UI update
        this.timeline.reorderTrackRows();
        
        this.updateURL();
    }

    /**
     * Update track row visual states based on selection
     */
    updateTrackVisuals() {
        // Update track rows
        document.querySelectorAll('.track').forEach(trackEl => {
            const trackNum = parseInt(trackEl.dataset.track);
            const track = this.timeline.tracks[trackNum];
            
            if (track && track.selected) {
                trackEl.classList.add('selected');
            } else {
                trackEl.classList.remove('selected');
            }
        });
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
        
        this.visualizer.reset();
        
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
        this.visualizer.reset();
    }

    /**
     * Start the playback loop
     */
    startPlayback() {
        const beatDuration = this.getBeatDuration();
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
        
        // Calculate beat duration in seconds
        const beatDurationMs = this.getBeatDuration();
        const beatDurationSec = beatDurationMs / 1000;
        
        // Iterate through all tracks dynamically
        Object.entries(notes).forEach(([trackNum, noteData]) => {
            if (!noteData || noteData.sustained) return; // Skip sustained notes
            
            const track = this.timeline.tracks[trackNum];
            if (!track) return;
            
            const velocity = noteData.velocity || 0.8;
            
            if (track.isPercussion()) {
                // Percussion doesn't use duration or octave
                this.audio.playNote(noteData.note, trackNum, undefined, velocity);
                this.visualizer.onNotePlay(noteData.note, trackNum, 4, velocity, 1);
            } else {
                // Piano tracks
                const noteDuration = (noteData.duration || 1) * beatDurationSec;
                const octave = noteData.octave || 4;
                this.audio.playNote(noteData.note, trackNum, noteDuration, velocity, octave);
                this.visualizer.onNotePlay(noteData.note, trackNum, octave, velocity, noteData.duration || 1);
            }
        });
    }

    /**
     * Handle playback completion
     */
    onPlaybackComplete() {
        this.stop();
        this.visualizer.celebrate();
        this.audio.playSuccess();
    }

    /**
     * Cycle through speed options
     */
    cycleSpeed() {
        // Studio Mode uses BPM input, not speed presets
        if (this.currentMode === Game.MODES.STUDIO) {
            // Clicking speed button in Studio Mode does nothing
            // (use BPM input or tap tempo instead)
            return;
        }
        
        const config = this.getModeConfig();
        
        // Kid Mode: Only 2 speeds (slow and fast)
        if (this.currentMode === Game.MODES.KID) {
            const kidSpeeds = config.speeds; // [0, 2]
            const currentIndex = kidSpeeds.indexOf(this.currentSpeedIndex);
            const nextIndex = (currentIndex + 1) % kidSpeeds.length;
            this.currentSpeedIndex = kidSpeeds[nextIndex];
        } else {
            // Tween: Cycle through all speeds
            this.currentSpeedIndex = (this.currentSpeedIndex + 1) % this.speeds.length;
        }
        
        this.elements.speedBtn.textContent = this.speeds[this.currentSpeedIndex].icon;
        this.updateURL();
    }
    
    /**
     * Set BPM (Studio Mode)
     * @param {number} bpm - BPM value (40-800, rounded to nearest 10)
     */
    setBPM(bpm) {
        // Round to nearest 10
        bpm = Math.round(bpm / 10) * 10;
        
        // Clamp to valid range
        if (bpm < 40) bpm = 40;
        if (bpm > 800) bpm = 800;
        
        this.currentBPM = bpm;
        this.useBPM = true;
        
        console.log('setBPM called:', {
            bpm,
            currentBPM: this.currentBPM,
            useBPM: this.useBPM,
            currentMode: this.currentMode,
            beatDuration: this.getBeatDuration()
        });
        
        // Update UI
        if (this.elements.bpmInput) {
            this.elements.bpmInput.value = bpm;
        }
        
        this.updateURL();
    }
    
    /**
     * Get current beat duration in ms
     * @returns {number} - Beat duration in milliseconds
     */
    getBeatDuration() {
        if (this.currentMode === Game.MODES.STUDIO && this.useBPM) {
            // BPM mode: convert BPM to ms per beat
            const duration = 60000 / this.currentBPM;
            console.log('getBeatDuration (BPM mode):', {
                currentBPM: this.currentBPM,
                duration,
                useBPM: this.useBPM
            });
            return duration;
        }
        // Preset mode: use speed index
        const duration = this.speeds[this.currentSpeedIndex].ms;
        console.log('getBeatDuration (preset mode):', {
            currentSpeedIndex: this.currentSpeedIndex,
            duration
        });
        return duration;
    }

    /**
     * Handle tap tempo button press
     * Tracks tap intervals to calculate BPM and set nearest speed
     */
    handleTapTempo() {
        const now = Date.now();
        
        // Initialize tap history if not exists
        if (!this.tapHistory) {
            this.tapHistory = [];
        }
        
        // Add current tap
        this.tapHistory.push(now);
        
        // Keep only last 4 taps (3 intervals)
        if (this.tapHistory.length > 4) {
            this.tapHistory.shift();
        }
        
        // Need at least 2 taps to calculate interval
        if (this.tapHistory.length < 2) {
            // Visual feedback for first tap
            this.elements.tapTempoBtn.classList.add('tap-active');
            setTimeout(() => {
                this.elements.tapTempoBtn.classList.remove('tap-active');
            }, 100);
            return;
        }
        
        // Calculate average interval between taps
        const intervals = [];
        for (let i = 1; i < this.tapHistory.length; i++) {
            intervals.push(this.tapHistory[i] - this.tapHistory[i - 1]);
        }
        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        
        // Convert interval to BPM
        const bpm = 60000 / avgInterval;
        
        // Convert BPM to ms per beat (quarter note)
        const msPerBeat = 60000 / bpm;
        
        // In Studio Mode, set BPM directly instead of finding nearest preset
        if (this.currentMode === Game.MODES.STUDIO) {
            const roundedBPM = Math.round(bpm);
            this.setBPM(roundedBPM);
            
            // Visual feedback
            this.elements.tapTempoBtn.classList.add('tap-active');
            setTimeout(() => {
                this.elements.tapTempoBtn.classList.remove('tap-active');
            }, 100);
            
            // Reset tap history after 2 seconds of inactivity
            clearTimeout(this.tapResetTimer);
            this.tapResetTimer = setTimeout(() => {
                this.tapHistory = [];
            }, 2000);
            
            return;
        }
        
        // For Kid/Tween modes: find closest speed preset
        let closestIndex = 0;
        let closestDiff = Math.abs(this.speeds[0].ms - msPerBeat);
        
        for (let i = 1; i < this.speeds.length; i++) {
            const diff = Math.abs(this.speeds[i].ms - msPerBeat);
            if (diff < closestDiff) {
                closestDiff = diff;
                closestIndex = i;
            }
        }
        
        // Check if speed is allowed in current mode
        const config = this.getModeConfig();
        if (this.currentMode === Game.MODES.KID) {
            // Kid mode only allows certain speeds
            const kidSpeeds = config.speeds; // [0, 2]
            if (!kidSpeeds.includes(closestIndex)) {
                // Find closest allowed speed
                closestIndex = kidSpeeds.reduce((prev, curr) => {
                    return Math.abs(this.speeds[curr].ms - msPerBeat) < Math.abs(this.speeds[prev].ms - msPerBeat) 
                        ? curr : prev;
                });
            }
        }
        
        this.currentSpeedIndex = closestIndex;
        this.elements.speedBtn.textContent = this.speeds[this.currentSpeedIndex].icon;
        this.updateURL();
        
        // Visual feedback
        this.elements.tapTempoBtn.classList.add('tap-active');
        setTimeout(() => {
            this.elements.tapTempoBtn.classList.remove('tap-active');
        }, 100);
        
        // Reset tap history after 2 seconds of inactivity
        clearTimeout(this.tapResetTimer);
        this.tapResetTimer = setTimeout(() => {
            this.tapHistory = [];
        }, 2000);
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
        
        const config = this.getModeConfig();
        const currentLength = this.timeline.getBeatCount();
        
        // Filter beat lengths based on mode's maxBeats
        const allowedLengths = this.beatLengths.filter(len => len <= config.maxBeats);
        const currentIndex = allowedLengths.indexOf(currentLength);
        let newIndex = currentIndex + direction;
        
        // Clamp to valid range
        newIndex = Math.max(0, Math.min(allowedLengths.length - 1, newIndex));
        
        if (newIndex !== currentIndex) {
            const newLength = allowedLengths[newIndex];
            this.timeline.setBeatCount(newLength);
            this.elements.beatCount.textContent = newLength;
            this.updateURL();
        }
    }

    /**
     * Show clear confirmation modal
     */
    showClearConfirmation() {
        this.elements.clearModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close clear confirmation modal
     */
    closeClearModal() {
        this.elements.clearModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    /**
     * Confirm and execute clear
     */
    confirmClear() {
        this.closeClearModal();
        this.clear();
    }
    
    /**
     * Show track settings modal (Studio Mode)
     * @param {number} trackNum - Track number (1-3)
     */
    showTrackSettings(trackNum) {
        this.currentSettingsTrack = trackNum;
        
        // Update modal title
        const trackNames = ['', '🎹 Track 1 Settings', '🎹 Track 2 Settings', '🥁 Track 3 Settings'];
        this.elements.trackSettingsTitle.textContent = trackNames[trackNum];
        
        // Show/hide waveform section for non-percussion tracks
        const waveformGroup = this.elements.waveformButtons.closest('.track-setting-group');
        if (trackNum === 3) {
            waveformGroup.style.display = 'none';
        } else {
            waveformGroup.style.display = 'block';
            
            // Update waveform button states
            const currentWaveform = this.audio.getTrackWaveform(trackNum);
            const waveformBtns = this.elements.waveformButtons.querySelectorAll('.waveform-btn');
            waveformBtns.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-waveform') === currentWaveform);
            });
        }
        
        // Update effect button states
        this.elements.modalReverbBtn.classList.toggle('active', this.audio.isReverbEnabled(trackNum));
        this.elements.modalDelayBtn.classList.toggle('active', this.audio.isDelayEnabled(trackNum));
        
        // Show modal
        this.elements.trackSettingsModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Close track settings modal
     */
    closeTrackSettings() {
        this.elements.trackSettingsModal.classList.add('hidden');
        document.body.style.overflow = '';
        this.currentSettingsTrack = null;
    }
    
    /**
     * Set waveform from modal
     * @param {string} waveform - Waveform type
     */
    setModalWaveform(waveform) {
        if (this.currentSettingsTrack && (this.currentSettingsTrack === 1 || this.currentSettingsTrack === 2)) {
            this.setWaveform(this.currentSettingsTrack, waveform);
            
            // Update button states
            const waveformBtns = this.elements.waveformButtons.querySelectorAll('.waveform-btn');
            waveformBtns.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-waveform') === waveform);
            });
        }
    }
    
    /**
     * Toggle effect from modal
     * @param {string} effect - Effect type ('reverb' or 'delay')
     */
    toggleModalEffect(effect) {
        if (!this.currentSettingsTrack) return;
        
        const trackNum = this.currentSettingsTrack;
        
        if (effect === 'reverb') {
            const currentState = this.audio.isReverbEnabled(trackNum);
            this.audio.setReverbEnabled(trackNum, !currentState);
            this.elements.modalReverbBtn.classList.toggle('active', !currentState);
        } else if (effect === 'delay') {
            const currentState = this.audio.isDelayEnabled(trackNum);
            this.audio.setDelayEnabled(trackNum, !currentState);
            this.elements.modalDelayBtn.classList.toggle('active', !currentState);
        }
        
        // Update URL to persist effect changes
        this.updateURL();
    }

    /**
     * Show add track modal (Tween/Studio Mode)
     */
    showAddTrackModal() {
        if (!this.canAddTracks()) {
            console.warn('Cannot add more tracks');
            return;
        }

        // Update track count display
        const currentCount = Object.keys(this.timeline.tracks).length;
        const maxCount = this.getMaxTracks();
        this.elements.currentTrackCount.textContent = currentCount;
        this.elements.maxTrackCount.textContent = maxCount;

        // Show modal
        this.elements.addTrackModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close add track modal
     */
    closeAddTrackModal() {
        this.elements.addTrackModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    /**
     * Handle track type selection and add track
     * @param {string} trackType - 'piano' or 'percussion'
     */
    handleAddTrack(trackType) {
        const newTrackNum = this.addTrack(trackType);
        
        if (newTrackNum) {
            // Close modal
            this.closeAddTrackModal();
            
            // Update add track button state
            this.updateAddTrackButton();
            
            // Select the new track
            this.selectTrack(newTrackNum);
        }
    }

    /**
     * Update add track button visibility and state
     */
    updateAddTrackButton() {
        if (!this.elements.addTrackBtn) return;

        const config = Game.MODE_CONFIGS[this.currentMode];
        const canAdd = config.canAddTracks;
        const currentCount = Object.keys(this.timeline.tracks).length;
        const maxCount = config.maxTracks;

        // Show button only if mode allows track adding
        if (canAdd) {
            this.elements.addTrackBtn.style.display = 'inline-block';
            this.elements.addTrackBtn.disabled = currentCount >= maxCount;
            
            // Update button text with count
            this.elements.addTrackBtn.textContent = `➕ Add Track (${currentCount}/${maxCount})`;
        } else {
            this.elements.addTrackBtn.style.display = 'none';
        }
    }

    /**
     * Clear all notes from timeline
     */
    clear() {
        if (this.isPlaying) {
            this.stop();
        }
        
        // Clear all pattern blocks
        const placementIds = Array.from(this.patternPlacements.keys());
        for (const placementId of placementIds) {
            const patternBlock = this.patternBlocks.get(placementId);
            if (patternBlock) {
                patternBlock.onRemove = null; // Prevent callback
                patternBlock.remove();
                this.patternBlocks.delete(placementId);
            }
        }
        this.patternPlacements.clear();
        
        // Clear all notes
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
     * Set waveform for a piano track
     * @param {number} trackNum - Track number (1 or 2)
     * @param {string} waveform - Waveform type ('sine', 'square', 'sawtooth', 'triangle')
     */
    setWaveform(trackNum, waveform) {
        if (trackNum === 1 || trackNum === 2) {
            this.audio.trackWaveforms[trackNum] = waveform;
            this.updateURL();
        }
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
    static PERC_NOTES = ['', 'kick', 'snare', 'hihat', 'clap', 'tom', 'cymbal', 'shaker', 'cowbell'];
    static MELODY_ICONS = ['', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚪', '❤️'];
    static BASS_ICONS = ['', '🟦', '🟪', '🟫', '⬛', '💙', '💜'];
    static PERC_ICONS = ['', '🥁', '🪘', '🔔', '👏', '🎵', '💥', '🎶', '🔊'];
    
    // Piano keyboard icon mapping (matches PianoKeyboard.js)
    static PIANO_ICONS = {
        'C': 'C', 'C#': 'C♯', 'D': 'D', 'D#': 'D♯', 'E': 'E', 'F': 'F',
        'F#': 'F♯', 'G': 'G', 'G#': 'G♯', 'A': 'A', 'A#': 'A♯', 'B': 'B'
    };
    
    // Encoding version: increment when format changes
    // v1: 10 bits per beat (no duration)
    // v2: 16 bits per beat (with duration for melody/bass)
    // v3: 17 bits per beat (piano notes with octave, key signature)
    // v4: 19 bits header (adds 2 bits for mode), same beat structure as v3
    // v5: 11 bits header (octave support 3 bits), 35 bits per beat
    // v6: 15 bits header (adds waveform 2+2 bits), 35 bits per beat
    static ENCODING_VERSION = 7;
    
    // Waveform encoding (2 bits per track)
    static WAVEFORMS = ['sine', 'triangle', 'square', 'sawtooth'];

    /**
     * Serialize current state to a compact binary URL-safe string
     * Format: "v{version}_{base64data}"
     * @returns {string}
     */
    serializeState() {
        return this.serializeV7();
    }

    /**
     * Serialize v7 format with BPM support
     * 
     * v7 Binary format:
     * Header: 29 bits (mode:2, speed:2, useBPM:1, bpm:7, loop:1, lengthIndex:2, keyIndex:4, waveform1:2, waveform2:2, effects:6)
     * BPM: 7 bits for range 40-800 in steps of 10 (value = (bpm-40)/10)
     * Effects: 6 bits (t1_reverb, t1_delay, t2_reverb, t2_delay, t3_reverb, t3_delay)
     * Per beat: 35 bits (piano1:4+3+4+3, piano2:4+3+4+3, percussion:3+4)
     * Piano tracks: note(4) + duration(3) + velocity(4) + octave(3)
     * @returns {string}
     */
    serializeV7() {
        const beatCount = this.timeline.getBeatCount();
        const lengthIndex = this.beatLengths.indexOf(beatCount);
        const keyIndex = Game.KEY_NAMES.indexOf(this.currentKey);
        
        // Mode index (0=kid, 1=tween, 2=studio)
        const modeIndex = Object.values(Game.MODES).indexOf(this.currentMode);
        
        // Waveform indices
        const waveform1Index = Game.WAVEFORMS.indexOf(this.audio.trackWaveforms[1] || 'sine');
        const waveform2Index = Game.WAVEFORMS.indexOf(this.audio.trackWaveforms[2] || 'triangle');
        
        // BPM encoding: (bpm - 40) / 10 = value 0-76
        const bpmValue = Math.max(0, Math.min(76, Math.round((this.currentBPM - 40) / 10)));
        
        // Build bit array
        const bits = [];
        
        // Header: mode (2), speed (2), useBPM (1), bpm (7), loop (1), length (2), key (4), waveforms (2+2), effects (6) = 29 bits
        this.pushBits(bits, modeIndex, 2);
        this.pushBits(bits, this.currentSpeedIndex, 2);
        this.pushBits(bits, this.useBPM ? 1 : 0, 1);
        this.pushBits(bits, bpmValue, 7);
        this.pushBits(bits, this.isLooping ? 1 : 0, 1);
        this.pushBits(bits, lengthIndex, 2);
        this.pushBits(bits, keyIndex, 4);
        this.pushBits(bits, waveform1Index, 2);
        this.pushBits(bits, waveform2Index, 2);
        
        // Effects: 6 bits (track1 reverb, track1 delay, track2 reverb, track2 delay, track3 reverb, track3 delay)
        this.pushBits(bits, this.audio.isReverbEnabled(1) ? 1 : 0, 1);
        this.pushBits(bits, this.audio.isDelayEnabled(1) ? 1 : 0, 1);
        this.pushBits(bits, this.audio.isReverbEnabled(2) ? 1 : 0, 1);
        this.pushBits(bits, this.audio.isDelayEnabled(2) ? 1 : 0, 1);
        this.pushBits(bits, this.audio.isReverbEnabled(3) ? 1 : 0, 1);
        this.pushBits(bits, this.audio.isDelayEnabled(3) ? 1 : 0, 1);
        
        // Track data with velocity and octave: 35 bits per beat
        // piano1 (4 note + 3 dur + 4 vel + 3 oct) + piano2 (4 note + 3 dur + 4 vel + 3 oct) + perc (3 note + 4 vel)
        for (let beat = 0; beat < beatCount; beat++) {
            const notes = this.timeline.getNotesAtBeat(beat);
            
            // Piano track 1: note (4 bits) + duration (3 bits) + velocity (4 bits) + octave (3 bits)
            const note1 = notes[1];
            const note1Index = note1 && !note1.sustained ? this.getNoteIndex(note1.note) : 0;
            const duration1 = note1 && !note1.sustained ? note1.duration : 1;
            const velocity1 = note1 && !note1.sustained ? Math.round((note1.velocity || 0.8) * 15) : 12;
            const octave1 = note1 && !note1.sustained && note1.octave !== null ? note1.octave - 2 : 2; // Map octaves 2-6 to 0-4
            this.pushBits(bits, note1Index, 4);
            this.pushBits(bits, Math.min(7, Math.max(0, duration1 - 1)), 3);
            this.pushBits(bits, velocity1, 4);
            this.pushBits(bits, octave1, 3);
            
            // Piano track 2: note (4 bits) + duration (3 bits) + velocity (4 bits) + octave (3 bits)
            const note2 = notes[2];
            const note2Index = note2 && !note2.sustained ? this.getNoteIndex(note2.note) : 0;
            const duration2 = note2 && !note2.sustained ? note2.duration : 1;
            const velocity2 = note2 && !note2.sustained ? Math.round((note2.velocity || 0.8) * 15) : 12;
            const octave2 = note2 && !note2.sustained && note2.octave !== null ? note2.octave - 2 : 1; // Map octaves 2-6 to 0-4
            this.pushBits(bits, note2Index, 4);
            this.pushBits(bits, Math.min(7, Math.max(0, duration2 - 1)), 3);
            this.pushBits(bits, velocity2, 4);
            this.pushBits(bits, octave2, 3);
            
            // Percussion track: note index (3 bits) + velocity (4 bits)
            const note3 = notes[3];
            const note3Index = note3 && !note3.sustained ? Game.PERC_NOTES.indexOf(note3.note) : 0;
            const velocity3 = note3 && !note3.sustained ? Math.round((note3.velocity || 0.8) * 15) : 12;
            this.pushBits(bits, Math.max(0, note3Index), 3);
            this.pushBits(bits, velocity3, 4);
        }
        
        // Pattern placements: count (5 bits) + for each: patternId-hash (12 bits) + startBeat (7 bits)
        const placements = Array.from(this.patternPlacements.values());
        this.pushBits(bits, Math.min(31, placements.length), 5); // Max 31 patterns
        
        for (const placement of placements.slice(0, 31)) {
            // Hash the pattern ID to 12 bits (for preset/custom patterns)
            const patternIdHash = this.hashPatternId(placement.patternId);
            this.pushBits(bits, patternIdHash, 12);
            this.pushBits(bits, placement.startBeat, 7); // Max beat 127
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
     * Hash pattern ID to 12 bits for compact storage
     */
    hashPatternId(patternId) {
        const presetMap = {
            'preset_happy_bounce': 1, 'preset_march': 2, 'preset_lullaby': 3,
            'preset_dance': 4, 'preset_fanfare': 5, 'preset_rain': 6,
            'preset_drop': 7, 'preset_chill': 8, 'preset_epic': 9, 'preset_glitch': 10
        };
        if (presetMap[patternId]) return presetMap[patternId];
        if (patternId.startsWith('custom_')) return 100 + parseInt(patternId.split('_')[1]);
        return 0;
    }
    
    /**
     * Reverse hash pattern ID from 12-bit value
     */
    unhashPatternId(hash) {
        const presetMap = {
            1: 'preset_happy_bounce', 2: 'preset_march', 3: 'preset_lullaby',
            4: 'preset_dance', 5: 'preset_fanfare', 6: 'preset_rain',
            7: 'preset_drop', 8: 'preset_chill', 9: 'preset_epic', 10: 'preset_glitch'
        };
        if (presetMap[hash]) return presetMap[hash];
        if (hash >= 100 && hash <= 107) return `custom_${hash - 100}`;
        return null;
    }
    
    /**
     * Serialize v6 format with waveform and effects support (legacy)
     * 
     * v6 Binary format:
     * Header: 21 bits (mode:2, speed:2, loop:1, lengthIndex:2, keyIndex:4, waveform1:2, waveform2:2, effects:6)
     * Effects: 6 bits (t1_reverb, t1_delay, t2_reverb, t2_delay, t3_reverb, t3_delay)
     * Per beat: 35 bits (piano1:4+3+4+3, piano2:4+3+4+3, percussion:3+4)
     * Piano tracks: note(4) + duration(3) + velocity(4) + octave(3)
     * @returns {string}
     */
    serializeV6() {
        const beatCount = this.timeline.getBeatCount();
        const lengthIndex = this.beatLengths.indexOf(beatCount);
        const keyIndex = Game.KEY_NAMES.indexOf(this.currentKey);
        
        // Mode index (0=kid, 1=tween, 2=studio)
        const modeIndex = Object.values(Game.MODES).indexOf(this.currentMode);
        
        // Waveform indices
        const waveform1Index = Game.WAVEFORMS.indexOf(this.audio.trackWaveforms[1] || 'sine');
        const waveform2Index = Game.WAVEFORMS.indexOf(this.audio.trackWaveforms[2] || 'triangle');
        
        // Build bit array
        const bits = [];
        
        // Header: mode (2), speed (2), loop (1), length (2), key (4), waveforms (2+2), effects (6) = 21 bits
        this.pushBits(bits, modeIndex, 2);
        this.pushBits(bits, this.currentSpeedIndex, 2);
        this.pushBits(bits, this.isLooping ? 1 : 0, 1);
        this.pushBits(bits, lengthIndex, 2);
        this.pushBits(bits, keyIndex, 4);
        this.pushBits(bits, waveform1Index, 2);
        this.pushBits(bits, waveform2Index, 2);
        
        // Effects: 6 bits (track1 reverb, track1 delay, track2 reverb, track2 delay, track3 reverb, track3 delay)
        this.pushBits(bits, this.audio.isReverbEnabled(1) ? 1 : 0, 1);
        this.pushBits(bits, this.audio.isDelayEnabled(1) ? 1 : 0, 1);
        this.pushBits(bits, this.audio.isReverbEnabled(2) ? 1 : 0, 1);
        this.pushBits(bits, this.audio.isDelayEnabled(2) ? 1 : 0, 1);
        this.pushBits(bits, this.audio.isReverbEnabled(3) ? 1 : 0, 1);
        this.pushBits(bits, this.audio.isDelayEnabled(3) ? 1 : 0, 1);
        
        // Track data with velocity and octave: 35 bits per beat
        // piano1 (4 note + 3 dur + 4 vel + 3 oct) + piano2 (4 note + 3 dur + 4 vel + 3 oct) + perc (3 note + 4 vel)
        for (let beat = 0; beat < beatCount; beat++) {
            const notes = this.timeline.getNotesAtBeat(beat);
            
            // Piano track 1: note (4 bits) + duration (3 bits) + velocity (4 bits) + octave (3 bits)
            const note1 = notes[1];
            const note1Index = note1 && !note1.sustained ? this.getNoteIndex(note1.note) : 0;
            const duration1 = note1 && !note1.sustained ? note1.duration : 1;
            const velocity1 = note1 && !note1.sustained ? Math.round((note1.velocity || 0.8) * 15) : 12;
            const octave1 = note1 && !note1.sustained && note1.octave !== null ? note1.octave - 2 : 2; // Map octaves 2-6 to 0-4
            this.pushBits(bits, note1Index, 4);
            this.pushBits(bits, Math.min(7, Math.max(0, duration1 - 1)), 3);
            this.pushBits(bits, velocity1, 4);
            this.pushBits(bits, octave1, 3);
            
            // Piano track 2: note (4 bits) + duration (3 bits) + velocity (4 bits) + octave (3 bits)
            const note2 = notes[2];
            const note2Index = note2 && !note2.sustained ? this.getNoteIndex(note2.note) : 0;
            const duration2 = note2 && !note2.sustained ? note2.duration : 1;
            const velocity2 = note2 && !note2.sustained ? Math.round((note2.velocity || 0.8) * 15) : 12;
            const octave2 = note2 && !note2.sustained && note2.octave !== null ? note2.octave - 2 : 1; // Map octaves 2-6 to 0-4
            this.pushBits(bits, note2Index, 4);
            this.pushBits(bits, Math.min(7, Math.max(0, duration2 - 1)), 3);
            this.pushBits(bits, velocity2, 4);
            this.pushBits(bits, octave2, 3);
            
            // Percussion track: note index (3 bits) + velocity (4 bits)
            const note3 = notes[3];
            const note3Index = note3 && !note3.sustained ? Game.PERC_NOTES.indexOf(note3.note) : 0;
            const velocity3 = note3 && !note3.sustained ? Math.round((note3.velocity || 0.8) * 15) : 12;
            this.pushBits(bits, Math.max(0, note3Index), 3);
            this.pushBits(bits, velocity3, 4);
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
     * Serialize v5 format with octave support (legacy)
     * 
     * v5 Binary format:
     * Header: 11 bits (mode:2, speed:2, loop:1, lengthIndex:2, keyIndex:4)
     * Per beat: 35 bits (piano1:4+3+4+3, piano2:4+3+4+3, percussion:3+4)
     * Piano tracks: note(4) + duration(3) + velocity(4) + octave(3)
     * @returns {string}
     */
    serializeV5() {
        const beatCount = this.timeline.getBeatCount();
        const lengthIndex = this.beatLengths.indexOf(beatCount);
        const keyIndex = Game.KEY_NAMES.indexOf(this.currentKey);
        
        // Mode index (0=kid, 1=tween, 2=studio)
        const modeIndex = Object.values(Game.MODES).indexOf(this.currentMode);
        
        // Build bit array
        const bits = [];
        
        // Header: mode (2 bits), speed (2 bits), loop (1 bit), length index (2 bits), key (4 bits)
        this.pushBits(bits, modeIndex, 2);
        this.pushBits(bits, this.currentSpeedIndex, 2);
        this.pushBits(bits, this.isLooping ? 1 : 0, 1);
        this.pushBits(bits, lengthIndex, 2);
        this.pushBits(bits, keyIndex, 4);
        
        // Track data with velocity and octave: 35 bits per beat
        // piano1 (4 note + 3 dur + 4 vel + 3 oct) + piano2 (4 note + 3 dur + 4 vel + 3 oct) + perc (3 note + 4 vel)
        for (let beat = 0; beat < beatCount; beat++) {
            const notes = this.timeline.getNotesAtBeat(beat);
            
            // Piano track 1: note (4 bits) + duration (3 bits) + velocity (4 bits) + octave (3 bits)
            const note1 = notes[1];
            const note1Index = note1 && !note1.sustained ? this.getNoteIndex(note1.note) : 0;
            const duration1 = note1 && !note1.sustained ? note1.duration : 1;
            const velocity1 = note1 && !note1.sustained ? Math.round((note1.velocity || 0.8) * 15) : 12;
            const octave1 = note1 && !note1.sustained && note1.octave !== null ? note1.octave - 2 : 2; // Map octaves 2-6 to 0-4
            this.pushBits(bits, note1Index, 4);
            this.pushBits(bits, Math.min(7, Math.max(0, duration1 - 1)), 3);
            this.pushBits(bits, velocity1, 4);
            this.pushBits(bits, octave1, 3);
            
            // Piano track 2: note (4 bits) + duration (3 bits) + velocity (4 bits) + octave (3 bits)
            const note2 = notes[2];
            const note2Index = note2 && !note2.sustained ? this.getNoteIndex(note2.note) : 0;
            const duration2 = note2 && !note2.sustained ? note2.duration : 1;
            const velocity2 = note2 && !note2.sustained ? Math.round((note2.velocity || 0.8) * 15) : 12;
            const octave2 = note2 && !note2.sustained && note2.octave !== null ? note2.octave - 2 : 1; // Map octaves 2-6 to 0-4
            this.pushBits(bits, note2Index, 4);
            this.pushBits(bits, Math.min(7, Math.max(0, duration2 - 1)), 3);
            this.pushBits(bits, velocity2, 4);
            this.pushBits(bits, octave2, 3);
            
            // Percussion track: note index (3 bits) + velocity (4 bits)
            const note3 = notes[3];
            const note3Index = note3 && !note3.sustained ? Game.PERC_NOTES.indexOf(note3.note) : 0;
            const velocity3 = note3 && !note3.sustained ? Math.round((note3.velocity || 0.8) * 15) : 12;
            this.pushBits(bits, Math.max(0, note3Index), 3);
            this.pushBits(bits, velocity3, 4);
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
     * Serialize v3 format with piano keyboard and key signatures (legacy)
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
            } else if (version === 4) {
                return this.deserializeV4(bits);
            } else if (version === 5) {
                return this.deserializeV5(bits);
            } else if (version === 6) {
                return this.deserializeV6(bits);
            } else if (version === 7) {
                return this.deserializeV7(bits);
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
            'C': 'C', 'C#': 'C♯', 'D': 'D', 'D#': 'D♯', 'E': 'E', 'F': 'F',
            'F#': 'F♯', 'G': 'G', 'G#': 'G♯', 'A': 'A', 'A#': 'A♯', 'B': 'B'
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
     * Deserialize v4 format (with mode selection and velocity, no octave)
     * Header: 11 bits (mode:2, speed:2, loop:1, lengthIndex:2, keyIndex:4)
     * Per beat: 29 bits (piano1:4+dur1:3+vel1:4, piano2:4+dur2:3+vel2:4, percussion:3+vel3:4)
     */
    deserializeV4(bits) {
        const PIANO_NOTES = ['', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const PIANO_ICONS = {
            'C': 'C', 'C#': 'C♯', 'D': 'D', 'D#': 'D♯', 'E': 'E', 'F': 'F',
            'F#': 'F♯', 'G': 'G', 'G#': 'G♯', 'A': 'A', 'A#': 'A♯', 'B': 'B'
        };
        
        let offset = 0;
        
        // Read header (11 bits)
        const modeIndex = this.readBits(bits, offset, 2); offset += 2;
        const speedIndex = this.readBits(bits, offset, 2); offset += 2;
        const loop = this.readBits(bits, offset, 1); offset += 1;
        const lengthIndex = this.readBits(bits, offset, 2); offset += 2;
        const keyIndex = this.readBits(bits, offset, 4); offset += 4;
        
        const beatCount = this.beatLengths[lengthIndex] || 16;
        const keyName = Game.KEY_NAMES[keyIndex] || 'C Major';
        const mode = Object.values(Game.MODES)[modeIndex] || Game.MODES.KID;
        
        // Read track data (v4 format without octave)
        const track1 = [];
        const track2 = [];
        const track3 = [];
        
        for (let beat = 0; beat < beatCount; beat++) {
            // Piano track 1: 4 bits note + 3 bits duration + 4 bits velocity (no octave)
            const note1Index = this.readBits(bits, offset, 4); offset += 4;
            const duration1 = this.readBits(bits, offset, 3) + 1; offset += 3;
            const velocity1 = this.readBits(bits, offset, 4) / 15; offset += 4;
            
            // Piano track 2: 4 bits note + 3 bits duration + 4 bits velocity (no octave)
            const note2Index = this.readBits(bits, offset, 4); offset += 4;
            const duration2 = this.readBits(bits, offset, 3) + 1; offset += 3;
            const velocity2 = this.readBits(bits, offset, 4) / 15; offset += 4;
            
            // Percussion: 3 bits note + 4 bits velocity
            const percIndex = this.readBits(bits, offset, 3); offset += 3;
            const velocity3 = this.readBits(bits, offset, 4) / 15; offset += 4;
            
            // Add notes with track-based default octaves (v4 backward compatibility)
            if (note1Index > 0 && note1Index < PIANO_NOTES.length) {
                const note = PIANO_NOTES[note1Index];
                track1.push([beat, note, PIANO_ICONS[note], duration1, 5, velocity1]); // Default octave 5
            }
            if (note2Index > 0 && note2Index < PIANO_NOTES.length) {
                const note = PIANO_NOTES[note2Index];
                track2.push([beat, note, PIANO_ICONS[note], duration2, 3, velocity2]); // Default octave 3
            }
            if (percIndex > 0 && percIndex < Game.PERC_NOTES.length) {
                track3.push([beat, Game.PERC_NOTES[percIndex], Game.PERC_ICONS[percIndex], 1, null, velocity3]);
            }
        }
        
        return {
            mode: mode,
            s: speedIndex,
            l: loop,
            b: beatCount,
            k: keyName,
            t: { track1, track2, track3 }
        };
    }

    /**
     * Deserialize v7 format with BPM support
     * Header: 29 bits (mode:2, speed:2, useBPM:1, bpm:7, loop:1, lengthIndex:2, keyIndex:4, waveform1:2, waveform2:2, effects:6)
     * Per beat: 35 bits (piano1:4+3+4+3, piano2:4+3+4+3, percussion:3+4)
     */
    deserializeV7(bits) {
        let offset = 0;
        
        // Read header (29 bits total)
        const modeIndex = this.readBits(bits, offset, 2); offset += 2;
        const speedIndex = this.readBits(bits, offset, 2); offset += 2;
        const useBPM = this.readBits(bits, offset, 1); offset += 1;
        const bpmValue = this.readBits(bits, offset, 7); offset += 7;
        const loop = this.readBits(bits, offset, 1); offset += 1;
        const lengthIndex = this.readBits(bits, offset, 2); offset += 2;
        const keyIndex = this.readBits(bits, offset, 4); offset += 4;
        const waveform1Index = this.readBits(bits, offset, 2); offset += 2;
        const waveform2Index = this.readBits(bits, offset, 2); offset += 2;
        
        // Read effects (6 bits)
        const t1Reverb = this.readBits(bits, offset, 1); offset += 1;
        const t1Delay = this.readBits(bits, offset, 1); offset += 1;
        const t2Reverb = this.readBits(bits, offset, 1); offset += 1;
        const t2Delay = this.readBits(bits, offset, 1); offset += 1;
        const t3Reverb = this.readBits(bits, offset, 1); offset += 1;
        const t3Delay = this.readBits(bits, offset, 1); offset += 1;
        
        // Decode BPM: value 0-76 maps to 40-800 in steps of 10
        const bpm = 40 + (bpmValue * 10);
        
        // Get mode
        const mode = Object.values(Game.MODES)[modeIndex] || Game.MODES.KID;
        
        // Get beat count
        const beatCount = this.beatLengths[lengthIndex] || 16;
        
        // Get key
        const key = Game.KEY_NAMES[keyIndex] || 'C Major';
        
        // Get waveforms
        const waveform1 = Game.WAVEFORMS[waveform1Index] || 'sine';
        const waveform2 = Game.WAVEFORMS[waveform2Index] || 'triangle';
        
        // Read track data (35 bits per beat)
        const piano1 = [];
        const piano2 = [];
        const percussion = [];
        
        const PIANO_NOTES = ['', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        for (let beat = 0; beat < beatCount; beat++) {
            // Piano track 1: note (4) + duration (3) + velocity (4) + octave (3)
            const note1Index = this.readBits(bits, offset, 4); offset += 4;
            const duration1 = this.readBits(bits, offset, 3); offset += 3;
            const velocity1 = this.readBits(bits, offset, 4); offset += 4;
            const octave1 = this.readBits(bits, offset, 3); offset += 3;
            
            if (note1Index > 0 && note1Index < PIANO_NOTES.length) {
                const note = PIANO_NOTES[note1Index];
                const icon = this.getPianoIcon(note);
                const dur = duration1 + 1;
                const vel = velocity1 / 15;
                const oct = octave1 + 2; // Map 0-4 back to octaves 2-6
                piano1.push([beat, note, icon, dur, oct, vel]);
            }
            
            // Piano track 2: note (4) + duration (3) + velocity (4) + octave (3)
            const note2Index = this.readBits(bits, offset, 4); offset += 4;
            const duration2 = this.readBits(bits, offset, 3); offset += 3;
            const velocity2 = this.readBits(bits, offset, 4); offset += 4;
            const octave2 = this.readBits(bits, offset, 3); offset += 3;
            
            if (note2Index > 0 && note2Index < PIANO_NOTES.length) {
                const note = PIANO_NOTES[note2Index];
                const icon = this.getPianoIcon(note);
                const dur = duration2 + 1;
                const vel = velocity2 / 15;
                const oct = octave2 + 2; // Map 0-4 back to octaves 2-6
                piano2.push([beat, note, icon, dur, oct, vel]);
            }
            
            // Percussion track: note (3) + velocity (4)
            const note3Index = this.readBits(bits, offset, 3); offset += 3;
            const velocity3 = this.readBits(bits, offset, 4); offset += 4;
            
            if (note3Index > 0 && note3Index < Game.PERC_NOTES.length) {
                const vel = velocity3 / 15;
                percussion.push([beat, Game.PERC_NOTES[note3Index], Game.PERC_ICONS[note3Index], 1, null, vel]);
            }
        }
        
        // Read pattern placements: count (5 bits) + for each: patternId-hash (12 bits) + startBeat (7 bits)
        const patternCount = this.readBits(bits, offset, 5); offset += 5;
        const patterns = [];
        
        for (let i = 0; i < patternCount; i++) {
            const patternIdHash = this.readBits(bits, offset, 12); offset += 12;
            const startBeat = this.readBits(bits, offset, 7); offset += 7;
            
            const patternId = this.unhashPatternId(patternIdHash);
            if (patternId) {
                patterns.push({ patternId, startBeat });
            }
        }
        
        return {
            mode,
            s: speedIndex,
            useBPM: useBPM === 1,
            bpm,
            l: loop,
            b: beatCount,
            k: key,
            w1: waveform1,
            w2: waveform2,
            effects: {
                reverb: [t1Reverb === 1, t2Reverb === 1, t3Reverb === 1],
                delay: [t1Delay === 1, t2Delay === 1, t3Delay === 1]
            },
            t: { track1: piano1, track2: piano2, track3: percussion },
            patterns
        };
    }
    
    /**
     * Deserialize v6 format with waveform and effects support
     * Header: 21 bits (mode:2, speed:2, loop:1, lengthIndex:2, keyIndex:4, waveform1:2, waveform2:2, effects:6)
     * Effects: 6 bits (t1_reverb, t1_delay, t2_reverb, t2_delay, t3_reverb, t3_delay)
     * Per beat: 35 bits - piano1(14) + piano2(14) + percussion(7)
     * Piano: note(4) + duration(3) + velocity(4) + octave(3)
     * Percussion: note(3) + velocity(4)
     */
    deserializeV6(bits) {
        const PIANO_NOTES = ['', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const PIANO_ICONS = {
            'C': 'C', 'C#': 'C♯', 'D': 'D', 'D#': 'D♯', 'E': 'E', 'F': 'F',
            'F#': 'F♯', 'G': 'G', 'G#': 'G♯', 'A': 'A', 'A#': 'A♯', 'B': 'B'
        };
        
        let offset = 0;
        
        // Read header (21 bits: 15 original + 6 effects)
        const modeIndex = this.readBits(bits, offset, 2); offset += 2;
        const speedIndex = this.readBits(bits, offset, 2); offset += 2;
        const loop = this.readBits(bits, offset, 1); offset += 1;
        const lengthIndex = this.readBits(bits, offset, 2); offset += 2;
        const keyIndex = this.readBits(bits, offset, 4); offset += 4;
        const waveform1Index = this.readBits(bits, offset, 2); offset += 2;
        const waveform2Index = this.readBits(bits, offset, 2); offset += 2;
        
        // Read effects (6 bits)
        const track1Reverb = this.readBits(bits, offset, 1); offset += 1;
        const track1Delay = this.readBits(bits, offset, 1); offset += 1;
        const track2Reverb = this.readBits(bits, offset, 1); offset += 1;
        const track2Delay = this.readBits(bits, offset, 1); offset += 1;
        const track3Reverb = this.readBits(bits, offset, 1); offset += 1;
        const track3Delay = this.readBits(bits, offset, 1); offset += 1;
        
        const beatCount = this.beatLengths[lengthIndex] || 16;
        const keyName = Game.KEY_NAMES[keyIndex] || 'C Major';
        const mode = Object.values(Game.MODES)[modeIndex] || Game.MODES.KID;
        const waveform1 = Game.WAVEFORMS[waveform1Index] || 'sine';
        const waveform2 = Game.WAVEFORMS[waveform2Index] || 'triangle';
        
        // Read track data with velocity and octave
        const track1 = [];
        const track2 = [];
        const track3 = [];
        
        for (let beat = 0; beat < beatCount; beat++) {
            // Piano track 1: 4 bits note + 3 bits duration + 4 bits velocity + 3 bits octave
            const note1Index = this.readBits(bits, offset, 4); offset += 4;
            const duration1 = this.readBits(bits, offset, 3) + 1; offset += 3;
            const velocity1 = this.readBits(bits, offset, 4) / 15; offset += 4;
            const octave1 = this.readBits(bits, offset, 3) + 2; offset += 3; // Map 0-4 to octaves 2-6
            
            // Piano track 2: 4 bits note + 3 bits duration + 4 bits velocity + 3 bits octave
            const note2Index = this.readBits(bits, offset, 4); offset += 4;
            const duration2 = this.readBits(bits, offset, 3) + 1; offset += 3;
            const velocity2 = this.readBits(bits, offset, 4) / 15; offset += 4;
            const octave2 = this.readBits(bits, offset, 3) + 2; offset += 3; // Map 0-4 to octaves 2-6
            
            // Percussion: 3 bits note + 4 bits velocity
            const percIndex = this.readBits(bits, offset, 3); offset += 3;
            const velocity3 = this.readBits(bits, offset, 4) / 15; offset += 4;
            
            // Add notes if valid (with octave and velocity)
            if (note1Index > 0 && note1Index < PIANO_NOTES.length) {
                const note = PIANO_NOTES[note1Index];
                track1.push([beat, note, PIANO_ICONS[note], duration1, octave1, velocity1]);
            }
            if (note2Index > 0 && note2Index < PIANO_NOTES.length) {
                const note = PIANO_NOTES[note2Index];
                track2.push([beat, note, PIANO_ICONS[note], duration2, octave2, velocity2]);
            }
            if (percIndex > 0 && percIndex < Game.PERC_NOTES.length) {
                track3.push([beat, Game.PERC_NOTES[percIndex], Game.PERC_ICONS[percIndex], 1, null, velocity3]);
            }
        }
        
        return {
            mode: mode,
            s: speedIndex,
            l: loop,
            b: beatCount,
            k: keyName,
            w1: waveform1,
            w2: waveform2,
            effects: {
                reverb: [track1Reverb === 1, track2Reverb === 1, track3Reverb === 1],
                delay: [track1Delay === 1, track2Delay === 1, track3Delay === 1]
            },
            t: { track1, track2, track3 }
        };
    }

    /**
     * Deserialize v5 format with octave support (legacy)
     * Header: 11 bits (mode:2, speed:2, loop:1, lengthIndex:2, keyIndex:4)
     * Per beat: 35 bits - piano1(14) + piano2(14) + percussion(7)
     * Piano: note(4) + duration(3) + velocity(4) + octave(3)
     * Percussion: note(3) + velocity(4)
     */
    deserializeV5(bits) {
        const PIANO_NOTES = ['', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const PIANO_ICONS = {
            'C': 'C', 'C#': 'C♯', 'D': 'D', 'D#': 'D♯', 'E': 'E', 'F': 'F',
            'F#': 'F♯', 'G': 'G', 'G#': 'G♯', 'A': 'A', 'A#': 'A♯', 'B': 'B'
        };
        
        let offset = 0;
        
        // Read header (11 bits)
        const modeIndex = this.readBits(bits, offset, 2); offset += 2;
        const speedIndex = this.readBits(bits, offset, 2); offset += 2;
        const loop = this.readBits(bits, offset, 1); offset += 1;
        const lengthIndex = this.readBits(bits, offset, 2); offset += 2;
        const keyIndex = this.readBits(bits, offset, 4); offset += 4;
        
        const beatCount = this.beatLengths[lengthIndex] || 16;
        const keyName = Game.KEY_NAMES[keyIndex] || 'C Major';
        const mode = Object.values(Game.MODES)[modeIndex] || Game.MODES.KID;
        
        // Read track data with velocity and octave
        const track1 = [];
        const track2 = [];
        const track3 = [];
        
        for (let beat = 0; beat < beatCount; beat++) {
            // Piano track 1: 4 bits note + 3 bits duration + 4 bits velocity + 3 bits octave
            const note1Index = this.readBits(bits, offset, 4); offset += 4;
            const duration1 = this.readBits(bits, offset, 3) + 1; offset += 3;
            const velocity1 = this.readBits(bits, offset, 4) / 15; offset += 4;
            const octave1 = this.readBits(bits, offset, 3) + 2; offset += 3; // Map 0-4 to octaves 2-6
            
            // Piano track 2: 4 bits note + 3 bits duration + 4 bits velocity + 3 bits octave
            const note2Index = this.readBits(bits, offset, 4); offset += 4;
            const duration2 = this.readBits(bits, offset, 3) + 1; offset += 3;
            const velocity2 = this.readBits(bits, offset, 4) / 15; offset += 4;
            const octave2 = this.readBits(bits, offset, 3) + 2; offset += 3; // Map 0-4 to octaves 2-6
            
            // Percussion: 3 bits note + 4 bits velocity
            const percIndex = this.readBits(bits, offset, 3); offset += 3;
            const velocity3 = this.readBits(bits, offset, 4) / 15; offset += 4;
            
            // Add notes if valid (with octave and velocity)
            if (note1Index > 0 && note1Index < PIANO_NOTES.length) {
                const note = PIANO_NOTES[note1Index];
                track1.push([beat, note, PIANO_ICONS[note], duration1, octave1, velocity1]); // Use decoded octave
            }
            if (note2Index > 0 && note2Index < PIANO_NOTES.length) {
                const note = PIANO_NOTES[note2Index];
                track2.push([beat, note, PIANO_ICONS[note], duration2, octave2, velocity2]); // Use decoded octave
            }
            if (percIndex > 0 && percIndex < Game.PERC_NOTES.length) {
                track3.push([beat, Game.PERC_NOTES[percIndex], Game.PERC_ICONS[percIndex], 1, null, velocity3]); // no octave, velocity
            }
        }
        
        return {
            mode: mode,
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
        
        if (!encoded) {
            console.log('No URL parameter found');
            return;
        }
        
        console.log('Loading from URL:', encoded.substring(0, 20) + '...');
        const state = this.deserializeState(encoded);
        if (!state) {
            console.error('Failed to deserialize state');
            return;
        }
        
        console.log('Deserialized state:', state);
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
     * Export song as WAV file using OfflineAudioContext
     * Renders the entire composition to an audio buffer and downloads as WAV
     */
    async exportWAV() {
        try {
            this.showShareMessage('🎵 Rendering audio...', 'info');
            
            // Calculate total duration
            const beatCount = this.timeline.getBeatCount();
            const beatDurationMs = this.getBeatDuration();
            const totalDurationSec = (beatCount * beatDurationMs) / 1000;
            
            // Create offline audio context (44.1kHz, stereo)
            const offlineCtx = new OfflineAudioContext(2, totalDurationSec * 44100, 44100);
            
            // Render each beat
            for (let beat = 0; beat < beatCount; beat++) {
                const notes = this.timeline.getNotesAtBeat(beat);
                const startTime = (beat * beatDurationMs) / 1000;
                const beatDurationSec = beatDurationMs / 1000;
                
                // Track 1 (piano)
                if (notes[1] && !notes[1].sustained) {
                    const duration = (notes[1].duration || 1) * beatDurationSec;
                    const velocity = notes[1].velocity || 0.8;
                    const octave = notes[1].octave || 5;
                    this.renderNoteToContext(offlineCtx, notes[1].note, 1, startTime, duration, velocity, octave);
                }
                
                // Track 2 (piano)
                if (notes[2] && !notes[2].sustained) {
                    const duration = (notes[2].duration || 1) * beatDurationSec;
                    const velocity = notes[2].velocity || 0.8;
                    const octave = notes[2].octave || 3;
                    this.renderNoteToContext(offlineCtx, notes[2].note, 2, startTime, duration, velocity, octave);
                }
                
                // Track 3 (percussion)
                if (notes[3] && !notes[3].sustained) {
                    const velocity = notes[3].velocity || 0.8;
                    this.renderPercussionToContext(offlineCtx, notes[3].note, startTime, velocity);
                }
            }
            
            // Render audio buffer
            const audioBuffer = await offlineCtx.startRendering();
            
            // Convert to WAV
            const wavBlob = this.audioBufferToWav(audioBuffer);
            
            // Download
            const url = URL.createObjectURL(wavBlob);
            const link = document.createElement('a');
            link.download = 'music-box-song.wav';
            link.href = url;
            link.click();
            
            setTimeout(() => URL.revokeObjectURL(url), 100);
            this.showShareMessage('✅ WAV exported!', 'success');
        } catch (err) {
            console.error('WAV export failed:', err);
            this.showShareMessage('❌ Export failed', 'error');
        }
    }

    /**
     * Render a piano note to offline audio context
     */
    renderNoteToContext(ctx, note, trackNum, startTime, duration, velocity, octave) {
        const frequency = this.audio.noteToFrequency(note, octave);
        if (!frequency) return;
        
        const waveform = this.audio.trackWaveforms[trackNum] || (trackNum === 1 ? 'sine' : 'triangle');
        const baseVolume = trackNum === 1 ? 0.4 : 0.5;
        
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = waveform;
        osc.frequency.value = frequency;
        
        // ADSR envelope
        const now = startTime;
        const attackTime = 0.01;
        const releaseTime = 0.1;
        const sustainLevel = baseVolume * velocity;
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime);
        gainNode.gain.setValueAtTime(sustainLevel, now + duration - releaseTime);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + duration);
    }

    /**
     * Render a percussion sound to offline audio context
     */
    renderPercussionToContext(ctx, type, startTime, velocity) {
        // Simple percussion synthesis (basic kick/snare/hihat)
        const duration = 0.15;
        
        if (type === 'kick') {
            // Kick drum: low frequency sweep
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.frequency.setValueAtTime(150, startTime);
            osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.8 * velocity, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration);
        } else if (type === 'snare') {
            // Snare: noise burst
            const bufferSize = ctx.sampleRate * duration;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
            }
            
            const noise = ctx.createBufferSource();
            const gainNode = ctx.createGain();
            
            noise.buffer = buffer;
            gainNode.gain.setValueAtTime(0.5 * velocity, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            noise.connect(gainNode);
            gainNode.connect(ctx.destination);
            noise.start(startTime);
        } else if (type === 'hihat') {
            // Hi-hat: filtered noise
            const bufferSize = ctx.sampleRate * 0.05;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            const noise = ctx.createBufferSource();
            const filter = ctx.createBiquadFilter();
            const gainNode = ctx.createGain();
            
            noise.buffer = buffer;
            filter.type = 'highpass';
            filter.frequency.value = 7000;
            
            gainNode.gain.setValueAtTime(0.3 * velocity, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);
            
            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(ctx.destination);
            noise.start(startTime);
        }
        // Other percussion types can be added similarly
    }

    /**
     * Convert AudioBuffer to WAV blob
     */
    audioBufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;
        
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        
        const data = [];
        for (let i = 0; i < buffer.length; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                let sample = buffer.getChannelData(channel)[i];
                // Clamp to [-1, 1]
                sample = Math.max(-1, Math.min(1, sample));
                // Convert to 16-bit PCM
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                data.push(sample);
            }
        }
        
        const dataSize = data.length * bytesPerSample;
        const buffer32 = new ArrayBuffer(44 + dataSize);
        const view = new DataView(buffer32);
        
        // WAV header
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataSize, true);
        this.writeString(view, 8, 'WAVE');
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // fmt chunk size
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        this.writeString(view, 36, 'data');
        view.setUint32(40, dataSize, true);
        
        // Write PCM samples
        let offset = 44;
        for (let i = 0; i < data.length; i++) {
            view.setInt16(offset, data[i], true);
            offset += 2;
        }
        
        return new Blob([buffer32], { type: 'audio/wav' });
    }

    /**
     * Write string to DataView
     */
    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    /**
     * Export song as MIDI file
     * Creates a Type 1 MIDI file with separate tracks
     */
    exportMIDI() {
        try {
            this.showShareMessage('🎹 Creating MIDI...', 'info');
            
            const beatCount = this.timeline.getBeatCount();
            const bpm = this.useBPM ? this.currentBPM : [60, 90, 120, 160][this.currentSpeedIndex];
            
            // MIDI ticks per quarter note
            const ticksPerBeat = 480;
            
            // Create MIDI file data
            const headerChunk = this.createMIDIHeader(3); // 3 tracks
            const track1 = this.createMIDITrack(1, beatCount, ticksPerBeat);
            const track2 = this.createMIDITrack(2, beatCount, ticksPerBeat);
            const track3 = this.createMIDITrack(3, beatCount, ticksPerBeat);
            
            // Combine chunks
            const midiData = this.concatArrays([
                headerChunk,
                this.createTempoTrack(bpm, ticksPerBeat),
                track1,
                track2,
                track3
            ]);
            
            // Download
            const blob = new Blob([midiData], { type: 'audio/midi' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'music-box-song.mid';
            link.href = url;
            link.click();
            
            setTimeout(() => URL.revokeObjectURL(url), 100);
            this.showShareMessage('✅ MIDI exported!', 'success');
        } catch (err) {
            console.error('MIDI export failed:', err);
            this.showShareMessage('❌ Export failed', 'error');
        }
    }

    /**
     * Create MIDI header chunk
     */
    createMIDIHeader(numTracks) {
        const data = new Uint8Array(14);
        const view = new DataView(data.buffer);
        
        // MThd
        this.writeString(view, 0, 'MThd');
        view.setUint32(4, 6); // Header length
        view.setUint16(8, 1); // Format 1 (multiple tracks, synchronous)
        view.setUint16(10, numTracks + 1); // Number of tracks (+ tempo track)
        view.setUint16(12, 480); // Ticks per quarter note
        
        return data;
    }

    /**
     * Create tempo track with BPM setting
     */
    createTempoTrack(bpm, ticksPerBeat) {
        const events = [];
        
        // Tempo meta event (FF 51 03 tttttt)
        const microsecondsPerBeat = Math.round(60000000 / bpm);
        events.push([0, 0xFF, 0x51, 0x03, 
            (microsecondsPerBeat >> 16) & 0xFF,
            (microsecondsPerBeat >> 8) & 0xFF,
            microsecondsPerBeat & 0xFF
        ]);
        
        // End of track
        events.push([0, 0xFF, 0x2F, 0x00]);
        
        return this.createMIDITrackChunk(events);
    }

    /**
     * Create MIDI track from timeline data
     */
    createMIDITrack(trackNum, beatCount, ticksPerBeat) {
        const events = [];
        const notes = [];
        
        // Collect all notes from timeline
        for (let beat = 0; beat < beatCount; beat++) {
            const notesAtBeat = this.timeline.getNotesAtBeat(beat);
            const note = notesAtBeat[trackNum];
            
            if (note && !note.sustained) {
                const midiNote = this.noteToMIDI(note.note, note.octave, trackNum);
                const velocity = Math.round((note.velocity || 0.8) * 127);
                const startTick = beat * ticksPerBeat;
                const duration = (note.duration || 1) * ticksPerBeat;
                
                notes.push({ midiNote, velocity, startTick, duration });
            }
        }
        
        // Sort by start time
        notes.sort((a, b) => a.startTick - b.startTick);
        
        // Create note on/off events
        let currentTick = 0;
        const allEvents = [];
        
        for (const note of notes) {
            const delta = note.startTick - currentTick;
            allEvents.push({ tick: note.startTick, data: [delta, 0x90, note.midiNote, note.velocity] }); // Note on
            allEvents.push({ tick: note.startTick + note.duration, data: [note.duration, 0x80, note.midiNote, 0] }); // Note off
            currentTick = note.startTick;
        }
        
        // Sort all events by tick
        allEvents.sort((a, b) => a.tick - b.tick);
        
        // Calculate delta times
        currentTick = 0;
        for (const event of allEvents) {
            event.data[0] = event.tick - currentTick;
            currentTick = event.tick;
            events.push(event.data);
        }
        
        // End of track
        events.push([0, 0xFF, 0x2F, 0x00]);
        
        return this.createMIDITrackChunk(events);
    }

    /**
     * Convert note name to MIDI note number
     */
    noteToMIDI(noteName, octave, trackNum) {
        const noteMap = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };
        
        // Percussion uses channel 10 (MIDI notes 35-81)
        if (trackNum === 3) {
            const percMap = { 'kick': 36, 'snare': 38, 'hihat': 42, 'clap': 39, 'tom': 45, 'cymbal': 49, 'shaker': 70, 'cowbell': 56 };
            return percMap[noteName] || 36;
        }
        
        // Piano notes
        const finalOctave = octave !== null && octave !== undefined ? octave : (trackNum === 1 ? 5 : 3);
        const noteValue = noteMap[noteName];
        if (noteValue === undefined) return 60; // Default to middle C
        
        return (finalOctave + 1) * 12 + noteValue;
    }

    /**
     * Create MIDI track chunk from events
     */
    createMIDITrackChunk(events) {
        // Flatten events and encode variable-length delta times
        const trackData = [];
        
        for (const event of events) {
            const delta = event[0];
            const varLen = this.encodeVariableLength(delta);
            trackData.push(...varLen);
            trackData.push(...event.slice(1));
        }
        
        // Create track chunk
        const data = new Uint8Array(8 + trackData.length);
        const view = new DataView(data.buffer);
        
        this.writeString(view, 0, 'MTrk');
        view.setUint32(4, trackData.length);
        
        for (let i = 0; i < trackData.length; i++) {
            data[8 + i] = trackData[i];
        }
        
        return data;
    }

    /**
     * Encode integer as MIDI variable-length quantity
     */
    encodeVariableLength(value) {
        const buffer = [];
        buffer.push(value & 0x7F);
        
        while ((value >>= 7) > 0) {
            buffer.unshift((value & 0x7F) | 0x80);
        }
        
        return buffer;
    }

    /**
     * Concatenate multiple Uint8Arrays
     */
    concatArrays(arrays) {
        const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        
        for (const arr of arrays) {
            result.set(arr, offset);
            offset += arr.length;
        }
        
        return result;
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
        // Apply mode (new in v4)
        if (state.mode) {
            this.setMode(state.mode, false); // Don't save to localStorage during load
        }
        
        // Apply speed
        if (typeof state.s === 'number' && state.s >= 0 && state.s < this.speeds.length) {
            this.currentSpeedIndex = state.s;
            this.elements.speedBtn.textContent = this.speeds[this.currentSpeedIndex].icon;
        }
        
        // Apply BPM (v7 only)
        if (state.useBPM && typeof state.bpm === 'number') {
            this.currentBPM = state.bpm;
            this.useBPM = true;
            if (this.elements.bpmInput) {
                this.elements.bpmInput.value = state.bpm;
            }
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
        
        // Apply waveforms (v6 only) - directly to audio system
        if (state.w1 && Game.WAVEFORMS.includes(state.w1)) {
            this.audio.trackWaveforms[1] = state.w1;
        }
        if (state.w2 && Game.WAVEFORMS.includes(state.w2)) {
            this.audio.trackWaveforms[2] = state.w2;
        }
        
        // Apply effects (v6 with effects) - directly to audio system
        if (state.effects) {
            if (state.effects.reverb) {
                this.audio.setReverbEnabled(1, state.effects.reverb[0]);
                this.audio.setReverbEnabled(2, state.effects.reverb[1]);
                this.audio.setReverbEnabled(3, state.effects.reverb[2]);
            }
            if (state.effects.delay) {
                this.audio.setDelayEnabled(1, state.effects.delay[0]);
                this.audio.setDelayEnabled(2, state.effects.delay[1]);
                this.audio.setDelayEnabled(3, state.effects.delay[2]);
            }
        }
        
        // Apply tracks
        if (state.t) {
            this.timeline.deserializeTracks(state.t);
        }
        
        // Apply pattern placements (v7+)
        if (state.patterns && Array.isArray(state.patterns)) {
            for (const placement of state.patterns) {
                this.placePattern(placement.patternId, placement.startBeat);
            }
        }
        
        // Update URL
        this.updateURL();
    }
    
    /**
     * Load mode from localStorage
     * @returns {string} Mode ('kid', 'tween', or 'studio')
     */
    loadMode() {
        const savedMode = localStorage.getItem('musicBoxMode');
        if (savedMode && Object.values(Game.MODES).includes(savedMode)) {
            return savedMode;
        }
        return Game.MODES.KID; // Default to Kid Mode
    }
    
    /**
     * Set the current mode
     * @param {string} mode - Mode to set ('kid', 'tween', or 'studio')
     * @param {boolean} persist - Whether to save to localStorage (default: true)
     */
    setMode(mode, persist = true) {
        if (!Object.values(Game.MODES).includes(mode)) {
            console.error('Invalid mode:', mode);
            return;
        }
        
        this.currentMode = mode;
        
        // Update body data attribute for CSS theming
        document.body.setAttribute('data-mode', mode);
        
        // Update visualizer mode
        if (this.visualizer) {
            this.visualizer.setMode(mode);
        }
        
        // Update pattern drawer mode
        if (this.patternDrawer) {
            this.patternDrawer.updateForMode(mode);
        }
        
        // Persist to localStorage
        if (persist) {
            localStorage.setItem('musicBoxMode', mode);
        }
        
        // Apply mode-specific UI updates
        this.applyModeConfig();
        
        console.log('Mode set to:', mode);
    }
    
    /**
     * Get the current mode configuration
     * @returns {Object} Mode config object
     */
    getModeConfig() {
        return Game.MODE_CONFIGS[this.currentMode];
    }
    
    /**
     * Check if a feature is enabled in the current mode
     * @param {string} feature - Feature name to check
     * @returns {boolean} Whether the feature is enabled
     */
    isFeatureEnabled(feature) {
        const config = this.getModeConfig();
        switch (feature) {
            case 'sharps':
                return config.showSharps;
            case 'keySelector':
                return config.showKeySelector;
            case 'duration':
                return config.showDuration;
            default:
                return true; // Unknown features default to enabled
        }
    }
    
    /**
     * Apply mode-specific configuration to UI
     */
    applyModeConfig() {
        const config = this.getModeConfig();
        
        // Update mode button states
        this.updateModeButtonStates();
        
        // Kid Mode: Lock to C Major
        if (this.currentMode === Game.MODES.KID) {
            this.currentKey = 'C Major';
            if (this.elements.keySelect) {
                this.elements.keySelect.value = 'C Major';
            }
            if (this.pianoKeyboard) {
                this.pianoKeyboard.updateDisabledKeys(Game.KEY_SIGNATURES['C Major']);
            }
        }
        
        // Update key selector visibility
        if (this.elements.keySelect) {
            const keySelector = this.elements.keySelect.closest('.key-selector');
            if (keySelector) {
                keySelector.style.display = config.showKeySelector ? 'flex' : 'none';
            }
        }
        
        // Update piano keyboard (sharps/flats visibility)
        if (this.pianoKeyboard) {
            this.pianoKeyboard.setShowSharps(config.showSharps);
            
            // Enable multi-octave mode for Studio Mode
            this.pianoKeyboard.setMultiOctaveMode(this.currentMode === Game.MODES.STUDIO);
        }
        
        // Update timeline max beats
        if (this.timeline) {
            this.timeline.setMaxBeats(config.maxBeats);
            
            // Clamp current beat count if it exceeds max
            const currentBeats = this.timeline.getBeatCount();
            if (currentBeats > config.maxBeats) {
                const allowedLengths = this.beatLengths.filter(len => len <= config.maxBeats);
                const newBeats = allowedLengths[allowedLengths.length - 1] || config.maxBeats;
                this.timeline.setBeatCount(newBeats);
                this.elements.beatCount.textContent = newBeats;
            }
        }
        
        // Update speed button visibility
        this.updateSpeedControls();
        
        // Update export button visibility (Studio Mode only)
        if (this.elements.exportWavBtn) {
            this.elements.exportWavBtn.style.display = this.currentMode === Game.MODES.STUDIO ? 'inline-flex' : 'none';
        }
        if (this.elements.exportMidiBtn) {
            this.elements.exportMidiBtn.style.display = this.currentMode === Game.MODES.STUDIO ? 'inline-flex' : 'none';
        }
        
        // Update octave controls visibility (Studio Mode only)
        const octaveControls = document.querySelector('.octave-controls');
        if (octaveControls) {
            octaveControls.style.display = this.currentMode === Game.MODES.STUDIO ? 'flex' : 'none';
        }
        
        // Update add track button visibility and state
        this.updateAddTrackButton();
        
        // Disable effects in kid and tween modes (not modifiable)
        if (this.currentMode !== Game.MODES.STUDIO) {
            for (let trackNum = 1; trackNum <= 3; trackNum++) {
                this.audio.setReverbEnabled(trackNum, false);
                this.audio.setDelayEnabled(trackNum, false);
            }
        }
        
        console.log('Applied mode config:', config);
    }
    
    /**
     * Update speed controls based on mode
     */
    updateSpeedControls() {
        const config = this.getModeConfig();
        const isStudioMode = this.currentMode === Game.MODES.STUDIO;
        
        // Studio Mode: Show BPM input, hide/disable speed button, enable BPM mode
        if (this.elements.bpmInput) {
            const bpmContainer = this.elements.bpmInput.closest('.bpm-input-container');
            if (bpmContainer) {
                bpmContainer.style.display = isStudioMode ? 'flex' : 'none';
            }
            if (isStudioMode) {
                this.elements.bpmInput.value = this.currentBPM;
                this.useBPM = true; // Enable BPM mode for Studio
            } else {
                this.useBPM = false; // Disable BPM mode for Kid/Tween
            }
        }
        
        if (this.elements.speedBtn) {
            this.elements.speedBtn.style.display = isStudioMode ? 'none' : 'flex';
        }
        
        // Kid Mode: Ensure speed is one of the allowed values
        if (this.currentMode === Game.MODES.KID) {
            const kidSpeeds = config.speeds; // [0, 2]
            if (!kidSpeeds.includes(this.currentSpeedIndex)) {
                this.currentSpeedIndex = kidSpeeds[0]; // Default to slow
            }
            this.elements.speedBtn.textContent = this.speeds[this.currentSpeedIndex].icon;
        }
    }
    
    /**
     * Update mode button visual states
     */
    updateModeButtonStates() {
        const modeBtns = document.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            if (btn.getAttribute('data-mode') === this.currentMode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

window.Game = Game;
