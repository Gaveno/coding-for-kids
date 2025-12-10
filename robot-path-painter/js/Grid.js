/**
 * Grid - Handles grid state, rendering, and cell operations
 */
export class Grid {
    constructor(size, targetCells = [], obstacles = []) {
        this.size = size;
        this.targetCells = new Set(targetCells);
        this.paintedCells = new Set();
        this.obstacles = new Set(obstacles);
    }

    paintCell(positionKey) {
        this.paintedCells.add(positionKey);
    }

    isPainted(positionKey) {
        return this.paintedCells.has(positionKey);
    }

    isTarget(positionKey) {
        return this.targetCells.has(positionKey);
    }

    hasObstacle(positionKey) {
        return this.obstacles.has(positionKey);
    }

    removeObstacle(positionKey) {
        return this.obstacles.delete(positionKey);
    }

    resetObstacles(obstacles = []) {
        this.obstacles = new Set(obstacles);
    }

    allTargetsPainted() {
        for (const target of this.targetCells) {
            if (!this.paintedCells.has(target)) {
                return false;
            }
        }
        return true;
    }

    clearPaint() {
        this.paintedCells.clear();
    }

    configure(size, targets, obstacles = []) {
        this.size = size;
        this.targetCells = new Set(targets);
        this.paintedCells.clear();
        this.obstacles = new Set(obstacles);
    }

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

                container.appendChild(cell);
            }
        }
    }

    /**
     * Get cell position for smooth animations
     */
    getCellPosition(container, x, y) {
        const cell = container.querySelector(`[data-x="${x}"][data-y="${y}"]`);
        if (!cell) return null;
        const containerRect = container.getBoundingClientRect();
        const cellRect = cell.getBoundingClientRect();
        return {
            left: cellRect.left - containerRect.left + cellRect.width / 2,
            top: cellRect.top - containerRect.top + cellRect.height / 2,
            width: cellRect.width,
            height: cellRect.height
        };
    }
}
