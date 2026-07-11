/**
 * Hud - Leaf tracker, floating feedback, and the success overlay contents
 */
export class Hud {
    constructor(elements) {
        this.elements = elements;
    }

    updateLeafTracker(grid) {
        const tracker = this.elements.leafTracker;
        tracker.innerHTML = '';
        for (let i = 0; i < grid.totalLeaves; i++) {
            const leaf = document.createElement('span');
            leaf.textContent = '🥬';
            leaf.className = 'tracker-leaf' + (i < grid.delivered ? ' delivered' : '');
            tracker.appendChild(leaf);
        }
    }

    showFeedback(emoji) {
        const feedback = document.createElement('div');
        feedback.className = 'floating-feedback';
        feedback.textContent = emoji;
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 800);
    }

    /**
     * Fill the success overlay.
     * @param {number} stars - 0 hides the star row (sandbox mode)
     * @param {object} grid - For crumb counts
     */
    fillSuccess(stars, grid) {
        const starsEl = this.elements.successStars;
        starsEl.innerHTML = '';
        if (stars > 0) {
            for (let i = 0; i < 3; i++) {
                const star = document.createElement('span');
                star.className = 'success-star' + (i < stars ? ' earned' : '');
                star.textContent = i < stars ? '⭐' : '☆';
                star.style.animationDelay = `${0.2 + i * 0.25}s`;
                starsEl.appendChild(star);
            }
        }

        const crumbsEl = this.elements.successCrumbs;
        crumbsEl.innerHTML = '';
        if (grid.totalCrumbs > 0) {
            crumbsEl.textContent = '🍪'.repeat(grid.crumbsCollected) +
                '⚪'.repeat(grid.totalCrumbs - grid.crumbsCollected);
        }
    }
}
