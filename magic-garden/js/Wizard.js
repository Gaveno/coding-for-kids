/**
 * Wizard - Character animations for Magic Garden
 * 
 * Manages the wizard character that casts spells.
 */

export class Wizard {
    constructor(element) {
        this.element = element;
        this.isAnimating = false;
    }

    /**
     * Initialize the wizard
     */
    init() {
        this.render();
    }

    /**
     * Render wizard in default pose
     */
    render() {
        this.element.textContent = '🧙';
        this.element.classList.remove('casting', 'celebrating', 'puzzled');
    }

    /**
     * Animate wizard casting an action
     * @param {string} action - Action emoji being cast
     * @returns {Promise} Resolves when animation completes
     */
    async castAction(action) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        // Show casting animation
        this.element.classList.add('casting');
        
        // Brief delay for casting
        await this.delay(200);
        
        // Show the action being cast (wand effect)
        this.element.classList.remove('casting');
        this.isAnimating = false;
    }

    /**
     * Play celebration animation
     * @returns {Promise} Resolves when animation completes
     */
    async celebrate() {
        this.element.classList.add('celebrating');
        await this.delay(1000);
        this.element.classList.remove('celebrating');
    }

    /**
     * Play puzzled animation (for failed recipes)
     * @returns {Promise} Resolves when animation completes
     */
    async puzzled() {
        this.element.classList.add('puzzled');
        await this.delay(800);
        this.element.classList.remove('puzzled');
    }

    /**
     * Reset wizard to default state
     */
    reset() {
        this.isAnimating = false;
        this.render();
    }

    /**
     * Delay helper
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
