/**
 * Robot class - Manages robot state and movement
 * Single responsibility: Track robot position and handle movement logic
 */
export class Robot {
    constructor(startPosition) {
        this.startPosition = { ...startPosition };
        this.position = { ...startPosition };
    }

    /**
     * Move robot in specified direction
     * @param {string} direction - 'up', 'down', 'left', or 'right'
     * @returns {object} New position after move
     */
    move(direction) {
        const deltas = {
            'up': { x: 0, y: -1 },
            'down': { x: 0, y: 1 },
            'left': { x: -1, y: 0 },
            'right': { x: 1, y: 0 }
        };

        const delta = deltas[direction];
        if (delta) {
            this.position.x += delta.x;
            this.position.y += delta.y;
        }

        return { ...this.position };
    }

    /**
     * Check if robot is outside grid bounds
     * @param {number} gridSize - Size of the grid
     * @returns {boolean} True if robot is out of bounds
     */
    isOutOfBounds(gridSize) {
        return (
            this.position.x < 0 ||
            this.position.x >= gridSize ||
            this.position.y < 0 ||
            this.position.y >= gridSize
        );
    }

    /**
     * Get current position as coordinate string
     * @returns {string} Position as "x,y"
     */
    getPositionKey() {
        return `${this.position.x},${this.position.y}`;
    }

    /**
     * Reset robot to starting position
     */
    reset() {
        this.position = { ...this.startPosition };
    }

    /**
     * Update the starting position (for level changes)
     * @param {object} newStart - New starting position {x, y}
     */
    setStartPosition(newStart) {
        this.startPosition = { ...newStart };
        this.position = { ...newStart };
    }
}
