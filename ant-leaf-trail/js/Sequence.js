/**
 * Sequence - Ordered command blocks, each with a repeat count (1-9)
 * Actions: 'forward', 'right', 'left', 'pickup', 'drop'
 */
export const ACTIONS = ['forward', 'right', 'left', 'pickup', 'drop'];
export const MAX_COUNT = 9;

export class Sequence {
    constructor() {
        this.commands = [];
    }

    add(action) {
        if (!ACTIONS.includes(action)) return false;
        this.commands.push({ action, count: 1 });
        return true;
    }

    removeAt(index) {
        if (index < 0 || index >= this.commands.length) return false;
        this.commands.splice(index, 1);
        return true;
    }

    changeCount(index, delta) {
        const cmd = this.commands[index];
        if (!cmd) return false;
        const next = Math.min(MAX_COUNT, Math.max(1, cmd.count + delta));
        if (next === cmd.count) return false;
        cmd.count = next;
        return true;
    }

    clear() {
        this.commands = [];
    }

    isEmpty() {
        return this.commands.length === 0;
    }

    /** Total number of unit steps (counts expanded) */
    totalSteps() {
        return this.commands.reduce((sum, cmd) => sum + cmd.count, 0);
    }

    /** Flatten to unit actions, each tagged with its source block index */
    expand() {
        const steps = [];
        this.commands.forEach((cmd, blockIndex) => {
            for (let i = 0; i < cmd.count; i++) {
                steps.push({ action: cmd.action, blockIndex });
            }
        });
        return steps;
    }
}
