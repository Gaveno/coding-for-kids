/**
 * Grid - Handles grid state (nest, leaves, obstacles, crumbs, tunnels) and rendering
 */
export class Grid {
    constructor(levelData) {
        this.configure(levelData);
    }

    configure(levelData) {
        this.size = levelData.gridSize;
        this.nest = levelData.nest;
        this.tunnels = levelData.tunnels ? [...levelData.tunnels] : [];
        this.totalLeaves = (levelData.leaves || []).length;
        this.reset(levelData);
    }

    reset(levelData) {
        this.leaves = new Set(levelData.leaves || []);
        this.obstacles = new Set(levelData.obstacles || []);
        this.crumbs = new Set(levelData.crumbs || []);
        this.totalCrumbs = this.crumbs.size;
        this.crumbsCollected = 0;
        this.delivered = 0;
    }

    isNest(key) { return this.nest === key; }
    hasLeaf(key) { return this.leaves.has(key); }
    removeLeaf(key) { return this.leaves.delete(key); }
    addLeaf(key) { this.leaves.add(key); }
    deliverLeaf() { this.delivered++; }
    hasObstacle(key) { return this.obstacles.has(key); }
    hasCrumb(key) { return this.crumbs.has(key); }

    collectCrumb(key) {
        if (!this.crumbs.delete(key)) return false;
        this.crumbsCollected++;
        return true;
    }

    /** If key is one end of the tunnel pair, returns the other end */
    tunnelExit(key) {
        if (this.tunnels.length !== 2) return null;
        if (this.tunnels[0] === key) return this.tunnels[1];
        if (this.tunnels[1] === key) return this.tunnels[0];
        return null;
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
                if (this.tunnels.includes(key)) {
                    cell.classList.add('tunnel');
                    const hole = document.createElement('div');
                    hole.className = 'tunnel-hole';
                    cell.appendChild(hole);
                }
                if (this.hasLeaf(key)) {
                    const leaf = document.createElement('span');
                    leaf.className = 'cell-leaf';
                    leaf.textContent = '🥬';
                    cell.appendChild(leaf);
                }
                if (this.hasCrumb(key)) {
                    const crumb = document.createElement('span');
                    crumb.className = 'crumb-emoji';
                    crumb.textContent = '🍪';
                    cell.appendChild(crumb);
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
        // The overlay is positioned from the container's padding box, so
        // discount the container border to keep the ant centered in its cell.
        const cs = getComputedStyle(container);
        const borderLeft = parseFloat(cs.borderLeftWidth) || 0;
        const borderTop = parseFloat(cs.borderTopWidth) || 0;
        return {
            left: cellRect.left - containerRect.left - borderLeft + cellRect.width / 2,
            top: cellRect.top - containerRect.top - borderTop + cellRect.height / 2,
            width: cellRect.width,
            height: cellRect.height
        };
    }
}
