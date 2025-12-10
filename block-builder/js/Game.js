/**
 * Game - Main game controller for Block Builder
 * 
 * Orchestrates the crane, supply stacks, build area, and command sequence.
 * Handles animations for the realistic crane hook mechanics.
 */
import { Crane } from './Crane.js';
import { Supply } from './Supply.js';
import { BuildArea } from './BuildArea.js';
import { Sequence } from './Sequence.js';
import { getLevel, getTotalLevels, parseTargets } from './Levels.js';
import { Audio } from './Audio.js';
import { DragDrop } from './DragDrop.js';

// Animation timing constants (ms)
const TIMING = {
    CRANE_MOVE: 300,
    HOOK_LOWER: 400,
    HOOK_RAISE: 350,
    BLOCK_GRAB: 100,
    BLOCK_RELEASE: 100,
    COMMAND_DELAY: 200
};

export class Game {
    constructor() {
        this.crane = null;
        this.supply = null;
        this.buildArea = null;
        this.sequence = new Sequence();
        this.audio = new Audio();
        this.dragDrop = null;
        
        this.currentLevel = 1;
        this.isRunning = false;
        this.levelConfig = null;
        
        // Calculated dimensions
        this.supplyColumns = 3;
        this.cellSize = 44;
        this.maxStackHeight = 4;
        
        // DOM elements cache
        this.elements = {};
    }

    /**
     * Initialize the game
     */
    init() {
        this.cacheElements();
        this.audio.init();
        this.setupDragDrop();
        this.setupEventListeners();
        this.setupResizeHandler();
        this.loadLevel(this.currentLevel);
    }

    /**
     * Cache DOM element references
     */
    cacheElements() {
        this.elements = {
            workspaceContainer: document.getElementById('craneWorkspaceContainer'),
            workspace: document.getElementById('craneWorkspace'),
            craneRail: document.getElementById('craneRail'),
            railMarkers: document.getElementById('railMarkers'),
            craneTrolley: document.getElementById('craneTrolley'),
            craneString: document.getElementById('craneString'),
            craneHook: document.getElementById('craneHook'),
            heldBlock: document.getElementById('heldBlock'),
            supplyArea: document.getElementById('supplyArea'),
            supplyStacks: document.getElementById('supplyStacks'),
            buildArea: document.getElementById('buildArea'),
            buildGrid: document.getElementById('buildGrid'),
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
            closeHelpBtn: document.getElementById('closeHelpBtn')
        };
    }

    /**
     * Set up drag and drop for commands
     */
    setupDragDrop() {
        this.dragDrop = new DragDrop({
            onDragStart: (el) => this.handleDragStart(el),
            onDrop: (el, zone) => this.handleDrop(el, zone),
            onDragEnd: () => this.handleDragEnd()
        });
        this.dragDrop.init('.command-btn, .sequence-item', '.sequence-area, .trash-zone');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Command buttons (tap to add)
        document.querySelectorAll('.command-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.isRunning) {
                    const command = btn.dataset.command;
                    this.addCommand(command);
                }
            });
        });

        // Loop button
        this.elements.loopBtn.addEventListener('click', () => this.addLoop());

        // Control buttons
        this.elements.playBtn.addEventListener('click', () => this.run());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        this.elements.clearBtn.addEventListener('click', () => this.clearSequence());

        // Overlays
        this.elements.nextBtn.addEventListener('click', () => this.nextLevel());
        this.elements.helpBtn.addEventListener('click', () => this.showHelp());
        this.elements.closeHelpBtn.addEventListener('click', () => this.hideHelp());

        // Close help on overlay click
        this.elements.helpOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.helpOverlay) {
                this.hideHelp();
            }
        });
    }

    /**
     * Set up resize handler for uniform workspace scaling
     */
    setupResizeHandler() {
        const updateScale = () => {
            const container = this.elements.workspaceContainer;
            if (!container) return;
            
            const containerRect = container.getBoundingClientRect();
            const workspaceWidth = 380; // Fixed design width
            const workspaceHeight = 280; // Fixed design height
            
            // Calculate scale to fit container while maintaining aspect ratio
            const scaleX = containerRect.width / workspaceWidth;
            const scaleY = containerRect.height / workspaceHeight;
            const scale = Math.min(scaleX, scaleY, 1.5); // Cap at 1.5x
            
            this.elements.workspace.style.setProperty('--workspace-scale', scale);
            
            // Recalculate crane positions after scale change (only if game is loaded)
            if (this.crane) {
                requestAnimationFrame(() => {
                    this.columnPositions = this.calculateColumnPositions();
                    this.renderCrane();
                });
            }
        };
        
        // Store reference so we can call it later
        this.updateWorkspaceScale = updateScale;
        
        // Update on resize
        window.addEventListener('resize', updateScale);
    }

    /**
     * Load a level
     * @param {number} levelNum - Level number (1-indexed)
     */
    loadLevel(levelNum) {
        this.levelConfig = getLevel(levelNum);
        this.currentLevel = levelNum;
        
        const { supply, buildArea, target, craneStart } = this.levelConfig;
        const totalColumns = this.supplyColumns + buildArea.width;
        
        // Initialize game components
        this.supply = new Supply(supply);
        this.crane = new Crane(totalColumns, this.supplyColumns, craneStart);
        this.buildArea = new BuildArea(buildArea.width, buildArea.height);
        this.buildArea.setTargets(parseTargets(target));
        
        // Calculate max stack height for layout
        this.maxStackHeight = Math.max(
            this.supply.getMaxHeight(),
            buildArea.height,
            4
        );
        
        this.sequence.clear();
        this.render();
        this.updateLevelDisplay();
        
        // Update workspace scale after render
        if (this.updateWorkspaceScale) {
            this.updateWorkspaceScale();
        }
    }

    /**
     * Render all game components
     */
    render() {
        this.renderSupply();
        this.renderBuildArea();
        this.renderRailMarkers(); // After supply/build so we can measure the gap
        this.renderCrane();
        this.renderSequence();
    }

    /**
     * Render rail position markers
     */
    renderRailMarkers() {
        const container = this.elements.railMarkers;
        container.innerHTML = '';
        
        const scale = this.getWorkspaceScale();
        
        // Get actual positions of supply columns and build cells
        const supplyColumns = this.elements.supplyStacks?.querySelectorAll('.supply-column');
        const buildCells = this.elements.buildGrid?.querySelectorAll('.grid-cell[data-y="0"]');
        const railRect = this.elements.craneRail.getBoundingClientRect();
        
        // Render supply markers at actual supply column positions
        if (supplyColumns) {
            supplyColumns.forEach((col, index) => {
                const colRect = col.getBoundingClientRect();
                // Divide by scale to get unscaled coordinates
                const centerX = (colRect.left + colRect.width / 2 - railRect.left) / scale;
                
                const marker = document.createElement('div');
                marker.className = 'rail-marker supply';
                marker.style.position = 'absolute';
                marker.style.left = `${centerX}px`;
                marker.style.transform = 'translateX(-50%)';
                marker.dataset.col = index;
                
                const line = document.createElement('div');
                line.className = 'rail-marker-line';
                marker.appendChild(line);
                
                container.appendChild(marker);
            });
        }
        
        // Render build markers at actual build cell positions
        if (buildCells) {
            // Get unique x positions (first row cells)
            const buildColumns = Array.from(buildCells).filter(cell => cell.dataset.y === '0');
            buildColumns.forEach((cell, index) => {
                const cellRect = cell.getBoundingClientRect();
                // Divide by scale to get unscaled coordinates
                const centerX = (cellRect.left + cellRect.width / 2 - railRect.left) / scale;
                
                const marker = document.createElement('div');
                marker.className = 'rail-marker build';
                marker.style.position = 'absolute';
                marker.style.left = `${centerX}px`;
                marker.style.transform = 'translateX(-50%)';
                marker.dataset.col = this.supplyColumns + index;
                
                const line = document.createElement('div');
                line.className = 'rail-marker-line';
                marker.appendChild(line);
                
                container.appendChild(marker);
            });
        }
        
        // Store positions for crane movement
        this.columnPositions = this.calculateColumnPositions();
    }

    /**
     * Get the current scale factor applied to the workspace
     * @returns {number} The current scale factor
     */
    getWorkspaceScale() {
        const scaleStr = getComputedStyle(this.elements.workspace)
            .getPropertyValue('--workspace-scale');
        return parseFloat(scaleStr) || 1;
    }

    /**
     * Calculate actual X positions for each column (in unscaled coordinates)
     */
    calculateColumnPositions() {
        const positions = [];
        const scale = this.getWorkspaceScale();
        const railRect = this.elements.craneRail.getBoundingClientRect();
        
        // Supply column positions
        const supplyColumns = this.elements.supplyStacks?.querySelectorAll('.supply-column');
        if (supplyColumns) {
            supplyColumns.forEach(col => {
                const colRect = col.getBoundingClientRect();
                // Divide by scale to get unscaled coordinates
                const centerX = (colRect.left + colRect.width / 2 - railRect.left) / scale;
                positions.push(centerX);
            });
        }
        
        // Build column positions  
        const buildCells = this.elements.buildGrid?.querySelectorAll('.grid-cell[data-y="0"]');
        if (buildCells) {
            buildCells.forEach(cell => {
                const cellRect = cell.getBoundingClientRect();
                // Divide by scale to get unscaled coordinates
                const centerX = (cellRect.left + cellRect.width / 2 - railRect.left) / scale;
                positions.push(centerX);
            });
        }
        
        return positions;
    }

    /**
     * Render supply stacks
     */
    renderSupply() {
        const container = this.elements.supplyStacks;
        container.innerHTML = '';
        
        for (let col = 0; col < this.supplyColumns; col++) {
            const column = document.createElement('div');
            column.className = 'supply-column';
            column.dataset.col = col;
            
            const blocks = this.supply.getColumn(col);
            if (blocks.length === 0) {
                column.classList.add('empty');
            } else {
                blocks.forEach((blockType, index) => {
                    const block = document.createElement('div');
                    block.className = 'supply-block';
                    block.dataset.index = index;
                    block.textContent = blockType;
                    
                    // Mark top block
                    if (index === blocks.length - 1) {
                        block.classList.add('top-block');
                    }
                    
                    column.appendChild(block);
                });
            }
            
            container.appendChild(column);
        }
    }

    /**
     * Render build area grid
     */
    renderBuildArea() {
        const container = this.elements.buildGrid;
        container.innerHTML = '';
        
        const { width, height } = this.buildArea;
        container.style.gridTemplateColumns = `repeat(${width}, var(--cell-size))`;
        container.style.gridTemplateRows = `repeat(${height}, var(--cell-size))`;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Check if this is a target position
                if (this.buildArea.isTarget(x, y)) {
                    cell.classList.add('target');
                    const targetType = this.buildArea.getTargetType(x, y);
                    cell.dataset.target = targetType;
                    
                    // Check if correctly filled
                    if (this.buildArea.isTargetMatched(x, y)) {
                        cell.classList.add('matched');
                    }
                }
                
                // Check if has block
                const block = this.buildArea.getBlock(x, y);
                if (block) {
                    cell.classList.add('has-block');
                    const blockEl = document.createElement('div');
                    blockEl.className = 'cell-block';
                    blockEl.textContent = block.type;
                    cell.appendChild(blockEl);
                }
                
                // Ground row
                if (y === height - 1 && !block) {
                    cell.classList.add('ground');
                }
                
                container.appendChild(cell);
            }
        }
    }

    /**
     * Render crane position and hook state
     */
    renderCrane() {
        // Position crane trolley using pre-calculated column positions
        let craneX;
        if (this.columnPositions && this.columnPositions[this.crane.column] !== undefined) {
            craneX = this.columnPositions[this.crane.column];
        } else {
            // Fallback to basic calculation
            const columnWidth = this.cellSize + 6;
            craneX = this.crane.column * columnWidth + columnWidth / 2;
        }
        
        this.elements.craneTrolley.style.left = `${craneX}px`;
        
        // Update hook state classes
        const trolley = this.elements.craneTrolley;
        trolley.classList.remove('lowering', 'lowered', 'raising', 'holding', 'grabbing', 'releasing');
        
        if (this.crane.isHolding()) {
            trolley.classList.add('holding');
            this.elements.heldBlock.textContent = this.crane.heldBlock;
        } else {
            this.elements.heldBlock.textContent = '';
        }
        
        // String length based on hook depth
        const baseStringHeight = 10;
        const stringHeight = baseStringHeight + this.crane.hookDepth * this.cellSize;
        this.elements.craneString.style.height = `${stringHeight}px`;
    }

    /**
     * Render command sequence
     */
    renderSequence() {
        const commands = this.sequence.getCommands();
        
        this.elements.sequencePlaceholder.style.display = 
            commands.length === 0 ? 'flex' : 'none';
        
        // Clear existing items (sequence items and loop blocks)
        this.elements.sequenceArea.querySelectorAll('.sequence-item, .loop-block').forEach(el => el.remove());
        
        commands.forEach((cmd, index) => {
            if (cmd.type === 'loop') {
                const loopBlock = this.createLoopBlock(cmd, index, this.sequence.activeLoopIndex === index);
                this.elements.sequenceArea.appendChild(loopBlock);
            } else {
                const item = this.createSequenceItem(cmd, index);
                this.elements.sequenceArea.appendChild(item);
            }
        });
    }

    /**
     * Create a sequence item element
     * @param {Object} cmd - Command object
     * @param {number} index - Command index
     * @returns {HTMLElement} Sequence item element
     */
    createSequenceItem(cmd, index) {
        const item = document.createElement('div');
        item.className = 'sequence-item';
        item.dataset.index = index;
        
        // Add click to remove functionality
        item.addEventListener('click', () => {
            if (!this.isRunning) {
                this.removeCommandAt(index);
            }
        });
        
        // Create icon based on command type
        if (cmd.type === 'lower' || cmd.type === 'raise') {
            // Hook commands have stacked icons
            const hookIcon = document.createElement('span');
            hookIcon.className = 'seq-hook-icon';
            hookIcon.textContent = '🪝';
            
            const arrowIcon = document.createElement('span');
            arrowIcon.className = 'seq-arrow-icon';
            arrowIcon.textContent = cmd.type === 'lower' ? '⬇️' : '⬆️';
            
            item.appendChild(hookIcon);
            item.appendChild(arrowIcon);
        } else {
            item.textContent = Sequence.getIcon(cmd.type);
        }
        
        return item;
    }

    /**
     * Create a loop block element
     * @param {Object} cmd - Loop command object
     * @param {number} index - Command index
     * @param {boolean} isActive - Whether this loop is active for adding commands
     * @returns {HTMLElement} Loop block element
     */
    createLoopBlock(cmd, index, isActive) {
        const loopBlock = document.createElement('div');
        loopBlock.className = 'loop-block' + (isActive ? ' active' : '');
        loopBlock.dataset.index = index;

        // Header with loop icon and iteration controls
        const header = document.createElement('div');
        header.className = 'loop-header';
        
        const loopIcon = document.createElement('span');
        loopIcon.className = 'loop-icon';
        loopIcon.textContent = '🔄';
        header.appendChild(loopIcon);

        const iterControls = document.createElement('div');
        iterControls.className = 'loop-iteration-controls';

        const minusBtn = document.createElement('button');
        minusBtn.className = 'iter-btn minus-btn';
        minusBtn.textContent = '➖';
        minusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.updateLoopIterations(index, cmd.iterations - 1);
        });

        const iterCount = document.createElement('span');
        iterCount.className = 'iter-count';
        iterCount.textContent = cmd.iterations;

        const plusBtn = document.createElement('button');
        plusBtn.className = 'iter-btn plus-btn';
        plusBtn.textContent = '➕';
        plusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.updateLoopIterations(index, cmd.iterations + 1);
        });

        iterControls.appendChild(minusBtn);
        iterControls.appendChild(iterCount);
        iterControls.appendChild(plusBtn);
        header.appendChild(iterControls);

        loopBlock.appendChild(header);

        // Body with loop commands
        const body = document.createElement('div');
        body.className = 'loop-body';

        if (cmd.commands.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'loop-placeholder';
            placeholder.textContent = '👆';
            body.appendChild(placeholder);
        } else {
            cmd.commands.forEach((innerCmd, cmdIndex) => {
                const item = document.createElement('div');
                item.className = 'sequence-item loop-item';
                
                if (innerCmd.type === 'lower' || innerCmd.type === 'raise') {
                    const hookIcon = document.createElement('span');
                    hookIcon.className = 'seq-hook-icon';
                    hookIcon.textContent = '🪝';
                    const arrowIcon = document.createElement('span');
                    arrowIcon.className = 'seq-arrow-icon';
                    arrowIcon.textContent = innerCmd.type === 'lower' ? '⬇️' : '⬆️';
                    item.appendChild(hookIcon);
                    item.appendChild(arrowIcon);
                } else {
                    item.textContent = Sequence.getIcon(innerCmd.type);
                }
                
                item.dataset.loopIndex = index;
                item.dataset.cmdIndex = cmdIndex;
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeFromLoop(index, cmdIndex);
                });
                body.appendChild(item);
            });
        }

        loopBlock.appendChild(body);

        // Click to select/deselect loop
        loopBlock.addEventListener('click', (e) => {
            if (e.target === loopBlock || e.target === header || e.target === body || 
                e.target === loopIcon || e.target.classList.contains('loop-placeholder')) {
                this.selectLoop(isActive ? null : index);
            }
        });

        return loopBlock;
    }

    /**
     * Add a loop to the sequence
     */
    addLoop() {
        if (this.isRunning) return;
        this.sequence.addLoop(2);
        this.sequence.setActiveLoop(this.sequence.commands.length - 1);
        this.renderSequence();
        this.audio.playTone(440, 0.05);
    }

    /**
     * Select or deselect a loop for adding commands
     * @param {number|null} index - Loop index or null to deselect
     */
    selectLoop(index) {
        if (this.isRunning) return;
        this.sequence.setActiveLoop(index);
        this.renderSequence();
    }

    /**
     * Update loop iterations
     * @param {number} index - Loop index
     * @param {number} iterations - New iteration count
     */
    updateLoopIterations(index, iterations) {
        if (this.isRunning) return;
        this.sequence.updateLoopIterations(index, iterations);
        this.renderSequence();
    }

    /**
     * Remove a command from inside a loop
     * @param {number} loopIndex - Loop index
     * @param {number} cmdIndex - Command index within loop
     */
    removeFromLoop(loopIndex, cmdIndex) {
        if (this.isRunning) return;
        this.sequence.removeFromLoop(loopIndex, cmdIndex);
        this.renderSequence();
        this.audio.playTone(330, 0.05);
    }

    /**
     * Add a command to the sequence
     * @param {string} type - Command type
     */
    addCommand(type) {
        if (this.sequence.addCommand(type)) {
            this.renderSequence();
            this.audio.playTone(440, 0.05);
        }
    }

    /**
     * Remove a command at index
     * @param {number} index - Command index to remove
     */
    removeCommandAt(index) {
        this.sequence.removeAt(index);
        this.renderSequence();
        this.audio.playTone(330, 0.05); // Lower tone for removal
    }

    /**
     * Clear the command sequence
     */
    clearSequence() {
        this.sequence.clear();
        this.renderSequence();
    }

    handleDragStart(element) {
        // Visual feedback handled by CSS
    }

    handleDrop(element, dropZone) {
        if (dropZone.classList.contains('trash-zone')) {
            const index = parseInt(element.dataset.index, 10);
            if (!isNaN(index)) {
                this.sequence.removeAt(index);
                this.renderSequence();
            }
        } else if (dropZone.classList.contains('sequence-area')) {
            const command = element.dataset.command;
            if (command) {
                this.addCommand(command);
            }
        }
    }

    handleDragEnd() {
        // Cleanup handled by DragDrop class
    }

    /**
     * Run the command sequence
     */
    async run() {
        if (this.isRunning || this.sequence.isEmpty()) return;
        
        this.isRunning = true;
        this.elements.playBtn.disabled = true;
        
        // Reset game state but keep sequence
        this.supply.reset();
        this.buildArea.reset();
        this.crane.reset();
        this.render();
        
        await this.delay(TIMING.COMMAND_DELAY);

        // Execute flattened commands (loops expanded)
        const flatCommands = this.sequence.flatten();
        for (let i = 0; i < flatCommands.length; i++) {
            this.highlightFlatCommand(flatCommands, i);
            await this.executeCommand(flatCommands[i]);
            await this.delay(TIMING.COMMAND_DELAY);
        }
        
        this.clearHighlight();
        
        // Check win condition
        if (this.buildArea.allTargetsMatched()) {
            this.showSuccess();
        }
        
        this.isRunning = false;
        this.elements.playBtn.disabled = false;
    }

    /**
     * Execute a single command with animations
     * @param {Object} cmd - Command object
     */
    async executeCommand(cmd) {
        switch (cmd.type) {
            case 'left':
                await this.executeMoveLeft();
                break;
            case 'right':
                await this.executeMoveRight();
                break;
            case 'lower':
                await this.executeLowerHook();
                break;
            case 'raise':
                await this.executeRaiseHook();
                break;
        }
    }

    /**
     * Execute move left command
     */
    async executeMoveLeft() {
        if (this.crane.moveLeft()) {
            this.audio.playMove();
            this.renderCrane();
            await this.delay(TIMING.CRANE_MOVE);
        } else {
            this.showError();
        }
    }

    /**
     * Execute move right command
     */
    async executeMoveRight() {
        if (this.crane.moveRight()) {
            this.audio.playMove();
            this.renderCrane();
            await this.delay(TIMING.CRANE_MOVE);
        } else {
            this.showError();
        }
    }

    /**
     * Execute lower hook command
     * - If over supply and not holding: grab top block
     * - If over build area and holding: place block
     */
    async executeLowerHook() {
        if (!this.crane.startLower()) {
            this.showError();
            return;
        }

        const trolley = this.elements.craneTrolley;
        trolley.classList.add('lowering');

        if (this.crane.isOverSupply() && !this.crane.isHolding()) {
            // Lower to grab from supply
            await this.animateLowerToSupply();
        } else if (this.crane.isOverBuildArea() && this.crane.isHolding()) {
            // Lower to place block
            await this.animateLowerToBuild();
        } else {
            // Lower to empty (no-op but animate)
            await this.animateLowerEmpty();
        }

        trolley.classList.remove('lowering');
        trolley.classList.add('lowered');
    }

    /**
     * Execute raise hook command
     */
    async executeRaiseHook() {
        if (!this.crane.startRaise()) {
            this.showError();
            return;
        }

        const trolley = this.elements.craneTrolley;
        trolley.classList.add('raising');

        await this.animateRaiseHook();

        trolley.classList.remove('raising');
        this.crane.completeRaise();
        this.renderCrane();
    }

    /**
     * Animate hook lowering to grab from supply
     */
    async animateLowerToSupply() {
        const supplyCol = this.crane.getSupplyColumn();
        const stackHeight = this.supply.getColumnHeight(supplyCol);
        
        if (stackHeight === 0) {
            // Nothing to grab, lower to bottom
            await this.animateLowerEmpty();
            return;
        }

        // Calculate depth to top of stack (+1 to reach the block visually)
        const depth = this.maxStackHeight - stackHeight + 1;
        
        // Animate string extending
        await this.animateStringExtend(depth);
        this.crane.completeLower(depth);
        
        // Grab the block
        const blockType = this.supply.takeTop(supplyCol);
        if (blockType) {
            this.crane.grabBlock(blockType);
            this.audio.playGrab();
            
            const trolley = this.elements.craneTrolley;
            trolley.classList.add('grabbing');
            this.elements.heldBlock.textContent = blockType;
            trolley.classList.add('holding');
            
            await this.delay(TIMING.BLOCK_GRAB);
            trolley.classList.remove('grabbing');
            
            this.renderSupply();
        }
    }

    /**
     * Animate hook lowering to place block in build area
     */
    async animateLowerToBuild() {
        const buildCol = this.crane.getBuildColumn();
        const columnHeight = this.buildArea.getColumnHeight(buildCol);
        
        // Calculate depth to place position (+1 to reach the ground/stack visually)
        const depth = this.buildArea.height - columnHeight;
        
        if (depth < 0) {
            // Column is full
            this.showError();
            return;
        }

        // Animate string extending
        await this.animateStringExtend(depth);
        this.crane.completeLower(depth);
        
        // Release the block
        const blockType = this.crane.releaseBlock();
        if (blockType) {
            const result = this.buildArea.placeBlock(buildCol, blockType);
            if (result.success) {
                this.audio.playDrop();
                
                const trolley = this.elements.craneTrolley;
                trolley.classList.add('releasing');
                trolley.classList.remove('holding');
                this.elements.heldBlock.textContent = '';
                
                await this.delay(TIMING.BLOCK_RELEASE);
                trolley.classList.remove('releasing');
                
                this.renderBuildArea();
            }
        }
    }

    /**
     * Animate hook lowering to empty space
     */
    async animateLowerEmpty() {
        const depth = this.maxStackHeight + 1; // +1 to reach ground level
        await this.animateStringExtend(depth);
        this.crane.completeLower(depth);
    }

    /**
     * Animate string extending to a depth
     * @param {number} depth - Number of rows to extend
     */
    async animateStringExtend(depth) {
        const baseHeight = 10;
        const targetHeight = baseHeight + depth * this.cellSize;
        
        this.elements.craneString.style.height = `${targetHeight}px`;
        await this.delay(TIMING.HOOK_LOWER);
    }

    /**
     * Animate hook raising back to top
     */
    async animateRaiseHook() {
        this.elements.craneString.style.height = '10px';
        await this.delay(TIMING.HOOK_RAISE);
    }

    /**
     * Show error feedback
     */
    showError() {
        this.audio.playError();
        this.elements.craneTrolley.classList.add('shake');
        setTimeout(() => {
            this.elements.craneTrolley.classList.remove('shake');
        }, 400);
    }

    /**
     * Highlight currently executing command (for flat commands)
     * This tracks which command in the flattened sequence is executing
     * @param {Array} flatCommands - Flattened command array
     * @param {number} flatIndex - Current index in flattened array
     */
    highlightFlatCommand(flatCommands, flatIndex) {
        // Clear all highlights
        const items = this.elements.sequenceArea.querySelectorAll('.sequence-item, .loop-block');
        items.forEach(item => item.classList.remove('executing'));
        
        // Find which original command this maps to
        let count = 0;
        const commands = this.sequence.getCommands();
        
        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];
            if (cmd.type === 'loop') {
                const loopSize = cmd.commands.length * cmd.iterations;
                if (flatIndex < count + loopSize) {
                    // Highlight the loop block
                    const loopBlock = this.elements.sequenceArea.querySelector(`.loop-block[data-index="${i}"]`);
                    if (loopBlock) {
                        loopBlock.classList.add('executing');
                        // Also highlight the specific command inside the loop
                        const innerIndex = (flatIndex - count) % cmd.commands.length;
                        const loopItems = loopBlock.querySelectorAll('.loop-item');
                        if (loopItems[innerIndex]) {
                            loopItems[innerIndex].classList.add('executing');
                        }
                    }
                    return;
                }
                count += loopSize;
            } else {
                if (flatIndex === count) {
                    const item = this.elements.sequenceArea.querySelector(`.sequence-item[data-index="${i}"]`);
                    if (item) item.classList.add('executing');
                    return;
                }
                count++;
            }
        }
    }

    /**
     * Clear command highlight
     */
    clearHighlight() {
        const items = this.elements.sequenceArea.querySelectorAll('.sequence-item, .loop-block');
        items.forEach(item => item.classList.remove('executing'));
    }

    /**
     * Reset current level
     */
    reset() {
        this.loadLevel(this.currentLevel);
    }

    /**
     * Show success overlay
     */
    showSuccess() {
        this.audio.playSuccess();
        this.elements.successOverlay.classList.add('visible');
    }

    /**
     * Hide success overlay
     */
    hideSuccess() {
        this.elements.successOverlay.classList.remove('visible');
    }

    /**
     * Advance to next level
     */
    nextLevel() {
        this.hideSuccess();
        const next = Math.min(this.currentLevel + 1, getTotalLevels());
        this.loadLevel(next);
    }

    /**
     * Update level display
     */
    updateLevelDisplay() {
        this.elements.levelNum.textContent = this.currentLevel;
    }

    /**
     * Show help overlay
     */
    showHelp() {
        this.elements.helpOverlay.classList.add('visible');
    }

    /**
     * Hide help overlay
     */
    hideHelp() {
        this.elements.helpOverlay.classList.remove('visible');
    }

    /**
     * Promise-based delay
     * @param {number} ms - Milliseconds to wait
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
