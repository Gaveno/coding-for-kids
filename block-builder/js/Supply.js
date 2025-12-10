/**
 * Supply - Manages the supply stacks of building materials
 * 
 * Supply stacks are on the left side of the workspace.
 * Each column holds a stack of blocks that can be picked up from the top.
 */
export class Supply {
    /**
     * @param {Object} config - Supply configuration
     * @param {Array<Array<string>>} config.columns - Array of columns, each containing block types from bottom to top
     */
    constructor(config = { columns: [] }) {
        // Deep copy to avoid mutation
        this.columns = config.columns.map(col => [...col]);
        this.initialColumns = config.columns.map(col => [...col]);
        this.columnCount = this.columns.length;
    }

    /**
     * Get the top block from a column without removing it
     * @param {number} columnIndex - Column index (0-based)
     * @returns {string|null} Block type or null if empty
     */
    peekTop(columnIndex) {
        if (columnIndex < 0 || columnIndex >= this.columnCount) {
            return null;
        }
        const column = this.columns[columnIndex];
        return column.length > 0 ? column[column.length - 1] : null;
    }

    /**
     * Remove and return the top block from a column
     * @param {number} columnIndex - Column index (0-based)
     * @returns {string|null} Block type or null if empty
     */
    takeTop(columnIndex) {
        if (columnIndex < 0 || columnIndex >= this.columnCount) {
            return null;
        }
        const column = this.columns[columnIndex];
        return column.length > 0 ? column.pop() : null;
    }

    /**
     * Get the height of a column (number of blocks)
     * @param {number} columnIndex - Column index (0-based)
     * @returns {number} Number of blocks in column
     */
    getColumnHeight(columnIndex) {
        if (columnIndex < 0 || columnIndex >= this.columnCount) {
            return 0;
        }
        return this.columns[columnIndex].length;
    }

    /**
     * Get all blocks in a column (bottom to top)
     * @param {number} columnIndex - Column index (0-based)
     * @returns {Array<string>} Array of block types
     */
    getColumn(columnIndex) {
        if (columnIndex < 0 || columnIndex >= this.columnCount) {
            return [];
        }
        return [...this.columns[columnIndex]];
    }

    /**
     * Check if a column is empty
     * @param {number} columnIndex - Column index (0-based)
     * @returns {boolean} True if column is empty
     */
    isColumnEmpty(columnIndex) {
        return this.getColumnHeight(columnIndex) === 0;
    }

    /**
     * Check if all supply columns are empty
     * @returns {boolean} True if all columns are empty
     */
    isEmpty() {
        return this.columns.every(col => col.length === 0);
    }

    /**
     * Get total number of blocks remaining
     * @returns {number} Total block count
     */
    getTotalBlocks() {
        return this.columns.reduce((sum, col) => sum + col.length, 0);
    }

    /**
     * Reset supply to initial state
     */
    reset() {
        this.columns = this.initialColumns.map(col => [...col]);
    }

    /**
     * Get the maximum height across all columns
     * @returns {number} Maximum column height
     */
    getMaxHeight() {
        return Math.max(...this.columns.map(col => col.length), 0);
    }

    /**
     * Check if crane position is over supply area
     * @param {number} craneColumn - Crane's current column
     * @returns {boolean} True if crane is over supply
     */
    isOverSupply(craneColumn) {
        return craneColumn >= 0 && craneColumn < this.columnCount;
    }
}
