/**
 * Levels - Level definitions for Magic Garden
 * 
 * Level format:
 * {
 *   id: number,
 *   target: string (plant emoji),
 *   supply: Object (action emoji -> count available)
 * }
 * 
 * Supply system: Each level gives EXACT actions needed to solve,
 * so player just needs to figure out the correct ORDER.
 */
import { ACTIONS, PLANTS } from './Plants.js';

export const LEVELS = [
    // Phase 1: Basic Sequencing - Learn that order matters
    
    // Level 1: Tulip (seed + water + sun)
    {
        id: 1,
        target: '🌷',
        supply: {
            [ACTIONS.SEED]: 1,
            [ACTIONS.WATER]: 1,
            [ACTIONS.SUN]: 1
        }
    },
    
    // Level 2: Sunflower (seed + sun + water) - same ingredients, different order!
    {
        id: 2,
        target: '🌻',
        supply: {
            [ACTIONS.SEED]: 1,
            [ACTIONS.WATER]: 1,
            [ACTIONS.SUN]: 1
        }
    },
    
    // Level 3: Rose (seed + water + water + sun) - needs 2 waters
    {
        id: 3,
        target: '🌹',
        supply: {
            [ACTIONS.SEED]: 1,
            [ACTIONS.WATER]: 2,
            [ACTIONS.SUN]: 1
        }
    },
    
    // Level 4: Daisy (seed + sun + water + water)
    {
        id: 4,
        target: '🌼',
        supply: {
            [ACTIONS.SEED]: 1,
            [ACTIONS.WATER]: 2,
            [ACTIONS.SUN]: 1
        }
    },
    
    // Level 5: Clover (seed + water + water + water) - all water!
    {
        id: 5,
        target: '🍀',
        supply: {
            [ACTIONS.SEED]: 1,
            [ACTIONS.WATER]: 3
        }
    },
    
    // Level 6: Cactus (seed + sun + sun + sun) - all sun!
    {
        id: 6,
        target: '🌵',
        supply: {
            [ACTIONS.SEED]: 1,
            [ACTIONS.SUN]: 3
        }
    },
    
    // Level 7: Wheat (seed + sun + sun + water)
    {
        id: 7,
        target: '🌾',
        supply: {
            [ACTIONS.SEED]: 1,
            [ACTIONS.WATER]: 1,
            [ACTIONS.SUN]: 2
        }
    },
    
    // Phase 2: Introduce Music
    
    // Level 8: Cherry Blossom (seed + water + sun + music)
    {
        id: 8,
        target: '🌸',
        supply: {
            [ACTIONS.SEED]: 1,
            [ACTIONS.WATER]: 1,
            [ACTIONS.SUN]: 1,
            [ACTIONS.MUSIC]: 1
        }
    },
    
    // Level 9: Hyacinth (seed + water + music + sun)
    {
        id: 9,
        target: '🪻',
        supply: {
            [ACTIONS.SEED]: 1,
            [ACTIONS.WATER]: 1,
            [ACTIONS.SUN]: 1,
            [ACTIONS.MUSIC]: 1
        }
    },
    
    // Level 10: Lotus (seed + water + water + music)
    {
        id: 10,
        target: '🪷',
        supply: {
            [ACTIONS.SEED]: 1,
            [ACTIONS.WATER]: 2,
            [ACTIONS.MUSIC]: 1
        }
    },
    
    // Phase 3: Introduce Magic
    
    // Level 11: Hibiscus (seed + water + sun + magic)
    {
        id: 11,
        target: '🌺',
        supply: {
            [ACTIONS.SEED]: 1,
            [ACTIONS.WATER]: 1,
            [ACTIONS.SUN]: 1,
            [ACTIONS.MAGIC]: 1
        }
    },
    
    // Level 12: Bouquet - the grand finale (seed + water + sun + music + magic)
    {
        id: 12,
        target: '💐',
        supply: {
            [ACTIONS.SEED]: 1,
            [ACTIONS.WATER]: 1,
            [ACTIONS.SUN]: 1,
            [ACTIONS.MUSIC]: 1,
            [ACTIONS.MAGIC]: 1
        }
    }
];

/**
 * Get a level by number (1-indexed)
 * @param {number} levelNum - Level number
 * @returns {Object} Level object
 */
export function getLevel(levelNum) {
    const clamped = Math.max(1, Math.min(levelNum, LEVELS.length));
    return LEVELS[clamped - 1];
}

/**
 * Get total number of levels
 * @returns {number} Total level count
 */
export function getTotalLevels() {
    return LEVELS.length;
}

/**
 * Validate a level configuration
 * @param {Object} level - Level object
 * @returns {boolean} True if valid
 */
export function validateLevel(level) {
    if (!level.id || !level.target || !level.supply) {
        return false;
    }
    
    // Check target is a known plant
    const targetPlant = PLANTS.find(p => p.emoji === level.target);
    if (!targetPlant) {
        return false;
    }
    
    // Check supply includes seed
    if (!level.supply[ACTIONS.SEED] || level.supply[ACTIONS.SEED] < 1) {
        return false;
    }
    
    // Check recipe can be made with supply
    const recipe = targetPlant.recipe;
    const supplyCopy = { ...level.supply };
    
    // Use seed first
    supplyCopy[ACTIONS.SEED]--;
    
    // Check each recipe action
    for (const action of recipe) {
        if (!supplyCopy[action] || supplyCopy[action] < 1) {
            return false;
        }
        supplyCopy[action]--;
    }
    
    return true;
}

/**
 * Get available actions from supply (actions with count > 0)
 * @param {Object} supply - Supply object
 * @returns {string[]} Array of action emojis
 */
export function getAvailableActions(supply) {
    return Object.entries(supply)
        .filter(([_, count]) => count > 0)
        .map(([action, _]) => action);
}
