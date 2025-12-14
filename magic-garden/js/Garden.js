/**
 * Garden - Pot and growth state management for Magic Garden
 * 
 * Manages the current plant growing in the pot.
 */
import { ACTIONS, getPlantForRecipe, WILTED } from './Plants.js';

// Growth stages for animation
export const GROWTH_STAGES = {
    EMPTY: 'empty',
    SEEDED: 'seeded',
    SPROUTING: 'sprouting',
    GROWING: 'growing',
    BLOOMING: 'blooming',
    WILTED: 'wilted'
};

export class Garden {
    constructor() {
        this.appliedActions = [];
        this.stage = GROWTH_STAGES.EMPTY;
        this.result = null;
    }

    /**
     * Reset the garden to empty state
     */
    reset() {
        this.appliedActions = [];
        this.stage = GROWTH_STAGES.EMPTY;
        this.result = null;
    }

    /**
     * Apply an action to the garden
     * @param {string} action - Action emoji
     * @returns {string} The new growth stage
     */
    applyAction(action) {
        this.appliedActions.push(action);
        
        // Update stage based on action count
        const count = this.appliedActions.length;
        
        if (action === ACTIONS.SEED && count === 1) {
            this.stage = GROWTH_STAGES.SEEDED;
        } else if (count === 2) {
            this.stage = GROWTH_STAGES.SPROUTING;
        } else if (count >= 3) {
            this.stage = GROWTH_STAGES.GROWING;
        }
        
        return this.stage;
    }

    /**
     * Finalize the plant growth and determine result
     * @returns {Object} The resulting plant or wilted
     */
    finalize() {
        const plant = getPlantForRecipe(this.appliedActions);
        
        if (plant && plant !== WILTED) {
            this.stage = GROWTH_STAGES.BLOOMING;
            this.result = plant;
        } else if (this.appliedActions.length > 0) {
            this.stage = GROWTH_STAGES.WILTED;
            this.result = WILTED;
        }
        
        return this.result;
    }

    /**
     * Get current growth stage
     * @returns {string} Current stage
     */
    getStage() {
        return this.stage;
    }

    /**
     * Get the final result plant
     * @returns {Object|null} Plant object or null if not finalized
     */
    getResult() {
        return this.result;
    }

    /**
     * Get all applied actions
     * @returns {string[]} Array of action emojis
     */
    getAppliedActions() {
        return [...this.appliedActions];
    }

    /**
     * Check if garden has any growth
     * @returns {boolean} True if not empty
     */
    hasGrowth() {
        return this.appliedActions.length > 0;
    }

    /**
     * Check if the result matches a target plant
     * @param {string} targetEmoji - Target plant emoji
     * @returns {boolean} True if matches
     */
    matchesTarget(targetEmoji) {
        return this.result && this.result.emoji === targetEmoji;
    }
}
