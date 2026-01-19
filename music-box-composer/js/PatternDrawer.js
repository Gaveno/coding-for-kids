/**
 * PatternDrawer.js - Pattern library drawer UI
 * Toggle drawer above piano keyboard for composing and managing patterns
 * Uses a real Timeline instance for proper note editing (shared code with main timeline)
 */

class PatternDrawer {
    constructor(game, patternLibrary) {
        this.game = game;
        this.patternLibrary = patternLibrary;
        
        this.isOpen = false;
        this.currentPatternLength = 4; // Default pattern length
        this.selectedPatternId = null; // Currently selected pattern to edit
        
        // Playback state
        this.isPlaying = false;
        this.isLooping = false;
        this.currentBeat = 0;
        this.playbackTimer = null;
        
        // Will hold the Timeline instance for pattern editing
        this.timeline = null;
        
        this.initializeUI();
        this.attachEventListeners();
    }

    /**
     * Initialize drawer UI elements
     */
    initializeUI() {
        // Create toggle button next to piano keyboard
        const pianoWrapper = document.querySelector('.piano-keyboard-wrapper');
        if (!pianoWrapper) {
            console.error('Piano keyboard wrapper not found');
            return;
        }

        this.toggleBtn = document.createElement('button');
        this.toggleBtn.className = 'pattern-drawer-toggle';
        this.toggleBtn.setAttribute('aria-label', 'Toggle Pattern Drawer');
        this.toggleBtn.setAttribute('title', 'Pattern Library');
        this.toggleBtn.innerHTML = '🎼';
        
        // Insert toggle button before piano keyboard container
        pianoWrapper.insertBefore(this.toggleBtn, pianoWrapper.firstChild);

        // Create drawer container
        this.drawerElement = document.createElement('div');
        this.drawerElement.className = 'pattern-drawer';
        this.drawerElement.setAttribute('aria-label', 'Pattern Library Drawer');
        
        // Insert drawer before piano wrapper (so it appears above)
        pianoWrapper.parentNode.insertBefore(this.drawerElement, pianoWrapper);

        // Build drawer contents
        this.buildDrawerContents();
    }

    /**
     * Build drawer contents: pattern blocks, timeline, controls
     */
    buildDrawerContents() {
        this.drawerElement.innerHTML = `
            <div class="pattern-blocks-bar" aria-label="Pattern Blocks">
                <div class="pattern-blocks-scroll" id="patternBlocksScroll"></div>
            </div>
            
            <div class="pattern-editor" aria-label="Pattern Editor">
                <div class="pattern-editor-header">
                    <div class="pattern-length-selector">
                        <button class="length-selector-btn active" data-length="4">4</button>
                        <button class="length-selector-btn" data-length="8">8</button>
                        <button class="length-selector-btn" data-length="16">16</button>
                    </div>
                    <div class="pattern-playback-controls">
                        <button class="pattern-control-btn" id="patternPlayBtn" aria-label="Play Pattern">
                            ▶️
                        </button>
                        <button class="pattern-control-btn" id="patternLoopBtn" aria-label="Loop Pattern">
                            🔁
                        </button>
                    </div>
                    <div class="pattern-editor-actions">
                        <button class="pattern-action-btn" id="clearPatternBtn" aria-label="Clear Pattern">
                            🗑️ Clear
                        </button>
                        <button class="pattern-action-btn primary" id="savePatternBtn" aria-label="Save Pattern">
                            💾 Save
                        </button>
                    </div>
                </div>
                
                <!-- Real Timeline structure (reuses Timeline.js) -->
                <div class="pattern-timeline-wrapper">
                    <div class="timeline-scroll pattern-timeline-scroll" id="patternTimelineScroll">
                        <div class="timeline pattern-mini-timeline" id="patternMiniTimeline">
                            <div class="playhead" id="patternPlayhead"></div>
                            <div class="beat-markers" id="patternBeatMarkers"></div>
                            <div class="track" data-track="1">
                                <div class="track-label">🎹</div>
                                <div class="track-cells" id="patternCells1"></div>
                            </div>
                            <div class="track" data-track="2">
                                <div class="track-label">🎹</div>
                                <div class="track-cells" id="patternCells2"></div>
                            </div>
                            <div class="track" data-track="3">
                                <div class="track-label">🥁</div>
                                <div class="track-cells" id="patternCells3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Save Modal -->
            <div class="pattern-save-modal" id="patternSaveModal">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>💾 Save Pattern</h3>
                        <button class="modal-close" aria-label="Close">✕</button>
                    </div>
                    <div class="modal-body">
                        <p class="modal-instruction">Choose a slot to save your pattern:</p>
                        <div class="pattern-slots" id="patternSlots">
                            <!-- Slots will be rendered here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Get references to key elements
        this.blocksScroll = this.drawerElement.querySelector('#patternBlocksScroll');
        this.clearBtn = this.drawerElement.querySelector('#clearPatternBtn');
        this.saveBtn = this.drawerElement.querySelector('#savePatternBtn');
        this.lengthBtns = this.drawerElement.querySelectorAll('.length-selector-btn');
        this.playBtn = this.drawerElement.querySelector('#patternPlayBtn');
        this.loopBtn = this.drawerElement.querySelector('#patternLoopBtn');
        this.saveModal = this.drawerElement.querySelector('#patternSaveModal');
        this.modalSlots = this.drawerElement.querySelector('#patternSlots');
        this.modalClose = this.drawerElement.querySelector('.modal-close');

        // Create a real Timeline instance for the pattern editor
        this.timeline = new Timeline({
            container: this.drawerElement.querySelector('#patternMiniTimeline'),
            scrollContainer: this.drawerElement.querySelector('#patternTimelineScroll'),
            beatMarkers: this.drawerElement.querySelector('#patternBeatMarkers'),
            playhead: this.drawerElement.querySelector('#patternPlayhead'),
            cells1: this.drawerElement.querySelector('#patternCells1'),
            cells2: this.drawerElement.querySelector('#patternCells2'),
            cells3: this.drawerElement.querySelector('#patternCells3'),
            onCellClick: (trackNum, beat) => this.handlePatternCellClick(trackNum, beat),
            onNoteChange: () => {}, // No URL updates for pattern
            onBeatClick: () => {} // No seek for pattern
        });
        
        // Set initial beat count
        this.timeline.setBeatCount(this.currentPatternLength);

        // Render pattern blocks
        this.renderPatternBlocks();
    }
    
    /**
     * Handle cell click in pattern timeline (remove note - same as main timeline)
     */
    handlePatternCellClick(trackNum, beat) {
        // Same behavior as main timeline - clicking removes the note
        const track = this.timeline.tracks[trackNum];
        if (track.hasNote(beat)) {
            track.clearNote(beat);
            this.timeline.renderTrack(trackNum);
        }
    }

    /**
     * Render pattern blocks (presets + custom patterns)
     */
    renderPatternBlocks() {
        if (!this.blocksScroll) return;

        const presets = this.patternLibrary.getPresets(this.game.currentMode);
        const customPatterns = this.patternLibrary.getUserPatterns();

        let html = '';

        // Preset patterns
        presets.forEach(pattern => {
            html += `
                <button class="pattern-block preset" 
                        data-pattern-id="${pattern.id}"
                        style="background-color: ${pattern.color}"
                        aria-label="${pattern.name}">
                    <span class="pattern-icon">${pattern.icon}</span>
                    <span class="pattern-length">${pattern.length}</span>
                </button>
            `;
        });

        // Custom pattern slots (8 max)
        const customIcons = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];
        const customColors = ['#4ECDC4', '#FFD93D', '#E63946', '#A8DADC', '#6A4C93', '#FF6B6B', '#95E1D3', '#F38181'];
        
        for (let i = 0; i < 8; i++) {
            const customPattern = customPatterns.find(p => p.index === i);
            const isEmpty = !customPattern;
            
            html += `
                <button class="pattern-block custom ${isEmpty ? 'empty' : ''}" 
                        data-custom-index="${i}"
                        ${customPattern ? `data-pattern-id="${customPattern.id}"` : ''}
                        style="background-color: ${customColors[i]}"
                        aria-label="Custom Pattern ${i + 1}">
                    <span class="pattern-icon">${customIcons[i]}</span>
                    ${customPattern ? `<span class="pattern-length">${customPattern.length}</span>` : ''}
                </button>
            `;
        }

        // Add new pattern button
        html += `
            <button class="pattern-block new-pattern" 
                    id="newPatternBtn"
                    aria-label="New Pattern">
                <span class="pattern-icon">➕</span>
            </button>
        `;

        this.blocksScroll.innerHTML = html;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Toggle button
        this.toggleBtn?.addEventListener('click', () => this.toggle());

        // Pattern blocks (delegated event)
        this.blocksScroll?.addEventListener('click', (e) => {
            const block = e.target.closest('.pattern-block');
            if (!block) return;

            if (block.classList.contains('new-pattern')) {
                this.newPattern();
            } else {
                this.loadPattern(block);
            }
        });
        
        // Pattern blocks drag - touchstart for mobile
        this.blocksScroll?.addEventListener('touchstart', (e) => {
            const block = e.target.closest('.pattern-block');
            if (!block || block.classList.contains('new-pattern') || block.classList.contains('empty')) return;
            
            const patternId = block.dataset.patternId;
            if (!patternId) return;
            
            const touch = e.touches[0];
            this.startPatternDrag(block, patternId, touch, true);
        }, { passive: true });

        // Pattern blocks drag - mousedown for desktop
        this.blocksScroll?.addEventListener('mousedown', (e) => {
            const block = e.target.closest('.pattern-block');
            if (!block || block.classList.contains('new-pattern') || block.classList.contains('empty')) return;
            
            const patternId = block.dataset.patternId;
            if (!patternId) return;
            
            this.startPatternDrag(block, patternId, e, false);
        });

        // Length selector buttons
        this.lengthBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                const length = parseInt(btn.dataset.length);
                this.setPatternLength(length);
            });
        });

        // Clear button
        this.clearBtn?.addEventListener('click', () => this.clearPattern());

        // Save button
        this.saveBtn?.addEventListener('click', () => this.showSaveModal());
        
        // Play button
        this.playBtn?.addEventListener('click', () => this.togglePlay());
        
        // Loop button
        this.loopBtn?.addEventListener('click', () => this.toggleLoop());

        // Modal close button
        this.modalClose?.addEventListener('click', () => this.closeSaveModal());
        
        // Modal overlay click to close
        this.saveModal?.querySelector('.modal-overlay')?.addEventListener('click', () => this.closeSaveModal());
        
        // Modal slots (delegated event)
        this.modalSlots?.addEventListener('click', (e) => {
            const slot = e.target.closest('.pattern-slot');
            if (!slot) return;
            
            const index = parseInt(slot.dataset.index);
            this.handleSlotSelection(index);
        });
        
        // Listen for drops on pattern timeline (from DragDrop.js)
        window.addEventListener('patternTimelineDrop', (e) => {
            const { trackNum, beat, noteData } = e.detail;
            this.handleNoteDrop(trackNum, beat, noteData);
        });
    }
    
    /**
     * Handle note dropped on pattern timeline
     */
    handleNoteDrop(trackNum, beat, noteData) {
        if (!this.timeline) return;
        
        const track = this.timeline.tracks[trackNum];
        if (!track) return;
        
        // Add the note to the pattern timeline
        track.setNote(beat, noteData);
        this.timeline.renderTrack(trackNum);
    }

    /**
     * Toggle drawer open/closed
     */
    toggle() {
        this.isOpen = !this.isOpen;
        this.drawerElement.classList.toggle('open', this.isOpen);
        this.toggleBtn.classList.toggle('active', this.isOpen);
        this.toggleBtn.setAttribute('aria-expanded', this.isOpen);
    }

    /**
     * Set pattern length
     */
    setPatternLength(length) {
        this.currentPatternLength = length;
        
        // Update active button
        this.lengthBtns.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.length) === length);
        });

        // Update timeline beat count (this clears notes beyond new length)
        this.timeline.setBeatCount(length);
    }

    /**
     * Clear pattern timeline
     */
    clearPattern() {
        // Clear all tracks in the timeline
        for (let trackNum = 1; trackNum <= 3; trackNum++) {
            this.timeline.tracks[trackNum].clear();
        }
        this.selectedPatternId = null;
        this.timeline.render();
        this.renderPatternBlocks(); // Update selected state
    }

    /**
     * Start new pattern
     */
    newPattern() {
        this.clearPattern();
    }

    /**
     * Load pattern into timeline for editing
     */
    loadPattern(blockElement) {
        const patternId = blockElement.dataset.patternId;
        if (!patternId) return; // Empty custom slot

        const pattern = this.patternLibrary.getPattern(patternId);
        if (!pattern) return;

        // Set pattern length
        this.selectedPatternId = patternId;
        this.currentPatternLength = pattern.length;
        
        // Update length buttons
        this.lengthBtns.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.length) === pattern.length);
        });
        
        // Clear timeline and set beat count
        this.clearPattern();
        this.timeline.setBeatCount(pattern.length);
        
        // Load pattern notes into timeline tracks
        for (const trackId in pattern.tracks) {
            const trackNum = parseInt(trackId);
            const track = this.timeline.tracks[trackNum];
            
            pattern.tracks[trackId].forEach(noteArr => {
                const [beat, noteIndex, duration = 1, velocity = 0.8] = noteArr;
                const icon = this.getDefaultIcon(trackNum, noteIndex);
                const noteName = this.getNoteNameFromIndex(noteIndex, trackNum);
                
                track.setNote(beat, {
                    note: noteName,
                    icon: icon,
                    duration: duration,
                    octave: null,
                    velocity: velocity
                });
            });
        }
        
        this.timeline.render();
        
        // Highlight selected block
        this.blocksScroll.querySelectorAll('.pattern-block').forEach(b => {
            b.classList.toggle('selected', b.dataset.patternId === patternId);
        });
    }
    
    /**
     * Get note name from index
     */
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
     * Get default icon for note
     */
    getDefaultIcon(trackId, noteIndex) {
        if (trackId === 3) {
            const percIcons = ['🥁', '🪘', '🔔', '👏', '🎵', '💥', '🎶', '🔊'];
            return percIcons[noteIndex] || '🥁';
        } else {
            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            return noteNames[noteIndex] || 'C';
        }
    }
    
    /**
     * Extract pattern data from timeline for saving
     */
    extractPatternData() {
        const tracks = {};
        
        for (let trackNum = 1; trackNum <= 3; trackNum++) {
            const track = this.timeline.tracks[trackNum];
            const notes = [];
            
            for (let beat = 0; beat < this.currentPatternLength; beat++) {
                const note = track.getNote(beat);
                if (note) {
                    // Convert to pattern format: [beat, noteIndex, duration, velocity]
                    const noteIndex = this.getNoteIndexFromName(note.note, trackNum);
                    notes.push([beat, noteIndex, note.duration || 1, note.velocity || 0.8]);
                }
            }
            
            tracks[trackNum] = notes;
        }
        
        return tracks;
    }
    
    /**
     * Convert note name to index
     */
    getNoteIndexFromName(noteName, trackId) {
        if (trackId === 3) {
            const percNames = ['kick', 'snare', 'hihat', 'clap', 'tom', 'cymbal', 'shaker', 'cowbell'];
            const idx = percNames.indexOf(noteName);
            return idx >= 0 ? idx : 0;
        } else {
            const noteMap = {
                'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
                'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
            };
            return noteMap[noteName] !== undefined ? noteMap[noteName] : 0;
        }
    }

    /**
     * Show save modal to select slot
     */
    showSaveModal() {
        if (!this.saveModal || !this.modalSlots) return;
        
        // Render slots
        this.renderModalSlots();
        
        // Show modal
        this.saveModal.classList.add('active');
    }
    
    /**
     * Close save modal
     */
    closeSaveModal() {
        if (!this.saveModal) return;
        this.saveModal.classList.remove('active');
    }
    
    /**
     * Render slots in save modal
     */
    renderModalSlots() {
        if (!this.modalSlots) return;
        
        const customPatterns = this.patternLibrary.getUserPatterns();
        const customIcons = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];
        const customColors = ['#4ECDC4', '#FFD93D', '#E63946', '#A8DADC', '#6A4C93', '#FF6B6B', '#95E1D3', '#F38181'];
        
        let html = '';
        
        for (let i = 0; i < 8; i++) {
            const pattern = customPatterns.find(p => p.index === i);
            const icon = customIcons[i];
            const color = customColors[i];
            
            if (pattern) {
                // Occupied slot - show preview
                const noteCount = Object.values(pattern.tracks).reduce((sum, notes) => sum + notes.length, 0);
                html += `
                    <button class="pattern-slot occupied" 
                            data-index="${i}"
                            style="background-color: ${color}"
                            aria-label="Slot ${i + 1} - ${noteCount} notes">
                        <div class="slot-icon">${icon}</div>
                        <div class="slot-info">
                            <div class="slot-length">${pattern.length} beats</div>
                            <div class="slot-notes">${noteCount} notes</div>
                        </div>
                        <div class="slot-status">Overwrite</div>
                    </button>
                `;
            } else {
                // Empty slot
                html += `
                    <button class="pattern-slot empty" 
                            data-index="${i}"
                            style="border-color: ${color}"
                            aria-label="Slot ${i + 1} - Empty">
                        <div class="slot-icon">${icon}</div>
                        <div class="slot-info">
                            <div class="slot-status">Empty</div>
                        </div>
                    </button>
                `;
            }
        }
        
        this.modalSlots.innerHTML = html;
    }
    
    /**
     * Handle slot selection
     */
    handleSlotSelection(index) {
        const customPatterns = this.patternLibrary.getUserPatterns();
        const existing = customPatterns.find(p => p.index === index);
        
        if (existing) {
            // Confirm overwrite
            if (!confirm(`Overwrite Pattern ${index + 1}?\n\nThis will replace the existing pattern with your current pattern.`)) {
                return;
            }
        }
        
        // Save to slot
        this.savePatternToSlot(index);
        
        // Close modal
        this.closeSaveModal();
    }

    /**
     * Save current pattern to a slot
     */
    savePatternToSlot(index) {
        const customIcons = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];
        const customColors = ['#4ECDC4', '#FFD93D', '#E63946', '#A8DADC', '#6A4C93', '#FF6B6B', '#95E1D3', '#F38181'];

        // Extract pattern data from timeline
        const tracks = this.extractPatternData();
        
        const patternData = {
            index: index,
            name: `Pattern ${index + 1}`,
            icon: customIcons[index],
            color: customColors[index],
            length: this.currentPatternLength,
            tracks: tracks
        };

        // Check if slot already has a pattern
        const existingPatterns = this.patternLibrary.getUserPatterns();
        const existing = existingPatterns.find(p => p.index === index);

        if (existing) {
            // Update existing pattern
            this.patternLibrary.updatePattern(existing.id, patternData);
            // Refresh all placements of this pattern on the timeline
            this.game.refreshPatternPlacements(existing.id);
        } else {
            // Add new pattern
            this.patternLibrary.addPattern(patternData);
        }

        // Refresh UI
        this.renderPatternBlocks();
        
        // Show feedback
        this.showFeedback(`Pattern ${index + 1} saved!`);
    }

    /**
     * Show temporary feedback message
     */
    showFeedback(message) {
        console.log(message);
    }

    /**
     * Update drawer for mode change
     */
    updateForMode(mode) {
        this.renderPatternBlocks();
    }
    
    /**
     * Start dragging a pattern block
     */
    startPatternDrag(block, patternId, startEvent, isTouch) {
        const pattern = this.patternLibrary.getPattern(patternId);
        if (!pattern) return;
        
        let hasMoved = false;
        const dragThreshold = 15;
        const startX = isTouch ? startEvent.clientX : startEvent.clientX;
        const startY = isTouch ? startEvent.clientY : startEvent.clientY;
        
        // Create drag ghost
        const ghost = document.createElement('div');
        ghost.className = 'pattern-drag-ghost';
        ghost.style.backgroundColor = pattern.color;
        ghost.innerHTML = `
            <span class="pattern-icon">${pattern.icon}</span>
            <span class="pattern-length-badge">${pattern.length}</span>
        `;
        ghost.style.position = 'fixed';
        ghost.style.pointerEvents = 'none';
        ghost.style.display = 'none';
        ghost.style.zIndex = '10000';
        document.body.appendChild(ghost);
        
        const onMove = (e) => {
            const clientX = isTouch ? e.touches[0].clientX : e.clientX;
            const clientY = isTouch ? e.touches[0].clientY : e.clientY;
            
            const dx = clientX - startX;
            const dy = clientY - startY;
            
            if (!hasMoved && (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold)) {
                hasMoved = true;
                ghost.style.display = 'flex';
                if (isTouch) e.preventDefault(); // Prevent scrolling once drag starts
            }
            
            if (hasMoved) {
                if (isTouch) e.preventDefault(); // Prevent scrolling during drag
                ghost.style.left = `${clientX - 32}px`;
                ghost.style.top = `${clientY - 32}px`;
            }
        };
        
        const onEnd = (e) => {
            if (isTouch) {
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onEnd);
            } else {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onEnd);
            }
            
            if (hasMoved) {
                const clientX = isTouch ? e.changedTouches[0].clientX : e.clientX;
                const clientY = isTouch ? e.changedTouches[0].clientY : e.clientY;
                
                // Check if dropped on timeline
                const timelineEl = document.querySelector('.timeline');
                if (timelineEl) {
                    const timelineRect = timelineEl.getBoundingClientRect();
                    if (clientX >= timelineRect.left && clientX <= timelineRect.right &&
                        clientY >= timelineRect.top && clientY <= timelineRect.bottom) {
                        
                        // Calculate beat position using CSS variables
                        const style = getComputedStyle(document.documentElement);
                        const cellSize = parseInt(style.getPropertyValue('--cell-size')) || 44;
                        const trackLabelWidth = parseInt(style.getPropertyValue('--track-label-width')) || 36;
                        
                        const relativeX = clientX - timelineRect.left - trackLabelWidth;
                        const beat = Math.floor(relativeX / cellSize);
                        
                        // Place pattern
                        if (beat >= 0) {
                            this.game.placePattern(patternId, beat);
                        }
                    }
                }
                
                if (isTouch) e.preventDefault();
            }
            
            // Clean up ghost
            document.body.removeChild(ghost);
        };
        
        if (isTouch) {
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onEnd, { passive: false });
        } else {
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onEnd);
        }
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
        this.isPlaying = true;
        this.currentBeat = 0;
        this.playBtn.classList.add('playing');
        this.playBtn.textContent = '⏸️';
        
        this.timeline.setPlayheadVisible(true);
        this.startPlayback();
    }
    
    /**
     * Pause playback
     */
    pause() {
        this.isPlaying = false;
        this.playBtn.classList.remove('playing');
        this.playBtn.textContent = '▶️';
        
        if (this.playbackTimer) {
            cancelAnimationFrame(this.playbackTimer);
            this.playbackTimer = null;
        }
        
        this.timeline.setPlayheadVisible(false);
        this.timeline.highlightBeat(-1);
    }
    
    /**
     * Start the playback loop (similar to Game.js)
     */
    startPlayback() {
        const beatDuration = this.game.getBeatDuration();
        let lastBeatTime = performance.now();
        let displayBeat = this.currentBeat;
        
        // Play first beat immediately
        this.playBeat(this.currentBeat);
        this.timeline.highlightBeat(this.currentBeat);
        this.currentBeat++;
        
        // Check if only one beat
        if (this.currentBeat >= this.currentPatternLength) {
            if (this.isLooping) {
                this.currentBeat = 0;
            } else {
                this.pause();
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
                if (this.currentBeat >= this.currentPatternLength) {
                    if (this.isLooping) {
                        this.currentBeat = 0;
                    } else {
                        this.pause();
                        return;
                    }
                }
            }
            
            this.playbackTimer = requestAnimationFrame(tick);
        };
        
        this.playbackTimer = requestAnimationFrame(tick);
    }
    
    /**
     * Play sounds for a beat (similar to Game.js)
     */
    playBeat(beat) {
        const beatDurationMs = this.game.getBeatDuration();
        const beatDurationSec = beatDurationMs / 1000;
        
        // Play notes for each track
        for (let trackNum = 1; trackNum <= 3; trackNum++) {
            const track = this.timeline.tracks[trackNum];
            const note = track.getNote(beat);
            
            if (note) {
                const noteDuration = (note.duration || 1) * beatDurationSec;
                const velocity = note.velocity || 0.8;
                const octave = note.octave || 4;
                
                if (trackNum === 3) {
                    // Percussion doesn't use duration or octave
                    this.game.audio.playNote(note.note, trackNum, undefined, velocity);
                } else {
                    // Piano tracks
                    this.game.audio.playNote(note.note, trackNum, noteDuration, velocity, octave);
                }
            }
        }
    }
    
    /**
     * Toggle loop mode
     */
    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.loopBtn.classList.toggle('active', this.isLooping);
    }
}
