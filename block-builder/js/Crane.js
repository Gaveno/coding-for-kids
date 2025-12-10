/**
 * Crane - Handles crane position, hook state, and held block
 * 
 * The crane moves horizontally along a rail spanning supply and build areas.
 * It has a hook that can be lowered/raised to grab and place blocks.
 */
export class Crane {
    // Hook states
    static HOOK_RAISED = 'raised';
    static HOOK_LOWERING = 'lowering';
    static HOOK_LOWERED = 'lowered';
    static HOOK_RAISING = 'raising';

    /**
     * @param {number} totalColumns - Total columns (supply + build)
     * @param {number} supplyColumns - Number of supply columns
     * @param {number} startColumn - Starting column index
     */
    constructor(totalColumns, supplyColumns = 3, startColumn = 0) {
        this.totalColumns = totalColumns;
        this.supplyColumns = supplyColumns;
        this.startColumn = startColumn;
        this.column = startColumn;
        this.hookState = Crane.HOOK_RAISED;
        this.heldBlock = null;
        this.hookDepth = 0; // 0 = raised, positive = depth in rows
    }

    /**
     * Move crane one column left
     * @returns {boolean} True if move succeeded
     */
    moveLeft() {
        if (this.column <= 0) {
            return false;
        }
        if (this.hookState !== Crane.HOOK_RAISED) {
            return false; // Can't move with hook lowered
        }
        this.column--;
        return true;
    }

    /**
     * Move crane one column right
     * @returns {boolean} True if move succeeded
     */
    moveRight() {
        if (this.column >= this.totalColumns - 1) {
            return false;
        }
        if (this.hookState !== Crane.HOOK_RAISED) {
            return false; // Can't move with hook lowered
        }
        this.column++;
        return true;
    }

    /**
     * Start lowering the hook
     * @returns {boolean} True if can start lowering
     */
    startLower() {
        if (this.hookState !== Crane.HOOK_RAISED) {
            return false;
        }
        this.hookState = Crane.HOOK_LOWERING;
        return true;
    }

    /**
     * Complete the lower action - hook is now at bottom
     * @param {number} depth - How deep the hook went (in rows)
     */
    completeLower(depth) {
        this.hookState = Crane.HOOK_LOWERED;
        this.hookDepth = depth;
    }

    /**
     * Start raising the hook
     * @returns {boolean} True if can start raising
     */
    startRaise() {
        if (this.hookState !== Crane.HOOK_LOWERED) {
            return false;
        }
        this.hookState = Crane.HOOK_RAISING;
        return true;
    }

    /**
     * Complete the raise action - hook is now at top
     */
    completeRaise() {
        this.hookState = Crane.HOOK_RAISED;
        this.hookDepth = 0;
    }

    /**
     * Attach a block to the hook
     * @param {string} blockType - Type of block (emoji)
     * @returns {boolean} True if block was attached
     */
    grabBlock(blockType) {
        if (this.heldBlock !== null) {
            return false;
        }
        this.heldBlock = blockType;
        return true;
    }

    /**
     * Release the held block
     * @returns {string|null} The released block type, or null
     */
    releaseBlock() {
        const block = this.heldBlock;
        this.heldBlock = null;
        return block;
    }

    /**
     * Check if crane is holding a block
     * @returns {boolean} True if holding a block
     */
    isHolding() {
        return this.heldBlock !== null;
    }

    /**
     * Check if crane is over supply area
     * @returns {boolean} True if over supply columns
     */
    isOverSupply() {
        return this.column < this.supplyColumns;
    }

    /**
     * Check if crane is over build area
     * @returns {boolean} True if over build columns
     */
    isOverBuildArea() {
        return this.column >= this.supplyColumns;
    }

    /**
     * Get the build area column index (0-based within build area)
     * @returns {number} Build area column index, or -1 if not over build area
     */
    getBuildColumn() {
        if (!this.isOverBuildArea()) {
            return -1;
        }
        return this.column - this.supplyColumns;
    }

    /**
     * Get the supply column index (0-based within supply area)
     * @returns {number} Supply column index, or -1 if not over supply
     */
    getSupplyColumn() {
        if (!this.isOverSupply()) {
            return -1;
        }
        return this.column;
    }

    /**
     * Check if hook is fully raised
     * @returns {boolean} True if hook is raised
     */
    isHookRaised() {
        return this.hookState === Crane.HOOK_RAISED;
    }

    /**
     * Check if hook is fully lowered
     * @returns {boolean} True if hook is lowered
     */
    isHookLowered() {
        return this.hookState === Crane.HOOK_LOWERED;
    }

    /**
     * Reset crane to initial state
     */
    reset() {
        this.column = this.startColumn;
        this.hookState = Crane.HOOK_RAISED;
        this.heldBlock = null;
        this.hookDepth = 0;
    }

    /**
     * Get current state for debugging/display
     * @returns {Object} Current crane state
     */
    getState() {
        return {
            column: this.column,
            hookState: this.hookState,
            hookDepth: this.hookDepth,
            heldBlock: this.heldBlock,
            isOverSupply: this.isOverSupply(),
            isOverBuildArea: this.isOverBuildArea()
        };
    }
}
