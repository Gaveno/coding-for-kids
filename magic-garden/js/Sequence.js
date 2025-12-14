/**
 * Sequence - Command sequence management for Magic Garden
 * 
 * Extends BaseSequence with game-specific command handling.
 */
import { BaseSequence } from '../../shared/js/BaseSequence.js';

export class Sequence extends BaseSequence {
    constructor() {
        super();
    }

    /**
     * Add an action command to the sequence
     * @param {string} action - Action emoji
     * @param {number} [index] - Optional index to insert at
     */
    addCommand(action, index = null) {
        const command = { type: action };
        
        if (this.activeLoopIndex !== null) {
            // Add to active loop
            const loop = this.commands[this.activeLoopIndex];
            if (loop && loop.type === 'loop') {
                loop.commands.push(command);
            }
        } else if (index !== null && index >= 0) {
            // Insert at specific index
            this.commands.splice(index, 0, command);
        } else {
            // Add to end
            this.commands.push(command);
        }
    }

    /**
     * Get command at index
     * @param {number} index - Command index
     * @returns {Object|null} Command object
     */
    getCommand(index) {
        return this.commands[index] || null;
    }

    /**
     * Remove command at index
     * @param {number} index - Command index
     */
    removeCommand(index) {
        if (index >= 0 && index < this.commands.length) {
            this.commands.splice(index, 1);
            
            // Update active loop index if needed
            if (this.activeLoopIndex !== null) {
                if (index === this.activeLoopIndex) {
                    this.activeLoopIndex = null;
                } else if (index < this.activeLoopIndex) {
                    this.activeLoopIndex--;
                }
            }
        }
    }

    /**
     * Move command from one index to another
     * @param {number} fromIndex - Source index
     * @param {number} toIndex - Target index
     */
    moveCommand(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.commands.length) return;
        if (toIndex < 0 || toIndex > this.commands.length) return;
        
        const [cmd] = this.commands.splice(fromIndex, 1);
        const adjustedTo = toIndex > fromIndex ? toIndex - 1 : toIndex;
        this.commands.splice(adjustedTo, 0, cmd);
        
        // Update active loop index
        if (this.activeLoopIndex !== null) {
            if (fromIndex === this.activeLoopIndex) {
                this.activeLoopIndex = adjustedTo;
            } else {
                if (fromIndex < this.activeLoopIndex && adjustedTo >= this.activeLoopIndex) {
                    this.activeLoopIndex--;
                } else if (fromIndex > this.activeLoopIndex && adjustedTo <= this.activeLoopIndex) {
                    this.activeLoopIndex++;
                }
            }
        }
    }

    /**
     * Add command to a loop at specific index
     * @param {string} action - Action emoji
     * @param {number} loopIndex - Index of the loop
     * @param {number} cmdIndex - Index within loop
     */
    addToLoop(action, loopIndex, cmdIndex) {
        const loop = this.commands[loopIndex];
        if (!loop || loop.type !== 'loop') return;
        
        const command = { type: action };
        loop.commands.splice(cmdIndex, 0, command);
    }

    /**
     * Clear all commands
     */
    clear() {
        this.commands = [];
        this.activeLoopIndex = null;
    }

    /**
     * Get count of commands
     * @returns {number} Command count
     */
    getLength() {
        return this.commands.length;
    }

    /**
     * Check if sequence is empty
     * @returns {boolean} True if empty
     */
    isEmpty() {
        return this.commands.length === 0;
    }

    /**
     * Flatten sequence into array of action strings (expand loops)
     * @returns {string[]} Array of action emojis
     */
    flatten() {
        const result = [];
        
        for (const cmd of this.commands) {
            if (cmd.type === 'loop') {
                for (let i = 0; i < cmd.iterations; i++) {
                    for (const innerCmd of cmd.commands) {
                        result.push(innerCmd.type);
                    }
                }
            } else {
                result.push(cmd.type);
            }
        }
        
        return result;
    }

    /**
     * Get all commands (for rendering)
     * @returns {Object[]} Array of command objects
     */
    getCommands() {
        return [...this.commands];
    }
}
