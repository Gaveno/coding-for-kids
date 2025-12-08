/**
 * Game Controller - Main game orchestration
 * Coordinates Robot, Grid, Sequence, Audio, and Renderer
 */
import { Robot } from './Robot.js';
import { Grid } from './Grid.js';
import { Sequence } from './Sequence.js';
import { Audio } from './Audio.js';
import { Renderer } from './Renderer.js';
import { getLevel, getTotalLevels } from './Levels.js';

export class Game {
    constructor() {
        this.currentLevel = 1;
        this.isPlaying = false;

        this.initializeComponents();
        this.initializeElements();
        this.setupEventListeners();
        this.loadLevel(this.currentLevel);
    }

    initializeComponents() {
        const levelData = getLevel(1);
        this.robot = new Robot(levelData.start);
        this.grid = new Grid(levelData.gridSize, levelData.targets);
        this.sequence = new Sequence();
        this.audio = new Audio();
    }

    initializeElements() {
        this.elements = {
            gridContainer: document.getElementById('gridContainer'),
            sequenceArea: document.getElementById('sequenceArea'),
            sequencePlaceholder: document.getElementById('sequencePlaceholder'),
            savedFunctionsContainer: document.getElementById('savedFunctions'),
            playBtn: document.getElementById('playBtn'),
            resetBtn: document.getElementById('resetBtn'),
            clearBtn: document.getElementById('clearBtn'),
            saveBtn: document.getElementById('saveBtn'),
            helpBtn: document.getElementById('helpBtn'),
            closeHelpBtn: document.getElementById('closeHelpBtn'),
            nextBtn: document.getElementById('nextBtn'),
            successOverlay: document.getElementById('successOverlay'),
            helpOverlay: document.getElementById('helpOverlay'),
            levelNum: document.getElementById('levelNum')
        };

        this.renderer = new Renderer(this.elements);
    }

    loadLevel(levelNum) {
        const levelData = getLevel(levelNum);
        
        this.robot.setStartPosition(levelData.start);
        this.grid.configure(levelData.gridSize, levelData.targets);
        this.sequence.clear();
        
        this.renderer.updateLevel(levelNum);
        this.render();
    }

    render() {
        this.grid.render(this.elements.gridContainer, this.robot.position);
        this.renderer.renderSequence(this.sequence);
        this.renderer.renderSavedFunctions(
            this.sequence.savedFunctions,
            (index) => this.deleteFunction(index),
            (index) => this.addFunctionToSequence(index)
        );
    }

    // ===== Command Management =====
    
    addCommand(direction) {
        if (this.isPlaying) return;
        
        this.sequence.addCommand(direction);
        this.renderer.renderSequence(this.sequence);
        this.audio.play('click');
    }

    addFunctionToSequence(functionIndex) {
        if (this.isPlaying) return;
        
        this.sequence.addFunctionCall(functionIndex);
        this.renderer.renderSequence(this.sequence);
        this.audio.play('click');
    }

    removeCommand(index) {
        if (this.isPlaying) return;
        
        this.sequence.removeAt(index);
        this.renderer.renderSequence(this.sequence);
    }

    clearSequence() {
        if (this.isPlaying) return;
        
        this.sequence.clear();
        this.renderer.renderSequence(this.sequence);
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
        this.render();

        const flatSequence = this.sequence.flatten();

        for (let i = 0; i < flatSequence.length; i++) {
            const cmd = flatSequence[i];
            
            this.highlightCommand(i);
            
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

            // Touch support
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.addCommand(btn.dataset.command);
            });
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
