/**
 * BuildArea - Grid for placing blocks and tracking targets
 * 
 * The build area is on the right side of the workspace.
 * Blocks are placed from the bottom up (gravity simulation).
 */
export class BuildArea {
    /**
     * @param {number} width - Number of columns
     * @param {number} height - Number of rows
     */
    constructor(width = 4, height = 4) {
        this.width = width;
        this.height = height;
        this.blocks = []; // Array of {x, y, type} - placed blocks
        this.targets = []; // Array of {x, y, type} - target positions
    }

    /**
     * Configure the build area with new dimensions and targets
     * @param {number} width - Number of columns
     * @param {number} height - Number of rows
     * @param {Array<Object>} targets - Array of {x, y, type} target positions
     */
    configure(width, height, targets = []) {
        this.width = width;
        this.height = height;
        this.blocks = [];
        this.targets = targets.map(t => ({ x: t.x, y: t.y, type: t.type || '🧱' }));
    }

    /**
     * Set target positions
     * @param {Array<Object>} targets - Array of {x, y, type}
     */
    setTargets(targets) {
        this.targets = targets.map(t => ({ x: t.x, y: t.y, type: t.type || '🧱' }));
    }

    /**
     * Check if position is a target
     * @param {number} x - Column
     * @param {number} y - Row
     * @returns {boolean} True if target position
     */
    isTarget(x, y) {
        return this.targets.some(t => t.x === x && t.y === y);
    }

    /**
     * Get the target block type at a position
     * @param {number} x - Column
     * @param {number} y - Row
     * @returns {string|null} Block type or null
     */
    getTargetType(x, y) {
        const target = this.targets.find(t => t.x === x && t.y === y);
        return target ? target.type : null;
    }

    /**
     * Check if position has a block
     * @param {number} x - Column
     * @param {number} y - Row
     * @returns {boolean} True if has block
     */
    hasBlock(x, y) {
        return this.blocks.some(b => b.x === x && b.y === y);
    }

    /**
     * Get the block at a position
     * @param {number} x - Column
     * @param {number} y - Row
     * @returns {Object|null} Block object or null
     */
    getBlock(x, y) {
        return this.blocks.find(b => b.x === x && b.y === y) || null;
    }

    /**
     * Get number of blocks in a column
     * @param {number} x - Column
     * @returns {number} Number of blocks
     */
    getColumnHeight(x) {
        return this.blocks.filter(b => b.x === x).length;
    }

    /**
     * Get the Y position for the next block in a column
     * @param {number} x - Column
     * @returns {number} Y position (from top, 0-indexed)
     */
    getNextY(x) {
        const columnHeight = this.getColumnHeight(x);
        // Y is from top, so full bottom row is height-1
        return this.height - 1 - columnHeight;
    }

    /**
     * Place a block in a column (stacks from bottom)
     * @param {number} x - Column
     * @param {string} blockType - Block type (emoji)
     * @returns {Object} Result with success, position, and optional reason
     */
    placeBlock(x, blockType = '🧱') {
        // Check bounds
        if (x < 0 || x >= this.width) {
            return { success: false, reason: 'out-of-bounds' };
        }

        // Find the y position (stack on existing blocks)
        const y = this.getNextY(x);

        // Check if column is full
        if (y < 0) {
            return { success: false, reason: 'column-full' };
        }

        this.blocks.push({ x, y, type: blockType });
        return { success: true, position: { x, y }, type: blockType };
    }

    /**
     * Get total number of placed blocks
     * @returns {number} Block count
     */
    getBlockCount() {
        return this.blocks.length;
    }

    /**
     * Check if a target is correctly filled (right block type)
     * @param {number} x - Column
     * @param {number} y - Row
     * @returns {boolean} True if target is correctly filled
     */
    isTargetMatched(x, y) {
        const target = this.targets.find(t => t.x === x && t.y === y);
        if (!target) return false;
        
        const block = this.getBlock(x, y);
        if (!block) return false;
        
        return block.type === target.type;
    }

    /**
     * Check if all targets are correctly filled
     * @returns {boolean} True if all targets matched
     */
    allTargetsMatched() {
        return this.targets.every(t => this.isTargetMatched(t.x, t.y));
    }

    /**
     * Get progress information
     * @returns {Object} {filled, total, matched}
     */
    getProgress() {
        const filled = this.targets.filter(t => this.hasBlock(t.x, t.y)).length;
        const matched = this.targets.filter(t => this.isTargetMatched(t.x, t.y)).length;
        return {
            filled,
            matched,
            total: this.targets.length
        };
    }

    /**
     * Clear all placed blocks
     */
    clear() {
        this.blocks = [];
    }

    /**
     * Reset to initial state (clears blocks, keeps targets)
     */
    reset() {
        this.blocks = [];
    }
}
