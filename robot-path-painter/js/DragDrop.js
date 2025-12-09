/**
 * DragDrop - Touch-friendly drag and drop for command blocks
 * Handles dragging from palette to sequence, reordering, and deleting
 */
export class DragDrop {
    constructor(options) {
        this.sequenceArea = options.sequenceArea;
        this.trashZone = options.trashZone;
        this.onAddCommand = options.onAddCommand;
        this.onAddFireCommand = options.onAddFireCommand;
        this.onReorder = options.onReorder;
        this.onRemove = options.onRemove;
        
        this.dragState = null;
        this.dragElement = null;
        this.placeholder = null;
        this.dragThreshold = 15; // Pixels to move before it becomes a drag
        this.longPressTime = 200; // ms to hold before drag starts
        
        this.setupPaletteButtons();
        this.setupSequenceArea();
        this.setupTrashZone();
    }

    /**
     * Setup drag events for command palette buttons
     */
    setupPaletteButtons() {
        // Movement command buttons
        document.querySelectorAll('.command-btn').forEach(btn => {
            this.addTouchDragOrTap(btn, 
                () => ({ type: 'add', commandType: 'move', direction: btn.dataset.command }),
                () => {
                    // Tap action - add at end
                    this.onAddCommand(btn.dataset.command);
                }
            );
        });

        // Fire command buttons
        document.querySelectorAll('.fire-btn').forEach(btn => {
            this.addTouchDragOrTap(btn,
                () => ({ type: 'add', commandType: 'fire', direction: btn.dataset.fire }),
                () => {
                    // Tap action - add at end
                    this.onAddFireCommand(btn.dataset.fire);
                }
            );
        });
    }

    /**
     * Setup the sequence area for receiving drops and reordering
     */
    setupSequenceArea() {
        // Global touch move handler for when dragging
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
     * Add touch capability that distinguishes between tap and drag
     * @param {HTMLElement} element - Element to make interactive
     * @param {function} getDataFn - Function that returns drag data
     * @param {function} onTap - Function to call on tap (no drag)
     */
    addTouchDragOrTap(element, getDataFn, onTap) {
        let touchStartPos = null;
        let touchStartTime = null;
        let isDragging = false;

        element.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            touchStartPos = { x: touch.clientX, y: touch.clientY };
            touchStartTime = Date.now();
            isDragging = false;
        }, { passive: true });

        element.addEventListener('touchmove', (e) => {
            if (!touchStartPos) return;
            
            const touch = e.touches[0];
            const dx = Math.abs(touch.clientX - touchStartPos.x);
            const dy = Math.abs(touch.clientY - touchStartPos.y);
            
            // Start dragging if moved beyond threshold
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
            const touchDuration = Date.now() - touchStartTime;
            
            if (isDragging && this.dragState) {
                this.handleDrop();
            } else if (touchStartPos && touchDuration < 300) {
                // Short tap - call tap handler
                onTap();
            }
            
            touchStartPos = null;
            touchStartTime = null;
            isDragging = false;
        });

        element.addEventListener('touchcancel', () => {
            touchStartPos = null;
            touchStartTime = null;
            isDragging = false;
            this.cancelDrag();
        });
    }

    /**
     * Make sequence items draggable for reordering
     * Called by Renderer when sequence is re-rendered
     * @param {NodeList} items - Sequence item elements
     */
    makeItemsDraggable(items) {
        items.forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (isNaN(index)) return;
            
            let touchStartPos = null;
            let touchStartTime = null;
            let isDragging = false;

            item.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                touchStartPos = { x: touch.clientX, y: touch.clientY };
                touchStartTime = Date.now();
                isDragging = false;
            }, { passive: true });

            item.addEventListener('touchmove', (e) => {
                if (!touchStartPos) return;
                
                const touch = e.touches[0];
                const dx = Math.abs(touch.clientX - touchStartPos.x);
                const dy = Math.abs(touch.clientY - touchStartPos.y);
                
                // Start dragging if moved beyond threshold
                if (!isDragging && (dx > this.dragThreshold || dy > this.dragThreshold)) {
                    isDragging = true;
                    e.preventDefault();
                    this.startDrag(touch, item, {
                        type: 'reorder',
                        index: index,
                        element: item
                    });
                    item.classList.add('dragging');
                }
                
                if (isDragging && this.dragState) {
                    e.preventDefault();
                    this.handleDragMove(touch);
                }
            }, { passive: false });

            item.addEventListener('touchend', () => {
                if (isDragging && this.dragState) {
                    this.handleDrop();
                }
                // Note: Tap to remove is handled by click event in Game.js
                
                touchStartPos = null;
                touchStartTime = null;
                isDragging = false;
            });

            item.addEventListener('touchcancel', () => {
                touchStartPos = null;
                touchStartTime = null;
                isDragging = false;
                this.cancelDrag();
            });
        });
    }

    /**
     * Start a drag operation
     * @param {Touch} touch - Touch event data
     * @param {HTMLElement} sourceElement - Element being dragged
     * @param {object} data - Drag data
     */
    startDrag(touch, sourceElement, data) {
        this.dragState = {
            data: data,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY
        };

        // Create floating drag element
        this.dragElement = document.createElement('div');
        this.dragElement.className = 'drag-ghost';
        this.dragElement.innerHTML = sourceElement.innerHTML;
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

        // Show visual feedback
        this.sequenceArea.classList.add('drag-active');
        if (this.trashZone) {
            this.trashZone.classList.add('drag-active');
        }

        // Create placeholder if reordering
        if (data.type === 'reorder') {
            this.createPlaceholder();
            data.element.style.opacity = '0.3';
        }
    }

    /**
     * Handle drag movement
     * @param {Touch} touch - Touch event data
     */
    handleDragMove(touch) {
        if (!this.dragState || !this.dragElement) return;

        this.dragState.currentX = touch.clientX;
        this.dragState.currentY = touch.clientY;

        // Update drag element position
        this.dragElement.style.left = `${touch.clientX - 30}px`;
        this.dragElement.style.top = `${touch.clientY - 30}px`;

        // Check if over trash zone
        if (this.trashZone && this.isOverElement(touch, this.trashZone)) {
            this.trashZone.classList.add('drag-over');
            this.sequenceArea.classList.remove('drag-over');
        } else if (this.isOverElement(touch, this.sequenceArea)) {
            this.sequenceArea.classList.add('drag-over');
            if (this.trashZone) {
                this.trashZone.classList.remove('drag-over');
            }
            
            // Update placeholder position for reordering
            if (this.dragState.data.type === 'reorder' || this.dragState.data.type === 'add') {
                this.updatePlaceholderPosition(touch);
            }
        } else {
            this.sequenceArea.classList.remove('drag-over');
            if (this.trashZone) {
                this.trashZone.classList.remove('drag-over');
            }
        }
    }

    /**
     * Handle drop at end of drag
     */
    handleDrop() {
        if (!this.dragState) return;

        const touch = {
            clientX: this.dragState.currentX,
            clientY: this.dragState.currentY
        };

        // Check if dropped on trash
        if (this.trashZone && this.isOverElement(touch, this.trashZone)) {
            if (this.dragState.data.type === 'reorder') {
                this.onRemove(this.dragState.data.index);
            }
            // If adding from palette to trash, just ignore
        }
        // Check if dropped on sequence area
        else if (this.isOverElement(touch, this.sequenceArea)) {
            const data = this.dragState.data;
            
            if (data.type === 'add') {
                // Adding new command
                const dropIndex = this.getDropIndex(touch);
                if (data.commandType === 'fire') {
                    this.onAddFireCommand(data.direction, dropIndex);
                } else {
                    this.onAddCommand(data.direction, dropIndex);
                }
            } else if (data.type === 'reorder') {
                // Reordering existing command
                const dropIndex = this.getDropIndex(touch);
                if (dropIndex !== data.index && dropIndex !== data.index + 1) {
                    this.onReorder(data.index, dropIndex);
                }
            }
        }

        this.cleanupDrag();
    }

    /**
     * Cancel drag operation
     */
    cancelDrag() {
        clearTimeout(this.touchStartTimer);
        this.touchStartTimer = null;
        this.cleanupDrag();
    }

    /**
     * Clean up after drag operation
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
        if (this.trashZone) {
            this.trashZone.classList.remove('drag-active', 'drag-over');
        }

        this.dragState = null;
    }

    /**
     * Check if touch point is over an element
     * @param {Touch|object} touch - Touch or coordinate object
     * @param {HTMLElement} element - Element to check
     * @returns {boolean}
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
     * Get drop index based on touch position
     * @param {Touch|object} touch - Touch or coordinate object
     * @returns {number} Index where item should be inserted
     */
    getDropIndex(touch) {
        const items = this.sequenceArea.querySelectorAll('.sequence-item:not(.drag-ghost), .loop-block');
        let dropIndex = 0;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            // Skip the item being dragged
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
     * Create placeholder element for showing drop position
     */
    createPlaceholder() {
        this.placeholder = document.createElement('div');
        this.placeholder.className = 'drop-placeholder';
        this.placeholder.style.cssText = `
            width: 8px;
            height: 50px;
            background: var(--color-success);
            border-radius: 4px;
            transition: transform 0.15s ease;
        `;
    }

    /**
     * Update placeholder position during drag
     * @param {Touch|object} touch - Touch or coordinate object
     */
    updatePlaceholderPosition(touch) {
        if (!this.placeholder) {
            this.createPlaceholder();
        }

        const items = this.sequenceArea.querySelectorAll('.sequence-item:not(.dragging), .loop-block:not(.dragging)');
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
}
