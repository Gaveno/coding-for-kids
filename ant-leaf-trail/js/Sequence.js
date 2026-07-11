/**
 * Sequence - Ordered command blocks, each carrying a repeat count (1-9).
 * Supports one level of loop blocks: { action:'loop', count, children:[...] }
 * When a loop is active (selected), new commands are added inside it.
 */
export const ACTIONS = ['forward', 'right', 'left', 'pickup', 'drop'];
export const MAX_COUNT = 9;

export class Sequence {
    constructor() {
        this.clear();
    }

    clear() {
        this.commands = [];
        this.activeLoop = null;
    }

    add(action) {
        if (!ACTIONS.includes(action)) return false;
        const cmd = { action, count: 1 };
        const loop = this.commands[this.activeLoop];
        if (loop && loop.action === 'loop') loop.children.push(cmd);
        else this.commands.push(cmd);
        return true;
    }

    addLoop() {
        this.commands.push({ action: 'loop', count: 2, children: [] });
        this.activeLoop = this.commands.length - 1;
        return true;
    }

    /** Toggle which loop receives new commands (null deactivates) */
    setActiveLoop(index) {
        const cmd = this.commands[index];
        this.activeLoop = (cmd && cmd.action === 'loop' && this.activeLoop !== index)
            ? index : null;
    }

    getCommand(index, childIndex = null) {
        const cmd = this.commands[index];
        if (!cmd) return null;
        if (childIndex === null) return cmd;
        return cmd.action === 'loop' ? cmd.children[childIndex] || null : null;
    }

    removeAt(index, childIndex = null) {
        if (childIndex !== null) {
            const loop = this.commands[index];
            if (!loop || loop.action !== 'loop' || childIndex >= loop.children.length) return false;
            loop.children.splice(childIndex, 1);
            return true;
        }
        if (index < 0 || index >= this.commands.length) return false;
        if (this.activeLoop === index) this.activeLoop = null;
        else if (this.activeLoop !== null && this.activeLoop > index) this.activeLoop--;
        this.commands.splice(index, 1);
        return true;
    }

    changeCount(index, delta, childIndex = null) {
        const cmd = this.getCommand(index, childIndex);
        if (!cmd) return false;
        const next = Math.min(MAX_COUNT, Math.max(1, cmd.count + delta));
        if (next === cmd.count) return false;
        cmd.count = next;
        return true;
    }

    isEmpty() {
        return this.commands.length === 0;
    }

    /** Number of blocks used (a loop counts as itself plus its children) */
    countBlocks() {
        return this.commands.reduce((sum, cmd) =>
            sum + 1 + (cmd.action === 'loop' ? cmd.children.length : 0), 0);
    }

    /** Total unit steps with counts and loop iterations expanded */
    totalSteps() {
        return this.expand().length;
    }

    /** Flatten to unit actions, each tagged with its top-level block index */
    expand() {
        const steps = [];
        this.commands.forEach((cmd, blockIndex) => {
            if (cmd.action === 'loop') {
                for (let i = 0; i < cmd.count; i++) {
                    cmd.children.forEach(child => {
                        for (let j = 0; j < child.count; j++) {
                            steps.push({ action: child.action, blockIndex });
                        }
                    });
                }
            } else {
                for (let i = 0; i < cmd.count; i++) {
                    steps.push({ action: cmd.action, blockIndex });
                }
            }
        });
        return steps;
    }
}
