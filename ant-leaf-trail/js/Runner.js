/**
 * Runner - Executes the command sequence step by step with animation.
 * Handles obstacles, bounds, leaves, crumbs, tunnels, and the patrol bug.
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
        for (const step of g.sequence.expand()) {
            g.highlightBlock(step.blockIndex);
            if (!await this.executeStep(step.action)) return { result: 'crash' };
            if (!await this.advancePatrol()) return { result: 'crash' };
        }
        const atNest = g.grid.isNest(g.ant.getPositionKey());
        const done = atNest && g.grid.allLeavesDelivered() && !g.ant.carrying;
        return { result: done ? 'success' : 'incomplete' };
    }

    executeStep(action) {
        switch (action) {
            case 'forward': return this.stepForward();
            case 'right':
            case 'left': return this.stepRotate(action);
            case 'pickup': return this.stepPickup();
            case 'drop': return this.stepDrop();
            default: return Promise.resolve(true);
        }
    }

    /** Crash: show feedback, play the death animation, report failure */
    async fail(feedback) {
        const g = this.game;
        g.audio.play('error');
        g.showFeedback(feedback);
        await g.sprite.playDie();
        await this.delay(600);
        return false;
    }

    async stepForward() {
        const g = this.game;
        const next = g.ant.getForwardPosition();
        if (g.grid.hasObstacle(`${next.x},${next.y}`)) {
            g.sprite.shake();
            return this.fail('💥🪨');
        }

        g.ant.moveForward();
        if (g.ant.isOutOfBounds(g.grid.size)) return this.fail('💥');

        g.sprite.startWalk();
        g.moveSpriteToAnt(true);
        g.audio.play('move');
        await this.delay(MOVE_MS);
        g.sprite.stopWalk();

        await this.checkTunnel();
        this.collectCrumb();
        return true;
    }

    async checkTunnel() {
        const g = this.game;
        const exit = g.grid.tunnelExit(g.ant.getPositionKey());
        if (!exit) return;
        await this.delay(150);
        const [x, y] = exit.split(',').map(Number);
        g.ant.position = { x, y };
        g.audio.play('teleport');
        g.moveSpriteToAnt(false);
        g.sprite.pulse();
        await this.delay(250);
    }

    collectCrumb() {
        const g = this.game;
        if (g.grid.collectCrumb(g.ant.getPositionKey())) {
            g.audio.play('crumb');
            g.sprite.pulse();
            g.renderGrid();
        }
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
            await g.sprite.playOnce('bite', { fps: 18 });
            g.grid.removeLeaf(key);
            g.ant.carrying = true;
            g.renderGrid();
            g.sprite.setCarrying(true);
            g.audio.play('pickup');
        } else {
            g.sprite.shake();
            g.audio.play('incomplete');
            g.showFeedback('🤔');
            await this.delay(ACTION_MS);
        }
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
                g.hud.updateLeafTracker(g.grid);
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

    /** The patrol bug takes one step after every ant step */
    async advancePatrol() {
        const g = this.game;
        if (!g.patrol) return true;
        const antKey = g.ant.getPositionKey();
        if (g.patrol.key() === antKey) return this.fail('🕷️');
        g.patrol.step();
        g.movePatrolOverlay(true);
        await this.delay(180);
        if (g.patrol.key() === antKey) return this.fail('🕷️');
        return true;
    }
}
