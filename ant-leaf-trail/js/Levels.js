/**
 * Levels - Level definitions and loading
 * Progression: straight walks -> counting steps -> turning -> obstacles ->
 * carrying leaves -> obstacles + leaves -> multiple leaf trips
 */
export const LEVELS = [
    // Level 1: Walk straight ahead to the nest
    { gridSize: 5, start: { x: 2, y: 4 }, heading: 'up', nest: '2,1' },
    // Level 2: Longer straight walk (learn the number on the block)
    { gridSize: 6, start: { x: 2, y: 5 }, heading: 'up', nest: '2,0' },
    // Level 3: First turn
    { gridSize: 5, start: { x: 0, y: 4 }, heading: 'up', nest: '3,1' },
    // Level 4: Two turns
    { gridSize: 6, start: { x: 0, y: 5 }, heading: 'up', nest: '3,1' },
    // Level 5: Rocks appear, but the straight path still works
    { gridSize: 5, start: { x: 0, y: 2 }, heading: 'right', nest: '4,2', obstacles: ['2,1', '2,3'] },
    // Level 6: A rock blocks the way - walk around it
    { gridSize: 5, start: { x: 0, y: 2 }, heading: 'right', nest: '4,2', obstacles: ['2,2'] },
    // Level 7: Weave between several rocks
    { gridSize: 6, start: { x: 0, y: 3 }, heading: 'right', nest: '5,3', obstacles: ['2,2', '2,3', '4,3', '4,4'] },
    // Level 8: First leaf - pick it up on the way, drop it at the nest
    { gridSize: 5, start: { x: 2, y: 4 }, heading: 'up', nest: '2,0', leaves: ['2,2'] },
    // Level 9: Leaf, then a turn to reach the nest
    { gridSize: 6, start: { x: 0, y: 5 }, heading: 'up', nest: '4,2', leaves: ['0,2'] },
    // Level 10: Leaf plus rocks in the way
    { gridSize: 6, start: { x: 0, y: 3 }, heading: 'right', nest: '5,3', leaves: ['2,3'], obstacles: ['3,2', '3,3'] },
    // Level 11: Two leaves - deliver one, turn around, fetch the other
    { gridSize: 6, start: { x: 0, y: 3 }, heading: 'right', nest: '5,3', leaves: ['2,3', '4,3'] }
];

export function getLevel(levelNum) {
    const index = Math.min(levelNum - 1, LEVELS.length - 1);
    const level = LEVELS[Math.max(0, index)];
    return {
        ...level,
        leaves: level.leaves ? [...level.leaves] : [],
        obstacles: level.obstacles ? [...level.obstacles] : []
    };
}

export function getTotalLevels() {
    return LEVELS.length;
}

/**
 * Validate a level configuration
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateLevel(level) {
    const errors = [];
    const { gridSize, start, heading, nest, leaves = [], obstacles = [] } = level;

    const inBounds = (x, y) => x >= 0 && x < gridSize && y >= 0 && y < gridSize;
    const parse = (key) => key.split(',').map(Number);

    if (!inBounds(start.x, start.y)) {
        errors.push(`Start (${start.x},${start.y}) out of bounds for grid size ${gridSize}`);
    }
    if (!['up', 'right', 'down', 'left'].includes(heading)) {
        errors.push(`Invalid heading: ${heading}`);
    }

    const [nx, ny] = parse(nest);
    if (!inBounds(nx, ny)) {
        errors.push(`Nest ${nest} out of bounds for grid size ${gridSize}`);
    }

    const startKey = `${start.x},${start.y}`;
    if (nest === startKey) {
        errors.push('Nest is on the start position');
    }

    for (const obstacle of obstacles) {
        const [x, y] = parse(obstacle);
        if (!inBounds(x, y)) errors.push(`Obstacle ${obstacle} out of bounds`);
        if (obstacle === startKey) errors.push(`Obstacle on start position ${obstacle}`);
        if (obstacle === nest) errors.push(`Obstacle on nest ${obstacle}`);
    }

    for (const leaf of leaves) {
        const [x, y] = parse(leaf);
        if (!inBounds(x, y)) errors.push(`Leaf ${leaf} out of bounds`);
        if (obstacles.includes(leaf)) errors.push(`Leaf on obstacle ${leaf}`);
        if (leaf === nest) errors.push(`Leaf on nest ${leaf}`);
    }

    return { valid: errors.length === 0, errors };
}
