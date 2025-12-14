/**
 * DragDrop - Touch-friendly drag and drop for command blocks
 * Handles dragging from palette to sequence, reordering, and deleting
 * Note: Tap/click is handled by Game.js - this only handles drag gestures
 */
export class DragDrop {
    constructor(options) {
        this.sequenceArea = options.sequenceArea;
        this.trashZone = options.trashZone;
        this.onAddCommand = options.onAddCommand;
        this.onReorder = options.onReorder;
        this.onRemove = options.onRemove;
        // New callbacks for loop operations
        this.onReorderInLoop = options.onReorderInLoop;
        this.onMoveFromLoop = options.onMoveFromLoop;
        this.onMoveToLoop = options.onMoveToLoop;
        this.onRemoveFromLoop = options.onRemoveFromLoop;
        this.onAddToLoop = options.onAddToLoop;
        
        this.dragState = null;
        this.dragElement = null;
        this.placeholder = null;
        this.dragThreshold = 15;
        
        // Mouse drag tracking for sequence items
        this.mouseDragPending = null;
        
        this.setupPaletteButtons();
        this.setupSequenceArea();
        this.setupTrashZone();
    }

    setupPaletteButtons() {
        document.querySelectorAll('.command-btn').forEach(btn => {
            this.addTouchDragOnly(btn, 
                () => ({ type: 'add', command: btn.dataset.command })
            );
        });
    }

    setupSequenceArea() {
        // Touch events
        document.addEventListener('touchmove', (e) => {
            if (!this.dragState) return;
            e.preventDefault();
            this.handleDragMove(e.touches[0]);
        }, { passive: false });

        document.addEventListener('touchend', () => {
            if (!this.dragState) return;
            this.handleDrop();
        });

        document.addEventListener('touchcancel', () => {
            this.cancelDrag();
        });

        // Mouse events for desktop support
        document.addEventListener('mousemove', (e) => {
            // Check if we need to initiate a pending drag
            if (this.mouseDragPending) {
                const dx = Math.abs(e.clientX - this.mouseDragPending.startX);
                const dy = Math.abs(e.clientY - this.mouseDragPending.startY);
                
                if (dx > this.dragThreshold || dy > this.dragThreshold) {
                    const { item, index, isLoop, isLoopItem, loopIndex, cmdIndex } = this.mouseDragPending;
                    
                    if (isLoopItem) {
                        this.startDrag(e, item, {
                            type: 'reorder-loop-item',
                            loopIndex: loopIndex,
                            cmdIndex: cmdIndex,
                            element: item
                        });
                    } else {
                        this.startDrag(e, item, {
                            type: 'reorder',
                            index: index,
                            element: item,
                            isLoop: isLoop
                        });
                    }
                    item.classList.add('dragging');
                    this.mouseDragPending = null;
                }
            }
            
            if (!this.dragState) return;
            e.preventDefault();
            this.handleDragMove(e);
        });

        document.addEventListener('mouseup', () => {
            this.mouseDragPending = null;
            if (!this.dragState) return;
            this.handleDrop();
        });
    }

    setupTrashZone() {
        if (!this.trashZone) return;
        this.trashZone.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    addTouchDragOnly(element, getDataFn) {
        let touchStartPos = null;
        let isDragging = false;

        element.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            touchStartPos = { x: touch.clientX, y: touch.clientY };
            isDragging = false;
        }, { passive: true });

        element.addEventListener('touchmove', (e) => {
            if (!touchStartPos) return;
            
            const touch = e.touches[0];
            const dx = Math.abs(touch.clientX - touchStartPos.x);
            const dy = Math.abs(touch.clientY - touchStartPos.y);
            
            if (!isDragging && (dx > this.dragThreshold || dy > this.dragThreshold)) {
                isDragging = true;
                e.preventDefault();
                this.startDrag(touch, element, getDataFn());
            }
            
            if (isDragging && this.dragState) {
                e.preventDefault();
                this.handleDragMove(touch);
            }
        }, { passive: false });

        element.addEventListener('touchend', (e) => {
            if (isDragging && this.dragState) {
                e.preventDefault();
                this.handleDrop();
            }
            touchStartPos = null;
            isDragging = false;
        });

        element.addEventListener('touchcancel', () => {
            touchStartPos = null;
            isDragging = false;
            this.cancelDrag();
        });
    }

    makeItemsDraggable(items) {
        items.forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (isNaN(index)) return;
            
            // For loop blocks, attach drag handlers to the loop icon in the header
            const isLoopBlock = item.classList.contains('loop-block');
            const dragTarget = isLoopBlock ? item.querySelector('.loop-icon') : item;
            
            if (!dragTarget) return;
            
            let startPos = null;
            let isDragging = false;

            // Touch events
            dragTarget.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                startPos = { x: touch.clientX, y: touch.clientY };
                isDragging = false;
            }, { passive: true });

            dragTarget.addEventListener('touchmove', (e) => {
                if (!startPos) return;
                
                const touch = e.touches[0];
                const dx = Math.abs(touch.clientX - startPos.x);
                const dy = Math.abs(touch.clientY - startPos.y);
                
                if (!isDragging && (dx > this.dragThreshold || dy > this.dragThreshold)) {
                    isDragging = true;
                    e.preventDefault();
                    e.stopPropagation();
                    this.startDrag(touch, item, {
                        type: 'reorder',
                        index: index,
                        element: item,
                        isLoop: isLoopBlock
                    });
                    item.classList.add('dragging');
                }
                
                if (isDragging && this.dragState) {
                    e.preventDefault();
                    this.handleDragMove(touch);
                }
            }, { passive: false });

            dragTarget.addEventListener('touchend', (e) => {
                if (isDragging && this.dragState) {
                    e.stopPropagation();
                    this.handleDrop();
                }
                startPos = null;
                isDragging = false;
            });

            dragTarget.addEventListener('touchcancel', () => {
                startPos = null;
                isDragging = false;
                this.cancelDrag();
            });

            // Mouse events - just record start, document handles the rest
            dragTarget.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.mouseDragPending = {
                    startX: e.clientX,
                    startY: e.clientY,
                    item: item,
                    index: index,
                    isLoop: isLoopBlock
                };
            });
        });
    }

    /**
     * Make items inside a loop draggable
     * @param {HTMLElement} loopBody - The loop body element
     * @param {number} loopIndex - Index of the loop in the main sequence
     */
    makeLoopItemsDraggable(loopBody, loopIndex) {
        const items = loopBody.querySelectorAll('.loop-item');
        items.forEach((item) => {
            const cmdIndex = parseInt(item.dataset.cmdIndex);
            if (isNaN(cmdIndex)) return;
            
            let startPos = null;
            let isDragging = false;

            // Touch events
            item.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                const touch = e.touches[0];
                startPos = { x: touch.clientX, y: touch.clientY };
                isDragging = false;
            }, { passive: true });

            item.addEventListener('touchmove', (e) => {
                if (!startPos) return;
                
                const touch = e.touches[0];
                const dx = Math.abs(touch.clientX - startPos.x);
                const dy = Math.abs(touch.clientY - startPos.y);
                
                if (!isDragging && (dx > this.dragThreshold || dy > this.dragThreshold)) {
                    isDragging = true;
                    e.preventDefault();
                    e.stopPropagation();
                    this.startDrag(touch, item, {
                        type: 'reorder-loop-item',
                        loopIndex: loopIndex,
                        cmdIndex: cmdIndex,
                        element: item
                    });
                    item.classList.add('dragging');
                }
                
                if (isDragging && this.dragState) {
                    e.preventDefault();
                    this.handleDragMove(touch);
                }
            }, { passive: false });

            item.addEventListener('touchend', (e) => {
                if (isDragging && this.dragState) {
                    e.stopPropagation();
                    this.handleDrop();
                }
                startPos = null;
                isDragging = false;
            });

            item.addEventListener('touchcancel', () => {
                startPos = null;
                isDragging = false;
                this.cancelDrag();
            });

            // Mouse events
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.mouseDragPending = {
                    startX: e.clientX,
                    startY: e.clientY,
                    item: item,
                    loopIndex: loopIndex,
                    cmdIndex: cmdIndex,
                    isLoopItem: true
                };
            });
        });
    }

    startDrag(touch, sourceElement, data) {
        this.dragState = {
            data: data,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY
        };

        this.dragElement = document.createElement('div');
        this.dragElement.className = 'drag-ghost';
        
        // For loop blocks, show simplified loop icon
        if (data.isLoop) {
            this.dragElement.innerHTML = '🔄';
        } else {
            this.dragElement.innerHTML = sourceElement.innerHTML;
        }
        
        this.dragElement.style.cssText = `
            position: fixed;
            left: ${touch.clientX - 30}px;
            top: ${touch.clientY - 30}px;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            background: var(--color-primary);
            border-radius: var(--radius-md);
            pointer-events: none;
            z-index: 1000;
            opacity: 0.9;
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
            transform: scale(1.1);
        `;
        document.body.appendChild(this.dragElement);

        this.sequenceArea.classList.add('drag-active');
        if (this.trashZone) {
            this.trashZone.classList.add('drag-active');
        }

        if (data.type === 'reorder' || data.type === 'reorder-loop-item') {
            this.createPlaceholder();
            data.element.style.opacity = '0.3';
        }
    }

    handleDragMove(touch) {
        if (!this.dragState || !this.dragElement) return;

        this.dragState.currentX = touch.clientX;
        this.dragState.currentY = touch.clientY;

        this.dragElement.style.left = `${touch.clientX - 30}px`;
        this.dragElement.style.top = `${touch.clientY - 30}px`;

        // Clear all loop body highlights
        this.sequenceArea.querySelectorAll('.loop-body').forEach(body => {
            body.classList.remove('drag-over');
        });

        if (this.trashZone && this.isOverElement(touch, this.trashZone)) {
            this.trashZone.classList.add('drag-over');
            this.sequenceArea.classList.remove('drag-over');
            if (this.placeholder) this.placeholder.remove();
        } else if (this.isOverElement(touch, this.sequenceArea)) {
            this.sequenceArea.classList.add('drag-over');
            if (this.trashZone) {
                this.trashZone.classList.remove('drag-over');
            }
            
            // Check if over a loop body (for dropping into loops)
            const loopBody = this.getLoopBodyAtPoint(touch);
            if (loopBody) {
                loopBody.classList.add('drag-over');
                this.updateLoopPlaceholderPosition(touch, loopBody);
            } else {
                this.updatePlaceholderPosition(touch);
            }
        } else {
            this.sequenceArea.classList.remove('drag-over');
            if (this.trashZone) {
                this.trashZone.classList.remove('drag-over');
            }
            if (this.placeholder) this.placeholder.remove();
        }
    }

    /**
     * Find which loop body (if any) the touch point is over
     */
    getLoopBodyAtPoint(touch) {
        const loopBodies = this.sequenceArea.querySelectorAll('.loop-body');
        for (const body of loopBodies) {
            if (this.isOverElement(touch, body)) {
                return body;
            }
        }
        return null;
    }

    /**
     * Get the loop block element that contains a loop body
     */
    getLoopBlockFromBody(loopBody) {
        return loopBody.closest('.loop-block');
    }

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
                    this.onAddToLoop(data.command, targetLoopIndex, dropIndexInLoop);
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
                    // Note: Cross-loop moves (between different loops) are not supported
                    // The item will be dropped to main sequence instead
                }
            } else {
                // Dropping into main sequence area
                const dropIndex = this.getDropIndex(touch);
                
                if (data.type === 'add') {
                    this.onAddCommand(data.command, dropIndex);
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

    cancelDrag() {
        this.cleanupDrag();
    }

    cleanupDrag() {
        if (this.dragElement) {
            this.dragElement.remove();
            this.dragElement = null;
        }

        if (this.placeholder) {
            this.placeholder.remove();
            this.placeholder = null;
        }

        if (this.dragState?.data?.element) {
            this.dragState.data.element.style.opacity = '';
            this.dragState.data.element.classList.remove('dragging');
        }

        this.sequenceArea.classList.remove('drag-active', 'drag-over');
        this.sequenceArea.querySelectorAll('.loop-body').forEach(body => {
            body.classList.remove('drag-over');
        });
        if (this.trashZone) {
            this.trashZone.classList.remove('drag-active', 'drag-over');
        }

        this.dragState = null;
    }

    isOverElement(touch, element) {
        const rect = element.getBoundingClientRect();
        return (
            touch.clientX >= rect.left &&
            touch.clientX <= rect.right &&
            touch.clientY >= rect.top &&
            touch.clientY <= rect.bottom
        );
    }

    getDropIndex(touch) {
        const items = this.sequenceArea.querySelectorAll(':scope > .sequence-item:not(.drag-ghost), :scope > .loop-block');
        let dropIndex = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (this.dragState?.data?.element === item) continue;
            
            const rect = item.getBoundingClientRect();
            const midX = rect.left + rect.width / 2;
            
            if (touch.clientX > midX) {
                dropIndex = parseInt(item.dataset.index) + 1;
            } else {
                break;
            }
        }

        return dropIndex;
    }

    createPlaceholder() {
        this.placeholder = document.createElement('div');
        this.placeholder.className = 'drop-placeholder';
    }

    updatePlaceholderPosition(touch) {
        if (!this.placeholder) {
            this.createPlaceholder();
        }
        this.placeholder.classList.remove('loop-placeholder-indicator');

        const items = this.sequenceArea.querySelectorAll(':scope > .sequence-item:not(.dragging), :scope > .loop-block:not(.dragging)');
        let insertBefore = null;

        for (const item of items) {
            if (this.dragState?.data?.element === item) continue;
            
            const rect = item.getBoundingClientRect();
            const midX = rect.left + rect.width / 2;
            
            if (touch.clientX < midX) {
                insertBefore = item;
                break;
            }
        }

        if (insertBefore) {
            this.sequenceArea.insertBefore(this.placeholder, insertBefore);
        } else {
            this.sequenceArea.appendChild(this.placeholder);
        }
    }

    /**
     * Update placeholder position within a loop body
     */
    updateLoopPlaceholderPosition(touch, loopBody) {
        if (!this.placeholder) {
            this.createPlaceholder();
        }
        this.placeholder.classList.add('loop-placeholder-indicator');

        const items = loopBody.querySelectorAll('.loop-item:not(.dragging)');
        let insertBefore = null;

        for (const item of items) {
            if (this.dragState?.data?.element === item) continue;
            
            const rect = item.getBoundingClientRect();
            const midX = rect.left + rect.width / 2;
            
            if (touch.clientX < midX) {
                insertBefore = item;
                break;
            }
        }

        if (insertBefore) {
            loopBody.insertBefore(this.placeholder, insertBefore);
        } else {
            // Insert before placeholder text if it exists, otherwise append
            const placeholderText = loopBody.querySelector('.loop-placeholder');
            if (placeholderText) {
                loopBody.insertBefore(this.placeholder, placeholderText);
            } else {
                loopBody.appendChild(this.placeholder);
            }
        }
    }

    /**
     * Get drop index within a loop body
     */
    getDropIndexInLoop(touch, loopBody) {
        const items = loopBody.querySelectorAll('.loop-item');
        let dropIndex = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (this.dragState?.data?.element === item) continue;
            
            const rect = item.getBoundingClientRect();
            const midX = rect.left + rect.width / 2;
            
            if (touch.clientX > midX) {
                dropIndex = i + 1;
            } else {
                break;
            }
        }

        return dropIndex;
    }
}
