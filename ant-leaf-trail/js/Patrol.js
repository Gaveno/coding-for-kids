/**
 * Patrol - A bug that walks back and forth along a fixed path,
 * advancing one cell for every step the ant executes.
 */
export class Patrol {
    /**
     * @param {object} config - { path: ['x,y', ...], start: index, dir: 1|-1 }
     */
    constructor(config) {
        this.path = [...config.path];
        this.startIndex = config.start ?? 0;
        this.startDir = config.dir ?? 1;
        this.reset();
    }

    reset() {
        this.index = this.startIndex;
        this.dir = this.startDir;
    }

    key() {
        return this.path[this.index];
    }

    position() {
        const [x, y] = this.key().split(',').map(Number);
        return { x, y };
    }

    /** Advance one cell, ping-ponging at the ends of the path */
    step() {
        if (this.path.length < 2) return this.key();
        let next = this.index + this.dir;
        if (next < 0 || next >= this.path.length) {
            this.dir = -this.dir;
            next = this.index + this.dir;
        }
        this.index = next;
        return this.key();
    }
}
