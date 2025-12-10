/**
 * DragDrop - Touch and mouse drag-drop handling
 */
export class DragDrop {
    constructor(options = {}) {
        this.onDragStart = options.onDragStart || (() => {});
        this.onDragEnd = options.onDragEnd || (() => {});
        this.onDrop = options.onDrop || (() => {});
        
        this.dragging = null;
        this.dragElement = null;
        this.startX = 0;
        this.startY = 0;
        
        this.boundHandlePointerDown = this.handlePointerDown.bind(this);
        this.boundHandlePointerMove = this.handlePointerMove.bind(this);
        this.boundHandlePointerUp = this.handlePointerUp.bind(this);
    }

    init(draggableSelector, dropZoneSelector) {
        this.draggableSelector = draggableSelector;
        this.dropZoneSelector = dropZoneSelector;
        
        document.addEventListener('pointerdown', this.boundHandlePointerDown);
        document.addEventListener('pointermove', this.boundHandlePointerMove);
        document.addEventListener('pointerup', this.boundHandlePointerUp);
        
        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest(draggableSelector)) {
                e.preventDefault();
            }
        });
    }

    destroy() {
        document.removeEventListener('pointerdown', this.boundHandlePointerDown);
        document.removeEventListener('pointermove', this.boundHandlePointerMove);
        document.removeEventListener('pointerup', this.boundHandlePointerUp);
    }

    handlePointerDown(e) {
        const draggable = e.target.closest(this.draggableSelector);
        if (!draggable) return;
        
        e.preventDefault();
        
        this.dragging = draggable;
        this.startX = e.clientX;
        this.startY = e.clientY;
        
        // Create drag visual
        this.createDragElement(draggable, e.clientX, e.clientY);
        
        draggable.classList.add('dragging');
        this.onDragStart(draggable, e);
    }

    handlePointerMove(e) {
        if (!this.dragging || !this.dragElement) return;
        
        e.preventDefault();
        
        this.dragElement.style.left = `${e.clientX}px`;
        this.dragElement.style.top = `${e.clientY}px`;
        
        // Check drop zones
        this.updateDropZones(e.clientX, e.clientY);
    }

    handlePointerUp(e) {
        if (!this.dragging) return;
        
        const dropZone = this.findDropZone(e.clientX, e.clientY);
        
        if (dropZone) {
            this.onDrop(this.dragging, dropZone, e);
        }
        
        this.onDragEnd(this.dragging, dropZone, e);
        
        // Cleanup
        if (this.dragElement) {
            this.dragElement.remove();
            this.dragElement = null;
        }
        
        this.dragging.classList.remove('dragging');
        this.clearDropZoneHighlights();
        this.dragging = null;
    }

    createDragElement(source, x, y) {
        this.dragElement = document.createElement('div');
        this.dragElement.className = 'drag-ghost';
        this.dragElement.innerHTML = source.innerHTML;
        this.dragElement.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 1000;
            opacity: 0.9;
            font-size: 2rem;
            background: var(--color-primary, #FF9F1C);
            padding: 8px;
            border-radius: 8px;
        `;
        document.body.appendChild(this.dragElement);
    }

    findDropZone(x, y) {
        const zones = document.querySelectorAll(this.dropZoneSelector);
        for (const zone of zones) {
            const rect = zone.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && 
                y >= rect.top && y <= rect.bottom) {
                return zone;
            }
        }
        return null;
    }

    updateDropZones(x, y) {
        const zones = document.querySelectorAll(this.dropZoneSelector);
        zones.forEach(zone => {
            const rect = zone.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && 
                y >= rect.top && y <= rect.bottom) {
                zone.classList.add('drag-over');
            } else {
                zone.classList.remove('drag-over');
            }
        });
    }

    clearDropZoneHighlights() {
        document.querySelectorAll('.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
    }
}
