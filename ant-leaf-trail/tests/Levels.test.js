/**
 * Tests for Levels - includes a solver-style walk of each level's
 * known solution to guarantee every level is completable, with full
 * game rules: obstacles, leaves, crumbs, tunnels, and the patrol bug.
 */
import { LEVELS, PAR, getLevel, getTotalLevels, validateLevel, starsFor } from '../js/Levels.js';
import { Ant } from '../js/Ant.js';
import { Grid } from '../js/Grid.js';
import { Patrol } from '../js/Patrol.js';

/** Known solutions: F=forward, R=right, L=left, P=pickup, D=drop */
export const SOLUTIONS = [
    'FFF',
    'FFFFF',
    'FFFRFFF',
    'FFRFFFLFF',
    'FFFF',
    'FLFRFFRFLF',
    'FLFFRFFRFLFFRF',
    'FFPFFD',
    'FFFPRFFFFD',
    'FFPRFLFFLFRFD',
    'FFPFFFDRRFPRRFD',
    'FLFFRFFRFFLF',
    'FFFLFF',
    'FFPRFFLFFFLFFD'
];

/** Number of blocks the solution uses (consecutive same commands merge) */
function blockRuns(solution) {
    let runs = 0;
    for (let i = 0; i < solution.length; i++) {
        if (solution[i] !== solution[i - 1]) runs++;
    }
    return runs;
}

export function runLevelsTests() {
    const results = [];

    results.push(test('Has 14 levels and matching solutions/pars', () => {
        assertEqual(getTotalLevels(), 14);
        assertEqual(SOLUTIONS.length, 14);
        assertEqual(PAR.length, 14);
    }));

    LEVELS.forEach((level, i) => {
        results.push(test(`Level ${i + 1} configuration is valid`, () => {
            const { valid, errors } = validateLevel(level);
            if (!valid) throw new Error(errors.join('; '));
        }));
    });

    LEVELS.forEach((_, i) => {
        results.push(test(`Level ${i + 1} is solvable with its known solution`, () => {
            const outcome = simulate(getLevel(i + 1), SOLUTIONS[i]);
            assertTrue(outcome.solved, outcome.reason);
        }));
    });

    LEVELS.forEach((_, i) => {
        results.push(test(`Level ${i + 1} par matches its known solution`, () => {
            assertEqual(PAR[i], blockRuns(SOLUTIONS[i]));
        }));
    });

    results.push(test('Crumb levels yield all crumbs on the good route', () => {
        const outcome = simulate(getLevel(14), SOLUTIONS[13]);
        assertEqual(outcome.crumbs, 2);
    }));

    results.push(test('starsFor rewards par and tolerates +2', () => {
        assertEqual(starsFor(1, 1), 3);
        assertEqual(starsFor(1, 3), 2);
        assertEqual(starsFor(1, 4), 1);
    }));

    results.push(test('getLevel clamps out-of-range level numbers', () => {
        assertEqual(getLevel(999).gridSize, LEVELS[LEVELS.length - 1].gridSize);
        assertEqual(getLevel(-5).gridSize, LEVELS[0].gridSize);
    }));

    return results;
}

/** Headless run of a solution string against a level, mirroring Runner rules */
export function simulate(level, solution) {
    const ant = new Ant(level.start, level.heading);
    const grid = new Grid(level);
    const patrol = level.patrol ? new Patrol(level.patrol) : null;
    const dead = (reason) => ({ solved: false, reason, crumbs: grid.crumbsCollected });

    for (const ch of solution) {
        if (ch === 'F') {
            const next = ant.getForwardPosition();
            if (grid.hasObstacle(`${next.x},${next.y}`)) return dead('hit rock');
            ant.moveForward();
            if (ant.isOutOfBounds(grid.size)) return dead('out of bounds');
            const exit = grid.tunnelExit(ant.getPositionKey());
            if (exit) {
                const [x, y] = exit.split(',').map(Number);
                ant.position = { x, y };
            }
            grid.collectCrumb(ant.getPositionKey());
        } else if (ch === 'R' || ch === 'L') {
            ant.rotate(ch === 'R' ? 'right' : 'left');
        } else if (ch === 'P') {
            if (ant.carrying || !grid.hasLeaf(ant.getPositionKey())) return dead('bad pickup');
            grid.removeLeaf(ant.getPositionKey());
            ant.carrying = true;
        } else if (ch === 'D') {
            if (!ant.carrying) return dead('bad drop');
            ant.carrying = false;
            if (grid.isNest(ant.getPositionKey())) grid.deliverLeaf();
            else grid.addLeaf(ant.getPositionKey());
        }

        if (patrol) {
            if (patrol.key() === ant.getPositionKey()) return dead('caught by patrol');
            patrol.step();
            if (patrol.key() === ant.getPositionKey()) return dead('patrol walked in');
        }
    }

    const solved = grid.isNest(ant.getPositionKey()) && grid.allLeavesDelivered() && !ant.carrying;
    return { solved, reason: solved ? '' : 'did not finish at nest with all leaves', crumbs: grid.crumbsCollected };
}

function test(name, fn) {
    try {
        fn();
        return { name, passed: true };
    } catch (e) {
        return { name, passed: false, error: e.message };
    }
}

function assertEqual(actual, expected) {
    if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
    }
}

function assertTrue(value, msg) {
    if (!value) {
        throw new Error(msg || `Expected true, got ${value}`);
    }
}
