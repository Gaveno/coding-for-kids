/**
 * DragDrop.js - Handles dragging notes from palette to timeline
 */
class DragDrop {
    constructor(options) {
        this.palette = options.palette;
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
        this.setupGlobalListeners();
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
        
        this.onPreview(note, type);
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
        
        this.dragState = { note, type, icon, sourceBtn: btn };
        
        btn.classList.add('dragging');
        
        // Highlight available/unavailable tracks
        this.updateTrackAvailability(type);
        
        this.createDragGhost(pointer, icon);
        this.updateDropTargets(pointer);
    }

    /**
     * Update track visual states based on note type
     * @param {string} noteType - The type of note being dragged
     */
    updateTrackAvailability(noteType) {
        document.querySelectorAll('.track').forEach(track => {
            const trackType = track.dataset.track;
            if (trackType === noteType) {
                track.classList.add('drop-available');
                track.classList.remove('drop-unavailable');
            } else {
                track.classList.add('drop-unavailable');
                track.classList.remove('drop-available');
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
        if (element?.closest('.track-cell')) {
            return element.closest('.track-cell');
        }
        
        return null;
    }

    /**
     * Check if drop is valid for this cell
     * @param {HTMLElement} cell - Target cell
     * @returns {boolean}
     */
    isValidDrop(cell) {
        if (!this.dragState) return false;
        
        const trackType = cell.dataset.track;
        const noteType = this.dragState.type;
        
        // Notes can only be dropped on matching track type
        return trackType === noteType;
    }

    /**
     * Handle drop
     */
    handleDrop() {
        if (!this.dragState) return;
        
        // Find drop target
        const targetCell = document.querySelector('.track-cell.drop-target');
        
        if (targetCell) {
            const trackType = targetCell.dataset.track;
            const beat = parseInt(targetCell.dataset.beat);
            
            this.onDrop(trackType, beat, this.dragState.note, this.dragState.icon);
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
