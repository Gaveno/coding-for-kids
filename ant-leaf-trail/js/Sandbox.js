/**
 * Sandbox - Build-your-own-level mode. Tap a tool, then tap grid cells.
 * Tapping the ant again rotates its starting direction.
 */
import { formatLevel } from './LevelIO.js';

const HEADINGS = ['up', 'right', 'down', 'left'];

const DEFAULT_LAYOUT = {
    gridSize: 6,
    start: { x: 0, y: 5 },
    heading: 'up',
    nest: '5,0',
    leaves: [],
    obstacles: [],
    crumbs: [],
    tunnels: [],
    patrol: null
};

export class Sandbox {
    constructor(progress) {
        this.progress = progress;
        const saved = progress.getSandbox();
        this.layout = saved ? JSON.parse(JSON.stringify(saved))
                            : JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
        // Fill in fields missing from layouts saved by older versions
        if (!this.layout.tunnels) this.layout.tunnels = [];
        if (this.layout.patrol === undefined) this.layout.patrol = null;
        this.tool = 'rock';
    }

    setTool(tool) {
        this.tool = tool;
    }

    startKey() {
        return `${this.layout.start.x},${this.layout.start.y}`;
    }

    /** Cycle the ant's starting facing direction (up -> right -> down -> left). */
    rotateStart() {
        const i = HEADINGS.indexOf(this.layout.heading);
        this.layout.heading = HEADINGS[(i + 1) % HEADINGS.length];
        this.progress.saveSandbox(this.layout);
    }

    removeFromAll(key) {
        ['leaves', 'obstacles', 'crumbs', 'tunnels'].forEach(list => {
            this.layout[list] = this.layout[list].filter(k => k !== key);
        });
        if (this.layout.patrol) {
            this.layout.patrol.path = this.layout.patrol.path.filter(k => k !== key);
            if (!this.layout.patrol.path.length) this.layout.patrol = null;
        }
    }

    /** Add/remove one end of the tunnel pair; keeps at most two ends. */
    editTunnel(key) {
        const had = this.layout.tunnels.includes(key);
        this.removeFromAll(key);
        if (!had) {
            if (this.layout.tunnels.length >= 2) this.layout.tunnels.shift();
            this.layout.tunnels.push(key);
        }
    }

    /** Append a cell to the spider path, or remove it if already on the path. */
    editPatrol(key) {
        const path = this.layout.patrol ? this.layout.patrol.path : [];
        const at = path.indexOf(key);
        if (at !== -1) {
            path.splice(at, 1);
            if (!path.length) this.layout.patrol = null;
            return;
        }
        this.removeFromAll(key);
        if (!this.layout.patrol) this.layout.patrol = { path: [], start: 0, dir: 1 };
        this.layout.patrol.path.push(key);
        if (this.layout.patrol.start >= this.layout.patrol.path.length) {
            this.layout.patrol.start = 0;
        }
    }

    toggle(list, key) {
        const had = this.layout[list].includes(key);
        this.removeFromAll(key);
        if (!had) this.layout[list].push(key);
    }

    /**
     * Apply the current tool to a cell.
     * @returns {boolean} true if the layout changed
     */
    edit(x, y) {
        const key = `${x},${y}`;
        const isStart = key === this.startKey();
        const isNest = key === this.layout.nest;

        switch (this.tool) {
            case 'start':
                if (isNest) return false;
                if (isStart) {
                    // Tap again to rotate the starting direction
                    const i = HEADINGS.indexOf(this.layout.heading);
                    this.layout.heading = HEADINGS[(i + 1) % 4];
                } else {
                    this.removeFromAll(key);
                    this.layout.start = { x, y };
                }
                break;
            case 'nest':
                if (isStart || isNest) return false;
                this.removeFromAll(key);
                this.layout.nest = key;
                break;
            case 'rock':
            case 'leaf':
            case 'crumb': {
                if (isStart || isNest) return false;
                const list = { rock: 'obstacles', leaf: 'leaves', crumb: 'crumbs' }[this.tool];
                this.toggle(list, key);
                break;
            }
            case 'tunnel':
                if (isStart || isNest) return false;
                this.editTunnel(key);
                break;
            case 'patrol':
                if (isStart || isNest) return false;
                this.editPatrol(key);
                break;
            case 'erase':
                if (isStart || isNest) return false;
                this.removeFromAll(key);
                break;
            default:
                return false;
        }

        this.progress.saveSandbox(this.layout);
        return true;
    }

    toLevelData() {
        return {
            gridSize: this.layout.gridSize,
            start: { ...this.layout.start },
            heading: this.layout.heading,
            nest: this.layout.nest,
            leaves: [...this.layout.leaves],
            obstacles: [...this.layout.obstacles],
            crumbs: [...this.layout.crumbs],
            tunnels: [...this.layout.tunnels],
            patrol: this.layout.patrol ? {
                path: [...this.layout.patrol.path],
                start: this.layout.patrol.start,
                dir: this.layout.patrol.dir
            } : null
        };
    }

    /**
     * Load an existing level (e.g. from the LEVELS constant) into the editor.
     * All fields, including tunnels and patrol, are copied so any campaign
     * level can be iterated on.
     */
    loadFrom(level) {
        this.layout = {
            gridSize: level.gridSize,
            start: { ...level.start },
            heading: level.heading,
            nest: level.nest,
            leaves: [...(level.leaves || [])],
            obstacles: [...(level.obstacles || [])],
            crumbs: [...(level.crumbs || [])],
            tunnels: [...(level.tunnels || [])],
            patrol: level.patrol ? {
                path: [...level.patrol.path],
                start: level.patrol.start ?? 0,
                dir: level.patrol.dir ?? 1
            } : null
        };
        this.progress.saveSandbox(this.layout);
    }

    /**
     * Format the current layout as a LEVELS-constant entry (single quotes,
     * empty lists omitted) for pasting into Levels.js.
     */
    toLevelString() {
        return formatLevel(this.toLevelData());
    }
}
