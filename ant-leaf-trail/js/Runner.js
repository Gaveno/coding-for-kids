/**
 * Runner - Executes the command sequence step by step with animation.
 * Returns { result: 'success' | 'crash' | 'incomplete' }
 */
const MOVE_MS = 380;
const TURN_MS = 260;
const ACTION_MS = 300;

export class Runner {
    constructor(game) {
        this.game = game;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async run() {
        const g = this.game;
        const steps = g.sequence.expand();

        for (const step of steps) {
            g.highlightBlock(step.blockIndex);
            const ok = await this.executeStep(step.action);
            if (!ok) return { result: 'crash' };
        }

        const atNest = g.grid.isNest(g.ant.getPositionKey());
        const done = atNest && g.grid.allLeavesDelivered() && !g.ant.carrying;
        return { result: done ? 'success' : 'incomplete' };
    }

    async executeStep(action) {
        switch (action) {
            case 'forward': return this.stepForward();
            case 'right':
            case 'left': return this.stepRotate(action);
            case 'pickup': return this.stepPickup();
            case 'drop': return this.stepDrop();
            default: return true;
        }
    }

    async stepForward() {
        const g = this.game;
        const next = g.ant.getForwardPosition();
        const nextKey = `${next.x},${next.y}`;

        if (g.grid.hasObstacle(nextKey)) {
            g.sprite.shake();
            g.audio.play('error');
            g.showFeedback('💥🪨');
            await this.delay(600);
            return false;
        }

        g.ant.moveForward();

        if (g.ant.isOutOfBounds(g.grid.size)) {
            g.audio.play('error');
            g.showFeedback('💥');
            await this.delay(600);
            return false;
        }

        g.sprite.startWalk();
        g.moveSpriteToAnt(true);
        g.audio.play('move');
        await this.delay(MOVE_MS);
        g.sprite.stopWalk();
        return true;
    }

    async stepRotate(direction) {
        const g = this.game;
        g.ant.rotate(direction);
        g.sprite.setRotation(g.ant.rotationDeg, true);
        g.audio.play('rotate');
        await this.delay(TURN_MS);
        return true;
    }

    async stepPickup() {
        const g = this.game;
        const key = g.ant.getPositionKey();
        if (!g.ant.carrying && g.grid.hasLeaf(key)) {
            g.grid.removeLeaf(key);
            g.ant.carrying = true;
            g.renderGrid();
            g.sprite.setCarrying(true);
            g.sprite.pulse();
            g.audio.play('pickup');
        } else {
            g.sprite.shake();
            g.audio.play('incomplete');
            g.showFeedback('🤔');
        }
        await this.delay(ACTION_MS);
        return true;
    }

    async stepDrop() {
        const g = this.game;
        if (g.ant.carrying) {
            const key = g.ant.getPositionKey();
            g.ant.carrying = false;
            g.sprite.setCarrying(false);
            if (g.grid.isNest(key)) {
                g.grid.deliverLeaf();
                g.updateLeafTracker();
                g.sprite.pulse();
                g.audio.play('deliver');
            } else {
                g.grid.addLeaf(key);
                g.renderGrid();
                g.audio.play('drop');
            }
        } else {
            g.sprite.shake();
            g.audio.play('incomplete');
            g.showFeedback('🤔');
        }
        await this.delay(ACTION_MS);
        return true;
    }
}
