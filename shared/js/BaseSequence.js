/**
 * BaseSequence - Shared command sequence management with loop support
 * 
 * Provides core functionality for managing command sequences with loops.
 * Games extend this class and implement game-specific command handling.
 */
export class BaseSequence {
    constructor() {
        this.commands = [];
        this.activeLoopIndex = null;
    }

    /**
     * Add a loop block to the sequence
     * @param {number} iterations - Number of loop iterations (default 2)
     */
    addLoop(iterations = 2) {
        this.commands.push({
            type: 'loop',
            iterations: iterations,
            commands: []
        });
    }

    /**
     * Set the active loop for command insertion
     * @param {number|null} index - Loop index or null to deselect
     */
    setActiveLoop(index) {
        if (index !== null && this.commands[index]?.type === 'loop') {
            this.activeLoopIndex = index;
        } else {
            this.activeLoopIndex = null;
        }
    }

    /**
     * Update loop iteration count
     * @param {number} loopIndex - Index of the loop
     * @param {number} iterations - New iteration count (clamped 1-9)
     */
    updateLoopIterations(loopIndex, iterations) {
        if (this.commands[loopIndex]?.type === 'loop') {
            this.commands[loopIndex].iterations = Math.max(1, Math.min(9, iterations));
        }
    }

    /**
     * Remove a command from inside a loop
     * @param {number} loopIndex - Index of the loop
     * @param {number} cmdIndex - Index of command within loop
     */
    removeFromLoop(loopIndex, cmdIndex) {
        if (this.commands[loopIndex]?.type === 'loop') {
            this.commands[loopIndex].commands.splice(cmdIndex, 1);
        }
    }

    /**
     * Move command within a loop
     * @param {number} loopIndex - Index of the loop in main sequence
     * @param {number} fromIndex - Source index within loop
     * @param {number} toIndex - Target index within loop
     */
    moveWithinLoop(loopIndex, fromIndex, toIndex) {
        const loop = this.commands[loopIndex];
        if (!loop || loop.type !== 'loop') return;
        
        const cmds = loop.commands;
        if (fromIndex < 0 || fromIndex >= cmds.length) return;
        if (toIndex < 0 || toIndex > cmds.length) return;
        
        const [cmd] = cmds.splice(fromIndex, 1);
        const adjustedTo = toIndex > fromIndex ? toIndex - 1 : toIndex;
        cmds.splice(adjustedTo, 0, cmd);
    }

    /**
     * Move command from loop to main sequence
     * @param {number} loopIndex - Index of the loop
     * @param {number} cmdIndex - Index within the loop
     * @param {number} targetIndex - Target index in main sequence
     */
    moveFromLoopToMain(loopIndex, cmdIndex, targetIndex) {
        const loop = this.commands[loopIndex];
        if (!loop || loop.type !== 'loop') return;
        if (cmdIndex < 0 || cmdIndex >= loop.commands.length) return;
        
        const [cmd] = loop.commands.splice(cmdIndex, 1);
        
        // Update active loop index if needed
        if (this.activeLoopIndex !== null && targetIndex <= this.activeLoopIndex) {
            this.activeLoopIndex++;
        }
        
        this.commands.splice(targetIndex, 0, cmd);
    }

    /**
     * Move command from main sequence into a loop
     * @param {number} cmdIndex - Index in main sequence
     * @param {number} loopIndex - Target loop index
     * @param {number} targetIndex - Target index within loop
     */
    moveFromMainToLoop(cmdIndex, loopIndex, targetIndex) {
        // Can't move a loop into another loop
        if (this.commands[cmdIndex]?.type === 'loop') return;
        
        const loop = this.commands[loopIndex];
        if (!loop || loop.type !== 'loop') return;
        
        // Adjust loop index if we're removing from before it
        const adjustedLoopIndex = cmdIndex < loopIndex ? loopIndex - 1 : loopIndex;
        
        // Update active loop index
        if (this.activeLoopIndex !== null) {
            if (cmdIndex < this.activeLoopIndex) {
                this.activeLoopIndex--;
            } else if (cmdIndex === this.activeLoopIndex) {
                this.activeLoopIndex = null;
            }
        }
        
        const [cmd] = this.commands.splice(cmdIndex, 1);
        this.commands[adjustedLoopIndex].commands.splice(targetIndex, 0, cmd);
    }

    /**
     * Remove command at index from main sequence
     * @param {number} index - Command index
     */
    removeAt(index) {
        if (this.activeLoopIndex === index) {
            this.activeLoopIndex = null;
        } else if (this.activeLoopIndex !== null && index < this.activeLoopIndex) {
            this.activeLoopIndex--;
        }
        this.commands.splice(index, 1);
    }

    /**
     * Move command in main sequence
     * @param {number} fromIndex - Source index
     * @param {number} toIndex - Target index
     */
    moveCommand(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.commands.length) return;
        if (toIndex < 0 || toIndex > this.commands.length) return;
        
        // Update activeLoopIndex if needed
        if (this.activeLoopIndex !== null) {
            if (this.activeLoopIndex === fromIndex) {
                // Moving the active loop
                if (toIndex > fromIndex) {
                    this.activeLoopIndex = toIndex - 1;
                } else {
                    this.activeLoopIndex = toIndex;
                }
            } else if (fromIndex < this.activeLoopIndex && toIndex > this.activeLoopIndex) {
                this.activeLoopIndex--;
            } else if (fromIndex > this.activeLoopIndex && toIndex <= this.activeLoopIndex) {
                this.activeLoopIndex++;
            }
        }
        
        const [command] = this.commands.splice(fromIndex, 1);
        const adjustedTo = toIndex > fromIndex ? toIndex - 1 : toIndex;
        this.commands.splice(adjustedTo, 0, command);
    }

    /**
     * Clear all commands
     */
    clear() {
        this.commands = [];
        this.activeLoopIndex = null;
    }

    /**
     * Check if sequence is empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.commands.length === 0;
    }

    /**
     * Get all commands
     * @returns {Array}
     */
    getCommands() {
        return this.commands;
    }

    /**
     * Insert command at index - must be implemented by subclass
     * @abstract
     */
    insertAt(index, ...args) {
        throw new Error('insertAt must be implemented by subclass');
    }

    /**
     * Insert command into loop - must be implemented by subclass
     * @abstract
     */
    insertIntoLoop(loopIndex, targetIndex, ...args) {
        throw new Error('insertIntoLoop must be implemented by subclass');
    }

    /**
     * Flatten sequence (expand loops) - must be implemented by subclass
     * @abstract
     * @returns {Array}
     */
    flatten() {
        throw new Error('flatten must be implemented by subclass');
    }
}
