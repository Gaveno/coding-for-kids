/**
 * Robot - Handles robot state and movement
 */
export class Robot {
    constructor(startPosition) {
        this.startPosition = { ...startPosition };
        this.position = { ...startPosition };
    }

    move(direction) {
        const deltas = {
            'up': { x: 0, y: -1 },
            'down': { x: 0, y: 1 },
            'left': { x: -1, y: 0 },
            'right': { x: 1, y: 0 }
        };
        const delta = deltas[direction];
        if (delta) {
            this.position.x += delta.x;
            this.position.y += delta.y;
        }
        return { ...this.position };
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

    reset() {
        this.position = { ...this.startPosition };
    }

    setStartPosition(newStart) {
        this.startPosition = { ...newStart };
        this.position = { ...newStart };
    }
}
