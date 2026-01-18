/**
 * PatternDrawer.js - Pattern library drawer UI
 * Toggle drawer above piano keyboard for composing and managing patterns
 */

class PatternDrawer {
    constructor(game, patternLibrary) {
        this.game = game;
        this.patternLibrary = patternLibrary;
        
        this.isOpen = false;
        this.currentPatternLength = 4; // Default pattern length
        this.patternTimeline = { 1: [], 2: [], 3: [] }; // Working pattern data
        this.selectedPatternId = null; // Currently selected pattern to edit
        
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
                        <button class="length-selector-btn" data-length="4">4</button>
                        <button class="length-selector-btn active" data-length="8">8</button>
                        <button class="length-selector-btn" data-length="16">16</button>
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
                
                <div class="pattern-timeline-container" id="patternTimelineContainer">
                    <!-- Pattern timeline will be rendered here -->
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
        this.timelineContainer = this.drawerElement.querySelector('#patternTimelineContainer');
        this.clearBtn = this.drawerElement.querySelector('#clearPatternBtn');
        this.saveBtn = this.drawerElement.querySelector('#savePatternBtn');
        this.lengthBtns = this.drawerElement.querySelectorAll('.length-selector-btn');
        this.saveModal = this.drawerElement.querySelector('#patternSaveModal');
        this.modalSlots = this.drawerElement.querySelector('#patternSlots');
        this.modalClose = this.drawerElement.querySelector('.modal-close');

        // Render pattern blocks
        this.renderPatternBlocks();
        
        // Render pattern timeline
        this.renderPatternTimeline();
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

        // Custom pattern slots (0-7)
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
     * Render pattern timeline grid (matching main Timeline rendering)
     */
    renderPatternTimeline() {
        if (!this.timelineContainer) return;

        const numBeats = this.currentPatternLength;
        
        // Track configuration matching main timeline
        const tracks = [
            { id: 1, name: 'melody', icon: '🎹' },
            { id: 2, name: 'bass', icon: '🎹' },
            { id: 3, name: 'percussion', icon: '🥁' }
        ];

        let html = '<div class="pattern-timeline">';
        
        // Beat markers (like main timeline) with downbeat emphasis
        html += '<div class="pattern-beat-markers">';
        for (let beat = 0; beat < numBeats; beat++) {
            const isDownbeat = beat % 4 === 0;
            html += `<div class="pattern-beat-marker ${isDownbeat ? 'downbeat' : ''}">${beat + 1}</div>`;
        }
        html += '</div>';

        // Render tracks with track names matching main timeline
        for (const track of tracks) {
            html += `
                <div class="pattern-track" data-track="${track.name}">
                    <div class="pattern-track-label">${track.icon}</div>
                    <div class="pattern-track-cells" data-track-id="${track.id}">
            `;

            // Render cells for this track
            for (let beat = 0; beat < numBeats; beat++) {
                const isDownbeat = beat % 4 === 0;
                const noteData = this.patternTimeline[track.id].find(n => n[0] === beat);
                
                // Check if cell is covered by extended note
                const coveringNote = this.getCoveringNote(track.id, beat);
                const isCovered = coveringNote && coveringNote[0] !== beat;
                
                html += `
                    <div class="pattern-cell ${noteData ? 'has-note' : ''} ${isDownbeat ? 'downbeat' : ''} ${isCovered ? 'covered-by-note' : ''}" 
                         data-track="${track.id}" 
                         data-beat="${beat}">
                `;
                
                // Render actual note element if present
                if (noteData && !isCovered) {
                    const [beatPos, noteIndex, duration, velocity = 0.8] = noteData;
                    const noteIcon = this.game.getNoteIcon(track.id, noteIndex);
                    
                    html += `
                        <div class="cell-note" 
                             data-duration="${duration}"
                             data-velocity="${velocity}"
                             data-note-index="${noteIndex}"
                             style="width: calc(${duration} * var(--cell-size) - 4px)">
                            ${noteIcon}
                            <div class="velocity-indicator" style="height: ${velocity * 100}%"></div>
                        </div>
                    `;
                }
                
                html += `</div>`;
            }

            html += `
                    </div>
                </div>
            `;
        }

        html += '</div>';
        this.timelineContainer.innerHTML = html;
        
        // Setup note interaction after rendering
        this.setupNoteInteraction();
    }
    
    /**
     * Get note that covers a specific beat (for extended notes)
     */
    getCoveringNote(trackId, beat) {
        const notes = this.patternTimeline[trackId];
        for (const note of notes) {
            const [startBeat, noteIndex, duration] = note;
            if (beat >= startBeat && beat < startBeat + duration) {
                return note;
            }
        }
        return null;
    }
    
    /**
     * Setup interaction for rendered notes (resize, velocity)
     */
    setupNoteInteraction() {
        const noteElements = this.timelineContainer.querySelectorAll('.cell-note');
        
        noteElements.forEach(noteEl => {
            const cell = noteEl.closest('.pattern-cell');
            const trackId = parseInt(cell.dataset.track);
            const beat = parseInt(cell.dataset.beat);
            
            // Setup drag-to-resize
            this.setupNoteDragResize(noteEl, trackId, beat);
            
            // Setup long-press for velocity control
            this.setupNoteVelocityControl(noteEl, trackId, beat);
        });
    }
    
    /**
     * Setup drag-to-resize for a note element
     */
    setupNoteDragResize(noteEl, trackId, beat) {
        let startX = 0;
        let startDuration = 1;
        let isResizing = false;
        
        const onPointerDown = (e) => {
            // Only resize from right edge
            const rect = noteEl.getBoundingClientRect();
            const edgeThreshold = 20;
            
            if (e.clientX > rect.right - edgeThreshold) {
                e.stopPropagation();
                e.preventDefault();
                
                isResizing = true;
                startX = e.clientX;
                startDuration = parseFloat(noteEl.dataset.duration);
                
                noteEl.classList.add('resizing');
                document.body.style.cursor = 'ew-resize';
            }
        };
        
        const onPointerMove = (e) => {
            if (!isResizing) return;
            
            const cellSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size'));
            const deltaX = e.clientX - startX;
            const deltaDuration = Math.round(deltaX / cellSize * 2) / 2; // Snap to 0.5 beat
            
            let newDuration = startDuration + deltaDuration;
            newDuration = Math.max(0.5, Math.min(newDuration, this.currentPatternLength - beat));
            
            noteEl.style.width = `calc(${newDuration} * var(--cell-size) - 4px)`;
            noteEl.dataset.duration = newDuration;
        };
        
        const onPointerUp = () => {
            if (!isResizing) return;
            
            isResizing = false;
            noteEl.classList.remove('resizing');
            document.body.style.cursor = '';
            
            // Update pattern data
            const newDuration = parseFloat(noteEl.dataset.duration);
            this.updateNoteDuration(trackId, beat, newDuration);
        };
        
        noteEl.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    }
    
    /**
     * Setup velocity control for a note element (long press)
     */
    setupNoteVelocityControl(noteEl, trackId, beat) {
        let longPressTimer = null;
        let isAdjustingVelocity = false;
        let startY = 0;
        let startVelocity = 0.8;
        
        const onPointerDown = (e) => {
            // Check if resizing
            const rect = noteEl.getBoundingClientRect();
            if (e.clientX > rect.right - 20) return; // Don't interfere with resize
            
            startY = e.clientY;
            startVelocity = parseFloat(noteEl.dataset.velocity);
            
            longPressTimer = setTimeout(() => {
                isAdjustingVelocity = true;
                noteEl.classList.add('adjusting-velocity');
            }, 500);
        };
        
        const onPointerMove = (e) => {
            if (!isAdjustingVelocity) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const deltaY = startY - e.clientY;
            const velocityChange = deltaY / 100;
            
            let newVelocity = startVelocity + velocityChange;
            newVelocity = Math.max(0.1, Math.min(1, newVelocity));
            
            noteEl.dataset.velocity = newVelocity;
            const velocityBar = noteEl.querySelector('.velocity-indicator');
            if (velocityBar) {
                velocityBar.style.height = `${newVelocity * 100}%`;
            }
        };
        
        const onPointerUp = () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
            }
            
            if (isAdjustingVelocity) {
                isAdjustingVelocity = false;
                noteEl.classList.remove('adjusting-velocity');
                
                // Update pattern data
                const newVelocity = parseFloat(noteEl.dataset.velocity);
                this.updateNoteVelocity(trackId, beat, newVelocity);
            }
        };
        
        noteEl.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    }
    
    /**
     * Update note duration in pattern data
     */
    updateNoteDuration(trackId, beat, duration) {
        const track = this.patternTimeline[trackId];
        const note = track.find(n => n[0] === beat);
        
        if (note) {
            note[2] = duration; // Update duration
            this.renderPatternTimeline();
        }
    }
    
    /**
     * Update note velocity in pattern data
     */
    updateNoteVelocity(trackId, beat, velocity) {
        const track = this.patternTimeline[trackId];
        const note = track.find(n => n[0] === beat);
        
        if (note) {
            note[3] = velocity; // Update velocity
            // No re-render needed, just visual update
        }
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
        
        // Pattern blocks drag (delegated event)
        this.blocksScroll?.addEventListener('pointerdown', (e) => {
            const block = e.target.closest('.pattern-block');
            if (!block || block.classList.contains('new-pattern') || block.classList.contains('empty')) return;
            
            const patternId = block.dataset.patternId;
            if (!patternId) return;
            
            this.startPatternDrag(block, patternId, e);
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

        // Pattern timeline cells - click to toggle/remove notes
        this.timelineContainer?.addEventListener('click', (e) => {
            // Don't handle clicks on note elements (they have their own interaction)
            if (e.target.closest('.cell-note')) return;
            
            const cell = e.target.closest('.pattern-cell');
            if (!cell) return;

            const trackId = parseInt(cell.dataset.track);
            const beat = parseInt(cell.dataset.beat);
            
            // If cell is covered by extended note, remove the parent note
            if (cell.classList.contains('covered-by-note')) {
                const coveringNote = this.getCoveringNote(trackId, beat);
                if (coveringNote) {
                    this.removeNote(trackId, coveringNote[0]);
                }
            } else {
                // Toggle note at this position
                this.toggleNote(trackId, beat);
            }
        });
        
        // Pattern timeline cells - drag and drop support
        this.setupPatternTimelineDragDrop();
    }
    
    /**
     * Setup drag-and-drop for pattern timeline cells
     */
    setupPatternTimelineDragDrop() {
        if (!this.timelineContainer) return;
        
        // Use event delegation for drag events
        this.timelineContainer.addEventListener('dragover', (e) => {
            const cell = e.target.closest('.pattern-cell');
            if (!cell) return;
            
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            
            // Visual feedback
            cell.classList.add('drag-over');
        });
        
        this.timelineContainer.addEventListener('dragleave', (e) => {
            const cell = e.target.closest('.pattern-cell');
            if (!cell) return;
            
            cell.classList.remove('drag-over');
        });
        
        this.timelineContainer.addEventListener('drop', (e) => {
            const cell = e.target.closest('.pattern-cell');
            if (!cell) return;
            
            e.preventDefault();
            cell.classList.remove('drag-over');
            
            // Get drop data
            const trackId = parseInt(cell.dataset.track);
            const beat = parseInt(cell.dataset.beat);
            
            // Try to get note data from drag event
            let noteIndex = null;
            let duration = 0.5;
            
            try {
                const dragData = e.dataTransfer.getData('application/json');
                if (dragData) {
                    const data = JSON.parse(dragData);
                    noteIndex = data.noteIndex !== undefined ? data.noteIndex : null;
                    duration = data.duration || 0.5;
                }
            } catch (err) {
                // Fallback: try text format
                try {
                    const text = e.dataTransfer.getData('text/plain');
                    if (text) {
                        const match = text.match(/note:(\d+)/);
                        if (match) {
                            noteIndex = parseInt(match[1]);
                        }
                    }
                } catch (err2) {
                    console.warn('Could not parse drag data');
                }
            }
            
            // If no note index from drag data, use default
            if (noteIndex === null) {
                noteIndex = trackId === 3 ? 0 : 6; // Percussion: kick, Piano: middle note
            }
            
            // Add note to pattern timeline
            this.addNoteToPattern(trackId, beat, noteIndex, duration);
        });
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

        // Clear notes beyond new length
        for (const trackId in this.patternTimeline) {
            this.patternTimeline[trackId] = this.patternTimeline[trackId].filter(n => n[0] < length);
        }

        // Re-render timeline
        this.renderPatternTimeline();
    }

    /**
     * Toggle note in pattern timeline (for click interaction)
     */
    toggleNote(trackId, beat) {
        const track = this.patternTimeline[trackId];
        const existingIndex = track.findIndex(n => n[0] === beat);

        if (existingIndex >= 0) {
            // Remove note
            track.splice(existingIndex, 1);
        } else {
            // Add note with default values
            const noteIndex = trackId === 3 ? 0 : 6; // Percussion: kick, Piano: middle note
            track.push([beat, noteIndex, 0.5]);
        }

        this.renderPatternTimeline();
    }
    
    /**
     * Remove note at specific beat
     */
    removeNote(trackId, beat) {
        const track = this.patternTimeline[trackId];
        const index = track.findIndex(n => n[0] === beat);
        
        if (index >= 0) {
            track.splice(index, 1);
            this.renderPatternTimeline();
        }
    }
    
    /**
     * Add note to pattern timeline (for drag-drop interaction)
     */
    addNoteToPattern(trackId, beat, noteIndex, duration) {
        const track = this.patternTimeline[trackId];
        const existingIndex = track.findIndex(n => n[0] === beat);
        
        if (existingIndex >= 0) {
            // Replace existing note
            track[existingIndex] = [beat, noteIndex, duration];
        } else {
            // Add new note
            track.push([beat, noteIndex, duration]);
        }
        
        this.renderPatternTimeline();
    }

    /**
     * Clear pattern timeline
     */
    clearPattern() {
        this.patternTimeline = { 1: [], 2: [], 3: [] };
        this.selectedPatternId = null;
        this.renderPatternTimeline();
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

        // Load pattern data
        this.selectedPatternId = patternId;
        this.currentPatternLength = pattern.length;
        
        // Deep copy pattern tracks
        this.patternTimeline = {};
        for (const trackId in pattern.tracks) {
            this.patternTimeline[trackId] = pattern.tracks[trackId].map(n => [...n]);
        }

        // Update UI
        this.lengthBtns.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.length) === pattern.length);
        });
        
        this.renderPatternTimeline();
        
        // Highlight selected block
        this.blocksScroll.querySelectorAll('.pattern-block').forEach(b => {
            b.classList.toggle('selected', b.dataset.patternId === patternId);
        });
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

        const patternData = {
            index: index,
            name: `Pattern ${index + 1}`,
            icon: customIcons[index],
            color: customColors[index],
            length: this.currentPatternLength,
            tracks: this.patternTimeline
        };

        // Check if slot already has a pattern
        const existingPatterns = this.patternLibrary.getUserPatterns();
        const existing = existingPatterns.find(p => p.index === index);

        if (existing) {
            // Update existing pattern
            this.patternLibrary.updatePattern(existing.id, patternData);
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
        // TODO: Implement proper feedback UI
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
    startPatternDrag(block, patternId, startEvent) {
        const pattern = this.patternLibrary.getPattern(patternId);
        if (!pattern) return;
        
        let hasMoved = false;
        const dragThreshold = 15;
        const startX = startEvent.clientX;
        const startY = startEvent.clientY;
        
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
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            if (!hasMoved && (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold)) {
                hasMoved = true;
                ghost.style.display = 'flex';
            }
            
            if (hasMoved) {
                ghost.style.left = `${e.clientX - 32}px`;
                ghost.style.top = `${e.clientY - 32}px`;
            }
        };
        
        const onEnd = (e) => {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onEnd);
            
            if (hasMoved) {
                // Check if dropped on timeline
                const timelineEl = document.querySelector('.timeline');
                if (timelineEl) {
                    const timelineRect = timelineEl.getBoundingClientRect();
                    if (e.clientX >= timelineRect.left && e.clientX <= timelineRect.right &&
                        e.clientY >= timelineRect.top && e.clientY <= timelineRect.bottom) {
                        
                        // Calculate beat position
                        const cellWidth = 50; // Match timeline cell width
                        const relativeX = e.clientX - timelineRect.left;
                        const beat = Math.floor(relativeX / cellWidth);
                        
                        // Place pattern
                        if (beat >= 0) {
                            this.game.placePattern(patternId, beat);
                        }
                    }
                }
            }
            
            // Clean up ghost
            document.body.removeChild(ghost);
        };
        
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onEnd);
        
        startEvent.preventDefault();
    }
}
