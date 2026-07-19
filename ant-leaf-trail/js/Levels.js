/**
 * Levels - Level definitions and loading
 * Progression: straight walks -> counting steps -> turning -> obstacles ->
 * leaves -> multiple trips -> patrol bug -> tunnels -> grand finale
 */
export const LEVELS = [
    // Level 1: Walk straight ahead to the nest 
    { gridSize: 6, start: { x: 2, y: 3 }, heading: 'up', nest: '2,2' },
    // Level 2: Longer straight walk (learn the number on the block)
    { gridSize: 6, start: { x: 2, y: 4 }, heading: 'up', nest: '2,1' },
    { gridSize: 5, start: { x: 1, y: 2 }, heading: 'right', nest: '3,2' },
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
    { gridSize: 6, start: { x: 0, y: 3 }, heading: 'right', nest: '5,3', leaves: ['2,3', '4,3'] },
    // Level 12: A spider guards the middle - go around its territory!
    { gridSize: 5, start: { x: 0, y: 2 }, heading: 'right', nest: '4,2', crumbs: ['2,0'],
      patrol: { path: ['2,1', '2,2', '2,3'], start: 1, dir: -1 } },
    // Level 13: A wall of rocks - the tunnel is the only way through
    { gridSize: 6, start: { x: 0, y: 3 }, heading: 'right', nest: '5,1', crumbs: ['5,5'],
      obstacles: ['3,0', '3,1', '3,2', '3,3', '3,4', '3,5'], tunnels: ['2,3', '4,3'] },
    // Level 14: Grand finale - leaf, spider, and bonus crumbs
    { gridSize: 6, start: { x: 0, y: 3 }, heading: 'right', nest: '5,3', leaves: ['2,3'],
      crumbs: ['2,5', '5,5'], patrol: { path: ['4,2', '4,3', '4,4'], start: 1, dir: -1 } }
];

/** Fewest blocks needed per level (3 stars at or under par) */
export const PAR = [1, 1, 3, 5, 1, 9, 11, 4, 5, 11, 10, 9, 3, 9];

export function starsFor(levelNum, blocksUsed) {
    const par = PAR[levelNum - 1] || 1;
    if (blocksUsed <= par) return 3;
    if (blocksUsed <= par + 2) return 2;
    return 1;
}

export function getLevel(levelNum) {
    const index = Math.min(levelNum - 1, LEVELS.length - 1);
    const level = LEVELS[Math.max(0, index)];
    return {
        ...level,
        leaves: level.leaves ? [...level.leaves] : [],
        obstacles: level.obstacles ? [...level.obstacles] : [],
        crumbs: level.crumbs ? [...level.crumbs] : [],
        tunnels: level.tunnels ? [...level.tunnels] : []
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
    const { gridSize, start, heading, nest, leaves = [], obstacles = [],
            crumbs = [], tunnels = [], patrol } = level;

    const inBounds = (x, y) => x >= 0 && x < gridSize && y >= 0 && y < gridSize;
    const keyInBounds = (key) => inBounds(...key.split(',').map(Number));
    const startKey = `${start.x},${start.y}`;

    if (!inBounds(start.x, start.y)) errors.push(`Start ${startKey} out of bounds`);
    if (!['up', 'right', 'down', 'left'].includes(heading)) errors.push(`Invalid heading: ${heading}`);
    if (!keyInBounds(nest)) errors.push(`Nest ${nest} out of bounds`);
    if (nest === startKey) errors.push('Nest is on the start position');

    for (const obstacle of obstacles) {
        if (!keyInBounds(obstacle)) errors.push(`Obstacle ${obstacle} out of bounds`);
        if (obstacle === startKey) errors.push(`Obstacle on start ${obstacle}`);
        if (obstacle === nest) errors.push(`Obstacle on nest ${obstacle}`);
    }
    for (const leaf of leaves) {
        if (!keyInBounds(leaf)) errors.push(`Leaf ${leaf} out of bounds`);
        if (obstacles.includes(leaf)) errors.push(`Leaf on obstacle ${leaf}`);
        if (leaf === nest) errors.push(`Leaf on nest ${leaf}`);
    }
    for (const crumb of crumbs) {
        if (!keyInBounds(crumb)) errors.push(`Crumb ${crumb} out of bounds`);
        if (obstacles.includes(crumb)) errors.push(`Crumb on obstacle ${crumb}`);
    }
    if (tunnels.length !== 0 && tunnels.length !== 2) {
        errors.push('Tunnels must come in pairs');
    }
    for (const tunnel of tunnels) {
        if (!keyInBounds(tunnel)) errors.push(`Tunnel ${tunnel} out of bounds`);
        if (obstacles.includes(tunnel)) errors.push(`Tunnel on obstacle ${tunnel}`);
        if (tunnel === nest) errors.push(`Tunnel on nest ${tunnel}`);
    }
    if (tunnels.length === 2 && tunnels[0] === tunnels[1]) {
        errors.push('Tunnel ends must differ');
    }
    if (patrol) {
        if (!patrol.path || patrol.path.length < 2) errors.push('Patrol path too short');
        for (const cell of patrol.path || []) {
            if (!keyInBounds(cell)) errors.push(`Patrol cell ${cell} out of bounds`);
            if (obstacles.includes(cell)) errors.push(`Patrol cell on obstacle ${cell}`);
        }
        if ((patrol.path || []).includes(startKey)) errors.push('Patrol path crosses start');
    }

    return { valid: errors.length === 0, errors };
}
