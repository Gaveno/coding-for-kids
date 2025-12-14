/**
 * Character.js - Manages multiple dancing characters
 */
class Character {
    constructor(mainEl, leftEl, rightEl) {
        this.main = mainEl;
        this.left = leftEl;
        this.right = rightEl;
        
        this.setIdle(true);
    }

    /**
     * Make characters dance based on which tracks are playing
     * @param {Object} playing - { melody: bool, bass: bool, percussion: bool }
     */
    dance(playing) {
        // Main character dances on bass
        if (playing.bass) {
            this.triggerDance(this.main);
        }
        
        // Left character dances on melody
        if (playing.melody) {
            this.triggerDance(this.left);
        }
        
        // Right character dances on percussion
        if (playing.percussion) {
            this.triggerDance(this.right);
        }
    }

    /**
     * Trigger dance animation on a character
     * @param {HTMLElement} element - Character element
     */
    triggerDance(element) {
        element.classList.remove('idle');
        element.classList.remove('dancing');
        
        // Force reflow to restart animation
        void element.offsetWidth;
        
        element.classList.add('dancing');
    }

    /**
     * Play celebration animation
     */
    celebrate() {
        this.setIdle(false);
        
        [this.main, this.left, this.right].forEach(el => {
            el.classList.add('celebrate');
        });
        
        setTimeout(() => {
            [this.main, this.left, this.right].forEach(el => {
                el.classList.remove('celebrate');
            });
            this.setIdle(true);
        }, 800);
    }

    /**
     * Set idle animation state
     * @param {boolean} idle - Whether to show idle animation
     */
    setIdle(idle) {
        [this.main, this.left, this.right].forEach(el => {
            if (idle) {
                el.classList.add('idle');
                el.classList.remove('dancing');
            } else {
                el.classList.remove('idle');
            }
        });
    }

    /**
     * Reset characters to initial state
     */
    reset() {
        [this.main, this.left, this.right].forEach(el => {
            el.className = el.className.replace(/\s*(dancing|celebrate)\s*/g, ' ');
        });
        this.setIdle(true);
    }
}

window.Character = Character;
