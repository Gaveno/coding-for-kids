/**
 * Sandbox - Build-your-own-level mode. Tap a tool, then tap grid cells.
 * Tapping the ant again rotates its starting direction.
 */
const HEADINGS = ['up', 'right', 'down', 'left'];

const DEFAULT_LAYOUT = {
    gridSize: 6,
    start: { x: 0, y: 5 },
    heading: 'up',
    nest: '5,0',
    leaves: [],
    obstacles: [],
    crumbs: []
};

export class Sandbox {
    constructor(progress) {
        this.progress = progress;
        const saved = progress.getSandbox();
        this.layout = saved ? JSON.parse(JSON.stringify(saved))
                            : JSON.parse(JSON.stringify(DEFAULT_LAYOUT));
        this.tool = 'rock';
    }

    setTool(tool) {
        this.tool = tool;
    }

    startKey() {
        return `${this.layout.start.x},${this.layout.start.y}`;
    }

    removeFromAll(key) {
        ['leaves', 'obstacles', 'crumbs'].forEach(list => {
            this.layout[list] = this.layout[list].filter(k => k !== key);
        });
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
            crumbs: [...this.layout.crumbs]
        };
    }
}
