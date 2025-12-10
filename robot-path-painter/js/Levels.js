/**
 * Levels - Level definitions and loading
 */
export const LEVELS = [
    // Level 1: Simple horizontal line (intro - no obstacles)
    { gridSize: 5, start: { x: 0, y: 2 }, targets: ['1,2', '2,2'] },
    // Level 2: L-shape (learning turns - no obstacles)
    { gridSize: 5, start: { x: 0, y: 0 }, targets: ['1,0', '2,0', '2,1', '2,2'] },
    // Level 3: Intro to obstacles - rock visible but doesn't block path
    { gridSize: 5, start: { x: 0, y: 2 }, targets: ['1,2', '2,2', '3,2'], obstacles: ['2,1'] },
    // Level 4: Navigate around obstacles
    { gridSize: 5, start: { x: 0, y: 2 }, targets: ['1,2', '1,1', '2,1', '2,2', '3,2'], obstacles: ['0,1', '3,1'] },
    // Level 5: More obstacles to navigate around
    { gridSize: 5, start: { x: 1, y: 1 }, targets: ['2,1', '3,1', '3,2', '3,3', '2,3', '1,3', '1,2'], obstacles: ['2,2', '0,2'] },
    // Level 6: First REQUIRED shooting - obstacle blocks the only path
    { gridSize: 5, start: { x: 0, y: 2 }, targets: ['1,2', '2,2', '3,2', '4,2'], obstacles: ['2,2'] },
    // Level 7: Larger grid perimeter
    { gridSize: 6, start: { x: 0, y: 0 }, targets: ['1,0', '2,0', '3,0', '4,0', '4,1', '4,2', '4,3', '4,4', '3,4', '2,4', '1,4', '0,4', '0,3', '0,2', '0,1'] },
    // Level 8: Diagonal staircase
    { gridSize: 6, start: { x: 0, y: 5 }, targets: ['0,4', '1,4', '1,3', '2,3', '2,2', '3,2', '3,1', '4,1', '4,0', '5,0'] },
    // Level 9: Cross pattern - shoot obstacle in center
    { gridSize: 7, start: { x: 3, y: 0 }, targets: ['3,1', '3,2', '3,3', '3,4', '3,5', '3,6', '0,3', '1,3', '2,3', '4,3', '5,3', '6,3'], obstacles: ['3,3'] },
    // Level 10: Large perimeter
    { gridSize: 7, start: { x: 0, y: 0 }, targets: ['1,0', '2,0', '3,0', '4,0', '5,0', '6,0', '6,1', '6,2', '6,3', '6,4', '6,5', '6,6', '5,6', '4,6', '3,6', '2,6', '1,6', '0,6', '0,5', '0,4', '0,3', '0,2', '0,1'] },
    // Level 11: Shoot multiple obstacles
    { gridSize: 6, start: { x: 0, y: 2 }, targets: ['1,2', '2,2', '3,2', '4,2', '5,2'], obstacles: ['2,2', '4,2'] },
    // Level 12: Complex path with obstacles
    { gridSize: 6, start: { x: 0, y: 0 }, targets: ['1,0', '2,0', '3,0', '3,1', '3,2', '3,3', '3,4', '3,5'], obstacles: ['3,2', '2,3'] }
];

export function getLevel(levelNum) {
    const index = Math.min(levelNum - 1, LEVELS.length - 1);
    const level = LEVELS[Math.max(0, index)];
    return { 
        ...level,
        obstacles: level.obstacles ? [...level.obstacles] : []
    };
}

export function getTotalLevels() {
    return LEVELS.length;
}

/**
 * Validate a level configuration
 * @param {object} level - Level to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateLevel(level) {
    const errors = [];
    const { gridSize, start, targets, obstacles = [] } = level;

    // Check start position bounds
    if (start.x < 0 || start.x >= gridSize) {
        errors.push(`Start x (${start.x}) out of bounds for grid size ${gridSize}`);
    }
    if (start.y < 0 || start.y >= gridSize) {
        errors.push(`Start y (${start.y}) out of bounds for grid size ${gridSize}`);
    }

    // Check target positions
    for (const target of targets) {
        const [x, y] = target.split(',').map(Number);
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
            errors.push(`Target ${target} out of bounds for grid size ${gridSize}`);
        }
    }

    // Check obstacle positions
    const startKey = `${start.x},${start.y}`;
    for (const obstacle of obstacles) {
        const [x, y] = obstacle.split(',').map(Number);
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
            errors.push(`Obstacle ${obstacle} out of bounds for grid size ${gridSize}`);
        }
        if (obstacle === startKey) {
            errors.push(`Obstacle at start position ${obstacle}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
