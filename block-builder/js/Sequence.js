/**
 * Sequence - Command sequence management
 * 
 * Commands:
 * - left: Move crane left
 * - right: Move crane right  
 * - lower: Lower the hook
 * - raise: Raise the hook
 * - loop: Repeat contained commands N times
 */

const VALID_COMMANDS = ['left', 'right', 'lower', 'raise'];

const COMMAND_ICONS = {
    left: '⬅️',
    right: '➡️',
    lower: '🪝⬇️',
    raise: '🪝⬆️'
};

export class Sequence {
    constructor() {
        this.commands = [];
        this.activeLoopIndex = null;
    }

    get length() {
        return this.commands.length;
    }

    isEmpty() {
        return this.commands.length === 0;
    }

    /**
     * Check if a command type is valid
     * @param {string} type - Command type
     * @returns {boolean} True if valid
     */
    static isValidCommand(type) {
        return VALID_COMMANDS.includes(type);
    }

    /**
     * Get the icon for a command type
     * @param {string} type - Command type
     * @returns {string} Icon string
     */
    static getIcon(type) {
        return COMMAND_ICONS[type] || '❓';
    }

    /**
     * Get all valid command types
     * @returns {Array<string>} Valid commands
     */
    static getValidCommands() {
        return [...VALID_COMMANDS];
    }

    addCommand(type) {
        if (!VALID_COMMANDS.includes(type)) {
            return false;
        }
        const cmd = { type, id: Date.now() + Math.random() };
        if (this.activeLoopIndex !== null) {
            this.commands[this.activeLoopIndex].commands.push(cmd);
        } else {
            this.commands.push(cmd);
        }
        return true;
    }

    /**
     * Add a loop command
     * @param {number} iterations - Number of times to repeat (default 2)
     */
    addLoop(iterations = 2) {
        this.commands.push({
            type: 'loop',
            iterations,
            commands: [],
            id: Date.now() + Math.random()
        });
    }

    /**
     * Set the active loop for adding commands into
     * @param {number|null} index - Loop index or null to deactivate
     */
    setActiveLoop(index) {
        if (index !== null && this.commands[index]?.type === 'loop') {
            this.activeLoopIndex = index;
        } else {
            this.activeLoopIndex = null;
        }
    }

    /**
     * Update iterations for a loop
     * @param {number} loopIndex - Index of the loop
     * @param {number} iterations - New iteration count
     */
    updateLoopIterations(loopIndex, iterations) {
        if (this.commands[loopIndex]?.type === 'loop') {
            this.commands[loopIndex].iterations = Math.max(1, Math.min(9, iterations));
        }
    }

    /**
     * Remove a command from inside a loop
     * @param {number} loopIndex - Index of the loop
     * @param {number} cmdIndex - Index of command within the loop
     */
    removeFromLoop(loopIndex, cmdIndex) {
        if (this.commands[loopIndex]?.type === 'loop') {
            this.commands[loopIndex].commands.splice(cmdIndex, 1);
        }
    }

    getCommand(index) {
        return this.commands[index];
    }

    getCommands() {
        return [...this.commands];
    }

    removeAt(index) {
        if (index < 0 || index >= this.commands.length) {
            return false;
        }
        // Clear active loop if removing it
        if (this.activeLoopIndex === index) {
            this.activeLoopIndex = null;
        } else if (this.activeLoopIndex !== null && index < this.activeLoopIndex) {
            this.activeLoopIndex--;
        }
        this.commands.splice(index, 1);
        return true;
    }

    insertAt(index, type) {
        if (!VALID_COMMANDS.includes(type)) {
            return false;
        }
        if (index < 0) index = 0;
        if (index > this.commands.length) index = this.commands.length;
        
        // Update activeLoopIndex if inserting before it
        if (this.activeLoopIndex !== null && index <= this.activeLoopIndex) {
            this.activeLoopIndex++;
        }
        
        this.commands.splice(index, 0, { type, id: Date.now() + Math.random() });
        return true;
    }

    moveCommand(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.commands.length) return false;
        if (toIndex < 0 || toIndex > this.commands.length) return false;
        
        // Update activeLoopIndex if needed
        if (this.activeLoopIndex !== null) {
            if (this.activeLoopIndex === fromIndex) {
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
        this.commands.splice(toIndex, 0, command);
        return true;
    }

    clear() {
        this.commands = [];
        this.activeLoopIndex = null;
    }

    /**
     * Flatten the command sequence, expanding loops
     * @returns {Array} Flat array of executable commands
     */
    flatten() {
        const flat = [];
        const expandCommands = (cmds) => {
            for (const cmd of cmds) {
                if (cmd.type === 'loop') {
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

    // Make iterable
    [Symbol.iterator]() {
        let index = 0;
        const commands = this.commands;
        return {
            next() {
                if (index < commands.length) {
                    return { value: commands[index++], done: false };
                }
                return { done: true };
            }
        };
    }
}
