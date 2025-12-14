/**
 * DragDrop - Robot Path Painter specific drag and drop
 * Extends BaseDragDrop with game-specific command handling
 */
import { BaseDragDrop } from '../../shared/js/BaseDragDrop.js';

export class DragDrop extends BaseDragDrop {
    constructor(options) {
        super(options);
        
        // Robot path painter specific callbacks
        this.onAddCommand = options.onAddCommand;
        this.onAddFireCommand = options.onAddFireCommand;
        this.onAddToLoop = options.onAddToLoop;
        
        this.setupPaletteButtons();
    }

    /**
     * Get CSS background for drag ghost - uses different variable name
     */
    getDragGhostBackground() {
        return 'var(--primary-color)';
    }

    /**
     * Setup palette buttons for robot commands
     */
    setupPaletteButtons() {
        // Movement commands
        document.querySelectorAll('.command-btn').forEach(btn => {
            this.addTouchDragOnly(btn, 
                () => ({ type: 'add', commandType: 'move', direction: btn.dataset.command })
            );
        });

        // Fire commands
        document.querySelectorAll('.fire-btn').forEach(btn => {
            this.addTouchDragOnly(btn,
                () => ({ type: 'add', commandType: 'fire', direction: btn.dataset.fire })
            );
        });
    }

    /**
     * Handle drop event for robot path painter
     */
    handleDrop() {
        if (!this.dragState) return;

        const touch = {
            clientX: this.dragState.currentX,
            clientY: this.dragState.currentY
        };
        const data = this.dragState.data;

        if (this.trashZone && this.isOverElement(touch, this.trashZone)) {
            // Dropping on trash
            if (data.type === 'reorder') {
                this.onRemove(data.index);
            } else if (data.type === 'reorder-loop-item') {
                this.onRemoveFromLoop(data.loopIndex, data.cmdIndex);
            }
        } else if (this.isOverElement(touch, this.sequenceArea)) {
            const loopBody = this.getLoopBodyAtPoint(touch);
            
            if (loopBody) {
                // Dropping into a loop body
                const loopBlock = this.getLoopBlockFromBody(loopBody);
                const targetLoopIndex = parseInt(loopBlock.dataset.index);
                const dropIndexInLoop = this.getDropIndexInLoop(touch, loopBody);
                
                if (data.type === 'add') {
                    // Adding new command to loop
                    this.onAddToLoop(data.commandType, data.direction, targetLoopIndex, dropIndexInLoop);
                } else if (data.type === 'reorder') {
                    // Moving from main sequence into loop (can't move loops into loops)
                    if (!data.isLoop) {
                        this.onMoveToLoop(data.index, targetLoopIndex, dropIndexInLoop);
                    }
                } else if (data.type === 'reorder-loop-item') {
                    if (data.loopIndex === targetLoopIndex) {
                        // Reordering within the same loop
                        if (dropIndexInLoop !== data.cmdIndex && dropIndexInLoop !== data.cmdIndex + 1) {
                            this.onReorderInLoop(targetLoopIndex, data.cmdIndex, dropIndexInLoop);
                        }
                    }
                    // Note: Cross-loop moves are not supported
                }
            } else {
                // Dropping into main sequence area
                const dropIndex = this.getDropIndex(touch);
                
                if (data.type === 'add') {
                    if (data.commandType === 'fire') {
                        this.onAddFireCommand(data.direction, dropIndex);
                    } else {
                        this.onAddCommand(data.direction, dropIndex);
                    }
                } else if (data.type === 'reorder') {
                    if (dropIndex !== data.index && dropIndex !== data.index + 1) {
                        this.onReorder(data.index, dropIndex);
                    }
                } else if (data.type === 'reorder-loop-item') {
                    // Moving from loop to main sequence
                    this.onMoveFromLoop(data.loopIndex, data.cmdIndex, dropIndex);
                }
            }
        }

        this.cleanupDrag();
    }
}
