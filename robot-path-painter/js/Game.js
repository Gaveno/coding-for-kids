/**
 * Game Controller - Main game orchestration
 * Coordinates Robot, Grid, Sequence, Audio, and Renderer
 */
import { Robot } from './Robot.js';
import { Grid } from './Grid.js';
import { Sequence } from './Sequence.js';
import { Audio } from './Audio.js';
import { Renderer } from './Renderer.js';
import { DragDrop } from './DragDrop.js';
import { getLevel, getTotalLevels } from './Levels.js';

export class Game {
    constructor() {
        this.currentLevel = 1;
        this.isPlaying = false;
        this.initialObstacles = []; // Store for reset

        this.initializeComponents();
        this.initializeElements();
        this.setupEventListeners();
        this.loadLevel(this.currentLevel);
    }

    initializeComponents() {
        const levelData = getLevel(1);
        this.robot = new Robot(levelData.start);
        this.grid = new Grid(levelData.gridSize, levelData.targets, levelData.obstacles);
        this.sequence = new Sequence();
        this.audio = new Audio();
        this.initialObstacles = levelData.obstacles || [];
    }

    initializeElements() {
        this.elements = {
            gridContainer: document.getElementById('gridContainer'),
            sequenceArea: document.getElementById('sequenceArea'),
            sequencePlaceholder: document.getElementById('sequencePlaceholder'),
            savedFunctionsContainer: document.getElementById('savedFunctions'),
            trashZone: document.getElementById('trashZone'),
            playBtn: document.getElementById('playBtn'),
            resetBtn: document.getElementById('resetBtn'),
            clearBtn: document.getElementById('clearBtn'),
            saveBtn: document.getElementById('saveBtn'),
            loopBtn: document.getElementById('loopBtn'),
            helpBtn: document.getElementById('helpBtn'),
            closeHelpBtn: document.getElementById('closeHelpBtn'),
            nextBtn: document.getElementById('nextBtn'),
            successOverlay: document.getElementById('successOverlay'),
            helpOverlay: document.getElementById('helpOverlay'),
            levelNum: document.getElementById('levelNum')
        };

        this.renderer = new Renderer(this.elements);
        
        // Initialize drag and drop for touch devices
        this.dragDrop = new DragDrop({
            sequenceArea: this.elements.sequenceArea,
            trashZone: this.elements.trashZone,
            onAddCommand: (direction, index) => this.addCommandAt(direction, index),
            onAddFireCommand: (direction, index) => this.addFireCommandAt(direction, index),
            onReorder: (from, to) => this.reorderCommand(from, to),
            onRemove: (index) => this.removeCommand(index)
        });
    }

    loadLevel(levelNum) {
        const levelData = getLevel(levelNum);
        
        this.robot.setStartPosition(levelData.start);
        this.grid.configure(levelData.gridSize, levelData.targets, levelData.obstacles);
        this.initialObstacles = levelData.obstacles || [];
        this.sequence.clear();
        
        this.renderer.updateLevel(levelNum);
        this.render();
    }

    render() {
        this.grid.render(this.elements.gridContainer, this.robot.position);
        this.renderSequence();
        this.renderer.renderSavedFunctions(
            this.sequence.savedFunctions,
            (index) => this.deleteFunction(index),
            (index) => this.addFunctionToSequence(index)
        );
    }

    /**
     * Render sequence and setup drag/drop on items
     */
    renderSequence() {
        this.renderer.renderSequence(
            this.sequence,
            (index) => this.selectLoop(index),
            (index, iterations) => this.updateLoopIterations(index, iterations),
            (loopIndex, cmdIndex) => this.removeFromLoop(loopIndex, cmdIndex)
        );
        
        // Make sequence items draggable for touch reordering
        const items = this.elements.sequenceArea.querySelectorAll('.sequence-item, .loop-block');
        this.dragDrop.makeItemsDraggable(items);
    }

    // ===== Command Management =====
    
    addCommand(direction) {
        if (this.isPlaying) return;
        
        this.sequence.addCommand(direction);
        this.renderSequence();
        this.audio.play('click');
    }

    /**
     * Add command at specific index (for drag & drop)
     * @param {string} direction - Command direction
     * @param {number} index - Index to insert at
     */
    addCommandAt(direction, index) {
        if (this.isPlaying) return;
        
        const cmd = { type: 'move', direction };
        if (this.sequence.activeLoopIndex !== null) {
            // If a loop is active, add to the loop instead
            this.sequence.addCommand(direction);
        } else if (index !== undefined && index < this.sequence.commands.length) {
            this.sequence.insertAt(cmd, index);
        } else {
            this.sequence.addCommand(direction);
        }
        this.renderSequence();
        this.audio.play('click');
    }

    addFireCommand(direction) {
        if (this.isPlaying) return;
        
        this.sequence.addFireCommand(direction);
        this.renderSequence();
        this.audio.play('click');
    }

    /**
     * Add fire command at specific index (for drag & drop)
     * @param {string} direction - Fire direction
     * @param {number} index - Index to insert at
     */
    addFireCommandAt(direction, index) {
        if (this.isPlaying) return;
        
        const cmd = { type: 'fire', direction };
        if (this.sequence.activeLoopIndex !== null) {
            this.sequence.addFireCommand(direction);
        } else if (index !== undefined && index < this.sequence.commands.length) {
            this.sequence.insertAt(cmd, index);
        } else {
            this.sequence.addFireCommand(direction);
        }
        this.renderSequence();
        this.audio.play('click');
    }

    /**
     * Reorder command from one position to another
     * @param {number} fromIndex - Source index
     * @param {number} toIndex - Destination index
     */
    reorderCommand(fromIndex, toIndex) {
        if (this.isPlaying) return;
        
        this.sequence.moveCommand(fromIndex, toIndex);
        this.renderSequence();
        this.audio.play('click');
    }

    addLoop() {
        if (this.isPlaying) return;
        
        this.sequence.addLoop(2);
        // Auto-select the new loop for editing
        this.sequence.setActiveLoop(this.sequence.commands.length - 1);
        this.renderSequence();
        this.audio.play('click');
    }

    selectLoop(index) {
        if (this.isPlaying) return;
        
        this.sequence.setActiveLoop(index);
        this.renderSequence();
    }

    updateLoopIterations(index, iterations) {
        if (this.isPlaying) return;
        
        this.sequence.updateLoopIterations(index, iterations);
        this.renderSequence();
    }

    removeFromLoop(loopIndex, cmdIndex) {
        if (this.isPlaying) return;
        
        this.sequence.removeFromLoop(loopIndex, cmdIndex);
        this.renderSequence();
    }

    addFunctionToSequence(functionIndex) {
        if (this.isPlaying) return;
        
        this.sequence.addFunctionCall(functionIndex);
        this.renderSequence();
        this.audio.play('click');
    }

    removeCommand(index) {
        if (this.isPlaying) return;
        
        this.sequence.removeAt(index);
        this.renderSequence();
        this.audio.play('click');
    }

    clearSequence() {
        if (this.isPlaying) return;
        
        this.sequence.clear();
        this.renderSequence();
        this.audio.play('clear');
    }

    saveFunction() {
        if (this.sequence.isEmpty()) {
            this.renderer.showFeedback('❌');
            return;
        }

        if (this.sequence.saveAsFunction()) {
            this.renderer.renderSavedFunctions(
                this.sequence.savedFunctions,
                (index) => this.deleteFunction(index),
                (index) => this.addFunctionToSequence(index)
            );
            this.audio.play('save');
            this.renderer.showFeedback('💾✅');
        } else {
            this.renderer.showFeedback('❌');
        }
    }

    deleteFunction(index) {
        this.sequence.deleteFunction(index);
        this.renderer.renderSavedFunctions(
            this.sequence.savedFunctions,
            (i) => this.deleteFunction(i),
            (i) => this.addFunctionToSequence(i)
        );
    }

    // ===== Game Execution =====

    async play() {
        if (this.isPlaying || this.sequence.isEmpty()) return;

        this.isPlaying = true;
        this.renderer.setPlayButtonDisabled(true);

        // Reset state
        this.robot.reset();
        this.grid.clearPaint();
        this.grid.resetObstacles(this.initialObstacles);
        this.render();

        const flatSequence = this.sequence.flatten();

        for (let i = 0; i < flatSequence.length; i++) {
            const cmd = flatSequence[i];
            
            this.highlightCommand(i);
            
            if (cmd.type === 'fire') {
                await this.executeFireCommand(cmd.direction);
                await this.delay(300);
                continue;
            }

            // Check if next position has an obstacle
            const nextPos = this.getNextPosition(cmd.direction);
            const nextKey = `${nextPos.x},${nextPos.y}`;
            
            if (this.grid.hasObstacle(nextKey)) {
                // Robot crashed into obstacle
                this.audio.play('error');
                this.renderer.showFeedback('💥🪨');
                await this.delay(500);
                this.resetLevel();
                return;
            }

            await this.executeMove(cmd.direction);

            if (this.robot.isOutOfBounds(this.grid.size)) {
                this.audio.play('error');
                this.renderer.showFeedback('💥');
                await this.delay(500);
                this.resetLevel();
                return;
            }

            this.grid.paintCell(this.robot.getPositionKey());
            this.grid.render(this.elements.gridContainer, this.robot.position);
            this.audio.play('paint');

            await this.delay(400);
        }

        if (this.grid.allTargetsPainted()) {
            await this.delay(300);
            this.showSuccess();
        } else {
            this.audio.play('incomplete');
            this.renderer.showFeedback('🤔');
        }

        this.isPlaying = false;
        this.renderer.setPlayButtonDisabled(false);
        this.renderer.clearHighlights();
    }

    /**
     * Get next position without moving the robot
     * @param {string} direction - Direction to check
     * @returns {object} Next position {x, y}
     */
    getNextPosition(direction) {
        const deltas = {
            'up': { x: 0, y: -1 },
            'down': { x: 0, y: 1 },
            'left': { x: -1, y: 0 },
            'right': { x: 1, y: 0 }
        };
        const delta = deltas[direction] || { x: 0, y: 0 };
        return {
            x: this.robot.position.x + delta.x,
            y: this.robot.position.y + delta.y
        };
    }

    /**
     * Execute a fire command - launch projectile and animate
     * @param {string} direction - Direction to fire
     */
    async executeFireCommand(direction) {
        const deltas = {
            'up': { x: 0, y: -1 },
            'down': { x: 0, y: 1 },
            'left': { x: -1, y: 0 },
            'right': { x: 1, y: 0 }
        };
        const delta = deltas[direction];
        
        let projectilePos = { ...this.robot.position };
        this.audio.play('fire');
        
        // Animate projectile moving until it hits something
        while (true) {
            projectilePos.x += delta.x;
            projectilePos.y += delta.y;
            
            const posKey = `${projectilePos.x},${projectilePos.y}`;
            
            // Check if out of bounds - explode at edge
            if (projectilePos.x < 0 || projectilePos.x >= this.grid.size ||
                projectilePos.y < 0 || projectilePos.y >= this.grid.size) {
                await this.showExplosion(projectilePos.x - delta.x, projectilePos.y - delta.y);
                break;
            }
            
            // Show projectile at current position
            await this.showProjectile(projectilePos.x, projectilePos.y, direction);
            await this.delay(100);
            
            // Check if hit obstacle
            if (this.grid.hasObstacle(posKey)) {
                this.grid.removeObstacle(posKey);
                await this.showExplosion(projectilePos.x, projectilePos.y);
                this.audio.play('explosion');
                this.grid.render(this.elements.gridContainer, this.robot.position);
                break;
            }
        }
        
        // Clear any lingering projectile
        this.clearProjectile();
    }

    /**
     * Show projectile at a grid position
     */
    async showProjectile(x, y, direction) {
        this.clearProjectile();
        
        const cell = this.elements.gridContainer.querySelector(
            `[data-x="${x}"][data-y="${y}"]`
        );
        
        if (cell) {
            const projectile = document.createElement('span');
            projectile.className = 'projectile';
            projectile.id = 'activeProjectile';
            
            // Rotate rocket based on direction (rocket emoji points at 45deg by default)
            const rotations = {
                'up': '-45deg',
                'right': '45deg',
                'down': '135deg',
                'left': '-135deg'
            };
            projectile.style.transform = `rotate(${rotations[direction]})`;
            projectile.textContent = '🚀';
            cell.appendChild(projectile);
        }
    }

    /**
     * Clear projectile from grid
     */
    clearProjectile() {
        const existing = document.getElementById('activeProjectile');
        if (existing) existing.remove();
    }

    /**
     * Show explosion animation at position
     */
    async showExplosion(x, y) {
        this.clearProjectile();
        
        const cell = this.elements.gridContainer.querySelector(
            `[data-x="${x}"][data-y="${y}"]`
        );
        
        if (cell) {
            const explosion = document.createElement('span');
            explosion.className = 'explosion';
            explosion.textContent = '💥';
            cell.appendChild(explosion);
            
            await this.delay(400);
            explosion.remove();
        }
    }

    highlightCommand(flatIndex) {
        let visualIndex = 0;
        let count = 0;

        for (let i = 0; i < this.sequence.commands.length; i++) {
            const cmd = this.sequence.commands[i];
            if (cmd.type === 'function') {
                if (count + cmd.commands.length > flatIndex) {
                    this.renderer.highlightSequenceItem(i);
                    return;
                }
                count += cmd.commands.length;
            } else {
                if (count === flatIndex) {
                    this.renderer.highlightSequenceItem(i);
                    return;
                }
                count++;
            }
            visualIndex++;
        }
    }

    async executeMove(direction) {
        this.robot.move(direction);
        this.grid.render(this.elements.gridContainer, this.robot.position);
        this.audio.play('move');
        this.renderer.animateRobotMove();
    }

    // ===== Game State =====

    resetLevel() {
        this.robot.reset();
        this.grid.clearPaint();
        this.grid.resetObstacles(this.initialObstacles);
        this.isPlaying = false;
        this.renderer.setPlayButtonDisabled(false);
        this.render();
        this.renderer.clearHighlights();
    }

    nextLevel() {
        if (this.currentLevel < getTotalLevels()) {
            this.currentLevel++;
        }
        this.loadLevel(this.currentLevel);
        this.renderer.hideSuccess();
    }

    showSuccess() {
        this.renderer.showSuccess();
        this.audio.playSuccessMelody();
    }

    // ===== Utility =====

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== Event Listeners =====

    setupEventListeners() {
        // Command buttons
        document.querySelectorAll('.command-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addCommand(btn.dataset.command);
            });

            btn.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('command', btn.dataset.command);
                btn.classList.add('dragging');
            });

            btn.addEventListener('dragend', () => {
                btn.classList.remove('dragging');
            });

            // Note: Touch drag is handled by DragDrop module
        });

        // Fire buttons
        document.querySelectorAll('.fire-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addFireCommand(btn.dataset.fire);
            });

            // Note: Touch drag is handled by DragDrop module
        });

        // Sequence area - drop zone and click to remove
        this.elements.sequenceArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.sequenceArea.classList.add('drag-over');
        });

        this.elements.sequenceArea.addEventListener('dragleave', () => {
            this.elements.sequenceArea.classList.remove('drag-over');
        });

        this.elements.sequenceArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.sequenceArea.classList.remove('drag-over');
            const command = e.dataTransfer.getData('command');
            if (command) {
                this.addCommand(command);
            }
        });

        this.elements.sequenceArea.addEventListener('click', (e) => {
            const item = e.target.closest('.sequence-item');
            if (item && item.dataset.index !== undefined) {
                this.removeCommand(parseInt(item.dataset.index));
            }
        });

        // Control buttons
        this.elements.playBtn.addEventListener('click', () => this.play());
        this.elements.resetBtn.addEventListener('click', () => this.resetLevel());
        this.elements.clearBtn.addEventListener('click', () => this.clearSequence());
        this.elements.saveBtn.addEventListener('click', () => this.saveFunction());
        this.elements.loopBtn.addEventListener('click', () => this.addLoop());

        // Help overlay
        this.elements.helpBtn.addEventListener('click', () => this.renderer.showHelp());
        this.elements.closeHelpBtn.addEventListener('click', () => this.renderer.hideHelp());
        this.elements.helpOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.helpOverlay) {
                this.renderer.hideHelp();
            }
        });

        // Success overlay
        this.elements.nextBtn.addEventListener('click', () => this.nextLevel());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.isPlaying) return;

            switch (e.key) {
                case 'ArrowUp': this.addCommand('up'); break;
                case 'ArrowDown': this.addCommand('down'); break;
                case 'ArrowLeft': this.addCommand('left'); break;
                case 'ArrowRight': this.addCommand('right'); break;
                case 'Enter':
                case ' ': this.play(); break;
                case 'Escape': this.resetLevel(); break;
            }
        });
    }
}
