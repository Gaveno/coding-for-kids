/**
 * Level definitions for Robot Path Painter
 * Each level introduces new complexity and teaches different patterns
 */

export const LEVELS = [
    // Level 1: Simple - move right twice
    {
        gridSize: 5,
        start: { x: 0, y: 2 },
        targets: ['1,2', '2,2']
    },
    // Level 2: Move in an L shape
    {
        gridSize: 5,
        start: { x: 0, y: 0 },
        targets: ['1,0', '2,0', '2,1', '2,2']
    },
    // Level 3: Zigzag pattern
    {
        gridSize: 5,
        start: { x: 0, y: 2 },
        targets: ['1,2', '1,1', '2,1', '2,2', '3,2']
    },
    // Level 4: Draw a square (introduces need for functions)
    {
        gridSize: 5,
        start: { x: 1, y: 1 },
        targets: ['2,1', '3,1', '3,2', '3,3', '2,3', '1,3', '1,2']
    },
    // Level 5: Bigger pattern - rectangle border
    {
        gridSize: 6,
        start: { x: 0, y: 0 },
        targets: ['1,0', '2,0', '3,0', '4,0', '4,1', '4,2', '4,3', '4,4', '3,4', '2,4', '1,4', '0,4', '0,3', '0,2', '0,1']
    },
    // Level 6: Steps pattern
    {
        gridSize: 6,
        start: { x: 0, y: 5 },
        targets: ['0,4', '1,4', '1,3', '2,3', '2,2', '3,2', '3,1', '4,1', '4,0', '5,0']
    },
    // Level 7: Cross pattern
    {
        gridSize: 7,
        start: { x: 3, y: 0 },
        targets: ['3,1', '3,2', '3,3', '3,4', '3,5', '3,6', '0,3', '1,3', '2,3', '4,3', '5,3', '6,3']
    },
    // Level 8: Spiral start
    {
        gridSize: 7,
        start: { x: 0, y: 0 },
        targets: [
            '1,0', '2,0', '3,0', '4,0', '5,0', '6,0',
            '6,1', '6,2', '6,3', '6,4', '6,5', '6,6',
            '5,6', '4,6', '3,6', '2,6', '1,6', '0,6',
            '0,5', '0,4', '0,3', '0,2', '0,1'
        ]
    }
];

/**
 * Get level data by level number (1-indexed)
 * @param {number} levelNum - Level number (starts at 1)
 * @returns {object} Level configuration
 */
export function getLevel(levelNum) {
    const index = Math.min(levelNum - 1, LEVELS.length - 1);
    return { ...LEVELS[Math.max(0, index)] };
}

/**
 * Get total number of levels
 * @returns {number}
 */
export function getTotalLevels() {
    return LEVELS.length;
}

/**
 * Validate that a level configuration is valid
 * @param {object} level - Level config to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateLevel(level) {
    const errors = [];

    // Check start position
    if (level.start.x < 0 || level.start.x >= level.gridSize) {
        errors.push('Start X position is out of bounds');
    }
    if (level.start.y < 0 || level.start.y >= level.gridSize) {
        errors.push('Start Y position is out of bounds');
    }

    // Check all targets are within bounds
    level.targets.forEach((target, i) => {
        const [x, y] = target.split(',').map(Number);
        if (x < 0 || x >= level.gridSize || y < 0 || y >= level.gridSize) {
            errors.push(`Target ${i} (${target}) is out of bounds`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}
