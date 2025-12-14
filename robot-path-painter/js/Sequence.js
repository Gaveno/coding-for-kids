/**
 * Sequence - Robot Path Painter command sequence management
 * Extends BaseSequence with robot-specific commands and functions
 */
import { BaseSequence } from '../../shared/js/BaseSequence.js';

// Direction emojis
const DIRECTION_EMOJIS = {
    up: '⬆️',
    down: '⬇️',
    left: '⬅️',
    right: '➡️'
};

const FIRE_EMOJIS = {
    up: '🚀⬆️',
    down: '🚀⬇️',
    left: '🚀⬅️',
    right: '🚀➡️'
};

export class Sequence extends BaseSequence {
    constructor() {
        super();
        this.savedFunctions = [];
    }

    /**
     * Add a move command
     * @param {string} direction - up, down, left, right
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
     * Add a fire command
     * @param {string} direction - up, down, left, right
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
     * Insert command at specific index in main sequence
     * @param {Object} cmd - Command object
     * @param {number} index - Insert position
     */
    insertAt(cmd, index) {
        if (this.activeLoopIndex !== null && index <= this.activeLoopIndex) {
            this.activeLoopIndex++;
        }
        this.commands.splice(index, 0, cmd);
    }

    /**
     * Insert command into a loop at specific index
     * @param {number} loopIndex - Loop index in main sequence
     * @param {number} targetIndex - Insert position within loop
     * @param {string} type - Command type ('move' or 'fire')
     * @param {string} direction - Direction
     */
    insertIntoLoop(loopIndex, targetIndex, type, direction) {
        const loop = this.commands[loopIndex];
        if (!loop || loop.type !== 'loop') return;
        
        const cmd = { type, direction };
        loop.commands.splice(targetIndex, 0, cmd);
    }

    /**
     * Add a function call to the sequence
     * @param {number} functionIndex - Index of saved function
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
     * Save current sequence as a function
     * @returns {boolean} Whether save was successful
     */
    saveAsFunction() {
        const moveCommands = this.commands.filter(cmd => cmd.type === 'move');
        if (moveCommands.length === 0) return false;
        this.savedFunctions.push({ commands: [...moveCommands] });
        return true;
    }

    /**
     * Delete a saved function
     * @param {number} index - Function index
     */
    deleteFunction(index) {
        this.savedFunctions.splice(index, 1);
    }

    /**
     * Flatten sequence by expanding loops and functions
     * @returns {Array} Flat array of commands
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
     * Get direction emoji
     * @param {string} direction - Direction
     * @returns {string} Emoji
     */
    static getDirectionEmoji(direction) {
        return DIRECTION_EMOJIS[direction] || '❓';
    }

    /**
     * Get fire emoji
     * @param {string} direction - Direction
     * @returns {string} Emoji
     */
    static getFireEmoji(direction) {
        return FIRE_EMOJIS[direction] || '🚀';
    }
}
