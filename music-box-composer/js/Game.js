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
            onCellClick: (track, beat, note) => this.handleCellClick(track, beat)
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
    }

    /**
     * Handle note drop from palette
     */
    handleNoteDrop(track, beat, note, icon) {
        this.timeline.setNote(track, beat, note, icon);
        this.audio.playNote(note, track);
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
    }

    /**
     * Toggle loop mode
     */
    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.elements.loopBtn.classList.toggle('active', this.isLooping);
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
    }
}

window.Game = Game;
