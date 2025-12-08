/**
 * Character.js - Manages the dancing character
 */
class Character {
    constructor(element) {
        this.element = element;
        this.dances = ['jump', 'spin', 'wiggle', 'bounce', 'sway', 'wave'];
        this.colorToDance = {
            'red': 'jump',
            'orange': 'spin',
            'yellow': 'wiggle',
            'green': 'bounce',
            'blue': 'sway',
            'purple': 'wave'
        };
        this.isAnimating = false;
        
        // Start with idle animation
        this.setIdle(true);
    }

    /**
     * Perform a dance move based on color
     * @param {string} color - Color of the note
     * @returns {Promise} - Resolves when animation completes
     */
    dance(color) {
        return new Promise((resolve) => {
            if (this.isAnimating) {
                resolve();
                return;
            }

            this.isAnimating = true;
            this.setIdle(false);

            const danceMove = this.colorToDance[color] || 'jump';
            const className = `dance-${danceMove}`;

            this.element.classList.add(className);

            // Remove class after animation completes
            setTimeout(() => {
                this.element.classList.remove(className);
                this.isAnimating = false;
                resolve();
            }, 400);
        });
    }

    /**
     * Play celebration animation
     */
    celebrate() {
        this.setIdle(false);
        this.element.classList.add('celebrate');
        
        setTimeout(() => {
            this.element.classList.remove('celebrate');
            this.setIdle(true);
        }, 800);
    }

    /**
     * Set idle animation state
     * @param {boolean} idle - Whether to show idle animation
     */
    setIdle(idle) {
        if (idle) {
            this.element.classList.add('idle');
        } else {
            this.element.classList.remove('idle');
        }
    }

    /**
     * Reset character to initial state
     */
    reset() {
        this.isAnimating = false;
        this.element.className = 'character';
        this.setIdle(true);
    }
}

// Export for use in other modules
window.Character = Character;
