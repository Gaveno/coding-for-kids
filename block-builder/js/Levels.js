/**
 * Levels - Level definitions for Block Builder
 * 
 * Level format:
 * {
 *   id: number,
 *   supply: { columns: [[blocks from bottom to top], ...] },
 *   buildArea: { width: number, height: number },
 *   target: [[x, y, blockType], ...],
 *   craneStart: number (column index)
 * }
 * 
 * Coordinate system:
 * - Columns 0-2: Supply area (3 columns)
 * - Columns 3+: Build area
 * - Y: 0 = top row, increases downward
 */

export const LEVELS = [
    // Level 1: Single brick - basic pickup and place
    {
        id: 1,
        supply: {
            columns: [
                ['🧱', '🧱'],  // Column 0
                [],            // Column 1
                []             // Column 2
            ]
        },
        buildArea: { width: 4, height: 4 },
        target: [
            [0, 3, '🧱']  // One brick at bottom-left of build area
        ],
        craneStart: 0
    },

    // Level 2: Stack of 2 - teaches repetition
    {
        id: 2,
        supply: {
            columns: [
                ['🧱', '🧱', '🧱'],
                [],
                []
            ]
        },
        buildArea: { width: 4, height: 4 },
        target: [
            [0, 3, '🧱'],
            [0, 2, '🧱']
        ],
        craneStart: 0
    },

    // Level 3: Row of 3 - horizontal placement
    {
        id: 3,
        supply: {
            columns: [
                ['🧱', '🧱', '🧱', '🧱'],
                [],
                []
            ]
        },
        buildArea: { width: 4, height: 4 },
        target: [
            [0, 3, '🧱'],
            [1, 3, '🧱'],
            [2, 3, '🧱']
        ],
        craneStart: 0
    },

    // Level 4: 2x2 square - grid thinking
    {
        id: 4,
        supply: {
            columns: [
                ['🧱', '🧱', '🧱', '🧱', '🧱'],
                [],
                []
            ]
        },
        buildArea: { width: 4, height: 4 },
        target: [
            [0, 3, '🧱'], [1, 3, '🧱'],
            [0, 2, '🧱'], [1, 2, '🧱']
        ],
        craneStart: 0
    },

    // Level 5: Wall with window - introduces windows
    {
        id: 5,
        supply: {
            columns: [
                ['🧱', '🧱', '🧱', '🧱', '🧱'],
                ['🪟'],
                []
            ]
        },
        buildArea: { width: 4, height: 4 },
        target: [
            [0, 3, '🧱'], [1, 3, '🧱'], [2, 3, '🧱'],
            [0, 2, '🧱'], [1, 2, '🪟'], [2, 2, '🧱']
        ],
        craneStart: 0
    },

    // Level 6: Wall with door - introduces doors
    {
        id: 6,
        supply: {
            columns: [
                ['🧱', '🧱', '🧱', '🧱', '🧱', '🧱'],
                ['🚪'],
                []
            ]
        },
        buildArea: { width: 4, height: 4 },
        target: [
            [0, 3, '🧱'], [1, 3, '🚪'], [2, 3, '🧱'],
            [0, 2, '🧱'], [1, 2, '🧱'], [2, 2, '🧱'],
            [0, 1, '🧱'], [1, 1, '🧱'], [2, 1, '🧱']
        ],
        craneStart: 0
    },

    // Level 7: Simple house outline
    {
        id: 7,
        supply: {
            columns: [
                ['🧱', '🧱', '🧱', '🧱', '🧱', '🧱'],
                ['🪟', '🚪'],
                []
            ]
        },
        buildArea: { width: 4, height: 4 },
        target: [
            [0, 3, '🧱'], [1, 3, '🚪'], [2, 3, '🧱'],
            [0, 2, '🪟'], [2, 2, '🪟'],
            [0, 1, '🧱'], [1, 1, '🧱'], [2, 1, '🧱']
        ],
        craneStart: 0
    },

    // Level 8: House with roof - introduces roof pieces
    {
        id: 8,
        supply: {
            columns: [
                ['🧱', '🧱', '🧱', '🧱', '🧱', '🧱'],
                ['🪟', '🚪'],
                ['🔺', '🔺', '🔺']
            ]
        },
        buildArea: { width: 4, height: 5 },
        target: [
            [0, 4, '🧱'], [1, 4, '🚪'], [2, 4, '🧱'],
            [0, 3, '🪟'], [2, 3, '🪟'],
            [0, 2, '🧱'], [1, 2, '🧱'], [2, 2, '🧱'],
            [0, 1, '🔺'], [1, 1, '🔺'], [2, 1, '🔺']
        ],
        craneStart: 0
    },

    // Level 9: Tall tower
    {
        id: 9,
        supply: {
            columns: [
                ['🧱', '🧱', '🧱', '🧱', '🧱', '🧱'],
                ['🪟', '🪟'],
                ['🔺']
            ]
        },
        buildArea: { width: 4, height: 5 },
        target: [
            [1, 4, '🧱'],
            [1, 3, '🪟'],
            [1, 2, '🧱'],
            [1, 1, '🪟'],
            [1, 0, '🔺']
        ],
        craneStart: 0
    },

    // Level 10: Complete house - final challenge
    {
        id: 10,
        supply: {
            columns: [
                ['🧱', '🧱', '🧱', '🧱', '🧱', '🧱', '🧱', '🧱'],
                ['🪟', '🪟', '🚪'],
                ['🔺', '🔺', '🔺', '🔺']
            ]
        },
        buildArea: { width: 4, height: 5 },
        target: [
            [0, 4, '🧱'], [1, 4, '🚪'], [2, 4, '🧱'], [3, 4, '🧱'],
            [0, 3, '🪟'], [1, 3, '🧱'], [2, 3, '🪟'], [3, 3, '🧱'],
            [0, 2, '🧱'], [1, 2, '🧱'], [2, 2, '🧱'], [3, 2, '🧱'],
            [0, 1, '🔺'], [1, 1, '🔺'], [2, 1, '🔺'], [3, 1, '🔺']
        ],
        craneStart: 0
    }
];

/**
 * Get a level by number (1-indexed)
 * @param {number} levelNum - Level number
 * @returns {Object} Level configuration
 */
export function getLevel(levelNum) {
    const index = Math.max(0, Math.min(levelNum - 1, LEVELS.length - 1));
    const level = LEVELS[index];
    
    // Deep copy to avoid mutation
    return {
        id: level.id,
        supply: {
            columns: level.supply.columns.map(col => [...col])
        },
        buildArea: { ...level.buildArea },
        target: level.target.map(t => [...t]),
        craneStart: level.craneStart
    };
}

/**
 * Get total number of levels
 * @returns {number} Total levels
 */
export function getTotalLevels() {
    return LEVELS.length;
}

/**
 * Convert target array format to objects
 * @param {Array} target - [[x, y, type], ...]
 * @returns {Array<Object>} [{x, y, type}, ...]
 */
export function parseTargets(target) {
    return target.map(([x, y, type]) => ({ x, y, type }));
}

/**
 * Validate a level configuration
 * @param {Object} level - Level to validate
 * @returns {Object} {valid, errors}
 */
export function validateLevel(level) {
    const errors = [];
    const { supply, buildArea, target } = level;

    // Check supply columns
    if (!supply || !supply.columns) {
        errors.push('Missing supply configuration');
    } else if (supply.columns.length !== 3) {
        errors.push(`Supply should have 3 columns, has ${supply.columns.length}`);
    }

    // Check build area
    if (!buildArea || !buildArea.width || !buildArea.height) {
        errors.push('Missing build area configuration');
    }

    // Check target positions
    if (!target || !Array.isArray(target)) {
        errors.push('Missing target configuration');
    } else {
        for (const [x, y, type] of target) {
            if (x < 0 || x >= buildArea.width) {
                errors.push(`Target x=${x} out of bounds (0-${buildArea.width - 1})`);
            }
            if (y < 0 || y >= buildArea.height) {
                errors.push(`Target y=${y} out of bounds (0-${buildArea.height - 1})`);
            }
            if (!type) {
                errors.push(`Target at (${x},${y}) missing block type`);
            }
        }

        // Check total blocks available vs needed
        const totalSupply = supply.columns.reduce((sum, col) => sum + col.length, 0);
        if (totalSupply < target.length) {
            errors.push(`Not enough supply blocks: ${totalSupply} < ${target.length} targets`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
