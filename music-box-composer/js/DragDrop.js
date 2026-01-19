/**
 * DragDrop.js - Handles dragging notes from palette to timeline
 */
class DragDrop {
    constructor(options) {
        this.palette = options.palette;
        this.pianoKeyboard = options.pianoKeyboard;
        this.timeline = options.timeline;
        this.onPreview = options.onPreview || (() => {});
        this.onDrop = options.onDrop || (() => {});
        
        this.dragState = null;
        this.dragGhost = null;
        this.dragThreshold = 10;
        
        this.init();
    }

    /**
     * Initialize drag and drop
     */
    init() {
        this.setupPaletteButtons();
        this.setupPianoKeyboard();
        this.setupGlobalListeners();
    }

    /**
     * Setup piano keyboard drag interactions
     */
    setupPianoKeyboard() {
        if (!this.pianoKeyboard || !this.pianoKeyboard.container) return;
        
        const keys = this.pianoKeyboard.container.querySelectorAll('.piano-key');
        
        keys.forEach(key => {
            let startPos = null;
            let isDragging = false;
            
            // Touch events
            key.addEventListener('touchstart', (e) => {
                if (key.classList.contains('disabled')) {
                    e.preventDefault();
                    return;
                }
                const touch = e.touches[0];
                startPos = { x: touch.clientX, y: touch.clientY };
                isDragging = false;
            }, { passive: true });
            
            key.addEventListener('touchmove', (e) => {
                if (!startPos || key.classList.contains('disabled')) return;
                
                const touch = e.touches[0];
                const dx = Math.abs(touch.clientX - startPos.x);
                const dy = Math.abs(touch.clientY - startPos.y);
                
                if (!isDragging && (dx > this.dragThreshold || dy > this.dragThreshold)) {
                    isDragging = true;
                    e.preventDefault();
                    this.startPianoDrag(touch, key);
                }
                
                if (isDragging && this.dragState) {
                    e.preventDefault();
                    this.handleDragMove(touch);
                }
            }, { passive: false });
            
            key.addEventListener('touchend', (e) => {
                if (isDragging && this.dragState) {
                    e.preventDefault();
                    this.handleDrop();
                } else if (!isDragging && startPos) {
                    // It was a tap - preview the sound
                    this.previewPianoKey(key);
                }
                startPos = null;
                isDragging = false;
            }, { passive: false });
            
            // Mouse events
            key.addEventListener('mousedown', (e) => {
                if (key.classList.contains('disabled')) {
                    e.preventDefault();
                    return;
                }
                
                startPos = { x: e.clientX, y: e.clientY };
                isDragging = false;
                
                const handleMouseMove = (moveEvent) => {
                    if (!startPos) return;
                    
                    const dx = Math.abs(moveEvent.clientX - startPos.x);
                    const dy = Math.abs(moveEvent.clientY - startPos.y);
                    
                    if (!isDragging && (dx > this.dragThreshold || dy > this.dragThreshold)) {
                        isDragging = true;
                        this.startPianoDrag(moveEvent, key);
                    }
                    
                    if (isDragging && this.dragState) {
                        this.handleDragMove(moveEvent);
                    }
                };
                
                const handleMouseUp = (upEvent) => {
                    if (isDragging && this.dragState) {
                        this.handleDrop();
                    } else if (!isDragging && startPos) {
                        this.previewPianoKey(key);
                    }
                    
                    startPos = null;
                    isDragging = false;
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            });
        });
    }
    
    /**
     * Preview a piano key sound
     * @param {HTMLElement} key - Piano key element
     */
    previewPianoKey(key) {
        const noteIndex = parseInt(key.dataset.noteIndex);
        if (isNaN(noteIndex)) return;
        
        const noteData = this.pianoKeyboard.getNoteData(noteIndex);
        
        key.classList.add('playing');
        setTimeout(() => key.classList.remove('playing'), 300);
        
        // Preview with the keyboard's current octave (or track 1 default if no octave set)
        this.onPreview(noteData.note, 1, noteData.octave);
    }
    
    /**
     * Start dragging from piano keyboard
     * @param {Touch|MouseEvent} pointer - Pointer position
     * @param {HTMLElement} key - Piano key element
     */
    startPianoDrag(pointer, key) {
        const noteIndex = parseInt(key.dataset.noteIndex);
        if (isNaN(noteIndex)) return;
        
        const noteData = this.pianoKeyboard.getNoteData(noteIndex);
        
        this.dragState = {
            note: noteData.note,
            type: 'piano',
            icon: noteData.icon,
            octave: noteData.octave,  // Include octave from piano keyboard
            trackNum: null, // Will be determined on drop (1 or 2)
            sourceBtn: key,
            fromPiano: true
        };
        
        key.classList.add('dragging');
        
        // Highlight piano tracks as available
        this.updateTrackAvailability('piano');
        
        this.createDragGhost(pointer, noteData.icon);
        this.updateDropTargets(pointer);
    }

    /**
     * Setup palette button interactions
     */
    setupPaletteButtons() {
        const buttons = this.palette.querySelectorAll('.note-btn');
        
        buttons.forEach(btn => {
            let startPos = null;
            let isDragging = false;
            
            // Touch events
            btn.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                startPos = { x: touch.clientX, y: touch.clientY };
                isDragging = false;
            }, { passive: true });
            
            btn.addEventListener('touchmove', (e) => {
                if (!startPos) return;
                
                const touch = e.touches[0];
                const dx = Math.abs(touch.clientX - startPos.x);
                const dy = Math.abs(touch.clientY - startPos.y);
                
                if (!isDragging && (dx > this.dragThreshold || dy > this.dragThreshold)) {
                    isDragging = true;
                    e.preventDefault();
                    this.startDrag(touch, btn);
                }
                
                if (isDragging && this.dragState) {
                    e.preventDefault();
                    this.handleDragMove(touch);
                }
            }, { passive: false });
            
            btn.addEventListener('touchend', (e) => {
                if (isDragging && this.dragState) {
                    e.preventDefault();
                    this.handleDrop();
                } else if (!isDragging && startPos) {
                    // It was a tap - preview the sound
                    this.previewNote(btn);
                }
                startPos = null;
                isDragging = false;
            });
            
            btn.addEventListener('touchcancel', () => {
                startPos = null;
                isDragging = false;
                this.cancelDrag();
            });
            
            // Mouse events
            let mouseStartPos = null;
            let isMouseDragging = false;
            
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                mouseStartPos = { x: e.clientX, y: e.clientY };
                isMouseDragging = false;
                
                // Add document-level listeners for this drag
                const handleMouseMove = (moveE) => {
                    if (!mouseStartPos) return;
                    
                    const dx = Math.abs(moveE.clientX - mouseStartPos.x);
                    const dy = Math.abs(moveE.clientY - mouseStartPos.y);
                    
                    if (!isMouseDragging && (dx > this.dragThreshold || dy > this.dragThreshold)) {
                        isMouseDragging = true;
                        this.startDrag(moveE, btn);
                    }
                    
                    if (isMouseDragging && this.dragState) {
                        this.handleDragMove(moveE);
                    }
                };
                
                const handleMouseUp = () => {
                    if (isMouseDragging && this.dragState) {
                        this.handleDrop();
                    } else if (!isMouseDragging && mouseStartPos) {
                        // It was a click - preview the sound
                        this.previewNote(btn);
                    }
                    mouseStartPos = null;
                    isMouseDragging = false;
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            });
        });
    }

    /**
     * Setup global event listeners
     */
    setupGlobalListeners() {
        // Prevent context menu on long press
        this.palette.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Preview a note (play sound without adding to timeline)
     * @param {HTMLElement} btn - Note button
     */
    previewNote(btn) {
        const note = btn.dataset.note;
        const type = btn.dataset.type;
        
        btn.classList.add('playing');
        setTimeout(() => btn.classList.remove('playing'), 300);
        
        // Convert type to track number (percussion = track 3)
        const trackNum = type === 'percussion' ? 3 : 1;
        // Percussion notes don't use octave (null), piano notes use null for track default
        this.onPreview(note, trackNum, null);
    }

    /**
     * Start dragging a note
     * @param {Touch|MouseEvent} pointer - Pointer position
     * @param {HTMLElement} btn - Note button
     */
    startDrag(pointer, btn) {
        const note = btn.dataset.note;
        const type = btn.dataset.type;
        const icon = btn.querySelector('.note-icon').textContent;
        
        // For percussion: trackNum is 3, for piano: determined on drop
        const trackNum = type === 'percussion' ? 3 : null;
        
        this.dragState = { 
            note, 
            type, 
            icon, 
            trackNum,
            sourceBtn: btn,
            fromPiano: false
        };
        
        btn.classList.add('dragging');
        
        // Highlight available/unavailable tracks
        this.updateTrackAvailability(type);
        
        this.createDragGhost(pointer, icon);
        this.updateDropTargets(pointer);
    }

    /**
     * Update track visual states based on note type
     * @param {string} noteType - The type of note being dragged ('piano' or 'percussion')
     */
    updateTrackAvailability(noteType) {
        document.querySelectorAll('.track').forEach(track => {
            const trackNum = parseInt(track.dataset.track);
            
            if (noteType === 'piano') {
                // Piano notes can go on tracks 1 or 2
                if (trackNum === 1 || trackNum === 2) {
                    track.classList.add('drop-available');
                    track.classList.remove('drop-unavailable');
                } else {
                    track.classList.add('drop-unavailable');
                    track.classList.remove('drop-available');
                }
            } else if (noteType === 'percussion') {
                // Percussion only on track 3
                if (trackNum === 3) {
                    track.classList.add('drop-available');
                    track.classList.remove('drop-unavailable');
                } else {
                    track.classList.add('drop-unavailable');
                    track.classList.remove('drop-available');
                }
            }
        });
    }

    /**
     * Create drag ghost element
     * @param {Touch|MouseEvent} pointer - Initial position
     * @param {string} icon - Icon to display
     */
    createDragGhost(pointer, icon) {
        this.dragGhost = document.createElement('div');
        this.dragGhost.className = 'drag-ghost';
        this.dragGhost.textContent = icon;
        this.dragGhost.style.left = `${pointer.clientX}px`;
        this.dragGhost.style.top = `${pointer.clientY}px`;
        document.body.appendChild(this.dragGhost);
    }

    /**
     * Handle drag move
     * @param {Touch|MouseEvent} pointer - Current position
     */
    handleDragMove(pointer) {
        if (!this.dragGhost) return;
        
        this.dragGhost.style.left = `${pointer.clientX}px`;
        this.dragGhost.style.top = `${pointer.clientY}px`;
        
        this.updateDropTargets(pointer);
    }

    /**
     * Update drop target highlighting
     * @param {Touch|MouseEvent} pointer - Current position
     */
    updateDropTargets(pointer) {
        // Clear previous targets
        document.querySelectorAll('.track-cell.drop-target').forEach(cell => {
            cell.classList.remove('drop-target');
        });
        
        // Find cell under pointer
        const cell = this.getCellUnderPointer(pointer);
        
        if (cell && this.isValidDrop(cell)) {
            cell.classList.add('drop-target');
        }
    }

    /**
     * Get cell element under pointer
     * @param {Touch|MouseEvent} pointer - Current position
     * @returns {HTMLElement|null}
     */
    getCellUnderPointer(pointer) {
        // Temporarily hide ghost to get element under it
        if (this.dragGhost) {
            this.dragGhost.style.display = 'none';
        }
        
        const element = document.elementFromPoint(pointer.clientX, pointer.clientY);
        
        if (this.dragGhost) {
            this.dragGhost.style.display = '';
        }
        
        // Find the cell (might be the note inside)
        if (element?.classList.contains('track-cell')) {
            return element;
        }
        const trackCell = element?.closest('.track-cell');
        if (trackCell) return trackCell;
        
        return null;
    }

    /**
     * Check if drop is valid for this cell
     * @param {HTMLElement} cell - Target cell
     * @returns {boolean}
     */
    isValidDrop(cell) {
        if (!this.dragState) return false;
        
        const trackNum = parseInt(cell.dataset.track);
        
        // Check if note type matches track
        if (this.dragState.type === 'percussion') {
            // Percussion only on track 3
            if (trackNum !== 3) return false;
        } else {
            // Piano notes on tracks 1 or 2
            if (trackNum !== 1 && trackNum !== 2) return false;
        }
        
        // Don't allow dropping on cells covered by extended notes
        if (cell.classList.contains('covered-by-note')) return false;
        
        // Don't allow dropping on cells that already have notes
        if (cell.classList.contains('has-note')) return false;
        
        return true;
    }

    /**
     * Handle drop
     */
    handleDrop() {
        if (!this.dragState) return;
        
        // Find drop target
        const targetCell = document.querySelector('.track-cell.drop-target');
        
        if (targetCell) {
            const trackNum = parseInt(targetCell.dataset.track);
            const beat = parseInt(targetCell.dataset.beat);
            
            // Check if this is a pattern timeline cell
            const isPatternTimeline = targetCell.closest('.pattern-mini-timeline') !== null;
            
            // Create note data using octave from drag state
            // If octave is not set (e.g., from palette in Studio Mode), use piano keyboard's current octave
            let octave = this.dragState.octave;
            if (octave === undefined && this.pianoKeyboard && this.pianoKeyboard.multiOctaveMode && trackNum !== 3) {
                // In Studio Mode, use the keyboard's current octave for piano tracks
                octave = this.pianoKeyboard.currentOctave;
            }
            
            const noteData = {
                note: this.dragState.note,
                icon: this.dragState.icon,
                duration: 1,
                octave: octave
            };
            
            if (isPatternTimeline) {
                // Dispatch event for pattern timeline (PatternDrawer handles this)
                window.dispatchEvent(new CustomEvent('patternTimelineDrop', {
                    detail: { trackNum, beat, noteData }
                }));
            } else {
                // Normal main timeline drop
                this.onDrop(trackNum, beat, noteData);
            }
        }
        
        this.cancelDrag();
    }

    /**
     * Cancel drag operation
     */
    cancelDrag() {
        if (this.dragState?.sourceBtn) {
            this.dragState.sourceBtn.classList.remove('dragging');
        }
        
        if (this.dragGhost) {
            this.dragGhost.remove();
            this.dragGhost = null;
        }
        
        // Clear drop targets
        document.querySelectorAll('.track-cell.drop-target').forEach(cell => {
            cell.classList.remove('drop-target');
        });
        
        // Clear track availability states
        document.querySelectorAll('.track').forEach(track => {
            track.classList.remove('drop-available', 'drop-unavailable');
        });
        
        this.dragState = null;
    }
}

window.DragDrop = DragDrop;
