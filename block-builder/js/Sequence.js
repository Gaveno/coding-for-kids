/**
 * Sequence - Block Builder command sequence management
 * Extends BaseSequence with crane-specific commands
 */
import { BaseSequence } from '../../shared/js/BaseSequence.js';

// Valid command types for block builder
const VALID_COMMANDS = ['left', 'right', 'lower', 'raise'];

// Command icons
const COMMAND_ICONS = {
    left: '⬅️',
    right: '➡️',
    lower: '⬇️',
    raise: '⬆️',
    loop: '🔄'
};

export class Sequence extends BaseSequence {
    constructor() {
        super();
        this.nextId = 1;
    }

    /**
     * Add a command to the sequence
     * @param {string} type - Command type
     * @returns {boolean} Whether command was added
     */
    addCommand(type) {
        if (!VALID_COMMANDS.includes(type)) return false;
        
        const cmd = { id: this.nextId++, type };
        
        if (this.activeLoopIndex !== null) {
            this.commands[this.activeLoopIndex].commands.push(cmd);
        } else {
            this.commands.push(cmd);
        }
        return true;
    }

    /**
     * Insert command at specific index in main sequence
     * @param {number} index - Insert position
     * @param {string} type - Command type
     */
    insertAt(index, type) {
        if (!VALID_COMMANDS.includes(type)) return;
        
        const cmd = { id: this.nextId++, type };
        
        if (this.activeLoopIndex !== null && index <= this.activeLoopIndex) {
            this.activeLoopIndex++;
        }
        this.commands.splice(index, 0, cmd);
    }

    /**
     * Insert command into a loop at specific index
     * @param {number} loopIndex - Loop index in main sequence
     * @param {number} targetIndex - Insert position within loop
     * @param {string} type - Command type
     */
    insertIntoLoop(loopIndex, targetIndex, type) {
        if (!VALID_COMMANDS.includes(type)) return;
        
        const loop = this.commands[loopIndex];
        if (!loop || loop.type !== 'loop') return;
        
        const cmd = { id: this.nextId++, type };
        loop.commands.splice(targetIndex, 0, cmd);
    }

    /**
     * Flatten sequence by expanding loops
     * @returns {Array} Flat array of commands
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

    /**
     * Get icon for command type
     * @param {string} type - Command type
     * @returns {string} Emoji icon
     */
    static getIcon(type) {
        return COMMAND_ICONS[type] || '❓';
    }

    /**
     * Get hook icon
     * @returns {string} Hook emoji
     */
    static getHookIcon() {
        return '🪝';
    }

    /**
     * Get arrow icon for direction
     * @param {string} type - lower or raise
     * @returns {string} Arrow emoji
     */
    static getArrowIcon(type) {
        return type === 'lower' ? '⬇️' : '⬆️';
    }
}
