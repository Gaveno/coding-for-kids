/**
 * LevelMap - Full-screen level select: numbered nodes with earned stars,
 * locks for levels not yet reached, and a sandbox entry.
 */
export class LevelMap {
    constructor(elements, callbacks) {
        this.elements = elements;
        this.callbacks = callbacks;
        elements.closeMapBtn.addEventListener('click', () => this.close());
        elements.mapOverlay.addEventListener('click', (e) => {
            if (e.target === elements.mapOverlay) this.close();
        });
    }

    open(progress, totalLevels, currentLevel) {
        this.render(progress, totalLevels, currentLevel);
        this.elements.mapOverlay.classList.add('active');
    }

    close() {
        this.elements.mapOverlay.classList.remove('active');
    }

    render(progress, totalLevels, currentLevel) {
        const container = this.elements.mapNodes;
        container.innerHTML = '';

        for (let level = 1; level <= totalLevels; level++) {
            container.appendChild(this.buildNode(level, progress, currentLevel));
        }

        // Sandbox entry
        const sandbox = document.createElement('button');
        sandbox.className = 'map-node sandbox-node';
        sandbox.setAttribute('aria-label', 'Build your own level');
        sandbox.innerHTML = '<span class="map-node-num">🛠️</span>';
        sandbox.addEventListener('click', () => {
            this.close();
            this.callbacks.onSandbox();
        });
        container.appendChild(sandbox);
    }

    buildNode(level, progress, currentLevel) {
        const unlocked = progress.isUnlocked(level);
        const stars = progress.getStars(level);

        const node = document.createElement('button');
        node.className = 'map-node'
            + (unlocked ? '' : ' locked')
            + (level === currentLevel ? ' current' : '');
        node.setAttribute('aria-label', `Level ${level}`);
        node.disabled = !unlocked;

        const num = document.createElement('span');
        num.className = 'map-node-num';
        num.textContent = unlocked ? level : '🔒';
        node.appendChild(num);

        if (unlocked) {
            const starRow = document.createElement('span');
            starRow.className = 'map-node-stars';
            starRow.textContent = stars > 0
                ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars)
                : '···';
            node.appendChild(starRow);
            node.addEventListener('click', () => {
                this.close();
                this.callbacks.onSelect(level);
            });
        }
        return node;
    }
}
