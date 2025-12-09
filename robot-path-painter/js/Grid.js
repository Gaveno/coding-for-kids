/**
 * Grid class - Manages grid state and rendering
 * Single responsibility: Handle grid cells, painting, obstacles, and target tracking
 */
export class Grid {
    constructor(size, targetCells = [], obstacles = []) {
        this.size = size;
        this.targetCells = new Set(targetCells);
        this.paintedCells = new Set();
        this.obstacles = new Set(obstacles);
    }

    /**
     * Paint a cell at the given coordinates
     * @param {string} positionKey - Cell position as "x,y"
     */
    paintCell(positionKey) {
        this.paintedCells.add(positionKey);
    }

    /**
     * Check if a cell is painted
     * @param {string} positionKey - Cell position as "x,y"
     * @returns {boolean}
     */
    isPainted(positionKey) {
        return this.paintedCells.has(positionKey);
    }

    /**
     * Check if a cell is a target
     * @param {string} positionKey - Cell position as "x,y"
     * @returns {boolean}
     */
    isTarget(positionKey) {
        return this.targetCells.has(positionKey);
    }

    /**
     * Check if a cell has an obstacle
     * @param {string} positionKey - Cell position as "x,y"
     * @returns {boolean}
     */
    hasObstacle(positionKey) {
        return this.obstacles.has(positionKey);
    }

    /**
     * Remove an obstacle from the grid
     * @param {string} positionKey - Cell position as "x,y"
     * @returns {boolean} True if obstacle was removed
     */
    removeObstacle(positionKey) {
        return this.obstacles.delete(positionKey);
    }

    /**
     * Check if all target cells are painted
     * @returns {boolean}
     */
    allTargetsPainted() {
        for (const target of this.targetCells) {
            if (!this.paintedCells.has(target)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get count of painted targets
     * @returns {object} { painted, total }
     */
    getProgress() {
        let painted = 0;
        for (const target of this.targetCells) {
            if (this.paintedCells.has(target)) {
                painted++;
            }
        }
        return {
            painted,
            total: this.targetCells.size
        };
    }

    /**
     * Clear all painted cells
     */
    clearPaint() {
        this.paintedCells.clear();
    }

    /**
     * Update grid configuration
     * @param {number} size - New grid size
     * @param {string[]} targets - New target cells
     * @param {string[]} obstacles - Obstacle cell positions
     */
    configure(size, targets, obstacles = []) {
        this.size = size;
        this.targetCells = new Set(targets);
        this.paintedCells.clear();
        this.obstacles = new Set(obstacles);
    }

    /**
     * Reset obstacles to initial state
     * @param {string[]} obstacles - Initial obstacle positions
     */
    resetObstacles(obstacles = []) {
        this.obstacles = new Set(obstacles);
    }

    /**
     * Render grid to a container element
     * @param {HTMLElement} container - DOM container for grid
     * @param {object} robotPosition - Current robot position {x, y}
     * @returns {void}
     */
    render(container, robotPosition) {
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;

                const key = `${x},${y}`;

                if (this.isTarget(key)) {
                    cell.classList.add('target');
                }

                if (this.isPainted(key)) {
                    cell.classList.add('painted');
                }

                if (this.hasObstacle(key)) {
                    cell.classList.add('obstacle');
                    const obstacle = document.createElement('span');
                    obstacle.className = 'obstacle-emoji';
                    obstacle.textContent = '🪨';
                    cell.appendChild(obstacle);
                }

                if (x === robotPosition.x && y === robotPosition.y) {
                    cell.classList.add('robot');
                    const robot = document.createElement('span');
                    robot.className = 'robot-emoji';
                    robot.textContent = '🤖';
                    cell.appendChild(robot);
                }

                container.appendChild(cell);
            }
        }
    }
}
