/**
 * Sequence class - Manages command sequences and saved functions
 * Single responsibility: Handle command queue and reusable code blocks
 */
export class Sequence {
    constructor() {
        this.commands = [];
        this.savedFunctions = [];
        this.activeLoopIndex = null; // Track which loop is being edited
    }

    /**
     * Add a movement command to the sequence (or active loop)
     * @param {string} direction - 'up', 'down', 'left', or 'right'
     */
    addCommand(direction) {
        const cmd = { type: 'move', direction };
        if (this.activeLoopIndex !== null) {
            this.commands[this.activeLoopIndex].commands.push(cmd);
        } else {
            this.commands.push(cmd);
        }
    }

    /**
     * Add a fire command to the sequence (or active loop)
     * @param {string} direction - 'up', 'down', 'left', or 'right'
     */
    addFireCommand(direction) {
        const cmd = { type: 'fire', direction };
        if (this.activeLoopIndex !== null) {
            this.commands[this.activeLoopIndex].commands.push(cmd);
        } else {
            this.commands.push(cmd);
        }
    }

    /**
     * Add a loop block to the sequence
     * @param {number} iterations - Number of times to repeat (default 2)
     */
    addLoop(iterations = 2) {
        this.commands.push({
            type: 'loop',
            iterations: iterations,
            commands: []
        });
    }

    /**
     * Set the active loop for editing
     * @param {number|null} index - Index of the loop or null to deselect
     */
    setActiveLoop(index) {
        if (index !== null && this.commands[index]?.type === 'loop') {
            this.activeLoopIndex = index;
        } else {
            this.activeLoopIndex = null;
        }
    }

    /**
     * Update loop iterations
     * @param {number} loopIndex - Index of the loop
     * @param {number} iterations - New iteration count
     */
    updateLoopIterations(loopIndex, iterations) {
        if (this.commands[loopIndex]?.type === 'loop') {
            this.commands[loopIndex].iterations = Math.max(1, Math.min(9, iterations));
        }
    }

    /**
     * Remove command from inside a loop
     * @param {number} loopIndex - Index of the loop
     * @param {number} cmdIndex - Index of command within the loop
     */
    removeFromLoop(loopIndex, cmdIndex) {
        if (this.commands[loopIndex]?.type === 'loop') {
            this.commands[loopIndex].commands.splice(cmdIndex, 1);
        }
    }

    /**
     * Add a saved function call to the sequence
     * @param {number} functionIndex - Index of the saved function
     */
    addFunctionCall(functionIndex) {
        const func = this.savedFunctions[functionIndex];
        if (func) {
            const cmd = {
                type: 'function',
                id: functionIndex + 1,
                commands: [...func.commands]
            };
            if (this.activeLoopIndex !== null) {
                this.commands[this.activeLoopIndex].commands.push(cmd);
            } else {
                this.commands.push(cmd);
            }
        }
    }

    /**
     * Remove command at specified index
     * @param {number} index - Index to remove
     */
    removeAt(index) {
        // If removing the active loop, deselect it
        if (this.activeLoopIndex === index) {
            this.activeLoopIndex = null;
        } else if (this.activeLoopIndex !== null && index < this.activeLoopIndex) {
            // Adjust active loop index if removing before it
            this.activeLoopIndex--;
        }
        this.commands.splice(index, 1);
    }

    /**
     * Move command from one index to another
     * @param {number} fromIndex - Source index
     * @param {number} toIndex - Destination index (where it will be inserted)
     */
    moveCommand(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.commands.length) return;
        if (toIndex < 0 || toIndex > this.commands.length) return;
        
        // Adjust active loop index
        if (this.activeLoopIndex !== null) {
            if (this.activeLoopIndex === fromIndex) {
                // Moving the active loop itself
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
        // Adjust toIndex if removing from before it
        const adjustedTo = toIndex > fromIndex ? toIndex - 1 : toIndex;
        this.commands.splice(adjustedTo, 0, command);
    }

    /**
     * Insert command at specific index
     * @param {object} cmd - Command object
     * @param {number} index - Index to insert at
     */
    insertAt(cmd, index) {
        // Adjust active loop index if inserting before it
        if (this.activeLoopIndex !== null && index <= this.activeLoopIndex) {
            this.activeLoopIndex++;
        }
        this.commands.splice(index, 0, cmd);
    }

    /**
     * Clear all commands
     */
    clear() {
        this.commands = [];
        this.activeLoopIndex = null;
    }

    /**
     * Save current move commands as a reusable function
     * @returns {boolean} True if function was saved
     */
    saveAsFunction() {
        const moveCommands = this.commands.filter(cmd => cmd.type === 'move');
        if (moveCommands.length === 0) {
            return false;
        }

        this.savedFunctions.push({
            commands: [...moveCommands]
        });
        return true;
    }

    /**
     * Delete a saved function
     * @param {number} index - Index of function to delete
     */
    deleteFunction(index) {
        this.savedFunctions.splice(index, 1);
    }

    /**
     * Get flattened sequence with functions and loops expanded
     * @returns {object[]} Array of move commands
     */
    flatten() {
        const flat = [];
        const expandCommands = (cmds) => {
            for (const cmd of cmds) {
                if (cmd.type === 'function') {
                    expandCommands(cmd.commands);
                } else if (cmd.type === 'loop') {
                    for (let i = 0; i < cmd.iterations; i++) {
                        expandCommands(cmd.commands);
                    }
                } else {
                    flat.push(cmd);
                }
            }
        };
        expandCommands(this.commands);
        return flat;
    }

    /**
     * Get command count (including function contents)
     * @returns {number}
     */
    getTotalMoves() {
        return this.flatten().length;
    }

    /**
     * Check if sequence is empty
     * @returns {boolean}
     */
    isEmpty() {
        return this.commands.length === 0;
    }

    /**
     * Get emoji for a direction
     * @param {string} direction - Direction string
     * @returns {string} Emoji representation
     */
    static getDirectionEmoji(direction) {
        const emojis = {
            'up': '⬆️',
            'down': '⬇️',
            'left': '⬅️',
            'right': '➡️'
        };
        return emojis[direction] || '❓';
    }

    /**
     * Get emoji for a fire command
     * @param {string} direction - Direction string
     * @returns {string} Emoji representation
     */
    static getFireEmoji(direction) {
        const emojis = {
            'up': '🚀⬆️',
            'down': '🚀⬇️',
            'left': '🚀⬅️',
            'right': '🚀➡️'
        };
        return emojis[direction] || '🚀';
    }
}
