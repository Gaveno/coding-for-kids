/**
 * Sequence class - Manages command sequences and saved functions
 * Single responsibility: Handle command queue and reusable code blocks
 */
export class Sequence {
    constructor() {
        this.commands = [];
        this.savedFunctions = [];
    }

    /**
     * Add a movement command to the sequence
     * @param {string} direction - 'up', 'down', 'left', or 'right'
     */
    addCommand(direction) {
        this.commands.push({ type: 'move', direction });
    }

    /**
     * Add a fire command to the sequence
     * @param {string} direction - 'up', 'down', 'left', or 'right'
     */
    addFireCommand(direction) {
        this.commands.push({ type: 'fire', direction });
    }

    /**
     * Add a saved function call to the sequence
     * @param {number} functionIndex - Index of the saved function
     */
    addFunctionCall(functionIndex) {
        const func = this.savedFunctions[functionIndex];
        if (func) {
            this.commands.push({
                type: 'function',
                id: functionIndex + 1,
                commands: [...func.commands]
            });
        }
    }

    /**
     * Remove command at specified index
     * @param {number} index - Index to remove
     */
    removeAt(index) {
        this.commands.splice(index, 1);
    }

    /**
     * Clear all commands
     */
    clear() {
        this.commands = [];
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
     * Get flattened sequence with functions expanded
     * @returns {object[]} Array of move commands
     */
    flatten() {
        const flat = [];
        for (const cmd of this.commands) {
            if (cmd.type === 'function') {
                flat.push(...cmd.commands);
            } else {
                flat.push(cmd);
            }
        }
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
