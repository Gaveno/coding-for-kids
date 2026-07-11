/**
 * Grid - Handles grid state (nest, leaves, obstacles) and rendering
 */
export class Grid {
    constructor(size, nest, leaves = [], obstacles = []) {
        this.configure(size, nest, leaves, obstacles);
    }

    configure(size, nest, leaves = [], obstacles = []) {
        this.size = size;
        this.nest = nest;
        this.leaves = new Set(leaves);
        this.obstacles = new Set(obstacles);
        this.totalLeaves = leaves.length;
        this.delivered = 0;
    }

    reset(leaves = [], obstacles = []) {
        this.leaves = new Set(leaves);
        this.obstacles = new Set(obstacles);
        this.delivered = 0;
    }

    isNest(positionKey) {
        return this.nest === positionKey;
    }

    hasLeaf(positionKey) {
        return this.leaves.has(positionKey);
    }

    removeLeaf(positionKey) {
        return this.leaves.delete(positionKey);
    }

    addLeaf(positionKey) {
        this.leaves.add(positionKey);
    }

    deliverLeaf() {
        this.delivered++;
    }

    hasObstacle(positionKey) {
        return this.obstacles.has(positionKey);
    }

    allLeavesDelivered() {
        return this.delivered >= this.totalLeaves;
    }

    render(container) {
        container.querySelectorAll('.grid-cell').forEach(cell => cell.remove());
        container.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;

                const key = `${x},${y}`;

                if (this.isNest(key)) {
                    cell.classList.add('nest');
                    const hole = document.createElement('div');
                    hole.className = 'nest-hole';
                    cell.appendChild(hole);
                }
                if (this.hasLeaf(key)) {
                    const leaf = document.createElement('img');
                    leaf.className = 'cell-leaf';
                    leaf.src = '../art/leaf.png';
                    leaf.alt = 'Leaf';
                    cell.appendChild(leaf);
                }
                if (this.hasObstacle(key)) {
                    cell.classList.add('obstacle');
                    const rock = document.createElement('span');
                    rock.className = 'obstacle-emoji';
                    rock.textContent = '🪨';
                    cell.appendChild(rock);
                }

                container.appendChild(cell);
            }
        }
    }

    /** Get a cell's center position for smooth overlay animations */
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
