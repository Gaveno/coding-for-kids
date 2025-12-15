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
     * @param {Object} durations - { melody: number, bass: number, percussion: number }
     */
    dance(playing, durations = {}) {
        // Main character dances on bass
        if (playing.bass) {
            const isExtended = (durations.bass || 1) > 1;
            this.triggerDance(this.main, isExtended);
        }
        
        // Left character dances on melody
        if (playing.melody) {
            const isExtended = (durations.melody || 1) > 1;
            this.triggerDance(this.left, isExtended);
        }
        
        // Right character dances on percussion
        if (playing.percussion) {
            this.triggerDance(this.right, false); // Percussion doesn't have duration
        }
    }

    /**
     * Trigger dance animation on a character
     * @param {HTMLElement} element - Character element
     * @param {boolean} spin - Whether to use spinning animation for extended notes
     */
    triggerDance(element, spin = false) {
        element.classList.remove('idle');
        element.classList.remove('dancing');
        element.classList.remove('spinning');
        
        // Force reflow to restart animation
        void element.offsetWidth;
        
        if (spin) {
            element.classList.add('spinning');
        } else {
            element.classList.add('dancing');
        }
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
            el.className = el.className.replace(/\s*(dancing|celebrate|spinning)\s*/g, ' ');
        });
        this.setIdle(true);
    }
}

window.Character = Character;
