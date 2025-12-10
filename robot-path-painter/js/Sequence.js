/**
 * Sequence - Command sequence management
 */
export class Sequence {
    constructor() {
        this.commands = [];
        this.savedFunctions = [];
        this.activeLoopIndex = null;
    }

    addCommand(direction) {
        const cmd = { type: 'move', direction };
        if (this.activeLoopIndex !== null) {
            this.commands[this.activeLoopIndex].commands.push(cmd);
        } else {
            this.commands.push(cmd);
        }
    }

    addFireCommand(direction) {
        const cmd = { type: 'fire', direction };
        if (this.activeLoopIndex !== null) {
            this.commands[this.activeLoopIndex].commands.push(cmd);
        } else {
            this.commands.push(cmd);
        }
    }

    addLoop(iterations = 2) {
        this.commands.push({
            type: 'loop',
            iterations: iterations,
            commands: []
        });
    }

    setActiveLoop(index) {
        if (index !== null && this.commands[index]?.type === 'loop') {
            this.activeLoopIndex = index;
        } else {
            this.activeLoopIndex = null;
        }
    }

    updateLoopIterations(loopIndex, iterations) {
        if (this.commands[loopIndex]?.type === 'loop') {
            this.commands[loopIndex].iterations = Math.max(1, Math.min(9, iterations));
        }
    }

    removeFromLoop(loopIndex, cmdIndex) {
        if (this.commands[loopIndex]?.type === 'loop') {
            this.commands[loopIndex].commands.splice(cmdIndex, 1);
        }
    }

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

    removeAt(index) {
        if (this.activeLoopIndex === index) {
            this.activeLoopIndex = null;
        } else if (this.activeLoopIndex !== null && index < this.activeLoopIndex) {
            this.activeLoopIndex--;
        }
        this.commands.splice(index, 1);
    }

    moveCommand(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.commands.length) return;
        if (toIndex < 0 || toIndex > this.commands.length) return;
        
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
        const adjustedTo = toIndex > fromIndex ? toIndex - 1 : toIndex;
        this.commands.splice(adjustedTo, 0, command);
    }

    insertAt(cmd, index) {
        if (this.activeLoopIndex !== null && index <= this.activeLoopIndex) {
            this.activeLoopIndex++;
        }
        this.commands.splice(index, 0, cmd);
    }

    clear() {
        this.commands = [];
        this.activeLoopIndex = null;
    }

    saveAsFunction() {
        const moveCommands = this.commands.filter(cmd => cmd.type === 'move');
        if (moveCommands.length === 0) return false;
        this.savedFunctions.push({ commands: [...moveCommands] });
        return true;
    }

    deleteFunction(index) {
        this.savedFunctions.splice(index, 1);
    }

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

    isEmpty() {
        return this.commands.length === 0;
    }

    static getDirectionEmoji(direction) {
        const emojis = { 'up': '⬆️', 'down': '⬇️', 'left': '⬅️', 'right': '➡️' };
        return emojis[direction] || '❓';
    }

    static getFireEmoji(direction) {
        const emojis = { 'up': '🚀⬆️', 'down': '🚀⬇️', 'left': '🚀⬅️', 'right': '🚀➡️' };
        return emojis[direction] || '🚀';
    }
}
