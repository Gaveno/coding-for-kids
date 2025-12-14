/**
 * DragDrop - Drag and drop for Magic Garden
 * 
 * Extends BaseDragDrop with game-specific command handling.
 */
import { BaseDragDrop } from '../../shared/js/BaseDragDrop.js';

export class DragDrop extends BaseDragDrop {
    constructor(options) {
        super(options);
        
        this.onAddCommand = options.onAddCommand;
        this.onAddToLoop = options.onAddToLoop;
        
        this.setupPaletteButtons();
    }

    /**
     * Get CSS background for drag ghost
     */
    getDragGhostBackground() {
        return 'var(--color-primary)';
    }

    /**
     * Setup palette buttons for dragging
     */
    setupPaletteButtons() {
        const buttons = document.querySelectorAll('.command-btn');
        
        buttons.forEach(btn => {
            const action = btn.dataset.command;
            
            this.addTouchDragOnly(btn, () => ({
                type: 'new',
                command: action
            }));

            // Mouse drag support
            let mouseStartPos = null;
            let isDragging = false;

            btn.addEventListener('mousedown', (e) => {
                mouseStartPos = { x: e.clientX, y: e.clientY };
                isDragging = false;
            });

            btn.addEventListener('mousemove', (e) => {
                if (!mouseStartPos || isDragging) return;
                
                const dx = Math.abs(e.clientX - mouseStartPos.x);
                const dy = Math.abs(e.clientY - mouseStartPos.y);
                
                if (dx > this.dragThreshold || dy > this.dragThreshold) {
                    isDragging = true;
                    this.startDrag(e, btn, {
                        type: 'new',
                        command: action
                    });
                }
            });

            btn.addEventListener('mouseup', () => {
                mouseStartPos = null;
                isDragging = false;
            });

            btn.addEventListener('mouseleave', () => {
                mouseStartPos = null;
            });
        });
    }

    /**
     * Handle drop event
     */
    handleDrop() {
        if (!this.dragState) return;

        const { data } = this.dragState;
        const dropInfo = this.getDropInfo();

        // Check for trash zone drop
        if (this.isOverTrashZone()) {
            if (data.type === 'reorder') {
                this.onRemove(data.index);
            } else if (data.type === 'reorder-loop-item') {
                this.onRemoveFromLoop(data.loopIndex, data.cmdIndex);
            }
        } else if (dropInfo) {
            this.processDropInfo(data, dropInfo);
        }

        this.cleanupDrag();
    }

    /**
     * Process drop information and call appropriate callbacks
     */
    processDropInfo(data, dropInfo) {
        if (data.type === 'new') {
            // New command from palette
            if (dropInfo.type === 'main') {
                this.onAddCommand(data.command, dropInfo.index);
            } else if (dropInfo.type === 'loop') {
                this.onAddToLoop(data.command, dropInfo.loopIndex, dropInfo.cmdIndex);
            }
        } else if (data.type === 'reorder') {
            // Reordering within main sequence
            if (dropInfo.type === 'main') {
                this.onReorder(data.index, dropInfo.index);
            } else if (dropInfo.type === 'loop' && !data.isLoop) {
                // Move from main to loop (not the loop itself)
                this.onMoveToLoop(data.index, dropInfo.loopIndex, dropInfo.cmdIndex);
            }
        } else if (data.type === 'reorder-loop-item') {
            // Reordering from within a loop
            if (dropInfo.type === 'main') {
                this.onMoveFromLoop(data.loopIndex, data.cmdIndex, dropInfo.index);
            } else if (dropInfo.type === 'loop' && dropInfo.loopIndex === data.loopIndex) {
                this.onReorderInLoop(data.loopIndex, data.cmdIndex, dropInfo.cmdIndex);
            }
        }
    }

    /**
     * Get drop target information based on current drag position
     */
    getDropInfo() {
        if (!this.placeholder) return null;
        
        const placeholderParent = this.placeholder.parentElement;
        
        if (placeholderParent === this.sequenceArea) {
            // Dropping in main sequence
            const items = Array.from(this.sequenceArea.querySelectorAll('.sequence-item, .loop-block, .drop-placeholder'));
            const placeholderIndex = items.indexOf(this.placeholder);
            
            // Count only non-placeholder items before this position
            let index = 0;
            for (let i = 0; i < placeholderIndex; i++) {
                if (!items[i].classList.contains('drop-placeholder')) {
                    index++;
                }
            }
            
            return { type: 'main', index };
        } else if (placeholderParent?.classList.contains('loop-body')) {
            // Dropping in a loop
            const loopBlock = placeholderParent.closest('.loop-block');
            const loopIndex = parseInt(loopBlock?.dataset.index);
            
            const items = Array.from(placeholderParent.querySelectorAll('.loop-item, .drop-placeholder'));
            const placeholderIndex = items.indexOf(this.placeholder);
            
            let cmdIndex = 0;
            for (let i = 0; i < placeholderIndex; i++) {
                if (!items[i].classList.contains('drop-placeholder')) {
                    cmdIndex++;
                }
            }
            
            return { type: 'loop', loopIndex, cmdIndex };
        }
        
        return null;
    }

    /**
     * Check if currently over trash zone
     */
    isOverTrashZone() {
        return this.trashZone?.classList.contains('drag-over');
    }

    /**
     * Clean up after drag operation
     */
    cleanupDrag() {
        if (this.dragState?.data?.element) {
            this.dragState.data.element.style.opacity = '';
            this.dragState.data.element.classList.remove('dragging');
        }
        
        if (this.dragElement) {
            this.dragElement.remove();
            this.dragElement = null;
        }
        
        if (this.placeholder) {
            this.placeholder.remove();
            this.placeholder = null;
        }
        
        this.sequenceArea.classList.remove('drag-active', 'drag-over');
        if (this.trashZone) {
            this.trashZone.classList.remove('drag-active', 'drag-over');
        }
        
        this.dragState = null;
    }
}
