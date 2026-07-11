/**
 * Ant - Handles ant state: position, heading, rotation, and carrying
 */
export const HEADINGS = ['up', 'right', 'down', 'left'];

const DELTAS = {
    up: { x: 0, y: -1 },
    right: { x: 1, y: 0 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 }
};

export class Ant {
    constructor(startPosition, startHeading = 'up') {
        this.setStart(startPosition, startHeading);
    }

    setStart(position, heading = 'up') {
        this.startPosition = { ...position };
        this.startHeading = HEADINGS.indexOf(heading);
        if (this.startHeading < 0) this.startHeading = 0;
        this.reset();
    }

    reset() {
        this.position = { ...this.startPosition };
        this.heading = this.startHeading;
        // Cumulative degrees so CSS rotation never "unwinds" (e.g. 270 -> 0)
        this.rotationDeg = this.startHeading * 90;
        this.carrying = false;
    }

    getHeadingName() {
        return HEADINGS[this.heading];
    }

    /** Position one cell ahead of the ant (does not move) */
    getForwardPosition() {
        const delta = DELTAS[this.getHeadingName()];
        return {
            x: this.position.x + delta.x,
            y: this.position.y + delta.y
        };
    }

    moveForward() {
        this.position = this.getForwardPosition();
        return { ...this.position };
    }

    rotate(direction) {
        if (direction === 'right') {
            this.heading = (this.heading + 1) % 4;
            this.rotationDeg += 90;
        } else if (direction === 'left') {
            this.heading = (this.heading + 3) % 4;
            this.rotationDeg -= 90;
        }
        return this.heading;
    }

    isOutOfBounds(gridSize) {
        return (
            this.position.x < 0 ||
            this.position.x >= gridSize ||
            this.position.y < 0 ||
            this.position.y >= gridSize
        );
    }

    getPositionKey() {
        return `${this.position.x},${this.position.y}`;
    }
}
