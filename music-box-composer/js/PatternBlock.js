/**
 * PatternBlock.js - Pattern block overlay renderer
 * Displays semi-transparent overlay for pattern placements in main timeline
 */

class PatternBlock {
    constructor(placement, pattern, timeline) {
        this.placement = placement; // { placementId, patternId, startBeat, noteIds }
        this.pattern = pattern;
        this.timeline = timeline;
        this.element = null;
        
        this.render();
    }

    /**
     * Render pattern block overlay
     */
    render() {
        // Create overlay element
        this.element = document.createElement('div');
        this.element.className = 'pattern-block-overlay';
        this.element.dataset.placementId = this.placement.placementId;
        this.element.style.backgroundColor = this.pattern.color;
        
        // Calculate position and size from CSS variable
        const style = getComputedStyle(document.documentElement);
        const cellSize = parseInt(style.getPropertyValue('--cell-size')) || 44;
        const trackLabelWidth = parseInt(style.getPropertyValue('--track-label-width')) || 36;
        const trackCount = 3;
        const beatMarkersHeight = 21; // 20px height + 1px border
        
        // Account for track label width offset and beat markers height
        const left = trackLabelWidth + (this.placement.startBeat * cellSize);
        const width = this.pattern.length * cellSize;
        // Account for borders between tracks (1px each, minus 1 since last track has no border)
        const height = (trackCount * cellSize) + (trackCount - 1);
        
        this.element.style.left = `${left}px`;
        this.element.style.top = `${beatMarkersHeight}px`;
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height}px`;
        
        // Add icon and delete button as footer below the tracks
        this.element.innerHTML = `
            <div class="pattern-block-footer">
                <span class="pattern-block-icon">${this.pattern.icon}</span>
                <button class="pattern-block-delete" aria-label="Delete Pattern">
                    🗑️
                </button>
            </div>
        `;
        
        // Attach delete handler
        const deleteBtn = this.element.querySelector('.pattern-block-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.remove();
        });
        
        return this.element;
    }

    /**
     * Update position if pattern placement changes
     */
    updatePosition(startBeat) {
        const style = getComputedStyle(document.documentElement);
        const cellSize = parseInt(style.getPropertyValue('--cell-size')) || 44;
        const trackLabelWidth = parseInt(style.getPropertyValue('--track-label-width')) || 36;
        const left = trackLabelWidth + (startBeat * cellSize);
        this.element.style.left = `${left}px`;
        this.placement.startBeat = startBeat;
    }

    /**
     * Remove pattern block and all associated notes
     */
    remove() {
        // Trigger removal callback
        if (this.onRemove) {
            this.onRemove(this.placement.placementId);
        }
        
        // Remove DOM element
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    /**
     * Get pattern block element
     */
    getElement() {
        return this.element;
    }

    /**
     * Check if a beat is within this pattern's range
     */
    containsBeat(beat) {
        return beat >= this.placement.startBeat && 
               beat < this.placement.startBeat + this.pattern.length;
    }

    /**
     * Check if this pattern overlaps with another beat range
     */
    overlaps(startBeat, length) {
        const thisEnd = this.placement.startBeat + this.pattern.length;
        const otherEnd = startBeat + length;
        
        return !(otherEnd <= this.placement.startBeat || startBeat >= thisEnd);
    }
}
