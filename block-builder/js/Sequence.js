/**
 * Sequence - Command sequence management
 * 
 * Commands:
 * - left: Move crane left
 * - right: Move crane right  
 * - lower: Lower the hook
 * - raise: Raise the hook
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
        this.commands.push({ type, id: Date.now() + Math.random() });
        return true;
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
        this.commands.splice(index, 1);
        return true;
    }

    insertAt(index, type) {
        if (!VALID_COMMANDS.includes(type)) {
            return false;
        }
        if (index < 0) index = 0;
        if (index > this.commands.length) index = this.commands.length;
        
        this.commands.splice(index, 0, { type, id: Date.now() + Math.random() });
        return true;
    }

    moveCommand(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.commands.length) return false;
        if (toIndex < 0 || toIndex > this.commands.length) return false;
        
        const [command] = this.commands.splice(fromIndex, 1);
        this.commands.splice(toIndex, 0, command);
        return true;
    }

    clear() {
        this.commands = [];
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
