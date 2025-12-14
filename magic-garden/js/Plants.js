/**
 * Plants - Recipe system and plant database for Magic Garden
 * 
 * Defines all discoverable plants and their recipes.
 * A recipe is a sequence of actions (after the seed) that produces a plant.
 */

// All available actions
export const ACTIONS = {
    SEED: '🌱',
    WATER: '💧',
    SUN: '☀️',
    MUSIC: '🎵',
    MAGIC: '✨'
};

// Plant database with recipes
// Recipe format: array of actions AFTER the seed
export const PLANTS = [
    { emoji: '🌷', name: 'tulip', recipe: ['💧', '☀️'] },
    { emoji: '🌻', name: 'sunflower', recipe: ['☀️', '💧'] },
    { emoji: '🌹', name: 'rose', recipe: ['💧', '💧', '☀️'] },
    { emoji: '🌸', name: 'cherry-blossom', recipe: ['💧', '☀️', '🎵'] },
    { emoji: '🌺', name: 'hibiscus', recipe: ['💧', '☀️', '✨'] },
    { emoji: '🍀', name: 'clover', recipe: ['💧', '💧', '💧'] },
    { emoji: '🌵', name: 'cactus', recipe: ['☀️', '☀️', '☀️'] },
    { emoji: '🪻', name: 'hyacinth', recipe: ['💧', '🎵', '☀️'] },
    { emoji: '🌼', name: 'daisy', recipe: ['☀️', '💧', '💧'] },
    { emoji: '💐', name: 'bouquet', recipe: ['💧', '☀️', '🎵', '✨'] },
    { emoji: '🪷', name: 'lotus', recipe: ['💧', '💧', '🎵'] },
    { emoji: '🌾', name: 'wheat', recipe: ['☀️', '☀️', '💧'] }
];

// Wilted plant for failed recipes
export const WILTED = { emoji: '🥀', name: 'wilted' };

/**
 * Convert action sequence to recipe string for comparison
 * @param {string[]} actions - Array of action emojis
 * @returns {string} Recipe string
 */
export function recipeToString(actions) {
    return actions.join(',');
}

/**
 * Get the plant that matches a recipe
 * @param {string[]} actions - Full action sequence including seed
 * @returns {Object|null} Plant object or null if no match
 */
export function getPlantForRecipe(actions) {
    // Must start with seed
    if (!actions.length || actions[0] !== ACTIONS.SEED) {
        return null;
    }
    
    // Get actions after seed
    const recipe = actions.slice(1);
    
    // Empty recipe after seed = nothing
    if (recipe.length === 0) {
        return null;
    }
    
    // Find matching plant
    const recipeStr = recipeToString(recipe);
    const plant = PLANTS.find(p => recipeToString(p.recipe) === recipeStr);
    
    return plant || WILTED;
}

/**
 * Check if a recipe produces a valid (non-wilted) plant
 * @param {string[]} actions - Full action sequence including seed
 * @returns {boolean} True if recipe produces a flower
 */
export function isValidRecipe(actions) {
    const plant = getPlantForRecipe(actions);
    return plant !== null && plant !== WILTED;
}

/**
 * Get all plants (for catalog/discovery features)
 * @returns {Object[]} Array of plant objects
 */
export function getAllPlants() {
    return [...PLANTS];
}

/**
 * Get plant by emoji
 * @param {string} emoji - Plant emoji
 * @returns {Object|null} Plant object or null
 */
export function getPlantByEmoji(emoji) {
    return PLANTS.find(p => p.emoji === emoji) || null;
}

/**
 * Get total number of discoverable plants
 * @returns {number} Total plant count
 */
export function getTotalPlants() {
    return PLANTS.length;
}
