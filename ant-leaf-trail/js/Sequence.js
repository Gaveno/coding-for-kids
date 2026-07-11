/**
 * Sequence - Two editable command lists: the main program and a single
 * reusable function. Each block carries a repeat count (1-9).
 * The main program may include "call" blocks that run the function.
 */
export const ACTIONS = ['forward', 'right', 'left', 'pickup', 'drop'];
export const MAX_COUNT = 9;

export class Sequence {
    constructor() {
        this.clear();
    }

    clear() {
        this.commands = [];
        this.functionCommands = [];
        this.activeList = 'main';
    }

    /** The list currently being edited and displayed */
    active() {
        return this.activeList === 'function' ? this.functionCommands : this.commands;
    }

    setActiveList(list) {
        this.activeList = list === 'function' ? 'function' : 'main';
    }

    add(action) {
        if (!ACTIONS.includes(action)) return false;
        this.active().push({ action, count: 1 });
        return true;
    }

    /** Add a "call the function" block to the main program */
    addCall() {
        this.commands.push({ action: 'call', count: 1 });
        return true;
    }

    getCommand(index) {
        return this.active()[index] || null;
    }

    removeAt(index) {
        const list = this.active();
        if (index < 0 || index >= list.length) return false;
        list.splice(index, 1);
        return true;
    }

    changeCount(index, delta) {
        const cmd = this.getCommand(index);
        if (!cmd) return false;
        const next = Math.min(MAX_COUNT, Math.max(1, cmd.count + delta));
        if (next === cmd.count) return false;
        cmd.count = next;
        return true;
    }

    /** Empty the list currently being edited */
    clearActive() {
        if (this.activeList === 'function') this.functionCommands = [];
        else this.commands = [];
        return true;
    }

    isEmpty() {
        return this.active().length === 0;
    }

    /** Total blocks used across the program and the function */
    countBlocks() {
        return this.commands.length + this.functionCommands.length;
    }

    /** Total unit steps with counts and function calls expanded */
    totalSteps() {
        return this.expand().length;
    }

    /**
     * Flatten the main program to unit actions, inlining the function body
     * for each call. Every step is tagged with its main-list block index.
     */
    expand() {
        const steps = [];
        this.commands.forEach((cmd, blockIndex) => {
            if (cmd.action === 'call') {
                for (let i = 0; i < cmd.count; i++) {
                    this.functionCommands.forEach(fc => {
                        for (let j = 0; j < fc.count; j++) {
                            steps.push({ action: fc.action, blockIndex });
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
