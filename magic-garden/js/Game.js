/**
 * Game - Main game controller for Magic Garden
 * 
 * Orchestrates the wizard, garden, and command sequence.
 */
import { Garden, GROWTH_STAGES } from './Garden.js';
import { Wizard } from './Wizard.js';
import { Sequence } from './Sequence.js';
import { DragDrop } from './DragDrop.js';
import { Audio } from './Audio.js';
import { getLevel, getTotalLevels } from './Levels.js';
import { ACTIONS } from './Plants.js';

// Animation timing constants (ms)
const TIMING = {
    ACTION_DELAY: 600,
    GROWTH_DELAY: 400,
    RESULT_DELAY: 800
};

export class Game {
    constructor() {
        this.garden = new Garden();
        this.wizard = null;
        this.sequence = new Sequence();
        this.audio = new Audio();
        this.dragDrop = null;
        
        this.currentLevel = 1;
        this.isRunning = false;
        this.levelConfig = null;
        this.currentSupply = {}; // Track remaining supply
        
        this.elements = {};
    }

    /**
     * Initialize the game
     */
    init() {
        this.cacheElements();
        this.audio.init();
        this.wizard = new Wizard(this.elements.wizard);
        this.wizard.init();
        this.setupDragDrop();
        this.setupEventListeners();
        this.loadLevel(this.currentLevel);
    }

    /**
     * Cache DOM element references
     */
    cacheElements() {
        this.elements = {
            wizard: document.getElementById('wizard'),
            pot: document.getElementById('pot'),
            plant: document.getElementById('plant'),
            targetDisplay: document.getElementById('targetDisplay'),
            targetFlower: document.getElementById('targetFlower'),
            sequenceArea: document.getElementById('sequenceArea'),
            sequencePlaceholder: document.getElementById('sequencePlaceholder'),
            trashZone: document.getElementById('trashZone'),
            clearBtn: document.getElementById('clearBtn'),
            loopBtn: document.getElementById('loopBtn'),
            playBtn: document.getElementById('playBtn'),
            resetBtn: document.getElementById('resetBtn'),
            levelNum: document.getElementById('levelNum'),
            successOverlay: document.getElementById('successOverlay'),
            nextBtn: document.getElementById('nextBtn'),
            helpBtn: document.getElementById('helpBtn'),
            helpOverlay: document.getElementById('helpOverlay'),
            closeHelpBtn: document.getElementById('closeHelpBtn'),
            commandPalette: document.getElementById('commandPalette')
        };
    }

    /**
     * Set up drag and drop
     */
    setupDragDrop() {
        this.dragDrop = new DragDrop({
            sequenceArea: this.elements.sequenceArea,
            trashZone: this.elements.trashZone,
            onAddCommand: (cmd, index) => this.addCommandAt(cmd, index),
            onReorder: (from, to) => this.reorderCommand(from, to),
            onRemove: (index) => this.removeCommandAt(index),
            onReorderInLoop: (loopIdx, from, to) => this.reorderInLoop(loopIdx, from, to),
            onMoveFromLoop: (loopIdx, cmdIdx, targetIdx) => this.moveFromLoopToMain(loopIdx, cmdIdx, targetIdx),
            onMoveToLoop: (fromIdx, loopIdx, cmdIdx) => this.moveFromMainToLoop(fromIdx, loopIdx, cmdIdx),
            onRemoveFromLoop: (loopIdx, cmdIdx) => this.removeFromLoop(loopIdx, cmdIdx),
            onAddToLoop: (cmd, loopIdx, cmdIdx) => this.addToLoop(cmd, loopIdx, cmdIdx)
        });
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Command buttons (tap to add)
        document.querySelectorAll('.command-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.isRunning) {
                    this.addCommand(btn.dataset.command);
                }
            });
        });

        // Loop button
        if (this.elements.loopBtn) {
            this.elements.loopBtn.addEventListener('click', () => this.addLoop());
        }

        // Control buttons
        this.elements.playBtn.addEventListener('click', () => this.run());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        this.elements.clearBtn.addEventListener('click', () => this.clearSequence());

        // Overlays
        this.elements.nextBtn.addEventListener('click', () => this.nextLevel());
        this.elements.helpBtn.addEventListener('click', () => this.showHelp());
        this.elements.closeHelpBtn.addEventListener('click', () => this.hideHelp());

        this.elements.helpOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.helpOverlay) {
                this.hideHelp();
            }
        });
    }

    /**
     * Load a level
     */
    loadLevel(levelNum) {
        this.levelConfig = getLevel(levelNum);
        this.currentLevel = levelNum;
        
        // Reset supply from level config
        this.currentSupply = { ...this.levelConfig.supply };
        
        // Update UI
        this.elements.levelNum.textContent = levelNum;
        this.elements.targetFlower.textContent = this.levelConfig.target;
        
        // Update available commands
        this.updateCommandPalette();
        
        // Reset state
        this.reset();
    }

    /**
     * Update command palette based on current supply
     */
    updateCommandPalette() {
        const buttons = document.querySelectorAll('.command-btn');
        buttons.forEach(btn => {
            const action = btn.dataset.command;
            const remaining = this.currentSupply[action] || 0;
            
            // Show button if level has this action in supply
            if (this.levelConfig.supply[action]) {
                btn.style.display = '';
                btn.disabled = remaining <= 0 || this.isRunning;
                
                // Update badge showing remaining count
                let badge = btn.querySelector('.supply-badge');
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'supply-badge';
                    btn.appendChild(badge);
                }
                badge.textContent = remaining;
                badge.style.display = remaining > 0 ? '' : 'none';
                
                // Visual feedback for empty supply
                btn.classList.toggle('empty', remaining <= 0);
            } else {
                btn.style.display = 'none';
                btn.disabled = true;
            }
        });
        
        // Hide loop button (supply system doesn't use loops)
        if (this.elements.loopBtn) {
            this.elements.loopBtn.style.display = 'none';
        }
    }

    /**
     * Check if action can be added (has remaining supply)
     */
    canAddAction(action) {
        return (this.currentSupply[action] || 0) > 0;
    }

    /**
     * Use one action from supply
     */
    useAction(action) {
        if (this.currentSupply[action] > 0) {
            this.currentSupply[action]--;
            this.updateCommandPalette();
            return true;
        }
        return false;
    }

    /**
     * Return one action to supply
     */
    returnAction(action) {
        if (this.levelConfig.supply[action]) {
            this.currentSupply[action] = (this.currentSupply[action] || 0) + 1;
            this.updateCommandPalette();
        }
    }

    /**
     * Add a command to the sequence
     */
    addCommand(action) {
        if (!this.canAddAction(action)) return;
        this.useAction(action);
        this.sequence.addCommand(action);
        this.renderSequence();
    }

    /**
     * Add command at specific index
     */
    addCommandAt(action, index) {
        if (!this.canAddAction(action)) return;
        this.useAction(action);
        this.sequence.addCommand(action, index);
        this.renderSequence();
    }

    /**
     * Reorder command
     */
    reorderCommand(fromIndex, toIndex) {
        this.sequence.moveCommand(fromIndex, toIndex);
        this.renderSequence();
    }

    /**
     * Remove command at index
     */
    removeCommandAt(index) {
        const cmd = this.sequence.getCommand(index);
        if (cmd && cmd.type !== 'loop') {
            this.returnAction(cmd.type);
        }
        this.sequence.removeCommand(index);
        this.renderSequence();
    }

    /**
     * Add a loop block
     */
    addLoop() {
        this.sequence.addLoop(2);
        this.renderSequence();
    }

    /**
     * Reorder within a loop
     */
    reorderInLoop(loopIndex, fromIndex, toIndex) {
        this.sequence.moveWithinLoop(loopIndex, fromIndex, toIndex);
        this.renderSequence();
    }

    /**
     * Move from loop to main
     */
    moveFromLoopToMain(loopIndex, cmdIndex, targetIndex) {
        this.sequence.moveFromLoopToMain(loopIndex, cmdIndex, targetIndex);
        this.renderSequence();
    }

    /**
     * Move from main to loop
     */
    moveFromMainToLoop(fromIndex, loopIndex, cmdIndex) {
        this.sequence.moveFromMainToLoop(fromIndex, loopIndex, cmdIndex);
        this.renderSequence();
    }

    /**
     * Remove from loop
     */
    removeFromLoop(loopIndex, cmdIndex) {
        this.sequence.removeFromLoop(loopIndex, cmdIndex);
        this.renderSequence();
    }

    /**
     * Add to loop
     */
    addToLoop(action, loopIndex, cmdIndex) {
        this.sequence.addToLoop(action, loopIndex, cmdIndex);
        this.renderSequence();
    }

    /**
     * Render the command sequence
     */
    renderSequence() {
        const commands = this.sequence.getCommands();
        
        // Show placeholder if empty
        this.elements.sequencePlaceholder.style.display = commands.length ? 'none' : 'flex';
        
        // Clear existing items (except placeholder)
        Array.from(this.elements.sequenceArea.children).forEach(child => {
            if (child !== this.elements.sequencePlaceholder) {
                child.remove();
            }
        });
        
        // Render each command
        commands.forEach((cmd, index) => {
            if (cmd.type === 'loop') {
                this.renderLoopBlock(cmd, index);
            } else {
                this.renderCommandItem(cmd.type, index);
            }
        });
        
        // Make items draggable
        const items = this.elements.sequenceArea.querySelectorAll('.sequence-item');
        this.dragDrop.makeItemsDraggable(items);
    }

    /**
     * Render a single command item
     */
    renderCommandItem(action, index) {
        const item = document.createElement('div');
        item.className = 'sequence-item';
        item.dataset.index = index;
        item.textContent = action;
        item.setAttribute('role', 'listitem');
        item.setAttribute('aria-label', this.getActionLabel(action));
        this.elements.sequenceArea.appendChild(item);
    }

    /**
     * Render a loop block
     */
    renderLoopBlock(loop, index) {
        const block = document.createElement('div');
        block.className = 'loop-block';
        block.dataset.index = index;
        
        // Header with icon and iteration controls
        const header = document.createElement('div');
        header.className = 'loop-header';
        
        const icon = document.createElement('span');
        icon.className = 'loop-icon';
        icon.textContent = '🔄';
        
        const counter = document.createElement('div');
        counter.className = 'loop-counter';
        
        const minusBtn = document.createElement('button');
        minusBtn.className = 'loop-counter-btn';
        minusBtn.textContent = '−';
        minusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.updateLoopIterations(index, loop.iterations - 1);
        });
        
        const count = document.createElement('span');
        count.className = 'loop-count';
        count.textContent = loop.iterations;
        
        const plusBtn = document.createElement('button');
        plusBtn.className = 'loop-counter-btn';
        plusBtn.textContent = '+';
        plusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.updateLoopIterations(index, loop.iterations + 1);
        });
        
        counter.appendChild(minusBtn);
        counter.appendChild(count);
        counter.appendChild(plusBtn);
        
        header.appendChild(icon);
        header.appendChild(counter);
        
        // Body for loop commands
        const body = document.createElement('div');
        body.className = 'loop-body';
        
        if (loop.commands.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'loop-placeholder';
            placeholder.textContent = '⬇️';
            body.appendChild(placeholder);
        } else {
            loop.commands.forEach((cmd, cmdIndex) => {
                const item = document.createElement('div');
                item.className = 'loop-item';
                item.dataset.cmdIndex = cmdIndex;
                item.textContent = cmd.type;
                body.appendChild(item);
            });
        }
        
        block.appendChild(header);
        block.appendChild(body);
        this.elements.sequenceArea.appendChild(block);
        
        // Make loop items draggable
        this.dragDrop.makeLoopItemsDraggable(body, index);
    }

    /**
     * Update loop iterations
     */
    updateLoopIterations(loopIndex, iterations) {
        this.sequence.updateLoopIterations(loopIndex, iterations);
        this.renderSequence();
    }

    /**
     * Get accessible label for action
     */
    getActionLabel(action) {
        const labels = {
            '🌱': 'Plant seed',
            '💧': 'Water',
            '☀️': 'Sunshine',
            '🎵': 'Music',
            '✨': 'Magic'
        };
        return labels[action] || action;
    }

    /**
     * Clear the sequence
     */
    clearSequence() {
        // Return all actions to supply
        const commands = this.sequence.getCommands();
        commands.forEach(cmd => {
            if (cmd.type !== 'loop') {
                this.returnAction(cmd.type);
            }
        });
        this.sequence.clear();
        this.renderSequence();
    }

    /**
     * Reset the level
     */
    reset() {
        this.isRunning = false;
        this.garden.reset();
        this.wizard.reset();
        
        // Reset supply to level config
        this.currentSupply = { ...this.levelConfig.supply };
        this.updateCommandPalette();
        
        this.renderGarden();
        this.enableControls(true);
    }

    /**
     * Render the garden state
     */
    renderGarden() {
        const stage = this.garden.getStage();
        const plant = this.elements.plant;
        
        // Remove all stage classes
        plant.classList.remove('seeded', 'sprouting', 'growing', 'blooming', 'wilted');
        
        switch (stage) {
            case GROWTH_STAGES.EMPTY:
                plant.textContent = '';
                break;
            case GROWTH_STAGES.SEEDED:
                plant.textContent = '🌱';
                plant.classList.add('seeded');
                break;
            case GROWTH_STAGES.SPROUTING:
                plant.textContent = '🌿';
                plant.classList.add('sprouting');
                break;
            case GROWTH_STAGES.GROWING:
                plant.textContent = '🌿';
                plant.classList.add('growing');
                break;
            case GROWTH_STAGES.BLOOMING:
                const result = this.garden.getResult();
                plant.textContent = result ? result.emoji : '🌸';
                plant.classList.add('blooming');
                break;
            case GROWTH_STAGES.WILTED:
                plant.textContent = '🥀';
                plant.classList.add('wilted');
                break;
        }
    }

    /**
     * Run the spell sequence
     */
    async run() {
        if (this.isRunning || this.sequence.isEmpty()) return;
        
        this.isRunning = true;
        this.enableControls(false);
        this.garden.reset();
        this.renderGarden();
        
        const actions = this.sequence.flatten();
        
        // Execute each action
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            
            // Highlight current command
            this.highlightCommand(i);
            
            // Wizard casts the action
            await this.wizard.castAction(action);
            this.audio.playAction(action);
            
            // Apply to garden
            this.garden.applyAction(action);
            this.renderGarden();
            
            // Play growth sound if plant changed
            if (this.garden.getStage() !== GROWTH_STAGES.EMPTY) {
                this.audio.playGrowth();
            }
            
            await this.delay(TIMING.ACTION_DELAY);
        }
        
        // Clear command highlighting
        this.highlightCommand(-1);
        
        // Finalize result
        await this.delay(TIMING.GROWTH_DELAY);
        const result = this.garden.finalize();
        this.renderGarden();
        
        await this.delay(TIMING.RESULT_DELAY);
        
        // Check for success
        if (this.garden.matchesTarget(this.levelConfig.target)) {
            await this.wizard.celebrate();
            this.audio.playSuccess();
            this.showSuccess();
        } else {
            await this.wizard.puzzled();
            this.audio.playError();
        }
        
        this.isRunning = false;
        this.enableControls(true);
    }

    /**
     * Highlight a command during execution
     */
    highlightCommand(index) {
        // Remove existing highlights
        document.querySelectorAll('.sequence-item.executing, .loop-item.executing').forEach(el => {
            el.classList.remove('executing');
        });
        
        if (index >= 0) {
            // Find the item at this index in flattened sequence
            const items = document.querySelectorAll('.sequence-item, .loop-item');
            let flatIndex = 0;
            
            items.forEach(item => {
                if (flatIndex === index) {
                    item.classList.add('executing');
                }
                flatIndex++;
            });
        }
    }

    /**
     * Enable/disable controls
     */
    enableControls(enabled) {
        document.querySelectorAll('.command-btn').forEach(btn => {
            btn.disabled = !enabled;
        });
        this.elements.playBtn.disabled = !enabled;
        this.elements.clearBtn.disabled = !enabled;
        if (this.elements.loopBtn) {
            this.elements.loopBtn.disabled = !enabled;
        }
    }

    /**
     * Show success overlay
     */
    showSuccess() {
        this.elements.successOverlay.classList.add('active');
    }

    /**
     * Next level
     */
    nextLevel() {
        this.elements.successOverlay.classList.remove('active');
        
        if (this.currentLevel < getTotalLevels()) {
            // Clear sequence first (before loading new level) to avoid
            // returning old commands to new level's supply
            this.sequence.clear();
            this.renderSequence();
            
            this.currentLevel++;
            this.loadLevel(this.currentLevel);
        }
    }

    /**
     * Show help overlay
     */
    showHelp() {
        this.elements.helpOverlay.classList.add('active');
    }

    /**
     * Hide help overlay
     */
    hideHelp() {
        this.elements.helpOverlay.classList.remove('active');
    }

    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
