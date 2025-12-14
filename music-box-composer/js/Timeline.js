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
            melody: options.cellsMelody,
            bass: options.cellsBass,
            percussion: options.cellsPercussion
        };
        
        this.tracks = {
            melody: new Track('melody'),
            bass: new Track('bass'),
            percussion: new Track('percussion')
        };
        
        this.beatCount = 16;
        this.cellSize = 44; // Will be updated from CSS
        
        this.onCellClick = options.onCellClick || (() => {});
        this.onCellDrop = options.onCellDrop || (() => {});
        
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
        this.renderTrack('melody');
        this.renderTrack('bass');
        this.renderTrack('percussion');
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
     * @param {string} trackType - 'melody', 'bass', or 'percussion'
     */
    renderTrack(trackType) {
        const container = this.trackElements[trackType];
        const track = this.tracks[trackType];
        
        container.innerHTML = '';
        
        for (let i = 0; i < this.beatCount; i++) {
            const cell = document.createElement('div');
            cell.className = 'track-cell';
            cell.dataset.beat = i;
            cell.dataset.track = trackType;
            
            // Mark downbeats
            if (i % 4 === 0) {
                cell.classList.add('downbeat');
            }
            
            // Add note if present
            const note = track.getNote(i);
            if (note) {
                cell.classList.add('has-note');
                const noteEl = document.createElement('span');
                noteEl.className = 'cell-note';
                noteEl.textContent = note.icon;
                cell.appendChild(noteEl);
            }
            
            // Click to remove note
            cell.addEventListener('click', () => {
                if (track.hasNote(i)) {
                    this.onCellClick(trackType, i, null);
                }
            });
            
            container.appendChild(cell);
        }
    }

    /**
     * Set a note on a track
     * @param {string} trackType - Track type
     * @param {number} beat - Beat index
     * @param {string} note - Note value
     * @param {string} icon - Note icon
     */
    setNote(trackType, beat, note, icon) {
        this.tracks[trackType].setNote(beat, note, icon);
        this.renderTrack(trackType);
    }

    /**
     * Clear a note from a track
     * @param {string} trackType - Track type
     * @param {number} beat - Beat index
     */
    clearNote(trackType, beat) {
        this.tracks[trackType].clearNote(beat);
        this.renderTrack(trackType);
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
     * @param {number} beat - Beat index
     * @returns {Object} - { melody: note|null, bass: note|null, percussion: note|null }
     */
    getNotesAtBeat(beat) {
        return {
            melody: this.tracks.melody.getNote(beat),
            bass: this.tracks.bass.getNote(beat),
            percussion: this.tracks.percussion.getNote(beat)
        };
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
            Object.keys(this.trackElements).forEach(trackType => {
                const cells = this.trackElements[trackType].children;
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
}

window.Timeline = Timeline;
