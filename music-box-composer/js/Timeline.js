/**
 * Timeline.js - Manages the multi-track timeline UI
 */
class Timeline {
    constructor(options) {
        this.container = options.container;
        this.scrollContainer = options.scrollContainer;
        this.beatMarkersEl = options.beatMarkers;
        this.playhead = options.playhead;
        
        this.trackElements = {
            1: options.cells1,
            2: options.cells2,
            3: options.cells3
        };
        
        this.tracks = {
            1: new Track(1),
            2: new Track(2),
            3: new Track(3)
        };
        
        this.beatCount = 16;
        this.cellSize = 44; // Will be updated from CSS
        
        this.onCellClick = options.onCellClick || (() => {});
        this.onCellDrop = options.onCellDrop || (() => {});
        this.onNoteChange = options.onNoteChange || (() => {});
        
        this.init();
    }

    /**
     * Initialize the timeline
     */
    init() {
        this.updateCellSize();
        this.render();
        
        // Listen for window resize to update cell size
        window.addEventListener('resize', () => {
            this.updateCellSize();
            this.updatePlayheadPosition(0);
        });
    }

    /**
     * Update cell size from CSS variable
     */
    updateCellSize() {
        const style = getComputedStyle(document.documentElement);
        this.cellSize = parseInt(style.getPropertyValue('--cell-size')) || 44;
    }

    /**
     * Render the entire timeline
     */
    render() {
        this.renderBeatMarkers();
        this.renderTrack(1);
        this.renderTrack(2);
        this.renderTrack(3);
    }

    /**
     * Render beat markers
     */
    renderBeatMarkers() {
        this.beatMarkersEl.innerHTML = '';
        
        for (let i = 0; i < this.beatCount; i++) {
            const marker = document.createElement('div');
            marker.className = 'beat-marker';
            
            // Mark downbeats (every 4th beat)
            if (i % 4 === 0) {
                marker.classList.add('downbeat');
                marker.textContent = Math.floor(i / 4) + 1;
            } else {
                marker.textContent = '·';
            }
            
            this.beatMarkersEl.appendChild(marker);
        }
    }

    /**
     * Render a single track
     * @param {number} trackNum - Track number (1, 2, or 3)
     */
    renderTrack(trackNum) {
        const container = this.trackElements[trackNum];
        const track = this.tracks[trackNum];
        
        container.innerHTML = '';
        
        for (let i = 0; i < this.beatCount; i++) {
            const cell = document.createElement('div');
            cell.className = 'track-cell';
            cell.dataset.beat = i;
            cell.dataset.track = trackNum;
            
            // Mark downbeats
            if (i % 4 === 0) {
                cell.classList.add('downbeat');
            }
            
            // Check if this beat is covered by an extended note
            const coveringNote = track.getCoveringNote(i);
            if (coveringNote) {
                cell.classList.add('covered-by-note');
            }
            
            // Add note if present
            const note = track.getNote(i);
            if (note) {
                cell.classList.add('has-note');
                const duration = note.duration || 1;
                
                // Create note element that can span multiple cells
                const noteEl = document.createElement('div');
                noteEl.className = 'cell-note';
                noteEl.textContent = note.icon;
                noteEl.dataset.duration = duration;
                noteEl.dataset.note = note.note; // For color styling
                
                // Set width based on duration (always use calc for consistency)
                if (duration > 1) {
                    noteEl.classList.add('extended');
                }
                noteEl.style.width = `calc(${duration} * var(--cell-size) - 4px)`;
                
                // Setup drag-to-resize
                this.setupNoteDrag(noteEl, trackNum, i, note);
                
                cell.appendChild(noteEl);
            }
            
            // Click to remove note (only if not covered)
            cell.addEventListener('click', (e) => {
                // Don't remove if clicked on the note element (handled by note drag)
                if (e.target.classList.contains('cell-note')) return;
                
                if (track.hasNote(i)) {
                    this.onCellClick(trackNum, i, null);
                } else if (coveringNote) {
                    // Clicking on a covered cell clears the parent note
                    this.onCellClick(trackNum, coveringNote.startBeat, null);
                }
            });
            
            container.appendChild(cell);
        }
    }

    /**
     * Setup drag-to-resize for a note
     * @param {HTMLElement} noteEl - Note element
     * @param {string} trackType - Track type
     * @param {number} beat - Beat index
     * @param {Object} note - Note data
     */
    setupNoteDrag(noteEl, trackType, beat, note) {
        let startX = null;
        let startDuration = note.duration || 1;
        let isDragging = false;
        const dragThreshold = 10;
        
        const handleDragStart = (clientX) => {
            startX = clientX;
            startDuration = note.duration || 1;
            isDragging = false;
        };
        
        const handleDragMove = (clientX) => {
            if (startX === null) return;
            
            const dx = clientX - startX;
            
            if (!isDragging && Math.abs(dx) > dragThreshold) {
                isDragging = true;
                noteEl.classList.add('resizing');
            }
            
            if (isDragging) {
                // Calculate new duration based on drag distance
                const cellsChange = Math.round(dx / this.cellSize);
                const newDuration = Math.max(1, startDuration + cellsChange);
                
                // Preview the new size visually
                const maxDuration = this.getMaxDuration(trackType, beat, startDuration);
                const clampedDuration = Math.min(newDuration, maxDuration);
                noteEl.style.width = `calc(${clampedDuration} * var(--cell-size) - 4px)`;
                noteEl.dataset.previewDuration = clampedDuration;
            }
        };
        
        const handleDragEnd = () => {
            if (isDragging && noteEl.dataset.previewDuration) {
                const newDuration = parseInt(noteEl.dataset.previewDuration);
                if (newDuration !== startDuration) {
                    this.onNoteResize(trackType, beat, newDuration);
                }
            }
            
            startX = null;
            isDragging = false;
            noteEl.classList.remove('resizing');
            delete noteEl.dataset.previewDuration;
        };
        
        // Touch events
        noteEl.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            handleDragStart(e.touches[0].clientX);
        }, { passive: true });
        
        noteEl.addEventListener('touchmove', (e) => {
            if (startX !== null) {
                e.preventDefault();
                e.stopPropagation();
                handleDragMove(e.touches[0].clientX);
            }
        }, { passive: false });
        
        noteEl.addEventListener('touchend', (e) => {
            e.stopPropagation();
            handleDragEnd();
        });
        
        noteEl.addEventListener('touchcancel', () => {
            startX = null;
            isDragging = false;
            noteEl.classList.remove('resizing');
        });
        
        // Mouse events
        noteEl.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            handleDragStart(e.clientX);
            
            const onMouseMove = (moveE) => handleDragMove(moveE.clientX);
            const onMouseUp = () => {
                handleDragEnd();
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
        
        // Click to delete (if not dragged)
        noteEl.addEventListener('click', (e) => {
            if (!isDragging) {
                e.stopPropagation();
                this.onCellClick(trackType, beat, null);
            }
        });
    }

    /**
     * Get maximum duration a note can extend to
     * @param {string} trackType - Track type
     * @param {number} beat - Starting beat
     * @param {number} currentDuration - Current duration
     * @returns {number} Maximum duration
     */
    getMaxDuration(trackType, beat, currentDuration) {
        const track = this.tracks[trackType];
        let maxDuration = this.beatCount - beat;
        
        // Check for notes that would block extension
        for (let i = beat + currentDuration; i < this.beatCount; i++) {
            if (track.hasNote(i)) {
                maxDuration = i - beat;
                break;
            }
        }
        
        return maxDuration;
    }

    /**
     * Handle note resize
     * @param {string} trackType - Track type
     * @param {number} beat - Beat index
     * @param {number} newDuration - New duration
     */
    onNoteResize(trackType, beat, newDuration) {
        const track = this.tracks[trackType];
        const note = track.getNote(beat);
        if (note) {
            note.duration = newDuration;
            this.renderTrack(trackType);
            this.onNoteChange();
        }
    }

    /**
     * Set a note on a track
     * @param {number} trackNum - Track number (1, 2, or 3)
     * @param {number} beat - Beat index
     * @param {Object} noteData - Note data {note, icon, duration, octave}
     */
    setNote(trackNum, beat, noteData) {
        this.tracks[trackNum].setNote(beat, noteData);
        this.renderTrack(trackNum);
    }

    /**
     * Clear a note from a track
     * @param {number} trackNum - Track number (1, 2, or 3)
     * @param {number} beat - Beat index
     */
    clearNote(trackNum, beat) {
        this.tracks[trackNum].clearNote(beat);
        this.renderTrack(trackNum);
    }

    /**
     * Clear all tracks
     */
    clearAll() {
        Object.values(this.tracks).forEach(track => track.clear());
        this.render();
    }

    /**
     * Check if all tracks are empty
     * @returns {boolean}
     */
    isEmpty() {
        return Object.values(this.tracks).every(track => track.isEmpty());
    }

    /**
     * Get notes at a specific beat across all tracks
     * Includes extended notes that started earlier but are still playing
     * @param {number} beat - Beat index
     * @returns {Object} - { 1: note|null, 2: note|null, 3: note|null }
     */
    getNotesAtBeat(beat) {
        const result = {};
        
        [1, 2, 3].forEach(trackNum => {
            const track = this.tracks[trackNum];
            // First check if there's a note starting at this beat
            let note = track.getNote(beat);
            
            // If no note at this beat, check if an extended note covers this beat
            if (!note) {
                const covering = track.getCoveringNote(beat);
                if (covering) {
                    // Return the covering note but mark it as sustained (not a new attack)
                    note = { ...covering.note, sustained: true };
                }
            }
            
            result[trackNum] = note;
        });
        
        return result;
    }

    /**
     * Highlight cells at a beat (during playback)
     * @param {number} beat - Beat index (-1 to clear all)
     */
    highlightBeat(beat) {
        // Remove all playing highlights
        document.querySelectorAll('.track-cell.playing').forEach(cell => {
            cell.classList.remove('playing');
        });
        
        if (beat >= 0) {
            // Add highlight to current beat cells
            Object.keys(this.trackElements).forEach(trackNum => {
                const cells = this.trackElements[trackNum].children;
                if (cells[beat]) {
                    cells[beat].classList.add('playing');
                }
            });
        }
    }

    /**
     * Update playhead position
     * @param {number} beat - Current beat (can be fractional for smooth animation)
     */
    updatePlayheadPosition(beat) {
        const trackLabelWidth = parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--track-label-width')) || 36;
        const position = trackLabelWidth + (beat * this.cellSize);
        this.playhead.style.left = `${position}px`;
        
        // Auto-scroll to keep playhead centered during playback
        // Use requestAnimationFrame to ensure DOM has updated before scrolling
        if (this.playhead.classList.contains('active')) {
            requestAnimationFrame(() => {
                // Check again in case playback stopped during the frame
                if (!this.playhead.classList.contains('active')) return;
                
                const scrollContainer = this.scrollContainer;
                const containerWidth = scrollContainer.clientWidth;
                const maxScroll = scrollContainer.scrollWidth - containerWidth;
                
                // Center the playhead in viewport, clamped to valid scroll range
                const centeredScroll = position - (containerWidth / 2);
                const clampedScroll = Math.max(0, Math.min(centeredScroll, maxScroll));
                
                scrollContainer.scrollLeft = clampedScroll;
            });
        }
    }

    /**
     * Show/hide playhead
     * @param {boolean} visible
     */
    setPlayheadVisible(visible) {
        this.playhead.classList.toggle('active', visible);
    }

    /**
     * Change beat count
     * @param {number} count - New beat count
     */
    setBeatCount(count) {
        this.beatCount = count;
        Object.values(this.tracks).forEach(track => track.resize(count));
        this.render();
    }

    /**
     * Get current beat count
     * @returns {number}
     */
    getBeatCount() {
        return this.beatCount;
    }

    /**
     * Get a cell element
     * @param {string} trackType - Track type
     * @param {number} beat - Beat index
     * @returns {HTMLElement|null}
     */
    getCell(trackType, beat) {
        const cells = this.trackElements[trackType].children;
        return cells[beat] || null;
    }

    /**
     * Scroll to ensure a beat is visible
     * @param {number} beat - Beat index
     */
    scrollToBeat(beat) {
        const trackLabelWidth = parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--track-label-width')) || 36;
        const position = trackLabelWidth + (beat * this.cellSize);
        const containerWidth = this.scrollContainer.clientWidth;
        const scrollLeft = this.scrollContainer.scrollLeft;
        
        if (position < scrollLeft + trackLabelWidth) {
            this.scrollContainer.scrollTo({
                left: Math.max(0, position - trackLabelWidth - 20),
                behavior: 'smooth'
            });
        } else if (position > scrollLeft + containerWidth - this.cellSize) {
            this.scrollContainer.scrollTo({
                left: position - containerWidth + this.cellSize + 20,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Serialize all tracks to a compact object
     * @returns {Object}
     */
    serializeTracks() {
        return {
            melody: this.tracks.melody.serialize(),
            bass: this.tracks.bass.serialize(),
            percussion: this.tracks.percussion.serialize()
        };
    }

    /**
     * Deserialize tracks from object
     * @param {Object} data - Serialized track data
     */
    deserializeTracks(data) {
        // Handle v3 format (track1, track2, track3)
        if (data.track1 || data.track2 || data.track3) {
            if (data.track1) this.tracks[1].deserialize(data.track1);
            if (data.track2) this.tracks[2].deserialize(data.track2);
            if (data.track3) this.tracks[3].deserialize(data.track3);
        }
        // Handle v1/v2 format (melody, bass, percussion)
        else {
            if (data.melody) this.tracks[1].deserialize(data.melody);
            if (data.bass) this.tracks[2].deserialize(data.bass);
            if (data.percussion) this.tracks[3].deserialize(data.percussion);
        }
        this.render();
    }
}

window.Timeline = Timeline;
