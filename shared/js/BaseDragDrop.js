/**
 * BaseDragDrop - Shared drag and drop infrastructure for command sequences
 * 
 * Provides touch-friendly drag and drop for command blocks with loop support.
 * Games extend this class and implement game-specific methods.
 */
export class BaseDragDrop {
    constructor(options) {
        this.sequenceArea = options.sequenceArea;
        this.trashZone = options.trashZone;
        
        // Core callbacks (required)
        this.onReorder = options.onReorder;
        this.onRemove = options.onRemove;
        
        // Loop operation callbacks
        this.onReorderInLoop = options.onReorderInLoop;
        this.onMoveFromLoop = options.onMoveFromLoop;
        this.onMoveToLoop = options.onMoveToLoop;
        this.onRemoveFromLoop = options.onRemoveFromLoop;
        
        this.dragState = null;
        this.dragElement = null;
        this.placeholder = null;
        this.dragThreshold = 15;
        
        // Mouse drag tracking for sequence items
        this.mouseDragPending = null;
        
        this.setupSequenceArea();
        this.setupTrashZone();
    }

    /**
     * Setup palette buttons - must be implemented by subclass
     * @abstract
     */
    setupPaletteButtons() {
        throw new Error('setupPaletteButtons must be implemented by subclass');
    }

    /**
     * Handle drop event - must be implemented by subclass
     * @abstract
     */
    handleDrop() {
        throw new Error('handleDrop must be implemented by subclass');
    }

    /**
     * Get CSS background property for drag ghost
     * Override in subclass if using different CSS variable names
     */
    getDragGhostBackground() {
        return 'var(--color-primary)';
    }

    /**
     * Setup the sequence area for receiving drops and reordering
     */
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

    /**
     * Setup trash zone for deleting commands
     */
    setupTrashZone() {
        if (!this.trashZone) return;
        this.trashZone.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    /**
     * Add touch drag capability (taps fall through to click handlers)
     * @param {HTMLElement} element - Element to make draggable
     * @param {function} getDataFn - Function that returns drag data
     */
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

    /**
     * Make sequence items draggable for reordering
     * @param {NodeList} items - Sequence item elements
     */
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

    /**
     * Start a drag operation
     * @param {Touch|MouseEvent} touch - Touch or mouse event
     * @param {HTMLElement} sourceElement - Element being dragged
     * @param {Object} data - Drag data
     */
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
            background: ${this.getDragGhostBackground()};
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

    /**
     * Handle drag move
     * @param {Touch|MouseEvent} touch - Touch or mouse event
     */
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

    /**
     * Cancel drag operation
     */
    cancelDrag() {
        this.cleanupDrag();
    }

    /**
     * Cleanup after drag ends
     */
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

    /**
     * Check if touch is over element
     */
    isOverElement(touch, element) {
        const rect = element.getBoundingClientRect();
        return (
            touch.clientX >= rect.left &&
            touch.clientX <= rect.right &&
            touch.clientY >= rect.top &&
            touch.clientY <= rect.bottom
        );
    }

    /**
     * Get drop index in main sequence
     */
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

    /**
     * Create placeholder element
     */
    createPlaceholder() {
        this.placeholder = document.createElement('div');
        this.placeholder.className = 'drop-placeholder';
    }

    /**
     * Update placeholder position in main sequence
     */
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
