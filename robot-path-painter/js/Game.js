/**
 * Game Controller - Main game orchestration
 * Coordinates Robot, Grid, Sequence, Audio, and DragDrop
 */
import { Robot } from './Robot.js';
import { Grid } from './Grid.js';
import { Sequence } from './Sequence.js';
import { Audio } from './Audio.js';
import { DragDrop } from './DragDrop.js';
import { getLevel, getTotalLevels } from './Levels.js';

export class Game {
    constructor() {
        this.currentLevel = 1;
        this.isPlaying = false;
        this.initialObstacles = [];
        this.initializeComponents();
        this.initializeElements();
        this.setupFeedbackStyle();
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
        this.elements.levelNum.textContent = levelNum;
        this.render();
        // Wait for layout to complete before positioning robot
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.updateRobotOverlay(false);
            });
        });
    }

    render() {
        this.grid.render(this.elements.gridContainer, this.robot.position);
        this.renderSequence();
        this.renderSavedFunctions();
    }

    updateRobotOverlay(animate = true) {
        let robotOverlay = document.getElementById('robotOverlay');
        
        if (!robotOverlay) {
            robotOverlay = document.createElement('div');
            robotOverlay.id = 'robotOverlay';
            robotOverlay.className = 'robot-overlay idle';
            robotOverlay.textContent = '🤖';
            this.elements.gridContainer.appendChild(robotOverlay);
        }

        const pos = this.grid.getCellPosition(
            this.elements.gridContainer,
            this.robot.position.x,
            this.robot.position.y
        );
        
        if (pos) {
            if (!animate) {
                robotOverlay.style.transition = 'none';
            }
            robotOverlay.style.left = `${pos.left}px`;
            robotOverlay.style.top = `${pos.top}px`;
            robotOverlay.style.width = `${pos.width}px`;
            robotOverlay.style.height = `${pos.height}px`;
            robotOverlay.style.marginLeft = `-${pos.width / 2}px`;
            robotOverlay.style.marginTop = `-${pos.height / 2}px`;
            // Scale font size to 70% of cell size for proper fit
            robotOverlay.style.fontSize = `${pos.width * 0.7}px`;
            
            if (!animate) {
                robotOverlay.offsetHeight;
                robotOverlay.style.transition = '';
            }
        }
    }

    renderSequence() {
        const items = this.elements.sequenceArea.querySelectorAll('.sequence-item, .loop-block');
        items.forEach(item => item.remove());
        this.elements.sequencePlaceholder.style.display = this.sequence.isEmpty() ? 'block' : 'none';

        this.sequence.commands.forEach((cmd, index) => {
            if (cmd.type === 'loop') {
                const loopBlock = this.createLoopBlock(cmd, index, this.sequence.activeLoopIndex === index);
                this.elements.sequenceArea.appendChild(loopBlock);
            } else {
                const item = document.createElement('div');
                item.className = 'sequence-item';
                if (cmd.type === 'function') {
                    item.classList.add('function-call');
                    item.innerHTML = `📦${cmd.id}`;
                } else if (cmd.type === 'fire') {
                    item.classList.add('fire-command');
                    item.textContent = Sequence.getFireEmoji(cmd.direction);
                } else {
                    item.textContent = Sequence.getDirectionEmoji(cmd.direction);
                }
                item.dataset.index = index;
                this.elements.sequenceArea.appendChild(item);
            }
        });
        
        // Make items draggable for reordering (only direct children, not items inside loops)
        const sequenceItems = this.elements.sequenceArea.querySelectorAll(':scope > .sequence-item, :scope > .loop-block');
        this.dragDrop.makeItemsDraggable(sequenceItems);
    }

    createLoopBlock(cmd, index, isActive) {
        const loopBlock = document.createElement('div');
        loopBlock.className = 'loop-block' + (isActive ? ' active' : '');
        loopBlock.dataset.index = index;

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
                
                if (innerCmd.type === 'function') {
                    item.classList.add('function-call');
                    item.innerHTML = `📦${innerCmd.id}`;
                } else if (innerCmd.type === 'fire') {
                    item.classList.add('fire-command');
                    item.textContent = Sequence.getFireEmoji(innerCmd.direction);
                } else {
                    item.textContent = Sequence.getDirectionEmoji(innerCmd.direction);
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

        loopBlock.addEventListener('click', (e) => {
            if (e.target === loopBlock || e.target === header || e.target === body || 
                e.target === loopIcon || e.target.classList.contains('loop-placeholder')) {
                this.selectLoop(isActive ? null : index);
            }
        });

        return loopBlock;
    }

    renderSavedFunctions() {
        this.elements.savedFunctionsContainer.innerHTML = '';
        this.sequence.savedFunctions.forEach((func, index) => {
            const btn = document.createElement('button');
            btn.className = 'saved-function-btn';
            
            const preview = document.createElement('span');
            preview.className = 'function-preview';
            const previewCommands = func.commands.slice(0, 3).map(c => Sequence.getDirectionEmoji(c.direction)).join('');
            preview.innerHTML = `📦${index + 1}: ${previewCommands}${func.commands.length > 3 ? '...' : ''}`;
            btn.appendChild(preview);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-function';
            deleteBtn.textContent = '✖';
            deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); this.deleteFunction(index); });
            btn.appendChild(deleteBtn);

            btn.addEventListener('click', () => this.addFunctionToSequence(index));
            this.elements.savedFunctionsContainer.appendChild(btn);
        });
    }

    // ===== Command Management =====

    addCommand(direction) {
        if (this.isPlaying) return;
        this.sequence.addCommand(direction);
        this.renderSequence();
        this.audio.play('click');
    }

    addCommandAt(direction, index) {
        if (this.isPlaying) return;
        
        // When drag-dropping to a specific position, always insert at that position
        // (ignore active loop - user is explicitly choosing where to drop)
        const cmd = { type: 'move', direction };
        if (index !== undefined && index <= this.sequence.commands.length) {
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

    addFireCommandAt(direction, index) {
        if (this.isPlaying) return;
        
        // When drag-dropping to a specific position, always insert at that position
        // (ignore active loop - user is explicitly choosing where to drop)
        const cmd = { type: 'fire', direction };
        if (index !== undefined && index <= this.sequence.commands.length) {
            this.sequence.insertAt(cmd, index);
        } else {
            this.sequence.addFireCommand(direction);
        }
        this.renderSequence();
        this.audio.play('click');
    }

    reorderCommand(fromIndex, toIndex) {
        if (this.isPlaying) return;
        this.sequence.moveCommand(fromIndex, toIndex);
        this.renderSequence();
        this.audio.play('click');
    }

    addLoop() {
        if (this.isPlaying) return;
        this.sequence.addLoop(2);
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
        if (this.sequence.isEmpty()) { this.showFeedback('❌'); return; }
        if (this.sequence.saveAsFunction()) {
            this.renderSavedFunctions();
            this.audio.play('save');
            this.showFeedback('💾✅');
        } else {
            this.showFeedback('❌');
        }
    }

    deleteFunction(index) {
        this.sequence.deleteFunction(index);
        this.renderSavedFunctions();
    }

    // ===== Game Execution =====

    async play() {
        if (this.isPlaying || this.sequence.isEmpty()) return;
        this.isPlaying = true;
        this.elements.playBtn.disabled = true;

        this.robot.reset();
        this.grid.clearPaint();
        this.grid.resetObstacles(this.initialObstacles);
        this.render();
        this.updateRobotOverlay(false);

        const flatSequence = this.sequence.flatten();

        for (let i = 0; i < flatSequence.length; i++) {
            const cmd = flatSequence[i];
            this.highlightCommand(i);
            
            if (cmd.type === 'fire') {
                await this.executeFireCommand(cmd.direction);
                await this.delay(300);
                continue;
            }

            const nextPos = this.getNextPosition(cmd.direction);
            const nextKey = `${nextPos.x},${nextPos.y}`;
            
            if (this.grid.hasObstacle(nextKey)) {
                this.audio.play('error');
                this.showFeedback('💥🪨');
                await this.delay(500);
                this.resetLevel();
                return;
            }
            
            this.robot.move(cmd.direction);

            if (this.robot.isOutOfBounds(this.grid.size)) {
                this.updateRobotOverlay(true);
                await this.delay(250);
                this.audio.play('error');
                this.showFeedback('💥');
                await this.delay(500);
                this.resetLevel();
                return;
            }

            this.updateRobotOverlay(true);
            this.audio.play('move');
            await this.delay(250);

            this.grid.paintCell(this.robot.getPositionKey());
            this.grid.render(this.elements.gridContainer, this.robot.position);
            this.updateRobotOverlay(false);
            this.audio.play('paint');
            await this.delay(200);
        }

        if (this.grid.allTargetsPainted()) {
            await this.delay(300);
            this.showSuccess();
        } else {
            this.audio.play('incomplete');
            this.showFeedback('🤔');
        }

        this.isPlaying = false;
        this.elements.playBtn.disabled = false;
        this.clearHighlights();
    }

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
        
        await this.createProjectile(projectilePos.x, projectilePos.y, direction);
        
        while (true) {
            projectilePos.x += delta.x;
            projectilePos.y += delta.y;
            
            const posKey = `${projectilePos.x},${projectilePos.y}`;
            
            if (projectilePos.x < 0 || projectilePos.x >= this.grid.size ||
                projectilePos.y < 0 || projectilePos.y >= this.grid.size) {
                await this.moveProjectileTo(projectilePos.x - delta.x, projectilePos.y - delta.y);
                await this.showExplosion(projectilePos.x - delta.x, projectilePos.y - delta.y);
                break;
            }
            
            await this.moveProjectileTo(projectilePos.x, projectilePos.y);
            await this.delay(80);
            
            if (this.grid.hasObstacle(posKey)) {
                this.grid.removeObstacle(posKey);
                await this.showExplosion(projectilePos.x, projectilePos.y);
                this.audio.play('explosion');
                this.grid.render(this.elements.gridContainer, this.robot.position);
                this.updateRobotOverlay(false);
                break;
            }
        }
        
        this.clearProjectile();
    }

    async createProjectile(x, y, direction) {
        this.clearProjectile();
        
        const projectile = document.createElement('div');
        projectile.className = 'projectile';
        projectile.id = 'activeProjectile';
        
        const rotations = {
            'up': '-45deg',
            'right': '45deg',
            'down': '135deg',
            'left': '-135deg'
        };
        projectile.style.transform = `rotate(${rotations[direction]})`;
        projectile.textContent = '🚀';
        
        this.elements.gridContainer.appendChild(projectile);
        
        const pos = this.grid.getCellPosition(this.elements.gridContainer, x, y);
        if (pos) {
            projectile.style.transition = 'none';
            projectile.style.left = `${pos.left}px`;
            projectile.style.top = `${pos.top}px`;
            projectile.style.width = `${pos.width}px`;
            projectile.style.height = `${pos.height}px`;
            projectile.style.marginLeft = `-${pos.width / 2}px`;
            projectile.style.marginTop = `-${pos.height / 2}px`;
            // Scale font size to 50% of cell size
            projectile.style.fontSize = `${pos.width * 0.5}px`;
            projectile.offsetHeight;
            projectile.style.transition = '';
        }
    }

    async moveProjectileTo(x, y) {
        const projectile = document.getElementById('activeProjectile');
        if (!projectile) return;
        
        const pos = this.grid.getCellPosition(this.elements.gridContainer, x, y);
        if (pos) {
            projectile.style.left = `${pos.left}px`;
            projectile.style.top = `${pos.top}px`;
        }
    }

    clearProjectile() {
        const existing = document.getElementById('activeProjectile');
        if (existing) existing.remove();
    }

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
        this.clearHighlights();
        const items = this.elements.sequenceArea.querySelectorAll('.sequence-item, .loop-block');
        let count = 0;
        for (let i = 0; i < this.sequence.commands.length; i++) {
            const cmd = this.sequence.commands[i];
            if (cmd.type === 'function') {
                if (count + cmd.commands.length > flatIndex) { items[i]?.classList.add('executing'); return; }
                count += cmd.commands.length;
            } else if (cmd.type === 'loop') {
                const loopTotal = cmd.commands.length * cmd.iterations;
                if (count + loopTotal > flatIndex) { items[i]?.classList.add('executing'); return; }
                count += loopTotal;
            } else {
                if (count === flatIndex) { items[i]?.classList.add('executing'); return; }
                count++;
            }
        }
    }

    clearHighlights() {
        this.elements.sequenceArea.querySelectorAll('.sequence-item, .loop-block').forEach(item => item.classList.remove('executing'));
    }

    // ===== Game State =====

    resetLevel() {
        this.robot.reset();
        this.grid.clearPaint();
        this.grid.resetObstacles(this.initialObstacles);
        this.isPlaying = false;
        this.elements.playBtn.disabled = false;
        this.render();
        this.updateRobotOverlay(false);
        this.clearHighlights();
    }

    nextLevel() {
        if (this.currentLevel < getTotalLevels()) this.currentLevel++;
        this.loadLevel(this.currentLevel);
        this.elements.successOverlay.classList.remove('active');
    }

    showSuccess() {
        this.elements.successOverlay.classList.add('active');
        this.audio.playSuccessMelody();
    }

    showFeedback(emoji) {
        const feedback = document.createElement('div');
        feedback.className = 'floating-feedback';
        feedback.textContent = emoji;
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 800);
    }

    setupFeedbackStyle() {
        if (!document.getElementById('feedbackStyle')) {
            const style = document.createElement('style');
            style.id = 'feedbackStyle';
            style.textContent = `
                .floating-feedback {
                    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    font-size: 4rem; z-index: 1000; pointer-events: none;
                    animation: feedbackPop 0.8s ease forwards;
                }
                @keyframes feedbackPop {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                    100% { transform: translate(-50%, -100%) scale(1); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== Event Listeners =====

    setupEventListeners() {
        // Command buttons - click only (touch drag handled by DragDrop)
        document.querySelectorAll('.command-btn').forEach(btn => {
            btn.addEventListener('click', () => this.addCommand(btn.dataset.command));
            btn.addEventListener('dragstart', (e) => { 
                e.dataTransfer.setData('command', btn.dataset.command); 
                btn.classList.add('dragging'); 
            });
            btn.addEventListener('dragend', () => btn.classList.remove('dragging'));
        });

        // Fire buttons - click only (touch drag handled by DragDrop)
        document.querySelectorAll('.fire-btn').forEach(btn => {
            btn.addEventListener('click', () => this.addFireCommand(btn.dataset.fire));
        });

        // Sequence area - desktop drag and drop
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
            if (command) this.addCommand(command);
        });
        
        // Click to remove from sequence
        this.elements.sequenceArea.addEventListener('click', (e) => {
            const item = e.target.closest('.sequence-item:not(.loop-item)');
            const loopBlock = e.target.closest('.loop-block');
            if (item && item.dataset.index !== undefined && !loopBlock) {
                this.removeCommand(parseInt(item.dataset.index));
            }
        });

        // Control buttons
        this.elements.playBtn.addEventListener('click', () => this.play());
        this.elements.resetBtn.addEventListener('click', () => this.resetLevel());
        this.elements.clearBtn.addEventListener('click', () => this.clearSequence());
        this.elements.saveBtn.addEventListener('click', () => this.saveFunction());
        this.elements.loopBtn.addEventListener('click', () => this.addLoop());

        // Overlays
        this.elements.helpBtn.addEventListener('click', () => this.elements.helpOverlay.classList.add('active'));
        this.elements.closeHelpBtn.addEventListener('click', () => this.elements.helpOverlay.classList.remove('active'));
        this.elements.helpOverlay.addEventListener('click', (e) => { 
            if (e.target === this.elements.helpOverlay) this.elements.helpOverlay.classList.remove('active'); 
        });
        this.elements.nextBtn.addEventListener('click', () => this.nextLevel());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.isPlaying) return;
            switch (e.key) {
                case 'ArrowUp': this.addCommand('up'); break;
                case 'ArrowDown': this.addCommand('down'); break;
                case 'ArrowLeft': this.addCommand('left'); break;
                case 'ArrowRight': this.addCommand('right'); break;
                case 'Enter': case ' ': this.play(); break;
                case 'Escape': this.resetLevel(); break;
            }
        });

        // Handle window resize and orientation change
        const handleResize = () => {
            if (!this.isPlaying) {
                requestAnimationFrame(() => {
                    this.updateRobotOverlay(false);
                });
            }
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', () => {
            // Delay to allow layout to settle after orientation change
            setTimeout(handleResize, 100);
        });

        // Use ResizeObserver for grid container size changes
        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(() => {
                if (!this.isPlaying) {
                    this.updateRobotOverlay(false);
                }
            });
            resizeObserver.observe(this.elements.gridContainer);
        }
    }
}
